import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Trophy, Info } from 'lucide-react';

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

const TigangButton = ({ language = 'zh' }) => {
  const [isExercising, setIsExercising] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('ready'); // ready, contract, relax
  const [timer, setTimer] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [totalExercises, setTotalExercises] = useState(0); // 总完成次数
  const [loading, setLoading] = useState(false);
  const [difficulty, setDifficulty] = useState('beginner'); // beginner, intermediate, advanced
  const [currentRep, setCurrentRep] = useState(0);
  const [currentSet, setCurrentSet] = useState(0);
  const [dailySession, setDailySession] = useState(0);
  const [showProgressionAlert, setShowProgressionAlert] = useState(false);
  
  // 模拟用户ID（实际应用中应该从认证系统获取）
  const currentUserId = 1;

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
      progressionThreshold: 700, // 进阶标准：700次总完成
      progressionWeeks: '2-4',
      description: language === 'zh' ? 
        '收缩肛门2-4秒，放松5-6秒。坐姿或仰卧姿势，减少其他肌肉代偿' : 
        'Contract anal muscles 2-4s, relax 5-6s. Sitting or lying position to reduce muscle compensation',
      medicalAdvice: language === 'zh' ? 
        '主要适应肌肉收缩，避免过度疲劳导致盆底肌代偿性紧张。短时间、低强度训练帮助建立神经肌肉控制。' :
        'Focus on muscle adaptation, avoid overexertion that causes compensatory tension. Short, low-intensity training helps establish neuromuscular control.'
    },
    intermediate: {
      name: language === 'zh' ? '入门级（强化训练阶段）' : 'Intermediate (Strengthening Phase)',
      contractTime: 6, // 收缩5-7秒，取中间值6秒
      relaxTime: 4, // 放松3-5秒，取中间值4秒
      repsPerSet: 17, // 每组15-20次，取中间值17次
      sets: 3.5, // 每天3-4组，取中间值3.5组
      dailySessions: 1,
      totalTimeMinutes: 12.5, // 10-15分钟，取中间值
      progressionThreshold: 1750, // 进阶标准：1750次总完成
      progressionWeeks: '4-6',
      description: language === 'zh' ? 
        '收缩5-7秒，放松3-5秒。可尝试站立或行走时练习，增加核心稳定性' : 
        'Contract 5-7s, relax 3-5s. Try standing or walking exercises to increase core stability',
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
      progressionThreshold: 5000, // 维持标准：5000次
      progressionWeeks: '8-12',
      description: language === 'zh' ? 
        '收缩8-10秒，放松2-3秒。可结合不同姿势（胸膝卧位、分腿提肛）增加难度' : 
        'Contract 8-10s, relax 2-3s. Combine different postures (knee-chest position, leg-spread exercises) for increased difficulty',
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

  // 加载用户统计数据
  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      setLoading(true);
      const user = await statsAPI.getUserStats(currentUserId);
      setTodayCount(user.total_exercises || 0);
      setStreak(user.current_streak || 0);
      setTotalTime(user.total_time_minutes || 0);
      setTotalExercises(user.total_exercises || 0);
    } catch (error) {
      console.error('Failed to load user stats:', error);
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    let interval;
    if (isExercising && currentPhase !== 'ready') {
      interval = setInterval(() => {
        setTimer(prev => {
          const currentPhaseDuration = exercisePhases[currentPhase].duration;
          const newTime = prev + 0.1;
          
          if (newTime >= currentPhaseDuration) {
            // 切换到下一个阶段
            const currentIndex = phaseOrder.indexOf(currentPhase);
            const nextIndex = (currentIndex + 1) % phaseOrder.length;
            
            // 如果完成了放松阶段，意味着完成了一次重复
            if (currentPhase === 'relax') {
              const newRep = currentRep + 1;
              setCurrentRep(newRep);
              
              // 检查是否完成了当前组
              if (newRep >= currentDifficulty.repsPerSet) {
                const newSet = currentSet + 1;
                setCurrentSet(newSet);
                setCurrentRep(0);
                
                // 检查是否完成了所有组
                if (newSet >= Math.ceil(currentDifficulty.sets)) {
                  // 完成训练
                  completeTraining();
                  return 0;
                } else {
                  // 组间休息
                  pauseExercise();
                  setTimeout(() => {
                    if (isExercising) {
                      setCurrentPhase('contract');
                    }
                  }, 2000); // 2秒组间休息
                  return 0;
                }
              }
            }
            
            setCurrentPhase(phaseOrder[nextIndex]);
            return 0;
          }
          
          return newTime;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isExercising, currentPhase, currentRep, currentSet]);

  const completeTraining = async () => {
    try {
      const totalDuration = Math.ceil(currentDifficulty.sets) * currentDifficulty.repsPerSet * 
                          (currentDifficulty.contractTime + currentDifficulty.relaxTime);
      
      const exerciseData = {
        user_id: currentUserId,
        duration_seconds: totalDuration,
        repetitions: Math.ceil(currentDifficulty.sets) * currentDifficulty.repsPerSet,
        phase_type: `${difficulty}_complete`
      };
      
      const response = await exerciseAPI.recordExercise(exerciseData);
      
      // 更新本地状态
      setTodayCount(prev => prev + 1);
      setTotalTime(prev => prev + Math.ceil(totalDuration / 60));
      setTotalExercises(prev => prev + exerciseData.repetitions);
      setDailySession(prev => prev + 1);
      
      // 重置训练状态
      resetExercise();
      
      // 重新加载统计数据
      loadUserStats();
      
      // 显示完成消息
      alert(language === 'zh' ? 
        `恭喜完成 ${currentDifficulty.name} 训练！` : 
        `Congratulations! Completed ${currentDifficulty.name} training!`);
        
    } catch (error) {
      console.error('Failed to record exercise:', error);
    }
  };

  const startExercise = () => {
    setIsExercising(true);
    setCurrentPhase('contract');
    setTimer(0);
    setCurrentRep(0);
    setCurrentSet(0);
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
      const levelNames = {
        'beginner': language === 'zh' ? '新手级' : 'Beginner',
        'intermediate': language === 'zh' ? '入门级' : 'Intermediate', 
        'advanced': language === 'zh' ? '精通级' : 'Advanced'
      };
      return language === 'zh' ? 
        `开始 ${levelNames[difficulty]}` : 
        `Start ${levelNames[difficulty]}`;
    }
    if (!isExercising) return language === 'zh' ? '继续' : 'Continue';
    return exercisePhases[currentPhase]?.text || (language === 'zh' ? '训练中' : 'Training');
  };

  const getProgressPercentage = () => {
    if (currentPhase === 'ready') return 0;
    const duration = exercisePhases[currentPhase]?.duration || 1;
    return Math.min((timer / duration) * 100, 100);
  };

  const getRemainingTime = () => {
    if (currentPhase === 'ready') return '';
    const duration = exercisePhases[currentPhase]?.duration || 1;
    const remaining = Math.max(duration - timer, 0);
    return remaining.toFixed(1);
  };

  // 获取进阶建议
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

  if (loading) {
    return (
      <div className="flex flex-col items-center space-y-8 p-8">
        <div className="loading-spinner"></div>
        <p className="text-gray-500">{language === 'zh' ? '加载中...' : 'Loading...'}</p>
      </div>
    );
  }

  const progressionInfo = getProgressionInfo();

      return (
    <div className="flex flex-col items-center space-y-8 p-8">
      {/* 训练系统标题 */}
      <div className="text-center mb-4">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          PEED
        </h2>
        <p className="text-base text-gray-600 font-medium">
          {language === 'zh' ? '科学智能提肛训练系统' : 'Scientific Smart Kegel Training System'}
        </p>
      </div>

      {/* 进阶提醒 */}
      {showProgressionAlert && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg w-full max-w-md">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5" />
            <div className="text-sm">
              <strong>{language === 'zh' ? '恭喜！您可以进阶到' : 'Congratulations! You can advance to'} 
              {difficultyLevels[showProgressionAlert].name}</strong>
              <p className="mt-1 text-xs">
                {language === 'zh' ? 
                  '您已完成足够的训练次数，可以尝试更高难度的训练。' :
                  'You have completed enough training sessions to try higher difficulty levels.'}
              </p>
              <div className="mt-2 flex space-x-2">
                <Button 
                  variant="default" 
                  onClick={() => {
                    setDifficulty(showProgressionAlert);
                    setShowProgressionAlert(false);
                  }}
                  className="text-xs py-1 px-2"
                >
                  {language === 'zh' ? '立即进阶' : 'Upgrade Now'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowProgressionAlert(false)}
                  className="text-xs py-1 px-2"
                >
                  {language === 'zh' ? '稍后提醒' : 'Remind Later'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 难度选择与进阶信息 */}
      <div className="w-full max-w-md space-y-4">
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-gray-200 rounded-xl p-4 shadow-sm">
          <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <span>{language === 'zh' ? '训练级别选择' : 'Training Level Selection'}</span>
          </label>
          
          {/* 美化的选择器 */}
          <div className="relative">
            <select 
              value={difficulty} 
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full p-4 pr-12 bg-white border-2 border-gray-200 rounded-lg text-sm font-medium text-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300 cursor-pointer appearance-none"
              disabled={isExercising}
            >
              {Object.entries(difficultyLevels).map(([key, level]) => (
                <option key={key} value={key} className="py-2">
                  {level.name}
                </option>
              ))}
            </select>
            
            {/* 自定义下拉箭头 */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          {/* 级别描述 */}
          <div className="mt-3 p-3 bg-white bg-opacity-60 rounded-md border border-gray-100">
            <p className="text-xs text-gray-600 leading-relaxed">{currentDifficulty.description}</p>
          </div>
          
          {/* 训练参数显示 */}
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white bg-opacity-60 rounded-md p-2 text-center border border-gray-100">
              <div className="font-semibold text-gray-700">
                {language === 'zh' ? '时长配比' : 'Timing'}
              </div>
              <div className="text-blue-600 font-bold">
                {currentDifficulty.contractTime}s/{currentDifficulty.relaxTime}s
              </div>
            </div>
            <div className="bg-white bg-opacity-60 rounded-md p-2 text-center border border-gray-100">
              <div className="font-semibold text-gray-700">
                {language === 'zh' ? '训练量' : 'Volume'}
              </div>
              <div className="text-green-600 font-bold">
                {currentDifficulty.repsPerSet}×{Math.ceil(currentDifficulty.sets)}
              </div>
            </div>
          </div>
        </div>

        {/* 进阶进度 */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              {language === 'zh' ? '进阶进度' : 'Progression Progress'}
            </span>
            <span className="text-xs text-gray-500">
              {totalExercises}/{currentDifficulty.progressionThreshold}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressionInfo.progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {progressionInfo.canProgress ? 
              (language === 'zh' ? '🎉 可以进阶到下一级别！' : '🎉 Ready to advance to next level!') :
              (language === 'zh' ? 
                `还需完成 ${progressionInfo.remaining} 次 (约${currentDifficulty.progressionWeeks}周)` :
                `${progressionInfo.remaining} more exercises needed (approx. ${currentDifficulty.progressionWeeks} weeks)`)
            }
          </p>
        </div>
      </div>

      {/* 训练进度 */}
      {(isExercising || currentSet > 0) && (
        <div className="text-center space-y-2">
          <div className="text-lg font-semibold text-gray-700">
            {language === 'zh' ? '训练进度' : 'Progress'}
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
      )}

      {/* 统计信息 */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
        {/* 第一行 */}
        <div className="text-center">
          <div className="text-xl font-bold text-gradient">{todayCount}</div>
          <div className="text-xs text-gray-500">{language === 'zh' ? '今日训练' : 'Today'}</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-gradient">{dailySession}</div>
          <div className="text-xs text-gray-500">{language === 'zh' ? '今日轮数' : 'Sessions'}</div>
        </div>
        
        {/* 第二行 */}
        <div className="text-center">
          <div className="text-xl font-bold text-gradient">{totalExercises}</div>
          <div className="text-xs text-gray-500">{language === 'zh' ? '总完成次数' : 'Total Exercises'}</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-gradient">{streak}</div>
          <div className="text-xs text-gray-500">{language === 'zh' ? '连续天数' : 'Streak'}</div>
        </div>
      </div>

      {/* 主按钮区域 */}
      <div className="relative">
        {/* 进度环 */}
        <div className="absolute inset-0 w-48 h-48">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="rgba(129, 216, 207, 0.2)"
              strokeWidth="4"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke={currentPhase === 'contract' ? '#ef4444' : '#10b981'}
              strokeWidth="4"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgressPercentage() / 100)}`}
              className="transition-all duration-100 ease-linear"
            />
          </svg>
        </div>

        {/* 主按钮 */}
        <button
          onClick={currentPhase === 'ready' ? startExercise : (isExercising ? pauseExercise : startExercise)}
          className={`
            tigang-button ripple-effect w-48 h-48 rounded-full
            flex flex-col items-center justify-center relative z-10
            ${isExercising ? 'pulse-animation' : ''}
            ${currentPhase === 'contract' ? 'bg-red-500' : currentPhase === 'relax' ? 'bg-green-500' : ''}
          `}
        >
          <div className="text-xl font-bold mb-2">
            {getButtonText()}
          </div>
          {currentPhase !== 'ready' && (
            <div className="text-lg font-mono opacity-90">
              {getRemainingTime()}s
            </div>
          )}
          {currentPhase === 'ready' && (
            <div className="text-sm opacity-80 mt-2">
              {language === 'zh' ? '点击开始训练' : 'Tap to start'}
            </div>
          )}
        </button>
      </div>

      {/* 控制按钮 */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={isExercising ? pauseExercise : startExercise}
          disabled={currentPhase === 'ready'}
          className="flex items-center space-x-2"
        >
          {isExercising ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span>
            {isExercising ? 
              (language === 'zh' ? '暂停' : 'Pause') : 
              (language === 'zh' ? '继续' : 'Continue')
            }
          </span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={resetExercise}
          disabled={currentPhase === 'ready'}
          className="flex items-center space-x-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{language === 'zh' ? '重置' : 'Reset'}</span>
        </Button>
      </div>

      {/* 运动指导 */}
      <div className="text-center max-w-md space-y-4">
        <h3 className="text-lg font-semibold mb-2">
          {language === 'zh' ? '科学运动指导' : 'Scientific Exercise Guide'}
        </h3>
        
        {/* 基础动作 */}
        <div className="text-left bg-blue-50 border-2 border-blue-200 rounded-lg p-4 shadow-sm">
          <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <span>{language === 'zh' ? '基础动作要领' : 'Basic Movement Techniques'}</span>
          </h4>
          <div className="text-sm text-gray-700 space-y-3">
            <div className="bg-white bg-opacity-70 rounded-md p-3 border-l-4 border-red-400">
              <span className="text-red-600 font-semibold">
                {language === 'zh' ? '收缩期：' : 'Contraction Phase: '}
              </span>
              <span className="text-gray-800">
                {language === 'zh' ? '缓慢收紧肛门肌肉，如同憋住气体，向上提升' : 'Slowly tighten anal muscles as if holding gas, lift upward'}
              </span>
            </div>
            <div className="bg-white bg-opacity-70 rounded-md p-3 border-l-4 border-green-400">
              <span className="text-green-600 font-semibold">
                {language === 'zh' ? '放松期：' : 'Relaxation Phase: '}
              </span>
              <span className="text-gray-800">
                {language === 'zh' ? '缓慢完全放松肌肉，保持自然呼吸' : 'Slowly completely relax muscles, maintain natural breathing'}
              </span>
            </div>
          </div>
        </div>

                 {/* 训练姿势 */}
         <div className="text-left bg-green-50 border-2 border-green-200 rounded-lg p-4 shadow-sm">
           <h4 className="text-sm font-semibold text-green-800 mb-3 flex items-center space-x-2">
             <div className="w-2 h-2 bg-green-600 rounded-full"></div>
             <span>{language === 'zh' ? '训练姿势选择' : 'Training Posture Options'}</span>
           </h4>
           <div className="text-sm text-gray-700 space-y-3">
             <div className="bg-white bg-opacity-70 rounded-md p-3">
               <div className="flex items-center space-x-3">
                 <span className="text-xs bg-green-500 text-white px-3 py-1 rounded-full font-medium min-w-fit">
                   {language === 'zh' ? '新手' : 'Beginner'}
                 </span>
                 <div className="flex-1">
                   <div className="font-semibold text-gray-800 mb-1">
                     {language === 'zh' ? '坐姿/仰卧' : 'Sitting/Lying'}
                   </div>
                   <div className="text-gray-600 text-xs">
                     {language === 'zh' ? 
                       '减少其他肌肉代偿，专注于肛门肌肉控制' : 
                       'Reduce compensatory muscle activation, focus on anal muscle control'}
                   </div>
                 </div>
               </div>
             </div>
               
             <div className="bg-white bg-opacity-70 rounded-md p-3">
               <div className="flex items-center space-x-3">
                 <span className="text-xs bg-blue-500 text-white px-3 py-1 rounded-full font-medium min-w-fit">
                   {language === 'zh' ? '入门' : 'Inter.'}
                 </span>
                 <div className="flex-1">
                   <div className="font-semibold text-gray-800 mb-1">
                     {language === 'zh' ? '站立/行走' : 'Standing/Walking'}
                   </div>
                   <div className="text-gray-600 text-xs">
                     {language === 'zh' ? 
                       '增加核心稳定性，模拟日常生活场景' : 
                       'Increase core stability, simulate daily life scenarios'}
                   </div>
                 </div>
               </div>
             </div>
               
             <div className="bg-white bg-opacity-70 rounded-md p-3">
               <div className="flex items-center space-x-3">
                 <span className="text-xs bg-purple-500 text-white px-3 py-1 rounded-full font-medium min-w-fit">
                   {language === 'zh' ? '精通' : 'Adv.'}
                 </span>
                 <div className="flex-1">
                   <div className="font-semibold text-gray-800 mb-1">
                     {language === 'zh' ? '胸膝卧位/分腿提肛' : 'Knee-chest/Leg-spread'}
                   </div>
                   <div className="text-gray-600 text-xs">
                     {language === 'zh' ? 
                       '增加训练难度，深层肌肉参与' : 
                       'Increase training difficulty, engage deep muscle layers'}
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </div>

        {/* 医学建议 */}
        <div className="text-left bg-amber-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-amber-800 mb-2 flex items-center space-x-1">
            <Info className="w-4 h-4" />
            <span>{language === 'zh' ? '医学建议' : 'Medical Advice'}</span>
          </h4>
          <p className="text-sm text-gray-600">
            {currentDifficulty.medicalAdvice}
          </p>
          
          {/* 进阶时机 */}
          <div className="mt-3 pt-2 border-t border-amber-200">
            <div className="text-xs text-amber-700">
              <strong>{language === 'zh' ? '进阶时机：' : 'Progression Timing: '}</strong>
              {language === 'zh' ? 
                `能够稳定完成${currentDifficulty.contractTime}秒收缩+${currentDifficulty.relaxTime}秒放松，且无疲劳感，持续${currentDifficulty.progressionWeeks}周后可进入下一级。` :
                `Able to stably complete ${currentDifficulty.contractTime}s contraction + ${currentDifficulty.relaxTime}s relaxation without fatigue for ${currentDifficulty.progressionWeeks} weeks before advancing.`}
            </div>
          </div>
        </div>

        {/* 注意事项 */}
        <div className="text-left bg-red-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-red-800 mb-2">
            {language === 'zh' ? '注意事项' : 'Important Notes'}
          </h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• {language === 'zh' ? '训练中无疼痛、尿潴留或肌肉痉挛' : 'No pain, urinary retention, or muscle spasms during training'}</p>
            <p>• {language === 'zh' ? '如出现不适，应退回上一阶段或减少训练量' : 'If discomfort occurs, return to previous stage or reduce training volume'}</p>
            <p>• {language === 'zh' ? '严重肛肠疾病患者需咨询医生' : 'Patients with severe anorectal diseases should consult a doctor'}</p>
          </div>
        </div>
      </div>

      {/* 今日训练建议 */}
      <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-4 w-full max-w-md">
        <div className="text-center">
          <div className="text-sm font-medium text-gray-700 mb-2">
            {language === 'zh' ? '今日训练建议' : "Today's Recommendation"}
          </div>
          <div className="flex justify-center space-x-4 text-sm">
            <span className="text-green-600 font-semibold">
              {dailySession}/{currentDifficulty.dailySessions} {language === 'zh' ? '轮' : 'sessions'}
            </span>
            <span className="text-gray-500">
              {language === 'zh' ? '剩余' : 'Remaining'}: {Math.max(currentDifficulty.dailySessions - dailySession, 0)}
            </span>
          </div>
          {dailySession >= currentDifficulty.dailySessions && (
            <div className="mt-2 text-green-600 font-semibold text-sm">
              🎉 {language === 'zh' ? '今日训练目标已完成！' : 'Daily goal completed!'}
            </div>
          )}
          
          {/* 进度条 */}
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div 
              className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((dailySession / currentDifficulty.dailySessions) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TigangButton;

