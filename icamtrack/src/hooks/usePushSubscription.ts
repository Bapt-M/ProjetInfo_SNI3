import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { urlBase64ToUint8Array, VAPID_PUBLIC_KEY } from '../lib/push'

export type PushState = 'loading' | 'unsupported' | 'denied' | 'unsubscribed' | 'subscribed'

/**
 * Gère l'abonnement Web Push de l'utilisateur : enregistrement du service worker,
 * demande de permission, souscription PushManager, et stockage dans push_subscriptions.
 */
export function usePushSubscription() {
  const { user } = useAuth()
  const [state, setState] = useState<PushState>('loading')

  const supported =
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window &&
    !!VAPID_PUBLIC_KEY

  useEffect(() => {
    if (!supported) { setState('unsupported'); return }
    navigator.serviceWorker
      .register('/sw.js')
      .then(async (reg) => {
        if (Notification.permission === 'denied') { setState('denied'); return }
        const sub = await reg.pushManager.getSubscription()
        setState(sub ? 'subscribed' : 'unsubscribed')
      })
      .catch(() => setState('unsupported'))
  }, [supported])

  const subscribe = useCallback(async () => {
    if (!supported || !user) return
    setState('loading')
    try {
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') { setState('denied'); return }
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY!) as BufferSource,
      })
      const { error } = await supabase.from('push_subscriptions').upsert(
        { user_id: user.id, endpoint: sub.endpoint, subscription: sub.toJSON() },
        { onConflict: 'endpoint' },
      )
      if (error) throw error
      setState('subscribed')
    } catch {
      setState('unsubscribed')
    }
  }, [supported, user])

  const unsubscribe = useCallback(async () => {
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
        await sub.unsubscribe()
      }
    } finally {
      setState('unsubscribed')
    }
  }, [])

  return { state, supported, subscribe, unsubscribe }
}
