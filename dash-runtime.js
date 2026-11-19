/* A small stand-in for the claude.ai dashboard runtime, so the page works on its own.
   It loads the files in data/, works out the derived tables (dash.calc), and redraws
   the page when data, a filter or the window width changes. */
(() => {
  const SOURCES = {
    bodyweight: {url: 'data/bodyweight.json', format: 'json'},
    calories: {url: 'data/calories.json', format: 'json'},
    waist: {url: 'data/waist.json', format: 'json'},
    workouts: {url: 'data/workouts.csv', format: 'csv'},
  };
  const DEFAULT_PARAMS = {exercise: 'Incline Bench Press (Dumbbell)', range: 'phase'};

  const loaded = {};   // id -> {status, data, message}
  const calcs = {};    // id -> {inputs, fn}
  const memo = {};     // id -> result, cleared on any change
  const listeners = [];
  let params = {...DEFAULT_PARAMS};
  let pending = false;

  const schedule = () => {
    for (const k of Object.keys(memo)) delete memo[k];
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      for (const fn of listeners) {
        try { fn(); } catch (e) { console.error(e); }
      }
    });
  };

  const load = (id) => {
    const src = SOURCES[id];
    loaded[id] = {status: 'loading', data: [], message: ''};
    fetch(src.url, {cache: 'no-cache'})
      .then((r) => { if (!r.ok) throw new Error(src.url + ': HTTP ' + r.status); return r.text(); })
      .then((text) => {
        const data = src.format === 'csv' ? d3.csvParse(text) : JSON.parse(text);
        loaded[id] = {status: 'ok', data, message: ''};
      })
      .catch((e) => {
        console.error(e);
        loaded[id] = {status: 'error', data: [], message: String(e.message || e)};
      })
      .then(schedule);
  };

  const data = (id) => {
    if (calcs[id]) {
      if (id in memo) return memo[id];
      const ins = calcs[id].inputs.map(data);
      const bad = ins.find((d) => d.status !== 'ok');
      let out;
      if (bad) out = {status: bad.status, data: null, message: bad.message, refreshing: false, truncated: false, meta: null};
      else {
        try {
          const v = calcs[id].fn(...ins.map((d) => d.data));
          out = {status: 'ok', data: v, message: '', refreshing: false, truncated: false, meta: null};
        } catch (e) {
          console.error(e);
          out = {status: 'error', data: null, message: String(e.message || e), refreshing: false, truncated: false, meta: null};
        }
      }
      return (memo[id] = out);
    }
    if (!SOURCES[id]) return {status: 'missing', data: [], message: 'No such source: ' + id};
    if (!loaded[id]) load(id);
    const d = loaded[id];
    const res = {status: d.status, data: d.data, message: d.message, refreshing: false, truncated: false, meta: null};
    if (d.data && d.data.columns) res.columns = d.data.columns;
    return res;
  };

  window.dash = {
    data,
    calc: (id, def) => { calcs[id] = {inputs: def.inputs || [], fn: def.fn}; },
    loader: () => {},
    onData: (fn) => { listeners.push(fn); try { fn(); } catch (e) { console.error(e); } },
    params: () => ({...params}),
    setParams: (p) => { params = {...params, ...p}; schedule(); },
    resetParams: () => { params = {...DEFAULT_PARAMS}; schedule(); },
    refresh: (id) => { if (SOURCES[id]) load(id); },
    setLink: () => {},
    colors: ['#3b6fb6', '#d97a3a', '#7a5fb0', '#3f9a7a', '#c4527a', '#8a8a3a'],
  };

  let lastW = window.innerWidth, t;
  window.addEventListener('resize', () => {
    clearTimeout(t);
    t = setTimeout(() => { if (window.innerWidth !== lastW) { lastW = window.innerWidth; schedule(); } }, 150);
  });
})();
