// Gem Cracker - Localization, Translations and Ranking System
// Gems in the cube - game logic (extracted from index.html into game.js)
// Order matters: defaults -> fracture -> audio -> main game


// Global Volume & Language Defaults
window.masterVolume = 1.0;
window.musicVolume = 0.5;
window.hapticsEnabled = true;

// Map a BCP-47 tag from the host to one of our locales, falling back to English.
// The tag is supplied by the portal bridge (GameSDK.getLanguage()) — reading the
// browser's own locale preference is forbidden on YouTube Playables and the
// certification scan greps the shipped bundle as text, so no such call may exist
// here even on a path Playables never runs.
const normalizeLocale = (tag) => {
    const playerLang = String(tag || 'en').toLowerCase();
    if (playerLang.startsWith('zh')) {
        // Distinguish Traditional Chinese from Simplified Chinese
        if (playerLang.includes('hant') || playerLang.includes('tw') || playerLang.includes('hk') || playerLang.includes('mo')) {
            return 'zh-hant';
        }
        return 'zh';
    }
    const primary = playerLang.split('-')[0];
    const supported = ['en', 'es', 'fr', 'ar', 'hi', 'ja', 'ru'];
    return supported.includes(primary) ? primary : 'en';
};

// English until the host tells us otherwise; bootPlatform() resolves the real one.
window.currentLang = 'en';
window.screenShakeEnabled = true;
// null = not played in this run. It has to be distinguishable from 0: a level left
// at 0 rendered as "0 hits" with no star rating, which reads as a flawless clear
// rather than one the player never reached.
window.hitsPerLevel = Array(13).fill(null);
window.bestScores = Array(13).fill(null);

// ---------- saved state ----------
// One record holds everything that outlives a session: per-level records, the
// secret rings, and the options panel. It goes through the portal bridge rather
// than any browser-side persistence mechanism — YouTube Playables forbids those
// outright, and the certification scan reads the bundle as text, so no such call
// may appear here at all.
//
// Writes are debounced: the volume sliders fire on every input event, and each
// one would otherwise be a round trip to the platform. A host pause flushes
// immediately (see bootPlatform), which is the case that actually matters — it
// is the last moment before the player is gone.
const SAVE_VERSION = 1;
const SETTINGS_LANGS = ['en', 'es', 'fr', 'zh', 'zh-hant', 'ar', 'hi', 'ja', 'ru'];
const SAVE_DEBOUNCE_MS = 400;
let saveTimer = 0;
let saveLoaded = false;   // don't write before the load lands and clobber it

function currentSaveRecord() {
    return {
        v: SAVE_VERSION,
        bestScores: window.bestScores,
        ringsFound: window.ringsFound,
        settings: {
            masterVolume: window.masterVolume,
            musicVolume: window.musicVolume,
            screenShakeEnabled: window.screenShakeEnabled !== false,
            hapticsEnabled: window.hapticsEnabled !== false,
        },
    };
}

window.persistGameState = function (opts) {
    const immediate = !!(opts && opts.immediate);
    // A write issued before the initial load would be overwritten by that load's
    // merge a moment later, so hold everything until it has landed.
    if (!saveLoaded && !immediate) return;
    clearTimeout(saveTimer);
    saveTimer = 0;
    const flush = () => {
        saveTimer = 0;
        if (!window.GameSDK) return;
        window.GameSDK.saveJSON(currentSaveRecord());
    };
    if (immediate) flush();
    else saveTimer = setTimeout(flush, SAVE_DEBOUNCE_MS);
};

// Kept as its own name because the options panel calls it from five places.
window.saveGameSettings = function () { window.persistGameState(); };

// Merge, never overwrite: the player may already have set a record or found a
// ring in the seconds before the platform answered, and a wholesale swap would
// throw that away.
window.applySavedState = function (state) {
    saveLoaded = true;
    if (!state || typeof state !== 'object') return;

    if (Array.isArray(state.bestScores)) {
        for (let i = 0; i < state.bestScores.length && i < window.bestScores.length; i++) {
            const saved = state.bestScores[i];
            if (saved != null && (window.bestScores[i] == null || saved < window.bestScores[i])) {
                window.bestScores[i] = saved;
            }
        }
    }
    if (Array.isArray(state.ringsFound)) {
        for (let i = 0; i < state.ringsFound.length && i < window.ringsFound.length; i++) {
            if (state.ringsFound[i]) window.ringsFound[i] = true;
        }
    }

    const st = state.settings;
    if (st && typeof st === 'object') {
        const vol = (v, fallback) => (typeof v === 'number' && v >= 0 && v <= 1 ? v : fallback);
        window.masterVolume = vol(st.masterVolume, window.masterVolume);
        window.musicVolume = vol(st.musicVolume, window.musicVolume);
        if (typeof st.screenShakeEnabled === 'boolean') window.screenShakeEnabled = st.screenShakeEnabled;
        if (typeof st.hapticsEnabled === 'boolean') window.hapticsEnabled = st.hapticsEnabled;
    }

    if (window.CubeCrackerAudio) {
        window.CubeCrackerAudio.setMasterVol(window.masterVolume);
        window.CubeCrackerAudio.setMusicVol(window.musicVolume);
    }
    if (window.refreshOptionsUI) window.refreshOptionsUI();
    if (window.renderLevelList) window.renderLevelList();
    if (window.applyTranslations) window.applyTranslations();
};

