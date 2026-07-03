/**
 * ShizuConfigs — Shizuku Shell Bridge
 * No stubs, no imitations. All data comes from real window.Shizuku calls.
 */

const ShellBridge = (() => {
  const history = [];
  const MAX_HISTORY = 200;
  let connected = false;
  let moduleInfo = null;

  function isAvailable() {
    return typeof window.Shizuku !== 'undefined' && typeof window.Shizuku.exec === 'function';
  }

  function checkConnection() {
    if (!isAvailable()) {
      connected = false;
      return false;
    }
    try {
      const info = JSON.parse(window.Shizuku.getModuleInfo());
      // If we are in safe mode and NOT trusted, shell exec won't work
      if (info && info.accessMode === 'safe' && !info.trusted) {
        connected = false;
        return false;
      }
      connected = true;
      return connected;
    } catch (e) {
      connected = false;
      return false;
    }
  }

  function getModuleInfo() {
    if (moduleInfo) return moduleInfo;
    if (!isAvailable() || !window.Shizuku.getModuleInfo) {
      return null;
    }
    try {
      moduleInfo = JSON.parse(window.Shizuku.getModuleInfo());
    } catch (e) {
      moduleInfo = null;
    }
    return moduleInfo;
  }

  function download(url, relativeWebPath) {
    if (!isAvailable() || !window.Shizuku.download) {
      return { ok: false, error: 'Shizuku download API not available' };
    }
    try {
      return JSON.parse(window.Shizuku.download(url, relativeWebPath));
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }

  function exec(cmd) {
    if (!isAvailable()) {
      return { ok: false, exitCode: -1, stdout: '', stderr: 'Shizuku not connected', timedOut: false };
    }
    const entry = { cmd, timestamp: Date.now(), result: null };
    try {
      entry.result = JSON.parse(window.Shizuku.exec(cmd));
    } catch (e) {
      entry.result = { ok: false, exitCode: -1, stdout: '', stderr: e.message, timedOut: false };
    }
    history.unshift(entry);
    if (history.length > MAX_HISTORY) history.pop();
    return entry.result;
  }

  function execWithOptions(cmd, opts) {
    if (!isAvailable()) {
      return { ok: false, exitCode: -1, stdout: '', stderr: 'Shizuku not connected', timedOut: false };
    }
    const entry = { cmd, opts, timestamp: Date.now(), result: null };
    try {
      entry.result = JSON.parse(window.Shizuku.execWithOptions(cmd, JSON.stringify(opts)));
    } catch (e) {
      entry.result = { ok: false, exitCode: -1, stdout: '', stderr: e.message, timedOut: false };
    }
    history.unshift(entry);
    if (history.length > MAX_HISTORY) history.pop();
    return entry.result;
  }

  function getHistory() { return [...history]; }
  function clearHistory() { history.length = 0; }
  function isConnected() { return connected; }

  return { isAvailable, checkConnection, getModuleInfo, exec, execWithOptions, getHistory, clearHistory, isConnected, download };
})();

window.ShellBridge = ShellBridge;
