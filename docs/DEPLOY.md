# Deploying ATS/OPT on the Hetzner server

ATS/OPT runs on the existing Hetzner CAX11 (ARM64) next to the basketwise app, as its own
Docker Compose project. The basketwise Caddy container is the only way in: it serves HTTPS and
forwards `/api/*` to the backend and everything else to the frontend.

```
internet ──443──> basketwise Caddy ──(ats_proxy network)──> ats-frontend :3000
                                    └─ /api/* (prefix removed) ──> ats-backend  :3001 ──> Gemini API
```

- No ports are published by the ATS containers; they are reachable only through Caddy.
- The ATS containers are only on the `ats_proxy` network, so they cannot reach the basketwise
  database. Caddy joins both networks.
- Memory limits (512 MB backend, 384 MB frontend) keep a problem here from affecting basketwise.
- Images are built on the server itself, so they match its ARM64 CPU.

## Safety rules

- The Gemini key lives only in `backend/.env.production` on the server (`chmod 600`). Never in
  git, chat, logs or screenshots. `.gitignore` excludes it.
- Never enable billing on the key's Google project. On the free tier a used-up quota only makes
  the app fall back to the rule engine.
- Changes to basketwise's Caddyfile or Compose file are small and listed below. Check the Caddy
  config before reloading it; a reload has no downtime.

## One-time changes in the basketwise repository

So that basketwise's Caddy can serve other sites without knowing about them, three small
changes go into the **basketwise** repository (commit them there, then `git pull` on the server):

1. `Caddyfile`, at the end:

   ```
   # Other sites on this server (e.g. ATS/OPT), one file each. Empty is fine.
   import sites/*.caddy
   ```

2. `docker-compose.prod.yml`, in the `caddy` service, plus a top-level `networks` entry:

   ```yaml
     caddy:
       environment:
         SITE_ADDRESS: ${SITE_ADDRESS:?Set SITE_ADDRESS in .env}
         ATS_SITE_ADDRESS: ${ATS_SITE_ADDRESS:-}
       volumes:
         - ./Caddyfile:/etc/caddy/Caddyfile:ro
         - ./sites:/etc/caddy/sites:ro
         - caddy-data:/data
         - caddy-config:/config
       networks:
         - default
         - ats_proxy

   networks:
     ats_proxy:
       external: true
   ```

3. `.gitignore`: add `/sites/` (the site files are copied there on the server).

With `sites/` empty the configuration is exactly as before. The ATS site file has a harmless
default address, so a missing `ATS_SITE_ADDRESS` cannot stop Caddy from starting.

## First deployment

Run as the `deploy` user on the server unless noted. The order matters: the network must exist
before Caddy is recreated.

1. **DNS.** With [sslip.io](https://sslip.io), as basketwise uses, there is nothing to do:
   `ats.2-29-141-47.sslip.io` already points to the server, because the address contains the IP.
   With your own domain instead, point the subdomain (for example `ats.example.com`) to the
   server: an `A` record to its IPv4 and an `AAAA` record to its IPv6, and wait until
   `dig +short ats.example.com` returns the server's address.

2. **Shared network**, once. Neither Compose project owns it, so stopping ATS never removes it:

   ```bash
   docker network create ats_proxy
   ```

3. **Get the code.**

   ```bash
   git clone https://github.com/afraalmaci/ATS-resume-optimizer.git ~/ats
   cd ~/ats
   ```

4. **Secrets.** Create the env file and fill in `CORS_ORIGIN` and `GEMINI_API_KEY` in an editor
   on the server:

   ```bash
   cp backend/.env.production.example backend/.env.production
   chmod 600 backend/.env.production
   nano backend/.env.production
   ```

5. **Build and start.** The first build takes several minutes on the CAX11 and uses most of its
   CPU meanwhile, so basketwise may be a little slower until it finishes.

   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   docker compose -f docker-compose.prod.yml ps   # both "healthy" after about a minute
   ```

6. **Add the site to Caddy** (in `~/basketwise`, after pulling the changes above):

   ```bash
   cd ~/basketwise
   echo "ATS_SITE_ADDRESS=ats.example.com" >> .env      # the real subdomain
   mkdir -p sites && cp ~/ats/deploy/Caddyfile.ats sites/ats.caddy
   # Check the new configuration in a throwaway container before touching the live one:
   docker run --rm --env-file .env -v ./Caddyfile:/etc/caddy/Caddyfile:ro \
     -v ./sites:/etc/caddy/sites:ro caddy:2-alpine caddy validate --config /etc/caddy/Caddyfile
   # Only if it says "Valid configuration": recreate Caddy (a few seconds of downtime).
   docker compose -f docker-compose.prod.yml up -d caddy
   ```

   Caddy requests the HTTPS certificate on the first visit. Basketwise's certificates are kept
   in the `caddy-data` volume.

7. **Check.** Open basketwise as usual, then `https://ats.example.com`: use both "Use sample"
   links and run an analysis. The report should say "Read by Google Gemini + the rule engine".

## Updating

```bash
cd ~/ats
git pull
docker compose -f docker-compose.prod.yml up -d --build
docker image prune -f   # remove old image layers so the disk does not fill up
```

If `deploy/Caddyfile.ats` changed, copy it to `~/basketwise/sites/ats.caddy` again, validate (step
6) and reload: `docker exec basketwise-caddy-1 caddy reload --config /etc/caddy/Caddyfile`.

## Rolling back or removing

- Take the site offline: `rm ~/basketwise/sites/ats.caddy`, then
  `docker exec basketwise-caddy-1 caddy reload --config /etc/caddy/Caddyfile`.
- `docker compose -f docker-compose.prod.yml down` in `~/ats` stops and removes the containers.
  The `ats_proxy` network stays, so basketwise's Caddy keeps working.
- To remove everything: revert the basketwise changes, recreate Caddy, then
  `docker network rm ats_proxy`.

## Logs

```bash
docker compose -f docker-compose.prod.yml logs -f backend
```

Logs contain counts, scores and error types only: never resume text, job ads or the API key.
