import React from 'react';
import { PushNotificationItem, SupportedLanguage } from '../types';
import { Bell, Check, Sparkles, Trophy, Award, Plane, X } from 'lucide-react';

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: PushNotificationItem[];
  lang: SupportedLanguage;
  onMarkRead: () => void;
  onSelectAction: (actionTab?: string) => void;
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  isOpen,
  onClose,
  notifications,
  lang,
  onMarkRead,
  onSelectAction,
}) => {
  if (!isOpen) return null;

  return (
    <div id="notifications-dropdown-menu" className="absolute right-0 top-12 w-80 sm:w-96 bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-2xl p-4 space-y-3 z-50 text-[#E2E8F0] animate-in fade-in zoom-in-95 duration-150">
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-2.5">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-[#38BDF8]" />
          <span className="text-xs font-semibold font-serif-display uppercase tracking-wider text-white">
            {lang === 'pt' ? 'Notificações & Alertas' : 'Push Alerts & Updates'}
          </span>
        </div>
        <button
          onClick={onMarkRead}
          className="text-[10px] text-[#38BDF8] hover:text-[#38BDF8]/80 font-mono-avionics cursor-pointer transition-colors"
        >
          {lang === 'pt' ? 'Marcar lidas' : 'Mark all read'}
        </button>
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            onClick={() => {
              onSelectAction(notif.actionTab);
              onClose();
            }}
            className={`p-3 rounded-xl border transition-all cursor-pointer flex gap-3 ${
              notif.isRead ? 'bg-[#0A0C10]/60 border-[#1E293B] opacity-70' : 'bg-[#0A0C10] border-[#38BDF8]/40 shadow-sm shadow-[#38BDF8]/10'
            }`}
          >
            <div className="p-2 rounded-xl bg-[#1E293B] text-[#38BDF8] border border-[#334155] shrink-0 h-fit">
              {notif.type === 'certificate' ? <Award className="h-4 w-4" /> : notif.type === 'challenge' ? <Trophy className="h-4 w-4" /> : <Plane className="h-4 w-4" />}
            </div>
            <div className="space-y-1 flex-1">
              <div className="text-xs font-semibold text-white font-serif-display line-clamp-1">{notif.title}</div>
              <p className="text-[11px] text-[#94A3B8] line-clamp-2 leading-tight font-sans">{notif.message}</p>
              <div className="text-[9px] text-[#64748B] font-mono-avionics">{notif.timestamp}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
