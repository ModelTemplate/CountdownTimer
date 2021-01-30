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

const TIME_UNIT_ABBR = {
    Year: "Y",
    Month: "M",
    Day: "D",
    Hour: "h",
    Minute: "m",
    Second: "s"
};
Object.freeze(TIME_UNIT_ABBR);

// Values are in milliseconds
const ONE_SECOND = 1000,
    ONE_MINUTE = 60000,
	ONE_HOUR = 3600000,
    ONE_DAY = ONE_HOUR * 24,
	ONE_YEAR = ONE_DAY * 365,	// assuming leap years are irrelevant
    ONE_MONTH = ONE_YEAR / 12;	// average milliseconds per month

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

// Assume that this code is only invoked by Template:Countdown
if (document.getElementsByClassName("customcountdown").length > 0) {
    countdownInit();
}

var countdownTimers;

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
    // Splits total loopTime into two time periods
    // (e.g. Cetus day/night cycle with 100 minutes day and 50 minutes night)
    let delayTime = (isNaN(timerParams.delayTime)) ? 0 
        : convertTimeToMilliseconds(Number(timerParams.delayTime), delayUnit);

	let endDate = findEndDate(now, seedDate, 0, loopTime, loopLimit);
	let endDate2 = findEndDate(now, seedDate, delayTime, loopTime, loopLimit);

	let numLoops = Math.ceil((now.getTime() - seedDate.getTime()) / loopTime);
	if (numLoops > loopLimit + 1) {
		numLoops = loopLimit + 1;
	}
	
	// Accounts for Daylight Saving Time (DST) between now and target date 
	// unless otherwise specified
    let dstOffset = (timerParams.dst === "") ? 
        (now.getTimezoneOffset() - endDate.getTimezoneOffset()) * 60 * 1000 : 0;
    let dstOffset2 = (timerParams.dst === "") ? 
        (now.getTimezoneOffset() - endDate2.getTimezoneOffset()) * 60 * 1000 : 0;
    
    // Total time between now and target date in milliseconds converted
    // to certain time period
    // (i.e. for 120 minutes: years = 0; months = 0; days = 0;
    // hours = 2; minutes = 120; seconds = 7200)
    // time string will result in "00021207200" thus far
	let timeDiff = calculateTimeDiff(now, endDate, dstOffset);  // in milliseconds
	let timeDiff2 = calculateTimeDiff(now, endDate2, dstOffset2);
	
	// Finds what time periods the specified date format wants
	let unitCounts = {
        Y: 0,
        M: 0,
        D: 0,
        h: 0,
        m: 0,
        s: 0
    };

    let dateFormat = (timerParams.dateFormat === "") ? "YY MM DD hh mm ss" 
        : timerParams.dateFormat;
	for (let pos = 0; pos < dateFormat.length; pos++) {
		unitCounts[dateFormat.charAt(pos)]++;
    }

    // Dictionary of time units based on the specified time periods desired, 
    // sets the time periods to account for the other time periods
    // (i.e. for 120 minutes & "hh mm ss": years = 0; months = 0; days = 0;
    // hours = 2; minutes = 0; seconds = 0)
    // time string will result in "000200" thus far
    let timeDiffByUnit = calcTimeDiffByUnit(timeDiff, unitCounts);
    let timeDiffByUnit2 = calcTimeDiffByUnit(timeDiff2, unitCounts);
	
	// Based on the specified time periods' desired format, gives time string
	// leading zeroes
	// (i.e. for 120 minutes & "hh mm ss": years = 0; months = 0; days = 0;
	// hours = 02; minutes = 00; seconds = 00)
    // time string will result in "000020000" thus far
    let unitLeadingZeroes = {
        Y: "",
        M: "",
        D: "",
        h: "",
        m: "",
        s: ""
    };
    let unitLeadingZeroes2 = {
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
            if (timeDiffByUnit2[unit] < Math.pow(10, unitCounts[unit] - i)) {
                unitLeadingZeroes2[unit]= "0" + unitLeadingZeroes2[unit];
            }
        }
    }

	// Based on the specified time periods' desired units, gives each time
	// period in the string certain units
	// (i.e. for 120 minutes & "hh mm ss" & "single": years = 0Y; months = 0M;
	// days = 0D; hours = 02h; minutes = 00m; seconds = 00s)
	// time string will result in "0Y0M0D02h00m00s" thus far
    let timeUnits = {};
    switch(timerParams.dateLabels) {
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

	// Separates each time period in the time string by the specified cd.separators
	// (i.e. for 120 minutes & "hh mm ss" & "single" & " " or "&nbsp;": 
	// years = 0Y ; months = 0M ; days = 0D ; hours = 02h ;
	// minutes = 00m ; seconds = 00s)
	// time string will result in "0Y 0M 0D 02h 00m 00s" thus far
	let sep = timerParams.separators;

	// when loop iterations reaches loop limit, hide normal text, hide delay
	// text, hide normal/delay time periods, and only show end of loop text
	if ((numLoops === (loopLimit + 1)) && (endDate.getTime() <= now.getTime())) {
		$("#endText_" + num).css("display", "visible");
		$("#bText_" + num).css("display", "none");
        $("#aText_" + num).css("display", "none");
        $("#bDelayText_" + num).css("display", "none");
		$("#aDelayText_" + num).css("display", "none");
        for (let unit of Object.keys(timeUnits)) {
            $("#" + unit + "s_" + num).html("");
        }

    // When delay time reaches inputted delay time show delay text, hide normal
    // text, and only show delay time periods specified by date format
	} else if ((Math.floor(timeDiff2 / ONE_SECOND) * ONE_SECOND) < delayTime) {
        $("#endText_" + num).css("display", "none");
        $("#bText_" + num).css("display", "none");
        $("#aText_" + num).css("display", "none");
        $("#bDelayText_" + num).css("display", "visible");
        $("#aDelayText_" + num).css("display", "visible");
        if ($("#delayDisplay_" + num).text() === "") {
            // Finally adding the time values onto the page
            for (let unit of Object.keys(TIME_UNIT_ABBR)) {
                let unitAbbr = TIME_UNIT_ABBR[unit];
                if (unitCounts[unitAbbr] !== 0) {
                    $("#" + unit + "_" + num).html(unitLeadingZeroes2[unitAbbr] + 
                        timeDiffByUnit2[unitAbbr] + timeUnits[unit] + sep);
                }
            }
        } else {
            for (let unit of Object.keys(timeUnits)) {
                $("#" + unit + "s_" + num).html("");
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
        $("#endText_" + num).css("display", "none");
        $("#bText_" + num).css("display", "visible");
        $("#aText_" + num).css("display", "visible");
        $("#bDelayText_" + num).css("display", "none");
        $("#aDelayText_" + num).css("display", "none");
        for (let unit of Object.keys(TIME_UNIT_ABBR)) {
            let unitAbbr = TIME_UNIT_ABBR[unit];
            if (unitCounts[unitAbbr] !== 0) {
                $("#" + unit + "_" + num).html(unitLeadingZeroes[unitAbbr] + 
                    timeDiffByUnit[unitAbbr] + timeUnits[unit] + sep);
            }
        }
    }
    updateBaroTimers(numLoops);
}

// Assuming that when an element with .customcountdown class is present
// all the required CSS classes for timer will also be present
function getTimersElements() {
    let count = document.getElementsByClassName("customcountdown");
    let countdownTimers = [];
    
	for (let i = 0; i < count.length; i++) {
		// Adding new objects to dictionary; each representing an individual timer
		countdownTimers[i] = {};
		for (let className of COUNTDOWN_CLASSES) {
            let element = document.getElementsByClassName(className)[i];
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
    switch (timeUnit) {
        case "Y":
            return timeValue * ONE_YEAR;
        case "M":
            return timeValue * ONE_MONTH;
        case "D":
            return timeValue * ONE_DAY;
        case "h":
            return timeValue * ONE_HOUR;
        case "m":
            return timeValue * ONE_MINUTE;
        case "s":
            return timeValue * ONE_SECOND;
        default:
            throw "Invalid time unit: \"" + timeUnit + "\"";
    }
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
	if (numLoops > loopLimit + 1) {
		numLoops = loopLimit + 1;
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
    if (unitCounts["Y"] > 0) {
        let years = Math.floor(timeDiff / ONE_YEAR);
        timeDiffByUnit["Y"] = years;
        timeDiff -= years * ONE_YEAR;
    }
    if (unitCounts["M"] > 0) {
        let months = Math.floor(timeDiff / ONE_MONTH);
        timeDiffByUnit["M"] = months;
        timeDiff -= months * ONE_MONTH;
    }
    if (unitCounts["D"] > 0) {
        let days = Math.floor(timeDiff / ONE_DAY);
        timeDiffByUnit["D"] = days;
        timeDiff -= days * ONE_DAY;
    }
    if (unitCounts["h"] > 0) {
        let hours = Math.floor(timeDiff / ONE_HOUR);
        timeDiffByUnit["h"] = hours;
        timeDiff -= hours * ONE_HOUR;
    }
    if (unitCounts["m"] > 0) {
        let minutes = Math.floor(timeDiff / ONE_MINUTE);
        timeDiffByUnit["m"] = minutes;
        timeDiff -= minutes * ONE_MINUTE;
    }
    if (unitCounts["s"] > 0) {
        let seconds = Math.floor(timeDiff / ONE_SECOND);
        timeDiffByUnit["s"] = seconds;
    }
    return timeDiffByUnit;
}

function updateBaroTimers(numLoops) {
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
