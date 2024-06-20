//Prepare canvas and render Legend on it.
function prepareBoard(){
    resizeCanvas();
    ctx.font = "bold 14px arial";
    ctx.strokeStyle = "#606060";
    for (let i = 0; i < 501; i++) {
        new Legend(i, 0)
        if (i > 0 && i < 27) {
            new Legend(0, i);
        }
    }
    ctx.font = "normal 14px arial";
}

//scrolling mechanism of Toolbar and Available Sheets
function addScrolling(controlsName,container){
    for(let btn of document.getElementsByName(controlsName)){
        btn.addEventListener("click",(e)=>{
            let step = e.currentTarget.value;
            container.scrollLeft += (step*(container.offsetWidth*.8));
        })
    }
}

// Bootstrap tooltips active
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
return new bootstrap.Tooltip(tooltipTriggerEl,{trigger: 'hover'})
})


// Start Steps 
//downloadSymbols();
prepareBoard();
cellInput.load();
addScrolling("tool-bar-scroll-control",document.getElementById("tools-bar"));
addScrolling("available-sheets-scroll-control",document.getElementById("available-sheets"));


//Load Errors
new CalculationError("BRACKET","Twoje obliczenie zawiera jakiś niezamknięty nawias ","@NAWIAS-","Niezamknięty nawias");
new CalculationError("BRACKET+","Twoje obliczenie zawiera jakieś niepotrzebne nawiasy zamykające ","@NAWIAS+","Za dużo nawiasów");
new CalculationError("EMPTY","Twoje obliczenie jest całkiem puste ","@PUSTO","Puste Obliczenie");
new CalculationError("ERRFUNC","Nie znaleziono zapisanej funkcji: ","@FUNKCJA","Niepoprawna Funkcja");
new CalculationError("ERRCELL","Nie znaleziono zapisanego adresu komórki: ","@ADRES","Niepoprawny Adres");
new CalculationError("FORM","Twoje obliczenie zawiera błąd w zapisie jeżeli nadal potrzebujesz pomocy przejdź do zakładki pomoc","@ZLE_WPIS","Zły zapis");
new CalculationError("/0","Nie da się podzielić przez zero !","@DZIEL/0","Dzielenie przez zero");
new CalculationError("SELF","Komórka w której ma zostać zapisany wynik nie może zostać użyta w obliczeniu","@SELF","Pętla");
new CalculationError("LOOP","Wykryto pętle ! przykład pętli to a = b  b = a","@PĘTLA","Pętla");
new CalculationError("OTHER","Te obliczenie używa innej komórki w której wynik to błąd: ","@INNY ERR","Użyto błednego wyniku");
new CalculationError("TOMORE","Wysłano za dużo argumentów do funkcji: ","@ZA DUŻO","Błąd Funkcji");
new CalculationError("TOLOW","Nie wysłano wystarczająco argumentów do funckji: ","@ZA MAŁO","Błąd Funkcji");
new CalculationError("NARG","Nie wysyła się żadnych argumentów do funkcji: ","@ZA DUŻO","Błąd Funkcji");
new CalculationError("NLOGIC","Nie wysłano argumentu logicznego (true/false) do funkcji: ","@BRAK LOGIKI","Brak Logiki");
new CalculationError("NPAIRS","W przesłanych argumentach brakuje jednej wartości aby uzyskać klucz:wartość w funkcji: ","@BRAK LOGIKI","Brak jednego argumentu");
new CalculationError("NAN","Uzyskany wynik to nie liczba. Dzieje się tak poprzez błąd w zapisie na przykład dodanie liczby do tekstu lub daty","NaN","NaN");
new CalculationError("VALUE","Argument który przesłałeś do funkcji jest w złym formacie albo jest poza zakresem funkcji: ","@ZLY ARG","Zły argument");

//Event Listeners
document.getElementById("sheet-new").addEventListener("click",()=>{openedFile.addNewSheet()});
document.getElementById("sheet-copy").addEventListener("click", ()=>{openedFile.copySelectedSheet(openedFile)});
document.getElementById("sheet-remove").addEventListener("click", () => { openedFile.removeSelectedSheet() });

canvas.addEventListener("mousedown", (e) => { 
    if(e.button == 0) selector.actionStart(e);
});

canvas.addEventListener( "mouseup", (e)=>{ 
    if(e.button == 0) selector.actionEnd(e);
});

