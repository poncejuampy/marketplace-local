'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { MapPin, Search, Sparkles } from 'lucide-react'

import ServiceCard from '@/components/ServiceCard'
import {
  OFICIO_SUGERENCIAS,
  supabase,
  type Servicio,
} from '@/lib/supabase'

const BUSQUEDA_DATALIST_ID = 'oficios-sugeridos-busqueda'

export default function Home() {
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [zonaFiltro, setZonaFiltro] = useState('')
  const [loading, setLoading] = useState(true)
  const [oficiosSugeridos, setOficiosSugeridos] = useState<string[]>(
    OFICIO_SUGERENCIAS,
  )

  useEffect(() => {
    let cancelado = false

    const cargarServicios = async () => {
      setLoading(true)

      try {
        let query = supabase
          .from('servicio')
          .select(
            'servicio_id, servicio_nombre, servicio_oficio, telefono, zona, descripcion, activo, verificado, created_at',
          )
          .eq('activo', true)
          .eq('verificado', true)

        if (busqueda.trim()) {
          query = query.ilike('servicio_oficio', `%${busqueda.trim()}%`)
        }

        if (zonaFiltro.trim()) {
          query = query.ilike('zona', `%${zonaFiltro.trim()}%`)
        }

        const { data, error } = await query.order('created_at', {
          ascending: false,
        })

        if (!cancelado) {
          if (error) {
            console.error('Error al cargar servicios', error)
            setServicios([])
            return
          }

          setServicios(data ?? [])
        }
      } finally {
        if (!cancelado) {
          setLoading(false)
        }
      }
    }

    void cargarServicios()

    return () => {
      cancelado = true
    }
  }, [busqueda, zonaFiltro])

  useEffect(() => {
    let cancelado = false

    const obtenerOficios = async () => {
      const { data, error } = await supabase
        .from('servicio')
        .select('servicio_oficio, verificado')
        .eq('verificado', true)

      if (cancelado || error || !data) {
        if (error) {
          console.warn('No se pudieron cargar sugerencias de oficios', error)
        }
        return
      }

      const dinamicos = data
        .map((item) => item.servicio_oficio?.trim())
        .filter((oficio): oficio is string => Boolean(oficio))

      const unicos = Array.from(
        new Set([...dinamicos, ...OFICIO_SUGERENCIAS]).values(),
      )

      setOficiosSugeridos(unicos.slice(0, 30))
    }

    void obtenerOficios()

    return () => {
      cancelado = true
    }
  }, [])

  const sugerenciasDestacadas = useMemo(
    () => oficiosSugeridos.slice(0, 6),
    [oficiosSugeridos],
  )

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8" />
            <span className="text-sm font-semibold uppercase tracking-wide bg-blue-700 px-3 py-1 rounded-full">
              100% Gratis
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Encontrá Profesionales
            <br className="hidden md:block" /> en Tu Barrio
          </h1>

          <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Electricistas, plomeros, programadores y más.
            <br />
            Contacto directo por WhatsApp. Sin intermediarios.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              type="button"
              onClick={() => {
                const busquedaEl = document.getElementById('busqueda-section')
                busquedaEl?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition"
            >
              Buscar Profesional
            </button>
            <Link
              href="/publicar"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-blue-600 transition text-center"
            >
              Publicar Gratis
            </Link>
          </div>
        </div>
      </section>

      <section id="busqueda-section" className="max-w-7xl mx-auto px-4 -mt-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                list={BUSQUEDA_DATALIST_ID}
                placeholder="¿Qué buscás? (ej: electricista, plomero)"
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <datalist id={BUSQUEDA_DATALIST_ID}>
                {oficiosSugeridos.map((oficio) => (
                  <option key={oficio} value={oficio} />
                ))}
              </datalist>
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Zona (ej: Nueva Córdoba, Centro)"
                value={zonaFiltro}
                onChange={(event) => setZonaFiltro(event.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {sugerenciasDestacadas.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-gray-600 mb-2">
                Sugerencias rápidas
              </p>
              <div className="flex flex-wrap gap-2">
                {sugerenciasDestacadas.map((oficio) => (
                  <button
                    key={oficio}
                    type="button"
                    onClick={() => setBusqueda(oficio)}
                    className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition"
                  >
                    {oficio}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {loading
                ? 'Cargando profesionales...'
                : `${servicios.length} profesionales disponibles`}
            </h2>
            <Link
              href="/publicar"
              className="hidden md:inline-flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Publicar servicio
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto" />
              <p className="text-gray-600 mt-4 text-lg">Cargando profesionales...</p>
            </div>
          ) : servicios.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-md">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No encontramos profesionales
              </h3>
              <p className="text-gray-600 mb-6">
                Probá con otra búsqueda o zona
              </p>
              <button
                type="button"
                onClick={() => {
                  setBusqueda('')
                  setZonaFiltro('')
                }}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servicios.map((servicio) => (
                <ServiceCard key={servicio.servicio_id} servicio={servicio} />
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400">
            Marketplace Local © {new Date().getFullYear()} - Conectando profesionales con clientes
          </p>
        </div>
      </footer>
    </main>
  )
}
