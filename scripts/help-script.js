const collapse = new bootstrap.Collapse(document.getElementById("navCollapse"), { toggle: false });
const mainContentNode = document.getElementById("mainContent");
addEventListener("resize", (e) => {
    if (window.innerWidth > 767) {
        collapse.show()
    }
})
if (window.innerWidth < 768) collapse.hide();
for (let btn of document.getElementsByClassName("closeCollapseBtn")) {
    btn.addEventListener("click", () => {
        mainContentNode.scrollTop = 0;
        if (window.innerWidth < 767) collapse.hide();
    })
}

document.getElementById("range-1").addEventListener("input", (e) => {
    const value = e.currentTarget.value;
    document.getElementById("example-cell-1").innerHTML = value;
    document.getElementById("example-cell-2").innerHTML = parseInt(value) + 7;
})

document.querySelectorAll('[data-toggle="popover"]').forEach(popover => {
    new bootstrap.Popover(popover)
})

class MathFunction{
    constructor(prefix,mathFunc,description = "Example Description",needElements = true,baseResult=0){
        this.prefix = prefix;
        this.mathFunc = mathFunc;
        this.needElements = needElements
        if(!MathFunction.prototype.functions){
            MathFunction.prototype.functions = new Map();
            MathFunction.prototype.functionsNames = [];
        }
        MathFunction.prototype.functions.set(this.prefix,this)
        MathFunction.prototype.functionsNames.push(this.prefix)
        this.baseResult = baseResult;
    }

    func(elements){
        if(this.needElements && elements){
            return this.mathFunc(elements);
        }
        else if(!this.needElements){
            if(elements && elements.length > 0){
                return "@NARG"
            }
            else{
                return this.mathFunc()
            }
        }
        else{
            return "@TOLOW"
        }
        
    }

    checkBoolean(res){
        if(res == `"true"` || res == "true"){
            return true
        }
        else if(res == `"false"` || res ==  "false" ){
            return false
        }
        else if(typeof res == "boolean"){ 
            return res
        }
    }
}

function makeDateString(date){
    let checkFormat = function(number){
        if(number < 10){ return `0${number}`}
        else{ return number }
    }

    let year = date.getFullYear();
    let month = checkFormat(date.getMonth()+1);
    let day = checkFormat(date.getDate());

    return `${year}-${month}-${day}`;
}

const $getDate = new MathFunction("_DATA:DZIS",function(values){
    let date = new Date();
    return makeDateString(date);
},"Zwraca dzisiejszą date w formacie 'Rok-Miesiąc-Dzień' Data będzie się aktualizowac przy każdym odpaleniu arkusza",false);

const $getMonth = new MathFunction("_MSC",function(values){
    if(values.length > 1){ return "@TOMORE" }
    else{
        let number = `${values[0]}`;
        switch(number){
            case "1":
                return "Styczeń";
            case "2":
                return "Luty"
            case "3":
                return "Marzec"
            case "4":
                return "Kwiecień"
            case "5":
                return "Maj";
            case "6":
                return "Czerwiec"
            case "7":
                return "Lipiec"
            case "8":
                return "Sierpień"
            case "9":
                return "Wrzesień";
            case "10":
                return "Październik"
            case "11":
                return "Listopad"
            case "12":
                return "Grudzień"
        }
    }
    return this.baseResult;

    
},"Zwraca nazwe miesiąca z podanej liczby np: |_MSC|1 = Styczeń",true,"@VALUE");


const $getDay = new MathFunction("_DZIEN",function(values){
    if(values.length > 1){ return "@TOMORE" }
    else{
        let number = `${values[0]}`;
        switch(number){
            case "1":
                return "Poniedziałek";
            case "2":
                return "Wtorek"
            case "3":
                return "Środa"
            case "4":
                return "Czwartek"
            case "5":
                return "Piątek"
            case "6":
                return "Sobota"
            case "7":
                return "Niedziela"
        }
    }
    return this.baseResult;

    
},"Zwraca nazwe dnia tygodnia z podanej liczby np: |FUNC|2 = Wtorek",true,"@VALUE");


