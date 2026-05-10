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
// ──────────────────────────────────────────────────────────
var machineCount = 9;
var zones = [true, false, false];
var machineList = [];

for (let i = 0; i < machineCount; i++) {
    machineList.push(new Machine(i + 1, false));
}
for (let i = 0; i < machineCount / zones.length; i++) {
    machineList[i].setMachineAvail(true);
}


// ──────────────────────────────────────────────────────────
// Random integer generator (1-100)
// ──────────────────────────────────────────────────────────
function rand100() {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return (array[0] % 100) + 1;
}


// ──────────────────────────────────────────────────────────
// Machine calculation (FIXED: was using undefined `payout`,
// calling getMinBet without parens, calling currentBet())
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
// SLOT POPUP — open / populate / save
// ──────────────────────────────────────────────────────────
function openSlotPopup(slotNum) {
    currentSlot = slotNum;
    const m = machineList[slotNum - 1];

    // Populate fields with current machine values
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
// Slider live-output updates inside the cheat popup
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

    // Slot popup live values
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

        // Sync outputs after setting values
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
    });

    // Play button → enter Phase 1
    document.getElementById("play_btn").addEventListener("click", () => {
        document.getElementById("startMenu").classList.add("hidden");
        document.getElementById("cheatPopup").classList.add("hidden");
        document.getElementById("phase1").classList.remove("hidden");
        console.log(machineList);
    });

    // Wire up all 9 slot hitboxes to open the slot popup
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

    // Start Day button (placeholder)
    const startDayBtn = document.getElementById("startDayBtn");
    if (startDayBtn) {
        startDayBtn.addEventListener("click", () => {
            console.log("Running day with machines:", machineList);
            // TODO: loop machineCalc(machineList[i]) for active machines
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
});