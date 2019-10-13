import TaxType from './tax-type';

class Amount {
    constructor(taxItems, freeTaxItems, zeroTaxItems) {
        const taxRate = 0.05;
        let amounts = taxItems.map(item => item.amount / (1 + taxRate));
        this.salesAmount = Math.round(
            amounts.reduce((amount, item) => amount + item, 0)
        );
        this.freeTaxSalesAmount = Math.round(
            freeTaxItems.reduce((amount, item) => amount + item.amount, 0)
        );
        this.zeroTaxSalesAmount = Math.round(
            zeroTaxItems.reduce((amount, item) => amount + item.amount, 0)
        );

        const hasTax = this.salesAmount !== 0,
            hasFreeTax = this.freeTaxSalesAmount !== 0,
            hasZeroTax = this.zeroTaxSalesAmount !== 0;

        this.taxType = TaxType.SPECIAL_TAX;
        if (
            (hasTax && hasFreeTax) ||
            (hasTax && hasZeroTax) ||
            (hasFreeTax && hasZeroTax)
        ) {
            this.taxType = TaxType.COMPOUND_TAX;
        } else if (hasTax) {
            this.taxType = TaxType.TAX;
        } else if (hasFreeTax) {
            this.taxType = TaxType.FREE_TAX;
        } else if (hasZeroTax) {
            this.taxType = TaxType.ZERO_TAX;
        }
        this.taxRate =
            this.taxType === TaxType.FREE_TAX ||
            this.taxType === TaxType.ZERO_TAX
                ? 0
                : taxRate;
        this.taxAmount = Math.round(this.salesAmount * this.taxRate);
        this.totalAmount =
            this.salesAmount +
            this.freeTaxSalesAmount +
            this.zeroTaxSalesAmount +
            this.taxAmount;
    }

    toXMLObject() {
        return {
            SalesAmount: this.salesAmount,
            FreeTaxSalesAmount: this.freeTaxSalesAmount,
            ZeroTaxSalesAmount: this.zeroTaxSalesAmount,
            TaxType: this.taxType,
            TaxRate: this.taxRate,
            TaxAmount: this.taxAmount,
            TotalAmount: this.totalAmount
        };
    }
}

export default Amount;
