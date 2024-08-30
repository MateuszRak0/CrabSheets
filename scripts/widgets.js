function addStaticWidget(constructor){
    const cells = selector.getSelected();
    let error = false;
    if(cells.length > 0){
        for(let cell of cells){
            if(!cell.getText() && !cell.locked){
                let result = new constructor(false,false,cell);
                if(result === undefined){
                    error = true;
                }
            }
            else{
                error = true
            }
        }
    }
    else{
        sysMsg_error_insert.show();
    }
    if(error) sysMsg_error_insert2.show();
}

const widgetTools_base = {
    selectedWidget:false,
    editorNode:document.getElementById("widgetTools_base"),
    removeWidgetBtn:document.getElementById("removeWidgetBtn"),
    nextFunc:false,
    startX:0,
    startY:0,
    margX:0,
    margY:0,

    positionEditor:function(){
        if(this.selectedWidget){
            this.editorNode.classList.remove("hidden");
            this.editorNode.style.left = `${parseInt(this.selectedWidget.container.style.left)-1}px`;
            this.editorNode.style.top = `${parseInt(this.selectedWidget.container.style.top)-1}px`;
            this.editorNode.style.width = `${this.selectedWidget.container.clientWidth+5}px`;
            this.editorNode.style.height = `${this.selectedWidget.container.clientHeight+5}px`;
            if(this.selectedWidget.moving) changeFontSizesOptions(true);
            
        }
    },

    unselectWidget:function(switched=false){
        if(this.selectedWidget){
            if(this.selectedWidget.tools && !switched){
                this.selectedWidget.tools.hide();
                changeFontSizesOptions();
            } 
            this.selectedWidget.container.classList.remove("active");
            this.selectedWidget = false;
            this.editorNode.classList.add("hidden");
        }
    },

    actionStart:function(e,widget){
        if(this.selectedWidget){
            if(this.selectedWidget == widget && widget.moving){
                this.startMove(e);
            }
            else{
                if(this.selectedWidget.type == widget.type){
                    this.unselectWidget(true);
                }
                else{
                    this.unselectWidget();
                }
                this.selectedWidget = widget;
                this.selectedWidget.container.classList.add("active")
                this.positionEditor();
                StyleInput.loadCell(widget);
                afterCellEdit();
            }
        }
        else{
            this.selectedWidget = widget;
            StyleInput.loadCell(widget);
            this.selectedWidget.container.classList.add("active")
            this.positionEditor();
            afterCellEdit()
        }

    },

    actionMove:function(e){
        if(this.nextFunc){ this.nextFunc(e) }
    },

    actionEnd:function(e){
        if(this.nextFunc){
            if(this.nextFunc == this.inResize){
                this.selectedWidget.container.classList.remove("resizing");
                this.selectedWidget.refresh();
            } 
            this.positionEditor();
            selector.blocked = false;
         }
        this.nextFunc = false;

    },

    startMove:function(e){
        this.margX = e.offsetX;
        this.margY = e.offsetY;
        this.nextFunc = this.inMove;
        this.editorNode.classList.add("hidden");
        selector.blocked = true;
    },

    inMove:function(e){
        let left = e.clientX - this.margX + canvasContainer.scrollLeft;
        let clientY = e.clientY - canvasContainer.offsetTop;
        let top = clientY - this.margY + canvasContainer.scrollTop ;
        if(top < 0){ top = 0; }
        else if(top + this.selectedWidget.container.offsetHeight > canvas.height){top = canvas.height - this.selectedWidget.container.offsetHeight};
        if(left < 0){ left = 0;}
        else if(left + this.selectedWidget.container.offsetWidth > canvas.width){left = canvas.width - this.selectedWidget.container.offsetWidth};
        this.selectedWidget.container.style.left =`${left}px`;
        this.selectedWidget.container.style.top =`${top}px`;
    },

    resizeStart:function(e){
        if(this.selectedWidget.moving){
            this.selectedWidget.container.classList.add("resizing");
            this.startX = this.selectedWidget.container.offsetLeft ;
            this.startY = this.selectedWidget.container.offsetTop;
            this.nextFunc = this.inResize
            this.editorNode.classList.add("hidden")
            selector.blocked = true;
        }
    },

    inResize:function(e){
        let left; let width;
        let top; let height;
        let pageY = e.pageY - canvasContainer.offsetTop + canvasContainer.scrollTop;
        let pageX = e.pageX + canvasContainer.scrollLeft ;
        
        if(pageX > this.startX){
            left = this.startX;
            width = pageX  - this.startX;
        }
        else{
            left =pageX ;
            width = this.startX - pageX ;
        }
        
        if(pageY > this.startY){
            top = this.startY;
            height = pageY - this.startY;
        }
        else{
            top = pageY;
            height = this.startY - pageY;
        }

        let checkedSize = this.selectedWidget.checkSize(width,height);
        width = checkedSize.x;
        height = checkedSize.y;
        this.selectedWidget.container.style.left = `${left}px`;
        this.selectedWidget.container.style.width = `${width}px`;
        this.selectedWidget.container.style.top = `${top}px`;
        this.selectedWidget.container.style.height = `${height}px`;

    },

    removeWidget:function(){
        if(this.selectedWidget){
            let buffor = this.selectedWidget;
            this.unselectWidget();
            buffor.destroy();
        }
    }
}

