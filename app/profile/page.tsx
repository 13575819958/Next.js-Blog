'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface UserProfile {
  id: number;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  role: 'user' | 'admin';
  created_at: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    avatar: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      const result = await response.json();
      
      if (response.ok && result.success) {
        setProfile(result.data);
        setFormData({
          name: result.data.name,
          bio: result.data.bio || '',
          avatar: result.data.avatar || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // 如果要修改密码，验证新密码
    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        setMessage({ type: 'error', text: '两次输入的密码不一致' });
        return;
      }
      if (!formData.currentPassword) {
        setMessage({ type: 'error', text: '请输入当前密码' });
        return;
      }
    }

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          bio: formData.bio,
          avatar: formData.avatar,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: '更新成功！' });
        setEditing(false);
        fetchProfile();
        // 清空密码字段
        setFormData({
          ...formData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        setMessage({ type: 'error', text: data.error || '更新失败' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '更新失败，请稍后重试' });
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">加载中...</div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">个人中心</h1>
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900"
            >
              返回首页
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          {/* 用户信息头部 */}
          <div className="px-6 py-8 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
                  <p className="text-gray-600">{profile.email}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      profile.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {profile.role === 'admin' ? '管理员' : '普通用户'}
                    </span>
                    <span className="text-sm text-gray-500">
                      注册于 {new Date(profile.created_at).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                </div>
              </div>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  编辑资料
                </button>
              )}
            </div>
            {profile.bio && !editing && (
              <p className="mt-4 text-gray-700">{profile.bio}</p>
            )}
          </div>

          {/* 管理员快捷入口 */}
          {profile.role === 'admin' && (
            <div className="px-6 py-4 bg-purple-50 border-b border-gray-200">
              <h3 className="text-sm font-medium text-purple-900 mb-3">管理员功能</h3>
              <div className="flex gap-3">
                <Link
                  href="/admin/dashboard"
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
                >
                  进入后台管理
                </Link>
                <Link
                  href="/admin/posts"
                  className="px-4 py-2 bg-white text-purple-600 border border-purple-600 rounded-md hover:bg-purple-50 text-sm"
                >
                  文章管理
                </Link>
                <Link
                  href="/admin/comments"
                  className="px-4 py-2 bg-white text-purple-600 border border-purple-600 rounded-md hover:bg-purple-50 text-sm"
                >
                  评论管理
                </Link>
              </div>
            </div>
          )}

          {/* 编辑表单 */}
          {editing && (
            <div className="px-6 py-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {message.text && (
                  <div className={`p-3 rounded-md text-sm ${
                    message.type === 'error' 
                      ? 'bg-red-50 text-red-600' 
                      : 'bg-green-50 text-green-600'
                  }`}>
                    {message.text}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    用户名
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    个人简介
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="介绍一下自己..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    头像URL
                  </label>
                  <input
                    type="url"
                    value={formData.avatar}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">修改密码</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        当前密码
                      </label>
                      <input
                        type="password"
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        新密码
                      </label>
                      <input
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        minLength={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        确认新密码
                      </label>
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        minLength={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    保存修改
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setMessage({ type: '', text: '' });
                      setFormData({
                        name: profile.name,
                        bio: profile.bio || '',
                        avatar: profile.avatar || '',
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: '',
                      });
                    }}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    取消
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
