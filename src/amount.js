class Amount {
    constructor(amount, taxAmount, freeTaxAmount, zeroTaxAmount) {
        this.amount = parseInt(amount);
        this.taxAmount = Math.round(taxAmount);
        this.freeTaxAmount = Math.max(Math.round(freeTaxAmount), 0) || 0;
        this.zeroTaxAmount = Math.max(Math.round(zeroTaxAmount), 0) || 0;
        this.taxType = this.freeTaxAmount === 0 ? 1 : this.amount === 0 ? 3 : 9;
        this.taxRate = this.taxType === 3 ? 0 : 0.05;
    }

    toXMLObject() {
        return {
            SalesAmount: this.amount - this.taxAmount,
            FreeTaxSalesAmount: this.freeTaxAmount,
            ZeroTaxSalesAmount: this.zeroTaxAmount,
            TaxType: this.taxType,
            TaxRate: this.taxRate,
            TaxAmount: this.taxAmount,
            TotalAmount: this.amount + this.freeTaxAmount
        };
    }
}

export default Amount;
