# Checklist Legal - Denty

**Plataforma de Agentes AI para Clínicas Dentales en España**

Este documento contiene todos los requisitos legales que Denty debe cumplir antes del lanzamiento y después, organizados por prioridad.

## 🔴 CRÍTICO - Obligatorio antes del lanzamiento

### RGPD / GDPR - Protección de Datos

#### Fundamentos RGPD
- [ ] **Registro de actividades de tratamiento** - Documentar todos los tratamientos de datos según Art. 30 RGPD
- [ ] **Base legal establecida** - Art. 6.1(a) consentimiento o 6.1(f) interés legítimo para datos no sanitarios
- [ ] **Categorías especiales (datos sanitarios)** - Art. 9 RGPD, base legal específica (consentimiento explícito o interés sanitario)
- [ ] **Política de Privacidad completa** - Art. 13-14 RGPD, información clara y accesible
- [ ] **Derechos del interesado implementados** - Acceso, rectificación, supresión, limitación, portabilidad, oposición

#### Consentimiento y Datos Sanitarios
- [ ] **Mecanismo de consentimiento específico** para datos de salud - Art. 9.2(a) RGPD
- [ ] **Granularidad del consentimiento** - Separar consentimientos para diferentes finalidades
- [ ] **Retirada de consentimiento** - Procedimiento simple y claro implementado
- [ ] **Registro de consentimientos** - Sistema de trazabilidad de cuándo/cómo se otorgó

#### Evaluación de Impacto (DPIA)
- [ ] **DPIA realizada** - Obligatoria por tratamiento de datos sanitarios a gran escala (Art. 35 RGPD)
- [ ] **Consulta a Autoridad de Control** si DPIA indica alto riesgo residual
- [ ] **Documentación de salvaguardas** implementadas para mitigar riesgos

#### Data Protection Officer (DPO)
- [ ] **Evaluación necesidad DPO** - Probable obligatorio por datos sanitarios (Art. 37 RGPD)
- [ ] **Designación DPO** interno o externo si es necesario
- [ ] **Contacto DPO publicado** en política de privacidad

#### Retención y Supresión
- [ ] **Política de retención definida** - Plazos específicos por tipo de datos
- [ ] **Excepciones para datos sanitarios** - Ley 41/2002 vs derecho al olvido
- [ ] **Supresión automática** implementada donde sea posible
- [ ] **Procedimiento de supresión manual** para casos complejos

### LOPDGDD - Ley Española de Protección de Datos

#### Especificidades Españolas
- [ ] **Art. 9 LOPDGDD** - Tratamiento por interés legítimo: evaluación y comunicación
- [ ] **Art. 28 LOPDGDD** - Datos de contacto para prospección comercial
- [ ] **Art. 89 LOPDGDD** - Derecho de rectificación en redes sociales
- [ ] **Delegado de Protección de Datos** - Designación según criterios españoles

#### Menores (si aplica)
- [ ] **Art. 8 LOPDGDD** - Consentimiento menores de 14 años requiere consentimiento paternal
- [ ] **Verificación edad** implementada si se permiten menores

### Ley 41/2002 - Autonomía del Paciente y Derechos en Materia de Información y Documentación Clínica

#### Historia Clínica
- [ ] **Art. 15-16** - Definir qué información constituye historia clínica en Denty
- [ ] **Derechos de acceso** del paciente a su historia clínica implementados
- [ ] **Confidencialidad** - Medidas técnicas y organizativas
- [ ] **Conservación** - Mínimo 5 años desde la fecha de alta (algunos casos más)

#### Consentimiento Informado
- [ ] **Proceso consentimiento** para tratamientos que requieran información específica
- [ ] **Documentación consentimientos** - Trazabilidad y almacenamiento seguro

### Contratos de Encargo de Tratamiento

#### Con Clínicas (Responsables del Tratamiento)
- [ ] **Contrato Art. 28 RGPD** - Denty como encargado de tratamiento de las clínicas
- [ ] **Instrucciones documentadas** - Qué puede hacer Denty con datos de pacientes
- [ ] **Auditorías y controles** - Derecho de las clínicas a inspeccionar cumplimiento
- [ ] **Subencargados autorizados** - OpenAI, MongoDB Atlas, Meta (WhatsApp)

