import { MetadataRoute } from 'next'
import { headers } from 'next/headers'
 
export default async function robots(): Promise<MetadataRoute.Robots> {
  const headersList = await headers()
  const host = headersList.get('host') || ''
  
  if (host.includes('app.yuktiprep.com')) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yuktiprep.com'
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
