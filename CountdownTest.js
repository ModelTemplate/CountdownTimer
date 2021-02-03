// Generating HTML for testing

function Countdown(seedDate, loopTime, loopUnit, loopLimit, delayTime, delayUnit, bText, 
        bDelayText, aText, aDelayText, endText, delayDisplay, dst, dateFormat, dateLabels, separators) {
    this.seedDate = seedDate ?? "January 1, 1970 00:00:00 UTC";
    this.bText = bText ?? "";
    this.bDelayText = bDelayText ?? "";
    this.aText = aText ?? "";
    this.aDelayText = aDelayText ?? "";
    this.loopTime = loopTime ?? 60;
    this.loopUnit = loopUnit ?? "s";
    this.loopLimit = loopLimit ?? -1;
    this.endText = endText ?? "";
    this.delayTime = delayTime ?? 0;
    this.delayUnit = delayUnit ?? "s";
    this.delayDisplay = delayDisplay ?? "";
    this.dst = dst ?? "";
    this.dateFormat = dateFormat ?? "YY MM DD hh mm ss";
    this.dateLabels = dateLabels ?? "single";
    this.separators = separators ?? " ";
}

var countdown = new Countdown("January 30, 2021 22:35:00 UTC");
console.log(countdown);
generateHTML(countdown);

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
