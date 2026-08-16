import { Star } from 'lucide-react';
import SearchCommand from '@/components/SearchCommand';
import WatchlistNews from '@/components/WatchlistNews';
import WatchlistTable from '@/components/WatchlistTable';
import { getNews, searchStocks } from '@/lib/actions/finnhub.actions';
import { getWatchlistWithData } from '@/lib/actions/watchlist.actions';

const Watchlist = async () => {
    const watchlist = await getWatchlistWithData();
    const symbols = watchlist.map((item) => item.symbol);

    const [popularStocks, news] = await Promise.all([
        searchStocks(),
        symbols.length > 0 ? getNews(symbols).catch(() => []) : Promise.resolve<MarketNewsArticle[]>([]),
    ]);

    const initialStocks = popularStocks.map((stock) => ({
        ...stock,
        isInWatchlist: symbols.includes(stock.symbol),
    }));

    if (watchlist.length === 0) {
        return (
            <section className="watchlist-empty-container flex">
                <div className="watchlist-empty">
                    <Star className="watchlist-star" />
                    <h2 className="empty-title">Your watchlist is empty</h2>
                    <p className="empty-description">
                        Search for a company and add it to your watchlist to follow its price, market cap and latest
                        news in one place.
                    </p>
                    <SearchCommand renderAs="button" label="Add stock" initialStocks={initialStocks} />
                </div>
            </section>
        );
    }

    return (
        <div className="flex min-h-screen flex-col gap-10">
            <section className="watchlist space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <h2 className="watchlist-title">Watchlist</h2>
                    <SearchCommand renderAs="button" label="Add stock" initialStocks={initialStocks} />
                </div>
                <WatchlistTable watchlist={watchlist} />
            </section>

            <section className="space-y-6">
                <h2 className="watchlist-title">Watchlist News</h2>
                <WatchlistNews news={news} />
            </section>
        </div>
    );
};

export default Watchlist;
