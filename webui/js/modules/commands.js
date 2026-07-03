/**
 * ShizuConfigs — Custom Commands Module (Material 3 / BeerCSS)
 */

const CommandsModule = (() => {
  let favorites = [];
  const PRESET_COMMANDS = [
    { cat: 'Система', name: 'Инфо устройства', cmd: 'getprop ro.product.model && getprop ro.build.version.release', icon: 'smartphone' },
    { cat: 'Система', name: 'Аптайм', cmd: 'uptime', icon: 'schedule' },
    { cat: 'Система', name: 'Ядро', cmd: 'uname -a', icon: 'memory' },
    { cat: 'Система', name: 'Сервисы', cmd: 'dumpsys activity services | head -30', icon: 'miscellaneous_services' },
    { cat: 'Система', name: 'Top процессы', cmd: 'top -n 1 -b | head -20', icon: 'monitor_heart' },
    { cat: 'Система', name: 'SELinux', cmd: 'getenforce', icon: 'security' },
    { cat: 'Система', name: 'Все свойства', cmd: 'getprop', icon: 'list' },
    { cat: 'Пакеты', name: 'Пользователь', cmd: 'pm list packages -3', icon: 'person' },
    { cat: 'Пакеты', name: 'Отключённые', cmd: 'pm list packages -d', icon: 'block' },
    { cat: 'Пакеты', name: 'Количество', cmd: 'pm list packages | wc -l', icon: 'numbers' },
    { cat: 'Настройки', name: 'Global', cmd: 'settings list global', icon: 'public' },
    { cat: 'Настройки', name: 'Secure', cmd: 'settings list secure', icon: 'lock' },
    { cat: 'Настройки', name: 'System', cmd: 'settings list system', icon: 'settings' },
    { cat: 'Настройки', name: 'Анимации', cmd: 'settings get global window_animation_scale && settings get global transition_animation_scale && settings get global animator_duration_scale', icon: 'animation' },
    { cat: 'Сеть', name: 'WiFi', cmd: 'dumpsys wifi | head -20', icon: 'wifi' },
    { cat: 'Сеть', name: 'IP адрес', cmd: 'ip addr show wlan0', icon: 'lan' },
    { cat: 'Сеть', name: 'DNS', cmd: 'getprop net.dns1 && getprop net.dns2', icon: 'dns' },
    { cat: 'Экран', name: 'Размер и DPI', cmd: 'wm size && wm density', icon: 'aspect_ratio' },
    { cat: 'Железо', name: 'Батарея', cmd: 'dumpsys battery', icon: 'battery_full' },
    { cat: 'Железо', name: 'CPU', cmd: 'cat /proc/cpuinfo', icon: 'developer_board' },
    { cat: 'Железо', name: 'Память', cmd: 'cat /proc/meminfo | head -10', icon: 'memory' },
    { cat: 'Железо', name: 'Диск', cmd: 'df -h', icon: 'hard_drive' },
    { cat: 'Железо', name: 'Термо', cmd: 'dumpsys thermalservice', icon: 'thermostat' },
  ];

  function render() {
    const cats = [...new Set(PRESET_COMMANDS.map(c => c.cat))];
    return `
      <h5><i class="material-symbols-outlined" style="vertical-align:middle">code</i> Команды</h5>
      <p style="color:var(--on-surface-variant)">Терминал и конструктор команд</p>

      <div id="cmd-no-conn" style="display:none">
        <article class="not-connected-card"><i class="material-symbols-outlined">power_off</i><h6>Подключите Shizuku</h6></article>
      </div>
      <div id="cmd-content">
        <article class="no-padding" style="margin-bottom:16px">
          <div class="padding">
            <div class="row no-wrap" style="align-items:center;gap:10px;margin-bottom:12px">
              <button class="circle small tertiary-container"><i class="material-symbols-outlined">terminal</i></button>
              <h6 class="small no-margin max">Терминал</h6>
            </div>
            <div class="field label suffix border">
              <input id="cmd-input" onkeydown="if(event.key==='Enter')CommandsModule.execute()">
              <label>Команда</label>
              <i class="material-symbols-outlined" style="cursor:pointer" onclick="CommandsModule.execute()">play_arrow</i>
            </div>
            <div class="row" style="gap:6px;flex-wrap:wrap">
              <button class="small" onclick="CommandsModule.execute()"><i class="material-symbols-outlined">play_arrow</i> Выполнить</button>
              <button class="small border" onclick="CommandsModule.addFavorite()"><i class="material-symbols-outlined">star</i> Сохранить</button>
              <button class="small border" onclick="CommandsModule.clearOutput()"><i class="material-symbols-outlined">delete</i> Очистить</button>
            </div>
            <div id="cmd-output" class="terminal-output" style="margin-top:12px;min-height:50px"></div>
          </div>
        </article>

        <h6 class="small" style="color:var(--on-surface-variant);margin-bottom:8px"><i class="material-symbols-outlined" style="font-size:18px;vertical-align:middle">star</i> Избранное</h6>
        <div id="cmd-favorites" style="margin-bottom:16px"></div>

        <h6 class="small" style="color:var(--on-surface-variant);margin-bottom:8px"><i class="material-symbols-outlined" style="font-size:18px;vertical-align:middle">library_books</i> Библиотека</h6>
        <nav class="scroll" style="margin-bottom:8px">
          ${cats.map((c,i) => `<a class="chip ${i===0?'fill active':'border'}" data-cat="${c}" onclick="CommandsModule.showPresetCat('${c}',this)">${c}</a>`).join('')}
        </nav>
        <div id="cmd-presets" style="margin-bottom:16px"></div>

        <h6 class="small" style="color:var(--on-surface-variant);margin-bottom:8px"><i class="material-symbols-outlined" style="font-size:18px;vertical-align:middle">history</i> История</h6>
        <div id="cmd-history"></div>
        <button class="small border" style="margin-top:8px" onclick="CommandsModule.clearHistory()"><i class="material-symbols-outlined">clear_all</i> Очистить</button>

        <h6 class="small" style="margin:20px 0 10px;color:var(--on-surface-variant)"><i class="material-symbols-outlined" style="font-size:18px;vertical-align:middle">description</i> Мульти-скрипт</h6>
        <article class="no-padding">
          <div class="padding">
            <div class="field label border">
              <textarea id="cmd-script" rows="4"></textarea>
              <label>Команды (по одной на строку)</label>
            </div>
            <button class="small" onclick="CommandsModule.runScript()"><i class="material-symbols-outlined">play_arrow</i> Запустить</button>
            <div id="cmd-script-output" class="terminal-output" style="margin-top:12px;display:none"></div>
          </div>
        </article>
      </div>`;
  }

  function init() {
    const conn = ShellBridge.isConnected() || ShellBridge.checkConnection();
    document.getElementById('cmd-no-conn').style.display = conn ? 'none' : 'block';
    document.getElementById('cmd-content').style.display = conn ? 'block' : 'none';
    loadFavorites();
    showPresetCat('Система');
    renderHistory();
  }

  function execute() {
    if (!App.requireConnection()) return;
    const cmd = document.getElementById('cmd-input').value.trim();
    if (!cmd) return;
    const out = document.getElementById('cmd-output');
    out.innerHTML += `<span class="cmd-prompt">$ ${escHtml(cmd)}</span>\n`;
    const r = ShellBridge.exec(cmd);
    if (r.stdout) out.innerHTML += escHtml(r.stdout) + '\n';
    if (r.stderr) out.innerHTML += `<span class="cmd-error">${escHtml(r.stderr)}</span>\n`;
    out.innerHTML += `<span class="cmd-info">exit: ${r.exitCode}</span>\n\n`;
    out.scrollTop = out.scrollHeight;
    renderHistory();
  }

  function clearOutput() { document.getElementById('cmd-output').innerHTML = ''; }

  function addFavorite() {
    const cmd = document.getElementById('cmd-input').value.trim();
    if (!cmd || favorites.includes(cmd)) return;
    favorites.push(cmd);
    saveFavorites(); loadFavorites();
    App.toast('Добавлено в избранное', 'success');
  }

  function loadFavorites() {
    try { const s = localStorage.getItem('shizuconfigs_favorites'); if (s) favorites = JSON.parse(s); } catch(e) {}
    const el = document.getElementById('cmd-favorites');
    if (!el) return;
    if (!favorites.length) {
      el.innerHTML = '<p class="small" style="color:var(--on-surface-variant)">Нет избранных</p>';
      return;
    }
    el.innerHTML = favorites.map((f,i) => `
      <div class="setting-row">
        <i class="material-symbols-outlined" style="color:#fbbf24">star</i>
        <div class="setting-row-content" onclick="CommandsModule.useCmd('${escAttr(f)}')" style="cursor:pointer">
          <div class="setting-row-title" style="font-family:monospace;font-size:.8rem">${escHtml(f)}</div>
        </div>
        <button class="circle transparent small" onclick="CommandsModule.removeFavorite(${i})"><i class="material-symbols-outlined">close</i></button>
      </div>`).join('');
  }

  function saveFavorites() { try { localStorage.setItem('shizuconfigs_favorites', JSON.stringify(favorites)); } catch(e) {} }
  function removeFavorite(idx) { favorites.splice(idx, 1); saveFavorites(); loadFavorites(); }
  function useCmd(cmd) { document.getElementById('cmd-input').value = cmd; document.getElementById('cmd-input').focus(); }

  function showPresetCat(cat, el) {
    if (el) { document.querySelectorAll('[data-cat]').forEach(t => { t.classList.remove('fill','active'); t.classList.add('border'); }); el.classList.remove('border'); el.classList.add('fill','active'); }
    document.getElementById('cmd-presets').innerHTML = PRESET_COMMANDS.filter(c => c.cat === cat).map(p => `
      <div class="setting-row" onclick="CommandsModule.useCmd('${escAttr(p.cmd)}')" style="cursor:pointer">
        <i class="material-symbols-outlined">${p.icon}</i>
        <div class="setting-row-content">
          <div class="setting-row-title">${p.name}</div>
          <div class="setting-row-desc" style="font-family:monospace">${escHtml(p.cmd)}</div>
        </div>
        <button class="circle transparent small" onclick="event.stopPropagation();CommandsModule.useCmd('${escAttr(p.cmd)}');CommandsModule.execute()"><i class="material-symbols-outlined">play_arrow</i></button>
      </div>`).join('');
  }

  function renderHistory() {
    const el = document.getElementById('cmd-history');
    if (!el) return;
    const hist = ShellBridge.getHistory().slice(0, 20);
    if (!hist.length) { el.innerHTML = '<p class="small" style="color:var(--on-surface-variant)">Пусто</p>'; return; }
    el.innerHTML = hist.map(h => `
      <div class="setting-row" onclick="CommandsModule.useCmd('${escAttr(h.cmd)}')" style="cursor:pointer">
        <i class="material-symbols-outlined">${h.result?.ok ? 'check_circle' : 'cancel'}</i>
        <div class="setting-row-content">
          <div class="setting-row-title" style="font-family:monospace;font-size:.78rem">${escHtml(h.cmd)}</div>
          <div class="setting-row-desc">${new Date(h.timestamp).toLocaleTimeString()} — exit ${h.result?.exitCode??'?'}</div>
        </div>
      </div>`).join('');
  }

  function clearHistory() { ShellBridge.clearHistory(); renderHistory(); App.toast('История очищена', 'success'); }

  function runScript() {
    if (!App.requireConnection()) return;
    const text = document.getElementById('cmd-script').value.trim();
    if (!text) return;
    const out = document.getElementById('cmd-script-output');
    out.style.display = 'block'; out.innerHTML = '';
    const lines = text.split('\n').filter(l => l.trim());
    lines.forEach(cmd => {
      out.innerHTML += `<span class="cmd-prompt">$ ${escHtml(cmd)}</span>\n`;
      const r = ShellBridge.exec(cmd);
      if (r.stdout) out.innerHTML += escHtml(r.stdout) + '\n';
      if (r.stderr) out.innerHTML += `<span class="cmd-error">${escHtml(r.stderr)}</span>\n`;
    });
    out.innerHTML += `<span class="cmd-info">Скрипт завершён (${lines.length} команд)</span>`;
    App.toast(`Выполнено: ${lines.length} команд`, 'success');
  }

  function escHtml(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function escAttr(s) { return (s||'').replace(/'/g, "\\'").replace(/\\/g, '\\\\'); }

  return { render, init, execute, clearOutput, addFavorite, removeFavorite, useCmd, showPresetCat, renderHistory, clearHistory, runScript };
})();

window.CommandsModule = CommandsModule;
