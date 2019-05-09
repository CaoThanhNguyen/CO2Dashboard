// 1. get data into JS
// 2. make map
// 3. make pie chart
// 4. make bar chart
// 5. tooltip!

d3.queue()
    .defer(d3.json, 'https://unpkg.com/world-atlas@1.1.4/world/50m.json')
    .defer(d3.csv, './data/all_data.csv', function(row) {
        return {
            country: row.Country,
            countryCode: +row['Country Code'],
            continent: row.Continent,
            region: row.Region,
            year: +row.Year,
            emissionsPerCapita: +row['Emissions Per Capita'],
            emissions: +row.Emissions
        }
    })
    .await((err, mapData, emissionData) => {
        if (err) throw err;

        var width = +d3.select('.graph-container')
                        .node().offsetWidth;
        var height = 300;
        var minMaxYears = d3.extent(emissionData, d => d.year);
        var currentYear = minMaxYears[0];
        
        var geoData = topojson.feature(mapData, mapData.objects.countries).features;

        var countries = [... new Set(geoData.map(d => d.properties.country))];

        var currentDataType = d3.select('input[name="emissionType"]:checked')
                                    .attr('value');
        
        createMap(width, width * 4 / 5);
        drawMap(geoData, emissionData, currentYear, currentDataType);
        createPie(width, height);
        drawPie(emissionData, currentYear);
        createBar(width / 1.5, height);
        drawBar(emissionData, '', currentDataType);

        d3.select('#yearInput')
            .attr('min', minMaxYears[0])
            .attr('max', minMaxYears[1])
            .attr('value', minMaxYears[0])
            .on('input', () => {
                currentYear = +d3.event.target.value;
                drawMap(geoData, emissionData, currentYear, currentDataType);
                drawPie(emissionData, currentYear);
                highlightBar(currentYear);
            })

        d3.selectAll('input[name="emissionType"]')
            .on('click', () => {
                currentDataType = d3.event.target.value;
                var active = d3.select('.active').data()[0];
                var country = active ? active.properties.country: '';
                drawMap(geoData, emissionData, currentYear, currentDataType);
                drawPie(emissionData, currentYear);
                drawBar(emissionData, country, currentDataType);                
                highlightBar(currentYear);
            })

        d3.selectAll('svg')
            .on('mousemove touchmove', updateTooltip)

        function updateTooltip() {
            var tooltip = d3.select('.tooltip');
            var target = d3.select(d3.event.target);
            var isCountry = target.classed('country');
            var isBar = target.classed('bar');
            var isArc = target.classed('arc');
            var dataType = d3.select('input:checked')
                            .property('value');
            var units = (dataType === 'emissions') ? 'thousand metric tons' : 'metric tons per capita';
            var data;
            var percentage = '';
            if (isCountry) data = target.data()[0].properties;
            if (isArc) {
                data = target.data()[0].data;
                percentage = `<p>Percentage of total: ${getPercentage(target.data()[0])}</p>`; 
            }
            if (isBar) data = target.data()[0];
            tooltip
                .style('opacity', +(isCountry || isArc || isBar))
                .style('left', (d3.event.pageX - tooltip.node().offsetWidth / 2) + 'px')
                .style('top', (d3.event.pageY - tooltip.node().offsetHeight - 10) + 'px');
            if (data) {
                var dataValue = data[dataType] ?
                                data[dataType].toLocaleString() + ' ' + units :
                                'Data Not Available';
            tooltip
                .html(`
                    <p>Country: ${data.country}</p>
                    <p>${formatDataType(dataType)}: ${dataValue}</p>
                    <p>Year: ${data.year || d3.select('#year').property('value')}</p>
                    ${percentage}`)
            }
        }
    })

function formatDataType(key) {
    return key[0].toUpperCase() + key.slice(1).replace(/[A-Z]/g, c => " " + c);
}

function getPercentage(d) {
    var angle = d.endAngle = d.startAngle;
    var fraction = 100 * angle / (Math.PI * 2);
    return fraction.toFixed(2) + '%';
}