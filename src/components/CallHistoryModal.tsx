import React, { useState } from 'react';
import { History, ShieldAlert, ShieldCheck, PhoneOff, Phone, Volume2, Trash2, AlertCircle } from 'lucide-react';
import { CallRecord } from '../types/callShield';
import { speakVietnamese, stopSpeaking } from '../utils/speech';

interface CallHistoryModalProps {
  records: CallRecord[];
  onClearHistory: () => void;
  onClose: () => void;
}

export const CallHistoryModal: React.FC<CallHistoryModalProps> = ({
  records,
  onClearHistory,
  onClose,
}) => {
  const [selectedRecord, setSelectedRecord] = useState<CallRecord | null>(records[0] || null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeakTranscript = (text: string) => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakVietnamese(text, () => setIsSpeaking(false));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-xl overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* iOS Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/50 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-sm">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Nhật Ký Can Thiệp & Bảo Vệ Cuộc Gọi
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ghi chép chi tiết các cuộc gọi đã được trợ lý AI sàng lọc và xử lý
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {records.length > 0 && (
              <button
                onClick={onClearHistory}
                className="px-3 py-1.5 rounded-full hover:bg-rose-100 dark:hover:bg-rose-950/40 text-xs font-semibold text-rose-600 dark:text-rose-400 transition-colors"
              >
                Xóa nhật ký
              </button>
            )}
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
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column: Call List */}
          <div className="space-y-2 overflow-y-auto max-h-[60vh] pr-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
              Danh sách cuộc gọi gần đây ({records.length}):
            </span>
            {records.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
                <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-60" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Chưa có cuộc gọi nào bị can thiệp</p>
                <p className="text-xs text-slate-400 mt-1">Các cuộc gọi đáng ngờ sẽ được tự động lưu lại tại đây.</p>
              </div>
            ) : (
              records.map((rec) => {
                const isSelected = selectedRecord?.id === rec.id;
                return (
                  <div
                    key={rec.id}
                    onClick={() => {
                      stopSpeaking();
                      setIsSpeaking(false);
                      setSelectedRecord(rec);
                    }}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-50/90 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 shadow-sm'
                        : 'bg-white dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            rec.status === 'blocked' || rec.status === 'guardian_rejected'
                              ? 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400'
                              : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                          }`}
                        >
                          {rec.status === 'blocked' ? (
                            <PhoneOff className="w-4 h-4" />
                          ) : rec.status === 'guardian_rejected' ? (
                            <ShieldAlert className="w-4 h-4" />
                          ) : (
                            <Phone className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                            {rec.callerName}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                            {rec.callerNumber}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400 shrink-0">
                        {rec.timestamp}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span
                        className={`font-semibold px-2 py-0.5 rounded-md ${
                          rec.riskScore > 70
                            ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'
                            : rec.riskScore > 30
                            ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                            : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        {rec.riskScore > 70 ? `Nguy hiểm: ${rec.riskScore}%` : rec.riskScore > 0 ? `Nghi vấn: ${rec.riskScore}%` : 'An toàn'}
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        Thời lượng: {rec.durationSeconds}s
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Selected Call Detail */}
          {selectedRecord ? (
            <div className="bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between overflow-y-auto max-h-[60vh]">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-700/80 pb-3">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {selectedRecord.callerName}
                    </h4>
                    <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                      {selectedRecord.callerNumber} · {selectedRecord.timestamp}
                    </p>
                  </div>
                  <button
                    onClick={() => handleSpeakTranscript(selectedRecord.aiTranscriptSummary)}
                    className="p-2 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-200 shadow-sm active:scale-95 transition-transform"
                    title="Đọc tóm tắt cho người cao tuổi"
                  >
                    <Volume2 className={`w-4 h-4 ${isSpeaking ? 'text-blue-500 animate-pulse' : ''}`} />
                  </button>
                </div>

                {/* AI Summary */}
                <div className="bg-white dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
                    Trợ lý AI Đánh Giá:
                  </span>
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                    {selectedRecord.aiTranscriptSummary}
                  </p>
                </div>

                {/* Detected Keywords */}
                {selectedRecord.scamKeywordsDetected.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500 block mb-1">
                      Từ khóa vi phạm nhận dạng:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {selectedRecord.scamKeywordsDetected.map((kw, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 px-2 py-0.5 rounded"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Full Transcript */}
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
                    Biên bản hội thoại chi tiết:
                  </span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {selectedRecord.fullTranscript.map((t, idx) => (
                      <div
                        key={idx}
                        className={`text-xs p-2 rounded-lg ${
                          t.speaker === 'caller'
                            ? 'bg-rose-100/60 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200'
                            : t.speaker === 'ai'
                            ? 'bg-emerald-100/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
                            : 'bg-blue-100/60 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200'
                        }`}
                      >
                        <div className="font-bold text-[10px] opacity-70 mb-0.5">
                          {t.speaker === 'caller' ? 'Người gọi lạ' : t.speaker === 'ai' ? 'Trợ lý AI' : 'Người giám hộ'} ({t.time}):
                        </div>
                        <p>{t.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action: Report to 156 */}
              <div className="pt-3 border-t border-slate-200/80 dark:border-slate-700/80 mt-3 flex items-center justify-between text-xs">
                <span className="text-slate-500">Cơ chế bảo vệ: Đã chặn thành công</span>
                <a
                  href="tel:156"
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                >
                  <AlertCircle className="w-3.5 h-3.5" /> Báo cáo Tổng đài 156
                </a>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center p-8 text-center text-slate-400 text-xs">
              Chọn một cuộc gọi bên trái để xem biên bản
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
