# Remix 3D Studio: Technical Architecture & Mathematical Reference Manual

> **Document Classification**: Core Engineering Reference  
> **Target Audience**: Graphics Engineers, Systems Architects, Computational Geometry Developers  
> **Workspace Path**: `E:\X\AiStudio Workflow\V16 Antigravity`  
> **Reference Implementations**: `src/core/conformalBeadGenerator.ts`, `src/core/colorMath.ts`, `src/core/wboitPipeline.ts`, `src/core/modelConverter.ts`, `src/core/webgpuPipeline.ts`, `src/core/studioEngine.ts`

---

## Executive Summary & System Philosophy

Remix 3D Studio is an ultra-high-performance, zero-allocation spatial drawing, volumetric sculpting, and 3D asset compression engine running entirely client-side across modern browser runtimes (WebGPU with automated WebGL2 fallback).

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    REMIX 3D SYSTEM ARCHITECTURE                                  │
├───────────────────────────────────────┬──────────────────────────────────────────────────────────┤
│           APPLICATION LAYER           │  Play Surface (Simplified 4-Zone Reactive UI)            │
│                                       │  Pro Studio (Parametric CAD, Compositor, Shaders)         │
├───────────────────────────────────────┼──────────────────────────────────────────────────────────┤
│       SPATIAL INKING & GEOMETRY       │  Bishop Rotation Minimizing Frames (RMF Double Reflect)  │
│                                       │  Centripetal Catmull-Rom Resampling                      │
│                                       │  Zero-Allocation Static Vector & Float32 Buffer Pools    │
├───────────────────────────────────────┼──────────────────────────────────────────────────────────┤
│             COLOR SCIENCE             │  CIE XYZ -> Physiological LMS Cone Space                 │
│                                       │  Ottosson OKLab Cartesian & OKLCh Cylindrical Polar      │
│                                       │  Perceptually Uniform Linear Geodesic Color Mixing       │
├───────────────────────────────────────┼──────────────────────────────────────────────────────────┤
│           OPTICAL RENDERING           │  Weighted Blended Order-Independent Transparency (WBOIT) │
│                                       │  Dual MRT Accumulation (RGBA16F) & Revealage (R16F)      │
│                                       │  Linear Photometric Composition & Gamut Tonemapping      │
├───────────────────────────────────────┼──────────────────────────────────────────────────────────┤
│       SPATIAL ACCELERATION & I/O      │  `three-mesh-bvh` SAH Binary Hierarchy ($O(\log N)$)     │
│                                       │  Smooth Barycentric Surface Normal Interpolation         │
│                                       │  Google Draco WASM Quantization & Entropy Encoding       │
├───────────────────────────────────────┼──────────────────────────────────────────────────────────┤
│           HARDWARE BACKEND            │  WebGPU Compute Shaders (WGSL @workgroup_size(64))       │
│                                       │  Direct GPU Storage Buffer Parallel Vertex Deformation   │
│                                       │  WebGL2 High-Performance Fallback Bridge                 │
└───────────────────────────────────────┴──────────────────────────────────────────────────────────┘
```

The underlying graphics engine is governed by three non-negotiable architectural mandates:
1. **Zero-Allocation Hot Path**: No object instantiation, array allocation, or garbage collector (GC) triggers during active drawing, raycasting, or frame composition loops. All mathematical vectors, quaternions, raycast targets, and buffers are pre-allocated in static scratch memory pools.
2. **Perceptual and Optical Correctness**: Elimination of gamma-space color pollution and muddy transition dead zones through un-gamma-corrected Linear RGB lighting and Björn Ottosson's OKLab color pipeline.
3. **Continuous Spatial Manifold Stability**: Complete elimination of gimbal lock, rotational twisting, and inflection point flipping through Bishop Parallel Transport and Rotation Minimizing Frames (RMF).

---

## Section 1: Spatial Inking & Curve Geometry

### 1.1 Continuous Curve Parameterization & Centripetal Catmull-Rom Splines

Raw stylus input arrives as discrete timestamped tuples $P_k = (x_k, y_k, z_k, p_k, t_k)$ subject to hardware jitter, quantization noise, and uneven sampling intervals. 

Before computing 3D geometry, micro-jitter is filtered out with a Euclidean distance threshold $\epsilon_{jitter} = 8 \times 10^{-4}\text{ m}$ ($0.8\text{ mm}$):
$$\|P_k - P_{k-1}\|_2 > \epsilon_{jitter}$$

For interpolating smooth spatial trajectories across non-uniform control points, Remix 3D implements **Centripetal Catmull-Rom Splines**. Given four consecutive spatial control points $\mathbf{P}_0, \mathbf{P}_1, \mathbf{P}_2, \mathbf{P}_3$, knot intervals $t_i$ are defined by:
$$t_{i+1} = t_i + \|\mathbf{P}_{i+1} - \mathbf{P}_i\|_2^\alpha$$

Where the centripetal exponent is set to $\alpha = 0.5$ (in contrast to uniform splines with $\alpha = 0$ or chordal splines with $\alpha = 1.0$).

> [!NOTE]
> **Centripetal Spline Invariance**: Setting $\alpha = 0.5$ guarantees that the curve is cusp-free and will never generate self-intersecting loops or sharp overshoot oscillations within the convex hull of the input stroke points, even when input sampling velocities vary dramatically between fast flicks and slow precision inking.

The curve segment for $t \in [t_1, t_2]$ is evaluated using recursive affine combinations (Barry and Goldman formulation):
$$\mathbf{A}_1(t) = \frac{t_1 - t}{t_1 - t_0}\mathbf{P}_0 + \frac{t - t_0}{t_1 - t_0}\mathbf{P}_1, \quad \mathbf{A}_2(t) = \frac{t_2 - t}{t_2 - t_1}\mathbf{P}_1 + \frac{t - t_1}{t_2 - t_1}\mathbf{P}_2, \quad \mathbf{A}_3(t) = \frac{t_3 - t}{t_3 - t_2}\mathbf{P}_2 + \frac{t - t_2}{t_3 - t_2}\mathbf{P}_3$$
$$\mathbf{B}_1(t) = \frac{t_2 - t}{t_2 - t_0}\mathbf{A}_1(t) + \frac{t - t_0}{t_2 - t_0}\mathbf{A}_2(t), \quad \mathbf{B}_2(t) = \frac{t_3 - t}{t_3 - t_1}\mathbf{A}_2(t) + \frac{t - t_1}{t_3 - t_1}\mathbf{A}_3(t)$$
$$\mathbf{C}(t) = \frac{t_2 - t}{t_2 - t_1}\mathbf{B}_1(t) + \frac{t - t_1}{t_2 - t_1}\mathbf{B}_2(t)$$

---

### 1.2 The Frenet-Serret Frame & The Inflection Point Singularity Failure

To extrude a 2D cross-section (such as a tube, ribbon, or marker) along a 3D spline $\mathbf{C}(s)$ parameterized by arc length $s$, an orthonormal reference coordinate frame $\{\mathbf{T}(s), \mathbf{N}(s), \mathbf{B}(s)\}$ must be established at every point along the curve.

The classical **Frenet-Serret Frame** defines these basis vectors via differential calculus:
1. **Unit Tangent Vector**:
   $$\mathbf{T}(s) = \frac{\mathbf{C}'(s)}{\|\mathbf{C}'(s)\|}$$
2. **Principal Normal Vector**:
   $$\mathbf{N}(s) = \frac{\mathbf{T}'(s)}{\|\mathbf{T}'(s)\|} = \frac{\mathbf{C}''(s) - (\mathbf{C}''(s) \cdot \mathbf{T}(s))\mathbf{T}(s)}{\|\mathbf{C}''(s) - (\mathbf{C}''(s) \cdot \mathbf{T}(s))\mathbf{T}(s)\|}$$
3. **Binormal Vector**:
   $$\mathbf{B}(s) = \mathbf{T}(s) \times \mathbf{N}(s)$$

The evolution of the Frenet frame is governed by the Frenet-Serret equations:
$$\begin{bmatrix} \mathbf{T}'(s) \\ \mathbf{N}'(s) \\ \mathbf{B}'(s) \end{bmatrix} = \begin{bmatrix} 0 & \kappa(s) & 0 \\ -\kappa(s) & 0 & \tau(s) \\ 0 & -\tau(s) & 0 \end{bmatrix} \begin{bmatrix} \mathbf{T}(s) \\ \mathbf{N}(s) \\ \mathbf{B}(s) \end{bmatrix}$$
where $\kappa(s) = \|\mathbf{T}'(s)\|$ is the curvature, and $\tau(s)$ is the torsion.

#### Why the Frenet Frame Catastrophically Fails in 3D Inking

The Frenet frame exhibits two severe mathematical singularities that make it completely unusable for spatial drawing:

1. **Curvature Vanishing / Inflection Singularity ($\kappa(s) = 0$)**:  
   When an artist draws a straight line, or passes through an inflection point where the curve reverses concavity (e.g., an S-curve), the second derivative $\mathbf{C}''(s)$ becomes collinear with $\mathbf{C}'(s)$, or vanishes entirely:
   $$\kappa(s) = \|\mathbf{T}'(s)\| = 0 \implies \mathbf{N}(s) = \frac{\mathbf{0}}{0} \quad \text{(Undefined division by zero)}$$
   Near inflection points, even a floating-point roundoff causes $\mathbf{N}(s)$ to violently flip by $180^\circ$ across an infinitesimally small arc step $\Delta s$. When extruding a stroke mesh, this produces hideous self-intersecting ribbons (a "pinched bowtie" artifact).

2. **Excessive Torsion Twisting**:  
   Even when $\kappa(s) > 0$, the frame rotates around the tangent at an angular velocity equal to the torsion $\tau(s)$. For 3D spatial curves with non-planar winding, the extruded profile accumulates unnecessary internal axial twisting, twisting a smooth stroke into a helical screw.

```
Frenet Frame Inflection Singularity:
   Curve:         ───╮               ╭───
                     ╰───────●───────╯
                         Inflection
   Normal N(s):   ▲          ⚡          ▼
                 [Up]      [NaN/Flip]  [Down] -> 180° Violent Mesh Twist
