# YouTube Playables SDK — AI Integration Specification

> **Purpose:** Developer-first technical specification for integrating HTML5 games with the YouTube Playables environment.
>
> **Audience:** AI coding agents and developers implementing or modifying HTML5 games for YouTube Playables.
>
> **Priority:** Requirements marked **MUST**, **MUST NOT**, or **STRICT CONSTRAINT** are platform/certification requirements. Requirements marked **SHOULD** or **SHOULD NOT** are strong recommendations.
>
> **Critical AI rule:** Do not invent substitute implementations for YouTube Playables APIs or platform requirements. When a Playables API or rule is specified, use that API or rule rather than replacing it with an equivalent browser API.
>
> **Important:** YouTube Playables requirements can change. Verify the current official documentation and Playables Test Suite before certification or submission.

---

# 1. Core Integration

## 1.1 SDK Loading

The YouTube Playables SDK **MUST** be loaded in `index.html` before any game scripts execute.

Example:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="https://www.youtube.com/game_api/v1"></script>
</head>
<body>
  <script src="game.js"></script>
</body>
</html>
```

### Rules

* The Playables SDK script **MUST** appear before game scripts.
* Game initialization code **MUST NOT** execute before the SDK has loaded.
* Local browser testing **SHOULD** remain possible without requiring the Playables environment.

---

## 1.2 Detecting the Playables Environment

Always verify `ytgame` and `IN_PLAYABLES_ENV` before executing Playables-specific logic.

```typescript
const inPlayablesEnv =
  typeof ytgame !== 'undefined' &&
  Boolean(ytgame.IN_PLAYABLES_ENV);

if (inPlayablesEnv) {
  // Playables-specific behavior.
} else {
  // Local browser testing / fallback behavior.
}
```

### Guarding Individual SDK Calls

Guard SDK calls behind the Playables environment check.

```typescript
function saveProgress(data: string): void {
  if (inPlayablesEnv) {
    ytgame.game.saveData(data);
  }
}

function submitScore(score: number): void {
  if (inPlayablesEnv) {
    ytgame.engagement.sendScore({
      value: score
    });
  }
}
```

Prefer a centralized Playables integration layer (see §22.4) so that the rest of the game does not directly call `ytgame` wherever practical.

---

# 2. File Paths and Bundle Structure

## 2.1 Relative Paths

All scripts, assets, and media **MUST** use relative paths.

Correct:

```text
./assets/sprite.png
./js/game.js
./audio/music.mp3
```

Incorrect:

```text
/assets/sprite.png
/assets/music/music.mp3
```

Absolute root paths can fail inside YouTube's sandboxed iframe environment.

---

## 2.2 File Names

File names **SHOULD** use simple supported characters.

Prefer:

```text
a-z
A-Z
0-9
_
-
.
```

Avoid spaces and unusual special characters in file names.

---

## 2.3 Maximum File Count

The complete game bundle **MUST NOT** contain more than:

```text
8,000 files
```

Avoid unnecessarily splitting the game into thousands of tiny files.

---

# 3. Game Readiness and Lifecycle

## 3.1 Initialization and Readiness Flow

YouTube maintains its loading UI until `gameReady()` is called.

The conceptual flow is:

```text
Render first visible frame
        ↓
Call firstFrameReady()
        ↓
Continue loading required game content
        ↓
Make game fully interactive
        ↓
Call gameReady()
```

---

## 3.2 `firstFrameReady()`

Call:

```typescript
ytgame.game.firstFrameReady();
```

as soon as the first visible frame is ready.

This can be a splash/loading screen or the first rendered game frame.

Example:

```typescript
function showInitialScreen(): void {
  renderLoadingScreen();

  ytgame.game.firstFrameReady();
}
```

`firstFrameReady()` **MUST** occur before `gameReady()`.

---

## 3.3 `gameReady()`

Call:

```typescript
ytgame.game.gameReady();
```

**ONLY** when the game is fully loaded and genuinely interactable.

Example:

```typescript
function onGameFullyLoadedAndInteractive(): void {
  hideLoadingScreen();
  enableGameplayInput();

  ytgame.game.gameReady();
}
```

---

# 4. Pause and Resume

## 4.1 Required APIs

Use:

```typescript
ytgame.system.onPause(...)
ytgame.system.onResume(...)
```

### STRICT CONSTRAINT

Do **NOT** use Web Page Visibility APIs for Playables lifecycle handling.

Do not use:

```typescript
document.hidden
document.visibilityState
document.addEventListener('visibilitychange', ...)
```

Playables pause/resume behavior **MUST** be controlled through the Playables SDK callbacks.

These APIs **MUST NOT** appear in the shipped bundle at all — not merely go unused at runtime. Certification detects them with a static text scan, so a call kept behind an environment check still fails. See §22.7.

---

## 4.2 `onPause()`

When `onPause()` fires, the game **MUST** stop all game execution that should not continue while paused.

This includes:

* Game simulation/update loops
* Rendering loops
* Timers
* Animations
* Audio playback
* Player interactions
* Ongoing gameplay actions
* Gameplay-related network activity

Example:

```typescript
const unsetOnPause = ytgame.system.onPause(() => {
  pauseGameEngine();
  pauseGameAudio();
  disableGameplayInput();

  // Best-effort save of important current state.
  void saveGameState();
});
```

The game **SHOULD** save important current state during the pause event.

Treat the pause-time save as a **best-effort final flush**. Do not assume that the game will necessarily resume after the pause callback.

---

## 4.3 `onResume()`

Resume execution when `onResume()` fires.

```typescript
const unsetOnResume = ytgame.system.onResume(() => {
  resumeGameAudio();
  enableGameplayInput();
  resumeGameEngine();
});
```

The game **SHOULD** resume without resetting or losing gameplay state.

---

## 4.4 Callback Cleanup

`onPause()`, `onResume()`, and `onAudioEnabledChange()` return functions that unregister their callbacks.

Store those functions:

```typescript
const unsetOnPause =
  ytgame.system.onPause(handlePause);

