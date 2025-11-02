import { createClient } from '@supabase/supabase-js'

export interface Servicio {
	servicio_id: string
	servicio_nombre: string
	servicio_oficio: string
	telefono: string
	zona: string
	descripcion: string | null
	activo: boolean
	created_at: string
}

export const OFICIO_SUGERENCIAS: string[] = [
	'Electricista',
	'Plomero',
	'Gasista',
	'Pintor',
	'Albañil',
	'Cerrajero',
	'Carpintero',
	'Programador',
	'Diseñador gráfico',
	'Jardinero',
	'Niñera',
	'Contador',
	'Mecánico',
	'Peluquero',
]

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)
