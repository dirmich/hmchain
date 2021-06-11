// const utils = require('./utils')

// const str = 'hello'
// const obj = {
//   a: 1,
//   b: 'hello',
//   c: [1, 2, 3],
// }
// const k = utils.keypair()
// const sa = utils.sign(k.private, str)
// const da = utils.verify(k.public, str, sa)
// console.log(sa, da)
// const sb = utils.sign(k.private, obj)
// const db = utils.verify(k.public, obj, sb)
// console.log(sb, db)

// const Peer = require('./peer')
// const p = new Peer()
// const mdns = require('mdns')

// const ad = mdns.createAdvertisement(mdns.tcp('hello'), 3456)
// ad.start()

// const worker = mdns.createBrowser(mdns.tcp('hello'))

// worker.on('serviceUp', (service) => {
//   console.log('UP: ', service)
// })

// worker.on('serviceDown', (service) => {
//   console.log('DOWN: ', service)
// })

// worker.start()

var mdns = require('mdns-js')
//if you have another mdns daemon running, like avahi or bonjour, uncomment following line
//mdns.excludeInterface('0.0.0.0');

var browser = mdns.createBrowser()

browser.on('ready', function () {
  browser.discover()
})

browser.on('update', function (data) {
  if (data.type.filter((i) => i.name === 'hello').length > 1)
    console.log('data:', data)
})
