<template>
  <div class="container">
    <!-- 顶部 -->
    <div class="header">
      <h2>每天签到 / 历史记录</h2>
    </div>

    <div class="main-layout">
      <!-- 左侧：表单 -->
      <div class="left-panel">
        <el-card class="card-form">
          <el-form :model="form" label-width="90px">
            <el-form-item label="日期">
              <el-date-picker v-model="form.date" type="date" value-format="YYYY-MM-DD" style="width:200px;"
                @change="onDateChange" />
            </el-form-item>

            <el-form-item label="姓名">
              <el-select v-model="form.employeeId" placeholder="选择人员" style="width:200px;">
                <el-option v-for="emp in availableEmployees" :key="emp.id" :label="emp.name" :value="emp.id" />
              </el-select>
            </el-form-item>

            <el-form-item label="上班时间">
              <el-time-picker v-model="form.startTime" format="HH:mm" value-format="HH:mm" placeholder="可留空表示休息"
                :disabled-minutes="disableMinutes" style="width:200px;" />
            </el-form-item>

            <el-form-item label="下班时间">
              <el-time-picker v-model="form.endTime" format="HH:mm" value-format="HH:mm" placeholder="可留空表示休息"
                :disabled-minutes="disableMinutes" style="width:200px;" />
            </el-form-item>

            <el-form-item label="备注">
              <el-input v-model="form.remark" placeholder="可选" style="width:300px;" />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="addRecord">保存</el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>

      <!-- 右侧：筛选 + 表格 -->
      <div class="right-panel">
        <el-card class="card-filter">
          <div class="filter-bar">
            <el-select v-model="searchEmployeeId" placeholder="按姓名搜索" clearable style="width:200px;">
              <el-option v-for="emp in employees" :key="emp.id" :label="emp.name" :value="emp.id" />
            </el-select>

            <el-date-picker v-model="searchMonth" type="month" value-format="YYYY-MM" placeholder="选择月份"
              style="width:200px;" @change="refreshRecords" />
            <el-button type="primary" @click="refreshRecords">刷新</el-button>
            <el-button :disabled="filteredRecords.length === 0" @click="exportExcelFile">导出 Excel</el-button>
          </div>
        </el-card>

        <div class="table-wrapper">
          <el-card class="card-table">
            <el-table :data="filteredRecords" border stripe :span-method="mergeDateCells">
              <el-table-column prop="date" label="日期" width="120" />
              <el-table-column prop="name" label="姓名" width="100" />
              <el-table-column prop="startTime" label="上班" width="100" />
              <el-table-column prop="endTime" label="下班" width="100" />
              <el-table-column prop="totalHours" label="总时长" width="100" />
              <el-table-column prop="workHours" label="正常(小时)" width="120" />
              <el-table-column prop="overtimeHours" label="加班(小时)" width="120" />
              <el-table-column prop="remark" label="备注" />
              <el-table-column label="操作" width="140" fixed="right">
                <template #default="{ row }">
                  <el-button type="text" size="small" @click="openEditDialog(row)">编辑</el-button>
                  <el-button type="text" size="small" style="color:red" @click="deleteRecordHandler(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="editDialogVisible" title="编辑记录">
      <el-form :model="editForm" label-width="90px">
        <el-form-item label="日期">
          <el-input v-model="editForm.date" disabled />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="editForm.name" disabled />
        </el-form-item>
        <el-form-item label="上班时间">
          <el-time-picker v-model="editForm.startTime" format="HH:mm" value-format="HH:mm" placeholder="可留空表示休息"
            style="width:200px;" />
        </el-form-item>
        <el-form-item label="下班时间">
          <el-time-picker v-model="editForm.endTime" format="HH:mm" value-format="HH:mm" placeholder="可留空表示休息"
            style="width:200px;" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="editForm.remark" placeholder="可选" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="updateRecordHandler">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getEmployees, getRecords, addRecord as createRecord, updateRecord, deleteRecord } from '../api'
import { calcHours } from '../utils/calcHours'
import { ElMessage, ElMessageBox } from 'element-plus'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

// 表单
const form = ref({ date: new Date().toISOString().slice(0, 10), employeeId: '', startTime: '', endTime: '', remark: '' })
const availableEmployees = ref([])
const employees = ref([])

// 编辑
const editDialogVisible = ref(false)
const editForm = ref({})

// 数据
const records = ref([])

// 筛选
const searchEmployeeId = ref('')
const currentMonth = new Date().toISOString().slice(0, 7)
const searchMonth = ref(currentMonth)

// 初始化
onMounted(async () => {
  await loadEmployees()
  await refreshRecords()
})
const disableMinutes = () => {
  return Array.from({ length: 60 }, (_, i) => i).filter(i => i !== 0 && i !== 30)
}


async function loadEmployees() {
  employees.value = await getEmployees()
  availableEmployees.value = [...employees.value]
}

// 根据日期更新可选员工
async function onDateChange(date) {
  const recs = await getRecords({ date })
  const existIds = recs.map(r => r.employeeId)
  availableEmployees.value = employees.value.filter(e => !existIds.includes(e.id))
  form.value.employeeId = ''
}

