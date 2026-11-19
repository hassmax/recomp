# Recomp Tracker

My body-recomposition dashboard: weight trend against the Dec 13 cut target, waist, key lifts (estimated 1-rep max), calories and weekly training volume. Moved here from claude.ai.

## Open it

The page reads its data files, so it has to be served rather than double-clicked:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. (Or turn on GitHub Pages for this repo, where your plan allows it for a private repo.)

## Add new data

Everything lives in `data/`; edit the file and reload the page.

| File | What it holds | Add a row like |
|---|---|---|
| `data/bodyweight.json` | Morning weigh-ins (`kind: "scale"`) plus one-off reference weights | `{"date": "2026-11-20", "weight_lb": 158.4, "kind": "scale"}` |
| `data/waist.json` | Weekly waist at the navel | `{"date": "2026-11-15", "waist_in": 32.8}` |
| `data/calories.json` | Daily net calories | `{"date": "2026-11-20", "net_kcal": 2350}` |
| `data/workouts.csv` | Hevy workout export | Replace with a fresh export from Hevy (same columns) |

## Files

- `index.html`: the dashboard (charts drawn with d3).
- `dash-runtime.js`: a small loader that stands in for claude.ai's dashboard runtime: it reads `data/`, works out the derived tables and redraws on changes.
- `theme.css`: colours and fonts, light and dark.
- `vendor/d3.min.js`: d3 7.9.0 (ISC licence, `vendor/d3-LICENSE`).

The targets (155 lb start, 156 lb by Dec 13, 33.0 in waist baseline) are written into `index.html`.
