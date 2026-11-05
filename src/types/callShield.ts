export type RiskLevel = 'safe' | 'warning' | 'danger';

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  role: string;
  canTriggerAlarm: boolean;
  avatarColor: string;
}

export interface CallShieldSettings {
  aiScreeningEnabled: boolean;       // Trợ lý AI tự động can thiệp & bắt máy nghe trước
  guardianApprovalRequired: boolean; // Cần người giám hộ duyệt trước khi chuông reo
  blockSuspiciousPrefixes: boolean;  // Tự chặn đầu số nước ngoài / VoIP giả mạo
  voiceAnnounceCaller: boolean;      // Đọc to tên/số người gọi bằng giọng nói
  highVolumeWarning: boolean;        // Chuông báo động cực đại khi phát hiện lừa đảo
  autoHangupScamWords: boolean;      // Tự ngắt cuộc gọi ngay khi phát hiện từ khóa nguy hiểm
  seniorTextSize: 'normal' | 'large' | 'extra-large'; // Cỡ chữ người cao tuổi
  darkMode: boolean;                 // Giao diện sáng / tối
  guardianName: string;              // Tên người giám hộ (con cháu)
  guardianPhone: string;             // Số điện thoại người giám hộ
  elderlyName: string;               // Tên cụ bà / cụ ông
  emergencySOS: string;              // Số khẩn cấp (113, 115 hoặc số con cái)

  // Remote SOS Alarm Settings
  remoteSosEnabled: boolean;         // Bật tính năng Báo thức SOS khẩn cấp từ xa
  sosTriggerKeywords: string[];      // Cú pháp tin nhắn SMS khẩn cấp (SOS, CUU HO, BAO DONG)
  sosTriggerCallRepeats: number;     // Số lần gọi nháy liên tiếp để kích hoạt còi hú
  overrideDoNotDisturb: boolean;     // Bỏ qua chế độ im lặng, tự động tăng âm lượng tối đa
  emergencyContacts: EmergencyContact[]; // Danh sách liên hệ khẩn cấp được kích hoạt từ xa
}

export interface SosAlarmTriggerInfo {
  triggeredBy: 'remote' | 'senior';
  senderName: string;
  senderPhone: string;
  triggerMethod: 'sms_code' | 'repeated_calls' | 'manual_button';
  time: string;
}

export interface PrefixRule {
  id: string;
  prefix: string;
  label: string;
  countryOrType: string;
  riskLevel: RiskLevel;
  blocked: boolean;
  description: string;
  reportCount: number;
}

export interface ContactItem {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isTrusted: boolean;
  avatarColor: string;
  lastCallTime?: string;
}

export interface TranscriptLine {
  speaker: 'caller' | 'ai' | 'guardian' | 'elderly';
  text: string;
  time: string;
}

export interface CallRecord {
  id: string;
  callerName: string;
  callerNumber: string;
  timestamp: string;
  durationSeconds: number;
  status: 'blocked' | 'screened_safe' | 'guardian_rejected' | 'guardian_approved' | 'missed';
  riskScore: number; // 0 - 100
  riskReason: string;
  scamKeywordsDetected: string[];
  aiTranscriptSummary: string;
  fullTranscript: TranscriptLine[];
}

export interface SocialScanResult {
  query: string;
  platform: 'zalo' | 'facebook' | 'telegram' | 'phone';
  accountName?: string;
  riskLevel: RiskLevel;
  riskScore: number;
  threatType: string;
  indicators: string[];
  recommendation: string;
  elderlyWarningAdvice: string;
  dateChecked: string;
}

export interface SimulatorScenario {
  id: string;
  title: string;
  category: string;
  callerName: string;
  callerNumber: string;
  riskLevel: RiskLevel;
  avatarInitials: string;
  description: string;
  detectedKeywords: string[];
  dialogue: {
    speaker: 'caller' | 'ai' | 'guardian' | 'elderly';
    text: string;
    delayMs: number;
  }[];
}
