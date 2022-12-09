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
    console.log(data.responseJSON.features[175].properties)
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
    return attValue*1 >= .4 ? '#330000' :
    attValue*1 >= .3 ? '#67000d' : // Means: if (d >= 1966) return 'green' else…
    attValue*1 >= .2 ? '#a50f15' : // if (d >= 1960) return 'black' else etc…
    attValue*1 >= .1 ? '#ef3b2c' :
    attValue*1 >= .05 ? '#fb6a4a' : // Note that numbers must be in descending order
    attValue*1 >= -.0001 ? '#fee0d2' : // Note that numbers must be in descending order
    attValue*1 >= -999 ? '#fff5f0' :
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



function onEachFeature(feature,layer) {
    var countryName = feature.properties.NAME_0;
    var regionName = feature.properties.NAME_1;
    if (feature.properties.Nov_2022 == -.1) { 
         var nov22Food = "No Data"} else
     {var nov22Food = (feature.properties.Nov_2022*100).toFixed(1)};
    var femaleEdu = feature.properties.Female_Edu.toFixed(1);
    var maleEdu = feature.properties.Male_Educa.toFixed(1);
    var popupContent = '<b>' + regionName + ', ' + countryName + '</b><br>' +
        'Insufficient Food Consumption (Nov 2022): <b>' + nov22Food+ '%</b><br>Female Avg. Years of Educational Attainment: <b>'
        + femaleEdu + '</b><br>Male Avg Years of Educational Attainment: <b>' + maleEdu + '</b><br>Insufficient Food Consumption Trend: ';
    //working on sparkline
    var featureList =[feature.properties.Oct_2021,feature.properties.Nov_2021,feature.properties.Dec_2021,feature.properties.Jan_2022,feature.properties.Feb_2022,feature.properties.Mar_2022,feature.properties.Apr_2022,feature.properties.May_2022,feature.properties.Jun_2022,feature.properties.Jul_2022,feature.properties.Aug_2022,feature.properties.Sep_2022,feature.properties.Oct_2022,feature.properties.Nov_2022]
    var div = $('<div id="container' + feature.properties.FID +'" style="width: 267px; height:80px;">'+popupContent+'<svg/></div>')[0]
    // create charts
    var ele = document.getElementById('container'+feature.properties.FID );
    //console.log(ele)
    //ele.innerHTML(popupContent)
    var svg = d3.select(div).select("svg").attr("width", 60).attr("height", 20);
    
    var xScale = d3.scaleLinear()
      .domain([0, 13])
      .range([10, 50]) // 600 is our chart width

    var yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([20, 0]) // 400 is our chart height
            
    var line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
    
    var gradientColor = (p) => {
    return d3.interpolateHslLong("red", "blue")((p[0].value-bounds[0])/interval);
  };
    
    svg
      .append('path') // add a path to the existing svg
      .datum([
    { x: 0,   y: feature.properties.Oct_2021 },
    { x: 1,  y: feature.properties.Nov_2021 },
    { x: 2,  y: feature.properties.Dec_2021 },
    { x: 3,  y: feature.properties.Jan_2022 },
    { x: 4,  y: feature.properties.Feb_2022 },
    { x: 5, y: feature.properties.Mar_2022 },
    { x: 6,  y: feature.properties.Apr_2022 },
    { x: 7,  y: feature.properties.May_2022 },
    { x: 8,  y: feature.properties.Jun_2022 },
    { x: 9,  y: feature.properties.Jul_2022 },
    { x: 10, y: feature.properties.Aug_2022 },
    { x: 11,  y: feature.properties.Sep_2022 },
    { x: 12,  y: feature.properties.Oct_2022 },
    { x: 13,  y: feature.properties.Nov_2022 }
  ])
    .attr('d', line) // do your magic, line!
    .style("stroke","red")
    .style("stroke-width",2)
    .style("fill","white");
    
    var popup = L.popup().setContent( div );
    //var popup = L.popup().setContent(stage);
    layer.bindPopup(popup)
    layer.bindTooltip(regionName)
}


