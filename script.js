window.onload = function(){

  const SPREADSHEET_SHEET = "Ignos";
  const SPREADSHEET_URL = "https://docs.google.com/spreadsheets/d/1KPDet9BjjY48xtzXHyWNRbgy5fciR7tdHhSGwns5DQs";

  let data_csv = SPREADSHEET_URL + "/gviz/tq?tqx=out:csv&sheet=" + SPREADSHEET_SHEET;

  const DOM = {
    body: d3.select("body")
  }
  
  const UISTRINGS = {
    aChimpWouldGet: "A chimp would get 33% right on this question by just picking A, B or C randomly.",
    correctAnswer: "Correct answer",
    misconception: "Misconception",
    source: "Source"
  }


  function trimObjectValuesAndKeys(obj){return JSON.parse(JSON.stringify(obj).replace(/"\s+|\s+"/g,'"'))}

  doc = new jsPDF("l","pt","a4");

  var promises = [];
  
  d3.dsv(';', "data/Copy of IGNO DEV.csv")
    .then(function(data) {
      console.log(data);
      data = trimObjectValuesAndKeys(data);
      const geo = "rwa";  
      data = data.filter(d=>d.geo==geo);
      console.log(data)
      //console.log(d3.group(data, d => d.geo))

      DOM.body.selectAll("div").data(data).enter().append("div").attr("class","question").each(function(d){
        const view = d3.select(this);
        
        const header = view.append("div").attr("class","header");
        header.append("p").html(d.question);
        if(d["answer type"]=="text"){
          header.append("div").html(`
            <div><span>A.</span><span>${d.a1}</span></div>
            <div><span>B.</span><span>${d.a2}</span></div>
            <div><span>C.</span><span>${d.a3}</span></div>
          `);
        } else if(d["answer type"]=="image"){
          header.append("div").html("Answer images are not supported yet");
        } else {
          header.append("div").html("Unknown question type. Try 'text' or 'image'");
        }
        
        view.append("p").attr("class","correctanswer").html(UISTRINGS.correctAnswer);
        view.append("p").html(d["expanded answer text"] + ` Only ${d.ref1_correct} in ${d.ref1} got it right. ` + UISTRINGS.aChimpWouldGet)
        const table = view.append("table").attr("class","reference");
        table.append("tr").html(`<td>${d.ref1}:</td>
          <td>
            <span class='score'>${Array(parseInt(d.ref1_correct)).join("|")}</span><span class=''>${Array(100-parseInt(d.ref1_correct)).join("|")}</span>
            <span class='score'>${d.ref1_correct}</span> 
          </td>`);
        table.append("tr").html(`<td>Chimps</td>
          <td>
            <span class='score'>${Array(33).join("|")}</span><span class=''>${Array(100-33).join("|")}</span>
            <span class='score'>${"33%"}</span> 
          </td>`);
        view.append("p").attr("class","misconception").html(UISTRINGS.misconception);
        view.append("p").html(d["why wrong text"]);
        view.append("p").attr("class","source").html(`${UISTRINGS.source}: ${d["data source name"]}`);

        
        promises.push(html2canvas(view.node()));
        
        
      })
    
      Promise.all(promises).then(canvases => {
        //
        console.log(canvases)
        canvases.forEach(c => {
          
          var imgData = c.toDataURL('image/png');              
          doc.addImage(imgData, 'PNG', 10, 10);
          doc.addPage();
          
        })
        doc.save('Test.pdf');  
      });
    })
    .catch(function(error){
      DOM.body.html(error);
    })

  
  
  

  

  
}