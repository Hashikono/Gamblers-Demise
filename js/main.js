// ──────────────────────────────────────────────────────────
// Global parameters
// ──────────────────────────────────────────────────────────
var dayCounter = 0;
var officialBunnyTurnout = 0;

var playerMoney = 1000;
var moneyAtDayStart = 1000;
var bunnyMoney = 100;
var maxBunnies = 5;
var bunnyTries = 3;
var whiteRabbitChance = 100;
var maxAmountGamble = 4;
var percentageGain = 100;

var currentSlot = 1;
var dayRunning = false;

// Phase 2 state
var phase2Running = false;
var phase2PlaysRequired = 1;
var phase2PlaysLeft = 1;
var phase2Machine = null;
var phase2Bet = 50;

// 7 reel symbols
const SYMBOLS = ["🍒", "🍋", "🍊", "🍇", "💎", "7️⃣", "⭐"];

// White Rabbit messages
const RABBIT_MESSAGES = [
    "Well it seems you had your fun today, how about we have some more fun at your OWN games!",
    "My bunny children have been afflicted for way too long, how about you have a go at the reason for their demise?!",
    "Your greed and lack of morale impresses me, maybe we should try these games together!",
    "Time is ticking, but I feel this casino needs to tick faster to its demise…oh, I have an idea!",
    "An eye for an eye, a tooth for a tooth, and demise for greed, your clients have had enough!"
];


// ──────────────────────────────────────────────────────────
// Bunny class
// ──────────────────────────────────────────────────────────
class Bunny {
    constructor() {
        this.money = bunnyMoney;
        this.tries = bunnyTries;
    }
    modMoney(amount) { this.money += amount; }
    setMoney(amount) { this.money = amount; }
    getMoney() { return this.money; }
    modTrial(amount) { this.tries += amount; }
    setTrial(amount) { this.tries = amount; }
    getTrial() { return this.tries; }
}


// ──────────────────────────────────────────────────────────
// Machine class
// ──────────────────────────────────────────────────────────
class Machine {
    constructor(num, availability) {
        this.machineNum = num;
        this.machineAvail = availability;
        this.winRate = 50;
        this.payout = 2.0;
        this.minBet = 50;
        this.override = false;
    }
    setMachineNum(v)   { this.machineNum = v; }
    getMachineNum()    { return this.machineNum; }
    setMachineAvail(v) { this.machineAvail = v; }
    getMachineAvail()  { return this.machineAvail; }
    setWinRate(v)  { this.winRate = v; }
    getWinRate()   { return this.winRate; }
    setPayout(v)   { this.payout = v; }
    getPayout()    { return this.payout; }
    setMinBet(v)   { this.minBet = v; }
    getMinBet()    { return this.minBet; }
    setOverride(v) { this.override = v; }
    getOverride()  { return this.override; }
}


// ──────────────────────────────────────────────────────────
// Machine list init
// ──────────────────────────────────────────────────────────
var machineCount = 9;
var zones = [true, false, false];
var machineList = [];

for (let i = 0; i < machineCount; i++) {
    machineList.push(new Machine(i + 1, false));
}
for (let i = 0; i < 3; i++) {
    machineList[i].setMachineAvail(true);
}


