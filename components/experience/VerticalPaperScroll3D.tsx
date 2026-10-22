"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { RedPushPin } from "@/components/ui/RedPushPin";
import { archiveDate, type ArchiveEntry } from "@/lib/experience/archive-data";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface VerticalPaperScroll3DProps {
  entry: ArchiveEntry;
  className?: string;
}

/**
 * Creates high-resolution canvas texture for the front of the memo card.
 */
function createFrontTexture(entry: ArchiveEntry): HTMLCanvasElement {
  const size = 1400;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  // 1. Warm ivory paper background
  const grad = ctx.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0, "#faf6ee");
  grad.addColorStop(0.5, "#f4ede3");
  grad.addColorStop(1, "#ece2d4");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // 2. Paper grain noise
  ctx.fillStyle = "rgba(100, 80, 60, 0.022)";
  for (let i = 0; i < 5000; i++) {
    ctx.fillRect(Math.random() * size, Math.random() * size, Math.random() * 2 + 1, Math.random() * 2 + 1);
  }

  // 3. Notebook ruled lines
  const lineSpacing = 48;
  const lineStartY = 175;
  ctx.strokeStyle = "rgba(34, 44, 53, 0.055)";
  ctx.lineWidth = 1.8;
  for (let y = lineStartY; y < size - 150; y += lineSpacing) {
    ctx.beginPath();
    ctx.moveTo(90, y);
    ctx.lineTo(size - 90, y);
    ctx.stroke();
  }

  // 4. Header: Date and Time
  const dateFormatted = archiveDate(entry.date, true);
  ctx.fillStyle = "#575c5f";
  ctx.font = "600 32px Newsreader, Georgia, serif";
  ctx.letterSpacing = "0.14em";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(dateFormatted.toUpperCase(), 105, 120);

  ctx.textAlign = "right";
  ctx.font = "500 32px 'SF Mono', Consolas, monospace";
  ctx.fillText(entry.time, size - 105, 120);

  // 5. Body Text (Quote)
  ctx.fillStyle = "#1c242c";
  ctx.font = "400 64px Newsreader, Georgia, serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.letterSpacing = "-0.025em";

  const quoteText = `“${entry.text}”`;
  const maxWidth = size - 210;
  const lineHeight = 86;
  const startX = 105;
  const startY = 265;

  const words = quoteText.split(" ");
  let currentLine = "";
  let currentY = startY;

  for (let i = 0; i < words.length; i++) {
    const testLine = currentLine + (currentLine ? " " : "") + words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine !== "") {
      ctx.fillText(currentLine, startX, currentY);
      currentLine = words[i];
      currentY += lineHeight;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    ctx.fillText(currentLine, startX, currentY);
  }

  // 6. Thin Divider Line before footer
  const footerDividerY = size - 180;
  ctx.strokeStyle = "rgba(34, 44, 53, 0.16)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(105, footerDividerY);
  ctx.lineTo(size - 105, footerDividerY);
  ctx.stroke();

  // 7. Footer Metadata
  ctx.fillStyle = "#575c5f";
  ctx.font = "600 28px Newsreader, Georgia, serif";
  ctx.letterSpacing = "0.12em";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("FROM AN ORIGINAL SAMPLE NOTE", 105, size - 120);

  ctx.textAlign = "right";
  ctx.font = "400 38px sans-serif";
  ctx.fillText("↗", size - 105, size - 120);

  return canvas;
}

/**
 * Creates high-resolution canvas texture for the back of the memo (warm kraft paper).
 */
function createBackTexture(): HTMLCanvasElement {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, "#ebd9be");
  grad.addColorStop(0.5, "#decbb1");
  grad.addColorStop(1, "#cca78b");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = "rgba(100, 75, 50, 0.06)";
  for (let i = 0; i < 2500; i++) {
    ctx.fillRect(Math.random() * size, Math.random() * size, Math.random() * 2 + 1, 1);
  }

  return canvas;
}

/**
 * GLSL Vertex Shader: Authentic 3D Diagonal Corner Paper Curl (Bottom-Right Dog-Ear).
 * The bottom-right corner curls up towards the viewer in true 3D space.
 * As uProgress goes from 0.0 -> 1.0, the curl smoothly unfolds until completely flat and lancip!
 */
