'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, ArrowLeft, Check } from 'lucide-react'

import { OFICIO_SUGERENCIAS, supabase } from '@/lib/supabase'

const OFICIO_DATALIST_ID = 'oficios-sugeridos-form'

export default function Publicar() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [oficiosSugeridos, setOficiosSugeridos] = useState<string[]>(
    OFICIO_SUGERENCIAS,
  )

  useEffect(() => {
    let cancelado = false

    const obtenerOficios = async () => {
      const { data, error: sugerenciasError } = await supabase
        .from('servicio')
        .select('servicio_oficio')

      if (cancelado || sugerenciasError || !data) {
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(event.currentTarget)
    const servicioNombre = String(formData.get('nombre') ?? '').trim()
    const servicioOficio = String(formData.get('oficio') ?? '').trim()
    const telefono = String(formData.get('telefono') ?? '').trim()
    const zona = String(formData.get('zona') ?? '').trim()
    const descripcion = String(formData.get('descripcion') ?? '').trim()

    try {
      const { error: insertError } = await supabase.from('servicio').insert({
        servicio_nombre: servicioNombre,
        servicio_oficio: servicioOficio,
        telefono,
        zona,
        descripcion: descripcion.length > 0 ? descripcion : null,
      })

      if (insertError) {
        console.error('Error al publicar servicio', insertError)
        setError('Error al publicar. Intentá de nuevo.')
        return
      }

      setSuccess(true)
      setTimeout(() => router.push('/'), 2000)
      return
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Publicado con Éxito!
          </h2>
          <p className="text-gray-600">Tu servicio ya está visible. Redirigiendo...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <button
          type="button"
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Publicá tu Servicio</h1>
          <p className="text-gray-600 mb-8">Es gratis y tardás menos de 2 minutos</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tu Nombre *
              </label>
              <input
                type="text"
                name="nombre"
                required
                placeholder="Juan Pérez"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Oficio / Profesión *
              </label>
              <input
                type="text"
                name="oficio"
                required
                placeholder="Electricista, Plomero, Programador..."
                list={OFICIO_DATALIST_ID}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <datalist id={OFICIO_DATALIST_ID}>
                {oficiosSugeridos.map((oficio) => (
                  <option key={oficio} value={oficio} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp / Teléfono *
              </label>
              <input
                type="tel"
                name="telefono"
                required
                placeholder="351-123-4567"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Usaremos este número para que te contacten por WhatsApp
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zona donde trabajás *
              </label>
              <input
                type="text"
                name="zona"
                required
                placeholder="Nueva Córdoba, Centro, Cerro..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción (opcional)
              </label>
              <textarea
                name="descripcion"
                rows={4}
                placeholder="Contá qué hacés, tu experiencia, horarios..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Publicando...' : 'Publicar Servicio Gratis'}
            </button>

            <p className="text-xs text-gray-500 text-center">
              Al publicar, aceptás nuestros términos de uso
            </p>
          </form>
        </div>
      </div>
    </main>
  )
}
