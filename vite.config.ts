/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // The third argument '' loads all environment variables (including those without VITE_ prefix)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      {
        name: 'github-oauth-proxy',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url?.startsWith('/api/github/token') && req.method === 'POST') {
              try {
                let body = '';
                for await (const chunk of req) {
                  body += chunk;
                }
                const { code } = JSON.parse(body);

                const clientId = env.VITE_GITHUB_CLIENT_ID || 'Ov23liFWupK3e2e4v6IF';
                const clientSecret = env.GITHUB_CLIENT_SECRET;

                if (!clientSecret) {
                  console.warn('Warning: GITHUB_CLIENT_SECRET is not configured in .env.local');
                }

                const response = await fetch('https://github.com/login/oauth/access_token', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                  },
                  body: JSON.stringify({
                    client_id: clientId,
                    client_secret: clientSecret,
                    code
                  })
                });

                const data = await response.json();
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(data));
              } catch (err: any) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message || 'Unknown error' }));
              }
            } else {
              next();
            }
          });
        }
      }
    ],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: ['src/test/**', 'src/types/**', 'dist/**', 'functions/**', 'vite.config.ts', 'src/main.tsx'],
      },
    },
  };
})