#### Con Terceros (Subencargados)
- [ ] **Contrato con OpenAI** - Garantías de protección datos en procesamiento AI
- [ ] **Contrato con MongoDB Atlas** - Acuerdo de encargo de tratamiento
- [ ] **Contrato con Meta** (WhatsApp Business API) - Compliance RGPD
- [ ] **Due diligence subencargados** - Verificar certificaciones y garantías

### Seguridad de Datos

#### Medidas Técnicas
- [ ] **Cifrado en tránsito** - TLS 1.3 para todas las comunicaciones
- [ ] **Cifrado en reposo** - Base de datos y backups cifrados
- [ ] **Gestión de claves** - HSM o servicio cloud equivalente
- [ ] **Controles de acceso** - Principio de menor privilegio implementado

#### Medidas Organizativas  
- [ ] **Políticas de seguridad** documentadas y comunicadas
- [ ] **Formación empleados** en protección de datos y seguridad
- [ ] **Control de accesos** - Revisión periódica de permisos
- [ ] **Gestión de incidentes** - Procedimientos de respuesta definidos

### Notificación de Brechas
- [ ] **Procedimiento 72h** - Notificación AEPD en 72h (Art. 33 RGPD)
- [ ] **Comunicación afectados** - Procedimiento cuando hay alto riesgo (Art. 34 RGPD)
- [ ] **Registro de brechas** - Documentación de todos los incidentes
- [ ] **Contactos emergencia** - 24/7 para notificaciones urgentes

### WhatsApp Business API - Meta
- [ ] **Verificación Business** - Completar proceso verificación Meta
- [ ] **Opt-in compliance** - Consentimiento previo antes de enviar mensajes
- [ ] **Template approval** - Plantillas aprobadas por Meta para notificaciones
- [ ] **Data Processing Agreement** con Meta - Garantías RGPD
- [ ] **Webhook security** - Verificación signatures y HTTPS

## 🟡 IMPORTANTE - Dentro de 3 meses

### EU AI Act - Reglamento de Inteligencia Artificial

#### Clasificación del Sistema
- [ ] **Evaluación clasificación** - Probable sistema de alto riesgo (Anexo III, salud)
- [ ] **Documentación técnica** - Art. 11, documentación completa del sistema AI
- [ ] **Gestión calidad** - Art. 17, sistema de gestión de calidad
- [ ] **Transparencia y documentación** - Art. 13, información clara sobre capacidades/limitaciones

#### Supervisión Humana
- [ ] **Diseño human oversight** - Art. 14, supervisión humana efectiva
- [ ] **Formación operadores** - Personal clínico debe entender limitaciones AI
- [ ] **Procedimientos escalado** - Cuándo derivar a humano

#### Cumplimiento Temporal
- [ ] **Timeline compliance** - EU AI Act entrada vigor gradual 2024-2027
- [ ] **Registro sistemas** - Si clasificado alto riesgo, registro en base de datos UE
- [ ] **Marcado CE** si procede - Evaluación conformidad

### LSSI-CE - Servicios de la Sociedad de la Información

#### Para Sitios Web Generados
- [ ] **Aviso Legal** completo en todos los sitios web generados
- [ ] **Política de Cookies** - Implementación banner cookies
- [ ] **Términos y Condiciones** de uso del sitio web
- [ ] **Información empresa** - Datos identificativos en lugar visible

#### Para la Plataforma Denty
- [ ] **Registro como prestador servicios** si es necesario
- [ ] **Información precontractual** clara en planes de pricing
- [ ] **Derecho de desistimiento** - 14 días para contratos online

### eIDAS - Firmas Digitales

#### Para Consentimientos Digitales
- [ ] **Evaluación necesidad** firma electrónica para consentimientos médicos
- [ ] **Implementación firma simple** - Al menos sello tiempo y trazabilidad IP
- [ ] **Certificados cualificados** si se requiere firma avanzada
- [ ] **Validación firmas** - Proceso verificación integridad

### Accesibilidad Web

#### EU Web Accessibility Directive
- [ ] **Evaluación aplicabilidad** - Verificar si sitios clínica son "organismos públicos"
- [ ] **WCAG 2.1 AA compliance** para sitios web generados
- [ ] **Declaración accesibilidad** si procede
- [ ] **Feedback mechanism** - Mecanismo reclamaciones accesibilidad

### Transferencias Internacionales

#### OpenAI y otros proveedores
- [ ] **Evaluación ubicación datos** - Dónde procesa OpenAI datos europeos
- [ ] **Transfer Impact Assessment** - Análisis riesgo transferencias internacionales
- [ ] **Cláusulas contractuales tipo** - SCCs con proveedores no-UE
- [ ] **Medidas suplementarias** - Cifrado adicional si es necesario

