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
    },

    save: function(){
        if (openedFile) {
            openedFile.author = this.authorNode.value ;
            openedFile.name = this.nameNode.value;
            openedFile.description = this.descriptionNode.value;
        }
    }
}

function newFile(createFromData=false){
    if(openedFile) openedFile.destroy(); 
    openedFile = new File(createFromData);
    fileInfo.load();
}

function downloadFile() {
    if (openedFile) {
        sysMsg_info_download.show();
        let data = openedFile.packToSaving();
        let file = new Blob([data], { type: "text/plain" })
        let a = document.getElementById("fileDownloadLink");
        a.href = URL.createObjectURL(file);
        a.download = openedFile.name + ".json";
        console.log(data)
        //a.click();
    }
}

function loadFile() {
        let input = document.getElementById("loadFileInput");
        let file = input.files[0];
        let reader = new FileReader();
        reader.onload = handleLoadedFile
        reader.readAsText(file);
}

function handleLoadedFile(e) {
    let loadedData = e.target.result;
    loadedData = JSON.parse(loadedData);
    newFile(loadedData)
}

function unpackWidget(sheet,loadedWidget,copied){

    let copyStaticWidget = function(sheet,loadedWidget,copied,constructor){
        if(copied){
            const cells = selector.getSelected();
            if(cells.length > 0){
                for(let cell of cells){
                    new constructor(sheet,loadedWidget,cell);
                }
            }
            else{
                sysMsg_error_insert.show();
            }
        }
        else{
            new constructor(sheet,loadedWidget)
        }
    }

    switch(loadedWidget.type){
        case "VARTABLE":
            copyStaticWidget(sheet,loadedWidget,copied,WidgetVariableData)
            break;

        case "PROGRESS":
            copyStaticWidget(sheet,loadedWidget,copied,WidgetProgressBar)
            break;
            
        case "CHECKBOX":
            copyStaticWidget(sheet,loadedWidget,copied,WidgetCheckBox)
            break;

        case "TEXT":
            new WidgetHeader(sheet,loadedWidget);
            break;            

        case "CHART":
            switch(loadedWidget.chartType) {
                case "PIE":
                  new PieChart(sheet,loadedWidget);
                  break;

                case "BAR":
                  new BarChart(sheet,loadedWidget);
                  break;

                case "LINE":
                  new LineChart(sheet,loadedWidget);
                  break;

                case "AREA":
                  new AreaChart(sheet,loadedWidget);
                  break;                     
              }
            break;
    }
}

function saveToLocalStorage(){
    if(document.getElementById("auto-saving").checked){
        const data = openedFile.packToSaving();
        localStorage.setItem("auto-save",data);
    }
    else{
        localStorage.removeItem("auto-save");
    }
}

function loadFromLocalStorage(){
    const data = localStorage.getItem("auto-save");
    autosaveON()
    if(data){ newFile(JSON.parse(data)) }
}

function askAboutCookies(){
    approveActionWindow.show(msg_cookies,approveCookies,rejectCookies);
}

function approveCookies(){
    localStorage.setItem("cookiesAproved","true");
    autosaveON();
}

function rejectCookies(){
    localStorage.clear();
    autosaveOFF();
}

function autosaveON(){
    const autoSaveBtn = document.getElementById("auto-saving");
    autoSaveBtn.checked = true;
    autoSaveBtn.disabled = false;
}

function autosaveOFF(){
    const autoSaveBtn = document.getElementById("auto-saving");
    autoSaveBtn.checked = false;
    autoSaveBtn.disabled = true;
}

document.getElementById("newFile").addEventListener("click",()=>{
    approveActionWindow.show(msg_newFile,newFile);
})

addEventListener("beforeunload",saveToLocalStorage);