import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { notify } from '../_shared/notify.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response('Unauthorized', { status: 401 })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (!user) return new Response('Unauthorized', { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return new Response('Forbidden', { status: 403 })

    const { loan_id }: { loan_id: string } = await req.json()
    const now = new Date().toISOString()

    const { data: items } = await supabase
      .from('loan_items').select('id, equipment_id').eq('loan_id', loan_id)

    if (!items) throw new Error('Loan items not found')

    await supabase.from('loan_items').update({ returned_at: now }).eq('loan_id', loan_id)

    const equipmentIds = items
      .filter((i): i is { id: string; equipment_id: string } => i.equipment_id !== null)
      .map(i => i.equipment_id)

    if (equipmentIds.length > 0) {
      await supabase.from('equipment').update({ status: 'available' }).in('id', equipmentIds)
    }

    const { data: loan } = await supabase.from('loan_requests')
      .update({ status: 'closed', closed_at: now })
      .eq('id', loan_id)
      .select('student_id')
      .single()

    // Notifie l'étudiant que son emprunt est clôturé (matériel rendu)
    if (loan?.student_id) {
      await notify(supabase, [loan.student_id], {
        type: 'returned',
        title: 'Emprunt clôturé',
        body: 'Votre emprunt a été clôturé : le matériel est marqué comme rendu.',
        link: '/historique',
      })
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
