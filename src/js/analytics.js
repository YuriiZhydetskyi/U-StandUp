/**
 * Custom Analytics for У Стендап
 * Tracks page views and time spent on pages
 */

(function() {
    // Prevent double initialization
    if (window.__ustandup_analytics_initialized) return;
    window.__ustandup_analytics_initialized = true;

    const startTime = Date.now();
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxaI9W6B2782WKEOC8dqkoxzEfxjkCSdQUCQ5Nkp6v4uDQQ4_CX2tQbyYUPSHctuZ1Trg/exec';

    let analyticsSent = false;

    function sendAnalytics() {
        if (analyticsSent) return;
        analyticsSent = true;

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

    // Send on page unload
    window.addEventListener('beforeunload', sendAnalytics);

    // Send when page becomes hidden (mobile tab switch)
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) sendAnalytics();
    });

    // Send after 10 seconds as fallback
    setTimeout(sendAnalytics, 10000);
})();
