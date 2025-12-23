'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Post, Category } from '@/types';
import dynamic from 'next/dynamic';

// 动态导入 TiptapEditor，确保客户端渲染
const TiptapEditor = dynamic(() => import('./TiptapEditor'), {
  loading: () => (
    <div className="border border-gray-300 rounded-md p-4 bg-gray-50 animate-pulse">
      <div className="h-64 bg-gray-200 rounded"></div>
    </div>
  ),
});

interface PostEditorProps {
  post?: Post;
  categories: Category[];
}

export default function PostEditor({ post, categories }: PostEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title || '');
  const [slug, setSlug] = useState(post?.slug || '');
  const [content, setContent] = useState(post?.content || '');
  const [excerpt, setExcerpt] = useState(post?.excerpt || '');
  const [categoryId, setCategoryId] = useState(post?.category_id || '');
  const [published, setPublished] = useState(post?.published || false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 当内容变化时，自动生成摘要（如果为空）
  useEffect(() => {
    if (!excerpt && content) {
      // 从 HTML 内容中提取纯文本
      const text = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
      if (text.length > 0) {
        const autoExcerpt = text.substring(0, 150) + (text.length > 150 ? '...' : '');
        setExcerpt(autoExcerpt);
      }
    }
  }, [content, excerpt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const url = post ? `/api/posts/${post.id}` : '/api/posts';
      const method = post ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          content,
          excerpt,
          category_id: categoryId || null,
          published,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error((result as any).error || '保存失败');
      }

      if (!result.success) {
        throw new Error((result as any).error || '保存失败');
      }

      router.push('/admin/posts');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = () => {
    // 生成时间戳 + 随机数作为 slug，确保唯一性和 URL 安全
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const slug = `post-${timestamp}-${random}`;
    setSlug(slug);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
      {error && (
        <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            标题 *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="文章标题"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL 别名 *
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="url-slug"
            />
            <button
              type="button"
              onClick={generateSlug}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              自动生成
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            摘要
          </label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="文章摘要（选填，留空将自动生成）"
          />
          <p className="text-xs text-gray-500 mt-1">
            提示：留空并输入内容后，系统会自动生成摘要
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            分类
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">无分类</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            内容 * (富文本编辑器)
          </label>
          
          <TiptapEditor 
            content={content}
            onChange={setContent}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="published"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="published" className="text-sm font-medium text-gray-700">
            发布文章
          </label>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '保存中...' : '保存'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            取消
          </button>
        </div>
      </div>
    </form>
  );
}
