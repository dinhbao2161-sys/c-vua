import React, { useState } from 'react';
import {
  BellRing,
  Shield,
  UserCheck,
  Plus,
  Trash2,
  Phone,
  MessageSquare,
  Sparkles,
  Volume2,
  AlertTriangle,
  Send,
  PhoneCall,
  Save,
  Check
} from 'lucide-react';
import { CallShieldSettings, EmergencyContact, SosAlarmTriggerInfo } from '../types/callShield';
import { INITIAL_SETTINGS } from '../data/mockData';
import { IosSwitch } from './IosSwitch';
import { soundController } from '../utils/soundEffects';

interface SosRemoteSettingsModalProps {
  settings: CallShieldSettings;
  onUpdateSettings: (newSettings: Partial<CallShieldSettings>) => void;
  onTriggerAlarm: (info: SosAlarmTriggerInfo) => void;
  onClose: () => void;
}

export const SosRemoteSettingsModal: React.FC<SosRemoteSettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onTriggerAlarm,
  onClose,
}) => {
  const [contacts, setContacts] = useState<EmergencyContact[]>(
    settings.emergencyContacts && Array.isArray(settings.emergencyContacts) && settings.emergencyContacts.length > 0
      ? settings.emergencyContacts
      : INITIAL_SETTINGS.emergencyContacts
  );
  const [keywords, setKeywords] = useState<string[]>(
    settings.sosTriggerKeywords && Array.isArray(settings.sosTriggerKeywords) && settings.sosTriggerKeywords.length > 0
      ? settings.sosTriggerKeywords
      : INITIAL_SETTINGS.sosTriggerKeywords
  );
  const [newKeyword, setNewKeyword] = useState('');
  const [remoteEnabled, setRemoteEnabled] = useState(
    typeof settings.remoteSosEnabled === 'boolean' ? settings.remoteSosEnabled : true
  );
  const [overrideDND, setOverrideDND] = useState(
    typeof settings.overrideDoNotDisturb === 'boolean' ? settings.overrideDoNotDisturb : true
  );
  const [callRepeats, setCallRepeats] = useState(settings.sosTriggerCallRepeats || 2);

  // New Contact form
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState('Người thân');

  // Simulator Test state
  const [simContactId, setSimContactId] = useState(contacts[0]?.id || '');
  const [simKeyword, setSimKeyword] = useState(keywords[0] || 'SOS');

  const handleSave = () => {
    onUpdateSettings({
      remoteSosEnabled: remoteEnabled,
      overrideDoNotDisturb: overrideDND,
      sosTriggerKeywords: keywords,
      sosTriggerCallRepeats: callRepeats,
      emergencyContacts: contacts,
    });
    onClose();
  };

  const handleToggleContactPermission = (id: string, canTrigger: boolean) => {
    const updated = contacts.map((c) => (c.id === id ? { ...c, canTriggerAlarm: canTrigger } : c));
    setContacts(updated);
    onUpdateSettings({ emergencyContacts: updated });
  };

  const handleDeleteContact = (id: string) => {
    const updated = contacts.filter((c) => c.id !== id);
    setContacts(updated);
    onUpdateSettings({ emergencyContacts: updated });
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    const colors = ['bg-blue-600', 'bg-emerald-600', 'bg-purple-600', 'bg-teal-600', 'bg-amber-600'];
    const newEntry: EmergencyContact = {
      id: `em-${Date.now()}`,
      name: newName.trim(),
      phone: newPhone.trim(),
      role: newRole.trim() || 'Người thân',
      canTriggerAlarm: true,
      avatarColor: colors[contacts.length % colors.length],
    };

    const updated = [...contacts, newEntry];
    setContacts(updated);
    onUpdateSettings({ emergencyContacts: updated });

    setNewName('');
    setNewPhone('');
    setIsAddingContact(false);
  };

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    const kw = newKeyword.trim().toUpperCase();
    if (!kw || keywords.includes(kw)) return;
    const updated = [...keywords, kw];
    setKeywords(updated);
    onUpdateSettings({ sosTriggerKeywords: updated });
    setNewKeyword('');
  };

  const handleRemoveKeyword = (kwToRemove: string) => {
    const updated = keywords.filter((k) => k !== kwToRemove);
    setKeywords(updated);
    onUpdateSettings({ sosTriggerKeywords: updated });
  };

  // Launch Simulator Alarm
  const handleTestSmsTrigger = () => {
    const sender = contacts.find((c) => c.id === simContactId) || contacts[0];
    onTriggerAlarm({
      triggeredBy: 'remote',
      senderName: sender ? sender.name : 'Người thân',
      senderPhone: sender ? sender.phone : settings.guardianPhone,
      triggerMethod: 'sms_code',
      time: 'Vừa xong',
    });
  };

  const handleTestCallRepeatTrigger = () => {
    const sender = contacts.find((c) => c.id === simContactId) || contacts[0];
    onTriggerAlarm({
      triggeredBy: 'remote',
      senderName: sender ? sender.name : 'Người thân',
      senderPhone: sender ? sender.phone : settings.guardianPhone,
      triggerMethod: 'repeated_calls',
      time: 'Vừa xong',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-xl overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-red-50/70 dark:bg-red-950/30 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-sm shadow-red-500/30">
              <BellRing className="w-5 h-5 animate-wiggle" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Cài Đặt Báo Thức SOS Khẩn Cấp Từ Xa
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cho phép người thân kích hoạt còi báo động lớn khi người già cần giúp đỡ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-full bg-slate-200/80 dark:bg-slate-700/80 hover:bg-slate-300 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
          >
            Đóng
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Main Switches */}
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Bật Tính Năng Kích Hoạt Báo Động Từ Xa
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Khi người già để điện thoại ở xa hoặc ngủ quên, người thân có thể hú còi đánh thức
                </p>
              </div>
              <IosSwitch
                checked={remoteEnabled}
                onChange={(c) => {
                  setRemoteEnabled(c);
                  onUpdateSettings({ remoteSosEnabled: c });
                }}
                size="large"
              />
            </div>

            <div className="h-px bg-slate-200/60 dark:bg-slate-700/60" />

            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Bỏ Qua Chế Độ Im Lặng (Do Not Disturb)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Tự động mở loa ngoài 100% âm lượng kể cả khi máy đang để chế độ rung hoặc ban đêm
                </p>
              </div>
              <IosSwitch
                checked={overrideDND}
                onChange={(c) => {
                  setOverrideDND(c);
                  onUpdateSettings({ overrideDoNotDisturb: c });
                }}
                size="large"
              />
            </div>
          </div>

          {/* SIMULATOR TEST PANEL: THỬ NGHIỆM TỪ XA */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500/10 via-orange-500/5 to-purple-500/10 border-2 border-red-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                <Sparkles className="w-4 h-4" /> Bảng Thử Nghiệm Kích Hoạt Còi Hú Từ Xa (Simulator):
              </div>
              <span className="text-[11px] text-slate-400">Dành cho gia đình diễn tập</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Bạn có thể giả lập gửi tin nhắn hoặc gọi nháy máy để trải nghiệm ngay màn hình báo động còi hú cực đại trên máy bà:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {/* Trigger 1: SMS Code */}
              <button
                type="button"
                onClick={handleTestSmsTrigger}
                className="py-3 px-3.5 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-red-600/30 transition-all"
              >
                <MessageSquare className="w-4 h-4" /> Bắn Lệnh SMS Cú Pháp &quot;SOS&quot;
              </button>

              {/* Trigger 2: Repeated Calls */}
              <button
                type="button"
                onClick={handleTestCallRepeatTrigger}
                className="py-3 px-3.5 rounded-xl bg-orange-600 hover:bg-orange-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-orange-600/30 transition-all"
              >
                <PhoneCall className="w-4 h-4" /> Nháy Máy Khẩn Cấp 2 Lần
              </button>
            </div>
          </div>

          {/* Authorized Emergency Contacts */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-xs">
                  Danh Sách Người Thân Được Quyền Kích Hoạt ({contacts.length}):
                </h4>
                <p className="text-xs text-slate-500">
                  Chỉ những số điện thoại dưới đây mới có quyền kích hoạt còi hú từ xa
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingContact(!isAddingContact)}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm Người Thân
              </button>
            </div>

            {/* Add Contact Form */}
            {isAddingContact && (
              <form onSubmit={handleAddContact} className="p-3.5 bg-blue-50/80 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 rounded-xl space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Họ và tên (ví dụ: Con gái Mai Ly)"
                    className="px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700 text-xs text-slate-900 dark:text-slate-100"
                  />
                  <input
                    type="tel"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="Số điện thoại di động"
                    className="px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700 text-xs text-slate-900 dark:text-slate-100"
                  />
                  <input
                    type="text"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    placeholder="Vai trò (Gia đình, Bác sĩ...)"
                    className="px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700 text-xs text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingContact(false)}
                    className="px-3 py-1 text-xs text-slate-500"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
                  >
                    Lưu Người Thân
                  </button>
                </div>
              </form>
            )}

            {/* Contact Items */}
            <div className="space-y-2">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="p-3 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3 shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm ${contact.avatarColor}`}
                    >
                      {contact.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h5 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                          {contact.name}
                        </h5>
                        <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded">
                          {contact.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-mono">{contact.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex flex-col items-end">
                      <IosSwitch
                        checked={contact.canTriggerAlarm}
                        onChange={(c) => handleToggleContactPermission(contact.id, c)}
                        label={`Quyền kích hoạt cho ${contact.name}`}
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        {contact.canTriggerAlarm ? 'Có quyền' : 'Tạm khóa'}
                      </span>
                    </div>
                    {contacts.length > 1 && (
                      <button
                        onClick={() => handleDeleteContact(contact.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                        title="Xóa người thân"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trigger SMS Passcodes */}
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Cú Pháp Tin Nhắn SMS Kích Hoạt Báo Động:
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {keywords.map((kw, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 text-xs font-mono font-bold flex items-center gap-1.5"
                >
                  <span>{kw}</span>
                  {keywords.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(kw)}
                      className="hover:text-red-900"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>

            <form onSubmit={handleAddKeyword} className="flex gap-2 pt-1">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="Thêm từ khóa mới (ví dụ: BAODONG113)"
                className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold shrink-0"
              >
                Thêm Cú Pháp
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end">
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" /> Lưu & Hoàn Tất Cài Đặt
          </button>
        </div>
      </div>
    </div>
  );
};
