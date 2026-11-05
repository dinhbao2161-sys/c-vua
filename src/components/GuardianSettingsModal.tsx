import React, { useState } from 'react';
import { UserCheck, Phone, Shield, Volume2, Save, BellRing, Heart } from 'lucide-react';
import { CallShieldSettings } from '../types/callShield';
import { soundController } from '../utils/soundEffects';

interface GuardianSettingsModalProps {
  settings: CallShieldSettings;
  onUpdateSettings: (newSettings: Partial<CallShieldSettings>) => void;
  onClose: () => void;
}

export const GuardianSettingsModal: React.FC<GuardianSettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  const [elderlyName, setElderlyName] = useState(settings.elderlyName);
  const [guardianName, setGuardianName] = useState(settings.guardianName);
  const [guardianPhone, setGuardianPhone] = useState(settings.guardianPhone);
  const [emergencySOS, setEmergencySOS] = useState(settings.emergencySOS);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      elderlyName,
      guardianName,
      guardianPhone,
      emergencySOS,
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  const handleTestAlarm = () => {
    soundController.playAlarm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-xl overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* iOS Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/50 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-sm">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Thiết Lập Người Giám Hộ & SOS
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Liên kết bảo vệ trực tiếp giữa người cao tuổi và con cháu
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {/* Senior Profile */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-500" /> Tên Người Cao Tuổi Sử Dụng Máy:
            </label>
            <input
              type="text"
              required
              value={elderlyName}
              onChange={(e) => setElderlyName(e.target.value)}
              placeholder="Ví dụ: Bà Nguyễn Thị Lan (74 tuổi)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Guardian Info */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-indigo-500" /> Người Giám Hộ Chính (Con / Cháu):
            </label>
            <input
              type="text"
              required
              value={guardianName}
              onChange={(e) => setGuardianName(e.target.value)}
              placeholder="Ví dụ: Nguyễn Tuấn Anh (Con trai)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-blue-500" /> Số Điện Thoại Người Giám Hộ Nhận Thông Báo:
            </label>
            <input
              type="tel"
              required
              value={guardianPhone}
              onChange={(e) => setGuardianPhone(e.target.value)}
              placeholder="Ví dụ: 0912 345 678"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-[11px] text-slate-400">
              Số này sẽ nhận tin cảnh báo đỏ và cuộc gọi tự động từ hệ thống khi phát hiện lừa đảo.
            </p>
          </div>

          {/* Emergency SOS */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <BellRing className="w-3.5 h-3.5 text-amber-500" /> Số Điện Thoại Khẩn Cấp (Phím SOS Nhanh):
            </label>
            <input
              type="tel"
              required
              value={emergencySOS}
              onChange={(e) => setEmergencySOS(e.target.value)}
              placeholder="113 hoặc số con cháu"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Test Alarm Sound Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleTestAlarm}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <Volume2 className="w-4 h-4 text-orange-500" /> Thử Chuông Báo Động Lừa Đảo Âm Lượng Lớn
            </button>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className={`w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all ${
                isSaved ? 'bg-emerald-600' : 'bg-indigo-600 hover:bg-indigo-500 active:scale-95'
              }`}
            >
              <Save className="w-4 h-4" />
              {isSaved ? 'Đã Lưu Thành Công!' : 'Lưu Cấu Hình Bảo Vệ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