class WidgetTools{
    constructor(offcanvasNode){
        this.widgetObject;
        if(offcanvasNode.classList.contains("offcanvas")){
            this.widgetObject = new bootstrap.Offcanvas(offcanvasNode);
        }
        else{
            this.widgetObject = new bootstrap.Collapse(offcanvasNode, {
                toggle: false
              });
        }
        
        this.selectedWidget = false;
    }

    show(widget){
        if(widget != this.selectedWidget){
            this.selectedWidget = widget;
        }
        this.loadData();
        this.widgetObject.show();
    }

    hide(){
        this.widgetObject.hide();
    }

    loadData(){
    }
}

const mainContent = document.getElementById("mainContent");
const widgetTools_chart = new WidgetTools(document.getElementById("widgetTool-chart"));
const widgetTool_variableData = new WidgetTools(document.getElementById("offcanvas-variable-data"));
const widgetTool_progressBar = new WidgetTools(document.getElementById("collapse-progressBar"));

// Widgets / Components
class Widget{
    constructor(sheet,loadedWidget){
        this.styles = new StyleListFilled();
        this.container = document.createElement("div");
        this.sheet = sheet || selectedSheet;
        canvasContainer.appendChild(this.container);
        this.container.addEventListener("mousedown",(e)=>{
            widgetTools_base.actionStart(e,this);
            if(this.tools){ this.tools.show(this)};
        });
        if(loadedWidget){
            this.container.style.left = loadedWidget.posX;
            this.container.style.top = loadedWidget.posY;
            this.container.style.width = loadedWidget.sizeX;
            this.container.style.height = loadedWidget.sizeY;
            this.styles = new this.styles.constructor(loadedWidget.styles);
        }
        this.sheet.widgets.add(this)
    }

    show(){
        canvasContainer.appendChild(this.container);
    }

    hide(){
        if(widgetTools_base.selectedWidget) widgetTools_base.unselectWidget();
        canvasContainer.removeChild(this.container);
    }

    refresh(){
        //Only Declaration here
    }

    checkSize(x,y){
        if(x > this.maxSize.x) x = this.maxSize.x;
        if(y > this.maxSize.y) y = this.maxSize.y;
        return {x:x,y:y}
    }

    destroy(){
        this.container.removeEventListener("mousedown",(e)=>{
            widgetTools_base.actionStart(e,this);
            if(this.tools){ this.tools.show(this)};
        });
        this.container.remove();
        selectedSheet.widgets.delete(this);
    }

    packToSaving(){
        return {
            posX:this.container.style.left,
            posY:this.container.style.top,
            sizeX:this.container.style.width,
            sizeY:this.container.style.height,
            styles:this.styles,
        }
    }

    refreshStyles(){
        let fillColor =  this.styles.fillColor || "transparent";
        this.container.style.backgroundColor = fillColor;
        if(this.styles.strokeColor){
            this.container.style.border = `3px solid ${this.styles.strokeColor}`;
        }
        else{
            this.container.style.border = "";
        }
    }
}

