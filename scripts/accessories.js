//Display
class UniversalInput{
    constructor(id){
        this.element = document.getElementById(id);
        this.element.addEventListener("input",(e)=>{this.updateData(e)})
        this.label = document.querySelector(`label[for='${id}']`)
        this.mode;
        this.inputTime();
    }

    updateData(e,value){
        if(this.mode == "month"){
            if(!value){ value = $getMonth.func([e.target.value]) }
            this.label.innerHTML = value;
        }
        else if(this.mode == "day"){
            if(!value){ value = $getDay.func([e.target.value]) }
            this.label.innerHTML = value;
        }
        else{
            if(!value){ this.element.value = e.target.value; }
            else{ this.element.value=value };
        }
        
    }

    getValue(){
        return this.element.value
    }

    clearData(){
        this.label.innerHTML = "";
        this.showValue = false;
        this.element.max = "";
        this.element.min = "";
        this.value = "";
        this.element.step = "";
    }

    inputTime(){
        this.mode = "time";
        this.clearData();
        this.element.type = "time";
        this.element.value="23:00";
        this.element.step = 60;
    }

    inputTimeSec(){
        this.element.value="23:00:00";
        this.element.step = 30;
    }

    inputDate(){
        this.mode = "date";
        this.clearData();
        this.element.type = "date";
        this.element.value= $getDate.func();
    }

    inputMonth(){
        this.mode = "month";
        this.clearData();
        this.label.innerHTML = $getMonth.func(["1"]);
        this.element.type = "range";
        this.element.value = 1;
        this.element.min = 1;
        this.element.max = 12;
        this.element.step = 1;
    }

    inputDay(){
        this.mode = "day";
        this.clearData();
        this.label.innerHTML = $getDay.func(["1"]);
        this.element.type = "range";
        this.element.value = 1;
        this.element.min = 1;
        this.element.max = 7;
        this.element.step = 1;
    }

    inputNumber(){
        this.mode = "year";
        this.showValue = false;
        this.element.type = "number";
        this.element.value = "2024";
        this.element.step = 1;
        this.element.max = 9999;
        this.element.min = 0;
    }

}

const fontSizeselectNode = document.getElementById("input-font-size");
const fontSizeOptions = document.getElementsByClassName("additional-font-size-option");

const display = {
    cellCords: document.getElementById("cellData-cords"),
    cellFunc: document.getElementById("cellData-input"),
    dataTypeBtn: document.getElementById("cellData-mode"),
    showResult: false,

    showData(cell) {
        if (cell) {
            this.cellCords.innerHTML = cell.stringAddress;
            if (this.showResult) {
                this.cellFunc.value = cell.getText();
            }
            else {
                this.cellFunc.value = (cell.text == undefined) ? "" : cell.text;
            }
        }
    },

    switchDisplayedData: function () {
        if (this.showResult) {
            this.showResult = false;
            this.dataTypeBtn.innerHTML = "Funkcja: "
        }
        else {
            this.showResult = true;
            this.dataTypeBtn.innerHTML = "Wynik: "
        }
        this.showData(selector.selected);
    },

    confirmChanges: function () {
        if (selector.selected) {
            let value = this.cellFunc.value;
            selector.selected.text = value;
            cellInput.element.value = value;
            this.cellFunc.value = "";
            selector.selected.refresh(false);
            selector.resetOldData();
            selector.selected = false;
            cellInput.hide();
        }

    },

    clearFuncInput: function () {
        this.cellFunc.value = "";
    },

    restartData: function () {
        this.cellFunc.value = "";
        this.cellCords.innerHTML = "-:-"
    },
}

