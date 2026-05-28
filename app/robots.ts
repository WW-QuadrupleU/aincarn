import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/test/',
        '/tools/aios/',
        '/tools/ai-subscription/',
        '/sign-in/',
        '/sign-up/',
        '/sso-callback/',
        '/login/',
        '/signup/',
      ],
    },
    sitemap: 'https://aincarn.com/sitemap.xml',
  }
}
