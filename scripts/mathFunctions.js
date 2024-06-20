// MathFunctions Functions
function showSimilarFunctions() {
    let myName = cellInput.wrotedText.toUpperCase() || "";
    myName = myName.replace("|","");
    let isSpecial = (specialSymbols.includes(myName[0])) ? true : false ;
    let basepercent = 100 / myName.length || "";
    for (let name of MathFunction.prototype.functionsNames) {


        let result = 0;
        for (let index = 0; index < name.length; index++) {
            let funcLetter = name.charAt(index)
            let writedLetter = myName.charAt(index)
            if (funcLetter == writedLetter && funcLetter != undefined) {
                result += basepercent
            }
            else if (name.charAt(index + 1) == myName.charAt(index) || name.charAt(index - 1) == myName.charAt(index)) {
                result += basepercent*.9;
            };
        }
        let mathFunc = MathFunction.prototype.functions.get(name)
        if(isSpecial){
            if(name[0] == myName[0]){
                mathFunc.element.classList.remove("hidden");
            }
            else{
                mathFunc.element.classList.add("hidden");
            }
        }else{
            if (result > 90) { mathFunc.element.classList.remove("hidden") }
            else { mathFunc.element.classList.add("hidden") }
        }



    }
    if (MathFunction.prototype.functionsContainer.classList.contains("hidden")) {
        if (selector.selected) {
            let cell = selector.selected
            MathFunction.prototype.functionsContainer.classList.remove("hidden")
            MathFunction.prototype.functionsContainer.style.left = `${cell.x - 3}px`
            MathFunction.prototype.functionsContainer.style.top = `${cell.y + cellSize.y}px`;
        }
    }
}

function hideFunctions() {
    cellInput.wrotedText = "";
    MathFunction.prototype.functionsContainer.classList.add("hidden")
}

function unpackGroup(group){
    if(typeof group === "string" && group[1] == "G"){
        let buffor = group.split('"');
        buffor = buffor[1].substring(1);
        buffor = buffor.split(",");
        return buffor
    }
    return group
}

function unpackAllGroups(values){
    let buffor = [];
    for(let value of values){
        if(value[1] == 'G'){
            let unpacked = unpackGroup(value);
            if(unpacked == value) return "@NAN";
            for(let value of unpacked){
                buffor.push(value)
            }
        }
        else{
            buffor.push(parseFloat(value));
        }
    }
    return buffor;
}

function makeDateString(date){
    let checkFormat = function(number){
        if(number < 10){ return `0${number}`}
        else{ return number }
    }

    let year = date.getFullYear();
    let month = checkFormat(date.getMonth()+1);
    let day = checkFormat(date.getDate());

    return `${year}-${month}-${day}`;
}

function sortValues(value1,value2){
    value1 = parseFloat(value1);
    value2 = parseFloat(value2);
    if(value1 > value2) return {smaler:value2, biger:value1}
    return {smaler:value1, biger:value2}
}


// MathFunction Object
class MathFunction{
    constructor(prefix,mathFunc,description = "Example Description",needElements = true,baseResult=0){
        this.prefix = prefix;
        this.mathFunc = mathFunc;
        this.needElements = needElements
        if(!MathFunction.prototype.functions){
            MathFunction.prototype.functionsContainer = document.getElementById("mathFunctions-container");
            MathFunction.prototype.functions = new Map();
            MathFunction.prototype.functionsNames = [];
        }
        MathFunction.prototype.functions.set(this.prefix,this)
        MathFunction.prototype.functionsNames.push(this.prefix)

        this.element = document.createElement("button")
        this.element.type = "button";
        this.element.classList.add("btn-add-function","btn","btn-sm","btn-outline-dark","mt-1","py-0")
        this.element.innerHTML = prefix;
        this.element.value = `|${this.prefix}|`;
        MathFunction.prototype.functionsContainer.appendChild(this.element);
        this.element.addEventListener("click",(e)=>{
            if(selector.selected){
                cellInput.saveFunction(e.target.value);
                hideFunctions();
            }
        })
        this.element.setAttribute("data-bs-toggle","tooltip");
        this.element.setAttribute("title",description);
        new bootstrap.Tooltip(this.element)
        this.baseResult = baseResult;
    }

