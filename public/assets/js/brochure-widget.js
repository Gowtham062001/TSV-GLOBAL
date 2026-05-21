/**
 * Brochure Download Widget — TSV Global Solutions
 * ─────────────────────────────────────────────────
 * • Sticky vertical button (right side, top→bottom text)
 * • Modal form with client-side validation
 * • SMTP email via PHP (graceful network error handling)
 * • Toast notification on success / error
 * • PDF opens in new tab only on successful form submission
 * File: assets/js/brochure-widget.js
 */
(function () {
    'use strict';

    /* ── Path detection (works from root and sub-dirs) ───────── */
    var _src  = (document.currentScript && document.currentScript.src) || '';
    var _base = (_src.indexOf('/services/') !== -1 || _src.indexOf('/Case-Studies/') !== -1)
                ? '../' : '';

    var PDF_PATH     = _base + 'assets/TSV Global Solutions_Brochure_2025.pdf';
    var PHP_ENDPOINT = _base + 'php/brochure-download.php';

    /* ── Widget HTML ─────────────────────────────────────────── */
    var WIDGET_HTML = [
        /* --- Sticky Button --- */
        '<button id="brochure-sticky-btn" aria-haspopup="dialog" aria-controls="brochure-modal" title="Download Brochure">',
        '  <span class="bw-icon">',
        '    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">',
        '      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>',
        '      <polyline points="14 2 14 8 20 8"/>',
        '      <line x1="12" y1="18" x2="12" y2="12"/>',
        '      <polyline points="9 15 12 18 15 15"/>',
        '    </svg>',
        '  </span>',
        '  <span class="bw-label">Download Brochure</span>',
        '</button>',

        /* --- Overlay + Modal --- */
        '<div id="brochure-overlay" role="dialog" aria-modal="true" aria-labelledby="bw-modal-title">',
        '  <div id="brochure-modal">',

        '    <div class="bw-modal-header">',
        '      <button id="brochure-close" aria-label="Close">&times;</button>',
        '      <div class="bw-pdf-icon">',
        '        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
        '          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>',
        '          <polyline points="14 2 14 8 20 8"/>',
        '          <line x1="12" y1="18" x2="12" y2="12"/>',
        '          <polyline points="9 15 12 18 15 15"/>',
        '        </svg>',
        '      </div>',
        '      <h2 id="bw-modal-title">Download Our Brochure</h2>',
        '      <p>Fill in your details to get instant access to<br>TSV Global Solutions Brochure 2025</p>',
        '    </div>',

        '    <div class="bw-modal-body">',
        '      <form id="bw-form" novalidate autocomplete="on">',

        '        <div class="bw-form-group">',
        '          <label for="bw-name">Name <span class="bw-required">*</span></label>',
        '          <input type="text" id="bw-name" name="name" placeholder="Enter your full name" autocomplete="name" required>',
        '          <p class="bw-field-error" id="bw-name-error">Please enter your name.</p>',
        '        </div>',

        '        <div class="bw-form-group">',
        '          <label for="bw-company">Company Name <span class="bw-optional">(Optional)</span></label>',
        '          <input type="text" id="bw-company" name="company_name" placeholder="Your company or organisation" autocomplete="organization">',
        '        </div>',

        '        <div class="bw-form-group">',
        '          <label for="bw-email">Email Address <span class="bw-required">*</span></label>',
        '          <input type="email" id="bw-email" name="email" placeholder="you@example.com" autocomplete="email" required>',
        '          <p class="bw-field-error" id="bw-email-error">Please enter a valid email address.</p>',
        '        </div>',

        '        <div class="bw-form-group">',
        '          <label for="bw-mobile">Mobile Number <span class="bw-required">*</span></label>',
        '          <input type="tel" id="bw-mobile" name="mobile" placeholder="+91 98765 43210" autocomplete="tel" required>',
        '          <p class="bw-field-error" id="bw-mobile-error">Please enter your mobile number.</p>',
        '        </div>',

        '        <button type="submit" id="bw-submit-btn">',
        '          <span class="bw-btn-spinner"></span>',
        '          <span class="bw-btn-text">Download Brochure</span>',
        '        </button>',

        '        <div id="bw-status"></div>',

        '      </form>',
        '      <p class="bw-privacy-note">&#128274; Your details are kept confidential and will not be shared.</p>',
        '    </div>',

        '  </div>',
        '</div>',

        /* --- Toast --- */
        '<div id="bw-toast" role="alert" aria-live="polite">',
        '  <span class="bw-toast-icon" id="bw-toast-icon"></span>',
        '  <span class="bw-toast-msg" id="bw-toast-msg"></span>',
        '  <button id="bw-toast-close" aria-label="Dismiss">&times;</button>',
        '</div>'
    ].join('\n');

    /* ── Initialise ──────────────────────────────────────────── */
    function init() {
        // Avoid double-init
        if (document.getElementById('brochure-sticky-btn')) return;

        var root = document.createElement('div');
        root.id  = 'bw-widget-root';
        root.innerHTML = WIDGET_HTML;
        document.body.appendChild(root);

        /* cache */
        var stickyBtn = document.getElementById('brochure-sticky-btn');
        var overlay   = document.getElementById('brochure-overlay');
        var modal     = document.getElementById('brochure-modal');
        var closeBtn  = document.getElementById('brochure-close');
        var form      = document.getElementById('bw-form');
        var submitBtn = document.getElementById('bw-submit-btn');
        var statusDiv = document.getElementById('bw-status');
        var toast     = document.getElementById('bw-toast');
        var toastIcon = document.getElementById('bw-toast-icon');
        var toastMsg  = document.getElementById('bw-toast-msg');
        var toastClose= document.getElementById('bw-toast-close');

        var fName  = document.getElementById('bw-name');
        var fEmail = document.getElementById('bw-email');
        var fMob   = document.getElementById('bw-mobile');

        var errName  = document.getElementById('bw-name-error');
        var errEmail = document.getElementById('bw-email-error');
        var errMob   = document.getElementById('bw-mobile-error');

        var toastTimer = null;

        /* ── Toast ───────────────────────────────────────────── */
        function showToast(type, message) {
            clearTimeout(toastTimer);
            toast.className = type === 'success' ? 'show toast-success' : 'show toast-error';
            toastIcon.textContent = type === 'success' ? '✅' : '❌';
            toastMsg.textContent  = message;
            toastTimer = setTimeout(function () { hideToast(); }, 5000);
        }

        function hideToast() {
            toast.className = '';
        }

        toastClose.addEventListener('click', hideToast);

        /* ── Open / Close Modal ──────────────────────────────── */
        function openModal() {
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            setTimeout(function () { fName.focus(); }, 250);
        }

        function closeModal() {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }

        stickyBtn.addEventListener('click', openModal);
        closeBtn.addEventListener('click', closeModal);

        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) closeModal();
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeModal();
        });

        /* Trap focus inside modal */
        modal.addEventListener('keydown', function (e) {
            if (e.key !== 'Tab') return;
            var focusable = modal.querySelectorAll(
                'button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
            );
            var first = focusable[0];
            var last  = focusable[focusable.length - 1];
            if (e.shiftKey ? document.activeElement === first
                           : document.activeElement === last) {
                e.preventDefault();
                (e.shiftKey ? last : first).focus();
            }
        });

        /* ── Validation helpers ──────────────────────────────── */
        function setError(input, errEl) {
            input.classList.add('bw-error');
            errEl.classList.add('visible');
        }
        function clearError(input, errEl) {
            input.classList.remove('bw-error');
            errEl.classList.remove('visible');
        }
        function isValidEmail(v) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        }
        function isValidMobile(v) {
            return /^[\d\s\+\-\(\)]{6,}$/.test(v.trim());
        }

        function validate() {
            var ok = true;
            if (!fName.value.trim())           { setError(fName, errName);   ok = false; }
            else                               { clearError(fName, errName); }
            if (!isValidEmail(fEmail.value.trim())) { setError(fEmail, errEmail); ok = false; }
            else                                    { clearError(fEmail, errEmail); }
            if (!isValidMobile(fMob.value))    { setError(fMob, errMob);    ok = false; }
            else                               { clearError(fMob, errMob);  }
            return ok;
        }

        /* live clear on input */
        [[fName, errName], [fEmail, errEmail], [fMob, errMob]].forEach(function (pair) {
            pair[0].addEventListener('input', function () {
                if (this.value.trim()) clearError(this, pair[1]);
            });
        });

        /* ── Form submit ─────────────────────────────────────── */
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (!validate()) return;

            /* loading state */
            submitBtn.disabled = true;
            submitBtn.classList.add('loading');
            statusDiv.style.display = 'none';
            statusDiv.className = '';

            var formData = new FormData(form);

            fetch(PHP_ENDPOINT, { method: 'POST', body: formData })
                .then(function (res) {
                    /* Try to parse JSON; fall back gracefully */
                    return res.text().then(function (text) {
                        var data;
                        try { data = JSON.parse(text); }
                        catch (err) { data = { success: false, message: text || 'Server error.' }; }
                        return { ok: res.ok, data: data };
                    });
                })
                .then(function (result) {
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('loading');

                    if (result.ok && result.data.success) {
                        /* ✅ Success */
                        statusDiv.className = 'success';
                        statusDiv.textContent = '✅ Thank you! Your brochure is opening…';
                        statusDiv.style.display = 'block';

                        /* Open PDF */
                        window.open(PDF_PATH, '_blank');

                        /* Toast */
                        showToast('success', 'Brochure downloaded successfully! Check your new tab.');

                        /* Close + reset after delay */
                        setTimeout(function () {
                            closeModal();
                            form.reset();
                            statusDiv.style.display = 'none';
                        }, 3000);

                    } else {
                        /* ❌ Server returned failure */
                        var msg = result.data.message || 'Something went wrong. Please try again.';
                        statusDiv.className = 'error';
                        statusDiv.textContent = '❌ ' + msg;
                        statusDiv.style.display = 'block';
                        showToast('error', msg);
                    }
                })
                .catch(function (err) {
                    /* ❌ Network / CORS / server unreachable */
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('loading');

                    var msg = 'Unable to submit. Please check your internet connection and try again.';
                    statusDiv.className = 'error';
                    statusDiv.textContent = '❌ ' + msg;
                    statusDiv.style.display = 'block';
                    showToast('error', msg);

                    console.warn('[Brochure Widget] Fetch failed:', err);
                });
        });
    }

    /* ── Boot ────────────────────────────────────────────────── */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