window.TRANSLATIONS = {
    en: {
        title: "Gem Cracker",
        loading: "Loading",
        dragHint: "drag to rotate - tap to strike",
        searchGemsHint: "search for hidden gems",
        gemGleams: "You found a gem!",
        gemsRemain2: "two gems remain",
        gemsRemain1: "one gem remains",
        iceHint: "ice - cracks then shatters when struck twice",
        iceShatterHint: "strike again to shatter it",
        metalHint: "Metal: hard to destroy",
        levelHint: "level {num} - {name}",
        stoneCube: "STONE CUBE",
        stonePillar: "STONE PILLAR",
        sandstonePyramid: "SANDSTONE PYRAMID",
        wonCubeCracked: "CUBE CRACKED",
        wonPillarCracked: "PILLAR CRACKED",
        wonPyramidCracked: "PYRAMID CRACKED",
        wonHeartShattered: "HEART SHATTERED",
        iceHeart: "FROZEN HEART",
        obsidianGeode: "OBSIDIAN GEODE",
        wonGeodeCracked: "GEODE CRACKED",
        obsidianHint: "obsidian - cracks, then splinters",
        obsidianCrackHint: "strike again to break",
        moltenCore: "MOLTEN CORE",
        wonCoreQuenched: "CORE QUENCHED",
        moltenHint: "hit rock, make it erupt",
        moltenRaceHint: "dig fast - lava hardens",
        moltenCrustHint: "crust - strike it twice",
        clockworkSphere: "CLOCKWORK SPHERE",
        wonClockworkStopped: "CLOCKWORK STOPPED",
        clockworkHint: "smash gears, find dirt",
        fossilizedTrunk: "FOSSILIZED TRUNK",
        wonTrunkSplit: "TRUNK SPLIT",
        petrifiedHint: "peel rings one by one",
        petrifiedBarkHint: "the bark is split - strike it again to peel it away",
        honeycombHive: "HONEYCOMB HIVE",
        wonHiveBroken: "HIVE BROKEN",
        hiveHint: "Honeycomb self-heals",
        chainReliquary: "CHAIN-BOUND CHEST",
        wonReliquaryOpened: "CHEST OPENED",
        reliquaryHint: "break both front locks",
        reliquaryBlockedHint: "Chains can't break - Strike its lock",
        reliquaryLockHint: "the padlock is buckling - keep hitting it",
        reliquaryLockLeftHint: "one padlock left - smash it too",
        reliquaryOpenHint: "the chains fell away - smash in and dig out the clumps",
        fallenStar: "FALLEN STAR",
        wonStarDimmed: "STAR DIMMED",
        starHint: "fallen star - it peels away one glowing shell at a time",
        starDarkHint: "the star shines when struck",
        dragonEgg: "DRAGON EGG",
        wonEggPlundered: "EGG PLUNDERED",
        greatCube: "GREAT CUBE",
        wonGreatCubeCracked: "GREAT CUBE CRACKED",
        greatCubeHint: "five gems - uncover them all",
        gemsRemain3: "three gems remain",
        gemsRemain4: "four gems remain",
        eggHint: "Shell regenerates. Break quickly.",
        gemsClaimed: "all gems claimed in {strikes} strikes",
        nextTrial: "NEXT TRIAL",
        startOver: "START OVER",
        settings: "SETTINGS",
        sfxVolume: "SFX VOLUME",
        musicVolume: "MUSIC VOLUME",
        language: "LANGUAGE",
        close: "CLOSE",
        championshipComplete: "CHAMPIONSHIP COMPLETE",
        gameScoreboard: "GAME SCOREBOARD",
        totalHitsLabel: "TOTAL HITS: {total}",
        totalStarsLabel: "STARS: {stars}",
        bestScoreLabel: "BEST: {strikes}",
        secretRingLabel: "SECRET RING FOUND",
        rankGoldLabel: "GOLD RANK",
        rankSilverLabel: "SILVER RANK",
        rankBronzeLabel: "BRONZE RANK",
        levelHitsLabel: "{hits} HITS",
        levelStrikesLabel: "STRIKES:",

        levelsLabel: "LEVELS",
        selectLevelTitle: "SELECT LEVEL",
        newToolLabel: "NEW TOOL!",
        hammerToolName: "HAMMER",
        lensToolName: "GEM DETECTOR",
        bombToolName: "EXPLOSIVE CHARGE",
        bombSpent: "CHARGE SPENT",
        adUnavailable: "AD UNAVAILABLE",
        hapticsLabel: "HAPTICS",
        screenShakeLabel: "SCREEN SHAKE",
        onText: "ON",
        offText: "OFF"
    },
    es: {
        title: "Rompegemas",
        loading: "Cargando",
        dragHint: "arrastra para girar - toca para golpear",
        searchGemsHint: "busca las gemas ocultas",
        gemGleams: "¡Has encontrado una gema!",
        gemsRemain2: "quedan dos gemas",
        gemsRemain1: "queda una gema",
        iceHint: "hielo - se agrieta y luego se rompe al golpear dos veces",
        iceShatterHint: "golpea de nuevo para romperlo",
        metalHint: "Metal: difícil de destruir",
        levelHint: "nivel {num} - {name}",
        stoneCube: "CUBO DE PIEDRA",
        stonePillar: "PILAR DE PIEDRA",
        sandstonePyramid: "PIRÁMIDE DE ARENISCA",
        wonCubeCracked: "CUBO AGRIETADO",
        wonPillarCracked: "PILAR AGRIETADO",
        wonPyramidCracked: "PIRÁMIDE AGRIETADA",
        wonHeartShattered: "CORAZÓN DESTROZADO",
        iceHeart: "CORAZÓN CONGELADO",
        obsidianGeode: "GEODA DE OBSIDIANA",
        wonGeodeCracked: "GEODA AGRIETADA",
        obsidianHint: "obsidiana - se agrieta y luego se astilla",
        obsidianCrackHint: "golpea de nuevo para romperlo",
        moltenCore: "NÚCLEO FUNDIDO",
        wonCoreQuenched: "NÚCLEO APAGADO",
        moltenHint: "golpea la roca, hazla estallar",
        moltenRaceHint: "cava rápido - la lava se endurece",
        moltenCrustHint: "corteza - golpea dos veces",
        clockworkSphere: "ESFERA DE ENGRANAJES",
        wonClockworkStopped: "MECANISMO DETENIDO",
        clockworkHint: "rompe engranajes, halla tierra",
        fossilizedTrunk: "TRONCO FOSILIZADO",
        wonTrunkSplit: "TRONCO PARTIDO",
        petrifiedHint: "pela los anillos uno a uno",
        petrifiedBarkHint: "la corteza está rajada - golpéala otra vez para arrancarla",
        honeycombHive: "PANAL DE MIEL",
        wonHiveBroken: "PANAL ROTO",
        hiveHint: "el panal se regenera",
        chainReliquary: "COFRE ENCADENADO",
        wonReliquaryOpened: "COFRE ABIERTO",
        reliquaryHint: "rompe los dos candados frontales",
        reliquaryBlockedHint: "las cadenas no se rompen - golpea su candado",
        reliquaryLockHint: "el candado cede - sigue golpeándolo",
        reliquaryLockLeftHint: "queda un candado - rómpelo también",
        reliquaryOpenHint: "las cadenas cayeron - rómpelo y desentierra los terrones",
        fallenStar: "ESTRELLA CAÍDA",
        wonStarDimmed: "ESTRELLA APAGADA",
        starHint: "estrella caída - se desprende capa luminosa por capa",
        starDarkHint: "la estrella brilla al golpearla",
        dragonEgg: "HUEVO DE DRAGÓN",
        wonEggPlundered: "HUEVO SAQUEADO",
        greatCube: "GRAN CUBO",
        wonGreatCubeCracked: "GRAN CUBO ROTO",
        greatCubeHint: "cinco gemas - encuéntralas todas",
        gemsRemain3: "quedan tres gemas",
        gemsRemain4: "quedan cuatro gemas",
        eggHint: "la cáscara se regenera. rompe rápido.",
        gemsClaimed: "todas las gemas obtenidas en {strikes} golpes",
        nextTrial: "SIGUIENTE PRUEBA",
        startOver: "RECOMENZAR",
        settings: "AJUSTES",
        sfxVolume: "VOLUMEN SFX",
        musicVolume: "VOLUMEN MÚSICA",
        language: "IDIOMA",
        close: "CERRAR",
        championshipComplete: "CAMPEONATO COMPLETADO",
        gameScoreboard: "TABLA DE PUNTUACIÓN",
        totalHitsLabel: "GOLPES TOTALES: {total}",
        totalStarsLabel: "ESTRELLAS: {stars}",
        bestScoreLabel: "MEJOR: {strikes}",
        secretRingLabel: "ANILLO SECRETO ENCONTRADO",
        rankGoldLabel: "RANGO ORO",
        rankSilverLabel: "RANGO PLATA",
        rankBronzeLabel: "RANGO BRONCE",
        levelHitsLabel: "{hits} GOLPES",
        levelStrikesLabel: "GOLPES:",

        levelsLabel: "NIVELES",
        selectLevelTitle: "SELECCIONAR NIVEL",
        newToolLabel: "¡NUEVA HERRAMIENTA!",
        hammerToolName: "MARTILLO",
        lensToolName: "DETECTOR DE GEMAS",
        bombToolName: "CARGA EXPLOSIVA",
        bombSpent: "CARGA AGOTADA",
        adUnavailable: "ANUNCIO NO DISPONIBLE",
        hapticsLabel: "VIBRACIÓN HÁPTICA",
        screenShakeLabel: "VIBRACIÓN DE PANTALLA",
        onText: "ACTIVADO",
        offText: "DESACTIVADO"
    },
    fr: {
        title: "Briseur de Gemmes",
        loading: "Chargement",
        dragHint: "glisser pour tourner - taper pour frapper",
        searchGemsHint: "cherchez les gemmes cachées",
        gemGleams: "Vous avez trouvé une gemme !",
        gemsRemain2: "deux gemmes restantes",
        gemsRemain1: "une gemme restante",
        iceHint: "glace - se fissure puis se brise en frappant deux fois",
        iceShatterHint: "frappez à nouveau pour la briser",
        metalHint: "Métal : difficile à détruire",
        levelHint: "niveau {num} - {name}",
        stoneCube: "CUBE DE PIERRE",
        stonePillar: "PILIER DE PIERRE",
        sandstonePyramid: "PYRAMIDE DE GRÈS",
        wonCubeCracked: "CUBE BRISÉ",
        wonPillarCracked: "PILIER BRISÉ",
        wonPyramidCracked: "PYRAMIDE BRISÉE",
        wonHeartShattered: "CŒUR BRISÉ",
        iceHeart: "CŒUR GELÉ",
        obsidianGeode: "GÉODE D'OBSIDIENNE",
        wonGeodeCracked: "GÉODE BRISÉE",
        obsidianHint: "obsidienne - se fissure puis éclate",
        obsidianCrackHint: "frappez à nouveau pour briser",
        moltenCore: "CŒUR EN FUSION",
        wonCoreQuenched: "CŒUR REFROIDI",
        moltenHint: "frappez la roche, faites-la exploser",
        moltenRaceHint: "creusez vite - la lave durcit",
        moltenCrustHint: "croûte - frappez deux fois",
        clockworkSphere: "SPHÈRE D'HORLOGERIE",
        wonClockworkStopped: "MÉCANISME ARRÊTÉ",
        clockworkHint: "brisez les engrenages, trouvez la terre",
        fossilizedTrunk: "TRONC FOSSILISÉ",
        wonTrunkSplit: "TRONC FENDU",
        petrifiedHint: "retirez les cernes un à un",
        petrifiedBarkHint: "l'écorce est fendue - frappez encore pour l'arracher",
        honeycombHive: "RUCHE EN RAYONS",
        wonHiveBroken: "RUCHE BRISÉE",
        hiveHint: "le rayon se régénère",
        chainReliquary: "COFFRE ENCHAÎNÉ",
        wonReliquaryOpened: "COFFRE OUVERT",
        reliquaryHint: "brisez les deux cadenas à l'avant",
        reliquaryBlockedHint: "les chaînes ne cassent pas - frappez son cadenas",
        reliquaryLockHint: "le cadenas plie - continuez à frapper",
        reliquaryLockLeftHint: "un cadenas restant - brisez-le aussi",
        reliquaryOpenHint: "les chaînes sont tombées - défoncez et déterrez les mottes",
        fallenStar: "ÉTOILE TOMBÉE",
        wonStarDimmed: "ÉTOILE ÉTEINTE",
        starHint: "étoile tombée - elle se détache couche lumineuse par couche",
        starDarkHint: "l'étoile brille quand on la frappe",
        dragonEgg: "ŒUF DE DRAGON",
        wonEggPlundered: "ŒUF PILLÉ",
        greatCube: "GRAND CUBE",
        wonGreatCubeCracked: "GRAND CUBE BRISÉ",
        greatCubeHint: "cinq gemmes - découvrez-les toutes",
        gemsRemain3: "trois gemmes restantes",
        gemsRemain4: "quatre gemmes restantes",
        eggHint: "la coquille se régénère. brisez vite.",
        gemsClaimed: "toutes les gemmes récupérées en {strikes} coups",
        nextTrial: "PROCHAIN ESSAI",
        startOver: "RECOMMENCER",
        settings: "RÉGLAGES",
        sfxVolume: "VOLUME SFX",
        musicVolume: "VOLUME MUSIQUE",
        language: "LANGUE",
        close: "FERMER",
        championshipComplete: "CHAMPIONNAT TERMINÉ",
        gameScoreboard: "TABLEAU DES SCORES",
        totalHitsLabel: "TOTAL DES COUPS : {total}",
        totalStarsLabel: "ÉTOILES : {stars}",
        bestScoreLabel: "MEILLEUR : {strikes}",
        secretRingLabel: "ANNEAU SECRET TROUVÉ",
        rankGoldLabel: "RANG OR",
        rankSilverLabel: "RANG ARGENT",
        rankBronzeLabel: "RANG BRONZE",
        levelHitsLabel: "{hits} COUPS",
        levelStrikesLabel: "COUPS:",

        levelsLabel: "NIVEAUX",
        selectLevelTitle: "CHOISIR UN NIVEAU",
        newToolLabel: "NOUVEL OUTIL !",
        hammerToolName: "MARTEAU",
        lensToolName: "DÉTECTEUR DE GEMMES",
        bombToolName: "CHARGE EXPLOSIVE",
        bombSpent: "CHARGE ÉPUISÉE",
        adUnavailable: "ANNONCE INDISPONIBLE",
        hapticsLabel: "VIBRATIONS HAPTIQUES",
        screenShakeLabel: "SECOUSSE D'ÉCRAN",
        onText: "ACTIVÉ",
        offText: "DÉSACTIVÉ"
    },
    zh: {
        title: "宝石粉碎者",
        loading: "加载中",
        dragHint: "滑动以旋转石体 - 轻触以敲击",
        searchGemsHint: "寻找隐藏的宝石",
        gemGleams: "你找到了宝石！",
        gemsRemain2: "还剩两颗宝石",
        gemsRemain1: "还剩一颗宝石",
        iceHint: "冰块 - 敲击产生裂缝，再次敲击即可击碎",
        iceShatterHint: "再次敲击以击碎它",
        metalHint: "金属：很难破坏",
        levelHint: "关卡 {num} - {name}",
        stoneCube: "石质立方",
        stonePillar: "古老石柱",
        sandstonePyramid: "风沙金字塔",
        wonCubeCracked: "立方已碎",
        wonPillarCracked: "石柱已破",
        wonPyramidCracked: "金字塔已开",
        wonHeartShattered: "冰心粉碎",
        iceHeart: "冰封之心",
        obsidianGeode: "黑曜晶洞",
        wonGeodeCracked: "晶洞已破",
        obsidianHint: "黑曜石 - 先裂纹，再碎裂",
        obsidianCrackHint: "再次敲击以击碎",
        moltenCore: "熔岩核心",
        wonCoreQuenched: "核心冷却",
        moltenHint: "敲击岩石使其爆裂",
        moltenRaceHint: "快挖 - 岩浆会硬化",
        moltenCrustHint: "硬壳 - 敲击两次",
        clockworkSphere: "齿轮机械球",
        wonClockworkStopped: "机械停转",
        clockworkHint: "砸碎齿轮，寻找泥块",
        fossilizedTrunk: "石化树干",
        wonTrunkSplit: "树干裂开",
        petrifiedHint: "逐层剥开年轮",
        petrifiedBarkHint: "树皮已裂开 - 再次敲击将其剥下",
        honeycombHive: "蜂巢蜜脾",
        wonHiveBroken: "蜂巢已破",
        hiveHint: "蜂巢会自我修复",
        chainReliquary: "锁链宝箱",
        wonReliquaryOpened: "宝箱已开",
        reliquaryHint: "敲碎正面的两把锁",
        reliquaryBlockedHint: "锁链无法破坏 - 敲击它的锁",
        reliquaryLockHint: "锁头开始变形 - 继续敲打",
        reliquaryLockLeftHint: "还剩一把锁 - 也把它敲掉",
        reliquaryOpenHint: "锁链崩落 - 砸开宝箱挖出泥块",
        fallenStar: "坠落之星",
        wonStarDimmed: "星辉熄灭",
        starHint: "坠星 - 逐层剥开发光外壳",
        starDarkHint: "敲击时星辉会亮起",
        dragonEgg: "巨龙之卵",
        wonEggPlundered: "龙卵被夺",
        greatCube: "巨大立方",
        wonGreatCubeCracked: "巨大立方已破",
        greatCubeHint: "五颗宝石 - 找到它们",
        gemsRemain3: "还剩三颗宝石",
        gemsRemain4: "还剩四颗宝石",
        eggHint: "蛋壳会再生，快速破开",
        gemsClaimed: "集齐所有宝石，总共锤击 {strikes} 次",
        nextTrial: "下一关",
        startOver: "重新开始",
        settings: "设置",
        sfxVolume: "音效音量",
        musicVolume: "音乐音量",
        language: "语言",
        close: "关闭",
        championshipComplete: "全部通关",
        gameScoreboard: "游戏计分板",
        totalHitsLabel: "总锤击数: {total}",
        totalStarsLabel: "星星: {stars}",
        bestScoreLabel: "最佳: {strikes}",
        secretRingLabel: "发现秘密金环",
        rankGoldLabel: "金牌评级",
        rankSilverLabel: "银牌评级",
        rankBronzeLabel: "铜牌评级",
        levelHitsLabel: "{hits} 次",
        levelStrikesLabel: "锤击：",

        levelsLabel: "关卡",
        selectLevelTitle: "选择关卡",
        newToolLabel: "新工具！",
        hammerToolName: "锤子",
        lensToolName: "宝石探测器",
        bombToolName: "爆破炸药",
        bombSpent: "炸药已用尽",
        adUnavailable: "广告暂不可用",
        hapticsLabel: "触觉震动",
        screenShakeLabel: "屏幕震动",
        onText: "开启",
        offText: "关闭"
    },
    "zh-hant": {
        title: "寶石粉碎者",
        loading: "載入中",
        dragHint: "滑動以旋轉石體 - 輕觸以敲擊",
        searchGemsHint: "尋找隱藏的寶石",
        gemGleams: "你找到了寶石！",
        gemsRemain2: "還剩兩顆寶石",
        gemsRemain1: "還剩一顆寶石",
        iceHint: "冰塊 - 敲擊產生裂縫，再次敲擊即可擊碎",
        iceShatterHint: "再次敲擊以擊碎它",
        metalHint: "金屬：很難破壞",
        levelHint: "關卡 {num} - {name}",
        stoneCube: "石質立方",
        stonePillar: "古老石柱",
        sandstonePyramid: "風沙金字塔",
        wonCubeCracked: "立方已碎",
        wonPillarCracked: "石柱已破",
        wonPyramidCracked: "金字塔已開",
        wonHeartShattered: "冰心粉碎",
        iceHeart: "冰封之心",
        obsidianGeode: "黑曜晶洞",
        wonGeodeCracked: "晶洞已破",
        obsidianHint: "黑曜石 - 先裂紋，再碎裂",
        obsidianCrackHint: "再次敲擊以擊碎",
        moltenCore: "熔岩核心",
        wonCoreQuenched: "核心冷卻",
        moltenHint: "敲擊岩石使其爆裂",
        moltenRaceHint: "快挖 - 岩漿會硬化",
        moltenCrustHint: "硬殼 - 敲擊兩次",
        clockworkSphere: "齒輪機械球",
        wonClockworkStopped: "機械停轉",
        clockworkHint: "砸碎齒輪，尋找泥塊",
        fossilizedTrunk: "石化樹幹",
        wonTrunkSplit: "樹幹裂開",
        petrifiedHint: "逐層剝開年輪",
        petrifiedBarkHint: "樹皮已裂開 - 再次敲擊將其剝下",
        honeycombHive: "蜂巢蜜脾",
        wonHiveBroken: "蜂巢已破",
        hiveHint: "蜂巢會自我修復",
        chainReliquary: "鎖鏈寶箱",
        wonReliquaryOpened: "寶箱已開",
        reliquaryHint: "敲碎正面的兩把鎖",
        reliquaryBlockedHint: "鎖鏈無法破壞 - 敲擊它的鎖",
        reliquaryLockHint: "鎖頭開始變形 - 繼續敲打",
        reliquaryLockLeftHint: "還剩一把鎖 - 也把它敲掉",
        reliquaryOpenHint: "鎖鏈崩落 - 砸開寶箱挖出泥塊",
        fallenStar: "墜落之星",
        wonStarDimmed: "星輝熄滅",
        starHint: "墜星 - 逐層剝開發光外殼",
        starDarkHint: "敲擊時星輝會亮起",
        dragonEgg: "巨龍之卵",
        wonEggPlundered: "龍卵被奪",
        greatCube: "巨大立方",
        wonGreatCubeCracked: "巨大立方已破",
        greatCubeHint: "五顆寶石 - 找到它們",
        gemsRemain3: "還剩三顆寶石",
        gemsRemain4: "還剩四顆寶石",
        eggHint: "蛋殼會再生，快速破開",
        gemsClaimed: "集齊所有寶石，總共錘擊 {strikes} 次",
        nextTrial: "下一關",
        startOver: "重新開始",
        settings: "設定",
        sfxVolume: "音效音量",
        musicVolume: "音樂音量",
        language: "語言",
        close: "關閉",
        championshipComplete: "全部通關",
        gameScoreboard: "遊戲計分板",
        totalHitsLabel: "總錘擊數: {total}",
        totalStarsLabel: "星星: {stars}",
        bestScoreLabel: "最佳: {strikes}",
        secretRingLabel: "發現秘密金環",
        rankGoldLabel: "金牌評級",
        rankSilverLabel: "銀牌評級",
        rankBronzeLabel: "銅牌評級",
        levelHitsLabel: "{hits} 次",
        levelStrikesLabel: "錘擊：",

        levelsLabel: "關卡",
        selectLevelTitle: "選擇關卡",
        newToolLabel: "新工具！",
        hammerToolName: "錘子",
        lensToolName: "寶石探測器",
        bombToolName: "爆破炸藥",
        bombSpent: "炸藥已用盡",
        adUnavailable: "廣告暫不可用",
        hapticsLabel: "觸覺震動",
        screenShakeLabel: "螢幕震動",
        onText: "開啟",
        offText: "關閉"
    },
    ar: {
        title: "محطم الجواهر",
        loading: "جاري التحميل",
        dragHint: "اسحب للتدوير - اضغط للضرب",
        searchGemsHint: "ابحث عن الجواهر المخفية",
        gemGleams: "لقد وجدت جوهرة!",
        gemsRemain2: "تبقى جوهرتان",
        gemsRemain1: "تبقى جوهرة واحدة",
        iceHint: "جليد - يتصدع ثم يتحطم عند ضربه مرتين",
        iceShatterHint: "اضرب مرة أخرى لتحطيمه",
        metalHint: "المعدن: صعب التدمير",
        levelHint: "المستوى {num} - {name}",
        stoneCube: "مكعب حجري",
        stonePillar: "عمود حجري",
        sandstonePyramid: "هرم من الحجر الرملي",
        wonCubeCracked: "تم كسر المكعب",
        wonPillarCracked: "تم كسر العمود",
        wonPyramidCracked: "تم كسر الهرم",
        wonHeartShattered: "تحطم القلب",
        iceHeart: "قلب متجمد",
        obsidianGeode: "جيود السبج",
        wonGeodeCracked: "تم كسر الجيود",
        obsidianHint: "السبج - يتصدع ثم يتشظى",
        obsidianCrackHint: "اضرب مرة أخرى للكسر",
        moltenCore: "قلب منصهر",
        wonCoreQuenched: "تم إخماد القلب",
        moltenHint: "اضرب الصخر لجعله ينفجر",
        moltenRaceHint: "احفر بسرعة - الحمم تتصلب",
        moltenCrustHint: "قشرة صلبة - اضرب مرتين",
        clockworkSphere: "كرة التروس",
        wonClockworkStopped: "توقفت التروس",
        clockworkHint: "حطّم التروس واعثر على التراب",
        fossilizedTrunk: "جذع متحجر",
        wonTrunkSplit: "انشق الجذع",
        petrifiedHint: "قشّر الحلقات واحدة تلو الأخرى",
        petrifiedBarkHint: "انشقت القشرة - اضربها مرة أخرى لتقشيرها",
        honeycombHive: "قرص العسل",
        wonHiveBroken: "تحطم القرص",
        hiveHint: "قرص العسل يرمّم نفسه",
        chainReliquary: "صندوق مقيد بالسلاسل",
        wonReliquaryOpened: "تم فتح الصندوق",
        reliquaryHint: "اكسر كلا القفلين الأماميين",
        reliquaryBlockedHint: "السلاسل لا تُكسر - اضرب قفلها",
        reliquaryLockHint: "القفل ينحني - واصل ضربه",
        reliquaryLockLeftHint: "بقي قفل واحد - اكسره أيضًا",
        reliquaryOpenHint: "سقطت السلاسل - اكسر الصندوق واستخرج كتل التراب",
        fallenStar: "نجم ساقط",
        wonStarDimmed: "خمد النجم",
        starHint: "نجم ساقط - ينزع طبقة مضيئة تلو الأخرى",
        starDarkHint: "يلمع النجم عند ضربه",
        dragonEgg: "بيضة التنين",
        wonEggPlundered: "تم سلب البيضة",
        greatCube: "المكعب العظيم",
        wonGreatCubeCracked: "تم كسر المكعب العظيم",
        greatCubeHint: "خمس جواهر - اعثر عليها كلها",
        gemsRemain3: "تبقى ثلاث جواهر",
        gemsRemain4: "تبقى أربع جواهر",
        eggHint: "القشرة تتجدد. اكسرها بسرعة.",
        gemsClaimed: "تم جمع كل الجواهر في {strikes} ضربة",
        nextTrial: "التجربة التالية",
        startOver: "البدء من جديد",
        settings: "الإعدادات",
        sfxVolume: "صوت المؤثرات",
        musicVolume: "صوت الموسيقى",
        language: "اللغة",
        close: "إغلاق",
        championshipComplete: "اكتملت البطولة",
        gameScoreboard: "لوحة النتائج",
        totalHitsLabel: "إجمالي الضربات: {total}",
        totalStarsLabel: "النجوم: {stars}",
        bestScoreLabel: "الأفضل: {strikes}",
        secretRingLabel: "تم العثور على الحلقة السرية",
        rankGoldLabel: "رتبة ذهبية",
        rankSilverLabel: "رتبة فضية",
        rankBronzeLabel: "رتبة برونزية",
        levelHitsLabel: "{hits} ضربات",
        levelStrikesLabel: "الضربات:",

        levelsLabel: "المستويات",
        selectLevelTitle: "اختر المستوى",
        newToolLabel: "أداة جديدة!",
        hammerToolName: "المطرقة",
        lensToolName: "كاشف الجواهر",
        bombToolName: "شحنة ناسفة",
        bombSpent: "نفدت الشحنة",
        adUnavailable: "الإعلان غير متوفر",
        hapticsLabel: "الاهتزاز اللمسي",
        screenShakeLabel: "اهتزاز الشاشة",
        onText: "تفعيل",
        offText: "إيقاف"
    },
    hi: {
        title: "रत्न क्रैकर",
        loading: "लोड हो रहा है",
        dragHint: "घुमाने के लिए खींचें - प्रहार करने के लिए टैप करें",
        searchGemsHint: "छिपे हुए रत्न खोजें",
        gemGleams: "आपको एक रत्न मिला!",
        gemsRemain2: "दो रत्न बाकी हैं",
        gemsRemain1: "एक रत्न बाकी है",
        iceHint: "बर्फ - दो बार प्रहार करने पर दरार पड़ती है फिर टूटती है",
        iceShatterHint: "तोड़ने के लिए फिर से प्रहार करें",
        metalHint: "धातु: तोड़ना मुश्किल",
        levelHint: "स्तर {num} - {name}",
        stoneCube: "पत्थर का घन",
        stonePillar: "पत्थर का स्तंभ",
        sandstonePyramid: "बलुआ पत्थर का पिरामिड",
        wonCubeCracked: "घन टूट गया",
        wonPillarCracked: "स्तंभ टूट गया",
        wonPyramidCracked: "पिरामिड टूट गया",
        wonHeartShattered: "दिल चकनाचूर",
        iceHeart: "जमा हुआ दिल",
        obsidianGeode: "ओब्सीडियन जियोड",
        wonGeodeCracked: "जियोड टूट गया",
        obsidianHint: "ओब्सीडियन - चटकती है फिर बिखरती है",
        obsidianCrackHint: "तोड़ने के लिए फिर से प्रहार करें",
        moltenCore: "पिघला हुआ कोर",
        wonCoreQuenched: "कोर ठंडा हुआ",
        moltenHint: "चट्टान पर प्रहार करें, विस्फोट होगा",
        moltenRaceHint: "जल्दी खोदें - लावा जमता है",
        moltenCrustHint: "पपड़ी - दो बार प्रहार करें",
        clockworkSphere: "गियर गोला",
        wonClockworkStopped: "मशीन रुक गई",
        clockworkHint: "गियर तोड़ें, मिट्टी खोजें",
        fossilizedTrunk: "जीवाश्म तना",
        wonTrunkSplit: "तना फट गया",
        petrifiedHint: "एक-एक करके छल्ले छीलें",
        petrifiedBarkHint: "छाल चिर गई है - उसे छीलने के लिए फिर प्रहार करें",
        honeycombHive: "मधुमक्खी का छत्ता",
        wonHiveBroken: "छत्ता टूट गया",
        hiveHint: "छत्ता खुद भर जाता है",
        chainReliquary: "जंजीरों में बंधा संदूक",
        wonReliquaryOpened: "संदूक खुल गया",
        reliquaryHint: "सामने के दोनों ताले तोड़ें",
        reliquaryBlockedHint: "जंजीरें नहीं टूटतीं - उसका ताला तोड़ें",
        reliquaryLockHint: "ताला मुड़ रहा है - प्रहार जारी रखें",
        reliquaryLockLeftHint: "एक ताला बाकी - उसे भी तोड़ें",
        reliquaryOpenHint: "जंजीरें गिर गईं - संदूक तोड़ें और मिट्टी निकालें",
        fallenStar: "गिरा हुआ तारा",
        wonStarDimmed: "तारा बुझ गया",
        starHint: "गिरा तारा - एक-एक चमकती परत उतरती है",
        starDarkHint: "प्रहार करने पर तारा चमकता है",
        dragonEgg: "ड्रैगन का अंडा",
        wonEggPlundered: "अंडा लूटा गया",
        greatCube: "महान घन",
        wonGreatCubeCracked: "महान घन टूट गया",
        greatCubeHint: "पाँच रत्न - सभी को खोजें",
        gemsRemain3: "तीन रत्न बाकी हैं",
        gemsRemain4: "चार रत्न बाकी हैं",
        eggHint: "खोल फिर भर जाता है। जल्दी तोड़ें।",
        gemsClaimed: "सभी रत्न {strikes} प्रहारों में प्राप्त",
        nextTrial: "अगली चुनौती",
        startOver: "फिर से शुरू करें",
        settings: "सेटिंग्स",
        sfxVolume: "ध्वनि प्रभाव",
        musicVolume: "संगीत वॉल्यूम",
        language: "भाषा",
        close: "बंद करें",
        championshipComplete: "चैंपियनशिप पूर्ण",
        gameScoreboard: "स्कोरबोर्ड",
        totalHitsLabel: "कुल प्रहार: {total}",
        totalStarsLabel: "सितारे: {stars}",
        bestScoreLabel: "सर्वश्रेष्ठ: {strikes}",
        secretRingLabel: "गुप्त सुनहरी अंगूठी मिली",
        rankGoldLabel: "स्वर्ण रैंक",
        rankSilverLabel: "रजत रैंक",
        rankBronzeLabel: "कांस्य रैंक",
        levelHitsLabel: "{hits} प्रहार",
        levelStrikesLabel: "प्रहार:",

        levelsLabel: "स्तर",
        selectLevelTitle: "स्तर चुनें",
        newToolLabel: "नया उपकरण!",
        hammerToolName: "हथौड़ा",
        lensToolName: "रत्न डिटेक्टर",
        bombToolName: "विस्फोटक",
        bombSpent: "चार्ज समाप्त",
        adUnavailable: "विज्ञापन उपलब्ध नहीं है",
        hapticsLabel: "हैप्टिक कंपन",
        screenShakeLabel: "स्क्रीन कंपन",
        onText: "चालू",
        offText: "बंद"
    },
    ja: {
        title: "ジェムクラッカー",
        loading: "読み込み中",
        dragHint: "ドラッグで回転 - タップで叩く",
        searchGemsHint: "隠された宝石を探そう",
        gemGleams: "宝石を見つけた！",
        gemsRemain2: "宝石が2つ残っている",
        gemsRemain1: "宝石が1つ残っている",
        iceHint: "氷 - 2回叩くとひびが入り、砕ける",
        iceShatterHint: "もう一度叩いて砕こう",
        metalHint: "金属：壊れにくい",
        levelHint: "レベル {num} - {name}",
        stoneCube: "石のキューブ",
        stonePillar: "石の柱",
        sandstonePyramid: "砂岩のピラミッド",
        wonCubeCracked: "キューブ破壊",
        wonPillarCracked: "柱破壊",
        wonPyramidCracked: "ピラミッド破壊",
        wonHeartShattered: "ハート粉砕",
        iceHeart: "凍てつくハート",
        obsidianGeode: "黒曜石の晶洞",
        wonGeodeCracked: "晶洞破壊",
        obsidianHint: "黒曜石 - ひびが入り、その後砕け散る",
        obsidianCrackHint: "もう一度叩いて壊そう",
        moltenCore: "溶岩の核",
        wonCoreQuenched: "核冷却",
        moltenHint: "岩を叩いて噴き出させよう",
        moltenRaceHint: "急いで掘ろう - 溶岩が固まる",
        moltenCrustHint: "固まった殻 - 2回叩こう",
        clockworkSphere: "からくりの球体",
        wonClockworkStopped: "機構停止",
        clockworkHint: "歯車を壊して土を探そう",
        fossilizedTrunk: "化石化した幹",
        wonTrunkSplit: "幹破壊",
        petrifiedHint: "年輪を一層ずつ剥がそう",
        petrifiedBarkHint: "樹皮にひびが入った - もう一度叩いて剥がそう",
        honeycombHive: "ハニカムの巣",
        wonHiveBroken: "巣破壊",
        hiveHint: "ハニカムは自ら修復する",
        chainReliquary: "鎖に縛られた宝箱",
        wonReliquaryOpened: "宝箱開放",
        reliquaryHint: "正面の2つの南京錠を壊そう",
        reliquaryBlockedHint: "鎖は壊せない - 南京錠を叩こう",
        reliquaryLockHint: "南京錠が歪み始めた - 叩き続けよう",
        reliquaryLockLeftHint: "南京錠はあと1つ - それも壊そう",
        reliquaryOpenHint: "鎖が外れた - 宝箱を壊して土の塊を掘り出そう",
        fallenStar: "落ちた星",
        wonStarDimmed: "星光消滅",
        starHint: "落ちた星 - 光る殻を一層ずつ剥がそう",
        starDarkHint: "星は叩くと輝く",
        dragonEgg: "ドラゴンの卵",
        wonEggPlundered: "卵強奪",
        greatCube: "グレートキューブ",
        wonGreatCubeCracked: "グレートキューブ破壊",
        greatCubeHint: "宝石5個 - すべて見つけよう",
        gemsRemain3: "宝石が3つ残っている",
        gemsRemain4: "宝石が4つ残っている",
        eggHint: "殻は再生する。素早く壊そう。",
        gemsClaimed: "すべての宝石を{strikes}回の攻撃で獲得",
        nextTrial: "次の試練",
        startOver: "最初から",
        settings: "設定",
        sfxVolume: "効果音音量",
        musicVolume: "音楽音量",
        language: "言語",
        close: "閉じる",
        championshipComplete: "全試練制覇",
        gameScoreboard: "スコアボード",
        totalHitsLabel: "総攻撃回数: {total}",
        totalStarsLabel: "スター: {stars}",
        bestScoreLabel: "ベスト: {strikes}",
        secretRingLabel: "秘密の指輪を発見",
        rankGoldLabel: "ゴールドランク",
        rankSilverLabel: "シルバーランク",
        rankBronzeLabel: "ブロンズランク",
        levelHitsLabel: "{hits}回",
        levelStrikesLabel: "攻撃:",
        levelsLabel: "レベル",
        selectLevelTitle: "レベルを選択",
        newToolLabel: "新ツール！",
        hammerToolName: "ハンマー",
        lensToolName: "宝石探知機",
        bombToolName: "爆破チャージ",
        bombSpent: "チャージ使用済み",
        adUnavailable: "広告を利用できません",
        hapticsLabel: "振動 (ハプティクス)",
        screenShakeLabel: "画面の揺れ",
        onText: "オン",
        offText: "オフ"
    },
    ru: {
        title: "Крушитель Самоцветов",
        loading: "Загрузка",
        dragHint: "потяните для поворота — коснитесь для удара",
        searchGemsHint: "ищите скрытые самоцветы",
        gemGleams: "Вы нашли самоцвет!",
        gemsRemain2: "осталось два самоцвета",
        gemsRemain1: "остался один самоцвет",
        iceHint: "лёд — трескается, затем разбивается после двух ударов",
        iceShatterHint: "ударьте ещё раз, чтобы разбить",
        metalHint: "Металл: его трудно разрушить",
        levelHint: "уровень {num} — {name}",
        stoneCube: "КАМЕННЫЙ КУБ",
        stonePillar: "КАМЕННАЯ КОЛОННА",
        sandstonePyramid: "ПИРАМИДА ИЗ ПЕСЧАНИКА",
        wonCubeCracked: "КУБ РАЗБИТ",
        wonPillarCracked: "КОЛОННА РАЗБИТА",
        wonPyramidCracked: "ПИРАМИДА РАЗБИТА",
        wonHeartShattered: "СЕРДЦЕ РАЗБИТО",
        iceHeart: "ЗАМЁРЗШЕЕ СЕРДЦЕ",
        obsidianGeode: "ОБСИДИАНОВАЯ ЖЕОДА",
        wonGeodeCracked: "ЖЕОДА РАЗБИТА",
        obsidianHint: "обсидиан — трескается, затем рассыпается",
        obsidianCrackHint: "ударьте ещё раз, чтобы разбить",
        moltenCore: "РАСПЛАВЛЕННОЕ ЯДРО",
        wonCoreQuenched: "ЯДРО ОСТУЖЕНО",
        moltenHint: "бейте по камню, чтобы вызвать извержение",
        moltenRaceHint: "копайте быстрее — лава застывает",
        moltenCrustHint: "застывшая корка — ударьте дважды",
        clockworkSphere: "МЕХАНИЧЕСКАЯ СФЕРА",
        wonClockworkStopped: "МЕХАНИЗМ ОСТАНОВЛЕН",
        clockworkHint: "ломайте шестерни, ищите землю",
        fossilizedTrunk: "ОКАМЕНЕВШИЙ СТВОЛ",
        wonTrunkSplit: "СТВОЛ РАСКОЛОТ",
        petrifiedHint: "снимайте кольца одно за другим",
        petrifiedBarkHint: "кора треснула — ударьте ещё раз, чтобы снять её",
        honeycombHive: "СОТОВЫЙ УЛЕЙ",
        wonHiveBroken: "УЛЕЙ РАЗБИТ",
        hiveHint: "соты восстанавливаются сами",
        chainReliquary: "СУНДУК В ЦЕПЯХ",
        wonReliquaryOpened: "СУНДУК ОТКРЫТ",
        reliquaryHint: "разбейте два передних замка",
        reliquaryBlockedHint: "цепи не разбить — бейте по замку",
        reliquaryLockHint: "замок гнётся — продолжайте бить",
        reliquaryLockLeftHint: "остался один замок — разбейте и его",
        reliquaryOpenHint: "цепи упали — разбейте сундук и выкопайте комья земли",
        fallenStar: "УПАВШАЯ ЗВЕЗДА",
        wonStarDimmed: "ЗВЕЗДА ПОГАСЛА",
        starHint: "упавшая звезда — снимайте светящуюся оболочку слой за слоем",
        starDarkHint: "звезда сияет от ударов",
        dragonEgg: "ЯЙЦО ДРАКОНА",
        wonEggPlundered: "ЯЙЦО РАЗГРАБЛЕНО",
        greatCube: "ВЕЛИКИЙ КУБ",
        wonGreatCubeCracked: "ВЕЛИКИЙ КУБ РАЗБИТ",
        greatCubeHint: "пять самоцветов — найдите их все",
        gemsRemain3: "осталось три самоцвета",
        gemsRemain4: "осталось четыре самоцвета",
        eggHint: "скорлупа восстанавливается. Разбивайте быстро.",
        gemsClaimed: "все самоцветы получены за {strikes} ударов",
        nextTrial: "СЛЕДУЮЩЕЕ ИСПЫТАНИЕ",
        startOver: "НАЧАТЬ ЗАНОВО",
        settings: "НАСТРОЙКИ",
        sfxVolume: "ГРОМКОСТЬ ЭФФЕКТОВ",
        musicVolume: "ГРОМКОСТЬ МУЗЫКИ",
        language: "ЯЗЫК",
        close: "ЗАКРЫТЬ",
        championshipComplete: "ЧЕМПИОНАТ ПРОЙДЕН",
        gameScoreboard: "ТАБЛИЦА РЕЗУЛЬТАТОВ",
        totalHitsLabel: "ВСЕГО УДАРОВ: {total}",
        totalStarsLabel: "ЗВЁЗДЫ: {stars}",
        bestScoreLabel: "ЛУЧШИЙ: {strikes}",
        secretRingLabel: "СЕКРЕТНОЕ КОЛЬЦО НАЙДЕНО",
        rankGoldLabel: "ЗОЛОТОЙ РАНГ",
        rankSilverLabel: "СЕРЕБРЯНЫЙ РАНГ",
        rankBronzeLabel: "БРОНЗОВЫЙ РАНГ",
        levelHitsLabel: "{hits} УДАРОВ",
        levelStrikesLabel: "УДАРЫ:",
        levelsLabel: "УРОВНИ",
        selectLevelTitle: "ВЫБЕРИТЕ УРОВЕНЬ",
        newToolLabel: "НОВЫЙ ИНСТРУМЕНТ!",
        hammerToolName: "МОЛОТ",
        lensToolName: "ДЕТЕКТОР САМОЦВЕТОВ",
        bombToolName: "ВЗРЫВНОЙ ЗАРЯД",
        bombSpent: "ЗАРЯД ИЗРАСХОДОВАН",
        adUnavailable: "РЕКЛАМА НЕДОСТУПНА",
        hapticsLabel: "ТАКТИЛЬНАЯ ОТДАЧА",
        screenShakeLabel: "ТРЯСКА ЭКРАНА",
        onText: "ВКЛ",
        offText: "ВЫКЛ"
    }
};

