window.MAP_DATA = {
  width: 1536,
  height: 864,
  spawn: { x: 768, y: 610 },
  exits: [
    { id: "meaning", room: "study", name: "神社書堂", type: "meaning", label: "解釋選成語", x: 770, y: 505, radius: 92, requiredClears: 0 },
    { id: "cloze", room: "bamboo", name: "竹林小徑", type: "cloze", label: "成語填空", x: 255, y: 525, radius: 96, requiredClears: 1 },
    { id: "scenario", room: "market", name: "市集祭典", type: "scenario", label: "情境選成語", x: 1208, y: 545, radius: 112, requiredClears: 2 },
    { id: "judge", room: "mountain", name: "山道困局", type: "judge", label: "判斷用法", x: 442, y: 190, radius: 88, requiredClears: 3 },
    { id: "runner", room: "forest", name: "飛卷竹林", type: "runner", label: "飛行斬卷", x: 1238, y: 250, radius: 98, requiredClears: 4 },
    { id: "boss", room: "boss", name: "成語魔卷", type: "boss", label: "最終混合題", x: 768, y: 180, radius: 110, requiredClears: 5 }
  ],
  rooms: {
    study: {
      name: "神社書堂",
      bossName: "書堂卷僧",
      reward: "書堂玉印",
      atlas: { col: 0, row: 0 },
      bossCell: "scrollMonk",
      mode: "topdown",
      spawn: { x: 768, y: 650 },
      exit: { x: 768, y: 790, radius: 72, label: "回村落" },
      intro: "書堂卷僧守著第一枚玉印。先打開兩個寶物題，收集足夠語力，再向 BOSS 挑戰。",
      trainingNeeded: 2,
      bossQuestions: 1,
      treasures: [
        { id: "study-scroll", prop: "questionScroll", x: 455, y: 445, radius: 78, label: "發光卷軸", type: "meaning" },
        { id: "study-book", prop: "bookPedestal", x: 965, y: 430, radius: 78, label: "石臺古書", type: "meaning" }
      ],
      boss: { id: "study-boss", x: 768, y: 340, radius: 112, label: "書堂卷僧", type: "meaning" },
      blockers: [
        { x: 0, y: 0, w: 1536, h: 145 },
        { x: 0, y: 0, w: 250, h: 864 },
        { x: 1286, y: 0, w: 250, h: 864 }
      ]
    },
    bamboo: {
      name: "竹林小徑",
      bossName: "竹林天狗",
      reward: "竹影玉印",
      atlas: { col: 1, row: 0 },
      bossCell: "bambooTengu",
      mode: "topdown",
      spawn: { x: 768, y: 700 },
      exit: { x: 768, y: 790, radius: 72, label: "回村落" },
      intro: "竹林天狗會遮住成語缺字。先解開兩個缺字寶物題，才能挑戰牠。",
      trainingNeeded: 2,
      bossQuestions: 1,
      treasures: [
        { id: "bamboo-gate", prop: "bambooGate", x: 445, y: 455, radius: 78, label: "竹門封印", type: "cloze" },
        { id: "bamboo-talisman", prop: "answerTalisman", x: 1085, y: 520, radius: 78, label: "缺字符牌", type: "cloze" }
      ],
      boss: { id: "bamboo-boss", x: 760, y: 330, radius: 110, label: "竹林天狗", type: "cloze" },
      blockers: [
        { x: 0, y: 0, w: 1536, h: 110 },
        { x: 0, y: 0, w: 170, h: 864 },
        { x: 1366, y: 0, w: 170, h: 864 }
      ]
    },
    market: {
      name: "市集祭典",
      bossName: "祭典面具王",
      reward: "祭典玉印",
      atlas: { col: 2, row: 0 },
      bossCell: "festivalMask",
      mode: "topdown",
      spawn: { x: 768, y: 700 },
      exit: { x: 768, y: 790, radius: 72, label: "回村落" },
      intro: "面具王會丟出生活情境。先完成兩個攤位情境題，再和牠對決。",
      trainingNeeded: 2,
      bossQuestions: 1,
      treasures: [
        { id: "market-basket", prop: "festivalBasket", x: 440, y: 535, radius: 82, label: "祭典攤籃", type: "scenario" },
        { id: "market-chest", prop: "scrollChest", x: 1110, y: 545, radius: 82, label: "祝典寶箱", type: "scenario" }
      ],
      boss: { id: "market-boss", x: 770, y: 355, radius: 112, label: "祭典面具王", type: "scenario" },
      blockers: [
        { x: 0, y: 0, w: 1536, h: 145 },
        { x: 0, y: 0, w: 180, h: 864 },
        { x: 1356, y: 0, w: 180, h: 864 }
      ]
    },
    mountain: {
      name: "山道困局",
      bossName: "山道浪人",
      reward: "山道玉印",
      atlas: { col: 0, row: 1 },
      bossCell: "mountainRonin",
      mode: "topdown",
      spawn: { x: 768, y: 700 },
      exit: { x: 768, y: 790, radius: 72, label: "回村落" },
      intro: "山道浪人會用真假句子擾亂你。先完成兩個判斷題，再進入 BOSS 決鬥。",
      trainingNeeded: 2,
      bossQuestions: 1,
      treasures: [
        { id: "mountain-left", prop: "mountainSign", x: 420, y: 475, radius: 80, label: "左路路標", type: "judge" },
        { id: "mountain-dummy", prop: "practiceDummy", x: 1010, y: 500, radius: 78, label: "修行草人", type: "judge" }
      ],
      boss: { id: "mountain-boss", x: 760, y: 350, radius: 112, label: "山道浪人", type: "judge" },
      blockers: [
        { x: 0, y: 0, w: 1536, h: 125 },
        { x: 0, y: 0, w: 170, h: 864 },
        { x: 1366, y: 0, w: 170, h: 864 }
      ]
    },
    forest: {
      name: "飛卷竹林",
      bossName: "疾風忍者",
      reward: "疾風玉印",
      atlas: { col: 1, row: 1 },
      bossCell: "windNinja",
      mode: "runner",
      spawn: { x: 245, y: 430 },
      exit: { x: 70, y: 672, radius: 70, label: "回村落" },
      intro: "忍者會在空中飛行。上下移動吃玉石、躲敵方忍者，靠近飛卷時按 A 用刀劃開題目。",
      trainingNeeded: 2,
      bossQuestions: 1,
      treasures: [],
      boss: { id: "forest-boss", x: 1190, y: 420, radius: 124, label: "疾風忍者", type: "runner" }
    },
    boss: {
      name: "成語魔卷",
      bossName: "成語魔卷",
      reward: "成語總印",
      atlas: { col: 2, row: 1 },
      bossCell: "scrollDemon",
      mode: "topdown",
      spawn: { x: 768, y: 700 },
      exit: { x: 768, y: 790, radius: 72, label: "回村落" },
      intro: "最後的魔卷會混合所有題型。先收集兩道回顧寶物題，再封印最終 BOSS。",
      trainingNeeded: 2,
      bossQuestions: 1,
      treasures: [
        { id: "boss-chest", prop: "scrollChest", x: 500, y: 535, radius: 82, label: "回顧寶箱", type: "boss" },
        { id: "boss-lantern", prop: "spiritLantern", x: 1040, y: 535, radius: 82, label: "守卷燈靈", type: "boss" }
      ],
      boss: { id: "final-boss", x: 768, y: 350, radius: 124, label: "成語魔卷", type: "boss" },
      blockers: [
        { x: 0, y: 0, w: 1536, h: 140 },
        { x: 0, y: 0, w: 210, h: 864 },
        { x: 1326, y: 0, w: 210, h: 864 }
      ]
    }
  },
  propCells: {
    questionScroll: { col: 0, row: 0 },
    bookPedestal: { col: 1, row: 0 },
    lessonSign: { col: 2, row: 0 },
    spiritLantern: { col: 3, row: 0 },
    bambooGate: { col: 0, row: 1 },
    festivalBasket: { col: 1, row: 1 },
    mountainSign: { col: 2, row: 1 },
    sealedScroll: { col: 3, row: 1 },
    treePlatform: { col: 0, row: 2 },
    practiceDummy: { col: 1, row: 2 },
    scrollChest: { col: 2, row: 2 },
    answerTalisman: { col: 3, row: 2 }
  },
  bossCells: {
    scrollMonk: { col: 0, row: 0 },
    bambooTengu: { col: 1, row: 0 },
    festivalMask: { col: 2, row: 0 },
    mountainRonin: { col: 3, row: 0 },
    windNinja: { col: 0, row: 1 },
    scrollDemon: { col: 1, row: 1 },
    enemyNinja: { col: 2, row: 1 },
    jade: { col: 3, row: 1 },
    portal: { col: 0, row: 2 },
    flyingScroll: { col: 1, row: 2 },
    slash: { col: 2, row: 2 },
    rewardChest: { col: 3, row: 2 }
  }
};
