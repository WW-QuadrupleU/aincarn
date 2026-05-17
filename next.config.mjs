/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: import.meta.dirname,
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    remotePatterns: [
      // Notion
      { protocol: 'https', hostname: 'www.notion.so' },
      { protocol: 'https', hostname: 'notion.so' },
      { protocol: 'https', hostname: 's3.us-west-2.amazonaws.com' },
      // 楽天（全サブドメイン対応）
      { protocol: 'https', hostname: '**.rakuten.co.jp' },
      { protocol: 'https', hostname: '**.r10s.jp' },
    ],
  },
}

export default nextConfig
