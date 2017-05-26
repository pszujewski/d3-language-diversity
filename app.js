// General helper function
function getMaxMin(dataArray, field) {
  const resultArr = dataArray.map(item => parseFloat(item[field])); 
  const max = d3.max(resultArr);
  const min = d3.min(resultArr);
  return { resultArr, max, min };
}

// Define functions for displaying D3 charts
// ================================ Bar Charts ================================
function makeBarCharts(rootOne, rootTwo, data) {
  const { max, min } = getMaxMin(data, "percentPop");
  const horizontalChartDimensions = { width: 700, height: 400 }; // Define constants to pass to chart maker functions
  const verticalChartDimensions = { width: 700, height: 350, padding: 50 };

  doHorizontalBarChart(rootOne, data, max, min, horizontalChartDimensions); // create the charts
  doVerticalBarChart(rootTwo, data, max, min, verticalChartDimensions);
}

function doHorizontalBarChart(root, data, max, min, horizontalChartDimensions) {

  const { width, height } = horizontalChartDimensions;
  const xScale = d3.scaleLinear().domain([0, max + 3]).range([0, width]);
  const yScale = d3.scaleBand().domain(data.map(item => item.language)).range([0, height-75]); 

  const canvas = d3.select(root).append("svg").attr("class", "canvas")
    .attr("width", width).attr("height", height)
      .append("g").attr("class", "bars-group").attr("transform", "translate(61, 20)"); // shift the canvas to the right

  const bars = canvas.selectAll("rect")
    .data(data).enter().append("rect").attr("fill", "#3e4958")
    .transition().delay(500).duration(800)
      .attr("width", d => xScale(d.percentPop))
      .attr("height", 50).attr("y", d => yScale(d.language));

  canvas.selectAll(".text")
    .data(data).enter().append("text")
      .transition().delay(1300).duration(0)
        .attr("class","label").attr("x", d => xScale(d.percentPop) + 5)
        .attr("y", d => yScale(d.language) + 32).text(d => d.percentPop + "%" );  
  
  canvas.append("g").attr("class", "axis --axis-x").attr("transform", "translate(0,"+String(height-70)+")")
    .call(d3.axisBottom(xScale).tickFormat(d => d + "%"));                   

  canvas.append("g").attr("class", "axis --axis-y")
    .attr("transform", "translate(-6, 0)").call(d3.axisLeft(yScale));
} // end of function

function doVerticalBarChart(root, data, max, min, verticalChartDimensions) {

  const { width, height, padding } = verticalChartDimensions;
  const xScale = d3.scaleBand().domain(data.map(item => item.language)).range([0, width]);
  const yScale = d3.scaleLinear().domain([0, max+3]).range([height, 0]);  

  const canvas = d3.select(root).append("svg").attr("class", "canvas")
    .attr("width", width).attr("height", height + padding).append("g")

  const bars = canvas.selectAll("rect").data(data).enter()
    .append("rect").attr("width", 50).attr("fill", "#3e4958")
      .attr("x", d => xScale(d.language) + 53).attr("y", d => yScale(d.percentPop)) 
      .attr("height", d => height - yScale(d.percentPop)); 

  canvas.selectAll(".text").data(data).enter()
      .append("text").attr("class","revLabel")
        .attr("x", d => xScale(d.language) + 58).attr("y", d => yScale(d.percentPop) - 15)
        .text(d => d.percentPop + "%" );  
  
  canvas.append("g").attr("class", "axis --axis-x").attr("padding", 10)
      .attr("transform", "translate(20, " + String(height+10) + ")").call(d3.axisBottom(xScale)); 

  canvas.append("g").attr("class", "axis --axis-y").attr("transform", "translate(30, 0)") 
    .call(d3.axisLeft(yScale).tickFormat(d => d + "%"));
} // end of function

// ================================ Pie Charts ================================

// Helper function for getting pie chart data based on type of pie chart; there are 2
function getPieData(data, languagesSpread) {
  const tonesColors = ["#81aaca","#b7cee1","#FBD8B6","#a3d9d3","#d6eeeb","#EC8892","#F6CCD0","#F5A454","#ffe0ab"];
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
} // end of function

// function for creating pie chart, last arg tracks the type of pie chart to render
function doPieChart(data, root, languagesSpread=false) {

  let label; // assign header label for chart based on pie chart type
  if (!languagesSpread) {label = "Total U.S. population according to primary language spoken at home";}
  else {label = "Languages spoken in the U.S. other than English and Spanish (expressed as % of the total population)";}

  const r = 250;
  const innerRadiusEval = languagesSpread ? r - 150 : 0; // makes one chart a full pie, and the other a 'donut' chart
  const perimeter = Math.PI * 2; // The perimeter in number of radians 

  const { pieData, total } = getPieData(data, languagesSpread); // get data from helper function based on chart type
  
  d3.select(root).append("div").attr("class", "pie-label-container").append("p").attr("class", "pie-section-header").text(label);
  d3.select(".pie-label-container").append("p").attr("class", "pie-click-prompt").text("Click on the pie chart below to get new data");

  const pieCanvas = d3.select(root).append("svg").attr("class", "pieCanvas").attr("width", 700).attr("height", 550);
  const pieGroup = pieCanvas.append("g").attr("class", "pieGroup").attr("transform", "translate(350, 270)");
  const arc = d3.arc().innerRadius(innerRadiusEval).outerRadius(r);

  const pie = d3.pie().sort(null).value(function(d) {
    if (languagesSpread) { // D3's pie layout supplis arcs' start angle and end angle
      const percentEval = d.percent / total;
      return percentEval.toFixed(1); 
    } else { return d.percent; } });

  const arcs = pieGroup.selectAll(".arc").data(pie(pieData)).enter().append("g").attr("class", "arc");
  // pie chart is made up of svg path elements; D3's pie() converts the paths into a full pie
  arcs.append("path").attr("d", arc).attr("fill", d => d.data.color); // each arc (aka pie slice) is differentiated by color
  arcs.append("text").attr("class", "arc-label").attr("transform", d => "translate("+arc.centroid(d)+")") // center the labels in the arc
    .attr("text-anchor", "middle").text(d => d.data.language+" ("+d.data.percent+"%)");

  arcs.on("click", () => { // Toggle the chart type on the click event
    d3.selectAll(".pie-label-container").remove();
    d3.selectAll(".pieCanvas").remove();
    doPieChart(data, root, !languagesSpread); // re-call with new val for last arg
  }); 
} // end of function

