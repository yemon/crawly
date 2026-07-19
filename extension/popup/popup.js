// Crawly popup logic.

const $ = id => document.getElementById(id);
let tab = null, state = null, pollTimer = 0;

function send(cmd, extra) {
  return chrome.tabs.sendMessage(tab.id, Object.assign({ cmd }, extra || {}));
}

async function getTab() {
  // allows opening the popup as a page against a specific tab (also handy for debugging)
  const forced = new URLSearchParams(location.search).get('tab');
  if (forced) {
    try { return await chrome.tabs.get(Number(forced)); } catch (e) {}
  }
  let [t] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (t && t.url && t.url.startsWith('chrome-extension://')) {
    const all = await chrome.tabs.query({ active: true });
    t = all.find(x => x.url && /^https?:/.test(x.url)) || t;
  }
  return t;
}

function dead(msg, canReload) {
  $('dead').hidden = false;
  $('main').hidden = true;
  $('deadMsg').textContent = msg;
  $('reloadBtn').hidden = !canReload;
}

function originScope(url) {
  try { return new URL(url).origin + '/*'; } catch (e) { return null; }
}

async function hasPermission() {
  const scope = originScope(tab && tab.url);
  if (!scope) return false;
  try { return await chrome.permissions.contains({ origins: [scope] }); }
  catch (e) { return false; }
}

async function refreshState() {
  if (!tab || !tab.url || !/^https?:/.test(tab.url)) {
    dead('Crawly cannot crawl this page. Try a normal website tab.', false);
    return false;
  }
  const allowed = await hasPermission();
  state = null;
  if (allowed) {
    try { state = await send('GET_STATE'); } catch (e) {}
  }
  if (allowed && !state) {
    dead('Refresh the tab to wake the spider.', true);
    return false;
  }
  if (!state) {
    // permission not granted yet — fabricate a minimal state so the popup renders
    const u = new URL(tab.url);
    state = {
      ok: true, origin: u.origin, path: u.pathname,
      local: false, consent: false,
      recording: false, stepCount: 0, running: false, roaming: false,
    };
  }
  $('dead').hidden = true;
  $('main').hidden = false;
  renderSite(allowed);
  renderRecord(allowed);
  return true;
}

function renderSite(allowed) {
  $('origin').textContent = state.origin + (state.path !== '/' ? state.path : '');
  const chip = $('consentChip'), btn = $('consentBtn');
  if (allowed) {
    chip.textContent = 'ALLOWED';
    chip.classList.add('ok');
    btn.hidden = false;
    btn.textContent = 'REVOKE';
    btn.onclick = async () => {
      const scope = originScope(tab.url);
      if (scope) await chrome.permissions.remove({ origins: [scope] });
      refreshState();
    };
  } else {
    chip.textContent = 'NOT ALLOWED YET';
    chip.classList.remove('ok');
    btn.hidden = false;
    btn.textContent = 'ALLOW';
    btn.onclick = async () => {
      const scope = originScope(tab.url);
      if (!scope) return;
      const granted = await chrome.permissions.request({ origins: [scope] });
      if (granted) {
        try { await chrome.runtime.sendMessage({ cmd: 'INJECT_TAB', tabId: tab.id }); } catch (e) {}
      }
      refreshState();
    };
  }
  const roam = $('roam');
  roam.checked = !!state.roaming;
  roam.disabled = !allowed;
  roam.onchange = async () => {
    if (!allowed) { roam.checked = false; return; }
    const r = await send('TOGGLE_ROAM', { on: roam.checked }).catch(() => null);
    if (!r || !r.ok) roam.checked = false;
  };
}

function renderRecord(allowed) {
  const recording = state.recording;
  $('recordBtn').hidden = recording;
  $('recordBtn').disabled = !allowed;
  $('recordBtn').title = allowed ? '' : 'Click ALLOW first';
  $('recBox').hidden = !recording;
  if (recording) {
    $('stepCount').textContent = state.stepCount + ' step' + (state.stepCount === 1 ? '' : 's');
    if (!$('recName').value) {
      $('recName').value = defaultName();
    }
    clearInterval(pollTimer);
    pollTimer = setInterval(async () => {
      try {
        const s = await send('GET_STATE');
        if (s && s.ok) $('stepCount').textContent = s.stepCount + ' step' + (s.stepCount === 1 ? '' : 's');
      } catch (e) {}
    }, 700);
  } else {
    clearInterval(pollTimer);
  }
}

