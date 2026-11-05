import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Shield, ShieldAlert, ShieldCheck, UserCheck, Volume2, X, AlertOctagon } from 'lucide-react';
import { SimulatorScenario, CallShieldSettings, CallRecord } from '../types/callShield';
import { soundController } from '../utils/soundEffects';
import { speakVietnamese, stopSpeaking } from '../utils/speech';

interface CallSimulatorModalProps {
  scenario: SimulatorScenario;
  settings: CallShieldSettings;
  onClose: () => void;
  onCallEnded: (record: CallRecord) => void;
}

export const CallSimulatorModal: React.FC<CallSimulatorModalProps> = ({
  scenario,
  settings,
  onClose,
  onCallEnded,
}) => {
  const [callState, setCallState] = useState<'ringing' | 'ai_screening' | 'active_call' | 'guardian_review' | 'ended'>('ringing');
  const [currentLineIndex, setCurrentLineIndex] = useState<number>(-1);
  const [transcript, setTranscript] = useState<{ speaker: 'caller' | 'ai' | 'guardian' | 'elderly'; text: string; time: string }[]>([]);
  const [highlightKeywords, setHighlightKeywords] = useState<string[]>([]);
  const [guardianDecided, setGuardianDecided] = useState<'approved' | 'rejected' | null>(null);
  const [endReason, setEndReason] = useState<string>('');
  const [callDuration, setCallDuration] = useState<number>(0);

  const timerRef = useRef<number | null>(null);
  const dialogueTimerRef = useRef<number | null>(null);
  const durationTimerRef = useRef<number | null>(null);

  // Start iPhone ringtone on load
  useEffect(() => {
    soundController.startRinging();

    // Voice announce if enabled for elderly
    if (settings.voiceAnnounceCaller) {
      const announceText = scenario.riskLevel === 'danger'
        ? `Cảnh báo! Có cuộc gọi từ số lạ nguy hiểm: ${scenario.callerName}`
        : `Có cuộc gọi đến từ ${scenario.callerName}`;
      speakVietnamese(announceText);
    }

    // Auto-advance to AI screening if enabled
    if (settings.aiScreeningEnabled) {
      timerRef.current = window.setTimeout(() => {
        handleStartAiScreening();
      }, 3500);
    }

    return () => {
      soundController.stopRinging();
      stopSpeaking();
      if (timerRef.current) clearTimeout(timerRef.current);
      if (dialogueTimerRef.current) clearTimeout(dialogueTimerRef.current);
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    };
  }, []);

  // Duration counter
  useEffect(() => {
    if (callState === 'ai_screening' || callState === 'active_call' || callState === 'guardian_review') {
      durationTimerRef.current = window.setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    }
    return () => {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    };
  }, [callState]);

  const handleStartAiScreening = () => {
    soundController.stopRinging();
    setCallState('ai_screening');

    if (scenario.riskLevel === 'danger' && settings.highVolumeWarning) {
      soundController.playAlarm();
    } else {
      soundController.playSafeChime();
    }

    // Begin dialogue playback
    runDialogue(0);
  };

  const runDialogue = (index: number) => {
    if (index >= scenario.dialogue.length) {
      // Completed all lines
      handleEndCall('Đã hoàn tất cuộc gọi và lưu nhật ký phân tích');
      return;
    }

    const line = scenario.dialogue[index];
    setCurrentLineIndex(index);

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setTranscript((prev) => [...prev, { speaker: line.speaker, text: line.text, time: timeStr }]);

    // Detect keywords
    const lower = line.text.toLowerCase();
    scenario.detectedKeywords.forEach((kw) => {
      if (lower.includes(kw.toLowerCase()) && !highlightKeywords.includes(kw)) {
        setHighlightKeywords((prev) => [...prev, kw]);
      }
    });

    // Voice speak the line if it is AI or guardian speaking
    if (line.speaker === 'ai' || line.speaker === 'guardian') {
      speakVietnamese(line.text.replace(/\[.*?\]/g, ''));
    }

    // Check if this triggers Guardian Review
    if (settings.guardianApprovalRequired && line.speaker === 'ai' && index === 2 && scenario.riskLevel !== 'safe') {
      setCallState('guardian_review');
    }

    dialogueTimerRef.current = window.setTimeout(() => {
      runDialogue(index + 1);
    }, line.delayMs);
  };

  const handleGuardianAction = (action: 'approved' | 'rejected') => {
    setGuardianDecided(action);
    if (action === 'rejected') {
      soundController.playHangup();
      handleEndCall('Người giám hộ (Con trai) từ chối cuộc gọi & kích hoạt khóa số');
    } else {
      setCallState('active_call');
      soundController.playSafeChime();
      speakVietnamese('Người giám hộ đã cho phép nghe máy.');
    }
  };

  const handleManualAnswer = () => {
    soundController.stopRinging();
    setCallState('active_call');
    runDialogue(0);
  };

  const handleEndCall = (reason: string) => {
    soundController.stopRinging();
    soundController.playHangup();
    if (dialogueTimerRef.current) clearTimeout(dialogueTimerRef.current);
    if (timerRef.current) clearTimeout(timerRef.current);
    stopSpeaking();

    setCallState('ended');
    setEndReason(reason);

    const newRecord: CallRecord = {
      id: `sim-${Date.now()}`,
      callerName: scenario.callerName,
      callerNumber: scenario.callerNumber,
      timestamp: 'Vừa xong',
      durationSeconds: callDuration || 24,
      status:
        guardianDecided === 'rejected'
          ? 'guardian_rejected'
          : scenario.riskLevel === 'danger'
          ? 'blocked'
          : scenario.riskLevel === 'safe'
          ? 'screened_safe'
          : 'screened_safe',
      riskScore: scenario.riskLevel === 'danger' ? 96 : scenario.riskLevel === 'warning' ? 75 : 0,
      riskReason: scenario.description,
      scamKeywordsDetected: highlightKeywords.length > 0 ? highlightKeywords : scenario.detectedKeywords,
      aiTranscriptSummary: `Can thiệp bảo vệ: ${scenario.title}. Kẻ gọi đã cố gắng tiếp cận cụ Lan nhưng trợ lý AI và người giám hộ đã kiểm soát tình hình.`,
      fullTranscript: transcript.length > 0 ? transcript : [
        { speaker: 'caller', text: 'Cuộc gọi mô phỏng đã kết thúc', time: 'Vừa xong' }
      ],
    };

    onCallEnded(newRecord);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/75 backdrop-blur-2xl overflow-y-auto">
      {/* iPhone Device Simulation Shell */}
      <div className="relative w-full max-w-[420px] bg-slate-950 text-white rounded-[44px] shadow-2xl border-4 border-slate-800/80 overflow-hidden flex flex-col min-h-[640px] max-h-[92vh]">
        {/* Dynamic Island / Notch */}
        <div className="relative pt-3 pb-2 flex justify-center items-center shrink-0">
          <div className="h-6 w-28 bg-black rounded-full flex items-center justify-between px-2 border border-slate-800">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
            <div className="w-2.5 h-2.5 rounded-full bg-blue-950/60" />
          </div>
          <button
            onClick={() => {
              handleEndCall('Người dùng đã đóng mô phỏng');
              onClose();
            }}
            className="absolute right-4 top-3 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 transition-colors"
            title="Đóng mô phỏng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Liquid Glass Background Gradient */}
        <div className="absolute inset-0 pointer-events-none -z-10 bg-gradient-to-b from-blue-950/40 via-slate-950/90 to-purple-950/40 opacity-80" />

        {/* Content Area */}
        <div className="flex-1 flex flex-col p-5 overflow-y-auto no-scrollbar">
          {/* Top Status & Risk Indicator */}
          <div className="text-center mt-2 mb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase backdrop-blur-md mb-2 border ${
              scenario.riskLevel === 'danger'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : scenario.riskLevel === 'warning'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }">
              {scenario.riskLevel === 'danger' && <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />}
              {scenario.riskLevel === 'warning' && <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />}
              {scenario.riskLevel === 'safe' && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
              {scenario.riskLevel === 'danger' ? 'Cực kỳ Nguy hiểm (Lừa đảo)' : scenario.riskLevel === 'warning' ? 'Đáng ngờ (Cần cảnh giác)' : 'An toàn (Người thân)'}
            </div>

            <div className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold shadow-xl border-2 border-white/20 bg-gradient-to-tr from-slate-800 to-slate-700">
              {scenario.avatarInitials}
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-white px-2 leading-tight">
              {scenario.callerName}
            </h2>
            <p className="text-base font-mono text-slate-300 mt-1">
              {scenario.callerNumber}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {callState === 'ringing'
                ? 'Đang đổ chuông iPhone...'
                : callState === 'ai_screening'
                ? `Trợ lý AI đang can thiệp bắt máy (${callDuration}s)`
                : callState === 'guardian_review'
                ? 'Chờ người giám hộ phê duyệt...'
                : callState === 'active_call'
                ? `Cuộc gọi đang kết nối (${callDuration}s)`
                : 'Cuộc gọi đã kết thúc'}
            </p>
          </div>

          {/* AI Screening Waveform & Live Dialogue */}
          {(callState === 'ai_screening' || callState === 'guardian_review' || callState === 'active_call' || callState === 'ended') && (
            <div className="liquid-glass rounded-2xl p-3.5 mb-4 border border-white/10 flex-1 flex flex-col">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-xs text-slate-300">
                <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
                  <Shield className="w-3.5 h-3.5" /> Trợ Lý AI CallShield
                </span>
                {callState !== 'ended' && (
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-2 bg-emerald-400 rounded-full animate-wave-1" />
                    <span className="w-1.5 h-4 bg-emerald-400 rounded-full animate-wave-2" />
                    <span className="w-1.5 h-6 bg-emerald-400 rounded-full animate-wave-3" />
                    <span className="w-1.5 h-3 bg-emerald-400 rounded-full animate-wave-4" />
                    <span className="w-1.5 h-5 bg-emerald-400 rounded-full animate-wave-5" />
                  </div>
                )}
              </div>

              {/* Transcript list */}
              <div className="flex-1 overflow-y-auto space-y-2.5 max-h-48 pr-1 text-sm">
                {transcript.map((line, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl transition-all ${
                      line.speaker === 'caller'
                        ? 'bg-rose-950/40 border border-rose-800/30 text-rose-100'
                        : line.speaker === 'ai'
                        ? 'bg-emerald-950/40 border border-emerald-800/30 text-emerald-100'
                        : line.speaker === 'guardian'
                        ? 'bg-blue-950/50 border border-blue-700/50 text-blue-200'
                        : 'bg-slate-800/60 text-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-semibold opacity-75 mb-0.5">
                      <span>
                        {line.speaker === 'caller' && 'Kẻ gọi (Bên ngoài)'}
                        {line.speaker === 'ai' && 'Trợ lý AI (Lá chắn)'}
                        {line.speaker === 'guardian' && 'Người giám hộ (Tuấn Anh)'}
                        {line.speaker === 'elderly' && 'Bà Lan (Người cao tuổi)'}
                      </span>
                      <span>{line.time}</span>
                    </div>
                    <p className="leading-snug text-xs md:text-sm">{line.text}</p>
                  </div>
                ))}
              </div>

              {/* Detected Red-flag Keywords */}
              {highlightKeywords.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-white/10">
                  <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <AlertOctagon className="w-3 h-3" /> Phát hiện từ khóa bẫy:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {highlightKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-semibold bg-rose-500/20 text-rose-200 border border-rose-500/40 px-2 py-0.5 rounded-md"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Guardian Push Verification Popup Modal if triggered */}
          {callState === 'guardian_review' && (
            <div className="mb-4 bg-gradient-to-br from-blue-900/90 to-indigo-950/90 border-2 border-blue-400 rounded-2xl p-4 shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="flex items-center gap-2 mb-2">
                <UserCheck className="w-5 h-5 text-blue-300" />
                <h4 className="text-sm font-bold text-white">Yêu Cầu Duyệt Từ Người Giám Hộ</h4>
              </div>
              <p className="text-xs text-blue-200 leading-relaxed mb-3">
                Trợ lý AI phát hiện dấu hiệu lừa đảo nguy cơ {scenario.riskLevel === 'danger' ? '96%' : '75%'}. Cuộc gọi được giữ máy an toàn và chuyển quyền quyết định cho con trai (Tuấn Anh):
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleGuardianAction('rejected')}
                  className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg"
                >
                  <PhoneOff className="w-4 h-4" /> Từ Chối & Khóa
                </button>
                <button
                  onClick={() => handleGuardianAction('approved')}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg"
                >
                  <Phone className="w-4 h-4" /> Cho Phép Nghe
                </button>
              </div>
            </div>
          )}

          {/* Call Ended Summary Banner */}
          {callState === 'ended' && (
            <div className="mb-4 bg-slate-900/90 border border-white/20 rounded-2xl p-3.5 text-center">
              <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-1" />
              <h4 className="text-sm font-bold text-white mb-1">Cuộc Gọi Đã Kết Thúc</h4>
              <p className="text-xs text-slate-300 mb-2">{endReason || 'Bảo vệ thành công'}</p>
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-white text-slate-900 rounded-xl font-bold text-xs hover:bg-slate-200 active:scale-98 transition-all"
              >
                Đóng & Xem Nhật Ký Chi Tiết
              </button>
            </div>
          )}
        </div>

        {/* Bottom Interactive Controls (Authentic iOS Style) */}
        <div className="p-5 pt-2 bg-gradient-to-t from-black via-black/80 to-transparent shrink-0">
          {callState === 'ringing' && (
            <div className="space-y-3">
              <div className="flex items-center justify-around">
                {/* Decline Button */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => handleEndCall('Người cao tuổi bấm từ chối cuộc gọi')}
                    className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-90 flex items-center justify-center text-white shadow-xl shadow-rose-900/40 transition-transform"
                    aria-label="Từ chối cuộc gọi"
                  >
                    <PhoneOff className="w-7 h-7" />
                  </button>
                  <span className="text-xs text-slate-300 font-medium">Từ chối</span>
                </div>

                {/* AI Screening Button */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={handleStartAiScreening}
                    className="w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-90 flex items-center justify-center text-white shadow-xl shadow-blue-900/40 transition-transform"
                    aria-label="AI Can thiệp bắt máy"
                  >
                    <Shield className="w-7 h-7" />
                  </button>
                  <span className="text-xs text-blue-300 font-medium">AI Nghe Trước</span>
                </div>

                {/* Accept Button */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={handleManualAnswer}
                    className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-90 flex items-center justify-center text-white shadow-xl shadow-emerald-900/40 transition-transform"
                    aria-label="Nghe máy trực tiếp"
                  >
                    <Phone className="w-7 h-7" />
                  </button>
                  <span className="text-xs text-slate-300 font-medium">Nghe máy</span>
                </div>
              </div>
              <p className="text-[11px] text-center text-slate-400">
                (Gợi ý: Nhấn &quot;AI Nghe Trước&quot; để trợ lý tự động thẩm vấn kẻ gọi)
              </p>
            </div>
          )}

          {(callState === 'ai_screening' || callState === 'active_call') && (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => handleEndCall('Người già bấm nút Cúp máy Khẩn cấp')}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-rose-950"
              >
                <PhoneOff className="w-5 h-5" /> Cúp Máy Khẩn Cấp
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
