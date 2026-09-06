export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive("reveal", {
    mounted(el, binding) {
      const delay = Number(binding.value ?? 0);
      el.classList.add("reveal");
      if (delay) el.style.transitionDelay = `${delay}ms`;
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              el.classList.add("is-visible");
              io.disconnect();
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
      );
      io.observe(el);
      (el as HTMLElement & { _revealIo?: IntersectionObserver })._revealIo = io;
    },
    unmounted(el) {
      (el as HTMLElement & { _revealIo?: IntersectionObserver })._revealIo?.disconnect();
    },
  });
});
