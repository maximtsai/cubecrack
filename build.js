#!/usr/bin/env node
'use strict';

/**
 * Gem Cracker production build.
 *
 * Combines the best of the sibling build scripts (build_earth.js, build_lumberjack.js)
 * and a few improvements:
 *
 *   - ASI-safe concatenation with an explicit `;` terminator between files
 *     (a trailing statement without a semicolon followed by a file that opens
 *     with '(' or '[' would be joined into a call/index expression — a runtime
 *     TypeError that only ever shows up in dist).
 *   - The bundle is parse-validated with `vm.Script` before it is written, so a
 *     broken bundle can never ship on a green build.
 *   - index.html's local <script> tags are cross-checked against the build's
 *     script list (full ordered comparison) so a new script that one side forgot
 *     fails loudly instead of silently 404ing in dist.
 *   - Assets are cross-checked three ways: the asset_map manifest, the literal
 *     getAssetUrl(...)/fetch(...) references in game.js, and the files actually
 *     on disk. Anything referenced but not copied fails the build.
 *   - Optional terser minification. If terser is installed the bundle is
 *     minified; if not, the build still succeeds with a warning (concatenation
 *     only). Pass --no-minify to force concatenation.
 *
 * Usage:
 *   node build.js          # full build (minifies if terser is available)
 *   node build.js --no-minify
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const srcDir = __dirname;
const distDir = path.join(srcDir, 'dist');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

// Game scripts bundled into dist/game.js, in load order (relative to scripts/).
// messagebus.js MUST come first: game.js reads window.Game.bus at init.
const BUNDLED_SCRIPTS = ['messagebus.js', 'game.js'];

// Scripts copied verbatim and kept as their own <script> tag. Only for
// already-minified vendor libraries (re-minifying them is pointless).
const EXTERNAL_LOCAL_SCRIPTS = ['three.min.js'];

// Non-JS files copied verbatim into dist (relative to project root).
const STATIC_ASSETS = ['style.css', 'config'];

// Directories copied wholesale into dist.
const ASSET_DIRS = ['audio', 'sprites'];

// Manifest that is the source of truth for runtime assets.
const ASSET_MAP = 'asset_map';

const NO_MINIFY = process.argv.includes('--no-minify');
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log('Gem Cracker build\n');
    console.log('  node build.js            full build (minifies if terser is available)');
    console.log('  node build.js --no-minify  concatenate only, no minification');
    process.exit(0);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function cleanDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
        return;
    }
    console.log(`Cleaning contents of directory: ${dir}`);
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        try {
            fs.rmSync(fullPath, { recursive: true, force: true });
        } catch (err) {
            console.warn(`Warning: Could not remove ${fullPath}: ${err.message}`);
        }
    }
}

function copyFile(src, dest) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
}

function copyDir(src, dest) {
    if (!fs.existsSync(src)) return;
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            fs.mkdirSync(destPath, { recursive: true });
            copyDir(srcPath, destPath);
        } else {
            copyFile(srcPath, destPath);
        }
    }
}

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const KB = (n) => (n / 1024).toFixed(1);

// ---------------------------------------------------------------------------
// Asset discovery + cross-checks
// ---------------------------------------------------------------------------

// Copy operations as [sourceRel, destRel] pairs (source relative to srcDir,
// destination relative to distDir). External scripts ship from scripts/ in the
// source but are referenced flat in dist, so their destination is remapped.
function collectCopyOps() {
    const ops = [];
    const seen = new Set();
    const add = (srcRel, destRel) => {
        const key = srcRel + ' -> ' + destRel;
        if (seen.has(key)) return;
        seen.add(key);
        ops.push([srcRel, destRel]);
    };
    for (const rel of STATIC_ASSETS) {
        if (fs.existsSync(path.join(srcDir, rel))) add(rel, rel);
    }
    for (const dir of ASSET_DIRS) {
        const abs = path.join(srcDir, dir);
        if (!fs.existsSync(abs)) continue;
        const walk = (d) => {
            for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
                const full = path.join(d, entry.name);
                if (entry.isDirectory()) walk(full);
                else {
                    const rel = path.relative(srcDir, full).replace(/\\/g, '/');
                    add(rel, rel);
                }
            }
        };
        walk(abs);
    }
    // External scripts: source lives in scripts/, dist references them flat.
    for (const rel of EXTERNAL_LOCAL_SCRIPTS) {
        if (fs.existsSync(path.join(srcDir, 'scripts', rel))) add('scripts/' + rel, rel);
    }
    return ops;
}

// Runtime asset references pulled from asset_map (the manifest).
function assetsFromManifest() {
    const mapPath = path.join(srcDir, ASSET_MAP);
    if (!fs.existsSync(mapPath)) return [];
    const text = fs.readFileSync(mapPath, 'utf8');
    const refs = [];
    for (const m of text.matchAll(/"url"\s*:\s*"([^"]+)"/g)) {
        refs.push(m[1]);
    }
    return refs;
}

// Runtime asset references pulled from game.js source (literal calls only).
function assetsFromCode() {
    const src = fs.readFileSync(path.join(srcDir, 'scripts', 'game.js'), 'utf8');
    const refs = new Set();
    // getAssetUrl('ice_crack') -> audio/ice_crack.mp3
    for (const m of src.matchAll(/getAssetUrl\(\s*['"]([^'"]+)['"]\s*\)/g)) {
        refs.add('audio/' + m[1] + '.mp3');
    }
    // fetch('config') and other local fetches (skip http(s) and relative-absolute)
    for (const m of src.matchAll(/fetch\(\s*['"]([^'"]+)['"]\s*\)/g)) {
        const url = m[1];
        if (!/^(?:https?:)?\/\//i.test(url) && !url.startsWith('/')) refs.add(url);
    }
    return [...refs];
}

// ---------------------------------------------------------------------------
// Bundle
// ---------------------------------------------------------------------------

async function bundleScripts() {
    let combined = '';
    for (const file of BUNDLED_SCRIPTS) {
        const filePath = path.join(srcDir, 'scripts', file);
        if (!fs.existsSync(filePath)) {
            console.error(`Error: Required script file not found: ${filePath}`);
            process.exit(1);
        }
        console.log(`  - Adding scripts/${file}`);
        let content = fs.readFileSync(filePath, 'utf8');
        // Drop a leading 'use strict'; directive from an individual module. As
        // separate <script> tags each file is its own program, but concatenated
        // they are one — a 'use strict' at the very top would flip the ENTIRE
        // bundle into strict mode, changing game.js's semantics (it is authored
        // to run sloppy). Stripping it restores the original per-script behavior.
        content = content.replace(/^(['"]use strict['"]);?\r?\n/, '');
        combined += `\n// --- START FILE: ${file} ---\n`;
        combined += content;
        // Terminate with an explicit empty statement, not just a newline, so ASI
        // can never join this file's tail with the next file's head.
        combined += '\n;\n';
    }

    // Validate the raw bundle parses before anything else.
    try {
        new vm.Script(combined, { filename: 'dist/game.js' });
    } catch (err) {
        console.error(`Error: combined bundle failed to parse: ${err.message}`);
        process.exit(1);
    }

    let output = combined;
    let minified = false;

    if (!NO_MINIFY) {
        let minify;
        try {
            ({ minify } = require('terser'));
        } catch (e) {
            minify = null;
        }
        if (minify) {
            console.log('Minifying with terser...');
            // mangle WITHOUT toplevel: game.js reaches across files via window.*
            // globals, so top-level names must be left alone. compress is safe.
            const result = await minify(combined, { compress: true, mangle: true });
            if (result.error) {
                console.error('Minification failed:', result.error);
                process.exit(1);
            }
            // The minified output must parse too.
            try {
                new vm.Script(result.code, { filename: 'dist/game.js' });
            } catch (err) {
                console.error(`Error: minified bundle failed to parse: ${err.message}`);
                process.exit(1);
            }
            output = result.code;
            minified = true;
        } else {
            console.warn('Warning: terser not installed — skipping minification (concatenation only).');
            console.warn('  Install it with: npm install terser');
        }
    }

    fs.writeFileSync(path.join(distDir, 'game.js'), output, 'utf8');
    console.log(`Created dist/game.js (${KB(Buffer.byteLength(combined))} KB raw -> ${KB(Buffer.byteLength(output))} KB${minified ? ' minified' : ''})`);
}

// ---------------------------------------------------------------------------
// index.html rewrite
// ---------------------------------------------------------------------------

function rewriteIndexHtml() {
    const htmlSrc = path.join(srcDir, 'index.html');
    if (!fs.existsSync(htmlSrc)) {
        console.error('Error: index.html not found!');
        process.exit(1);
    }

    const htmlContent = fs.readFileSync(htmlSrc, 'utf8');

    // Expected local script order, normalized (strip './' and 'scripts/' prefix).
    const expected = [...EXTERNAL_LOCAL_SCRIPTS, ...BUNDLED_SCRIPTS];

    const localScriptRe = /<script\b[^>]*\bsrc="([^"]+\.js)"[^>]*><\/script>/g;
    const foundFiles = [];
    let sm;
    while ((sm = localScriptRe.exec(htmlContent))) {
        const src = sm[1];
        if (/^(?:[a-z]+:)?\/\//i.test(src)) continue; // CDN / protocol-relative
        const rel = src.replace(/^\.\//, '').replace(/^scripts\//, '');
        foundFiles.push(rel);
    }

    const missingFromBuild = foundFiles.filter((f) => !expected.includes(f));
    const missingFromHtml = expected.filter((f) => !foundFiles.includes(f));
    const orderMismatch = missingFromBuild.length === 0 && missingFromHtml.length === 0
        && foundFiles.join(',') !== expected.join(',');

    if (missingFromBuild.length || missingFromHtml.length || orderMismatch) {
        console.error('Error: build.js script list is out of sync with index.html\'s local <script> tags.');
        if (missingFromBuild.length) console.error('  In index.html but not handled by build: ' + missingFromBuild.join(', '));
        if (missingFromHtml.length) console.error('  In build but missing from index.html: ' + missingFromHtml.join(', '));
        if (orderMismatch) console.error('  Order differs — index.html: [' + foundFiles.join(', ') + '] vs build: [' + expected.join(', ') + ']');
        process.exit(1);
    }

    // Locate the contiguous block from the first to the last local script tag.
    const firstTagRe = new RegExp(`<script\\b[^>]*\\bsrc="[^"]*${escapeRegExp(EXTERNAL_LOCAL_SCRIPTS[0])}"[^>]*></script>`);
    const lastTagRe = new RegExp(`<script\\b[^>]*\\bsrc="[^"]*${escapeRegExp(BUNDLED_SCRIPTS[BUNDLED_SCRIPTS.length - 1])}"[^>]*></script>`);
    const firstMatch = firstTagRe.exec(htmlContent);
    if (!firstMatch) {
        console.error('Error: could not locate first local script tag in index.html.');
        process.exit(1);
    }
    const firstIdx = firstMatch.index;
    const tail = htmlContent.slice(firstIdx);
    const lastMatch = lastTagRe.exec(tail);
    if (!lastMatch) {
        console.error('Error: could not locate last local script tag in index.html.');
        process.exit(1);
    }
    const lastIdx = firstIdx + lastMatch.index + lastMatch[0].length;

    const distTags = [
        `<script src="${EXTERNAL_LOCAL_SCRIPTS[0]}"></script>`,
        `<script src="game.js"></script>`
    ].join('\n    ');

    const rewritten = htmlContent.slice(0, firstIdx) + distTags + htmlContent.slice(lastIdx);
    fs.writeFileSync(path.join(distDir, 'index.html'), rewritten, 'utf8');
    console.log('Rewrote dist/index.html with bundled script tags.');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function build() {
    console.log('Starting Gem Cracker production build...');

    // 1. Clean and recreate dist
    cleanDir(distDir);

    // 2. Copy static assets + asset directories
    const copyOps = collectCopyOps();
    for (const [srcRel, destRel] of copyOps) {
        copyFile(path.join(srcDir, srcRel), path.join(distDir, destRel));
    }
    console.log(`Copied ${copyOps.length} asset file(s).`);

    // 3. Cross-check assets: manifest + code references vs what we copied.
    //    Match against the DIST paths (audio/*, config, ... stay as-is, and
    //    external scripts are referenced flat in dist).
    const copiedDest = new Set(copyOps.map(([, destRel]) => destRel));
    const referenced = new Set([...assetsFromManifest(), ...assetsFromCode()]);
    const missing = [...referenced].filter((r) => !copiedDest.has(r));
    if (missing.length) {
        console.error('Error: assets referenced by the game are missing from the build copy list:');
        for (const m of missing) console.error('  ' + m);
        console.error('  Add them to STATIC_ASSETS / ASSET_DIRS in build.js, or add the file to the source tree.');
        process.exit(1);
    }

    // 4. Bundle scripts
    await bundleScripts();

    // 5. Rewrite index.html
    rewriteIndexHtml();

    console.log('Build completed successfully! Output directory: dist/');
}

build().catch((err) => { console.error(err); process.exit(1); });
