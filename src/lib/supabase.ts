import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 빌드 타임에는 가짜 URL이라도 넣어 오류를 방지하고, 런타임에는 실제 값을 사용합니다.
const effectiveUrl = supabaseUrl || 'https://placeholder.supabase.co';
const effectiveKey = supabaseAnonKey || 'placeholder';

export const supabase = createClient(effectiveUrl, effectiveKey);

// 실제로 환경 변수가 없는지 확인하기 위한 헬퍼 (API에서 사용)
export const isSupabaseConfigured = !!supabaseUrl && supabaseUrl.startsWith('http');
