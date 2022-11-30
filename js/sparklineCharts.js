//anychart.data.loadJsonFile('GADMO_SSA.json');

//});


//GOAL: Create popups for each map feature displaying name, most recent food consumption, and female and male mean years of educational attainment
        //and sparkline for food consption
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

//get min from an object
function getMin(arr, prop) {
    var min = Infinity;
    for (var i=0 ; i<arr.length ; i++) {
        if (min == null || parseInt(arr[i].properties[prop]) < min)
            min = arr[i].properties[prop];
    }
    return min;
}

//Step 2: Import GeoJSON data
function getData(map){
    var countryName = "NAME_0"
    //load the data
    var data = $.ajax("https://raw.githubusercontent.com/vcj/geog575proj_AJJD/main/data/GADM1_SSA_HungEdu.geojson", {
        dataType: "json",
        success: function(response){
            //create an attributes array, base year and base viz
            var attributes = ['Oct_2021','Nov_2021', 'Dec_2021', 'Jan_2022','Feb_2022','Mar_2022','Apr_2022','May_2022','Jun_2022','Jul_2022','Aug_2022','Sep_2022','Oct_2022','Nov_2022'];
            var viztype = "Nov_2022"
            symbolize(response, map,attributes,viztype);

            //Step 3: Create Popups
            //create popup content string
            L.geoJson(response, {
                pointToLayer: function(feature){
                    //for each feature determine value for attribute
                    var attValue = Number(feature.properties[attribute]);
                    //examine attribute to check that it is correct
                    console.log(feature.properties, attValue);

                    var layer = L.markersLayer;

                    var popupsContent = '<p><b>Country: </b>' + feature.attributes.NAME_0 + '</p>';
                    //bind popups to features
                    layer.bindPopup(popupsContent)

                    layer.on({
                        mouseover: function () {
                            this.openPopup();
                        },
                        mouseout: function () {
                            this.closePopup()
                        },
                    });
                    return layer;
                }
            })

        }

    });
};



$(document).ready(createMap);


