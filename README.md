# iReceipt

Generate Taiwan's electronic receipt including the layout, barcode, and XML for National Taxation Bureau. The spec. from National Taxation Bureau is very trivial but very complicated and hard to read. iReceipt can save your life and time!!!

[![npm](https://img.shields.io/npm/dt/ireceipt.svg)](https://www.npmjs.com/package/ireceipt)
[![GitHub stars](https://img.shields.io/github/stars/kf99916/iReceipt.svg)](https://github.com/kf99916/iReceipt/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/kf99916/iReceipt.svg)](https://github.com/kf99916/iReceipt/network)
[![npm](https://img.shields.io/npm/v/ireceipt.svg)](https://www.npmjs.com/package/ireceipt)
[![GitHub license](https://img.shields.io/github/license/kf99916/iReceipt.svg)](https://github.com/kf99916/iReceipt/blob/master/LICENSE)

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
    receiptObject = new IReceipt.Receipt(info, items);

window.console.log(receiptObject.toXML());

// Taiwan Receipt Lottery
// The format of the list of winners:
// 53925591  10510LC60123189...
// 53925591  10510LC60122037...
const winnersList = IReceipt.Receipt.parseWinnersList('{{WINNERS_LIST}}');
window.console.log(receiptObject.isWinning(winnersList));
```

### ReceiptInfo

Store the receipt information.

`constructor(number, date, seller, buyer, type, carrier, donationID, orderno)`

`number` receipt number  
`date` receipt date  
`seller` seller information, including id and name. (`{ id: '{{SELLER_ID}}', name: '{{SELLER_NAME}}' }`)  
`buyer` buyer information, including id and name. (`{ id: '{{BUYER_ID}}', name: '{{BUYER_NAME}}' }`)  
`type` receipt type (default `07`)  
`carrier` receipt carrier information, including id and type. (`{id: '{{CARRIER_ID}}', type:'CARRIER_TYPE'}`)  
`donationID` charity's love code (愛心碼)   
`orderno` The order number

### Item

The product item buyed by buyer.

`constructor(description, unitPrice, sequenceNumber, quantity, taxType)`

`description` product item's description  
`unitPrice` unit price for a product item  
`sequenceNumber` sequence number  
`quantity` quantity of product items (default `1`)   
`taxType` The tax type (default `TaxType.TAX`)

### Amount

Store the amount information.

`constructor(taxItems, freeTaxItems, zeroTaxItems)`

`taxItems` The tax items  
`freeTaxItems` The free tax items  
`zeroTaxItems` The zero tax items

### TaxType

Tax type enum.

```js
{
    TAX: 1,
    ZERO_TAX: 2,
    FREE_TAX: 3,
    SPECIAL_TAX: 4,
    COMPOUND_TAX: 9
}
```

### Receipt

The receipt JavaScript object. It owns a `ReceiptInfo`, `Item`s and creates a `Amount` based on items.

`constructor(info, items)`

#### Member Methods

`toXML()` Receipt object to xml string.

## Reference

* <a href="https://www.einvoice.nat.gov.tw/">E-invoice Platform (財政部電子發票整合服務平台)</a>
* <a href="https://www.einvoice.nat.gov.tw/home/DownLoad?fileName=1479449792874_0.6(20161115).pdf">電子發票證明聯一維及二維條碼規格說明(V1.6)</a>
* <a href="https://www.einvoice.nat.gov.tw/home/DownLoad?fileName=1447235507091_0.zip">電子發票資料交換標準文件與範例(V3.1.2)</a>

## Author

Zheng-Xiang Ke, kf99916@gmail.com   
Sin-Fong Lyu, kingispeak@gmail.com

## License

iReceipt is available under the MIT license. See the LICENSE file for more info.
