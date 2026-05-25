import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/test/', '/tools/aios/', '/sign-in/', '/sign-up/', '/sso-callback/'],
    },
    sitemap: 'https://aincarn.com/sitemap.xml',
  }
}
