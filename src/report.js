import makeSummary from "./summary.js";
import format from "./formatter.js";

const GLOBAL_GOALS_COLORS = [
  "#000000",
  "#e5243b",
  "#DDA63A",
  "#4C9F38",
  "#C5192D",
  "#FF3A21",
  "#26BDE2",
  "#FCC30B",
  "#A21942",
  "#FD6925",
  "#DD1367",
  "#FD9D24",
  "#BF8B2E",
  "#3F7E44",
  "#0A97D9",
  "#56C02B",
  "#00689D",
  "#19486A"
]

const GLOBAL_GOALS_ICONS = [
  "",
  "E-WEB-Goal-01.png",
  "E-WEB-Goal-02.png",
  "E-WEB-Goal-03.png",
  "E-WEB-Goal-04.png",
  "E-WEB-Goal-05.png",
  "E-WEB-Goal-06.png",
  "E-WEB-Goal-07.png",
  "E-WEB-Goal-08.png",
  "E-WEB-Goal-09.png",
  "E-WEB-Goal-10.png",
  "E-WEB-Goal-11.png",
  "E-WEB-Goal-12.png",
  "E-WEB-Goal-13.png",
  "E-WEB-Goal-14.png",
  "E-WEB-Goal-15.png",
  "E-WEB-Goal-16.png",
  "E-WEB-Goal-17.png"
]

const UISTRINGS = {
  aChimpWouldGet: "A chimp would get 33% right on this question by just picking A, B or C randomly.",
  correctAnswer: "Correct answer",
  misconception: "Misconception",
  source: "Source"
}

const STATIC_CONTENT1 = {
  title: "FLIP YOUR WORLDVIEW",
  columns: [{
    header: "IT IS",
    content: `Most of us do not have an updated understanding about the World we live in. In the news we see over dramatic imagery – we see disasters, wars and natural disasters. Rarely, we see anything about everyday life and slow progress. <br/>
    Together with Gapminder Foundation we have locked for systematic misunderstandings about all countries. In this report, we will reveal the results. Hopefully it will give you some meaningful insights about how your country is being perceived by others and hopefully you find ways to use these insights in a meaningful way.`,
    image: ""
  },{
    header: "WHY ITS DONE",
    content: `We truly believe that by identifying how your country is being systematically misunderstood, you can make sure you address it in your pavilion, so that people will not leave expo without getting rid of the worst misconceptions about your country. <br/>
    We are all here to explore, learn and maybe even start working together. So could there be a better starting point than actually making sure that we help people rid themselves of the misconceptions about our country as well as we rid ourselves of the misconceptions about theirs?`,
    image: ""
  }]
}

const STATIC_CONTENT2 = {
  title: "THE PROJECT",
  columns: [{
    header: "METHOD",
    content: `For each country, Gapminder created a lot of ABC questions based on data from official data providers. The questions span over all UN Global Goals and  These questions were tested in Google Survey on 150 people in UK. The questions where people answered worse than random (ie less than 33% correct) we kept and asked in 4 more countries. We ask a total of 600 people.  <br/>
    In this report we present 6 of these questions where people were generally pretty bad.`,
    image: "E_SDG_logo_without_UN_emblem_horizontal_Transparent_WEB.png",
  },{
    header: "GAPMINDER",
    content: `Gapminder Foundation is an independent non-profit in Sweden who in their project Flip Your Worldview reveals systematic misconceptions about the World. Gapminder does it by constructing and asking basic fact questions to lots of people. Together with Expo Dubai, Gapminder have done this study to find general misunderstandings about your country ( and all others). The study is based on the global bestseller Factfulness (written by Gapminders co-founders Ola Rosling, Anna Rosling Rönnlund and Hans Rosling). To learn more about  the World and how we are wrong about it, we recommend getting a copy of Factfulness.`,
    image: ""
  }]
}

