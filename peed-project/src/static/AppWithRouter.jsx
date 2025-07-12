import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { Globe, Sparkles, Heart, Award, Users, Target, TrendingUp, Shield, Wallet, User } from 'lucide-react'
import TigangButton from './TigangButton'
import ProfilePage from './ProfilePage'

// Simple UI components
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

const Badge = ({ children, className = '', ...props }) => (
  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${className}`} {...props}>
    {children}
  </span>
)

const Card = ({ children, className = '', ...props }) => (
  <div className={`bg-white rounded-xl shadow-lg border border-gray-100 p-6 ${className}`} {...props}>
    {children}
  </div>
)

function HomePage() {
  const navigate = useNavigate()
  const [language, setLanguage] = useState('zh')
  
  // 钱包相关状态
  const [walletAddress, setWalletAddress] = useState(null);
  const [isWalletConnecting, setIsWalletConnecting] = useState(false);
  const [walletError, setWalletError] = useState(null);
  const [walletType, setWalletType] = useState(null); // 'phantom', 'solflare', 'metamask'
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  
  // PEED Logo
  const peedLogo = "/peed-logo.png"

  // 获取所有支持的钱包列表（包括未安装的）
  const getAllSupportedWallets = () => {
    return [
      {
        name: 'Phantom',
        type: 'phantom',
        icon: '👻',
        description: language === 'zh' ? '最受欢迎的Solana钱包' : 'Most popular Solana wallet',
        downloadUrl: 'https://phantom.app/',
        provider: window.solana,
        isInstalled: !!(window.solana && (window.solana.isPhantom || window.solana.isConnected !== undefined))
      },
      {
        name: 'Solflare',
        type: 'solflare',
        icon: '🔥',
        description: language === 'zh' ? '安全可靠的Solana钱包' : 'Secure and reliable Solana wallet',
        downloadUrl: 'https://solflare.com/',
        provider: window.solflare,
        isInstalled: !!(window.solflare && typeof window.solflare.connect === 'function')
      },
      {
        name: 'Backpack',
        type: 'backpack',
        icon: '🎒',
        description: language === 'zh' ? '新一代多链钱包' : 'Next-gen multi-chain wallet',
        downloadUrl: 'https://backpack.app/',
        provider: window.backpack,
        isInstalled: !!(window.backpack && typeof window.backpack.connect === 'function')
      },
      {
        name: 'Coinbase Wallet',
        type: 'coinbase',
        icon: '🟦',
        description: language === 'zh' ? 'Coinbase官方钱包' : 'Official Coinbase wallet',
        downloadUrl: 'https://wallet.coinbase.com/',
        provider: window.coinbaseSolana,
        isInstalled: !!(window.coinbaseSolana && typeof window.coinbaseSolana.connect === 'function')
      },
      {
        name: 'Trezor',
        type: 'trezor',
        icon: '🔐',
        description: language === 'zh' ? '硬件钱包' : 'Hardware wallet',
        downloadUrl: 'https://trezor.io/',
        provider: window.trezor,
        isInstalled: !!(window.trezor && typeof window.trezor.connect === 'function')
      }
    ];
  };

  // 检查可用的钱包（仅已安装的）
  const getAvailableWallets = () => {
    return getAllSupportedWallets().filter(wallet => wallet.isInstalled);
  };

  // Solana钱包连接功能
  const connectWallet = async (walletType) => {
    console.log('connectWallet called with type:', walletType);
    setIsWalletConnecting(true);
    setWalletError(null);
    setShowWalletOptions(false);

    try {
      let provider;
      let walletName;
      
      const wallet = getAllSupportedWallets().find(w => w.type === walletType);
      if (!wallet) {
        throw new Error(language === 'zh' ? '不支持的钱包类型' : 'Unsupported wallet type');
      }
      
      if (!wallet.isInstalled) {
        throw new Error(language === 'zh' ? `请先安装 ${wallet.name} 钱包` : `Please install ${wallet.name} wallet first`);
      }
      
      provider = wallet.provider;
      walletName = wallet.name;

      console.log('Connecting to wallet:', walletName);
      const response = await provider.connect();
      console.log('Connect response:', response);
      
      let publicKey;
      
      // 不同钱包的publicKey获取方式不同
      if (response && response.publicKey) {
        // 大多数钱包返回包含publicKey的对象
        publicKey = response.publicKey;
      } else if (provider.publicKey) {
        // 有些钱包的publicKey在provider上
        publicKey = provider.publicKey;
      } else if (response === true && provider.publicKey) {
        // 有些钱包connect返回true，publicKey在provider上
        publicKey = provider.publicKey;
      }
      
      console.log('Final publicKey:', publicKey);
      
      if (publicKey) {
        setWalletAddress(publicKey.toString());
        setWalletType(walletType);
        setWalletError(null);
        console.log(`${walletName} connected:`, publicKey.toString());
      } else {
        throw new Error(language === 'zh' ? '无法获取钱包地址' : 'Failed to get wallet address');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      if (error.code === 4001) {
        setWalletError(language === 'zh' ? '用户拒绝连接钱包' : 'User rejected wallet connection');
      } else {
        setWalletError(error.message || (language === 'zh' ? '钱包连接失败' : 'Failed to connect wallet'));
      }
    } finally {
      setIsWalletConnecting(false);
    }
  };

  // 显示钱包选择器
  const showWalletSelector = () => {
    console.log('showWalletSelector called');
    // 始终显示钱包选择器，让用户自己选择
    setShowWalletOptions(true);
  };

  const disconnectWallet = async () => {
    try {
      const wallet = getAllSupportedWallets().find(w => w.type === walletType);
      if (wallet && wallet.provider && typeof wallet.provider.disconnect === 'function') {
        await wallet.provider.disconnect();
      }
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
    
    // 清除本地状态
    setWalletAddress(null);
    setWalletType(null);
    setWalletError(null);
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // 监听钱包账户变化
  useEffect(() => {
    const handleDisconnect = () => {
      setWalletAddress(null);
      setWalletType(null);
    };

    // 为所有钱包添加断开连接监听器
    getAllSupportedWallets().forEach(wallet => {
      if (wallet.provider && typeof wallet.provider.on === 'function') {
        wallet.provider.on('disconnect', handleDisconnect);
        wallet.provider.on('accountChanged', (publicKey) => {
          if (!publicKey) {
            handleDisconnect();
          } else {
            setWalletAddress(publicKey.toString());
          }
        });
      }
    });
    
    // 清理监听器
    return () => {
      getAllSupportedWallets().forEach(wallet => {
        if (wallet.provider && typeof wallet.provider.removeAllListeners === 'function') {
          wallet.provider.removeAllListeners('disconnect');
          wallet.provider.removeAllListeners('accountChanged');
        }
      });
    };
  }, []);

  // 钱包选择器关闭逻辑
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showWalletOptions && event.target.classList.contains('wallet-selector')) {
        setShowWalletOptions(false);
      }
    };

    const handleEscKey = (event) => {
      if (event.key === 'Escape' && showWalletOptions) {
        setShowWalletOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscKey);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showWalletOptions]);

  // 同步钱包地址到用户信息
  useEffect(() => {
    if (walletAddress) {
      const savedUserInfo = localStorage.getItem('peed_user_info')
      let userInfo = savedUserInfo ? JSON.parse(savedUserInfo) : { nickname: 'peed', avatar: null, joinDate: '2024-01-01' }
      userInfo.walletAddress = walletAddress
      localStorage.setItem('peed_user_info', JSON.stringify(userInfo))
    }
  }, [walletAddress])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img src={peedLogo} alt="PEED Logo" className="w-12 h-12 rounded-full animate-pulse" />
            <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400 animate-spin" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-green-700">PEED</h1>
            <p className="text-xs text-gray-500">{language === 'zh' ? 'Hi！我是PEED小乌龟！' : 'Hi! I\'m PEED the turtle!'}</p>
          </div>
        </div>
        
        {/* 右上角按钮组 */}
        <div className="flex items-center space-x-3">
          {/* 个人信息按钮 */}
          <Button
            variant="outline"
            onClick={() => navigate('/profile')}
            className="flex items-center space-x-2 hover:bg-green-50 border-green-200"
          >
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">
              {language === 'zh' ? '个人信息' : 'Profile'}
            </span>
          </Button>

          {/* 钱包连接按钮 */}
          {!walletAddress ? (
            <div className="relative">
              <Button
                variant="outline"
                onClick={showWalletSelector}
                disabled={isWalletConnecting}
                className="flex items-center space-x-2 hover:bg-green-50 border-green-200"
              >
                <Wallet className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {isWalletConnecting 
                    ? (language === 'zh' ? '连接中...' : 'Connecting...') 
                    : (language === 'zh' ? '连接钱包' : 'Connect')
                  }
                </span>
              </Button>
              
              {/* 钱包选择器弹窗 */}
              {showWalletOptions && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 wallet-selector">
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
                    {/* 弹窗头部 */}
                    <div className="px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {language === 'zh' ? '连接钱包' : 'Connect Wallet'}
                        </h3>
                        <button
                          onClick={() => setShowWalletOptions(false)}
                          className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {language === 'zh' ? '选择一个钱包来连接到PEED' : 'Choose a wallet to connect to PEED'}
                      </p>
                    </div>

                    {/* 钱包列表 */}
                    <div className="px-6 py-4 space-y-3">
                      {getAllSupportedWallets().map((wallet) => (
                        <div key={wallet.type} className="group">
                          {wallet.isInstalled ? (
                            // 已安装的钱包 - 可以连接
                            <button
                              onClick={() => connectWallet(wallet.type)}
                              disabled={isWalletConnecting}
                              className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all duration-200 group-hover:shadow-md disabled:opacity-50"
                            >
                              <div className="flex items-center space-x-4">
                                <span className="text-2xl">{wallet.icon}</span>
                                <div className="text-left">
                                  <div className="font-medium text-gray-900">{wallet.name}</div>
                                  <div className="text-sm text-gray-600">{wallet.description}</div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                  {language === 'zh' ? '已安装' : 'Installed'}
                                </span>
                                <svg className="w-5 h-5 text-gray-400 group-hover:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </button>
                          ) : (
                            // 未安装的钱包 - 显示下载链接
                            <div className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-gray-50">
                              <div className="flex items-center space-x-4">
                                <span className="text-2xl opacity-60">{wallet.icon}</span>
                                <div className="text-left">
                                  <div className="font-medium text-gray-600">{wallet.name}</div>
                                  <div className="text-sm text-gray-500">{wallet.description}</div>
                                </div>
                              </div>
                              <a
                                href={wallet.downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-200 px-3 py-2 rounded-full transition-colors"
                              >
                                {language === 'zh' ? '安装' : 'Install'}
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* 弹窗底部 */}
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                      <p className="text-xs text-gray-500 text-center">
                        {language === 'zh' ? '首次使用？选择 Phantom 或 Solflare 开始使用 Solana' : 'New to Solana? Get started with Phantom or Solflare'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500 hidden sm:inline">
                  {(() => {
                    const wallet = getAllSupportedWallets().find(w => w.type === walletType);
                    return wallet ? wallet.icon : '🔗';
                  })()}
                </span>
                <span className="text-sm text-gray-700 font-mono hidden sm:inline">
                  {formatAddress(walletAddress)}
                </span>
              </div>
              <Button
                variant="outline"
                onClick={disconnectWallet}
                className="px-2 py-2 hover:bg-green-50 border-green-200"
              >
                <span className="sr-only">{language === 'zh' ? '断开钱包' : 'Disconnect'}</span>
                ✕
              </Button>
            </div>
          )}
          
          {/* 语言切换按钮 */}
          <Button 
            variant="outline" 
            onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
            className="flex items-center space-x-2 hover:bg-green-50 border-green-200"
          >
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">{language === 'zh' ? 'EN' : '中文'}</span>
          </Button>
        </div>

        {/* 钱包错误提示 */}
        {walletError && (
          <div className="absolute top-20 right-4 bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm shadow-lg">
            {walletError}
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          {/* PEED Logo in center */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <img 
                src="/peed-logo.png" 
                alt="PEED Logo" 
                className="w-20 h-20 rounded-full shadow-lg border-4 border-white hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white animate-pulse" />
              </div>
            </div>
          </div>
          
          <Badge className="mb-4 bg-gradient-to-r from-green-100 to-blue-100 text-green-700 hover:from-green-200 hover:to-blue-200 animate-pulse">
            {language === 'zh' ? '健康生活新方式 ✨' : 'New Way of Healthy Living ✨'}
          </Badge>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            {language === 'zh' ? 'PEED - 小乌龟的健康提醒' : 'PEED - Your Turtle Health Companion'}
          </h1>
          <p className="text-2xl text-gray-600 mb-4 animate-bounce">
            {language === 'zh' ? '每天提肛，健康一生！🐢' : 'Daily Kegels, Lifelong Health! 🐢'}
          </p>
          <p className="text-lg text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
            {language === 'zh' ? 'PEED小乌龟是你的贴心健康助手，专注于男性健康管理，让提肛运动变得有趣又有效！我们的小乌龟PEED（取自PE/ED）是你的专属健康伙伴，每天提醒你做运动，让健康变得超有趣！' : 'PEED turtle is your caring health assistant, focusing on men\'s health management, making Kegel exercises fun and effective! Our little turtle PEED (from PE/ED) is your personal health buddy, reminding you daily to exercise and making health super fun!'}
          </p>
          <div className="flex justify-center space-x-4">
            <TigangButton language={language} />
          </div>
        </div>
      </section>

      {/* Features Section - 紧凑竖直布局 */}
      <section className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            {language === 'zh' ? '为什么选择PEED？' : 'Why Choose PEED?'}
          </h2>
          <p className="text-base text-gray-600">{language === 'zh' ? '因为我们的小乌龟超级可爱又专业！' : 'Because our little turtle is super cute and professional!'}</p>
        </div>
        
        {/* 紧凑的竖直卡片布局 */}
        <div className="space-y-4">
          {/* 第一行：专注健康 + 个性化训练 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105 p-4">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-green-700">
                {language === 'zh' ? '专注健康' : 'Focus on Health'}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {language === 'zh' ? '专业的提肛运动指导，改善男性健康问题' : 'Professional Kegel exercise guidance to improve men\'s health issues'}
              </p>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105 p-4">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-blue-700">
                {language === 'zh' ? '个性化训练' : 'Personalized Training'}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {language === 'zh' ? '根据个人情况定制运动计划和强度' : 'Customized exercise plans and intensity based on individual conditions'}
              </p>
            </Card>
          </div>
          
          {/* 第二行：社区支持 + 成就系统 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105 p-4">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-purple-700">
                {language === 'zh' ? '社区支持' : 'Community Support'}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {language === 'zh' ? '与志同道合的朋友一起坚持健康习惯' : 'Stick to healthy habits with like-minded friends'}
              </p>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105 p-4">
              <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-yellow-700">
                {language === 'zh' ? '成就系统' : 'Achievement System'}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {language === 'zh' ? '完成训练获得奖励，保持运动动力' : 'Complete training to get rewards and maintain exercise motivation'}
              </p>
            </Card>
          </div>
          
          {/* 第三行：数据追踪 + 隐私保护 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105 p-4">
              <div className="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-red-700">
                {language === 'zh' ? '数据追踪' : 'Data Tracking'}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {language === 'zh' ? '详细记录运动数据，追踪健康改善' : 'Detailed exercise data recording to track health improvements'}
              </p>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105 p-4">
              <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-indigo-700">
                {language === 'zh' ? '隐私保护' : 'Privacy Protection'}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {language === 'zh' ? '完全匿名使用，保护个人隐私' : 'Completely anonymous use, protecting personal privacy'}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-600">
        <p>© 2024 PEED - {language === 'zh' ? '让健康变得有趣' : 'Making Health Fun'} 🐢</p>
      </footer>
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePageWrapper />} />
      </Routes>
    </Router>
  )
}

// ProfilePage包装器，用于处理导航
function ProfilePageWrapper() {
  const navigate = useNavigate()
  const [language, setLanguage] = useState('zh')

  const handleBack = () => {
    navigate('/')
  }

  return <ProfilePage language={language} onBack={handleBack} />
}

export default App

