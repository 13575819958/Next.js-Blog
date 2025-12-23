'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Category } from '@/types';

interface CategoriesManagerProps {
  initialCategories: Category[];
}

export default function CategoriesManager({ initialCategories }: CategoriesManagerProps) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '', description: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingId ? `/api/categories/${editingId}` : '/api/categories';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error((result as any).error || '操作失败');
      }

      if (!result.success) {
        throw new Error((result as any).error || '操作失败');
      }

      setFormData({ name: '', slug: '', description: '' });
      setIsAdding(false);
      setEditingId(null);
      router.refresh();
      
      // 重新获取分类列表
      const categoriesResponse = await fetch('/api/categories');
      const categoriesResult = await categoriesResponse.json();
      if (categoriesResult.success) {
        setCategories(categoriesResult.data);
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个分类吗？')) return;

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('删除失败');
      }

      setCategories(categories.filter((cat) => cat.id !== id));
      router.refresh();
    } catch (error) {
      alert('删除失败，请重试');
    }
  };

  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-|-$/g, '');
    setFormData({ ...formData, slug });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">分类列表</h2>
          <button
            onClick={() => {
              setIsAdding(true);
              setEditingId(null);
              setFormData({ name: '', slug: '', description: '' });
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            + 新建分类
          </button>
        </div>

        {isAdding && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  名称 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  别名 *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    required
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <button
                    type="button"
                    onClick={generateSlug}
                    className="px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    生成
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  描述
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? '保存中...' : editingId ? '更新' : '创建'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setEditingId(null);
                    setFormData({ name: '', slug: '', description: '' });
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  取消
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div>
                <h3 className="font-medium text-gray-900">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.slug}</p>
                {category.description && (
                  <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  编辑
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
