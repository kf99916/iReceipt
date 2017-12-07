import format from 'date-fns/esm';

class ReceiptInfo {
    constructor(number, date, seller, buyer, type, donateMark, printMark) {
        this.number = number;
        this.date = date;
        this.seller = seller;
        this.buyer = buyer;
        this.type = type;
        this.donateMark = donateMark;
        this.printMark = printMark;
    }

    toXMLObject() {
        return {
            InvoiceNumber: this.invoiceNumber,
            InvoiceDate: format(this.date, 'YYYYMMDD'),
            InvoiceTime: format(this.date, 'hh:mm:ss'),
            Seller: {
                Identifier: this.seller.identifier,
                Name: this.seller.name
            },
            Buyer: {
                Identifier: this.buyer.identifier,
                Name: this.buyer.identifier
            },
            InvoiceType: this.type,
            DonateMark: this.donateMark,
            PrintMark: this.printMark,
            RandomNumber: Math.floor(1000 + Math.random() * 9000)
        };
    }
}

export default ReceiptInfo;
