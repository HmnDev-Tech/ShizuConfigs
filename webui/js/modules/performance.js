/**
 * ShizuConfigs — Performance Module (Material 3 / BeerCSS)
 */

const PerformanceModule = (() => {
  function render() {
    return `
      <h5><i class="material-symbols-outlined" style="vertical-align:middle">speed</i> Производительность</h5>
      <p style="color:var(--on-surface-variant)">Батарея, CPU, память и температура</p>

      <div id="perf-no-conn" style="display:none">
        <article class="not-connected-card"><i class="material-symbols-outlined">power_off</i><h6>Подключите Shizuku</h6></article>
      </div>
      <div id="perf-content">
        <div class="grid-2">
          <article class="no-padding">
            <div class="padding">
              <div class="row no-wrap" style="align-items:center;gap:10px;margin-bottom:12px">
                <button class="circle small" style="background:rgba(74,222,128,.15);color:#4ade80"><i class="material-symbols-outlined">battery_full</i></button>
                <div><h6 class="small no-margin">Батарея</h6><div class="small" id="perf-bat-level" style="color:var(--on-surface-variant)">—</div></div>
              </div>
              <div id="perf-bat-info"></div>
            </div>
          </article>
          <article class="no-padding">
            <div class="padding">
              <div class="row no-wrap" style="align-items:center;gap:10px;margin-bottom:12px">
                <button class="circle small" style="background:rgba(251,191,36,.15);color:#fbbf24"><i class="material-symbols-outlined">thermostat</i></button>
                <div><h6 class="small no-margin">Температура</h6><div class="small" id="perf-thermal-status" style="color:var(--on-surface-variant)">—</div></div>
              </div>
              <div id="perf-thermal-info" class="terminal-output" style="max-height:150px;font-size:.75rem"></div>
            </div>
          </article>
        </div>

        <h6 class="small" style="margin:20px 0 10px;color:var(--on-surface-variant)"><i class="material-symbols-outlined" style="font-size:18px;vertical-align:middle">developer_board</i> Процессор</h6>
        <article class="no-padding"><div class="padding"><div id="perf-cpu-info" class="terminal-output" style="max-height:200px;font-size:.75rem"></div></div></article>

        <h6 class="small" style="margin:20px 0 10px;color:var(--on-surface-variant)"><i class="material-symbols-outlined" style="font-size:18px;vertical-align:middle">memory</i> Память</h6>
        <article class="no-padding"><div class="padding" id="perf-mem-info"></div></article>

        <h6 class="small" style="margin:20px 0 10px;color:var(--on-surface-variant)"><i class="material-symbols-outlined" style="font-size:18px;vertical-align:middle">bolt</i> Действия</h6>
        <div class="row" style="gap:8px">
          <button class="border" onclick="PerformanceModule.action('cache')"><i class="material-symbols-outlined">delete_sweep</i> Сбросить кеш</button>
          <button class="border" onclick="PerformanceModule.action('refresh')"><i class="material-symbols-outlined">refresh</i> Обновить</button>
        </div>
        <div id="perf-action-output" class="terminal-output" style="margin-top:12px;display:none"></div>
      </div>`;
  }

  function init() {
    const conn = ShellBridge.isConnected() || ShellBridge.checkConnection();
    document.getElementById('perf-no-conn').style.display = conn ? 'none' : 'block';
    document.getElementById('perf-content').style.display = conn ? 'block' : 'none';
    if (conn) loadAll();
  }

  function loadAll() { loadBattery(); loadThermal(); loadCPU(); loadMemory(); }

  function loadBattery() {
    const r = ShellBridge.exec('dumpsys battery');
    if (!r.ok) return;
    const lines = r.stdout.trim().split('\n');
    let level='?',status='?',temp='?',volt='?',tech='?',powered='';
    lines.forEach(l => {
      const t = l.trim();
      if (t.startsWith('level:')) level = t.split(':')[1].trim();
      if (t.startsWith('status:')) { const s=parseInt(t.split(':')[1]); status=['?','Зарядка','Разрядка','Не заряж.','Полный'][s]||s; }
      if (t.startsWith('temperature:')) temp = (parseInt(t.split(':')[1])/10).toFixed(1)+'°C';
      if (t.startsWith('voltage:')) volt = t.split(':')[1].trim()+' mV';
      if (t.startsWith('technology:')) tech = t.split(':')[1].trim();
      if (t.includes('powered: true')) powered += t.split(' ')[0].replace(':','') + ' ';
    });
    document.getElementById('perf-bat-level').textContent = `${level}% — ${status}`;
    document.getElementById('perf-bat-info').innerHTML = `
      <div class="stat-grid">
        <div class="stat-item"><div class="stat-label">Температура</div><div class="stat-value">${temp}</div></div>
        <div class="stat-item"><div class="stat-label">Напряжение</div><div class="stat-value">${volt}</div></div>
        <div class="stat-item"><div class="stat-label">Технология</div><div class="stat-value">${tech}</div></div>
        <div class="stat-item"><div class="stat-label">Источник</div><div class="stat-value">${powered||'Батарея'}</div></div>
      </div>
      <div class="gauge-bar" style="margin-top:12px"><div class="gauge-bar-fill ${parseInt(level)<20?'danger':parseInt(level)<50?'warn':'success'}" style="width:${level}%"></div></div>`;
  }

  function loadThermal() {
    const r = ShellBridge.exec('dumpsys thermalservice');
    document.getElementById('perf-thermal-info').textContent = r.ok ? r.stdout.trim() : 'Недоступно';
    const m = r.ok ? r.stdout.match(/Thermal Status:\s*(\d+)/) : null;
    document.getElementById('perf-thermal-status').textContent = m ? ['Норма','Лёгкий','Умеренный','Серьёзный','Критический','Аварийный','Выкл'][parseInt(m[1])]||m[1] : '—';
  }

  function loadCPU() { const r = ShellBridge.exec('cat /proc/cpuinfo'); document.getElementById('perf-cpu-info').textContent = r.ok ? r.stdout.trim() : 'Недоступно'; }

  function loadMemory() {
    const r = ShellBridge.exec('cat /proc/meminfo | head -8');
    if (!r.ok) return;
    document.getElementById('perf-mem-info').innerHTML = r.stdout.trim().split('\n').map(l => {
      const p = l.split(':');
      if (p.length < 2) return '';
      return `<div class="row" style="justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--outline-variant)"><span class="small" style="color:var(--on-surface-variant)">${p[0].trim()}</span><span class="small bold">${p[1].trim()}</span></div>`;
    }).join('');
  }

  function action(type) {
    if (!App.requireConnection()) return;
    const out = document.getElementById('perf-action-output');
    out.style.display = 'block';
    if (type==='cache') { const r=ShellBridge.exec('echo 3 > /proc/sys/vm/drop_caches 2>&1 || echo "Нужен root"'); out.textContent=r.ok?r.stdout:r.stderr; }
    else if (type==='refresh') { loadAll(); out.textContent='Обновлено'; }
    App.toast('Готово','success');
  }

  return { render, init, action };
})();

window.PerformanceModule = PerformanceModule;
