import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from 'npm:web-push@3.6.7'

type Supa = ReturnType<typeof createClient>

export interface NotifyPayload {
  type: 'request' | 'overdue' | 'returned'
  title: string
  body: string
  link?: string
}

/**
 * Source unique de notification → trois canaux :
 *  1. ligne `notifications` (alimente la cloche temps réel)
 *  2. web push (VAPID) vers les abonnements des destinataires
 *  3. email (Resend)
 * Chaque canal dégrade gracieusement si sa configuration (clé) est absente.
 */
export async function notify(admin: Supa, userIds: string[], payload: NotifyPayload) {
  const ids = [...new Set(userIds)].filter(Boolean)
  if (ids.length === 0) return

  // 1. In-app
  const { error: insErr } = await admin.from('notifications').insert(
    ids.map(uid => ({
      user_id: uid,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      link: payload.link ?? null,
    })),
  )
  if (insErr) console.error('notifications insert error', insErr)

  // 2. Web Push
  const vapidPublic = Deno.env.get('VAPID_PUBLIC_KEY')
  const vapidPrivate = Deno.env.get('VAPID_PRIVATE_KEY')
  const vapidSubject = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:admin@icamtrack.local'
  if (vapidPublic && vapidPrivate) {
    try {
      webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate)
      const { data: subs } = await admin
        .from('push_subscriptions')
        .select('endpoint, subscription')
        .in('user_id', ids)
      const message = JSON.stringify({ title: payload.title, body: payload.body, link: payload.link })
      for (const s of subs ?? []) {
        try {
          await webpush.sendNotification(s.subscription, message)
        } catch (err) {
          const code = (err as { statusCode?: number })?.statusCode
          if (code === 404 || code === 410) {
            await admin.from('push_subscriptions').delete().eq('endpoint', s.endpoint)
          } else {
            console.error('web push error', code, err)
          }
        }
      }
    } catch (err) {
      console.error('web push setup error', err)
    }
  }

  // 3. Email (Resend)
  const resendKey = Deno.env.get('RESEND_API_KEY')
  if (resendKey) {
    const from = Deno.env.get('RESEND_FROM') ?? 'ICAMTrack <onboarding@resend.dev>'
    const { data: profiles } = await admin.from('profiles').select('email').in('id', ids)
    const emails = (profiles ?? []).map(p => p.email).filter((e: string) => !!e)
    for (const email of emails) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from,
            to: email,
            subject: payload.title,
            html: `<p>${payload.body}</p>${payload.link ? `<p><a href="${payload.link}">Ouvrir ICAMTrack</a></p>` : ''}`,
          }),
        })
        if (!res.ok) console.error('resend error', res.status, await res.text())
      } catch (err) {
        console.error('resend fetch error', err)
      }
    }
  }
}

/** Récupère les IDs de tous les administrateurs. */
export async function adminIds(admin: Supa): Promise<string[]> {
  const { data } = await admin.from('profiles').select('id').eq('role', 'admin')
  return (data ?? []).map(p => p.id as string)
}
