// ──────────────────────────────────────────────────────────
// Global parameters
// ──────────────────────────────────────────────────────────
var dayCounter = 0;
var officialBunnyTurnout = 0;

var playerMoney = 1000;
var bunnyMoney = 100;
var maxBunnies = 5;
var bunnyTries = 3;
var whiteRabbitChance = 100;
var maxAmountGamble = 4;
var percentageGain = 100;

// Which slot is currently being edited
var currentSlot = 1;

// Day-run state
var dayRunning = false;


// ──────────────────────────────────────────────────────────
// Bunny class
// ──────────────────────────────────────────────────────────
class Bunny {
    constructor() {
        this.money = bunnyMoney;
        this.tries = bunnyTries;
    }
    modMoney(amount) { this.money = this.money + amount; }
    setMoney(amount) { this.money = amount; }
    getMoney() { return this.money; }
    modTrial(amount) { this.tries = this.tries + amount; }
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
    setMachineNum(v) { this.machineNum = v; }
    getMachineNum()  { return this.machineNum; }
    setMachineAvail(v) { this.machineAvail = v; }
    getMachineAvail()  { return this.machineAvail; }
    setWinRate(v) { this.winRate = v; }
    getWinRate()  { return this.winRate; }
    setPayout(v) { this.payout = v; }
    getPayout()  { return this.payout; }
    setMinBet(v) { this.minBet = v; }
    getMinBet()  { return this.minBet; }
    setOverride(v) { this.override = v; }
    getOverride()  { return this.override; }
}


// ──────────────────────────────────────────────────────────
// Machine list initialization
// Zone 1 (slots 1-3) unlocked by default; Zone 2 (4-6), Zone 3 (7-9) locked
// ──────────────────────────────────────────────────────────
var machineCount = 9;
var zones = [true, false, false]; // zone unlock state
var machineList = [];

for (let i = 0; i < machineCount; i++) {
    machineList.push(new Machine(i + 1, false));
}
// Initial availability: only zone 1 machines (slots 1-3)
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


// ──────────────────────────────────────────────────────────
// Machine calculation
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
// ZONE UNLOCK ($2000 buttons)
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
        // Unlock slot machines 4, 5, 6
        machineList[3].setMachineAvail(true);
        machineList[4].setMachineAvail(true);
        machineList[5].setMachineAvail(true);

        const zone2 = document.getElementById("zone2");
        zone2.classList.remove("locked");

        // Once zone 2 is unlocked, zone 3 becomes available to purchase
        const zone3 = document.getElementById("zone3");
        zone3.classList.remove("zone3-disabled");

    } else if (zoneNum === 3) {
        // Zone 3 can only unlock if zone 2 is already unlocked
        if (!zones[1]) {
            console.log("Must unlock zone 2 first");
            playerMoney += cost; // refund
            updateMoneyDisplay();
            return false;
        }

        zones[2] = true;
        machineList[6].setMachineAvail(true);
        machineList[7].setMachineAvail(true);
        machineList[8].setMachineAvail(true);

        const zone3 = document.getElementById("zone3");
        zone3.classList.remove("locked");
    }

    return true;
}


