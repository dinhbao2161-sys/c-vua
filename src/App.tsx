import React, { useState, useEffect } from 'react';
import {
  Phone,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Search,
  UserCheck,
  Globe,
  Bell,
  BellRing,
  Volume2,
  PhoneOff,
  History,
  BookOpen,
  Smartphone,
  Sparkles,
  PhoneCall,
  User,
  Settings as SettingsIcon,
  Sun,
  Moon,
  ChevronRight,
  Play,
  Heart,
  AlertTriangle,
  Zap,
  Flame,
  Radio
} from 'lucide-react';
import {
  CallShieldSettings,
  PrefixRule,
  ContactItem,
  CallRecord,
  SimulatorScenario,
  SosAlarmTriggerInfo,
} from './types/callShield';
import {
  INITIAL_SETTINGS,
  DEFAULT_PREFIX_RULES,
  TRUSTED_CONTACTS,
  INITIAL_CALL_HISTORY,
  SIMULATOR_SCENARIOS,
} from './data/mockData';
import { IosSwitch } from './components/IosSwitch';
import { IosGroupCell } from './components/IosGroupCell';
import { LiquidGlassCard } from './components/LiquidGlassCard';
import { CallSimulatorModal } from './components/CallSimulatorModal';
import { SocialScannerModal } from './components/SocialScannerModal';
import { PrefixManagerModal } from './components/PrefixManagerModal';
import { CallHistoryModal } from './components/CallHistoryModal';
import { GuardianSettingsModal } from './components/GuardianSettingsModal';
import { SeniorGuideModal } from './components/SeniorGuideModal';
import { EmergencyAlarmModal } from './components/EmergencyAlarmModal';
import { SosRemoteSettingsModal } from './components/SosRemoteSettingsModal';
import { soundController } from './utils/soundEffects';

