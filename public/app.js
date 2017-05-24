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

  const xScale = d3.scaleLinear()
    .domain([0, max + 3])
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
    .attr("fill", "#293546")
    .transition()
    .delay(500)
    .duration(800)
      .attr("width", d => xScale(d.percentPop))
      .attr("height", 50)
      .attr("y", d => yScale(d.language));

  canvas.selectAll(".text")
    .data(languages)
    .enter()
      .append("text")
      .transition()
      .delay(1300)
      .duration(0)
        .attr("class","label")
        .attr("x", d => xScale(d.percentPop) + 5)
        .attr("y", d => yScale(d.language) + 32)
        .text(d => d.percentPop + "%" );  
  
  canvas.append("g")
    .attr("class", "axis --axis-x")
    .attr("transform", "translate(0,"+String(height-70)+")")
    .call(d3.axisBottom(xScale).tickFormat(d => d + "%"));                   

  canvas.append("g")
    .attr("class", "axis --axis-y")
    .attr("transform", "translate(-5, 0)") 
    .call(d3.axisLeft(yScale));

// ======= Pie chart =======

console.log(data);

function getPieData(data, languagesSpread) {

  // Loop over data.allLanguages and save spanish specifically
  // All other languages should have their percentages added to an aggregator
  // Then save data.englishOnly[0].percentPop specifically
  const tonesColors = [
    "#293546",
    "#535d6a",
    "#949aa2",
    "#088da5",
    "#990703",
    "#75637e",
    "#008080",
    "#689084",
    "#088da5"
  ]; 
 
  const grp = data.allLanguages;

  let pieData = []; 
  let total = 0;

  for (let i=0; i<grp.length; i++) {
    if (grp[i].language === "Spanish" || languagesSpread) {
      if (grp[i].language === "Spanish" && !languagesSpread) {
        pieData.push({ language: grp[i].language, percent: grp[i].percentPop, color: tonesColors[i] });
        break;
      }
      if (languagesSpread && grp[i].language !== "Spanish") {
        total += grp[i].percentPop;
        pieData.push({ language: grp[i].language, percent: grp[i].percentPop, color: tonesColors[i] });
      }
    }
  }
  if (!languagesSpread) {
    const totalOther = 100 - (data.englishOnly[0].percentPop + pieData[0].percent);
    pieData.push({ language: "Other", percent: Number(totalOther.toFixed(1)), color: tonesColors[1] });
    pieData.push({ language: "English", percent: data.englishOnly[0].percentPop, color: tonesColors[2] });
  }

  return { pieData, total };
}

function doPieChart(data, languagesSpread=false) {

  const { pieData, total } = getPieData(data, languagesSpread)

  const r = 250;
  const innerRadiusEval = languagesSpread ? r - 150 : 0;
  // The perimeter in number of radians 
  const perimeter = Math.PI * 2;

  const pieContainer = d3.select('div')
    .append("svg")
    .attr("class", "pieContainer")
    .attr("width", 800)
    .attr("height", 800)
    
  const pieGroup = pieContainer.append("g")
    .attr("class", "pieGroup")
    .attr("transform", "translate(400, 400)");

  const arc = d3.arc()
    .innerRadius(innerRadiusEval)
    .outerRadius(r)

  // the pie layout will supply the start angle and the end angle
  const pie = d3.pie()
      .sort(null)
      .value(function(d) {
        if (languagesSpread) {
          const percentEval = d.percent / total;
          return percentEval.toFixed(1); 
        } else {
          console.log(d);
          return d.percent;
        }
      });

  const arcs = pieGroup.selectAll(".arc")
    .data(pie(pieData))
    .enter()
      .append("g")
      .attr("class", "arc");

  arcs.append("path")
    .attr("d", arc)
    .attr("fill", d => d.data.color);

  arcs.append("text")
    .attr("class", "arc-label")
    .attr("transform", d => "translate("+arc.centroid(d)+")")
    .attr("text-anchor", "middle")
    .text(d => d.data.language+" ("+d.data.percent+"%)");

  // arcs.append("text")
  //   //.attr("transform", d => "translate("+arc.centroid(d)+20+")")
  //   .attr("text-anchor", "middle")
  //   .text(d => d.data.percent.toFixed(1)+"%");

  arcs.on("click", () => {
    d3.selectAll(".pieContainer").remove();
    doPieChart(data, !languagesSpread);
    console.log("click", this);
  });

}

doPieChart(data);

}); // End of promise






