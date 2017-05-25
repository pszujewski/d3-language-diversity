$(function() {
      $( "#tabs" ).tabs();
});

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

// ============= Bar chart 1 ================

function doHorizontalBarChart(root) {

  d3.select(root).append("p").attr("class", "section-header")
    .text("Languages spoken in the U.S. other than English (expressed as % of the total population)");

  const width = 700;
  const height = 400;
  padding = 30;

  const xScale = d3.scaleLinear()
    .domain([0, max + 3])
    .range([0, width]);

  const yScale = d3.scaleBand()
    .domain(languages.map(item => item.language))
    .range([0, height-75]);               

  const canvas = d3.select(root)
    .append("svg")
    .attr("class", "canvas")
    .attr("width", width + padding)
    .attr("height", height)
    .attr("padding", padding)
      .append("g")
      .attr("class", "bars-group")
      .attr("transform", "translate(61, 20)");

  const bars = canvas.selectAll("rect")
    .data(languages)
    .enter()
    .append("rect")
    .attr("fill", "#3e4958")
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
    .attr("transform", "translate(-6, 0)") 
    .call(d3.axisLeft(yScale));

}

// ======= Reverse the bar chart ============= //

function doVerticalBarChart(root) {

  d3.select(root).append("p").attr("class", "section-header")
    .text("Languages spoken in the U.S. other than English (expressed as % of the total population)");

  const revWidth = 700;
  const revHeight = 350;
  const revPadding = 50;

  const revXScale = d3.scaleBand()
                  .domain(languages.map(item => item.language))
                  .range([0, revWidth]);

  const revYScale = d3.scaleLinear()
                  .domain([0, max +3])
                  .range([revHeight, 0]);  

  const revCanvas = d3.select(root)
                  .append("svg")
                  .attr("class", "canvas")
                  .attr("width", revWidth)
                  .attr("height", revHeight + revPadding)
                    .append("g")
                    

  const revBars = revCanvas.selectAll("rect")
    .data(languages)
    .enter()
      .append("rect")
      .attr("width", 50)
      .attr("fill", "#3e4958")
      .attr("x", d => {
        return revXScale(d.language) + 53;
      }) 
      .transition()
      .delay(500)
      .duration(800)
      .attr("y", d => {
        return revYScale(d.percentPop);
      }) 
      .attr("height", d => revHeight - revYScale(d.percentPop)); 

  revCanvas.selectAll(".revText")
      .data(languages)
      .enter()
        .append("text")
          .attr("class","revLabel")
          .attr("x", d => revXScale(d.language) + 58)
          .attr("y", d => revYScale(d.percentPop) - 15)
          .text(d => d.percentPop + "%" );  

  revCanvas.append("g")
      .attr("class", "revAxis --revAxis-x")
      .attr("padding", 10)
      .attr("transform", "translate(20, " + String(revHeight+10) + ")")
      .call(d3.axisBottom(revXScale)); 

    revCanvas.append("g")
      .attr("class", "revAxis --revAxis-y")
      .attr("transform", "translate(30, 0)") 
      .call(d3.axisLeft(revYScale).tickFormat(d => d + "%"));

}

// ======= Pie chart =======

console.log(data);

function getPieData(data, languagesSpread) {

  // Loop over data.allLanguages and save spanish specifically
  // All other languages should have their percentages added to an aggregator
  // Then save data.englishOnly[0].percentPop specifically
 
  const tonesColors = [
    "#81aaca",
    "#b7cee1",
    "#FBD8B6",
    "#a3d9d3",
    "#d6eeeb",
    "#EC8892",
    "#F6CCD0",
    "#F5A454",
    "#ffe0ab"
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

function doPieChart(data, root, languagesSpread=false) {

let label;
if (!languagesSpread) {
  label = "Total U.S. population according to primary language spoken at home";
}
else {
  label = "Languages spoken in the U.S. other than English and Spanish (expressed as % of the total population)";
}

  d3.select(root).append("div")
    .attr("class", "pie-label-container")
    .append("p")
      .attr("class", "pie-section-header")
      .text(label);

  d3.select(".pie-label-container").append("p")
    .attr("class", "pie-click-prompt")
    .text("Click on the pie chart below to get new data");

  const { pieData, total } = getPieData(data, languagesSpread)

  const r = 250;
  const innerRadiusEval = languagesSpread ? r - 150 : 0;
  // The perimeter in number of radians 
  const perimeter = Math.PI * 2;

  const pieContainer = d3.select(root)
    .append("svg")
    .attr("class", "pieContainer")
    .attr("width", 700)
    .attr("height", 550)
    .attr("display", "block")
    
  const pieGroup = pieContainer.append("g")
    .attr("class", "pieGroup")
    .attr("transform", "translate(350, 270)");

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
      .attr("class", "arc")

  arcs.append("path")
    .attr("d", arc)
    .attr("fill", d => d.data.color);

  arcs.append("text")
    .attr("class", "arc-label")
    .attr("transform", d => "translate("+arc.centroid(d)+")")
    .attr("text-anchor", "middle")
    .text(d => d.data.language+" ("+d.data.percent+"%)");

  arcs.on("click", () => {
    d3.selectAll(".pie-label-container").remove();
    d3.selectAll(".pieContainer").remove();
    doPieChart(data, root, !languagesSpread);
  });

}

function loadMap(root) {

  const width = 960;
  const height = 600;

  // const width = 420;
  // const height = 400;

  // const projection = d3.geoAlbersUsa()
  //   .scale(170)
  //   .translate([width/2, height/2]);

  const svg = d3.select(root).append("svg")
    .attr("width", width)
    .attr("height", height);

  const path = d3.geoPath();

  d3.json("https://d3js.org/us-10m.v1.json", function(error, us) {
    
    if (error) throw error;

    console.log(us);

    svg.append("g")
      .attr("class", "states")
      .selectAll("path")
      .data(topojson.feature(us, us.objects.states).features)
      .enter()
      .append("path")
        .attr("d", path);

    svg.append("path")
        .attr("class", "state-borders")
        .attr("d", path(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; })));

  });    

}

$(function(e) {

  doHorizontalBarChart(".section-1-root");
  doVerticalBarChart(".section-2-root");
  doPieChart(data, ".section-3-root");
  loadMap(".section-5-root");

});

}); // End of promise