const approveActionWindow = {
    bootstrapElement: new bootstrap.Modal(document.getElementById('approveActionWindow')),
    aproveFunc: false,
    denyFunc: false,
    approveBtn: document.getElementById("approveActionWindow-btn-approve"),
    denyBtn: document.getElementById("approveActionWindow-btn-deny"),
    titleNode: document.getElementById("approveActionWindow-title"),
    messageNode: document.getElementById("approveActionWindow-description"),

    show: function (message, aproveFunc = false, denyFunc = false) {
        this.titleNode.innerHTML = message.title;
        this.messageNode.innerHTML = message.description;
        this.denyBtn.innerHTML = message.deny;
        if (aproveFunc) {
            this.aproveFunc = aproveFunc;
            this.approveBtn.classList.remove("hidden");
            this.approveBtn.innerHTML = message.approve;
        }
        else {
            this.approveBtn.classList.add("hidden");
        }
        if (denyFunc) {
            this.denyFunc = denyFunc;
        }
        else {
            this.denyFunc = this.hide;
        }
        this.bootstrapElement.show();
    },

    resetData: function () {
        this.aproveFunc = false;
        this.denyFunc = false;
    },

    actionApprove: function () {
        if (typeof this.aproveFunc === "function") { this.aproveFunc(); }
        this.resetData();
    },

    actionDeny: function () {
        if (typeof this.denyFunc === "function") { this.denyFunc(); }
        this.resetData();
    }
}

const hyperlinkEditor = {
    inputTextNode: document.getElementById("addHyperlink-input-text"),
    inputLinkNode: document.getElementById("addHyperlink-input-link"),
    removeHyperlink: function () {
        if (selector.selected) {
            selector.selected.styles.hyperlink = false;
            selector.selected.styles.fontColor = "#ffffff";
        }
    },
    createHyperlink: function () {
        if (selector.selected) {
            let value = this.inputLinkNode.value;
            if (value && value.length > 0) {
                selector.selected.styles.hyperlink = value;
                let text = this.inputTextNode.value;
                if (text.length == 0 || text == " ") text = "Link";
                selector.selected.text = text;
                selector.selected.styles.fontColor = "#189BCC";
                selector.selected.refresh();
            }
        }
    }
}

const styleTable = {
    orientation:"vertical",
    extra1:false,
    extra2:false,
    color:"#ff0000",
    function:false,

    update:function(){
       this.orientation = document.getElementById("table-style-orient").value;
       this.function = document.getElementById("table-function").value;
       this.extra1 = document.getElementById("table-style-extra-1").checked;
       this.extra2 = document.getElementById("table-style-extra-2").checked;
       for(let input of document.getElementsByName("table-style-color")){ if(input.checked){ this.color = input.value} }
    },

    makeTable:function(){
        this.update();
        let groups = {};
        for(let cell of selector.selectedCells){
            let x = cell.address.column;
            let y = cell.address.row;
            if(this.orientation == "vertical"){
                if(!groups[x]){ groups[x] = [] };
                groups[x].push(cell);
                
            }
            else{
                if(!groups[y]){ groups[y] = [] };
                groups[y].push(cell);
            }
        }
        for(let group of Object.values(groups)){
            let bufforGroup = [...group];
            for(let i=0; i<group.length; i++){
                let cell = group[i];
                let buffor = this.color;
                if((this.extra1 && i == 0)){
                    if(!cell.text) cell.text = `Tytuł`;
                    cell.styles.textAlign = "center";
                    cell.styles.fontType= "bold";
                    cell.styles.fontSize= "16px";
                    bufforGroup.shift();
                }
                if(this.extra2 && i == group.length-1){
                    bufforGroup.pop();
                    if(this.function){
                        cell.text = `=|${this.function}|`;
                        for(let bufforCell of bufforGroup){
                            cell.text += `${bufforCell.fakeAddress},`
                        }
                        cell.text = cell.text.substring(0, cell.text.length - 1);
                        cell.refresh();
                    }
                }
                if(i % 2 == 0){ buffor += "cc" }
                cell.styles.strokeColor = "#303030";
                cell.styles.fillColor = buffor;
                cell.fill();
                cell.focus();
            }
        }

    },
}

