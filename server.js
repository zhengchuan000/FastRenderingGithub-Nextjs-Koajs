const Koa = require('koa')
const next = require('next')
const Router = require('koa-router')
const axios = require('axios')
const Redis = require('ioredis')
const session = require('koa-session')
const atob = require('atob')
const debug = require('debug')('server:main')

const RedisSessionStore = require('./server/session-store')
const config = require('./config')

const auth = require('./server/auth')
const api = require('./server/api')

const github = require('./server/github')

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

// 需要开启数据库就解除这个注释
// const redis = new Redis(config.redis)

global.atob = atob

app.prepare().then(() => {
  const server = new Koa()
  const router = new Router()

  // server.set('githubClientId', GITHUB_CLIENT_ID)
  // server.set('githubClientSecret', GITHUB_CLIENT_SECRET)

  server.keys = config.keys

  const SESSION_CONFIG = {
    key: 'jid',
    // 需要开启数据库就解除这个注释
    // store: new RedisSessionStore(redis),
  }

  server.use(async (ctx, next) => {
    const path = ctx.path
    // ctx.redis = redis
    debug(`request come: ${path}`)
    if (path.startsWith('/_next')) {
      await handle(ctx.req, ctx.res)
      ctx.respond = false
    } else {
      await next()
    }
  })

  // use koa-session
  server.use(session(SESSION_CONFIG, server))

  server.use(async (ctx, next) => {
    try {
      // debug('session is', ctx.session)
      await next()
    } catch (error) {
      debug(error)
      ctx.res.statusCode = 500
      ctx.body = `Error: ${error.stack}`
    }
  })

  const github_base_url = 'https://api.github.com'
  server.use(async (ctx, next) => {
    const path = ctx.path
    if (path.startsWith('/github/')) {
      // const githubPath = `${github_base_url}${path.replace('/github/', '/')}`
      // const headers = {}
      // if (ctx.session.githubAuth) {
      //   headers['Authorization'] = `token ${
      //     ctx.session.githubAuth.access_token
      //   }`
      // }
      // debug(`proxy to ${githubPath}, with headers:`, headers, ctx.session.githubAuth)
      // const { status, data } = await axios({
      //   method: ctx.method,
      //   url: githubPath,
      //   headers,
      // })
      const { status, data } = await github(
        path,
        ctx.session.githubAuth && ctx.session.githubAuth.access_token,
      )
      if (status === 200) {
        ctx.set('Content-Type', 'application/json')
        ctx.body = data
      }
    } else {
      await next()
    }
  })

  auth(router)
  api(router)

  router.get('*', async ctx => {
    ctx.req.session = ctx.session
    // handle的API在这里
    // https://github.com/zeit/next.js/blob/canary/packages/next-server/server/next-server.ts
    await handle(ctx.req, ctx.res)
    ctx.respond = false
  })

  server.use(async (ctx, next) => {
    ctx.res.statusCode = 200
    await next()
  })

  server.use(router.routes())
  server.listen(port, () => {
    debug(`> Ready on http://localhost:${port}`)
  })
})
