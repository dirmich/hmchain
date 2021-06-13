const { keystore } = require('jcc_eth_lightwallet')
const { hm_encrypt, hm_decrypt, hm_salt } = require('./cryptoutil')

class Wallet {
  constructor() {
    // if (this.instance) return this.instance
    // this.instance = this
    this.keystore = null
    this.pkey = null
    this.user = null
  }

  addressList() {
    return this.keystore.getAddresses()
  }

  addAccount() {}

  create({ password, seedPhrase, ...opt }) {
    //
    const option = {
      password,
      seedPhrase,
      ...{
        salt: keystore.generateSalt(32),
        hdPathString: "m/44'/60'/0'/0",
      },
      ...opt,
    }
    // console.log('option', option)
    return new Promise((resolve, reject) => {
      keystore.createVault(option, (e, ks) => {
        if (e) reject({ err: e, msg: 'creation' })
        else {
          ks.keyFromPassword(password, (e, pdkey) => {
            if (e) reject({ err: e, msg: 'key' })
            else {
              this.password = password
              ks.generateNewAddress(pdkey, 1)
              ks.passwd = password
              //   resolve({ ks, enc })
              this.keystore = ks
              this.pkey = Buffer.from(pdkey, 'hex')
              this.pdkey = pdkey
              //   const enc = hm_encrypt(password, ks.serialize())
              resolve(this)
            }
          })
        }
      })
    })
  }

  showSeed() {
    // this.keystore.keyFromPassword(this.password, (e, pdkey) => {
    //   console.log('==>', this.keystore.getSeed(pdkey))
    // })
    return this.keystore.getSeed(this.pdkey)
  }

  getEcnrypted() {
    return hm_encrypt(this.password, this.keystore.serialize())
  }

  open(enc, password) {
    const dec = hm_decrypt(password, enc)
    return new Promise((resolve, reject) => {
      try {
        if (!dec) throw 'not authorized'
        else {
          const rk = keystore.deserialize(dec)
          rk.keyFromPassword(password, (e, pdkey) => {
            if (e) throw e
            else {
              rk.passwd = password
              this.keystore = rk
              this.password = password
              this.pkey = Buffer.from(pdkey, 'hex')
              this.pdkey = pdkey
              resolve(this)
            }
          })
        }
      } catch (e) {
        reject({ err: true, msg: e })
      }
    })
  }
}

// module.exports = new Wallet()
module.exports = Wallet
