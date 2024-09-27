const chartDataList = document.getElementById("chartData-list");

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }

function renderChartColors2(r,g,b,steps){
    if(!steps) return  "#" + componentToHex(parseInt(r)+10) + componentToHex(parseInt(g)+10) + componentToHex(parseInt(b)+10);
    let multiper = Math.min(r,g,b)/steps;
    let colors = [];
    for(let step = 1; step<steps+1; step++){
        let newR = Math.round(r - step*multiper);
        let newG = Math.round(g - step*multiper);
        let newB = Math.round(b - step*multiper);
        let color =  "#" + componentToHex(newR) + componentToHex(newG) + componentToHex(newB);
        colors.push(color);
    } 
    
    return colors
}

function renderChartColors(r,g,b,steps){
    if(!steps) return  "#" + componentToHex(parseInt(r)+10) + componentToHex(parseInt(g)+10) + componentToHex(parseInt(b)+10);
    let multiper = Math.min(r,g,b)/steps;
    let colors = [];
    for(let step = 1; step<steps+1; step++){
        let newR = Math.round(r - step*multiper);
        let newG = Math.round(g - step*multiper);
        let newB = Math.round(b - step*multiper);
        let color =  "#" + componentToHex(newR) + componentToHex(newG) + componentToHex(newB);
        colors.push(color);
    } 
    
    return colors
}

function lookForCellAddress(value,sheet){
    if(value[0] == cellSymbol){
        value = value.substring(1)
        let cell = sheet.cells.get(value);
        if(cell){
            return cell
        }
    }
    else{
        return false
    }
}

class ChartData{
    constructor(key,value,parent){
        this.parent = parent;
        this.container = document.createElement("li");
        this.container.classList.add("chartData");
        this.inputKey = document.createElement("input");
        this.inputKey.placeholder = "Etykieta / X";
        this.inputValue = document.createElement("input");
        this.inputValue.placeholder = "Wartość / Y";
        this.inputKey.addEventListener("click",(e)=>{selector.selectInput(e)});
        this.inputValue.addEventListener("click",(e)=>{selector.selectInput(e)});
        this.removeBtn = document.createElement("button");
        this.removeBtn.classList.add("icon-cancel", "btn-dark","btn");
        this.removeBtn.addEventListener("click",(e)=>{this.destroy()});
        this.container.appendChild(this.inputKey);
        this.container.appendChild(this.inputValue);
        this.container.appendChild(this.removeBtn);
        chartDataList.appendChild(this.container);
        this.updateData(key,value);
    }

    updateData(key,value){
        if(key) this.inputKey.value = key;
        if(value) this.inputValue.value = value;
    }

    destroy(whenShow){
        this.unselectCell(this.inputKey.value,whenShow);
        this.unselectCell(this.inputValue.value,whenShow);
        this.inputKey.removeEventListener("click",(e)=>{selector.selectInput(e)});
        this.inputValue.removeEventListener("click",(e)=>{selector.selectInput(e)});
        this.removeBtn.removeEventListener("click",(e)=>{this.destroy()});
        this.inputKey.remove();
        this.inputValue.remove();
        this.removeBtn.remove();
        this.parent.dataList.delete(this)
        this.container.remove();
    }

    unselectCell(address,whenShow){
        if(address[0] == cellSymbol){
            let cell = selectedSheet.cells.get(address.substring(1));
            cell.unfocus();
            if(!whenShow) cell.focus("#ff5858ce");
        }
    }

    getData(){
        let key = this.inputKey.value || " ";
        let value = this.inputValue.value || false;
        if(!key && !value) return false
        return {label:key,y:value}
    }
}

class Chart{
    constructor(sheet,loadedChart,type){
        this.sheet = sheet;
        this.type = type;
        this.id = "chart_"+new Date().getTime().toString(16);
        this.widget = new WidgetChart(this,sheet,loadedChart);
        this.pairs = []; // Before Unpack
        this.data = []; // After Unpack
        this.title = "";
        this.theme = "light1"
        this.usedCells = new Set();
        if(loadedChart){
            this.type = loadedChart.chartType;
            this.title = loadedChart.title;
            this.pairs = loadedChart.data;
            this.theme = loadedChart.theme;
            this.unpackPairs();
        }
        this.init()
    }

    init(){
        this.canvasJS_chart = new CanvasJS.Chart( this.id, {
            title:{
                text: this.title
            },
            data: [
            {
                type: this.type,
                dataPoints: this.data
            }
            ],
            theme: this.theme,
        });
        this.canvasJS_chart.render()
    }

    clearOldData(){
        for(let cell of this.usedCells){ cell.usedInCharts.delete(this); }
        this.usedCells = new Set();
    }

    update(pairs,title){
        this.title = title;
        this.clearOldData();
        this.pairs  = pairs;
        this.unpackPairs();
        this.refresh();
    }

