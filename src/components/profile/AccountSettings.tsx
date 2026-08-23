import React from 'react';
import { Shield, Download, LogOut, Trash2, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AccountSettingsProps {
  onLogout: () => void;
}

export const AccountSettings: React.FC<AccountSettingsProps> = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleExportData = () => {
    try {
      const data: Record<string, any> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('globetrotter_')) {
          data[key] = JSON.parse(localStorage.getItem(key) || '{}');
        }
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `globetrotter-travel-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#EAE6DD] p-6 sm:p-8 shadow-xs space-y-6">
      <div>
        <h2 className="text-lg font-extrabold text-[#17201D] tracking-tight">Account & Security</h2>
        <p className="text-xs text-[#68736F] mt-0.5">
          Manage your session security, privacy preferences, and travel data exports.
        </p>
      </div>

      <div className="divide-y divide-[#F4F1EA]">
        {/* Export Data */}
        <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F4F1EA] flex items-center justify-center text-[#17201D] shrink-0">
              <Download className="w-4 h-4 text-[#20B8A6]" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#17201D]">Export Travel Archive</h3>
              <p className="text-[11px] text-[#838F8B]">Download all your trips, expenses, and itinerary data in JSON format.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleExportData}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FCFBF8] border border-[#EAE6DD] hover:border-[#17201D] text-xs font-bold text-[#17201D] transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Data</span>
          </button>
        </div>

        {/* Security & Sync */}
        <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F4F1EA] flex items-center justify-center text-[#17201D] shrink-0">
              <Shield className="w-4 h-4 text-[#FF6B4A]" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#17201D]">Sync & Privacy Protection</h3>
              <p className="text-[11px] text-[#838F8B]">End-to-end local isolation protects your itinerary notes and payment records.</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#E8F8F5] text-[#179E8E] text-xs font-bold self-start sm:self-auto">
            Active & Secure
          </span>
        </div>

        {/* Log Out */}
        <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF2EE] flex items-center justify-center text-[#D94F3D] shrink-0">
              <LogOut className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#17201D]">Log Out of GlobeTrotter</h3>
              <p className="text-[11px] text-[#838F8B]">End your active session securely on this browser.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FFF2EE] hover:bg-[#FFE7DE] text-xs font-bold text-[#D94F3D] transition-colors cursor-pointer self-start sm:self-auto"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
