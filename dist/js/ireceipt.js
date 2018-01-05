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
    function ReceiptInfo(number, date, seller, buyer) {
        var type = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : '07';
        var carrier = arguments[5];
        var donationID = arguments[6];
        var orderno = arguments[7];
        classCallCheck(this, ReceiptInfo);

        this.number = number;
        this.date = date;
        this.seller = seller;
        this.buyer = buyer;
        this.type = type;
        this.carrier = carrier;
        this.donationID = donationID;
        this.orderno = orderno;
        this.randomNumber = Math.floor(1000 + Math.random() * 9000);
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
                    Identifier: this.buyer.id || '0000000000',
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
    function Item(description, unitPrice, sequenceNumber) {
        var quantity = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;
        var taxType = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : TaxType.TAX;
        classCallCheck(this, Item);

        this.description = description;
        this.unitPrice = parseInt(unitPrice);
        this.sequenceNumber = sequenceNumber;
        this.quantity = parseInt(quantity);
        this.taxType = taxType;
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

var utils = {
    padZero: function padZero(number, size) {
        return ('000000000' + number).substr(-size);
    }
};

var EncodeType = {
    BIG5: 0,
    UTF8: 1,
    BASE64: 3
};

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

    // Static Methods
    // The format of the list of winners:
    // 53925591  10510LC60123189...
    // 53925591  10510LC60122037...
    // The range of receipt number is the 15th position and 10 characters


    createClass(Receipt, [{
        key: 'toXML',


        // Methods
        // Reference: https://www.einvoice.nat.gov.tw/home/DownLoad?fileName=1447235507091_0.zip
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

        // Reference: https://www.einvoice.nat.gov.tw/home/DownLoad?fileName=1479449792874_0.6(20161115).pdf

    }, {
        key: 'generateBarCodeString',
        value: function generateBarCodeString() {
            return this.chineseYear + utils.padZero(this.winningMonths[1], 2) + this.info.number + this.info.randomNumber;
        }

        // Reference: https://www.einvoice.nat.gov.tw/home/DownLoad?fileName=1479449792874_0.6(20161115).pdf

    }, {
        key: 'generateRightQRCodeString',
        value: function generateRightQRCodeString() {
            var qrcode = this.items.map(function (item, index) {
                var combineString = [];
                combineString.push(index === 0 ? '**' : ':');
                combineString.push(item.description.replace(':', '-'));
                combineString.push(':' + item.quantity);
                combineString.push(':' + item.unitPrice);
                return combineString.join('');
            });

            return qrcode.join('');
        }
    }, {
        key: 'generateLeftQRCodeString',
        value: function generateLeftQRCodeString() {
            var info = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '**********';
            var encodeType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : EncodeType.UTF8;

            var qrcode = [],
                dateString = this.chineseYear + utils.padZero(this.info.date.getMonth() + 1, 2) + utils.padZero(this.info.date.getDate(), 2),
                salesAmountHex16 = utils.padZero(this.amount.salesAmount.toString(16).toUpperCase(), 8),
                totalAmountHex16 = utils.padZero(this.amount.totalAmount.toString(16).toUpperCase(), 8);

            qrcode.push(this.info.number);
            qrcode.push(dateString);
            qrcode.push(this.info.randomNumber);
            qrcode.push(salesAmountHex16);
            qrcode.push(totalAmountHex16);
            qrcode.push(this.info.buyer.id || '00000000');
            qrcode.push(this.info.seller.id);
            qrcode.push(this.info.number + this.info.randomNumber);
            qrcode.push(':' + info);
            qrcode.push(':' + this.items.length);
            qrcode.push(':' + this.totalQuantity);
            qrcode.push(':' + encodeType);

            return qrcode.join('');
        }
    }, {
        key: 'taxItems',


        // Getters
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
    }, {
        key: 'chineseYear',
        get: function get$$1() {
            return this.info.date.getFullYear() - 1911;
        }
    }, {
        key: 'winningMonths',
        get: function get$$1() {
            var month = this.info.date.getMonth() + 1;
            return month % 2 === 0 ? [month - 1, month] : [month, month + 1];
        }
    }, {
        key: 'totalQuantity',
        get: function get$$1() {
            return this.items.reduce(function (sum, item) {
                return sum + item.quantity;
            }, 0);
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
    TaxType: TaxType,
    EncodeType: EncodeType
};

return receipt;

})));
//# sourceMappingURL=ireceipt.js.map
