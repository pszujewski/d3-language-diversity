/ ======= Reversing the x and y axis =========
/*
const width = 900;
const height = 900;

const xScale = d3.scaleBand()
                 .domain(languages.map(item => item.language))
                 .range([0, width]);

const yScale = d3.scaleLinear()
                 .domain([0, max])
                 .range([height, 0]);  

const canvas = d3.select("div")
                 .append("svg")
                 .attr("width", width)
                 .attr("height", height)
                  .append("g")
                  .attr("transform", "translate(60, 50)");

const bars = canvas.selectAll("rect")
                   .data(languages)
                   .enter()
                   .append("rect")
                    .attr("x", d => xScale(d.language)) 
                    .attr("y", d => yScale(d.percentPop)) 
                    .attr("width", 50)
                    .attr("height", d => height - yScale(d.percentPop)) 
                    .attr("fill", "#293546");
*/