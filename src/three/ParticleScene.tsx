"use client";

/**
 * "Signal" : ta VRAIE photo, en 3D, vivante.
 *  - La photo détourée est plaquée sur un maillage déformé par une carte de profondeur
 *    (générée par IA, MiDaS) : elle a du relief et tourne légèrement avec la souris.
 *  - Elle respire, un faisceau de "scan" la parcourt, un liseré lumineux souligne la silhouette,
 *    et quelques particules s'en échappent comme des données.
 *  - Au défilement, la photo se dissout en ~30 000 particules qui deviennent
 *    un nuage de clusters (explorer), un réseau de neurones (modéliser), puis des barres (décider).
 * La photo n'existe dans la page que sous forme de texture WebGL (pas de balise <img> à enregistrer).
 */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { accent } from "@/lib/accent";

export type SceneState = {
  stage: number; // 0..3, lissé côté appelant
  mouse: { x: number; y: number }; // NDC -1..1 (9 = hors écran)
  intro: number; // 0..1
};

export type Attributes = Record<"portrait" | "scatter" | "network" | "bars" | "noise" | "color", Float32Array> & {
  rand: Float32Array;
  count: number;
  photo: HTMLImageElement;
  depth: HTMLImageElement;
  size: [number, number]; // largeur, hauteur du portrait en unités 3D
};

const H = 4.4; // hauteur du portrait (unités 3D)
const DEPTH = 0.9; // relief maximal

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function gauss(r: () => number) {
  return Math.sqrt(-2 * Math.log(Math.max(r(), 1e-9))) * Math.cos(2 * Math.PI * r());
}
async function loadImage(src: string) {
  const img = new Image();
  img.decoding = "async";
  img.src = src;
  await img.decode();
  return img;
}
function pixels(img: HTMLImageElement, w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d", { willReadFrequently: true })!;
  g.drawImage(img, 0, 0, w, h);
  return g.getImageData(0, 0, w, h).data;
}

