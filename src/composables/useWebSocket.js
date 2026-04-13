import { ref, onMounted, onUnmounted } from 'vue';

export function useWebSocket(url) {
  const ws = ref(null);
  const connected = ref(false);
  const taskStatus = ref('未连接');
  const taskProgress = ref(0);
  const error = ref(null);
  
  let reconnectTimer = null;
  const MAX_RECONNECT_ATTEMPTS = 5;
  let reconnectAttempts = 0;
  
  const connect = () => {
    try {
      ws.value = new WebSocket(url);
      
      ws.value.onopen = () => {
        console.log('WebSocket连接已建立');
        connected.value = true;
        error.value = null;
        reconnectAttempts = 0;
        taskStatus.value = '已连接';
      };
      
      ws.value.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          taskStatus.value = data.status || '未知状态';
          taskProgress.value = data.progress || 0;
        } catch (e) {
          console.error('解析WebSocket消息失败:', e);
        }
      };
      
      ws.value.onclose = () => {
        console.log('WebSocket连接已关闭');
        connected.value = false;
        taskStatus.value = '连接已关闭';
        attemptReconnect();
      };
      
      ws.value.onerror = (err) => {
        console.error('WebSocket错误:', err);
        error.value = '连接错误';
        taskStatus.value = '连接错误';
      };
    } catch (e) {
      console.error('创建WebSocket连接失败:', e);
      error.value = '连接失败';
      taskStatus.value = '连接失败';
      attemptReconnect();
    }
  };
  
  const attemptReconnect = () => {
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
      console.log(`将在${delay}ms后尝试重连...`);
      
      reconnectTimer = setTimeout(() => {
        connect();
      }, delay);
    } else {
      error.value = '重连失败，请刷新页面';
      taskStatus.value = '重连失败';
    }
  };
  
  const disconnect = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    
    if (ws.value) {
      ws.value.close();
      ws.value = null;
    }
    
    connected.value = false;
    taskStatus.value = '已断开';
    taskProgress.value = 0;
  };
  
  // 模拟任务状态更新（用于演示）
  const simulateTaskProgress = () => {
    const statuses = ['生成中', '切片中', '路径规划中', '待执行', '完成'];
    let currentStatus = 0;
    let progress = 0;
    
    taskStatus.value = statuses[currentStatus];
    taskProgress.value = progress;
    
    const interval = setInterval(() => {
      progress += 5;
      taskProgress.value = progress;
      
      if (progress >= 100) {
        progress = 0;
        currentStatus++;
        
        if (currentStatus >= statuses.length) {
          clearInterval(interval);
          taskStatus.value = '完成';
          taskProgress.value = 100;
          return;
        }
        
        taskStatus.value = statuses[currentStatus];
      }
    }, 1000);
  };
  
  onMounted(() => {
    connect();
    // 如果是演示环境，启动模拟任务进度
    if (url.includes('localhost')) {
      setTimeout(() => {
        simulateTaskProgress();
      }, 2000);
    }
  });
  
  onUnmounted(() => {
    disconnect();
  });
  
  return {
    connected,
    taskStatus,
    taskProgress,
    error,
    reconnect: connect,
    disconnect
  };
}