// Generating HTML for testing
// https://www.markhansen.co.nz/javascript-optional-parameters/

/**
 * Represents a countdown timer
 * @param {*} seedDate 
 * @param {*} loopTime 
 * @param {*} loopUnit 
 * @param {*} options 
 */
function Countdown(seedDate, loopTime, loopUnit, options) {
    var options = options ?? {};

    this.seedDate = seedDate ?? "January 1, 1970 00:00:00 UTC";
    this.loopTime = loopTime ?? 60;
    this.loopUnit = loopUnit ?? "s";

    this.loopLimit = options.loopLimit || -1;
    this.bText = options.bText || "";
    this.bDelayText = options.bDelayText || "";
    this.aText = options.aText || "";
    this.aDelayText = options.aDelayText || "";
    this.endText = options.endText || "";
    this.delayTime = options.delayTime || 0;
    this.delayUnit = options.delayUnit || "s";
    this.delayDisplay = options.delayDisplay || "";
    this.dst = options.dst || "";
    this.dateFormat = options.dateFormat || "YY MM DD hh mm ss";
    this.dateLabels = options.dateLabels || "single";
    this.separators = options.separators || " ";
}

var countdown = new Countdown("January 30, 2021 22:35:00 UTC");
console.log(countdown);
generateHTML(countdown);
generateHTML(new Countdown(null, 10, null));

/**
 * Add HTML elements related to countdown to DOM
 * @param {*} countdown - a Countdown object
 */
function generateHTML(countdown) {
    let countdownElement = document.createElement("span");
    countdownElement.className = "customcountdown";
    countdownElement.style = "font-size:18px;";
    for (let key of Object.keys(countdown)) {
        let newElement = document.createElement("span");
        newElement.className = key;
        newElement.style = "display:none;";
        newElement.innerHTML = countdown[key];
        countdownElement.appendChild(newElement);
    }
    document.body.appendChild(countdownElement);
}
