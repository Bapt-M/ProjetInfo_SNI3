import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { notify, adminIds } from '../_shared/notify.ts'

// Fonction planifiée (pg_cron) : signale les emprunts actifs en retard.
// Protégée par un secret partagé pour éviter les déclenchements non sollicités.
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok')

  const cronSecret = Deno.env.get('CRON_SECRET')
  if (cronSecret && req.headers.get('x-cron-secret') !== cronSecret) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const nowIso = new Date().toISOString()

    // Emprunts actifs, échus, pas encore signalés
    const { data: overdue, error } = await supabase
      .from('loan_requests')
      .select('id, student_id, due_date')
      .eq('status', 'active')
      .not('due_date', 'is', null)
      .lt('due_date', nowIso)
      .is('overdue_notified_at', null)
    if (error) throw error

    if (!overdue || overdue.length === 0) {
      return new Response(JSON.stringify({ processed: 0 }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const admins = await adminIds(supabase)

    for (const loan of overdue) {
      await notify(supabase, [loan.student_id, ...admins], {
        type: 'overdue',
        title: 'Emprunt en retard',
        body: `Un emprunt a dépassé sa date de retour (${loan.due_date?.slice(0, 10)}).`,
        link: '/admin/emprunts',
      })
      await supabase
        .from('loan_requests')
        .update({ overdue_notified_at: nowIso })
        .eq('id', loan.id)
    }

    return new Response(JSON.stringify({ processed: overdue.length }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
