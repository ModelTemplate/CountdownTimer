// Countdown timer that is accurate to the second and accounts for Daylight Savings Time (DST)

// All of these CSS classes must be present on page in order for countdown timer to function
const COUNTDOWN_CLASSES = ["seedDate", "bText", "bDelayText", "years", "months", "days",
        "hours", "minutes", "seconds", "aText", "aDelayText", "loopTime", "loopUnit",
        "loopLimit", "endText", "delayTime", "delayUnit", "delayDisplay", "dst",
        "dateFormat", "dateLabels", "separators"];
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
        buildTimer(countdownTimers[i], i);
    }
}

// Calculate time difference and rebuild timer each second
function buildTimer(timerParams, num) {
    let now = new Date();

    // Parameters are stored in innerHTML
    let seedDate = new Date((timerParams.seedDate === "") ? "December 3, 2015 00:00:00 UTC" 
        : timerParams.seedDate);

    let loopUnit = (timerParams.loopUnit === "") ? "s" 
        : timerParams.loopUnit;
    // Time between loop iterations (i.e. duration of a loop)
    let loopTime = (isNaN(timerParams.loopTime)) ? 0 
        : convertTimeToMilliseconds(Number(timerParams.loopTime), loopUnit);
    // Maximum number of loop iterations
    let loopLimit = (isNaN(timerParams.loopLimit)) ? 0 
        : Number(timerParams.loopLimit);

    let delayUnit = (timerParams.delayUnit === "") ? "s" 
        : timerParams.delayUnit;
    // Splits total loopTime into two time periods, one that is the delayed countdown and
    // the other is the actual countdown
    // (e.g. Cetus day/night cycle with 100 minutes day and 50 minutes night or
    // Baro's countdown until arrival and until departure)
    let delayTime = (isNaN(timerParams.delayTime)) ? 0 
        : convertTimeToMilliseconds(Number(timerParams.delayTime), delayUnit);
    // Show delayed countdown if true
    let delayDisplay = timerParams.delayDisplay === "";

    let endDate = findEndDate(now, seedDate, 0, loopTime, loopLimit);
    let endDateDelay = findEndDate(now, seedDate, delayTime, loopTime, loopLimit);

    let numLoops = Math.ceil((now.getTime() - seedDate.getTime()) / loopTime);
    if (numLoops > loopLimit) {
        numLoops = loopLimit;
    }
	
	// Accounts for Daylight Saving Time (DST) between now and target date 
	// unless otherwise specified
    let dstOffset = (timerParams.dst === "") ? 
        (now.getTimezoneOffset() - endDate.getTimezoneOffset()) * 60 * 1000 : 0;
    let dstOffsetDelay = (timerParams.dst === "") ? 
        (now.getTimezoneOffset() - endDateDelay.getTimezoneOffset()) * 60 * 1000 : 0;
    
    // Total time between now and target date in milliseconds converted
    // to certain time period
    // (i.e. for 120 minutes: years = 0; months = 0; days = 0;
    // hours = 2; minutes = 120; seconds = 7200)
    // time string will result in "00021207200" thus far
    let timeDiff = calculateTimeDiff(now, endDate, dstOffset);  // in milliseconds
    let timeDiffDelay = calculateTimeDiff(now, endDateDelay, dstOffsetDelay);
	
    // Finds what time periods the specified date format wants
    let unitCounts = extractUnitCounts(timerParams.dateFormat);

    // Dictionary of time units based on the specified time periods desired, 
    // sets the time periods to account for the other time periods
    // (i.e. for 120 minutes & "hh mm ss": years = 0; months = 0; days = 0;
    // hours = 2; minutes = 0; seconds = 0)
    // time string will result in "000200" thus far
    let timeDiffByUnit = calcTimeDiffByUnit(timeDiff, unitCounts);
    let timeDiffByUnitDelay = calcTimeDiffByUnit(timeDiffDelay, unitCounts);
	
    // Based on the specified time periods' desired format, gives time string
    // leading zeroes
    // (i.e. for 120 minutes & "hh mm ss": years = 0; months = 0; days = 0;
    // hours = 02; minutes = 00; seconds = 00)
    // time string will result in "000020000" thus far
    let unitLeadingZeroes = getLeadingZeroesPerUnit(timeDiffByUnit, unitCounts);
    let unitLeadingZeroesDelay = getLeadingZeroesPerUnit(timeDiffByUnitDelay, unitCounts);

    // Based on the specified time periods' desired units, gives each time
    // period in the string certain units
    // (i.e. for 120 minutes & "hh mm ss" & "single": years = 0Y; months = 0M;
    // days = 0D; hours = 02h; minutes = 00m; seconds = 00s)
    // time string will result in "0Y0M0D02h00m00s" thus far
    let timeUnits = extractDisplayUnits(timerParams.dateLabels);

    // Separates each time period in the time string by the specified cd.separators
    // (i.e. for 120 minutes & "hh mm ss" & "single" & " " or "&nbsp;": 
    // years = 0Y ; months = 0M ; days = 0D ; hours = 02h ;
    // minutes = 00m ; seconds = 00s)
    // time string will result in "0Y 0M 0D 02h 00m 00s" thus far
    let sep = timerParams.separators;

    // when loop iterations reaches loop limit, hide normal text, hide delay
    // text, hide normal/delay time periods, and only show end of loop text
    if ((numLoops === loopLimit) && (endDate.getTime() <= now.getTime())) {
        document.getElementById("endText_" + num).setAttribute("style", "display:visible");
        document.getElementById("bText_" + num).setAttribute("style", "display:none");
        document.getElementById("aText_" + num).setAttribute("style", "display:none");
        document.getElementById("bDelayText_" + num).setAttribute("style", "display:none");
        document.getElementById("aDelayText_" + num).setAttribute("style", "display:none");
        for (let unit of Object.keys(TIME_UNIT_ABBR)) {
            $("#" + unit.toLowerCase() + "s_" + num).html("");
        }

    // When delay time reaches inputted delay time show delay text, hide normal
    // text, and only show delay time periods specified by date format
    } else if ((Math.floor(timeDiffDelay / TIME_IN_MILLISECONDS["s"]) * TIME_IN_MILLISECONDS["s"]) < delayTime) {
        document.getElementById("endText_" + num).setAttribute("style", "display:none");
        document.getElementById("bText_" + num).setAttribute("style", "display:none");
        document.getElementById("aText_" + num).setAttribute("style", "display:none");
        document.getElementById("bDelayText_" + num).setAttribute("style", "display:visible");
        document.getElementById("aDelayText_" + num).setAttribute("style", "display:visible");
        if (delayDisplay) {
            // Adding the time values onto the page for delayed time period
            for (let unit of Object.keys(TIME_UNIT_ABBR)) {
                let unitAbbr = TIME_UNIT_ABBR[unit];
                if (unitCounts[unitAbbr] !== 0) {
                    $("#" + unit.toLowerCase() + "s_" + num).html(unitLeadingZeroesDelay[unitAbbr] + 
                        timeDiffByUnitDelay[unitAbbr] + timeUnits[unit] + sep);
                }
            }
        } else {
            for (let unit of Object.keys(TIME_UNIT_ABBR)) {
                $("#" + unit.toLowerCase() + "s_" + num).html("");
            }
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
        for (let unit of Object.keys(TIME_UNIT_ABBR)) {
            let unitAbbr = TIME_UNIT_ABBR[unit];
            if (unitCounts[unitAbbr] !== 0) {
                $("#" + unit.toLowerCase() + "s_" + num).html(unitLeadingZeroes[unitAbbr] + 
                    timeDiffByUnit[unitAbbr] + timeUnits[unit] + sep);
            }
        }
    }
    updateBaroTimers(num, numLoops);
}

// Assuming that when an element with .customcountdown class is present
// all the required elements for timer will be nested under it
    function getTimersElements() {
    let count = document.getElementsByClassName("customcountdown");
    countdownTimers = [];

    for (let i = 0; i < count.length; i++) {
        // Adding new objects to dictionary; each representing an individual timer
        countdownTimers[i] = {};
        for (let className of COUNTDOWN_CLASSES) {
            let element = document.getElementsByClassName(className)[i];
            if (element === null) {
                throw className + " CSS class is missing for countdown timer #" + i;
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

function convertTimeToMilliseconds(timeValue, timeUnit) {
    if (TIME_IN_MILLISECONDS[timeUnit] !== undefined) {
        return timeValue * TIME_IN_MILLISECONDS[timeUnit];
    }
    throw "ERROR: Invalid time unit under an element with .loopLimit class: \"" + timeUnit + "\"";
}

// Determining the end datetime based on current datetime, initial datetime, 
// loop duration, and the max number of loops that the timer will cycle through.
// Note that initial datetime is usually before current datetime.
function findEndDate(now, seedDate, delay, loopTime, loopLimit) {
    // Infinite loop
    if (loopLimit === -1) {
        return new Date(now.getTime() + delay + loopTime);
    }
    // Calculating number of loops between current and initial datetime
    // Math.ceil() is needed to account for the fact that timer can reach 0 
    // during an unfinished loop
    let numLoops = Math.ceil((now.getTime() - seedDate.getTime() + delay) / loopTime);
    if (numLoops > loopLimit) {
        numLoops = loopLimit;
    }
    return new Date(seedDate.getTime() + delay + (numLoops * loopTime));
}

// Total time between now and target date in milliseconds converted
// to certain time period
function calculateTimeDiff(now, endDate, dstOffset) {
    return (endDate.getTime() - now.getTime()) + dstOffset;
}

// Based on the specified time periods desired, sets the time periods to
// account for the other time periods
// Note that timeDiff is in milliseconds
function calcTimeDiffByUnit(timeDiff, unitCounts) {
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
        if (unitCounts[unitAbbr] > 0) {
            // calculating how many of a time unit can fit in this time frame
            let numTimeUnits = Math.floor(timeDiff / timeInMilliseconds);
            timeDiffByUnit[unitAbbr] = numTimeUnits;
            timeDiff -= numTimeUnits * timeInMilliseconds;
        }
    }
    return timeDiffByUnit;
}

// Finding out how many digits to display for each time unit
function extractUnitCounts(dateFormat) {
    let unitCounts = {
        Y: 0,
        M: 0,
        D: 0,
        h: 0,
        m: 0,
        s: 0
    };
    dateFormat = (dateFormat === "") ? "YYMMDDhhmmss" 
        : dateFormat.replace(/\s/g, "");   // removing whitespace
    
    for (let pos = 0; pos < dateFormat.length; pos++) {
        unitCounts[dateFormat.charAt(pos)]++;
    }
    return unitCounts;
}

function getLeadingZeroesPerUnit(timeDiffByUnit, unitCounts) {
    let unitLeadingZeroes = {
        Y: "",
        M: "",
        D: "",
        h: "",
        m: "",
        s: ""
    };
    for (let unit of Object.keys(unitCounts)) {
        for (let i = 1; i < unitCounts[unit]; i++) {
            if (timeDiffByUnit[unit] < Math.pow(10, unitCounts[unit] - i)) {
                unitLeadingZeroes[unit] = "0" + unitLeadingZeroes[unit];
            }
        }
    }
    return unitLeadingZeroes;
}

function extractDisplayUnits(dateLabels) {
    let timeUnits = {};
    switch(dateLabels) {
        case "full":
            for (let unit of Object.keys(TIME_UNIT_ABBR)) {
                timeUnits[unit] = " " + unit + "s";
            }
            break;
        case "single":
            for (let unit of Object.keys(TIME_UNIT_ABBR)) {
                timeUnits[unit] = TIME_UNIT_ABBR[unit];
            }
            break;
        default:
            for (let unit of Object.keys(TIME_UNIT_ABBR)) {
                timeUnits[unit] = "";
            }
            break;
    }
    return timeUnits;
}

function updateBaroTimers(num, numLoops) {
    for (let platform of Object.keys(BARO_COUNTDOWN_CLASSES)) {
        let className = BARO_COUNTDOWN_CLASSES[platform];
        if ($("." + className).length > 0) {
            $("." + className + "_" + num).html(baroRelayTracker(numLoops - 1, platform));
        }
    }
}

function baroRelayTracker(count, platform) {
	let rotationNum = count % 4;
	let planet = platformRelayDict[platform][rotationNum];
	return relayDict[planet] + " Relay, <a href=\"https://warframe.fandom.com/wiki/" 
			+ planet + "\">" + planet + "</a> (" + platform + ")<br/>";
}
