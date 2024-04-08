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
        let key = this.inputKey.value || false;
        let value = this.inputValue.value || false;
        if(!key && !value) return false
        return {key:key,value:value}
    }
}

class Chart{
    constructor(sheet){
        this.sheet = sheet;
        this.widget = new WidgetChart(this);
        this.pairs = [];
        this.usedCells = new Set();
        this.drawBase(...this.getSpace());

    }

    getSpace(){
        let spaceX = this.widget.canvas.width - 4;
        let spaceY = this.widget.canvas.height - 4;
        return [spaceX,spaceY];
    }

    clearOldData(){
        for(let cell of this.usedCells){ cell.usedInCharts.delete(this); }
        this.usedCells = new Set();
    }

    lookForCellAddress(value){
        if(value[0] == cellSymbol){
            value = value.substring(1)
            let cell = selectedSheet.cells.get(value);
            if(cell){
                this.usedCells.add(cell)
                cell.usedInCharts.add(this);
                let text = cell.getText();
                if(text.length == 0) text = 0;
                return text
            }
        }
        else{
            return value
        }
    }

    unpackData(){
        let dataList = [];
        for(let data of this.pairs){
            let key = this.lookForCellAddress(data.key);
            let value = this.lookForCellAddress(data.value);
            dataList.push({key:key,value:value})
        }
        return dataList;
    }

    update(dataList){
        this.clearOldData();
        this.pairs  = dataList;
        this.widget.clearCanvas();
        this.drawBase(...this.getSpace());
    }

    refresh(){
        this.widget.clearCanvas();
        this.drawBase(...this.getSpace());
    }

    drawBase(){
    }

    destroy(){
        selector.resetOldData();
        for(let cell of this.usedCells){
            cell.usedInCharts.delete(this);
        }
    }

}

class PieChart extends Chart{
    constructor(){
        super()
        this.widget.styles.beTransparent = true;
        this.widget.styles.fillColor = "transparent";
        this.widget.refreshStyles();
    }

    drawBase(spaceX,spaceY){
        let centerX = spaceX/2;
        let centerY = spaceY/2;
        let radius = (Math.min(spaceX,spaceY)/2)*.9;
        let ctx = this.widget.ctx
        ctx.save();
        ctx.shadowColor = "black";
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.fillStyle = renderChartColors(...this.widget.styles.chartStyles.split(","));
        ctx.beginPath();
        ctx.arc(centerX,centerY,radius,0,2*Math.PI);
        ctx.fill();
        this.drawRest(centerX,centerY,radius+1);
        ctx.restore();
    }

    drawRest(centerX,centerY,radius){
        let dataList = this.unpackData();
        let sumValues = 0;
        let colors = [...this.widget.styles.chartStyles.split(",")];
        colors = renderChartColors(...colors,dataList.length);
        for(let data of dataList){
            let value = parseFloat(data.value);
            (value >= 0) ? sumValues += value: sumValues += (value*-1);
        }
        let part = 360/sumValues;
        let last = 0;
        let ctx = this.widget.ctx;
        ctx.save();
        ctx.shadowColor = "black";
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        for(let data of dataList){
            let end = last + (data.value * part)
            ctx.fillStyle = colors.pop()
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius,last*Math.PI/180,end*Math.PI/180);
            ctx.lineTo(centerX, centerY);
            ctx.fill()
            last = end;
        }
        ctx.restore();
    }
}

class LineChart extends Chart{
    constructor(){
        super()
        this.widget.styles.beTransparent = false;
        this.widget.styles.fillColor = "#eeeeee";
        this.widget.refreshStyles();
    }

    drawBase(spaceX,spaceY){
        let colors = [...this.widget.styles.chartStyles.split(",")];
        colors = renderChartColors(...colors,3);
        let ctx = this.widget.ctx;
        let startX = 30;
        let startY = spaceY-30;
        ctx.fillStyle = colors.pop();
        ctx.fillRect(startX,startY,spaceX-startX-3,4);
        ctx.fillRect(startX,3,4,startY);
        this.drawRest(spaceX-10,startY,startX,startY,colors);
    }

