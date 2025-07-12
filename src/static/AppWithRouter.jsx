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
    const handleAccountChanged = (publicKey) => {
      if (publicKey) {
        setWalletAddress(publicKey.toString());
      } else {
        setWalletAddress(null);
      }
    };

    const handleDisconnect = () => {
      setWalletAddress(null);
      setWalletType(null);
      setWalletError(null);
    };

    // 监听已连接钱包的账户变化
    const supportedWallets = getAllSupportedWallets();
    const connectedWallet = supportedWallets.find(w => w.type === walletType);
    
    if (connectedWallet && connectedWallet.provider) {
      const provider = connectedWallet.provider;
      
      // 监听账户变化
      if (provider.on) {
        provider.on('accountChanged', handleAccountChanged);
        provider.on('disconnect', handleDisconnect);
      }
    }

    return () => {
      // 清理监听器
      if (connectedWallet && connectedWallet.provider && connectedWallet.provider.off) {
        connectedWallet.provider.off('accountChanged', handleAccountChanged);
        connectedWallet.provider.off('disconnect', handleDisconnect);
      }
    };
  }, [walletType]);

  // 点击外部关闭钱包选择器
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showWalletOptions && event.target.closest('.wallet-selector') === null) {
        setShowWalletOptions(false);
      }
    };

    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        setShowWalletOptions(false);
      }
    };

    if (showWalletOptions) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showWalletOptions]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img src={peedLogo} alt="PEED Logo" className="w-8 h-8" />
                <h1 className="text-2xl font-bold">
                  <span className="text-green-600">PEED</span>
                  <span className="text-gray-700"> - {language === 'zh' ? '小乌龟训练师' : 'Turtle Trainer'}</span>
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* 个人中心按钮 */}
              <Button
                variant="outline"
                onClick={() => navigate('/profile')}
                className="flex items-center space-x-2 hover:bg-green-50 border-green-200"
              >
                <User className="w-4 h-4" />
                <span>{language === 'zh' ? '个人中心' : 'Profile'}</span>
              </Button>

              {/* 钱包连接区域 */}
              <div className="relative">
                {walletAddress ? (
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-100 text-green-800">
                      {formatAddress(walletAddress)}
                    </Badge>
                    <Button
                      variant="outline"
                      onClick={disconnectWallet}
                      className="text-red-600 hover:bg-red-50"
                    >
                      {language === 'zh' ? '断开' : 'Disconnect'}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="default"
                      onClick={showWalletSelector}
                      disabled={isWalletConnecting}
                      className="flex items-center space-x-2"
                    >
                      <Wallet className="w-4 h-4" />
                      <span>
                        {isWalletConnecting 
                          ? (language === 'zh' ? '连接中...' : 'Connecting...') 
                          : (language === 'zh' ? '连接钱包' : 'Connect Wallet')
                        }
                      </span>
                    </Button>
                  </div>
                )}

                {/* 钱包选择器 */}
                {showWalletOptions && (
                  <div className="wallet-selector absolute top-12 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 min-w-80">
                    <div className="mb-4">
                      <h3 className="font-semibold text-lg mb-2">
                        {language === 'zh' ? '选择钱包' : 'Select Wallet'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {language === 'zh' ? '选择你想连接的钱包' : 'Choose your preferred wallet'}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      {getAllSupportedWallets().map(wallet => (
                        <button
                          key={wallet.type}
                          onClick={() => wallet.isInstalled ? connectWallet(wallet.type) : window.open(wallet.downloadUrl, '_blank')}
                          className={`w-full flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                            wallet.isInstalled 
                              ? 'hover:bg-green-50 border-gray-200 hover:border-green-300' 
                              : 'bg-gray-50 border-gray-200 cursor-pointer hover:bg-gray-100'
                          }`}
                        >
                          <span className="text-2xl">{wallet.icon}</span>
                          <div className="flex-1 text-left">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{wallet.name}</span>
                              {!wallet.isInstalled && (
                                <Badge className="bg-blue-100 text-blue-800 text-xs">
                                  {language === 'zh' ? '未安装' : 'Not installed'}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{wallet.description}</p>
                          </div>
                          {wallet.isInstalled && (
                            <span className="text-green-600">→</span>
                          )}
                        </button>
                      ))}
                    </div>
                    
                    {walletError && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 text-sm">{walletError}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 语言切换 */}
              <Button
                variant="outline"
                onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
                className="flex items-center space-x-2"
              >
                <Globe className="w-4 h-4" />
                <span>{language === 'zh' ? 'EN' : '中文'}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="mb-8">
            <img src={peedLogo} alt="PEED Logo" className="w-24 h-24 mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {language === 'zh' ? '欢迎来到 PEED 世界' : 'Welcome to PEED World'}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {language === 'zh' 
                ? '通过科学的提肛训练，让你的小乌龟更强壮！成为最强的训练师吧！' 
                : 'Strengthen your turtle through scientific Kegel training! Become the strongest trainer!'}
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Badge className="bg-green-100 text-green-800 flex items-center space-x-2">
              <Heart className="w-4 h-4" />
              <span>{language === 'zh' ? '健康第一' : 'Health First'}</span>
            </Badge>
            <Badge className="bg-blue-100 text-blue-800 flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>{language === 'zh' ? '科学训练' : 'Scientific Training'}</span>
            </Badge>
            <Badge className="bg-purple-100 text-purple-800 flex items-center space-x-2">
              <Award className="w-4 h-4" />
              <span>{language === 'zh' ? '成就系统' : 'Achievement System'}</span>
            </Badge>
    
          </div>
        </div>
      </section>

      {/* 训练区域 */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              {language === 'zh' ? '开始你的训练' : 'Start Your Training'}
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {language === 'zh' 
                ? '选择适合你的训练难度，跟随节奏进行提肛训练。记住：坚持是成功的关键！' 
                : 'Choose your training difficulty and follow the rhythm for Kegel exercises. Remember: consistency is key!'}
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <TigangButton language={language} />
          </div>
        </div>
      </section>

      {/* 特色功能 */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              {language === 'zh' ? '为什么选择 PEED' : 'Why Choose PEED'}
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {language === 'zh' 
                ? '我们提供完整的健康训练体系，帮助你建立良好的生活习惯' 
                : 'We provide a complete health training system to help you build good life habits'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold mb-2">
                {language === 'zh' ? '三级训练' : 'Three Levels'}
              </h4>
              <p className="text-gray-600 text-sm">
                {language === 'zh' 
                  ? '从新手到精通，循序渐进的训练体系' 
                  : 'Progressive training system from beginner to advanced'}
              </p>
            </Card>

            <Card className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold mb-2">
                {language === 'zh' ? '数据追踪' : 'Data Tracking'}
              </h4>
              <p className="text-gray-600 text-sm">
                {language === 'zh' 
                  ? '详细记录你的训练进度和成果' 
                  : 'Detailed tracking of your training progress and achievements'}
              </p>
            </Card>

            <Card className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="text-lg font-semibold mb-2">
                {language === 'zh' ? '成就系统' : 'Achievement System'}
              </h4>
              <p className="text-gray-600 text-sm">
                {language === 'zh' 
                  ? '丰富的成就和徽章等你来解锁' 
                  : 'Rich achievements and badges waiting to be unlocked'}
              </p>
            </Card>

            <Card className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="text-lg font-semibold mb-2">
                {language === 'zh' ? '隐私保护' : 'Privacy Protection'}
              </h4>
              <p className="text-gray-600 text-sm">
                {language === 'zh' 
                  ? '你的健康数据完全私密和安全' 
                  : 'Your health data is completely private and secure'}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="container mx-auto text-center">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-3xl font-bold text-white mb-4">
              {language === 'zh' ? '开始你的健康之旅' : 'Start Your Health Journey'}
            </h3>
            <p className="text-green-100 mb-8">
              {language === 'zh' 
                ? '加入我们的社区，与其他训练师一起成长，让健康成为习惯！' 
                : 'Join our community, grow with other trainers, and make health a habit!'}
            </p>
            <Button
              variant="outline"
              onClick={() => navigate('/profile')}
              className="bg-white text-green-600 hover:bg-green-50 border-white"
            >
              {language === 'zh' ? '查看我的进度' : 'View My Progress'}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <img src={peedLogo} alt="PEED Logo" className="w-6 h-6" />
            <span className="text-lg font-semibold">PEED</span>
          </div>
          <p className="text-gray-400 text-sm">
            {language === 'zh' 
              ? '© 2024 PEED. 致力于男性健康训练，让每一只小乌龟都强壮有力！' 
              : '© 2024 PEED. Dedicated to men\'s health training, making every turtle strong and powerful!'}
          </p>
        </div>
      </footer>
    </div>
  )
}

function ProfilePageWrapper() {
  const navigate = useNavigate()
  const [language, setLanguage] = useState('zh')

  const handleBack = () => {
    navigate('/')
  }

  return <ProfilePage language={language} onBack={handleBack} />
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

export default App 