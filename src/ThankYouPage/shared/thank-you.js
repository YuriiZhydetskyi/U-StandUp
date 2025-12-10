// ==========================================
// ThankYouPage Shared JavaScript Module
// ==========================================

// Config is expected to be set globally before this script loads:
// window.EVENT_CONFIG = { ... }

(function() {
    'use strict';

    const config = window.EVENT_CONFIG || {};

    // ==========================================
    // Confetti Animation
    // ==========================================
    class ConfettiAnimation {
        constructor(colors) {
            this.canvas = document.getElementById('confetti-canvas');
            if (!this.canvas) return;

            this.ctx = this.canvas.getContext('2d');
            this.particles = [];
            this.colors = colors || ['#5B9BD5', '#C0C0C0', '#7DB3E8', '#E8E8E8', '#FFFFFF'];

            this.resizeCanvas();
            window.addEventListener('resize', () => this.resizeCanvas());

            this.init();
        }

        resizeCanvas() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }

        init() {
            for (let i = 0; i < 100; i++) {
                this.particles.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height - this.canvas.height,
                    r: Math.random() * 6 + 2,
                    d: Math.random() * 100,
                    color: this.colors[Math.floor(Math.random() * this.colors.length)],
                    tilt: Math.floor(Math.random() * 10) - 10,
                    tiltAngleIncremental: Math.random() * 0.07 + 0.05,
                    tiltAngle: 0
                });
            }

            this.animate();

            setTimeout(() => {
                this.stop();
            }, 5000);
        }

        draw() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            this.particles.forEach((p) => {
                this.ctx.beginPath();
                this.ctx.lineWidth = p.r / 2;
                this.ctx.strokeStyle = p.color;
                this.ctx.moveTo(p.x + p.tilt + p.r, p.y);
                this.ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r);
                this.ctx.stroke();
            });
        }

        update() {
            this.particles.forEach((p, i) => {
                p.tiltAngle += p.tiltAngleIncremental;
                p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
                p.x += Math.sin(p.d);
                p.tilt = Math.sin(p.tiltAngle - i / 3) * 15;

                if (p.y > this.canvas.height) {
                    this.particles[i] = {
                        x: Math.random() * this.canvas.width,
                        y: -20,
                        r: p.r,
                        d: p.d,
                        color: p.color,
                        tilt: Math.floor(Math.random() * 10) - 10,
                        tiltAngleIncremental: p.tiltAngleIncremental,
                        tiltAngle: p.tiltAngle
                    };
                }
            });
        }

        animate() {
            this.draw();
            this.update();
            this.animationFrame = requestAnimationFrame(() => this.animate());
        }

        stop() {
            if (this.animationFrame) {
                cancelAnimationFrame(this.animationFrame);
            }

            let opacity = 1;
            const fadeOut = setInterval(() => {
                opacity -= 0.05;
                this.canvas.style.opacity = opacity;

                if (opacity <= 0) {
                    clearInterval(fadeOut);
                    this.canvas.style.display = 'none';
                }
            }, 50);
        }
    }

    // ==========================================
    // Falling Animation (Snowflakes or Leaves)
    // ==========================================
    class FallingAnimation {
        constructor(options) {
            this.container = document.getElementById('animationContainer');
            if (!this.container) return;

            this.type = options.type || 'snowflakes'; // 'snowflakes' or 'leaves'
            this.count = options.count || 20;
            this.chars = options.chars || ['❄', '❅', '❆'];
            this.colors = options.colors || null;

            this.init();
        }

        createSnowflake() {
            const element = document.createElement('div');
            element.className = 'snowflake';

            element.style.left = Math.random() * 100 + '%';

            const duration = Math.random() * 10 + 10;
            element.style.animationDuration = duration + 's';

            const delay = Math.random() * 10;
            element.style.animationDelay = delay + 's';

            const size = Math.random() * 1 + 0.8;
            element.style.fontSize = size + 'rem';

            element.textContent = this.chars[Math.floor(Math.random() * this.chars.length)];

            return element;
        }

        createLeaf() {
            const element = document.createElement('div');
            element.className = 'leaf';

            element.style.left = Math.random() * 100 + '%';

            const duration = Math.random() * 10 + 15;
            element.style.animationDuration = duration + 's';

            const delay = Math.random() * 10;
            element.style.animationDelay = delay + 's';

            const size = Math.random() * 15 + 15;
            element.style.width = size + 'px';
            element.style.height = size + 'px';

            if (this.colors) {
                element.style.background = this.colors[Math.floor(Math.random() * this.colors.length)];
            }

            return element;
        }

        init() {
            const createElement = this.type === 'snowflakes'
                ? () => this.createSnowflake()
                : () => this.createLeaf();

            for (let i = 0; i < this.count; i++) {
                const element = createElement();
                this.container.appendChild(element);
            }
        }
    }

    // ==========================================
    // Share Functions
    // ==========================================
    function shareToTelegram() {
        const url = encodeURIComponent(config.shareUrl || '');
        const text = encodeURIComponent(config.shareText || '');
        const telegramUrl = `https://t.me/share/url?url=${url}&text=${text}`;
        window.open(telegramUrl, '_blank', 'width=600,height=600');
    }

    function shareToWhatsApp() {
        const text = encodeURIComponent(`${config.shareText || ''}\n\n${config.shareUrl || ''}`);
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        let whatsappUrl;
        if (isMobile) {
            whatsappUrl = `whatsapp://send?text=${text}`;
        } else {
            whatsappUrl = `https://web.whatsapp.com/send?text=${text}`;
        }

        window.open(whatsappUrl, '_blank');
    }

    function copyLink() {
        const textToCopy = `${config.shareText || ''}\n\n${config.shareUrl || ''}`;

        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(textToCopy).then(() => {
                showCopyNotification();
            }).catch(err => {
                console.error('Failed to copy:', err);
                fallbackCopyTextToClipboard(textToCopy);
            });
        } else {
            fallbackCopyTextToClipboard(textToCopy);
        }
    }

    function fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
            showCopyNotification();
        } catch (err) {
            console.error('Fallback: Could not copy text:', err);
            prompt('Скопіюйте це повідомлення:', text);
        }

        document.body.removeChild(textArea);
    }

    function showCopyNotification() {
        const notification = document.createElement('div');
        notification.innerHTML = '✓ Скопійовано!<br><small>Тепер можна поділитися з друзями</small>';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #52C41A;
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            font-family: 'Montserrat', sans-serif;
            font-weight: 600;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            z-index: 9999;
            animation: slideInRight 0.3s ease-out;
            text-align: center;
            line-height: 1.5;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // ==========================================
    // Analytics
    // ==========================================
    function initAnalytics() {
        const startTime = Date.now();
        const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxaI9W6B2782WKEOC8dqkoxzEfxjkCSdQUCQ5Nkp6v4uDQQ4_CX2tQbyYUPSHctuZ1Trg/exec';

        function sendAnalytics() {
            const timeSpent = Math.round((Date.now() - startTime) / 1000);

            const data = new URLSearchParams({
                timestamp: new Date().toISOString(),
                page: window.location.pathname,
                time: timeSpent,
                referrer: document.referrer || 'Direct',
                userAgent: navigator.userAgent,
                language: navigator.language,
                screenSize: window.screen.width + 'x' + window.screen.height
            });

            if (navigator.sendBeacon) {
                navigator.sendBeacon(GOOGLE_SCRIPT_URL, data);
            } else {
                fetch(GOOGLE_SCRIPT_URL + '?' + data.toString(), {
                    method: 'GET',
                    mode: 'no-cors'
                }).catch(() => {});
            }
        }

        window.addEventListener('beforeunload', sendAnalytics);

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                sendAnalytics();
            }
        });

        setTimeout(sendAnalytics, 10000);
    }

    // ==========================================
    // Initialize on DOM Load
    // ==========================================
    document.addEventListener('DOMContentLoaded', () => {
        // Initialize confetti
        new ConfettiAnimation(config.confettiColors);

        // Initialize falling animation
        if (config.animation) {
            new FallingAnimation(config.animation);
        }

        // Add hover effects to detail items
        const detailItems = document.querySelectorAll('.detail-item');
        detailItems.forEach(item => {
            item.addEventListener('mouseenter', function() {
                this.style.transform = 'translateX(5px)';
                this.style.transition = 'transform 0.3s ease';
            });

            item.addEventListener('mouseleave', function() {
                this.style.transform = 'translateX(0)';
            });
        });

        // Initialize analytics
        initAnalytics();

        console.log(`${config.emoji || '🎭'} Thank You Page завантажено успішно!`);
    });

    // Expose functions globally
    window.shareToTelegram = shareToTelegram;
    window.shareToWhatsApp = shareToWhatsApp;
    window.copyLink = copyLink;

})();
