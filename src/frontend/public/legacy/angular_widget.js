/*
 * V-004: AngularJS Template Injection (Legacy Widget)
 * Uses vulnerable version 1.7.7 (deliberate).
 *
 * The CSTI works because legacy_q is injected DIRECTLY into the DOM
 * before Angular bootstraps, so Angular compiles user input as a template.
 * e.g. ?legacy_q={{constructor.constructor('alert(1)')()}}
 */
(function () {
    if (typeof angular === 'undefined') return;

    // Only activate on /blog routes
    if (!window.location.pathname.startsWith('/blog')) return;

    angular.module('legacyBugSearch', []);

    // Wait for React to render, then inject the legacy widget
    var attempts = 0;
    var interval = setInterval(function () {
        attempts++;
        if (attempts > 50) { clearInterval(interval); return; }

        var root = document.getElementById('root');
        if (!root || !root.children.length) return;
        clearInterval(interval);

        var urlParams = new URLSearchParams(window.location.search);
        var legacyQ = urlParams.get('legacy_q');
        if (!legacyQ) return;

        // Create the legacy search widget container
        var widget = document.createElement('div');
        widget.id = 'legacy-search-widget';
        widget.style.cssText = 'background:#1a1333;border:1px solid #2d2255;border-radius:8px;padding:16px;margin:16px auto;max-width:800px;color:#e0d0ff;font-family:sans-serif;';

        // V-004: VULNERABLE — raw user input placed directly in Angular template HTML.
        // Angular will compile this and evaluate any {{expressions}} inside legacyQ.
        widget.innerHTML =
            '<div style="font-size:12px;color:#8866bb;margin-bottom:8px;">Legacy Search (AngularJS 1.7.7)</div>' +
            '<div style="font-size:16px;">Results for: ' + legacyQ + '</div>';

        // Insert at the top of the page content
        var main = root.querySelector('main') || root.firstElementChild;
        if (main) {
            main.insertBefore(widget, main.firstChild);
        } else {
            root.insertBefore(widget, root.firstChild);
        }

        // Bootstrap Angular on this element — Angular will compile the template,
        // evaluating any {{expressions}} that were in legacyQ
        angular.bootstrap(widget, ['legacyBugSearch']);

        console.log('Legacy Angular widget initialized (V-004 active).');
    }, 100);
})();
