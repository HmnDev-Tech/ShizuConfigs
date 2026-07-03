#!/system/bin/sh
# ShizuConfigs — Background Service Hook
# Runs once per Shizuku binder session (when background actions are enabled)

echo "ShizuConfigs service started at $(date)"
echo "Module: $SHIZUKU_MODULE_ID"
echo "Mode:   $SHIZUKU_MODULE_MODE"

# Create directories
mkdir -p "$MODDIR/configs"
mkdir -p "$MODDIR/logs"
mkdir -p "$MODDIR/snapshots"

# Collect device snapshot for Dashboard
SNAPSHOT="$MODDIR/snapshots/device-snapshot.json"
cat > "$SNAPSHOT" << SNAPSHOT_EOF
{
  "timestamp": "$(date -Iseconds 2>/dev/null || date)",
  "device": {
    "model": "$(getprop ro.product.model)",
    "device": "$(getprop ro.product.device)",
    "brand": "$(getprop ro.product.brand)",
    "manufacturer": "$(getprop ro.product.manufacturer)"
  },
  "android": {
    "version": "$(getprop ro.build.version.release)",
    "sdk": "$(getprop ro.build.version.sdk)",
    "build": "$(getprop ro.build.display.id)",
    "security_patch": "$(getprop ro.build.version.security_patch)"
  },
  "hardware": {
    "kernel": "$(uname -r)",
    "arch": "$(getprop ro.product.cpu.abi)",
    "cores": "$(nproc 2>/dev/null || grep -c processor /proc/cpuinfo)"
  }
}
SNAPSHOT_EOF

echo "Device snapshot saved to $SNAPSHOT"
echo "ShizuConfigs service completed at $(date)"
