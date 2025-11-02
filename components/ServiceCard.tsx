import { MapPin, Phone } from 'lucide-react'

import type { Servicio } from '@/lib/supabase'

interface ServiceCardProps {
  servicio: Servicio
}

export default function ServiceCard({ servicio }: ServiceCardProps) {
  const telefonoNormalizado = servicio.telefono.replace(/\D/g, '')
  const mensaje = `Hola ${servicio.servicio_nombre}! Vi tu perfil en el marketplace y necesito un ${servicio.servicio_oficio}.`
  const whatsappHref = `https://wa.me/549${telefonoNormalizado}?text=${encodeURIComponent(mensaje)}`

  return (
    <article
      data-service-id={servicio.servicio_id}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 border-l-4 border-blue-500"
    >
      <div className="mb-3">
        <h3 className="text-xl font-bold text-gray-900 mb-1">
          {servicio.servicio_nombre}
        </h3>
        <p className="text-blue-600 font-semibold text-lg">
          {servicio.servicio_oficio}
        </p>
      </div>

      {servicio.descripcion ? (
        <p className="text-gray-600 text-sm mb-4 whitespace-pre-line">
          {servicio.descripcion}
        </p>
      ) : (
        <p className="text-gray-500 text-sm mb-4 italic">Sin descripción disponible.</p>
      )}

      <div className="flex items-center text-gray-500 text-sm mb-4">
        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
        <span>{servicio.zona}</span>
      </div>

      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
      >
        <Phone className="w-5 h-5" />
        Contactar por WhatsApp
      </a>
    </article>
  )
}
