<template>
  <div id="app">
    <el-row>
      <el-col :span="14" :offset="4">
        <div  class="list">
          <div v-for="(item,index) in list" :key="index" :class="item.class">
            <div class="time" v-if="item.time">{{item.time}}</div>
            <div class="avatar"><img :src="item.imgSrc"></div>
            <div class="info">
              <div class="message-who" v-if="item.name">{{item.name}}</div>
              <div class="message-content" v-if="item.content">{{item.content}}</div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
    <el-row class="margion-top-10">
      <el-col :span="13" :offset="4">
        <el-input v-model="content" class="input-with-select">
          <el-button @click="sendMessage" type="primary" slot="append" icon="el-icon-success">发送</el-button>
        </el-input>
      </el-col>
      <el-col :span="1" class="text-right">
        <el-button type="warning" @click="logout" v-if="isLogin" plain>注销</el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import moment from 'moment'
moment.locale('zh-cn')
export default {
  name: 'app',
  data () {
    return {
      websocket: {},
      content: '',
      isLogin: false,
      list: []
    }
  },
  mounted () {
    this.login()
    window.addEventListener('keyup', event => {
      if (event.keyCode === 13) {
        if (this.content) {
          this.sendMessage()
        }
      }
    })
  },
  methods: {
    login () {
      this.$axios.get('/api/session').then(({data: {code, msg}}) => {
        if (code === 300) {
          this.$prompt('请输入邮箱登录', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputPattern: /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@xjie.me/,
            inputErrorMessage: '邮箱格式不正确'
          }).then(({value}) => {
            this.$axios.post('/api/login', {email: value}).then(({data: {code, msg}}) => {
              if (code === 200) {
                this.$message({
                  message: msg,
                  type: 'success'
                })
                this.isLogin = true
                this.startConnect()
                return true
              }
              if (code === 401) {
                this.$message({
                  message: msg,
                  type: 'warning'
                })
                return true
              }
              if (code === 400) {
                this.$message.error(msg)
                return true
              }
            })
          })
          return false
        }
        this.startConnect()
        this.isLogin = true
      })
    },
    startConnect () {
      this.websocket = new WebSocket(`ws://${window.location.host}/api`)
      this.websocket.addEventListener('open', event => {
        this.$message({
          message: '连接到服务器',
          type: 'success'
        })
      })
      this.websocket.addEventListener('message', event => {
        let messages = JSON.parse(event.data).data
        if (messages.length === 1) {
          let difference = this.list.length ? messages[0].timeStamp - this.list[this.list.length - 1].timeStamp : 0
          if (difference >= 120000) {
            messages = [{time: moment().format('lll')}, ...messages]
          }
        }
        this.list.push(...messages)
      })
      this.websocket.addEventListener('close', event => {
        this.$message.error('断开链接')
      })
    },
    clearContent () {
      this.content = ''
    },
    sendMessage () {
      let myMsg = [{class: 'message self', imgSrc: '/src/assets/self.png', name: '这是你自己', content: this.content, timeStamp: (new Date()).getTime()}]
      let difference = this.list.length ? (new Date()).getTime() - this.list[this.list.length - 1].timeStamp : 0
      if (difference >= 120000) {
        myMsg = [{time: moment().format('lll')}, ...myMsg]
      }
      this.list.push(...myMsg)
      try {
        this.websocket.send(this.content)
      } catch (error) {
        this.$alert('提示', '与服务器断开连接，重新登录？', {
          cancelButtonText: '取消',
          confirmButtonText: '确定',
          callback: action => {
            this.startConnect()
          }
        })
      }
      this.clearContent()
    },
    async logout () {
      await this.websocket.close()
      await this.$axios.get('/api/logout').then(({data: {code}}) => {
        if (code === 200) {
          this.isLogin = false
          this.login()
        }
      })
    }
  }
}
</script>

<style scoped>
.list{
  min-height: 700px;
  padding: 5px;
  border: 1px solid #dcdfe6;
  overflow-y: auto;
  overflow-x: hidden;
  border-radius: 5px;
}
/* 时间 */
.time{
  width: 100%;
  margin-top: 10px;
  text-align: center;
  color: #8a8a8a
}
/* 气泡 */
.message{
  margin-top: 10px;
  display: flex;
  align-items:center;
  flex-direction:row；
}
.message-who{
  max-width: 100px;
  min-width: 50px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.message-content{
  word-break:break-all;
  max-width: 400px;
  min-height: 20px;
  padding: 10px;
  position: relative;
  background: #faf8f3;
  border: 1px solid #fbe2a0;
  border-radius: 5px;
}
.message .avatar{
  width: 50px;
  height: 50px;
  overflow: hidden;
  border-radius: 25px
}
/* 其他人的气泡 */
.other{
  width: 100%;
}
.other .message-who{
  text-align: left;
  margin-left: 10px;
}
.other .message-content{
  margin-left: 6px;
}
.other .message-content:after{
  content: '';
  width: 8px;
  height: 8px;
  position: absolute;
  top: 10px;
  left: -5px;
  transform: rotate(45deg);
  background-color: #faf8f3;
  border: 1px #fbe2a0;
  border-style: none none solid solid;
}
/*自己的气泡*/
.self{
  width: 100%;
  display: flex;
  flex-direction: row-reverse
}
.self .message-who{
  text-align: right;
  margin-right: 10px;
}
.self .message-content{
  margin-right: 6px;
}
.self .message-content:after{
  content: '';
  width: 8px;
  height: 8px;
  position: absolute;
  top: 10px;
  right: -5px;
  transform: rotate(45deg);
  background-color: #faf8f3;
  border: 1px #fbe2a0;
  border-style: solid solid none none;
}
/* 公共样式 */
.text-right{
  text-align: right
}
.margion-top-10{
  margin-top: 10px
}
</style>
