'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { connectToDatabase } from '@/database/mongoose';
import { Watchlist } from '@/database/models/watchlist.model';
import { getAuth } from '@/lib/better-auth/auth';
import { getStockMarketData } from '@/lib/actions/finnhub.actions';
import { formatChangePercent, formatPrice } from '@/lib/utils';

async function getCurrentUserId(): Promise<string | null> {
    // Read outside of the try/catch so Next.js can opt the route into dynamic rendering
    const requestHeaders = await headers();

    try {
        const auth = await getAuth();

        const session = await auth.api.getSession({ headers: requestHeaders });
        return session?.user?.id || null;
    } catch (err) {
        console.error('getCurrentUserId error:', err);
        return null;
    }
}

const normalizeSymbol = (symbol: string) => (symbol || '').trim().toUpperCase();

export async function getWatchlistSymbolsByEmail(email: string): Promise<string[]> {
    if (!email) return [];

    try {
        const mongoose = await connectToDatabase();
        const db = mongoose.connection.db;
        if (!db) throw new Error('MongoDB connection not found');

        // Better Auth stores users in the "user" collection
        const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string }>({ email });

        if (!user) return [];

        const userId = (user.id as string) || String(user._id || '');
        if (!userId) return [];

        const items = await Watchlist.find({ userId }, { symbol: 1 }).lean();
        return items.map((i) => String(i.symbol));
    } catch (err) {
        console.error('getWatchlistSymbolsByEmail error:', err);
        return [];
    }
}

// Symbols saved by the currently signed-in user
export async function getWatchlistSymbols(): Promise<string[]> {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    try {
        await connectToDatabase();

        const items = await Watchlist.find({ userId }, { symbol: 1 }).lean();
        return items.map((i) => String(i.symbol));
    } catch (err) {
        console.error('getWatchlistSymbols error:', err);
        return [];
    }
}

export async function isInWatchlist(symbol: string): Promise<boolean> {
    const upper = normalizeSymbol(symbol);
    if (!upper) return false;

    const userId = await getCurrentUserId();
    if (!userId) return false;

    try {
        await connectToDatabase();

        const item = await Watchlist.exists({ userId, symbol: upper });
        return Boolean(item);
    } catch (err) {
        console.error('isInWatchlist error:', err);
        return false;
    }
}

// Raw watchlist items of the signed-in user, newest first
export async function getWatchlist(): Promise<StockWithData[]> {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    try {
        await connectToDatabase();

        const items = await Watchlist.find({ userId }).sort({ addedAt: -1 }).lean();

        return items.map((item) => ({
            userId: String(item.userId),
            symbol: String(item.symbol),
            company: String(item.company),
            addedAt: new Date(item.addedAt),
        }));
    } catch (err) {
        console.error('getWatchlist error:', err);
        return [];
    }
}

// Watchlist items enriched with live market data for the watchlist table
export async function getWatchlistWithData(): Promise<StockWithData[]> {
    const items = await getWatchlist();
    if (items.length === 0) return [];

    return Promise.all(
        items.map(async (item) => {
            const data = await getStockMarketData(item.symbol);

            return {
                ...item,
                company: item.company || data.company || item.symbol,
                currentPrice: data.currentPrice,
                changePercent: data.changePercent,
                priceFormatted: typeof data.currentPrice === 'number' ? formatPrice(data.currentPrice) : 'N/A',
                changeFormatted: formatChangePercent(data.changePercent) || 'N/A',
                marketCap: data.marketCap || 'N/A',
                peRatio: data.peRatio || 'N/A',
            };
        })
    );
}

export async function addToWatchlist(symbol: string, company: string): Promise<WatchlistActionResult> {
    const upper = normalizeSymbol(symbol);

    if (!upper) {
        return { success: false, message: 'A stock symbol is required', isInWatchlist: false };
    }

    const userId = await getCurrentUserId();
    if (!userId) {
        return { success: false, message: 'You must be signed in to update your watchlist', isInWatchlist: false };
    }

    try {
        await connectToDatabase();

        await Watchlist.updateOne(
            { userId, symbol: upper },
            { $setOnInsert: { userId, symbol: upper, company: company?.trim() || upper, addedAt: new Date() } },
            { upsert: true }
        );

        revalidatePath('/watchlist');
        revalidatePath(`/stocks/${upper}`);

        return { success: true, message: `${upper} added to your watchlist`, isInWatchlist: true };
    } catch (err) {
        console.error('addToWatchlist error:', err);
        return { success: false, message: `Failed to add ${upper} to your watchlist`, isInWatchlist: false };
    }
}

export async function removeFromWatchlist(symbol: string): Promise<WatchlistActionResult> {
    const upper = normalizeSymbol(symbol);

    if (!upper) {
        return { success: false, message: 'A stock symbol is required', isInWatchlist: false };
    }

    const userId = await getCurrentUserId();
    if (!userId) {
        return { success: false, message: 'You must be signed in to update your watchlist', isInWatchlist: true };
    }

    try {
        await connectToDatabase();

        await Watchlist.deleteOne({ userId, symbol: upper });

        revalidatePath('/watchlist');
        revalidatePath(`/stocks/${upper}`);

        return { success: true, message: `${upper} removed from your watchlist`, isInWatchlist: false };
    } catch (err) {
        console.error('removeFromWatchlist error:', err);
        return { success: false, message: `Failed to remove ${upper} from your watchlist`, isInWatchlist: true };
    }
}