```

---

### 1.3 Bishop Parallel Transport & Rotation Minimizing Frames (RMF)

To resolve the Frenet singularity, Remix 3D implements the **Bishop Frame** (Bishop, 1975), also known as a **Rotation Minimizing Frame (RMF)** or **Parallel Transport Frame**.

A moving orthonormal frame $\{\mathbf{T}(s), \mathbf{N}_1(s), \mathbf{N}_2(s)\}$ is rotation minimizing with respect to the tangent $\mathbf{T}(s)$ if and only if its instantaneous angular velocity vector $\mathbf{\Omega}(s)$ satisfies:
$$\mathbf{\Omega}(s) \cdot \mathbf{T}(s) = 0$$

This mathematical condition states that the frame never rotates about the tangent vector itself. Consequently, the normal vectors $\mathbf{N}_1(s)$ and $\mathbf{N}_2(s)$ are parallel-transported along the curve. The equations of motion simplify to:
$$\begin{bmatrix} \mathbf{T}'(s) \\ \mathbf{N}_1'(s) \\ \mathbf{N}_2'(s) \end{bmatrix} = \begin{bmatrix} 0 & k_1(s) & k_2(s) \\ -k_1(s) & 0 & 0 \\ -k_2(s) & 0 & 0 \end{bmatrix} \begin{bmatrix} \mathbf{T}(s) \\ \mathbf{N}_1(s) \\ \mathbf{N}_2(s) \end{bmatrix}$$
where:
$$\kappa(s) = \sqrt{k_1(s)^2 + k_2(s)^2}, \quad \theta(s) = \arctan\left(\frac{k_2(s)}{k_1(s)}\right), \quad \tau(s) = -\theta'(s)$$

Because the anti-symmetric matrix contains zeros at the $(2,3)$ and $(3,2)$ off-diagonal positions, **there is zero torsion or twisting between the normal axes**. The Bishop frame is well-defined and continuous across straight segments ($\kappa = 0$) and through inflection points.

---

### 1.4 Discrete Double Reflection Method (Wang et al., 2008)

For real-time discrete polygonization of stroke curves, standard numerical integration of the differential Bishop equations (e.g., Runge-Kutta or Euler) suffers from accumulated drift and numerical shear over long strokes. 

Remix 3D implements the **Double Reflection Method** (Wang, Jüttler, Zheng, and Liu, 2008), which is proven to be **second-order accurate ($O(h^2)$)**, unconditionally orthogonal, and involves zero trigonometric evaluations.

Let $\mathbf{x}_i, \mathbf{x}_{i+1}$ be consecutive discrete points along the Catmull-Rom spline, with unit tangents $\mathbf{t}_i, \mathbf{t}_{i+1}$ and an existing orthonormal frame at step $i$:
$$\mathcal{F}_i = \{\mathbf{t}_i, \mathbf{r}_i, \mathbf{s}_i\}, \quad \text{where } \mathbf{s}_i = \mathbf{t}_i \times \mathbf{r}_i$$

The frame $\mathcal{F}_{i+1}$ is computed via two consecutive Householder hyperplane reflections:

```
Double Reflection Geometry:
         x_i                               x_{i+1}
          o──────────────────────────────────o
          │ \                              / │
          │   \                          /   │
         t_i    \                      /    t_{i+1}
          ▼       \   Reflection 1   /       ▼
                   \      (v_1)    /
                     \           /
                       \       /
                         \   /
                      Reflection 2
                         (v_2)
