import { createFileRoute, useRouter } from '@tanstack/react-router'
import { Check, Loader2, Send } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { processOnboardingMessageFn, startOnboardingFn } from '@/server/onboarding'

export const Route = createFileRoute('/onboarding')({
  component: OnboardingPage,
  head: () => ({
    meta: [
      {
        title: 'Configura tu clínica - Denty',
      },
    ],
  }),
})

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface OnboardingProgress {
  currentStep: string
  completedSteps: string[]
  data: Record<string, any>
}

function OnboardingPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [progress, setProgress] = useState<OnboardingProgress | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const startOnboarding = async () => {
    try {
      const data = await startOnboardingFn()

      if (data.success) {
        setSessionId(data.sessionId!)
        setProgress(data.progress!)
        // Add welcome message
        setMessages([
          {
            role: 'assistant',
            content: t('onboarding.messages.welcome'),
            timestamp: new Date(),
          },
        ])
      }
    } catch (error) {
      console.error('Error starting onboarding:', error)
      // Still show welcome message even if server fails
      setSessionId('local-' + Date.now())
      setMessages([
        {
          role: 'assistant',
          content: t('onboarding.messages.welcome'),
          timestamp: new Date(),
        },
      ])
    }
  }

  useEffect(() => {
    startOnboarding()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startOnboarding])

  const sendMessage = async () => {
    if (!inputValue.trim() || !sessionId || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const data = await processOnboardingMessageFn({
        data: { sessionId, message: inputValue },
      })

      if (data.success) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.message!,
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, assistantMessage])
        setProgress(data.progress!)

        // If onboarding is complete, redirect to admin panel
        if (data.progress?.currentStep === 'complete') {
          setTimeout(() => {
            router.navigate({ to: '/admin/dashboard' })
          }, 3000)
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: t('onboarding.error'),
            timestamp: new Date(),
          },
        ])
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: t('onboarding.error'),
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage()
  }

  const progressSteps = [
    'clinicName',
    'email',
    'password',
    'phone',
    'address',
    'services',
    'workingHours',
    'doctors',
    'complete',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="px-4 py-6 text-center">
          <div className="mb-2 text-4xl">🦷</div>
          <h1 className="text-2xl font-bold">{t('onboarding.title')}</h1>
          <p className="text-muted-foreground">{t('onboarding.subtitle')}</p>
        </div>

        {/* Progress Indicator */}
        {progress && (
          <div className="mx-4 mb-6">
            <div className="rounded-lg border bg-card p-4">
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                {progressSteps.slice(0, -1).map((step, index) => (
                  <div
                    key={step}
                    className={`flex flex-col items-center gap-1 text-xs ${
                      progress.completedSteps.includes(step)
                        ? 'text-green-600'
                        : progress.currentStep === step
                          ? 'text-primary'
                          : 'text-muted-foreground'
                    }`}
                  >
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                        progress.completedSteps.includes(step)
                          ? 'bg-green-100 text-green-600'
                          : progress.currentStep === step
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {progress.completedSteps.includes(step) ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span className="text-center">{t(`onboarding.progress.${step}`)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Chat Interface */}
        <div className="mx-4 rounded-lg border bg-card">
          {/* Messages */}
          <div className="max-h-96 overflow-y-auto p-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs rounded-lg px-4 py-2 lg:max-w-md ${
                      message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-xs rounded-lg bg-muted px-4 py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={t('onboarding.placeholder')}
                disabled={isLoading || progress?.currentStep === 'complete'}
                className="flex-1"
                autoFocus
              />
              <Button
                type="submit"
                disabled={!inputValue.trim() || isLoading || progress?.currentStep === 'complete'}
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </div>

        <div className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Powered by Denty AI 🦷</p>
        </div>
      </div>
    </div>
  )
}
