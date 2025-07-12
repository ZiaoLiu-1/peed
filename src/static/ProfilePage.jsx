import React, { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Camera, Edit3, Save, X, User, Calendar, Trophy, TrendingUp, Target, Clock, Flame, Star, Award, Loader, AlertCircle, Wallet } from 'lucide-react'
import apiClient from './api.js'

// 复用主页面的UI组件
const Button = ({ children, variant = 'default', onClick, className = '', disabled = false, ...props }) => {
  const baseClass = 'px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    default: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  }
  
  return (
    <button
      className={`${baseClass} ${variants[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

const Card = ({ children, className = '', ...props }) => (
  <div className={`bg-white rounded-xl shadow-lg border border-gray-100 p-6 ${className}`} {...props}>
    {children}
  </div>
)

const Badge = ({ children, className = '', ...props }) => (
  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${className}`} {...props}>
    {children}
  </span>
)

// Loading component
const LoadingSpinner = ({ size = 'medium' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8'
  }
  
  return (
    <div className="flex items-center justify-center">
      <Loader className={`animate-spin text-green-600 ${sizeClasses[size]}`} />
    </div>
  )
}

// Error component
const ErrorMessage = ({ message, onRetry }) => (
  <div className="flex items-center justify-center p-6 text-center">
    <div className="max-w-md">
      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <p className="text-gray-600 mb-4">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          重试
        </Button>
      )}
    </div>
  </div>
)

// 头像上传组件
const AvatarUpload = ({ avatar, onAvatarChange, language, isUploading }) => {
  const fileInputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        onAvatarChange(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    handleFileSelect(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div
        className={`relative w-24 h-24 rounded-full border-4 border-dashed transition-all duration-300 cursor-pointer group ${
          isDragging ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-green-400'
        } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        {avatar ? (
          <img
            src={avatar}
            alt="Avatar"
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
            <img
              src="/peed-logo.png"
              alt="Default Avatar"
              className="w-16 h-16 rounded-full"
            />
          </div>
        )}
        
        {/* 上传覆盖层 */}
        <div className={`absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isUploading ? 'opacity-100' : ''}`}>
          {isUploading ? (
            <LoadingSpinner size="small" />
          ) : (
            <Camera className="w-6 h-6 text-white" />
          )}
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files[0])}
        className="hidden"
        disabled={isUploading}
      />
      
      <p className="text-xs text-gray-500 text-center">
        {language === 'zh' ? '点击或拖拽上传头像' : 'Click or drag to upload avatar'}
      </p>
    </div>
  )
}

// 统计卡片组件
const StatCard = ({ icon: Icon, title, value, subtitle, color = 'green', isLoading = false }) => {
  const colorClasses = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  }

  return (
    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClasses[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-600">{title}</p>
        {isLoading ? (
          <LoadingSpinner size="small" />
        ) : (
          <>
            <p className="text-xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </>
        )}
      </div>
    </div>
  )
}

// 训练记录项组件
const TrainingRecord = ({ record, language }) => {
  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800'
  }

  const difficultyLabels = {
    zh: { 
      beginner: '新手级', 
      intermediate: '入门级', 
      advanced: '精通级' 
    },
    en: { 
      beginner: 'Beginner', 
      intermediate: 'Intermediate', 
      advanced: 'Advanced' 
    }
  }

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US')
  }

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">
          {language === 'zh' ? '提肛训练' : 'Tigang Training'}
        </p>
        <p className="text-xs text-gray-500">{formatDate(record.session_date)}</p>
        <p className="text-xs text-gray-500">
          {record.sets_completed} {language === 'zh' ? '组' : 'sets'} × {record.reps_completed} {language === 'zh' ? '次' : 'reps'}
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <Badge className={difficultyColors[record.difficulty]}>
          {difficultyLabels[language][record.difficulty]}
        </Badge>
        <span className="text-sm text-gray-600">{formatDuration(record.total_duration)}</span>
      </div>
    </div>
  )
}

// 成就徽章组件
const AchievementBadge = ({ achievement, language }) => {
  const iconMap = {
    Play: Target,
    Flame: Flame,
    Trophy: Trophy,
    Star: Star,
    Clock: Clock,
    Target: Target
  }
  
  const Icon = iconMap[achievement.achievement?.icon] || Award
  const isUnlocked = achievement.unlocked
  const progress = achievement.progress || 0
  const targetValue = achievement.achievement?.target_value || 100
  const progressPercentage = Math.min((progress / targetValue) * 100, 100)

  return (
    <div className={`p-4 rounded-lg border-2 transition-all duration-300 ${
      isUnlocked 
        ? 'border-yellow-300 bg-yellow-50 shadow-md' 
        : 'border-gray-200 bg-gray-50'
    }`}>
      <div className="flex items-center space-x-3 mb-2">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isUnlocked ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-200 text-gray-400'
        }`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <p className={`text-sm font-medium ${isUnlocked ? 'text-gray-900' : 'text-gray-500'}`}>
            {language === 'zh' ? achievement.achievement?.name : achievement.achievement?.name_en}
          </p>
          <p className="text-xs text-gray-500">
            {language === 'zh' ? achievement.achievement?.description : achievement.achievement?.description_en}
          </p>
        </div>
      </div>
      {!isUnlocked && progress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      )}
      {!isUnlocked && progress > 0 && (
        <p className="text-xs text-gray-500 mt-1">
          {progress} / {targetValue}
        </p>
      )}
    </div>
  )
}

