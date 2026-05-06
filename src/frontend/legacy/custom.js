/*
 * BugStore Custom Client-Side Scripts
 */

function deepMerge(target, source) {
    for (let key in source) {
        if (source[key] && typeof source[key] === 'object') {
            if (!target[key]) target[key] = {};
            deepMerge(target[key], source[key]);
        } else {
            target[key] = source[key];
        }
    }
    return target;
}

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

function handleHashFragment() {
    const hash = window.location.hash.substring(1);
    if (hash) {
        const container = document.getElementById('hash-content');
        if (container) {
            container.innerHTML = decodeURIComponent(hash);
        }
    }
}

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

if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', function () {
        applyURLFilters();
        handleHashFragment();

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

    window.BugStore = {
        deepMerge: deepMerge,
        subscribeNewsletter: subscribeNewsletter
    };
}