// Static ( pined to cell )
class WidgetStatic extends Widget{
    constructor(sheet,loadedWidget,cell){
        super(sheet,loadedWidget);
        this.cell = cell;
        if(loadedWidget && !cell) this.cell = sheet.cells.get(loadedWidget.pinedTo);
        this.cell.locked = this; // Lock cell under the widget to prevent click on it
        this.container.classList.add("static-widget");
        this.container.style.left = `${this.cell.x}px`;
        this.container.style.top = `${this.cell.y}px`;
    }

    packToSaving(){
        const buffor = super.packToSaving();
        buffor.pinedTo = this.cell.stringAddress;
        return buffor
    }

    destroy(){
        this.cell.locked = false;
        super.destroy();
    }
}

class WidgetVariableData extends WidgetStatic{
    constructor(sheet,loadedWidget,cell){
        super(sheet,loadedWidget,cell);
        this.styles = new StyleListFlush();
        this.type="VARDATA";
        this.tools = widgetTool_variableData;
        this.select = document.createElement("select");
        this.select.addEventListener("input",()=>{this.loadDataToCells(false)})
        this.container.appendChild(this.select);
        this.container.classList.add("switchTable");
        this.options = {};
        this.usedCells = [];
        this.value = 0;

        if(loadedWidget){
            for(let i=0; i < Object.values(loadedWidget.data).length; i++){
                const option = Object.values(loadedWidget.data)[i]
                this.addOption(i,option.name,option.data)
            }
            this.loadDataToCells(true);
            
        }
        else{
            this.addOption(0);
        }
    }

    refreshStyles(){
        this.select.style.textAlign = this.styles.textAlign;
        this.select.style.color = this.styles.color;
        this.select.style.fontSize = this.styles.fontSize;
        this.select.style.textDecoration = this.styles.fontType;
        this.select.style.fontFamily = this.styles.fontFamily;
        super.refreshStyles()
    }

    loadDataToCells(firstLoad){
        if(!firstLoad) this.saveDataFromCells(this.select.value);
        this.value = this.select.value;
        const actualOption = this.options[this.value];
            if(actualOption){
                if(actualOption.data.length > 0){
                    for(let data of actualOption.data){
                        if(this.usedCells.includes(data.cell)){
                            data.cell.text = data.text;
                            data.cell.refresh();
                        }
                    }
                }
                else{
                    for(let cell of this.usedCells){
                        cell.text = "";
                        cell.refresh();
                    }
                }
                
            }
    }

    saveDataFromCells(){
        const oldOption = this.options[this.value];
        if(!oldOption) return false
        oldOption.data = [];
        for(let cell of this.usedCells){
            oldOption.data.push({cell:cell,text:cell.text})
        }
        return true
    }

    updata(names){
        this.usedCells = selector.getSelected();
        if(!this.usedCells) this.usedCells = [];
        for(let i = 0; i<names.length; i++){
            const name = names[i];
            const option = this.options[i];
            if(!option){ this.addOption(i,name) }
            else{ option.label.innerHTML = name } 
        }
    }

    addOption(id,name = "Zakres 1",optionData){
        let option = document.createElement("option");
        option.innerHTML = name;
        option.value = Object.keys(this.options).length;
        this.select.appendChild(option);
        if(!optionData){
            this.options[id] = { label:option, data:[]};
        }
        else{
            let dataSet = [];
            for(let data of optionData){
                const cell = this.sheet.getCell(data.cell.column,data.cell.row);
                if(!this.usedCells.includes(cell)) this.usedCells.push(cell);
                dataSet.push( {cell:cell, text:data.text} )
            }
            this.options[id] = { label:option, data:dataSet};
        } 
        
    }

    packToSaving(){
        const buffor = super.packToSaving();
        buffor.type = "VARTABLE";
        buffor.data = { };
        for(let optionID of Object.keys(this.options)){
            const option = this.options[optionID];
            buffor.data[optionID] = {
                name:option.label.innerHTML,
                data:[]
            }
            for(let data of option.data){
                data.cell = data.cell.address;
                buffor.data[optionID].data.push( data )
            }
        }
        return buffor
    }

    destroy(){
        this.select.removeEventListener("input",()=>{this.loadDataToCells(false)})
        super.destroy();
    }
}

