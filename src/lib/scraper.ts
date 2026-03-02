import axios from 'axios';
import * as cheerio from 'cheerio';

export interface NewsArticle {
  title: string;
  link: string;
  source: string;
  pub_date: string;
}

export async function fetchNaverNews(keyword: string): Promise<NewsArticle[]> {
  try {
    const searchUrl = `https://search.naver.com/search.naver?where=news&query=${encodeURIComponent(keyword)}&sm=tab_opt&sort=1`; // 최신순
    const { data } = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(data);
    const articles: NewsArticle[] = [];

    $('.news_wrap').each((_, element) => {
      const title = $(element).find('.news_tit').text().trim();
      const link = $(element).find('.news_tit').attr('href') || '';
      const source = $(element).find('.info.press').text().trim();
      const pubDate = $(element).find('.info_group').find('span:last-child').text().trim();

      if (title && link) {
        articles.push({ title, link, source, pub_date: pubDate });
      }
    });

    return articles;
  } catch (error) {
    console.error('Naver News Fetch Error:', error);
    return [];
  }
}

export async function fetchGoogleNews(keyword: string): Promise<NewsArticle[]> {
  try {
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(keyword)}&hl=ko&gl=KR&ceid=KR:ko`;
    const { data } = await axios.get(rssUrl);

    const $ = cheerio.load(data, { xmlMode: true });
    const articles: NewsArticle[] = [];

    $('item').each((_, element) => {
      const title = $(element).find('title').text().trim();
      const link = $(element).find('link').text().trim();
      const source = $(element).find('source').text().trim();
      const pubDate = $(element).find('pubDate').text().trim();

      if (title && link) {
        articles.push({ title, link, source, pub_date: pubDate });
      }
    });

    return articles;
  } catch (error) {
    console.error('Google News Fetch Error:', error);
    return [];
  }
}
