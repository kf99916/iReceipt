import aesjs from 'aes-js';

export default {
    encrypt: function(AESKey, plainText) {
        if (!AESKey) {
            throw new TypeError('AES Key is not found!');
        }
        const textBytes = aesjs.utils.utf8.toBytes(plainText),
            aesCtr = new aesjs.ModeOfOperation.ctr(
                AESKey,
                new aesjs.Counter(5)
            );

        return aesCtr.encrypt(textBytes);
    },
    decrypt: function(AESKey, encryptedBytes) {
        if (!AESKey) {
            throw new TypeError('AES Key is not found');
        }
        const aesCtr = new aesjs.ModeOfOperation.ctr(
                AESKey,
                new aesjs.Counter(5)
            ),
            decryptedBytes = aesCtr.decrypt(encryptedBytes);

        return aesjs.utils.utf8.fromBytes(decryptedBytes);
    }
};