function touchConverter(touchEvent,target){
    const toutch = touchEvent.changedTouches[0];
    if(toutch){
        touchEvent.preventDefault();
        return {
            offsetX:toutch.pageX,
            offsetY:toutch.pageY - target.offsetTop
        }
    } 
}

canvas.addEventListener( "touchend", (e)=>{ 
    console.log("KONIEC",e)
    selector.actionEnd( touchConverter(e,canvasContainer) );
    
});

canvas.addEventListener("touchstart", (e) => { 
    selector.actionStart( touchConverter(e,canvasContainer) );
    console.log("POCZĄTEK")
});

canvas.addEventListener( "mouseup", (e)=>{ 
    if(e.button == 0) selector.actionEnd(e);
});

cellInput.element.addEventListener("input", (e)=>{
    if(document.activeElement == cellInput.element)cellInput.typing(e);
});

cellInput.element.addEventListener("focusin", () => { cellInput.focused = true });
cellInput.element.addEventListener("focusout", () => { cellInput.focused = false });

addEventListener("keydown", (keyboard) => {
    if (keyboard.key == "Control" && !pressedKeys.has("Control")) {
        if (selector.selected) {
            canvas.classList.add("cursor-addCell")
        }
    }
    pressedKeys.add(keyboard.key);
    if (keyboard.key == "Backspace" && selector.selected) {
        if(cellInput.element == document.activeElement){
            cellInput.erasing(keyboard);
        }
        else if(document.activeElement.type != "text" && document.activeElement.type != "number"){
            cellInput.checkFocus();
        }
        
    }
    else if (keyboard.key == "Delete") {
        if(widgetTools_base.selectedWidget){
            widgetTools_base.removeWidget();
        }
        selectedClearData();
    }
    else if (keyboard.key == "Enter") {
        afterCellEdit();
    }
    else if (keyboard.key == "c" && pressedKeys.has("Control")) {
        copiedStorage.saveData();
        keyboard.preventDefault();
    }
    else if (keyboard.key == "v" && pressedKeys.has("Control")) {
        copiedStorage.pasteData();
        keyboard.preventDefault();
    }
    else if (keyboard.key == "x" && pressedKeys.has("Control")) {
        copiedStorage.saveData(true);
        keyboard.preventDefault();
    }
    else if (["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp"].includes(keyboard.key)) {
        keyboard.preventDefault();
    }

    else if (!cellInput.focused && keyboard.key.length == 1) {
        if (document.activeElement.type != "text" && document.activeElement.type != "number") {
            cellInput.checkFocus();
        }
    }

    if (document.activeElement.tagName.toUpperCase() != "INPUT" && document.activeElement.tagName.toUpperCase() != "TEXTAREA") {
        if (keyboard.key == " ") {
            keyboard.preventDefault();
        }
    }
})

addEventListener("keyup", (keyboard) => {
    pressedKeys.delete(keyboard.key)
    if (keyboard.key == "Control") {
        canvas.classList.remove("cursor-addCell")
    }
    if (["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp"].includes(keyboard.key)) {
        MoveByArrows(keyboard.key);
        keyboard.preventDefault();
    }
})


addEventListener("click",(e)=>{selector.unselectInput(e)});
canvasContainer.addEventListener("mousemove",(e)=>{widgetTools_base.actionMove(e)});
canvasContainer.addEventListener("mouseup",(e)=>{widgetTools_base.actionEnd(e)});

canvasContainer.addEventListener("contextmenu",(e)=>{
    const element = document.getElementById("contextMenu");
    element.style.left = `${e.pageX}px`;
    element.style.top = `${e.pageY}px`;
    element.classList.add("show")
    e.preventDefault();
})
document.getElementById("resizer").addEventListener("mousedown",(e)=>{widgetTools_base.resizeStart(e)})

addEventListener("mousedown",(e)=>{
    if(e.button != 2) setTimeout(()=>{document.getElementById("contextMenu").classList.remove("show")},100);
})


if(localStorage.getItem("cookiesAproved") == null){
    newFile()
    askAboutCookies()
}
else{
    if(localStorage.getItem("auto-save") == null){
        newFile()
    }
    else{
        approveActionWindow.show(msg_loadFile,loadFromLocalStorage,newFile);
    }
}