    func(elements){
        if(this.needElements && elements){
            return this.mathFunc(elements);
        }
        else if(!this.needElements){
            if(elements && elements.length > 0){
                return "@NARG"
            }
            else{
                return this.mathFunc()
            }
        }
        else{
            return "@TOLOW"
        }
        
    }

    checkBoolean(res){
        if(res == `"true"` || res == "true"){
            return true
        }
        else if(res == `"false"` || res ==  "false" ){
            return false
        }
        else if(typeof res == "boolean"){ 
            return res
        }
    }
}

////============================ PODSTAWOWE ========================
// SUMA
new MathFunction("SUMA",function(values){
    values = unpackAllGroups(values);
    let result = 0;

    for(let value of values){
        value = parseFloat(value);
        result += value;
    }
    
    return result;
},"Zwraca wynik dodawania wszystkich podanych wartości ( może sumować elementy grupy )")


//ILOCZYN
new MathFunction("ILOCZYN",function(values){
    let result = 0;
    if(values.length == 2){
        result = values[0] * values[1];
    }
    else if(values.length > 2){
        return "@TOMORE"
    }
    else{
        return "@TOLOW";
    }
    return result;

},"Zwraca wynik mnożenia dwóch podanych wartości",true)


//ILORAZ
new MathFunction("ILORAZ",function(values){
    let result = 0;

        if(values.length == 2){
            if(values[0] == 0 || values[1] == 0) return "@/0"; 
            result = values[0] / values[1];
        }
        else if(values.length > 2){
            return "@TOMORE";
        }
        else{
            return "@TOLOW";
        }
        
    
    return result;

},"Zwraca wynik dzielenia dwóch podanych wartości",true)

//RESZTA
new MathFunction("RESZTA",function(value){
    if(value.length > 2){ return "@TOMORE" }
    else if(value.length < 2){ return "@TOLOW" }
    return value[0] % value[1];
},"Zwraca resztę z dzielenia",true)

// Pierwsiatek
new MathFunction("PIERWIASTEK",function(value){
    if(value.length > 1){ return "@TOMORE" }
    return Math.sqrt(value[0]);
},"Zwraca pierwiastek podanej liczby",true)

//SILNIA
new MathFunction("SILNIA",function(value){
    if(value.length > 1){ return "@TOMORE" }
    let buffor = 1;
    value = value[0];
    if(value <= 1) return buffor;
    for(let i = 2; i <= value; i++){
        buffor = buffor * i;
    }
    return buffor;
},"Oblicza silnie z liczby naturalnej",true)

//MEDIANA
new MathFunction("MEDIANA",function(values){
    values = unpackAllGroups(values);
    const mid = Math.floor(values.length / 2);
    values = values.sort((a, b) => a - b);
    if(values.length % 2 == 0){
        return ( values[mid-1] + values[mid] )/2
    }
    else{
        return values[mid]
    }

},"Oblicza mediane z przesłanych wartości i grup",true)

//DODATNIA
new MathFunction("DODATNIA",function(value){
    if(value.length > 1){ return "@TOMORE" }
    value = value[0];
    if(value < 0) return value*-1;
    return value

},"Zamienia wartość ujemną na dodatnią z wartościa dodatnią nie robi nic",true)

//==================== ŚREDNIE ================
//Arytmetyczna
new MathFunction("SREDNIA_A",function(values){
    values = unpackAllGroups(values);
    let result =  MathFunction.prototype.functions.get("SUMA").func(values);
    return result/values.length
},"Oblicza średnią arytmetyczną podanych wartości")

