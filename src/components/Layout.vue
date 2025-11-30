<template>
  <el-container style="height: 100vh;">
    <!-- 侧边栏 -->
    <el-aside width="200px" style="background: #2d3a4b; color: #fff;">
      <div class="logo">管理后台</div>
      <el-menu
        :default-active="active"
        class="el-menu-vertical-demo"
        background-color="#2d3a4b"
        text-color="#fff"
        active-text-color="#ffd04b"
        @select="onMenuSelect"
      >
      <el-menu-item index="employees">员工</el-menu-item>
        <el-menu-item index="daily">考勤</el-menu-item>
        <el-menu-item index="monthly">月度</el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主体内容 -->
    <el-main style="background: #f5f7fa; padding: 20px; overflow:auto;">
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const active = ref('monthly')

onMounted(() => {
  // 根据路径高亮
  active.value = route.path.includes('daily') ? 'daily' : 'monthly'
})

function onMenuSelect(index) {
  if (index === 'monthly') router.push('/monthly')
  else if (index === 'daily') router.push('/daily')
  else if (index === 'employees') router.push('/employees')
}
</script>

<style scoped>
.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
}
.el-menu-vertical-demo .el-menu-item {
  color: #fff !important;
}
.el-menu-vertical-demo .el-menu-item.is-active {
  background-color: #1f2a38 !important;
}
</style>
