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
        let key = this.inputKey.value || false;
        let value = this.inputValue.value || false;
        if(!key && !value) return false
        return {key:key,value:value}
    }
}

class Chart{
    constructor(sheet,loadedChart){
        this.sheet = sheet;
        this.widget = new WidgetChart(this,sheet,loadedChart);
        this.pairs = [];
        this.usedCells = new Set();
        this.drawBase(...this.getSpace());
        this.minValue;
        this.maxValue;
        this.sum;
        this.sumAbs;
        this.keys;
        this.values;
        if(loadedChart){
            this.pairs = loadedChart.data;
            this.refresh();
            this.widget.refreshStyles();
        }
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

    unpackData(){
        let dataList = [];
        this.keys = [];
        this.values = [];
        this.sum = 0;
        this.sumAbs = 0;
        for(let data of this.pairs){
            let key = this.lookForCellAddress(data.key);
            let value = this.lookForCellAddress(data.value);
            if(!isNaN(parseFloat( value ))){ 
                this.sum += parseFloat( value );
                this.sumAbs += Math.abs(value);
             };
            dataList.push({key:key,value:value})
            if(key) this.keys.push(key); 
            this.values.push(value);
        }
        this.minValue = Math.min(...this.values);
        this.maxValue = Math.max(...this.values);
        if(!this.widget.styles.percentMode){
            this.minValue = (this.minValue < 0) ? (Math.abs(this.minValue)*1.1)*-1 : this.minValue*.9;
            this.maxValue = (this.maxValue < 0) ? (Math.abs(this.maxValue)*.9)*-1 : this.maxValue*1.1; 
            this.minValue = this.minValue.toFixed(2);
            this.maxValue = this.maxValue.toFixed(2);
        }
      

        if(this.minValue == Infinity || this.maxValue == Infinity){
            this.minValue = 0;
            this.maxValue = 100;
        };
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
        this.unpackData();
    }

    destroy(){
        selector.resetOldData();
        for(let cell of this.usedCells){
            cell.usedInCharts.delete(this);
        }
    }
}

class BasicChart extends Chart{
    constructor(sheet,loadedChart){
        super(sheet,loadedChart)
        this.startX;
        this.startY;
        this.widget.refreshStyles();
    }

    drawBase(spaceX,spaceY){
        super.drawBase()
        let colors = [...this.widget.styles.chartStyles.split(",")];
        colors = renderChartColors(...colors,3);
        let ctx = this.widget.ctx;
        let letters = Math.max(new String(this.maxValue).length,new String(this.minValue).length);
        if(this.widget.styles.percentMode) letters += 2;
        let startX = letters*7;
        let startY = spaceY-15;
        if(this.keys.length > 0) startY -= 15;
        ctx.fillStyle = colors.pop();
        ctx.fillRect(startX,startY,spaceX-startX-3,4);
        ctx.fillRect(startX,3,4,startY);
        if(!this.widget.styles.percentMode){
            this.drawRest(spaceX-10,startY,startX,startY,colors);
        }
        else{
            this.drawPercent(spaceX-10,startY,startX,startY,colors);
        }
    }

    drawLegendX(x,key,value,stepX,startY){
        this.widget.ctx.fillStyle = this.widget.styles.color;
        this.widget.ctx.font = "bold 10px arial";
        if(!key) key = "";
        if(!value) value = 0;
        key = trimText(key,stepX-10,this.widget.ctx);
        value = trimText(value,stepX-10,this.widget.ctx);
        let y = startY + 16;
        this.widget.ctx.fillText(value,x,y);
        this.widget.ctx.fillText(key,x,y+14);
        ctx.font = "bold 12px arial";
    }

