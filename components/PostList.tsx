'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useEffect, useState } from 'react';

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  category_id: number;
  category_name: string;
  created_at: string;
}

export function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch('/api/posts');
        if (response.ok) {
          const result = await response.json();
          // 处理新的API响应格式
          if (result.success && Array.isArray(result.data)) {
            setPosts(result.data);
          } else {
            setPosts([]);
          }
        }
      } catch (error) {
        console.error('获取文章失败:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">暂无文章</p>
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      {posts.map((post) => (
        <article
          key={post.id}
          className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
            {post.category_name && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                {post.category_name}
              </span>
            )}
            <time dateTime={post.created_at}>
              {format(new Date(post.created_at), 'yyyy年MM月dd日', { locale: zhCN })}
            </time>
          </div>
          <Link href={`/posts/${post.slug}`}>
            <h2 className="text-2xl font-bold text-gray-900 mb-3 hover:text-blue-600">
              {post.title}
            </h2>
          </Link>
          {post.excerpt && (
            <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
          )}
          <Link
            href={`/posts/${post.slug}`}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            阅读全文 →
          </Link>
        </article>
      ))}
    </div>
  );
}
