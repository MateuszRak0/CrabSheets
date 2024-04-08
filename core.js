const canvasContainer = document.getElementById("canvas-container");
const canvas = document.getElementById("mainCanvas");
const ctx = canvas.getContext("2d");
const pressedKeys = new Set();
const allSymbols = ["^", "+", "-", "*", "/", "=", "(", ")", "[", "]", "{", "}", ",","<",">"];
const selectiveSymbols = ["+", "-", "*", "/", "=", "|", "^", ",", "(", "[", "{","<",">"];
const endSymbols = ["+", "-", "*", "/", "=", "|", "^","<",">"];
const specialSymbols = ["$","&","_"];
const cellSize = { x: 120, y: 20 };
const cellSymbol = "☍";

let openedFile;
let selectedSheet;

//SELECTOR & INPUT - Two base object's responsible for selecting and typing into cells
const cellInput = {
    wrotedText:"",
    erasedText:"",
    writeFunc: false,
    writeAddress:false,
    writeString:false,
    afterFunction: false,
    aproveCell: false,
    element: document.getElementById("cellInput"),

    changeCellAproving:function(cell=false,func=false){
        if(!cell && !func){ 
            this.aproveCell = false;
            this.afterFunction = false;
            canvas.classList.remove("cursor-addCell");
        }
        else{
            canvas.classList.add("cursor-addCell");
            if(cell) this.aproveCell = true;
            if(func){
                this.aproveCell = true;
                this.afterFunction = true;
            }
        }
    },

    show: function (cell) {
        this.writeFunc = false;
        this.writeAddress = false;
        this.wrotedText = "";
        
        this.element.style.top = `${cell.y+1}px`;
        this.element.style.left = `${cell.x}px`;

        if (this.element.classList.contains("hidden")) {
            this.element.classList.remove("hidden");
        }

        if (cell.text) {
            this.element.value = cell.text;
            if(cell.text[0] == "=") this.scanText(cell,true);       
        }
        else {
            this.element.value = "";
        }
    },

    scanText:function(cell = selector.selected,afterClick){  
        if(cell){
            this.changeCellAproving();
            for (let i = this.element.value.length - 1; i >= 0; i--) {
                let letter = this.element.value[i];
                if(isNaN(parseFloat(letter))){
                    if (selectiveSymbols.includes(letter)){
                        if(letter != ","){
                            if (i == this.element.value.length - 1) {
                                this.changeCellAproving(true);
                            }
                            if (letter == "|"){
                                if(this.wrotedText.length > 0){ 
                                    this.writeFunc = true; 
                                    this.wrotedText = "|"+this.wrotedText; 
                                }
                                else{ 
                                    this.changeCellAproving(true,true);
                                     break 
                                    }
                                
                            }
                            else{
                                break
                            }
                        }
                    }
                    else if(afterClick){
                        if(letter == "'"){
                                if(this.writeAddress){
                                    this.writeAddress = false;
                                }
                                else{
                                    this.writeAddress = true;
                                    if(this.wrotedText.length > 0){
                                        break
                                    }
                                }
                                this.wrotedText = "";
                        }
                        else{
                            this.wrotedText = letter + this.wrotedText
                        }
                        
                    }
                }
            }
        }
    },

    hide: function () {
        if (!this.element.classList.contains("hidden")) {
            this.element.classList.add("hidden");
            this.element.value = "";
            this.writeFunc = false;
            this.writeAddress = false;
            this.changeCellAproving();
        }
    },

    typing:function(e){
        if(this.element.selectionStart != this.element.value.length){ selector.selected.text = this.element.value; return false;} 
        if(!pressedKeys.has("Control") && selector.selected && this.element.value[0] == "="){ 
            this.checkFocus();
            let lastLetter = this.element.value[this.element.value.length-1];
            let erasedLetter = (e.data == null) ? selector.selected.text[selector.selected.text.length-1]:false;
            let primaryResult = erasedLetter || lastLetter;
            selector.selected.text = this.element.value;
            display.showData(selector.selected);
            if(erasedLetter && allSymbols.includes(erasedLetter)){ this.scanText();}
            else{
                if (selectiveSymbols.includes(lastLetter)) {
                    this.changeCellAproving(true);
                    if (this.afterFunction && endSymbols.includes(lastLetter)) {
                        this.afterFunction = false
                    };
                }
                else{
                    this.changeCellAproving();
                }
            }
            if(primaryResult == `"`){
            this.writeString = (this.writeString) ? false : true ;
            }
            else if(!this.writeString){
                if(primaryResult == "'"){
                    if(this.writeAddress){
                        this.writeAddress = false;
                        let cell = selectedSheet.cells.get(this.wrotedText.toUpperCase())
                        if(cell){ 
                            cell.focus();
                            selector.selectedCells.add(cell);
                            this.element.value = this.element.value.replace(this.wrotedText, this.wrotedText.toUpperCase());
                            selector.selected.text = this.element.value;
                            display.showData(selector.selected);
                            this.scanText();
                        }
                        this.wrotedText = "";
                    }
                    else{ 
                        if(e.data == null){
                            let lastIndex = this.element.value.lastIndexOf("'");
                            if(lastIndex != -1){
                                let removed = this.element.value.slice(lastIndex+1);
                                let cell = selectedSheet.cells.get(removed)
                                if(cell){ selector.unselectCell(cell) }
                                this.element.value = this.element.value.slice(0,lastIndex)
                                this.writeAddress = false;
                                selector.selected.text = this.element.value;
                                display.showData(selector.selected);
                                this.scanText();
                                this.wrotedText = "";
                            }
                        }
                        else{
                            this.writeAddress = true;
                        }
                    }
                }
                else{
                    if(this.writeAddress){
                        if(e.data == null){ 
                            this.wrotedText = this.wrotedText.slice(0, -1) 
                            if(this.wrotedText.length == 0) this.writeAddress = false;
                        }
                        else{
                            
                            this.wrotedText += primaryResult;
                        }
                    }
                    else{
                        if(isNaN(parseFloat(primaryResult))){
                            if(e.data == null && !this.writeFunc && primaryResult == "|"){
                                let lastIndex = this.element.value.lastIndexOf("|");
                                if(lastIndex != -1){
                                    this.element.value = this.element.value.slice(0,lastIndex)
                                    this.writeFunc = false;
                                    selector.selected.text = this.element.value;
                                    display.showData(selector.selected);
                                    this.scanText();
                                    this.wrotedText = "";
                                }
                            }
                            else{
                                if(!allSymbols.includes(primaryResult)){
                                    this.writeFunc = true;
                                }
                                else{
                                    this.writeFunc = false;
                                    hideFunctions();
                                }
                            }
                        }
                        if(this.writeFunc){
                            if(e.data == null){ 
                                this.wrotedText = this.wrotedText.slice(0, -1) 
                                if(this.wrotedText.length == 0){
                                    this.writeFunc = false;
                                    hideFunctions();
                                } 
                                else{ showSimilarFunctions(); }
                            }
                            else{
                                this.wrotedText += primaryResult;
                                
                                if (MathFunction.prototype.functionsNames.includes(this.wrotedText.replace("|","").toUpperCase())) {
                                    let text = this.wrotedText.toUpperCase().replace("|","")
                                    this.saveFunction(`|${text}|`);
                                    hideFunctions();
                                }
                                else{
                                    showSimilarFunctions();
                                }
                            }
                        }
                    }
                    
                }
            }
        }
        else if(this.element.value[0] != "="){
            selector.selected.text = this.element.value;
            display.showData(selector.selected);
        }
    },

    checkFocus: function (e) {
        if (document.activeElement != this.element) this.element.focus();
    },

    saveFunction: function (toreplace) {
        if (toreplace) {
            this.element.value = this.element.value.slice(0,this.element.value.length-this.wrotedText.length) + toreplace;
            if (this.element.value[0] != "=") this.element.value = "=" + this.element.value;
            selector.selected.text = this.element.value;
            display.showData(selector.selected);
            this.changeCellAproving(true,true);
            this.checkFocus();
            this.writeFunc = false;
            hideFunctions();
        }

    },

    erasing:function(e){
        this.checkFocus();
        let letter = this.element.value[this.element.value.length-1]
        if(this.element.value.length == 1 && letter == "="){ 
            this.changeCellAproving(); // Off when this.element.value == empty
         }
    },

    removeCellObject:function(cellAddress) {
        let parts = selector.selected.text.split(cellAddress);
        selector.selected.text = parts[0];
        if (parts[1]) selector.selected.text += parts[1];
        if(selector.selected.text[selector.selected.text.length-1] ==",")selector.selected.text = selector.selected.text.slice(0,-1) ;
        this.updateData();
    },

    addCellObject(cellAddress) {
        if (cellAddress != undefined && cellAddress != selector.selected.fakeAddress) {
            if (selector.selected.text == undefined || selector.selected.text == "") {
                selector.selected.text = "=";
                this.element.value += "=";
            }
            selector.selected.changed = true;
            if(selector.selected.text){
                let lastLetter = selector.selected.text[selector.selected.text.length-1]
                if(lastLetter == "'" || !isNaN(lastLetter)){ selector.selected.text += ","}
            }
            selector.selected.text += cellAddress;
            this.updateData();
        }
    },
    
    updateData:function(){
        this.element.value = selector.selected.text;
        display.showData(selector.selected);
        this.checkFocus();
        this.scanText();
    },

    addTextOnEnd:function(text){
        if(selector.selected){
            selector.selected.text += text;
            this.updateData();
        }
    },

    load: function () {
        this.element.style.width = `${cellSize.x - 1}px`;
        this.element.style.height = `${cellSize.y - 1}px`;
    },

    clearData: function () {
        this.element.value = "";
        display.clearFuncInput();
    },

    prepareElement: function () {
        this.element.style.width = `${cellSize.x - 2}px`;
        this.element.style.height = `${cellSize.y - 2}px`;
    }
}