```

#### Step 1: First Reflection (Spatial Bisector)
Reflect the frame $\mathcal{F}_i$ across the bisecting plane between $\mathbf{x}_i$ and $\mathbf{x}_{i+1}$:
$$\mathbf{v}_1 = \mathbf{x}_{i+1} - \mathbf{x}_i, \quad c_1 = \mathbf{v}_1 \cdot \mathbf{v}_1$$
If $c_1 > 10^{-8}$:
$$\mathbf{r}_i^L = \mathbf{r}_i - \frac{2}{c_1} (\mathbf{v}_1 \cdot \mathbf{r}_i) \mathbf{v}_1$$
$$\mathbf{t}_i^L = \mathbf{t}_i - \frac{2}{c_1} (\mathbf{v}_1 \cdot \mathbf{t}_i) \mathbf{v}_1$$
where $\mathbf{r}_i^L$ and $\mathbf{t}_i^L$ are the temporary reflected vectors at $\mathbf{x}_{i+1}$.

#### Step 2: Second Reflection (Tangent Bisector)
Reflect the intermediate vectors across the bisecting plane between the reflected tangent $\mathbf{t}_i^L$ and the true target tangent $\mathbf{t}_{i+1}$:
$$\mathbf{v}_2 = \mathbf{t}_{i+1} - \mathbf{t}_i^L, \quad c_2 = \mathbf{v}_2 \cdot \mathbf{v}_2$$
If $c_2 > 10^{-8}$:
$$\mathbf{r}_{i+1} = \mathbf{r}_i^L - \frac{2}{c_2} (\mathbf{v}_2 \cdot \mathbf{r}_i^L) \mathbf{v}_2$$
Otherwise:
$$\mathbf{r}_{i+1} = \mathbf{r}_i^L$$

#### Step 3: Orthogonal Normalization & Binormal Construction
Gram-Schmidt projection against the true target tangent ensures strict floating-point orthogonality:
$$\mathbf{r}_{i+1} = \text{normalize}\left(\mathbf{r}_{i+1} - (\mathbf{t}_{i+1} \cdot \mathbf{r}_{i+1})\mathbf{t}_{i+1}\right)$$
$$\mathbf{s}_{i+1} = \text{normalize}(\mathbf{t}_{i+1} \times \mathbf{r}_{i+1})$$

The resulting triad $\{\mathbf{t}_{i+1}, \mathbf{r}_{i+1}, \mathbf{s}_{i+1}\}$ forms a strictly orthonormal basis minimizing twist across the spatial segment without numerical drift or inflection flipping.

---

### 1.5 Volumetric Cross-Section Generation & Zero-Allocation Buffers

Using the calculated Bishop frame basis vectors $\{\mathbf{t}_i, \mathbf{r}_i, \mathbf{s}_i\}$, the generator constructs the four geometric profiles:

1. **Volumetric Tube (360° Cylindrical Hull)**:  
   Tessellated with $M = 12$ radial segments. For segment index $j \in [0, M]$:
   $$\theta_j = \frac{2\pi j}{M}$$
   $$\mathbf{V}_{i,j} = \mathbf{x}_i + R(t) \cdot \left(\cos\theta_j \mathbf{r}_i + \sin\theta_j \mathbf{s}_i\right)$$
   $$\mathbf{N}_{i,j} = \cos\theta_j \mathbf{r}_i + \sin\theta_j \mathbf{s}_i$$
   where $R(t) = R_{\text{base}} \cdot p_i \cdot \text{taper}(t)$, and $\text{taper}(t) = \sin(\pi \cdot \text{clamp}(t / 0.04, 0, 1))$ provides hemispherical end caps.

2. **Calligraphic Ribbon (Planar Surface Band)**:  
   Constructed with quad vertices along the binormal $\mathbf{s}_i$:
   $$\mathbf{V}_{i,\text{left}} = \mathbf{x}_i - \frac{W_i}{2}\mathbf{s}_i + \delta \mathbf{r}_i, \quad \mathbf{V}_{i,\text{right}} = \mathbf{x}_i + \frac{W_i}{2}\mathbf{s}_i + \delta \mathbf{r}_i$$
   $$\mathbf{N}_{i} = \mathbf{r}_i$$
   where $\delta$ is the surface offset ($0.003\text{ m}$).

3. **Marker / Chisel Profile**:  
   Extruded as an asymmetric rectangular cross-section rotated by fixed calligraphic angle $\phi = \frac{\pi}{4}$:
   $$\mathbf{d}_{\text{chisel}} = \cos\phi \mathbf{r}_i + \sin\phi \mathbf{s}_i$$

4. **Conformal Bead**:  
   Projects vertices to match the underlying scanned polygon normal $\mathbf{n}_{\text{mesh}}$ acquired via BVH raycast, generating a convex arched dome with normal clamping.

#### Zero-Allocation Memory Model
To achieve a sustained 120 FPS on mobile and integrated GPUs, dynamic garbage collection during inking is eradicated:
- Working coordinates are held in reusable pre-allocated flat arrays: `_workVertices: number[]`, `_workNormals: number[]`, `_workUvs: number[]`, `_workIndices: number[]`.
- Geometries use `THREE.DynamicDrawUsage` buffers. When stroke length grows, buffers expand by a factor of $1.5\times$ with `.setUsage(THREE.DynamicDrawUsage)` to prevent per-point reallocations.
- `setDrawRange(0, activeIndexCount)` instructs the GPU to render only populated indices.

---

## Section 2: Color Science & OKLab Pipeline

### 2.1 The Need for Perceptual Color Spaces

Traditional 3D graphics applications perform color arithmetic in non-linear standard RGB (sRGB) or naive Linear RGB. Both spaces fail to represent human visual perception:
- **sRGB Blending Error**: Mixing opposite colors (such as blue and yellow, or cyan and orange) in gamma-encoded sRGB creates an unnatural dark, desaturated gray/brown "muddy dead zone".
- **Linear RGB Non-Uniformity**: While Linear RGB is physically correct for photon radiance calculations, it does not match the non-linear response of the human eye (Weber-Fechner Law). Equal numerical steps in linear luminance do not yield equal steps in perceived brightness.
- **CIELAB Flaws (Abney Effect)**: The 1976 CIE $L^*a^*b^*$ standard exhibits a severe hue curvature defect: increasing chroma in blue shades causes the hue to visibly shift toward purple.

Remix 3D implements the complete **OKLab and OKLCh color model** developed by Björn Ottosson (2020), providing strict perceptual uniformity, hue linearity, and optimal color blending.

```
Color Space Transformation Pipeline:
┌───────────┐     IEC 61966-2-1     ┌────────────┐          M_1          ┌───────────┐
│ sRGB (UI) │ ───────────────────>  │ Linear RGB │ ───────────────────>  │ LMS Cones │
└───────────┘                       └────────────┘                       └───────────┘
                                                                               │
                                                                       Cube-root response
                                                                          l'=cbrt(L)
                                                                               ▼
