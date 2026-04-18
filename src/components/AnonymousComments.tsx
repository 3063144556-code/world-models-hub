import { useState, useEffect } from 'react';
import { MessageSquare, Send, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  visitorId: string;
}

const COMMENTS_KEY = 'wmh_comments';
const VISITOR_KEY = 'wmh_visitor_id';

export function AnonymousComments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [visitorId, setVisitorId] = useState<string>('');

  useEffect(() => {
    // Get or create visitor ID
    let vid = localStorage.getItem(VISITOR_KEY);
    if (!vid) {
      vid = Date.now().toString();
      localStorage.setItem(VISITOR_KEY, vid);
    }
    setVisitorId(vid);

    // Load comments
    const savedComments = localStorage.getItem(COMMENTS_KEY);
    if (savedComments) {
      setComments(JSON.parse(savedComments));
    }
  }, []);

  const saveComments = (newComments: Comment[]) => {
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(newComments));
    setComments(newComments);
  };

  const handleSubmit = () => {
    if (!newComment.trim()) return;

    const filteredContent = newComment
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .trim();

    if (filteredContent.length < 5) {
      alert('评论内容太短了，请多写一点~');
      return;
    }

    if (filteredContent.length > 500) {
      alert('评论内容不能超过500字');
      return;
    }

    const comment: Comment = {
      id: Date.now().toString(),
      content: filteredContent,
      createdAt: new Date().toISOString(),
      visitorId: visitorId,
    };

    const updatedComments = [comment, ...comments];
    saveComments(updatedComments);
    setNewComment('');
  };

  const handleDelete = (commentId: string) => {
    const comment = comments.find(c => c.id === commentId);
    if (comment && comment.visitorId === visitorId) {
      const updatedComments = comments.filter(c => c.id !== commentId);
      saveComments(updatedComments);
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <section id="comments" className="py-20 md:py-32">
      <div className="container px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">留言讨论</h2>
            <p className="text-lg text-muted-foreground">
              欢迎匿名分享你对世界模型的见解和问题
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                发表匿名留言
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="分享你对世界模型的看法..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[120px]"
                  maxLength={500}
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    {newComment.length}/500 字 · 匿名留言 · 无需登录
                  </span>
                  <Button onClick={handleSubmit} disabled={!newComment.trim()} className="gap-2">
                    <Send className="w-4 h-4" />
                    发布留言
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>留言列表 ({comments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {comments.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>还没有留言，来做第一个留言的人吧！</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-medium text-primary">匿名</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{formatTime(comment.createdAt)}</span>
                        </div>
                        {comment.visitorId === visitorId && (
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(comment.id)} className="text-red-500 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-6">
            留言数据仅存储在您的浏览器本地，不会上传到服务器。
            <br />
            清除浏览器数据将导致留言丢失。
          </p>
        </div>
      </div>
    </section>
  );
}