// Localization registry -------------------------------------------------
// English is the canonical key schema. To add a string, add it to `en` first,
// then add the same key to each locale below. `validateTranslations()` checks
// missing/extra keys and placeholder mismatches automatically at startup.
window.I18N = Object.freeze({
    defaultLocale: 'en',
    locales: Object.freeze({
        en: Object.freeze({ label: 'English', dir: 'ltr' }),
        es: Object.freeze({ label: 'Español', dir: 'ltr' }),
        fr: Object.freeze({ label: 'Français', dir: 'ltr' }),
        zh: Object.freeze({ label: '简体中文', dir: 'ltr' }),
        'zh-hant': Object.freeze({ label: '繁體中文', dir: 'ltr' }),
        ar: Object.freeze({ label: 'العربية', dir: 'rtl' }),
        hi: Object.freeze({ label: 'हिन्दी', dir: 'ltr' }),
        ja: Object.freeze({ label: '日本語', dir: 'ltr' }),
        ru: Object.freeze({ label: 'Русский', dir: 'ltr' })
    }),
    levelNameKeys: Object.freeze([
        'stoneCube', 'stonePillar', 'sandstonePyramid', 'iceHeart',
        'obsidianGeode', 'clockworkSphere', 'moltenCore', 'fossilizedTrunk',
        'honeycombHive', 'chainReliquary', 'fallenStar', 'dragonEgg', 'greatCube'
    ]),
    levelWinKeys: Object.freeze([
        'wonCubeCracked', 'wonPillarCracked', 'wonPyramidCracked', 'wonHeartShattered',
        'wonGeodeCracked', 'wonClockworkStopped', 'wonCoreQuenched', 'wonTrunkSplit',
        'wonHiveBroken', 'wonReliquaryOpened', 'wonStarDimmed', 'wonEggPlundered', 'wonGreatCubeCracked'
    ])
});
window.I18N.keys = Object.freeze(Object.keys(window.TRANSLATIONS.en));

