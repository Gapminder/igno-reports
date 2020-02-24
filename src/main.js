import * as d3 from "d3";

window.d3 = d3;
window.saveSvgAsPng = saveSvgAsPng;

const INSTRUCTIONS_KEY = "1OmmVh9M6Q-3Nb0Fy0xGyYsnDYQbl4fBCmvkCa_rdCf0";
const INSTRUCTIONS_GRAPHS_SHEET = "graph_list";
const INSTRUCTIONS_TEMPLATES_SHEET = "all_templates";

const GRAPHS_URL = `https://docs.google.com/spreadsheets/d/${INSTRUCTIONS_KEY}/gviz/tq?tqx=out:csv&sheet=${INSTRUCTIONS_GRAPHS_SHEET}`;
const TEMPLATES_URL = `https://docs.google.com/spreadsheets/d/${INSTRUCTIONS_KEY}/gviz/tq?tqx=out:csv&sheet=${INSTRUCTIONS_TEMPLATES_SHEET}`;


// fetch instructions
let graphs = [];
let templates = [];

const fetch_instructions = [
  d3.csv(GRAPHS_URL)
    .then(result => graphs = result)
    .catch(error => console.error(error)),
  d3.csv(TEMPLATES_URL)
    .then(result => templates = result)
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
        .read({select: {key: ["country", "time"], value: [indicator]}, where: {country: {"$in": [graph.geo_id]}}, from: "datapoints"})
        .then(data => {
          makeLinechart({
            indicator: indicator, 
            geo: graph.geo_id, 
            data: data, 
            svg: view, 
            conceptProps: data_sources[dataset].concepts.find(c => c.concept == indicator)
          });
          //saveSvgAsPng(view.node(), graph.id + ".png");
        })
        .catch(error => console.error(error))
    }
  })
})


    
    

    




function makeLinechart({indicator, geo, data, svg, conceptProps}){
  const MARGIN = {top: 30, right: 20, bottom: 50, left: 50}
  const WIDTH = 320 - MARGIN.left - MARGIN.right;
  const HEIGHT = 240 - MARGIN.top - MARGIN.bottom;  
  
  svg
    .attr("width", WIDTH + MARGIN.left + MARGIN.right + "px")
    .attr("height", HEIGHT + MARGIN.top + MARGIN.bottom + "px")
  
  if (!data.length) {
    svg.append("text")
      .attr("dy", "20px")
      .text(`EMPTY DATA for ${indicator} and ${geo}`).style("fill", "red");
    
  } else {
    
    
    
    svg.append("svg:defs").append("svg:marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      //.attr('refX', -20)//so that it comes towards the center.
      .attr("markerWidth", 5)
      .attr("markerHeight", 5)
      .attr("orient", "auto")
      .append("svg:path")
      .attr("d", "M0,-5L10,0L0,5");
    
    svg.append("svg:defs").append("svg:marker")
      .attr("id", "cicle")
      .attr("viewBox", "-5 -5 10 10")
      .attr("markerWidth", 5)
      .attr("markerHeight", 5)
      .attr("orient", "auto")
      .append("svg:circle")
      .attr("r", 4)
      .attr("x0", 0)
      .attr("y0", 0);
    
    const g = svg.append("g")
      .attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")");
    
    g.append("text").text(conceptProps.name);
    
    
    var xScale = d3.scaleTime()
      .domain(d3.extent(data.map(m => m.time)))
      .range([0, WIDTH]);
    
    var yScale = d3.scaleTime()
      .domain(d3.extent(data.map(m => m[indicator])))
      .range([HEIGHT, 0]);
    
    var line = d3.line()
      .x(function(d) { return xScale(d.time); }) // set the x values for the line generator
      .y(function(d) { return yScale(d[indicator]); }) // set the y values for the line generator 
      .curve(d3.curveLinear);
    
    g.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + HEIGHT + ")")
      .call(d3.axisBottom(xScale).ticks(5));
    
    g.append("g")
      .attr("class", "y axis")
      .call(d3.axisLeft(yScale).tickFormat(d3.format("~s"))); 
    
    g.append("path")
      .datum(data) 
      .attr('marker-start', (d) => "url(#cicle)")//attach the arrow from defs
      .attr('marker-end', (d) => "url(#arrow)")//attach the arrow from defs
      .attr("class", "line") 
      .attr("d", line);
    
    
    
  }

}