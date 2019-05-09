function createMap(width, height) {
    var map = d3.select('#map')
                    .attr('width', width)
                    .attr('height', height)
    map.append('text')
        .classed('map-title', true)
        .attr('x', width / 2)
        .attr('y', '1.5em')
        .style('font-size', '1.5em')
        .style('text-anchor', 'middle');
    
}

function drawMap(geoData, data, year, dataType) {
    var map = d3.select('#map')
    var tooltip = d3.select('.tooltip')
    geoData.forEach(d => {
        var countries = data.filter(row => row.countryCode === +d.id);
        var name = '';
        if (countries.length > 0) name = countries[0].country;
        d.properties = countries.find(c => c.year === year) || { country: name };
      });

    var projection = d3.geoMercator()
                        .scale(110)
                        .translate([+map.attr('width')/2, 
                                    +map.attr('height')/1.4])

    var path = d3.geoPath()
                    .projection(projection);

    var colors = ["#f1c40f", "#e67e22", "#e74c3c", "#c0392b"];

    var domains = {
      emissions: [0, 2.5e5, 1e6, 5e6],
      emissionsPerCapita: [0, 0.5, 2, 10]
    };

    var scaleColor = d3.scaleLinear()
                    .domain(domains[dataType]) 
                    .range(colors)

    var mapUpdate = map.selectAll('.country')
                        .data(geoData);

    mapUpdate.exit().remove();

    mapUpdate
        .enter()
        .append('path')
            .classed('country', true)
            .attr('d', path)
            .on('click', function() {
                var country = d3.select(this);
                var isActive = country.classed('active');
                var countryName = isActive ? '' : country.data()[0].properties.country;
                var dataType = d3.select('input[name="emissionType"]:checked')
                                    .attr('value');
                drawBar(data, countryName, dataType);
                highlightBar(+d3.select('#yearInput').property('value'));
                d3.selectAll('.country').classed('active', false);
                country.classed('active', !isActive);
            })
        .merge(mapUpdate)
            .transition()
            .duration(750)
            .attr('fill', d => {
                var value = d.properties[dataType];
                return value ? scaleColor(value) : '#ccc';
            })
    
    var title = (dataType === 'emissions') 
                ? `Carbon Dioxide Emissions in Total, ${year}`
                : `Carbon Dioxide Emissions Per Capita, ${year}`
    d3.select('.map-title')
            .text(title);

}