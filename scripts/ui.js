// Gem Cracker - UI Overlays (Options & Level Select)
// Global Escape Key to close open overlays (Options / Level Select)
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const opt = document.getElementById('options-overlay');
        const lvl = document.getElementById('level-overlay');
        if (opt && opt.classList.contains('show')) opt.classList.remove('show');
        if (lvl && lvl.classList.contains('show')) lvl.classList.remove('show');
    }
});

window.renderLevelList = function () {
    const list = document.getElementById('level-list');
    if (!list) return;
    const total = (window.LEVELS && window.LEVELS.length) || window.LEVEL_NAME_KEYS.length;
    list.innerHTML = '';
    for (let i = 0; i < total; i++) {
        const row = document.createElement('button');
        row.type = 'button';
        row.className = 'level-row' + (window.level === i ? ' current' : '');
        const nameKey = window.LEVEL_NAME_KEYS[i] || 'stoneCube';
        const nameSpan = document.createElement('span');
        nameSpan.textContent = window._t(nameKey);
        const numSpan = document.createElement('span');
        numSpan.className = 'level-num';
        numSpan.textContent = String(i + 1);
        row.appendChild(nameSpan);
        row.appendChild(numSpan);

        const hasStars = !!(window.bestScores && window.bestScores[i] != null);
        const hasRing = !!(window.ringsFound && window.ringsFound[i]);
        // Keep the level card clean: never print a best-strike number here. A ring can
        // be found on an unfinished attempt, so it must render independently of stars.
        if (hasStars || hasRing) {
            const progress = document.createElement('span');
            progress.className = 'level-progress';
            if (hasStars) {
                const rank = window.starRankFor(i, window.bestScores[i]);
                const style = window.RANK_STYLE[rank.tier];
                const stars = document.createElement('span');
                stars.className = 'level-stars';
                stars.style.color = style.color;
                stars.textContent = window.rankStarsText(rank);
                progress.appendChild(stars);
            }
            if (hasRing) {
                const ring = document.createElement('span');
                ring.className = 'level-ring';
                ring.setAttribute('aria-label', 'Secret gold ring found');
                ring.setAttribute('title', 'Secret gold ring found');
                progress.appendChild(ring);
            }
            row.appendChild(progress);
        }

        row.addEventListener('click', (e) => {
            e.stopPropagation();
            const ov = document.getElementById('level-overlay');
            if (ov) ov.classList.remove('show');
            if (window.CubeCrackerGoToLevel) window.CubeCrackerGoToLevel(i);
        });
        list.appendChild(row);
    }
};

const initLevelSelect = () => {
    const btn = document.getElementById('level-select-btn');
    const overlay = document.getElementById('level-overlay');
    if (!btn || !overlay) return;

    // Clean up old listeners if hot-reloaded
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    const newOverlay = overlay.cloneNode(true);
    overlay.parentNode.replaceChild(newOverlay, overlay);

    newBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.CubeCrackerResetInput) window.CubeCrackerResetInput();
        window.renderLevelList();
        newOverlay.classList.add('show');
    });

    const closeBtn = newOverlay.querySelector('#level-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            newOverlay.classList.remove('show');
        });
    }

    newOverlay.addEventListener('click', (e) => {
        if (e.target === newOverlay) newOverlay.classList.remove('show');
    });

    window.renderLevelList();
};

