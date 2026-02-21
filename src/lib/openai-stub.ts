/**
 * Client-side stub for the openai SDK.
 * Server-side code uses the real package via ssr.external.
 */
class OpenAI {
  chat = { completions: { create: () => Promise.reject('OpenAI is not available on the client') } }
  responses = { create: () => Promise.reject('OpenAI is not available on the client') }
}

export default OpenAI
