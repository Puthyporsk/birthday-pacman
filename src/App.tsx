import React, { useEffect, useMemo, useRef, useState } from "react";

const TILE = 32;
const PLAYER_SPEED = 0.032;
const ENEMY_SPEED = 0.012;
const QUEEN_MODE_ENEMY_SPEED = 0.006;
const QUEEN_MODE_DURATION = 5000;
const SMALL_ITEMS_TO_SPAWN = 25;
const BIG_ITEMS_TO_SPAWN = 10;
const PLAYER_NAME = "Puthykol";
const AVATAR_SRC = `${import.meta.env.BASE_URL}puthykol-avatar.png`;

const smallPickupIcons = ["heart", "sparkle", "flower", "matcha", "pearl", "bow"];
const bigPickupIcons = ["tiramisu", "lilies", "gift", "crown", "toast", "cake"];

const birthdayReasons = [
  "You bring warmth into every room.",
  "You make ordinary days feel special.",
  "You have the sweetest smile.",
  "You are thoughtful in ways people remember.",
  "You deserve every good thing coming your way.",
  "You make people feel lucky to know you.",
  "You are beautiful inside and out.",
  "You have main character energy.",
  "You are kind, strong, and unforgettable.",
  "Life is better with you in it.",
  "You make 31 look easy.",
  "You are loved more than you know.",
  "You turn small moments into memories.",
  "You are graceful even when life gets busy.",
  "You have a way of making people smile.",
  "You are easy to celebrate.",
  "You are stronger than you give yourself credit for.",
  "You carry yourself with quiet confidence.",
  "You are sweet, funny, and impossible to replace.",
  "You make birthdays feel brighter.",
  "You are someone people are grateful to have around.",
  "You have a beautiful heart.",
  "You make getting older look good.",
  "You deserve a year full of peace and joy.",
  "You are the kind of person people remember fondly.",
  "You bring good energy wherever you go.",
  "You are worth celebrating today and every day.",
  "You are charming without even trying.",
  "You make 31 look like a compliment.",
  "You are deeply appreciated.",
  "You are Puthykol, and that alone is enough reason to celebrate.",
];

const winMessages = [
  "Puthykol escaped 31 with grace, matcha, and zero panic.",
  "31 tried. Puthykol glowed.",
  "The tiramisu is safe. The birthday queen has won.",
  "31 has officially been humbled.",
  "Puthykol cleared the board and left 31 looking confused.",
];

const loseMessages = [
  "31 caught you... but only because the matcha was distracting.",
  "31 got lucky. Very lucky.",
  "You were too classy for this maze anyway.",
  "Tiramisu was saved emotionally, if not physically.",
  "A temporary setback. The birthday icon remains undefeated spiritually.",
];

const pickupMessages: Record<string, string[]> = {
  matcha: ["Matcha secured.", "A little matcha power never hurt anybody."],
  tiramisu: ["Tiramisu saved.", "Dessert protection mission successful."],
  lilies: ["Lilies collected.", "Birthday flowers acquired."],
  crown: ["Birthday Queen Mode activated.", "Crown collected. 31 should be nervous."],
  toast: ["Classy points +100.", "A toast to the birthday queen."],
  cake: ["Cake secured.", "Birthday cake protected from 31."],
  heart: ["Love collected.", "Heart power added."],
  sparkle: ["Sparkle collected.", "The board got a little prettier."],
  flower: ["Soft flower energy collected.", "Cute and classy."],
  pearl: ["Clean girl energy collected.", "Elegant point secured."],
  bow: ["Bow collected.", "A tiny cute detail, obviously necessary."],
};

const enemyCaptions = [
  "31",
  "Adulting",
  "Back pain",
  "Bills",
  "Sleepy by 10",
  "Where did time go?",
];

