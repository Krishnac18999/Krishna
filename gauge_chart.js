
function main() {

     // --------------------------------------------------
        // The dataset fields
        // --------------------------------------------------
        const countriyFields =
            ['expectancy', 'mortality'];

        // --------------------------------------------------
        // Load the data
        // --------------------------------------------------
        d3.csv('../life_data.csv')
            .then(
                function (data) {
                    const lifeMap = {};

                    data.forEach(
                        function (d) {
                            const country = d.country;
                            lifeMap[country] = [];

                            countriyFields.forEach(
                                function (field) {
                                    lifeMap[country].push(+d[field]);
                                });
                        });
                    console.log(lifeMap)
                    makeVis(lifeMap);
                })

        function makeVis(lifeMap) {
            // Define dimensions of vis
            const margin = { top: 30, right: 50, bottom: 30, left: 50 },
                width = 550,
                height = 250,
                graphWidth = width - margin.left - margin.right,
                graphHeight = height - margin.top - margin.bottom;

            // --------------------------------------------------
            // Handler for dropdown value change
            // --------------------------------------------------
            function dropdownChange() {
                // From the selection option, find the selected value
                const newCereal =
                    d3.select(this)
                        .property('value');

                // Get the data associated with the option value
                const newData = lifeMap[newCereal];
                lifeExpectency.update(newData[0]);
                averageAdultMortality.update(newData[1])
            }

            // --------------------------------------------------
            // Get names of countries, for dropdown
            // --------------------------------------------------
            const countries = Object.keys(lifeMap).sort();

            // --------------------------------------------------
            // Build the drop-down selection
            // --------------------------------------------------
            const dropdown =
                d3.select('#vis-container')
                    .insert('select', 'svg')
                    .on('change', dropdownChange);

            // --------------------------------------------------
            // Use the country names and values to create
            // the drop-down selection values.
            // --------------------------------------------------
            dropdown
                .selectAll('option')
                .data(countries)
                .enter().append('option')
                .attr('value', function (d) { return d; })
                .text(
                    function (d) {
                        return d[0].toUpperCase() + d.slice(1, d.length).replace(/[_]/g, ' '); // capitalize 1st letter
                    });

            // --------------------------------------------------
            // Set the initial data and visualise
            // --------------------------------------------------
            const initialData = lifeMap[countries[0]];
            console.log(initialData)
            let lifeExpectency = new Gauge({
                size: 200,
                chartText: "Life Expectency",
                arcColorFn: function (value) {
                    let ticks = [{
                        tick: 0,
                        color: 'red'
                    }, {
                        tick: 60,
                        color: 'yellow'
                    }, {
                        tick: 75,
                        color: 'green'
                    }]
                    let ret;
                    ticks.forEach(function (tick) {
                        console.log(value)
                        if (value > tick.tick) {
                            ret = tick.color
                            return
                        }
                    });
                    return ret;
                }
            });
            let averageAdultMortality = new Gauge({
                size: 200,
                maxValue: 1000,
                chartText: "Average Adult Mortality"
            });
            lifeExpectency.update(initialData[0]);
            averageAdultMortality.update(initialData[1])
        };

        // --------------------------------------------------
        //mouseover event handler function
        // --------------------------------------------------
        function onMouseOver() {
            d3.select(this).classed('highlight', true);
        }

        // --------------------------------------------------
        //mouseout event handler function
        // --------------------------------------------------
        function onMouseOut() {
            // use the text label class to remove label on mouseout
            d3.select(this).classed('highlight', false);
        }


        let Gauge = function (configuration) {
            let that = {}

            let config = {
                size: 300,
                arcInset: 150,
                arcWidth: 60,

                pointerWidth: 8,
                pointerOffset: 0,
                pointerHeadLengthPercent: 0.9,

                minValue: 0,
                maxValue: 100,

                minAngle: -90,
                maxAngle: 90,

                transitionMs: 750,

                currentLabelFontSize: 20,
                currentLabelInset: 20,
                labelFont: "Helvetica",
                labelFontSize: 15,
                chartText: "Average Adult Mortality",
                formatText: function( value){
                    if(config.chartText == 'Life Expectency'){
                       if( value <= 60){
                        return 'Poor';
                       }
                       if( value < 75){
                        return 'Fair';
                       }
                       if( value >= 75){
                        return 'Great';
                       }
                    }
                    return value;
                },
                arcColorFn: function (value) {
                    let ticks = [{
                        tick: 0,
                        color: 'green'
                    }, {
                        tick: 250,
                        color: 'yellow'
                    }, {
                        tick: 500,
                        color: 'orange'
                    }, {
                        tick: 750,
                        color: 'red'
                    }]
                    let ret;
                    ticks.forEach(function (tick) {
                        console.log(value)
                        if (value > tick.tick) {
                            ret = tick.color
                            return
                        }
                    });
                    return ret;
                }
            }

            function configure(configuration) {
                for (let prop in configuration) {
                    config[prop] = configuration[prop]
                }
            }
            configure(configuration);

            let foreground, arc, svg, current;
            let cur_color;
            let new_color, hold;

            var oR = config.size - config.arcInset;
            var iR = config.size - oR - config.arcWidth;

            function deg2rad(deg) {
                return deg * Math.PI / 180
            }

            function render(value) {
                // Arc Defaults
                arc = d3.arc()
                    .innerRadius(iR)
                    .outerRadius(oR)
                    .startAngle(deg2rad(-90))

                // Place svg element
                d3.select("#vis-container")
                    .append("h3")
                    .attr("width", config.size)
                    .attr("height", config.size)
                    .append("text")
                    .attr("class", "toc_title")
                    .text(config.chartText)

                svg = d3.select("#vis-container")
                    .append("svg")
                    .attr("width", config.size)
                    .attr("height", config.size)
                    .append("g")
                    .attr("transform", "translate(" + config.size / 2 + "," + config.size / 2 + ")")

                // Append background arc to svg
                var background = svg.append("path")
                    .datum({
                        endAngle: deg2rad(90)
                    })
                    .attr("class", "gaugeBackground")
                    .attr("d", arc)

                // Append foreground arc to svg
                foreground = svg.append("path")
                    .datum({
                        endAngle: deg2rad(-90)
                    })
                    //.style("fill", cur_color)
                    .attr("d", arc);

                // Display Max value
                var max = svg.append("text")
                    .attr("transform", "translate(" + (iR + ((oR - iR) / 2)) + ",15)") // Set between inner and outer Radius
                    .attr("text-anchor", "middle")
                    .style("font-family", config.labelFont)
                    .text(config.maxValue)

                // Display Min value
                var min = svg.append("text")
                    .attr("transform", "translate(" + -(iR + ((oR - iR) / 2)) + ",15)") // Set between inner and outer Radius
                    .attr("text-anchor", "middle")
                    .style("font-size", config.labelFontSize)
                    .style("font-family", config.labelFont)
                    .text(config.minValue)

                // Display Current value  
                current = svg.append("text")
                    .attr("transform", "translate(0," + -(-config.currentLabelInset + iR / 4) + ")") // Push up from center 1/4 of innerRadius
                    .attr("text-anchor", "middle")
                    .style("font-size", config.currentLabelFontSize)
                    .style("font-family", config.labelFont)
                    .text(current)


            }


            function update(value) {
                // Get new color
                new_color = config.arcColorFn(value)
                console.log(new_color)

                var numPi = deg2rad(Math.floor(value * 180 / config.maxValue - 90));

                // Display Current value
                current.transition()
                    .text(value)
                 .text(config.formatText(value))

                // Arc Transition
                foreground.transition()
                    .duration(config.transitionMs)
                    .styleTween("fill", function () {
                        return d3.interpolate(new_color, cur_color);
                    })
                    .call(arcTween, numPi);

                // Set colors for next transition
                hold = cur_color;
                cur_color = new_color;
                new_color = hold;
            }

            // Update animation
            function arcTween(transition, newAngle) {
                transition.attrTween("d", function (d) {
                    var interpolate = d3.interpolate(d.endAngle, newAngle);
                    return function (t) {
                        d.endAngle = interpolate(t);
                        return arc(d);
                    };
                });
            }

            render();
            that.update = update;
            that.configuration = config;
            return that;

        }


}



window.addEventListener(
    'load',
    main
);