class WidgetProgressBar extends WidgetStatic{
    constructor(sheet,loadedWidget,cell){
        super(sheet,loadedWidget,cell);
        this.tools = widgetTool_progressBar;
        this.type="PROGRESS";
        this.container.classList.add("progress");
        this.progress = document.createElement("div");
        this.progress.classList.add("progress-bar","progress-bar-striped");
        this.container.appendChild(this.progress);
        this.usedCells = new Set();
        this.data = {
            min:0,
            actual:50,
            max:100,
        }

        if(loadedWidget){
            this.data.min = loadedWidget.data.min;
            this.data.max = loadedWidget.data.max;
            this.data.actual = loadedWidget.data.actual;
        }
        else{
            this.styles.fillColor = "#007bff";
        }
        this.refreshStyles();
        this.refresh();
    }

    changeValue(max,min,actual){
        const length = (max-min);
        let step = (actual / Math.abs(length)) * 100;
        if(step < 0){  this.progress.classList.add("bg-danger")}
        else{ this.progress.classList.remove("bg-danger") }
        step = `${step.toFixed(2)}%`;
        this.progress.style.width = step;
        this.progress.innerHTML = step;
    }

    lookForCellAddress(value){
        let cell = lookForCellAddress(value,this.sheet);
        if(cell){
            this.usedCells.add(cell);
            cell.usedInCharts.add(this);
            let text = cell.getText();
            if(text.length == 0) text = 0;
            return text
        }
    else{
        return value
    }
    }

    update(){
        for(let cell of this.usedCells){ cell.usedInCharts.delete(this); }
        this.usedCells = new Set();
        this.refresh();
    }

    refresh(){
        let max = this.lookForCellAddress(this.data.max);
        let min = this.lookForCellAddress(this.data.min);
        let actual = this.lookForCellAddress(this.data.actual);
        this.changeValue(max,min,actual);
    }

    refreshStyles(){
        this.progress.style.color = this.styles.color;
        this.progress.style.backgroundColor = this.styles.fillColor
        if(this.styles.strokeColor){
            this.container.style.border = `3px solid ${this.styles.strokeColor}`;
        }
    }

    packToSaving(){
        const buffor = super.packToSaving();
        buffor.type = "PROGRESS";
        buffor.data = this.data;
        return buffor
    }
}

class WidgetCheckBox extends WidgetStatic{
    constructor(sheet,loadedWidget,cell){
        super(sheet,loadedWidget,cell);
        this.styles = new StyleListFlush();
        this.type="CHECKBOX";
        this.container.classList.add("widget-checkbox");
        this.checkbox = document.createElement("input");
        this.checkbox.type = "checkbox";
        this.container.appendChild(this.checkbox);
        if(loadedWidget){
            this.checkbox.checked = loadedWidget.data.checked;
        }
    }
    
    refreshStyles(){
        super.refreshStyles();
        this.input.style.color = this.styles.color;
    }

    packToSaving(){
        const buffor = super.packToSaving();
        buffor.type = "CHECKBOX";
        buffor.data = {
            checked:this.checkbox.checked,
        };
        return buffor
    }
}

// Interactive ( Moving and resize)
class WidgetInteractive extends Widget{
    constructor(sheet,loadedWidget){
        super(sheet,loadedWidget);
        if(!loadedWidget){
            this.container.style.left = `${100+canvasContainer.scrollLeft}px`; this.container.style.top = `${100+canvasContainer.scrollTop}px`;
            this.container.style.width = "200px"; this.container.style.height = "140px";
        }
        this.container.classList.add("interacive-widget");
        this.moving = true;
        this.maxSize = {
            x:999,
            y:999,
        }
    }
}

//Header
class WidgetHeader extends WidgetInteractive{
    constructor(sheet,loadedWidget){
        super(sheet,loadedWidget);
        this.type="TEXT";
        this.container.classList.add("widget-header");
        this.textInput = document.createElement("textarea");
        this.textInput.value = "Naciśnij aby zmienić Tekst";
        if(loadedWidget) this.textInput.value = loadedWidget.data;
        this.container.appendChild(this.textInput);
        this.styles.textAlign = "center";
        this.refreshStyles();
    }

