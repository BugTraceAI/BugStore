/*
 * Legacy Angular blog search widget (AngularJS 1.7.7).
 */
(function () {
    if (typeof angular === 'undefined') return;

    if (!window.location.pathname.startsWith('/blog')) return;

    angular.module('legacyBugSearch', []);

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

        var widget = document.createElement('div');
        widget.id = 'legacy-search-widget';
        widget.style.cssText = 'background:#1a1333;border:1px solid #2d2255;border-radius:8px;padding:16px;margin:16px auto;max-width:800px;color:#e0d0ff;font-family:sans-serif;';

        widget.innerHTML =
            '<div style="font-size:12px;color:#8866bb;margin-bottom:8px;">Legacy Search (AngularJS 1.7.7)</div>' +
            '<div style="font-size:16px;">Results for: ' + legacyQ + '</div>';

        var main = root.querySelector('main') || root.firstElementChild;
        if (main) {
            main.insertBefore(widget, main.firstChild);
        } else {
            root.insertBefore(widget, root.firstChild);
        }

        angular.bootstrap(widget, ['legacyBugSearch']);

        console.log('Legacy Angular widget initialized.');
    }, 100);
})();
