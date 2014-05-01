//-----------Global Variables--------------------
var stats_filter = {};
var details_filter = {};
var details;
var stats;

//SVG variables
//Measurements for small charts
var sm_margin = {top:5,right:10,bottom:10,left:10};
var sm_width = 200 - sm_margin.left - sm_margin.right;
var sm_height = 200 - sm_margin.top - sm_margin.bottom;

//measurements for large charts
var margin = {top:0,right:0,bottom:50,left:100};
var width = 1060 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;

//Dictionary of English names for crisis values
var crisis_dict = {"turkish-revolt": "A Revolt in Turkey","pakistan-drought": "Drought in Pakistan", "ukraine-protest":"Protests in Ukraine", "haiyan":"Typhoon Haiyan"};

//--------------Scales--------------------------
//Stacked bar graph scales
var xScale_l, yScale_l,
    color_l = d3.scale.category20();

//grouped bar graph scales
var xScale_s, yScale_s, yScale_s;
var parse = d3.time.format("%Y-%m-%d").parse;
var format = d3.time.format("%B");

//------------------End Global Variable declarations----------------------

//----------- Use Data -------------------------
/**
 * Use data.
 * @param error
 * @param data
 * @param crisisSummary
 */
function useData(error, data,crisisSummary){

    /* Crisis summary */
    // make summary global for use in tab changes
    summary = crisisSummary;

    // update crisis info section
    resetSummary(summary);
	
	var keys = Object.keys(crisis_dict);
	details = data[0];
	stats = data[1];
	//build cross filter objects
	//Populate Crossfilter objects
	$(keys).each(function(i,k){
		//construct stats key
		key = k;
		stats_key = k+"_stats";
		details_key = k + "_details"

		stats_filter[key] = crossfilter();
		details_filter[key] = crossfilter();
		
		//retrieve list of stats objects and keys
		stats_objs = stats[stats_key];
		sobj_keys =  Object.keys(stats_objs);

		//retrieve list of details objects and keys
		d_objs = details[details_key];
		dobj_keys =  Object.keys(d_objs);

		//loop over keys and constuct crossfilter records
		s_records = [];
		$(sobj_keys).each(function(i,k){
			//create record for stats
			row = stats_objs[k];
			s_records.push({
				"crisis": key,
				"c_articles": row.crisis_count,
				"baseline" : row.all_count,
				"date_start" : row.date_start,
				"date_end" : row.date_end,
				"id" : row.id,
				"type": row.type,
				"domain" : row.name,
				"month"  : format(parse(row.date_start))
				});
		});

		d_records = []; 
		$(dobj_keys).each(function(i,k){
			//create record for stats
			row = d_objs[k];
			d_records.push({
				"crisis": row.collection,
				"domain": row.name,
				"title" : row.title,
				"type"  : row.type,
				"url"	: row.url,
				"date_start" : row.date_start,
				"date_end" : row.date_end
			});
		});
		
		stats_filter[key].add(s_records);
		details_filter[key].add(d_records);
	});
	//---------End Loop -----------------

	clear_charts();
	clear_stacks();
	build_initial_charts();
	stack_chart();
}
//------------end useData()------------------------
/**
 * Clear stacks.
 */
function clear_stacks(){
	d3.select("svg").remove();
    $('#stacked').empty();
	$('#source').empty();
}

/**
 * Clear charts.
 */
function clear_charts(){
	d3.select("#blog svg").remove();
	d3.select("#traditional svg").remove();
	d3.select("#independent svg").remove();

	$('#traditional').empty();
	$('#blog').empty();
    $('#bndependant').empty();

    //$('#cloud').empty();
    //$('#cloud').append("traditional");
}   

//----------------------------------------------
/**
 * Build initial charts.
 */
