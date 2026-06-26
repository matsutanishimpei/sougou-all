import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
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

              const response = await fetch('https://github.com/login/oauth/access_token', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                },
                body: JSON.stringify({
                  client_id: 'Ov23liFWupK3e2e4v6IF',
                  client_secret: 'e071fe0561c73b18cdaa48ccf1cd8d2329cc44fa',
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
})

