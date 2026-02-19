/*
 * BugStore Custom Client-Side Scripts
 * Contains various vulnerabilities as per PRD F-031
 */

// V-007: Prototype Pollution via deepMerge
function deepMerge(target, source) {
    for (let key in source) {
        if (source[key] && typeof source[key] === 'object') {
            if (!target[key]) target[key] = {};
            // V-007: No check for __proto__, constructor, prototype
            deepMerge(target[key], source[key]);
        } else {
            target[key] = source[key];
        }
    }
    return target;
}

// Parse URL filters and merge into config (V-007 trigger)
function applyURLFilters() {
    const urlParams = new URLSearchParams(window.location.search);
    const filterParam = urlParams.get('filter');

    if (filterParam) {
        try {
            const filterObj = JSON.parse(decodeURIComponent(filterParam));
            const config = {};
            deepMerge(config, filterObj);
            console.log('Applied filters:', config);
        } catch (e) {
            console.error('Invalid filter format');
        }
    }
}

// V-003: DOM XSS via hash fragment
function handleHashFragment() {
    const hash = window.location.hash.substring(1);
    if (hash) {
        const container = document.getElementById('hash-content');
        if (container) {
            // V-003: Unsafe innerHTML assignment
            container.innerHTML = decodeURIComponent(hash);
        }
    }
}

// Newsletter subscription (CSRF vulnerable as per F-031)
function subscribeNewsletter(email) {
    fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
    })
        .then(r => r.json())
        .then(data => console.log('Subscribed:', data))
        .catch(err => console.error('Subscription failed:', err));
}

// Initialize on page load
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', function () {
        applyURLFilters();
        handleHashFragment();

        // Setup newsletter form if exists
        const newsletterForm = document.getElementById('newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', function (e) {
                e.preventDefault();
                const emailInput = this.querySelector('input[type="email"]');
                if (emailInput) {
                    subscribeNewsletter(emailInput.value);
                }
            });
        }
    });

    // Expose functions globally for testing
    window.BugStore = {
        deepMerge: deepMerge,
        subscribeNewsletter: subscribeNewsletter
    };
}
