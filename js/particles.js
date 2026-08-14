/* ============================================================
   RLRS Studio · 粒子连线动画
   可配置参数通过 canvas 的 data-* 属性传入:
   data-count  粒子数量(默认 70,会按屏幕面积自适应)
   data-speed  最大速度(默认 0.3)
   data-dist   连线距离(默认 150)
   data-color  颜色,格式 "r, g, b"(默认 "255, 215, 0")
   ============================================================ */
(function () {
    'use strict';

    function initParticles(canvas) {
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        if (!ctx) return;

        var reduceMotion =
            window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        var COUNT = parseInt(canvas.dataset.count || '70', 10);
        var MAX_SPEED = parseFloat(canvas.dataset.speed || '0.3');
        var CONNECT_DIST = parseInt(canvas.dataset.dist || '150', 10);
        var COLOR = canvas.dataset.color || '255, 215, 0';

        var w = 0;
        var h = 0;
        var particles = [];
        var rafId = null;

        function resize() {
            var dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = window.innerWidth;
            h = window.innerHeight;
            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);
            canvas.style.width = w + 'px';
            canvas.style.height = h + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        function spawn() {
            particles.length = 0;
            // 按屏幕面积自适应粒子数,移动端自动变稀疏
            var n = Math.min(COUNT, Math.floor((w * h) / 20000));
            n = Math.max(n, 20);
            for (var i = 0; i < n; i++) {
                particles.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    vx: (Math.random() - 0.5) * MAX_SPEED * 2,
                    vy: (Math.random() - 0.5) * MAX_SPEED * 2,
                    r: Math.random() * 2 + 1.1,
                    a: Math.random() * 0.5 + 0.2
                });
            }
        }

        function step() {
            ctx.clearRect(0, 0, w, h);
            var i, j, p;
            for (i = 0; i < particles.length; i++) {
                p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > w) p.vx *= -1;
                if (p.y < 0 || p.y > h) p.vy *= -1;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(' + COLOR + ', ' + p.a + ')';
                ctx.fill();
            }
            var dist2 = CONNECT_DIST * CONNECT_DIST;
            for (i = 0; i < particles.length; i++) {
                for (j = i + 1; j < particles.length; j++) {
                    var dx = particles[i].x - particles[j].x;
                    var dy = particles[i].y - particles[j].y;
                    var d2 = dx * dx + dy * dy;
                    if (d2 < dist2) {
                        var dist = Math.sqrt(d2);
                        var alpha = (1 - dist / CONNECT_DIST) * 0.22;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = 'rgba(' + COLOR + ', ' + alpha + ')';
                        ctx.lineWidth = 0.6;
                        ctx.stroke();
                    }
                }
            }
        }

        function loop() {
            step();
            rafId = requestAnimationFrame(loop);
        }

        function start() {
            resize();
            spawn();
            if (reduceMotion) {
                // 偏好减少动效:只绘制静态一帧
                step();
            } else {
                loop();
            }
        }

        window.addEventListener('resize', function () {
            if (reduceMotion) {
                resize();
                spawn();
                step();
            } else {
                resize();
                spawn();
            }
        });

        start();
    }

    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    ready(function () {
        initParticles(document.getElementById('particles-canvas'));
    });
})();
