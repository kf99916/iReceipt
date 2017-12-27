import { format } from 'date-fns/esm';

class ReceiptInfo {
    constructor(
        number,
        date,
        seller,
        buyer,
        type,
        carrier,
        donationID,
        orderno
    ) {
        this.number = number;
        this.date = date;
        this.seller = seller;
        this.buyer = buyer;
        this.buyer.id = this.buyer.id || '0000000000';
        this.type = type || '07';
        this.carrier = carrier;
        this.donationID = donationID;
        this.randomNumber = Math.floor(1000 + Math.random() * 9000);
        this.orderno = orderno;
    }

    toXMLObject() {
        let xmlObject = {
            InvoiceNumber: this.number,
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
            PrintMark: this.carrier ? 'N' : 'Y',
            RandomNumber: this.randomNumber
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
