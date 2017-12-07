'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _esm = require('date-fns/esm');

var _esm2 = _interopRequireDefault(_esm);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ReceiptInfo = function () {
    function ReceiptInfo(number, date, seller, buyer, type, donateMark, printMark) {
        _classCallCheck(this, ReceiptInfo);

        this.number = number;
        this.date = date;
        this.seller = seller;
        this.buyer = buyer;
        this.type = type;
        this.donateMark = donateMark;
        this.printMark = printMark;
    }

    _createClass(ReceiptInfo, [{
        key: 'toXMLObject',
        value: function toXMLObject() {
            return {
                InvoiceNumber: this.invoiceNumber,
                InvoiceDate: (0, _esm2.default)(this.date, 'YYYYMMDD'),
                InvoiceTime: (0, _esm2.default)(this.date, 'hh:mm:ss'),
                Seller: {
                    Identifier: this.seller.identifier,
                    Name: this.seller.name
                },
                Buyer: {
                    Identifier: this.buyer.identifier,
                    Name: this.buyer.identifier
                },
                InvoiceType: this.type,
                DonateMark: this.donateMark,
                PrintMark: this.printMark,
                RandomNumber: Math.floor(1000 + Math.random() * 9000)
            };
        }
    }]);

    return ReceiptInfo;
}();

exports.default = ReceiptInfo;