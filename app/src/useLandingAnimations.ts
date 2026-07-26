import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useLandingAnimations() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(".header-container .logo-link, .nav-link", {
        opacity: 1,
        visibility: "visible",
        y: 0,
        duration: 1.5,
        stagger: 0.1,
        ease: "power2.out",
        delay: 0.3,
      });

      gsap.set(".gsap-fade, .stagger-item", { visibility: "visible" });

      gsap.to(".hero-bg", {
        yPercent: 15,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.to("#arquitetura", {
        yPercent: 5,
        ease: "none",
        scrollTrigger: {
          trigger: "#metodologia",
          start: "top bottom",
          end: "top top",
          scrub: true,
        },
      });

      document.querySelectorAll(".gsap-fade").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.4,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          },
        );
      });

      document.querySelectorAll(".stagger-group").forEach((group) => {
        const items = group.querySelectorAll(".stagger-item");
        gsap.fromTo(
          items,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.2,
            stagger: 0.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: group,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          },
        );
      });

      gsap.set(".footer-link-item", { visibility: "visible" });

      gsap.fromTo(
        ".footer-link-item",
        { opacity: 0, x: -15 },
        {
          opacity: 1,
          x: 0,
          duration: 1.5,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".footer-links",
            start: "top 90%",
            toggleActions: "play none none none",
          },
        },
      );
    });

    // Fontes variáveis carregam de forma assíncrona e podem alterar a altura
    // do texto depois que o ScrollTrigger já mediu as posições. Em vez de
    // adiar toda a configuração (o que pode nunca disparar, dependendo da
    // ordem de resolução da promise em relação ao StrictMode), refazemos
    // só a medição quando as fontes terminarem de carregar.
    document.fonts?.ready?.then(() => ScrollTrigger.refresh());

    return () => ctx.revert();
  }, []);
}