## 🟢 RECOMENDABLE - Mediano plazo

### Comercial y Fiscal

#### Constitución Empresa
- [ ] **Forma jurídica** definitiva - SL recomendable para SaaS
- [ ] **Registro Mercantil** - Inscripción actividades de desarrollo software y salud digital
- [ ] **Número CNAE** apropiado - 6201 (programación) + 8690 (actividades sanitarias)

#### Obligaciones Fiscales
- [ ] **IVA digital services** - Normativa IVA servicios digitales
- [ ] **Facturación electrónica** - Preparación obligatoriedad 2025
- [ ] **Modelo 303/347** - Declaraciones trimestrales IVA
- [ ] **Retenciones profesionales** - IRPF si procede

### Seguros y Responsabilidad

#### Seguros Profesionales
- [ ] **Responsabilidad civil profesional** - Mínimo €600.000 recomendado
- [ ] **Responsabilidad civil producto** - Cobertura fallos software
- [ ] **Ciberseguridad** - Seguro ciberriesgos y protección datos
- [ ] **RC directivos** si procede

### Términos de Servicio para Clínicas

#### Condiciones Contractuales
- [ ] **SLA definido** - Disponibilidad, tiempo respuesta, soporte
- [ ] **Limitaciones responsabilidad** - Exclusiones y límites daños
- [ ] **Fuerza mayor** - COVID, caídas servicios terceros, etc.
- [ ] **Resolución disputas** - Arbitraje o jurisdicción específica

#### Aspectos Técnicos
- [ ] **Backup y recovery** - Garantías recuperación datos
- [ ] **Mantenimiento programado** - Ventanas mantenimiento acordadas
- [ ] **Actualizaciones** - Política cambios funcionalidades
- [ ] **Migración datos** - Proceso exportación al finalizar contrato

### Auditorías y Certificaciones

#### Auditorías Técnicas
- [ ] **Pentesting anual** - Pruebas penetración por tercero independiente
- [ ] **Auditoría código** - Revisión seguridad código fuente
- [ ] **Disaster recovery testing** - Pruebas recuperación periódicas

#### Certificaciones
- [ ] **ISO 27001** - Sistema gestión seguridad información
- [ ] **ISO 13485** - Sistemas calidad productos sanitarios (si procede)
- [ ] **ENS** (Esquema Nacional Seguridad) - Si trabajamos con sector público

### Marketing y Comunicación

#### Publicidad Sanitaria
- [ ] **Ley 29/2006** - Garantías y uso racional medicamentos (publicidad sanitaria)
- [ ] **Colegios profesionales** - Verificar normas deontológicas odontólogos
- [ ] **AUTOCONTROL** - Consideración autorregulación publicitaria

#### Protección Consumidores
- [ ] **Ley General Defensa Consumidores** - Aplicabilidad a servicios B2B2C
- [ ] **Prácticas comerciales desleales** - Evitar publicidad engañosa
- [ ] **Precio transparente** - Información clara pricing y limitaciones

---

## Enlaces Legislativos Relevantes

### Normativa GDPR/Protección Datos
- [RGPD (Reglamento UE 2016/679)](https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:32016R0679)
- [LOPDGDD (Ley Orgánica 3/2018)](https://www.boe.es/eli/es/lo/2018/12/05/3)
- [Ley 41/2002 - Autonomía del paciente](https://www.boe.es/eli/es/l/2002/11/14/41)

### AI y Tecnología
- [EU AI Act (Reglamento UE 2024/1689)](https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:32024R1689)
- [LSSI-CE (Ley 34/2002)](https://www.boe.es/eli/es/l/2002/07/11/34)
- [eIDAS (Reglamento UE 910/2014)](https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:32014R0910)

### Accesibilidad y Web
- [Directiva Accesibilidad Web (UE 2016/2102)](https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:32016L2102)

### Autoridades de Referencia
- [AEPD - Agencia Española Protección Datos](https://www.aepd.es/)
- [Ministerio de Sanidad](https://www.sanidad.gob.es/)
- [Consejo General Dentistas](https://www.consejodentistas.es/)

---

**Última actualización:** Febrero 2025  
**Revisión legal recomendada:** Trimestral

> ⚠️ **Disclaimer:** Este checklist es orientativo. Se recomienda validación por abogado especialista en derecho digital y sanitario antes del lanzamiento.