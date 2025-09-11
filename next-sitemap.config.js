/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.edusmart.pro.vn',
  generateRobotsTxt: true,
  generateIndexSitemaps: true,
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 5000,
  exclude: [
    '/admin*',
    '/auth*',
    '/_next*',
  ],
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: ['/admin', '/auth'] },
    ],
    additionalSitemaps: [
      'https://www.edusmart.pro.vn/sitemap.xml',
    ],
  },
};
