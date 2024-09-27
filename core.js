const canvasContainer = document.getElementById("canvas-container");
const canvas = document.getElementById("mainCanvas");
const ctx = canvas.getContext("2d");
const pressedKeys = new Set();
const allSymbols = ["^", "+", "-", "*", "/", "=", "(", ")", "[", "]", "{", "}", ",", "<", ">","."];
const selectiveSymbols = ["+", "-", "*", "/", "=", "|", "^", ",", "(", "[", "{", "<", ">"];
const endSymbols = ["+", "-", "*", "/", "=", "|", "^", "<", ">"];
const specialSymbols = ["$", "&", "_","%"];
const cellSize = { x: 120, y: 20 };
const cellSymbol = "☍";

let openedFile;
let selectedSheet;

//SELECTOR & INPUT - Two base object's responsible for selecting and typing into cells
const cellInput = {
    wrotedText: "",
    erasedText: "",
    writeFunc: false,
    writeAddress: false,
    writeString: false,
    afterFunction: false,
    aproveCell: false,
    element: document.getElementById("cellInput"),

    changeCellAproving: function (cell = false, func = false) {
        if (!cell && !func) {
            this.aproveCell = false;
            this.afterFunction = false;
            canvas.classList.remove("cursor-addCell");
        }
        else {
            canvas.classList.add("cursor-addCell");
            if (cell) this.aproveCell = true;
            if (func) {
                this.aproveCell = true;
                this.afterFunction = true;
            }
        }
    },

    show: function (cell) {
        this.writeFunc = false;
        this.writeAddress = false;
        this.wrotedText = "";

        this.element.style.top = `${cell.y + 1}px`;
        this.element.style.left = `${cell.x}px`;

        if(cell.connected && cell.connected.address.column > cell.address.column){this.element.style.width = `${cellSize.x*2}px`}
        else{ this.element.style.width = `${cellSize.x}px` }

        if (this.element.classList.contains("hidden")) {
            this.element.classList.remove("hidden");
        }

        if (cell.text) {
            this.element.value = cell.text;
            if (cell.text[0] == "=") this.scanText(cell, true);
        }
        else {
            this.element.value = "";
        }
    },

    scanText: function (cell = selector.selected, afterClick) {
        if (cell) {
            this.changeCellAproving();
            for (let i = this.element.value.length - 1; i >= 0; i--) {
                let letter = this.element.value[i];
                if (isNaN(parseFloat(letter))) {
                    if (selectiveSymbols.includes(letter)) {
                        if (letter != ",") {
                            if (i == this.element.value.length - 1) {
                                this.changeCellAproving(true);
                            }
                            if (letter == "|") {
                                if (this.wrotedText.length > 0) {
                                    this.writeFunc = true;
                                    this.wrotedText = "|" + this.wrotedText;
                                }
                                else {
                                    this.changeCellAproving(true, true);
                                    break
                                }

                            }
                            else {
                                break
                            }
                        }
                    }
                    else if (afterClick) {
                        if (letter == "'") {
                            if (this.writeAddress) {
                                this.writeAddress = false;
                            }
                            else {
                                this.writeAddress = true;
                                if (this.wrotedText.length > 0) {
                                    break
                                }
                            }
                            this.wrotedText = "";
                        }
                        else {
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
            this.clearData()
            this.changeCellAproving();
        }
    },

    typing: function (e) {
        if (this.element.selectionStart != this.element.value.length) { selector.selected.text = this.element.value; return false; }
        if (!pressedKeys.has("Control") && selector.selected && this.element.value[0] == "=") {
            this.checkFocus();
            let lastLetter = this.element.value[this.element.value.length - 1];
            let erasedLetter = (e.data == null) ? selector.selected.text[selector.selected.text.length - 1] : false;
            let primaryResult = erasedLetter || lastLetter;
            selector.selected.text = this.element.value;
            display.showData(selector.selected);
            if (erasedLetter && allSymbols.includes(erasedLetter)) { this.scanText(); }
            else {
                if (selectiveSymbols.includes(lastLetter)) {
                    this.changeCellAproving(true);
                    if (this.afterFunction && endSymbols.includes(lastLetter)) {
                        this.afterFunction = false
                    };
                }
                else {
                    this.changeCellAproving();
                }
            }
            if (primaryResult == `"`) {
                this.writeString = (this.writeString) ? false : true;
            }
            else if (!this.writeString) {
                if (primaryResult == "'") {
                    if (this.writeAddress) {
                        this.writeAddress = false;
                        let cell = selectedSheet.cells.get(this.wrotedText.toUpperCase())
                        if (cell) {
                            cell.focus();
                            selector.selectedCells.add(cell);
                            this.element.value = this.element.value.replace(this.wrotedText, this.wrotedText.toUpperCase());
                            selector.selected.text = this.element.value;
                            display.showData(selector.selected);
                            this.scanText();
                        }
                        this.wrotedText = "";
                    }
                    else {
                        if (e.data == null) {
                            let lastIndex = this.element.value.lastIndexOf("'");
                            if (lastIndex != -1) {
                                let removed = this.element.value.slice(lastIndex + 1);
                                let cell = selectedSheet.cells.get(removed)
                                if (cell) { selector.unselectCell(cell) }
                                this.element.value = this.element.value.slice(0, lastIndex)
                                this.writeAddress = false;
                                selector.selected.text = this.element.value;
                                display.showData(selector.selected);
                                this.scanText();
                                this.wrotedText = "";
                            }
                        }
                        else {
                            this.writeAddress = true;
                        }
                    }
                }
                else {
                    if (this.writeAddress) {
                        if (e.data == null) {
                            this.wrotedText = this.wrotedText.slice(0, -1)
                            if (this.wrotedText.length == 0) this.writeAddress = false;
                        }
                        else {

                            this.wrotedText += primaryResult;
                        }
                    }
                    else {
                        if (isNaN(parseFloat(primaryResult))) {
                            if (e.data == null && !this.writeFunc && primaryResult == "|") {
                                let lastIndex = this.element.value.lastIndexOf("|");
                                if (lastIndex != -1) {
                                    this.element.value = this.element.value.slice(0, lastIndex)
                                    this.writeFunc = false;
                                    selector.selected.text = this.element.value;
                                    display.showData(selector.selected);
                                    this.scanText();
                                    this.wrotedText = "";
                                }
                            }
                            else {
                                if (!allSymbols.includes(primaryResult)) {
                                    this.writeFunc = true;
                                }
                                else {
                                    this.writeFunc = false;
                                    hideFunctions();
                                }
                            }
                        }
                        if (this.writeFunc) {
                            if (e.data == null) {
                                this.wrotedText = this.wrotedText.slice(0, -1)
                                if (this.wrotedText.length == 0) {
                                    this.writeFunc = false;
                                    hideFunctions();
                                }
                                else { showSimilarFunctions(); }
                            }
                            else {
                                this.wrotedText += primaryResult;

                                if (MathFunction.prototype.functionsNames.includes(this.wrotedText.replace("|", "").toUpperCase())) {
                                    let text = this.wrotedText.toUpperCase().replace("|", "")
                                    this.saveFunction(`|${text}|`);
                                    hideFunctions();
                                }
                                else {
                                    showSimilarFunctions();
                                }
                            }
                        }
                    }

                }
            }
        }
        else if (this.element.value[0] != "=") {
            selector.selected.text = this.element.value;
            display.showData(selector.selected);
        }
    },

    checkFocus: function (e) {
        if (document.activeElement != this.element) this.element.focus();
    },

    saveFunction: function (toreplace) {
        if (toreplace) {
            this.element.value = this.element.value.slice(0, this.element.value.length - this.wrotedText.length) + toreplace;
            if (this.element.value[0] != "=") this.element.value = "=" + this.element.value;
            selector.selected.text = this.element.value;
            display.showData(selector.selected);
            this.changeCellAproving(true, true);
            this.checkFocus();
            this.writeFunc = false;
            hideFunctions();
        }

    },

    erasing: function (e) {
        this.checkFocus();
        let letter = this.element.value[this.element.value.length - 1]
        if (this.element.value.length == 1 && letter == "=") {
            this.changeCellAproving(); // Off when this.element.value == empty
        }
    },

    removeCellObject: function (cellAddress,multiple){
        if(multiple){
            let parts = selector.selected.text.split(cellAddress);
            selector.selected.text = parts[0];
            if (parts[1]) selector.selected.text += parts[1];
            selector.selected.text = selector.selected.text.replace(",,",",")
            this.updateData();
            return true
        }
        else{
            const addressInCell = selector.selected.text.slice(selector.selected.text.length - cellAddress.length,selector.selected.text.length);
            if(cellAddress == addressInCell){
                selector.selected.text = selector.selected.text.slice(0,selector.selected.text.length - cellAddress.length);
                this.updateData();
                return true
            }
            return false
        }
    },

    addCellObject(cellAddress) {
        if (cellAddress != undefined && cellAddress != selector.selected.fakeAddress) {
            if (selector.selected.text == undefined || selector.selected.text == "") {
                selector.selected.text = "=";
                this.element.value += "=";
            }
            selector.selected.changed = true;
            if (selector.selected.text) {
                let lastLetter = selector.selected.text[selector.selected.text.length - 1]
                if (lastLetter == "'" || !isNaN(lastLetter)) { selector.selected.text += "," }
            }
            selector.selected.text += cellAddress;
            this.updateData();
        }
    },

    updateData: function () {
        this.element.value = selector.selected.text;
        display.showData(selector.selected);
        this.checkFocus();
        this.scanText();
    },

    addTextOnEnd: function (text) {
        if (selector.selected) {
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
        this.wrotedText = "";
        this.erasedText = "";
        this.writeFunc = false;
        this.writeAddress = false;
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
    focusedCells: new Set(),
    selectedInput: false,
    blocked: false,

    selectCell: function (mouse) {
        if (selectedSheet) {
            let x = mouse.offsetX - cellSize.x / 3;
            let y = mouse.offsetY - 1;
            let column = Math.ceil(x / cellSize.x);
            let row = Math.floor(y / (cellSize.y+2));
            x = Math.floor((x - column*2) / cellSize.x);
            y = Math.floor((y - row*2) / cellSize.y);
            let cell =  selectedSheet.getCell(x,y);
            if(cell && !cell.locked) return cell
        }
    },

    actionStart: function (mouse) {
        this.firstPoint = this.selectCell(mouse)
        hideFunctions();
        insertTimeLine.lockApproveBtn();
        if (this.firstPoint) StyleInput.loadCell(this.firstPoint);
    },

    actionEnd: function (mouse) {
        if (this.firstPoint && !this.blocked) {
            this.secondPoint = this.selectCell(mouse)
            if (this.secondPoint) {
                changeFontSizesOptions()
                if (this.firstPoint == this.secondPoint) {
                    if (this.selectedInput) {
                        this.focusedCells.add(this.firstPoint);
                        this.firstPoint.focus();
                        this.selectedInput.value = cellSymbol + this.firstPoint.stringAddress;
                        this.selectedInput = false;
                        canvas.classList.remove("cursor-addCell");
                    }
                    else if (!pressedKeys.has("Control") && !cellInput.aproveCell && !cellInput.afterFunction) {
                        if (!widgetTools_base.selectedWidget){
                            if (!this.checkAreaCell(this.firstPoint,false)) {
                                this.switchCell(this.firstPoint);
                            }
                        }
                        else {
                            if((!this.checkAreaCell(this.firstPoint))){
                                widgetTools_base.unselectWidget();
                                this.resetOldData();
                            }
                        }
                    }
                    else if(cellInput.afterFunction){
                        if (!this.checkAreaCell(this.firstPoint)) {
                            this.addAreaCell(this.firstPoint);
                        }
                    }
                    else if (cellInput.aproveCell || pressedKeys.has("Control")) {
                            this.addAreaCell(this.firstPoint);
                    }

                    else if (!this.selected) {
                        if (!this.checkAreaCell(this.firstPoint)) {
                            this.addAreaCell(this.firstPoint);
                        }
                    }
                }
                else {
                    if (pressedKeys.has("Control") || cellInput.afterFunction || !this.selected) {
                        this.calculateSelectedArea();
                    }
                    else if (this.selected) {
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
        let columnValues = sortValues(this.firstPoint.address.column,this.secondPoint.address.column)
        let rowValues = sortValues(this.firstPoint.address.row,this.secondPoint.address.row)
        column.start = columnValues.smaler; column.end = columnValues.biger;
        row.start = rowValues.smaler; row.end = rowValues.biger;
        this.getAreaCells(column, row);
    },

    getAreaCells: function (columns, rows) {
        for (let column = columns.start; column <= columns.end; column++) {
            for (let row = rows.start; row <= rows.end; row++) {
                let cell = selectedSheet.getCell(column,row);
                cell.focus();
                if (!this.checkAreaCell(cell)) this.addAreaCell(cell);
            }
        }
    },

    checkAreaCell: function (cell,multiple = true) {
        if(this.selected){
            if (this.selectedCells.has(cell) && !pressedKeys.has("Control")) {
                cellInput.removeCellObject(cell.fakeAddress,multiple);
                if(!this.selected.text.includes(cell.fakeAddress)){
                    this.selectedCells.delete(cell);
                    cell.refresh();
                }
                return true
            }
        }
        else{
            if (this.selectedCells.has(cell)) {
                cell.refresh();
                this.selectedCells.delete(cell);
                return true
            }
        }
        return false
    },

    addAreaCell: function (cell) {
        cell.focus();
        this.selectedCells.add(cell);
        cellInput.addCellObject(cell.fakeAddress);
    },

    resetOldData: function () {
        this.selectedCells.forEach(cell => {
            cell.unfocus()
        });
        this.focusedCells.forEach(cell => {
            cell.unfocus()
        });
        this.focusedCells = new Set();
        this.selectedCells = new Set();
        this.selectedInput = false;
    },

    unselectCell: function (cell) {
        if (this.selectedCells.has(cell)) {
            this.selectedCells.delete(cell);
            cell.unfocus();
        }
    },

    switchCell: function (cell) {
        if (cell.styles.hyperlink) { approveActionWindow.show(msg_hyperlink, callHyperlink) }
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

    getSelected:function(single){
        if(this.selected){
            if(single) return this.selected;
            return [this.selected];
        }
        else if(this.selectedCells.size > 0){
            return [...this.selectedCells];
        }
        return false
    }
}

// BASE FILE OBJECTS
class File {
    constructor(loadedFileData) {
        this.name = "bez nazwy";
        this.author = "";
        this.description = "";
        this.creationDate = $getDate.func() + " / " + $getTime.func();
        this.sheets = new Set();
        this.openedSheet = false;
        (loadedFileData) ? this.loadFile(loadedFileData) : this.addNewSheet();
    }

    addNewSheet() {
        let sheet = new Sheet(this);
        this.sheets.add(sheet);
        sheet.select();
    }

    copySelectedSheet() {
        if (this.openedSheet) {
            let data = this.openedSheet.packToSaving();
            let sheet = new Sheet(this,true,data);
            this.sheets.add(sheet);
            sheet.select();
        }
    }

    packToSaving() {
        let buffor = {
            name: this.name,
            createDate: this.creationDate,
            description: this.description,
            author: this.author,
            sheets: [],
        };

        for (let sheet of this.sheets) {
            buffor.sheets.push(sheet.packToSaving())
        }

        buffor = JSON.stringify(buffor)
        return buffor
    }

    removeSelectedSheet() {
        if (this.sheets.size > 1) {
            approveActionWindow.show(msg_remove, this.openedSheet.destroy.bind(this.openedSheet))
        }
    }

    destroy(){
        for(let sheet of this.sheets){ sheet.destroy() }
    }

    loadFile(loadedFileData){
        this.name = loadedFileData.name;
        this.creationDate = loadedFileData.createDate;
        this.author = loadedFileData.author;
        this.description = loadedFileData.description
        for(let loadedSheet of loadedFileData.sheets){
            let sheet = new Sheet(this,false,loadedSheet);
            this.sheets.add(sheet);
            if(!selectedSheet) sheet.select();
        }
    }
}

class Sheet {
    constructor( parentFile, copied, unpack) {
        if (!Sheet.prototype.listElement) { Sheet.prototype.listElement = document.getElementById("available-sheets") };
        this.timeline = new Timeline();
        this.cells = new Map();
        this.cellPopovers = new Set();
        this.parent = parentFile;
        this.widgets = new Set();
        this.name = "";
        this.createNew()
        if (copied)this.copySheet();
        if (unpack) this.unpack(unpack);
        this.createButton();
    }

    getCell(column,row){
        return this.cells.get(`${String.fromCharCode(column + 65)}:${row}`);
    }

    copySheet() {
        this.name += " - kopia";
    }

    createNew() {
        for (let x = 0; x < 26; x++) {
            for (let y = 1; y <= 500; y++) {
                let cell = new Cell(x, y, this)
                this.cells.set(cell.stringAddress, cell);
            }
        }
    }

    unselect() {
        this.widgets.forEach(widget => widget.hide())
        this.cellPopovers.forEach((error) => { error.element.classList.add("hidden"); })
        this.button.checked = false;
    }

    select() {
        selector.selected = false;
        selector.resetOldData();
        cellInput.hide();
        if (this.parent.openedSheet && this.parent.openedSheet != this) {
            this.parent.openedSheet.unselect();
        }
        if (this.parent.openedSheet != this) {
            selectedSheet = this;
            this.parent.openedSheet = this;
            this.button.checked = true;
            this.render();
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
        this.cellPopovers.forEach(error => { error.element.classList.remove("hidden"); })
    }

    createButton() {
        this.element = document.createElement("label");
        this.element.classList.add("sheet-switch-btn");

        this.nameInput = document.createElement("input");
        this.nameInput.type = "text";
        this.nameInput.placeholder = "Arkusz bez nazwy";
        this.nameInput.name = "sheetBtn";
        this.nameInput.value = this.name;
        this.nameInput.addEventListener("input", (e) => { this.name = e.target.value });

        this.button = document.createElement("input");
        this.button.type = "radio";
        this.button.name = 'available-sheets';
        this.button.addEventListener("click", this.select.bind(this));
        this.button.classList.add("overlay");

        this.element.appendChild(this.button);
        this.element.appendChild(this.nameInput);

        Sheet.prototype.listElement.appendChild(this.element);
    }

    destroy() {
        clearCanvas();
        this.nameInput.removeEventListener("input", (e) => { this.name = e.target.value });
        this.button.removeEventListener("click", this.select.bind(this));
        this.element.outerHTML = "";
        cellInput.hide();
        for(let widget of this.widgets){
            widget.destroy();
        }
        for(let popover of this.cellPopovers){
            popover.remove();
        }
        openedFile.sheets.delete(this);
        selectedSheet = false;
        let values = openedFile.sheets.values();
        let sheet = values.next().value;
        if(sheet) sheet.select();
    }

    packToSaving() {
        const baseCellStyle = new StyleListCell();

        const checkStyles = function(cell){
            for(let key of Object.keys(cell.styles)){
                if(baseCellStyle[key] != cell.styles[key]){
                    if(key != "strokeColorOld") return true
                }
            }
            return false
        }

        const packCell = function(cell,firstCheckStyle){
            if(firstCheckStyle && !checkStyles(cell)){
                return {
                    address: cell.stringAddress,
                    text: cell.text,
                    styles: false,
                }
            }
            if(cell.styles.comment){
                cell.styles.comment = {
                    title:cell.styles.comment.title,
                    text:cell.styles.comment.text
                }
            }
            return {
                address: cell.stringAddress,
                text: cell.text,
                styles: cell.styles,
            }
        }

        let buffor = {
            name: this.name,
            cells: [],
            widgets: []
        };

        for (let cell of this.cells) {

            cell = cell[1];

            if(cell.text && cell.text != ""){
                buffor.cells.push(packCell(cell,true))
            }
            else if(checkStyles(cell)){
                buffor.cells.push(packCell(cell))
            }
        }

        for(let widget of this.widgets){
            let packedWidget = widget.packToSaving();
            buffor.widgets.push(packedWidget)
        }

        return buffor
    }

    unpack(loadedSheet){
        this.name = loadedSheet.name;
        for(let loadedcell of loadedSheet.cells){
            let cell = this.cells.get(loadedcell.address);
            if(cell){
                cell.text = loadedcell.text;
                cell.styles = new StyleList(loadedcell.styles);
                if(cell.styles.comment){
                    cell.styles.comment = new CellPopover(cell,cell.styles.comment.title,cell.styles.comment.text,"#a5ff0ab3");
                }
            }
        }
        for(let loadedWidget of loadedSheet.widgets){
            unpackWidget(this,loadedWidget)
        }

    }
}

//Interactive Objects
class Legend {
    constructor(row, column) {
        this.size = {
            x: cellSize.x,
            y: cellSize.y,
        }
        this.y = (row * this.size.y) + row*2;
        if(row == 0) this.y++;
        if (column == 0) {
            this.text = row;
            this.size.x = cellSize.x / 3;
            this.x = 0;
        }
        else {
            this.x = column * this.size.x + (cellSize.x / 3) + (column*2) - cellSize.x-2;
            this.text = String.fromCharCode(column + 64);
        }
        this.draw()
    }

    draw() {
        ctx.strokeRect(this.x, this.y, this.size.x, this.size.y);
        let x = this.x + 4
        let y = this.y + this.size.y / 2 + 4;
        ctx.fillStyle = "#1c1c1c";
        ctx.fillStyle = "#fff";
        ctx.fillText(this.text, x, y);
    }
}

class Cell {
    constructor(column, row, sheet, text = "") {
        this.styles = new StyleListCell();
        this.sheet = sheet;
        this.text = text;
        this.oldtext = "";
        this.calculaction = false;
        this.usedInCalculations = new Set();
        this.usedInCharts = new Set();
        this.locked = false;
        this.connected = false;

        this.address = {
            column: column,
            row: row
        }

        this.stringAddress = `${String.fromCharCode(column + 65)}:${row}`;
        this.fakeAddress = `'${String.fromCharCode(column + 65)}:${row}'`;
        this.getPosition();
    }

    getPosition(){
        this.y = Math.round(this.address.row * cellSize.y) + this.address.row*2;
        this.x = Math.round(this.address.column * cellSize.x) + (cellSize.x / 3) + this.address.column*2;
    }

    getText(toshow) {
        let text = this.text;
        if (this.calculaction) {
            if (!this.calculaction.error) {
                text = `${this.calculaction.result}`;
                if (toshow) {
                    const parts = text.split(".");
                    if (parts[1] && parts[1].length > this.styles.roundTo) {
                        text = parseFloat(text);
                        text = text.toFixed(this.styles.roundTo);
                    }
                    if (this.styles.endSymbol) text += this.styles.endSymbol;
                }
            }
            else { text = this.calculaction.result }
        }
        return `${text}`;
    }

    focus(color = "#ffdb58ce") {
        ctx.strokeStyle = color;
        ctx.strokeRect(this.x + 2, this.y + 2, cellSize.x - 4, cellSize.y - 4);
    }

    unfocus() {
        ctx.clearRect(this.x + 1, this.y + 1, cellSize.x - 2, cellSize.y - 2); // in next
        this.fill();
    }

    clearData() {
        this.text = "";
        this.refresh();
    }

    refresh(auto) {
        if (this.text != this.oldtext) {
            if (!auto) this.sheet.timeline.addEvent(this, "text", this.oldtext, this.text);
            if (!this.calculaction) {
                if (this.text != undefined && this.text.charAt(0) == "=") {
                    this.calculaction = new Calculaction(this);
                    this.styles.textAlign = "right";
                }
            }
            else {
                if (this.text.charAt(0) != "=") {
                    this.calculaction.remove();
                    this.calculaction = false;
                    this.styles.textAlign = "left";
                }
                else {
                    this.calculaction.startScan(false);
                }
            }
        }
        else{
            if(!this.text && this.connected && this.connected.text){ return false }
        }
        let list = this.usedInCalculations;
        this.usedInCalculations = new Set();
        list.forEach(calculation => {
            calculation.startScan();
        })

        this.usedInCharts.forEach(chart => {
            chart.refresh(true);
        })
        this.oldtext = this.text;
        ctx.clearRect(this.x + 1, this.y + 1, cellSize.x - 2, cellSize.y - 2);
        this.fill();
    }

    draw() {
        this.redraw()
        // ctx.strokeStyle = this.styles.strokeColor;
        // ctx.strokeRect(this.x, this.y, cellSize.x, cellSize.y);
        if (this.styles.fillColor) this.fill();
    }

    fill(redraw) {
        if (this.styles.fillColor) {
            ctx.fillStyle = this.styles.fillColor;
            ctx.fillRect(this.x+1 , this.y , cellSize.x-1 , cellSize.y );
        }
        if (this.styles.strokeColor != this.styles.strokeColorOld || redraw) {
            this.redraw()
        }
        if(!redraw)this.writeText();
        if(this.connected) this.connected.refresh();
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
        ctx.font = this.styles.fontType + " " + this.styles.fontSize + " " + this.styles.fontFamily;
        if (this.text != undefined) {
            let text = this.getText(true);
            let buffor = text;
            let sizeX = cellSize.x;
            if(ctx.measureText(buffor).width > cellSize.x - 10){
                const cell = this.sheet.getCell(this.address.column+1,this.address.row);
                if(cell){
                    if(!cell.text || cell.text == ""){
                        ctx.fillStyle = this.styles.fillColor || "#212529";
                        ctx.fillRect(this.x+1 , this.y , cellSize.x*2 , cellSize.y );
                        this.connected = cell;
                        cell.connected = this;
                        sizeX = sizeX*2;
                    }
                }
            }
            else{
                if(this.connected){
                    let values = sortValues(this.connected.x,this.x)
                    ctx.clearRect(values.smaler,this.y,cellSize.x*2,cellSize.y);
                    this.connected.connected = false;
                    let buffor = this.connected;
                    this.connected = false;
                    buffor.redraw();
                    buffor.fill();

                    this.fill(true);
                }
            }

            while (ctx.measureText(buffor).width > sizeX - 10) { buffor = buffor.slice(0, buffor.length - 1); }
            let x;
            let y;
            if (this.styles.textAlign == "left") {
                x = this.x + 4;
                y = this.y + cellSize.y / 2 + parseInt(this.styles.fontSize) / 3;
                if (text != buffor) text = buffor + "..";
            }
            else if (this.styles.textAlign == "right") {
                y = this.y + cellSize.y / 2 + parseInt(this.styles.fontSize) / 3;
                if (text != buffor) text = buffor + "..";
                x = this.x + sizeX - ctx.measureText(text).width - 4;
            }
            else if (this.styles.textAlign == "center") {
                y = this.y + cellSize.y / 2 + parseInt(this.styles.fontSize) / 3;
                if (text != buffor) {
                    this.styles.textAlign = "left";
                    this.writeText();
                    return;
                };
                x = this.x + (sizeX / 2) - (ctx.measureText(text).width / 2) - 4;
            }
            ctx.fillStyle = this.styles.color;
            if(this.styles.constant) ctx.fillStyle = "#f757e2";
            ctx.fillText(text, x, y);
        }
    }
}

// CALC OBJECTS
class Calculaction {
    constructor(cell, elements) {
        if (elements) this.elements = elements;
        this.operators = ["^", "+", "-", "*", "/", "=", "<", ">"];
        this.cell = cell;
        this.error = false;
        this.usedCels = new Set();
        this.startScan(false);
    }

    throwError(code, additionalData) {
        if (this.error) this.error.remove();
        this.error = new ErrorPopover(this.cell, code, additionalData);
    }

    restartData() {
        if (this.error) this.error.remove();
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
            elements = this.createBracketsHierarchy(elements);
            elements = this.calculateFunctions(elements);
        };
        if (!this.error) { elements = this.createBracketsHierarchy(elements); };
        if (!this.error) { this.result = this.calculateElements(elements); };
        if (typeof this.result === "undefined") { this.throwError("FORM"); }
        if (this.error) {
            this.result = this.error.getResult();
        }
        else {
            if (typeof this.result == "number" && isNaN(this.result)) {
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
        let bracketsCount = 0;
        let bracketsStart = ["(", "[", "{"];
        let bracketsEnd = [")", "]", "}"];
        for (let element of elements) {
            if (bracketsStart.includes(element)) {
                bracketsCount ++;
                if (inbrackets > 0) { brackets[inbrackets].push("^BRACKET^") }
                inbrackets++;
                if (!brackets[inbrackets]) brackets[inbrackets] = [];
            }
            else if (bracketsEnd.includes(element)) {
                bracketsCount --;
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
        if(inbrackets != 0){
            this.throwError("BRACKET");
        } 
        else if(bracketsCount < -3){
            this.throwError("BRACKET+");
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
                        if (typeof a == "undefined" || typeof b == "undefined") console.log("Catched Error: some value in calculation is undefined");
                        if (isNaN(parseFloat(a)) || isNaN(parseFloat(b))) this.throwError("FORM");
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
                        if (isNaN(parseFloat(a)) || isNaN(parseFloat(b))) this.throwError("FORM");
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
                else if (operator == ">") {
                    if (equal == true) return this.throwError("FORM");
                    equal = ">";
                    result2 = variable;
                }
                else if (operator == "<") {
                    if (equal == true) return this.throwError("FORM");
                    equal = "<";
                    result2 = variable;
                }
                else {
                    return this.throwError("FORM");
                }

            }
            if (!equal) return result;

            switch (equal) {
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
                    if (res[0] == "@") {
                        this.throwError(res.slice(1), func.prefix);
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
                    if (res[0] == "@") {
                        this.throwError(res.slice(1), func.prefix);
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
                if (typeof element != "undefined") {
                    if (MathFunction.prototype.functions.has(element)) {
                        inFunc = true;
                        func = MathFunction.prototype.functions.get(element);
                        if (elements.length == 1) {
                            let res = func.func()
                            if (res[0] == "@") {
                                this.throwError(res.slice(1), func.prefix);
                                return 0;
                            };
                        }
                        if (i == elements.length - 1) {
                            let res = func.func()
                            if (res[0] == "@") {
                                this.throwError(res.slice(1), func.prefix);
                                return 0;
                            }
                            else {
                                buffor.push(res);
                            }
                        }
                    }
                    else {
                        if (isNaN(parseFloat(element)) && !allSymbols.includes(element)) {
                            let firstLetter = element[0]
                            if (firstLetter == "@") {
                                this.throwError("OTHER", element);
                            }
                            else if (firstLetter == "'") {
                                this.throwError("ERRCELL", element);
                            }
                            else if (firstLetter != `"`) {
                                if (typeof element != "boolean" && element != "true" && element != "false") this.throwError("ERRFUNC", element);
                            }
                        }
                        buffor.push(element);
                    }
                }
                else {
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
            if (char != "-" || lastChar == "-") {
                if (this.operators.includes(char) && this.operators.includes(lastChar)) { this.throwError("FORM"); break }
            }
            lastChar = char;

            if (buffor[0] == '"') {
                buffor += char;
                if (char == '"') {
                    elements.push(buffor);
                    buffor = "";
                }
            }
            else {

                if (bracketsStart.includes(char)) {
                    if(buffor.length != 0) elements.push(buffor);
                    buffor = "";
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
                            this.throwError("ERRCELL", buffor)
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

        if (isNaN(text) && text[0] != "@") {
            return `"${text.replace(`"`, '').replace(`"`, '')}"`
        }
        return text;
    }

    remove() {
        if (this.error) {
            this.error.remove();
        }
        for (let cell of this.usedCels) {
            cell.usedInCalculations.delete(this);
        }
    }
}

class CalculationError {
    constructor(code, description, result, title) {
        if (!CalculationError.prototype.codes) CalculationError.prototype.codes = new Map();
        this.description = description;
        this.result = result + " ";
        this.title = title;
        CalculationError.prototype.codes.set(code, this);
    }
}

//A cell popover is a small circular element that attaches to the upper right corner of a cell
//and is used to display errors and comments;

class CellPopover{
    constructor(cell,title,text,color){
        this.element = document.createElement("a");
        this.element.classList.add("cell-popover");
        this.element.style.left = `${cell.x + cellSize.x - 10}px`;
        this.element.style.top = `${cell.y}px`;
        this.element.style.backgroundColor = color;
        this.title = title;
        this.text = text;
        this.cell = cell;
        this.cell.sheet.cellPopovers.add(this);

        this.element.setAttribute("data-bs-toggle", "popover");
        this.element.setAttribute("title", title);
        this.element.setAttribute("data-bs-content", text);
        this.element.setAttribute("tabindex", "0");
        this.element.setAttribute("data-bs-trigger", "hover");

        new bootstrap.Popover(this.element);
        canvasContainer.appendChild(this.element);
    }

    remove() {
        this.cell.sheet.cellPopovers.delete(this);
        this.element.remove()
    }
}

class ErrorPopover extends CellPopover{
    constructor(cell, code, additionalData = false){
        let error = CalculationError.prototype.codes.get(code);
        if(!error) return false;
        let description = error.description;
        if(additionalData) description = description + additionalData;
        super(cell,error.title,description,"#ff0a0ab3")
        this.result = error.result;
        this.element.classList.add("error-popover");
    }

    getResult() {
        return this.result;
    }
}

//StyleList Working like css on cells or widgets.
class StyleList {
    constructor(otherList) {
        this.fontFamily = "arial";
        this.fontType = "normal";
        this.fontSize = "12px";
        this.textAlign = "left";
        this.roundTo = 2;
        this.color = "#ffffff";
        this.fillColor = false;
        this.strokeColor = "#606060";
        if(otherList) this.loadList(otherList);
    }

    loadList(otherList){
        for(let key of Object.keys(otherList)){
            this[key] = otherList[key];
        }
    }
}

class StyleListCell extends StyleList{
    constructor(otherList){
        super(otherList)
        this.strokeColorOld = false;
        this.endSymbol = "";
        this.fillColor = "#212529"
        if(otherList) this.loadList(otherList);
    }
}

class StyleListFilled extends StyleList {
    constructor(otherList) {
        super(otherList)
        this.strokeColor = false;
        this.chartStyles = "210, 180, 222";
        this.percentMode = false;
        this.beTransparent = false;
        this.fillColor = "#eeeeee";
        this.color = "#000000";
        this.fontSize = "20px";
        if(otherList) this.loadList(otherList);
    }
}

class StyleListFlush extends StyleList {
    constructor(otherList) {
        super(otherList)
        this.strokeColor = false;
        this.chartStyles = "210, 180, 222";
        this.percentMode = false;
        this.beTransparent = true;
        this.fillColor = "transparent";
        if(otherList) this.loadList(otherList);
    }
}

//ACTIONS
function afterCellEdit(){
    canvas.classList.remove("cursor-addCell");
    if(selector.selected){
        selector.selected.refresh();
        selector.selected = false;
        hideFunctions();
    }
    if(selector.selectedCells.size > 0){
        selector.resetOldData();
    }
    display.restartData();
    cellInput.hide();
}

// CANVAS FUNCTIONS
function resizeCanvas() {
    canvas.width = (27 * cellSize.x) - cellSize.x/3 + 15;
    canvas.height = 501 * cellSize.y + 1000 + 1;
}

function clearCanvas() {
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
            top: y * cellSize.y - canvasContainer.offsetHeight / 2,
            left: x * cellSize.x - canvasContainer.offsetWidth / 2,
            behavior: "smooth",
        });
        const newCell = selectedSheet.cells.get(`${String.fromCharCode(x + 65)}:${y}`);
        if (newCell) {
            selector.switchCell(newCell)
            cellInput.upd
        }
    }

}

function callHyperlink() {
    let url = selector.selected.styles.hyperlink;
    if (!url.includes("http")) {
        url = "http://" + url;
    }
    window.open(url, "_blank");
}

function trimText(text, maxWidth, ctx) {
    while (ctx.measureText(text).width > maxWidth) { text = text.slice(0, text.length - 1); }
    return text
}

