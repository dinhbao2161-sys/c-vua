import React, { useEffect, useState, useRef } from 'react';
import { BellRing, ShieldAlert, PhoneCall, CheckCircle2, Volume2, User, Flame, AlertOctagon } from 'lucide-react';
import { SosAlarmTriggerInfo, CallShieldSettings } from '../types/callShield';
import { soundController } from '../utils/soundEffects';
import { speakVietnamese, stopSpeaking } from '../utils/speech';

interface EmergencyAlarmModalProps {
  triggerInfo: SosAlarmTriggerInfo;
  settings: CallShieldSettings;
  onDismiss: (safeConfirmed: boolean) => void;
}

export const EmergencyAlarmModal: React.FC<EmergencyAlarmModalProps> = ({
  triggerInfo,
  settings,
  onDismiss,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [voiceLoopCount, setVoiceLoopCount] = useState(0);
  const voiceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    // 1. Play continuous emergency siren
    soundController.startEmergencySiren();

    // 2. Continuous voice prompt in Vietnamese
    const voiceText =
      triggerInfo.triggeredBy === 'remote'
        ? `Bà ơi! ${triggerInfo.senderName} đang kích hoạt báo động khẩn cấp từ xa! Xin bà hãy nghe máy hoặc nhấn nút an toàn ngay!`
        : `Đang phát báo động cứu nạn khẩn cấp! Đã gửi tín hiệu cứu hộ tới toàn bộ người thân trong gia đình!`;

    const speakPrompt = () => {
      speakVietnamese(voiceText);
    };

    speakPrompt();
    voiceTimerRef.current = window.setInterval(() => {
      setVoiceLoopCount((c) => c + 1);
      speakPrompt();
    }, 6000);

    // 3. Count seconds
    const interval = window.setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);

    return () => {
      soundController.stopEmergencySiren();
      stopSpeaking();
      clearInterval(interval);
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    };
  }, [triggerInfo]);

  const handleImSafe = () => {
    soundController.stopEmergencySiren();
    soundController.playSafeChime();
    stopSpeaking();
    speakVietnamese('Báo động đã tắt. Thông báo an toàn đã được gửi cho con cháu.');
    onDismiss(true);
  };

  const handleCallBack = () => {
    soundController.stopEmergencySiren();
    stopSpeaking();
    window.location.href = `tel:${triggerInfo.senderPhone || settings.guardianPhone}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-red-950/95 backdrop-blur-3xl overflow-y-auto animate-in fade-in duration-200">
      {/* Red Strobe Lighting Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-red-600/30 via-red-900/60 to-black/80 animate-pulse duration-700" />

      {/* Main Container */}
      <div className="relative w-full max-w-lg bg-black/80 border-4 border-red-500 rounded-[36px] p-6 shadow-[0_0_80px_rgba(239,68,68,0.6)] text-white text-center flex flex-col justify-between min-h-[580px] z-10">
        {/* Top Warning Banner */}
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600 text-white font-extrabold text-xs sm:text-sm tracking-wider uppercase shadow-lg shadow-red-600/50 mb-4 animate-bounce">
            <BellRing className="w-4 h-4 animate-spin" /> BÁO THỨC SOS KHẨN CẤP
          </div>

          {/* Pulsing Siren Icon with radiating rings */}
          <div className="relative w-28 h-28 mx-auto my-3 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-red-600/30 animate-ping duration-1000" />
            <div className="absolute inset-2 rounded-full bg-red-500/50 animate-pulse duration-500" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-2xl border-2 border-white/60">
              <ShieldAlert className="w-10 h-10 text-white animate-wiggle" />
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2 leading-tight">
            {triggerInfo.triggeredBy === 'remote'
              ? `${triggerInfo.senderName} Đang Báo Động!`
              : 'Đã Bật Báo Động Khẩn Cấp!'}
          </h2>

          <p className="text-sm sm:text-base text-red-200 font-medium mt-2 px-2 leading-relaxed">
            {triggerInfo.triggeredBy === 'remote' ? (
              <>
                Người thân kích hoạt chuông hú từ xa qua{' '}
                <strong className="text-white underline decoration-red-400">
                  {triggerInfo.triggerMethod === 'sms_code'
                    ? 'Tin nhắn cú pháp SOS'
                    : 'Cuộc gọi nháy máy liên tiếp'}
                </strong>{' '}
                để kiểm tra xem bà có an toàn không!
              </>
            ) : (
              <>
                Tín hiệu cấp cứu đã gửi đồng loạt đến{' '}
                <strong className="text-white">{(settings.emergencyContacts || []).length || 4} người thân</strong>. Còi hú phát tại chỗ để hàng xóm trợ giúp!
              </>
            )}
          </p>

          {/* Status Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-red-900/60 border border-red-700/60 text-red-200 font-mono">
              Âm lượng: 100% Cực đại
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-red-900/60 border border-red-700/60 text-red-200 font-mono">
              Bỏ qua im lặng
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-red-900/60 border border-red-700/60 text-red-200 font-mono">
              Đang hú: {elapsedSeconds}s
            </span>
          </div>
        </div>

        {/* Central Voice Status */}
        <div className="my-4 p-3 rounded-2xl bg-red-950/60 border border-red-800/60 flex items-center justify-center gap-2 text-xs sm:text-sm text-red-100 font-semibold">
          <Volume2 className="w-5 h-5 text-red-400 shrink-0 animate-pulse" />
          <span>Loa ngoài đang đọc to hướng dẫn bằng tiếng Việt...</span>
        </div>

        {/* Extra Large Action Buttons for Elderly */}
        <div className="space-y-3 pt-2">
          {/* Button 1: I'm Safe (Tắt Báo Thức) */}
          <button
            onClick={handleImSafe}
            className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-base sm:text-lg flex items-center justify-center gap-3 shadow-2xl shadow-emerald-900/60 transition-transform"
          >
            <CheckCircle2 className="w-7 h-7 shrink-0" />
            <span>BÀ ĐÃ NGHE / TẮT BÁO ĐỘNG</span>
          </button>

          {/* Button 2: Call Back Guardian */}
          <button
            onClick={handleCallBack}
            className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-blue-950/60 transition-transform"
          >
            <PhoneCall className="w-5 h-5 shrink-0" />
            <span>GỌI LẠI CHO {triggerInfo.senderName.toUpperCase()} ({triggerInfo.senderPhone || settings.guardianPhone})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
