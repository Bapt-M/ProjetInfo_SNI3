import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  items: Array<{ category_id: string; quantity: number }>
  due_date?: string
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

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (authError || !user) return new Response('Unauthorized', { status: 401 })

    const { items, due_date }: RequestBody = await req.json()

    if (!items?.length) {
      return new Response(
        JSON.stringify({ error: 'Au moins un article requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify available stock for each category
    for (const item of items) {
      const { count } = await supabase
        .from('equipment')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', item.category_id)
        .eq('status', 'available')

      if ((count ?? 0) < item.quantity) {
        return new Response(
          JSON.stringify({ error: 'Stock insuffisant pour une des catégories demandées' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Create loan request
    const { data: loan, error: loanErr } = await supabase
      .from('loan_requests')
      .insert({ student_id: user.id, due_date: due_date ?? null })
      .select()
      .single()

    if (loanErr) throw loanErr

    // Create loan items — 1 row per physical item slot
    const loanItems = items.flatMap(item =>
      Array.from({ length: item.quantity }, () => ({
        loan_id: loan.id,
        category_id: item.category_id,
      }))
    )

    const { error: itemsErr } = await supabase.from('loan_items').insert(loanItems)
    if (itemsErr) throw itemsErr

    return new Response(
      JSON.stringify({ id: loan.id }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
