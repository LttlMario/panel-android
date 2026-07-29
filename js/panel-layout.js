// Navigare comună pentru panel: meniu mobil și sidebar pliabil pe desktop.
(() => {
    const COLLAPSE_KEY = 'panel_sidebar_collapsed';

    function addStyles() {
        if (document.getElementById('panel-layout-styles')) return;
        const style = document.createElement('style');
        style.id = 'panel-layout-styles';
        style.textContent = `
            .panel-responsive-sidebar { transition: width .2s ease; position:sticky; top:0; height:100vh; align-self:flex-start; }
            .panel-responsive-sidebar.fixed { position:fixed; }
            #panel-theme-toggle { width:38px; height:38px; flex:none; display:grid; place-items:center; border:1px solid #334155; border-radius:11px; background:#0b1220; color:#cbd5e1; cursor:pointer; box-shadow:0 5px 16px rgba(0,0,0,.18); }
            #panel-theme-toggle:hover { border-color:#10b981; color:#6ee7b7; }
            .panel-header-tools { position:absolute; left:50%; transform:translateX(-50%); z-index:25; width:min(620px,45vw); display:flex; align-items:center; justify-content:center; gap:10px; }
            .panel-header-tools .panel-search-host { position:relative; width:100%; min-width:0; }
            .panel-header-tools .panel-search-host > div, .panel-header-tools .panel-search-host .relative, .panel-header-tools .search-container { width:100% !important; max-width:none !important; }

            /* Tema Panel nu primește suprascrieri: păstrează exact designul original al paginilor. */
            html[data-panel-theme="dark"] { color-scheme:dark; --bg-main:#030712; --bg-panel:#080f1d; --bg-panel-hover:#111c2e; --card:#0a1220; --border:#223047; --text-main:#e5edf8; --text-muted:#91a0b6; }
            html[data-panel-theme="dark"] body, html[data-panel-theme="dark"] main, html[data-panel-theme="dark"] #app { background:#030712 !important; color:#e5edf8 !important; }
            html[data-panel-theme="dark"] aside, html[data-panel-theme="dark"] header, html[data-panel-theme="dark"] footer, html[data-panel-theme="dark"] .bg-slate-900, html[data-panel-theme="dark"] .post, html[data-panel-theme="dark"] .dialog, html[data-panel-theme="dark"] .panel, html[data-panel-theme="dark"] .card { background-color:#080f1d !important; }
            html[data-panel-theme="dark"] .bg-slate-950, html[data-panel-theme="dark"] input, html[data-panel-theme="dark"] textarea, html[data-panel-theme="dark"] select, html[data-panel-theme="dark"] .poll-option, html[data-panel-theme="dark"] .tab, html[data-panel-theme="dark"] .reaction { background-color:#030712 !important; color:#e5edf8 !important; }
            html[data-panel-theme="dark"] .bg-slate-800 { background-color:#111c2e !important; }
            html[data-panel-theme="dark"] .border-slate-800, html[data-panel-theme="dark"] .border-slate-700, html[data-panel-theme="dark"] .post, html[data-panel-theme="dark"] .dialog { border-color:#223047 !important; }

            html[data-panel-theme="light"] { color-scheme:light; --bg-main:#e7edf4; --bg-panel:#f3f6fa; --bg-panel-hover:#dce5ef; --card:#f3f6fa; --border:#b8c5d4; --text-main:#172033; --text-muted:#5e6d82; }
            html[data-panel-theme="light"] body, html[data-panel-theme="light"] main, html[data-panel-theme="light"] #app { background:#e7edf4 !important; color:#172033 !important; }
            html[data-panel-theme="light"] aside, html[data-panel-theme="light"] header, html[data-panel-theme="light"] footer, html[data-panel-theme="light"] .bg-slate-900, html[data-panel-theme="light"] .post, html[data-panel-theme="light"] .dialog, html[data-panel-theme="light"] .panel, html[data-panel-theme="light"] .card { background-color:#f3f6fa !important; color:#172033 !important; }
            html[data-panel-theme="light"] .bg-slate-950, html[data-panel-theme="light"] input, html[data-panel-theme="light"] textarea, html[data-panel-theme="light"] select, html[data-panel-theme="light"] .poll-option, html[data-panel-theme="light"] .tab, html[data-panel-theme="light"] .reaction, html[data-panel-theme="light"] .audience { background-color:#e4eaf1 !important; color:#172033 !important; }
            html[data-panel-theme="light"] .bg-slate-800, html[data-panel-theme="light"] .badge { background-color:#d8e1eb !important; color:#263449 !important; }
            html[data-panel-theme="light"] .text-slate-100, html[data-panel-theme="light"] .text-slate-200, html[data-panel-theme="light"] .text-slate-300, html[data-panel-theme="light"] .post-body, html[data-panel-theme="light"] h1, html[data-panel-theme="light"] h2, html[data-panel-theme="light"] h3 { color:#172033 !important; }
            html[data-panel-theme="light"] .text-slate-400, html[data-panel-theme="light"] .text-slate-500, html[data-panel-theme="light"] .muted, html[data-panel-theme="light"] .meta { color:#5e6d82 !important; }
            html[data-panel-theme="light"] .border-slate-800, html[data-panel-theme="light"] .border-slate-700, html[data-panel-theme="light"] .post, html[data-panel-theme="light"] .dialog, html[data-panel-theme="light"] input, html[data-panel-theme="light"] textarea, html[data-panel-theme="light"] select { border-color:#b8c5d4 !important; }
            html[data-panel-theme="light"] .nav-link:hover { background:#dce5ef !important; }
            .panel-sidebar-toggle { position:absolute; top:18px; right:-14px; z-index:70; width:28px; height:28px; display:flex; align-items:center; justify-content:center; border:1px solid #334155; border-radius:999px; background:#0f172a; color:#cbd5e1; cursor:pointer; box-shadow:0 6px 18px rgba(0,0,0,.3); }
            .panel-sidebar-toggle:hover { background:#1e293b; color:#fff; }
            #panel-mobile-backdrop { display:none; position:fixed; inset:0; z-index:4000; background:rgba(2,6,23,.78); backdrop-filter:blur(3px); }
            #panel-mobile-menu { position:fixed; inset:0 auto 0 0; z-index:4001; width:min(288px,86vw); background:#0f172a; border-right:1px solid #1e293b; transform:translateX(-102%); transition:transform .2s ease; box-shadow:16px 0 40px rgba(0,0,0,.45); overflow:auto; }
            #panel-mobile-menu.is-open { transform:translateX(0); }
            #panel-mobile-menu .panel-mobile-top { height:64px; padding:0 18px; border-bottom:1px solid #1e293b; display:flex; align-items:center; justify-content:space-between; }
            #panel-mobile-menu .panel-mobile-nav { padding:16px; }
            .panel-mobile-toggle { display:none; position:relative; z-index:40; width:40px; height:40px; flex:none; align-items:center; justify-content:center; border:1px solid #334155; border-radius:12px; background:#020617; color:#e2e8f0; font-size:18px; cursor:pointer; }
            .panel-action-bar { display:flex; align-items:center; justify-content:flex-end; gap:12px; flex-wrap:wrap; padding:12px max(16px, calc((100vw - 1280px) / 2)); border-bottom:1px solid #1e293b; background:rgba(15,23,42,.72); }
            .panel-action-bar > div { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
            .panel-bottom-save-bar { position:sticky; bottom:0; z-index:30; display:flex; justify-content:flex-end; padding:14px 16px; border-top:1px solid #1e293b; background:rgba(15,23,42,.96); backdrop-filter:blur(10px); }
            #panel-save-reminder { position:fixed; right:16px; bottom:94px; z-index:100; max-width:min(360px, calc(100vw - 32px)); padding:12px 14px; border:1px solid rgba(251,191,36,.4); border-radius:14px; background:#3b2f09; color:#fef3c7; font-size:12px; box-shadow:0 14px 35px rgba(0,0,0,.35); }
            @media (max-width:767px) {
                .panel-responsive-sidebar { display:none !important; }
                .panel-sidebar-toggle { display:none !important; }
                .panel-mobile-toggle { display:flex; }
                .panel-header-tools { position:static; transform:none; order:20; width:100%; }
                #app { grid-template-columns:1fr !important; grid-template-rows:64px 1fr !important; }
                #app > header, #app > #map-container-wrapper { grid-column:1 !important; }
                .panel-action-bar { justify-content:stretch; padding:12px 16px; }
                .panel-action-bar > div, .panel-action-bar button { width:100%; }
            }
            @media (min-width:768px) and (max-width:1100px) { .panel-header-tools { width:min(460px,42vw); } }
        `;
        document.head.appendChild(style);
    }

    function setup() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        setupAssistantWidget(currentPage);
        const navigation = document.getElementById('sidebar-nav') || document.querySelector('aside nav');
        const sidebar = navigation?.closest('aside');
        if (!navigation || !sidebar) return;

        ensureCommunityLink(navigation, currentPage);
        normalizeNavigation(navigation, currentPage);
        if (typeof applyRoleBasedVisibility === 'function' && typeof getRole === 'function') {
            applyRoleBasedVisibility(getRole());
        }
        ensureSidebarLogout(sidebar);
        ensureThemeToggle(sidebar);

        addStyles();
        navigation.querySelectorAll('a[href="asistent.html"]').forEach((link) => link.remove());
        sidebar.classList.add('panel-responsive-sidebar');
        relocateHeaderActions();
        setupAdminSaveArea();
        const main = document.querySelector('main');
        if (main) main.style.minHeight = '100vh';
        const originalMainMargin = main?.style.marginLeft || '';
        const originalSidebarWidth = sidebar.style.width || '';

        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'panel-sidebar-toggle';
        toggle.setAttribute('aria-label', 'Micșorează meniul');
        sidebar.appendChild(toggle);

        const applyCollapsedState = (collapsed) => {
            sidebar.style.width = collapsed ? '5.25rem' : originalSidebarWidth;
            if (main?.classList.contains('ml-72')) main.style.marginLeft = collapsed ? '5.25rem' : originalMainMargin;
            const mapApp = document.getElementById('app');
            if (mapApp && document.getElementById('map-container-wrapper')) {
                mapApp.style.gridTemplateColumns = collapsed ? '5.25rem 1fr' : '288px 1fr';
            }

            navigation.querySelectorAll('a').forEach((link) => {
                const label = link.querySelector('span:nth-child(2)');
                if (label) label.classList.toggle('hidden', collapsed);
                link.classList.toggle('justify-center', collapsed);
                link.classList.toggle('px-3', collapsed);
                link.classList.toggle('space-x-3', !collapsed);
                link.title = collapsed ? (label?.textContent || '').trim() : '';
            });
            const title = sidebar.querySelector('h1');
            if (title) title.classList.toggle('hidden', collapsed);
            sidebar.querySelectorAll('#user-display-name, #user-role').forEach((element) => element.classList.toggle('hidden', collapsed));
            toggle.textContent = collapsed ? '›' : '‹';
            toggle.setAttribute('aria-label', collapsed ? 'Extinde meniul' : 'Micșorează meniul');
        };

        const savedState = localStorage.getItem(COLLAPSE_KEY) === 'true';
        applyCollapsedState(savedState);
        toggle.addEventListener('click', () => {
            const nextState = !sidebar.querySelector('.nav-link span:nth-child(2)')?.classList.contains('hidden');
            localStorage.setItem(COLLAPSE_KEY, String(nextState));
            applyCollapsedState(nextState);
        });

        // Dashboard are deja propriul meniu mobil, păstrat pentru compatibilitate.
        if (document.getElementById('mobile-menu')) return;

        const backdrop = document.createElement('div');
        backdrop.id = 'panel-mobile-backdrop';
        const mobileMenu = document.createElement('aside');
        mobileMenu.id = 'panel-mobile-menu';
        mobileMenu.innerHTML = `<div class="panel-mobile-top"><div><strong class="text-slate-100">Panel</strong><p class="text-[10px] text-slate-400">Meniu navigare</p></div><button type="button" class="w-9 h-9 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-lg" aria-label="Închide meniul">×</button></div><nav class="panel-mobile-nav space-y-1.5"></nav>`;
        document.body.append(backdrop, mobileMenu);

        const mobileNav = mobileMenu.querySelector('.panel-mobile-nav');
        mobileNav.innerHTML = navigation.innerHTML;
        if (typeof applyRoleBasedVisibility === 'function' && typeof getRole === 'function') applyRoleBasedVisibility(getRole());

        const closeMobileMenu = () => {
            mobileMenu.classList.remove('is-open');
            backdrop.style.display = 'none';
        };
        const openMobileMenu = () => {
            document.dispatchEvent(new CustomEvent('panel:mobile-menu-open'));
            mobileMenu.classList.add('is-open');
            backdrop.style.display = 'block';
        };
        mobileMenu.querySelector('button').addEventListener('click', closeMobileMenu);
        backdrop.addEventListener('click', closeMobileMenu);
        mobileNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMobileMenu));

        const header = document.querySelector('header');
        if (header) {
            const mobileToggle = document.createElement('button');
            mobileToggle.type = 'button';
            mobileToggle.className = 'panel-mobile-toggle';
            mobileToggle.textContent = '☰';
            mobileToggle.setAttribute('aria-label', 'Deschide meniul');
            mobileToggle.addEventListener('click', openMobileMenu);
            header.insertBefore(mobileToggle, header.firstChild);
        }
    }

    function loadAssistantScript(id, source, ready) {
        if (ready()) return Promise.resolve();
        const existing = document.getElementById(id);
        if (existing) {
            return new Promise((resolve, reject) => {
                existing.addEventListener('load', resolve, { once: true });
                existing.addEventListener('error', reject, { once: true });
            });
        }
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.id = id;
            script.src = source;
            script.onload = resolve;
            script.onerror = () => {
                script.remove();
                reject(new Error(`Nu s-a putut încărca ${source}`));
            };
            document.head.appendChild(script);
        });
    }

    function ensureCommunityLink(navigation, currentPage) {
        if (navigation.querySelector('a[href="anunturi.html"]')) return;
        const link = document.createElement('a');
        link.href = 'anunturi.html';
        link.dataset.role = '1';
        link.className = 'nav-link flex items-center space-x-3 px-4 py-3 rounded-xl transition text-sm';
        link.classList.add(...(currentPage === 'anunturi.html'
            ? ['bg-emerald-500/10', 'text-emerald-400', 'font-medium']
            : ['text-slate-300', 'hover:bg-slate-800']));
        link.innerHTML = '<span>📣</span><span>Anunțuri & Sondaje</span>';
        const marketplace = navigation.querySelector('a[href="marketplace.html"]');
        navigation.insertBefore(link, marketplace || null);
    }

    function normalizeNavigation(navigation, currentPage) {
        const links = [
            ['index.html', 1, '📊', 'Dashboard'],
            ['anunturi.html', 1, '📣', 'Anunțuri & Sondaje'],
            ['pontaj.html', 1, '⏱️', 'Pontaj'],
            ['cereri.html', 1, '📋', 'Cereri / Absențe'],
            ['contracte.html', 4, '📜', 'Contracte'],
            ['calculatorilegal.html', 3, '🧮', 'Calculator Ilegal'],
            ['craftmecanics.html', 1, '🔨', 'Craft Mecanics'],
            ['locatiiilegale.html', 3, '🗺️', 'Locații Ilegale'],
            ['marketplace.html', 1, '🛒', 'Marketplace'],
            ['marketplace-ilegal.html', 3, '🚨', 'Black Market'],
            ['rapoarte.html', 4, '📈', 'Rapoarte'],
            ['logs.html', 7, '🧾', 'Loguri'],
            ['admin.html', 7, '👑', 'Panou Admin']
        ];

        navigation.innerHTML = links.map(([href, role, icon, label]) => {
            const active = currentPage === href;
            const stateClasses = active
                ? 'bg-emerald-500/10 text-emerald-400 font-medium'
                : 'text-slate-300 hover:bg-slate-800';
            return `<a href="${href}" data-role="${role}" class="nav-link flex items-center space-x-3 px-4 py-3 rounded-xl transition text-sm ${stateClasses}"><span>${icon}</span><span>${label}</span></a>`;
        }).join('');

        const existingMobileNavigation = document.querySelector('#mobile-menu nav');
        if (existingMobileNavigation) existingMobileNavigation.innerHTML = navigation.innerHTML;
    }

    function ensureSidebarLogout(sidebar) {
        const existingLogout = [...sidebar.querySelectorAll('button')].find((button) => {
            const action = `${button.id} ${button.getAttribute('onclick') || ''} ${button.textContent || ''}`.toLocaleLowerCase('ro-RO');
            return action.includes('logout') || action.includes('ieșire') || action.includes('iesire');
        });
        if (existingLogout) {
            const label = existingLogout.querySelector('span:last-child');
            if (label) label.textContent = 'Logout';
            else existingLogout.textContent = 'Logout';
            return;
        }

        const avatar = sidebar.querySelector('#user-avatar');
        if (!avatar) return;
        let footer = avatar.parentElement;
        while (footer?.parentElement && footer.parentElement !== sidebar) footer = footer.parentElement;
        if (!footer) return;

        footer.classList.add('flex', 'items-center', 'justify-between', 'gap-3');
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = 'Logout';
        button.className = 'flex-shrink-0 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl transition cursor-pointer text-xs font-medium';
        button.addEventListener('click', () => {
            if (typeof logout === 'function') logout();
            else if (typeof handleLogout === 'function') handleLogout();
            else {
                localStorage.clear();
                location.href = 'login.html';
            }
        });
        footer.appendChild(button);
    }

    function ensureThemeToggle(sidebar) {
        const avatar = sidebar.querySelector('#user-avatar');
        if (!avatar) return;
        let footer = avatar.parentElement;
        while (footer?.parentElement && footer.parentElement !== sidebar) footer = footer.parentElement;
        if (!footer) return;

        const modes = ['panel', 'dark', 'light'];
        const icons = { panel: '🎨', dark: '🌙', light: '☀️' };
        const labels = { panel: 'Tema Panel (originală)', dark: 'Tema Dark', light: 'Tema Light confortabilă' };
        const apply = (mode) => {
            document.documentElement.dataset.panelTheme = mode;
            // Unele pagini vechi își citesc culorile din data-theme; Panel folosește paleta lor originală întunecată.
            document.documentElement.dataset.theme = mode === 'light' ? 'light' : 'dark';
            document.documentElement.classList.toggle('dark', mode !== 'light');
            const button = document.getElementById('panel-theme-toggle');
            if (button) {
                button.textContent = icons[mode];
                button.title = labels[mode];
                button.setAttribute('aria-label', `${labels[mode]}. Apasă pentru tema următoare.`);
            }
        };

        let mode = localStorage.getItem('panel_theme') || 'panel';
        if (mode === 'system' || !modes.includes(mode)) mode = 'panel';
        const legacyButton = document.getElementById('theme-toggle-btn');
        const button = legacyButton || document.createElement('button');
        if (legacyButton) legacyButton.removeAttribute('onclick');
        button.id = 'panel-theme-toggle';
        button.type = 'button';
        button.setAttribute('aria-label', 'Schimbă tema');
        button.addEventListener('click', () => {
            mode = modes[(modes.indexOf(mode) + 1) % modes.length];
            localStorage.setItem('panel_theme', mode);
            apply(mode);
        });
        if (!legacyButton) {
            const logoutButton = [...footer.querySelectorAll('button')].find((item) => item !== button && /logout|ieșire|iesire/i.test(item.textContent || ''));
            let reference = logoutButton || null;
            while (reference?.parentElement && reference.parentElement !== footer) reference = reference.parentElement;
            footer.insertBefore(button, reference);
        }
        apply(mode);
    }

    async function setupAssistantWidget(currentPage) {
        const allowedPages = new Set([
            'index.html', 'pontaj.html', 'cereri.html', 'rapoarte.html', 'contracte.html', 'admin.html',
            'calculatorilegal.html', 'craftmecanics.html', 'locatiiilegale.html', 'marketplace.html',
            'marketplace-ilegal.html', 'logs.html'
        ]);
        if (!allowedPages.has(currentPage) || document.getElementById('panel-assistant-widget')) return;
        try {
            if (typeof isLogged !== 'function' || !isLogged()) return;
            await loadAssistantScript('panel-assistant-data-script', 'js/asistent-data.js', () => Array.isArray(window.PANEL_ASSISTANT_KNOWLEDGE));
            await loadAssistantScript('panel-assistant-core-script', 'js/asistent-core.js', () => Boolean(window.PanelAssistantCore));
            await loadAssistantScript('panel-assistant-widget-script', 'js/asistent-widget.js', () => Boolean(window.__panelAssistantWidgetLoaded));
        } catch (error) {
            console.warn('Asistentul plutitor nu a putut fi inițializat.', error);
        }
    }

    function relocateHeaderActions() {
        const header = document.querySelector('header');
        const themeButton = document.getElementById('panel-theme-toggle');
        if (!header || !themeButton || document.querySelector('.panel-header-tools')) return;

        const tools = document.createElement('div');
        tools.className = 'panel-header-tools';
        const search = document.getElementById('global-search')
            || header.querySelector('.search-container input, input[type="search"], input[placeholder*="Caută"], input[placeholder*="caută"]');
        if (search) {
            const originalWrapper = search.closest('.search-container, .relative') || search.parentElement;
            if (originalWrapper) {
                const searchHost = document.createElement('div');
                searchHost.className = 'panel-search-host';
                searchHost.appendChild(originalWrapper);
                tools.appendChild(searchHost);
            }
        }
        tools.appendChild(themeButton);
        header.appendChild(tools);
    }

    function setupAdminSaveArea() {
        const saveButton = document.querySelector('button[onclick="saveAllAdminSettings()"]');
        const main = document.querySelector('main');
        if (!saveButton || !main || document.getElementById('panel-admin-save-area')) return;

        const saveArea = document.createElement('div');
        saveArea.id = 'panel-admin-save-area';
        saveArea.className = 'panel-bottom-save-bar';
        main.appendChild(saveArea);
        saveArea.appendChild(saveButton);
        document.getElementById('panel-page-actions')?.remove();

        let dirty = false;
        const showReminder = () => {
            if (dirty) return;
            dirty = true;
            const reminder = document.createElement('div');
            reminder.id = 'panel-save-reminder';
            reminder.textContent = 'Ai modificări nesalvate. Apasă „Salvează Toate Setările” din partea de jos a paginii.';
            document.body.appendChild(reminder);
        };
        const clearReminder = () => {
            dirty = false;
            document.getElementById('panel-save-reminder')?.remove();
        };

        main.addEventListener('change', (event) => {
            const element = event.target;
            if (!(element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement)) return;
            if (element.id.startsWith('search-') || element.id.startsWith('filter-') || element.id.startsWith('role-select-')) return;
            showReminder();
        });

        const originalSave = window.saveAllAdminSettings;
        if (typeof originalSave === 'function') {
            window.saveAllAdminSettings = async (...args) => {
                const result = await originalSave(...args);
                clearReminder();
                return result;
            };
        }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup);
    else setup();
})();
