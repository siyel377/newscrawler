import axios from 'axios';

export async function sendLarkMessage(articles: any[]) {
    const webhookUrl = process.env.LARK_WEBHOOK_URL;
    if (!webhookUrl || articles.length === 0) return;

    const content = articles.map(a => `• [${a.source}] ${a.title}\n  ${a.link}`).join('\n\n');

    const message = {
        msg_type: 'post',
        content: {
            post: {
                ko_kr: {
                    title: `📢 오늘의 뉴스 리포트 (${articles.length}건)`,
                    content: [
                        [{ tag: 'text', text: content }]
                    ]
                }
            }
        }
    };

    try {
        await axios.post(webhookUrl, message);
    } catch (error) {
        console.error('Lark Webhook Error:', error);
    }
}
