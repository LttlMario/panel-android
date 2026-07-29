import { createClient } from 'jsr:@supabase/supabase-js@2';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization,apikey,content-type',
  'Content-Type': 'application/json',
};
const reply = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers });
const level = (role: string) => {
  const value = String(role || '').toLocaleLowerCase('ro-RO');
  if (value.includes('coordonator') || value === 'admin' || value === 'owner') return 7;
  if (value === 'lider') return 6;
  if (['colider', 'co lider', 'co-lider'].includes(value)) return 5;
  if (value.includes('manager')) return 4;
  if (value.includes('familia')) return 3;
  if (value.includes('sef') || value.includes('șef')) return 2;
  return 1;
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers });
  if (request.method !== 'POST') return reply({ error: 'Metodă invalidă.' }, 405);
  try {
    const body = await request.json();
    const token = body.access_token;
    if (!token) return reply({ error: 'Sesiunea Discord lipsește.' }, 401);

    const discordResponse = await fetch('https://discord.com/api/v10/users/@me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!discordResponse.ok) return reply({ error: 'Sesiunea Discord a expirat.' }, 401);
    const discordUser = await discordResponse.json();

    const keys = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') ?? '{}');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || keys.default;
    if (!serviceKey) throw new Error('Cheia service role nu este configurată.');
    const db = createClient(Deno.env.get('SUPABASE_URL')!, serviceKey);
    const { data: panelUser, error: userError } = await db.from('users').select('role,default_role').eq('discord_id', discordUser.id).maybeSingle();
    if (userError) throw userError;
    if (!panelUser || level(panelUser.role || panelUser.default_role) !== 7) return reply({ error: 'Este necesar nivelul 7.' }, 403);

    if (body.action === 'get') {
      const [{ data: config, error: configError }, { data: mappings, error: mappingsError }] = await Promise.all([
        db.from('discord_panel_config').select('*').eq('id', 1).maybeSingle(),
        db.from('discord_role_mappings').select('*').order('permission_level'),
      ]);
      if (configError) throw configError;
      if (mappingsError) throw mappingsError;
      return reply({ config, mappings: mappings || [] });
    }

    if (body.action === 'save') {
      const config = body.config || {};
      if (!/^\d{15,22}$/.test(String(config.discord_client_id || ''))) throw new Error('Client ID Discord invalid.');
      if (!/^\d{15,22}$/.test(String(config.guild_id || ''))) throw new Error('Guild ID Discord invalid.');
      try { new URL(config.panel_public_url); } catch { throw new Error('URL-ul public al panelului este invalid.'); }

      const configRow = {
        id: 1,
        discord_client_id: String(config.discord_client_id).trim(),
        guild_id: String(config.guild_id).trim(),
        panel_public_url: String(config.panel_public_url).replace(/\/$/, ''),
        family_role_id: config.family_role_id || null,
        mechanics_role_id: config.mechanics_role_id || null,
        family_webhook_url: config.family_webhook_url || null,
        mechanics_webhook_url: config.mechanics_webhook_url || null,
        pontaj_webhook_url: config.pontaj_webhook_url || null,
        requests_webhook_url: config.requests_webhook_url || null,
        contracts_webhook_url: config.contracts_webhook_url || null,
        marketplace_webhook_url: config.marketplace_webhook_url || null,
        illegal_marketplace_webhook_url: config.illegal_marketplace_webhook_url || null,
        illegal_locations_webhook_url: config.illegal_locations_webhook_url || null,
        admin_actions_webhook_url: config.admin_actions_webhook_url || null,
        updated_by_discord_id: discordUser.id,
        updated_at: new Date().toISOString(),
      };
      const { error: configError } = await db.from('discord_panel_config').upsert(configRow, { onConflict: 'id' });
      if (configError) throw configError;

      const mappings = Array.isArray(body.mappings) ? body.mappings : [];
      if (mappings.length !== 7) throw new Error('Trebuie completate toate cele 7 roluri.');
      const mappingRows = mappings.map((item: any) => ({
        discord_role_id: String(item.discord_role_id || '').trim(),
        discord_role_name: String(item.discord_role_name || '').trim(),
        panel_role: String(item.panel_role || '').trim(),
        permission_level: Number(item.permission_level),
        priority: Number(item.permission_level) * 10,
        enabled: true,
        updated_at: new Date().toISOString(),
      }));
      if (mappingRows.some((item: any) => !/^\d{15,22}$/.test(item.discord_role_id) || !item.discord_role_name || !item.panel_role || item.permission_level < 1 || item.permission_level > 7)) {
        throw new Error('Unul dintre roluri are ID-ul sau denumirea necompletată/invalidă.');
      }
      const { error: clearMappingsError } = await db.from('discord_role_mappings').delete().neq('discord_role_id', '');
      if (clearMappingsError) throw clearMappingsError;
      const { error: mappingsError } = await db.from('discord_role_mappings').insert(mappingRows);
      if (mappingsError) throw mappingsError;
      return reply({ ok: true });
    }

    return reply({ error: 'Acțiune necunoscută.' }, 400);
  } catch (error) {
    console.error(error);
    return reply({ error: error instanceof Error ? error.message : 'Eroare necunoscută.' }, 400);
  }
});
