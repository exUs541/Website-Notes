"""Local server used by build.py to render the store images.

/ext/*     the extension itself (real popup.html, dashboard.html, content.js ...)
/brand/*   store-assets/brand (the logo sources)
/scenes/*  demo pages and layouts in this folder
/mock/*    chrome.* stand-in
HTML under /ext/ and /scenes/ gets the chrome mock injected, except *.raw.html and /scenes/compose/.
"""
import http.server, os, socketserver

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.abspath(os.path.join(HERE, '..'))
EXT = os.path.abspath(os.path.join(ASSETS, '..'))
PORT = int(os.environ.get('PORT', '8766'))
MOCK_TAG = b'<script src="/mock/chrome.js"></script>'
ROOTS = {'/ext/': EXT, '/brand/': os.path.join(ASSETS, 'brand'), '/scenes/': os.path.join(HERE, 'scenes'), '/mock/': os.path.join(HERE, 'mock')}
TYPES = {'.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.mjs': 'application/javascript', '.css': 'text/css',
         '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json'}


class Handler(http.server.BaseHTTPRequestHandler):
    def _send(self, data, ctype, code=200):
        self.send_response(code)
        self.send_header('Content-Type', ctype)
        self.send_header('Content-Length', str(len(data)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        path = self.path.split('?')[0].split('#')[0]
        for prefix, base in ROOTS.items():
            if path.startswith(prefix):
                f = os.path.normpath(os.path.join(base, path[len(prefix):]))
                if not f.startswith(os.path.normpath(base)) or not os.path.isfile(f):
                    return self._send(b'not found: ' + path.encode(), 'text/plain', 404)
                data = open(f, 'rb').read()
                ext = os.path.splitext(f)[1].lower()
                if ext == '.html' and not f.endswith('.raw.html') and 'compose' not in os.path.relpath(f, base).split(os.sep):
                    i = data.lower().find(b'<head>')
                    data = data[:i + 6] + MOCK_TAG + data[i + 6:] if i >= 0 else MOCK_TAG + data
                return self._send(data, TYPES.get(ext, 'application/octet-stream'))
        self._send(b'not found', 'text/plain', 404)

    def log_message(self, *a):
        pass


class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True

    def handle_error(self, request, client_address):
        pass  # the browser closes connections on its own; nothing to report


if __name__ == '__main__':
    with Server(('127.0.0.1', PORT), Handler) as s:
        s.serve_forever()
