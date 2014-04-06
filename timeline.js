/* Setup */
	var bbDetail, bbOverview, dates, duplicateDates, padding, parseYear, svg, xDetailScale, xOverviewScale ;

	var margin = {
	    top: 50,
	    right: 50,
	    bottom: 50,
	    left: 100
	};

	var width = 960 - margin.left - margin.right;

	var height = 550 - margin.bottom - margin.top;

	bbOverview = {
	    x: 0,
	    y: 10,
	    w: width,
	    h: 50
	};

	bbDetail = {
	    x: 0,
	    y: 25,
	    w: width,
	    h: 300
	};

	padding = 30;

	// read in date format from csv, convert to js object to be read by d3
  parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S+00:00").parse;
  parseDateSimple = d3.time.format("%b %d %Y");

  // array for all dates
  duplicateDates = [];
	dates = [];

  // build svg and bounding box
	svg = d3.select("#timelineVis").append("svg").attr({
      class: 'timeline',
	    width: width + margin.left + margin.right,
	    height: height + margin.top + margin.bottom
	}).append("g").attr({
	        transform: "translate(" + margin.left + "," + margin.top + ")"
	    });

  // add clipping path for brushing
  svg.append("defs").append("clipPath")
    .attr("id", "clip")
  .append("rect")
    .attr("width", width)
    .attr("height", height);

/* Get data */
	d3.csv("data/2014-04-03-12.09.57_all_no_text-no2011.csv", function(data) {
 	
 	// make globally available
    originalData = data;
// console.log(originalData);

	  // define colors
	    var keys = d3.keys(data[0]).filter(function(key) { return key !== "AnalysisDate"; });

      // convert dates to js object and get list of all dates with duplicates
	    originalData.forEach(function(d,i) {
        // convert each date to js date
        d.date_published = parseDate(d.date_published);
        // get all dates if not null
        if(d.date_published != null)
          duplicateDates.push(d.date_published);
	    });
      // sort dates
      duplicateDates.sort(function(a, b) {
        return d3.ascending(a, b);
      });
// console.log(duplicateDates);
    // define previous date
    var previousDate;
    // go through dates and add to previous is date is same
    duplicateDates.forEach(function(d,i) {
      // current date without time so can compare by day instead of hour
      var currentDate = parseDateSimple(d);
      // if current date not last date in array (and not first element), set date and count
      if(currentDate != previousDate) {
        dates.push(
          { date: d, total: 1 }
        );
        // set last date
        previousDate = currentDate;
      } else {
        // add one to previous date
        dates[dates.length-1].total++;
      }
    });

    // move to next step on ajax completion
    return detailVis();
	  // return overviewVis();
  });

/* Make overview */
	function overviewVis() {

		var xAxis, yAxis, yScale;

  // normal scale
  xOverviewScale = d3.time.scale().domain(d3.extent(originalData, function(d) { return d.date; })).range([0, bbOverview.w]);  // define the right domain

  // example that translates to the bottom left of our vis space:
  var overviewFrame = svg.append("g").attr({
      transform: "translate(" + bbOverview.x + ",0)",
  });

  // use that minimum and maximum possible y values for domain in log scale
  yScale = d3.scale.linear().domain([
                            d3.min(originalData, function(d) { return d.total; }),
                            d3.max(originalData, function(d) { return d.total; })
                          ]).range([bbOverview.h, 0]);

  // x axis
    xAxis = d3.svg.axis()
                  .scale(xOverviewScale)
                  .orient('bottom')
                  .ticks(20);

  // y axis for consolidated population line
    yAxis = d3.svg.axis()
                  .scale(yScale)
                  .orient('left')
                  .ticks(3, ",");

    var line = d3.svg.line()
                     .x(function(d) { return xOverviewScale(d.date) })
                     .y(function(d) { return yScale(d.total )})
                     .interpolate('linear');

  // add x axis to svg
    overviewFrame.append('g')
            .attr({
              class: 'x axis',
              transform: 'translate(0,' + bbOverview.h + ')'
            })
            .call(xAxis)

  // add y axis to svg
    overviewFrame.append('g')
            .attr({
              class: 'y axis',
            })
            .call(yAxis)
          .append("text")
            .attr('x', -5)
            .attr("y", -bbOverview.h + 5)
            .attr("dy", "30px")
            .style("text-anchor", "end")
            .text("Coverage")
            .style('fill','#09C6FF');

  // add line
    overviewFrame.append('path')
               .datum(originalData)
               .attr({
                  class: 'line',
                  d: line,
               })
               .style({
                'stroke': '#09C6FF', 
                'fill': 'none',
               });
  // add dots for each line
  	overviewFrame.selectAll('.dot')
       .data(originalData)
    .enter().append('circle')
      .attr({
        class: 'dot',
        cx: function(d) { return xOverviewScale(d.date); },
        cy: function(d) { return yScale(d.total); },
        fill: '#55D8FF',
        r: 2,
      })

    // continue to lower vis
    detailVis();
	}

