import { NextResponse } from 'next/server';
import { withSupabase } from '../../../lib/supabaseServer';

export const POST = withSupabase(async (request, supabase) => {
  const body = await request.json();
  if (!body || !body.label || !body.form_url) {
    return NextResponse.json(
      { error: 'label and form_url are required' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase.from('positions').insert([body]).select();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data }, { status: 201 });
});

export const PUT = withSupabase(async (request, supabase) => {
  const body = await request.json();
  const { id, ...update } = body;
  if (!id) {
    return NextResponse.json({ error: 'id is required for update' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('positions')
    .update(update)
    .eq('id', id)
    .select();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data }, { status: 200 });
});

export const DELETE = withSupabase(async (request, supabase) => {
  const body = await request.json();
  const { id } = body || {};
  if (!id) {
    return NextResponse.json({ error: 'id is required for delete' }, { status: 400 });
  }

  const { data, error } = await supabase.from('positions').delete().eq('id', id).select();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data }, { status: 200 });
});
