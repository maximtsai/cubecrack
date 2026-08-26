// Gems in the cube - tiny synthesized sound kit (WebAudio, no assets)
(function () {
    let ctx = null;
    let masterGain = null;
    let musicGain = null;
    let hammerBuffer = null;
    let hammerLoading = false;
    let iceBuffer = null;
    let iceLoading = false;
    let iceBuffer2 = null;
    let iceLoading2 = false;
    let iceCounter = 0;
    let softBounceBuffer = null;
    let softBounceLoading = false;
    let bouncyBuffer = null;
    let bouncyLoading = false;
    let eggBuffers = [null, null];
    let eggLoading = false;
    let musicBuffer = null;
    let musicLoading = false;
    let musicSource = null;

    function getAssetUrl(id) {
        return 'audio/' + id + '.mp3';
    }


    // Hybrid decodeAudioData wrapper: supports modern Promise API & legacy callback-only Safari
    function decodeAudioDataSafe(audioCtx, arrayBuffer) {
        return new Promise((resolve, reject) => {
            try {
                const res = audioCtx.decodeAudioData(arrayBuffer, resolve, reject);
                if (res && typeof res.then === 'function') {
                    res.then(resolve).catch(reject);
                }
            } catch (err) {
                reject(err);
            }
        });
    }

    async function loadIceSound() {
        if (!iceBuffer && !iceLoading) {
            iceLoading = true;
            try {
                const c = ac();
                if (c) {
                    const resp = await fetch(getAssetUrl('ice_crack'));
                    const arrayBuffer = await resp.arrayBuffer();
                    iceBuffer = await decodeAudioDataSafe(c, arrayBuffer);
                }
            } catch (e) {
                console.error('Error loading ice crack sound 1:', e);
            } finally {
                iceLoading = false;
            }
        }
        if (!iceBuffer2 && !iceLoading2) {
            iceLoading2 = true;
            try {
                const c = ac();
                if (c) {
                    const resp = await fetch(getAssetUrl('ice_crack_2'));
                    const arrayBuffer = await resp.arrayBuffer();
                    iceBuffer2 = await decodeAudioDataSafe(c, arrayBuffer);
                }
            } catch (e) {
                console.error('Error loading ice crack sound 2:', e);
            } finally {
                iceLoading2 = false;
            }
        }
    }

    // Three dull metal thuds; one is picked at random on every metal/chain strike.
    const METAL_THUD_IDS = ['metal_thud_1', 'metal_thud_2', 'metal_thud_3'];
    let metalThudBuffers = [null, null, null];
    let metalThudLoading = false;

    async function loadMetalThuds() {
        if (metalThudLoading) return;
        metalThudLoading = true;
        try {
            const c = ac();
            if (c) {
                await Promise.all(METAL_THUD_IDS.map(async (id, i) => {
                    if (metalThudBuffers[i]) return;
                    try {
                        const resp = await fetch(getAssetUrl(id));
                        const arrayBuffer = await resp.arrayBuffer();
                        metalThudBuffers[i] = await decodeAudioDataSafe(c, arrayBuffer);
                    } catch (e) {
                        console.error('Error loading ' + id + ':', e);
                    }
                }));
            }
        } catch (e) {
            console.error('Error in loadMetalThuds:', e);
        } finally {
            metalThudLoading = false;
        }
    }

    // Four crisp clockwork gear clanks; one is picked at random on gear strikes.
    const GEAR_IDS = ['gear_1', 'gear_2', 'gear_3', 'gear_4'];
    let gearBuffers = [null, null, null, null];
    let gearLoading = false;

    async function loadGearSounds() {
        if (gearLoading) return;
        gearLoading = true;
        try {
            const c = ac();
            if (c) {
                await Promise.all(GEAR_IDS.map(async (id, i) => {
                    if (gearBuffers[i]) return;
                    try {
                        const resp = await fetch(getAssetUrl(id));
                        const arrayBuffer = await resp.arrayBuffer();
                        gearBuffers[i] = await decodeAudioDataSafe(c, arrayBuffer);
                    } catch (e) {
                        console.error('Error loading ' + id + ':', e);
                    }
                }));
            }
        } catch (e) {
            console.error('Error in loadGearSounds:', e);
        } finally {
            gearLoading = false;
        }
    }

    // A crisp, resonant clank for striking clockwork gears.
    function gearClank(volumeScale = 1.0) {
        const c = ac(); if (!c) return;
        const t = c.currentTime;
        const vol = Math.max(0, typeof volumeScale === 'number' ? volumeScale : 1.0);
        const ready = gearBuffers.filter(Boolean);
        if (ready.length) {
            const buf = ready[(Math.random() * ready.length) | 0];
            const src = c.createBufferSource();
            src.buffer = buf;
            // slight detune so repeated blows never sound identical
            if (src.detune && src.detune.setValueAtTime) {
                src.detune.setValueAtTime((Math.random() * 2 - 1) * 140, t);
            }
            const g = c.createGain();
            g.gain.setValueAtTime(0.88 * vol, t);
            src.connect(g);
            g.connect(masterGain || c.destination);
            src.start(t);
            if (ready.length < GEAR_IDS.length) loadGearSounds();
            return;
        }
        loadGearSounds();
        // synth fallback: metallic ratchet/click
        const o = c.createOscillator();
        o.type = 'square';
        o.frequency.setValueAtTime(650, t);
        o.frequency.exponentialRampToValueAtTime(180, t + 0.06);
        o.connect(env(c, 0.25 * vol, 0.08, t));
        o.start(t); o.stop(t + 0.10);

        const o2 = c.createOscillator();
        o2.type = 'triangle';
        o2.frequency.setValueAtTime(320, t);
        o2.frequency.exponentialRampToValueAtTime(90, t + 0.12);
        o2.connect(env(c, 0.45 * vol, 0.14, t));
        o2.start(t); o2.stop(t + 0.16);

        const n = noise(c);
        const f = c.createBiquadFilter();
        f.type = 'highpass';
        f.frequency.setValueAtTime(1800, t);
        n.connect(f); f.connect(env(c, 0.35 * vol, 0.05, t));
        n.start(t); n.stop(t + 0.08);
    }

    // A dull, dead clunk for hammer blows on metal bands, blocks, padlocks and chains.
    function metalThud() {
        const c = ac(); if (!c) return;
        const t = c.currentTime;
        const ready = metalThudBuffers.filter(Boolean);
        if (ready.length) {
            const buf = ready[(Math.random() * ready.length) | 0];
            const src = c.createBufferSource();
            src.buffer = buf;
            // slight detune so repeated blows never sound identical
            if (src.detune && src.detune.setValueAtTime) {
                src.detune.setValueAtTime((Math.random() * 2 - 1) * 120, t);
            }
            const g = c.createGain();
            g.gain.setValueAtTime(0.85, t);
            src.connect(g);
            g.connect(masterGain || c.destination);
            src.start(t);
            if (ready.length < METAL_THUD_IDS.length) loadMetalThuds();
            return;
        }
        loadMetalThuds();
        // synth fallback: low damped body + a short muffled metallic knock
        const o = c.createOscillator();
        o.type = 'triangle';
        o.frequency.setValueAtTime(180, t);
        o.frequency.exponentialRampToValueAtTime(62, t + 0.10);
        o.connect(env(c, 0.6, 0.16, t));
        o.start(t); o.stop(t + 0.22);

        const o2 = c.createOscillator();
        o2.type = 'square';
        o2.frequency.setValueAtTime(430, t);
        o2.frequency.exponentialRampToValueAtTime(150, t + 0.07);
        o2.connect(env(c, 0.10, 0.09, t));
        o2.start(t); o2.stop(t + 0.14);

        const n = noise(c);
        const f = c.createBiquadFilter();
        f.type = 'bandpass';
        f.frequency.setValueAtTime(700, t);
        f.Q.setValueAtTime(1.2, t);
        n.connect(f); f.connect(env(c, 0.28, 0.08, t));
        n.start(t); n.stop(t + 0.12);
    }

    async function loadHammerSound() {
        if (hammerBuffer || hammerLoading) return;
        hammerLoading = true;
        try {
            const c = ac();
            if (c) {
                const resp = await fetch(getAssetUrl('hammer_strike'));
                const arrayBuffer = await resp.arrayBuffer();
                hammerBuffer = await decodeAudioDataSafe(c, arrayBuffer);
            }
        } catch (e) {
            console.error('Error loading hammer sound:', e);
        } finally {
            hammerLoading = false;
        }
    }

    async function loadSoftBounceSound() {
        if (softBounceBuffer || softBounceLoading) return;
        softBounceLoading = true;
        try {
            const c = ac();
            if (c) {
                const resp = await fetch(getAssetUrl('soft_bounce'));
                const arrayBuffer = await resp.arrayBuffer();
                softBounceBuffer = await decodeAudioDataSafe(c, arrayBuffer);
            }
        } catch (e) {
            console.error('Error loading soft bounce sound:', e);
        } finally {
            softBounceLoading = false;
        }
    }

    async function loadMusic() {
        if (musicBuffer || musicLoading) return;
        musicLoading = true;
        try {
            const c = ac();
            if (c) {
                const resp = await fetch(getAssetUrl('archaeological_bgm'));
                const arrayBuffer = await resp.arrayBuffer();
                musicBuffer = await decodeAudioDataSafe(c, arrayBuffer);
                if (musicRequested) {
                    startMusic();
                }
            }
        } catch (e) {
            console.error('Error loading music:', e);
        } finally {
            musicLoading = false;
        }
    }

    function ac(autoResume = true) {
        if (!window._cubeAudioCtx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return null;
            window._cubeAudioCtx = new AC();

            // Two independent buses. `masterGain` is the SFX bus (every one-shot below
            // connects to it) and `musicGain` is the music bus — they must NOT be
            // chained: routing music through the SFX gain made the SFX slider a master
            // volume, so dragging it to 0 silenced the music and left the music slider
            // doing nothing.
            window._cubeMasterGain = window._cubeAudioCtx.createGain();
            window._cubeMasterGain.gain.value = window.masterVolume !== undefined ? window.masterVolume : 1.0;
            window._cubeMasterGain.connect(window._cubeAudioCtx.destination);

            window._cubeMusicGain = window._cubeAudioCtx.createGain();
            window._cubeMusicGain.gain.value = window.musicVolume !== undefined ? window.musicVolume : 0.5;
            window._cubeMusicGain.connect(window._cubeAudioCtx.destination);

            // The context can be created long after the host reported its audio
            // state, so re-apply it to the fresh nodes rather than trusting the
            // defaults above.
            if (!hostAudioEnabled) {
                window._cubeMasterGain.gain.value = 0;
                window._cubeMusicGain.gain.value = 0;
            }
        }
        ctx = window._cubeAudioCtx;
        masterGain = window._cubeMasterGain;
        musicGain = window._cubeMusicGain;

        if (autoResume && ctx.state === 'suspended') {
            ctx.resume().catch(() => { });
        }
        return ctx;
    }

    // The host owns whether this game may make a sound at all. The in-game sliders
    // are granular SFX/music trims that ride UNDERNEATH it — they can never turn
    // audio back on while the host has it off, which is what the platform requires.
    let hostAudioEnabled = true;

    // Assigned rather than scheduled. An automation event and the param's own
    // value are separate things, and mixing them makes "is this bus actually
    // muted right now?" unanswerable — which is a poor property for the one
    // control the platform requires the game to honour. Direct assignment takes
    // effect at once and reads back, so the host-mute state is verifiable.
    // Named holds on the context, and whether they have gone as far as muting — see
    // pauseForVisibility() below. Declared up here because applyGains() is the mute
    // half of a hold and runs long before that code.
    const audioHolds = new Set();
    let holdsMuted = false;

    function applyGains() {
        const audible = hostAudioEnabled && !holdsMuted;
        if (masterGain) masterGain.gain.value = audible ? window.masterVolume : 0;
        if (musicGain) musicGain.gain.value = audible ? window.musicVolume : 0;
    }

    // Called from the portal bridge with the host's initial state and on every
    // change. Takes effect immediately.
    function setHostAudioEnabled(on) {
        hostAudioEnabled = on !== false;
        applyGains();
    }

    function setMasterVol(val) {
        window.masterVolume = val;
        applyGains();
    }

    function setMusicVol(val) {
        window.musicVolume = val;
        applyGains();
    }

    let noiseBuf = null;
    function noise(c) {
        if (!noiseBuf) {
            noiseBuf = c.createBuffer(1, c.sampleRate * 0.5, c.sampleRate);
            const d = noiseBuf.getChannelData(0);
            for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        }
        const src = c.createBufferSource();
        src.buffer = noiseBuf;
        return src;
    }
    function env(c, peak, decay, when) {
        const g = c.createGain();
        g.gain.setValueAtTime(0.0001, when);
        g.gain.exponentialRampToValueAtTime(peak, when + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0001, when + decay);
        g.connect(masterGain || c.destination);
        return g;
    }

    function thunk(isIce = false, volumeScale = 1.0, pitchOffset = 0) {
        const c = ac(); if (!c) return;
        const t = c.currentTime;
        const vol = Math.max(0, typeof volumeScale === 'number' ? volumeScale : 1.0);
        const pitch = typeof pitchOffset === 'number' ? pitchOffset : 0;
        if (isIce) {
            const bufferToPlay = (iceCounter % 2 === 0) ? iceBuffer : (iceBuffer2 || iceBuffer);
            iceCounter++;
            if (bufferToPlay) {
                const src = c.createBufferSource();
                src.buffer = bufferToPlay;
                // Add random detune (±200 cents) + pitchOffset for crystalline variety
                if (src.detune && src.detune.setValueAtTime) {
                    src.detune.setValueAtTime((Math.random() * 2 - 1) * 200 + pitch, t);
                }
                const g = c.createGain();
                g.gain.setValueAtTime(0.75 * vol, t);
                src.connect(g);
                g.connect(masterGain || c.destination);
                src.start(t);
            } else {
                loadIceSound();
                // High-pitched "chink" sound (ice/glass cracking)
                // Multiple inharmonic high-frequency oscillators for a metallic/glassy crystal ring
                const frequencies = [2600, 3750, 4900, 6300];
                frequencies.forEach((freq, idx) => {
                    const o = c.createOscillator();
                    o.type = 'sine';
                    const fVal = freq * Math.pow(2, pitch / 1200);
                    o.frequency.setValueAtTime(fVal, t);
                    o.frequency.linearRampToValueAtTime(fVal * 0.95, t + 0.04);

                    // Very fast decay for icy crystal tines (0.04s - 0.12s)
                    const decay = 0.04 + (idx * 0.025);
                    o.connect(env(c, (0.15 / (idx + 1)) * vol, decay, t));
                    o.start(t);
                    o.stop(t + decay + 0.05);
                });

                // Sharp frosty crackle noise
                const n = noise(c);
                const f = c.createBiquadFilter();
                f.type = 'highpass';
                f.frequency.setValueAtTime(3200, t); // Keeps it extremely crisp and icy
                n.connect(f);
                f.connect(env(c, 0.4, 0.05, t)); // Super short snap
                n.start(t);
                n.stop(t + 0.07);
            }
        } else if (hammerBuffer) {
            const src = c.createBufferSource();
            src.buffer = hammerBuffer;
            // Add random detune (±250 cents) + pitchOffset for organic variety
            if (src.detune && src.detune.setValueAtTime) {
                src.detune.setValueAtTime((Math.random() * 2 - 1) * 250 + pitch, t);
            }
            const g = c.createGain();
            g.gain.setValueAtTime(0.7 * vol, t);
            src.connect(g);
            g.connect(masterGain || c.destination);
            src.start(t);
        } else {
            loadHammerSound();
            const pitchFactor = Math.pow(2, pitch / 1200);
            const detune = (Math.random() * 2 - 1) * 10; // small freq shift for synth fallback
            // Main punchy impact
            const o = c.createOscillator();
            o.type = 'triangle';
            o.frequency.setValueAtTime((130 + detune) * pitchFactor, t);
            o.frequency.exponentialRampToValueAtTime((38 + detune) * pitchFactor, t + 0.13);
            o.connect(env(c, 0.7 * vol, 0.2, t));
            o.start(t); o.stop(t + 0.25);

            // Low-end resonance (subtle boom)
            const o2 = c.createOscillator();
            o2.type = 'sine';
            o2.frequency.setValueAtTime((75 + detune) * pitchFactor, t);
            o2.frequency.exponentialRampToValueAtTime((30 + detune) * pitchFactor, t + 0.3);
            o2.connect(env(c, 0.3 * vol, 0.5, t));
            o2.start(t); o2.stop(t + 0.6);

            // Impact noise/crack
            const n = noise(c);
            const f = c.createBiquadFilter();
            f.type = 'lowpass';
            f.frequency.setValueAtTime(1400, t);
            f.frequency.exponentialRampToValueAtTime(180, t + 0.12);
            n.connect(f); f.connect(env(c, 0.5 * vol, 0.16, t));
            n.start(t); n.stop(t + 0.2);
        }
    }

    function reveal() {
        const c = ac(); if (!c) return;
        const t = c.currentTime;
        [880, 1318.5].forEach((fq, i) => {
            const o = c.createOscillator();
            o.type = 'sine';
            o.frequency.value = fq;
            const g = c.createGain();
            g.gain.setValueAtTime(0.0001, t + i * 0.07);
            g.gain.exponentialRampToValueAtTime(0.10, t + i * 0.07 + 0.05);
            g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.07 + 0.8);
            o.connect(g); g.connect(masterGain || c.destination);
            o.start(t + i * 0.07); o.stop(t + i * 0.07 + 0.85);
        });
    }

    function chime(idx) {
        const c = ac(); if (!c) return;
        const t = c.currentTime;
        const base = [523.25, 659.25, 783.99][idx % 3];
        [base, base * 2].forEach((fq, i) => {
            const o = c.createOscillator();
            o.type = 'sine';
            o.frequency.value = fq;
            o.connect(env(c, i ? 0.08 : 0.22, 0.7, t));
            o.start(t); o.stop(t + 0.75);
        });
    }

    function win() {
        const c = ac(); if (!c) return;
        const t = c.currentTime;
        [523.25, 659.25, 783.99, 1046.5].forEach((fq, i) => {
            const o = c.createOscillator();
            o.type = 'sine';
            o.frequency.value = fq;
            o.connect(env(c, 0.18, 0.9, t + i * 0.12));
            o.start(t + i * 0.12); o.stop(t + i * 0.12 + 1);
        });
    }

    function startOverJingle() {
        const c = ac(); if (!c) return;
        const t = c.currentTime;
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
        notes.forEach((fq, i) => {
            const o = c.createOscillator();
            const g = c.createGain();
            o.type = 'triangle';
            o.frequency.setValueAtTime(fq, t + i * 0.07);
            g.gain.setValueAtTime(0.0001, t + i * 0.07);
            g.gain.exponentialRampToValueAtTime(0.15, t + i * 0.07 + 0.02);
            g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.07 + 0.35);
            o.connect(g);
            g.connect(masterGain || c.destination);
            o.start(t + i * 0.07);
            o.stop(t + i * 0.07 + 0.4);
        });
    }

    async function loadBouncySound() {
        if (bouncyBuffer || bouncyLoading) return;
        bouncyLoading = true;
        try {
            const c = ac();
            if (c) {
                const resp = await fetch(getAssetUrl('bouncy'));
                const arrayBuffer = await resp.arrayBuffer();
                bouncyBuffer = await decodeAudioDataSafe(c, arrayBuffer);
            }
        } catch (e) {
            console.error('Error loading bouncy sound:', e);
        } finally {
            bouncyLoading = false;
        }
    }

    function bouncy(volumeScale = 1.0) {
        const c = ac(); if (!c) return;
        const t = c.currentTime;
        const vol = Math.max(0, typeof volumeScale === 'number' ? volumeScale : 1.0);
        if (bouncyBuffer) {
            const src = c.createBufferSource();
            src.buffer = bouncyBuffer;
            // Increased random detune for wider pitch variety
            if (src.detune && src.detune.setValueAtTime) {
                src.detune.setValueAtTime((Math.random() * 2 - 1) * 450, t);
            }
            const g = c.createGain();
            g.gain.setValueAtTime(0.88 * vol, t);
            src.connect(g);
            g.connect(masterGain || c.destination);
            // Play from a random offset within the first 5% of the audio clip
            const offset = Math.random() * (bouncyBuffer.duration * 0.05);
            src.start(t, offset);
        } else {
            loadBouncySound();
            // Synth fallback: cartoon boing / spring glide
            const o = c.createOscillator();
            o.type = 'sine';
            const f0 = 160 + (Math.random() * 2 - 1) * 70;
            o.frequency.setValueAtTime(f0, t);
            o.frequency.exponentialRampToValueAtTime(f0 * 2.2, t + 0.08);
            o.frequency.exponentialRampToValueAtTime(f0 * 0.8, t + 0.28);
            const g = c.createGain();
            g.gain.setValueAtTime(0.001, t);
            g.gain.exponentialRampToValueAtTime(0.35 * vol, t + 0.03);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
            o.connect(g);
            g.connect(masterGain || c.destination);
            o.start(t);
            o.stop(t + 0.35);
        }
    }

    // Two brittle dragon egg shell cracks; one is picked at random on egg strikes.
    const EGG_CRACK_IDS = ['egg_crack_1', 'egg_crack_2'];

    async function loadEggSounds() {
        if (eggLoading) return;
        eggLoading = true;
        try {
            const c = ac();
            if (c) {
                await Promise.all(EGG_CRACK_IDS.map(async (id, i) => {
                    if (eggBuffers[i]) return;
                    try {
                        const resp = await fetch(getAssetUrl(id));
                        const arrayBuffer = await resp.arrayBuffer();
                        eggBuffers[i] = await decodeAudioDataSafe(c, arrayBuffer);
                    } catch (e) {
                        console.error('Error loading ' + id + ':', e);
                    }
                }));
            }
        } catch (e) {
            console.error('Error in loadEggSounds:', e);
        } finally {
            eggLoading = false;
        }
    }

    // Brittle fracture sound for striking dragon eggshell with heavy detuning
    function eggCrack(volumeScale = 1.0) {
        const c = ac(); if (!c) return;
        const t = c.currentTime;
        const vol = Math.max(0, typeof volumeScale === 'number' ? volumeScale : 1.0);
        const ready = eggBuffers.filter(Boolean);
        if (ready.length) {
            const buf = ready[(Math.random() * ready.length) | 0];
            const src = c.createBufferSource();
            src.buffer = buf;
            // A lot of random detune (±600 cents) for varied eggshell fractures
            if (src.detune && src.detune.setValueAtTime) {
                src.detune.setValueAtTime((Math.random() * 2 - 1) * 600, t);
            }
            const g = c.createGain();
            g.gain.setValueAtTime(0.85 * vol, t);
            src.connect(g);
            g.connect(masterGain || c.destination);
            src.start(t);
            if (ready.length < EGG_CRACK_IDS.length) loadEggSounds();
            return;
        }
        loadEggSounds();
        // Synth fallback: sharp brittle snap / crackle
        const n = noise(c);
        const f = c.createBiquadFilter();
        f.type = 'highpass';
        f.frequency.setValueAtTime(2400 + (Math.random() * 2 - 1) * 600, t);
        n.connect(f);
        f.connect(env(c, 0.45 * vol, 0.06, t));
        n.start(t);
        n.stop(t + 0.08);

        const o = c.createOscillator();
        o.type = 'triangle';
        const f0 = 700 + (Math.random() * 2 - 1) * 200;
        o.frequency.setValueAtTime(f0, t);
        o.frequency.exponentialRampToValueAtTime(140, t + 0.05);
        o.connect(env(c, 0.25 * vol, 0.07, t));
        o.start(t);
        o.stop(t + 0.09);
    }

    function bounce() {
        const c = ac(); if (!c) return;
        const t = c.currentTime;
        if (softBounceBuffer) {
            const src = c.createBufferSource();
            src.buffer = softBounceBuffer;
            const g = c.createGain();
            g.gain.setValueAtTime(0.8, t);
            src.connect(g);
            g.connect(masterGain || c.destination);
            src.start(t);
        } else {
            loadSoftBounceSound();
            // Synth fallback: low soft thump
            const o = c.createOscillator();
            o.type = 'sine';
            o.frequency.setValueAtTime(100, t);
            o.frequency.exponentialRampToValueAtTime(40, t + 0.2);
            const g = c.createGain();
            g.gain.setValueAtTime(0.001, t);
            g.gain.exponentialRampToValueAtTime(0.3, t + 0.05);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
            o.connect(g);
            g.connect(masterGain || c.destination);
            o.start(t);
            o.stop(t + 0.4);
        }
    }

    // Pay the AudioContext construction + noise-buffer cost up front so the first
    // strike doesn't hitch. Safe to call before a user gesture (context stays
    // suspended until the first real sound resumes it).
    function shatter() {
        const c = ac(); if (!c) return;
        const t = c.currentTime;

        // Gentle, high-pitched "crystal" break sound for shattering ice
        const frequencies = [1200, 1850, 2600];
        frequencies.forEach((freq, idx) => {
            const o = c.createOscillator();
            o.type = 'triangle';
            o.frequency.setValueAtTime(freq, t);
            o.frequency.exponentialRampToValueAtTime(freq * 0.85, t + 0.25);

            const g = c.createGain();
            g.gain.setValueAtTime(0.0001, t);
            g.gain.exponentialRampToValueAtTime(0.12 / (idx + 1), t + 0.01);
            g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
            g.connect(masterGain || c.destination);

            o.connect(g);
            o.start(t);
            o.stop(t + 0.4);
        });

        // Sharp crispy frost crackle noise
        const n = noise(c);
        const f = c.createBiquadFilter();
        f.type = 'highpass';
        f.frequency.setValueAtTime(2800, t);
        n.connect(f);
        f.connect(env(c, 0.35, 0.2, t));
        n.start(t);
        n.stop(t + 0.25);
    }

    // Explosive charge: deep body thump + a bright crack + a filtered debris tail.
    function boom() {
        const c = ac(); if (!c) return;
        const t = c.currentTime;

        const o = c.createOscillator();
        o.type = 'sine';
        o.frequency.setValueAtTime(170, t);
        o.frequency.exponentialRampToValueAtTime(28, t + 0.5);
        o.connect(env(c, 0.85, 0.8, t));
        o.start(t); o.stop(t + 0.9);

        const o2 = c.createOscillator();
        o2.type = 'square';
        o2.frequency.setValueAtTime(440, t);
        o2.frequency.exponentialRampToValueAtTime(62, t + 0.22);
        o2.connect(env(c, 0.22, 0.26, t));
        o2.start(t); o2.stop(t + 0.32);

        const n = noise(c);
        const f = c.createBiquadFilter();
        f.type = 'lowpass';
        f.frequency.setValueAtTime(2800, t);
        f.frequency.exponentialRampToValueAtTime(280, t + 0.5);
        n.connect(f); f.connect(env(c, 0.65, 0.55, t));
        n.start(t); n.stop(t + 0.6);
    }

    function preloadAllAudio() {
        const c = ac(false);
        if (!c) return;
        loadHammerSound();
        loadIceSound();
        loadMetalThuds();
        loadGearSounds();
        loadSoftBounceSound();
        loadBouncySound();
        loadEggSounds();
        loadMusic();
    }

    function warm() {
        const c = ac(true); if (!c) return;
        preloadAllAudio();
        try {
            const buf = c.createBuffer(1, 1, 22050);
            const src = c.createBufferSource();
            src.buffer = buf;
            src.connect(c.destination);
            src.start(0);
        } catch (e) { }
        noise(c);
    }

    // Immediately initiate non-blocking background fetch & audio decode for all sound assets
    preloadAllAudio();

    // Unlock audio on first user touch / pointer gesture
    window.addEventListener('pointerdown', function unlockAudioOnFirstGesture() {
        warm();
    }, { once: true, passive: true });

    // Music state stays private to this audio kit. Keeping it out of `window` avoids
    // accidental coupling with hot reloads or other game scripts.
    let musicPlaying = false;
    let musicRequested = false;

    function startMusic() {
        musicRequested = true;
        if (musicPlaying) return;
        const c = ac(true); if (!c) return;

        if (musicBuffer) {
            musicPlaying = true;
            if (musicSource) {
                try { musicSource.stop(); } catch (e) { }
            }
            musicSource = c.createBufferSource();
            musicSource.buffer = musicBuffer;
            musicSource.loop = true;
            musicSource.connect(musicGain);
            musicSource.start(0);
        } else {
            loadMusic();
        }
    }

    function stopMusic() {
        musicRequested = false;
        if (!musicPlaying) return;
        musicPlaying = false;
        if (musicSource) {
            try {
                musicSource.stop();
                musicSource.disconnect();
            } catch (e) { }
            musicSource = null;
        }
    }

    // Browser audio keeps running when a tab is backgrounded unless we explicitly
    // suspend its shared context. Suspend only a context that was already playing, so
    // returning to a tab never bypasses the browser's first-gesture audio policy.
    //
    // Pause sources overlap — an interstitial pauses for the ad while the portal
    // independently fires its own host pause over the top of it — so each one takes a
    // named hold and the context only wakes when the last hold is released. A plain
    // boolean recomputed from c.state cannot express that: the second pauser reads an
    // already-suspended context, concludes it never suspended anything, and both
    // resumes then decline to undo it, leaving the game silent for the rest of the
    // session. Holds are keyed by name rather than counted so an unmatched resume
    // is a no-op instead of driving a counter negative.
    //
    // A hold silences in two stages, neither of them immediate, because the most
    // common ad break by far is the one that never fills: it is requested, settles a
    // few hundred ms later with nothing shown, and a hold that acted at once would
    // make every level change audibly dip for an ad the player never saw. Muting the
    // buses is cheap and reversible, so it waits out a short grace; suspending the
    // context is the expensive half — it takes the audio thread down and back up,
    // which is heard as a gap — so it waits considerably longer. Releasing every hold
    // inside a grace cancels that stage, and a break that never fills clears both
    // before either fires, leaving the audio untouched.
    const MUTE_GRACE_MS = 220;
    const SUSPEND_GRACE_MS = 900;
    let muteTimer = 0;
    let suspendTimer = 0;
    let visibilityAudioSuspended = false;

    function pauseForVisibility(reason) {
        audioHolds.add(reason || 'host');

        if (!muteTimer && !holdsMuted) {
            muteTimer = setTimeout(() => {
                muteTimer = 0;
                if (!audioHolds.size) return; // released during the grace period
                holdsMuted = true;
                applyGains();
            }, MUTE_GRACE_MS);
        }

        if (suspendTimer) return; // an earlier hold is already counting down
        suspendTimer = setTimeout(() => {
            suspendTimer = 0;
            if (!audioHolds.size) return;
            const c = window._cubeAudioCtx;
            // Sticky on purpose: whoever found it running owns the resume, and a later
            // hold arriving after the suspend must not clear that duty.
            if (c && c.state === 'running') {
                visibilityAudioSuspended = true;
                c.suspend().catch(() => { visibilityAudioSuspended = false; });
            }
        }, SUSPEND_GRACE_MS);
    }


    // Auto-resume suspended AudioContext on window focus
    window.addEventListener('focus', () => {
        const c = ac(false);
        if (c && (c.state === 'suspended' || c.state === 'interrupted')) {
            c.resume().catch(() => { });
        }
    });

    function resumeFromVisibility(reason) {
        audioHolds.delete(reason || 'host');
        if (audioHolds.size) return; // another pause source is still holding it down
        if (muteTimer) { clearTimeout(muteTimer); muteTimer = 0; }
        if (suspendTimer) { clearTimeout(suspendTimer); suspendTimer = 0; }
        if (holdsMuted) { holdsMuted = false; applyGains(); }
        const c = window._cubeAudioCtx;
        if (!visibilityAudioSuspended || !c) return;
        visibilityAudioSuspended = false;
        if (c.state === 'suspended') c.resume().catch(() => { });
    }


    // Message Bus integration for Audio
    if (window.Game && window.Game.bus) {
        const bus = window.Game.bus;
        bus.subscribe('audio:play', (data) => {
            if (!data) return;
            const sfx = typeof data === 'string' ? data : data.sfx;
            const arg = data && data.arg;
            const vol = data && (data.volumeScale !== undefined ? data.volumeScale : data.vol);
            if (sfx === 'thunk') thunk(arg, vol !== undefined ? vol : 1.0);
            else if (sfx === 'gear' || sfx === 'gearClank') gearClank(vol !== undefined ? vol : 1.0);
            else if (sfx === 'bounce') bounce();
            else if (sfx === 'bouncy') bouncy(vol !== undefined ? vol : 1.0);
            else if (sfx === 'eggCrack') eggCrack(vol !== undefined ? vol : 1.0);
            else if (sfx === 'shatter') shatter();
            else if (sfx === 'metalThud') metalThud();
            else if (sfx === 'boom') boom();
            else if (sfx === 'reveal') reveal();
            else if (sfx === 'chime') chime(arg !== undefined ? arg : 0);
            else if (sfx === 'win') win();
            else if (sfx === 'startOverJingle') startOverJingle();
        });
        bus.subscribe('audio:music:start', () => startMusic());
        bus.subscribe('audio:music:stop', () => stopMusic());
        bus.subscribe('audio:warm', () => warm());
        bus.subscribe('audio:volume:master', (data) => setMasterVol(data && data.volume !== undefined ? data.volume : data));
        bus.subscribe('audio:volume:music', (data) => setMusicVol(data && data.volume !== undefined ? data.volume : data));
        bus.subscribe('audio:visibility', (data) => {
            const reason = (data && data.reason) || 'visibility';
            if (data && data.hidden) pauseForVisibility(reason);
            else resumeFromVisibility(reason);
        });
    }

    window.CubeCrackerAudio = { thunk, gearClank, metalThud, shatter, boom, reveal, chime, win, startOverJingle, bounce, bouncy, eggCrack, warm, preloadAllAudio, startMusic, stopMusic, pauseForVisibility, resumeFromVisibility, setMasterVol, setMusicVol, setHostAudioEnabled };
})();
