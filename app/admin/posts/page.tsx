import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import AdminLayout from '@/components/AdminLayout';
import PostsTable from '@/components/PostsTable';
import { PostRepository } from '@/lib/repositories/post-repository';
import Link from 'next/link';

const postRepository = new PostRepository();

async function getPosts() {
  try {
    return await postRepository.getAllPosts();
  } catch (error) {
    console.error('获取文章列表失败:', error);
    return [];
  }
}

export default async function PostsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/admin/login');
  }

  const posts = await getPosts();

  return (
    <AdminLayout>
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">文章管理</h1>
        <Link
          href="/admin/posts/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          + 新建文章
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        <PostsTable posts={posts} />
      </div>
    </AdminLayout>
  );
}
