#!/system/bin/sh
# ShizuConfigs — Full Device Diagnostic Action
# Queries ALL device characteristics via real shell commands

echo "═══════════════════════════════════════════"
echo "  ShizuConfigs — Full Diagnostics"
echo "═══════════════════════════════════════════"
echo ""

echo "▸ Module"
echo "  ID:      $SHIZUKU_MODULE_ID"
echo "  Mode:    $SHIZUKU_MODULE_MODE"
echo "  BG:      $SHIZUKU_MODULE_BACKGROUND"
echo "  Trusted: $SHIZUKU_MODULE_TRUSTED"
echo "  Path:    $MODDIR"
echo ""

echo "▸ Identity"
id
echo ""

# ═══ DEVICE ═══
echo "▸ Device"
echo "  Model:        $(getprop ro.product.model)"
echo "  Device:       $(getprop ro.product.device)"
echo "  Brand:        $(getprop ro.product.brand)"
echo "  Manufacturer: $(getprop ro.product.manufacturer)"
echo "  Hardware:     $(getprop ro.hardware)"
echo "  Board:        $(getprop ro.product.board)"
echo ""

# ═══ SYSTEM ═══
echo "▸ System"
echo "  Android:      $(getprop ro.build.version.release)"
echo "  SDK:          $(getprop ro.build.version.sdk)"
echo "  Build:        $(getprop ro.build.display.id)"
echo "  Build Type:   $(getprop ro.build.type)"
echo "  Fingerprint:  $(getprop ro.build.fingerprint)"
echo "  Sec. Patch:   $(getprop ro.build.version.security_patch)"
echo "  Incremental:  $(getprop ro.build.version.incremental)"
echo "  Codename:     $(getprop ro.build.version.codename)"
echo "  Base OS:      $(getprop ro.build.version.base_os)"
echo ""

# ═══ KERNEL ═══
echo "▸ Kernel"
echo "  Version:      $(uname -r)"
echo "  Full:         $(uname -a)"
echo "  Architecture: $(getprop ro.product.cpu.abi)"
echo "  ABI List:     $(getprop ro.product.cpu.abilist)"
echo ""

# ═══ PROCESSOR ═══
echo "▸ CPU"
echo "  Cores:        $(nproc 2>/dev/null || grep -c processor /proc/cpuinfo)"
grep -E "^(processor|model name|Hardware|BogoMIPS|Features)" /proc/cpuinfo 2>/dev/null | head -12
echo ""

# ═══ MEMORY ═══
echo "▸ Memory"
cat /proc/meminfo | head -6
echo ""

# ═══ STORAGE ═══
echo "▸ Storage"
df -h /data 2>/dev/null || df /data 2>/dev/null
df -h /system 2>/dev/null || df /system 2>/dev/null
echo ""

# ═══ BATTERY ═══
echo "▸ Battery"
dumpsys battery 2>/dev/null
echo ""

# ═══ DISPLAY ═══
echo "▸ Display"
echo "  Resolution:   $(wm size 2>/dev/null)"
echo "  DPI:          $(wm density 2>/dev/null)"
echo "  Brightness:   $(settings get system screen_brightness 2>/dev/null)"
echo "  Timeout:      $(settings get system screen_off_timeout 2>/dev/null) ms"
echo ""

# ═══ NETWORK ═══
echo "▸ Network"
echo "  WiFi Enabled: $(settings get global wifi_on 2>/dev/null)"
echo "  Bluetooth:    $(settings get global bluetooth_on 2>/dev/null)"
echo "  Airplane Mode:$(settings get global airplane_mode_on 2>/dev/null)"
echo "  Mobile Data:  $(settings get global mobile_data 2>/dev/null)"
echo "  DNS:          $(getprop net.dns1 2>/dev/null)"
echo "  Private DNS:  $(settings get global private_dns_specifier 2>/dev/null)"
ip addr show wlan0 2>/dev/null | grep -E "inet |ether " | head -2
echo ""

# ═══ THERMAL ═══
echo "▸ Thermal Status"
dumpsys thermalservice 2>/dev/null | head -15
echo ""

# ═══ ANIMATIONS ═══
echo "▸ Animations"
echo "  window_animation_scale:     $(settings get global window_animation_scale 2>/dev/null)"
echo "  transition_animation_scale: $(settings get global transition_animation_scale 2>/dev/null)"
echo "  animator_duration_scale:    $(settings get global animator_duration_scale 2>/dev/null)"
echo ""

# ═══ SECURITY ═══
echo "▸ Security"
echo "  SELinux:      $(getenforce 2>/dev/null || echo 'N/A')"
echo "  Encryption:   $(getprop ro.crypto.state 2>/dev/null)"
echo "  Verified Boot:$(getprop ro.boot.verifiedbootstate 2>/dev/null)"
echo "  Root Type:    $(getprop ro.debuggable 2>/dev/null)"
echo ""

# ═══ PACKAGES ═══
echo "▸ Packages"
echo "  Total:              $(pm list packages 2>/dev/null | wc -l)"
echo "  System:             $(pm list packages -s 2>/dev/null | wc -l)"
echo "  User:               $(pm list packages -3 2>/dev/null | wc -l)"
echo "  Disabled:           $(pm list packages -d 2>/dev/null | wc -l)"
echo ""

# ═══ UPTIME ═══
echo "▸ Uptime"
uptime
echo ""

# ═══ SAVED CONFIGS ═══
echo "▸ Configs"
if [ -d "$MODDIR/configs" ]; then
    count=$(ls "$MODDIR/configs"/*.json 2>/dev/null | wc -l)
    echo "  Profiles: $count"
    ls "$MODDIR/configs"/*.json 2>/dev/null | while read f; do
        echo "  - $(basename "$f" .json)"
    done
else
    echo "  No saved configs"
fi
echo ""

echo "═══════════════════════════════════════════"
echo "  Diagnostics completed $(date)"
echo "═══════════════════════════════════════════"
