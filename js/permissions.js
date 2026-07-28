// Permisiuni comune pentru toate paginile panelului.
const Roles = Object.freeze({
    EL_MECANICO: 1,
    MECANIC: 1,
    SEF_MECANIC: 2,
    LA_FAMILIA: 3,
    MANAGER: 4,
    COORDONATOR: 5,
    COLIDER: 5,
    LIDER: 5,
    ADMIN: 5
});

const PagePermissions = Object.freeze({
    'index.html': 1,
    'asistent.html': 1,
    'pontaj.html': 1,
    'cereri.html': 1,
    'rapoarte.html': 4,
    'logs.html': 5,
    'contracte.html': 4,
    'admin.html': 5,
    'developer.html': 5,
    'calculatorilegal.html': 3,
    'craftmecanics.html': 1,
    'locatiiilegale.html': 3,
    'marketplace.html': 1,
    'marketplace-ilegal.html': 3,
    'edit.html': 5
});

const STORAGE_KEYS = Object.freeze([
    'discord_user',
    'workforce_user',
    'panel_user',
    'currentUser'
]);

function parseStoredUser(raw) {
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (_) {
        return null;
    }
}

function getUser() {
    for (const key of STORAGE_KEYS) {
        const user = parseStoredUser(localStorage.getItem(key));
        if (user) return user;
    }
    return null;
}

function isLogged() {
    return getUser() !== null;
}

function normalizeRoleValue(value) {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return Math.max(0, Math.min(5, Math.trunc(value)));
    }

    const text = String(value ?? '').trim().toLocaleLowerCase('ro-RO');
    if (!text) return 0;

    // Important: Supabase/localStorage poate întoarce nivelul numeric ca text: "5".
    if (/^\d+$/.test(text)) {
        return Math.max(0, Math.min(5, Number.parseInt(text, 10)));
    }

    if (
        text.includes('administrator') ||
        text.includes('admin') ||
        text.includes('owner') ||
        text.includes('lider') ||
        text.includes('co-lider') ||
        text.includes('colider') ||
        text.includes('coordonator')
    ) return Roles.ADMIN;

    if (text.includes('manager')) return Roles.MANAGER;
    if (text.includes('familia')) return Roles.LA_FAMILIA;
    if (text.includes('sef') || text.includes('șef')) return Roles.SEF_MECANIC;
    if (text.includes('mecanic')) return Roles.MECANIC;

    return 0;
}

function getRoleFromUser(user) {
    if (!user || typeof user !== 'object') return 0;

    const candidates = [
        user.role_level,
        user.roleLevel,
        user.level,
        user.access_level,
        user.accessLevel,
        user.role,
        user.default_role
    ];

    for (const candidate of candidates) {
        const normalized = normalizeRoleValue(candidate);
        if (normalized > 0) return normalized;
    }

    return 0;
}

function getRole() {
    return getRoleFromUser(getUser());
}

function hasRole(requiredRole) {
    return getRole() >= Number(requiredRole || 0);
}

function logout() {
    STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    window.location.href = 'login.html';
}

function applyRoleBasedVisibility(userRole = getRole()) {
    document.querySelectorAll('[data-role]').forEach((element) => {
        const requiredRole = Number.parseInt(element.getAttribute('data-role'), 10);
        if (!Number.isNaN(requiredRole)) {
            element.hidden = userRole < requiredRole;
            element.style.display = userRole < requiredRole ? 'none' : '';
        }
    });
}

(function initSecurityMiddleware() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    if (['login.html', '403.html', 'thank-you.html', 'changelog.html'].includes(currentPage)) return;

    if (!isLogged()) {
        window.location.replace('login.html');
        return;
    }

    const requiredRole = PagePermissions[currentPage];
    if (requiredRole !== undefined && getRole() < requiredRole) {
        window.location.replace('403.html');
        return;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => applyRoleBasedVisibility(getRole()), { once: true });
    } else {
        applyRoleBasedVisibility(getRole());
    }
})();
