import React from 'react'
import { serializarJsonLdSeguro } from '@/lib/seo/jsonld'

interface JsonLdProps {
  datos: Record<string, any>
}

/**
 * Componente de servidor para emitir datos estructurados JSON-LD (§5.4).
 * Escapa caracteres peligrosos (<, >, &) para prevenir inyecciones de script (§5.5).
 */
export function JsonLd({ datos }: JsonLdProps) {
  if (!datos) return null

  const jsonSeguro = serializarJsonLdSeguro(datos)

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonSeguro }}
    />
  )
}
