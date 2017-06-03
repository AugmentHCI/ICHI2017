var width = window.innerWidth,
    height = window.innerHeight,
    circleX = width / 2,
    circleY = height / 2;

var pi = Math.PI;

var outerRadius = d3.min([width / 2.7, height / 2.7]),
    innerRadius = d3.min([width / 2.5, height / 2.5]),
    episodeRadius = d3.min([width / 4, height / 4]),
    allergyRadius = d3.min([width / 6, height / 6]);

var colorMedication = "#ff7f0e",
    colorParameter = "#2ca02c",
    colorMeeting = "#1f77b4",
    colorTask = "#9467bd";

var defaultSleepStokeMultiplier = 1.2,
    defaultStrokeWidth = 3,
    defaultOuterStrokeWidth = 75,
    defaultSaturation = 60;

var angleOffset = Math.PI / 5;

var svg = d3.select("body")
    .append("svg")
    .attr("id", "svg_layer")
    .attr("width", width)
    .attr("height", height);

var svgContainer0 = svg
    .append("svg")
    .attr("class", "background1")
    .attr("id", "background")
    .attr("width", width)
    .attr("height", height);

var svgContainer1 = svg
    .append("svg")
    .attr("class", "background1")
    .attr("id", "background")
    .attr("width", width)
    .attr("height", height);

var svgContainer2 = svg
    .append("svg")
    .attr("class", "background2")
    .attr("id", "background")
    .attr("width", width)
    .attr("height", height);

var outerCircle = svgContainer1
    .append("circle")
    .attr("class", "outerCircle")
    .attr("cx", circleX)
    .attr("cy", circleY)
    .style("fill", "none")
    .style("stroke", "lightgrey")
    .style("stroke-width", defaultOuterStrokeWidth)
    .attr("r", outerRadius);

var episodeCircle = svgContainer1
    .append("circle")
    .attr("cx", circleX)
    .attr("cy", circleY)
    .style("fill", "none")
    .style("stroke", "lightgrey")
    .style("stroke-width", defaultStrokeWidth)
    .attr("r", episodeRadius);

var episodeAuxText = svgContainer1
    .append("text")
    .attr("class", "episodeAuxText")
    .attr("x", circleX + episodeRadius)
    .attr("y", circleY)
    .attr("text-anchor", "end")
    .style("fill", "grey")
    .text("Episodes");

var allergyCircle = svgContainer1
    .append("circle")
    .attr("cx", circleX)
    .attr("cy", circleY)
    .style("fill", "none")
    .style("stroke", "lightgrey")
    .style("stroke-width", defaultStrokeWidth)
    .attr("r", allergyRadius);

var allergyAuxText = svgContainer1
    .append("text")
    .attr("class", "allergyAuxText")
    .attr("x", circleX + allergyRadius)
    .attr("y", circleY)
    .attr("text-anchor", "end")
    .style("fill", "grey")
    .text("Allergies");

for (var i = 0; i < 24; i++) {
    svgContainer2
        .append("text")
        .attr("class", "hourAuxText")
        .attr("x", d => (circleX + outerRadius * Math.cos(pi * i / 12 - pi / 2)))
        .attr("y", d => (circleY + outerRadius * Math.sin(pi * i / 12 - pi / 2)))
        .attr("dy", ".3em")
        .attr("text-anchor", "middle")
        .style("stroke", "grey")
        .style("stroke-width", 1)
        .text(i);
}

