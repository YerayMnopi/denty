import { createServerFn } from '@tanstack/react-start'
import OpenAI from 'openai'
import { z } from 'zod'
import type { Clinic, Doctor } from '@/lib/collections'

// Mock OpenAI integration - replace with actual implementation
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

// ─── Types ───────────────────────────────────────────────

export interface ContentGenerationContext {
  clinic: Clinic
  doctors?: Doctor[]
  language?: 'en' | 'es'
  tone?: 'professional' | 'friendly' | 'authoritative' | 'conversational'
}

// ─── Input Validators ────────────────────────────────────

const generateServiceDescriptionInputValidator = z.object({
  serviceName: z.string(),
  clinicContext: z.object({
    name: z.string(),
    specialties: z.array(z.string()).optional(),
  }),
  language: z.enum(['en', 'es']).default('en'),
  tone: z
    .enum(['professional', 'friendly', 'authoritative', 'conversational'])
    .default('professional'),
  length: z.enum(['short', 'medium', 'long']).default('medium'),
})

const generateBlogPostInputValidator = z.object({
  topic: z.string(),
  clinicContext: z.object({
    name: z.string(),
    services: z.array(z.string()),
    location: z.string().optional(),
  }),
  language: z.enum(['en', 'es']).default('en'),
  tone: z
    .enum(['professional', 'friendly', 'authoritative', 'conversational'])
    .default('professional'),
  length: z.enum(['short', 'medium', 'long']).default('medium'),
  includeCallToAction: z.boolean().default(true),
})

const generateSEOKeywordsInputValidator = z.object({
  clinicName: z.string(),
  services: z.array(z.string()),
  location: z.string(),
  language: z.enum(['en', 'es']).default('en'),
  targetAudience: z.string().optional(),
})

// ─── Mock Content Templates ──────────────────────────────

const mockServiceDescriptions = {
  en: {
    'dental-cleaning': {
      short: 'Professional dental cleaning to remove plaque and maintain oral health.',
      medium:
        'Our professional dental cleaning service removes plaque, tartar, and stains to keep your teeth healthy and bright. Regular cleanings prevent gum disease and maintain optimal oral hygiene.',
      long: 'Experience a thorough professional dental cleaning that goes beyond what you can achieve at home. Our skilled hygienists use advanced techniques to remove plaque, tartar, and surface stains, leaving your teeth feeling fresh and looking their best. Regular dental cleanings are essential for preventing gum disease, tooth decay, and maintaining overall oral health. We recommend cleanings every six months for optimal results.',
    },
    'dental-implants': {
      short: 'Permanent tooth replacement solution using titanium implants.',
      medium:
        'Restore your smile with dental implants - a permanent, natural-looking solution for missing teeth. Our titanium implants integrate with your jawbone for superior stability and comfort.',
      long: 'Dental implants represent the gold standard in tooth replacement technology. Using biocompatible titanium posts that integrate with your jawbone, we create a permanent foundation for natural-looking crowns. Unlike dentures or bridges, implants preserve surrounding teeth and provide the closest experience to natural teeth in terms of function and appearance. The procedure is performed with precision and care to ensure optimal healing and long-term success.',
    },
    orthodontics: {
      short: 'Straighten your teeth with modern orthodontic solutions.',
      medium:
        'Achieve the perfect smile with our orthodontic treatments, including traditional braces and clear aligners. We create personalized treatment plans for patients of all ages.',
      long: "Transform your smile with our comprehensive orthodontic services. Whether you choose traditional metal braces, clear ceramic braces, or invisible aligners, we provide personalized treatment plans tailored to your specific needs and lifestyle. Our experienced orthodontists use the latest techniques to correct misaligned teeth, improve bite function, and enhance your overall oral health. Treatment options are available for children, teens, and adults, making it never too late to achieve the smile you've always wanted.",
    },
  },
  es: {
    'dental-cleaning': {
      short: 'Limpieza dental profesional para eliminar placa y mantener la salud bucal.',
      medium:
        'Nuestro servicio de limpieza dental profesional elimina la placa, el sarro y las manchas para mantener tus dientes sanos y brillantes. Las limpiezas regulares previenen la enfermedad de las encías.',
      long: 'Experimenta una limpieza dental profesional completa que va más allá de lo que puedes lograr en casa. Nuestros higienistas especializados utilizan técnicas avanzadas para eliminar la placa, el sarro y las manchas superficiales, dejando tus dientes frescos y con su mejor aspecto. Las limpiezas dentales regulares son esenciales para prevenir enfermedades de las encías, caries y mantener la salud bucal general.',
    },
    'dental-implants': {
      short: 'Solución permanente de reemplazo dental usando implantes de titanio.',
      medium:
        'Restaura tu sonrisa con implantes dentales: una solución permanente y de aspecto natural para dientes perdidos. Nuestros implantes de titanio se integran con tu hueso maxilar.',
      long: 'Los implantes dentales representan el estándar de oro en tecnología de reemplazo dental. Utilizando postes de titanio biocompatible que se integran con tu hueso maxilar, creamos una base permanente para coronas de aspecto natural. A diferencia de las dentaduras o puentes, los implantes preservan los dientes circundantes y proporcionan la experiencia más cercana a los dientes naturales.',
    },
  },
}

