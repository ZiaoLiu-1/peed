// API客户端
const API_BASE_URL = '/api'

class ApiClient {
  // 基础请求方法
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body)
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // GET请求
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `${endpoint}?${queryString}` : endpoint
    return this.request(url, { method: 'GET' })
  }

  // POST请求
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: data,
    })
  }

  // PUT请求
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data,
    })
  }

  // DELETE请求
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' })
  }

  // 用户相关API
  async registerUser(userData) {
    return this.post('/auth/register', userData)
  }

  async loginUser(credentials) {
    return this.post('/auth/login', credentials)
  }

  async getUserProfile(userId) {
    return this.get(`/profile/${userId}`)
  }

  async updateUserProfile(userId, profileData) {
    return this.put(`/profile/${userId}`, profileData)
  }

  async uploadAvatar(userId, avatarData) {
    return this.post(`/profile/${userId}/avatar`, { avatar_data: avatarData })
  }

  async connectWallet(userId, walletData) {
    return this.post(`/wallet/${userId}`, walletData)
  }

  async disconnectWallet(userId) {
    return this.delete(`/wallet/${userId}`)
  }

  async getUserStats(userId) {
    return this.get(`/stats/${userId}`)
  }

  // 训练相关API
  async recordTraining(trainingData) {
    return this.post('/tigang/training/record', trainingData)
  }

  async getTrainingHistory(userId, params = {}) {
    return this.get(`/tigang/training/history/${userId}`, params)
  }

  async getTrainingStats(userId) {
    return this.get(`/tigang/training/stats/${userId}`)
  }

  async getTrainingConfigs() {
    return this.get('/tigang/training/config')
  }

  async getTrainingLeaderboard(params = {}) {
    return this.get('/tigang/training/leaderboard', params)
  }

  // 成就相关API
  async getAchievements() {
    return this.get('/tigang/achievements')
  }

  async getUserAchievements(userId) {
    return this.get(`/tigang/achievements/${userId}`)
  }

  async checkAchievements(userId) {
    return this.post(`/tigang/achievements/check/${userId}`)
  }

  // 全局统计API
  async getGlobalStats() {
    return this.get('/tigang/stats/global')
  }

  // 初始化数据API
  async initAchievements() {
    return this.post('/tigang/init-achievements')
  }

  // 健康检查
  async healthCheck() {
    try {
      const response = await fetch('/health')
      return response.json()
    } catch (error) {
      console.error('Health check failed:', error)
      throw error
    }
  }
}

// 创建API客户端实例
const apiClient = new ApiClient()

// 训练配置常量
export const TRAINING_CONFIGS = {
  beginner: {
    name: '新手级',
    name_en: 'Beginner',
    contract_time: 5,
    relax_time: 5,
    reps_per_set: 8,
    sets_count: 2,
    daily_sessions: 2,
    description: '适合初学者的轻松训练',
    description_en: 'Easy training for beginners'
  },
  intermediate: {
    name: '入门级',
    name_en: 'Intermediate',
    contract_time: 8,
    relax_time: 8,
    reps_per_set: 12,
    sets_count: 3,
    daily_sessions: 3,
    description: '中等强度的平衡训练',
    description_en: 'Moderate intensity balanced training'
  },
  advanced: {
    name: '精通级',
    name_en: 'Advanced',
    contract_time: 12,
    relax_time: 6,
    reps_per_set: 15,
    sets_count: 4,
    daily_sessions: 3,
    description: '高强度的专业训练',
    description_en: 'High intensity professional training'
  }
}

// 导出API客户端
export default apiClient

// 导出常用的API方法（向后兼容）
export const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
  connectWallet,
  disconnectWallet,
  getUserStats,
  recordTraining,
  getTrainingHistory,
  getTrainingStats,
  getTrainingConfigs,
  getTrainingLeaderboard,
  getAchievements,
  getUserAchievements,
  checkAchievements,
  getGlobalStats,
  initAchievements,
  healthCheck
} = apiClient