const selector = {
    selected: false,
    firstPoint: false,
    secondPoint: false,
    selectedCells: new Set(),
    selectedInput: false,
    blocked:false,
    selectionResult:[],

    selectCell: function (mouse) {
        if (selectedSheet){
            let x = mouse.offsetX - cellSize.x / 3;
            let y = mouse.offsetY - cellSize.y - 1;
            let column = Math.ceil(x / cellSize.x);
            let row = Math.ceil(y / cellSize.y)
            x = Math.floor((x-column) / cellSize.x);
            y = Math.floor((y-(row)) / cellSize.y) + 1;
            return selectedSheet.cells.get(`${String.fromCharCode(x + 65)}:${y}`);
        }
    },

    actionStart: function (mouse) {
        this.firstPoint = this.selectCell(mouse)
        hideFunctions();
        if(this.firstPoint) StyleInput.loadCell(this.firstPoint);
    },

    actionEnd: function (mouse) {
        if (this.firstPoint && !this.blocked) {
            this.secondPoint = this.selectCell(mouse)
            if (this.secondPoint) {
                changeFontSizesOptions()
                if (this.firstPoint == this.secondPoint){
                    this.selectionResult = [];
                    if (this.selectedInput) {
                        this.selectedCells.add(this.firstPoint);
                        this.firstPoint.focus();
                        this.selectedInput.value = cellSymbol+this.firstPoint.stringAddress;
                        this.selectedInput = false;
                        canvas.classList.remove("cursor-addCell");
                    }
                    else if (!pressedKeys.has("Control") && !cellInput.aproveCell && !cellInput.afterFunction) {
                        if(!widgetTools_base.selectedWidget){
                            if (!this.checkAreaCell(this.firstPoint)) {
                                this.switchCell(this.firstPoint);
                            }
                        }
                        else{
                            widgetTools_base.unselectWidget();
                            this.resetOldData();
                        }
                    }
                    else if (cellInput.aproveCell || pressedKeys.has("Control")) {
                        if (!this.checkAreaCell(this.firstPoint)) {
                            this.addAreaCell(this.firstPoint);
                        }
                    }
                    else if (!this.selected) {
                        if (!this.checkAreaCell(this.firstPoint)){
                            this.addAreaCell(this.firstPoint);
                        }
                    }
                }
                else{
                    if (pressedKeys.has("Control") || cellInput.afterFunction || !this.selected){
                        this.calculateSelectedArea();
                    }
                    else if(this.selected){
                        this.selected.refresh();
                        this.selected = false;
                        this.calculateSelectedArea();
                        cellInput.hide();
                        hideFunctions();
                    }
                } 
            }
            this.firstPoint = false;
            this.secondPoint = false;
        }
    },

    selectInput: function (e) {
        this.selectedInput = e.target;
        canvas.classList.add("cursor-addCell");
    },

    unselectInput: function (e) {
        if (this.selectedInput) {
            if (e.target != canvas && e.target != this.selectedInput) {
                this.selectedInput = false;
                canvas.classList.remove("cursor-addCell");
            }
        }
    },

    calculateSelectedArea: function () {
        let column = new Object();
        let row = new Object();
        if (this.firstPoint.address.column > this.secondPoint.address.column) {
            column.start = this.secondPoint.address.column;
            column.end = this.firstPoint.address.column;
        }
        else {
            column.start = this.firstPoint.address.column;
            column.end = this.secondPoint.address.column;
        };
        if (this.firstPoint.address.row > this.secondPoint.address.row) {
            row.start = this.secondPoint.address.row;
            row.end = this.firstPoint.address.row;
        }
        else {
            row.start = this.firstPoint.address.row;
            row.end = this.secondPoint.address.row;
        };
        this.selectionResult = {column:column, row:row};
        this.getAreaCells(column, row);
    },

    getAreaCells: function (columns, rows) {
        for (let column = columns.start; column <= columns.end; column++) {
            for (let row = rows.start; row <= rows.end; row++) {
                let cell = selectedSheet.cells.get(`${String.fromCharCode(column + 65)}:${row}`);
                cell.focus();
                if (!this.checkAreaCell(cell)) this.addAreaCell(cell);
            }
        }
    },

    checkAreaCell: function (cell) {
        if (this.selectedCells.has(cell)) {
            cell.refresh();
            if (this.selected) cellInput.removeCellObject(cell.fakeAddress);
            this.selectedCells.delete(cell);
            return true
        }
        return false
    },

    addAreaCell: function (cell) {
        cell.focus();
        this.selectedCells.add(cell);
        cellInput.addCellObject(cell.fakeAddress);
    },

    resetOldData: function () {
        this.selectionResult = false;
        this.selectedCells.forEach(cell => {
            cell.unfocus()
        });
        this.selectedCells = new Set();
        this.selectedInput = false;
    },

    unselectCell:function(cell){
        if(this.selectedCells.has(cell)){
            this.selectedCells.delete(cell);
            cell.unfocus();
        }
    },

    switchCell: function (cell) {
        if(cell.styles.hyperlink){ approveActionWindow.show(msg_hyperlink,callHyperlink) }
        cellInput.show(cell);
        display.showData(cell);
        widgetTools_base.unselectWidget();
        this.resetOldData();
        if (this.selected) {
            this.selected.refresh();
        }
        this.selected = cell;
        if (cell.calculaction) {
            for (let usedCell of cell.calculaction.usedCels) {
                this.selectedCells.add(usedCell);
                usedCell.focus();
            }
        }
    },
}

