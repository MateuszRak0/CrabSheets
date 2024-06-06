const functions = {};
const listNode = document.getElementById("functions-lists");
document.getElementById("searchFunc").addEventListener("input",searchFunc);


async function downloadFunctions() {
    const response = await fetch("https://raw.githubusercontent.com/MateuszRak0/CrabSheets/main/mathFunctions.json");
    if(response.ok){
        document.getElementById("loading-icon").remove()
        const data = await response.json();
        unpackData(data)
    }
    else{
        const errorMSG = document.createElement("h2");
        errorMSG.classList.add("py-4","text-center");
        errorMSG.innerHTML = "Wystąpił błąd ładowania spróbuj odświeżyć stronę";
        listNode.appendChild(errorMSG);
        document.getElementById("loading-icon").remove();
    }
    
    
}

function unpackData(data){
    for(let funcData of data){
        new FunctionLabel(funcData)
    }
}

class FunctionLabel{
    constructor(funcData){
        this.hidden = true;
        this.category = funcData.category;
        this.container = document.createElement("div");
        this.container.classList.add( "row", "py-4", "align-items-center", "border-bottom" );
        functions[funcData.prefix] = this;
        this.addData(funcData.prefix);
        this.addData(funcData.category);
        this.addData(funcData.description);
        this.show();
        
    }

    addData(data){
        let dataLabel = document.createElement("div");
        dataLabel.innerHTML = data;
        dataLabel.classList.add("col-sm-4", "col-12", "border-end");
        this.container.appendChild(dataLabel)
    }

    hide(){
        if(!this.hidden){
            listNode.removeChild(this.container);
            this.hidden = true;
        }
        
    }

    show(){
        if(this.hidden){
            listNode.appendChild(this.container);
            this.hidden = false;
        }
        
    }
}

function showAll(){
    for(let functionLabel of Object.values(functions)){
        functionLabel.show();
    }
}

function hideAll(){
    for(let functionLabel of Object.values(functions)){
        functionLabel.hide();
    }
}

function searchByCategory(category){
    hideAll()
    if(category){
        for(let value of Object.values(functions)){
            if(value.category == category){
                value.show()
            }
        }
    }
    else{
        showAll()
    }

}

function searchFunc(e){
    let wroted = e.target.value;
    if(wroted.length == 0){ showAll() }
    else{
        hideAll()
        wroted = wroted.toUpperCase();
        let basepercent = 100 / wroted.length;
        for (let name of Object.keys(functions)){
            let result = 0;

            for (let index = 0; index < name.length; index++) {
                let funcLetter = name.charAt(index)
                let writedLetter = wroted.charAt(index)
                if (funcLetter == writedLetter && funcLetter != undefined) {
                    result += basepercent
                }
                else if (name.charAt(index + 1) == wroted.charAt(index) || wroted.charAt(index - 1) == wroted.charAt(index)){
                    result += basepercent*.6;
                };
            }

            if(result > 80){
                let func = functions[name];
                func.show();
            }

        }
     
    }
}

downloadFunctions();

for(let btn of document.getElementsByClassName("category-btn")){
    btn.addEventListener("click",(e)=>{searchByCategory(e.target.value)})
}