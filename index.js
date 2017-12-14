const Koa = require('koa')
const path = require('path')
const koaBody = require('koa-bodyparser')
const session = require('koa-generic-session')
const koaStatic = require('koa-static')
const Router = require('koa-router')
const wss = require('./server/ws')
let app = new Koa()
let router = new Router()
app.use(koaBody())
app.use(session({
  key: 'sessionID',
  store: require('./server/store')(),
  cookie: {
    maxAge: 1000 * 60 * 2,
    overwrite: false
  }
}))
app.use(koaStatic(path.join(__dirname, './web')))
router.get('/api/session', async (ctx, next) => {
  console.log(ctx.session.email)
  if (ctx.session.email) {
    ctx.body = {code: 401, msg: `已登录`}
    return
  }
  ctx.body = {code: 300, msg: '未登录'}
})
router.post('/api/login', async (ctx, next) => {
  if (ctx.session.email) {
    ctx.body = {code: 401, msg: `${ctx.session.email},请勿重复登录！`}
    return
  }
  let {email} = ctx.request.body
  if (!email) {
    ctx.body = {code: 400, msg: `请输入正确的邮箱`}
    return
  }
  ctx.session = {email: email}
  ctx.response.body = {code: 200, msg: '登录成功'}
})
app.use(router.routes())
.use(router.allowedMethods)
let server = app.listen(8001, () => {
  console.log('starting 8001')
})
app.wss = wss({server})
