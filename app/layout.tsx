import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ClerkAuthProvider from '@/components/ClerkAuthProvider'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT

export const metadata: Metadata = {
  title: {
    default: 'Aincarn | AIモデル・料金・サブスクを比較する実用ツール',
    template: '%s | Aincarn',
  },
  description:
    'Aincarnは、AIモデルの性能、AI料金、サブスク管理を用途別に整理する比較サイトです。公開ベンチマーク、公式料金、比較ログを分けて、AI選びを判断しやすくします。',
  metadataBase: new URL('https://aincarn.com'),
  openGraph: {
    siteName: 'Aincarn',
    locale: 'ja_JP',
    type: 'website',
    images: [
      {
        url: '/images/og.jpg',
        width: 1200,
        height: 630,
        alt: 'Aincarn | AIモデル・料金・サブスクを比較する実用ツール',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/images/og.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="flex min-h-screen flex-col">
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <span className="ambient-blob left-[-12%] top-[-10%] h-[48vmax] w-[48vmax] bg-[radial-gradient(circle,rgba(99,102,241,0.26),transparent_68%)]" />
          <span className="ambient-blob right-[-14%] top-[-8%] h-[44vmax] w-[44vmax] bg-[radial-gradient(circle,rgba(217,70,239,0.22),transparent_68%)] [animation-delay:-6s] [animation-duration:24s]" />
          <span className="ambient-blob bottom-[-16%] right-[2%] h-[50vmax] w-[50vmax] bg-[radial-gradient(circle,rgba(20,184,166,0.22),transparent_68%)] [animation-delay:-12s] [animation-duration:26s]" />
          <span className="ambient-blob bottom-[-12%] left-[0%] h-[42vmax] w-[42vmax] bg-[radial-gradient(circle,rgba(56,189,248,0.20),transparent_68%)] [animation-delay:-3s] [animation-duration:22s]" />
          <span className="ambient-blob left-[32%] top-[24%] h-[34vmax] w-[34vmax] bg-[radial-gradient(circle,rgba(168,85,247,0.14),transparent_70%)] [animation-delay:-9s] [animation-duration:28s]" />
        </div>
        <div aria-hidden className="grain-overlay pointer-events-none fixed inset-0 -z-10" />
        <ClerkAuthProvider>
          {GA_ID && (
            <>
              <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
              <Script id="google-analytics" strategy="afterInteractive">
                {`
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_ID}');
                `}
              </Script>
            </>
          )}
          {ADSENSE_CLIENT && (
            <Script
              async
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
              crossOrigin="anonymous"
              strategy="afterInteractive"
            />
          )}
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ClerkAuthProvider>
      </body>
    </html>
  )
}
