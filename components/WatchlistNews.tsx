import { formatTimeAgo } from '@/lib/utils';

const isValidUrl = (url: string): boolean => {
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
};

const WatchlistNews = ({ news }: WatchlistNewsProps) => {
    if (!news || news.length === 0) {
        return <p className="empty-description">No recent news for your watchlist.</p>;
    }

    return (
        <div className="watchlist-news">
            {news.map((article) => {
                if (!isValidUrl(article.url)) return null;
                return (
                    <a
                        key={article.id}
                        href={article.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="news-item flex flex-col"
                    >
                        {article.related && <span className="news-tag">{article.related}</span>}
                        <h3 className="news-title">{article.headline}</h3>
                        <div className="news-meta">
                            {article.source} • {formatTimeAgo(article.datetime)}
                        </div>
                        <p className="news-summary">{article.summary}</p>
                        <span className="news-cta">Read more</span>
                    </a>
                );
            })}
        </div>
    );
};

export default WatchlistNews;
