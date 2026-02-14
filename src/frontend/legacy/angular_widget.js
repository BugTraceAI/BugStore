/*
 * V-004: AngularJS Template Injection (Legacy Widget)
 * Uses vulnerable version 1.7.7 (deliberate).
 */
(function () {
    if (typeof angular === 'undefined') return;

    var app = angular.module('legacyBugSearch', []);

    app.controller('SearchController', ['$scope', '$sce', function ($scope, $sce) {
        $scope.trending = ['Goliath Beetle', 'Hercules Beetle', 'Mantis Shrimp'];

        // Check for URL parameter 'legacy_q' to reflect
        const urlParams = new URLSearchParams(window.location.search);
        const legacyQ = urlParams.get('legacy_q');

        $scope.searchHeader = legacyQ ? "Results for: " + legacyQ : "Trending Bugs";

        // V-004: The vulnerability is that passing user input to trustAsHtml
        // allows XSS if the input contains malicious HTML/JS.
        // Although 1.7.7 has strict context checks, misuse of trustAsHtml bypasses them.
        $scope.getSafeHtml = function (content) {
            return $sce.trustAsHtml(content);
        };
    }]);

    console.log("Legacy Angular widget initialized.");
})();