    drawLegendY(minValue,maxValue,startY,startX){
        this.widget.ctx.fillText(minValue,5,startY)
        this.widget.ctx.fillText(maxValue,5,14)
        let oldStyle = this.widget.ctx.fillStyle;
        this.widget.ctx.fillStyle = oldStyle + "30";
        this.widget.ctx.fillRect(startX+4,10,this.widget.canvas.width-20,1)
        this.widget.ctx.fillRect(startX+4,Math.ceil((startY+10)/2),this.widget.canvas.width-startX-10,1)
        this.widget.ctx.fillRect(startX+4,Math.ceil((startY)/2 + (startY)/4),this.widget.canvas.width-startX-10,1)
        this.widget.ctx.fillRect(startX+4,Math.ceil((startY+10)/4),this.widget.canvas.width-startX-10,1)
        this.widget.ctx.fillStyle = oldStyle;
    }

    drawLegendX(x,key,stepX){
        if(!key) key = "|"
        while (ctx.measureText(key).width > stepX-10) { key = key.slice(0, key.length - 1); }
        ctx.font = "bold 8px arial";
        let y = this.widget.canvas.height - 15;
        this.widget.ctx.fillText(key,x - ctx.measureText(key).width/2,y);
        ctx.font = "bold 12px arial";
    }

    drawRest(spaceX,spaceY,startX,startY,colors){
        let ctx = this.widget.ctx;
        let keys = [];
        let values = [];
        for(let data of this.unpackData()){ 
            values.push(data.value)
            keys.push(data.key)
        };
        let minValue = Math.min(...values);
        let maxValue = Math.max(...values);
        if(minValue == Infinity || maxValue == Infinity){
            minValue = 0;
            maxValue = 100;
        };
        if(minValue >= 0 && maxValue <= 100){ 
            minValue = 0; 
            maxValue = 100; 
        }
        let stepY = (spaceY-10)/Math.abs(maxValue - minValue);
        let stepX = (spaceX-10)/Math.max(keys.length,values.length);
        if(stepX < 10) stepX = 10;
        ctx.save()
        ctx.fillStyle = colors.pop();
        ctx.font = "bold 12px arial";
        this.drawLegendY(minValue,maxValue,startY,startX);
        ctx.strokeStyle = colors.pop();
        ctx.lineWidth = 3;
        ctx.beginPath();
        for(let i = 0; i< values.length; i++){
            let value = values[i];
            let x = stepX*i;
            let y = (value - minValue)*stepY;
            if(i == 0){ 
                ctx.moveTo(startX + x,startY - y); 
            }
            else{ ctx.lineTo(startX + x, startY - y); }
            ctx.fillRect( startX + x -3, startY - y -3, 6, 6 );
            this.drawLegendX(startX + x,keys[i],stepX)
        }
        ctx.stroke();
        
        ctx.restore();
    } 
}

class BarChart extends Chart{
    constructor(){
        super()
        this.widget.styles.beTransparent = false;
        this.widget.styles.fillColor = "#eeeeee";
        this.widget.refreshStyles();
    }

    drawBase(spaceX,spaceY){
        let colors = [...this.widget.styles.chartStyles.split(",")];
        colors = renderChartColors(...colors,2);
        let ctx = this.widget.ctx;
        let startX = 30;
        let startY = spaceY-30;
        ctx.fillStyle = colors.pop();
        ctx.fillRect(startX,startY,spaceX-startX-3,4);
        ctx.fillRect(startX,3,4,startY);
        ctx.fillStyle = colors.pop();
        this.drawRest(spaceX-10,startY,startX,startY);
    }

