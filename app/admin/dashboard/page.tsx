import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import AdminLayout from '@/components/AdminLayout';
import { PostRepository } from '@/lib/repositories/post-repository';
import { CommentRepository } from '@/lib/repositories/comment-repository';
import Link from 'next/link';

const postRepository = new PostRepository();
const commentRepository = new CommentRepository();

async function getStats() {
  try {
    // 获取所有文章（包括未发布的）
    const allPosts = await postRepository.findAll();
    const publishedPosts = allPosts.filter(p => p.published);
    
    // 获取待审核评论数量
    const pendingComments = await commentRepository.getPendingCount();
    
    // 获取所有评论数量
    const allComments = await commentRepository.getAllCommentsWithPostTitle();

    return {
      totalPosts: allPosts.length,
      publishedPosts: publishedPosts.length,
      totalComments: allComments.length,
      pendingComments: pendingComments,
    };
  } catch (error) {
    console.error('获取统计数据失败:', error);
    return {
      totalPosts: 0,
      publishedPosts: 0,
      totalComments: 0,
      pendingComments: 0,
    };
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/admin/login');
  }

  const stats = await getStats();

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">仪表板</h1>
        <p className="text-gray-600 mt-2">欢迎回来，{session.user.name}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">总文章数</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalPosts}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">已发布</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.publishedPosts}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">总评论数</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalComments}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">待审核评论</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingComments}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">快速操作</h2>
          <div className="space-y-3">
            <Link
              href="/admin/posts/new"
              className="block w-full text-left px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
            >
              ✍️ 写新文章
            </Link>
            <Link
              href="/admin/posts"
              className="block w-full text-left px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              📝 管理文章
            </Link>
            <Link
              href="/admin/comments"
              className="block w-full text-left px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              💬 管理评论
            </Link>
            <Link
              href="/admin/categories"
              className="block w-full text-left px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              🏷️ 管理分类
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">系统信息</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">当前用户</span>
              <span className="font-medium">{session.user.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">系统版本</span>
              <span className="font-medium">v1.0.0</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Next.js 版本</span>
              <span className="font-medium">14.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
