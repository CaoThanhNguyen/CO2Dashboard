function createBar(width, height) {
    var bar = d3.select('#bar')
                    .attr('transform', `translate(${width/4}, 0)`)
                    .attr('width', width)
                    .attr('height', height)

    bar.append('g')
        .classed('x-axis', true);
    
    bar.append('g')
        .classed('y-axis', true);

    bar.append('text')
        .classed('bar-title', true)
            .attr('x', width / 2)
            .attr('y', '1em')
            .style('font-size', '1.5em')
            .style('text-anchor', 'middle');

    bar.append('text')
        .classed('bar-axis-lable', true)
            .attr('transform', 'rotate(-90)')
            .attr('x', -height / 2)
            .attr('dy', '1.5em')
            .style('font-size', '1em')
            .style('text-anchor', 'middle')
}


function drawBar(data, country, dataType) {
    var bar = d3.select('#bar')
    var width = +bar.attr('width');
    var height = +bar.attr('height');

    var padding = {
        top: 30,
        right: 30,
        bottom: 30,
        left: 100
    }

    var barPadding = 1;

    countryData = data.filter(d => d.country === country)
                        .sort((a, b) => a.year - b.year);

    var xScale = d3.scaleLinear() 
                    .domain(d3.extent(data, d => d.year))
                    .range([padding.left, width - padding.right])

    var yScale = d3.scaleLinear()
                    .domain([0, d3.max(countryData, d => d[dataType])])
                    .range([height - padding.bottom, padding.top])

    var barWidth = xScale(xScale.domain()[0] + 1) - xScale.range()[0];

    var xAxis = d3.axisBottom(xScale)
                    .tickFormat(d3.format('.0f'))
    var yAxis = d3.axisLeft(yScale);

    d3.select('.x-axis')
        .attr('transform', `translate(0, ${height - padding.bottom})`)
        .call(xAxis);
        
    d3.select('.y-axis')
        .attr('transform', `translate(${padding.left - barWidth / 2 - barPadding}, 0)`)
        .call(yAxis);

    var barUpdate = bar.selectAll('.bar')
                        .data(countryData)

    var t = d3.transition()
            .duration(1000)
            .ease(d3.easeBounceOut);

    barUpdate.exit()
            .transition(t)
            .delay((d, i, nodes) => (nodes.length - i - 1) * 100)
            .attr('y', height - padding.bottom)
            .attr('height', 0) 
            .remove();

    barUpdate
            .enter()
            .append('rect')
                .classed('bar', true)
                .attr('y', height - padding.bottom)
                .attr('height', 0)
            .merge(barUpdate)
                .attr('x', (d, i) => (xScale(d.year) + xScale(d.year - 1)) / 2)
                .attr('width', barWidth - barPadding)
                .attr('fill', '#16a085')
            .transition(t)
                .delay((d, i) => i * 100)
                    .attr('y', d => yScale(d[dataType]))
                    .attr('height', d => height - padding.bottom - yScale(d[dataType]))

    var title = (country !== "") 
                ? `CO2 emission, ${country}`
                : 'Click on a country to see annual trend'
    d3.select('.bar-title')
        .text(title)

    var lable = (dataType === 'emissions') 
                ? 'CO2 emissions, metric tons'
                : 'CO2 emissions, metric tons per capita';
    d3.select('.bar-axis-lable')
        .text(lable);
}

function highlightBar(year) {
    d3.selectAll('rect')
        .attr('fill', d => (d.year === year) ? '#0c6654' : '#16a085');
}