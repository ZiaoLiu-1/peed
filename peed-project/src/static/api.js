// API服务配置
const API_BASE_URL = '/api/tigang';

// 通用API请求函数
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// 用户相关API
export const userAPI = {
  // 获取所有用户
  getUsers: () => apiRequest('/users'),
  
  // 创建用户
  createUser: (userData) => apiRequest('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  // 获取用户详情
  getUser: (userId) => apiRequest(`/users/${userId}`),
  
  // 更新用户信息
  updateUser: (userId, userData) => apiRequest(`/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),
};

// 运动记录相关API
export const exerciseAPI = {
  // 记录运动
  recordExercise: (exerciseData) => apiRequest('/exercises', {
    method: 'POST',
    body: JSON.stringify(exerciseData),
  }),
  
  // 获取用户运动记录
  getUserExercises: (userId, page = 1, perPage = 20) => 
    apiRequest(`/exercises/${userId}?page=${page}&per_page=${perPage}`),
};

// 统计数据相关API
export const statsAPI = {
  // 获取用户统计
  getUserStats: (userId) => apiRequest(`/stats/${userId}`),
  
  // 获取全局统计
  getGlobalStats: () => apiRequest('/stats/global'),
};

// 社区相关API
export const communityAPI = {
  // 获取今日用户列表
  getTodayUsers: () => apiRequest('/community/today-users'),
  
  // 获取社区动态
  getPosts: (page = 1, perPage = 10) => 
    apiRequest(`/community/posts?page=${page}&per_page=${perPage}`),
  
  // 创建社区动态
  createPost: (postData) => apiRequest('/community/posts', {
    method: 'POST',
    body: JSON.stringify(postData),
  }),
};

// 排行榜相关API
export const leaderboardAPI = {
  // 获取排行榜
  getLeaderboard: (periodType) => apiRequest(`/leaderboard/${periodType}`),
};

// 推特相关API
export const twitterAPI = {
  // 绑定推特
  bindTwitter: (userId, twitterHandle) => apiRequest('/twitter/bind', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, twitter_handle: twitterHandle }),
  }),
  
  // 分享到推特
  shareToTwitter: (userId, content) => apiRequest('/twitter/share', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, content }),
  }),
};

// 初始化数据API
export const initAPI = {
  // 初始化示例数据
  initSampleData: () => apiRequest('/init-data', {
    method: 'POST',
  }),
};

