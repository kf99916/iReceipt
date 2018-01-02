import xml2js from 'xml2js';
import TaxType from './tax-type';
import ReceiptInfo from './receipt-info';
import Item from './item';
import Amount from './amount';
import utils from './common/utils';

const defaultInvoiceAttr = {
    xmlns: 'urn:GEINV:eInvoiceMessage:C0401:3.1',
    'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
    'xsi:schemaLocation': 'urn:GEINV:eInvoiceMessage:C0401:3.1 C0401.xsd'
};

class Receipt {
    constructor(info, items) {
        if (!(info instanceof ReceiptInfo)) {
            throw new TypeError('Info is not ReceiptInfo class!');
        }
        const invalidItems = items.filter(item => {
            return !(item instanceof Item);
        });
        if (invalidItems.length > 0) {
            throw new TypeError('Some items are not Item class!');
        }

        this.info = info;
        this.items = items;
        this.amount = new Amount(
            this.taxItems,
            this.freeTaxItems,
            this.zeroTaxItems
        );
    }

    // The format of the list of winners:
    // 53925591  10510LC60123189...
    // 53925591  10510LC60122037...
    // The range of receipt number is the 15th position and 10 characters
    static parseWinnersList(winnersList) {
        return winnersList.split(/\n|\r\n?/).map(winner => {
            return winner.substr(15, 10);
        });
    }

    // https://asana-user-private-us-east-1.s3.amazonaws.com/assets/1470352313817/469050158764958/0d7d7e6067a5c9d773b7578f68c1e6b6?AWSAccessKeyId=ASIAJYTZ4QJBKU575X7A&Expires=1512619611&Signature=S88aqo8KUTsZIarz6IU0N1Q9x3g%3D&x-amz-security-token=FQoDYXdzEIX%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaDH6gsGTBYtjGkHdQOiK3A9VasWE04WPY29Z46M12cLuySvyX3MqoiAwQe4T4sSxH%2BCDfLhKhTz2N7MEgkCINQ1JHV5ib0TQ3tWfNpffOnKQquhS9vBnYceVgU%2FoMEU8ASPvWyRC%2FBbPzDiNdxbgGB1TqroJuWKb6iZT%2FmfX3TDwAls5%2BKmPA5PtJYr9A6KjV18PdIDiz6X%2FIET2yn%2FZMyjbzEqvLN3HCJWfgQLCBWxT6C3yk%2FBXWynBVQhwgZPhUtzL57hfaW77mkK3iMdFIqFciLmp3suOh8F2D4KCLu2lXJ69W2W57wZtWHr2qzkC9pFG3tMXBzL3tvys%2FN1LIKH7R8RHvB6ugeYfqnyMBLIbWKhpJYUiaXcTennivjYVkUAIGXPsIBYssu8tF0%2BKs0baWnwxwLLfY19HpFG%2FfA8IdH6WUZLTkqfT8DJ%2B29I6Pl0J3NE1Mm7cB6G2Dk%2BJ5%2Bdh7rIlYhGlXNTHjSxJjt%2FmrCXLPnQgfxazk%2Fxp6LFUchdgVANLVLuI1CYy4V%2BKDWXEHXoVGExsr2Oby61ws6nyhk9S9GLE6uxu5wE%2F3xVcQEqUBZ5ad6sJwnDdwXOMFA2Yja1Hao2co6eei0QU%3D#_=_
    toXML() {
        let receiptObject = {
            $: defaultInvoiceAttr,
            Main: this.info.toXMLObject(),
            Details: this.items.map(item => {
                return item.toXMLObject();
            }),
            Amounts: this.amount.toXMLObject()
        };

        const builder = new xml2js.Builder({
            rootName: 'Invoice'
        });
        return builder.buildObject(receiptObject);
    }

    isWinning(winningNumbers) {
        return winningNumbers.indexOf(this.info.number) !== -1;
    }

    generateBarCodeString() {
        return (
            this.chineseYear +
            utils.padZero(this.winningMonths[1], 2) +
            this.info.number +
            this.info.randomNumber
        );
    }

    get taxItems() {
        return this.items.filter(item => {
            return item.taxType === TaxType.TAX;
        });
    }

    get freeTaxItems() {
        return this.items.filter(item => {
            return item.taxType === TaxType.FREE_TAX;
        });
    }

    get zeroTaxItems() {
        return this.items.filter(item => {
            return item.taxType === TaxType.ZERO_TAX;
        });
    }

    get chineseYear() {
        return this.info.date.getFullYear() - 1911;
    }

    get winningMonths() {
        let month = this.info.date.getMonth() + 1;
        return month % 2 === 0 ? [month - 1, month] : [month, month + 1];
    }
}

export default {
    Receipt: Receipt,
    ReceiptInfo: ReceiptInfo,
    Item: Item,
    Amount: Amount,
    TaxType: TaxType
};
