import format from 'date-fns/esm';

class ReceiptInfo {
    constructor(
        number,
        date,
        seller,
        buyer,
        isPrinted,
        type,
        carrier,
        donationID
    ) {
        this.number = number;
        this.date = date;
        this.seller = seller;
        this.buyer = buyer;
        this.buyer.id = this.buyer.id || '0000000000';
        this.isPrinted = isPrinted;
        this.type = type || '07';
        this.carrier = carrier;
        this.donationID = donationID;
    }

    toXMLObject() {
        let xmlObject = {
            InvoiceNumber: this.invoiceNumber,
            InvoiceDate: format(this.date, 'YYYYMMDD'),
            InvoiceTime: format(this.date, 'hh:mm:ss'),
            Seller: {
                Identifier: this.seller.id,
                Name: this.seller.name
            },
            Buyer: {
                Identifier: this.buyer.id,
                Name: this.buyer.name
            },
            InvoiceType: this.type,
            DonateMark: 0,
            PrintMark: this.isPrinted ? 'Y' : 'N',
            RandomNumber: Math.floor(1000 + Math.random() * 9000)
        };

        if (this.donationID) {
            xmlObject.DonateMark = 1;
            xmlObject.NPOBAN = this.donationID;
        }

        if (this.carrier) {
            xmlObject.CarrierType = this.carrier.type;
            xmlObject.CarrierId1 = this.carrier.id;
            xmlObject.CarrierId2 = this.carrier.id;
        }

        return xmlObject;
    }
}

export default ReceiptInfo;
