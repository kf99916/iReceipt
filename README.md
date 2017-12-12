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

`constructor(number, date, seller, buyer, type, carrier, donationID)`

`number` receipt number  
`date` receipt date  
`seller` seller information, including id and name. (`{ id: '{{SELLER_ID}}', name: '{{SELLER_NAME}}' }`)  
`buyer` buyer information, including id and name. (`{ id: '{{BUYER_ID}}', name: '{{BUYER_NAME}}' }`)  
`type` receipt type (default `07`)  
`carrier` receipt carrier information, including id and type. (`{id: '{{CARRIER_ID}}', type:'CARRIER_TYPE'}`)  
`donationID` charity's love code (愛心碼)

### Item

The product item buyed by buyer.

`constructor(description, unitPrice, sequenceNumber, quantity)`

`description` product item's description  
`unitPrice` unit price for a product item  
`sequenceNumber` sequence number  
`quantity` quantity of product items (default `1`)

### Amount

Store the amount information.

`constructor(amount, taxAmount, freeTaxAmount, zeroTaxAmount)`

`amount` receipt amount  
`taxAmount` tax amount  
`freeTaxAmount` free tax amount (default `0`)  
`zeroTaxAmount` zero tax amount (default `0`)

### Receipt

The receipt JavaScript object. It owns a `ReceiptInfo`, `Items`, and a `Amount`.

`constructor(info, items, amount)`

#### Member Methods

`toXML()` Receipt object to xml string.

## Author

Zheng-Xiang Ke, kf99916@gmail.com

## License

iReceipt is available under the MIT license. See the LICENSE file for more info.