    unpackPairs(){
        this.data = [];
        for(let pair of this.pairs){
            let unpackedData = {};
            unpackedData.label = this.lookForCellAddress( pair.label );
            unpackedData.y = parseFloat( this.lookForCellAddress(pair.y) );
            this.data.push(unpackedData);
        }
    }

    lookForCellAddress(value){
        let cell = lookForCellAddress(value,this.widget.sheet);
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

    changeTitle(){
        if(!this.title){
            delete this.canvasJS_chart.options.title.text
        }
        else{
            this.canvasJS_chart.options.title.text = this.title;
        }
    }

    changeType(){
        this.canvasJS_chart.options.data[0].type = this.type;
        this.canvasJS_chart.render()
    }

    changeTheme(){
        this.canvasJS_chart.options.theme = this.theme;
        this.canvasJS_chart.render()
    }

    refresh(updateValues){
        if(updateValues) this.unpackPairs();
        this.changeTitle();
        this.canvasJS_chart.options.data[0].dataPoints = this.data;
        this.canvasJS_chart.render()
    }
}

// CHART TOOLS
widgetTools_chart.dataListNode = document.getElementById("chartData-list");
widgetTools_chart.dataList = [];
widgetTools_chart.error = new bootstrap.Toast(document.getElementById("sysMsg-error-chart"));

widgetTools_chart.clearData = function(){
    this.dataList.forEach(element => {
        element.destroy(true);
    });
    this.dataList = new Set();
}

widgetTools_chart.addData = function(key,value){
    let data = new ChartData(key,value,this);
    this.dataList.add(data)
}

widgetTools_chart.addToKeys = function(){
    const cells = selector.getSelected();
    const overwrite = document.getElementById("chartData-overwrite").checked;
    const availableInputs = [...this.dataList];
    if(cells){
        for(let i = 0; i < cells.length; i++){
            const cell = cells[i];
            const address = cellSymbol+cell.stringAddress;
            if(overwrite){
                let dataInput = availableInputs[i];
                if(dataInput){ dataInput.updateData(address) }
                else{ this.addData(address) }
            }
            else{
                this.addData(address)
            }
        }
    }
    selector.resetOldData();
}

widgetTools_chart.addToValues = function(){
    const cells = selector.getSelected();
    const overwrite = document.getElementById("chartData-overwrite").checked;
    const availableInputs = [...this.dataList];
    if(cells){
        for(let i = 0; i < cells.length; i++){
            const cell = cells[i];
            const address = cellSymbol+cell.stringAddress;
            if(overwrite){
                let dataInput = availableInputs[i];
                if(dataInput){ dataInput.updateData(false,address) }
                else{ this.addData(false,address) }
            }
            else{
                this.addData(false,address)
            }
        }
    }
    selector.resetOldData();
}

widgetTools_chart.focusUsedCells = function(){
    for(let usedCell of this.selectedWidget.chartObject.usedCells){
        usedCell.focus("#a0ff58ce");
        selector.focusedCells.add(usedCell);
    }
}

widgetTools_chart.loadData = function(reset){
    this.clearData();
    document.getElementById("chart-title").value = this.selectedWidget.chartObject.title;
    document.getElementById("chart-type").value = this.selectedWidget.chartObject.type;
    document.getElementById("chart-theme").value = this.selectedWidget.chartObject.theme;
    if(this.selectedWidget.chartObject.pairs.length == 0 && reset){
        this.addData();
    }
    else{
        let pairs = this.selectedWidget.chartObject.pairs;
        for(let data of pairs){
            this.addData(data.label,data.y);
        }
        this.focusUsedCells();
    }
}

widgetTools_chart.show = function(widget){
        let reset = false;
        if(this.selectedWidget != widget || !this.widgetObject._isShown){ reset = true }
        this.selectedWidget = widget;
        if(reset) this.loadData()
        this.widgetObject.show();
}

widgetTools_chart.changeChartType = function(){
    this.selectedWidget.chartObject.type = document.getElementById("chart-type").value
    this.selectedWidget.chartObject.changeType();
}

widgetTools_chart.changeChartTheme = function(){
    this.selectedWidget.chartObject.theme = document.getElementById("chart-theme").value
    this.selectedWidget.chartObject.changeTheme();
}

widgetTools_chart.apply = function(e){
    canvas.classList.remove("cursor-addCell");
    const dataSet = [];
    for(let data of this.dataList){
        data =  data.getData() 
        if(data) dataSet.push(data);
    }
    if(dataSet.length == 0 && e){ this.error.show(); }
    this.selectedWidget.chartObject.update(dataSet,document.getElementById("chart-title").value);
    selector.resetOldData();
    this.focusUsedCells();
}

document.getElementById("chart-type").addEventListener("input",()=>{ widgetTools_chart.changeChartType()})
document.getElementById("chart-theme").addEventListener("input",()=>{ widgetTools_chart.changeChartTheme()})

for(let btn of document.getElementsByName("add-chart-btn")){
    btn.addEventListener("click",(e)=>{
        new Chart(selectedSheet,false,e.currentTarget.value);
    })
}

