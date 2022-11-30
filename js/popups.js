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




//add search - this was very annoying had to add on the same points again as a Marker layer but transparent
function addSearch(map, data) {
    var markersLayer = new L.LayerGroup();	//layer contain searched elements
    map.addLayer(markersLayer);
    var controlSearch = new L.Control.Search({
        position:'topleft',
        layer: markersLayer,
        initial: true,
        zoom: 8,
        marker: false
    });
    map.addControl( controlSearch );
    var circleIcon = L.icon({
        iconUrl: 'img/circle-outline-svgrepo-com.svg',
        iconSize:     [1, 1], // size of the icon
    });
    var geojsonMarkerOptions2 = {
        radius: 1,
        fillColor: "#ff7800",
        color: "#000",
        weight: 0,
        opacity: 0,
        fillOpacity: 0,
        title: title
    };
    //console.log(data.responseJSON.features[1].properties)
    for(i in data.responseJSON.features) {
        var title = data.responseJSON.features[i].properties.NAME_1,	//value searched
            loc_lat = data.responseJSON.features[i].properties.lon_cent,
            loc_lon = data.responseJSON.features[i].properties.lat_cent
        //position found
        marker = new L.Marker( new L.latLng([loc_lon, loc_lat]), {title:title, icon:circleIcon, opacity:0, fillOpacity:0} )
        markersLayer.addLayer(marker);
    }
}

//calculate a color for each symbol for recent insufficient fcs
function initColor(attValue) {
    //scale factor to adjust symbol size evenly
    return attValue == "High IFC, High Edu" ? '#574249' :
        attValue == "High IFC, Low Edu" ? '#c85a5a' : // Means: if (d >= 1966) return 'green' else…
            attValue == "Lower  IFC, High Edu" ? '#64acbe' : // if (d >= 1960) return 'black' else etc…
                attValue == "Lower IFC, Low Edu" ? '#e8e8e8' :
                    attValue == "No Data" ? '#ffffff' : // Note that numbers must be in descending order
                        '#6c83b5';
};


//calculate a color for each symbol for recent insufficient fcs
function initColorBorder(attValue, attValue2) {
    //scale factor to adjust symbol size evenly
    return  (attValue == "Rising 2" && attValue2 == "High IFC, High Edu") ? '#FFE43E' :
        '#FFFFFF';
};

//calculate a color for each symbol for recent insufficient fcs
function initBorderWeight(attValue, attValue2) {
    //scale factor to adjust symbol size evenly
    return (attValue == "Rising 2" && attValue2 == "High IFC, High Edu") ? 2 :
        .5;
};

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
//calculate a color for each symbol for recent insufficient fcs

function calcColorEdu(attValue) {
    //scale factor to adjust symbol size evenly
    return attValue >= 12 ? '#08589e' :
        attValue >= 10 ? '#2b8cbe' : // Means: if (d >= 1966) return 'green' else…
            attValue >= 8 ? '#4eb3d3' : // if (d >= 1960) return 'black' else etc…
                attValue >= 6 ? '#7bccc4' :
                    attValue >= 4 ? '#a8ddb5' : // Note that numbers must be in descending order
                        attValue >= 2 ? '#ccebc5' : // Note that numbers must be in descending order
                            '#f0f9e8';
};




function style(feature) {
    return {
        fillColor: initColor(feature.properties.Food_Edu),
        weight: initBorderWeight(feature.properties.Hunger_Ris, feature.properties.Food_Edu),
        opacity: 1,
        color: initColorBorder(feature.properties.Hunger_Ris, feature.properties.Food_Edu),
        fillOpacity: 0.7
    };
}

function style2(feature) {
    return {
        weight: 1,
        opacity: 1,
        color: "#6E6E6E",
        fillOpacity: 0
    };
}


// function for original symbology
function symbolize(data, map){
    //create marker default options
    L.geoJson(data, {
        style:style
    }).addTo(map);

};
// function for original Country Lines
function symbolizeLines(data, map){
    $.getJSON("https://raw.githubusercontent.com/vcj/geog575proj_AJJD/main/data/GADM0_SSA.geojson",function(data2){
        // L.geoJson function is used to parse geojson file and load on to map
        L.geoJson(data2, {
            style:style2
        }).addTo(map);
    });
};


