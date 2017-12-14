const Ws = require('ws')
const cookie = require('cookie')
const store = require('./store')() 
module.exports = function({server, onConnection, onMessage, onClose, onError},storage,session){
  if(!server){
    return false
  }
  let wss = new Ws.Server({server})
  onMessage = onMessage || function (msg) {
    console.log(this)
    wss.clients.forEach(function each(client) {
      if (client !== this && client.readyState === Ws.OPEN) {
        client.send(msg);
      }
    });
  }
  onClose = onClose || function (code, message) {
    console.log(`[WebSocket] closed: ${code} - ${message}`);
  }
  onError = onError || function (err) {
    console.log('[WebSocket] error: ' + err);
  }
  wss.on('connection',async(ws,req)=>{
    var sql = 'SELECT * FROM __session_store'
    let selfCookie = cookie.parse(req.headers.cookie)
    let info = await store.get('koa:sess:'+selfCookie.sessionID)
    wsOnline(ws,wss,info)
    ws.on('close', onClose)
    ws.on('error', onError)
  })
  return wss
}
function wsOnline(ws,wss,user){
  ws.on('message', msg=>{
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === Ws.OPEN) {
        client.send(user.user+':'+msg);
      }
    });
  })
}