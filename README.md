# 3D打印控制中心

一个基于Vue3 + Vite + Element Plus + Three.js的3D打印前端应用，提供从模型生成、预览到切片参数配置和任务提交的一站式解决方案。

## 功能特性

- **模型生成**：支持文本描述生成模型和图片上传生成模型两种方式
- **3D预览**：使用Three.js加载和渲染STL模型，支持旋转、缩放操作
- **2D地图交互**：点击地图获取X、Y坐标，用于模型定位
- **切片参数配置**：设置层高、填充率、打印速度、支撑、温度等参数
- **任务提交与状态监控**：提交打印任务并通过WebSocket实时显示任务状态

## 技术栈

- Vue3 + Composition API
- Vite
- Element Plus
- Three.js + OrbitControls + STLLoader
- Axios
- WebSocket

## 项目结构

```
src/
├── assets/            # 静态资源
│   ├── images/        # 图片资源
│   └── styles/        # 全局样式
├── components/        # 通用组件
│   ├── ModelGenerator.vue    # 模型生成组件
│   ├── ThreeViewer.vue       # 3D预览组件
│   ├── MapSelector.vue       # 2D地图选择组件
│   └── SliceConfig.vue       # 切片参数配置组件
├── composables/       # 组合式函数
│   ├── useThree.js           # Three.js相关逻辑
│   ├── useWebSocket.js       # WebSocket相关逻辑
│   └── useApi.js             # API请求相关逻辑
├── utils/             # 工具函数
│   └── request.js     # Axios配置
├── App.vue            # 根组件
└── main.js            # 入口文件
```

## 安装与运行

### 安装依赖

```bash
npm install
```

### 开发环境运行

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 接口说明

### 模型生成接口

```
POST /api/generate
```

请求参数：
- `description`: 文本描述（可选）
- `image`: Base64编码的图片（可选，与description二选一）

响应：
- `success`: 是否成功
- `modelUrl`: STL模型URL

### 任务提交接口

```
POST /api/submit
```

请求参数：
- `modelUrl`: STL模型URL
- `position`: 位置坐标 {x, y}
- `sliceParams`: 切片参数对象

响应：
- `success`: 是否成功
- `taskId`: 任务ID

### WebSocket接口

```
ws://localhost:8080/ws
```

消息格式：
```json
{
  "status": "生成中|切片中|路径规划中|待执行|完成",
  "progress": 0-100,
  "taskId": "任务ID"
}
```

## 注意事项

1. 本项目使用了模拟数据，实际部署时需要连接真实的后端API
2. WebSocket连接默认指向`ws://localhost:8080/ws`，请根据实际情况修改
3. 项目采用深色数据看板设计风格，适合长时间操作
4. 支持响应式布局，在不同屏幕尺寸下都能良好显示
