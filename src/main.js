// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
// import * as excelUtils from './utils/excel.js'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// 引入中文语言包
import zhCn from 'element-plus/es/locale/lang/zh-cn'
const app = createApp(App)
// app.config.globalProperties.$exportExcel = excelUtils.exportExcel
// app.use(ElementPlus)
app.use(router)
// 配置 Element Plus 为中文
app.use(ElementPlus, {
    locale: zhCn,
})
app.mount('#app')