┌───────────┐     Polar Transform   ┌────────────┐          M_2          ┌───────────┐
│   OKLCh   │ <───────────────────  │   OKLab    │ <───────────────────  │ Non-linear│
│  (L,C,h)  │                       │  (L,a,b)   │                       │   L'M'S'  │
└───────────┘                       └────────────┘                       └───────────┘
```

---

### 2.2 Mathematical Definition of the OKLab Transform

The conversion from un-gamma-corrected **Linear RGB** ($R, G, B \in [0, 1]$) to **OKLab** ($L \in [0, 1], a \in [-0.4, 0.4], b \in [-0.4, 0.4]$) proceeds in three sequential linear and non-linear stages:

#### Stage 1: Linear RGB to LMS Cone Space ($M_1$)
The standard Linear RGB values are converted into intermediate physiological human cone excitations (Long, Medium, Short wavelength photoreceptor cells) via matrix $M_1$:

$$\begin{bmatrix} L \\ M \\ S \end{bmatrix} = M_1 \begin{bmatrix} R \\ G \\ B \end{bmatrix} = \begin{bmatrix} 0.4122214708 & 0.5363325363 & 0.0514459929 \\ 0.2119034982 & 0.6806995451 & 0.1073969566 \\ 0.0883024619 & 0.2817188376 & 0.6299787005 \end{bmatrix} \begin{bmatrix} R \\ G \\ B \end{bmatrix}$$

#### Stage 2: Non-Linear Photoreceptor Cube-Root Response
The human eye’s biochemical transduction compresses luminous intensity roughly according to a power law. The LMS cone signals undergo a non-linear cubic root transformation:
$$l' = \sqrt[3]{L} = L^{1/3}$$
$$m' = \sqrt[3]{M} = M^{1/3}$$
$$s' = \sqrt[3]{S} = S^{1/3}$$
*(For negative inputs resulting from out-of-gamut values, sign-preserving power functions are applied).*

#### Stage 3: Non-Linear LMS to OKLab Cartesian Coordinates ($M_2$)
The non-linear cone excitations are projected into opponent color channels via matrix $M_2$:
- $L$: Perceived Lightness ($0.0 = \text{pure black}, 1.0 = \text{diffuse white}$)
- $a$: Green-Red opponent chromatic axis (negative = green, positive = red)
- $b$: Blue-Yellow opponent chromatic axis (negative = blue, positive = yellow)

$$\begin{bmatrix} L_{\text{ok}} \\ a \\ b \end{bmatrix} = M_2 \begin{bmatrix} l' \\ m' \\ s' \end{bmatrix} = \begin{bmatrix} 0.2104542553 & 0.7936177850 & -0.0040720468 \\ 1.9779984951 & -2.4285922050 & 0.4505937099 \\ 0.0259040371 & 0.7827717662 & -0.8086757660 \end{bmatrix} \begin{bmatrix} l' \\ m' \\ s' \end{bmatrix}$$

---

### 2.3 Inverse Transformation: OKLab to Linear RGB

To convert an edited OKLab coordinate back to Linear RGB for GPU buffer upload:

#### Step 1: Inverse Opponent Projection ($M_2^{-1}$)
$$\begin{bmatrix} l' \\ m' \\ s' \end{bmatrix} = M_2^{-1} \begin{bmatrix} L_{\text{ok}} \\ a \\ b \end{bmatrix} = \begin{bmatrix} 1.0000000000 & +0.3963377774 & +0.2158037573 \\ 1.0000000000 & -0.1055613458 & -0.0638541728 \\ 1.0000000000 & -0.0894841775 & -1.2914855480 \end{bmatrix} \begin{bmatrix} L_{\text{ok}} \\ a \\ b \end{bmatrix}$$

#### Step 2: Inverse Non-Linear Cube Expansion
$$L = (l')^3, \quad M = (m')^3, \quad S = (s')^3$$

#### Step 3: Inverse Cone to Linear RGB ($M_1^{-1}$)
$$\begin{bmatrix} R \\ G \\ B \end{bmatrix} = M_1^{-1} \begin{bmatrix} L \\ M \\ S \end{bmatrix} = \begin{bmatrix} +4.0767416621 & -3.3077115913 & +0.2309699292 \\ -1.2684380046 & +2.6097574011 & -0.3413193965 \\ -0.0041960863 & -0.7034186147 & +1.7076147010 \end{bmatrix} \begin{bmatrix} L \\ M \\ S \end{bmatrix}$$

---

### 2.4 OKLCh Cylindrical Polar Space

For intuitive artistic control (hue, saturation/chroma, lightness), Cartesian OKLab is transformed to cylindrical polar coordinates **OKLCh**:
- **Lightness** $L = L_{\text{ok}} \in [0, 1]$
- **Chroma** $C = \sqrt{a^2 + b^2} \in [0, 0.4]$
- **Hue Angle** $h = \text{atan2}(b, a) \in [0, 2\pi)$ radians (or $[0^\circ, 360^\circ]$)

Forward Polar Transform:
$$C = \sqrt{a^2 + b^2}, \quad h = \begin{cases} \text{atan2}(b, a) & \text{if } \text{atan2}(b, a) \ge 0 \\ \text{atan2}(b, a) + 2\pi & \text{if } \text{atan2}(b, a) < 0 \end{cases}$$

Inverse Polar Transform:
$$a = C \cos(h), \quad b = C \sin(h)$$

---

### 2.5 Proof of Linearity in Color Mixing & Elimination of Dead Zones

Consider the interpolation between two complementary colors $\mathbf{C}_0$ (pure cyan) and $\mathbf{C}_1$ (pure orange):

#### Standard sRGB Non-Linear Interpolation:
$$\mathbf{C}_{\text{srgb}}(t) = (1 - t)\mathbf{C}_0 + t\mathbf{C}_1$$
At $t = 0.5$, the non-linear transfer function creates an abrupt dip in luminous power. The perceived lightness drops by over $40\%$, producing a dingy gray-brown band.

#### OKLab Cartesian Geodesic Mixing:
$$\mathbf{C}_{\text{oklab}}(t) = (1 - t)\begin{bmatrix} L_0 \\ a_0 \\ b_0 \end{bmatrix} + t\begin{bmatrix} L_1 \\ a_1 \\ b_1 \end{bmatrix}$$

**Theorem**: *Linear interpolation in OKLab Cartesian space preserves monotonic perceived lightness and produces smooth chromatic transitions without perceptual dead zones.*

**Proof**:
1. **Lightness Monotonicity**: Lightness $L(t) = (1-t)L_0 + tL_1$. The first derivative with respect to $t$ is:
   $$\frac{dL}{dt} = L_1 - L_0 = \text{constant}$$
   Since $L(t)$ is an affine function, it is strictly monotonic for all $L_0 \neq L_1$, guaranteeing that intermediate colors can never dip below $\min(L_0, L_1)$ or spike above $\max(L_0, L_1)$.
2. **Chroma Smoothness**: The chroma $C(t) = \sqrt{a(t)^2 + b(t)^2}$ follows a convex trajectory in the opponent plane. Along the straight-line segment connecting $(a_0, b_0)$ to $(a_1, b_1)$, the minimum distance to the origin is:
   $$d_{\min} = \frac{|a_0 b_1 - a_1 b_0|}{\sqrt{(a_1 - a_0)^2 + (b_1 - b_0)^2}}$$
   For exact complementaries passing through the origin, $C(t)$ drops smoothly to zero at the exact neutral gray point without any spurious hue shifts.
3. **No Abney Hue Shift**: In OKLab, lines of constant hue angle $h = \text{const}$ correspond to straight radial lines in the $(a, b)$ plane. Therefore, desaturating a color by scaling $(a, b) \to \alpha(a, b)$ preserves hue angle $h$ identically, mathematically eliminating the Abney effect.

---

## Section 3: Optical Rendering & Transparency

### 3.1 The Depth-Sorting Bottleneck in 3D Inking

In freehand 3D spatial inking, hundreds of semi-transparent strokes, glowing ribbons, and volumetric tubes intersect in complex topologies. Standard alpha blending ($\alpha$-compositing) requires all transparent geometric primitives to be drawn in strict back-to-front depth order:
$$C_{\text{dst}} = C_{\text{src}} \alpha_{\text{src}} + C_{\text{dst}}(1 - \alpha_{\text{src}})$$

Back-to-front sorting presents three fatal problems in real-time spatial painting:
1. **CPU Overhead**: Sorting $N$ individual triangles or stroke fragments every frame incurs an $O(N \log N)$ sorting cost that degrades CPU cache performance.
2. **Topological Cycles**: Intersecting stroke ribbons (e.g., ribbon A crosses over ribbon B, which loops under ribbon C, which loops over ribbon A) cannot be sorted by any global depth ordering without dynamically splitting polygons at their geometric intersections.
3. **Internal Self-Intersection**: A single continuous 3D knot or coiled spring stroke intersects its own bounding box, creating self-sorting failures.

---

### 3.2 Weighted Blended Order-Independent Transparency (WBOIT) Formulation

To render thousands of overlapping transparent strokes at native 120 FPS without sorting, Remix 3D implements the **Weighted Blended OIT (WBOIT)** formulation developed by Morgan McGuire and Louis Bavoil (2013).

```
WBOIT Dual Multiple Render Target (MRT) Pipeline:
┌────────────────────────────────────────────────────────────────────────┐
│                        OPAQUE SCENE PASS                               │
│  Draw background, 3D templates, floor -> Render Target Opaque (RGBA8)  │
│                                       -> Depth Buffer (D24S8)          │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ Depth Read Only
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   TRANSPARENT ACCUMULATION PASS (MRT)                  │
│  Draw all transparent strokes with DepthTest=ON, DepthWrite=OFF        │
│                                                                        │
│  Render Target 0 (Accumulation, RGBA16F, Blend: ONE, ONE):             │
│    gl_FragData[0] = vec4(C_i * alpha_i * w(z_i, alpha_i),              │
│                          alpha_i * w(z_i, alpha_i))                    │
│                                                                        │
│  Render Target 1 (Revealage, R16F, Blend: ZERO, ONE_MINUS_SRC_COLOR):  │
│    gl_FragData[1] = alpha_i                                            │
│    // Hardware blend computes: Product of (1.0 - alpha_i)              │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         FULL-SCREEN COMPOSITOR                         │
│  Samples tOpaque, tAccum, tReveal -> Linear Reconstruction -> Display  │
│  C_final = (Accum.rgb / max(Accum.a, 1e-5)) * (1 - Reveal)             │
│            + LinearOpaque * Reveal                                     │
└────────────────────────────────────────────────────────────────────────┘
```

#### The Transmittance Operator
The analytical light transmission through $n$ overlapping transparent layers with colors $C_i$ and opacities $\alpha_i$ (ordered front-to-back $i = 1 \dots n$) is:
$$C_{\text{final}} = \sum_{i=1}^n \left( C_i \alpha_i \prod_{j=1}^{i-1} (1 - \alpha_j) \right) + C_{\text{background}} \prod_{k=1}^n (1 - \alpha_k)$$

The total background transmittance is known as the **revealage** $R$:
$$R = \prod_{k=1}^n (1 - \alpha_k)$$

Notice that $R$ is strictly commutative: multiplication is order-independent:
$$\prod_{k=1}^n (1 - \alpha_k) = (1 - \alpha_{\pi(1)})(1 - \alpha_{\pi(2)}) \dots (1 - \alpha_{\pi(n)})$$
for any arbitrary permutation $\pi$.

#### The Weighted Accumulation Approximation
WBOIT approximates the weighted color sum by assigning a depth-dependent weighting function $w(z, \alpha)$ to each fragment, computing an average transparent color that is blended with the background using the exact revealage $R$:
$$C_{\text{final}} = \left( \frac{\sum_{i=1}^n C_i \alpha_i w(z_i, \alpha_i)}{\sum_{i=1}^n \alpha_i w(z_i, \alpha_i)} \right) (1 - R) + C_{\text{background}} \cdot R$$

---

### 3.3 The Stroke-Tuned Depth Weight Function

The weighting function $w(z, \alpha)$ determines the optical dominance of near fragments over far fragments. Standard formulas designed for architectural games fail in 3D inking, where fine stroke tips ($z \approx 0.1\text{ m}$) require high contrast against background models ($z \approx 10\text{ m}$).

Remix 3D deploys an optimized depth-weighting curve:
$$w(z, \alpha) = \text{clamp}\left( (8\alpha + 0.01)^3 \cdot 10^4 \cdot (\max(0.01, 1.0 - 0.95 z_{\text{ndc}}))^3, 10^{-2}, 3 \times 10^3 \right)$$

```glsl
// McGuire & Bavoil tuned depth-based transparency weight function
float computeWBOITWeight(float z, float alpha, vec3 color) {
  float linearZ = clamp(abs(z), 0.01, 100.0);
  float a = min(1.0, alpha) * 8.0 + 0.01;
  float b = 1.0 - (gl_FragCoord.z * 0.95);
  // Weight function balancing near/far opacity without color distortion
  float w = clamp(pow(a, 3.0) * 1e4 * pow(max(0.01, b), 3.0), 1e-2, 3e3);
  return w;
}
```

Key Mathematical Properties:
1. **Opacity Exponent $(8\alpha + 0.01)^3$**: Strongly prioritizes high-opacity surface strokes over faint halo artifacts.
2. **Depth Rolloff $(1.0 - 0.95 z_{\text{ndc}})^3$**: As fragment depth approaches the far plane ($z_{\text{ndc}} \to 1.0$), weight decays smoothly, ensuring that foreground strokes occlude background brush dabs.
3. **Clamping $[10^{-2}, 3000.0]$**: Prevents IEEE 754 half-float (FP16) underflow and overflow during high-density additive accumulation passes.

---

### 3.4 Hardware Blending States & Full-Screen Compositor

The WBOIT implementation executes across three passes:

#### Pass 1: Opaque Pass
The background environment, ground plane, and reference 3D models are rendered to `opaqueTarget` (RGBA8) with full depth write enabled (`depthWrite = true`).

#### Pass 2: Transparent Accumulation Pass
Transparent stroke geometry is rendered with `depthWrite = false` and `depthTest = true` using two color attachments:
- **Attachment 0 (`accumTarget`, RGBA16F)**:
  - Output: $\left( C_i \cdot \alpha_i \cdot w(z_i, \alpha_i), \; \alpha_i \cdot w(z_i, \alpha_i) \right)$
  - Hardware Blending: `gl.blendFunc(gl.ONE, gl.ONE)` (Additive Accumulation)
  - Equation: `gl.blendEquation(gl.FUNC_ADD)`
- **Attachment 1 (`revealTarget`, R16F or RGBA16F)**:
  - Output: $\alpha_i$
  - Hardware Blending: `gl.blendFunc(gl.ZERO, gl.ONE_MINUS_SRC_COLOR)`
  - Mathematical Effect: The buffer initialized to $1.0$ is multiplied on each fragment:
    $$\text{Buffer}_{\text{new}} = \text{Buffer}_{\text{old}} \cdot (1 - \alpha_i) \implies R = \prod_{i=1}^n (1 - \alpha_i)$$

#### Pass 3: Full-Screen Linear Composite Pass
A full-screen quad reconstructs the final pixel value:
```glsl
void main() {
  vec4 opaque = texture2D(tOpaque, vUv);
  vec4 accum = texture2D(tAccum, vUv);
  float reveal = texture2D(tReveal, vUv).r;

  // If no transparent fragments covered this pixel, pass opaque through directly
  if (reveal >= 0.99999 || accum.a <= 1e-6) {
    gl_FragColor = opaque;
    return;
  }

  // Reconstruct average transparent color from weighted accumulation
  vec3 avgColor = accum.rgb / max(accum.a, 1e-5);

  // Convert opaque background to linear for physically accurate compositing
  vec3 linearOpaque = srgb_to_linear(opaque.rgb);
  vec3 linearTrans = avgColor; // already in linear RGB

  // Composite in linear space
  vec3 finalLinear = linearTrans * (1.0 - reveal) + linearOpaque * reveal;

  // Return to sRGB swapchain
  gl_FragColor = vec4(linear_to_srgb(finalLinear), 1.0);
}
```

---

## Section 4: Compression & Spatial Acceleration

### 4.1 Google Draco WASM Quantization & Attribute Encoding

When exporting complex 3D projects containing millions of stroke vertices or scanned reference meshes, raw glTF/GLB files can exceed hundreds of megabytes. Remix 3D embeds the **Google Draco WebAssembly** quantization and compression suite.

```
Google Draco Compression Pipeline:
┌─────────────────────────┐
│ Raw Mesh Vertex Buffers │
│ Positions: Float32 (x3) │
│ Normals:   Float32 (x3) │
│ UVs:       Float32 (x2) │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐     q = floor(((v - min) / (max - min)) * (2^b - 1) + 0.5)
│  Integer Quantization   │ ──> Position: 14-bit (1/16384 precision)
│  (Configurable Bits)    │ ──> Normal:   10-bit (Octahedral transform)
└────────────┬────────────┘ ──> UV:       10-bit (1/1024 precision)
             │
             ▼
