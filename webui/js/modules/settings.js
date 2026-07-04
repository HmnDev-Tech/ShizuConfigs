/**
 * ShizuConfigs — Settings Editor (Material 3 / BeerCSS)
 */

const SettingsModule = (() => {
  let namespace = 'global';
  let settings = [];
  let search = '';

  const PRESETS = [
    { name: 'Turn off animations', cmds: ['settings put global window_animation_scale 0','settings put global transition_animation_scale 0','settings put global animator_duration_scale 0'], icon: 'animation' },
    { name: 'Fast (0.5x)', cmds: ['settings put global window_animation_scale 0.5','settings put global transition_animation_scale 0.5','settings put global animator_duration_scale 0.5'], icon: 'speed' },
    { name: 'Standard (1x)', cmds: ['settings put global window_animation_scale 1.0','settings put global transition_animation_scale 1.0','settings put global animator_duration_scale 1.0'], icon: 'replay' },
    { name: 'Enable ADB', cmds: ['settings put global adb_enabled 1'], icon: 'usb' },
    { name: 'Show touches', cmds: ['settings put system show_touches 1'], icon: 'touch_app' },
    { name: 'Hide touches', cmds: ['settings put system show_touches 0'], icon: 'do_not_touch' },
  ];

  function render() {
    return `
      <h5><i class="material-symbols-outlined" style="vertical-align:middle">tune</i> Settings</h5>
      <p style="color:var(--on-surface-variant)">Read and write system settings</p>

      <div id="set-no-conn" style="display:none">
        <article class="not-connected-card"><i class="material-symbols-outlined">power_off</i><h6>Connect Shizuku</h6></article>
      </div>
      <div id="set-content">
        <h6 class="small" style="color:var(--on-surface-variant);margin-bottom:10px"><i class="material-symbols-outlined" style="font-size:18px;vertical-align:middle">auto_fix_high</i> Quick Presets</h6>
        <div class="grid-3" style="margin-bottom:20px">
          ${PRESETS.map((p,i) => `
            <article class="no-padding preset-card" onclick="SettingsModule.applyPreset(${i})">
              <div class="padding small-padding">
                <i class="material-symbols-outlined" style="font-size:28px;color:var(--primary)">${p.icon}</i>
                <p class="small bold no-margin" style="margin-top:6px">${p.name}</p>
              </div>
            </article>`).join('')}
        </div>

        <nav class="scroll">
          <a class="chip active" data-ns="global" onclick="SettingsModule.setNamespace('global',this)">Global</a>
          <a class="chip border" data-ns="secure" onclick="SettingsModule.setNamespace('secure',this)">Secure</a>
          <a class="chip border" data-ns="system" onclick="SettingsModule.setNamespace('system',this)">System</a>
        </nav>

        <div class="field label suffix border round" style="margin:12px 0">
          <input type="text" id="settings-search" oninput="SettingsModule.onSearch(this.value)">
          <label>Search settings</label>
          <i class="material-symbols-outlined">search</i>
        </div>
        <div id="settings-count" style="font-size:.75rem;color:var(--on-surface-variant);margin-bottom:10px"></div>
        <div id="settings-list"></div>
      </div>

      <dialog id="settings-edit-dialog">
        <h6 id="settings-edit-title">Edit Setting</h6>
        <div class="field label border" style="margin-top:12px">
          <input id="settings-edit-ns" readonly>
          <label>Namespace</label>
        </div>
        <div class="field label border">
          <input id="settings-edit-key" readonly>
          <label>Key</label>
        </div>
        <div class="field label border">
          <input id="settings-edit-value">
          <label>Value</label>
        </div>
        <nav class="right-align">
          <button class="border" onclick="ui('#settings-edit-dialog')">Cancel</button>
          <button class="error" onclick="SettingsModule.deleteSetting()"><i class="material-symbols-outlined">delete</i> Delete</button>
          <button class="primary" onclick="SettingsModule.saveSetting()"><i class="material-symbols-outlined">save</i> Save</button>
        </nav>
      </dialog>`;
  }

  function init() {
    const conn = ShellBridge.isConnected() || ShellBridge.checkConnection();
    document.getElementById('set-no-conn').style.display = conn ? 'none' : 'block';
    document.getElementById('set-content').style.display = conn ? 'block' : 'none';
    if (conn) loadSettings();
  }

  function loadSettings() {
    const r = ShellBridge.exec(`settings list ${namespace}`);
    if (!r.ok) { settings = []; renderList(); return; }
    settings = r.stdout.trim().split('\n').map(line => {
      const idx = line.indexOf('=');
      if (idx === -1) return null;
      return { key: line.substring(0, idx), value: line.substring(idx + 1) };
    }).filter(Boolean);
    renderList();
  }

  function renderList() {
    const filtered = search ? settings.filter(s => s.key.toLowerCase().includes(search.toLowerCase()) || s.value.toLowerCase().includes(search.toLowerCase())) : settings;
    document.getElementById('settings-count').textContent = `${filtered.length} settings in ${namespace}`;
    const el = document.getElementById('settings-list');
    if (!filtered.length) {
      el.innerHTML = '<article class="not-connected-card" style="padding:24px"><i class="material-symbols-outlined">search_off</i><p>Not found</p></article>';
      return;
    }
    el.innerHTML = filtered.slice(0, 100).map(s => `
      <div class="setting-row" onclick="SettingsModule.editSetting('${escAttr(s.key)}','${escAttr(s.value)}')">
        <i class="material-symbols-outlined">key</i>
        <div class="setting-row-content">
          <div class="setting-row-title">${escHtml(s.key)}</div>
          <div class="setting-row-desc">${escHtml(s.value || '(empty)')}</div>
        </div>
        <i class="material-symbols-outlined" style="font-size:18px;color:var(--on-surface-variant)">edit</i>
      </div>`).join('') + (filtered.length > 100 ? `<p class="center-align small" style="color:var(--on-surface-variant)">+ ${filtered.length-100} more</p>` : '');
  }

  function setNamespace(ns, el) {
    namespace = ns;
    document.querySelectorAll('[data-ns]').forEach(t => { t.classList.remove('active'); t.classList.add('border'); });
    el.classList.remove('border'); el.classList.add('active');
    loadSettings();
  }

  function onSearch(val) { search = val; renderList(); }

  function editSetting(key, value) {
    document.getElementById('settings-edit-ns').value = namespace;
    document.getElementById('settings-edit-key').value = key;
    document.getElementById('settings-edit-value').value = value;
    document.getElementById('settings-edit-title').textContent = key;
    ui('#settings-edit-dialog');
  }

  function saveSetting() {
    const ns = document.getElementById('settings-edit-ns').value;
    const key = document.getElementById('settings-edit-key').value;
    const val = document.getElementById('settings-edit-value').value;
    const r = ShellBridge.exec(`settings put ${ns} ${key} ${val}`);
    App.toast(r.ok ? `${key} updated` : `Error: ${r.stderr}`, r.ok ? 'success' : 'error');
    ui('#settings-edit-dialog'); loadSettings();
  }

  function deleteSetting() {
    const ns = document.getElementById('settings-edit-ns').value;
    const key = document.getElementById('settings-edit-key').value;
    const r = ShellBridge.exec(`settings delete ${ns} ${key}`);
    App.toast(r.ok ? `${key} deleted` : `Error: ${r.stderr}`, r.ok ? 'success' : 'error');
    ui('#settings-edit-dialog'); loadSettings();
  }

  function applyPreset(idx) {
    if (!App.requireConnection()) return;
    PRESETS[idx].cmds.forEach(cmd => ShellBridge.exec(cmd));
    App.toast(`Applied: ${PRESETS[idx].name}`, 'success');
    loadSettings();
  }

  function escHtml(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function escAttr(s) { return (s||'').replace(/'/g, "\\'").replace(/"/g, '&quot;'); }

  return { render, init, setNamespace, onSearch, editSetting, saveSetting, deleteSetting, applyPreset };
})();

window.SettingsModule = SettingsModule;
