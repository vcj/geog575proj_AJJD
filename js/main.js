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
};




//calculate a color for each symbol for recent insufficient fcs
function calcColor(attValue) {
    //scale factor to adjust symbol size evenly
    return attValue >= 125 ? '#330000' :
    attValue >= 100 ? '#67000d' : // Means: if (d >= 1966) return 'green' else…
    attValue >= 75 ? '#a50f15' : // if (d >= 1960) return 'black' else etc…
    attValue >= 50 ? '#ef3b2c' :
    attValue >= 25 ? '#fb6a4a' : // Note that numbers must be in descending order
    attValue >= 10 ? '#fee0d2' : // Note that numbers must be in descending order
    '#fff5f0';
};

//calculate a color for each proportional symbol for education
function calcColorChange(attValue) {
    //scale factor to adjust symbol size evenly
    return attValue >= 50 ? '#d73027' : // Means: if (d >= 1966) return 'green' else…
    attValue >= 25 ? '#f46d43' : // if (d >= 1960) return 'black' else etc…
    attValue >= 10 ? '#fdae61' :
    attValue >= 0 ? '#fee08b' : // Note that numbers must be in descending order
    attValue >= -10 ? '#d9ef8b' : // Note that numbers must be in descending order
    attValue >= -25 ? '#a6d96a' : // Note that numbers must be in descending order
    attValue >= -50 ? '#66bd63' : // Note that numbers must be in descending order
    '#66bd63';
};


//calculate a color for each proportional symbol for % change in PM2.5
function calcColorPctChange(attValue) {
    //scale factor to adjust symbol size evenly
    return attValue >= 100 ? '#67000d' : // Means: if (d >= 1966) return 'green' else…
    attValue >= 50 ? '#d73027' : // Means: if (d >= 1966) return 'green' else…
    attValue >= 25 ? '#f46d43' : // if (d >= 1960) return 'black' else etc…
    attValue >= 10 ? '#fdae61' :
    attValue >= 0 ? '#fee08b' : // Note that numbers must be in descending order
    attValue >= -10 ? '#d9ef8b' : // Note that numbers must be in descending order
    attValue >= -25 ? '#a6d96a' : // Note that numbers must be in descending order
    attValue >= -50 ? '#66bd63' : // Note that numbers must be in descending order
    '#66bd63';
};




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
    console.log(data.responseJSON.features[1])
    for(i in data.responseJSON.features) {
		var title = data.responseJSON.features[i].properties.Name_1,	//value searched
			loc_lat = data.responseJSON.features[i].geometry.coordinates[0],
            loc_lon =
            data.responseJSON.features[i].geometry.coordinates[1]
            //position found
			marker = new L.Marker( new L.latLng([loc_lon, loc_lat]), {title:title, icon:circleIcon, opacity:0, fillOpacity:0} )
		markersLayer.addLayer(marker);
	}
}



// function for original circle markers
function createPropSymbols(data, map, attributes, viztypes,markersLayer){
    //create marker default options
    var geojsonMarkerOptions = {
        radius: 1,
        fillColor: "#ff7800",
        color: "#666666",
        weight: 0.6,
        opacity: 1,
        fillOpacity: 0.8
    };
    //add attribute
    
    var attribute = attributes[0];
    var vistype = viztypes

    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            var curVal = Number(feature.properties[attribute]);
            var attValue = curVal
            //build popup content string
            var year = attribute.split("_")[1];
            var popupContent = "<p><b>City:</b> " + feature.properties.Urban_Agglomeration + ", " + feature.properties.Country_or_area + "</p><p><b>" + "PM2.5 in " + year + ":</b> " + Number(feature.properties[attribute]).toFixed(1) + "</p>";
            //Step 6: Give each feature's circle marker a radius based on its attribute value
            geojsonMarkerOptions.radius = calcPropRadius(attValue);
            geojsonMarkerOptions.fillColor = calcColor(attValue);
             //create circle marker layer
            var markersLayer = L.circleMarker(latlng, geojsonMarkerOptions);
            //bind the popup to the circle marker
            markersLayer.bindPopup(popupContent)
            var toolTipContent = feature.properties.Urban_Agglomeration ;
            markersLayer.bindTooltip(toolTipContent)
            return markersLayer;  

            //add search
                }
            }).addTo(map);

};


