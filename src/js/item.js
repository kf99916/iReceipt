import TaxType from './tax-type';

class Item {
    constructor(
        description,
        unitPrice,
        sequenceNumber,
        quantity = 1,
        taxType = TaxType.TAX
    ) {
        this.description = description;
        this.unitPrice = parseInt(unitPrice);
        this.sequenceNumber = sequenceNumber;
        this.quantity = parseInt(quantity);
        this.taxType = taxType;
    }

    toXMLObject() {
        return {
            ProductItem: {
                Description: this.description,
                Quantity: this.quantity,
                UnitPrice: this.unitPrice,
                Amount: this.amount,
                SequenceNumber: this.sequenceNumber
            }
        };
    }

    get amount() {
        return this.unitPrice * this.quantity;
    }
}

export default Item;