/* Make detail */
	function detailVis() {

	// Reset
		var xDetailAxis, yDetailAxis, yDetailScale;

	// normal scale
	  xDetailScale = d3.time.scale().domain(d3.extent(dates, function(d) { return d.date; })).range([0, bbDetail.w]);  // define the right domain
	// example that translates to the bottom left of our vis space:
	  var detailFrame = svg.append("g").attr({
	      class: 'detailFrame',
        transform: "translate(" + bbDetail.x + "," + bbDetail.y +")",
	  });

	// use that minimum and maximum possible y values for domain in log scale
	  yDetailScale = d3.scale.linear().domain([
	                            d3.min(dates, function(d) { return d.total; }),
	                            d3.max(dates, function(d) { return d.total; })
	                          ]).range([bbDetail.h, 0]);
// console.log(yDetailScale(2));
  // x axis
    xDetailAxis = d3.svg.axis()
                  .scale(xDetailScale)
                  .orient('bottom')
                  .ticks(7)
                  .tickFormat(d3.time.format('%b'));

  // y axis for consolidated population line
    yDetailAxis = d3.svg.axis()
                  .scale(yDetailScale)
                  .orient('left')
                  .ticks(6);

    var area = d3.svg.area()
								     .x(function(d) { return xDetailScale(d.date); })
								     .y0(bbDetail.h)
								     .y1(function(d) { return yDetailScale(d.total); });

    var line = d3.svg.line()
                     .x(function(d) { return xDetailScale(d.date) })
                     .y(function(d) { return yDetailScale(d.total)})
                     .interpolate('linear');

  // add x axis to svg
    detailFrame.append('g')
            .attr({
              class: 'x axis',
              transform: 'translate(0,' + (bbDetail.h) +')'
            })
            .call(xDetailAxis)

  // add y axis to svg
    detailFrame.append('g')
            .attr({
              class: 'y axis',
            })
            .call(yDetailAxis)
          .append("text")
            .attr('x', -5)
            .attr("y", -45)
            .attr("dy", "30px")
            .style("text-anchor", "end")
            .text("Coverage")

  // add fill
  detailFrame.append("path")
		         .datum(dates)
		         .attr("class", "detailArea")
		         .attr("d", area);

  // add line
    detailFrame.append('path')
               .datum(dates)
               .attr({
                  class: 'detailPath',
                  d: line,
               })
               .style({
                'fill': 'none',
               });

  /* Tool tips */
    // Initialize tooltip
    tip = d3.tip()
            .html(function(d) { return 'total: ' + d.total; })
            .direction('e')
            .attr('class','d3-tip e');

    // Invoke the tip in the context of your visualization
    detailFrame.call(tip)

  /* add dots for each line */
  	detailFrame.selectAll('.dot')
       .data(dates)
    .enter().append('circle')
      .attr({
        class: 'dot',
        cx: function(d) { return xDetailScale(d.date); },
        cy: function(d) { return yDetailScale(d.total); },
        r: 3,
      })
      /* Show and hide tip on mouse events */
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);

  /* add vertical line mouseover - initial code with help from Richard @ http://stackoverflow.com/questions/18882642/d3-js-drawing-a-line-on-linegraph-on-mouseover */

    // define vertical line group to hold line and tooltip
    var hoverLineGroup = svg.append('g')
                         .attr('class','hover-line');                         
    // define vertical line
    var hoverLine = hoverLineGroup
        .append('line')
          .attr('x1',10).attr('x2',10)
          // set y to height of detail area, adjusting for margin on top
          .attr('y1',0 + bbDetail.y).attr('y2',bbDetail.h + bbDetail.y)
          .attr('stroke-width',2)
          .style('stroke','#CCC');

    // control mousemove event
    d3.select('.timeline').on('mouseover',function(){
      // console.log('mouseover');
    }).on('mousemove',function(){
      // console.log('moved', d3.mouse(this));
      // get x coordinate of mouse and adjust for left margin
      var mouseX = d3.mouse(this)[0] - margin.left;
      // if not outside graph bounds
      if(mouseX > 0 && mouseX < width) {
        // set x coordinate of line
        hoverLine.attr('x1',mouseX)
                 .attr('x2',mouseX);

        // console.log('mouseX',mouseX);
        // show line
        hoverLine.style('opacity',1);
      } else {
        // disappear line        
        hoverLine.style('opacity',0);
      }

    });

      // set hoverline to invisible on page load
      hoverLine.style('opacity',0);

	// setup actions to take on brush event, scale is same as overview scale, but overview scale not in scope here
		brush = d3.svg.brush().x(xOverviewScale).on("brush", brushed);

	// add brush to viz
		svg.append("g")
			 .attr("class", "brush")
			 .call(brush)
  		.selectAll("rect").attr({
    		height: bbOverview.h,
    		transform: "translate(0,0)"
			});

  /* Brushed */
  	function brushed() {
      // update detail x scale domain based on brushed extent
      xDetailScale.domain(brush.empty() ? xOverviewScale.domain() : brush.extent());
      // redraw detail lines and dots
      detailFrame.select('.detailArea').attr('d', area);
      detailFrame.select('.detailPath').attr('d', line);
      detailFrame.selectAll('.dot').attr('cx', function(d) { return xDetailScale(d.date); });
      // redraw axis
      detailFrame.select('.x.axis').call(xDetailAxis);
      // hide data info
      d3.select('.factpoints').style('display','none');
    }

  /* Talking Points */
    d3.select('#reset')
      .on('click', function(){


        // remove extent from brush data
        brush.clear();
        // call brush to remove visual
        svg.select('.brush').transition().call(brush);
        // clear detail area
          // update detail x scale domain 
          xDetailScale.domain(xOverviewScale.domain());
          // redraw detail lines and dots
          detailFrame.select('.detailArea').transition().attr('d', area);
          detailFrame.select('.detailPath').transition().attr('d', line);
          detailFrame.selectAll('.dot').transition().attr('cx', function(d) { return xDetailScale(d.date); });
          // redraw axis
          detailFrame.select('.x.axis').transition().call(xDetailAxis);

        // hide any other text
        d3.selectAll('.factpoints').style('display','none');
      })

  /* feb 2012 */
    d3.select('#feblink')
      .on('click', function(){

        // define date boundaries
        var d1 = new Date("Jan 1, 2012")
        var d2 = new Date("Mar 30, 2012")
        // update brush extent
        brush.extent([d1,d2]);
        // redraw brush on overview 
        svg.select('.brush').transition().call(brush);
        // redraw detail view
        xDetailScale.domain(brush.extent());
        // redraw detail lines and dots
        detailFrame.select('.detailArea').transition().attr('d', area);
        detailFrame.select('.detailPath').transition().attr('d', line);
        detailFrame.selectAll('.dot').transition().attr('cx', function(d) { return xDetailScale(d.date); });
        // redraw axis
        detailFrame.select('.x.axis').transition().call(xDetailAxis);
        // show info div
        d3.select('#feb').transition().delay(300).style('display','block');
        console.log('feb clicked');

        // hide any other text
        d3.selectAll('.factpoints').style('display','none');
      });

  /* aug 2012 */
    d3.select('#auglink')
      .on('click', function(){

        // define date boundaries
        var d1 = new Date("Jul 1, 2012")
        var d2 = new Date("Sep 30, 2012")
        // update brush extent
        brush.extent([d1,d2]);
        // redraw brush on overview 
        svg.select('.brush').transition().call(brush);
        // redraw detail view
        xDetailScale.domain(brush.extent());
        // redraw detail lines and dots
        detailFrame.select('.detailArea').transition().attr('d', area);
        detailFrame.select('.detailPath').transition().attr('d', line);
        detailFrame.selectAll('.dot').transition().attr('cx', function(d) { return xDetailScale(d.date); });
        // redraw axis
        detailFrame.select('.x.axis').transition().call(xDetailAxis);
        // show info div
        d3.select('#aug').transition().delay(300).style('display','block');
        console.log('aug clicked');
        
        // hide any other text
        d3.selectAll('.factpoints').style('display','none');      });

  }