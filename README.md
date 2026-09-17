# Forge 5.0

Single-page PWA, no build step. Deploy by pushing — GitHub Pages serves it as-is.

## Layout

    index.html          shell + screen markup (609 lines, was 5,866)
    css/                base · auth · workout · analytics · health · nutrition
    js/                 18 modules, loaded in dependency order
    sw.js               service worker — bump CACHE on every deploy
    manifest.json

## Modules

| file | holds |
|---|---|
| `core.js` | constants, utils, toast |
| `storage.js` | localStorage, profiles, PIN hashing |
| `state.js` | app state, session persistence, wake lock |
| `library.js` | exercise library, substitutions |
| `programs.js` | program layer, rep resolution, PR keys |
| `hardwood.js` | the Hardwood 6-week block |
| `periodization.js` | CYCLE, overload engine, deload detector |
| `workout.js` | day select, editor, active session, rest timer, RPE |
| `history.js` | home, session detail, past-session editing, PR timeline |
| `analytics.js` | progress charts, muscle heatmap |
| `vitals.js` | bio, supplements, fasting |
| `peptides.js` | peptide protocol + reconstitution |
| `nutrition.js` | diet plan, meal plan, plan generator |
| `migrate.js` | schema v2 → v3 with backup + data repair |
| `programs-ui.js` | program strip, picker, migration notice |
| `backup.js` | export / import |
| `splash.js` | profile select |
| `boot.js` | navigation + init (**must load last**) |

## Rules

**Every slot stores its own reps.** `resolveReps(ex, wd)` prefers a slot's
stored `repMin`/`repMax` and only falls back to the global `CYCLE` table for
legacy Forge days that carry none. Nothing in the render path derives reps
from a global week value.

**PRs are keyed by exercise *and* implement.** A Smith bench never overwrites
a free-barbell bench — counterbalanced Smith bars weigh far less than 45 lb
and remove the stabilization demand, so the two are not the same lift.

**No cross-file references at load time.** Function declarations hoist only
within their own file. A top-level `var x = someFnFromAnotherFile` throws if
that file has not loaded yet. Call across modules at runtime only.

## Storage

    forge_users              profile list
    forge_user_<id>          per-profile data (schema 3)
    forge_v2backup_<id>      untouched pre-migration copy
    forge_active_<id>        in-progress session
