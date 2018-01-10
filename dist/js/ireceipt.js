/*!
    * Ireceipt v0.3.1 (https://github.com/kf99916/iReceipt)
    * Copyright 2018 Zheng-Xiang Ke and Sin-Fong Lyu
    * Licensed under MIT (https://github.com/kf99916/iReceipt/blob/master/LICENSE)
    */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('xml2js'), require('date-fns/esm')) :
	typeof define === 'function' && define.amd ? define(['xml2js', 'date-fns/esm'], factory) :
	(global.ireceipt = factory(global.xml2js,global.esm));
}(this, (function (xml2js,esm) { 'use strict';

xml2js = xml2js && xml2js.hasOwnProperty('default') ? xml2js['default'] : xml2js;

var TaxType = {
    TAX: 1,
    ZERO_TAX: 2,
    FREE_TAX: 3,
    SPECIAL_TAX: 4,
    COMPOUND_TAX: 9
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var ReceiptInfo = function () {
    function ReceiptInfo(number, date, seller, buyer, type, carrier, donationID, orderno) {
        classCallCheck(this, ReceiptInfo);

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

    createClass(ReceiptInfo, [{
        key: 'toXMLObject',
        value: function toXMLObject() {
            var xmlObject = {
                InvoiceNumber: this.number,
                InvoiceDate: esm.format(this.date, 'YYYYMMDD'),
                InvoiceTime: esm.format(this.date, 'hh:mm:ss'),
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
    }]);
    return ReceiptInfo;
}();

var Item = function () {
    function Item(description, unitPrice, sequenceNumber, quantity, taxType) {
        classCallCheck(this, Item);

        this.description = description;
        this.unitPrice = parseInt(unitPrice);
        this.sequenceNumber = sequenceNumber;
        this.quantity = parseInt(quantity) || 1;
        this.taxType = taxType || TaxType.TAX;
    }

    createClass(Item, [{
        key: 'toXMLObject',
        value: function toXMLObject() {
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
    }, {
        key: 'amount',
        get: function get$$1() {
            return this.unitPrice * this.quantity;
        }
    }]);
    return Item;
}();

var Amount = function () {
    function Amount(taxItems, freeTaxItems, zeroTaxItems) {
        classCallCheck(this, Amount);

        var taxRate = 0.05;
        this.salesAmount = Math.round(taxItems.reduce(function (amount, item) {
            return (amount + item.amount) / (1 + taxRate);
        }, 0));
        this.freeTaxSalesAmount = Math.round(freeTaxItems.reduce(function (amount, item) {
            return amount + item.amount;
        }, 0));
        this.zeroTaxSalesAmount = Math.round(zeroTaxItems.reduce(function (amount, item) {
            return amount + item.amount;
        }, 0));

        var hasTax = this.salesAmount !== 0,
            hasFreeTax = this.freeTaxSalesAmount !== 0,
            hasZeroTax = this.zeroTaxSalesAmount !== 0;

        this.taxType = TaxType.SPECIAL_TAX;
        if (hasTax && hasFreeTax || hasTax && hasZeroTax || hasFreeTax && hasZeroTax) {
            this.taxType = TaxType.COMPOUND_TAX;
        } else if (hasTax) {
            this.taxType = TaxType.TAX;
        } else if (hasFreeTax) {
            this.taxType = TaxType.FREE_TAX;
        } else if (hasZeroTax) {
            this.taxType = TaxType.ZERO_TAX;
        }
        this.taxRate = this.taxType === TaxType.FREE_TAX || this.taxType === TaxType.ZERO_TAX ? 0 : taxRate;
        this.taxAmount = Math.round(this.salesAmount * this.taxRate);
        this.totalAmount = this.salesAmount + this.freeTaxSalesAmount + this.zeroTaxSalesAmount + this.taxAmount;
    }

    createClass(Amount, [{
        key: 'toXMLObject',
        value: function toXMLObject() {
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
    }]);
    return Amount;
}();

var defaultInvoiceAttr = {
    xmlns: 'urn:GEINV:eInvoiceMessage:C0401:3.1',
    'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
    'xsi:schemaLocation': 'urn:GEINV:eInvoiceMessage:C0401:3.1 C0401.xsd'
};

var Receipt = function () {
    function Receipt(info, items) {
        classCallCheck(this, Receipt);

        if (!(info instanceof ReceiptInfo)) {
            throw new TypeError('Info is not ReceiptInfo class!');
        }
        var invalidItems = items.filter(function (item) {
            return !(item instanceof Item);
        });
        if (invalidItems.length > 0) {
            throw new TypeError('Some items are not Item class!');
        }

        this.info = info;
        this.items = items;
        this.amount = new Amount(this.taxItems, this.freeTaxItems, this.zeroTaxItems);
    }

    // The format of the list of winners:
    // 53925591  10510LC60123189...
    // 53925591  10510LC60122037...
    // The range of receipt number is the 15th position and 10 characters


    createClass(Receipt, [{
        key: 'toXML',


        // https://asana-user-private-us-east-1.s3.amazonaws.com/assets/1470352313817/469050158764958/0d7d7e6067a5c9d773b7578f68c1e6b6?AWSAccessKeyId=ASIAJYTZ4QJBKU575X7A&Expires=1512619611&Signature=S88aqo8KUTsZIarz6IU0N1Q9x3g%3D&x-amz-security-token=FQoDYXdzEIX%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaDH6gsGTBYtjGkHdQOiK3A9VasWE04WPY29Z46M12cLuySvyX3MqoiAwQe4T4sSxH%2BCDfLhKhTz2N7MEgkCINQ1JHV5ib0TQ3tWfNpffOnKQquhS9vBnYceVgU%2FoMEU8ASPvWyRC%2FBbPzDiNdxbgGB1TqroJuWKb6iZT%2FmfX3TDwAls5%2BKmPA5PtJYr9A6KjV18PdIDiz6X%2FIET2yn%2FZMyjbzEqvLN3HCJWfgQLCBWxT6C3yk%2FBXWynBVQhwgZPhUtzL57hfaW77mkK3iMdFIqFciLmp3suOh8F2D4KCLu2lXJ69W2W57wZtWHr2qzkC9pFG3tMXBzL3tvys%2FN1LIKH7R8RHvB6ugeYfqnyMBLIbWKhpJYUiaXcTennivjYVkUAIGXPsIBYssu8tF0%2BKs0baWnwxwLLfY19HpFG%2FfA8IdH6WUZLTkqfT8DJ%2B29I6Pl0J3NE1Mm7cB6G2Dk%2BJ5%2Bdh7rIlYhGlXNTHjSxJjt%2FmrCXLPnQgfxazk%2Fxp6LFUchdgVANLVLuI1CYy4V%2BKDWXEHXoVGExsr2Oby61ws6nyhk9S9GLE6uxu5wE%2F3xVcQEqUBZ5ad6sJwnDdwXOMFA2Yja1Hao2co6eei0QU%3D#_=_
        value: function toXML() {
            var receiptObject = {
                $: defaultInvoiceAttr,
                Main: this.info.toXMLObject(),
                Details: this.items.map(function (item) {
                    return item.toXMLObject();
                }),
                Amounts: this.amount.toXMLObject()
            };

            var builder = new xml2js.Builder({
                rootName: 'Invoice'
            });
            return builder.buildObject(receiptObject);
        }
    }, {
        key: 'isWinning',
        value: function isWinning(winningNumbers) {
            return winningNumbers.indexOf(this.info.number) !== -1;
        }
    }, {
        key: 'getChineseYear',
        value: function getChineseYear() {
            return this.info.date.getFullYear() - 1911;
        }
    }, {
        key: 'getWinningMonths',
        value: function getWinningMonths() {
            var month = this.info.date.getMonth() + 1;
            return month % 2 === 0 ? [month - 1, month] : [month, month + 1];
        }
    }, {
        key: 'generateBarCodeString',
        value: function generateBarCodeString() {
            return this.getChineseYear().toString() + this.getMonthsInterval()[1] + this.getWinningMonths()[1] + this.info.number + this.info.randomNumber;
        }
    }, {
        key: 'taxItems',
        get: function get$$1() {
            return this.items.filter(function (item) {
                return item.taxType === TaxType.TAX;
            });
        }
    }, {
        key: 'freeTaxItems',
        get: function get$$1() {
            return this.items.filter(function (item) {
                return item.taxType === TaxType.FREE_TAX;
            });
        }
    }, {
        key: 'zeroTaxItems',
        get: function get$$1() {
            return this.items.filter(function (item) {
                return item.taxType === TaxType.ZERO_TAX;
            });
        }
    }], [{
        key: 'parseWinnersList',
        value: function parseWinnersList(winnersList) {
            return winnersList.split(/\n|\r\n?/).map(function (winner) {
                return winner.substr(15, 10);
            });
        }
    }]);
    return Receipt;
}();

var receipt = {
    Receipt: Receipt,
    ReceiptInfo: ReceiptInfo,
    Item: Item,
    Amount: Amount,
    TaxType: TaxType
};

return receipt;

})));
//# sourceMappingURL=ireceipt.js.map
