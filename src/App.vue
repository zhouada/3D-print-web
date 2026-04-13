<template>
  <div class="app-container">
    <header class="app-header">
      <h1 class="app-title">3D打印控制中心</h1>
    </header>
    
    <main class="app-main">
      <div class="quadrant-layout">
        <!-- 左上：操作区 -->
        <div class="quadrant top-left">
          <ModelGenerator @model-generated="handleModelGenerated" />
        </div>
        
        <!-- 右上：3D预览区 -->
        <div class="quadrant top-right">
          <ThreeViewer :model-url="modelUrl" ref="threeViewer" />
        </div>
        
        <!-- 左下：2D地图点选区 -->
        <div class="quadrant bottom-left">
          <MapSelector ref="mapSelector" />
        </div>
        
        <!-- 右下：切片参数配置区 + 任务状态显示 -->
        <div class="quadrant bottom-right">
          <SliceConfig 
            :model-url="modelUrl" 
            :position="position" 
            @task-submitted="handleTaskSubmitted" 
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import ModelGenerator from './components/ModelGenerator.vue';
import ThreeViewer from './components/ThreeViewer.vue';
import MapSelector from './components/MapSelector.vue';
import SliceConfig from './components/SliceConfig.vue';

// 模型URL
const modelUrl = ref('');

// 位置坐标
const position = reactive({ x: 50, y: 50 });

// 组件引用
const threeViewer = ref(null);
const mapSelector = ref(null);

// 处理模型生成事件
const handleModelGenerated = (url) => {
  modelUrl.value = url;
  ElMessage.success('模型已加载到预览区');
};

// 处理任务提交事件
const handleTaskSubmitted = (taskData) => {
  console.log('任务已提交:', taskData);
  ElMessage.success('任务提交成功，正在处理中...');
};
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #0c1220;
  color: #e2e8f0;
}

#app {
  height: 100%;
}

/* 应用容器 */
.app-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 应用头部 */
.app-header {
  background-color: #162032;
  padding: 12px 24px;
  border-bottom: 1px solid #2a3a50;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.app-title {
  color: #ffffff;
  font-size: 20px;
  font-weight: 600;
}

/* 应用主体 */
.app-main {
  flex: 1;
  overflow: hidden;
}

/* 四象限布局 */
.quadrant-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 16px;
  height: 100%;
  padding: 16px;
}

/* 象限通用样式 */
.quadrant {
  background-color: #162032;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #2a3a50;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 响应式调整 */
@media (max-width: 1024px) {
  .quadrant-layout {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(4, minmax(300px, 1fr));
    overflow-y: auto;
  }
  
  .app-main {
    overflow-y: auto;
  }
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #0c1220;
}

::-webkit-scrollbar-thumb {
  background: #2a3a50;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #34495e;
}
</style>