const insertTimeLine = {
    growing:true,
    format:"hour",
    step:1,
    stepType:1,
    labelFrom: new UniversalInput("timeline-label-from"),
    labelTo: new UniversalInput("timeline-label-to") ,
    approveBtn:document.getElementById("timeline-approve"),
    generated:false,
    generatedValues:[],

    updateGrowing:function(e){
        this.lockApproveBtn();
        this.growing = (e.target.value == "true");
    },

    updateStep:function(e){
        this.lockApproveBtn();
        if(e.target.value < 1){ e.target.value = 1 }
        else{
            if(this.format == "day" && e.target.value > 7){ e.target.value = 7 }
            else if(this.format == "month" && e.target.value > 12){ e.target.value = 12}
        }
        this.step = parseInt(e.target.value);
    },

    updateStepType:function(e){
        this.lockApproveBtn();
        this.stepType = e.target.value;
        if(this.format == "hour"){
            if(this.stepType == "3"){ 
                this.labelFrom.inputTimeSec();
                this.labelTo.inputTimeSec();
            }
            else{
                this.labelFrom.inputTime();
                this.labelTo.inputTime();
            }
        }
    },

    updateFormat:function(e){
        this.lockApproveBtn();
        this.format = e.target.value
        if(this.format != "hour" && this.format != "date"){
            this.lockStepType();
            if(this.format == "year"){ 
                this.labelFrom.inputNumber();
                this.labelTo.inputNumber();
             }
            else if(this.format == "month"){ 
                this.labelFrom.inputMonth(); 
                this.labelTo.inputMonth();
            }
            else{
                this.labelFrom.inputDay(); 
                this.labelTo.inputDay();
            }
            
        }
        else{
            if(this.format == "hour"){ 
                let names = ["Godzina", "Minuta", "Sekunda",];
                this.changeStepTypeNames(names); 
                this.labelFrom.inputTime();
                this.labelTo.inputTime();
            }
            else{ 
                let names = ["Rok", "Miesiąc", "Dzień",];
                this.changeStepTypeNames(names); 
                this.labelFrom.inputDate();
                this.labelTo.inputDate();
            }
            this.unlockStepType(); 
        }
    },

    changeStepTypeNames:function(names){
        let options = document.getElementById("timeline-stepType").querySelectorAll("option");
        for(let option of options){
            option.innerHTML = names.shift();
        }
    },

    lockStepType:function(){
        document.getElementById("timeline-stepType").disabled = true;
        document.getElementById("timeline-stepType").value = "";
    },

    unlockStepType:function(){
        document.getElementById("timeline-stepType").disabled = false;
        document.getElementById("timeline-stepType").value = "1";

    },

    lockApproveBtn:function(){
      this.approveBtn.disabled = true;
      this.generated = false;
    },

    recalculate:function(){
        this.generatedValues = [];
        this.approveBtn.disabled = false;
        const selectedSize = selector.selectedCells.size;
        let startValue = this.labelFrom.getValue();

            for(let i=0; i<selectedSize;i++){
                let buffor;

                if(this.format == "day"){
                    startValue = parseInt(startValue);
                    buffor = $getDay.func([startValue]);
                    if(this.growing){ startValue += this.step; }
                    else{ startValue -= this.step; }
                    if(startValue > 7){ startValue = startValue - 7; }
                    else if(startValue < 1){ startValue = 7 + (startValue) }
                }

                else if(this.format == "month"){
                    startValue = parseInt(startValue);
                    buffor = $getMonth.func([startValue]);
                    if(this.growing){ startValue += this.step; }
                    else{ startValue -= this.step; }
                    if(startValue > 12){ startValue = startValue - 12; }
                    else if(startValue < 1){ startValue = 12 + (startValue) }
                }

                else if(this.format == "year"){
                    startValue = parseInt(startValue);
                    buffor = `${startValue}`;
                    if(this.growing){ startValue += this.step; }
                    else{ startValue -= this.step; }
                }

                else if(this.format == "hour"){
                    buffor = startValue;
                    let [h, m, s] = buffor.split(':').map(Number);
                    if(!s) s=0;
                    let time = (h*3600) + (m*60) + s;
                    
                    let multiper = 1;
                    if(this.stepType == "1") multiper = 3600;
                    if(this.stepType == "2") multiper = 60;
                    if(this.growing){ time += this.step*multiper; }
                    else{
                         time -= this.step*multiper;
                         if(time < 0) time = 86400 + time;
                    }

                    h = Math.floor(time / 3600) % 24;
                    m = Math.floor((time % 3600) / 60);
                    s = time % 60;

                    (h<10) ? h=`0${h}` : `${h}`;
                    (m<10) ? m=`0${m}` : `${m}`;
                    (s<10) ? s=`0${s}` : `${s}`;
                    
                    if(this.stepType == "3"){ startValue = `${h}:${m}:${s}`; }
                    else{ startValue = `${h}:${m}`;}
                }

                else{
                    buffor = startValue;
                    let [y, m, d] = startValue.split('-').map(Number);
                    let date = new Date(y, m - 1, d);
                    let step = (this.growing) ? this.step : this.step*-1;
                    if(this.stepType == "1"){
                        date.setFullYear(date.getFullYear() + step);
                    }
                    else if(this.stepType == "2"){
                        date.setMonth(date.getMonth() + step);
                    }
                    else{
                        date.setDate(date.getDate() + step);
                    }
                    startValue = makeDateString(date);
                }

                if(i == selectedSize-1) this.labelTo.updateData(false,buffor);
                this.generatedValues.push(buffor);
            }
    },

    insert(){
        for(let cell of selector.selectedCells){
            cell.text = this.generatedValues.shift();
            cell.refresh();
            cell.focus();
        }
    }
}