// BASE FILE OBJECTS
class File{
    constructor(json){
        this.name = "";
        this.author = "";
        this.description = "";
        this.creationDate = getDate.func() +" / "+ getTime.func();
        this.sheets = new Set();
        this.openedSheet = false;
        (json) ? this.loadFile(json) : this.addNewSheet();
        
    }

    addNewSheet(){
        let sheet = new Sheet(this);
        this.sheets.add(sheet);
        sheet.select();
    }

    copySelectedSheet(){
        if(this.openedSheet){
            let sheet = new Sheet(this,this.openedSheet);
            this.sheets.add(sheet);
            sheet.select();
        }
    }

    packToSaving(){
        let buffor = {
            name:this.name,
            createDate:this.creationDate,
            editDate:"01,02,2024",
            author:this.author,
            sheets:[],
        };

        for(let sheet of this.sheets){
            buffor.sheets.push( sheet.packToSaving() )
        }

        buffor = JSON.stringify(buffor)
        return buffor
    }

    removeSelectedSheet(){
        if(this.sheets.size > 1){
            approveActionWindow.show(msg_remove,this.openedSheet.destroy.bind(this.openedSheet))
        }
    }
}

class Sheet {
    constructor(parentFile,otherSheet) {
        if (!Sheet.prototype.listElement) { Sheet.prototype.listElement = document.getElementById("available-sheets") };
        this.timeline = new Timeline();
        this.cells = new Map();
        this.errors = new Set();
        this.parent = parentFile;
        this.widgets = new Set();
        this.name = "";
        if(otherSheet){ this.copySheet(otherSheet) }
        else{ this.createNew() }
        this.createButton();
    }