// ──────────────────────────────────────────────────────────
// Random utilities
// ──────────────────────────────────────────────────────────
function rand100() {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return (array[0] % 100) + 1;
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickSymbol() {
    return SYMBOLS[randInt(0, SYMBOLS.length - 1)];
}

function pickLosingSymbols() {
    let s;
    do {
        s = [pickSymbol(), pickSymbol(), pickSymbol()];
    } while (s[0] === s[1] && s[1] === s[2]);
    return s;
}


// ──────────────────────────────────────────────────────────
// Machine calculation (day earnings)
// ──────────────────────────────────────────────────────────
function machineCalc(mach) {
    if (!mach.getMachineAvail()) return [];

    let attraction = 0;
    let bunnyTurnout = 0;
    let bunnyList = [];

    const pay = parseFloat(mach.getPayout());
    if (pay >= 3.0)      attraction += 50;
    else if (pay >= 2.5) attraction += 40;
    else if (pay >= 2.0) attraction += 30;
    else if (pay >= 1.5) attraction += 20;
    else if (pay >= 1.0) attraction += 10;

    attraction += Math.round(mach.getMinBet() / 2);

    for (let i = 0; i < maxBunnies; i++) {
        if (rand100() <= attraction) bunnyTurnout++;
    }
    officialBunnyTurnout += bunnyTurnout;

    for (let i = 0; i < bunnyTurnout; i++) {
        let earnings = 0;
        let currentBunny = new Bunny();
        let currentBet = mach.getMinBet();

        for (let t = 0; t < bunnyTries; t++) {
            if (currentBunny.getMoney() >= currentBet) {
                let winNum = rand100();
                currentBunny.modMoney(-currentBet);
                earnings += currentBet;

                if (mach.getOverride() && winNum <= 10) {
                    currentBet = mach.getMinBet();
                } else if (winNum <= mach.getWinRate()) {
                    earnings -= currentBet * mach.getPayout();
                    currentBunny.modMoney(currentBet * mach.getPayout());
                    currentBet += currentBunny.getMoney() * 0.1;
                } else {
                    currentBet = mach.getMinBet();
                }
            } else if (currentBunny.getMoney() >= mach.getMinBet()) {
                currentBet = mach.getMinBet();
                let winNum = rand100();
                currentBunny.modMoney(-currentBet);
                earnings += currentBet;

                if (mach.getOverride() && winNum <= 10) {
                    currentBet = mach.getMinBet();
                } else if (winNum <= mach.getWinRate()) {
                    earnings -= currentBet * mach.getPayout();
                    currentBunny.modMoney(currentBet * mach.getPayout());
                    currentBet += currentBunny.getMoney() * 0.1;
                } else {
                    currentBet = mach.getMinBet();
                }
            }
        }
        bunnyList.push(earnings * (percentageGain / 100));
    }

    return bunnyList;
}


// ──────────────────────────────────────────────────────────
// HUD updates
// ──────────────────────────────────────────────────────────
function updateMoneyDisplay() {
    const el = document.getElementById("playerMoneyDisplay");
    if (el) el.textContent = Math.round(playerMoney);
}

function updateBunnyCount(visited, max) {
    document.getElementById("bunnyCount").textContent = visited;
    document.getElementById("bunnyMax").textContent = max;
}


// ──────────────────────────────────────────────────────────
// ZONE UNLOCK
// ──────────────────────────────────────────────────────────
function unlockZone(zoneNum) {
    const cost = 2000;
    if (playerMoney < cost) {
        console.log("Not enough money to unlock zone " + zoneNum);
        return false;
    }

    playerMoney -= cost;
    updateMoneyDisplay();

    if (zoneNum === 2) {
        zones[1] = true;
        machineList[3].setMachineAvail(true);
        machineList[4].setMachineAvail(true);
        machineList[5].setMachineAvail(true);
        document.getElementById("zone2").classList.remove("locked");
        document.getElementById("zone3").classList.remove("zone3-disabled");
    } else if (zoneNum === 3) {
        if (!zones[1]) {
            playerMoney += cost;
            updateMoneyDisplay();
            return false;
        }
        zones[2] = true;
        machineList[6].setMachineAvail(true);
        machineList[7].setMachineAvail(true);
        machineList[8].setMachineAvail(true);
        document.getElementById("zone3").classList.remove("locked");
    }

    return true;
}


// ──────────────────────────────────────────────────────────
// SLOT POPUP (Phase 1)
// ──────────────────────────────────────────────────────────
function openSlotPopup(slotNum) {
    currentSlot = slotNum;
    const m = machineList[slotNum - 1];
    if (!m.getMachineAvail()) return;

    document.getElementById("machineTargetLabel").textContent = slotNum;
    document.getElementById("parameter_winRate").value = m.getWinRate();
    document.getElementById("winRateVal").textContent = m.getWinRate();
    document.getElementById("parameter_payout").value = m.getPayout();
    document.getElementById("parameter_minBet").value = m.getMinBet();
    document.getElementById("minBetVal").textContent = m.getMinBet();
    document.getElementById("parameter_override").value = m.getOverride() ? 1 : 0;
    document.getElementById("overrideVal").textContent = m.getOverride() ? "On" : "Off";

    document.getElementById("machinePopup").classList.remove("hidden");
}

function closeSlotPopup() {
    document.getElementById("machinePopup").classList.add("hidden");
}

function saveSlotPopup() {
    const m = machineList[currentSlot - 1];
    m.setWinRate(parseInt(document.getElementById("parameter_winRate").value, 10));
    m.setPayout(parseFloat(document.getElementById("parameter_payout").value));
    m.setMinBet(parseInt(document.getElementById("parameter_minBet").value, 10));
    m.setOverride(document.getElementById("parameter_override").value === "1");
    closeSlotPopup();
}


// ──────────────────────────────────────────────────────────
// BUNNY ROAMING ANIMATION
// ──────────────────────────────────────────────────────────
function spawnBunny(targetMachineIndex, totalDurationMs) {
    const floor = document.getElementById("casinoFloor");
    const bunnyLayer = document.getElementById("bunnyLayer");

    const targetEl = document.querySelector(`.slotMachine[data-slot="${targetMachineIndex + 1}"]`);
    if (!targetEl) return;

    const floorRect = floor.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();
    const targetX = targetRect.left - floorRect.left + targetRect.width / 2 - 16;
    const targetY = targetRect.top - floorRect.top + targetRect.height / 2 - 16;

    const bunny = document.createElement("img");
    bunny.src = "assets/bunny.svg";
    bunny.className = "bunny walking";
    bunny.style.left = (floor.clientWidth / 2 - 16) + "px";
    bunny.style.top = (floor.clientHeight - 30) + "px";
    bunny.style.setProperty('--dir', '0deg');
    bunnyLayer.appendChild(bunny);

    setTimeout(() => {
        bunny.style.left = targetX + "px";
        bunny.style.top = targetY + "px";
    }, 50);

    const walkTime = 1500;
    const stayTime = totalDurationMs - walkTime - 1500;

    setTimeout(() => {
        bunny.style.left = (floor.clientWidth / 2 - 16) + "px";
        bunny.style.top = (floor.clientHeight + 40) + "px";
    }, walkTime + Math.max(stayTime, 200));

    setTimeout(() => {
        if (bunny.parentNode) bunny.parentNode.removeChild(bunny);
    }, totalDurationMs);
}


// ──────────────────────────────────────────────────────────
// WHITE RABBIT TRANSITION
// Shows a visual-novel-style overlay between Phase 1 and 2.
// Returns a Promise that resolves when the sequence is done.
// ──────────────────────────────────────────────────────────
function showWhiteRabbitTransition() {
    return new Promise((resolve) => {
        const message = RABBIT_MESSAGES[randInt(0, RABBIT_MESSAGES.length - 1)];

        // Build overlay
        const overlay = document.createElement("div");
        overlay.id = "rabbitOverlay";
        overlay.innerHTML = `
            <div class="rabbit-dialogue-box">
                <p class="rabbit-message" id="rabbitMessage">${message}</p>
            </div>
            <div class="rabbit-portrait-wrap" id="rabbitPortrait">
                <img src="assets/Clockrabbit.png" alt="The Clock Rabbit" class="rabbit-portrait-img" />
            </div>
        `;
        document.body.appendChild(overlay);

        // Play ghostly ambient immediately
        const ghostSfx = new Audio("assets/sounds/ghostly-sound.mp3");
        ghostSfx.volume = 0.75;
        ghostSfx.play().catch(() => {});

        // electric.mp3 fires when the rabbit slides in (500ms delay matches portrait-in)
        setTimeout(() => {
            const electricSfx = new Audio("assets/sounds/electric.mp3");
            electricSfx.volume = 0.85;
            electricSfx.play().catch(() => {});
        }, 500);

        // Fade in overlay
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                overlay.classList.add("rabbit-visible");
            });
        });

        // After 500ms, slide rabbit portrait up from bottom
        setTimeout(() => {
            const portrait = document.getElementById("rabbitPortrait");
            if (portrait) portrait.classList.add("rabbit-portrait-in");
        }, 500);

        // After 3.5s, fade message out, then slide rabbit away, then remove
        setTimeout(() => {
            const msgEl = document.getElementById("rabbitMessage");
            if (msgEl) msgEl.classList.add("rabbit-msg-out");

            setTimeout(() => {
                const portrait = document.getElementById("rabbitPortrait");
                if (portrait) portrait.classList.remove("rabbit-portrait-in");

                setTimeout(() => {
                    overlay.classList.remove("rabbit-visible");
                    setTimeout(() => {
                        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
                        resolve();
                    }, 600);
                }, 500);
            }, 500);
        }, 3500);
    });
}


