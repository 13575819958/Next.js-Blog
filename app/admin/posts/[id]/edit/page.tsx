import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import AdminLayout from '@/components/AdminLayout';
import PostEditor from '@/components/PostEditor';
import { PostRepository } from '@/lib/repositories/post-repository';
import { CategoryRepository } from '@/lib/repositories/category-repository';

const postRepository = new PostRepository();
const categoryRepository = new CategoryRepository();

async function getPost(id: string) {
  try {
    return await postRepository.getPostById(parseInt(id));
  } catch (error) {
    console.error('获取文章失败:', error);
    return null;
  }
}

async function getCategories() {
  try {
    return await categoryRepository.getAllCategories();
  } catch (error) {
    console.error('获取分类失败:', error);
    return [];
  }
}

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/admin/login');
  }

  const [post, categories] = await Promise.all([
    getPost(params.id),
    getCategories(),
  ]);

  if (!post) {
    notFound();
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">编辑文章</h1>
      </div>

      <PostEditor post={post} categories={categories} />
    </AdminLayout>
  );
}
