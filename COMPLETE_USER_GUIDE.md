# Remix 3D Studio: Complete Workstation Manual & Artist Handbook

> **Document Version**: `v16.0.0` (Antigravity Architecture)  
> **Workspace**: `E:\X\AiStudio Workflow\V16 Antigravity`  
> **Primary Technology**: WebGPU / WebGL2, Three.js, Bishop RMF Geometry, OKLab Perceptual Color, WBOIT, Google Draco WASM  
> **Engineering Reference**: For underlying differential geometry, color matrices, and WGSL shaders, see [ARCHITECTURE_INTERNALS.md](file:///E:/X/AiStudio%20Workflow/V16%20Antigravity/ARCHITECTURE_INTERNALS.md).

---

## Welcome to Remix 3D Studio

Remix 3D Studio is an intuitive 3D spatial drawing, surface painting, and volumetric sculpting workstation. Designed from the ground up for tablets, active styluses, and modern desktop browsers, Remix 3D lets you sketch freely in 3D air, paint directly onto 3D character templates, and export game-ready compressed assets without the steep learning curves of legacy desktop CAD software.

The studio operates across two seamless modes:
- **Play Mode [Play]**: A clean, distraction-free 4-zone interface tailored for immediate sketching, coloring book templates, and fast concept art.
- **Pro Mode [Pro]**: An advanced suite unlocking parametric CAD lofting, multi-layer GPU compositing, physically based rendering (PBR), 27 procedural GLSL shaders, and universal 8-format Draco model compression.

---

## Visual Table of Contents

- [Part 1: First Run & The 60-Second Sketch](#part-1-first-run--the-60-second-sketch)
  - [1.1 The 4 Immutable Screen Zones](#11-the-4-immutable-screen-zones-play)
  - [1.2 The Finger-Pen Golden Rule](#12-the-finger-pen-golden-rule-play)
  - [1.3 15-Second Hands-On Walkthrough: Painting on a Toybox Template](#13-15-second-hands-on-walkthrough-painting-on-a-toybox-template-play)
- [Part 2: Spatial Drafting & Sculpting Workflow](#part-2-spatial-drafting--sculpting-workflow)
  - [2.1 The 3 Core Brushes vs Pro Presets](#21-the-3-core-brushes-play-vs-pro-presets-pro)
  - [2.2 The 6 Magic FX Shaders vs Full PBR Mode](#22-the-6-magic-fx-shaders-play-vs-full-pbr-mode-pro)
  - [2.3 Shape Snapping: Lines, Circles, Polygons](#23-shape-snapping-lines-circles-polygons-play)
  - [2.4 Instant Correction: Super Zap vs Volumetric Liquify](#24-instant-correction-super-zap-play-vs-volumetric-liquify-pro)
- [Part 3: Spatial Navigation & The Dual-State Navigator](#part-3-spatial-navigation--the-dual-state-navigator)
  - [3.1 Viewport Touch Controls & View Snapping](#31-viewport-touch-controls--view-snapping-play)
  - [3.2 Flat Screen Mode](#32-flat-screen-mode-play)
  - [3.3 3D World Mode & The Orthographic Safety Guard](#33-3d-world-mode--the-orthographic-safety-guard-play)
- [Part 4: Stage, Lighting & Reference Scaffolding](#part-4-stage-lighting--reference-scaffolding)
  - [4.1 1-Tap Atmospheric Presets & Celestial Dome](#41-1-tap-atmospheric-presets--celestial-dome-play--pro)
  - [4.2 Tracing Mode: Floating 2D Clipboard Overlays](#42-tracing-mode-floating-2d-clipboard-overlays-play--pro)
  - [4.3 Custom 3D Guides & Symmetry Planes](#43-custom-3d-guides--symmetry-planes-play--pro)
- [Part 5: Pro Studio, Conversion & Pipeline Delivery](#part-5-pro-studio-conversion--pipeline-delivery)
  - [5.1 The Pro Studio Drawer](#51-the-pro-studio-drawer-pro)
  - [5.2 Multi-Layer GPU Compositor & Blend Modes](#52-multi-layer-gpu-compositor--blend-modes-pro)
  - [5.3 Universal 8-Format Converter & Google Draco Compression](#53-universal-8-format-converter--google-draco-compression-pro)
  - [5.4 WebXR 1:1 Scale Spatial Preview](#54-webxr-11-scale-spatial-preview-play--pro)
  - [5.5 Complete Shortcut Matrix & Troubleshooting](#55-complete-shortcut-matrix--troubleshooting-play--pro)
- [Goal-Oriented Step-by-Step Recipes](#goal-oriented-step-by-step-recipes)
  - [Recipe A: Inking a Character Buck](#recipe-a-inking-a-character-buck-play--pro)
  - [Recipe B: Carving Negative Forms & Cutouts](#recipe-b-carving-negative-forms--cutouts-pro)
  - [Recipe C: Sweeping an Aerodynamic Arch](#recipe-c-sweeping-an-aerodynamic-arch-pro)

---

# Part 1: First Run & The 60-Second Sketch

### 1.1 The 4 Immutable Screen Zones [Play]

In Play Mode, the canvas remains open, clear, and uncluttered. Every essential function is organized into four fixed screen zones:

```
┌────────────────────────────────────────────────────────────────────────┐
│ [Zone A] [Toybox Template]        Remix 3D Canvas        [Undo] [Redo] │
├───────────────┬────────────────────────────────────────────────────────┤
│ [Zone B]      │                                                        │
│ ┌───────────┐ │                                                        │
│ │   Draw    │ │                                                        │
│ ├───────────┤ │                                                        │
│ │   Shape   │ │                     3D VIEWPORT                        │
│ ├───────────┤ │                                                        │
│ │ Super Zap │ │                                                        │
│ ├───────────┤ │                                           ┌──────────┐ │
│ │   Move    │ │                                           │ [Zone C] │ │
│ └───────────┘ │                                           │Dual-State│ │
│               │                                           │Navigator │ │
├───────────────┴───────────────────────────────────────────┴──────────┤
│ [Zone D] [Palette Swatches (16)]  [Size Slider]  [Magic FX Tiles (6)]  │
└────────────────────────────────────────────────────────────────────────┘
```

| Screen Zone | Location | Primary Controls & Functions |
|---|---|---|
| **Zone A: Header Strip** | Top bar ($48\text{ px}$) | **Project Chip / Toybox Button** (opens coloring book templates), Project Title, **Undo** / **Redo**, and Quick Settings (switch to Pro Mode). |
| **Zone B: Left Tool Dock** | Left edge | **4 Primary Actions**: **Draw** (3 brushes), **Shape** (lines, circles, polygons), **Super Zap** (clean vacuum eraser), and **Move** (select & reposition). |
| **Zone C: Dual-State Navigator** | Bottom right | **Compact 3D Navigator**: Toggles between **Flat Screen** (2D glass transform) and **3D World** (chunky RGB axis handles and rotation arcs). |
| **Zone D: Bottom Context Strip** | Bottom bar | **Color Swatches** (16 Candy & Cyber Neon colors), **Stroke Size Slider**, and **Magic FX Tiles** (Glow, Lava, Slime, Toon, Rainbow, Sparkle, None). |

> [!TIP]
> **Minimalist Focus**: Panels never overlap your drawing point. Opening any bottom shelf automatically tucks other shelves away, ensuring your canvas stays completely visible.

---

### 1.2 The Finger-Pen Golden Rule [Play]

Remix 3D establishes a clear distinction between hand gestures and pen input:

```
┌────────────────────────────────────────────────────────────────────────┐
│                       THE FINGER-PEN GOLDEN RULE                       │
├───────────────────────────────────┬────────────────────────────────────┤
│  FINGERS NAVIGATE THE WORLD       │  THE STYLUS DRAWS THE ART          │
├───────────────────────────────────┼────────────────────────────────────┤
│  1 Finger  -> Orbit Turntable     │  Stylus Tip     -> Ink / Sculpt    │
│  2 Fingers -> Pan & Zoom          │  Pressure       -> Dynamic Width   │
│  3 Fingers -> Ortho/Flat Toggle   │  Barrel Button  -> Quick Radial    │
└───────────────────────────────────┴────────────────────────────────────┘
```

1. **One Finger on Glass**: Rotates the camera smoothly around your object (turntable orbit).
2. **Two Fingers on Glass**: Slides the camera horizontally/vertically (pan) or pinches/spreads to zoom in and out.
3. **Three Fingers on Glass**: Toggles between perspective 3D space and orthographic flat drafting mode.
4. **Stylus Pen Tip**: Paints, carves, and sculpts. Your palm resting on the glass is automatically ignored by hardware rejection.
5. **Accessibility Mode ("Finger Draw")**:
   - Do not have an active stylus? Open **Settings** in Zone A and toggle **Finger Draw**.
   - Your single finger now draws directly on the screen, while two-finger pinch and drag handle camera navigation.

---

### 1.3 15-Second Hands-On Walkthrough: Painting on a Toybox Template [Play]

Get drawing in 15 seconds:

```
[Tap Zone A Chip] ──> [Pick "Matilda The Cat"] ──> [Stroke with Stylus] ──> [Done!]
```

1. **Tap the Project Chip** in **Zone A** (top-left corner). The **Toybox Coloring Book** opens immediately.
2. **Select any 3D Template** (for example, *Matilda the Cat*, *Low-Poly Mech*, or *Speedster Car*).
3. The engine instantly centers the model, frames the camera, and arms the **Ribbon Brush**.
4. **Draw across the surface with your stylus**: The stroke adheres to the 3D surface, following every contour.
5. **Spin with one finger**: View your stroke wrapping around the 3D form in real time.

---

# Part 2: Spatial Drafting & Sculpting Workflow

### 2.1 The 3 Core Brushes [Play] vs Pro Presets [Pro]

In Play Mode, brush selection is focused on three versatile tools:

```
┌────────────────────────────────────────────────────────────────────────┐
│                       THE 3 CORE PLAY BRUSHES                          │
├───────────────────┬───────────────────┬────────────────────────────────┤
│ 1. VOLUMETRIC TUBE│ 2. RIBBON BRUSH   │ 3. STAR DUST                   │
│    (360° Air)     │    (Conformal)    │    (Sparkle / Fur)             │
│        ___        │     _________     │       *   .   *   .            │
│      /     \      │    /_________/    │     .   *   .   *              │
│     |       |     │                   │       *   .   *                │
│      \ ___ /      │   Hugs surfaces   │   Particle scatter for glow,   │
│   Full 3D volume  │   like satin tape │   magic dust, and organic hair │
└───────────────────┴───────────────────┴────────────────────────────────┘
```

1. **Volumetric Tube (`spatial_pipe`) [Play]**:
   - Creates a 3D cylindrical tube with rounded hemispherical end caps.
   - Looks consistent from every angle. Ideal for building 3D wireframes, pipes, neon signs, and floating structural curves.
2. **Calligraphic Ribbon (`conformal_bead`) [Play]**:
   - Creates a flat, tape-like band that conforms to underlying 3D models or follows your camera plane.
   - Responds to pen pressure for fluid calligraphic tapers. Ideal for clothing folds, character ink lines, and surface details.
3. **Star Dust (`stipple_texture`) [Play]**:
   - Generates a scatter particle stroke that sparkles along your path.
   - Perfect for stippling, fur textures, glowing cosmic trails, and fairy dust highlights.

#### The Pro Presets Suite [Pro]
Switching to **Pro Mode** unlocks the full library of 20 specialized tools, including:
- **Marker / Chisel**: Asymmetric rectangular stroke cross-section oriented at a constant calligraphic angle.
- **Fine Wire**: Single-pixel technical drafting stroke for architectural layouts.
- **Dynamic UV Texture Atlas**: Paints color directly into the model's 2048x2048 PNG texture atlas.

---

### 2.2 The 6 Magic FX Shaders [Play] vs Full PBR Mode [Pro]

Transform the visual character of your artwork with a single tap in **Zone D**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          THE 6 MAGIC FX TILES                          │
├───────────────┬───────────────┬────────────────────────────────────────┤
│ Neon Glow     │ Rim-light halo│ Glowing lasers, cyber accents, embers  │
│ Lava          │ Animated flow │ Molten rock, volcanic crusts           │
│ Slime         │ Organic pulse │ Alien goo, gelatinous blobs, venom     │
│ Cartoon       │ Cel-shaded    │ Anime linework, comic book shading     │
│ Rainbow       │ Spectral wave │ Shifting iridescent ribbons            │
│ Sparkle       │ Shimmering    │ Gemstones, stardust, disco glitter     │
│ None          │ Plain paint   │ Classic clean, unshaded pigment        │
└───────────────┴───────────────┴────────────────────────────────────────┘
```

> [!NOTE]
> Every Magic FX tile configures illumination, emission, and vertex animation automatically. Selecting **Neon Glow** immediately boosts emissive intensity and arms rim-lighting without requiring manual shader setup.

#### Full Physically Based Rendering (PBR) Engine [Pro]
In Pro Mode, expand the **Brush Settings** drawer to manually configure material parameters:
- **Base Color & Linear OKLab Gamut**
- **Roughness Slider** ($0.04 = \text{mirror polish}, 1.0 = \text{matte chalk}$)
- **Metalness Slider** ($0.0 = \text{dielectric plastic/wood}, 1.0 = \text{conductive gold/chrome}$)
- **Clearcoat & Transmission** (for glass, gemstones, and varnished surfaces)
- **27 Animated GLSL Shaders** (including Plasma, Hologram, Matrix Data Rain, Fireball, and Cyber Grid).

---

### 2.3 Shape Snapping: Lines, Circles, Polygons [Play]

Create geometric forms without manual ruler tools:

```
Draw rough shape ──> Hold pen steady for 300 ms ──> [Instant Perfect Snap!]
```

1. Select **Shape** in **Zone B** (or keep Draw active with shape-snapping enabled).
2. Draw a straight line, ellipse, circle, triangle, or rectangle in freehand 3D space.
3. **Hold the pen tip stationary against the glass for 300 milliseconds** at the end of the stroke.
4. The recognition engine analyzes stroke curvature, detects the geometric intent, and snaps the spline into a clean primitive:
   - **Lines**: Snaps to a straight vector with optional grid snapping.
   - **Circles & Ellipses**: Replaces wobbly loops with a circular or elliptical spline.
   - **Regular Polygons**: Snaps triangles, squares, and pentagons into planar closed polygons.

---

### 2.4 Instant Correction: Super Zap [Play] vs Volumetric Liquify [Pro]

Correcting mistakes in 3D should be quick and predictable:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SUPER ZAP VACUUM ERASER                         │
├────────────────────────────────────────────────────────────────────────┤
│       Raw Stroke Mesh                Drag Super Zap Across Stroke      │
│     ~~~~~~~~~~●~~~~~~~~~~       ───>                                   │
│   (Intersecting segments)            (Entire stroke cleanly purged)   │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Super Zap Vacuum Tool [Play]**:
   - Tap **Super Zap** in **Zone B** and drag across any stroke.
   - The engine identifies the intersecting curve and purges the entire stroke cleanly from the scene.
   - Leaves zero floating crumbs, micro-slivers, or orphan vertices.
   - If you make a mistake, tap **Undo** in **Zone A** to restore the stroke.

2. **Cutout Eraser Mode [Pro]**:
   - Slices through 3D ribbons and tubes like a knife, subtracting geometry to create holes, windows, and cutouts.

3. **Volumetric Liquify Brush [Pro]**:
   - Push, pull, expand, and pinch existing 3D geometry vertices smoothly like digital clay.

---

# Part 3: Spatial Navigation & The Dual-State Navigator

### 3.1 Viewport Touch Controls & View Snapping [Play]

Navigate 3D space fluidly:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      VIEWPORT TOUCH MANIPULATION                       │
├───────────────────────┬───────────────────────┬────────────────────────┤
│ 1-Finger Drag         │ 2-Finger Drag         │ 2-Finger Pinch / Twist │
│ Orbit turntable       │ Pan camera            │ Zoom in/out & roll     │
└───────────────────────┴───────────────────────┴────────────────────────┘
```

- **Snap to Orthographic Views**: Tap any axis pip on the mini-cube gizmo:
  - **Front ($+Z$)** / **Back ($-Z$)**
  - **Top ($+Y$)** / **Bottom ($-Y$)**
  - **Right ($+X$)** / **Left ($-X$)**
- **Framing Objects**: Double-tap empty canvas space with one finger to center and frame the current selection.

---

### 3.2 Flat Screen Mode [Play]

Located in **Zone C**, the Dual-State Navigator defaults to **Flat Screen** mode:

```
┌────────────────────────────────────────────────────────────────────────┐
│                           FLAT SCREEN MODE                             │
├────────────────────────────────────────────────────────────────────────┤
│                     ┌────────────────────────┐                         │
│                     │       ▲ Up             │                         │
│                     │  ◄──  +  ──►           │                         │
│                     │      Crosshair         │                         │
│                     │       ▼ Down           │                         │
│                     └────────────────────────┘                         │
│   Dragging inside moves the object across your 2D display glass        │
│   Pivot point stays anchored to the screen-center crosshair            │
└────────────────────────────────────────────────────────────────────────┘
```

- **Screen-Space Translation**: Dragging within the inner circle moves the selected 3D object parallel to your screen glass.
- **Predictable Framing**: Reposition objects intuitively without altering camera depth ($Z$).
- **Centroid Pivot**: Rotations pivot around the center of your screen, matching 2D graphic design workflows.

---

### 3.3 3D World Mode & The Orthographic Safety Guard [Play]

Tap the mode toggle on the Navigator header to enter **3D World** mode:

```
┌────────────────────────────────────────────────────────────────────────┐
│                            3D WORLD MODE                               │
├────────────────────────────────────────────────────────────────────────┤
│                           [G] +Y (Green)                               │
│                            │                                           │
│                            │   Concentric Rotation Rings               │
│                            │  /   (Dashed Arcs)                        │
│                            o ─ ─ ─ ─ ─ [R] +X (Red)                    │
│                           /                                            │
│                          /                                             │
│                       [B] +Z (Blue)                                    │
│                                                                        │
│   Chunky colored nodes move objects along primary 3D world axes.       │
│   Dashed arcs rotate objects along precise 15° snap increments.        │
└────────────────────────────────────────────────────────────────────────┘
```

- **Red Node ($+X$)**: Slide object along the world Left/Right axis.
- **Green Node ($+Y$)**: Slide object along the world Up/Down axis.
- **Blue Node ($+Z$)**: Slide object along the world Forward/Back depth axis.
- **Dashed Concentric Arcs**: Drag around the ring to rotate in $15^\circ$ tactile increments.

#### The Orthographic Safety Guard
When drawing in an orthographic projection (Front, Top, or Side view), navigating depth can accidentally misplace strokes. The engine activates an **Orthographic Safety Guard**:
- The depth axis locks automatically.
- A status toast appears: **"Depth locked — you're drawing flat"**.
- Your strokes stay coplanar, making technical orthographic drafting predictable.

---

# Part 4: Stage, Lighting & Reference Scaffolding

### 4.1 1-Tap Atmospheric Presets & Celestial Dome [Play / Pro]

Set up scene atmosphere and lighting from the stage settings drawer:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ATMOSPHERIC SKY PRESETS                         │
├───────────────┬────────────────────────────────────────────────────────┤
│ Dawn / Golden │ Warm golden sunlight, soft morning horizon fog         │
│ High Noon     │ Crisp overhead lighting, physical Rayleigh scattering  │
│ Sunset        │ Rich crimson & violet hues, deep directional shadows   │
│ Cyber Night   │ Neon moonlight, dark starfield, bioluminescent glow    │
│ Studio Void   │ Pure neutral gray backdrop for portfolio renders       │
└───────────────┴────────────────────────────────────────────────────────┘
```

#### The Interactive Celestial Dome [Pro]
Open the **Celestial Dome Widget** to position the sun and moon:
- Drag the glowing sun disc across the dome: Rayleigh and Mie scattering update dynamically, shifting the atmosphere from noon blue to golden hour orange.
- Adjust **Volumetric Cloud Coverage** and **Crepuscular God Rays** for cinematic outdoor lighting.

---

### 4.2 Tracing Mode: Floating 2D Clipboard Overlays [Play / Pro]

Use reference art and turnarounds directly inside 3D space:

```
[Copy Reference Image] ──> [Paste into Remix 3D] ──> [Trace in 3D Space]
```

1. Copy any image to your clipboard and press `Ctrl+V` (or tap **Import Image** in the stage drawer).
2. The image appears as a semi-transparent floating reference plane.
3. **Display Modes**:
   - **Screen HUD Lock**: The reference stays pinned to your screen glass like tracing paper while you rotate your 3D model behind it.
   - **World Anchor**: The reference sits in 3D world space, letting you align front and side turnaround sheets with your 3D model.
4. Use the **Opacity Slider** to blend between the reference image and your 3D strokes.

---

### 4.3 Custom 3D Guides & Symmetry Planes [Play / Pro]

Create balanced, symmetrical 3D artwork:

```
┌────────────────────────────────────────────────────────────────────────┐
│                         BILATERAL 3D SYMMETRY                          │
├────────────────────────────────────────────────────────────────────────┤
│           Left Hand Stroke                 Right Hand Mirror           │
│                 \                                 /                    │
│                  \           │ Mirror Plane      /                     │
│                   o ──────── │ ──────── o                              │
│                  /           │           \                             │
│                 /            │            \                            │
└────────────────────────────────────────────────────────────────────────┘
```

1. Tap **Symmetry** in the top bar to enable bilateral reflection.
2. Choose your mirror axis:
   - **X Plane (Left/Right)**: Standard character and vehicle modeling.
   - **Y Plane (Top/Bottom)**: Architectural reflection and decorative arches.
   - **Z Plane (Front/Back)**: Symmetrical mechanical details.
3. Every stroke you draw is mirrored across the plane in real time.

---

# Part 5: Pro Studio, Conversion & Pipeline Delivery

### 5.1 The Pro Studio Drawer [Pro]

Access the complete CAD and 3D modeling toolset:

```
[Settings] ──> [Toggle "Advanced Tools (Pro)"] ──> [Full CAD Suite Unlocked]
```

To enable Pro Mode:
1. Tap the **Settings** gear icon in **Zone A**.
2. Toggle **"Advanced Tools"**.
3. The left dock expands to reveal the full parametric CAD and sculpting suite:
   - **Swept Lofts & Bent Guides**: Extrude 3D cross-section profiles along interactive spline paths.
   - **Decimation & Remeshing**: Reduce vertex counts for game engines using edge-collapse optimization.
   - **Raycast Precision Controls**: Fine-tune contact offsets, surface snapping thresholds, and collision meshes.

---

### 5.2 Multi-Layer GPU Compositor & Blend Modes [Pro]

Manage complex projects with a layer-based workflow:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        GPU LAYER COMPOSITOR                            │
├─────────┬───────────────────┬─────────┬─────────┬──────────────────────┤
│ Layer   │ Name              │ Opacity │ Blend   │ Status               │
├─────────┼───────────────────┼─────────┼─────────┼──────────────────────┤
│ 3       │ Neon Highlights   │ 100%    │ Additive│ Visible, Unlocked    │
│ 2       │ Ink Outlines      │ 100%    │ Normal  │ Visible, Locked      │
│ 1       │ Flat Colors       │ 85%     │ Normal  │ Visible, Unlocked    │
│ 0       │ Scaffolding Guide │ 30%     │ Screen  │ Hidden (Muted)       │
└─────────┴───────────────────┴─────────┴─────────┴──────────────────────┘
```

- **Layer Controls**: Create up to 16 independent drawing layers. Hide, isolate, duplicate, or reorder layers without destructively flattening geometry.
- **6 GPU Blend Modes**:
  - **Normal**: Standard opaque alpha blending.
  - **Multiply**: Shadows and shading passes.
  - **Screen**: Soft atmospheric lighting.
  - **Additive**: High-intensity lasers, fire, and magic FX.
  - **Overlay**: Contrast boost.
  - **Darken**: Vignettes and ambient occlusion.

---

### 5.3 Universal 8-Format Converter & Google Draco Compression [Pro]

Import assets from any 3D workflow and export production-ready models:

```
Supported Import Formats:
  .GLB / .GLTF  |  .OBJ (+ .MTL)  |  .FBX  |  .3DS  |  .STL  |  .PLY  |  .DAE  |  .ZIP
```

#### Automated Model Normalization
Imported models are automatically scaled to a standard $2.0\text{ m}$ height, centered at $(0, 0, 0)$, and aligned to the ground floor plane ($Y = 0$).

#### Google Draco WASM Compression Suite
Export compressed GLB files directly from the browser:

```
Raw Uncompressed GLB (42.8 MB) ──> [Draco WASM Quantization] ──> Compressed GLB (3.9 MB)
                                                                 (91% Size Reduction!)
```

- **Position Quantization (14-bit default)**: Preserves geometry within $0.06\text{ mm}$ spatial tolerance while shrinking vertex data.
- **Normal Quantization (10-bit)**: Compresses surface normals using octahedral projection.
- **Texture UV Quantization (10-bit)**: Retains crisp texture alignments without drift.

---

### 5.4 WebXR 1:1 Scale Spatial Preview [Play / Pro]

Review your artwork in augmented or virtual reality:

```
[Tap "AR Preview"] ──> [Scan Floor / Tabletop] ──> [Inspect at True 1:1 Scale]
```

1. Tap **AR / VR Preview** in the export drawer on a compatible device (Android Chrome, Meta Quest browser, or Apple Vision Pro).
2. Point your camera at a flat surface to place your model.
3. Walk around your creation to evaluate physical proportions, scale, and lighting in real-world space.

---

### 5.5 Complete Shortcut Matrix & Troubleshooting [Play / Pro]

#### Master Shortcut Matrix

| Input Action | Keyboard / Mouse Shortcut | Stylus & Touch Gesture | Mode |
|---|---|---|---|
| **Draw / Paint** | Left Click + Drag | Pen Tip on Glass | Play & Pro |
| **Orbit Turntable** | Right Click + Drag (or `Alt` + Left Click) | 1 Finger Drag | Play & Pro |
| **Pan Canvas** | Middle Click + Drag (or `Space` + Drag) | 2 Finger Drag | Play & Pro |
| **Zoom View** | Mouse Scroll Wheel | 2 Finger Pinch / Spread | Play & Pro |
| **Snap Ortho View** | Numpad `1` (Front), `3` (Side), `7` (Top) | 3 Finger Tap | Play & Pro |
| **Undo** | `Ctrl + Z` (Mac: `Cmd + Z`) | 2 Finger Tap (or Zone A button) | Play & Pro |
| **Redo** | `Ctrl + Y` (Mac: `Cmd + Shift + Z`) | 3 Finger Tap (or Zone A button) | Play & Pro |
| **Super Zap** | `X` | Tap Super Zap icon in Zone B | Play & Pro |
| **Shape Snapping** | Hold `Shift` during draw | Hold pen stationary for 300 ms | Play & Pro |
| **Radial Quick Menu** | Hold `Space` | Press Stylus Barrel Button | Play & Pro |
| **Color Studio** | `C` | Long-press swatch in Zone D | Pro |
| **Toggle Pro Mode** | `Tab` | Settings -> "Advanced tools" | Play & Pro |

---

#### Troubleshooting Guide

##### 1. Why do my strokes appear in empty air instead of sticking to the model?
- **Solution**: The **Ribbon Brush** (`conformal_bead`) is designed for surface inking. Ensure your brush is set to Ribbon or Conformal, and verify that your stylus tip initiates contact over the model geometry.

##### 2. Why does my palm leave unwanted marks when drawing?
- **Solution**: Hardware palm rejection requires active stylus events. Ensure your stylus battery is charged. If using finger input, turn on **Touch Rejection Guard** in Settings.

##### 3. How do I restore a stroke accidentally erased with Super Zap?
- **Solution**: Super Zap actions integrate directly into the unified undo history. Tap **Undo** (`Ctrl+Z`) in Zone A to restore the entire stroke.

##### 4. Performance feels sluggish on high-poly models on older tablets.
- **Solution**: Open **Settings -> Performance** and select **Performance Profile: Battery Saver**. This reduces viewport resolution scale to $1.0\times$, caps MSAA at $2\times$, and enables BVH bounding-box culling.

---

# Goal-Oriented Step-by-Step Recipes

### Recipe A: Inking a Character Buck [Play / Pro]
**Goal**: Load a 3D mannequin, mirror your linework symmetrically, and ink character costume details directly onto the surface.

```
┌────────────────────────────────────────────────────────────────────────┐
│                     RECIPE A: INK A CHARACTER BUCK                     │
├────────────────────────────────────────────────────────────────────────┤
│  [1. Open Toybox]  ──>  [2. Arm Ribbon]  ──>  [3. Symmetry On] ──> Ink!│
└────────────────────────────────────────────────────────────────────────┘
```

1. **Spawn the Base Model**:
   - Tap the Project Chip in **Zone A** to open the **Toybox**.
   - Select **Anime Buck** or **Matilda the Cat** from the Characters category.
   - The model centers automatically, and the camera frames the torso.
2. **Configure Your Brush & Symmetry**:
   - Select **Draw** in **Zone B** and choose the **Ribbon Brush** (`conformal_bead`).
   - Tap **Symmetry** in the top bar to enable the **X Plane** mirror. A vertical dashed guide line indicates the active mirror plane.
3. **Ink the Surface**:
   - Choose a vibrant color from the 16-swatch palette in **Zone D** (e.g., *Cyber Cyan* or *Hot Pink*).
   - Draw costume seams, armor plates, or facial contours directly across the character's surface.
   - Notice how the stroke conforms to the 3D curvature while mirroring across the opposite side.
4. **Inspect in 3D**:
   - Use one finger to orbit around the character and verify stroke placement from multiple angles.

---

### Recipe B: Carving Negative Forms & Cutouts [Pro]
**Goal**: Cut out negative spaces, window openings, and decorative patterns through 3D ribbons and tubes.

```
┌────────────────────────────────────────────────────────────────────────┐
│                     RECIPE B: CARVE NEGATIVE FORMS                     │
├────────────────────────────────────────────────────────────────────────┤
│  [1. Switch to Pro] ──> [2. Set Cutout Eraser] ──> [3. Slice Mesh]     │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Enter Pro Mode & Draw a Base Form**:
   - Ensure Pro Mode is active (via Settings or `Tab`).
   - Select the **Volumetric Tube** or wide **Ribbon Brush** and draw a sweeping arc across the viewport.
2. **Configure the Cutout Eraser**:
   - Long-press the Eraser tool in **Zone B** to open the options drawer.
   - Switch the mode from **Vacuum** to **Cutout**.
   - Adjust the **Cutout Radius** slider to match the desired opening size.
3. **Carve the Geometry**:
   - Slice your stylus across the stroke where you want to carve openings.
   - The engine subtracts volume from the existing stroke geometry, creating crisp negative windows without deleting the entire curve.
4. **Finish with Magic FX**:
   - Switch to **Neon Glow** in Zone D and paint an interior core through the hollow cutout.

---

### Recipe C: Sweeping an Aerodynamic Arch [Pro]
**Goal**: Create a parametric curved architectural structure using Catmull-Rom spline guides and extruded profiles.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   RECIPE C: SWEEP AN AERODYNAMIC ARCH                  │
├────────────────────────────────────────────────────────────────────────┤
│ [1. Bent Guide Tool] ──> [2. U-Channel Profile] ──> [3. Bake Geometry] │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Draw the Guide Spline**:
   - Open the **Pro CAD Drawer** on the left dock and select **Bent Guides / Swept Lofts**.
   - Tap three points in 3D space to define a smooth Catmull-Rom arch.
   - Use the 3D Navigator in **Zone C** to adjust control point heights.
2. **Select the Extrusion Cross-Section**:
   - In the loft settings panel, set the **Cross-Section Profile** to **U-Channel** (or *Aerodynamic Wing*).
   - Adjust the **Profile Scale** slider to $0.15\text{ m}$.
3. **Tune Tension & Twist**:
   - Slide the **Spline Tension** slider to $0.5$ for a smooth, natural curve.
   - Enable **Rotation Minimizing Frames (RMF)** to ensure the extruded channel never twists unnaturally through inflection points.
4. **Bake into Production Geometry**:
   - Tap **Bake Mesh**. The parametric spline converts into standard editable vertex buffers ready for Draco export.
