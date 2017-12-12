class Item {
    constructor(description, unitPrice, sequenceNumber, quantity) {
        this.description = description;
        this.unitPrice = parseInt(unitPrice);
        this.sequenceNumber = sequenceNumber;
        this.quantity = parseInt(quantity) || 1;
    }

    toXMLObject() {
        return {
            ProductItem: {
                Description: this.description,
                Quantity: this.quantity,
                UnitPrice: this.unitPrice,
                Amount: this.unitPrice * this.quantity,
                SequenceNumber: this.sequenceNumber
            }
        };
    }
}

export default Item;
