import React, { useState, useEffect } from 'react'
import { Globe, Sparkles, Heart, Award, Users, Target, TrendingUp, Shield, Wallet, User, LogOut, Settings, Info, Map } from 'lucide-react'
import TigangButton from './TigangButton'
import ProfilePage from './ProfilePageWallet'
import RoadmapPage from './RoadmapPage'
import AboutPage from './AboutPage'
import apiClient from './api.js'

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

// Simple login modal
const LoginModal = ({ isOpen, onClose, language, onLogin }) => {
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [demoUsers] = useState([
    { id: 1, username: 'demo_user', nickname: 'PEED演示用户' },
    { id: 2, username: 'trainer_pro', nickname: '专业训练师' }
  ])

  const handleLogin = async (selectedUsername) => {
    setIsLoading(true)
    try {
      const user = await apiClient.loginUser({ username: selectedUsername })
      onLogin(user)
      onClose()
    } catch (error) {
      console.error('Login failed:', error)
      alert(language === 'zh' ? '登录失败' : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCustomLogin = async () => {
    if (!username.trim()) return
    await handleLogin(username.trim())
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">
          {language === 'zh' ? '选择用户登录' : 'Select User to Login'}
        </h3>
        
        <div className="space-y-3 mb-4">
          {demoUsers.map((user) => (
            <button
              key={user.id}
              onClick={() => handleLogin(user.username)}
              disabled={isLoading}
              className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <div className="font-medium">{user.nickname}</div>
              <div className="text-sm text-gray-500">@{user.username}</div>
            </button>
          ))}
        </div>

        <div className="border-t pt-4">
          <p className="text-sm text-gray-600 mb-2">
            {language === 'zh' ? '或输入用户名:' : 'Or enter username:'}
          </p>
          <div className="flex space-x-2">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={language === 'zh' ? '用户名' : 'Username'}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
              onKeyPress={(e) => e.key === 'Enter' && handleCustomLogin()}
            />
            <Button onClick={handleCustomLogin} disabled={isLoading || !username.trim()}>
              {language === 'zh' ? '登录' : 'Login'}
            </Button>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={onClose}
          className="w-full mt-4"
          disabled={isLoading}
        >
          {language === 'zh' ? '取消' : 'Cancel'}
        </Button>
      </div>
    </div>
  )
}

function App() {
  const [language, setLanguage] = useState('zh')
  const [currentPage, setCurrentPage] = useState('home') // 'home', 'profile', 'roadmap', 'about'
  
  // 钱包相关状态
  const [walletAddress, setWalletAddress] = useState(null);
  const [isWalletConnecting, setIsWalletConnecting] = useState(false);
  const [walletError, setWalletError] = useState(null);
  const [walletType, setWalletType] = useState(null); // 'phantom', 'solflare', etc
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  
  // PEED Logo
  const peedLogo = "/peed-logo.png"

  // Load saved wallet info from localStorage on mount and check wallet connection
  useEffect(() => {
    const checkSavedWallet = async () => {
      const savedWalletAddress = localStorage.getItem('peed_wallet_address')
      const savedWalletType = localStorage.getItem('peed_wallet_type')
      
      if (savedWalletAddress && savedWalletType) {
        console.log('Loading saved wallet:', savedWalletAddress, savedWalletType)
        
        // 验证钱包是否仍然连接
        const wallet = getAllSupportedWallets().find(w => w.type === savedWalletType)
        if (wallet && wallet.isInstalled && wallet.provider) {
          try {
            // 检查钱包是否仍然连接
            if (wallet.provider.publicKey && wallet.provider.isConnected) {
              setWalletAddress(savedWalletAddress)
              setWalletType(savedWalletType)
              console.log('Wallet still connected:', savedWalletAddress)
            } else {
              // 钱包已断开，清理保存的信息
              clearWalletInfo()
            }
          } catch (error) {
            console.error('Error checking wallet connection:', error)
            clearWalletInfo()
          }
        } else {
          // 钱包不可用，清理保存的信息
          clearWalletInfo()
        }
      }
    }
    
    checkSavedWallet()
  }, [])

  // Save wallet info to localStorage
  const saveWalletInfo = (address, type) => {
    localStorage.setItem('peed_wallet_address', address)
    localStorage.setItem('peed_wallet_type', type)
    console.log('Wallet info saved to localStorage:', address, type)
  }

  // Clear wallet info from localStorage
  const clearWalletInfo = () => {
    localStorage.removeItem('peed_wallet_address')
    localStorage.removeItem('peed_wallet_type')
    console.log('Wallet info cleared from localStorage')
  }

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
        const addressStr = publicKey.toString();
        setWalletAddress(addressStr);
        setWalletType(walletType);
        setWalletError(null);
        
        // 保存到localStorage
        saveWalletInfo(addressStr, walletType);
        
        console.log(`${walletName} connected:`, addressStr);
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
    
    // 清除本地状态和localStorage
    setWalletAddress(null);
    setWalletType(null);
    setWalletError(null);
    clearWalletInfo();
    
    // 返回首页
    setCurrentPage('home');
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
      clearWalletInfo();
    };

    // 为所有钱包添加断开连接监听器
    getAllSupportedWallets().forEach(wallet => {
      if (wallet.provider && typeof wallet.provider.on === 'function') {
        wallet.provider.on('disconnect', handleDisconnect);
        wallet.provider.on('accountChanged', (publicKey) => {
          if (!publicKey) {
            handleDisconnect();
          } else {
            const addressStr = publicKey.toString();
            setWalletAddress(addressStr);
            // 更新localStorage
            if (walletType) {
              saveWalletInfo(addressStr, walletType);
            }
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

  // Handle page navigation - 现在基于钱包连接而不是用户登录
  const handlePageChange = (page) => {
    console.log('handlePageChange called with:', page, 'walletAddress:', walletAddress)
    if (page === 'profile' && !walletAddress) {
      console.log('No wallet connected, showing wallet options')
      setShowWalletOptions(true);
    } else {
      console.log('Setting current page to:', page)
      setCurrentPage(page);
    }
  };

  // Render roadmap page with topbar
  if (currentPage === 'roadmap') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        {/* 顶部导航栏 */}
        <header className="bg-white/90 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img src={peedLogo} alt="PEED" className="w-8 h-8 rounded-full animate-pulse" />
                  <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-400 animate-spin" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-green-700">PEED</h1>
                  <p className="text-xs text-gray-500">
                    {language === 'zh' ? '发展路线图' : 'Development Roadmap'}
                  </p>
                </div>
              </div>

              {/* Navigation & Controls */}
              <div className="flex items-center space-x-4">
                {/* Back to Home Button */}
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage('home')}
                  className="flex items-center space-x-2 hover:bg-green-50 border-green-200"
                >
                  <span>{language === 'zh' ? '返回首页' : 'Back to Home'}</span>
                </Button>

                {/* Profile Button (if wallet connected) */}
                {walletAddress && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      console.log('Profile button clicked, wallet:', walletAddress)
                      handlePageChange('profile')
                    }}
                    className="flex items-center space-x-2"
                  >
                    <User className="w-4 h-4" />
                    <span>{language === 'zh' ? '查看资料' : 'View Profile'}</span>
                  </Button>
                )}

                {/* Language Toggle */}
                <Button
                  variant="outline"
                  onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
                  className="flex items-center space-x-2"
                >
                  <Globe className="w-4 h-4" />
                  <span>{language === 'zh' ? 'EN' : '中文'}</span>
                </Button>

                {/* Wallet Connection */}
                {walletAddress ? (
                  <div className="flex items-center space-x-3">
                    <Badge className="bg-green-100 text-green-800 flex items-center space-x-2">
                      <Wallet className="w-4 h-4" />
                      <span>{formatAddress(walletAddress)}</span>
                    </Badge>
                    <Button
                      variant="outline"
                      onClick={disconnectWallet}
                      className="text-red-600 hover:text-red-700"
                    >
                      {language === 'zh' ? '断开' : 'Disconnect'}
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => {
                      console.log('Connect wallet button clicked')
                      showWalletSelector()
                    }}
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
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main>
          <RoadmapPage language={language} />
        </main>

        {/* Wallet Selection Modal */}
        {showWalletOptions && (
          <div className="wallet-selector fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4 text-center">
                {language === 'zh' ? '选择钱包' : 'Select Wallet'}
              </h3>
              
              <div className="space-y-3">
                {getAllSupportedWallets().map((wallet) => (
                  <div key={wallet.type} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{wallet.icon}</span>
                        <div>
                          <h4 className="font-medium">{wallet.name}</h4>
                          <p className="text-sm text-gray-500">{wallet.description}</p>
                        </div>
                      </div>
                      
                      {wallet.isInstalled ? (
                        <Button
                          onClick={() => connectWallet(wallet.type)}
                          disabled={isWalletConnecting}
                          className="ml-4"
                        >
                          {language === 'zh' ? '连接' : 'Connect'}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => window.open(wallet.downloadUrl, '_blank')}
                          className="ml-4"
                        >
                          {language === 'zh' ? '安装' : 'Install'}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {walletError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{walletError}</p>
                </div>
              )}

              <Button
                variant="outline"
                onClick={() => setShowWalletOptions(false)}
                className="w-full mt-6"
              >
                {language === 'zh' ? '关闭' : 'Close'}
              </Button>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>© 2024 PEED - {language === 'zh' ? '让健康变得有趣' : 'Making Health Fun'} 🐢</p>
        </footer>
      </div>
    );
  }

  // Render about page with topbar
  if (currentPage === 'about') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        {/* 顶部导航栏 */}
        <header className="bg-white/90 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img src={peedLogo} alt="PEED" className="w-8 h-8 rounded-full animate-pulse" />
                  <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-400 animate-spin" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-green-700">PEED</h1>
                  <p className="text-xs text-gray-500">
                    {language === 'zh' ? '关于我' : 'About Me'}
                  </p>
                </div>
              </div>

              {/* Navigation & Controls */}
              <div className="flex items-center space-x-4">
                {/* Back to Home Button */}
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage('home')}
                  className="flex items-center space-x-2 hover:bg-green-50 border-green-200"
                >
                  <span>{language === 'zh' ? '返回首页' : 'Back to Home'}</span>
                </Button>

                {/* Roadmap Button */}
                <Button
                  variant="outline"
                  onClick={() => handlePageChange('roadmap')}
                  className="flex items-center space-x-2 hover:bg-blue-50 border-blue-200"
                >
                  <Map className="w-4 h-4" />
                  <span>{language === 'zh' ? '发展路线' : 'Roadmap'}</span>
                </Button>

                {/* Profile Button (if wallet connected) */}
                {walletAddress && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      console.log('Profile button clicked, wallet:', walletAddress)
                      handlePageChange('profile')
                    }}
                    className="flex items-center space-x-2"
                  >
                    <User className="w-4 h-4" />
                    <span>{language === 'zh' ? '查看资料' : 'View Profile'}</span>
                  </Button>
                )}

                {/* Language Toggle */}
                <Button
                  variant="outline"
                  onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
                  className="flex items-center space-x-2"
                >
                  <Globe className="w-4 h-4" />
                  <span>{language === 'zh' ? 'EN' : '中文'}</span>
                </Button>

                {/* Wallet Connection */}
                {walletAddress ? (
                  <div className="flex items-center space-x-3">
                    <Badge className="bg-green-100 text-green-800 flex items-center space-x-2">
                      <Wallet className="w-4 h-4" />
                      <span>{formatAddress(walletAddress)}</span>
                    </Badge>
                    <Button
                      variant="outline"
                      onClick={disconnectWallet}
                      className="text-red-600 hover:text-red-700"
                    >
                      {language === 'zh' ? '断开' : 'Disconnect'}
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => {
                      console.log('Connect wallet button clicked')
                      showWalletSelector()
                    }}
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
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main>
          <AboutPage language={language} />
        </main>

        {/* Wallet Selection Modal */}
        {showWalletOptions && (
          <div className="wallet-selector fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4 text-center">
                {language === 'zh' ? '选择钱包' : 'Select Wallet'}
              </h3>
              
              <div className="space-y-3">
                {getAllSupportedWallets().map((wallet) => (
                  <div key={wallet.type} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{wallet.icon}</span>
                        <div>
                          <h4 className="font-medium">{wallet.name}</h4>
                          <p className="text-sm text-gray-500">{wallet.description}</p>
                        </div>
                      </div>
                      
                      {wallet.isInstalled ? (
                        <Button
                          onClick={() => connectWallet(wallet.type)}
                          disabled={isWalletConnecting}
                          className="ml-4"
                        >
                          {language === 'zh' ? '连接' : 'Connect'}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => window.open(wallet.downloadUrl, '_blank')}
                          className="ml-4"
                        >
                          {language === 'zh' ? '安装' : 'Install'}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {walletError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{walletError}</p>
                </div>
              )}

              <Button
                variant="outline"
                onClick={() => setShowWalletOptions(false)}
                className="w-full mt-6"
              >
                {language === 'zh' ? '关闭' : 'Close'}
              </Button>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>© 2024 PEED - {language === 'zh' ? '让健康变得有趣' : 'Making Health Fun'} 🐢</p>
        </footer>
      </div>
    );
  }

  // Render profile page - 现在需要钱包连接
  if (currentPage === 'profile' && walletAddress) {
    console.log('Rendering ProfilePage with wallet:', walletAddress, walletType)
    return (
      <ProfilePage
        language={language}
        onBack={() => setCurrentPage('home')}
        walletAddress={walletAddress}
        walletType={walletType}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* 顶部导航栏 */}
      <header className="bg-white/90 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img src={peedLogo} alt="PEED" className="w-8 h-8 rounded-full animate-pulse" />
                <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-400 animate-spin" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-green-700">PEED</h1>
                <p className="text-xs text-gray-500">
                  {language === 'zh' ? 'Hi！我是PEED小乌龟！' : 'Hi! I\'m PEED the turtle!'}
                </p>
              </div>
            </div>

            {/* Navigation & Controls */}
            <div className="flex items-center space-x-4">
              {/* Roadmap Button */}
              <Button
                variant="outline"
                onClick={() => handlePageChange('roadmap')}
                className="flex items-center space-x-2 hover:bg-blue-50 border-blue-200"
              >
                <Map className="w-4 h-4" />
                <span>{language === 'zh' ? '发展路线' : 'Roadmap'}</span>
              </Button>

              {/* About Me Button */}
              <Button
                variant="outline"
                onClick={() => handlePageChange('about')}
                className="flex items-center space-x-2 hover:bg-purple-50 border-purple-200"
              >
                <Info className="w-4 h-4" />
                <span>{language === 'zh' ? '关于我' : 'About Me'}</span>
              </Button>

              {/* 仅保留钱包连接状态的导航 */}
              {walletAddress && (
                <Button
                  variant="outline"
                  onClick={() => {
                    console.log('Profile button clicked, wallet:', walletAddress)
                    handlePageChange('profile')
                  }}
                  className="flex items-center space-x-2"
                >
                  <User className="w-4 h-4" />
                  <span>{language === 'zh' ? '查看资料' : 'View Profile'}</span>
                </Button>
              )}

              {/* Language Toggle */}
              <Button
                variant="outline"
                onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
                className="flex items-center space-x-2"
              >
                <Globe className="w-4 h-4" />
                <span>{language === 'zh' ? 'EN' : '中文'}</span>
              </Button>

              {/* Wallet Connection */}
              {walletAddress ? (
                <div className="flex items-center space-x-3">
                  <Badge className="bg-green-100 text-green-800 flex items-center space-x-2">
                    <Wallet className="w-4 h-4" />
                    <span>{formatAddress(walletAddress)}</span>
                  </Badge>
                  <Button
                    variant="outline"
                    onClick={disconnectWallet}
                    className="text-red-600 hover:text-red-700"
                  >
                    {language === 'zh' ? '断开' : 'Disconnect'}
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => {
                    console.log('Connect wallet button clicked')
                    showWalletSelector()
                  }}
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
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="container mx-auto px-4 py-8">
        {/* Project Status Notice */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-orange-100 to-red-100 border-l-4 border-orange-500 rounded-lg p-4 shadow-md">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">!</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-orange-800 mb-1">
                  {language === 'zh' ? '📢 项目状态提醒' : '📢 Project Status Notice'}
                </h3>
                <p className="text-orange-700 text-sm leading-relaxed">
                  {language === 'zh' 
                    ? '项目目前还在开发完善中，暂未正式上线！请关注我们的推特获取最新进展和上线通知～' 
                    : 'The project is still under development and not officially launched yet! Please follow our Twitter for the latest updates and launch notifications～'}
                </p>
              </div>
              <div className="flex-shrink-0">
                <a 
                  href="https://x.com/PeedTigang" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1 bg-orange-500 text-white text-sm font-medium rounded-md hover:bg-orange-600 transition-colors duration-200"
                >
                  <span className="mr-1">🐦</span>
                  {language === 'zh' ? '关注推特' : 'Follow Twitter'}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <section className="text-center mb-16">
          <div className="max-w-4xl mx-auto">
            {/* PEED Logo in center */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <img 
                  src={peedLogo} 
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
              {language === 'zh' 
                ? 'PEED小乌龟是你的贴心健康助手，专注于男性健康管理，让提肛运动变得有趣又有效！我们的小乌龟PEED（取自PE/ED）是你的专属健康伙伴，每天提醒你做运动，让健康变得超有趣！'
                : 'PEED turtle is your caring health assistant, focusing on men\'s health management, making Kegel exercises fun and effective! Our little turtle PEED (from PE/ED) is your personal health buddy, reminding you daily to exercise and making health super fun!'
              }
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <TigangButton 
                language={language}
                walletAddress={walletAddress}
                walletType={walletType}
                onWalletRequired={() => {
                  console.log('TigangButton requested wallet connection')
                  showWalletSelector()
                }}
              />
            </div>
          </div>
        </section>

        {/* Exercise Guide Section */}
        <section className="container mx-auto px-4 py-12 max-w-2xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              {language === 'zh' ? '科学运动指导' : 'Scientific Exercise Guide'}
            </h2>
          </div>
          
          {/* 基础动作 */}
          <div className="text-left bg-blue-50 border-2 border-blue-200 rounded-lg p-4 shadow-sm mb-6">
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
          <div className="text-left bg-green-50 border-2 border-green-200 rounded-lg p-4 shadow-sm mb-6">
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
          <div className="text-left bg-amber-50 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-semibold text-amber-800 mb-2 flex items-center space-x-1">
              <Info className="w-4 h-4" />
              <span>{language === 'zh' ? '医学建议' : 'Medical Advice'}</span>
            </h4>
            <p className="text-sm text-gray-600">
              {language === 'zh' ? 
                '主要适应肌肉收缩，避免过度疲劳导致盆底肌代偿性紧张。短时间、低强度训练帮助建立神经肌肉控制。' :
                'Focus on muscle contraction adaptation, avoid excessive fatigue causing compensatory pelvic floor muscle tension. Short-term, low-intensity training helps establish neuromuscular control.'}
            </p>
            
            {/* 进阶时机 */}
            <div className="mt-3 pt-2 border-t border-amber-200">
              <div className="text-xs text-amber-700">
                <strong>{language === 'zh' ? '进阶时机：' : 'Progression Timing: '}</strong>
                {language === 'zh' ? 
                  '能够稳定完成3秒收缩+5秒放松，且无疲劳感，持续2-4周后可进入下一级。' :
                  'Able to stably complete 3s contraction + 5s relaxation without fatigue for 2-4 weeks before advancing.'}
              </div>
            </div>
          </div>

          {/* 注意事项 */}
          <div className="text-left bg-red-50 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-semibold text-red-800 mb-2">
              {language === 'zh' ? '注意事项' : 'Important Notes'}
            </h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• {language === 'zh' ? '训练中无疼痛、尿潴留或肌肉痉挛' : 'No pain, urinary retention, or muscle spasms during training'}</p>
              <p>• {language === 'zh' ? '如出现不适，应退回上一阶段或减少训练量' : 'If discomfort occurs, return to previous stage or reduce training volume'}</p>
              <p>• {language === 'zh' ? '严重肛肠疾病患者需咨询医生' : 'Patients with severe anorectal diseases should consult a doctor'}</p>
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
            
            {/* 第三行：数据追踪 + 好友互动 */}
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
                <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-purple-700">
                  {language === 'zh' ? '好友互动' : 'Friend Interaction'}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {language === 'zh' ? '添加好友，一起训练，互相鼓励进步' : 'Add friends, train together, and encourage each other to improve'}
                </p>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Wallet Selection Modal */}
      {showWalletOptions && (
        <div className="wallet-selector fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 text-center">
              {language === 'zh' ? '选择钱包' : 'Select Wallet'}
            </h3>
            
            <div className="space-y-3">
              {getAllSupportedWallets().map((wallet) => (
                <div key={wallet.type} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{wallet.icon}</span>
                      <div>
                        <h4 className="font-medium">{wallet.name}</h4>
                        <p className="text-sm text-gray-500">{wallet.description}</p>
                      </div>
                    </div>
                    
                    {wallet.isInstalled ? (
                      <Button
                        onClick={() => connectWallet(wallet.type)}
                        disabled={isWalletConnecting}
                        className="ml-4"
                      >
                        {language === 'zh' ? '连接' : 'Connect'}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => window.open(wallet.downloadUrl, '_blank')}
                        className="ml-4"
                      >
                        {language === 'zh' ? '安装' : 'Install'}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {walletError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{walletError}</p>
              </div>
            )}

            <Button
              variant="outline"
              onClick={() => setShowWalletOptions(false)}
              className="w-full mt-6"
            >
              {language === 'zh' ? '关闭' : 'Close'}
            </Button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-600">
        <p>© 2024 PEED - {language === 'zh' ? '让健康变得有趣' : 'Making Health Fun'} 🐢</p>
      </footer>
    </div>
  )
}

export default App