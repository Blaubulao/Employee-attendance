<template>
  <div class="container">
    <!-- 顶部 -->
    <div class="header">
      <h2>月度汇总</h2>
    </div>

    <!-- 筛选 & 导出 -->
    <el-card class="filter-card">
      <div class="filter-bar">
        <el-date-picker
          v-model="month"
          type="month"
          value-format="YYYY-MM"
          placeholder="选择月份"
           @change="refresh"  
        />
        <!-- <el-input v-model="q" placeholder="按姓名搜索" clearable /> -->
        <el-button type="primary" @click="refresh">刷新</el-button>
        <el-button :disabled="summary.length===0" @click="exportExcel">导出 Excel</el-button>
      </div>
      <div style="margin-left:auto; color:#666;">
        总员工：<strong>{{ summary.length }}</strong>
        &nbsp;|&nbsp; 总工作时长：<strong>{{ totalAllWork.toFixed(1) }}</strong> 小时
        &nbsp;|&nbsp; 总加班时长：<strong>{{ totalAllOvertime.toFixed(1) }}</strong> 小时
      </div>
    </el-card>

    <!-- 汇总表格 -->
    <el-card class="card-table">
      <el-table :data="filteredSummary" border stripe style="width:100%; margin-top:12px;">
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="days" label="出勤天数" width="120" />
        <el-table-column prop="totalWork" label="总工作时长（小时）" width="180" />
        <el-table-column prop="totalOvertime" label="总加班（小时）" width="180" />
        <el-table-column prop="restDays" label="休息天数" width="120" />
        <el-table-column label="详情 / 操作">
          <template #default="{ row }">
            <el-button type="text" @click="showDetails(row.id,row.name)">查看明细</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 明细弹窗 -->
    <el-dialog v-model="detailVisible" width="80%" :title="`${detailName} - ${month || currentMonth} 明细`">
      <div style="margin-bottom:10px; color:#666;">
        休息天数：<strong>{{ restDays }}</strong>
      </div>
      <el-table :data="detailRecords" border stripe style="width:100%">
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="startTime" label="上班" width="100" />
        <el-table-column prop="endTime" label="下班" width="100" />
        <el-table-column prop="totalHours" label="总时长" width="100" />
        <el-table-column prop="workHours" label="正常(小时)" width="120" />
        <el-table-column prop="overtimeHours" label="加班(小时)" width="120" />
        <el-table-column prop="remark" label="备注" />
      </el-table>
      <template #footer>
        <el-button @click="detailVisible=false">关闭</el-button>
        <el-button type="primary" v-if="detailRecords.length" @click="exportDetailExcel">导出明细 Excel</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getEmployees, getRecords } from '../api'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

const currentMonth = new Date().toISOString().slice(0,7)
const month = ref(currentMonth)
const q = ref('')

const employees = ref([])
const records = ref([])

const summary = ref([])

// 明细
const detailVisible = ref(false)
const detailName = ref('')
const detailRecords = ref([])
const restDays = ref(0)

// 获取数据
async function refresh() {
  const [empRes, recRes] = await Promise.all([getEmployees(), getRecords()])
  employees.value = empRes
  records.value = recRes
  computeSummary()
}

// 计算汇总
function computeSummary(){
  const map = {}
  employees.value.forEach(e=>{
    map[e.id] = { id:e.id, name:e.name, days:0, totalWork:0, totalOvertime:0, restDays:0 }
  })

  records.value.forEach(r=>{
    if(!r.employeeId || !r.date || !r.date.startsWith(month.value)) return
    const item = map[r.employeeId]
    if(!item) return

    const isRest = !r.startTime && !r.endTime
    if(isRest){
      item.restDays += 1
    } else {
      item.days += 1
      item.totalWork += Number(r.workHours || r.totalHours || 0)
      item.totalOvertime += Number(r.overtimeHours || 0)
    }
  })

  summary.value = Object.values(map).map(i=>({
    ...i,
    totalWork: Math.round((i.totalWork+Number.EPSILON)*10)/10,
    totalOvertime: Math.round((i.totalOvertime+Number.EPSILON)*10)/10
  }))
}