const unsetOnResume =
  ytgame.system.onResume(handleResume);

const unsetOnAudioChange =
  ytgame.system.onAudioEnabledChange(handleAudioChange);
```

When tearing down or reinitializing the integration:

```typescript
unsetOnPause();
unsetOnResume();
unsetOnAudioChange();
```

---

# 5. Audio

## 5.1 YouTube Audio State

The game **MUST** respect YouTube's audio state and system/device volume.

Use:

```typescript
ytgame.system.isAudioEnabled();
```

and:

```typescript
ytgame.system.onAudioEnabledChange(...);
```

---

## 5.2 Master Audio Control

### STRICT CONSTRAINT

Do **NOT** create an in-game master mute/unmute control that competes with YouTube's platform-level audio control.

Granular controls are acceptable, including:

* Music volume
* Sound-effect volume
* Voice volume

Example:

```typescript
setMusicVolume(0.5);
setSfxVolume(0.8);
```

These controls **MUST NOT** override YouTube's audio state.

When YouTube audio is disabled, the game **MUST NOT** output audio.

---

## 5.3 Initial Audio State

Read the initial YouTube audio state:

```typescript
const initialAudioState =
  ytgame.system.isAudioEnabled();

setAudioEnabled(initialAudioState);
```

---

## 5.4 Runtime Audio Changes

React to YouTube audio state changes:

```typescript
ytgame.system.onAudioEnabledChange(
  (isAudioEnabled: boolean) => {
    setAudioEnabled(isAudioEnabled);
  }
);
```

The game **MUST** immediately respect the new state.

---

## 5.5 Web Audio Autoplay Policy

Browsers may start an `AudioContext` in a suspended state.

Do not assume:

```text
YouTube audio enabled
=
AudioContext already running
```

Check the actual browser audio state.

```typescript
let audioCtx: AudioContext | null = null;

async function resumeAudioContext(): Promise<void> {
  if (
    audioCtx &&
    audioCtx.state === 'suspended'
  ) {
    await audioCtx.resume();
  }
}
```

Also attempt to resume the audio context during the first appropriate player interaction:

```typescript
function onFirstInteraction(): void {
  void resumeAudioContext();
}
```

The browser-level Web Audio state and the YouTube audio state are separate constraints. Both **MUST** be respected.

---

# 6. Data Persistence and Cloud Saves

## 6.1 Required Save APIs

Game save data **MUST** use:

```typescript
ytgame.game.loadData()
ytgame.game.saveData()
```

Do **NOT** use the following as the primary Playables save mechanism:

* `localStorage`
* `sessionStorage`
* `IndexedDB`
* Cookies
* Custom save servers
* Third-party cloud-save services

Do **NOT** replace Playables cloud saves with another persistence system.

---

## 6.2 Save Initialization Ordering

The initial `loadData()` operation **MUST** complete before issuing the first `saveData()` operation.

Incorrect:

```typescript
void ytgame.game.saveData(data);
void ytgame.game.loadData();
```

Correct:

```typescript
const rawData =
  await ytgame.game.loadData();

