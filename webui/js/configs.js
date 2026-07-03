/**
 * ShizuConfigs — Configuration Management Engine
 * Save/load/export named config profiles via shell bridge
 */

const ConfigManager = (() => {
  const CONFIGS_DIR = 'configs';
  let profiles = [];

  function _getDir() {
    const info = ShellBridge.getModuleInfo();
    return info.moduleDir + '/' + CONFIGS_DIR;
  }

  function ensureDir() {
    ShellBridge.exec(`mkdir -p "${_getDir()}"`);
  }

  function listProfiles() {
    ensureDir();
    const r = ShellBridge.exec(`ls "${_getDir()}"/*.json 2>/dev/null`);
    if (!r.ok || !r.stdout.trim()) { profiles = []; return profiles; }
    profiles = r.stdout.trim().split('\n').map(f => {
      const name = f.split('/').pop().replace('.json', '');
      return { name, path: f };
    });
    return profiles;
  }

  function loadProfile(name) {
    const path = `${_getDir()}/${name}.json`;
    const r = ShellBridge.exec(`cat "${path}"`);
    if (!r.ok) return null;
    try { return JSON.parse(r.stdout); } catch(e) { return null; }
  }

  function saveProfile(name, data) {
    ensureDir();
    const path = `${_getDir()}/${name}.json`;
    const json = JSON.stringify(data, null, 2);
    const escaped = json.replace(/'/g, "'\\''");
    const r = ShellBridge.exec(`echo '${escaped}' > "${path}"`);
    return r.ok;
  }

  function deleteProfile(name) {
    const path = `${_getDir()}/${name}.json`;
    const r = ShellBridge.exec(`rm -f "${path}"`);
    return r.ok;
  }

  function captureCurrentState() {
    const state = { timestamp: new Date().toISOString(), sections: {} };
    // Capture display settings
    const size = ShellBridge.exec('wm size');
    const density = ShellBridge.exec('wm density');
    state.sections.display = { size: size.stdout.trim(), density: density.stdout.trim() };
    // Capture some global settings
    const globals = ShellBridge.exec('settings list global');
    state.sections.global_settings = {};
    if (globals.ok) {
      globals.stdout.trim().split('\n').forEach(line => {
        const [k, ...v] = line.split('=');
        if (k) state.sections.global_settings[k] = v.join('=');
      });
    }
    // Capture secure settings
    const secures = ShellBridge.exec('settings list secure');
    state.sections.secure_settings = {};
    if (secures.ok) {
      secures.stdout.trim().split('\n').forEach(line => {
        const [k, ...v] = line.split('=');
        if (k) state.sections.secure_settings[k] = v.join('=');
      });
    }
    return state;
  }

  function applyProfile(profile) {
    const results = [];
    if (profile.sections && profile.sections.display) {
      const d = profile.sections.display;
      if (d.customSize) {
        results.push(ShellBridge.exec(`wm size ${d.customSize}`));
      }
      if (d.customDensity) {
        results.push(ShellBridge.exec(`wm density ${d.customDensity}`));
      }
    }
    if (profile.sections && profile.sections.global_settings) {
      Object.entries(profile.sections.global_settings).forEach(([k, v]) => {
        if (['transition_animation_scale','window_animation_scale','animator_duration_scale'].includes(k)) {
          results.push(ShellBridge.exec(`settings put global ${k} ${v}`));
        }
      });
    }
    return results;
  }

  function exportProfileJSON(name) {
    const profile = loadProfile(name);
    if (!profile) return null;
    return JSON.stringify(profile, null, 2);
  }

  return { listProfiles, loadProfile, saveProfile, deleteProfile, captureCurrentState, applyProfile, exportProfileJSON };
})();

window.ConfigManager = ConfigManager;
