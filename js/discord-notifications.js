(() => {
    const SUPABASE_URL = window.PANEL_SUPABASE_CONFIG.url;
    const SUPABASE_KEY = window.PANEL_SUPABASE_CONFIG.publishableKey;
    window.sendPanelDiscord = async (channel, payload) => {
        const accessToken = localStorage.getItem('discord_access_token');
        if (!accessToken) throw new Error('Sesiunea Discord lipsește. Autentifică-te din nou.');
        let body;
        const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` };
        if (payload instanceof FormData) {
            body = payload;
            body.append('_panel_channel', channel);
            body.append('_panel_access_token', accessToken);
        } else {
            headers['Content-Type'] = 'application/json';
            body = JSON.stringify({ channel, payload, access_token: accessToken });
        }
        const response = await fetch(`${SUPABASE_URL}/functions/v1/send-discord-notification`, { method: 'POST', headers, body });
        if (!response.ok) {
            let message = 'Notificarea Discord nu a putut fi trimisă.';
            try { message = (await response.json()).error || message; } catch (_) {}
            throw new Error(message);
        }
        return response;
    };
})();
