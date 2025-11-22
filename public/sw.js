// Service Worker for PWA
const CACHE_NAME = 'practice-tracker-v1'
// 从 Service Worker 的路径推断 base path
const BASE_PATH = self.location.pathname.replace('/sw.js', '') || '/train-myself/'

// 安装 Service Worker - 使用更灵活的缓存策略
self.addEventListener('install', (event) => {
  // 跳过等待，立即激活新的 Service Worker
  self.skipWaiting()
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache')
        // 只缓存基本文件，其他资源按需缓存
        const essentialFiles = [
          `${BASE_PATH}index.html`,
          `${BASE_PATH}manifest.json`
        ]
        
        // 尝试缓存基本文件，失败也不阻止安装
        return Promise.allSettled(
          essentialFiles.map(url => 
            cache.add(url).catch(err => {
              console.warn(`Failed to cache ${url}:`, err)
              return null
            })
          )
        )
      })
  )
})

// 拦截请求，使用缓存
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 如果在缓存中找到，返回缓存版本
        if (response) {
          return response
        }
        // 否则从网络获取
        return fetch(event.request).then((response) => {
          // 检查响应是否有效
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response
          }
          // 克隆响应
          const responseToCache = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })
          return response
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