await ytgame.game.saveData(data);
```

This prevents a new save from overwriting previously stored progress before the existing progress has been loaded. If `saveData()` is called before `loadData()` completes, the request will be rejected.

---

## 6.3 Save Payload Size

Normal save data **MUST** be less than:

```text
3 MiB
```

---

## 6.4 Pause-Time / Final-Flush Save

Pause-time or final-flush save data **MUST** remain below:

```text
64 KiB
```

Treat this as a **best-effort final flush**.

Do **NOT** rely exclusively on the pause callback for normal progression saves.

---

## 6.5 Save Data Format

Save data **MUST** be represented as a valid UTF-16 string.

JSON is an appropriate serialization format.

Example:

```typescript
async function persistProgress(
  saveState: GameSaveState
): Promise<void> {
  const serialized =
    JSON.stringify(saveState);

  if (
    typeof String.prototype.isWellFormed === 'function' &&
    !serialized.isWellFormed()
  ) {
    ytgame.health.logError();
    return;
  }

  try {
    await ytgame.game.saveData(serialized);
  } catch (error) {
    ytgame.health.logError();
  }
}
```

---

## 6.6 Save Initialization

Example:

```typescript
async function initializeSaveData(): Promise<GameSaveState> {
  try {
    const rawData =
      await ytgame.game.loadData();

    if (!rawData || rawData === '') {
      return getDefaultSaveState();
    }

    const parsed =
      JSON.parse(rawData);

    return migrateSaveData(parsed);
  } catch (error) {
    ytgame.health.logError();

    return getDefaultSaveState();
  }
}
```

An empty save string **SHOULD** be treated as no existing save.

A corrupt or unparseable save **MUST NOT** crash the game.

When appropriate:

1. Fall back to a fresh/default state.
2. Notify the player if useful.
3. Report the failure with `ytgame.health.logError()`.

---

## 6.7 Saving Material Progress

The game **MUST** save at material progress points where a player would reasonably expect their progress to have been saved.

Examples:

* Completing a level
* Advancing to a new chapter
* Unlocking major progression
* Completing a significant milestone
* Making a permanent progression choice

Example:

```typescript
async function onLevelCompleted(
  level: number
): Promise<void> {
  gameState.completedLevel = level;

  await persistProgress(gameState);
}
```

Do not rely exclusively on pause or exit saves.

---

## 6.8 Save Version Compatibility

The game **MUST** be able to load save data created by previous versions without crashing or corrupting player progress.

Use explicit save versioning:

```typescript
interface GameSaveState {
  saveVersion: number;
  coins: number;
  unlockedLevels: number[];
}
```

When loading:

```typescript
function migrateSaveData(
  data: unknown
): GameSaveState {
  // Detect old save versions.
  // Migrate safely to the current schema.
  // Preserve existing progress whenever reasonably possible.

  return migrateToCurrentVersion(data);
}
```

A new game version **SHOULD** preserve existing player progress whenever reasonably possible.

---

# 7. Localization

## 7.1 Language API

### STRICT CONSTRAINT

Do **NOT** use:

```typescript
navigator.language
navigator.languages
```

Use:

```typescript
ytgame.system.getLanguage()
```

Example:

```typescript
async function setupLocalization(): Promise<void> {
  try {
    const localeTag =
      await ytgame.system.getLanguage();

    applyLanguagePack(localeTag);
  } catch (error) {
    applyLanguagePack('en-US');
  }
}
```

The returned value is a BCP-47 language tag such as:

```text
en-US
es-419
```

As with §4.1, `navigator.language` / `navigator.languages` **MUST NOT** appear in the shipped bundle at all, including in local-development fallbacks that never execute inside Playables. See §22.7.

---

## 7.2 English Support

The game **MUST** support English.

Do not assume that English can be omitted because other languages are supported.

---

## 7.3 Language Preference

Do **NOT** store the player's locale preference in cloud save data.

Use the Playables language API as the source of truth.

---

# 8. Input Requirements

## 8.1 Touch Input

The game **MUST** support touch input for all important interactions intended to be interactive.

Do not make essential gameplay dependent on:

```text
hover
right-click
keyboard-only input
mouse movement
```

unless an equivalent touch interaction exists.

Example:

```typescript
button.addEventListener(
  'pointerup',
  handleButtonPress
);
```

Prefer pointer-based interaction systems that correctly support mouse and touch when appropriate.

---

## 8.2 Mouse Input

The game **MUST** support mouse input for intended interactions on devices where mouse input is available.

Essential controls **SHOULD NOT** be touch-only.

---

## 8.3 Keyboard Input

Keyboard input **SHOULD** be supported where appropriate, especially for:

* Directional navigation
* Text input
* Accessibility
* Modal interaction

If the game uses modals, `Escape` **SHOULD** close the modal where appropriate.

---

## 8.4 Escape Key Restriction

Do **NOT** call `preventDefault()` on an `Escape` key-down event.

Incorrect:

```typescript
window.addEventListener(
  'keydown',
  (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
    }
  }
);
```

Correct:

```typescript
window.addEventListener(
  'keydown',
  (event) => {
    if (event.key === 'Escape') {
      closeModal();
    }
  }
);
```

---

## 8.5 Haptic Feedback

If haptic feedback is implemented, the game **MUST** provide an on/off control for haptic feedback.

Do not make haptics impossible for the player to disable.

---

## 8.6 Input Reliability

The game **MUST NOT** unintentionally:

* Delay input
* Ignore input
* Drop input
* Leave UI controls stuck
* Produce unexpected UI behavior
* Throw unhandled exceptions during interaction

All important UI components **SHOULD** be tested in their relevant states.

---

# 9. Responsive Design, Viewports, and Resizing

## 9.1 Supported Aspect Ratios

The game **MUST** adapt to a wide range of viewport shapes.

Design and test across ratios including:

```text
9:32
9:21
9:16
3:4
1:1
4:3
16:9
21:9
32:9
```

Do not design around a single fixed aspect ratio.

---

## 9.2 Viewport Usage

The game **SHOULD** fill the available viewport.

If the game cannot fill the viewport without compromising its intended presentation, it **MUST** remain correctly centered and use appropriate letterboxing or pillarboxing.

Do not stretch the game non-uniformly.

Correct:

```text
16:9 game
    ↓
