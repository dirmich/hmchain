const crypto = require('crypto')
const buffer = require('buffer')

// Demo implementation of using `aes-256-gcm` with node.js's `crypto` lib.
const aes256gcm = (key) => {
  const ALGO = 'aes-256-gcm'

  // encrypt returns base64-encoded ciphertext
  const encrypt = (str) => {
    // Hint: the `iv` should be unique (but not necessarily random).
    // `randomBytes` here are (relatively) slow but convenient for
    // demonstration.
    const iv = Buffer.from(crypto.randomBytes(16), 'utf8')
    const cipher = crypto.createCipheriv(ALGO, key, iv)

    // Hint: Larger inputs (it's GCM, after all!) should use the stream API
    let enc = cipher.update(str, 'utf8', 'base64')
    enc += cipher.final('base64')
    return [enc, iv, cipher.getAuthTag()]
  }

  // decrypt decodes base64-encoded ciphertext into a utf8-encoded string
  const decrypt = (enc, iv, authTag) => {
    const decipher = crypto.createDecipheriv(ALGO, key, iv)
    decipher.setAuthTag(authTag)
    let str = decipher.update(enc, 'base64', 'utf8')
    str += decipher.final('utf8')
    return str
  }

  return {
    encrypt,
    decrypt,
  }
}

// const KEY = new Buffer(crypto.randomBytes(32), 'utf8');

// const aesCipher = aes256gcm(KEY);

// const [encrypted, iv, authTag] = aesCipher.encrypt('hello, world');
// const decrypted = aesCipher.decrypt(encrypted, iv, authTag);

// console.log(decrypted); // 'hello, world'

function _deriveKey(passwd, salt) {
  return crypto.pbkdf2Sync(passwd, salt, 10000, 32, 'sha256')
}

function _encryptWithKey(key, plainobj) {
  const cipher = aes256gcm(key)
  const [encrypted, iv, authTag] = cipher.encrypt(plainobj)
  //   console.log(encrypted, iv, authTag)
  return {
    data: encrypted,
    iv: iv.toString('base64'),
    tag: authTag.toString('base64'),
  }
}

function _decryptWithKey(key, encObj) {
  const cipher = aes256gcm(key)
  let dec = cipher.decrypt(encObj.data, encObj.iv, encObj.tag)
  return dec
}

function hm_encrypt(passwd, target) {
  let salt = crypto.randomBytes(32).toString('base64')
  let key = _deriveKey(passwd, salt)
  let enc = _encryptWithKey(key, JSON.stringify(target))
  let t = swap(enc.iv, salt)
  enc.iv = t.a
  enc.salt = t.b
  //   enc.salt = salt //.toString('base64')
  return JSON.stringify(enc)
}

function hm_decrypt(passwd, encStr) {
  try {
    let enc = JSON.parse(encStr)
    let t = swap(enc.iv, enc.salt)
    enc.iv = t.a
    enc.salt = t.b
    let salt = enc.salt //Buffer.from(enc.salt, 'base64')
    const key = _deriveKey(passwd, salt)
    //   let iv = Buffer.from(enc.iv, 'base64')
    //   let tag = Buffer.from(enc.tag, 'base64')
    //   let t = {
    //     data: enc.data,
    //     iv: Buffer.from(enc.iv, 'base64'),
    //     tag: Buffer.from(enc.tag, 'base64')
    //   }
    let res = JSON.parse(
      _decryptWithKey(key, {
        data: enc.data,
        iv: Buffer.from(enc.iv, 'base64'),
        tag: Buffer.from(enc.tag, 'base64'),
      })
    )
    return res
  } catch (e) {
    return null
  }
}

function swap(a, b) {
  let aa = a.substr(0, 10) + b.substr(10)
  let bb = b.substr(0, 10) + a.substr(10)
  return {
    a: aa,
    b: bb,
  }
}

function hm_salt(enc) {
  return swap(enc.iv, enc.salt).b
}

function hm_key(passwd, salt) {
  _deriveKey(passwd, salt)
}
module.export = { hm_encrypt, hm_decrypt, hm_salt }
// export { hm_encrypt, hm_decrypt, hm_salt }
// const obj = {
//   a: 1,
//   b: 2
// }
// const cobj = {
//   "data": "ZkkpNat4OdRGa2btgA==",
//   "iv": "+ftqBqwr7p0RChM8dfKXpg==",
//   "tag": "TOdv6bZqj5f11pt7STiF1Q==",
//   "salt": "1234"
// }

// // let c = swap(cobj.iv, cobj.tag)
// // let d = swap(c.a, c.b)
// // console.log(c, d, d.a == cobj.iv)
// // console.log(_encryptWithKey(_deriveKey('1234', '1234'), JSON.stringify(obj)))
// let enced = hm_encrypt('1234', obj)
// console.log(enced)
// console.log(hm_decrypt('1234', enced)) //JSON.stringify(enced)))
