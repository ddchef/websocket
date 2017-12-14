<template>
  <div id="app">
    <el-row :gutter="20">
      <el-col :span="12" :offset="6">
        <el-input class="input-with-select">
          <el-button type="primary" slot="append" icon="el-icon-success"></el-button>
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
    }
  },
  methods: {
    async get(){
      this.$axios.post('/api/login')
    }
  }
}
</script>
