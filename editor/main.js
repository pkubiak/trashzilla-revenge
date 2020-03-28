const ROAD_TYPES = {
    'taxi': '#ffeb3b',
    'bus': '#4caf50',
    'tram': '#e91e63',
    'bicycle': '#2196f3',
};

var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        osmAttrib = '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        osm = L.tileLayer(osmUrl, { maxZoom: 18, attribution: osmAttrib }),
        map = new L.Map('map', { center: new L.LatLng(51.505, -0.04), zoom: 13 }),
        drawnItems = L.featureGroup().addTo(map);
L.control.layers({
    'osm': osm.addTo(map),
    // "google": L.tileLayer('http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}', {
    //     attribution: 'google'
    // })
}, { 'drawlayer': drawnItems }, { position: 'topleft', collapsed: false }).addTo(map);





L.DrawToolbar.include({
    getModeHandlers: function (map) {
        let handlers =[];
        for(let key in ROAD_TYPES) {
            handlers.push({
                enabled: true,
                handler: new L.Draw.Polyline(map, {
                    shapeOptions:{
                        color: ROAD_TYPES[key],
                        opacity: 1.0,
                        weight: 8
                    }
                }),
                title: key
            });
        }

        handlers.push({
            enabled: true,
            handler: new L.Draw.Marker(map, {icon: new L.Icon.Default()}),
            title: 'Add Station',
        })

        return handlers;
    },
});

map.addControl(new L.Control.Draw({
    edit: {
        featureGroup: drawnItems,
        poly: {
            allowIntersection: false
        }
    },
}));


map.on(L.Draw.Event.CREATED, function (event) {
    var layer = event.layer;

    drawnItems.addLayer(layer);
});


function load_json() {
    let text =JSON.parse(document.querySelector('#export').value);
    console.log(text);
}

function save_json() {
    let data = {nodes: [], roads: []}
    map.eachLayer((layer) => {
        if(layer.editing) {            
            if(layer.editing._marker) {
                // console.log('Marker: ', layer._latlng);
                data.nodes.push({lat: layer._latlng.lat, lng: layer._latlng.lng});
            } else
            if(layer.editing._poly) {
                let color = layer.options.color, road_type;
                for(let key in ROAD_TYPES)
                    if(color == ROAD_TYPES[key])
                        road_type = key;
                // console.log('PolyLine', layer._latlngs, road_type);
                data.roads.push({
                    type: road_type,
                    points: layer._latlngs.map((x) => {return {lat: x.lat, lng: x.lng}})
                });
            }
        }
    });

    document.querySelector('#export').value = JSON.stringify(data);
}