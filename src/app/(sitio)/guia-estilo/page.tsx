'use client'

/**
 * Guía de estilo interactiva para el sistema de diseño — Web_RodDiaz (Etapa 3).
 * Especificado en DocumentosTecnicos/identidad/sistema-de-diseno.md (§5.5, §8 Paso 11).
 * Accesible únicamente en entorno de desarrollo; devuelve 404 en producción.
 */

import React, { useState } from 'react'
import { notFound } from 'next/navigation'
import { Boton } from '@/componentes/base/Boton'
import { ChipFiltro } from '@/componentes/base/ChipFiltro'
import { Campo } from '@/componentes/base/Campo'
import { Aviso } from '@/componentes/base/Aviso'
import { Esqueleto } from '@/componentes/base/Esqueleto'
import { MarcoFoto, FotoMarco } from '@/componentes/base/MarcoFoto'
import { Retorno } from '@/componentes/base/Retorno'
import { PlantillaEstado } from '@/componentes/base/PlantillaEstado'
import { NavegacionFotos } from '@/componentes/base/NavegacionFotos'
import { TarjetaColeccion } from '@/componentes/base/TarjetaColeccion'
import { DisposicionFicha } from '@/componentes/base/DisposicionFicha'
import { Visor } from '@/componentes/base/Visor'

// Fotos de muestra para pruebas de proporción, filete y visor
const FOTO_3_2: FotoMarco = {
  titulo: 'Amanecer en Laguna Verde',
  ancho: 2048,
  alto: 1365,
  colorDominante: '#1c242b',
  filete: false,
  url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="1365" viewBox="0 0 2048 1365"><rect width="2048" height="1365" fill="%231c242b"/><circle cx="1024" cy="682" r="300" fill="%233a4d5c"/></svg>',
}

const FOTO_4_5: FotoMarco = {
  titulo: 'Araucaria Centenaria',
  ancho: 1638,
  alto: 2048,
  colorDominante: '#1b261d',
  filete: false,
  url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1638" height="2048" viewBox="0 0 1638 2048"><rect width="1638" height="2048" fill="%231b261d"/><circle cx="819" cy="1024" r="350" fill="%232e4232"/></svg>',
}

const FOTO_NOCTURNA: FotoMarco = {
  titulo: 'Vía Láctea sobre el Lonquimay',
  ancho: 2048,
  alto: 1365,
  colorDominante: '#0d0e11',
  filete: true, // Filete activado para contraste en fondo oscuro
  url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="1365" viewBox="0 0 2048 1365"><rect width="2048" height="1365" fill="%230d0e11"/><circle cx="1024" cy="682" r="100" fill="%23ffffff" fill-opacity="0.1"/></svg>',
}

const FOTO_1_1: FotoMarco = {
  titulo: 'Volcán Llaima en Silencio',
  ancho: 2048,
  alto: 2048,
  colorDominante: '#242426',
  filete: false,
  url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="2048" viewBox="0 0 2048 2048"><rect width="2048" height="2048" fill="%23242426"/><circle cx="1024" cy="1024" r="400" fill="%233a3a40"/></svg>',
}

const FOTO_3_1: FotoMarco = {
  titulo: 'Cordillera de los Andes al Ocaso',
  ancho: 2048,
  alto: 683,
  colorDominante: '#1c1b22',
  filete: false,
  url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="683" viewBox="0 0 2048 683"><rect width="2048" height="683" fill="%231c1b22"/><rect x="400" y="200" width="1248" height="283" fill="%233c364c"/></svg>',
}

const FOTO_ERROR: FotoMarco = {
  titulo: 'Foto inexistente',
  ancho: 2048,
  alto: 1365,
  url: '/ruta-invalida-para-probar-error.jpg',
}

const FOTOS_MUESTRA = [FOTO_3_2, FOTO_4_5, FOTO_1_1, FOTO_3_1, FOTO_NOCTURNA]


