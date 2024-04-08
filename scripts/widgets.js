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
            changeFontSizesOptions(true);
        }
    },

    unselectWidget:function(switched=false){
        if(this.selectedWidget){
            if(this.selectedWidget.tools && !switched){
                this.selectedWidget.tools.hide();
                changeFontSizesOptions()
            } 
            this.selectedWidget.container.classList.remove("active");
            this.selectedWidget = false;
            this.editorNode.classList.add("hidden");
            
        }
    },

    actionStart:function(e,widget){
        if(this.selectedWidget){
            if(this.selectedWidget == widget){
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
                if(selector.selected){
                    selector.selected.refresh();
                    selector.selected = false;
                    display.restartData();
                    cellInput.hide();
                    selector.resetOldData();
                }
                else{
                    selector.resetOldData();
                }
            }
        }
        else{
            this.selectedWidget = widget;
            StyleInput.loadCell(widget);
            this.selectedWidget.container.classList.add("active")
            this.positionEditor();

            if(selector.selected){
                selector.selected.refresh();
                selector.selected = false;
                display.restartData();
                cellInput.hide();
            }
            else{
                selector.resetOldData();
            }
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
        this.selectedWidget.container.classList.add("resizing");
        this.startX = this.selectedWidget.container.offsetLeft ;
        this.startY = this.selectedWidget.container.offsetTop;
        this.nextFunc = this.inResize
        this.editorNode.classList.add("hidden")
        selector.blocked = true;
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
            this.loadData();
        }
        this.widgetObject.show();
    }

    hide(){
        this.widgetObject.hide();
    }

    loadData(){
    }
}


const mainContent = document.getElementById("mainContent");
const widgetTools_image = new WidgetTools(document.getElementById("collapse-image-options"));
const widgetTools_header = new WidgetTools(document.getElementById("collapse-header-options"));
const widgetTools_chart = new WidgetTools(document.getElementById("widgetTool-chart"));


// Widgets / Components

class WidgetInteractive{
    constructor(){
        this.styles = baseStyles();
        this.container = document.createElement("div");
        this.container.classList.add("interacive-widget");
        canvasContainer.appendChild(this.container);
        this.container.addEventListener("mousedown",(e)=>{
            widgetTools_base.actionStart(e,this);
            if(this.tools){ this.tools.show(this)};
        });
        this.container.style.left = `${100+canvasContainer.scrollLeft}px`; this.container.style.top = `${100+canvasContainer.scrollTop}px`;
        selectedSheet.widgets.add(this);
        this.maxSize = {
            x:999,
            y:999,
        }
    }
    
    destroy(){
        this.container.removeEventListener("mousedown",(e)=>{
            widgetTools_base.actionStart(e,this);
            if(this.tools){ this.tools.show(this)};
        });
        this.container.remove();
        selectedSheet.widgets.delete(this);
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

    refreshStyles(){
        let fillColor =  this.styles.fillColor || "transparent";
        this.container.style.backgroundColor = fillColor;
        if(this.styles.strokeColor){
            this.container.style.border = `${this.styles.strokeWidth}px solid ${this.styles.strokeColor}`;
        }
    }
}

//IMG
class WidgetImage extends WidgetInteractive{
    constructor(){
        super();
        this.type="image";
        this.tools = widgetTools_image;
        this.file;
        this.container.classList.add("widget-image");
        this.container.style.backgroundImage = `url('camera.png')`;
        this.container.style.width = "100px";
        this.container.style.height = "70px";
    }
}

//Header
class WidgetHeader extends WidgetInteractive{
    constructor(){
        super();
        this.type="header";
        this.text="";
        this.tools = widgetTools_header
        this.container.classList.add("widget-header");
        this.container.style.width = "130px";
        this.container.style.height = "60px";
        this.container.innerHTML = "<span class='w-100'>Przykładowy Nagłówek</span>";
        this.styles.color = "#000000";
        this.styles.fillColor = "#ffffff";
        this.styles.textAlign = "center";
        this.styles.fontSize = "20px";
        this.styles.strokeColor = false;
        this.refreshStyles();
    }