const STATIC_CONTENT3 = {
  title: "HOW TO USE THE STUDY",
  columns: [{
    header: "",
    content: `When we have tested all countries participating at the Expo Dubai, we found that there is big ignorance about all countries. We think we know the World around us, but often we are not updated, and often we have missed slow positive progress, that over time adds up to big change. <br/>
    Most likely the visitors at Expo Dubai will have the same kind of misconception as the general public. Therefor, Expo Dubai is a great chance to make sure you remove the ignorance about your country that might have people hesitate to select your country for tourism, investments and collaborations. Help people realize you are doing better than most people think! <br/><br/>

    Use this study to spark meaningful conversations and integrate relevant questions in your pavilion exhibition. When visitors end up in line outside your pavilion, have them do the test to keep busy.`,
    image: "",
  },{
    header: "",
    content: `And dont forget to share this study with media in your country, let them know that they can share these results and also test their readers/viewers. To spark interest about your pavilion and get your users active, add tesat questions in your social media channels. And hey, dont miss to test the people working in your pavilion, to ensure they are not wrong about your country!. <br/> <br/>
    
    And, make sure you are not getting the questions about your country correct, but also the questions about the countries you have relations to…`,
    image: ""
  }]
}

const STATIC_CONTENT4 = {
  title: "CONTACT",
  columns: [{
    header: "",
    content: `Want to know more about the how this study is being  integrated into the EXPO experience, please contact info@expodubai.com <br/> <br/>

    If there are any issues of how the data is being displayed throughout the site, please contact info@expodubai.com`,
    image: "",
  },{
    header: "",
    content: `Questions about Gapminder, the data and the methodology, contact  info@gapminder.org. <br/> <br/>

    If you want to get more or similar studies about your country, your company please contact studies@gapminder.org. <br/> <br/>

    If you want to get tailored courses, workshops, lectures or certifications at your school, company or organisation, please contact education@gapminder.org.`,
    image: ""
  }]
}


export default function makeReport({view, geo_id="", template_id="", ignos=[], geos, templates}){

  
  ignos = ignos.filter(f => (f.geo==geo_id || !geo_id) && (f.template==template_id || !template_id));
  
  
  let report = view.append("div").attr("class", "report");
  
  report
    .append("div").attr("class","section")
    .append("div").attr("class","cover page").each(function(){
      makeReportCoverPage({view: d3.select(this), geo_id, template_id, geos, templates});
    })
  
  if (!template_id) report
    .append("div").attr("class","section")
    .append("div").attr("class","static page").each(function(){
      makeReportStaticPage({view: d3.select(this), pagenum: 2, content: STATIC_CONTENT1});
    })  
  if (!template_id) report
    .append("div").attr("class","section")
    .append("div").attr("class","static page").each(function(){
      makeReportStaticPage({view: d3.select(this), pagenum: 3, content: STATIC_CONTENT2});
    })

  if(ignos.length) report
    .append("div").attr("class","section").selectAll("div").data(ignos).enter()
    .append("div").attr("class","question page").each(function(igno, index){
      let geo = geos.find(f => f.geo_id == igno.geo);
      let template = templates.find(f => f.template_id == igno.template);
      makeReportQuestionPage({view: d3.select(this), igno, geo, template, index, pagenum: index + 4});
    })
  
  if(ignos.length) report
    .append("div").attr("class", "section")
    .append("div").attr("class", "summary page").each(function(){
      makeReportSummaryPage({view: d3.select(this), ignos, geos, templates, pagenum: ignos.length + 4});
    }) 
  
  if (!template_id) report
    .append("div").attr("class","section")
    .append("div").attr("class","static page").each(function(){
      makeReportStaticPage({view: d3.select(this), pagenum: ignos.length + 5, content: STATIC_CONTENT3});
    })
  if (!template_id) report
    .append("div").attr("class","section")
    .append("div").attr("class","static page").each(function(){
      makeReportStaticPage({view: d3.select(this), pagenum: ignos.length + 6, content: STATIC_CONTENT4});
    })
    
  return Promise.resolve(report);
}


