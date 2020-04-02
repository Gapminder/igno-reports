import * as d3 from "d3";
import makeLinechart from "./linechart.js";
import makeReport from "./report.js";
import makeSummary from "./summary.js";

window.d3 = d3;
window.saveSvgAsPng = saveSvgAsPng;

const QUESTIONS_KEY = "115e3rQgfs96MwkrjN9Hh7GJQVHylng7QzBhgF5FFArw";
const QUESTIONS_IGNOS_SHEET = "Ignos";

const INSTRUCTIONS_KEY = "1OmmVh9M6Q-3Nb0Fy0xGyYsnDYQbl4fBCmvkCa_rdCf0";
const INSTRUCTIONS_GRAPHS_SHEET = "graph_list";
const INSTRUCTIONS_TEMPLATES_SHEET = "all_templates";
const INSTRUCTIONS_OPTIONS_SHEET = "options";
const INSTRUCTIONS_GEOS_SHEET = "all_geos";

function googleSheetLink(key, sheet){
  return `https://docs.google.com/spreadsheets/d/${key}/gviz/tq?tqx=out:csv&sheet=${sheet}`;
}

function getUrlParams(search = window.location.search) {
    const hashes = search.slice(search.indexOf('?') + 1).split('&')
    const params = {}
    hashes.map(hash => {
        const [key, val] = hash.split('=')
        if(key) params[key] = decodeURIComponent(val)
    })
    return params
}

function setUrlParams(kv){
  let v = d3.values(kv)
  window.location.search = d3.keys(kv).map((k,i) => k + "=" + v[i]).join("&")
  
}

