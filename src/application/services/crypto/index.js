export class CryptoService {
  constructor({ libs: { crypto }, env: { ENCRYPTION_KEY } }) {
    this._crypto = crypto;
    this._SECRET_KEY = ENCRYPTION_KEY;

    this.encrypt = this.encrypt.bind(this);
    this.decrypt = this.decrypt.bind(this);
    this.hash = this.hash.bind(this);
  }

  encrypt({ args: str }) {
    const payload = this._crypto.AES.encrypt(str, this._SECRET_KEY).toString();
    return { payload };
  }

  decrypt({ args: encrypted }) {
    const decryptedBytes = this._crypto.AES.decrypt(encrypted, this._SECRET_KEY);
    const payload = decryptedBytes.toString(this._crypto.enc.Utf8);
    return { payload };
  }

  hash({ args: str }) {
    const payload = this._crypto.HmacSHA256(str, this._SECRET_KEY).toString();
    return { payload };
  }
}

export default CryptoService;
