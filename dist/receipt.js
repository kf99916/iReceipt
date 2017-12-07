'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _xml2js = require('xml2js');

var _xml2js2 = _interopRequireDefault(_xml2js);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var defaultInvoiceAttr = {
    xmlns: 'urn:GEINV:eInvoiceMessage:C0401:3.1',
    'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
    'xsi:schemaLocation': 'urn:GEINV:eInvoiceMessage:C0401:3.1 C0401.xsd'
};

var Receipt = function () {
    function Receipt(info, items, amount) {
        _classCallCheck(this, Receipt);

        this.info = info;
        this.items = items;
        this.amount = amount;
    }

    // https://asana-user-private-us-east-1.s3.amazonaws.com/assets/1470352313817/469050158764958/0d7d7e6067a5c9d773b7578f68c1e6b6?AWSAccessKeyId=ASIAJYTZ4QJBKU575X7A&Expires=1512619611&Signature=S88aqo8KUTsZIarz6IU0N1Q9x3g%3D&x-amz-security-token=FQoDYXdzEIX%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaDH6gsGTBYtjGkHdQOiK3A9VasWE04WPY29Z46M12cLuySvyX3MqoiAwQe4T4sSxH%2BCDfLhKhTz2N7MEgkCINQ1JHV5ib0TQ3tWfNpffOnKQquhS9vBnYceVgU%2FoMEU8ASPvWyRC%2FBbPzDiNdxbgGB1TqroJuWKb6iZT%2FmfX3TDwAls5%2BKmPA5PtJYr9A6KjV18PdIDiz6X%2FIET2yn%2FZMyjbzEqvLN3HCJWfgQLCBWxT6C3yk%2FBXWynBVQhwgZPhUtzL57hfaW77mkK3iMdFIqFciLmp3suOh8F2D4KCLu2lXJ69W2W57wZtWHr2qzkC9pFG3tMXBzL3tvys%2FN1LIKH7R8RHvB6ugeYfqnyMBLIbWKhpJYUiaXcTennivjYVkUAIGXPsIBYssu8tF0%2BKs0baWnwxwLLfY19HpFG%2FfA8IdH6WUZLTkqfT8DJ%2B29I6Pl0J3NE1Mm7cB6G2Dk%2BJ5%2Bdh7rIlYhGlXNTHjSxJjt%2FmrCXLPnQgfxazk%2Fxp6LFUchdgVANLVLuI1CYy4V%2BKDWXEHXoVGExsr2Oby61ws6nyhk9S9GLE6uxu5wE%2F3xVcQEqUBZ5ad6sJwnDdwXOMFA2Yja1Hao2co6eei0QU%3D#_=_


    _createClass(Receipt, [{
        key: 'toXML',
        value: function toXML() {
            var receiptObject = {
                $: defaultInvoiceAttr,
                Main: this.info.toXMLObject(),
                Details: this.items.map(function (item) {
                    return item.toXMLObject();
                }),
                Amounts: this.amount.toXMLObject()
            };

            var builder = new _xml2js2.default.Builder();
            return builder.buildObject(receiptObject);
        }
    }]);

    return Receipt;
}();

exports.default = IReceipt;