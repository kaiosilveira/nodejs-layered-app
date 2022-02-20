export class CryptoService {
  constructor({ crypto, SECRET_KEY }) {
    this._crypto = crypto;
    this._SECRET_KEY = SECRET_KEY;

    this.encrypt = this.encrypt.bind(this);
    this.decrypt = this.decrypt.bind(this);
    this.hash = this.hash.bind(this);
  }

  encrypt(str) {
    return this._crypto.AES.encrypt(str, this._SECRET_KEY).toString();
  }

  decrypt(encrypted) {
    const decryptedBytes = this._crypto.AES.decrypt(encrypted, this._SECRET_KEY);
    return decryptedBytes.toString(this._crypto.enc.Utf8);
  }

  hash(str) {
    return this._crypto.HmacSHA256(str, this._SECRET_KEY).toString();
  }
}

export default CryptoService;
