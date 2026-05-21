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

    var data = {"OkPercent": 98.0, "KoPercent": 2.0};
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 100, 2, 2.0, 7290.159999999998, 918, 11763, 7720.0, 9159.800000000001, 10099.399999999998, 11755.819999999996, 1.2766663687778472, 12.558519693376656, 11.60656792982165], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Transaction Controller- sentTransaction ", 100, 2, 2.0, 7290.159999999998, 918, 11763, 7720.0, 9159.800000000001, 10099.399999999998, 11755.819999999996, 1.2371338083927157, 12.169639363896724, 11.247165223859364], "isController": true}, {"data": ["HTTP Request - sendTransaction  1", 10, 0, 0.0, 7208.2, 3259, 8604, 7690.0, 8601.6, 8604.0, 8604.0, 0.13796909492273732, 1.37496173513383, 1.2554379225303531], "isController": false}, {"data": ["HTTP Request - sendTransaction  10", 10, 0, 0.0, 7009.0, 3188, 10107, 6720.0, 10014.2, 10107.0, 10107.0, 0.14186208168418663, 1.407620964023776, 1.2897396697805394], "isController": false}, {"data": ["HTTP Request - sendTransaction  6", 10, 1, 10.0, 6805.3, 918, 8507, 8024.0, 8494.6, 8507.0, 8507.0, 0.1460877695319348, 1.316730153976509, 1.3284713877972887], "isController": false}, {"data": ["HTTP Request - sendTransaction  7", 10, 0, 0.0, 7653.3, 4716, 11763, 7937.5, 11451.400000000001, 11763.0, 11763.0, 0.1302269856359635, 1.3061614049538346, 1.183374144571488], "isController": false}, {"data": ["HTTP Request - sendTransaction  8", 10, 0, 0.0, 7689.9, 3829, 10432, 7684.0, 10410.9, 10432.0, 10432.0, 0.12939288856684436, 1.313198822686455, 1.1765275841377256], "isController": false}, {"data": ["HTTP Request - sendTransaction  9", 10, 0, 0.0, 7638.1, 3637, 11045, 8423.5, 10934.1, 11045.0, 11045.0, 0.13024394691256724, 1.3138230953450813, 1.1837699354641245], "isController": false}, {"data": ["HTTP Request - sendTransaction  2", 10, 0, 0.0, 7013.0, 3090, 8644, 7558.0, 8641.6, 8644.0, 8644.0, 0.14180776539323292, 1.4268990940256387, 1.28858112910888], "isController": false}, {"data": ["HTTP Request - sendTransaction  3", 10, 0, 0.0, 7357.7, 3994, 9955, 7586.0, 9777.400000000001, 9955.0, 9955.0, 0.13523381927352393, 1.351836348484029, 1.2295448283206665], "isController": false}, {"data": ["HTTP Request - sendTransaction  4", 10, 1, 10.0, 7151.2, 1054, 8795, 8028.0, 8752.4, 8795.0, 8795.0, 0.13897768018456236, 1.2615888927300776, 1.2644390209369876], "isController": false}, {"data": ["HTTP Request - sendTransaction  5", 10, 0, 0.0, 7375.9, 5198, 9113, 7301.0, 9092.3, 9113.0, 9113.0, 0.13490725126475547, 1.357952150084317, 1.2253636172006745], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500", 2, 100.0, 2.0], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 100, 2, "500", 2, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["HTTP Request - sendTransaction  6", 10, 1, "500", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["HTTP Request - sendTransaction  4", 10, 1, "500", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
