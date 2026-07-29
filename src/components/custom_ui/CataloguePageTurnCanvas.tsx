import { useEffect, useRef, type MutableRefObject } from "react";
import { Mesh, Plane, Program, Renderer, Texture } from "ogl";

import { getDecodedCataloguePageImage } from "@/pages/public/CataloguePageImageCache";

type PageTurnDirection = "next" | "prev";

type CataloguePageTurnCanvasProps = {
  frontImageUrl: string;
  backImageUrl?: string;
  direction: PageTurnDirection;
  durationMs?: number;
  /** A ref updated by the parent while the reader is holding the page. */
  progressRef?: MutableRefObject<number>;
  /** `null` keeps the leaf under the reader's hand; 0 returns it, 1 completes it. */
  settleTo?: 0 | 1 | null;
  onComplete?: () => void;
  onCancel?: () => void;
};

const vertexShader = `
precision highp float;

attribute vec3 position;
attribute vec2 uv;

uniform float uProgress;
uniform float uDirection;

varying vec2 vUv;
varying float vDepth;
varying float vFold;

const float PI = 3.141592653589793;

void main() {
  float distanceFromHinge = uDirection > 0.0 ? uv.x : 1.0 - uv.x;
  float lowerCorner = pow(1.0 - uv.y, 2.65);
  float forceFalloff = pow(distanceFromHinge, 1.45);
  float turnAngle = PI * uProgress;
  float turnForce = sin(PI * uProgress);

  float heldCorner = lowerCorner * forceFalloff;
  float passivePaper = (1.0 - lowerCorner) * forceFalloff;
  float torsion = turnForce * (heldCorner * 0.92 - passivePaper * 0.10);
  float localAngle = turnAngle + torsion;

  float x = uDirection * distanceFromHinge * cos(localAngle);
  float z = distanceFromHinge * sin(localAngle);

  float travellingBow =
    sin(PI * distanceFromHinge) *
    turnForce *
    mix(0.055, 0.17, lowerCorner);
  z += travellingBow;

  float y = uv.y * 2.0 - 1.0;
  y += heldCorner * turnForce * 0.105;
  y -= passivePaper * turnForce * 0.018;

  float perspective = 1.0 / (1.0 - z * 0.19);
  vec2 projected = vec2(x, y) * perspective;

  vUv = uv;
  vDepth = z;
  vFold = clamp(abs(torsion) + travellingBow * 2.2, 0.0, 1.0);

  gl_Position = vec4(projected, 0.25 - z * 0.12, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform sampler2D tFront;
uniform sampler2D tBack;
uniform float uFrontAspect;
uniform float uBackAspect;
uniform float uPageAspect;
uniform float uFrontReady;
uniform float uBackReady;
uniform float uProgress;

varying vec2 vUv;
varying float vDepth;
varying float vFold;

vec4 paperColor() {
  return vec4(0.973, 0.969, 0.949, 1.0);
}

vec4 sampleContained(sampler2D image, vec2 sourceUv, float imageAspect) {
  vec2 containedUv = sourceUv;

  if (imageAspect > uPageAspect) {
    float occupiedHeight = uPageAspect / imageAspect;
    containedUv.y = (containedUv.y - 0.5) / occupiedHeight + 0.5;
  } else {
    float occupiedWidth = imageAspect / uPageAspect;
    containedUv.x = (containedUv.x - 0.5) / occupiedWidth + 0.5;
  }

  if (
    containedUv.x < 0.0 ||
    containedUv.x > 1.0 ||
    containedUv.y < 0.0 ||
    containedUv.y > 1.0
  ) {
    return paperColor();
  }

  return texture2D(image, containedUv);
}

void main() {
  vec4 color;

  // Winding becomes numerically unstable when a curved leaf reaches its
  // final 180° pose. Progress is the reliable physical side: before the
  // hinge crossing we show the front; after it we show the reverse page.
  bool isFront = uProgress < 0.5;

  // Never show the temporary 2x2 paper texture. Before the decoded image is
  // on the GPU, leave this face transparent and keep the existing DOM page
  // visible underneath.
  if ((isFront && uFrontReady < 0.5) || (!isFront && uBackReady < 0.5)) {
    gl_FragColor = vec4(0.0);
    return;
  }

  if (isFront) {
    color = sampleContained(tFront, vUv, uFrontAspect);
  } else {
    color = sampleContained(
      tBack,
      vec2(1.0 - vUv.x, vUv.y),
      uBackAspect
    );
  }

  // A printed page keeps its ink and paper tone while it moves. The geometry,
  // silhouette and cast shadows already describe depth; darkening the texture
  // made white catalogue pages look grey while the reader held them.
  color.rgb *= 1.0;
  gl_FragColor = vec4(color.rgb, 1.0);
}
`;

