import { DurableObject } from 'cloudflare:workers';
import html from '../public/index.html';

/**
 * @author Silverrzz
 */
export default {
  fetch(request, env) {
    if (new URL(request.url).pathname !== '/ws') {
      return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }
    if (request.headers.get('Upgrade')?.toLowerCase() !== 'websocket') {
      return new Response('Expected websocket', { status: 426 });
    }
    return env.WSS.getByName('mmaf').fetch(request);
  }
};

export class WebSocketServer extends DurableObject {
  fetch() {
    const [client, server] = Object.values(new WebSocketPair());
    this.ctx.acceptWebSocket(server);
    return new Response(null, { status: 101, webSocket: client });
  }

  webSocketMessage(ws, data) {
    for (const client of this.ctx.getWebSockets()) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    }
  }
}