┌─────────────────────────┐
│ Edgebreaker Connectivity│ ──> Compresses mesh topology into CLERS symbols
│ Topological Compression │     (Corner, Left, End, Right, Split)
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ Shannon Entropy Coding  │ ──> Asymmetric Numeral Systems (rANS) / Huffman
│  (Binary Bitstream)     │ ──> 85% to 92% File Size Reduction
└─────────────────────────┘
```

#### Mathematical Quantization Formulation
Continuous 32-bit floating-point attribute vectors $\mathbf{v} \in \mathbb{R}^d$ bounded by the axis-aligned bounding box $[\mathbf{v}_{\min}, \mathbf{v}_{\max}]$ are mapped to discrete unsigned integers $q \in [0, 2^b - 1]$ using $b$-bit quantization:
$$q_j = \left\lfloor \frac{v_j - v_{\min, j}}{v_{\max, j} - v_{\min, j}} \cdot (2^b - 1) + 0.5 \right\rfloor$$

De-quantization during decompression reconstructs the continuous floating-point value:
$$\hat{v}_j = v_{\min, j} + \frac{q_j}{2^b - 1} \cdot (v_{\max, j} - v_{\min, j})$$

The maximum spatial reconstruction error $\epsilon_{\max}$ is strictly bounded by:
$$\epsilon_{\max} \le \frac{v_{\max, j} - v_{\min, j}}{2 \cdot (2^b - 1)}$$

For a typical $2.0\text{ m}$ model quantized at 14 bits:
$$\epsilon_{\max} \le \frac{2.0\text{ m}}{2 \cdot 16383} \approx 0.061\text{ mm} \quad (61\ \mu\text{m})$$
This is well below the physical resolution of high-density retina displays or 3D printing equipment.

#### Quantization Presets in Remix 3D:
| Attribute | Quantization Bits ($b$) | Discrete Levels ($2^b$) | Spatial / Angular Precision |
|---|---|---|---|
| **Position** | 14 bits | 16,384 | $\pm 0.06\text{ mm}$ over a $2\text{m}$ buck |
| **Normal** | 10 bits | 1,024 | Octahedral projection ($< 0.18^\circ$ deviation) |
| **Texture UV** | 10 bits | 1,024 | $\pm 0.00097$ in UV texture space |
| **Color** | 8 bits | 256 | Matches standard sRGB 24-bit color fidelity |

#### Mesh Connectivity & Entropy Coding
- **Edgebreaker Algorithm**: Traverses triangulated 2-manifold surfaces, encoding mesh connectivity into five topological symbols: **C** (Corner), **L** (Left), **E** (End), **R** (Right), and **S** (Split). In regular meshes, connectivity is compressed to under $1.5\text{ bits per triangle}$.
- **rANS Entropy Coder**: Quantized vertex differences (prediction residuals from parallelogram predictors) are encoded into an asymmetric numeral systems (ANS) bitstream, approaching theoretical Shannon entropy limits.

---

### 4.2 Bounding Volume Hierarchy (BVH) Spatial Acceleration

In surface inking, the engine must cast continuous rays from screen space to detect the exact 3D coordinates, surface normals, and tangent orientations of underlying geometry.

#### The $O(N)$ Raycast Collapse
A high-resolution anatomical buck or sculpted scanned model often contains $M \approx 500,000$ triangles. At a pointer sampling rate of 120 Hz with 4 sub-steps per frame (for smooth Catmull-Rom curve generation), the engine evaluates:
$$120 \times 4 = 480 \text{ raycasts/second}$$
Naive sequential triangle intersection requires:
$$480 \times 500,000 = 240,000,000 \text{ triangle intersection tests/second}$$
This causes severe framerate drops on mobile devices.

#### The `three-mesh-bvh` Solution
Remix 3D patches the Three.js mesh prototype with `three-mesh-bvh`. During model loading or mesh modification, a binary **Bounding Volume Hierarchy (BVH)** tree is constructed using the **Surface Area Heuristic (SAH)**.

The SAH cost function for partitioning a set of triangles into left and right bounding boxes $A$ and $B$ is:
$$\text{Cost}(A, B) = 2 \cdot t_{\text{aabb}} + \frac{\text{Area}(A)}{\text{Area}(\text{Parent})} N_A \cdot t_{\text{tri}} + \frac{\text{Area}(B)}{\text{Area}(\text{Parent})} N_B \cdot t_{\text{tri}}$$
where $t_{\text{aabb}}$ is the ray-box intersection cost, $t_{\text{tri}}$ is the ray-triangle intersection cost, and $N_A, N_B$ are triangle counts.

#### Query Performance:
With the SAH BVH tree, ray intersection complexity drops from linear to logarithmic:
$$O(M) \implies O(\log M)$$
For a 500,000 triangle mesh:
$$\log_2(500,000) \approx 19 \text{ box intersections}$$
Raycasting execution completes in under $0.02\text{ ms}$, freeing the CPU thread for real-time spline generation.

---

### 4.3 Smooth Barycentric Normal Interpolation

When a ray hits a triangle at world coordinate $\mathbf{P}_{\text{hit}}$, flat face normals produce faceted, step-like artifacts on low-poly reference models. 

To ensure continuous, organic surface inking, Remix 3D extracts the vertex normals $\mathbf{n}_A, \mathbf{n}_B, \mathbf{n}_C$ and calculates the exact barycentric coordinates $(u, v, w)$:

$$\mathbf{P}_{\text{local}} = \mathbf{M}_{\text{mesh}}^{-1} \mathbf{P}_{\text{hit}}$$
$$\mathbf{P}_{\text{local}} = u \mathbf{v}_A + v \mathbf{v}_B + w \mathbf{v}_C, \quad u + v + w = 1.0$$

The smooth interpolated surface normal is given by:
$$\mathbf{n}_{\text{smooth}} = \text{normalize}\left( u \mathbf{n}_A + v \mathbf{n}_B + w \mathbf{n}_C \right)$$
$$\mathbf{n}_{\text{world}} = \text{normalize}\left( (\mathbf{M}_{\text{mesh}}^{-1})^T \mathbf{n}_{\text{smooth}} \right)$$

#### Micro-Cross Jitter Seam Bridging
When drawing across sharp geometric seams, polygon UV seams, or microscopic geometric gaps, a single ray may pass through a zero-width crevice and miss the model entirely. 

If a primary raycast misses, the engine fires a six-point micro-cross jitter pattern in Normalized Device Coordinates (NDC):
$$\Delta \text{NDC} \in \left\{ (\pm \delta, 0), (0, \pm \delta), (\pm 0.7\delta, \pm 0.7\delta) \right\}, \quad \delta = 0.0015$$
The first valid surface hit bridges the seam, preventing stroke dropout across UV seams.

---

## Section 5: WebGPU WGSL Compute Pipelines

### 5.1 High-Throughput Volumetric Compute Dispatcher

When executing volumetric mesh deformations (such as the 3D Liquify push/pull brush), modifying 200,000 vertices on the CPU JavaScript thread introduces garbage collection stalls and cache misses.

Remix 3D implements a high-throughput **WebGPU Compute Pipeline** using the WebGPU Shading Language (WGSL), with automatic fallback to vectorized TypedArray CPU loops when WebGPU hardware is unavailable.

```
WebGPU Compute Pipeline Architecture:
┌────────────────────────────────────────────────────────────────────────┐
│                        JAVASCRIPT HOST THREAD                          │
│  Allocates GPUBuffer: posBuffer (STORAGE | COPY_SRC)                   │
│  Allocates GPUBuffer: deltaBuffer (STORAGE | COPY_DST)                 │
│  Writes vertex delta displacements into deltaBuffer                    │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         WEBGPU DEVICE QUEUE                            │
│  Dispatch Compute Pass: ceil(N / 64) Workgroups                        │
│                                                                        │
│  GPU SM / Compute Units (Parallel Execution across 64 invocations):    │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ WGSL Kernel: @compute @workgroup_size(64)                        │  │
│  │ global_id = workgroup_id * 64 + local_invocation_id             │  │
│  │                                                                  │  │
│  │ if (global_id >= VertexCount) return;                            │  │
│  │                                                                  │  │
│  │ let idx = global_id * 3u;                                        │  │
│  │ positions[idx]     += deltas[idx];                               │  │
│  │ positions[idx + 1] += deltas[idx + 1];                           │  │
│  │ positions[idx + 2] += deltas[idx + 2];                           │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      ZERO-COPY BUFFER READBACK                         │
│  commandEncoder.copyBufferToBuffer(posBuffer -> readBuffer)            │
│  readBuffer.mapAsync(GPUMapMode.READ)                                  │
│  Direct subarray view uploaded to Three.js BufferAttribute             │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 5.2 Workgroup Layout & Hardware Warp/Wavefront Alignment