// ──────────────────────────────────────────────────────────
// SLOT POPUP
// ──────────────────────────────────────────────────────────
function openSlotPopup(slotNum) {
    currentSlot = slotNum;
    const m = machineList[slotNum - 1];

    // Don't open popup for locked machines
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
// Spawns a bunny element, walks it to a random slot machine,
// pauses there, then walks it off-screen and removes it.
// ──────────────────────────────────────────────────────────
function spawnBunny(targetMachineIndex, totalDurationMs) {
    const floor = document.getElementById("casinoFloor");
    const bunnyLayer = document.getElementById("bunnyLayer");

    // Get target slot machine element's position relative to floor
    const targetEl = document.querySelector(`.slotMachine[data-slot="${targetMachineIndex + 1}"]`);
    if (!targetEl) return;

    const floorRect = floor.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();
    const targetX = targetRect.left - floorRect.left + targetRect.width / 2 - 16;
    const targetY = targetRect.top - floorRect.top + targetRect.height / 2 - 16;

    // Create bunny element
    const bunny = document.createElement("img");
    bunny.src = "assets/bunny.svg";
    bunny.className = "bunny walking";
    bunny.style.left = (floor.clientWidth / 2 - 16) + "px";  // start at entrance (center bottom)
    bunny.style.top = (floor.clientHeight - 30) + "px";
    bunny.style.setProperty('--dir', '0deg');
    bunnyLayer.appendChild(bunny);

    // Walk to slot machine after a brief delay
    setTimeout(() => {
        bunny.style.left = targetX + "px";
        bunny.style.top = targetY + "px";
    }, 50);

    // Pause at machine, then leave
    const walkTime = 1500;
    const stayTime = totalDurationMs - walkTime - 1500;

    setTimeout(() => {
        // Walk back out the entrance
        bunny.style.left = (floor.clientWidth / 2 - 16) + "px";
        bunny.style.top = (floor.clientHeight + 40) + "px";
    }, walkTime + Math.max(stayTime, 200));

    // Remove bunny from DOM
    setTimeout(() => {
        if (bunny.parentNode) bunny.parentNode.removeChild(bunny);
    }, totalDurationMs);
}


// ──────────────────────────────────────────────────────────
// RUN THE DAY
// 15 seconds total. During this window:
//   - Calculate earnings from all unlocked/available machines
//   - Flatten the earnings list, distribute payouts periodically
//   - Spawn 10 random bunnies that roam to slot machines
//   - Update the bunny counter live
//   - At 15s end, wait 2s, then switch to phase 2
// ──────────────────────────────────────────────────────────
function runDay() {
    if (dayRunning) return;
    dayRunning = true;

    const DAY_MS = 15000;
    const PAUSE_AFTER_MS = 2000;
    const TOTAL_BUNNIES = 10;

    // Disable Start Day button during the day
    const startBtn = document.getElementById("startDayBtn");
    startBtn.disabled = true;

    // Reset bunny turnout for this day
    officialBunnyTurnout = 0;

    // 1) Calculate earnings list from all available machines
    let allEarnings = [];
    for (let i = 0; i < machineList.length; i++) {
        if (machineList[i].getMachineAvail()) {
            const machineEarnings = machineCalc(machineList[i]);
            if (machineEarnings && machineEarnings.length) {
                allEarnings = allEarnings.concat(machineEarnings);
            }
        }
    }

    // Set up the HUD - max possible visitors = maxBunnies * (available machines)
    const availableMachineCount = machineList.filter(m => m.getMachineAvail()).length;
    const maxPossibleBunnies = maxBunnies * availableMachineCount;
    updateBunnyCount(0, maxPossibleBunnies);

    // 2) Schedule periodic earnings payouts spread across the day
    // We want every earning value to be applied by the end
    if (allEarnings.length > 0) {
        const payoutInterval = DAY_MS / allEarnings.length;
        allEarnings.forEach((amount, idx) => {
            setTimeout(() => {
                playerMoney += amount;
                updateMoneyDisplay();
            }, payoutInterval * (idx + 1) - 100);
        });
    }

    // 3) Spawn 10 roaming bunnies across the 15 seconds
    // Pick random available machines as targets
    const availableMachineIndices = [];
    for (let i = 0; i < machineList.length; i++) {
        if (machineList[i].getMachineAvail()) availableMachineIndices.push(i);
    }

    let bunniesVisited = 0;
    for (let b = 0; b < TOTAL_BUNNIES; b++) {
        // Stagger spawns through the first ~12 seconds, so they have time to leave
        const spawnDelay = (DAY_MS - 3000) * (b / TOTAL_BUNNIES) + randInt(0, 400);
        setTimeout(() => {
            const target = availableMachineIndices[randInt(0, availableMachineIndices.length - 1)];
            spawnBunny(target, 3000);
            bunniesVisited++;
            updateBunnyCount(bunniesVisited, maxPossibleBunnies);
        }, spawnDelay);
    }

    // 4) End of day → 2 second pause → switch to phase 2
    setTimeout(() => {
        // Clean up any straggler bunnies
        const layer = document.getElementById("bunnyLayer");
        if (layer) layer.innerHTML = "";

        setTimeout(() => {
            document.getElementById("phase1").classList.add("hidden");
            document.getElementById("phase2").classList.remove("hidden");

            // Sync phase 2 money display if it exists
            const phase2Money = document.getElementById("money");
            if (phase2Money) phase2Money.textContent = Math.round(playerMoney);

            dayRunning = false;
            startBtn.disabled = false;
            dayCounter++;
        }, PAUSE_AFTER_MS);
    }, DAY_MS);
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
    // Cheat popup open
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
            if (out) {
                out.value = slider.value;
                out.textContent = slider.value;
            }
        });
    });

    // Cheat popup submit
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

    // Play button → enter Phase 1
    document.getElementById("play_btn").addEventListener("click", () => {
        document.getElementById("startMenu").classList.add("hidden");
        document.getElementById("cheatPopup").classList.add("hidden");
        document.getElementById("phase1").classList.remove("hidden");
        updateMoneyDisplay();
    });

    // Slot hitboxes — open settings (only if machine available)
    for (let i = 1; i <= 9; i++) {
        const slot = document.getElementById("slot" + i);
        if (slot) {
            slot.addEventListener("click", () => openSlotPopup(i));
        }
    }

    // Slot popup submit
    const machineSubmitBtn = document.getElementById("machine_submit_btn");
    if (machineSubmitBtn) {
        machineSubmitBtn.addEventListener("click", saveSlotPopup);
    }

    // Zone unlock buttons
    document.querySelectorAll(".zone-unlock-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const zone = parseInt(btn.dataset.zone, 10);
            unlockZone(zone);
        });
    });

    // Start Day button
    const startDayBtn = document.getElementById("startDayBtn");
    if (startDayBtn) {
        startDayBtn.addEventListener("click", runDay);
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