preserve aspect ratio
    ↓
center inside available viewport
    ↓
letterbox/pillarbox unused space
```

Incorrect:

```text
16:9 game
    ↓
stretch into 9:16
```

---

## 9.3 State Preservation During Resize

The game **MUST** preserve its current game state and player progress when the window or viewport is resized.

Resizing **MUST NOT**:

* Restart the game
* Reset the current level
* Reset player position
* Lose unsaved progress
* Reload the application unnecessarily

Example:

```typescript
function resizeGame(
  width: number,
  height: number
): void {
  updateViewport(width, height);
  updateUILayout(width, height);

  // Do not recreate game state.
  // Do not reload the page.
  // Do not restart the level.
}
```

Unless a very short technical recovery is unavoidable, resizing **SHOULD NOT** interrupt gameplay.

---

# 10. Orientation

The game **MUST NOT** force device orientation locks.

Do not force:

```text
portrait-only
landscape-only
```

through device orientation APIs.

Instead, adapt the game's layout to the available viewport.

Example:

```typescript
function updateLayout(
  width: number,
  height: number
): void {
  const aspectRatio =
    width / height;

  if (aspectRatio < 1) {
    configurePortraitLayout();
  } else {
    configureLandscapeLayout();
  }
}
```

The actual game state **MUST** remain intact when the viewport changes.

---

# 11. SDK Error Handling

## 11.1 `SdkError` and `SdkErrorType`

APIs in the Playables SDK can throw:

```typescript
ytgame.SdkError
```

`SdkError` extends the standard `Error` class and carries an additional `errorType` field.

Possible error types include:

```text
UNKNOWN
API_UNAVAILABLE
INVALID_PARAMS
SIZE_LIMIT_EXCEEDED
```

---

## 11.2 Error Types

### `UNKNOWN`

The error type is unknown.

Handle gracefully and log when appropriate.

### `API_UNAVAILABLE`

The API is temporarily unavailable.

For critical flows, allow the player to retry later.

### `INVALID_PARAMS`

The API was called with invalid parameters.

This generally indicates an integration/developer error.

### `SIZE_LIMIT_EXCEEDED`

The API was called with parameters exceeding an allowed size limit.

Reduce the payload or request size.

---

## 11.3 Handling `SdkError`

Do not treat every SDK failure identically.

Example:

```typescript
async function loadSaveData(): Promise<string | null> {
  try {
    return await ytgame.game.loadData();
  } catch (error) {
    if (
      error instanceof ytgame.SdkError &&
      error.errorType ===
        ytgame.SdkErrorType.API_UNAVAILABLE
    ) {
      // Temporarily unavailable.
      // Allow retry where appropriate.
    } else {
      ytgame.health.logError();
    }

    return null;
  }
}
```

The caught value **SHOULD** be handled defensively because a failure may not always have the expected error shape.

---

# 12. Health Logging

Use Playables health logging for relevant errors and warnings.

```typescript
ytgame.health.logError();
ytgame.health.logWarning();
```

Example:

```typescript
try {
  await performSdkOperation();
} catch (error) {
  ytgame.health.logError();
}
```

Health logging is best-effort and rate-limited.

Do not rely on health logging as the game's primary error-handling mechanism.

---

# 13. High Scores and Engagement

## 13.1 Score Requirements

A submitted score:

* **MUST** be an integer.
* **MUST** be less than or equal to `Number.MAX_SAFE_INTEGER`.
* **MUST** match the player's top score stored in save data when submitting a high score.

The score represents one dimension of progress. If the game tracks multiple dimensions, it **MUST** pick one and remain consistent. YouTube sorts scores and displays the highest, so any in-game high-score UI **SHOULD** align with the value sent via `sendScore()`.

Example:

```typescript
async function submitHighScore(
  newScore: number
): Promise<void> {
  try {
    await ytgame.engagement.sendScore({
      value: Math.floor(newScore)
    });
  } catch (error) {
    ytgame.health.logWarning();
  }
}
```

---

# 14. Ads and Monetization

## 14.1 Interstitial Ads

YouTube controls ad inventory and platform-level pacing.

Client-side cooldown guards may be used to prevent redundant requests.

Do **NOT** use the deprecated `ytgame.ads.requestAd()` API; use `requestInterstitialAd()` instead.

Example:

```typescript
let lastInterstitialTime = 0;

