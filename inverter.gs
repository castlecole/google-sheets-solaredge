function getInverter()
{
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("inverter_data");
  var sheetSiteInfo = ss.getSheetByName("details");

  //date configs and column/row values
  var date = Utilities.formatDate(new Date(), "GMT", "yyyy-MM-dd");
  //Logger.log(date);
  
  //solaredge configuration
  //get the total days in the current month
  var startTime = "%2001:00:00";
  var endTime = "%2023:00:00";
  var siteId = sheetSiteInfo.getRange("B2").getValue();
  var apiKey = sheetSiteInfo.getRange("B7").getValue();
  var inverterSerial = sheetSiteInfo.getRange("B8").getValue();
  var solarEdgeUrl = "https://monitoringapi.solaredge.com/equipment/"+siteId+"/"+inverterSerial+"/data.xml?api_key="+apiKey+"&startTime="+date+startTime+"&endTime="+date+endTime;
  Logger.log("SolarEdge URL="+solarEdgeUrl);
  
  //go get some data
  var response = UrlFetchApp.fetch(solarEdgeUrl).getContentText();
  Logger.log(response)
  
  //now parse it and get our values
  var artifact = XmlService.parse(response);
  var inverter = new Array();
  
  var timeValues = artifact.getRootElement().getChild("telemetries").getChildren("onePhaseInverterTelemetry");
  Logger.log(timeValues);
  for(var i = 0; i < timeValues.length; i++)
  {
     // check if temperature exists, sometimes it's not set. 
    if (timeValues[i].getChild("temperature") !== null) {
      var temp = timeValues[i].getChild("temperature").getValue();
    } else var temp = 0;    
    timeStats=[timeValues[i].getChild("date").getValue(),timeValues[i].getChild("totalActivePower").getValue(),temp]
    inverter.push(timeStats);
  }
  //Logger.log(inverter)
  //Logger.log(inverter.length);
  
  //clear the cells before writing
  sheet.getRange("A2:C1000").clearContent();
  
  //During early morning hours there won't be any data
  if (inverter.length != 0)
  {
    var arrayRange = sheet.getRange("A2:C"+((inverter.length)+1));
    arrayRange.setValues(inverter);
    var timeRange = sheet.getRange("A2:A"+((inverter.length)+1));
    timeRange.setNumberFormat("HH:mm");
  }
}
