// Gems in the cube - game logic (extracted from index.html into game.js)
// Order matters: defaults -> fracture -> audio -> main game -> tweaks panel


        // Global Volume & Language Defaults
        window.masterVolume = 1.0;
        window.musicVolume = 0.5;
        window.hapticsEnabled = true;

        // Detect player's language, falling back to English if unsupported
        const detectPlayerLanguage = () => {
            const playerLang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
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

        window.currentLang = detectPlayerLanguage();
        window.hitsPerLevel = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        window.bestScores = Array(12).fill(null);

        window.TRANSLATIONS = {
            en: {
                title: "Gem Cracker",
                loading: "Loading",
                dragHint: "drag to rotate - tap to strike",
                searchRelicsHint: "search for hidden gems",
                relicGleams: "a gem gleams - tap it to claim",
                relicsRemain2: "two gems remain",
                relicsRemain1: "one gem remains",
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
                iceHeart: "ICE HEART",
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
                eggHint: "Shell regenerates. Break quickly.",
                relicsClaimed: "all gems claimed in {strikes} strikes",
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
                hapticsLabel: "HAPTICS",
                screenShakeLabel: "SCREEN SHAKE",
                onText: "ON",
                offText: "OFF"
            },
            es: {
                title: "Rompegemas",
                loading: "Cargando",
                dragHint: "arrastra para girar - toca para golpear",
                searchRelicsHint: "busca las gemas ocultas",
                relicGleams: "una gema brilla - toca para recogerla",
                relicsRemain2: "quedan dos gemas",
                relicsRemain1: "queda una gema",
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
                iceHeart: "CORAZÓN DE HIELO",
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
                eggHint: "la cáscara se regenera. rompe rápido.",
                relicsClaimed: "todas las gemas obtenidas en {strikes} golpes",
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
                hapticsLabel: "VIBRACIÓN HÁPTICA",
                screenShakeLabel: "VIBRACIÓN DE PANTALLA",
                onText: "ACTIVADO",
                offText: "DESACTIVADO"
            },
            fr: {
                title: "Briseur de Gemmes",
                loading: "Chargement",
                dragHint: "glisser pour tourner - taper pour frapper",
                searchRelicsHint: "cherchez les gemmes cachées",
                relicGleams: "une gemme brille - tapez pour la ramasser",
                relicsRemain2: "deux gemmes restantes",
                relicsRemain1: "une gemme restante",
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
                iceHeart: "CŒUR DE GLACE",
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
                eggHint: "la coquille se régénère. brisez vite.",
                relicsClaimed: "toutes les gemmes récupérées en {strikes} coups",
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
                hapticsLabel: "VIBRATIONS HAPTIQUES",
                screenShakeLabel: "SECOUSSE D'ÉCRAN",
                onText: "ACTIVÉ",
                offText: "DÉSACTIVÉ"
            },
            zh: {
                title: "宝石粉碎者",
                loading: "加载中",
                dragHint: "滑动以旋转石体 - 轻触以敲击",
                searchRelicsHint: "寻找隐藏的宝石",
                relicGleams: "宝石显现 - 轻触以收集",
                relicsRemain2: "还剩两颗宝石",
                relicsRemain1: "还剩一颗宝石",
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
                iceHeart: "极寒冰心",
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
                eggHint: "蛋壳会再生，快速破开",
                relicsClaimed: "集齐所有宝石，总共锤击 {strikes} 次",
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
                hapticsLabel: "触觉震动",
                screenShakeLabel: "屏幕震动",
                onText: "开启",
                offText: "关闭"
            },
            "zh-hant": {
                title: "寶石粉碎者",
                loading: "載入中",
                dragHint: "滑動以旋轉石體 - 輕觸以敲擊",
                searchRelicsHint: "尋找隱藏的寶石",
                relicGleams: "寶石顯現 - 輕觸以收集",
                relicsRemain2: "還剩兩顆寶石",
                relicsRemain1: "還剩一顆寶石",
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
                iceHeart: "極寒冰心",
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
                eggHint: "蛋殼會再生，快速破開",
                relicsClaimed: "集齊所有寶石，總共錘擊 {strikes} 次",
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
                hapticsLabel: "觸覺 / 晃動",
                onText: "開啟",
                offText: "關閉"
            },
            ar: {
                title: "محطم الجواهر",
                loading: "جاري التحميل",
                dragHint: "اسحب للتدوير - اضغط للضرب",
                searchRelicsHint: "ابحث عن الجواهر المخفية",
                relicGleams: "تلمع جوهرة - اضغط لجمعها",
                relicsRemain2: "تبقى جوهرتان",
                relicsRemain1: "تبقى جوهرة واحدة",
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
                iceHeart: "قلب جليدي",
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
                eggHint: "القشرة تتجدد. اكسرها بسرعة.",
                relicsClaimed: "تم جمع كل الجواهر في {strikes} ضربة",
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
                hapticsLabel: "الاهتزاز اللمسي",
                screenShakeLabel: "اهتزاز الشاشة",
                screenShakeLabel: "اهتزاز الشاشة",
                onText: "تفعيل",
                offText: "إيقاف"
            },
            hi: {
                title: "रत्न क्रैकर",
                loading: "लोड हो रहा है",
                dragHint: "घुमाने के लिए खींचें - प्रहार करने के लिए टैप करें",
                searchRelicsHint: "छिपे हुए रत्न खोजें",
                relicGleams: "एक रत्न चमक रहा है - लेने के लिए टैप करें",
                relicsRemain2: "दो रत्न बाकी हैं",
                relicsRemain1: "एक रत्न बाकी है",
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
                iceHeart: "बर्फ का दिल",
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
                eggHint: "खोल फिर भर जाता है। जल्दी तोड़ें।",
                relicsClaimed: "सभी रत्न {strikes} प्रहारों में प्राप्त",
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
                hapticsLabel: "हैप्टिक कंपन",
                screenShakeLabel: "स्क्रीन कंपन",
                onText: "चालू",
                offText: "बंद"
            },
            ja: {
                title: "ジェムクラッカー",
                loading: "読み込み中",
                dragHint: "ドラッグで回転 - タップで叩く",
                searchRelicsHint: "隠された宝石を探そう",
                relicGleams: "宝石が光っている - タップして手に入れよう",
                relicsRemain2: "宝石が2つ残っている",
                relicsRemain1: "宝石が1つ残っている",
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
                iceHeart: "氷のハート",
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
                eggHint: "殻は再生する。素早く壊そう。",
                relicsClaimed: "すべての宝石を{strikes}回の攻撃で獲得",
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
                hapticsLabel: "振動 (ハプティクス)",
                screenShakeLabel: "画面の揺れ",
                onText: "オン",
                offText: "オフ"
            },
            ru: {
                title: "Крушитель Самоцветов",
                loading: "Загрузка",
                dragHint: "потяните для поворота — коснитесь для удара",
                searchRelicsHint: "ищите скрытые самоцветы",
                relicGleams: "самоцвет мерцает — коснитесь, чтобы забрать его",
                relicsRemain2: "осталось два самоцвета",
                relicsRemain1: "остался один самоцвет",
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
                iceHeart: "ЛЕДЯНОЕ СЕРДЦЕ",
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
                eggHint: "скорлупа восстанавливается. Разбивайте быстро.",
                relicsClaimed: "все самоцветы получены за {strikes} ударов",
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
                'obsidianGeode', 'moltenCore', 'clockworkSphere', 'fossilizedTrunk',
                'honeycombHive', 'chainReliquary', 'fallenStar', 'dragonEgg'
            ]),
            levelWinKeys: Object.freeze([
                'wonCubeCracked', 'wonPillarCracked', 'wonPyramidCracked', 'wonHeartShattered',
                'wonGeodeCracked', 'wonCoreQuenched', 'wonClockworkStopped', 'wonTrunkSplit',
                'wonHiveBroken', 'wonReliquaryOpened', 'wonStarDimmed', 'wonEggPlundered'
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
                winDesc.innerHTML = window._t('relicsClaimed', { strikes: `<span id="strikeCount">${window.strikes}</span>` });
            }

            // Star ranking (its label is localized, the stars themselves are not)
            if (window.paintWinRank) window.paintWinRank();

            // Live per-level strike counter beneath the relic slots.
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
                const total = window.hitsPerLevel.reduce((sum, h) => sum + h, 0);
                const currentCountVal = document.getElementById('totalHitsCount') ? document.getElementById('totalHitsCount').textContent : total;
                const isBouncing = document.getElementById('totalHitsCount') && document.getElementById('totalHitsCount').classList.contains('bounce-active') ? 'class="bounce-active"' : '';
                totalStats.innerHTML = window._t('totalHitsLabel', { total: `<span id="totalHitsCount" ${isBouncing} style="display: inline-block;">${currentCountVal}</span>` });
            }

            const restartGameBtn = document.getElementById('restartGame');
            if (restartGameBtn) restartGameBtn.textContent = window._t('startOver');

            const levelStatsContainer = document.getElementById('levelStats');
            if (levelStatsContainer && window.hitsPerLevel && window.LEVELS && levelStatsContainer.children.length > 0) {
                levelStatsContainer.innerHTML = '';
                window.LEVELS.forEach((lvl, idx) => {
                    const lvlNameKey = window.LEVEL_NAME_KEYS[idx] || 'stoneCube';
                    const localizedName = window._t ? window._t(lvlNameKey) : lvl.name;
                    const hitsFormatted = window._t('levelHitsLabel', { hits: window.hitsPerLevel[idx] });

                    const row = document.createElement('div');
                    row.style.display = 'flex';
                    row.style.justifyContent = 'space-between';
                    row.style.fontSize = '24px';
                    row.style.color = 'var(--dim)';
                    row.innerHTML = `<span>${localizedName}</span><span style="font-family: monospace; color: var(--gold);">${hitsFormatted}${window.rankRowMarkup(idx, window.hitsPerLevel[idx])}</span>`;
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
            const list = (window.gameConfig && window.gameConfig.starRanks) || [];
            const entry = list[levelIdx] || {};
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
            if (!hits) return ''; // never played: nothing to rate
            const rank = window.starRankFor(levelIdx, hits);
            const style = window.RANK_STYLE[rank.tier];
            return `<span style="color: ${style.color}; letter-spacing: 0.06em; margin-left: 12px;">${window.rankStarsText(rank)}</span>`;
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
            });

            newMusicSlider.addEventListener('input', (e) => {
                const val = parseInt(e.target.value) / 100;
                musicVal.textContent = e.target.value + '%';
                if (window.CubeCrackerAudio && window.CubeCrackerAudio.setMusicVol) {
                    window.CubeCrackerAudio.setMusicVol(val);
                } else {
                    window.musicVolume = val;
                }
            });

            // Handle Language dropdown change
            newLangSelect.addEventListener('change', (e) => {
                const newLang = e.target.value;
                if (window.currentLang === newLang) return;
                window.setGameLanguage(newLang);
            });

            const shakeRow = newOverlay.querySelector('#shake-row');
            const newShakeToggle = newOverlay.querySelector('#shake-toggle');
            const shakeStatus = newOverlay.querySelector('#shake-status');

            if (newShakeToggle) {
                newShakeToggle.checked = window.screenShakeEnabled !== false;
                if (shakeStatus) shakeStatus.textContent = newShakeToggle.checked ? window._t('onText') : window._t('offText');
                newShakeToggle.addEventListener('change', (e) => {
                    window.screenShakeEnabled = e.target.checked;
                    try { localStorage.setItem('cube_cracker_screen_shake', String(window.screenShakeEnabled)); } catch (err) {}
                    if (shakeStatus) shakeStatus.textContent = window.screenShakeEnabled ? window._t('onText') : window._t('offText');
                });
            }

            const hapticsRow = newOverlay.querySelector('#haptics-row');
            const newHapticsToggle = newOverlay.querySelector('#haptics-toggle');
            const hapticsStatus = newOverlay.querySelector('#haptics-status');

            // Show haptics option only on mobile / vibration-capable devices
            const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || ('vibrate' in navigator);
            if (hapticsRow) {
                hapticsRow.style.display = isMobile ? 'flex' : 'none';
            }

            if (newHapticsToggle) {
                newHapticsToggle.checked = window.hapticsEnabled !== false;
                if (hapticsStatus) hapticsStatus.textContent = newHapticsToggle.checked ? window._t('onText') : window._t('offText');
                newHapticsToggle.addEventListener('change', (e) => {
                    window.hapticsEnabled = e.target.checked;
                    try { localStorage.setItem('cube_cracker_haptics', String(window.hapticsEnabled)); } catch (err) {}
                    if (hapticsStatus) hapticsStatus.textContent = window.hapticsEnabled ? window._t('onText') : window._t('offText');
                });
            }

            // Initialize sliders and select from defaults
            newSfxSlider.value = Math.round(window.masterVolume * 100);
            sfxVal.textContent = newSfxSlider.value + '%';
            newMusicSlider.value = Math.round(window.musicVolume * 100);
            musicVal.textContent = newMusicSlider.value + '%';
            newLangSelect.value = window.currentLang;
        };
        
        window.ringsFound = Array(12).fill(false);

        async function loadBestScores() {
            try {
                const saved = localStorage.getItem('cube_cracker_game_state');
                if (saved) {
                    const state = JSON.parse(saved);
                    // Merge rather than overwrite: the game may already have recorded a newer
                    // best (or a just-found ring) in memory before this async load lands, and a
                    // wholesale swap used to clobber that progress.
                    if (state && Array.isArray(state.bestScores)) {
                        for (let i = 0; i < state.bestScores.length && i < window.bestScores.length; i++) {
                            const savedScore = state.bestScores[i];
                            if (savedScore != null && (window.bestScores[i] == null || savedScore < window.bestScores[i])) {
                                window.bestScores[i] = savedScore;
                            }
                        }
                    }
                    if (state && Array.isArray(state.ringsFound)) {
                        for (let i = 0; i < state.ringsFound.length && i < window.ringsFound.length; i++) {
                            if (state.ringsFound[i]) window.ringsFound[i] = true;
                        }
                    }
                    if (window.renderLevelList) window.renderLevelList();
                }
            } catch (e) {
                console.warn('Failed to load best scores', e);
            }
        }

        // Load the authored per-level data file (star-rank thresholds live in `gameConfig`).
        // If it is missing or unparseable the game keeps its built-in defaults, so a broken
        // config can never stop the game from loading.
        fetch('config')
            .then((r) => {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.json();
            })
            .then((cfg) => {
                window.gameConfig = cfg;
                if (window.renderLevelList) window.renderLevelList(); // stars may change now
            })
            .catch((e) => {
                console.warn('Failed to load config; using default star ranks', e);
                window.gameConfig = null;
            });

        // Audit key coverage and placeholder parity once after the table has been defined.
        window.validateTranslations();

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => { initOptions(); initLevelSelect(); loadBestScores(); });
        } else {
            initOptions();
            initLevelSelect();
            loadBestScores();
        }
    

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
                const H = half * 2.0 * S;  // full height, centered on origin
                const y0 = -H / 2;
                const apex = new V3(0, H / 2, 0);
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
                return makeShape(faces, { x: w, y: H / 2, z: w }, (2 * w) * (2 * w) * H / 3);
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
                return makeShape(faces, { x: h, y: h, z: h }, (4/3) * h * h * h * Math.sqrt(2));
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
                const P_left = p(-1.0, 0.1, 0);
                const P_right = p(1.0, 0.1, 0);
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
            let musicBuffer = null;
            let musicLoading = false;
            let musicSource = null;

            function getAssetUrl(id) {
                return 'audio/' + id + '.mp3';
            }

            async function loadIceSound() {
                if (!iceBuffer && !iceLoading) {
                    iceLoading = true;
                    try {
                        const c = ac();
                        if (c) {
                            const resp = await fetch(getAssetUrl('ice_crack'));
                            const arrayBuffer = await resp.arrayBuffer();
                            iceBuffer = await c.decodeAudioData(arrayBuffer);
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
                            iceBuffer2 = await c.decodeAudioData(arrayBuffer);
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
                                metalThudBuffers[i] = await c.decodeAudioData(arrayBuffer);
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
                        hammerBuffer = await c.decodeAudioData(arrayBuffer);
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
                        softBounceBuffer = await c.decodeAudioData(arrayBuffer);
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
                        musicBuffer = await c.decodeAudioData(arrayBuffer);
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

                    window._cubeMasterGain = window._cubeAudioCtx.createGain();
                    window._cubeMasterGain.gain.value = window.masterVolume !== undefined ? window.masterVolume : 1.0;
                    window._cubeMasterGain.connect(window._cubeAudioCtx.destination);

                    window._cubeMusicGain = window._cubeAudioCtx.createGain();
                    window._cubeMusicGain.gain.value = window.musicVolume !== undefined ? window.musicVolume : 0.5;
                    window._cubeMusicGain.connect(window._cubeMasterGain);
                }
                ctx = window._cubeAudioCtx;
                masterGain = window._cubeMasterGain;
                musicGain = window._cubeMusicGain;
                
                if (autoResume && ctx.state === 'suspended') {
                    ctx.resume().catch(() => {});
                }
                return ctx;
            }

            function setMasterVol(val) {
                window.masterVolume = val;
                if (ctx && masterGain) {
                    masterGain.gain.setValueAtTime(val, ctx.currentTime);
                }
            }

            function setMusicVol(val) {
                window.musicVolume = val;
                if (ctx && musicGain) {
                    musicGain.gain.setValueAtTime(val, ctx.currentTime);
                }
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

            function thunk(isIce = false) {
                const c = ac(); if (!c) return;
                const t = c.currentTime;
                if (isIce) {
                    const bufferToPlay = (iceCounter % 2 === 0) ? iceBuffer : (iceBuffer2 || iceBuffer);
                    iceCounter++;
                    if (bufferToPlay) {
                        const src = c.createBufferSource();
                        src.buffer = bufferToPlay;
                        // Add random detune (±200 cents) for crystalline variety
                        if (src.detune && src.detune.setValueAtTime) {
                            src.detune.setValueAtTime((Math.random() * 2 - 1) * 200, t);
                        }
                        const g = c.createGain();
                        g.gain.setValueAtTime(0.75, t);
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
                            o.frequency.setValueAtTime(freq, t);
                            o.frequency.linearRampToValueAtTime(freq * 0.95, t + 0.04);

                            // Very fast decay for icy crystal tines (0.04s - 0.12s)
                            const decay = 0.04 + (idx * 0.025);
                            o.connect(env(c, 0.15 / (idx + 1), decay, t));
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
                    // Add random detune (±250 cents) for organic variety
                    if (src.detune && src.detune.setValueAtTime) {
                        src.detune.setValueAtTime((Math.random() * 2 - 1) * 250, t);
                    }
                    const g = c.createGain();
                    g.gain.setValueAtTime(0.7, t);
                    src.connect(g);
                    g.connect(masterGain || c.destination);
                    src.start(t);
                } else {
                    loadHammerSound();
                    const detune = (Math.random() * 2 - 1) * 10; // small freq shift for synth fallback
                    // Main punchy impact
                    const o = c.createOscillator();
                    o.type = 'triangle';
                    o.frequency.setValueAtTime(130 + detune, t);
                    o.frequency.exponentialRampToValueAtTime(38 + detune, t + 0.13);
                    o.connect(env(c, 0.7, 0.2, t));
                    o.start(t); o.stop(t + 0.25);

                    // Low-end resonance (subtle boom)
                    const o2 = c.createOscillator();
                    o2.type = 'sine';
                    o2.frequency.setValueAtTime(75 + detune, t);
                    o2.frequency.exponentialRampToValueAtTime(30 + detune, t + 0.3);
                    o2.connect(env(c, 0.3, 0.5, t));
                    o2.start(t); o2.stop(t + 0.6);

                    // Impact noise/crack
                    const n = noise(c);
                    const f = c.createBiquadFilter();
                    f.type = 'lowpass';
                    f.frequency.setValueAtTime(1400, t);
                    f.frequency.exponentialRampToValueAtTime(180, t + 0.12);
                    n.connect(f); f.connect(env(c, 0.5, 0.16, t));
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
                loadSoftBounceSound();
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
            let visibilityAudioSuspended = false;
            function pauseForVisibility() {
                const c = window._cubeAudioCtx;
                visibilityAudioSuspended = !!(c && c.state === 'running');
                if (visibilityAudioSuspended) {
                    c.suspend().catch(() => { visibilityAudioSuspended = false; });
                }
            }

            function resumeFromVisibility() {
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
                if (sfx === 'thunk') thunk(arg);
                else if (sfx === 'bounce') bounce();
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
                if (data && data.hidden) pauseForVisibility();
                else resumeFromVisibility();
            });
        }

        window.CubeCrackerAudio = { thunk, metalThud, shatter, boom, reveal, chime, win, startOverJingle, bounce, warm, preloadAllAudio, startMusic, stopMusic, pauseForVisibility, resumeFromVisibility, setMasterVol, setMusicVol };
        })();

    

        // Gems in the cube - main game: scene, drag-rotate, hammer strikes, debris physics, relics
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

            const GEM_COLORS = [0xffb45e, 0x6ee0ff, 0xc89bff];

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
            const RELIC_WOOD = { outer: [0.31, 0.20, 0.13], inner: [0.56, 0.41, 0.25] };
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
                    shape: 'heart', colors: ICE, name: 'ICE HEART', won: 'HEART SHATTERED', break: 'ice', rough: 0.5, metal: 0.06, rods: 2,
                    sizeMul: ICE_SIZE * 1.35 * 0.88 * 1.5 * ICE_GROW * 0.88, cam: ICE_SIZE * 0.75 * 1.5 * 1.15 * ICE_CAM * 0.84 * 0.95, chunkMul: 0.18 * 1.5 * 1.5 * 1.5 * ICE_GROW * ICE_GROW * ICE_GROW,
                    // Fixed anchors keep the three relics in separate lobes / lower point of the heart.
                    // Values are normalized to this shape's x/y/z bounds, so they scale with the heart.
                    relicLayout: [[-0.44, 0.23, 0], [0.44, 0.23, 0], [0, -0.52, 0]],
                    bg: 'radial-gradient(120% 90% at 50% 38%, #471a59 0%, #251138 55%, #13091e 100%)'
                },
                {
                    shape: 'geode', colors: OBSIDIAN, name: 'OBSIDIAN GEODE', won: 'GEODE CRACKED', break: 'obsidian', rough: 0.18, metal: 0.42,
                    sizeMul: 1.35, cam: 1.15, chunkMul: 1.9, bg: 'radial-gradient(120% 90% at 50% 38%, #2c1d3f 0%, #17101f 55%, #0a0710 100%)'
                },
                // `blocks: 4` embeds four solid metal cubes in the core, three of them shoved out far
                // enough that a corner breaks the skin (see planEmbeddedBlocks) — those are visible and
                // hittable from the first frame, while the fourth is sealed in and has to be dug out.
                // Metal never shatters: each cube soaks up BAND_HP blows, then shears off in one piece.
                {
                    shape: 'orb', colors: MAGMA, name: 'MOLTEN CORE', won: 'CORE QUENCHED', break: 'molten', rough: 0.62, metal: 0.14,
                    blocks: 4, blocksJut: 3, blockLayout: 'embedded',
                    sizeMul: 1.56, cam: 1.20, chunkMul: 2.59, bg: 'radial-gradient(120% 90% at 50% 38%, #5c1c0a 0%, #2c0d06 55%, #150503 100%)'
                },
                // Not a fractured solid: `build:'gears'` packs the orb's volume with individual
                // solid gear pieces of assorted sizes, plus three small clumps of dirt that hide
                // the relics. chunkMul here is the gear count, not a fracture density.
                {
                    shape: 'orb', colors: BRASS, name: 'CLOCKWORK SPHERE', won: 'CLOCKWORK STOPPED', break: 'clockwork', build: 'gears', rough: 0.34, metal: 0.72,
                    // chunkMul is the gear count multiplier here (150 * mul): 0.8533 -> 128 gears

                    sizeMul: 1.45, cam: 1.28, chunkMul: 0.8533, bg: 'radial-gradient(120% 90% at 50% 38%, #4a3a1c 0%, #241c0e 55%, #120e07 100%)'
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
                // partition the cavity into compartments, and each relic sits inside a clump of
                // dirt in one of them — see buildHollowChest().
                {
                    shape: 'chest', colors: RELIC_WOOD, name: 'CHAIN-BOUND CHEST', won: 'CHEST OPENED',
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
                    // Anchor the three relics in three separate star tips (bottom, upper-right
                    // and lower-left) so they sit well apart, and stagger their depth: one in
                    // the outer shell, one mid-way, one tucked close to the centre. Values are
                    // normalized to this shape's x/y/z bounds, like the heart's layout.
                    relicLayout: [[0, -0.60, 0], [0.265, 0.364, 0], [-0.209, -0.068, 0]],
                    bg: 'radial-gradient(120% 90% at 50% 38%, #1b2c55 0%, #0d152b 55%, #05070f 100%)'
                },
                // Dragon egg: nothing here is ever destroyed. A blow only caves the shell in — every
                // piece it reaches shrinks away to nothing — and then the egg knits itself back
                // together, each piece springing back with the honeycomb's bounce. The wait before a
                // piece regrows is inversely proportional to its distance from the impact, so the
                // crater closes from the rim inward and the hole is only open for a moment: prise a
                // relic out while its own piece is gone (see eggShrink() / updateEggRelics()).
                {
                    shape: 'egg', colors: EGGSHELL, name: 'DRAGON EGG', won: 'EGG PLUNDERED',
                    break: 'egg', rough: 0.58, metal: 0.24,
                    sizeMul: 1.863, cam: 1.28, chunkMul: 2.0,
                    relicLayout: [[-0.42, 0.30, 0.10], [0.44, -0.10, -0.20], [0.05, -0.52, 0.28]],
                    bg: 'radial-gradient(120% 90% at 50% 38%, #123c33 0%, #0a2320 55%, #04100e 100%)'
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

            const updateSize = () => {
                const w = canvasHost.clientWidth;
                const h = canvasHost.clientHeight;
                renderer.setSize(w, h);
                const uPx = (6 + 1.0 * Math.min(w, h) / 100) / 16;
                document.documentElement.style.setProperty('--u', uPx + 'px');
                const aspect = w / h;
                camera.aspect = aspect;

                // Smoothly ramp FOV boost as aspect ratio narrows below 4:3 (1.333) down to 1.0 (square)
                // Fitted to BASE_FOV (42°): ramps from +0° boost at 4:3+ up to +5° boost at 1:1 square
                const sqT = THREE.MathUtils.clamp((1.333 - aspect) / 0.333, 0, 1);
                const fovBoost = THREE.MathUtils.lerp(0, 5, sqT);

                if (aspect < 1) {
                    const halfFovRad = THREE.MathUtils.degToRad((BASE_FOV + fovBoost) * 0.5);
                    const halfHFovRad = Math.atan(Math.tan(halfFovRad) / aspect);
                    camera.fov = THREE.MathUtils.radToDeg(halfHFovRad * 2);
                } else {
                    camera.fov = BASE_FOV + fovBoost;
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
            // own (never a relic's). It stays completely hidden until that chunk is destroyed —
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
            // Buried metal cubes are placed BEFORE the relics are scattered (see planBlocks), so the
            // relic sampler can refuse any spot that overlaps one — a relic sealed inside solid metal
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
            let zoomFactor = 1.0;
            const MIN_ZOOM = 0.65;
            const MAX_ZOOM = 1.1;
            const activePointers = new Map();
            let initialPinchDist = 0;
            let initialZoomFactor = 1.0;

            const hud = {
                slots: [...document.querySelectorAll('.slot')],
                hint: document.getElementById('hint'),
                overlay: document.getElementById('overlay'),
                // NOTE: #strikeCount is re-created by applyTranslations() (it rewrites
                // winDesc.innerHTML), so it must be looked up fresh at use time — never cached here.
                winTitle: document.getElementById('winTitle'),
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
                b.subscribe('vfx:vignette', (data) => triggerVignetteFlash(data && data.colorHex));
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
                        try { navigator.vibrate(14); } catch (e) {}
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
                    if ((!showBomb || bombUsed) && currentTool === 'bomb') currentTool = 'hammer';
                }
                hammerBtn.classList.toggle('active', currentTool === 'hammer');
                scanBtn.classList.toggle('active', currentTool === 'scan');
                if (bombBtn) bombBtn.classList.toggle('active', currentTool === 'bomb');
            }

            // Tool name popup: floats above the tool bar, horizontally centered on screen.
            const toolToast = document.getElementById('tool-toast');
            let toolToastTimer = 0;
            function showToolToast(key) {
                if (!toolToast) return;
                toolToast.textContent = window._t ? window._t(key) : key;
                toolToast.classList.remove('show');
                void toolToast.offsetWidth; // restart the transition
                toolToast.classList.add('show');
                clearTimeout(toolToastTimer);
                toolToastTimer = setTimeout(() => toolToast.classList.remove('show'), 1300);
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
                    currentTool = 'scan';
                    refreshToolUI();
                    bus('vfx:toast', 'lensToolName');
                };
            }
            if (bombBtn) {
                bombBtn.onclick = (e) => {
                    e.preventDefault(); e.stopPropagation();
                    if (bombUsed) { bus('vfx:toast', 'bombSpent'); return; } // one charge per level
                    currentTool = 'bomb';
                    refreshToolUI();
                    showToolToast('bombToolName');
                };
            }

            // Project the relic's live world position to page coordinates and drop a UI-level
            // flare there. Being DOM, it always paints on top of the solid the relic is buried
            // in. The flare stays anchored to the relic for as long as it's alive: every active
            // ping is re-projected each frame (see updateGemPings), so dragging the solid or
            // moving the camera keeps the diamond and its ring on top of the relic.
            const GEM_PING_BASE = 46;
            const GEM_PING_LIFE = 1.7; // seconds; matches the CSS animation duration
            let gemPings = [];
            const _pingWorld = new V3();

            function positionGemPing(p) {
                if (!p.target || !p.target.group) return;
                p.target.group.getWorldPosition(_pingWorld);
                // The diamond reads as a depth cue: it shrinks the deeper the relic sits away
                // from the camera. Measure the distance BEFORE projecting (project() mutates
                // the scratch vector). The ring deliberately keeps a constant size, so it stays
                // a readable, consistent pulse whatever the depth.
                const dist = _pingWorld.distanceTo(camera.position);
                const refDist = camera.position.distanceTo(CAM_LOOK);
                const scale = Math.max(0.45, Math.min(1.7, refDist / Math.max(dist, 0.001)));
                const v = _scratchPos.copy(_pingWorld).project(camera);
                const host = canvasHost.getBoundingClientRect();
                const x = (v.x * 0.5 + 0.5) * host.width + host.left;
                const y = (-v.y * 0.5 + 0.5) * host.height + host.top;
                const gs = p.gem.style;
                gs.left = x + 'px';
                gs.top = y + 'px';
                if (Math.abs(scale - p.scale) > 0.01) { // glow/size only when depth really changed
                    p.scale = scale;
                    const size = GEM_PING_BASE * scale;
                    gs.width = size + 'px';
                    gs.height = size + 'px';
                    gs.borderRadius = (7 * scale) + 'px';
                    gs.boxShadow = `0 0 ${14 * scale}px ${p.css}, 0 0 ${34 * scale}px ${p.css}, 0 0 ${62 * scale}px ${p.css}`;
                }
                p.ring.style.left = x + 'px';
                p.ring.style.top = y + 'px';
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
                    // the relic itself, so it follows it as the solid or camera is turned.
                    spawnGemPing(t, t.sprite.material.color);
                    t.revealFlash = Math.max(t.revealFlash || 0, 0.7);
                }
                if (any) {
                    CubeCrackerAudio.chime(0);
                    shake = (window.screenShakeEnabled !== false) ? 0.05 * MOTION : 0; if (window.hapticsEnabled !== false && navigator.vibrate) { try { navigator.vibrate(14); } catch (e) {} }
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

                if (plantedBomb) {
                    if (plantedBomb.mesh.parent) plantedBomb.mesh.parent.remove(plantedBomb.mesh);
                    plantedBomb.mat.dispose();
                    plantedBomb = null;
                }
                moltenQueue = [];
                moltenWounds = [];
                for (const tw of crustTweens) tw.chunk.crustTween = null;
                crustTweens = [];
                disposeLavaStreams();
                for (const s of hiveSquash) s.chunk.squash = null;
                hiveSquash = [];
                disposeHoneyDrips();
                disposeRelicRig();
                disposeBands();
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
                                                : material === 'star' ? 'starHint'
                                                    : level === 0 ? 'dragHint'
                                                        : 'levelHint';
            }

            // A relic must sit at least this far inside every face so its encasing chunk is
            // fully internal (never a surface chunk) — otherwise the gem peeks out before any
            // strike, e.g. in the pyramid's narrow apex.
            const RELIC_MARGIN = 0.42;
            function buriedBy(shp, margin) {
                return (p) => {
                    for (const pl of shp.planes) if (pl.d - p.dot(pl.n) < margin) return false;
                    return true;
                };
            }

            // A relic may never share a spot with a buried metal cube (it would be sealed in metal
            // and unreachable, and the gem would glow out of solid steel). Keep clear of the whole
            // block plus a margin. The margin is PER BLOCK (`b.clear`), because it depends on how
            // the cube sits: a cocked cube reaches s*sqrt(3) ~= 1.74s along its placement axis, so
            // it needs the full 2.6s, while an axis-aligned cube only ever reaches s and a smaller
            // guard is enough. Over-guarding matters: the pyramid's single large centre block with a
            // 2.6s box would swallow the entire relic sampling volume, leaving the sampler with no
            // legal spot at all and forcing it onto the last-resort pass (which drops the guard and
            // lets relics clump together inside the metal).
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

            function randomTreasurePositions(shp) {
                const b = shp.bound;
                const tb = { x: b.x * 0.6, y: b.y * 0.6, z: b.z * 0.6 };
                const minSep = Math.min(b.x, b.y, b.z) * 0.7;
                const sample = () => new V3(
                    (Math.random() * 2 - 1) * tb.x,
                    (Math.random() * 2 - 1) * tb.y,
                    (Math.random() * 2 - 1) * tb.z
                );
                const buried = buriedBy(shp, RELIC_MARGIN);
                const inBlocks = (p) => buried(p) && clearOfBlocks(p);
                // Separation is relaxed in graded steps rather than dropped outright, so a solid
                // whose free volume is tight (e.g. the pyramid around its big centre block) still
                // ends up with relics that are modestly spread instead of clumped together. Only
                // once every spaced pass has failed do the guards themselves start coming off, and
                // the very last pass exists purely so a level can never generate fewer than 3.
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
                    while (pts.length < 3 && guard++ < 6000) {
                        const p = sample();
                        if (!pass.ok(p)) continue;
                        if (pass.sep === 0 || pts.every((q) => q.distanceTo(p) > pass.sep)) pts.push(p);
                    }
                    if (pts.length === 3) return pts;
                    if (pts.length > best.length) best = pts; // keep the closest attempt as a floor
                }
                return best;
            }

            // Optional level-authored relic anchors. Coordinates are normalized against the
            // active shape's bounds, which keeps a layout stable even if that level's size changes.
            function treasureLayoutPositions(lvl, shp) {
                if (!lvl.relicLayout) return null;
                return lvl.relicLayout.map(([x, y, z]) => new V3(
                    x * shp.bound.x,
                    y * shp.bound.y,
                    z * shp.bound.z
                ));
            }

            // ---------- clockwork: a packed mass of solid gears ----------
            // The clockwork level isn't a fractured solid. Its volume is packed with individual
            // gear pieces of assorted sizes, plus three small clumps of dirt that hide the
            // relics. Each piece is emitted in exactly the shape the Voronoi fracture uses —
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
            function makeGearGeometry(R, T, teeth, base) {
                const half = T * 0.5;
                const rootR = R * 0.74;
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
            // hammer — partition that cavity into six compartments, and three of them hold a relic
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
                    // one relic per bay, in a random shelf half, so they're always spread out
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

            // The relic's invisible tap target is identical for every relic and nothing
            // mutates it, so build it once for the page rather than per relic per build() —
            // the per-build copies used to be allocated but never disposed, leaking a
            // geometry + material on the GPU on every level advance and context restore.
            // Deliberately much larger than the gem it wraps (octahedron r=0.1875) and larger
            // than its glow sprite (0.9 units wide, so 0.45 half-extent) — a relic is a small
            // target on a phone, so the invisible tap box is ~3x the visible gem.
            const hitSphereGeo = new THREE.SphereGeometry(0.58, 10, 8);
            const hitSphereMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });

            // The secret gold ring: one per level, so its geometry/material live for the page
            // rather than being rebuilt (and leaked) on every build().
            const ringGeo = new THREE.TorusGeometry(0.17, 0.052, 6, 16);
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
            // Sealed inside one chunk, chosen after the relics are placed so it never shares a
            // chunk with one (and is kept well away from them, so it can't be uncovered by
            // accident while digging a relic out). Invisible until that chunk is gone.
            function createSecretRing() {
                if (!chunks.length) return null;
                const relicChunks = new Set();
                for (const t of treasures) if (t.chunk) relicChunks.add(t.chunk);
                const pool = [];
                for (const c of chunks) {
                    if (!c.alive || relicChunks.has(c)) continue;
                    if (c.kind === 'dirt') continue; // dirt clumps are the relics' own wrapping
                    pool.push(c);
                }
                if (!pool.length) return null;
                const buried = buriedBy(shape, RELIC_MARGIN * 0.75);
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
                spawnJuiceText('SECRET RING!!!', wp, '#ffd166', '40px');
            }

            function collectRing() {
                const r = secretRing;
                if (!r || r.collected) return;
                r.collected = true;
                ringFound = true;
                window.ringsFound[level] = true;
                (async () => {
                    try {
                        localStorage.setItem('cube_cracker_game_state', JSON.stringify({ bestScores: window.bestScores, ringsFound: window.ringsFound }));
                    } catch (e) {
                        console.warn('Failed to save ring progress', e);
                    }
                })();
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

            // The ring flies to its HUD badge, exactly like a relic flies to its slot: the
            // badge's screen position is unprojected into world space so the flight always
            // lands on the icon whatever the viewport shape.
            function ringBadgeWorldTarget() {
                const el = document.getElementById('ring-badge');
                const host = canvasHost.getBoundingClientRect();
                let ndcX = 0.75, ndcY = 0.85;
                if (el) {
                    const r = el.getBoundingClientRect();
                    ndcX = ((r.left + r.width / 2 - host.left) / host.width) * 2 - 1;
                    ndcY = -((r.top + r.height / 2 - host.top) / host.height) * 2 + 1;
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
                // invisible tap target: still thumb-friendly on a phone, but trimmed slightly so
                // it hugs the brass more closely than it used to
                const hit = new THREE.Mesh(
                    new THREE.BoxGeometry(bw * 1.45, bh * 2.0, bd * 2.3),
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

            function buildRelicRig(bx, by, bz) {
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
                setRelicRigVisible(false); // snaps on once the chest finishes assembling
            }

            // Hidden during the fly-in intro so the locks and chains don't hang in mid-air while the
            // timber is still assembling itself around them.
            function setRelicRigVisible(v) {
                for (const rig of lockRigs) rig.group.visible = v;
                for (const b of chainBands) if (!b.flying) b.mesh.visible = v;
            }

            function disposeRelicRig() {
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
            // anything yet, so the relic sampler can steer clear of them. Same math as before.
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
                    // invisible tap target sitting over the block — a little snugger than before,
                    // so the metal reads the same size but is slightly harder to clip by accident
                    const hit = new THREE.Mesh(
                        new THREE.BoxGeometry(s * 2.3, s * 2.3, s * 2.3),
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
                const L = Math.hypot(b.x, b.y) * 1.43;  // half-length spike, 10% longer
                const r = Math.min(b.x, b.z) * 0.135;   // slightly slimmer steel rod
                const n = Math.max(1, Math.min(count | 0, 2));
                const tilts = [0, Math.PI / 2]; // upright + level: a plus-shaped cross through the heart
                for (let i = 0; i < n; i++) {
                    const sign = (i % 2 === 0) ? 1 : -1;
                    const mat = new THREE.MeshStandardMaterial({
                        color: 0x9aa3ad, roughness: 0.30, metalness: 0.95, flatShading: true,
                        emissive: 0xffd9a0, emissiveIntensity: 0,
                    });
                    // tapered cylinder: pointed at one end, blunt at the other, so it reads as a spike
                    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, L, 8), mat);
                    mesh.quaternion.setFromEuler(new THREE.Euler(sign * 0.20, 0, tilts[i % tilts.length]));
                    const upright = (i % tilts.length) === 0; // the vertical rod sits a little lower
                    mesh.position.set(0, b.y * (upright ? -0.10 : 0.06), sign * r * 1.4); // offset in z so they cross, not clip
                    cubeGroup.add(mesh);
                    // invisible tap target sleeved over the rod, trimmed in a touch from the old
                    // radius so taps just off the steel land on the ice instead
                    const hit = new THREE.Mesh(
                        new THREE.CylinderGeometry(r * 2.8, r * 2.8, L, 10, 1, true),
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

            // A blow that landed on a metal band. It rings, the hoop shudders on the stone and dents a
            // shade darker; nothing around it breaks. Once it has taken BAND_HP hits it tears off whole.
            function bandStrike(rig) {
                const hitWorld = cubeGroup.localToWorld(swing.hitLocal.clone());
                rig.hits++;
                rig.shake = 1;
                CubeCrackerAudio.metalThud();
                if (window.hapticsEnabled !== false && navigator.vibrate) {
                    try { navigator.vibrate(22); } catch (e) { }
                }
                shake = (window.screenShakeEnabled !== false) ? 0.20 * MOTION : 0; if (window.hapticsEnabled !== false && navigator.vibrate) { try { navigator.vibrate(14); } catch (e) {} }
                kick = 0.09 * MOTION;
                wobbleAmp = 0.028 * MOTION;
                wobbleTime = 0;
                spawnShockwave(hitWorld, swing.n);
                flash(hitWorld);
                spawnImpactSparks(hitWorld, 16);
                triggerVignetteFlash('215, 232, 255');
                const k = Math.min(rig.hits / BAND_HP, 1); // battered metal darkens
                rig.mat.color.setRGB(0.60 - k * 0.20, 0.64 - k * 0.22, 0.68 - k * 0.24);
                if (rig.hits >= BAND_HP) {
                    spawnJuiceText(rig.rod ? 'ROD SNAPS!!!' : rig.block ? 'METAL BREAKS!!!' : 'BAND BREAKS!!!',
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
                shake = (window.screenShakeEnabled !== false) ? 0.34 * MOTION : 0; if (window.hapticsEnabled !== false && navigator.vibrate) { try { navigator.vibrate(14); } catch (e) {} }
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
                window.currentRank = null; // rated at the moment the third relic lands
                if (window.paintWinRank) window.paintWinRank();
                if (level === 0) {
                    window.hitsPerLevel = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                    if (interacted) {
                        bus('audio:play', { sfx: 'startOverJingle' });
                    }
                }
                hud.slots.forEach((s) => {
                    s.classList.remove('lit');
                    s.classList.remove('victory-bounce');
                });
                hud.overlay.classList.remove('show');
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
                const newToolTip = document.getElementById('new-tool-tooltip');
                const newToolTipBomb = document.getElementById('new-tool-tooltip-bomb');
                if (newToolTip) newToolTip.classList.remove('show');
                if (newToolTipBomb) newToolTipBomb.classList.remove('show');
                const unlockTip = level === 1 ? newToolTip : (level === 2 ? newToolTipBomb : null);
                if (unlockTip) {
                    setTimeout(() => {
                        unlockTip.classList.add('show');
                        // Hide it on the next tap anywhere
                        const hideTip = () => {
                            unlockTip.classList.remove('show');
                            document.removeEventListener('pointerdown', hideTip);
                        };
                        document.addEventListener('pointerdown', hideTip);
                    }, 1000);
                }
                shape = CubeCrackerFracture.shapes[lvl.shape](HALF * (lvl.sizeMul || 1));
                // Plan the buried metal cubes up front (they're built later) so the relic sampler
                // below can refuse any spot occupied by one.
                blockPlan = !lvl.blocks ? []
                    : lvl.blockLayout === 'embedded' ? planEmbeddedBlocks(lvl.blocks, lvl.blocksJut)
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
                camBase.copy(CAM_HOME).multiplyScalar(lvl.cam || 1);
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
                // Retry if any relic failed to map to a chunk (a degenerate Voronoi cell yields
                // index -1) — an unmapped relic can never be exposed, making the level unwinnable.
                let tPos, raw, treasureChunkIndex;
                if (lvl.build === 'gears') {
                    // machinery level: packed gear pieces, with a dirt clump around each relic.
                    // Pull the clumps a little toward the middle of the ball so they sit deeper
                    // in the machinery (the shape is convex and contains the origin, so scaling
                    // toward the centre can never push a clump outside it).
                    tPos = randomTreasurePositions(shape).map((p) => p.multiplyScalar(0.82));
                    ({ chunks: raw, treasureChunkIndex } = buildGearCluster(shape, chunkCount, tPos));
                } else if (lvl.build === 'chest') {
                    // hollow chest: a one-cell-thick timber shell, slabs partitioning the cavity
                    // into compartments, and a relic buried in a clump of dirt in three of them.
                    const built = buildHollowChest(shape, chunkCount, Math.random, lvl.colors);
                    raw = built.chunks;
                    treasureChunkIndex = built.treasureChunkIndex;
                    tPos = built.positions;
                } else {
                    const fixedRelicPositions = treasureLayoutPositions(lvl, shape);
                    // the fossilized trunk breaks into flat bark plates, not isotropic rubble
                    const fracOpts = lvl.break === 'petrified'
                        ? { seeds: barkSeeds(shape, chunkCount), neighbors: 120 }
                        : null;
                    for (let attempt = 0; attempt < 8; attempt++) {
                        tPos = fixedRelicPositions
                            ? fixedRelicPositions.map((p) => p.clone())
                            : randomTreasurePositions(shape);
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
                // models built by buildRelicRig(), not fracture chunks.
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
                    buildRelicRig(bx, by, bz); // the padlock + chains are real geometry, not chunks
                }

                if (lvl.bands) buildBands(lvl.bands); // solid metal rings clamped around the solid
                if (lvl.blocks) buildBlocks(blockPlan); // solid metal cubes buried inside it
                if (lvl.rods) buildRods(lvl.rods); // long metal rods crossed and stabbed through it
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

                // Reset intro progress. Keep the interface out of the way for every level
                // until its shape has finished coalescing, so each trial opens on the solid.
                introProgress = 0.0;
                document.body.classList.add('intro-hide-ui');
                treasures = tPos.map((p, i) => makeTreasure(p, GEM_COLORS[i], chunks[treasureChunkIndex[i]] || null));
                secretRing = createSecretRing(); // one hidden gold ring, sealed in its own chunk

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
                    } catch (e) {}
                }
                shake = (window.screenShakeEnabled !== false) ? 0.16 * MOTION : 0; if (window.hapticsEnabled !== false && navigator.vibrate) { try { navigator.vibrate(14); } catch (e) {} }
                kick = 0.08 * MOTION; // kick the camera back slightly on impact!
                // glassy/metal solids ring; rock and magma thud
                CubeCrackerAudio.thunk(material === 'ice' || material === 'obsidian' || material === 'clockwork' || material === 'reliquary' || material === 'star');
                const hitWorld = cubeGroup.localToWorld(swing.hitLocal.clone());
                spawnDust(hitWorld, swing.n);
                spawnCubeDust(hitWorld, swing.n);
                spawnShockwave(hitWorld, swing.n);
                flash(hitWorld);

                // Spawn vignette flash based on level material
                triggerVignetteFlash(vignetteFlashColor());

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

                // Trigger Cube Wobble (elastic squash-and-stretch rebound) - slightly reduced
                wobbleAmp = 0.035 * MOTION;
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
                // Level 1 only: once two blows have landed without turning up a relic, swap the
                // opening "drag to rotate" line for a clear objective prompt (and keep it there,
                // so it also wins over the stuck-player nudge above).
                if (level === 0 && strikes >= 2 && !revealedOnce && collectedCount === 0) {
                    setHint('searchRelicsHint');
                }
            }

            // Material-themed vignette tint for a plain hammer blow.
            const VIGNETTE_FLASH = {
                egg: '176, 240, 206', star: '206, 232, 255', ice: '144, 208, 255',
                obsidian: '206, 158, 255', molten: '255, 150, 70', clockwork: '255, 214, 138',
                petrified: '232, 176, 104', hive: '255, 208, 120', reliquary: '236, 216, 172',
            };
            function vignetteFlashColor() {
                return VIGNETTE_FLASH[material] || (level === 2 ? '232, 175, 90' : '210, 190, 160');
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
                exposeRelics();
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

            // A relic pops into view the moment its encasing chunk is gone.
            // Shared by the hammer and the explosive charge.
            function exposeRelics() {
                updateRingExposure(); // the hidden bonus ring uncovers the same way a relic does
                // the dragon egg's relics are exposed only while their piece is shrunk away, and
                // seal over again when it springs back — that lives in its own updater
                if (material === 'egg') { updateEggRelics(); return; }
                for (const t of treasures) {
                    if (!t.exposed && t.chunk && !t.chunk.alive) {
                        t.exposed = true;
                        t.revealFlash = 1.0; // trigger the glow/scale pop flare
                        CubeCrackerAudio.reveal();

                        // Radiant burst of gem sparks on expose!
                        const gemWorldPos = t.group.localToWorld(new V3(0, 0, 0));
                        spawnSparkleBurst(gemWorldPos, t.sprite.material.color, 25);
                        
                        // Zelda unearthing floating text with matching gem color
                        const gemColorStyle = t.sprite.material.color.getStyle();
                        spawnJuiceText('UNEARTHED!!!', gemWorldPos, gemColorStyle, '38px');

                        if (!revealedOnce) {
                            revealedOnce = true;
                            setHint('relicGleams');
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
                shake = (window.screenShakeEnabled !== false) ? 0.44 * MOTION : 0; if (window.hapticsEnabled !== false && navigator.vibrate) { try { navigator.vibrate(14); } catch (e) {} }
                kick = 0.24 * MOTION;
                CubeCrackerAudio.boom();

                const hitLocal = cubeGroup.worldToLocal(hitWorld.clone());
                spawnShockwave(hitWorld, nWorld);
                flash(hitWorld);
                spawnDust(hitWorld, nWorld);
                spawnDust(hitWorld, nWorld);
                spawnCubeDust(hitWorld, nWorld);
                spawnCubeDust(hitWorld, nWorld);
                spawnImpactSparks(hitWorld, 34);
                triggerVignetteFlash(material === 'ice' ? '170, 220, 255' : '255, 158, 70');
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
                    exposeRelics();
                    flushMergedUpdates();
                    currentTool = 'hammer';
                    refreshToolUI();
                    return;
                }

                // the dragon egg can't be cratered either: the blast just caves a much wider dent
                // into the shell, which then knits itself back together from the rim inward
                if (material === 'egg') {
                    eggShrink(hitLocal, bombRadius * 1.25);
                    exposeRelics();
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
                        : rig.block
                            ? rig.home.distanceTo(hitLocal)
                            : Math.abs(rig.y - hitLocal.y);
                    // Only a blast planted moderately close shears the metal outright. Further
                    // out the shockwave just buckles it (one BAND_HP hit's worth), so you still
                    // have to finish the job with the hammer.
                    const shearR = (rig.block || rig.rod) ? R * 0.62 : R * 0.55;
                    const jarR = (rig.block || rig.rod) ? R * 1.3 : R * 1.15;
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
                exposeRelics();
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

            // Bleeding lava: a fixed pool of glowing beads drawn as ONE InstancedMesh, parented to
            // the solid so the streams ride it as it's turned. A fresh wound claims a few free
            // beads; each wells up at the crater's mouth, stretches, then runs down the rock and
            // thins away, restarting for as long as its wound is still hot. Purely visual — nothing
            // is allocated at runtime, every bead is recycled in place.
            const LAVA_DROPS = 20;
            const LAVA_PER_WOUND = 5;
            function buildLavaStreams() {
                const mat = new THREE.MeshStandardMaterial({
                    color: 0xff5a16, emissive: 0xff3200, emissiveIntensity: 1.8,
                    roughness: 0.42, metalness: 0.0, transparent: true, opacity: 0.95,
                    depthWrite: false,
                });
                // very low poly: 5x3 segments -> ~30 tris per bead, faceted on purpose
                const mesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 5, 3), mat, LAVA_DROPS);
                mesh.frustumCulled = false;
                const drops = [];
                for (let i = 0; i < LAVA_DROPS; i++) {
                    drops.push({ live: false, wound: null, anchor: new V3(), t: 0, dur: 1, r: 0, run: 0 });
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
                d.dur = 0.85 + Math.random() * 0.9;
                d.r = rig.R * (0.045 + Math.random() * 0.040);
                d.run = rig.R * (0.45 + Math.random() * 0.95);
                // sit at the mouth of the crater, scattered around its lip
                d.anchor.copy(w.center).addScaledVector(w.n, rig.R * 0.10);
                d.anchor.x += (Math.random() - 0.5) * rig.R * 0.30;
                d.anchor.y += (Math.random() - 0.5) * rig.R * 0.22;
                d.anchor.z += (Math.random() - 0.5) * rig.R * 0.30;
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
                            // keep pouring while the wound is still molten, then dry up
                            if (d.wound && d.wound.heat > 0.10) startDrop(d, d.wound, rig);
                            else { d.live = false; d.wound = null; }
                        }
                    }
                    if (!d.live) { // parked: scaled to nothing, draws no pixels
                        _lavaM.compose(_lavaP.set(0, 0, 0), _lavaQ, _lavaS.set(0, 0, 0));
                        rig.mesh.setMatrixAt(i, _lavaM);
                        continue;
                    }
                    live++;
                    const u = d.t / d.dur;
                    let r, sy, fall;
                    if (u < 0.30) {          // a bead welling up out of the wound
                        const k = u / 0.30;
                        r = d.r * k;
                        sy = r * (1 + k * 0.8);
                        fall = d.r * k * 0.5;
                    } else {                 // stretching, running down the rock, thinning away
                        const k = (u - 0.30) / 0.70;
                        r = d.r * Math.max(1 - k * 0.85, 0);
                        sy = d.r * (1.8 + k * 1.8) * Math.max(1 - k * k, 0);
                        fall = d.r * 0.5 + k * k * d.run;
                    }
                    _lavaP.copy(d.anchor);
                    _lavaP.y -= fall;
                    _lavaM.compose(_lavaP, _lavaQ, _lavaS.set(r, sy, r));
                    rig.mesh.setMatrixAt(i, _lavaM);
                }
                rig.mesh.instanceMatrix.needsUpdate = true;
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
            // weighted up hard, so a break spreads along the layer it landed on and can't reach
            // into the layer underneath.
            const RING_RADIAL = 3.2;
            function ringDist(c, hitLocal) {
                const rC = Math.hypot(c.centroid.x, c.centroid.z);
                const rH = Math.hypot(hitLocal.x, hitLocal.z);
                const dr = (rC - rH) * RING_RADIAL;
                const dy = c.centroid.y - hitLocal.y;
                let da = Math.atan2(c.centroid.z, c.centroid.x) - Math.atan2(hitLocal.z, hitLocal.x);
                while (da > Math.PI) da -= Math.PI * 2;
                while (da < -Math.PI) da += Math.PI * 2;
                const dt = da * Math.max(rH, 0.001); // arc length at the strike's radius
                return Math.sqrt(dr * dr + dy * dy + dt * dt);
            }

            // Petrified wood: the fossilized bark shell crazes first (pale amber fault lines)
            // and only peels away on a second strike. Under it, the trunk comes apart one
            // concentric ring layer at a time — an inner ring is shielded until the layer
            // wrapped around it is gone, so the whole trunk unwraps from the outside in.
            function petrifiedImpact(hitWorld, R) {
                const hit = swing.hitChunk;
                if (!hit) return;
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
                const BR = R * 1.7;
                const toDetach = [];
                for (const c of chunks) {
                    if (!c.alive || c.ring !== hit.ring) continue; // stay inside this ring layer
                    const d = ringDist(c, swing.hitLocal);
                    if (d < BR && (c === hit || !c.bark || c.damaged)) toDetach.push(c);
                    else if (c.bark && !c.damaged && d < BR * 1.4) markDamaged(c, swing.hitLocal, BR * 1.4, WOOD_SPLIT);
                    else if (d < BR * 1.6) scorchChunk(c, 0.94);
                }
                for (let i = toDetach.length - 1; i >= 0; i--) detachChunk(toDetach[i], hitWorld);
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
            const EGG_HOLD_MIN = 0.75;
            const EGG_HOLD_MAX = 2.0;
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

            // The dragon egg's relics are never uncovered for good: one is only reachable while the
            // piece encasing it is gone, and it seals back over the moment that piece springs back.
            function updateEggRelics() {
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
                        setHint('relicGleams');
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
                shake = (window.screenShakeEnabled !== false) ? 0.15 * MOTION : 0; if (window.hapticsEnabled !== false && navigator.vibrate) { try { navigator.vibrate(14); } catch (e) {} }
                kick = 0.06 * MOTION;
                wobbleAmp = 0.03 * MOTION;
                wobbleTime = 0;
                chestJolt(0.55);
                spawnImpactSparks(hitWorld, 10);
                triggerVignetteFlash('215, 232, 255');
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
                shake = (window.screenShakeEnabled !== false) ? 0.22 * MOTION : 0; if (window.hapticsEnabled !== false && navigator.vibrate) { try { navigator.vibrate(14); } catch (e) {} }
                kick = 0.10 * MOTION;
                wobbleAmp = 0.035 * MOTION;
                wobbleTime = 0;
                chestJolt(0.5);
                spawnDust(hitWorld, swing.n);
                spawnShockwave(hitWorld, swing.n);
                flash(hitWorld);
                spawnImpactSparks(hitWorld, 18);
                triggerVignetteFlash('255, 224, 140');
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
                shake = (window.screenShakeEnabled !== false) ? 0.42 * MOTION : 0; if (window.hapticsEnabled !== false && navigator.vibrate) { try { navigator.vibrate(14); } catch (e) {} }
                kick = 0.22 * MOTION;
                wobbleAmp = 0.08 * MOTION;
                wobbleTime = 0;
                chestJolt(1.0);
                spawnImpactSparks(hitWorld, 30);
                triggerVignetteFlash('225, 236, 255');
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

            let _vignetteEl = null;
            function triggerVignetteFlash(colorHex) {
                if (!_vignetteEl) _vignetteEl = document.getElementById('vignette');
                if (!_vignetteEl) return;
                _vignetteEl.style.setProperty('--vignette-flash', colorHex);
                _vignetteEl.classList.remove('flash');
                requestAnimationFrame(() => {
                    if (_vignetteEl) _vignetteEl.classList.add('flash');
                });
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
            function recycleJuiceEl(el) {
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
                    el.addEventListener('animationend', () => recycleJuiceEl(el));
                    // class swaps restart the animation; a cancel must still recycle the node
                    el.addEventListener('animationcancel', () => recycleJuiceEl(el));
                    el.style.display = 'none';
                    document.body.appendChild(el);
                }
                return el;
            }
            function spawnJuiceText(text, worldPos, color = '#e8c98a', size = '32px') {
                const tempV = _scratchPos.copy(worldPos).project(camera);
                const host = canvasHost.getBoundingClientRect();
                const x = (tempV.x * 0.5 + 0.5) * host.width + host.left;
                let y = (-tempV.y * 0.5 + 0.5) * host.height + host.top;

                const el = _getJuiceEl();
                el.style.display = '';
                if (text === 'UNEARTHED!!!') {
                    y -= 30;
                    el.className = 'juice-text unearthed-text';
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
                el.style.fontSize = size;
                
                const rotStart = (Math.random() * 2 - 1) * 20;
                const rotMid = rotStart * 0.4;
                const rotEnd = rotStart * 1.2;
                el.style.setProperty('--rot-start', `${rotStart}deg`);
                el.style.setProperty('--rot-mid', `${rotMid}deg`);
                el.style.setProperty('--rot-end', `${rotEnd}deg`);

                // restart animation by removing then re-adding the class
                el.classList.remove('juice-text', 'unearthed-text');
                void el.offsetWidth; // force reflow
                if (text === 'UNEARTHED!!!') {
                    el.classList.add('juice-text', 'unearthed-text');
                } else {
                    el.classList.add('juice-text');
                }
                setTimeout(() => recycleJuiceEl(el), 1600);
            }

            const _dirtBaseColor = new THREE.Color();
            const _dirtColorVar = new THREE.Color();
            const _dirtColorLerp = new THREE.Color(0x4a3525);
            const _dirtSpawnPos = new V3();
            function spawnHugeDirtCubes() {
                // mobile: fewer clouds, each a touch larger to compensate; weak GPUs get the leanest set
                const count = (tier.weak ? 15 : tier.mobile ? 20 : 30) + Math.floor(Math.random() * 10);
                const sizeBoost = tier.mobile ? 1.12 : 1;
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
                    const r = 0.4 + Math.random() * 0.8;
                    _dirtSpawnPos.set(
                        Math.sin(phi) * Math.cos(theta) * r,
                        Math.sin(phi) * Math.sin(theta) * r,
                        Math.cos(phi) * r
                    );
                    
                    item.mesh.position.copy(_dirtSpawnPos);
                    
                    const s = (1.8 + Math.random() * 2.2) * sizeBoost;
                    item.mesh.scale.set(s, s, s);
                    item.startScale = s;
                    
                    item.vel.copy(_dirtSpawnPos).normalize().multiplyScalar(1.2 + Math.random() * 2.3);
                    item.vel.y += 0.3 + Math.random() * 0.9;
                    
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
                const r = el.getBoundingClientRect();
                const host = canvasHost.getBoundingClientRect();
                const ndcX = ((r.left + r.width / 2 - host.left) / host.width) * 2 - 1;
                const ndcY = -((r.top + r.height / 2 - host.top) / host.height) * 2 + 1;
                const dir = new V3(ndcX, ndcY, 0.5).unproject(camera).sub(camera.position).normalize();
                return camera.position.clone().addScaledVector(dir, 1.6);
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

                    c.sparkT = (c.sparkT || 0) + scaledDt;
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
                        if (collectedCount === 1) setHint('relicsRemain2');
                        if (collectedCount === 2) setHint('relicsRemain1');
                        if (collectedCount === 3) completeLevel();
                    }
                }
            }

            // ---------- level complete ----------
            // Fires the moment the last relic lands in its slot: saves the result, plays the
            // slot victory bounce, then shows the win card (or the championship scoreboard on
            // the final level). Kept out of updateCollecting() so the flight loop stays readable.
            function completeLevel() {
                gameOver = true;
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
                    (async () => {
                        try {
                            localStorage.setItem('cube_cracker_game_state', JSON.stringify({ bestScores: window.bestScores, ringsFound: window.ringsFound }));
                        } catch (e) {
                            console.warn('Failed to save best score', e);
                        }
                    })();
                    if (window.renderLevelList) window.renderLevelList();
                }
                if (window.applyTranslations) window.applyTranslations();

                // Exaggerated victory bounce sequential animation!
                setTimeout(() => {
                    hud.slots[0].classList.add('victory-bounce');
                    if (window.CubeCrackerAudio && window.CubeCrackerAudio.chime) window.CubeCrackerAudio.chime(0);
                }, 50);

                setTimeout(() => {
                    hud.slots[1].classList.add('victory-bounce');
                    if (window.CubeCrackerAudio && window.CubeCrackerAudio.chime) window.CubeCrackerAudio.chime(1);
                }, 200);

                setTimeout(() => {
                    hud.slots[2].classList.add('victory-bounce');
                    if (window.CubeCrackerAudio && window.CubeCrackerAudio.chime) window.CubeCrackerAudio.chime(2);
                }, 350);

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
                    bus('audio:play', { sfx: 'win' });
                }, 650);
            }

            // The championship end card: counts the total hits up on a timer, then paints the
            // per-level scoreboard beneath it.
            function buildChampionshipScoreboard() {
                const totalHits = window.hitsPerLevel.reduce((sum, h) => sum + h, 0);
                const totalHitsCount = document.getElementById('totalHitsCount');

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
                    }
                }

                const levelStatsContainer = document.getElementById('levelStats');
                if (levelStatsContainer) {
                    levelStatsContainer.innerHTML = '';
                    LEVELS.forEach((lvl, idx) => {
                        const lvlNameKey = window.LEVEL_NAME_KEYS[idx] || 'stoneCube';
                        const localizedName = window._t ? window._t(lvlNameKey) : lvl.name;
                        const hitsFormatted = window._t('levelHitsLabel', { hits: window.hitsPerLevel[idx] });

                        const row = document.createElement('div');
                        row.style.display = 'flex';
                        row.style.justifyContent = 'space-between';
                        row.style.fontSize = '24px';
                        row.style.color = 'var(--dim)';
                        row.innerHTML = `<span>${localizedName}</span><span style="font-family: monospace; color: var(--gold);">${hitsFormatted}${window.rankRowMarkup(idx, window.hitsPerLevel[idx])}</span>`;
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
                if (e.pointerType === 'mouse') {
                    try {
                        if (capture) {
                            el.setPointerCapture(e.pointerId);
                        } else {
                            el.releasePointerCapture(e.pointerId);
                        }
                    } catch (err) { }
                }
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
                    introProgress += dt / introDuration; // raw dt!
                    let finished = false;
                    if (introProgress >= 1.0) {
                        introProgress = 1.0;
                        finished = true;
                    }
                    
                    const t = quadEaseIn(introProgress);
                    const maxSeparation = 15.0 * (LEVELS[level].sizeMul || 1);
                    // Chunks share one buffer now, so the fly-in translates each chunk's slice
                    // of it rather than moving a mesh. Written against the pristine base copy
                    // so the last frame lands exactly on the assembled solid.
                    const arr = mergedGeo.attributes.position.array;
                    const sep = maxSeparation * (1.0 - t);
                    for (const c of chunks) {
                        if (!c.alive) continue;
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
                        setRelicRigVisible(true); // the lock and chains clamp on
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
                    wobbleAmp *= Math.exp(-scaledDt * 7.5); // scaledDt!
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
                if (gemPings.length) updateGemPings(dt); // keep lens pings glued to their relics
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
                        CubeCrackerAudio.thunk(false);
                        if (window.screenShakeEnabled !== false) shake = Math.max(shake, 0.1 * MOTION); if (window.hapticsEnabled !== false && navigator.vibrate) { try { navigator.vibrate(14); } catch (e) {} }
                        exposeRelics();
                        flushMergedUpdates();
                    }
                }

                // hive: squashed wax springing back to full size.
                // dragon egg: caved-in shell knitting itself back together — as each piece regrows it
                // seals over whatever relic it was encasing, so the relics are re-checked here too.
                if (hiveSquash.length) {
                    updateHiveSquash(scaledDt);
                    if (material === 'egg') updateEggRelics();
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
                // pillar: a struck metal band shuddering on the stone, its flare dying back down
                for (const rig of bandRigs) {
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

                // relics - scaledDt!
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
                        // Relics glow at 65% strength when not yet unearthed
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

            // Handle the tap directly on pointerup rather than waiting for the browser to
            // synthesize a 'click' afterward — touch-to-click synthesis is the flaky link on
            // some mobile browsers/webviews (especially under touch-action:none ancestors),
            // which is what made this button unresponsive to taps. preventDefault() on
            // pointerup stops the trailing synthetic click so the handler only runs once;
            // 'click' is kept too so keyboard (Enter/Space) activation still works, since
            // that path fires click directly with no pointer events at all.
            let advancing = false;
            function nextTrial(e) {
                if (e) e.preventDefault();
                // pointerup + click both fire on mouse (preventDefault on pointerup does NOT
                // cancel the trailing synthetic click), so guard against advancing twice.
                if (advancing) return;
                advancing = true;
                level = (level + 1) % LEVELS.length;
                build();
                requestAnimationFrame(() => { advancing = false; });
            }
            hud.again.addEventListener('pointerup', nextTrial);
            hud.again.addEventListener('click', nextTrial);

            // Level select bridge (called by the LEVELS button overlay)
            window.CubeCrackerGoToLevel = (i) => {
                if (typeof i !== 'number' || i < 0 || i >= LEVELS.length) return;
                level = i;
                build();
            };
            const restartGameBtn = document.getElementById('restartGame');
            if (restartGameBtn) {
                restartGameBtn.addEventListener('pointerup', nextTrial);
                restartGameBtn.addEventListener('click', nextTrial);
            }

            // Tweaks bridge
            if (window._cubeTweaks) window.removeEventListener('cube-tweaks', window._cubeTweaks);
            window._cubeTweaks = (e) => {
                const t = e.detail || {};
                if (t.hammerPower) {
                    cfg.hitRadius = { light: 0.4, standard: 0.55, heavy: 0.74 }[t.hammerPower] || 0.55;
                }
                if (t.fractureDetail && t.fractureDetail !== cfg.chunkCount) {
                    cfg.chunkCount = t.fractureDetail;
                    build();
                }
            };
            window.addEventListener('cube-tweaks', window._cubeTweaks);

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
            
            if (window._cubeVisChange) {
                document.removeEventListener('visibilitychange', window._cubeVisChange);
            }
            window._cubeVisChange = () => {
                if (document.hidden) {
                    if (window.CubeCrackerAudio && window.CubeCrackerAudio.pauseForVisibility) {
                        window.CubeCrackerAudio.pauseForVisibility();
                    }
                    stopLoop();
                } else {
                    if (window.CubeCrackerAudio && window.CubeCrackerAudio.resumeFromVisibility) {
                        window.CubeCrackerAudio.resumeFromVisibility();
                    }
                    startLoop();
                }
            };
            document.addEventListener('visibilitychange', window._cubeVisChange);

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

            // debug hook (harmless in production)
            window.CUBE_DEBUG = {
                tap: handleTap,
                tier: () => gpuTier(),
                alive: () => chunks.filter((c) => c.alive).length,
                state: () => ({ swing: !!swing, strikes, pointerDown, interacted }),
            };
        })();

    

        // Gems in the cube - Tweaks panel (vanilla DOM; no React/Babel).
        // Floating dev panel that bridges into the Three.js game via a `cube-tweaks`
        // CustomEvent. Hidden until the host activates edit mode. Persists edits back to
        // the host by posting `__edit_mode_set_keys` (the host rewrites the EDITMODE
        // block below on disk).
        (function () {
            const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
                "hammerPower": "standard",
                "fractureDetail": 150
            }/*EDITMODE-END*/;

            const HAMMER_OPTIONS = ['light', 'standard', 'heavy'];
            const FRACTURE = { min: 80, max: 260, step: 10 };

            const STYLE = `
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:420px;
    max-height:calc(100vh - 32px);display:flex;flex-direction:column;
    transform:scale(var(--dc-inv-zoom,1));transform-origin:bottom right;
    background:rgba(250,249,247,.78);color:#29261b;
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
    font:24px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;
    padding:10px 8px 10px 14px;cursor:move;user-select:none}
  .twk-hd b{font-size:24px;font-weight:600;letter-spacing:.01em}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:44px;height:44px;border-radius:6px;cursor:default;font-size:24px;line-height:1}
  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
  .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:14px;
    overflow-y:auto;overflow-x:hidden;min-height:0}
  .twk-row{display:flex;flex-direction:column;gap:8px}
  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;
    color:rgba(41,38,27,.72)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-val{color:rgba(41,38,27,.5);font-variant-numeric:tabular-nums;font-size:24px}
  .twk-sect{font-size:24px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:10px 0 0}
  .twk-sect:first-child{padding-top:0}
  .twk-slider{appearance:none;-webkit-appearance:none;width:100%;height:8px;margin:6px 0;
    border-radius:999px;background:rgba(0,0,0,.12);outline:none}
  .twk-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;
    width:24px;height:24px;border-radius:50%;background:#fff;
    border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}
  .twk-slider::-moz-range-thumb{width:24px;height:24px;border-radius:50%;
    background:#fff;border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}
  .twk-seg{position:relative;display:flex;padding:4px;border-radius:8px;
    background:rgba(0,0,0,.06);user-select:none}
  .twk-seg-thumb{position:absolute;top:4px;bottom:4px;border-radius:6px;
    background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);
    transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}
  .twk-seg.dragging .twk-seg-thumb{transition:none}
  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;
    background:transparent;color:inherit;font:inherit;font-weight:500;min-height:44px;
    border-radius:6px;cursor:default;padding:8px 12px;line-height:1.2;overflow-wrap:anywhere}
  `;

            const state = Object.assign({}, TWEAK_DEFAULTS);

            // ---- persistence + game bridge ----
            function persist(edits) {
                try { window.parent.postMessage({ type: '__edit_mode_set_keys', edits }, '*'); } catch (e) { }
                window.dispatchEvent(new CustomEvent('tweakchange', { detail: edits }));
            }
            function emit() {
                window.dispatchEvent(new CustomEvent('cube-tweaks', { detail: Object.assign({}, state) }));
            }
            function setTweak(key, val) {
                if (state[key] === val) return;
                state[key] = val;
                persist({ [key]: val });
                emit();
                sync();
            }

            // ---- build DOM ----
            const host = document.getElementById('tweaks-root');
            const styleEl = document.createElement('style');
            styleEl.textContent = STYLE;

            const panel = document.createElement('div');
            panel.className = 'twk-panel';
            panel.style.display = 'none';
            panel.innerHTML = `
    <div class="twk-hd"><b>Tweaks</b><button class="twk-x" aria-label="Close tweaks">✕</button></div>
    <div class="twk-body">
      <div class="twk-sect">Hammer</div>
      <div class="twk-row">
        <div class="twk-lbl"><span>Power</span></div>
        <div class="twk-seg" role="radiogroup" data-role="hammer">
          <div class="twk-seg-thumb"></div>
          ${HAMMER_OPTIONS.map((o) => `<button type="button" role="radio" data-val="${o}">${o}</button>`).join('')}
        </div>
      </div>
      <div class="twk-sect">Stone</div>
      <div class="twk-row">
        <div class="twk-lbl"><span>Fracture detail</span><span class="twk-val" data-role="frac-val"></span></div>
        <input type="range" class="twk-slider" data-role="frac"
               min="${FRACTURE.min}" max="${FRACTURE.max}" step="${FRACTURE.step}">
      </div>
    </div>`;

            host.appendChild(styleEl);
            host.appendChild(panel);

            const seg = panel.querySelector('[data-role="hammer"]');
            const segThumb = seg.querySelector('.twk-seg-thumb');
            const segButtons = [...seg.querySelectorAll('button')];
            const fracInput = panel.querySelector('[data-role="frac"]');
            const fracVal = panel.querySelector('[data-role="frac-val"]');

            // reflect current state into the controls
            function sync() {
                const n = HAMMER_OPTIONS.length;
                const idx = Math.max(0, HAMMER_OPTIONS.indexOf(state.hammerPower));
                segThumb.style.left = `calc(4px + ${idx} * (100% - 8px) / ${n})`;
                segThumb.style.width = `calc((100% - 8px) / ${n})`;
                segButtons.forEach((b) => b.setAttribute('aria-checked', b.dataset.val === state.hammerPower ? 'true' : 'false'));
                fracInput.value = state.fractureDetail;
                fracVal.textContent = state.fractureDetail;
            }

            // ---- control interaction ----
            const segAt = (clientX) => {
                const r = seg.getBoundingClientRect();
                const inner = r.width - 4;
                const i = Math.floor(((clientX - r.left - 2) / inner) * HAMMER_OPTIONS.length);
                return HAMMER_OPTIONS[Math.max(0, Math.min(HAMMER_OPTIONS.length - 1, i))];
            };
            seg.addEventListener('pointerdown', (e) => {
                seg.classList.add('dragging');
                setTweak('hammerPower', segAt(e.clientX));
                const move = (ev) => setTweak('hammerPower', segAt(ev.clientX));
                const up = () => {
                    seg.classList.remove('dragging');
                    window.removeEventListener('pointermove', move);
                    window.removeEventListener('pointerup', up);
                };
                window.addEventListener('pointermove', move);
                window.addEventListener('pointerup', up);
            });

            fracInput.addEventListener('input', (e) => setTweak('fractureDetail', Number(e.target.value)));

            // ---- draggable panel (clamped to viewport) ----
            const PAD = 16;
            const offset = { x: 16, y: 16 };
            function clamp() {
                const w = panel.offsetWidth, h = panel.offsetHeight;
                offset.x = Math.min(Math.max(PAD, window.innerWidth - w - PAD), Math.max(PAD, offset.x));
                offset.y = Math.min(Math.max(PAD, window.innerHeight - h - PAD), Math.max(PAD, offset.y));
                panel.style.right = offset.x + 'px';
                panel.style.bottom = offset.y + 'px';
            }
            panel.querySelector('.twk-hd').addEventListener('mousedown', (e) => {
                if (e.target.classList.contains('twk-x')) return;
                const r = panel.getBoundingClientRect();
                const sx = e.clientX, sy = e.clientY;
                const startRight = window.innerWidth - r.right;
                const startBottom = window.innerHeight - r.bottom;
                const move = (ev) => {
                    offset.x = startRight - (ev.clientX - sx);
                    offset.y = startBottom - (ev.clientY - sy);
                    clamp();
                };
                const up = () => {
                    window.removeEventListener('mousemove', move);
                    window.removeEventListener('mouseup', up);
                };
                window.addEventListener('mousemove', move);
                window.addEventListener('mouseup', up);
            });

            // ---- host edit-mode protocol ----
            function open(show) {
                panel.style.display = show ? 'flex' : 'none';
                if (show) { sync(); clamp(); }
            }
            panel.querySelector('.twk-x').addEventListener('click', () => {
                open(false);
                try { window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*'); } catch (e) { }
            });
            if (window._twkResize) window.removeEventListener('resize', window._twkResize);
            window._twkResize = () => { if (panel.style.display !== 'none') clamp(); };
            window.addEventListener('resize', window._twkResize);
            
            if (window._twkMessage) window.removeEventListener('message', window._twkMessage);
            window._twkMessage = (e) => {
                const t = e && e.data && e.data.type;
                if (t === '__activate_edit_mode') open(true);
                else if (t === '__deactivate_edit_mode') open(false);
            };
            window.addEventListener('message', window._twkMessage);

            sync();
            emit(); // push initial values to the game
            try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch (e) { }
        })();

    
