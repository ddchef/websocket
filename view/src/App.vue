<template>
  <div id="app">
    <el-row :gutter="20">
      <el-col :span="12" :offset="6">
        <el-input v-model="content" class="input-with-select">
          <el-button @click="sendMessage" type="primary" slot="append" icon="el-icon-success">发送</el-button>
        </el-input>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'app',
  data () {
    return {
      websocket: {},
      content: ''
    }
  },
  mounted () {
    this.$axios.get('/api/session').then(({data: {code, msg}}) => {
      if (code === 300) {
        this.$prompt('请输入邮箱登录', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/,
          inputErrorMessage: '邮箱格式不正确'
        }).then(({value}) => {
          this.$axios.post('/api/login', {email: value}).then(({data: {code, msg}}) => {
            if (code === 200) {
              this.$message({
                message: msg,
                type: 'success'
              })
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
      }
    })
  },
  methods: {
    startConnect () {
      this.websocket = new WebSocket(`ws://${window.location.host}/api`)
      this.websocket.addEventListener('open', event => {
        this.$message({
          message: '连接到服务器',
          type: 'success'
        })
      })
      this.websocket.addEventListener('message', event => {
        this.$notify.info({
          title: '消息',
          message: event.data
        })
      })
      this.websocket.addEventListener('close', event => {
        this.$message.error('断开链接')
      })
    },
    clearContent () {
      this.content = ''
    },
    sendMessage () {
      this.websocket.send(this.content)
      this.clearContent()
    }
  }
}
</script>
