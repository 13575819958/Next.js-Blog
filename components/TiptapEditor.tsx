'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { useState, useCallback, useEffect } from 'react';

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  // 确保组件只在客户端渲染
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleImageUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '上传失败');
      }

      const data = await response.json();
      return data.url;
    } catch (error: any) {
      setUploadError(error.message);
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
      }),
    ],
    content: content || '',
    immediatelyRender: false, // 关键：避免SSR水合错误
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[400px] p-4 border border-gray-300 rounded-md bg-white',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
  });

  // 同步外部内容变化到编辑器
  useEffect(() => {
    if (editor && content !== undefined) {
      const currentContent = editor.getHTML();
      if (currentContent !== content) {
        editor.commands.setContent(content || '', { emitUpdate: false });
      }
    }
  }, [content, editor]);

  const addImage = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement)?.files?.[0];
      if (file) {
        try {
          const url = await handleImageUpload(file);
          editor?.chain().focus().setImage({ src: url }).run();
        } catch (error) {
          console.error('Add image failed:', error);
        }
      }
    };
    input.click();
  };

  // 只在客户端渲染编辑器
  if (!isMounted || !editor) {
    return (
      <div className="border border-gray-300 rounded-md bg-white">
        <div className="flex flex-wrap gap-2 p-2 bg-gray-50 border-b border-gray-300">
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="p-4 min-h-[400px] bg-gray-50 animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* 工具栏 */}
      <div className="flex flex-wrap gap-2 p-2 bg-gray-50 border border-gray-300 rounded-md">
        {/* 标题 */}
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-2 py-1 rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          title="一级标题"
          type="button"
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2 py-1 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          title="二级标题"
          type="button"
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-2 py-1 rounded ${editor.isActive('heading', { level: 3 }) ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          title="三级标题"
          type="button"
        >
          H3
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* 文本样式 */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2 py-1 rounded ${editor.isActive('bold') ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          title="粗体"
          type="button"
        >
          B
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 rounded ${editor.isActive('italic') ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          title="斜体"
          type="button"
        >
          I
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`px-2 py-1 rounded ${editor.isActive('strike') ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          title="删除线"
          type="button"
        >
          S
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`px-2 py-1 rounded ${editor.isActive('code') ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          title="代码"
          type="button"
        >
          Code
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* 列表 */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 rounded ${editor.isActive('bulletList') ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          title="无序列表"
          type="button"
        >
          •
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-2 py-1 rounded ${editor.isActive('orderedList') ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          title="有序列表"
          type="button"
        >
          1.
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* 代码块 */}
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`px-2 py-1 rounded ${editor.isActive('codeBlock') ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          title="代码块"
          type="button"
        >
          代码块
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* 引用 */}
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-2 py-1 rounded ${editor.isActive('blockquote') ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          title="引用"
          type="button"
        >
          引用
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* 图片 */}
        <button
          onClick={addImage}
          className="px-2 py-1 rounded bg-green-600 text-white hover:bg-green-700"
          title="插入图片"
          type="button"
          disabled={isUploading}
        >
          {isUploading ? '上传中...' : '图片'}
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* 撤销/重做 */}
        <button
          onClick={() => editor.chain().focus().undo().run()}
          className="px-2 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
          title="撤销"
          type="button"
        >
          ↶
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          className="px-2 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
          title="重做"
          type="button"
        >
          ↷
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* 清除格式 */}
        <button
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700"
          title="清除格式"
          type="button"
        >
          清除
        </button>
      </div>

      {/* 错误提示 */}
      {uploadError && (
        <div className="bg-red-50 text-red-600 p-2 rounded-md text-sm">
          {uploadError}
        </div>
      )}

      {/* 编辑器内容 */}
      <EditorContent editor={editor} />

      {/* 提示信息 */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>💡 提示：支持拖拽或粘贴图片上传</p>
        <p>📏 图片限制：JPEG, PNG, GIF, WebP 格式，最大 5MB</p>
      </div>
    </div>
  );
}
