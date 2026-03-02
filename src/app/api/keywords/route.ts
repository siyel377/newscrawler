import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 키워드 목록 가져오기
export async function GET() {
    try {
        const { data, error } = await supabase
            .from('keywords')
            .select('*')
            .order('id', { ascending: true });

        if (error) throw error;
        return NextResponse.json({ success: true, keywords: data });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

// 키워드 추가하기
export async function POST(req: NextRequest) {
    try {
        const { name } = await req.json();
        const { data, error } = await supabase
            .from('keywords')
            .insert([{ name }])
            .select();

        if (error) throw error;
        return NextResponse.json({ success: true, keyword: data[0] });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

// 키워드 삭제하기
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) throw new Error('ID가 필요합니다.');

        const { error } = await supabase
            .from('keywords')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
