### SmolChat
Small chat app made with flask and js.

## Environment Variables

**flask_secret_key** - flask secrey key (needs a random string), use ENV variable or edit constants/secrets.py . <br>
**app_port** - Port number the chat will bind to. Defaults to '5714'  <br>


Application will bind on all interfaces on port 5714 (unless changed). You should really run this behind a webserver. Nginx latest can proxy sockets as well, sample configuration for nginx included under src/nginx .

By default, static files will be served by flask and the app itself, if you use nginx you can either disable the functions in code or just not include the nginx conf static section (if you choose to use that). Websockets will still be proxied.

Use certbot (with nginx) or Cloudflare for SSL.


_still needs lots of work._

<!-- ![Image demo image](/src/static/img/demo.png) -->