import { useState, useEffect } from 'react';
import { Users, MessageSquare, Github, Mail, Globe, Heart, ExternalLink } from 'lucide-react';

interface CounterData {
  visits: number;
  comments: number;
}

const COUNTER_KEY = 'wmh_counter_data';

export default function AboutSection() {
  const [counters, setCounters] = useState<CounterData>({ visits: 12580, comments: 342 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById('about');
    if (section) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, []);

  // 从localStorage读取计数器数据（与顶部计数器同步）
  useEffect(() => {
    const loadCounters = () => {
      try {
        const saved = localStorage.getItem(COUNTER_KEY);
        if (saved) {
          const data = JSON.parse(saved);
          setCounters({
            visits: data.visits || 12580,
            comments: data.comments || 342
          });
        }
      } catch (e) {
        console.error('Failed to load counters:', e);
      }
    };

    loadCounters();

    // 监听storage变化（其他标签页更新时同步）
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === COUNTER_KEY) {
        loadCounters();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // 定时刷新（每5秒）
    const interval = setInterval(loadCounters, 5000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const stats = [
    { icon: Users, label: '总访问', value: counters.visits.toLocaleString(), color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { icon: MessageSquare, label: '留言数', value: counters.comments.toLocaleString(), color: 'text-green-600', bgColor: 'bg-green-50' },
  ];

  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
            <Globe className="w-4 h-4" />
            <span>关于我们</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            关于 World Models Hub
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            致力于构建最全面的世界模型中文知识库，推动 AI 世界模型领域的发展与普及
          </p>
        </div>

        {/* Stats */}
        <div className={`grid grid-cols-2 gap-6 mb-12 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div 
                key={stat.label}
                className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 text-center"
              >
                <div className={`w-14 h-14 ${stat.bgColor} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                  <Icon className={`w-7 h-7 ${stat.color}`} />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-gray-500">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Main Content */}
        <div className={`grid md:grid-cols-2 gap-8 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Mission */}
          <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">我们的使命</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              World Models Hub 是一个专注于世界模型领域的开源知识库项目。我们致力于收集、整理和分享全球最新的世界模型研究成果，为研究人员、开发者和爱好者提供一站式学习资源。
            </p>
            <p className="text-gray-600 leading-relaxed">
              通过系统化的分类、专业的评分体系和及时的动态更新，我们希望降低世界模型领域的学习门槛，促进学术交流与技术进步。
            </p>
          </div>

          {/* Features */}
          <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">核心特色</h3>
            <ul className="space-y-3">
              {[
                '系统化的七大分类体系，覆盖世界模型全领域',
                '专业的前景评分系统，量化研究价值与影响力',
                '实时的技术架构演进追踪，洞察发展趋势',
                '每月自动更新，保持内容时效性',
                '开源社区驱动，欢迎贡献与反馈'
              ].map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-indigo-600 text-xs font-bold">{index + 1}</span>
                  </div>
                  <span className="text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact & Links */}
        <div className={`mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h3 className="text-xl font-bold mb-6 text-center">联系我们</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://github.com/3063144556-code/world-models-hub"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
            >
              <Github className="w-5 h-5" />
              <span>GitHub 仓库</span>
              <ExternalLink className="w-4 h-4" />
            </a>
            <a
              href="mailto:contact@worldmodelshub.com"
              className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
            >
              <Mail className="w-5 h-5" />
              <span>联系邮箱</span>
            </a>
          </div>
          <p className="text-center text-indigo-100 mt-6 text-sm flex items-center justify-center gap-1">
            用 <Heart className="w-4 h-4 text-red-400 fill-red-400" /> 打造 · 开源共享 · 持续更新
          </p>
        </div>
      </div>
    </section>
  );
}