// ──────────────────────────────────────────────────────────
// RUN THE DAY (Phase 1 → White Rabbit → Phase 2)
// ──────────────────────────────────────────────────────────
function runDay() {
    if (dayRunning) return;
    dayRunning = true;

    moneyAtDayStart = playerMoney;

    const DAY_MS = 15000;
    const PAUSE_AFTER_MS = 2000;
    const TOTAL_BUNNIES = 10;

    const startBtn = document.getElementById("startDayBtn");
    startBtn.disabled = true;

    officialBunnyTurnout = 0;

    let allEarnings = [];
    for (let i = 0; i < machineList.length; i++) {
        if (machineList[i].getMachineAvail()) {
            const machineEarnings = machineCalc(machineList[i]);
            if (machineEarnings && machineEarnings.length) {
                allEarnings = allEarnings.concat(machineEarnings);
            }
        }
    }

    const availableMachineCount = machineList.filter(m => m.getMachineAvail()).length;
    const maxPossibleBunnies = maxBunnies * availableMachineCount;
    updateBunnyCount(0, maxPossibleBunnies);

    if (allEarnings.length > 0) {
        const payoutInterval = DAY_MS / allEarnings.length;
        allEarnings.forEach((amount, idx) => {
            setTimeout(() => {
                playerMoney += amount;
                updateMoneyDisplay();
            }, payoutInterval * (idx + 1) - 100);
        });
    }

    const availableMachineIndices = [];
    for (let i = 0; i < machineList.length; i++) {
        if (machineList[i].getMachineAvail()) availableMachineIndices.push(i);
    }

    let bunniesVisited = 0;
    for (let b = 0; b < TOTAL_BUNNIES; b++) {
        const spawnDelay = (DAY_MS - 3000) * (b / TOTAL_BUNNIES) + randInt(0, 400);
        setTimeout(() => {
            const target = availableMachineIndices[randInt(0, availableMachineIndices.length - 1)];
            spawnBunny(target, 3000);
            bunniesVisited++;
            updateBunnyCount(bunniesVisited, maxPossibleBunnies);
        }, spawnDelay);
    }

    setTimeout(() => {
        const layer = document.getElementById("bunnyLayer");
        if (layer) layer.innerHTML = "";

        setTimeout(async () => {
            dayRunning = false;
            startBtn.disabled = false;
            dayCounter++;

            // Check if player is already broke — skip straight to game over
            const available = machineList.filter(m => m.getMachineAvail());
            const canAffordMin = available.some(m => playerMoney >= m.getMinBet());

            if (playerMoney <= 0 || !canAffordMin) {
                document.getElementById("phase1").classList.add("hidden");
                triggerGameOver();
                return;
            }

            // Show the White Rabbit transition overlay
            document.getElementById("phase1").classList.add("hidden");
            await showWhiteRabbitTransition();

            // Now enter Phase 2
            startPhase2();
        }, PAUSE_AFTER_MS);
    }, DAY_MS);
}


