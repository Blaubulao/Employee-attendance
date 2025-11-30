// src/api/index.js
import axios from 'axios'

// 创建 axios 实例
const http = axios.create({
  baseURL: 'http://localhost:3000', // json-server 地址
  timeout: 5000
})

// 请求拦截器（可加 token）
http.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器
http.interceptors.response.use(
  (res) => res.data,
  (error) => {
    console.error('API 错误:', error)
    return Promise.reject(error)
  }
)

// =======================
// 员工接口
// =======================
export const getEmployees = () => http.get('/employees')
export const addEmployee = (data) => http.post('/employees', data)
export const updateEmployee = (id, data) => http.put(`/employees/${id}`, data)
export const deleteEmployee = (id) => http.delete(`/employees/${id}`)

// =======================
// 打卡记录接口
// =======================
export const getRecords = (params = {}) => http.get('/records', { params })
export const addRecord = (data) => http.post('/records', data)
export const updateRecord = (id, data) => http.put(`/records/${id}`, data)
export const deleteRecord = (id) => http.delete(`/records/${id}`)

// =======================
// 获取某日期的记录（可选封装）
// =======================
export const getRecordsByDate = (date) =>
  http.get(`/records?date=${date}`)

// 获取某员工的记录
export const getRecordsByEmployee = (employeeId) =>
  http.get(`/records?employeeId=${employeeId}`)

export default http