const VERTEX_SHADER = `
uniform float uProgress;    // 0.0 (curled) -> 1.0 (flat sharp corner)
uniform float uMaxCurl;     // maximum curl distance from bottom-right corner
uniform float uRadius;      // curl cylinder radius
uniform vec2 uPlaneSize;    // plane width and height

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vCurlFactor;
varying float vShadow;

const float PI = 3.14159265358979323846;

void main() {
    vUv = uv;
    vec3 pos = position;

    float halfW = uPlaneSize.x * 0.5;
    float halfH = uPlaneSize.y * 0.5;

    // Bottom-right corner coordinates: (halfW, -halfH)
    // Distance from bottom-right corner along the 45-degree diagonal:
    // (halfW - pos.x) is distance inward from right edge
    // (pos.y - (-halfH)) is distance inward from bottom edge
    float dist = ((halfW - pos.x) + (pos.y + halfH)) * 0.70710678;

    // Fold line moves towards corner as uProgress goes 0.0 -> 1.0:
    float p = clamp(uProgress, 0.0, 1.0);
    float L = uMaxCurl * (1.0 - p);

    // Distance beyond the fold line towards the corner:
    float s = L - dist;

    vec3 norm = vec3(0.0, 0.0, 1.0);
    float curlFactor = 0.0;
    float shadow = 0.0;

    if (L > 0.002) {
        if (s > 0.0) {
            float R = uRadius;
            float pitch = 0.005; // slight spiral expansion so overlapping paper doesn't z-fight
            float phi = s / R;
            float rEff = R + pitch * phi;

            // Fold line diagonal: along (-1/sqrt(2), 1/sqrt(2))
            // Perpendicular towards bottom-right: (1/sqrt(2), -1/sqrt(2))
            float deltaP = s - rEff * sin(phi);

            pos.x -= deltaP * 0.70710678;
            pos.y += deltaP * 0.70710678;
            pos.z += rEff * (1.0 - cos(phi));

            // Surface normal rotates around fold axis:
            vec2 normXY = -sin(phi) * vec2(0.70710678, -0.70710678);
            norm = normalize(vec3(normXY, cos(phi)));
            curlFactor = clamp(phi / PI, 0.0, 1.0);
        } else if (s > -0.22) {
            // Drop shadow cast on the flat paper right beneath the curled flap
            float shadowDist = -s;
            shadow = (1.0 - shadowDist / 0.22) * 0.45 * (L / uMaxCurl);
        }
    }

    vNormal = normalize(normalMatrix * norm);
    vPosition = (modelViewMatrix * vec4(pos, 1.0)).xyz;
    vCurlFactor = curlFactor;
    vShadow = shadow;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

/**
 * GLSL Fragment Shader: Double-sided shading with ambient occlusion and specular ridge highlight.
 */
const FRAGMENT_SHADER = `
uniform sampler2D uFrontTexture;
uniform sampler2D uBackTexture;
uniform float uProgress;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vCurlFactor;
varying float vShadow;

