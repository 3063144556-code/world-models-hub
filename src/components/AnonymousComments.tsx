import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, User, Clock, Trash2, Users } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  timestamp: number;
  visitorId: string;
}

interface CounterData {
  visits: number;
  comments: number;
}

const COMMENTS_KEY = 'wmh_comments';
const COUNTER_KEY = 'wmh_counter_data';
const VISITOR_KEY = 'wmh_visitor_id';

export default function AnonymousComments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [counters, setCounters] = useState<CounterData>({ visits: 12580, comments: 342 });
  const [isVisible, setIsVisible] = useState(false);

  // 获取访客ID
  const getVisitorId = () => {
    let visitorId = localStorage.getItem(VISITOR_KEY);
    if (!visitorId) {
      visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem(VISITOR_KEY, visitorId);
    }
    return visitorId;
  };

  // 加载评论和计数器
  useEffect(() => {
    try {
      // 加载评论
      const savedComments = localStorage.getItem(COMMENTS_KEY);
      if (savedComments) {
        setComments(JSON.parse(savedComments));
      }

      // 加载计数器
      const savedCounters = localStorage.getItem(COUNTER_KEY);
      if (savedCounters) {
        setCounters(JSON.parse(savedCounters));
      }
    } catch (e) {
      console.error('Failed to load data:', e);
    }
  }, []);

  // 保存评论到 localStorage
  const saveComments = (newComments: Comment[]) => {
    try {
      localStorage.setItem(COMMENTS_KEY, JSON.stringify(newComments));
    } catch (e) {
      console.error('Failed to save comments:', e);
    }
  };

  // 更新计数器
  const updateCounter = (increment: number) => {
    try {
      const saved = localStorage.getItem(COUNTER_KEY);
      const data: CounterData = saved ? JSON.parse(saved) : { visits: 12580, comments: 342 };
      data.comments += increment;
      localStorage.setItem(COUNTER_KEY, JSON.stringify(data));
      setCounters(data);
    } catch (e) {
      console.error('Failed to update counter:', e);
    }
  };

  // 提交评论
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: 'comment_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      content: newComment.trim(),
      timestamp: Date.now(),
      visitorId: getVisitorId()
    };

    const updatedComments = [comment, ...comments];
    setComments(updatedComments);
    saveComments(updatedComments);
    updateCounter(1);
    setNewComment('');
  };

  // 删除评论（只能删除自己的）
  const handleDelete = (commentId: string) => {
    const visitorId = getVisitorId();
    const comment = comments.find(c => c.id === commentId);
    
    if (comment && comment.visitorId === visitorId) {
      const updatedComments = comments.filter(c => c.id !== commentId);
      setComments(updatedComments);
      saveComments(updatedComments);
      updateCounter(-1);
    }
  };

  // 格式化时间
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - timestamp;
    
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`;
    
    return date.toLocaleDateString('zh-CN');
  };

  const visitorId = getVisitorId();

  return (
    <section id="comments" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-10 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
            <MessageSquare className="w-4 h-4" />
            <span>留言板</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            访客留言
          </h2>
          <p className="text-lg text-gray-600">
            欢迎分享你的想法和建议，与社区一起交流
          </p>
          
          {/* Stats */}
          <div className="flex justify-center gap-8 mt-6">
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="w-5 h-5 text-blue-600" />
              <span>总访问: <strong className="text-gray-900">{counters.visits.toLocaleString()}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MessageSquare className="w-5 h-5 text-green-600" />
              <span>留言数: <strong className="text-gray-900">{counters.comments.toLocaleString()}</strong></span>
            </div>
          </div>
        </div>

        {/* Comment Form */}
        <div className={`bg-gray-50 rounded-2xl p-6 mb-8 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="写下你的想法..."
                className="w-full px-4 py-3 pr-14 bg-white border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={3}
                maxLength={500}
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="absolute bottom-3 right-3 w-10 h-10 bg-indigo-600 text-white rounded-lg flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
              <span>支持匿名留言，最多 500 字</span>
              <span>{newComment.length}/500</span>
            </div>
          </form>
        </div>

        {/* Comments List */}
        <div className={`space-y-4 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {comments.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>还没有留言，来发表第一条吧！</p>
            </div>
          ) : (
            comments.map((comment, index) => {
              const isOwner = comment.visitorId === visitorId;
              
              return (
                <div
                  key={comment.id}
                  className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-700">
                            访客 {comment.visitorId.slice(-6)}
                          </span>
                          {isOwner && (
                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 text-xs rounded-full">
                              我
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            {formatTime(comment.timestamp)}
                          </span>
                        </div>
                        <p className="text-gray-800 whitespace-pre-wrap break-words">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                    
                    {isOwner && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Load More */}
        {comments.length > 0 && comments.length < 50 && (
          <div className="text-center mt-8">
            <button 
              className="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              onClick={() => alert('已显示全部留言')}
            >
              加载更多
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
