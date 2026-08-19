const fs = require('fs');
const path = require('path');
const vm = require('vm');

const srcDir = __dirname;
const distDir = path.join(srcDir, 'dist');

// Which platform adapter gets bundled. One per branch — swap this and the
// matching <script> tag in index.html together (the build cross-checks them).
const PLATFORM_ADAPTER = 'platforms/poki.js';

// Local <script src="..."> tags in index.html that are deliberately NOT part of
// the bundle — they get copied into dist verbatim and loaded as their own tag.
// Anything local and not listed here must appear in jsFiles (see the sync check
// in step 5), so a newly added script can't quietly go unbundled and uncopied.
const EXTERNAL_LOCAL_SCRIPTS = ['three.min.js'];

const jsFiles = [
    'sitelock.js',
    'translations.js',
    'progression.js',
    'platforms/platform-bridge-core.js',
    PLATFORM_ADAPTER,
    'planets.js',
    'materials.js',
    'audio.js',
    'input.js',
    'vehicle.js',
    'vehicle-preview.js',
    'entity-factories.js',
    'fox-astronaut.js',
    'messageBus.js',
    'planetlogic.js',
    'ui.js',
    'stars.js',
    'snowmen.js',
    'grave.js',
    'game.js'
];

/**
 * Empty and recreate contents of a directory without removing the directory itself
 */
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