// 新增记录
async function addRecord() {
  if (!form.value.date || !form.value.employeeId) return ElMessage.error('请填写日期和姓名')

  // 检查是否已存在
  const exist = await getRecords({ date: form.value.date, employeeId: form.value.employeeId })
  if (exist.length > 0) return ElMessage.warning('该员工在选定日期已有记录')

  const emp = employees.value.find(e => e.id === form.value.employeeId)
  let hours = { totalHours: 0, workHours: 0, overtimeHours: 0 }
  if (form.value.startTime && form.value.endTime) hours = calcHours(form.value.startTime, form.value.endTime)

  const newRecord = {
    ...form.value,
    name: emp.name,
    ...hours,
    remark: form.value.remark || (!form.value.startTime && !form.value.endTime ? '休息' : '')
  }

  await createRecord(newRecord)
  ElMessage.success('记录已新增')
  await refreshRecords()
  resetForm()
}

// 重置表单
function resetForm() {
  form.value = { date: new Date().toISOString().slice(0, 10), employeeId: '', startTime: '', endTime: '', remark: '' }
}

// 刷新记录
async function refreshRecords() {
  const recs = await getRecords()
  // 确保每条记录都有 name
  records.value = recs.map(r => {
    const emp = employees.value.find(e => e.id === r.employeeId)
    return {
      ...r,
      name: emp ? emp.name : r.name || '未知',
      totalHours: r.totalHours || 0,
      workHours: r.workHours || 0,
      overtimeHours: r.overtimeHours || 0,
      remark: r.remark || (!r.startTime && !r.endTime ? '休息' : '')
    }
  }).sort((a, b) => a.date > b.date ? -1 : 1)
}

// 过滤
const filteredRecords = computed(() => {
  return records.value.filter(r => {
    const matchName = searchEmployeeId.value ? r.employeeId === searchEmployeeId.value : true
    const matchMonth = searchMonth.value ? r.date.startsWith(searchMonth.value) : true
    return matchName && matchMonth
  }).sort((a, b) => a.date > b.date ? -1 : 1)
})

// 编辑弹窗
function openEditDialog(r) {
  editForm.value = { ...r }
  editDialogVisible.value = true
}

// 更新
async function updateRecordHandler() {
  if (!editForm.value.id) return
  let hours = { totalHours: 0, workHours: 0, overtimeHours: 0 }
  if (editForm.value.startTime && editForm.value.endTime) hours = calcHours(editForm.value.startTime, editForm.value.endTime)
  const updated = { ...editForm.value, ...hours, remark: editForm.value.remark || (!editForm.value.startTime && !editForm.value.endTime ? '休息' : '') }
  await updateRecord(editForm.value.id, updated)
  ElMessage.success('记录已更新')
  editDialogVisible.value = false
  await refreshRecords()
}

// 删除
// 删除记录
async function deleteRecordHandler(r) {
  try {
    await ElMessageBox.confirm(
      `确定要删除 ${r.name} ${r.date} 的记录吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    // 用户点击确认
    await deleteRecord(r.id)
    ElMessage.success('记录已删除')
    await refreshRecords()

  } catch (err) {
    // 用户取消时不提示错误
    if (err !== 'cancel') {
      ElMessage.error('删除失败')
      console.error(err)
    }
  }
}

// 日期合并
function mergeDateCells({ row, column, rowIndex }) {
  if (column.property === 'date') {
    let count = 1
    for (let i = rowIndex + 1; i < filteredRecords.value.length; i++) {
      if (filteredRecords.value[i].date === row.date) count++
      else break
    }
    if (rowIndex > 0 && filteredRecords.value[rowIndex - 1].date === row.date) return [0, 1]
    return [count, 1]
  }
}

// Excel 导出
async function exportExcelFile() {
  if (!filteredRecords.value.length) return
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('每日记录')

  // 设置列
  sheet.columns = [
    { header: '日期', key: 'date', width: 15 },
    { header: '姓名', key: 'name', width: 15 },
    { header: '上班', key: 'startTime', width: 12 },
    { header: '下班', key: 'endTime', width: 12 },
    { header: '总时长', key: 'totalHours', width: 12 },
    { header: '正常(小时)', key: 'workHours', width: 14 },
    { header: '加班(小时)', key: 'overtimeHours', width: 14 },
    { header: '备注', key: 'remark', width: 20 },
  ]

  // 添加行
  filteredRecords.value.forEach(r => sheet.addRow(r))

  // 日期合并
  let startRow = 2 // 从数据行开始，表头在第1行
  while (startRow <= sheet.rowCount) {
    const dateValue = sheet.getRow(startRow).getCell(1).value
    let endRow = startRow
    while (endRow + 1 <= sheet.rowCount && sheet.getRow(endRow + 1).getCell(1).value === dateValue) {
      endRow++
    }
    if (endRow > startRow) {
      sheet.mergeCells(`A${startRow}:A${endRow}`)
    }
    startRow = endRow + 1
  }

  // 居中
  sheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.alignment = { vertical: 'middle', horizontal: 'center' }
    })
  })

  const buffer = await workbook.xlsx.writeBuffer()
  saveAs(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `${searchMonth.value}-daily.xlsx`)
}
</script>

<style scoped>
.container {
  padding: 16px;
  background: #f5f7fa;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.main-layout {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.left-panel {
  flex: 0 0 320px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.card-form,
.card-filter,
.card-table {
  padding: 10px;
}

.table-wrapper {
  overflow-x: auto;
}

.filter-bar {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 10px;
  flex-wrap: wrap;
}
</style>
