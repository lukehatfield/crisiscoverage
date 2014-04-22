//START ::: PREVIOUS WITH ROTATING {{
//var diameter = 320,
//    radius = diameter >> 1,
//    velocity = .01,
//    then = Date.now();
//
//var projection = d3.geo.orthographic()
//    .scale(radius - 2)
//    .translate([radius, radius])
//    .clipAngle(90)
//    .precision(0);
//
//var canvas = d3.select("#rotatingGlobe").selectAll("canvas")
//    .data(d3.range(1))
//  .enter().append("canvas")
//    .attr("width", diameter)
//    .attr("height", diameter);
//var path = d3.geo.path()
//    .projection(projection);
//
//d3.json("/productiondata/rotatingglobe.json", function(error, world) {
//  var land = topojson.feature(world, world.objects.land),
//      globe = {type: "Sphere"};
//
//  d3.timer(function() {
//    var angle = velocity * (Date.now() - then);
//    canvas.each(function(i) {
//      var rotate = [0, 0, 0], context = this.getContext("2d");
//      rotate[i] = angle, projection.rotate(rotate);
//      context.clearRect(0, 0, diameter, diameter);
//      context.beginPath(), path.context(context)(land), context.fill();
//      context.beginPath(), path(globe), context.stroke();
//    });
//  });
//});
//END ::: PREVIOUS WITH ROTATING }}

//FIXME: MAKE THE CRISIS LOOP CONTINUE AS BEFORE

var diameter = 320,
    radius = diameter >> 1,
    width = diameter,
    height = diameter;

var projection = d3.geo.orthographic()
    .scale(radius - 2)
    .translate([radius, radius])
    .clipAngle(90)
    .precision(0);

var canvas = d3.select("#rotatingGlobe").append("canvas")
    .attr("width", width)
    .attr("height", height);

var c = canvas.node().getContext("2d");

var path = d3.geo.path()
    .projection(projection)
    .context(c);

var title = d3.select("#crisis_name");

queue()
    .defer(d3.json, "productiondata/world-110m.json")
    .defer(d3.tsv, "productiondata/crisis-country-names.tsv")
    .await(ready);

function ready(error, world, names) {
    var globe = {type: "Sphere"},
        land = topojson.feature(world, world.objects.land),
        countries = topojson.feature(world, world.objects.countries).features,
        borders = topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }),
        i = -1,
        n = countries.length;

    countries = countries.filter(function(d) {
        return names.some(function(n) {
            if (d.id == n.id) return d.name = n.name;
        });
    }).sort(function(a, b) {
        return a.name.localeCompare(b.name);
    });

    (function transition() {
        d3.transition()
            .duration(1250)
            .each("start", function() {
                title.text(countries[i = (i + 1) % n].name);
            })
            .tween("rotate", function() {
                var p = d3.geo.centroid(countries[i]),
                    r = d3.interpolate(projection.rotate(), [-p[0], -p[1]]);
                return function(t) {
                    projection.rotate(r(t));
                    c.clearRect(0, 0, width, height);
                    c.fillStyle = "#bbb", c.beginPath(), path(land), c.fill();
                    c.fillStyle = "#f00", c.beginPath(), path(countries[i]), c.fill();
                    c.strokeStyle = "#fff", c.lineWidth = .5, c.beginPath(), path(borders), c.stroke();
                    c.strokeStyle = "#000", c.lineWidth = 2, c.beginPath(), path(globe), c.stroke();
                };
            })
            .transition()
            .each("end", transition);
    })();
}