# Countdown Timer
A simple countdown timer that is accurate to the second and takes into account Daylight Savings Time.

For use on the [WARFRAME](https://warframe.fandom.com/wiki/WARFRAME_Wiki) wiki. Credit to fellow wiki contributors for original code.

## How to run
Open Countdown.html with your preferred HTML5 compliant browser and enable JavaScript.

## How to use on MediaWiki wikis
Create a [Template](https://www.mediawiki.org/wiki/Help:Templates) page that transcludes all the required elements to start a countdown timer.

    <span class="customcountdown" style="font-size: 18px;">
        <span style="display:none" class="seedDate">January 30, 2021 22:35:00 UTC</span>

        <span style="display:none" class="bText">&nbsp;Timer Ends In</span>
        <span style="display:none" class="bDelayText">&nbsp;Delay Timer Ends In</span>

        <span class="years"></span>
        <span class="months"></span>
        <span class="days"></span>
        <span class="hours"></span>
        <span class="minutes"></span>
        <span class="seconds"></span>

        <span style="display:none" class="aText">&nbsp;(Placeholder text)</span>
        <span style="display:none" class="aDelayText">&nbsp;(Placeholder delay text)</span>
        <span style="display:none" class="loopTime">10</span>
        <span style="display:none" class="loopUnit">s</span>
        <span style="display:none" class="loopLimit">1000</span>
        <span style="display:none" class="endText">Countdown Complete</span>
        <span style="display:none" class="delayTime"></span>
        <span style="display:none" class="delayUnit"></span>
        <span style="display:none" class="delayDisplay">true</span>
        <span style="display:none" class="dst"></span>
        <span style="display:none" class="dateFormat"></span>
        <span style="display:none" class="dateLabels">single</span>
        <span style="display:none" class="separators"> </span>
    </span>

Next, copy and paste the JavaScript code onto a page ending with ".js" within the [MediaWiki namespace](https://www.mediawiki.org/wiki/Help:Namespaces#MediaWiki) in order to have the countdown code run on all pages within the wiki.

## Notes
* [FANDOM](https://en.wikipedia.org/wiki/Fandom_(website)) uses [MediaWiki](https://en.wikipedia.org/wiki/MediaWiki) 1.33.3 as of 1/29/21.
* Its [ResourceLoader](https://www.mediawiki.org/wiki/ResourceLoader) supports [ES3](https://www-archive.mozilla.org/js/language/E262-3.pdf) syntax and modern features of JavaScript such as Sets, Maps, Promises, and etc.
* There is **no** support for classes, arrow functions, inline getters, and etc.

## Related Links
* https://warframe.fandom.com/wiki/MediaWiki:Countdown.js
* https://warframe.fandom.com/wiki/MediaWiki:CountDown.js (outdated)
* https://warframe.fandom.com/wiki/Template:Countdown
* https://warframe.fandom.com/wiki/Template:BaroTimer
