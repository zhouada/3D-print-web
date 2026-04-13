<template>
  <div class="model-generator">
    <h3 class="text-lg font-medium text-white mb-4">模型生成</h3>
    
    <el-form :model="modelForm" label-position="top">
      <el-form-item label="文本描述">
        <el-input
          v-model="modelForm.description"
          type="textarea"
          :rows="4"
          placeholder="输入模型描述"
          class="bg-gray-800 border-gray-700 text-white"
        />
      </el-form-item>
      
      <el-form-item label="或上传图片">
        <el-upload
          v-model:file-list="fileList"
          class="upload-demo"
          action="#"
          :auto-upload="false"
          :on-change="handleFileChange"
          :limit="1"
          :before-remove="handleBeforeRemove"
        >
          <el-button type="primary" :icon="Plus">选择图片</el-button>
          <template #tip>
            <div class="el-upload__tip text-gray-400">
              请上传JPG、PNG格式的图片
            </div>
          </template>
        </el-upload>
      </el-form-item>
      
      <el-form-item>
        <el-button 
          type="primary" 
          @click="generateModel" 
          :loading="generating"
          :disabled="!canGenerate"
        >
          生成模型
        </el-button>
      </el-form-item>
    </el-form>
    
    <!-- 生成结果 -->
    <div v-if="modelUrl" class="mt-4 p-3 bg-gray-800 rounded">
      <p class="text-green-400">模型生成成功！</p>
      <el-button 
        type="text" 
        class="text-blue-400" 
        @click="previewModel"
      >
        查看模型
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { generateModel as apiGenerateModel } from '../composables/useApi';

const emit = defineEmits(['model-generated']);

const modelForm = reactive({
  description: '',
});

const fileList = ref([]);
const generating = ref(false);
const modelUrl = ref('');

// 计算是否可以生成模型
const canGenerate = computed(() => {
  return modelForm.description.trim() || fileList.value.length > 0;
});

// 处理文件变化
const handleFileChange = (file) => {
  // 清除文本描述
  if (file) {
    modelForm.description = '';
  }
};

// 处理文件删除前的确认
const handleBeforeRemove = (file) => {
  return ElMessage.confirm(`确定移除 ${file.name}？`);
};

// 生成模型
const generateModel = async () => {
  if (!canGenerate.value) {
    ElMessage.warning('请输入文本描述或上传图片');
    return;
  }

  generating.value = true;
  
  try {
    let requestData = {};
    
    // 根据输入类型准备请求数据
    if (modelForm.description.trim()) {
      requestData = {
        description: modelForm.description.trim()
      };
    } else if (fileList.value.length > 0) {
      // 处理图片上传
      const file = fileList.value[0].raw;
      const reader = new FileReader();
      
      // 使用Promise等待文件读取完成
      await new Promise((resolve, reject) => {
        reader.onload = () => resolve();
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      requestData = {
        image: reader.result.split(',')[1] // 移除data:image/png;base64,前缀
      };
    }
    
    // 调用API生成模型
    // 注意：这里使用模拟数据，实际项目中应调用真实API
    // const response = await apiGenerateModel(requestData);
    
    // 模拟API响应
    //await new Promise(resolve => setTimeout(resolve, 2000));
    // 模拟模型URL
    //modelUrl.value = 'https://example.com/models/sample.stl';

    const response = await apiGenerateModel(requestData);
    modelUrl.value = response.data.modelUrl; // 后端返回的真实模型URL
    
    // 触发模型生成事件
    emit('model-generated', modelUrl.value);
    
    ElMessage.success('模型生成成功');
  } catch (error) {
    console.error('生成模型失败:', error);
    ElMessage.error('生成模型失败，请重试');
  } finally {
    generating.value = false;
  }
};

// 预览模型
const previewModel = () => {
  emit('model-generated', modelUrl.value);
};
</script>

<style scoped>
.model-generator {
  height: 100%;
  overflow-y: auto;
}

/* 自定义滚动条 */
.model-generator::-webkit-scrollbar {
  width: 6px;
}

.model-generator::-webkit-scrollbar-track {
  background: #1a1a2e;
}

.model-generator::-webkit-scrollbar-thumb {
  background: #34495e;
  border-radius: 3px;
}

.model-generator::-webkit-scrollbar-thumb:hover {
  background: #4a6741;
}
</style>