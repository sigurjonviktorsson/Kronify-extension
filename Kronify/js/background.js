var currencies = {};

function dataIsOld() {
	if(currencies.USD == undefined) return true;
	var now = new Date();
	var data = new Date(currencies.USD.date);
	if(data.getDate() < now.getDate())
		return true;
	if(data.getMonth() < now.getMonth())
		return true;
	if(data.getYear() < now.getYear())
		return true;
	return false;
}

function updateData(sendResponse) {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "https://www.landsbankinn.is/modules/markets/services/XMLGengi.asmx/NyjastaGengiByType?strTegund=A", true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4 && xhr.status == 200) {
			var elems = xhr.responseXML.getElementsByTagName("GjaldmidillRow");
			for(var i = 0; i < elems.length; i++) {
				var elem = elems.item(i);
				var currency = elem.getElementsByTagName("Mynt").item(0).childNodes[0].data;
				var value = elem.getElementsByTagName("Sala").item(0).childNodes[0].data;
				var date = Date(elem.getElementsByTagName("Dagsetning").item(0).childNodes[0].data);
				currencies[currency] = {value: value, date: date};
			}
			sendResponse({currencies: currencies});
		}
	}
	xhr.send();
}

chrome.runtime.onInstalled.addListener(function() {
	var context = ["selection"];
	var id = chrome.contextMenus.create({"title": "Breyta í krónur", "contexts":context,
	                                     "id": "kronur"});
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) 
{
	if(request.message == "currency") {
		if(dataIsOld())
			updateData(sendResponse);
		else  
			sendResponse({currencies: currencies});
	}
	else if(request.message == "context") {
		chrome.contextMenus.update('kronur',{
                'title': request.title, 
                'enabled': false, 
                "contexts": ["selection"]
            });
	}
	
	return true;
});