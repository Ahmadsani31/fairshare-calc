import { Hono } from "hono";
import { Env } from './core-utils';
const uniqueIPs = new Set<string>();
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    // Add more routes like this. **DO NOT MODIFY CORS OR OVERRIDE ERROR HANDLERS**
    app.get('/api/test', (c) => c.json({ success: true, data: { name: 'this works' }}));
    app.get('/api/visits', (c) => {
        const ip = c.req.header('CF-Connecting-IP');
        if (ip) {
            uniqueIPs.add(ip);
        }
        return c.json({ success: true, data: { count: uniqueIPs.size } });
    });
}