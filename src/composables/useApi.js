import request from '../utils/request';

// 生成模型
export const generateModel = async (data) => {
  try {
    const response = await request.post('/generate', data);
    return response;
  } catch (error) {
    console.error('生成模型失败:', error);
    throw error;
  }
};

// 提交打印任务
export const submitPrintTask = async (data) => {
  try {
    const response = await request.post('/submit', data);
    return response;
  } catch (error) {
    console.error('提交任务失败:', error);
    throw error;
  }
};

// 获取任务状态
export const getTaskStatus = async (taskId) => {
  try {
    const response = await request.get(`/task/${taskId}`);
    return response;
  } catch (error) {
    console.error('获取任务状态失败:', error);
    throw error;
  }
};

// 获取模型列表
export const getModelList = async () => {
  try {
    const response = await request.get('/models');
    return response;
  } catch (error) {
    console.error('获取模型列表失败:', error);
    throw error;
  }
};

// 删除模型
export const deleteModel = async (modelId) => {
  try {
    const response = await request.delete(`/model/${modelId}`);
    return response;
  } catch (error) {
    console.error('删除模型失败:', error);
    throw error;
  }
};

// 上传图片
export const uploadImage = async (formData) => {
  try {
    const response = await request.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response;
  } catch (error) {
    console.error('上传图片失败:', error);
    throw error;
  }
};