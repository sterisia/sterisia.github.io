// // CHARACTER ENCOUNTER COUNTERS----------------------------------------------------------------------------------
// var alphCharCt = localStorage.getItem("alphCharClick");
// var ansCharCt = localStorage.getItem("ansCharClick");
// var casCharCt = localStorage.getItem("casCharClick");
// var solCharCt = localStorage.getItem("solCharClick");
// var vegCharCt = localStorage.getItem("vegCharClick");


// ADDING POINTS TO ALPHERATZ ***CHARACTER ENCOUNTER*** COUNTER
function alphCharPlus(points){
    if (localStorage.alphCharCt){
        localStorage.alphCharCt = Number(localStorage.alphCharCt) + parseInt(points);
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


// AVOIDING NULL VALUES
function babyProof(){
    if(localStorage.alphCharCt){
    } else {
        localStorage.alphCharCt = 0;
    }
    if(localStorage.ansCharCt){
    } else {
        localStorage.ansCharCt = 0;
    }
    if(localStorage.casCharCt){
    } else {
        localStorage.casCharCt = 0;
    }
    if(localStorage.solCharCt){
    } else {
        localStorage.solCharCt = 0;
    }
    if(localStorage.vegCharCt){
    } else {
        localStorage.vegCharCt = 0;
    }
}

// SUMMARY
function encountSummary(){
    babyProof();
    return Math.max(Number(localStorage.alphCharCt), Number(localStorage.ansCharCt), Number(localStorage.casCharCt), Number(localStorage.solCharCt), Number(localStorage.vegCharCt));
}