d3.json("data.json", function (error, json) {

    d3.xml('images/moon.svg', "image/svg+xml", function (error, xml) {
        if (error) {console.log(error); return;}

        var svgNode = xml.getElementsByTagName("svg")[0];
        svg.node().appendChild(svgNode);
        var sun = d3.select("#moon-svg");
        sun
            .attr("x", circleX + outerRadius)
            .attr("y", circleY - outerRadius);
    });

    d3.xml('images/sun.svg', "image/svg+xml", function (error, xml) {
        if (error) {console.log(error); return;}

        var svgNode = xml.getElementsByTagName("svg")[0];
        svg.node().appendChild(svgNode);
        var sun = d3.select("#sun-svg");
        sun
            .attr("x", circleX - outerRadius)
            .attr("y", circleY + outerRadius)
            .attr("width", 28)
            .attr("height",28);
    });

    var sleepArc = d3.svg.arc()
        .innerRadius(() => -defaultSleepStokeMultiplier * defaultOuterStrokeWidth + outerRadius)
        .outerRadius(() => defaultSleepStokeMultiplier * defaultOuterStrokeWidth + outerRadius)
        .startAngle(d => -(360 - (360 / 24) * d.start) * Math.PI / 180) // TODO kan nog niet groter dan 24 zijn!
        .endAngle(d => (360 / 24) * d.stop * Math.PI / 180);

    var sleepSegment = svgContainer0.selectAll(".sleepSegment")
        .data([json.sleep])
        .enter()
        .append("svg");

    sleepSegment.append("path")
        .attr("d", sleepArc)
        .attr("fill", "#ededed")
        .attr("transform", "translate(" + circleX + "," + circleY + ") ")
        .attr('class', "sleepSegment");


    var nbEpisodes = json.elements.filter(d => d.type == "episode").length;
    var episodeAngle = 2 * Math.PI / nbEpisodes;
    var nbAllergies = 3;
    var allergiesAngle = 2 * Math.PI / nbAllergies;

    for (var i = 0; i < json.elements.length; i++) {
        var element = json.elements[i];
        var line = svgContainer1.selectAll(".line-" + element.name)
            .data(element.tasks)
            .enter().append("line");

        line
            .attr("x1", function() {
                if (element.type === "episode") {
                    return circleX + episodeRadius * Math.cos(episodeAngle * i - angleOffset);
                } else if (element.type === "allergy") {
                    return circleX + allergyRadius * Math.cos(allergiesAngle * i - angleOffset);
                }
            })
            .attr("y1", function() {
                if (element.type === "episode") {
                    return  circleY + episodeRadius * Math.sin(episodeAngle * i - angleOffset);
                } else if (element.type === "allergy") {
                    return circleY + allergyRadius * Math.sin(allergiesAngle * i - angleOffset);
                }
            })
            .attr("x2", d  => circleX + outerRadius * Math.cos((360 / 24) * (d.startHour + d.endHour) / 2 * Math.PI / 180 - Math.PI / 2))
            .attr("y2", d  => circleY + outerRadius * Math.sin((360 / 24) * (d.startHour + d.endHour) / 2 * Math.PI / 180 - Math.PI / 2))
            .attr("stroke-width", defaultStrokeWidth)
            .attr("stroke", d => lineColor(d.type, defaultSaturation))
            .attr("class", () => "line-" + element.name + " " + element.name)
            .on("mouseover", function (d) {
                d3.select(this).transition()
                    .attr("stroke", d => lineColor(d.type, 100))
                    .attr("stroke-width", 2 * defaultStrokeWidth)
                    .attr("fill", d => lineColor(d.type, 100));
            })
            .on("mouseout", function (d) {
                d3.select(this).transition()
                    .attr("stroke", d => lineColor(d.type, defaultSaturation))
                    .attr("stroke-width", defaultStrokeWidth)
                    .attr("fill", d => lineColor(d.type, defaultSaturation));
            });

        var arc = d3.svg.arc()
            .innerRadius(() => -defaultOuterStrokeWidth / 2 + outerRadius)
            .outerRadius(() => defaultOuterStrokeWidth / 2 + outerRadius)
            .startAngle(d => ((360 / 24) * d.startHour * Math.PI / 180)) //converting from degs to radians
            .endAngle(function (d) {
                if (+d.startHour !== +d.endHour) {
                    return ((360 / 24) * d.endHour * Math.PI / 180)
                } else {
                    return ((360 / 24) * (d.startHour + 0.05) * Math.PI / 180)
                }
            }); //just radians

        var arcSegment = svgContainer1.selectAll(".arcSegment-" + element.name)
            .data(element.tasks)
            .enter()
            .append("svg");

        arcSegment.append("path")
            .attr("d", arc)
            .attr("stroke", d => lineColor(d.type, defaultSaturation))
            .attr("fill", d => lineColor(d.type, defaultSaturation))
            .attr("transform", "translate(" + circleX + "," + circleY + ") ")
            .attr('class', "arcSegment-" + element.name + " " + element.name);

        var text = svgContainer1.selectAll(".text-" + element.name)
            .data(element.tasks)
            .enter().append("text");

        text
            .attr("class", () => "text-" + element.name)
            .attr("x", d  => circleX + outerRadius * Math.cos((360 / 24) * (d.startHour + d.endHour) / 2 * Math.PI / 180 - Math.PI / 2))
            .attr("y", d  => circleY + outerRadius * Math.sin((360 / 24) * (d.startHour + d.endHour) / 2 * Math.PI / 180 - Math.PI / 2))
            .style("fill", d => lineColor(d.type, defaultSaturation))
            .attr("dx", function (d) {
                var midHour = (d.startHour + d.endHour) / 2;
                return 1.3 * Math.cos(Math.PI / 12 * midHour - Math.PI / 2) + "em";
            })
            .attr("dy", function (d) {
                var midHour = (d.startHour + d.endHour) / 2;
                return 1.3 * Math.sin(Math.PI / 12 * midHour - Math.PI / 2) + "em";
            })
            .style("text-anchor", function (d) {
                var midHour = (d.startHour + d.endHour) / 2;
                if (midHour >= 0 && midHour < 12) {
                    return "start";
                } else {
                    return "end";
                }
            })
            .text(d => d.type);

        var episodeTexts = svg.selectAll(".episodeText")
            .data(json.elements)
            .enter()
            .append("text")
            .attr("class", "episodeText" + " " + element.name);

        episodeTexts
            .attr("text-anchor", "middle")
            .attr("x", function(d,i) {
                if (d.type === "episode") {
                    return circleX + episodeRadius * Math.cos(episodeAngle * i - angleOffset);
                } else if (d.type === "allergy") {
                    return circleX + allergyRadius * Math.cos(allergiesAngle * i - angleOffset);
                }
            })
            .attr("y", function(d,i) {
                if (d.type === "episode") {
                    return  -d.severity * 3.5 +circleY + episodeRadius * Math.sin(episodeAngle * i - angleOffset);
                } else if (d.type === "allergy") {
                    return -d.severity * 3.5 + circleY + allergyRadius * Math.sin(allergiesAngle * i - angleOffset);
                }
            })
            .text(d=> d.name);

        var elements = svgContainer2.selectAll(".episode")
            .data(json.elements)
            .enter()
            .append("circle")
            .attr("class", "element")
            .style("fill", "grey")
            .on("mouseover", highlightOver)
            .on("mouseout", highlightOut);

        elements
            .attr("cx", function(d,i) {
                if (d.type === "episode") {
                    return circleX + episodeRadius * Math.cos(episodeAngle * i - angleOffset);
                } else if (d.type === "allergy") {
                    return circleX + allergyRadius * Math.cos(allergiesAngle * i - angleOffset);
                }
            })
            .attr("cy", function(d,i) {
                if (d.type === "episode") {
                    return  circleY + episodeRadius * Math.sin(episodeAngle * i - angleOffset);
                } else if (d.type === "allergy") {
                    return circleY + allergyRadius * Math.sin(allergiesAngle * i - angleOffset);
                }
            })
            .attr("r", d => d.severity * 2);
    }
});

