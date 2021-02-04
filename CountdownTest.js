// Generating HTML for testing
// References:
// https://www.markhansen.co.nz/javascript-optional-parameters/
// https://stackoverflow.com/questions/50715033/javascript-constructor-with-optional-parameters

generateCountdownHTML(new Countdown());
generateCountdownHTML(new Countdown({ loopTime: 10 }), "Testing 10 second loop for ∞ times");
generateCountdownHTML(new Countdown({ loopTime: 1, loopUnit: "m" }), "Testing one minute loop for ∞ times");
generateCountdownHTML(new Countdown({ loopTime: 1, loopUnit: "h" }), "Testing one hour loop for ∞ times");
generateCountdownHTML(new Countdown({ loopTime: 1, loopUnit: "D", loopLimit: 1000 }), "Testing one day loop for 1000 times");
generateCountdownHTML(new Countdown({ loopTime: 1, loopUnit: "M", loopLimit: 1000 }), "Testing one month loop for 1000 times");
generateCountdownHTML(new Countdown({ loopTime: 1, loopUnit: "Y", loopLimit: 1000 }), "Testing one year loop for 1000 times");
generateCountdownHTML(new Countdown({ loopTime: 10, loopLimit: 0 }), "Testing 10 second loop for 0 times");
generateCountdownHTML(new Countdown({ 
    seedDate: "January 1, 2021 00:00:00 UTC", loopTime: 1, loopUnit: "Y", loopLimit: 1000, bText: "Countdown (", aText: ")", 
    dateFormat: "YY", dateLabels: "full", separators: "-"
}), "Testing formatting");
generateCountdownHTML(new Countdown({ loopTime: 10, delayTime: 5 }), "Testing delay timer");

/**
 * Represents a countdown timer.
 * @param {*} param0 - a dictionary of parameters for countdown timer
 */
function Countdown({
    seedDate = "January 1, 1970 00:00:00 UTC", 
    loopTime = 60, 
    loopUnit = "s", 
    loopLimit = -1, 
    bText = "Timer Ends In ", 
    bDelayText = "Delay Timer Ends In ", 
    aText = "", 
    aDelayText = "", 
    endText = "Countdown Complete", 
    delayTime = 0, 
    delayUnit = "s", 
    delayDisplay = true, 
    dst = true, 
    dateFormat = "YY MM DD hh mm ss", 
    dateLabels = "single", 
    separators = " "
} = {}) {
    this.seedDate = seedDate;
    this.loopTime = loopTime;
    this.loopUnit = loopUnit;
    this.loopLimit = loopLimit;

    this.bText = bText;
    this.bDelayText = bDelayText;

    this.timer = "";

    this.aText = aText;
    this.aDelayText = aDelayText;
    this.endText = endText;
    this.delayTime = delayTime;
    this.delayUnit = delayUnit;
    this.delayDisplay = delayDisplay ? "" : "false";
    this.dst = dst ? "" : "false";
    this.dateFormat = dateFormat;
    this.dateLabels = dateLabels;
    this.separators = separators;
}

/**
 * Add HTML elements related to countdown to DOM
 * @param {*} countdown - a Countdown object
 */
function generateCountdownHTML(countdown, testString = "Timer Test") {
    let testHeader = document.createElement("h3");
    testHeader.innerText = testString;
    document.body.appendChild(testHeader);

    var countdownElement = document.createElement("span");
    countdownElement.className = "customcountdown";
    countdownElement.style = "font-size:18px;";
    for (let key of Object.keys(countdown)) {
        let newElement = document.createElement("span");
        newElement.className = key;
        newElement.style = (key === "timer") ? "display:visible;" : "display:none;";
        newElement.innerHTML = countdown[key];
        countdownElement.appendChild(newElement);
    }
    document.body.appendChild(countdownElement);
    document.body.appendChild(document.createElement("hr"));
}