// Options menu UI logic
const initOptions = () => {
    const btn = document.getElementById('options-btn');
    const overlay = document.getElementById('options-overlay');

    // Clean up old listeners if hot-reloaded
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    const newOverlay = overlay.cloneNode(true);
    overlay.parentNode.replaceChild(newOverlay, overlay);

    const newSfxSlider = newOverlay.querySelector('#sfx-volume');
    const sfxVal = newOverlay.querySelector('#sfx-val');
    const newMusicSlider = newOverlay.querySelector('#music-volume');
    const musicVal = newOverlay.querySelector('#music-val');
    const newLangSelect = newOverlay.querySelector('#lang-select');
    const newCloseBtn = newOverlay.querySelector('#settings-close');

    // Handle open / close
    newBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.CubeCrackerResetInput) window.CubeCrackerResetInput();
        // Sync select value when opening
        newLangSelect.value = window.currentLang;
        newOverlay.classList.add('show');
    });

    newCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        newOverlay.classList.remove('show');
    });

    newOverlay.addEventListener('click', (e) => {
        if (e.target === newOverlay) {
            newOverlay.classList.remove('show');
        }
    });

    // Handle slider inputs
    newSfxSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value) / 100;
        sfxVal.textContent = e.target.value + '%';
        if (window.CubeCrackerAudio && window.CubeCrackerAudio.setMasterVol) {
            window.CubeCrackerAudio.setMasterVol(val);
        } else {
            window.masterVolume = val;
        }
        window.saveGameSettings();
    });

    newMusicSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value) / 100;
        musicVal.textContent = e.target.value + '%';
        if (window.CubeCrackerAudio && window.CubeCrackerAudio.setMusicVol) {
            window.CubeCrackerAudio.setMusicVol(val);
        } else {
            window.musicVolume = val;
        }
        window.saveGameSettings();
    });

    // Handle Language dropdown change
    newLangSelect.addEventListener('change', (e) => {
        const newLang = e.target.value;
        if (window.currentLang === newLang) return;
        window.setGameLanguage(newLang);
    });

    const newShakeToggle = newOverlay.querySelector('#shake-toggle');
    const shakeStatus = newOverlay.querySelector('#shake-status');

    if (newShakeToggle) {
        newShakeToggle.addEventListener('change', (e) => {
            window.screenShakeEnabled = e.target.checked;
            window.saveGameSettings();
            if (shakeStatus) shakeStatus.textContent = window.screenShakeEnabled ? window._t('onText') : window._t('offText');
        });
    }

    const hapticsRow = newOverlay.querySelector('#haptics-row');
    const newHapticsToggle = newOverlay.querySelector('#haptics-toggle');
    const hapticsStatus = newOverlay.querySelector('#haptics-status');

    // A desktop browser can expose a vibration API, but haptics remain a mobile-only setting.
    const isMobile = navigator.userAgentData ? navigator.userAgentData.mobile :
        /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (hapticsRow) {
        hapticsRow.style.display = isMobile && typeof navigator.vibrate === 'function' ? 'flex' : 'none';
    }

    if (newHapticsToggle) {
        newHapticsToggle.addEventListener('change', (e) => {
            window.hapticsEnabled = e.target.checked;
            window.saveGameSettings();
            if (hapticsStatus) hapticsStatus.textContent = window.hapticsEnabled ? window._t('onText') : window._t('offText');
        });
    }

    // Paint every control from the current globals. Exposed because the saved
    // record arrives asynchronously from the platform, well after this panel is
    // built — without a repaint the sliders would sit at their defaults while the
    // game itself ran on the restored values.
    window.refreshOptionsUI = () => {
        newSfxSlider.value = Math.round(window.masterVolume * 100);
        sfxVal.textContent = newSfxSlider.value + '%';
        newMusicSlider.value = Math.round(window.musicVolume * 100);
        musicVal.textContent = newMusicSlider.value + '%';
        newLangSelect.value = window.currentLang;
        if (newShakeToggle) {
            newShakeToggle.checked = window.screenShakeEnabled !== false;
            if (shakeStatus) shakeStatus.textContent = newShakeToggle.checked ? window._t('onText') : window._t('offText');
        }
        if (newHapticsToggle) {
            newHapticsToggle.checked = window.hapticsEnabled !== false;
            if (hapticsStatus) hapticsStatus.textContent = newHapticsToggle.checked ? window._t('onText') : window._t('offText');
        }
    };
    window.refreshOptionsUI();
};


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { initOptions(); initLevelSelect(); });
} else {
    initOptions();
    initLevelSelect();
}
