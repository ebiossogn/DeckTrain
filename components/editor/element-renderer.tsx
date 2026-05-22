'use client'

import { useRef, useEffect } from 'react'
import {
  Star, Zap, Check, ArrowRight, Heart, Shield, BookOpen,
  Users, Target, TrendingUp, Award, Lightbulb, Lock, Globe,
  Code2, Database, Server, Cloud, Smartphone, Mail, Phone,
  Home, Settings, Search, Bell, Download, Upload, Play,
  ChevronRight, ChevronDown, Plus, X, AlertCircle, Info,
  CheckCircle, Clock, Calendar, FileText, Image, Link,
  Wifi, Cpu, Monitor, BarChart2, PieChart, LineChart,
} from 'lucide-react'
import type { SlideElement, TextProps, ImageProps, ShapeProps, IconProps, CodeProps, LineProps } from '@/types/slides'

const ICON_MAP: Record<string, React.ElementType> = {
  Star, Zap, Check, ArrowRight, Heart, Shield, BookOpen,
  Users, Target, TrendingUp, Award, Lightbulb, Lock, Globe,
  Code2, Database, Server, Cloud, Smartphone, Mail, Phone,
  Home, Settings, Search, Bell, Download, Upload, Play,
  ChevronRight, ChevronDown, Plus, X, AlertCircle, Info,
  CheckCircle, Clock, Calendar, FileText, Image, Link,
  Wifi, Cpu, Monitor, BarChart2, PieChart, LineChart,
}

export const ICON_NAMES = Object.keys(ICON_MAP)

interface Props {
  element: SlideElement
  isEditing?: boolean
  onPropsChange?: (patch: Record<string, unknown>) => void
  onFinishEditing?: () => void
}

export function ElementRenderer({ element, isEditing, onPropsChange, onFinishEditing }: Props) {
  const editRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isEditing && element.type === 'text' && editRef.current) {
      editRef.current.focus()
      const range = document.createRange()
      range.selectNodeContents(editRef.current)
      range.collapse(false)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
    }
  }, [isEditing, element.type])

  if (element.type === 'text') {
    const p = element.props as TextProps
    const style: React.CSSProperties = {
      width: '100%', height: '100%',
      fontSize: p.fontSize,
      fontFamily: p.fontFamily,
      fontWeight: p.fontWeight,
      fontStyle: p.fontStyle,
      color: p.color,
      backgroundColor: p.backgroundColor === 'transparent' ? 'transparent' : p.backgroundColor,
      textAlign: p.textAlign,
      lineHeight: p.lineHeight,
      letterSpacing: p.letterSpacing,
      padding: p.padding,
      borderRadius: p.borderRadius,
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      overflow: 'hidden',
    }

    if (isEditing) {
      return (
        <div
          ref={editRef}
          contentEditable
          suppressContentEditableWarning
          style={{ ...style, outline: 'none', cursor: 'text', userSelect: 'text' }}
          onMouseDown={e => e.stopPropagation()}
          onBlur={e => {
            onPropsChange?.({ content: e.currentTarget.innerText })
            onFinishEditing?.()
          }}
          onKeyDown={e => {
            if (e.key === 'Escape') {
              onPropsChange?.({ content: e.currentTarget.innerText })
              onFinishEditing?.()
            }
            e.stopPropagation()
          }}
          dangerouslySetInnerHTML={{ __html: p.content.replace(/\n/g, '<br>') }}
        />
      )
    }

    return <div style={style}>{p.content}</div>
  }

  if (element.type === 'image') {
    const p = element.props as ImageProps
    const base: React.CSSProperties = {
      width: '100%', height: '100%',
      borderRadius: p.borderRadius,
      border: p.border === 'none' ? undefined : p.border,
      boxShadow: p.shadow === 'none' ? undefined : p.shadow,
      objectFit: p.objectFit,
    }
    return p.src ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={p.src} alt={p.alt}
        style={base}
        draggable={false}
      />
    ) : (
      <div style={{
        ...base,
        background: 'linear-gradient(135deg, #1C1C1C 0%, #111 100%)',
        border: '2px dashed #2E2E2E',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 8, color: '#555', fontSize: 13,
      }}>
        <Image size={28} className="opacity-40" />
        <span>Ajouter une image</span>
      </div>
    )
  }

  if (element.type === 'shape') {
    const p = element.props as ShapeProps
    const base: React.CSSProperties = {
      width: '100%', height: '100%',
      backgroundColor: p.fill,
      border: p.strokeWidth > 0 ? `${p.strokeWidth}px solid ${p.stroke}` : 'none',
      boxShadow: p.shadow === 'none' ? undefined : p.shadow,
    }

    if (p.shapeType === 'circle') {
      return <div style={{ ...base, borderRadius: '50%' }} />
    }
    if (p.shapeType === 'triangle') {
      return (
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: 0, height: 0,
            borderLeft: '50% solid transparent',
            borderRight: '50% solid transparent',
            borderBottom: `100% solid ${p.fill}`,
          }} />
        </div>
      )
    }
    return <div style={{ ...base, borderRadius: p.borderRadius }} />
  }

  if (element.type === 'icon') {
    const p = element.props as IconProps
    const Icon = ICON_MAP[p.iconName] ?? Star
    return (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={p.size} color={p.color} strokeWidth={1.5} />
      </div>
    )
  }

  if (element.type === 'code') {
    const p = element.props as CodeProps
    return (
      <div style={{
        width: '100%', height: '100%',
        background: '#0D1117',
        borderRadius: 10,
        border: '1px solid rgba(0,212,255,0.25)',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Code header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 14px', background: '#161B22',
          borderBottom: '1px solid rgba(0,212,255,0.15)',
        }}>
          <div style={{ display: 'flex', gap: 5 }}>
            {['#FF5F57','#FFBD2E','#28CA41'].map(c => (
              <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
            ))}
          </div>
          <span style={{ color: '#00D4FF', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', marginLeft: 6 }}>
            {p.language}
          </span>
        </div>
        {/* Code body */}
        <div style={{
          flex: 1, padding: '12px 16px', overflow: 'hidden',
          fontFamily: 'JetBrains Mono, Consolas, monospace',
          fontSize: 13, lineHeight: 1.7, color: '#C9D1D9',
          whiteSpace: 'pre-wrap', wordBreak: 'break-all',
        }}>
          {p.showLineNumbers
            ? p.code.split('\n').map((line, i) => (
                <div key={i} style={{ display: 'flex', gap: 16 }}>
                  <span style={{ color: '#484F58', userSelect: 'none', minWidth: 20, textAlign: 'right' }}>{i + 1}</span>
                  <span>{line}</span>
                </div>
              ))
            : p.code
          }
        </div>
      </div>
    )
  }

  if (element.type === 'line') {
    const p = element.props as LineProps
    if (p.orientation === 'vertical') {
      return (
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', justifyContent: 'center',
        }}>
          <div style={{
            width: p.thickness, height: '100%',
            background: p.color,
            borderStyle: p.style,
          }} />
        </div>
      )
    }
    return (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center',
      }}>
        <div style={{
          width: '100%', height: p.thickness,
          background: p.color,
        }} />
      </div>
    )
  }

  return null
}
