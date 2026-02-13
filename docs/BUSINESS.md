# Denty — Business Strategy

## 1. Monetization Models

### 1.1 Freemium SaaS for Clinics

**Free tier** — Get clinics onboarded with zero friction:
- Clinic profile page on denty.es
- Up to 2 doctors listed
- Basic appointment booking (up to 50/month)
- Standard search visibility

**Pro** — €49/month:
- Unlimited doctors and appointments
- Priority listing in search results
- Analytics dashboard (bookings, conversion rates, patient demographics)
- Custom clinic branding (logo, colors on profile)
- WhatsApp appointment reminders for patients
- Email notifications with clinic branding

**Premium** — €99/month:
- Everything in Pro
- AI chatbot customized with clinic-specific info (treatments, pricing, FAQs)
- Integration with management software (Gesden, Klinicare)
- Automated follow-up messages (post-visit feedback, recall reminders)
- Multi-location support
- Priority customer support

**Enterprise** — Custom pricing:
- White-label solution (own domain, full branding)
- API access
- Custom integrations
- Dedicated account manager
- SLA guarantees

### 1.2 Commission Model (Hybrid)

For clinics on the Free tier, charge a small commission per confirmed booking:
- **€1-2 per booking** (competitive vs. Doctoralia's higher fees)
- Commission drops to €0 on paid plans — strong incentive to upgrade
- Track and bill monthly

### 1.3 Premium Features (À la carte)

Clinics can add individual features without upgrading:
- **AI Chatbot**: €29/month add-on
- **Management software integration**: €19/month add-on
- **Featured listing** (top of search): €15/month per city
- **Promoted treatments**: €5/month per treatment highlight

### 1.4 Future Revenue Streams

- **Dental supply marketplace**: Connect clinics with suppliers (affiliate/commission)
- **Insurance partnerships**: Referral fees from dental insurance providers
- **Dental tourism packages**: Partner with travel agencies for international patients
- **Training/certification**: Host continuing education content for dental professionals

---

## 2. Marketing Strategy

### 2.1 SEO (Primary Channel)

Denty's architecture is already SEO-optimized with SSR (TanStack Start + Nitro). Key strategies:

**Programmatic SEO:**
- Auto-generate pages: `/clinics/[city]`, `/treatments/[treatment]`, `/doctors/[specialty]-[city]`
- Target long-tail: "dentista en Madrid centro", "implantes dentales precio Barcelona"
- Schema markup (LocalBusiness, MedicalBusiness, Dentist) on all pages
- Internal linking between treatments → clinics → doctors

**Content SEO:**
- Dental health blog (`/blog`): "¿Cuánto cuestan los implantes dentales?", "Ortodoncia invisible vs brackets"
- Treatment guides with clinic CTAs
- City-specific landing pages: "Mejores clínicas dentales en Valencia"

**Technical SEO:**
- Fast Core Web Vitals (SSR + static generation where possible)
- Sitemap generation, robots.txt optimization
- hreflang for ES/EN content

### 2.2 Local SEO

- Google Business Profile optimization for partner clinics
- Encourage patient reviews (post-appointment prompt via WhatsApp)
- Local citations on dental directories
- NAP consistency across platforms

### 2.3 Paid Acquisition

**Google Ads** (high-intent keywords):
- "dentista cerca de mí" — CPC ~€1-3
- "clínica dental [ciudad]" — CPC ~€0.5-2
- "precio [tratamiento] dental" — CPC ~€0.5-1.5
- Target: €500-1000/month initial budget, optimize for cost-per-booking

**Social Media Ads:**
- Instagram/Facebook: Before/after treatment visuals, clinic highlights
- Target: Adults 25-55 in urban Spain
- Budget: €300-500/month

### 2.4 Partnerships

- **Dental associations**: COEM (Madrid), COEC (Cataluña) — official recommendation
- **Dental schools**: Partner with universities for student clinics
- **Insurance companies**: Integration with Sanitas, Adeslas dental plans
- **Management software vendors**: Co-marketing with Gesden, Klinicare

### 2.5 Referral Program

- **For clinics**: Refer another clinic → 1 month free Pro
- **For patients**: Refer a friend → priority booking / small discount on first visit
- Referral tracking built into the platform

### 2.6 Social Media (Organic)

- Instagram: Treatment education, clinic spotlights, patient testimonials
- TikTok: Quick dental tips, myth-busting, "day in a dental clinic"
- LinkedIn: B2B content targeting clinic owners and dental professionals

---

## 3. Competitive Analysis

### 3.1 Direct Competitors

| Platform | Strengths | Weaknesses | Pricing |
|----------|-----------|------------|---------|
| **Doctoralia** | Market leader, strong SEO, reviews | Expensive for clinics (€150+/mo), generic (not dental-specific) | From €150/mo |
| **Miodontólogo** | Dental-specific, price comparison | Outdated UX, limited tech, weak mobile | Commission-based |
| **TopDoctors** | Premium positioning, specialist focus | Not dental-focused, expensive | From €200/mo |
| **Clínica Cloud** | Management software included | Overly complex, weak patient-facing UX | From €80/mo |

### 3.2 How Denty Differentiates

1. **Dental-only focus**: Unlike Doctoralia (generic healthcare), every feature is built for dental workflows
2. **AI-powered**: Chatbot that understands dental terminology, treatments, and can answer patient questions 24/7
3. **Affordable**: Free tier + Pro at €49 vs competitors at €150+
4. **Modern tech stack**: Fast, mobile-first, great UX (TanStack Start + SSR)
5. **Management software integration**: Sync with existing tools (not replace them)
6. **WhatsApp-first communication**: How Spain actually communicates
7. **No patient account required**: Phone number only = zero friction booking
8. **Bilingual**: ES/EN from day one (tourism, expat community)

### 3.3 SWOT

| | Positive | Negative |
|---|---------|----------|
| **Internal** | Modern tech, low cost, dental focus, AI features | New brand, small team, no market presence yet |
| **External** | Underserved market, clinics frustrated with Doctoralia pricing | Doctoralia's SEO dominance, slow clinic adoption |

---

## 4. Revenue Projections

### 4.1 Simple Framework

```
Monthly Revenue = (Free clinics × commission) + (Pro clinics × €49) + (Premium clinics × €99)
```

### 4.2 Conservative Scenario (Year 1-3)

| Metric | Month 6 | Month 12 | Month 24 | Month 36 |
|--------|---------|----------|----------|----------|
| Total clinics | 50 | 150 | 500 | 1,200 |
| Free tier | 35 | 90 | 250 | 500 |
| Pro tier | 12 | 45 | 180 | 480 |
| Premium tier | 3 | 15 | 70 | 220 |
| Avg bookings/free clinic | 30 | 35 | 40 | 40 |
| **Commission revenue** | €1,050 | €3,150 | €10,000 | €20,000 |
| **Pro revenue** | €588 | €2,205 | €8,820 | €23,520 |
| **Premium revenue** | €297 | €1,485 | €6,930 | €21,780 |
| **Monthly revenue** | **€1,935** | **€6,840** | **€25,750** | **€65,300** |
| **Annual run rate** | €23k | €82k | €309k | €784k |

### 4.3 Key Assumptions

- 25% conversion Free → Pro within 6 months
- 15% conversion Pro → Premium within 12 months
- Average clinic churn: 5% monthly on Free, 3% on paid plans
- Commission: €1/booking average
- Growth driven primarily by SEO + word-of-mouth after initial acquisition push

### 4.4 Unit Economics

- **CAC (Customer Acquisition Cost)**: Target €50-100 per clinic (blended)
- **LTV (Pro clinic, 18-month avg)**: €49 × 18 = €882
- **LTV/CAC ratio**: 8.8-17.6x (healthy)
- **Payback period**: 1-2 months

---

## 5. Growth Phases

### Phase 1: Launch & Validate (Months 0-6)
**Market**: Madrid + Barcelona

- Launch MVP with free clinic onboarding
- Onboard 50 clinics through direct outreach (cold email, LinkedIn, clinic visits)
- Validate product-market fit with early adopters
- Iterate on booking flow and clinic dashboard
- Establish SEO foundations (target 1,000 organic monthly visits by month 6)
- **Goal**: 50 clinics, €1,900 MRR

### Phase 2: Grow Spain (Months 6-18)
**Market**: Expand to Valencia, Sevilla, Málaga, Bilbao

- Launch paid acquisition (Google Ads)
- Activate referral program
- Release AI chatbot (Premium feature)
- Launch management software integrations
- Hire first sales rep for clinic outreach
- Target dental association partnerships
- **Goal**: 300 clinics, €10,000 MRR

### Phase 3: Dominate Spain (Months 18-36)
**Market**: All Spanish cities with 100k+ population

- Full content marketing engine (blog, guides, videos)
- Launch dental tourism features (international patients)
- Enterprise/white-label offering
- Build brand recognition as "the dental booking platform"
- **Goal**: 1,200 clinics, €65,000 MRR

### Phase 4: International Expansion (Month 36+)
**Markets**: Portugal, LATAM (Mexico, Colombia, Argentina)

- Localize for Portuguese, LATAM Spanish
- Adapt to local healthcare regulations
- Partner with local dental associations
- **Goal**: 3,000+ clinics across markets

---

## 6. Key Metrics to Track

| Metric | Target |
|--------|--------|
| Clinic sign-up rate | 20+ per month (Phase 2) |
| Free → Pro conversion | 25% within 6 months |
| Monthly churn (paid) | < 3% |
| Bookings per clinic | 40+ per month |
| Patient booking completion rate | > 60% |
| SEO organic traffic | 10k monthly visits (Month 12) |
| CAC | < €100 |
| LTV/CAC | > 5x |
| NPS (clinics) | > 50 |
| NPS (patients) | > 60 |
