const debug = require('debug')('server:api')

module.exports = function(router) {
  router.get('/api/user/config', async ctx => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 401
      ctx.body = 'auth needed'
      return
    }

    const user = ctx.session.user
    const redis = ctx.redis

    const focusedRepos = await redis.get(`config:${user.id}`)

    debug(`get user: ${user.login}'s focused repos`, focusedRepos)

    ctx.set('Content-Type', 'application/json')
    ctx.body = focusedRepos || []
  })

  router.post('/api/user/config', async ctx => {
    if (!ctx.session || !ctx.session.user) {
      ctx.status = 401
      ctx.body = 'auth needed'
      return
    }

    const user = ctx.session.user
    const redis = ctx.redis

    const focusedRepos = await redis.set(`config:${user.id}`, ctx.request.body)

    debug(`set user: ${user.login}'s focused repos`, focusedRepos)

    ctx.set('Content-Type', 'application/json')
    ctx.body = {
      success: true,
      xi,
    }
  })
}
