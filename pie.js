function createPie(width, height) {
    var pie = d3.select('#pie')
                    .attr('width', width)
                    .attr('height', height)
    pie.append('g')
        .attr('transform', `translate(${width / 2}, ${height / 2})`)
        .classed('arcs', true)

    pie.append('text')
        .classed('pie-title', true)
        .attr('x', width / 2)
        .attr('y', '1.5em')
        .style('font-size', '1.5em')
        .style('text-anchor', 'middle')
    
}

function drawPie(data, year) {
    var pie = d3.select('#pie');

    var yearData = data.filter(d => d.year === year);

    var continents = [... new Set(yearData.map(d => d.continent))];
    var colorScale = d3.scaleOrdinal()
                        .domain(continents)
                        .range(["#ab47bc", "#7e57c2", "#26a69a", "#42a5f5", "#78909c"]);

    var arcs = d3.pie()
                .value(d => d.emissions)
                .sort((a, b) => {
                    if (a.continent < b.continent) return -1;
                    if (a.continent > b.continent) return 1;
                    return a.emissions - b.emissions;
                })(yearData);

    var path = d3.arc()
                .outerRadius(+pie.attr('height') / 2 - 50)
                .innerRadius(0);
            
    var pieUpdate = d3.select('.arcs')
                        .selectAll('.arc')
                        .data(arcs);

    pieUpdate.exit().remove();
    
    pieUpdate
            .enter()
            .append('path')
                .classed('arc', true)
                    .attr('stroke', 'white')
                    .attr('stroke-width', '0.25px')
            .merge(pieUpdate)
                .attr('fill', d => colorScale(d.data.continent))
                .attr('d', path)

    d3.select('.pie-title')
        .text(`Total Emissions By Continents and Regions, ${year}`)
}