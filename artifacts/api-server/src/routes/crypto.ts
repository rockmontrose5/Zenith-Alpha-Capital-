import { Router } from "express";
import { logger } from "../lib/logger";

const router = Router();

let cache: { data: unknown; ts: number } | null = null;
const CACHE_TTL = 60 * 1000; // 1 minute

const COIN_IDS = "bitcoin,ethereum,binancecoin,solana,cardano,ripple,dogecoin,avalanche-2,polkadot,chainlink";

router.get("/prices", async (_req, res) => {
  try {
    if (cache && Date.now() - cache.ts < CACHE_TTL) {
      res.json(cache.data);
      return;
    }

    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${COIN_IDS}&order=market_cap_desc&per_page=10&page=1&sparkline=false`;
    const resp = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!resp.ok) {
      // Return fallback mock prices if API is rate-limited
      const mockPrices = getMockPrices();
      res.json(mockPrices);
      return;
    }

    const raw = await resp.json() as Array<{
      id: string;
      name: string;
      symbol: string;
      current_price: number;
      price_change_percentage_24h: number;
      market_cap: number;
      total_volume: number;
      image: string;
    }>;

    const data = raw.map(c => ({
      id: c.id,
      name: c.name,
      symbol: c.symbol.toUpperCase(),
      currentPrice: c.current_price,
      priceChangePercent24h: c.price_change_percentage_24h ?? 0,
      marketCap: c.market_cap,
      volume24h: c.total_volume,
      image: c.image,
    }));

    cache = { data, ts: Date.now() };
    res.json(data);
  } catch (err) {
    logger.error(err, "Failed to fetch crypto prices");
    res.json(getMockPrices());
  }
});

function getMockPrices() {
  return [
    { id: "bitcoin", name: "Bitcoin", symbol: "BTC", currentPrice: 67420, priceChangePercent24h: 2.34, marketCap: 1325000000000, volume24h: 42000000000, image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png" },
    { id: "ethereum", name: "Ethereum", symbol: "ETH", currentPrice: 3521, priceChangePercent24h: 1.87, marketCap: 423000000000, volume24h: 18000000000, image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png" },
    { id: "binancecoin", name: "BNB", symbol: "BNB", currentPrice: 582, priceChangePercent24h: -0.54, marketCap: 84000000000, volume24h: 2200000000, image: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png" },
    { id: "solana", name: "Solana", symbol: "SOL", currentPrice: 168, priceChangePercent24h: 3.12, marketCap: 78000000000, volume24h: 4100000000, image: "https://assets.coingecko.com/coins/images/4128/large/solana.png" },
    { id: "ripple", name: "XRP", symbol: "XRP", currentPrice: 0.62, priceChangePercent24h: -1.23, marketCap: 34000000000, volume24h: 1800000000, image: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png" },
    { id: "cardano", name: "Cardano", symbol: "ADA", currentPrice: 0.48, priceChangePercent24h: 0.91, marketCap: 17000000000, volume24h: 540000000, image: "https://assets.coingecko.com/coins/images/975/large/cardano.png" },
    { id: "dogecoin", name: "Dogecoin", symbol: "DOGE", currentPrice: 0.17, priceChangePercent24h: 4.56, marketCap: 24000000000, volume24h: 1200000000, image: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png" },
    { id: "avalanche-2", name: "Avalanche", symbol: "AVAX", currentPrice: 38.4, priceChangePercent24h: -2.11, marketCap: 15700000000, volume24h: 710000000, image: "https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png" },
  ];
}

export default router;