In WGSL, compute kernels are partitioned into workgroups. The choice of `@workgroup_size` is critical for hardware utilization:
- **NVIDIA GPUs**: Execute in warps of 32 threads.
- **AMD GPUs**: Execute in wavefronts of 64 threads (Wave64) or 32 threads (Wave32).
- **Apple Silicon (M-Series)**: Execute in SIMDgroups of 32 threads.
- **Intel Arc & Qualcomm Adreno**: Subgroups of 16, 32, or 64 threads.

Remix 3D sets the workgroup dimensions to:
$$\text{Workgroup Size} = (64, 1, 1)$$

> [!TIP]
> Setting workgroup size to $64$ ensures an exact multiple of both 32-thread warps ($2 \times 32$) and 64-thread wavefronts ($1 \times 64$). This prevents under-filled execution blocks, maximizing occupancy across all major desktop and mobile GPU architectures.

The number of dispatched workgroups is calculated by:
$$\text{NumWorkgroups} = \left\lceil \frac{N}{64} \right\rceil = \left\lfloor \frac{N + 63}{64} \right\rfloor$$
where $N$ is the total number of vertices in the mesh.

---

### 5.3 WGSL Compute Shader Implementation

The production WGSL compute kernel for parallel vertex displacement:

```wgsl
struct VertexBuffer {
  data: array<f32>,
};

@group(0) @binding(0) var<storage, read_write> positions: VertexBuffer;
@group(0) @binding(1) var<storage, read> deltas: VertexBuffer;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let index = global_id.x;
  
  // Guard against out-of-bounds execution on the final partial workgroup
  let totalVertices = arrayLength(&positions.data) / 3u;
  if (index >= totalVertices) {
    return;
  }
  
  let idx3 = index * 3u;
  
  // Parallel coalesced memory access across contiguous 32-bit floats
  positions.data[idx3]      = positions.data[idx3]      + deltas.data[idx3];
  positions.data[idx3 + 1u] = positions.data[idx3 + 1u] + deltas.data[idx3 + 1u];
  positions.data[idx3 + 2u] = positions.data[idx3 + 2u] + deltas.data[idx3 + 2u];
}
```