    refreshStyles(){
        this.textInput.style.textAlign = this.styles.textAlign;
        this.textInput.style.color = this.styles.color;
        this.textInput.style.fontSize = this.styles.fontSize;
        this.textInput.style.textDecoration = this.styles.fontType;
        this.textInput.style.fontFamily = this.styles.fontFamily;
        super.refreshStyles()
    }

    destroy(){
        this.textInput.removeEventListener("input",(e)=>{console.log(e)})
        super.destroy();
    }

    packToSaving(){
        const buffor = super.packToSaving();
        buffor.type = "TEXT";
        buffor.data = this.textInput.value;
        return buffor
    }
}

//Chart widget
class WidgetChart extends WidgetInteractive{
    constructor(chartObject,sheet,loadedWidget){
        super(sheet,loadedWidget);
        this.chartObject = chartObject;
        this.type="CHART";
        this.canvas = document.createElement("canvas");
        this.container.appendChild(this.canvas);
        this.tools = widgetTools_chart;
        this.ctx = this.canvas.getContext("2d");
        this.container.classList.add("widget-chart");
        if(!loadedWidget){
            this.styles.chartStyles = "210, 180, 222";
            this.styles.beTransparent = false;
            this.styles.percentMode= false;
        }
        this.refresh(true);
        
    }

    refreshStyles(){
        this.refresh()
        if(this.styles.beTransparent){this.styles.fillColor = "transparent"}
        else if(!this.styles.beTransparent && this.styles.fillColor == "transparent"){
            this.styles.fillColor = "#ffffff";
        }
        super.refreshStyles();
    }

    refresh(firstLoad){
        let width = this.container.offsetWidth;
        let height = this.container.offsetHeight;
        if(this.styles.strokeColor){
            width = width - 6;
            height = height - 6;
        }
        this.canvas.width = width;
        this.canvas.height = height;
        if(!firstLoad) this.chartObject.refresh();
    }

    clearCanvas(){
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    }

    destroy(){
        this.chartObject.destroy();
        this.canvas.remove();
        super.destroy();
    }

    show(){
        super.show();
        this.refresh();
    }

    packToSaving(){
        const buffor = super.packToSaving();
        buffor.type = "CHART";
        buffor.chartType = this.chartObject.type;
        buffor.data = this.chartObject.pairs;
        return buffor
    }
}

class WidgetNewChart extends WidgetInteractive{
    constructor(sheet,loadedWidget){
        super(sheet,loadedWidget);
        this.container.classList.add("d-flex","align-items-end")
    }

    addBar(percent){
        let bar = document.createElement("div");
        bar.style.width = '15px';
        bar.style.height = `${percent}%`;
        bar.style.marginRight = '5px';
        bar.style.backgroundColor = "#ff0000"
        this.container.appendChild(bar);
    }
}

//Progress Bar
widgetTool_progressBar.loadData = function(){
    document.getElementById("progressBar-min").value = this.selectedWidget.data.min;
    document.getElementById("progressBar-max").value = this.selectedWidget.data.max;
    document.getElementById("progressBar-actual").value = this.selectedWidget.data.actual;
}

widgetTool_progressBar.apply = function(){
    if(this.selectedWidget){
        this.selectedWidget.data.min =  document.getElementById("progressBar-min").value;
        this.selectedWidget.data.max = document.getElementById("progressBar-max").value;
        this.selectedWidget.data.actual =  document.getElementById("progressBar-actual").value;
        this.selectedWidget.update();
    }
}

//VariableData
widgetTool_variableData.dataInputs = [];

widgetTool_variableData.loadData = function(){
    this.clearData()
    for(let option of Object.values(this.selectedWidget.options)){
        this.addDataInput(option.label.innerHTML);
    }
    selector.resetOldData();

    if(this.selectedWidget.usedCells){
        for(let cell of this.selectedWidget.usedCells){ selector.addAreaCell(cell) }
    } 
}

widgetTool_variableData.addDataInput = function(name){
    this.dataInputs.push(new DataInput( name, document.getElementById("variableDataOptions"), false ));
}

widgetTool_variableData.clearData = function(){
    this.dataInputs.forEach(input => { input.destroy() });
    this.dataInputs = [];
}

widgetTool_variableData.apply = function(){
    let values = [];
    for(let dataInput of this.dataInputs){
        values.push(dataInput.getData())
    }
    this.selectedWidget.updata(values)
}