const timelineCells = [...document.getElementsByClassName("timeline-cell")];

class UniversalInput {
    constructor(id) {
        this.element = document.getElementById(id);
        this.element.addEventListener("input", (e) => { this.updateData(e) })
        this.label = document.querySelector(`label[for='${id}']`)
        this.mode;
        this.inputTime();
    }

    updateData(e, value) {
        if (this.mode == "month") {
            if (!value) { value = $getMonth.func([e.target.value]) }
            this.label.innerHTML = value;
        }
        else if (this.mode == "day") {
            if (!value) { value = $getDay.func([e.target.value]) }
            this.label.innerHTML = value;
        }
        else {
            if (!value) { this.element.value = e.target.value; }
            else { this.element.value = value };
        }

    }

    getValue() {
        return this.element.value
    }

    clearData() {
        this.label.innerHTML = "";
        this.showValue = false;
        this.element.max = "";
        this.element.min = "";
        this.value = "";
        this.element.step = "";
    }

    inputTime() {
        this.mode = "time";
        this.clearData();
        this.element.type = "time";
        this.element.value = "23:00";
        this.element.step = 60;
    }

    inputTimeSec() {
        this.element.value = "23:00:00";
        this.element.step = 30;
    }

    inputDate() {
        this.mode = "date";
        this.clearData();
        this.element.type = "date";
        this.element.value = $getDate.func();
    }

    inputMonth() {
        this.mode = "month";
        this.clearData();
        this.label.innerHTML = $getMonth.func(["1"]);
        this.element.type = "range";
        this.element.value = 1;
        this.element.min = 1;
        this.element.max = 12;
        this.element.step = 1;
    }

    inputDay() {
        this.mode = "day";
        this.clearData();
        this.label.innerHTML = $getDay.func(["1"]);
        this.element.type = "range";
        this.element.value = 1;
        this.element.min = 1;
        this.element.max = 7;
        this.element.step = 1;
    }

    inputNumber() {
        this.mode = "year";
        this.showValue = false;
        this.element.type = "number";
        this.element.value = "2024";
        this.element.step = 1;
        this.element.max = 9999;
        this.element.min = 0;
    }

}

