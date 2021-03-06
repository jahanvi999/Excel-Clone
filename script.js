let rowNumberSection = document.querySelector(".row-number-section");

let formulaBarSelectedCellArea = document.querySelector(".selected-cell-div");

let cellSection = document.querySelector(".cell-section");

let columnTagsSection = document.querySelector(".column-tag-section");

let lastCell;

let dataObj = {};

cellSection.addEventListener("scroll",function(e){
    rowNumberSection.style.transform = `translateY(-${e.currentTarget.scrollTop}px)`;

    columnTagsSection.style.transform = `translateX(-${e.currentTarget.scrollLeft}px)`;

})





for (let i = 1; i <= 100; i++) {
  let div = document.createElement("div");
  div.innerText = i;
  div.classList.add("row-number");
  rowNumberSection.append(div);
}



for (let i = 0; i < 26; i++) {
  let asciiCode = 65 + i;

  let reqAlphabet = String.fromCharCode(asciiCode);

  let div = document.createElement("div");
  div.innerText = reqAlphabet;
  div.classList.add("column-tag");
  columnTagsSection.append(div);
}




for (let i = 1; i <= 100; i++) {
  let rowDiv = document.createElement("div");
  rowDiv.classList.add("row");
                       //i = 1 [A1,B1..........Z1]
                       //i = 2 []
                       //.
                       //.
                       //i = 100 [A100.........z100]

  for (let j = 0; j < 26; j++) {       //i = 100   j = 25  asciiCode = 65+25=90  alpha = z  cellAdd = Z100
    // A to Z
    let asciiCode = 65 + j;

    let reqAlphabet = String.fromCharCode(asciiCode);

    let cellAddress = reqAlphabet + i;

    dataObj[cellAddress] = {
      value : undefined,
      formula: undefined,
      upstream: [],
      downstream: [],
    }

    let cellDiv = document.createElement("div");

    cellDiv.addEventListener("input",function(e){
      // jis cell pr type kra uske attribute se maine uska cell address fetch kr
      let currCellAddress = e.currentTarget.getAttribute("data-address")
      //kuki sare cell objects dataObj me store ho rakhe h using their cell address as key
      //maine jis cell pr click krke type kra uska hi address fetch and uska hi object chahiye
      //to wo address as key use krke dataObj se fetch krlia req cellObj ko
       let currCellObj = dataObj[currCellAddress];

       currCellObj.value = e.currentTarget.innerText;
       currCellObj.formula = undefined;

       //1- Loop on upstream
       //2- for each cell go to its downstream and remove ourself
       //3- apni upstream ko empty array krdo

       let currUpstream = currCellObj.upstream;


       for(let k=0;k<currUpstream.length;k++){
         //removefromdownstream(parent,child)

         removeFromDownstream(currUpstream[k],currCellAddress);
       }


       currCellObj.upstream = [];



       let currDownstream = currCellObj.downstream;

       for(let i=0;i<currDownstream.length;i++){
         updateCell(currDownstream[i])
       }

       dataObj[currCellAddress] = currCellObj;


       console.log(dataObj);
      

    });





    cellDiv.contentEditable = true;

    cellDiv.classList.add("cell");

    cellDiv.setAttribute("data-address", cellAddress);

    cellDiv.addEventListener("click",function(e){   //click hone pr 
        if(lastCell){
            lastCell.classList.remove("cell-selected");
        }  //jo last selected cell h usse remove

        e.currentTarget.classList.add("cell-selected");
        lastCell = e.currentTarget;  //current wale ko select

        let currCellAddress = e.currentTarget.getAttribute("data-address")
        formulaBarSelectedCellArea.innerText = currCellAddress //formula bar me cell address

    });
    rowDiv.append(cellDiv);
  }
  cellSection.append(rowDiv)

}
//fake data
dataObj["A1"].value = 20;
dataObj["A1"].downstream = ["B1"];
dataObj["B1"].formula = "2 * A1";
dataObj["B1"].upstream = ["A1"];
dataObj["B1"].value = 40;

let a1cell = document.querySelector("[data-address='A1']")
let b1cell = document.querySelector("[data-address='B1']")

a1cell.innerText = 20
b1cell.innerText = 40

// C1 = Formula(2*A1)
// A1 = parent
// C1 = child

//is function kisi ki upstream se mtlb nhi hai
//iska bs itna kaam h ki parent do and child do , aur mai parent ki downstream se child ko hta dunga
//taki unke bichka connection khtm hojai
//taki agr parent update ho to connection khtm hone ke baad child update na ho

function removeFromDownstream(parentCell, childCell) {
  //1- fetch parentCell's downstream

  let parentDownstream = dataObj[parentCell].downstream;

  //2- filter kro childCell ko parent ki downstream se

  let filteredDownstream = []; //a1

  for (let i = 0; i < parentDownstream.length; i++) { 
    if (parentDownstream[i] != childCell) {
      filteredDownstream.push(parentDownstream[i]);
    }
  }

  //3- filtered upstream ko wapis save krwado dataObj me req cell me
  dataObj[parentCell].downstream = filteredDownstream
}


function updateCell(cell){
  let cellObj = dataObj[cell]
  let upstream = cellObj.upstream // [(A1-20), B1-10]
  let formula = cellObj.formula   // A1 + B1

 // upstream me jobhi cell hai unke objects me jaunga whase unki value lekr aunga 
  // wo sari values mai ek object me key value pair form me store krunga where key being the cell address 


  // {                      //key value pair
  //   A1:20,
  //   B1:10
  // }


  let valObj = {}

  for(let i=0;i<upstream.length;i++){
    let cellValue = dataObj[upstream[i]].value
    valObj[upstream[i]] = cellValue
  }

 //a1 + b1 

  for(let key in valObj){
    formula = formula.replace(key,valObj[key]);
  }
  //20 + 10
  let newValue = eval(formula)

  document.querySelector(`[data-address = '${cell}`)

  dataObj[cell].value = newValue;

  let downstream = cellObj.downstream;

  for(let i=0;i<downstream.length;i++){
    updateCell(downstream[i]);
  }

}