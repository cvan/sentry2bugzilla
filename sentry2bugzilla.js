/*

1. Install dotjs (https://addons.mozilla.org/en-US/firefox/addon/dotjs/ for Firefox or https://github.com/defunkt/dotjs for Chrome)
2. Copy this file to ~/.js/sentry.dmz.phx1.mozilla.com.js

*/

(function() {

$ = function(s) {
    return document.querySelector(s);
};

function serialize(obj) {
    var qs = [];
    Object.keys(obj).forEach(function(key) {
        qs.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
    });
    return qs.join('&');
}

var params = {
    'bug_file_loc': $('td a[href*="://"]').getAttribute('href') || '',
    'op_sys': 'All',
    'rep_platform': 'All',
    'short_desc': '[traceback] ' + $('.details p.message').textContent + '; ' +
        $('.details h3').textContent
};

// Remove "Status" label.
var $status = $('.sidebar .flat dt:first-child');
$status.parentNode.removeChild($status);

// Remove "Status" value.
$status = $('.sidebar .flat dd:first-child');
$status.parentNode.removeChild($status);

var aggData = $('.sidebar .flat').textContent;

if (!aggData) {
    return;
}

aggData = '* ' + aggData.trim();

params.comment = (
    'Sentry URL:\n\n' + window.location.href +
    '\n\n\nAggregate Details:\n\n' + aggData.replace(/ +/g, ' ')
        .replace(/\n\s+/g, '\n').replace(/:\n/g, ': ').replace(/\n/g, '\n* ') +
    '\n* Number of Tracebacks: ' + $('[data-count]').getAttribute('data-count') +
    '\n\n\nTraceback:\n\n' + $('#raw_stacktrace').textContent.trim() + '\n'
);

var product = $('#team-banner small').textContent;

if (product.indexOf('addons') !== -1 ||
    params.bug_file_loc.indexOf('//addons.') !== -1 ||
    params.bug_file_loc.indexOf('//addons-dev.') !== -1) {
    params.product = 'addons.mozilla.org';
}

if (product.indexOf('mkt') !== -1 ||
    product.indexOf('marketplace') !== -1 ||
    params.bug_file_loc.indexOf('//marketplace.') !== -1 ||
    params.bug_file_loc.indexOf('//marketplace-dev.') !== -1) {
    params.product = 'Marketplace';
}

var components = {
    'addons.mozilla.org': {
        '\/(admin|editors)\/': 'Admin/Editor Tools',
        '\/api\/v\d+\/': 'API',
        '\/collections\/': 'Collections',
        '\/developers\/': 'Developer Pages',
        '\/discovery\/': 'Discovery Pane',
        '\/forums\/': 'Forums',
        '\/(addon|extensions|firefox|theme|themes|personas)\/': 'Public Pages',
        '^(\w\/\w)': 'Public Pages',
        '\/search\/': 'Search',
        '\/(stats|statistics)\/': 'Statistics',
        '.*': 'Public Pages'  // Default
    },
    'Marketplace': {
        '\/curation|lookup\/': 'Admin Tools',
        '\/api\/v\d/': 'API',
        '\/developers\/': 'Developer Pages',
        '\/(category|settings|purchases)': 'Consumer Pages',
        '^(\w\/\w)': 'Consumer Pages',
        '\/(webpay|pay|purchase|buy|receipt)': 'Payments/Refunds',
        '\/reviewers\/': 'Reviewer Tools',
        '\/api\/.*\/search\/': 'Search',
        '\/(stats|statistics)\/': 'Statistics',
        '.*': 'General'  // Default
    }
};

if (params.product) {
    var patterns = components[params.product];
    Object.keys(patterns).forEach(function(pattern) {
        if (!params.component &&
            new RegExp(pattern).test(params.bug_file_loc)) {
            params.component = patterns[pattern];
        }
    });
}

var bugURL = 'https://bugzilla.mozilla.org/enter_bug.cgi?' + serialize(params);

// Show button on only traceback pages.
var b = document.createElement('button');
b.innerHTML = 'File bug';
b.setAttribute('class', 'btn');
b.setAttribute('style',
    'background: hotpink; color: #fff; margin-bottom: 20px; width: 100%');
b.onclick = function() {
    window.open(bugURL);
};

var $sidebar = $('.sidebar');
$sidebar.insertBefore(b, $sidebar.firstChild);

})();
