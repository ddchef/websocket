const Ws = require('ws')
const cookie = require('cookie')
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db.db');
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
  wss.on('connection',(ws,req)=>{
    var sql = 'SELECT * FROM __session_store WHERE id=$id'
    let selfCookie = cookie.parse(req.headers.cookie)
    db.get(sql,{$id:selfCookie.sessionID},(err,data)=>{
      console.log(data)
    })
    console.log(selfCookie.sessionID)
    ws.on('message', msg=>{
      console.log(msg)
      wss.clients.forEach(function each(client) {
        if (client !== ws && client.readyState === Ws.OPEN) {
          client.send(msg);
        }
      });
    })
    ws.on('close', onClose)
    ws.on('error', onError)
  })
  return wss
}