/** Charge la photo + la profondeur et calcule toutes les positions cibles des particules */
export async function buildAttributes(photoSrc: string, depthSrc: string, rows: number): Promise<Attributes> {
  const [photo, depth] = await Promise.all([loadImage(photoSrc), loadImage(depthSrc)]);
  const h = rows;
  const w = Math.round((photo.width / photo.height) * h);
  const px = pixels(photo, w, h);
  const dp = pixels(depth, w, h);
  const W = (photo.width / photo.height) * H;

  const pos: number[] = [];
  const col: number[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (px[i + 3] < 140) continue;
      const d = dp[i] / 255;
      pos.push(((x + 0.5) / w - 0.5) * W, (0.5 - (y + 0.5) / h) * H, d * DEPTH - DEPTH * 0.3);
      const lift = 0.12;
      col.push(
        Math.min(1, lift + Math.pow(px[i] / 255, 0.7) * 1.15),
        Math.min(1, lift + Math.pow(px[i + 1] / 255, 0.7) * 1.15),
        Math.min(1, lift + Math.pow(px[i + 2] / 255, 0.7) * 1.15),
      );
    }
  }
  const count = pos.length / 3;
  const rand = mulberry32(1307);
  const R = new Float32Array(count);
  const scatter = new Float32Array(count * 3);
  const network = new Float32Array(count * 3);
  const bars = new Float32Array(count * 3);
  const noise = new Float32Array(count * 3);

  const centers = [
    [-1.3, 0.7, -0.4],
    [1.2, 1.0, 0.5],
    [0.2, -1.0, 0.8],
    [1.5, -0.6, -1.0],
  ];
  const layers = [5, 8, 8, 3];
  const lx = [-2.1, -0.7, 0.7, 2.1];
  const nodes = layers.map((n, l) => Array.from({ length: n }, (_, k) => [lx[l], ((k - (n - 1) / 2) / Math.max(n - 1, 1)) * 3.2, 0]));
  const edges: [number[], number[]][] = [];
  for (let l = 0; l < layers.length - 1; l++) for (const a of nodes[l]) for (const b of nodes[l + 1]) edges.push([a, b]);
  const allNodes = nodes.flat();
  const nb = 9;
  const heights = Array.from({ length: nb }, (_, j) => 0.7 + j * 0.3 + (j % 3 === 1 ? -0.35 : 0) + (j === nb - 1 ? 0.4 : 0));

  for (let i = 0; i < count; i++) {
    R[i] = rand();
    const o = i * 3;
    if (rand() < 0.08) {
      scatter.set([(rand() - 0.5) * 4.4, (rand() - 0.5) * 3.6, (rand() - 0.5) * 3], o);
    } else {
      const c0 = centers[i % centers.length];
      scatter.set([c0[0] + gauss(rand) * 0.33, c0[1] + gauss(rand) * 0.33, c0[2] + gauss(rand) * 0.33], o);
    }
    if (rand() < 0.32) {
      const n = allNodes[Math.floor(rand() * allNodes.length)];
      network.set([n[0] + gauss(rand) * 0.06, n[1] + gauss(rand) * 0.06, n[2] + gauss(rand) * 0.06], o);
    } else {
      const [a, b] = edges[Math.floor(rand() * edges.length)];
      const t = rand();
      network.set([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t + gauss(rand) * 0.008, gauss(rand) * 0.02], o);
    }
    const j = Math.floor(rand() * nb);
    const bx = -2.4 + (j / (nb - 1)) * 4.8;
    const bh = heights[j];
    const face = rand();
    const u = rand() - 0.5;
    const v = rand();
    const half = 0.17;
    let p: number[];
    if (face < 0.4) p = [bx + u * 2 * half, -1.7 + v * bh, half];
    else if (face < 0.7) p = [bx + (rand() < 0.5 ? -half : half), -1.7 + v * bh, u * 2 * half];
    else if (face < 0.85) p = [bx + u * 2 * half, -1.7 + bh, (rand() - 0.5) * 2 * half];
    else p = [bx + u * 2 * half, -1.7 + v * bh, -half];
    bars.set(p, o);
    const th = rand() * Math.PI * 2;
    const ph = Math.acos(2 * rand() - 1);
    const rr = 3 + rand() * 5;
    noise.set([rr * Math.sin(ph) * Math.cos(th), rr * Math.sin(ph) * Math.sin(th), rr * Math.cos(ph)], o);
  }
  return {
    portrait: new Float32Array(pos),
    color: new Float32Array(col),
    scatter,
    network,
    bars,
    noise,
    rand: R,
    count,
    photo,
    depth,
    size: [W, H],
  };
}

/* ---------------------------------------------------------------- Photo 3D */

const portraitVertex = /* glsl */ `
uniform sampler2D uDepth;
uniform float uTime;
uniform float uDepthAmt;
varying vec2 vUv;
void main() {
  vUv = uv;
  float d = texture2D(uDepth, uv).r;
  vec3 p = position;
  p.z += d * uDepthAmt - uDepthAmt * 0.3;
  p.y += sin(uTime * 1.1) * 0.012 * d;      // respiration
  p.x += sin(uTime * 0.7 + uv.y * 3.0) * 0.004 * d;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`;

