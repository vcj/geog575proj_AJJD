//GOAL: Proportional symbols representing attribute values of mapped features
//STEPS:


//1. Create the Leaflet map (in createMap())
function createMap(){
    //create the map
    var map = L.map('map', {
        center: [-4, 20],
        zoom: 4,
        zoomControl: false
    });

    
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
	maxZoom: 16
    }).addTo(map)
    
    //move the zoom control
    L.control.zoom({
    position: 'topleft'
    }).addTo(map);

    
    
    //call getData function
    getData(map);
}



//calculate a color for each symbol for recent insufficient fcs
function calcColor(attValue) {
    //scale factor to adjust symbol size evenly
    return attValue >= .4 ? '#330000' :
    attValue >= .3 ? '#67000d' : // Means: if (d >= 1966) return 'green' else…
    attValue >= .2 ? '#a50f15' : // if (d >= 1960) return 'black' else etc…
    attValue >= .1 ? '#ef3b2c' :
    attValue >= .05 ? '#fb6a4a' : // Note that numbers must be in descending order
    attValue >= 0 ? '#fee0d2' : // Note that numbers must be in descending order
    '#fff5f0';
};



function style(feature) {
    return {
        fillColor: calcColor(feature.properties.Nov_2022),
        weight: .5,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}


// function for original symbology
function symbolize(data, map, attributes, viztypes,markersLayer){
    //create marker default options
    L.geoJson(data, {
        style:style
            }).addTo(map);

};




// Create Buttons to switch viz type
function selectVizType(map, data, attributes, viztype2) {
    //create 3 buttons
    $('#panel2').append('<button class="vis_select active" id="ppm" name="ppm" type="button">Recent Insufficient Food Consumption</button>')
    $('#panel2').append('<button class="vis_select" id="ppm_change" name="ppm_change" type="button">Female Average Educational Attainment (2017)</button>')
    $('#panel2').append('<button class="vis_select" id="ppm_pctChange" name="ppm_pctChange" type="button">Male Average Educational Attainment (2017))</button>')
    // set up listenters so that when clicked, a var will change that will be used in UpdatePropSymbols
    $('.vis_select').unbind().click(function(){
        //change color of selected button
        $('button').removeClass('active');
        $(this).addClass('active');
        // if the button is slected, change the viztype, then run manage, update
        if ($(this).attr('id') == 'ppm'){
            viztype2 = "ppm_viz"
            manageSequence(map,data, attributes, viztype2);
           updateLegend(map, data, attributes,viztype2);
            moveLegend(viztype2);
            ;}
         else if ($(this).attr('id') == 'ppm_change'){
            viztype2 = "ppm_change"
            manageSequence(map,data,attributes, viztype2);
            updateLegend(map, data, attributes,viztype2);
         moveLegend(viztype2);}
         
         else if ($(this).attr('id') == 'ppm_pctChange'){
            viztype2 = "ppm_pctChange"
            manageSequence(map,data,attributes, viztype2);
         updateLegend(map, data, attributes,viztype2);
             moveLegend(viztype2);
         }
    });
   
}



//get max from an object
function getMax(arr, prop) {
    var max = -Infinity;
    for (var i=0 ; i<arr.length ; i++) {
        //console.log(arr[i].properties[prop])
        if (max == null || parseInt(arr[i].properties[prop]) > 
            max)
            max = arr[i].properties[prop];
        //console.log(max)
    }
    return max;
}

//get max from an object
function getMin(arr, prop) {
    var min = Infinity;
    for (var i=0 ; i<arr.length ; i++) {
        if (min == null || parseInt(arr[i].properties[prop]) < min)
            min = arr[i].properties[prop];
    }
    return min;
}


//create original legend
function createLegend(map, data, attributes,viztype) {
    var legend2 = L.control({position: 'topleft'});
    legend2.onAdd = function(map) { 
    var div = L.DomUtil.create('div', 'colorLegend'),
    grades = [0,10,25,50,75,100,125];
    for (var i = 0; i < grades.length; i++) {
    div.innerHTML += '<i style="background:' + calcColor(grades[i] + 1) + '"></i> ' + grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
    };

	} // end createLegend();





//Step 2: Import GeoJSON data
function getData(map){
    //load the data
    var data = $.ajax("https://raw.githubusercontent.com/vcj/geog575proj_AJJD/main/data/GADM1_SSA_HungEdu.geojson", {
        dataType: "json",
        success: function(response){
             //create an attributes array, base year and base viz
            var attributes = ['Oct_2021','Nov_2021', 'Dec_2021', 'Jan_2022','Feb_2022','Mar_2022','Apr_2022','May_2022','Jun_2022','Jul_2022','Aug_2022','Sep_2022','Oct_2022','Nov_2022'];
            var viztype = "Nov_2022"
            symbolize(response, map,attributes,viztype);
            //addSearch(map, data);
            createLegend(map, data, attributes,viztype);
            selectVizType(map,data,attributes,viztype);
            moveLegend(viztype);
        }
    
    });
};



$(document).ready(createMap);


