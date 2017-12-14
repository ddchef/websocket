const SQLiteStore = require('koa-sqlite3-session')
let store = undefined;
module.exports = ()=>{
  store = store || new SQLiteStore('sqlite.db')
  return store
}