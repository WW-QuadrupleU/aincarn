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
    'Aincarnは、AIモデルの性能、料金、サブスク管理を用途別に整理する比較サイトです。公開ベンチマーク、公式料金、実測予定データを分けて、AI選びを判断しやすくします。',
  metadataBase: new URL('https://aincarn.com'),
  openGraph: {
    siteName: 'Aincarn',
    locale: 'ja_JP',
    type: 'website',
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