//Step 10: Resize proportional symbols according to new attribute values
function updatePropSymbols(map, attribute,viztypef){
    map.eachLayer(function(layer){
         if (layer.feature && layer.feature.properties[attribute]){
            //access feature properties
            viz_type = viztypef
            var props = layer.feature.properties;
            //console.log(props)
            // set up vars for this attribute
            var curVal = Number(props[attribute]);
            var histAvg = (props['ppm_1998'] + props['ppm_1999'] + props['ppm_2000']) / 3
            var chgVal =  curVal - histAvg
            var pctChgVal = (histAvg - curVal)/histAvg*-100
            //update color and size if percent change
            if (viz_type == "ppm_viz"){
            var radius = calcPropRadius(curVal);
            layer.setRadius(radius);
            //update color
            var fillColo = calcColor(curVal);
            layer.setStyle({fillColor:fillColo});}
             //update color and size if percent change
            else if (viz_type == "ppm_change") {
            var radius = calcPropRadius(chgVal);
            layer.setRadius(radius);
            var fillColo = calcColorChange(chgVal);
            layer.setStyle({fillColor:fillColo});}
            //update color and size if percent change
            else if ( viz_type == "ppm_pctChange") {
             var radius = calcPropRadius(pctChgVal);
            layer.setRadius(radius);
            var fillColo = calcColorPctChange(pctChgVal);
            layer.setStyle({fillColor:fillColo});}   
            //update popups
            var year = attribute.split("_")[1];
            var popupContent = "<p><b>City:</b> " + props.Urban_Agglomeration + ", " + props.Country_or_area + "</p><p><b>" + "PM2.5 in " + year + ":</b> " + curVal.toFixed(1) + "</p><p><b>" + "PM2.5 historical baseline (1998-2000):</b> " + histAvg.toFixed(1) + "</p>" + "</p><p><b>Change since historical baseline:</b> " + chgVal.toFixed(1) + "</p>" + "</p><p><b>Percent change since historical baseline:</b> " + pctChgVal.toFixed(1) + "%</p>";
            //replace the layer popup
            layer.bindPopup(popupContent, {
                offset: new L.Point(0,-radius)
            });
            $("#curr_year").html(year);
        };
    });
};