//Ważona
new MathFunction("SREDNIA_W",function(values){
    if(values.length < 2){ return "@TOLOW"; }
    if(values.length % 2 != 0) return "@NWEIGHT";
    let globalNumber = 0;
    let globalWeight = 0;
    for(let i=0; i < values.length; i+=2){
        let weight = parseFloat(values[i]);
        let numbers = unpackGroup(values[i+1]);
        if(typeof numbers === "string"){
            globalWeight += weight;
            globalNumber += (parseFloat(numbers)*weight)
        }
        else{
            globalWeight += (weight*numbers.length)
            for(let number of numbers){
                number = parseFloat(number) * weight;
                globalNumber += number;
            }
        }
    }
    return globalNumber/globalWeight;
},"Oblicza średnią Ważona gdzie wzór to: |SREDNIA_W|W1,N1,W2,N2... gdzie W = Waga , N = Liczba lub Grupa");

//============== PROCENTY ==================
new MathFunction("%POWIEKSZ",function(values){
    if(values.length > 2){ return "@TOMORE" }
    else if(values.length < 2){ return "@TOLOW" }
    const A =  parseFloat(values[0]); const B = parseFloat(values[1]);
    return A + (  ( A/100 ) * B  );
},"Powiększa wartość A a podany procent(B) wzór: |FUNC|A,B ",true);

new MathFunction("%POMNIEJSZ",function(values){
    if(values.length > 2){ return "@TOMORE" }
    else if(values.length < 2){ return "@TOLOW" }
    const A =  parseFloat(values[0]); const B = parseFloat(values[1]);
    return A - (  ( A/100 ) * B  );
},"Pomniejsza wartość A a podany procent(B) wzór: |FUNC|A,B ",true);

new MathFunction("%ILE_Z",function(values){
    if(values.length > 2){ return "@TOMORE" }
    else if(values.length < 2){ return "@TOLOW" }
    const A =  parseFloat(values[0]); const B = parseFloat(values[1]);
    if(A == 0) return 0
    return (B / Math.abs(A)) * 100;
},"Zwraca jaką wartościa procentową liczby A jest liczba B  wzór: |FUNC|A,B ",true);

new MathFunction("%ZAMIEN_ULAMEK",function(values){
    if(values.length > 1){ return "@TOMORE" }
    return values[0]*100 ;
},"Zamienia ułamek dziesiętny na procenty",true);

new MathFunction("%ZAMIEN_PROCENT",function(values){
    if(values.length > 1){ return "@TOMORE" }
    return values[0]/100 ;
},"Zamienia procenty na ułamek dziesiętny",true);

new MathFunction("%ROZNICA",function(values){
    if(values.length > 2){ return "@TOMORE" }
    else if(values.length < 2){ return "@TOLOW" }
    const A =  parseFloat(values[0]); const B = parseFloat(values[1]);
    return 100 - ( (A*100)/B );
    
},"O ile procent jedna wartość(A) wzrosła/zmalała w stosunku do drugiej(B)  wzór: |FUNC|A,B ",true);

//============== TRYGONOMETRIA I KĄTY ==================
//RADIANY
new MathFunction("RADIAN",function(value){
    if(value.length > 1){ return "@TOMORE" }
    return value*Math.PI/180;
},"Zamienia podaną wartość w stopniach na radiany",true)

//STOPNIE
new MathFunction("STOPNIE",function(value){
    if(value.length > 1){ return "@TOMORE" }
    return value*180/Math.PI;
},"Zamienia podaną wartość w radianach na stopnie",true)

// COSINUS
new MathFunction("COSINUS",function(value){
    if(value.length > 1){ return "@TOMORE" }
    return Math.cos(value[0])
},"Oblicza Wartość COSINUS dla podanej wartości.",true)

// TANGES
new MathFunction("TANGES",function(value){
    if(value.length > 1){ return "@TOMORE" }
    return Math.tan(value[0])
},"Oblicza Wartość TANGES dla podanej wartości.",true)

// SINUS
new MathFunction("SINUS",function(value){
    if(value.length > 1){ return "@TOMORE" }
    else if(value.length == 0){return "@EMPTY"}
    return Math.sin(value[0])
},"Oblicza Wartość SINUS dla podanej wartości.",true)

