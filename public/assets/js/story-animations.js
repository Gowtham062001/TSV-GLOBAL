/* TSV Global — Cinematic Journey Animations */
(function () {
    if (typeof gsap === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    // Progress bar
    gsap.to('.journey-progress__fill', {
        height: '100%',
        ease: 'none',
        scrollTrigger: { trigger: '.journey-section', start: 'top top', end: 'bottom bottom', scrub: 0.3 }
    });

    // Each chapter: animate canvas SVG + text
    gsap.utils.toArray('.chapter').forEach(function (ch) {
        var tl = gsap.timeline({
            scrollTrigger: { trigger: ch, start: 'top 75%', toggleActions: 'play none none reverse' }
        });

        // SVG path draw
        ch.querySelectorAll('.svg-path-draw').forEach(function (el) {
            var len = el.getTotalLength ? el.getTotalLength() : 800;
            gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
            tl.to(el, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.out' }, 0);
        });

        // SVG fade-in elements
        ch.querySelectorAll('.svg-fade').forEach(function (el, i) {
            tl.to(el, { opacity: 1, duration: 0.6, ease: 'power2.out' }, 0.3 + i * 0.15);
        });

        // SVG rising elements
        ch.querySelectorAll('.svg-rise').forEach(function (el, i) {
            tl.to(el, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.2 + i * 0.12);
        });

        // Text reveal
        var tag = ch.querySelector('.chapter__tag');
        var title = ch.querySelector('.chapter__title');
        var desc = ch.querySelector('.chapter__desc');
        var stats = ch.querySelectorAll('.cstat');
        if (tag) tl.from(tag, { opacity: 0, x: -20, duration: 0.5 }, 0.4);
        if (title) tl.from(title, { opacity: 0, y: 30, duration: 0.6 }, 0.55);
        if (desc) tl.from(desc, { opacity: 0, y: 20, duration: 0.5 }, 0.7);
        if (stats.length) tl.from(stats, { opacity: 0, y: 15, stagger: 0.1, duration: 0.5 }, 0.85);

        // Hover parallax on canvas
        var canvas = ch.querySelector('.chapter__canvas');
        if (canvas) {
            canvas.addEventListener('mousemove', function (e) {
                var r = canvas.getBoundingClientRect();
                var dx = (e.clientX - r.left - r.width / 2) / r.width;
                var dy = (e.clientY - r.top - r.height / 2) / r.height;
                gsap.to(canvas.querySelector('svg'), { x: dx * 10, y: dy * 8, duration: 0.6, ease: 'power2.out' });
            });
            canvas.addEventListener('mouseleave', function () {
                gsap.to(canvas.querySelector('svg'), { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1,0.5)' });
            });
        }
    });

    // Hero road animation
    var heroRoad = document.querySelector('.hero-road-path');
    if (heroRoad) {
        var roadLen = heroRoad.getTotalLength();
        gsap.set(heroRoad, { strokeDasharray: roadLen, strokeDashoffset: roadLen });
        gsap.to(heroRoad, { strokeDashoffset: 0, duration: 2.5, ease: 'power2.inOut', delay: 0.5 });
    }

    // Stars parallax
    var stars = document.getElementById('starsCanvas');
    if (stars) {
        window.addEventListener('scroll', function () {
            var y = window.scrollY;
            stars.style.transform = 'translateY(' + (y * 0.15) + 'px)';
        }, { passive: true });
    }

    // Counter animation on enter
    gsap.utils.toArray('.cstat__num[data-target]').forEach(function (el) {
        var target = parseInt(el.getAttribute('data-target'));
        ScrollTrigger.create({
            trigger: el, start: 'top 85%', once: true,
            onEnter: function () {
                gsap.to({ val: 0 }, {
                    val: target, duration: 1.8, ease: 'power2.out',
                    onUpdate: function () { el.textContent = Math.round(this.targets()[0].val) + (el.getAttribute('data-suffix') || ''); }
                });
            }
        });
    });
})();
