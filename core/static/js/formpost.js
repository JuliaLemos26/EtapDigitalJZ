(function() {
    // Flag absoluta de execução
    if (window.__formPostEngineRunning) {
        console.log('🔄 Sincronizando Motor de Bloqueio...');
        if (typeof window.__runFormPatch === 'function') window.__runFormPatch();
        return;
    }

    window.__runFormPatch = function() {
        const form = document.getElementById('post-form');
        if (!form) return;

        const selectedRadio = form.querySelector('input[name="post_type"]:checked');
        const selectedType = selectedRadio ? selectedRadio.value : 'tarefa';

        const dynamicFields = document.querySelectorAll('.dynamic-field');
        dynamicFields.forEach(field => {
            const allowedTypes = (field.getAttribute('data-types') || "").split(/\s+/);
            const isAllowed = allowedTypes.includes(selectedType);
            const inputs = field.querySelectorAll('input, select, textarea');
            const isBlocked = field.classList.contains('blocked-field');

            if (isAllowed && isBlocked) {
                field.classList.remove('blocked-field');
                inputs.forEach(i => { i.disabled = false; i.readOnly = false; i.removeAttribute('tabindex'); });
                console.log('🔓 Campo liberado:', field.getAttribute('data-types'));
            } else if (!isAllowed && !isBlocked) {
                field.classList.add('blocked-field');
                inputs.forEach(i => {
                    i.disabled = true;
                    i.readOnly = true;
                    i.setAttribute('tabindex', '-1');
                    if (i.type !== 'submit' && i.type !== 'button') {
                        if (i.type === 'checkbox' || i.type === 'radio') i.checked = false;
                        else if (i.type !== 'file') i.value = '';
                    }
                });
                console.log('🔒 Campo BLOQUEADO:', field.getAttribute('data-types'));
            }
        });
    };

    console.log('🚀 REATIVANDO BLOQUEIO ESCURO V7.1');

    // Escuta mudanças globais
    document.addEventListener('change', (e) => {
        if (e.target && e.target.name === 'post_type') window.__runFormPatch();
    }, true);

    // Eventos de Bloqueio Físico (Captura)
    const stopInteraction = (e) => {
        if (e.target.closest('.blocked-field')) {
            e.preventDefault();
            e.stopPropagation();
            if (e.type === 'focusin') e.target.blur();
            return false;
        }
    };

    ['focusin', 'keydown', 'mousedown', 'click'].forEach(evt => {
        document.addEventListener(evt, stopInteraction, true);
    });

    // Re-sincronização automática para SPA
    document.addEventListener('spaPageLoaded', () => {
        console.log('📡 SPA Sinalizou nova página. Re-sincronizando bloqueios...');
        setTimeout(window.__runFormPatch, 250);
    });
    
    // Polling de segurança
    setInterval(window.__runFormPatch, 1500);

    // AJAX Form Submission
    document.addEventListener('submit', (e) => {
        const form = e.target.closest('#post-form');
        if (!form) return;

        e.preventDefault();
        console.log('📡 Enviando POST via AJAX...');
        
        const formData = new FormData(form);
        const container = document.querySelector('.home-section');

        fetch('/pages/formpost/', {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(res => res.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            if (container) {
                container.innerHTML = doc.body.innerHTML;
                window.scrollTo({ top: 0, behavior: 'smooth' });
                // Re-inicializa bloqueios após injeção
                if (typeof window.__runFormPatch === 'function') setTimeout(window.__runFormPatch, 100);
            }
        })
        .catch(err => console.error('Erro no envio AJAX:', err));
    });

    window.__formPostEngineRunning = true;
})();