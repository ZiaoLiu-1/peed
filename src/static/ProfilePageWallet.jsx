import React, { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Camera, Edit3, Save, X, User, Calendar, Trophy, TrendingUp, Target, Clock, Flame, Star, Award, Loader, AlertCircle, Wallet, Globe } from 'lucide-react'
import apiClient from './api.js'

// UI 组件
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

// Pagination component
const Pagination = ({ currentPage, totalPages, totalRecords, onPageChange, onPrevious, onNext, language, isLoading }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + maxVisible - 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  return (
    <div className="flex items-center justify-between mt-6 p-4 bg-gray-50 rounded-lg">
      <div className="text-sm text-gray-600">
        {language === 'zh' ? `共 ${totalRecords} 条记录` : `Total ${totalRecords} records`}
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={currentPage === 1 || isLoading}
          className="px-3 py-1 text-sm"
        >
          {language === 'zh' ? '上一页' : 'Previous'}
        </Button>
        
        {getPageNumbers().map(page => (
          <Button
            key={page}
            variant={page === currentPage ? 'default' : 'outline'}
            onClick={() => onPageChange(page)}
            disabled={isLoading}
            className="px-3 py-1 text-sm min-w-[2rem]"
          >
            {page}
          </Button>
        ))}
        
        <Button
          variant="outline"
          onClick={onNext}
          disabled={currentPage === totalPages || isLoading}
          className="px-3 py-1 text-sm"
        >
          {language === 'zh' ? '下一页' : 'Next'}
        </Button>
      </div>
    </div>
  );
};

