/**
 * ShizuConfigs — Package Manager Module (Material 3 / BeerCSS)
 */

const PackagesModule = (() => {
  let packages = [];
  let filter = 'all';
  let search = '';

  function render() {
    return `
      <h5><i class="material-symbols-outlined" style="vertical-align:middle">inventory_2</i> Packages</h5>
      <p style="color:var(--on-surface-variant)">Manage installed applications</p>

      <div id="pkg-no-conn" style="display:none">
        <article class="not-connected-card"><i class="material-symbols-outlined">power_off</i><h6>Connect Shizuku</h6></article>
      </div>
      <div id="pkg-content">
        <div class="field label suffix border round" style="margin-bottom:12px">
          <input type="text" id="pkg-search" oninput="PackagesModule.onSearch(this.value)">
          <label>Search packages</label>
          <i class="material-symbols-outlined">search</i>
        </div>
        <div class="row wrap" style="gap:6px;margin-bottom:14px">
          <button class="chip fill active" data-filter="all" onclick="PackagesModule.setFilter('all',this)">All</button>
          <button class="chip border" data-filter="user" onclick="PackagesModule.setFilter('user',this)"><i class="material-symbols-outlined">person</i> User</button>
          <button class="chip border" data-filter="system" onclick="PackagesModule.setFilter('system',this)"><i class="material-symbols-outlined">android</i> System</button>
          <button class="chip border" data-filter="disabled" onclick="PackagesModule.setFilter('disabled',this)"><i class="material-symbols-outlined">block</i> Disabled</button>
        </div>
        <div id="pkg-count" style="font-size:.75rem;color:var(--on-surface-variant);margin-bottom:10px"></div>
        <div id="pkg-list"></div>
      </div>
      <dialog id="pkg-detail-dialog">
        <h6 id="pkg-detail-title">—</h6>
        <div id="pkg-detail-body"><progress class="circle"></progress></div>
        <p class="small bold" style="margin-top:16px;color:var(--on-surface-variant)">Actions</p>
        <div class="row wrap" style="gap:6px" id="pkg-detail-actions"></div>
        <nav class="right-align">
          <button class="border" onclick="ui('#pkg-detail-dialog')"><i class="material-symbols-outlined">close</i> Close</button>
        </nav>
      </dialog>`;
  }

  function init() {
    const conn = ShellBridge.isConnected() || ShellBridge.checkConnection();
    document.getElementById('pkg-no-conn').style.display = conn ? 'none' : 'block';
    document.getElementById('pkg-content').style.display = conn ? 'block' : 'none';
    if (conn) loadPackages();
  }

  function loadPackages() {
    const flag = filter === 'user' ? '-3' : filter === 'system' ? '-s' : filter === 'disabled' ? '-d' : '';
    const r = ShellBridge.exec(`pm list packages ${flag}`);
    if (!r.ok) { packages = []; renderList(); return; }
    packages = r.stdout.trim().split('\n').map(l => l.replace('package:', '').trim()).filter(Boolean).sort();
    renderList();
  }

  function renderList() {
    const filtered = search ? packages.filter(p => p.toLowerCase().includes(search.toLowerCase())) : packages;
    document.getElementById('pkg-count').textContent = `${filtered.length} packages`;
    const el = document.getElementById('pkg-list');
    if (!filtered.length) {
      el.innerHTML = '<article class="not-connected-card" style="padding:24px"><i class="material-symbols-outlined">search_off</i><p>Packages not found</p></article>';
      return;
    }
    el.innerHTML = filtered.slice(0, 80).map(p => `
      <div class="setting-row" onclick="PackagesModule.showDetail('${p}')">
        <i class="material-symbols-outlined">apps</i>
        <div class="setting-row-content">
          <div class="setting-row-title">${p}</div>
        </div>
        <i class="material-symbols-outlined" style="font-size:18px;color:var(--on-surface-variant)">chevron_right</i>
      </div>`).join('') + (filtered.length > 80 ? `<p class="center-align small" style="color:var(--on-surface-variant)">+ ${filtered.length - 80} more</p>` : '');
  }

  function onSearch(val) { search = val; renderList(); }

  function setFilter(f, el) {
    filter = f;
    document.querySelectorAll('.chip[data-filter]').forEach(c => { c.classList.remove('fill','active'); c.classList.add('border'); });
    el.classList.remove('border'); el.classList.add('fill','active');
    loadPackages();
  }

  function showDetail(pkg) {
    document.getElementById('pkg-detail-title').textContent = pkg;
    document.getElementById('pkg-detail-body').innerHTML = '<progress class="circle"></progress>';
    document.getElementById('pkg-detail-actions').innerHTML = `
      <button class="small" onclick="PackagesModule.pkgAction('${pkg}','force-stop')"><i class="material-symbols-outlined">stop_circle</i> Stop</button>
      <button class="small" onclick="PackagesModule.pkgAction('${pkg}','clear')"><i class="material-symbols-outlined">delete_sweep</i> Clear</button>
      <button class="small" onclick="PackagesModule.pkgAction('${pkg}','disable')"><i class="material-symbols-outlined">block</i> Disable</button>
      <button class="small" onclick="PackagesModule.pkgAction('${pkg}','enable')"><i class="material-symbols-outlined">check_circle</i> Enable</button>
      <button class="small error" onclick="PackagesModule.pkgAction('${pkg}','uninstall')"><i class="material-symbols-outlined">delete_forever</i> Uninstall</button>`;
    ui('#pkg-detail-dialog');
    setTimeout(() => {
      const dump = ShellBridge.exec(`dumpsys package ${pkg} | head -30`);
      document.getElementById('pkg-detail-body').innerHTML = `<div class="terminal-output" style="max-height:180px">${escHtml(dump.ok ? dump.stdout : dump.stderr)}</div>`;
    }, 50);
  }

  function pkgAction(pkg, action) {
    const cmds = { 'force-stop': `am force-stop ${pkg}`, clear: `pm clear ${pkg}`, disable: `pm disable-user --user 0 ${pkg}`, enable: `pm enable ${pkg}`, uninstall: `pm uninstall --user 0 ${pkg}` };
    const r = ShellBridge.exec(cmds[action]);
    App.toast(r.ok ? `${action}: success` : `Error: ${r.stderr}`, r.ok ? 'success' : 'error');
    if (['uninstall','disable','enable'].includes(action)) { ui('#pkg-detail-dialog'); loadPackages(); }
  }

  function escHtml(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  return { render, init, onSearch, setFilter, showDetail, pkgAction };
})();

window.PackagesModule = PackagesModule;
