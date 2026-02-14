import { useNavigate } from '@tanstack/react-router'
import { MessageCircle, Minimize2, Send, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ChatResponse } from '../server/chat'
import { sendChatMessage } from '../server/chat'
import { Button } from './ui/button'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatWidgetProps {
  clinicSlug?: string
}

function generateSessionId(): string {
  return `chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

export function ChatWidget({ clinicSlug }: ChatWidgetProps) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(generateSessionId)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return

    const userMessage: Message = { role: 'user', content: trimmed }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response: ChatResponse = await sendChatMessage({
        data: {
          sessionId,
          message: trimmed,
          clinicSlug,
          lang: i18n.language,
        },
      })

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.message,
      }
      setMessages((prev) => [...prev, assistantMessage])

      if (response.navigationAction?.type === 'navigate_to_booking') {
        setTimeout(() => {
          navigate({
            to: '/book/$clinicSlug',
            params: { clinicSlug: response.navigationAction?.clinicSlug ?? '' },
          })
        }, 1500)
      }
    } catch {
      const errorMessage: Message = {
        role: 'assistant',
        content: t('chat.errorMessage'),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed right-4 bottom-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110 md:right-6 md:bottom-6"
        aria-label={t('chat.openChat')}
        data-testid="chat-toggle"
      >
        <MessageCircle className="size-6" />
      </button>
    )
  }

  return (
    <div
      className="fixed right-0 bottom-0 z-50 flex h-full w-full flex-col border-l bg-background shadow-2xl sm:right-4 sm:bottom-4 sm:h-[500px] sm:w-[380px] sm:rounded-xl sm:border"
      data-testid="chat-panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-primary px-4 py-3 text-primary-foreground sm:rounded-t-xl">
        <div className="flex items-center gap-2">
          <MessageCircle className="size-5" />
          <span className="font-semibold">{t('chat.title')}</span>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded p-1 transition-colors hover:bg-white/20"
            aria-label={t('chat.minimize')}
            data-testid="chat-minimize"
          >
            <Minimize2 className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false)
              setMessages([])
            }}
            className="rounded p-1 transition-colors hover:bg-white/20"
            aria-label={t('chat.close')}
            data-testid="chat-close"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4" data-testid="chat-messages">
        {messages.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            {t('chat.welcomeMessage')}
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={`${msg.role}-${i}`}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start" data-testid="chat-typing">
            <div className="flex gap-1 rounded-lg bg-muted px-3 py-2">
              <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
              <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
              <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-3">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('chat.inputPlaceholder')}
            className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            disabled={isLoading}
            data-testid="chat-input"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            data-testid="chat-send"
            aria-label={t('chat.send')}
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
