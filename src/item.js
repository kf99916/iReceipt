class Item {
    constructor(description, unitPrice, sequenceNumber, quantity) {
        this.description = description;
        this.unitPrice = unitPrice;
        this.sequenceNumber = sequenceNumber;
        this.quantity = quantity || 1;
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
