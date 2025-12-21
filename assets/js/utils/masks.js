// Input Mask Utilities
export const masks = {
    cpf(element) {
        if (!element || !window.IMask) return null;
        return window.IMask(element, {
            mask: '000.000.000-00'
        });
    },

    phone(element) {
        if (!element || !window.IMask) return null;
        return window.IMask(element, {
            mask: [
                { mask: '(00) 0000-0000' },
                { mask: '(00) 00000-0000' }
            ]
        });
    },

    cep(element) {
        if (!element || !window.IMask) return null;
        return window.IMask(element, {
            mask: '00000-000'
        });
    },

    applyMasks() {
        // Apply masks to all elements with data-mask attribute
        setTimeout(() => {
            document.querySelectorAll('[data-mask="cpf"]').forEach(el => this.cpf(el));
            document.querySelectorAll('[data-mask="phone"]').forEach(el => this.phone(el));
            document.querySelectorAll('[data-mask="cep"]').forEach(el => this.cep(el));
        }, 100);
    }
};