const mockBlogPosts = {
  en: {
    'dental-hygiene-tips': {
      title: '10 Essential Tips for Better Dental Hygiene',
      content: `
# 10 Essential Tips for Better Dental Hygiene

Maintaining excellent oral hygiene is crucial for your overall health and well-being. Here are our top 10 tips for keeping your teeth and gums healthy:

## 1. Brush Twice Daily
Brush your teeth at least twice a day using fluoride toothpaste. Spend at least two minutes brushing, making sure to reach all surfaces of your teeth.

## 2. Don't Forget to Floss
Flossing removes plaque and food particles between teeth that your toothbrush can't reach. Make it a daily habit.

## 3. Use Mouthwash
An antimicrobial mouthwash can help reduce bacteria and freshen your breath.

## 4. Replace Your Toothbrush Regularly
Change your toothbrush every 3-4 months or when bristles become frayed.

## 5. Limit Sugary and Acidic Foods
Reduce consumption of sugary snacks and acidic drinks that can erode tooth enamel.

## 6. Stay Hydrated
Drinking water helps wash away food particles and bacteria.

## 7. Don't Use Your Teeth as Tools
Avoid using your teeth to open packages or crack nuts.

## 8. Schedule Regular Check-ups
Visit your dentist every six months for professional cleanings and examinations.

## 9. Quit Smoking
Tobacco use significantly increases your risk of gum disease and oral cancer.

## 10. Eat a Balanced Diet
A diet rich in vitamins and minerals supports healthy teeth and gums.
      `,
      seo: {
        title: 'Complete Guide to Better Dental Hygiene - Expert Tips',
        description:
          'Discover 10 essential tips for maintaining excellent oral hygiene. Expert advice from dental professionals.',
        keywords: ['dental hygiene', 'oral care', 'teeth brushing', 'dental tips', 'oral health'],
      },
    },
  },
  es: {
    'dental-hygiene-tips': {
      title: '10 Consejos Esenciales para una Mejor Higiene Dental',
      content: `
# 10 Consejos Esenciales para una Mejor Higiene Dental

Mantener una excelente higiene bucal es crucial para tu salud y bienestar general. Aquí están nuestros 10 mejores consejos para mantener tus dientes y encías saludables:

## 1. Cepíllate Dos Veces al Día
Cepilla tus dientes al menos dos veces al día usando pasta dental con flúor. Dedica al menos dos minutos al cepillado.

## 2. No Olvides el Hilo Dental
El hilo dental elimina la placa y partículas de comida entre los dientes que tu cepillo no puede alcanzar.

## 3. Usa Enjuague Bucal
Un enjuague antimicrobiano puede ayudar a reducir las bacterias y refrescar tu aliento.

## 4. Cambia tu Cepillo Regularmente
Cambia tu cepillo cada 3-4 meses o cuando las cerdas se desgasten.

## 5. Limita Alimentos Azucarados y Ácidos
Reduce el consumo de snacks azucarados y bebidas ácidas que pueden erosionar el esmalte.

## 6. Mantente Hidratado
Beber agua ayuda a eliminar partículas de comida y bacterias.

## 7. No Uses tus Dientes como Herramientas
Evita usar tus dientes para abrir paquetes o partir nueces.

## 8. Programa Revisiones Regulares
Visita a tu dentista cada seis meses para limpiezas profesionales y exámenes.

## 9. Deja de Fumar
El uso de tabaco aumenta significativamente tu riesgo de enfermedad de las encías.

## 10. Come una Dieta Equilibrada
Una dieta rica en vitaminas y minerales apoya dientes y encías saludables.
      `,
      seo: {
        title: 'Guía Completa para Mejor Higiene Dental - Consejos Expertos',
        description:
          'Descubre 10 consejos esenciales para mantener una excelente higiene bucal. Consejos expertos de profesionales dentales.',
        keywords: [
          'higiene dental',
          'cuidado bucal',
          'cepillado dental',
          'consejos dentales',
          'salud bucal',
        ],
      },
    },
  },
}