export default function PaginaGuiaEstilo() {
  if (process.env.NODE_ENV === 'production') {
    notFound()
  }

  const [cargandoBoton, setCargandoBoton] = useState(false)
  const [visorAbierto, setVisorAbierto] = useState(false)
  const [indiceVisor, setIndiceVisor] = useState(0)

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--esp-8) var(--margen)', display: 'flex', flexDirection: 'column', gap: 'var(--esp-9)' }}>
      <div>
        <span style={{ font: 'var(--texto-sm)', color: 'var(--color-texto-terciario)' }}>
          Sistema de Diseño v1.1
        </span>
        <h1 style={{ font: 'var(--titulo-xl)', margin: 'var(--esp-2) 0' }}>
          Guía de Estilo y Componentes
        </h1>
        <p style={{ font: 'var(--texto-lectura)', color: 'var(--color-texto-secundario)', maxWidth: 'var(--ancho-max-lectura)' }}>
          Catálogo aislado para verificación de tokens tipográficos, paleta grafito neutra, componentes base, accesibilidad AA y comportamiento táctil.
        </p>
      </div>

      {/* 1. Tipografía */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--esp-4)' }}>
        <h2 style={{ font: 'var(--titulo-sm)', borderBottom: '1px solid var(--color-linea)', paddingBottom: 'var(--esp-2)' }}>
          1. Escala Tipográfica
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--esp-3)' }}>
          <div style={{ font: 'var(--titulo-xl)' }}>Título XL · Cormorant Garamond 400 (clamp 40–64px)</div>
          <div style={{ font: 'var(--titulo-lg)' }}>Título LG · Cormorant Garamond 500 (clamp 32–48px)</div>
          <div style={{ font: 'var(--titulo-md)' }}>Título MD · Cormorant Garamond 500 (clamp 28–36px)</div>
          <div style={{ font: 'var(--titulo-sm)' }}>Título SM · Cormorant Garamond 500 (24px)</div>
          <p style={{ font: 'var(--texto-lectura)', maxWidth: 'var(--ancho-max-lectura)' }}>
            Texto de Lectura Editorial · Manrope 400 (17px, interlínea 1.7). Utilizado para historias fotográficas, biografía "Sobre mí" y declaraciones de autor.
          </p>
          <div style={{ font: 'var(--texto-base)' }}>Texto Base · Manrope 400 (16px)</div>
          <div style={{ font: 'var(--texto-sm)' }}>Texto SM · Manrope 400/500 (14px) — Metadatos, botones, navegación</div>
          <div style={{ font: 'var(--texto-xs)', color: 'var(--color-texto-terciario)' }}>Texto XS · Manrope 400 (13px) — Pie de página y leyendas legales</div>
        </div>
      </section>

      {/* 2. Botones */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--esp-4)' }}>
        <h2 style={{ font: 'var(--titulo-sm)', borderBottom: '1px solid var(--color-linea)', paddingBottom: 'var(--esp-2)' }}>
          2. Botones y Llamadas a la Acción
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--esp-4)', alignItems: 'center' }}>
          <Boton variante="primario">Pedir una copia (Primario)</Boton>
          <Boton variante="secundario">Ver todas las fotos (Secundario)</Boton>
          <Boton variante="enlace">Cancelar (Enlace)</Boton>
          <Boton
            variante="primario"
            cargando={cargandoBoton}
            onClick={() => {
              setCargandoBoton(true)
              setTimeout(() => setCargandoBoton(false), 2000)
            }}
          >
            {cargandoBoton ? 'Enviando…' : 'Probar estado de carga'}
          </Boton>
        </div>
      </section>

      {/* 3. Chips de Filtro */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--esp-4)' }}>
        <h2 style={{ font: 'var(--titulo-sm)', borderBottom: '1px solid var(--color-linea)', paddingBottom: 'var(--esp-2)' }}>
          3. Chips de Filtro Transversal
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--esp-2)' }}>
          <ChipFiltro etiqueta="Todas las fotos" href="#chips" activo={true} />
          <ChipFiltro etiqueta="Paisaje" href="#chips" activo={false} />
          <ChipFiltro etiqueta="Blanco y negro" href="#chips" activo={false} />
          <ChipFiltro etiqueta="Nocturnas" href="#chips" activo={false} />
          <ChipFiltro etiqueta="Araucanía" href="#chips" activo={false} />
        </div>
      </section>

      {/* 4. Formularios y Campos */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--esp-4)' }}>
        <h2 style={{ font: 'var(--titulo-sm)', borderBottom: '1px solid var(--color-linea)', paddingBottom: 'var(--esp-2)' }}>
          4. Campos de Formulario
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--esp-5)' }}>
          <Campo nombre="nombre" etiqueta="Tu nombre" placeholder="Ej. Valentina Morales" obligatorio />
          <Campo nombre="correo" tipo="correo" etiqueta="Correo electrónico" placeholder="contacto@ejemplo.com" obligatorio />
          <Campo nombre="telefono" tipo="telefono" etiqueta="Teléfono" ayuda="Para coordinar despacho si es necesario." />
          <Campo
            nombre="formato"
            tipo="seleccion"
            etiqueta="Formato seleccionado"
            placeholder="Selecciona un tamaño"
            opciones={[
              { label: '30 × 45 cm', value: '30x45' },
              { label: '40 × 60 cm', value: '40x60' },
              { label: '50 × 75 cm', value: '50x75' },
            ]}
          />
          <Campo nombre="mensaje" tipo="area" etiqueta="Mensaje o requerimiento particular" placeholder="Cuéntame si buscas enmarcado u otra medida..." />
          <Campo
            nombre="error-demo"
            etiqueta="Campo con error de validación"
            valor="correo_invalido"
            error="Ingresa un correo electrónico válido."
          />
        </div>
        <Campo
          nombre="consentimiento"
          tipo="casilla"
          etiqueta="Acepto ser contactado para responder a esta consulta conforme a la política de privacidad (Ley 21.719)."
          obligatorio
        />
      </section>

      {/* 5. Avisos */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--esp-4)' }}>
        <h2 style={{ font: 'var(--titulo-sm)', borderBottom: '1px solid var(--color-linea)', paddingBottom: 'var(--esp-2)' }}>
          5. Avisos en Línea
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--esp-3)' }}>
          <Aviso tipo="info" titulo="Tiraje de conservación">
            Cada copia incluye un margen blanco perimetral de 2 a 3 cm para firma autógrafa y enmarcado Fine Art.
          </Aviso>
          <Aviso tipo="exito" titulo="Consulta recibida">
            Gracias por tu interés. Te responderé directamente a tu correo a la brevedad.
          </Aviso>
          <Aviso tipo="error" titulo="No pudimos enviar tu mensaje">
            Verifica que todos los campos obligatorios estén completos antes de reintentar.
          </Aviso>
        </div>
      </section>

      {/* 6. Marcos de Foto y Visor */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--esp-4)' }}>
        <h2 style={{ font: 'var(--titulo-sm)', borderBottom: '1px solid var(--color-linea)', paddingBottom: 'var(--esp-2)' }}>
          6. Marcos Fotográficos y Visor a Pantalla Completa
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--esp-5)' }}>
          <div>
            <span style={{ font: 'var(--texto-xs)', color: 'var(--color-texto-terciario)', display: 'block', marginBottom: 'var(--esp-2)' }}>
              Proporción nativa 3:2 (haz clic para abrir Visor)
            </span>
            <MarcoFoto
              foto={FOTO_3_2}
              modo="grilla"
              alAmpliar={() => {
                setIndiceVisor(0)
                setVisorAbierto(true)
              }}
            />
          </div>

          <div>
            <span style={{ font: 'var(--texto-xs)', color: 'var(--color-texto-terciario)', display: 'block', marginBottom: 'var(--esp-2)' }}>
              Vertical 4:5 (Punto focal centrado)
            </span>
            <MarcoFoto
              foto={FOTO_4_5}
              modo="grilla"
              alAmpliar={() => {
                setIndiceVisor(1)
                setVisorAbierto(true)
              }}
            />
          </div>

          <div>
            <span style={{ font: 'var(--texto-xs)', color: 'var(--color-texto-terciario)', display: 'block', marginBottom: 'var(--esp-2)' }}>
              Cuadrada 1:1 (Simetría pura)
            </span>
            <MarcoFoto
              foto={FOTO_1_1}
              modo="grilla"
              alAmpliar={() => {
                setIndiceVisor(2)
                setVisorAbierto(true)
              }}
            />
          </div>

          <div>
            <span style={{ font: 'var(--texto-xs)', color: 'var(--color-texto-terciario)', display: 'block', marginBottom: 'var(--esp-2)' }}>
              Panorámica 3:1 (Gran angular)
            </span>
            <MarcoFoto
              foto={FOTO_3_1}
              modo="grilla"
              alAmpliar={() => {
                setIndiceVisor(3)
                setVisorAbierto(true)
              }}
            />
          </div>

          <div>
            <span style={{ font: 'var(--texto-xs)', color: 'var(--color-texto-terciario)', display: 'block', marginBottom: 'var(--esp-2)' }}>
              Nocturna con Filete sutil activado
            </span>
            <MarcoFoto
              foto={FOTO_NOCTURNA}
              modo="grilla"
              alAmpliar={() => {
                setIndiceVisor(4)
                setVisorAbierto(true)
              }}
            />
          </div>

          <div>
            <span style={{ font: 'var(--texto-xs)', color: 'var(--color-texto-terciario)', display: 'block', marginBottom: 'var(--esp-2)' }}>
              Simulación de error de red
            </span>
            <MarcoFoto foto={FOTO_ERROR} modo="grilla" />
          </div>
        </div>
      </section>


      {/* 7. Navegación y Retorno */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--esp-4)' }}>
        <h2 style={{ font: 'var(--titulo-sm)', borderBottom: '1px solid var(--color-linea)', paddingBottom: 'var(--esp-2)' }}>
          7. Navegación Contextual
        </h2>
        <Retorno etiqueta="Volver a Colección Araucanía" href="#retorno" />
        <NavegacionFotos
          anterior={{ titulo: 'Niebla en el Valle', href: '#ant' }}
          siguiente={{ titulo: 'Crepúsculo en Nahuelbuta', href: '#sig' }}
        />
      </section>

      {/* 8. Tarjetas de Colección */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--esp-4)' }}>
        <h2 style={{ font: 'var(--titulo-sm)', borderBottom: '1px solid var(--color-linea)', paddingBottom: 'var(--esp-2)' }}>
          8. Tarjetas de Directorio de Colección (Ratio 4:5)
        </h2>
        <div style={{ maxWidth: '320px' }}>
          <TarjetaColeccion
            coleccion={{
              nombre: 'Araucanía Andina',
              slug: 'araucania-andina',
              totalFotos: 14,
              portada: FOTO_4_5,
            }}
          />
        </div>
      </section>

      {/* 9. Esqueletos */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--esp-4)' }}>
        <h2 style={{ font: 'var(--titulo-sm)', borderBottom: '1px solid var(--color-linea)', paddingBottom: 'var(--esp-2)' }}>
          9. Esqueletos de Carga sin CLS (sin brillo)
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--esp-5)' }}>
          <div>
            <span style={{ font: 'var(--texto-xs)', color: 'var(--color-texto-terciario)', display: 'block', marginBottom: 'var(--esp-2)' }}>
              Esqueleto foto 3:2
            </span>
            <Esqueleto proporcion="3/2" />
          </div>
          <div>
            <span style={{ font: 'var(--texto-xs)', color: 'var(--color-texto-terciario)', display: 'block', marginBottom: 'var(--esp-2)' }}>
              Esqueleto líneas de texto
            </span>
            <Esqueleto lineas={4} />
          </div>
        </div>
      </section>

      {/* Visor interactivo modal */}
      <Visor
        fotos={FOTOS_MUESTRA}
        indiceInicial={indiceVisor}
        abierto={visorAbierto}
        alCerrar={() => setVisorAbierto(false)}
        accion={<Boton variante="primario">Pedir copia de esta obra</Boton>}
      />
    </div>
  )
}