// ══════════════════════════════════════════════════════════
// PHASE 2 — REVERSAL (Victim Mode)
// ══════════════════════════════════════════════════════════

function startPhase2() {
    const available = machineList.filter(m => m.getMachineAvail());
    if (available.length === 0) { triggerGameOver(); return; }

    // Pick only machines the player can afford
    const affordable = available.filter(m => playerMoney >= m.getMinBet());
    if (affordable.length === 0) { triggerGameOver(); return; }

    phase2Machine = affordable[randInt(0, affordable.length - 1)];

    // Required plays
    const profit = playerMoney - moneyAtDayStart;
    const profitPct = moneyAtDayStart > 0 ? (profit / moneyAtDayStart) : 0;
    phase2PlaysRequired = profitPct <= 0 ? 1 : Math.max(1, Math.floor(maxAmountGamble * profitPct));
    phase2PlaysLeft = phase2PlaysRequired;

    // Starting bet
    const minBet = phase2Machine.getMinBet();
    phase2Bet = (minBet * 4 > playerMoney)
        ? minBet
        : Math.floor(playerMoney * 0.2);
    phase2Bet = Math.max(phase2Bet, minBet);

    buildPhase2UI();
    document.getElementById("phase2").classList.remove("hidden");
}

function buildPhase2UI() {
    const phase2 = document.getElementById("phase2");
    phase2.innerHTML = `
        <div class="phase-label">Phase 2 — Reversal</div>

        <div class="p2-info-row">
            <div class="p2-info-card">
                <span class="p2-info-label">Machine</span>
                <span class="p2-info-val" id="p2MachineNum">#${phase2Machine.getMachineNum()}</span>
            </div>
            <div class="p2-info-card">
                <span class="p2-info-label">Balance</span>
                <span class="p2-info-val" id="p2Money">$${Math.round(playerMoney)}</span>
            </div>
            <div class="p2-info-card">
                <span class="p2-info-label">Plays Left</span>
                <span class="p2-info-val" id="p2PlaysLeft">${phase2PlaysLeft} / ${phase2PlaysRequired}</span>
            </div>
            <div class="p2-info-card">
                <span class="p2-info-label">Win Rate</span>
                <span class="p2-info-val">${phase2Machine.getWinRate()}%</span>
            </div>
            <div class="p2-info-card">
                <span class="p2-info-label">Payout</span>
                <span class="p2-info-val">${phase2Machine.getPayout()}×</span>
            </div>
        </div>

        <div class="p2-bet-row">
            <label class="p2-bet-label" for="p2BetInput">
                Your Bet &nbsp;—&nbsp; Min: $${phase2Machine.getMinBet()}
            </label>
            <div class="p2-bet-controls">
                <button class="p2-bet-adj" id="p2BetDown">−</button>
                <input type="number"
                    id="p2BetInput"
                    class="p2-bet-input"
                    value="${Math.round(phase2Bet)}"
                    min="${phase2Machine.getMinBet()}"
                    step="${phase2Machine.getMinBet()}" />
                <button class="p2-bet-adj" id="p2BetUp">+</button>
            </div>
        </div>

        <div class="p2-reels" id="p2Reels">
            <div class="p2-reel" id="p2Reel0">?</div>
            <div class="p2-reel" id="p2Reel1">?</div>
            <div class="p2-reel" id="p2Reel2">?</div>
        </div>

        <div class="p2-result-msg" id="p2ResultMsg"></div>

        <button class="menu-btn p2-play-btn" id="p2PlayBtn">PULL LEVER</button>
    `;

    const minBet = phase2Machine.getMinBet();

    document.getElementById("p2BetDown").addEventListener("click", () => {
        const inp = document.getElementById("p2BetInput");
        inp.value = Math.max(minBet, parseInt(inp.value, 10) - minBet);
    });

    document.getElementById("p2BetUp").addEventListener("click", () => {
        const inp = document.getElementById("p2BetInput");
        inp.value = Math.min(Math.floor(playerMoney), parseInt(inp.value, 10) + minBet);
    });

    document.getElementById("p2PlayBtn").addEventListener("click", executePhase2Spin);
}

