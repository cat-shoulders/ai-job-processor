import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { cors } from 'hono/cors';
import fs from 'node:fs';
import path from 'node:path';
import { analyze } from './analyze';
import { auth } from './lib/auth';

const app = new Hono();

// Add traffic logger middleware
app.use('*', async (c, next) => {
  const startTime = Date.now();
  const method = c.req.method;
  const url = c.req.url;

  // Log request start
  console.log(`[${new Date().toISOString()}] ${method} ${url} - Request received`);

  // Process the request
  await next();

  // Calculate and log response time
  const responseTime = Date.now() - startTime;
  const status = c.res.status;

  console.log(
    `[${new Date().toISOString()}] ${method} ${url} - Response sent [${status}] ${responseTime}ms`,
  );
});

// Allow cors for API routes
if (process.env.ENV !== 'production') {
  console.log('CORS enabled for development');
  app.use(
    '*',
    cors({
      origin: 'http://localhost:5173', // replace with your origin
      allowHeaders: ['Content-Type', 'Authorization'],
      allowMethods: ['POST', 'GET', 'OPTIONS'],
      exposeHeaders: ['Content-Length'],
      maxAge: 600,
      credentials: true,
    }),
  );
}

// API routes
app.all('/api/auth/*', (c) => {
  return auth.handler(c.req.raw);
});

app.all('/api/analyze', analyze);

// Check if static folder exists
try {
  const staticDirPath = path.resolve(__dirname, 'static');
  const indexPath = path.join(staticDirPath, 'index.html');

  if (fs.existsSync(staticDirPath)) {
    console.log('static/ folder found, serving static files');

    // Serve static files from static folder with specific file extensions
    app.use('/assets/*', serveStatic({ root: staticDirPath }));
    app.use('/favicon.ico', serveStatic({ root: staticDirPath }));
    app.use('/*.css', serveStatic({ root: staticDirPath }));
    app.use('/*.js', serveStatic({ root: staticDirPath }));
    app.use('/*.png', serveStatic({ root: staticDirPath }));
    app.use('/*.jpg', serveStatic({ root: staticDirPath }));
    app.use('/*.svg', serveStatic({ root: staticDirPath }));

    // Serve index.html for all other routes (SPA client-side routing)
    if (fs.existsSync(indexPath)) {
      app.get('*', (c) => {
        return c.html(fs.readFileSync(indexPath, 'utf8'));
      });
    }
  } else {
    console.log(`static/ folder not found at ${staticDirPath}`);
  }
} catch (error) {
  console.error('Error handling static files:', error);
}

const port = parseInt(process.env.PORT!) || 3000;

export default {
  port,
  fetch: app.fetch,
};
