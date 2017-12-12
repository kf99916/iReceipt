# iReceipt

Generate Taiwan's electronic receipt including the layout and XML for National Taxation Bureau. The spec. from National Taxation Bureau is very awful to waste a lot of time. iReceipt can save developers' and accountants' time!!!

[![License](https://img.shields.io/github/license/kf99916/iReceipt.svg)](LICENSE)

## Requirements

iReceipt is written with ECMAScript 6. You can leverage [Babel](https://babeljs.io/) and [Webpack](https://webpack.js.org/) to make all browsers available.

## Installation

```bash
npm install ireceipt --save
```

## Usage

```javascript
import IReceipt from 'ireceipt';

const info = new IReceipt.ReceiptInfo(
        1234,
        new Date(),
        { id: '{{SELLER_ID}}', name: '{{SELLER_NAME}}' },
        { id: '{{BUYER_ID}}', name: '{{BUYER_NAME}}' },
        false
    ),
    items = [new IReceipt.Item('{{ITEM_DESCRIPTION}}', 3000, 1)],
    amount = new IReceipt.Amount(3000, 0),
    receiptObject = new IReceipt.Receipt(info, items, amount);

window.console.log(receiptObject.toXML());
```

### ReceiptInfo

Store the receipt information.

`constructor(number, date, seller, buyer, isPrinted, type, carrier, donationID)`

### Item

The item buyed by buyer.

`constructor(description, unitPrice, sequenceNumber, quantity)`

### Amount

Store the amount information.

`constructor(amount, taxAmount, freeTaxAmount, zeroTaxAmount)`

### Receipt

The receipt JavaScript object. It owns a `ReceiptInfo`, `Items`, and a `Amount`.

`constructor(info, items, amount)`

#### Member Methods

`toXML()` Receipt object to xml string.

## Author

Zheng-Xiang Ke, kf99916@gmail.com

## License

iReceipt is available under the MIT license. See the LICENSE file for more info.
