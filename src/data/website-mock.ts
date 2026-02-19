// NOTE: This file is imported by client-side components, so it must NOT import
// the `mongodb` package (only available server-side). Use plain strings for IDs.

export interface MockWebsite {
  _id: string
  clinicId: string
  domain?: string
  subdomain: string
  settings: {
    name: Record<string, string>
    theme: {
      primaryColor: string
      secondaryColor: string
      logo: string
      favicon: string
    }
    pages: {
      homepage: boolean
      services: boolean
      team: boolean
      contact: boolean
      blog: boolean
    }
    seo: {
      title: Record<string, string>
      description: Record<string, string>
      keywords: string[]
    }
  }
  content: {
    homepage: {
      hero: Record<string, string>
      about: Record<string, string>
      callToAction: Record<string, string>
    }
    services: {
      title: Record<string, string>
      description: Record<string, string>
    }
    team: {
      title: Record<string, string>
      description: Record<string, string>
    }
    contact: {
      title: Record<string, string>
      description: Record<string, string>
    }
  }
  createdAt: Date
  updatedAt: Date
}

export interface MockBlogPost {
  _id: string
  clinicId: string
  slug: string
  title: Record<string, string>
  content: Record<string, string>
  excerpt: Record<string, string>
  author: string
  authorId: string
  tags: string[]
  published: boolean
  seo: {
    title: Record<string, string>
    description: Record<string, string>
    keywords: string[]
  }
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
}

let idCounter = 0
function mockId(): string {
  return `mock-id-${Date.now()}-${++idCounter}`
}

