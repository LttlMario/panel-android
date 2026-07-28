// Navigare comună pentru panel: meniu mobil și sidebar pliabil pe desktop.
(() => {
    const COLLAPSE_KEY = 'panel_sidebar_collapsed';

    function addStyles() {
        if (document.getElementById('panel-layout-styles')) return;
        const style = document.createElement('style');
        style.id = 'panel-layout-styles';
        style.textContent = `
            .panel-responsive-sidebar { transition: width .2s ease; position: relative; }
            .panel-sidebar-toggle { position:absolute; top:18px; right:-14px; z-index:70; width:28px; height:28px; display:flex; align-items:center; justify-content:center; border:1px solid #334155; border-radius:999px; background:#0f172a; color:#cbd5e1; cursor:pointer; box-shadow:0 6px 18px rgba(0,0,0,.3); }
            .panel-sidebar-toggle:hover { background:#1e293b; color:#fff; }
            #panel-mobile-backdrop { display:none; position:fixed; inset:0; z-index:80; background:rgba(2,6,23,.78); backdrop-filter:blur(3px); }
            #panel-mobile-menu { position:fixed; inset:0 auto 0 0; z-index:81; width:min(288px,86vw); background:#0f172a; border-right:1px solid #1e293b; transform:translateX(-102%); transition:transform .2s ease; box-shadow:16px 0 40px rgba(0,0,0,.45); overflow:auto; }
            #panel-mobile-menu.is-open { transform:translateX(0); }
            #panel-mobile-menu .panel-mobile-top { height:64px; padding:0 18px; border-bottom:1px solid #1e293b; display:flex; align-items:center; justify-content:space-between; }
            #panel-mobile-menu .panel-mobile-nav { padding:16px; }
            .panel-mobile-toggle { display:none; width:40px; height:40px; flex:none; align-items:center; justify-content:center; border:1px solid #334155; border-radius:12px; background:#020617; color:#e2e8f0; font-size:18px; cursor:pointer; }
            @media (max-width:767px) {
                .panel-responsive-sidebar { display:none !important; }
                .panel-sidebar-toggle { display:none !important; }
                .panel-mobile-toggle { display:flex; }
                #app { grid-template-columns:1fr !important; grid-template-rows:64px 1fr !important; }
                #app > header, #app > #map-container-wrapper { grid-column:1 !important; }
            }
        `;
        document.head.appendChild(style);
    }

    function setup() {
        const navigation = document.getElementById('sidebar-nav') || document.querySelector('aside nav');
        const sidebar = navigation?.closest('aside');
        if (!navigation || !sidebar) return;

        addStyles();
        sidebar.classList.add('panel-responsive-sidebar');
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

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup);
    else setup();
})();