    drawLegendY(minValue,maxValue,startY,startX,minusValue,spaceY){
        this.widget.ctx.fillStyle = this.widget.styles.color;
        this.widget.ctx.font = "bold 10px arial";
        let y75 = Math.ceil((startY+10)/2 - (startY)/4);
        let y50 = Math.ceil((startY+10)/2);
        this.widget.ctx.fillText(minValue,3,startY);
        this.widget.ctx.fillText(maxValue,3,14);
        if(minusValue){
            this.widget.ctx.fillText(`${Math.round(minusValue)}%`,3,spaceY+5);
        }
        let oldStyle = this.widget.ctx.fillStyle;
        let lineWidth = this.widget.canvas.width-startX-10;
        this.widget.ctx.fillStyle = oldStyle + "30";
        this.widget.ctx.fillRect(startX+4,startY,lineWidth,2);
        this.widget.ctx.fillRect(startX+4,10,lineWidth,1);
        this.widget.ctx.fillRect(startX+4,y50,lineWidth,1);
        this.widget.ctx.fillRect(startX+4,Math.ceil((startY)/2 + (startY)/4),lineWidth,1);
        this.widget.ctx.fillRect(startX+4,y75,lineWidth,1);
        this.widget.ctx.fillStyle = oldStyle;
    }
}

class PieChart extends Chart{
    constructor(sheet,loadedChart){
        super(sheet,loadedChart)
        this.widget.styles = new StyleListFlush();
        this.widget.refreshStyles();
        this.type = "PIE";
    }

    drawBase(spaceX,spaceY){
        super.drawBase()
        let centerX = spaceX/2;
        let centerY = spaceY/2;
        let radius = (Math.min(spaceX,spaceY)/2)*.9;
        let ctx = this.widget.ctx
        ctx.save();
        ctx.shadowColor = "black";
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        if(this.minValue < 0){ ctx.fillStyle = "#BE3232"; }
        else{ ctx.fillStyle = renderChartColors(...this.widget.styles.chartStyles.split(","));  }
        ctx.beginPath();
        ctx.arc(centerX,centerY,radius,0,2*Math.PI);
        ctx.fill();
        this.drawRest(centerX,centerY,radius+1);
        ctx.restore();
    }

    drawRest(centerX,centerY,radius){
        let dataList = this.unpackData();
        let colors = [...this.widget.styles.chartStyles.split(",")];
        colors = renderChartColors(...colors,dataList.length);
        let part = 360/this.sumAbs;
        let last = 0;
        let ctx = this.widget.ctx;
        ctx.save();
        ctx.shadowColor = "black";
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        for(let data of dataList){
            if(data.value > 0){
                let end = last + (data.value * part)
                ctx.fillStyle = colors.pop()
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, radius,last*Math.PI/180,end*Math.PI/180);
                ctx.lineTo(centerX, centerY);
                ctx.fill()
                last = end;
            }
        }
        ctx.restore();
    }
}

class LineChart extends BasicChart{
    constructor(sheet,loadedChart){
        super(sheet,loadedChart)
        this.type = "LINE";
    }

    drawPercent(spaceX,spaceY,startX,startY,colors){
        let ctx = this.widget.ctx;
        let percent = 100/this.sum;
        let realPercent = 100/this.sumAbs;
        let stepY = (spaceY-10)/100;
        let stepX = (spaceX-10)/Math.max(this.keys.length,this.values.length);
        if(stepX < 10) stepX = 10;
        if(this.minValue < 0){
            startY = startY -(Math.abs(this.minValue)*realPercent)*stepY 
            this.drawLegendY("0%",`${100+Math.round(Math.abs(this.minValue)*percent)}%`,startY,startX,this.minValue*percent,spaceY);
        } 
        else{
            this.drawLegendY("0%","100%",startY,startX);
        }
        ctx.save();
        ctx.fillStyle = colors.pop();
        ctx.strokeStyle = colors.pop();
        ctx.lineWidth = 3;
        ctx.beginPath();
        for(let i = 0; i< this.values.length; i++){
            let value = this.values[i];
            let x = stepX*i;
            let y = (value*realPercent)*stepY;
            if(i == 0){ 
                ctx.moveTo(startX + x,startY - y); 
            }
            else{ ctx.lineTo(startX + x, startY - y); }
            ctx.fillRect( startX + x -3, startY - y -3, 6, 6 );
            let keyValue = value*percent;
            keyValue = `${keyValue.toFixed(2)}%`;
            this.drawLegendX(startX + x,this.keys[i],keyValue,stepX,startY);
        }
        ctx.stroke();
        ctx.restore();
    } 

