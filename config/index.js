const config = {
  common: {},
  dev: {
    NET_NAME: 'testnet.highmaru.com',
  },
  prod: {
    NET_NAME: 'mainnet.highmaru.com',
  },
}

const env = process.env.NODE_ENV || 'dev'
console.log('[ENV]', env) //, { ...config.common, ...config[env] })
module.exports = { dev: env === 'dev', ...config.common, ...config[env] }
