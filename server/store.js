const SQLiteStore = require('koa-sqlite3-session')
let store
module.exports = () => {
  store = store || new SQLiteStore('sqlite.db')
  return store
}
