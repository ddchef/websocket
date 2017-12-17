const Ws = require('ws')
const cookie = require('cookie')
const store = require('./store')()
module.exports = function ({server}) {
  if (!server) {
    return false
  }
  let wss = new Ws.Server({server})
  let wsMap = new Map()
  wss.on('connection', async(ws, req) => {
    let {sessionID} = cookie.parse(req.headers.cookie)
    if (!sessionID) {
      ws.close(400, '请登录')
      return
    }
    let hasWs = wsMap.get(sessionID)
    if (hasWs) {
      hasWs.close()
    }
    let info = await store.get(sessionID)
    console.log(`${info.email}连接成`)
    wsMap.set(sessionID, wsOnline(ws, wss, info))
  })
}
function wsOnline (ws, wss, user) {
  ws.on('message', msg => {
    console.log(`Received(${user.email}):` + msg)
    wss.clients.forEach(function each (client) {
      if (client !== ws && client.readyState === Ws.OPEN) {
        client.send(JSON.stringify({data: [{class: 'message other', imgSrc: '/src/assets/other.png', name: user.email, content: msg, timeStamp: (new Date()).getTime()}]}))
      }
    })
  })
  ws.on('close', () => {
    console.log(`${user.email}断开连接`)
  })
  ws.on('error', () => {
    console.log(`${user.email}连接错误`)
  })
  return {
    close: () => {
      ws.close()
    }
  }
}