function defaultName() {
  try {
    const u = new URL(tab.url);
    const tail = (u.pathname + u.search).replace(/^\/+/, '');
    return `.../${tail} crawl`;
  } catch (e) { return 'My crawl'; }
}

async function renderLists() {
  const { automations = [] } = await chrome.storage.local.get('automations');
  const mine = $('mine');
  mine.textContent = '';
  const origin = state ? state.origin : null;
  const here = automations.filter(a => a.origin === origin);

  if (!here.length) {
    const e = document.createElement('div');
    e.className = 'empty';
    e.textContent = 'No crawls saved for this site yet. Hit RECORD and click around.';
    mine.appendChild(e);
  }
  for (const a of here) mine.appendChild(item(a, true));
}

function item(a, runnable) {
  const d = document.createElement('div');
  d.className = 'item' + (a.enabled ? '' : ' off');

  const top = document.createElement('div'); top.className = 'top';
  const sw = document.createElement('label'); sw.className = 'switch'; sw.title = 'Enable or disable';
  const cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = !!a.enabled;
  const tr = document.createElement('span'); tr.className = 'tr';
  sw.append(cb, tr);
  cb.addEventListener('change', () => patch(a.id, { enabled: cb.checked }));

  const name = document.createElement('div'); name.className = 'name';
  name.textContent = a.name;
  name.title = a.name;
  const ren = document.createElement('button'); ren.className = 'btn mini'; ren.textContent = 'RENAME';
  ren.addEventListener('click', () => {
    const v = prompt('New name', a.name);
    if (v && v.trim()) patch(a.id, { name: v.trim().slice(0, 60) });
  });
  top.append(sw, name, ren);

  const meta = document.createElement('div'); meta.className = 'meta';
  meta.textContent = `${a.steps.length} steps`;

  const acts = document.createElement('div'); acts.className = 'acts';
  if (runnable) {
    const run = document.createElement('button'); run.className = 'btn mini'; run.textContent = 'RUN';
    run.disabled = !a.enabled;
    if (!a.enabled) run.title = 'Enable it first';
    run.addEventListener('click', async () => {
      const r = await send('RUN', { id: a.id }).catch(() => null);
      if (r && r.ok) window.close();
    });
    acts.appendChild(run);
  }
  const autoB = document.createElement('button');
  autoB.className = 'btn mini' + (a.autoRun ? ' onAuto' : '');
  autoB.textContent = 'AUTO';
  autoB.title = a.autoRun
    ? 'Auto-run is ON: runs by itself when a matching page loads'
    : 'Auto-run is OFF';
  autoB.addEventListener('click', () => patch(a.id, { autoRun: !a.autoRun }));
  acts.appendChild(autoB);
  const exp = document.createElement('button'); exp.className = 'btn mini'; exp.textContent = 'EXPORT';
  exp.addEventListener('click', () => exportData([a], slug(a.name) + '.crawly.json'));
  acts.appendChild(exp);
  const del = document.createElement('button'); del.className = 'btn mini'; del.textContent = 'DELETE';
  del.addEventListener('click', async () => {
    const { automations = [] } = await chrome.storage.local.get('automations');
    await chrome.storage.local.set({ automations: automations.filter(x => x.id !== a.id) });
  });
  acts.appendChild(del);

  d.append(top, meta, acts);
  return d;
}

/* ---------- import / export ---------- */
const slug = s => (s || 'crawl').toLowerCase().replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-').slice(0, 40) || 'crawl';

