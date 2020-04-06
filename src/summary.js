import format from "./formatter.js";

export default function makeSummary({view, geo_id, template_id, geos, templates, ignos, options}){

  const content = view.append("div").attr("class", "summary");
  const width = view.node().clientWidth;
  
  function getTemplateQuestion(igno) {
    return templates.find(f => f.template_id == igno["clean id"].split("_")[0]);
  }
  

  let data = ignos.filter(f => (f.geo==geo_id || !geo_id) && (f.template==template_id || !template_id) && getTemplateQuestion(f));
  
  content.append("div").text("Summary of all questions");
  
  let table = content.append("table")
  
  table.append("th").text("Question");
  table.append("th").text("Right");
  table.append("th").text("Wrong");
  table.append("th").text("Very wrong");
  
  
  
  table.selectAll("tr").data(data).enter()
    .append("tr").each(function(igno, i){
    
      const template = getTemplateQuestion(igno) || {};
    
      let formatRef = format("SHARE");
      let formatCorrectAns = format(template["template short name"].includes("%")? "SHARE":""); //🌶
      
    
      const view = d3.select(this);
      let td1 = view.append("td");
      td1.append("span").attr("class", "question-text").text((i+1) + ". " + igno.question);
      td1.append("span").attr("class", "correct-answer").text("Correct: " + formatCorrectAns(igno[igno.correct]));
    
      let scale = d3.scaleLinear().domain([0, 1]).range([0, width/4])
    
      let td2 = view.append("td")
      td2.append("div").attr("class", "bar correct")
        .style("width", scale(igno["ref1_correct"]) + "px");
      td2.append("div").attr("class", "text correct")
        .text(formatRef(igno["ref1_correct"]));
    
      let td3 = view.append("td")
      td3.append("div").attr("class", "bar wrong")
        .style("width", scale(igno["ref1_wrong"]) + "px");
      td3.append("div").attr("class", "text correct")
        .text(formatRef(igno["ref1_wrong"]));
    
      let td4 = view.append("td")
      td4.append("div").attr("class", "bar vwrong")
        .style("width", scale(igno["ref1_verywrong"]) + "px");
      td4.append("div").attr("class", "text correct")
        .text(formatRef(igno["ref1_verywrong"]));
    
    
    })

  
  return Promise.resolve(content);
}
