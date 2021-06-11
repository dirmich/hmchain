const crypto = require('crypto')
const keypair = require('keypair')

const HASH_ALG = 'sha256'
const SIGN_ALG = 'RSA-SHA256'
const hash = (plain, encoding = 'hex') =>
  crypto.createHash(HASH_ALG).update(plain).digest(encoding)

module.exports = {
  hash,
  keypair,
  sign: (skey, msg) =>
    crypto
      .createSign(SIGN_ALG)
      .update(typeof msg === 'object' ? JSON.stringify(msg) : '' + msg)
      .sign(skey, 'hex'),
  verify: (pkey, msg, sig) =>
    crypto
      .createVerify(SIGN_ALG)
      .update(typeof msg === 'object' ? JSON.stringify(msg) : '' + msg)
      .verify(pkey, sig, 'hex'),
  calcAddr: (key) => hash('' + key, 'base64'),
}