const insertTimeLine = {
    growing: true,
    format: "hour",
    step: 1,
    stepType: 1,
    labelFrom: new UniversalInput("timeline-label-from"),
    labelTo: new UniversalInput("timeline-label-to"),
    approveBtn: document.getElementById("timeline-approve"),
    generated: false,
    generatedValues: [],

    updateGrowing: function (e) {
        this.lockApproveBtn();
        this.growing = (e.target.value == "true");
    },

    updateStep: function (e) {
        this.lockApproveBtn();
        if (e.target.value < 1) { e.target.value = 1 }
        else {
            if (this.format == "day" && e.target.value > 7) { e.target.value = 7 }
            else if (this.format == "month" && e.target.value > 12) { e.target.value = 12 }
        }
        this.step = parseInt(e.target.value);
    },

    updateStepType: function (e) {
        this.lockApproveBtn();
        this.stepType = e.target.value;
        if (this.format == "hour") {
            if (this.stepType == "3") {
                this.labelFrom.inputTimeSec();
                this.labelTo.inputTimeSec();
            }
            else {
                this.labelFrom.inputTime();
                this.labelTo.inputTime();
            }
        }
    },

    updateFormat: function (e) {
        this.lockApproveBtn();
        this.format = e.target.value
        if (this.format != "hour" && this.format != "date") {
            this.lockStepType();
            if (this.format == "year") {
                this.labelFrom.inputNumber();
                this.labelTo.inputNumber();
            }
            else if (this.format == "month") {
                this.labelFrom.inputMonth();
                this.labelTo.inputMonth();
            }
            else {
                this.labelFrom.inputDay();
                this.labelTo.inputDay();
            }

        }
        else {
            if (this.format == "hour") {
                let names = ["Godzina", "Minuta", "Sekunda",];
                this.changeStepTypeNames(names);
                this.labelFrom.inputTime();
                this.labelTo.inputTime();
            }
            else {
                let names = ["Rok", "Miesiąc", "Dzień",];
                this.changeStepTypeNames(names);
                this.labelFrom.inputDate();
                this.labelTo.inputDate();
            }
            this.unlockStepType();
        }
    },

    changeStepTypeNames: function (names) {
        let options = document.getElementById("timeline-stepType").querySelectorAll("option");
        for (let option of options) {
            option.innerHTML = names.shift();
        }
    },

    lockStepType: function () {
        document.getElementById("timeline-stepType").disabled = true;
        document.getElementById("timeline-stepType").value = "";
    },

    unlockStepType: function () {
        document.getElementById("timeline-stepType").disabled = false;
        document.getElementById("timeline-stepType").value = "1";

    },

    lockApproveBtn: function () {
        this.approveBtn.disabled = true;
        this.generated = false;
    },

    recalculate: function () {
        this.generatedValues = [];
        this.approveBtn.disabled = false;
        const selectedSize = timelineCells.length;
        let startValue = this.labelFrom.getValue();

        for (let i = 0; i < selectedSize; i++) {
            let buffor;

            if (this.format == "day") {
                startValue = parseInt(startValue);
                buffor = $getDay.func([startValue]);
                if (this.growing) { startValue += this.step; }
                else { startValue -= this.step; }
                if (startValue > 7) { startValue = startValue - 7; }
                else if (startValue < 1) { startValue = 7 + (startValue) }
            }

            else if (this.format == "month") {
                startValue = parseInt(startValue);
                buffor = $getMonth.func([startValue]);
                if (this.growing) { startValue += this.step; }
                else { startValue -= this.step; }
                if (startValue > 12) { startValue = startValue - 12; }
                else if (startValue < 1) { startValue = 12 + (startValue) }
            }

            else if (this.format == "year") {
                startValue = parseInt(startValue);
                buffor = `${startValue}`;
                if (this.growing) { startValue += this.step; }
                else { startValue -= this.step; }
            }

            else if (this.format == "hour") {
                buffor = startValue;
                let [h, m, s] = buffor.split(':').map(Number);
                if (!s) s = 0;
                let time = (h * 3600) + (m * 60) + s;

                let multiper = 1;
                if (this.stepType == "1") multiper = 3600;
                if (this.stepType == "2") multiper = 60;
                if (this.growing) { time += this.step * multiper; }
                else {
                    time -= this.step * multiper;
                    if (time < 0) time = 86400 + time;
                }

                h = Math.floor(time / 3600) % 24;
                m = Math.floor((time % 3600) / 60);
                s = time % 60;

                (h < 10) ? h = `0${h}` : `${h}`;
                (m < 10) ? m = `0${m}` : `${m}`;
                (s < 10) ? s = `0${s}` : `${s}`;

                if (this.stepType == "3") { startValue = `${h}:${m}:${s}`; }
                else { startValue = `${h}:${m}`; }
            }

            else {
                buffor = startValue;
                let [y, m, d] = startValue.split('-').map(Number);
                let date = new Date(y, m - 1, d);
                let step = (this.growing) ? this.step : this.step * -1;
                if (this.stepType == "1") {
                    date.setFullYear(date.getFullYear() + step);
                }
                else if (this.stepType == "2") {
                    date.setMonth(date.getMonth() + step);
                }
                else {
                    date.setDate(date.getDate() + step);
                }
                startValue = makeDateString(date);
            }

            if (i == selectedSize - 1) this.labelTo.updateData(false, buffor);
            this.generatedValues.push(buffor);
        }
    },

    insert() {
        for (let cell of timelineCells) {
            cell.innerHTML = this.generatedValues.shift();
        }
    }
}


