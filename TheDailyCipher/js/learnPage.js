(() => {
    "use strict";

    function setupEmbeddedVisualizers() {
        const frames = [...document.querySelectorAll(".deep-visualizer-frame")];

        frames.forEach(frame => {
            // Keep Learn-page embeds intentionally compact. The complete visualizer
            // remains available through the "Open full visualizer" button.
            frame.removeAttribute("height");
            frame.style.removeProperty("height");
            frame.style.removeProperty("max-height");
            frame.setAttribute("scrolling", "yes");
            frame.dataset.compactEmbed = "true";
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
        setupEmbeddedVisualizers();
        setupTableOfContents();
    }, { once: true });
})();
