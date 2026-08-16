import Link from 'next/link';
import WatchlistButton from '@/components/WatchlistButton';
import { WATCHLIST_TABLE_HEADER } from '@/lib/constants';
import { cn, getChangeColorClass } from '@/lib/utils';

// Price alerts are not part of the watchlist feature yet
const TABLE_HEADER = WATCHLIST_TABLE_HEADER.filter((header) => header !== 'Alert');

const WatchlistTable = ({ watchlist }: WatchlistTableProps) => (
    <div className="watchlist-table overflow-x-auto">
        <table className="w-full text-left">
            <thead>
                <tr className="table-header-row">
                    {TABLE_HEADER.map((header) => (
                        <th key={header} className="table-header px-4 py-3 text-sm whitespace-nowrap">
                            {header}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {watchlist.map((stock) => (
                    <tr key={stock.symbol} className="table-row last:border-b-0">
                        <td className="table-cell px-4 py-3">
                            <Link href={`/stocks/${stock.symbol}`} className="hover:text-yellow-500 transition-colors">
                                {stock.company}
                            </Link>
                        </td>
                        <td className="table-cell px-4 py-3 text-gray-400">{stock.symbol}</td>
                        <td className="table-cell px-4 py-3">{stock.priceFormatted || 'N/A'}</td>
                        <td className={cn('table-cell px-4 py-3', getChangeColorClass(stock.changePercent))}>
                            {stock.changeFormatted || 'N/A'}
                        </td>
                        <td className="table-cell px-4 py-3">{stock.marketCap || 'N/A'}</td>
                        <td className="table-cell px-4 py-3">{stock.peRatio || 'N/A'}</td>
                        <td className="table-cell px-4 py-3">
                            <WatchlistButton
                                symbol={stock.symbol}
                                company={stock.company}
                                isInWatchlist
                                showTrashIcon
                                type="icon"
                            />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export default WatchlistTable;
