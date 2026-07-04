/**
 * ShizuConfigs — Core SPA Application
 * Material 3 via BeerCSS, real Shizuku shell only, dark/light theme toggle.
 */

const App = (() => {
  const pages = {
    dashboard:   { module: () => DashboardModule,    icon: 'dashboard',          label: 'Dashboard' },
    packages:    { module: () => PackagesModule,     icon: 'inventory_2',        label: 'Packages' },
    settings:    { module: () => SettingsModule,     icon: 'tune',               label: 'Settings' },
    display:     { module: () => DisplayModule,      icon: 'screenshot_monitor', label: 'Display' },
    performance: { module: () => PerformanceModule,  icon: 'speed',              label: 'Performance' },
    network:     { module: () => NetworkModule,      icon: 'wifi',               label: 'Network' },
    commands:    { module: () => CommandsModule,     icon: 'code',               label: 'Commands' },
  };
  let currentPage = 'dashboard';
  let isDark = true;

  function init() {
    // Restore theme
    const saved = localStorage.getItem('shizuconfigs_theme');
    isDark = saved ? saved === 'dark' : true;
    applyTheme();
    updateStatus();
    const hash = location.hash.replace('#', '') || 'dashboard';
    navigate(hash);
    window.addEventListener('hashchange', () => {
      navigate(location.hash.replace('#', '') || 'dashboard');
    });
  }

  function navigate(pageId) {
    if (!pages[pageId]) pageId = 'dashboard';
    currentPage = pageId;
    location.hash = pageId;
    // Update all navs
    document.querySelectorAll('[data-page]').forEach(n => {
      n.classList.toggle('active', n.dataset.page === pageId);
    });
    // Update title bar
    document.getElementById('page-title-bar').textContent = pages[pageId].label;
    // Render page
    const container = document.getElementById('page-container');
    const mod = pages[pageId].module();
    container.innerHTML = mod.render();
    container.style.animation = 'none';
    container.offsetHeight; // reflow
    container.style.animation = 'pageSlideIn .35s cubic-bezier(.2,0,0,1)';
    if (mod.init) setTimeout(() => mod.init(), 20);
  }

  function updateStatus() {
    const chip = document.getElementById('status-indicator');
    const icon = document.getElementById('status-icon');
    const text = document.getElementById('status-text');
    const conn = ShellBridge.checkConnection();
    chip.classList.toggle('connected', conn);
    chip.classList.toggle('disconnected', !conn);
    icon.textContent = conn ? 'cloud_done' : 'cloud_off';
    text.textContent = conn ? 'Connected' : 'No Connection';
  }

  function toggleTheme() {
    isDark = !isDark;
    applyTheme();
    localStorage.setItem('shizuconfigs_theme', isDark ? 'dark' : 'light');
  }

  function applyTheme() {
    document.body.classList.toggle('dark', isDark);
    document.getElementById('theme-icon').textContent = isDark ? 'light_mode' : 'dark_mode';
    // Tell BeerCSS
    if (typeof ui === 'function') {
      try { ui('mode', isDark ? 'dark' : 'light'); } catch(e) {}
    }
  }

  function toast(message, type = 'info') {
    const colors = { success: 'secondary-container', error: 'error-container', info: 'surface-container-highest' };
    const icons = { success: 'check_circle', error: 'error', info: 'info' };
    const el = document.createElement('div');
    el.className = `snackbar active ${colors[type] || ''}`;
    el.innerHTML = `<i class="material-symbols-outlined">${icons[type]||'info'}</i> <span>${message}</span>`;
    document.getElementById('snackbar-container').appendChild(el);
    setTimeout(() => { el.classList.remove('active'); setTimeout(() => el.remove(), 300); }, 2800);
  }

  function requireConnection() {
    if (!ShellBridge.isConnected()) {
      toast('Shizuku is not connected', 'error');
      return false;
    }
    return true;
  }

  return { init, navigate, toast, updateStatus, requireConnection, toggleTheme };
 })();

window.App = App;
document.addEventListener('DOMContentLoaded', () => {
  let attempts = 0;
  function tryInit() {
    if (typeof window.Shizuku !== 'undefined' || attempts > 10) {
      App.init();
    } else {
      attempts++;
      setTimeout(tryInit, 50);
    }
  }
  tryInit();
});
