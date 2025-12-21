
// UX Enhancement Utilities (Clean & Compatible)

export const ux = {
    // Show spinner inside button or element
    showLoading(element) {
        if (typeof element === 'string') element = document.querySelector(element);
        if (!element) return;

        element.setAttribute('data-original-content', element.innerHTML);
        element.disabled = true;
        element.innerHTML = '<div class="loading-spinner" style="width: 20px; height: 20px; border-width: 2px; margin: 0;"></div>';
    },

    // Restore original content
    hideLoading(element) {
        if (typeof element === 'string') element = document.querySelector(element);
        if (!element) return;

        const original = element.getAttribute('data-original-content');
        if (original) {
            element.innerHTML = original;
            element.removeAttribute('data-original-content');
        }
        element.disabled = false;
    },

    // Render Empty State
    renderEmptyState(message = 'Nenhum registro encontrado.') {
        return `
            <div class="card" style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                <i class="ph ph-folder-dashed" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>${message}</p>
            </div>
        `;
    },

    // Helper for Skeleton (Simple div for now)
    renderSkeleton(lines = 3) {
        return Array(lines).fill(0).map(() =>
            `<div class="card" style="height: 80px; background: #f1f5f9; animate: pulse;"></div>`
        ).join('');
    }
};