const portraitFragment = /* glsl */ `
uniform sampler2D uMap;
uniform float uTime;
uniform float uDissolve;
uniform vec3 uAccent;
uniform vec2 uMouseUv;
varying vec2 vUv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}

void main() {
  vec4 c = texture2D(uMap, vUv);
  if (c.a < 0.05) discard;
  // Étalonnage "éditorial" : la photo se fond dans le noir du site au lieu de poser comme un portrait officiel
  vec3 col = c.rgb;
  float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = mix(vec3(lum), col, 0.62);                              // couleurs adoucies (costume moins présent)
  vec3 duo = mix(vec3(0.015), mix(uAccent * 0.45, vec3(0.95, 0.93, 0.9), smoothstep(0.35, 0.95, lum)), smoothstep(0.0, 0.6, lum));
  col = mix(col, duo, 0.28);                                    // teinte de l'accent dans les ombres
  col = col * 1.22 + 0.025;                                     // exposition : le visage reste lisible
  col = (col - 0.5) * 1.08 + 0.5;                               // léger contraste
  col *= 0.92 + 0.08 * step(0.5, fract(gl_FragCoord.y * 0.5)); // trame fine (lignes)

  // Fondus : le bas et les côtés disparaissent dans le fond
  float fade = smoothstep(0.0, 0.42, vUv.y) * smoothstep(0.0, 0.12, vUv.x) * smoothstep(1.0, 0.88, vUv.x);

  // Liseré lumineux discret sur la silhouette
  float rim = smoothstep(0.95, 0.25, c.a);
  col += uAccent * rim * 0.35;

  // Faisceau de scan qui descend (avec grille de données dans la bande)
  float scanY = 1.15 - fract(uTime * 0.09) * 1.3;
  float band = smoothstep(0.045, 0.0, abs(vUv.y - scanY));
  vec2 g = abs(fract(vUv * vec2(64.0, 80.0)) - 0.5);
  float grid = step(0.44, max(g.x, g.y));
  col = mix(col, col * 0.7 + uAccent * 0.5, band * (0.08 + grid * 0.22));
  col += uAccent * smoothstep(0.003, 0.0, abs(vUv.y - scanY)) * 0.5;

  // Lumière qui suit la souris
  col += smoothstep(0.3, 0.0, distance(vUv, uMouseUv)) * 0.07;

  // Dissolution (intro et passage aux particules)
  float n = noise(vUv * 14.0) * 0.6 + noise(vUv * 48.0) * 0.4;
  float edge = uDissolve * 1.15 - 0.075;
  if (n < edge) discard;
  float glow = smoothstep(edge + 0.06, edge, n) * step(0.001, uDissolve);
  col = mix(col, uAccent * 1.7, glow);

  gl_FragColor = vec4(col, c.a * fade);
}
`;

function Portrait({ attrs, state }: { attrs: Attributes; state: React.RefObject<SceneState> }) {
  const [W] = attrs.size;
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const proxy = useRef<THREE.Mesh>(null);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const ndc = useRef(new THREE.Vector2());
  const color = useRef(new THREE.Color());
  const { camera } = useThree();

  const params = useMemo(() => {
    const map = new THREE.Texture(attrs.photo);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 4;
    map.needsUpdate = true;
    const depth = new THREE.Texture(attrs.depth);
    depth.needsUpdate = true;
    return {
      vertexShader: portraitVertex,
      fragmentShader: portraitFragment,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uMap: { value: map },
        uDepth: { value: depth },
        uTime: { value: 0 },
        uDepthAmt: { value: DEPTH },
        uDissolve: { value: 1 },
        uAccent: { value: new THREE.Color() },
        uMouseUv: { value: new THREE.Vector2(-9, -9) },
      },
    };
  }, [attrs]);

  const geometry = useMemo(() => new THREE.PlaneGeometry(W, H, 140, 170), [W]);
  useEffect(
    () => () => {
      geometry.dispose();
      params.uniforms.uMap.value.dispose();
      params.uniforms.uDepth.value.dispose();
    },
    [geometry, params],
  );

  useFrame(({ clock }) => {
    const mat = matRef.current;
    if (!mat) return;
    const s = state.current;
    const u = mat.uniforms;
    u.uTime.value = clock.elapsedTime;
    const introDissolve = 1 - THREE.MathUtils.smoothstep(s.intro, 0.4, 1);
    const stageDissolve = THREE.MathUtils.smoothstep(s.stage, 0.05, 0.6);
    u.uDissolve.value = Math.max(introDissolve, stageDissolve);
    color.current.setHSL(accent.hue / 360, 0.88, 0.62);
    (u.uAccent.value as THREE.Color).copy(color.current);

    // Position de la souris sur la photo (rayon sur un plan invisible)
    const target = u.uMouseUv.value as THREE.Vector2;
    if (proxy.current && Math.abs(s.mouse.x) <= 1) {
      ndc.current.set(s.mouse.x, s.mouse.y);
      raycaster.setFromCamera(ndc.current, camera);
      const hit = raycaster.intersectObject(proxy.current)[0];
      if (hit?.uv) target.lerp(hit.uv, 0.2);
    } else {
      target.set(-9, -9);
    }
  });

  return (
    <>
      <mesh geometry={geometry} frustumCulled={false}>
        <shaderMaterial ref={matRef} args={[params]} />
      </mesh>
      <mesh ref={proxy} visible={false}>
        <planeGeometry args={[W, H]} />
      </mesh>
    </>
  );
}

