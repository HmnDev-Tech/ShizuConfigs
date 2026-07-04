/**
 * ShizuConfigs — Network Module (Material 3 / BeerCSS)
 */

const NetworkModule = (() => {
  function render() {
    return `
      <h5><i class="material-symbols-outlined" style="vertical-align:middle">wifi</i> Network</h5>
      <p style="color:var(--on-surface-variant)">WiFi, ADB TCP, Proxy, and DNS</p>

      <div id="net-no-conn" style="display:none">
        <article class="not-connected-card"><i class="material-symbols-outlined">power_off</i><h6>Connect Shizuku</h6></article>
      </div>
      <div id="net-content">
        <div class="grid-2">
          <article class="no-padding">
            <div class="padding">
              <div class="row no-wrap" style="align-items:center;gap:10px;margin-bottom:12px">
                <button class="circle small secondary-container"><i class="material-symbols-outlined">signal_wifi_4_bar</i></button>
                <div><h6 class="small no-margin">WiFi</h6><div class="small" id="net-wifi-status" style="color:var(--on-surface-variant)">—</div></div>
              </div>
              <div class="stat-grid" id="net-wifi-info"></div>
            </div>
          </article>
          <article class="no-padding">
            <div class="padding">
              <div class="row no-wrap" style="align-items:center;gap:10px;margin-bottom:12px">
                <button class="circle small primary-container"><i class="material-symbols-outlined">lan</i></button>
                <div><h6 class="small no-margin">IP Address</h6><div class="small" id="net-ip" style="color:var(--on-surface-variant)">—</div></div>
              </div>
              <div id="net-addr-info"></div>
            </div>
          </article>
        </div>

        <h6 class="small" style="margin:20px 0 10px;color:var(--on-surface-variant)"><i class="material-symbols-outlined" style="font-size:18px;vertical-align:middle">toggle_on</i> Control</h6>
        <article class="no-padding">
          <div class="padding">
            <label class="switch row" style="padding:10px 0">
              <i class="material-symbols-outlined">flight</i>
              <div class="max"><span class="bold">Airplane Mode</span><p class="small no-margin" style="color:var(--on-surface-variant)">Turn off all wireless connections</p></div>
              <input type="checkbox" id="net-airplane" onchange="NetworkModule.toggleAirplane(this.checked)">
              <span></span>
            </label>
            <div class="divider"></div>
            <label class="switch row" style="padding:10px 0">
              <i class="material-symbols-outlined">usb</i>
              <div class="max"><span class="bold">ADB over TCP</span><p class="small no-margin" style="color:var(--on-surface-variant)">Wireless ADB :5555</p></div>
              <input type="checkbox" id="net-adb-tcp" onchange="NetworkModule.toggleAdbTcp(this.checked)">
              <span></span>
            </label>
            <div class="divider"></div>
            <label class="switch row" style="padding:10px 0">
              <i class="material-symbols-outlined">cell_tower</i>
              <div class="max"><span class="bold">Mobile Data</span><p class="small no-margin" style="color:var(--on-surface-variant)">Cellular data</p></div>
              <input type="checkbox" id="net-data" onchange="NetworkModule.toggleData(this.checked)">
              <span></span>
            </label>
          </div>
        </article>

        <h6 class="small" style="margin:20px 0 10px;color:var(--on-surface-variant)"><i class="material-symbols-outlined" style="font-size:18px;vertical-align:middle">vpn_lock</i> HTTP Proxy</h6>
        <article class="no-padding">
          <div class="padding">
            <div class="row" style="gap:8px;align-items:flex-start">
              <div class="field label border max"><input id="net-proxy-host" placeholder=" "><label>Host</label></div>
              <div class="field label border" style="width:100px"><input id="net-proxy-port" type="number" placeholder=" "><label>Port</label></div>
            </div>
            <div class="row" style="gap:8px">
              <button class="small" onclick="NetworkModule.setProxy()"><i class="material-symbols-outlined">check</i> Apply</button>
              <button class="small border" onclick="NetworkModule.clearProxy()"><i class="material-symbols-outlined">clear</i> Clear</button>
            </div>
            <p class="small" id="net-proxy-status" style="color:var(--on-surface-variant);margin-top:8px"></p>
          </div>
        </article>

        <h6 class="small" style="margin:20px 0 10px;color:var(--on-surface-variant)"><i class="material-symbols-outlined" style="font-size:18px;vertical-align:middle">dns</i> Private DNS</h6>
        <article class="no-padding">
          <div class="padding">
            <div class="row wrap" style="gap:6px;margin-bottom:12px">
              <button class="chip border small" onclick="NetworkModule.setDns('off')">Off</button>
              <button class="chip border small" onclick="NetworkModule.setDns('opportunistic')">Auto</button>
              <button class="chip border small" onclick="NetworkModule.setDns('dns.google')">Google</button>
              <button class="chip border small" onclick="NetworkModule.setDns('one.one.one.one')">Cloudflare</button>
              <button class="chip border small" onclick="NetworkModule.setDns('dns.adguard.com')">AdGuard</button>
            </div>
            <div class="field label border"><input id="net-dns-custom" placeholder=" "><label>Custom DNS</label></div>
            <button class="small" onclick="NetworkModule.setCustomDns()"><i class="material-symbols-outlined">check</i> Apply DNS</button>
            <p class="small" id="net-dns-status" style="color:var(--on-surface-variant);margin-top:8px"></p>
          </div>
        </article>
      </div>`;
  }

  function init() {
    const conn = ShellBridge.isConnected() || ShellBridge.checkConnection();
    document.getElementById('net-no-conn').style.display = conn ? 'none' : 'block';
    document.getElementById('net-content').style.display = conn ? 'block' : 'none';
    if (conn) loadInfo();
  }

  function loadInfo() {
    const wifi = ShellBridge.exec('dumpsys wifi');
    if (wifi.ok) {
      const lines = wifi.stdout.trim().split('\n');
      const ssid = lines.find(l=>l.includes('SSID'))?.match(/"(.+?)"/)?.[1]||'—';
      const rssi = lines.find(l=>l.includes('RSSI'))?.match(/-?\d+/)?.[0]||'?';
      const speed = lines.find(l=>l.includes('Link speed'))?.match(/\d+/)?.[0]||'?';
      const freq = lines.find(l=>l.includes('Frequency'))?.match(/\d+/)?.[0]||'?';
      document.getElementById('net-wifi-status').textContent = lines[0]?.includes('enabled')?'Connected':'Disconnected';
      document.getElementById('net-wifi-info').innerHTML = `
        <div class="stat-item"><div class="stat-label">SSID</div><div class="stat-value">${ssid}</div></div>
        <div class="stat-item"><div class="stat-label">Signal</div><div class="stat-value">${rssi} dBm</div></div>
        <div class="stat-item"><div class="stat-label">Speed</div><div class="stat-value">${speed} Mbps</div></div>
        <div class="stat-item"><div class="stat-label">Frequency</div><div class="stat-value">${freq} MHz</div></div>`;
    }
    const ip = ShellBridge.exec('ip addr show wlan0');
    if (ip.ok) {
      const inet = ip.stdout.match(/inet (\S+)/)?.[1]||'—';
      const mac = ip.stdout.match(/ether (\S+)/)?.[1]||'—';
      document.getElementById('net-ip').textContent = inet;
      document.getElementById('net-addr-info').innerHTML = `<div class="stat-item"><div class="stat-label">MAC</div><div class="stat-value">${mac}</div></div>`;
    }
    const airplane = ShellBridge.exec('settings get global airplane_mode_on');
    document.getElementById('net-airplane').checked = airplane.ok && airplane.stdout.trim()==='1';
    const data = ShellBridge.exec('settings get global mobile_data');
    document.getElementById('net-data').checked = data.ok && data.stdout.trim()==='1';
    const proxy = ShellBridge.exec('settings get global http_proxy');
    document.getElementById('net-proxy-status').textContent = proxy.ok && proxy.stdout.trim() && proxy.stdout.trim()!=='null' ? `Current: ${proxy.stdout.trim()}` : 'Not set';
    const dns = ShellBridge.exec('settings get global private_dns_specifier');
    document.getElementById('net-dns-status').textContent = dns.ok && dns.stdout.trim() && dns.stdout.trim()!=='null' ? `Current: ${dns.stdout.trim()}` : 'Auto / Off';
  }

  function toggleAirplane(on){if(!App.requireConnection())return;ShellBridge.exec(`settings put global airplane_mode_on ${on?1:0}`);ShellBridge.exec('am broadcast -a android.intent.action.AIRPLANE_MODE');App.toast(`Airplane mode ${on?'enabled':'disabled'}`,'success');}
  function toggleAdbTcp(on){if(!App.requireConnection())return;if(on){ShellBridge.exec('setprop service.adb.tcp.port 5555');ShellBridge.exec('stop adbd && start adbd');App.toast('ADB TCP :5555','success');}else{ShellBridge.exec('setprop service.adb.tcp.port -1');ShellBridge.exec('stop adbd && start adbd');App.toast('ADB TCP disabled','success');}}
  function toggleData(on){if(!App.requireConnection())return;ShellBridge.exec(`svc data ${on?'enable':'disable'}`);App.toast(`Mobile data ${on?'enabled':'disabled'}`,'success');}
  function setProxy(){if(!App.requireConnection())return;const h=document.getElementById('net-proxy-host').value.trim(),p=document.getElementById('net-proxy-port').value.trim();if(!h||!p){App.toast('Specify host and port','error');return;}ShellBridge.exec(`settings put global http_proxy ${h}:${p}`);App.toast(`Proxy: ${h}:${p}`,'success');loadInfo();}
  function clearProxy(){if(!App.requireConnection())return;ShellBridge.exec('settings delete global http_proxy');ShellBridge.exec('settings put global http_proxy :0');App.toast('Proxy cleared','success');loadInfo();}
  function setDns(host){if(!App.requireConnection())return;if(host==='off'){ShellBridge.exec('settings put global private_dns_mode off');}else if(host==='opportunistic'){ShellBridge.exec('settings put global private_dns_mode opportunistic');}else{ShellBridge.exec('settings put global private_dns_mode hostname');ShellBridge.exec(`settings put global private_dns_specifier ${host}`);}App.toast(`DNS: ${host}`,'success');loadInfo();}
  function setCustomDns(){const h=document.getElementById('net-dns-custom').value.trim();if(!h){App.toast('Enter DNS','error');return;}setDns(h);}

  return { render, init, toggleAirplane, toggleAdbTcp, toggleData, setProxy, clearProxy, setDns, setCustomDns };
})();

window.NetworkModule = NetworkModule;
