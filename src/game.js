(function () {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const hudArea = document.getElementById("areaName");
  const statusText = document.getElementById("statusText");
  const dialogue = document.getElementById("dialogue");
  const dialogueText = document.getElementById("dialogueText");
  const dialogueButton = document.getElementById("dialogueButton");
  const questionPanel = document.getElementById("questionPanel");
  const questionMeta = document.getElementById("questionMeta");
  const questionTitle = document.getElementById("questionTitle");
  const questionText = document.getElementById("questionText");
  const choiceList = document.getElementById("choiceList");
  const feedback = document.getElementById("feedback");
  const runPanel = document.getElementById("runPanel");
  const summaryPanel = document.getElementById("summaryPanel");
  const summaryTitle = document.getElementById("summaryTitle");
  const summaryText = document.getElementById("summaryText");
  const summaryButton = document.getElementById("summaryButton");
  const actionButton = document.getElementById("actionButton");
  const backButton = document.getElementById("backButton");
  const menuButton = document.getElementById("menuButton");
  const audioToggleButton = document.getElementById("audioToggleButton");
  const saveButton = document.getElementById("saveButton");
  const resetButton = document.getElementById("resetButton");
  const savePrompt = document.getElementById("savePrompt");
  const loadSaveButton = document.getElementById("loadSaveButton");
  const newGameButton = document.getElementById("newGameButton");

  const assets = {
    hub: loadImage("assets/map/idiom-village-map.png"),
    rooms: loadImage("assets/rooms/scene-atlas.png"),
    ninja: loadImage("assets/sprites/ninja-walk-v2.png"),
    props: loadImage("assets/props/scene-props.png"),
    boss: loadImage("assets/sprites/boss-runner-atlas.png"),
    sumoBoss: loadImage("assets/sprites/sumo-boss-push-clean.png"),
    sumoPlayer: loadImage("assets/sprites/ninja-sumo-push.png"),
    sumoImpact: loadImage("assets/sprites/sumo-impact-fx.png"),
    sumoPushFx: loadImage("assets/sprites/sumo-push-fx-v2.png"),
    runnerBg: loadImage("assets/rooms/forest-runner-loop-v2.png"),
    slashFx: loadImage("assets/sprites/ninja-slash-fx-v2.png"),
    runnerSlashFx: loadImage("assets/sprites/ninja-slash-fx-runner-v3.png"),
    swordBoss: loadImage("assets/sprites/sword-boss-combat-clean.png"),
    shurikenBoss: loadImage("assets/sprites/shuriken-boss-combat.png"),
    shurikenBossV2: loadImage("assets/sprites/shuriken-boss-combat-v2-clean.png"),
    ninjutsuBoss: loadImage("assets/sprites/ninjutsu-boss-combat-clean.png"),
    airBoss: loadImage("assets/sprites/air-boss-combat-clean.png"),
    finalBoss: loadImage("assets/sprites/final-boss-combat-clean.png"),
    ninjaCombat: loadImage("assets/sprites/ninja-combat-actions.png"),
    combatFx: loadImage("assets/sprites/combat-impact-fx.png"),
    shurikenFx: loadImage("assets/sprites/shuriken-fx-v2.png"),
    blowDart: loadImage("assets/sprites/ninja-blowdart-fx.png")
  };

  const sounds = createSoundBank({
    walkGrass: "grass_walk.mp3",
    door: "door_open.mp3",
    question: "question_open.mp3",
    correct: "answer_correct.mp3",
    wrong: "answer_wrong.mp3",
    battleStart1: "battle_start_1.mp3",
    battleStart2: "battle_start_2.mp3",
    defeated: "defeated.mp3",
    victory1: "victory_1.mp3",
    victory2: "victory_2.mp3",
    cheer: "歡呼聲.mp3",
    hit: "hit.mp3",
    sumoHit: "sumo_hit.mp3",
    swordSwing: "sword_swing_2.mp3",
    runnerSlash: "sword_swing_1.mp3",
    swordClash: "sword_clash.mp3",
    shuriken: "shuriken_throw.mp3",
    fireball: "fireball.mp3",
    flying: "flying_loop.mp3",
    blowDart: "blow_dart.mp3"
  });

  const music = createMusicBank({
    main: "ninja_theme.mp3",
    meaning: "L1.mp3",
    cloze: "L2.mp3",
    scenario: "L3.mp3",
    judge: "L4.mp3",
    runner: "L5.mp3",
    boss: "L6.mp3"
  });

  const combatProfiles = {
    sword: { bossAsset: "swordBoss", bossScale: 0.46, playerRow: 0, playerScale: 0.34, range: 152, attackTime: 0.36, bossAttackTime: 0.46, hitFx: 2, speed: 112, cooldown: 2.05 },
    shuriken: { bossAsset: "shurikenBossV2", bossScale: 0.42, playerRow: 1, playerScale: 0.32, range: 430, attackTime: 0.34, bossAttackTime: 0.4, hitFx: 4, speed: 122, cooldown: 1.9 },
    ninjutsu: { bossAsset: "ninjutsuBoss", bossScale: 0.42, playerRow: 1, playerScale: 0.32, range: 380, attackTime: 0.42, bossAttackTime: 0.52, hitFx: 5, speed: 112, cooldown: 2.05 },
    air: { bossAsset: "airBoss", bossScale: 0.38, playerRow: 0, playerScale: 0.33, range: 230, attackTime: 0.34, bossAttackTime: 0.44, hitFx: 6, speed: 150, cooldown: 1.9 },
    final: { bossAsset: "finalBoss", bossScale: 0.5, playerRow: 1, playerScale: 0.34, range: 320, attackTime: 0.4, bossAttackTime: 0.5, hitFx: 7, speed: 140, cooldown: 1.75 }
  };

  const dirs = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" };
  const dirRows = { down: 0, left: 1, right: 2, up: 3 };
  const SAVE_KEY = "idioms-rpg-save-v1";
  const RUNNER_SLASH_TIME = 0.32;
  const RUNNER_SLASH_DELAY = 0.12;
  const keys = new Set();
  const touchTimers = new Map();

  const state = {
    mode: "intro",
    place: "hub",
    x: MAP_DATA.spawn.x,
    y: MAP_DATA.spawn.y,
    dir: "down",
    moving: false,
    frame: 0,
    hp: 5,
    maxHp: 5,
    marks: new Set(),
    cleared: new Set(),
    completedObjects: new Set(),
    roomProgress: Object.fromEntries(MAP_DATA.exits.map((gate) => [gate.room, { training: 0, boss: 0 }])),
    deck: shuffle([...IDIOMS.keys()]),
    currentGate: null,
    currentRoom: null,
    currentObject: null,
    pending: null,
    gameComplete: false,
    runner: null,
    tapMove: { dx: 0, dy: 0, time: 0 },
    battle: null
  };

  let last = performance.now();
  let dialogueTimer = null;
  let dialogueFullText = "";
  let dialogueDone = true;
  let dialogueOnClose = null;
  let pendingSavedGame = null;
  let audioUnlocked = false;
  let audioEnabled = true;
  let walkingLoop = null;
  let flyingLoop = null;
  let currentMusic = null;
  let currentMusicKey = null;
  let lastTouchEnd = 0;
  const activeSounds = new Set();

  flashDialogue(
    "歡迎來到成語忍卷傳。每一關都有守關 BOSS。先在房間裡完成寶物題，取得語力，再挑戰 BOSS 解鎖下一關。",
    "開始修行",
    () => {
      state.mode = "map";
    }
  );

  summaryButton.addEventListener("click", closeSummary);
  actionButton.addEventListener("click", preventPageZoom);
  backButton.addEventListener("click", preventPageZoom);
  actionButton.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    unlockAudio();
    interact();
  });
  backButton.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    unlockAudio();
    handleBack();
  });
  menuButton.addEventListener("click", showMission);
  audioToggleButton.addEventListener("click", toggleAudio);
  saveButton.addEventListener("click", saveGame);
  resetButton.addEventListener("click", resetSavedGame);
  loadSaveButton.addEventListener("click", loadSavedGame);
  newGameButton.addEventListener("click", startFreshGame);

  document.querySelectorAll("[data-dir]").forEach((button) => {
    const key = "Arrow" + button.dataset.dir[0].toUpperCase() + button.dataset.dir.slice(1);
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      keys.add(key);
      stepByTouch(button.dataset.dir);
      clearTouchTimer(button);
      touchTimers.set(button, setInterval(() => stepByTouch(button.dataset.dir), 110));
    });
    button.addEventListener("pointerup", () => releaseTouch(button, key));
    button.addEventListener("pointerleave", () => releaseTouch(button, key));
    button.addEventListener("pointercancel", () => releaseTouch(button, key));
  });

  window.addEventListener("keydown", (event) => {
    unlockAudio();
    if (dirs[event.key]) {
      event.preventDefault();
      keys.add(event.key);
    }
    if (event.key.toLowerCase() === "a") interact();
    if (event.key === " " || event.key === "Enter") interact();
    if (event.key.toLowerCase() === "m") showMission();
    if (event.key === "Escape") handleBack();
  });
  window.addEventListener("keyup", (event) => {
    if (dirs[event.key]) keys.delete(event.key);
  });
  window.addEventListener("pointerdown", unlockAudio, { once: true });
  window.addEventListener("keydown", unlockAudio, { once: true });
  document.addEventListener("dblclick", preventPageZoom, { passive: false });
  document.addEventListener("touchend", preventDoubleTapZoom, { passive: false });
  document.addEventListener("touchmove", preventPinchZoom, { passive: false });
  document.addEventListener("gesturestart", preventPageZoom, { passive: false });
  document.addEventListener("gesturechange", preventPageZoom, { passive: false });
  document.addEventListener("gestureend", preventPageZoom, { passive: false });

  const startupSave = readSavedGame();
  if (startupSave) showSavePrompt(startupSave);

  setInterval(() => tick(performance.now()), 1000 / 60);

  function loadImage(src) {
    const image = new Image();
    image.ready = new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
    });
    image.src = src;
    return image;
  }

  function preventPageZoom(event) {
    event.preventDefault();
  }

  function preventDoubleTapZoom(event) {
    const now = Date.now();
    if (now - lastTouchEnd <= 360) event.preventDefault();
    lastTouchEnd = now;
  }

  function preventPinchZoom(event) {
    if (event.touches && event.touches.length > 1) event.preventDefault();
  }

  function createSoundBank(files) {
    const bank = {};
    for (const [name, file] of Object.entries(files)) {
      const audio = new Audio(`assets/sounds/${file}`);
      audio.preload = "auto";
      audio.volume = 0.82;
      bank[name] = audio;
    }
    if (bank.walkGrass) bank.walkGrass.volume = 0.28;
    if (bank.flying) bank.flying.volume = 0.32;
    return bank;
  }

  function createMusicBank(files) {
    const bank = {};
    for (const [name, file] of Object.entries(files)) {
      const audio = new Audio(`assets/sounds/${file}`);
      audio.preload = "auto";
      audio.loop = true;
      audio.volume = 0.38;
      bank[name] = audio;
    }
    if (bank.main) bank.main.volume = 0.34;
    if (bank.runner) bank.runner.volume = 0.34;
    return bank;
  }

  function unlockAudio() {
    audioUnlocked = true;
    updateBackgroundMusic();
  }

  function playSound(name, volume = null) {
    if (!audioEnabled) return;
    const source = sounds[name];
    if (!source) return;
    try {
      const audio = source.cloneNode(true);
      audio.volume = volume ?? source.volume;
      activeSounds.add(audio);
      audio.addEventListener("ended", () => activeSounds.delete(audio), { once: true });
      audio.play().catch(() => activeSounds.delete(audio));
    } catch (error) {
      // Audio is optional; never let a sound problem stop the game.
    }
  }

  function playRandomSound(names, volume = null) {
    playSound(names[Math.floor(Math.random() * names.length)], volume);
  }

  function startLoop(name, currentLoop, volume = null) {
    if (!audioEnabled || !audioUnlocked) return currentLoop;
    if (currentLoop) return currentLoop;
    const source = sounds[name];
    if (!source) return null;
    try {
      const audio = source.cloneNode(true);
      audio.loop = true;
      audio.volume = volume ?? source.volume;
      audio.play().catch(() => {});
      return audio;
    } catch (error) {
      return null;
    }
  }

  function stopLoop(loop) {
    if (!loop) return null;
    loop.pause();
    loop.currentTime = 0;
    return null;
  }

  function updateAmbientSounds() {
    const movingOnMainMap = state.mode === "map" && state.place === "hub" && state.moving;
    const flyingInRunner = state.mode === "room" && state.place === "room" && state.currentRoom?.mode === "runner";
    walkingLoop = movingOnMainMap ? startLoop("walkGrass", walkingLoop) : stopLoop(walkingLoop);
    flyingLoop = flyingInRunner ? startLoop("flying", flyingLoop) : stopLoop(flyingLoop);
    updateBackgroundMusic();
  }

  function stopRoomLoops() {
    walkingLoop = stopLoop(walkingLoop);
    flyingLoop = stopLoop(flyingLoop);
  }

  function updateBackgroundMusic() {
    const key = currentMusicTarget();
    if (!audioEnabled || !audioUnlocked || !key) {
      stopBackgroundMusic();
      return;
    }
    if (currentMusicKey === key && currentMusic) return;
    stopBackgroundMusic();
    const audio = music[key];
    if (!audio) return;
    currentMusic = audio;
    currentMusicKey = key;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }

  function currentMusicTarget() {
    if (state.place === "room" && state.currentGate?.id) return state.currentGate.id;
    return "main";
  }

  function stopBackgroundMusic() {
    if (!currentMusic) {
      currentMusicKey = null;
      return;
    }
    currentMusic.pause();
    currentMusic.currentTime = 0;
    currentMusic = null;
    currentMusicKey = null;
  }

  function stopAllAudio() {
    walkingLoop = stopLoop(walkingLoop);
    flyingLoop = stopLoop(flyingLoop);
    stopBackgroundMusic();
    for (const audio of activeSounds) {
      audio.pause();
      audio.currentTime = 0;
    }
    activeSounds.clear();
  }

  function toggleAudio() {
    audioEnabled = !audioEnabled;
    if (!audioEnabled) stopAllAudio();
    else {
      unlockAudio();
      updateBackgroundMusic();
    }
    updateAudioButton();
  }

  function updateAudioButton() {
    audioToggleButton.textContent = audioEnabled ? "音效：開" : "音效：關";
  }

  function playBattleAttackSound(kind) {
    if (kind === "sumo") return;
    if (kind === "sword") return playSound("swordSwing", 0.86);
    if (kind === "shuriken") return playSound("shuriken", 0.86);
    if (kind === "ninjutsu") return playSound("fireball", 0.84);
    if (kind === "air") return playSound("runnerSlash", 0.86);
    if (kind === "final") return playSound("blowDart", 0.86);
  }

  function playBossHazardSound(kind) {
    if (kind === "shuriken") return playSound("shuriken", 0.78);
    if (kind === "ninjutsu") return playSound("fireball", 0.78);
    if (kind === "air") return playSound("runnerSlash", 0.78);
    if (kind === "final") return playSound("blowDart", 0.78);
  }

  function playBattleHitSound(kind) {
    if (kind === "sumo") return playSound("sumoHit", 0.92);
    if (kind === "sword" || kind === "air") return playSound("swordClash", 0.88);
    return playSound("hit", 0.82);
  }

  function playPlayerHitSound(kind) {
    playSound("hit", 0.88);
    if (kind === "sumo") playSound("sumoHit", 0.74);
    if (kind === "sword" || kind === "air") playSound("swordClash", 0.62);
  }

  function tick(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(dt);
    updateAmbientSounds();
    draw();
  }

  function update(dt) {
    if (state.mode === "battle") return updateBattle(dt);
    if (state.mode !== "map" && state.mode !== "room") return;
    if (state.place === "room" && state.currentRoom?.mode === "runner") updateRunner(dt);
    else updateTopdown(dt);
  }

  function updateTopdown(dt) {
    let dx = 0;
    let dy = 0;
    if (keys.has("ArrowLeft")) dx -= 1;
    if (keys.has("ArrowRight")) dx += 1;
    if (keys.has("ArrowUp")) dy -= 1;
    if (keys.has("ArrowDown")) dy += 1;
    if (state.tapMove.time > 0) {
      dx += state.tapMove.dx;
      dy += state.tapMove.dy;
      state.tapMove.time = Math.max(0, state.tapMove.time - dt);
    }
    state.moving = dx !== 0 || dy !== 0;
    if (!state.moving) return;

    const len = Math.hypot(dx, dy) || 1;
    dx /= len;
    dy /= len;
    state.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up";

    const speed = state.place === "hub" ? 220 : 260;
    const nextX = clamp(state.x + dx * speed * dt, 65, MAP_DATA.width - 65);
    const nextY = clamp(state.y + dy * speed * dt, 95, MAP_DATA.height - 52);
    if (!hitsBlocker(nextX, state.y)) state.x = nextX;
    if (!hitsBlocker(state.x, nextY)) state.y = nextY;
    state.frame += dt * 13;
  }

  function updateRunner(dt) {
    const runner = state.runner;
    runner.time += dt;
    runner.bgOffset = (runner.bgOffset + dt * 260) % runnerBackgroundWidth();

    let dy = 0;
    if (keys.has("ArrowUp")) dy -= 1;
    if (keys.has("ArrowDown")) dy += 1;
    let dx = 0;
    if (keys.has("ArrowLeft")) dx -= 1;
    if (keys.has("ArrowRight")) dx += 1;
    state.moving = dx !== 0 || dy !== 0;
    state.dir = dx < 0 ? "left" : "right";
    state.x = clamp(state.x + dx * 330 * dt, 120, 1260);
    state.y = clamp(state.y + dy * 390 * dt, 135, 710);
    state.frame += dt * 12;

    runner.spawn -= dt;
    if (runner.spawn <= 0 && runner.training < state.currentRoom.trainingNeeded) {
      spawnRunnerItem();
      runner.spawn = 1.1 + Math.random() * 0.7;
    }

    for (const item of runner.items) item.x -= item.speed * dt;
    runner.items = runner.items.filter((item) => item.x > -140 && !item.done);

    for (const item of runner.items) {
      if (item.done) continue;
      const d = distance(state.x, state.y, item.x, item.y);
      if (item.type === "jade" && d < 58) {
        item.done = true;
        runner.jade += 1;
        runner.message = `取得玉石 ${runner.jade} 顆`;
      }
      if (item.type === "enemy" && d < 64) {
        item.done = true;
        playSound("hit", 0.78);
        state.hp = Math.max(1, state.hp - 1);
        runner.message = "撞到敵方忍者，HP -1";
      }
    }

    if (runner.slash > 0) runner.slash = Math.max(0, runner.slash - dt);
    if (runner.pendingSlash) {
      runner.pendingSlash.delay -= dt;
      if (runner.pendingSlash.delay <= 0) resolveRunnerSlash();
    }
    if (runner.training >= state.currentRoom.trainingNeeded) runner.bossVisible = true;
  }

  function spawnRunnerItem() {
    const roll = Math.random();
    const type = roll < 0.34 ? "scroll" : roll < 0.67 ? "enemy" : "jade";
    state.runner.items.push({
      id: `${type}-${Date.now()}-${Math.random()}`,
      type,
      x: canvas.width + 120,
      y: 180 + Math.random() * 500,
      speed: type === "enemy" ? 360 : 280
    });
  }

  function stepByTouch(dir) {
    if (state.mode !== "map" && state.mode !== "room") return;
    if (state.place === "room" && state.currentRoom?.mode === "runner") {
      if (dir === "up") state.y = clamp(state.y - 48, 135, 710);
      if (dir === "down") state.y = clamp(state.y + 48, 135, 710);
      if (dir === "left") state.x = clamp(state.x - 54, 120, 1260);
      if (dir === "right") state.x = clamp(state.x + 54, 120, 1260);
      state.dir = dir === "left" ? "left" : "right";
      state.moving = true;
      state.frame += 0.9;
      return;
    }

    const delta = {
      up: { dx: 0, dy: -46, face: "up" },
      down: { dx: 0, dy: 46, face: "down" },
      left: { dx: -46, dy: 0, face: "left" },
      right: { dx: 46, dy: 0, face: "right" }
    }[dir];
    if (!delta) return;
    state.dir = delta.face;
    state.moving = true;
    state.tapMove = { dx: Math.sign(delta.dx), dy: Math.sign(delta.dy), time: 0.18 };
    state.frame += 0.35;
  }

  function releaseTouch(button, key) {
    keys.delete(key);
    clearTouchTimer(button);
  }

  function clearTouchTimer(button) {
    const timer = touchTimers.get(button);
    if (timer) clearInterval(timer);
    touchTimers.delete(button);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!assetsReady()) {
      ctx.fillStyle = "#101411";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#fff1c2";
      ctx.font = "700 34px Microsoft JhengHei, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("載入成語修行場景...", canvas.width / 2, canvas.height / 2);
      updateHud();
      return;
    }
    if (state.place === "room" && state.currentRoom) drawRoom();
    else drawHub();
    if (state.mode === "battle") drawBattle();
    updateHud();
  }

  function assetsReady() {
    return Object.values(assets).every((image) => image.complete && image.naturalWidth > 0);
  }

  function drawHub() {
    ctx.drawImage(assets.hub, 0, 0, canvas.width, canvas.height);
    for (const gate of MAP_DATA.exits) drawGate(gate);
    drawPlayer(104);
    drawHint();
  }

  function drawGate(gate) {
    const unlocked = isGateUnlocked(gate);
    const cleared = state.cleared.has(gate.id);
    const pulse = 1 + Math.sin(performance.now() / 360) * 0.04;
    ctx.save();
    ctx.globalAlpha = unlocked ? 1 : 0.42;
    drawBossCell("portal", gate.x, gate.y - 12, 0.34 * pulse);
    if (cleared) drawBossCell("jade", gate.x + 54, gate.y - 66, 0.14);
    if (!unlocked) drawLock(gate.x + 52, gate.y - 58);
    ctx.restore();
    drawLabel(gate.name, gate.x, gate.y + 88, unlocked);
  }

  function drawRoom() {
    if (state.currentRoom.mode === "runner") drawRunnerRoom();
    else {
      drawRoomBackground(state.currentRoom);
      drawBossRoom();
    }
    drawHint();
  }

  function drawRoomBackground(room) {
    const sw = assets.rooms.width / 3;
    const sh = assets.rooms.height / 2;
    ctx.drawImage(assets.rooms, room.atlas.col * sw, room.atlas.row * sh, sw, sh, 0, 0, canvas.width, canvas.height);
  }

  function drawBossRoom() {
    drawExitDoor();
    for (const treasure of state.currentRoom.treasures) drawTreasure(treasure);
    drawRoomBoss();
    drawPlayer(104);
  }

  function drawTreasure(treasure) {
    const done = state.completedObjects.has(treasure.id);
    ctx.save();
    ctx.globalAlpha = done ? 0.56 : 1;
    drawProp(done ? "scrollChest" : treasure.prop, treasure.x, treasure.y, 0.25);
    if (!done) drawSparkle(treasure.x, treasure.y - 78, "#ffdf7e");
    ctx.restore();
    drawLabel(done ? "已取得寶物" : treasure.label, treasure.x, treasure.y + 88, true);
  }

  function drawRoomBoss() {
    const room = state.currentRoom;
    const progress = state.roomProgress[roomId()];
    const ready = progress.training >= room.trainingNeeded;
    const defeated = state.cleared.has(state.currentGate.id);
    const t = performance.now() / 1000;
    const bossX = room.boss.x + Math.sin(t * 1.2) * (defeated ? 0 : 26);
    const bossY = room.boss.y + Math.sin(t * 1.7) * (defeated ? 0 : 14);
    const scale = room.bossCell === "scrollDemon" ? 0.54 : 0.48;
    const kind = battleKind(state.currentGate.id);
    const profile = combatProfiles[kind];
    ctx.save();
    ctx.globalAlpha = defeated ? 0.62 : 1;
    if (kind === "sumo") drawSpriteSheetFrame(assets.sumoBoss, 4, 1, Math.floor(t * 2) % 2, bossX, bossY, 0.27, false);
    else if (profile) {
      const idleFrame = kind === "sword" ? 0 : Math.floor(t * 2) % 2;
      drawSpriteSheetFrame(assets[profile.bossAsset], 4, 1, idleFrame, bossX, bossY, profile.bossScale * 0.78, false);
    }
    else drawBossCell(room.bossCell, bossX, bossY, scale);
    if (ready && !defeated) drawSparkle(bossX, bossY - 172, "#ff7777");
    ctx.restore();
    drawLabel(defeated ? "BOSS 已擊敗" : ready ? `${room.bossName} 可挑戰` : `${room.bossName} 等待語力`, bossX, bossY + 176, true);
  }

  function drawRunnerRoom() {
    const runner = state.runner;
    drawRunnerBackground(runner.bgOffset);
    drawRunnerBands(runner.bgOffset);
    drawExitDoor();
    for (const item of runner.items) {
      if (item.type === "scroll") drawBossCell("flyingScroll", item.x, item.y, 0.22);
      if (item.type === "enemy") drawBossCell("enemyNinja", item.x, item.y, 0.18);
      if (item.type === "jade") drawBossCell("jade", item.x, item.y, 0.12);
    }
    if (runner.bossVisible) {
      const bossY = 420 + Math.sin(runner.time * 2) * 56;
      const bossX = state.currentRoom.boss.x + Math.sin(runner.time * 1.15) * 150;
      drawSpriteSheetFrame(assets.airBoss, 4, 1, Math.floor(runner.time * 5) % 2, bossX, bossY, 0.28, false);
      drawLabel("疾風忍者 BOSS", bossX, bossY + 156, true);
    }
    drawFlyingPlayer();
    if (runner.slash > 0) {
      const progress = 1 - runner.slash / RUNNER_SLASH_TIME;
      drawRunnerSlashFx(state.x + 146, state.y - 18, 0.52, false, progress);
    }
    drawRunnerHud();
  }

  function drawRunnerBackground(offset) {
    const image = assets.runnerBg;
    const width = runnerBackgroundWidth();
    const x = -(offset % width);
    for (let i = -1; i < Math.ceil(canvas.width / width) + 2; i++) {
      ctx.drawImage(image, x + i * width, 0, width, canvas.height);
    }
  }

  function runnerBackgroundWidth() {
    const image = assets.runnerBg;
    if (!image?.naturalWidth || !image?.naturalHeight) return canvas.width;
    return image.naturalWidth * (canvas.height / image.naturalHeight);
  }

  function drawRunnerBands(offset) {
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = "#c6f2ff";
    for (let i = -1; i < 8; i++) {
      const x = i * 260 - offset;
      ctx.fillRect(x, 112, 110, 6);
      ctx.fillRect(x + 70, 690, 140, 5);
    }
    ctx.restore();
  }

  function drawRunnerHud() {
    const runner = state.runner;
    ctx.save();
    ctx.font = "700 24px Microsoft JhengHei, sans-serif";
    ctx.fillStyle = "rgba(8, 12, 10, .72)";
    roundRect(18, 76, 510, 52, 8);
    ctx.fill();
    ctx.fillStyle = "#fff1bd";
    ctx.fillText(`寶物 ${runner.training}/${state.currentRoom.trainingNeeded}  玉石 ${runner.jade}  ${runner.message}`, 36, 110);
    ctx.restore();
  }

  function startBossBattle() {
    dialogue.classList.add("hidden");
    const kind = battleKind(state.currentGate.id);
    const profile = combatProfiles[kind];
    const maxTime = kind === "sumo" ? 38 : kind === "final" ? 46 : 40;
    const bossHp = kind === "final" ? 10 : 6;
    const playerBattleHp = clamp(state.hp, 3, 4);
    stopRoomLoops();
    playRandomSound(["battleStart1", "battleStart2"], 0.9);
    state.mode = "battle";
    state.battle = {
      kind,
      time: maxTime,
      maxTime,
      playerHp: playerBattleHp,
      maxPlayerHp: playerBattleHp,
      bossHp,
      maxBossHp: bossHp,
      playerX: 470,
      playerY: kind === "air" ? 430 : kind === "final" ? 450 : 500,
      bossX: kind === "sumo" ? 1120 : 1010,
      bossY: kind === "sumo" ? 500 : kind === "air" ? 390 : kind === "final" ? 430 : 470,
      bossVX: 0,
      bossVY: 0,
      bossScale: profile?.bossScale || (kind === "final" ? 0.7 : 0.6),
      playerAttack: 0,
      bossAttack: 0,
      bossCooldown: kind === "sumo" ? 0.85 : 0.7,
      playerInvul: 0,
      bossHitFlash: 0,
      startDelay: kind === "sumo" ? 3 : 1.5,
      impact: 0,
      impactX: null,
      impactY: null,
      playerHitFlash: 0,
      pushWave: 0,
      hazards: [],
      dangerZones: [],
      obstacles: [],
      smallBoss: createSmallBoss(kind),
      playerShots: [],
      evadeTime: 0,
      openingSpawn: 0,
      rage: 0,
      mistakes: 0,
      step: 0,
      message: battleRuleText(state.currentGate.id),
      flash: 0
    };
  }

  function updateBattle(dt) {
    const battle = state.battle;
    if (!battle) return;
    battle.time = Math.max(0, battle.time - dt);
    if (battle.flash > 0) battle.flash -= dt;
    if (battle.playerAttack > 0) battle.playerAttack -= dt;
    if (battle.bossAttack > 0) battle.bossAttack -= dt;
    if (battle.playerInvul > 0) battle.playerInvul -= dt;
    if (battle.bossHitFlash > 0) battle.bossHitFlash -= dt;
    if (battle.playerHitFlash > 0) battle.playerHitFlash -= dt;
    if (battle.impact > 0) battle.impact -= dt;
    if (battle.impact <= 0) {
      battle.impactX = null;
      battle.impactY = null;
    }
    if (battle.pushWave > 0) battle.pushWave -= dt;
    battle.step += dt;

    if (battle.startDelay > 0) {
      battle.startDelay = Math.max(0, battle.startDelay - dt);
      battle.message = battle.startDelay > 0 ? `準備 BOSS 對決：${Math.ceil(battle.startDelay)}` : "開始！靠近 BOSS，面向牠按 A 攻擊。";
      return;
    }

    updateBattlePlayer(dt, battle);
    updateBossAi(dt, battle);
    updateSmallBoss(dt, battle);
    if (!state.battle) return;
    updateBattleHazards(dt, battle);
    if (!state.battle) return;
    updatePlayerShots(dt, battle);

    if (battle.time <= 0) return loseBattle("對戰時間結束，BOSS 壓制了你。");
  }

  function battleAction() {
    const battle = state.battle;
    if (!battle) return;
    if (battle.playerAttack > 0) return;
    const profile = combatProfiles[battle.kind];
    battle.playerAttack = battle.kind === "sumo" ? 0.38 : profile?.attackTime || 0.26;
    battle.flash = 0.16;
    playBattleAttackSound(battle.kind);

    const dx = battle.bossX - battle.playerX;
    const dy = battle.bossY - battle.playerY;
    state.dir = Math.abs(dx) > Math.abs(dy) ? (dx >= 0 ? "right" : "left") : dy > 0 ? "down" : "up";
    const range = battle.kind === "sumo" ? 160 : profile?.range || 132;
    if (battle.kind === "shuriken") {
      spawnPlayerShuriken(battle, dx, dy);
      battle.message = "飛鏢出手！命中 BOSS 會造成傷害。";
      return;
    }
    if (battle.kind === "final") {
      spawnPlayerBlowDart(battle, dx, dy);
      battle.message = "吹箭出手！抓準距離命中魔卷。";
      return;
    }
    const facingHit =
      (state.dir === "right" && dx > -10) ||
      (state.dir === "left" && dx < 10) ||
      (state.dir === "up" && dy < 20) ||
      (state.dir === "down" && dy > -20);

    if (distance(battle.playerX, battle.playerY, battle.bossX, battle.bossY) <= range && facingHit) {
      hitBoss("近身攻擊命中！");
      return;
    }
    battle.message = "揮空了，靠近並面向 BOSS 再攻擊。";
  }

  function updateBattlePlayer(dt, battle) {
    let dx = 0;
    let dy = 0;
    if (keys.has("ArrowLeft")) dx -= 1;
    if (keys.has("ArrowRight")) dx += 1;
    if (keys.has("ArrowUp")) dy -= 1;
    if (keys.has("ArrowDown")) dy += 1;
    state.moving = dx !== 0 || dy !== 0;
    if (state.moving) {
      const len = Math.hypot(dx, dy) || 1;
      dx /= len;
      dy /= len;
      state.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up";
      const speed = battle.kind === "air" || battle.kind === "final" ? 390 : 310;
      const nextX = clamp(battle.playerX + dx * speed * dt, 290, 1240);
      const nextY = clamp(battle.playerY + dy * speed * dt, 300, 640);
      battle.playerX = nextX;
      battle.playerY = nextY;
      state.frame += dt * 13;
    }
  }

  function updateBossAi(dt, battle) {
    if (battle.playerInvul > 0 && battle.kind === "sumo") return;
    const profile = combatProfiles[battle.kind];
    const dx = battle.playerX - battle.bossX;
    const dy = battle.playerY - battle.bossY;
    const dist = Math.hypot(dx, dy) || 1;
    const nx = dx / dist;
    const ny = dy / dist;
    const speed = bossSpeed(battle);

    if (battle.kind === "sumo") {
      if (dist > 150) {
        battle.bossX += nx * speed * dt;
        battle.bossY += ny * speed * dt * 0.4;
      } else {
        battle.bossX -= nx * 18 * dt;
        battle.bossY -= ny * 10 * dt;
      }
    } else if (battle.kind === "sword") {
      battle.bossX += nx * speed * dt + Math.sin(battle.step * 5) * 55 * dt;
      battle.bossY += ny * speed * dt;
    } else if (battle.kind === "shuriken") {
      const preferred = 360;
      const keepAway = dist < preferred ? -1 : 0.55;
      battle.bossX += nx * speed * keepAway * dt;
      battle.bossY += (ny * speed * keepAway + Math.sin(battle.step * 4) * 110) * dt;
    } else if (battle.kind === "ninjutsu") {
      battle.bossX += nx * speed * dt + Math.sin(battle.step * 3.4) * 80 * dt;
      battle.bossY += ny * speed * dt + Math.cos(battle.step * 3.1) * 60 * dt;
    } else {
      battle.bossX += nx * speed * dt + Math.sin(battle.step * 2.6) * 90 * dt;
      battle.bossY += ny * speed * dt + Math.cos(battle.step * 3.2) * 120 * dt;
    }

    battle.bossX = clamp(battle.bossX, 420, 1220);
    battle.bossY = clamp(battle.bossY, 290, 635);
    battle.bossCooldown -= dt * battlePressure(battle);

    if ((battle.kind === "shuriken" || battle.kind === "ninjutsu" || battle.kind === "air" || battle.kind === "final") && battle.bossCooldown <= 0) {
      battle.bossAttack = profile?.bossAttackTime || 0.36;
      spawnBossAttack(battle, nx, ny);
      battle.bossCooldown = bossCooldown(battle, profile?.cooldown || (battle.kind === "final" ? 0.85 : 1.15));
      battle.message = "BOSS 出招，快閃避！";
      return;
    }

    const bodyRange = battle.kind === "sumo" ? 154 : battle.kind === "sword" ? 128 : battle.kind === "air" ? 112 : 96;
    if (dist < bodyRange && battle.bossCooldown <= 0) {
      battle.bossAttack = battle.kind === "sumo" ? 0.58 : profile?.bossAttackTime || 0.28;
      damageBattle(battle.kind === "sumo" ? "被 BOSS 推撞！先拉開距離再反推。" : "被 BOSS 近身打中！");
      battle.playerX = clamp(battle.playerX + nx * (battle.kind === "sumo" ? 92 : 70), 290, 1240);
      battle.playerY = clamp(battle.playerY + ny * (battle.kind === "sumo" ? 38 : 50), 300, 640);
      battle.bossCooldown = bossCooldown(battle, battle.kind === "sumo" ? 2.35 : profile?.cooldown || 0.95);
    }
  }

  function bossSpeed(battle) {
    const base = battle.kind === "sumo" ? 48 : combatProfiles[battle.kind]?.speed || 210;
    return base * battlePressure(battle);
  }

  function battlePressure(battle) {
    const hpPressure = 1 - battle.bossHp / battle.maxBossHp;
    return clamp(1 + hpPressure * 0.78 + battle.rage * 0.1, 1, 2.25);
  }

  function bossCooldown(battle, base) {
    return clamp(base / battlePressure(battle), 0.48, base);
  }

  function battleObstacles(kind) {
    return [];
  }

  function battlePositionBlocked(battle, x, y) {
    return (battle.obstacles || []).some((block) => x >= block.x - 42 && x <= block.x + block.w + 42 && y >= block.y - 54 && y <= block.y + block.h + 34);
  }

  function createSmallBoss(kind) {
    return {
      active: false,
      willAppear: Math.random() < 0.45,
      x: kind === "final" ? 1140 : 1110,
      y: kind === "air" ? 530 : 590,
      scale: kind === "final" ? 0.34 : kind === "sumo" ? 0.26 : 0.28,
      cooldown: 0.9,
      attack: 0,
      hitFlash: 0,
      step: 0
    };
  }

  function activateSmallBoss(battle) {
    if (!battle.smallBoss.willAppear) return;
    if (battle.smallBoss.active) return;
    battle.smallBoss.active = true;
    battle.smallBoss.x = clamp(battle.bossX + (battle.bossX > 780 ? -210 : 210), 430, 1180);
    battle.smallBoss.y = clamp(battle.bossY + 120, 330, 620);
    battle.smallBoss.cooldown = 0.65;
  }

  function updateSmallBoss(dt, battle) {
    const small = battle.smallBoss;
    if (!small?.active) return;
    small.step += dt;
    small.attack = Math.max(0, small.attack - dt);
    small.hitFlash = Math.max(0, small.hitFlash - dt);
    const dx = battle.playerX - small.x;
    const dy = battle.playerY - small.y;
    const dist = Math.hypot(dx, dy) || 1;
    const nx = dx / dist;
    const ny = dy / dist;
    const orbit = battle.kind === "sumo" || battle.kind === "sword" ? 0.5 : 0.75;
    small.x = clamp(small.x + (nx * 80 * orbit + Math.sin(small.step * 3.1) * 70) * dt, 410, 1220);
    small.y = clamp(small.y + (ny * 70 * orbit + Math.cos(small.step * 2.7) * 54) * dt, 315, 630);
    small.cooldown -= dt * battlePressure(battle);
    if (small.cooldown > 0) return;
    small.attack = 0.38;
    spawnSmallBossAttack(battle, small, nx, ny);
    small.cooldown = bossCooldown(battle, battle.kind === "final" ? 1.25 : 1.45);
  }

  function spawnSmallBossAttack(battle, small, nx, ny) {
    playBossHazardSound(battle.kind);
    const kind = battle.kind === "sumo" || battle.kind === "sword" ? "air" : battle.kind === "final" ? "shuriken" : battle.kind;
    const speed = ({ shuriken: 260, ninjutsu: 230, air: 260, final: 320 }[kind] || 250) * battlePressure(battle);
    battle.hazards.push({
      x: small.x + nx * 36,
      y: small.y + ny * 36,
      vx: nx * speed,
      vy: ny * speed,
      r: kind === "ninjutsu" ? 24 : 16,
      life: 2.8,
      kind,
      spin: Math.random() * Math.PI * 2
    });
  }

  function spawnBossAttack(battle, nx, ny) {
    if (battle.kind === "shuriken") {
      for (const angle of [-0.24, 0, 0.24]) {
        const dir = rotateVector(nx, ny, angle);
        spawnBossHazard(battle, dir.x, dir.y, { kind: "shuriken" });
      }
      return;
    }
    if (battle.kind === "ninjutsu") {
      spawnBossHazard(battle, nx, ny, { kind: "ninjutsu" });
      spawnDangerZone(battle, battle.playerX + nx * 80, battle.playerY + ny * 45, 118, 0.72, 0.8, "fire", "被火球爆風擊中！");
      return;
    }
    if (battle.kind === "air") {
      spawnBossHazard(battle, nx, ny, { kind: "air" });
      spawnDangerZone(battle, 768, battle.playerY, 0, 0.48, 0.75, "wind", "被疾風氣流捲中！", { w: 930, h: 54 });
      return;
    }
    if (battle.kind === "final") {
      const pattern = Math.floor(Math.random() * 3);
      if (pattern === 0) {
        for (const angle of [-0.22, 0.22]) {
          const dir = rotateVector(nx, ny, angle);
          spawnBossHazard(battle, dir.x, dir.y, { kind: "final", speed: 360 });
        }
      } else if (pattern === 1) {
        spawnBossHazard(battle, nx, ny, { kind: "ninjutsu", speed: 250, radius: 30 });
        spawnDangerZone(battle, battle.playerX, battle.playerY, 124, 0.65, 0.8, "fire", "被魔卷術式擊中！");
      } else {
        for (const angle of [-0.28, 0, 0.28]) {
          const dir = rotateVector(nx, ny, angle);
          spawnBossHazard(battle, dir.x, dir.y, { kind: "shuriken", speed: 300 });
        }
      }
      return;
    }
    spawnBossHazard(battle, nx, ny);
  }

  function spawnBossHazard(battle, nx, ny, options = {}) {
    playBossHazardSound(battle.kind);
    const kind = options.kind || battle.kind;
    const speed = (options.speed || { shuriken: 230, ninjutsu: 210, air: 245, final: 330 }[kind] || 240) * battlePressure(battle);
    const radius = options.radius || { shuriken: 18, ninjutsu: 28, air: 24, final: 18 }[kind] || 24;
    battle.hazards.push({
      x: battle.bossX + nx * 54,
      y: battle.bossY + ny * 54,
      vx: nx * speed,
      vy: ny * speed,
      r: radius,
      life: kind === "shuriken" ? 4.2 : kind === "final" ? 3.2 : 2.1,
      kind,
      spin: Math.random() * Math.PI * 2
    });
  }

  function rotateVector(x, y, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return { x: x * cos - y * sin, y: x * sin + y * cos };
  }

  function updateOpeningDodge(dt, battle) {
    battle.openingSpawn -= dt * battlePressure(battle);
    if (battle.openingSpawn > 0) return;
    const dx = battle.playerX - battle.bossX;
    const dy = battle.playerY - battle.bossY;
    const len = Math.hypot(dx, dy) || 1;
    const nx = dx / len;
    const ny = dy / len;
    if (battle.kind !== "sumo" && battle.kind !== "sword") spawnBossAttack(battle, nx, ny);
    if (battle.kind === "sumo" || battle.kind === "sword") {
      spawnDangerZone(battle, battle.playerX, battle.playerY, battle.kind === "sumo" ? 112 : 88, 0.52, 0.55, battle.kind === "sumo" ? "slam" : "slash", battle.kind === "sumo" ? "被相撲震地擊中！" : "被劍氣斬中！");
    }
    battle.openingSpawn = battle.kind === "final" ? 0.62 : 0.82;
  }

  function spawnDangerZone(battle, x, y, radius, delay, life, kind, message, rect = null) {
    return;
  }

  function updateDangerZones(dt, battle) {
    for (const zone of battle.dangerZones) {
      if (zone.delay > 0) {
        zone.delay -= dt;
        continue;
      }
      zone.life -= dt;
      zone.hitCooldown = Math.max(0, zone.hitCooldown - dt);
      if (zone.hitCooldown <= 0 && playerInDangerZone(battle, zone)) {
        zone.hitCooldown = 0.8;
        damageBattle(zone.message || "踏入危險區域！");
        if (!state.battle) return;
      }
    }
    battle.dangerZones = battle.dangerZones.filter((zone) => zone.delay > 0 || zone.life > 0);
  }

  function playerInDangerZone(battle, zone) {
    if (zone.w && zone.h) {
      return battle.playerX >= zone.x - zone.w / 2 && battle.playerX <= zone.x + zone.w / 2 && battle.playerY >= zone.y - zone.h / 2 && battle.playerY <= zone.y + zone.h / 2;
    }
    return distance(battle.playerX, battle.playerY, zone.x, zone.y) <= zone.r + 34;
  }

  function spawnPlayerShuriken(battle, dx, dy) {
    const len = Math.hypot(dx, dy) || 1;
    const nx = dx / len;
    const ny = dy / len;
    battle.playerShots.push({
      x: battle.playerX + nx * 62,
      y: battle.playerY + ny * 34 - 8,
      vx: nx * 520,
      vy: ny * 520,
      r: 22,
      life: 3.4,
      kind: "shuriken",
      spin: Math.random() * Math.PI * 2,
      done: false
    });
  }

  function spawnPlayerBlowDart(battle, dx, dy) {
    const len = Math.hypot(dx, dy) || 1;
    const nx = dx / len;
    const ny = dy / len;
    battle.playerShots.push({
      x: battle.playerX + nx * 72,
      y: battle.playerY + ny * 30 - 8,
      vx: nx * 560,
      vy: ny * 560,
      r: 16,
      life: 3.1,
      kind: "blowdart",
      spin: Math.random() * Math.PI * 2,
      done: false
    });
  }

  function updatePlayerShots(dt, battle) {
    for (const shot of battle.playerShots) {
      shot.x += shot.vx * dt;
      shot.y += shot.vy * dt;
      shot.life -= dt;
      if (!shot.done && distance(shot.x, shot.y, battle.bossX, battle.bossY) <= shot.r + 72) {
        shot.done = true;
        battle.impactX = shot.x;
        battle.impactY = shot.y;
        hitBoss(shot.kind === "blowdart" ? "吹箭命中魔卷！" : "飛鏢命中 BOSS！");
        if (!state.battle) return;
      }
    }
    battle.playerShots = battle.playerShots.filter((shot) => !shot.done && shot.life > 0 && shot.x > -160 && shot.x < 1540 && shot.y > 130 && shot.y < 760);
  }

  function updateBattleHazards(dt, battle) {
    for (const shot of battle.hazards) {
      shot.x += shot.vx * dt;
      shot.y += shot.vy * dt;
      shot.life -= dt;
      if (distance(shot.x, shot.y, battle.playerX, battle.playerY) <= shot.r + 38) {
        shot.life = 0;
        damageBattle("被 BOSS 招式擊中！", shot.x, shot.y);
      }
    }
    battle.hazards = battle.hazards.filter((shot) => shot.life > 0 && shot.x > 180 && shot.x < 1360 && shot.y > 190 && shot.y < 730);
  }

  function hitBoss(message) {
    const battle = state.battle;
    playBattleHitSound(battle.kind);
    battle.bossHp -= 1;
    const smallBossJoined = battle.maxBossHp - battle.bossHp >= battle.maxBossHp / 2 && !battle.smallBoss.active;
    if (smallBossJoined) activateSmallBoss(battle);
    battle.bossHitFlash = battle.kind === "sumo" ? 0.42 : 0.25;
    battle.impact = 0.38;
    battle.impactX = battle.impactX ?? battle.bossX;
    battle.impactY = battle.impactY ?? battle.bossY - 26;
    battle.pushWave = 0.42;
    battle.message = message;
    const dx = battle.bossX - battle.playerX;
    const dy = battle.bossY - battle.playerY;
    const len = Math.hypot(dx, dy) || 1;
    const push = battle.kind === "sumo" ? 150 : 82;
    battle.bossX = clamp(battle.bossX + (dx / len) * push, 420, 1220);
    battle.bossY = clamp(battle.bossY + (dy / len) * (battle.kind === "sumo" ? 62 : 54), 290, 635);
    if (battle.bossHp <= 0) winBattle();
  }

  function damageBattle(message, impactX = null, impactY = null) {
    const battle = state.battle;
    if (battle.playerInvul > 0) return;
    playPlayerHitSound(battle.kind);
    battle.playerHp -= 1;
    state.hp = Math.max(1, state.hp - 1);
    const penaltyMessage = punishBattleMistake(battle);
    battle.message = penaltyMessage ? `${message} ${penaltyMessage}` : message;
    battle.playerInvul = battle.kind === "sumo" ? 2.1 : battle.kind === "final" ? 2 : 1.8;
    battle.playerHitFlash = 0.5;
    battle.impact = 0.32;
    battle.impactX = impactX ?? battle.playerX;
    battle.impactY = impactY ?? battle.playerY - 24;
    if (battle.playerHp <= 0) loseBattle("失血過多，闖關失敗。");
  }

  function punishBattleMistake(battle) {
    battle.mistakes += 1;
    battle.rage = clamp(battle.rage + 0.75, 0, 8);
    if (battle.mistakes % 2 === 0 && battle.bossHp > 0 && battle.bossHp < battle.maxBossHp) {
      battle.bossHp += 1;
      return "BOSS 恢復 1 格 HP，攻擊加速！";
    }
    return "BOSS 攻擊加速！";
  }

  function winBattle() {
    if (state.currentGate?.id !== "boss") playRandomSound(["victory1", "victory2"], 0.9);
    const progress = state.roomProgress[roomId()];
    progress.boss = state.currentRoom.bossQuestions;
    state.mode = "room";
    state.battle = null;
    finishAnswer();
  }

  function loseBattle(reason) {
    playSound("defeated", 0.9);
    const progress = state.roomProgress[roomId()];
    progress.training = 0;
    progress.boss = 0;
    for (const treasure of state.currentRoom.treasures || []) state.completedObjects.delete(treasure.id);
    if (state.runner) {
      state.runner.training = 0;
      state.runner.items = [];
      state.runner.bossVisible = false;
      state.runner.pendingSlash = null;
      state.runner.slash = 0;
      state.runner.message = "重新尋找飛卷";
    }
    state.mode = "room";
    state.battle = null;
    flashDialogue(`${reason} 需要重新完成本關寶物題，再挑戰 BOSS。`, "重新修行");
  }

  function drawBattle() {
    const battle = state.battle;
    if (!battle) return;
    ctx.save();
    ctx.fillStyle = "rgba(5, 8, 8, .62)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(18, 22, 18, .9)";
    roundRect(170, 104, 1196, 650, 10);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 232, 181, .52)";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "#fff4ce";
    ctx.font = "800 36px Microsoft JhengHei, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${state.currentRoom.bossName} 對戰`, canvas.width / 2, 158);
    ctx.font = "700 24px Microsoft JhengHei, sans-serif";
    ctx.fillStyle = "#ffe0a0";
    ctx.fillText(battle.message, canvas.width / 2, 202);

    drawBattleMeters();
    drawBattleScene();
    ctx.restore();
  }

  function drawBattleMeters() {
    const battle = state.battle;
    drawBar(250, 230, 390, 28, battle.playerHp / battle.maxPlayerHp, "#76e08a", `玩家 HP ${battle.playerHp}`);
    drawBar(896, 230, 390, 28, battle.bossHp / battle.maxBossHp, "#ff7777", `BOSS ${battle.bossHp}`);
    drawBar(520, 690, 496, 24, battle.time / (battle.maxTime || 28), "#f2cf63", `時間 ${Math.ceil(battle.time)}`);
  }

  function drawBattleScene() {
    const battle = state.battle;
    drawArenaFloor();
    drawBattleObstacles(battle);
    drawBattleHazards(battle);
    drawPlayerProjectiles(battle);
    drawPressureShadow(battle.bossX, battle.bossY, battle.bossScale);
    if (battle.bossAttack > 0) drawBossShockwave(battle.bossX, battle.bossY, battle.bossAttack);
    if (battle.kind === "sumo") drawSumoContactEffects(battle);
    else if (combatProfiles[battle.kind]) drawCombatContactEffects(battle);
    if (battle.kind === "sumo") {
      drawSumoActors(battle);
    } else if (combatProfiles[battle.kind]) {
      drawCombatActors(battle);
    } else {
      ctx.save();
      ctx.globalAlpha = battle.bossHitFlash > 0 ? 0.65 : 1;
      if (battle.bossHitFlash > 0) ctx.filter = "brightness(1.8)";
      drawBossCell(state.currentRoom.bossCell, battle.bossX, battle.bossY, battle.bossScale);
      ctx.restore();

      if (battle.playerInvul > 0) ctx.globalAlpha = 0.55 + Math.sin(performance.now() / 45) * 0.25;
      drawPlayerAt(
        battle.playerX + (battle.playerHitFlash > 0 ? Math.sin(performance.now() / 28) * 8 : 0),
        battle.playerY,
        battle.kind === "air" || battle.kind === "final" ? 120 : 112,
        state.dir
      );
      ctx.globalAlpha = 1;
    }

    drawSmallBoss(battle);

    if (battle.playerAttack > 0) {
      const slash = attackPoint(battle);
      if (battle.kind === "sumo") drawPalmImpact(slash.x, slash.y, 1.35);
      else if (combatProfiles[battle.kind]) drawCombatAttackFx(battle, slash.x, slash.y);
      else drawSlashEffect(slash.x, slash.y, 1.08);
    }

    ctx.fillStyle = "#fff4ce";
    ctx.font = "700 22px Microsoft JhengHei, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("方向鍵走位閃招，面向 BOSS 按 A 攻擊", canvas.width / 2, 668);
  }

  function drawArenaFloor() {
    ctx.save();
    ctx.fillStyle = "rgba(246, 213, 139, .08)";
    roundRect(270, 286, 1000, 370, 12);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 232, 181, .32)";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.strokeStyle = "rgba(255, 232, 181, .12)";
    for (let x = 330; x < 1230; x += 90) {
      ctx.beginPath();
      ctx.moveTo(x, 302);
      ctx.lineTo(x, 640);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawBattleObstacles(battle) {
    if (!battle.obstacles?.length) return;
    ctx.save();
    for (const block of battle.obstacles) {
      const cx = block.x + block.w / 2;
      const cy = block.y + block.h / 2;
      ctx.fillStyle = "rgba(0, 0, 0, .28)";
      ctx.beginPath();
      ctx.ellipse(cx, block.y + block.h + 10, block.w * 0.58, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      const grd = ctx.createLinearGradient(block.x, block.y, block.x, block.y + block.h);
      grd.addColorStop(0, "rgba(124, 92, 58, .94)");
      grd.addColorStop(1, "rgba(58, 47, 37, .96)");
      ctx.fillStyle = grd;
      roundRect(block.x, block.y, block.w, block.h, 8);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 232, 181, .42)";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = "rgba(255, 232, 181, .18)";
      ctx.fillRect(block.x + 10, block.y + 10, Math.max(8, block.w - 20), 8);
    }
    ctx.restore();
  }

  function drawSmallBoss(battle) {
    const small = battle.smallBoss;
    if (!small?.active) return;
    drawPressureShadow(small.x, small.y, small.scale * 0.92);
    if (small.attack > 0) drawBossShockwave(small.x, small.y, small.attack);
    const bossOnRight = small.x >= battle.playerX;
    const frame =
      small.attack > 0
        ? Math.min(3, Math.floor((1 - clamp(small.attack / 0.38, 0, 1)) * 4))
        : Math.floor(small.step * 5) % 2;
    ctx.save();
    ctx.globalAlpha = small.hitFlash > 0 ? 0.72 : 0.92;
    if (small.hitFlash > 0) ctx.filter = "brightness(1.8)";
    if (battle.kind === "sumo") {
      drawSpriteSheetFrame(assets.sumoBoss, 4, 1, frame, small.x, small.y - 12, small.scale, !bossOnRight);
    } else if (combatProfiles[battle.kind]) {
      drawSpriteSheetFrame(assets[combatProfiles[battle.kind].bossAsset], 4, 1, frame, small.x, small.y - 8, small.scale, !bossOnRight);
    } else {
      drawBossCell(state.currentRoom.bossCell, small.x, small.y, small.scale);
    }
    ctx.restore();
    ctx.save();
    ctx.fillStyle = "#ffe0a0";
    ctx.font = "800 22px Microsoft JhengHei, sans-serif";
    ctx.textAlign = "center";
    ctx.lineWidth = 5;
    ctx.strokeStyle = "rgba(0,0,0,.7)";
    ctx.restore();
  }

  function drawDangerZones(battle) {
    if (!battle.dangerZones?.length) return;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (const zone of battle.dangerZones) {
      const warning = zone.delay > 0;
      const alpha = warning ? 0.32 + Math.sin(performance.now() / 65) * 0.12 : 0.55;
      ctx.fillStyle = `rgba(255, 58, 58, ${alpha})`;
      ctx.strokeStyle = warning ? "rgba(255, 230, 130, .82)" : "rgba(255, 80, 64, .9)";
      ctx.lineWidth = warning ? 4 : 6;
      if (zone.w && zone.h) {
        roundRect(zone.x - zone.w / 2, zone.y - zone.h / 2, zone.w, zone.h, 10);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(zone.x, zone.y, zone.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawBattleHazards(battle) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (const shot of battle.hazards) {
      if (drawCombatProjectile(shot)) continue;
      const grd = ctx.createRadialGradient(shot.x, shot.y, 2, shot.x, shot.y, shot.r);
      grd.addColorStop(0, "rgba(255,255,210,.95)");
      grd.addColorStop(1, "rgba(74,190,255,.12)");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(shot.x, shot.y, shot.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawBossShockwave(x, y, attack) {
    ctx.save();
    ctx.strokeStyle = "rgba(255, 98, 70, .78)";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(x, y, 120 * (1 - attack), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawSumoContactEffects(battle) {
    const near = distance(battle.playerX, battle.playerY, battle.bossX, battle.bossY) < 190;
    ctx.save();
    if (near) {
      ctx.strokeStyle = "rgba(255, 221, 126, .72)";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo((battle.playerX + battle.bossX) / 2 - 34, (battle.playerY + battle.bossY) / 2 - 30);
      ctx.lineTo((battle.playerX + battle.bossX) / 2 + 34, (battle.playerY + battle.bossY) / 2 + 30);
      ctx.moveTo((battle.playerX + battle.bossX) / 2 + 34, (battle.playerY + battle.bossY) / 2 - 30);
      ctx.lineTo((battle.playerX + battle.bossX) / 2 - 34, (battle.playerY + battle.bossY) / 2 + 30);
      ctx.stroke();
    }
    if (battle.impact > 0) {
      const impactFrame = Math.min(3, Math.floor((1 - clamp(battle.impact / 0.38, 0, 1)) * 4));
      drawSumoImpactSprite((battle.playerX + battle.bossX) / 2, (battle.playerY + battle.bossY) / 2 - 28, impactFrame, 0.44);
      const r = (1 - battle.impact / 0.42) * 90 + 32;
      ctx.strokeStyle = "rgba(255, 245, 170, .9)";
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc((battle.playerX + battle.bossX) / 2, (battle.playerY + battle.bossY) / 2, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(220, 190, 120, .26)";
    for (let i = 0; i < 5; i++) {
      const x = battle.playerX + 60 + i * 35 + Math.sin(performance.now() / 120 + i) * 10;
      ctx.beginPath();
      ctx.ellipse(x, battle.playerY + 58, 28, 9, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    if (battle.startDelay > 0) {
      ctx.fillStyle = "rgba(0,0,0,.45)";
      ctx.beginPath();
      ctx.arc(canvas.width / 2, 420, 86, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff1a8";
      ctx.font = "900 78px Microsoft JhengHei, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(Math.ceil(battle.startDelay), canvas.width / 2, 448);
    }
    ctx.restore();
  }

  function drawSumoActors(battle) {
    const bossOnRight = battle.bossX >= battle.playerX;
    const hitShake = battle.playerHitFlash > 0 ? Math.sin(performance.now() / 24) * 9 : 0;
    const playerPush = battle.playerAttack > 0 ? (1 - clamp(battle.playerAttack / 0.38, 0, 1)) * 34 : 0;
    const bossPush = battle.bossAttack > 0 ? (1 - clamp(battle.bossAttack / 0.58, 0, 1)) * 30 : 0;

    ctx.save();
    ctx.globalAlpha = battle.bossHitFlash > 0 ? 0.7 : 1;
    if (battle.bossHitFlash > 0) ctx.filter = "brightness(1.9)";
    drawSpriteSheetFrame(
      assets.sumoBoss,
      4,
      1,
      sumoBossFrame(battle),
      battle.bossX + (bossOnRight ? -bossPush : bossPush),
      battle.bossY - 16,
      0.46 + Math.sin(battle.step * 7) * 0.008,
      !bossOnRight
    );
    ctx.restore();

    ctx.save();
    if (battle.playerInvul > 0) ctx.globalAlpha = 0.55 + Math.sin(performance.now() / 45) * 0.25;
    if (battle.playerHitFlash > 0) ctx.filter = "brightness(1.75)";
    drawSpriteSheetFrame(
      assets.sumoPlayer,
      4,
      1,
      sumoPlayerFrame(battle),
      battle.playerX + (bossOnRight ? playerPush : -playerPush) + hitShake,
      battle.playerY - 10,
      0.34,
      !bossOnRight
    );
    ctx.restore();
  }

  function sumoPlayerFrame(battle) {
    if (battle.playerAttack > 0) return Math.min(3, Math.floor((1 - clamp(battle.playerAttack / 0.38, 0, 1)) * 4));
    if (state.moving) return Math.floor(battle.step * 8) % 2;
    return distance(battle.playerX, battle.playerY, battle.bossX, battle.bossY) < 220 ? 1 : 0;
  }

  function sumoBossFrame(battle) {
    if (battle.bossAttack > 0) return Math.min(3, Math.floor((1 - clamp(battle.bossAttack / 0.58, 0, 1)) * 4));
    if (battle.bossHitFlash > 0) return 3;
    if (battle.startDelay > 0) return Math.floor(battle.step * 3) % 2;
    return distance(battle.playerX, battle.playerY, battle.bossX, battle.bossY) < 250 ? 1 + (Math.floor(battle.step * 5) % 2) : Math.floor(battle.step * 3) % 2;
  }

  function drawSumoImpactSprite(x, y, frame, scale) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.92;
    drawSpriteSheetFrame(assets.sumoImpact, 2, 2, frame, x, y, scale, false);
    ctx.restore();
  }

  function drawCombatActors(battle) {
    const profile = combatProfiles[battle.kind];
    const bossOnRight = battle.bossX >= battle.playerX;
    const bossPush = battle.bossAttack > 0 ? (1 - clamp(battle.bossAttack / profile.bossAttackTime, 0, 1)) * 24 : 0;
    const hitShake = battle.playerHitFlash > 0 ? Math.sin(performance.now() / 24) * 8 : 0;

    ctx.save();
    ctx.globalAlpha = battle.bossHitFlash > 0 ? 0.72 : 1;
    if (battle.bossHitFlash > 0) ctx.filter = "brightness(1.85)";
    drawSpriteSheetFrame(
      assets[profile.bossAsset],
      4,
      1,
      combatBossFrame(battle),
      battle.bossX + (bossOnRight ? -bossPush : bossPush),
      battle.bossY - (battle.kind === "final" ? 10 : 8),
      profile.bossScale,
      !bossOnRight
    );
    ctx.restore();

    ctx.save();
    if (battle.playerInvul > 0) ctx.globalAlpha = 0.55 + Math.sin(performance.now() / 45) * 0.25;
    if (battle.playerHitFlash > 0) ctx.filter = "brightness(1.7)";
    if (battle.playerAttack > 0) {
      const playerAdvance = (1 - clamp(battle.playerAttack / profile.attackTime, 0, 1)) * (battle.kind === "sword" ? 30 : 16);
      if (battle.kind === "final") {
        drawSpriteSheetFrame(
          assets.blowDart,
          4,
          2,
          combatPlayerFrame(battle),
          battle.playerX + (bossOnRight ? playerAdvance : -playerAdvance) + hitShake,
          battle.playerY - 10,
          0.33,
          !bossOnRight
        );
      } else {
        drawSpriteSheetFrame(
          assets.ninjaCombat,
          4,
          2,
          profile.playerRow * 4 + combatPlayerFrame(battle),
          battle.playerX + (bossOnRight ? playerAdvance : -playerAdvance) + hitShake,
          battle.playerY - 10,
          profile.playerScale,
          !bossOnRight
        );
      }
    } else {
      drawPlayerAt(
        battle.playerX + hitShake,
        battle.playerY,
        battle.kind === "air" || battle.kind === "final" ? 118 : 108,
        state.dir
      );
    }
    ctx.restore();
  }

  function combatPlayerFrame(battle) {
    const profile = combatProfiles[battle.kind];
    return Math.min(3, Math.floor((1 - clamp(battle.playerAttack / profile.attackTime, 0, 1)) * 4));
  }

  function combatBossFrame(battle) {
    const profile = combatProfiles[battle.kind];
    if (battle.bossAttack > 0) return Math.min(3, Math.floor((1 - clamp(battle.bossAttack / profile.bossAttackTime, 0, 1)) * 4));
    if (battle.bossHitFlash > 0) return 3;
    if (battle.startDelay > 0) return Math.floor(battle.step * 3) % 2;
    return distance(battle.playerX, battle.playerY, battle.bossX, battle.bossY) < profile.range ? 1 + (Math.floor(battle.step * 4) % 2) : Math.floor(battle.step * 2) % 2;
  }

  function drawCombatContactEffects(battle) {
    const profile = combatProfiles[battle.kind];
    if (battle.impact <= 0) return;
    const t = 1 - clamp(battle.impact / 0.38, 0, 1);
    const x = battle.impactX ?? (battle.playerX + battle.bossX) / 2;
    const y = battle.impactY ?? (battle.playerY + battle.bossY) / 2 - 28;
    if (battle.kind === "shuriken") drawShurikenFxFrame(4 + Math.min(3, Math.floor(t * 4)), x, y, 0.34 + t * 0.08, battle.bossX < battle.playerX);
    else if (battle.kind === "final") drawBlowDartFrame(6 + Math.min(1, Math.floor(t * 2)), x, y, 0.34 + t * 0.08, battle.bossX < battle.playerX);
    else drawCombatFxFrame(profile.hitFx, x, y, 0.42 + t * 0.12, battle.bossX < battle.playerX);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = "rgba(255, 238, 160, .72)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x, y, 38 + t * 62, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawCombatAttackFx(battle, x, y) {
    const profile = combatProfiles[battle.kind];
    const bossOnRight = battle.bossX >= battle.playerX;
    if (battle.kind === "sword") {
      drawNinjaSlashFx(x, y - 16, 0.56, !bossOnRight, 1 - clamp(battle.playerAttack / profile.attackTime, 0, 1));
      return;
    }
    if (battle.kind === "final") {
      drawBlowDartFrame(4 + (Math.floor(performance.now() / 90) % 2), x, y - 10, 0.18, !bossOnRight);
      return;
    }
    const scale = battle.kind === "final" ? 0.32 : battle.kind === "shuriken" ? 0.22 : 0.28;
    if (battle.kind === "shuriken") drawShurikenFxFrame(Math.floor(performance.now() / 80) % 4, x, y - 10, scale, !bossOnRight);
    else drawCombatFxFrame(profile.hitFx, x, y - 10, scale, !bossOnRight);
  }

  function drawCombatProjectile(shot) {
    if (!combatProfiles[shot.kind]) return false;
    ctx.save();
    ctx.translate(shot.x, shot.y);
    ctx.rotate(Math.atan2(shot.vy, shot.vx) + shot.spin + (performance.now() / 180));
    if (shot.kind === "shuriken") {
      drawShurikenFxFrame(Math.floor(performance.now() / 80 + shot.spin * 2) % 4, 0, 0, 0.2, false);
    } else if (shot.kind === "ninjutsu") {
      ctx.rotate(-shot.spin);
      drawCombatFxFrame(5, 0, 0, 0.18, false);
    } else if (shot.kind === "air") {
      ctx.rotate(-shot.spin);
      drawCombatFxFrame(6, 0, 0, 0.16, false);
    } else if (shot.kind === "final") {
      ctx.rotate(-shot.spin);
      drawBlowDartFrame(4 + (Math.floor(performance.now() / 90 + shot.spin) % 2), 0, 0, 0.18, false);
    }
    ctx.restore();
    return true;
  }

  function drawPlayerProjectiles(battle) {
    if (!battle.playerShots?.length) return;
    ctx.save();
    for (const shot of battle.playerShots) {
      if (shot.kind !== "shuriken" && shot.kind !== "blowdart") continue;
      ctx.save();
      ctx.translate(shot.x, shot.y);
      ctx.rotate(Math.atan2(shot.vy, shot.vx) + shot.spin + performance.now() / 120);
      if (shot.kind === "blowdart") drawBlowDartFrame(4 + (Math.floor(performance.now() / 90) % 2), 0, 0, 0.18, false);
      else drawShurikenFxFrame(Math.floor(performance.now() / 70 + shot.spin * 2) % 4, 0, 0, 0.2, false);
      ctx.restore();
    }
    ctx.restore();
  }

  function drawCombatFxFrame(frame, x, y, scale, flipX) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.9;
    drawSpriteSheetFrame(assets.combatFx, 4, 2, frame, x, y, scale, flipX);
    ctx.restore();
  }

  function drawShurikenFxFrame(frame, x, y, scale, flipX) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.94;
    drawSpriteSheetFrame(assets.shurikenFx, 4, 2, frame, x, y, scale, flipX);
    ctx.restore();
  }

  function drawBlowDartFrame(frame, x, y, scale, flipX) {
    ctx.save();
    ctx.globalCompositeOperation = frame >= 6 ? "lighter" : "source-over";
    ctx.globalAlpha = 0.96;
    drawSpriteSheetFrame(assets.blowDart, 4, 2, frame, x, y, scale, flipX);
    ctx.restore();
  }

  function drawNinjaSlashFx(x, y, scale, flipX, progress = 0) {
    const frame = Math.max(0, Math.min(3, Math.floor(progress * 4)));
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.96;
    drawSpriteSheetFrame(assets.slashFx, 4, 1, frame, x, y, scale, flipX);
    ctx.restore();
  }

  function drawRunnerSlashFx(x, y, scale, flipX, progress = 0) {
    const frame = Math.max(0, Math.min(3, Math.floor(clamp(progress, 0, 0.999) * 4)));
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.98;
    drawSpriteSheetFrame(assets.runnerSlashFx, 4, 1, frame, x, y, scale, flipX);
    ctx.restore();
  }

  function drawSpriteSheetFrame(image, cols, rows, frame, x, y, scale, flipX) {
    if (!image || !image.width || !image.height) return;
    const sw = image.width / cols;
    const sh = image.height / rows;
    const safeFrame = Math.max(0, Math.min(cols * rows - 1, frame));
    const sx = (safeFrame % cols) * sw;
    const sy = Math.floor(safeFrame / cols) * sh;
    const dw = sw * scale;
    const dh = sh * scale;
    ctx.save();
    ctx.translate(x, y);
    if (flipX) ctx.scale(-1, 1);
    ctx.drawImage(image, sx, sy, sw, sh, -dw / 2, -dh / 2, dw, dh);
    ctx.restore();
  }

  function drawPalmImpact(x, y, scale) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const battle = state.battle;
    const frame = battle?.playerAttack > 0 ? Math.min(3, Math.floor((1 - clamp(battle.playerAttack / 0.38, 0, 1)) * 4)) : Math.floor(performance.now() / 80) % 4;
    drawSpriteSheetFrame(assets.sumoPushFx, 4, 1, frame, x, y - 10, 0.32 * scale, state.dir === "left");
    ctx.restore();
  }

  function attackPoint(battle) {
    const reach = 86;
    const map = {
      right: { x: reach, y: -8 },
      left: { x: -reach, y: -8 },
      up: { x: 0, y: -reach },
      down: { x: 0, y: reach }
    };
    const offset = map[state.dir] || map.right;
    return { x: battle.playerX + offset.x, y: battle.playerY + offset.y };
  }

  function drawPlayerAt(x, y, size, dir) {
    const row = dirRows[dir] ?? 2;
    const col = Math.floor(state.frame) % 4;
    const sw = assets.ninja.width / 4;
    const sh = assets.ninja.height / 4;
    ctx.drawImage(assets.ninja, col * sw, row * sh, sw, sh, x - size / 2, y - size / 2, size, size);
  }

  function drawPressureShadow(x, y, scale) {
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, .34)";
    ctx.beginPath();
    ctx.ellipse(x, y + 118 * scale, 190 * scale, 48 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 100, 72, .42)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(x, y, 205 * scale + Math.sin(performance.now() / 120) * 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawSpeedLines(x, y) {
    ctx.save();
    ctx.strokeStyle = "rgba(255, 240, 180, .72)";
    ctx.lineWidth = 4;
    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      ctx.moveTo(x - 120 - i * 18, y - 84 + i * 26);
      ctx.lineTo(x - 34 - i * 10, y - 100 + i * 26);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawBar(x, y, width, height, ratio, color, label) {
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,.46)";
    roundRect(x, y, width, height, 6);
    ctx.fill();
    ctx.fillStyle = color;
    roundRect(x, y, width * clamp(ratio, 0, 1), height, 6);
    ctx.fill();
    ctx.fillStyle = "#fff4ce";
    ctx.font = "700 18px Microsoft JhengHei, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(label, x + width / 2, y + height - 7);
    ctx.restore();
  }

  function battleKind(gateId) {
    return { meaning: "sumo", cloze: "sword", scenario: "shuriken", judge: "ninjutsu", runner: "air", boss: "final" }[gateId] || "sumo";
  }

  function battleRuleText(gateId) {
    return {
      meaning: "相撲試煉：連打 A，把我推出界外；太慢就會被推回去。",
      cloze: "劍術試煉：看準綠色時機按 A，出刀三次命中才算勝利。",
      scenario: "飛鏢試煉：準星靠近中央時按 A，命中三次才算勝利。",
      judge: "忍術試煉：照提示方向擋招，能量滿時按 A 反擊。",
      runner: "空中試煉：上下飛行，與我同高度時按 A 斬擊。",
      boss: "最終試煉：忍者吹箭對決，抓準高度發射吹箭封印魔卷。"
    }[gateId] || "按 A 對戰，HP 歸零就要重新修行。";
  }

  function dirName(dir) {
    return { up: "上", down: "下", left: "左", right: "右" }[dir] || dir;
  }

  function drawExitDoor() {
    const exit = state.currentRoom.exit;
    drawBossCell("portal", exit.x, exit.y, 0.16);
    drawLabel(exit.label, exit.x + 90, exit.y + 8, true);
  }

  function drawPlayer(size) {
    const row = dirRows[state.dir] ?? 0;
    const col = state.moving ? Math.floor(state.frame) % 4 : 0;
    const sw = assets.ninja.width / 4;
    const sh = assets.ninja.height / 4;
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,.28)";
    ctx.beginPath();
    ctx.ellipse(state.x, state.y + 8, size * 0.25, size * 0.09, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.translate(state.x, state.y - size * 0.38);
    ctx.shadowColor = "rgba(0,0,0,.38)";
    ctx.shadowBlur = 12;
    ctx.drawImage(assets.ninja, col * sw, row * sh, sw, sh, -size / 2, -size / 2, size, size);
    ctx.restore();
  }

  function drawFlyingPlayer() {
    const size = 98;
    const row = dirRows[state.dir] ?? 2;
    const col = Math.floor(state.frame) % 4;
    const sw = assets.ninja.width / 4;
    const sh = assets.ninja.height / 4;
    ctx.save();
    ctx.translate(state.x, state.y + Math.sin(state.frame * 1.4) * 4);
    ctx.rotate(0.08);
    ctx.shadowColor = "rgba(0,0,0,.4)";
    ctx.shadowBlur = 14;
    ctx.drawImage(assets.ninja, col * sw, row * sh, sw, sh, -size / 2, -size / 2, size, size);
    ctx.restore();
  }

  function drawProp(name, x, y, scale) {
    const cell = MAP_DATA.propCells[name];
    const sw = assets.props.width / 4;
    const sh = assets.props.height / 3;
    ctx.drawImage(assets.props, cell.col * sw, cell.row * sh, sw, sh, x - (sw * scale) / 2, y - (sh * scale) / 2, sw * scale, sh * scale);
  }

  function drawBossCell(name, x, y, scale) {
    const cell = MAP_DATA.bossCells[name];
    const sw = assets.boss.width / 4;
    const sh = assets.boss.height / 3;
    ctx.drawImage(assets.boss, cell.col * sw, cell.row * sh, sw, sh, x - (sw * scale) / 2, y - (sh * scale) / 2, sw * scale, sh * scale);
  }

  function drawSparkle(x, y, color) {
    const r = 14 + Math.sin(performance.now() / 180) * 4;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x - r, y);
    ctx.lineTo(x + r, y);
    ctx.moveTo(x, y - r);
    ctx.lineTo(x, y + r);
    ctx.stroke();
    ctx.restore();
  }

  function drawSlashEffect(x, y, scale) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.translate(x, y);
    ctx.rotate(-0.18);
    drawBossCell("slash", 0, 0, 0.22 * scale);
    ctx.strokeStyle = "rgba(255, 245, 170, .92)";
    ctx.lineWidth = 10 * scale;
    ctx.beginPath();
    ctx.moveTo(-92 * scale, 46 * scale);
    ctx.quadraticCurveTo(14 * scale, -46 * scale, 126 * scale, -78 * scale);
    ctx.stroke();
    ctx.strokeStyle = "rgba(105, 220, 255, .78)";
    ctx.lineWidth = 4 * scale;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(-56 * scale + i * 34 * scale, 64 * scale);
      ctx.lineTo(64 * scale + i * 24 * scale, -70 * scale);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawLock(x, y) {
    ctx.save();
    ctx.fillStyle = "rgba(20, 20, 18, .78)";
    ctx.strokeStyle = "#f2d489";
    ctx.lineWidth = 3;
    roundRect(x - 22, y - 8, 44, 38, 7);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y - 6, 14, Math.PI, 0);
    ctx.stroke();
    ctx.restore();
  }

  function drawHint() {
    const hint = currentHint();
    if (!hint) return;
    ctx.save();
    ctx.font = "700 25px Microsoft JhengHei, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const x = canvas.width / 2;
    const y = 82;
    const width = Math.min(1080, ctx.measureText(hint).width + 56);
    ctx.fillStyle = "rgba(12, 15, 13, .78)";
    ctx.strokeStyle = "rgba(255, 232, 181, .5)";
    roundRect(x - width / 2, y - 28, width, 56, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#fff1c2";
    ctx.fillText(hint, x, y);
    ctx.restore();
  }

  function drawLabel(text, x, y, unlocked) {
    ctx.save();
    ctx.font = "700 24px Microsoft JhengHei, sans-serif";
    ctx.textAlign = "center";
    ctx.lineWidth = 6;
    ctx.strokeStyle = "rgba(0,0,0,.74)";
    ctx.fillStyle = unlocked ? "#fff4ce" : "#c8c4b9";
    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  function updateHud() {
    hudArea.textContent = state.place === "room" ? state.currentRoom.name : nearestGate()?.name || "卷之村";
    statusText.textContent = `語印 ${state.marks.size}/${IDIOMS.length} | HP ${state.hp}/${state.maxHp} | 解鎖 ${state.cleared.size}/6`;
  }

  function currentHint() {
    if (state.mode === "intro") return "";
    if (state.place === "hub") {
      const gate = nearestGate();
      if (!gate) return "靠近門戶按 A 進入關卡";
      if (!isGateUnlocked(gate)) return `${gate.name} 尚未解鎖，先打敗前一關 BOSS`;
      if (state.cleared.has(gate.id)) return `按 A 進入 ${gate.name} 複習`;
      return `按 A 進入 ${gate.name}：${gate.label}`;
    }
    if (state.currentRoom.mode === "runner") {
      if (nearExit()) return "按 A 返回村落";
      const scroll = nearestRunnerScroll();
      if (scroll) return "按 A 用刀劃開飛卷題目";
      if (canChallengeRunnerBoss()) return "靠近疾風忍者按 A 挑戰 BOSS";
      return "上下飛行，吃玉石、躲敵忍，靠近飛卷按 A";
    }
    if (nearExit()) return "按 A 返回村落";
    const treasure = nearestTreasure();
    if (treasure) return state.completedObjects.has(treasure.id) ? "這個寶物已取得" : `按 A 開啟寶物題：${treasure.label}`;
    if (nearBoss()) {
      const progress = state.roomProgress[roomId()];
      if (state.cleared.has(state.currentGate.id)) return "BOSS 已擊敗，可以回村落";
      if (progress.training < state.currentRoom.trainingNeeded) return `先完成 ${state.currentRoom.trainingNeeded} 個寶物題`;
      return `按 A 挑戰 BOSS：${state.currentRoom.bossName}`;
    }
    return "探索場景，先找寶物，再挑戰 BOSS";
  }

  function interact() {
    if (state.mode === "battle") return battleAction();
    if (state.mode === "intro") return;
    if (state.mode === "map") {
      const gate = nearestGate();
      if (!gate) return flashDialogue(currentHint());
      if (!isGateUnlocked(gate)) return flashDialogue(`${gate.name} 還沒解鎖。先打敗前一關 BOSS。`);
      return enterRoom(gate);
    }
    if (state.mode !== "room") return;
    if (nearExit()) returnToHub("已返回村落。");
    if (state.currentRoom.mode === "runner") return interactRunner();

    const treasure = nearestTreasure();
    if (treasure && !state.completedObjects.has(treasure.id)) {
      state.currentObject = treasure;
      return startQuestion(treasure.type, "treasure");
    }
    if (nearBoss()) return talkOrChallengeBoss();
    flashDialogue(currentHint());
  }

  function interactRunner() {
    const runner = state.runner;
    if (runner.pendingSlash) return;
    const scroll = nearestRunnerScroll();
    if (scroll) {
      scroll.done = true;
      state.currentObject = { id: scroll.id, type: "runner" };
      return triggerRunnerSlash({ kind: "scroll", object: state.currentObject });
    }
    if (canChallengeRunnerBoss()) {
      state.currentObject = state.currentRoom.boss;
      return triggerRunnerSlash({ kind: "boss", object: state.currentObject });
    }
    triggerRunnerSlash({ kind: "air" });
  }

  function triggerRunnerSlash(action) {
    const runner = state.runner;
    playSound("runnerSlash", 0.9);
    runner.slash = RUNNER_SLASH_TIME;
    slashRunnerEnemies();
    runner.pendingSlash = { ...action, delay: RUNNER_SLASH_DELAY };
  }

  function resolveRunnerSlash() {
    const runner = state.runner;
    const action = runner.pendingSlash;
    runner.pendingSlash = null;
    if (!action) return;
    if (action.kind !== "air") runner.slash = 0;
    state.currentObject = action.object;
    if (action.kind === "scroll") return startQuestion("runner", "runnerScroll");
    if (action.kind === "boss") {
      return flashDialogue(`${state.currentRoom.bossName}：${battleRuleText(state.currentGate.id)} 勝利後就能取得「${state.currentRoom.reward}」。`, "開始空中戰", startBossBattle);
    }
  }

  function slashRunnerEnemies() {
    const runner = state.runner;
    if (!runner) return 0;
    const slashX = state.x + (state.dir === "left" ? -135 : 150);
    const slashY = state.y - 12;
    let defeated = 0;
    for (const item of runner.items) {
      if (item.done || item.type !== "enemy") continue;
      const inFront =
        state.dir === "left"
          ? item.x < state.x + 35 && item.x > state.x - 285
          : item.x > state.x - 35 && item.x < state.x + 310;
      if (inFront && distance(slashX, slashY, item.x, item.y) < 178) {
        item.done = true;
        defeated += 1;
      }
    }
    if (defeated > 0) {
      playSound("hit", 0.82);
      runner.message = `斬退敵忍 ${defeated}`;
    }
    return defeated;
  }

  function talkOrChallengeBoss() {
    const progress = state.roomProgress[roomId()];
    if (state.cleared.has(state.currentGate.id)) return flashDialogue(`${state.currentRoom.bossName} 已經被擊敗，${state.currentRoom.reward} 已收入背包。`);
    if (progress.training < state.currentRoom.trainingNeeded) {
      return flashDialogue(`${state.currentRoom.bossName}：先拿到 ${state.currentRoom.trainingNeeded} 個寶物，再來挑戰我。`);
    }
    state.currentObject = state.currentRoom.boss;
    flashDialogue(`${state.currentRoom.bossName}：${battleRuleText(state.currentGate.id)} 勝利後就能取得「${state.currentRoom.reward}」。`, "開始 BOSS 戰", startBossBattle);
  }

  function enterRoom(gate) {
    playSound("door", 0.85);
    state.currentGate = gate;
    state.currentRoom = MAP_DATA.rooms[gate.room];
    state.place = "room";
    state.mode = "room";
    state.x = state.currentRoom.spawn.x;
    state.y = state.currentRoom.spawn.y;
    state.dir = "down";
    if (state.currentRoom.mode === "runner") {
      state.dir = "right";
      state.runner = { items: [], spawn: 0.35, time: 0, bgOffset: 0, slash: 0, pendingSlash: null, jade: 0, training: state.roomProgress[gate.room].training, bossVisible: false, message: "尋找飛卷" };
    }
    updateHud();
    flashDialogue(state.currentRoom.intro, "開始探索");
  }

  function startQuestion(type, source) {
    playSound("question", 0.82);
    state.mode = "question";
    runPanel.classList.add("hidden");
    state.pending = buildQuestion(type === "boss" ? randomBossType() : type);
    state.pending.source = source;
    updateHud();
    questionMeta.textContent = `${state.currentRoom.name} | ${labelForSource(source)} | ${labelForType(state.pending.type)}`;
    questionTitle.textContent = state.pending.title;
    questionText.textContent = state.pending.text;
    feedback.textContent = "";
    choiceList.innerHTML = "";
    for (const choice of state.pending.choices) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = choice;
      button.addEventListener("click", () => answerQuestion(choice));
      choiceList.appendChild(button);
    }
    questionPanel.classList.remove("hidden");
  }

  function buildQuestion(type) {
    const item = nextIdiom();
    if (type === "meaning") {
      return { type, idiom: item, answer: item.idiom, title: "看解釋，選出正確成語", text: item.meaning, choices: shuffle([item.idiom, ...distractors(item.idiom, 3)]) };
    }
    if (type === "cloze") {
      return { type, idiom: item, answer: item.missing, title: "補上成語缺字", text: item.cloze, choices: shuffle([item.missing, ...missingDistractors(item.missing, 3)]) };
    }
    if (type === "judge") {
      const correct = Math.random() > 0.5;
      return { type, idiom: item, answer: correct ? "用法正確" : "用法不正確", title: "判斷這句成語用法", text: correct ? item.correctUse : item.wrongUse, choices: ["用法正確", "用法不正確"] };
    }
    return { type: "scenario", idiom: item, answer: item.idiom, title: "選出最適合情境的成語", text: item.scene, choices: shuffle([item.idiom, ...distractors(item.idiom, 3)]) };
  }

  function applyBossQuestionPenalty() {
    if (state.pending?.source !== "boss" && state.pending?.source !== "runnerBoss") return "";
    if (state.battle) {
      state.battle.bossHp = Math.min(state.battle.maxBossHp, state.battle.bossHp + 1);
      state.battle.rage = clamp(state.battle.rage + 1, 0, 8);
    }
    return " BOSS 恢復 1 格 HP，攻擊也變快。";
  }

  function answerQuestion(choice) {
    const ok = choice === state.pending.answer;
    if (!ok) {
      playSound("wrong", 0.9);
      state.hp = Math.max(1, state.hp - 1);
      const hint = state.pending.type === "cloze" ? `提示：缺字是「${state.pending.answer}」。` : "再觀察情境與成語意思。";
      feedback.textContent = `答錯了，${hint}${applyBossQuestionPenalty()}`;
      updateHud();
      return;
    }

    const item = state.pending.idiom;
    playSound("correct", 0.9);
    state.marks.add(item.idiom);
    state.completedObjects.add(state.currentObject?.id || `${state.pending.source}-${item.idiom}`);
    feedback.textContent = `答對了：${item.idiom}。${item.meaning}`;

    const progress = state.roomProgress[roomId()];
    if (state.pending.source === "treasure") progress.training += 1;
    if (state.pending.source === "runnerScroll") {
      progress.training += 1;
      state.runner.training = progress.training;
      state.runner.message = "飛卷已斬開";
    }
    if (state.pending.source === "boss" || state.pending.source === "runnerBoss") progress.boss += 1;

    updateHud();
    setTimeout(finishAnswer, 750);
  }

  function finishAnswer() {
    questionPanel.classList.add("hidden");
    const progress = state.roomProgress[roomId()];
    const bossDefeated = progress.boss >= state.currentRoom.bossQuestions;
    if (bossDefeated && !state.cleared.has(state.currentGate.id)) {
      state.cleared.add(state.currentGate.id);
      if (state.currentGate.id === "boss") {
        state.gameComplete = true;
        playCompletionCheer();
      }
      showSummary(
        state.currentGate.id === "boss" ? "修行成功" : `${state.currentRoom.bossName} 已擊敗`,
        state.currentGate.id === "boss"
          ? `完成全部關卡，語印 ${state.marks.size}/${IDIOMS.length}。你已經破關！`
          : `取得「${state.currentRoom.reward}」。下一個關卡已解鎖。`
      );
      return;
    }
    state.mode = "room";
    if (state.currentRoom.mode === "runner") {
      state.runner.message = progress.training >= state.currentRoom.trainingNeeded ? "BOSS 已出現" : "繼續尋找飛卷";
      return;
    }
    const ready = progress.training >= state.currentRoom.trainingNeeded;
    flashDialogue(ready ? "寶物題完成，現在可以挑戰 BOSS。" : "答對了，再找下一個寶物題。", "繼續探索");
  }

  function showSummary(title, text) {
    state.mode = "summary";
    summaryTitle.textContent = title;
    summaryText.textContent = text;
    summaryButton.textContent = state.gameComplete ? "完成修行" : "返回地圖";
    summaryPanel.classList.toggle("complete", state.gameComplete);
    summaryPanel.classList.remove("hidden");
  }

  function playCompletionCheer() {
    stopBackgroundMusic();
    setTimeout(() => playSound("cheer", 1), 180);
  }

  function closeSummary() {
    summaryPanel.classList.add("hidden");
    summaryPanel.classList.remove("complete");
    returnToHub(state.gameComplete ? "全部修行完成，可以重新進入各關複習。" : "回到村落，下一個門戶已開啟。");
  }

  function returnToHub(message) {
    questionPanel.classList.add("hidden");
    summaryPanel.classList.add("hidden");
    summaryPanel.classList.remove("complete");
    state.place = "hub";
    state.mode = "map";
    const gate = state.currentGate;
    state.x = gate ? gate.x : MAP_DATA.spawn.x;
    state.y = gate ? gate.y + gate.radius + 18 : MAP_DATA.spawn.y;
    state.runner = null;
    state.currentRoom = null;
    state.currentObject = null;
    updateHud();
    flashDialogue(message, "知道了");
  }

  function saveGame() {
    const saved = writeSavedRaw(JSON.stringify(serializeGame()));
    if (saved) {
      notifySave("進度已儲存。下次用同一個瀏覽器開啟時，可以載入這份進度。");
      return;
    }
    notifySave("這個瀏覽器目前無法儲存進度。");
  }

  function resetSavedGame() {
    if (!window.confirm("確定要清空這個瀏覽器裡的遊戲進度嗎？")) return;
    clearSavedRaw();
    window.location.reload();
  }

  function startFreshGame() {
    clearSavedRaw();
    window.location.reload();
  }

  function showSavePrompt(save) {
    pendingSavedGame = save;
    if (dialogueTimer) clearInterval(dialogueTimer);
    dialogueTimer = null;
    dialogue.classList.add("hidden");
    questionPanel.classList.add("hidden");
    summaryPanel.classList.add("hidden");
    savePrompt.classList.remove("hidden");
    state.mode = "intro";
  }

  function loadSavedGame() {
    if (!pendingSavedGame) return;
    const loaded = restoreGame(pendingSavedGame);
    pendingSavedGame = null;
    savePrompt.classList.add("hidden");
    flashDialogue(loaded ? "已載入上次儲存的進度。" : "舊進度無法讀取，已重新開始。", "繼續");
  }

  function readSavedGame() {
    try {
      const raw = readSavedRaw();
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      clearSavedRaw();
      return null;
    }
  }

  function readSavedRaw() {
    try {
      const value = window.localStorage?.getItem(SAVE_KEY);
      if (value) return value;
    } catch (error) {
      // Fall through to cookie fallback.
    }
    try {
      const prefix = `${SAVE_KEY}=`;
      const cookie = document.cookie.split("; ").find((item) => item.startsWith(prefix));
      return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null;
    } catch (error) {
      return null;
    }
  }

  function writeSavedRaw(raw) {
    try {
      window.localStorage?.setItem(SAVE_KEY, raw);
      if (window.localStorage?.getItem(SAVE_KEY) === raw) return true;
    } catch (error) {
      // Fall through to cookie fallback.
    }
    try {
      document.cookie = `${SAVE_KEY}=${encodeURIComponent(raw)}; path=/; max-age=31536000; SameSite=Lax`;
      return document.cookie.includes(`${SAVE_KEY}=`);
    } catch (error) {
      return false;
    }
  }

  function clearSavedRaw() {
    try {
      window.localStorage?.removeItem(SAVE_KEY);
    } catch (error) {
      // Ignore storage restrictions.
    }
    try {
      document.cookie = `${SAVE_KEY}=; path=/; max-age=0; SameSite=Lax`;
    } catch (error) {
      // Ignore cookie restrictions.
    }
  }

  function serializeGame() {
    const currentGateId = state.place === "room" ? state.currentGate?.id || null : null;
    return {
      version: 1,
      savedAt: Date.now(),
      place: state.place,
      currentGateId,
      x: state.x,
      y: state.y,
      dir: state.dir,
      hp: state.hp,
      maxHp: state.maxHp,
      marks: [...state.marks],
      cleared: [...state.cleared],
      completedObjects: [...state.completedObjects],
      roomProgress: Object.fromEntries(
        Object.entries(state.roomProgress).map(([room, progress]) => [
          room,
          { training: progress.training || 0, boss: progress.boss || 0 }
        ])
      ),
      deck: state.deck.filter((index) => IDIOMS[index]),
      gameComplete: state.gameComplete,
      runner: state.runner
        ? { jade: state.runner.jade || 0, training: state.runner.training || 0, bossVisible: !!state.runner.bossVisible }
        : null
    };
  }

  function restoreGame(save) {
    try {
      const gates = MAP_DATA.exits;
      const gate = save.currentGateId ? gates.find((item) => item.id === save.currentGateId) : null;
      const canRestoreRoom = save.place === "room" && gate && MAP_DATA.rooms[gate.room];

      state.place = canRestoreRoom ? "room" : "hub";
      state.currentGate = canRestoreRoom ? gate : null;
      state.currentRoom = canRestoreRoom ? MAP_DATA.rooms[gate.room] : null;
      state.mode = state.place === "room" ? "room" : "map";
      state.x = Number.isFinite(save.x) ? save.x : canRestoreRoom ? state.currentRoom.spawn.x : MAP_DATA.spawn.x;
      state.y = Number.isFinite(save.y) ? save.y : canRestoreRoom ? state.currentRoom.spawn.y : MAP_DATA.spawn.y;
      state.dir = ["up", "down", "left", "right"].includes(save.dir) ? save.dir : "down";
      state.maxHp = Number(save.maxHp) || 5;
      state.hp = clamp(Number(save.hp) || state.maxHp, 1, state.maxHp);
      state.marks = new Set(Array.isArray(save.marks) ? save.marks : []);
      state.cleared = new Set(Array.isArray(save.cleared) ? save.cleared : []);
      state.completedObjects = new Set(Array.isArray(save.completedObjects) ? save.completedObjects : []);
      state.roomProgress = mergeRoomProgress(save.roomProgress);
      state.deck = Array.isArray(save.deck) && save.deck.length ? save.deck.filter((index) => IDIOMS[index]) : shuffle([...IDIOMS.keys()]);
      state.gameComplete = !!save.gameComplete;
      state.currentObject = null;
      state.pending = null;
      state.battle = null;
      state.tapMove = { dx: 0, dy: 0, time: 0 };
      keys.clear();

      if (state.currentRoom?.mode === "runner") {
        const progress = state.roomProgress[gate.room];
        state.runner = {
          items: [],
          spawn: 0.35,
          time: 0,
          bgOffset: 0,
          slash: 0,
          pendingSlash: null,
          jade: save.runner?.jade || 0,
          training: progress.training,
          bossVisible: progress.training >= state.currentRoom.trainingNeeded || !!save.runner?.bossVisible,
          message: progress.training >= state.currentRoom.trainingNeeded ? "BOSS 已出現" : "尋找飛卷"
        };
      } else {
        state.runner = null;
      }

      questionPanel.classList.add("hidden");
      summaryPanel.classList.add("hidden");
      updateHud();
      return true;
    } catch (error) {
      clearSavedRaw();
      window.location.reload();
      return false;
    }
  }

  function mergeRoomProgress(savedProgress) {
    const progress = Object.fromEntries(MAP_DATA.exits.map((gate) => [gate.room, { training: 0, boss: 0 }]));
    if (!savedProgress || typeof savedProgress !== "object") return progress;
    for (const gate of MAP_DATA.exits) {
      const savedRoom = savedProgress[gate.room];
      if (!savedRoom) continue;
      progress[gate.room] = {
        training: Number(savedRoom.training) || 0,
        boss: Number(savedRoom.boss) || 0
      };
    }
    return progress;
  }

  function notifySave(message) {
    updateHud();
    if (state.mode === "question" || state.mode === "battle" || state.mode === "summary") {
      statusText.textContent = `${statusText.textContent} | 已儲存`;
      return;
    }
    flashDialogue(message, "繼續");
  }

  function handleBack() {
    if (state.mode === "question") return;
    if (state.place === "room") returnToHub("已離開關卡，已答對的進度會保留。");
  }

  function flashDialogue(message, buttonText = "知道了", onClose = null) {
    if (dialogueTimer) clearInterval(dialogueTimer);
    dialogueFullText = message;
    dialogueDone = false;
    dialogueOnClose = onClose;
    dialogueText.textContent = "";
    dialogueButton.textContent = "略過";
    dialogue.classList.remove("hidden");

    let index = 0;
    dialogueTimer = setInterval(() => {
      index += 1;
      dialogueText.textContent = dialogueFullText.slice(0, index);
      if (index >= dialogueFullText.length) {
        clearInterval(dialogueTimer);
        dialogueTimer = null;
        dialogueDone = true;
        dialogueButton.textContent = buttonText;
      }
    }, 24);

    dialogueButton.onclick = () => {
      if (!dialogueDone) {
        if (dialogueTimer) clearInterval(dialogueTimer);
        dialogueTimer = null;
        dialogueText.textContent = dialogueFullText;
        dialogueDone = true;
        dialogueButton.textContent = buttonText;
        return;
      }
      dialogue.classList.add("hidden");
      const closeHandler = dialogueOnClose;
      dialogueOnClose = null;
      if (state.mode !== "summary" && state.mode !== "question" && state.mode !== "battle") {
        state.mode = state.place === "hub" ? "map" : "room";
      }
      if (closeHandler) closeHandler();
    };
  }

  function showMission() {
    const next = MAP_DATA.exits.find((gate) => !state.cleared.has(gate.id));
    flashDialogue(`目前語印 ${state.marks.size}/${IDIOMS.length}，已解鎖 ${state.cleared.size}/6。下一個目標：${next ? next.name : "全部完成"}。A 是互動或挑戰；B 在房間中會回到村落。`);
  }

  function nearestGate() {
    return MAP_DATA.exits.find((gate) => distance(state.x, state.y, gate.x, gate.y) <= gate.radius);
  }

  function isGateUnlocked(gate) {
    return state.cleared.size >= gate.requiredClears || state.cleared.has(gate.id);
  }

  function nearestTreasure() {
    return state.currentRoom.treasures.find((item) => distance(state.x, state.y, item.x, item.y) <= item.radius);
  }

  function nearBoss() {
    const boss = state.currentRoom.boss;
    return distance(state.x, state.y, boss.x, boss.y) <= boss.radius;
  }

  function nearExit() {
    const exit = state.currentRoom.exit;
    return distance(state.x, state.y, exit.x, exit.y) <= exit.radius;
  }

  function nearestRunnerScroll() {
    if (!state.runner) return null;
    return state.runner.items.find((item) => item.type === "scroll" && distance(state.x + 70, state.y, item.x, item.y) < 125);
  }

  function canChallengeRunnerBoss() {
    if (!state.runner || !state.runner.bossVisible) return false;
    return distance(state.x, state.y, state.currentRoom.boss.x, 420) < 980;
  }

  function hitsBlocker(x, y) {
    const blockers = state.currentRoom?.blockers || [];
    return blockers.some((blocker) => x >= blocker.x && x <= blocker.x + blocker.w && y >= blocker.y && y <= blocker.y + blocker.h);
  }

  function roomId() {
    return state.currentGate.room;
  }

  function nextIdiom() {
    if (!state.deck.length) state.deck = shuffle([...IDIOMS.keys()]);
    let index = state.deck.shift();
    let guard = 0;
    while (state.marks.has(IDIOMS[index].idiom) && guard < IDIOMS.length) {
      state.deck.push(index);
      index = state.deck.shift();
      guard += 1;
    }
    return IDIOMS[index];
  }

  function distractors(answer, count) {
    return shuffle(IDIOMS.map((item) => item.idiom).filter((idiom) => idiom !== answer)).slice(0, count);
  }

  function missingDistractors(answer, count) {
    return shuffle([...new Set(IDIOMS.map((item) => item.missing).filter((char) => char !== answer))]).slice(0, count);
  }

  function randomBossType() {
    return shuffle(["meaning", "cloze", "scenario", "judge"])[0];
  }

  function labelForType(type) {
    return { meaning: "解釋選成語", cloze: "成語填空", scenario: "情境選成語", judge: "用法判斷", runner: "飛行斬卷" }[type] || "混合題";
  }

  function labelForSource(source) {
    return { treasure: "寶物題", boss: "BOSS 戰", runnerScroll: "飛卷題", runnerBoss: "疾風 BOSS 戰" }[source] || "題目";
  }

  function shuffle(values) {
    const copy = [...values];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function distance(ax, ay, bx, by) {
    return Math.hypot(ax - bx, ay - by);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function roundRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
  }

})();