// Create Buttons to switch viz type
function selectVizType(map, data, attributes, viztype2) {
    //create 3 buttons
    $('#panel2').append('<button class="vis_select active" id="ppm" name="ppm" type="button">Estimated PM2.5</button>')
    $('#panel2').append('<button class="vis_select" id="ppm_change" name="ppm_change" type="button">Change in PM2.5 since Baseline (1998-2000)</button>')
    $('#panel2').append('<button class="vis_select" id="ppm_pctChange" name="ppm_pctChange" type="button">% Change in PM2.5 since Baseline (1998-2000)</button>')
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

function createControls(map,year){
    $('#panel').append('<button class="skip" id="reverse">Previous Year</button>');
    //create range input element (slider)
    $('#panel').append('<input class="range-slider" type="range">');
   //set slider attributes
    $('.range-slider').attr({
        max: 21,
        min: 0,
        value: 0,
        step: 1
    });
    $('#panel').append('<button class="skip" id="curr_year">' + year +'</button>');
    $('#panel').append('<button class="skip" id="forward">Next Year</button>');
    
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
            index = index > 21 ? 0 : index;
            $('.range-slider').val(index);
            updatePropSymbols(map, attributes[index],viztype);
            updateLegend(map, data, attributes,viztype);
        } else if ($(this).attr('id') == 'reverse'){
            index--;
            //Step 7: if past the first attribute, wrap around to last attribute
            index = index < 0 ? 21 : index;
            $('.range-slider').val(index);
            updatePropSymbols(map, attributes[index],viztype);
            updateLegend(map, data, attributes,viztype);
        };

        //Step 8: update slider
        $('.range-slider').val(index);
    });
    //click listener for clicking on range
    $('.range-slider').click(function(){
        //get the old index value
        var index = $('.range-slider').val();
        updatePropSymbols(map, attributes[index], viztype);
        updateLegend(map, data, attributes,viztype);
        //console.log(index)
    })
    //update even if it wasnt clicked (manageSequence is called by viztype)
    var index = $('.range-slider').val()
    updatePropSymbols(map, attributes[index], viztype);
    updateLegend(map, data, attributes,viztype);
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
    //legend2.addTo(map);
    //console.log(viztype)
    var min = getMin(data.responseJSON.features, attributes[0])
    var max = getMax(data.responseJSON.features, attributes[0])
    if (min < 10) {	min = 10;}
		function roundNumber(inNumber) {
				return (Math.round(inNumber/10) * 10);  
		}
		var legend = L.control( { position: 'topleft' } );
		legend.onAdd = function(map) {
		var legendContainer = L.DomUtil.create("div", "legend");  
		var symbolsContainer = L.DomUtil.create("div", "symbolsContainer");
		var classes = [roundNumber(min), roundNumber((max-min)/2.5), roundNumber(max)]; 
		var legendCircle;  
		var lastRadius = 0;
		var currentRadius;
		var margin;
		L.DomEvent.addListener(legendContainer, 'mousedown', function(e) { 
			L.DomEvent.stopPropagation(e); 
		});  
        year = Number($('.range-slider').val()) + 1998
		$(legendContainer).append("<h2 id='legendTitle'>Average Annual<br> PM2.5 in "+ year + "</h2>");
		for (var i = 0; i <= classes.length-1; i++) {  
			legendCircle = L.DomUtil.create("div", "legendCircle");  
			currentRadius = calcPropRadius(classes[i]);
			margin = -currentRadius - lastRadius - 2;
			$(legendCircle).attr("style", "width: " + currentRadius*2 + 
				"px; height: " + currentRadius*2 + 
				"px; margin-left: " + margin + "px");				
			$(legendCircle).append("<span class='legendValue'>"+classes[i]+"</span>");
			$(symbolsContainer).append(legendCircle);
			lastRadius = currentRadius;
		}
		$(legendContainer).append(symbolsContainer); 
        //add the color legend inside the existing legend.
        var div = L.DomUtil.create('div', 'colorLegend'),
        grades = [0,10,25,50,75,100,125];
        for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=  '<i style="background:' + calcColor(grades[i] + 1) + '"></i> ' + grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');};
        
        $(legendContainer).append(div); 

		return legendContainer; 
		};
        
		legend.addTo(map);  
        // add color legend

    //legend2.addTo(map);
	} // end createLegend();



