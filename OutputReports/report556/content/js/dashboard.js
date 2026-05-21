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

    var data = {"OkPercent": 97.0, "KoPercent": 3.0};
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 100, 3, 3.0, 3232.3, 802, 7266, 3133.5, 4105.700000000002, 4877.849999999997, 7248.879999999991, 2.8700169330999055, 27.959654512742873, 26.092573965717644], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Transaction Controller- sentTransaction ", 100, 3, 3.0, 3232.3, 802, 7266, 3133.5, 4105.700000000002, 4877.849999999997, 7248.879999999991, 2.6820437173125926, 26.128422748759558, 24.383627589848466], "isController": true}, {"data": ["HTTP Request - sendTransaction  1", 10, 0, 0.0, 3459.2, 2120, 7266, 3094.0, 6893.200000000001, 7266.0, 7266.0, 0.28700169330999054, 2.881648349381511, 2.6107905013202077], "isController": false}, {"data": ["HTTP Request - sendTransaction  10", 10, 0, 0.0, 3210.8, 2303, 4347, 3194.0, 4265.6, 4347.0, 4347.0, 0.3094250881861501, 3.1081206197010958, 2.8110544046661303], "isController": false}, {"data": ["HTTP Request - sendTransaction  6", 10, 0, 0.0, 3285.1, 2414, 4131, 3267.5, 4096.400000000001, 4131.0, 4131.0, 0.3023523009010099, 3.040471272752011, 2.745323460270908], "isController": false}, {"data": ["HTTP Request - sendTransaction  7", 10, 0, 0.0, 3196.2, 2472, 4209, 3227.5, 4152.5, 4209.0, 4209.0, 0.3102506825515016, 3.065785748634897, 2.8195848651960786], "isController": false}, {"data": ["HTTP Request - sendTransaction  8", 10, 0, 0.0, 3189.9, 2582, 3878, 3148.0, 3862.8, 3878.0, 3878.0, 0.31159442869161497, 3.1702907370766207, 2.8321012370298817], "isController": false}, {"data": ["HTTP Request - sendTransaction  9", 10, 0, 0.0, 3235.3999999999996, 2070, 4891, 3262.5, 4767.1, 4891.0, 4891.0, 0.3069650366823219, 3.059847870046352, 2.7892749773613286], "isController": false}, {"data": ["HTTP Request - sendTransaction  2", 10, 1, 10.0, 3117.7000000000003, 802, 5554, 3114.0, 5337.6, 5554.0, 5554.0, 0.3183496752833312, 2.889893790589584, 2.8972307557621293], "isController": false}, {"data": ["HTTP Request - sendTransaction  3", 10, 1, 10.0, 3139.0, 2346, 4904, 3020.5, 4769.1, 4904.0, 4904.0, 0.31633556877135266, 2.8543106652537014, 2.8779431564753892], "isController": false}, {"data": ["HTTP Request - sendTransaction  4", 10, 1, 10.0, 3272.5000000000005, 2031, 4628, 3349.5, 4529.8, 4628.0, 4628.0, 0.3033520400424693, 2.7795815637797663, 2.759792583042621], "isController": false}, {"data": ["HTTP Request - sendTransaction  5", 10, 0, 0.0, 3217.2, 2515, 5139, 2879.0, 5051.6, 5139.0, 5139.0, 0.3086229245108327, 3.0833359051910376, 2.8062986081106103], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500", 3, 100.0, 3.0], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 100, 3, "500", 3, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["HTTP Request - sendTransaction  2", 10, 1, "500", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["HTTP Request - sendTransaction  3", 10, 1, "500", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["HTTP Request - sendTransaction  4", 10, 1, "500", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
