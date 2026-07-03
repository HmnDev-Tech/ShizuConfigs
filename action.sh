#!/system/bin/sh
# ShizuConfigs — Full Device Diagnostic Action
# Queries ALL device characteristics via real shell commands

echo "═══════════════════════════════════════════"
echo "  ShizuConfigs — Полная диагностика"
echo "═══════════════════════════════════════════"
echo ""

echo "▸ Модуль"
echo "  ID:      $SHIZUKU_MODULE_ID"
echo "  Режим:   $SHIZUKU_MODULE_MODE"
echo "  Фон:     $SHIZUKU_MODULE_BACKGROUND"
echo "  Доверие: $SHIZUKU_MODULE_TRUSTED"
echo "  Путь:    $MODDIR"
echo ""

echo "▸ Идентификация"
id
echo ""

# ═══ УСТРОЙСТВО ═══
echo "▸ Устройство"
echo "  Модель:       $(getprop ro.product.model)"
echo "  Устройство:   $(getprop ro.product.device)"
echo "  Бренд:        $(getprop ro.product.brand)"
echo "  Производитель: $(getprop ro.product.manufacturer)"
echo "  Оборудование: $(getprop ro.hardware)"
echo "  Плата:        $(getprop ro.product.board)"
echo ""

# ═══ СИСТЕМА ═══
echo "▸ Система"
echo "  Android:      $(getprop ro.build.version.release)"
echo "  SDK:          $(getprop ro.build.version.sdk)"
echo "  Сборка:       $(getprop ro.build.display.id)"
echo "  Тип сборки:   $(getprop ro.build.type)"
echo "  Отпечаток:    $(getprop ro.build.fingerprint)"
echo "  Патч безоп.:  $(getprop ro.build.version.security_patch)"
echo "  Инкремент:    $(getprop ro.build.version.incremental)"
echo "  Кодовое имя:  $(getprop ro.build.version.codename)"
echo "  Базовый OS:   $(getprop ro.build.version.base_os)"
echo ""

# ═══ ЯДРО ═══
echo "▸ Ядро"
echo "  Версия:       $(uname -r)"
echo "  Полное:       $(uname -a)"
echo "  Архитектура:  $(getprop ro.product.cpu.abi)"
echo "  ABI список:   $(getprop ro.product.cpu.abilist)"
echo ""

# ═══ ПРОЦЕССОР ═══
echo "▸ CPU"
echo "  Ядра:         $(nproc 2>/dev/null || grep -c processor /proc/cpuinfo)"
grep -E "^(processor|model name|Hardware|BogoMIPS|Features)" /proc/cpuinfo 2>/dev/null | head -12
echo ""

# ═══ ПАМЯТЬ ═══
echo "▸ Память"
cat /proc/meminfo | head -6
echo ""

# ═══ ХРАНИЛИЩЕ ═══
echo "▸ Хранилище"
df -h /data 2>/dev/null || df /data 2>/dev/null
df -h /system 2>/dev/null || df /system 2>/dev/null
echo ""

# ═══ БАТАРЕЯ ═══
echo "▸ Батарея"
dumpsys battery 2>/dev/null
echo ""

# ═══ ЭКРАН ═══
echo "▸ Экран"
echo "  Разрешение:   $(wm size 2>/dev/null)"
echo "  DPI:          $(wm density 2>/dev/null)"
echo "  Яркость:      $(settings get system screen_brightness 2>/dev/null)"
echo "  Таймаут:      $(settings get system screen_off_timeout 2>/dev/null) ms"
echo ""

# ═══ СЕТЬ ═══
echo "▸ Сеть"
echo "  WiFi вкл:     $(settings get global wifi_on 2>/dev/null)"
echo "  Bluetooth:    $(settings get global bluetooth_on 2>/dev/null)"
echo "  Режим полёта: $(settings get global airplane_mode_on 2>/dev/null)"
echo "  Моб. данные:  $(settings get global mobile_data 2>/dev/null)"
echo "  DNS:          $(getprop net.dns1 2>/dev/null)"
echo "  Прив. DNS:    $(settings get global private_dns_specifier 2>/dev/null)"
ip addr show wlan0 2>/dev/null | grep -E "inet |ether " | head -2
echo ""

# ═══ ТЕРМАЛЫ ═══
echo "▸ Термальный статус"
dumpsys thermalservice 2>/dev/null | head -15
echo ""

# ═══ АНИМАЦИИ ═══
echo "▸ Анимации"
echo "  window_animation_scale:     $(settings get global window_animation_scale 2>/dev/null)"
echo "  transition_animation_scale: $(settings get global transition_animation_scale 2>/dev/null)"
echo "  animator_duration_scale:    $(settings get global animator_duration_scale 2>/dev/null)"
echo ""

# ═══ БЕЗОПАСНОСТЬ ═══
echo "▸ Безопасность"
echo "  SELinux:      $(getenforce 2>/dev/null || echo 'N/A')"
echo "  Шифрование:  $(getprop ro.crypto.state 2>/dev/null)"
echo "  Verified Boot: $(getprop ro.boot.verifiedbootstate 2>/dev/null)"
echo "  Тип root:     $(getprop ro.debuggable 2>/dev/null)"
echo ""

# ═══ ПАКЕТЫ ═══
echo "▸ Пакеты"
echo "  Всего:              $(pm list packages 2>/dev/null | wc -l)"
echo "  Системных:          $(pm list packages -s 2>/dev/null | wc -l)"
echo "  Пользовательских:   $(pm list packages -3 2>/dev/null | wc -l)"
echo "  Отключённых:        $(pm list packages -d 2>/dev/null | wc -l)"
echo ""

# ═══ АПТАЙМ ═══
echo "▸ Аптайм"
uptime
echo ""

# ═══ СОХРАНЁННЫЕ КОНФИГИ ═══
echo "▸ Конфиги"
if [ -d "$MODDIR/configs" ]; then
    count=$(ls "$MODDIR/configs"/*.json 2>/dev/null | wc -l)
    echo "  Профилей: $count"
    ls "$MODDIR/configs"/*.json 2>/dev/null | while read f; do
        echo "  - $(basename "$f" .json)"
    done
else
    echo "  Нет сохранённых конфигов"
fi
echo ""

echo "═══════════════════════════════════════════"
echo "  Диагностика завершена $(date)"
echo "═══════════════════════════════════════════"