function placeholderNames(text) {
    return [...new Set(String(text).match(/\{([\w-]+)\}/g) || [])]
        .map((token) => token.slice(1, -1)).sort();
}

// Returns a concise report rather than throwing: a typo in one language must never
// prevent the game from loading, because `_t()` safely falls back to English.
window.validateTranslations = function () {
    const canonical = window.TRANSLATIONS.en;
    const expectedKeys = Object.keys(canonical).sort();
    const report = {};
    for (const locale of Object.keys(window.I18N.locales)) {
        const copy = window.TRANSLATIONS[locale] || {};
        const actualKeys = Object.keys(copy);
        const missing = expectedKeys.filter((key) => !Object.prototype.hasOwnProperty.call(copy, key));
        const extra = actualKeys.filter((key) => !Object.prototype.hasOwnProperty.call(canonical, key)).sort();
        const placeholders = expectedKeys.filter((key) =>
            Object.prototype.hasOwnProperty.call(copy, key) &&
            placeholderNames(copy[key]).join('|') !== placeholderNames(canonical[key]).join('|')
        );
        if (missing.length || extra.length || placeholders.length) {
            report[locale] = { missing, extra, placeholders };
        }
    }
    if (Object.keys(report).length) console.warn('Translation validation issues:', report);
    return report;
};