// ODLEGŁOŚĆ 2D
new MathFunction("DYSTANS:2D",function(values){
    if(values.length > 4){ return "@TOMORE" }
    else if(values.length < 4){return "@TOLOW"}
    let x = sortValues(values[0],values[2]);
    let y = sortValues(values[1],values[3]);
    let a = x.biger - x.smaler;
    let b = y.biger - y.smaler;
    a = Math.pow(a,2); b = Math.pow(b,2);
    let c = a+b;
    c = Math.sqrt(c);

    return c.toFixed(5);
},"Oblicza dystans od punktów na osi X/Y gdzie wzór to |FUNC|x1,y1,x2,y2",true)


//=================================== FUNCKJE NA ZBIORACH =============================================
// Mapa
new MathFunction("MAPA",function(values){
    if(values.length < 3) return "@TOLOW"
    let key = `${values.shift()}`;
    if(values.length % 2 != 0) return "@NPAIRS";
    let map = new Map();
    for(let i = 0; i < values.length; i+= 2){
        map.set(values[i],values[i+1])
    }
    let res = map.get(key)
    if(res) return res;
    return false;
    
    
},"Tworzy zestawienie klucz:wartość gdzie klucz musi być unikatowy wzór na stworzenie to |MAPA|A,B1,C1,B2,C2 gdzie: A = komórka w której wpisany zostanie klucz aby wyciągnąc wartość     B- Klucz  C- Wartość",true)

//grupa
const makeGroup = new MathFunction("GRUPA",function(values){
    values = unpackAllGroups(values);
    let buffor = '"G';
    for(let value of values){
        buffor += value +","
    }
    return buffor.slice(0,buffor.length-1) + '"';
},"Tworzy grupe z przesłanych wartości dla poźniejszych funkcji. UWAGA grupa może być wykorzystana tylko w przeznaczonych dla niej funkcjach lub komponentach",true)

new MathFunction("GRUPA:DODAJ",function(values){
    let operator = values.shift();
    operator = parseFloat(operator);
    values = unpackAllGroups(values);
    let buffor = [];
    for(let value of values){
        value = parseFloat(value);
        buffor.push(value+operator);
    }
    return makeGroup.func(buffor);
},"Tworzy grupę z podanych elementów + X wzór |FUNC|X,elementy...",true)

new MathFunction("GRUPA:WYJMIJ",function(values){
    if(values.length < 2) return "@TOLOW";
    values = unpackAllGroups(values);
    let key = values.pop();
    return values[key-1] ;
},"Wyjmuje wartość z grupy(A) po indeksie(B) licząc od początku wzór: |FUNC|A,B",true)

new MathFunction("GRUPA:MINUS",function(values){
    let operator = values.shift();
    operator = parseFloat(operator);
    values = unpackAllGroups(values);
    let buffor = [];
    for(let value of values){
        value = parseFloat(value);
        buffor.push(value-operator);
    }
    return makeGroup.func(buffor);
},"Tworzy grupę z podanych elementów - X wzór |FUNC|X,elementy...",true)

new MathFunction("GRUPA:POMNOZ",function(values){
    let operator = values.shift();
    operator = parseFloat(operator);
    values = unpackAllGroups(values);
    let buffor = [];
    for(let value of values){
        value = parseFloat(value);
        buffor.push(value*operator);
    }
    return makeGroup.func(buffor);
},"Tworzy grupę z podanych elementów * X wzór |FUNC|X,elementy...",true)

new MathFunction("GRUPA:PODZIEL",function(values){
    let operator = values.shift();
    operator = parseFloat(operator);
    values = unpackAllGroups(values);
    let buffor = [];
    for(let value of values){
        value = parseFloat(value);
        buffor.push(value/operator);
    }
    return makeGroup.func(buffor);
},"Tworzy grupę z podanych elementów * X wzór |FUNC|X,elementy...",true)