    drawRest(spaceX,spaceY,startX,startY,colors){
        let ctx = this.widget.ctx;
        let stepY = (spaceY-10)/Math.abs(this.maxValue - this.minValue);
        let stepX = (spaceX-10)/Math.max(this.keys.length,this.values.length);
        if(stepX < 10) stepX = 10;
        ctx.save()
        ctx.fillStyle = colors.pop();
        this.drawLegendY(this.minValue,this.maxValue,startY,startX);
        ctx.strokeStyle = colors.pop();
        ctx.lineWidth = 3;
        ctx.beginPath();
        for(let i = 0; i< this.values.length; i++){
            let value = this.values[i];
            let x = stepX*i;
            let y = (value - this.minValue)*stepY;
            if(i == 0){ 
                ctx.moveTo(startX + x,startY - y); 
            }
            else{ ctx.lineTo(startX + x, startY - y); }
            ctx.fillRect( startX + x -3, startY - y -3, 6, 6 );
            this.drawLegendX(startX + x + 15,this.keys[i],value,stepX,startY);
        }
        ctx.stroke();
        ctx.restore();
    } 
}

class AreaChart extends BasicChart{
    constructor(sheet,loadedChart){
        super(sheet,loadedChart)
        this.type = "AREA";
    }

    drawPercent(spaceX,spaceY,startX,startY,colors){
        let ctx = this.widget.ctx;
        let percent = 100/this.sum;
        let realPercent = 100/this.sumAbs;
        let stepY = (spaceY-10)/100;
        let stepX = (spaceX-10)/Math.max(this.keys.length,this.values.length);
        if(stepX < 10) stepX = 10;
        ctx.font = "bold 10px arial";
        if(this.minValue < 0){
            startY = startY -(Math.abs(this.minValue)*realPercent)*stepY 
            this.drawLegendY("0%",`${100+Math.round(Math.abs(this.minValue)*percent)}%`,startY,startX,this.minValue*percent,spaceY);
        } 
        else{
            this.drawLegendY("0%","100%",startY,startX);
        }
        ctx.save();
        ctx.fillStyle = colors.pop();
        ctx.strokeStyle = colors.pop();
        ctx.lineWidth = 3;
        ctx.beginPath();
        for(let i = 0; i< this.values.length; i++){
            let value = this.values[i];
            let x = stepX*i;
            let y = (value*realPercent)*stepY;
            if(i == 0){ 
                ctx.moveTo(startX + x,startY - y); 
            }
            else{ ctx.lineTo(startX + x, startY - y); }
            if(i == this.values.length-1){
                ctx.lineTo(startX + x, startY);
                ctx.lineTo(startX, startY);
            }
            let keyValue = value*percent;
            keyValue = `${keyValue.toFixed(2)}%`;
            this.drawLegendX(startX + x,this.keys[i],keyValue,stepX,startY);
        }
        ctx.fill();
        ctx.restore();
    } 

    drawRest(spaceX,spaceY,startX,startY,colors){
        let ctx = this.widget.ctx;
        let stepY = (spaceY-10)/Math.abs(this.maxValue - this.minValue);
        let stepX = (spaceX-10)/Math.max(this.keys.length,this.values.length);
        if(stepX < 10) stepX = 10;
        ctx.save()
        ctx.fillStyle = colors.pop();
        this.drawLegendY(this.minValue,this.maxValue,startY,startX);
        ctx.strokeStyle = colors.pop();
        ctx.lineWidth = 3;
        ctx.beginPath();
        for(let i = 0; i< this.values.length; i++){
            let value = this.values[i];
            let x = (stepX+5)*i;
            let y = (value - this.minValue)*stepY;
            if(i == 0){ 
                ctx.moveTo(startX + x,startY - y); 
            }
            else{ ctx.lineTo(startX + x, startY - y); }
            if(i == this.values.length-1){
                ctx.lineTo(startX + x, startY);
                ctx.lineTo(startX, startY);
            }
            this.drawLegendX(startX + x + 15,this.keys[i],value,stepX,startY);
        }
        ctx.fill();
        ctx.restore();
    } 
}