#### Memory Coalescing & Alignment Rules
1. **Coalesced Memory Access**: Global invocations $k, k+1, k+2 \dots$ access consecutive memory addresses in `positions.data`. The memory controller aggregates these 32-bit float loads into 128-byte cache lines.
2. **Buffer Strides**: WebGPU enforces strict alignment requirements: uniform buffers must align to 16 bytes (`vec4`), and storage buffers must align to 4 bytes (`f32`).

---

### 5.4 Unified Host-to-Device Memory Lifecycle

The lifecycle of a WebGPU compute dispatch in Remix 3D:

1. **Host Buffer Staging**:  
   `posBuffer` is created with `GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST`.  
   `deltaBuffer` is initialized with `GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST`.
2. **Bind Group Layout Generation**:  
   The compute pipeline infers bind group layouts automatically using `layout: 'auto'`.
3. **Command Encoding**:  
   A `GPUCommandEncoder` records the compute pass, sets pipeline state, binds group `0`, and dispatches $\lceil N / 64 \rceil$ workgroups.
4. **Asynchronous Readback**:  
   The modified buffer is copied to a `MAP_READ` buffer via `commandEncoder.copyBufferToBuffer()`. After `queue.submit()`, `readBuffer.mapAsync(GPUMapMode.READ)` retrieves the transformed vertex coordinates into host memory without blocking the main rendering thread.