// ─── AI-Powered Content Generation Functions ─────────────

async function generateContentWithAI(prompt: string, _context: any): Promise<string> {
  if (!openai) {
    // Return mock content if no OpenAI key
    return 'Mock AI-generated content. Configure OPENAI_API_KEY to use real AI generation.'
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            'You are a professional dental content writer. Create engaging, accurate, and SEO-friendly content for dental clinics.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    })

    return completion.choices[0]?.message?.content || 'Error generating content'
  } catch (error) {
    console.error('OpenAI API error:', error)
    return 'Error generating content with AI. Please try again.'
  }
}

// ─── Server Functions ────────────────────────────────────

export const generateServiceDescription = createServerFn({ method: 'POST' })
  .inputValidator(generateServiceDescriptionInputValidator)
  .handler(async ({ data }) => {
    const { serviceName, clinicContext, language, tone, length } = data

    // Try to find mock content first
    const serviceKey = serviceName.toLowerCase().replace(/\s+/g, '-')
    const mockContent = (
      mockServiceDescriptions as Record<string, Record<string, Record<string, string>>>
    )[language]?.[serviceKey]?.[length]

    if (mockContent) {
      return {
        content: mockContent,
        source: 'mock',
      }
    }

    // Use AI generation if available
    const prompt = `
Generate a ${length} description for the dental service "${serviceName}" for ${clinicContext.name}.
Language: ${language}
Tone: ${tone}
Clinic specialties: ${clinicContext.specialties?.join(', ') || 'general dentistry'}

The description should be informative, engaging, and suitable for a dental clinic website.
${length === 'short' ? 'Keep it to 1-2 sentences.' : ''}
${length === 'medium' ? 'Keep it to 2-3 sentences.' : ''}
${length === 'long' ? 'Provide a comprehensive paragraph with benefits and process details.' : ''}
    `

    const aiContent = await generateContentWithAI(prompt, data)

    return {
      content: aiContent,
      source: openai ? 'ai' : 'mock',
    }
  })

