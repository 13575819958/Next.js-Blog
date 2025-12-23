import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PostRepository } from '@/lib/repositories/post-repository';
import { ApiResponse, withErrorHandling } from '@/lib/api-response';

const postRepository = new PostRepository();

// GET /api/posts/[id] - 获取文章详情
export const GET = withErrorHandling(async (request: NextRequest, { params }: { params: { id: string } }) => {
  const id = parseInt(params.id);
  
  if (isNaN(id)) {
    return ApiResponse.validationError({ id: 'ID必须是数字' });
  }

  const post = await postRepository.getPostById(id);
  
  if (!post) {
    return ApiResponse.notFound('文章不存在');
  }

  return ApiResponse.success(post, '获取文章成功');
});

// PUT /api/posts/[id] - 更新文章
export const PUT = withErrorHandling(async (request: NextRequest, { params }: { params: { id: string } }) => {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return ApiResponse.unauthorized();
  }

  const id = parseInt(params.id);
  
  if (isNaN(id)) {
    return ApiResponse.validationError({ id: 'ID必须是数字' });
  }

  const body = await request.json();
  const { title, slug, content, excerpt, category_id, published } = body;

  // 参数验证
  if (!title || !slug || !content) {
    return ApiResponse.validationError({
      title: !title ? '标题不能为空' : undefined,
      slug: !slug ? 'URL别名不能为空' : undefined,
      content: !content ? '内容不能为空' : undefined
    });
  }

  // 检查文章是否存在
  const existingPost = await postRepository.findById(id);
  if (!existingPost) {
    return ApiResponse.notFound('文章不存在');
  }

  // 检查slug是否已存在（排除当前文章）
  const slugExists = await postRepository.checkSlugExists(slug, id);
  if (slugExists) {
    return ApiResponse.conflict('URL别名已存在，请使用其他别名');
  }

  const success = await postRepository.update(id, {
    title,
    slug,
    content,
    excerpt,
    category_id,
    published
  });

  if (!success) {
    return ApiResponse.error('更新文章失败');
  }

  return ApiResponse.updated({ id }, '文章更新成功');
});

// DELETE /api/posts/[id] - 删除文章
export const DELETE = withErrorHandling(async (request: NextRequest, { params }: { params: { id: string } }) => {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return ApiResponse.unauthorized();
  }

  const id = parseInt(params.id);
  
  if (isNaN(id)) {
    return ApiResponse.validationError({ id: 'ID必须是数字' });
  }

  // 检查文章是否存在
  const existingPost = await postRepository.findById(id);
  if (!existingPost) {
    return ApiResponse.notFound('文章不存在');
  }

  const success = await postRepository.delete(id);

  if (!success) {
    return ApiResponse.error('删除文章失败');
  }

  return ApiResponse.deleted('文章删除成功');
});
