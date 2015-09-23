// JavaScript function for calling the api to get the graph data
// points and populating the flot graphs. This fucntion is specifically.
// for the ecg graphs on the patient graphs.
//"use strict";
var currentGraphs = [];
var graphOff = 0;

function detail_graphs(eb) {
  //var currentBuffers = {};
  var neededGraphs = [];
  //var hash = $(this).attr('href').split('#')[1];
  neededGraphs.push(['waveform', 'ECG', 1]);
  neededGraphs.push(['waveform', 'ABP', 2]);
  neededGraphs.push(['waveform', 'RESP', 3]);
  neededGraphs.push(['waveform', 'PAP', 1]);

  console.log(neededGraphs);

  var startGraph = function (stream, gtype, id) {
    $.when($.ajax(API_HOST + 'stream/'+stream+'/'+gtype+'/'+(id-1))).done(
      function (data) {
        var channelName = data;
        //var startTime = Date.now();
        //currentBuffers[channelName] = new Array();
        var buffer = [];
        var chart = makeSmoothie(gtype);
        var startTime = Date.now();
        var lastReceived = 0;
        var info = {"channel": channelName,
          //"startTime": Date.now(),
          //"buffer": lBuffer,
          //"graph": chart.series,
          "chart": chart.chart,
          //"lastReceived": Date.now()
        };
          
        currentGraphs.push(info);
        eb.registerHandler(channelName, function(msg) {
          if (Date.now() - lastReceived > 3000) {
            startTime = Date.now();
          }
          buffer.push.apply(buffer, msg.data);
          //info.startTime = Date.now();
          lastReceived = Date.now();
        });
        
        // Initial resize of graphs to fix having to resize manually.
        chart.chart.canvas.width = chart.chart.canvas.parentNode.offsetWidth;
        chart.chart.resize();
        var drawSingle = function() {
          if (typeof buffer !== 'undefined') {
            var sTime = Date.now();
            var runLen = buffer.length < 150 ? buffer.length : 150;
            for (var i = 0; i < runLen; i++) {
              if (typeof buffer[i] !== 'undefined') {
                chart.series.append(sTime, buffer[i].SIGNAL);
                sTime += 8;
              }
            }
          }
          //startTime = sTime;
          setTimeout(drawSingle, (runLen * 8));
        };
        
        drawSingle();
      }
    );
  };

  eb.onopen = function () {
    console.log("in eb open");
    for (var i = 0; i < neededGraphs.length; i++) {  
      startGraph(neededGraphs[i][0], neededGraphs[i][1], neededGraphs[i][2]);
    }
    console.log(currentGraphs);
  };
  
  $("#graphs").click(function () {
    var egraph = document.getElementById("graphs");
    if (graphOff == 0) {
      for (var i = currentGraphs.length - 1; i >= 0; i--) {
        currentGraphs[i].chart.stop();
      }
      graphOff = 1;
      egraph.innerHTML = "Turn Graphs ON";
      alert('Graphs have been turned OFF');
    }
    else {
      for (var i = currentGraphs.length - 1; i >= 0; i--) {
        currentGraphs[i].chart.start();
      }
      graphOff = 0;
      egraph.innerHTML = "Turn Graphs OFF";
      alert('Graphs have been turned ON');
    }
  });
}

var makeSmoothie = function (id) {
    var color = "green";
    if (id === "ECG") {
        color = "red";
    } else if (id === "ABP") {
        color = "green";
    } else if (id === "RESP") {
        color = "blue";
    } else {
        color = "yellow";
    }
    var chart = new SmoothieChart({millisPerPixel:8, interpolation:'linear', enableDpiScaling: false});
    var canvas = document.getElementById(id);
    var series = new TimeSeries();
    chart.addTimeSeries(series, {lineWidth:2,strokeStyle:color});
    chart.streamTo(canvas, 3000);
    return {"series": series, "chart": chart};
  };

var handleResize = function () {
  for (var i = 0; i < currentGraphs.length; i++) {
    console.log('resized' + i);
    var mycanvas = currentGraphs[i].chart.canvas;
    mycanvas.width = mycanvas.parentNode.offsetWidth;
    currentGraphs[i].chart.resize();
  }
};

// var drawSingle = function(graphInfo) {
//   if (graphInfo.buffer !== 'undefined') {
//     //var sTime = graphInfo.startTime;
//     var runLen = graphInfo.buffer.length < 150 ? graphInfo.buffer.length : 150;
//     for (var i = 0; i < runLen; i++) {
//       if (typeof graphInfo.buffer[i] !== 'undefined') {
//         graphInfo.graph.append(graphInfo.startTime, graphInfo.buffer[i].SIGNAL);
//         graphInfo.startTime += 8;
//       }
//     }
//   }
//   //graphInfo.startTime = sTime;
//   setTimeout(drawSingle, 400, graphInfo);
// };

var drawIt = function () {
    currentGraphs.forEach(function (item, idx, thisArray) {
      //var data = item["buffer"].shift();
      if (typeof item !== 'undefined') {
        var sTime = item.startTime;
        var runLen = item.buffer.length < 100 ? item.buffer.length : 100;
        for (var i = 0; i < runLen; i++) {
          if (typeof item.buffer[i] !== 'undefined') {
            item.graph.append(sTime, item.buffer[i].SIGNAL);
            sTime += 8;
          }
        }
      }
    });
    setTimeout(drawIt, 1000);
  };