const ProfilePage = ({ language = 'zh', onBack, walletAddress = null, walletType = null }) => {
  // State management
  const [userProfile, setUserProfile] = useState(null)
  const [trainingStats, setTrainingStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditingNickname, setIsEditingNickname] = useState(false)
  const [tempNickname, setTempNickname] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // 格式化钱包地址显示
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // 基于钱包地址获取或创建用户
  const getOrCreateUserByWallet = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 首先尝试通过钱包地址找到现有用户
      const users = await apiClient.get('/users');
      let existingUser = users.find(user => user.wallet_address === walletAddress);
      
      if (!existingUser) {
        // 如果没有找到，创建新用户，用户名直接使用钱包地址确保唯一性
        const newUser = await apiClient.registerUser({
          username: walletAddress, // 直接使用钱包地址作为用户名
          nickname: `${walletType || 'Wallet'} 用户`,
          wallet_address: walletAddress,
          wallet_type: walletType
        });
        
        // 获取完整的用户资料
        const fullProfile = await apiClient.getUserProfile(newUser.id);
        return fullProfile;
      } else {
        // 如果找到了，确保钱包信息是最新的
        if (!existingUser.wallet_address || existingUser.wallet_address !== walletAddress) {
          await apiClient.connectWallet(existingUser.id, {
            wallet_address: walletAddress,
            wallet_type: walletType
          });
        }
        
        // 获取完整的用户资料
        const fullProfile = await apiClient.getUserProfile(existingUser.id);
        return fullProfile;
      }
    } catch (error) {
      console.error('Failed to get or create user by wallet:', error);
      throw error;
    }
  };

  // 获取每个等级的今日和本周训练数据
  const fetchLevelStats = async (userId, difficulty) => {
    const today = new Date().toISOString().split('T')[0];
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekStartStr = weekStart.toISOString().split('T')[0];
    
    try {
      // 获取今日训练
      const todayResponse = await fetch(`/api/tigang/training/history/${userId}?start_date=${today}&end_date=${today}&difficulty=${difficulty}`);
      const todayData = todayResponse.ok ? await todayResponse.json() : { training_records: [] };
      const todayCount = todayData.training_records?.length || 0;
      
      // 获取本周训练
      const weekResponse = await fetch(`/api/tigang/training/history/${userId}?start_date=${weekStartStr}&end_date=${today}&difficulty=${difficulty}`);
      const weekData = weekResponse.ok ? await weekResponse.json() : { training_records: [] };
      const weekCount = weekData.training_records?.length || 0;
      
      return { todayCount, weekCount };
    } catch (error) {
      console.error(`Failed to fetch ${difficulty} level stats:`, error);
      return { todayCount: 0, weekCount: 0 };
    }
  };

  // Fetch user profile data
  const fetchUserProfile = async () => {
    if (!walletAddress) {
      setError(language === 'zh' ? '需要连接钱包' : 'Wallet connection required');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const profile = await getOrCreateUserByWallet();
      setUserProfile(profile);
      setTempNickname(profile.nickname || `${walletType || 'Wallet'} 用户`);
      
      // 直接使用用户资料中的统计数据，无需额外API请求
      try {
        // 为每个等级获取详细的今日和本周数据
        const difficulties = ['beginner', 'intermediate', 'advanced'];
        
        const difficulty_breakdown_enhanced = await Promise.all(
          difficulties.map(async (difficulty) => {
            // 使用用户资料中的difficulty_breakdown数据
            const existingData = profile.stats?.difficulty_breakdown?.[difficulty] || {
              count: 0,
              total_duration: 0
            };
            
            const { todayCount, weekCount } = await fetchLevelStats(profile.id, difficulty);
            
            // 从recent_training中获取更详细的数据
            const recentTraining = profile.recent_training?.filter(t => t.difficulty === difficulty) || [];
            const totalSets = recentTraining.reduce((sum, t) => sum + (t.sets_completed || 0), 0);
            const totalReps = recentTraining.reduce((sum, t) => sum + (t.reps_completed || 0), 0);
            
            return {
              difficulty,
              session_count: existingData.count || 0,
              total_sets: totalSets || Math.round((existingData.count || 0) * 3), // 默认估算
              total_reps: totalReps || Math.round((existingData.count || 0) * 36), // 默认估算
              total_time_minutes: existingData.total_duration ? Math.round(existingData.total_duration / 60 * 10) / 10 : 0,
              todayCount,
              weekCount
            };
          })
        );
        
        const enhancedStats = {
          // 使用用户资料中的基础统计
          total_sessions: profile.stats?.total_exercises || 0,
          streak_days: profile.stats?.current_streak || 0,
          total_duration_minutes: profile.stats?.total_time_hours ? profile.stats.total_time_hours * 60 : 0,
          weekly_sessions: profile.stats?.weekly_progress || 0,
          // 添加增强的分级数据
          difficulty_breakdown_enhanced
        };
        
        setTrainingStats(enhancedStats);
      } catch (statsError) {
        console.error('Failed to process profile stats:', statsError);
        setTrainingStats(null);
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setError(language === 'zh' ? '获取用户资料失败' : 'Failed to fetch user profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchUserProfile();
  }, [walletAddress, walletType]);

  // Handle avatar upload
  const handleAvatarChange = async (avatarData) => {
    if (!userProfile) return;
    
    try {
      setIsUploading(true);
      await apiClient.uploadAvatar(userProfile.id, avatarData);
      
      // Update local state
      setUserProfile(prev => ({
        ...prev,
        avatar_url: avatarData
      }));
    } catch (err) {
      console.error('Failed to upload avatar:', err);
      alert(language === 'zh' ? '头像上传失败' : 'Failed to upload avatar');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle nickname editing
  const handleNicknameEdit = () => {
    setIsEditingNickname(true);
  };

  const handleNicknameSave = async () => {
    if (!userProfile) return;
    
    try {
      setIsSaving(true);
      await apiClient.updateUserProfile(userProfile.id, { nickname: tempNickname });
      
      // Update local state
      setUserProfile(prev => ({
        ...prev,
        nickname: tempNickname
      }));
      
      setIsEditingNickname(false);
    } catch (err) {
      console.error('Failed to update nickname:', err);
      alert(language === 'zh' ? '昵称更新失败' : 'Failed to update nickname');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNicknameCancel = () => {
    setTempNickname(userProfile?.nickname || `${walletType || 'Wallet'} 用户`);
    setIsEditingNickname(false);
  };

  // Format date helper
  const formatJoinDate = (dateString) => {
    if (!dateString) return language === 'zh' ? '未知' : 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <Button variant="outline" onClick={onBack} className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {language === 'zh' ? '返回' : 'Back'}
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              {language === 'zh' ? '个人资料' : 'Profile'}
            </h1>
          </div>
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <Button variant="outline" onClick={onBack} className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {language === 'zh' ? '返回' : 'Back'}
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              {language === 'zh' ? '个人资料' : 'Profile'}
            </h1>
          </div>
          <ErrorMessage message={error} onRetry={fetchUserProfile} />
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          <ErrorMessage 
            message={language === 'zh' ? '用户资料不存在' : 'User profile not found'} 
            onRetry={fetchUserProfile} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="outline" onClick={onBack} className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {language === 'zh' ? '返回' : 'Back'}
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              {language === 'zh' ? '个人资料' : 'Profile'}
            </h1>
          </div>
        </div>

        {/* Profile Header */}
        <Card>
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-6">
            <AvatarUpload
              avatar={userProfile.avatar_url}
              onAvatarChange={handleAvatarChange}
              language={language}
              isUploading={isUploading}
            />
            
            <div className="flex-1 space-y-3">
              <div className="flex items-center space-x-3">
                {isEditingNickname ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={tempNickname}
                      onChange={(e) => setTempNickname(e.target.value)}
                      className="text-xl font-bold border border-gray-300 rounded px-2 py-1"
                      autoFocus
                    />
                    <Button 
                      onClick={handleNicknameSave} 
                      size="sm" 
                      disabled={isSaving}
                      className="p-1"
                    >
                      {isSaving ? <LoadingSpinner size="small" /> : <Save className="w-4 h-4" />}
                    </Button>
                    <Button 
                      onClick={handleNicknameCancel} 
                      variant="outline" 
                      size="sm"
                      className="p-1"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <h2 className="text-xl font-bold text-gray-900">{userProfile.nickname}</h2>
                    <Button 
                      onClick={handleNicknameEdit} 
                      variant="outline" 
                      size="sm"
                      className="p-1"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
              
              <p className="text-gray-600">@{userProfile.username}</p>
              <p className="text-gray-600">{userProfile.bio}</p>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Wallet className="w-4 h-4" />
                  <span>
                    {language === 'zh' ? '钱包: ' : 'Wallet: '} 
                    {formatAddress(walletAddress)}
                  </span>
                  <Badge className="bg-blue-100 text-blue-800 text-xs">
                    {walletType}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Wallet className="w-4 h-4" />
                  <span>
                    {language === 'zh' ? '钱包: ' : 'Wallet: '} 
                    {formatAddress(walletAddress)}
                  </span>
                  <Badge className="bg-blue-100 text-blue-800 text-xs">
                    {walletType}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {language === 'zh' ? '加入时间: ' : 'Joined: '} 
                    {formatJoinDate(userProfile.created_at)}
                  </span>
                </div>
                {userProfile.email && (
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>{userProfile.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Training Statistics by Level */}
        <Card>
          <h3 className="text-lg font-semibold mb-6 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            {language === 'zh' ? '训练统计' : 'Training Statistics'}
          </h3>
          

          
          {trainingStats?.difficulty_breakdown_enhanced ? (
            <div className="space-y-6">
              {trainingStats.difficulty_breakdown_enhanced.map((difficultyData) => {
                const difficultyLabels = {
                  beginner: language === 'zh' ? '新手级' : 'Beginner',
                  intermediate: language === 'zh' ? '入门级' : 'Intermediate', 
                  advanced: language === 'zh' ? '精通级' : 'Advanced'
                };
                
                const difficultyGradients = {
                  beginner: 'from-green-500 to-emerald-600',
                  intermediate: 'from-yellow-500 to-orange-600',
                  advanced: 'from-red-500 to-pink-600'
                };
                
                return (
                  <div key={difficultyData.difficulty} className="rounded-xl overflow-hidden shadow-lg">
                    {/* 训练中心风格的头部 */}
                    <div className={`bg-gradient-to-r ${difficultyGradients[difficultyData.difficulty]} text-white p-6`}>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xl font-bold flex items-center space-x-2">
                          <Trophy className="w-6 h-6" />
                          <span>{difficultyLabels[difficultyData.difficulty] || difficultyData.difficulty}</span>
                        </h4>
                        <div className="text-right">
                          <div className="text-sm opacity-90">{language === 'zh' ? '当前级别' : 'Current Level'}</div>
                          <div className="font-semibold">{difficultyLabels[difficultyData.difficulty]?.split('（')[0] || difficultyLabels[difficultyData.difficulty]?.split(' (')[0] || difficultyData.difficulty}</div>
                        </div>
                      </div>
                      
                      {/* 训练中心风格的4个指标 */}
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold">{difficultyData.todayCount || 0}</div>
                          <div className="text-xs opacity-90">{language === 'zh' ? '今日训练' : 'Today'}</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{difficultyData.weekCount || 0}</div>
                          <div className="text-xs opacity-90">{language === 'zh' ? '本周训练' : 'This Week'}</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{difficultyData.session_count || 0}</div>
                          <div className="text-xs opacity-90">{language === 'zh' ? '总完成次数' : 'Total'}</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{trainingStats?.streak_days || 0}</div>
                          <div className="text-xs opacity-90">{language === 'zh' ? '连续天数' : 'Streak'}</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* 详细数据 */}
                    <div className="bg-white p-6">
                      <h5 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                        {language === 'zh' ? '详细统计' : 'Detailed Statistics'}
                      </h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-gray-900">{difficultyData.total_sets || 0}</div>
                          <div className="text-xs text-gray-600">{language === 'zh' ? '总组数' : 'Total Sets'}</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-gray-900">{difficultyData.total_reps || 0}</div>
                          <div className="text-xs text-gray-600">{language === 'zh' ? '总重复次数' : 'Total Reps'}</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-gray-900">{Math.round(difficultyData.total_time_minutes || 0)}</div>
                          <div className="text-xs text-gray-600">{language === 'zh' ? '训练时长(分钟)' : 'Duration (min)'}</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-gray-900">
                            {difficultyData.total_time_minutes ? Math.round(difficultyData.total_time_minutes / 60 * 10) / 10 : 0}h
                          </div>
                          <div className="text-xs text-gray-600">{language === 'zh' ? '总时长' : 'Total Hours'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {language === 'zh' ? '暂无训练数据' : 'No training data yet'}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                {language === 'zh' ? '开始你的第一次训练吧！' : 'Start your first training session!'}
              </p>
            </div>
          )}
        </Card>

        {/* Recent Training */}
        <Card>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            {language === 'zh' ? '最近训练' : 'Recent Training'}
          </h3>
          
          <div className="space-y-3">
            {userProfile.recent_training && userProfile.recent_training.length > 0 ? (
              userProfile.recent_training.map((record) => (
                <TrainingRecord
                  key={record.id}
                  record={record}
                  language={language}
                />
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                {language === 'zh' ? '暂无训练记录' : 'No training records yet'}
              </p>
            )}
          </div>
        </Card>

        {/* Achievements */}
        <Card>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2" />
            {language === 'zh' ? '成就系统' : 'Achievements'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userProfile.achievements && userProfile.achievements.length > 0 ? (
              userProfile.achievements.map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement}
                  language={language}
                />
              ))
            ) : (
              <p className="text-gray-500 text-center py-4 col-span-full">
                {language === 'zh' ? '暂无成就数据' : 'No achievements data'}
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage; 