function exportData(autos, filename) {
  const data = {
    format: 'crawly-export',
    version: 1,
    exportedAt: new Date().toISOString(),
    automations: autos,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  toast('Exported!');
}

const STEP_TYPES = new Set(['move', 'fill', 'select', 'click', 'nav']);
async function importFromFile(file) {
  try {
    const d = JSON.parse(await file.text());
    if (!d || d.format !== 'crawly-export' || !Array.isArray(d.automations)) throw new Error('not a crawly export');
    const clean = [];
    for (const a of d.automations) {
      if (!a || typeof a.origin !== 'string' || !Array.isArray(a.steps)) continue;
      if (!a.steps.every(s => s && STEP_TYPES.has(s.type))) continue;
      clean.push({
        id: 'a_' + Math.random().toString(36).slice(2, 10),
        name: String(a.name || 'Imported crawl').slice(0, 60),
        origin: a.origin,
        pathPrefix: typeof a.pathPrefix === 'string' ? a.pathPrefix : '/',
        enabled: a.enabled !== false,
        autoRun: false, // imports never get to auto-run until you flip it yourself
        createdAt: Date.now(),
        steps: a.steps,
      });
    }
    if (!clean.length) throw new Error('no valid crawls inside');
    const { automations = [] } = await chrome.storage.local.get('automations');
    await chrome.storage.local.set({ automations: automations.concat(clean) });
    toast(`Imported ${clean.length} crawl${clean.length > 1 ? 's' : ''}! KPOW!`);
  } catch (err) {
    toast('Import failed: ' + err.message);
  }
}

function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { t.hidden = true; }, 2600);
}

async function patch(id, changes) {
  const { automations = [] } = await chrome.storage.local.get('automations');
  const i = automations.findIndex(x => x.id === id);
  if (i >= 0) {
    Object.assign(automations[i], changes);
    await chrome.storage.local.set({ automations });
  }
}

async function renderTheme() {
  const { settings = { theme: 'noir' } } = await chrome.storage.local.get('settings');
  for (const b of document.querySelectorAll('.seg button')) {
    b.classList.toggle('on', b.dataset.theme === settings.theme);
  }
}

async function setTheme(t) {
  const { settings = {} } = await chrome.storage.local.get('settings');
  settings.theme = t;
  await chrome.storage.local.set({ settings });
  renderTheme();
  try { await send('SET_THEME', { theme: t }); } catch (e) {}
}

async function init() {
  $('ver').textContent = 'v' + chrome.runtime.getManifest().version;
  $('tNoir').addEventListener('click', () => setTheme('noir'));
  $('tHero').addEventListener('click', () => setTheme('hero'));
  $('reloadBtn').addEventListener('click', async () => { await chrome.tabs.reload(tab.id); window.close(); });

  $('recordBtn').addEventListener('click', async () => {
    const r = await send('START_RECORD').catch(() => null);
    if (r && r.ok) { await refreshState(); window.close(); }
    else if (r && r.reason === 'consent') refreshState();
  });
  $('stopBtn').addEventListener('click', async () => {
    await send('STOP_RECORD', { name: $('recName').value });
    $('recName').value = '';
    await refreshState();
    renderLists();
  });
  $('cancelBtn').addEventListener('click', async () => {
    await send('CANCEL_RECORD');
    $('recName').value = '';
    await refreshState();
  });
  $('importBtn').addEventListener('click', () => $('importFile').click());
  $('importFile').addEventListener('change', async e => {
    const f = e.target.files[0];
    e.target.value = '';
    if (f) await importFromFile(f);
  });
  $('exportAllBtn').addEventListener('click', async () => {
    const { automations = [] } = await chrome.storage.local.get('automations');
    if (!automations.length) { toast('Nothing to export yet!'); return; }
    exportData(automations, 'crawly-all.crawly.json');
  });

  chrome.storage.onChanged.addListener((ch, area) => {
    if (area !== 'local') return;
    if (ch.automations) renderLists();
    if (ch.settings) renderTheme();
  });

  if (chrome.permissions && chrome.permissions.onAdded) {
    chrome.permissions.onAdded.addListener(() => refreshState());
    chrome.permissions.onRemoved.addListener(() => refreshState());
  }

  tab = await getTab();
  renderTheme();
  if (!tab || !tab.id) { dead('No tab found.', false); return; }
  const ok = await refreshState();
  if (ok) renderLists();
  else {
    // still show saved crawls even when the page is off limits
    state = null;
  }
}

init();
