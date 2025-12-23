'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Comment } from '@/types';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface CommentsManagerProps {
  initialComments: (Comment & { post_title: string })[];
}

export default function CommentsManager({ initialComments }: CommentsManagerProps) {
  const router = useRouter();
  const [comments, setComments] = useState(initialComments);
  const [processing, setProcessing] = useState<number | null>(null);

  const handleApprove = async (id: number, approved: boolean) => {
    setProcessing(id);
    try {
      const response = await fetch(`/api/comments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error((result as any).error || '操作失败');
      }

      if (result.success) {
        setComments(comments.map((comment) =>
          comment.id === id ? { ...comment, approved } : comment
        ));
        router.refresh();
      } else {
        throw new Error((result as any).error || '操作失败');
      }
    } catch (error) {
      alert((error as Error).message || '操作失败，请重试');
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这条评论吗？')) return;

    setProcessing(id);
    try {
      const response = await fetch(`/api/comments/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error((result as any).error || '删除失败');
      }

      if (result.success) {
        setComments(comments.filter((comment) => comment.id !== id));
        router.refresh();
      } else {
        throw new Error((result as any).error || '删除失败');
      }
    } catch (error) {
      alert((error as Error).message || '删除失败，请重试');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="divide-y divide-gray-200">
      {comments.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          暂无评论
        </div>
      ) : (
        comments.map((comment) => (
          <div key={comment.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-medium text-gray-900">{comment.author_name}</span>
                  <span className="text-sm text-gray-500">{comment.author_email}</span>
                  {comment.approved ? (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      已审核
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                      待审核
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  文章：{comment.post_title}
                </p>
                <p className="text-gray-900 mb-2">{comment.content}</p>
                <p className="text-xs text-gray-500">
                  {format(new Date(comment.created_at), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })}
                </p>
              </div>
              <div className="flex gap-2 ml-4">
                {!comment.approved ? (
                  <button
                    onClick={() => handleApprove(comment.id, true)}
                    disabled={processing === comment.id}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    通过
                  </button>
                ) : (
                  <button
                    onClick={() => handleApprove(comment.id, false)}
                    disabled={processing === comment.id}
                    className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
                  >
                    取消审核
                  </button>
                )}
                <button
                  onClick={() => handleDelete(comment.id)}
                  disabled={processing === comment.id}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