/* ---------------------------------------------------------------- Particules */

const particleVertex = /* glsl */ `
uniform float uTime;
uniform float uStage;
uniform float uIntro;
uniform float uSize;
uniform float uPixelRatio;
uniform float uAspect;
uniform vec2 uMouse;
uniform vec3 uAccent;
attribute vec3 aScatter;
attribute vec3 aNetwork;
attribute vec3 aBars;
attribute vec3 aNoise;
attribute vec3 aColor;
attribute float aRand;
varying vec3 vColor;
varying float vAlpha;

float ease(float t) { return t * t * (3.0 - 2.0 * t); }
float seg(float s, float k) { return ease(clamp((s - k) * 1.7 - aRand * 0.7, 0.0, 1.0)); }

void main() {
  float t0 = seg(uStage, 0.0);
  float t1 = seg(uStage, 1.0);
  float t2 = seg(uStage, 2.0);
  vec3 p = position;
  p = mix(p, aScatter, t0);
  p = mix(p, aNetwork, t1);
  p = mix(p, aBars, t2);

  float turb = sin(3.14159 * t0) + sin(3.14159 * t1) + sin(3.14159 * t2);
  vec3 swirl = vec3(sin(uTime * 1.3 + aRand * 40.0), cos(uTime * 1.1 + aRand * 31.0), sin(uTime * 0.9 + aRand * 23.0));
  p += swirl * (0.35 * turb + 0.012);

  // Visibilité : quand la photo est là, seules quelques particules s'en échappent
  float vis = smoothstep(0.08, 0.55, uStage);
  float emit = step(aRand, 0.06) * (1.0 - vis);
  float cyc = fract(uTime * 0.07 + aRand * 17.0);
  p += vec3(sin(aRand * 50.0) * 0.25, cyc * 1.6, 0.35 + cyc * 0.5) * emit;
  float emitAlpha = emit * sin(cyc * 3.14159) * 0.85;

  // Intro : le bruit converge, puis la photo prend le relais
  float it = ease(clamp(uIntro * 1.6 - aRand * 0.5, 0.0, 1.0));
  p = mix(aNoise, p, it);
  float introAlpha = 1.0 - smoothstep(0.55, 1.0, uIntro);

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vec4 clip = projectionMatrix * mv;
  vec2 ndc = clip.xy / clip.w;
  vec2 d = (ndc - uMouse) * vec2(uAspect, 1.0);
  float force = pow(smoothstep(0.2, 0.0, length(d)), 2.0) * vis;
  mv.xy += normalize(d + 1e-5) * force * 0.3;

  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * uPixelRatio * (7.0 / -mv.z) * (0.75 + aRand * 0.5);

  vec3 acc = uAccent * (0.55 + aRand * 0.65);
  vColor = mix(aColor, acc, max(smoothstep(0.1, 0.85, uStage), emit)) + force * 0.35;
  vAlpha = 0.92 * max(max(vis, emitAlpha), introAlpha * it);
}
`;