const INTERSTITIAL_COOLDOWN_MS = 10_000;

async function triggerInterstitial(): Promise<void> {
  const now = Date.now();

  if (
    now - lastInterstitialTime <
    INTERSTITIAL_COOLDOWN_MS
  ) {
    return;
  }

  try {
    await ytgame.ads.requestInterstitialAd();

    lastInterstitialTime = Date.now();
  } catch (error) {
    ytgame.health.logWarning();

    // Ad unavailable, dismissed, or rejected.
    // Resume gameplay normally.
  }
}
```

An ad failure **MUST NOT** leave the game in a broken or permanently paused state.

---

## 14.2 Rewarded Ads

Reward IDs **MUST** be:

* Consistent
* Non-user-specific
* Stable identifiers for the reward

Example:

```text
double-coins-v1
```

Example implementation:

```typescript
async function triggerRewarded(
  rewardKey: string
): Promise<boolean> {
  try {
    const rewardEarned =
      await ytgame.ads.requestRewardedAd(
        rewardKey
      );

    if (rewardEarned) {
      grantReward();
      return true;
    }
  } catch (error) {
    ytgame.health.logWarning();
  }

  return false;
}
```

Do not create user-specific reward identifiers.

---

## 14.3 Ads and Audio/Lifecycle State

If the game uses Playables ad functions, it **MUST** continue to correctly handle:

```text
isAudioEnabled()
onAudioEnabledChange()
onPause()
onResume()
```

Running an ad **MUST NOT** permanently break:

* Game audio state
* Pause state
* Resume state
* Gameplay input
* Game simulation

---

# 15. UI and Content Requirements

## 15.1 No In-Game Platform Controls

The game **MUST NOT** provide UI intended to duplicate or mimic YouTube's platform-level controls.

The game **MUST NOT** include an in-game quit/exit button.

Do not create game UI that imitates:

```text
Close
Mute
Menu
YouTube header controls
```

The game **SHOULD** provide only controls that are genuinely part of the game's own experience.

---

## 15.2 No Clickable External Links

The game **MUST NOT** display clickable links that take users directly to external content, such as:

* Other websites
* Other games
* External services

External links may be permitted in the relevant YouTube game/channel description, but not inside the Playable itself.

---

## 15.3 Content Completion

For games with finite content, the game **MUST** clearly communicate when there is no more content for the player to engage with.

Examples:

```text
All levels completed!
You've reached the end of the game.
All available missions completed.
```

Do not leave the player wondering whether the game has broken or whether more content is supposed to appear.

---

# 16. Publishing and Metadata

Games **MUST** provide the required publishing metadata, including appropriate:

* Game title
* Game description
* Genre
* Developer/publisher information
* Required thumbnail assets

Thumbnails may require multiple aspect ratios appropriate to the platform.

Follow the current YouTube Developer Portal requirements for exact metadata fields and asset dimensions.

---

## 16.1 Branding Restriction

Developer/publisher branding or logos **MUST NOT** be included in the game's:

* Title
* Description
* Thumbnail assets

unless explicitly permitted by the applicable current YouTube requirements.

Treat publishing metadata as platform-facing content rather than as an opportunity to add arbitrary promotional branding.

---

# 17. External Network Calls

The game **MUST NOT** make network calls outside of Google/YouTube APIs unless explicitly permitted by the current Playables requirements.

Do not add:

```typescript
fetch('https://my-server.com/...')
```

for ordinary game functionality.

Do not use:

* Custom analytics servers
* Third-party save servers
* External player databases
* External ad networks
* External telemetry endpoints

unless explicitly permitted by current Playables requirements.

---

# 18. Clipboard Restrictions

Clipboard reads are prohibited unless they occur as part of an explicit player-initiated paste action.

Do not automatically read the clipboard.

Incorrect:

```typescript
const clipboardData =
  await navigator.clipboard.readText();