//update legend
function updateLegend(map, data, attributes,viztype2) {
    range_index = Number($('.range-slider').val())
    year = Number($('.range-slider').val()) + 1998
    if (viztype2 == "ppm_viz") {
        //Update Circles L
        var content = "Average Annual<br> PM2.5 in " + year ;
        $('#legendTitle').html(content)
        var cirCon = document.getElementById('map').getElementsByClassName('symbolsContainer')[0]
        cirCon.innerHTML = ""
            var min = getMin(data.responseJSON.features, attributes[range_index])
            var max = getMax(data.responseJSON.features, attributes[range_index])
            if (min < 10) {	min = 10;}
                function roundNumber(inNumber) {
                        return (Math.round(inNumber/10) * 10);  
                }
        var classes = [roundNumber(min), roundNumber((max-min)/2.5), roundNumber(max)]; 
		var legendCircle;
        var lastRadius = 0;
		var currentRadius;
		var margin;
        for (var i = 0; i <= classes.length-1; i++) {  
			legendCircle = L.DomUtil.create("div", "legendCircle");  
			currentRadius = calcPropRadius(classes[i]);
			margin = -currentRadius - lastRadius - 2;
			$(legendCircle).attr("style", "width: " + currentRadius*2 + 
				"px; height: " + currentRadius*2 + 
				"px; margin-left: " + margin + "px");				
			$(legendCircle).append("<span class='legendValue'>"+classes[i]+"</span>");
			$(cirCon).append(legendCircle);
			lastRadius = currentRadius;
		}
        //Update Color Legend
        var pp1CL =  document.getElementById('map').getElementsByClassName('colorLegend')[0]
        pp1CL.innerHTML = ""
        var grades = [0,10,25,50,75,100,125];
        for (var i = 0; i < grades.length; i++) {
        pp1CL.innerHTML += '<i style="background:' + calcColor(grades[i] + 1) + '"></i> ' + grades[i] + (grades[i + 1] ? '&nbsp;&ndash;&nbsp;' + grades[i + 1] + '<br>' : '+');}
    }
    else if (viztype2 == "ppm_change") {
        //console.log("ppm viz change")
        var content2 = "Change in Average <br> PM2.5 in " +year+ "<br>Compared to Baseline";
        $('#legendTitle').html(content2); 
        var cirCon = document.getElementById('map').getElementsByClassName('symbolsContainer')[0]
        cirCon.innerHTML = ""
        cirCon.innerHTML = ""
        var classes =  [10, 50, 100]; 
		var legendCircle;
        var lastRadius = 0;
		var currentRadius;
		var margin;
        for (var i = 0; i <= classes.length-1; i++) {  
			legendCircle = L.DomUtil.create("div", "legendCircle");  
			currentRadius = calcPropRadius(classes[i]);
			margin = -currentRadius - lastRadius - 2;
			$(legendCircle).attr("style", "width: " + currentRadius*2 + 
				"px; height: " + currentRadius*2 + 
				"px; margin-left: " + margin + "px");				
			$(legendCircle).append("<span class='legendValue'>"+classes[i]+"</span>");
			$(cirCon).append(legendCircle);
			lastRadius = currentRadius;
		}
        //update color legend
          //Update Color Legend
        var pp1CL =  document.getElementById('map').getElementsByClassName('colorLegend')[0]
        pp1CL.innerHTML = ""
        var grades = [-50,-25,-10,.01, 10,25,50];
        for (var i = 0; i < grades.length; i++) {
        pp1CL.innerHTML += '<i style="background:' + calcColorChange(grades[i] + 1) + '"></i> ' + grades[i] + (grades[i + 1] ? '&nbsp;&ndash;&nbsp;' + grades[i + 1] + '<br>' : '+');
    }
    }
    else if (viztype2 == "ppm_pctChange") {
        var content3 =  "% Change in Average <br> PM2.5 in " +year+ "<br>Compared to Baseline";
        $('#legendTitle').html(content3);
         var cirCon = document.getElementById('map').getElementsByClassName('symbolsContainer')[0]
        cirCon.innerHTML = ""
        var classes = [10, 75, 150]; 
		var legendCircle;
        var lastRadius = 0;
		var currentRadius;
		var margin;
        for (var i = 0; i <= classes.length-1; i++) {  
			legendCircle = L.DomUtil.create("div", "legendCircle");  
			currentRadius = calcPropRadius(classes[i]);
			margin = -currentRadius - lastRadius - 2;
			$(legendCircle).attr("style", "width: " + currentRadius*2 + 
				"px; height: " + currentRadius*2 + 
				"px; margin-left: " + margin + "px");				
			$(legendCircle).append("<span class='legendValue'>"+classes[i]+"</span>");
			$(cirCon).append(legendCircle);
			lastRadius = currentRadius;
		}
          //Update Color Legend
        var pp1CL =  document.getElementById('map').getElementsByClassName('colorLegend')[0]
        pp1CL.innerHTML = ""
        var grades = [-50,-25,-10,.01, 10,25,50,100];
        for (var i = 0; i < grades.length; i++) {
        pp1CL.innerHTML += '<i style="background:' + calcColorPctChange(grades[i] + 1) + '"></i> ' + grades[i] + (grades[i + 1] ? '&nbsp;&ndash;&nbsp;' + grades[i + 1] + '<br>' : '+');
    }
    } 
    // end createLegend();
}