export const mockWebsites: MockWebsite[] = [
  {
    _id: mockId(),
    clinicId: '507f1f77bcf86cd799439011',
    domain: undefined,
    subdomain: 'clinica-dental-sonrisa',
    settings: {
      name: {
        en: 'Dental Smile Clinic',
        es: 'Clínica Dental Sonrisa'
      },
      theme: {
        primaryColor: '#2563eb',
        secondaryColor: '#06b6d4',
        logo: '/logos/clinica-dental-sonrisa.png',
        favicon: '/favicons/clinica-dental-sonrisa.ico'
      },
      pages: {
        homepage: true,
        services: true,
        team: true,
        contact: true,
        blog: true
      },
      seo: {
        title: {
          en: 'Dental Smile Clinic - Professional Dental Care in Madrid',
          es: 'Clínica Dental Sonrisa - Cuidado Dental Profesional en Madrid'
        },
        description: {
          en: 'Expert dental care in the heart of Madrid. Modern treatments, experienced dentists, and personalized care for the whole family.',
          es: 'Cuidado dental experto en el corazón de Madrid. Tratamientos modernos, dentistas experimentados y atención personalizada para toda la familia.'
        },
        keywords: [
          'dentist madrid',
          'dental clinic',
          'dental implants',
          'orthodontics',
          'teeth cleaning',
          'dentista madrid',
          'clínica dental',
          'implantes dentales',
          'ortodoncia',
          'limpieza dental'
        ]
      }
    },
    content: {
      homepage: {
        hero: {
          en: 'Your Smile, Our Passion',
          es: 'Tu Sonrisa, Nuestra Pasión'
        },
        about: {
          en: 'At Dental Smile Clinic, we combine cutting-edge technology with personalized care to deliver exceptional dental treatments. Our experienced team is dedicated to helping you achieve optimal oral health in a comfortable and welcoming environment.',
          es: 'En Clínica Dental Sonrisa, combinamos tecnología de vanguardia con atención personalizada para brindar tratamientos dentales excepcionales. Nuestro equipo experimentado se dedica a ayudarte a lograr una salud bucal óptima en un ambiente cómodo y acogedor.'
        },
        callToAction: {
          en: 'Book Your Appointment Today',
          es: 'Reserva Tu Cita Hoy'
        }
      },
      services: {
        title: {
          en: 'Our Dental Services',
          es: 'Nuestros Servicios Dentales'
        },
        description: {
          en: 'We offer a comprehensive range of dental services to meet all your oral health needs, from routine cleanings to complex restorative procedures.',
          es: 'Ofrecemos una gama completa de servicios dentales para satisfacer todas tus necesidades de salud bucal, desde limpiezas de rutina hasta procedimientos restaurativos complejos.'
        }
      },
      team: {
        title: {
          en: 'Meet Our Expert Team',
          es: 'Conoce a Nuestro Equipo Experto'
        },
        description: {
          en: 'Our skilled dental professionals are committed to providing you with the highest quality care using the latest techniques and technologies.',
          es: 'Nuestros profesionales dentales especializados están comprometidos a brindarte la atención de más alta calidad utilizando las últimas técnicas y tecnologías.'
        }
      },
      contact: {
        title: {
          en: 'Get in Touch',
          es: 'Ponte en Contacto'
        },
        description: {
          en: 'Ready to start your journey to better oral health? Contact us today to schedule your appointment or learn more about our services.',
          es: '¿Listo para comenzar tu camino hacia una mejor salud bucal? Contáctanos hoy para programar tu cita o aprender más sobre nuestros servicios.'
        }
      }
    },
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-20T15:30:00Z')
  },
  {
    _id: mockId(),
    clinicId: '507f1f77bcf86cd799439012',
    domain: 'www.dentalvitacare.com',
    subdomain: 'dental-vita-care',
    settings: {
      name: {
        en: 'Dental Vita Care',
        es: 'Dental Vita Care'
      },
      theme: {
        primaryColor: '#16a34a',
        secondaryColor: '#f59e0b',
        logo: '/logos/dental-vita-care.png',
        favicon: '/favicons/dental-vita-care.ico'
      },
      pages: {
        homepage: true,
        services: true,
        team: true,
        contact: true,
        blog: false
      },
      seo: {
        title: {
          en: 'Dental Vita Care - Advanced Dental Treatments in Barcelona',
          es: 'Dental Vita Care - Tratamientos Dentales Avanzados en Barcelona'
        },
        description: {
          en: 'Premium dental care in Barcelona with state-of-the-art facilities and personalized treatment plans for optimal oral health.',
          es: 'Atención dental premium en Barcelona con instalaciones de última generación y planes de tratamiento personalizados para una salud bucal óptima.'
        },
        keywords: [
          'dental barcelona',
          'premium dental care',
          'cosmetic dentistry',
          'dental implants barcelona',
          'dentista barcelona',
          'cuidado dental premium',
          'odontología cosmética',
          'implantes dentales barcelona'
        ]
      }
    },
    content: {
      homepage: {
        hero: {
          en: 'Premium Dental Care for Life',
          es: 'Cuidado Dental Premium de por Vida'
        },
        about: {
          en: 'Dental Vita Care offers premium dental services with a focus on advanced technology and patient comfort. Our clinic features state-of-the-art equipment and a team of highly qualified dental specialists.',
          es: 'Dental Vita Care ofrece servicios dentales premium con un enfoque en tecnología avanzada y comodidad del paciente. Nuestra clínica cuenta con equipos de última generación y un equipo de especialistas dentales altamente calificados.'
        },
        callToAction: {
          en: 'Schedule Your Consultation',
          es: 'Programa Tu Consulta'
        }
      },
      services: {
        title: {
          en: 'Premium Dental Services',
          es: 'Servicios Dentales Premium'
        },
        description: {
          en: 'Experience the highest standard of dental care with our comprehensive range of advanced treatments and personalized approach.',
          es: 'Experimenta el más alto estándar de atención dental con nuestra gama completa de tratamientos avanzados y enfoque personalizado.'
        }
      },
      team: {
        title: {
          en: 'World-Class Dental Specialists',
          es: 'Especialistas Dentales de Clase Mundial'
        },
        description: {
          en: 'Our team consists of internationally trained dental specialists who are passionate about delivering exceptional results and patient satisfaction.',
          es: 'Nuestro equipo está formado por especialistas dentales entrenados internacionalmente que están apasionados por brindar resultados excepcionales y satisfacción del paciente.'
        }
      },
      contact: {
        title: {
          en: 'Visit Our Modern Clinic',
          es: 'Visita Nuestra Clínica Moderna'
        },
        description: {
          en: 'Located in the heart of Barcelona, our modern facility provides a comfortable and relaxing environment for all your dental needs.',
          es: 'Ubicada en el corazón de Barcelona, nuestra instalación moderna proporciona un ambiente cómodo y relajante para todas tus necesidades dentales.'
        }
      }
    },
    createdAt: new Date('2024-02-01T09:15:00Z'),
    updatedAt: new Date('2024-02-05T14:20:00Z')
  }
]