```

if the player did not explicitly initiate a paste interaction.

Acceptable behavior:

```text
Player clicks "Paste"
        ↓
Browser paste interaction
        ↓
Game receives pasted data
```

Do not silently inspect clipboard contents.

---

# 19. Code Obfuscation and Technology Restrictions

## 19.1 Standard Compilation Is Allowed

Normal development practices such as:

* JavaScript minification
* TypeScript transpilation
* Bundling
* Removing whitespace/comments
* Variable name shortening

are permitted.

---

## 19.2 Advanced Obfuscation Is Prohibited

Do **NOT** use advanced code encryption or functional obfuscation designed to prevent platform analysis.

Avoid techniques whose purpose is to conceal the game's actual functionality from platform scanning or evaluation.

---

## 19.3 Restricted Technologies

YouTube may reject games that use technologies or code structures that prevent its systems from adequately evaluating the game.

In particular, **do not introduce the following unless current YouTube Playables requirements explicitly confirm that they are supported:**

* WebAssembly (WASM)
* `eval()`
* Web Workers

Do not add these merely as performance optimizations.

For example, an AI agent **SHOULD NOT** decide to introduce:

```typescript
new Worker('./game-worker.js');
```

or:

```typescript
eval(dynamicCode);
```

or a WASM module solely because it believes the game will run faster.

If an existing game already depends on one of these technologies, verify current Playables compatibility before attempting the integration.

---

# 20. Single Page Application

The game **MUST** operate as a Single Page Application (SPA).

Do not implement gameplay as a collection of independently navigated HTML pages.

Gameplay **SHOULD** remain within the same application/runtime.

---

## 20.1 Avoid Unnecessary Page Reloads

Do not reload the page for:

* Level changes
* Menu changes
* View changes
* Responsive resizing
* Ordinary game progression

Maintain game state in memory and transition between game states within the SPA.

---

# 21. Bundle and Performance Requirements

## 21.1 Initial Bundle Size

The initial bundle **MUST** be less than:

```text
30 MiB
```

Recommended:

```text
< 15 MiB
```

Lazy-load content that is not required for initial interactivity where practical.

---

## 21.2 Total Bundle Size

The complete game bundle **MUST** be less than:

```text
250 MiB
```

Do not unnecessarily load the entire game before `gameReady()`.

---

## 21.3 Individual File Size

Every individual file **MUST** be less than:

```text
30 MiB
```

Recommended:

```text
< 512 KiB per file
```

This applies to files such as:

* JavaScript
* HTML
* Images
* Audio
* Video
* WASM
* Other game assets

---

## 21.4 Load Time

The game **SHOULD** become interactive in under:

```text
5 seconds
```

Prioritize:

* Small initial bundles
* Efficient asset loading
* Lazy loading
* Compressed assets
* Avoiding unnecessary initialization work

---

## 21.5 JavaScript Heap

Peak JavaScript heap usage **MUST NOT** exceed:

```text
512 MB
```

Pay particular attention to memory usage on mobile devices.

Avoid:

* Unbounded arrays
* Retained unused assets
* Duplicate textures
* Duplicate audio buffers
* Unreleased event listeners
* Persistent references to destroyed game objects

---

## 21.6 Crash Stability

The game **MUST NOT** have consistently reproducible crashes.

The game **MUST NOT** cause crashes in:

* YouTube Android
* YouTube iOS
* YouTube web
* Other user software

---

# 22. AI Implementation Rules

This section constrains AI coding agents. It does not introduce additional platform requirements; it explains how an AI agent should interpret and implement the requirements above.

## 22.1 Do Not Invent APIs

When a Playables-specific feature is required, use the documented `ytgame` API.

Do not substitute browser APIs or unrelated mechanisms for required Playables APIs.

See §§4–7.

For example, do not replace:

```typescript
ytgame.game.loadData()
```

with:

```typescript
localStorage.getItem(...)
```

when implementing Playables cloud saves.

Do not replace:

```typescript
ytgame.system.onPause(...)
```

with:

```typescript
document.addEventListener(
  'visibilitychange',
  ...
)
```

when implementing Playables lifecycle handling.

Do not replace:

```typescript
ytgame.system.getLanguage()
```

with:

```typescript
navigator.language
```

as the Playables locale source.

---

## 22.2 Do Not Introduce Prohibited Substitutes

The prohibitions defined throughout this document are authoritative.

Before introducing a new technology or external service, check the relevant section first.

In particular:

* External networking → §17
* Browser storage as cloud-save replacement → §6
* Orientation locks → §10
* Platform-control replacements → §15
* WASM / Web Workers / `eval()` → §19

If the specification explicitly prohibits a mechanism, an AI agent **MUST NOT** introduce it merely because it appears technically convenient.

---

## 22.3 Preserve Existing Game Architecture

When integrating Playables:

* Do not rewrite the entire game unnecessarily.
* Do not replace the rendering engine without a compelling reason.
* Do not introduce new frameworks without a clear need.
* Do not replace existing game systems unnecessarily.
* Do not change gameplay behavior merely to integrate the SDK.
* Make the smallest reliable integration necessary.

---

## 22.4 Centralize Playables Integration

Prefer a dedicated integration layer:

```text
PlayablesIntegration
├── SDK detection
├── firstFrameReady
├── gameReady
├── pause/resume
├── audio
├── cloud saves
├── localization
├── scores
├── ads
└── health logging
```

The rest of the game **SHOULD** communicate with this layer rather than directly depending on `ytgame` wherever practical.

---

## 22.5 Guard Local Development

The game **SHOULD** remain playable during ordinary local development.

Example:

```typescript
if (inPlayablesEnv) {
  await playables.loadSave();
} else {
  await loadLocalDevelopmentSave();
}
```

Local-development fallbacks **MUST NOT** be confused with the actual Playables implementation.

When running inside Playables, use the required Playables APIs.

A local-development fallback **MUST NOT** be built out of an API that §22.7 requires to be absent from the bundle. Guarding such a call with `if (!inPlayablesEnv)` does not make it acceptable — see §22.7.

---

## 22.6 Do Not Claim Compliance Without Verification

An AI agent **MUST NOT** claim that a game is Playables-compliant merely because:

* The game compiles.
* The SDK loads.
* No TypeScript errors exist.
* The game runs in a normal browser.

Use the checklist in §23 and the official Playables Test Suite to verify compliance.

---

## 22.7 Banned APIs Must Be Absent, Not Merely Unreachable

Certification detects prohibited APIs with a **static text scan of the shipped bundle**. The scan does not execute the game, evaluate conditionals, or perform reachability analysis. Unreachable code is indistinguishable from live code.

Therefore, for every API this document prohibits, the requirement is that the string **does not appear in the bundle**.

### The failure mode

An agent reads "do not use X for Playables lifecycle handling", concludes that using X *outside* Playables is therefore fine, and writes:

```typescript
// STILL FAILS THE SCAN
const inPlayablesEnv =
  typeof ytgame !== 'undefined' &&
  Boolean(ytgame.IN_PLAYABLES_ENV);

