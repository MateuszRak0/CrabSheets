//Prepare canvas and render Legend on it.
function prepareBoard(){
    resizeCanvas(canvas);
    ctx.clearRect(0,0,canvas.width,canvas.height)
    ctx.font = "bold 14px arial";
    ctx.strokeStyle = "#808080";
    for (let i = 0; i < 1001; i++) {
        new Legend(i, 0)
        if (i > 0 && i < 27) {
            new Legend(0, i);
        }
    }
    ctx.font = "normal 14px arial";
   // cellInput.prepareElement();
}

//Load symbols from json
const symbolsContainer = document.getElementById("collapse-symbol-container");
async function downloadSymbols() {
    const response = await fetch("https://raw.githubusercontent.com/w3c/html/master/entities.json");
    const symbols = await response.json();
    unpackSymbols(symbols)
}

function unpackSymbols(symbols){
    let makeBtn = function(symbol){
        let btn = document.createElement("button");
        btn.innerHTML = `<b>${symbol}</b>`;
        symbolsContainer.appendChild(btn);
        btn.classList.add("btn", "btn-dark", "btn-symbol","p-0");
    }

    let keys = Object.keys(symbols);

    for(let symbol of keys){
       makeBtn(symbol)
    }
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
openedFile = new File();
addScrolling("tool-bar-scroll-control",document.getElementById("tools-bar"));
addScrolling("available-sheets-scroll-control",document.getElementById("available-sheets"));


//Load Errors
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
new CalculationError("NAN","Uzyskany wynik to nie liczba. Dzieje się tak poprez błąd w zapisie np dodanie liczby do Tekstu","NaN","NaN");

//Event Listeners
document.getElementById("sheet-new").addEventListener("click",()=>{openedFile.addNewSheet()});
document.getElementById("sheet-copy").addEventListener("click", ()=>{openedFile.copySelectedSheet(openedFile)});
document.getElementById("sheet-remove").addEventListener("click", () => { openedFile.removeSelectedSheet() });

canvas.addEventListener("mousedown", (e) => { 
    selector.actionStart(e);
});

canvas.addEventListener( "mouseup", (e)=>{ selector.actionEnd(e) });

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
        if (selector.selected) { 
            cellInput.clearData();
            selector.selected.clearData();
            selector.resetOldData();
         }
        else{
            if (selector.selectedCells.size > 0) {
                for (let cell of selector.selectedCells) {
                    cell.text = "";
                    cell.refresh();
                }
            }
        }
        if(widgetTools_base.selectedWidget){
            widgetTools_base.removeWidget();
        }
    }
    else if (keyboard.key == "Enter") {
        if (selector.selected){
            canvas.classList.remove("cursor-addCell");
            selector.selected.refresh();
            selector.selected = false;
            cellInput.hide();
            display.restartData();
            hideFunctions();
        }
        if(selector.selectedCells.size > 0){
            selector.resetOldData();
        }

    }
    else if (keyboard.key == "c" && pressedKeys.has("Control")) {
        cellCopier.copy();
    }
    else if (keyboard.key == "v" && pressedKeys.has("Control")) {
        cellCopier.paste();
    }
    else if (keyboard.key == "x" && pressedKeys.has("Control")) {
        cellCopier.cut();
    }
    else if (["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp"].includes(keyboard.key)) {
        keyboard.preventDefault();
    }

    else if (!cellInput.focused && keyboard.key.length == 1) {
        if (document.activeElement.type != "text" && document.activeElement.type != "number") {
            cellInput.checkFocus();
        }
    }

    if (document.activeElement.type != "text" && document.activeElement.type != "number") {
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
document.getElementById("resizer").addEventListener("mousedown",(e)=>{widgetTools_base.resizeStart(e)})

fileInfo.load();