void main() {
    bool isFront = gl_FrontFacing;
    vec4 texColor;

    if (isFront) {
        texColor = texture2D(uFrontTexture, vUv);
    } else {
        texColor = texture2D(uBackTexture, vUv);
        texColor.rgb *= vec3(0.96, 0.93, 0.88);
    }

    vec3 N = normalize(vNormal);
    if (!isFront) {
        N = -N;
    }

    // Key light from top-left
    vec3 L = normalize(vec3(-0.35, 0.65, 0.75));
    float diff = max(dot(N, L), 0.0);

    // Specular reflection along the curved fold ridge
    vec3 V = normalize(-vPosition);
    vec3 H = normalize(L + V);
    float spec = pow(max(dot(N, H), 0.0), 28.0) * 0.32;

    // Contact drop shadow on base paper under curl
    float shadowFactor = 1.0 - vShadow;

    vec3 ambient = vec3(0.80, 0.78, 0.76);
    vec3 light = ambient + vec3(0.32) * diff + vec3(spec);

    gl_FragColor = vec4(texColor.rgb * light * shadowFactor, texColor.a);
}
`;

export function VerticalPaperScroll3D({ entry, className = "" }: VerticalPaperScroll3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setIsSupported(false);
      return;
    }

    // 1. Scene, Camera, Renderer
    const width = container.clientWidth || 440;
    const height = container.clientHeight || 460;
    const aspect = width / height;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      setIsSupported(false);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, aspect, 0.1, 100);
    camera.position.set(0, 0, 4.4);

    // 2. High-res dynamic canvas textures
    const frontCanvas = createFrontTexture(entry);
    const backCanvas = createBackTexture();

    const frontTexture = new THREE.CanvasTexture(frontCanvas);
    frontTexture.colorSpace = THREE.SRGBColorSpace;
    frontTexture.generateMipmaps = true;
    frontTexture.minFilter = THREE.LinearMipmapLinearFilter;

    const backTexture = new THREE.CanvasTexture(backCanvas);
    backTexture.colorSpace = THREE.SRGBColorSpace;
    backTexture.generateMipmaps = true;

    // Redraw front texture once custom fonts (Newsreader) are ready
    if (typeof document !== "undefined" && document.fonts) {
      void document.fonts.ready.then(() => {
        const refreshedFront = createFrontTexture(entry);
        frontTexture.image = refreshedFront;
        frontTexture.needsUpdate = true;
      });
    }

    // 3. Geometry (96x96 subdivisions for smooth corner roll)
    const planeW = 2.4;
    const planeH = planeW / aspect;
    const geometry = new THREE.PlaneGeometry(planeW, planeH, 96, 96);

    // 4. Custom Shader Material: 3D Corner Paper Curl
    const uniforms = {
      uProgress: { value: 0.0 }, // 0.0 = corner curled, 1.0 = completely flat & lancip
      uMaxCurl: { value: 0.68 }, // corner curl reach (~28% of card width)
      uRadius: { value: 0.13 },  // curl cylinder radius
      uPlaneSize: { value: new THREE.Vector2(planeW, planeH) },
      uFrontTexture: { value: frontTexture },
      uBackTexture: { value: backTexture },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms,
      side: THREE.DoubleSide,
      transparent: true,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // 5. GSAP ScrollTrigger Integration:
    // When the note enters the viewport (top 85%), corner is curled.
    // As user scrolls to center 40%, the corner smoothly uncurls to sharp 90-degree corner!
    const trigger = ScrollTrigger.create({
      trigger: container,
      start: "top 85%",
      end: "center 40%",
      scrub: 1.0,
      onUpdate: (self) => {
        uniforms.uProgress.value = self.progress;
      },
    });

    // 6. Interactive micro-tilt on mouse move
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX = x;
      mouseY = y;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });

    // 7. Animation Loop
    let animationFrameId: number;
    const render = () => {
      animationFrameId = requestAnimationFrame(render);

      targetRotX += (-mouseY * 0.08 - targetRotX) * 0.08;
      targetRotY += (mouseX * 0.1 - targetRotY) * 0.08;
      mesh.rotation.x = targetRotX;
      mesh.rotation.y = targetRotY;

      renderer.render(scene, camera);
    };
    render();

    // 8. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || 440;
      const newH = container.clientHeight || 460;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      trigger.kill();
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", handleResize);

      geometry.dispose();
      material.dispose();
      frontTexture.dispose();
      backTexture.dispose();
      renderer.dispose();

      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [entry]);

  return (
    <div className={`lm-paper-3d-wrapper relative w-full ${className}`}>
      {/* Red Push Pin on top center, strictly preserved */}
      <RedPushPin className="lm-retrieved-note-pin" />

      {/* 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        className="lm-paper-3d-canvas-container relative w-full aspect-[4/4.4] sm:aspect-[4/4.2] overflow-visible"
        style={{ filter: "drop-shadow(0 22px 38px rgba(0,0,0,0.45)) drop-shadow(0 4px 12px rgba(0,0,0,0.25))" }}
      />

      {/* Fallback for when WebGL is unsupported or reduced motion is active */}
      {!isSupported && (
        <div className="lm-retrieved-note-paper">
          <div className="lm-meta">
            <time dateTime={entry.date}>{archiveDate(entry.date, true)}</time>
            <span>{entry.time}</span>
          </div>
          <p>“{entry.text}”</p>
          <div className="lm-meta lm-retrieved-source">
            <span>FROM AN ORIGINAL SAMPLE NOTE</span>
            <span aria-hidden="true">↗</span>
          </div>
        </div>
      )}

      {/* Screen reader accessible representation of the note */}
      <div className="sr-only">
        <time dateTime={entry.date}>{archiveDate(entry.date, true)}</time>
        <span>{entry.time}</span>
        <p>“{entry.text}”</p>
        <span>FROM AN ORIGINAL SAMPLE NOTE</span>
      </div>
    </div>
  );
}
