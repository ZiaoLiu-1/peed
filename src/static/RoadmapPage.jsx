import React from 'react'
import { Twitter, Trophy, Users, MessageCircle, Zap, Shield, TrendingUp, Gift, Calendar, Target } from 'lucide-react'

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

const RoadmapCard = ({ icon: Icon, title, description, status, timeline, priority, language }) => {
  const statusColors = {
    'planning': 'bg-blue-100 text-blue-800',
    'development': 'bg-yellow-100 text-yellow-800', 
    'testing': 'bg-purple-100 text-purple-800',
    'completed': 'bg-green-100 text-green-800'
  }

  const priorityColors = {
    'high': 'bg-red-100 text-red-800',
    'medium': 'bg-orange-100 text-orange-800',
    'low': 'bg-gray-100 text-gray-800'
  }

  const statusLabels = {
    'planning': language === 'zh' ? '规划中' : 'Planning',
    'development': language === 'zh' ? '开发中' : 'Development',
    'testing': language === 'zh' ? '测试中' : 'Testing', 
    'completed': language === 'zh' ? '已完成' : 'Completed'
  }

  const priorityLabels = {
    'high': language === 'zh' ? '高优先级' : 'High Priority',
    'medium': language === 'zh' ? '中优先级' : 'Medium Priority',
    'low': language === 'zh' ? '低优先级' : 'Low Priority'
  }

  return (
    <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-r from-green-400 to-blue-500">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <Badge className={statusColors[status]}>
                {statusLabels[status]}
              </Badge>
              <Badge className={priorityColors[priority]}>
                {priorityLabels[priority]}
              </Badge>
            </div>
          </div>
        </div>
      </div>
      
      <p className="text-gray-600 mb-4 leading-relaxed">{description}</p>
    </Card>
  )
}

