<template>
  <div class="container">
    <div class="header">
      <h2>员工列表</h2>
    </div>
    <el-card class="card-form">
      <!-- 顶部操作栏 -->
      <div class="toolbar" style="display:flex; gap:12px; align-items:center; margin-bottom:12px;">
        <el-input v-model="q" placeholder="搜索姓名" clearable style="width:220px" />
        <el-button type="primary" @click="openAdd">新增员工</el-button>
      </div>

      <!-- 员工表格 -->
      <el-table :data="filtered" style="width:100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="text" size="small" @click="openEdit(row)">编辑</el-button>
            <el-button type="text" size="small" style="color:red" @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 新增 / 编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="editing.id ? '编辑员工' : '新增员工'">
      <el-form :model="editing">
        <el-form-item label="姓名">
          <el-input v-model="editing.name" placeholder="请输入姓名" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getEmployees, addEmployee, updateEmployee, deleteEmployee,deleteRecord ,getRecordsByEmployee } from '../api'

// 搜索关键字
const q = ref('')
// 员工列表
const list = ref([])
// 弹窗控制
const dialogVisible = ref(false)
// 当前编辑对象
const editing = ref({})

// 加载员工列表
async function load() {
  try {
    list.value = await getEmployees()
  } catch (err) {
    ElMessage.error('加载失败')
    console.error(err)
  }
}

onMounted(load)

// 实时搜索过滤
const filtered = computed(() => {
  if (!q.value) return list.value
  return list.value.filter(i => i.name.includes(q.value))
})

// 打开新增弹窗
function openAdd() {
  editing.value = { name: '' }
  dialogVisible.value = true
}

// 打开编辑弹窗
function openEdit(row) {
  editing.value = { ...row }
  dialogVisible.value = true
}

// 保存（新增 / 编辑）
async function save() {
  if (!editing.value.name) return ElMessage.error('请输入姓名')
  try {
    if (editing.value.id) {
      await updateEmployee(editing.value.id, { name: editing.value.name })
      ElMessage.success('已更新')
    } else {
      await addEmployee({ name: editing.value.name })
      ElMessage.success('已新增')
    }
    dialogVisible.value = false
    await load()
  } catch (err) {
    ElMessage.error('操作失败')
    console.error(err)
  }
}

// 删除员工
async function remove(row) {
  try {
    // 二次确认
    await ElMessageBox.confirm(
      `确定要删除员工 "${row.name}" 及其所有打卡记录吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    // 删除员工
    await deleteEmployee(row.id)

    // 删除该员工的打卡记录
    const records = await getRecordsByEmployee(row.id)
    if (records.length) {
      await Promise.all(records.map(r => deleteRecord(r.id)))
    }

    ElMessage.success('已删除员工及其打卡记录')
    await load() // 刷新员工列表

  } catch (err) {
    // 用户取消不提示
    console.log(err);
    
    if (err !== 'cancel') {
      ElMessage.error('删除失败')
      console.error(err)
    }
  }
}

</script>

<style scoped>
.container{padding:16px;background:#f5f7fa;}
.header { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; }
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
</style>
