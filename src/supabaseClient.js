import { createClient } from '@supabase/supabase-js'

// Replace these with the values from your Supabase Dashboard 
// (Project Settings -> API)
const supabaseUrl = 'https://xsiuhtdhdwelvctyvtet.supabase.co'
const supabaseKey = 'sb_publishable_svP88mo41lAyZFDBcbeH5Q_MB3FcUwk'

export const supabase = createClient(supabaseUrl, supabaseKey)