class Message {
    constructor(title, description, approve, deny = "Rozumiem") {
        this.title = title;
        this.description = description;
        this.approve = approve;
        this.deny = deny;
    }
}

// Undo / Redo class
class Timeline {
    constructor() {
        if (!Timeline.prototype.button) {
            Timeline.prototype.button = {
                undo: document.getElementById("timeline-undo"),
                redo: document.getElementById("timeline-redo"),
            }
        }
        this.undoHistory = [];
        this.history = [];
    }

    addEvent(changedObject, changedParametr, oldValue, newValue) {
        Timeline.prototype.button.undo.disabled = false;
        let action = {
            changedObject: changedObject,
            changedParametr: changedParametr,
            oldValue: oldValue,
            newValue: newValue
        }
        this.history.push(action);
        if (this.history.length > 20) this.history.shift();
    }

    undo() {
        let action = this.history.pop();
        this.doAction(action, "oldValue")
        this.undoHistory.push(action);
        this.lockButtons();
    }

    redo() {
        let action = this.undoHistory.pop();
        this.doAction(action, "newValue")
        this.history.push(action);
        this.lockButtons();
    }

    lockButtons() {
        if (this.history.length == 0) {
            Timeline.prototype.button.undo.disabled = true;
        }
        else {
            Timeline.prototype.button.undo.disabled = false;
        }
        if (this.undoHistory.length == 0) {
            Timeline.prototype.button.redo.disabled = true;
        }
        else {
            Timeline.prototype.button.redo.disabled = false;
        }

    }

    doAction(action, value) {
        let obj = action.changedObject;
        if (typeof action.changedParametr === "string") {
            obj[action.changedParametr] = action[value];
            obj.refresh(true);
        }

    }

}

// Toolbar inputs Handler class 
class StyleInput {
    constructor(styleName) {
        this.styleName = styleName;
        StyleInput.inputs.push(this);
    }

    apply(e) {
        if (selector.selected) {
            selector.selected.styles[this.styleName] = e.target.value;
        }
        else if (widgetTools_base.selectedWidget) {
            widgetTools_base.selectedWidget.styles[this.styleName] = e.target.value;
            widgetTools_base.selectedWidget.refreshStyles();
        }
        else {
            for (let cell of selector.selectedCells) {
                cell.styles[this.styleName] = e.target.value;
            }
        }
    }


}

