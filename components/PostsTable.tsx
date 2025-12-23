'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Post } from '@/types';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface PostsTableProps {
  posts: Post[];
}

export default function PostsTable({ posts: initialPosts }: PostsTableProps) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const [deleting, setDeleting] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这篇文章吗？')) return;

    setDeleting(id);
    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error((result as any).error || '删除失败');
      }

      if (result.success) {
        setPosts(posts.filter((post) => post.id !== id));
        router.refresh();
      } else {
        throw new Error((result as any).error || '删除失败');
      }
    } catch (error) {
      alert((error as Error).message || '删除失败，请重试');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              标题
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              分类
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              状态
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              创建时间
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              操作
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {posts.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                暂无文章
              </td>
            </tr>
          ) : (
            posts.map((post) => (
              <tr key={post.id}>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{post.title}</div>
                  <div className="text-sm text-gray-500">{post.slug}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {post.category_name || '-'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {post.published ? (
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      已发布
                    </span>
                  ) : (
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      草稿
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(post.created_at), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      编辑
                    </Link>
                    <button
                      onClick={() => handleDelete(post.id)}
                      disabled={deleting === post.id}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    >
                      {deleting === post.id ? '删除中...' : '删除'}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