const RoadmapPage = ({ language = 'zh' }) => {
  const roadmapItems = [
    {
      icon: Twitter,
      title: language === 'zh' ? '推特绑定' : 'Twitter Integration',
      description: language === 'zh' 
        ? '连接推特账号，分享训练成果，与更多健康爱好者互动交流，扩大PEED社区影响力'
        : 'Connect Twitter accounts, share training achievements, interact with health enthusiasts, and expand PEED community influence',
      status: 'development',
      timeline: language === 'zh' ? '2024 Q1' : '2024 Q1',
      priority: 'high'
    },
    {
      icon: Zap,
      title: language === 'zh' ? '个性化训练' : 'Smart Reminders',
      description: language === 'zh'
        ? '基于AI生成的个人训练计划，根据用户习惯和身体状况智能调整训练强度'
        : 'AI-based personalized training plan, intelligently adjust training intensity based on user habits and physical condition',
      status: 'development',
      timeline: language === 'zh' ? '2024 Q3' : '2024 Q3',
      priority: 'high'
    },
    {
      icon: Trophy,
      title: language === 'zh' ? '排行榜系统' : 'Leaderboard System',
      description: language === 'zh'
        ? '实时排行榜，展示训练达人，激发竞争精神。包括日榜、周榜、月榜等多维度排名'
        : 'Real-time leaderboards showcasing training experts to inspire competitive spirit. Including daily, weekly, and monthly rankings',
      status: 'planning',
      timeline: language === 'zh' ? '2024 Q1' : '2024 Q1',
      priority: 'high'
    },
    
    {
      icon: Users,
      title: language === 'zh' ? '好友系统' : 'Friend System',
      description: language === 'zh'
        ? '添加好友，组建训练小组，相互监督鼓励。支持好友挑战和协作训练模式'
        : 'Add friends, form training groups, and encourage each other. Support friend challenges and collaborative training modes',
      status: 'planning',
      timeline: language === 'zh' ? '2024 Q2' : '2024 Q2', 
      priority: 'medium'
    },
    {
      icon: MessageCircle,
      title: language === 'zh' ? '论坛讨论' : 'Forum Discussion',
      description: language === 'zh'
        ? '健康话题讨论区，专家答疑，用户交流心得体会。打造专业的健康社区平台'
        : 'Health topic discussion area, expert Q&A, user experience sharing. Build a professional health community platform',
      status: 'planning',
      timeline: language === 'zh' ? '2024 Q2' : '2024 Q2',
      priority: 'medium'
    },
    {
      icon: Shield,
      title: language === 'zh' ? '健康数据分析' : 'Health Data Analytics',
      description: language === 'zh'
        ? '深度健康数据分析，提供个人健康报告，追踪长期健康趋势和改善建议'
        : 'Deep health data analysis, providing personal health reports, tracking long-term health trends and improvement suggestions',
      status: 'planning',
      timeline: language === 'zh' ? '2024 Q3' : '2024 Q3',
      priority: 'low'
    },
    {
      icon: Gift,
      title: language === 'zh' ? '奖励商城' : 'Reward Store',
      description: language === 'zh'
        ? '训练积分兑换实物奖励，健康产品折扣，激励用户持续参与训练'
        : 'Exchange training points for physical rewards, health product discounts, and incentivize continued user participation',
      status: 'planning',
      timeline: language === 'zh' ? '2024 Q4' : '2024 Q4',
      priority: 'low'
    },
    {
      icon: TrendingUp,
      title: language === 'zh' ? '数据可视化升级' : 'Data Visualization Upgrade',
      description: language === 'zh'
        ? '更直观的数据图表，训练历史可视化，帮助用户更好地了解自己的进步'
        : 'More intuitive data charts and training history visualization to help users better understand their progress',
      status: 'planning',
      timeline: language === 'zh' ? '2024 Q4' : '2024 Q4',
      priority: 'low'
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              {language === 'zh' ? '🚀 PEED 未来发展规划' : '🚀 PEED Future Development Plan'}
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {language === 'zh' 
                ? '我们致力于打造最专业、最有趣的健康训练平台。以下是我们正在规划和开发的新功能，让我们一起期待PEED的美好未来！'
                : 'We are committed to building the most professional and fun health training platform. Here are the new features we are planning and developing. Let\'s look forward to PEED\'s bright future together!'
              }
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Badge className="bg-green-100 text-green-800 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>{language === 'zh' ? '持续迭代' : 'Continuous Iteration'}</span>
              </Badge>
              <Badge className="bg-blue-100 text-blue-800 flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>{language === 'zh' ? '社区驱动' : 'Community Driven'}</span>
              </Badge>
              <Badge className="bg-purple-100 text-purple-800 flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>{language === 'zh' ? '创新功能' : 'Innovative Features'}</span>
              </Badge>
            </div>
          </div>
        </section>

        {/* Roadmap Cards */}
        <section className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roadmapItems.map((item, index) => (
              <RoadmapCard
                key={index}
                icon={item.icon}
                title={item.title}
                description={item.description}
                status={item.status}
                timeline={item.timeline}
                priority={item.priority}
                language={language}
              />
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center mt-16">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {language === 'zh' ? '💡 有想法？我们想听！' : '💡 Have Ideas? We Want to Hear!'}
            </h3>
            <p className="text-gray-600 mb-6">
              {language === 'zh' 
                ? '如果你有任何功能建议或者想法，欢迎通过社区反馈给我们。你的意见将直接影响PEED的发展方向！'
                : 'If you have any feature suggestions or ideas, feel free to give us feedback through the community. Your input will directly influence PEED\'s development direction!'
              }
            </p>
            
            <div className="flex justify-center mb-6">
              <Button 
                onClick={() => window.open('https://x.com/PeedTigang', '_blank')}
                className="flex items-center space-x-2 bg-black hover:bg-gray-800 text-white"
              >
                <Twitter className="w-5 h-5" />
                <span>{language === 'zh' ? '关注我们的推特' : 'Follow Our Twitter'}</span>
              </Button>
            </div>
            
            <p className="text-sm text-gray-500 mt-4">
              {language === 'zh' ? '期待与你一起打造更好的PEED！' : 'Looking forward to building a better PEED with you!'}
            </p>
          </div>
        </section>
    </div>
  )
}

export default RoadmapPage 