import React, { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Camera, Edit3, Save, X, User, Calendar, Trophy, TrendingUp, Target, Clock, Flame, Star, Upload } from 'lucide-react'

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

// 头像上传组件
const AvatarUpload = ({ avatar, onAvatarChange, language }) => {
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
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
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
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Camera className="w-6 h-6 text-white" />
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files[0])}
        className="hidden"
      />
      
      <p className="text-xs text-gray-500 text-center">
        {language === 'zh' ? '点击或拖拽上传头像' : 'Click or drag to upload avatar'}
      </p>
    </div>
  )
}

// 统计卡片组件
const StatCard = ({ icon: Icon, title, value, subtitle, color = 'green' }) => {
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
        <p className="text-xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>
  )
}

// 训练记录项组件
const TrainingRecord = ({ date, type, duration, intensity, language }) => {
  const intensityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  }

  const intensityLabels = {
    zh: { low: '轻度', medium: '中度', high: '高强度' },
    en: { low: 'Low', medium: 'Medium', high: 'High' }
  }

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{type}</p>
        <p className="text-xs text-gray-500">{date}</p>
      </div>
      <div className="flex items-center space-x-2">
        <Badge className={intensityColors[intensity]}>
          {intensityLabels[language][intensity]}
        </Badge>
        <span className="text-sm text-gray-600">{duration}</span>
      </div>
    </div>
  )
}