new MathFunction("GRUPA:POTEGA",function(values){
    let operator = values.shift();
    operator = parseFloat(operator);
    values = unpackAllGroups(values);
    let buffor = [];
    for(let value of values){
        value = parseFloat(value);
        buffor.push(Math.pow(value,operator));
    }
    return makeGroup.func(buffor);
},"Tworzy grupę z podanych elementów ^ X wzór |FUNC|X,elementy...",true)

new MathFunction("GRUPA:PIERWIA",function(values){
    values = unpackAllGroups(values);
    let buffor = [];
    for(let value of values){
        value = parseFloat(value);
        buffor.push(Math.sqrt(value));
    }
    return makeGroup.func(buffor);
},"Tworzy grupę z wyników pierwiastkowania podanych elementów",true)

//max wartosc
new MathFunction("NAJWIEKSZA",function(values){
    values = unpackAllGroups(values);
    return Math.max(...values)
},"Zwraca największa wartość z wszystkich przesłanych argumentów lub przesłanych grup",true)

//min wartosc
new MathFunction("NAJMNIEJSZA",function(values){
    values = unpackAllGroups(values);
    return Math.min(...values)
},"Zwraca najmniejsza wartość z wszystkich przesłanych argumentów lub przesłanych grup",true)


//=============================== FUNKCJE CZASU  ============================================

// YYYY.MM.DD
const $getDate = new MathFunction("_DATA:DZIS",function(values){
    let date = new Date();
    return makeDateString(date);
},"Zwraca dzisiejszą date w formacie 'Rok-Miesiąc-Dzień' Data będzie się aktualizowac przy każdym odpaleniu arkusza",false);

new MathFunction("_DATA:OBLICZ",function(values){
    console.log(values)
    if(values.length<2){ return "@TOLOW" }
    else if (values.length > 2){ return "@TOMORE" }
    const timestamp24 = 86400; // 24h in seconds
    let date;
    let days = parseFloat(values[1]);
    date = Date.parse(values[0]); 
    days = days * timestamp24;
    date = date + (days*1000);
    date = new Date(date);
    return makeDateString(date);

},"Dodaje lub odejmuje dni od daty wzór: |FUNC|DATA,DNI   gdzie wartość dni może być ujemna lub dodatnia  ",true);


// MIESIAC
const $getMonth = new MathFunction("_MSC",function(values){
    if(values.length > 1){ return "@TOMORE" }
    else{
        let number = `${values[0]}`;
        switch(number){
            case "1":
                return "Styczeń";
            case "2":
                return "Luty"
            case "3":
                return "Marzec"
            case "4":
                return "Kwiecień"
            case "5":
                return "Maj";
            case "6":
                return "Czerwiec"
            case "7":
                return "Lipiec"
            case "8":
                return "Sierpień"
            case "9":
                return "Wrzesień";
            case "10":
                return "Październik"
            case "11":
                return "Listopad"
            case "12":
                return "Grudzień"
        }
    }
    return this.baseResult;

    
},"Zwraca nazwe miesiąca z podanej liczby np: |_MSC|1 = Styczeń",true,"@VALUE");

// DZIEN
const $getDay = new MathFunction("_DZIEN",function(values){
    if(values.length > 1){ return "@TOMORE" }
    else{
        let number = `${values[0]}`;
        switch(number){
            case "1":
                return "Poniedziałek";
            case "2":
                return "Wtorek"
            case "3":
                return "Środa"
            case "4":
                return "Czwartek"
            case "5":
                return "Piątek"
            case "6":
                return "Sobota"
            case "7":
                return "Niedziela"
        }
    }
    return this.baseResult;

    
},"Zwraca nazwe dnia tygodnia z podanej liczby np: |FUNC|2 = Wtorek",true,"@VALUE");

// TIME HH:MM:SS
const $getTime = new MathFunction("_CZAS",function(values){
    let date = new Date();

    let checkFormat = function(number){
        if(number < 10){ return `0${number}`; }
        else{ return number;  }
    }

    let hour = checkFormat(date.getHours());
    let minutes = checkFormat(date.getMinutes());
    let seconds = checkFormat(date.getSeconds());

    return `${hour}:${minutes}:${seconds}`;
},"Zwraca dokładny czas w formacie Godziny : Minuty : Sekundy",false);

