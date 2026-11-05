import React, { useState } from 'react';
import { BookOpen, ShieldAlert, CheckCircle, Volume2, PhoneCall, AlertTriangle } from 'lucide-react';
import { speakVietnamese, stopSpeaking } from '../utils/speech';

interface SeniorGuideModalProps {
  onClose: () => void;
  guardianPhone: string;
}

export const SeniorGuideModal: React.FC<SeniorGuideModalProps> = ({
  onClose,
  guardianPhone,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const guideText = `Kính chào ông bà và các bác. Đây là ba nguyên tắc vàng để không bao giờ bị kẻ gian lừa tiền qua điện thoại:
Nguyên tắc một: Công an và cơ quan nhà nước không bao giờ làm việc hay yêu cầu chuyển tiền qua điện thoại. Nếu ai đó xưng là công an dọa bắt giam đòi tiền, chắc chắn một trăm phần trăm là kẻ lừa đảo.
Nguyên tắc hai: Tuyệt đối không đọc bất kỳ mã số nào gửi về điện thoại, và không ấn vào các đường link lạ trên Zalo hay Facebook.
Nguyên tắc ba: Khi thấy nghi ngờ, ông bà hãy dập máy ngay lập tức, và gọi điện liền cho con trai qua số điện thoại đã lưu trong máy.`;

  const handleToggleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakVietnamese(guideText, () => setIsSpeaking(false));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-xl overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* iOS Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-emerald-50/60 dark:bg-emerald-950/30 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Cẩm Nang Phòng Tránh Lừa Đảo
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Dành riêng cho người cao tuổi – Đơn giản, dễ nhớ
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="px-3 py-1.5 rounded-full bg-slate-200/80 dark:bg-slate-700/80 hover:bg-slate-300 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
          >
            Đóng
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Audio Speaker Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-blue-500/15 border border-emerald-500/30 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                Thuyết Minh Giọng Nói Tiếng Việt
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Nhấn nút để trợ lý đọc to toàn bộ cẩm nang cho bà nghe
              </p>
            </div>
            <button
              onClick={handleToggleSpeak}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all shrink-0 ${
                isSpeaking
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              {isSpeaking ? 'Dừng Đọc' : 'Đọc To Nghe'}
            </button>
          </div>

          {/* 3 Golden Rules */}
          <div className="space-y-3">
            {/* Rule 1 */}
            <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-1">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-sm">
                <span className="w-6 h-6 rounded-full bg-rose-600 text-white text-xs flex items-center justify-center font-bold">1</span>
                <span>TUYỆT ĐỐI KHÔNG CHUYỂN TIỀN</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pl-8">
                Công an, Tòa án, Viện kiểm sát <strong>KHÔNG BAO GIỜ</strong> yêu cầu chuyển tiền vào tài khoản riêng để chứng minh vô tội. Mọi cuộc gọi đòi chuyển tiền đều là lừa đảo 100%!
              </p>
            </div>

            {/* Rule 2 */}
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-1">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm">
                <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                <span>KHÔNG ĐỌC MÃ OTP & BẤM LINK LẠ</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pl-8">
                Không đọc các mã 6 số gửi về tin nhắn máy. Không bấm vào các liên kết cài app &quot;Dịch vụ công&quot; hay &quot;Nộp phạt nguội&quot; gửi qua Zalo.
              </p>
            </div>

            {/* Rule 3 */}
            <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 space-y-1">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold text-sm">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">3</span>
                <span>DẬP MÁY & GỌI LIỀN CHO CON CHÁU</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pl-8">
                Nếu thấy số lạ nói năng hối thúc hoặc dọa dẫm, hãy bình tĩnh bấm nút đỏ kết thúc cuộc gọi ngay, rồi gọi ngay cho con trai ({guardianPhone}) để kiểm tra.
              </p>
            </div>
          </div>

          {/* Quick SOS Call button */}
          <div className="pt-2">
            <a
              href={`tel:${guardianPhone}`}
              className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all"
            >
              <PhoneCall className="w-4 h-4" /> Bấm Để Gọi Cho Con Trai Ngay ({guardianPhone})
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