    drawLegendY(minValue,maxValue,startY,startX){
        this.widget.ctx.fillText(minValue,5,startY)
        this.widget.ctx.fillText(maxValue,5,14)
        let oldStyle = this.widget.ctx.fillStyle;
        this.widget.ctx.fillStyle = oldStyle + "30";
        this.widget.ctx.fillRect(startX+4,10,this.widget.canvas.width-20,1)
        this.widget.ctx.fillRect(startX+4,Math.ceil((startY+10)/2),this.widget.canvas.width-startX-10,1)
        this.widget.ctx.fillRect(startX+4,Math.ceil((startY)/2 + (startY)/4),this.widget.canvas.width-startX-10,1)
        this.widget.ctx.fillRect(startX+4,Math.ceil((startY+10)/4),this.widget.canvas.width-startX-10,1)
        this.widget.ctx.fillStyle = oldStyle;
    }

    drawLegendX(x,key,stepX){
        if(!key) key = "|"
        while (ctx.measureText(key).width > stepX-10) { key = key.slice(0, key.length - 1); }
        ctx.font = "bold 8px arial";
        let y = this.widget.canvas.height - 15;
        this.widget.ctx.fillText(key,x - ctx.measureText(key).width/2,y);
        ctx.font = "bold 12px arial";
    }

    drawRest(spaceX,spaceY,startX,startY){
        let colors = [...this.widget.styles.chartStyles.split(",")];
        let ctx = this.widget.ctx;
        let keys = [];
        let values = [];
        for(let data of this.unpackData()){ 
            values.push(data.value)
            keys.push(data.key)
        };
        let minValue = Math.min(...values);
        let maxValue = Math.max(...values);
        colors = renderChartColors(...colors,values.length);
        if(minValue == Infinity || maxValue == Infinity){
            minValue = 0;
            maxValue = 100;
        };
        if(minValue >= 0 && maxValue <= 100){ 
            minValue = 0; 
            maxValue = 100; 
        }
        let stepY = (spaceY-10)/Math.abs(maxValue - minValue);
        let stepX = (spaceX-25)/Math.max(keys.length,values.length);
        if(stepX < 20) stepX = 20;
        ctx.font = "bold 12px arial";
        this.drawLegendY(minValue,maxValue,startY,startX);

        for(let i = 0; i< values.length; i++){
            let value = values[i];
            let x = stepX*i;
            let y = (value - minValue)*stepY;
            ctx.fillStyle = colors.pop();
            ctx.save()
            ctx.shadowColor = "black";
            ctx.shadowBlur = 5;
            ctx.shadowOffsetX = 3;
            ctx.shadowOffsetY = 3;
            if(y < 1) y = 1;
            ctx.fillRect( startX + x +15, startY - y,20,y);
            ctx.restore();
            this.drawLegendX(startX + x + 15,keys[i],stepX)
        }
        
    } 
}

class AreaChart extends Chart{
    constructor(){
        super()
        this.widget.styles.beTransparent = false;
        this.widget.styles.fillColor = "#eeeeee";
        this.widget.refreshStyles();
    }

    drawBase(spaceX,spaceY){
        let colors = [...this.widget.styles.chartStyles.split(",")];
        colors = renderChartColors(...colors,3);
        let ctx = this.widget.ctx;
        let startX = 30;
        let startY = spaceY-30;
        ctx.fillStyle = colors.pop();
        ctx.fillRect(startX,startY,spaceX-startX-3,4);
        ctx.fillRect(startX,3,4,startY);
        this.drawRest(spaceX-10,startY,startX,startY,colors);
    }

    drawLegendY(minValue,maxValue,startY,startX){
        this.widget.ctx.fillText(minValue,5,startY)
        this.widget.ctx.fillText(maxValue,5,14)
        let oldStyle = this.widget.ctx.fillStyle;
        this.widget.ctx.fillStyle = oldStyle + "30";
        this.widget.ctx.fillRect(startX+4,10,this.widget.canvas.width-20,1)
        this.widget.ctx.fillRect(startX+4,Math.ceil((startY+10)/2),this.widget.canvas.width-startX-10,1)
        this.widget.ctx.fillRect(startX+4,Math.ceil((startY)/2 + (startY)/4),this.widget.canvas.width-startX-10,1)
        this.widget.ctx.fillRect(startX+4,Math.ceil((startY+10)/4),this.widget.canvas.width-startX-10,1)
        this.widget.ctx.fillStyle = oldStyle;
    }