const rawMaps = [
  [
    "###################",
    "#...o.....o.....o.#",
    "#.###.### # ###.###",
    "#.#     # # #     #",
    "#.# ### # # # ###.#",
    "#...#...# # #...#.#",
    "### # ### # ### # #",
    "#...#     B     #.#",
    "# # ### ##### ### #",
    "#.#...#   o   #...#",
    "#.###.# ### #.###.#",
    "#.....#  o  #.....#",
    "###.### ### ###.###",
    "#...o.........o...#",
    "###################",
  ],
  [
    "###################",
    "#o....#.....#....o#",
    "#.##.##.###.##.##.#",
    "#........#........#",
    "###.###.###.###.###",
    "#...#.........#...#",
    "#.#.#.### ###.#.#.#",
    "#.#..... B .....#.#",
    "#.#.#.### ###.#.#.#",
    "#...#....o....#...#",
    "###.###.###.###.###",
    "#........#........#",
    "#.##.##.###.##.##.#",
    "#o....#.....#....o#",
    "###################",
  ],
  [
    "###################",
    "#o......#......o..#",
    "#.#####.#.#####.#.#",
    "#.....#.#.#.....#.#",
    "###.#.#.#.#.#.###.#",
    "#...#.....#.#.....#",
    "#.##### ### #####.#",
    "#....... B .......#",
    "#.##### ### #####.#",
    "#.....#.#.....#...#",
    "#.###.#.#.#.#.###.#",
    "#.#.....#.#.#.....#",
    "#.#.#####.#.#####.#",
    "#..o......#......o#",
    "###################",
  ],
  [
    "###################",
    "#...o.........o...#",
    "#.###.#######.###.#",
    "#.#.............#.#",
    "#.#.###.###.###.#.#",
    "#...#...#o#...#...#",
    "###.#.#.# #.#.#.###",
    "#.....#  B  #.....#",
    "###.#.#.###.#.#.###",
    "#...#.........#...#",
    "#.#.###.###.###.#.#",
    "#.#.............#.#",
    "#.###.#######.###.#",
    "#...o.........o...#",
    "###################",
  ],
];

type Direction = "up" | "down" | "left" | "right" | "none";

type Entity = {
  x: number;
  y: number;
  dir: Direction;
};

type GameStatus = "start" | "ready" | "playing" | "won" | "reveal" | "lost";

const dirVector: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  none: { x: 0, y: 0 },
};

const opposite: Record<Direction, Direction> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
  none: "none",
};

function shuffleCells<T>(items: T[]) {
  const shuffled = [...items];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

function parseMap() {
  const selectedMap = rawMaps[Math.floor(Math.random() * rawMaps.length)];
  const grid = selectedMap.map((row) => row.split(""));
  let playerStart: Entity = { x: 9, y: 7, dir: "none" };
  let smallItemCount = 0;
  let bigItemCount = 0;

  const openCells: Array<{ x: number; y: number }> = [];

  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const cell = grid[y][x];

      if (cell === "B") {
        playerStart = { x, y, dir: "none" };
        grid[y][x] = " ";
      }

      if (cell === ".") {
        smallItemCount++;
        grid[y][x] = " ";
      }

      if (cell === "o") {
        bigItemCount++;
        grid[y][x] = " ";
      }
    }
  }

  const enemyStarts: Entity[] = [
    { x: 1, y: 1, dir: "right" },
    { x: 17, y: 13, dir: "left" },
  ];

  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const isPlayerStart = x === playerStart.x && y === playerStart.y;
      const isEnemyStart = enemyStarts.some(
        (enemy) => enemy.x === x && enemy.y === y
      );
      const isNearPlayer =
        Math.abs(x - playerStart.x) + Math.abs(y - playerStart.y) <= 1;

      if (
        grid[y][x] === " " &&
        !isPlayerStart &&
        !isEnemyStart &&
        !isNearPlayer
      ) {
        openCells.push({ x, y });
      }
    }
  }

  const shuffledCells = shuffleCells(openCells);
  const bigItemsToSpawn = Math.min(
    BIG_ITEMS_TO_SPAWN,
    bigItemCount,
    shuffledCells.length
  );
  const smallItemsToSpawn = Math.min(
    SMALL_ITEMS_TO_SPAWN,
    smallItemCount,
    Math.max(shuffledCells.length - bigItemsToSpawn, 0)
  );
  const totalItems = bigItemsToSpawn + smallItemsToSpawn;
  const selectedCells = shuffledCells.slice(0, totalItems);

  selectedCells.forEach((cell, index) => {
    grid[cell.y][cell.x] = index < bigItemsToSpawn ? "o" : ".";
  });

  const dots = totalItems;

  return { grid, playerStart, enemyStarts, dots };
}

function isWall(grid: string[][], x: number, y: number) {
  const row = grid[y];
  if (!row) return true;
  return row[x] === "#" || row[x] === undefined;
}