const particleFragment = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5 || vAlpha < 0.01) discard;
  gl_FragColor = vec4(vColor, smoothstep(0.5, 0.15, d) * vAlpha);
}
`;

function Particles({ attrs, state }: { attrs: Attributes; state: React.RefObject<SceneState> }) {
  const { size, gl } = useThree();
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const smoothMouse = useRef({ x: 9, y: 9 });
  const color = useRef(new THREE.Color());

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(attrs.portrait, 3));
    g.setAttribute("aScatter", new THREE.BufferAttribute(attrs.scatter, 3));
    g.setAttribute("aNetwork", new THREE.BufferAttribute(attrs.network, 3));
    g.setAttribute("aBars", new THREE.BufferAttribute(attrs.bars, 3));
    g.setAttribute("aNoise", new THREE.BufferAttribute(attrs.noise, 3));
    g.setAttribute("aColor", new THREE.BufferAttribute(attrs.color, 3));
    g.setAttribute("aRand", new THREE.BufferAttribute(attrs.rand, 1));
    return g;
  }, [attrs]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const params = useMemo(
    () => ({
      vertexShader: particleVertex,
      fragmentShader: particleFragment,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uStage: { value: 0 },
        uIntro: { value: 0 },
        uSize: { value: 2.6 },
        uPixelRatio: { value: 1 },
        uAspect: { value: 1 },
        uMouse: { value: new THREE.Vector2(9, 9) },
        uAccent: { value: new THREE.Color() },
      },
    }),
    [],
  );

  useFrame(({ clock }) => {
    const mat = matRef.current;
    if (!mat) return;
    const s = state.current;
    const u = mat.uniforms;
    u.uTime.value = clock.elapsedTime;
    u.uStage.value = s.stage;
    u.uIntro.value = s.intro;
    u.uPixelRatio.value = gl.getPixelRatio();
    u.uAspect.value = size.width / size.height;
    u.uSize.value = attrs.count > 22000 ? 2.4 : 3.1;
    smoothMouse.current.x += (s.mouse.x - smoothMouse.current.x) * 0.15;
    smoothMouse.current.y += (s.mouse.y - smoothMouse.current.y) * 0.15;
    (u.uMouse.value as THREE.Vector2).set(smoothMouse.current.x, smoothMouse.current.y);
    color.current.setHSL(accent.hue / 360, 0.88, 0.62);
    (u.uAccent.value as THREE.Color).copy(color.current);
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial ref={matRef} args={[params]} />
    </points>
  );
}

/* ---------------------------------------------------------------- Scène */

function Rig({ attrs, state, offset }: { attrs: Attributes; state: React.RefObject<SceneState>; offset: [number, number, number] }) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const g = group.current;
    if (!g) return;
    const s = state.current;
    const t = clock.elapsedTime;
    const mx = Math.abs(s.mouse.x) > 2 ? 0 : s.mouse.x;
    const my = Math.abs(s.mouse.y) > 2 ? 0 : s.mouse.y;
    const spin = THREE.MathUtils.smoothstep(s.stage, 0.6, 1.6) * Math.sin(t * 0.25) * 0.55;
    // Parallaxe : la photo tourne vers la souris, son relief devient visible
    g.rotation.y += (mx * 0.32 + Math.sin(t * 0.35) * 0.05 + spin - g.rotation.y) * 0.06;
    g.rotation.x += (-my * 0.16 - g.rotation.x) * 0.06;
    const k = THREE.MathUtils.smoothstep(s.stage, 0, 1);
    g.position.x = offset[0] * (1 + k * 0.05);
    g.position.y = offset[1] + Math.sin(t * 0.8) * 0.03;
    g.scale.setScalar(offset[2] * (1 - k * 0.22));
  });
  return (
    <group ref={group}>
      <Portrait attrs={attrs} state={state} />
      <Particles attrs={attrs} state={state} />
    </group>
  );
}

export default function ParticleScene({
  attrs,
  state,
  paused,
  offset,
}: {
  attrs: Attributes;
  state: React.RefObject<SceneState>;
  paused: boolean;
  offset: [number, number, number];
}) {
  return (
    <Canvas
      frameloop={paused ? "never" : "always"}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance", preserveDrawingBuffer: false }}
      camera={{ fov: 40, position: [0, 0, 7] }}
      aria-hidden
    >
      <Rig attrs={attrs} state={state} offset={offset} />
    </Canvas>
  );
}