function getWhat({geo_id, template_id, geos, templates}){
  let what = "";
  if (template_id){
    let template = templates.find(f => f.template_id == template_id) || {};
    what = template["template short name"] || template_id;
  } else if (geo_id) {
    let geo = geos.find(f => f.geo_id == geo_id) || {};
    what = geo.name || geo_id;
  }
  return what;
}

function makeReportCoverPage({view, geo_id, template_id, geos, templates}){
  let what = getWhat({geo_id, template_id, geos, templates});
  
  view
    .style("background-image", "url('./assets/images/back.png')")
  
  view
    .append("div")
    .attr("class", "logo")
    .style("background-image", "url('./assets/images/flip.png')")
  
  view
    .append("div")
    .attr("class", "pretitle")
    .html(`What do people know about ${what}? <br> We asked...`);
  
  view
    .append("div")
    .attr("class", "title")
    .text(what);
  
  view
    .append("div")
    .attr("class", "subtitle")
    .text("A study conducted by Gapminder Foundation for Expo Dubai"); 
}

function makeReportStaticPage({view, pagenum, content}){
  view
    .style("background-image", "url('./assets/images/back.png')")
  
  view
    .append("div")
    .attr("class", "logo")
    .style("background-image", "url('./assets/images/flip.png')")
  
  if(content.title) view
    .append("div")
    .attr("class", "title")
    .html(content.title);
  
  view.selectAll(".column")
    .data(content.columns)
    .enter().append().append("div")
    .attr("class", (d,i)=>`column column${i}`)
    .each(function(column){
      const view = d3.select(this);
    
      if(column.header) view
        .append("div")
        .attr("class", "header")
        .text(column.header)
    
      if(column.content) view
        .append("div")
        .attr("class", "content")
        .html(column.content)
    
      if(column.image) view
        .append("div")
        .attr("class", "image")
        .style("background-image", `url('./assets/images/${column.image}')`)
    })
  
    
  view
    .append("div")
    .attr("class", "pagenum")
    .text(pagenum);
}
                            
function makeReportQuestionPage({view, igno={}, geo={}, template, index, pagenum}){
  
   
  igno.ungoal = parseInt(1 + Math.random()*16);
  igno.correctShort = "Longer lives in Rwanda";
  igno.correctLong = "In Rwanda life expectancy is now 68 and it has been raising steadily over the last 20 years. Back in year 2000, it was only 50 years. But when we tested 600 people in four countries, few people got this question right..";
  
  igno.discussion = "Only 25% of the people answering got knew the correct answer. Most underestimated the length of lives In Rwanda a lot (no country today have a life expectancy of only 42…).  Just like in most of Africa, people seem to have missed the slow positive progress happening in many different areas of the society."
  
  igno.legend = {correct: 0, wrong: 1, verywrong: 2};
  igno.answers = [
    {name: "zero", 
     answers: [0, igno.ref1_wrong, igno.ref1_verywrong],
     samplesize: 150
    },
    {name: "UK", 
     answers: [igno.ref1_correct, igno.ref1_wrong, igno.ref1_verywrong],
     samplesize: 150
    },
    {name: "fake", 
     answers: [0.5, igno.ref1_wrong, igno.ref1_verywrong],
     samplesize: 150
    },
    {name: "data", 
     answers: [1, igno.ref1_wrong, igno.ref1_verywrong],
     samplesize: 150
    }
  ]
  
  
  let formatAns = format(template["template short name"].includes("%")? "SHARE":""); //🌶
  
  
  
  
  const header = view.append("div").attr("class","header");
  
  if(igno.ungoal) header.append("div")
    .attr("class", "ungoal-icon")
    .style("background-image", `url('./assets/images/${GLOBAL_GOALS_ICONS[igno.ungoal]}')`);
  
  if(igno.ungoal) header
    .style("background-color", GLOBAL_GOALS_COLORS[igno.ungoal]);
  
  header.append("div")
    .attr("class", "pretitle")
    .html(`${geo.name} question ${index + 1}`);
  
  header.append("div")
    .attr("class", "title")
    .html(igno.question);
  
  if(igno["answer type"]=="text"){
    header.append("div").attr("class", "options").html(`
      <div>A. ${formatAns(igno.a1)}</div>
      <div>B. ${formatAns(igno.a2)}</div>
      <div>C. ${formatAns(igno.a3)}</div>
    `);
  } else if(igno["answer type"]=="image"){
    header.append("div").html("Answer images are not supported yet");
  } else {
    header.append("div").html("Unknown question type. Try 'text' or 'image'");
  }
  
  header.append("div")
    .attr("class","source")
    .html(`${UISTRINGS.source}: ${igno["data source name"]}`);
  
  
  const discussion = view.append("div").attr("class","discussion");

  discussion.append("div")
    .attr("class","title")
    .html(igno.correctShort);
  
  discussion.append("div")
    .attr("class","text1")
    .html(igno.correctLong);
  
  discussion.append("div")
    .attr("class","label-pctcorrect")
    .html("Percent answering correct");
  
  makeAnswersChart({
    view: discussion.append("table").attr("class","answers-chart"), 
    data: igno.answers.map(m => ({name: m.name, value: m.answers[igno.legend.correct]}) )
  });

  discussion.append("div")
    .attr("class","text2")
    .html(igno.discussion);
  
  discussion.append("div")
    .attr("class","cornerlogo")
    .style("background-image", "url('./assets/images/flip.png')");
  
  discussion.append("div")
    .attr("class","pagenum")
    .text(pagenum);
  
}


