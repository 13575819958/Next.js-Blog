import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PostRepository } from '@/lib/repositories/post-repository';
import { CommentRepository } from '@/lib/repositories/comment-repository';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
// Tiptap 生成的是 HTML，不需要 Markdown 渲染器
import CommentForm from '@/components/CommentForm';
import CommentList from '@/components/CommentList';
import Navbar from '@/components/Navbar';

const postRepository = new PostRepository();
const commentRepository = new CommentRepository();

async function getPost(slug: string) {
  try {
    console.log('正在查询文章, slug:', slug);
    const post = await postRepository.getPostBySlug(slug);
    console.log('查询结果:', post ? '找到' : '未找到');
    return post;
  } catch (error) {
    console.error('获取文章失败:', error);
    return null;
  }
}

async function getComments(postId: number) {
  try {
    return await commentRepository.getApprovedCommentsByPost(postId);
  } catch (error) {
    console.error('获取评论失败:', error);
    return [];
  }
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  const comments = await getComments(post.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Article */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <header className="mb-8">
            <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
              {post.category_name && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                  {post.category_name}
                </span>
              )}
              <time dateTime={post.created_at}>
                {format(new Date(post.created_at), 'yyyy年MM月dd日', { locale: zhCN })}
              </time>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
          </header>

          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        {/* Comments Section */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            评论 ({comments.length})
          </h2>
          
          <CommentForm postId={post.id} />
          
          <div className="mt-8">
            <CommentList comments={comments} />
          </div>
        </div>
      </main>
    </div>
  );
}
