var data = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

d3.json(data).then(createEqMap);

function createEqMap(data) {
    let layer = createEqLayer(data.features);
    createMap(layer);
};

function createEqLayer(data) {
    let earthquakes = L.geoJSON(data, {
        onEachFeature: onEachFeature,
        pointToLayer: pointToLayer,
    });

    // use pointtolayer to create circle markers
    function pointToLayer(feature, latlng){
        let geojsonMarkerOptions = {
            radius: getRadius(feature.properties.mag),
            fillColor: getColor(feature.properties.mag),
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.75,
        };
        return L.circleMarker(latlng, geojsonMarkerOptions);
    };

    function onEachFeature(feature, layer){
        layer.bindPopup(
            // show time and magnitude of the earthquake when selected
            "<h3>" + feature.properties.place + "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" + 
            "<p>" + "Magnitude:" + feature.properties.mag + "</p>"  
        );
    };
    return earthquakes;
};

function getColor(magnitude) {
    return magnitude > 5  ? '#ff1a1a' :
        magnitude > 4  ? '#ff8000' :
        magnitude > 3   ? '#ffff33' :
        magnitude > 2   ? '#00e600' :
        magnitude > 1   ? '#80ff80' :
                    '#ccffcc';
}

function getRadius(magnitude) {
    if (magnitude === 0) {
        return 1;
    }
    return magnitude*4;
}

function createMap(earthquakes) {
let streetMap = L.tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
    {
        attribution:
            "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/streets-v11",
        accessToken: API_KEY,
    }
);
 
let satelliteMap = L.tileLayer(
    "https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
    {
        attribution:
            'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: "satellite-streets-v11",
        accessToken: API_KEY,
    }
);

// allow for selection between two different map types
let baseMaps = {
    "Satellite Map": satelliteMap,
    "Street Map": streetMap,
};

// allow earthquakes to be toggleable
let mapLayers = {
    Earthquake: earthquakes,
};

// center map over some place in california 
let myMap = L.map("map", {
    center: [37.09, -118.71],
    zoom: 5,
    layers: [streetMap, earthquakes],
});

L.control
    .layers(baseMaps, mapLayers, {
        collapsed: true,
    })
    .addTo(myMap);

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend');
    var grades = [0, 1, 2, 3, 4, 5];
      
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
};

    legend.addTo(myMap);
};