function executePhase2Spin() {
    if (phase2Running) return;
    phase2Running = true;

    // Play lever sound immediately (must be in click handler call stack)
    const electricSfx = new Audio("assets/sounds/electric.mp3");
    electricSfx.volume = 0.8;
    electricSfx.play().catch(err => console.warn("Electric SFX blocked:", err));

    const playBtn = document.getElementById("p2PlayBtn");
    playBtn.disabled = true;

    const minBet = phase2Machine.getMinBet();
    const betInput = document.getElementById("p2BetInput");
    let bet = parseInt(betInput.value, 10);
    bet = Math.max(minBet, Math.min(Math.floor(playerMoney), bet));
    betInput.value = bet;

    if (playerMoney < minBet) {
        setTimeout(() => triggerGameOver(), 300);
        return;
    }

    playerMoney -= bet;
    updateP2Money();

    const roll = rand100();
    const didWin = roll <= phase2Machine.getWinRate();

    const symbols = didWin
        ? (() => { const s = pickSymbol(); return [s, s, s]; })()
        : pickLosingSymbols();

    const reelIds = ["p2Reel0", "p2Reel1", "p2Reel2"];
    reelIds.forEach(id => {
        const el = document.getElementById(id);
        el.textContent = "?";
        el.className = "p2-reel spinning";
    });

    reelIds.forEach((id, i) => {
        setTimeout(() => {
            const el = document.getElementById(id);
            el.classList.remove("spinning");
            el.textContent = symbols[i];
            el.classList.add(didWin ? "reel-win" : "reel-lose");
        }, 700 + i * 600);
    });

    setTimeout(() => {
        const resultEl = document.getElementById("p2ResultMsg");

        if (didWin) {
            const winnings = bet * phase2Machine.getPayout();
            playerMoney += winnings;
            const net = Math.round(winnings - bet);
            resultEl.textContent = `WIN! +$${net}`;
            resultEl.className = "p2-result-msg p2-win";
        } else {
            resultEl.textContent = `LOSS. −$${Math.round(bet)}`;
            resultEl.className = "p2-result-msg p2-loss";
        }

        reelIds.forEach(id => {
            document.getElementById(id).classList.remove("reel-win", "reel-lose");
        });

        phase2PlaysLeft--;
        updateP2Money();
        document.getElementById("p2PlaysLeft").textContent =
            `${phase2PlaysLeft} / ${phase2PlaysRequired}`;

        phase2Running = false;

        if (playerMoney < minBet || playerMoney <= 0) {
            setTimeout(() => triggerGameOver(), 900);
            return;
        }

        if (phase2PlaysLeft <= 0) {
            resultEl.textContent += " — You survived!";
            playBtn.textContent = "Survive Another Day →";
            playBtn.disabled = false;
            playBtn.addEventListener("click", returnToPhase1, { once: true });
            return;
        }

        playBtn.disabled = false;
    }, 3000);
}

