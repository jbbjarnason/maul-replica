module.exports = {
  transpileDependencies: [
    'vuetify'
  ],
  publicPath: process.env.NODE_ENV === 'production' && process.env.DEPLOY_ENV === 'GH_PAGES'
    ? '/maul-replica/'
    : '/'
}
