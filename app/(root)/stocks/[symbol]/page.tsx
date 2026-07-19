import TradingViewWidget from '@/components/TradingViewWidget';
import WatchlistButton from '@/components/WatchlistButton';
import {
    BASELINE_WIDGET_CONFIG,
    CANDLE_CHART_WIDGET_CONFIG,
    COMPANY_FINANCIALS_WIDGET_CONFIG,
    COMPANY_PROFILE_WIDGET_CONFIG,
    SYMBOL_INFO_WIDGET_CONFIG,
    TECHNICAL_ANALYSIS_WIDGET_CONFIG,
} from '@/lib/constants';

const StockDetails = async ({ params }: StockDetailsPageProps) => {
    const { symbol } = await params;
    const scriptUrl = 'https://s3.tradingview.com/external-embedding/embed-widget-';

    return (
        <main className="flex min-h-screen flex-col">
            <div className="stock-details-container grid">
                <section className="space-y-6 xl:col-span-2">
                    <TradingViewWidget
                        scriptUrl={`${scriptUrl}symbol-info.js`}
                        config={SYMBOL_INFO_WIDGET_CONFIG(symbol)}
                        height={170}
                    />
                    <TradingViewWidget
                        scriptUrl={`${scriptUrl}advanced-chart.js`}
                        config={CANDLE_CHART_WIDGET_CONFIG(symbol)}
                        height={600}
                    />
                    <TradingViewWidget
                        scriptUrl={`${scriptUrl}advanced-chart.js`}
                        config={BASELINE_WIDGET_CONFIG(symbol)}
                        height={600}
                    />
                </section>

                <section className="space-y-6 xl:col-span-1">
                    <WatchlistButton
                        symbol={symbol}
                        company={symbol}
                        isInWatchlist={false}
                    />
                    <TradingViewWidget
                        scriptUrl={`${scriptUrl}technical-analysis.js`}
                        config={TECHNICAL_ANALYSIS_WIDGET_CONFIG(symbol)}
                        height={400}
                    />
                    <TradingViewWidget
                        scriptUrl={`${scriptUrl}symbol-profile.js`}
                        config={COMPANY_PROFILE_WIDGET_CONFIG(symbol)}
                        height={440}
                    />
                    <TradingViewWidget
                        scriptUrl={`${scriptUrl}financials.js`}
                        config={COMPANY_FINANCIALS_WIDGET_CONFIG(symbol)}
                        height={464}
                    />
                </section>
            </div>
        </main>
    );
};

export default StockDetails;