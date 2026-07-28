// Permisiuni comune pentru toate paginile panelului.
const Roles = {
    EL_MECANICO: 1,
    MECANIC: 1,
    SEF_MECANIC: 2,
    LA_FAMILIA: 3,
    COORDONATOR: 5,
    MANAGER: 4,
    COLIDER: 5,
    LIDER: 5,
    ADMIN: 5
};

const PagePermissions = {
    'index.html': 1,
    'pontaj.html': 1,
    'cereri.html': 1,
    'rapoarte.html': 4,
    'logs.html': 5,
    'contracte.html': 4,
    'admin.html': 5,
    'calculatorilegal.html': 3,
    'craftmecanics.html': 1,
    'locatiiilegale.html': 3,
    'marketplace.html': 1,
    'marketplace-ilegal.html': 3,
    'edit.html': 5
};

const STORAGE_KEY = 'discord_user';

function isLogged() {
    return getUser() !== null;
}

function getUser() {
    try {
        const userData = localStorage.getItem(STORAGE_KEY);
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Eroare la citirea utilizatorului:', error);
        return null;
    }
}

function getRole() {
    const user = getUser();
    if (!user) return 0;

    const roleValue = user.role || user.default_role;
    if (typeof roleValue === 'number') return roleValue;
    if (typeof roleValue !== 'string') return 0;

    const role = roleValue.toLocaleLowerCase('ro-RO');
    if (role.includes('lider') || role.includes('admin') || role.includes('owner')) return Roles.ADMIN;
    if (role.includes('coordonator') || role.includes('manager')) return Roles.MANAGER;
    if (role.includes('familia')) return Roles.LA_FAMILIA;
    if (role.includes('sef') || role.includes('șef')) return Roles.SEF_MECANIC;
    return Roles.MECANIC;
}

function hasRole(requiredRole) {
    return getRole() >= requiredRole;
}

function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}

(function initSecurityMiddleware() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    if (['login.html', '403.html'].includes(currentPage)) return;

    if (!isLogged()) {
        window.location.href = 'login.html';
        return;
    }

    const requiredRole = PagePermissions[currentPage];
    if (requiredRole !== undefined && getRole() < requiredRole) {
        window.location.href = '403.html';
        return;
    }

    document.addEventListener('DOMContentLoaded', () => applyRoleBasedVisibility(getRole()));
})();

function applyRoleBasedVisibility(userRole) {
    document.querySelectorAll('[data-role]').forEach((element) => {
        const requiredRole = Number.parseInt(element.getAttribute('data-role'), 10);
        if (!Number.isNaN(requiredRole)) {
            element.style.display = userRole < requiredRole ? 'none' : '';
        }
    });
}