    drawLegendX(x,key,stepX){
        if(!key) key = "|"
        while (ctx.measureText(key).width > stepX-10) { key = key.slice(0, key.length - 1); }
        ctx.font = "bold 8px arial";
        let y = this.widget.canvas.height - 15;
        this.widget.ctx.fillText(key,x - ctx.measureText(key).width/2,y);
        ctx.font = "bold 12px arial";
    }

    drawRest(spaceX,spaceY,startX,startY,colors){
        let ctx = this.widget.ctx;
        let keys = [];
        let values = [];
        for(let data of this.unpackData()){ 
            values.push(data.value)
            keys.push(data.key)
        };
        let minValue = Math.min(...values);
        let maxValue = Math.max(...values);
        if(minValue == Infinity || maxValue == Infinity){
            minValue = 0;
            maxValue = 100;
        };
        if(minValue >= 0 && maxValue <= 100){ 
            minValue = 0; 
            maxValue = 100; 
        }
        let stepY = (spaceY-10)/Math.abs(maxValue - minValue);
        let stepX = (spaceX-10)/Math.max(keys.length,values.length);
        if(stepX < 10) stepX = 10;
        ctx.save()
        ctx.fillStyle = colors.pop();
        ctx.font = "bold 12px arial";
        this.drawLegendY(minValue,maxValue,startY,startX);
        ctx.strokeStyle = colors.pop();
        ctx.lineWidth = 3;
        ctx.beginPath();
        for(let i = 0; i< values.length; i++){
            let value = values[i];
            let x = (stepX+5)*i;
            let y = (value - minValue)*stepY;
            if(i == 0){ 
                ctx.moveTo(startX + x,startY - y); 
            }
            else{ ctx.lineTo(startX + x, startY - y); }
            if(i == values.length-1){
                ctx.lineTo(startX + x, startY);
                ctx.lineTo(startX, startY);
            }
            ctx.fillRect( startX + x -3, startY - y -3, 6, 6 );
            this.drawLegendX(startX + x,keys[i],stepX)
        }
        ctx.fill();
        
        ctx.restore();
    } 
}

// CHART TOOLS
widgetTools_chart.dataListNode = document.getElementById("chartData-list");
widgetTools_chart.dataList = [];
widgetTools_chart.error = new bootstrap.Toast(document.getElementById("chartError-1"))

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

widgetTools_chart.focusUsedCells = function(){
    for(let usedCell of this.selectedWidget.chartObject.usedCells){
        selector.selectedCells.add(usedCell);
        usedCell.focus("#a0ff58ce");
    }
}

widgetTools_chart.loadData = function(reset){
    this.clearData();
    if(this.selectedWidget.chartObject.pairs.length == 0 && reset){
        this.addData();
    }
    else{
        let pairs = this.selectedWidget.chartObject.pairs;
        for(let data of pairs){
            this.addData(data.key,data.value);
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

widgetTools_chart.apply = function(e){
    const dataSet = [];
    for(let data of this.dataList){
        data =  data.getData() 
        if(data) dataSet.push(data);
    }
    if(dataSet.length == 0 && e){ this.error.show(); }
    this.selectedWidget.chartObject.update(dataSet);
    selector.resetOldData();
    this.focusUsedCells();
}

new StyleInput_Radio(document.getElementsByName("chart-styles-color"),"chartStyles");
new StyleInput_CheckBox(document.getElementById("chart-render-bg"),"beTransparent");
new StyleInput_CheckBox(document.getElementById("chart-render-legend"),"showLegend");


document.getElementById("addChart-line").addEventListener("click",()=>{new LineChart(selectedSheet)});
document.getElementById("addChart-area").addEventListener("click",()=>{new AreaChart(selectedSheet)});
document.getElementById("addChart-bar").addEventListener("click",()=>{new BarChart(selectedSheet)});
document.getElementById("addChart-pie").addEventListener("click",()=>{new PieChart(selectedSheet)});
document.getElementById("chartData-overwrite").addEventListener("input",(e)=>{recordMultiData.overwrite = e.target.checked})

