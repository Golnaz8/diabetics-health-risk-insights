// Build the metadata panel
function buildMetadata(territoryId) {
  d3.csv("data/locations.csv", (d) => ({
    location: d.location,
    territory_id: +d.territory_id,
  }))
    .then((locations) => {
      d3.csv("data/clinical_data.csv", (d) => ({
        territory_id: +d.territory_id,
        age: +d.age,
        bmi: +d.bmi,
        diabetes: +d.diabetes,
        hbA1c_level: +d.hbA1c_level,
        blood_glucose_level: +d.blood_glucose_level,
        heart_disease: +d.heart_disease,
      }))
        .then((data) => {
          // Filter the location and metadata for the selected territory
          const location = locations.find(
            (loc) => loc.territory_id === Number(territoryId)
          );
          const metadata = data.filter(
            (record) => record.territory_id === Number(territoryId)
          );

          // Select the panel with id `#sample-metadata`
          const panel = d3.select("#sample-metadata");

          // Clear any existing metadata
          panel.html("");

          if (!location || metadata.length === 0) {
            panel.html("No data available for the selected territory.");
            return;
          }

          // Add location info
          panel.append("h4").text(`Location: ${location.location}`);
          panel.append("p").html("&nbsp;");

          // Display metadata (e.g., counts of diabetes cases)
          const diabetesCount = metadata.filter(
            (record) => record.diabetes === 1
          ).length;
          const noDiabetesCount = metadata.length - diabetesCount;

          panel.append("p").text(`Total Records: ${metadata.length}`);
          panel.append("p").text(`Diabetes Cases: ${diabetesCount}`);
          panel.append("p").text(`No Diabetes Cases: ${noDiabetesCount}`);
        })
        .catch((err) => console.error("Error loading clinical_data.csv:", err));
    })
    .catch((err) => console.error("Error loading locations.csv:", err));
}

