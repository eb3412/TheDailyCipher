(() => {
    "use strict";

    document.addEventListener("DOMContentLoaded", () => {
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
    }, { once: true });
})();
