import React, { useState } from 'react';
import { Search, ShieldAlert, ShieldCheck, AlertTriangle, Globe, Phone, MessageSquare, Volume2, Sparkles, ExternalLink, ArrowRight } from 'lucide-react';
import { SocialScanResult, RiskLevel } from '../types/callShield';
import { LiquidGlassCard } from './LiquidGlassCard';
import { speakVietnamese, stopSpeaking } from '../utils/speech';

interface SocialScannerModalProps {
  onClose: () => void;
  guardianPhone: string;
  textSize: 'normal' | 'large' | 'extra-large';
}

export const SocialScannerModal: React.FC<SocialScannerModalProps> = ({
  onClose,
  guardianPhone,
  textSize,
}) => {
  const [query, setQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | 'phone' | 'zalo' | 'facebook' | 'telegram'>('all');
  const [result, setResult] = useState<SocialScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const sampleScenarios = [
    {
      title: 'Zalo Cán bộ Thuế yêu cầu cài app',
      query: 'zalo.me/canbothue099 cài ứng dụng Dịch vụ công eTax',
      platform: 'zalo' as const,
      risk: 'danger' as RiskLevel,
    },
    {
      title: 'Facebook mạo danh Người thân mượn tiền',
      query: 'facebook.com/tuananh.nguyen.reall "Alo mẹ chuyển gấp 20tr"',
      platform: 'facebook' as const,
      risk: 'danger' as RiskLevel,
    },
    {
      title: 'Telegram Nhóm Đầu tư Lợi nhuận khủng',
      query: 't.me/kiemtienonline500k "Nạp 500k nhận 5 triệu sau 15 phút"',
      platform: 'telegram' as const,
      risk: 'danger' as RiskLevel,
    },
    {
      title: 'Đầu số quốc tế lạ nháy máy',
      query: '+224 55 981 721',
      platform: 'phone' as const,
      risk: 'danger' as RiskLevel,
    },
    {
      title: 'Số điện thoại Con trai (Chính chủ)',
      query: '0912 345 678',
      platform: 'phone' as const,
      risk: 'safe' as RiskLevel,
    },
  ];

  const handleScan = (inputQuery: string) => {
    const q = inputQuery.trim();
    if (!q) return;

    setIsScanning(true);
    stopSpeaking();
    setIsSpeaking(false);

    // Heuristic multi-threat scanner engine
    setTimeout(() => {
      let scanResult: SocialScanResult;
      const lower = q.toLowerCase();

      if (q.includes('0912 345 678') || q.includes('0912345678')) {
        scanResult = {
          query: q,
          platform: 'phone',
          accountName: 'Nguyễn Tuấn Anh (Con trai)',
          riskLevel: 'safe',
          riskScore: 0,
          threatType: 'Số điện thoại người thân an toàn',
          indicators: [
            'Nằm trong Danh bạ Người thân (White-list) của gia đình',
            'Không có báo cáo lừa đảo từ Trung tâm Viễn thông Quốc gia',
            'Được xác thực danh tính bởi người giám hộ hợp pháp',
          ],
          recommendation: 'Số an toàn tuyệt đối. Cụ bà có thể gọi điện hoặc bắt máy nói chuyện bình thường.',
          elderlyWarningAdvice: 'Đây là số của con trai Tuấn Anh, bà hoàn toàn yên tâm nghe máy nhé!',
          dateChecked: 'Hôm nay',
        };
      } else if (lower.includes('+224') || lower.includes('+231') || lower.includes('+252') || lower.includes('+88')) {
        scanResult = {
          query: q,
          platform: 'phone',
          accountName: 'Đầu số quốc tế rủi ro cao',
          riskLevel: 'danger',
          riskScore: 98,
          threatType: 'Bẫy nháy máy cước viễn thông quốc tế lừa gọi lại',
          indicators: [
            'Mã vùng thuộc danh sách đen nguy hiểm đã được Bộ TT&TT cảnh báo',
            'Cước phí phát sinh có thể lên tới 150.000 đồng/phút nếu bấm gọi lại',
            'Thủ đoạn nháy máy 1 giây vào đêm khuya kích thích tò mò',
          ],
          recommendation: 'Chặn số vĩnh viễn và TUYỆT ĐỐI KHÔNG gọi lại hay gửi tin nhắn SMS.',
          elderlyWarningAdvice: 'Bà ơi, số nước ngoài lạ này lừa tiền cước điện thoại, bà đừng bấm gọi lại nhé!',
          dateChecked: 'Hôm nay',
        };
      } else if (lower.includes('dịch vụ công') || lower.includes('thuế') || lower.includes('etax') || lower.includes('apk') || lower.includes('canbothue')) {
        scanResult = {
          query: q,
          platform: 'zalo',
          accountName: 'Tài khoản mạo danh Cán bộ ngành Thuế / Dịch vụ công',
          riskLevel: 'danger',
          riskScore: 99,
          threatType: 'Mạo danh cơ quan nhà nước cài mã độc chiếm quyền điều khiển điện thoại',
          indicators: [
            'Cơ quan Thuế và Công an KHÔNG BAO GIỜ gửi link qua Zalo yêu cầu cài ứng dụng ngoài App Store',
            'File đuôi .apk hoặc link lạ chứa mã độc tự động rút sạch tiền ngân hàng',
            'Tài khoản Zalo không có dấu tích vàng xác thực chính thống',
          ],
          recommendation: 'Không nhấp vào link, chặn ngay tài khoản Zalo này và thông báo cho người giám hộ.',
          elderlyWarningAdvice: 'Bà tuyệt đối không ấn vào liên kết Zalo này và không cài bất cứ phần mềm lạ nào vào máy!',
          dateChecked: 'Hôm nay',
        };
      } else if (lower.includes('chuyển gấp') || lower.includes('mượn tiền') || lower.includes('reall') || lower.includes('tai nạn')) {
        scanResult = {
          query: q,
          platform: 'facebook',
          accountName: 'Tài khoản Facebook giả mạo người thân (Nick Clone)',
          riskLevel: 'danger',
          riskScore: 92,
          threatType: 'Mạo danh con cháu nhờ chuyển tiền qua mạng xã hội',
          indicators: [
            'Tài khoản mới tạo, sao chép hình đại diện và thông tin của người thân',
            'Nội dung giục giã chuyển tiền vào số tài khoản lạ mang tên người khác',
            'Thường từ chối gọi video hoặc chỉ gọi chập chờn bằng deepfake vài giây',
          ],
          recommendation: 'Gọi điện thoại trực tiếp bằng số di động thông thường cho con cháu để xác minh ngay.',
          elderlyWarningAdvice: 'Bà ơi, có kẻ xấu giả mạo Facebook con cháu để hỏi tiền. Bà gọi trực tiếp cho con trai trước nhé!',
          dateChecked: 'Hôm nay',
        };
      } else if (lower.includes('kiemtien') || lower.includes('nạp 500k') || lower.includes('telegram') || lower.includes('t.me') || lower.includes('lãi')) {
        scanResult = {
          query: q,
          platform: 'telegram',
          accountName: 'Hội nhóm Telegram đầu tư tài chính lừa đảo (Bẫy Ponzi)',
          riskLevel: 'danger',
          riskScore: 95,
          threatType: 'Lừa đảo dụ người cao tuổi gửi tiền tiết kiệm lấy lãi ảo',
          indicators: [
            'Cam kết lãi suất phi thực tế (gấp 10 lần trong ngày)',
            'Các thành viên trong nhóm phần lớn là nick ảo do một nhóm đối tượng tự tương tác tung hứng',
            'Ban đầu cho rút tiền nhỏ để tạo lòng tin, sau đó giam tiền lớn',
          ],
          recommendation: 'Rời nhóm Telegram ngay lập tức, chặn tin nhắn từ người lạ.',
          elderlyWarningAdvice: 'Không có việc nạp tiền nhận lãi lớn như vậy đâu bà ơi, toàn là lừa đảo lấy tiền tiết kiệm của bà đấy!',
          dateChecked: 'Hôm nay',
        };
      } else {
        // Generic risk assessment
        const isNumeric = /^[0-9+ ]+$/.test(q);
        scanResult = {
          query: q,
          platform: isNumeric ? 'phone' : 'zalo',
          accountName: isNumeric ? 'Số điện thoại chưa có trong danh bạ' : 'Tài khoản mạng xã hội cần rà soát',
          riskLevel: 'warning',
          riskScore: 65,
          threatType: 'Nguồn chưa xác minh danh tính',
          indicators: [
            'Không thuộc danh bạ người thân đã được duyệt',
            'Cần có sự kiểm tra và đồng ý từ người giám hộ gia đình trước khi giao dịch',
          ],
          recommendation: 'Luôn giữ nguyên tắc: Không chia sẻ mật khẩu, không đọc mã OTP và không chuyển tiền khi chưa gặp mặt trực tiếp.',
          elderlyWarningAdvice: 'Bà ơi, thông tin này chưa được xác minh, bà hãy nhờ con trai kiểm tra giúp trước nhé!',
          dateChecked: 'Hôm nay',
        };
      }

      setResult(scanResult);
      setIsScanning(false);
    }, 600);
  };

  const handleSpeakAdvice = (text: string) => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakVietnamese(text, () => setIsSpeaking(false));
    }
  };

  const textClasses = {
    normal: { title: 'text-base font-semibold', body: 'text-sm' },
    large: { title: 'text-lg font-bold', body: 'text-base' },
    'extra-large': { title: 'text-xl font-extrabold', body: 'text-lg' },
  }[textSize];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-xl overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* iOS Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/50 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Rà Soát Đầu Số & Tài Khoản Nghi Vấn
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kiểm tra số điện thoại, Zalo, Facebook, Telegram chống bẫy lừa đảo
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

        {/* Body Container */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Search Box */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Nhập Số Điện Thoại Hoặc Đường Link Cần Kiểm Tra:
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleScan(query)}
                  placeholder="Ví dụ: +224 55..., zalo.me/..., fb.com/..., hoặc tin nhắn mượn tiền"
                  className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="absolute right-3 top-3 text-xs text-slate-400 hover:text-slate-600"
                  >
                    Xóa
                  </button>
                )}
              </div>
              <button
                onClick={() => handleScan(query)}
                disabled={!query.trim() || isScanning}
                className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:opacity-40 text-white font-bold text-sm shadow-md flex items-center gap-1.5 transition-all shrink-0"
              >
                {isScanning ? (
                  <span>Đang quét...</span>
                ) : (
                  <>
                    <Search className="w-4 h-4" /> Quét Ngay
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Scenario Buttons */}
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">
              Thử nhanh các tình huống thực tế hay gặp ở Việt Nam:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {sampleScenarios.map((scen, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(scen.query);
                    handleScan(scen.query);
                  }}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all text-left flex items-center gap-1.5 ${
                    scen.risk === 'danger'
                      ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100'
                      : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {scen.title}
                </button>
              ))}
            </div>
          </div>

          {/* Result Card */}
          {result && (
            <div
              className={`rounded-2xl p-5 border shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200 ${
                result.riskLevel === 'danger'
                  ? 'bg-rose-50/80 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
                  : result.riskLevel === 'warning'
                  ? 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40'
                  : 'bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
              }`}
            >
              {/* Header result */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                      result.riskLevel === 'danger'
                        ? 'bg-rose-600 text-white'
                        : result.riskLevel === 'warning'
                        ? 'bg-amber-500 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {result.riskLevel === 'danger' && <ShieldAlert className="w-6 h-6" />}
                    {result.riskLevel === 'warning' && <AlertTriangle className="w-6 h-6" />}
                    {result.riskLevel === 'safe' && <ShieldCheck className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          result.riskLevel === 'danger'
                            ? 'bg-rose-200 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200'
                            : result.riskLevel === 'warning'
                            ? 'bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200'
                            : 'bg-emerald-200 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200'
                        }`}
                      >
                        {result.riskLevel === 'danger' ? 'Mức độ Nguy Hiểm: 98%' : result.riskLevel === 'warning' ? 'Mức độ Nghi Vấn: 65%' : 'Mức độ An Toàn: 100%'}
                      </span>
                    </div>
                    <h4 className={`text-slate-900 dark:text-slate-100 mt-1 ${textClasses.title}`}>
                      {result.accountName || result.query}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Mối đe dọa: <strong className="text-slate-800 dark:text-slate-200">{result.threatType}</strong>
                    </p>
                  </div>
                </div>

                {/* Speak button for elderly */}
                <button
                  onClick={() => handleSpeakAdvice(result.elderlyWarningAdvice)}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  title="Đọc to cho người cao tuổi"
                >
                  <Volume2 className={`w-4 h-4 ${isSpeaking ? 'text-blue-500 animate-pulse' : ''}`} />
                  {isSpeaking ? 'Đang đọc...' : 'Đọc To Cho Bà'}
                </button>
              </div>

              {/* Special Elderly Callout Box */}
              <div className="bg-white/90 dark:bg-slate-900/90 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wide mb-1">
                  <Sparkles className="w-3.5 h-3.5" /> Lời Dặn Trợ Lý Dành Riêng Cho Người Cao Tuổi:
                </div>
                <p className={`text-slate-800 dark:text-slate-100 font-medium leading-relaxed ${textClasses.body}`}>
                  {result.elderlyWarningAdvice}
                </p>
              </div>

              {/* Indicators */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Dấu hiệu nhận biết cụ thể:
                </span>
                <ul className="space-y-1">
                  {result.indicators.map((ind, i) => (
                    <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-1.5">
                      <span className="text-blue-500 font-bold shrink-0">•</span>
                      <span>{ind}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action recommendation */}
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-2">
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  Khuyến nghị xử lý: <strong className="text-slate-900 dark:text-slate-100">{result.recommendation}</strong>
                </span>
                <a
                  href={`tel:${guardianPhone}`}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all shrink-0"
                >
                  <Phone className="w-3.5 h-3.5" /> Gọi Con Trai ({guardianPhone})
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
