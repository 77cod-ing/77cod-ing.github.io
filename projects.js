
        (function () {
            'use strict';

        var CATEGORIES = [
        {slug: 'all', label: 'All Projects' },
        {slug: 'featured', label: '\u2605 Featured' },
        {slug: 'login-forms', label: 'Login Forms' },
        {slug: 'buttons', label: 'Buttons' },
        {slug: 'cards', label: 'Cards' },
        {slug: 'navigation', label: 'Navigation' },
        {slug: 'animations', label: 'Animations' },
        {slug: 'ui-components', label: 'UI Components' },
        {slug: 'neon-effects', label: 'Neon Effects' },
        {slug: 'file-upload', label: 'File Upload' },
        {slug: 'tutorials', label: 'Tutorials' }
        ];

        var activeCategory = 'all';
        var searchQuery = '';
        var allCards = [];
        var allSections = [];
        var lastSearchForCounts = '';
        var debounceTimer = null;

        /* ── Initialize ── */
        function init() {
            allCards = Array.from(document.querySelectorAll('.card-link-wrapper'));
        allSections = Array.from(document.querySelectorAll('main > section[aria-labelledby]'));
        readURLParams();
        buildPills();
        applyFilters(true);
        bindEvents();
      }

        /* ── URL Parameters ── */
        function readURLParams() {
        var params = new URLSearchParams(window.location.search);
        var cat = params.get('category');
        var q = params.get('search');
        if (cat && CATEGORIES.some(function (c) { return c.slug === cat; })) {
            activeCategory = cat;
        }
        if (q) {
            searchQuery = q;
        var input = document.getElementById('searchInput');
        if (input) {
            input.value = q;
        toggleClearBtn(true);
          }
        }
      }

        function updateURL() {
        var params = new URLSearchParams();
        if (activeCategory !== 'all') params.set('category', activeCategory);
        if (searchQuery) params.set('search', searchQuery);
        var qs = params.toString();
        var newURL = qs ? window.location.pathname + '?' + qs : window.location.pathname;
        history.replaceState(null, '', newURL);
      }

        /* ── Build Category Pills ── */
        function buildPills() {
        var container = document.getElementById('filterCategories');
        if (!container) return;
        container.innerHTML = '';

        CATEGORIES.forEach(function (cat) {
          var btn = document.createElement('button');
        btn.className = 'filter-pill' + (cat.slug === activeCategory ? ' active' : '');
        btn.dataset.category = cat.slug;
        btn.setAttribute('role', 'tab');
        btn.setAttribute('aria-selected', String(cat.slug === activeCategory));

        var count = getCategoryCount(cat.slug);

        btn.appendChild(document.createTextNode(cat.label + ' '));
        var countSpan = document.createElement('span');
        countSpan.className = 'pill-count';
        countSpan.textContent = count;
        btn.appendChild(countSpan);

        btn.addEventListener('click', function () {
            activeCategory = this.dataset.category;
        var pills = document.querySelectorAll('.filter-pill');
        for (var i = 0; i < pills.length; i++) {
            pills[i].classList.remove('active');
        pills[i].setAttribute('aria-selected', 'false');
            }
        this.classList.add('active');
        this.setAttribute('aria-selected', 'true');
        applyFilters(false);
          });

        container.appendChild(btn);
        });
      }

        /* ── Get Category Count (base, no search) ── */
        function getCategoryCount(slug) {
        if (slug === 'all') return allCards.length;
        if (slug === 'featured') {
          return allCards.filter(function (c) { return c.dataset.featured === 'true'; }).length;
        }
        return allCards.filter(function (c) {
          return (c.dataset.category || '').split(',').indexOf(slug) !== -1;
        }).length;
      }

        /* ── Update Pill Counts (lazy: only when search query changes) ── */
        function updatePillCounts(query) {
        var pills = document.querySelectorAll('.filter-pill');
        for (var i = 0; i < pills.length; i++) {
          var slug = pills[i].dataset.category;
        var count;

        if (!query) {
            count = getCategoryCount(slug);
          } else if (slug === 'all') {
            count = allCards.filter(function (c) { return matchSearch(c, query); }).length;
          } else if (slug === 'featured') {
            count = allCards.filter(function (c) {
                return c.dataset.featured === 'true' && matchSearch(c, query);
            }).length;
          } else {
            count = allCards.filter(function (c) {
                return (c.dataset.category || '').split(',').indexOf(slug) !== -1 && matchSearch(c, query);
            }).length;
          }

        var countSpan = pills[i].querySelector('.pill-count');
        if (countSpan) countSpan.textContent = count;
        }
      }

        /* ── Search Match ── */
        function matchSearch(card, query) {
        if (!query) return true;
        var titleEl = card.querySelector('.card-title');
        var title = titleEl ? titleEl.textContent.toLowerCase() : '';
        var cats = (card.dataset.category || '').toLowerCase();
        return title.indexOf(query) !== -1 || cats.indexOf(query) !== -1;
      }

        /* ── Apply Filters ── */
        function applyFilters(recomputeCounts) {
        var query = searchQuery.toLowerCase().trim();
        var visibleCount = 0;

        for (var i = 0; i < allCards.length; i++) {
          var card = allCards[i];
        var cats = (card.dataset.category || '').split(',');
        var isFeatured = card.dataset.featured === 'true';

        var matchCat = true;
        if (activeCategory === 'featured') {
            matchCat = isFeatured;
          } else if (activeCategory !== 'all') {
            matchCat = cats.indexOf(activeCategory) !== -1;
          }

        var matchSr = matchSearch(card, query);
        var visible = matchCat && matchSr;

        card.style.display = visible ? '' : 'none';
        if (visible) visibleCount++;
        }

        /* Hide sections with zero visible cards */
        for (var s = 0; s < allSections.length; s++) {
          var section = allSections[s];
        var visCards = section.querySelectorAll('.card-link-wrapper:not([style*="display: none"])');
        if (visCards.length === 0) {
            section.classList.add('section-hidden');
          } else {
            section.classList.remove('section-hidden');
          }
        }

        /* Update result counter */
        var countEl = document.getElementById('filterCount');
        if (countEl) {
            countEl.textContent = visibleCount + (visibleCount === 1 ? ' project' : ' projects');
        }

        /* No results state */
        var noResults = document.getElementById('noResults');
        if (noResults) {
          if (visibleCount === 0) {
            noResults.classList.add('visible');
          } else {
            noResults.classList.remove('visible');
          }
        }

        /* Lazy count update — only recompute pill counts when search query actually changed */
        if (recomputeCounts && query !== lastSearchForCounts) {
            updatePillCounts(query);
        lastSearchForCounts = query;
        }

        updateURL();
      }

        /* ── Clear Button Toggle ── */
        function toggleClearBtn(show) {
        var btn = document.getElementById('clearSearch');
        if (btn) btn.style.display = show ? 'block' : 'none';
      }

        /* ── Event Binding ── */
        function bindEvents() {
        var searchInput = document.getElementById('searchInput');
        var clearBtn = document.getElementById('clearSearch');

        if (searchInput) {
            searchInput.addEventListener('input', function () {
                clearTimeout(debounceTimer);
                var self = this;
                debounceTimer = setTimeout(function () {
                    searchQuery = self.value.trim();
                    toggleClearBtn(searchQuery.length > 0);
                    applyFilters(true);
                }, 180);
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', function () {
                searchQuery = '';
                var input = document.getElementById('searchInput');
                if (input) input.value = '';
                toggleClearBtn(false);
                applyFilters(true);
                if (input) input.focus();
            });
        }
      }

        /* ── Start ── */
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
      } else {
            init();
      }

    })();