// Build the charts
function buildCharts(territoryId) {
  d3.csv("data/clinical_data.csv", (d) => ({
    territory_id: +d.territory_id,
    age: +d.age,
    bmi: +d.bmi,
    diabetes: +d.diabetes,
    hbA1c_level: +d.hbA1c_level,
    blood_glucose_level: +d.blood_glucose_level,
    heart_disease: +d.heart_disease,
    "race:AfricanAmerican": +d["race:AfricanAmerican"],
    "race:Asian": +d["race:Asian"],
    "race:Caucasian": +d["race:Caucasian"],
    "race:Hispanic": +d["race:Hispanic"],
    "race:Other": +d["race:Other"],
  }))
    .then((data) => {
      // Filter the data for the selected territory
      const filteredData = data.filter(
        (record) => record.territory_id === Number(territoryId)
      );

      if (filteredData.length === 0) {
        console.log("No data available for the selected territory.");
        return;
      }

      // Regression Helper Function
      function calculateRegression(x, y) {
        const n = x.length;
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        // Regression line points
        const regressionLine = x.map((xi) => slope * xi + intercept);

        return { slope, intercept, regressionLine };
      }

      // Scatter Plot: HbA1c Level vs BMI
      const hbA1c = filteredData.map((record) => record.hbA1c_level);
      const bmi = filteredData.map((record) => record.bmi);
      const {
        slope: bmiSlope,
        intercept: bmiIntercept,
        regressionLine: bmiRegressionLine,
      } = calculateRegression(hbA1c, bmi);

      const hbA1cBmiTrace = {
        x: hbA1c,
        y: bmi,
        mode: "markers",
        marker: { size: 10, color: "green" },
        name: "Data Points",
        type: "scatter",
      };

      const hbA1cBmiRegressionTrace = {
        x: hbA1c,
        y: bmiRegressionLine,
        mode: "lines",
        name: `y = ${bmiSlope.toFixed(2)}x + ${bmiIntercept.toFixed(2)}`,
        line: { color: "red", dash: "dash" },
      };

      const hbA1cBmiLayout = {
        title: "HbA1c Level vs BMI with Regression Line",
        xaxis: { title: "HbA1c Level" },
        yaxis: { title: "BMI" },
      };

      Plotly.newPlot(
        "scatter-bmi",
        [hbA1cBmiTrace, hbA1cBmiRegressionTrace],
        hbA1cBmiLayout
      );

      // Scatter Plot: HbA1c Level vs Blood Glucose Level
      const bloodGlucose = filteredData.map(
        (record) => record.blood_glucose_level
      );
      const {
        slope: glucoseSlope,
        intercept: glucoseIntercept,
        regressionLine: glucoseRegressionLine,
      } = calculateRegression(hbA1c, bloodGlucose);

      const hbA1cBloodGlucoseTrace = {
        x: hbA1c,
        y: bloodGlucose,
        mode: "markers",
        marker: { size: 10, color: "purple" },
        name: "Data Points",
        type: "scatter",
      };

      const hbA1cBloodGlucoseRegressionTrace = {
        x: hbA1c,
        y: glucoseRegressionLine,
        mode: "lines",
        name: `y = ${glucoseSlope.toFixed(2)}x + ${glucoseIntercept.toFixed(
          2
        )}`,
        line: { color: "red", dash: "dash" },
      };

      const hbA1cBloodGlucoseLayout = {
        title: "HbA1c Level vs Blood Glucose Level with Regression Line",
        xaxis: { title: "HbA1c Level" },
        yaxis: { title: "Blood Glucose Level" },
      };

      Plotly.newPlot(
        "scatter-glucose",
        [hbA1cBloodGlucoseTrace, hbA1cBloodGlucoseRegressionTrace],
        hbA1cBloodGlucoseLayout
      );

      // Bar Chart: Race vs Diabetes Count
      const races = [
        { name: "African American", key: "race:AfricanAmerican" },
        { name: "Asian", key: "race:Asian" },
        { name: "Caucasian", key: "race:Caucasian" },
        { name: "Hispanic", key: "race:Hispanic" },
        { name: "Other", key: "race:Other" },
      ];

      const diabetesCountsByRace = races.map((race) => {
        const count = filteredData.filter(
          (record) => record[race.key] === 1 && record.diabetes === 1
        ).length;
        return { race: race.name, count };
      });

      const raceTrace = {
        x: diabetesCountsByRace.map((item) => item.race),
        y: diabetesCountsByRace.map((item) => item.count),
        type: "bar",
        marker: { color: "blue" },
      };

      const raceLayout = {
        title: "Diabetes Cases by Race",
        xaxis: { title: "Race" },
        yaxis: { title: "Diabetes Count" },
        height: 500,
      };

      Plotly.newPlot("bar", [raceTrace], raceLayout);

      // Calculate Diabetes Cases by Age Group
      const ageBins = [0, 20, 40, 60, 80];
      const diabetesByAgeGroup = ageBins
        .map((bin, i) => {
          if (i === ageBins.length - 1) return null;
          const lower = bin;
          const upper = ageBins[i + 1];
          const groupData = filteredData.filter(
            (record) => record.age >= lower && record.age < upper
          );
          return {
            ageRange: `${lower}-${upper}`,
            diabetesCount: groupData.filter((record) => record.diabetes === 1)
              .length,
          };
        })
        .filter((d) => d);

      if (diabetesByAgeGroup.length === 0) {
        console.log("No data available for age group analysis.");
        return;
      }

      // Bar Chart for Age Group vs Diabetes Count
      const barTrace = {
        x: diabetesByAgeGroup.map((group) => group.ageRange),
        y: diabetesByAgeGroup.map((group) => group.diabetesCount),
        type: "bar",
        marker: { color: "orange" },
      };

      const barLayout = {
        title: "Diabetes Cases by Age Group",
        xaxis: {
          title: "Age Range",
          tickangle: -45,
        },
        yaxis: { title: "Diabetes Count" },
        height: 500,
      };

      Plotly.newPlot("bar-chart", [barTrace], barLayout);

      // Box Plot: Heart Disease vs HbA1c Level
      const heartDisease = filteredData.map((record) =>
        record.heart_disease === 1 ? "Heart Disease" : "No Heart Disease"
      );

      const boxTrace = {
        x: heartDisease,
        y: hbA1c,
        type: "box",
        marker: { color: "purple" },
        name: "HbA1c Level",
      };

      const boxLayout = {
        title: "HbA1c Level vs Heart Disease",
        xaxis: { title: "Heart Disease" },
        yaxis: { title: "HbA1c Level" },
        height: 500,
      };

      Plotly.newPlot("box-heart-hba1c", [boxTrace], boxLayout);
    })
    .catch((err) => console.error("Error loading clinical_data.csv:", err));
}

// Initialize the dropdown and charts
function init() {
  d3.csv("data/locations.csv", (d) => ({
    location: d.location,
    territory_id: +d.territory_id,
  }))
    .then((locations) => {
      const selector = d3.select("#selDataset");

      // Add options to dropdown
      locations.forEach((location) => {
        selector
          .append("option")
          .text(location.location)
          .property("value", location.territory_id);
      });

      // Get the first location
      const firstTerritory = locations[0].territory_id;

      // Build initial charts and metadata
      buildCharts(firstTerritory);
      buildMetadata(firstTerritory);

      // Listen for changes to the dropdown
      selector.on("change", function () {
        const newTerritory = d3.select(this).property("value");
        buildCharts(newTerritory);
        buildMetadata(newTerritory);
      });
    })
    .catch((err) => console.error("Error loading locations.csv:", err));
}

function addJitter(values, jitterAmount = 0.2) {
  return values.map(
    (value) => value + (Math.random() * jitterAmount - jitterAmount / 2)
  );
}

// Run the initialization function on page load
init();
