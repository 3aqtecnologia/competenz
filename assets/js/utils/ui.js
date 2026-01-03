
export const ui = {
    showLoading(container) {
        if (container) container.innerHTML = '<div class="flex justify-center items-center p-12"><div class="loading-spinner"></div></div>';
    },

    formatDate(date, format = 'DD/MM/YYYY') {
        if (!date) return '';
        return window.dayjs(date).tz('America/Fortaleza').format(format);
    },

    formatDateTime(date, format = 'DD/MM/YYYY HH:mm') {
        if (!date) return '';
        return window.dayjs(date).tz('America/Fortaleza').format(format);
    },

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
    },

    SwitchField({ name, checked = false, onChange = '', title = '', className = '' }) {
        const isChecked = checked ? 'checked' : '';
        return `
        <div class="relative inline-block w-14 h-8 rounded-full overflow-hidden group cursor-pointer align-middle ${className}" title="${title}">
            <input type="checkbox" name="${name}" class="peer absolute w-full h-full opacity-0 z-20 cursor-pointer" ${isChecked} onchange="${onChange}">
            
            <!-- Track -->
            <div class="absolute inset-0 bg-slate-200 peer-checked:bg-emerald-500 transition-colors duration-300 ease-in-out border border-transparent peer-checked:border-emerald-500"></div>

            <!-- Icons -->
            <i class="ph-bold ph-check text-white absolute left-2.5 top-2 text-base opacity-0 peer-checked:opacity-100 transition-all duration-300 z-10 scale-50 peer-checked:scale-100"></i>
            <i class="ph-bold ph-x text-slate-400 absolute right-2.5 top-2 text-base opacity-100 peer-checked:opacity-0 transition-all duration-300 z-10 scale-100 peer-checked:scale-50"></i>

            <!-- Knob -->
            <div class="absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] peer-checked:translate-x-6 z-10"></div>
        </div>
        `;
    }
};
