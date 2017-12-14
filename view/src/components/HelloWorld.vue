<template>
  <div class="hello">
    <el-input class="input-with-select">
      <el-button icon="el-icon-success"></el-button>
    </el-input>
    <el-button @click="get">请求</el-button>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  },
  methods:{
    get(){
      this.$axios({
        method: 'get',
        url: '/api/session'
      }).then(data=>{

      })
    }
  }
}
</script>
