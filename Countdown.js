// Countdown timer that is accurate to the second and accounts for Daylight Savings Time (DST)
// Reference: https://www.w3schools.com/howto/howto_js_countdown.asp

// TODO: Fix delay timer appearing in middle of actual countdown even though actual countdown has not
// gone down to zero

// TODO: Merge loopTime with loopUnit, delayTime with delayUnit, and dateFormat with separators
// (e.g. loopTime = "5s", delayTime = "10Y", dateFormat = "YY-MM-DD hh:mm:ss")

// All of these CSS classes must be present on page in order for countdown timer to function
const COUNTDOWN_CLASSES = ["seedDate", "bText", "bDelayText", "timer",
        "aText", "aDelayText", "loopTime", "loopLimit", "endText", 
        "delayTime", "delayDisplay", "dst", "dateFormat", "dateLabels"];
Object.freeze(COUNTDOWN_CLASSES);

const BARO_COUNTDOWN_CLASSES = {
    PC: "pcPlanet", 
    PS4: "ps4Planet", 
    XB1: "xb1Planet", 
    NSW: "nswPlanet"
};
Object.freeze(BARO_COUNTDOWN_CLASSES);

// All dictionaries related to time use the abbreviated time units as keys
const TIME_UNIT_ABBR = {
    Year: "Y",
    Month: "M",
    Day: "D",
    Hour: "h",
    Minute: "m",
    Second: "s"
};
Object.freeze(TIME_UNIT_ABBR);

const TIME_IN_MILLISECONDS = {
    Y: 31536000000,  // assuming leap years are irrelevant (milliseconds in a day * 365)
    M: 2628000000,   // average milliseconds per month (milliseconds in a year / 12)
    D: 86400000,
    h: 3600000,
    m: 60000,
    s: 1000
};
Object.freeze(TIME_IN_MILLISECONDS);

// Mapping relay names to their respective planet
var relayDict = {
    Mercury: "Larunda",
    Venus: "Vesper",
    Earth: "Strata",
    Saturn: "Kronia",
    Pluto: "Orcus",
    Europa: "Leonov",
    Eris: "Kuiper"
};

// Planets are in order of Baro Ki'Teer's rotation
var platformRelayDict = {
    PC: ["Earth", "Pluto", "Saturn", "Mercury"],
    PS4: ["Earth", "Eris", "Mercury", "Saturn"],
    XB1: ["Venus", "Pluto", "Europa", "Earth"],
    NSW: ["Europa", "Eris", "Mercury", "Venus"]
};

var countdownTimers;

// Assume that this code is only invoked by Template:Countdown
if (document.getElementsByClassName("customcountdown").length > 0) {
    countdownInit();
}

/**
 * Initializes countdown timers.
 */
function countdownInit() {
    // Stores the innerHTML of elements with the CSS class associated with the key;
    // each element contains an object representing all the countdown elements
    // for a particular timer.
    countdownTimers = getTimersElements();
    console.log("Countdown timer elements recognized.");

    updateTimers();
    console.log("Countdown timers started.");

    // Update timer every second
    setInterval(function() {
        updateTimers();
    }, 1000);
}

function updateTimers() {
    // Create countdown timer for each element with .customcountdown class
    for (let i = 0; i < countdownTimers.length; i++) {
        updateTimer(countdownTimers[i], i);
    }
}

/**
 * Calculate time difference and update timer each second.
 * @param {*} timerParams - dictionary that contains parameters for countdown timer
 * @param {*} num - countdown timer instance
 */
