/**
 * ShizuConfigs — Display Manager (Material 3 / BeerCSS)
 */

const DisplayModule = (() => {
  const SIZE_PRESETS = [
    { label: '720p', value: '720x1280' },
    { label: '1080p', value: '1080x1920' },
    { label: '1440p', value: '1440x2560' },
    { label: '1344x2992', value: '1344x2992' },
  ];
  const DPI_PRESETS = [
    { label: 'Малый 320', value: '320' },
    { label: 'Стандарт 400', value: '400' },
    { label: 'Большой 480', value: '480' },
    { label: 'XL 560', value: '560' },
  ];

  function render() {
    return `
      <h5><i class="material-symbols-outlined" style="vertical-align:middle">screenshot_monitor</i> Экран</h5>
      <p style="color:var(--on-surface-variant)">Разрешение, DPI и управление дисплеем</p>

      <div id="disp-no-conn" style="display:none">
        <article class="not-connected-card"><i class="material-symbols-outlined">power_off</i><h6>Подключите Shizuku</h6></article>
      </div>
      <div id="disp-content">
        <div class="grid-2">
          <article class="no-padding">
            <div class="padding">
              <div class="row no-wrap" style="align-items:center;gap:10px;margin-bottom:12px">
                <button class="circle small primary-container"><i class="material-symbols-outlined">aspect_ratio</i></button>
                <div><h6 class="small no-margin">Разрешение</h6><div class="small" id="disp-size" style="color:var(--on-surface-variant)">—</div></div>
              </div>
              <div class="row wrap" style="gap:6px;margin-bottom:12px">
                ${SIZE_PRESETS.map(p => `<button class="chip border small" onclick="DisplayModule.setSize('${p.value}')">${p.label}</button>`).join('')}
              </div>
              <div class="field label border"><input id="disp-custom-size" placeholder=" "><label>Своё (WxH)</label></div>
              <div class="row" style="gap:8px">
                <button class="small" onclick="DisplayModule.applyCustomSize()"><i class="material-symbols-outlined">check</i> Применить</button>
                <button class="small border" onclick="DisplayModule.resetSize()"><i class="material-symbols-outlined">restart_alt</i> Сброс</button>
              </div>
            </div>
          </article>
          <article class="no-padding">
            <div class="padding">
              <div class="row no-wrap" style="align-items:center;gap:10px;margin-bottom:12px">
                <button class="circle small secondary-container"><i class="material-symbols-outlined">density_medium</i></button>
                <div><h6 class="small no-margin">DPI</h6><div class="small" id="disp-dpi" style="color:var(--on-surface-variant)">—</div></div>
              </div>
              <div class="row wrap" style="gap:6px;margin-bottom:12px">
                ${DPI_PRESETS.map(p => `<button class="chip border small" onclick="DisplayModule.setDpi('${p.value}')">${p.label}</button>`).join('')}
              </div>
              <div class="field label border"><input id="disp-custom-dpi" type="number" placeholder=" "><label>Своё DPI</label></div>
              <div class="row" style="gap:8px">
                <button class="small" onclick="DisplayModule.applyCustomDpi()"><i class="material-symbols-outlined">check</i> Применить</button>
                <button class="small border" onclick="DisplayModule.resetDpi()"><i class="material-symbols-outlined">restart_alt</i> Сброс</button>
              </div>
            </div>
          </article>
        </div>

        <h6 class="small" style="margin:20px 0 10px;color:var(--on-surface-variant)"><i class="material-symbols-outlined" style="font-size:18px;vertical-align:middle">toggle_on</i> Управление</h6>
        <article class="no-padding">
          <div class="padding">
            <label class="switch row" style="padding:10px 0">
              <i class="material-symbols-outlined">screen_rotation</i>
              <div class="max"><span class="bold">Авто-поворот</span><p class="small no-margin" style="color:var(--on-surface-variant)">Поворот по акселерометру</p></div>
              <input type="checkbox" id="disp-rotation" onchange="DisplayModule.toggleRotation(this.checked)">
              <span></span>
            </label>
            <div class="divider"></div>
            <label class="switch row" style="padding:10px 0">
              <i class="material-symbols-outlined">touch_app</i>
              <div class="max"><span class="bold">Показать касания</span><p class="small no-margin" style="color:var(--on-surface-variant)">Точки касания на экране</p></div>
              <input type="checkbox" id="disp-touches" onchange="DisplayModule.toggleTouches(this.checked)">
              <span></span>
            </label>
            <div class="divider"></div>
            <label class="switch row" style="padding:10px 0">
              <i class="material-symbols-outlined">my_location</i>
              <div class="max"><span class="bold">Координаты</span><p class="small no-margin" style="color:var(--on-surface-variant)">Оверлей с координатами курсора</p></div>
              <input type="checkbox" id="disp-pointer" onchange="DisplayModule.togglePointer(this.checked)">
              <span></span>
            </label>
          </div>
        </article>
      </div>`;
  }

  function init() {
    const conn = ShellBridge.isConnected() || ShellBridge.checkConnection();
    document.getElementById('disp-no-conn').style.display = conn ? 'none' : 'block';
    document.getElementById('disp-content').style.display = conn ? 'block' : 'none';
    if (conn) loadCurrent();
  }

  function loadCurrent() {
    const size = ShellBridge.exec('wm size'); document.getElementById('disp-size').textContent = size.ok ? size.stdout.trim() : '—';
    const dpi = ShellBridge.exec('wm density'); document.getElementById('disp-dpi').textContent = dpi.ok ? dpi.stdout.trim() : '—';
    const rot = ShellBridge.exec('settings get system accelerometer_rotation'); document.getElementById('disp-rotation').checked = rot.ok && rot.stdout.trim() === '1';
    const touches = ShellBridge.exec('settings get system show_touches'); document.getElementById('disp-touches').checked = touches.ok && touches.stdout.trim() === '1';
    const pointer = ShellBridge.exec('settings get system pointer_location'); document.getElementById('disp-pointer').checked = pointer.ok && pointer.stdout.trim() === '1';
  }

  function setSize(v) { if (!App.requireConnection()) return; const r = ShellBridge.exec(`wm size ${v}`); App.toast(r.ok?`Разрешение: ${v}`:r.stderr, r.ok?'success':'error'); loadCurrent(); }
  function setDpi(v) { if (!App.requireConnection()) return; const r = ShellBridge.exec(`wm density ${v}`); App.toast(r.ok?`DPI: ${v}`:r.stderr, r.ok?'success':'error'); loadCurrent(); }
  function resetSize() { if (!App.requireConnection()) return; ShellBridge.exec('wm size reset'); App.toast('Разрешение сброшено','success'); loadCurrent(); }
  function resetDpi() { if (!App.requireConnection()) return; ShellBridge.exec('wm density reset'); App.toast('DPI сброшен','success'); loadCurrent(); }
  function applyCustomSize() { const v = document.getElementById('disp-custom-size').value.trim(); if (v) setSize(v); }
  function applyCustomDpi() { const v = document.getElementById('disp-custom-dpi').value.trim(); if (v) setDpi(v); }
  function toggleRotation(on) { if (!App.requireConnection()) return; ShellBridge.exec(`settings put system accelerometer_rotation ${on?1:0}`); App.toast(`Авто-поворот ${on?'вкл':'выкл'}`,'success'); }
  function toggleTouches(on) { if (!App.requireConnection()) return; ShellBridge.exec(`settings put system show_touches ${on?1:0}`); App.toast(`Касания ${on?'вкл':'выкл'}`,'success'); }
  function togglePointer(on) { if (!App.requireConnection()) return; ShellBridge.exec(`settings put system pointer_location ${on?1:0}`); App.toast(`Координаты ${on?'вкл':'выкл'}`,'success'); }

  return { render, init, setSize, setDpi, resetSize, resetDpi, applyCustomSize, applyCustomDpi, toggleRotation, toggleTouches, togglePointer };
})();

window.DisplayModule = DisplayModule;
