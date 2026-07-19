import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const WatchlistButton = ({ symbol, company, isInWatchlist }: WatchlistButtonProps) => (
    <Button
        type="button"
        aria-label={`${isInWatchlist ? 'Remove' : 'Add'} ${company} (${symbol}) ${isInWatchlist ? 'from' : 'to'} watchlist`}
        aria-pressed={isInWatchlist}
        className={cn('watchlist-btn', isInWatchlist && 'watchlist-remove')}
    >
        {isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
    </Button>
);

export default WatchlistButton;