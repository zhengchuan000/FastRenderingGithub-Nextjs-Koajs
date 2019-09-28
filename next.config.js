const withCss = require('@zeit/next-css')
const withBundleAnalyzer = require('@zeit/next-bundle-analyzer')

const config = require('./config')

if (typeof require !== 'undefined') {
  require.extensions['.css'] = file => {}
}

const isDev = process.env.NODE_ENV === 'development'

const GITHUB_AUTH_BASE_URL = 'https://github.com/login/oauth/authorize'
const GITHUB_CLIENT_ID = config.github.clientId
const REDIRECT_URI = isDev
  ? 'http://localhost:3000/auth'
  : 'http://nextjs.w2deep.com/auth'
const SCOPE = 'user'

const AUTH_URI = `${GITHUB_AUTH_BASE_URL}?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}`

const API_BASE = isDev ? 'http://localhost:3000' : 'http://nextjs.w2deep.com'

module.exports = withBundleAnalyzer(
  withCss({
    env: 
      GITHUB_AUTH_URI: AUTH_URI,
      API_BASE,
    },
    analyzeServer: ['server', 'both'].includes(process.env.BUNDLE_ANALYZE),
    analyzeBrowser: ['browser', 'both'].includes(process.env.BUNDLE_ANALYZE),
    bundleAnalyzerConfig: {
      server: {
        analyzerMode: 'static',
        reportFilename: '../bundles/server.html',
      },
      browser: {
        analyzerMode: 'static',
        reportFilename: '../bundles/client.html',
      },
    },
  }),
)