function updateP2Money() {
    const el = document.getElementById("p2Money");
    if (el) el.textContent = "$" + Math.round(playerMoney);
    updateMoneyDisplay();
}

function returnToPhase1() {
    document.getElementById("phase2").classList.add("hidden");
    updateMoneyDisplay();
    document.getElementById("phase1").classList.remove("hidden");
}


// ══════════════════════════════════════════════════════════
// PHASE 3 — GAME OVER
// ══════════════════════════════════════════════════════════

function triggerGameOver() {
    document.getElementById("phase1").classList.add("hidden");
    document.getElementById("phase2").classList.add("hidden");

    const phase3 = document.getElementById("phase3");
    phase3.classList.remove("hidden");

    document.getElementById("endMessage").textContent =
        "You had your time, but your greed caught up to you.";
    document.getElementById("surviveTime").textContent = dayCounter;

    let homeBtn = document.getElementById("returnHomeBtn");
    if (!homeBtn) {
        homeBtn = document.createElement("button");
        homeBtn.id = "returnHomeBtn";
        homeBtn.className = "menu-btn";
        homeBtn.textContent = "Return to Home";
        phase3.appendChild(homeBtn);
    }

    homeBtn.onclick = () => {
        resetGame();
        phase3.classList.add("hidden");
        document.getElementById("startMenu").classList.remove("hidden");
    };
}

function resetGame() {
    dayCounter = 0;
    officialBunnyTurnout = 0;
    playerMoney = 1000;
    moneyAtDayStart = 1000;
    phase2Running = false;
    phase2PlaysRequired = 1;
    phase2PlaysLeft = 1;
    phase2Machine = null;
    phase2Bet = 50;

    zones = [true, false, false];
    for (let i = 0; i < machineList.length; i++) {
        machineList[i].setMachineAvail(i < 3);
    }

    const zone2 = document.getElementById("zone2");
    const zone3 = document.getElementById("zone3");
    if (zone2) zone2.classList.add("locked");
    if (zone3) { zone3.classList.add("locked"); zone3.classList.add("zone3-disabled"); }

    updateMoneyDisplay();
}


