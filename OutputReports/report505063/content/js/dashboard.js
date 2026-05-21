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

    var data = {"OkPercent": 95.0, "KoPercent": 5.0};
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 100, 5, 5.0, 3123.52, 409, 5810, 3026.5, 4373.300000000001, 5101.849999999999, 5809.55, 2.931691586045148, 28.115838463793608, 26.657923125549694], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Transaction Controller- sentTransaction ", 100, 5, 5.0, 3123.52, 409, 5810, 3026.5, 4373.300000000001, 5101.849999999999, 5809.55, 2.735903258460781, 26.238167218407156, 24.877616421233345], "isController": true}, {"data": ["HTTP Request - sendTransaction  1", 10, 0, 0.0, 3233.3999999999996, 2551, 5106, 2968.0, 4980.0, 5106.0, 5106.0, 0.30599755201958384, 3.074498450887393, 2.7809320494186047], "isController": false}, {"data": ["HTTP Request - sendTransaction  10", 10, 0, 0.0, 3135.9, 2226, 5615, 2995.5, 5439.900000000001, 5615.0, 5615.0, 0.31645569620253167, 3.240333267405063, 2.8765946400316453], "isController": false}, {"data": ["HTTP Request - sendTransaction  6", 10, 1, 10.0, 2920.4000000000005, 517, 4386, 2997.0, 4297.5, 4386.0, 4386.0, 0.3387648633083777, 3.044913869033504, 3.079021932907619], "isController": false}, {"data": ["HTTP Request - sendTransaction  7", 10, 0, 0.0, 3274.1000000000004, 2446, 4898, 3177.0, 4766.400000000001, 4898.0, 4898.0, 0.3024711896191888, 3.020724238906869, 2.7490023176854903], "isController": false}, {"data": ["HTTP Request - sendTransaction  8", 10, 0, 0.0, 3279.4, 2047, 5810, 3203.0, 5576.4000000000015, 5810.0, 5810.0, 0.30215131737974377, 3.0457974056532513, 2.7496064951202563], "isController": false}, {"data": ["HTTP Request - sendTransaction  9", 10, 1, 10.0, 2981.9, 409, 4259, 2974.0, 4245.6, 4259.0, 4259.0, 0.33153200941550903, 3.063271588950038, 3.015775743460531], "isController": false}, {"data": ["HTTP Request - sendTransaction  2", 10, 0, 0.0, 3132.4999999999995, 2369, 5561, 2725.0, 5382.900000000001, 5561.0, 5561.0, 0.316035648821187, 3.1656031737880035, 2.876541661399406], "isController": false}, {"data": ["HTTP Request - sendTransaction  3", 10, 0, 0.0, 3355.0, 2249, 5765, 3060.5, 5631.3, 5765.0, 5765.0, 0.2948287045226723, 2.9539014590335517, 2.67885276623032], "isController": false}, {"data": ["HTTP Request - sendTransaction  4", 10, 2, 20.0, 2824.6, 704, 5023, 2802.0, 4924.8, 5023.0, 5023.0, 0.3487479946990305, 2.8245181828485735, 3.17166547874381], "isController": false}, {"data": ["HTTP Request - sendTransaction  5", 10, 1, 10.0, 3098.0, 703, 5008, 3150.0, 4893.400000000001, 5008.0, 5008.0, 0.31949902552797216, 2.9350228841177035, 2.9060058827758075], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500", 5, 100.0, 5.0], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 100, 5, "500", 5, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["HTTP Request - sendTransaction  6", 10, 1, "500", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["HTTP Request - sendTransaction  9", 10, 1, "500", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["HTTP Request - sendTransaction  4", 10, 2, "500", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["HTTP Request - sendTransaction  5", 10, 1, "500", 1, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
