// initialization
var margin = {top: 10, right: 10, bottom: 100, left: 60},
width = 960 - margin.left - margin.right,
height = 600 - margin.top - margin.bottom;


const svg = d3.select('.chart-container1')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate('+margin.left+','+margin.top+')')

const xScale = d3.scaleLinear()
    .range([0, width])

const yScale = d3.scaleLinear()
    .rangeRound([height,0])

svg.append('g')
    .attr('class', 'x-axis')
    //.attr("transform", `translate(0, ${height})`)

svg.append('g')
    .attr('class', 'y-axis') 



d3.csv('driving.csv', d3.autoType).then(data=>{
    console.log(data);


    xScale.domain([3500,d3.max(data, d => d.miles)]).nice()

    yScale.domain(d3.extent(data, d => d.gas)).nice()

    const line = d3.line()
        .curve(d3.curveCatmullRom)
        .x(d=> xScale(d.miles))
        .y(d=> yScale(d.gas));

    function position(d) {
        const t = d3.select(this);
        switch (d.side) {
          case "top":
            t.attr("text-anchor", "middle").attr("dy", "-0.7em");
            break;
          case "right":
            t.attr("dx", "0.5em")
              .attr("dy", "0.32em")
                .attr("text-anchor", "start");
            break;
          case "bottom":
            t.attr("text-anchor", "middle").attr("dy", "1.4em");
            break;
          case "left":
            t.attr("dx", "-0.5em")
              .attr("dy", "0.32em")
              .attr("text-anchor", "end");
            break;
        }
      };
    function halo(text) {
        text
            .select(function() {
                return this.parentNode.insertBefore(this.cloneNode(true), this);
            })
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-width", 4)
            .attr("stroke-linejoin", "round");
    };

    const points =svg.append('g')
        .selectAll('circle')
        .data(data)
        .enter()

    points.append('circle')
        .attr('cx',d=>xScale(d.miles))
        .attr('cy',d=>yScale(d.gas))
        .attr('r', 4)
        .attr('fill','none')
        .attr('stroke','black')
        .call(halo);

    const label = points.append('text')
        .text(d=>d.year)
        .attr("transform", d => `translate(${xScale(d.miles)},${yScale(d.gas)})`) 
        .attr('font-size', 9)
        .each(position)
        .call(halo);

    const xAxis = g => g
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).ticks(width / 80))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").clone()
            .attr("y2", -height)
            .attr("stroke-opacity", 0.1))
        .call(g => g.append("text")
            .attr("x", width - 4)
            .attr("y", -4)
            .attr("font-weight", "bold")
            .attr("text-anchor", "end")
            .attr("fill", "black")
            .text("Miles per person per year")
            .call(halo)
            );
    const yAxis = g => g
        .call(d3.axisLeft(yScale).ticks(null, "$.2f"))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").clone()
            .attr("x2", width)
            .attr("stroke-opacity", 0.1))
        .call(g => g.select(".tick:last-of-type text").clone()
            .attr("x", 4)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .attr("fill", "black")
            .text("Cost per gallon")
            .call(halo)
            ); 

    svg.append("g")
        .call(xAxis);
    svg.append("g")
        .call(yAxis);

    let length = line(data).length


    svg.append("path")
        .datum(data)
        .attr("d", line)
        .attr("stroke", "black")
        .attr("stroke-width",2)
        .attr("fill", "none")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-dasharray", `0,${length}`)
        .transition()
        .duration(5000)
        .ease(d3.easeLinear)
        .attr("stroke-dasharray", `${length},${length}`);


})
