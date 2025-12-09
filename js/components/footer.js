/**
 * Footer component for all pages
 */

import { SITE_CONFIG } from './header.js';

export function renderFooter() {
    const currentYear = new Date().getFullYear();

    return `
    <footer>
        <div class="container">
            <div class="footer-content">
                <div class="footer-info">
                    <p class="footer-copyright">&copy; ${currentYear} ${SITE_CONFIG.name}. Усі права захищені.</p>
                    <p class="footer-location">Köln, Deutschland</p>
                </div>
                <div class="footer-social">
                    <a href="${SITE_CONFIG.social.instagram}" target="_blank" rel="noopener" aria-label="Instagram">
                        <img src="/img/instagram-icon.svg" alt="Instagram" width="32" height="32">
                    </a>
                    <a href="${SITE_CONFIG.social.whatsapp}" target="_blank" rel="noopener" aria-label="WhatsApp">
                        <img src="/img/whatsapp-icon.svg" alt="WhatsApp" width="32" height="32">
                    </a>
                    ${SITE_CONFIG.social.facebook ? `
                    <a href="${SITE_CONFIG.social.facebook}" target="_blank" rel="noopener" aria-label="Facebook">
                        <img src="/img/facebook-icon.svg" alt="Facebook" width="32" height="32">
                    </a>
                    ` : ''}
                </div>
            </div>
        </div>
    </footer>`;
}

export function initFooter() {
    document.body.insertAdjacentHTML('beforeend', renderFooter());
}
