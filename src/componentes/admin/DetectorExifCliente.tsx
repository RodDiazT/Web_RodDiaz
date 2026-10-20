'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useField } from '@payloadcms/ui'
import exifr from 'exifr'
import { leerExifSeguro } from '../../lib/exif'
import { calcularProporcion } from '../../lib/proporcion'

const LIMITE_60_MB = 60 * 1024 * 1024

function obtenerDimensionesImagen(archivo: File): Promise<{ ancho: number; alto: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(archivo)
    const img = new Image()
    img.onload = () => {
      const ancho = img.naturalWidth || img.width
      const alto = img.naturalHeight || img.height
      URL.revokeObjectURL(url)
      resolve({ ancho, alto })
    }
    img.onerror = (err) => {
      URL.revokeObjectURL(url)
      reject(err)
    }
    img.src = url
  })
}

export const DetectorExifCliente: React.FC = () => {
  const { value: archivo } = useField<File | null>({ path: 'file' })

  const { value: fechaActual, setValue: setFecha } = useField<string>({ path: 'fecha' })
  const { setValue: setNombreOriginal } = useField<string>({ path: 'nombreArchivoOriginal' })
  const { setValue: setDistanciaFocal } = useField<number>({ path: 'datosTecnicos.distanciaFocal' })
  const { setValue: setApertura } = useField<number>({ path: 'datosTecnicos.apertura' })
  const { setValue: setVelocidad } = useField<string>({ path: 'datosTecnicos.velocidad' })
  const { setValue: setIso } = useField<number>({ path: 'datosTecnicos.iso' })

  const { value: proporcionManual } = useField<boolean>({ path: 'proporcion.manual' })
  const { setValue: setProporcionEtiqueta } = useField<string>({ path: 'proporcion.etiqueta' })
  const { setValue: setProporcionValor } = useField<number>({ path: 'proporcion.valor' })
  const { setValue: setProporcionOrientacion } = useField<string>({ path: 'proporcion.orientacion' })

  const ultimoArchivoProcesado = useRef<string | null>(null)
  const [resumenDetectado, setResumenDetectado] = useState<string | null>(null)
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null)

  useEffect(() => {
    if (!archivo || !(archivo instanceof File)) {
      ultimoArchivoProcesado.current = null
      setResumenDetectado(null)
      setErrorArchivo(null)
      return
    }

    const claveArchivo = `${archivo.name}:${archivo.size}:${archivo.lastModified}`
    if (ultimoArchivoProcesado.current === claveArchivo) {
      return
    }
    ultimoArchivoProcesado.current = claveArchivo

    let cancelado = false

    async function analizarArchivo(file: File) {
      setErrorArchivo(null)
      setResumenDetectado(null)

      if (file.size > LIMITE_60_MB) {
        setErrorArchivo('La foto pesa más de 60 MB. Exporta una versión de hasta 60 MB desde Lightroom.')
        return
      }

      setNombreOriginal(file.name)

      const partesResumen: string[] = []

      try {
        const exif = await leerExifSeguro(file)
        if (cancelado) return

        if (exif.fecha && !fechaActual) {
          setFecha(exif.fecha)
          const [anio, mes, dia] = exif.fecha.slice(0, 10).split('-')
          partesResumen.push(`Fecha: ${dia && mes && anio ? `${dia}/${mes}/${anio}` : exif.fecha.slice(0, 10)}`)
        }

        if (exif.datosTecnicos?.distanciaFocal !== undefined) {
          setDistanciaFocal(exif.datosTecnicos.distanciaFocal)
          partesResumen.push(`${exif.datosTecnicos.distanciaFocal} mm`)
        }

        if (exif.datosTecnicos?.apertura !== undefined) {
          setApertura(exif.datosTecnicos.apertura)
          partesResumen.push(`f/${exif.datosTecnicos.apertura}`)
        }

        if (exif.datosTecnicos?.velocidad !== undefined) {
          setVelocidad(exif.datosTecnicos.velocidad)
          partesResumen.push(exif.datosTecnicos.velocidad)
        }

        if (exif.datosTecnicos?.iso !== undefined) {
          setIso(exif.datosTecnicos.iso)
          partesResumen.push(`ISO ${exif.datosTecnicos.iso}`)
        }
      } catch (err) {
        console.warn('[EXIF Cliente] Error leyendo EXIF:', err)
      }

      try {
        const [{ ancho, alto }, orientacionExif] = await Promise.all([
          obtenerDimensionesImagen(file),
          exifr.orientation(file).catch(() => undefined),
        ])
        if (cancelado) return

        // Si la orientación EXIF es 5, 6, 7 u 8 (rotación de 90°/270°), invertir ejes si el navegador no lo hizo
        const rotada90 = orientacionExif && [5, 6, 7, 8].includes(orientacionExif)
        const anchoFinal = ancho
        const altoFinal = alto
        void rotada90

        if (anchoFinal > 0 && altoFinal > 0 && !proporcionManual) {
          const prop = calcularProporcion(anchoFinal, altoFinal, false)
          setProporcionEtiqueta(prop.etiqueta)
          setProporcionValor(prop.valor)
          setProporcionOrientacion(prop.orientacion)
          partesResumen.push(`Proporción ${prop.etiqueta} (${prop.orientacion})`)
        }
      } catch (err) {
        console.warn('[EXIF Cliente] Error calculando proporción:', err)
      }

      if (!cancelado && partesResumen.length > 0) {
        setResumenDetectado(
          `Datos detectados automáticamente de «${file.name}»: ${partesResumen.join(' · ')}`
        )
      }
    }

    analizarArchivo(archivo)

    return () => {
      cancelado = true
    }
  }, [
    archivo,
    fechaActual,
    proporcionManual,
    setApertura,
    setDistanciaFocal,
    setFecha,
    setIso,
    setNombreOriginal,
    setProporcionEtiqueta,
    setProporcionOrientacion,
    setProporcionValor,
    setVelocidad,
  ])

  if (!errorArchivo && !resumenDetectado) return null

  return (
    <div
      style={{
        marginBottom: '1rem',
        padding: '0.75rem 1rem',
        borderRadius: '4px',
        fontSize: '0.875rem',
        backgroundColor: errorArchivo ? 'rgba(180, 40, 40, 0.15)' : 'rgba(201, 168, 106, 0.12)',
        border: errorArchivo
          ? '1px solid rgba(220, 60, 60, 0.45)'
          : '1px solid rgba(201, 168, 106, 0.35)',
        color: errorArchivo ? '#ff9b9b' : '#f2eee8',
      }}
    >
      {errorArchivo || resumenDetectado}
    </div>
  )
}

export default DetectorExifCliente
