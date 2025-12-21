
export const ui = {
    openModalWindow(title, innerHTML, className = '') {
        document.getElementById('modal-title').innerText = title;
        document.getElementById('modal-content').innerHTML = innerHTML;

        // Visual modifiers
        const panel = document.getElementById('modal-panel');
        if (panel) {
            panel.className = 'modal-panel'; // Reset
            if (className) panel.classList.add(className);
        }

        const backdrop = document.getElementById('modal-backdrop');
        backdrop.classList.remove('hidden');
        // Force reflow
        void backdrop.offsetWidth;
        backdrop.classList.add('visible');

        // Reset scroll
        document.getElementById('modal-content').scrollTop = 0;

        // Apply Masks
        if (window.IMask) {
            setTimeout(() => {
                document.querySelectorAll('[data-mask="cpf"]').forEach(el => window.IMask(el, { mask: '000.000.000-00' }));
                document.querySelectorAll('[data-mask="phone"]').forEach(el => window.IMask(el, { mask: [{ mask: '(00) 0000-0000' }, { mask: '(00) 00000-0000' }] }));
            }, 50);
        }
    },

    closeModal() {
        const backdrop = document.getElementById('modal-backdrop');
        backdrop.classList.remove('visible');
        setTimeout(() => backdrop.classList.add('hidden'), 300);
    },

    switchModalTab(targetId) {
        // Hide all contents
        document.querySelectorAll('.modal-tab-content').forEach(el => el.classList.add('hidden'));
        // Show target
        const target = document.getElementById(targetId);
        if (target) target.classList.remove('hidden');

        // Update pills active state
        // We use event.target usually, but let's be safe if called programmatically
        if (window.event && window.event.target) {
            const btn = window.event.target.closest('.tab-pill');
            if (btn) {
                const container = btn.parentElement;
                container.querySelectorAll('.tab-pill').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            }
        }
    },

    toast(msg, type = 'success') {
        const t = document.getElementById('toast');
        t.innerText = ''; // Clear previous

        // Icon based on type
        const icon = type === 'error' ? '<i class="ph ph-warning"></i>' : '<i class="ph ph-check-circle"></i>';
        t.innerHTML = `${icon} ${msg}`;

        // Classes
        t.className = 'toast'; // Reset
        t.classList.add(type === 'error' ? 'error' : 'success');
        t.classList.remove('hidden');

        // Animate in
        requestAnimationFrame(() => {
            t.classList.add('visible');
        });

        // Hide after 3s
        setTimeout(() => {
            t.classList.remove('visible');
            setTimeout(() => t.classList.add('hidden'), 300);
        }, 3000);
    },

    toggleSidebar(id) {
        // Handled by app.js router mostly
    }
};
