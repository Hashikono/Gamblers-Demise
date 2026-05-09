// Global parameters
var dayCounter = 0;

//Amount of money to start
var playerMoney = 1000;
var bunnyMoney = 100;
//Max amount of tries bunnies will do
var bunnyTries = 3;
//Chance the owner has to even gamble in the first place
var whiteRabbitChance = 100;
//Max amount of times the user has to gamble in phase 2
var maxAmountGamble = 4;

//Bunny class
class Bunny {
    constructor() {
        // (int) money
        this.money = bunnyMoney;
        // (int) tries
        this.tries = bunnyTries;
    }

    //Handles Money
    modMoney(amount) {
        this.money = this.money + amount;
    }

    setMoney(amount) {
        this.money = amount;
    }

    getMoney() {
        return this.money;
    }

    //Handles Trials
    modTrial(amount) {
        this.money = this.money + amount;
    }

    setTrial(amount) {
        this.money = amount;
    }

    getTrial() {
        return this.money;
    }
    
}

//Slot zone/machine class
class Machine {
    constructor() {
        // Win rate : 0-100% (0% weight)
        this.winRate = 50;
        // Payout : 1x, 1.5x, 2x, 2.5x, 3x (10% per tier) (50% weight)
        this.payout = 2;
        // Minimum bet : $0 - $100 (round[dollar/2] => %) (50% weight)
        this.minBet = 50;
        // Override win rate : true/false (0% weight)
        this.override = false;
    }

    //Handles
    setMoney(amount) {
        this.money = amount;
    }

    getMoney() {
        return this.money;
    }

    //Handles Trials
    modTrial(amount) {
        this.money = this.money + amount;
    }

    setTrial(amount) {
        this.money = amount;
    }

    getTrial() {
        return this.money;
    }
    
}

//Main slot calculation function
function slot(){

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

const array = new Uint32Array(1);
window.crypto.getRandomValues(array);
console.log(array[0]); 