// ================================ U.S. Heat Map ================================

function loadHeatMap(root) {

  const width = 960;
  const height = 600;
  const highColor = "#d73d32";
  const lowColor = "#f7d8d6";

  // D3 Projection -> translate to center of screen
  const projection = d3.geoAlbersUsa().translate([width / 2, height / 2]).scale([1000]); 
  // Define path generator to convert GeoJSON to SVG paths, tell path generator to use albersUsa projection
  const path = d3.geoPath().projection(projection); 
  // svg map canvas
  const svg = d3.select(root).append("svg").attr("width", width).attr("height", height).attr("transform", "translate(60, 0)");  

  d3.csv("./states-data.csv", function(error, data) {
     const { max, min } = getMaxMin(data, "percentPopNonEng");
     const colorScale = d3.scaleLinear().domain([min,max]).range([lowColor, highColor]);
    
    // Load GeoJSON data and merge with states data
    d3.json("./us-states.json", function(error, json) {
      if (error) { throw error; }
      // for the legend
		  const w = 140
      const h = 300;
      for (let i=0; i<data.length; i++) {
        // Grab State Name and data value (percentPop)
        const dataState = data[i].state;
        const dataPercentage = data[i].percentPopNonEng;
        // Find the corresponding state inside the GeoJSON
        for (let j = 0; j < json.features.length; j++) {
          const jsonState = json.features[j].properties.name;
          if (dataState == jsonState) {
            json.features[j].properties.percentPopNonEng = dataPercentage; // Copy the data value into the json
            break; // match has been found, so break out of current loop
          }
        }
      }

      svg.selectAll("path").data(json.features).enter() //states are made of svg path elements, the borders are each path 'stroke'
        .append("path").attr("d", path).attr("stroke", "#fff").attr("stroke-width", "1")
          .attr("fill", d => colorScale(d.properties.percentPopNonEng));

      const key = d3.select(root).append("svg").attr("width", w).attr("height", h).attr("class", "legend");

      legend = key.append("defs").append("svg:linearGradient").attr("id", "gradient") // apply gradients for color scale
			  .attr("x1", "100%").attr("y1", "0%").attr("x2", "100%").attr("y2", "100%").attr("spreadMethod", "pad");

      legend.append("stop").attr("offset", "0%").attr("stop-color", highColor).attr("stop-opacity", 1);

      legend.append("stop").attr("offset", "100%").attr("stop-color", lowColor).attr("stop-opacity", 1);

      key.append("rect").attr("width", w - 100).attr("height", h).style("fill", "url(#gradient)").attr("transform", "translate(0,10)");

      const y = d3.scaleLinear().domain([min, max]).range([h, 0]);
		  const yAxis = d3.axisRight(y).tickFormat(d => d + "%");

      key.append("g").attr("class", "y axis").attr("transform", "translate(41,10)").call(yAxis);

    });
  });
} // end of function

// ================================ Invoke chart builders ================================

// sift through the data and organize it before passing on to chart-makers
function organizeData(data) {
  let dataSet = { allLanguages:[] };
  data.forEach(function(d) {
    const percent = Number(d.percentPop);
    if (d.origin === "null") {
      dataSet[d.language] = {
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
      if (!dataSet.hasOwnProperty(d.origin)) {
        dataSet[d.origin] = [];
      }
      dataSet[d.origin].push(newLanguage);
      if (d.language !== "english" && percent > 0.3) {
        dataSet.allLanguages.push(newLanguage);
      }
    }
  });
  return dataSet; // return the dataSet
}

// For grabbing the data and making the bar and pie charts
function getDataMakeCharts(rootOne, rootTwo, rootThree) {
  d3.csv("./language-data.csv", function(error, data) {
    const dataSet = organizeData(data); // create the data-set
    let languages = [];
    for (let i=0; i<dataSet.allLanguages.length; i++) {
      if (dataSet.allLanguages[i].language !== "German" &&
          dataSet.allLanguages[i].language !== "Vietnamese" &&
          dataSet.allLanguages[i].language !== "Korean") {
            languages.push(dataSet.allLanguages[i]);
      }
    }
    makeBarCharts(rootOne, rootTwo,languages); // these two funcs depend on slightly different data
    doPieChart(dataSet, rootThree);
  });
}

$(document).ready(function(e) {
  $( "#tabs" ).tabs(); // jQuery UI tabs feature/ layout
  getDataMakeCharts(".section-1-root", ".section-2-root", ".section-3-root"); // charts 1 - 3
  loadHeatMap(".section-5-root"); // heat map, depends on different data so they can all load async style
});