    copySheet(sheet){
        this.name = sheet.name;
        for(let cell of sheet.cells){
            cell = cell[1];
            let text = (cell.text) ? cell.text : "";
            let copied = new Cell(cell.address.column,cell.address.row,this,text);
            this.cells.set(copied.stringAddress, copied);
        }
    }

    createNew(){
        for (let x = 0; x < 26; x++) {
            for (let y = 1; y <= 1000; y++) {
                let cell = new Cell(x, y,this)
                this.cells.set(cell.stringAddress, cell);
            }
        }
    }

    unselect(){
        this.widgets.forEach(widget => widget.hide())
        this.errors.forEach((error)=>{error.element.classList.add("hidden");  })
        this.button.checked = false;
    }

    select() {
        selector.resetOldData();
        if (this.parent.openedSheet && this.parent.openedSheet != this) {
            this.parent.openedSheet.unselect();
        }
        if (this.parent.openedSheet != this) {
            this.button.checked = true;
            this.parent.openedSheet = this;
            this.render();
            cellInput.hide();   
            selectedSheet = this;
            this.widgets.forEach(widget => { widget.show() })
        }
        this.timeline.lockButtons();
        
    }

    render() {
        clearCanvas();
        this.cells.forEach(cell => {
            cell.draw();
            if (cell.text) { cell.refresh(); }
        })
        this.errors.forEach(error =>{ error.element.classList.remove("hidden");  })
    }

    createButton() {
        this.element = document.createElement("label");
        this.element.classList.add("sheet-switch-btn");

        let input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Arkusz bez nazwy";
        input.value = this.name;
        input.addEventListener("input",(e)=>{this.name = e.target.value});

        this.button = document.createElement("input");
        this.button.type = "radio";
        this.button.name = 'available-sheets';
        this.button.addEventListener("click", this.select.bind(this));
        this.button.classList.add("overlay");
        
        this.element.appendChild(this.button);
        this.element.appendChild(input)
        this.button.checked = true;

        Sheet.prototype.listElement.appendChild(this.element);
    }

    destroy() {
        clearCanvas();
        this.element.outerHTML = "";
        cellInput.hide();
        openedFile.sheets.delete(this);
        selectedSheet = false;
        let values = openedFile.sheets.values();
        let sheet = values.next().value;
        sheet.select();
    }

    packToSaving(){
        let packCell = function(cell){
            return {
                address:cell.stringAddress,
                text:cell.text,
                styles:cell.styles,
            }
        }

        let buffor = {
            name:this.name,
            cells:[],
            widgets:[]
        };

        for(let cell of this.cells){
            cell = cell[1];
            if(cell.text && cell.text != ""){
                buffor.cells.push( packCell(cell) )
            }
        }

        return buffor
    }
}

//Interactive Objects
class Legend {
    constructor(row, column) {
        this.size = {
            x: cellSize.x,
            y: cellSize.y,
        }
        this.y = (row * this.size.y) + row

        if (column == 0) {
            this.text = row;
            this.size.x = cellSize.x / 3;
            this.x = 0;
        }
        else {
            this.x = column * this.size.x + (cellSize.x / 3) + column - cellSize.x -1;
            this.text = String.fromCharCode(column + 64);
        }
        this.draw()
    }

    draw() {
        ctx.strokeRect(this.x , this.y , this.size.x , this.size.y);
        let x = this.x + 4
        let y = this.y + this.size.y / 2 + 4;
        ctx.fillStyle = "#1c1c1c";
        // ctx.fillRect(this.x + 1, this.y + 1, this.size.x - 2, this.size.y - 2);
        ctx.fillStyle = "#fff";
        ctx.fillText(this.text, x, y);
    }
}

class Cell {
    constructor(column, row, sheet, text = "") {
        this.styles = baseStyles();
        this.sheet = sheet;
        this.text = text;
        this.oldtext = "";
        this.calculaction = false;
        this.usedInCalculations = new Set();
        this.usedInCharts = new Set();
        this.styles.strokeColor = "#808080";

        this.address = {
            column: column,
            row: row
        }

        this.stringAddress = `${String.fromCharCode(column + 65)}:${row}`;
        this.fakeAddress = `'${String.fromCharCode(column + 65)}:${row}'`;
        this.y = Math.round(row * cellSize.y) + row;
        this.x = Math.round(column * cellSize.x) + cellSize.x / 3 + column;

        if(text != "") console.log(this);
    }

