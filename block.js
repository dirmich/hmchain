'use strict'
const utils = require('./utils')

class Block {
  constructor(commiter, prevBlock) {
    this.prevHash = prevBlock ? prevBlock.hash() : null
    this.transactions = []
    this.height = prevBlock ? prevBlock.height + 1 : 1
    this.commiter = commiter
  }

  isGenesis() {
    return !this.prevBlock
  }

  hash() {
    return utils.hash(Block.serialize(this))
  }

  addTransaction(tx) {
    this.transactions.push(tx)
  }

  static serialize(block) {
    const { transactions, commiter, height, timestamp } = block
    return JSON.stringify({ transactions, commiter, height, timestamp })
  }

  static deserialize(str) {
    let b = new Block()
    let o = JSON.parse(str)
    b.prevHash = o.prevHash
    b.commiter = o.commiter
    b.height = parseInt(o.height)
    b.timestamp = o.timestamp
    o.transactions.forEach(([id, content]) => b.addTransaction(content))
  }
}
