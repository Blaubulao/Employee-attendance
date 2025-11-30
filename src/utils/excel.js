import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

export async function exportExcel(filename, headers, data, merges = [], colWidths = []) {
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Sheet1')

  // 设置表头
  ws.addRow(headers)

  // 设置数据
  data.forEach(row => ws.addRow(row))

  // 设置列宽
  if (colWidths.length) {
    ws.columns.forEach((col, idx) => {
      if (colWidths[idx]) col.width = colWidths[idx]
    })
  }

  // 合并单元格
  merges.forEach(m => {
    const start = m.s
    const end = m.e
    ws.mergeCells(start.r + 1, start.c + 1, end.r + 1, end.c + 1)
  })

  // 设置所有单元格水平垂直居中
  ws.eachRow(row => {
    row.eachCell(cell => {
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
    })
  })

  const buffer = await wb.xlsx.writeBuffer()
  saveAs(new Blob([buffer]), filename)
}
