const debug = require('debug')('server:auth')
const axios = require('axios')

const config = require('../config')

module.exports = function(router) {
  router.get('/auth', async ctx => {
    const code = ctx.query.code
    if (!code) {
      // 错误处理
    }
    const result = await axios({
      method: 'POST',
      url: 'https://github.com/login/oauth/access_token',
      data: {
        client_id: config.github.clientId,
        client_secret: config.github.clientSecret,
        code,
      },
      headers: {
        Accept: 'application/json',
      },
    })

    debug(
      `request github auth with code ${code} status ${result.status} and data `,
      result.data,
    )
    if (result.status === 200) {
      ctx.session.githubAuth = result.data
      const userInfo = await axios.get(
        `https://api.github.com/user?access_token=${result.data.access_token}`,
      )
      ctx.session.user = userInfo.data
      ctx.status = 302
      ctx.set('Location', '/')
    }
  })

  router.post('/logout', async ctx => {
    ctx.session = null
    ctx.body = 'success'
  })
}