// fetch instructions
let graphs = [];
let templates = [];
let options = {};
let geos = [];
let ignos = [];

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
    .catch(error => console.error(error)),
  d3.csv(googleSheetLink(QUESTIONS_KEY, QUESTIONS_IGNOS_SHEET))
    .then(result => ignos = result)
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
  
  const DOM = {};
  DOM.container = d3.select("#container");
  DOM.backButton = DOM.container.append("div").attr("class", "back").append("a").text("back").on("click", ()=>{setUrlParams({})});
  DOM.nav = DOM.container.append("div").attr("class", "nav");
  DOM.summary = DOM.container.append("div").attr("class", "summary");

  DOM.nav_geos = DOM.nav.append("div").attr("class", "section");
  DOM.geosTitle = DOM.nav_geos.append("div").attr("class", "title").text("Reports grouped by geo:");
  DOM.geos = DOM.nav_geos.append("div").attr("class", "list");
  DOM.geosDownloadAll = DOM.nav_geos.append("div").attr("class", "dl-all").text("Download all").on("click", () => downloadAll("geos"));
  
  DOM.nav_templates = DOM.nav.append("div").attr("class", "section");
  DOM.templatesTitle = DOM.nav_templates.append("div").attr("class", "title").text("Reports grouped by template:");
  DOM.templates = DOM.nav_templates.append("div").attr("class", "list");
  DOM.templatesDownloadAll = DOM.nav_templates.append("div").attr("class", "dl-all").text("Download all").on("click", () => downloadAll("templates"));
  
  DOM.nav_graphs = DOM.nav.append("div").attr("class", "section");
  DOM.graphsTitle = DOM.nav_graphs.append("div").attr("class", "title").text("Graphs:");
  DOM.graphs = DOM.nav_graphs.append("div").attr("class", "list");
  DOM.graphsDownloadAll = DOM.nav_graphs.append("div").attr("class", "dl-all").text("Download all").on("click", () => downloadAll("graphs"));
  
  DOM.summary = DOM.container.append("div").attr("class", "summary");
  
  DOM.render = DOM.container.append("div").attr("class", "render");
  
  let geosUnique = {};
  let templatesUnique = {};
  let graphsUnique = {};
  
  function resolveGeoName(id){
    let geo = geos.find(f => f.geo_id == id) || {};
    return geo.name || id;
  }
  function resolveTemplateName(id){
    let template = templates.find(f => f.template_id == id) || {};
    return template["template short name"] || id;
  }
      
  ignos.forEach(igno => {
    igno.template = igno["clean id"].split("_")[0];
    
    if(!geosUnique[igno.geo] && igno.geo) {
      geosUnique[igno.geo] = true;
      DOM.geos.append("span").append("a").text(resolveGeoName(igno.geo) + ",").on("click", ()=>{setUrlParams({geo: igno.geo})});
    }
    if(!templatesUnique[igno.template] && igno.template.includes("t")) {
      templatesUnique[igno.template] = true;
      DOM.templates.append("span").append("a").text(resolveTemplateName(igno.template) + ",").on("click", ()=>{setUrlParams({template: igno.template})});
    }
  })
  
  graphs.forEach(graph => {
    if(!graphsUnique[graph.id] && graph.id) {
      graphsUnique[graph.id] = true;
      DOM.graphs.append("span").append("a").text(graph.id + ",").on("click", ()=>{setUrlParams({graph: graph.id})});
    }
  })
  

  let params = getUrlParams();
  let paramsEmpty = d3.keys(params).length == 0;
  DOM.nav.classed("invisible", !paramsEmpty);
  DOM.backButton.classed("invisible", paramsEmpty);
  DOM.summary.classed("invisible", !paramsEmpty);
  
  makeSummary({view: DOM.summary, geos, templates, ignos, options});
  
  function render (params){
    if (params.geo) {
      makeReport({geo_id: params.geo, ignos, view: DOM.render, graphs, geos, templates, data_sources, options});

    } else if (params.template) {
      makeReport({template_id: params.template, ignos, view: DOM.render, graphs, geos, templates, data_sources, options});

    } else if (params.graph) {
      let graph = graphs.find(f => f.id == params.graph);
      let geo = geos.find(f => f.geo_id == graph.geo_id);
      let template = templates.find(f => f.template_id == graph.id.split("_")[0]);
      makeLinechart({view: DOM.render, graph, data_sources, geo, template, options});
    }
  };
  
  render(params);
  
  
  function downloadAll(what) {
    if(what === "graphs"){
      graphs.forEach(graph => {
        
        let geo = geos.find(f => f.geo_id == graph.geo_id);
        let template = templates.find(f => f.template_id == graph.id.split("_")[0]);
        makeLinechart({view: DOM.render, graph, data_sources, geo, template, options})
          .then((svg)=>{
            downloadChart(svg, graph.id + ".png")
              .then(()=>svg.remove());
          });
        
        
      })
    } else if (what == "templates"){
      d3.keys(templatesUnique).forEach(template_id => {
        makeReport({template_id, ignos, view: DOM.render, graphs, geos, templates, data_sources, options})
          .then((div)=>{
            downloadReport(div, template_id)
              .then(()=>div.remove());
          });
      })
    } else if (what == "geos"){
      d3.keys(geosUnique).forEach(geo_id => {
        makeReport({geo_id, ignos, view: DOM.render, graphs, geos, templates, data_sources, options})
          .then((div)=>{
            downloadReport(div, geo_id)
              .then(()=>div.remove());
          });
      })
    }
  }
  
  
  async function downloadReport(view, name){
    let doc = new jsPDF("l","mm","a4");

    
    return await new Promise((resolve, reject) => {
    
      var promises = [];
      view.selectAll(".page").each(function(){
        promises.push(html2canvas(this));
      })
      
      Promise.all(promises).then(pages => {

        pages.forEach(page => {
          var imgData = page.toDataURL('image/png');              
          doc.addImage(imgData, 'PNG', 0, 0, 297, 210);
          doc.addPage();
        })
        doc.save(name);
        resolve();
      })
    })
  }
  
  async function downloadChart(view, name){
    return saveSvgAsPng(view.node(), name);
  }
  
})





  
