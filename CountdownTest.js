// Generating HTML for testing
// References:
// https://www.markhansen.co.nz/javascript-optional-parameters/
// https://stackoverflow.com/questions/50715033/javascript-constructor-with-optional-parameters

generateCountdownHTML(new Countdown());
generateCountdownHTML(new Countdown({ loopTime: "10s" }), "Testing 10 second loop for ∞ times");
generateCountdownHTML(new Countdown({ loopTime: "1m" }), "Testing one minute loop for ∞ times");
generateCountdownHTML(new Countdown({ loopTime: "1h" }), "Testing one hour loop for ∞ times");
generateCountdownHTML(new Countdown({ loopTime: "1D", loopLimit: 1000 }), "Testing one day loop for 1000 times");
generateCountdownHTML(new Countdown({ loopTime: "1M", loopLimit: 1000 }), "Testing one month loop for 1000 times");
generateCountdownHTML(new Countdown({ loopTime: "1Y", loopLimit: 1000 }), "Testing one year loop for 1000 times");
generateCountdownHTML(new Countdown({ loopTime: "10s", loopLimit: 0 }), "Testing 10 second loop for 0 times");
generateCountdownHTML(new Countdown({ 
    seedDate: "January 1, 2021 00:00:00 UTC", loopTime: "2Y", loopLimit: 1000, bText: "Countdown (", aText: ")", 
    dateFormat: "YY MM DD", dateLabels: "full"
}), "Testing formatting");
let start = new Date("January 1, 2021 00:00:00 UTC");
let end = new Date();
let diff = end.getTime() - start.getTime();
generateCountdownHTML(new Countdown({ seedDate: start.toISOString(), loopTime: "1D", loopLimit: (diff / 86400000) + 1 }), 
        "Testing one day loop starting at 1/1/2021 and ending one day from today (UTC)");
generateCountdownHTML(new Countdown({ loopTime: "30s", delayTime: "10s" }), "Testing 10 second delay timer");
generateCountdownHTML(new Countdown({ loopTime: "30s", delayTime: "10s", delayDisplay: false }), "Testing hiding the delay timer");
generateCountdownHTML(new Countdown({ loopLimit: -999 }), "Testing negative loopLimit");
generateCountdownHTML(new Countdown({ bText: "", aText: "", dateLabels: "" }), "Testing no labels");
generateCountdownHTML(new Countdown({ bText: "(", aText: ")", dateFormat: "hh:mm:ss", dateLabels: "" }), "Testing minimalistic timer");

/**
 * Represents a countdown timer.
 * @param {*} param0 - a dictionary of parameters for countdown timer
 */
function Countdown({
    seedDate = "January 1, 1970 00:00:00 UTC", 
    loopTime = "60s",
    loopLimit = -1, 
    bText = "Timer Ends In ", 
    bDelayText = "Delay Timer Ends In ", 
    aText = "&nbsp;(Placeholder Text)", 
    aDelayText = "&nbsp;(Placeholder Text)", 
    endText = "Countdown Complete", 
    delayTime = "0s",
    delayDisplay = true, 
    dst = true, 
    dateFormat = "YY MM DD hh mm ss", 
    dateLabels = "single", 
} = {}) {
    this.seedDate = seedDate;
    this.loopTime = loopTime;
    this.loopLimit = loopLimit;

    this.bText = bText;
    this.bDelayText = bDelayText;

    this.timer = "";

    this.aText = aText;
    this.aDelayText = aDelayText;
    this.endText = endText;
    this.delayTime = delayTime;
    this.delayDisplay = delayDisplay ? "" : "false";
    this.dst = dst ? "" : "false";
    this.dateFormat = dateFormat;
    this.dateLabels = dateLabels;
}

// TODO: Why do timer elements use Ariel font?
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
