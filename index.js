const Koa = require('koa')
const path = require('path')
const koaBody = require('koa-bodyparser')
const session = require('koa-generic-session')
const static = require('koa-static')
const render = require('koa-swig')
const Router = require('koa-router')
const SQLiteStore = require('koa-sqlite3-session')
const wss = require('./server/ws')
const WebSocket = require('ws')
let app = new Koa()
let router = new Router()
let storage = [];
function filter(email){
  let user = storage.map(item=>{
    if(item.email == email){
      return item
    }
  })
  if(user.length>0){
    return user[0]
  }
  return false
}
function storageInfo ({user,email}){
  storage.push({user,email})
}
app.use(koaBody())
app.use(session({
  key:"sessionID",
  store: new SQLiteStore('sqlite.db'),
  cookie:{
    maxAge: 1000*60*2,   
    expires: '',  
    path: '',     
    domain: '',   
    httpOnly: '', 
    overwrite: false,
    secure: '',
    sameSite: '',
    signed: '',
  }
}))
app.use(static(path.join(__dirname,'./web')))
router.get('/session',async (ctx,next)=>{
  if(ctx.session.user){
    ctx.body = {code:401,msg:`已登录`}
    console.log(ctx.session)
    return;
  }
  ctx.body = {code:300,msg:'未登录'}
})
router.post('/login',async (ctx,next)=>{
  if(ctx.session.user){
    ctx.body = {code:401,msg:`${user},请勿重复登录！`}
    return;
  }
  let {user,email} = ctx.request.body
  if(!user||!email){
    ctx.body = {code:400,msg:`请输入正确的用户名和邮箱`}
    return;
  }
  let userInfo = filter(email)
  if(userInfo){
    ctx.session={user:userInfo.user,email:userInfo.email}
  }
  if(!userInfo){
    storageInfo({user,email})
    ctx.session={user:user,email:user}
  }
  ctx.response.body={code:200,msg:'success'}
})
app.use(router.routes())
.use(router.allowedMethods)
let server = app.listen(8001,()=>{
  console.log('starting 8001')
})
app.wss = wss({server},storage,session)