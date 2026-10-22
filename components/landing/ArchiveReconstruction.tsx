"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ARCHIVE_SAMPLE_NOTE } from "@/lib/experience/archive-data";
import "./reconstruction.css";

const STEPS = ["The fragment", "The details", "The connections", "The meaning"];

const ENTITIES = [
  { kind: "Person", label: "Amy", x: 195, y: 100, width: 142 },
  { kind: "Place", label: "A small café", x: 680, y: 104, width: 218 },
  { kind: "Moment", label: "Shared cake", x: 210, y: 335, width: 148 },
  { kind: "Detail", label: "A rainy day", x: 681, y: 333, width: 218 },
];

function RelationshipMap() {
  return (
    <div className="lm-reconstruction__map">
      <svg viewBox="0 0 900 440" className="lm-reconstruction__graph" role="img" aria-labelledby="archive-map-title">
        <title id="archive-map-title">One note connects you with Amy, a small café, shared cake, and a rainy day.</title>
        <g className="lm-reconstruction__orbits" aria-hidden="true">
          <ellipse cx="450" cy="220" rx="322" ry="168" />
          <circle cx="450" cy="220" r="111" />
          <path d="M450 22V418M48 220H852" />
        </g>
        <g className="lm-reconstruction__edges" aria-hidden="true">
          {ENTITIES.map((entity) => (
            <path key={entity.kind} d={`M450 220 Q${entity.x} 220 ${entity.x} ${entity.y}`} pathLength="1" data-graph-edge />
          ))}
        </g>
        <g transform="translate(450 220)">
          <g data-graph-node className="lm-reconstruction__graph-center">
            <circle r="48" />
            <text textAnchor="middle" y="7">You</text>
          </g>
        </g>
        {ENTITIES.map((entity) => (
          <g key={entity.kind} transform={`translate(${entity.x} ${entity.y})`}>
            <g data-graph-node className="lm-reconstruction__graph-node">
              <rect x={-entity.width / 2} y="-36" width={entity.width} height="72" rx="2" />
              <text className="lm-reconstruction__graph-kind" textAnchor="middle" y="-8">{entity.kind}</text>
              <text className="lm-reconstruction__graph-label" textAnchor="middle" y="17">{entity.label}</text>
            </g>
          </g>
        ))}
      </svg>
      <ul className="lm-reconstruction__mobile-entities" aria-label="Details connected to you">
        {ENTITIES.map((entity) => (
          <li key={entity.kind}><span>{entity.kind}</span><strong>{entity.label}</strong></li>
        ))}
      </ul>
    </div>
  );
}

