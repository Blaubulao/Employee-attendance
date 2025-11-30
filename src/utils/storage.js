// src/utils/storage.js
const KEY = 'attendance_records'

export function loadRecords() {
  const raw = localStorage.getItem(KEY)
  return raw ? JSON.parse(raw) : []
}

export function saveRecords(records) {
  localStorage.setItem(KEY, JSON.stringify(records))
}

export function addRecord(record) {
  const records = loadRecords()
  record.id = Date.now()
  records.push(record)
  saveRecords(records)
}

export function updateRecord(updated) {
  const records = loadRecords().map(r => (r.id === updated.id ? updated : r))
  saveRecords(records)
}

export function deleteRecord(id) {
  const records = loadRecords().filter(r => r.id !== id)
  saveRecords(records)
}
