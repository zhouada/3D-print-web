<template>
  <div class="three-viewer">
    <div class="viewer-header flex justify-between items-center mb-4">
      <h3 class="text-lg font-medium text-white">3D预览</h3>
      <div class="controls">
        <el-button 
          type="primary" 
          size="small" 
          :icon="Refresh" 
          @click="resetCamera"
          plain
        >
          重置视图
        </el-button>
      </div>
    </div>
    
    <div class="viewer-container" ref="viewerContainer">
      <!-- Three.js 渲染区域 -->
      <div v-if="loading" class="loading-overlay">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>加载中...</span>
      </div>
      
      <div v-if="error" class="error-message">
        <el-icon><CircleClose /></el-icon>
        <span>{{ error }}</span>
      </div>
    </div>
    
    <!-- 模型尺寸控制 -->
    <div class="model-controls mt-4">
      <h4 class="text-sm font-medium text-gray-300 mb-2">模型尺寸</h4>
      
      <div class="scale-control mb-4">
        <label class="text-sm text-gray-400">缩放比例</label>
        <div class="flex items-center">
          <el-slider 
            v-model="scale" 
            :min="0.1" 
            :max="2" 
            :step="0.1"
            class="flex-grow mr-4"
          />
          <span class="text-white">{{ scale.toFixed(1) }}x</span>
        </div>
      </div>
      
      <div class="dimensions-control grid grid-cols-3 gap-4">
        <div>
          <label class="text-sm text-gray-400">宽度 (mm)</label>
          <el-input-number 
            v-model="dimensions.width" 
            :min="0.1" 
            :step="0.1"
            @change="updateDimensions"
            class="w-full"
          />
        </div>
        <div>
          <label class="text-sm text-gray-400">高度 (mm)</label>
          <el-input-number 
            v-model="dimensions.height" 
            :min="0.1" 
            :step="0.1"
            @change="updateDimensions"
            class="w-full"
          />
        </div>
        <div>
          <label class="text-sm text-gray-400">深度 (mm)</label>
          <el-input-number 
            v-model="dimensions.depth" 
            :min="0.1" 
            :step="0.1"
            @change="updateDimensions"
            class="w-full"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import { Refresh, Loading, CircleClose } from '@element-plus/icons-vue';
import { useThree } from '../composables/useThree';

const props = defineProps({
  modelUrl: {
    type: String,
    default: ''
  }
});

const viewerContainer = ref(null);
const scale = ref(1);
const dimensions = reactive({
  width: 10,
  height: 10,
  depth: 10
});

// 使用Three.js组合式函数
const { 
  loading, 
  error, 
  modelScale, 
  modelDimensions,
  loadSTLModel, 
  scaleModel, 
  setModelDimensions, 
  resetCamera 
} = useThree(viewerContainer);

// 监听模型URL变化
watch(() => props.modelUrl, (newUrl) => {
  if (newUrl) {
    loadSTLModel(newUrl);
  }
});

// 监听缩放比例变化
watch(scale, (newScale) => {
  scaleModel(newScale);
});

// 更新尺寸
const updateDimensions = () => {
  setModelDimensions(dimensions.width, dimensions.height, dimensions.depth);
};

// 监听模型尺寸变化
watch(modelDimensions, (newDimensions) => {
  dimensions.width = parseFloat(newDimensions.width) || 0;
  dimensions.height = parseFloat(newDimensions.height) || 0;
  dimensions.depth = parseFloat(newDimensions.depth) || 0;
});

// 监听模型缩放变化
watch(modelScale, (newScale) => {
  scale.value = newScale;
});

// 加载示例模型（用于演示）
onMounted(() => {
  // 如果没有传入模型URL，加载示例模型
  if (!props.modelUrl) {
    // 注意：这里使用模拟数据，实际项目中应使用真实的模型URL
    // loadSTLModel('https://example.com/models/sample.stl');
  }
});
</script>

<style scoped>
.three-viewer {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.viewer-container {
  position: relative;
  flex-grow: 1;
  min-height: 300px;
  border: 1px solid #2a3a50;
  border-radius: 4px;
  overflow: hidden;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(12, 18, 32, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  z-index: 10;
}

.loading-overlay .el-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.error-message {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(220, 53, 69, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #f56c6c;
  z-index: 10;
  padding: 16px;
  text-align: center;
}

.error-message .el-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.model-controls {
  background-color: #162032;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #2a3a50;
}

/* 自定义Element Plus组件样式 */
:deep(.el-slider__runway) {
  background-color: #2a3a50;
}

:deep(.el-slider__bar) {
  background-color: #409eff;
}

:deep(.el-slider__button) {
  border-color: #409eff;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-input-number__increase),
:deep(.el-input-number__decrease) {
  background-color: #0c1220;
  border-color: #2a3a50;
  color: #fff;
}

:deep(.el-input__wrapper) {
  background-color: #0c1220;
}

:deep(.el-input__inner) {
  color: #fff;
}
</style>