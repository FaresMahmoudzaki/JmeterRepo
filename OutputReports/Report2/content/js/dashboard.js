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

    var data = {"OkPercent": 79.0, "KoPercent": 21.0};
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 100, 21, 21.0, 7037.960000000003, 688, 21147, 3454.0, 21040.9, 21147.0, 21147.0, 1.3873088981992732, 11.701056392372577, 10.091276796738438], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Transaction Controller- sentTransaction ", 100, 21, 21.0, 7037.960000000003, 688, 21147, 3454.0, 21040.9, 21147.0, 21147.0, 1.3361838588989845, 11.269849637560128, 9.719393560428914], "isController": true}, {"data": ["HTTP Request - sendTransaction  1", 10, 3, 30.0, 6953.699999999999, 688, 21147, 3675.5, 21136.3, 21147.0, 21147.0, 0.1431823713864349, 1.0989806310047108, 1.0412882028464656], "isController": false}, {"data": ["HTTP Request - sendTransaction  10", 10, 2, 20.0, 7004.7, 2595, 21041, 3289.0, 21038.0, 21041.0, 21041.0, 0.1420434368829988, 1.1867562694421956, 1.0316598175096945], "isController": false}, {"data": ["HTTP Request - sendTransaction  6", 10, 2, 20.0, 7131.9000000000015, 2985, 21147, 3650.0, 21136.0, 21147.0, 21147.0, 0.139388363859385, 1.17617099293301, 1.0134241884112514], "isController": false}, {"data": ["HTTP Request - sendTransaction  7", 10, 2, 20.0, 6947.9, 2732, 21038, 3348.5, 21036.9, 21038.0, 21038.0, 0.14317622129316765, 1.2164945270889411, 1.0426137177137622], "isController": false}, {"data": ["HTTP Request - sendTransaction  8", 10, 2, 20.0, 7088.3, 2797, 21060, 3472.0, 21059.1, 21060.0, 21060.0, 0.1404040829507322, 1.1962318176712579, 1.0218099095446695], "isController": false}, {"data": ["HTTP Request - sendTransaction  9", 10, 2, 20.0, 7064.799999999999, 2725, 21030, 3351.5, 21029.6, 21030.0, 21030.0, 0.1409622080320266, 1.2140232508352011, 1.0250457906922654], "isController": false}, {"data": ["HTTP Request - sendTransaction  2", 10, 2, 20.0, 7065.1, 2696, 21147, 3344.5, 21135.8, 21147.0, 21147.0, 0.14085300580314383, 1.2015146539945913, 1.0236189582863824], "isController": false}, {"data": ["HTTP Request - sendTransaction  3", 10, 2, 20.0, 6988.1, 2832, 21147, 3518.0, 21136.4, 21147.0, 21147.0, 0.14240956992309883, 1.2145561494232413, 1.0373368965394474], "isController": false}, {"data": ["HTTP Request - sendTransaction  4", 10, 2, 20.0, 7108.5, 2817, 21147, 3674.0, 21136.3, 21147.0, 21147.0, 0.13998740113389796, 1.1939530910968013, 1.0175607632813046], "isController": false}, {"data": ["HTTP Request - sendTransaction  5", 10, 2, 20.0, 7026.6, 2766, 21147, 3472.0, 21135.8, 21147.0, 21147.0, 0.14160094023024314, 1.2260511878548874, 1.031156300002832], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 192.168.1.47:7979 [/192.168.1.47] failed: Connection timed out: connect", 20, 95.23809523809524, 20.0], "isController": false}, {"data": ["500", 1, 4.761904761904762, 1.0], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 100, 21, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 192.168.1.47:7979 [/192.168.1.47] failed: Connection timed out: connect", 20, "500", 1, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["HTTP Request - sendTransaction  1", 10, 3, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 192.168.1.47:7979 [/192.168.1.47] failed: Connection timed out: connect", 2, "500", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["HTTP Request - sendTransaction  10", 10, 2, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 192.168.1.47:7979 [/192.168.1.47] failed: Connection timed out: connect", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["HTTP Request - sendTransaction  6", 10, 2, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 192.168.1.47:7979 [/192.168.1.47] failed: Connection timed out: connect", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["HTTP Request - sendTransaction  7", 10, 2, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 192.168.1.47:7979 [/192.168.1.47] failed: Connection timed out: connect", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["HTTP Request - sendTransaction  8", 10, 2, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 192.168.1.47:7979 [/192.168.1.47] failed: Connection timed out: connect", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["HTTP Request - sendTransaction  9", 10, 2, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 192.168.1.47:7979 [/192.168.1.47] failed: Connection timed out: connect", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["HTTP Request - sendTransaction  2", 10, 2, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 192.168.1.47:7979 [/192.168.1.47] failed: Connection timed out: connect", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["HTTP Request - sendTransaction  3", 10, 2, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 192.168.1.47:7979 [/192.168.1.47] failed: Connection timed out: connect", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["HTTP Request - sendTransaction  4", 10, 2, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 192.168.1.47:7979 [/192.168.1.47] failed: Connection timed out: connect", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["HTTP Request - sendTransaction  5", 10, 2, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 192.168.1.47:7979 [/192.168.1.47] failed: Connection timed out: connect", 2, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
