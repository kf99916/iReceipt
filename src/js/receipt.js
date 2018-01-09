import xml2js from 'xml2js';
import TaxType from './tax-type';
import ReceiptInfo from './receipt-info';
import Item from './item';
import Amount from './amount';
import utils from './common/utils';
import EncodeType from './encode-type';
import aes from './aes';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';

const defaultInvoiceAttr = {
        xmlns: 'urn:GEINV:eInvoiceMessage:C0401:3.1',
        'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        'xsi:schemaLocation': 'urn:GEINV:eInvoiceMessage:C0401:3.1 C0401.xsd'
    },
    renderQRcode = Symbol('renderQRcode');

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

    // Static Methods
    // The format of the list of winners:
    // 53925591  10510LC60123189...
    // 53925591  10510LC60122037...
    // The range of receipt number is the 15th position and 10 characters
    static parseWinnersList(winnersList) {
        return winnersList.split(/\n|\r\n?/).map(winner => {
            return winner.substr(15, 10);
        });
    }

    // Getters
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

    get totalQuantity() {
        return this.items.reduce((sum, item) => {
            return sum + item.quantity;
        }, 0);
    }

    // Methods
    // Reference: https://www.einvoice.nat.gov.tw/home/DownLoad?fileName=1447235507091_0.zip
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

    // Reference: https://www.einvoice.nat.gov.tw/home/DownLoad?fileName=1479449792874_0.6(20161115).pdf
    generateBarCodeString() {
        return (
            this.chineseYear +
            utils.padZero(this.winningMonths[1], 2) +
            this.info.number +
            this.info.randomNumber
        );
    }

    // Reference: https://www.einvoice.nat.gov.tw/home/DownLoad?fileName=1479449792874_0.6(20161115).pdf
    generateRightQRCodeString() {
        let qrcode = this.items.map((item, index) => {
            let combineString = [];
            combineString.push(index === 0 ? '**' : ':');
            combineString.push(item.description.replace(':', '-'));
            combineString.push(':' + item.quantity);
            combineString.push(':' + item.unitPrice);
            return combineString.join('');
        });

        return qrcode.join('');
    }

    generateLeftQRCodeString(
        AESKey,
        info = utils.repeat('*', 10),
        encodeType = EncodeType.UTF8
    ) {
        if (!AESKey) {
            throw new TypeError('AES Key is not found');
        }

        let qrcode = [],
            dateString =
                this.chineseYear +
                utils.padZero(this.info.date.getMonth() + 1, 2) +
                utils.padZero(this.info.date.getDate(), 2),
            salesAmountHex16 = utils.padZero(
                this.amount.salesAmount.toString(16).toUpperCase(),
                8
            ),
            totalAmountHex16 = utils.padZero(
                this.amount.totalAmount.toString(16).toUpperCase(),
                8
            ),
            plainText = this.info.number + this.info.randomNumber,
            padding = 16 - plainText.length % 16;

        plainText += utils.repeat(padding, padding);

        const encryptText = Buffer.from(
            aes.encrypt(AESKey, plainText)
        ).toString('base64');

        qrcode.push(this.info.number);
        qrcode.push(dateString);
        qrcode.push(this.info.randomNumber);
        qrcode.push(salesAmountHex16);
        qrcode.push(totalAmountHex16);
        qrcode.push(this.info.buyer.id || utils.repeat('0', 8));
        qrcode.push(this.info.seller.id);
        qrcode.push(encryptText);
        qrcode.push(':' + info);
        qrcode.push(':' + this.items.length);
        qrcode.push(':' + this.totalQuantity);
        qrcode.push(':' + encodeType);

        return qrcode.join('');
    }

    renderBarCode() {
        const svgObject = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'svg'
            ),
            xmlSerializer = new XMLSerializer();

        JsBarcode(svgObject, this.generateBarCodeString(), {
            format: 'CODE39',
            displayValue: false
        });

        return Promise.resolve(xmlSerializer.serializeToString(svgObject));
    }

    renderRightQRCode() {
        return this[renderQRcode](this.generateRightQRCodeString());
    }

    renderLeftQRCode(AESKey) {
        if (!AESKey) {
            throw new TypeError('AES Key is not found');
        }
        return this[renderQRcode](this.generateLeftQRCodeString(AESKey));
    }

    // Private Methods
    [renderQRcode](text) {
        return new Promise((resolve, reject) => {
            const opts = {
                errorCorrectionLevel: 'L',
                version: 6
            };

            QRCode.toString(text, opts, (err, string) => {
                if (err) {
                    reject(error);
                }
                resolve(string);
            });
        });
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

    get totalQuantity() {
        return this.items.reduce((sum, item) => {
            return sum + item.quantity;
        }, 0);
    }
}

export default {
    Receipt: Receipt,
    ReceiptInfo: ReceiptInfo,
    Item: Item,
    Amount: Amount,
    TaxType: TaxType,
    EncodeType: EncodeType
};
