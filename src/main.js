import * as d3 from "d3";

window.d3 = d3;
window.saveSvgAsPng = saveSvgAsPng;

const INSTRUCTIONS_KEY = "1OmmVh9M6Q-3Nb0Fy0xGyYsnDYQbl4fBCmvkCa_rdCf0";
const INSTRUCTIONS_GRAPHS_SHEET = "graph_list";
const INSTRUCTIONS_TEMPLATES_SHEET = "all_templates";
const INSTRUCTIONS_OPTIONS_SHEET = "options";
const INSTRUCTIONS_GEOS_SHEET = "all_geos";

function googleSheetLink(key, sheet){
  return `https://docs.google.com/spreadsheets/d/${key}/gviz/tq?tqx=out:csv&sheet=${sheet}`;
}

// fetch instructions
let graphs = [];
let templates = [];
let options = {};
let geos = [];

const fetch_instructions = [
  d3.csv(googleSheetLink(INSTRUCTIONS_KEY, INSTRUCTIONS_GRAPHS_SHEET))
    .then(result => graphs = result)
    .catch(error => console.error(error)),
  d3.csv(googleSheetLink(INSTRUCTIONS_KEY, INSTRUCTIONS_TEMPLATES_SHEET))
    .then(result => templates = result)
    .catch(error => console.error(error)),
  d3.csv(googleSheetLink(INSTRUCTIONS_KEY, INSTRUCTIONS_OPTIONS_SHEET))
    .then(result => result.forEach(kv => options[kv.key] = kv.value))
    .catch(error => console.error(error)),
  d3.csv(googleSheetLink(INSTRUCTIONS_KEY, INSTRUCTIONS_GEOS_SHEET))
    .then(result => geos = result)
    .catch(error => console.error(error))
]

// init readers
const fetch_concept_props = [];

const data_sources = {
  "open_numbers_sg": {dataset: "sg-master"},
  "open_numbers_wdi": {dataset: "wdi-master"}
}

Object.keys(data_sources).map(m => {
  const v = data_sources[m];
  v.reader = DDFServiceReader.getReader();
  v.reader.init({service: 'https://big-waffle.gapminder.org', name: v.dataset});
  v.conceptPromise = v.reader
    .read({select: {key: ["concept"], value: ["name"]}, from: "concepts"})
    .then(result => v.concepts = result)
    .catch(error => console.error(error));
  fetch_concept_props.push(v.conceptPromise);
})



// wait when all async stuff is complete 
Promise.all(fetch_concept_props.concat(fetch_instructions)).then(result => {
  
  graphs.forEach(graph => {
    const view = d3.select("#container").append("div").append("svg").attr("class", "linechart");
    
    const indicator = graph.indicator.split("@")[0];
    const dataset = graph.indicator.split("@")[1];
    
    if(!data_sources[dataset]) {
      console.error(`Dataset ${dataset} is not listed`);
    } else {
    
      data_sources[dataset].reader
        .read({select: {key: ["geo", "time"], value: [indicator]}, where: {country: {"$in": [graph.geo_id]}}, from: "datapoints"})
        .then(data => {
          makeLinechart({
            indicator: indicator, 
            geo: graph.geo_id, 
            data: data, 
            svg: view, 
            geoProps: geos.find(f => f.geo_id == graph.geo_id),
            conceptProps: data_sources[dataset].concepts.find(c => c.concept == indicator),
            template: templates.find(f => f.template_id == graph.id.split("_")[0]),
            options
          });
          if(options.download === "on") saveSvgAsPng(view.node(), graph.id + ".png");
        })
        .catch(error => console.error(error))
    }
  })
})


    
    

    




function makeLinechart({indicator = "", geo = "", data = [], svg, geoProps = {}, conceptProps = {}, template = {}, options = {}}){
  const MARGIN = {top: 50, right: 50, bottom: 50, left: 75}
  const WIDTH = 640 - MARGIN.left - MARGIN.right;
  const HEIGHT = 480 - MARGIN.top - MARGIN.bottom;  
  
  svg
    .attr("width", WIDTH + MARGIN.left + MARGIN.right + "px")
    .attr("height", HEIGHT + MARGIN.top + MARGIN.bottom + "px")
  
  if (!data.length) {
    svg.append("text")
      .attr("dy", "20px")
      .text(`EMPTY DATA for ${template["template short name"]} and ${geo}`).style("fill", "red");
    
  } else {
    
    const PERCENT = template["template short name"].includes("%");
    const formatter = (d) => (d3.format(".2~s")(d) + (PERCENT?"%":""));
    
    svg.append("svg:defs").append("svg:marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("markerWidth", 5)
      .attr("markerHeight", 5)
      .attr("orient", "auto")
      .append("svg:path")
      .attr("d", "M0,-3L7,0L0,3");
    
    svg.append("svg:defs").append("svg:marker")
      .attr("id", "cicle")
      .attr("viewBox", "-5 -5 10 10")
      .attr("markerWidth", 5)
      .attr("markerHeight", 5)
      .attr("orient", "auto")
      .append("svg:circle")
      .attr("r", 3)
      .attr("x0", 0)
      .attr("y0", 0);
    
    const g = svg.append("g")
      .attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")");
    
    if(options["chart title"] === "on") g.append("text").attr("dy","-10px").text(conceptProps.name + " in " + geoProps.name);
    
    var xScale = d3.scaleTime()
      .domain(d3.extent(data.map(m => m.time)))
      .range([0, WIDTH]);
    
    var yScale = d3.scaleLinear()
      .domain(PERCENT ? [0,100] : d3.extent(data.map(m => m[indicator])))
      .range([HEIGHT, 0]);
    
    var line = d3.line()
      .x(function(d) { return xScale(d.time); }) // set the x values for the line generator
      .y(function(d) { return yScale(d[indicator]); }) // set the y values for the line generator 
      .curve(d3.curveLinear);
    
    g.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + HEIGHT + ")")
      .call(d3.axisBottom(xScale).ticks(5).tickSizeOuter(0));
    
    g.append("g")
      .attr("class", "y axis")
      .call(d3.axisLeft(yScale).tickFormat(formatter).ticks(5).tickSizeOuter(0)); 
    
    g.append("path")
      .datum(data) 
      .attr('marker-start', (d) => "url(#cicle)")//attach the arrow from defs
      .attr('marker-end', (d) => "url(#arrow)")//attach the arrow from defs
      .attr("class", "line") 
      .attr("d", line);
    
    const endTime = d3.max(xScale.domain());
    const endValue = data.find(f => f.time - endTime == 0)[indicator];
    const upperHalf = yScale(endValue) < HEIGHT/2;
    
    g.append("text")
      .attr("class", "endvalue")
      .attr("text-anchor", "end")
      .attr("dy", upperHalf? "50px" : "-30px")
      .attr("dx", MARGIN.right)
      .attr("x", xScale(endTime))
      .attr("y", yScale(endValue))
      .text(formatter(endValue))
    
    
  }

}