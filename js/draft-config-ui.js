(() => {
  if (!location.pathname.endsWith('creare-organizatie-voucher.html')) return;
  const form = document.getElementById('create');
  if (!form) return;

  const box = document.createElement('section');
  box.id = 'draft-config';
  box.hidden = true;
  box.className = 'mt-6 rounded-2xl border border-indigo-700/50 bg-slate-900 p-5';
  box.innerHTML = '<h2 class="text-xl font-black">Configurează organizația Draft</h2><p class="mt-2 text-sm text-slate-400">Alege guildul separat, apoi verifică rolurile și salvează configurația.</p><div class="mt-4 space-y-3"><div class="flex flex-wrap gap-2"><input id="draft-config-guild" inputmode="numeric" class="min-w-64 flex-1 rounded-xl border border-slate-700 bg-slate-950 p-3" placeholder="Guild ID Discord"><button id="draft-config-attach-guild" type="button" class="rounded-xl bg-cyan-700 px-4 py-3 font-bold">Adaugă și verifică guildul</button></div><input id="draft-config-logo" type="url" class="w-full rounded-xl border border-slate-700 bg-slate-950 p-3" placeholder="Logo PNG/JPG URL"><input id="draft-config-webhook" type="url" class="w-full rounded-xl border border-slate-700 bg-slate-950 p-3" placeholder="Webhook principal (opțional)"><input id="draft-config-pages" type="text" class="w-full rounded-xl border border-slate-700 bg-slate-950 p-3" placeholder="Pagini, separate prin virgulă"><div class="flex flex-wrap gap-2"><button id="draft-config-save" type="button" class="rounded-xl bg-indigo-700 px-5 py-3 font-bold">Salvează configurația</button><button id="draft-config-finalize" type="button" class="rounded-xl bg-emerald-700 px-5 py-3 font-bold">Finalizează organizația</button></div><p id="draft-config-status" class="text-sm text-slate-400"></p></div>';
  form.parentElement.appendChild(box);

  let organizationId = '';
  const getConfig = () => window.PANEL_SUPABASE_CONFIG;
  const getToken = () => localStorage.getItem('discord_access_token') || '';
  const getVoucher = () => document.getElementById('voucher')?.value.trim().toUpperCase() || '';
  const status = () => document.getElementById('draft-config-status');
  const call = (path, body, extra = {}) => fetch(`${getConfig().url}/functions/v1/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: getConfig().publishableKey, Authorization: `Bearer ${getConfig().publishableKey}`, ...extra }, body: JSON.stringify(body) });

  const originalFetch = window.fetch;
  window.fetch = async (url, options) => {
    const response = await originalFetch(url, options);
    if (String(url).includes('create-voucher-organization')) {
      try {
        const json = await response.clone().json();
        if (json.organization?.id) {
          organizationId = json.organization.id;
          window.draftOrganizationId = organizationId;
          box.hidden = false;
          box.scrollIntoView({ behavior: 'smooth' });
        }
      } catch (_) { /* responsea nu este JSON */ }
    }
    return response;
  };

  document.getElementById('draft-config-attach-guild').onclick = async () => {
    const guildId = document.getElementById('draft-config-guild').value.trim();
    if (!organizationId) { status().textContent = 'Creează mai întâi organizația Draft.'; return; }
    if (!/^\d{15,22}$/.test(guildId)) { status().textContent = 'Guild ID invalid.'; return; }
    const button = document.getElementById('draft-config-attach-guild');
    button.disabled = true;
    status().textContent = 'Se verifică botul și apartenența la guild...';
    try {
      const response = await call('manage-draft-organization', { action: 'attach_guild', access_token: getToken(), voucher_code: getVoucher(), organization_id: organizationId, guild_id: guildId });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Guildul nu a putut fi adăugat.');
      document.getElementById('guild').value = guildId;
      status().textContent = `Guild adăugat: ${result.guild_name || guildId}. Poți citi rolurile.`;
    } catch (error) { status().textContent = error.message || 'Guildul nu a putut fi adăugat.'; }
    button.disabled = false;
  };

  document.getElementById('draft-config-save').onclick = async () => {
    if (!organizationId) return;
    const pages = Object.fromEntries(document.getElementById('draft-config-pages').value.split(',').map((value) => value.trim()).filter(Boolean).map((page) => [page, []]));
    const response = await call('manage-draft-organization', { access_token: getToken(), organization_id: organizationId, logo_url: document.getElementById('draft-config-logo').value, webhook_routes: { organization: { primary: { enabled: true, url: document.getElementById('draft-config-webhook').value } } }, page_permissions: pages });
    const result = await response.json();
    status().textContent = response.ok ? 'Configurația a fost salvată.' : (result.error || 'Salvarea a eșuat.');
  };

  document.getElementById('draft-config-finalize').onclick = async () => {
    if (!organizationId) return;
    const button = document.getElementById('draft-config-finalize');
    button.disabled = true;
    status().textContent = 'Se verifică rolurile și se activează organizația...';
    try {
      const response = await call('finalize-organization', { access_token: getToken(), voucher_code: getVoucher(), organization_id: organizationId });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Organizația nu a putut fi finalizată.');
      status().textContent = 'Organizația a fost activată cu succes.';
    } catch (error) { status().textContent = error.message || 'Activarea a eșuat.'; }
    button.disabled = false;
  };
})();
