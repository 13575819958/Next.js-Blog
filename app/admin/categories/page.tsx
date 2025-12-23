import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import AdminLayout from '@/components/AdminLayout';
import CategoriesManager from '@/components/CategoriesManager';
import { CategoryRepository } from '@/lib/repositories/category-repository';

const categoryRepository = new CategoryRepository();

async function getCategories() {
  try {
    return await categoryRepository.getAllCategories();
  } catch (error) {
    console.error('获取分类失败:', error);
    return [];
  }
}

export default async function CategoriesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/admin/login');
  }

  const categories = await getCategories();

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">分类管理</h1>
      </div>

      <CategoriesManager initialCategories={categories} />
    </AdminLayout>
  );
}