class StyleInput_Button {
    constructor(styleName, modalNode, btnNode) {
        this.styleName = styleName;
        StyleInput.inputs.push(this);
        this.bootstrapElement = new bootstrap.Modal(modalNode);
        this.btnNode = btnNode;
        this.btnNode.addEventListener("click", () => { this.show() });
    }

    show() {
        if (selector.selected) {
            this.bootstrapElement.show();
        }
    }

    load(cell) {
        let value = cell.styles[this.styleName];
        if (value) {
            this.btnNode.classList.add("active");
        }
        else {
            this.btnNode.classList.remove("active");
        }
    }

}

class StyleInput_Radio extends StyleInput {
    constructor(btns = [], styleName) {
        super(styleName)
        this.btns = btns;
        for (let btn of btns) {
            btn.addEventListener("input", (e) => { this.apply(e) })
        }
    }

    load(cell) {
        let value = cell.styles[this.styleName];
        for (let btn of this.btns) {
            if (btn.value == value) btn.checked = true;
        }
    }
}

class StyleInput_CheckBox extends StyleInput {
    constructor(checkbox, styleName) {
        super(styleName)
        this.checkbox = checkbox;
        checkbox.addEventListener("input", (e) => { this.apply(e) })
    }

    load(cell) {
        let value = cell.styles[this.styleName];
        if (value == true) {
            this.checkbox.checked = true;
        }
        else {
            this.checkbox.checked = false;
        }
    }

    apply(e) {
        super.apply({ target: { value: e.target.checked } });
    }
}

class StyleInput_Select extends StyleInput {
    constructor(selectBtn, styleName) {
        super(styleName)
        this.btn = selectBtn;
        selectBtn.addEventListener("input", (e) => { this.apply(e) })
    }

    load(cell) {
        this.btn.value = cell.styles[this.styleName];
    }
}

class StyleInput_Color extends StyleInput {
    constructor(selectBtn, styleName) {
        super(styleName)
        this.btn = selectBtn;
        this.sample = document.querySelector(`label[for='${this.btn.id}']`)
        this.sample = this.sample.querySelector("span");
        selectBtn.addEventListener("input", (e) => {
            this.apply(e);
            this.sample.style.color = e.target.value;
        })
    }

    load(cell) {
        let buffor = cell.styles[this.styleName] || "#b8b8b8";
        this.btn.value = buffor;
        this.sample.style.color = buffor;
    }
}

class StyleInput_Number extends StyleInput {
    constructor(inputNode, styleName, min, max, step = 1) {
        super(styleName)
        this.inputNode = inputNode;
        let btns = document.querySelectorAll(`[data-numberInput]`);
        this.min = min;
        this.max = max;
        this.step = step;
        for (let btn of btns) {
            if (btn.getAttribute("data-numberInput") == inputNode.id) {
                btn.addEventListener("click", (e) => { this.apply(e) })
            }

        }
    }

    load(cell) {
        let value = cell.styles[this.styleName];
        this.showResult(value)
    }

    showResult(value) {
        if (value < 10) value = `0${value}`;
        this.inputNode.innerHTML = value;
    }

    apply(e) {
        if (selector.selected) {
            let cell = selector.selected;
            cell.styles[this.styleName]
            cell.styles[this.styleName] += parseInt(e.currentTarget.value);
            let value = cell.styles[this.styleName];
            if (value < this.min) { value = this.min }
            else if (value > this.max) { value = this.max }
            this.showResult(value);
        }
    }

}


StyleInput.inputs = [];
StyleInput.loadCell = function (cell) {
    for (let input of this.inputs) {
        input.load(cell)
    }
}

//Font-Family
new StyleInput_Select(document.getElementById("input-font-family"), "fontFamily");
new StyleInput_Select(document.getElementById("input-font-decoration"), "fontType");
new StyleInput_Select(document.getElementById("input-font-size"), "fontSize");
new StyleInput_Radio(document.getElementsByName("input-text-align"), "textAlign");
new StyleInput_Color(document.getElementById("input-font-color"), "color");
new StyleInput_Color(document.getElementById("input-background-color"), "fillColor");
new StyleInput_Color(document.getElementById("input-border-color"), "strokeColor");
new StyleInput_Number(document.getElementById("input-round-result"), "roundTo", 0, 99);
new StyleInput_Button("hyperlink", document.getElementById("addHyperlink-modal"), document.getElementById("addHyperlink-btn-show"));

