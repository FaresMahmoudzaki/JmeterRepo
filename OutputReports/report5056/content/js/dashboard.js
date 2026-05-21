/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 93.0, "KoPercent": 7.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.0, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "Transaction Controller- sentTransaction "], "isController": true}, {"data": [0.0, 500, 1500, "HTTP Request - sendTransaction  1"], "isController": false}, {"data": [0.0, 500, 1500, "HTTP Request - sendTransaction  10"], "isController": false}, {"data": [0.0, 500, 1500, "HTTP Request - sendTransaction  6"], "isController": false}, {"data": [0.0, 500, 1500, "HTTP Request - sendTransaction  7"], "isController": false}, {"data": [0.0, 500, 1500, "HTTP Request - sendTransaction  8"], "isController": false}, {"data": [0.0, 500, 1500, "HTTP Request - sendTransaction  9"], "isController": false}, {"data": [0.0, 500, 1500, "HTTP Request - sendTransaction  2"], "isController": false}, {"data": [0.0, 500, 1500, "HTTP Request - sendTransaction  3"], "isController": false}, {"data": [0.0, 500, 1500, "HTTP Request - sendTransaction  4"], "isController": false}, {"data": [0.0, 500, 1500, "HTTP Request - sendTransaction  5"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 100, 7, 7.0, 3163.8099999999995, 275, 5765, 3144.5, 4439.300000000001, 5101.0499999999965, 5759.749999999997, 2.941955223441499, 27.685723564693596, 26.754669434556206], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Transaction Controller- sentTransaction ", 100, 7, 7.0, 3163.8099999999995, 275, 5765, 3144.5, 4439.300000000001, 5101.0499999999965, 5759.749999999997, 2.680031088360625, 25.220846077439496, 24.37268428563771], "isController": true}, {"data": ["HTTP Request - sendTransaction  1", 10, 2, 20.0, 2950.9, 275, 4743, 3187.0, 4719.7, 4743.0, 4743.0, 0.3354241438298729, 2.7170338338141082, 3.0504926018012277], "isController": false}, {"data": ["HTTP Request - sendTransaction  10", 10, 1, 10.0, 3096.2, 422, 5765, 3006.0, 5554.400000000001, 5765.0, 5765.0, 0.32021518460405396, 2.938756094095232, 2.909580237919882], "isController": false}, {"data": ["HTTP Request - sendTransaction  6", 10, 0, 0.0, 3266.2, 2427, 5154, 3158.5, 4982.000000000001, 5154.0, 5154.0, 0.3041270034366352, 3.076642618457468, 2.7653876383777867], "isController": false}, {"data": ["HTTP Request - sendTransaction  7", 10, 0, 0.0, 3288.1, 2659, 5118, 3160.0, 4949.200000000001, 5118.0, 5118.0, 0.3016409266409266, 3.023125490166506, 2.742251834353885], "isController": false}, {"data": ["HTTP Request - sendTransaction  8", 10, 1, 10.0, 3217.7, 1106, 4205, 3321.5, 4199.5, 4205.0, 4205.0, 0.3073518564052127, 2.776521823902754, 2.7951310183335383], "isController": false}, {"data": ["HTTP Request - sendTransaction  9", 10, 1, 10.0, 3091.2, 906, 4760, 3109.5, 4663.700000000001, 4760.0, 4760.0, 0.3209036647198511, 2.9479263606315387, 2.9179043185610682], "isController": false}, {"data": ["HTTP Request - sendTransaction  2", 10, 0, 0.0, 3338.5, 2706, 5240, 3125.0, 5068.800000000001, 5240.0, 5240.0, 0.297548202808855, 2.987337464294216, 2.7072818413770534], "isController": false}, {"data": ["HTTP Request - sendTransaction  3", 10, 0, 0.0, 3376.5, 2012, 5141, 3210.5, 5104.8, 5141.0, 5141.0, 0.2942041776993233, 2.962986586128273, 2.6767121304060018], "isController": false}, {"data": ["HTTP Request - sendTransaction  4", 10, 2, 20.0, 2711.7999999999997, 287, 4325, 2963.0, 4295.8, 4325.0, 4325.0, 0.36599202137393405, 3.0492782522965998, 3.325738045785602], "isController": false}, {"data": ["HTTP Request - sendTransaction  5", 10, 0, 0.0, 3301.0, 2493, 4452, 3140.5, 4437.3, 4452.0, 4452.0, 0.30072474663940096, 3.015558511638048, 2.738504091736084], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500", 7, 100.0, 7.0], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 100, 7, "500", 7, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["HTTP Request - sendTransaction  1", 10, 2, "500", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["HTTP Request - sendTransaction  10", 10, 1, "500", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["HTTP Request - sendTransaction  8", 10, 1, "500", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["HTTP Request - sendTransaction  9", 10, 1, "500", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["HTTP Request - sendTransaction  4", 10, 2, "500", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
