'use client';

import { useEffect, useState, useTransition } from 'react';
import { Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { addToWatchlist, removeFromWatchlist } from '@/lib/actions/watchlist.actions';
import { cn } from '@/lib/utils';

const WatchlistButton = ({
    symbol,
    company,
    isInWatchlist,
    showTrashIcon = false,
    type = 'button',
    onWatchlistChange,
}: WatchlistButtonProps) => {
    const [added, setAdded] = useState(isInWatchlist);
    const [isPending, startTransition] = useTransition();

    // Keep in sync when the server sends a fresh status after revalidation
    useEffect(() => {
        setAdded(isInWatchlist);
    }, [isInWatchlist]);

    const label = `${added ? 'Remove' : 'Add'} ${company} (${symbol}) ${added ? 'from' : 'to'} watchlist`;

    const handleClick = () => {
        if (isPending) return;

        const next = !added;

        // Optimistic update, reverted if the server action fails
        setAdded(next);
        onWatchlistChange?.(symbol, next);

        startTransition(async () => {
            const result = next ? await addToWatchlist(symbol, company) : await removeFromWatchlist(symbol);

            if (!result.success) {
                setAdded(!next);
                onWatchlistChange?.(symbol, !next);
                toast.error(result.message);
                return;
            }

            toast.success(result.message);
        });
    };

    if (type === 'icon') {
        return (
            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleClick}
                disabled={isPending}
                aria-label={label}
                aria-pressed={added}
                title={label}
                className={cn('watchlist-icon-btn', added && 'watchlist-icon-added')}
            >
                {showTrashIcon && added ? (
                    <Trash2 className="trash-icon" />
                ) : (
                    <Star className={cn('star-icon', added && 'fill-current')} />
                )}
            </Button>
        );
    }

    return (
        <Button
            type="button"
            onClick={handleClick}
            disabled={isPending}
            aria-label={label}
            aria-pressed={added}
            className={cn('watchlist-btn', added && 'watchlist-remove')}
        >
            {added ? 'Remove from Watchlist' : 'Add to Watchlist'}
        </Button>
    );
};

export default WatchlistButton;
