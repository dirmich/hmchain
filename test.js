const utils = require('./utils')

const str = 'hello'
const obj = {
  a: 1,
  b: 'hello',
  c: [1, 2, 3],
}
const k = utils.keypair()
const sa = utils.sign(k.private, str)
const da = utils.verify(k.public, str, sa)
console.log(sa, da)
const sb = utils.sign(k.private, obj)
const db = utils.verify(k.public, obj, sb)
console.log(sb, db)