    getText() {
        let text = this.text;
        if (this.calculaction) { 
            if(!this.calculaction.error){ text = this.calculaction.result + this.styles.endSymbol }
            else{ text = this.calculaction.result }
            
        }
        return `${text}`;
    }

    focus(color = "#ffdb58ce") {
        ctx.strokeStyle = color;//getRndColor();
        ctx.strokeRect(this.x + 2, this.y + 2, cellSize.x - 4, cellSize.y - 4);
    }

    unfocus(){
        ctx.clearRect(this.x + 1, this.y + 1, cellSize.x - 2, cellSize.y - 2); // in next
        this.fill();
    }

    clearData() {
        this.text = "";
        this.refresh();
    }

    refresh(auto){
        if (this.text != this.oldtext) {
            if(!auto) this.sheet.timeline.addEvent(this,"text",this.oldtext,this.text);
            if (!this.calculaction) {
                if (this.text != undefined && this.text.charAt(0) == "=") this.calculaction = new Calculaction(this);
            }
            else {
                if (this.text.charAt(0) != "=") {
                    this.calculaction.remove();
                    this.calculaction = false;
                }
                else {
                    this.calculaction.startScan(false);
                }
            }
        }
        let list = this.usedInCalculations;
        this.usedInCalculations = new Set();
        list.forEach(calculation => {
            calculation.startScan();
        })

        this.usedInCharts.forEach(chart => {
            chart.refresh();
        })
        this.oldtext = this.text
        ctx.clearRect(this.x + 1, this.y + 1, cellSize.x - 2, cellSize.y - 2);
        this.fill();
    }

    draw() {
        ctx.strokeStyle = this.styles.strokeColor;
        ctx.strokeRect(this.x, this.y, cellSize.x, cellSize.y);
        if(this.styles.fillColor) this.fill();
    }

    fill(){
        if(this.styles.fillColor){
            ctx.fillStyle = this.styles.fillColor;
            ctx.fillRect(this.x+1, this.y+1, cellSize.x-1, cellSize.y-1);
        }
        if(this.styles.strokeColor != this.styles.strokeColorOld){
            this.redraw()
        }
        this.writeText();
    }

    redraw() {
        ctx.strokeStyle = "#000000";
        ctx.strokeRect(this.x, this.y, cellSize.x, cellSize.y);
        ctx.strokeRect(this.x, this.y, cellSize.x, cellSize.y);
        ctx.strokeStyle = this.styles.strokeColor;
        ctx.strokeRect(this.x, this.y, cellSize.x, cellSize.y);
        ctx.strokeRect(this.x, this.y, cellSize.x, cellSize.y);
        this.styles.strokeColorOld = this.styles.strokeColor;
    }

    writeText() {
        ctx.fillStyle = this.styles.color;
        ctx.font = this.styles.fontType + " " + this.styles.fontSize + " " + this.styles.fontFamily;
        if (this.text != undefined) {
            let text = this.getText();
            let x;
            let y;
            if(this.styles.textAlign == "left"){
                x = this.x + 4;
                y = this.y + cellSize.y / 2 + parseInt(this.styles.fontSize) / 3;
                let buffor = text;
                while (ctx.measureText(buffor).width > cellSize.x - 10) { buffor = buffor.slice(0, buffor.length - 1); }
                if (text != buffor) text = buffor + "..";
            }
            else if(this.styles.textAlign == "right"){
                y = this.y + cellSize.y / 2 + parseInt(this.styles.fontSize) / 3;
                let buffor = text;
                while (ctx.measureText(buffor).width > cellSize.x - 10) { buffor = buffor.slice(0, buffor.length - 1); }
                if (text != buffor) text = buffor + "..";
                x = this.x + cellSize.x - ctx.measureText(text).width - 4;
            }
            else if(this.styles.textAlign == "center"){
                y = this.y + cellSize.y / 2 + parseInt(this.styles.fontSize) / 3;
                let buffor = text;
                while (ctx.measureText(buffor).width > cellSize.x - 10) { buffor = buffor.slice(0, buffor.length - 1); }
                if (text != buffor){
                    this.styles.textAlign = "left";
                    this.writeText();
                    return;
                } ;
                x = this.x + (cellSize.x/2) - (ctx.measureText(text).width/2) - 4;
            }
            
            ctx.fillText(text, x, y);
        }
    }
}

// CALC OBJECTS
class Calculaction {
    constructor(cell, elements) {
        if (elements) this.elements = elements;
        this.operators = ["^", "+", "-", "*", "/", "=","<",">"];
        this.cell = cell;
        this.error = false;
        this.usedCels = new Set();
        this.startScan(false);
    }

    throwError(code,additionalData) {
        if(this.error) this.error.remove();
        this.error = new ErrorClue(this.cell,code,additionalData);
    }

    restartData() {
        if(this.error) this.error.remove();
        this.error = false;
        this.result = "0";
        this.usedCels = new Set();
    }

