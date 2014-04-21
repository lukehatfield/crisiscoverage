function getData(){d3.csv(mediaStats,function(t){originalData=t;var e=t.map(function(t){return t.site_name});sources=[],e.forEach(function(t,e){0==e?sources.push(t):-1==sources.indexOf(t)&&sources.push(t)}),sources.forEach(function(e){t.forEach(function(t){})}),t.forEach(function(t){t.date_query_end=parseDateQuery(t.date_query_end),dateList.push(t.date_query_end)});var a=[];return sources.forEach(function(e,a){var n=[];n.name=e,n.values=[],t.forEach(function(t){e==t.site_name&&n.values.push({date:t.date_query_end,count:+t.raw_result_count,name:e,type:t.site_type})}),allDates.push(n)}),color=d3.scale.category20(),aggregateData()})}function aggregateData(){var t=[];return allDates[0].values.forEach(function(e){t.push(e.date)}),mediaTypes.forEach(function(e){var a=[];a.name=e,a.values=[],t.forEach(function(t){var n=0;originalData.forEach(function(a){e==a.site_type&&t.getTime()==a.date_query_end.getTime()&&(n+=+a.raw_result_count)}),a.values.push({date:t,count:n,name:e})}),aggregateMediaStats.push(a)}),storypoints()}function storypoints(){d3.csv("data/haiyan/storypoints.csv",function(t){return storyPoints=t,storyPoints.forEach(function(t){t.date=parseStorypoint(t.date)}),detailVis()})}function detailVis(){xScale=d3.time.scale().domain(d3.extent(dateList,function(t){return t})).range([0,bbDetail.w]);var t=svg.append("g").attr({"class":"detailFrame",transform:"translate("+bbDetail.x+","+bbDetail.y+")"});yScale=d3.scale.linear().domain([0,d3.max(allDates,function(t){return d3.max(t.values,function(t){return t.count})})]).range([bbDetail.h,0]),xAxis=d3.svg.axis().scale(xScale).orient("bottom").ticks(4).tickFormat(d3.time.format("%b")),yAxis=d3.svg.axis().scale(yScale).orient("left").ticks(6);var e=d3.svg.line().x(function(t){return xScale(t.date)}).y(function(t){return yScale(t.count)}).interpolate("linear");t.append("g").attr({"class":"x axis",transform:"translate(0,"+bbDetail.h+")"}).call(xAxis),t.append("g").attr({"class":"y axis"}).call(yAxis).append("text").attr("x",-5).attr("y",-45).attr("dy","30px").style("text-anchor","end").text("Coverage");var a=svg.selectAll(".mediaSources").data(allDates).enter().append("g").attr("class","mediaSources");a.append("path").attr({id:function(t){return console.log(t),t.name},d:function(t){return e(t.values)},transform:"translate(0,"+bbDetail.y+")"}).style({stroke:function(t){return color(t.name)},fill:"none"}),a.selectAll("circle").data(function(t){return t.values}).enter().append("circle").attr({"class":"dot",cx:function(t){return xScale(t.date)},cy:function(t){return yScale(t.count)},r:4,transform:"translate(0,"+bbDetail.y+")"}).style({fill:function(t){var e=color(t.name),a=d3.rgb(e).darker();return a}}).on("mouseover",function(t){d3.select(this).transition().duration(25).attr("r",10),n.show(t)}).on("mouseleave",function(t){d3.select(this).transition().duration(25).attr("r",4),n.hide(t)}),a.append("text").attr({id:function(t){return t.name},x:width+180,y:function(t,e){return 16*e-margin.top/2},dy:"0.35em",cursor:"pointer",fill:function(t){return color(t.name)}}).style("text-anchor","end").text(function(t){return t.name}).on("click",function(t){var n=d3.select(this).attr("id");"#ccc"!=d3.select(this).attr("fill")?(console.log("id: ",n),d3.select(this).attr("fill","#ccc"),a.select("path[id='"+n+"'").transition().attr("d",function(t){return null})):(d3.select(this).attr("fill",function(t){return color(t.name)}),a.select("path").transition().attr("d",function(t){return e(t.values)}))}),d3.select("#crisisTitle").html("<h3>Typhoon Haiyan</h3>"),d3.select("#crisisStory").html('Typhoon Haiyan, known as Typhoon Yolanda in the Philippines, was a powerful tropical cyclone that devastated portions of Southeast Asia, particularly the Philippines, on November 8, 2013. <a href="http://en.wikipedia.org/wiki/Typhoon_Haiyan" class="storySource">&mdash; Wikipedia</a>'),t.selectAll(".line").data(storyPoints).enter().append("line").attr({"class":"storyline",x1:function(t){return xScale(t.date)},x2:function(t){return xScale(t.date)},y1:-bbDetail.y,y2:bbDetail.h}),t.selectAll(".storyTriangle").data(storyPoints).enter().append("path").attr({"class":"storyTriangle",transform:function(t){return"translate("+xScale(t.date)+","+-bbDetail.y+")"},d:d3.svg.symbol().type("triangle-down").size(256)}).on("mouseover",function(t){var e=parseDateTips(t.date);d3.select(".crisisDate").remove(),d3.select("#crisisTitle").append("span").html(e).attr("class","crisisDate"),d3.select("#crisisStory").html(t.title),d3.selectAll(".storyTriangle").transition().style("fill","#919191").attr("d",d3.svg.symbol().type("triangle-down").size(256)),d3.select(this).transition().style("fill","#3D8699").attr("d",d3.svg.symbol().type("triangle-down").size(512))});var n=d3.tip().html(function(t){return t.count+" articles on <span class='sourceName'>"+t.name+"</span> during<br>the 30 days prior to "+parseDateTips(t.date)}).direction("e").attr("class","d3-tip e");t.call(n);var r=svg.selectAll(".legend").data(sources).enter().append("g").attr("class","legend").attr({transform:function(t,e){return"translate(180,"+(16*e-margin.top/2)+")"},fill:color}).on("mouseout",function(t){d3.selectAll("rect").attr({opacity:1})})}function sourceChanged(){var t=d3.event.target.value;"bbc"==t?doBBC():"google"==t&&doGoogle()}function redraw(t){if("types"==t)var e=aggregateMediaStats;else var e=allDates;yScale=d3.scale.linear().domain([0,d3.max(e,function(t){return d3.max(t.values,function(t){return t.count})})]);var a=svg.selectAll(".mediaSources").data(e).exit().transition().remove();a=svg.selectAll(".mediaSources").data(e).enter().append("g").attr("class","mediaSources"),a.selectAll("path").attr({d:function(t){return console.log(t),line(t.values)},transform:"translate(0,"+bbDetail.y+")"}),d3.select(".y.axis").call(yAxis),console.log("no way")}var allDates,aggregateMediaStats,bbDetail,bbOverview,detailFrame,dateList,blogDates,color,storyPoints,duplicateAllDates,duplicateTraditonalDates,duplicateBlogDates,line,mediaTypes,originalData,padding,parseYear,sources,svg,xAxis,xScale,xOverviewScale,yAxis,yScale,margin={top:50,right:200,bottom:0,left:100},width=960-margin.left-margin.right,height=400-margin.bottom-margin.top;bbOverview={x:0,y:10,w:width,h:50},bbDetail={x:0,y:25,w:width,h:300};var padding=30,parseDate=d3.time.format("%Y-%m-%dT%H:%M:%S+00:00").parse,parseDateQuery=d3.time.format("%Y-%m-%d").parse,parseDateSimple=d3.time.format("%b %d %Y"),parseDateTips=d3.time.format("%b %d, %Y"),parseStorypoint=d3.time.format("%Y-%m-%d").parse;allDates=[],aggregateMediaStats=[],mediaTypes=["Traditional","Independent","Blogs-Social"],dateList=[],duplicateTraditonalDates=[],duplicateBlogDates=[],blogDates=[],svg=d3.select("#timelineVis").append("svg").attr({"class":"timeline",width:width+margin.left+margin.right,height:height+margin.top+margin.bottom}).append("g").attr({transform:"translate("+margin.left+","+margin.top+")"}),svg.append("defs").append("clipPath").attr("id","clip").append("rect").attr("width",width).attr("height",height);var mediaStats="productiondata/haiyan/google-media_stats.csv",blogSource="data/haiyan/2014-04-10 12.53.14_haiyan-google-blog_query_stats.csv";getData(),d3.select("#dataSourceSelect").on("change",sourceChanged),d3.select('input[value="types"]').on("click",function(){redraw("types")}),d3.select('input[value="sources"]').on("click",function(){redraw("sources")});