//Step 10: update symbology based on the feature
function updatePropSymbols(map, attribute,viztypef){
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            viz_type = viztypef
            var props = layer.feature.properties;
            //console.log(props)
            // set up vars for this attribute
            var curVal = Number(props[attribute]);
            //update color and size if female education
            if (viz_type == "Female_Edu"){
                var fillColo = calcColorEdu(curVal);
                layer.setStyle({fillColor:fillColo});}
            //update color and size if percent change
            if (viz_type == "Male_Educa"){
                var fillColo = calcColorEdu(curVal);
                layer.setStyle({fillColor:fillColo});}
            //update color and size if percent change
            if (viz_type == "Food_Edu"){
                var curVal = props[attribute]
                var fillColo = initColor(curVal);
                layer.setStyle({fillColor:fillColo});}
            //update color and size if percent change
            else if ( viz_type == "ppm_pctChange") {
                var radius = calcPropRadius(pctChgVal);
                layer.setRadius(radius);
                var fillColo = calcColorPctChange(pctChgVal);
                layer.setStyle({fillColor:fillColo});}
        };
    });
};


function createControls(map,year,vizType){
    $('#panel').append('<button class="skip" id="reverse">Previous Month</button>');
    //create range input element (slider)
    $('#panel').append('<input class="range-slider" type="range">');
    //set slider attributes
    $('.range-slider').attr({
        max: 21,
        min: 0,
        value: 0,
        step: 1
    });
    $('#panel').append('<button class="skip" id="curr_year">' + vizType +'</button>');
    $('#panel').append('<button class="skip" id="forward">Next Month</button>');

};

// Create Buttons to switch viz type
function selectVizType(map, data, attributes, viztype2) {
    //create 3 buttons
    $('#panel2').append('<button class="vis_select active" id="result" name="result" type="button">Top Locations to Target</button>')
    $('#panel2').append('<button class="vis_select" id="ifs" name="ifs" type="button">Recent Insufficient Food Consumption</button>')
    $('#panel2').append('<button class="vis_select" id="f_edu" name="f_edu" type="button">Female Average Educational Attainment (2017)</button>')
    $('#panel2').append('<button class="vis_select" id="m_edu" name="m_edu" type="button">Male Average Educational Attainment (2017)</button>')
    // set up listenters so that when clicked, a var will change that will be used in UpdatePropSymbols
    $('.vis_select').unbind().click(function(){
        //change color of selected button
        $('button').removeClass('active');
        $(this).addClass('active');
        // if the button is slected, change the viztype, then run manage, update
        if ($(this).attr('id') == 'result'){
            viztype2 = "Food_Edu"
            updatePropSymbols(map, attributes[16],viztype2);
            updateLegend(map, data, attributes,viztype2);
            moveLegend(viztype2);
            ;}
        else if ($(this).attr('id') == 'ifs'){
            viztype2 = "Oct_2021"
            var month = "Oct_2021"
            createControls(map,month,viztype2)
            manageSequence(map,data,attributes, viztype2);
            updateLegend(map, data);}
        else if ($(this).attr('id') == 'f_edu'){
            viztype2 = "Female_Edu"
            updatePropSymbols(map, attributes[14],viztype2);
            updateLegend(map, data, attributes,viztype2);
            moveLegend(viztype2);}

        else if ($(this).attr('id') == 'm_edu'){
            viztype2 = "Male_Educa"
            updatePropSymbols(map, attributes[15],viztype2);
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
            var attributes = ['Oct_2021','Nov_2021', 'Dec_2021', 'Jan_2022','Feb_2022','Mar_2022','Apr_2022','May_2022','Jun_2022','Jul_2022','Aug_2022','Sep_2022','Oct_2022','Nov_2022', 'Female_Edu', 'Male_Educa', 'Food_Edu'];
            var viztype = "Nov_2022"
            symbolize(response, map,attributes,viztype);
            symbolizeLines(data, map);
            addSearch(map, data);
            createLegend(map, data, attributes,viztype);
            selectVizType(map,data,attributes,viztype);


            var countryName = data.responseJSON.features[i].properties.NAME_0,
                provinceName = data.responseJSON.features[i].properties.NAME_1,
                foodConsumption = data.responseJSON.features[i].properties.NOV_2022
            //for each feature determine the value for the attribute
            //var attValue = Number(.properties[countryName]);
            //examine attribute value to check that it is correct
            //console.log(feature.properties, attValue);
            //create a layer for the popups
            var popupLayer = L.markersLayer;
            //designate simple popup string
            var popupContent = '<p><b>Country: </b>' + countryName + '</p>';
            //bind popups to features
            popupLayer.bindPopup(popupContent);

            popupLayer.on({
                mouseover: function () {
                    this.openPopup();
                },
                mouseout: function () {
                    this.closePopup()
                },
            });
            return popupLayer;

        }

    });
};



$(document).ready(createMap);