function makeAnswersChart({view, data}){
  let formatRef = format("SHARE");
  
  view.selectAll("row").data(data).enter().append("tr")
    .attr("class", "row")
    .each(function(d){
      const view = d3.select(this);
    
      view.append("td").attr("class", "name").text(d.name);
      let scale = view.append("td").attr("class", "scale");
    
      scale.selectAll(".tick").data(Array(11)).enter().append("div")
        .attr("class", "tick")
        .style("left", (_, i)=>(i*10+"%"));
    
      scale.append("div")
        .attr("class", "bar")
        .style("width", d.value * 100 + "%");
    
      let text = scale.append("div")
        .attr("class", "value")
        .text(formatRef(d.value));
    
      if(d.value < 0.1) text
        //.style("color", )
        .style("text-shadow", "-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff")
        .style("text-align", "left")
        .style("left", d.value * 100 + "%");
    
      if(d.value >= 0.1) text
        .style("color", "white")
        .style("text-align", "right")
        .style("right", (1-d.value) * 100 + "%");
    })
  
  let labels = view.append("tr")
    .attr("class", "row")
  labels.append("td")
    .attr("class", "name")
  labels.append("td")
    .attr("class", "scale")
    .selectAll(".tick").data(Array(11)).enter().append("div")
    .attr("class", "tick-label")
    .style("left", (_, i)=>(i*10-4+"%"))
    .text((_, i)=>(i*10+"%"));
}


function makeReportSummaryPage({view, ignos, geos, templates, pagenum}){

  view.append("div")
    .attr("class", "ungoal-icon")
    .style("background-image", `url('./assets/images/SDG Wheel_Transparent_WEB.png')`);
  
  view.append("div")
    .attr("class","title")
    .html(`All ${ignos.length} questions`);
  
  view.append("div")
    .attr("class","label-pctcorrect")
    .html("Percent answering correct");
  
  makeAnswersChart({
    view: view.append("table").attr("class","answers-chart"), 
    data: ignos.map(m => ({name: m.question, value: Math.random()}))
  });
  
  view.append("div")
    .attr("class","takeaways")
    .html("[Takeaways for the country – compare with results for other countries in region]");
    
  view.append("div")
    .attr("class","conclusions")
    .html("[Conclusion how you should think about this country to be less wrong]");
  
  
  view.append("div")
    .attr("class","cornerlogo")
    .style("background-image", "url('./assets/images/flip.png')");
  
  view.append("div")
    .attr("class","pagenum")
    .text(pagenum);

}
