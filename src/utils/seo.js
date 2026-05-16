const DEFAULT_SITE_URL = 'https://so-quy.vercel.app'
const APP_NAME = 'Sổ quỹ'
const DEFAULT_DESCRIPTION =
  'Sổ quỹ giúp theo dõi thu chi, lợi nhuận, giao dịch và báo cáo tài chính cho cửa hàng nhỏ hoặc tài chính cá nhân.'
const DEFAULT_KEYWORDS = [
  'sổ quỹ',
  'quản lý tài chính',
  'quản lý thu chi',
  'theo dõi giao dịch',
  'báo cáo tài chính',
  'quản lý chi tiêu',
]

function normalizeSiteUrl(value) {
  if (!value) return DEFAULT_SITE_URL

  const withProtocol = value.startsWith('http') ? value : `https://${value}`
  return withProtocol.replace(/\/$/, '')
}

function getSiteUrl() {
  return normalizeSiteUrl(import.meta.env.VITE_SITE_URL)
}

function ensureMeta(selector, attributes) {
  let element = document.head.querySelector(selector)

  if (!element) {
    element = document.createElement('meta')
    document.head.appendChild(element)
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value)
  })
}

function ensureLink(selector, attributes) {
  let element = document.head.querySelector(selector)

  if (!element) {
    element = document.createElement('link')
    document.head.appendChild(element)
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value)
  })
}

export function buildPageTitle(title) {
  return title ? `${title} - ${APP_NAME}` : APP_NAME
}

export function applySeo(to) {
  const siteUrl = getSiteUrl()
  const path = to.path === '/' ? '/' : to.path.replace(/\/$/, '')
  const canonicalUrl = `${siteUrl}${path}`
  const title = buildPageTitle(to.meta.title)
  const description = to.meta.description || DEFAULT_DESCRIPTION
  const robots = to.meta.robots || 'index,follow'
  const image = `${siteUrl}/og-image.svg`

  document.title = title

  ensureMeta('meta[name="description"]', { name: 'description', content: description })
  ensureMeta('meta[name="keywords"]', { name: 'keywords', content: DEFAULT_KEYWORDS.join(', ') })
  ensureMeta('meta[name="robots"]', { name: 'robots', content: robots })
  ensureMeta('meta[name="theme-color"]', { name: 'theme-color', content: '#0f766e' })

  ensureLink('link[rel="canonical"]', { rel: 'canonical', href: canonicalUrl })

  ensureMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' })
  ensureMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: APP_NAME })
  ensureMeta('meta[property="og:title"]', { property: 'og:title', content: title })
  ensureMeta('meta[property="og:description"]', { property: 'og:description', content: description })
  ensureMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl })
  ensureMeta('meta[property="og:image"]', { property: 'og:image', content: image })
  ensureMeta('meta[property="og:image:alt"]', {
    property: 'og:image:alt',
    content: 'Giao diện Sổ quỹ quản lý thu chi và báo cáo tài chính',
  })
  ensureMeta('meta[property="og:locale"]', { property: 'og:locale', content: 'vi_VN' })

  ensureMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' })
  ensureMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title })
  ensureMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description })
  ensureMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: image })
}

export const seoDefaults = {
  appName: APP_NAME,
  description: DEFAULT_DESCRIPTION,
}