function build_initial_charts(){
	//build out scales
	xScale_l = d3.scale.ordinal().rangeRoundBands([0, width-250],.1);
	yScale_l = d3.scale.linear().rangeRound([height, 0]);

	//setup svgs
	svg = d3.select("#stacked").append("svg")
			.attr("width",width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			    .attr("transform", "translate("+margin.left +","+margin.top+")");
}

//------------Build Stacked Chart -----------------

/**
 * Stack Chart.
 */
function stack_chart(){

	var crisis = window.crisis_select.value;

	//Create data set for selected crisis
	var dset = stats[crisis+"_stats"];
	var data = [];
	var keys = Object.keys(dset);

	var names = [];
	var months = [];
	$(keys).each(function(i,k){
		var obj = dset[k];
		var source = obj.name;
		var date = format(parse(obj.date_start));

		if(jQuery.inArray(source, names) < 0)
			names.push(source)
		if(jQuery.inArray(date,months)<0)
			months.push(date)

	});
	//Remove Google as it skews everything
	var g_index = names.indexOf("Google");
	if (g_index > -1) {
    	names.splice(g_index, 1);
	}

	crisis_filter = stats_filter[crisis];
	mfilters = {};
	$(months).each(function (i,k){
		var dim = crisis_filter.dimension(function (d){return d.month});
		var dim_filtered = dim.filter(k);

		mfilters[k] = dim_filtered.top(Infinity);
		//clear all filters 
		dim_filtered.filterAll();
	});

	$(months).each(function (i,k){
		var total = 0;
		set = mfilters[k];
		var date = parse(set[0].date_start);
		var label = format(date);
		var source_counts = {};
		var mappings = [];
		
		$(set).each(function(i,k){
			if(k.domain != 'Google'){
				var y0 = 0;
				var articles = parseInt(k.c_articles);
				//check for nan
				if(!(articles==articles))
					articles = 0;
				source_counts[k.domain] = articles;
				total += articles;
				mappings.push({
					"label" : label,
					"name"  : k.domain,
					"y0"    : y0,
					"y1"    : articles
				});
				data.push({
					"sources":source_counts, 
					"mappings":mappings, 
					"x":label, 
					"total":total});
			}
		});
	})
	//------------------------------------------
	xScale_l.domain(data.map(function (d) {return d.x}));
	yScale_l.domain([0, d3.max(data, function(d){return d.total;})]);

	var selection = svg.selectAll(".series")
		.data(data)
		.enter().append("g")
			.attr("class", "series")
			.attr("transform", function (d) {return "translate("+xScale_l(d.x)+",0)";});

	selection.selectAll("rect")
		.data(function (d) {return d.mappings;})
		.enter().append("rect")
		.attr("width", "70px")
		.attr("y", function(d){return yScale_l(d.y1)})
		.attr("height", function(d){return yScale_l(d.y0) - yScale_l(d.y1);})
		.style("fill", function(d){ return color_l(d.name);})
		.on("click", function (d){
			//update the data table
			show_table(d.label, crisis, months);

			//create new filter for data in month 
			var crisis_filter = stats_filter[crisis];
			var dim = crisis_filter.dimension(function (d){return d.month});
			var dim_filtered = dim.filter(d.label);
		    var urows = dim_filtered.top(Infinity);
			dim_filtered.filterAll();

			clear_charts();
			indi_group(urows);
			blog_group(urows);
			trad_group(urows);

            //update all details charts
            $(function() {
                $( "#deeper_dialog" ).dialog({
                    height: 500,
                    width: 1000,
                    modal: false
                });
            });
            $('#deeper_dialog').show();

		});

  	//Add Legends
	var legend = svg.selectAll(".legend")
            .data(names.slice().reverse())//TODO: WHAT IS THE RIGHT ORDERING?
          .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function (d, i) {
              return "translate("+(margin.right)+"," + i *15 + ")";
            });

        legend.append("rect")
            .attr("x", width - 120)
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", color_l)
            .style("stroke", "grey");

        legend.append("text")
            .attr("x", width - 130)
            .attr("y", 6)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function (d) { return d; })
            .attr("fill", function(d){ return color_l(d); });

    //Add Axes
    var xAxis = d3.svg.axis()
    	.scale(xScale_l)
    	.orient("bottom");

	var yAxis = d3.svg.axis()
    	.scale(yScale_l)
    	.orient("left");

    svg.append("g")
    .attr("class", "axis")//instead of x axis
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

	svg.append("g")
	    .attr("class", "axis")//instead of y axis
    	.call(yAxis)
	  .append("text")
	    .attr("transform", "rotate(-90)")
	    .attr("y", 6)
	    .attr("dy", ".71em")
	    .style("text-anchor", "end")
	    .text("Articles Published Related to Crisis");

    svg.selectAll('.axis line, .axis path')
        .style({'stroke': '#CCC', 'fill': '#CCC', 'stroke-width': '1px'});

    svg.selectAll('.axis text')
        .style({'fill': '#CCC'});

	show_table(months[0], months);
}

//-------Show Table -----------------------
/**
 * Show Table
 * @param month
 * @param months
 */
function show_table(month, months){

    var crisis = window.crisis_select.value;

	$('#source').empty();
    $('#source').append(
        "<table id='table' class='display' cellpadding='0' cellspacing='0' border='0'></table>");

	//get data and create filter 
	var crisis_filter = details_filter[crisis];
	var dim = crisis_filter.dimension(function (d){return d.month});
	var dim_filtered = dim.filter(month);
    var urows = dim_filtered.top(Infinity);
	dim_filtered.filterAll();
	
	//populate row
	rows = [];
		$(urows).each(function(i,k){
		url = "<a href =" + k.url +"> article url</a>";
	
		rows.push([month, k.domain, k.date_start, k.date_end,k.title,url ])
	});

	var columns = [
            { "sTitle": "Month" },
            { "sTitle": "Domain" },
            { "sTitle": "Query Start Date" },
            { "sTitle": "Query End Date" },
            { "sTitle": "Title"},
            { "sTitle": "Url"}
        ]
    //deploy table
	$('#table').dataTable( {
        "aaData": rows,
        "aoColumns": columns 
    } );   
}

