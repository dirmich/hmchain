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
    // sw.leave(cfg.NET_NAME)
    sw.on('peer', (peer) => {
      debug('on peer', peer)
    })
    sw.on('drop', (peer) => {
      debug('on drop', peer)
    })
    sw.on('connecting', (peer) => {
      debug('on connecting', peer)
    })
    sw.on('peer-banned', (peer, detail) => {
      debug('on peer-banned', peer, detail)
    })
    sw.on('peer-rejected', (peer, detail) => {
      debug('on peer-rejected', peer, detail)
    })
    sw.on('connect-failed', (peer, detail) => {
      debug('on connect-failed', peer, detail)
    })
    sw.on('handshaking', (conn, data) => {
      debug('on handshaking', conn, data)
    })
    sw.on('handshake-timeout', (conn, data) => {
      debug('on handshake-timeout', conn, data)
    })
    sw.on('connection-closed', (conn, data) => {
      debug('on connection-closed', conn, data)
    })
    sw.on('redundant-connection', (conn, data) => {
      debug('on redundant-connection', conn, data)
    })

    sw.on('connection', (conn, data) => {
      const seq = this.seq
      const peerid = data.id.toString('hex')
      info(`Connected #${seq} => ${peerid}`)
      info('conn', conn)
      info('data', data)
      if (data.initiator) {
        try {
          conn.setKeepAlive(true, 600)
        } catch (e) {
          err('ERR', e)
        }
      } else {
        // conn.send('hello')
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
