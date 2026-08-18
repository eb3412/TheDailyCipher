(() => {
    "use strict";

    function setupAutoSizingVisualizers() {
        const frames = [...document.querySelectorAll(".deep-visualizer-frame")];

        frames.forEach(frame => {
            let resizeObserver = null;
            let mutationObserver = null;
            let resizeQueued = false;

            const resizeFrame = () => {
                if (resizeQueued) return;
                resizeQueued = true;

                requestAnimationFrame(() => {
                    resizeQueued = false;

                    try {
                        const doc = frame.contentDocument;
                        if (!doc || !doc.body || !doc.documentElement) return;

                        const shell = doc.querySelector(".viz-shell");
                        const bodyStyle = frame.contentWindow.getComputedStyle(doc.body);
                        const bottomPadding = Number.parseFloat(bodyStyle.paddingBottom) || 0;

                        /*
                         * Measure the visualizer content itself rather than the
                         * iframe viewport. The root document scroll height can equal
                         * the iframe height, which would create a resize feedback
                         * loop. .viz-shell's bottom is content-driven.
                         */
                        const contentHeight = shell
                            ? Math.ceil(shell.getBoundingClientRect().bottom + bottomPadding)
                            : Math.ceil(doc.body.getBoundingClientRect().height + bottomPadding);

                        if (contentHeight > 0) {
                            frame.style.height = `${contentHeight + 2}px`;
                            frame.setAttribute("scrolling", "no");
                            frame.dataset.autoSized = "true";
                        }
                    } catch (_) {
                        // Same-origin visualizers are expected in production.
                        // If a browser blocks access, the CSS fallback height remains usable.
                    }
                });
            };

            const attachObservers = () => {
                try {
                    const doc = frame.contentDocument;
                    if (!doc || !doc.body || !doc.documentElement) return;

                    resizeObserver?.disconnect();
                    mutationObserver?.disconnect();

                    const FrameResizeObserver = frame.contentWindow?.ResizeObserver || window.ResizeObserver;

                    if (FrameResizeObserver) {
                        resizeObserver = new FrameResizeObserver(resizeFrame);
                        resizeObserver.observe(doc.querySelector(".viz-shell") || doc.body);
                    } else if ("MutationObserver" in window) {
                        mutationObserver = new MutationObserver(resizeFrame);
                        mutationObserver.observe(doc.body, {
                            childList: true,
                            subtree: true,
                            attributes: true,
                            characterData: true
                        });
                    }

                    if (doc.fonts?.ready) {
                        doc.fonts.ready.then(resizeFrame).catch(() => {});
                    }

                    resizeFrame();
                    setTimeout(resizeFrame, 80);
                    setTimeout(resizeFrame, 350);
                    setTimeout(resizeFrame, 1000);
                } catch (_) {
                    // Keep the fallback iframe dimensions if access is unavailable.
                }
            };

            frame.addEventListener("load", attachObservers);

            if (frame.contentDocument?.readyState === "complete") {
                attachObservers();
            }

            window.addEventListener("resize", resizeFrame, { passive: true });
        });
    }

    function setupTableOfContents() {
        const links = [...document.querySelectorAll(".deep-toc a[href^='#']")];
        const sections = links
            .map(link => document.querySelector(link.getAttribute("href")))
            .filter(Boolean);

        links.forEach(link => {
            link.addEventListener("click", () => {
                const target = document.querySelector(link.getAttribute("href"));
                if (!target) return;

                target.setAttribute("tabindex", "-1");
                setTimeout(() => target.focus({ preventScroll: true }), 350);
            });
        });

        if (!sections.length || !("IntersectionObserver" in window)) return;

        const observer = new IntersectionObserver(entries => {
            const visible = entries
                .filter(entry => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

            if (!visible) return;

            links.forEach(link => {
                link.classList.toggle(
                    "active",
                    link.getAttribute("href") === `#${visible.target.id}`
                );
            });
        }, {
            rootMargin: "-15% 0px -70% 0px",
            threshold: [0, 0.2, 0.5, 1]
        });

        sections.forEach(section => observer.observe(section));
    }

    document.addEventListener("DOMContentLoaded", () => {
        setupAutoSizingVisualizers();
        setupTableOfContents();
    }, { once: true });
})();