window._t = function (key, replacements = {}) {
    const fallback = window.I18N.defaultLocale;
    const locale = window.TRANSLATIONS[window.currentLang] ? window.currentLang : fallback;
    const localized = window.TRANSLATIONS[locale];
    let text = Object.prototype.hasOwnProperty.call(localized, key)
        ? localized[key]
        : (window.TRANSLATIONS[fallback][key] || key);
    return text.replace(/\{([\w-]+)\}/g, (token, name) =>
        Object.prototype.hasOwnProperty.call(replacements, name) ? String(replacements[name]) : token
    );
};

window.setGameLanguage = function (locale) {
    if (!window.I18N.locales[locale] || window.currentLang === locale) return;
    window.currentLang = locale;
    window.saveGameSettings();
    window.applyTranslations();
};

window.applyTranslations = function () {
    const locale = window.I18N.locales[window.currentLang] ? window.currentLang : window.I18N.defaultLocale;
    document.body.dir = window.I18N.locales[locale].dir;

    // Title
    const titleEl = document.querySelector('h1');
    if (titleEl && window.level !== undefined && window.LEVEL_NAME_KEYS !== undefined) {
        const shapeKey = window.LEVEL_NAME_KEYS[window.level];
        if (shapeKey) {
            titleEl.textContent = window._t(shapeKey).toUpperCase();
        }
    }

    // Level Select button + list
    const levelLabel = document.getElementById('level-select-label');
    if (levelLabel) levelLabel.textContent = window._t('levelsLabel');
    const levelTitle = document.getElementById('level-title');
    if (levelTitle) levelTitle.textContent = window._t('selectLevelTitle');
    const levelClose = document.getElementById('level-close');
    if (levelClose) levelClose.textContent = window._t('close');
    const newToolLabel = document.getElementById('new-tool-tooltip');
    if (newToolLabel) newToolLabel.textContent = window._t('newToolLabel');
    const newToolLabelBomb = document.getElementById('new-tool-tooltip-bomb');
    if (newToolLabelBomb) newToolLabelBomb.textContent = window._t('newToolLabel');
    if (window.renderLevelList) window.renderLevelList();

    // Loader
    const loaderLabel = document.querySelector('#loader .label');
    if (loaderLabel) loaderLabel.textContent = window._t('loading');
    const loaderBrand = document.querySelector('#loader .brand');
    if (loaderBrand) loaderBrand.textContent = window._t('title');

    // Win Title — level index maps directly to the canonical localized win key.
    const winTitle = document.getElementById('winTitle');
    if (winTitle && window.level !== undefined) {
        const winKey = window.I18N.levelWinKeys[window.level];
        if (winKey) winTitle.textContent = window._t(winKey);
    }

    // Win Description
    const winDesc = document.getElementById('winDesc');
    if (winDesc && window.strikes !== undefined) {
        winDesc.innerHTML = window._t('gemsClaimed', { strikes: `<span id="strikeCount">${window.strikes}</span>` });
    }

    // Star ranking (its label is localized, the stars themselves are not)
    if (window.paintWinRank) window.paintWinRank();

    // Live per-level strike counter beneath the gem slots.
    const levelStrikesLabel = document.getElementById('level-strikes-label');
    if (levelStrikesLabel) levelStrikesLabel.textContent = window._t('levelStrikesLabel');
    const levelStrikesCount = document.getElementById('level-strikes-count');
    const levelStrikes = document.getElementById('level-strikes');
    const visibleStrikeCount = window.strikes !== undefined ? window.strikes : 0;
    if (levelStrikesCount) levelStrikesCount.textContent = visibleStrikeCount;
    if (levelStrikes) levelStrikes.classList.toggle('is-zero', !(visibleStrikeCount > 0));

    // Next Trial button
    const againBtn = document.getElementById('again');
    if (againBtn && window.level !== undefined && window.LEVELS !== undefined) {
        const isLast = window.level === window.LEVELS.length - 1;
        againBtn.textContent = isLast ? window._t('startOver') : window._t('nextTrial');
    }

    // Settings Panel texts
    document.getElementById('settings-title').textContent = window._t('settings');
    document.getElementById('sfx-label').textContent = window._t('sfxVolume');
    document.getElementById('music-label').textContent = window._t('musicVolume');
    document.getElementById('lang-label').textContent = window._t('language');
    document.getElementById('settings-close').textContent = window._t('close');

    const shakeLabel = document.getElementById('shake-label');
    if (shakeLabel) shakeLabel.textContent = window._t('screenShakeLabel');
    const shakeStatus = document.getElementById('shake-status');
    if (shakeStatus) {
        const isChecked = document.getElementById('shake-toggle') ? document.getElementById('shake-toggle').checked : (window.screenShakeEnabled !== false);
        shakeStatus.textContent = isChecked ? window._t('onText') : window._t('offText');
    }

    const hapticsLabel = document.getElementById('haptics-label');
    if (hapticsLabel) hapticsLabel.textContent = window._t('hapticsLabel');
    const hapticsStatus = document.getElementById('haptics-status');
    if (hapticsStatus) {
        const isChecked = document.getElementById('haptics-toggle') ? document.getElementById('haptics-toggle').checked : (window.hapticsEnabled !== false);
        hapticsStatus.textContent = isChecked ? window._t('onText') : window._t('offText');
    }

    // Hint
    if (window.updateCurrentHint) {
        window.updateCurrentHint();
    } else {
        const hintEl = document.getElementById('hint');
        if (hintEl && hintEl.dataset.key) {
            const repl = JSON.parse(hintEl.dataset.repl || '{}');
            if (repl.name && window.level !== undefined && window.LEVEL_NAME_KEYS) {
                repl.name = window._t(window.LEVEL_NAME_KEYS[window.level] || 'stoneCube').toLowerCase();
            }
            hintEl.textContent = window._t(hintEl.dataset.key, repl);
        }
    }

    // End game texts
    const endTitle = document.getElementById('endTitle');
    if (endTitle) endTitle.textContent = window._t('championshipComplete');

    const endSubtitle = document.getElementById('endSubtitle');
    if (endSubtitle) endSubtitle.textContent = window._t('gameScoreboard');

    const totalStats = document.getElementById('totalStats');
    if (totalStats && window.hitsPerLevel) {
        // Repaint without disturbing the count-up: carry over whatever each counter
        // currently reads, and whether it has already popped, rather than resetting
        // to the final value mid-animation.
        const carry = (id, fallback) => {
            const el = document.getElementById(id);
            return {
                text: el ? el.textContent : String(fallback),
                cls: el && el.classList.contains('bounce-active') ? ' bounce-active' : '',
            };
        };
        const hits = carry('totalHitsCount', window.runTotalHits());
        const stars = carry('totalStarsCount', window.totalStars(window.hitsPerLevel));
        totalStats.innerHTML =
            '<span class="total-part">' +
            window._t('totalHitsLabel', { total: `<span id="totalHitsCount" class="total-count${hits.cls}">${hits.text}</span>` }) +
            '</span><span class="total-part total-part-stars">' +
            window._t('totalStarsLabel', { stars: `<span id="totalStarsCount" class="total-count${stars.cls}">${stars.text}</span>` }) +
            '</span>';
    }

    const restartGameBtn = document.getElementById('restartGame');
    if (restartGameBtn) restartGameBtn.textContent = window._t('startOver');

    const levelStatsContainer = document.getElementById('levelStats');
    if (levelStatsContainer && window.hitsPerLevel && window.LEVELS && levelStatsContainer.children.length > 0) {
        levelStatsContainer.innerHTML = '';
        window.LEVELS.forEach((lvl, idx) => {
            const lvlNameKey = window.LEVEL_NAME_KEYS[idx] || 'stoneCube';
            const localizedName = window._t ? window._t(lvlNameKey) : lvl.name;

            // Same class the scoreboard builder uses. These inline styles used to
            // diverge from it — a fixed 24px where .level-stat-row scales with --u —
            // so switching language on the end card silently re-rendered every row
            // at desktop size and blew the layout apart on a phone.
            const row = document.createElement('div');
            row.className = 'level-stat-row';
            row.innerHTML = `<span>${localizedName}</span>${window.hitsCellMarkup(idx)}`;
            levelStatsContainer.appendChild(row);
        });
    }
};