export function ArchiveReconstruction() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia(section);
    const context = gsap.context(() => {
      media.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const stage = section.querySelector<HTMLElement>(".lm-reconstruction__stage");
        const panels = gsap.utils.toArray<HTMLElement>("[data-reconstruction-panel]", section);
        const progress = gsap.utils.toArray<HTMLElement>("[data-reconstruction-progress]", section);
        if (!stage || panels.length !== 4) return;

        // Restore the static document exactly when motion or the breakpoint changes.
        const animatedElements = Array.from(section.querySelectorAll<HTMLElement | SVGElement>(
          "[data-reconstruction-panel], [data-graph-node], [data-graph-edge], .lm-reconstruction__entity-mark",
        )).map((element) => ({ element, style: element.getAttribute("style"), transform: element.getAttribute("transform") }));

        section.classList.add("is-pinned");
        gsap.set(panels.slice(1), { autoAlpha: 0, y: 35 });
        gsap.set("[data-graph-edge]", { strokeDasharray: 1, strokeDashoffset: 1 });
        gsap.set("[data-graph-node]", { autoAlpha: 0, scale: 0.8, transformOrigin: "50% 50%" });

        let currentStep = -1;
        const setCurrentStep = (index: number) => {
          if (currentStep === index) return;
          currentStep = index;
          progress.forEach((item, itemIndex) => {
            item.classList.toggle("is-current", itemIndex === index);
            if (itemIndex === index) item.setAttribute("aria-current", "step");
            else item.removeAttribute("aria-current");
          });
        };
        const syncCurrentStep = (time: number) => {
          setCurrentStep(time < 0.95 ? 0 : time < 1.95 ? 1 : time < 3.05 ? 2 : 3);
        };

        const timeline = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: {
            trigger: stage,
            start: "top top",
            end: () => `+=${window.innerHeight * 2}`,
            pin: true,
            scrub: 0.65,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onRefresh: (trigger) => {
              // Refresh can seek a scrubbed timeline with animation callbacks suppressed.
              syncCurrentStep(trigger.progress * (trigger.animation?.duration() ?? 0));
            },
          },
          onUpdate() {
            syncCurrentStep(this.time());
          },
        });

        timeline
          .to(panels[0], { autoAlpha: 0, y: -28, duration: 0.36 }, 0.72)
          .to(panels[1], { autoAlpha: 1, y: 0, duration: 0.42 }, 0.92)
          .fromTo(".lm-reconstruction__entity-mark", { backgroundColor: "rgba(161, 190, 228, 0)" }, { backgroundColor: "rgba(161, 190, 228, 0.17)", stagger: 0.07, duration: 0.3 }, 1.12)
          .to(panels[1], { autoAlpha: 0, y: -28, duration: 0.36 }, 1.74)
          .to(panels[2], { autoAlpha: 1, y: 0, duration: 0.36 }, 1.92)
          .to("[data-graph-node]", { autoAlpha: 1, scale: 1, stagger: 0.07, duration: 0.42 }, 2.02)
          .to("[data-graph-edge]", { strokeDashoffset: 0, stagger: 0.07, duration: 0.65, ease: "none" }, 2.05)
          .to(panels[2], { autoAlpha: 0, y: -22, duration: 0.36 }, 2.84)
          .to(panels[3], { autoAlpha: 1, y: 0, duration: 0.52 }, 3.02)
          .to({}, { duration: 0.58 }, 3.54);

        // A restored scroll position can already be beyond the last panel.
        syncCurrentStep(timeline.time());
        let alive = true;
        document.fonts.ready.then(() => {
          if (alive) ScrollTrigger.refresh();
        });

        return () => {
          alive = false;
          section.classList.remove("is-pinned");
          animatedElements.forEach(({ element, style, transform }) => {
            if (style === null) element.removeAttribute("style");
            else element.setAttribute("style", style);
            if (transform === null) element.removeAttribute("transform");
            else element.setAttribute("transform", transform);
          });
          progress.forEach((item) => {
            item.classList.remove("is-current");
            item.removeAttribute("aria-current");
          });
        };
      });
    }, section);

    return () => {
      media.revert();
      context.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} id="reconstruction" className="lm-chapter lm-ink lm-reconstruction" aria-labelledby="archive-reconstruction-heading" data-memory-field>
      <div className="lm-reconstruction__stage">
        <div className="lm-container lm-reconstruction__inner">
          <header className="lm-reconstruction__header">
            <div>
              <p className="lm-kicker">From fragments to meaning</p>
              <h2 id="archive-reconstruction-heading" className="lm-title">A sentence.<br /><em>A whole world.</em></h2>
            </div>
            <p className="lm-copy lm-reconstruction__introduction">A person. A place. A passing thought.<br />The details were there all along.</p>
          </header>

          <ol className="lm-reconstruction__progress" aria-label="How a memory takes shape">
            {STEPS.map((step, index) => (
              <li key={step} data-reconstruction-progress>
                <span>{step}</span>
                <i aria-hidden="true" />
              </li>
            ))}
          </ol>

          <div className="lm-reconstruction__panels">
            <article className="lm-reconstruction__panel lm-reconstruction__fragment" data-reconstruction-panel>
              <h3 className="lm-reconstruction__step-heading">The fragment</h3>
              <div className="lm-reconstruction__note">
                <div className="lm-reconstruction__note-meta"><span>A note to remember</span><time dateTime="2026-10-03">03 Oct 2026</time></div>
                <blockquote>{ARCHIVE_SAMPLE_NOTE}</blockquote>
                <span className="lm-reconstruction__note-foot">Saved in a moment. Kept for a lifetime.</span>
              </div>
              <p className="lm-reconstruction__caption">It begins with something you almost didn’t write down.</p>
            </article>

            <article className="lm-reconstruction__panel lm-reconstruction__details" data-reconstruction-panel>
              <h3 className="lm-reconstruction__step-heading">The details</h3>
              <p className="lm-reconstruction__annotated-note">Met <mark className="lm-reconstruction__entity-mark">Amy</mark> at <mark className="lm-reconstruction__entity-mark">a small café.</mark> We shared <mark className="lm-reconstruction__entity-mark">a slice of cake</mark> and waited for <mark className="lm-reconstruction__entity-mark">the rain to stop.</mark></p>
              <ul className="lm-reconstruction__entity-key" aria-label="Details in this note">
                {ENTITIES.map((entity) => <li key={entity.kind}><span aria-hidden="true" />{entity.kind}</li>)}
              </ul>
              <p className="lm-reconstruction__caption">Ordinary words hold the people, places, and interests in your life.</p>
            </article>

            <article className="lm-reconstruction__panel lm-reconstruction__connections" data-reconstruction-panel>
              <h3 className="lm-reconstruction__step-heading">The connections</h3>
              <RelationshipMap />
              <p className="lm-reconstruction__caption">One small memory. More than one way back to it.</p>
            </article>

            <article className="lm-reconstruction__panel lm-reconstruction__meaning" data-reconstruction-panel>
              <h3 className="lm-reconstruction__step-heading">The meaning</h3>
              <span className="lm-reconstruction__meaning-symbol" aria-hidden="true">✳</span>
              <p className="lm-reconstruction__meaning-title">It wasn’t just<br /><em>a coffee.</em></p>
              <p className="lm-reconstruction__meaning-copy">It was time with Amy. A small conversation, a shared slice of cake, and a rainy evening that now has a place in your story.</p>
              <p className="lm-reconstruction__source">One note · Four details · A memory you can return to</p>
            </article>
          </div>

          <footer className="lm-reconstruction__footer">
            <span>Illustrative archive · October 2026</span>
            <span className="lm-reconstruction__scroll-hint">Scroll to find the connections <span aria-hidden="true">↓</span></span>
          </footer>
        </div>
      </div>
    </section>
  );
}
