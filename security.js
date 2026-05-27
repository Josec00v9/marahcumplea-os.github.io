(function() {
    const CODE = "1005";
    const SESSION_KEY = "access_granted";

    // 1. Inmediatamente ocultar el contenido para evitar parpadeos
    const style = document.createElement('style');
    style.id = 'security-hide-style';
    style.innerHTML = `
        body > *:not(.auth-overlay) { 
            display: none !important; 
        }
        body {
            overflow: hidden !important;
            background: #06000a !important;
        }
    `;
    document.head.appendChild(style);

    function init() {
        if (sessionStorage.getItem(SESSION_KEY) === "true") {
            unlock(false);
            return;
        }

        createLockScreen();
    }

    function createLockScreen() {
        const overlay = document.createElement('div');
        overlay.id = 'auth-lock-overlay';
        overlay.className = 'auth-overlay';
        overlay.innerHTML = `
            <div class="auth-content">
                <div class="auth-header">
                    <div class="auth-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    </div>
                    <h1 class="auth-title">Acceso Privado</h1>
                    <p class="auth-subtitle">Introduce el código especial para continuar</p>
                </div>
                
                <div class="auth-code-display">
                    <div class="auth-dot"></div>
                    <div class="auth-dot"></div>
                    <div class="auth-dot"></div>
                    <div class="auth-dot"></div>
                </div>

                <div class="auth-keypad">
                    <button class="auth-key" onclick="pressKey('1')">1</button>
                    <button class="auth-key" onclick="pressKey('2')">2</button>
                    <button class="auth-key" onclick="pressKey('3')">3</button>
                    <button class="auth-key" onclick="pressKey('4')">4</button>
                    <button class="auth-key" onclick="pressKey('5')">5</button>
                    <button class="auth-key" onclick="pressKey('6')">6</button>
                    <button class="auth-key" onclick="pressKey('7')">7</button>
                    <button class="auth-key" onclick="pressKey('8')">8</button>
                    <button class="auth-key" onclick="pressKey('9')">9</button>
                    <div class="auth-key-empty"></div>
                    <button class="auth-key" onclick="pressKey('0')">0</button>
                    <button class="auth-key auth-btn-clear" onclick="clearCode()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path><line x1="18" y1="9" x2="12" y2="15"></line><line x1="12" y1="9" x2="18" y2="15"></line></svg>
                    </button>
                </div>

                <div class="auth-footer">
                    Solo para ti ❤️
                </div>
            </div>
        `;

        // Estilos para el overlay con RESET TOTAL para evitar conflictos con otras webs
        const css = `
            @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap');

            .auth-overlay {
                all: initial; /* Reset total */
                position: fixed;
                inset: 0;
                z-index: 9999999;
                background: #06000a;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: 'Sora', sans-serif;
                color: white;
                opacity: 1;
                visibility: visible;
                transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
                box-sizing: border-box;
            }
            .auth-overlay * {
                box-sizing: border-box;
                font-family: 'Sora', sans-serif;
            }
            .auth-overlay.hidden {
                opacity: 0;
                transform: scale(1.1);
                pointer-events: none;
                visibility: hidden;
            }
            .auth-content {
                width: 100%;
                max-width: 320px;
                text-align: center;
                animation: authAppear 0.6s ease-out;
                padding: 20px;
            }
            @keyframes authAppear {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .auth-header { margin-bottom: 30px; }
            .auth-title {
                all: initial;
                display: block;
                font-family: 'Sora', sans-serif;
                font-size: 24px;
                font-weight: 700;
                color: white;
                margin: 15px 0 5px;
                letter-spacing: -0.5px;
                text-align: center;
            }
            .auth-subtitle {
                all: initial;
                display: block;
                font-family: 'Sora', sans-serif;
                font-size: 14px;
                color: rgba(255,255,255,0.4);
                margin-bottom: 0;
                text-align: center;
            }
            .auth-icon {
                width: 60px;
                height: 60px;
                background: rgba(200,33,90,0.1);
                border: 1px solid rgba(200,33,90,0.2);
                border-radius: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto;
                color: #c8215a;
                box-shadow: 0 0 20px rgba(200,33,90,0.2);
            }
            .auth-icon svg { width: 28px; height: 28px; stroke: currentColor; }
            
            .auth-code-display {
                display: flex;
                justify-content: center;
                gap: 20px;
                margin-bottom: 40px;
            }
            .auth-dot {
                width: 14px;
                height: 14px;
                border-radius: 50%;
                border: 1.5px solid rgba(255,255,255,0.2);
                transition: all 0.2s ease;
            }
            .auth-dot.active {
                background: white;
                border-color: white;
                box-shadow: 0 0 10px white;
                transform: scale(1.2);
            }
            .auth-code-display.error .auth-dot {
                border-color: #ff3d6e;
                animation: authShake 0.4s ease;
            }
            @keyframes authShake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-8px); }
                75% { transform: translateX(8px); }
            }
            
            .auth-keypad {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 15px;
                padding: 0;
                width: 100%;
            }
            .auth-key {
                all: initial;
                aspect-ratio: 1;
                border-radius: 50%;
                border: 1px solid rgba(255,255,255,0.08);
                background: rgba(255,255,255,0.03);
                color: white;
                font-family: 'Sora', sans-serif;
                font-size: 24px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
            }
            .auth-key:hover {
                background: rgba(255,255,255,0.08);
            }
            .auth-key:active {
                background: rgba(255,255,255,0.15);
                transform: scale(0.9);
            }
            .auth-key-empty { width: 100%; }
            .auth-btn-clear {
                border: none;
                background: transparent;
            }
            .auth-btn-clear:hover { background: transparent; }
            .auth-btn-clear svg { width: 24px; height: 24px; stroke: white; opacity: 0.5; }
            
            .auth-footer {
                all: initial;
                display: block;
                font-family: 'Sora', sans-serif;
                margin-top: 40px;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 2px;
                color: rgba(255,255,255,0.2);
                text-align: center;
            }
        `;
        const styleSheet = document.createElement("style");
        styleSheet.innerText = css;
        document.head.appendChild(styleSheet);
        document.body.appendChild(overlay);

        let currentInput = "";
        const dots = overlay.querySelectorAll('.auth-dot');

        window.pressKey = function(num) {
            if (currentInput.length < 4) {
                currentInput += num;
                updateDots();
                
                if (currentInput.length === 4) {
                    if (currentInput === CODE) {
                        unlock(true);
                    } else {
                        handleError();
                    }
                }
            }
        };

        window.clearCode = function() {
            if (currentInput.length > 0) {
                currentInput = currentInput.slice(0, -1);
                updateDots();
            }
        };

        function updateDots() {
            dots.forEach((dot, i) => {
                if (i < currentInput.length) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }

        function handleError() {
            overlay.querySelector('.auth-code-display').classList.add('error');
            setTimeout(() => {
                overlay.querySelector('.auth-code-display').classList.remove('error');
                currentInput = "";
                updateDots();
            }, 500);
        }
    }

    function unlock(animate) {
        sessionStorage.setItem(SESSION_KEY, "true");
        
        const styleHide = document.getElementById('security-hide-style');
        const overlay = document.querySelector('.auth-overlay');

        if (animate && overlay) {
            overlay.classList.add('hidden');
            setTimeout(() => {
                if (styleHide) styleHide.remove();
                if (overlay) overlay.remove();
            }, 800);
        } else {
            if (styleHide) styleHide.remove();
            if (overlay) overlay.remove();
        }
    }

    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Seguridad extra: Evitar click derecho en imágenes
    document.addEventListener('contextmenu', (e) => {
        if (e.target.tagName === 'IMG' || e.target.classList.contains('carousel-photo') || e.target.classList.contains('pw-img')) {
            e.preventDefault();
        }
    });

})();
