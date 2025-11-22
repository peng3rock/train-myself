import { createApp } from 'vue'
import App from './App.vue'
import './index.css'

const app = createApp(App)

// 初始化 Capacitor（仅在原生平台）
import('@capacitor/core').then(({ Capacitor }) => {
  if (Capacitor.isNativePlatform()) {
    Promise.all([
      import('@capacitor/status-bar'),
      import('@capacitor/app')
    ]).then(([{ StatusBar, Style }, { App: CapacitorApp }]) => {
      // 设置状态栏样式（iOS）
      StatusBar.setStyle({ style: Style.Light })
      StatusBar.setBackgroundColor({ color: '#667eea' })
      
      // 处理返回按钮（Android）
      CapacitorApp.addListener('backButton', ({ canGoBack }) => {
        if (!canGoBack) {
          CapacitorApp.exitApp()
        } else {
          window.history.back()
        }
      })
    }).catch(() => {
      // Capacitor 插件未安装，忽略
    })
  }
}).catch(() => {
  // Capacitor 未安装，运行在 Web 模式
})

app.mount('#app')