// function for original symbology with popups
function symbolize(data, map){
    L.geoJson(data, {
        style:style,
        onEachFeature: onEachFeature
            })
        .addTo(map);
    console.log(data)
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
function updateSymbols(map, attribute,viztypef){
    map.eachLayer(function(layer){
         if (layer.feature && layer.feature.properties[attribute]){
            viz_type = viztypef
            var props = layer.feature.properties;
            //console.log(attribute)
            // set up vars for this attribute
            var curVal = Number(props[attribute]) || -1;
            //update color and size if female education
            if (viz_type == "Female_Edu"){
            var fillColo = calcColorEdu(curVal);
            layer.setStyle({fillColor:fillColo,color:"#FFFFFF",weight:.5});}
             //update color and size if percent change
            if (viz_type == "Male_Educa"){
            var fillColo = calcColorEdu(curVal);
            layer.setStyle({fillColor:fillColo,color:"#FFFFFF",weight:.5});}
            //layer.setStyle({color:"#FFFFFF"});
            //update color and size if percent change
            if (viz_type == "Food_Edu"){
            var curVal = props[attribute]
            var fillColo = initColor(curVal);
            var borderWeight = initBorderWeight(layer.feature.properties.Hunger_Ris, layer.feature.properties.Food_Edu)
            var borderColo = initColorBorder(layer.feature.properties.Hunger_Ris, layer.feature.properties.Food_Edu)
            layer.setStyle({fillColor:fillColo,color:borderColo,weight:borderWeight});}
            //update color and size if percent change
            else if (viz_type.includes("20")) {
            var curVal = props[attribute]
            var fillColo = calcColor(curVal);
            layer.setStyle({fillColor:fillColo,color:"#FFFFFF",weight:.5});}   
             //set popups
            var month = attribute.split("_")[0] + " " + attribute.split("_")[1] ;
            $("#curr_year").html(month);
        };
    });
};


function removeControls(map){
    $('.skip').remove();
    $('.range-slider').remove();
}

function createControls(map,vizType){
    if (vizType.includes("20")) {
    $('#panel').append('<button class="skip" id="reverse">Previous Month</button>');
    //create range input element (slider)
    $('#panel').append('<input class="range-slider" type="range">');
   //set slider attributes
    $('.range-slider').attr({
        max: 13,
        min: 0,
        value: 0,
        step: 1
    });
    $('#panel').append('<button class="skip" id="curr_year">' + vizType +'</button>');
    $('#panel').append('<button class="skip" id="forward">Next Month</button>');}
};


//Step 1: Create new sequence controls
function manageSequence(map, data, attributes, viztype){
    //Step 5: click listener for buttons
    //Example 3.12 line 2...Step 5: click listener for buttons
    $('.skip').unbind().click(function(){
        //get the old index value
        var index = $('.range-slider').val();
        //Step 6: increment or decrement depending on button clicked
        if ($(this).attr('id') == 'forward'){
            index++;
            //Step 7: if past the last attribute, wrap around to first attribute
            index = index > 13 ? 0 : index;
            $('.range-slider').val(index);
            updateSymbols(map, attributes[index],viztype);
            //updateLegend(map, data, attributes,viztype);
        } else if ($(this).attr('id') == 'reverse'){
            index--;
            //Step 7: if past the first attribute, wrap around to last attribute
            index = index < 0 ? 13 : index;
            $('.range-slider').val(index);
            updateSymbols(map, attributes[index],viztype);
            //updateLegend(map, data, attributes,viztype);
        };

        //Step 8: update slider
        $('.range-slider').val(index);
    });
    //click listener for clicking on range
    $('.range-slider').click(function(){
        //get the old index value
        var index = $('.range-slider').val();
        updateSymbols(map, attributes[index], viztype);
        //updateLegend(map, data, attributes,viztype);
        //console.log(index)
    })
    //update even if it wasnt clicked (manageSequence is called by viztype)
    var index = $('.range-slider').val()
    updateSymbols(map, attributes[index], viztype);
    //updateLegend(map, data, attributes,viztype);
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
        //console.log($(this).attr('id'))
        if ($(this).attr('id') == 'result'){
            viztype2 = "Food_Edu"
            updateSymbols(map, attributes[16],viztype2);
            removeControls(map)
            //updateLegend(map, data, attributes,viztype2);
            //moveLegend(viztype2);
            ;}
         else if ($(this).attr('id') == 'ifs'){
            viztype2 = "Oct_2021"
            createControls(map,viztype2)
            manageSequence(map,data,attributes, viztype2);
           // updateLegend(map, data);
         }
         else if ($(this).attr('id') == 'f_edu'){
            viztype2 = "Female_Edu"
            updateSymbols(map, attributes[14],viztype2);
            removeControls(map)
            //updateLegend(map, data, attributes,viztype2);
            //moveLegend(viztype2);
         }
         else if ($(this).attr('id') == 'm_edu'){
            viztype2 = "Male_Educa"
             updateSymbols(map, attributes[15],viztype2);
             removeControls(map)
         //updateLegend(map, data, attributes,viztype2);
            // moveLegend(viztype2);
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
            //createLegend(map, data, attributes,viztype);
            selectVizType(map,data,attributes,viztype);
            //moveLegend(viztype);
        }
    
    });
};




$(document).ready(createMap);