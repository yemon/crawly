// Crawly background worker: defaults on install, REC badge while recording,
// and dynamic content-script registration keyed to origins the user has granted
// via chrome.permissions.request from the popup.

const SCRIPT_ID = origin => 'crawly-' + origin;

async function registerForOrigin(pattern) {
  const id = SCRIPT_ID(pattern);
  try {
    const existing = await chrome.scripting.getRegisteredContentScripts({ ids: [id] });
    if (existing && existing.length) return;
  } catch (e) {}
  try {
    await chrome.scripting.registerContentScripts([{
      id,
      matches: [pattern],
      js: ['content/crawly.js'],
      runAt: 'document_idle',
      allFrames: false,
    }]);
  } catch (e) {}
}

async function unregisterForOrigin(pattern) {
  const id = SCRIPT_ID(pattern);
  try { await chrome.scripting.unregisterContentScripts({ ids: [id] }); } catch (e) {}
}

async function syncRegistered() {
  const perms = await chrome.permissions.getAll();
  const desired = new Set(perms.origins || []);
  let registered = [];
  try { registered = await chrome.scripting.getRegisteredContentScripts(); } catch (e) {}
  const desiredIds = new Set([...desired].map(SCRIPT_ID));
  for (const s of registered) {
    if (s.id.startsWith('crawly-') && !desiredIds.has(s.id)) {
      try { await chrome.scripting.unregisterContentScripts({ ids: [s.id] }); } catch (e) {}
    }
  }
  const registeredIds = new Set(registered.map(s => s.id));
  for (const origin of desired) {
    if (!registeredIds.has(SCRIPT_ID(origin))) await registerForOrigin(origin);
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  const cur = await chrome.storage.local.get(['settings', 'automations']);
  const patch = {};
  if (!cur.settings) patch.settings = { theme: 'noir' };
  if (!cur.automations) patch.automations = [];
  if (Object.keys(patch).length) await chrome.storage.local.set(patch);
  await syncRegistered();
});

chrome.runtime.onStartup.addListener(syncRegistered);

chrome.permissions.onAdded.addListener(perms => {
  (perms.origins || []).forEach(o => registerForOrigin(o));
});
chrome.permissions.onRemoved.addListener(perms => {
  (perms.origins || []).forEach(o => unregisterForOrigin(o));
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg) return;
  if (msg.cmd === 'REC_BADGE' && sender.tab && sender.tab.id != null) {
    chrome.action.setBadgeText({ tabId: sender.tab.id, text: msg.on ? 'REC' : '' });
    chrome.action.setBadgeBackgroundColor({ tabId: sender.tab.id, color: '#111111' });
    chrome.action.setBadgeTextColor({ tabId: sender.tab.id, color: '#ffffff' });
    return;
  }
  if (msg.cmd === 'INJECT_TAB' && typeof msg.tabId === 'number') {
    chrome.scripting.executeScript({
      target: { tabId: msg.tabId },
      files: ['content/crawly.js'],
    }).then(() => sendResponse({ ok: true }))
      .catch(e => sendResponse({ ok: false, error: String(e) }));
    return true;
  }
});
