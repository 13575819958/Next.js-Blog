import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CategoryRepository } from '@/lib/repositories/category-repository';
import { ApiResponse, withErrorHandling } from '@/lib/api-response';

const categoryRepository = new CategoryRepository();

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const categories = await categoryRepository.getAllCategories();
    return ApiResponse.success(categories, '获取分类列表成功');
  })(request);
}

export async function POST(request: NextRequest) {
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

    // 检查名称和别名是否已存在
    const [nameExists, slugExists] = await Promise.all([
      categoryRepository.checkNameExists(name),
      categoryRepository.checkSlugExists(slug)
    ]);

    if (nameExists) {
      return ApiResponse.conflict('分类名称已存在');
    }

    if (slugExists) {
      return ApiResponse.conflict('分类别名已存在');
    }

    const id = await categoryRepository.create({ name, slug, description });
    return ApiResponse.created({ id }, '分类创建成功');
  })(request);
}
