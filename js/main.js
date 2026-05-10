// Global parameters
var dayCounter = 0;
var officialBunnyTurnout = 0;

//Amount of money to start
var playerMoney = 1000;
var bunnyMoney = 100;
//Max bunnies per zone/machine
var maxBunnies = 9;
//Max amount of tries bunnies will do
var bunnyTries = 3;
//Chance the owner has to even gamble in the first place
var whiteRabbitChance = 100;
//Max amount of times the user has to gamble in phase 2
var maxAmountGamble = 4;
//Percentage of total gain/loss from bunnies
var percentageGain = 100;

//stores machines
var machineCount = 9; //Must hard code this
var zones = [true,false,false]; //zones available
var machineList = []; //will be filled in the next section
//initialize available machines
for (let i = 0; i < machineCount; i++){
    machineList.push(new Machine(i+1, false));
}
for (let i = 0; i < machineCount/zones.length; i++){
    machineList[i].setMachineAvail(true);
}

//Bunny class : 
//money() | trial()
class Bunny { 
    constructor() {
        // (int) money
        this.money = bunnyMoney;
        // (int) tries
        this.tries = bunnyTries;
    }

    //Handles Money
    modMoney(amount) {this.money = this.money + amount;}
    setMoney(amount) {this.money = amount;}
    getMoney() {return this.money;}

    //Handles Trials (deprecated)
    modTrial(amount) {this.money = this.money + amount;}
    setTrial(amount) {this.money = amount;}
    getTrial() {return this.money;}
    
}

//Machine [zone] class : 
//machineNum() | machineAvail() | winRate() | payout() | minBet() | override()
class Machine {
    constructor(num, availability) {
        // Machine number
        this.machineNum = num;
        //Machine available/unlocked
        this.machineAvail = availability;
        // Win rate : 0-100% (0% weight)
        this.winRate = 50;
        // Payout : 1x, 1.5x, 2x, 2.5x, 3x (10% per tier) (50% weight)
        this.payout = 2.0;
        // Minimum bet : $0 - $100 (round[dollar/2] => %) (50% weight)
        this.minBet = 50;
        // Override win rate : true/false (0% weight)
        this.override = false;
    }

    //Handles machine number
    setMachineNum(limit) {this.machineNum = limit;}
    getMachineNum() {return this.machineNum;}

    //Handles machine availability
    setMachineAvail(limit) {this.machineAvail = limit;}
    getMachineAvail() {return this.machineAvail;}

    //Handles win rate
    setWinRate(limit) {this.winRate = limit;}
    getWinRate() {return this.winRate;}

    //Handles payout
    setPayout(limit) {this.payout = limit;}
    getPayout() {return this.payout;}

    //Handles minimum bet
    setMinBet(limit) {this.minBet = limit;}
    getMinBet() {return this.minBet;}

    //Handles override
    setOverride(limit) {this.override = limit;}
    getOverride() {return this.override;}
}

//random integer generator
function rand100() {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return (array[0] % 100) + 1;
}

//Main machine calculation function
function machineCalc(mach){
    //if machine is even unlocked
    if (mach.getMachineAvail()){
        //mach = machine object
        //percentage chance of bunnies to come
        let attraction = 0;
        //Amount of bunnies that actually show up
        let bunnyTurnout = 0;
        //list of bunny wins (int)
        let bunnyList = [];

        //payout weight consideration
        const pay = parseFloat(mach.getPayout());
        if (payout >= 3.0) attraction += 50;
        else if (payout >= 2.5) attraction += 40;
        else if (payout >= 2.0) attraction += 30;
        else if (payout >= 1.5) attraction += 20;
        else if (payout >= 1.0) attraction += 10;

        //bet weight consideration
        attraction += Math.round(mach.getMinBet()/2);

        //setting bunny turnout
        for (let i = 0; i < maxBunnies; i++){
            let tempRandom = rand100();
            if (tempRandom <= attraction){
                bunnyTurnout++;
            }
        }
        
        //setting official turnout
        officialBunnyTurnout += bunnyTurnout;

        //official winnings calculation
        for (let i = 0; i < bunnyTurnout; i++){
            //individual bunny earnings
            let earnings = 0;
            let currentBunny = new Bunny();

            function earningCalcShort(){
                return mach.getMinBet()*mach.getPayout();
            }

            //trials for each bunny
            for (let t = 0; t < bunnyTries; t++){
                //if they still have money to bet on the machine
                if (currentBunny.getMoney() >= mach.getMinBet()){
                    //If they win
                    let winNum = rand100();
                    currentBunny.modMoney(-mach.getMinBet());
                    earings += mach.getMinBet();

                    if (mach.getOverride() && winNum <= 10){ //overriding
                            earnings += currentBunny.getMoney();
                            currentBunny.setMoney(0);
                        } else {
                            earnings += earningCalcShort;
                            currentBunny.modMoney(-earningCalcShort);
                        }
                    } else if (winNum <= mach.getWinRate()){ //actual win
                        earnings -= earningCalcShort;
                        currentBunny.modMoney(earningCalcShort);
                    } else { //actual loss
                        if (currentBunny.getMoney() - earningCalcShort < 0){
                            earnings += currentBunny.getMoney();
                            currentBunny.setMoney(0);
                        } else {
                            earnings += earningCalcShort;
                            currentBunny.modMoney(-earningCalcShort);
                        }
                    }
                }
            }

            bunnyList.push(earnings*(percentageGain/100));
        }

        return bunnyList;    
    }
}




/* 
ANIMATION:
So when the day begins, the bunnies that will come and the amount 
that they will earn is already established

the animation at that point on the screen is basically a random
animation that will pop up, and over the span of 30 seconds, the 
profits calculated and the negative stuff 


To do:
- make the slot calculation function
- bunnies profits -> bunnies.setGain(slot(2))...
    - bunny tries slot 2

Pitch:
Slot machine tycoon
but tycoon games are too boring, aren't you just staring at
the screen all day...
that's what our owners thought, but little did they know
the spirit of the rabbit who's people you scammed is seeking its
revenge...
spirit of the white rbbit at the end of the day makes 
you play the very slot machines you created

the basic goal is to survive as long as possible


*/







