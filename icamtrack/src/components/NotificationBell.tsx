import { useEffect, useRef, useState } from 'react'
import { Bell, Check, BellRing, BellOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../hooks/useNotifications'
import { usePushSubscription } from '../hooks/usePushSubscription'
import type { AppNotification } from '../lib/types'

const typeColor: Record<AppNotification['type'], string> = {
  request: 'bg-cyan',
  overdue: 'bg-pink',
  returned: 'bg-success',
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return "à l'instant"
  if (m < 60) return `il y a ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `il y a ${h} h`
  return `il y a ${Math.floor(h / 24)} j`
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications()
  const push = usePushSubscription()
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  function openNotif(n: AppNotification) {
    if (!n.read) markRead.mutate(n.id)
    setOpen(false)
    if (n.link) navigate(n.link)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Notifications"
        className="relative flex items-center justify-center w-9 h-9 text-muted hover:text-fg border border-border hover:border-fg transition-colors cursor-pointer"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 flex items-center justify-center bg-pink text-white text-[9px] font-bold font-mono rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-80 max-w-[90vw] bg-surface border-2 border-fg shadow-xl z-50">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <span className="text-[10px] font-bold uppercase tracking-[2px] text-muted">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-[1px] text-muted hover:text-fg cursor-pointer transition-colors"
              >
                <Check size={11} /> Tout lire
              </button>
            )}
          </div>

          {/* Activation du push navigateur */}
          {push.supported && push.state !== 'subscribed' && (
            <button
              onClick={push.subscribe}
              disabled={push.state === 'denied' || push.state === 'loading'}
              className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-[1px] text-fg border-b border-border hover:bg-bg disabled:opacity-50 cursor-pointer transition-colors"
            >
              <BellRing size={12} />
              {push.state === 'denied' ? 'Push bloqué par le navigateur' : 'Activer les notifications push'}
            </button>
          )}
          {push.supported && push.state === 'subscribed' && (
            <button
              onClick={push.unsubscribe}
              className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-[1px] text-muted border-b border-border hover:bg-bg cursor-pointer transition-colors"
            >
              <BellOff size={12} /> Désactiver le push
            </button>
          )}

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-center text-muted py-6 text-[10px] font-bold uppercase tracking-[2px]">
                Aucune notification
              </p>
            ) : (
              notifications.map(n => (
                <button
                  key={n.id}
                  onClick={() => openNotif(n)}
                  className={`w-full text-left flex gap-2 px-3 py-2.5 border-b border-border hover:bg-bg transition-colors cursor-pointer ${n.read ? 'opacity-60' : ''}`}
                >
                  <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${typeColor[n.type]}`} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold uppercase tracking-wide text-fg truncate">{n.title}</span>
                    {n.body && <span className="block text-[11px] text-muted mt-0.5">{n.body}</span>}
                    <span className="block text-[9px] text-muted font-mono uppercase mt-1">{timeAgo(n.created_at)}</span>
                  </span>
                  {!n.read && <span className="mt-1 w-2 h-2 rounded-full bg-pink shrink-0" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
