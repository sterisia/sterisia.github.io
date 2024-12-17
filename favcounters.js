//FAVORABILITY COUNTERS------------------------------------------------------------------------------------------
var alphFavCt = localStorage.getItem("alphFavClick");
var ansFavCt = localStorage.getItem("ansFavClick");
var casFavCt = localStorage.getItem("casFavClick");
var solFavCt = localStorage.getItem("solFavClick");
var vegFavCt = localStorage.getItem("vegFavClick");


// ADDING POINTS TO ALPHERATZ ***FAVORABILITY*** COUNTER
function alphFavPlus(points){
    if (localStorage.alphFavCt){
        localStorage.alphFavCt = z(localStorage.alphFavCt) + parseInt(points);
    } else {
        localStorage.alphFavCt = parseInt(points);
    }
}

// ADDING POINTS TO ANSER ***FAVORABILITY*** COUNTER
function ansFavPlus(points){
    if (localStorage.ansFavCt){
        localStorage.ansFavCt = Number(localStorage.ansFavCt) + parseInt(points);
    } else {
        localStorage.ansFavCt = parseInt(points);
    }
}


// ADDING POINTS TO CASTOR ***FAVORABILITY*** COUNTER
function casFavPlus(points){
    if (localStorage.casFavCt){
        localStorage.casFavCt = Number(localStorage.casFavCt) + parseInt(points);
    } else {
        localStorage.casFavCt = parseInt(points);
    }
}



// ADDING POINTS TO SOL ***FAVORABILITY*** COUNTER
function solFavPlus(points){
    if (localStorage.solFavCt){
        localStorage.solFavCt = Number(localStorage.solFavCt) + parseInt(points);
    } else {
        localStorage.solFavCt = parseInt(points);
    }
}

// ADDING POINTS TO VEGA ***FAVORABILITY*** COUNTER
function vegFavPlus(points){
    if (localStorage.vegFavCt){
        localStorage.vegFavCt = Number(localStorage.vegFavCt) + parseInt(points);
    } else {
        localStorage.vegFavCt = parseInt(points);
    }
}


