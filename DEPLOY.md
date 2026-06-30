# Deploying the live demo

The frontend can be deployed as a **static site** that runs entirely in the browser — no server,
no cost. Production builds automatically run in **demo mode** (`client/.env.production` sets
`VITE_DEMO_MODE=true`): data persists in the visitor's browser (localStorage) and AI responses are
sample text. This is ideal for a public, clickable demo you can link from utmostconnect.org.

## Option A — Vercel (recommended, ~5 minutes)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. **Add New… → Project**, then import the `asajjadi/medtech-pm` repo.
3. Configure:
   - **Root Directory:** `client`
   - **Framework Preset:** Vite (auto-detected)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `dist` (default)
4. Click **Deploy**. In ~1 minute you'll get a URL like `https://clearpath-xxxx.vercel.app`.
5. (Optional) Add a custom domain or subdomain in the Vercel project settings.

`client/vercel.json` already handles single-page-app routing.

## Option B — Netlify

1. [netlify.com](https://netlify.com) → **Add new site → Import an existing project** → pick the repo.
2. Set **Base directory:** `client`, **Build command:** `npm run build`, **Publish directory:** `client/dist`.
3. Deploy.

## After deploying

1. Copy your live demo URL.
2. In `showcase/clearpath.html`, add a button in the hero `.cta-row`:
   ```html
   <a class="btn btn-primary" href="https://YOUR-DEMO-URL">Try the live demo →</a>
   ```
3. Re-upload `clearpath.html` to utmostconnect.org. Done — visitors can click straight into a
   working demo.

## Notes

- **Local development is unaffected.** `npm run dev` still uses the real backend + AI; only
  production builds run in demo mode.
- To later deploy the *full* app (with live AI), you'd host the server separately and set
  `VITE_DEMO_MODE=false` plus the API base URL — a step on the product roadmap.
