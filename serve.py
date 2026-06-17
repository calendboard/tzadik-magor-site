#!/usr/bin/env python3
"""שרת תצוגה מקדימה קטן לאתר — מצביע במפורש על תיקיית האתר."""
import functools
import http.server
import socketserver

DIRECTORY = "/Users/calendboard/Desktop/tzadik-magor-site"
PORT = 8099

Handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=DIRECTORY)

with socketserver.TCPServer(("127.0.0.1", PORT), Handler) as httpd:
    httpd.allow_reuse_address = True
    print(f"Serving {DIRECTORY} on http://127.0.0.1:{PORT}")
    httpd.serve_forever()
