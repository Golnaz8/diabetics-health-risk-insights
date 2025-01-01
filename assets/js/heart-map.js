// Function to normalize location names
function normalizeLocationName(name) {
    const mapping = {
        "Alabama": "Alabama",
        "Alaska": "Alaska",
        "Arizona": "Arizona",
        "Arkansas": "Arkansas",
        "California": "California",
        "Colorado": "Colorado",
        "Connecticut": "Connecticut",
        "Delaware": "Delaware",
        "District of Columbia": "District of Columbia",
        "Florida": "Florida",
        "Georgia": "Georgia",
        "Guam": "Guam",
        "Hawaii": "Hawaii",
        "Idaho": "Idaho",
        "Illinois": "Illinois",
        "Indiana": "Indiana",
        "Iowa": "Iowa",
        "Kansas": "Kansas",
        "Kentucky": "Kentucky",
        "Louisiana": "Louisiana",
        "Maine": "Maine",
        "Maryland": "Maryland",
        "Massachusetts": "Massachusetts",
        "Michigan": "Michigan",
        "Minnesota": "Minnesota",
        "Mississippi": "Mississippi",
        "Missouri": "Missouri",
        "Montana": "Montana",
        "Nebraska": "Nebraska",
        "Nevada": "Nevada",
        "New Hampshire": "New Hampshire",
        "New Jersey": "New Jersey",
        "New Mexico": "New Mexico",
        "New York": "New York",
        "North Carolina": "North Carolina",
        "North Dakota": "North Dakota",
        "Ohio": "Ohio",
        "Oklahoma": "Oklahoma",
        "Oregon": "Oregon",
        "Pennsylvania": "Pennsylvania",
        "Puerto Rico": "Puerto Rico",
        "Rhode Island": "Rhode Island",
        "South Carolina": "South Carolina",
        "South Dakota": "South Dakota",
        "Tennessee": "Tennessee",
        "Texas": "Texas",
        "Utah": "Utah",
        "Vermont": "Vermont",
        "Virgin Islands": "Virgin Islands",
        "Virginia": "Virginia",
        "Washington": "Washington",
        "West Virginia": "West Virginia",
        "Wisconsin": "Wisconsin",
        "Wyoming": "Wyoming"
    };
    return mapping[name] || name;
}

// Function to determine marker color based on diabetes rate
function getMarkerColor(rate) {
    if (rate > 40) return "#FF4500";
    if (rate > 30) return "#FF8C00";
    if (rate > 20) return "#FFD700";
    if (rate > 10) return "#ADFF2F"; 
    return "#00FF00"; 
}

// Function to display the heart disease Map
function heartDiseasMap() {
    
    document.getElementById("main-content").style.display = "none";
    document.getElementById("heart-map-container").style.display = "block";

    
    const mapContainer = document.getElementById("heart-map-container");
    const mapElement = document.getElementById("heart-map");

    mapElement.style.height = "90vh"; 
    mapContainer.style.height = "100vh";

    // Initialize the map with a center point and zoom level
    const map = L.map("heart-map").setView([37.8, -96], 5);

    // Add a tile layer for the map background
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    // Fetch GeoJSON data for US states
    d3.json("https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json").then((geoData) => {
        // Fetch clinical data for heart disease statistics
        d3.csv("data/diabetes_dataset.csv").then((clinicalData) => {
            const heartDiseaseByLocation = {};

            clinicalData.forEach((record) => {
                const location = normalizeLocationName(record.location);

                if (!heartDiseaseByLocation[location]) {
                    heartDiseaseByLocation[location] = { count: 0, total: 0 };
                }

                // Increment total records and count heart disease cases
                heartDiseaseByLocation[location].total += 1;
                if (+record.heart_disease === 1) {
                    heartDiseaseByLocation[location].count += 1;
                }
            });

            console.log("Heart Disease Data by Location:", heartDiseaseByLocation);

            // Add GeoJSON layer to the map
            L.geoJson(geoData, {
                style: function (feature) {
                    const locationName = normalizeLocationName(feature.properties.name);
                    const data = heartDiseaseByLocation[locationName];
                    const rate = data ? (data.count / data.total) * 100 : 0;

                    return {
                        color: "#000",
                        weight: 1, 
                        fillColor: getMarkerColor(rate), 
                        fillOpacity: 0.7,
                    };
                },
                onEachFeature: function (feature, layer) {
                    // Bind popup to each map feature
                    const locationName = normalizeLocationName(feature.properties.name);
                    const data = heartDiseaseByLocation[locationName];
                    const count = data ? data.count : 0;
                    const total = data ? data.total : 0;
                    const rate = total ? ((count / total) * 100).toFixed(2) : "N/A";

                    layer.bindPopup(`
                        <h4>${locationName}</h4>
                        <p><strong>Total Records:</strong> ${total}</p>
                        <p><strong>Heart Disease Cases:</strong> ${count}</p>
                        <p><strong>Heart Disease Rate:</strong> ${rate}%</p>
                    `);
                },
            }).addTo(map);

            // Add a legend to the map
            const legend = L.control({ position: "bottomright" });

            legend.onAdd = function () {
                const div = L.DomUtil.create("div", "legend");
                const ranges = ["0-10%", "10-20%", "20-30%", "30-40%", ">40%"];
                const colors = ["#00FF00", "#ADFF2F", "#FFD700", "#FF8C00", "#FF4500"];

                ranges.forEach((range, i) => {
                    div.innerHTML += `
                        <div style="display: flex; align-items: center;">
                            <span style="background:${colors[i]}; width: 20px; height: 20px; margin-right: 8px;"></span>
                            ${range}
                        </div>`;
                });

                div.style.background = "white";
                div.style.padding = "10px";
                div.style.borderRadius = "8px";
                return div;
            };

            legend.addTo(map);
        });
    });
}

// Function to show the main page and hide the map
function showMainPage() {
    document.getElementById("main-content").style.display = "block";
    document.getElementById("heart-map-container").style.display = "none";
}
