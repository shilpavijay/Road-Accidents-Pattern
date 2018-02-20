d3.select(window).on("resize", sizeChange);

        //Set d3 scale
        var color_domain = ['<100','<1000','<10000','<20000','20000 & more'];
        var legend_labels = ['<100','<1000','<10000','<20000','20000 & more']
        var color = d3.scale.ordinal()
                    .domain(color_domain)
                    .range(['#dddd','#b2c5d7','#469f9f','#195087','#7a0000'])

        //Set tooltip
        var div = d3.select("body").append("div")
         .attr("class", "tooltip")
         .style("opacity", 0);

        //Set d3 projection, path and svg
        var projection = d3.geo.mercator()
            .center([78, 27])
            .scale(1200);

        var path = d3.geo.path()
            .projection(projection);

        var svg = d3.select("#container")
          .append("svg")
          .attr("width", "100%")
          .attr("height","100%")
          .append("g");

        //TO SELECT YEAR THROUGH DROPDOWN
        // var controls = d3.select("body")
        //   .append("div")
        //   .attr("id","controls");

        // var sort_btn = controls.append("button")
        //   .html("Sort data: Ascending")
        //   .attr("state", 0);

        //Wait for data files to download before drawing
        queue()
          .defer(d3.json, "json/india_states.json")
          .defer(d3.csv, "No_of_Road_Acc_2016.csv") //sample data
          .await(ready);

        function ready(error, state, data) {
            //Set up for visualizing sample data
            var pairStateWithNo = {};
            var pairStateWithRange = {};
            // must come from the selection:
            // var year = '2016'   
            // var pairStateWithYear = {};
            data.forEach(function(d) {
              pairStateWithNo[d.States] = d.Number;
              var range = '';
              var len = String(d.Number).length;

              //Determining the Range of data:
              switch(true) {
                case (len >= color_domain[2].length - 1) && (d.Number < 20000): 
                  range = 3;
                  break;
                case (len >= color_domain[2].length - 1) && (d.Number >= 20000):
                  range = 4;
                  break;
                case (len == 4) && (d.Number < 10000):
                  range = 2;
                  break;
                case (len > 2) && (d.Number < 1000):
                  range = 1;
                  break;
                case (len <= 2):
                  range = 0;
                  break;
              }
              pairStateWithRange[d.States] = color_domain[range];
            });


            //Drawing state boundaries          
            var state_geojson = topojson.feature(state, state.objects.india_states);
            svg.selectAll(".state")
                .data(state_geojson.features)
                .enter().append("path")
                .attr("class", "state")
                .attr("d", path)
                .style ( "fill" , function (d) {
                  var result = pairStateWithRange[d.properties.NAME_1];
                  if (result!='') { return color(result); }                  
                })
                .style("opacity", 0.8)
                .on("mouseover", function(d) {
                   d3.select(this).transition().duration(300).style("opacity", 1);
                   div.transition().duration(300)
                   .style("opacity", 1)
                   div.text(d.properties.NAME_1 + ': ' + pairStateWithNo[d.properties.NAME_1])
                   .style("left", (d3.event.pageX) + "px")
                   .style("top", (d3.event.pageY -30) + "px");
                })
                .on("mouseout", function() {
                   d3.select(this)
                   .transition().duration(300)
                   .style("opacity", 0.8);
                   div.transition().duration(300)
                   .style("opacity", 0);
                });
        }

        //Set up for drawing html legend elements
        var legend = d3.select('.legend-scale')
          .append('ul')
          .attr('class', 'legend-labels');
        var keys = legend.selectAll('li')
          .data(color_domain);

        keys.enter().append('li')
          .text(function(d, i){ return legend_labels[i];})
          .append('span')
          .style('background', function(d) { return color(d); });

        //Function called when window is resized
        function sizeChange() {
            d3.select("g").attr("transform", "scale(" + $("#container").width()/1000 + ")");
            $("svg").height($("#container").width()*0.75);
        }