function canMove(grid: string[][], entity: Entity, dir: Direction) {
  if (dir === "none") return true;

  const v = dirVector[dir];
  const nextX = Math.round(entity.x + v.x * 0.55);
  const nextY = Math.round(entity.y + v.y * 0.55);

  return !isWall(grid, nextX, nextY);
}

function moveEntity(
  grid: string[][],
  entity: Entity,
  wantedDir: Direction,
  speed: number
) {
  let nextDir = entity.dir;

  const centered =
    Math.abs(entity.x - Math.round(entity.x)) < 0.08 &&
    Math.abs(entity.y - Math.round(entity.y)) < 0.08;

  if (centered && canMove(grid, entity, wantedDir)) {
    nextDir = wantedDir;
  }

  if (!canMove(grid, entity, nextDir)) {
    nextDir = "none";
  }

  const v = dirVector[nextDir];

  return {
    x: entity.x + v.x * speed,
    y: entity.y + v.y * speed,
    dir: nextDir,
  };
}

function validEnemyDirections(grid: string[][], enemy: Entity) {
  const center = {
    x: Math.round(enemy.x),
    y: Math.round(enemy.y),
  };

  return (["up", "down", "left", "right"] as Direction[]).filter((dir) => {
    const v = dirVector[dir];
    return !isWall(grid, center.x + v.x, center.y + v.y);
  });
}

function chooseEnemyDir(grid: string[][], enemy: Entity, player: Entity) {
  const centered =
    Math.abs(enemy.x - Math.round(enemy.x)) < 0.08 &&
    Math.abs(enemy.y - Math.round(enemy.y)) < 0.08;

  if (!centered) return enemy.dir;

  const options = validEnemyDirections(grid, enemy).filter(
    (dir) => dir !== opposite[enemy.dir]
  );
  const fallback = validEnemyDirections(grid, enemy);
  const choices = options.length ? options : fallback;

  const chaseChance = Math.random() < 0.2;

  if (chaseChance) {
    return choices.sort((a, b) => {
      const av = dirVector[a];
      const bv = dirVector[b];
      const ax = Math.round(enemy.x) + av.x;
      const ay = Math.round(enemy.y) + av.y;
      const bx = Math.round(enemy.x) + bv.x;
      const by = Math.round(enemy.y) + bv.y;

      return (
        Math.hypot(player.x - ax, player.y - ay) -
        Math.hypot(player.x - bx, player.y - by)
      );
    })[0];
  }

  return choices[Math.floor(Math.random() * choices.length)] || enemy.dir;
}

function getPickupIcon(cell: string, x: number, y: number) {
  const icons = cell === "o" ? bigPickupIcons : smallPickupIcons;
  const index = (x * 7 + y * 13) % icons.length;
  return icons[index];
}

