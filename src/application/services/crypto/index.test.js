import chai from 'chai';
import spies from 'chai-spies';

import CryptoService from './index.js';

chai.use(spies);
chai.should();

describe('CryptoService', () => {
  const ENCRYPTION_KEY = 'mysecretkey';
  const str = 'strtoencrypt';

  describe('encrypt', () => {
    it('should encrypt an object', () => {
      const encryptedStr = 'thiswasencrypted';
      const AES = chai.spy.interface({ encrypt: () => encryptedStr });
      const crypto = { AES };

      const { payload: encrypted } = new CryptoService({
        libs: { crypto },
        env: { ENCRYPTION_KEY },
      }).encrypt({
        args: str,
      });

      encrypted.should.be.eql(encryptedStr);
      AES.encrypt.should.have.been.called.with(str);
    });
  });

  describe('decrypt', () => {
    it('should decrypt an object', () => {
      const encryptedStr = 'thiswasencrypted';
      const AES = chai.spy.interface({ decrypt: () => Buffer.from(str) });
      const crypto = { AES, enc: { Utf8: 'utf-8' } };

      const { payload: decrypted } = new CryptoService({
        libs: { crypto },
        env: { ENCRYPTION_KEY },
      }).decrypt({ args: encryptedStr });
      decrypted.should.be.eql(str);
      AES.decrypt.should.have.been.called.with(encryptedStr);
    });
  });

  describe('hash', () => {
    it('should hash a string', () => {
      const input = 'str';
      const hashedStr = 'hashed-str';
      const crypto = chai.spy.interface({ HmacSHA256: () => hashedStr });

      const { payload: resultingHash } = new CryptoService({
        libs: { crypto },
        env: { ENCRYPTION_KEY },
      }).hash({ args: input });

      resultingHash.should.be.eql(hashedStr);
      crypto.HmacSHA256.should.have.been.called.with(input, ENCRYPTION_KEY);
    });
  });
});
