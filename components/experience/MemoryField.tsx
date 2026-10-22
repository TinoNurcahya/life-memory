"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "@/lib/experience/theme-context";
import { EXPERIENCE_CONFIG } from "@/lib/experience/config";

export function MemoryField() {
  const containerRef = useRef<HTMLDivElement>(null);
  const materialsRef = useRef<{
    points: THREE.PointsMaterial;
    lines: THREE.LineBasicMaterial;
  } | null>(null);
  const { theme } = useTheme();
  const themeRef = useRef(theme);

  useEffect(() => {
    themeRef.current = theme;
    const materials = materialsRef.current;
    if (!materials) return;
    // Both archive palettes contain blue night scenes; keep their field legible.
    const colors = EXPERIENCE_CONFIG.theme.dark;
    materials.points.color.set(colors.pointColor);
    materials.points.opacity = theme === "dark" ? 0.65 : 0.45;
    materials.lines.opacity = theme === "dark" ? 0.12 : 0.08;
  }, [theme]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const isEnabled = () => desktopQuery.matches && !motionQuery.matches;
    const activeScenes = new Set<Element>();
    let renderer: THREE.WebGLRenderer | undefined;
    let scene: THREE.Scene | undefined;
    let camera: THREE.PerspectiveCamera | undefined;
    let pointGeometry: THREE.BufferGeometry | undefined;
    let lineGeometry: THREE.BufferGeometry | undefined;
    let pointMaterial: THREE.PointsMaterial | undefined;
    let lineMaterial: THREE.LineBasicMaterial | undefined;
    let frameId: number | null = null;
    let lastFrameTime = 0;
    let failed = false;
    let disposed = false;
    let observer: IntersectionObserver | undefined;
    let scrollY = window.scrollY;
    const nodeCount = EXPERIENCE_CONFIG.webgl.desktopNodeCount;
    const positions = new Float32Array(nodeCount * 3);
    const velocities = new Float32Array(nodeCount * 3);
    // At most 100 connections are drawn, so don't allocate an N-squared buffer.
    const linePositions = new Float32Array(100 * 6);

    const stop = () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      frameId = null;
      lastFrameTime = 0;
    };

    const disposeGraphics = () => {
      stop();
      renderer?.domElement.removeEventListener("webglcontextlost", handleContextLost);
      pointGeometry?.dispose();
      lineGeometry?.dispose();
      pointMaterial?.dispose();
      lineMaterial?.dispose();
      renderer?.dispose();
      renderer?.forceContextLoss();
      renderer?.domElement.remove();
      renderer = undefined;
      scene = undefined;
      camera = undefined;
      pointGeometry = undefined;
      lineGeometry = undefined;
      pointMaterial = undefined;
      lineMaterial = undefined;
      materialsRef.current = null;
    };

    function handleContextLost(event: Event) {
      event.preventDefault();
      failed = true;
      disposeGraphics();
    }

    const resize = () => {
      if (!renderer || !camera) return;
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, EXPERIENCE_CONFIG.webgl.pixelRatio));
      renderer.setSize(width, height);
    };

    const initialize = () => {
      if (renderer || failed || disposed) return;
      try {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
        camera.position.z = 24;
        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: false,
          powerPreference: "low-power",
        });
        renderer.domElement.addEventListener("webglcontextlost", handleContextLost);
        container.appendChild(renderer.domElement);

        for (let i = 0; i < nodeCount; i++) {
          positions[i * 3] = (Math.random() - 0.5) * 38;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 26;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 18;
          velocities[i * 3] = (Math.random() - 0.5) * 0.005;
          velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.005;
          velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.004;
        }

        pointGeometry = new THREE.BufferGeometry();
        pointGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        pointMaterial = new THREE.PointsMaterial({
          color: EXPERIENCE_CONFIG.theme.dark.pointColor,
          size: 0.15,
          transparent: true,
          opacity: themeRef.current === "dark" ? 0.65 : 0.45,
          depthWrite: false,
        });
        scene.add(new THREE.Points(pointGeometry, pointMaterial));

        lineGeometry = new THREE.BufferGeometry();
        lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
        lineGeometry.setDrawRange(0, 0);
        lineMaterial = new THREE.LineBasicMaterial({
          color: EXPERIENCE_CONFIG.theme.dark.lineColor,
          transparent: true,
          opacity: themeRef.current === "dark" ? 0.12 : 0.08,
          depthWrite: false,
        });
        scene.add(new THREE.LineSegments(lineGeometry, lineMaterial));
        materialsRef.current = { points: pointMaterial, lines: lineMaterial };
        resize();
      } catch {
        failed = true;
        disposeGraphics();
      }
    };

    const animate = (time: number) => {
      frameId = null;
      if (disposed || document.hidden || !isEnabled() || activeScenes.size === 0) return;
      if (!renderer || !scene || !camera || !pointGeometry || !lineGeometry) return;
      frameId = requestAnimationFrame(animate);
      if (lastFrameTime && time - lastFrameTime < 33) return;
      const delta = lastFrameTime ? Math.min((time - lastFrameTime) / 33, 2) : 1;
      lastFrameTime = time;

      for (let i = 0; i < nodeCount; i++) {
        const offset = i * 3;
        positions[offset] += velocities[offset] * delta;
        positions[offset + 1] += velocities[offset + 1] * delta;
        positions[offset + 2] += velocities[offset + 2] * delta;
        if (Math.abs(positions[offset]) > 20) velocities[offset] *= -1;
        if (Math.abs(positions[offset + 1]) > 14) velocities[offset + 1] *= -1;
        if (Math.abs(positions[offset + 2]) > 10) velocities[offset + 2] *= -1;
      }
      (pointGeometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;

      // Bounded camera movement keeps the atmosphere visible deep into the page.
      camera.position.y = Math.sin(scrollY * 0.00015) * 1.5;
      camera.rotation.z = Math.sin(scrollY * 0.0001) * 0.04;
      let cursor = 0;
      const maxDistanceSquared = EXPERIENCE_CONFIG.webgl.connectionDistance ** 2;
      for (let i = 0; i < nodeCount && cursor < linePositions.length; i++) {
        for (let j = i + 1; j < nodeCount && cursor < linePositions.length; j++) {
          const dx = positions[i * 3] - positions[j * 3];
          const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
          const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
          if (dx * dx + dy * dy + dz * dz >= maxDistanceSquared) continue;
          linePositions[cursor++] = positions[i * 3];
          linePositions[cursor++] = positions[i * 3 + 1];
          linePositions[cursor++] = positions[i * 3 + 2];
          linePositions[cursor++] = positions[j * 3];
          linePositions[cursor++] = positions[j * 3 + 1];
          linePositions[cursor++] = positions[j * 3 + 2];
        }
      }
      lineGeometry.setDrawRange(0, cursor / 3);
      (lineGeometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      try {
        renderer.render(scene, camera);
      } catch {
        failed = true;
        disposeGraphics();
      }
    };

    const syncVisibility = () => {
      const visible = isEnabled() && activeScenes.size > 0 && !document.hidden;
      container.style.opacity = visible ? "1" : "0";
      if (!visible) {
        // Preference changes can also reach us through a layout/observer refresh.
        // Release GPU resources on every disabled path, not only the media event.
        if (!isEnabled()) disposeGraphics();
        else stop();
        return;
      }
      initialize();
      if (renderer && frameId === null) frameId = requestAnimationFrame(animate);
    };

    const syncPreference = () => {
      container.style.transition = isEnabled() ? "opacity 500ms ease-out" : "none";
      if (!isEnabled()) disposeGraphics();
      syncVisibility();
    };
    const handleScroll = () => { scrollY = window.scrollY; };
    // Activate only when a designated night chapter crosses the viewport center.
    const observeChapters = () => {
      observer?.disconnect();
      activeScenes.clear();
      // Vertical percentage margins use viewport width in IntersectionObserver.
      const margin = Math.floor(window.innerHeight * 0.45);
      observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) activeScenes.add(entry.target);
          else activeScenes.delete(entry.target);
        }
        syncVisibility();
      }, { rootMargin: `-${margin}px 0px -${margin}px 0px`, threshold: 0 });
      document.querySelectorAll(".memory-archive [data-memory-field]").forEach((chapter) => {
        observer?.observe(chapter);
      });
      syncVisibility();
    };
    const handleResize = () => {
      resize();
      observeChapters();
    };
    observeChapters();

    desktopQuery.addEventListener("change", syncPreference);
    motionQuery.addEventListener("change", syncPreference);
    document.addEventListener("visibilitychange", syncVisibility);
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      disposed = true;
      observer?.disconnect();
      desktopQuery.removeEventListener("change", syncPreference);
      motionQuery.removeEventListener("change", syncPreference);
      document.removeEventListener("visibilitychange", syncVisibility);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      disposeGraphics();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="memory-field fixed inset-0 pointer-events-none z-0"
      style={{
        opacity: 0,
        transition: "opacity 500ms ease-out",
        background: "radial-gradient(ellipse at 60% 40%, rgba(120,147,208,0.1), transparent 65%)",
      }}
      aria-hidden="true"
    />
  );
}