window.updateCurrentHint = function () {
    const hintEl = document.getElementById('hint');
    if (!hintEl) return;
    const key = hintEl.dataset.key;
    if (!key) {
        hintEl.textContent = '';
        return;
    }
    const repl = JSON.parse(hintEl.dataset.repl || '{}');
    if (repl.name && window.level !== undefined && window.LEVEL_NAME_KEYS) {
        repl.name = window._t(window.LEVEL_NAME_KEYS[window.level] || 'stoneCube').toLowerCase();
    }
    hintEl.textContent = window._t(key, repl);
};

// ---- end-of-level star ranking ----
// Every level rates the run out of three stars from the strike count. The two
// thresholds are authored per level in `gameConfig.starRanks[levelIndex]`
// ({ gold, silver }), so a creator can tune each level's pacing without touching code:
//   strikes <= gold   -> gold, three stars
//   strikes <= silver -> silver, two stars
//   otherwise         -> bronze, one star
window.RANK_STYLE = Object.freeze({
    gold: { stars: 3, color: '#ffd166', glow: 'rgba(255, 209, 102, 0.75)', key: 'rankGoldLabel' },
    silver: { stars: 2, color: '#dfe6ef', glow: 'rgba(223, 230, 239, 0.68)', key: 'rankSilverLabel' },
    bronze: { stars: 1, color: '#d3894a', glow: 'rgba(211, 137, 74, 0.68)', key: 'rankBronzeLabel' }
});

