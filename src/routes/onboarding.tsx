import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import type { AdminSession } from '@/server/auth'
import { getSessionFn } from '@/server/auth'
import {
  completeOnboardingFn,
  getOnboardingStatusFn,
  sendOnboardingMessageFn,
} from '@/server/onboarding'

export const Route = createFileRoute('/onboarding')({
  component: OnboardingPage,
  beforeLoad: async () => {
    // Protect route - only authenticated users
    const session = await getSessionFn()
    if (!session) {
      throw new Error('Not authenticated')
    }
    return { session }
  },
  head: () => ({
    meta: [
      {
        title: 'Configuración de Clínica - Denty',
      },
    ],
  }),
})

interface OnboardingMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface OnboardingStatus {
  currentStep: string
  completedSteps: string[]
  clinicData: { [x: string]: {} }
  isComplete: boolean
}

function OnboardingPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  Route.useLoaderData() as { session: AdminSession } // Verify auth but don't use

  const [messages, setMessages] = useState<OnboardingMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<OnboardingStatus | null>(null)

  const loadOnboardingStatus = useCallback(async () => {
    try {
      const statusData = await getOnboardingStatusFn()
      setStatus(statusData)

      if (statusData.isComplete) {
        navigate({ to: '/admin/dashboard' })
        return
      }

      // If no messages yet, start with Denty's greeting
      if (messages.length === 0) {
        const welcomeMessage: OnboardingMessage = {
          role: 'assistant',
          content: t('onboarding.welcome', { clinicName: statusData.clinicData.name }),
          timestamp: new Date(),
        }
        setMessages([welcomeMessage])
      }
    } catch (error) {
      console.error('Failed to load onboarding status:', error)
    }
  }, [messages.length, navigate, t])

  useEffect(() => {
    loadOnboardingStatus()
  }, [loadOnboardingStatus])

  const sendMessage = async () => {
    if (!currentMessage.trim() || loading) return

    const userMessage: OnboardingMessage = {
      role: 'user',
      content: currentMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setCurrentMessage('')
    setLoading(true)

    try {
      const response = (await sendOnboardingMessageFn({
        data: {
          message: currentMessage,
          currentStatus: status,
        },
      })) as {
        success: boolean
        reply?: string
        updatedStatus?: OnboardingStatus
      }

      if (response.success) {
        const assistantMessage: OnboardingMessage = {
          role: 'assistant',
          content: response.reply || '',
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, assistantMessage])

        if (response.updatedStatus) {
          setStatus(response.updatedStatus)
        }

        // Check if onboarding is complete
        if (response.updatedStatus?.isComplete) {
          await completeOnboardingFn()
          setTimeout(() => {
            navigate({ to: '/admin/dashboard' })
          }, 2000)
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      const errorMessage: OnboardingMessage = {
        role: 'assistant',
        content: t('common.error'),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="px-4 py-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🦷</span>
              <div>
                <h1 className="text-xl font-semibold">{t('onboarding.title')}</h1>
                <p className="text-sm text-muted-foreground">{t('onboarding.subtitle')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress indicator */}
        {status && (
          <div className="border-b px-4 py-3">
            <div className="flex items-center justify-between text-sm">
              <span>{t('onboarding.progress')}</span>
              <span className="font-medium">
                {status.completedSteps.length} / 5 {t('onboarding.stepsComplete')}
              </span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${(status.completedSteps.length / 5) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Chat messages */}
        <div className="flex min-h-[calc(100vh-200px)] flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${message.timestamp.getTime()}-${index}`}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="mt-1 text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-muted text-foreground rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                      <div
                        className="h-2 w-2 rounded-full bg-primary animate-pulse"
                        style={{ animationDelay: '0.2s' }}
                      ></div>
                      <div
                        className="h-2 w-2 rounded-full bg-primary animate-pulse"
                        style={{ animationDelay: '0.4s' }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input area */}
          <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-end gap-2 p-4">
              <div className="flex-1">
                <textarea
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t('onboarding.messagePlaceholder')}
                  className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary min-h-[2.5rem] max-h-32"
                  rows={1}
                  disabled={loading}
                />
              </div>
              <Button onClick={sendMessage} disabled={!currentMessage.trim() || loading} size="sm">
                {t('onboarding.send')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