function updateTimer(timerParams, num) {
    let now = new Date();

    // Parameters are stored in innerHTML
    let seedDate = new Date((timerParams.seedDate === "") ? "December 3, 2015 00:00:00 UTC" 
        : timerParams.seedDate);

    // Time between loop iterations (i.e. duration of a loop)
    let loopTime = convertTimeToMilliseconds(timerParams.loopTime);
    // Maximum number of loop iterations; it loopLimit is less than 0, then effectively 
    // treat it as infinite number of loops
    let loopLimit = (isNaN(timerParams.loopLimit)) ? 0 : 
        (timerParams.loopLimit < 0) ? Number.MAX_SAFE_INTEGER 
        : Number(timerParams.loopLimit);

    // Splits total loopTime into two time periods, one that is the delayed countdown (i.e.
    // a countdown of the countdown) and the other is the actual countdown
    // (e.g. if delayTime == 20s and loopTime = 60s, the first 20s will be a 20s countdown
    // with delay text while the next 40s will be the actual countdown) 
    let delayTime = convertTimeToMilliseconds(timerParams.delayTime);

    // Show delayed countdown if true
    let delayDisplay = timerParams.delayDisplay === "";

    // delayTime should always be less than total loopTime
    console.log(delayTime, " ", loopTime);
    if (delayTime >= loopTime) {
        throw "ERROR: Cannot have a delayTime that is larger than total loopTime.";
    }

    let numLoops = calculateNumLoops(now, seedDate, 0, loopTime, loopLimit);
    let numLoopsDelay = calculateNumLoops(now, seedDate, delayTime, loopTime, loopLimit);

    let endDate = findEndDate(seedDate, 0, numLoops, loopTime);
    let endDateDelay = findEndDate(seedDate, delayTime, numLoopsDelay, loopTime);
    
    // TODO: duplicate delay parameter may not be needed if we can figure out how to split one
    // loopTime into two separate loops without adding additional parameters by doing some simple subtraction
    // and comparison against delayTime 

    // Accounts for Daylight Saving Time (DST) between now and target date 
    // by default unless otherwise specified
    let dstOffset = (timerParams.dst === "") ? 
        (now.getTimezoneOffset() - endDate.getTimezoneOffset()) * 60 * 1000 : 0;
    let dstOffsetDelay = (timerParams.dst === "") ? 
        (now.getTimezoneOffset() - endDateDelay.getTimezoneOffset()) * 60 * 1000 : 0;
    
    // Total time between now and target date in milliseconds converted
    // to certain time period
    // (i.e. for 120 minutes: years = 0; months = 0; days = 0;
    // hours = 2; minutes = 120; seconds = 7200)
    // time string will result in "00021207200" thus far
    let timeDiff = calculateTimeDiff(now, endDate, dstOffset);  // in milliseconds, rounded to the nearest thousandths place
    let timeDiffDelay = calculateTimeDiff(now, endDateDelay, dstOffsetDelay);
    // console.log("Loop time: " + loopTime + 
    //     " | Time diff: " + timeDiff + 
    //     " | Delay time diff: " + timeDiffDelay + 
    //     " | Loop time - time diff " + (loopTime - timeDiff)
    // );

    let dateFormat = (timerParams.dateFormat === "") ? "YY MM DD hh mm ss" 
        : timerParams.dateFormat;

    // Dictionary of time units based on the specified time periods desired, 
    // sets the time periods to account for the other time periods
    // (i.e. for 120 minutes & "hh mm ss": years = 0; months = 0; days = 0;
    // hours = 2; minutes = 0; seconds = 0)
    // time string will result in "000200" thus far
    let timeDiffByUnit = calcTimeDiffByUnit(timeDiff, dateFormat);
    let timeDiffByUnitDelay = calcTimeDiffByUnit(timeDiffDelay, dateFormat);

    // Based on the specified time periods' desired units, gives each time
    // period in the string certain units
    // (i.e. for 120 minutes & "hh mm ss" & "single": years = 0Y; months = 0M;
    // days = 0D; hours = 02h; minutes = 00m; seconds = 00s)
    // time string will result in "0Y0M0D02h00m00s" thus far
    let timeUnits = getDisplayUnits(timerParams.dateLabels);

    // When loop iterations reaches loop limit, hide normal text, hide delay
    // text, hide normal/delay time periods, and only show end of loop text
    if ((numLoops === loopLimit) && (endDate.getTime() <= now.getTime())) {
        document.getElementById("endText_" + num).setAttribute("style", "display:visible");
        document.getElementById("bText_" + num).setAttribute("style", "display:none");
        document.getElementById("aText_" + num).setAttribute("style", "display:none");
        document.getElementById("bDelayText_" + num).setAttribute("style", "display:none");
        document.getElementById("aDelayText_" + num).setAttribute("style", "display:none");
        $("#timer_" + num).html("");

    // When delay time reaches inputted delay time show delay text, hide normal
    // text, and only show delay time periods specified by date format
    } else if (/* Math.min(timeDiff, timeDiffDelay) === timeDiffDelay */ loopTime - timeDiff < delayTime/*timeDiff - timeDiffDelay < 0*/) {
        document.getElementById("endText_" + num).setAttribute("style", "display:none");
        document.getElementById("bText_" + num).setAttribute("style", "display:none");
        document.getElementById("aText_" + num).setAttribute("style", "display:none");
        document.getElementById("bDelayText_" + num).setAttribute("style", "display:visible");
        document.getElementById("aDelayText_" + num).setAttribute("style", "display:visible");
        if (delayDisplay) {
            // Adding the time values onto the page for delayed time period
            $("#timer_" + num).html(formatTimerNumbers(dateFormat, timeDiffByUnitDelay, timeUnits));
        } else {
            $("#timer_" + num).html("");
        }
    
    // While delay time has yet to reach inputted delay time show normal text,
    // hide delay text, and only show normal time periods specified by date 
    // format
    // (i.e. for 120 minutes & "hh mm ss" & "single" & " " or "&nbsp;": 
    // years = ; months = ; days = ; hours = 02h ;
    // minutes = 00m ; seconds = 00s)
    // Time string will result in "02h 00m 00s" thus far
    } else {
        document.getElementById("endText_" + num).setAttribute("style", "display:none");
        document.getElementById("bText_" + num).setAttribute("style", "display:visible");
        document.getElementById("aText_" + num).setAttribute("style", "display:visible");
        document.getElementById("aDelayText_" + num).setAttribute("style", "display:none");
        document.getElementById("bDelayText_" + num).setAttribute("style", "display:none");
        // Adding the time values onto the page for "true" countdown
        $("#timer_" + num).html(formatTimerNumbers(dateFormat, timeDiffByUnit, timeUnits));
    }
    updateBaroTimers(num, numLoops);
}

