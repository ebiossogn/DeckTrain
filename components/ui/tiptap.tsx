'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, List, ListOrdered, Quote, Code, Heading2, Heading3 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TiptapProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
  minHeight?: string
}

interface ToolbarButtonProps {
  active?: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
}

function ToolBtn({ active, onClick, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      title={title}
      className={cn(
        'w-7 h-7 flex items-center justify-center rounded-lg text-sm transition-colors',
        active
          ? 'bg-accent/20 text-accent'
          : 'text-light-text/50 dark:text-dark-text/50 hover:bg-light-text/8 dark:hover:bg-dark-text/8 hover:text-light-text dark:hover:text-dark-text'
      )}
    >
      {children}
    </button>
  )
}

export function TiptapEditor({ content, onChange, placeholder, className, minHeight = '120px' }: TiptapProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: placeholder ?? 'Écrivez ici…' }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'focus:outline-none',
        style: `min-height: ${minHeight}`,
      },
    },
    immediatelyRender: false,
  })

  if (!editor) return null

  return (
    <div className={cn('rounded-xl border border-light-text/10 dark:border-dark-text/10 bg-light-text/5 dark:bg-dark-text/5 overflow-hidden', className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-light-text/8 dark:border-dark-text/8 flex-wrap">
        <ToolBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Gras"><Bold size={13} /></ToolBtn>
        <ToolBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italique"><Italic size={13} /></ToolBtn>
        <div className="w-px h-4 bg-light-text/10 dark:bg-dark-text/10 mx-0.5" />
        <ToolBtn active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Titre 2"><Heading2 size={13} /></ToolBtn>
        <ToolBtn active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Titre 3"><Heading3 size={13} /></ToolBtn>
        <div className="w-px h-4 bg-light-text/10 dark:bg-dark-text/10 mx-0.5" />
        <ToolBtn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Liste"><List size={13} /></ToolBtn>
        <ToolBtn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Liste numérotée"><ListOrdered size={13} /></ToolBtn>
        <div className="w-px h-4 bg-light-text/10 dark:bg-dark-text/10 mx-0.5" />
        <ToolBtn active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Citation"><Quote size={13} /></ToolBtn>
        <ToolBtn active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()} title="Code"><Code size={13} /></ToolBtn>
      </div>
      {/* Content */}
      <EditorContent editor={editor} className="px-4 py-3 tiptap-content text-sm text-light-text dark:text-dark-text" />
    </div>
  )
}
