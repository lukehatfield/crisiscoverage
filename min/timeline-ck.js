function storypoints(){d3.csv("data/haiyan/storypoints.csv",function(t){return storyPoints=t,storyPoints.forEach(function(t){t.date=parseStorypoint(t.date)}),detailVis()})}function detailVis(){function t(){xDetailScale.domain(brush.empty()?xOverviewScale.domain():brush.extent()),l.select(".detailArea").attr("d",n),l.select(".detailPath").attr("d",s),l.selectAll(".dot").attr("cx",function(t){return xDetailScale(t.date)}),l.select(".x.axis").call(e),d3.select(".factpoints").style("display","none")}var e,a,i;xDetailScale=d3.time.scale().domain(d3.extent(dates,function(t){return t.date})).range([0,bbDetail.w]);var l=svg.append("g").attr({"class":"detailFrame",transform:"translate("+bbDetail.x+","+bbDetail.y+")"});i=d3.scale.linear().domain([d3.min(dates,function(t){return t.total}),d3.max(dates,function(t){return t.total})]).range([bbDetail.h,0]),e=d3.svg.axis().scale(xDetailScale).orient("bottom").ticks(7).tickFormat(d3.time.format("%b")),a=d3.svg.axis().scale(i).orient("left").ticks(6);var n=d3.svg.area().x(function(t){return xDetailScale(t.date)}).y0(bbDetail.h).y1(function(t){return i(t.total)}),s=d3.svg.line().x(function(t){return xDetailScale(t.date)}).y(function(t){return i(t.total)}).interpolate("linear");l.append("g").attr({"class":"x axis",transform:"translate(0,"+bbDetail.h+")"}).call(e),l.append("g").attr({"class":"y axis"}).call(a).append("text").attr("x",-5).attr("y",-45).attr("dy","30px").style("text-anchor","end").text("Coverage"),l.append("path").datum(dates).attr("class","detailArea").attr("d",n),l.append("path").datum(dates).attr({"class":"detailPath",d:s}).style({fill:"none"}),d3.select("#crisisTitle").html("<h3>Typhoon Haiyan</h3>"),d3.select("#crisisStory").html('Typhoon Haiyan, known as Typhoon Yolanda in the Philippines, was a powerful tropical cyclone that devastated portions of Southeast Asia, particularly the Philippines, on November 8, 2013. <a href="http://en.wikipedia.org/wiki/Typhoon_Haiyan" class="storySource">&mdash; Wikipedia</a>'),l.selectAll(".line").data(storyPoints).enter().append("line").attr({"class":"storyline",x1:function(t){return xDetailScale(t.date)},x2:function(t){return xDetailScale(t.date)},y1:-bbDetail.y,y2:bbDetail.h}),l.selectAll(".storyTriangle").data(storyPoints).enter().append("path").attr({"class":"storyTriangle",transform:function(t){return"translate("+xDetailScale(t.date)+","+-bbDetail.y+")"},d:d3.svg.symbol().type("triangle-down").size(256)}).on("mouseover",function(t){var e=parseDateTips(t.date);d3.select(".crisisDate").remove(),d3.select("#crisisTitle").append("span").html(e).attr("class","crisisDate"),d3.select("#crisisStory").html(t.title),d3.selectAll(".storyTriangle").transition().style("fill","#919191").attr("d",d3.svg.symbol().type("triangle-down").size(256)),d3.select(this).transition().style("fill","#3D8699").attr("d",d3.svg.symbol().type("triangle-down").size(512))}),tip=d3.tip().html(function(t){return 1==t.total?t.total+" article on "+parseDateTips(t.date):t.total+" articles on "+parseDateTips(t.date)}).direction("e").attr("class","d3-tip e"),l.call(tip),l.selectAll(".dot").data(dates).enter().append("circle").attr({"class":"dot",cx:function(t){return xDetailScale(t.date)},cy:function(t){return i(t.total)},r:4}).on("mouseover",function(t){d3.select(this).transition().duration(25).attr("r",10),tip.show(t)}).on("mouseleave",function(t){d3.select(this).transition().duration(25).attr("r",4),tip.hide(t)}),brush=d3.svg.brush().x(xOverviewScale).on("brush",t),svg.append("g").attr("class","brush").call(brush).selectAll("rect").attr({height:bbOverview.h,transform:"translate(0,0)"}),d3.select("#reset").on("click",function(){brush.clear(),svg.select(".brush").transition().call(brush),xDetailScale.domain(xOverviewScale.domain()),l.select(".detailArea").transition().attr("d",n),l.select(".detailPath").transition().attr("d",s),l.selectAll(".dot").transition().attr("cx",function(t){return xDetailScale(t.date)}),l.select(".x.axis").transition().call(e),d3.selectAll(".factpoints").style("display","none")}),d3.select("#feblink").on("click",function(){var t=new Date("Jan 1, 2012"),a=new Date("Mar 30, 2012");brush.extent([t,a]),svg.select(".brush").transition().call(brush),xDetailScale.domain(brush.extent()),l.select(".detailArea").transition().attr("d",n),l.select(".detailPath").transition().attr("d",s),l.selectAll(".dot").transition().attr("cx",function(t){return xDetailScale(t.date)}),l.select(".x.axis").transition().call(e),d3.select("#feb").transition().delay(300).style("display","block"),console.log("feb clicked"),d3.selectAll(".factpoints").style("display","none")}),d3.select("#auglink").on("click",function(){var t=new Date("Jul 1, 2012"),a=new Date("Sep 30, 2012");brush.extent([t,a]),svg.select(".brush").transition().call(brush),xDetailScale.domain(brush.extent()),l.select(".detailArea").transition().attr("d",n),l.select(".detailPath").transition().attr("d",s),l.selectAll(".dot").transition().attr("cx",function(t){return xDetailScale(t.date)}),l.select(".x.axis").transition().call(e),d3.select("#aug").transition().delay(300).style("display","block"),console.log("aug clicked"),d3.selectAll(".factpoints").style("display","none")})}var bbDetail,bbOverview,dates,storyPoints,duplicateDates,padding,parseYear,svg,xDetailScale,xOverviewScale,margin={top:50,right:50,bottom:0,left:100},width=960-margin.left-margin.right,height=400-margin.bottom-margin.top;bbOverview={x:0,y:10,w:width,h:50},bbDetail={x:0,y:25,w:width,h:300},padding=30,parseDate=d3.time.format("%Y-%m-%dT%H:%M:%S+00:00").parse,parseDateSimple=d3.time.format("%b %d %Y"),parseDateTips=d3.time.format("%b %d, %Y"),parseStorypoint=d3.time.format("%Y-%m-%d").parse,duplicateDates=[],dates=[],svg=d3.select("#timelineVis").append("svg").attr({"class":"timeline",width:width+margin.left+margin.right,height:height+margin.top+margin.bottom}).append("g").attr({transform:"translate("+margin.left+","+margin.top+")"}),svg.append("defs").append("clipPath").attr("id","clip").append("rect").attr("width",width).attr("height",height),d3.csv("data/2014-04-03-12.09.57_all_no_text-no2011.csv",function(t){originalData=t;var e=d3.keys(t[0]).filter(function(t){return"AnalysisDate"!==t});originalData.forEach(function(t,e){t.date_published=parseDate(t.date_published),null!=t.date_published&&duplicateDates.push(t.date_published)}),duplicateDates.sort(function(t,e){return d3.ascending(t,e)});var a;return duplicateDates.forEach(function(t,e){var i=parseDateSimple(t);i!=a?(dates.push({date:t,total:1}),a=i):dates[dates.length-1].total++}),storypoints()});