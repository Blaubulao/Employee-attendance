<template>
  <el-card class="mt-20">
    <h3>今日记录列表</h3>

    <el-table :data="records" border style="width: 100%; margin-top: 10px;">
      <el-table-column prop="date" label="日期" width="120" />
      <el-table-column prop="name" label="姓名" width="100" />
      <el-table-column prop="startTime" label="上班时间" width="100" />
      <el-table-column prop="endTime" label="下班时间" width="100" />
      <el-table-column prop="workHours" label="工作时长(小时)" width="120" />
      <el-table-column prop="overtimeHours" label="加班(小时)" width="120" />
      <el-table-column prop="remark" label="备注" />

      <el-table-column label="操作" width="160">
        <template #default="{ row }">
          <el-button type="primary" link @click="openEdit(row)">编辑</el-button>
          <el-button type="danger" link @click="deleteRecord(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>


    <!-- 编辑弹窗 -->
    <el-dialog v-model="editVisible" title="编辑记录" width="400px">
      <el-form :model="editForm" label-width="90px">
        <el-form-item label="日期">
          <el-date-picker v-model="editForm.date" type="date" value-format="YYYY-MM-DD" />
        </el-form-item>

        <el-form-item label="姓名">
          <el-select v-model="editForm.name">
            <el-option v-for="u in users" :key="u" :label="u" :value="u" />
          </el-select>
        </el-form-item>

        <el-form-item label="上班时间">
          <el-time-picker v-model="editForm.startTime" format="HH:mm" />
        </el-form-item>

        <el-form-item label="下班时间">
          <el-time-picker v-model="editForm.endTime" format="HH:mm" />
        </el-form-item>

        <el-form-item label="备注">
          <el-input v-model="editForm.remark" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmEdit">保存</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'
import { loadRecords, saveRecords, deleteRecord as deleteFromStorage } from '../utils/storage'
import { calcHours } from '../utils/calcHours'

defineProps({
  records: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['edit', 'delete'])

const users = ['小雅','刘春芳','陈晓兰','陈晓文','况青']

// 编辑弹窗
const editVisible = ref(false)
const editForm = ref({})

function openEdit(row) {
  editForm.value = { ...row } // 深拷贝
  editVisible.value = true
}

// 保存编辑后的数据
function confirmEdit() {
  const { totalHours, workHours, overtimeHours } = calcHours(
    editForm.value.startTime,
    editForm.value.endTime
  )

  editForm.value.totalHours = totalHours
  editForm.value.workHours = workHours
  editForm.value.overtimeHours = overtimeHours

  // 更新本地
  const all = loadRecords().map((item) =>
    item.id === editForm.value.id ? editForm.value : item
  )
  saveRecords(all)

  // 通知父组件刷新数据
  emit('edit')

  editVisible.value = false
}

// 删除
function deleteRecord(id) {
  deleteFromStorage(id)
  emit('delete')
}
</script>

<style scoped>
.mt-20 {
  margin-top: 20px;
}
</style>