export const mockBlogPosts: MockBlogPost[] = [
  {
    _id: mockId(),
    clinicId: '507f1f77bcf86cd799439011',
    slug: '10-tips-for-better-oral-hygiene',
    title: {
      en: '10 Essential Tips for Better Oral Hygiene',
      es: '10 Consejos Esenciales para una Mejor Higiene Bucal'
    },
    content: {
      en: `# 10 Essential Tips for Better Oral Hygiene

Maintaining excellent oral hygiene is the foundation of good dental health. Here are our top 10 tips to help you keep your teeth and gums healthy:

## 1. Brush Twice Daily with Fluoride Toothpaste
Brush your teeth for at least two minutes, twice a day, using fluoride toothpaste. This helps remove plaque and bacteria that can cause tooth decay and gum disease.

## 2. Don't Forget to Floss
Flossing daily removes plaque and food particles from between your teeth and along the gum line, areas your toothbrush can't reach effectively.

## 3. Use an Antimicrobial Mouthwash
Rinse with an antimicrobial mouthwash to help kill bacteria, reduce plaque, and freshen your breath.

## 4. Replace Your Toothbrush Regularly
Change your toothbrush or electric toothbrush head every 3-4 months, or sooner if the bristles become frayed.

## 5. Limit Sugary and Acidic Foods
Reduce your intake of sugary snacks and acidic beverages that can erode tooth enamel and contribute to decay.

## 6. Stay Hydrated with Water
Drinking plenty of water helps wash away food particles and bacteria while keeping your mouth moist.

## 7. Eat a Balanced Diet
A diet rich in vitamins and minerals, particularly calcium and vitamin D, supports strong teeth and healthy gums.

## 8. Don't Use Your Teeth as Tools
Avoid using your teeth to open packages, crack nuts, or perform other non-eating tasks that could damage them.

## 9. Schedule Regular Dental Check-ups
Visit your dentist every six months for professional cleanings and to catch any potential problems early.

## 10. Quit Smoking and Limit Alcohol
Tobacco and excessive alcohol use significantly increase your risk of gum disease, tooth loss, and oral cancer.

Following these simple tips can help you maintain optimal oral health and prevent many common dental problems. If you have questions about your oral hygiene routine, don't hesitate to ask our dental team during your next visit!`,
      es: `# 10 Consejos Esenciales para una Mejor Higiene Bucal

Mantener una excelente higiene bucal es la base de una buena salud dental. Aquí tienes nuestros 10 mejores consejos para ayudarte a mantener tus dientes y encías saludables:

## 1. Cepíllate Dos Veces al Día con Pasta Dental con Flúor
Cepilla tus dientes durante al menos dos minutos, dos veces al día, usando pasta dental con flúor. Esto ayuda a eliminar la placa y las bacterias que pueden causar caries y enfermedad de las encías.

## 2. No Olvides el Hilo Dental
El uso diario del hilo dental elimina la placa y las partículas de comida entre los dientes y a lo largo de la línea de las encías, áreas que tu cepillo no puede alcanzar efectivamente.

## 3. Usa un Enjuague Bucal Antimicrobiano
Enjuágate con un enjuague bucal antimicrobiano para ayudar a matar bacterias, reducir la placa y refrescar tu aliento.

## 4. Cambia Tu Cepillo de Dientes Regularmente
Cambia tu cepillo de dientes o el cabezal de tu cepillo eléctrico cada 3-4 meses, o antes si las cerdas se desgastan.

## 5. Limita los Alimentos Azucarados y Ácidos
Reduce tu consumo de snacks azucarados y bebidas ácidas que pueden erosionar el esmalte dental y contribuir a las caries.

## 6. Mantente Hidratado con Agua
Beber mucha agua ayuda a eliminar las partículas de comida y las bacterias mientras mantiene tu boca húmeda.

## 7. Come una Dieta Equilibrada
Una dieta rica en vitaminas y minerales, particularmente calcio y vitamina D, apoya dientes fuertes y encías saludables.

## 8. No Uses Tus Dientes como Herramientas
Evita usar tus dientes para abrir paquetes, partir nueces o realizar otras tareas que no sean comer y que podrían dañarlos.

## 9. Programa Revisiones Dentales Regulares
Visita a tu dentista cada seis meses para limpiezas profesionales y para detectar cualquier problema potencial temprano.

## 10. Deja de Fumar y Limita el Alcohol
El tabaco y el consumo excesivo de alcohol aumentan significativamente tu riesgo de enfermedad de las encías, pérdida de dientes y cáncer oral.

Seguir estos simples consejos puede ayudarte a mantener una salud bucal óptima y prevenir muchos problemas dentales comunes. Si tienes preguntas sobre tu rutina de higiene bucal, ¡no dudes en preguntar a nuestro equipo dental durante tu próxima visita!`
    },
    excerpt: {
      en: 'Learn the top 10 essential tips for maintaining excellent oral hygiene and keeping your teeth and gums healthy with expert advice from our dental team.',
      es: 'Aprende los 10 consejos esenciales para mantener una excelente higiene bucal y mantener tus dientes y encías saludables con consejos expertos de nuestro equipo dental.'
    },
    author: 'Dr. María García',
    authorId: '507f1f77bcf86cd799439021',
    tags: ['oral hygiene', 'dental tips', 'prevention', 'dental health'],
    published: true,
    seo: {
      title: {
        en: '10 Essential Tips for Better Oral Hygiene | Dental Smile Clinic',
        es: '10 Consejos Esenciales para Mejor Higiene Bucal | Clínica Dental Sonrisa'
      },
      description: {
        en: 'Discover 10 expert tips for maintaining excellent oral hygiene. Professional advice from dental specialists to keep your teeth and gums healthy.',
        es: 'Descubre 10 consejos expertos para mantener una excelente higiene bucal. Consejos profesionales de especialistas dentales para mantener tus dientes y encías saludables.'
      },
      keywords: ['oral hygiene', 'dental care', 'teeth brushing', 'flossing', 'dental health', 'higiene bucal', 'cuidado dental', 'cepillado dental']
    },
    publishedAt: new Date('2024-01-18T10:00:00Z'),
    createdAt: new Date('2024-01-16T14:30:00Z'),
    updatedAt: new Date('2024-01-17T09:15:00Z')
  },
  {
    _id: mockId(),
    clinicId: '507f1f77bcf86cd799439011',
    slug: 'dental-implants-complete-guide',
    title: {
      en: 'Dental Implants: A Complete Guide to Permanent Tooth Replacement',
      es: 'Implantes Dentales: Guía Completa para el Reemplazo Permanente de Dientes'
    },
    content: {
      en: `# Dental Implants: A Complete Guide to Permanent Tooth Replacement

Losing a tooth can be distressing, but modern dentistry offers an excellent solution: dental implants. This comprehensive guide will help you understand everything you need to know about this revolutionary tooth replacement option.

## What Are Dental Implants?

Dental implants are titanium posts surgically placed into the jawbone to replace tooth roots. They serve as a stable foundation for crowns, bridges, or dentures, providing the closest experience to natural teeth.

## Benefits of Dental Implants

### Permanent Solution
Unlike dentures or bridges, implants can last a lifetime with proper care.

### Natural Look and Feel
Implants look, feel, and function just like your natural teeth.

### Preserve Jawbone
Implants stimulate the jawbone, preventing bone loss that occurs with missing teeth.

### No Impact on Adjacent Teeth
Unlike bridges, implants don't require altering healthy neighboring teeth.

## The Implant Process

### 1. Initial Consultation
Our dental team evaluates your oral health and determines if you're a good candidate for implants.

### 2. Implant Placement
The titanium implant is surgically placed into the jawbone under local anesthesia.

### 3. Healing Period
Over 3-6 months, the implant fuses with the bone in a process called osseointegration.

### 4. Crown Placement
Once healed, a custom crown is attached to complete your new tooth.

## Are You a Good Candidate?

Good candidates for dental implants typically have:
- Adequate bone density in the jaw
- Healthy gums
- Good overall oral hygiene
- Realistic expectations about the outcome

## Caring for Your Implants

Maintain your implants by:
- Brushing and flossing daily
- Using an antimicrobial mouthwash
- Avoiding hard foods that could damage the crown
- Attending regular dental check-ups

## Why Choose Our Clinic for Implants?

At Dental Smile Clinic, we use the latest implant technology and techniques to ensure the best possible outcomes. Our experienced team has successfully placed hundreds of implants, helping patients restore their smiles and confidence.

Ready to learn more about how dental implants can transform your smile? Contact us today to schedule a consultation!`,
      es: `# Implantes Dentales: Guía Completa para el Reemplazo Permanente de Dientes

Perder un diente puede ser angustiante, pero la odontología moderna ofrece una excelente solución: los implantes dentales. Esta guía completa te ayudará a entender todo lo que necesitas saber sobre esta revolucionaria opción de reemplazo dental.

## ¿Qué Son los Implantes Dentales?

Los implantes dentales son postes de titanio colocados quirúrgicamente en el hueso maxilar para reemplazar las raíces de los dientes. Sirven como una base estable para coronas, puentes o dentaduras, proporcionando la experiencia más cercana a los dientes naturales.

## Beneficios de los Implantes Dentales

### Solución Permanente
A diferencia de las dentaduras o puentes, los implantes pueden durar toda la vida con el cuidado adecuado.

### Aspecto y Sensación Natural
Los implantes se ven, se sienten y funcionan como tus dientes naturales.

### Preservan el Hueso Maxilar
Los implantes estimulan el hueso maxilar, previniendo la pérdida ósea que ocurre con los dientes perdidos.

### Sin Impacto en Dientes Adyacentes
A diferencia de los puentes, los implantes no requieren alterar los dientes vecinos saludables.

## El Proceso de Implantes

### 1. Consulta Inicial
Nuestro equipo dental evalúa tu salud bucal y determina si eres un buen candidato para implantes.

### 2. Colocación del Implante
El implante de titanio se coloca quirúrgicamente en el hueso maxilar bajo anestesia local.

### 3. Período de Curación
Durante 3-6 meses, el implante se fusiona con el hueso en un proceso llamado osteointegración.

### 4. Colocación de la Corona
Una vez curado, se coloca una corona personalizada para completar tu nuevo diente.

## ¿Eres un Buen Candidato?

Los buenos candidatos para implantes dentales típicamente tienen:
- Densidad ósea adecuada en el maxilar
- Encías saludables
- Buena higiene bucal general
- Expectativas realistas sobre el resultado

## Cuidando Tus Implantes

Mantén tus implantes:
- Cepillándote y usando hilo dental diariamente
- Usando un enjuague bucal antimicrobiano
- Evitando alimentos duros que podrían dañar la corona
- Asistiendo a revisiones dentales regulares

## ¿Por Qué Elegir Nuestra Clínica para Implantes?

En Clínica Dental Sonrisa, usamos la última tecnología y técnicas de implantes para asegurar los mejores resultados posibles. Nuestro equipo experimentado ha colocado exitosamente cientos de implantes, ayudando a los pacientes a restaurar sus sonrisas y confianza.

¿Listo para aprender más sobre cómo los implantes dentales pueden transformar tu sonrisa? ¡Contáctanos hoy para programar una consulta!`
    },
    excerpt: {
      en: 'Everything you need to know about dental implants - the permanent solution for tooth replacement. Learn about the process, benefits, and care.',
      es: 'Todo lo que necesitas saber sobre los implantes dentales - la solución permanente para el reemplazo de dientes. Aprende sobre el proceso, beneficios y cuidados.'
    },
    author: 'Dr. Carlos Rodríguez',
    authorId: '507f1f77bcf86cd799439022',
    tags: ['dental implants', 'tooth replacement', 'oral surgery', 'restorative dentistry'],
    published: true,
    seo: {
      title: {
        en: 'Dental Implants Complete Guide - Permanent Tooth Replacement | Dental Smile Clinic',
        es: 'Guía Completa de Implantes Dentales - Reemplazo Permanente de Dientes | Clínica Dental Sonrisa'
      },
      description: {
        en: 'Learn everything about dental implants - benefits, process, care, and why they are the best solution for permanent tooth replacement.',
        es: 'Aprende todo sobre implantes dentales - beneficios, proceso, cuidados y por qué son la mejor solución para el reemplazo permanente de dientes.'
      },
      keywords: ['dental implants', 'tooth replacement', 'titanium implants', 'oral surgery', 'implantes dentales', 'reemplazo dental', 'cirugía oral']
    },
    publishedAt: new Date('2024-01-22T11:30:00Z'),
    createdAt: new Date('2024-01-20T16:45:00Z'),
    updatedAt: new Date('2024-01-21T10:20:00Z')
  },
  {
    _id: mockId(),
    clinicId: '507f1f77bcf86cd799439011',
    slug: 'choosing-right-orthodontic-treatment',
    title: {
      en: 'Choosing the Right Orthodontic Treatment: Braces vs. Clear Aligners',
      es: 'Eligiendo el Tratamiento de Ortodoncia Correcto: Brackets vs. Alineadores Transparentes'
    },
    content: {
      en: `# Choosing the Right Orthodontic Treatment: Braces vs. Clear Aligners

A straight, beautiful smile can boost your confidence and improve your oral health. Today's orthodontic options make it easier than ever to achieve the smile of your dreams. Let's explore the two most popular treatments: traditional braces and clear aligners.

## Traditional Braces: The Time-Tested Solution

### How They Work
Traditional braces use metal brackets and wires to gradually move teeth into proper position. The orthodontist periodically adjusts the wires to continue the movement process.

### Advantages
- **Effective for Complex Cases**: Can handle severe misalignment and bite issues
- **Predictable Results**: Tried and tested for decades
- **Always Working**: Fixed in place, so treatment progresses 24/7
- **Cost-Effective**: Generally less expensive than clear aligners

### Considerations
- **Visibility**: Metal brackets are noticeable when you smile
- **Diet Restrictions**: Certain foods must be avoided
- **Oral Hygiene**: Requires extra care when brushing and flossing

## Clear Aligners: The Modern Alternative

### How They Work
Clear aligners are custom-made, transparent trays that gradually shift teeth. You receive a series of aligners, changing to the next set every 1-2 weeks.

### Advantages
- **Nearly Invisible**: Very discreet treatment option
- **Removable**: Can be taken out for eating and special occasions
- **Comfortable**: No metal brackets or wires to irritate your mouth
- **Easy Oral Hygiene**: Remove aligners to brush and floss normally

### Considerations
- **Discipline Required**: Must be worn 20-22 hours daily
- **Not for All Cases**: May not be suitable for complex orthodontic issues
- **Higher Cost**: Generally more expensive than traditional braces

## Which Treatment Is Right for You?

### Choose Traditional Braces If:
- You have complex orthodontic issues
- You prefer a more cost-effective option
- You want the most predictable treatment timeline
- You don't mind the appearance of metal braces

### Choose Clear Aligners If:
- You want a discreet treatment option
- You have mild to moderate orthodontic issues
- You value the flexibility of removable appliances
- You're willing to be disciplined about wearing them

## Age Considerations

### For Teens
Both options work well for teenagers. The choice often depends on lifestyle, sports participation, and personal preference.

### For Adults
Many adults prefer clear aligners due to professional and social considerations, but traditional braces remain highly effective.

## Treatment Duration

Treatment time varies based on the complexity of your case:
- **Traditional Braces**: Typically 18-36 months
- **Clear Aligners**: Usually 12-24 months for appropriate cases

## Maintaining Your Results

Regardless of which treatment you choose, wearing a retainer after treatment is essential to maintain your new smile.

## Our Orthodontic Expertise

At Dental Smile Clinic, we offer both traditional braces and clear aligner treatments. During your consultation, we'll evaluate your specific needs and help you choose the best option for achieving your perfect smile.

Ready to start your orthodontic journey? Schedule a consultation today to discuss which treatment option is right for you!`,
      es: `# Eligiendo el Tratamiento de Ortodoncia Correcto: Brackets vs. Alineadores Transparentes

Una sonrisa recta y hermosa puede aumentar tu confianza y mejorar tu salud bucal. Las opciones ortodóncicas de hoy hacen más fácil que nunca lograr la sonrisa de tus sueños. Exploremos los dos tratamientos más populares: los brackets tradicionales y los alineadores transparentes.

## Brackets Tradicionales: La Solución Probada

### Cómo Funcionan
Los brackets tradicionales usan brackets metálicos y alambres para mover gradualmente los dientes a la posición correcta. El ortodoncista ajusta periódicamente los alambres para continuar el proceso de movimiento.

### Ventajas
- **Efectivos para Casos Complejos**: Pueden manejar desalineaciones severas y problemas de mordida
- **Resultados Predecibles**: Probados y testados durante décadas
- **Siempre Funcionando**: Fijos en su lugar, el tratamiento progresa 24/7
- **Costo-Efectivo**: Generalmente menos costosos que los alineadores transparentes

### Consideraciones
- **Visibilidad**: Los brackets metálicos son notables cuando sonríes
- **Restricciones Dietéticas**: Ciertos alimentos deben evitarse
- **Higiene Bucal**: Requiere cuidado extra al cepillarse y usar hilo dental

## Alineadores Transparentes: La Alternativa Moderna

### Cómo Funcionan
Los alineadores transparentes son bandejas transparentes hechas a medida que desplazan gradualmente los dientes. Recibes una serie de alineadores, cambiando al siguiente juego cada 1-2 semanas.

### Ventajas
- **Casi Invisibles**: Opción de tratamiento muy discreta
- **Removibles**: Se pueden quitar para comer y ocasiones especiales
- **Cómodos**: Sin brackets metálicos o alambres que irriten tu boca
- **Higiene Bucal Fácil**: Remueve los alineadores para cepillarte y usar hilo dental normalmente

### Consideraciones
- **Disciplina Requerida**: Deben usarse 20-22 horas diarias
- **No para Todos los Casos**: Pueden no ser adecuados para problemas ortodóncicos complejos
- **Mayor Costo**: Generalmente más costosos que los brackets tradicionales

## ¿Qué Tratamiento Es Correcto para Ti?

### Elige Brackets Tradicionales Si:
- Tienes problemas ortodóncicos complejos
- Prefieres una opción más costo-efectiva
- Quieres el cronograma de tratamiento más predecible
- No te molesta la apariencia de los brackets metálicos

### Elige Alineadores Transparentes Si:
- Quieres una opción de tratamiento discreta
- Tienes problemas ortodóncicos leves a moderados
- Valoras la flexibilidad de aparatos removibles
- Estás dispuesto a ser disciplinado sobre usarlos

## Consideraciones de Edad

### Para Adolescentes
Ambas opciones funcionan bien para adolescentes. La elección a menudo depende del estilo de vida, participación deportiva y preferencia personal.

### Para Adultos
Muchos adultos prefieren alineadores transparentes debido a consideraciones profesionales y sociales, pero los brackets tradicionales siguen siendo muy efectivos.

## Duración del Tratamiento

El tiempo de tratamiento varía según la complejidad de tu caso:
- **Brackets Tradicionales**: Típicamente 18-36 meses
- **Alineadores Transparentes**: Usualmente 12-24 meses para casos apropiados

## Manteniendo Tus Resultados

Independientemente del tratamiento que elijas, usar un retenedor después del tratamiento es esencial para mantener tu nueva sonrisa.

## Nuestra Experiencia Ortodóncica

En Clínica Dental Sonrisa, ofrecemos tanto brackets tradicionales como tratamientos con alineadores transparentes. Durante tu consulta, evaluaremos tus necesidades específicas y te ayudaremos a elegir la mejor opción para lograr tu sonrisa perfecta.

¿Listo para comenzar tu viaje ortodóncico? ¡Programa una consulta hoy para discutir qué opción de tratamiento es correcta para ti!`
    },
    excerpt: {
      en: 'Compare traditional braces and clear aligners to find the best orthodontic treatment for your needs. Learn about benefits, costs, and treatment duration.',
      es: 'Compara brackets tradicionales y alineadores transparentes para encontrar el mejor tratamiento ortodóncico para tus necesidades. Aprende sobre beneficios, costos y duración.'
    },
    author: 'Dra. Ana López',
    authorId: '507f1f77bcf86cd799439023',
    tags: ['orthodontics', 'braces', 'clear aligners', 'teeth straightening'],
    published: false,
    seo: {
      title: {
        en: 'Braces vs Clear Aligners: Complete Orthodontic Treatment Guide | Dental Smile Clinic',
        es: 'Brackets vs Alineadores Transparentes: Guía Completa de Tratamiento Ortodóncico | Clínica Dental Sonrisa'
      },
      description: {
        en: 'Compare traditional braces and clear aligners. Learn which orthodontic treatment is right for you with expert guidance from dental professionals.',
        es: 'Compara brackets tradicionales y alineadores transparentes. Aprende qué tratamiento ortodóncico es correcto para ti con guía experta de profesionales dentales.'
      },
      keywords: ['orthodontics', 'braces', 'clear aligners', 'teeth straightening', 'invisalign', 'ortodoncia', 'brackets', 'alineadores transparentes']
    },
    publishedAt: undefined,
    createdAt: new Date('2024-01-25T13:15:00Z'),
    updatedAt: new Date('2024-01-26T08:45:00Z')
  }
]

export function getMockWebsiteByClinicId(clinicId: string): MockWebsite | undefined {
  return mockWebsites.find(website => website.clinicId === clinicId)
}

export function getMockWebsiteBySubdomain(subdomain: string): MockWebsite | undefined {
  return mockWebsites.find(website => website.subdomain === subdomain)
}

export function getMockBlogPostsByClinicId(clinicId: string): MockBlogPost[] {
  return mockBlogPosts.filter(post => post.clinicId === clinicId)
}

export function getMockBlogPostBySlug(clinicId: string, slug: string): MockBlogPost | undefined {
  return mockBlogPosts.find(post =>
    post.clinicId === clinicId && post.slug === slug
  )
}
