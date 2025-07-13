import React from 'react'
import { Github, Twitter, Coffee, Heart, Code, Globe, Zap, DollarSign } from 'lucide-react'

// Simple UI components
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

const AboutPage = ({ language = 'zh' }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">👋</span>
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              {language === 'zh' ? '关于我' : 'About Me'}
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              {language === 'zh' ? 
                '你好！我是咖喱，一名来自多伦多大学的计算机科学专业大三学生。' : 
                'Hello! I\'m Gary Liu, a third-year Computer Science student at the University of Toronto.'
              }
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Badge className="bg-blue-100 text-blue-800 flex items-center space-x-2">
              <Code className="w-4 h-4" />
              <span>{language === 'zh' ? '全栈开发者' : 'Full-Stack Developer'}</span>
            </Badge>
            <Badge className="bg-green-100 text-green-800 flex items-center space-x-2">
              <Globe className="w-4 h-4" />
              <span>{language === 'zh' ? '多伦多大学' : 'University of Toronto'}</span>
            </Badge>
            <Badge className="bg-purple-100 text-purple-800 flex items-center space-x-2">
              <Heart className="w-4 h-4" />
              <span>{language === 'zh' ? '健康倡导者' : 'Health Advocate'}</span>
            </Badge>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-4xl mx-auto space-y-8">
        {/* Project Story */}
        <Card className="hover:shadow-xl transition-all duration-300">
          <div className="flex items-center space-x-3 mb-4">
            <Zap className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900">
              {language === 'zh' ? '项目缘起' : 'Project Origin'}
            </h2>
          </div>
          <p className="text-gray-600 leading-relaxed mb-4">
            {language === 'zh' ? 
              '趁着暑假空闲时间，我决定动手做一个既有趣又实用的项目，不仅丰富简历，也希望能顺便赚点零花钱。这个项目是我个人技术成长的一部分，目标是通过长期开发和迭代，搭建一个完整、可持续优化的应用。' :
              'During my summer break, I decided to create an interesting and practical project that would not only enrich my resume but also potentially earn some pocket money. This project is part of my personal technical growth, aiming to build a complete, continuously optimizable application through long-term development and iteration.'
            }
          </p>
          <p className="text-gray-600 leading-relaxed">
            {language === 'zh' ? 
              '我觉得凯格尔运动（提肛）这个角度非常有趣且暂时没有看到类似的项目，担心被抢所以用最简单的框架搭建了本项目。' :
              'I found the angle of Kegel exercises very interesting and haven\'t seen similar projects yet. Worried about the idea being taken, I built this project using the simplest frameworks.'
            }
          </p>
        </Card>

        {/* Technical Details */}
        <Card className="hover:shadow-xl transition-all duration-300">
          <div className="flex items-center space-x-3 mb-4">
            <Code className="w-6 h-6 text-blue-500" />
            <h2 className="text-2xl font-bold text-gray-900">
              {language === 'zh' ? '技术栈 & 发展计划' : 'Tech Stack & Development Plan'}
            </h2>
          </div>
          <p className="text-gray-600 leading-relaxed mb-4">
            {language === 'zh' ? 
              '目前项目采用 React + Flask 技术栈，并部署在 Render 平台上。由于个人资源有限（穷），现阶段以简单可行为主。' :
              'The project currently uses React + Flask tech stack and is deployed on the Render platform. Due to limited personal resources (being broke), the current stage focuses on simplicity and feasibility.'
            }
          </p>
          <p className="text-gray-600 leading-relaxed">
            {language === 'zh' ? 
              '未来会根据社区反馈和自身资金情况，考虑迁移到其他平台，并引入更多后端技术，如 Go、Redis 等，提升扩展性和性能。我会持续更新功能，当前重点是优化网页 UI/UX 和构建 CI/CD 自动化流程。' :
              'In the future, based on community feedback and personal financial situation, I will consider migrating to other platforms and introducing more backend technologies like Go, Redis, etc., to improve scalability and performance. I will continuously update features, with current focus on optimizing web UI/UX and building CI/CD automation processes.'
            }
          </p>
        </Card>

        {/* Development Progress */}
        <Card className="hover:shadow-xl transition-all duration-300">
          <div className="flex items-center space-x-3 mb-4">
            <Github className="w-6 h-6 text-gray-800" />
            <h2 className="text-2xl font-bold text-gray-900">
              {language === 'zh' ? '开发进度 & 参与方式' : 'Development Progress & Participation'}
            </h2>
          </div>
          <p className="text-gray-600 leading-relaxed mb-4">
            {language === 'zh' ? 
              '你可以在项目上线后通过我公开的 GitHub 查看开发进度、提交记录，也欢迎有兴趣的朋友一起来参与开发或提建议！这个项目目前是我一个人开发，仅用了 3 天时间搭建，所以仍有许多不完善之处，希望大家多多包容。我会不断改进和修复，持续推进。' :
              'You can check development progress and commit records through my public GitHub after the project goes live. Friends interested in participating in development or providing suggestions are welcome! This project is currently developed by me alone and was built in just 3 days, so there are still many imperfections. I hope everyone will be understanding. I will continuously improve and fix issues, pushing forward persistently.'
            }
          </p>
        </Card>

        {/* Important Notice */}
        <Card className="border-l-4 border-red-500 bg-red-50 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center space-x-3 mb-4">
            <DollarSign className="w-6 h-6 text-red-500" />
            <h2 className="text-2xl font-bold text-red-700">
              {language === 'zh' ? '重要提醒' : 'Important Notice'}
            </h2>
          </div>
          <div className="space-y-3">
            <p className="text-red-800 font-semibold">
              {language === 'zh' ? 
                '⚠️ 投资有风险，入市需谨慎。' :
                '⚠️ Investment involves risks, enter the market with caution.'
              }
            </p>
            <p className="text-gray-700 leading-relaxed">
              {language === 'zh' ? 
                '本项目完全免费，旨在帮助大家记录训练、养成习惯、关注男性健康，无论是否购买本meme都可以正常使用全部核心功能。' :
                'This project is completely free, aimed at helping everyone record training, develop habits, and focus on men\'s health. All core functions can be used normally regardless of whether you purchase this meme or not.'
              }
            </p>
          </div>
        </Card>

        {/* Community & Contact */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center space-x-3 mb-4">
            <Twitter className="w-6 h-6 text-blue-500" />
            <h2 className="text-2xl font-bold text-gray-900">
              {language === 'zh' ? '社区 & 联系方式' : 'Community & Contact'}
            </h2>
          </div>
          <p className="text-gray-600 leading-relaxed mb-6">
            {language === 'zh' ? 
              '欢迎加入我的 Twitter 社区 [PEED Pals]，我每天都会更新开发进度，并督促大家坚持锻炼！我是个懒逼所以也希望大家可以多多督促我开发和锻炼，谢谢！' :
              'Welcome to join my Twitter community [PEED Pals], where I update development progress daily and encourage everyone to keep exercising! I\'m quite lazy so I also hope everyone can motivate me to keep developing and exercising, thank you!'
            }
          </p>
          
          <div className="flex flex-wrap gap-4">
            <a 
              href="https://x.com/PeedTigang" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors duration-200"
            >
              <Twitter className="w-5 h-5" />
              <span>{language === 'zh' ? '关注我们的推特' : 'Follow Our Twitter'}</span>
            </a>
            
            <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg">
              <Coffee className="w-5 h-5" />
              <span>{language === 'zh' ? '开发中...' : 'In Development...'}</span>
            </div>
          </div>
        </Card>

        {/* Final Message */}
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🐢</div>
          <p className="text-gray-600 text-lg">
            {language === 'zh' ? 
              '慢慢来，比较快。感谢您的支持与理解！' :
              'Slow and steady wins the race. Thank you for your support and understanding!'
            }
          </p>
        </div>
      </section>
    </div>
  )
}

export default AboutPage 