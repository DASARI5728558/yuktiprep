import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yuktiprep.com'

  const routes = [
    { path: '', changeFrequency: 'yearly', priority: 1 },
    { path: '/how-it-works', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/exams', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/exams/upsc', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/exams/ssc-cgl', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/exams/banking', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/exams/railways', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/exams/state-psc', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/exams/defence', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/study-planner', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/revision-intelligence', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/mock-tests', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/previous-year-questions', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/current-affairs', changeFrequency: 'daily', priority: 0.9 },
    { path: '/mentorship', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/pricing', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/resources', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/about', changeFrequency: 'yearly', priority: 0.6 },
    { path: '/contact', changeFrequency: 'yearly', priority: 0.5 },
    { path: '/trust', changeFrequency: 'yearly', priority: 0.5 },
    { path: '/trust/security', changeFrequency: 'yearly', priority: 0.4 },
    { path: '/trust/ai-transparency', changeFrequency: 'yearly', priority: 0.4 },
    { path: '/trust/privacy', changeFrequency: 'yearly', priority: 0.4 },
    { path: '/privacy-policy', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/terms-of-use', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/refund-policy', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/grievance-redressal', changeFrequency: 'yearly', priority: 0.3 },
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency as "yearly" | "monthly" | "weekly" | "daily" | "always" | "hourly" | "never" | undefined,
    priority: route.priority,
  }));
}