function highlightOver(d) {
    console.log(d);
    d3.selectAll("." + d.name)
        .transition()
        .attr("stroke", d => lineColor(d.type, 100))
        .attr("stroke-width", 2 * defaultStrokeWidth)
        .attr("fill", d => lineColor(d.type, 100));
}

function highlightOut(d) {
    d3.selectAll("." + d.name)
        .transition()
        .attr("stroke", d => lineColor(d.type, defaultSaturation))
        .attr("stroke-width", defaultStrokeWidth)
        .attr("fill", d => lineColor(d.type, defaultSaturation));
}

function lineColor(d, percent) {
    switch (d) {
        case "bloedwaarde":
            return hexColorWithSaturation(colorParameter, percent);
        case "medication":
            return hexColorWithSaturation(colorMedication, percent);
        case "meeting":
            return hexColorWithSaturation(colorMeeting, percent);
        case "task":
            return hexColorWithSaturation(colorTask, percent);
    }
}

function hexColorWithSaturation(hex, percent) {
    if (!/^#([0-9a-f]{6})$/i.test(hex)) {
        throw('Unexpected color format');
    }

    var r = parseInt(hex.substr(1, 2), 16),
        g = parseInt(hex.substr(3, 2), 16),
        b = parseInt(hex.substr(5, 2), 16),
        sorted = [r, g, b].sort(function (a, b) {
            return a - b;
        }),
        min = sorted[0],
        med = sorted[1],
        max = sorted[2];

    if (min == max) {
        return hex;
    }

    var max2 = max,
        rel = (max - med) / (med - min),
        min2 = max / 100 * (100 - percent),
        med2 = isFinite(rel) ? (rel * min2 + max2) / (rel + 1) : min2,
        int2hex = function (int) {
            return ('0' + int.toString(16)).substr(-2);
        },
        rgb2hex = function (rgb) {
            return '#' + int2hex(rgb[0]) + int2hex(rgb[1]) + int2hex(rgb[2]);
        },
        hex2;

    min2 = Math.round(min2);
    med2 = Math.round(med2);

    if (r == min) {
        hex2 = rgb2hex(g == med ? [min2, med2, max2] : [min2, max2, med2]);
    }
    else if (r == med) {
        hex2 = rgb2hex(g == max ? [med2, max2, min2] : [med2, min2, max2]);
    }
    else {
        hex2 = rgb2hex(g == min ? [max2, min2, med2] : [max2, med2, min2]);
    }

    return hex2;
}