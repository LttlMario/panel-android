// Navigare comună pentru panel: meniu mobil și sidebar pliabil pe desktop.
(() => {
    const COLLAPSE_KEY = 'panel_sidebar_collapsed';

    const CANONICAL_NAV_ITEMS = [
        { href: 'cereri.html', role: 1, icon: '📋', label: 'Cereri / Absențe' },
        { href: 'calculatorilegal.html', role: 3, icon: '🧮', label: 'Calculator Ilegal' },
        { href: 'craftmecanics.html', role: 1, icon: '🔨', label: 'Craft Mecanics' },
        { href: 'locatiiilegale.html', role: 3, icon: '🗺️', label: 'Locații Ilegale' },
        { href: 'marketplace.html', role: 1, icon: '🛒', label: 'Marketplace' },
        { href: 'marketplace-ilegal.html', role: 3, icon: '🚨', label: 'Black Market' },
        { href: 'logs.html', role: 5, icon: '🧾', label: 'Loguri', adminOnly: true }
    ];

    function normalizeHref(href) {
        try {
            return new URL(href, window.location.href).pathname.split('/').pop().toLowerCase();
        } catch (_) {
            return String(href || '').split('?')[0].split('#')[0].split('/').pop().toLowerCase();
        }
    }

    function ensureCanonicalNavigation(navigation) {
        if (!navigation) return;
        const role = typeof getRole === 'function' ? getRole() : 0;
        const currentPage = normalizeHref(window.location.pathname) || 'index.html';

        CANONICAL_NAV_ITEMS.forEach((item) => {
            let link = [...navigation.querySelectorAll('a[href]')].find((candidate) =>
                normalizeHref(candidate.getAttribute('href')) === normalizeHref(item.href)
            );

            if (!link) {
                link = document.createElement('a');
                link.href = item.href;
                link.setAttribute('data-role', String(item.role));
                link.className = 'nav-link flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 transition text-sm';
                link.innerHTML = `<span>${item.icon}</span><span>${item.label}</span>`;
                navigation.appendChild(link);
            }

            link.setAttribute('data-role', String(item.role));
            if (item.adminOnly) link.setAttribute('data-admin-only', 'true');
            link.style.display = role >= item.role ? '' : 'none';

            if (currentPage === normalizeHref(item.href)) {
                link.classList.add('bg-slate-800', 'text-emerald-400');
                link.setAttribute('aria-current', 'page');
            }
        });

        navigation.querySelectorAll('a[href="logs.html"], a[href*="/logs.html"]').forEach((link) => {
            link.setAttribute('data-role', '5');
            link.setAttribute('data-admin-only', 'true');
            link.style.display = role >= 5 ? '' : 'none';
        });
    }

    function addStyles() {
        if (document.getElementById('panel-layout-styles')) return;
        const style = document.createElement('style');
        style.id = 'panel-layout-styles';
        style.textContent = `
            .panel-responsive-sidebar { transition: width .2s ease; position: relative; }
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
            .panel-dashboard-search-bar { display:flex; justify-content:center; padding:16px; border-bottom:1px solid #1e293b; background:rgba(15,23,42,.45); }
            .panel-dashboard-search-bar > div { width:min(100%, 620px); }
            .panel-bottom-save-bar { position:sticky; bottom:0; z-index:30; display:flex; justify-content:flex-end; padding:14px 16px; border-top:1px solid #1e293b; background:rgba(15,23,42,.96); backdrop-filter:blur(10px); }
            #panel-save-reminder { position:fixed; right:16px; bottom:94px; z-index:100; max-width:min(360px, calc(100vw - 32px)); padding:12px 14px; border:1px solid rgba(251,191,36,.4); border-radius:14px; background:#3b2f09; color:#fef3c7; font-size:12px; box-shadow:0 14px 35px rgba(0,0,0,.35); }
            @media (max-width:767px) {
                .panel-responsive-sidebar { display:none !important; }
                .panel-sidebar-toggle { display:none !important; }
                .panel-mobile-toggle { display:flex; }
                #app { grid-template-columns:1fr !important; grid-template-rows:64px 1fr !important; }
                #app > header, #app > #map-container-wrapper { grid-column:1 !important; }
                .panel-action-bar { justify-content:stretch; padding:12px 16px; }
                .panel-action-bar > div, .panel-action-bar button { width:100%; }
            }
        `;
        document.head.appendChild(style);
    }

    function setup() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        setupAssistantWidget(currentPage);
        const navigation = document.getElementById('sidebar-nav') || document.querySelector('aside nav');
        const sidebar = navigation?.closest('aside');
        if (!navigation || !sidebar) return;

        ensureCanonicalNavigation(navigation);
        addStyles();
        navigation.querySelectorAll('a[href="asistent.html"]').forEach((link) => link.remove());
        sidebar.classList.add('panel-responsive-sidebar');
        // Pagina cu harta folosește o grilă proprie; mutarea headerului ar rupe poziționarea hărții.
        if (!document.getElementById('map-container-wrapper')) relocateHeaderActions();
        setupAdminSaveArea();
        const main = document.querySelector('main');
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
        ensureCanonicalNavigation(navigation);
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
        if (!header || document.getElementById('panel-page-actions')) return;

        const search = document.getElementById('global-search');
        if (search) {
            const searchWrapper = search.closest('.relative');
            if (searchWrapper) {
                const searchBar = document.createElement('div');
                searchBar.className = 'panel-dashboard-search-bar';
                header.insertAdjacentElement('afterend', searchBar);
                searchBar.appendChild(searchWrapper);
            }
            return;
        }

        const actionButtons = [...header.querySelectorAll('button:not(.panel-mobile-toggle)')];
        if (!actionButtons.length) return;

        const actionBar = document.createElement('div');
        actionBar.id = 'panel-page-actions';
        actionBar.className = 'panel-action-bar';
        header.insertAdjacentElement('afterend', actionBar);

        const movedContainers = new Set();
        actionButtons.forEach((button) => {
            const container = button.parentElement;
            const directContainer = container?.parentElement === header && container.tagName === 'DIV';
            const target = directContainer ? container : button;
            if (!movedContainers.has(target)) {
                movedContainers.add(target);
                actionBar.appendChild(target);
            }
        });
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
