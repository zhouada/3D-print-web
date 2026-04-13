// utils/request.js
import axios from 'axios';
import { ElMessage } from 'element-plus';

// 创建axios实例，配置基础URL
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL , // 从环境变量读取
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json' // 默认JSON格式
  }
});

// 请求拦截器：添加token等（可选）
request.interceptors.request.use(
  (config) => {
    // 若有登录token，添加到请求头
    // const token = localStorage.getItem('token');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器：统一处理错误
request.interceptors.response.use(
  (response) => response, // 成功返回响应
  (error) => {
    // 详细错误信息提示
    const errMsg = error.response?.data?.message || error.message || '请求失败';
    ElMessage.error(`API调用失败：${errMsg}`);
    
    // 打印详细错误（便于调试）
    console.error('请求错误详情：', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

export default request;