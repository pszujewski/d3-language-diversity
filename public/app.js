let getData = () => new Promise((resolve, reject) => {
  let dataset = { allLanguages:[] };
  return d3.csv("./language-data.csv", function(error, data) {
    data.forEach(function(d) { 
      const percent = Number(d.percentPop);
      if (d.origin === "null") {
        dataset[d.language] = {
          totalSpeakers: d.totalSpeakers,
          percentPop: percent,
          languages: {}
        };
      }
      else {
        const newLanguage = {
          language: d.language, 
          totalSpeakers: d.totalSpeakers,
          percentPop: percent,
        };
        if (!dataset.hasOwnProperty(d.origin)) {
          dataset[d.origin] = [];
        }
        dataset[d.origin].push(newLanguage);
        if (d.language !== "english" && percent > 0.3) {
          dataset.allLanguages.push(newLanguage);
        }
      }
    });
    return resolve(dataset);
  });
});

getData().then(data => {

  d3.select("div").append("h4").text("What percentage of the total U.S. population speaks a language at home other than English?");

  let languages = [];

  for (let i=0; i<data.allLanguages.length; i++) {
    if (data.allLanguages[i].language !== "German" &&
        data.allLanguages[i].language !== "Vietnamese" &&
        data.allLanguages[i].language !== "Korean") {
          languages.push(data.allLanguages[i]);
    }
  }

  console.log(languages);

  let min;
  let max;
  for (let i=0; i<languages.length; i++) {
    if (typeof min === "undefined" || languages[i].percentPop < min) {
      min = languages[i].percentPop;
    }
    if (typeof max === "undefined" || languages[i].percentPop > max) {
      max = languages[i].percentPop;
    }
  }

  const width = 800;
  const height = 400;

  const widthScale = d3.scaleLinear()
                       .domain([0, max + 2])
                       .range([0, width]);

  const yScale = d3.scaleBand()
                    .domain(languages.map(item => item.language))
                    .range([0, height-75]);               

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
                      .attr("width", d => widthScale(d.percentPop))
                      .attr("height", 50)
                      .attr("y", d => yScale(d.language))
                      .attr("fill", "#293546");
  
  // const formatAsPercentage = d3.format(".1%");  
  // .tickFormat(formatAsPercentage)               

  canvas.append("g")
        .attr("class", "axis --axis-x")
        .attr("transform", "translate(0,"+String(height-70)+")")
        .call(d3.axisBottom(widthScale));                   

  canvas.append("g")
        .attr("class", "axis --axis-y")
        .attr("transform", "translate(-5, 0)") 
        .call(d3.axisLeft(yScale));

});






