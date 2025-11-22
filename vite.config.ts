import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3555,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      // API 키는 더 이상 프론트엔드에서 사용하지 않음 (보안 강화)
      'process.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || 'http://localhost:8787'),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
