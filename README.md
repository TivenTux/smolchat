### SmolChat
Small chat app made with flask and js.

## Environment Variables

**flask_secret_key** - flask secrey key (needs a random string), use ENV variable or edit constants/secrets.py . <br>
**app_port** - Port number the chat will bind to. Defaults to '5714'  <br>
**total_history_keep** - Total messages to always keep in db after cleanup. Defaults to '200'. <br>
**total_msg_before_cleanup** - Sets every how many messages should it check before removing old messages from db. Defaults to '25'.<br>
**client_max_history_load** - Messages from history that will load on new client connections. Defaults to 25 messages. <br>


Application will bind on all interfaces on port 5714 (unless changed). You should really run this behind a webserver. Nginx latest can proxy sockets as well, sample configuration for nginx included under src/nginx .

By default, static files will be served by flask and the app itself, if you use nginx you can either disable the functions in code or just not include the nginx conf static section (if you choose to use that). Websockets will still be proxied.

Use certbot (with nginx reverse proxy) or Cloudflare for SSL.


<!-- ![Image demo image](/src/static/img/demo.png) -->

<img align="center" src="https://github.com/TivenTux/smolchat/blob/dc5e7d8087d422b7c6dda5986d6e97eab12454ef/src/static/img/demo.png?raw=true" width="600"> 