    refreshStyles(){
        this.container.style.textAlign = this.styles.textAlign;
        this.container.style.color = this.styles.color;
        this.container.style.fontSize = this.styles.fontSize;
        this.container.style.textDecoration = this.styles.fontType;
        this.container.style.fontFamily = this.styles.fontFamily;
        super.refreshStyles()
    }
}

//Chart widget
class WidgetChart extends WidgetInteractive{
    constructor(chartObject){
        super();
        this.chartObject = chartObject;
        this.canvas = document.createElement("canvas");
        this.container.appendChild(this.canvas);
        this.tools = widgetTools_chart;
        this.ctx = this.canvas.getContext("2d");
        this.container.classList.add("widget-chart");
        this.container.style.width = "200px"; this.container.style.height = "140px";
        this.styles.chartStyles = "210, 180, 222";
        this.styles.beTransparent = false;
        this.styles.showLegend= true;
        this.styles.fillColor = "#ffffff";
        this.refresh(true);
        
    }

    refreshStyles(){
        if(this.styles.strokeColor != this.styles.strokeColorOld) this.refresh();
        if(this.styles.beTransparent){this.styles.fillColor = "transparent"}
        else if(!this.styles.beTransparent && this.styles.fillColor == "transparent"){
            this.styles.fillColor = "#00000080";
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
}


//Tools Functions

//IMG
widgetTools_image.imgInput = document.getElementById("widgetTool-image-input");
widgetTools_image.imageFill = function(){ this.selectedWidget.container.classList.remove("bg-cover") };
widgetTools_image.imageCover = function(){ this.selectedWidget.container.classList.add("bg-cover") };

widgetTools_image.apply = function(){
    let img = new Image()
    let data = this.imgInput.files[0]
    data = URL.createObjectURL(data);
    img.src = data;
    this.selectedWidget.container.style.backgroundImage = `url('${data}')`
}

//Header
widgetTools_header.textInput = document.getElementById("widgetTool-header-text");

widgetTools_header.loadData = function(){
    this.textInput.value = this.selectedWidget.text;
}

widgetTools_header.apply = function(){
    this.selectedWidget.container.innerHTML = "<div class='w-100'> "+this.textInput.value+"</div>";
    this.selectedWidget.text = this.textInput.value;
}




//resize Main-content to make place for a widget 
document.getElementById("widgetTool-chart").addEventListener("shown.bs.offcanvas",(e)=>{
    if(mainContent.offsetWidth + 20 < window.innerWidth) return false;
    mainContent.style.width = `${mainContent.offsetWidth - e.target.offsetWidth}px`;
    //If more than 50% of chart is hidden scroll position to center
    if(widgetTools_chart.selectedWidget.container.offsetLeft + widgetTools_chart.selectedWidget.container.offsetWidth/2 > canvasContainer.offsetWidth + canvasContainer.scrollLeft  - e.target.offsetWidth){
        canvasContainer.scrollLeft += e.target.offsetWidth;
        mainContent.changedWidth = e.target.offsetWidth;
    }
    else{
        mainContent.changedWidth = false;
    }
})

document.getElementById("widgetTool-chart").addEventListener("hidden.bs.offcanvas",(e)=>{
    mainContent.style.width = "";
    if(mainContent.changedWidth) canvasContainer.scrollLeft -= mainContent.changedWidth;
})

addEventListener("resize",(e)=>{
    if(widgetTools_chart.widgetObject._isShown && (window.innerWidth > 576) ){
        mainContent.style.width = `${window.innerWidth - widgetTools_chart.widgetObject._element.offsetWidth}px`;
    }
})

//HANDLERS
for(let btn of document.getElementsByClassName("widget-remove-btn")){
    btn.addEventListener("click",()=>{widgetTools_base.removeWidget()})
}

document.getElementById("widgetTool-header-apply").addEventListener("click",()=>{widgetTools_header.apply()});
document.getElementById("addWidget-image").addEventListener("click",()=>{ return new WidgetImage() })
document.getElementById("addWidget-header").addEventListener("click",()=>{ return new WidgetHeader() })
document.getElementById("widgetTool-image-apply").addEventListener("click",()=>{widgetTools_image.apply()})
document.getElementById("image-size-fill").addEventListener("click",()=>{widgetTools_image.imageFill()});
document.getElementById("image-size-cover").addEventListener("click",()=>{widgetTools_image.imageCover()});
document.getElementById("chart-approve-changes").addEventListener("click",(e)=>{widgetTools_chart.apply(e)})
document.getElementById("chartData-addData").addEventListener("click",()=>{widgetTools_chart.addData()})