//------------Grouped bar graph code-----------------

/**
 * Independent Group
 * @param data
 */
function indi_group(data){
	//-------Parse data----------------------------------
	var type = 'Independent'
	var final_data = [];
	$(data).each(function (i,k){
		//Check article's type
		if(k.type == type){
			var crisis_count = k.c_articles;
			var baseline = k.baseline;
			var label = k.domain;
			var bars = [];
			bars.push({"name":"Baseline", "value":baseline});
			bars.push({"name":"Crisis Articles", "value":crisis_count});
		final_data.push({"crisis_count":crisis_count, 
						 "baseline" : baseline,
						 "label" : label,
						 "bars": bars	
						})
			
		}
	});

	var keys = ["Baseline", "Crisis Articles"];	
	//----------Create SVG and scales ----------------
	var m = {top: 20, right: 20, bottom: 30, left: 40};
    var w = 300 - m.left - m.right;
    var h = 300 - m.top - m.bottom;

    var x0 = d3.scale.ordinal()
    .rangeRoundBands([0, w], .1);

	var x1 = d3.scale.ordinal();

	var y = d3.scale.linear()
	    .range([h, 0]);

	var color = d3.scale.ordinal()
	    .range(["red","blue"]);

	var xAxis = d3.svg.axis()
	    .scale(x0)
	    .orient("bottom");

	var yAxis = d3.svg.axis()
	    .scale(y)
	    .orient("left")
	    .tickFormat(d3.format(".2s"));

	var msvg = d3.select("#independent").append("svg")
  		  .attr("width", w + m.left + m.right)
    	  .attr("height", h + m.top + m.bottom)
  		  .append("g")
  		  .attr("transform", "translate(" + m.left + "," + m.top + ")");

  	//-------Set up Scale domains ------------
  	x0.domain(final_data.map(function(d) {return d.label;}));
  	x1.domain(keys).rangeRoundBands([0, x0.rangeBand()]);
 	y.domain([0, d3.max(final_data, function(d) { return d3.max(d.bars, function(d) { return d.value; }); })]);

 	msvg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + h + ")")
      .call(xAxis);

  msvg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Population");

  var domains = msvg.selectAll(".domains")
      .data(final_data)
    .enter().append("g")
      .attr("class", "g")
      .attr("transform", function(d) { return "translate(" + x0(d.label) + ",0)"; });

  domains.selectAll("rect")
      .data(function(d) { return d.bars; })
    .enter().append("rect")
      .attr("width", x1.rangeBand())
      .attr("x", function(d) { return x1(d.name); })
      .attr("y", function(d) { return y(d.value); })
      .attr("height", function(d) { return height - y(d.value); })
      .style("fill", function(d) { return color(d.name); });

 
 /* Legend */
  var legend = msvg.selectAll(".legend")
      .data(keys.slice().reverse())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
      .attr("x", w - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

  legend.append("text")
      .attr("x", w - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d; });
}

/**
 * Traditional Group
 * @param data
 */
function trad_group(data){
	//-------Parse data----------------------------------
	var type = 'Traditional'
	var final_data = [];
	$(data).each(function (i,k){
		//Check article's type
		if(k.type == type){
			var crisis_count = k.c_articles;
			var baseline = k.baseline;
			var label = k.domain;
			var bars = [];
			bars.push({"name":"Baseline", "value":baseline});
			bars.push({"name":"Crisis Articles", "value":crisis_count});
		final_data.push({"crisis_count":crisis_count, 
						 "baseline" : baseline,
						 "label" : label,
						 "bars": bars	
						})
			
		}
	});

	var keys = ["Baseline", "Crisis Articles"];	
	//----------Create SVG and scales ----------------
	var m = {top: 20, right: 20, bottom: 30, left: 40};
    var w = 300 - m.left - m.right;
    var h = 300 - m.top - m.bottom;

    var x0 = d3.scale.ordinal()
    .rangeRoundBands([0, w], .1);

	var x1 = d3.scale.ordinal();

	var y = d3.scale.linear()
	    .range([h, 0]);

	var color = d3.scale.ordinal()
	    .range(["red","blue"]);

	var xAxis = d3.svg.axis()
	    .scale(x0)
	    .orient("bottom");

	var yAxis = d3.svg.axis()
	    .scale(y)
	    .orient("left")
	    .tickFormat(d3.format(".2s"));

	var msvg = d3.select("#traditional").append("svg")
  		  .attr("width", w + m.left + m.right)
    	  .attr("height", h + m.top + m.bottom)
  		  .append("g")
  		  .attr("transform", "translate(" + m.left + "," + m.top + ")");

  	//-------Set up Scale domains ------------
  	x0.domain(final_data.map(function(d) {return d.label;}));
  	x1.domain(keys).rangeRoundBands([0, x0.rangeBand()]);
 	y.domain([0, d3.max(final_data, function(d) { return d3.max(d.bars, function(d) { return d.value; }); })]);

 	msvg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + h + ")")
      .call(xAxis);

  msvg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Population");

  var domains = msvg.selectAll(".domains")
      .data(final_data)
    .enter().append("g")
      .attr("class", "g")
      .attr("transform", function(d) { return "translate(" + x0(d.label) + ",0)"; });

  domains.selectAll("rect")
      .data(function(d) { return d.bars; })
    .enter().append("rect")
      .attr("width", x1.rangeBand())
      .attr("x", function(d) { return x1(d.name); })
      .attr("y", function(d) { return y(d.value); })
      .attr("height", function(d) { return height - y(d.value); })
      .style("fill", function(d) { return color(d.name); });
 
 /* Legend */
  var legend = msvg.selectAll(".legend")
      .data(keys.slice().reverse())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
      .attr("x", w - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

  legend.append("text")
      .attr("x", w - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d; });
      console.log(data);
}

