'use client';

import { useState, useEffect, useRef } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {Button} from "@base-ui/react";
import {Loader2, TrendingUp} from "lucide-react";
import Link from "next/link";
import {searchStocks} from "@/lib/actions/finnhub.actions";
import {getWatchlistSymbols} from "@/lib/actions/watchlist.actions";
import WatchlistButton from "@/components/WatchlistButton";
import {useDebounce} from "@/hooks/useDebounce";

const SearchCommand = ({ renderAs = 'button', label = 'Add stock', initialStocks }: SearchCommandProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [stocks, setStocks] = useState<StockWithWatchlistStatus[]>(initialStocks);
  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>(
      () => initialStocks.filter((stock) => stock.isInWatchlist).map((stock) => stock.symbol)
  );
  const refreshGeneration = useRef(0);

  const isSearchMode = !!searchTerm.trim();
  const displayStocks = isSearchMode ? stocks : stocks?.slice(0, 10);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Refresh the watchlist status of the listed stocks whenever the dialog opens
  useEffect(() => {
    if (!open) return;

    const currentGeneration = ++refreshGeneration.current;
    getWatchlistSymbols()
        .then((symbols) => {
          if (refreshGeneration.current === currentGeneration) {
            setWatchlistSymbols(symbols);
          }
        })
        .catch(() => {});
  }, [open]);

  const handleSearch = async () => {
    if (!isSearchMode) return setStocks(initialStocks);

    setLoading(true);
    try {
      const response = await searchStocks(searchTerm);
      setStocks(response);
    } catch (error) {
      setStocks([])
    } finally {
      setLoading(false);
    }
  }

  const handleSelectStock = () => {
    setOpen(false);
    setSearchTerm('');
    setStocks(initialStocks);
  };

  const handleWatchlistChange = (symbol: string, isAdded: boolean) => {
    refreshGeneration.current++;
    setWatchlistSymbols((prev) => (isAdded ? [...prev, symbol] : prev.filter((s) => s !== symbol)));
  };

  const debouncedSearch = useDebounce((handleSearch), 300);

  useEffect(() => {
    debouncedSearch();
  }, [searchTerm]);

  return (
      <>
        {renderAs === 'text' ? (
          <span
              role="button"
              tabIndex={0}
              onClick={() => setOpen(true)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setOpen(true); }}
              className="search-text"
          >
            {label}
          </span>
        ): (
            <Button onClick={() => setOpen(true)} className="search-btn">
              {label}
            </Button>
        )}
      <CommandDialog open={open} onOpenChange={setOpen} className='search-dialog'>
        <div className='search-field'>
          <CommandInput
              placeholder="Search stocks..."
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="search-input"
          />
          {loading && <Loader2 className="search-loader"  />}
        </div>
        <CommandList className='search-list'>
          {loading ? (
              <CommandEmpty className="search-list-empty">Loading stocks...</CommandEmpty>
          ): displayStocks?.length === 0 ? (
              <div className='search-list-indicator'>
                {isSearchMode ? 'No results found.' : 'No stocks available..'}
              </div>
          ) : (
              <ul>
                <div className='search-count'>
                  {isSearchMode ? 'Search results' : 'Popular stocks'}
                  {' '}({displayStocks?.length || 0})
                </div>
                {displayStocks?.map((stock) => (
                    <li key={stock.symbol} className='search-item flex items-center gap-2'>
                      <Link
                          href={`/stocks/${stock.symbol}`}
                          onClick={handleSelectStock}
                          className='search-item-link'
                      >
                        <TrendingUp className='h-4 w-4 text-gray-500' />
                        <div className='flex-1'>
                          <div className='search-ite-name'>
                            {stock.name}
                          </div>
                          <div className='text-sm text-gray-500'>
                            {stock.symbol} | {stock.exchange} | {stock.type}
                          </div>
                        </div>
                      </Link>
                      <WatchlistButton
                          symbol={stock.symbol}
                          company={stock.name}
                          isInWatchlist={watchlistSymbols.includes(stock.symbol)}
                          type='icon'
                          onWatchlistChange={handleWatchlistChange}
                      />
                    </li>
                  ))}
              </ul>
              )
          }
        </CommandList>
      </CommandDialog>
      </>
  );
};

export default SearchCommand;
