const bc = require('bitcoinjs-lib')

const hash = (plain) => bc.crypto.hash256(Buffer.from(plain))
const keypair = () => {
  const kp = bc.ECPair.makeRandom()
  return {
    skey: kp.toWIF(),
    pkey: kp.publicKey.toString('hex'),
    private: kp.toWIF(),
    public: kp.publicKey.toString('hex'),
  }
}

module.exports = {
  hash,
  keypair,
  sign: (skey, mac) => bc.ECPair.fromWIF(skey).sign(mac),
  verify: (pkeyhex, mac, sig) =>
    bc.ECPair.fromPublicKey(Buffer.from(pkeyhex, 'hex')).verify(mac, sig),
  calcAddr: (kp) => {
    const { address } = bc.payments.p2pkh({ pubkey: kp.publicKey })
    return address
  },
  calcAddrFromHex: (pkeyhex) => {
    const { address } = bc.payments.p2pkh({
      pubkey: bc.ECPair.fromPublicKey(Buffer.from(pkeyhex, 'hex')).publicKey,
    })
    return address
  },
}
