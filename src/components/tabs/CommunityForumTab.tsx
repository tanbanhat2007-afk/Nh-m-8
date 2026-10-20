import React, { useState } from 'react';
import {
  MessageSquare,
  Sparkles,
  ThumbsUp,
  Send,
  PlusCircle,
  Tag,
  User,
  Bot,
  Filter,
  CheckCircle,
} from 'lucide-react';
import { ForumPost } from '../../types';
import { initialForumPosts } from '../../data/initialData';
import MathView from '../MathView';

export const CommunityForumTab: React.FC = () => {
  const [posts, setPosts] = useState<ForumPost[]>(initialForumPosts);
  const [activeTab, setActiveTab] = useState<'all' | 'needs-answer'>('all');
  const [isCreatingPost, setIsCreatingPost] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newContent, setNewContent] = useState<string>('');
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [isAiAssisting, setIsAiAssisting] = useState<boolean>(false);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setIsAiAssisting(true);

    try {
      const res = await fetch('/api/ai/forum-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, content: newContent }),
      });
      const data = await res.json();

      const newPost: ForumPost = {
        id: `post-${Date.now()}`,
        author: 'Bạn (Sinh viên XSTK)',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        title: newTitle,
        content: newContent,
        tags: data.suggestedTags || ['Xác suất Thống kê', 'Hỏi đáp bài tập'],
        aiStarterGuidance:
          data.starterGuidance ||
          'Trợ giảng AI: Bài toán này bạn có thể khởi đầu bằng cách vẽ sơ đồ Venn hoặc Cây biến cố để phân lớp các trường hợp.',
        likes: 0,
        repliesCount: 0,
        createdAt: 'Vừa xong',
        replies: [],
      };

      setPosts([newPost, ...posts]);
      setNewTitle('');
      setNewContent('');
      setIsCreatingPost(false);
    } catch {
      const newPost: ForumPost = {
        id: `post-${Date.now()}`,
        author: 'Bạn (Sinh viên XSTK)',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        title: newTitle,
        content: newContent,
        tags: ['Xác suất Thống kê', 'Luyện thi'],
        aiStarterGuidance:
          'Trợ giảng AI: Chào bạn, hãy chú ý điều kiện độc lập của các biến ngẫu nhiên trong bài toán này nhé!',
        likes: 0,
        repliesCount: 0,
        createdAt: 'Vừa xong',
        replies: [],
      };
      setPosts([newPost, ...posts]);
      setNewTitle('');
      setNewContent('');
      setIsCreatingPost(false);
    } finally {
      setIsAiAssisting(false);
    }
  };

  const handleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes: p.likes + 1 } : p))
    );
  };

  const handleAddReply = (postId: string) => {
    const text = replyInputs[postId];
    if (!text || !text.trim()) return;

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            repliesCount: p.repliesCount + 1,
            replies: [
              ...p.replies,
              {
                id: `rep-${Date.now()}`,
                author: 'Bạn (Sinh viên XSTK)',
                avatar:
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
                content: text,
                createdAt: 'Vừa xong',
              },
            ],
          };
        }
        return p;
      })
    );

    setReplyInputs((prev) => ({ ...prev, [postId]: '' }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-600 tracking-wide uppercase">
            Tính Năng 9: Diễn Đàn Học Tập Cộng Đồng
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Diễn Đàn Trao Đổi XSTK & Trợ Giảng AI Đồng Hành
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Không gian thảo luận học thuật giữa các sinh viên. AI đóng vai trò Trợ giảng: Tự động phân loại tag bài toán và đưa ra gợi ý thảo luận định hướng.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreatingPost(!isCreatingPost)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-colors shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isCreatingPost ? 'Đóng khung soạn thảo' : 'Đăng Câu Hỏi Mới'}</span>
        </button>
      </div>

      {/* New Post Modal/Form */}
      {isCreatingPost && (
        <form
          onSubmit={handleCreatePost}
          className="bg-white border border-blue-200 rounded-xl p-5 shadow-md space-y-4 animate-fadeIn"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Tạo Thảo Luận Mới Về Xác Suất Thống Kê</h3>
            <span className="text-xs text-blue-600 flex items-center gap-1 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI sẽ tự động gắn Tag & Gợi ý hướng đi ban đầu</span>
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tiêu đề bài viết:</label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Ví dụ: Giúp em bài toán tính xác suất biến cố đối và Bayes với 3 hộp..."
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nội dung câu hỏi (hỗ trợ công thức toán $...$):
            </label>
            <textarea
              rows={4}
              required
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Mô tả chi tiết bài toán, bước làm của bạn và điểm bạn đang băn khoăn..."
              className="w-full p-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCreatingPost(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isAiAssisting}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isAiAssisting ? 'AI đang gắn tag & tạo gợi ý...' : 'Đăng Bài Lên Diễn Đàn'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            {/* Author & Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={post.avatar}
                  alt={post.author}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{post.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{post.author}</span>
                    <span aria-hidden="true">·</span>
                    <span>{post.createdAt}</span>
                  </div>
                </div>
              </div>

              {/* Likes counter */}
              <button
                type="button"
                onClick={() => handleLike(post.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-blue-50 hover:text-blue-600 text-xs text-slate-600 font-medium transition-colors"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span className="font-mono">{post.likes}</span>
              </button>
            </div>

            {/* Post Content */}
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              <MathView content={post.content} />
            </div>

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-1.5">
              {post.tags.map((t, i) => (
                <span
                  key={i}
                  className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium"
                >
                  #{t}
                </span>
              ))}
            </div>

            {/* AI Teaching Assistant Guidance Box */}
            {post.aiStarterGuidance && (
              <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-blue-950 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-blue-800">
                  <Bot className="w-4 h-4 text-cyan-600" />
                  <span>Trợ Giảng AI Gợi Ý Định Hướng Thảo Luận:</span>
                </div>
                <div className="text-blue-900/90 leading-relaxed">
                  <MathView content={post.aiStarterGuidance} />
                </div>
              </div>
            )}

            {/* Replies List */}
            {post.replies.length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Thảo luận ({post.replies.length}):
                </span>
                {post.replies.map((rep) => (
                  <div
                    key={rep.id}
                    className={`p-3 rounded-xl text-xs space-y-1 ${
                      rep.isAi ? 'bg-cyan-50/60 border border-cyan-200' : 'bg-slate-50 border border-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between text-slate-600 font-semibold text-[11px]">
                      <div className="flex items-center gap-1.5">
                        {rep.isAi ? <Bot className="w-3.5 h-3.5 text-cyan-600" /> : <User className="w-3.5 h-3.5 text-slate-500" />}
                        <span>{rep.author}</span>
                      </div>
                      <span className="text-slate-400 font-normal">{rep.createdAt}</span>
                    </div>
                    <div className="text-slate-800 leading-relaxed">
                      <MathView content={rep.content} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reply Input Box */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={replyInputs[post.id] || ''}
                onChange={(e) =>
                  setReplyInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                }
                onKeyDown={(e) => e.key === 'Enter' && handleAddReply(post.id)}
                placeholder="Chia sẻ cách giải hoặc ý kiến của bạn..."
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => handleAddReply(post.id)}
                disabled={!replyInputs[post.id]?.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
              >
                Gửi
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommunityForumTab;
