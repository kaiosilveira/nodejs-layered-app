import chai from 'chai';
import spies from 'chai-spies';

import CryptoService from './index.js';

chai.use(spies);
chai.should();

describe('CryptoService', () => {
  const SECRET_KEY = 'mysecretkey';
  const str = 'strtoencrypt';

  describe('encrypt', () => {
    it('should encrypt an object', () => {
      const encryptedStr = 'thiswasencrypted';
      const AES = chai.spy.interface({ encrypt: () => encryptedStr });
      const crypto = { AES };

      const encrypted = new CryptoService({ crypto, SECRET_KEY }).encrypt(str);
      encrypted.should.be.eql(encryptedStr);
      AES.encrypt.should.have.been.called.with(str);
    });
  });

  describe('decrypt', () => {
    it('should decrypt an object', () => {
      const encryptedStr = 'thiswasencrypted';
      const AES = chai.spy.interface({ decrypt: () => Buffer.from(str) });
      const crypto = { AES, enc: { Utf8: 'utf-8' } };

      const decrypted = new CryptoService({ crypto, SECRET_KEY }).decrypt(encryptedStr);
      decrypted.should.be.eql(str);
      AES.decrypt.should.have.been.called.with(encryptedStr);
    });
  });

  describe('hash', () => {
    it('should hash a string', () => {
      const input = 'str';
      const hashedStr = 'hashed-str';
      const crypto = chai.spy.interface({ HmacSHA256: () => hashedStr });

      const resultingHash = new CryptoService({ crypto, SECRET_KEY }).hash(input);

      resultingHash.should.be.eql(hashedStr);
      crypto.HmacSHA256.should.have.been.called.with(input, SECRET_KEY);
    });
  });
});
