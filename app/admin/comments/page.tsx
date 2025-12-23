import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import AdminLayout from '@/components/AdminLayout';
import CommentsManager from '@/components/CommentsManager';
import { CommentRepository } from '@/lib/repositories/comment-repository';

const commentRepository = new CommentRepository();

async function getComments() {
  try {
    return await commentRepository.getAllCommentsWithPostTitle();
  } catch (error) {
    console.error('获取评论失败:', error);
    return [];
  }
}

export default async function CommentsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/admin/login');
  }

  const comments = await getComments();

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">评论管理</h1>
      </div>

      <div className="bg-white rounded-lg shadow">
        <CommentsManager initialComments={comments} />
      </div>
    </AdminLayout>
  );
}
