import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from '@/components/ui/sonner'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Head>
        <title>HiMonacci - Stable Crypto Profits Without the Hype</title>
        <meta name="description" content="Premium automated trading system delivering 12-18% monthly returns through advanced pattern recognition and risk management. No hype, just results." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keywords" content="crypto trading, automated trading, bitcoin, ethereum, trading bot, cryptocurrency, stable profits" />
        <meta name="author" content="HiMonacci Team" />
        <meta property="og:title" content="HiMonacci - Stable Crypto Profits Without the Hype" />
        <meta property="og:description" content="Premium automated trading system delivering 12-18% monthly returns through advanced pattern recognition and risk management." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://himonacci.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="HiMonacci - Stable Crypto Profits Without the Hype" />
        <meta name="twitter:description" content="Premium automated trading system delivering 12-18% monthly returns through advanced pattern recognition and risk management." />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Head>
      <Component {...pageProps} />
      <Toaster />
    </AuthProvider>
  )
}
