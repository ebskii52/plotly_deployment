function init() {
  var selector = d3.select("#selDataset");

  d3.json("samples.json").then((data) => {
    console.log(data);
    var sampleNames = data.names;
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });
  })
}

init();


function optionChanged(newSample) {
  buildMetadata(newSample);
  buildCharts(newSample);
  buildgauge(newSample);
}

function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    var metadata = data.metadata;
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    var PANEL = d3.select("#sample-metadata");

    PANEL.html("");
    PANEL.append("h6").text("ID:" + result.id);
    PANEL.append("h6").text("Location:" + result.location);
    PANEL.append("h6").text("Ethinicity:" + result.ethnicity);
    PANEL.append("h6").text("Age:" + result.age);
    PANEL.append("h6").text("Gender:" + result.gender);
    PANEL.append("h6").text("BBType:" + result.bbtype);
    PANEL.append("h6").text("WASH-FREQ:" + result.wfreq);
  });
}

function buildgauge(sample) {
  d3.json("samples.json").then((data) => {
    var metadata = data.metadata;
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];

    // Build Gauge
    //frequencey between 0 and 180
    var level = parseFloat(result.wfreq) * 20;
    //math calculations for the meter point using MathPI
    var degrees = 180 - level;
    var radius = 0.5;
    var radians = (degrees * Math.PI) / 180;
    var x = radius * Math.cos(radians);
    var y = radius * Math.sin(radians);
    // creating main path
    var mainPath = "M -.0 -0.05 L .0 0.05 L";
    var paX = String(x);
    var space = " ";
    var paY = String(y);
    var pathEnd = "Z";
    var path = mainPath.concat(paX, space, paY, pathEnd);

    var newdata = [
      {
        type: "scatter",
        x: [0],
        y: [0],
        marker: { size: 12, color: "85000" },
        showlegend: false,
        name: "Freq",
        text: level,
        hoverinfo: "text+name"
      },
      {
        values: [50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50],
        rotation: 90,
        text: ["8-9", "7-8", "6-7", "5-6", "4-5", "3-4", "2-3", "1-2", "0-1", ""],
        textinfo: "text",
        textposition: "inside",
        marker: {
          colors: [
            "rgba(0, 105, 11, .5)",
            "rgba(10, 120, 22, .5)",
            "rgba(14, 127, 0, .5)",
            "rgba(110, 154, 22, .5)",
            "rgba(170, 202, 42, .5)",
            "rgba(202, 209, 95, .5)",
            "rgba(210, 206, 145, .5)",
            "rgba(232, 226, 202, .5)",
            "rgba(240, 230, 215, .5)",
            "rgba(255, 255, 255, 0)",
          ]
        },
        labels: ["8-9", "7-8", "6-7", "5-6", "4-5", "3-4", "2-3", "1-2", "0-1", ""],
        hoverinfo: "label",
        hole: 0.5,
        type: "pie",
        showlegend: false
      },
    ];

    var layout = {
      shapes: [
        {
          type: "path",
          path: path,
          fillcolor: "850000",
          line: {
            color: "850000"
          }
        }
      ],
      title: "<b>Belly Button Washing Frequency</b> <br> Scrubs per Week",
      height: 500,
      width: 500,
      xaxis: {
        zeroline: false,
        showticklabels: false,
        showgrid: false,
        range: [-1, 1]
      },
      yaxis: {
        zeroline: false,
        showticklabels: false,
        showgrid: false,
        range: [-1, 1]
      }
    };

    var gaugEE = document.getElementById("gauge");
    Plotly.newPlot(gaugEE, newdata, layout);

  });
}


function buildCharts(sampleX) {

  d3.json("samples.json").then((data) => {
    sampless = data.samples;
    sampless = sampless.sort((a, b) => b.sample_values - a.sample_values);
    resultArray = sampless.filter(sampleObjX => sampleObjX.id == sampleX);

    console.log(sampless)

    // Sample Values
    var sampleValues = resultArray[0].sample_values;
    var sampleValuesSliced = sampleValues.slice(0, 10).reverse();

    // OTU_IDS
    var otuids = resultArray[0].otu_ids;
    otuids = otuids.slice(0, 10);
    var otuidsFiltered = otuids.map(otuID => `OTU${otuID}`).reverse();

    // OTU_LABELS
    var otulabels = resultArray[0].otu_labels;
    otulabels = otulabels.slice(0, 10).reverse();

    // Trace1 for the Greek Data
    var trace1 = {
      x: sampleValuesSliced,
      y: otuidsFiltered,
      text: otulabels,
      name: "BellyButton",
      type: "bar",
      orientation: "h",
    };

    // data
    var dataX = [trace1];

    var layout = {
      title: "BELLY BUTTON",
      xaxis: { title: "SAMPLE VALUES" },
      yaxis: { title: "OTU IDS", tickWidth: 50 }
    };

    // Render the plot to the div tag with id "plot"
    Plotly.newPlot("bar", dataX, layout);


    //////////////////////////////////////////////////////////////////////
    // Create bubble chart -- relative frequency of all bacterial species
    //////////////////////////////////////////////////////////////////////
    var traceBubble = {
      x: resultArray[0].otu_ids,
      y: resultArray[0].sample_values,
      text: resultArray[0].otu_labels,
      type: "scatter",
      mode: 'markers',
      marker: {
        color: otuids,
        colorscale: 'Electric',
        opacity: 0.8,
        size: resultArray[0].sample_values,
        //sizeref: 2.0 * Math.max(samplevalues) / (40**2),
        sizemode: 'diameter'
      }
    };
    var dataBubble = [traceBubble];
    var layoutBubble = {
      title: "All the Bacterial Species per Sample",
      xaxis: { title: "OTU ID" },
      yaxis: { title: "Sample Size" },
      showlegend: false,
      height: 600,
      width: 1200
    };
    Plotly.newPlot("bubble", dataBubble, layoutBubble);

  });


}


//   // Sort the data array using the greekSearchResults value
//   data.sort(function(a, b) {
//   return parseFloat(b.greekSearchResults) - parseFloat(a.greekSearchResults);
//   });

//   // Slice the first 10 objects for plotting
//   data = data.slice(0, 10);

//   // Reverse the array due to Plotly's defaults
//   data = data.reverse();

//   // Trace1 for the Greek Data
//   var trace1 = {
//     x: data.map(row => row.greekSearchResults),
//     y: data.map(row => row.greekName),
//     text: data.map(row => row.greekName),
//    name: "Greek",
//    type: "bar",
//    orientation: "h"
//   };

//   // data
//   var data = [trace1];

//   // Apply the group bar mode to the layout
//   var layout = {
//     title: "Greek gods search results",
//     margin: {
//       l: 100,
//       r: 100,
//       t: 100,
//       b: 100
//     }
//   };

// // Render the plot to the div tag with id "plot"
// Plotly.newPlot("plot", data, layout);

// }