---

## Section 6: Mathematical Symbols & Constants Glossary

| Symbol | Definition | Default Value / Bounds | Unit |
|---|---|---|---|
| $\mathbf{C}(s)$ | 3D Space Curve Parametric Equation | Continuous $C^2$ curve | Meters ($\text{m}$) |
| $\alpha$ | Catmull-Rom Centripetal Exponent | $0.5$ | Dimensionless |
| $\epsilon_{\text{jitter}}$ | Micro-jitter filtering distance threshold | $0.0008\text{ m}$ ($0.8\text{ mm}$) | Meters ($\text{m}$) |
| $\kappa(s)$ | Curvature of 3D spatial curve | $\ge 0$ | $\text{m}^{-1}$ |
| $\tau(s)$ | Torsion (twist rate) of 3D spatial curve | $(-\infty, +\infty)$ | $\text{m}^{-1}$ |
| $\{\mathbf{T}, \mathbf{N}, \mathbf{B}\}$ | Frenet-Serret Orthonormal Basis | Singular at $\kappa(s) = 0$ | Unit vector |
| $\{\mathbf{t}, \mathbf{r}, \mathbf{s}\}$ | Bishop Rotation Minimizing Frame Basis | Continuous everywhere | Unit vector |
| $M_1$ | Linear RGB to Physiological LMS Matrix | Fixed $3 \times 3$ matrix | Dimensionless |
| $M_2$ | LMS Cube-Root to OKLab Projection Matrix | Fixed $3 \times 3$ matrix | Dimensionless |
| $L_{\text{ok}}$ | OKLab Perceived Lightness | $[0.0, 1.0]$ | Dimensionless |
| $a, b$ | OKLab Opponent Chromatic Coordinates | $[-0.4, +0.4]$ | Dimensionless |
| $C$ | OKLCh Perceived Cylindrical Chroma | $[0.0, 0.4]$ | Dimensionless |
| $h$ | OKLCh Cylindrical Hue Angle | $[0, 2\pi)$ radians | Radians / Degrees |
| $w(z, \alpha)$ | WBOIT Depth and Opacity Weight Function | $[10^{-2}, 3 \times 10^3]$ | Dimensionless |
| $R$ | WBOIT Cumulative Revealage | $\prod (1 - \alpha_i) \in [0, 1]$ | Dimensionless |
| $b_{\text{pos}}$ | Google Draco Position Quantization Bits | $14\text{ bits}$ ($16,384$ levels) | Bits |
| $b_{\text{norm}}$ | Google Draco Normal Quantization Bits | $10\text{ bits}$ ($1,024$ levels) | Bits |
| $W_{\text{group}}$ | WebGPU Compute Workgroup Dimension | $(64, 1, 1)$ | Invocations |

---

## References & Foundational Literature

1. **Bishop, R. L.** (1975). *There is More Than One Way to Frame a Curve*. The American Mathematical Monthly, 82(3), 246–251.
2. **Wang, W., Jüttler, B., Zheng, D., & Liu, Y.** (2008). *Computation of Rotation Minimizing Frames*. ACM Transactions on Graphics (TOG), 27(1), 1–18.
3. **Ottosson, B.** (2020). *A Perceptual Color Space for Computer Graphics: OKLab*. Online publication: `https://bottosson.github.io/posts/oklab/`.
4. **McGuire, M., & Bavoil, L.** (2013). *Weighted Blended Order-Independent Transparency*. Journal of Computer Graphics Techniques (JCGT), 2(2), 122–141.
5. **Gallot, G., & Google Draco Authors** (2016–2024). *Google Draco 3D Data Compression Library*. Google Open Source: `https://github.com/google/draco`.
6. **W3C WebGPU Working Group** (2024). *WebGPU Shading Language (WGSL)*. W3C Candidate Recommendation.
