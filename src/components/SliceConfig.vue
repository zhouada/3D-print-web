<template>
  <div class="slice-config">
    <h3 class="text-lg font-medium text-white mb-4">切片参数配置</h3>
    
    <el-form :model="sliceParams" label-position="top">
      <el-form-item label="层高 (mm)">
        <div class="flex items-center">
          <el-slider 
            v-model="sliceParams.layerHeight" 
            :min="0.1" 
            :max="0.3" 
            :step="0.05" 
            class="flex-grow mr-4"
          />
          <span class="text-white w-12 text-center">{{ sliceParams.layerHeight }}mm</span>
        </div>
      </el-form-item>
      
      <el-form-item label="填充率 (%)">
        <div class="flex items-center">
          <el-slider 
            v-model="sliceParams.infill" 
            :min="0" 
            :max="100" 
            :step="5"
            class="flex-grow mr-4"
          />
          <span class="text-white w-12 text-center">{{ sliceParams.infill }}%</span>
        </div>
      </el-form-item>
      
      <el-form-item label="打印速度">
        <el-radio-group v-model="sliceParams.printSpeed" class="w-full">
          <el-radio-button label="slow" class="w-1/3">慢速</el-radio-button>
          <el-radio-button label="medium" class="w-1/3">中速</el-radio-button>
          <el-radio-button label="fast" class="w-1/3">快速</el-radio-button>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item label="支撑">
        <el-switch v-model="sliceParams.support" />
      </el-form-item>
      
      <el-form-item label="喷嘴温度 (°C)">
        <el-input-number 
          v-model="sliceParams.nozzleTemp" 
          :min="180" 
          :max="260" 
          :step="5"
          class="w-full"
        />
      </el-form-item>
      
      <el-form-item label="热床温度 (°C)">
        <el-input-number 
          v-model="sliceParams.bedTemp" 
          :min="0" 
          :max="120" 
          :step="5"
          class="w-full"
        />
      </el-form-item>
    </el-form>
    
    <div class="task-status mt-6">
      <h3 class="text-lg font-medium text-white mb-4">任务状态</h3>
      
      <div class="status-container p-4 bg-gray-800 rounded border border-gray-700">
        <div class="flex items-center justify-between mb-2">
          <span class="text-gray-300">连接状态:</span>
          <span :class="wsStatusClass">{{ wsStatusText }}</span>
        </div>
        
        <div class="flex items-center justify-between mb-2">
          <span class="text-gray-300">任务状态:</span>
          <span :class="taskStatusClass">{{ taskStatus }}</span>
        </div>
        
        <div class="mt-4">
          <div class="flex items-center justify-between mb-1">
            <span class="text-gray-300">进度:</span>
            <span class="text-white">{{ taskProgress }}%</span>
          </div>
          <el-progress 
            :percentage="taskProgress" 
            :color="progressColor" 
            :status="progressStatus"
          />
        </div>
        
        <div class="mt-4 flex justify-center">
          <el-button 
            type="primary" 
            @click="submitTask" 
            :loading="submitting"
            :disabled="!canSubmit"
          >
            提交任务
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { useWebSocket } from '../composables/useWebSocket';
import { submitPrintTask } from '../composables/useApi';

const props = defineProps({
  modelUrl: {
    type: String,
    default: ''
  },
  position: {
    type: Object,
    default: () => ({ x: 0, y: 0 })
  }
});

const emit = defineEmits(['task-submitted']);

// 切片参数
const sliceParams = reactive({
  layerHeight: 0.2,
  infill: 20,
  printSpeed: 'medium',
  support: false,
  nozzleTemp: 220,
  bedTemp: 60
});

// WebSocket状态
const { 
  connected, 
  taskStatus, 
  taskProgress, 
  error 
} = useWebSocket('ws://localhost:8080/ws');

// 提交状态
const submitting = ref(false);

// 计算WebSocket状态文本和样式
const wsStatusText = computed(() => {
  if (error.value) return '错误';
  return connected.value ? '已连接' : '未连接';
});

const wsStatusClass = computed(() => {
  if (error.value) return 'text-red-400';
  return connected.value ? 'text-green-400' : 'text-yellow-400';
});

// 计算任务状态样式
const taskStatusClass = computed(() => {
  switch (taskStatus.value) {
    case '生成中':
    case '切片中':
    case '路径规划中':
      return 'text-blue-400';
    case '待执行':
      return 'text-yellow-400';
    case '完成':
      return 'text-green-400';
    case '失败':
      return 'text-red-400';
    default:
      return 'text-gray-300';
  }
});

// 计算进度条颜色
const progressColor = computed(() => {
  if (taskProgress.value === 100) return '#67c23a';
  if (taskProgress.value > 75) return '#e6a23c';
  if (taskProgress.value > 0) return '#409eff';
  return '#909399';
});

// 计算进度条状态
const progressStatus = computed(() => {
  if (taskStatus.value === '完成') return 'success';
  if (taskStatus.value === '失败') return 'exception';
  return '';
});

// 计算是否可以提交任务
const canSubmit = computed(() => {
  return props.modelUrl && connected.value && !submitting.value;
});

// 提交任务
const submitTask = async () => {
  if (!canSubmit.value) {
    ElMessage.warning('无法提交任务，请检查模型和连接状态');
    return;
  }

  submitting.value = true;
  
  try {
    const taskData = {
      modelUrl: props.modelUrl,
      position: props.position,
      sliceParams: { ...sliceParams }
    };
    
    // 调用API提交任务
    // 注意：这里使用模拟数据，实际项目中应调用真实API
    // const response = await submitPrintTask(taskData);
    
    // API响应
    const response = await submitPrintTask(taskData);
    emit('task-submitted', { taskId: response.data.taskId, ...taskData });
    
    ElMessage.success('任务提交成功');
    emit('task-submitted', { taskId: 'task-' + Date.now(), ...taskData });
  } catch (error) {
    console.error('提交任务失败:', error);
    ElMessage.error('任务提交失败，请重试');
  } finally {
    submitting.value = false;
  }
};

// 暴露切片参数给父组件
defineExpose({
  sliceParams
});
</script>

<style scoped>
.slice-config {
  height: 100%;
  overflow-y: auto;
}

/* 自定义滚动条 */
.slice-config::-webkit-scrollbar {
  width: 6px;
}

.slice-config::-webkit-scrollbar-track {
  background: #1a1a2e;
}

.slice-config::-webkit-scrollbar-thumb {
  background: #34495e;
  border-radius: 3px;
}

.slice-config::-webkit-scrollbar-thumb:hover {
  background: #4a6741;
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

:deep(.el-radio-button__inner) {
  background-color: #0c1220;
  border-color: #2a3a50;
  color: #fff;
}

:deep(.el-radio-button__orig-radio:checked+.el-radio-button__inner) {
  background-color: #409eff;
  border-color: #409eff;
  box-shadow: -1px 0 0 0 #409eff;
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

:deep(.el-switch__core) {
  background-color: #2a3a50;
}

:deep(.el-switch.is-checked .el-switch__core) {
  background-color: #409eff;
}
</style>