import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CommentRepository } from '@/lib/repositories/comment-repository';
import { ApiResponse, withErrorHandling } from '@/lib/api-response';

const commentRepository = new CommentRepository();

export async function GET(request: NextRequest) {
  return withErrorHandling(async (req: NextRequest) => {
    const searchParams = req.nextUrl.searchParams;
    const postId = searchParams.get('postId');
    
    if (postId) {
      const comments = await commentRepository.getApprovedCommentsByPost(parseInt(postId));
      return ApiResponse.success(comments, '获取评论列表成功');
    }

    // 如果没有postId，返回所有评论（管理后台用）
    const allComments = await commentRepository.getAllCommentsWithPostTitle();
    return ApiResponse.success(allComments, '获取评论列表成功');
  })(request);
}

export async function POST(request: NextRequest) {
  return withErrorHandling(async (req: NextRequest) => {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { post_id, author_name, author_email, content } = body;

    if (!post_id || !content) {
      return ApiResponse.validationError({ 
        post_id: '文章ID必填', 
        content: '评论内容必填' 
      });
    }

    let userId = null;
    let finalAuthorName = author_name;
    let finalAuthorEmail = author_email;

    // 如果用户已登录，使用用户信息
    if (session?.user) {
      userId = parseInt(session.user.id);
      finalAuthorName = session.user.name;
      finalAuthorEmail = session.user.email;
    } else {
      // 未登录用户需要提供姓名和邮箱
      if (!author_name || !author_email) {
        return ApiResponse.validationError({ 
          author_name: '姓名必填', 
          author_email: '邮箱必填' 
        });
      }

      // 简单的邮箱验证
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(author_email)) {
        return ApiResponse.validationError({ author_email: '邮箱格式不正确' });
      }
    }

    // 管理员的评论自动审核通过
    const approved = session?.user?.role === 'admin';

    const id = await commentRepository.create({
      post_id,
      user_id: userId || undefined,
      author_name: finalAuthorName,
      author_email: finalAuthorEmail,
      content,
      approved
    });

    const message = approved ? '评论创建成功' : '评论提交成功，等待审核';
    return ApiResponse.created({ id }, message);
  })(request);
}
