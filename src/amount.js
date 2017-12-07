class Amount {
    constructor() {}

    toXMLObject() {
        return {
            SalesAmount: '',
            FreeTaxSalesAmount: '',
            ZeroTaxSalesAmount: '',
            TaxType: '',
            TaxRate: '',
            TaxAmount: '',
            TotalAmount: ''
        };
    }
}

export default Amount;
