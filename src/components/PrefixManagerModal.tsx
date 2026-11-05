import React, { useState } from 'react';
import { Shield, Plus, Search, Trash2, CheckCircle2, AlertOctagon, HelpCircle } from 'lucide-react';
import { PrefixRule } from '../types/callShield';
import { IosSwitch } from './IosSwitch';

interface PrefixManagerModalProps {
  prefixRules: PrefixRule[];
  onToggleRule: (id: string, blocked: boolean) => void;
  onAddRule: (newRule: Omit<PrefixRule, 'id' | 'reportCount'>) => void;
  onDeleteRule: (id: string) => void;
  onClose: () => void;
}

export const PrefixManagerModal: React.FC<PrefixManagerModalProps> = ({
  prefixRules,
  onToggleRule,
  onAddRule,
  onDeleteRule,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newPrefix, setNewPrefix] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newRisk, setNewRisk] = useState<'danger' | 'warning' | 'safe'>('danger');

  const filteredRules = prefixRules.filter(
    (r) =>
      r.prefix.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.countryOrType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrefix.trim() || !newLabel.trim()) return;

    onAddRule({
      prefix: newPrefix.trim(),
      label: newLabel.trim(),
      countryOrType: 'Quy tắc bổ sung tự tạo',
      riskLevel: newRisk,
      blocked: true,
      description: newDesc.trim() || 'Đầu số được người dùng tự gắn nhãn nghi vấn',
    });

    setNewPrefix('');
    setNewLabel('');
    setNewDesc('');
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-xl overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* iOS Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/50 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-sm">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Quản Lý Nhận Dạng Đầu Số
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kho dữ liệu đầu số quốc tế lừa đảo và tổng đài ảo VoIP nguy hiểm
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

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Search & Add Bar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm mã vùng (+224, +231, 02499, VoIP...)"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" /> Thêm Đầu Số
            </button>
          </div>

          {/* Add New Rule Form */}
          {isAdding && (
            <form onSubmit={handleCreate} className="p-4 bg-orange-50/80 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/40 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-orange-900 dark:text-orange-200">
                Thêm Đầu Số Hoặc Mã Vùng Mới Vào Danh Sách Can Thiệp:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={newPrefix}
                  onChange={(e) => setNewPrefix(e.target.value)}
                  placeholder="Mã đầu số (ví dụ: +255 hoặc 0598)"
                  className="px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-orange-200 dark:border-orange-700 text-sm text-slate-900 dark:text-slate-100"
                />
                <input
                  type="text"
                  required
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Tên gợi nhớ (ví dụ: Đầu số spam vay tiền)"
                  className="px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-orange-200 dark:border-orange-700 text-sm text-slate-900 dark:text-slate-100"
                />
              </div>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Mô tả chi tiết hành vi lừa đảo (tùy chọn)"
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-orange-200 dark:border-orange-700 text-sm text-slate-900 dark:text-slate-100"
              />
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-medium text-slate-600 dark:text-slate-400">Mức độ rủi ro:</span>
                  <select
                    value={newRisk}
                    onChange={(e) => setNewRisk(e.target.value as 'danger' | 'warning')}
                    className="px-2 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
                  >
                    <option value="danger">Nguy hiểm (Chặn tức thì)</option>
                    <option value="warning">Cảnh báo (AI nghe trước)</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold"
                  >
                    Lưu Đầu Số
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* List of rules */}
          <div className="space-y-2">
            {filteredRules.map((rule) => (
              <div
                key={rule.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  rule.blocked
                    ? 'bg-slate-50/90 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-mono font-bold text-xs ${
                      rule.riskLevel === 'danger'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    {rule.prefix}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                        {rule.label}
                      </h4>
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-200/60 dark:bg-slate-700/60 px-1.5 py-0.5 rounded">
                        {rule.countryOrType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {rule.description}
                    </p>
                    <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                      Đã có {rule.reportCount.toLocaleString('vi-VN')} người dân báo cáo bị lừa đảo
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex flex-col items-end">
                    <IosSwitch
                      checked={rule.blocked}
                      onChange={(checked) => onToggleRule(rule.id, checked)}
                      label={`Chặn ${rule.prefix}`}
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      {rule.blocked ? 'Đang chặn' : 'Cho phép'}
                    </span>
                  </div>
                  {rule.id.startsWith('custom-') && (
                    <button
                      onClick={() => onDeleteRule(rule.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Xóa quy tắc này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