// ──────────────────────────────────────────────────────────
// Slider live-output updates
// ──────────────────────────────────────────────────────────
function initializeSliderOutputs() {
    document.querySelectorAll('#cheatPopup input[type="range"]').forEach(slider => {
        const out = document.querySelector(`output[for="${slider.id}"]`);
        if (!out) return;
        out.value = slider.value;
        slider.addEventListener("input", () => {
            out.value = slider.value;
            out.textContent = slider.value;
        });
    });

    const winRate = document.getElementById("parameter_winRate");
    if (winRate) {
        winRate.addEventListener("input", () => {
            document.getElementById("winRateVal").textContent = winRate.value;
        });
    }
    const minBet = document.getElementById("parameter_minBet");
    if (minBet) {
        minBet.addEventListener("input", () => {
            document.getElementById("minBetVal").textContent = minBet.value;
        });
    }
    const override = document.getElementById("parameter_override");
    if (override) {
        override.addEventListener("input", () => {
            document.getElementById("overrideVal").textContent =
                override.value === "1" ? "On" : "Off";
        });
    }
}


// ──────────────────────────────────────────────────────────
// All event listeners
// ──────────────────────────────────────────────────────────
function initializeEventListeners() {
    document.getElementById("cheat_open_btn").addEventListener("click", () => {
        document.getElementById("cheatPopup").classList.remove("hidden");
        document.getElementById("cheat_playerMoney").value = playerMoney;
        document.getElementById("cheat_bunnyMoney").value = bunnyMoney;
        document.getElementById("cheat_maxBunnies").value = maxBunnies;
        document.getElementById("cheat_maxTries").value = bunnyTries;
        document.getElementById("cheat_whiteRabbitChance").value = whiteRabbitChance;
        document.getElementById("cheat_playerTries").value = maxAmountGamble;
        document.getElementById("cheat_gainPercent").value = percentageGain;

        document.querySelectorAll('#cheatPopup input[type="range"]').forEach(slider => {
            const out = document.querySelector(`output[for="${slider.id}"]`);
            if (out) { out.value = slider.value; out.textContent = slider.value; }
        });
    });

    document.getElementById("cheat_submit_btn").addEventListener("click", () => {
        document.getElementById("cheatPopup").classList.add("hidden");
        playerMoney       = parseInt(document.getElementById("cheat_playerMoney").value, 10);
        bunnyMoney        = parseInt(document.getElementById("cheat_bunnyMoney").value, 10);
        maxBunnies        = parseInt(document.getElementById("cheat_maxBunnies").value, 10);
        bunnyTries        = parseInt(document.getElementById("cheat_maxTries").value, 10);
        whiteRabbitChance = parseInt(document.getElementById("cheat_whiteRabbitChance").value, 10);
        maxAmountGamble   = parseInt(document.getElementById("cheat_playerTries").value, 10);
        percentageGain    = parseInt(document.getElementById("cheat_gainPercent").value, 10);
        updateMoneyDisplay();
    });

    document.getElementById("play_btn").addEventListener("click", () => {
        document.getElementById("startMenu").classList.add("hidden");
        document.getElementById("cheatPopup").classList.add("hidden");
        document.getElementById("phase1").classList.remove("hidden");
        updateMoneyDisplay();
    });

    for (let i = 1; i <= 9; i++) {
        const slot = document.getElementById("slot" + i);
        if (slot) slot.addEventListener("click", () => openSlotPopup(i));
    }

    const machineSubmitBtn = document.getElementById("machine_submit_btn");
    if (machineSubmitBtn) machineSubmitBtn.addEventListener("click", saveSlotPopup);

    document.querySelectorAll(".zone-unlock-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            unlockZone(parseInt(btn.dataset.zone, 10));
        });
    });

    // Start Day — audio fix applied
    const startDayBtn = document.getElementById("startDayBtn");
    const startSfx    = document.getElementById("sfx_startGamble");

    if (startDayBtn) {
        startDayBtn.addEventListener("click", () => {
            startDayBtn.disabled = true;

            if (startSfx) {
                startSfx.currentTime = 0;
                startSfx.volume = 0.7;
                startSfx.play().catch(err => console.warn("Audio blocked:", err));
            }

            setTimeout(() => { runDay(); }, 1200);
        });
    }
}


// ──────────────────────────────────────────────────────────
// Boot
// ──────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
    document.getElementById("startMenu").classList.remove("hidden");
    document.getElementById("cheatPopup").classList.add("hidden");
    document.getElementById("phase1").classList.add("hidden");
    document.getElementById("phase2").classList.add("hidden");
    document.getElementById("phase3").classList.add("hidden");
    document.getElementById("machinePopup").classList.add("hidden");

    initializeEventListeners();
    initializeSliderOutputs();
    updateMoneyDisplay();
});