    startScan(refresh = true) {
        this.restartData();
        let elements;
        if (this.cell.text.length == 1) { this.throwError("EMPTY"); }
        else { elements = this.scanTextContent(); }
        if (!this.error) {
            elements = this.lookForNegativeNumbers(elements);
            elements = this.createBracketsHierarchy(elements)
            elements = this.calculateFunctions(elements);
        };
        if (!this.error) { elements = this.createBracketsHierarchy(elements); };
        if (!this.error) { this.result = this.calculateElements(elements); };
        if (typeof this.result === "undefined"){ this.throwError("FORM"); }
        if(this.error){
            this.result = this.error.getResult();
        }
        else{
            if(typeof this.result == "number" && isNaN(this.result)){
                this.throwError("NAN")
            }
        }
        if (refresh) {
            this.cell.refresh(this);
        }
    }

    lookForNegativeNumbers(elements) {
        let buffor = [];
        let breakPoints = ["+", "-", "*", "/", "=", "(", "{", "[", ",", "^"];
        let lastBreakPoint = false;
        let foundedNegative = false;
        if (elements[0] == "-") { foundedNegative = true; elements.shift() }
        for (let element of elements) {
            if (breakPoints.includes(element)) {
                if (!lastBreakPoint) {
                    buffor.push(element);
                    lastBreakPoint = true;
                }
                else if (element == "-") {
                    foundedNegative = true;
                }
                else {
                    buffor.push(element);
                }
            }
            else {
                if (!foundedNegative) {
                    buffor.push(element);
                    lastBreakPoint = false;
                }
                else {
                    buffor.push("-" + element);
                    foundedNegative = false;
                    lastBreakPoint = false;
                }
            }
        }
        return buffor;
    }

    createBracketsHierarchy(elements) {
        let brackets = {}
        let buffor = [];
        let inbrackets = 0;
        let bracketsStart = ["(", "[", "{"];
        let bracketsEnd = [")", "]", "}"];
        for (let element of elements) {
            if (bracketsStart.includes(element)) {
                if (inbrackets > 0) { brackets[inbrackets].push("^BRACKET^") }
                inbrackets++;
                if (!brackets[inbrackets]) brackets[inbrackets] = [];
            }
            else if (bracketsEnd.includes(element)) {
                if (inbrackets > 0) {
                    if (inbrackets > 1) {
                        let result = this.calculateFunctions(brackets[inbrackets]);
                        result = this.calculateElements(result);
                        let index = brackets[inbrackets - 1].indexOf("^BRACKET^");
                        brackets[inbrackets - 1][index] = result
                        brackets[inbrackets] = [];
                    }
                    inbrackets--;
                    if (inbrackets == 0) {
                        let result = this.bracketHierarchyDecoder(brackets);
                        buffor.push(result);
                        brackets = {};
                    }
                }
            }
            else {
                if (inbrackets == 0) {
                    buffor.push(element)
                }
                else {
                    brackets[inbrackets].push(element)
                }


            }
        }
        return buffor
    }

    bracketHierarchyDecoder(brackets) {
        let length = Object.keys(brackets).length;
        let lastResult = 0;
        let buffor;
        for (let i = length; i > 0; i--) {
            buffor = brackets[i]

            let higher = buffor.indexOf("^BRACKET^");
            if (higher != -1) { buffor[higher] = lastResult };
            buffor = this.calculateFunctions(buffor);
            lastResult = this.calculateElements(buffor);

        }
        return lastResult;
    }

    calculateElements(elements) {
        if (elements.length == 0) { return 0 }
        else if (elements.length == 1) { return elements[0] }
        else if (elements.length == 2) { if (elements[0] == "-") { return elements[1] * -1 } }
        else {
            let buffor = elements;
            while (buffor.indexOf("^") != -1) {
                let index = buffor.indexOf("^");
                let a = buffor[index - 1];
                let b = buffor[index + 1];
                let res = Math.pow(a, b);
                buffor.splice(index - 1, 3, res);
            }

            while (buffor.indexOf("*") != -1 || buffor.indexOf("/") != -1) {
                let indexOne = buffor.indexOf("*");
                let indexTwo = buffor.indexOf("/");

                if (indexOne < indexTwo || indexTwo == -1) {

                    if (indexOne != -1) {
                        let index = buffor.indexOf("*");
                        let a = buffor[index - 1];
                        let b = buffor[index + 1];
                        if(typeof a == "undefined" || typeof b == "undefined") console.log("Catched Error: some value in calculation is undefined");
                        if(isNaN(parseFloat(a)) || isNaN(parseFloat(b))) this.throwError("FORM") ;
                        let res = 0;
                        if (!a || !b) { res = 0 }
                        else { res = parseFloat(a) * parseFloat(b) };
                        buffor.splice(index - 1, 3, res);
                    }
                }
                if (indexTwo < indexOne || indexOne == -1) {
                    if (indexTwo != -1) {
                        let index = buffor.indexOf("/");
                        let a = buffor[index - 1] || 0;
                        let b = buffor[index + 1] || 0;
                        if (!a || !b || a == 0 || b == 0) { this.throwError("/0") };
                        if(isNaN(parseFloat(a)) || isNaN(parseFloat(b))) this.throwError("FORM") ;
                        let res = parseFloat(a) / parseFloat(b);
                        buffor.splice(index - 1, 3, res);
                    }
                }
            }
            let equal = false;
            let result = parseFloat(buffor[0]);
            let result2;
            for (let i = 1; i < buffor.length - 1; i += 2) {
                let operator = buffor[i];
                let variable = parseFloat(buffor[i + 1]);
                if (operator == "+") {
                    if (!equal) { result += variable; }
                    else { result2 += variable; }

                }
                else if (operator == "-") {
                    if (!equal) { result -= variable; }
                    else { result2 -= variable; }

                }
                else if (operator == "=") {
                    if (equal == true) return this.throwError("FORM");
                    equal = "=";
                    result2 = variable;
                }
                else if( operator == ">" ){
                    if (equal == true) return this.throwError("FORM");
                    equal = ">";
                    result2 = variable;
                }
                else if( operator == "<" ){
                    if (equal == true) return this.throwError("FORM");
                    equal = "<";
                    result2 = variable;
                }
                else {
                    return this.throwError("FORM");
                }

            }
            if (!equal) return result;

            switch(equal){
                case "=":
                    return result == result2;
                
                case ">":
                    return result > result2;

                case "<":
                    return result < result2;
            }

            
            
        }

    }

