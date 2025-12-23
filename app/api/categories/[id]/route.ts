import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CategoryRepository } from '@/lib/repositories/category-repository';
import { ApiResponse, withErrorHandling } from '@/lib/api-response';

const categoryRepository = new CategoryRepository();

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withErrorHandling(async (req: NextRequest) => {
    const session = await getServerSession(authOptions);
    if (!session) {
      return ApiResponse.unauthorized();
    }

    const body = await req.json();
    const { name, slug, description } = body;

    if (!name || !slug) {
      return ApiResponse.validationError({ name: '名称必填', slug: '别名必填' });
    }

    const id = parseInt(params.id);

    // 检查名称和别名是否已存在（排除当前分类）
    const [nameExists, slugExists] = await Promise.all([
      categoryRepository.checkNameExists(name, id),
      categoryRepository.checkSlugExists(slug, id)
    ]);

    if (nameExists) {
      return ApiResponse.conflict('分类名称已存在');
    }

    if (slugExists) {
      return ApiResponse.conflict('分类别名已存在');
    }

    const success = await categoryRepository.update(id, { name, slug, description });
    if (!success) {
      return ApiResponse.notFound('分类不存在');
    }

    return ApiResponse.updated(undefined, '分类更新成功');
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
    const success = await categoryRepository.delete(id);
    
    if (!success) {
      return ApiResponse.notFound('分类不存在');
    }

    return ApiResponse.deleted('分类删除成功');
  })(request);
}
