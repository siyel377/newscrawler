'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, RefreshCw, ExternalLink, AlertCircle } from 'lucide-react';

interface Article {
  id?: number;
  title: string;
  link: string;
  source: string;
  pub_date: string;
}

interface Keyword {
  id: number;
  name: string;
}

export default function Dashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 초기 데이터(키워드, 최신 뉴스) 불러오기
  useEffect(() => {
    fetchKeywords();
    fetchNews();
  }, []);

  const fetchKeywords = async () => {
    try {
      const res = await fetch('/api/keywords');
      const data = await res.json();
      if (data.success) setKeywords(data.keywords);
    } catch (err) {
      console.error('Failed to fetch keywords');
    }
  };

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/news');
      const data = await response.json();
      if (data.success) {
        setArticles(data.articles);
      } else {
        setError('뉴스를 가져오는 중에 문제가 발생했습니다.');
      }
    } catch (err) {
      setError('서버와 통신하는 중에 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const addKeyword = async () => {
    if (newKeyword.trim()) {
      try {
        const res = await fetch('/api/keywords', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newKeyword.trim() }),
        });
        const data = await res.json();
        if (data.success) {
          setKeywords([...keywords, data.keyword]);
          setNewKeyword('');
        }
      } catch (err) {
        setError('키워드 추가 중 오류가 발생했습니다.');
      }
    }
  };

  const removeKeyword = async (id: number) => {
    try {
      const res = await fetch(`/api/keywords?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setKeywords(keywords.filter(k => k.id !== id));
      }
    } catch (err) {
      setError('키워드 삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-6">
      <header className="max-w-4xl mx-auto mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-blue-600">Daily News Crawler</h1>
          <p className="text-gray-500 mt-1">오늘의 주요 소식을 자동으로 수집합니다.</p>
        </div>
        <button
          onClick={fetchNews}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium flex items-center gap-2 hover:bg-blue-700 transition disabled:opacity-50 shadow-lg"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? '수집 중...' : '지금 뉴스 수집'}
        </button>
      </header>

      <main className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* 키워드 관리 섹션 */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-500" />
              키워드 관리
            </h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="새 키워드"
                className="flex-1 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
              />
              <button
                onClick={addKeyword}
                className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {keywords.map((kw) => (
                <div key={kw.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl group transition hover:bg-white hover:shadow-md">
                  <span className="font-medium text-sm">{kw.name}</span>
                  <button onClick={() => removeKeyword(kw.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 뉴스 리스트 섹션 */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[500px]">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-500" />
              수집된 뉴스 ({articles.length})
            </h2>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 mb-4 border border-red-100">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {articles.length === 0 && !loading && !error && (
              <div className="h-64 flex flex-col items-center justify-center text-gray-400 text-center">
                <Search className="w-12 h-12 mb-3 opacity-20" />
                <p>수집 버튼을 눌러 뉴스를 확인해 보세요!<br /><span className="text-xs">데이터베이스 동기화가 필요할 수 있습니다.</span></p>
              </div>
            )}

            <div className="space-y-4">
              {articles.map((article, idx) => (
                <div key={idx} className="border-b border-gray-50 pb-4 last:border-0 hover:bg-blue-50/30 p-2 rounded-xl transition group">
                  <div className="flex justify-between items-start gap-3">
                    <a href={article.link} target="_blank" rel="noopener noreferrer" className="text-md font-semibold text-gray-800 group-hover:text-blue-600 transition leading-tight">
                      {article.title}
                    </a>
                    <ExternalLink className="w-4 h-4 text-gray-300 shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition" />
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold uppercase">{article.source}</span>
                    <span>{article.pub_date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
