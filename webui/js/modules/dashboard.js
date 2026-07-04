/**
 * ShizuConfigs — Dashboard Module (Material 3 / BeerCSS)
 */

const DashboardModule = (() => {
  function render() {
    return `
      <div class="hero-card">
        <div class="row no-wrap" style="align-items:center;gap:12px;margin-bottom:12px">
          <i class="material-symbols-outlined" style="font-size:36px">shield</i>
          <div>
            <h6 style="margin:0;color:#fff">Shizuku Bridge</h6>
            <div id="dash-bridge-status" style="font-size:.85rem;opacity:.85">Checking...</div>
          </div>
        </div>
        <div class="row" style="gap:8px">
          <span class="chip small no-elevate" id="dash-mode-badge" style="background:rgba(255,255,255,.18);color:#fff">—</span>
          <span class="chip small no-elevate" id="dash-trusted-badge" style="background:rgba(255,255,255,.18);color:#fff">—</span>
          <span class="chip small no-elevate" id="dash-uid-badge" style="background:rgba(255,255,255,.18);color:#fff">—</span>
        </div>
      </div>

      <div id="dash-not-connected" style="display:none">
        <article class="not-connected-card">
          <i class="material-symbols-outlined">power_off</i>
          <h6>Shizuku is not connected</h6>
          <p>Open WebUI via Shizuku Manager</p>
        </article>
      </div>

      <div id="dash-connected" style="display:none">
        <div class="grid-2">
          <article class="no-padding">
            <div class="padding">
              <div class="row no-wrap" style="align-items:center;gap:12px;margin-bottom:12px">
                <button class="circle small primary-container"><i class="material-symbols-outlined">smartphone</i></button>
                <div>
                  <h6 class="small no-margin">Device</h6>
                  <div class="small" id="dash-model" style="color:var(--on-surface-variant)">—</div>
                </div>
              </div>
              <div class="stat-grid" id="dash-device-info"></div>
            </div>
          </article>
          <article class="no-padding">
            <div class="padding">
              <div class="row no-wrap" style="align-items:center;gap:12px;margin-bottom:12px">
                <button class="circle small secondary-container"><i class="material-symbols-outlined">build</i></button>
                <div>
                  <h6 class="small no-margin">System</h6>
                  <div class="small" id="dash-android" style="color:var(--on-surface-variant)">—</div>
                </div>
              </div>
              <div class="stat-grid" id="dash-system-info"></div>
            </div>
          </article>
        </div>

        <h6 class="small" style="margin:20px 0 10px;color:var(--on-surface-variant)">
          <i class="material-symbols-outlined" style="font-size:18px;vertical-align:middle">monitoring</i> Resources
        </h6>
        <div class="grid-2">
          <article class="no-padding">
            <div class="padding">
              <div class="row" style="justify-content:space-between;align-items:center;margin-bottom:8px">
                <span class="bold"><i class="material-symbols-outlined" style="font-size:18px;vertical-align:middle">memory</i> RAM</span>
                <span class="chip small no-elevate primary-container" id="dash-ram-pct">—</span>
              </div>
              <div class="gauge-bar"><div class="gauge-bar-fill" id="dash-ram-bar" style="width:0"></div></div>
              <div class="small" style="color:var(--on-surface-variant);margin-top:6px" id="dash-ram-detail">—</div>
            </div>
          </article>
          <article class="no-padding">
            <div class="padding">
              <div class="row" style="justify-content:space-between;align-items:center;margin-bottom:8px">
                <span class="bold"><i class="material-symbols-outlined" style="font-size:18px;vertical-align:middle">hard_drive</i> Storage</span>
                <span class="chip small no-elevate primary-container" id="dash-storage-pct">—</span>
              </div>
              <div class="gauge-bar"><div class="gauge-bar-fill" id="dash-storage-bar" style="width:0"></div></div>
              <div class="small" style="color:var(--on-surface-variant);margin-top:6px" id="dash-storage-detail">—</div>
            </div>
          </article>
        </div>

        <h6 class="small" style="margin:20px 0 10px;color:var(--on-surface-variant)">
          <i class="material-symbols-outlined" style="font-size:18px;vertical-align:middle">bolt</i> Quick Actions
        </h6>
        <div class="row wrap" style="gap:6px">
          <button class="chip border" onclick="DashboardModule.quickAction('pkgcount')"><i class="material-symbols-outlined">inventory_2</i> Packages</button>
          <button class="chip border" onclick="DashboardModule.quickAction('battery')"><i class="material-symbols-outlined">battery_full</i> Battery</button>
          <button class="chip border" onclick="DashboardModule.quickAction('uptime')"><i class="material-symbols-outlined">schedule</i> Uptime</button>
          <button class="chip border" onclick="DashboardModule.quickAction('thermal')"><i class="material-symbols-outlined">thermostat</i> Thermal</button>
          <button class="chip border" onclick="DashboardModule.quickAction('kernel')"><i class="material-symbols-outlined">memory</i> Kernel</button>
          <button class="chip border" onclick="DashboardModule.quickAction('snapshot')"><i class="material-symbols-outlined">photo_camera</i> Snapshot</button>
        </div>
        <div id="dash-quick-output" class="terminal-output" style="margin-top:12px;display:none"></div>

        <h6 class="small" style="margin:20px 0 10px;color:var(--on-surface-variant)">
          <i class="material-symbols-outlined" style="font-size:18px;vertical-align:middle">history</i> Recent Commands
        </h6>
        <div id="dash-history-list"></div>
      </div>`;
  }

  function init() {
    const conn = ShellBridge.checkConnection();
    document.getElementById('dash-not-connected').style.display = conn ? 'none' : 'block';
    document.getElementById('dash-connected').style.display = conn ? 'block' : 'none';

    const info = ShellBridge.getModuleInfo();
    document.getElementById('dash-bridge-status').textContent = conn ? 'Connected' : 'Not Connected';
    document.getElementById('dash-mode-badge').textContent = info ? (info.accessMode || 'none') : 'none';
    
    if (info && info.trusted) {
      document.getElementById('dash-trusted-badge').textContent = 'Full Trust';
      document.getElementById('dash-trusted-badge').style.background = 'rgba(74,222,128,.2)';
      document.getElementById('dash-trusted-badge').style.color = '#4ade80';
      document.getElementById('dash-trusted-badge').style.display = 'inline-flex';
    } else {
      document.getElementById('dash-trusted-badge').style.display = 'none';
    }

    if (conn) {
      const uid = ShellBridge.exec('id');
      document.getElementById('dash-uid-badge').textContent = uid.ok ? uid.stdout.trim().split(' ')[0] : '—';
      loadDeviceInfo();
      loadResources();
      loadHistory();
    } else {
      document.getElementById('dash-uid-badge').textContent = 'offline';
    }
  }

  function _s(id) { return document.getElementById(id); }
  function _stat(label, value) {
    return `<div class="stat-item"><div class="stat-label">${label}</div><div class="stat-value">${value || '—'}</div></div>`;
  }
  function _prop(prop) { const r = ShellBridge.exec('getprop ' + prop); return r.ok ? r.stdout.trim() : '—'; }

  function loadDeviceInfo() {
    const model = _prop('ro.product.model');
    const brand = _prop('ro.product.brand');
    _s('dash-model').textContent = `${brand} ${model}`;
    _s('dash-device-info').innerHTML =
      _stat('Device', _prop('ro.product.device')) +
      _stat('Architecture', _prop('ro.product.cpu.abi')) +
      _stat('Manufacturer', _prop('ro.product.manufacturer')) +
      _stat('Kernel', ShellBridge.exec('uname -r').stdout?.trim() || '—');
    const android = _prop('ro.build.version.release');
    const sdk = _prop('ro.build.version.sdk');
    _s('dash-android').textContent = `Android ${android} (SDK ${sdk})`;
    _s('dash-system-info').innerHTML =
      _stat('Build', _prop('ro.build.display.id')) +
      _stat('Patch', _prop('ro.build.version.security_patch'));
  }

  function loadResources() {
    const mem = ShellBridge.exec('cat /proc/meminfo | head -3');
    if (mem.ok) {
      const lines = mem.stdout.trim().split('\n');
      const total = parseInt(lines[0]?.match(/\d+/)?.[0] || 0);
      const free = parseInt(lines[1]?.match(/\d+/)?.[0] || 0);
      const used = total - free;
      const pct = total ? Math.round((used / total) * 100) : 0;
      _s('dash-ram-pct').textContent = pct + '%';
      _s('dash-ram-bar').style.width = pct + '%';
      _s('dash-ram-bar').className = 'gauge-bar-fill' + (pct > 85 ? ' danger' : pct > 70 ? ' warn' : '');
      _s('dash-ram-detail').textContent = `${(used/1024/1024).toFixed(1)} / ${(total/1024/1024).toFixed(1)} GB`;
    }
    const stor = ShellBridge.exec('df /data');
    if (stor.ok) {
      const m = stor.stdout.match(/(\d+)%/);
      const pct = m ? parseInt(m[1]) : 0;
      _s('dash-storage-pct').textContent = pct + '%';
      _s('dash-storage-bar').style.width = pct + '%';
      _s('dash-storage-bar').className = 'gauge-bar-fill' + (pct > 90 ? ' danger' : pct > 75 ? ' warn' : '');
      const parts = stor.stdout.trim().split(/\s+/);
      _s('dash-storage-detail').textContent = parts.length > 3 ? `${parts[2]} / ${parts[1]}` : stor.stdout.trim();
    }
  }

  function loadHistory() {
    const el = _s('dash-history-list');
    const hist = ShellBridge.getHistory().slice(0, 5);
    if (!hist.length) {
      el.innerHTML = '<article class="not-connected-card" style="padding:24px"><i class="material-symbols-outlined">terminal</i><p>No commands executed yet</p></article>';
      return;
    }
    el.innerHTML = hist.map(h => `
      <div class="setting-row">
        <i class="material-symbols-outlined">${h.result?.ok ? 'check_circle' : 'cancel'}</i>
        <div class="setting-row-content">
          <div class="setting-row-title" style="font-family:monospace;font-size:.8rem">${escHtml(h.cmd)}</div>
          <div class="setting-row-desc">${new Date(h.timestamp).toLocaleTimeString()}</div>
        </div>
      </div>`).join('');
  }

  function quickAction(action) {
    if (!ShellBridge.isConnected()) { App.toast('Shizuku is not connected', 'error'); return; }
    const out = _s('dash-quick-output');
    out.style.display = 'block';
    let r;
    switch(action) {
      case 'pkgcount':
        const all = ShellBridge.exec('pm list packages');
        const sys = ShellBridge.exec('pm list packages -s');
        const usr = ShellBridge.exec('pm list packages -3');
        r = `📦 Packages Count\n  Total:     ${all.ok ? all.stdout.trim().split('\n').length : '?'}\n  System:    ${sys.ok ? sys.stdout.trim().split('\n').length : '?'}\n  User:      ${usr.ok ? usr.stdout.trim().split('\n').length : '?'}`;
        break;
      case 'battery': r = ShellBridge.exec('dumpsys battery'); r = r.ok ? r.stdout : r.stderr; break;
      case 'uptime': r = ShellBridge.exec('uptime'); r = r.ok ? r.stdout : r.stderr; break;
      case 'thermal': r = ShellBridge.exec('dumpsys thermalservice'); r = r.ok ? r.stdout : r.stderr; break;
      case 'kernel': r = ShellBridge.exec('uname -a'); r = r.ok ? r.stdout : r.stderr; break;
      case 'snapshot':
        const state = ConfigManager.captureCurrentState();
        const name = 'snapshot-' + Date.now();
        ConfigManager.saveProfile(name, state);
        r = `📸 Snapshot saved: "${name}"`;
        break;
    }
    out.textContent = r || '';
    App.toast('Done', 'success');
  }

  function escHtml(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  return { render, init, quickAction };
})();

window.DashboardModule = DashboardModule;