/**
 * Maps countdown timers elements from DOM to individual timers.
 * Assuming that when an element with .customcountdown class is present
 * all the required elements for timer will be nested under it
 */
function getTimersElements() {
    let count = document.getElementsByClassName("customcountdown");
    countdownTimers = [];

    for (let i = 0; i < count.length; i++) {
        // Adding new objects to dictionary; each representing an individual timer
        countdownTimers[i] = {};
        for (let className of COUNTDOWN_CLASSES) {
            let element = document.getElementsByClassName(className)[i];
            if (element == null) {
                throw "ERROR: " + className + " CSS class is missing for countdown timer instance #" + i + ".";
            }
            // Gives each instance of repeating elements of same class unique ids
            // (e.g. #seedDate_1)
            element.id = className + "_" + i;
            countdownTimers[i][className] = element.innerHTML;
        }
    }
	
    // Other optional classes related to countdown
    for (let platform of Object.keys(BARO_COUNTDOWN_CLASSES)) {
        let className = BARO_COUNTDOWN_CLASSES[platform];
        if ($("." + className).length > 0) {
            let elements = document.getElementsByClassName(className);
            for (let i = 0; i < elements.length; i++) {
                elements[i].id = className + "_" + i;
            }
        }
    }
    return countdownTimers;
}

/**
 * Converts time to milliseconds. Ignores sign and decimals. Default unit is seconds ("s") and
 * default number is zero.
 * @param {*} time = a string with a number and a time unit associated (e.g. "50s" is 50 seconds) 
 * @returns time in milliseconds
 */
function convertTimeToMilliseconds(time) {
    let number = time.match(/\d+/);
    let unit = time.match(/[A-Za-z]+/);
    if (unit === null) {
        unit = "s";
    }
    if (number === null) {
        number = 0;
    }
    if (TIME_IN_MILLISECONDS[unit] !== undefined) {
        return number * TIME_IN_MILLISECONDS[unit];
    }
    throw "ERROR: Invalid time unit (" + unit + ") in a .loopTime and/or .delayTime CSS class. " + 
            "Valid units: \"Y\", \"M\", \"D\", \"h\", \"m\", \"s\"";
}

/**
 * Calculating number of loops between current and initial datetime.
 * @param {*} now - Date object representing current datetime
 * @param {*} seedDate - Date object that is before now
 * @param {*} delayTime - delay in milliseconds
 * @param {*} loopTime - loop duration in milliseconds
 * @param {*} loopLimit - maximum number of loops countdown timer can run
 * @returns the number of loops that countdown timer will run
 */
function calculateNumLoops(now, seedDate, delayTime, loopTime, loopLimit) {
    // Math.ceil() is needed to account for the fact that timer can reach 0 
    // during an unfinished loop
    let numLoops = Math.ceil((now.getTime() - seedDate.getTime() + delayTime) / loopTime);
    if (numLoops > loopLimit) {
        return loopLimit;
    }
    return numLoops;
}

/**
 * Determining the end datetime based on initial datetime, 
 * loop duration, and the number of loops that the timer will cycle through.
 * @param {*} seedDate - Date object
 * @param {*} delayTime - delay in milliseconds
 * @param {*} numLoops - number of countdown loops
 * @param {*} loopTime - loop duration in milliseconds
 * @returns a Date object representing end date of countdown
 */
function findEndDate(seedDate, delayTime, numLoops, loopTime) {
    return new Date(seedDate.getTime() - delayTime + (numLoops * loopTime));
}