//figure out how to move legend exactly where I want it

function moveLegend(viztype) {
     if (viztype == "ppm_viz"){
            var panel2h = $("#panel2").height() + 460;
            var legendLoc = window.innerHeight - panel2h
            var ltll = document.querySelector('.leaflet-top.leaflet-left')
            ltll.style.top = legendLoc+"px";
    // console.log(legendLoc)
     }
             //update color and size if percent change
            else if (viztype == "ppm_change") {
            var panel2h = $("#panel2").height() + 475;
            var legendLoc = window.innerHeight - panel2h
            var ltll = document.querySelector('.leaflet-top.leaflet-left')
            ltll.style.top = legendLoc+"px";
             // console.log(legendLoc)
            }
            //update color and size if percent change
            else if ( viztype == "ppm_pctChange") {
            var panel2h = $("#panel2").height() + 495;
            var legendLoc = window.innerHeight - panel2h
            var ltll = document.querySelector('.leaflet-top.leaflet-left')
            ltll.style.top = legendLoc+"px";
             // console.log(legendLoc)
            }

    //resize when it moves
    addEventListener('resize', (event) => {});
    onresize = (event) => {  if (viztype == "ppm_viz"){
            var panel2h = $("#panel2").height() + 460;
            var legendLoc = window.innerHeight - panel2h
            var ltll = document.querySelector('.leaflet-top.leaflet-left')
            ltll.style.top = legendLoc+"px";
    // console.log(legendLoc)
    }
             //update color and size if percent change
            else if (viztype == "ppm_change") {
            var panel2h = $("#panel2").height() + 475;
            var legendLoc = window.innerHeight - panel2h
            var ltll = document.querySelector('.leaflet-top.leaflet-left')
            ltll.style.top = legendLoc+"px";
             // console.log(legendLoc)
            }
            //update color and size if percent change
            else if ( viztype == "ppm_pctChange") {
            var panel2h = $("#panel2").height() + 495;
            var legendLoc = window.innerHeight - panel2h
            var ltll = document.querySelector('.leaflet-top.leaflet-left')
            ltll.style.top = legendLoc+"px";
            //  console.log(legendLoc)
            }};

}

//Step 2: Import GeoJSON data
function getData(map){
    //load the data
    var data = $.ajax("https://raw.githubusercontent.com/vcj/geog575proj_AJJD/main/data/GADM1_SSA_HungEdu.geojson", {
        dataType: "json",
        success: function(response){
             //create an attributes array, base year and base viz
            var attributes = ['Oct_2021','Nov_2021', 'Dec_2021', 'Jan_2022','Feb_2022','Mar_2022','Apr_2022','May_2022','Jun_2022','Jul_2022','Aug_2022','Sep_2022','Oct_2022','Nov_2022'];
            var viztype = "Nov_2022"
            var year = "1998"
            createPropSymbols(response, map,attributes,viztype);
            createControls(map, year);
            addSearch(map, data);
            createLegend(map, data, attributes,viztype);
            selectVizType(map,data,attributes,viztype);
            manageSequence(map,data,attributes, viztype);
            moveLegend(viztype);
        }
    });
};



$(document).ready(createMap);