//Messages
const msg_remove = new Message("Czy jesteś pewny ?", "Ta operacja usunięcia nie może zostać cofnięta dobrze się zastanów", "Usuń", "Zostaw");
const msg_hyperlink = new Message("Otworzyć odnośnik ?", "Pamiętaj arkusze od obcych osób lub z nieznanych źródeł mogą zawierać odnośniki do złośliwych stron", "Tak", "Nie");
const msg_newFile = new Message("Utworzyć nowy plik ?", "Wszystkie niezapisane zmiany w bieżacym pliku zostaną utracone", "Tak", "Nie");

// 
function changeFontSizesOptions(biger = false) {
    for (let option of fontSizeOptions) {
        (biger) ? option.disabled = false : option.disabled = true;
    }
}

function insertTimeData(e) {
    if (selector.selected) {
        selector.selected.text = e.target.value;
        selector.selected.refresh();
        display.showData(selector.selected);
        cellInput.show(selector.selected);
    }
}

function selectedClearData() {
    if (selector.selected) {
        cellInput.clearData();
        selector.selected.clearData();
        selector.resetOldData();
    }
    else {
        if (selector.selectedCells.size > 0) {
            for (let cell of selector.selectedCells) {
                cell.text = "";
                cell.refresh();
            }
            selector.resetOldData();
        }
    }
}

function selectedClearStyles() {
    if (selector.selected) {
        selector.selected.styles = new selector.selected.styles.constructor();
        selector.selected.fill();
    }
    else if (selector.selectedCells.size > 0) {

        for (let cell of selector.selectedCells) {
            cell.styles = cell.styles = new cell.styles.constructor();
        }
    }
    else if(widgetTools_base.selectedWidget){
        widgetTools_base.selectedWidget.styles = new widgetTools_base.selectedWidget.styles.constructor();
        widgetTools_base.selectedWidget.refreshStyles();
    }
}

function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r, g, b];
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// LISTENERS to accesories
approveActionWindow.approveBtn.addEventListener("click", () => { approveActionWindow.actionApprove() });
approveActionWindow.denyBtn.addEventListener("click", () => { approveActionWindow.actionDeny() });

document.getElementById("addHyperlink-remove").addEventListener("click", () => { hyperlinkEditor.removeHyperlink() });
document.getElementById("addHyperlink-create").addEventListener("click", () => { hyperlinkEditor.createHyperlink() });

document.getElementById("timeline-undo").addEventListener("click", () => { selectedSheet.timeline.undo() });
document.getElementById("timeline-redo").addEventListener("click", () => { selectedSheet.timeline.redo() });

document.getElementById("cellData-aprove").addEventListener("click", display.confirmChanges.bind(display));
document.getElementById("cellData-mode").addEventListener("click", display.switchDisplayedData.bind(display));
document.getElementById("cellData-clear").addEventListener("click", display.clearFuncInput.bind(display));

document.getElementById("input-insert-date").addEventListener("click", (e) => { e.target.showPicker() });
document.getElementById("input-insert-time").addEventListener("click", (e) => { e.target.showPicker() });
document.getElementById("input-insert-date").addEventListener("input", insertTimeData);
document.getElementById("input-insert-time").addEventListener("input", insertTimeData);

document.getElementById("timeline-format").addEventListener("input",(e)=>{insertTimeLine.updateFormat(e)});
document.getElementsByName("timeline-direction").forEach(input=>{input.addEventListener("input",(e)=>{insertTimeLine.updateGrowing(e)});})
document.getElementById("timeline-step").addEventListener("input",(e)=>{insertTimeLine.updateStep(e)});
document.getElementById("timeline-stepType").addEventListener("input",(e)=>{insertTimeLine.updateStepType(e)});

