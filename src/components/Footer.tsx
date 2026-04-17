import { Github, Mail, Globe, Heart, ExternalLink } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: '首页', href: '#home' },
    { name: '分类导航', href: '#categories' },
    { name: '前景评分', href: '#prospect-scores' },
    { name: '架构趋势', href: '#architecture-trends' },
    { name: '最新动态', href: '#timeline' },
    { name: '关于', href: '#about' },
  ];

  const categories = [
    { name: '心智模型', href: '#categories' },
    { name: '神经网络架构', href: '#categories' },
    { name: '视觉感知模型', href: '#categories' },
    { name: '游戏AI世界模型', href: '#categories' },
    { name: '机器人世界模型', href: '#categories' },
    { name: '自然语言世界模型', href: '#categories' },
    { name: '混合架构模型', href: '#categories' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">World Models Hub</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              世界模型中文知识库，系统整理全球最新研究成果，推动 AI 世界模型领域的发展与普及。
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">快捷链接</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">分类导航</h3>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.name}>
                  <a
                    href={category.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {category.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">联系方式</h3>
            <div className="space-y-3">
              <a
                href="https://github.com/3063144556-code/world-models-hub"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
              >
                <Github className="w-4 h-4" />
                GitHub 仓库
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="mailto:contact@worldmodelshub.com"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
              >
                <Mail className="w-4 h-4" />
                联系邮箱
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 mt-10 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              &copy; {currentYear} World Models Hub. All rights reserved.
            </p>
            <p className="text-gray-500 text-sm flex items-center gap-1">
              Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> for the AI community
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