if (!inPlayablesEnv) {
  document.addEventListener(
    'visibilitychange',
    handleBackgrounding
  );
}
```

This reasoning is wrong. The gate is correct at runtime and irrelevant to the scan. The build ships the string and the scan flags it.

The fix is deletion, not gating:

```typescript
// The Playables SDK callbacks are the only lifecycle source.
ytgame.system.onPause(handlePause);
ytgame.system.onResume(handleResume);
```

### Comments count

The scan reads the bundle as text and cannot distinguish code from prose. A comment that names a banned API fails just as a call does:

```typescript
// STILL FAILS THE SCAN — the comment contains the banned identifiers.
// There is no visibilitychange listener and no document.hidden check here.
```

Describe the constraint without naming the API, or keep the explanation in a repository document that is not part of the shipped bundle.

### Do not evade the scan

Reaching a banned API through a computed property name, string concatenation, `eval`, or any similar indirection is **prohibited**. It defeats platform analysis (§19.2), and the API remains in use regardless. Remove the functionality instead, and accept the local-development cost.

### Verification

Before submitting, grep the built bundle — not the source tree — for every prohibited API:

```text
visibilitychange
document.hidden
document.visibilityState
onvisibilitychange
navigator.language
navigator.languages
```

Expected result for each: **zero occurrences**. A source-tree grep is not sufficient, because the bundle is what gets scanned.

---

# 23. Quick Certification Checklist

## SDK

* [ ] Playables SDK loads before all game code.
* [ ] `IN_PLAYABLES_ENV` is handled appropriately.
* [ ] SDK calls are centralized/guarded where appropriate.
* [ ] All internal asset paths are relative.
* [ ] File names use supported/simple characters.
* [ ] `SdkError` and `SdkErrorType` are handled defensively.

## Lifecycle

* [ ] `firstFrameReady()` is called.
* [ ] `firstFrameReady()` occurs before `gameReady()`.
* [ ] `gameReady()` is called only when the game is genuinely interactive.
* [ ] `onPause()` stops all relevant execution.
* [ ] `onResume()` resumes execution.
* [ ] No Page Visibility API is used for Playables pause/resume.
* [ ] The Page Visibility API does not appear **anywhere in the built bundle** — including behind environment checks, in dead code, in local-development fallbacks, or in comments (§22.7).

## Audio

* [ ] YouTube audio state is respected.
* [ ] `isAudioEnabled()` is used.
* [ ] `onAudioEnabledChange()` is used.
* [ ] Device/system volume is respected.
* [ ] No competing master mute control exists.
* [ ] Web Audio suspension is handled correctly.

## Saves

* [ ] `loadData()` is used.
* [ ] `saveData()` is used.
* [ ] `loadData()` completes before the first `saveData()`.
* [ ] No localStorage/sessionStorage/IndexedDB/cookie save system is used as the Playables save mechanism.
* [ ] Save data is under 3 MiB.
* [ ] Pause/final-flush data remains under 64 KiB.
* [ ] Save data is valid UTF-16.
* [ ] Important progress is saved at material milestones.
* [ ] Previous save versions can be migrated.
* [ ] Corrupt saves cannot crash the game.
* [ ] Final flush is treated as best-effort only.

## Ads

* [ ] Interstitial ad failure does not break or freeze gameplay.
* [ ] Reward IDs are stable and non-user-specific.

## Localization

* [ ] `getLanguage()` is used.
* [ ] `navigator.language` is not used as the Playables locale source.
* [ ] `navigator.language` / `navigator.languages` do not appear **anywhere in the built bundle**, including dev-only fallbacks (§22.7).
* [ ] Locale preference is not stored in cloud save data.
* [ ] English is supported.

## Input

* [ ] Touch works for all intended interactions.
* [ ] Mouse works for all intended interactions.
* [ ] Keyboard input works where appropriate.
* [ ] `Escape` works where appropriate.
* [ ] `preventDefault()` is not called for Escape.
* [ ] Haptics have an enable/disable control if implemented.
* [ ] No unintended input delays/errors exist.

## Responsive Design

* [ ] Game adapts to required aspect ratios.
* [ ] Game does not stretch non-uniformly.
* [ ] Letterboxing/pillarboxing is handled correctly.
* [ ] Resize does not reset game state.
* [ ] Resize does not reload the application unnecessarily.
* [ ] Orientation is not locked.

## UI

* [ ] No in-game UI duplicates or mimics YouTube platform controls.
* [ ] No clickable external links exist inside the Playable.
* [ ] Finite games clearly communicate completion.

## Networking

* [ ] No unauthorized external network calls.
* [ ] No external analytics server.
* [ ] No external save server.
* [ ] No external telemetry endpoint.
* [ ] No external ad network.

## Clipboard

* [ ] No automatic clipboard reads.
* [ ] Clipboard access occurs only after explicit player paste interaction.

## Code

* [ ] No advanced anti-analysis obfuscation.
* [ ] No unnecessary `eval()`.
* [ ] No unnecessary Web Workers.
* [ ] WASM compatibility has been explicitly verified if WASM is used.
* [ ] Game remains a SPA.
* [ ] No unnecessary page reloads.

## Performance

* [ ] Initial bundle <30 MiB.
* [ ] Initial bundle ideally <15 MiB.
* [ ] Total bundle <250 MiB.
* [ ] Every individual file <30 MiB.
* [ ] Individual files ideally <512 KiB.
* [ ] Total file count ≤8,000.
* [ ] Peak JavaScript heap ≤512 MB.
* [ ] Game should become interactive in <5 seconds.
* [ ] No reproducible crashes.

## Publishing

* [ ] Required metadata is provided.
* [ ] Required thumbnail formats are provided.
* [ ] Developer/publisher branding or logos are not included in title, description, or thumbnails unless explicitly permitted.

---

# 24. Normative Language and Source of Truth

## 24.1 Normative Language

The following vocabulary defines how requirements in this document should be interpreted:

### `MUST` / `MUST NOT`

A mandatory platform or certification requirement.

An AI agent **MUST NOT** override these requirements because another implementation appears technically equivalent or more convenient.

### `STRICT CONSTRAINT`

An especially important mandatory restriction.

Treat a **STRICT CONSTRAINT** as equivalent to a **MUST NOT** or **MUST** requirement depending on its wording.

### `SHOULD` / `SHOULD NOT`

A strong recommendation.

Deviation may be acceptable when there is a concrete technical reason, but an AI agent should normally follow the recommendation.

### Examples

Code examples demonstrate one valid implementation approach.

An example is **NOT automatically a platform requirement** unless the surrounding text explicitly states that the behavior is required.

---

## 24.2 Source of Truth

This document is an **AI-oriented implementation specification**, not a permanent replacement for the official YouTube Playables documentation.

Before certification or submission:

1. Check the current official YouTube Playables requirements.
2. Check the current Playables SDK reference.
3. Run the official Playables Test Suite.
4. Resolve all certification failures before submission.

Platform requirements may change after this document is written.

When this specification conflicts with a newer official YouTube requirement, the **current official YouTube requirement takes precedence**.
