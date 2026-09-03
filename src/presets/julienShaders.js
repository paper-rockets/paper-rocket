// src/presets/julienShaders.js
// Extracted GLSL Shaders from Julien Verneaut Lab & Creative Experiments

export const JULIEN_VERTEX_SHADER = `precision mediump float;
varying vec2 v_uv;
varying vec3 v_normal;
varying vec3 v_position;

void main() {
  v_uv = uv;
  v_normal = normalize(normalMatrix * normal);
  vec4 mv_pos = modelViewMatrix * vec4(position, 1.0);
  v_position = mv_pos.xyz;
  gl_Position = projectionMatrix * mv_pos;
}`;

export const JULIEN_SHADERS_MATERIAL = [
  {
    id: 'julien_twgl_plasma',
    name: 'TWGL Psychedelic Plasma',
    category: '✨ Fun & Magic',
    type: 'shader',
    description: 'Harmonic multiscale sine-wave interference pattern with iridescent plasma color fields.',
    generate: (ctx, w, h) => {
      const grad = ctx.createRadialGradient(w * 0.5, h * 0.5, 5, w * 0.5, h * 0.5, w * 0.5);
      grad.addColorStop(0, '#00f5d4');
      grad.addColorStop(0.35, '#7209b7');
      grad.addColorStop(0.7, '#f72585');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(w/2, h/2, w/2, 0, Math.PI * 2); ctx.fill();
    },
    vertexShader: JULIEN_VERTEX_SHADER,
    fragmentShader: `precision mediump float;
uniform float u_time;
varying vec2 v_uv;
varying vec3 v_normal;

void main() {
  vec2 uv = v_uv;
  float t = u_time * 0.7;
  float color = 0.0;
  color += sin(uv.x * cos(t / 3.0) * 30.0) + cos(uv.y * cos(t / 2.8) * 20.0);
  color += sin(uv.y * sin(t / 2.0) * 20.0) + cos(uv.x * sin(t / 1.7) * 20.0);
  color += sin(uv.x * sin(t / 1.0) * 10.0) + sin(uv.y * sin(t / 3.5) * 40.0);
  color *= sin(t / 10.0) * 0.5;

  vec3 rgb = vec3(color * 0.5 + 0.5, sin(color + t / 2.5) * 0.5 + 0.5, color * 0.8 + 0.4);
  gl_FragColor = vec4(rgb, 1.0);
}`,
    uniforms: {
      u_time: { value: 0 }
    }
  },
  {
    id: 'julien_webgl_gradient',
    name: 'HSV Color Cycle Gradient',
    category: '✨ Fun & Magic',
    type: 'shader',
    description: 'Smooth polar HSV color cycling with oscillating hue rotation and complementary gradient blending.',
    generate: (ctx, w, h) => {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#ff007f');
      grad.addColorStop(0.5, '#7928ca');
      grad.addColorStop(1, '#00dfd8');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(w/2, h/2, w/2, 0, Math.PI * 2); ctx.fill();
    },
    vertexShader: JULIEN_VERTEX_SHADER,
    fragmentShader: `precision mediump float;
uniform float u_time;
varying vec2 v_uv;

vec3 rgb2hsv(vec3 c) {
  vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
  float d = q.x - min(q.w, q.y);
  float e = 1.0e-10;
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
  vec3 c1 = vec3(0.95, 0.1, 0.45);
  vec3 c2 = vec3(0.1, 0.85, 0.95);
  float mixVal = 0.5 + 0.5 * sin(u_time * 0.8 + v_uv.x * 3.1415 + v_uv.y * 2.0);
  vec3 hsvMix = mix(rgb2hsv(c1), rgb2hsv(c2), mixVal);
  hsvMix.x = fract(hsvMix.x + u_time * 0.05);
  gl_FragColor = vec4(hsv2rgb(hsvMix), 1.0);
}`,
    uniforms: {
      u_time: { value: 0 }
    }
  },
  {
    id: 'julien_ghost',
    name: 'Ghost Specter Undulation',
    category: '✨ Fun & Magic',
    type: 'shader',
    description: 'Dynamic ripple mesh deformation and eerie translucent ambient diffuse lighting.',
    generate: (ctx, w, h) => {
      const grad = ctx.createRadialGradient(w * 0.5, h * 0.4, 10, w * 0.5, h * 0.5, w * 0.5);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, '#c7d2fe');
      grad.addColorStop(0.7, '#6366f1');
      grad.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(w/2, h/2, w/2, 0, Math.PI * 2); ctx.fill();
    },
    vertexShader: `precision mediump float;
uniform float u_time;
varying vec3 v_normals;
varying vec2 v_uv;

void main() {
  v_uv = uv;
  vec3 pos = position;
  pos.x += 0.04 * sin(u_time * 1.5 + pos.y * 3.0);
  pos.z += 0.04 * cos(u_time * 1.5 + pos.y * 3.0);
  pos.y += 0.03 * cos(u_time * 1.2);
  v_normals = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}`,
    fragmentShader: `precision mediump float;
uniform float u_time;
varying vec3 v_normals;
varying vec2 v_uv;

void main() {
  vec3 baseColor = vec3(0.75, 0.85, 1.0);
  vec3 lightDir = normalize(vec3(1.0, 1.0, 0.5));
  float diff = max(dot(v_normals, lightDir), 0.0);
  float rim = 1.0 - max(dot(v_normals, vec3(0.0, 0.0, 1.0)), 0.0);
  rim = pow(rim, 2.5);
  vec3 finalColor = baseColor * (0.3 + 0.7 * diff) + vec3(0.3, 0.6, 1.0) * rim;
  gl_FragColor = vec4(finalColor, 0.9);
}`,
    uniforms: {
      u_time: { value: 0 }
    }
  },
  {
    id: 'julien_grid_deformation',
    name: 'Grid Gaussian Deformation',
    category: '✨ Fun & Magic',
    type: 'shader',
    description: 'Parametric Gaussian bell-curve displacement with harmonic ripple ripples across grid coordinates.',
    generate: (ctx, w, h) => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      for (let i = 0; i <= w; i += 32) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke();
      }
    },
    vertexShader: `precision mediump float;
uniform float u_time;
varying vec2 v_uv;
varying vec3 v_normal;

void main() {
  v_uv = uv;
  vec3 pos = position;
  float dist = length(uv - vec2(0.5));
  float bell = exp(-dist * dist * 12.0);
  pos += normal * (bell * 0.15 * sin(u_time * 2.5));
  v_normal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}`,
    fragmentShader: `precision mediump float;
uniform float u_time;
varying vec2 v_uv;
varying vec3 v_normal;

void main() {
  vec2 grid = abs(fract(v_uv * 20.0 - 0.5) - 0.5) / fwidth(v_uv * 20.0);
  float line = min(grid.x, grid.y);
  float c = 1.0 - min(line, 1.0);
  vec3 col = mix(vec3(0.05, 0.08, 0.15), vec3(0.2, 0.8, 1.0), c);
  gl_FragColor = vec4(col, 1.0);
}`,
    uniforms: {
      u_time: { value: 0 }
    }
  },
  {
    id: 'julien_webgl_demo',
    name: 'Chromatic Wave Distortion',
    category: '✨ Fun & Magic',
    type: 'shader',
    description: 'Kinetic sinusoidal wave warping with chromatic red/green/blue phase separation.',
    generate: (ctx, w, h) => {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#ff0055');
      grad.addColorStop(0.5, '#00ffcc');
      grad.addColorStop(1, '#0066ff');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(w/2, h/2, w/2, 0, Math.PI * 2); ctx.fill();
    },
    vertexShader: JULIEN_VERTEX_SHADER,
    fragmentShader: `precision mediump float;
uniform float u_time;
varying vec2 v_uv;
varying vec3 v_normal;

void main() {
  vec2 uv = v_uv;
  float wave = sin(uv.y * 12.0 + u_time * 2.0) * 0.03;
  vec2 uvR = uv + vec2(wave, 0.0);
  vec2 uvG = uv;
  vec2 uvB = uv - vec2(wave, 0.0);

  float r = sin(uvR.x * 8.0 + u_time) * 0.5 + 0.5;
  float g = sin(uvG.y * 8.0 + u_time * 1.2) * 0.5 + 0.5;
  float b = cos((uvB.x + uvB.y) * 6.0 + u_time * 0.8) * 0.5 + 0.5;

  gl_FragColor = vec4(r, g, b, 1.0);
}`,
    uniforms: {
      u_time: { value: 0 }
    }
  },
  {
    id: 'julien_autostereogram',
    name: 'Autostereogram Magic Depth',
    category: '✨ Fun & Magic',
    type: 'shader',
    description: 'Autostereogram multi-slice wallpaper generator creating optical 3D depth perception.',
    generate: (ctx, w, h) => {
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, w, h);
      for (let x = 0; x < w; x += 16) {
        ctx.fillStyle = x % 32 === 0 ? '#38bdf8' : '#818cf8';
        ctx.fillRect(x, 0, 8, h);
      }
    },
    vertexShader: JULIEN_VERTEX_SHADER,
    fragmentShader: `precision mediump float;
uniform float u_time;
varying vec2 v_uv;

void main() {
  float slices = 8.0;
  vec2 uv = v_uv;
  float patternX = fract(uv.x * slices);
  float depth = sin(uv.y * 10.0 + u_time) * 0.5 + 0.5;
  patternX = fract(patternX + depth * 0.15);
  vec3 col = vec3(patternX, sin(patternX * 3.14), cos(patternX * 3.14));
  gl_FragColor = vec4(col, 1.0);
}`,
    uniforms: {
      u_time: { value: 0 }
    }
  },
  {
    id: 'julien_poster',
    name: 'Graphic Poster Monolith',
    category: '✨ Fun & Magic',
    type: 'shader',
    description: 'High-contrast graphic print shader with luminance thresholding, animated circle aperture, and paper grain.',
    generate: (ctx, w, h) => {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#e11d48';
      ctx.beginPath(); ctx.arc(w*0.5, h*0.5, w*0.35, 0, Math.PI * 2); ctx.fill();
    },
    vertexShader: JULIEN_VERTEX_SHADER,
    fragmentShader: `precision mediump float;
uniform float u_time;
varying vec2 v_uv;

void main() {
  vec2 uv = v_uv;
  float dist = length(uv - vec2(0.5));
  float radius = 0.35 + 0.05 * sin(u_time * 1.5);
  vec3 paper = vec3(0.96, 0.95, 0.92);
  vec3 ink = vec3(0.88, 0.1, 0.25);
  vec3 base = dist < radius ? ink : paper;
  gl_FragColor = vec4(base, 1.0);
}`,
    uniforms: {
      u_time: { value: 0 }
    }
  },
  {
    id: 'julien_photo_editing',
    name: 'Film Grading & Vintage Grain',
    category: '✨ Fun & Magic',
    type: 'shader',
    description: 'Real-time photographic exposure control with contrast knee, saturation curve, and pseudo-random grain.',
    generate: (ctx, w, h) => {
      const grad = ctx.createRadialGradient(w * 0.5, h * 0.5, 10, w * 0.5, h * 0.5, w * 0.5);
      grad.addColorStop(0, '#fef08a');
      grad.addColorStop(0.5, '#ea580c');
      grad.addColorStop(1, '#431407');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(w/2, h/2, w/2, 0, Math.PI * 2); ctx.fill();
    },
    vertexShader: JULIEN_VERTEX_SHADER,
    fragmentShader: `precision mediump float;
uniform float u_time;
varying vec2 v_uv;

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
  vec2 uv = v_uv;
  vec3 col = vec3(uv.x, uv.y, 0.5 + 0.5 * sin(u_time));
  col = clamp(col * 1.2 - 0.1, 0.0, 1.0); // Contrast
  float grain = random(uv * 500.0 + fract(u_time * 10.0)) * 0.08;
  gl_FragColor = vec4(col + grain, 1.0);
}`,
    uniforms: {
      u_time: { value: 0 }
    }
  }
];

export const JULIEN_SHADERS_CREATOR = JULIEN_SHADERS_MATERIAL.map((m) => ({
  id: m.id,
  name: m.name,
  category: m.category,
  description: m.description,
  vertexShader: m.vertexShader,
  fragmentShader: m.fragmentShader,
  uniforms: m.uniforms || {}
}));
