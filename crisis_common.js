/**
 * Current Crisis Evaluator (runs on a timer from header.html).
 */
var firstTime = true;
function currentCrisisEvaluator(){
//            console.log("... running again");
    var changed = false;
    //HANDLE INITIAL CONDITIONS {{
    if (!localStorage.getItem('current_crisis')){
        localStorage.setItem('current_crisis', 'haiyan');
    }
    if (!window.crisis_select.value || firstTime){
        console.log("--> updating new window.crisis_select variable to reflect localStorage: "+localStorage.getItem('current_crisis'));
        window.crisis_select.value= localStorage.getItem('current_crisis');
        firstTime = false;
        changed = true;
    }
    //}}

    else  if (localStorage.getItem('current_crisis') !== window.crisis_select.value){
        console.log("--> updating localStorage 'current_crisis' variable to reflect new selection: "+window.crisis_select.value);
        localStorage.setItem('current_crisis', window.crisis_select.value);
        changed = true;
    }

    if (changed){
        /*NOTICE: Changing class to allow a class listener to take action */
        window.crisis_select.className = window.crisis_select.value;
    }
}

/**
 * Add a prototype method to String (careful to escape special chars used by regex)
 * @param find
 * @param replace
 * @returns {string}
 */
String.prototype.replaceAll = function (find, replace) {
    var str = this;
    return str.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace);
};

/**
 * Be notified when a registered element has a class change.
 * This is useful to be notified when window.crisis_select has a value change.
 * @param elemId
 * @param callback
 */
function addClassNameListener(elemId, callback) {
    var elem = document.getElementById(elemId);
    var lastClassName = elem.className;
    window.setInterval( function() {
        var className = elem.className;
        if (className !== lastClassName) {
            callback();
            lastClassName = className;
        }
    },10);
}

/**
 * Friendly print for numbers, considering decimals.
 * @param x
 * @returns {string}
 */
function numberWithCommas(x) {
    if (isNaN(x)) return x;
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

/**
 * Crisis summary changer
 */
function resetSummary(summary){

    /* Triangles */
    // revert to original color on other triangles and shrink
    d3.selectAll('.storyTriangle')
        .transition()
        .style('fill','#919191')
        .attr('d',d3.svg.symbol().type('triangle-down').size(256));

    /* Get content correct */

    // overview page
    if (document.getElementById("overview") != undefined && document.getElementById("tab_1_compared").className === "content-tab active") {
        d3.select("#crisisTitle").html('<h3>Country Interest In Crises</h3>');
        d3.select('#crisisStory').html("Countries providing top-ten results for each of the crises can be compared. Consistently interested countries include the US, UK, India, and Canada. Single crisis countries include Philippines, Ukraine, Malaysia, South Africa, and Kenya. Prominent countries like Australia, France and Italy are consistently interested, even when outside the top-ten.");
        // hide selector
        $('#crisis_selector').hide();

    // timeline page
    } else if (document.getElementById("timeline") != undefined && document.getElementById("tab_1_compared").className === "content-tab active") {
        d3.select("#crisisTitle").html('<h3>Relative Interest In Crises</h3>');
        d3.select('#crisisStory').html('Percentage of change in crisis coverage can be compared from month to month to determine increased, same, or decreased media attention aggregated across all Google results.');
        // hide selector
        $('#crisis_selector').hide();

    } else {
        // show selector
        $('#crisis_selector').show();

        // add title
        d3.select('#crisisTitle').data(summary)
            .html(function (d) {
                return '<h3>' + d.title + '</h3>';
            });

        // add summary
        d3.select('#crisisStory').data(summary)
            .html(function (d) {
                return '<p>' + d.content + '</p>';
            });
    }
}

/**
 * Show crisis selector on non-auto pages
 */
function showSelector(){
    $('#crisis_selector').show();
}