export function App() {
  // Application State
  const [settings, setSettings] = useState<CallShieldSettings>(() => {
    try {
      const saved = localStorage.getItem('callshield_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_SETTINGS,
          ...parsed,
          emergencyContacts:
            Array.isArray(parsed.emergencyContacts) && parsed.emergencyContacts.length > 0
              ? parsed.emergencyContacts
              : INITIAL_SETTINGS.emergencyContacts,
          sosTriggerKeywords:
            Array.isArray(parsed.sosTriggerKeywords) && parsed.sosTriggerKeywords.length > 0
              ? parsed.sosTriggerKeywords
              : INITIAL_SETTINGS.sosTriggerKeywords,
          remoteSosEnabled:
            typeof parsed.remoteSosEnabled === 'boolean'
              ? parsed.remoteSosEnabled
              : INITIAL_SETTINGS.remoteSosEnabled,
          overrideDoNotDisturb:
            typeof parsed.overrideDoNotDisturb === 'boolean'
              ? parsed.overrideDoNotDisturb
              : INITIAL_SETTINGS.overrideDoNotDisturb,
          sosTriggerCallRepeats:
            parsed.sosTriggerCallRepeats || INITIAL_SETTINGS.sosTriggerCallRepeats,
        };
      }
      return INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [prefixRules, setPrefixRules] = useState<PrefixRule[]>(() => {
    try {
      const saved = localStorage.getItem('callshield_prefixes');
      return saved ? JSON.parse(saved) : DEFAULT_PREFIX_RULES;
    } catch {
      return DEFAULT_PREFIX_RULES;
    }
  });

  const [callHistory, setCallHistory] = useState<CallRecord[]>(() => {
    try {
      const saved = localStorage.getItem('callshield_history');
      return saved ? JSON.parse(saved) : INITIAL_CALL_HISTORY;
    } catch {
      return INITIAL_CALL_HISTORY;
    }
  });

  const [trustedContacts, setTrustedContacts] = useState<ContactItem[]>(() => {
    try {
      const saved = localStorage.getItem('callshield_contacts');
      return saved ? JSON.parse(saved) : TRUSTED_CONTACTS;
    } catch {
      return TRUSTED_CONTACTS;
    }
  });

  // UI Navigation & Modals
  const [activeModal, setActiveModal] = useState<
    'none' | 'simulator' | 'social_scanner' | 'prefix_manager' | 'history' | 'guardian' | 'guide' | 'sos_remote_settings'
  >('none');
  const [activeScenario, setActiveScenario] = useState<SimulatorScenario>(SIMULATOR_SCENARIOS[0]);
  const [activeAlarmInfo, setActiveAlarmInfo] = useState<SosAlarmTriggerInfo | null>(null);
  const [viewMode, setViewMode] = useState<'iphone_frame' | 'expanded'>('expanded');
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('callshield_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('callshield_prefixes', JSON.stringify(prefixRules));
  }, [prefixRules]);

  useEffect(() => {
    localStorage.setItem('callshield_history', JSON.stringify(callHistory));
  }, [callHistory]);

  // Dark mode effect
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  const showToast = (msg: string) => {
    setNotificationToast(msg);
    setTimeout(() => setNotificationToast(null), 3000);
  };

  const updateSetting = <K extends keyof CallShieldSettings>(key: K, value: CallShieldSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    showToast('Đã lưu thay đổi cài đặt');
  };

  const handleTogglePrefix = (id: string, blocked: boolean) => {
    setPrefixRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, blocked } : r))
    );
    showToast(blocked ? 'Đã kích hoạt chặn đầu số' : 'Đã bỏ chặn đầu số');
  };

  const handleAddPrefix = (newRule: Omit<PrefixRule, 'id' | 'reportCount'>) => {
    const item: PrefixRule = {
      ...newRule,
      id: `custom-${Date.now()}`,
      reportCount: 1,
    };
    setPrefixRules((prev) => [item, ...prev]);
    showToast(`Đã thêm đầu số ${item.prefix}`);
  };

  const handleDeletePrefix = (id: string) => {
    setPrefixRules((prev) => prev.filter((r) => r.id !== id));
    showToast('Đã xóa quy tắc đầu số');
  };

  const handleCallEnded = (record: CallRecord) => {
    setCallHistory((prev) => [record, ...prev]);
    showToast(`Đã lưu bản ghi can thiệp: ${record.callerName}`);
  };

  const handleLaunchScenario = (scen: SimulatorScenario) => {
    setActiveScenario(scen);
    setActiveModal('simulator');
  };

  // Senior Trigger 2-Way SOS Alarm
  const handleSeniorTriggerSos = () => {
    setActiveAlarmInfo({
      triggeredBy: 'senior',
      senderName: settings.elderlyName,
      senderPhone: '',
      triggerMethod: 'manual_button',
      time: 'Vừa xong',
    });
  };

  const handleDismissAlarm = (safeConfirmed: boolean) => {
    setActiveAlarmInfo(null);
    if (safeConfirmed) {
      showToast('Đã tắt báo động. Tín hiệu an toàn đã gửi tới gia đình.');
    }
  };

  // Font size multiplier
  const textSizeClass = {
    normal: '',
    large: 'text-[1.05rem]',
    'extra-large': 'text-[1.18rem]',
  }[settings.seniorTextSize];

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        settings.darkMode
          ? 'bg-slate-950 text-slate-100'
          : 'bg-gradient-to-br from-slate-100 via-sky-50/40 to-slate-200/70 text-slate-900'
      } ${textSizeClass}`}
    >
      {/* Dynamic Background Liquid Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-5%] w-[45vw] h-[45vw] rounded-full liquid-glow blur-[90px] opacity-70 animate-pulse duration-1000" />
        <div className="absolute top-[40%] right-[-10%] w-[40vw] h-[40vw] rounded-full liquid-accent-amber blur-[100px] opacity-50" />
        <div className="absolute bottom-[-10%] left-[20%] w-[50vw] h-[50vw] rounded-full liquid-accent-emerald blur-[110px] opacity-45" />
      </div>

      {/* Top Bar Contract (3 zones) */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/75 dark:bg-slate-900/75 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand single text element */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap">
              Senior CallShield
            </span>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <button
              onClick={() => setActiveModal('sos_remote_settings')}
              className="hover:text-red-600 dark:hover:text-red-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 font-bold text-red-600 dark:text-red-400"
            >
              <BellRing className="w-4 h-4 animate-wiggle" /> Báo Thức SOS Từ Xa
            </button>
            <button
              onClick={() => setActiveModal('simulator')}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <Smartphone className="w-4 h-4 text-blue-500" /> Mô Phỏng Cuộc Gọi
            </button>
            <button
              onClick={() => setActiveModal('social_scanner')}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <Search className="w-4 h-4 text-purple-500" /> Rà Soát Mạng Xã Hội
            </button>
            <button
              onClick={() => setActiveModal('prefix_manager')}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <Globe className="w-4 h-4 text-orange-500" /> Nhận Dạng Đầu Số
            </button>
            <button
              onClick={() => setActiveModal('history')}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <History className="w-4 h-4 text-emerald-500" /> Nhật Ký Chặn ({callHistory.length})
            </button>
            <button
              onClick={() => setActiveModal('guide')}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4 text-teal-500" /> Cẩm Nang Cho Bà
            </button>
          </nav>

          {/* Zone 3: Quick Action */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* View Mode Toggle */}
            <button
              onClick={() =>
                setViewMode(viewMode === 'iphone_frame' ? 'expanded' : 'iphone_frame')
              }
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200/70 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
              title="Chuyển chế độ xem Khung iPhone / Toàn màn hình"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{viewMode === 'iphone_frame' ? 'Mở Rộng' : 'Khung iPhone'}</span>
            </button>

            {/* Dark Mode Switch */}
            <button
              onClick={() => updateSetting('darkMode', !settings.darkMode)}
              className="w-9 h-9 rounded-xl bg-slate-200/70 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-300 transition-colors"
              aria-label="Chuyển đổi giao diện sáng tối"
            >
              {settings.darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Simulation CTA */}
            <button
              onClick={() => {
                setActiveScenario(SIMULATOR_SCENARIOS[0]);
                setActiveModal('simulator');
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-500 active:scale-95 transition-all shadow-md shadow-blue-600/30 whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Thử Gọi Đến
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        {/* Layout Wrapper: Supports iPhone Device Frame or Full Viewport */}
        <div
          className={`mx-auto transition-all duration-300 ${
            viewMode === 'iphone_frame'
              ? 'max-w-[430px] bg-slate-900 text-white rounded-[50px] p-4 shadow-2xl border-8 border-slate-800'
              : 'max-w-4xl'
          }`}
        >
          {/* Top Senior Accessibility Banner */}
          <div className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-4 shadow-lg shadow-blue-500/15">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
                <Heart className="w-6 h-6 fill-current text-rose-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold leading-tight">
                    {settings.elderlyName}
                  </h1>
                  <span className="bg-emerald-400 text-slate-950 font-bold text-[10px] uppercase px-2 py-0.5 rounded-full">
                    Đang Bảo Vệ
                  </span>
                </div>
                <p className="text-xs text-blue-100 mt-0.5">
                  Người giám hộ: <strong>{settings.guardianName}</strong> ({settings.guardianPhone})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveModal('guardian')}
                className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-xs font-bold text-white transition-all active:scale-95 flex items-center gap-1"
              >
                <SettingsIcon className="w-3.5 h-3.5" /> Thiết Lập SOS
              </button>
              <a
                href={`tel:${settings.emergencySOS}`}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-md active:scale-95 transition-all flex items-center gap-1"
              >
                <PhoneCall className="w-3.5 h-3.5" /> SOS ({settings.emergencySOS})
              </a>
            </div>
          </div>

          {/* TWO-WAY EMERGENCY SOS BIG PANIC BUTTON FOR SENIORS */}
          <div className="mb-6 p-4 rounded-3xl bg-gradient-to-r from-rose-600 via-red-600 to-orange-600 text-white shadow-xl shadow-red-600/25 border-2 border-red-400/40 relative overflow-hidden">
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-extrabold uppercase tracking-wide mb-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-300 animate-bounce" /> Cứu Hộ Hai Chiều 24/7
                </div>
                <h3 className="text-lg sm:text-xl font-black tracking-tight leading-snug">
                  Báo Thức Cứu Nạn Khẩn Cấp (SOS)
                </h3>
                <p className="text-xs text-red-100 max-w-md mt-0.5">
                  Nhấn khi cần giúp đỡ ngay lập tức: Còi hú cực đại phát tại chỗ và gửi thông báo khẩn tới {(settings.emergencyContacts || INITIAL_SETTINGS.emergencyContacts).length} người thân.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
                <button
                  onClick={handleSeniorTriggerSos}
                  className="flex-1 sm:flex-initial py-3.5 px-6 rounded-2xl bg-white text-red-600 hover:bg-red-50 active:scale-95 text-sm sm:text-base font-black shadow-2xl flex items-center justify-center gap-2.5 transition-transform"
                >
                  <BellRing className="w-5 h-5 text-red-600 animate-wiggle" />
                  <span>BẤM HÚ CÒI SOS CẤP CỨU</span>
                </button>
                <button
                  onClick={() => setActiveModal('sos_remote_settings')}
                  className="p-3.5 rounded-2xl bg-black/25 hover:bg-black/40 text-white active:scale-95 transition-transform shrink-0"
                  title="Cài đặt kích hoạt từ xa"
                >
                  <Radio className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Senior Font Size Selector */}
          <div className="mb-6 flex items-center justify-between gap-3 p-3 liquid-glass rounded-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Cỡ chữ cho mắt người cao tuổi:</span>
            </div>
            <div className="flex items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-800 rounded-xl">
              <button
                onClick={() => updateSetting('seniorTextSize', 'normal')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  settings.seniorTextSize === 'normal'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Vừa
              </button>
              <button
                onClick={() => updateSetting('seniorTextSize', 'large')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  settings.seniorTextSize === 'large'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Lớn (Khuyên dùng)
              </button>
              <button
                onClick={() => updateSetting('seniorTextSize', 'extra-large')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  settings.seniorTextSize === 'extra-large'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Cực Đại
              </button>
            </div>
          </div>

          {/* Search bar inside Settings */}
          <div className="mb-6 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm cài đặt cuộc gọi, chặn số, báo thức SOS, AI..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 text-sm placeholder-slate-400 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>

          {/* SECTION 1: BÁO THỨC SOS & CAN THIỆP CUỘC GỌI */}
          <div className="mb-6 space-y-2">
            <span className="px-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Báo Thức SOS & Can Thiệp Cuộc Gọi Thông Minh
            </span>

            <LiquidGlassCard className="p-0 overflow-hidden divide-y divide-slate-200/60 dark:divide-slate-800/60">
              {/* Feature 0: Remote SOS Siren */}
              <IosGroupCell
                icon={<BellRing className="w-5 h-5" />}
                iconBg="bg-red-600"
                title="Báo Thức SOS Khẩn Cấp Kích Hoạt Từ Xa"
                subtitle={`Người thân có thể nhắn '${settings.sosTriggerKeywords?.[0] || 'SOS'}' hoặc nháy máy ${settings.sosTriggerCallRepeats || 2} lần để hú còi cực đại khi cần kiểm tra bà gấp`}
                textSize={settings.seniorTextSize}
                showChevron
                onClick={() => setActiveModal('sos_remote_settings')}
                isFirst
              />

              {/* Feature 1: AI Screen First */}
              <IosGroupCell
                icon={<Shield className="w-5 h-5" />}
                iconBg="bg-blue-600"
                title="Trợ Lý AI Tự Động Bắt Máy Sàng Lọc"
                subtitle="Tự động tiếp nhận cuộc gọi từ số lạ, chất vấn mục đích và phân tích giọng nói trước khi điện thoại bà đổ chuông"
                textSize={settings.seniorTextSize}
                rightElement={
                  <IosSwitch
                    checked={settings.aiScreeningEnabled}
                    onChange={(checked) => updateSetting('aiScreeningEnabled', checked)}
                    size="large"
                    label="Bật AI tự động bắt máy"
                  />
                }
              />

              {/* Feature 2: Guardian Approval */}
              <IosGroupCell
                icon={<UserCheck className="w-5 h-5" />}
                iconBg="bg-indigo-600"
                title="Xin Phép Người Giám Hộ Trước Khi Chuông Reo"
                subtitle="Nếu đối tượng có dấu hiệu mạo danh, hệ thống gửi thông báo hỏi ý kiến con trai (Tuấn Anh) phê duyệt"
                textSize={settings.seniorTextSize}
                rightElement={
                  <IosSwitch
                    checked={settings.guardianApprovalRequired}
                    onChange={(checked) => updateSetting('guardianApprovalRequired', checked)}
                    size="large"
                    label="Yêu cầu con trai duyệt"
                  />
                }
              />

              {/* Feature 3: Auto Hangup Scam Keywords */}
              <IosGroupCell
                icon={<PhoneOff className="w-5 h-5" />}
                iconBg="bg-rose-600"
                title="Tự Động Cúp Máy Khi Phát Hiện Từ Khóa Lừa Đảo"
                subtitle="Ngắt cuộc gọi ngay lập tức khi nghe thấy 'Bộ Công An', 'chuyển tiền ngay', 'đọc mã OTP'"
                textSize={settings.seniorTextSize}
                rightElement={
                  <IosSwitch
                    checked={settings.autoHangupScamWords}
                    onChange={(checked) => updateSetting('autoHangupScamWords', checked)}
                    size="large"
                    label="Tự cúp máy từ khóa lừa đảo"
                  />
                }
              />

              {/* Feature 4: Voice Announce */}
              <IosGroupCell
                icon={<Volume2 className="w-5 h-5" />}
                iconBg="bg-emerald-600"
                title="Đọc Tên & Số Người Gọi Bằng Giọng Nói Lớn"
                subtitle="Loa ngoài phát âm thanh tiếng Việt thông báo rõ ràng: ai đang gọi và mức độ an toàn"
                textSize={settings.seniorTextSize}
                rightElement={
                  <IosSwitch
                    checked={settings.voiceAnnounceCaller}
                    onChange={(checked) => updateSetting('voiceAnnounceCaller', checked)}
                    size="large"
                    label="Đọc to tên người gọi"
                  />
                }
              />

              {/* Feature 5: High Volume Siren Warning */}
              <IosGroupCell
                icon={<Bell className="w-5 h-5" />}
                iconBg="bg-amber-600"
                title="Cảnh Báo Âm Lượng Báo Động Khi Phát Hiện Nguy Cơ"
                subtitle="Phát âm thanh còi hú đặc biệt để người cao tuổi cảnh giác không làm theo lời kẻ xấu"
                textSize={settings.seniorTextSize}
                rightElement={
                  <IosSwitch
                    checked={settings.highVolumeWarning}
                    onChange={(checked) => updateSetting('highVolumeWarning', checked)}
                    size="large"
                    label="Báo động âm lượng lớn"
                  />
                }
                isLast
              />
            </LiquidGlassCard>
          </div>

          {/* SECTION 2: BỘ MÔ PHỎNG & LUYỆN TẬP PHÒNG CHỐNG LỪA ĐẢO */}
          <div className="mb-6 space-y-2">
            <div className="px-4 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Thực Hành Phòng Tránh (Bộ Mô Phỏng Cuộc Gọi Đến)
              </span>
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                4 Kịch bản thực tế
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SIMULATOR_SCENARIOS.map((scen) => (
                <div
                  key={scen.id}
                  onClick={() => handleLaunchScenario(scen)}
                  className="p-4 rounded-2xl liquid-glass border border-white/60 dark:border-white/10 hover:shadow-lg active:scale-[0.98] cursor-pointer transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          scen.riskLevel === 'danger'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300'
                            : scen.riskLevel === 'warning'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                        }`}
                      >
                        {scen.category}
                      </span>
                      <span className="text-xs font-mono font-medium text-slate-400">
                        {scen.callerNumber}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
                      {scen.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {scen.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
                    <span className="flex items-center gap-1">
                      <Play className="w-3.5 h-3.5 fill-current" /> Bắt đầu cuộc gọi thử
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: NHẬN DẠNG ĐẦU SỐ & MẠNG XÃ HỘI */}
          <div className="mb-6 space-y-2">
            <span className="px-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Nhận Dạng Đầu Số & Rà Soát Mạng Xã Hội
            </span>

            <LiquidGlassCard className="p-0 overflow-hidden divide-y divide-slate-200/60 dark:divide-slate-800/60">
              {/* Scan Tool */}
              <IosGroupCell
                icon={<Search className="w-5 h-5" />}
                iconBg="bg-purple-600"
                title="Rà Soát Tài Khoản & Đường Link Nghi Vấn"
                subtitle="Quét nhanh số điện thoại lạ, link Zalo mạo danh cán bộ, Facebook người thân mượn tiền, Telegram đầu tư ảo"
                textSize={settings.seniorTextSize}
                showChevron
                onClick={() => setActiveModal('social_scanner')}
                isFirst
              />

              {/* Prefix Manager */}
              <IosGroupCell
                icon={<Globe className="w-5 h-5" />}
                iconBg="bg-orange-500"
                title="Cơ Sở Dữ Liệu Đầu Số Lừa Đảo (+224, 02499...)"
                subtitle={`Đang kích hoạt ${prefixRules.filter((r) => r.blocked).length}/${prefixRules.length} quy tắc chặn mã vùng quốc tế & tổng đài ảo`}
                textSize={settings.seniorTextSize}
                showChevron
                onClick={() => setActiveModal('prefix_manager')}
              />

              {/* Call History */}
              <IosGroupCell
                icon={<History className="w-5 h-5" />}
                iconBg="bg-teal-600"
                title="Nhật Ký Cuộc Gọi Đã Can Thiệp"
                subtitle={`${callHistory.length} cuộc gọi đã được ghi âm và tóm tắt lời thoại`}
                value={`${callHistory.filter((c) => c.status === 'blocked').length} Đã Chặn`}
                textSize={settings.seniorTextSize}
                showChevron
                onClick={() => setActiveModal('history')}
              />

              {/* Senior Guide */}
              <IosGroupCell
                icon={<BookOpen className="w-5 h-5" />}
                iconBg="bg-emerald-600"
                title="Cẩm Nang Nghe Máy An Toàn (Đọc To Cho Bà)"
                subtitle="3 nguyên tắc vàng không bao giờ bị lừa tiền kèm tính năng đọc to giọng nói"
                textSize={settings.seniorTextSize}
                showChevron
                onClick={() => setActiveModal('guide')}
                isLast
              />
            </LiquidGlassCard>
          </div>

          {/* SECTION 4: DANH BẠ AN TOÀN (WHITE-LIST) */}
          <div className="mb-6 space-y-2">
            <div className="px-4 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Danh Bạ Người Thân Tin Cậy (Luôn Được Phép Gọi)
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {trustedContacts.length} Số An Toàn
              </span>
            </div>

            <LiquidGlassCard className="p-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {trustedContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="p-3 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-3 shadow-sm"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm ${contact.avatarColor}`}
                    >
                      {contact.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                          {contact.name}
                        </h4>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {contact.phone}
                      </p>
                      <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium truncate">
                        {contact.relationship}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </LiquidGlassCard>
          </div>

          {/* Footer note */}
          <footer className="text-center py-4 text-xs text-slate-400 dark:text-slate-500">
            Senior CallShield v2.5 · Thiết kế chuẩn Apple iOS Settings với hiệu ứng Liquid Glassmorphism & Còi Báo Động SOS Từ Xa
          </footer>
        </div>
      </main>

      {/* Interactive Modals */}
      {activeModal === 'simulator' && (
        <CallSimulatorModal
          scenario={activeScenario}
          settings={settings}
          onClose={() => setActiveModal('none')}
          onCallEnded={handleCallEnded}
        />
      )}

      {activeModal === 'social_scanner' && (
        <SocialScannerModal
          onClose={() => setActiveModal('none')}
          guardianPhone={settings.guardianPhone}
          textSize={settings.seniorTextSize}
        />
      )}

      {activeModal === 'prefix_manager' && (
        <PrefixManagerModal
          prefixRules={prefixRules}
          onToggleRule={handleTogglePrefix}
          onAddRule={handleAddPrefix}
          onDeleteRule={handleDeletePrefix}
          onClose={() => setActiveModal('none')}
        />
      )}

      {activeModal === 'history' && (
        <CallHistoryModal
          records={callHistory}
          onClearHistory={() => setCallHistory([])}
          onClose={() => setActiveModal('none')}
        />
      )}

      {activeModal === 'guardian' && (
        <GuardianSettingsModal
          settings={settings}
          onUpdateSettings={(newVals) => setSettings((prev) => ({ ...prev, ...newVals }))}
          onClose={() => setActiveModal('none')}
        />
      )}

      {activeModal === 'guide' && (
        <SeniorGuideModal
          guardianPhone={settings.guardianPhone}
          onClose={() => setActiveModal('none')}
        />
      )}

      {activeModal === 'sos_remote_settings' && (
        <SosRemoteSettingsModal
          settings={settings}
          onUpdateSettings={(newVals) => setSettings((prev) => ({ ...prev, ...newVals }))}
          onTriggerAlarm={(info) => {
            setActiveModal('none');
            setActiveAlarmInfo(info);
          }}
          onClose={() => setActiveModal('none')}
        />
      )}

      {/* FULLSCREEN EMERGENCY ALARM STROBE MODAL */}
      {activeAlarmInfo && (
        <EmergencyAlarmModal
          triggerInfo={activeAlarmInfo}
          settings={settings}
          onDismiss={handleDismissAlarm}
        />
      )}

      {/* Floating Toast Notification */}
      {notificationToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-slate-900/90 text-white dark:bg-white/90 dark:text-slate-900 text-xs font-semibold shadow-2xl backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>{notificationToast}</span>
        </div>
      )}
    </div>
  );
}
export default App;
