# Performance tooling

Local scripts for bundle size and Lighthouse checks. CI still enforces a performance budget on `/` and `/design-system` (see `.github/workflows/ci.yml`).

## Bundle analysis (`@next/bundle-analyzer`)

Use this when adding heavy dependencies, changing dynamic imports, or tuning home below-the-fold deferrals.

1. From `qwen-ui-lab`, run:

   ```bash
   npm run analyze
   ```

2. The script sets `ANALYZE=true`, runs a production `next build`, then opens interactive treemaps for **client** and **server** bundles in your default browser.

3. Focus on:
   - Large modules pulled into the initial home route (hero + layout shell).
   - Chunks loaded only by `HomeBelowFoldClient` (`UploadFlow`, `DashboardShell`, chart libraries).
   - Duplicate chart stacks (`chart.js` vs `recharts`) if both appear in the same chunk.

4. After changes, re-run `npm run analyze` and compare treemap sizes. Analyzer output lives under `.next/` (gitignored).

**Manual equivalent** (any shell):

```bash
ANALYZE=true npm run build
```

On PowerShell: `$env:ANALYZE='true'; npm run build`

**Note:** Bundle analysis is dev-only tooling. It does not run in CI and does not affect E2E or PWA service-worker builds.

## Lighthouse (local)

Scripts in `scripts/perf-lighthouse.mjs` build production, start a ephemeral server, and write JSON under `.perf/` (gitignored).

| Script | Purpose |
|--------|---------|
| `npm run perf:lighthouse` | Latest report (`lighthouse-latest.json`) |
| `npm run perf:lighthouse:baseline` | Save baseline before a change |
| `npm run perf:lighthouse:after` | Save after change for comparison |

Optional env: `PERF_PORT` (default picks a free port in the 4300 range).

Use before/after perf-sensitive UI work (hero, deferrals, design-system catalog). Compare `categories.performance.score` and LCP-related audits between baseline and after files.

## CI performance budget

On pushes to `main` (and manual dispatch), the CI workflow's **Web audits** job runs Lighthouse **performance-only** against production builds of:

- `/` (home)
- `/design-system`

Minimum score: **0.45** per route (see workflow for exact command). A budget breach fails the post-merge CI run on `main` - the PR gate (`pr-checks.yml`) does not include performance checks - so fix regressions or justify with measured bundle/Lighthouse diffs from the steps above.

## Production LCP budget (CI)

The same CI workflow also runs a **Production LCP budget** job: `npm run perf:lcp-budget` (`scripts/perf-lcp-budget.mjs`) probes the deployed production URL (`PERF_URL`, resolved from `vars.PRODUCTION_DEPLOY_URL` with a `https://qwen-ui-lab.vercel.app` fallback) and compares LCP against `PERF_MAX_LCP_MS` (default **2500 ms**). The check is warn-only unless `PERF_LCP_STRICT=true` (set via `vars.PERF_LCP_STRICT`). The report is written to `.perf/lighthouse-lcp-budget.json` and uploaded as a workflow artifact.

### Explicit measurement profiles

Both Lighthouse scripts share the settings in `scripts/lib/lighthouse-profile.mjs`.
Select a profile with `PERF_PROFILE`; the production-budget script also accepts
`--profile`.

| Profile | Viewport and user agent | Simulated network and CPU |
| --- | --- | --- |
| `constrained-desktop` (default) | Desktop, 1350 × 940 | Lighthouse slow 4G, 4× CPU slowdown |
| `desktop` | Lighthouse desktop preset | Lighthouse dense 4G and desktop CPU settings |
| `mobile` | Lighthouse mobile preset | Lighthouse slow 4G, 4× CPU slowdown |

The default retains the previous slow-network and CPU constraints. Its user
agent now matches the desktop viewport, rather than silently retaining a mobile
user agent. The **2500 ms simulated-LCP target and strict/warning policy are
unchanged**. Choosing the optional desktop preset is a different experiment,
not a way to clear a constrained-profile warning.

Each summary identifies the profile, Lighthouse version, and effective settings.
The budget still evaluates simulated LCP (`lcpMs`); `observedLcpMs` is diagnostic
and must not be substituted for that budget metric. Old mixed-profile results
are not directly comparable to the corrected profile.

### Before/after measurements

Measure a production preview with the same browser, profile, URL, viewport,
network, CPU settings, and cache-reset behavior on both sides. Warm the Next.js
server with one request and one full-page Lighthouse warm-up before each batch.
Keep the warm-up report separate. Run at least three separate cold browser
samples per build and retain every sample, including budget breaches:

```bash
node scripts/perf-lcp-budget.mjs --url http://127.0.0.1:4317 --profile constrained-desktop --output .perf/lcp-experiment/baseline-1.json
# Repeat as baseline-2.json and baseline-3.json before editing the image.
# Build the candidate, restart the same preview, and repeat as candidate-1..3.
```

