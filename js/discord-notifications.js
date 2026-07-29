(() => {
    const SUPABASE_URL = 'https://vkvsabbbawyiurnaiugo.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrdnNhYmJiYXd5aXVybmFpdWdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwNDY5NTYsImV4cCI6MjEwMDYyMjk1Nn0.s2R8mdsoeQzOyz7a-NJOi5SQmyDmyy98cfUMfGqLo44';
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