    calculateFunctions(elements) {
        let bracketsEnd = [")", "]", "}"];
        let buffor = [];
        let func;
        let inFunc = false;
        let funcElements = [];
        for (let i = 0; i < elements.length; i++) {
            let element = elements[i];
            if (inFunc == true) {
                if (this.operators.includes(element) || bracketsEnd.includes(element)) {
                    funcElements = this.calculateFunctions(funcElements);
                    let res = func.func(funcElements); // Tutaj mamy func func
                    if(res[0] == "@"){
                        this.throwError(res.slice(1),func.prefix);
                        break
                    };
                    buffor.push(res);
                    buffor.push(element);
                    inFunc = false;
                    funcElements = [];
                }
                else if (i == elements.length - 1) {
                    funcElements.push(element);
                    funcElements = this.calculateFunctions(funcElements);
                    let res = func.func(funcElements); // Tutaj tez func func
                    if(res[0] == "@"){
                        this.throwError(res.slice(1),func.prefix);
                        break
                    };
                    buffor.push(res);
                    inFunc = false;
                    funcElements = [];
                }
                else {
                    funcElements.push(element);
                }

            }
            else {
                if(typeof element != "undefined"){
                    if (MathFunction.prototype.functions.has(element)) {
                        inFunc = true;
                        func = MathFunction.prototype.functions.get(element);
                        if (elements.length == 1) { 
                            let res = func.func()
                            if(res[0] == "@"){
                                this.throwError(res.slice(1),func.prefix);
                                return 0;
                            };
                        }
                        if( i ==  elements.length-1){
                            let res = func.func()
                            if(res[0] == "@"){
                                this.throwError(res.slice(1),func.prefix);
                                return 0;
                            }
                            else{
                                buffor.push(res);
                            }
                        }
                    }
                    else {
                        if (isNaN(parseFloat(element)) && !allSymbols.includes(element)){
                            let firstLetter = element[0]
                            if(firstLetter == "@"){
                                this.throwError("OTHER",element);
                            }
                            else if(firstLetter == "'"){
                                this.throwError("ERRCELL",element);
                            }
                            else if(firstLetter != `"`){
                                if(typeof element != "boolean" &&  element != "true" && element != "false") this.throwError("ERRFUNC",element);          
                            }    
                        } 
                        buffor.push(element);
                    }
                }
                else{
                    this.throwError("FORM");
                }

            }
        }
        return buffor;
    }

    scanTextContent() {
        let bracketsStart = ["(", "[", "{"];
        let bracketsEnd = [")", "]", "}"];
        let elements = []
        let buffor = "";
        let lastChar = "";
        let text = this.cell.text;
        let inAddress = false;
        let inFunction = false;
        for (let i = 1; i < text.length; i++) {
            let char = text.charAt(i);
            if(char != "-"){
                if(this.operators.includes(char) && this.operators.includes(lastChar)){ this.throwError("FORM"); break }
            }
            lastChar = char;

            if(buffor[0] == '"'){
                buffor += char;
                if(char == '"'){
                    elements.push(buffor);
                    buffor = "";
                }
            }
            else{

                if (bracketsStart.includes(char)) {
                    elements.push(char);
                }
                else if (char != ",") {
                    buffor += char;
                }
                else if (char == "," && buffor.length > 0) {
                    elements.push(buffor);
                    buffor = "";
                }
    
    
    
                if (bracketsEnd.includes(char)) {
                    if (buffor.length - 1 > 0) {
                        elements.push(buffor.slice(0, buffor.length - 1));
                        buffor = "";
                    }
                    elements.push(char)
                }
    
                //MathFunction
                if (char == "|") {
                    if (!inFunction) {
                        if (buffor.length > 1) {
                            elements.push(buffor.slice(0, buffor.length - 1));
                            buffor = "";
                        }
                        inFunction = true;
                    }
                    else {
                        inFunction = false;
                        elements.push(buffor.slice(1, buffor.length - 1));
                        buffor = "";
                    }
                } // Adresses
                if (char == "'") {
                    if (!inAddress) {
                        if (buffor.length > 1) {
                            elements.push(buffor.slice(0, buffor.length - 1));
                            buffor = "'";
                        }
                        inAddress = true;
                    }
                    else {
                        buffor = buffor.slice(1, buffor.length - 1);
                        inAddress = false;
                        let cell = selectedSheet.cells.get(buffor);
                        if (cell) {
                            let result = this.addUsedCell(cell);
                            if (result) { elements.push(result); };
                        }
                        else {
                            this.throwError("ERRCELL",buffor)
                            break
                        }
                        buffor = "";
    
                    }
                }
    
                // Operators
                if (this.operators.includes(char)) {
                    if (buffor.length - 1 > 0) {
                        elements.push(buffor.slice(0, buffor.length - 1));
                    }
                    if (i != text.length - 1) {
                        elements.push(char)
                        buffor = "";
                    } else {
                        buffor = "";
                    }
                }

            }


        }
        if (buffor.length > 0) {
            elements.push(buffor);
        }

        return elements;

    }

