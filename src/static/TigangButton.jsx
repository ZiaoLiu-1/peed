import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Trophy, Info, ChevronDown, Check } from 'lucide-react';

// API Configuration
const API_BASE_URL = '/api/tigang';

// API request function
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

// API functions
const exerciseAPI = {
  recordExercise: (exerciseData) => apiRequest('/exercises', {
    method: 'POST',
    body: JSON.stringify(exerciseData),
  }),
};

const statsAPI = {
  getUserStats: (userId) => apiRequest(`/stats/${userId}`),
};

// Simple Button component
const Button = ({ children, variant = 'default', onClick, className = '', ...props }) => {
  const baseClass = 'px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
  const variants = {
    default: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500'
  }
  
  return (
    <button
      className={`${baseClass} ${variants[variant]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}

const TigangButton = ({ language = 'zh', walletAddress, walletType, onWalletRequired }) => {
  // 状态管理
  const [difficulty, setDifficulty] = useState('beginner')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [userStats, setUserStats] = useState(null);
  
  // Training state
  const [isExercising, setIsExercising] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('ready'); // ready, contract, relax
  const [timer, setTimer] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [totalExercises, setTotalExercises] = useState(0); // 总完成次数
  const [loading, setLoading] = useState(false);
  const [currentRep, setCurrentRep] = useState(0);
  const [currentSet, setCurrentSet] = useState(0);
  const [dailySession, setDailySession] = useState(0);
  const [showProgressionAlert, setShowProgressionAlert] = useState(false);

  // 新的科学分级配置
  const difficultyLevels = {
    beginner: {
      name: language === 'zh' ? '新手级（基础适应阶段）' : 'Beginner (Basic Adaptation)',
      contractTime: 3, // 收缩2-4秒，取中间值3秒
      relaxTime: 5.5, // 放松5-6秒，取中间值5.5秒
      repsPerSet: 12, // 每组10-15次，取中间值12次
      sets: 2.5, // 每天2-3组，取中间值2.5组（实际显示2-3）
      dailySessions: 1, // 简化为1个完整会话
      totalTimeMinutes: 7.5, // 5-10分钟，取中间值
      progressionThreshold: 30, // 进阶标准：30次训练会话
      progressionWeeks: '2-4',
      description: language === 'zh' ? 
        '收缩肛门2-4秒，放松5-6秒。坐姿或仰卧姿势，减少其他肌肉代偿。当完成超过30次训练会话或者能轻松完成连续三次训练后可以尝试下一个阶段的练习。' : 
        'Contract anal muscles 2-4s, relax 5-6s. Sitting or lying position to reduce muscle compensation. Try the next stage after completing over 30 training sessions or when you can easily complete three consecutive training sessions.',
      medicalAdvice: language === 'zh' ? 
        '主要适应肌肉收缩，避免过度疲劳导致盆底肌代偿性紧张。短时间、低强度训练帮助建立神经肌肉控制。' :
        'Focus on muscle adaptation, avoid overexertion that causes compensatory tension.'
    },
    intermediate: {
      name: language === 'zh' ? '入门级（强化训练阶段）' : 'Intermediate (Strengthening Phase)',
      contractTime: 6, // 收缩5-7秒，取中间值6秒
      relaxTime: 4, // 放松3-5秒，取中间值4秒
      repsPerSet: 17, // 每组15-20次，取中间值17次
      sets: 3.5, // 每天3-4组，取中间值3.5组
      dailySessions: 1,
      totalTimeMinutes: 12.5, // 10-15分钟，取中间值
      progressionThreshold: 70, // 进阶标准：70次训练会话
      progressionWeeks: '4-6',
      description: language === 'zh' ? 
        '收缩5-7秒，放松3-5秒。可尝试站立或行走时练习，增加核心稳定性。当完成超过70次训练会话或者能轻松完成连续五次训练后可以尝试下一个阶段的练习。' : 
        'Contract 5-7s, relax 3-5s. Try standing or walking exercises to increase core stability. Try the next stage after completing over 70 training sessions or when you can easily complete five consecutive training sessions.',
      medicalAdvice: language === 'zh' ? 
        '增强肌肉耐力，促进盆底血液循环，适用于预防痔疮、改善轻度尿失禁。6-8周系统训练可显著提升盆底肌力量。' :
        'Enhance muscle endurance, promote pelvic floor circulation. Suitable for hemorrhoid prevention and mild incontinence improvement. 6-8 weeks of systematic training significantly improves pelvic floor muscle strength.'
    },
    advanced: {
      name: language === 'zh' ? '精通级（高阶优化阶段）' : 'Advanced (High-level Optimization)',
      contractTime: 9, // 收缩8-10秒，取中间值9秒
      relaxTime: 2.5, // 放松2-3秒，取中间值2.5秒
      repsPerSet: 25, // 每组20-30次，取中间值25次
      sets: 4.5, // 每天4-5组，取中间值4.5组
      dailySessions: 1,
      totalTimeMinutes: 17.5, // 15-20分钟，取中间值
      progressionThreshold: 200, // 维持标准：200次训练会话
      progressionWeeks: '8-12',
      description: language === 'zh' ? 
        '收缩8-10秒，放松2-3秒。可结合不同姿势（胸膝卧位、分腿提肛）增加难度。完成200次训练会话后即为精通级别，建议长期保持此水平以维持最佳盆底肌功能。' : 
        'Contract 8-10s, relax 2-3s. Combine different postures (knee-chest position, leg-spread exercises) for increased difficulty. After completing 200 training sessions, you reach the advanced level. Recommended to maintain this level long-term for optimal pelvic floor function.',
      medicalAdvice: language === 'zh' ? 
        '长期高强度训练可改善肛门括约肌功能，减少术后复发风险。3个月以上的规律训练可显著提升盆底肌协调性。' :
        'Long-term high-intensity training improves anal sphincter function and reduces postoperative recurrence risk. 3+ months of regular training significantly improves pelvic floor muscle coordination.'
    }
  };

  const currentDifficulty = difficultyLevels[difficulty];

  // 提肛运动的节奏配置
  const exercisePhases = {
    contract: { 
      duration: currentDifficulty.contractTime, 
      text: language === 'zh' ? '收缩' : 'Contract', 
      color: 'bg-red-500' 
    },
    relax: { 
      duration: currentDifficulty.relaxTime, 
      text: language === 'zh' ? '放松' : 'Relax', 
      color: 'bg-green-500' 
    }
  };

  const phaseOrder = ['contract', 'relax'];

  // 基于钱包地址获取或创建用户
  const getOrCreateUserByWallet = async () => {
    if (!walletAddress) {
      console.log('No wallet address provided');
      return null;
    }

    try {
      setLoading(true);
      console.log('TigangButton: Looking for user with wallet:', walletAddress);
      
      // 首先尝试通过钱包地址找到现有用户
      const response = await fetch('/api/users');
      const users = await response.json();
      console.log('TigangButton: Found users:', users.length);
      
      let existingUser = users.find(user => 
        user.wallet_address === walletAddress || user.username === walletAddress
      );
      
      console.log('TigangButton: Existing user found:', !!existingUser, existingUser?.id);
      
      if (!existingUser) {
        console.log('TigangButton: Creating new user for wallet:', walletAddress);
        // 如果没有找到，创建新用户，用户名直接使用钱包地址确保唯一性
        const registerResponse = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: walletAddress, // 直接使用钱包地址作为用户名
            nickname: `${walletType || 'Wallet'} 用户`,
          
          }),
        });
        
        if (!registerResponse.ok) {
          const errorData = await registerResponse.json();
          throw new Error(errorData.error || 'Failed to create user');
        }
        
        const newUser = await registerResponse.json();
        console.log('TigangButton: New user created:', newUser.id);
        
        // 连接钱包到用户
        try {
          await fetch(`/api/wallet/${newUser.id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              wallet_address: walletAddress,
              wallet_type: walletType
            }),
          });
        } catch (walletError) {
          console.error('Failed to connect wallet, but user created:', walletError);
          // 即使钱包连接失败，也返回用户
        }
        
        return newUser;
      } else {
        console.log('TigangButton: Using existing user:', existingUser.id);
        // 如果找到了，确保钱包信息是最新的
        if (!existingUser.wallet_address || existingUser.wallet_address !== walletAddress) {
          console.log('TigangButton: Updating wallet info for user:', existingUser.id);
          await fetch(`/api/wallet/${existingUser.id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              wallet_address: walletAddress,
              wallet_type: walletType
            }),
          });
        }
        
        return existingUser;
      }
    } catch (error) {
      console.error('TigangButton: Failed to get or create user by wallet:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 加载用户统计数据 - 根据当前训练等级获取对应统计
  const loadUserStats = async () => {
    if (!currentUserId) {
      console.log('No user ID available for loading stats');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/tigang/training/stats/${currentUserId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user stats');
      }
      
      const stats = await response.json();
      console.log('Loaded user stats:', stats);
      
      // 保存完整统计数据
      setUserStats(stats);
      
      // 根据当前难度等级获取对应的统计数据
      const currentDifficultyStats = stats.difficulty_breakdown?.find(
        diff => diff.difficulty === difficulty
      ) || {
        session_count: 0,
        total_sets: 0,
        total_reps: 0,
        total_time_minutes: 0
      };
      
      console.log(`Loading stats for difficulty: ${difficulty}`, currentDifficultyStats);
      
      // 更新状态 - 使用当前难度的数据
      setTotalExercises(currentDifficultyStats.session_count || 0); // 总完成次数改为训练会话数
      // dailySession 将在获取今日数据时单独设置
      
      // 全局数据（不分难度）
      setStreak(stats.streak_days || 0);
      setTotalTime(stats.total_duration_minutes || 0);
      
      // 计算今日和本周该难度的训练次数（会话数）
      const today = new Date().toISOString().split('T')[0];
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekStartStr = weekStart.toISOString().split('T')[0];
      
      // 获取今日和本周该难度的训练记录
      try {
        // 获取今日训练
        const todayResponse = await fetch(`/api/tigang/training/history/${currentUserId}?start_date=${today}&end_date=${today}&difficulty=${difficulty}`);
        if (todayResponse.ok) {
          const todayData = await todayResponse.json();
          const todayTrainingCount = todayData.training_records?.length || 0;
          setTodayCount(todayTrainingCount);
          console.log(`Today's training sessions for ${difficulty}: ${todayTrainingCount}`);
        }
        
        // 获取本周训练
        const weekResponse = await fetch(`/api/tigang/training/history/${currentUserId}?start_date=${weekStartStr}&end_date=${today}&difficulty=${difficulty}`);
        if (weekResponse.ok) {
          const weekData = await weekResponse.json();
          const weekTrainingCount = weekData.training_records?.length || 0;
          setDailySession(weekTrainingCount);
          console.log(`This week's training sessions for ${difficulty}: ${weekTrainingCount}`);
        }
      } catch (error) {
        console.error('Failed to fetch training history:', error);
        // 使用daily_stats作为备选
        const todayStats = stats.daily_stats?.find(day => day.date === today);
        const todaySessionCount = todayStats ? todayStats.session_count : 0;
        setTodayCount(todaySessionCount);
        setDailySession(todaySessionCount);
      }
      
    } catch (error) {
      console.error('Failed to load user stats:', error);
      // 设置默认值
      setTodayCount(0);
      setStreak(0);
      setTotalTime(0);
      setTotalExercises(0);
      setDailySession(0);
    } finally {
      setLoading(false);
    }
  };

  // 当钱包地址变化时，获取或创建用户
  useEffect(() => {
    const initializeUser = async () => {
      if (walletAddress) {
        const user = await getOrCreateUserByWallet();
        if (user) {
          setCurrentUserId(user.id);
        }
      } else {
        setCurrentUserId(null);
        setUserStats(null);
      }
    };

    initializeUser();
  }, [walletAddress, walletType]);

  // 当用户ID变化时，加载统计数据
  useEffect(() => {
    if (currentUserId) {
      loadUserStats();
    }
  }, [currentUserId]);

  // 当训练难度变化时，重新加载该难度的统计数据
  useEffect(() => {
    if (currentUserId && difficulty) {
      console.log(`Training difficulty changed to: ${difficulty}, reloading stats`);
      loadUserStats();
    }
  }, [difficulty]);

  // 检查是否可以进阶
  const checkProgression = () => {
    const currentLevel = difficultyLevels[difficulty];
    if (totalExercises >= currentLevel.progressionThreshold) {
      if (difficulty === 'beginner') {
        setShowProgressionAlert('intermediate');
      } else if (difficulty === 'intermediate') {
        setShowProgressionAlert('advanced');
      }
    }
  };

  useEffect(() => {
    checkProgression();
  }, [totalExercises, difficulty]);

  // 修复计数器问题 - 确保每完成一个收缩-放松循环只增加1次
  useEffect(() => {
    let interval;
    if (isExercising && currentPhase !== 'ready') {
      interval = setInterval(() => {
        setTimer(prev => {
          const currentPhaseDuration = exercisePhases[currentPhase].duration;
          const newTime = prev + 0.1;
          
          if (newTime >= currentPhaseDuration) {
            // 当前阶段结束，转到下一阶段
            const currentPhaseIndex = phaseOrder.indexOf(currentPhase);
            const nextIndex = (currentPhaseIndex + 1) % phaseOrder.length;
            const nextPhase = phaseOrder[nextIndex];
            
            // 如果完成了一个完整的收缩-放松循环（从放松阶段回到收缩阶段）
            if (currentPhase === 'relax' && nextIndex === 0) {
              setCurrentRep(prevRep => {
                const newRep = prevRep + 1;
                console.log(`完成第 ${newRep} 次重复`);
                
                // 检查是否完成一组
                if (newRep >= currentDifficulty.repsPerSet) {
                  setCurrentSet(prevSet => {
                    const newSet = prevSet + 1;
                    console.log(`完成第 ${newSet} 组`);
                    
                    // 检查是否完成所有组
                    if (newSet >= Math.ceil(currentDifficulty.sets)) {
                      console.log('完成所有训练！');
                      completeTraining();
                      return 0; // 重置组数
                    }
                    return newSet;
                  });
                  return 0; // 重置重复次数
                }
                return newRep;
              });
            }
            
            setCurrentPhase(nextPhase);
            return 0; // 重置计时器
          }
          return newTime;
        });
      }, 100);
    }

    return () => clearInterval(interval);
  }, [isExercising, currentPhase, currentDifficulty, exercisePhases]);

  const completeTraining = async () => {
    setIsExercising(false);
    setCurrentPhase('ready');
    setTimer(0);
    
    if (!currentUserId) {
      console.log('No user ID available, cannot record training');
      if (onWalletRequired) {
        onWalletRequired();
      }
      return;
    }
    
    // 记录完成一次完整训练
    try {
      const trainingData = {
        user_id: currentUserId,
        difficulty: difficulty,
        sets_completed: Math.ceil(currentDifficulty.sets),
        reps_completed: currentDifficulty.repsPerSet * Math.ceil(currentDifficulty.sets),
        total_duration: Math.round(currentDifficulty.totalTimeMinutes * 60), // 秒
        contract_time: currentDifficulty.contractTime,
        relax_time: currentDifficulty.relaxTime
      };
      
      console.log('Recording training with data:', trainingData);
      
      const response = await fetch('/api/tigang/training/record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trainingData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to record training');
      }
      
      const result = await response.json();
      console.log('训练记录已保存:', result);
      
      // 更新本地统计
      setTodayCount(prev => prev + 1); // 增加今日训练会话数
      setTotalExercises(prev => prev + 1); // 增加该难度总完成次数（按会话计算）
      setDailySession(prev => prev + 1); // 增加今日轮数
      
      // 重新加载统计数据以获取最新的连续天数
      await loadUserStats();
      
    } catch (error) {
      console.error('保存训练记录失败:', error);
      alert(language === 'zh' ? '训练记录保存失败，请重试' : 'Failed to save training record, please try again');
    }
  };

  const startExercise = () => {
    if (!walletAddress) {
      console.log('No wallet connected, requesting wallet connection');
      if (onWalletRequired) {
        onWalletRequired();
      }
      return;
    }
    
    if (!currentUserId) {
      console.log('No user ID available, cannot start exercise');
      return;
    }
    
    setIsExercising(true);
    setCurrentPhase('contract');
    setTimer(0);
  };

  const pauseExercise = () => {
    setIsExercising(false);
  };

  const resetExercise = () => {
    setIsExercising(false);
    setCurrentPhase('ready');
    setTimer(0);
    setCurrentRep(0);
    setCurrentSet(0);
  };

  const getButtonText = () => {
    if (currentPhase === 'ready') {
      return language === 'zh' ? `开始 ${currentDifficulty.name.split('（')[0]}` : `Start ${currentDifficulty.name.split(' (')[0]}`;
    }
    if (isExercising) {
      return exercisePhases[currentPhase].text;
    }
    return language === 'zh' ? '继续' : 'Continue';
  };

  const getProgressPercentage = () => {
    if (currentPhase === 'ready') return 0;
    return (timer / exercisePhases[currentPhase].duration) * 100;
  };

  const getRemainingTime = () => {
    if (currentPhase === 'ready') return currentDifficulty.totalTimeMinutes;
    return Math.max(0, exercisePhases[currentPhase].duration - timer).toFixed(1);
  };

  const getProgressionInfo = () => {
    const current = difficultyLevels[difficulty];
    const remaining = Math.max(current.progressionThreshold - totalExercises, 0);
    const progress = Math.min((totalExercises / current.progressionThreshold) * 100, 100);
    
    return {
      remaining,
      progress,
      canProgress: totalExercises >= current.progressionThreshold
    };
  };

  // Dropdown handlers
  const toggleDropdown = () => {
    if (!isExercising) {
      setIsDropdownOpen(!isDropdownOpen);
    }
  };

  const selectDifficulty = (newDifficulty) => {
    setDifficulty(newDifficulty);
    setIsDropdownOpen(false);
  };

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.difficulty-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const progressionInfo = getProgressionInfo();

  // 显示钱包连接提示
  if (!walletAddress) {
    return (
      <div className="w-full max-w-lg mx-auto">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-6 shadow-lg text-center">
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-bold mb-2">
            {language === 'zh' ? '连接钱包开始训练' : 'Connect Wallet to Start Training'}
          </h2>
          <p className="text-sm opacity-90 mb-4">
            {language === 'zh' ? 
              '连接钱包后，您的训练数据将与钱包地址绑定，可在任何设备上访问' : 
              'After connecting your wallet, your training data will be bound to your wallet address and accessible on any device'
            }
          </p>
          <button
            onClick={onWalletRequired}
            className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200"
          >
            {language === 'zh' ? '连接钱包' : 'Connect Wallet'}
          </button>
        </div>
      </div>
    );
  }

  // 显示加载状态
  if (loading || !currentUserId) {
    return (
      <div className="w-full max-w-lg mx-auto">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-6 shadow-lg text-center">
          <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-bold mb-2">
            {language === 'zh' ? '加载训练数据...' : 'Loading Training Data...'}
          </h2>
          <p className="text-sm opacity-90">
            {language === 'zh' ? '正在获取您的训练记录' : 'Fetching your training records'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      {/* 训练情况Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center space-x-2">
            <Trophy className="w-6 h-6" />
            <span>{language === 'zh' ? '训练中心' : 'Training Center'}</span>
          </h2>
          <div className="text-right">
            <div className="text-sm opacity-90">{language === 'zh' ? '当前级别' : 'Current Level'}</div>
            <div className="font-semibold">{currentDifficulty.name.split('（')[0] || currentDifficulty.name.split(' (')[0]}</div>
          </div>
        </div>
        
        {/* 训练统计 */}
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{todayCount}</div>
            <div className="text-xs opacity-90">{language === 'zh' ? '今日训练' : 'Today'}</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{dailySession}</div>
            <div className="text-xs opacity-90">{language === 'zh' ? '本周训练' : 'This Week'}</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{totalExercises}</div>
            <div className="text-xs opacity-90">{language === 'zh' ? '总完成次数' : 'Total'}</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{streak}</div>
            <div className="text-xs opacity-90">{language === 'zh' ? '连续天数' : 'Streak'}</div>
          </div>
        </div>
      </div>

      {/* 训练级别选择区域 */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <span>{language === 'zh' ? '训练级别选择' : 'Training Level Selection'}</span>
          </label>
          
          {/* 现代化的自定义下拉菜单 */}
          <div className="relative difficulty-dropdown">
            <button
              onClick={toggleDropdown}
              disabled={isExercising}
              className={`
                w-full p-4 pr-12 bg-gradient-to-r from-white to-gray-50 border-2 border-gray-200 rounded-xl text-left font-medium text-gray-800 shadow-lg transition-all duration-300 hover:shadow-xl hover:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400
                ${isExercising ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50'}
                ${isDropdownOpen ? 'border-blue-400 ring-4 ring-blue-100' : ''}
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    {currentDifficulty.name.split('（')[0] || currentDifficulty.name.split(' (')[0]}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {currentDifficulty.contractTime}s/{currentDifficulty.relaxTime}s • {currentDifficulty.repsPerSet}×{Math.ceil(currentDifficulty.sets)} • {currentDifficulty.totalTimeMinutes}min
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>
            
            {/* 下拉菜单选项 */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden">
                {Object.entries(difficultyLevels).map(([key, level]) => {
                  const isSelected = difficulty === key;
                  const difficultyColors = {
                    beginner: 'from-green-500 to-emerald-600',
                    intermediate: 'from-yellow-500 to-orange-600',
                    advanced: 'from-red-500 to-pink-600'
                  };
                  
                  return (
                    <button
                      key={key}
                      onClick={() => selectDifficulty(key)}
                      className={`
                        w-full p-4 text-left border-b border-gray-100 last:border-b-0 transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50
                        ${isSelected ? 'bg-gradient-to-r from-blue-100 to-purple-100' : 'hover:bg-gray-50'}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${difficultyColors[key]}`}></div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                {level.name.split('（')[0] || level.name.split(' (')[0]}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {level.contractTime}s/{level.relaxTime}s • {level.repsPerSet}×{Math.ceil(level.sets)} • {level.totalTimeMinutes}min
                              </div>
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* 级别描述 */}
          <div className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-100">
            <p className="text-xs text-gray-600 leading-relaxed">{currentDifficulty.description}</p>
          </div>
        </div>
        
        {/* 训练参数显示 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 rounded-md p-3 text-center border border-gray-100">
            <div className="font-semibold text-gray-700 text-sm">
              {language === 'zh' ? '时长配比' : 'Timing'}
            </div>
            <div className="text-blue-600 font-bold">
              {currentDifficulty.contractTime}s/{currentDifficulty.relaxTime}s
            </div>
          </div>
          <div className="bg-gray-50 rounded-md p-3 text-center border border-gray-100">
            <div className="font-semibold text-gray-700 text-sm">
              {language === 'zh' ? '训练量' : 'Volume'}
            </div>
            <div className="text-green-600 font-bold">
              {currentDifficulty.repsPerSet}×{Math.ceil(currentDifficulty.sets)}
            </div>
          </div>
          <div className="bg-gray-50 rounded-md p-3 text-center border border-gray-100">
            <div className="font-semibold text-gray-700 text-sm">
              {language === 'zh' ? '预计时长' : 'Duration'}
            </div>
            <div className="text-purple-600 font-bold">
              {currentDifficulty.totalTimeMinutes} {language === 'zh' ? '分钟' : 'min'}
            </div>
          </div>
                     <div className="bg-gray-50 rounded-md p-3 text-center border border-gray-100">
             <div className="font-semibold text-gray-700 text-sm">
               {language === 'zh' ? '当前难度完成' : 'Current Level Progress'}
             </div>
             <div className="text-indigo-600 font-bold text-xs">
               {totalExercises} {language === 'zh' ? '次' : 'times'}
             </div>
           </div>
        </div>

        {/* 方形训练按钮 */}
        <div className="relative mb-4">
          <button
            onClick={currentPhase === 'ready' ? startExercise : (isExercising ? pauseExercise : startExercise)}
            className={`
              w-full h-32 rounded-lg font-bold text-lg transition-all duration-200 shadow-lg
              ${isExercising ? 'animate-pulse' : ''}
              ${currentPhase === 'contract' ? 'bg-red-500 text-white shadow-red-200' : 
                currentPhase === 'relax' ? 'bg-green-500 text-white shadow-green-200' : 
                'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-blue-200'}
            `}
          >
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="text-xl font-bold">
                {getButtonText()}
              </div>
              
              {currentPhase !== 'ready' && (
                <div className="text-lg font-mono opacity-90">
                  {getRemainingTime()}s
                </div>
              )}
              
              {currentPhase === 'ready' && (
                <div className="text-center">
                  <div className="text-sm opacity-80">
                    {language === 'zh' ? '点击开始训练' : 'Tap to start'}
                  </div>
                  <div className="text-xs opacity-70">
                    {language === 'zh' ? 
                      `${currentDifficulty.repsPerSet}次 × ${Math.ceil(currentDifficulty.sets)}组，约${currentDifficulty.totalTimeMinutes}分钟` : 
                      `${currentDifficulty.repsPerSet} reps × ${Math.ceil(currentDifficulty.sets)} sets, ~${currentDifficulty.totalTimeMinutes}min`
                    }
                  </div>
                </div>
              )}
            </div>
          </button>

          {/* 进度条 */}
          {currentPhase !== 'ready' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white bg-opacity-30 rounded-b-lg overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-100 ease-linear"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          )}
        </div>

        {/* 训练进度显示 */}
        {(isExercising || currentSet > 0) && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="text-center space-y-2">
              <div className="text-sm font-semibold text-gray-700">
                {language === 'zh' ? '训练进度' : 'Training Progress'}
              </div>
              <div className="flex justify-center space-x-4 text-sm">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                  {language === 'zh' ? '组' : 'Set'}: {currentSet + 1}/{Math.ceil(currentDifficulty.sets)}
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
                  {language === 'zh' ? '次' : 'Rep'}: {currentRep + 1}/{currentDifficulty.repsPerSet}
                </span>
              </div>
            </div>
          </div>
        )}

        

         {/* 控制按钮 */}
         <div className="flex items-center space-x-4">
           <Button
             variant="outline"
             onClick={isExercising ? pauseExercise : startExercise}
             className="flex-1 flex items-center justify-center space-x-2"
             disabled={loading}
           >
             {isExercising ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
             <span>{isExercising ? (language === 'zh' ? '暂停' : 'Pause') : (language === 'zh' ? '开始' : 'Start')}</span>
           </Button>
           
           <Button
             variant="secondary"
             onClick={resetExercise}
             className="flex items-center space-x-2"
             disabled={loading}
           >
             <RotateCcw className="w-4 h-4" />
             <span>{language === 'zh' ? '重置' : 'Reset'}</span>
           </Button>
         </div>
       </div>

      {/* 进阶提醒弹窗 */}
      {showProgressionAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4 space-y-4">
            <div className="text-center">
              <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {language === 'zh' ? '🎉 恭喜！可以进阶了！' : '🎉 Congratulations! Ready to advance!'}
              </h3>
              <p className="text-gray-600">
                {language === 'zh' 
                  ? `您已完成 ${currentDifficulty.progressionThreshold} 次训练，可以升级到${difficultyLevels[showProgressionAlert]?.name}！`
                  : `You've completed ${currentDifficulty.progressionThreshold} exercises and can upgrade to ${difficultyLevels[showProgressionAlert]?.name}!`
                }
              </p>
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={() => {
                  setDifficulty(showProgressionAlert);
                  setShowProgressionAlert(false);
                }}
                className="flex-1"
              >
                {language === 'zh' ? '立即进阶' : 'Advance Now'}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowProgressionAlert(false)}
                className="flex-1"
              >
                {language === 'zh' ? '稍后' : 'Later'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TigangButton;

