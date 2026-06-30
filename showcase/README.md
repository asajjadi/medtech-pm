# Showcase page for utmostconnect.org

`clearpath.html` is a self-contained case-study page for ClearPath QMS, styled to match a clean,
professional medtech consulting site. No build step, no dependencies — just one HTML file.

## How to add it to your site

1. **Upload** `clearpath.html` to your web host (same place as your other pages/`images/`).
   A good URL would be `https://utmostconnect.org/clearpath.html`.

2. **Link to it from your Projects section.** In your main page's "Projects / Case Studies"
   area, add a link/card:
   ```html
   <a href="/clearpath.html">ClearPath QMS — guided medtech PM tool →</a>
   ```

3. **Fix the two internal links** inside `clearpath.html` so they point at your real pages
   (search for these and update the `href`s):
   - `href="/index.html#projects"` (the "← Back to Projects" link)
   - `href="/index.html#contact"` (the two "Talk to / Let's talk" buttons)

## Add screenshots (recommended)

The page has two placeholder boxes under "A look inside." To replace them with real images:

1. With the app running (`npm run dev`), open `http://localhost:5173` and take screenshots of
   the board and the AI Coach.
2. Save them to your site's `images/` folder, e.g. `images/clearpath-board.png`.
3. In `clearpath.html`, replace each placeholder block:
   ```html
   <div class="shot"><div class="shot-ph">Screenshot: project board</div>...
   ```
   with:
   ```html
   <div class="shot"><img src="images/clearpath-board.png" alt="ClearPath QMS board" />
     <div style="margin-top:8px">The phase-based board</div></div>
   ```

## Adding a live demo button (after deployment)

Once the app is deployed (see the project roadmap), add a "Try the live demo" button in the hero
`.cta-row`:
```html
<a class="btn btn-primary" href="https://your-demo-url">Try the live demo →</a>
```
A live, clickable demo is far more compelling than a static page — it's the recommended next step.