// ++++++++++++++++++++++++++++++++++ STALE MATEMATYCZNE +++++++++++++++++++++++++++++++++++++++++
new MathFunction("$PI",function(values){
    return Math.PI;
},"Zwraca stałą matematyczną PI",false);

new MathFunction("$E",function(values){
    return Math.E;
},"Zwraca stałą Eulera - podstawe logarytmu naturalnego",false);

const phi = (1 + Math.sqrt(5)) / 2;

new MathFunction("$PHI",function(values){
    return phi;
},"Zwraca tzw. liczbę złotego podziału -> &Phi; ",false);

//++++++++++++++++++++++++++++++ BRAMKI I FUNKCJE LOGICZNE ++++++++++++++++++++++++++++++++++++++++++++++

// WIEKSZE
new MathFunction("&BIGGER",function(values){
    if(values.length < 2){return "@TOLOW";}
    let operator = values.shift();
    values = unpackAllGroups(values);
    let result = true;
    for(let value of values){  if(value < operator) result = false; } 
    return result;
},"Zwraca TRUE gdy wszystkie elementy są większe niz wartość X wzór: |FUNC|X,Elementy..",true)

// MNIEJSZE
new MathFunction("&SMALLER",function(values){
    if(values.length < 2){return "@TOLOW";}
    let operator = values.shift();
    values = unpackAllGroups(values);
    let result = true;
    for(let value of values){  if(value > operator) result = false; } 
    return result;
},"Zwraca TRUE gdy wszystkie elementy są mniejsze niz wartość X wzór: |FUNC|X,Elementy..",true)

//ROWNE
new MathFunction("&EQUAL",function(values){
    
    if(values.length == 1) return false;
    if(values.length == 2){
        result = values[0] == values[1];
    }
    else if(values.length > 2){
        return "@TOMORE"
    }

return result;

},"Porównuje dwie wartości i zwraca TRUE lub FALSE",true,true)

new MathFunction("&NOT",function(values){
    if(values.length > 1) return "@TOMORE";
    let a = this.checkBoolean(values[0]);
    if(typeof a == "undefined") return "@NLOGIC";
    if(a) return false
    return true

},"Bramka logiczna NOT - Przyjmuje jeden argument logiczny (true/false)",true);

new MathFunction("&AND",function(values){
    if(values.length > 2) return "@TOMORE";
    if(values.length < 2) return "@TOLOW";
    let a = this.checkBoolean(values[0]);
    let b = this.checkBoolean(values[1]);
    console.log(a,b,values)
    if(typeof a == "undefined" || typeof b == "undefined") return "@NLOGIC";
    if(a == true && b == true) return true
    return false

},"Bramka logiczna AND - Przyjmuje dwa argumenty logiczne (true/false)",true);

new MathFunction("&OR",function(values){
    if(values.length > 2) return "@TOMORE";
    if(values.length < 2) return "@TOLOW";
    let a = this.checkBoolean(values[0]);
    let b = this.checkBoolean(values[1]);
    if(typeof a == "undefined" || typeof b == "undefined") return "@NLOGIC";
    if(a || b) return true
    return false
},"Bramka logiczna OR - Przyjmuje dwa argumenty logiczne (true/false)",true);

new MathFunction("&XOR",function(values){
    if(values.length > 2) return "@TOMORE";
    if(values.length < 2) return "@TOLOW";
    let a = this.checkBoolean(values[0]);
    let b = this.checkBoolean(values[1]);
    if(typeof a == "undefined" || typeof b == "undefined") return "@NLOGIC";
    if(a == b) return false
    return true
},"Bramka logiczna XOR - Przyjmuje dwa argumenty logiczne (true/false)",true);

new MathFunction("&SIM FALSE",function(values){
    console.log(values)
    if(values.length > 1) return "@TOMORE";
    let a = this.checkBoolean(values[0]);
    if(typeof a == "undefined") return false;
    return a
},"Symulator wartości logicznej FALSE: Przyjmuje jeden adres komórki jako argument. Jeżeli komórka jest pusta lub posiada wartość nielogiczną (lub logiczna inną niż 'false') zwraca false",true);

