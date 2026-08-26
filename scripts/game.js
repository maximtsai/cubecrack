// Gems in the cube - main game: scene, drag-rotate, hammer strikes, debris physics, gems
(function () {
    const V3 = THREE.Vector3;

    // ---------- tunables (some driven by Tweaks) ----------
    const HALF = 1.2;            // cube half-size
    const ARM = 1.45;            // hammer arm length
    const cfg = {
        chunkCount: 150,
        hitRadius: 0.55,
        debrisGravity: 10.0,
    };

    const GEM_COLORS = [0xffb45e, 0x6ee0ff, 0xc89bff, 0xff7ad9, 0x8dff8a];

    // ---------- levels ----------
    // Same gameplay each level; only the solid's shape and rock colour change.
    const STONE = { outer: [0.40, 0.365, 0.325], inner: [0.62, 0.525, 0.40] };
    const SANDSTONE = { outer: [0.74, 0.58, 0.39], inner: [0.88, 0.74, 0.52] };
    const ICE = { outer: [0.33, 0.55, 0.90], inner: [0.44, 0.67, 0.98] };
    const OBSIDIAN = { outer: [0.14, 0.12, 0.18], inner: [0.62, 0.34, 0.86] };
    const MAGMA = { outer: [0.28, 0.10, 0.06], inner: [1.00, 0.44, 0.10] };
    const BRASS = { outer: [0.50, 0.36, 0.15], inner: [0.88, 0.70, 0.32] };
    const PETRIFIED = { outer: [0.30, 0.21, 0.14], inner: [0.66, 0.44, 0.22] };
    const WAX = { outer: [0.72, 0.50, 0.16], inner: [0.98, 0.78, 0.30] };
    const GEM_WOOD = { outer: [0.31, 0.20, 0.13], inner: [0.56, 0.41, 0.25] };
    const STARLIGHT = { outer: [0.58, 0.68, 0.92], inner: [0.92, 0.96, 1.00] };
    const EGGSHELL = { outer: [0.15, 0.34, 0.28], inner: [0.86, 0.68, 0.26] };
    const MOLTEN_GLOW = [1.0, 0.55, 0.16];   // heated-rock tint, just before it erupts
    // sizeMul: scales the shape's own half-extent before it's built (bigger solid).
    // cam:     camera distance multiplier (pull back so a bigger solid still fills
    //          the frame). chunkMul: scale the chunk count with the solid's volume so
    //          chunk *size* stays constant — a bigger solid then means more to dig.
    // break:   'ice' uses the two-step crack-then-shatter model; default breaks on hit.
    // rough/metal: override the rock material's finish (ice gets a wet sheen).
    const ICE_SIZE = 1.3;
    // Both ice levels are 15% larger solids; the camera pulls back a touch more than
    // that so the bigger shape still sits comfortably inside the frame.
    const ICE_GROW = 1.15;
    const ICE_CAM = 1.22;
    const LEVELS = [
        { shape: 'cube', colors: STONE, name: 'STONE CUBE', won: 'CUBE CRACKED', sizeMul: 0.7225, cam: 0.68, bg: 'radial-gradient(120% 90% at 50% 38%, #473527 0%, #2b1e11 55%, #17110b 100%)' },
        // `bands: 2` clamps two solid metal rings around the pillar. They aren't fracture
        // chunks: metal never shatters, so each ring is one destroyable object that soaks up
        // BAND_HP blows and then tears off in a single piece — see buildBands()/bandStrike().
        { shape: 'cylinder', colors: STONE, name: 'STONE PILLAR', won: 'PILLAR CRACKED', cam: 0.82, bands: 2, bg: 'radial-gradient(120% 90% at 50% 38%, #2e343d 0%, #1b202b 55%, #11141a 100%)' },
        // `blocks: 3` buries three solid metal cubes inside the pyramid. They aren't fracture
        // chunks: metal never shatters, so each block soaks up BAND_HP blows and then shears
        // off in one whole piece — see buildBlocks()/bandStrike(). They're sealed in stone, so
        // you have to dig down to one before you can even hit it.
        { shape: 'pyramid', colors: SANDSTONE, name: 'SANDSTONE PYRAMID', won: 'PYRAMID CRACKED', cam: 1.15, chunkMul: 1.3 * 1.3 * 1.3, blocks: 1, bg: 'radial-gradient(120% 90% at 50% 38%, #58421e 0%, #322111 55%, #1b1309 100%)' },
        {
            shape: 'heart', colors: ICE, name: 'FROZEN HEART', won: 'HEART SHATTERED', break: 'ice', rough: 0.5, metal: 0.06, rods: 2,
            sizeMul: ICE_SIZE * 1.35 * 0.88 * 1.5 * ICE_GROW * 0.88, cam: ICE_SIZE * 0.75 * 1.5 * 1.15 * ICE_CAM * 0.84 * 0.95, chunkMul: 0.18 * 1.5 * 1.5 * 1.5 * ICE_GROW * ICE_GROW * ICE_GROW,
            // Fixed anchors keep the three gems in separate lobes / lower point of the heart.
            // Values are normalized to this shape's x/y/z bounds, so they scale with the heart.
            gemLayout: [[-0.44, 0.23, 0], [0.44, 0.23, 0], [0, -0.52, 0]],
            bg: 'radial-gradient(120% 90% at 50% 38%, #471a59 0%, #251138 55%, #13091e 100%)'
        },
        {
            shape: 'geode', colors: OBSIDIAN, name: 'OBSIDIAN GEODE', won: 'GEODE CRACKED', break: 'obsidian', rough: 0.18, metal: 0.42,
            sizeMul: 1.35, cam: 1.15, chunkMul: 1.9, bg: 'radial-gradient(120% 90% at 50% 38%, #2c1d3f 0%, #17101f 55%, #0a0710 100%)'
        },
        // Not a fractured solid: `build:'gears'` packs the orb's volume with individual
        // solid gear pieces of assorted sizes, plus three small clumps of dirt that hide
        // the gems. chunkMul here is the gear count, not a fracture density.
        {
            shape: 'orb', colors: BRASS, name: 'CLOCKWORK SPHERE', won: 'CLOCKWORK STOPPED', break: 'clockwork', build: 'gears', gear: true, rough: 0.34, metal: 0.72,
            // chunkMul is the gear count multiplier here (150 * mul): 0.8533 -> 128 gears

            sizeMul: 1.45, cam: 1.28, chunkMul: 0.8533, bg: 'radial-gradient(120% 90% at 50% 38%, #4a3a1c 0%, #241c0e 55%, #120e07 100%)'
        },
        // `blocks: 5` embeds five solid metal cubes in the core, four of them shoved out far
        // enough that a corner breaks the skin (see planEmbeddedBlocks) — those are visible and
        // hittable from the first frame, while the fifth is sealed in and has to be dug out.
        // Metal never shatters: each cube soaks up BAND_HP blows, then shears off in one piece.
        {
            shape: 'orb', colors: MAGMA, name: 'MOLTEN CORE', won: 'CORE QUENCHED', break: 'molten', rough: 0.62, metal: 0.14,
            blocks: 5, blocksJut: 4, blockLayout: 'embedded',
            sizeMul: 1.56, cam: 1.20, chunkMul: 2.59, bg: 'radial-gradient(120% 90% at 50% 38%, #5c1c0a 0%, #2c0d06 55%, #150503 100%)'
        },
        // Fossilized tree trunk: a stone-hard cylinder painted with concentric growth
        // rings (see the `petrified` block in build()). The outermost ring is bark and
        // must be split before it peels, and every break runs along the grain — see
        // petrifiedImpact() / grainDist().
        {
            shape: 'cylinder', colors: PETRIFIED, name: 'FOSSILIZED TRUNK', won: 'TRUNK SPLIT', break: 'petrified', rough: 0.97, metal: 0.04,
            sizeMul: 1.3, cam: 1.07, chunkMul: 2.0, bg: 'radial-gradient(120% 90% at 50% 38%, #4a3320 0%, #281a0f 55%, #140b06 100%)'
        },
        // Honeycomb hive: wax comb stacked in concentric layers. Each strike tears out a
        // wide sheet of whichever layer it landed on and stops dead at the layer boundary,
        // so the hive opens sheet by sheet — see hiveImpact() / layerDist().
        {
            shape: 'hive', colors: WAX, name: 'HONEYCOMB HIVE', won: 'HIVE BROKEN', break: 'hive', rough: 0.55, metal: 0.10,
            sizeMul: 1.34, cam: 1.18, chunkMul: 2.2, bg: 'radial-gradient(120% 90% at 50% 38%, #5c4413 0%, #2e2109 55%, #171004 100%)'
        },
        // Chain-bound chest: a plank-and-iron chest strapped shut with heavy chains and two
        // brass padlocks, each pinning one vertical strap and one horizontal girth band. The
        // timber is indestructible while it's bound — every blow that isn't on a padlock just
        // makes the chains flare and the chest lurch (see blockedStrike()). One clean hit
        // shears a padlock off and its own two chains whip free; break both and the chest
        // opens up like ordinary wood — see reliquaryImpact() / breakLock().
        // `build:'chest'` makes the body HOLLOW: only the timber shell is kept, slabs
        // partition the cavity into compartments, and each gem sits inside a clump of
        // dirt in one of them — see buildHollowChest().
        {
            shape: 'chest', colors: GEM_WOOD, name: 'CHAIN-BOUND CHEST', won: 'CHEST OPENED',
            break: 'reliquary', build: 'chest', rough: 0.74, metal: 0.30,
            sizeMul: 1.42, cam: 1.58, chunkMul: 2.2, bg: 'radial-gradient(120% 90% at 50% 38%, #2e2233 0%, #17101b 55%, #0a060d 100%)'
        },
        // Fallen star: a crystalline star whose crust is built in FOUR concentric shells.
        // Every blow raises an "explosion" carrying the index of the shell it landed on, and
        // a chunk is only damaged when its own shell index matches — so a blast can never
        // reach past the shell it started in and the star peels one shell at a time from the
        // outside in (see starImpact() / starBlast()). Each strike also flares the star and
        // the whole sky (see starFlash).
        {
            shape: 'star', colors: STARLIGHT, name: 'FALLEN STAR', won: 'STAR DIMMED',
            break: 'star', rough: 0.22, metal: 0.30,
            sizeMul: 1.74, cam: 1.55, chunkMul: 3.35,
            // Anchor the three gems in three separate star tips (bottom, upper-right
            // and lower-left) so they sit well apart, and stagger their depth: one in
            // the outer shell, one mid-way, one tucked close to the centre. Values are
            // normalized to this shape's x/y/z bounds, like the heart's layout.
            gemLayout: [[0, -0.60, 0], [0.265, 0.364, 0], [-0.209, -0.068, 0]],
            bg: 'radial-gradient(120% 90% at 50% 38%, #1b2c55 0%, #0d152b 55%, #05070f 100%)'
        },
        // Dragon egg: nothing here is ever destroyed. A blow only caves the shell in — every
        // piece it reaches shrinks away to nothing — and then the egg knits itself back
        // together, each piece springing back with the honeycomb's bounce. The wait before a
        // piece regrows is inversely proportional to its distance from the impact, so the
        // crater closes from the rim inward and the hole is only open for a moment: prise a
        // gem out while its own piece is gone (see eggShrink() / updateEggGems()).
        {
            shape: 'egg', colors: EGGSHELL, name: 'DRAGON EGG', won: 'EGG PLUNDERED',
            break: 'egg', rough: 0.58, metal: 0.24,
            sizeMul: 1.863, cam: 1.28, chunkMul: 2.0,
            gemLayout: [[-0.42, 0.30, 0.10], [0.44, -0.10, -0.20], [0.05, -0.52, 0.28]],
            bg: 'radial-gradient(120% 90% at 50% 38%, #123c33 0%, #0a2320 55%, #04100e 100%)'
        },
        // Great Cube: a cube 3x the Stone Cube's linear size, with a metal core and
        // six smaller metal cubes visibly jutting through all six faces.
        {
            shape: 'cube', colors: STONE, name: 'GREAT CUBE', won: 'GREAT CUBE CRACKED',
            sizeMul: 0.7225 * 3, cam: 0.68 * 3, chunkMul: 3.0, introDuration: 0.6, introDurationMax: 0.9,
            blocks: 7, blockLayout: 'greatCube', noRing: true,
            gemCount: 5,
            gemLayout: [[-0.42, -0.42, -0.42], [0.42, -0.42, 0.42], [-0.42, 0.42, 0.42], [0.42, 0.42, -0.42], [0, 0, 0.45]],
            bg: 'radial-gradient(120% 90% at 50% 38%, #51402e 0%, #2d2114 55%, #17100a 100%)'
        },
    ];

    // ---------- fossilized trunk: bark-plate fracture ----------
    // The trunk must not shatter into rock-like rubble. Its Voronoi seeds are laid out on
    // concentric cylindrical shells instead of scattered through the volume: neighbours
    // within a shell sit far apart while neighbours across shells sit very close, so every
    // cell comes out as a thin, flat plate wrapped around the trunk — bark, not gravel.
    // Courses are brick-laid and every seed jitters inside its own slot, so no two plates
    // match and the seams still wander.
    const TRUNK_SHELLS = 9;   // plate layers from heartwood to bark (also the ring count)
    const TRUNK_CURVE = 0.75; // <1 packs the shells (so the plates) tighter toward the bark
    const TRUNK_WRAP = 1.8;   // plates run this much wider around the trunk than they're tall

    // Fractional shell coordinate for a normalized radius — the inverse of the shell radii
    // used below, so shell i spans t in [i, i+1). The plate layout and the growth-ring
    // painting share this mapping, which is what makes every plate read as one ring band.
    function trunkShellT(rNorm) {
        return TRUNK_SHELLS * Math.pow(Math.max(rNorm, 0), 1 / TRUNK_CURVE);
    }

    function barkSeeds(shp, count, rng) {
        rng = rng || Math.random;
        const R = Math.max(shp.bound.x, shp.bound.z);
        const H = shp.bound.y * 2;
        const seeds = [];
        let wsum = 0;
        for (let i = 0; i < TRUNK_SHELLS; i++) {
            wsum += Math.pow((i + 0.5) / TRUNK_SHELLS, TRUNK_CURVE);
        }
        for (let i = 0; i < TRUNK_SHELLS; i++) {
            const w = Math.pow((i + 0.5) / TRUNK_SHELLS, TRUNK_CURVE);
            const circ = Math.max(2 * Math.PI * R * w, 1e-4);
            // plates ∝ this shell's surface area, so plate size stays even core to bark
            const want = Math.max(2, (count * w) / wsum);
            const cell = (circ * H) / want;             // surface area one plate covers
            const na = Math.max(3, Math.round(circ / Math.sqrt(cell * TRUNK_WRAP)));
            const ny = Math.max(1, Math.round(H / Math.sqrt(cell / TRUNK_WRAP)));
            const spin = rng(); // every shell starts at its own angle
            for (let iy = 0; iy < ny; iy++) {
                for (let ia = 0; ia < na; ia++) {
                    const fa = (ia + 0.5 + (iy % 2) * 0.5 + spin + (rng() - 0.5) * 0.5) / na;
                    const fy = (iy + 0.5 + (rng() - 0.5) * 0.6) / ny;
                    // jitter the radius in shell space, so a plate never strays out of its
                    // own layer (which would let a break jump two growth rings at once)
                    const t = Math.min(Math.max((i + 0.5 + (rng() - 0.5) * 0.44) / TRUNK_SHELLS, 0.02), 1);
                    const rr = R * Math.pow(t, TRUNK_CURVE) * 0.985;
                    const a = fa * Math.PI * 2;
                    seeds.push(new V3(Math.cos(a) * rr, (fy - 0.5) * H * 0.985, Math.sin(a) * rr));
                }
            }
        }
        return seeds;
    }

    let material = 'rock'; // current level's break behavior
    let iceTaught = false; // whether the ice two-step hint has been shown
    let obsidianTaught = false; // whether the obsidian two-step hint has been shown
    let petrifiedTaught = false; // whether the bark two-step hint has been shown
    let level = 0;
    let shape = null;
    // render-on-demand flag; declared early because updateSize() (called during
    // setup below) sets it — a later `let` would put it in the temporal dead zone.
    let dirty = true;

    // respect the OS "reduce motion" setting for ambient/idle animation
    const reduceMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const MOTION = reduceMotion ? 0.3 : 1;

    // ---------- renderer / scene / camera ----------
    const canvasHost = document.getElementById('game-container');

    // ---------- device tiering ----------
    // Query the GPU renderer string FIRST, unconditionally; UA sniffing alone misses
    // Android in desktop-mode Chrome, ChromeOS containers, embedded webviews, and
    // iPadOS (which ships a desktop UA). UA is only a fallback for masked renderer
    // strings. Two tiers: `mobile` (any phone/tablet GPU — cap DPR, no MSAA) and
    // `weak` (the slow end — 1:1 pixels, reduced effect budgets). Memoized: the probe
    // costs a whole WebGL context, and one per session is enough.
    let _gpuTier = null;
    function gpuTier() {
        if (_gpuTier) return _gpuTier;
        const tier = { mobile: false, weak: false };
        let gpu = '';
        try {
            const c = document.createElement('canvas');
            const gl = c.getContext('webgl') || c.getContext('experimental-webgl');
            if (gl) {
                const ext = gl.getExtension('WEBGL_debug_renderer_info');
                if (ext) gpu = (gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || '').toLowerCase();
            }
        } catch (e) { /* probe is best-effort */ }
        if (/adreno|mali|powervr|videocore|tegra|vivante/.test(gpu)) tier.mobile = true;
        // Apple reports "apple gpu"/"apple mN" for desktop and mobile alike, and iPadOS
        // ships a desktop UA — touch points are the only reliable tell for iPads.
        if (/apple\s*(?:gpu|a\d|m\d)/.test(gpu) && navigator.maxTouchPoints > 1) tier.mobile = true;
        if (/android|iphone|ipod|ipad|mobile/i.test(navigator.userAgent)) tier.mobile = true;
        if (tier.mobile) {
            // Specific slow GPU families, or memory/CPU-starved phones. Adreno 6xx (e.g.
            // the 640 in the optimisation notes) is genuinely fast — mobile, not weak.
            if (/powervr|mali|videocore|vivante|adreno(?: \(tm\))? [2-5]\d\d/.test(gpu)) {
                tier.weak = true;
            } else if ((navigator.deviceMemory && navigator.deviceMemory <= 4) ||
                navigator.hardwareConcurrency <= 4) {
                tier.weak = true;
            }
        }
        _gpuTier = tier;
        return tier;
    }
    const tier = gpuTier();
    // Scale effect particle counts down on weak GPUs at the single choke point.
    function tieredCount(n) {
        return tier.weak ? Math.max(1, Math.round(n * 0.6)) : n;
    }

    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({
            antialias: !tier.mobile,
            alpha: true,
            powerPreference: 'high-performance',
            stencil: false,
            depth: true
        });
    } catch (err) {
        // Some Android drivers reject optional context attributes rather than ignoring
        // them — retry with the bare minimum before giving up (optimisation notes §13).
        try {
            renderer = new THREE.WebGLRenderer({ alpha: true, stencil: false, depth: true });
        } catch (err2) {
            canvasHost.innerHTML =
                '<div style="display:flex;align-items:center;justify-content:center;height:100%;' +
                'color:#e8c98a;font-family:sans-serif;text-align:center;padding:2em;letter-spacing:0.1em">' +
                'This game needs WebGL, which your browser doesn\'t support.</div>';
            return;
        }
    }
    // cap DPR so high-density screens don't overdraw and tank the framerate: 1:1 on
    // weak GPUs, 1.5 on mobile, 2 on desktop
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, tier.weak ? 1 : (tier.mobile ? 1.5 : 2)));

    const scene = new THREE.Scene();
    const BASE_FOV = 42;
    const camera = new THREE.PerspectiveCamera(BASE_FOV, 1, 0.1, 50);

    let canvasHostRect = { width: 1, height: 1, left: 0, top: 0 };
    let cachedDesignU = 1;
    const updateSize = () => {
        const rect = canvasHost.getBoundingClientRect();
        canvasHostRect.width = rect.width || canvasHost.clientWidth || window.innerWidth;
        canvasHostRect.height = rect.height || canvasHost.clientHeight || window.innerHeight;
        canvasHostRect.left = rect.left || 0;
        canvasHostRect.top = rect.top || 0;
        const w = canvasHostRect.width;
        const h = canvasHostRect.height;
        renderer.setSize(w, h);
        cachedDesignU = (6 + 1.0 * Math.min(w, h) / 100) / 16;
        document.documentElement.style.setProperty('--u', cachedDesignU + 'px');
        const aspect = w / h;
        camera.aspect = aspect;

        const PORTRAIT_REF_FOV = 47.0; // preserves exact 75.4° on 9:16 and 86.6° on 9:19.5
        const SQUARE_FOV = 58.0;       // clean number: wider square zoom out
        const LANDSCAPE_FOV = 56.0;    // clean number: wider landscape zoom out

        if (aspect < 1.0) {
            // Smoothly blend reference angle from portrait (47°) to square (54°)
            const pT = THREE.MathUtils.clamp((aspect - 0.5625) / (1.0 - 0.5625), 0, 1);
            const smoothPT = pT * pT * (3 - 2 * pT);
            const refFov = THREE.MathUtils.lerp(PORTRAIT_REF_FOV, SQUARE_FOV, smoothPT);

            const halfFovRad = THREE.MathUtils.degToRad(refFov * 0.5);
            const halfHFovRad = Math.atan(Math.tan(halfFovRad) / aspect);
            camera.fov = THREE.MathUtils.radToDeg(halfHFovRad * 2);
        } else {
            // Smoothly blend from square (54°) to landscape (52°)
            const lT = THREE.MathUtils.clamp((aspect - 1.0) / 0.333, 0, 1);
            const smoothLT = lT * lT * (3 - 2 * lT);
            camera.fov = THREE.MathUtils.lerp(SQUARE_FOV, LANDSCAPE_FOV, smoothLT);
        }
        camera.updateProjectionMatrix();
        dirty = true;
    };
    updateSize();
    canvasHost.appendChild(renderer.domElement);
    const CAM_HOME = new V3(0, 0.05, 5.2);
    // Camera aims slightly below the solid's center so the shapes sit a bit higher
    // in frame (leaving room for the bottom tool bar / hint text).
    const CAM_LOOK = new V3(0, -0.16, 0);
    const camBase = CAM_HOME.clone(); // updated per level in build()
    camera.position.copy(camBase);
    camera.lookAt(CAM_LOOK);

    scene.add(new THREE.HemisphereLight(0x8a93a8, 0x39302a, 0.55));
    const key = new THREE.DirectionalLight(0xffe2c0, 2.3);
    key.position.set(3.5, 5, 4.5);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x9fb4d8, 0.55);
    fill.position.set(-4, -1.5, -3);
    scene.add(fill);
    const front = new THREE.DirectionalLight(0xd8c8b2, 0.65);
    front.position.set(-1.5, 0.8, 6);
    scene.add(front);

    const cubeGroup = new THREE.Group();
    const chunksGroup = new THREE.Group();
    cubeGroup.add(chunksGroup);
    scene.add(cubeGroup);
    const debrisGroup = new THREE.Group();
    scene.add(debrisGroup);
    const fxGroup = new THREE.Group();
    scene.add(fxGroup);

    // ---- cheap surface shader FX (rim light, grain, glowing ice cracks) ----
    // All three ride along inside the existing MeshStandardMaterial via
    // onBeforeCompile — no extra render passes, no extra draw calls. Uniform
    // objects are shared by reference across the rock + debris materials, so
    // one assignment per level retunes every piece of stone at once.
    const fxUniforms = {
        uRimColor: { value: new THREE.Color(0xffd9a8) },
        uRimStrength: { value: 0.68 },
        uGlowColor: { value: new THREE.Color(0xff4400) },
        // whole-body flare, 0 except while a fallen-star strike is flashing
        uFlash: { value: 0 },
        // dying light: 1 = fully lit, low = the fallen star has gone dark (see starLight)
        uDim: { value: 1 },
    };
    // Per-material rim/glow tints, keyed by the level's `break` behaviour. A plain
    // rock level has no entry and falls back to its stone colour below.
    const RIM_BREAK = {
        egg: 0xcfffe4, star: 0xe4f2ff, ice: 0xbfe6ff, obsidian: 0xd9b6ff,
        molten: 0xff8a3c, clockwork: 0xffdf9e, petrified: 0xffc887,
        hive: 0xffd07a, reliquary: 0xffe0ae,
    };
    const GLOW_BREAK = {
        egg: 0x3fffb4, star: 0x8fc8ff, ice: 0x70c8ff, obsidian: 0xc782ff,
        molten: 0xff4400, clockwork: 0xffaa22, petrified: 0xffb14a,
        hive: 0xffb62c, reliquary: 0xffc24a,
    };
    const rimFor = (lvl) => RIM_BREAK[lvl.break] || (lvl.colors === SANDSTONE ? 0xffd08a : 0xffd9a8);
    const glowFor = (lvl) => GLOW_BREAK[lvl.break] || 0xffaa44;

    const FX_COMMON = `
uniform vec3 uRimColor;
uniform float uRimStrength;
uniform vec3 uGlowColor;
uniform float uFlash;
uniform float uDim;
`;

    function applyRockFx(mat) {
        mat.onBeforeCompile = (shader) => {
            for (const k in fxUniforms) shader.uniforms[k] = fxUniforms[k];
            shader.vertexShader = shader.vertexShader
                .replace('#include <common>', '#include <common>\nattribute float aDamage;\nvarying float vDamage;')
                .replace('#include <color_vertex>', '#include <color_vertex>\nvDamage = aDamage;');
            shader.fragmentShader = shader.fragmentShader
                .replace('#include <common>', '#include <common>\nvarying float vDamage;' + FX_COMMON)
                // soft rim light around the stone + emissive crack/molten heat glow
                .replace('#include <opaque_fragment>', `
    {
        float fres = 1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0);
        outgoingLight *= uDim;
        outgoingLight += uRimColor * (uRimStrength * uDim * pow(fres, 2.2));
        outgoingLight += uGlowColor * (vDamage * 2.0 * uDim + uFlash);
    }
#include <opaque_fragment>`);
        };
        mat.needsUpdate = true;
        return mat;
    }

    const rockMat = new THREE.MeshStandardMaterial({
        vertexColors: true, flatShading: true, roughness: 0.93, metalness: 0.02,
    });
    applyRockFx(rockMat);
    // Debris fades out per piece, which used to mean a cloned material per detached
    // chunk — an ice shatter detaches dozens at once, so a single tap allocated (and
    // a second later disposed) that many materials. Quantize the fade into a fixed
    // ring of shared materials instead: pieces also shrink as they fade, which hides
    // the stepping, and nothing is allocated or disposed at runtime.
    const DEBRIS_FADE_STEPS = 12;
    const debrisMats = [];
    for (let i = 0; i < DEBRIS_FADE_STEPS; i++) {
        const m = rockMat.clone();
        m.transparent = true;
        m.opacity = (i + 1) / DEBRIS_FADE_STEPS;
        applyRockFx(m); // clone() doesn't carry onBeforeCompile across
        debrisMats.push(m);
    }
    const sharedDebrisMat = debrisMats[DEBRIS_FADE_STEPS - 1]; // the fully opaque step
    function debrisMatFor(opacity) {
        const i = Math.ceil(opacity * DEBRIS_FADE_STEPS) - 1;
        return debrisMats[Math.min(DEBRIS_FADE_STEPS - 1, Math.max(0, i))];
    }
    const isSharedRockMat = (m) => m === rockMat || debrisMats.indexOf(m) !== -1;

    // Keep the intact-solid material and every shared debris fade step visually aligned.
    // Detached chunks swap among this material ring as they fade, so all finishes must match.
    function setRockFinish(roughness, metalness) {
        rockMat.roughness = roughness;
        rockMat.metalness = metalness;
        for (const mat of debrisMats) {
            mat.roughness = roughness;
            mat.metalness = metalness;
        }
    }

    // ---------- glow sprite texture ----------
    function makeGlowTexture() {
        const c = document.createElement('canvas');
        c.width = c.height = 128;
        const g = c.getContext('2d');
        const grad = g.createRadialGradient(64, 64, 2, 64, 64, 64);
        grad.addColorStop(0, 'rgba(255,255,255,0.9)');
        grad.addColorStop(0.25, 'rgba(255,255,255,0.35)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = grad;
        g.fillRect(0, 0, 128, 128);
        return new THREE.CanvasTexture(c);
    }
    const glowTex = makeGlowTexture();

    // ---------- state ----------
    // The intact solid is ONE mesh, not one mesh per chunk: a level is 150-330 chunks
    // (the pyramid scales chunkMul to 2.197), and a draw call each was the per-frame
    // floor on mobile. All chunk geometries are concatenated into one buffer at
    // build() time and every chunk remembers its own vertex range in it, so the
    // per-chunk effects still work by writing into that range:
    //   scorch / ice frost -> overwrite the range's colours
    //   detach             -> zero the range's positions (degenerate, draws nothing)
    //   tap                -> raycast the merged mesh, map faceIndex back to a chunk
    // Each chunk also keeps its own standalone geometry, unused while it's part of
    // the solid, which becomes the debris mesh when it detaches.
    let solidMesh = null;   // THREE.Mesh over mergedGeo, the whole intact solid
    let mergedGeo = null;
    let basePositions = null; // un-offset merged positions; intro animates against these
    let mergedColorDirty = false;
    let mergedPosDirty = false;
    let mergedDmgDirty = false;
    let chunks = [];        // {geometry, centroid, separationDir, alive, scorch, damaged, vStart, vCount}
    let treasures = [];     // {group, gem, sprite, light, hitMesh, chunk, exposed, collected, phase}
    // Secret bonus: one small gold ring is sealed inside every solid, in a chunk of its
    // own (never a gem's). It stays completely hidden until that chunk is destroyed —
    // it isn't required to finish a level, it's a reward for digging somewhere new.
    let secretRing = null;  // {group, mesh, sprite, light, hitMesh, chunk, exposed, collected, flash}
    let ringFound = false;
    let ringFx = null;      // {t, from} — the collect flourish
    let debris = [];        // {mesh, vel, ang, life, maxLife}
    let moltenQueue = [];   // molten: {chunk, t, gen} — heated rock waiting to erupt
    let moltenWounds = [];  // molten: {center, n, heat} — open craters bleeding lava
    let lavaRig = null;     // molten: instanced glowing lava beads pouring from the wounds
    let moltenTaught = false; // whether the race-the-crust hint has been shown
    let hiveSquash = [];    // hive: {chunk, t} — wax squashed flat, springing back
    let crustTweens = [];   // molten: {chunk, t, dur} — fresh black crust bounces back into place
    let honeyRig = null;    // hive: instanced honey beads dripping off the comb (visual only)
    // chain-bound chest: two real 3D padlocks and real 3D chains, all parented to cubeGroup
    let lockRigs = [];      // [{group, parts, mats, hit, hits, shake, home, bands}] — padlock models
    let chainBands = [];    // [{mesh, links, mat, lock, flying}] — instanced interlocking links
    let chainMats = [];     // one link material per padlock; flares white on a blocked strike
    let chainFlights = [];  // [{bands, mat, life}] — chains torn loose, flying and fading
    let chainsBroken = false;
    let bandRigs = [];      // stone pillar: [{mesh, mat, hit, hits, shake, y, home}] — metal bands
    // Buried metal cubes are placed BEFORE the gems are scattered (see planBlocks), so the
    // gem sampler can refuse any spot that overlaps one — a gem sealed inside solid metal
    // could never be dug out.
    let blockPlan = [];     // sandstone pyramid: [{x, y, z, s}] — planned metal cube slots
    let chainGlow = 0;      // 1 right after a blocked strike, decaying to 0
    let starFlash = 0;      // fallen star: 1 right after a strike, decaying to 0
    // Dying light. The fallen star's own glow fades between blows: the shells stop
    // self-emitting (so the seams that mark where one shell ends and the next begins
    // vanish with it), the crystal sinks into shadow and the sky bloom dies too. Every
    // strike relights it, so the star is only legible while you keep hitting it — and once
    // it is dark, the outline hull below is all that is left to aim by.
    let starLight = 1;      // 1 = freshly struck and blazing, 0 = gone dark
    // The silhouette outline fades on its own, slower timer, so the crystal can go
    // dark quickly while the contour lingers as something to aim by.
    let starOutlineLight = 1;
    let starWasDark = false;
    // The silhouette remains hidden until a strike reveals it, then follows the
    // fallen star's dying-light timer rather than the short impact-flash timer.
    let starOutlineActive = false;
    let starOutline = null;    // inverted-hull silhouette outline (fallen star only)
    let starOutlineMat = null;
    const starGlowEl = document.getElementById('star-glow');
    let lunge = null;       // {t, dur, dir, amp} — the solid shoved at the camera, springing back
    // Dynamic internal glow: a single PointLight at the object centre that intensifies
    // as chunks are removed, simulating light escaping from the breaking solid. Updated
    // only when chunk count changes (not every frame) for zero per-frame cost.
    let totalChunkCount = 0;
    let coreGlowLight = null;
    let lastAliveCount = -1; // cached to avoid redundant intensity updates
    let coreGlowSurge = 0;  // 1→0 while a gem-reveal surge is fading
    let dusts = [];         // {points, vels, life}
    let cubeDusts = [];     // {mesh, vel, ang, life, maxLife, startScale}
    const dustBoxGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
    let sparkles = [];      // {points, vel, life, maxLife}
    let wobbleTime = 0;
    let wobbleAmp = 0;
    let introProgress = 1.0;
    const introDuration = 0.6; // in seconds

    let globalTimeScale = 1.0;
    let targetTimeScale = 1.0;
    let kick = 0;

    function quadEaseIn(x) {
        return x * x;
    }

    function easeOutBack(x) {
        const c1 = 1.3; // elegant overshoot
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
    }

    // ---------- Particle Pools (Mem Pool) ----------
    const ParticlePools = {
        dusts: {
            pool: [],
            free: [],
            createItem() {
                const N = 6;
                const arr = new Float32Array(N * 3);
                const geo = new THREE.BufferGeometry();
                geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
                const mat = new THREE.PointsMaterial({
                    color: 0xcbb89a,
                    size: 0.11
                });
                const points = new THREE.Points(geo, mat);
                return {
                    points,
                    vels: Array.from({ length: N }, () => new THREE.Vector3()),
                    life: 0,
                    inUse: false
                };
            },
            init(count) {
                for (let i = 0; i < count; i++) {
                    const item = this.createItem();
                    this.pool.push(item);
                    this.free.push(item);
                }
            },
            get() {
                let item = this.free.pop();
                if (!item) {
                    item = this.createItem();
                    this.pool.push(item);
                }
                item.inUse = true;
                return item;
            },
            release(item) {
                if (!item.inUse) return;
                item.inUse = false;
                item.life = 0;
                if (item.points.parent) {
                    item.points.parent.remove(item.points);
                }
                this.free.push(item);
            },
            releaseAll() {
                this.free.length = 0;
                for (const item of this.pool) {
                    item.inUse = false;
                    item.life = 0;
                    if (item.points.parent) {
                        item.points.parent.remove(item.points);
                    }
                    this.free.push(item);
                }
            }
        },

        cubeDusts: {
            pool: [],
            free: [],
            createItem() {
                const mat = new THREE.MeshBasicMaterial({
                    color: 0xffffff
                });
                const mesh = new THREE.Mesh(dustBoxGeo, mat);
                return {
                    mesh,
                    vel: new THREE.Vector3(),
                    ang: new THREE.Vector3(),
                    life: 0,
                    maxLife: 1.5,
                    startScale: 1.0,
                    inUse: false
                };
            },
            init(count) {
                for (let i = 0; i < count; i++) {
                    const item = this.createItem();
                    this.pool.push(item);
                    this.free.push(item);
                }
            },
            get() {
                let item = this.free.pop();
                if (!item) {
                    item = this.createItem();
                    this.pool.push(item);
                }
                item.inUse = true;
                return item;
            },
            release(item) {
                if (!item.inUse) return;
                item.inUse = false;
                item.life = 0;
                if (item.mesh.parent) {
                    item.mesh.parent.remove(item.mesh);
                }
                this.free.push(item);
            },
            releaseAll() {
                this.free.length = 0;
                for (const item of this.pool) {
                    item.inUse = false;
                    item.life = 0;
                    if (item.mesh.parent) {
                        item.mesh.parent.remove(item.mesh);
                    }
                    this.free.push(item);
                }
            }
        },

        sparkles: {
            pool: [],
            free: [],
            createItem() {
                const geo = new THREE.BufferGeometry();
                const arr = new Float32Array([0, 0, 0]);
                geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
                const mat = new THREE.PointsMaterial({
                    color: 0xffffff,
                    size: 0.1,
                    transparent: true,
                    opacity: 1.0,
                    map: glowTex,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false,
                });
                const points = new THREE.Points(geo, mat);
                return {
                    points,
                    vel: new THREE.Vector3(),
                    life: 0,
                    maxLife: 0.5,
                    inUse: false
                };
            },
            init(count) {
                for (let i = 0; i < count; i++) {
                    const item = this.createItem();
                    this.pool.push(item);
                    this.free.push(item);
                }
            },
            get() {
                let item = this.free.pop();
                if (!item) {
                    item = this.createItem();
                    this.pool.push(item);
                }
                item.inUse = true;
                return item;
            },
            release(item) {
                if (!item.inUse) return;
                item.inUse = false;
                item.life = 0;
                if (item.points.parent) {
                    item.points.parent.remove(item.points);
                }
                this.free.push(item);
            },
            releaseAll() {
                this.free.length = 0;
                for (const item of this.pool) {
                    item.inUse = false;
                    item.life = 0;
                    if (item.points.parent) {
                        item.points.parent.remove(item.points);
                    }
                    this.free.push(item);
                }
            }
        }
    };

    ParticlePools.dusts.init(15);
    ParticlePools.cubeDusts.init(80);
    ParticlePools.sparkles.init(80);
    let collecting = [];    // {group, from, to, t, idx}
    let swing = null;
    let shake = 0;
    let strikes = 0;
    let collectedCount = 0;
    let interacted = false;
    let currentTool = 'hammer';
    let lastResonate = 0;
    // Explosive charge: one per level, unlocked from level 3 on.
    let bombUsed = false;
    let bombRadius = 1.0;
    let bombSlowTimer = 0;
    let plantedBomb = null; // {mesh, mat, light, hitLocal, nLocal, t} — fuse burning
    let revealedOnce = false;
    let gameOver = false;
    let lastEruptionSoundTime = -999;
    // Shared ad and host pause flags across interstitials and rewarded ads
    let adPausedOwner = null; // null | 'interstitial' | 'rewarded'
    let hostPaused = false;
    let adInFlight = false;
    function setAdInFlight(active) {
        adInFlight = !!active;
        if (active) {
            document.body.classList.add('ad-active');
            const opt = document.getElementById('options-overlay');
            if (opt) opt.classList.remove('show');
            const lvl = document.getElementById('level-overlay');
            if (lvl) lvl.classList.remove('show');
        } else {
            document.body.classList.remove('ad-active');
        }
    }
    let zoomFactor = 1.0;
    const MIN_ZOOM = 0.65;
    const MAX_ZOOM = 1.1;
    const activePointers = new Map();
    let initialPinchDist = 0;
    let initialZoomFactor = 1.0;

    const hud = {
        slots: [...document.querySelectorAll('.slot')],
        slotWraps: [...document.querySelectorAll('.slot-wrap')],
        hint: document.getElementById('hint'),
        overlay: document.getElementById('overlay'),
        // NOTE: #strikeCount is re-created by applyTranslations() (it rewrites
        // winDesc.innerHTML), so it must be looked up fresh at use time — never cached here.
        again: document.getElementById('again'),
    };


    // Helper for publishing to Message Bus
    const bus = (topic, ...args) => {
        if (window.Game && window.Game.bus) {
            window.Game.bus.publish(topic, ...args);
        }
    };

    // Register core gameplay & UI subscriptions
    if (window.Game && window.Game.bus) {
        const b = window.Game.bus;
        b.subscribe('game:strike', (data) => updateLevelStrikeCounter(data && data.pop));
        b.subscribe('vfx:toast', (data) => showToolToast(typeof data === 'string' ? data : (data && data.key)));
        b.subscribe('game:hint', (data) => {
            if (data) setHint(data.key, data.repl, data.immediate);
        });
        b.subscribe('game:tool:change', () => refreshToolUI());
        b.subscribe('game:ring:found', () => {
            const badge = document.getElementById('ring-badge');
            if (badge) badge.classList.add('found');
        });
        b.subscribe('vfx:shake', (data) => {
            const amp = (data && data.amp !== undefined) ? data.amp : 0.16;
            if (window.screenShakeEnabled !== false) {
                shake = Math.max(shake, amp * MOTION);
            }
            if (window.hapticsEnabled !== false && navigator.vibrate) {
                try { navigator.vibrate(14); } catch (e) { }
            }
        });
    }

    function updateLevelStrikeCounter(pop = false) {
        const counter = document.getElementById('level-strikes-count');
        if (!counter) return;
        counter.textContent = strikes;
        const panel = document.getElementById('level-strikes');
        const hasStrikes = strikes > 0;
        if (panel) panel.classList.toggle('is-zero', !hasStrikes);
        if (pop && hasStrikes && panel) {
            panel.classList.remove('tick');
            void panel.offsetWidth; // restart the compact counter pop animation
            panel.classList.add('tick');
        }
    }

    // ---------- tool bar (hammer / resonance lens) ----------
    const hammerBtn = document.getElementById('tool-hammer');
    const scanBtn = document.getElementById('tool-scan');
    const bombBtn = document.getElementById('tool-bomb');

    function refreshToolUI() {
        if (!hammerBtn || !scanBtn) return;
        const showScan = level >= 1; // lens unlocks on level 2
        scanBtn.classList.toggle('hidden', !showScan);
        if (!showScan && currentTool === 'scan') currentTool = 'hammer';
        if (bombBtn) {
            const showBomb = level >= 2; // explosive charge unlocks on level 3
            bombBtn.classList.toggle('hidden', !showBomb);
            bombBtn.classList.toggle('used', bombUsed);
            // Play button icon badge at the corner once the free charge is spent, IF rewarded ads are supported
            const supportsRewarded = !!(window.GameSDK && typeof window.GameSDK.supports === 'function' && window.GameSDK.supports('rewarded'));
            const hasRewardAd = showBomb && bombUsed && supportsRewarded;
            bombBtn.classList.toggle('has-ad-reward', hasRewardAd);
            if ((!showBomb || bombUsed) && currentTool === 'bomb') currentTool = 'hammer';
        }
        hammerBtn.classList.toggle('active', currentTool === 'hammer');
        scanBtn.classList.toggle('active', currentTool === 'scan');
        if (bombBtn) bombBtn.classList.toggle('active', currentTool === 'bomb');
    }

    // Tool name popup: floats above the tool bar, horizontally centered on screen.
    const toolToast = document.getElementById('tool-toast');
    let toolToastTimer = 0;
    let unlockTipTimer = null;
    const newToolTip = document.getElementById('new-tool-tooltip');
    const newToolTipBomb = document.getElementById('new-tool-tooltip-bomb');

    function showToolToast(key) {
        if (!toolToast) return;
        toolToast.textContent = window._t ? window._t(key) : key;
        toolToast.classList.remove('show');
        void toolToast.offsetWidth; // restart the transition
        toolToast.classList.add('show');
        clearTimeout(toolToastTimer);
        toolToastTimer = setTimeout(() => toolToast.classList.remove('show'), 1300);
    }

    function claimRewardedBomb() {
        const sdk = window.GameSDK;
        if (!sdk || typeof sdk.showAd !== 'function' || typeof sdk.supports !== 'function' ||
            !sdk.supports('rewarded')) {
            showToolToast('bombSpent');
            return;
        }

        if (adInFlight) return;
        setAdInFlight(true);
        if (bombBtn) bombBtn.classList.add('pending');

        let adResolved = false;
        const resumeAfterAd = () => {
            if (adPausedOwner !== 'rewarded') return;
            adPausedOwner = null;
            if (window.CubeCrackerAudio && window.CubeCrackerAudio.resumeFromVisibility) {
                window.CubeCrackerAudio.resumeFromVisibility('ad');
            }
            if (hostPaused) return;
            startLoop();
        };

        const pauseForAd = () => {
            if (adPausedOwner) return;
            adPausedOwner = 'rewarded';
            handleInputBlur();
            if (window.CubeCrackerAudio && window.CubeCrackerAudio.pauseForVisibility) {
                window.CubeCrackerAudio.pauseForVisibility('ad');
            }
            stopLoop();
        };

        // Safety fallback: unlock UI if platform SDK hangs or fails to respond within 10s (§13)
        const adTimeout = setTimeout(() => {
            if (adResolved) return;
            adResolved = true;
            resumeAfterAd();
            setAdInFlight(false);
            if (bombBtn) bombBtn.classList.remove('pending');
            showToolToast('adUnavailable');
        }, 10000);

        try {
            sdk.showAd('rewarded', {
                onStarted: () => {
                    clearTimeout(adTimeout);
                    pauseForAd();
                },
                onFinished: () => {
                    clearTimeout(adTimeout);
                    if (adResolved) return;
                    adResolved = true;
                    resumeAfterAd();
                    setAdInFlight(false);
                    if (bombBtn) bombBtn.classList.remove('pending');
                    bombUsed = false;
                    currentTool = 'bomb';
                    refreshToolUI();
                    if (window.CubeCrackerAudio && window.CubeCrackerAudio.chime) {
                        window.CubeCrackerAudio.chime(1);
                    }
                    showToolToast('bombToolName');
                },
                onError: () => {
                    clearTimeout(adTimeout);
                    if (adResolved) return;
                    adResolved = true;
                    resumeAfterAd();
                    setAdInFlight(false);
                    if (bombBtn) bombBtn.classList.remove('pending');
                    showToolToast('adUnavailable');
                }
            }, 'refill-bomb-v1');
        } catch (e) {
            clearTimeout(adTimeout);
            if (!adResolved) {
                adResolved = true;
                resumeAfterAd();
                setAdInFlight(false);
                if (bombBtn) bombBtn.classList.remove('pending');
                showToolToast('adUnavailable');
            }
        }
    }

    if (hammerBtn && scanBtn) {
        // onclick (not addEventListener) so a hot-reload of this script can't stack handlers
        hammerBtn.onclick = (e) => {
            e.preventDefault(); e.stopPropagation();
            currentTool = 'hammer';
            refreshToolUI();
            bus('vfx:toast', 'hammerToolName');
        };
        scanBtn.onclick = (e) => {
            e.preventDefault(); e.stopPropagation();
            if (newToolTip) newToolTip.classList.remove('show');
            if (unlockTipTimer) { clearTimeout(unlockTipTimer); unlockTipTimer = null; }
            currentTool = 'scan';
            refreshToolUI();
            bus('vfx:toast', 'lensToolName');
        };
    }
    if (bombBtn) {
        bombBtn.onclick = (e) => {
            e.preventDefault(); e.stopPropagation();
            if (newToolTipBomb) newToolTipBomb.classList.remove('show');
            if (unlockTipTimer) { clearTimeout(unlockTipTimer); unlockTipTimer = null; }
            if (bombUsed) {
                claimRewardedBomb();
                return;
            }
            currentTool = 'bomb';
            refreshToolUI();
            showToolToast('bombToolName');
        };
    }

    // Project the gem's live world position to page coordinates and drop a UI-level
    // flare there. Being DOM, it always paints on top of the solid the gem is buried
    // in. The flare stays anchored to the gem for as long as it's alive: every active
    // ping is re-projected each frame (see updateGemPings), so dragging the solid or
    // moving the camera keeps the diamond and its ring on top of the gem.
    const GEM_PING_BASE = 46;
    const GEM_PING_LIFE = 1.7; // seconds; matches the CSS animation duration
    let gemPings = [];
    const _pingWorld = new V3();

    function positionGemPing(p) {
        if (!p.target || !p.target.group) return;
        p.target.group.getWorldPosition(_pingWorld);
        // The diamond reads as a depth cue: it shrinks the deeper the gem sits away
        // from the camera. Measure the distance BEFORE projecting (project() mutates
        // the scratch vector). The size also scales dynamically with the game's --u scale.
        const dist = _pingWorld.distanceTo(camera.position);
        const refDist = camera.position.distanceTo(CAM_LOOK);
        const depthScale = Math.max(0.45, Math.min(1.7, refDist / Math.max(dist, 0.001)));
        const u = cachedDesignU;
        const v = _scratchPos.copy(_pingWorld).project(camera);
        const x = (v.x * 0.5 + 0.5) * canvasHostRect.width + canvasHostRect.left;
        const y = (-v.y * 0.5 + 0.5) * canvasHostRect.height + canvasHostRect.top;
        const gs = p.gem.style;
        gs.left = x + 'px';
        gs.top = y + 'px';
        if (Math.abs(depthScale - p.scale) > 0.01 || Math.abs(u - (p.u || 0)) > 0.01) {
            p.scale = depthScale;
            p.u = u;
            const size = GEM_PING_BASE * depthScale * u;
            gs.width = size + 'px';
            gs.height = size + 'px';
            gs.borderRadius = (7 * depthScale * u) + 'px';
            gs.boxShadow = `0 0 ${14 * depthScale * u}px ${p.css}, 0 0 ${34 * depthScale * u}px ${p.css}, 0 0 ${62 * depthScale * u}px ${p.css}`;
        }
        const rs = p.ring.style;
        rs.left = x + 'px';
        rs.top = y + 'px';
        const ringSize = GEM_PING_BASE * u;
        rs.width = ringSize + 'px';
        rs.height = ringSize + 'px';
        rs.borderWidth = (2 * u) + 'px';
    }

    function updateGemPings(dt) {
        for (let i = gemPings.length - 1; i >= 0; i--) {
            const p = gemPings[i];
            p.life += dt;
            if (p.life >= GEM_PING_LIFE || !p.gem.parentNode || !p.ring.parentNode) {
                if (p.gem.parentNode) p.gem.remove();
                if (p.ring.parentNode) p.ring.remove();
                gemPings.splice(i, 1);
                continue;
            }
            positionGemPing(p);
        }
    }

    function clearGemPings() {
        for (const p of gemPings) {
            if (p.gem.parentNode) p.gem.remove();
            if (p.ring.parentNode) p.ring.remove();
        }
        gemPings.length = 0;
    }

    function spawnGemPing(target, color) {
        const css = color.getStyle();

        const gem = document.createElement('div');
        gem.className = 'gem-ping';
        gem.style.background = css;
        document.body.appendChild(gem);

        const ring = document.createElement('div');
        ring.className = 'gem-ring';
        ring.style.color = css;
        document.body.appendChild(ring);

        const p = { target, gem, ring, css, scale: -1, life: 0 };
        gemPings.push(p);
        positionGemPing(p); // place it before the first frame paints

        const remove = () => {
            if (gem.parentNode) gem.remove();
            if (ring.parentNode) ring.remove();
        };
        gem.addEventListener('animationend', remove);
        setTimeout(remove, 1800);
    }

    function resonateGems() {
        const now = performance.now();
        if (now - lastResonate < 450) return; // debounce rapid taps
        lastResonate = now;
        let any = false;
        cubeGroup.updateMatrixWorld(true);
        for (const t of treasures) {
            if (t.collected) continue;
            any = true;
            // Lens resonance is intentionally UI-only: a gem glow and expanding ring,
            // with no 3D particles bursting out from beneath the solid. The ping tracks
            // the gem itself, so it follows it as the solid or camera is turned.
            spawnGemPing(t, t.sprite.material.color);
            t.revealFlash = Math.max(t.revealFlash || 0, 0.7);
        }
        if (any) {
            CubeCrackerAudio.chime(0);
            shake = (window.screenShakeEnabled !== false) ? 0.05 * MOTION : 0; if (window.hapticsEnabled !== false && navigator.vibrate) { try { navigator.vibrate(14); } catch (e) { } }
            dirty = true;
        }
    }

    // Monotonic sequence so a slow fade-out can never paint a stale hint after a newer
    // one has been set — rapid setHint() calls used to race, leaving the older text up.
    let hintSeq = 0;
    function setHint(key, replacementObj = {}) {
        // dataset.repl is already a JSON string; stringifying it again could never match
        // the stringified object, so the de-dupe below used to never fire and identical
        // hints re-triggered the fade animation on every call.
        const repl = JSON.stringify(replacementObj);
        if (hud.hint.dataset.key === key && hud.hint.dataset.repl === repl) return;
        const seq = ++hintSeq;
        hud.hint.dataset.key = key;
        hud.hint.dataset.repl = repl;
        hud.hint.classList.add('fade');
        setTimeout(() => {
            if (seq !== hintSeq) return; // a newer hint superseded this one
            hud.hint.textContent = key ? (window._t ? window._t(key, replacementObj) : key) : '';
            hud.hint.classList.remove('fade');
            hud.hint.classList.remove('accent');
            void hud.hint.offsetWidth;
            hud.hint.classList.add('accent');
        }, 250);
    }

    // ---------- build / reset ----------
    let scoreboardCountInterval = null;
    function disposeAll() {
        if (scoreboardCountInterval) {
            clearInterval(scoreboardCountInterval);
            scoreboardCountInterval = null;
        }
        clearTimeout(bombSlowTimer);
        bombSlowTimer = 0;
        targetTimeScale = 1.0;
        globalTimeScale = 1.0;
        clearTimeout(toolToastTimer);
        toolToastTimer = 0;
        if (toolToast) toolToast.classList.remove('show');

        // Intact chunks own an unused standalone geometry; detached ones handed theirs
        // to `debris`, so the two loops never touch the same geometry twice. Debris
        // materials come from the shared fade ring and must outlive the level.
        for (const c of chunks) c.geometry.dispose();
        for (const d of debris) { d.mesh.geometry.dispose(); if (!isSharedRockMat(d.mesh.material)) d.mesh.material.dispose(); }
        if (starOutline) {
            // shares mergedGeo, so only its own material is ours to dispose
            if (starOutline.parent) starOutline.parent.remove(starOutline);
            starOutlineMat.dispose();
            starOutline = null; starOutlineMat = null;
        }
        if (mergedGeo) mergedGeo.dispose();
        mergedGeo = null; solidMesh = null; basePositions = null;
        mergedColorDirty = mergedPosDirty = mergedDmgDirty = false;
        ParticlePools.dusts.releaseAll();
        ParticlePools.sparkles.releaseAll();
        ParticlePools.cubeDusts.releaseAll();
        for (const t of treasures) { t.sprite.material.dispose(); t.gem.geometry.dispose(); t.gem.material.dispose(); }
        if (secretRing) {
            if (secretRing.group.parent) secretRing.group.parent.remove(secretRing.group);
            secretRing.sprite.material.dispose(); // geometry + ring material are shared
            secretRing = null;
        }
        ringFx = null;
        chunksGroup.clear(); debrisGroup.clear(); fxGroup.clear();
        for (const t of treasures) { if (t.group.parent) t.group.parent.remove(t.group); }

        for (const sw of activeShockwaves) shockwavePool.push(sw.mesh);
        activeShockwaves.length = 0;
        for (const fl of activeFlashes) flashLightPool.push(fl.light);
        activeFlashes.length = 0;

        defusePlantedBomb();
        moltenQueue = [];
        moltenWounds = [];
        for (const tw of crustTweens) tw.chunk.crustTween = null;
        crustTweens = [];
        disposeLavaStreams();
        for (const s of hiveSquash) s.chunk.squash = null;
        hiveSquash = [];
        disposeHoneyDrips();
        disposeGemRig();
        disposeBands();
        // Dynamic internal glow: keep the light object alive (reused across levels)
        // but reset its state so the next build() starts from scratch.
        if (coreGlowLight) { coreGlowLight.intensity = 0; coreGlowLight.color.setHex(0xffffff); }
        totalChunkCount = 0;
        lastAliveCount = -1;
        coreGlowSurge = 0;
        chainsBroken = false; chainGlow = 0;
        clearGemPings();
        chunks = []; treasures = []; debris = []; dusts = []; sparkles = []; collecting = [];
        cubeDusts = [];
        // A rebuild mid-swing (level select / context restore) used to drop `swing` while
        // leaving the hammer parked on screen, half-faded and mid-rotation.
        swing = null;
        hammer.visible = false;
        hammerArm.rotation.set(SWING_START, 0, 0);
        hammerArm.scale.set(1, 1, 1);
        setHammerOpacity(1);
    }

    // The opening instruction for whatever this level is made of. Shared by build()
    // and the stuck-player nudge in impact(), so both always agree.
    function materialHintKey() {
        return material === 'egg' ? 'eggHint'
            : material === 'ice' ? 'iceHint'
                : material === 'obsidian' ? 'obsidianHint'
                    : material === 'molten' ? 'moltenHint'
                        : material === 'clockwork' ? 'clockworkHint'
                            : material === 'petrified' ? 'petrifiedHint'
                                : material === 'hive' ? 'hiveHint'
                                    : material === 'reliquary' ? 'reliquaryHint'
                                        : level === 12 ? 'greatCubeHint'
                                            : material === 'star' ? 'starHint'
                                                : level === 0 ? 'dragHint'
                                                    : 'levelHint';
    }

    // A gem must sit at least this far inside every face so its encasing chunk is
    // fully internal (never a surface chunk) — otherwise the gem peeks out before any
    // strike, e.g. in the pyramid's narrow apex.
    const GEM_MARGIN = 0.42;
    function buriedBy(shp, margin) {
        return (p) => {
            for (const pl of shp.planes) if (pl.d - p.dot(pl.n) < margin) return false;
            return true;
        };
    }

    // A gem may never share a spot with a buried metal cube (it would be sealed in metal
    // and unreachable, and the gem would glow out of solid steel). Keep clear of the whole
    // block plus a margin. The margin is PER BLOCK (`b.clear`), because it depends on how
    // the cube sits: a cocked cube reaches s*sqrt(3) ~= 1.74s along its placement axis, so
    // it needs the full 2.6s, while an axis-aligned cube only ever reaches s and a smaller
    // guard is enough. Over-guarding matters: the pyramid's single large centre block with a
    // 2.6s box would swallow the entire gem sampling volume, leaving the sampler with no
    // legal spot at all and forcing it onto the last-resort pass (which drops the guard and
    // lets gems clump together inside the metal).
    const BLOCK_CLEAR = 2.6;
    function clearOfBlocks(p) {
        for (const b of blockPlan) {
            const cl = b.s * (b.clear || BLOCK_CLEAR);
            if (Math.abs(p.x - b.x) < cl &&
                Math.abs(p.y - b.y) < cl &&
                Math.abs(p.z - b.z) < cl) return false;
        }
        return true;
    }

    function randomTreasurePositions(shp, count = 3) {
        const b = shp.bound;
        const tb = { x: b.x * 0.6, y: b.y * 0.6, z: b.z * 0.6 };
        const minSep = Math.min(b.x, b.y, b.z) * 0.7;
        const required = count;
        const sample = () => new V3(
            (Math.random() * 2 - 1) * tb.x,
            (Math.random() * 2 - 1) * tb.y,
            (Math.random() * 2 - 1) * tb.z
        );
        const buried = buriedBy(shp, GEM_MARGIN);
        const inBlocks = (p) => buried(p) && clearOfBlocks(p);
        // Separation is relaxed in graded steps rather than dropped outright, so a solid
        // whose free volume is tight (e.g. the pyramid around its big centre block) still
        // ends up with gems that are modestly spread instead of clumped together. Only
        // once every spaced pass has failed do the guards themselves start coming off, and
        // the very last pass exists purely so a level can never generate fewer than requested.
        const passes = [];
        for (const f of [1, 0.8, 0.62, 0.48, 0.36]) passes.push({ ok: inBlocks, sep: minSep * f });
        passes.push({ ok: inBlocks, sep: 0 });
        for (const f of [0.62, 0.36, 0]) {
            passes.push({ ok: (p) => shp.contains(p) && clearOfBlocks(p), sep: minSep * f });
        }
        passes.push({ ok: (p) => shp.contains(p), sep: minSep * 0.36 });
        passes.push({ ok: (p) => shp.contains(p), sep: 0 });
        let best = [];
        for (const pass of passes) {
            const pts = [];
            let guard = 0;
            while (pts.length < count && guard++ < 6000) {
                const p = sample();
                if (!pass.ok(p)) continue;
                if (pass.sep === 0 || pts.every((q) => q.distanceTo(p) > pass.sep)) pts.push(p);
            }
            if (pts.length === count) return pts;
            if (pts.length > best.length) best = pts; // keep the closest attempt as a floor
        }
        return best;
    }

    // Optional level-authored gem anchors. Coordinates are normalized against the
    // active shape's bounds, which keeps a layout stable even if that level's size changes.
    function treasureLayoutPositions(lvl, shp) {
        if (!lvl.gemLayout) return null;
        return lvl.gemLayout.map(([x, y, z]) => new V3(
            x * shp.bound.x,
            y * shp.bound.y,
            z * shp.bound.z
        ));
    }

    // ---------- clockwork: a packed mass of solid gears ----------
    // The clockwork level isn't a fractured solid. Its volume is packed with individual
    // gear pieces of assorted sizes, plus three small clumps of dirt that hide the
    // gems. Each piece is emitted in exactly the shape the Voronoi fracture uses —
    // { geometry, centroid } with the geometry centred on the origin — so it drops
    // straight into the merged-solid pipeline (one mesh, per-chunk vertex ranges).
    const METALS = [
        [0.88, 0.70, 0.32], // brass
        [0.52, 0.37, 0.16], // dark bronze
        [0.63, 0.65, 0.69], // steel
    ];
    const DIRT = [0.30, 0.22, 0.14];

    // One gear: a toothed disc with a bore, extruded along local Y. Windings are hand
    // checked so every face is front-facing (the rock material is FrontSide).
    // The bore is deliberately coarse (a small hexagon) rather than matching the tooth
    // profile's segment count: the hole is tiny on screen, so the plates are stitched
    // between the fine outer ring and the coarse inner ring instead of quad-per-segment.
    const BORE_SEGS = 6;
    function makeGearGeometry(R, T, teeth, base, rootRatio = 0.74) {
        const half = T * 0.5;
        const rootR = R * (typeof rootRatio === 'number' ? rootRatio : 0.74);
        const holeR = R * 0.27;
        const N = teeth * 4;
        const px = new Float64Array(N), pz = new Float64Array(N), pa = new Float64Array(N);
        const step = (Math.PI * 2) / teeth;
        const frac = [0, 0.16, 0.34, 0.5];
        for (let i = 0; i < teeth; i++) {
            for (let k = 0; k < 4; k++) {
                const a = (i + frac[k]) * step;
                const rr = (k === 1 || k === 2) ? R : rootR;
                const idx = i * 4 + k;
                pa[idx] = a;
                px[idx] = Math.cos(a) * rr; pz[idx] = Math.sin(a) * rr;
            }
        }
        const M = BORE_SEGS;
        const hx = new Float64Array(M), hz = new Float64Array(M), ha = new Float64Array(M);
        for (let i = 0; i < M; i++) {
            const a = (i / M) * Math.PI * 2;
            ha[i] = a;
            hx[i] = Math.cos(a) * holeR; hz[i] = Math.sin(a) * holeR;
        }
        const pos = [], col = [];
        let s = 1;
        const v = (x, y, z) => {
            pos.push(x, y, z);
            col.push(base[0] * s, base[1] * s, base[2] * s);
        };
        // plates: zipper the two rings together, always advancing whichever ring's next
        // vertex comes first in angle (both rings start at angle 0, so they stay in step)
        let i = 0, j = 0;
        while (i < N || j < M) {
            const aOuter = i < N ? (i + 1 < N ? pa[i + 1] : Math.PI * 2) : Infinity;
            const aInner = j < M ? (j + 1 < M ? ha[j + 1] : Math.PI * 2) : Infinity;
            const stepOuter = i < N && (j >= M || aOuter <= aInner);
            const oc = i % N, on = (i + 1) % N, ic = j % M, inx = (j + 1) % M;
            if (stepOuter) {
                s = 1.0; // top plate (+y)
                v(hx[ic], half, hz[ic]); v(px[on], half, pz[on]); v(px[oc], half, pz[oc]);
                s = 0.64; // bottom plate (-y)
                v(hx[ic], -half, hz[ic]); v(px[oc], -half, pz[oc]); v(px[on], -half, pz[on]);
                i++;
            } else {
                s = 1.0;
                v(hx[ic], half, hz[ic]); v(hx[inx], half, hz[inx]); v(px[oc], half, pz[oc]);
                s = 0.64;
                v(hx[ic], -half, hz[ic]); v(px[oc], -half, pz[oc]); v(hx[inx], -half, hz[inx]);
                j++;
            }
        }
        for (let i = 0; i < N; i++) {
            const j = (i + 1) % N;
            // outer rim + tooth flanks
            s = 0.84;
            v(px[i], half, pz[i]); v(px[j], half, pz[j]); v(px[j], -half, pz[j]);
            v(px[i], half, pz[i]); v(px[j], -half, pz[j]); v(px[i], -half, pz[i]);
        }
        for (let i = 0; i < M; i++) {
            const j = (i + 1) % M;
            // bore wall (faces inward)
            s = 0.40;
            v(hx[i], half, hz[i]); v(hx[j], -half, hz[j]); v(hx[j], half, hz[j]);
            v(hx[i], half, hz[i]); v(hx[i], -half, hz[i]); v(hx[j], -half, hz[j]);
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
        geo.computeVertexNormals();
        return geo;
    }

    // A lumpy clod of earth: an icosahedron pushed around by a smooth function of the
    // vertex direction, so the duplicated (non-indexed) vertices stay welded.
    function makeDirtClump(r, rng) {
        const geo = new THREE.IcosahedronGeometry(r, 1);
        const pos = geo.attributes.position;
        const s1 = rng() * 9, s2 = rng() * 9, s3 = rng() * 9;
        const p = new V3();
        for (let i = 0; i < pos.count; i++) {
            p.fromBufferAttribute(pos, i);
            const n = Math.sin((p.x / r) * 4.1 + s1) * Math.cos((p.y / r) * 3.6 + s2)
                + Math.sin((p.z / r) * 5.2 + s3) * 0.6;
            p.multiplyScalar(1 + n * 0.14);
            pos.setXYZ(i, p.x, p.y, p.z);
        }
        geo.computeVertexNormals();
        const col = new Float32Array(pos.count * 3);
        for (let f = 0; f < pos.count; f += 3) {
            const k = 0.72 + rng() * 0.56; // per-face grit
            for (let j = 0; j < 3; j++) {
                const o = (f + j) * 3;
                col[o] = DIRT[0] * k; col[o + 1] = DIRT[1] * k; col[o + 2] = DIRT[2] * k;
            }
        }
        geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
        return geo;
    }

    function buildGearCluster(shp, count, treasurePositions, rng) {
        rng = rng || Math.random;
        const Rs = Math.min(shp.bound.x, shp.bound.y, shp.bound.z);
        const raw = [];
        const placed = [];
        const treasureChunkIndex = [];

        // the dirt clumps go down first so the gears pack around them
        const dirtR = Rs * 0.16;
        for (const tp of treasurePositions) {
            treasureChunkIndex.push(raw.length);
            raw.push({ geometry: makeDirtClump(dirtR, rng), centroid: tp.clone() });
            placed.push({ p: tp.clone(), r: dirtR, dirt: true });
        }

        const q = new THREE.Quaternion();
        const e = new THREE.Euler();
        const quarter = () => ((rng() * 4) | 0) * (Math.PI * 0.5); // axis-aligned only

        for (let gIdx = 0; gIdx < count; gIdx++) {
            let placedGear = false;
            const progress = gIdx / count;

            for (let attempt = 0; attempt < 500; attempt++) {
                const ease = Math.max(0.45, 1.0 - (attempt / 150));
                const minR = 0.18 * Rs;
                const maxR = (0.52 - progress * 0.12) * Rs * ease;
                // exponent < 1.5 biases the distribution toward the large end of the
                // range, so a few more big gears show up in the pack
                const R = Math.max(minR, Rs * (0.18 + Math.pow(rng(), 1.2) * Math.max(0.01, (maxR / Rs) - 0.18)));

                const lim = Math.max(0, Rs * 0.98 - R * 0.25);
                const p = new V3(rng() * 2 - 1, rng() * 2 - 1, rng() * 2 - 1);
                if (p.lengthSq() < 1e-6) continue;
                p.normalize().multiplyScalar(lim * Math.cbrt(rng()));

                const interlockFactor = 0.58 * ease;
                let ok = true;
                for (const o of placed) {
                    const sepScale = o.dirt ? 0.90 : interlockFactor;
                    const minD = (R + o.r) * sepScale;
                    if (p.distanceToSquared(o.p) < minD * minD) { ok = false; break; }
                }
                if (!ok) continue;

                const teeth = Math.max(5, Math.min(10, 5 + Math.round((((R / Rs) - 0.18) / 0.34) * 4)));
                const T = R * (0.28 + rng() * 0.24);
                const metal = METALS[(rng() * METALS.length) | 0];
                const tint = 0.84 + rng() * 0.32;
                const geo = makeGearGeometry(R, T, teeth,
                    [metal[0] * tint, metal[1] * tint, metal[2] * tint]);
                e.set(quarter(), quarter(), quarter());
                geo.applyQuaternion(q.setFromEuler(e));
                raw.push({ geometry: geo, centroid: p.clone() });
                placed.push({ p: p.clone(), r: R });
                placedGear = true;
                break;
            }

            if (!placedGear) {
                const R = 0.18 * Rs;
                const lim = Rs * 0.75;
                const p = new V3(rng() * 2 - 1, rng() * 2 - 1, rng() * 2 - 1).normalize().multiplyScalar(lim * rng());
                const teeth = 5;
                const T = R * 0.3;
                const metal = METALS[(rng() * METALS.length) | 0];
                const tint = 0.84 + rng() * 0.32;
                const geo = makeGearGeometry(R, T, teeth,
                    [metal[0] * tint, metal[1] * tint, metal[2] * tint]);
                e.set(quarter(), quarter(), quarter());
                geo.applyQuaternion(q.setFromEuler(e));
                raw.push({ geometry: geo, centroid: p.clone() });
                placed.push({ p: p.clone(), r: R });
            }
        }
        return { chunks: raw, treasureChunkIndex };
    }

    // ---------- chain-bound chest: a hollow chest with internal compartments ----------
    // The chest isn't a solid block of timber. The Voronoi fracture is run over the whole
    // shape and then every cell that doesn't reach the outer surface is thrown away, which
    // leaves a watertight one-cell-thick shell with an empty cavity behind it (the union of
    // the boundary-touching cells covers the whole surface, so nothing shows through until
    // you actually break in). Slabs — tiled into chunky planks so they come apart under the
    // hammer — partition that cavity into six compartments, and three of them hold a gem
    // buried in its own clump of dirt.
    const CHEST_PLANK = [0.44, 0.30, 0.18];

    // A plank tile. Non-indexed (the merged-solid buffer ignores index buffers) and vertex
    // coloured per facet, so it flat-shades with the same grit as the rest of the timber.
    function makeSlabGeometry(w, h, d, base, rng) {
        const geo = new THREE.BoxGeometry(w, h, d).toNonIndexed();
        const n = geo.attributes.position.count;
        const col = new Float32Array(n * 3);
        for (let f = 0; f < n; f += 3) {
            const k = 0.78 + rng() * 0.44;
            for (let j = 0; j < 3; j++) {
                const o = (f + j) * 3;
                col[o] = base[0] * k; col[o + 1] = base[1] * k; col[o + 2] = base[2] * k;
            }
        }
        geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
        return geo;
    }

    function buildHollowChest(shp, chunkCount, rng, colors) {
        rng = rng || Math.random;
        const gen = CubeCrackerFracture.generate(shp, chunkCount, [], rng, colors);
        const planes = shp.planes;
        const depthAt = (x, y, z) => {
            let m = Infinity;
            for (const pl of planes) {
                const dd = pl.d - (x * pl.n.x + y * pl.n.y + z * pl.n.z);
                if (dd < m) m = dd;
            }
            return m;
        };
        const out = [];
        for (const c of gen.chunks) {
            const p = c.geometry.attributes.position.array;
            let touches = false;
            for (let i = 0; i < p.length && !touches; i += 3) {
                // geometry is centroid-relative, so shift it back into the solid's space
                if (depthAt(p[i] + c.centroid.x, p[i + 1] + c.centroid.y, p[i + 2] + c.centroid.z) < 1e-3) {
                    touches = true;
                }
            }
            if (touches) { c.kind = 'wall'; out.push(c); }
            else c.geometry.dispose(); // interior cell: this is what makes the chest hollow
        }

        // Interior cavity: inset a touch less than the shell is thick, so the slabs bed
        // into the timber instead of floating clear of it.
        const spacing = Math.cbrt(shp.volume / chunkCount);
        const inset = spacing * 1.15;
        const ix = Math.max(shp.bound.x - inset, 0.25);
        const iy = Math.max(shp.bound.y - inset, 0.25);
        const iz = Math.max(shp.bound.z - inset, 0.25);
        const ts = Math.min(iy, iz) * 0.16; // slab thickness

        const slab = (cx, cy, cz, sx, sy, sz) => out.push({
            geometry: makeSlabGeometry(sx, sy, sz, CHEST_PLANK, rng),
            centroid: new V3(cx, cy, cz), kind: 'slab',
        });
        // One panel per partition: each spans the full height/width/depth of the cavity
        // rather than being tiled into a grid of little planks.
        const panel = (c, s) => slab(c.x, c.y, c.z, s.x * 0.98, s.y * 0.98, s.z * 0.98);

        const colW = (2 * ix) / 3;
        for (let i = 1; i <= 2; i++) { // two upright dividers -> three bays
            panel({ x: -ix + colW * i, y: 0, z: 0 }, { x: ts, y: 2 * iy, z: 2 * iz });
        }
        const shelfW = Math.max(colW - ts, colW * 0.5); // stops short of the dividers
        for (let col = 0; col < 3; col++) { // a shelf across each bay -> six compartments
            panel({ x: -ix + colW * (col + 0.5), y: 0, z: 0 },
                { x: shelfW, y: ts, z: 2 * iz });
        }

        const positions = [];
        const treasureChunkIndex = [];
        const rd = Math.min(colW * 0.5, iy * 0.5, iz) * 0.55;
        for (let col = 0; col < 3; col++) {
            // one gem per bay, in a random shelf half, so they're always spread out
            const row = rng() < 0.5 ? -1 : 1;
            const p = new V3(
                -ix + colW * (col + 0.5) + (rng() - 0.5) * colW * 0.20,
                row * iy * 0.5 + (rng() - 0.5) * iy * 0.18,
                (rng() - 0.5) * iz * 0.5
            );
            treasureChunkIndex.push(out.length);
            out.push({ geometry: makeDirtClump(rd, rng), centroid: p.clone(), kind: 'dirt' });
            positions.push(p);
        }
        return { chunks: out, treasureChunkIndex, positions };
    }

    // The gem's invisible tap target is identical for every gem and nothing
    // mutates it, so build it once for the page rather than per gem per build() —
    // the per-build copies used to be allocated but never disposed, leaking a
    // geometry + material on the GPU on every level advance and context restore.
    // Deliberately much larger than the gem it wraps (octahedron r=0.1875) and larger
    // than its glow sprite (0.9 units wide, so 0.45 half-extent) — a gem is a small
    // target on a phone, so the invisible tap box is ~3x the visible gem.
    const hitSphereGeo = new THREE.SphereGeometry(0.58, 10, 8);
    const hitSphereMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });

    // The secret gold ring: one per level, so its geometry/material live for the page
    // rather than being rebuilt (and leaked) on every build().
    const ringGeo = new THREE.TorusGeometry(0.135, 0.042, 4, 12);
    const ringMat = new THREE.MeshStandardMaterial({
        color: 0xffd166, emissive: 0xffae2e, emissiveIntensity: 0.45,
        roughness: 0.20, metalness: 0.95, flatShading: true,
    });

    function makeTreasure(pos, color, chunkRef) {
        const group = new THREE.Group();
        group.position.copy(pos);
        const gem = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.1875, 0),
            new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 1.7, roughness: 0.25, metalness: 0.1 })
        );
        group.add(gem);
        const gc = new THREE.Color(color);
        const max = Math.max(gc.r, gc.g, gc.b);
        const sat = 0.8;
        const glowColor = new THREE.Color(
            gc.r === max ? max : gc.r * sat,
            gc.g === max ? max : gc.g * sat,
            gc.b === max ? max : gc.b * sat
        );
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
            map: glowTex, color: glowColor, transparent: true, opacity: 0,
            blending: THREE.AdditiveBlending, depthWrite: false,
        }));
        sprite.scale.setScalar(0.9);
        group.add(sprite);
        const light = new THREE.PointLight(glowColor, 1.6, 2.6, 2);
        group.add(light);
        const hitMesh = new THREE.Mesh(hitSphereGeo, hitSphereMat);
        hitMesh.userData.kind = 'treasure';
        group.add(hitMesh);
        cubeGroup.add(group);
        const t = {
            group, gem, sprite, light, hitMesh, chunk: chunkRef, exposed: false, collected: false,
            spin: 0.4 + Math.random() * 0.3,
        };
        hitMesh.userData.treasure = t;
        return t;
    }

    // ---------- secret gold ring ----------
    // Sealed inside one chunk, chosen after the gems are placed so it never shares a
    // chunk with one (and is kept well away from them, so it can't be uncovered by
    // accident while digging a gem out). Invisible until that chunk is gone.
    function createSecretRing() {
        if (!chunks.length) return null;
        const gemChunks = new Set();
        for (const t of treasures) if (t.chunk) gemChunks.add(t.chunk);
        const pool = [];
        for (const c of chunks) {
            if (!c.alive || gemChunks.has(c)) continue;
            if (c.kind === 'dirt') continue; // dirt clumps are the gems' own wrapping
            pool.push(c);
        }
        if (!pool.length) return null;
        const buried = buriedBy(shape, GEM_MARGIN * 0.75);
        const deep = pool.filter((c) => buried(c.centroid));
        const far = Math.min(shape.bound.x, shape.bound.y, shape.bound.z) * 0.75;
        const spread = deep.filter((c) =>
            treasures.every((t) => !t.chunk || t.chunk.centroid.distanceTo(c.centroid) > far));
        const list = spread.length ? spread : (deep.length ? deep : pool);
        const chunk = list[(Math.random() * list.length) | 0];

        const group = new THREE.Group();
        group.position.copy(chunk.centroid);
        const mesh = new THREE.Mesh(ringGeo, ringMat);
        mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        group.add(mesh);
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
            map: glowTex, color: 0xffd07a, transparent: true, opacity: 0,
            blending: THREE.AdditiveBlending, depthWrite: false,
        }));
        sprite.scale.setScalar(0.48);
        group.add(sprite);
        const light = new THREE.PointLight(0xffc65c, 0, 1.5, 2);
        group.add(light);
        const hitMesh = new THREE.Mesh(hitSphereGeo, hitSphereMat);
        hitMesh.userData.kind = 'ring';
        group.add(hitMesh);
        group.visible = false; // a secret: nothing shows until the rock is off it
        cubeGroup.add(group);
        return { group, mesh, sprite, light, hitMesh, chunk, exposed: false, collected: false, flash: 0 };
    }

    // Flip the ring's visibility with its encasing chunk. The dragon egg's shell knits
    // itself shut again, so a ring there can seal back over — hence open/close, not once.
    function updateRingExposure() {
        const r = secretRing;
        if (!r || r.collected) return;
        const open = !!(r.chunk && (!r.chunk.alive || r.chunk.shrunk));
        if (open === r.exposed) return;
        r.exposed = open;
        r.group.visible = open;
        dirty = true;
        if (!open) return;
        r.flash = 1;
        CubeCrackerAudio.chime(2);
        const wp = r.group.localToWorld(new V3(0, 0, 0));
        spawnSparkleBurst(wp, new THREE.Color(0xffd166), 26);
        spawnJuiceText('SECRET RING!', wp, '#ffd166', '40px');
    }

    function collectRing() {
        const r = secretRing;
        if (!r || r.collected) return;
        r.collected = true;
        ringFound = true;
        window.ringsFound[level] = true;
        window.persistGameState();
        const wp = new V3();
        r.group.getWorldPosition(wp);
        cubeGroup.remove(r.group);
        r.group.position.copy(wp);
        scene.add(r.group);
        ringFx = { t: 0, from: wp.clone(), to: ringBadgeWorldTarget(), sparkT: 0 };
        bus('audio:play', { sfx: 'reveal' });
        CubeCrackerAudio.chime(1);
        spawnSparkleBurst(wp, new THREE.Color(0xffe6a8), 34);
        spawnJuiceText('GOLD RING BONUS!!!', wp, '#ffd166', '44px');
        if (window.hapticsEnabled !== false && navigator.vibrate) {
            try { navigator.vibrate([18, 20, 44]); } catch (e) { }
        }
        dirty = true;
    }

    // The ring flies to its HUD badge, exactly like a gem flies to its slot: the
    // badge's screen position is unprojected into world space so the flight always
    // lands on the icon whatever the viewport shape.
    function ringBadgeWorldTarget() {
        const el = document.getElementById('ring-badge');
        let ndcX = 0.75, ndcY = 0.85;
        if (el) {
            const r = el.getBoundingClientRect();
            ndcX = ((r.left + r.width / 2 - canvasHostRect.left) / canvasHostRect.width) * 2 - 1;
            ndcY = -((r.top + r.height / 2 - canvasHostRect.top) / canvasHostRect.height) * 2 + 1;
        }
        const dir = new V3(ndcX, ndcY, 0.5).unproject(camera).sub(camera.position).normalize();
        return camera.position.clone().addScaledVector(dir, 1.6);
    }

    function updateRingFx(dt) {
        if (!ringFx || !secretRing) return;
        const r = secretRing;
        ringFx.t += dt / 0.55;
        const k = Math.min(ringFx.t, 1);
        const e = 1 - Math.pow(1 - k, 3);
        r.group.position.lerpVectors(ringFx.from, ringFx.to, e);
        r.group.position.y += Math.sin(e * Math.PI) * 0.38; // a gentle swoop, not a slide
        r.mesh.rotation.y += dt * 9;
        const s = Math.max(1 - e, 0.06);
        r.mesh.scale.setScalar(s);
        r.sprite.scale.setScalar(0.48 * s + 0.05);
        r.sprite.material.opacity = 0.4 * (1 - e);
        r.light.intensity = 0.8 * (1 - e);
        // dt-gated so the sparkle rate is ~11/sec regardless of refresh rate
        ringFx.sparkT -= dt;
        if (ringFx.sparkT <= 0) {
            ringFx.sparkT = 0.09;
            spawnSparkle(r.group.position, r.sprite.material.color);
        }
        dirty = true;
        if (k >= 1) {
            scene.remove(r.group);
            ringFx = null;
            bus('game:ring:found');
        }
    }

    // ---------- chain-bound chest: two real padlocks + real chains ----------
    // Both are genuine 3D models parented to cubeGroup (so they turn and lurch with the
    // chest) rather than painted-on fracture chunks. Two padlocks bind it, each pinning one
    // vertical strap and one girth band where the two cross, and while the chest is sealed a
    // padlock is the only thing a hammer can touch (see lockStrike) — batter one apart and
    // its own two chains whip free (breakLock -> flyChainBands). Smash both and the chest is
    // unbound.
    const LOCK_HP = 1; // one clean hit shears a padlock straight off

    // A heavy brass padlock: chunky body with bevelled cheeks, riveted corners, a keyhole,
    // and a thick steel shackle. Every piece gets its own geometry so it can be flung off
    // and disposed independently when the lock breaks.
    function buildPadlock(s) {
        const brass = new THREE.MeshStandardMaterial({ color: 0xd6a53c, roughness: 0.30, metalness: 0.88 });
        const steel = new THREE.MeshStandardMaterial({ color: 0xa9b1bb, roughness: 0.26, metalness: 0.94 });
        const dark = new THREE.MeshStandardMaterial({ color: 0x140e08, roughness: 0.55, metalness: 0.20 });
        const grp = new THREE.Group();
        const parts = [];
        const add = (geo, mat, x, y, z) => {
            const m = new THREE.Mesh(geo, mat);
            m.position.set(x, y, z);
            grp.add(m);
            parts.push(m);
            return m;
        };
        const bw = 0.70 * s, bh = 0.64 * s, bd = 0.34 * s;
        add(new THREE.BoxGeometry(bw, bh, bd), brass, 0, 0, 0);                               // body
        add(new THREE.BoxGeometry(bw * 0.84, bh * 0.84, bd * 0.22), brass, 0, 0, bd * 0.55);  // face plate
        add(new THREE.BoxGeometry(bw * 0.84, bh * 0.84, bd * 0.22), brass, 0, 0, -bd * 0.55); // back plate
        for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
            add(new THREE.SphereGeometry(0.046 * s, 6, 5), steel,
                sx * bw * 0.33, sy * bh * 0.31, bd * 0.64);                                   // corner rivets
        }
        const keyhole = add(new THREE.CylinderGeometry(0.085 * s, 0.085 * s, bd * 0.5, 10), dark,
            0, -bh * 0.02, bd * 0.58);
        keyhole.rotation.x = Math.PI / 2;
        add(new THREE.BoxGeometry(0.07 * s, 0.2 * s, bd * 0.44), dark, 0, -bh * 0.22, bd * 0.58); // key slot
        const sr = bw * 0.33, st = 0.075 * s;
        add(new THREE.TorusGeometry(sr, st, 5, 14, Math.PI), steel, 0, bh * 0.46, 0);            // shackle bow
        for (const sx of [-1, 1]) {
            add(new THREE.CylinderGeometry(st, st, bh * 0.52, 6), steel, sx * sr, bh * 0.20, 0); // shackle legs
        }
        // invisible tap target: slightly smaller than visual lock body to prevent accidental hits
        const hit = new THREE.Mesh(
            new THREE.BoxGeometry(bw * 0.90, bh * 0.90, bd * 0.90),
            new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
        );
        hit.userData.kind = 'lock';
        grp.add(hit);
        return { group: grp, mats: [brass, steel, dark], parts, hit };
    }

    // Closed loop that a chain band follows: a squircle (rounded rectangle) lying in one of
    // the chest's planes, so the strap drapes over the flat faces and rounds the corners.
    // axis 'x' -> loop in the y/z plane at x = off; axis 'y' -> loop in the x/z plane.
    function bandCurve(axis, off, a, b, p) {
        const pts = [];
        const N = 48;
        for (let i = 0; i < N; i++) {
            const t = (i / N) * Math.PI * 2;
            const c = Math.cos(t), s = Math.sin(t);
            const u = Math.sign(c) * Math.pow(Math.abs(c), p) * a;
            const v = Math.sign(s) * Math.pow(Math.abs(s), p) * b;
            pts.push(axis === 'x' ? new V3(off, v, u) : new V3(u, off, v));
        }
        return new THREE.CatmullRomCurve3(pts, true, 'catmullrom', 0.15);
    }

    // One chain link: a low-poly round-ish rectangle with a rectangular hole punched through
    // it. Both contours are chamfered octagons (8 segments, so it stays chunky and faceted),
    // stitched into two flat plates plus an outer and an inner wall. Built in the XY plane
    // with the long axis along X and thickness along Z, so buildChainBand can drop it
    // straight onto the chain's tangent frame. Non-indexed, so it flat-shades for free.
    function makeLinkGeometry(len, wid, thick, bar) {
        const a = len * 0.5, b = wid * 0.5, t = thick * 0.5;
        const c = Math.min(a, b) * 0.42; // corner chamfer — the "round-ish" part
        const ai = Math.max(a - bar, a * 0.25);
        const bi = Math.max(b - bar, b * 0.25);
        const ci = Math.min(ai, bi) * 0.42;
        // counter-clockwise seen from +Z, so the plate windings below come out front-facing
        const ring = (rx, ry, rc) => [
            [rx - rc, -ry], [rx, -(ry - rc)], [rx, ry - rc], [rx - rc, ry],
            [-(rx - rc), ry], [-rx, ry - rc], [-rx, -(ry - rc)], [-(rx - rc), -ry],
        ];
        const O = ring(a, b, c), I = ring(ai, bi, ci);
        const pos = [];
        const v = (p, z) => pos.push(p[0], p[1], z);
        for (let i = 0; i < 8; i++) {
            const j = (i + 1) % 8;
            // front plate (+z) and back plate (-z)
            v(O[i], t); v(O[j], t); v(I[j], t);
            v(O[i], t); v(I[j], t); v(I[i], t);
            v(O[i], -t); v(I[j], -t); v(O[j], -t);
            v(O[i], -t); v(I[i], -t); v(I[j], -t);
            // outer wall (faces out) and hole wall (faces in)
            v(O[i], t); v(O[i], -t); v(O[j], -t);
            v(O[i], t); v(O[j], -t); v(O[j], t);
            v(I[i], t); v(I[j], -t); v(I[i], -t);
            v(I[i], t); v(I[j], t); v(I[j], -t);
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        geo.computeVertexNormals();
        return geo;
    }

    // Lay links along a band curve, each link's long axis following the chain direction and
    // every other link rotated 90° about it, so they read as interlocking. One InstancedMesh
    // per band keeps the whole strap at a single draw call.
    function buildChainBand(curve, dims, mat) {
        const count = Math.max(10, Math.round(curve.getLength() / (dims.len * 0.58)));
        const mesh = new THREE.InstancedMesh(
            makeLinkGeometry(dims.len, dims.wid, dims.thick, dims.bar), mat, count);
        mesh.frustumCulled = false;
        const links = [];
        const m = new THREE.Matrix4();
        const basis = new THREE.Matrix4();
        const T = new V3(), N = new V3(), B = new V3();
        const up = new V3(0, 1, 0), side = new V3(1, 0, 0), one = new V3(1, 1, 1);
        const q = new THREE.Quaternion(), tw = new THREE.Quaternion();
        for (let i = 0; i < count; i++) {
            const u = i / count;
            const p = curve.getPointAt(u);
            curve.getTangentAt(u, T).normalize();
            N.copy(Math.abs(T.dot(up)) > 0.92 ? side : up);
            B.crossVectors(T, N).normalize();
            N.crossVectors(B, T).normalize();
            basis.makeBasis(T, N, B); // ring plane spans T and N; its axis is B
            q.setFromRotationMatrix(basis);
            if (i % 2) { tw.setFromAxisAngle(T, Math.PI / 2); q.premultiply(tw); }
            links.push({ p: p.clone(), q: q.clone(), vel: new V3(), axis: new V3(), rate: 0 });
            m.compose(p, q, one);
            mesh.setMatrixAt(i, m);
        }
        mesh.instanceMatrix.needsUpdate = true;
        return { mesh, links, mat, flying: false };
    }

    function buildGemRig(bx, by, bz) {
        const s = Math.min(bx, bz) * 0.52;
        const linkLen = Math.min(bx, bz) * 0.30;
        const dims = {
            len: linkLen,               // along the chain
            wid: linkLen * 0.60,        // across it
            thick: linkLen * 0.15,      // flat stock
            bar: linkLen * 0.60 * 0.28, // width of the metal around the hole
        };
        const off = dims.wid * 0.55;       // the vertical straps hug the timber
        const offH = off + dims.wid * 1.1; // girth bands ride over them where they cross
        // Two padlocks, each pinning one vertical strap and one girth band at their crossing.
        // Offset in x AND y so the two crossings (and the two hit targets) never overlap.
        const spots = [
            { x: -bx * 0.42, y: by * 0.28 },
            { x: bx * 0.42, y: -by * 0.28 },
        ];
        for (const spot of spots) {
            // one material per padlock: its chains fade out on their own when it breaks
            const steel = new THREE.MeshStandardMaterial({
                color: 0x8f979f, roughness: 0.32, metalness: 0.93, flatShading: true,
                emissive: 0xffffff, emissiveIntensity: 0,
                // transparent up front so the fade-out on break needs no shader recompile
                transparent: true, opacity: 1,
            });
            chainMats.push(steel);
            const pad = buildPadlock(s);
            pad.group.position.set(spot.x, spot.y, bz + offH + s * 0.12); // clamped over the chains
            cubeGroup.add(pad.group);
            const rig = {
                group: pad.group, mats: pad.mats, parts: pad.parts, hit: pad.hit,
                hits: 0, shake: 0, home: pad.group.position.clone(), bands: [],
            };
            pad.hit.userData.lock = rig;
            lockRigs.push(rig);
            const paths = [
                bandCurve('x', spot.x, bz + off, by + off, 0.62),   // vertical strap
                bandCurve('y', spot.y, bx + offH, bz + offH, 0.62), // horizontal girth band
            ];
            for (const path of paths) {
                const band = buildChainBand(path, dims, steel);
                band.lock = rig;
                rig.bands.push(band);
                chainBands.push(band);
                cubeGroup.add(band.mesh);
            }
        }
        chainGlow = 0;
        applyChainGlow();
        setGemRigVisible(false); // snaps on once the chest finishes assembling
    }

    // Hidden during the fly-in intro so the locks and chains don't hang in mid-air while the
    // timber is still assembling itself around them.
    function setGemRigVisible(v) {
        for (const rig of lockRigs) rig.group.visible = v;
        for (const b of chainBands) if (!b.flying) b.mesh.visible = v;
    }

    function disposeGemRig() {
        for (const rig of lockRigs) {
            if (rig.group.parent) rig.group.parent.remove(rig.group);
            const geos = new Set();
            rig.group.traverse((o) => { if (o.geometry) geos.add(o.geometry); });
            for (const g of geos) g.dispose();
            for (const m of rig.mats) m.dispose();
            if (rig.hit.material) rig.hit.material.dispose();
        }
        lockRigs = [];
        for (const b of chainBands) {
            if (b.mesh.parent) b.mesh.parent.remove(b.mesh);
            b.mesh.geometry.dispose();
        }
        for (const m of chainMats) m.dispose();
        chainBands = []; chainMats = []; chainFlights = [];
    }

    // ---------- stone pillar: hollow metal bands ----------
    // Real 3D rings parented to cubeGroup (so they turn with the pillar), not fracture chunks.
    // Metal doesn't shatter into pieces: a band just buckles under BAND_HP blows and then the
    // whole plate tears off in one piece — see bandStrike() / breakBand().
    const BAND_HP = 3;
    function buildBands(count) {
        const R = Math.max(shape.bound.x, shape.bound.z);
        const ring = R * 1.06;         // ring centre-line radius, hugging the stone
        const tube = R * 0.09;         // metal stock thickness
        const n = Math.max(1, count | 0);
        for (let i = 0; i < n; i++) {
            // Space the two Level 2 pillar bands a little farther apart without changing their size.
            const y = shape.bound.y * (n === 1 ? 0 : -0.58 + (1.16 * i) / (n - 1));
            const mat = new THREE.MeshStandardMaterial({
                color: 0x9aa3ad, roughness: 0.30, metalness: 0.95, flatShading: true,
                emissive: 0xffd9a0, emissiveIntensity: 0,
            });
            // low-poly torus: a chunky, faceted hoop that reads as a hollow band
            const mesh = new THREE.Mesh(new THREE.TorusGeometry(ring, tube, 6, 26), mat);
            mesh.rotation.x = Math.PI / 2; // lie flat, wrapping the upright pillar
            mesh.position.y = y;
            cubeGroup.add(mesh);
            // invisible tap target: an open cylinder over the band's girth. Kept a shade
            // tighter than the visible hoop so a near-miss on the stone still hits stone.
            const hit = new THREE.Mesh(
                new THREE.CylinderGeometry(ring + tube * 0.7, ring + tube * 0.7, tube * 3.0, 18, 1, true),
                new THREE.MeshBasicMaterial({
                    transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide,
                })
            );
            hit.position.y = y;
            hit.userData.kind = 'band';
            cubeGroup.add(hit);
            const rig = { mesh, mat, hit, hits: 0, shake: 0, y, home: mesh.position.clone() };
            hit.userData.band = rig;
            bandRigs.push(rig);
        }
        setBandsVisible(false); // snap on once the pillar finishes assembling
    }

    function setBandsVisible(v) {
        for (const rig of bandRigs) rig.mesh.visible = v;
    }

    function disposeBands() {
        for (const rig of bandRigs) {
            if (rig.mesh.parent) rig.mesh.parent.remove(rig.mesh);
            rig.mesh.geometry.dispose();
            rig.mat.dispose();
            if (rig.hit.parent) rig.hit.parent.remove(rig.hit);
            rig.hit.geometry.dispose();
            rig.hit.material.dispose();
        }
        bandRigs = [];
    }

    // ---------- sandstone pyramid: metal blocks buried in the stone ----------
    // Solid metal cubes sealed inside the pyramid, stacked up its axis and offset around it so
    // they sit in different pockets of stone. They're sized and placed so every corner stays
    // inside the solid, which means the stone occludes them until you dig one out — only then
    // can the hammer reach it. The rigs go into `bandRigs`, so they behave exactly like the
    // pillar's metal bands: BAND_HP blows, then the whole block shears off in one piece.
    // Work out where the metal cubes will sit (and how big they end up) WITHOUT building
    // anything yet, so the gem sampler can steer clear of them. Same math as before.
    function planBlocks(count) {
        const plan = [];
        const w = shape.bound.x, hy = shape.bound.y;
        const n = Math.max(1, count | 0);
        for (let i = 0; i < n; i++) {
            // spread them up the axis; the pyramid narrows with height, so higher blocks shrink
            const single = n === 1; // a lone block sits dead centre and is noticeably bigger
            const fy = single ? -0.1 : -0.55 + (0.9 * i) / (n - 1);
            const y = hy * fy;
            const halfW = w * (hy - y) / (2 * hy); // pyramid half-width at this height
            let s = halfW * (single ? 0.72 : 0.408);
            const a = (i / n) * Math.PI * 2 + 0.6;
            let x = 0, z = 0;
            if (single) {
                // centred on the pyramid's axis: shrink until all eight corners are inside
                for (let guard = 0; guard < 32; guard++) {
                    let ok = true;
                    for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
                        if (!shape.contains(new V3(sx * s, y + sy * s, sz * s))) ok = false;
                    }
                    if (ok) break;
                    s *= 0.92;
                }
                plan.push({ x: 0, y, z: 0, s, clear: 1.45 });
                continue;
            }
            // shrink until all eight corners are safely inside the stone
            for (let guard = 0; guard < 24; guard++) {
                const r = Math.max(0, halfW - s * 1.9) * 0.55;
                x = Math.cos(a) * r; z = Math.sin(a) * r;
                let ok = true;
                for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
                    if (!shape.contains(new V3(x + sx * s, y + sy * s, z + sz * s))) { ok = false; }
                }
                if (ok) break;
                s *= 0.86;
            }
            plan.push({ x, y, z, s, clear: 1.45 });
        }
        return plan;
    }

    // Metal cubes embedded in a rounded solid (the molten core). They're spread evenly around
    // the body on a Fibonacci lattice so no two share a pocket of rock, and the first `jut` of
    // them are pushed out until they protrude a little past the surface — a cube's reach along
    // its placement direction is s*(|dx|+|dy|+|dz|), so solving for that puts the same sliver
    // of metal outside whatever angle it sits at. The rest are sealed in with all eight corners
    // inside, so the rock hides them until you dig one out.
    function planEmbeddedBlocks(count, jut) {
        const plan = [];
        const n = Math.max(1, count | 0);
        const nJut = Math.max(0, Math.min(jut | 0, n));
        const R = Math.min(shape.bound.x, shape.bound.y, shape.bound.z);
        const GOLD = Math.PI * (3 - Math.sqrt(5));
        const q = new THREE.Quaternion();
        const e = new THREE.Euler();
        const ax = new V3(), ay = new V3(), az = new V3();
        for (let i = 0; i < n; i++) {
            const yy = 1 - (2 * (i + 0.5)) / n;
            const rr = Math.sqrt(Math.max(0, 1 - yy * yy));
            const a = i * GOLD + 0.7;
            const dir = new V3(Math.cos(a) * rr, yy, Math.sin(a) * rr);
            if (dir.lengthSq() < 1e-6) dir.set(0, 1, 0);
            dir.normalize();
            // a slight cocked angle per cube, so they read as shoved into the rock
            // rather than neatly stacked
            const rot = {
                x: (Math.random() - 0.5) * 0.52,
                y: (Math.random() - 0.5) * 0.52,
                z: (Math.random() - 0.5) * 0.52,
            };
            q.setFromEuler(e.set(rot.x, rot.y, rot.z));
            ax.set(1, 0, 0).applyQuaternion(q);
            ay.set(0, 1, 0).applyQuaternion(q);
            az.set(0, 0, 1).applyQuaternion(q);
            // support of the tilted cube along `dir`, in units of its half-size
            const sup = Math.abs(dir.dot(ax)) + Math.abs(dir.dot(ay)) + Math.abs(dir.dot(az));
            const sticksOut = i < nJut;
            let s = R * 0.1955;
            const p = new V3();
            const corner = new V3();
            for (let guard = 0; guard < 24; guard++) {
                // jutting: reach out to R + 1.45s, so most of the cube breaks the surface
                const d = sticksOut
                    ? Math.max(0, R + s * 1.45 - s * sup)
                    : Math.max(0, R - s * 2.1);
                p.copy(dir).multiplyScalar(d);
                if (sticksOut) break;
                let ok = true;
                for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
                    corner.copy(p)
                        .addScaledVector(ax, sx * s)
                        .addScaledVector(ay, sy * s)
                        .addScaledVector(az, sz * s);
                    if (!shape.contains(corner)) ok = false;
                }
                if (ok) break;
                s *= 0.88;
            }
            plan.push({ x: p.x, y: p.y, z: p.z, s, rot });
        }
        return plan;
    }

    function planGreatCubeBlocks() {
        const h = shape.bound.x;
        const s = h * 0.23;
        const face = h - s * 0.20;
        return [
            { x: 0, y: 0, z: 0, s, clear: 2.6 },
            { x: face, y: 0, z: 0, s: s * 0.62, clear: 2.0 },
            { x: -face, y: 0, z: 0, s: s * 0.62, clear: 2.0 },
            { x: 0, y: face, z: 0, s: s * 0.62, clear: 2.0 },
            { x: 0, y: -face, z: 0, s: s * 0.62, clear: 2.0 },
            { x: 0, y: 0, z: face, s: s * 0.62, clear: 2.0 },
            { x: 0, y: 0, z: -face, s: s * 0.62, clear: 2.0 },
        ];
    }

    function buildBlocks(plan) {
        for (const b of plan) {
            const s = b.s;
            const mat = new THREE.MeshStandardMaterial({
                color: 0x9aa3ad, roughness: 0.30, metalness: 0.95, flatShading: true,
                emissive: 0xffd9a0, emissiveIntensity: 0,
            });
            const mesh = new THREE.Mesh(new THREE.BoxGeometry(s * 2, s * 2, s * 2), mat);
            mesh.position.set(b.x, b.y, b.z);
            // the pyramid's cubes stay axis-aligned; the magma core's are cocked
            // at a slight angle (see planEmbeddedBlocks)
            if (b.rot) mesh.rotation.set(b.rot.x, b.rot.y, b.rot.z);
            cubeGroup.add(mesh);
            // invisible tap target sitting over the block — slightly smaller than visual block
            const hit = new THREE.Mesh(
                new THREE.BoxGeometry(s * 1.85, s * 1.85, s * 1.85),
                new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
            );
            hit.position.copy(mesh.position);
            hit.quaternion.copy(mesh.quaternion);
            hit.userData.kind = 'band';
            cubeGroup.add(hit);
            const rig = {
                mesh, mat, hit, hits: 0, shake: 0, block: true,
                y: b.y, home: mesh.position.clone(),
            };
            hit.userData.band = rig;
            bandRigs.push(rig);
        }
        setBandsVisible(false); // snap on once the pyramid finishes assembling
    }

    // ---------- ice heart: two long metal rods crossed and stabbed through it ----------
    // Real 3D spikes parented to cubeGroup, not fracture chunks. They cross just above the
    // heart's middle and their tapered tips jut out of the ice on both sides, so the ice
    // hides the buried shaft and only the exposed tips can be reached by the hammer. Each
    // rod rides the same rig pipeline as the pillar's bands: metal never shatters, it just
    // buckles for BAND_HP blows and then shears off in one whole piece.
    function buildRods(count) {
        const b = shape.bound;
        const r = Math.min(b.x, b.z) * 0.135; // steel rod radius
        const n = Math.max(1, Math.min(count | 0, 2));

        // Rod 0: vertical spike (upright along Y)
        // Rod 1: horizontal spike (across X), crossing at the heart's upper core
        const rodConfigs = [
            {
                length: b.y * 2.05,
                pos: new V3(0, -0.05 * b.y, r * 1.05),
                rot: new THREE.Euler(0.04, 0, 0),
            },
            {
                length: b.x * 2.80,
                pos: new V3(0, 0.08 * b.y, -r * 1.05),
                rot: new THREE.Euler(-0.04, 0, Math.PI / 2),
            },
        ];

        for (let i = 0; i < n; i++) {
            const cfg = rodConfigs[i % rodConfigs.length];
            const L = cfg.length;
            const mat = new THREE.MeshStandardMaterial({
                color: 0x9aa3ad, roughness: 0.30, metalness: 0.95, flatShading: true,
                emissive: 0xffd9a0, emissiveIntensity: 0,
            });
            const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, L, 8), mat);
            mesh.position.copy(cfg.pos);
            mesh.quaternion.setFromEuler(cfg.rot);
            cubeGroup.add(mesh);

            // invisible tap target sleeved over the rod — slightly smaller than visual rod
            const hit = new THREE.Mesh(
                new THREE.CylinderGeometry(r * 0.88, r * 0.88, L, 10, 1, true),
                new THREE.MeshBasicMaterial({
                    transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide,
                })
            );
            hit.position.copy(mesh.position);
            hit.quaternion.copy(mesh.quaternion);
            hit.userData.kind = 'band';
            cubeGroup.add(hit);

            const rig = {
                mesh, mat, hit, hits: 0, shake: 0, rod: true,
                y: mesh.position.y, home: mesh.position.clone(),
                axis: new V3(0, 1, 0).applyQuaternion(mesh.quaternion).normalize(),
                halfLen: L * 0.5,
            };
            hit.userData.band = rig;
            bandRigs.push(rig);
        }
        setBandsVisible(false); // snap on once the heart finishes assembling
    }

    // Distance from a point to a rod's axis segment (a rod is long, so measuring from its
    // centre would let a blast at one tip shear the whole thing off).
    const _rodP = new V3();
    function rodDist(p, rig) {
        const t = Math.max(-rig.halfLen, Math.min(rig.halfLen, _rodP.copy(p).sub(rig.home).dot(rig.axis)));
        return p.distanceTo(_rodP.copy(rig.home).addScaledVector(rig.axis, t));
    }

    // ---------- clockwork sphere: large top & bottom drive gears ----------
    // Heavy metal clockwork gears attached to both poles of the orb. They tick forward
    // with a bouncy rotation every 1s in opposite directions, and buckle under BAND_HP
    // blows before tearing off in one piece.
    function buildPoleGears() {
        const R = shape.bound.x * 0.90; // ~15% larger
        const T = R * 0.20;
        const teeth = 14;
        const geo = makeGearGeometry(R, T, teeth, METALS[0], 0.84); // stubbier teeth
        const poles = [
            { y: -shape.bound.y * 1.10, dir: 1 },  // bottom gear
            { y: shape.bound.y * 1.10, dir: -1 },  // top gear (opposing rotation)
        ];
        for (const p of poles) {
            const mat = new THREE.MeshStandardMaterial({
                color: 0xcaa258, roughness: 0.30, metalness: 0.93, flatShading: true,
                emissive: 0xffd9a0, emissiveIntensity: 0,
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(0, p.y, 0);
            cubeGroup.add(mesh);

            // invisible tap target sleeved over the gear — slightly smaller than visual radius
            const hit = new THREE.Mesh(
                new THREE.CylinderGeometry(R * 0.88, R * 0.88, T * 1.2, 16, 1, false),
                new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
            );
            hit.position.set(0, p.y, 0);
            hit.userData.kind = 'band';
            cubeGroup.add(hit);

            const rig = {
                mesh, mat, hit, hits: 0, shake: 0, gear: true,
                y: p.y, home: mesh.position.clone(),
                fromAngle: 0, targetAngle: 0, tickTimer: 0,
                stepAngle: ((Math.PI * 2) / teeth) * p.dir,
            };
            hit.userData.band = rig;
            bandRigs.push(rig);
        }
        setBandsVisible(false); // snap on once the sphere finishes assembling
    }

    // A blow that landed on a metal band. It rings, the hoop shudders on the stone and dents a
    // shade darker; nothing around it breaks. Once it has taken BAND_HP hits it tears off whole.
    function bandStrike(rig) {
        const hitWorld = cubeGroup.localToWorld(swing.hitLocal.clone());
        rig.hits++;
        rig.shake = 1;
        if (rig.gear) {
            CubeCrackerAudio.gearClank();
        } else {
            CubeCrackerAudio.metalThud();
        }
        if (window.hapticsEnabled !== false && navigator.vibrate) {
            try { navigator.vibrate(22); } catch (e) { }
        }
        shake = (window.screenShakeEnabled !== false) ? 0.20 * MOTION : 0; if (window.hapticsEnabled !== false && navigator.vibrate) { try { navigator.vibrate(14); } catch (e) { } }
        kick = 0.09 * MOTION;
        wobbleAmp = 0.028 * MOTION;
        wobbleTime = 0;
        spawnShockwave(hitWorld, swing.n);
        flash(hitWorld);
        spawnImpactSparks(hitWorld, 16);
        const k = Math.min(rig.hits / BAND_HP, 1); // battered metal darkens
        rig.mat.color.setRGB(0.60 - k * 0.20, 0.64 - k * 0.22, 0.68 - k * 0.24);
        if (rig.hits >= BAND_HP) {
            spawnJuiceText(rig.rod ? 'ROD SNAPS!!!' : rig.gear ? 'GEAR SHATTERS!!!' : rig.block ? 'METAL BREAKS!!!' : 'BAND BREAKS!!!',
                hitWorld, '#dbe7ff', '44px');
            breakBand(rig, hitWorld);
        } else {
            spawnJuiceText('CLANG!', hitWorld, '#dbe7ff');
        }
        // The metal soaks the blow up, but the hammer head still bites into whatever
        // dirt/rock sits around it. Pick the nearest surviving chunk as the notional
        // point of contact, then run this level's normal break rules at a slightly
        // reduced radius so a metal hit is still worse than a clean one.
        const MR = cfg.hitRadius * 0.85;
        let near = null, nd = Infinity;
        for (const c of chunks) {
            if (!c.alive) continue;
            const d = c.centroid.distanceTo(swing.hitLocal);
            if (d < nd) { nd = d; near = c; }
        }
        if (near && nd < MR * 2.0) {
            swing.hitChunk = near;
            spawnDust(hitWorld, swing.n);
            spawnCubeDust(hitWorld, swing.n);
            applyMaterialDamage(hitWorld, MR);
        }
        setHint('metalHint');
    }

    // The band comes off in one piece: the whole hoop is handed to the debris pool with its own
    // fading material, so it tumbles away intact instead of breaking into chunks.
    function breakBand(rig, hitWorld) {
        const i = bandRigs.indexOf(rig);
        if (i !== -1) bandRigs.splice(i, 1);
        cubeGroup.updateMatrixWorld(true);
        const wp = new V3(), wq = new THREE.Quaternion();
        rig.mesh.getWorldPosition(wp);
        rig.mesh.getWorldQuaternion(wq);
        cubeGroup.remove(rig.mesh);
        rig.mesh.position.copy(wp);
        rig.mesh.quaternion.copy(wq);
        rig.mat.transparent = true;
        rig.mat.emissiveIntensity = 0;
        debrisGroup.add(rig.mesh);

        if (rig.hit.parent) rig.hit.parent.remove(rig.hit);
        rig.hit.geometry.dispose();
        rig.hit.material.dispose();

        const dir = hitWorld ? hitWorld.clone().sub(wp) : new V3(0, 1, 0);
        if (dir.lengthSq() < 1e-4) dir.set(0, 1, 0);
        dir.normalize().negate(); // shears off away from the hammer
        const vel = dir.multiplyScalar(1.6 + Math.random() * 1.2);
        vel.y += 1.3 + Math.random() * 0.7;
        debris.push({
            mesh: rig.mesh, vel,
            ang: new V3((Math.random() - 0.5) * 7, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 7),
            life: 0, maxLife: 1.6 + Math.random() * 0.5, own: true,
        });

        CubeCrackerAudio.shatter();
        CubeCrackerAudio.chime(1);
        if (window.hapticsEnabled !== false && navigator.vibrate) {
            try { navigator.vibrate([30, 24, 70]); } catch (e) { }
        }
        shake = (window.screenShakeEnabled !== false) ? 0.34 * MOTION : 0; if (window.hapticsEnabled !== false && navigator.vibrate) { try { navigator.vibrate(14); } catch (e) { } }
        kick = 0.18 * MOTION;
        spawnImpactSparks(wp, 24);
        dirty = true;
    }

    // Blocked strikes light the iron up: every link of one padlock shares that padlock's
    // material, so a single emissive ramp per material flares the whole rig at once.
    function applyChainGlow() {
        const e = Math.max(0, Math.min(1, chainGlow));
        for (const m of chainMats) m.emissiveIntensity = e * e * 3.0 + e * 0.4;
        dirty = true;
    }

    const _chainM = new THREE.Matrix4();
    const _chainQ = new THREE.Quaternion();
    const _chainOne = new V3(1, 1, 1);
    // Each padlock's chains fly on their own timer and fade with their own material, so a
    // flight started by the first lock can't fade the second lock's chains along with it.
    function updateChainFly(dt) {
        for (let i = chainFlights.length - 1; i >= 0; i--) {
            const fl = chainFlights[i];
            fl.life += dt;
            const k = Math.min(fl.life / 1.6, 1);
            for (const b of fl.bands) {
                for (let j = 0; j < b.links.length; j++) {
                    const l = b.links[j];
                    l.vel.y -= cfg.debrisGravity * dt;
                    l.p.addScaledVector(l.vel, dt);
                    _chainQ.setFromAxisAngle(l.axis, l.rate * dt);
                    l.q.premultiply(_chainQ);
                    _chainM.compose(l.p, l.q, _chainOne);
                    b.mesh.setMatrixAt(j, _chainM);
                }
                b.mesh.instanceMatrix.needsUpdate = true;
            }
            fl.mat.opacity = 1 - k * k;
            if (k >= 1) {
                for (const b of fl.bands) {
                    if (b.mesh.parent) b.mesh.parent.remove(b.mesh);
                    b.mesh.geometry.dispose();
                    const bi = chainBands.indexOf(b);
                    if (bi !== -1) chainBands.splice(bi, 1);
                }
                const mi = chainMats.indexOf(fl.mat);
                if (mi !== -1) chainMats.splice(mi, 1);
                fl.mat.dispose();
                chainFlights.splice(i, 1);
            }
        }
        dirty = true;
    }

    function build() {
        disposeAll();
        zoomFactor = 1.0;
        starFlash = 0;
        starLight = 1;
        starOutlineLight = 1;
        starWasDark = false;
        starOutlineActive = false;
        fxUniforms.uFlash.value = 0;
        fxUniforms.uDim.value = 1; // shared: every other level stays fully lit
        if (starGlowEl) starGlowEl.style.opacity = '0';
        strikes = 0; collectedCount = 0; gameOver = false; revealedOnce = false; window.strikes = strikes; window.level = level; window.LEVELS = LEVELS;
        updateLevelStrikeCounter();
        idleHint = 0; ghostPhase = 0;
        if (typeof ghostHammer !== 'undefined') hideGhostHammer();
        ringFound = false; ringFx = null;
        const ringBadge = document.getElementById('ring-badge');
        if (ringBadge) ringBadge.classList.remove('found');
        const winRingEl = document.getElementById('winRing');
        if (winRingEl) winRingEl.textContent = '';
        window.currentRank = null; // rated at the moment the third gem lands
        if (window.paintWinRank) window.paintWinRank();
        if (level === 0) {
            window.hitsPerLevel = Array(13).fill(null);
            if (interacted) {
                bus('audio:play', { sfx: 'startOverJingle' });
            }
        }
        const visibleGemCount = (LEVELS[level] && LEVELS[level].gemCount) || 3;
        hud.slotWraps.forEach((wrap, idx) => {
            wrap.style.display = idx < visibleGemCount ? '' : 'none';
        });
        hud.slots.forEach((s) => {
            s.classList.remove('lit');
            s.classList.remove('victory-bounce');
        });
        hud.overlay.classList.remove('show');
        document.body.classList.remove('has-overlay');
        // Reset card visibility
        const winCard = document.getElementById('winCard');
        if (winCard) winCard.style.display = 'flex';
        const endCard = document.getElementById('endCard');
        if (endCard) endCard.style.display = 'none';

        const lvl = LEVELS[level];
        if (lvl.bg) {
            document.body.style.background = lvl.bg;
        }

        // Show "NEW TOOL!" above whichever tool this level unlocks:
        // level 2 (index 1) -> resonance lens, level 3 (index 2) -> explosive charge.
        // Lasts 5 seconds or until the player clicks the new tool button.
        if (unlockTipTimer) { clearTimeout(unlockTipTimer); unlockTipTimer = null; }
        if (newToolTip) newToolTip.classList.remove('show');
        if (newToolTipBomb) newToolTipBomb.classList.remove('show');

        const unlockTip = level === 1 ? newToolTip : (level === 2 ? newToolTipBomb : null);
        if (unlockTip) {
            unlockTipTimer = setTimeout(() => {
                unlockTip.classList.add('show');
                unlockTipTimer = setTimeout(() => {
                    unlockTip.classList.remove('show');
                    unlockTipTimer = null;
                }, 5000);
            }, 1000);
        }
        shape = CubeCrackerFracture.shapes[lvl.shape](HALF * (lvl.sizeMul || 1));
        // Plan the buried metal cubes up front (they're built later) so the gem sampler
        // below can refuse any spot occupied by one.
        blockPlan = !lvl.blocks ? []
            : lvl.blockLayout === 'embedded' ? planEmbeddedBlocks(lvl.blocks, lvl.blocksJut)
                : lvl.blockLayout === 'greatCube' ? planGreatCubeBlocks()
                    : planBlocks(lvl.blocks);
        material = lvl.break || 'rock';
        iceTaught = false;
        obsidianTaught = false;
        petrifiedTaught = false;
        moltenTaught = false;
        setRockFinish(
            lvl.rough != null ? lvl.rough : 0.93,
            lvl.metal != null ? lvl.metal : 0.02
        );
        // retune the shader FX for this level's rock (shared uniform objects)
        fxUniforms.uRimColor.value.setHex(rimFor(lvl));
        fxUniforms.uGlowColor.value.setHex(glowFor(lvl));
        fxUniforms.uRimStrength.value = material === 'egg' ? 0.95
            : material === 'star' ? 1.12
                : material === 'ice' ? 0.90 : material === 'obsidian' ? 1.06
                    : material === 'molten' ? 1.15 : material === 'clockwork' ? 0.86
                        : material === 'petrified' ? 0.78 : material === 'hive' ? 0.82
                            : material === 'reliquary' ? 0.92 : 0.68;

        // pull the camera back for bigger solids so they still fill the frame
        camBase.copy(CAM_HOME).multiplyScalar((lvl.cam || 1) * 1.06);
        camera.position.copy(camBase);
        camera.lookAt(CAM_LOOK);

        // scale chunk count with volume so chunk size stays constant (more to dig)
        const chunkCount = Math.round(cfg.chunkCount * (lvl.chunkMul || 1));
        // Size the blast so it always clears roughly the same *number* of chunks
        // (~34), whatever the solid's size or chunk density.
        bombUsed = false;
        bombRadius = Math.cbrt((3 * 34 * shape.volume) / (2 * Math.PI * chunkCount));
        // gear pieces are thin discs, so the volume-based estimate above over-shoots
        // badly on the machinery level — one charge would clear nearly the whole ball.
        if (lvl.build === 'gears') bombRadius *= 0.75;
        // Retry if any gem failed to map to a chunk (a degenerate Voronoi cell yields
        // index -1) — an unmapped gem can never be exposed, making the level unwinnable.
        let tPos, raw, treasureChunkIndex;
        if (lvl.build === 'gears') {
            // machinery level: packed gear pieces, with a dirt clump around each gem.
            // Pull the clumps a little toward the middle of the ball so they sit deeper
            // in the machinery (the shape is convex and contains the origin, so scaling
            // toward the centre can never push a clump outside it).
            tPos = randomTreasurePositions(shape, lvl.gemCount || 3).map((p) => p.multiplyScalar(0.82));
            ({ chunks: raw, treasureChunkIndex } = buildGearCluster(shape, chunkCount, tPos));
        } else if (lvl.build === 'chest') {
            // hollow chest: a one-cell-thick timber shell, slabs partitioning the cavity
            // into compartments, and a gem buried in a clump of dirt in three of them.
            const built = buildHollowChest(shape, chunkCount, Math.random, lvl.colors);
            raw = built.chunks;
            treasureChunkIndex = built.treasureChunkIndex;
            tPos = built.positions;
        } else {
            const fixedGemPositions = treasureLayoutPositions(lvl, shape);
            // the fossilized trunk breaks into flat bark plates, not isotropic rubble
            const fracOpts = lvl.break === 'petrified'
                ? { seeds: barkSeeds(shape, chunkCount), neighbors: 120 }
                : null;
            for (let attempt = 0; attempt < 8; attempt++) {
                tPos = fixedGemPositions
                    ? fixedGemPositions.map((p) => p.clone())
                    : randomTreasurePositions(shape, lvl.gemCount || 3);
                ({ chunks: raw, treasureChunkIndex } =
                    CubeCrackerFracture.generate(shape, chunkCount, tPos, Math.random, lvl.colors, fracOpts));
                if (treasureChunkIndex.every((i) => i >= 0)) break;
            }
        }
        // Concatenate every chunk into one buffer. The fracture step emits each chunk
        // centroid-relative, so shift by the centroid on the way in to get positions
        // in the solid's own space — chunks then need no per-piece transform, which is
        // what lets them share a single mesh.
        let vTotal = 0;
        for (const r of raw) vTotal += r.geometry.attributes.position.count;
        const mPos = new Float32Array(vTotal * 3);
        const mCol = new Float32Array(vTotal * 3);
        const mNor = new Float32Array(vTotal * 3);
        const mDmg = new Float32Array(vTotal); // per-vertex frost strength, drives the crack glow
        let vOff = 0;
        for (const r of raw) {
            const gp = r.geometry.attributes.position.array;
            const gc = r.geometry.attributes.color.array;
            const gn = r.geometry.attributes.normal.array;
            const n = r.geometry.attributes.position.count;
            // debris inherits the frost/crack glow when this chunk detaches
            r.geometry.setAttribute('aDamage', new THREE.BufferAttribute(new Float32Array(n), 1));
            for (let i = 0; i < n; i++) {
                const s = i * 3, d = (vOff + i) * 3;
                mPos[d] = gp[s] + r.centroid.x;
                mPos[d + 1] = gp[s + 1] + r.centroid.y;
                mPos[d + 2] = gp[s + 2] + r.centroid.z;
                mCol[d] = gc[s]; mCol[d + 1] = gc[s + 1]; mCol[d + 2] = gc[s + 2];
                mNor[d] = gn[s]; mNor[d + 1] = gn[s + 1]; mNor[d + 2] = gn[s + 2];
            }

            // Calculate a separation direction for the fly-in intro
            const dir = r.centroid.clone();
            if (dir.lengthSq() < 0.001) {
                dir.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
            }
            dir.normalize();

            chunks.push({
                geometry: r.geometry, // kept unused until this chunk becomes debris
                centroid: r.centroid,
                kind: r.kind, // chest only: 'wall' | 'slab' | 'dirt'
                separationDir: dir,
                alive: true,
                scorch: 0,
                damaged: false,
                vStart: vOff,
                vCount: n,
                introDelay: 0,
            });
            vOff += n;
        }

        // Obsidian: the glassy outer layers are tough (craze first, splinter second) while
        // the crystal core is brittle. Tag each chunk by depth so impact() can tell them
        // apart — breaking through the shell is what makes the core burst feel earned.
        // Also paint the nodule per vertex so a fresh break reads like a real geode:
        // a pitted, near-black volcanic crust on the outside, a bright band of crystal
        // lining just beneath it, then banded amethyst toward the middle, with occasional
        // druzy specks catching the light on individual facets.
        if (material === 'obsidian') {
            const b = shape.bound;
            const R = Math.min(b.x, b.y, b.z);
            const shellR = R * 0.62;
            for (const c of chunks) {
                c.shell = c.centroid.length() > shellR;
                const end = (c.vStart + c.vCount) * 3;
                for (let f = c.vStart * 3; f < end; f += 9) { // 9 floats = one facet
                    const facet = 0.84 + Math.random() * 0.38; // glassy facet variation
                    const druzy = Math.random() < 0.15 ? 1.55 : 1.0; // sparkling crystal speck
                    for (let v = f; v < f + 9; v += 3) {
                        const rv = Math.hypot(mPos[v], mPos[v + 1], mPos[v + 2]) / R;
                        let k;
                        if (rv > 0.70) {
                            k = 0.50 + Math.sin(rv * 46.0) * 0.07; // pitted crust
                        } else if (rv > 0.57) {
                            k = 1.48 * druzy; // crystal lining under the crust
                        } else {
                            const t = rv * 7.0;
                            k = ((Math.floor(t) % 2 === 0) ? 1.22 : 0.70) * druzy; // amethyst bands
                        }
                        k *= facet;
                        mCol[v] = Math.min(1, mCol[v] * k);
                        mCol[v + 1] = Math.min(1, mCol[v + 1] * k);
                        mCol[v + 2] = Math.min(1, mCol[v + 2] * k);
                    }
                }
            }
        }

        // Petrified trunk: a fossilized log (the cylinder runs along Y).
        // 1) Gnarl the solid with a coherent function of position — axial bark ridges,
        //    knotty bulges and a fine radial ripple. Because the offset depends only on
        //    the vertex position, vertices shared by neighbouring chunks move identically
        //    and no seams open up. The offset is applied to the merged buffer AND to each
        //    chunk's own geometry, so detached debris matches what was on screen.
        // 2) Paint concentric growth rings from each *vertex's* distance to the trunk
        //    axis (not the chunk centroid), alternating pale/dark bands with a hard dark
        //    line on every boundary, so the rings read clearly across any exposed face.
        //    The outermost band is bark, tagged so petrifiedImpact() cracks it first.
        if (material === 'petrified') {
            const Rt = Math.max(shape.bound.x, shape.bound.z);
            // The plates are thin, so the surface gnarl is dialled back: it still carves
            // bark ridges without smearing a plate across its neighbour's ring band.
            const gnarl = (x, y, z) => {
                const a = Math.atan2(z, x);
                const r = Math.hypot(x, z);
                const outer = Math.min(1, r / Rt); // ridges strongest near the bark
                return ((Math.sin(a * 9.0) * 0.042 + Math.sin(a * 23.0 + 1.7) * 0.018) * outer
                    + Math.sin(y * 5.5 + a * 3.0) * 0.026
                    + Math.sin(y * 17.0 + a * 7.0) * 0.010
                    + Math.sin(r * 24.0) * 0.012) * 0.7;
            };
            for (const c of chunks) {
                const own = c.geometry.attributes.position.array;
                for (let i = 0; i < c.vCount; i++) {
                    const mo = (c.vStart + i) * 3, so = i * 3;
                    const x = mPos[mo], y = mPos[mo + 1], z = mPos[mo + 2];
                    const r = Math.hypot(x, z);
                    if (r < 1e-4) continue; // on the axis: no radial direction
                    const d = gnarl(x, y, z);
                    const ox = (x / r) * d, oz = (z / r) * d;
                    mPos[mo] += ox; mPos[mo + 2] += oz;
                    own[so] += ox; own[so + 2] += oz;
                }
                c.geometry.attributes.position.needsUpdate = true;

                const rc = Math.hypot(c.centroid.x, c.centroid.z) / Rt;
                c.ring = Math.min(TRUNK_SHELLS - 1, Math.floor(trunkShellT(rc)));
                c.bark = c.ring >= TRUNK_SHELLS - 1;
                const end = (c.vStart + c.vCount) * 3;
                for (let f = c.vStart * 3; f < end; f += 9) { // 9 floats = one facet
                    const grit = 0.80 + Math.random() * 0.34; // weathered stone mottling
                    for (let v = f; v < f + 9; v += 3) {
                        let k;
                        if (c.bark) {
                            k = 0.46; // bark: dark, craggy shell
                        } else {
                            const t = trunkShellT(Math.hypot(mPos[v], mPos[v + 2]) / Rt);
                            const frac = t - Math.floor(t);
                            k = (Math.floor(t) % 2 === 0) ? 1.42 : 0.58;
                            if (Math.min(frac, 1 - frac) < 0.13) k *= 0.55; // ring line
                        }
                        k *= grit;
                        mCol[v] = Math.min(1, mCol[v] * k);
                        mCol[v + 1] = Math.min(1, mCol[v + 1] * k);
                        mCol[v + 2] = Math.min(1, mCol[v + 2] * k);
                    }
                }
            }
        }

        // Honeycomb hive: wax comb built up in concentric layers. Tag each chunk with its
        // layer (hiveImpact() tears out one layer at a time), then paint hexagonal cells
        // across every facet — three cosines 60° apart approximate a hex lattice, giving
        // dark wax walls between bright honey-filled cells. Both cosine terms use even
        // multiples of the azimuth, so the pattern closes seamlessly around the dome.
        if (material === 'hive') {
            const Rh = Math.max(shape.bound.x, shape.bound.z);
            const LAYERS = 4;
            for (const c of chunks) {
                const rc = c.centroid.length() / Rh;
                c.layer = Math.min(LAYERS - 1, Math.floor(Math.max(0, rc) * LAYERS));
                const end = (c.vStart + c.vCount) * 3;
                for (let f = c.vStart * 3; f < end; f += 9) { // 9 floats = one facet
                    const facet = 0.88 + Math.random() * 0.26; // uneven, hand-built wax
                    for (let v = f; v < f + 9; v += 3) {
                        const a = Math.atan2(mPos[v + 2], mPos[v]);
                        const w = mPos[v + 1] * 6.0;
                        const hex = Math.cos(a * 8.0)
                            + Math.cos(a * 4.0 + w * 0.866)
                            + Math.cos(a * 4.0 - w * 0.866);
                        let k = hex > 1.55 ? 1.48 : (hex < -0.30 ? 0.44 : 0.94);
                        k *= facet * (1 - c.layer * 0.07); // deeper comb sits in shadow
                        mCol[v] = Math.min(1, mCol[v] * k);
                        mCol[v + 1] = Math.min(1, mCol[v + 1] * k);
                        mCol[v + 2] = Math.min(1, mCol[v + 2] * k);
                    }
                }
            }
        }

        // Dragon egg: overlapping rows of scales across the shell, staggered row to row, with
        // a faint jade shimmer along the ridges. The azimuth term uses an even multiple of the
        // angle so the pattern closes seamlessly around the egg.
        if (material === 'egg') {
            const be = Math.max(shape.bound.y, 1e-4);
            for (const c of chunks) {
                const end = (c.vStart + c.vCount) * 3;
                for (let f = c.vStart * 3; f < end; f += 9) { // 9 floats = one facet
                    const facet = 0.86 + Math.random() * 0.28;
                    for (let v = f; v < f + 9; v += 3) {
                        const a = Math.atan2(mPos[v + 2], mPos[v]);
                        const row = (mPos[v + 1] / be) * 7.0;
                        const band = Math.floor(row);
                        const scl = Math.cos(a * 12.0 + band * 1.7) * 0.55
                            + Math.cos((row - band - 0.5) * Math.PI) * 0.45;
                        let k = scl > 0.42 ? 1.34 : (scl < -0.32 ? 0.54 : 0.94);
                        k *= facet;
                        mCol[v] = Math.min(1, mCol[v] * k);
                        mCol[v + 1] = Math.min(1, mCol[v + 1] * k);
                        mCol[v + 2] = Math.min(1, mCol[v + 2] * k);
                        if (k > 1.20) mDmg[v / 3] = 0.07; // scale ridges catch the light
                    }
                }
            }
        }

        // Fallen star: tag each chunk with the concentric shell it belongs to (starImpact()
        // only ever damages the shell a blow landed on), then paint radial crystal bands with
        // occasional sparkle facets so each freshly exposed shell reads brighter than the one
        // peeled off it. Each chunk also seeds aDamage by depth, which is what leaves the
        // core sitting there glowing on its own once the crust is off.
        if (material === 'star') {
            // the star is flat, so its shells span the tip radius, not the thickness
            const Rst = Math.max(shape.bound.x, shape.bound.y, shape.bound.z);
            for (const c of chunks) {
                const rc = c.centroid.length() / Rst;
                c.layer = Math.min(STAR_LAYERS - 1, Math.floor(Math.max(0, rc) * STAR_LAYERS));
                const heat = 0.03 + (STAR_LAYERS - 1 - c.layer) * 0.07; // the core burns hottest
                const end = (c.vStart + c.vCount) * 3;
                for (let f = c.vStart * 3; f < end; f += 9) { // 9 floats = one facet
                    const facet = 0.86 + Math.random() * 0.30;
                    const spark = Math.random() < 0.12 ? 1.45 : 1.0; // catch-the-light crystal
                    for (let v = f; v < f + 9; v += 3) {
                        const rv = Math.hypot(mPos[v], mPos[v + 1], mPos[v + 2]) / Rst;
                        const band = Math.sin(rv * 24.0);
                        let k = (band > 0.35 ? 1.28 : 0.84) * facet * spark;
                        k *= 1 + (1 - Math.min(rv, 1)) * 0.45; // brighter toward the core
                        mCol[v] = Math.min(1, mCol[v] * k);
                        mCol[v + 1] = Math.min(1, mCol[v + 1] * k);
                        mCol[v + 2] = Math.min(1, mCol[v + 2] * k);
                        const vi = v / 3;
                        if (heat > mDmg[vi]) mDmg[vi] = heat;
                    }
                }
            }
        }

        // Chain-bound chest: planked timber, painted from each vertex's depth below the
        // surface (measured against the solid's own boundary planes, normalized by its
        // inradius) so the boards read crisply on every face and a faint hoard-glow leaks
        // out of the deep interior. The padlock and the chains that bind it are separate 3D
        // models built by buildgemRig(), not fracture chunks.
        if (material === 'reliquary') {
            const planes = shape.planes;
            let inr = Infinity;
            for (const pl of planes) inr = Math.min(inr, pl.d);
            const depth = (x, y, z) => {
                let m = Infinity;
                for (const pl of planes) {
                    const dd = pl.d - (x * pl.n.x + y * pl.n.y + z * pl.n.z);
                    if (dd < m) m = dd;
                }
                return m / inr;
            };
            const bx = shape.bound.x, by = shape.bound.y, bz = shape.bound.z;
            for (const c of chunks) {
                // the slabs and the dirt clumps inside the cavity keep their own paint
                if (c.kind && c.kind !== 'wall') continue;
                c.depth = depth(c.centroid.x, c.centroid.y, c.centroid.z);
                const end = (c.vStart + c.vCount) * 3;
                for (let f = c.vStart * 3; f < end; f += 9) { // 9 floats = one facet
                    const facet = 0.86 + Math.random() * 0.26;
                    for (let v = f; v < f + 9; v += 3) {
                        const y = mPos[v + 1];
                        const dn = depth(mPos[v], y, mPos[v + 2]);
                        // planked timber outside, a hint of hoard-glow deep inside
                        const t = (y / Math.max(by, 1e-4)) * 4.0 + 8.0;
                        const frac = t - Math.floor(t);
                        let k = (Math.floor(t) % 2 === 0) ? 1.18 : 0.84;
                        if (Math.min(frac, 1 - frac) < 0.11) k *= 0.55; // plank seam
                        k *= facet * (dn < 0.10 ? 1.0 : 0.78);
                        if (dn > 0.55) { k *= 1.25; mDmg[v / 3] = 0.10; }
                        mCol[v] = Math.min(1, mCol[v] * k);
                        mCol[v + 1] = Math.min(1, mCol[v + 1] * k);
                        mCol[v + 2] = Math.min(1, mCol[v + 2] * k);
                    }
                }
            }
            buildGemRig(bx, by, bz); // the padlock + chains are real geometry, not chunks
        }

        if (lvl.bands) buildBands(lvl.bands); // solid metal rings clamped around the solid
        if (lvl.blocks) buildBlocks(blockPlan); // solid metal cubes buried inside it
        if (lvl.rods) buildRods(lvl.rods); // long metal rods crossed and stabbed through it
        if (lvl.gear || lvl.build === 'gears') buildPoleGears(); // ticking metal gears at both poles
        if (material === 'hive') buildHoneyDrips(); // purely decorative honey drips
        if (material === 'molten') buildLavaStreams(); // bleeding wounds pour lava down the rock

        mergedGeo = new THREE.BufferGeometry();
        const posAttr = new THREE.BufferAttribute(mPos, 3);
        const colAttr = new THREE.BufferAttribute(mCol, 3);
        posAttr.setUsage(THREE.DynamicDrawUsage);
        colAttr.setUsage(THREE.DynamicDrawUsage);
        mergedGeo.setAttribute('position', posAttr);
        mergedGeo.setAttribute('color', colAttr);
        mergedGeo.setAttribute('normal', new THREE.BufferAttribute(mNor, 3));
        const dmgAttr = new THREE.BufferAttribute(mDmg, 1);
        dmgAttr.setUsage(THREE.DynamicDrawUsage);
        mergedGeo.setAttribute('aDamage', dmgAttr);
        basePositions = mPos.slice();
        mergedColorDirty = mergedPosDirty = mergedDmgDirty = false;

        solidMesh = new THREE.Mesh(mergedGeo, rockMat);
        solidMesh.userData.kind = 'chunk';
        // chunks detach by collapsing to degenerate triangles at the origin, which
        // leaves the computed bounds stale; the solid always covers the origin and
        // never grows, so a fixed sphere is both cheaper and correct.
        mergedGeo.boundingSphere = new THREE.Sphere(new V3(0, 0, 0), Math.hypot(shape.bound.x, shape.bound.y, shape.bound.z) * 1.05);
        solidMesh.frustumCulled = false; // single object, always on screen
        chunksGroup.add(solidMesh);

        if (material === 'star') {
            // Overall silhouette outline: the same merged geometry drawn back-faces-only and
            // scaled up a hair about the star's centre, so the solid itself occludes all of it
            // except a thin contour at the rim. Costs one extra draw call, no extra geometry,
            // and it tracks the star as it is peeled away because it shares the same buffer.
            starOutlineMat = new THREE.MeshBasicMaterial({
                color: 0xbcd9ff, side: THREE.BackSide, transparent: true, opacity: 1,
                depthWrite: false, blending: THREE.AdditiveBlending,
            });
            starOutline = new THREE.Mesh(mergedGeo, starOutlineMat);
            starOutline.scale.setScalar(1.035);
            starOutline.frustumCulled = false;
            starOutline.renderOrder = 1;
            chunksGroup.add(starOutline);
            applyStarLight();
        }

        // ---- dynamic internal glow ----
        // A single PointLight at the object centre that intensifies as chunks are removed,
        // simulating light escaping from the breaking solid. Colour matches the level's
        // glow palette. Updated only when the alive count changes, not every frame.
        totalChunkCount = chunks.length;
        lastAliveCount = -1; // force first update
        if (!coreGlowLight) {
            coreGlowLight = new THREE.PointLight(0xffffff, 0, 3.5, 2);
            cubeGroup.add(coreGlowLight);
        }
        coreGlowLight.color.setHex(glowFor(lvl));
        coreGlowLight.intensity = 0; // starts invisible; ramps up as chunks break

        // Reset intro progress. Keep the interface out of the way for every level
        // until its shape has finished coalescing, so each trial opens on the solid.
        introProgress = 0.0;
        const introDurationMin = lvl.introDuration || introDuration;
        const introDurationMax = lvl.introDurationMax || introDurationMin;
        if (lvl.introDurationMax) {
            const maxRadius = Math.max(1e-6, ...chunks.map((c) => c.centroid.length()));
            for (const c of chunks) {
                const radialProgress = THREE.MathUtils.clamp(c.centroid.length() / maxRadius, 0, 1);
                c.introDuration = introDurationMin + radialProgress * (introDurationMax - introDurationMin);
            }
        } else {
            for (const c of chunks) c.introDuration = introDurationMin;
        }
        document.body.classList.add('intro-hide-ui');
        treasures = tPos.map((p, i) => makeTreasure(p, GEM_COLORS[i % GEM_COLORS.length], chunks[treasureChunkIndex[i]] || null));
        secretRing = lvl.noRing ? null : createSecretRing(); // optional hidden gold ring, sealed in its own chunk

        cubeGroup.position.set(0, 0, 0); // clear any leftover jolt lunge
        lunge = null;
        // don't inherit the previous solid's impact wobble / camera shake
        cubeGroup.scale.set(1, 1, 1);
        wobbleAmp = 0;
        wobbleTime = 0;
        shake = 0;
        kick = 0;
        cubeGroup.quaternion.setFromEuler(new THREE.Euler(0.35, -0.6, 0));
        const lvlNameKey = window.LEVEL_NAME_KEYS[level] || 'stoneCube';

        refreshToolUI();
        setHint(materialHintKey(), { num: level + 1, name: window._t ? window._t(lvlNameKey).toLowerCase() : lvl.name.toLowerCase() });
        dirty = true;
        if (window.applyTranslations) window.applyTranslations();
        if (typeof warmupRender === 'function' && typeof hammer !== 'undefined' && typeof shockwaveGeo !== 'undefined') {
            warmupRender();
        }
    }

    // ---------- hammer ----------
    const hammer = new THREE.Group();
    const hammerArm = new THREE.Group();
    hammer.add(hammerArm);
    (function buildHammer() {
        const wood = new THREE.MeshStandardMaterial({ color: 0x7d5a3a, roughness: 0.8, transparent: true });
        const steel = new THREE.MeshStandardMaterial({ color: 0x8e949c, roughness: 0.35, metalness: 0.75, transparent: true });
        const band = new THREE.MeshStandardMaterial({ color: 0x4a4038, roughness: 0.6, metalness: 0.3, transparent: true });
        const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.058, ARM, 10), wood);
        handle.position.y = -ARM / 2;
        hammerArm.add(handle);
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.26, 0.54), steel);
        head.position.set(0, -ARM, 0);
        hammerArm.add(head);
        const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.3, 10), band);
        collar.position.set(0, -ARM, 0);
        hammerArm.add(collar);
        hammer.visible = false;
        scene.add(hammer);
    })();

    function setHammerOpacity(o) {
        hammerArm.traverse((m) => { if (m.material) m.material.opacity = o; });
    }

    // ---------- idle teaching hint: outline-only "ghost" hammer ----------
    // Level 1 only. If the player hasn't struck anything within 3 seconds, a wireframe
    // hammer loops a demo swing against whatever face of the cube is toward the camera,
    // so the core verb (tap to strike) is never a mystery. It vanishes on the first strike.
    const IDLE_HINT_DELAY = 3.0;   // seconds of no strikes before the ghost appears
    const GHOST_CYCLE = 1.5;       // one demo swing + reset, in seconds
    let idleHint = 0;
    let ghostPhase = 0;
    let ghostMat = null;
    const ghostHammer = new THREE.Group();
    const ghostArm = new THREE.Group();
    ghostHammer.add(ghostArm);
    (function buildGhostHammer() {
        ghostMat = new THREE.LineBasicMaterial({
            color: 0xe8c98a, transparent: true, opacity: 0.8, depthTest: false,
        });
        const add = (geo, y) => {
            const l = new THREE.LineSegments(new THREE.EdgesGeometry(geo), ghostMat);
            l.position.y = y;
            l.renderOrder = 6; // drawn over the solid so the outline always reads
            ghostArm.add(l);
            geo.dispose(); // only the edge geometry is kept
        };
        add(new THREE.CylinderGeometry(0.045, 0.058, ARM, 10), -ARM / 2);
        add(new THREE.BoxGeometry(0.24, 0.26, 0.54), -ARM);
        ghostHammer.visible = false;
        scene.add(ghostHammer);
    })();

    // Aim the ghost at the centre of the screen, using the same basis maths as a real
    // swing so the demo lands flush on the cube's front face however it's been rotated.
    const _ghostUp = new V3();
    const _ghostRight = new V3();
    const _ghostProj = new V3();
    const _ghostBasis = new THREE.Matrix4();
    function placeGhostHammer() {
        if (!solidMesh) return false;
        cubeGroup.updateMatrixWorld(true);
        ndc.set(0, 0);
        raycaster.setFromCamera(ndc, camera);
        const hits = raycaster.intersectObject(solidMesh, false);
        if (!hits.length) return false;
        const h = hits[0];
        const n = _scratchNormal.copy(h.face.normal).transformDirection(solidMesh.matrixWorld).normalize();
        const toCam = _scratchToCam.copy(camera.position).sub(h.point).normalize();
        if (n.dot(toCam) < 0.15) n.lerp(toCam, 0.7).normalize();
        _ghostUp.set(0, 1, 0).applyQuaternion(camera.quaternion);
        _ghostUp.sub(_ghostProj.copy(n).multiplyScalar(_ghostUp.dot(n)));
        if (_ghostUp.lengthSq() < 0.05) {
            _ghostUp.set(0, 1, 0).sub(_ghostProj.copy(n).multiplyScalar(n.y));
        }
        _ghostUp.normalize();
        _ghostRight.crossVectors(_ghostUp, n).normalize();
        _ghostBasis.makeBasis(_ghostRight, _ghostUp, n);
        ghostHammer.quaternion.setFromRotationMatrix(_ghostBasis);
        ghostHammer.position.copy(h.point).addScaledVector(_ghostUp, ARM).addScaledVector(n, 0.27);
        return true;
    }

    function hideGhostHammer() {
        if (!ghostHammer.visible) return;
        ghostHammer.visible = false;
        dirty = true;
    }

    function updateIdleHint(dt) {
        const eligible = level === 0 && strikes === 0 && !gameOver &&
            introProgress >= 1 && !swing && !plantedBomb;
        if (!eligible) { hideGhostHammer(); return; }
        idleHint += dt;
        if (idleHint < IDLE_HINT_DELAY) { hideGhostHammer(); return; }
        const prev = ghostPhase;
        ghostPhase = (ghostPhase + dt) % GHOST_CYCLE;
        // re-aim at the start of every cycle, so a rotated cube gets a fresh demo
        if (!ghostHammer.visible || ghostPhase < prev) {
            if (!placeGhostHammer()) return;
            ghostHammer.visible = true;
        }
        const t = ghostPhase;
        let rot, op;
        if (t < 0.32) {                       // accelerate down into the face
            const k = t / 0.32;
            rot = SWING_START * (1 - k * k);
            op = 0.8;
        } else if (t < 0.58) {                // bounce back off it
            rot = -0.55 * ((t - 0.32) / 0.26);
            op = 0.8;
        } else {                              // fade out while lifting back up
            const k = Math.min((t - 0.58) / 0.42, 1);
            rot = -0.55 * (1 - k) + SWING_START * k;
            op = 0.8 * (1 - k * 0.85);
        }
        ghostArm.rotation.x = rot;
        ghostMat.opacity = op;
        dirty = true;
    }

    const SWING_START = -1.7;
    function startSwing(hitWorld, normalWorld, hitChunk) {
        const n = normalWorld.clone().normalize();
        let up = new V3(0, 1, 0).applyQuaternion(camera.quaternion);
        up.sub(n.clone().multiplyScalar(up.dot(n)));
        if (up.lengthSq() < 0.05) up.set(0, 1, 0).sub(n.clone().multiplyScalar(n.y));
        up.normalize();
        const right = new V3().crossVectors(up, n).normalize();
        const m = new THREE.Matrix4().makeBasis(right, up, n);
        hammer.quaternion.setFromRotationMatrix(m);
        hammer.position.copy(hitWorld).addScaledVector(up, ARM).addScaledVector(n, 0.27);
        hammerArm.rotation.set(SWING_START, 0, 0);
        setHammerOpacity(1);
        hammer.visible = true;
        swing = {
            t: 0, phase: 'strike',
            hitLocal: cubeGroup.worldToLocal(hitWorld.clone()),
            n, hitChunk,
        };
    }

    function updateSwing(dt) {
        if (!swing) return;
        if (swing.phase === 'strike') {
            swing.t += dt / 0.15;
            const k = Math.min(swing.t, 1);
            hammerArm.rotation.x = SWING_START * (1 - k * k); // accelerate into impact

            // Stretch along Y as it accelerates into impact, compress X/Z (Squash & Stretch)
            const stretch = 1.0 + (1.0 - k) * 0.18;
            const compress = 1.0 - (1.0 - k) * 0.08;
            hammerArm.scale.set(compress, stretch, compress);

            if (swing.t >= 1) {
                impact();
                swing.phase = 'retract';
                swing.t = 0;
            }
        } else {
            swing.t += dt / 0.22;
            const k = Math.min(swing.t, 1);
            hammerArm.rotation.x = -0.55 * k;

            // Squash flat on impact, then snap back to normal
            const squashY = 0.62 + k * 0.38;
            const squashXZ = 1.25 - k * 0.25;
            hammerArm.scale.set(squashXZ, squashY, squashXZ);

            setHammerOpacity(1 - k);
            if (swing.t >= 1) {
                hammer.visible = false;
                swing = null;
                hammerArm.scale.set(1, 1, 1);
            }
        }
    }

    // ---------- impact / damage ----------
    function impact() {
        strikes++;
        window.strikes = strikes;
        updateLevelStrikeCounter(true);
        if (strikes === 1) {
            CubeCrackerAudio.startMusic();
        }
        // the chest is bound: nothing but the padlock models can be touched
        if (material === 'reliquary' && !chainsBroken) {
            if (swing.lock) lockStrike(swing.lock); else blockedStrike();
            return;
        }
        // a metal band soaked the blow up: metal never shatters, it just buckles
        if (swing.band) { bandStrike(swing.band); return; }
        if (window.hapticsEnabled !== false && navigator.vibrate) {
            try {
                navigator.vibrate(15);
            } catch (e) { }
        }
        shake = (window.screenShakeEnabled !== false) ? 0.16 * MOTION : 0; if (window.hapticsEnabled !== false && navigator.vibrate) { try { navigator.vibrate(14); } catch (e) { } }
        kick = 0.08 * MOTION; // kick the camera back slightly on impact!
        // clockwork gears clank; honeycomb sounds bouncy; egg cracks shell; glassy/metal solids ring; rock and magma thud
        if (material === 'clockwork') {
            CubeCrackerAudio.gearClank();
        } else if (material === 'hive') {
            CubeCrackerAudio.bouncy();
            CubeCrackerAudio.thunk(false, 0.43, -500);
        } else if (material === 'egg') {
            CubeCrackerAudio.eggCrack();
            CubeCrackerAudio.thunk(false, 1.0);
        } else {
            CubeCrackerAudio.thunk(material === 'ice' || material === 'obsidian' || material === 'reliquary' || material === 'star');
        }
        const hitWorld = cubeGroup.localToWorld(swing.hitLocal.clone());
        spawnDust(hitWorld, swing.n);
        spawnCubeDust(hitWorld, swing.n);
        spawnShockwave(hitWorld, swing.n);
        flash(hitWorld);

        // Spawn impact sparks
        spawnImpactSparks(hitWorld, 12);

        // Spawn floating juice text
        let { word, textColor } = impactWord();
        const hit = swing.hitChunk;
        if (material === 'ice' && hit && hit.alive && hit.damaged) {
            word = 'SHATTER!!!';
            textColor = '#ffffff';
        }
        if (material === 'obsidian' && hit && hit.alive && (!hit.shell || hit.damaged)) {
            word = hit.shell ? 'SPLINTER!!!' : 'CORE BURST!!!';
            textColor = '#e8c7ff';
        }
        if (material === 'petrified' && hit && hit.alive && (!hit.bark || hit.damaged)) {
            word = hit.bark ? 'BARK PEELED!!!' : 'PEELED!!!';
            textColor = '#ffdca8';
        }
        spawnJuiceText(word, hitWorld, textColor);

        // Trigger Cube Wobble (elastic squash-and-stretch rebound)
        wobbleAmp = (material === 'hive' ? 0.0525 : 0.035) * MOTION;
        wobbleTime = 0;

        applyMaterialDamage(hitWorld, cfg.hitRadius);
        // Stuck-player nudge: if nothing has been uncovered after a long stretch of
        // hammering, quietly restate how this material breaks.
        if (!revealedOnce && collectedCount === 0 && (strikes === 14 || strikes === 26)) {
            const nameKey = (window.LEVEL_NAME_KEYS && window.LEVEL_NAME_KEYS[level]) || 'stoneCube';
            setHint(materialHintKey(), {
                num: level + 1,
                name: window._t ? window._t(nameKey).toLowerCase() : '',
            });
        }
        // Level 1 only: once two blows have landed without turning up a gem, swap the
        // opening "drag to rotate" line for a clear objective prompt (and keep it there,
        // so it also wins over the stuck-player nudge above).
        if (level === 0 && strikes >= 2 && !revealedOnce && collectedCount === 0) {
            setHint('searchGemsHint');
        }
    }

    // Material-themed floating combat text for a plain blow. The second-strike specials
    // (ice shatter / obsidian splinter / bark peel) are overlaid by the caller, which
    // needs the struck chunk to decide them.
    function impactWord() {
        const WORDS = {
            ice: { words: ['CHINK!', 'FROST!', 'CHILL!', 'ICE!', 'GLACIAL!', 'FREEZE!'], color: '#90d0ff' },
            obsidian: { words: ['SHARD!', 'GLASS!', 'CRAZE!', 'SPLINTER!', 'FRACTURE!'], color: '#c89bff' },
            molten: { words: ['MELT!', 'SEAR!', 'ERUPT!', 'BURN!', 'MAGMA!'], color: '#ff9a4a' },
            clockwork: { words: ['CLANK!', 'CLUNK!', 'GRIND!', 'TICK!'], color: '#ffd68a' },
            petrified: { words: ['PEEL!', 'SNAP!', 'FLAKE!', 'TIMBER!', 'RING!'], color: '#e8b068' },
            hive: { words: ['SQUELCH!', 'WAX!', 'DRIP!', 'COMB!', 'STICKY!'], color: '#ffcf6a' },
            reliquary: { words: ['SPLIT!', 'CRACK!', 'TIMBER!', 'BUST!', 'PRY!'], color: '#e8c98a' },
            star: { words: ['FLARE!', 'GLEAM!', 'NOVA!', 'SHINE!', 'BURST!'], color: '#cfe6ff' },
            egg: { words: ['THUD!', 'IT MENDS!', 'SHELL HOLDS!', 'WHUMP!', 'IT KNITS!'], color: '#a8e6c0' },
        };
        const entry = WORDS[material];
        if (entry) {
            return {
                word: entry.words[Math.floor(Math.random() * entry.words.length)],
                textColor: entry.color,
            };
        }
        const rockWords = ['SMASH!', 'CRUNCH!', 'CRACK!', 'POW!', 'BASH!', 'WHACK!', 'BUMP!'];
        return {
            word: rockWords[Math.floor(Math.random() * rockWords.length)],
            textColor: level === 2 ? '#ffb45e' : '#e8c98a',
        };
    }

    // The actual material damage for one blow, split out of impact() so a strike that
    // landed on metal can still chew into the dirt/rock around it (see bandStrike).
    function applyMaterialDamage(hitWorld, R) {
        if (material === 'ice') {
            iceImpact(hitWorld, R);
        } else if (material === 'obsidian') {
            obsidianImpact(hitWorld, R);
        } else if (material === 'molten') {
            moltenImpact(hitWorld, R);
        } else if (material === 'clockwork') {
            clockworkImpact(hitWorld, R);
        } else if (material === 'petrified') {
            petrifiedImpact(hitWorld, R);
        } else if (material === 'hive') {
            hiveImpact(hitWorld, R);
        } else if (material === 'reliquary') {
            reliquaryImpact(hitWorld, R);
        } else if (material === 'star') {
            starImpact(hitWorld, R);
        } else if (material === 'egg') {
            eggImpact(hitWorld, R);
        } else {
            // collect detach targets first — detachChunk splices `chunks`
            const toDetach = [];
            for (let i = 0; i < chunks.length; i++) {
                const c = chunks[i];
                if (!c.alive) continue;
                const d = c.centroid.distanceTo(swing.hitLocal);
                if (d < R || c === swing.hitChunk) {
                    toDetach.push(c);
                } else if (d < R * 1.75) {
                    scorchChunk(c, 0.9);
                }
            }
            for (let i = toDetach.length - 1; i >= 0; i--) detachChunk(toDetach[i], hitWorld);
        }
        exposeGems();
        flushMergedUpdates();
    }

    // Darken a chunk a step (up to 3) — the bruise ring around a strike / blast.
    function scorchChunk(c, mul) {
        if (c.scorch >= 3) return;
        c.scorch++;
        const a = mergedGeo.attributes.color.array;
        const end = (c.vStart + c.vCount) * 3;
        for (let j = c.vStart * 3; j < end; j++) a[j] *= mul;
        mergedColorDirty = true;
    }

    // A gem pops into view the moment its encasing chunk is gone.
    // Shared by the hammer and the explosive charge.
    function exposeGems() {
        updateRingExposure(); // the hidden bonus ring uncovers the same way a gem does
        // the dragon egg's gems are exposed only while their piece is shrunk away, and
        // seal over again when it springs back — that lives in its own updater
        if (material === 'egg') { updateEggGems(); return; }
        for (const t of treasures) {
            if (!t.exposed && t.chunk && !t.chunk.alive) {
                t.exposed = true;
                t.revealFlash = 1.0; // trigger the glow/scale pop flare
                // Brief surge of the internal glow: when a gem is unearthed the core
                // light floods the scene with the gem's colour for ~0.4 s.
                if (coreGlowLight) {
                    coreGlowLight.color.copy(t.sprite.material.color);
                    coreGlowLight.intensity = Math.max(coreGlowLight.intensity, 3.0);
                    coreGlowSurge = 1.0;
                }
                CubeCrackerAudio.reveal();

                // Radiant burst of gem sparks on expose!
                const gemWorldPos = t.group.localToWorld(new V3(0, 0, 0));
                spawnSparkleBurst(gemWorldPos, t.sprite.material.color, 25);

                // Zelda unearthing floating text with matching gem color
                const gemColorStyle = t.sprite.material.color.getStyle();
                spawnJuiceText('UNEARTHED!!!', gemWorldPos, gemColorStyle, '38px');

                if (!revealedOnce) {
                    revealedOnce = true;
                    setHint('gemGleams');
                }
            }
        }
    }

    // ---------- explosive charge ----------
    // Tapping with the charge selected *plants* it: a small charge sticks to the solid
    // and flashes red faster and faster for half a second before it goes off. It rides
    // in cubeGroup, so dragging the solid around during the fuse carries it along.
    const bombGeo = new THREE.SphereGeometry(0.17, 12, 10);
    const BOMB_FUSE = 0.5;
    function plantBomb(hitWorld, nWorld) {
        bombUsed = true; // spend the charge the instant it's planted
        currentTool = 'hammer';
        refreshToolUI();

        const mat = new THREE.MeshStandardMaterial({
            color: 0x2a0c0c, emissive: 0xff2418, emissiveIntensity: 0.6,
            roughness: 0.45, metalness: 0.25,
        });
        const mesh = new THREE.Mesh(bombGeo, mat);
        mesh.position.copy(hitWorld).addScaledVector(nWorld, 0.10);
        cubeGroup.worldToLocal(mesh.position);
        cubeGroup.add(mesh);
        const light = new THREE.PointLight(0xff3a24, 0, 2.6, 2);
        mesh.add(light);

        plantedBomb = {
            mesh, mat, light,
            hitLocal: cubeGroup.worldToLocal(hitWorld.clone()),
            nLocal: nWorld.clone().applyQuaternion(cubeGroup.quaternion.clone().invert()),
            t: 0,
        };
        CubeCrackerAudio.chime(0);
        dirty = true;
    }

    // Pull a live charge off the solid without setting it off, and drop any slow-mo it
    // queued. The fuse burns in real time and used to outlive the win: the blast landed
    // after completeLevel() had already banked the score, so it bumped `strikes` past
    // the value that was saved and the win card reported a number the record never saw.
    function defusePlantedBomb() {
        clearTimeout(bombSlowTimer);
        bombSlowTimer = 0;
        targetTimeScale = 1.0;
        const pb = plantedBomb;
        if (!pb) return;
        plantedBomb = null;
        if (pb.mesh.parent) pb.mesh.parent.remove(pb.mesh);
        pb.mat.dispose();
        dirty = true;
    }

    function updatePlantedBomb(dt) {
        const pb = plantedBomb;
        if (!pb) return;
        pb.t += dt;
        const k = Math.min(pb.t / BOMB_FUSE, 1);
        // flash rate accelerates toward detonation
        const freq = 7 + k * 24;
        const blink = 0.5 + 0.5 * Math.sin(pb.t * freq * Math.PI * 2);
        pb.mat.emissiveIntensity = 0.35 + blink * 5.5;
        pb.light.intensity = blink * 3.6;
        pb.mesh.scale.setScalar(1 + blink * 0.24 + k * 0.18);
        dirty = true;
        if (pb.t >= BOMB_FUSE) {
            plantedBomb = null;
            cubeGroup.remove(pb.mesh);
            pb.mat.dispose();
            const wp = cubeGroup.localToWorld(pb.hitLocal.clone());
            const wn = pb.nLocal.clone().applyQuaternion(cubeGroup.quaternion).normalize();
            detonate(wp, wn);
        }
    }

    // One charge per level (unlocked from level 3): blows a crater far larger than a
    // hammer strike and ignores ice's crack-then-shatter rule entirely.
    function detonate(hitWorld, nWorld) {
        bombUsed = true;
        strikes++;
        window.strikes = strikes;
        bus('game:strike', { pop: true }); // the charge is a strike too — keep the HUD in sync
        if (strikes === 1) bus('audio:music:start');
        if (window.hapticsEnabled !== false && navigator.vibrate) {
            try { navigator.vibrate([40, 30, 90]); } catch (e) { }
        }
        shake = (window.screenShakeEnabled !== false) ? 0.44 * MOTION : 0; if (window.hapticsEnabled !== false && navigator.vibrate) { try { navigator.vibrate(14); } catch (e) { } }
        kick = 0.24 * MOTION;
        CubeCrackerAudio.boom();
        if (material === 'hive') {
            CubeCrackerAudio.bouncy();
        }

        const hitLocal = cubeGroup.worldToLocal(hitWorld.clone());
        spawnShockwave(hitWorld, nWorld);
        flash(hitWorld);
        spawnDust(hitWorld, nWorld);
        spawnDust(hitWorld, nWorld);
        spawnCubeDust(hitWorld, nWorld);
        spawnCubeDust(hitWorld, nWorld);
        spawnImpactSparks(hitWorld, 34);
        spawnJuiceText('BOOM!!!', hitWorld, '#ff9e46', '46px');
        wobbleAmp = 0.08 * MOTION;
        wobbleTime = 0;
        if (material === 'star') { // the charge lights up the star and the whole sky
            starFlash = 1.0;
            starLight = 1.0;
            starOutlineLight = 1.0;
            starOutlineActive = true;
            if (starWasDark) { starWasDark = false; setHint('starHint'); }
            applyStarLight();
        }
        // brief slow-mo so the crater reads
        targetTimeScale = 0.35;
        clearTimeout(bombSlowTimer);
        bombSlowTimer = setTimeout(() => { targetTimeScale = 1.0; }, 280);

        // a sealed chest can't be cratered: the blast blows both padlocks apart instead,
        // and their chains go with them
        if (material === 'reliquary' && !chainsBroken) {
            for (const rig of lockRigs.slice()) breakLock(rig, hitWorld);
            exposeGems();
            flushMergedUpdates();
            currentTool = 'hammer';
            refreshToolUI();
            return;
        }

        // the dragon egg can't be cratered either: the blast just caves a much wider dent
        // into the shell, which then knits itself back together from the rim inward
        if (material === 'egg') {
            eggShrink(hitLocal, bombRadius * 1.25);
            exposeGems();
            flushMergedUpdates();
            currentTool = 'hammer';
            refreshToolUI();
            return;
        }

        const R = bombRadius;
        // the charge shears any metal it reaches clean off in one piece. A band wraps the whole
        // girth, so it only cares how far up the blast landed; a buried block is local, so it is
        // measured against its own position (otherwise one blast would take all three at once).
        for (const rig of bandRigs.slice()) {
            const d = rig.rod
                ? rodDist(hitLocal, rig)
                : (rig.block || rig.gear)
                    ? rig.home.distanceTo(hitLocal)
                    : Math.abs(rig.y - hitLocal.y);
            // Only a blast planted moderately close shears the metal outright. Further
            // out the shockwave just buckles it (one BAND_HP hit's worth), so you still
            // have to finish the job with the hammer.
            const shearR = (rig.block || rig.rod || rig.gear) ? R * 0.62 : R * 0.55;
            const jarR = (rig.block || rig.rod || rig.gear) ? R * 1.3 : R * 1.15;
            if (d < shearR) {
                breakBand(rig, hitWorld);
            } else if (d < jarR) {
                rig.hits++;
                rig.shake = 1;
                const k = Math.min(rig.hits / BAND_HP, 1);
                rig.mat.color.setRGB(0.60 - k * 0.20, 0.64 - k * 0.22, 0.68 - k * 0.24);
                if (rig.hits >= BAND_HP) {
                    breakBand(rig, hitWorld);
                } else {
                    spawnJuiceText('METAL HOLDS!', hitWorld, '#dbe7ff', '36px');
                    setHint('metalHint');
                }
            }
        }
        // the hive only loses its innermost 70%; the rest of the blast just squashes wax
        const KR = material === 'hive' ? R * HIVE_KILL : R;
        const toDetach = [];
        for (const c of chunks) {
            if (!c.alive || c.centroid.distanceTo(hitLocal) >= KR) continue;
            toDetach.push(c);
        }
        for (let i = toDetach.length - 1; i >= 0; i--) detachChunk(toDetach[i], hitWorld);
        if (material === 'molten') { // the blast leaves the rim boiling and bleeding
            heatNeighbors(hitLocal, R * 1.15, 1);
            addWound(hitLocal, nWorld.clone().applyQuaternion(cubeGroup.quaternion.clone().invert()));
        }
        // singe (or frost) the crater rim
        for (const c of chunks) {
            if (!c.alive || c.centroid.distanceTo(hitLocal) > R * 1.5) continue;
            if (material === 'hive') {
                const dh = c.centroid.distanceTo(hitLocal);
                if (dh < R) squashChunk(c);
                else if (dh < R * HIVE_JIGGLE_BAND) jiggleChunk(c);
                else scorchChunk(c, 0.92);
            } else if (material === 'ice') {
                if (!c.damaged) markDamaged(c, hitLocal, R * 1.5);
            } else if (material === 'obsidian') {
                if (c.shell && !c.damaged) markDamaged(c, hitLocal, R * 1.5, OBSIDIAN_FAULT);
                else scorchChunk(c, 0.88);
            } else if (material === 'petrified') {
                if (c.bark && !c.damaged) markDamaged(c, hitLocal, R * 1.5, WOOD_SPLIT);
                else scorchChunk(c, 0.86);
            } else if (material === 'molten') {
                if (c.crust && !c.damaged) markDamaged(c, hitLocal, R * 1.5, CRUST_FAULT);
                else scorchChunk(c, 0.82);
            } else {
                scorchChunk(c, 0.82);
            }
        }
        exposeGems();
        flushMergedUpdates();
        currentTool = 'hammer'; // charge spent — back to the hammer
        refreshToolUI();
    }

    // One strike touches many chunks (an ice crack frosts dozens, a shatter detaches
    // dozens). They all write into the same two buffers, so flag the buffers dirty and
    // re-upload once per strike here rather than once per chunk touched.
    function flushMergedUpdates() {
        if (!mergedGeo) return;
        if (mergedColorDirty) { mergedGeo.attributes.color.needsUpdate = true; mergedColorDirty = false; }
        if (mergedPosDirty) { mergedGeo.attributes.position.needsUpdate = true; mergedPosDirty = false; }
        if (mergedDmgDirty) { mergedGeo.attributes.aDamage.needsUpdate = true; mergedDmgDirty = false; }
        dirty = true;
    }

    function detachChunk(c, hitWorld, forceDir) {
        c.alive = false;
        // Hand ownership of the mesh over to `debris` entirely — leaving `c` in `chunks`
        // too would let disposeAll() and the debris loop dispose the same geometry/material
        // twice if a rebuild happens mid-flight.
        const ci = chunks.indexOf(c);
        if (ci !== -1) chunks.splice(ci, 1);

        // Carry whatever the solid's buffer has accumulated for this chunk (scorch
        // darkening, ice frost) across to its standalone geometry, so the flying
        // piece looks like the piece that was just there.
        const mergedCol = mergedGeo.attributes.color.array;
        const ownCol = c.geometry.attributes.color;
        ownCol.array.set(mergedCol.subarray(c.vStart * 3, (c.vStart + c.vCount) * 3));
        ownCol.needsUpdate = true;
        const ownDmg = c.geometry.attributes.aDamage;
        if (ownDmg) {
            ownDmg.array.set(mergedGeo.attributes.aDamage.array.subarray(c.vStart, c.vStart + c.vCount));
            ownDmg.needsUpdate = true;
        }

        // Collapse this chunk's triangles in the solid to zero area — they still get
        // submitted, but rasterize to nothing, and it costs one range write instead of
        // rebuilding the whole merged buffer.
        const mergedPos = mergedGeo.attributes.position.array;
        mergedPos.fill(0, c.vStart * 3, (c.vStart + c.vCount) * 3);
        mergedPosDirty = true;

        // The chunk sat at its centroid inside the solid with no rotation of its own,
        // so its world transform is just the solid's, applied to the centroid.
        const wp = cubeGroup.localToWorld(c.centroid.clone());
        const wq = new THREE.Quaternion();
        chunksGroup.getWorldQuaternion(wq);
        const mesh = new THREE.Mesh(c.geometry, sharedDebrisMat);
        mesh.position.copy(wp);
        mesh.quaternion.copy(wq);
        debrisGroup.add(mesh);
        // `forceDir` (used by the egg's shell plates) pushes every piece the same way,
        // with only a little scatter and slow tumble, so a wide patch of chunks travels
        // as one curved slab instead of bursting apart radially.
        const dir = forceDir ? forceDir.clone() : wp.clone().sub(hitWorld);
        if (forceDir) {
            dir.x += (Math.random() - 0.5) * 0.22;
            dir.y += (Math.random() - 0.5) * 0.22;
            dir.z += (Math.random() - 0.5) * 0.22;
        }
        if (dir.lengthSq() < 0.001) dir.set(0, 0, 1);
        dir.normalize();
        const vel = dir.multiplyScalar(forceDir ? 1.7 + Math.random() * 0.5 : 1.0 + Math.random() * 1.8);
        if (forceDir) {
            vel.y += 0.3;
        } else {
            vel.y += 0.5 + Math.random() * 0.9;
            vel.x += (Math.random() - 0.5) * 0.6;
        }
        const spin = forceDir ? 2.2 : 7;
        debris.push({
            mesh, vel,
            ang: new V3((Math.random() - 0.5) * spin, (Math.random() - 0.5) * spin, (Math.random() - 0.5) * spin),
            life: 0, maxLife: 1.3 + Math.random() * 0.7,
        });
    }

    // Ice: nothing breaks on a fresh hit — instead a large area frosts over. Striking
    // an already-frosted chunk shatters every frosted chunk in a still-larger radius,
    // leaving undamaged ice untouched. Radii are the difficulty levers.
    const ICE_FROST = [0.90, 0.97, 1.0];      // frosted-white crack tint
    const OBSIDIAN_FAULT = [0.98, 0.74, 1.0]; // glowing violet fault-line tint
    const WOOD_SPLIT = [1.0, 0.86, 0.60];     // pale amber split-along-the-grain tint
    const ICE_CRACK = 1.75 * 1.0; // damage radius, as a multiple of hitRadius (10% bigger)
    const ICE_SHATTER = 2.8;     // shatter radius (larger than the crack it clears)
    function iceImpact(hitWorld, R) {
        const hit = swing.hitChunk;
        if (hit && hit.alive && hit.damaged) {
            CubeCrackerAudio.shatter();
            const SR = R * ICE_SHATTER;
            const toDetach = [];
            for (let i = 0; i < chunks.length; i++) {
                const c = chunks[i];
                if (c.alive && c.damaged && c.centroid.distanceTo(swing.hitLocal) < SR) {
                    toDetach.push(c);
                }
            }
            for (let i = toDetach.length - 1; i >= 0; i--) detachChunk(toDetach[i], hitWorld);
        } else {
            const DR = R * ICE_CRACK;
            for (const c of chunks) {
                if (c.alive && !c.damaged && c.centroid.distanceTo(swing.hitLocal) < DR) {
                    markDamaged(c, swing.hitLocal, DR);
                }
            }
            if (!iceTaught) {
                iceTaught = true;
                setHint('iceShatterHint');
            }
        }
    }

    // Obsidian: the shell is tough volcanic glass — a fresh strike only crazes it with
    // glowing fault lines over a wide area; hitting crazed glass splinters it away. The
    // crystal core underneath is brittle, so once you punch through, each strike opens a
    // much wider cavity. Undamaged shell never breaks in one hit.
    function obsidianImpact(hitWorld, R) {
        const hit = swing.hitChunk;
        if (!hit) return;
        if (hit.shell && !hit.damaged) {
            const DR = R * 1.6;
            for (const c of chunks) {
                if (c.alive && c.shell && !c.damaged && c.centroid.distanceTo(swing.hitLocal) < DR) {
                    markDamaged(c, swing.hitLocal, DR, OBSIDIAN_FAULT);
                }
            }
            if (!obsidianTaught) {
                obsidianTaught = true;
                setHint('obsidianCrackHint');
            }
            return;
        }
        CubeCrackerAudio.shatter();
        const BR = hit.shell ? R * 1.2 : R * 1.9; // the brittle core gives way far wider
        const toDetach = [];
        for (const c of chunks) {
            if (!c.alive) continue;
            const d = c.centroid.distanceTo(swing.hitLocal);
            if (d < BR && (c === hit || !c.shell || c.damaged)) toDetach.push(c);
            else if (c.shell && !c.damaged && d < BR * 1.35) markDamaged(c, swing.hitLocal, BR * 1.35, OBSIDIAN_FAULT);
        }
        for (let i = toDetach.length - 1; i >= 0; i--) detachChunk(toDetach[i], hitWorld);
    }

    // ---------- molten core ----------
    // Flat-tint a whole chunk toward `tint` (no falloff) — the orange heat glow that
    // marks rock which has overheated and is about to blow itself apart. `glow` overrides
    // the emissive strength: heating rock leaves it out (so it burns as bright as it is
    // tinted), while rock crusting over passes 0 to snuff its own glow out as it hardens.
    function tintChunk(c, tint, k, glow) {
        const a = mergedGeo.attributes.color.array;
        const dmg = mergedGeo.attributes.aDamage.array;
        const end = (c.vStart + c.vCount) * 3;
        for (let i = c.vStart * 3; i < end; i += 3) {
            a[i] += (tint[0] - a[i]) * k;
            a[i + 1] += (tint[1] - a[i + 1]) * k;
            a[i + 2] += (tint[2] - a[i + 2]) * k;
            const vi = i / 3;
            if (glow !== undefined) dmg[vi] = glow;
            else if (k > dmg[vi]) dmg[vi] = k;
        }
        mergedColorDirty = true;
        mergedDmgDirty = true;
    }

    // Heat every cool chunk near `centerLocal` so it erupts shortly. `gen` bounds the
    // chain (and the per-call cap keeps one strike from vaporising the whole core).
    const MOLTEN_GENS = 2;
    function heatNeighbors(centerLocal, radius, gen) {
        if (gen > MOLTEN_GENS) return;
        let n = 0;
        for (const c of chunks) {
            if (n >= 8) break;
            if (!c.alive || c.heat) continue;
            if (c.centroid.distanceTo(centerLocal) > radius) continue;
            c.heat = true;
            tintChunk(c, MOLTEN_GLOW, 0.82);
            moltenQueue.push({ chunk: c, t: 0.2 + gen * 0.14 + Math.random() * 0.14, gen });
            n++;
        }
    }

    // ---- open wounds, bleeding lava, hardening crust ----
    // Every crater is a WOUND. It pours glowing lava down the rock and keeps the stone
    // around it molten, so the next blow into a hot wound tears out a far wider hole than
    // cold rock ever would. But a wound cools on its own, and once it goes cold a shell of
    // hardened basalt crusts over it — crust takes two hits to get through, so a hole you
    // walk away from seals itself back up. Commit to one wound and race the crust.
    const WOUND_LIFE = 3.9;                 // seconds a wound stays molten before it crusts
    const WOUND_REACH = 2.4;                // heat radius, as a multiple of hitRadius
    const CRUST_TINT = [0.09, 0.08, 0.09];  // cold, hardened basalt
    const CRUST_FAULT = [1.0, 0.44, 0.12];  // glowing fault lines through cracked crust

    // How molten the rock is at a point: 1 right where a fresh blow landed, tapering to 0
    // with distance from the nearest wound and as that wound cools.
    function woundHeat(pLocal) {
        const reach = cfg.hitRadius * WOUND_REACH;
        let h = 0;
        for (const w of moltenWounds) {
            const d = pLocal.distanceTo(w.center);
            if (d >= reach) continue;
            const k = w.heat * (1 - d / reach);
            if (k > h) h = k;
        }
        return h;
    }

    function addWound(centerLocal, nLocal) {
        const w = { center: centerLocal.clone(), n: nLocal.clone(), heat: 1 };
        moltenWounds.push(w);
        // only so many holes can stay molten at once — the oldest hardens first
        while (moltenWounds.length > 4) crustWound(moltenWounds.shift());
        bleedWound(w);
        return w;
    }

    // The wound has gone cold: every bare chunk around it hardens into crust. Rock already
    // queued to erupt is left alone — it's about to blow itself out of the wall anyway.
    function crustWound(w) {
        const R = cfg.hitRadius * (WOUND_REACH + 0.3);
        let n = 0;
        for (const c of chunks) {
            if (!c.alive || c.crust || c.heat) continue;
            if (c.centroid.distanceTo(w.center) > R) continue;
            c.crust = true;
            c.damaged = false; // fresh crust: it has to be cracked again
            tintChunk(c, CRUST_TINT, 0.88, 0);
            startCrustTween(c);
            n++;
        }
        if (n) {
            CubeCrackerAudio.bounce();
            setHint('moltenCrustHint');
            dirty = true;
        }
    }

    function updateWounds(dt) {
        if (!moltenWounds.length) return;
        for (let i = moltenWounds.length - 1; i >= 0; i--) {
            const w = moltenWounds[i];
            w.heat -= dt / WOUND_LIFE;
            if (w.heat > 0) continue;
            crustWound(w);
            moltenWounds.splice(i, 1);
        }
        flushMergedUpdates();
    }

    // A cooling chunk briefly swells as the basalt locks into place, then settles via
    // Back.easeOut. Attached chunks live in the merged solid buffer, so scale their own
    // vertex range around its centroid rather than allocating a temporary mesh.
    function startCrustTween(c) {
        if (c.crustTween) return;
        const tw = { chunk: c, t: 0, dur: 0.39 };
        c.crustTween = tw;
        crustTweens.push(tw);
        setChunkScale(c, 1.09);
    }

    function updateCrustTweens(dt) {
        for (let i = crustTweens.length - 1; i >= 0; i--) {
            const tw = crustTweens[i];
            const c = tw.chunk;
            if (!c.alive) {
                c.crustTween = null;
                crustTweens.splice(i, 1);
                continue;
            }
            tw.t += dt;
            const k = Math.min(tw.t / tw.dur, 1);
            // 1.09 -> 1.00 with a small Back.easeOut undershoot before it settles.
            setChunkScale(c, 1 + 0.09 * (1 - easeOutBack(k)));
            if (k >= 1) {
                setChunkScale(c, 1);
                c.crustTween = null;
                crustTweens.splice(i, 1);
            }
        }
        flushMergedUpdates();
    }

    // Magma: molten rock crumbles away in great scoops, hardened crust barely at all. The
    // rock around every fresh wound also superheats and erupts a beat later, which heats the
    // rock around *that* — so a well-placed tap keeps chewing outward on its own.
    function moltenImpact(hitWorld, R) {
        const hit = swing.hitChunk;
        if (hit && hit.crust && !hit.damaged) {
            // hardened crust: the first blow only cracks it open
            const DR = R * 1.45;
            for (const c of chunks) {
                if (c.alive && c.crust && !c.damaged && c.centroid.distanceTo(swing.hitLocal) < DR) {
                    markDamaged(c, swing.hitLocal, DR, CRUST_FAULT);
                }
            }
            setHint('moltenCrustHint');
            return;
        }
        const hot = woundHeat(swing.hitLocal); // soft, glowing rock gives way twice as wide
        const BR = R * (1 + hot);
        const toDetach = [];
        for (const c of chunks) {
            if (!c.alive) continue;
            const d = c.centroid.distanceTo(swing.hitLocal);
            if (d < BR || c === hit) toDetach.push(c);
            else if (c.crust && !c.damaged && d < BR * 1.4) markDamaged(c, swing.hitLocal, BR * 1.4, CRUST_FAULT);
        }
        for (let i = toDetach.length - 1; i >= 0; i--) detachChunk(toDetach[i], hitWorld);
        const nLocal = swing.n.clone().applyQuaternion(cubeGroup.quaternion.clone().invert());
        addWound(swing.hitLocal, nLocal);
        heatNeighbors(swing.hitLocal, BR * 1.1, 0);
        if (!moltenTaught) {
            moltenTaught = true;
            setHint('moltenRaceHint');
        }
    }

    // Bleeding lava: a fixed pool of glowing molten beads drawn as ONE InstancedMesh, parented to
    // the solid so the streams ride it as it's turned. A fresh wound claims a few thick lobes;
    // each wells up sluggishly at the crater's mouth, swells into a bulbous molten slug, then slowly
    // oozes down the rock with heavy viscous drag, cooling from incandescent white-gold into dark crust.
    const LAVA_DROPS = 24;
    const LAVA_PER_WOUND = 3;
    const _lavaHotColor = new THREE.Color(0xfff2ba);   // Incandescent molten core
    const _lavaMidColor = new THREE.Color(0xff5500);   // Glowing fiery orange
    const _lavaCoolColor = new THREE.Color(0x5c0901);  // Crusting dark crimson
    const _lavaCurColor = new THREE.Color();
    function buildLavaStreams() {
        const mat = new THREE.MeshStandardMaterial({
            color: 0xffffff, emissive: 0xff3b00, emissiveIntensity: 2.2,
            roughness: 0.38, metalness: 0.05, transparent: true, opacity: 0.98,
            depthWrite: false,
        });
        // 8x6 sphere for rounded, organic, heavy molten blobs
        const mesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), mat, LAVA_DROPS);
        mesh.frustumCulled = false;
        mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(LAVA_DROPS * 3), 3);
        const drops = [];
        for (let i = 0; i < LAVA_DROPS; i++) {
            drops.push({ live: false, wound: null, anchor: new V3(), t: 0, dur: 1, r: 0, run: 0, wobblePhase: 0 });
        }
        cubeGroup.add(mesh);
        lavaRig = {
            mesh, mat, drops, live: 0,
            R: Math.min(shape.bound.x, shape.bound.y, shape.bound.z),
        };
        updateLavaStreams(0);
    }

    function startDrop(d, w, rig) {
        d.live = true;
        d.wound = w;
        d.t = 0;
        // 20% reduced duration (2.55s – 3.85s) for tighter oozing lifecycle
        d.dur = 2.55 + Math.random() * 1.30;
        // Smaller, refined molten lobes (50%–76% of base unit radius)
        d.r = rig.R * (0.050 + Math.random() * 0.026);
        d.run = rig.R * (0.30 + Math.random() * 0.40);
        d.wobblePhase = Math.random() * Math.PI * 2;
        // Spawn deeper inside the fracture cavity, closer to the central core
        d.anchor.copy(w.center);
        if (d.anchor.lengthSq() > 0.001) {
            d.anchor.multiplyScalar(0.85); // biased inward towards the molten center
        }
        d.anchor.addScaledVector(w.n, -rig.R * 0.06);
        d.anchor.x += (Math.random() - 0.5) * rig.R * 0.14;
        d.anchor.y += (Math.random() - 0.5) * rig.R * 0.12;
        d.anchor.z += (Math.random() - 0.5) * rig.R * 0.14;
    }

    function bleedWound(w) {
        const rig = lavaRig;
        if (!rig) return;
        let n = 0;
        for (const d of rig.drops) {
            if (n >= LAVA_PER_WOUND) break;
            if (d.live) continue;
            startDrop(d, w, rig);
            n++;
        }
    }

    const _lavaM = new THREE.Matrix4();
    const _lavaP = new V3();
    const _lavaQ = new THREE.Quaternion();
    const _lavaS = new V3();
    function updateLavaStreams(dt) {
        const rig = lavaRig;
        if (!rig) return;
        let live = 0;
        for (let i = 0; i < rig.drops.length; i++) {
            const d = rig.drops[i];
            if (d.live) {
                d.t += dt;
                if (d.t >= d.dur) {
                    // Keep pouring while the wound is still molten, then dry up
                    if (d.wound && d.wound.heat > 0.10) startDrop(d, d.wound, rig);
                    else { d.live = false; d.wound = null; }
                }
            }
            if (!d.live) { // Parked: scaled to nothing, draws no pixels
                _lavaM.compose(_lavaP.set(0, 0, 0), _lavaQ, _lavaS.set(0, 0, 0));
                rig.mesh.setMatrixAt(i, _lavaM);
                continue;
            }
            live++;
            const u = d.t / d.dur;
            let r, sy, fall;
            if (u < 0.25) {
                // Phase 1: Heavy molten bubble welling up out of the fissure
                const k = u / 0.25;
                const bulge = Math.sin(k * Math.PI * 0.5);
                r = d.r * bulge;
                sy = r * (0.95 + k * 0.35);
                fall = d.r * k * 0.25;
                // White-hot core cooling slightly to bright orange
                _lavaCurColor.copy(_lavaHotColor).lerp(_lavaMidColor, k * 0.7);
            } else {
                // Phase 2: Thick viscous creep down the rock face
                const k = (u - 0.25) / 0.75;
                // Viscous resistance curve (creeping flow, not accelerating freefall)
                const flow = Math.pow(k, 0.75);
                // Heavy slug morphology: bulbous leading lobe that stays thick
                const lobeSwell = 1.0 + 0.22 * Math.sin(k * Math.PI);
                const massRetention = Math.max(1.0 - k * 0.30, 0.70);
                const tailFade = 1.0 - Math.pow(k, 5.0); // Soft fade-out only at the very end
                r = d.r * massRetention * lobeSwell * tailFade;
                sy = d.r * (1.25 + (1.0 - k) * 0.65) * lobeSwell * tailFade;
                fall = d.r * 0.25 + flow * d.run;
                // Thermal gradient: transition to glowing fiery red then dark crusting crimson
                if (k < 0.5) {
                    _lavaCurColor.copy(_lavaMidColor).lerp(_lavaCoolColor, k * 1.6);
                } else {
                    _lavaCurColor.copy(_lavaCoolColor).multiplyScalar(1.0 - (k - 0.5) * 0.8);
                }
            }
            _lavaP.copy(d.anchor);
            _lavaP.y -= fall;
            // Subtle organic lateral meandering as it creeps down uneven rock
            const crawl = Math.sin(d.wobblePhase + u * 3.5);
            _lavaP.x += crawl * d.r * 0.22;
            _lavaP.z += Math.cos(d.wobblePhase + u * 3.5) * d.r * 0.22;

            _lavaM.compose(_lavaP, _lavaQ, _lavaS.set(r, sy, r));
            rig.mesh.setMatrixAt(i, _lavaM);
            rig.mesh.setColorAt(i, _lavaCurColor);
        }
        rig.mesh.instanceMatrix.needsUpdate = true;
        if (rig.mesh.instanceColor) rig.mesh.instanceColor.needsUpdate = true;
        rig.live = live;
        dirty = true;
    }

    function disposeLavaStreams() {
        if (!lavaRig) return;
        if (lavaRig.mesh.parent) lavaRig.mesh.parent.remove(lavaRig.mesh);
        lavaRig.mesh.geometry.dispose();
        lavaRig.mat.dispose();
        lavaRig = null;
    }

    // ---------- clockwork sphere ----------
    // The whole body is machinery, so a strike knocks loose the gear pieces it lands on
    // and scuffs the ring around them. The buried dirt clumps break the same way once
    // enough gears are out of the way.
    function clockworkImpact(hitWorld, R) {
        const toDetach = [];
        for (const c of chunks) {
            if (!c.alive) continue;
            const d = c.centroid.distanceTo(swing.hitLocal);
            if (d < R * 1.15 || c === swing.hitChunk) toDetach.push(c);
            else if (d < R * 1.9) scorchChunk(c, 0.93);
        }
        for (let i = toDetach.length - 1; i >= 0; i--) detachChunk(toDetach[i], hitWorld);
    }

    // ---------- fossilized tree trunk ----------
    // Concentric-ring breakage. Distance is measured inside the ring shell: freely
    // around the ring's circumference and up/down the trunk, but radial separation is
    // weighted up, so a break spreads along the layer it landed on and doesn't drill
    // straight through to the core.
    const RING_RADIAL = 2.6;
    function ringDist(c, hitLocal) {
        const rC = Math.hypot(c.centroid.x, c.centroid.z);
        const rH = Math.hypot(hitLocal.x, hitLocal.z);
        // End-cap strikes (near top/bottom faces) soften radial weight so fractures
        // spread across the circular cross-section rather than forming single-ring slits.
        const isEndCap = shape && shape.bound && Math.abs(hitLocal.y) > (shape.bound.y * 0.78);
        const radialWeight = isEndCap ? 1.3 : RING_RADIAL;
        const dr = (rC - rH) * radialWeight;
        const dy = c.centroid.y - hitLocal.y;
        let da = Math.atan2(c.centroid.z, c.centroid.x) - Math.atan2(hitLocal.z, hitLocal.x);
        while (da > Math.PI) da -= Math.PI * 2;
        while (da < -Math.PI) da += Math.PI * 2;
        const dt = da * Math.max(rH, 0.001); // arc length at the strike's radius
        return Math.sqrt(dr * dr + dy * dy + dt * dt);
    }

    // Petrified wood: the fossilized bark shell crazes first (pale amber fault lines)
    // and peels away on a second strike. Under it, the trunk comes apart in natural
    // curved ring plates from the outside in.
    function petrifiedImpact(hitWorld, R) {
        const hit = swing.hitChunk;
        if (!hit) return;

        // First strike on undamaged bark: crack and split the outer bark shell
        if (hit.bark && !hit.damaged) {
            const DR = R * 1.6;
            for (const c of chunks) {
                if (c.alive && c.bark && !c.damaged && ringDist(c, swing.hitLocal) < DR) {
                    markDamaged(c, swing.hitLocal, DR, WOOD_SPLIT);
                }
            }
            if (!petrifiedTaught) {
                petrifiedTaught = true;
                setHint('petrifiedBarkHint');
            }
            return;
        }

        // Second strike on bark OR strike on exposed inner wood layers
        const BR = R * 1.7;
        const toDetach = [];
        const isEndCap = shape && shape.bound && Math.abs(swing.hitLocal.y) > (shape.bound.y * 0.78);
        const maxRingDiff = isEndCap ? 2 : 1;

        for (const c of chunks) {
            if (!c.alive) continue;
            const ringDiff = Math.abs(c.ring - hit.ring);
            if (ringDiff > maxRingDiff) continue;

            // Small distance multiplier for cross-ring shards so current layer breaks preferentially
            const distMul = (ringDiff === 0) ? 1.0 : (1.0 + ringDiff * 0.32);
            const d = ringDist(c, swing.hitLocal) * distMul;

            if (hit.bark) {
                // Bark peeling: detach any piece in core impact radius or any damaged piece in blast
                if (c.bark) {
                    if (d < BR * 0.88 || (c.damaged && d < BR) || c === hit) {
                        toDetach.push(c);
                    } else if (!c.damaged && d < BR * 1.4) {
                        markDamaged(c, swing.hitLocal, BR * 1.4, WOOD_SPLIT);
                    }
                }
            } else {
                // Inner ring shards: detach pieces in current/adjacent ring within blast radius
                if (!c.bark) {
                    if (d < BR || c === hit) {
                        toDetach.push(c);
                    } else if (d < BR * 1.6) {
                        scorchChunk(c, 0.94);
                    }
                }
            }
        }

        for (let i = toDetach.length - 1; i >= 0; i--) {
            detachChunk(toDetach[i], hitWorld);
        }
    }

    // ---- honeycomb hive ----
    // The comb is built in concentric layers of wax, so a strike tears a wide sheet out of
    // whichever layer it landed on. Distance is measured inside the layer: freely across
    // its surface, but radial separation is weighted up hard, so a break can't reach into
    // the layer underneath and the hive opens sheet by sheet from the outside in.
    //
    // Wax is springy, so only the innermost 70% of a strike's reach actually tears out.
    // Comb in the outer 30% collapses to nothing for a beat instead, then swells back to
    // full size, and comb in a further 20% ring beyond that just dents in a little and
    // springs straight back — the whole hive ripples outward from every hit.
    const HIVE_RADIAL = 3.4;
    const HIVE_KILL = 0.70;  // fraction of the break radius that is actually destroyed
    const HIVE_HOLD_MAX = 0.4;   // held flat for a random 0..this many seconds
    const HIVE_GROW = 1.0;       // seconds swelling out to the overshoot size
    const HIVE_OVER = 1.10;      // slight overshoot past full size
    const HIVE_SETTLE = 1.0;     // seconds easing back down to full size
    const HIVE_JIGGLE_BAND = 1.2; // outer jiggle ring, as a multiple of the break radius
    const HIVE_JIGGLE_MIN = 0.60; // jiggled comb dents to 60..85% of full size
    const HIVE_JIGGLE_MAX = 0.85;
    const HIVE_JIGGLE = 0.6;     // seconds springing back out from a jiggle

    // Scale a chunk about its own centroid by rewriting its slice of the merged buffer
    // from the pristine base copy (so repeated scales never drift).
    function setChunkScale(c, s) {
        const pos = mergedGeo.attributes.position.array;
        const cx = c.centroid.x, cy = c.centroid.y, cz = c.centroid.z;
        const end = (c.vStart + c.vCount) * 3;
        for (let i = c.vStart * 3; i < end; i += 3) {
            pos[i] = cx + (basePositions[i] - cx) * s;
            pos[i + 1] = cy + (basePositions[i + 1] - cy) * s;
            pos[i + 2] = cz + (basePositions[i + 2] - cz) * s;
        }
        mergedPosDirty = true;
    }

    function squashChunk(c, hold) {
        // `hold` is how long the piece stays gone before it springs back. The hive rolls a
        // short random one; the dragon egg passes its own, derived from how far the piece is
        // from the impact (see eggShrink).
        const h = hold != null ? hold : Math.random() * HIVE_HOLD_MAX;
        c.shrunk = true;
        // struck again mid-spring: restart the hold+grow+settle from zero size,
        // re-rolling the hold so a re-struck sheet doesn't stay in lockstep
        // (a chunk mid-jiggle is upgraded to a full squash)
        if (c.squash) {
            c.squash.t = 0;
            c.squash.jiggle = false;
            c.squash.hold = h;
            setChunkScale(c, 0);
            return;
        }
        c.squash = { chunk: c, t: 0, hold: h };
        hiveSquash.push(c.squash);
        setChunkScale(c, 0);
    }

    // Just outside the squash ring: the comb only dents in a little, then springs
    // straight back out with a Back.easeOut wobble. Never downgrades a chunk that's
    // already mid-squash — that sheet is doing the bigger motion.
    function jiggleChunk(c) {
        const from = HIVE_JIGGLE_MIN + Math.random() * (HIVE_JIGGLE_MAX - HIVE_JIGGLE_MIN);
        if (c.squash) {
            if (!c.squash.jiggle) return;
            c.squash.t = 0;
            c.squash.from = from;
            setChunkScale(c, from);
            return;
        }
        c.squash = { chunk: c, t: 0, jiggle: true, from };
        hiveSquash.push(c.squash);
        setChunkScale(c, from);
    }

    function updateHiveSquash(dt) {
        for (let i = hiveSquash.length - 1; i >= 0; i--) {
            const s = hiveSquash[i];
            const c = s.chunk;
            if (!c.alive) { c.squash = null; c.shrunk = false; hiveSquash.splice(i, 1); continue; }
            s.t += dt;
            if (s.jiggle) {
                const kj = Math.min(s.t / HIVE_JIGGLE, 1);
                const cj = 1.70158, cj3 = cj + 1;
                const backj = 1 + cj3 * Math.pow(kj - 1, 3) + cj * Math.pow(kj - 1, 2);
                setChunkScale(c, s.from + (1 - s.from) * backj);
                if (kj >= 1) { setChunkScale(c, 1); c.squash = null; hiveSquash.splice(i, 1); }
                continue;
            }
            if (s.t < s.hold) continue; // already sitting at zero size
            const g = s.t - s.hold;
            if (g < HIVE_GROW) {
                if (s.chime) { s.chime = false; CubeCrackerAudio.bounce(); } // the shell starts mending
                const k = g / HIVE_GROW;
                const sc = HIVE_OVER * k * k; // quad ease-in, out to the overshoot
                setChunkScale(c, sc);
                if (sc >= 0.45) c.shrunk = false; // the cavity has closed over again
                continue;
            }
            c.shrunk = false;
            const k2 = Math.min((g - HIVE_GROW) / HIVE_SETTLE, 1);
            // Back.easeOut back down to full size (dips a hair under 1 on the way)
            const c1 = 1.70158, c3 = c1 + 1;
            const back = 1 + c3 * Math.pow(k2 - 1, 3) + c1 * Math.pow(k2 - 1, 2);
            setChunkScale(c, HIVE_OVER + (1 - HIVE_OVER) * back);
            if (k2 >= 1) { setChunkScale(c, 1); c.squash = null; hiveSquash.splice(i, 1); }
        }
    }

    // ---- dragon egg ----
    // Nothing is ever destroyed here. A blow caves the shell in — every piece within reach
    // shrinks away to nothing — and then the egg knits itself back together, each piece
    // springing back with the honeycomb's bounce. The wait before a piece regrows is
    // inversely proportional to its distance from the impact: pieces out at the rim of the
    // dent come back after EGG_HOLD_MIN, pieces right under the hammer take EGG_HOLD_MAX, so
    // the crater closes from the outside in and the hole at its centre is the last to seal.
    const EGG_HOLD_MIN = 1.0;
    const EGG_HOLD_MAX = 2.25;
    const EGG_REACH = 1.8; // dent radius, as a multiple of hitRadius
    function eggShrink(centerLocal, radius) {
        let first = null, firstK = -1;
        for (const c of chunks) {
            if (!c.alive) continue;
            const d = c.centroid.distanceTo(centerLocal);
            if (d >= radius) continue;
            const k = d / radius; // 0 at the impact, 1 out at the rim
            squashChunk(c, EGG_HOLD_MAX - (EGG_HOLD_MAX - EGG_HOLD_MIN) * k);
            if (k > firstK) { firstK = k; first = c; } // the rim regrows first
        }
        // one soft thump when the shell starts knitting itself shut again
        if (first && first.squash) first.squash.chime = true;
    }

    function eggImpact(hitWorld, R) {
        eggShrink(swing.hitLocal, R * EGG_REACH);
        chestJolt(0.42); // the shell soaks the blow up and the egg rocks on its base
    }

    // The dragon egg's gems are never uncovered for good: one is only reachable while the
    // piece encasing it is gone, and it seals back over the moment that piece springs back.
    function updateEggGems() {
        updateRingExposure(); // the ring seals back over with the shell, too
        for (const t of treasures) {
            if (t.collected) continue;
            const open = !!(t.chunk && (!t.chunk.alive || t.chunk.shrunk));
            if (open === t.exposed) continue;
            t.exposed = open;
            if (!open) continue; // sealed over again — nothing to announce
            t.revealFlash = 1.0;
            CubeCrackerAudio.reveal();
            const wp = t.group.localToWorld(new V3(0, 0, 0));
            spawnSparkleBurst(wp, t.sprite.material.color, 22);
            spawnJuiceText('UNEARTHED!!!', wp, t.sprite.material.color.getStyle(), '38px');
            if (!revealedOnce) {
                revealedOnce = true;
                setHint('gemGleams');
            }
        }
        dirty = true;
    }
    // ---- honeycomb hive: dripping honey (purely visual) ----
    // A fixed pool of honey beads drawn as ONE InstancedMesh: a single draw call, no
    // allocations per frame, and no interaction with gameplay, physics or the fracture
    // buffers. Each bead swells at a fixed anchor on the comb's surface, stretches, then
    // runs down and thins away before restarting on its own staggered timer. The mesh is
    // parented to cubeGroup, so the drips ride the hive as it's turned.
    // Fewer, bigger, chunkier beads. The pool is fixed-size and every bead is recycled
    // in place — each one just resets its own timer and swells again, so nothing is ever
    // allocated or freed at runtime (no per-frame garbage, no GC hitches).
    const HONEY_DROPS = 12;
    function honeySurfacePoint(dir) {
        let t = Infinity;
        for (const pl of shape.planes) {
            const dn = dir.dot(pl.n);
            if (dn > 1e-4) t = Math.min(t, pl.d / dn); // origin is inside a convex solid
        }
        return dir.multiplyScalar(t === Infinity ? 1 : t * 0.98);
    }
    function buildHoneyDrips() {
        const mat = new THREE.MeshStandardMaterial({
            color: 0xffb022, emissive: 0xff8a00, emissiveIntensity: 0.35,
            roughness: 0.22, metalness: 0.0, transparent: true, opacity: 0.92,
            depthWrite: false,
        });
        // very low poly: 5x3 segments -> ~30 tris per bead, faceted on purpose
        const mesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 5, 3), mat, HONEY_DROPS);
        mesh.frustumCulled = false;
        const R = Math.min(shape.bound.x, shape.bound.y, shape.bound.z);
        const drops = [];
        for (let i = 0; i < HONEY_DROPS; i++) {
            const a = Math.random() * Math.PI * 2;
            const y = -0.85 + Math.random() * 1.05; // favour the underside of the comb
            const s = Math.sqrt(Math.max(0, 1 - y * y));
            const anchor = honeySurfacePoint(new V3(Math.cos(a) * s, y, Math.sin(a) * s));
            const period = 4.6 + Math.random() * 4.4; // slower cycle -> drips much less often
            drops.push({
                anchor, period,
                t: Math.random() * period, // stagger so they never pulse in sync
                r: R * (0.062 + Math.random() * 0.050), // fatter beads
                run: R * (0.55 + Math.random() * 0.85),
            });
        }
        cubeGroup.add(mesh);
        honeyRig = { mesh, mat, drops };
        updateHoneyDrips(0);
    }
    const _honeyM = new THREE.Matrix4();
    const _honeyP = new V3();
    const _honeyQ = new THREE.Quaternion();
    const _honeyS = new V3();
    function updateHoneyDrips(dt) {
        const rig = honeyRig;
        if (!rig) return;
        for (let i = 0; i < rig.drops.length; i++) {
            const d = rig.drops[i];
            d.t += dt;
            if (d.t >= d.period) d.t -= d.period;
            const u = d.t / d.period;
            let r, sy, fall;
            if (u < 0.34) {          // a bead swelling out of the wax
                const k = u / 0.34;
                r = d.r * k;
                sy = r * (1 + k * 0.7);
                fall = d.r * k * 0.6;
            } else {                 // stretching, running down, thinning away
                const k = (u - 0.34) / 0.66;
                r = d.r * Math.max(1 - k * 0.85, 0);
                sy = d.r * (1.7 + k * 1.6) * Math.max(1 - k * k, 0);
                fall = d.r * 0.6 + k * k * d.run;
            }
            _honeyP.copy(d.anchor);
            _honeyP.y -= fall;
            _honeyS.set(r, sy, r);
            _honeyM.compose(_honeyP, _honeyQ, _honeyS);
            rig.mesh.setMatrixAt(i, _honeyM);
        }
        rig.mesh.instanceMatrix.needsUpdate = true;
        dirty = true;
    }
    function disposeHoneyDrips() {
        if (!honeyRig) return;
        if (honeyRig.mesh.parent) honeyRig.mesh.parent.remove(honeyRig.mesh);
        honeyRig.mesh.geometry.dispose();
        honeyRig.mat.dispose();
        honeyRig = null;
    }

    function layerDist(c, hitLocal, radialW) {
        const rC = c.centroid.length();
        const rH = hitLocal.length();
        const dr = (rC - rH) * (radialW || HIVE_RADIAL);
        let ang = 0;
        if (rC > 1e-4 && rH > 1e-4) {
            const cosA = c.centroid.dot(hitLocal) / (rC * rH);
            ang = Math.acos(Math.max(-1, Math.min(1, cosA)));
        }
        const dt = ang * Math.max(rH, 0.001); // arc length at the strike's radius
        return Math.hypot(dr, dt);
    }

    function hiveImpact(hitWorld, R) {
        const hit = swing.hitChunk;
        if (!hit) return;
        const BR = R * 2.1; // wax comes away in big sheets
        const KR = BR * HIVE_KILL;
        const toDetach = [];
        for (const c of chunks) {
            if (!c.alive || c.layer !== hit.layer) continue; // stay inside this comb layer
            const d = layerDist(c, swing.hitLocal);
            if (d < KR || c === hit) toDetach.push(c);
            else if (d < BR) squashChunk(c); // springy outer ring: flattens, then swells back
            else if (d < BR * HIVE_JIGGLE_BAND) jiggleChunk(c); // just beyond: a small dent-and-spring
            else if (d < BR * 1.5) scorchChunk(c, 0.95);
        }
        for (let i = toDetach.length - 1; i >= 0; i--) detachChunk(toDetach[i], hitWorld);
    }

    // ---- fallen star ----
    // The crust is built in STAR_LAYERS concentric shells. A blow raises an "explosion" that
    // carries the index of the shell it landed on; a chunk is only damaged when its own shell
    // index matches, so the blast is sealed inside that one shell however close it lands, and
    // the star peels shell by shell from the outside in. Freed plates are flung outward from
    // the core (not away from the hammer), so a shell visibly peels off rather than bursting.
    const STAR_LAYERS = 4;
    const STAR_RADIAL = 3.0;
    // Dying light: how dark the star gets, and how fast the glow drains away.
    const STAR_DIM_FLOOR = 0.10; // uDim at zero light (0 would be pitch black)
    const STAR_DIM_RATE = 2.60;  // star glow lost per second between blows
    const STAR_OUTLINE_RATE = 0.62; // outline fades on its own, slower timer
    function applyStarLight() {
        fxUniforms.uDim.value = STAR_DIM_FLOOR + (1 - STAR_DIM_FLOOR) * starLight;
        // The outline is normally invisible. A strike reveals it, then it fades
        // on the same dying-light timer as the star rather than the brief hit flash.
        if (starOutlineMat) {
            const o = starOutlineActive ? starOutlineLight : 0;
            starOutlineMat.opacity = o;
            if (starOutline) starOutline.visible = o > 0.01;
        }
        if (starGlowEl) {
            const g = starFlash * starFlash;
            starGlowEl.style.opacity = Math.min(1, g * 0.9 + starLight * 0.16).toFixed(3);
        }
        dirty = true;
    }
    function starBlast(blast, hit) {
        const centerW = cubeGroup.localToWorld(_scratchPos.set(0, 0, 0)).clone();
        const toDetach = [];
        for (const c of chunks) {
            if (!c.alive || c.layer !== blast.layer) continue; // different shell: shielded
            const d = layerDist(c, blast.center, STAR_RADIAL);
            if (d < blast.radius || c === hit) toDetach.push(c);
            else if (d < blast.radius * 1.5) scorchChunk(c, 0.95);
        }
        for (let i = toDetach.length - 1; i >= 0; i--) detachChunk(toDetach[i], centerW);
    }
    function starImpact(hitWorld, R) {
        const hit = swing.hitChunk;
        if (!hit) return;
        starFlash = 1.0; // the star, and the whole sky behind it, flares
        starLight = 1.0; // the blow relights the dying star, seams and all
        starOutlineLight = 1.0;
        starOutlineActive = true;
        applyStarLight();
        if (starWasDark) { starWasDark = false; setHint('starHint'); }
        starBlast({ layer: hit.layer, center: swing.hitLocal, radius: R * 2.0 }, hit);
    }

    // ---- chain-bound chest ----
    // While the chest is sealed, impact() routes every blow either into lockStrike() (the
    // padlock model) or blockedStrike() (anything else), so reliquaryImpact() only ever runs
    // on plain timber once the chains have fallen away.
    function reliquaryImpact(hitWorld, R) {
        const toDetach = [];
        for (const c of chunks) {
            if (!c.alive) continue;
            const d = c.centroid.distanceTo(swing.hitLocal);
            if (d < R * 1.2 || c === swing.hitChunk) toDetach.push(c);
            else if (d < R * 1.9) scorchChunk(c, 0.9);
        }
        for (let i = toDetach.length - 1; i >= 0; i--) detachChunk(toDetach[i], hitWorld);
    }

    // A blocked blow: the hammer lands on chain-wrapped timber and achieves nothing. Every
    // link flares white, the chest lurches on its base, and the hint points at the padlock.
    function blockedStrike() {
        const hitWorld = cubeGroup.localToWorld(swing.hitLocal.clone());
        chainGlow = 1.0;
        applyChainGlow();
        CubeCrackerAudio.metalThud();
        if (window.hapticsEnabled !== false && navigator.vibrate) {
            try { navigator.vibrate([12, 26, 12]); } catch (e) { }
        }
        shake = (window.screenShakeEnabled !== false) ? 0.15 * MOTION : 0; if (window.hapticsEnabled !== false && navigator.vibrate) { try { navigator.vibrate(14); } catch (e) { } }
        kick = 0.06 * MOTION;
        wobbleAmp = 0.03 * MOTION;
        wobbleTime = 0;
        chestJolt(0.55);
        spawnImpactSparks(hitWorld, 10);
        spawnJuiceText('CHAINS HOLD!', hitWorld, '#dbe7ff', '36px');
        setHint('reliquaryBlockedHint');
    }

    // One padlock is off, so the two chains it pinned tear loose and whip outward. The link
    // instances are posed in the chest's own space, so their transforms are baked into world
    // space as they're handed to debrisGroup; updateChainFly() flies each flight from there.
    function flyChainBands(bands) {
        const flying = bands.filter((b) => !b.flying);
        if (!flying.length) return;
        cubeGroup.updateMatrixWorld(true);
        const wq = new THREE.Quaternion();
        cubeGroup.getWorldQuaternion(wq);
        const centerW = cubeGroup.localToWorld(_scratchPos.set(0, 0, 0)).clone();
        for (const b of flying) {
            b.flying = true;
            for (const l of b.links) {
                l.p.applyMatrix4(cubeGroup.matrixWorld);
                l.q.premultiply(wq);
                const d = l.p.clone().sub(centerW);
                if (d.lengthSq() < 1e-6) d.set(0, 1, 0);
                l.vel.copy(d.normalize()).multiplyScalar(1.5 + Math.random() * 2.0);
                l.vel.y += 0.9 + Math.random() * 0.9;
                l.axis.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
                l.rate = 4 + Math.random() * 9;
            }
            if (b.mesh.parent) b.mesh.parent.remove(b.mesh);
            debrisGroup.add(b.mesh);
        }
        // every band of one padlock shares that padlock's material, so one fade drives them all
        chainFlights.push({ bands: flying, mat: flying[0].mat, life: 0 });
    }

    // A hammer blow that landed on one of the padlocks. It rings the brass, rocks the lock
    // on its mount and flares the chains; once it has taken LOCK_HP hits (one) it blows
    // apart. The multi-hit branch below is kept so LOCK_HP can be raised again.
    function lockStrike(rig) {
        const hitWorld = cubeGroup.localToWorld(swing.hitLocal.clone());
        rig.hits++;
        rig.shake = 1;
        chainGlow = Math.max(chainGlow, 0.6);
        applyChainGlow();
        CubeCrackerAudio.metalThud();
        if (window.hapticsEnabled !== false && navigator.vibrate) {
            try { navigator.vibrate(24); } catch (e) { }
        }
        shake = (window.screenShakeEnabled !== false) ? 0.22 * MOTION : 0; if (window.hapticsEnabled !== false && navigator.vibrate) { try { navigator.vibrate(14); } catch (e) { } }
        kick = 0.10 * MOTION;
        wobbleAmp = 0.035 * MOTION;
        wobbleTime = 0;
        chestJolt(0.5);
        spawnDust(hitWorld, swing.n);
        spawnShockwave(hitWorld, swing.n);
        flash(hitWorld);
        spawnImpactSparks(hitWorld, 18);
        if (rig.hits >= LOCK_HP) {
            spawnJuiceText('LOCK BREAKS!!!', hitWorld, '#ffe08a', '46px');
            breakLock(rig, hitWorld);
        } else {
            spawnJuiceText(rig.hits === 1 ? 'CLANG!' : 'IT BUCKLES!', hitWorld, '#ffe08a');
            setHint('reliquaryLockHint');
        }
    }

    // A padlock comes apart: every piece of the model is handed to the debris pool with its
    // own fading material, then its own two chains whip free. Only when the last padlock goes
    // is the chest unbound and its timber breakable.
    function breakLock(rig, hitWorld) {
        const ri = lockRigs.indexOf(rig);
        if (ri !== -1) lockRigs.splice(ri, 1);
        cubeGroup.updateMatrixWorld(true);
        const out = new V3(0, 0, 1).applyQuaternion(cubeGroup.quaternion).normalize();
        for (const p of rig.parts) {
            const wp = new V3(), wq = new THREE.Quaternion();
            p.getWorldPosition(wp);
            p.getWorldQuaternion(wq);
            rig.group.remove(p);
            p.position.copy(wp);
            p.quaternion.copy(wq);
            p.material = p.material.clone();
            p.material.transparent = true;
            debrisGroup.add(p);
            const vel = out.clone().multiplyScalar(2.0 + Math.random() * 1.4);
            vel.x += (Math.random() - 0.5) * 1.8;
            vel.y += 0.9 + Math.random() * 1.1;
            vel.z += (Math.random() - 0.5) * 1.8;
            debris.push({
                mesh: p, vel,
                ang: new V3((Math.random() - 0.5) * 9, (Math.random() - 0.5) * 9, (Math.random() - 0.5) * 9),
                life: 0, maxLife: 1.5 + Math.random() * 0.6, own: true,
            });
        }
        if (rig.hit.parent) rig.hit.parent.remove(rig.hit);
        rig.hit.geometry.dispose();
        rig.hit.material.dispose();
        if (rig.group.parent) rig.group.parent.remove(rig.group);
        for (const m of rig.mats) m.dispose();

        chainGlow = 0.8; // links tear free still glowing from the last flare
        applyChainGlow();
        flyChainBands(rig.bands);
        const last = lockRigs.length === 0;
        if (last) chainsBroken = true;
        CubeCrackerAudio.shatter();
        CubeCrackerAudio.chime(2);
        if (window.hapticsEnabled !== false && navigator.vibrate) {
            try { navigator.vibrate([40, 30, 90]); } catch (e) { }
        }
        shake = (window.screenShakeEnabled !== false) ? 0.42 * MOTION : 0; if (window.hapticsEnabled !== false && navigator.vibrate) { try { navigator.vibrate(14); } catch (e) { } }
        kick = 0.22 * MOTION;
        wobbleAmp = 0.08 * MOTION;
        wobbleTime = 0;
        chestJolt(1.0);
        spawnImpactSparks(hitWorld, 30);
        spawnJuiceText(last ? 'CHAINS SNAP!!!' : 'ONE LOCK LEFT!', hitWorld, '#e6f0ff', '46px');
        targetTimeScale = 0.35; // brief slow-mo so the chains read as they go
        clearTimeout(bombSlowTimer);
        bombSlowTimer = setTimeout(() => { targetTimeScale = 1.0; }, 300);
        setHint(last ? 'reliquaryOpenHint' : 'reliquaryLockLeftHint');
    }

    // The solid lurches at the camera and rolls off the blow, then springs home.
    function chestJolt(strength) {
        const s = strength == null ? 1 : strength;
        const dir = camera.position.clone().sub(CAM_LOOK).normalize();
        lunge = { t: 0, dur: 0.44, dir, amp: 0.32 * s * MOTION };
        spinY += (Math.random() < 0.5 ? -1 : 1) * (1.2 + Math.random() * 1.4) * s;
        spinX += (Math.random() - 0.5) * 2.0 * s;
        dirty = true;
    }

    // Frost a chunk toward bright glacial white. Strength falls off with each vertex's
    // distance from the strike point (strongest at the impact, tapering only right at
    // the damage-radius edge — a floor keeps even the outer edge clearly frosted so it
    // doesn't fade back into undamaged blue), and each face keeps a little random
    // variation so it reads as crazing, not a flat paint blob.
    function markDamaged(c, hitLocal, DR, tint) {
        c.damaged = true;
        // Read positions from the un-offset base copy (already in solid space, so no
        // centroid term) and write colours into this chunk's slice of the solid.
        const pos = basePositions;
        const a = mergedGeo.attributes.color.array;
        const dmg = mergedGeo.attributes.aDamage.array;
        const t = tint || ICE_FROST;
        const tr = t[0], tg = t[1], tb = t[2];
        const FLOOR = 0.45; // minimum frost strength anywhere inside the damage radius
        const DR2 = DR * DR;
        const fEnd = (c.vStart + c.vCount) * 3;
        for (let f = c.vStart * 3; f < fEnd; f += 9) { // 9 floats = one flat-shaded face
            const facet = 0.85 + Math.random() * 0.15;  // slight per-facet variation only
            for (let v = 0; v < 9; v += 3) {
                const i = f + v;
                const dx = pos[i] - hitLocal.x;
                const dy = pos[i + 1] - hitLocal.y;
                const dz = pos[i + 2] - hitLocal.z;
                const d2 = dx * dx + dy * dy + dz * dz;
                if (d2 >= DR2) continue;
                const fall = 1 - Math.sqrt(d2) / DR;
                const curve = Math.pow(Math.min(fall, 1), 0.4); // rises to full strength fast
                const k = facet * (FLOOR + (1 - FLOOR) * curve);
                a[i] += (tr - a[i]) * k;
                a[i + 1] += (tg - a[i + 1]) * k;
                a[i + 2] += (tb - a[i + 2]) * k;
                const vi = i / 3;
                if (k > dmg[vi]) dmg[vi] = k; // crack veins glow strongest where frost is heaviest
            }
        }
        mergedColorDirty = true;
        mergedDmgDirty = true;
    }

    // Per-material particle tints. Each effect keeps its own palette so dust, cube
    // chips and sparks stay visually distinct on the same strike.
    const FX_COLORS = {
        dust: { egg: 0xbfe8cf, star: 0xdcecff, ice: 0xd8ecff, obsidian: 0xb99ad6, molten: 0xff9a55, clockwork: 0xe0c68e, petrified: 0xd8ab72, hive: 0xf0c574, reliquary: 0xd9c39a, _: 0xcbb89a },
        cubeDust: { egg: 0xc8ecd6, ice: 0xd0e8ff, obsidian: 0xc7a4f0, molten: 0xff8a44, clockwork: 0xe8c68a, petrified: 0xdcb079, hive: 0xffd07e, reliquary: 0xd8c49e, _: 0xdfd5c6 },
        spark: { egg: 0xd8ffe6, star: 0xeaf6ff, ice: 0xb0e0ff, obsidian: 0xdcb4ff, molten: 0xffb060, petrified: 0xffd090, hive: 0xffd88a, reliquary: 0xffe4b0, _: 0xffe0a0 },
    };
    const fxColor = (palette) => (palette[material] !== undefined ? palette[material] : palette._);

    function spawnDust(pos, n) {
        const item = ParticlePools.dusts.get();
        const N = 6;
        const arr = item.points.geometry.attributes.position.array;
        for (let i = 0; i < N; i++) {
            arr[i * 3] = pos.x;
            arr[i * 3 + 1] = pos.y;
            arr[i * 3 + 2] = pos.z;
            item.vels[i].set(
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2
            ).normalize().multiplyScalar(0.6 + Math.random() * 1.4)
                .addScaledVector(n, 0.8 + Math.random());
        }
        item.points.geometry.attributes.position.needsUpdate = true;
        // pooled items each own their material, so tinting per level is safe
        item.points.material.color.setHex(fxColor(FX_COLORS.dust));
        item.life = 0;
        fxGroup.add(item.points);
        dusts.push(item);
    }

    function spawnCubeDust(pos, n) {
        const count = tieredCount(4 + Math.floor(Math.random() * 3)); // 4 to 6 tiny cubes
        for (let i = 0; i < count; i++) {
            const item = ParticlePools.cubeDusts.get();

            item.mesh.material.color.setHex(fxColor(FX_COLORS.cubeDust));

            item.mesh.position.copy(pos);
            item.mesh.position.x += (Math.random() - 0.5) * 0.1;
            item.mesh.position.y += (Math.random() - 0.5) * 0.1;
            item.mesh.position.z += (Math.random() - 0.5) * 0.1;

            const s = (0.5 + Math.random() * 1.5) * 1.3; // 30% bigger on strike
            item.mesh.scale.set(s, s, s);
            item.startScale = s;

            item.vel.set(
                (Math.random() - 0.5) * 0.8,
                0.4 + Math.random() * 0.7,
                (Math.random() - 0.5) * 0.8
            ).addScaledVector(n, 0.5 + Math.random() * 0.8);

            item.ang.set(
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 4
            );

            item.life = 0;
            item.maxLife = 1.2 + Math.random() * 0.8;

            fxGroup.add(item.mesh);
            cubeDusts.push(item);
        }
    }

    const _sparkColor = new THREE.Color();
    function spawnImpactSparks(worldPos, count = 12) {
        count = tieredCount(count);
        _sparkColor.setHex(fxColor(FX_COLORS.spark));
        for (let i = 0; i < count; i++) {
            const item = ParticlePools.sparkles.get();
            const arr = item.points.geometry.attributes.position.array;
            arr[0] = worldPos.x;
            arr[1] = worldPos.y;
            arr[2] = worldPos.z;
            item.points.geometry.attributes.position.needsUpdate = true;

            item.points.material.color.copy(_sparkColor);
            item.points.material.size = 0.14 + Math.random() * 0.14;
            item.points.material.opacity = 1.0;

            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI * 0.5; // hemispherical cone
            const speed = 1.5 + Math.random() * 3.0;

            item.vel.set(
                Math.sin(phi) * Math.cos(theta) * speed,
                Math.sin(phi) * Math.sin(theta) * speed + 1.0, // slight upward lift
                Math.cos(phi) * speed
            );

            item.life = 0;
            item.maxLife = 0.3 + Math.random() * 0.3;

            fxGroup.add(item.points);
            sparkles.push(item);
        }
    }

    function spawnSparkleBurst(worldPos, color, count = 20) {
        count = tieredCount(count);
        const itemColor = color.isColor ? color : new THREE.Color(color);
        for (let i = 0; i < count; i++) {
            const item = ParticlePools.sparkles.get();
            const arr = item.points.geometry.attributes.position.array;
            arr[0] = worldPos.x;
            arr[1] = worldPos.y;
            arr[2] = worldPos.z;
            item.points.geometry.attributes.position.needsUpdate = true;

            item.points.material.color.copy(itemColor);
            item.points.material.size = 0.12 + Math.random() * 0.12;
            item.points.material.opacity = 1.0;

            // Shoot out radially
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);
            const speed = 1.0 + Math.random() * 2.5;
            item.vel.set(
                Math.sin(phi) * Math.cos(theta) * speed,
                Math.sin(phi) * Math.sin(theta) * speed,
                Math.cos(phi) * speed
            );

            item.life = 0;
            item.maxLife = 0.6 + Math.random() * 0.5;

            fxGroup.add(item.points);
            sparkles.push(item);
        }
    }

    const _juicePool = [];
    const _juicePoolMax = 12;
    // Must match the animation durations in style.css. The timeout below is only a
    // backstop for animationend, so it can never be SHORTER than the animation — a
    // short one used to hide "SECRET RING!" a second early and park the still-running
    // node back in the pool.
    const JUICE_ANIM_MS = { 'secret-ring-text': 2400, 'unearthed-text': 1400, 'juice-text': 700 };
    function recycleJuiceEl(el, gen) {
        // Every hand-out bumps the node's generation. A backstop timer armed by an
        // earlier use must not recycle a node that has since been handed out again:
        // that parked a live text in the pool and let two callers animate one element.
        if (gen !== undefined && gen !== el._juiceGen) return;
        if (_juicePool.includes(el)) return;
        if (_juicePool.length < _juicePoolMax) {
            el.style.display = 'none';
            _juicePool.push(el);
        } else {
            el.remove(); // pool full: don't leave orphaned nodes parked in the DOM
        }
    }
    function _getJuiceEl() {
        let el = _juicePool.pop();
        if (!el) {
            el = document.createElement('div');
            el._juiceGen = 0;
            // Only animationend recycles. A cancel is always something we caused
            // deliberately (hiding the node, or swapping classes to restart it), and
            // recycling on it is what let a node be pooled while still in use.
            el.addEventListener('animationend', () => recycleJuiceEl(el, el._juiceGen));
            el.style.display = 'none';
            document.body.appendChild(el);
        }
        el._juiceGen++;
        return el;
    }
    function spawnJuiceText(text, worldPos, color = '#e8c98a', size = '32px') {
        const tempV = _scratchPos.copy(worldPos).project(camera);
        const x = (tempV.x * 0.5 + 0.5) * canvasHostRect.width + canvasHostRect.left;
        let y = (-tempV.y * 0.5 + 0.5) * canvasHostRect.height + canvasHostRect.top;

        const variant = text === 'SECRET RING!' ? 'secret-ring-text'
            : text === 'UNEARTHED!!!' ? 'unearthed-text' : 'juice-text';
        const el = _getJuiceEl();
        el.style.display = '';
        if (variant !== 'juice-text') {
            y -= 30;
            el.className = 'juice-text ' + variant;
            el.style.color = '#ffffff';
            el.style.textShadow = `
                        0 0 6px #ffffff,
                        0 0 15px ${color},
                        0 0 30px ${color},
                        0 0 45px ${color},
                        3px 3px 5px rgba(0, 0, 0, 0.95),
                        5px 5px 15px rgba(0, 0, 0, 0.9)
                    `;
        } else {
            el.className = 'juice-text';
            el.style.color = color;
            el.style.textShadow = `0 0 10px ${color}, 0 0 20px rgba(0,0,0,0.85)`;
        }
        el.textContent = text;
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        // Sizes are authored against the same 1u = 16px base the stylesheet uses, so
        // express them in --u rather than raw px — a fixed px size left the ordinary
        // hit words stuck at desktop scale on small screens, while the UNEARTHED /
        // SECRET RING variants kept scaling via their `!important` rules in style.css.
        el.style.fontSize = `calc(var(--u) * ${parseFloat(size) || 32})`;

        const rotStart = (Math.random() * 2 - 1) * 20;
        const rotMid = rotStart * 0.4;
        const rotEnd = rotStart * 1.2;
        el.style.setProperty('--rot-start', `${rotStart}deg`);
        el.style.setProperty('--rot-mid', `${rotMid}deg`);
        el.style.setProperty('--rot-end', `${rotEnd}deg`);

        // Trigger animation cleanly without forcing a synchronous browser layout reflow
        el.style.animation = 'none';
        requestAnimationFrame(() => {
            el.style.animation = '';
            el.className = 'juice-text' + (variant !== 'juice-text' ? ' ' + variant : '');
        });

        // Backstop only: animationend normally does the recycling. Generation-guarded
        // so this timer can never reclaim the node once it has been handed out again.
        const gen = el._juiceGen;
        setTimeout(() => recycleJuiceEl(el, gen), JUICE_ANIM_MS[variant] + 300);
    }

    const _dirtBaseColor = new THREE.Color();
    const _dirtColorVar = new THREE.Color();
    const _dirtColorLerp = new THREE.Color(0x4a3525);
    const _dirtSpawnPos = new V3();
    function spawnHugeDirtCubes() {
        // mobile: fewer clouds, each a touch larger to compensate; weak GPUs get the leanest set
        const count = (tier.weak ? 15 : tier.mobile ? 20 : 30) + Math.floor(Math.random() * 10);
        const sizeBoost = (tier.mobile ? 1.12 : 1) * (level === 12 ? 2 : 1);
        const velocityBoost = level === 12 ? 1.65 : 1;
        const spawnRadiusBoost = level === 12 ? 3 : 1;
        const lvl = LEVELS[level];
        if (lvl && lvl.colors) {
            _dirtBaseColor.setRGB(lvl.colors.outer[0], lvl.colors.outer[1], lvl.colors.outer[2]);
        } else {
            _dirtBaseColor.setHex(0x5a4535);
        }

        for (let i = 0; i < count; i++) {
            const item = ParticlePools.cubeDusts.get();

            _dirtColorVar.copy(_dirtBaseColor).multiplyScalar(0.75 + Math.random() * 0.3);
            if (material !== 'ice' && material !== 'egg') {
                _dirtColorVar.lerp(_dirtColorLerp, 0.4 + Math.random() * 0.4);
            }
            item.mesh.material.color.copy(_dirtColorVar);

            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);
            const r = (0.4 + Math.random() * 0.8) * spawnRadiusBoost;
            _dirtSpawnPos.set(
                Math.sin(phi) * Math.cos(theta) * r,
                Math.sin(phi) * Math.sin(theta) * r,
                Math.cos(phi) * r
            );

            item.mesh.position.copy(_dirtSpawnPos);

            const s = (1.8 + Math.random() * 2.2) * sizeBoost;
            item.mesh.scale.set(s, s, s);
            item.startScale = s;

            item.vel.copy(_dirtSpawnPos).normalize().multiplyScalar((1.2 + Math.random() * 2.3) * velocityBoost);
            item.vel.y += (0.3 + Math.random() * 0.9) * velocityBoost;

            item.ang.set(
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8
            );

            item.life = 0;
            item.maxLife = 1.0 + Math.random() * 0.8;

            fxGroup.add(item.mesh);
            cubeDusts.push(item);
        }
    }

    const shockwaveGeo = new THREE.RingGeometry(0.01, 0.08, 16);
    const shockwaveMatIce = new THREE.MeshBasicMaterial({ color: 0x90d0ff, side: THREE.DoubleSide, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending });
    const shockwaveMatRock = new THREE.MeshBasicMaterial({ color: 0xfff0c0, side: THREE.DoubleSide, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending });
    const shockwaveMatObsidian = new THREE.MeshBasicMaterial({ color: 0xc79bff, side: THREE.DoubleSide, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending });
    const shockwavePool = [];
    const activeShockwaves = [];
    const flashLightPool = [];
    const activeFlashes = [];

    function spawnShockwave(pos, normal) {
        const mat = material === 'ice' ? shockwaveMatIce : material === 'obsidian' ? shockwaveMatObsidian : shockwaveMatRock;
        let mesh = shockwavePool.pop();
        if (!mesh) {
            // Each shockwave owns a clone: the fade loop writes material.opacity every
            // frame, and two overlapping shockwaves sharing one material would fight
            // over it (the newer one's alpha overwrites the older one's fade).
            mesh = new THREE.Mesh(shockwaveGeo, mat.clone());
        } else {
            mesh.material.color.copy(mat.color);
        }
        mesh.scale.set(1, 1, 1);
        mesh.material.opacity = 0.8;
        mesh.position.copy(pos);
        mesh.lookAt(_scratchPos.copy(pos).add(normal));
        fxGroup.add(mesh);
        activeShockwaves.push({ mesh, life: 0 });
    }

    function spawnSparkle(pos, color) {
        const item = ParticlePools.sparkles.get();

        const arr = item.points.geometry.attributes.position.array;
        arr[0] = pos.x;
        arr[1] = pos.y;
        arr[2] = pos.z;
        item.points.geometry.attributes.position.needsUpdate = true;

        item.points.material.color.copy(color);
        item.points.material.size = 0.08 + Math.random() * 0.08;
        item.points.material.opacity = 1.0;

        item.vel.set(
            (Math.random() - 0.5) * 0.4,
            (Math.random() - 0.5) * 0.4,
            (Math.random() - 0.5) * 0.4
        );

        item.life = 0;
        item.maxLife = 0.4 + Math.random() * 0.3;

        fxGroup.add(item.points);
        sparkles.push(item);
    }

    function flash(pos) {
        if (tier.mobile) return;
        let l = flashLightPool.pop();
        if (!l) l = new THREE.PointLight(0xffd9a0, 6, 3.2, 2);
        l.position.copy(pos);
        l.intensity = 6;
        fxGroup.add(l);
        activeFlashes.push({ light: l, life: 0 });
    }

    // ---------- collect ----------
    // Fly the gem to wherever its HUD slot icon actually sits on screen (unprojected
    // into world space), instead of a fixed point floating in front of the camera —
    // the fixed point didn't line up with the slot on most viewport shapes, which is
    // what made the gem look like it stalled short of the slot instead of reaching it.
    function slotWorldTarget(idx) {
        const el = hud.slots[idx];
        let ndcX = 0, ndcY = 0.85;
        if (el) {
            const r = el.getBoundingClientRect();
            ndcX = ((r.left + r.width / 2 - canvasHostRect.left) / canvasHostRect.width) * 2 - 1;
            ndcY = -((r.top + r.height / 2 - canvasHostRect.top) / canvasHostRect.height) * 2 + 1;
        }
        const dir = new V3(ndcX, ndcY, 0.5).unproject(camera).sub(camera.position).normalize();
        return camera.position.clone().addScaledVector(dir, 1.6);
    }

    function updateCoreGlow(force = false) {
        if (!coreGlowLight || totalChunkCount <= 0) return;
        const alive = chunks.length;
        if (force || alive !== lastAliveCount) {
            lastAliveCount = alive;
            const removed = totalChunkCount - alive;
            const pct = removed / totalChunkCount;
            const base = pct < 0.4
                ? pct * 0.75
                : 0.3 + (pct - 0.4) * 3.666;
            coreGlowLight.intensity = Math.min(base, 2.5);
            dirty = true;
        }
        // If an exposed, uncollected gem remains in the shape, match its color.
        // If no exposed gem remains, revert to the level's authored internal glow palette.
        const activeGem = treasures.find((g) => g.exposed && !g.collected);
        if (activeGem) {
            coreGlowLight.color.copy(activeGem.sprite.material.color);
        } else {
            const lvl = LEVELS[level];
            if (lvl) coreGlowLight.color.setHex(glowFor(lvl));
        }
        dirty = true;
    }

    function collect(t) {
        if (t.collected) return;
        t.collected = true;
        const wp = new V3();
        t.group.getWorldPosition(wp);
        cubeGroup.remove(t.group);
        t.group.position.copy(wp);
        scene.add(t.group);
        const idx = treasures.indexOf(t);
        const to = slotWorldTarget(idx);
        collecting.push({ t, from: wp.clone(), to, k: 0, idx });
        bus('audio:play', { sfx: 'chime', arg: idx });

        coreGlowSurge = 0; // Clear any active gem-reveal surge from this collected gem
        updateCoreGlow(true); // Recalculate core glow color & intensity immediately
        dirty = true;
    }

    const _collectPos = new V3();
    const _collectDir = new V3();
    const _collectUp = new V3(0, 1, 0);
    const _collectSide = new V3();
    function updateCollecting(dt) {
        for (let i = collecting.length - 1; i >= 0; i--) {
            const c = collecting[i];
            c.k += dt / 0.55;
            const e = c.k < 1 ? 1 - Math.pow(1 - c.k, 3) : 1;

            // Fly in a gorgeous arced swoop!
            _collectPos.lerpVectors(c.from, c.to, e);
            _collectDir.subVectors(c.to, c.from).normalize();
            _collectSide.crossVectors(_collectDir, _collectUp).normalize();
            if (_collectSide.lengthSq() < 0.01) {
                _collectSide.set(1, 0, 0);
            }

            const arcVal = Math.sin(e * Math.PI);
            // alternately swoop left/right, with an upward lift
            _collectPos.addScaledVector(_collectSide, arcVal * 0.92 * (c.idx % 2 === 0 ? 1 : -1));
            _collectPos.addScaledVector(_collectUp, arcVal * 0.42);
            c.t.group.position.copy(_collectPos);

            c.sparkT = (c.sparkT || 0) + dt;
            while (c.sparkT >= 0.038) {
                spawnSparkle(c.t.group.position, c.t.sprite.material.color);
                c.sparkT -= 0.038;
            }
            const s = Math.max(1 - e, 0.04);
            c.t.gem.scale.setScalar(s);
            c.t.sprite.material.opacity = 0.9 * (1 - e) + 0.2;
            c.t.sprite.scale.setScalar(0.9 * s + 0.1);
            c.t.light.intensity = 1.6 * (1 - e);
            if (c.k >= 1) {
                scene.remove(c.t.group);
                collecting.splice(i, 1);
                hud.slots[c.idx].classList.add('lit');
                collectedCount++;
                const remaining = treasures.length - collectedCount;
                if (remaining === 4) setHint('gemsRemain4');
                if (remaining === 3) setHint('gemsRemain3');
                if (remaining === 2) setHint('gemsRemain2');
                if (remaining === 1) setHint('gemsRemain1');
                if (remaining === 0) completeLevel();
            }
        }
    }

    // ---------- level complete ----------
    // Fires the moment the last gem lands in its slot: saves the result, plays the
    // slot victory bounce, then shows the win card (or the championship scoreboard on
    // the final level). Kept out of updateCollecting() so the flight loop stays readable.
    function completeLevel() {
        gameOver = true;
        // The last gem can be tapped while a charge is still ticking; the blast must not
        // land after the score below has been banked.
        defusePlantedBomb();
        setHint('');
        window.hitsPerLevel[level] = strikes;
        // bronze / silver / gold, from this level's gameConfig.starRanks thresholds
        window.currentRank = window.starRankFor(level, strikes);
        // Best-score feedback gives a reason to replay a level you've already
        // cracked: the win card always reports your record, and flags a new one.
        let isNewBest = false;
        if (window.bestScores && (window.bestScores[level] == null || strikes < window.bestScores[level])) {
            isNewBest = true;
            window.bestScores[level] = strikes;
            window.persistGameState();
            window.submitStarScore(); // a new best is the only thing that moves the star total
            if (window.renderLevelList) window.renderLevelList();
        }
        if (window.applyTranslations) window.applyTranslations();

        // Exaggerated victory bounce sequential animation for every gem slot.
        hud.slots.forEach((slot, idx) => {
            if (idx >= treasures.length) return;
            setTimeout(() => {
                slot.classList.add('victory-bounce');
                if (window.CubeCrackerAudio && window.CubeCrackerAudio.chime) window.CubeCrackerAudio.chime(idx);
            }, 50 + idx * 150);
        });

        setTimeout(() => {
            if (window.applyTranslations) window.applyTranslations();
            const strikeEl = document.getElementById('strikeCount');
            if (strikeEl) strikeEl.textContent = strikes;

            // applyTranslations() rewrites winDesc, so paint the best line after it.
            const bestEl = document.getElementById('winBest');
            if (bestEl) {
                const best = window.bestScores ? window.bestScores[level] : null;
                if (best == null) {
                    bestEl.textContent = '';
                } else {
                    const label = window._t ? window._t('bestScoreLabel', { strikes: best }) : 'BEST: ' + best;
                    bestEl.textContent = (isNewBest ? '\u2605 ' : '') + label;
                }
                bestEl.style.color = isNewBest ? 'var(--gold)' : 'var(--dim)';
            }

            // bonus: did they find this level's hidden gold ring?
            const ringLineEl = document.getElementById('winRing');
            if (ringLineEl) {
                ringLineEl.textContent = ringFound
                    ? '\u25CE ' + (window._t ? window._t('secretRingLabel') : 'SECRET RING FOUND')
                    : '';
            }

            const isLastLevel = (level === LEVELS.length - 1);
            if (isLastLevel) {
                const winCard = document.getElementById('winCard');
                if (winCard) winCard.style.display = 'none';
                const endCard = document.getElementById('endCard');
                if (endCard) endCard.style.display = 'flex';
                buildChampionshipScoreboard();
            } else {
                const winCard = document.getElementById('winCard');
                if (winCard) winCard.style.display = 'flex';
                const endCard = document.getElementById('endCard');
                if (endCard) endCard.style.display = 'none';
            }

            hud.overlay.classList.add('show');
            document.body.classList.add('has-overlay');
            bus('audio:play', { sfx: 'win' });
        }, 650);
    }

    // The championship end card: counts the total hits up on a timer, then paints the
    // per-level scoreboard beneath it.
    function buildChampionshipScoreboard() {
        const totalHits = window.runTotalHits();
        const totalHitsCount = document.getElementById('totalHitsCount');
        // Stars for THIS run, so the tally agrees with the per-level star rows
        // directly above it. The score sent to the platform is the all-time total
        // from save data instead — see submitStarScore().
        const runStars = window.totalStars(window.hitsPerLevel);
        const totalStarsCount = document.getElementById('totalStarsCount');
        if (totalStarsCount) {
            totalStarsCount.textContent = runStars;
            totalStarsCount.classList.remove('bounce-active');
        }
        // Lands on the same beat as the hit counter finishing its count-up.
        const popStars = () => {
            if (!totalStarsCount) return;
            totalStarsCount.classList.add('bounce-active');
            spawnSparklesAround(totalStarsCount);
        };

        const spawnSparklesAround = (el) => {
            const rect = el.getBoundingClientRect();
            const container = document.body;
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;

            const numSparkles = 16;
            for (let i = 0; i < numSparkles; i++) {
                const sparkle = document.createElement('div');
                sparkle.className = 'end-sparkle';
                sparkle.style.left = `${x}px`;
                sparkle.style.top = `${y}px`;

                const angle = Math.random() * Math.PI * 2;
                const distance = 30 + Math.random() * 90;
                const tx = Math.cos(angle) * distance;
                const ty = Math.sin(angle) * distance;

                sparkle.style.setProperty('--tx', `${tx}px`);
                sparkle.style.setProperty('--ty', `${ty}px`);

                const colors = ['#e8c98a', '#ffb45e', '#6ee0ff', '#c89bff', '#ffffff'];
                sparkle.style.background = colors[Math.floor(Math.random() * colors.length)];

                container.appendChild(sparkle);
                const removeSparkle = () => { if (sparkle.parentNode) sparkle.remove(); };
                sparkle.addEventListener('animationend', removeSparkle);
                setTimeout(removeSparkle, 1200);
            }
        };

        if (scoreboardCountInterval) {
            clearInterval(scoreboardCountInterval);
            scoreboardCountInterval = null;
        }
        if (totalHitsCount) {
            totalHitsCount.textContent = "0";
            totalHitsCount.classList.remove('bounce-active');

            let currentVal = 0;
            if (totalHits > 0) {
                const duration = 2000; // ms
                const intervalTime = 30; // ms
                const steps = duration / intervalTime;
                const increment = Math.max(1, Math.ceil(totalHits / steps));

                scoreboardCountInterval = setInterval(() => {
                    currentVal += increment;
                    if (currentVal >= totalHits) {
                        currentVal = totalHits;
                        clearInterval(scoreboardCountInterval);
                        scoreboardCountInterval = null;
                        totalHitsCount.textContent = currentVal;
                        totalHitsCount.classList.add('bounce-active');
                        spawnSparklesAround(totalHitsCount);
                        popStars();
                        if (window.CubeCrackerAudio && window.CubeCrackerAudio.chime) {
                            window.CubeCrackerAudio.chime(2);
                        }
                    } else {
                        totalHitsCount.textContent = currentVal;
                    }
                }, intervalTime);
            } else {
                totalHitsCount.textContent = "0";
                totalHitsCount.classList.add('bounce-active');
                spawnSparklesAround(totalHitsCount);
                popStars();
            }
        }

        const levelStatsContainer = document.getElementById('levelStats');
        if (levelStatsContainer) {
            levelStatsContainer.innerHTML = '';
            LEVELS.forEach((lvl, idx) => {
                const lvlNameKey = window.LEVEL_NAME_KEYS[idx] || 'stoneCube';
                const localizedName = window._t ? window._t(lvlNameKey) : lvl.name;

                const row = document.createElement('div');
                row.className = 'level-stat-row';
                row.innerHTML = `<span>${localizedName}</span>${window.hitsCellMarkup(idx)}`;
                levelStatsContainer.appendChild(row);
            });
        }
    }

    // ---------- input ----------
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let pointerDown = false;
    let moved = 0;
    let downAt = 0;
    let lastMoveTime = 0;
    let lastX = 0, lastY = 0;
    let spinX = 0, spinY = 0; // inertia (rad/s)

    const _scratchQy = new THREE.Quaternion();
    const _scratchQx = new THREE.Quaternion();
    const _axisY = new V3(0, 1, 0);
    const _axisX = new V3(1, 0, 0);
    const _scratchPos = new V3();

    function rotateCube(dx, dy) {
        _scratchQy.setFromAxisAngle(_axisY, dx);
        _scratchQx.setFromAxisAngle(_axisX, dy);
        cubeGroup.quaternion.premultiply(_scratchQy).premultiply(_scratchQx);
        dirty = true;
    }

    const el = renderer.domElement;
    el.style.touchAction = 'none';
    el.addEventListener('contextmenu', (e) => e.preventDefault());

    function updatePointerCapture(e, capture) {
        try {
            if (capture) {
                el.setPointerCapture(e.pointerId);
            } else if (el.hasPointerCapture && el.hasPointerCapture(e.pointerId)) {
                el.releasePointerCapture(e.pointerId);
            }
        } catch (err) { }
    }

    el.addEventListener('pointerdown', (e) => {
        activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        CubeCrackerAudio.warm(); // resume the audio context on this user gesture
        updatePointerCapture(e, true);

        if (activePointers.size === 1) {
            pointerDown = true; moved = 0; downAt = performance.now();
            lastMoveTime = performance.now();
            lastX = e.clientX; lastY = e.clientY;
            spinX = spinY = 0;
            interacted = true;
        } else if (activePointers.size >= 2) {
            // Start/re-baseline of pinch gesture
            const pts = Array.from(activePointers.values());
            initialPinchDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
            initialZoomFactor = zoomFactor;
            pointerDown = false;
            spinX = spinY = 0;
        }
    });

    // Spawn visual circle pulse on click/tap
    if (window._cubePointerDownGlob) window.removeEventListener('pointerdown', window._cubePointerDownGlob);
    window._cubePointerDownGlob = (e) => {
        createClickPulse(e.clientX, e.clientY);
    };
    window.addEventListener('pointerdown', window._cubePointerDownGlob);

    let _clickPulseCount = 0;
    function createClickPulse(x, y) {
        if (_clickPulseCount >= 4) return;
        const pulse = document.createElement('div');
        pulse.className = 'click-pulse';
        pulse.style.left = `${x}px`;
        pulse.style.top = `${y}px`;
        _clickPulseCount++;
        document.body.appendChild(pulse);
        let done = false;
        const finish = () => {
            if (done) return;
            done = true;
            pulse.remove();
            _clickPulseCount--;
        };
        pulse.addEventListener('animationend', finish);
        pulse.addEventListener('animationcancel', finish);
        // Fallback in case animationend never fires (tab hidden mid-animation, etc.)
        setTimeout(finish, 600);
    }

    // Attach move, up, cancel, blur listeners to window for iframe stability (e.g. hosted on Astrocade)
    if (window._cubePointerMove) window.removeEventListener('pointermove', window._cubePointerMove);
    window._cubePointerMove = (e) => {
        if (!activePointers.has(e.pointerId)) return;
        activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

        if (activePointers.size >= 2) {
            let p1 = null, p2 = null;
            for (const p of activePointers.values()) {
                if (!p1) p1 = p;
                else { p2 = p; break; }
            }
            const dist = (p1 && p2) ? Math.hypot(p1.x - p2.x, p1.y - p2.y) : 0;
            if (initialPinchDist > 0 && dist > 0) {
                const ratio = initialPinchDist / dist;
                zoomFactor = THREE.MathUtils.clamp(initialZoomFactor * ratio, MIN_ZOOM, MAX_ZOOM);
                dirty = true;
            }
        } else if (activePointers.size === 1 && pointerDown) {
            const dx = e.clientX - lastX, dy = e.clientY - lastY;
            moved += Math.abs(dx) + Math.abs(dy);
            lastX = e.clientX; lastY = e.clientY;
            lastMoveTime = performance.now();
            rotateCube(dx * 0.006, dy * 0.006);

            // Smooth spin velocity calculation (filters out 1-frame release twitches)
            const targetSpinY = dx * 0.006 * 60;
            const targetSpinX = dy * 0.006 * 60;
            spinY = spinY * 0.35 + targetSpinY * 0.65;
            spinX = spinX * 0.35 + targetSpinX * 0.65;
        }
    };
    window.addEventListener('pointermove', window._cubePointerMove);

    function pointerEnd(e) {
        const wasTracking = activePointers.has(e.pointerId);
        if (wasTracking) {
            activePointers.delete(e.pointerId);
            updatePointerCapture(e, false);
        }

        const now = performance.now();

        if (activePointers.size === 1) {
            // Seamlessly transition from 2-finger pinch back to 1-finger drag
            const pts = Array.from(activePointers.values());
            pointerDown = true;
            lastX = pts[0].x;
            lastY = pts[0].y;
            lastMoveTime = now;
            moved = 999; // Prevent accidental strike when releasing one finger from pinch
            initialPinchDist = 0;
            spinX = spinY = 0;
        } else if (activePointers.size >= 2) {
            // Re-baseline pinch distance for remaining pointers
            const pts = Array.from(activePointers.values());
            initialPinchDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
            initialZoomFactor = zoomFactor;
            pointerDown = false;
            spinX = spinY = 0;
        } else {
            initialPinchDist = 0;
            if (pointerDown && wasTracking) {
                pointerDown = false;

                // If finger paused before lifting (>60ms) or micro-dragged, kill inertia
                if (now - lastMoveTime > 60 || moved < 18) {
                    spinX = spinY = 0;
                }

                // Tap threshold set to 18px for touchscreen touch-compression tolerance
                if (moved < 18 && now - downAt < 450) {
                    spinX = spinY = 0;
                    handleTap(e.clientX, e.clientY);
                }
            } else {
                pointerDown = false;
                spinX = spinY = 0;
            }
        }
    }

    if (window._cubePointerUp) window.removeEventListener('pointerup', window._cubePointerUp);
    window._cubePointerUp = pointerEnd;
    window.addEventListener('pointerup', window._cubePointerUp);

    if (window._cubePointerCancel) window.removeEventListener('pointercancel', window._cubePointerCancel);
    window._cubePointerCancel = pointerEnd;
    window.addEventListener('pointercancel', window._cubePointerCancel);

    // Reset pointers if iframe loses focus or receives a blur event
    if (window._cubeBlur) window.removeEventListener('blur', window._cubeBlur);
    window._cubeBlur = () => {
        activePointers.clear();
        pointerDown = false;
        initialPinchDist = 0;
        spinX = spinY = 0;
    };
    window.addEventListener('blur', window._cubeBlur);
    window.CubeCrackerResetInput = window._cubeBlur;

    // Wheel event for desktop mouse scroll zoom
    if (window._cubeWheel) window.removeEventListener('wheel', window._cubeWheel);
    window._cubeWheel = (e) => {
        if (e.cancelable) e.preventDefault();
        const delta = Math.sign(e.deltaY) * 0.05;
        zoomFactor = THREE.MathUtils.clamp(zoomFactor + delta, MIN_ZOOM, MAX_ZOOM);
        dirty = true;
    };
    window.addEventListener('wheel', window._cubeWheel, { passive: false });

    // Global touch listeners to suppress parent iframe container scroll / pull-to-refresh
    if (window._cubeTouchStart) window.removeEventListener('touchstart', window._cubeTouchStart);
    window._cubeTouchStart = (e) => {
        if (e.touches.length > 1 && e.cancelable) e.preventDefault();
    };
    window.addEventListener('touchstart', window._cubeTouchStart, { passive: false });

    if (window._cubeTouchMove) window.removeEventListener('touchmove', window._cubeTouchMove);
    window._cubeTouchMove = (e) => {
        if (e.cancelable) e.preventDefault();
    };
    window.addEventListener('touchmove', window._cubeTouchMove, { passive: false });

    const _scratchNormal = new V3();
    const _scratchToCam = new V3();
    const _scratchCamTarget = new V3();

    function handleTap(x, y) {
        if (gameOver) return;
        if (introProgress < 1.0) return; // ignore hits during intro fly-in
        cubeGroup.updateMatrixWorld(true);
        const rect = canvasHost.getBoundingClientRect();
        ndc.set(((x - rect.left) / rect.width) * 2 - 1, -((y - rect.top) / rect.height) * 2 + 1);
        raycaster.setFromCamera(ndc, camera);
        const targets = [];
        for (const t of treasures) if (t.exposed && !t.collected) targets.push(t.hitMesh);
        if (secretRing && secretRing.exposed && !secretRing.collected) targets.push(secretRing.hitMesh);
        for (const rig of lockRigs) targets.push(rig.hit); // the padlock models
        for (const rig of bandRigs) targets.push(rig.hit); // the metal bands
        if (solidMesh) targets.push(solidMesh);
        const hits = raycaster.intersectObjects(targets, false);
        const hit = hits.length ? hits[0] : null;
        if (hit && hit.object.userData.kind === 'treasure') {
            collect(hit.object.userData.treasure);
            return;
        }
        if (hit && hit.object.userData.kind === 'ring') {
            collectRing();
            return;
        }
        if (currentTool === 'bomb') {
            if (bombUsed) { showToolToast('bombSpent'); return; }
            if (swing || plantedBomb) return; // let the hammer / fuse finish first
            const kind = hit && hit.object.userData.kind;
            if (kind !== 'chunk' && kind !== 'lock' && kind !== 'band') return;
            _scratchNormal.copy(hit.face.normal).transformDirection(hit.object.matrixWorld);
            plantBomb(hit.point.clone(), _scratchNormal.clone());
            return;
        }
        if (currentTool === 'scan') { resonateGems(); return; }
        if (!hit) return;
        if (swing) return; // one swing at a time
        // The solid is one mesh, so the hit reports a triangle index into the merged
        // buffer; find which chunk owns that triangle. Detached chunks are degenerate
        // and can't be hit, so a miss here means nothing strikeable was under the tap.
        const kind = hit.object.userData.kind;
        const onRig = kind === 'lock' || kind === 'band'; // its own model, not a fracture chunk
        const hitChunk = onRig ? null : chunkAtVertex(hit.faceIndex * 3);
        if (!onRig && !hitChunk) return;
        _scratchNormal.copy(hit.face.normal).transformDirection(hit.object.matrixWorld);
        // bias the strike normal toward the camera so the hammer never clips behind
        _scratchToCam.copy(camera.position).sub(hit.point).normalize();
        if (_scratchNormal.dot(_scratchToCam) < 0.15) _scratchNormal.lerp(_scratchToCam, 0.7).normalize();
        startSwing(hit.point.clone(), _scratchNormal, hitChunk);
        if (!swing) return;
        if (kind === 'lock') swing.lock = hit.object.userData.lock;
        else if (kind === 'band') swing.band = hit.object.userData.band;
    }

    // `chunks` stays sorted by vStart (build appends in order, detach only removes),
    // so the owner of a vertex is one binary search away.
    function chunkAtVertex(v) {
        let lo = 0, hi = chunks.length - 1, found = null;
        while (lo <= hi) {
            const mid = (lo + hi) >> 1;
            if (chunks[mid].vStart <= v) { found = chunks[mid]; lo = mid + 1; }
            else hi = mid - 1;
        }
        return found && v < found.vStart + found.vCount ? found : null;
    }

    // ---------- frame loop ----------
    const clock = new THREE.Clock();
    let rafId = 0;
    function tick() {
        rafId = requestAnimationFrame(tick);
        window._cubeRafId = rafId;
        const dt = Math.min(clock.getDelta(), 0.05);
        const time = clock.elapsedTime;

        // Smoothly interpolate time scale. Snap once we're within an imperceptible
        // distance of the target — the lerp only converges asymptotically, so
        // without this `globalTimeScale !== targetTimeScale` below stays true
        // forever after the first slow-mo and render-on-demand never kicks in again.
        const timeScaleDecay = 1 - Math.exp(-8.0 * dt);
        globalTimeScale = THREE.MathUtils.lerp(globalTimeScale, targetTimeScale, timeScaleDecay);
        if (Math.abs(globalTimeScale - targetTimeScale) < 1e-4) globalTimeScale = targetTimeScale;
        const scaledDt = dt * globalTimeScale;

        // Update intro animation - run at normal speed so it is crisp
        if (introProgress < 1.0) {
            const lvl = LEVELS[level];
            const introDurationForLevel = lvl.introDuration || introDuration;
            const introDurationMaxForLevel = lvl.introDurationMax || introDurationForLevel;
            introProgress += dt / introDurationMaxForLevel; // raw dt!
            let finished = false;
            if (introProgress >= 1.0) {
                introProgress = 1.0;
                finished = true;
            }

            const maxSeparation = 15.0 * (LEVELS[level].sizeMul || 1);
            // Chunks share one buffer now, so the fly-in translates each chunk's slice
            // of it rather than moving a mesh. Written against the pristine base copy
            // so the last frame lands exactly on the assembled solid.
            const arr = mergedGeo.attributes.position.array;
            const elapsed = introProgress * introDurationMaxForLevel;
            for (const c of chunks) {
                if (!c.alive) continue;
                const localProgress = THREE.MathUtils.clamp(
                    elapsed / (c.introDuration || introDurationForLevel),
                    0, 1
                );
                const t = quadEaseIn(localProgress);
                const sep = maxSeparation * (1.0 - t);
                const ox = c.separationDir.x * sep, oy = c.separationDir.y * sep, oz = c.separationDir.z * sep;
                const end = (c.vStart + c.vCount) * 3;
                for (let i = c.vStart * 3; i < end; i += 3) {
                    arr[i] = basePositions[i] + ox;
                    arr[i + 1] = basePositions[i + 1] + oy;
                    arr[i + 2] = basePositions[i + 2] + oz;
                }
            }
            mergedGeo.attributes.position.needsUpdate = true;
            dirty = true;

            if (finished) {
                // Play a satisfying soft bounce sound on locking together
                if (window.CubeCrackerAudio) {
                    CubeCrackerAudio.bounce();
                }
                spawnHugeDirtCubes();
                document.body.classList.remove('intro-hide-ui'); // the UI fades back in
                setGemRigVisible(true); // the lock and chains clamp on
                setBandsVisible(true);    // the metal bands clamp on
            }
        }

        // idle drift + inertia
        if (!pointerDown) {
            if (!interacted) {
                if (!reduceMotion) rotateCube(scaledDt * 0.12, 0); // scaledDt!
            } else if (Math.abs(spinX) + Math.abs(spinY) > 0.001) {
                rotateCube(spinY * scaledDt, spinX * scaledDt); // scaledDt!
                const damp = Math.exp(-scaledDt * 3.2); // scaledDt!
                spinX *= damp; spinY *= damp;
            }
        }

        // Elastic squash-and-stretch wobble to the cube on impact!
        if (wobbleAmp > 0.001) {
            wobbleTime += scaledDt * 32; // scaledDt!
            const sY = 1.0 - Math.cos(wobbleTime) * wobbleAmp;
            const sXZ = 1.0 + Math.cos(wobbleTime) * wobbleAmp * 0.5;
            cubeGroup.scale.set(sXZ, sY, sXZ);
            const decayRate = material === 'hive' ? 4.0 : 7.5;
            wobbleAmp *= Math.exp(-scaledDt * decayRate); // scaledDt!
            dirty = true;
        } else {
            cubeGroup.scale.set(1, 1, 1);
        }

        // jolt: the solid shoves at the camera, then springs home
        if (lunge) {
            lunge.t += scaledDt;
            const k = Math.min(lunge.t / lunge.dur, 1);
            const amt = lunge.amp * Math.sin(Math.PI * Math.pow(k, 0.55)) * Math.exp(-2.0 * k);
            cubeGroup.position.copy(lunge.dir).multiplyScalar(amt);
            if (k >= 1) { cubeGroup.position.set(0, 0, 0); lunge = null; }
            dirty = true;
        }

        updatePlantedBomb(dt); // fuse burns in real time, not slow-mo
        if (gemPings.length) updateGemPings(dt); // keep lens pings glued to their gems
        updateSwing(dt); // raw dt for snappy input!
        updateIdleHint(dt);
        updateCollecting(dt); // raw dt for snappy flight!
        updateRingFx(dt);

        // molten: open wounds cooling and crusting over, with lava streaming out of them
        if (moltenWounds.length) updateWounds(scaledDt);
        if (crustTweens.length) updateCrustTweens(scaledDt);
        if (lavaRig && (moltenWounds.length || lavaRig.live)) updateLavaStreams(scaledDt);

        // molten: heated rock erupting on its own, chaining outward from each burst
        if (moltenQueue.length) {
            let erupted = 0;
            const centerW = cubeGroup.localToWorld(_scratchPos.set(0, 0, 0)).clone();
            for (let i = moltenQueue.length - 1; i >= 0; i--) {
                const q = moltenQueue[i];
                q.t -= scaledDt;
                if (q.t > 0) continue;
                moltenQueue.splice(i, 1);
                const c = q.chunk;
                if (!c.alive) continue;
                const wp = cubeGroup.localToWorld(_scratchPos.copy(c.centroid)).clone();
                detachChunk(c, centerW); // blow it straight out from the core
                spawnImpactSparks(wp, 5);
                heatNeighbors(c.centroid, cfg.hitRadius * 0.8, q.gen + 1);
                erupted++;
            }
            if (erupted) {
                const now = performance.now() * 0.001;
                const isRecent = (now - lastEruptionSoundTime) < 0.25;
                lastEruptionSoundTime = now;
                const eruptionVol = isRecent ? 0.3 : 1.0;
                CubeCrackerAudio.thunk(false, eruptionVol);
                if (window.screenShakeEnabled !== false) shake = Math.max(shake, 0.1 * MOTION); if (window.hapticsEnabled !== false && navigator.vibrate) { try { navigator.vibrate(14); } catch (e) { } }
                exposeGems();
                flushMergedUpdates();
            }
        }

        // hive: squashed wax springing back to full size.
        // dragon egg: caved-in shell knitting itself back together — as each piece regrows it
        // seals over whatever gem it was encasing, so the gems are re-checked here too.
        if (hiveSquash.length) {
            updateHiveSquash(scaledDt);
            if (material === 'egg') updateEggGems();
            flushMergedUpdates();
        }

        // hive: honey beads swelling and running off the comb (purely decorative)
        if (honeyRig) updateHoneyDrips(scaledDt);

        // chest: the chain flare fading back down after a blocked strike
        if (chainGlow > 0) {
            chainGlow = Math.max(0, chainGlow - scaledDt * 2.4);
            applyChainGlow();
        }
        // fallen star: the strike flare fading out of the star and the sky behind it
        if (starFlash > 0) {
            starFlash = Math.max(0, starFlash - scaledDt * 3.0);
            fxUniforms.uFlash.value = starFlash * starFlash * 1.5;
            applyStarLight(); // the flare rides on top of whatever light is left
        }
        // fallen star: the light dies between blows, taking the shell seams with it
        if (material === 'star' && (starLight > 0 || starOutlineLight > 0) && !gameOver) {
            starLight = Math.max(0, starLight - scaledDt * STAR_DIM_RATE);
            starOutlineLight = Math.max(0, starOutlineLight - scaledDt * STAR_OUTLINE_RATE);
            applyStarLight();
            if (!starWasDark && starLight < 0.28 && collectedCount === 0 && !revealedOnce) {
                starWasDark = true;
                setHint('starDarkHint');
            }
        }
        if (chainFlights.length) updateChainFly(scaledDt);
        // chest: a padlock rocking on its mount after a hit
        for (const rig of lockRigs) {
            if (rig.shake <= 0) continue;
            rig.shake = Math.max(0, rig.shake - scaledDt * 3.6);
            const a = rig.shake * 0.26;
            rig.group.rotation.z = Math.sin(time * 58) * a;
            rig.group.position.copy(rig.home);
            rig.group.position.x += Math.sin(time * 71) * a * 0.12;
            dirty = true;
        }
        // pillar & clockwork: metal bands / gear shuddering on hit, or ticking forward
        for (const rig of bandRigs) {
            if (rig.gear) {
                rig.tickTimer += scaledDt;
                if (rig.tickTimer >= 1.0) {
                    rig.tickTimer = 0;
                    rig.fromAngle = rig.targetAngle;
                    rig.targetAngle += rig.stepAngle;
                }
                const tickDur = 0.22;
                if (rig.tickTimer < tickDur) {
                    const u = rig.tickTimer / tickDur;
                    const angle = rig.fromAngle + (rig.targetAngle - rig.fromAngle) * easeOutBack(u);
                    rig.mesh.rotation.y = angle;
                    rig.hit.rotation.y = angle;
                } else {
                    rig.mesh.rotation.y = rig.targetAngle;
                    rig.hit.rotation.y = rig.targetAngle;
                }
                dirty = true;
            }
            if (rig.shake <= 0) continue;
            rig.shake = Math.max(0, rig.shake - scaledDt * 4.2);
            const a = rig.shake * 0.055;
            rig.mesh.position.copy(rig.home);
            rig.mesh.position.x += Math.sin(time * 74) * a;
            rig.mesh.position.z += Math.cos(time * 61) * a;
            rig.mat.emissiveIntensity = rig.shake * 2.6;
            dirty = true;
        }

        // debris ballistics - scaledDt!
        for (let i = debris.length - 1; i >= 0; i--) {
            const d = debris[i];
            d.life += scaledDt;
            d.vel.y -= cfg.debrisGravity * scaledDt;
            d.mesh.position.addScaledVector(d.vel, scaledDt);
            d.mesh.rotation.x += d.ang.x * scaledDt;
            d.mesh.rotation.y += d.ang.y * scaledDt;
            d.mesh.rotation.z += d.ang.z * scaledDt;
            const k = d.life / d.maxLife;
            if (k > 0.55) {
                const f = 1 - (k - 0.55) / 0.45;
                // padlock pieces keep their own metal; rock uses the shared fade ring
                if (d.own) d.mesh.material.opacity = f;
                else d.mesh.material = debrisMatFor(f); // shared, quantized — never allocates
                d.mesh.scale.setScalar(Math.max(f, 0.01));
            }
            if (k >= 1 || d.mesh.position.y < -6) {
                debrisGroup.remove(d.mesh);
                d.mesh.geometry.dispose();
                if (d.own) d.mesh.material.dispose();
                debris.splice(i, 1);
            }
        }

        // dust - scaledDt!
        for (let i = dusts.length - 1; i >= 0; i--) {
            const du = dusts[i];
            du.life += scaledDt;
            const arr = du.points.geometry.attributes.position.array;
            for (let j = 0; j < du.vels.length; j++) {
                const v = du.vels[j];
                v.y -= 2.5 * scaledDt;
                arr[j * 3] += v.x * scaledDt; arr[j * 3 + 1] += v.y * scaledDt; arr[j * 3 + 2] += v.z * scaledDt;
            }
            du.points.geometry.attributes.position.needsUpdate = true;
            du.points.material.size = Math.max(0.11 * (1 - du.life / 0.55), 0.0001);
            if (du.life >= 0.55) {
                ParticlePools.dusts.release(du);
                dusts.splice(i, 1);
            }
        }

        // cube dusts - scaledDt!
        for (let i = cubeDusts.length - 1; i >= 0; i--) {
            const cd = cubeDusts[i];
            cd.life += scaledDt;
            cd.vel.multiplyScalar(Math.exp(-scaledDt * 0.8));
            cd.mesh.position.addScaledVector(cd.vel, scaledDt);
            cd.mesh.rotation.x += cd.ang.x * scaledDt;
            cd.mesh.rotation.y += cd.ang.y * scaledDt;
            cd.mesh.rotation.z += cd.ang.z * scaledDt;

            const k = cd.life / cd.maxLife;
            cd.mesh.scale.setScalar(Math.max(cd.startScale * (1 - k), 0.0001));
            if (k >= 1.0) {
                ParticlePools.cubeDusts.release(cd);
                cubeDusts.splice(i, 1);
            }
        }

        // sparkles - scaledDt!
        for (let i = sparkles.length - 1; i >= 0; i--) {
            const sp = sparkles[i];
            sp.life += scaledDt;
            const arr = sp.points.geometry.attributes.position.array;
            arr[0] += sp.vel.x * scaledDt;
            arr[1] += sp.vel.y * scaledDt;
            arr[2] += sp.vel.z * scaledDt;
            sp.points.geometry.attributes.position.needsUpdate = true;
            const k = sp.life / sp.maxLife;
            sp.points.material.opacity = 1.0 - k;
            if (k >= 1.0) {
                ParticlePools.sparkles.release(sp);
                sparkles.splice(i, 1);
            }
        }

        // shockwaves - scaledDt!
        for (let i = activeShockwaves.length - 1; i >= 0; i--) {
            const sw = activeShockwaves[i];
            sw.life += scaledDt;
            const k = sw.life / 0.25;
            if (k >= 1.0) {
                fxGroup.remove(sw.mesh);
                shockwavePool.push(sw.mesh);
                activeShockwaves.splice(i, 1);
            } else {
                const scale = 1 + k * 8.0;
                sw.mesh.scale.set(scale, scale, 1);
                sw.mesh.material.opacity = 0.8 * (1 - k);
            }
        }

        // flashes - scaledDt!
        for (let i = activeFlashes.length - 1; i >= 0; i--) {
            const fl = activeFlashes[i];
            fl.life += scaledDt;
            const k = fl.life / 0.16;
            if (k >= 1.0) {
                fxGroup.remove(fl.light);
                flashLightPool.push(fl.light);
                activeFlashes.splice(i, 1);
            } else {
                fl.light.intensity = 6 * (1 - k);
            }
        }

        // gems - scaledDt!
        for (const t of treasures) {
            if (t.collected) continue;
            const isExposedOrIntro = t.exposed || (introProgress < 1.0);
            t.gem.rotation.y += scaledDt * t.spin * (isExposedOrIntro ? 2.2 : 0.6);
            if (isExposedOrIntro) {
                if (t.revealFlash === undefined) t.revealFlash = 0;
                if (t.revealFlash > 0) {
                    t.revealFlash -= scaledDt * 2.5; // decay over ~0.4s
                    if (t.revealFlash < 0) t.revealFlash = 0;
                }

                const pulse = 0.62 + 0.26 * Math.sin(time * 4 + t.spin * 10);
                const opacityMul = t.exposed ? 1.0 : 0.6; // slightly softer glow during intro
                t.sprite.material.opacity = pulse * opacityMul;

                // Apply beautiful scale pop when first revealed!
                const scalePop = 1.0 + (t.revealFlash || 0) * 0.7;
                t.sprite.scale.setScalar((0.85 + 0.12 * Math.sin(time * 4 + t.spin * 10)) * scalePop);

                // Dynamic light and emissive boost on reveal (Glow Pop)
                t.gem.material.emissiveIntensity = 1.7 + (t.revealFlash || 0) * 6.5;
                t.light.intensity = (1.4 + 0.7 * pulse) * (1.0 + (t.revealFlash || 0) * 3.5) * opacityMul;

                t.gem.position.y = 0.03 * Math.sin(time * 2.2 + t.spin * 10);
            } else {
                // gems glow at 65% strength when not yet unearthed
                const pulse = 0.62 + 0.26 * Math.sin(time * 4 + t.spin * 10);
                const strength = 0.65;
                t.sprite.material.opacity = pulse * strength * 0.5; // softer sprite opacity when hidden in rock
                t.sprite.scale.setScalar(0.72 + 0.1 * Math.sin(time * 4 + t.spin * 10));
                t.gem.material.emissiveIntensity = 1.7 * strength;
                t.light.intensity = (1.4 + 0.7 * pulse) * strength;
                t.gem.position.set(0, 0, 0); // keep at center when buried
            }
        }

        // the secret ring, once the rock is off it: turning slowly, glowing gold
        if (secretRing && secretRing.exposed && !secretRing.collected) {
            const r = secretRing;
            if (r.flash > 0) r.flash = Math.max(0, r.flash - scaledDt * 2.5);
            r.mesh.rotation.y += scaledDt * 1.9;
            const pulse = 0.55 + 0.3 * Math.sin(time * 5);
            r.sprite.material.opacity = Math.min(0.55, pulse * 0.5 * (1 + r.flash));
            r.sprite.scale.setScalar((0.46 + 0.06 * Math.sin(time * 5)) * (1 + r.flash * 0.5));
            r.light.intensity = (0.45 + 0.25 * pulse) * (1 + r.flash * 1.6);
            r.mesh.scale.setScalar(1 + r.flash * 0.25);
        }

        // ---- dynamic internal glow ----
        if (coreGlowLight && totalChunkCount > 0) {
            const alive = chunks.length;
            if (alive !== lastAliveCount) {
                updateCoreGlow();
            }
            // Gem-reveal surge: the light floods the scene briefly, then fades
            // back to the chunk-based intensity.
            if (coreGlowSurge > 0) {
                coreGlowSurge = Math.max(0, coreGlowSurge - scaledDt * 2.5);
                coreGlowLight.intensity = Math.max(coreGlowLight.intensity, coreGlowSurge * 3.0);
                dirty = true;
                if (coreGlowSurge <= 0) {
                    updateCoreGlow(true);
                }
            }
        }

        // camera shake & kick
        if (kick > 0.001) {
            kick *= Math.exp(-dt * 10.0);
        } else {
            kick = 0;
        }
        const targetCamPos = _scratchCamTarget.copy(camBase).multiplyScalar(zoomFactor + kick);
        const camDecay = 1 - Math.exp(-24.0 * dt);
        camera.position.lerp(targetCamPos, camDecay);
        if (shake > 0.001) {
            camera.position.x += (Math.random() - 0.5) * shake;
            camera.position.y += (Math.random() - 0.5) * shake;
            camera.position.z += (Math.random() - 0.5) * shake * 0.4;
            shake *= Math.exp(-dt * 14);
        }
        camera.lookAt(CAM_LOOK);

        // render-on-demand
        const animating = swing || debris.length || dusts.length || cubeDusts.length || sparkles.length || activeShockwaves.length || activeFlashes.length || collecting.length ||
            moltenQueue.length || moltenWounds.length || crustTweens.length || (lavaRig && lavaRig.live) ||
            hiveSquash.length || honeyRig || lunge || chainGlow > 0 || starFlash > 0 ||
            (material === 'star' && (starLight > 0 || starOutlineLight > 0)) || chainFlights.length ||
            lockRigs.some((r) => r.shake > 0) || bandRigs.some((r) => r.shake > 0) ||
            shake > 0.001 || kick > 0.001 || (Math.abs(spinX) + Math.abs(spinY) > 0.001) ||
            treasures.some((t) => t.exposed && !t.collected) ||
            ringFx || (secretRing && secretRing.exposed && !secretRing.collected) ||
            globalTimeScale !== targetTimeScale;
        if (dirty || animating) {
            renderer.render(scene, camera);
            dirty = false;
        }
    }


    // Reset input state on blur or tab switch to prevent stuck dragging/striking.
    // CubeCrackerResetInput is the canonical reset (it also clears activePointers and
    // the pinch baseline), so just delegate — the copy that used to live here also
    // assigned two variables that were never declared anywhere.
    const handleInputBlur = () => {
        if (window.CubeCrackerResetInput) window.CubeCrackerResetInput();
    };
    window.addEventListener('blur', handleInputBlur);

    // ---------- misc wiring (Container-Scoped ResizeObserver + Fallback) ----------
    if (window.ResizeObserver && canvasHost) {
        if (window._cubeRo) window._cubeRo.disconnect();
        window._cubeRo = new ResizeObserver(() => updateSize());
        window._cubeRo.observe(canvasHost);
    } else {
        if (window._cubeResize) window.removeEventListener('resize', window._cubeResize);
        window._cubeResize = updateSize;
        window.addEventListener('resize', window._cubeResize);
    }

    if (window._cubeOrientation) window.removeEventListener('orientationchange', window._cubeOrientation);
    window._cubeOrientation = updateSize;
    window.addEventListener('orientationchange', window._cubeOrientation);

    // block iOS pinch-zoom / double-tap-zoom that would fight the canvas gestures
    if (window._cubeGestureStart) document.removeEventListener('gesturestart', window._cubeGestureStart);
    window._cubeGestureStart = (e) => { if (e.cancelable) e.preventDefault(); };
    document.addEventListener('gesturestart', window._cubeGestureStart);

    if (window._cubeGestureChange) document.removeEventListener('gesturechange', window._cubeGestureChange);
    window._cubeGestureChange = (e) => { if (e.cancelable) e.preventDefault(); };
    document.addEventListener('gesturechange', window._cubeGestureChange);

    if (window._cubeGestureEnd) document.removeEventListener('gestureend', window._cubeGestureEnd);
    window._cubeGestureEnd = (e) => { if (e.cancelable) e.preventDefault(); };
    document.addEventListener('gestureend', window._cubeGestureEnd);

    if (window._cubeDblClick) document.removeEventListener('dblclick', window._cubeDblClick);
    window._cubeDblClick = (e) => { if (e.cancelable) e.preventDefault(); };
    document.addEventListener('dblclick', window._cubeDblClick);

    // Interstitials belong at level transitions, not during active play. The bridge
    // resolves false on a missing, failed, skipped, or timed-out ad, so progression
    // must continue in every case.
    let levelTransitioning = false;
    // The ad pause and the host pause are separate, overlapping claims on the same
    // loop: the portal fires its own onPause over an interstitial, and the player can
    // background the game while one is up. Each side tracks its own flag and neither
    // resumes while the other still holds the game down, so a request that fails or
    // hits its watchdog behind a backgrounded host cannot restart the simulation (and
    // the music) under a host that believes the game is paused.
    function showLevelInterstitial() {
        const sdk = window.GameSDK;
        if (!sdk || typeof sdk.showAd !== 'function' || typeof sdk.supports !== 'function' ||
            !sdk.supports('interstitial')) {
            return Promise.resolve(false);
        }

        if (adInFlight) return Promise.resolve(false);
        setAdInFlight(true);

        const resumeAfterAd = () => {
            if (adPausedOwner !== 'interstitial') return;
            adPausedOwner = null;
            // Always released, even under a host pause — the audio layer holds the
            // context down for as long as the 'host' hold is outstanding.
            if (window.CubeCrackerAudio && window.CubeCrackerAudio.resumeFromVisibility) {
                window.CubeCrackerAudio.resumeFromVisibility('ad');
            }
            if (hostPaused) return; // the host still has us backgrounded
            startLoop();
        };
        const pauseForAd = () => {
            if (adPausedOwner) return;
            adPausedOwner = 'interstitial';
            handleInputBlur();
            if (window.CubeCrackerAudio && window.CubeCrackerAudio.pauseForVisibility) {
                window.CubeCrackerAudio.pauseForVisibility('ad');
            }
            stopLoop();
        };

        return new Promise((resolve) => {
            let adResolved = false;
            const adTimeout = setTimeout(() => {
                if (adResolved) return;
                adResolved = true;
                resumeAfterAd();
                setAdInFlight(false);
                resolve(false);
            }, 10000);

            try {
                sdk.showAd('midgame', {
                    onStarted: () => {
                        clearTimeout(adTimeout);
                        pauseForAd();
                    },
                    onFinished: () => {
                        clearTimeout(adTimeout);
                        if (adResolved) return;
                        adResolved = true;
                        resumeAfterAd();
                        setAdInFlight(false);
                        resolve(true);
                    },
                    onError: () => {
                        clearTimeout(adTimeout);
                        if (adResolved) return;
                        adResolved = true;
                        resumeAfterAd();
                        setAdInFlight(false);
                        resolve(false);
                    },
                });
            } catch (e) {
                clearTimeout(adTimeout);
                if (!adResolved) {
                    adResolved = true;
                    resumeAfterAd();
                    setAdInFlight(false);
                    resolve(false);
                }
            }
        });
    }

    function goToLevelWithInterstitial(nextLevel) {
        if (levelTransitioning || adInFlight) return;
        levelTransitioning = true;
        const loadNextLevel = () => {
            level = nextLevel;
            build();
        };
        showLevelInterstitial().then(loadNextLevel, loadNextLevel).then(
            () => { requestAnimationFrame(() => { levelTransitioning = false; }); },
            () => { requestAnimationFrame(() => { levelTransitioning = false; }); }
        );
    }

    // Handle the tap directly on pointerup rather than waiting for the browser to
    // synthesize a 'click' afterward — touch-to-click synthesis is the flaky link on
    // some mobile browsers/webviews (especially under touch-action:none ancestors),
    // which is what made this button unresponsive to taps. preventDefault() on
    // pointerup stops the trailing synthetic click so the handler only runs once;
    // 'click' is kept too so keyboard (Enter/Space) activation still works, since
    // that path fires click directly with no pointer events at all.
    function nextTrial(e) {
        if (e) e.preventDefault();
        const nextLevel = (level + 1) % LEVELS.length;
        goToLevelWithInterstitial(nextLevel);
    }
    hud.again.addEventListener('pointerup', nextTrial);
    hud.again.addEventListener('click', nextTrial);

    // Level select bridge (called by the LEVELS button overlay)
    window.CubeCrackerGoToLevel = (i) => {
        if (typeof i !== 'number' || i < 0 || i >= LEVELS.length) return;
        goToLevelWithInterstitial(i);
    };
    const restartGameBtn = document.getElementById('restartGame');
    if (restartGameBtn) {
        restartGameBtn.addEventListener('pointerup', nextTrial);
        restartGameBtn.addEventListener('click', nextTrial);
    }

    // Warm up the renderer: pre-compiles all materials and shader programs before
    // gameplay begins so the first hammer strike, impact particles, shockwaves, and
    // debris detachment execute without any GPU compilation hitches.
    function warmupRender() {
        // 1. Point light compilation (re-links lit materials for dynamic point lights)
        const l = new THREE.PointLight(0xffd9a0, 0.0001, 3.2, 2);
        l.position.set(0, 0, HALF + 0.5);
        fxGroup.add(l);

        // 2. Hammer & ghost hammer meshes (MeshStandardMaterial & LineBasicMaterial)
        const prevHammerVis = hammer ? hammer.visible : false;
        const prevGhostVis = ghostHammer ? ghostHammer.visible : false;
        if (hammer) hammer.visible = true;
        if (ghostHammer) ghostHammer.visible = true;

        // 3. Shockwave materials (MeshBasicMaterial with additive blending)
        const swMeshes = [];
        if (typeof shockwaveGeo !== 'undefined') {
            if (typeof shockwaveMatIce !== 'undefined') swMeshes.push(new THREE.Mesh(shockwaveGeo, shockwaveMatIce));
            if (typeof shockwaveMatRock !== 'undefined') swMeshes.push(new THREE.Mesh(shockwaveGeo, shockwaveMatRock));
            if (typeof shockwaveMatObsidian !== 'undefined') swMeshes.push(new THREE.Mesh(shockwaveGeo, shockwaveMatObsidian));
            swMeshes.forEach((m, idx) => {
                m.position.set((idx - 1) * 0.15, 0, HALF + 0.1);
                fxGroup.add(m);
            });
        }

        // 4. Debris mesh (MeshStandardMaterial with vertexColors + custom onBeforeCompile chunk)
        let dummyDebris = null;
        let dummyDebrisGeo = null;
        if (typeof sharedDebrisMat !== 'undefined') {
            dummyDebrisGeo = new THREE.BoxGeometry(0.05, 0.05, 0.05);
            dummyDebris = new THREE.Mesh(dummyDebrisGeo, sharedDebrisMat);
            dummyDebris.position.set(0, 0, HALF + 0.2);
            debrisGroup.add(dummyDebris);
        }

        // 5. Particle pools (dusts, cubeDusts, sparkles)
        const warmPos = new V3(0, 0, HALF);
        const warmNorm = new V3(0, 0, 1);
        if (typeof spawnDust === 'function') spawnDust(warmPos, warmNorm);
        if (typeof spawnCubeDust === 'function') spawnCubeDust(warmPos, warmNorm);
        if (typeof spawnImpactSparks === 'function') spawnImpactSparks(warmPos, 2);

        // 6. Pre-compile all scene shaders and render warm frame
        if (renderer.compile) {
            try { renderer.compile(scene, camera); } catch (e) { }
        }
        renderer.render(scene, camera);

        // 7. Tear down warmup objects cleanly in the same turn
        fxGroup.remove(l);
        if (hammer) hammer.visible = prevHammerVis;
        if (ghostHammer) ghostHammer.visible = prevGhostVis;
        swMeshes.forEach(m => fxGroup.remove(m));
        if (dummyDebris) {
            debrisGroup.remove(dummyDebris);
            dummyDebrisGeo.dispose();
        }

        if (ParticlePools.dusts) {
            ParticlePools.dusts.releaseAll();
            dusts.length = 0;
        }
        if (ParticlePools.cubeDusts) {
            ParticlePools.cubeDusts.releaseAll();
            cubeDusts.length = 0;
        }
        if (ParticlePools.sparkles) {
            ParticlePools.sparkles.releaseAll();
            sparkles.length = 0;
        }

        // Present a clean initial frame
        renderer.render(scene, camera);
    }

    // Loop lifecycle: don't burn CPU/GPU/battery while the tab is hidden. On resume,
    // discard the elapsed time so the physics doesn't jump by a huge dt.
    if (window._cubeRafId) {
        cancelAnimationFrame(window._cubeRafId);
        window._cubeRafId = null;
    }

    function startLoop() {
        if (rafId) return;
        clock.getDelta();
        dirty = true; // repaint current state on resume
        rafId = requestAnimationFrame(tick);
        window._cubeRafId = rafId;
    }
    function stopLoop() {
        if (!rafId) return;
        cancelAnimationFrame(rafId);
        rafId = 0;
        window._cubeRafId = null;
    }

    // Backgrounding is the host's call, not something this game detects for
    // itself: the portal bridge delivers it (see bootPlatform below). Don't burn
    // CPU/GPU/battery while paused, and discard the elapsed time on resume so the
    // physics doesn't jump by a huge dt.
    function hostPause() {
        hostPaused = true;
        handleInputBlur();
        if (window.CubeCrackerAudio && window.CubeCrackerAudio.pauseForVisibility) {
            window.CubeCrackerAudio.pauseForVisibility('host');
        }
        stopLoop();
        // Last chance to get progress out before the player is gone.
        if (window.persistGameState) window.persistGameState({ immediate: true });
    }

    function hostResume() {
        hostPaused = false;
        if (window.CubeCrackerAudio && window.CubeCrackerAudio.resumeFromVisibility) {
            window.CubeCrackerAudio.resumeFromVisibility('host');
        }
        // An ad break outlives this signal on portals that resume the game the moment
        // the ad closes: leave the loop stopped and let the ad's own resume start it,
        // which is the path that also loads the next level.
        if (adPausedOwner) return;
        startLoop();
    }

    // WebGL context can be lost (GPU reset, tab backgrounded on mobile). Allow the
    // browser to restore it, then rebuild GPU resources and resume.
    if (window._cubeContextLost) {
        renderer.domElement.removeEventListener('webglcontextlost', window._cubeContextLost, false);
    }
    window._cubeContextLost = (e) => {
        e.preventDefault();
        stopLoop();
    };
    renderer.domElement.addEventListener('webglcontextlost', window._cubeContextLost, false);

    if (window._cubeContextRestored) {
        renderer.domElement.removeEventListener('webglcontextrestored', window._cubeContextRestored, false);
    }
    window._cubeContextRestored = () => {
        build();
        warmupRender();
        startLoop();
    };
    renderer.domElement.addEventListener('webglcontextrestored', window._cubeContextRestored, false);

    window.run = function (mode) {
        // Game entry point
    };

    build();
    warmupRender();
    CubeCrackerAudio.warm();
    startLoop();
    window.run('play');

    // Fade out the loading screen once the scene is built and warmed. Wait for the
    // web font too (so the title doesn't pop), with a short floor so a fast load
    // still shows the screen briefly instead of flickering.
    (function revealWhenReady() {
        const loader = document.getElementById('loader');
        if (!loader) return;
        const fontsReady = (document.fonts && document.fonts.ready) || Promise.resolve();
        Promise.resolve(fontsReady).then(() => {
            const wait = Math.max(0, 500 - performance.now());
            setTimeout(() => {
                loader.classList.add('hidden');
                setTimeout(() => loader.remove(), 650);
            }, wait);
        });
    })();

    // ---------- portal bridge ----------
    // The game above boots synchronously so the first frame paints as early as
    // possible; this attaches the portal to the already-running game once its SDK
    // answers the handshake. Everything here is optional — a dead or absent portal
    // leaves a fully playable game, it just doesn't persist or take host signals.
    (async function bootPlatform() {
        const sdk = window.GameSDK;
        if (!sdk) return;

        // Never let a slow platform call hold the loading UI up forever. init()
        // already guarantees this for itself; the storage read does not.
        const withTimeout = (p, ms, fallback) => Promise.race([
            Promise.resolve(p).catch(() => fallback),
            new Promise((res) => setTimeout(() => res(fallback), ms)),
        ]);

        await sdk.init();

        // The first frame painted during the synchronous boot above, so this is
        // already true by the time we get here. It MUST precede loadingStop().
        sdk.firstFrameReady();

        // Host lifecycle. Registered after init(), because the adapter ignores
        // subscriptions taken before the handshake resolves.
        sdk.onPause(hostPause);
        sdk.onResume(hostResume);

        // Host audio state, now and on every change. The in-game sliders trim
        // underneath this and can never override it.
        if (window.CubeCrackerAudio && window.CubeCrackerAudio.setHostAudioEnabled) {
            window.CubeCrackerAudio.setHostAudioEnabled(sdk.isAudioEnabled());
            sdk.onAudioEnabledChange((on) => window.CubeCrackerAudio.setHostAudioEnabled(on));
        }

        // Saved records and options. applySavedState merges rather than replaces,
        // so anything achieved in the seconds before this landed survives; calling
        // it with null on failure still flips the gate that lets writes through.
        const saved = await withTimeout(sdk.loadJSON(), 5000, null);
        window.applySavedState(saved);

        // Re-assert the ranked value for a returning player, in case an earlier
        // submission never reached the platform. Nothing to say for a new one.
        if (window.totalStars(window.bestScores) > 0) window.submitStarScore();

        // Locale from the platform SDK (single source of truth per Playables requirements)
        const tag = await withTimeout(sdk.getLanguage(), 3000, 'en');
        window.setGameLanguage(normalizeLocale(tag));

        // Genuinely interactive AND showing the player's real data: dismiss the
        // platform's loading UI.
        sdk.loadingStop();
    })();

    // debug hook (harmless in production)
    window.CUBE_DEBUG = {
        tap: handleTap,
        tier: () => gpuTier(),
        alive: () => chunks.filter((c) => c.alive).length,
        state: () => ({ swing: !!swing, strikes, pointerDown, interacted }),
        coreGlow: () => coreGlowLight ? { i: coreGlowLight.intensity.toFixed(3), c: coreGlowLight.color.getHexString(), s: coreGlowSurge } : null,
    };
})();

