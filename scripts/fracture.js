// Gems in the cube - Voronoi fracture of a convex solid into irregular convex chunks (NOT voxels).
// Each chunk is the Voronoi cell of a random seed point, computed by clipping
// the solid polyhedron with bisector half-spaces against neighboring seeds.
// The pipeline is shape-agnostic: any convex polyhedron (cube, cylinder, pyramid…)
// works — see CubeCrackerFracture.shapes.
(function () {
    const V3 = THREE.Vector3;
    const EPS = 1e-6;

    // ---- convex polyhedron as a list of faces (each face = array of V3, any winding;
    // winding is fixed later against the cell centroid) ----

    function cloneFaces(faces) {
        return faces.map((f) => f.map((p) => p.clone()));
    }

    // Clip polyhedron, keeping the region where dot(v, n) <= d.
    function clipPolyhedron(faces, n, d) {
        const out = [];
        const capPts = [];
        for (const face of faces) {
            const kept = [];
            for (let i = 0; i < face.length; i++) {
                const a = face[i];
                const b = face[(i + 1) % face.length];
                const da = a.dot(n) - d;
                const db = b.dot(n) - d;
                if (da <= EPS) kept.push(a);
                // A vertex sitting exactly on the clip plane is a corner of the cap
                // face as well as the kept faces. Collect it too, otherwise a clip
                // plane that passes through an existing vertex (very common when
                // building the faceted orb / hive balls) leaves the cap unsealed and
                // the solid renders with an open gap.
                if (Math.abs(da) <= EPS) capPts.push(a);
                if ((da < -EPS && db > EPS) || (da > EPS && db < -EPS)) {
                    const t = da / (da - db);
                    const p = new V3().lerpVectors(a, b, t);
                    kept.push(p);
                    capPts.push(p);
                }
            }
            if (kept.length >= 3) out.push(kept);
        }
        // Build the cap face on the clip plane.
        if (capPts.length >= 3) {
            const uniq = [];
            for (const p of capPts) {
                let dup = false;
                for (const q of uniq) {
                    if (Math.abs(p.x - q.x) < 1e-5 && Math.abs(p.y - q.y) < 1e-5 && Math.abs(p.z - q.z) < 1e-5) { dup = true; break; }
                }
                if (!dup) uniq.push(p);
            }
            if (uniq.length >= 3) {
                const c = new V3();
                for (const p of uniq) c.add(p);
                c.multiplyScalar(1 / uniq.length);
                // basis on the plane
                let u = new V3(1, 0, 0);
                if (Math.abs(n.x) > 0.9) u = new V3(0, 1, 0);
                u.crossVectors(n, u).normalize();
                const v = new V3().crossVectors(n, u);
                const angles = new Map();
                for (let i = 0; i < uniq.length; i++) {
                    const p = uniq[i];
                    const dx = p.x - c.x, dy = p.y - c.y, dz = p.z - c.z;
                    angles.set(p, Math.atan2(dx * v.x + dy * v.y + dz * v.z, dx * u.x + dy * u.y + dz * u.z));
                }
                uniq.sort((p1, p2) => angles.get(p1) - angles.get(p2));
                out.push(uniq);
            }
        }
        return out;
    }

    // Farthest vertex of a polyhedron from a point. Used to prove a bisector plane can no
    // longer cut a cell: if the plane sits at least this far from the seed, everything in
    // the cell already satisfies it, so (with bisectors sorted nearest-first) we can stop.
    function cellRadius(faces, c) {
        let m = 0;
        for (const f of faces) for (const p of f) {
            const d = p.distanceToSquared(c);
            if (d > m) m = d;
        }
        return Math.sqrt(m);
    }

    function faceNewellNormal(f) {
        const n = new V3();
        for (let i = 0; i < f.length; i++) {
            const a = f[i], b = f[(i + 1) % f.length];
            n.x += (a.y - b.y) * (a.z + b.z);
            n.y += (a.z - b.z) * (a.x + b.x);
            n.z += (a.x - b.x) * (a.y + b.y);
        }
        return n.normalize();
    }

    // Derive outward-facing boundary planes {n, d} from a convex polyhedron's faces.
    // A point p is inside iff p·n <= d for every plane.
    function planesFromFaces(faces) {
        const center = new V3();
        let nv = 0;
        for (const f of faces) for (const p of f) { center.add(p); nv++; }
        center.multiplyScalar(1 / nv);
        const planes = [];
        for (const f of faces) {
            let n = faceNewellNormal(f);
            const fc = new V3();
            for (const p of f) fc.add(p);
            fc.multiplyScalar(1 / f.length);
            if ((fc.x - center.x) * n.x + (fc.y - center.y) * n.y + (fc.z - center.z) * n.z < 0) n = n.negate(); // orient outward
            planes.push({ n, d: fc.dot(n) });
        }
        return planes;
    }

    function containsFn(planes) {
        return (p) => {
            for (const pl of planes) if (p.x * pl.n.x + p.y * pl.n.y + p.z * pl.n.z > pl.d + 1e-4) return false;
            return true;
        };
    }

    // Poisson-ish rejection sampling of seed points inside the solid's bounding box,
    // rejecting any that fall outside the solid.
    function sampleSeeds(bound, count, minDist, rng, contains) {
        const seeds = [];
        let guard = 0;
        while (seeds.length < count && guard < count * 600) {
            guard++;
            const p = new V3(
                (rng() * 2 - 1) * bound.x * 0.97,
                (rng() * 2 - 1) * bound.y * 0.97,
                (rng() * 2 - 1) * bound.z * 0.97
            );
            if (!contains(p)) continue;
            let ok = true;
            for (const s of seeds) {
                if (s.distanceToSquared(p) < minDist * minDist) { ok = false; break; }
            }
            if (ok) seeds.push(p);
        }
        return seeds;
    }

    // Is this chunk face part of the original solid's outer surface?
    // (coplanar with one of the solid's boundary planes)
    function isSurfaceFace(faceNormal, faceCentroid, planes) {
        for (const pl of planes) {
            if (Math.abs(faceNormal.dot(pl.n)) > 1 - 1e-3 &&
                Math.abs(faceCentroid.dot(pl.n) - pl.d) < 1e-3) {
                return true;
            }
        }
        return false;
    }

    // Build a BufferGeometry (centroid-relative, flat-shaded, vertex-colored).
    function buildChunkGeometry(faces, planes, outerCol, innerCol, tint) {
        // centroid = average of all face vertices
        const centroid = new V3();
        let nv = 0;
        for (const f of faces) for (const p of f) { centroid.add(p); nv++; }
        centroid.multiplyScalar(1 / nv);

        const pos = [];
        const col = [];
        for (const f of faces) {
            // orient winding outward (away from centroid)
            const fn = faceNewellNormal(f);
            const fc = new V3();
            for (const p of f) fc.add(p);
            fc.multiplyScalar(1 / f.length);
            const face = ((fc.x - centroid.x) * fn.x + (fc.y - centroid.y) * fn.y + (fc.z - centroid.z) * fn.z) < 0 ? f.slice().reverse() : f;

            // surface face? (lies on the original solid boundary)
            const an = faceNewellNormal(face);
            const c = isSurfaceFace(an, fc, planes) ? outerCol : innerCol;
            const r = c[0] * tint, g = c[1] * tint, b = c[2] * tint;

            for (let i = 1; i < face.length - 1; i++) {
                const tri = [face[0], face[i], face[i + 1]];
                for (const p of tri) {
                    pos.push(p.x - centroid.x, p.y - centroid.y, p.z - centroid.z);
                    col.push(r, g, b);
                }
            }
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
        geo.computeVertexNormals(); // flat shading handles facets; normals still needed
        return { geometry: geo, centroid };
    }

    // Non-convex solids (heart, star) fracture through a convex decomposition: each
    // convex piece is clipped independently and the surviving pieces are merged into
    // one chunk. Merging after the fact matters — every face must be wound against its
    // own piece's centroid, so a single shared centroid would flip concave faces.
    function buildChunkGeometryMulti(faceSets, planes, outerCol, innerCol, tint) {
        const parts = faceSets.map((fs) => buildChunkGeometry(fs, planes, outerCol, innerCol, tint));
        let total = 0;
        const centroid = new V3();
        for (const part of parts) {
            const n = part.geometry.attributes.position.count;
            centroid.addScaledVector(part.centroid, n);
            total += n;
        }
        if (total === 0) return null;
        centroid.multiplyScalar(1 / total);
        const pos = [];
        const col = [];
        for (const part of parts) {
            const pa = part.geometry.attributes.position.array;
            const ca = part.geometry.attributes.color.array;
            const ox = part.centroid.x - centroid.x;
            const oy = part.centroid.y - centroid.y;
            const oz = part.centroid.z - centroid.z;
            for (let i = 0; i < pa.length; i += 3) {
                pos.push(pa[i] + ox, pa[i + 1] + oy, pa[i + 2] + oz);
                col.push(ca[i], ca[i + 1], ca[i + 2]);
            }
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
        geo.computeVertexNormals();
        return { geometry: geo, centroid };
    }

    // ---- shape descriptors ----
    // Each returns { faces, planes, contains, bound, volume, pieces } for a solid,
    // sized relative to `half` (the cube's half-extent) so levels feel similar in mass.
    // Convex solids omit `pieces`; non-convex ones (heart, star) supply a convex
    // decomposition so the Voronoi clipper can still cut them.
    function makeShape(faces, bound, volume, contains, pieces) {
        const planes = planesFromFaces(faces);
        return { faces, planes, contains: contains || containsFn(planes), bound, volume, pieces: pieces || null };
    }

    function cube(half) {
        const h = half;
        const p = (x, y, z) => new V3(x * h, y * h, z * h);
        const faces = [
            [p(1, -1, -1), p(1, 1, -1), p(1, 1, 1), p(1, -1, 1)], // +x
            [p(-1, -1, -1), p(-1, -1, 1), p(-1, 1, 1), p(-1, 1, -1)], // -x
            [p(-1, 1, -1), p(-1, 1, 1), p(1, 1, 1), p(1, 1, -1)], // +y
            [p(-1, -1, -1), p(1, -1, -1), p(1, -1, 1), p(-1, -1, 1)], // -y
            [p(-1, -1, 1), p(1, -1, 1), p(1, 1, 1), p(-1, 1, 1)], // +z
            [p(-1, -1, -1), p(-1, 1, -1), p(1, 1, -1), p(1, -1, -1)], // -z
        ];
        return makeShape(faces, { x: h, y: h, z: h }, 8 * h * h * h);
    }

    function cylinder(half) {
        const R = half;          // radius
        const hy = half;         // half height (axis along Y)
        const sides = 24;        // facet count; the Voronoi clip smooths chunk faces
        const top = [], bot = [];
        for (let i = 0; i < sides; i++) {
            const a = (i / sides) * Math.PI * 2;
            const x = Math.cos(a) * R, z = Math.sin(a) * R;
            top.push(new V3(x, hy, z));
            bot.push(new V3(x, -hy, z));
        }
        const faces = [top.slice(), bot.slice()];
        for (let i = 0; i < sides; i++) {
            const j = (i + 1) % sides;
            faces.push([bot[i], bot[j], top[j], top[i]]);
        }
        return makeShape(faces, { x: R, y: hy, z: R }, Math.PI * R * R * (2 * hy));
    }

    function pyramid(half) {
        const S = 1.3;           // 30% larger than the cube/cylinder (deeper to dig)
        const w = half * 1.15 * S; // base half-width
        const H = half * 2.0 * S;  // full height
        const yShift = H * 0.14;   // move pyramid up a small distance for balanced vertical framing
        const y0 = -H / 2 + yShift;
        const apex = new V3(0, H / 2 + yShift, 0);
        const b = [
            new V3(-w, y0, -w),
            new V3(w, y0, -w),
            new V3(w, y0, w),
            new V3(-w, y0, w),
        ];
        const faces = [b.slice()]; // square base
        for (let i = 0; i < 4; i++) {
            const j = (i + 1) % 4;
            faces.push([b[i], b[j], apex.clone()]); // triangular side
        }
        return makeShape(faces, { x: w, y: H / 2 + yShift, z: w }, (2 * w) * (2 * w) * H / 3);
    }

    function octahedron(half) {
        const h = half;
        const top = new V3(0, h, 0);
        const bot = new V3(0, -h, 0);
        const fr = new V3(0, 0, h);
        const bk = new V3(0, 0, -h);
        const lt = new V3(-h, 0, 0);
        const rt = new V3(h, 0, 0);
        const faces = [
            [top, fr, rt],
            [top, rt, bk],
            [top, bk, lt],
            [top, lt, fr],
            [bot, rt, fr],
            [bot, bk, rt],
            [bot, lt, bk],
            [bot, fr, lt],
        ];
        return makeShape(faces, { x: h, y: h, z: h }, (4 / 3) * h * h * h * Math.sqrt(2));
    }

    // The heart's cleft makes it non-convex, so it can't be expressed as an
    // intersection of half-spaces — the plane-based containsFn would wrongly
    // exclude the lobe tips and include the empty cleft notch. Use an even-odd
    // ray cast against the closed triangle mesh instead. The ray direction is
    // deliberately off-axis so it never runs along the heart's symmetry planes
    // (where it would graze shared edges and miscount crossings).
    function heartContains(faces) {
        const dx = 0.8, dy = 0.24, dz = 0.56;
        const dlen = Math.hypot(dx, dy, dz);
        const ux = dx / dlen, uy = dy / dlen, uz = dz / dlen;
        return (p) => {
            let crossings = 0;
            for (const f of faces) {
                const A = f[0], B = f[1], C = f[2];
                const e1x = B.x - A.x, e1y = B.y - A.y, e1z = B.z - A.z;
                const e2x = C.x - A.x, e2y = C.y - A.y, e2z = C.z - A.z;
                const nx = e1y * e2z - e1z * e2y;
                const ny = e1z * e2x - e1x * e2z;
                const nz = e1x * e2y - e1y * e2x;
                const den = ux * nx + uy * ny + uz * nz;
                if (Math.abs(den) < 1e-12) continue; // face parallel to the ray
                const t = (nx * (A.x - p.x) + ny * (A.y - p.y) + nz * (A.z - p.z)) / den;
                if (t <= 1e-9) continue;
                const qx = p.x + t * ux, qy = p.y + t * uy, qz = p.z + t * uz;
                const v0x = C.x - A.x, v0y = C.y - A.y, v0z = C.z - A.z;
                const v1x = B.x - A.x, v1y = B.y - A.y, v1z = B.z - A.z;
                const v2x = qx - A.x, v2y = qy - A.y, v2z = qz - A.z;
                const d00 = v0x * v0x + v0y * v0y + v0z * v0z;
                const d01 = v0x * v1x + v0y * v1y + v0z * v1z;
                const d02 = v0x * v2x + v0y * v2y + v0z * v2z;
                const d11 = v1x * v1x + v1y * v1y + v1z * v1z;
                const d12 = v1x * v2x + v1y * v2y + v1z * v2z;
                const denom = d00 * d11 - d01 * d01;
                if (Math.abs(denom) < 1e-12) continue;
                const u = (d11 * d02 - d01 * d12) / denom;
                const v = (d00 * d12 - d01 * d02) / denom;
                if (u >= -1e-9 && v >= -1e-9 && u + v <= 1 + 1e-9) crossings++;
            }
            return (crossings & 1) === 1;
        };
    }

    function heart(half) {
        const h = half;
        const p = (x, y, z) => new V3(x * h, y * h, z * h);
        const P_bot = p(0, -1.2, 0);
        const P_left = p(-0.85, 0.1, 0);
        const P_right = p(0.85, 0.1, 0);
        const P_front = p(0, 0.15, 0.6);
        const P_back = p(0, 0.15, -0.6);
        const P_ltop = p(-0.5, 0.95, 0);
        const P_rtop = p(0.5, 0.95, 0);
        const P_midtop = p(0, 0.65, 0);

        const faces = [
            [P_bot, P_front, P_left],
            [P_bot, P_left, P_back],
            [P_bot, P_back, P_right],
            [P_bot, P_right, P_front],
            [P_left, P_front, P_ltop],
            [P_front, P_midtop, P_ltop],
            [P_midtop, P_back, P_ltop],
            [P_back, P_left, P_ltop],
            [P_front, P_right, P_rtop],
            [P_right, P_back, P_rtop],
            [P_back, P_midtop, P_rtop],
            [P_midtop, P_front, P_rtop]
        ];
        // The cleft makes the heart non-convex, which the Voronoi clipper can't cut as
        // one solid. Decompose it into tetrahedra fanning out from an interior point:
        // the heart is star-shaped, so one tetrahedron per boundary triangle tiles it
        // exactly (verified against the ray-cast containment test).
        const heartCore = new V3(0, 0.23 * h, 0);
        const pieces = faces.map((f) => [
            [heartCore, f[0], f[1]],
            [heartCore, f[1], f[2]],
            [heartCore, f[2], f[0]],
            [f[0], f[1], f[2]]
        ]);
        return makeShape(faces, { x: h, y: h * 1.2, z: h * 0.6 }, 0.9 * h * h * h, heartContains(faces), pieces);
    }

    // Fallen star: a flat, five-pointed star. Two shallow pyramids sharing a common
    // rim — the ten rim points alternate between the outer tips and the inner notches,
    // and a single apex on each face gives the low-poly ridges that catch the light.
    // Like the heart it's non-convex, so containment is an even-odd ray cast against
    // the closed triangle mesh (heartContains) rather than a half-space test.
    function star(half) {
        const R = half * 1.5;      // outer tip radius
        const rIn = R * 0.44;      // inner notch radius
        const th = half * 0.5;     // half thickness (flat)
        const rim = [];
        for (let i = 0; i < 10; i++) {
            const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
            const rr = (i % 2 === 0) ? R : rIn;
            rim.push(new V3(Math.cos(a) * rr, Math.sin(a) * rr, 0));
        }
        const front = new V3(0, 0, th);
        const back = new V3(0, 0, -th);
        const faces = [];
        for (let i = 0; i < 10; i++) {
            const j = (i + 1) % 10;
            faces.push([front.clone(), rim[i].clone(), rim[j].clone()]);
            faces.push([back.clone(), rim[j].clone(), rim[i].clone()]);
        }
        // Convex decomposition: the star is the union of ten tetrahedra, one per rim
        // edge, each spanning the front apex, the back apex and that edge's two rim
        // points. Each tetrahedron is convex, so the clipper can cut it, and the ten
        // together tile the non-convex star exactly.
        const pieces = [];
        for (let i = 0; i < 10; i++) {
            const j = (i + 1) % 10;
            const a = rim[i], b = rim[j];
            pieces.push([
                [front, a, b],
                [back, b, a],
                [front, back, a],
                [front, back, b]
            ]);
        }
        // area of a 5-pointed star = 5*R*rIn*sin(36°); volume of the twin pyramids
        return makeShape(faces, { x: R, y: R, z: th },
            5 * R * rIn * 0.5878 * (2 * th) / 3, heartContains(faces), pieces);
    }

    // Obsidian geode: a knobbly volcanic nodule. Start from an oversized cube and shave
    // it back with 12 icosahedral planes plus the 8 cube-corner planes (cut a touch
    // deeper), then knock a handful of extra facets off at random angles so the nodule
    // reads as a lumpy, asymmetric rock rather than a tidy polyhedron. Every plane sits
    // at or below its nominal radius, so the declared bound stays valid.
    function geode(half) {
        const h = half;
        let faces = cube(h * 1.3).faces;
        const PHI = (1 + Math.sqrt(5)) / 2;
        const dirs = [];
        for (const a of [1, -1]) for (const b of [1, -1]) {
            dirs.push(new V3(0, a, b * PHI));
            dirs.push(new V3(a, b * PHI, 0));
            dirs.push(new V3(a * PHI, 0, b));
        }
        const ico = dirs.length; // the first 12 planes are the icosahedral ones
        for (const sx of [1, -1]) for (const sy of [1, -1]) for (const sz of [1, -1]) dirs.push(new V3(sx, sy, sz));
        const rad = [];
        for (let i = 0; i < dirs.length; i++) {
            // jitter each cut inward so no two lobes bulge the same amount
            rad.push(i < ico ? h * (0.88 + Math.random() * 0.12) : h * (0.82 + Math.random() * 0.10));
        }
        // a few off-axis facets: shallow bites that flatten random lumps
        for (let k = 0; k < 9; k++) {
            const z = Math.random() * 2 - 1;
            const a = Math.random() * Math.PI * 2;
            const s = Math.sqrt(Math.max(0, 1 - z * z));
            dirs.push(new V3(Math.cos(a) * s, Math.sin(a) * s, z));
            rad.push(h * (0.90 + Math.random() * 0.10));
        }
        for (let i = 0; i < dirs.length; i++) {
            const n = dirs[i];
            if (n.lengthSq() < 1e-9) continue;
            faces = clipPolyhedron(faces, n.normalize(), rad[i]);
        }
        // bound is the axis extent of the clipped solid (the ico planes bind at ~1.18h)
        return makeShape(faces, { x: h * 1.18, y: h * 1.18, z: h * 1.18 }, 4.4 * h * h * h);
    }

    // A faceted ball: an oversized cube shaved back by the 26 cube-symmetry
    // directions (6 faces + 12 edges + 8 corners), all at radius `half`. Reads as a
    // sphere while still being a convex polyhedron the Voronoi clipper can handle.
    function orb(half) {
        const h = half;
        let faces = cube(h * 1.75).faces;
        const dirs = [
            new V3(1, 0, 0), new V3(-1, 0, 0),
            new V3(0, 1, 0), new V3(0, -1, 0),
            new V3(0, 0, 1), new V3(0, 0, -1),
        ];
        for (const a of [1, -1]) for (const b of [1, -1]) {
            dirs.push(new V3(a, b, 0), new V3(0, a, b), new V3(a, 0, b));
        }
        for (const sx of [1, -1]) for (const sy of [1, -1]) for (const sz of [1, -1]) {
            dirs.push(new V3(sx, sy, sz));
        }
        for (const d of dirs) faces = clipPolyhedron(faces, d.normalize(), h);
        return makeShape(faces, { x: h, y: h, z: h }, 4.1 * h * h * h);
    }

    // The 26 cube-symmetry directions: 6 faces, 12 edges, 8 corners. Clipping an
    // oversized cube by all of them at one radius yields a faceted ball; varying the
    // radius per direction sculpts domes and ovoids out of the same set.
    function cubeSymDirs() {
        const dirs = [
            new V3(1, 0, 0), new V3(-1, 0, 0),
            new V3(0, 1, 0), new V3(0, -1, 0),
            new V3(0, 0, 1), new V3(0, 0, -1),
        ];
        for (const a of [1, -1]) for (const b of [1, -1]) {
            dirs.push(new V3(a, b, 0), new V3(0, a, b), new V3(a, 0, b));
        }
        for (const sx of [1, -1]) for (const sy of [1, -1]) for (const sz of [1, -1]) {
            dirs.push(new V3(sx, sy, sz));
        }
        return dirs;
    }

    // Wild honeycomb hive: a fat dome. A faceted ball, flattened underneath and shaved
    // across the top so it reads as comb built against a branch rather than a sphere.
    function hive(half) {
        const h = half;
        let faces = cube(h * 1.9).faces;
        for (const d of cubeSymDirs()) faces = clipPolyhedron(faces, d.normalize(), h * 1.04);
        faces = clipPolyhedron(faces, new V3(0, -1, 0), h * 0.80);
        faces = clipPolyhedron(faces, new V3(0, 1, 0), h * 0.94);
        return makeShape(faces, { x: h * 1.04, y: h * 0.94, z: h * 1.04 }, 4.2 * h * h * h);
    }

    // Dragon egg: a faceted ovoid. An oversized cube shaved back by the 26 cube-symmetry
    // directions, each plane pushed out to where that direction leaves a tapered ellipsoid —
    // wide and round at the base, narrowing toward the crown. Convex by construction, so the
    // Voronoi clipper handles it like any other solid.
    function egg(half) {
        const a = half * 0.80; // x/z radius at the waist
        const b = half * 1.15; // y radius (the long axis)
        let faces = cube(half * 2.2).faces;
        for (const d of cubeSymDirs()) {
            const n = d.clone().normalize();
            const taper = 1 - 0.22 * Math.max(0, n.y); // the crown draws in
            const ax = a * taper;
            const r = 1 / Math.sqrt((n.x * n.x) / (ax * ax) + (n.y * n.y) / (b * b) + (n.z * n.z) / (ax * ax));
            faces = clipPolyhedron(faces, n, r);
        }
        return makeShape(faces, { x: a, y: b, z: a }, 3.7 * a * a * b);
    }

    // Chain-bound reliquary: a lidded treasure chest. A wide, shallow box with both top
    // edges chamfered off, so the lid reads as domed while the solid stays convex (the
    // Voronoi clipper only works on convex polyhedra).
    function chest(half) {
        const w = half * 1.34, hy = half * 0.92, d = half * 0.90;
        const p = (x, y, z) => new V3(x * w, y * hy, z * d);
        let faces = [
            [p(1, -1, -1), p(1, 1, -1), p(1, 1, 1), p(1, -1, 1)], // +x
            [p(-1, -1, -1), p(-1, -1, 1), p(-1, 1, 1), p(-1, 1, -1)], // -x
            [p(-1, 1, -1), p(-1, 1, 1), p(1, 1, 1), p(1, 1, -1)], // +y
            [p(-1, -1, -1), p(1, -1, -1), p(1, -1, 1), p(-1, -1, 1)], // -y
            [p(-1, -1, 1), p(1, -1, 1), p(1, 1, 1), p(-1, 1, 1)], // +z
            [p(-1, -1, -1), p(-1, 1, -1), p(1, 1, -1), p(1, -1, -1)], // -z
        ];
        // shave the two top edges back to fake a curved lid
        const chamfer = (sz, k) => {
            const n = new V3(0, 1, sz).normalize();
            faces = clipPolyhedron(faces, n, (Math.abs(n.y) * hy + Math.abs(n.z) * d) * k);
        };
        chamfer(1, 0.88);
        chamfer(-1, 0.88);
        return makeShape(faces, { x: w, y: hy, z: d }, 8 * w * hy * d * 0.92);
    }

    // ---- public API ----
    // generate(shape, chunkCount, treasurePositions, rng, colors, opts) ->
    //   { chunks: [{geometry, centroid}], treasureChunkIndex: [i0, i1, i2] }
    // opts.seeds     — supply the Voronoi seed points instead of sampling them at random.
    //                  Cell shape follows seed spacing, so a structured set (e.g. the
    //                  fossilized trunk's concentric shells) yields anisotropic chunks —
    //                  thin bark plates rather than isotropic rubble.
    // opts.neighbors — how many nearest seeds are offered as bisector planes (default 30).
    //                  Anisotropic seed sets need more, because a cell's far-but-essential
    //                  in-shell neighbours sit behind a crowd of very close cross-shell
    //                  ones. Extra candidates are cheap: the clip loop below stops as soon
    //                  as the remaining planes provably can't cut the cell.
    function generate(shape, chunkCount, treasurePositions, rng, colors, opts) {
        rng = rng || Math.random;
        colors = colors || {};
        opts = opts || {};
        const outerCol = colors.outer || [0.40, 0.365, 0.325];
        const innerCol = colors.inner || [0.62, 0.525, 0.40];
        const maxNear = opts.neighbors || 30;

        const spacing = Math.cbrt(shape.volume / chunkCount);
        const seeds = (opts.seeds && opts.seeds.length)
            ? opts.seeds.map((p) => p.clone())
            : sampleSeeds(shape.bound, chunkCount, spacing * 0.62, rng, shape.contains);

        // give each treasure its own seed so it sits encased in exactly one chunk
        const treasureChunkIndex = [];
        for (const tp of treasurePositions) {
            // remove any seed too close, then add the treasure seed
            for (let i = seeds.length - 1; i >= 0; i--) {
                if (seeds[i].distanceTo(tp) < spacing * 0.5) seeds.splice(i, 1);
            }
            seeds.push(tp.clone());
        }
        // treasure seeds were appended in order
        for (let k = 0; k < treasurePositions.length; k++) {
            treasureChunkIndex[k] = seeds.length - treasurePositions.length + k;
        }

        const chunks = [];
        const seedToChunk = new Array(seeds.length).fill(-1);
        const tmpN = new V3();
        const pieces = shape.pieces; // null for convex solids, else a convex decomposition
        for (let i = 0; i < seeds.length; i++) {
            const si = seeds[i];
            // nearest neighbors only — distant bisectors can't cut the cell
            const order = [];
            for (let j = 0; j < seeds.length; j++) {
                if (j !== i) order.push([seeds[j].distanceToSquared(si), j]);
            }
            order.sort((a, b) => a[0] - b[0]);
            const nNear = Math.min(order.length, maxNear);
            const bisectors = [];
            for (let k = 0; k < nNear; k++) {
                const sj = seeds[order[k][1]];
                tmpN.subVectors(sj, si).normalize();
                const mid = new V3().addVectors(si, sj).multiplyScalar(0.5);
                bisectors.push({ n: tmpN.clone(), d: mid.dot(tmpN) });
            }
            const tint = 0.88 + rng() * 0.24;
            if (pieces) {
                // Clip every convex piece by the same bisectors. A seed's cell can spill
                // into a neighbouring piece, so all pieces must be tried; the chunk is
                // the union of the pieces that survive.
                const partFaces = [];
                for (const piece of pieces) {
                    let faces = cloneFaces(piece);
                    let ok = true;
                    for (const bs of bisectors) {
                        faces = clipPolyhedron(faces, bs.n, bs.d);
                        if (faces.length < 4) { ok = false; break; }
                    }
                    if (ok && faces.length >= 4) partFaces.push(faces);
                }
                if (partFaces.length === 0) continue;
                const built = buildChunkGeometryMulti(partFaces, shape.planes, outerCol, innerCol, tint);
                if (!built) continue;
                seedToChunk[i] = chunks.length;
                chunks.push(built);
            } else {
                let faces = cloneFaces(shape.faces);
                let ok = true;
                // Bisectors are sorted nearest-first, and each sits exactly half its
                // seed-to-seed distance from `si`. Once that half-distance reaches the
                // cell's own radius no remaining plane can touch it, so stop — this keeps a
                // generous candidate list (needed for plate-shaped cells) nearly free.
                let maxR = cellRadius(faces, si);
                for (const bs of bisectors) {
                    if (bs.d - si.dot(bs.n) >= maxR) break;
                    faces = clipPolyhedron(faces, bs.n, bs.d);
                    if (faces.length < 4) { ok = false; break; }
                    maxR = cellRadius(faces, si);
                }
                if (!ok || faces.length < 4) continue;
                seedToChunk[i] = chunks.length;
                chunks.push(buildChunkGeometry(faces, shape.planes, outerCol, innerCol, tint));
            }
        }
        return { chunks, treasureChunkIndex: treasureChunkIndex.map((i) => seedToChunk[i]) };
    }

    window.CubeCrackerFracture = { generate, shapes: { cube, cylinder, pyramid, heart, octahedron, geode, orb, hive, chest, star, egg } };
})();

