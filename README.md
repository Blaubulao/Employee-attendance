# 员工打卡管理系统

**日期：2025-11-30**

## 项目简介

这是一个基于 Vue 3 + Element Plus + Vite + JSON Server 的员工打卡管理系统，用于管理员工信息、每日打卡记录以及月度汇总统计。系统支持新增、编辑、删除员工和打卡记录，导出 Excel/CSV，并提供详细的月度汇总查看功能。

---

## 功能说明

### 1. 员工管理

- 添加员工
- 编辑员工姓名
- 删除员工（会同步删除该员工的打卡记录）
- 支持二次确认弹窗操作

### 2. 每日打卡

- 填写日期、姓名、上班时间、下班时间、备注
- 可保存、重置表单
- 保存时会检查当日是否已有记录，防止重复
- 可按员工或月份筛选
- 支持编辑和删除记录，删除前有二次确认
- 支持导出 Excel，自动合并日期相同的单元格，并水平垂直居中

### 3. 月度汇总

- 按月份统计员工出勤天数、总工作时长、总加班时长、休息天数
- 支持姓名搜索
- 可查看明细记录并导出 CSV

---

## 安装和启动

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发环境

系统依赖两个服务：前端 Vite 服务和 JSON Server 模拟后端接口。

```bash
npm run start
```

`start` 会同时启动：

- JSON Server（监听 db.json，默认端口 3000）
- Vite 前端服务（默认端口 5173）
- 自动打开浏览器访问前端页面

### 3. 单独启动 JSON Server（可选）

```bash
npm run json:serve
```


### 4. 单独启动前端（可选）

```bash
npm run dev
```

## API 接口说明

前端通过封装的 API 模块与 JSON Server 交互，接口如下：

### 员工接口

| 方法 | URL | 描述 |
|------|-----|------|
| GET | /employees | 获取员工列表 |
| POST | /employees | 添加新员工 |
| PUT | /employees/:id | 更新员工信息 |
| DELETE | /employees/:id | 删除员工及其打卡记录 |

### 打卡记录接口

| 方法 | URL | 描述 |
|------|-----|------|
| GET | /records | 获取所有打卡记录 |
| GET | /records?date=YYYY-MM-DD | 按日期查询打卡记录 |
| GET | /records?employeeId=ID | 查询某员工打卡记录 |
| POST | /records | 添加打卡记录 |
| PUT | /records/:id | 更新打卡记录 |
| DELETE | /records/:id | 删除打卡记录 |

## 文件结构

```
├─ public
├─ src
│  ├─ api             # 接口封装
│  ├─ components      # 公共组件
│  ├─ views           # 页面视图 (Employees.vue, Daily.vue, Monthly.vue)
│  ├─ utils           # 工具函数 (calcHours, storage 等)
│  └─ main.js         # 入口文件
├─ db.json            # JSON Server 数据文件
├─ package.json
└─ vite.config.js
```

## 一键启动脚本 (start.bat)

项目中提供了 `start.bat` 脚本，可在 Windows 系统下一键启动前端和 JSON Server。

### start.bat 示例内容

```bat
@echo off
REM 切换到项目 dist 目录
cd /d "%~dp0"

REM 启动 JSON Server
start cmd /k "npm run json:serve"

REM 启动 Vite 前端服务
start cmd /k "npm run dev"

pause
```
## 使用方法

### 运行一键启动脚本

双击 `start.bat` 或在命令行中运行：

```bash
start.bat
```

### 脚本功能说明

脚本会自动执行以下操作：

1. 打开两个独立的命令行窗口：
   - 一个用于启动 **JSON Server**（默认监听 db.json，端口 3000）
   - 一个用于启动 **Vite 前端服务**（默认端口 5173）

2. 待两个服务成功启动后，脚本会自动打开默认浏览器并访问前端页面。

### 注意事项

```
- 确保已正确安装 Node.js 运行环境
- 确保已执行 `npm install` 安装完项目所有依赖
- 脚本假设 `json-server` 和 `vite` 命令在本地环境中可用
- 如遇到端口冲突，可手动修改相关配置文件中的端口设置
```


## 注意事项

- JSON Server 会自动生成每条记录的 id，新增员工或打卡记录时无需手动设置。
- 删除员工时，系统会自动删除该员工的所有打卡记录。
- 每日打卡保存时会检查是否已有当日记录，避免重复。
- Excel 导出会自动合并相同日期的单元格，并设置水平垂直居中。
- CSV 导出支持月度汇总及明细记录。
- 后续可能新增功能，可直接在页面增加操作或在 api 模块中扩展接口。

## 联系方式

如有问题，别联系开发者。

