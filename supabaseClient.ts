import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('DEBUG: Loaded Supabase URL:', supabaseUrl);

// Raw Connectivity Test
if (supabaseUrl) {
    console.log('Attempting raw fetch...');
    fetch(supabaseUrl, { method: 'HEAD' })
        .then(res => console.log('DEBUG: Raw Fetch Success:', res.status))
        .catch(err => console.error('DEBUG: Raw Fetch Error:', err));
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