window.starRankFor = function (levelIdx, strikeCount) {
    const entry = (window.gameConfig && window.gameConfig.starRanks && window.gameConfig.starRanks[levelIdx]) || {};
    const gold = Number.isFinite(entry.gold) ? entry.gold : 20;
    // a missing silver threshold falls back to a comfortable margin past gold
    const silver = Math.max(Number.isFinite(entry.silver) ? entry.silver : Math.round(gold * 1.6), gold);
    const tier = strikeCount <= gold ? 'gold' : (strikeCount <= silver ? 'silver' : 'bronze');
    return { tier, gold, silver, strikes: strikeCount };
};

// Compact glyph row for the scoreboard: filled stars first, then hollow ones.
window.rankStarsText = function (rank) {
    const n = window.RANK_STYLE[rank.tier].stars;
    return '★★★☆☆☆'.slice(3 - n, 6 - n);
};

window.rankRowMarkup = function (levelIdx, hits) {
    if (hits == null) return ''; // never played: nothing to rate
    const rank = window.starRankFor(levelIdx, hits);
    const style = window.RANK_STYLE[rank.tier];
    return `<span style="color: ${style.color}; letter-spacing: 0.06em; margin-left: 12px;">${window.rankStarsText(rank)}</span>`;
};

// Stars earned across a set of per-level results: 3 for gold, 2 for silver, 1 for
// bronze, and none for a level with no result at all. 36 is a perfect game.
window.totalStars = function (scores) {
    const list = scores || [];
    let n = 0;
    for (let i = 0; i < list.length; i++) {
        if (list[i] == null) continue;
        n += window.RANK_STYLE[window.starRankFor(i, list[i]).tier].stars;
    }
    return n;
};

