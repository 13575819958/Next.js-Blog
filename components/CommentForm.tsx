'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface CommentFormProps {
  postId: number;
}

export default function CommentForm({ postId }: CommentFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: postId,
          author_name: session?.user ? session.user.name : name,
          author_email: session?.user ? session.user.email : email,
          content,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error((result as any).error || '提交失败');
      }

      if (!result.success) {
        throw new Error((result as any).error || '提交失败');
      }

      setSuccess(true);
      setName('');
      setEmail('');
      setContent('');
      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 如果未登录，显示登录提示
  if (!session?.user) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <p className="text-gray-700 mb-4">请登录后发表评论</p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/login"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            登录
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
          >
            注册
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">
          评论提交成功！等待审核后将会显示。
        </div>
      )}

      {/* 显示当前登录用户 */}
      <div className="bg-gray-50 p-3 rounded-md flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
          {session.user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-medium text-gray-900">{session.user.name}</p>
          <p className="text-sm text-gray-500">{session.user.email}</p>
        </div>
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
          评论内容 *
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="说说你的想法..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? '提交中...' : '提交评论'}
      </button>
    </form>
  );
}