//resize Main-content to make place for a widget 
const contentResizer = {
    showed:false,
    changedWidth:false,
    addMonitor:function(node,bootstrapOBJ){
        node.addEventListener("shown.bs.offcanvas",(e)=>{this.show(e,bootstrapOBJ)});
        node.addEventListener("hidden.bs.offcanvas",(e)=>{this.hide(e)});
    },

    show(node,bootstrapOBJ){
        if(parseInt(window.innerWidth) <= 600) return false;
        const target = node.target;
        this.showed = bootstrapOBJ;
        mainContent.style.width = `${window.innerWidth - target.offsetWidth}px`;
        if(widgetTools_base.selectedWidget) this.scrollPosition(target);
    },

    scrollPosition(target){
        if(widgetTools_base.selectedWidget.container.offsetLeft + widgetTools_base.selectedWidget.container.offsetWidth/2 > canvasContainer.offsetWidth + canvasContainer.scrollLeft  - target.offsetWidth){
            let newPos = canvasContainer.scrollLeft + target.offsetWidth;
            canvasContainer.scroll({
                top: canvasContainer.scrollTop,
                left: newPos,
                behavior: "smooth",
              });
            this.changedWidth = target.offsetWidth;
        }
        else{
            this.changedWidth = false;
        }
    },

    scrollPositionBack(){
        if(this.changedWidth){
            let newPos = canvasContainer.scrollLeft - this.changedWidth;
            canvasContainer.scroll({
                top: canvasContainer.scrollTop,
                left: newPos,
                behavior: "smooth",
              });
            this.changedWidth = false;
        }
    },

    hide(e){
        if(parseInt(window.innerWidth) <= 600) return false;
        if(e.target != this.showed._element) return false
        mainContent.style.width = "";
        this.showed = false;
        this.scrollPositionBack()
    },

    resize(){
        if(this.showed){
            mainContent.style.width = `${window.innerWidth - this.showed._element.offsetWidth}px`;
        }
    }
}

contentResizer.addMonitor(document.getElementById("widgetTool-chart"),widgetTools_chart.widgetObject);
contentResizer.addMonitor(document.getElementById("offcanvas-variable-data"),widgetTool_variableData.widgetObject);
contentResizer.addMonitor(document.getElementById("offcanvas-styleTable"),new bootstrap.Offcanvas(document.getElementById("offcanvas-styleTable")));
contentResizer.addMonitor(document.getElementById("offcanvas-insert-timeline"),new bootstrap.Offcanvas(document.getElementById("offcanvas-insert-timeline")));

addEventListener("resize",contentResizer.resize.bind(contentResizer))


//HANDLERS
for(let btn of document.getElementsByClassName("widget-remove-btn")){
    btn.addEventListener("click",()=>{widgetTools_base.removeWidget()})
}


for(let btn of document.getElementsByName("insert-checkBox")){
    btn.addEventListener("click",()=>{ addStaticWidget(WidgetCheckBox)});
}

for(let btn of document.getElementsByName("insert-progressBar")){
    btn.addEventListener("click",()=>{ addStaticWidget(WidgetProgressBar)});
}

document.getElementById("insert-variableData").addEventListener("click",()=>{ addStaticWidget(WidgetVariableData)});
document.getElementById("addWidget-header").addEventListener("click",()=>{ new WidgetHeader()});
document.getElementById("chart-approve-changes").addEventListener("click",(e)=>{widgetTools_chart.apply(e)});
document.getElementById("chartData-addData").addEventListener("click",()=>{widgetTools_chart.addData()});
document.getElementById("variableData-add-set").addEventListener("click",()=>{widgetTool_variableData.addDataInput("Zakres bez nazwy")})
document.getElementById("variableData-save-data").addEventListener("click",()=>{widgetTool_variableData.apply()})

document.getElementById("progressBar-min").addEventListener("click",(e)=>{selector.selectInput(e)});
document.getElementById("progressBar-max").addEventListener("click",(e)=>{selector.selectInput(e)});
document.getElementById("progressBar-actual").addEventListener("click",(e)=>{selector.selectInput(e)});
document.getElementById("progressBar-apply").addEventListener("click",()=>{widgetTool_progressBar.apply()})