// The value YouTube ranks. Taken from the saved records rather than this run,
// because the platform sorts highest-first and requires the submitted score to
// match the player's best result in save data — and because stars only ever go
// up, which a run-scoped total would not.
window.submitStarScore = function () {
    if (!window.GameSDK) return;
    window.GameSDK.setScore(window.totalStars(window.bestScores));
};

// Total strikes over the levels actually played this run, skipping the unplayed ones.
window.runTotalHits = function () {
    return (window.hitsPerLevel || []).reduce((sum, h) => sum + (h == null ? 0 : h), 0);
};

// Right-hand cell of one championship scoreboard row: "12 hits ★★☆", or a dash for a
// level this run never reached. Both scoreboard painters go through here so they can
// never disagree about what an unplayed level looks like.
window.hitsCellMarkup = function (levelIdx) {
    const hits = window.hitsPerLevel ? window.hitsPerLevel[levelIdx] : null;
    if (hits == null) return '<span style="font-family: monospace; color: var(--dim);">—</span>';
    const label = window._t('levelHitsLabel', { hits });
    return `<span style="font-family: monospace; color: var(--gold);">${label}${window.rankRowMarkup(levelIdx, hits)}</span>`;
};

// Paints the big star row + tier label on the win card from window.currentRank.
window.paintWinRank = function () {
    const wrap = document.getElementById('winStars');
    const label = document.getElementById('winRank');
    if (!wrap || !label) return;
    const stars = [...wrap.children];
    const rank = window.currentRank;
    stars.forEach((s) => { s.className = 'win-star'; });
    if (!rank || !window.RANK_STYLE[rank.tier]) {
        label.textContent = '';
        return;
    }
    const style = window.RANK_STYLE[rank.tier];
    wrap.style.setProperty('--rank-color', style.color);
    wrap.style.setProperty('--rank-glow', style.glow);
    void wrap.offsetWidth; // restart the pop animation when the card re-shows
    stars.forEach((s, i) => {
        if (i < style.stars) s.classList.add('earned');
    });
    label.style.color = style.color;
    label.textContent = window._t(style.key);
};

// Level select UI logic
// Kept as a legacy alias for the gameplay script; the canonical list lives in I18N.
window.LEVEL_NAME_KEYS = window.I18N.levelNameKeys;



window.ringsFound = Array(13).fill(false);

// Star-rank thresholds, per level.
window.gameConfig = {
    starRanks: [
        { gold: 6, silver: 10 },
        { gold: 8, silver: 12 },
        { gold: 8, silver: 14 },
        { gold: 10, silver: 18 },
        { gold: 8, silver: 13 },
        { gold: 6, silver: 12 },
        { gold: 8, silver: 14 },
        { gold: 8, silver: 20 },
        { gold: 10, silver: 20 },
        { gold: 10, silver: 20 },
        { gold: 7, silver: 16 },
        { gold: 5, silver: 10 },
        { gold: 15, silver: 26 }

    ]
};

// Audit key coverage and placeholder parity once after the table has been defined.
window.validateTranslations();