function build() {
    console.log('Starting Little Planet Lumberjack production build...');

    // 1. Clean and recreate dist
    cleanDir(distDir);

    // 2. Copy static resources (audio files, sprite textures, and libraries)
    const assets = [
        'audio/woodcut.mp3', 'audio/powerup.mp3',         'audio/geodia.mp3',
        'audio/geodia_powerup.mp3', 'audio/alien.mp3', 'audio/alien_pickup.mp3',
        'audio/moo_scared.mp3', 'audio/stillhollow.mp3', 'audio/gravekeeper.mp3',
        'audio/gravekeeper_ending.mp3', 'audio/music_stop_rip.mp3',
        'audio/snowglobe.mp3', 'audio/snowglow_powerup.mp3',
        'audio/landing_boom.mp3', 'audio/rockslide.mp3', 'audio/train_toot.mp3',
        'audio/rocket_launch.mp3', 'audio/ship_creak.mp3', 'audio/deep_crush.mp3',
        'audio/upgrade_max.mp3', 'audio/wave_ambience.mp3',

        'sprites/nebula_image.webp', 'sprites/nebula_image2.webp',
        'sprites/favicon.png',
        'three.min.js',
        'fonts/Nunito-VariableFont_wght.ttf'
    ];
    for (const asset of assets) {
        const srcPath = path.join(srcDir, asset);
        const destPath = path.join(distDir, asset);
        if (fs.existsSync(srcPath)) {
            console.log(`Copying ${asset}...`);
            fs.mkdirSync(path.dirname(destPath), { recursive: true });
            fs.copyFileSync(srcPath, destPath);
        } else {
            console.warn(`Warning: ${asset} not found!`);
        }
    }

    // Cross-check the asset list against what the source actually references
    // (new Audio(assetPath(...)) calls and textureLoader.load('sprites/...')
    // calls) so a future new sound/sprite that forgets to update this list
    // fails the build loudly instead of silently 404ing in production.
    const referencedAssets = new Set();
    for (const file of ['audio.js', 'stars.js']) {
        const src = fs.readFileSync(path.join(srcDir, file), 'utf8');
        // \b so only a bare assetPath(...) call matches. A wrapper whose name
        // merely ends in assetPath (_assetPath, hostAssetPath, ...) takes an
        // already-prefixed argument, which would yield 'audio/audio/x.mp3' here
        // and fail the build for a file that is perfectly fine.
        for (const m of src.matchAll(/\bassetPath\(\s*['"]([^'"]+)['"]\s*\)/g)) {
            referencedAssets.add('audio/' + m[1]);
        }
        for (const m of src.matchAll(/file:\s*['"]([^'"]+\.mp3)['"]/g)) {
            referencedAssets.add('audio/' + m[1]);
        }
        for (const m of src.matchAll(/textureLoader\.load\(\s*(?:[^,)]*\?\s*)?['"]([^'"]+\.(?:webp|png|jpg))['"]/g)) {
            referencedAssets.add(m[1]);
        }
        // handles the ternary form: cond ? 'sprites/a.webp' : 'sprites/b.webp'
        for (const m of src.matchAll(/['"](sprites\/[^'"]+\.(?:webp|png|jpg))['"]/g)) {
            referencedAssets.add(m[1]);
        }
    }
    const missingFromAssetList = [...referencedAssets].filter(a => !assets.includes(a));
    if (missingFromAssetList.length) {
        console.error('Error: build.js assets list is missing files referenced by the source:');
        console.error('  ' + missingFromAssetList.join(', '));
        process.exit(1);
    }

    // 3. Inline component CSS — read game-component.css and prepend an assignment
    //    so game.js can read window.__LPJ_CSS__ without any runtime fetch.
    const cssPath = path.join(srcDir, 'game-component.css');
    let inlineCSS = '';
    if (fs.existsSync(cssPath)) {
        console.log('Inlining game-component.css...');
        const cssText = fs.readFileSync(cssPath, 'utf8');
        // Escape backticks and backslashes so the string is safe inside a template literal
        const escaped = cssText.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
        inlineCSS = `window.__LPJ_CSS__ = \`${escaped}\`;\n`;
    } else {
        console.warn('Warning: game-component.css not found — component styles will be empty in the bundle.');
    }

    // 4. Combine JS files (concatenation only — no minification)
    console.log('Combining JS files...');
    let combinedJS = inlineCSS;
    for (const file of jsFiles) {
        const filePath = path.join(srcDir, file);
        if (fs.existsSync(filePath)) {
            console.log(`  - Adding ${file}`);
            const content = fs.readFileSync(filePath, 'utf8');
            combinedJS += `\n// --- START FILE: ${file} ---\n`;
            combinedJS += content;
            // Terminate with an explicit empty statement, not just a newline.
            // As separate <script> tags each file is its own program, but
            // concatenated they are one. If a file's last statement omits its
            // semicolon and the next file opens with '(' or '[', ASI joins them
            // into a call/index expression — a runtime TypeError that only
            // happens in dist, and one the parse check below cannot see because
            // the mangled bundle is still perfectly valid syntax.
            combinedJS += '\n;\n';
        } else {
            console.error(`Error: Required script file not found: ${filePath}`);
            process.exit(1);
        }
    }

    // Validate the combined bundle parses before writing it, so a broken
    // bundle can never ship with a green build.
    try {
        new vm.Script(combinedJS, { filename: 'dist/game.js' });
    } catch (err) {
        console.error(`Error: combined bundle failed to parse: ${err.message}`);
        process.exit(1);
    }

    fs.writeFileSync(path.join(distDir, 'game.js'), combinedJS, 'utf8');
    console.log(`Created JS bundle: dist/game.js (${Buffer.byteLength(combinedJS)} bytes)`);

    // 5. Update index.html
    const htmlSrc = path.join(srcDir, 'index.html');
    const htmlDest = path.join(distDir, 'index.html');
    if (fs.existsSync(htmlSrc)) {
        console.log('Generating dist/index.html...');
        let htmlContent = fs.readFileSync(htmlSrc, 'utf8');

        // Strip the dev-only CSS loader block (synchronous XHR that fetches
        // game-component.css); the CSS is already baked into the JS bundle.
        const cssLoaderRegex = /\n?<script>\s*\/\/ Dev: load game-component\.css[\s\S]*?<\/script>\n?/;
        // Hard failure, not a warning: game-component.css is deliberately not
        // copied into dist, so a block left behind means every production load
        // does a blocking synchronous XHR that 404s. That must not ship on a
        // green build just because the marker comment got reworded.
        if (!cssLoaderRegex.test(htmlContent)) {
            console.error('Error: dev CSS loader block not found in index.html.');
            console.error('  Expected a <script> opening with "// Dev: load game-component.css".');
            console.error('  If that block was renamed or removed, update cssLoaderRegex in build.js to match.');
            process.exit(1);
        }
        htmlContent = htmlContent.replace(cssLoaderRegex, '\n');
        console.log('Removed dev CSS loader block from dist/index.html.');

        // Cross-check jsFiles against every local script tag actually present
        // in index.html before touching anything. A plain regex match here
        // is not enough: an unanchored regex built from jsFiles can silently
        // match a SUBSET of the real tag sequence (e.g. if index.html grew a
        // new local script that jsFiles forgot about), leaving that extra
        // tag behind untouched — and its file never gets copied or bundled,
        // so it 404s in dist while the bundle silently lacks that module's
        // code. Comparing the full ordered list catches that case loudly
        // instead of shipping a broken build that merely "succeeded".
        // Match src on ANY attribute position and with or without a './'
        // prefix. Requiring './' (as this once did) meant a script added as
        // src="foo.js" was invisible to the very check meant to catch it.
        const localScriptRe = /<script\b[^>]*\bsrc="([^"]+\.js)"[^>]*><\/script>/g;
        const foundFiles = [];
        let sm;
        while ((sm = localScriptRe.exec(htmlContent))) {
            const src = sm[1];
            if (/^(?:[a-z]+:)?\/\//i.test(src)) continue;   // CDN / protocol-relative
            const rel = src.replace(/^\.\//, '');
            if (EXTERNAL_LOCAL_SCRIPTS.includes(rel)) continue;
            foundFiles.push(rel);
        }

        // The allowlist only earns its keep if those files really are shipped.
        const uncopiedExternals = EXTERNAL_LOCAL_SCRIPTS.filter(f => !assets.includes(f));
        if (uncopiedExternals.length) {
            console.error('Error: EXTERNAL_LOCAL_SCRIPTS entries are not in the assets copy list: ' + uncopiedExternals.join(', '));
            process.exit(1);
        }

        const missingFromBuild = foundFiles.filter(f => !jsFiles.includes(f));
        const missingFromHtml = jsFiles.filter(f => !foundFiles.includes(f));
        const orderMismatch = missingFromBuild.length === 0 && missingFromHtml.length === 0
            && foundFiles.join(',') !== jsFiles.join(',');

        if (missingFromBuild.length || missingFromHtml.length || orderMismatch) {
            console.error('Error: build.js jsFiles is out of sync with index.html\'s local <script> tags.');
            if (missingFromBuild.length) console.error('  In index.html but missing from jsFiles: ' + missingFromBuild.join(', '));
            if (missingFromHtml.length) console.error('  In jsFiles but missing from index.html: ' + missingFromHtml.join(', '));
            if (orderMismatch) console.error('  Same files on both sides, but order differs — index.html: [' + foundFiles.join(', ') + '] vs jsFiles: [' + jsFiles.join(', ') + ']');
            process.exit(1);
        }

        // find the exact block spanning from the first script (sitelock.js) to the last matched tag (game.js)
        // Filenames go into a RegExp, so escape them — an unescaped '.' in
        // e.g. planets.js is a wildcard and could match the wrong tag.
        const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const scriptTagRe = f => new RegExp(`<script\\s+src="\\./${escapeRe(f)}"[^>]*></script>`);
        const firstScriptRegex = scriptTagRe(jsFiles[0]);
        const lastScriptRegex = scriptTagRe(jsFiles[jsFiles.length - 1]);
        const firstMatch = firstScriptRegex.exec(htmlContent);
        if (!firstMatch) {
            console.error('Error: Could not locate the script tags block in index.html!');
            process.exit(1);
        }
        const firstIdx = firstMatch.index;
        // Search for the closing tag only AFTER the opening one, so an
        // earlier occurrence can never yield lastIdx < firstIdx and silently
        // produce mangled HTML instead of a loud failure.
        const tail = htmlContent.slice(firstIdx);
        const lastMatch = lastScriptRegex.exec(tail);
        if (!lastMatch) {
            console.error('Error: Could not locate the script tags block in index.html!');
            process.exit(1);
        }
        const lastIdx = firstIdx + lastMatch.index + lastMatch[0].length;
        const distGameTag = '<script src="game.js" onerror="window.onLoadError && window.onLoadError(\'game.js\')"></script>';
        htmlContent = htmlContent.slice(0, firstIdx) + distGameTag + htmlContent.slice(lastIdx);
        fs.writeFileSync(htmlDest, htmlContent, 'utf8');
        console.log('Updated dist/index.html with unified JS script tag.');
    } else {
        console.error('Error: index.html not found!');
        process.exit(1);
    }

    console.log('Build completed successfully!');
}

build();
