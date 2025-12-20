import { createClient } from '@supabase/supabase-js';

// Atenção: Em produção, use variáveis de ambiente!
const supabaseUrl = 'https://qpdtskajysrwhljwambc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwZHRza2FqeXNyd2hsandhbWJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNjEzMDMsImV4cCI6MjA4MTgzNzMwM30.7Crk4v4Dmy6G-1-1a9-yOotddCC77IfQefchcO7dk2Q';

export const supabase = createClient(supabaseUrl, supabaseKey);