    check(cell) {
        if (!cell.calculaction) { return false }
        let done = false;
        let allCells = new Set();
        let oldCells = cell.calculaction.usedCels;
        let nextCells = new Set();
        while (!done) {
            done = true;
            if (oldCells.has(this.cell)) { return true }
            for (let nextCell of oldCells) {
                if (!allCells.has(nextCell)) {
                    done = false;
                    allCells.add(nextCell)

                    if (nextCell.calculaction) {
                        for (let newCell of nextCell.calculaction.usedCels) {
                            nextCells.add(newCell);
                        }
                    }
                };
                oldCells = nextCells;
                nextCells = new Set();
            }
        }
    }

    addUsedCell(cell) {
        if (cell == this.cell) {
            this.throwError("SELF");
            return false;
        }
        else if (this.check(cell)) {
            this.throwError("LOOP");
            return false;
        }

        this.usedCels.add(cell);
        cell.usedInCalculations.add(this);
        let text = cell.getText();
        if (!text || text.length == 0) {
            text = "0";
        }
        
        if(isNaN(text) && text[0] != "@"){
            return `"${text.replace(`"`,'').replace(`"`,'')}"`
        } 
        return text;
    }

    remove() {
        if(this.error){
            this.error.remove();
        }
        for (let cell of this.usedCels) {
            cell.usedInCalculations.delete(this);
        }
    }
}

class CalculationError{
    constructor(code,description,result,title){
        if(!CalculationError.prototype.codes) CalculationError.prototype.codes = new Map();
        this.description = description;
        this.result = result;
        this.title = title;
        CalculationError.prototype.codes.set(code,this);
    }
}

class ErrorClue{
    constructor(cell,code,additionalData = false){
        this.element = document.createElement("a");
        this.element.classList.add("error-clue","icon-flag");
        this.element.style.left = `${cell.x+cellSize.x-30}px`;
        this.element.style.top = `${cell.y-5}px`;
        let description;
        this.cell = cell;
        this.error = CalculationError.prototype.codes.get(code);
        if(additionalData){ description = this.error.description + additionalData; }
        else{ description = this.error.description; }
        this.element.setAttribute("data-bs-toggle","popover");
        this.element.setAttribute("title",this.error.title);
        this.element.setAttribute("tabindex","0");
        this.element.setAttribute("data-bs-trigger","hover");
        this.element.setAttribute("data-bs-content",description);
        canvasContainer.appendChild(this.element);
        new bootstrap.Popover(this.element);
        this.cell.sheet.errors.add(this);
    }

    getResult(){
        return this.error.result;
    }

    remove(){
        this.cell.sheet.errors.add(this);
        this.element.remove()
    }
}

// CANVAS FUNCTIONS
function resizeCanvas(canvas){
    canvas.width = (26 * cellSize.x) + cellSize.x / 3 + 26;
    canvas.height = 1000 * cellSize.y + 1000;
}

function clearCanvas(){
    ctx.clearRect(cellSize.x / 3, cellSize.y, canvas.width, canvas.height);
}

function MoveByArrows(arrow) {
    if (selector.selected) {
        let x;
        let y;
        if (arrow == "ArrowLeft" && selector.selected.address.column > 0) {
            x = selector.selected.address.column - 1;
            y = selector.selected.address.row;
        }
        else if (arrow == "ArrowRight" && selector.selected.address.column < 25) {
            x = selector.selected.address.column + 1;
            y = selector.selected.address.row;
        }
        else if (arrow == "ArrowUp" && selector.selected.address.row > 1) {
            x = selector.selected.address.column;
            y = selector.selected.address.row - 1;
        }
        else if (arrow == "ArrowDown" && selector.selected.address.row < 999) {
            x = selector.selected.address.column;
            y = selector.selected.address.row + 1;
        }
        canvasContainer.scroll({
            top: y*cellSize.y-canvasContainer.offsetHeight/2,
            left: x*cellSize.x-canvasContainer.offsetWidth/2,
            behavior: "smooth",
          });
        newCell = selectedSheet.cells.get(`${String.fromCharCode(x + 65)}:${y}`);
        if (newCell) {
            selector.switchCell(newCell)
        }
    }

}

function baseStyles(){
    return {
        fontFamily: "arial",
        fontType: "normal",
        fontSize: "12px",
        textAlign:"left",
        roundTo:6,
        endSymbol:"",
        color: "#ffffff",
        fillColor: false,
        strokeColor:false,
        strokeColorOld:"#808080",
        strokeWidth:3,
    }
}

function callHyperlink(){
    let url = selector.selected.styles.hyperlink;
    if(!url.includes("http")){
        url = "http://"+url;
    }
    window.open(url, "_blank");
}
