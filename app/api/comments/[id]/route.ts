import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CommentRepository } from '@/lib/repositories/comment-repository';
import { ApiResponse, withErrorHandling } from '@/lib/api-response';

const commentRepository = new CommentRepository();

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withErrorHandling(async (req: NextRequest) => {
    const session = await getServerSession(authOptions);
    if (!session) {
      return ApiResponse.unauthorized();
    }

    const body = await req.json();
    const { approved } = body;

    const id = parseInt(params.id);
    const success = await commentRepository.update(id, { approved });

    if (!success) {
      return ApiResponse.notFound('评论不存在');
    }

    return ApiResponse.updated(undefined, '评论状态更新成功');
  })(request);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withErrorHandling(async () => {
    const session = await getServerSession(authOptions);
    if (!session) {
      return ApiResponse.unauthorized();
    }

    const id = parseInt(params.id);
    const success = await commentRepository.delete(id);

    if (!success) {
      return ApiResponse.notFound('评论不存在');
    }

    return ApiResponse.deleted('评论删除成功');
  })(request);
}
