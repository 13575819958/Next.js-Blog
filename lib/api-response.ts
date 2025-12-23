import { NextResponse } from 'next/server';

export class ApiResponse {
  /**
   * 成功响应
   * @param data - 返回的数据
   * @param message - 成功消息
   * @param status - HTTP状态码，默认200
   */
  static success<T>(data?: T, message = '操作成功', status = 200) {
    return NextResponse.json(
      { 
        success: true, 
        data, 
        message 
      }, 
      { status }
    );
  }

  /**
   * 错误响应
   * @param message - 错误消息
   * @param status - HTTP状态码，默认500
   * @param errors - 详细的错误信息
   */
  static error(message: string, status = 500, errors?: any) {
    return NextResponse.json(
      { 
        success: false, 
        error: message,
        errors 
      }, 
      { status }
    );
  }

  /**
   * 资源不存在
   * @param message - 错误消息
   */
  static notFound(message = '资源不存在') {
    return this.error(message, 404);
  }

  /**
   * 未授权
   * @param message - 错误消息
   */
  static unauthorized(message = '未授权') {
    return this.error(message, 401);
  }

  /**
   * 禁止访问
   * @param message - 错误消息
   */
  static forbidden(message = '禁止访问') {
    return this.error(message, 403);
  }

  /**
   * 参数验证错误
   * @param errors - 详细的验证错误
   * @param message - 错误消息
   */
  static validationError(errors: any, message = '参数验证失败') {
    return this.error(message, 400, errors);
  }

  /**
   * 资源已存在
   * @param message - 错误消息
   */
  static conflict(message = '资源已存在') {
    return this.error(message, 409);
  }

  /**
   * 创建成功
   * @param data - 创建的数据
   * @param message - 成功消息
   */
  static created<T>(data: T, message = '创建成功') {
    return this.success(data, message, 201);
  }

  /**
   * 更新成功
   * @param data - 更新的数据
   * @param message - 成功消息
   */
  static updated<T>(data?: T, message = '更新成功') {
    return this.success(data, message, 200);
  }

  /**
   * 删除成功
   * @param message - 成功消息
   */
  static deleted(message = '删除成功') {
    return this.success(undefined, message, 200);
  }
}

/**
 * 包装异步API处理函数，自动处理错误
 * @param handler - API处理函数
 */
export function withErrorHandling(
  handler: (req: any, ...args: any[]) => Promise<NextResponse>
) {
  return async (req: any, ...args: any[]) => {
    try {
      return await handler(req, ...args);
    } catch (error: any) {
      console.error('API Error:', error);
      
      // 数据库相关错误
      if (error.code === 'ER_DUP_ENTRY') {
        return ApiResponse.conflict('数据已存在');
      }
      
      if (error.code === 'ER_NO_REFERENCED_ROW') {
        return ApiResponse.validationError('关联的数据不存在');
      }

      // 认证相关错误
      if (error.message?.includes('密码')) {
        return ApiResponse.error('邮箱或密码错误', 401);
      }

      // 通用错误
      return ApiResponse.error(
        error.message || '服务器内部错误',
        error.status || 500
      );
    }
  };
}
