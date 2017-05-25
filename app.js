// Define helper functions for common tasks

function getD3Canvas(root, type, width, height) {
  // extra vertical padding needed for vertical bar chart 
  height = type === "horizontal" ? height : height + 50;
  const canvas = d3.select(root)
    .append("svg")
    .attr("class", "canvas")
    .attr("width", width)
    .attr("height", height)
    .append("g");
  if (type === "horizontal") {
    canvas.attr("class", "bars-group").attr("transform", "translate(61, 20)");
  }
  return canvas;
}

function getlinearScale(domain, range) {
  return d3.scaleLinear().domain(domain).range(range);
}

function getBandScale(domain, range) {
  return d3.scaleBand().domain(domain).range(range); 
}

function makeHorizontalBars(canvas, data, xScale, xValue, yScale, yValue) {
  return canvas.selectAll("rect")
    .data(data).enter()
      .append("rect")
      .attr("fill", "#3e4958")
      .transition().delay(500).duration(800)
        .attr("width", d => xScale(d[xValue]))
        .attr("height", 50)
        .attr("y", d => yScale(d[yValue]));
}

function makeVerticalBars(canvas, data, height, xScale, xValue, yScale, yValue) {
  return canvas.selectAll("rect")
    .data(data).enter()
      .append("rect")
      .attr("fill", "#3e4958")
      .transition().delay(500).duration(800)
        .attr("width", 50)
        .attr("x", d => xScale(d[xValue]) + 53) 
        .attr("y", d => yScale(d[yValue])) 
        .attr("height", d => height - yScale(d[yValue])); 
}

// Define functions for displaying D3 charts

function makeCanvasGetAxis(root, type, data, width, height) {

  let xScale;
  let xValue;
  let yScale;
  let yValue

  if (type === "horizontal") { 
    xScale = getlinearScale([0, max+3], [0, width]);
    xValue = "percentPop";
    yScale = getBandScale(languages.map(item => item.language), [0, height-75]);
    yValue = "language";
  } else {
    xScale = getBandScale(languages.map(item => item.language), [0, width]);
    xValue = "language";
    yScale = getlinearScale([0, max+3], [height, 0]);
    yValue = "percentPop";
  }

  const canvas = getD3Canvas(root, type, width, height); 

  let bars;
  if (type === "horizontal") {
    bars = makeHorizontalBars(canvas, data, xScale, xValue, yScale, yValue);
  } else {
    bars = makeVerticalBars(canvas, data, height, xScale, xValue, yScale, yValue);
  }

  return { canvas, xScale, xValue, yScale, yValue };
}

function doHorizontalBarChart(root, type, data, width, height) {

  const { canvas, xScale, xValue, yScale, yValue } = makeCanvasGetAxis(root, type, data, width, height);

  canvas.selectAll(".text")
    .data(data).enter()
      .append("text")
      .transition().delay(1300).duration(0)
        .attr("class","label")
        .attr("x", d => xScale(d[xValue]) + 5)
        .attr("y", d => yScale(d[yValue]) + 32)
        .text(d => d[xValue] + "%" );  
  
  canvas.append("g")
    .attr("class", "axis --axis-x")
    .attr("transform", "translate(0,"+String(height-70)+")")
    .call(d3.axisBottom(xScale).tickFormat(d => d + "%"));                   

  canvas.append("g")
    .attr("class", "axis --axis-y")
    .attr("transform", "translate(-6, 0)") 
    .call(d3.axisLeft(yScale));

}

// ================================ OLD ================================
// ================================ OLD ================================
// ================================ OLD ================================
// ================================ OLD ================================

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

  // d3.select(root).append("p").attr("class", "section-header")
  //   .text("Languages spoken in the U.S. other than English (expressed as % of the total population)");

  const width = 700;
  const height = 400;
  const padding = 30;

  const xScale = d3.scaleLinear()
    .domain([0, max + 3])
    .range([0, width]);

  const yScale = d3.scaleBand()
    .domain(languages.map(item => item.language))
    .range([0, height-75]);               

  const canvas = d3.select(root)
    .append("svg")
    .attr("class", "canvas")
    .attr("width", width)
    .attr("height", height)
    //.attr("padding", padding)
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

  const highColor = "#d73d32";
  const lowColor = "#f7d8d6";

  // D3 Projection
  const projection = d3.geoAlbersUsa()
  .translate([width / 2, height / 2]) // translate to center of screen
  .scale([1000]); // scale things down so see entire US

// Define path generator
  const path = d3.geoPath() // path generator that will convert GeoJSON to SVG paths
    .projection(projection); // tell path generator to use albersUsa projection

  const svg = d3.select(root).append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("transform", "translate(60, 0)");

  d3.csv("./states-data.csv", function(error, data) {
    // Get the data on the states
    console.log(data);
    let dataArray = [];
    for (let d = 0; d < data.length; d++) {
      dataArray.push(parseFloat(data[d].percentPopNonEng));
    }
    const max = d3.max(dataArray);
    const min = d3.min(dataArray);

    const colorScale = d3.scaleLinear()
      .domain([min,max])
      .range([lowColor, highColor]);
    
    // Load GeoJSON data and merge with states data
    d3.json("./us-states.json", function(error, json) {
      
      if (error) throw error;

      for (let i=0; i<data.length; i++) {
        // Grab State Name and data value (percentPop)
        const dataState = data[i].state;
        const dataPercentage = data[i].percentPopNonEng;

        // Find the corresponding state inside the GeoJSON
        for (let j = 0; j < json.features.length; j++) {
          const jsonState = json.features[j].properties.name;

          if (dataState == jsonState) {
            // Copy the data value into the JSON
            json.features[j].properties.percentPopNonEng = dataPercentage;
            // Stop looking through the JSON
            break;
          }
        }
      }

      svg.selectAll("path")
        .data(json.features)
        .enter()
        .append("path")
          .attr("d", path)
          .attr("stroke", "#fff")
          .attr("stroke-width", "1")
          .attr("fill", function(d) { return colorScale(d.properties.percentPopNonEng) });

      // add a legend
		  const w = 140
      const h = 300;

      const key = d3.select(root)
        .append("svg")
        .attr("width", w)
        .attr("height", h)
        .attr("class", "legend");

      legend = key.append("defs")
			.append("svg:linearGradient")
			.attr("id", "gradient")
			.attr("x1", "100%")
			.attr("y1", "0%")
			.attr("x2", "100%")
			.attr("y2", "100%")
			.attr("spreadMethod", "pad");

		legend.append("stop")
			.attr("offset", "0%")
			.attr("stop-color", highColor)
			.attr("stop-opacity", 1);
			
		legend.append("stop")
			.attr("offset", "100%")
			.attr("stop-color", lowColor)
			.attr("stop-opacity", 1);

		key.append("rect")
			.attr("width", w - 100)
			.attr("height", h)
			.style("fill", "url(#gradient)")
			.attr("transform", "translate(0,10)");

		const y = d3.scaleLinear()
      .domain([min, max])
			.range([h, 0]);

		const yAxis = d3.axisRight(y).tickFormat(d => d + "%");

		key.append("g")
			.attr("class", "y axis")
			.attr("transform", "translate(41,10)")
			.call(yAxis)

    });   

  });

}

$(function(e) {

  doHorizontalBarChart(".section-1-root");
  doVerticalBarChart(".section-2-root");
  doPieChart(data, ".section-3-root");
  loadMap(".section-5-root");

});

}); // End of promise



