<template>
  <div class="map-selector">
    <h3 class="text-lg font-medium text-white mb-4">2D地图定位</h3>
    
    <div class="map-container" ref="mapContainer" @click="handleMapClick">
      <div class="map-grid"></div>
      <div v-if="selectedPoint" class="map-marker" :style="{ left: selectedPoint.x + 'px', top: selectedPoint.y + 'px' }">
        <div class="marker-dot"></div>
      </div>
      <div class="coordinates-info" v-if="selectedPoint">
        X: {{ coordinates.x.toFixed(2) }}, Y: {{ coordinates.y.toFixed(2) }}
      </div>
    </div>
    
    <div class="map-controls mt-4">
      <div class="coordinates-display p-3 bg-gray-800 rounded border border-gray-700">
        <h4 class="text-sm font-medium text-gray-300 mb-2">当前坐标</h4>
        <div class="flex justify-between">
          <div>
            <label class="text-xs text-gray-400">X 坐标</label>
            <div class="text-white font-mono">{{ coordinates.x.toFixed(2) }}</div>
          </div>
          <div>
            <label class="text-xs text-gray-400">Y 坐标</label>
            <div class="text-white font-mono">{{ coordinates.y.toFixed(2) }}</div>
          </div>
        </div>
      </div>
      
      <div class="mt-4 flex justify-end">
        <el-button 
          type="danger" 
          size="small" 
          @click="resetCoordinates"
          :disabled="!selectedPoint"
        >
          重置坐标
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';

const mapContainer = ref(null);
const selectedPoint = ref(null);
const coordinates = reactive({ x: 0, y: 0 });

// 处理地图点击事件
const handleMapClick = (event) => {
  if (!mapContainer.value) return;
  
  const rect = mapContainer.value.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  // 确保点击位置在地图范围内
  if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
    selectedPoint.value = { x, y };
    
    // 转换为百分比坐标（0-100）
    coordinates.x = parseFloat((x / rect.width * 100).toFixed(2));
    coordinates.y = parseFloat((y / rect.height * 100).toFixed(2));
  }
};

// 重置坐标
const resetCoordinates = () => {
  selectedPoint.value = null;
  coordinates.x = 0;
  coordinates.y = 0;
};

// 暴露坐标给父组件
defineExpose({
  coordinates,
  resetCoordinates
});
</script>

<style scoped>
.map-selector {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.map-container {
  position: relative;
  width: 100%;
  height: 250px;
  background-color: #0c1220;
  border: 1px solid #2a3a50;
  border-radius: 4px;
  overflow: hidden;
  cursor: crosshair;
}

.map-grid {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(to right, #2a3a50 1px, transparent 1px),
    linear-gradient(to bottom, #2a3a50 1px, transparent 1px);
  background-size: 20px 20px;
  opacity: 0.3;
}

.map-marker {
  position: absolute;
  transform: translate(-50%, -50%);
  z-index: 10;
}

.marker-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #409eff;
  border: 2px solid white;
  box-shadow: 0 0 0 2px #409eff;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(64, 158, 255, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(64, 158, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(64, 158, 255, 0);
  }
}

.coordinates-info {
  position: absolute;
  bottom: 8px;
  left: 8px;
  background-color: rgba(12, 18, 32, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-family: monospace;
  border: 1px solid #2a3a50;
}

.map-controls {
  margin-top: auto;
}
</style>