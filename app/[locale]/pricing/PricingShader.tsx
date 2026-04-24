'use client';

import { useEffect, useRef } from 'react';

// ─── Jobleo Aurora Shader ──────────────────────────────────────────────────
// WebGL GLSL fragment shader — smooth sine-based domain warp, no hash noise.
// Drop into any section as a full-bleed background canvas.
//
// Usage:
//   <section style={{ position: 'relative', minHeight: '100vh' }}>
//     <PricingShader speed={0.6} intensity={0.55} />
//     {/* your content here */}
//   </section>
// ─────────────────────────────────────────────────────────────────────────────

const VERT = `
  attribute vec2 a_pos;
  void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
  precision highp float;
  uniform vec2  u_res;
  uniform float u_time;
  uniform vec2  u_mouse;
  uniform float u_speed;
  uniform float u_intensity;

  float smoothNoise(vec2 p) {
    float n  = sin(p.x * 1.0 + p.y * 0.7) * 0.40
             + sin(p.x * 2.3 - p.y * 1.5) * 0.25
             + sin(p.x * 0.7 + p.y * 2.1) * 0.20
             + sin(p.x * 3.1 - p.y * 0.9) * 0.15;
    return n * 0.5 + 0.5;
  }

  float fbm(vec2 p, float t) {
    float v = 0.0;
    v += 0.500 * smoothNoise(p * 1.0 + t * vec2(0.11, 0.07));
    v += 0.250 * smoothNoise(p * 2.1 + t * vec2(-0.09, 0.13) + vec2(3.7, 1.2));
    v += 0.125 * smoothNoise(p * 4.3 + t * vec2(0.07, -0.11) + vec2(7.3, 5.8));
    v += 0.063 * smoothNoise(p * 8.7 + t * vec2(-0.05, 0.08) + vec2(2.1, 8.4));
    return v;
  }

  vec3 auroraColor(float f) {
    vec3 navy  = vec3(0.04, 0.09, 0.16);  // #0a1628
    vec3 blue  = vec3(0.06, 0.25, 0.55);  // ~#103f8c
    vec3 teal  = vec3(0.07, 0.55, 0.50);  // ~#118d80
    vec3 mint  = vec3(0.25, 0.76, 0.62);  // ~#40c29e
    vec3 green = vec3(0.00, 0.43, 0.22);  // #006d37
    vec3 c = mix(navy, blue,  smoothstep(0.00, 0.35, f));
    c      = mix(c,    teal,  smoothstep(0.30, 0.60, f));
    c      = mix(c,    mint,  smoothstep(0.55, 0.80, f));
    c      = mix(c,    green, smoothstep(0.75, 1.00, f));
    return c;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_res;
    uv.y = 1.0 - uv.y;
    float aspect = u_res.x / u_res.y;
    vec2 p = uv * vec2(aspect * 1.4, 1.4);

    float t = u_time * u_speed * 0.35;

    // soft mouse warp
    vec2 m = u_mouse * vec2(aspect * 1.4, 1.4);
    float mw = exp(-length(p - m) * 2.2) * 0.28;
    p += mw * vec2(sin(t * 1.3), cos(t * 0.9));

    // two-level domain warp
    vec2 q = vec2(fbm(p + t * 0.4, t),             fbm(p + vec2(4.1, 2.7) + t * 0.3, t));
    vec2 r = vec2(fbm(p + 2.5 * q + t * 0.2, t),   fbm(p + 2.5 * q + vec2(1.8, 4.2) + t * 0.15, t));

    float f = fbm(p + 2.2 * r, t);
    f = f * 0.7 + 0.3 * (f * f * 2.0);

    vec3 col = auroraColor(f);

    // soft horizontal aurora bands
    float band = sin(uv.y * 3.14159 * 2.5 + t * 0.6 + f * 2.0) * 0.5 + 0.5;
    col = mix(col, col * 1.35, band * u_intensity * 0.4);

    // vignette
    vec2 vd = uv - 0.5;
    float vig = 1.0 - dot(vd * vec2(0.9, 1.4), vd * vec2(0.9, 1.4)) * 1.1;
    col *= max(vig, 0.0);

    gl_FragColor = vec4(col, 1.0);
  }
`;

interface PricingShaderProps {
  /** Animation speed multiplier. Default: 0.6 */
  speed?: number;
  /** Controls aurora intensity / band brightness. Default: 0.55 */
  intensity?: number;
  /** Enable mouse-reactive warp. Default: true */
  mouseReactive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function PricingShader({
  speed = 0.6,
  intensity = 0.55,
  mouseReactive = true,
  className,
  style,
}: PricingShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef  = useRef({ x: 0.5, y: 0.5 });
  const startRef  = useRef(Date.now());
  const animRef   = useRef<number>(0);
  const glRef     = useRef<WebGLRenderingContext | null>(null);
  const progRef   = useRef<WebGLProgram | null>(null);

  // Speed / intensity are read via closure every frame — no need to rebuild on change
  const speedRef     = useRef(speed);
  const intensityRef = useRef(intensity);
  speedRef.current     = speed;
  intensityRef.current = intensity;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { antialias: true });
    if (!gl) return;
    glRef.current = gl;

    // Compile helpers
    function compile(type: number, src: string): WebGLShader {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      return sh;
    }

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    progRef.current = prog;
    gl.useProgram(prog);

    // Full-screen quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    function resize() {
      const dpr = devicePixelRatio || 1;
      canvas!.width  = canvas!.offsetWidth  * dpr;
      canvas!.height = canvas!.offsetHeight * dpr;
      gl.viewport(0, 0, canvas!.width, canvas!.height);
    }

    function render() {
      const p = progRef.current!;
      gl.useProgram(p);
      const elapsed = (Date.now() - startRef.current) / 1000;
      gl.uniform2f(gl.getUniformLocation(p, 'u_res'),       canvas!.width, canvas!.height);
      gl.uniform1f(gl.getUniformLocation(p, 'u_time'),      elapsed);
      gl.uniform2f(gl.getUniformLocation(p, 'u_mouse'),     mouseRef.current.x, mouseRef.current.y);
      gl.uniform1f(gl.getUniformLocation(p, 'u_speed'),     speedRef.current);
      gl.uniform1f(gl.getUniformLocation(p, 'u_intensity'), intensityRef.current);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animRef.current = requestAnimationFrame(render);
    }

    resize();
    render();

    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []); // only init once

  useEffect(() => {
    if (!mouseReactive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouseRef.current = {
        x:     (e.clientX - r.left) / r.width,
        y: 1 - (e.clientY - r.top)  / r.height,
      };
    };
    const onLeave = () => { mouseRef.current = { x: 0.5, y: 0.5 }; };

    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);
    return () => {
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
    };
  }, [mouseReactive]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        ...style,
      }}
    />
  );
}
