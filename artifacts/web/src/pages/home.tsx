import { Link } from "wouter";
import { useGetCryptoPrices } from "@workspace/api-client-react";

export default function Home() {
  const { data: cryptoPrices } = useGetCryptoPrices();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navbar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
            Z
          </div>
          <span className="font-semibold text-xl tracking-tight">Zenith Alpha</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/sign-in" className="text-sm font-medium hover:text-primary transition-colors">
            Sign In
          </Link>
          <Link href="/sign-up" className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
            Get Started
          </Link>
        </div>
      </header>

      {/* Crypto Ticker */}
      <div className="w-full bg-card border-b border-border overflow-hidden whitespace-nowrap py-2 flex items-center">
        <div className="animate-in fade-in slide-in-from-right-full duration-1000 flex gap-8 px-4">
          {cryptoPrices?.map((crypto) => (
            <div key={crypto.symbol} className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-muted-foreground">{crypto.symbol}</span>
              <span>${crypto.currentPrice.toLocaleString()}</span>
              <span className={crypto.priceChangePercent24h >= 0 ? "text-green-500" : "text-red-500"}>
                {crypto.priceChangePercent24h >= 0 ? "+" : ""}{crypto.priceChangePercent24h.toFixed(2)}%
              </span>
            </div>
          ))}
          {!cryptoPrices && (
            <div className="text-sm text-muted-foreground">Loading market data...</div>
          )}
        </div>
      </div>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-24 text-center">
        <div className="max-w-3xl space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">
            Institutional Grade <br/>
            <span className="text-primary">Wealth Management</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Secure, powerful, and precise. Join a private banking portal designed for serious investors who demand performance.
          </p>
          <div className="pt-8">
            <Link href="/sign-up" className="inline-flex items-center justify-center bg-primary text-primary-foreground text-lg font-medium px-8 py-4 rounded-md hover:bg-primary/90 transition-colors shadow-[0_0_30px_-5px_hsl(var(--primary))]">
              Open an Account
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-8 border-t border-border text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Zenith Alpha Capital. All rights reserved.
      </footer>
    </div>
  );
}