// 搜索过滤
const filteredSummary = computed(()=>{
  if(!q.value) return summary.value
  const key = q.value.trim().toLowerCase()
  return summary.value.filter(s=>s.name.toLowerCase().includes(key))
})

// 合计
const totalAllWork = computed(()=> summary.value.reduce((a,c)=>a+Number(c.totalWork||0),0))
const totalAllOvertime = computed(()=> summary.value.reduce((a,c)=>a+Number(c.totalOvertime||0),0))

// 查看明细
function showDetails(id,name){
  detailName.value = name
  const arr = records.value
    .filter(r=>r.employeeId===id && r.date && r.date.startsWith(month.value))
    .sort((a,b)=>a.date>b.date?1:-1)
    .map(r=>({
      date: r.date,
      startTime: r.startTime||'',
      endTime: r.endTime||'',
      totalHours: r.totalHours!==undefined? Math.round((Number(r.totalHours)+Number.EPSILON)*10)/10 : '',
      workHours: r.workHours!==undefined? Math.round((Number(r.workHours)+Number.EPSILON)*10)/10 : '',
      overtimeHours: r.overtimeHours!==undefined? Math.round((Number(r.overtimeHours)+Number.EPSILON)*10)/10 : '',
      remark: r.remark||(!r.startTime&&!r.endTime?'休息':'')
    }))
  detailRecords.value = arr
  restDays.value = arr.filter(r=>r.remark==='休息').length
  detailVisible.value = true
}

// Excel 导出汇总
async function exportExcel(){
  if(!summary.value.length) return
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('月度汇总')
  sheet.columns = [
    { header:'姓名', key:'name', width:15 },
    { header:'出勤天数', key:'days', width:12 },
    { header:'总工作时长(小时)', key:'totalWork', width:18 },
    { header:'总加班时长(小时)', key:'totalOvertime', width:18 },
    { header:'休息天数', key:'restDays', width:12 }
  ]
  summary.value.forEach(r=>sheet.addRow(r))
  sheet.eachRow({ includeEmpty: false }, row=>{
    row.eachCell({ includeEmpty: false }, cell=>{
      cell.alignment = { vertical:'middle', horizontal:'center' }
    })
  })
  const buffer = await workbook.xlsx.writeBuffer()
  saveAs(new Blob([buffer],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}), `${month.value}-考勤.xlsx`)
}

// Excel 导出明细
async function exportDetailExcel(){
  if(!detailRecords.value.length) return
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet(`${detailName.value} 明细`)
  sheet.columns = [
    { header:'日期', key:'date', width:15 },
    { header:'上班', key:'startTime', width:12 },
    { header:'下班', key:'endTime', width:12 },
    { header:'总时长', key:'totalHours', width:12 },
    { header:'正常(小时)', key:'workHours', width:14 },
    { header:'加班(小时)', key:'overtimeHours', width:14 },
    { header:'备注', key:'remark', width:20 },
  ]
  detailRecords.value.forEach(r=>sheet.addRow(r))
  sheet.eachRow({ includeEmpty: false }, row=>{
    row.eachCell({ includeEmpty: false }, cell=>{
      cell.alignment = { vertical:'middle', horizontal:'center' }
    })
  })
  const buffer = await workbook.xlsx.writeBuffer()
  saveAs(new Blob([buffer],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}), `${month.value}-${detailName.value}-考勤.xlsx`.replace(/\s+/g,'_'))
}

onMounted(()=>refresh())
</script>

<style scoped>
.container { padding:16px; background:#f5f7fa; }
.header { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; }
.filter-card { padding:10px; margin-bottom:12px; }
.filter-bar { display:flex; gap:12px; align-items:center; margin-bottom:12px; }
.card-table { padding:10px; }
</style>