const ProfilePageWallet = ({ language = 'zh', onBack, walletAddress = null, walletType = null }) => {
  // State management
  const [userProfile, setUserProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditingNickname, setIsEditingNickname] = useState(false)
  const [isEditingUsername, setIsEditingUsername] = useState(false)
  const [isEditingBio, setIsEditingBio] = useState(false)
  const [tempNickname, setTempNickname] = useState('')
  const [tempUsername, setTempUsername] = useState('')
  const [tempBio, setTempBio] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Training records pagination state
  const [trainingRecords, setTrainingRecords] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [isLoadingRecords, setIsLoadingRecords] = useState(false)
  const recordsPerPage = 10
  const [currentLanguage, setCurrentLanguage] = useState(language)

  // 格式化钱包地址显示
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // 断开钱包连接
  const disconnectWallet = async () => {
    try {
      // 清除本地状态
      localStorage.removeItem('peed_wallet_address');
      localStorage.removeItem('peed_wallet_type');
      
      // 重定向到首页
      onBack();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  // 基于钱包地址获取或创建用户
  const getOrCreateUserByWallet = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('ProfilePageWallet: Looking for user with wallet:', walletAddress);
      
      // 首先尝试通过钱包地址找到现有用户
      const users = await apiClient.get('/users');
      console.log('ProfilePageWallet: Found users:', users.length);
      
      let existingUser = users.find(user => 
        user.wallet_address === walletAddress || user.username === walletAddress
      );
      
      console.log('ProfilePageWallet: Existing user found:', !!existingUser, existingUser?.id);
      
      if (!existingUser) {
        console.log('ProfilePageWallet: Creating new user for wallet:', walletAddress);
        // 如果没有找到，创建新用户，用户名直接使用钱包地址确保唯一性
        const newUser = await apiClient.registerUser({
          username: walletAddress, // 直接使用钱包地址作为用户名
          nickname: `${walletType || 'Wallet'} 用户`,
          bio: '', // 不设置默认的bio描述
          wallet_address: walletAddress,
          wallet_type: walletType
        });
        
        console.log('ProfilePageWallet: New user created:', newUser.id);
        // 获取完整的用户资料
        const fullProfile = await apiClient.getUserProfile(newUser.id);
        return fullProfile;
      } else {
        console.log('ProfilePageWallet: Using existing user:', existingUser.id);
        // 如果找到了，确保钱包信息是最新的
        if (!existingUser.wallet_address || existingUser.wallet_address !== walletAddress) {
          console.log('ProfilePageWallet: Updating wallet info for user:', existingUser.id);
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
      console.error('ProfilePageWallet: Failed to get or create user by wallet:', error);
      throw error;
    }
  };

  // Fetch user profile data
  const fetchUserProfile = async () => {
    if (!walletAddress) {
      setError(currentLanguage === 'zh' ? '需要连接钱包' : 'Wallet connection required');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const profile = await getOrCreateUserByWallet();
      setUserProfile(profile);
      setTempNickname(profile.nickname || `${walletType || 'Wallet'} 用户`);
      setTempUsername(profile.username || walletAddress);
      setTempBio(profile.bio || '');
      
      // Fetch training records with pagination
      await fetchTrainingRecords(profile.id, 1);
      
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setError(currentLanguage === 'zh' ? '加载用户资料失败' : 'Failed to load user profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch training records with pagination
  const fetchTrainingRecords = async (userId, page = 1) => {
    if (!userId) return;
    
    try {
      setIsLoadingRecords(true);
      
      const response = await fetch(`/api/tigang/training/history/${userId}?page=${page}&per_page=${recordsPerPage}`);
      if (!response.ok) {
        throw new Error('Failed to fetch training records');
      }
      
      const data = await response.json();
      setTrainingRecords(data.training_records || []);
      setCurrentPage(data.page || 1);
      setTotalPages(data.pages || 1);
      setTotalRecords(data.total || 0);
      
    } catch (error) {
      console.error('Failed to fetch training records:', error);
    } finally {
      setIsLoadingRecords(false);
    }
  };

  // Pagination handlers
  const handlePageChange = async (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && userProfile?.id) {
      await fetchTrainingRecords(userProfile.id, newPage);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchUserProfile();
  }, [walletAddress, walletType]);

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
      alert(currentLanguage === 'zh' ? '昵称更新失败' : 'Failed to update nickname');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNicknameCancel = () => {
    setTempNickname(userProfile?.nickname || `${walletType || 'Wallet'} 用户`);
    setIsEditingNickname(false);
  };

  // Handle username editing
  const handleUsernameEdit = () => {
    setIsEditingUsername(true);
  };

  const handleUsernameSave = async () => {
    if (!userProfile || !tempUsername.trim()) return;
    
    // 验证用户名只包含英文字母、数字和下划线
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(tempUsername)) {
      alert(currentLanguage === 'zh' ? '用户名只能包含英文字母、数字和下划线' : 'Username can only contain letters, numbers and underscores');
      return;
    }
    
    try {
      setIsSaving(true);
      
      // 检查用户名是否已存在
      const users = await apiClient.get('/users');
      const existingUser = users.find(user => user.username === tempUsername && user.id !== userProfile.id);
      
      if (existingUser) {
        alert(currentLanguage === 'zh' ? '用户名已存在，请选择其他名称' : 'Username already exists, please choose another one');
        return;
      }
      
      await apiClient.updateUserProfile(userProfile.id, { username: tempUsername });
      
      // Update local state
      setUserProfile(prev => ({
        ...prev,
        username: tempUsername
      }));
      
      setIsEditingUsername(false);
    } catch (err) {
      console.error('Failed to update username:', err);
      alert(currentLanguage === 'zh' ? '用户名更新失败' : 'Failed to update username');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUsernameCancel = () => {
    setTempUsername(userProfile?.username || walletAddress);
    setIsEditingUsername(false);
  };

  // Handle bio editing
  const handleBioEdit = () => {
    setTempBio(userProfile?.bio || '');
    setIsEditingBio(true);
  };

  const handleBioSave = async () => {
    if (!userProfile) return;
    
    try {
      setIsSaving(true);
      
      const updatedProfile = await apiClient.updateProfile(userProfile.id, {
        bio: tempBio
      });
      
      setUserProfile(updatedProfile);
      setIsEditingBio(false);
      
    } catch (error) {
      console.error('Failed to update bio:', error);
      alert(currentLanguage === 'zh' ? '更新个人简介失败' : 'Failed to update bio');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBioCancel = () => {
    setTempBio(userProfile?.bio || '');
    setIsEditingBio(false);
  };

  // Format date helper
  const formatJoinDate = (dateString) => {
    if (!dateString) return currentLanguage === 'zh' ? '未知' : 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString(currentLanguage === 'zh' ? 'zh-CN' : 'en-US');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <Button variant="outline" onClick={onBack} className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {currentLanguage === 'zh' ? '返回' : 'Back'}
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              {currentLanguage === 'zh' ? '个人资料' : 'Profile'}
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
              {currentLanguage === 'zh' ? '返回' : 'Back'}
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              {currentLanguage === 'zh' ? '个人资料' : 'Profile'}
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
            message={currentLanguage === 'zh' ? '用户资料不存在' : 'User profile not found'} 
            onRetry={fetchUserProfile} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Navigation Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img src="/peed-logo.png" alt="PEED Logo" className="w-8 h-8" />
                <h1 className="text-2xl font-bold">
                  <span className="text-green-600">PEED</span>
                  <span className="text-gray-700"> - {currentLanguage === 'zh' ? '小乌龟训练师' : 'Turtle Trainer'}</span>
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* 返回按钮 */}
              <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>{currentLanguage === 'zh' ? '返回' : 'Back'}</span>
              </Button>

              {/* 语言切换 */}
              <Button
                variant="outline"
                onClick={() => setCurrentLanguage(currentLanguage === 'zh' ? 'en' : 'zh')}
                className="flex items-center space-x-2"
              >
                <Globe className="w-4 h-4" />
                <span>{currentLanguage === 'zh' ? 'EN' : '中文'}</span>
              </Button>

              {/* 钱包连接区域 */}
              <div className="flex items-center space-x-3">
                <Badge className="bg-green-100 text-green-800 flex items-center space-x-2">
                  <Wallet className="w-4 h-4" />
                  <span>{formatAddress(walletAddress)}</span>
                </Badge>
                <Button
                  variant="outline"
                  onClick={disconnectWallet}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  {currentLanguage === 'zh' ? '断开' : 'Disconnect'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Header */}
        <Card>
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
                <img
                  src="/peed-logo.png"
                  alt="Avatar"
                  className="w-16 h-16 rounded-full"
                />
              </div>
            </div>
            
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
              
              <div className="flex items-center space-x-3">
                
                  <div className="flex items-center space-x-3">
                    <p className="text-gray-600">@{userProfile.username}</p>
                  </div>
                
              </div>
              
              {isEditingBio ? (
                <div className="flex items-center space-x-2">
                  <textarea
                    value={tempBio}
                    onChange={(e) => setTempBio(e.target.value)}
                    className="text-gray-600 border border-gray-300 rounded px-2 py-1 flex-1"
                    rows="3"
                    placeholder={currentLanguage === 'zh' ? '输入个人简介' : 'Enter bio'}
                  />
                  <Button 
                    onClick={handleBioSave} 
                    size="sm" 
                    disabled={isSaving}
                    className="p-1"
                  >
                    {isSaving ? <LoadingSpinner size="small" /> : <Save className="w-4 h-4" />}
                  </Button>
                  <Button 
                    onClick={handleBioCancel} 
                    variant="outline" 
                    size="sm"
                    className="p-1"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <p className="text-gray-600">{userProfile.bio || (currentLanguage === 'zh' ? '暂无个人简介' : 'No bio yet')}</p>
                  <Button 
                    onClick={handleBioEdit} 
                    variant="outline" 
                    size="sm"
                    className="p-1"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </div>
              )}
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Wallet className="w-4 h-4" />
                  <span>
                    {currentLanguage === 'zh' ? '钱包: ' : 'Wallet: '} 
                    {formatAddress(walletAddress)}
                  </span>
                  <Badge className="bg-blue-100 text-blue-800 text-xs">
                    {walletType}
                  </Badge>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {currentLanguage === 'zh' ? '加入时间: ' : 'Joined: '} 
                    {formatJoinDate(userProfile.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Statistics */}
        <Card>
          <h3 className="text-lg font-semibold mb-6 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            {currentLanguage === 'zh' ? '训练统计' : 'Training Statistics'}
          </h3>
          
          {userProfile.stats?.difficulty_breakdown ? (
            <div className="space-y-6">
              {Object.entries(userProfile.stats.difficulty_breakdown).map(([difficulty, data]) => {
                const difficultyLabels = {
                  beginner: currentLanguage === 'zh' ? '新手级' : 'Beginner',
                  intermediate: currentLanguage === 'zh' ? '入门级' : 'Intermediate', 
                  advanced: currentLanguage === 'zh' ? '精通级' : 'Advanced'
                };
                
                const difficultyGradients = {
                  beginner: 'from-green-500 to-emerald-600',
                  intermediate: 'from-yellow-500 to-orange-600',
                  advanced: 'from-red-500 to-pink-600'
                };
                
                return (
                  <div key={difficulty} className="rounded-xl overflow-hidden shadow-lg">
                    {/* 训练中心风格的头部 */}
                    <div className={`bg-gradient-to-r ${difficultyGradients[difficulty]} text-white p-6`}>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xl font-bold flex items-center space-x-2">
                          <Trophy className="w-6 h-6" />
                          <span>{difficultyLabels[difficulty] || difficulty}</span>
                        </h4>
                        <div className="text-right">
                          <div className="text-sm opacity-90">{currentLanguage === 'zh' ? '当前级别' : 'Current Level'}</div>
                          <div className="font-semibold">{difficultyLabels[difficulty]?.split('（')[0] || difficultyLabels[difficulty]?.split(' (')[0] || difficulty}</div>
                        </div>
                      </div>
                      
                      {/* 训练中心风格的4个指标 */}
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold">0</div>
                          <div className="text-xs opacity-90">{currentLanguage === 'zh' ? '今日训练' : 'Today'}</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">0</div>
                          <div className="text-xs opacity-90">{currentLanguage === 'zh' ? '本周训练' : 'This Week'}</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{data.count || 0}</div>
                          <div className="text-xs opacity-90">{currentLanguage === 'zh' ? '总完成次数' : 'Total'}</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{userProfile.stats?.current_streak || 0}</div>
                          <div className="text-xs opacity-90">{currentLanguage === 'zh' ? '连续天数' : 'Streak'}</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* 详细数据 */}
                    <div className="bg-white p-6">
                      <h5 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                        {currentLanguage === 'zh' ? '详细统计' : 'Detailed Statistics'}
                      </h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-gray-900">{Math.round((data.count || 0) * 3)}</div>
                          <div className="text-xs text-gray-600">{currentLanguage === 'zh' ? '总组数' : 'Total Sets'}</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-gray-900">{Math.round((data.count || 0) * 36)}</div>
                          <div className="text-xs text-gray-600">{currentLanguage === 'zh' ? '总重复次数' : 'Total Reps'}</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-gray-900">{data.total_duration ? Math.round(data.total_duration / 60) : 0}</div>
                          <div className="text-xs text-gray-600">{currentLanguage === 'zh' ? '训练时长(分钟)' : 'Duration (min)'}</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-gray-900">
                            {data.total_duration ? Math.round(data.total_duration / 3600 * 10) / 10 : 0}h
                          </div>
                          <div className="text-xs text-gray-600">{currentLanguage === 'zh' ? '总时长' : 'Total Hours'}</div>
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
                {currentLanguage === 'zh' ? '暂无训练数据' : 'No training data yet'}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                {currentLanguage === 'zh' ? '开始你的第一次训练吧！' : 'Start your first training session!'}
              </p>
            </div>
          )}
        </Card>

        {/* Recent Training */}
        <Card>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            {currentLanguage === 'zh' ? '训练记录' : 'Training Records'}
            {totalRecords > 0 && (
              <span className="ml-2 text-sm text-gray-500">
                ({totalRecords} {currentLanguage === 'zh' ? '条记录' : 'records'})
              </span>
            )}
          </h3>
          
          <div className="space-y-3">
            {isLoadingRecords ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : trainingRecords.length > 0 ? (
              trainingRecords.map((record) => (
                <TrainingRecord
                  key={record.id}
                  record={record}
                  language={currentLanguage}
                />
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                {currentLanguage === 'zh' ? '暂无训练记录' : 'No training records yet'}
              </p>
            )}
          </div>
          
          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={totalRecords}
            onPageChange={handlePageChange}
            onPrevious={handlePreviousPage}
            onNext={handleNextPage}
            language={currentLanguage}
            isLoading={isLoadingRecords}
          />
        </Card>

        {/* Achievements */}
        <Card>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2" />
            {currentLanguage === 'zh' ? '成就系统' : 'Achievements'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userProfile.achievements && userProfile.achievements.length > 0 ? (
              userProfile.achievements.map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement}
                  language={currentLanguage}
                />
              ))
            ) : (
              <p className="text-gray-500 text-center py-4 col-span-full">
                {currentLanguage === 'zh' ? '暂无成就数据' : 'No achievements data'}
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePageWallet; 