function blog_group(data){
	//-------Parse data----------------------------------
	var type = 'Blogs-Social'
	var final_data = [];
	$(data).each(function (i,k){
		//Check article's type
		if(k.type == type){
			var crisis_count = k.c_articles;
			var baseline = k.baseline;
			var label = k.domain;
			var bars = [];
			bars.push({"name":"Baseline", "value":baseline});
			bars.push({"name":"Crisis Articles", "value":crisis_count});
		final_data.push({"crisis_count":crisis_count, 
						 "baseline" : baseline,
						 "label" : label,
						 "bars": bars	
						});
		}
	});

	var keys = ["Baseline", "Crisis Articles"];	
	//----------Create SVG and scales ----------------
	var m = {top: 20, right: 20, bottom: 30, left: 40};
    var w = 300 - m.left - m.right;
    var h = 300 - m.top - m.bottom;

    var x0 = d3.scale.ordinal()
    .rangeRoundBands([0, w], .1);

	var x1 = d3.scale.ordinal();

	var y = d3.scale.linear()
	    .range([h, 0]);

	var color = d3.scale.ordinal()
	    .range(["red","blue"]);

	var xAxis = d3.svg.axis()
	    .scale(x0)
	    .orient("bottom");

	var yAxis = d3.svg.axis()
	    .scale(y)
	    .orient("left")
	    .tickFormat(d3.format(".2s"));

	var msvg = d3.select("#blog").append("svg")
  		  .attr("width", w + m.left + m.right)
    	  .attr("height", h + m.top + m.bottom)
  		  .append("g")
  		  .attr("transform", "translate(" + m.left + "," + m.top + ")");

  	//-------Set up Scale domains ------------
  	x0.domain(final_data.map(function(d) {return d.label;}));
  	x1.domain(keys).rangeRoundBands([0, x0.rangeBand()]);
 	y.domain([0, d3.max(final_data, function(d) { return d3.max(d.bars, function(d) { return d.value; }); })]);

 	msvg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + h + ")")
      .call(xAxis);

  msvg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Population");

  var domains = msvg.selectAll(".domains")
      .data(final_data)
    .enter().append("g")
      .attr("class", "g")
      .attr("transform", function(d) { return "translate(" + x0(d.label) + ",0)"; });

  domains.selectAll("rect")
      .data(function(d) { return d.bars; })
    .enter().append("rect")
      .attr("width", x1.rangeBand())
      .attr("x", function(d) { return x1(d.name); })
      .attr("y", function(d) { return y(d.value); })
      .attr("height", function(d) { return height - y(d.value); })
      .style("fill", function(d) { return color(d.name); });

  /* Legend */
  var legend = msvg.selectAll(".legend")
      .data(keys.slice().reverse())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
      .attr("x", w - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

  legend.append("text")
      .attr("x", w - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d; });
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CRISIS SELECT
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

$('document').ready(function(){
    addClassNameListener("crisis_select", function(){

        $('#deeper_dialog').hide();

        var crisis = window.crisis_select.value;
        console.log("### QUEUE NEW CRISIS ("+crisis+") AFTER CLASS CHANGE ###");
        queue()
            .defer(d3.json, "productiondata/con-data.json")//consolidated data
            .defer(d3.csv, "/productiondata/"+crisis+"/summary.csv")//storypoints
            .await(useData);
    });

    $('#deeper_dialog').hide();
});