document.getElementById("timeline-format").addEventListener("input",(e)=>{insertTimeLine.updateFormat(e)});
document.getElementsByName("timeline-direction").forEach(input=>{input.addEventListener("input",(e)=>{insertTimeLine.updateGrowing(e)})});
document.getElementById("timeline-step").addEventListener("input",(e)=>{insertTimeLine.updateStep(e)});
document.getElementById("timeline-stepType").addEventListener("input",(e)=>{insertTimeLine.updateStepType(e)});


const switchTableOptions = []
switchTableOptions.push([36,78,92]);
switchTableOptions.push([45,33,1]);
switchTableOptions.push([62,48,99]);

document.getElementById("example-switch-table").addEventListener("input",(e)=>{
    let options = [...switchTableOptions[e.target.value]]
    for(let cell of document.getElementsByClassName("example-switch-table-cell")){
        cell.innerHTML = options.pop();
    }
})

{
    let row = 0;
    let column = 1
    for(let cell of document.getElementsByClassName("example-cell-table")){
        row++;
        if(row > 9){ row = 1; column++}
        cell.column = column;
        cell.row = row;
    }
}


const styleTable = {
    orientation:"vertical",
    extra1:false,
    extra2:false,
    extra3:false,
    color:"#ff0000",
    function:"SUMA",

    update:function(){
       this.orientation = document.getElementById("table-style-orient").value;
       this.function = document.getElementById("table-function").value;
       this.extra1 = document.getElementById("table-style-extra-1").checked;
       this.extra2 = document.getElementById("table-style-extra-2").checked;
       this.extra3 = document.getElementById("table-style-extra-3").checked;
       for(let input of document.getElementsByName("table-style-color")){ if(input.checked){ this.color = input.value} }
    },


    clearTable:function(){
        for(let cell of document.getElementsByClassName("example-cell-table")){
            cell.innerHTML = "";
            cell.style = "";
        }
    },

    makeTable:function(){
        this.update();
        let groups = {};
        let textPos = "center";
        for(let cell of document.getElementsByClassName("example-cell-table")){
            let x = cell.column;
            let y = cell.row;
            console.log(x,y,cell)
            if(this.orientation == "vertical"){
                if(!groups[x]){ groups[x] = [] };
                groups[x].push(cell);
                textPos = "right";
            }
            else{
                if(!groups[y]){ groups[y] = [] };
                groups[y].push(cell);
            }
        }
        let groupsValues = [...Object.values(groups)];
        for(let groupNum=0; groupNum<groupsValues.length; groupNum++){
            let group = groupsValues[groupNum];
            let bufforGroup = [...group];
            for(let i=0; i<group.length; i++){
                let cell = group[i];
                if(cell.style.textAlign == "left") cell.style.textAlign = "center";
                let buffor = this.color;
                if(groupNum == 0 && this.extra3 && this.extra2){
                    if(i == group.length-1){
                        cell.innerHTML = `${this.function}: `
                    }
                    else if(this.extra1 && i == 0){
                        cell.innerHTML = "Nazwa tabeli";
                        cell.style.fontWeight= "600";
                        cell.style.fontSize= "16px";
                    }
                }
                else{
                    if((this.extra1 && i == 0)){
                        cell.innerHTML = `Tytuł`;
                        cell.style.fontType= "bold";
                        cell.style.fontSize= "14px";
                        bufforGroup.shift();
                    }
                    if(this.extra2 && i == group.length-1){
                        bufforGroup.pop();
                        cell.innerHTML = `=|${this.function}|`;
                        cell.style.textAlign = "right";
                    }

                }
                if(i % 2 == 0){ buffor += "cc" }
            
                if(this.color){
                    cell.style.backgroundColor = buffor;
                }
            }
        }

    },
}