/*!
    * iReceipt v1.0.0 (https://github.com/kf99916/iReceipt)
    * Copyright 2018 [object Object]
    * Licensed under MIT (https://github.com/kf99916/iReceipt/blob/master/LICENSE)
    */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('xml2js'), require('date-fns/esm'), require('aes-js'), require('jsbarcode'), require('qrcode')) :
	typeof define === 'function' && define.amd ? define(['xml2js', 'date-fns/esm', 'aes-js', 'jsbarcode', 'qrcode'], factory) :
	(global.IReceipt = factory(global.xml2js,global.esm,global.aesjs,global.JsBarcode,global.QRCode));
}(this, (function (xml2js,esm,aesjs,JsBarcode,QRCode) { 'use strict';

xml2js = xml2js && xml2js.hasOwnProperty('default') ? xml2js['default'] : xml2js;
aesjs = aesjs && aesjs.hasOwnProperty('default') ? aesjs['default'] : aesjs;
JsBarcode = JsBarcode && JsBarcode.hasOwnProperty('default') ? JsBarcode['default'] : JsBarcode;
QRCode = QRCode && QRCode.hasOwnProperty('default') ? QRCode['default'] : QRCode;

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



























var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
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
    },
    repeat: function repeat(string, times) {
        var repeatedString = '';
        while (times > 0) {
            repeatedString += string;
            times--;
        }
        return repeatedString;
    }
};

var EncodeType = {
    BIG5: 0,
    UTF8: 1,
    BASE64: 3
};

var aes = {
    encrypt: function encrypt(AESKey, plainText) {
        if (!AESKey) {
            throw new TypeError('AES Key is not found!');
        }
        var textBytes = aesjs.utils.utf8.toBytes(plainText),
            aesCtr = new aesjs.ModeOfOperation.ctr(AESKey, new aesjs.Counter(5));

        return aesCtr.encrypt(textBytes);
    },
    decrypt: function decrypt(AESKey, encryptedBytes) {
        if (!AESKey) {
            throw new TypeError('AES Key is not found');
        }
        var aesCtr = new aesjs.ModeOfOperation.ctr(AESKey, new aesjs.Counter(5)),
            decryptedBytes = aesCtr.decrypt(encryptedBytes);

        return aesjs.utils.utf8.fromBytes(decryptedBytes);
    }
};

var template = "<style type=\"text/css\">\n    .receipt-year-month {\n        position: absolute;\n        top: 2.5cm;\n        left: 2.5cm;\n        font-size: 0.6cm;\n    }\n\n    .receipt-invoice-number {\n        position: absolute;\n        top: 3.2cm;\n        left: 2.8cm;\n        font-size: 0.6cm;\n    }\n\n    .receipt-issue-time {\n        position: absolute;\n        top: 3.9cm;\n        left: 1.8cm;\n    }\n\n    .receipt-random-number {\n        position: absolute;\n        top: 4.3cm;\n        left: 1.8cm;\n    }\n\n    .receipt-amount {\n        position: absolute;\n        top: 4.3cm;\n        left: 5.1cm;\n    }\n\n    .einvoice-name {\n        position: absolute;\n        top: 1.2cm;\n        left: 2.5cm;\n        font-size: 0.4cm;\n    }\n\n    .receipt-title {\n        position: absolute;\n        top: 1.8cm;\n        left: 2.5cm;\n        font-size: 0.6cm;\n    }\n\n    .einvoice-identifier {\n        position: absolute;\n        top: 4.7cm;\n        left: 1.8cm;\n    }\n\n    .buyer-identifier {\n        position: absolute;\n        top: 4.7cm;\n        left: 5cm;\n    }\n\n    .einvoice-barcode {\n        position: absolute;\n        top: 5.2cm;\n        left: 1.5cm;\n    }\n\n    .einvoice-qrcode-left,\n    .einvoice-qrcode-right {\n        width: 2.5cm;\n        position: absolute;\n        top: 6.2cm;\n    }\n\n    .einvoice-qrcode-left {\n        left: 1.6cm;\n    }\n\n    .einvoice-qrcode-right {\n        left: 4.9cm;\n    }\n\n    .einvoice-remark {\n        position: absolute;\n        top: 8.8cm;\n        left: 2.2cm;\n        font-size: 0.2cm;\n    }\n</style>";

var defaultInvoiceAttr = {
    xmlns: 'urn:GEINV:eInvoiceMessage:C0401:3.1',
    'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
    'xsi:schemaLocation': 'urn:GEINV:eInvoiceMessage:C0401:3.1 C0401.xsd'
};
var renderQRcode = function renderQRcode(text) {
    return new Promise(function (resolve, reject) {
        var opts = {
            errorCorrectionLevel: 'L',
            version: 6
        };
        QRCode.toString(text, opts, function (err, string) {
            if (err) {
                reject(error);
            }
            resolve(string);
        });
    });
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
        value: function generateLeftQRCodeString(AESKey) {
            var info = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : utils.repeat('*', 10);
            var encodeType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : EncodeType.UTF8;

            if (!AESKey) {
                throw new TypeError('AES Key is not found');
            }

            var qrcode = [],
                dateString = this.chineseYear + utils.padZero(this.info.date.getMonth() + 1, 2) + utils.padZero(this.info.date.getDate(), 2),
                salesAmountHex16 = utils.padZero(this.amount.salesAmount.toString(16).toUpperCase(), 8),
                totalAmountHex16 = utils.padZero(this.amount.totalAmount.toString(16).toUpperCase(), 8),
                plainText = this.info.number + this.info.randomNumber,
                padding = 16 - plainText.length % 16;

            plainText += utils.repeat(padding, padding);

            var encryptText = Buffer.from(aes.encrypt(AESKey, plainText)).toString('base64');

            qrcode.push(this.info.number);
            qrcode.push(dateString);
            qrcode.push(this.info.randomNumber);
            qrcode.push(salesAmountHex16);
            qrcode.push(totalAmountHex16);
            qrcode.push(this.info.buyer.id || utils.repeat('0', 8));
            qrcode.push(this.info.seller.id);
            qrcode.push(encryptText);
            qrcode.push(':' + info);
            qrcode.push(':' + this.items.length);
            qrcode.push(':' + this.totalQuantity);
            qrcode.push(':' + encodeType);

            return qrcode.join('');
        }
    }, {
        key: 'render',
        value: function render(AESKey) {
            var _this = this;

            if (!AESKey) {
                throw new TypeError('AES Key is not found');
            }

            var promises = [this.renderBarCode(), this.renderLeftQRCode(AESKey), this.renderRightQRCode()],
                intlNumberFormat = new Intl.NumberFormat();

            return Promise.all(promises).then(function (_ref) {
                var _ref2 = slicedToArray(_ref, 3),
                    barCode = _ref2[0],
                    leftQRCode = _ref2[1],
                    rightQRCode = _ref2[2];

                var buyerIdHtmlString = _this.info.buyer.id ? '<div class="buyer-identifier">\n                        \u8CB7\u65B9' + _this.info.buyer.id + '\n                      </div>' : '';

                return template + '\n                    <div class="receipt">\n                        <div class="einvoice-name">\n                            ' + _this.info.seller.name + '\n                        </div>\n                        <div class="receipt-title">\u96FB\u5B50\u767C\u7968\u8B49\u660E\u806F</div>\n                        <div class="receipt-year-month">\n                            ' + _this.chineseYear + '\u5E74\n                            ' + _this.winningMonths[0] + '-' + _this.winningMonths[1] + '\u6708 \n                        </div>\n                        <div class="receipt-invoice-number">\n                            ' + _this.info.number + '\n                        </div>\n                        <div class="receipt-issue-time">\n                            ' + esm.format(_this.info.date, 'YYYY-MM-DD hh:mm:ss') + '\n                        </div>\n                        <div class="receipt-random-number">\n                            \u96A8\u6A5F\u78BC ' + _this.info.randomNumber + '\n                        </div>\n                        <div class="receipt-amount">\n                            \u7E3D\u8A08 ' + intlNumberFormat.format(_this.amount.totalAmount) + '\n                        </div>\n                        <div class="einvoice-identifier">\n                            \u8CE3\u65B9' + _this.info.seller.id + '\n                        </div>\n                        ' + buyerIdHtmlString + '\n                        <div class="einvoice-barcode">' + barCode + '</div>\n                        <div class="einvoice-qrcode-left">' + leftQRCode + '</div>\n                        <div class="einvoice-qrcode-right">' + rightQRCode + '</div>\n                        <div class="einvoice-remark">\u9000\u8CA8\u6191\u96FB\u5B50\u767C\u7968\u8B49\u660E\u806F\u6B63\u672C\u8FA6\u7406</div>\n                    </div>';
            });
        }
    }, {
        key: 'renderBarCode',
        value: function renderBarCode() {
            var svgObject = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
                xmlSerializer = new XMLSerializer();

            JsBarcode(svgObject, this.generateBarCodeString(), {
                format: 'CODE39',
                displayValue: false,
                width: 0.6,
                height: 25
            });

            return Promise.resolve(xmlSerializer.serializeToString(svgObject));
        }
    }, {
        key: 'renderRightQRCode',
        value: function renderRightQRCode() {
            return renderQRcode(this.generateRightQRCodeString());
        }
    }, {
        key: 'renderLeftQRCode',
        value: function renderLeftQRCode(AESKey) {
            if (!AESKey) {
                throw new TypeError('AES Key is not found');
            }
            return renderQRcode(this.generateLeftQRCodeString(AESKey));
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

        // Getters

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