/**
 * Total time between now and target date in milliseconds converted
 * to certain time period.
 * @param {*} now - Date object
 * @param {*} endDate - Date object
 * @param {*} dstOffset - DST offset in milliseconds
 * @returns time difference in milliseconds, rounded to the nearest thousands
 */
function calculateTimeDiff(now, endDate, dstOffset) {
    // need to round to avoid skipping seconds
    // (example case: 7041 milliseconds => 5999 milliseconds)
    let timeDiff = (endDate.getTime() - now.getTime()) + dstOffset;
    return Math.round(timeDiff / 1000) * 1000;
}

/**
 * Based on the specified time periods desired, sets the time periods to
 * account for the other time periods.
 * @param {*} timeDiff - time difference in milliseconds
 * @param {*} dateFormat - string that represents date format; each unit is separated by a non-alphabetical
 * character (e.g. "YY-MM-DD hh:mm:ss")
 * @returns a dictionary that contains time differences per time unit
 */
function calcTimeDiffByUnit(timeDiff, dateFormat) {
    let timeDiffByUnit = {
        Y: 0,
        M: 0,
        D: 0,
        h: 0,
        m: 0,
        s: 0,
    };
    for (let unit of Object.keys(TIME_UNIT_ABBR)) {
        let unitAbbr = TIME_UNIT_ABBR[unit];
        let timeInMilliseconds = TIME_IN_MILLISECONDS[unitAbbr];
        if (dateFormat.includes(unitAbbr)) {
            // calculating how many of a time unit can fit in this time frame
            let numTimeUnits = Math.floor(timeDiff / timeInMilliseconds);
            timeDiffByUnit[unitAbbr] = numTimeUnits;
            timeDiff -= numTimeUnits * timeInMilliseconds;
        }
    }
    return timeDiffByUnit;
}

/**
 * Get display units for each time unit.
 * @param {*} dateLabels - a string
 * @returns a dictionary that contains display strings per time unit
 */
function getDisplayUnits(dateLabels) {
    let timeUnits = {};
    switch(dateLabels) {
        case "full":
            for (let unit of Object.keys(TIME_UNIT_ABBR)) {
                timeUnits[TIME_UNIT_ABBR[unit]] = " " + unit + "s";
            }
            break;
        case "single":
            for (let unit of Object.keys(TIME_UNIT_ABBR)) {
                timeUnits[TIME_UNIT_ABBR[unit]] = TIME_UNIT_ABBR[unit];
            }
            break;
        default:
            for (let unit of Object.keys(TIME_UNIT_ABBR)) {
                timeUnits[TIME_UNIT_ABBR[unit]] = "";
            }
            break;
    }
    return timeUnits;
}

/**
 * Formats the numbers of the countdown timer text.
 * @param {*} dateFormat - string that represents date format; each unit is separated by a non-alphabetical
 * character (e.g. "YY-MM-DD hh:mm:ss")
 * @param {*} timeDiffByUnit - dictionary that contains time differences per time unit
 * @param {*} timeUnits - dictionary of display text per time unit
 * @returns a string of the formatted text
 */
function formatTimerNumbers(dateFormat, timeDiffByUnit, timeUnits) {
    let timerText = dateFormat;
    let formatArr = dateFormat.split(/[^A-Za-z]/);  // e.g. ["YYYY", "MM", "DD"]
    console.log(formatArr);
    for (let elem of formatArr) {
        let text = timeDiffByUnit[elem.charAt(0)] + "";
        text = text.padStart(elem.length, "0");  // padding zeroes for uniformity
        text += timeUnits[elem.charAt(0)];  // adding unit display (e.g. "5 Years")
        let regex = new RegExp(elem);
        timerText = timerText.replace(regex, text);
    }
    return timerText;
}

/**
 * Update Baro Ki'Teer timers.
 * @param {*} num - countdown timer instance
 * @param {*} numLoops - number of countdown timer loops that have passed
 */
function updateBaroTimers(num, numLoops) {
    for (let platform of Object.keys(BARO_COUNTDOWN_CLASSES)) {
        let className = BARO_COUNTDOWN_CLASSES[platform];
        if ($("." + className).length > 0) {
            $("." + className + "_" + num).html(baroRelayTracker(numLoops, platform));
        }
    }
}

/**
 * Tracks what relay Baro is currently on.
 * @param {*} count 
 * @param {*} platform - "PC", "PS4", "XB1", or "NSW" 
 */
function baroRelayTracker(count, platform) {
    let rotationNum = count % 4;
    let planet = platformRelayDict[platform][rotationNum];
    return relayDict[planet] + " Relay, <a href=\"https://warframe.fandom.com/wiki/" 
            + planet + "\">" + planet + "</a> (" + platform + ")<br/>";
}
