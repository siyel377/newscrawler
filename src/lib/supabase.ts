import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Vercel 빌드 타임에 환경 변수가 없을 경우 에러 방지
const isConfigured = supabaseUrl && supabaseUrl.startsWith('http');

export const supabase = isConfigured
    ? createClient(supabaseUrl, supabaseAnonKey)
    : (null as any); // 설정되지 않았을 때는 null 또는 프록시 처리
