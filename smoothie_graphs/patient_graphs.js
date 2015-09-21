// JavaScript function for calling the api to get the graph data
// points and populating the flot graphs. This fucntion is specifically.
// for the ecg graphs on the patient graphs.
var currentGraphs = [];
var graphOff = 0;

function detail_graphs(eb) {
  var currentBuffers = {};
  var neededGraphs = [];
  //var hash = $(this).attr('href').split('#')[1];
  neededGraphs.push(['waveform', 'ECG', 1]);
  neededGraphs.push(['waveform', 'ABP', 2]);
  neededGraphs.push(['waveform', 'RESP', 3]);
  neededGraphs.push(['waveform', 'PAP', 1]);

  console.log("hi");
  console.log(neededGraphs);

$("#graphs").click(function() {
  var egraph = document.getElementById("graphs");
  if (graphOff == 0) {
     for (var i = currentGraphs.length-1; i >= 0; i--) {
        currentGraphs[i].chart.stop();
     }
     graphOff = 1;
     egraph.innerHTML = "Turn Graphs ON";
     alert('Graphs have been turned OFF');
  }
  else {
     for (var i = currentGraphs.length-1; i >= 0; i--) {
        currentGraphs[i].chart.start();
     }
     graphOff = 0;
     egraph.innerHTML = "Turn Graphs OFF";
     alert('Graphs have been turned ON');
  }
});


  var startGraph = function (stream, type, id) {
    $.when($.ajax(API_HOST + 'stream/'+stream+'/'+type+'/'+(id-1))).done(
      function (data) {
        var channelName = data;
        var startTime = Date.now();
        currentBuffers[channelName] = new Array();
        var chart = makeSmoothie(type);
        var info = {"channel": channelName,
          "startTime": startTime,
          "buffer": currentBuffers[channelName],
          "graph": chart.series,
          "chart": chart.chart,
          "lastReceived": Date.now()};
        currentGraphs.push(info);
        eb.registerHandler(channelName, function(msg) {
          //var data = msg.data;
          
          // if (typeof data !== 'undefined') {
          //   for (var i = 0; i < data.length; i++) {
          //     chart.series.append(startTime, data[i].SIGNAL);
          //     startTime += 8;
          //   }
          // }
          // if (typeof data !== 'undefined') {
          //   var l = data.length;
          //   while (l--) {
          //     chart.series.append(startTime, data[l].SIGNAL, false);
          //     startTime += 8;
          //   }
          // }
          // if (Date.now() - info.lastReceived > 2000) {
          //   info.startTime = Date.now();
          // }
          currentBuffers[channelName].push(msg.data);
          info.startTime = Date.now();
          info.lastReceived = Date.now();
          
        });
        // Initial resize of graphs to fix having to resize manually.
        chart.chart.canvas.width = chart.chart.canvas.parentNode.offsetWidth;
        chart.chart.resize();
      }
    )
  };

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

  var drawIt = function () {
    currentGraphs.forEach(function (item, idx, thisArray) {
      var data = item["buffer"].shift();
      if (typeof data !== 'undefined') {
        var sTime = item.startTime;
        //for (var i = data.length - 1; i >= 0; i--) {
        for (var i = 0; i < data.length; i++) {  
          item["graph"].append(sTime, data[i].SIGNAL);
          sTime += 8;
        }
      }
    });
    setTimeout(drawIt, 800);
  };
  
  eb.onopen = function () {
    //for (var i = neededGraphs.length - 1; i >= 0; i--) {
    for (var i = 0; i < neededGraphs.length; i++) {  
      startGraph(neededGraphs[i][0], neededGraphs[i][1], neededGraphs[i][2]);
    }
    setTimeout(drawIt, 400);
    //checkLastReceived();
  };
}
var handleResize = function () {
  for (var i = 0; i < currentGraphs.length; i++) {
    console.log('resized' + i);
    var mycanvas = currentGraphs[i].chart.canvas;
    mycanvas.width = mycanvas.parentNode.offsetWidth;
    currentGraphs[i].chart.resize();
  }
};

var checkLastReceived = function() {
  currentGraphs.forEach(function(item, idx, thisArray) {
    if (Date.now() - item.lastReceived > 2000) {
      item.startTime = Date.now();
    }
  });
  
  setTimeout(checkLastReceived, 1000);
};
