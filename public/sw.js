// Service Worker for PWA
const CACHE_NAME = 'practice-tracker-v1'
// 从 Service Worker 的路径推断 base path
const BASE_PATH = self.location.pathname.replace('/sw.js', '') || '/train-myself/'

// 安装 Service Worker - 不预缓存，使用按需缓存策略
self.addEventListener('install', (event) => {
  // 跳过等待，立即激活新的 Service Worker
  self.skipWaiting()
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker installed, cache opened')
      // 不预缓存任何资源，所有资源按需缓存
      return Promise.resolve()
    })
  )
})

// 拦截请求，使用缓存
self.addEventListener('fetch', (event) => {
  // 只处理同源请求
  if (!event.request.url.startsWith(self.location.origin)) {
    return
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 如果在缓存中找到，返回缓存版本
        if (response) {
          return response
        }
        
        // 否则从网络获取
        return fetch(event.request)
          .then((response) => {
            // 检查响应是否有效
            if (!response || response.status !== 200) {
              return response
            }
            
            // 只缓存 GET 请求
            if (event.request.method !== 'GET') {
              return response
            }
            
            // 克隆响应用于缓存
            const responseToCache = response.clone()
            
            // 异步缓存，不阻塞响应
            caches.open(CACHE_NAME).then((cache) => {
              try {
                cache.put(event.request, responseToCache)
              } catch (error) {
                console.warn('Failed to cache:', event.request.url, error)
              }
            })
            
            return response
          })
          .catch((error) => {
            console.error('Fetch failed:', event.request.url, error)
            // 如果网络请求失败，尝试返回缓存的 index.html（对于导航请求）
            if (event.request.mode === 'navigate') {
              return caches.match(`${BASE_PATH}index.html`)
            }
            throw error
          })
      })
  )
})

// 激活 Service Worker，清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // 清理旧缓存
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }),
      // 立即控制所有客户端
      self.clients.claim()
    ])
  )
})
