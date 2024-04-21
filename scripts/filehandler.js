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

function newFile(){
    openedFile = new File();
    fileInfo.load();
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

// document.getElementById("newFile").addEventListener("click",()=>{  TRZEBA DODAC USUWANIE SHEETBTN WIDGETOW PO ZMIANIE PLIKU
//     approveActionWindow.show(msg_newFile,newFile);
// })