export const generateBlogPost = createServerFn({ method: 'POST' })
  .inputValidator(generateBlogPostInputValidator)
  .handler(async ({ data }) => {
    const { topic, clinicContext, language, tone, length, includeCallToAction } = data

    // Try to find mock content first
    const topicKey = topic.toLowerCase().replace(/\s+/g, '-')
    const mockPost = (mockBlogPosts as Record<string, Record<string, any>>)[language]?.[topicKey]

    if (mockPost) {
      let content = mockPost.content

      if (includeCallToAction) {
        const cta =
          language === 'es'
            ? `\n\n---\n\n¿Necesitas atención dental profesional? En ${clinicContext.name} estamos aquí para ayudarte. [Reserva tu cita hoy](${clinicContext.name.toLowerCase().replace(/\s+/g, '-')}.denty.es/book).`
            : `\n\n---\n\nNeed professional dental care? At ${clinicContext.name}, we're here to help. [Book your appointment today](${clinicContext.name.toLowerCase().replace(/\s+/g, '-')}.denty.es/book).`

        content += cta
      }

      return {
        title: mockPost.title,
        content: content,
        excerpt:
          `${mockPost.content
            .split('\n')
            .find((line: string) => line.length > 50)
            ?.substring(0, 150)}...` || '',
        seo: mockPost.seo,
        source: 'mock',
      }
    }

    // Use AI generation if available
    const prompt = `
Create a ${length} blog post about "${topic}" for a dental clinic.
Clinic: ${clinicContext.name}
Services: ${clinicContext.services.join(', ')}
Location: ${clinicContext.location || 'not specified'}
Language: ${language}
Tone: ${tone}

The blog post should include:
- Engaging title
- Well-structured content with headers
- Practical tips or information
- SEO-friendly structure
${includeCallToAction ? '- Call-to-action at the end encouraging appointment booking' : ''}

Format the response as markdown.
    `

    const aiContent = await generateContentWithAI(prompt, data)

    // Extract title from AI content (assuming it starts with # Title)
    const titleMatch = aiContent.match(/^#\s*(.+)$/m)
    const title = titleMatch ? titleMatch[1] : topic

    // Generate excerpt from first paragraph
    const excerpt =
      `${aiContent
        .split('\n')
        .find((line) => line.length > 50)
        ?.substring(0, 150)}...` || ''

    // Generate SEO metadata
    const seo = {
      title: `${title} | ${clinicContext.name}`,
      description: excerpt,
      keywords: topic.split(' ').concat(['dental', 'dentist', 'oral health']),
    }

    return {
      title,
      content: aiContent,
      excerpt,
      seo,
      source: openai ? 'ai' : 'mock',
    }
  })

export const suggestSEOKeywords = createServerFn({ method: 'POST' })
  .inputValidator(generateSEOKeywordsInputValidator)
  .handler(async ({ data }) => {
    const { clinicName, services, location, language, targetAudience } = data

    // Base keywords
    const baseKeywords =
      language === 'es'
        ? ['dentista', 'clínica dental', 'salud bucal', 'cuidado dental']
        : ['dentist', 'dental clinic', 'oral health', 'dental care']

    // Location-based keywords
    const locationKeywords = location
      ? language === 'es'
        ? [`dentista ${location}`, `clínica dental ${location}`, `dentista en ${location}`]
        : [`dentist ${location}`, `dental clinic ${location}`, `dentist in ${location}`]
      : []

    // Service-based keywords
    const serviceKeywords = services.flatMap((service) => {
      const translations = {
        cleaning: language === 'es' ? 'limpieza dental' : 'dental cleaning',
        implants: language === 'es' ? 'implantes dentales' : 'dental implants',
        orthodontics: language === 'es' ? 'ortodoncia' : 'orthodontics',
        whitening: language === 'es' ? 'blanqueamiento dental' : 'teeth whitening',
      }

      const serviceTranslation =
        (translations as Record<string, string>)[service.toLowerCase()] || service
      return [
        serviceTranslation,
        `${serviceTranslation} ${location}`.trim(),
        `mejor ${serviceTranslation}`,
      ].filter(Boolean)
    })

    // Target audience keywords
    const audienceKeywords = targetAudience
      ? language === 'es'
        ? [`dentista para ${targetAudience}`, `cuidado dental ${targetAudience}`]
        : [`dentist for ${targetAudience}`, `${targetAudience} dental care`]
      : []

    // Combine all keywords and remove duplicates
    const allKeywords = [
      ...baseKeywords,
      ...locationKeywords,
      ...serviceKeywords,
      ...audienceKeywords,
      clinicName.toLowerCase(),
    ]

    const uniqueKeywords = [...new Set(allKeywords)].slice(0, 20) // Limit to 20 keywords

    return {
      keywords: uniqueKeywords,
      source: 'generated',
    }
  })

export const generatePageContent = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      pageType: z.enum(['homepage', 'about', 'services', 'contact']),
      clinicContext: z.object({
        name: z.string(),
        services: z.array(z.string()),
        location: z.string().optional(),
        description: z.string().optional(),
      }),
      language: z.enum(['en', 'es']).default('en'),
      tone: z
        .enum(['professional', 'friendly', 'authoritative', 'conversational'])
        .default('professional'),
    }),
  )
  .handler(async ({ data }) => {
    const { pageType, clinicContext, language, tone } = data

    const prompt = `
Generate ${language} content for a ${pageType} page for ${clinicContext.name}.
Clinic services: ${clinicContext.services.join(', ')}
Location: ${clinicContext.location || 'not specified'}
Description: ${clinicContext.description || 'dental clinic'}
Tone: ${tone}

Create engaging, professional content suitable for a dental clinic website.
Include relevant headings and structure the content appropriately.
    `

    const content = await generateContentWithAI(prompt, data)

    return {
      content,
      source: openai ? 'ai' : 'mock',
    }
  })
