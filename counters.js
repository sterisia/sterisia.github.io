// CHARACTER ENCOUNTER COUNTERS----------------------------------------------------------------------------------
var alphCharCt = localStorage.getItem("alphCharClick");
var ansCharCt = localStorage.getItem("ansCharClick");
var casCharCt = localStorage.getItem("casCharClick");
var solCharCt = localStorage.getItem("solCharClick");
var vegCharCt = localStorage.getItem("vegCharClick");


// ADDING POINTS TO ALPHERATZ ***CHARACTER ENCOUNTER*** COUNTER
function alphCharPlus(points){
    if (localStorage.alphCharCt){
        localStorage.alphCharCt = z(localStorage.alphCharCt) + parseInt(points);
    } else {
        localStorage.alphCharCt = parseInt(points);
    }
}

// ADDING POINTS TO ANSER ***CHARACTER ENCOUNTER*** COUNTER
function ansCharPlus(points){
    if (localStorage.ansCharCt){
        localStorage.ansCharCt = Number(localStorage.ansCharCt) + parseInt(points);
    } else {
        localStorage.ansCharCt = parseInt(points);
    }
}


// ADDING POINTS TO CASTOR ***CHARACTER ENCOUNTER*** COUNTER
function casCharPlus(points){
    if (localStorage.casCharCt){
        localStorage.casCharCt = Number(localStorage.casCharCt) + parseInt(points);
    } else {
        localStorage.casCharCt = parseInt(points);
    }
}



// ADDING POINTS TO SOL ***CHARACTER ENCOUNTER*** COUNTER
function solCharPlus(points){
    if (localStorage.solCharCt){
        localStorage.solCharCt = Number(localStorage.solCharCt) + parseInt(points);
    } else {
        localStorage.solCharCt = parseInt(points);
    }
}

// ADDING POINTS TO VEGA ***CHARACTER ENCOUNTER*** COUNTER
function vegCharPlus(points){
    if (localStorage.vegCharCt){
        localStorage.vegCharCt = Number(localStorage.vegCharCt) + parseInt(points);
    } else {
        localStorage.vegCharCt = parseInt(points);
    }
}


