import { NextRequest, NextResponse } from 'next/server';
import { fetchNaverNews, fetchGoogleNews, NewsArticle } from '@/lib/scraper';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        // 1. DB에서 활성화된 키워드 목록 가져오기
        const { data: keywordRows, error: keywordError } = await supabase
            .from('keywords')
            .select('name');

        if (keywordError) throw keywordError;

        const keywords = keywordRows.map((row: { name: string }) => row.name);
        if (keywords.length === 0) {
            return NextResponse.json({ success: true, count: 0, articles: [], message: '등록된 키워드가 없습니다.' });
        }

        // 2. 각 키워드별 뉴스 수집
        const allArticles: NewsArticle[] = [];
        for (const keyword of keywords) {
            const naver = await fetchNaverNews(keyword);
            const google = await fetchGoogleNews(keyword);
            allArticles.push(...naver, ...google);
        }

        // 3. 중복 제거 (링크 기준)
        const uniqueArticles = Array.from(
            new Map(allArticles.map(item => [item.link, item])).values()
        );

        // 4. DB에 저장
        if (uniqueArticles.length > 0) {
            const { error: insertError } = await supabase
                .from('articles')
                .upsert(
                    uniqueArticles.map(a => ({
                        title: a.title,
                        link: a.link,
                        source: a.source,
                        pub_date: a.pub_date,
                    })),
                    { onConflict: 'link' }
                );

            if (insertError) {
                console.error('DB Insert Error:', insertError);
                // 중복 키 오류(23505) 등은 무시하거나 로그만 남김
            }

            // 5. 락(Lark) 알림 전송 (환경 변수가 설정된 경우에만)
            if (process.env.LARK_WEBHOOK_URL) {
                try {
                    const { sendLarkMessage } = await import('@/lib/lark');
                    await sendLarkMessage(uniqueArticles.slice(0, 10));
                } catch (larkError) {
                    console.error('Lark Notfication Skip:', larkError);
                }
            }
        }

        // 5. 최신 수집 결과 반환 (최근 50개만)
        const { data: savedArticles, error: fetchError } = await supabase
            .from('articles')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (fetchError) throw fetchError;

        return NextResponse.json({
            success: true,
            count: savedArticles.length,
            articles: savedArticles
        });
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({
            success: false,
            message: '뉴스를 처리하는 중에 문제가 발생했습니다.',
            detail: error.message
        }, { status: 500 });
    }
}