new MathFunction("&SIM TRUE",function(values){
    if(values.length > 1) return "@TOMORE";
    let a = this.checkBoolean(values[0]);
    if(typeof a == "undefined") return  true;
    return a
},"Symulator wartości logicznej TRUE: Przyjmuje jeden adres komórki jako argument. Jeżeli komórka jest pusta lub posiada wartość nielogiczną (lub logiczna inną niż 'true') zwraca true",true);

new MathFunction("&SWITCH",function(values){
    if(values.length > 3) return "@TOMORE";
    else if(values.length < 3) return "@TOLOW";
    let res = this.checkBoolean(values[0]);
    if(typeof res == "undefined"){
        return "@NLOGIC"
    }
    else{
        if(res){
            return values[1]
        }
        else{
            return values[2]
        }
    }
},"Zwraca wartość zależnie od przesłanego argumentu prawda/fałsz gdzie wzór to |SWITCH|A,B,C gdzie A - true/False  |  B - Wartość zwracana gdy true  |  C - Wartość zwracana gdy false",true);



class Unit{
    constructor(prefix,name){
        this.prefix = " " + prefix;
        this.name = name;
    }
}

// UNITS
const unitsMenager = {
    selectNode:document.getElementById("units-select-category"),
    units:{},

    addUnit:function(unit,category){
        if(!this.units[category]){
            this.units[category] = [];
            let optionNode = document.createElement("option");
            optionNode.value = category;
            optionNode.innerHTML = category;
            this.selectNode.appendChild(optionNode)
            if(!this.selectNode.value){ optionNode.selected = true }
        } 
        this.units[category].push(unit);
    },

    loadUnitsCategory:function(category){
        const unitsBox = document.getElementById("units-select");
        unitsBox.innerHTML = "";
        let units = this.units[category];
        for(let unit of units){
            let unitNode = document.createElement("option");
            unitNode.value = unit.prefix;
            unitNode.innerHTML = `${unit.prefix} - ${unit.name}`;
            unitsBox.appendChild(unitNode);
        }
    }
};

document.getElementById("units-select-category").addEventListener("input",(e)=>{unitsMenager.loadUnitsCategory(e.target.value)});


unitsMenager.addUnit(new Unit( "PLN" , "Polski Złoty") , "waluta" );
unitsMenager.addUnit(new Unit( "EUR" , "Euro") , "waluta" );
unitsMenager.addUnit(new Unit( "USD" , "Dolar amerykański") , "waluta" );
unitsMenager.addUnit(new Unit( "CAD" , "Dolar kanadyjski") , "waluta" );
unitsMenager.addUnit(new Unit( "AED" , "Dirham ZEA") , "waluta" );
unitsMenager.addUnit(new Unit( "JPY" , "Jen japoński") , "waluta" );
unitsMenager.addUnit(new Unit( "GBP" , "Funt brytyjskiy") , "waluta" );
unitsMenager.addUnit(new Unit( "CHF" , "Frank szwajcarski") , "waluta" );
unitsMenager.addUnit(new Unit( "SEK" , "Szwedzka korona") , "waluta" );


unitsMenager.addUnit(new Unit( "g" , "Gram") , "masa" );
unitsMenager.addUnit(new Unit( "dag" , "Dekagram") , "masa" );
unitsMenager.addUnit(new Unit( "kg" , "Kilogram") , "masa" );
unitsMenager.addUnit(new Unit( "t" , "Tona") , "masa" );
unitsMenager.addUnit(new Unit( "lb" , "Funt") , "masa" );
unitsMenager.addUnit(new Unit( "oz" , "uncja") , "masa" );

unitsMenager.addUnit(new Unit( "mm" , "milimetr") , "dystans" );
unitsMenager.addUnit(new Unit( "cm" , "centymetr") , "dystans" );
unitsMenager.addUnit(new Unit( "dm" , "decymetr") , "dystans" );
unitsMenager.addUnit(new Unit( "m" , "metr") , "dystans" );
unitsMenager.addUnit(new Unit( "km" , "kilometr") , "dystans" );

