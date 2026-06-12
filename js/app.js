// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
// PROJECT ZOMBOID Ã¢â‚¬â€ PAINEL DE ROLEPLAY
// Main Application Logic
// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â

(() => {
    'use strict';

    // Ã¢â€â‚¬Ã¢â€â‚¬ State Ã¢â€â‚¬Ã¢â€â‚¬
    const STATE_KEY = 'pz_roleplay_state';
    let state = loadState();
    let currentUser = null;
    let pzMap = null;
    let questMarkers = {};
    let mapClickMode = false;

    function getDefaultState() {
        return {
            users: [],         // { username, passwordHash, role }
            characters: [],    // { id, name, age, alignment, positiveTraits, negativeTraits, alive, ownerId }
            quests: [],        // { id, name, description, difficulty, reward, location, lat, lng, status, assignedTo, completedBy }
            players: [],       // { name }
            sorteio: {},       // { playerName: characterId }
            playerCount: 4
        };
    }

    function loadState() {
        try {
            const saved = localStorage.getItem(STATE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                return { ...getDefaultState(), ...parsed };
            }
        } catch (e) {
            console.error('Error loading state:', e);
        }
        return getDefaultState();
    }

    function saveState() {
        localStorage.setItem(STATE_KEY, JSON.stringify(state));
    }

    // Ã¢â€â‚¬Ã¢â€â‚¬ Simple password hashing (NOT secure Ã¢â‚¬â€ for local/offline use only) Ã¢â€â‚¬Ã¢â€â‚¬
    function hashPassword(pw) {
        let hash = 0;
        for (let i = 0; i < pw.length; i++) {
            const ch = pw.charCodeAt(i);
            hash = ((hash << 5) - hash) + ch;
            hash |= 0;
        }
        return 'h_' + Math.abs(hash).toString(36);
    }

    // ── Toast ──
    function showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icons = { success: '\u2705', error: '\u274C', info: '\u2139\uFE0F' };
        toast.innerHTML = `<span>${icons[type] || ''}</span> ${message}`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Ã¢â€â‚¬Ã¢â€â‚¬ Generate unique ID Ã¢â€â‚¬Ã¢â€â‚¬
    function uid() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
    //  AUTH SYSTEM
    // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â

    function initAuth() {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const tabLogin = document.getElementById('tab-login');
        const tabRegister = document.getElementById('tab-register');

        // Tab switching
        tabLogin.addEventListener('click', () => {
            tabLogin.classList.add('active');
            tabRegister.classList.remove('active');
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
        });

        tabRegister.addEventListener('click', () => {
            tabRegister.classList.add('active');
            tabLogin.classList.remove('active');
            registerForm.style.display = 'block';
            loginForm.style.display = 'none';
        });

        // Login
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username').value.trim();
            const password = document.getElementById('login-password').value;

            if (!username || !password) {
                showToast('Preencha todos os campos', 'error');
                return;
            }

            const user = state.users.find(u => u.username.toLowerCase() === username.toLowerCase());
            if (!user) {
                showToast('Usu\u00e1rio n\u00e3o encontrado', 'error');
                return;
            }

            if (user.passwordHash !== hashPassword(password)) {
                showToast('Senha incorreta', 'error');
                return;
            }

            currentUser = user;
            sessionStorage.setItem('pz_current_user', JSON.stringify(user));
            enterApp();
            showToast('Bem-vindo, ' + user.username + '! \u{1F9DF}');
        });

        // Register
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('reg-username').value.trim();
            const password = document.getElementById('reg-password').value;
            const confirm = document.getElementById('reg-confirm').value;

            if (!username || !password) {
                showToast('Preencha todos os campos', 'error');
                return;
            }

            if (password.length < 4) {
                showToast('Senha deve ter no m\u00ednimo 4 caracteres', 'error');
                return;
            }

            if (password !== confirm) {
                showToast('As senhas n\u00e3o coincidem', 'error');
                return;
            }

            if (state.users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
                showToast('Usu\u00e1rio j\u00e1 existe', 'error');
                return;
            }

            const isFirst = state.users.length === 0;
            const newUser = {
                username,
                passwordHash: hashPassword(password),
                role: isFirst ? 'admin' : 'player'
            };

            state.users.push(newUser);
            saveState();

            currentUser = newUser;
            sessionStorage.setItem('pz_current_user', JSON.stringify(newUser));
            enterApp();
            showToast('Conta criada com sucesso! ' + (isFirst ? '(Admin)' : '') + ' \u{1F3AE}');
        });

        // Logout
        document.getElementById('btn-logout').addEventListener('click', () => {
            currentUser = null;
            sessionStorage.removeItem('pz_current_user');
            document.getElementById('login-screen').style.display = 'flex';
            document.getElementById('app-screen').style.display = 'none';
            showToast('Desconectado', 'info');
        });

        // Check session
        try {
            const saved = sessionStorage.getItem('pz_current_user');
            if (saved) {
                const u = JSON.parse(saved);
                const found = state.users.find(su => su.username === u.username && su.passwordHash === u.passwordHash);
                if (found) {
                    currentUser = found;
                    enterApp();
                    return;
                }
            }
        } catch (e) {}
    }

    function enterApp() {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('app-screen').style.display = 'flex';

        // Update user display
        document.getElementById('display-username').textContent = currentUser.username;
        document.getElementById('display-role').textContent = currentUser.role === 'admin' ? 'Administrador' : 'Jogador';
        document.getElementById('user-avatar').textContent = currentUser.username.charAt(0).toUpperCase();

        initApp();
    }

    // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
    //  NAVIGATION
    // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â

    function initNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        const pages = document.querySelectorAll('.page-section');

        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const page = item.dataset.page;

                navItems.forEach(n => n.classList.remove('active'));
                item.classList.add('active');

                pages.forEach(p => p.classList.remove('active'));
                document.getElementById(`page-${page}`).classList.add('active');

                // Close mobile sidebar
                document.getElementById('sidebar').classList.remove('open');
                document.getElementById('sidebar-overlay').classList.remove('visible');

                // Init map when navigating to it
                if (page === 'map' && !pzMap) {
                    setTimeout(initMap, 100);
                }

                // Refresh data
                if (page === 'dashboard') renderDashboard();
            });
        });

        // Mobile menu toggles
        document.querySelectorAll('.menu-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('sidebar').classList.toggle('open');
                document.getElementById('sidebar-overlay').classList.toggle('visible');
            });
        });

        document.getElementById('sidebar-overlay').addEventListener('click', () => {
            document.getElementById('sidebar').classList.remove('open');
            document.getElementById('sidebar-overlay').classList.remove('visible');
        });
    }

    // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
    //  DASHBOARD
    // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â

    function renderDashboard() {
        // Stats
        const alive = state.characters.filter(c => c.alive).length;
        const dead = state.characters.filter(c => !c.alive).length;
        const activeQuests = state.quests.filter(q => q.status === 'active').length;

        document.getElementById('stat-alive').textContent = alive;
        document.getElementById('stat-dead').textContent = dead;
        document.getElementById('stat-players').textContent = state.players.length;
        document.getElementById('stat-quests').textContent = activeQuests;

        // Characters Grid
        renderCharactersGrid();

        // Player inputs
        renderPlayerInputs();

        // Sorteio
        renderSorteio();
    }

    function renderCharactersGrid() {
        const grid = document.getElementById('characters-grid');
        const empty = document.getElementById('empty-characters');

        if (state.characters.length === 0) {
            grid.innerHTML = '';
            grid.appendChild(empty);
            empty.style.display = 'block';
            return;
        }

        empty.style.display = 'none';
        grid.innerHTML = state.characters.map(char => {
            const alignmentData = ALIGNMENTS.find(a => a.id === char.alignment) || ALIGNMENTS[4];
            const ownerPlayer = Object.entries(state.sorteio).find(([p, cid]) => cid === char.id);
            const ownerName = ownerPlayer ? ownerPlayer[0] : null;

            return `
                <div class="character-card ${char.alive ? '' : 'dead'}" data-id="${char.id}">
                    <div class="char-header">
                        <span class="char-name">${char.alive ? 'Ã¢Å“â€¦' : 'Ã°Å¸â€™â‚¬'} ${char.name}</span>
                        <span class="char-alignment" style="background: ${alignmentData.color}22; color: ${alignmentData.color}; border: 1px solid ${alignmentData.color}44;">
                            ${alignmentData.icon} ${alignmentData.name}
                        </span>
                    </div>
                    ${ownerName ? `<div class="char-owner">Ã°Å¸â€˜Â¤ AtribuÃƒÂ­do a: ${ownerName}</div>` : ''}
                    <div class="char-info">
                        <span>Ã°Å¸Å½â€š ${char.age} anos</span>
                        <span>Ã¢Å“â€¦ ${char.positiveTraits.length} positivos</span>
                        <span>Ã¢ÂÅ’ ${char.negativeTraits.length} negativos</span>
                    </div>
                    <div class="char-traits">
                        ${char.positiveTraits.slice(0, 3).map(t => {
                            const trait = POSITIVE_TRAITS.find(pt => pt.id === t);
                            return trait ? `<span class="trait-tag positive">${trait.name}</span>` : '';
                        }).join('')}
                        ${char.negativeTraits.slice(0, 3).map(t => {
                            const trait = NEGATIVE_TRAITS.find(nt => nt.id === t);
                            return trait ? `<span class="trait-tag negative">${trait.name}</span>` : '';
                        }).join('')}
                        ${(char.positiveTraits.length + char.negativeTraits.length) > 6 ? '<span class="trait-tag" style="color:var(--text-muted)">+mais</span>' : ''}
                    </div>
                    <div class="char-actions">
                        <button class="btn btn-sm ${char.alive ? 'btn-danger' : 'btn-primary'}" onclick="window.toggleCharAlive('${char.id}')">
                            ${char.alive ? 'Ã°Å¸â€™â‚¬ Marcar Morto' : 'Ã¢Å“â€¦ Reviver'}
                        </button>
                        <button class="btn btn-sm btn-ghost" onclick="window.deleteChar('${char.id}')">Ã°Å¸â€”â€˜Ã¯Â¸Â</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    window.toggleCharAlive = function(charId) {
        const char = state.characters.find(c => c.id === charId);
        if (char) {
            char.alive = !char.alive;
            saveState();
            renderDashboard();
            showToast(char.alive ? `${char.name} ressuscitado! Ã¢Å“â€¦` : `${char.name} morreu... Ã°Å¸â€™â‚¬`, char.alive ? 'success' : 'error');
        }
    };

    window.deleteChar = function(charId) {
        if (confirm('Tem certeza que deseja deletar este personagem?')) {
            state.characters = state.characters.filter(c => c.id !== charId);
            // Remove from sorteio
            for (const [player, cid] of Object.entries(state.sorteio)) {
                if (cid === charId) delete state.sorteio[player];
            }
            saveState();
            renderDashboard();
            showToast('Personagem deletado', 'info');
        }
    };

    // Ã¢â€â‚¬Ã¢â€â‚¬ Players Ã¢â€â‚¬Ã¢â€â‚¬
    function renderPlayerInputs() {
        const container = document.getElementById('player-inputs');
        document.getElementById('player-count').value = state.playerCount;

        // Ensure players array matches count
        while (state.players.length < state.playerCount) {
            state.players.push({ name: '' });
        }
        state.players = state.players.slice(0, state.playerCount);

        container.innerHTML = state.players.map((p, i) => `
            <div class="player-input-wrapper">
                <span class="player-number">P${i + 1}</span>
                <input type="text" class="form-input player-name-input" data-index="${i}"
                    placeholder="Nome do Jogador ${i + 1}" value="${p.name}">
            </div>
        `).join('');

        // Bind input events
        container.querySelectorAll('.player-name-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const idx = parseInt(e.target.dataset.index);
                state.players[idx].name = e.target.value.trim();
                saveState();
                updateQuestAssignDropdown();
            });
        });
    }

    document.getElementById('btn-apply-players').addEventListener('click', () => {
        const count = parseInt(document.getElementById('player-count').value) || 4;
        state.playerCount = Math.max(1, Math.min(12, count));
        saveState();
        renderPlayerInputs();
        showToast(`${state.playerCount} jogadores configurados`);
    });

    // Ã¢â€â‚¬Ã¢â€â‚¬ Sorteio Ã¢â€â‚¬Ã¢â€â‚¬
    document.getElementById('btn-sortear').addEventListener('click', () => {
        const namedPlayers = state.players.filter(p => p.name);
        const availableChars = state.characters.filter(c => c.alive);

        if (namedPlayers.length === 0) {
            showToast('Nomeie pelo menos um jogador', 'error');
            return;
        }

        if (availableChars.length === 0) {
            showToast('Nenhum personagem vivo disponÃƒÂ­vel', 'error');
            return;
        }

        // Shuffle characters
        const shuffled = [...availableChars].sort(() => Math.random() - 0.5);
        const newSorteio = {};

        namedPlayers.forEach((player, i) => {
            if (i < shuffled.length) {
                newSorteio[player.name] = shuffled[i].id;
            }
        });

        state.sorteio = newSorteio;
        saveState();
        renderSorteio();
        renderCharactersGrid();
        showToast('Personagens sorteados! Ã°Å¸Å½Â²');
    });

    // Ã¢â€â‚¬Ã¢â€â‚¬ Re-sortear morto Ã¢â€â‚¬Ã¢â€â‚¬
    document.getElementById('btn-resortear-morto').addEventListener('click', () => {
        const modal = document.getElementById('resortear-modal');
        const select = document.getElementById('resortear-player');

        // Populate player select with players who have assigned characters
        select.innerHTML = '<option value="">Ã¢â‚¬â€ Selecionar jogador Ã¢â‚¬â€</option>';
        for (const [playerName, charId] of Object.entries(state.sorteio)) {
            const char = state.characters.find(c => c.id === charId);
            const charInfo = char ? ` (${char.name} - ${char.alive ? 'Vivo' : 'Morto'})` : '';
            select.innerHTML += `<option value="${playerName}">${playerName}${charInfo}</option>`;
        }

        modal.classList.add('visible');
    });

    document.getElementById('btn-confirm-resortear').addEventListener('click', () => {
        const playerName = document.getElementById('resortear-player').value;
        if (!playerName) {
            showToast('Selecione um jogador', 'error');
            return;
        }

        // Mark current character as dead
        const currentCharId = state.sorteio[playerName];
        if (currentCharId) {
            const char = state.characters.find(c => c.id === currentCharId);
            if (char) char.alive = false;
        }

        // Find available characters (alive and not assigned)
        const assignedIds = new Set(Object.values(state.sorteio));
        const available = state.characters.filter(c => c.alive && !assignedIds.has(c.id));

        if (available.length === 0) {
            showToast('Nenhum personagem disponÃƒÂ­vel para re-sortear', 'error');
            document.getElementById('resortear-modal').classList.remove('visible');
            saveState();
            renderDashboard();
            return;
        }

        // Random pick
        const newChar = available[Math.floor(Math.random() * available.length)];
        state.sorteio[playerName] = newChar.id;

        saveState();
        renderDashboard();
        document.getElementById('resortear-modal').classList.remove('visible');
        showToast(`${playerName} recebeu: ${newChar.name} Ã°Å¸Å½Â²`);
    });

    document.getElementById('btn-close-resortear-modal').addEventListener('click', () => {
        document.getElementById('resortear-modal').classList.remove('visible');
    });

    document.getElementById('btn-cancel-resortear').addEventListener('click', () => {
        document.getElementById('resortear-modal').classList.remove('visible');
    });

    function renderSorteio() {
        const container = document.getElementById('sorteio-result');
        const grid = document.getElementById('sorteio-grid');

        if (Object.keys(state.sorteio).length === 0) {
            container.classList.remove('visible');
            return;
        }

        container.classList.add('visible');
        grid.innerHTML = Object.entries(state.sorteio).map(([playerName, charId], i) => {
            const char = state.characters.find(c => c.id === charId);
            const charName = char ? char.name : 'Personagem removido';
            const charStatus = char ? (char.alive ? 'Ã¢Å“â€¦' : 'Ã°Å¸â€™â‚¬') : 'Ã¢Ââ€œ';

            return `
                <div class="sorteio-card" style="animation-delay: ${i * 0.1}s">
                    <div class="player-name">Ã°Å¸Å½Â® ${playerName}</div>
                    <div class="assigned-char">${charStatus} ${charName}</div>
                </div>
            `;
        }).join('');
    }

    // Ã¢â€â‚¬Ã¢â€â‚¬ Reset Session Ã¢â€â‚¬Ã¢â€â‚¬
    document.getElementById('btn-reset-session').addEventListener('click', () => {
        if (confirm('Ã¢Å¡Â Ã¯Â¸Â Resetar TODA a sessÃƒÂ£o? (Personagens, quests, sorteio Ã¢â‚¬â€ tudo serÃƒÂ¡ apagado)')) {
            state.characters = [];
            state.quests = [];
            state.sorteio = {};
            saveState();
            renderDashboard();
            // Clear map markers
            Object.values(questMarkers).forEach(el => {
                if (el && el.remove) el.remove();
            });
            questMarkers = {};
            showToast('SessÃƒÂ£o resetada', 'info');
        }
    });

    // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
    //  CHARACTER CREATION
    // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â

    let selectedAlignment = null;
    let selectedPositiveTraits = new Set();
    let selectedNegativeTraits = new Set();

    function initCharacterCreation() {
        renderAlignmentGrid();
        renderTraitsList('positive');
        renderTraitsList('negative');

        // Search filters
        document.getElementById('search-positive').addEventListener('input', (e) => {
            filterTraits('positive', e.target.value);
        });

        document.getElementById('search-negative').addEventListener('input', (e) => {
            filterTraits('negative', e.target.value);
        });

        // Save
        document.getElementById('btn-save-char').addEventListener('click', saveCharacter);

        // Clear
        document.getElementById('btn-clear-form').addEventListener('click', clearCharForm);
    }

    function renderAlignmentGrid() {
        const grid = document.getElementById('alignment-grid');
        grid.innerHTML = ALIGNMENTS.map(a => `
            <div class="alignment-option" data-id="${a.id}" style="--align-color: ${a.color}">
                <span class="align-icon">${a.icon}</span>
                <span>${a.name}</span>
            </div>
        `).join('');

        grid.querySelectorAll('.alignment-option').forEach(opt => {
            opt.addEventListener('click', () => {
                grid.querySelectorAll('.alignment-option').forEach(o => {
                    o.classList.remove('selected');
                    o.style.borderColor = '';
                    o.style.background = '';
                });
                opt.classList.add('selected');
                const color = opt.style.getPropertyValue('--align-color');
                opt.style.borderColor = color;
                opt.style.background = color + '15';
                selectedAlignment = opt.dataset.id;
            });
        });
    }

    function renderTraitsList(type) {
        const list = document.getElementById(`${type}-traits-list`);
        const traits = type === 'positive' ? POSITIVE_TRAITS : NEGATIVE_TRAITS;
        const cssClass = type === 'positive' ? 'positive-trait' : 'negative-trait';

        list.innerHTML = traits.map(t => `
            <label class="trait-checkbox ${cssClass}" data-id="${t.id}" data-name="${t.name.toLowerCase()}">
                <input type="checkbox" data-type="${type}" data-id="${t.id}" data-cost="${t.cost}">
                <div class="trait-info">
                    <div class="trait-name">
                        ${t.name}
                        <span class="trait-cost">${t.cost > 0 ? '+' : ''}${t.cost}</span>
                    </div>
                    <div class="trait-effect">${t.effect}</div>
                </div>
            </label>
        `).join('');

        // Bind checkbox events
        list.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const traitId = e.target.dataset.id;
                const traitType = e.target.dataset.type;
                const label = e.target.closest('.trait-checkbox');

                if (e.target.checked) {
                    label.classList.add('selected');
                    if (traitType === 'positive') selectedPositiveTraits.add(traitId);
                    else selectedNegativeTraits.add(traitId);
                } else {
                    label.classList.remove('selected');
                    if (traitType === 'positive') selectedPositiveTraits.delete(traitId);
                    else selectedNegativeTraits.delete(traitId);
                }

                updatePointsDisplay();
            });
        });
    }

    function filterTraits(type, query) {
        const list = document.getElementById(`${type}-traits-list`);
        const q = query.toLowerCase().trim();
        list.querySelectorAll('.trait-checkbox').forEach(item => {
            const name = item.dataset.name || '';
            item.style.display = name.includes(q) ? 'flex' : 'none';
        });
    }

    function updatePointsDisplay() {
        let points = 0;
        selectedPositiveTraits.forEach(id => {
            const t = POSITIVE_TRAITS.find(pt => pt.id === id);
            if (t) points += t.cost; // negative cost
        });
        selectedNegativeTraits.forEach(id => {
            const t = NEGATIVE_TRAITS.find(nt => nt.id === id);
            if (t) points += t.cost; // positive cost
        });

        const display = document.getElementById('points-display');
        display.textContent = points;
        display.className = 'points-value ' + (points > 0 ? 'positive' : points < 0 ? 'negative' : 'zero');
    }

    function saveCharacter() {
        const name = document.getElementById('char-name').value.trim();
        const age = parseInt(document.getElementById('char-age').value);

        if (!name) {
            showToast('D\u00ea um nome ao personagem', 'error');
            return;
        }

        if (!age || age < 16 || age > 80) {
            showToast('Idade deve ser entre 16 e 80', 'error');
            return;
        }

        if (!selectedAlignment) {
            showToast('Selecione um alinhamento', 'error');
            return;
        }

        const character = {
            id: uid(),
            name,
            age,
            alignment: selectedAlignment,
            positiveTraits: [...selectedPositiveTraits],
            negativeTraits: [...selectedNegativeTraits],
            alive: true,
            createdBy: currentUser.username,
            createdAt: new Date().toISOString()
        };

        state.characters.push(character);
        saveState();

        showToast(name + ' criado com sucesso! \u{1F9D1}');
        clearCharForm();
    }

    function clearCharForm() {
        document.getElementById('char-name').value = '';
        document.getElementById('char-age').value = '30';

        selectedAlignment = null;
        selectedPositiveTraits.clear();
        selectedNegativeTraits.clear();

        document.querySelectorAll('.alignment-option').forEach(o => {
            o.classList.remove('selected');
            o.style.borderColor = '';
            o.style.background = '';
        });

        document.querySelectorAll('.trait-checkbox input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
            cb.closest('.trait-checkbox').classList.remove('selected');
        });

        updatePointsDisplay();
    }

    // ═══════════════════════════════════════════════════
    //  MAP & QUESTS (OpenSeadragon - local proxy or direct)
    // ═══════════════════════════════════════════════════

    // Detect environment: local dev (Express proxy) vs hosted (direct tiles)
    var isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    // b42map.com blocks requests with a foreign Referer header.
    // The <meta name="referrer" content="no-referrer"> tag in index.html
    // suppresses the Referer so tiles load correctly from any host.
    // Local: use our Express proxy. Hosted: load directly (no Referer sent).
    var MAP_TILE_SOURCE = {
        Image: {
            xmlns: 'http://schemas.microsoft.com/deepzoom/2008',
            Url: isLocal ? '/map-proxy/base/layer0_files/' : 'https://b42map.com/map_data/base/layer0_files/',
            Format: 'jpg', Overlap: '0', TileSize: '1024',
            Size: { Width: '2314432', Height: '1019072' }
        }
    };

    function initMap() {
        if (pzMap) return;

        pzMap = OpenSeadragon({
            id: 'pz-map',
            prefixUrl: 'https://cdn.jsdelivr.net/npm/openseadragon@4.1.1/build/openseadragon/images/',
            tileSources: MAP_TILE_SOURCE,
            crossOriginPolicy: isLocal ? 'Anonymous' : false,
            showNavigationControl: true,
            showNavigator: true,
            navigatorPosition: 'BOTTOM_RIGHT',
            navigatorSizeRatio: 0.15,
            navigatorBackground: '#0a0f0d',
            showZoomControl: true,
            showHomeControl: true,
            showFullPageControl: false,
            showRotationControl: false,
            minZoomImageRatio: 0.5,
            maxZoomPixelRatio: 4,
            homeFillsViewer: true,
            constrainDuringPan: true,
            visibilityRatio: 0.5,
            gestureSettingsMouse: {
                clickToZoom: false,
                dblClickToZoom: true,
                scrollToZoom: true,
            },
            gestureSettingsTouch: {
                pinchToZoom: true,
                dblClickToZoom: true,
            },
            immediateRender: true,
            imageLoaderLimit: 5,
            maxImageCacheCount: 500,
            background: '#0a0f0c',
        });

        // Coordinate tracking
        const tracker = new OpenSeadragon.MouseTracker({
            element: pzMap.canvas,
            moveHandler: function(e) {
                if (!pzMap.viewport) return;
                var vp = pzMap.viewport.pointFromPixel(e.position);
                var ip = pzMap.viewport.viewportToImageCoordinates(vp);
                var coordsEl = document.getElementById('map-coords');
                if (coordsEl) coordsEl.textContent = 'X:' + Math.round(ip.x) + ' Y:' + Math.round(ip.y);
            }
        });

        // Click to create quest
        pzMap.addHandler('canvas-click', function(e) {
            if (e.quick) {
                var vp = pzMap.viewport.pointFromPixel(e.position);
                var ip = pzMap.viewport.viewportToImageCoordinates(vp);
                openQuestModal(ip.x, ip.y, null, 'X:' + Math.round(ip.x) + ' Y:' + Math.round(ip.y));
                e.preventDefaultAction = true;
            }
        });

        // Update quest overlays on viewport change
        pzMap.addHandler('animation', updateQuestOverlays);
        pzMap.addHandler('animation-finish', updateQuestOverlays);
        pzMap.addHandler('open', function() {
            setTimeout(updateQuestOverlays, 500);
        });
    }

    // ── Quest Overlays (pinned to image coordinates) ──
    function updateQuestOverlays() {
        if (!pzMap || !pzMap.viewport) return;
        var overlayEl = document.getElementById('quest-overlays');
        if (!overlayEl) return;

        state.quests.forEach(function(quest) {
            if (!quest.imgX || !quest.imgY) return;

            var el = questMarkers[quest.id];
            if (!el) {
                el = createQuestOverlayElement(quest);
                overlayEl.appendChild(el);
                questMarkers[quest.id] = el;
            }

            // Convert image coords -> viewport -> viewer pixel
            var viewportPoint = pzMap.viewport.imageToViewportCoordinates(
                new OpenSeadragon.Point(quest.imgX, quest.imgY)
            );
            var pixelPoint = pzMap.viewport.viewportToViewerElementCoordinates(viewportPoint);

            el.style.left = (pixelPoint.x - 14) + 'px';
            el.style.top = (pixelPoint.y - 32) + 'px';
            el.style.display = 'block';
        });
    }

    function createQuestOverlayElement(quest) {
        var colors = { easy: '#4ade80', medium: '#f59e0b', hard: '#ef4444', hardcore: '#a78bfa' };
        var color = colors[quest.difficulty] || '#4ade80';
        var diffLabels = { easy: 'F\u00e1cil', medium: 'M\u00e9dio', hard: 'Dif\u00edcil', hardcore: 'Hardcore' };
        var isCompleted = quest.status === 'completed';

        var el = document.createElement('div');
        el.className = 'quest-pin';
        el.dataset.questId = quest.id;
        el.style.cssText = 'position:absolute;z-index:1000;cursor:pointer;transition:transform 0.15s ease;';

        el.innerHTML = '<div style="width:28px;height:28px;background:' + color +
            ';border:2px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);' +
            'box-shadow:0 0 12px ' + color + '80,0 2px 8px rgba(0,0,0,0.5);' +
            'display:flex;align-items:center;justify-content:center;' +
            (isCompleted ? 'opacity:0.6;' : '') +
            '"><span style="transform:rotate(45deg);font-size:12px;">' +
            (isCompleted ? '\u2705' : '\u{1F4CC}') + '</span></div>';

        // Tooltip
        var tooltip = document.createElement('div');
        tooltip.className = 'quest-pin-tooltip';
        tooltip.style.cssText = 'position:absolute;bottom:36px;left:50%;transform:translateX(-50%);' +
            'background:rgba(13,20,16,0.95);border:1px solid ' + color + '44;border-radius:8px;' +
            'padding:8px 12px;font-size:12px;color:#e8f0ec;white-space:nowrap;pointer-events:none;' +
            'display:none;backdrop-filter:blur(8px);box-shadow:0 4px 12px rgba(0,0,0,0.4);z-index:1001;';
        tooltip.innerHTML = '<strong>' + quest.name + '</strong><br>' +
            '<span style="color:#8fa89a">' + (diffLabels[quest.difficulty] || '') + '</span>' +
            (quest.reward ? ' \u00b7 \u{1F3C6} ' + quest.reward : '') +
            (quest.assignedTo ? '<br><span style="color:' + color + '">\u{1F464} ' + quest.assignedTo + '</span>' : '');
        el.appendChild(tooltip);

        el.addEventListener('mouseenter', function() {
            tooltip.style.display = 'block';
            el.style.transform = 'scale(1.2)';
        });
        el.addEventListener('mouseleave', function() {
            tooltip.style.display = 'none';
            el.style.transform = 'scale(1)';
        });
        el.addEventListener('click', function(ev) {
            ev.stopPropagation();
            openQuestModal(quest.imgX, quest.imgY, quest, quest.location);
        });

        return el;
    }

    function addQuestMarker(quest) {
        if (!quest.imgX || !quest.imgY) return;
        removeQuestMarker(quest.id);
        if (pzMap && pzMap.viewport) {
            var el = createQuestOverlayElement(quest);
            var overlayEl = document.getElementById('quest-overlays');
            if (overlayEl) overlayEl.appendChild(el);
            questMarkers[quest.id] = el;
            updateQuestOverlays();
        }
    }

    function removeQuestMarker(questId) {
        if (questMarkers[questId]) {
            questMarkers[questId].remove();
            delete questMarkers[questId];
        }
    }

    // ── Quest Modal ──
    function openQuestModal(imgX, imgY, editQuest, locationStr) {
        var modal = document.getElementById('quest-modal');
        var titleEl = document.getElementById('quest-modal-title');
        updateQuestAssignDropdown();

        if (editQuest) {
            titleEl.textContent = 'Editar Quest';
            document.getElementById('quest-name').value = editQuest.name || '';
            document.getElementById('quest-description').value = editQuest.description || '';
            document.getElementById('quest-difficulty').value = editQuest.difficulty || 'easy';
            document.getElementById('quest-reward').value = editQuest.reward || '';
            document.getElementById('quest-location').value = editQuest.location || '';
            document.getElementById('quest-assign').value = editQuest.assignedTo || '';
            document.getElementById('quest-lat').value = editQuest.imgX || '';
            document.getElementById('quest-lng').value = editQuest.imgY || '';
            document.getElementById('quest-edit-id').value = editQuest.id;
        } else {
            titleEl.textContent = 'Nova Quest';
            document.getElementById('quest-name').value = '';
            document.getElementById('quest-description').value = '';
            document.getElementById('quest-difficulty').value = 'easy';
            document.getElementById('quest-reward').value = '';
            document.getElementById('quest-location').value = locationStr || '';
            document.getElementById('quest-assign').value = '';
            document.getElementById('quest-lat').value = imgX || '';
            document.getElementById('quest-lng').value = imgY || '';
            document.getElementById('quest-edit-id').value = '';
        }
        modal.classList.add('visible');
    }

    function updateQuestAssignDropdown() {
        var select = document.getElementById('quest-assign');
        var currentVal = select.value;
        select.innerHTML = '<option value="">\u2014 Todos os jogadores \u2014</option>';
        state.players.filter(function(p) { return p.name; }).forEach(function(p) {
            select.innerHTML += '<option value="' + p.name + '">' + p.name + '</option>';
        });
        state.users.forEach(function(u) {
            if (!state.players.find(function(p) { return p.name === u.username; })) {
                select.innerHTML += '<option value="' + u.username + '">' + u.username + ' (conta)</option>';
            }
        });
        select.value = currentVal;
    }

    document.getElementById('btn-add-quest').addEventListener('click', function() { openQuestModal(); });
    document.getElementById('btn-add-quest-header').addEventListener('click', function() { openQuestModal(); });
    document.getElementById('btn-close-quest-modal').addEventListener('click', function() { document.getElementById('quest-modal').classList.remove('visible'); });
    document.getElementById('btn-cancel-quest').addEventListener('click', function() { document.getElementById('quest-modal').classList.remove('visible'); });

    document.getElementById('btn-confirm-quest').addEventListener('click', function() {
        var name = document.getElementById('quest-name').value.trim();
        if (!name) { showToast('D\u00ea um nome \u00e0 quest', 'error'); return; }

        var editId = document.getElementById('quest-edit-id').value;
        var questData = {
            name: name,
            description: document.getElementById('quest-description').value.trim(),
            difficulty: document.getElementById('quest-difficulty').value,
            reward: document.getElementById('quest-reward').value.trim(),
            location: document.getElementById('quest-location').value.trim(),
            imgX: parseFloat(document.getElementById('quest-lat').value) || null,
            imgY: parseFloat(document.getElementById('quest-lng').value) || null,
            assignedTo: document.getElementById('quest-assign').value || null,
        };

        if (editId) {
            var quest = state.quests.find(function(q) { return q.id === editId; });
            if (quest) { Object.assign(quest, questData); removeQuestMarker(editId); addQuestMarker(quest); }
            showToast('Quest atualizada! \u{1F4CC}');
        } else {
            var quest = { id: uid(), name: questData.name, description: questData.description, difficulty: questData.difficulty, reward: questData.reward, location: questData.location, imgX: questData.imgX, imgY: questData.imgY, assignedTo: questData.assignedTo, status: 'active', completedBy: [], createdBy: currentUser.username, createdAt: new Date().toISOString() };
            state.quests.push(quest);
            addQuestMarker(quest);
            showToast('Quest criada! \u{1F4CC}');
        }
        saveState();
        renderQuestList();
        renderDashboard();
        document.getElementById('quest-modal').classList.remove('visible');
    });

    // ── Quest List ──
    function renderQuestList() {
        var list = document.getElementById('quest-list');
        var empty = document.getElementById('empty-quests');
        if (state.quests.length === 0) { list.innerHTML = ''; list.appendChild(empty); empty.style.display = 'block'; return; }

        empty.style.display = 'none';
        var diffLabels = { easy: 'F\u00e1cil', medium: 'M\u00e9dio', hard: 'Dif\u00edcil', hardcore: 'Hardcore' };
        var diffIcons = { easy: '\u{1F7E2}', medium: '\u{1F7E1}', hard: '\u{1F534}', hardcore: '\u{1F480}' };

        list.innerHTML = state.quests.map(function(q) {
            var isCompletedByMe = q.completedBy && q.completedBy.includes(currentUser.username);
            return '<div class="quest-card" data-id="' + q.id + '">' +
                '<div class="quest-title">' + (diffIcons[q.difficulty] || '\u{1F4CC}') + ' ' + q.name + '</div>' +
                (q.description ? '<div class="quest-desc">' + q.description + '</div>' : '') +
                '<div class="quest-meta">' +
                    '<span class="quest-badge ' + q.difficulty + '">' + (diffLabels[q.difficulty] || q.difficulty) + '</span>' +
                    '<span class="quest-badge ' + q.status + '">' + (q.status === 'active' ? 'Ativa' : 'Conclu\u00edda') + '</span>' +
                    (q.reward ? '<span style="font-size:0.7rem;color:var(--accent-yellow)">\u{1F3C6} ' + q.reward + '</span>' : '') +
                '</div>' +
                (q.assignedTo ? '<div class="quest-assigned">\u{1F464} Atribu\u00edda a: ' + q.assignedTo + '</div>' : '') +
                (q.completedBy && q.completedBy.length > 0 ? '<div class="quest-assigned" style="color:var(--accent-green)">\u2705 Completa: ' + q.completedBy.join(', ') + '</div>' : '') +
                '<div class="quest-actions">' +
                    (!isCompletedByMe && q.status === 'active' ? '<button class="btn btn-sm btn-primary" onclick="window.completeQuest(\'' + q.id + '\')">\u2705 Completar</button>' : '') +
                    '<button class="btn btn-sm btn-ghost" onclick="window.editQuest(\'' + q.id + '\')">\u270F\uFE0F</button>' +
                    '<button class="btn btn-sm btn-ghost" onclick="window.deleteQuest(\'' + q.id + '\')">\u{1F5D1}\uFE0F</button>' +
                    (q.imgX && q.imgY ? '<button class="btn btn-sm btn-ghost" onclick="window.flyToQuest(\'' + q.id + '\')" title="Ver no mapa">\u{1F50D}</button>' : '') +
                '</div></div>';
        }).join('');
    }

    window.completeQuest = function(questId) {
        var quest = state.quests.find(function(q) { return q.id === questId; });
        if (quest) {
            if (!quest.completedBy) quest.completedBy = [];
            if (!quest.completedBy.includes(currentUser.username)) quest.completedBy.push(currentUser.username);
            if (!quest.assignedTo || quest.completedBy.includes(quest.assignedTo)) quest.status = 'completed';
            saveState(); renderQuestList(); renderDashboard();
            removeQuestMarker(questId); addQuestMarker(quest);
            showToast('Quest "' + quest.name + '" conclu\u00edda! \u2705');
        }
    };

    window.editQuest = function(questId) {
        var quest = state.quests.find(function(q) { return q.id === questId; });
        if (quest) openQuestModal(quest.imgX, quest.imgY, quest, quest.location);
    };

    window.deleteQuest = function(questId) {
        var quest = state.quests.find(function(q) { return q.id === questId; });
        if (!quest) return;
        var questName = quest.name;
        var questBackup = JSON.parse(JSON.stringify(quest));
        state.quests = state.quests.filter(function(q) { return q.id !== questId; });
        removeQuestMarker(questId);
        saveState(); renderQuestList(); renderDashboard();

        // Toast with undo
        var container = document.getElementById('toast-container');
        var toast = document.createElement('div');
        toast.className = 'toast info';
        toast.innerHTML = '<span>\u{1F5D1}\uFE0F</span> Quest "' + questName + '" deletada <button style="margin-left:8px;padding:2px 10px;border:1px solid var(--accent-green);border-radius:6px;background:transparent;color:var(--accent-green);cursor:pointer;font-size:0.75rem;" id="undo-delete-' + questId + '">Desfazer</button>';
        container.appendChild(toast);

        var undoBtn = document.getElementById('undo-delete-' + questId);
        if (undoBtn) {
            undoBtn.addEventListener('click', function() {
                state.quests.push(questBackup);
                saveState(); renderQuestList(); renderDashboard();
                addQuestMarker(questBackup);
                toast.remove();
                showToast('Quest restaurada!');
            });
        }

        setTimeout(function() {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(function() { toast.remove(); }, 300);
        }, 5000);
    };

    window.flyToQuest = function(questId) {
        var quest = state.quests.find(function(q) { return q.id === questId; });
        if (!quest || !quest.imgX || !quest.imgY) return;

        // Navigate to map page first
        document.querySelectorAll('.nav-item').forEach(function(n) { n.classList.remove('active'); });
        document.querySelector('[data-page="map"]').classList.add('active');
        document.querySelectorAll('.page-section').forEach(function(p) { p.classList.remove('active'); });
        document.getElementById('page-map').classList.add('active');

        // Init map if needed, then fly
        function doFly() {
            if (pzMap && pzMap.viewport) {
                var viewportPoint = pzMap.viewport.imageToViewportCoordinates(
                    new OpenSeadragon.Point(quest.imgX, quest.imgY)
                );
                pzMap.viewport.panTo(viewportPoint, false);
                // Use a safe zoom level (max is ~2.26 based on image ratio)
                var safeZoom = Math.min(2.0, pzMap.viewport.getMaxZoom());
                pzMap.viewport.zoomTo(safeZoom, viewportPoint, false);
            }
        }

        if (!pzMap) {
            initMap();
            // Wait for tiles to load
            setTimeout(doFly, 1500);
        } else {
            doFly();
        }
    };

    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    //  INIT
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

    function initApp() {
        initNavigation();
        initCharacterCreation();
        renderDashboard();
        renderQuestList();
    }

    // Boot
    document.addEventListener('DOMContentLoaded', () => {
        initAuth();
    });

    // If DOM is already loaded
    if (document.readyState !== 'loading') {
        initAuth();
    }

})();
