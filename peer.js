const crypto = require('crypto')
const Swarm = require('discovery-swarm')
const defaults = require('dat-swarm-defaults')
const getPort = require('get-port')
const cfg = require('./config')
const info = console.log
const debug = console.log
const err = console.log

class Peer {
  constructor(addr) {
    this.id = addr || crypto.randomBytes(32).toString('hex')

    this.init()
  }

  async init() {
    this.peers = []
    this.seq = 0

    const sw = Swarm({ id: this.id })
    const port = await getPort()
    this.port = port
    sw.listen(port)
    info(`Listening to ${port}: ${this.id}`)
    sw.join(cfg.NET_NAME)

    sw.on('connection', (conn, data) => {
      const seq = this.seq
      const peerid = data.id.toString('hex')
      info(`Connected #${seq} => ${peerid}`)
      info('data', data)
      if (data.initiator) {
        try {
          conn.setKeepAlive(true, 600)
        } catch (e) {
          err('ERR', e)
        }
      } else {
        conn.send('hello')
      }

      conn.on('data', (d) => {
        debug('recv:', d)
      })
      conn.on('close', () => {
        info(`Connection #${seq} : ${peerid}`)
        if (this.peers[peerid].seq === seq) {
          delete this.peers[peerid]
        }
      })
      if (!this.peers[peerid]) this.peers[peerid] = {}
      this.peers[peerid].seq = seq
      this.peers[peerid].conn = conn
      this.seq++
    })

    this.sw = sw
  }
}

module.exports = Peer