unitsMenager.addUnit(new Unit( "m/s" , "metr na sekunde") , "predkosc" );
unitsMenager.addUnit(new Unit( "km/h" , "kilometr na godzine") , "predkosc" );
unitsMenager.addUnit(new Unit( "mph" , "mila na godzine") , "predkosc" );
unitsMenager.addUnit(new Unit( "kt" , "wezel ( mila morska na gordzine )") , "predkosc" );
unitsMenager.addUnit(new Unit( "ma" , "mach") , "predkosc" );

unitsMenager.addUnit(new Unit( "°C" , "stopień Celsjusza") , "temperatura" );
unitsMenager.addUnit(new Unit( "°F" , "stopień Farentheita") , "temperatura" );
unitsMenager.addUnit(new Unit( "°R" , "stopień Reaumura") , "temperatura" );
unitsMenager.addUnit(new Unit( "°Rank" , "stopień Rankina") , "temperatura" );
unitsMenager.addUnit(new Unit( "K" , "Kelvin") , "temperatura" );

unitsMenager.addUnit(new Unit( "Pa" , "Paskal") , "ciśnienie" );
unitsMenager.addUnit(new Unit( "bar" , "Bar") , "ciśnienie" );
unitsMenager.addUnit(new Unit( "kPa" , "Kilopaskal") , "ciśnienie" );
unitsMenager.addUnit(new Unit( "MPa" , "Megapaskal") , "ciśnienie" );
unitsMenager.addUnit(new Unit( "psi" , "funt na cal kwadratowy") , "ciśnienie" );

unitsMenager.addUnit(new Unit( "mm²", "milimetr kwadratowy") , "obszar" );
unitsMenager.addUnit(new Unit( "cm²", "centymetr kwadratowy	") , "obszar" );
unitsMenager.addUnit(new Unit( "dm²", "decymetr kwadratowy") , "obszar" );
unitsMenager.addUnit(new Unit( "m²" , "metr kwadratowy") , "obszar" );
unitsMenager.addUnit(new Unit( "a" , "ar ( 100m² )") , "obszar" );
unitsMenager.addUnit(new Unit( "ha" , "hektar ( 10 000m² )") , "obszar" );
unitsMenager.addUnit(new Unit( "km²" , "kilometr kwadratowy ( 1 000 000m² )") , "obszar" );

unitsMenager.addUnit(new Unit( "yr" , "Rok") , "czas" );
unitsMenager.addUnit(new Unit( "d" , "Dzień") , "czas" );
unitsMenager.addUnit(new Unit( "hr" , "Godzina") , "czas" );
unitsMenager.addUnit(new Unit( "min" , "Minuta") , "czas" );
unitsMenager.addUnit(new Unit( "s" , "Sekunda") , "czas" );

unitsMenager.addUnit(new Unit( "HP" , "Angielski koń parowy") , "moc" );
unitsMenager.addUnit(new Unit( "PS" , "Koń mechaniczny") , "moc" );
unitsMenager.addUnit(new Unit( "W" , "Wat") , "moc" );


unitsMenager.loadUnitsCategory(Object.keys(unitsMenager.units)[0]);







function packFunctions(){
        let packed = [];
        for(let functionName of MathFunction.prototype.functionsNames){
            let buffor = {};
            let functionObject = MathFunction.prototype.functions.get(functionName);
            if(functionObject){
                buffor.prefix = functionObject.prefix;
                buffor.description = functionObject.element.dataset.bsOriginalTitle;
                buffor.category = "NONE";
                packed.push(buffor);
            }
        }
        let data = JSON.stringify(packed);
        let file = new Blob([data], { type: "text/plain" })
        let a = document.getElementById("fileDownloadLink");
        a.href = URL.createObjectURL(file);
        a.download = "mathFunctions.json";
        a.click();
}