// 成就徽章组件
const AchievementBadge = ({ icon: Icon, title, description, unlocked = false, progress = 0 }) => {
  return (
    <div className={`p-4 rounded-lg border-2 transition-all duration-300 ${
      unlocked 
        ? 'border-yellow-300 bg-yellow-50 shadow-md' 
        : 'border-gray-200 bg-gray-50'
    }`}>
      <div className="flex items-center space-x-3 mb-2">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          unlocked ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-200 text-gray-400'
        }`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <p className={`text-sm font-medium ${unlocked ? 'text-gray-900' : 'text-gray-500'}`}>
            {title}
          </p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
      {!unlocked && progress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </div>
  )
}

const ProfilePage = ({ language = 'zh', onBack }) => {
  // 状态管理
  const [userInfo, setUserInfo] = useState({
    nickname: 'peed',
    avatar: null,
    walletAddress: null,
    joinDate: '2024-01-01'
  })
  
  const [isEditing, setIsEditing] = useState(false)
  const [tempNickname, setTempNickname] = useState(userInfo.nickname)
  
  // 模拟训练数据
  const [trainingStats] = useState({
    today: {
      sessions: 3,
      duration: 15,
      streak: 7
    },
    total: {
      sessions: 156,
      duration: 780,
      maxStreak: 21,
      weekSessions: 18,
      monthSessions: 72
    }
  })

  const [trainingRecords] = useState([
    { id: 1, date: '2024-01-10 14:30', type: language === 'zh' ? '基础提肛训练' : 'Basic Kegel Exercise', duration: '5分钟', intensity: 'medium' },
    { id: 2, date: '2024-01-10 09:15', type: language === 'zh' ? '进阶训练' : 'Advanced Training', duration: '8分钟', intensity: 'high' },
    { id: 3, date: '2024-01-09 20:45', type: language === 'zh' ? '放松训练' : 'Relaxation Training', duration: '3分钟', intensity: 'low' },
    { id: 4, date: '2024-01-09 12:00', type: language === 'zh' ? '基础提肛训练' : 'Basic Kegel Exercise', duration: '5分钟', intensity: 'medium' },
  ])

  const [achievements] = useState([
    {
      id: 1,
      icon: Flame,
      title: language === 'zh' ? '连续训练7天' : '7-Day Streak',
      description: language === 'zh' ? '坚持就是胜利！' : 'Persistence is victory!',
      unlocked: true
    },
    {
      id: 2,
      icon: Trophy,
      title: language === 'zh' ? '训练达人' : 'Training Master',
      description: language === 'zh' ? '完成100次训练' : 'Complete 100 sessions',
      unlocked: true
    },
    {
      id: 3,
      icon: Star,
      title: language === 'zh' ? '月度冠军' : 'Monthly Champion',
      description: language === 'zh' ? '单月训练30次' : '30 sessions in a month',
      unlocked: false,
      progress: 75
    },
    {
      id: 4,
      icon: Target,
      title: language === 'zh' ? '完美主义者' : 'Perfectionist',
      description: language === 'zh' ? '连续训练30天' : '30-day streak',
      unlocked: false,
      progress: 23
    }
  ])

  // 从localStorage加载数据
  useEffect(() => {
    const savedUserInfo = localStorage.getItem('peed_user_info')
    if (savedUserInfo) {
      const parsed = JSON.parse(savedUserInfo)
      setUserInfo(parsed)
      setTempNickname(parsed.nickname)
    }
  }, [])

  // 保存用户信息到localStorage
  const saveUserInfo = (newInfo) => {
    setUserInfo(newInfo)
    localStorage.setItem('peed_user_info', JSON.stringify(newInfo))
  }

  // 处理头像上传
  const handleAvatarChange = (avatarData) => {
    saveUserInfo({ ...userInfo, avatar: avatarData })
  }

  // 处理昵称编辑
  const handleNicknameEdit = () => {
    setIsEditing(true)
  }

  const handleNicknameSave = () => {
    if (tempNickname.trim()) {
      saveUserInfo({ ...userInfo, nickname: tempNickname.trim() })
      setIsEditing(false)
    }
  }

  const handleNicknameCancel = () => {
    setTempNickname(userInfo.nickname)
    setIsEditing(false)
  }

  const texts = {
    zh: {
      profile: '个人信息',
      back: '返回',
      basicInfo: '基本信息',
      nickname: '昵称',
      walletAddress: '钱包地址',
      joinDate: '加入时间',
      notConnected: '未连接',
      edit: '编辑',
      save: '保存',
      cancel: '取消',
      todayStats: '今日统计',
      todaySessions: '今日训练',
      todayDuration: '训练时长',
      streak: '连续天数',
      totalStats: '历史统计',
      totalSessions: '总训练次数',
      totalDuration: '总训练时长',
      maxStreak: '最长连续',
      weekSessions: '本周训练',
      monthSessions: '本月训练',
      recentRecords: '最近训练',
      achievements: '成就徽章',
      sessions: '次',
      minutes: '分钟',
      days: '天',
      times: '次',
      hours: '小时'
    },
    en: {
      profile: 'Profile',
      back: 'Back',
      basicInfo: 'Basic Info',
      nickname: 'Nickname',
      walletAddress: 'Wallet Address',
      joinDate: 'Join Date',
      notConnected: 'Not Connected',
      edit: 'Edit',
      save: 'Save',
      cancel: 'Cancel',
      todayStats: 'Today\'s Stats',
      todaySessions: 'Today\'s Sessions',
      todayDuration: 'Duration',
      streak: 'Streak',
      totalStats: 'Total Stats',
      totalSessions: 'Total Sessions',
      totalDuration: 'Total Duration',
      maxStreak: 'Max Streak',
      weekSessions: 'This Week',
      monthSessions: 'This Month',
      recentRecords: 'Recent Training',
      achievements: 'Achievements',
      sessions: '',
      minutes: 'min',
      days: 'days',
      times: '',
      hours: 'hrs'
    }
  }

  const t = texts[language]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* 页面头部 */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={onBack}
              className="flex items-center space-x-2 hover:bg-green-50 border-green-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.back}</span>
            </Button>
            <h1 className="text-2xl font-bold text-green-700">{t.profile}</h1>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <div className="container mx-auto px-4 pb-8">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* 个人资料卡片 */}
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <div className="flex flex-col md:flex-row md:items-start space-y-6 md:space-y-0 md:space-x-8">
              {/* 头像区域 */}
              <div className="flex-shrink-0">
                <AvatarUpload
                  avatar={userInfo.avatar}
                  onAvatarChange={handleAvatarChange}
                  language={language}
                />
              </div>
              
              {/* 基本信息 */}
              <div className="flex-1 space-y-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{t.basicInfo}</h3>
                
                {/* 昵称 */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <label className="block text-sm text-gray-600 mb-1">{t.nickname}</label>
                    {isEditing ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={tempNickname}
                          onChange={(e) => setTempNickname(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          autoFocus
                        />
                        <Button onClick={handleNicknameSave} className="px-3 py-2">
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" onClick={handleNicknameCancel} className="px-3 py-2">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <p className="text-lg font-medium text-gray-900">{userInfo.nickname}</p>
                        <Button variant="outline" onClick={handleNicknameEdit} className="px-2 py-1">
                          <Edit3 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* 钱包地址 */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">{t.walletAddress}</label>
                  <p className="text-sm text-gray-500 font-mono">
                    {userInfo.walletAddress || t.notConnected}
                  </p>
                </div>
                
                {/* 加入时间 */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">{t.joinDate}</label>
                  <p className="text-sm text-gray-500">{userInfo.joinDate}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* 统计数据区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 今日统计 */}
            <Card className="hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t.todayStats}</h3>
              <div className="space-y-3">
                <StatCard
                  icon={Target}
                  title={t.todaySessions}
                  value={`${trainingStats.today.sessions} ${t.sessions}`}
                  color="green"
                />
                <StatCard
                  icon={Clock}
                  title={t.todayDuration}
                  value={`${trainingStats.today.duration} ${t.minutes}`}
                  color="blue"
                />
                <StatCard
                  icon={Flame}
                  title={t.streak}
                  value={`${trainingStats.today.streak} ${t.days}`}
                  color="orange"
                />
              </div>
            </Card>

            {/* 历史统计 */}
            <Card className="hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t.totalStats}</h3>
              <div className="space-y-3">
                <StatCard
                  icon={Trophy}
                  title={t.totalSessions}
                  value={`${trainingStats.total.sessions} ${t.times}`}
                  color="purple"
                />
                <StatCard
                  icon={TrendingUp}
                  title={t.totalDuration}
                  value={`${Math.floor(trainingStats.total.duration / 60)} ${t.hours}`}
                  subtitle={`${trainingStats.total.duration % 60} ${t.minutes}`}
                  color="green"
                />
                <div className="grid grid-cols-2 gap-3">
                  <StatCard
                    icon={Star}
                    title={t.maxStreak}
                    value={`${trainingStats.total.maxStreak} ${t.days}`}
                    color="orange"
                  />
                  <StatCard
                    icon={Calendar}
                    title={t.weekSessions}
                    value={`${trainingStats.total.weekSessions} ${t.times}`}
                    color="blue"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* 训练记录和成就 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 最近训练记录 */}
            <Card className="hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t.recentRecords}</h3>
              <div className="space-y-3">
                {trainingRecords.map((record) => (
                  <TrainingRecord
                    key={record.id}
                    date={record.date}
                    type={record.type}
                    duration={record.duration}
                    intensity={record.intensity}
                    language={language}
                  />
                ))}
              </div>
            </Card>

            {/* 成就徽章 */}
            <Card className="hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t.achievements}</h3>
              <div className="space-y-3">
                {achievements.map((achievement) => (
                  <AchievementBadge
                    key={achievement.id}
                    icon={achievement.icon}
                    title={achievement.title}
                    description={achievement.description}
                    unlocked={achievement.unlocked}
                    progress={achievement.progress}
                  />
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage

