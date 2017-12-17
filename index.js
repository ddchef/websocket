const Koa = require('koa')
const path = require('path')
const koaBody = require('koa-bodyparser')
const session = require('koa-session')
const koaStatic = require('koa-static')
const Router = require('koa-router')
const store = require('./server/store')()
const wss = require('./server/ws')
let app = new Koa()
let router = new Router()
app.keys = ['what']
app.use(koaBody())
app.use(session({
  key: 'sessionID',
  store: store,
  cookie: {
    path: '/',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    overwrite: true,
    signed: true
  }
}, app))
app.use(koaStatic(path.join(__dirname, './web')))
router.get('/api/session', async (ctx, next) => {
  let key = ctx.cookies.get('sessionID')
  let UserSession = await store.get(key)
  if (UserSession && UserSession.email) {
    ctx.body = {code: 401, msg: `已登录`}
    return
  }
  ctx.body = {code: 300, msg: '未登录'}
})
router.post('/api/login', async (ctx, next) => {
  if (ctx.session.isNew) {
    let {email} = ctx.request.body
    ctx.session.email = email
    ctx.body = {code: 200, msg: '登录成功'}
    return true
  }
  ctx.body = {code: 301, msg: '请勿重复登录'}
})
router.get('/api/logout', async (ctx, next) => {
  ctx.session = null
  ctx.body = {code: 200, msg: '注销成功'}
})
app.use(router.routes())
.use(router.allowedMethods)
let server = app.listen(8001, () => {
  console.log('starting 8001')
})
app.wss = wss({server})
