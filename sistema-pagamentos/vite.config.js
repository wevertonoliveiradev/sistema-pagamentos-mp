import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa' // 1. Importa o plugin

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // 2. Adiciona e configura o plugin PWA
    VitePWA({ 
      registerType: 'autoUpdate', // Atualiza o PWA automaticamente quando houver uma nova versão
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Painel de Pagamentos',
        short_name: 'PainelPag',
        description: 'Um sistema para gerar e gerenciar pagamentos do Mercado Pago.',
        theme_color: '#1e1e1e', // Cor da barra de ferramentas do app
        background_color: '#121212', // Cor de fundo da tela de splash
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable' // Ícone adaptável para diferentes formatos de SO
          }
        ]
      } 
    })
  ],
})