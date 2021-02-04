# Countdown Timer
A simple countdown timer that is accurate to the second and takes into account Daylight Savings Time.

For use on the [WARFRAME](https://warframe.fandom.com/wiki/WARFRAME_Wiki) wiki. Credit to fellow wiki contributors for original code.

## How to run
Open CountdownTest.html or WorldStateTimers.html with your preferred HTML5 compliant browser and enable JavaScript.

## How to use on MediaWiki wikis
Create a [Template](https://www.mediawiki.org/wiki/Help:Templates) page that transcludes all the required elements to start a countdown timer. For example:

    <span class="customcountdown" style="font-size: 18px;">
        <span style="display:none" class="seedDate">January 30, 2021 22:35:00 UTC</span>

        <span style="display:none" class="bText">&nbsp;Timer Ends In</span>
        <span style="display:none" class="bDelayText">&nbsp;Delay Timer Ends In</span>

        <span class="timer"></span>

        <span style="display:none" class="aText">&nbsp;(Placeholder text)</span>
        <span style="display:none" class="aDelayText">&nbsp;(Placeholder delay text)</span>
        <span style="display:none" class="loopTime">10s</span>
        <span style="display:none" class="loopLimit">1000</span>
        <span style="display:none" class="endText">Countdown Complete</span>
        <span style="display:none" class="delayTime"></span>
        <span style="display:none" class="delayDisplay">true</span>
        <span style="display:none" class="dst"></span>
        <span style="display:none" class="dateFormat"></span>
        <span style="display:none" class="dateLabels">single</span>
    </span>

Next, copy and paste the JavaScript code onto a page ending with ".js" within the [MediaWiki namespace](https://www.mediawiki.org/wiki/Help:Namespaces#MediaWiki) in order to have the countdown code run on all pages within the wiki.

If you want to use this countdown timer on [FANDOM](https://en.wikipedia.org/wiki/Fandom_(website)) wikis, you will also need to add the name of MediaWiki page containing the script to the MediaWiki:ImportJS page. See [this](https://community.fandom.com/wiki/Help:Including_additional_CSS_and_JS) for more information.

# Development
Please feel free to fork this repository and develop on it. Issues and suggestions can be posted under the issues tab. Code written in Countdown.js **must** be written in [ECMAScript](https://en.wikipedia.org/wiki/ECMAScript) 3rd Edition compliant syntax in order to run on FANDOM wikis.

## Notes
* [FANDOM](https://en.wikipedia.org/wiki/Fandom_(website)) uses [MediaWiki](https://en.wikipedia.org/wiki/MediaWiki) 1.33.3 as of 1/29/2021.
* Its [ResourceLoader](https://www.mediawiki.org/wiki/ResourceLoader) supports [ES3](https://www-archive.mozilla.org/js/language/E262-3.pdf) syntax and modern features of JavaScript such as Sets, Maps, Promises, and etc.
* There is **no** support for classes, arrow functions, inline getters, let keyword, for...of statement, and etc.

## Related Links
### Code
* https://warframe.fandom.com/wiki/MediaWiki:Countdown.js
* https://warframe.fandom.com/wiki/MediaWiki:CountDown.js (outdated and unused by wiki)

### See it in action
* https://warframe.fandom.com/wiki/Template:Countdown
* https://warframe.fandom.com/wiki/Template:BaroTimer
* https://warframe.fandom.com/wiki/Template:Mainpage_Box_Timers