function createDummyCanvas(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 2;
  canvas.height = 2;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#f8f7f3";
    ctx.fillRect(0, 0, 2, 2);
  }
  return canvas;
}

function smoothPhysicalTurn(value: number) {
  const clamped = Math.min(1, Math.max(0, value));
  return clamped * clamped * (3 - 2 * clamped);
}

export function CataloguePageTurnCanvas({
  frontImageUrl,
  backImageUrl = frontImageUrl,
  direction,
  durationMs = 1000,
  progressRef,
  settleTo = null,
  onComplete,
  onCancel,
}: CataloguePageTurnCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const completeRef = useRef(onComplete);
  const cancelRef = useRef(onCancel);
  const settleRef = useRef(settleTo);

  useEffect(() => {
    completeRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    cancelRef.current = onCancel;
  }, [onCancel]);

  useEffect(() => {
    settleRef.current = settleTo;
  }, [settleTo]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: Renderer | null = null;
    let program: Program | null = null;
    let geometry: Plane | null = null;
    let animationFrame = 0;
    let resizeObserver: ResizeObserver | null = null;
    let cancelled = false;
    let didFinish = false;
    let didSettle = false;
    let frontTextureFailed = false;
    let backTextureFailed = false;

    const finish = () => {
      if (didFinish || cancelled) return;
      didFinish = true;
      completeRef.current?.();
    };

    try {
      renderer = new Renderer({
        alpha: true,
        antialias: true,
        depth: false,
        dpr: Math.min(window.devicePixelRatio || 1, 1.75),
        powerPreference: "high-performance",
        premultipliedAlpha: true,
      });

      const gl = renderer.gl;
      gl.clearColor(0, 0, 0, 0);
      gl.canvas.setAttribute("aria-hidden", "true");
      gl.canvas.style.height = "100%";
      gl.canvas.style.width = "100%";
      container.appendChild(gl.canvas);

      const dummyImage = createDummyCanvas();

      const frontTexture = new Texture(gl, {
        image: dummyImage,
        flipY: true,
        generateMipmaps: false,
        minFilter: gl.LINEAR,
        magFilter: gl.LINEAR,
        wrapS: gl.CLAMP_TO_EDGE,
        wrapT: gl.CLAMP_TO_EDGE,
      });

      const backTexture = new Texture(gl, {
        image: dummyImage,
        flipY: true,
        generateMipmaps: false,
        minFilter: gl.LINEAR,
        magFilter: gl.LINEAR,
        wrapS: gl.CLAMP_TO_EDGE,
        wrapT: gl.CLAMP_TO_EDGE,
      });

      const uniforms = {
        uProgress: { value: 0 },
        uDirection: { value: direction === "next" ? 1 : -1 },
        uFrontAspect: { value: 0.707 },
        uBackAspect: { value: 0.707 },
        uPageAspect: { value: 0.707 },
        uFrontReady: { value: 0 },
        uBackReady: { value: 0 },
        tFront: { value: frontTexture },
        tBack: { value: backTexture },
      };

      geometry = new Plane(gl, {
        width: 1,
        height: 2,
        widthSegments: 40,
        heightSegments: 56,
      });

      program = new Program(gl, {
        vertex: vertexShader,
        fragment: fragmentShader,
        uniforms,
        transparent: true,
        cullFace: false,
        depthTest: false,
        depthWrite: false,
      });

      const mesh = new Mesh(gl, { geometry, program });

      const resize = () => {
        if (!renderer || !containerRef.current) return;
        const { clientWidth, clientHeight } = containerRef.current;
        if (clientWidth === 0 || clientHeight === 0) return;

        renderer.setSize(clientWidth, clientHeight);
        // The canvas covers the complete spread; each physical leaf is half of it.
        uniforms.uPageAspect.value = clientWidth / 2 / clientHeight;
      };

      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(container);
      resize();

      // Async load textures into WebGL textures without delaying animation frame loop start
      void getDecodedCataloguePageImage(frontImageUrl, true)
        .then((img) => {
          if (cancelled || !gl) return;
          frontTexture.image = img;
          frontTexture.needsUpdate = true;
          uniforms.uFrontAspect.value = img.naturalWidth / img.naturalHeight;
          uniforms.uFrontReady.value = 1;
        })
        .catch(() => {
          // Keep the face transparent, but never leave the reader locked in a
          // pending flip when a single source image fails to decode.
          frontTextureFailed = true;
        });

      if (backImageUrl) {
        void getDecodedCataloguePageImage(backImageUrl, true)
          .then((img) => {
            if (cancelled || !gl) return;
          backTexture.image = img;
          backTexture.needsUpdate = true;
          uniforms.uBackAspect.value = img.naturalWidth / img.naturalHeight;
          uniforms.uBackReady.value = 1;
          })
          .catch(() => {
            backTextureFailed = true;
          });
      }

      let startedAt: number | null = null;
      let currentProgress = progressRef?.current ?? 0;
      let velocity = 0;
      let previousTime = startedAt;
      const render = (now: number) => {
        if (cancelled || !renderer) return;

        // Don't advance a flip against white placeholder paper. The cached
        // decoder normally resolves immediately; on a cold image it simply
        // keeps the current DOM spread visible until both faces are usable.
        if (
          (uniforms.uFrontReady.value < 0.5 && !frontTextureFailed) ||
          (uniforms.uBackReady.value < 0.5 && !backTextureFailed)
        ) {
          renderer.render({ scene: mesh, clear: true });
          animationFrame = requestAnimationFrame(render);
          return;
        }

        if (startedAt === null) {
          startedAt = now;
          previousTime = now;
        }

        const requestedSettle = settleRef.current;
        if (!progressRef) {
          const elapsed = (now - startedAt) / durationMs;
          currentProgress = smoothPhysicalTurn(elapsed);
          if (elapsed >= 1) didSettle = true;
        } else if (requestedSettle === null) {
          // The reader owns this value while their finger/mouse is still down.
          currentProgress = Math.min(1, Math.max(0, progressRef.current));
          previousTime = now;
        } else {
          // A critically damped-ish spring makes a released sheet settle naturally.
          const deltaSeconds = Math.min(0.032, Math.max(0.001, (now - previousTime) / 1000));
          previousTime = now;
          velocity += (requestedSettle - currentProgress) * 92 * deltaSeconds;
          velocity *= Math.exp(-15 * deltaSeconds);
          currentProgress += velocity * deltaSeconds;

          if (Math.abs(requestedSettle - currentProgress) < 0.002 && Math.abs(velocity) < 0.012) {
            currentProgress = requestedSettle;
            didSettle = true;
          }
        }

        uniforms.uProgress.value = Math.min(1, Math.max(0, currentProgress));

        try {
          renderer.render({ scene: mesh, clear: true });
        } catch {
          finish();
          return;
        }

        if (!didSettle) {
          animationFrame = requestAnimationFrame(render);
        } else {
          if (progressRef && settleRef.current === 0) {
            didFinish = true;
            cancelRef.current?.();
          } else {
            finish();
          }
        }
      };

      animationFrame = requestAnimationFrame(render);
    } catch {
      window.setTimeout(finish, durationMs);
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(animationFrame);
      resizeObserver?.disconnect();
      geometry?.remove();
      program?.remove();

      if (renderer) {
        try {
          const extension = renderer.gl.getExtension("WEBGL_lose_context");
          extension?.loseContext();
          renderer.gl.canvas.remove();
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, [backImageUrl, direction, durationMs, frontImageUrl, progressRef]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 z-30 overflow-visible"
      aria-hidden="true"
    />
  );
}