class BarChart extends BasicChart{
    constructor(sheet,loadedChart){
        super(sheet,loadedChart)
        this.type = "BAR";
    }

    drawPercent(spaceX,spaceY,startX,startY){
        let colors = [...this.widget.styles.chartStyles.split(",")];
        let ctx = this.widget.ctx;
        colors = renderChartColors(...colors,this.values.length);
        let percent = 100/this.sum;
        let realPercent = 100/this.sumAbs;
        let stepY = (spaceY-10)/100;
        let stepX = (spaceX-10)/Math.max(this.keys.length,this.values.length);
        if(stepX < 25) stepX = 25;
        ctx.font = "bold 10px arial";
        if(this.minValue < 0){
            startY = startY -(Math.abs(this.minValue)*realPercent)*stepY 
            this.drawLegendY("0%",`${100+Math.round(Math.abs(this.minValue)*percent)}%`,startY,startX,this.minValue*percent,spaceY);
        } 
        else{
            this.drawLegendY("0%","100%",startY,startX);
        }
        for(let i = 0; i< this.values.length; i++){
            let value = this.values[i];
            if(value < 0){ ctx.fillStyle = "#BE3232"; }
            else{ ctx.fillStyle = colors.pop(); }
            let x = stepX*i;
            let y = (value*realPercent)*stepY;
            ctx.save()
            ctx.shadowColor = "black";
            ctx.shadowBlur = 3;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.fillRect( startX + x +15, startY - y,20,y);
            ctx.restore();
            let keyValue = value*percent;
            keyValue = `${keyValue.toFixed(2)}%`;
            this.drawLegendX(startX + x,this.keys[i],keyValue,stepX,startY);
        }
    } 

    drawRest(spaceX,spaceY,startX,startY){
        let colors = [...this.widget.styles.chartStyles.split(",")];
        let ctx = this.widget.ctx;
        colors = renderChartColors(...colors,this.values.length);
        let stepY = (spaceY-10)/Math.abs(this.maxValue - this.minValue);
        let stepX = (spaceX-25)/Math.max(this.keys.length,this.values.length);
        if(stepX < 25) stepX = 25;
        this.drawLegendY(this.minValue,this.maxValue,startY,startX);

        for(let i = 0; i< this.values.length; i++){
            let value = this.values[i];
            let x = stepX*i;
            let y = (value - this.minValue)*stepY;
            ctx.fillStyle = colors.pop();
            ctx.save()
            ctx.shadowColor = "black";
            ctx.shadowBlur = 3;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            if(y < 1) y = 1;
            ctx.fillRect( startX + x +15, startY - y,20,y);
            ctx.restore();
            this.drawLegendX(startX + x + 15,this.keys[i],value,stepX,startY);
        }
        
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

widgetTools_chart.focusUsedCells = function(){
    for(let usedCell of this.selectedWidget.chartObject.usedCells){
        usedCell.focus("#a0ff58ce");
        selector.focusedCells.add(usedCell);
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
    canvas.classList.remove("cursor-addCell");
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
new StyleInput_CheckBox(document.getElementById("chart-render-legend"),"percentMode");


document.getElementById("addChart-line").addEventListener("click",()=>{new LineChart(selectedSheet);});
document.getElementById("addChart-area").addEventListener("click",()=>{new AreaChart(selectedSheet)});
document.getElementById("addChart-bar").addEventListener("click",()=>{new BarChart(selectedSheet)});
document.getElementById("addChart-pie").addEventListener("click",()=>{new PieChart(selectedSheet)});
document.getElementById("chartData-overwrite").addEventListener("input",(e)=>{recordMultiData.overwrite = e.target.checked})