function drawPickupIcon(
  ctx: CanvasRenderingContext2D,
  icon: string,
  cx: number,
  cy: number,
  isBig: boolean
) {
  const size = isBig ? 9 : 6;

  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineWidth = 1.5;

  if (icon === "matcha") {
    ctx.fillStyle = "#86efac";
    ctx.beginPath();
    ctx.roundRect(cx - size, cy - size / 2, size * 2, size * 1.4, 4);
    ctx.fill();
    ctx.strokeStyle = "#ecfccb";
    ctx.stroke();
  } else if (icon === "tiramisu" || icon === "cake") {
    ctx.fillStyle = "#f5d0a9";
    ctx.fillRect(cx - size, cy - size / 2, size * 2, size);
    ctx.fillStyle = "#7c2d12";
    ctx.fillRect(cx - size, cy - size / 2 - 3, size * 2, 3);
    ctx.fillStyle = "#fff7ed";
    ctx.fillRect(cx - size, cy + size / 2 - 2, size * 2, 2);
  } else if (icon === "lilies" || icon === "flower") {
    ctx.fillStyle = "#fdf2f8";

    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 * i) / 5;
      ctx.beginPath();
      ctx.ellipse(
        cx + Math.cos(angle) * 4,
        cy + Math.sin(angle) * 4,
        4,
        2.5,
        angle,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    ctx.fillStyle = "#f9a8d4";
    ctx.beginPath();
    ctx.arc(cx, cy, 2.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (icon === "crown") {
    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.moveTo(cx - size, cy + size / 2);
    ctx.lineTo(cx - size * 0.55, cy - size / 2);
    ctx.lineTo(cx, cy + 1);
    ctx.lineTo(cx + size * 0.55, cy - size / 2);
    ctx.lineTo(cx + size, cy + size / 2);
    ctx.closePath();
    ctx.fill();
  } else if (icon === "gift") {
    ctx.fillStyle = "#fb7185";
    ctx.fillRect(cx - size, cy - size, size * 2, size * 2);
    ctx.fillStyle = "#fde68a";
    ctx.fillRect(cx - 1.5, cy - size, 3, size * 2);
    ctx.fillRect(cx - size, cy - 1.5, size * 2, 3);
  } else if (icon === "toast") {
    ctx.strokeStyle = "#fde68a";
    ctx.beginPath();
    ctx.moveTo(cx - 4, cy - 7);
    ctx.lineTo(cx - 2, cy + 6);
    ctx.moveTo(cx + 4, cy - 7);
    ctx.lineTo(cx + 2, cy + 6);
    ctx.stroke();
  } else if (icon === "sparkle") {
    ctx.fillStyle = "#fde047";
    ctx.beginPath();
    ctx.moveTo(cx, cy - size);
    ctx.lineTo(cx + 2, cy - 2);
    ctx.lineTo(cx + size, cy);
    ctx.lineTo(cx + 2, cy + 2);
    ctx.lineTo(cx, cy + size);
    ctx.lineTo(cx - 2, cy + 2);
    ctx.lineTo(cx - size, cy);
    ctx.lineTo(cx - 2, cy - 2);
    ctx.closePath();
    ctx.fill();
  } else if (icon === "pearl") {
    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.arc(cx, cy, size, 0, Math.PI * 2);
    ctx.fill();
  } else if (icon === "bow") {
    ctx.fillStyle = "#f9a8d4";
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx - size, cy - size / 2);
    ctx.lineTo(cx - size, cy + size / 2);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + size, cy - size / 2);
    ctx.lineTo(cx + size, cy + size / 2);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.fillStyle = "#ec4899";
    ctx.beginPath();
    ctx.arc(cx - size / 3, cy - size / 4, size / 2, 0, Math.PI * 2);
    ctx.arc(cx + size / 3, cy - size / 4, size / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx - size, cy);
    ctx.lineTo(cx + size, cy);
    ctx.lineTo(cx, cy + size);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

function getRandomMessage(messages: string[]) {
  return messages[Math.floor(Math.random() * messages.length)];
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const keyRef = useRef<Direction>("none");
  const avatarRef = useRef<HTMLImageElement | null>(null);
  const readyTimeoutRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const musicIntervalRef = useRef<number | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const lastFrameTimeRef = useRef<number | null>(null);

  const base = useMemo(() => parseMap(), []);

  const [status, setStatus] = useState<GameStatus>("start");
  const [grid, setGrid] = useState<string[][]>(() =>
    base.grid.map((row) => [...row])
  );
  const [player, setPlayer] = useState<Entity>(base.playerStart);
  const [enemies, setEnemies] = useState<Entity[]>(base.enemyStarts);
  const [score, setScore] = useState(0);
  const [remaining, setRemaining] = useState(base.dots);
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const [toast, setToast] = useState(
    "Collect every treasure to unlock the birthday surprise."
  );
  const [endMessage, setEndMessage] = useState("");
  const [queenModeUntil, setQueenModeUntil] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [musicOn, setMusicOn] = useState(false);

  const width = base.grid[0].length * TILE;
  const height = base.grid.length * TILE;
  const queenModeActive = status === "playing" && Date.now() < queenModeUntil;

  function setDirection(direction: Direction) {
    keyRef.current = direction;
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.preventDefault();
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    e.preventDefault();

    if (!pointerStartRef.current) return;

    const dx = e.clientX - pointerStartRef.current.x;
    const dy = e.clientY - pointerStartRef.current.y;
    const minSwipeDistance = 18;

    if (Math.abs(dx) < minSwipeDistance && Math.abs(dy) < minSwipeDistance) {
      pointerStartRef.current = null;
      return;
    }

    if (Math.abs(dx) > Math.abs(dy)) {
      setDirection(dx > 0 ? "right" : "left");
    } else {
      setDirection(dy > 0 ? "down" : "up");
    }

    pointerStartRef.current = null;
  }

  function getAudioContext() {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }

    return audioCtxRef.current;
  }

  function playTone(
    frequency: number,
    duration = 0.12,
    type: OscillatorType = "sine",
    volume = 0.08
  ) {
    if (!soundOn) return;

    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.value = volume;

    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();

    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    oscillator.stop(ctx.currentTime + duration);
  }

  function playPickupSound() {
    playTone(660, 0.08, "sine", 0.05);
  }

  function playPowerSound() {
    playTone(784, 0.12, "triangle", 0.07);
    window.setTimeout(() => playTone(988, 0.12, "triangle", 0.07), 90);
  }

  function playWinSound() {
    playTone(523, 0.12, "triangle", 0.07);
    window.setTimeout(() => playTone(659, 0.12, "triangle", 0.07), 100);
    window.setTimeout(() => playTone(784, 0.18, "triangle", 0.07), 200);
  }

  function playLoseSound() {
    playTone(220, 0.18, "sawtooth", 0.04);
    window.setTimeout(() => playTone(165, 0.2, "sawtooth", 0.04), 120);
  }

  function playMusicNote(frequency: number, duration = 0.18) {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.value = 0.035;

    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();

    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    oscillator.stop(ctx.currentTime + duration);
  }

  function startMusic() {
    if (musicIntervalRef.current) return;

    const melody = [523, 659, 784, 659, 587, 698, 880, 698];
    let index = 0;

    playMusicNote(melody[index], 0.2);
    index++;

    musicIntervalRef.current = window.setInterval(() => {
      playMusicNote(melody[index % melody.length], 0.2);
      index++;
    }, 420);
  }

  function stopMusic() {
    if (!musicIntervalRef.current) return;
    window.clearInterval(musicIntervalRef.current);
    musicIntervalRef.current = null;
  }

  function showToast(message: string) {
    setToast(message);

    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }

    toastTimeoutRef.current = window.setTimeout(() => {
      setToast(
        queenModeActive
          ? "Birthday Queen Mode is active. 31 is stressed."
          : "Keep collecting birthday treasures."
      );
    }, 1800);
  }

  useEffect(() => {
    const img = new Image();
    img.src = AVATAR_SRC;

    img.onload = () => {
      avatarRef.current = img;
      setAvatarLoaded(true);
    };
  }, []);

  function resetGame() {
    const fresh = parseMap();

    setGrid(fresh.grid.map((row) => [...row]));
    setPlayer(fresh.playerStart);
    setEnemies(fresh.enemyStarts);
    setScore(0);
    setRemaining(fresh.dots);
    setQueenModeUntil(0);
    setEndMessage("");
    setToast("Level 31 unlocked. Collect every treasure to reveal the surprise.");
    keyRef.current = "none";
    setStatus("ready");

    if (musicOn) startMusic();

    if (readyTimeoutRef.current) {
      window.clearTimeout(readyTimeoutRef.current);
    }

    readyTimeoutRef.current = window.setTimeout(() => {
      setStatus("playing");
    }, 1600);
  }

  useEffect(() => {
    return () => {
      if (readyTimeoutRef.current) window.clearTimeout(readyTimeoutRef.current);
      if (toastTimeoutRef.current) window.clearTimeout(toastTimeoutRef.current);
      stopMusic();
    };
  }, []);

  useEffect(() => {
    if (musicOn && status === "playing") startMusic();
    if (!musicOn || status !== "playing") stopMusic();
  }, [musicOn, status]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (e.key === "ArrowUp" || key === "w") setDirection("up");
      if (e.key === "ArrowDown" || key === "s") setDirection("down");
      if (e.key === "ArrowLeft" || key === "a") setDirection("left");
      if (e.key === "ArrowRight" || key === "d") setDirection("right");
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    if (status !== "playing") return;

    let frame = 0;
    lastFrameTimeRef.current = null;

    const tick = (timestamp: number) => {
      const lastTimestamp = lastFrameTimeRef.current ?? timestamp;
      const delta = Math.min((timestamp - lastTimestamp) / 16.67, 2);
      lastFrameTimeRef.current = timestamp;

      setPlayer((oldPlayer) => {
        const movedPlayer = moveEntity(
          grid,
          oldPlayer,
          keyRef.current,
          PLAYER_SPEED * delta
        );
        const px = Math.round(movedPlayer.x);
        const py = Math.round(movedPlayer.y);

        if (grid[py]?.[px] === "." || grid[py]?.[px] === "o") {
          const pickupIcon = getPickupIcon(grid[py][px], px, py);

          setGrid((oldGrid) => {
            const next = oldGrid.map((row) => [...row]);

            if (next[py]?.[px] === "." || next[py]?.[px] === "o") {
              const points = next[py][px] === "o" ? 50 : 10;
              next[py][px] = " ";

              setScore((s) => s + points);

              if (pickupIcon === "crown") {
                const until = Date.now() + QUEEN_MODE_DURATION;
                setQueenModeUntil(until);
                showToast(getRandomMessage(pickupMessages[pickupIcon]));
                playPowerSound();
              } else {
                const messages =
                  pickupMessages[pickupIcon] || ["Birthday treasure collected."];
                showToast(getRandomMessage(messages));
                playPickupSound();
              }

              setRemaining((r) => {
                const newRemaining = r - 1;

                if (newRemaining <= 0) {
                  const message = getRandomMessage(winMessages);
                  setEndMessage(message);
                  setStatus("won");
                  playWinSound();
                }

                return newRemaining;
              });
            }

            return next;
          });
        }

        setEnemies((oldEnemies) => {
          const enemySpeed =
            Date.now() < queenModeUntil ? QUEEN_MODE_ENEMY_SPEED : ENEMY_SPEED;

          const nextEnemies = oldEnemies.map((enemy) => {
            const nextDir = chooseEnemyDir(grid, enemy, movedPlayer);
            return moveEntity(grid, enemy, nextDir, enemySpeed * delta);
          });

          const caught = nextEnemies.some((enemy) => {
            return (
              Math.hypot(enemy.x - movedPlayer.x, enemy.y - movedPlayer.y) <
              0.62
            );
          });

          if (caught && Date.now() >= queenModeUntil) {
            setEndMessage(getRandomMessage(loseMessages));
            setStatus("lost");
            playLoseSound();
          }

          return nextEnemies;
        });

        return movedPlayer;
      });

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [status, grid, queenModeUntil]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#090014";
    ctx.fillRect(0, 0, width, height);

    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        const cell = grid[y][x];
        const left = x * TILE;
        const top = y * TILE;

        if (cell === "#") {
          const wallGradient = ctx.createLinearGradient(
            left,
            top,
            left + TILE,
            top + TILE
          );
          wallGradient.addColorStop(0, "#f9a8d4");
          wallGradient.addColorStop(1, "#f472b6");

          ctx.fillStyle = wallGradient;
          ctx.fillRect(left + 2, top + 2, TILE - 4, TILE - 4);
        }

        if (cell === "." || cell === "o") {
          const icon = getPickupIcon(cell, x, y);
          drawPickupIcon(ctx, icon, left + TILE / 2, top + TILE / 2, cell === "o");
        }
      }
    }

    const playerCenterX = player.x * TILE + TILE / 2;
    const playerCenterY = player.y * TILE + TILE / 2;
    const avatarSize = TILE + 2;

    ctx.save();
    ctx.shadowColor = queenModeActive ? "#fde047" : "#facc15";
    ctx.shadowBlur = queenModeActive ? 24 : 12;

    if (avatarLoaded && avatarRef.current) {
      ctx.beginPath();
      ctx.arc(playerCenterX, playerCenterY, avatarSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(
        avatarRef.current,
        playerCenterX - avatarSize / 2,
        playerCenterY - avatarSize / 2,
        avatarSize,
        avatarSize
      );
    } else {
      ctx.font = "22px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("👑", playerCenterX, playerCenterY);
    }

    ctx.restore();

    ctx.strokeStyle = queenModeActive ? "#fde047" : "#facc15";
    ctx.lineWidth = queenModeActive ? 4 : 2.5;
    ctx.beginPath();
    ctx.arc(playerCenterX, playerCenterY, avatarSize / 2, 0, Math.PI * 2);
    ctx.stroke();

    enemies.forEach((enemy, index) => {
      const ex = enemy.x * TILE;
      const ey = enemy.y * TILE;
      const centerX = ex + TILE / 2;
      const centerY = ey + TILE / 2;
      const caption =
        enemyCaptions[
          (index + Math.floor(Date.now() / 1800)) % enemyCaptions.length
        ];

      ctx.fillStyle = queenModeActive ? "#7f1d1d" : "#fb7185";
      ctx.beginPath();
      ctx.roundRect(ex + 3, ey + 3, TILE - 6, TILE - 6, 9);
      ctx.fill();

      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(centerX - 6, centerY - 6, 2.2, 0, Math.PI * 2);
      ctx.arc(centerX + 6, centerY - 6, 2.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "white";
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("31", centerX, centerY + 4);

      ctx.font = "9px sans-serif";
      ctx.fillStyle = "#ffe4e6";
      ctx.fillText(caption, centerX, ey - 2);
    });
  }, [grid, player, enemies, avatarLoaded, width, height, queenModeActive]);

  return (
    <div className="min-h-dvh bg-gradient-to-br from-[#2a0f1f] via-[#3a1330] to-[#4a183f] text-white flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-none">
      <div className="w-full max-w-3xl rounded-3xl bg-black/35 shadow-2xl backdrop-blur p-4 sm:p-6 border border-pink-200/20">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-5">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              {PLAYER_NAME}&apos;s Birthday Escape
            </h1>
            <p className="text-pink-100/90 mt-1">
              Collect matcha, tiramisu, lilies, and birthday treasures before 31
              catches up.
            </p>
          </div>

          <div className="text-sm text-pink-50/90 sm:text-right">
            <div>
              Score: <span className="font-bold text-yellow-200">{score}</span>
            </div>
            <div>
              Items left:{" "}
              <span className="font-bold text-yellow-200">{remaining}</span>
            </div>
          </div>
        </div>

        <div className="mb-3 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <div className="rounded-2xl bg-black/25 border border-pink-200/15 px-4 py-2 text-sm text-pink-50/90 h-[68px] sm:h-[44px] flex items-center overflow-hidden">
            <span className="leading-snug line-clamp-2">{toast}</span>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSoundOn((v) => !v)}
              className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold hover:bg-white/20 transition"
            >
              Sound: {soundOn ? "On" : "Off"}
            </button>
            <button
              type="button"
              onClick={() => setMusicOn((v) => !v)}
              className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold hover:bg-white/20 transition"
            >
              Music: {musicOn ? "On" : "Off"}
            </button>
          </div>
        </div>

        <div className="mb-3 min-h-[40px]">
          <div
            className={`rounded-2xl border px-4 py-2 text-sm font-bold text-center transition-opacity duration-200 ${
              queenModeActive
                ? "bg-yellow-300/20 border-yellow-200/30 text-yellow-100 opacity-100"
                : "bg-transparent border-transparent text-transparent opacity-0"
            }`}
          >
            👑 Birthday Queen Mode: 31 is slowed down and cannot catch her.
          </div>
        </div>

        <div
          className="relative overflow-hidden rounded-2xl border border-pink-200/15 bg-black/55 flex justify-center p-2 sm:p-3 touch-none select-none"
          style={{ touchAction: "none" }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => (pointerStartRef.current = null)}
        >
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="w-full max-w-full h-auto rounded-xl"
          />

          {status !== "playing" && (
            <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-[2px] overflow-y-auto">
              <div className="min-h-full flex items-start sm:items-center justify-center p-4 sm:p-6">
                <div className="w-full max-w-xl rounded-2xl bg-black/90 border border-pink-200/20 shadow-2xl p-5 sm:p-6 text-center my-4">
                  {status === "start" && (
                    <>
                      {avatarLoaded && (
                        <img
                          src={AVATAR_SRC}
                          alt="Puthykol avatar"
                          className="mx-auto mb-4 h-24 w-24 rounded-full border-4 border-yellow-200 object-cover shadow-2xl"
                        />
                      )}
                      <div className="text-5xl mb-3">🎂</div>
                      <h2 className="text-3xl font-black mb-2">
                        Happy 31st Birthday, {PLAYER_NAME}!
                      </h2>
                      <p className="text-white/80 mb-5">
                        Puthykol was peacefully enjoying matcha and tiramisu...
                        until 31 showed up uninvited. Help her collect every
                        birthday treasure and escape with elegance.
                      </p>
                      <button
                        type="button"
                        onClick={resetGame}
                        className="rounded-2xl bg-pink-500 px-6 py-3 font-bold shadow-lg hover:bg-pink-400 transition"
                      >
                        Start Game
                      </button>
                    </>
                  )}

                  {status === "ready" && (
                    <>
                      <div className="text-5xl mb-3">✨</div>
                      <h2 className="text-3xl font-black mb-2">Ready?</h2>
                      <p className="text-white/80 mb-5">
                        Get ready, birthday queen. Protect the matcha and
                        tiramisu.
                      </p>
                    </>
                  )}

                  {status === "won" && (
                    <>
                      {avatarLoaded && (
                        <img
                          src={AVATAR_SRC}
                          alt="Puthykol avatar"
                          className="mx-auto mb-4 h-24 w-24 rounded-full border-4 border-yellow-200 object-cover shadow-2xl"
                        />
                      )}
                      <div className="text-5xl mb-3">👑</div>
                      <h2 className="text-3xl font-black mb-2">
                        {PLAYER_NAME} Escaped 31!
                      </h2>
                      <p className="text-white/80 mb-5">
                        {endMessage || "31 has officially been humbled."}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                          type="button"
                          onClick={() => setStatus("reveal")}
                          className="rounded-2xl bg-yellow-400 text-slate-950 px-6 py-3 font-bold shadow-lg hover:bg-yellow-300 transition"
                        >
                          Reveal Birthday Message
                        </button>
                        <button
                          type="button"
                          onClick={resetGame}
                          className="rounded-2xl bg-white/10 px-6 py-3 font-bold shadow-lg hover:bg-white/20 transition"
                        >
                          Play Again
                        </button>
                      </div>
                    </>
                  )}

                  {status === "reveal" && (
                    <>
                      {avatarLoaded && (
                        <img
                          src={AVATAR_SRC}
                          alt="Puthykol avatar"
                          className="mx-auto mb-4 h-28 w-28 rounded-full border-4 border-pink-200 object-cover shadow-2xl"
                        />
                      )}
                      <div className="text-5xl mb-3">💖</div>
                      <h2 className="text-3xl font-black mb-2">
                        For {PLAYER_NAME}
                      </h2>
                      <p className="text-white/80 mb-5">
                        Happy 31st birthday, {PLAYER_NAME}. This little game is
                        just a silly way to say you are loved, celebrated, and
                        impossible to replace. May this year bring more peace,
                        more laughter, more lilies, more matcha, more tiramisu,
                        and way less stress.
                      </p>

                      <div className="rounded-2xl bg-white/10 p-4 text-left mb-5 max-h-[45vh] min-h-64 overflow-y-auto border border-white/10 w-full">
                        <h3 className="font-black text-yellow-200 mb-3">
                          31 reasons you are special
                        </h3>
                        <ol className="space-y-2 list-decimal list-inside text-white/85">
                          {birthdayReasons.map((reason, index) => (
                            <li key={index}>{reason}</li>
                          ))}
                        </ol>
                      </div>

                      <button
                        type="button"
                        onClick={resetGame}
                        className="rounded-2xl bg-pink-500 px-6 py-3 font-bold shadow-lg hover:bg-pink-400 transition"
                      >
                        Play Again
                      </button>
                    </>
                  )}

                  {status === "lost" && (
                    <>
                      <div className="text-5xl mb-3">😅</div>
                      <h2 className="text-3xl font-black mb-2">
                        31 Caught {PLAYER_NAME}
                      </h2>
                      <p className="text-white/80 mb-5">
                        {endMessage ||
                          "31 got lucky. Try again and remind it who the real birthday icon is."}
                      </p>
                      <button
                        type="button"
                        onClick={resetGame}
                        className="rounded-2xl bg-pink-500 px-6 py-3 font-bold shadow-lg hover:bg-pink-400 transition"
                      >
                        Try Again
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 rounded-2xl bg-black/25 border border-pink-200/20 p-3">
          <p className="text-sm font-bold text-yellow-100 mb-2">
            Puthykol&apos;s birthday pickups
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-pink-50/90">
            <span>🍵 Matcha</span>
            <span>🍰 Tiramisu</span>
            <span>💐 Lilies</span>
            <span>🩷 Hearts</span>
            <span>✨ Sparkles</span>
            <span>👑 Birthday Queen</span>
          </div>
        </div>

        <p className="text-xs text-pink-100/75 mt-4 text-center">
          Use arrow keys or WASD on desktop. On mobile, swipe on the game board
          to move.
        </p>
      </div>
    </div>
  );
}