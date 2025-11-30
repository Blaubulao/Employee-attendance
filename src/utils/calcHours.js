// src/utils/calcHours.js
import dayjs from 'dayjs'

export function calcHours(startTimeStr, endTimeStr) {
  // startTimeStr, endTimeStr e.g. "14:00"
  const today = dayjs().format('YYYY-MM-DD')
  let start = dayjs(`${today} ${startTimeStr}`, 'YYYY-MM-DD HH:mm')
  let end = dayjs(`${today} ${endTimeStr}`, 'YYYY-MM-DD HH:mm')

  // 如果 end 在 start 之前，认为跨天（加一天）
  if (end.isBefore(start) || end.isSame(start)) {
    end = end.add(1, 'day')
  }

  const diffMinutes = end.diff(start, 'minute') // 总分钟
  const totalHours = Math.round((diffMinutes / 60) * 10) / 10 // 保留一位小数
  const normalHours = 9
  const overtime = Math.max(Math.round(((totalHours - normalHours) * 10)) / 10, 0)

  return {
    totalHours,
    workHours: Math.min(totalHours, normalHours),
    overtimeHours: overtime
  }
}