`--output` defaults to the existing CI artifact path. `CHROME_PATH` can select an
already installed Chromium-based browser; use the identical binary for every
sample. Compare medians and ranges under the **same** profile, alongside the
LCP element and request-priority evidence. A faster optional profile is not
evidence that the application became faster.

### Local image-priority experiment (2026-11-16)

A production-build comparison used Node 24, Lighthouse 13.5.0, Edge 157,
and the same `constrained-desktop` settings. Each build ran on one freshly
started localhost server, with one HTTP request and a full-page warm-up
before three separate cold-browser samples.

| Hero image behavior | Simulated LCP samples (ms) | Median (ms) |
| --- | --- | --- |
| Existing `priority` | 3990, 4057, 6193 | 4057 |
| `loading="eager"` and `fetchPriority="high"` | 4065, 4059, 6357 | 4065 |

The browser requested the image at Low priority in the baseline and High
priority in the candidate. Both retained the same image as the LCP element.
The hint did not improve the three-sample median, and both batches contained
a slower sample. The candidate was therefore reverted. These local synthetic
results do not establish production field performance, and the 2500 ms
simulated-LCP warning remains unresolved.

Raw reports and warm-ups are retained locally under `.perf/lcp-experiment/`
as `control-*` and `high-priority-*`. Earlier exploratory reports are also
retained; the first `candidate-*` batch had overlapping preview servers and
is excluded from this comparison.

### Server-resolved hero locale (2026-11-16)

The next investigation found the hero inside a hidden streamed Suspense
container. Its image completed loading at about 89 ms in the captured trace,
but the LCP paint occurred at 361 ms. With JavaScript disabled, the hero
remained hidden despite being present in the document.

The home page now awaits its request `searchParams`, resolves the first
`lang` value, and passes the locale and hero copy to the client component.
The hero no longer reads query state or needs a Suspense fallback. Its markup
is visible in the initial document without executing JavaScript; interactive
links and analytics still hydrate normally. Invalid and empty language values
fall back to English, matching the existing locale resolver.

Using the same Node, Lighthouse, Edge, URL, and `constrained-desktop` settings
as the control batch above, the candidate produced simulated LCP samples of
3997, 3820, and 3877 ms. Its median was **3877 ms**, versus **4057 ms** for the
control (about 4.4% lower). This is a small local sample, not evidence of
production field improvement or of meeting the unchanged 2500 ms budget.
The image and its Low request priority were unchanged.

Production-preview browser checks verified visible hero copy and loaded images
without JavaScript at 390 and 1350 px widths for English, Chinese, invalid and
empty language values, and both orders of duplicate language parameters. A
client navigation from the Chinese home page to the design system and back
retained the Chinese hero and links without uncaught page errors.

The raw candidate samples are `.perf/lcp-experiment/server-locale-*.json`.
The original trace, document captures, and browser verification logs are under
`.perf/render-investigation/` (local, gitignored).

## Related home optimizations

### Deferred dashboard panels (2026-11-16)

The dashboard launcher still loads normally. The dialog header and close/workflow
actions appear immediately on open, while `DashboardSamplePanels` loads through
`next/dynamic` inside the dialog portal. The preview, plan, detected UI, and
download panels are not requested while the dialog is closed. Chart libraries
retain their existing visibility-based loading inside the preview.

The three-run repeat control measured 3923, 3890, and 3973 ms simulated LCP
(median 3923 ms). The final candidate measured 4050, 4000, and 3972 ms (median
4000 ms). Startup script transfer fell from 362997 to 358226 bytes (4771 bytes,
about 1.3%). This change reduces startup JavaScript; it did **not** demonstrate
an LCP improvement. The unchanged 2500 ms target remains unmet. Raw reports,
warm-ups, and the font experiment are retained under `.perf/lcp-experiment/`
with `panels-control-*`, `panels-final-*`, and `deferred-font-*` names.

The CSS investigation identified about 28 KB of compressed render-blocking
styles and a display-font dependency discovered after its stylesheet. Preloading
the display font produced no convincing LCP gain and was reverted. Styles and
font-loading policy therefore remain unchanged apart from the tabs selector fix.

Browser verification found the shared tabs root was using `data-horizontal`
while Base UI emits `data-orientation="horizontal"`. The corrected selector
keeps horizontal tab lists above their content. Slow-module checks cover closing
and reopening the loading dialog, returning focus to the trigger, all four tabs,
localized workflow links, and mobile/desktop bounds. Existing smoke coverage
also exercises the upload flow and design-system layouts.

### Existing loading behavior

- The home route resolves the hero locale on the server; `HomeMarketingHero`
  renders in the initial document and hydrates its analytics and CTA handlers.
- Upload flow and dashboard charts load via `next/dynamic` with `ssr: false` in `HomeBelowFoldClient`.
- `experimental.optimizePackageImports` in `next.config.ts` tree-shakes `lucide-react`, `recharts`, and `chart.js`.

See also [POST_LAUNCH.md](./POST_LAUNCH.md) for optional post-release perf checks.
