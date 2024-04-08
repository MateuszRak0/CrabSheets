//Display
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
            if(value && value.length > 0){
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

const fileInfo = {
    dateNode: document.getElementById("file-date"),
    nameNode: document.getElementById("file-name"),
    authorNode: document.getElementById("file-author"),
    descriptionNode: document.getElementById("file-description"),

    load: function () {
        if (openedFile) {
            this.dateNode.value = openedFile.creationDate;
            this.authorNode.value = openedFile.author;
            this.nameNode.value = openedFile.name;
            this.descriptionNode.value = openedFile.description;
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

class StyleInput_CheckBox extends StyleInput{
    constructor(checkbox,styleName){
        super(styleName)
        this.checkbox = checkbox;
        checkbox.addEventListener("input",(e)=>{this.apply(e)})
    }

    load(cell){
        let value = cell.styles[this.styleName];
        if(value == true){
            this.checkbox.checked = true;
        }
        else{
            this.checkbox.checked = false;
        }
    }

    apply(e){
        super.apply({target:{value:e.target.checked}});
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

// 
function changeFontSizesOptions(biger = false) {
    for (let option of fontSizeOptions) {
        (biger) ? option.disabled = false : option.disabled = true;
    }
}

function downloadFile() {
    if (openedFile) {
        let data = openedFile.packToSaving();
        let file = new Blob([data], { type: "text/plain" })
        let a = document.createElement("a");
        a.href = URL.createObjectURL(file);
        a.download = openedFile.name + ".json";
        a.click();
    }
}

function loadFile(e) {
    if (e.target.files.length > 1) { console.log("ZA DUZO PLIKOW"); }
    else {
        let file = e.target.files[0];
        let reader = new FileReader();
        reader.onload = handleLoadedFile
        reader.readAsText(file);
    }
}

function handleLoadedFile(e) {
    let loadedData = e.target.result;
    loadedData = JSON.parse(loadedData);
    console.dir(loadedData)
}

function insertTimeData(e) {
    if (selector.selected) {
        selector.selected.text = e.target.value;
        selector.selected.refresh();
        display.showData(selector.selected);
        cellInput.show(selector.selected);
    }
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

document.getElementById("input-insert-date").addEventListener("click", (e) => { e.target.showPicker() })
document.getElementById("input-insert-time").addEventListener("click", (e) => { e.target.showPicker() })
document.getElementById("input-insert-date").addEventListener("input", insertTimeData)
document.getElementById("input-insert-time").addEventListener("input", insertTimeData)