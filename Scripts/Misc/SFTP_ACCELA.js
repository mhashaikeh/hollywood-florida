/**
* httpClient builds an Apache commons 3.1 httpclient for
* the specified method and submits the request. It then 
* takes the response and formats it into an AA Script Result
* and returns.
* 
* @param {any} url - The endpoint URL
* @param {any} method - HTTP method (POST, GET, PUT)
* @param {any} headers - Array of header key value pairs. Key is header name, value is header value
* @param {any} content - Needed for POST and sometimes PUT. String content of package
* @param {any} [contentType] - Optional. if content type is omitted, value is set to text/xml
* @param {any} [encoding] - Optional. If encoding is omitted, value is set to utf-8
* @returns AA Script Result Object
*/
function httpClient(url, method, headers, content, contentType, encoding) {
	function toJSArray(bytes) {
		var result = [];
		for (var i in bytes) {
			result.push(bytes[i]);
		}
		return result;
	}

	//content type and encoding are optional; if not sent use default values
	contentType = (typeof contentType != 'undefined') ? contentType : 'text/xml';
	encoding = (typeof encoding != 'undefined') ? encoding : 'utf-8';

	//build the http client, request content, and post method from the apache classes
	//@ts-ignore
	var httpClientClass = org.apache.commons.httpclient;
	var httpClient = new httpClientClass.HttpClient();

	switch (method.toUpperCase()) {
		case "POST":
			method = new httpClientClass.methods.PostMethod(url);
			break;
		case "GET":
			method = new httpClientClass.methods.GetMethod(url);
			content = "";
			break;
		case "PUT":
			method = new httpClientClass.methods.PutMethod(url);
			break;
		default:
			method = '';
	}

	if (typeof headers != 'undefined') {
		for (var key in headers) {
			method.setRequestHeader(key, headers[key]);
		}
	}

	if (typeof content != 'undefined' && content != '') {
		var requestEntity = new httpClientClass.methods.StringRequestEntity(content, contentType, encoding);
		method.setRequestEntity(requestEntity);
	}

	//set variables to catch and logic on response success and error type. build a result object for the data returned
	var resp_success = true;
	var resp_errorType = null;

	var resultObj = {
		resultCode: 999,
		result: null
	};

	//execute the http client call in a try block and once complete, release the connection
	try {
		resultObj.resultCode = httpClient.executeMethod(method);
		resultObj.result = toJSArray(method.getResponseBody());

	} finally {
		method.releaseConnection();
	}

	//if any response other than transaction success, set success to false and catch the error type string
	if (resultObj.resultCode.toString().substr(0, 1) !== '2') {
		resp_success = false;
		resp_errorType = httpStatusCodeMessage(resultObj.resultCode);
	}

	//create script result object with status flag, error type, error message, and output and return
	//@ts-ignore
	var scriptResult = new com.accela.aa.emse.dom.ScriptResult(resp_success, resp_errorType, resultObj.result, resultObj);

	return scriptResult;
}

/**
* Takes a status code and returns the standard HTTP status code string
*
* @param {any} statusCode - Integer of the status code returned from an HTTP request.
* @returns string description of HTTP status code
*/
function httpStatusCodeMessage(statusCode) {
	switch (statusCode) {
		case 100:
			return "100 - Continue";
		case 101:
			return "101 - Switching Protocols";
		case 200:
			return "200 - OK";
		case 201:
			return "201 - Created";
		case 202:
			return "202 - Accepted";
		case 203:
			return "203 - Non-Authoritative Information";
		case 204:
			return "204 - No Content";
		case 205:
			return "205 - Reset Content";
		case 206:
			return "206 - Partial Content";
		case 300:
			return "300 - Multiple Choices";
		case 301:
			return "301 - Moved Permanently";
		case 302:
			return "302 - Found";
		case 303:
			return "303 - See Other";
		case 304:
			return "304 - Not Modified";
		case 305:
			return "305 - Use Proxy";
		case 306:
			return "306 - (Unused)";
		case 307:
			return "307 - Temporary Redirect";
		case 400:
			return "400 - Bad Request";
		case 401:
			return "401 - Unauthorized";
		case 402:
			return "402 - Payment Required";
		case 403:
			return "403 - Forbidden";
		case 404:
			return "404 - Not Found";
		case 405:
			return "405 - Method Not Allowed";
		case 406:
			return "406 - Not Acceptable";
		case 407:
			return "407 - Proxy Authentication Required";
		case 408:
			return "408 - Request Timeout";
		case 409:
			return "409 - Conflict";
		case 410:
			return "410 - Gone";
		case 411:
			return "411 - Length Required";
		case 412:
			return "412 - Precondition Failed";
		case 413:
			return "413 - Request Entity Too Large";
		case 414:
			return "414 - Request-URI Too Long";
		case 415:
			return "415 - Unsupported Media Type";
		case 416:
			return "416 - Requested Range Not Satisfiable";
		case 417:
			return "417 - Expectation Failed";
		case 500:
			return "500 - Internal Server Error";
		case 501:
			return "501 - Not Implemented";
		case 502:
			return "502 - Bad Gateway";
		case 503:
			return "503 - Service Unavailable";
		case 504:
			return "504 - Gateway Timeout";
		case 505:
			return "505 - HTTP Version Not Supported";
	}
	return statusCode + " - Unknown Status Code";
}

function SFTP(debug) {
	//set up
	//retrieve stdChoice apiKey for connection values
	if (debug) {
		debug = true;
	} else {
		debug = false;
	}

	var apiKeyStdChoice = "APIKey";
	var apiKeys = [];
	var bizDomainResult = aa.bizDomain.getBizDomain(apiKeyStdChoice);
	var bizDomain;
	if (bizDomainResult.getSuccess()) {
		bizDomain = bizDomainResult.getOutput().toArray();

		var bizDomainLen = bizDomain.length;
		for (var i = 0; i < bizDomainLen; i++) {
			if (bizDomain[i].auditStatus == "A") {
				apiKeys[bizDomain[i].bizdomainValue] = bizDomain[i].description;
			}
		}
	}

	//define variable for headers and set the content type to JSON.
	var HEADERS = aa.util.newHashMap();
	HEADERS.put("Content-Type", "application/json");

	var CONSTRUCTAPICODE = String(apiKeys["constructApiCode"]);
	var ENVIRONMENT = String(apiKeys["constructApiEnv"]);
	var APIKEYVALUE = String(apiKeys["keyValue"]);

	var SFTP_UPLOAD = String(apiKeys["SFTP_UPLOAD"]);
	var SFTP_DOWNLOAD = String(apiKeys["SFTP_DOWNLOAD"]);
	var SFTP_LIST = String(apiKeys["SFTP_LIST"]);
	var SFTP_DELETE = String(apiKeys["SFTP_DELETE"]);
	var SFTP_CREATEFOLDER = String(apiKeys["SFTP_CREATEFOLDER"]);
	var SFTP_PINGGET = String(apiKeys["SFTP_PINGGET"]);
	var SFTP_PINGPOST = String(apiKeys["SFTP_PINGPOST"]);

	//public functions

	this.upload = function (configStdChoice, filename, content, base64Encoded, folder) {
		var title = "SFTP.upload(): ";

		debugMsg("param: configStdChoice = " + configStdChoice, title);
		debugMsg("param: filename = " + filename, title);
		debugMsg("param: base64Encoded = " + base64Encoded, title);

		if (SFTP_UPLOAD == null) {
			aa.print(title + "SFTP_UPLOAD key is missing from the " + apiKeyStdChoice + " standard choice.");
			return null;
		}

		var b64flag = false;
		if (base64Encoded) {
			b64flag = true;
			debugMsg("base64 flag set to true.", title);
		}
		var url = SFTP_UPLOAD;
		var stringBody = buildStringBody(configStdChoice, folder, filename, content, base64Encoded);

		var upload = httpPost(url, stringBody);
		debugMsg("upload result: " + upload, title);

		return upload;
	}

	this.delete = function (configStdChoice, filename, folder) {
		var title = "SFTP.delete(): ";

		debugMsg("param: configStdChoice = " + configStdChoice, title);
		debugMsg("param: filename = " + filename, title);
		debugMsg("param: folder = " + folder, title);

		if (SFTP_DELETE == null) {
			debugMsg("SFTP_DELETE key is missing from the " + apiKeyStdChoice + " standard choice.");
			return null;
		}

		var url = SFTP_DELETE;
		var stringBody = buildStringBody(configStdChoice, folder, filename);

		var deleteStatus = httpPost(url, stringBody);

		return deleteStatus;
	}

	/**
	 * Download a file from the SFTP server.
	 *
	 * @param {string} configStdChoice - standard choice where config and credentials are located
	 * @param {string} filename - the name of the file to download
	 * @param {boolean} base64Encoded - flag indicating if the file is base64 encoded
	 * @param {string} [folder] - the folder in which the file is located
	 * @param {boolean} [binary] - flag for downloading in binary instead of string (for zips)
	 * @return {Object} the downloaded file
	 */
	this.download = function (configStdChoice, filename, base64Encoded, folder, binary) {
		var title = "SFTP.download(): ";

		debugMsg("param: configStdChoice = " + configStdChoice, title);
		debugMsg("param: filename = " + filename, title);
		debugMsg("param: base64Encoded = " + base64Encoded, title);
		debugMsg("param: folder = " + folder, title);

		if (SFTP_DOWNLOAD == null) {
			debugMsg("SFTP_DOWNLOAD key is missing from the " + apiKeyStdChoice + " standard choice.");
			return null;
		}

		var b64flag = false;
		if (base64Encoded) {
			b64flag = true;
			debugMsg("base64 flag set to true.", title);
		}
		var url = SFTP_DOWNLOAD;
		var stringBody = buildStringBody(configStdChoice, folder, filename, "", b64flag);

		if (binary == true) {
			var download = httpPostBinary(url, stringBody);
			logDebug("Binary download");
		} else {
			var download = httpPost(url, stringBody);
			logDebug("Text download");
		}

		return download;
	}

	this.list = function (configStdChoice, folder) {
		var title = "SFTP.list(): ";

		debugMsg("param: configStdChoice = " + configStdChoice, title);
		debugMsg("param: folder = " + folder, title);

		if (SFTP_LIST == null) {
			debugMsg("SFTP_LIST key is missing from the " + apiKeyStdChoice + " standard choice.");
			return null;
		}

		var url = SFTP_LIST;
		var stringBody = buildStringBody(configStdChoice, folder);

		var list = httpPost(url, stringBody);

		return list;
	}

	this.createFolder = function (configStdChoice, folder) {
		var title = "SFTP.createFolder(): ";

		debugMsg("param: configStdChoice = " + configStdChoice, title);
		debugMsg("param: folder = " + folder, title);

		if (SFTP_CREATEFOLDER == null) {
			debugMsg("SFTP_CREATEFOLDER key is missing from the " + apiKeyStdChoice + " standard choice.");
			return null;
		}

		var url = SFTP_CREATEFOLDER;
		var stringBody = buildStringBody(configStdChoice, folder);

		var folder = httpPost(url, stringBody);
		if (folder == "") {
			folder = "The createFolder endpoint is missing or there is an unknown error.";
		}

		return folder;
	}

	this.pingPost = function (message) {
		var title = "SFTP.pingPost(): ";
		if (SFTP_PINGPOST == null) {
			debugMsg("SFTP_PINGPOST key is missing from the " + apiKeyStdChoice + " standard choice.", title);
			return null;
		}

		var url = SFTP_PINGPOST;
		var stringBody = buildStringBody("", "", "", "", false, message);
		var pingPost = httpPost(url, stringBody);

		return pingPost;
	}

	this.pingGet = function (message) {
		var title = "SFTP.pingGet(): ";

		if (SFTP_PINGGET == null) {
			debugMsg("SFTP_PINGGET key is missing from the " + apiKeyStdChoice + " standard choice.", title);
			return null;
		}

		var url = SFTP_PINGGET + "?message=" + encodeURIComponent(message);
		var pingGet = httpGet(url);

		return pingGet;
	}

	this.decodeBase64 = function (base64string) {
		var title = "SFTP.decodeBase64(): ";
		aa.print(title + "This function is not yet implemented.");

		//not implemented yet

		return;
	}

	this.encodeBase64 = function (input) {
		var title = "encodeBase64(): ";
		var retVal = "";

		try {
			retVal = java.util.Base64.getUrlEncoder().encodeToString(input);
		} catch (err) {
			aa.print(title + "Error = " + err.message);
		}

		return retVal;
	}

	this.apiKeyValues = function () {
		var apiKeys = getApiKey(apiKeyStdChoice);
		for (var idx in apiKeys) {
			debugMsg(idx, apiKeys[idx]);
		}
	}

	//private functions
	var debugMsg = function (message, functionTitle) {
		if (debug) {
			if (!functionTitle) {
				functionTitle = "SFTP(): ";
			}
			if (functionTitle.indexOf("():") == -1) {
				functionTitle = functionTitle + "(): ";
			}
			if (functionTitle.indexOf("SFTP.") == -1) {
				functionTitle = "SFTP." + functionTitle;
			}
			if (!message) {
				aa.print("SFTP.debugMsg(): No message provided");
				return;
			}
			aa.print(functionTitle + message);
		}
	}

	var getApiKey = function (stdChoice) {
		var title = "SFTP.getApiKey(): ";

		var retArray = [];
		var bizDomainResult = aa.bizDomain.getBizDomain(stdChoice);
		var bizDomain;
		if (bizDomainResult.getSuccess()) {
			bizDomain = bizDomainResult.getOutput().toArray();
		} else {
			return retArray;
		}

		var bizDomainLen = bizDomain.length;
		for (var i = 0; i < bizDomainLen; i++) {
			if (bizDomain[i].auditStatus == "A") {
				retArray[bizDomain[i].bizdomainValue] = bizDomain[i].description;
			}
		}

		return retArray;
	}

	var httpPost = function (url, body) {
		var title = "SFTP.httpPost(): ";

		debugMsg("param: url = " + url, title);
		if (typeof url == "undefined" || url == null || url == "") {
			debugMsg("URL can't be undefined, null, or blank.", title);
			return null;
		}

		var postResult = aa.httpClient.post(url, HEADERS, body);
		if (!postResult.getSuccess()) {
			aa.print(title + "Error in HTTP POST: " + postResult.getErrorMessage());
			return null;
		}
		debugMsg("aa.http.post was successful.", title);
		var post = postResult.getOutput();

		return post;
	};

	var httpPostBinary = function (url, body) {
		var title = "SFTP.httpPost(): ";

		debugMsg("param: url = " + url, title);
		if (typeof url == "undefined" || url == null || url == "") {
			debugMsg("URL can't be undefined, null, or blank.", title);
			return null;
		}

		var response = httpClient(url, "POST", {}, body, "application/json", "UTF-8");

		return response.getOutput().result;
	}

	var httpGet = function (url) {
		var title = "SFTP.httpGet(): ";

		debugMsg("param: url = " + url, title);
		if (typeof url == "undefined" || url == null || url == "") {
			debugMsg("URL can't be undefined, null, or blank.", title);
			return null;
		}

		var getResult = aa.httpClient.get(url, HEADERS);
		if (!getResult.getSuccess()) {
			aa.print(title + "Error in HTTP GET: " + getResult.getErrorMessage());
			return null;
		}
		debugMsg("aa.http.get was successful.", title);
		var get = getResult.getOutput();

		return get;
	}

	var buildStringBody = function (configStdChoice, folder, filename, content, base64encoded, message) {
		var title = "SFTP.buildStringBody(): ";
		var stringBody;
		var body = {};

		if (configStdChoice != null || configStdChoice != "") {
			body.configStdChoice = configStdChoice + "";
		} else {
			aa.print(title + "configStdChoice parameter can't be null or empty.");
			return stringBody;
		}

		body.apiKey = APIKEYVALUE;
		body.constructApiCode = CONSTRUCTAPICODE;
		body.environment = ENVIRONMENT;
		body.base64encoded = base64encoded;
		if (typeof content != "undefined" && content != null && content != "") {
			body.content = content + "";
		}
		if (filename && filename != null && filename != "") {
			body.filename = filename + "";
		}
		if (folder && folder != null && folder != "") {
			body.folder = folder + "";
		}
		if (message && message != null && message != "") {
			body.message = message + "";
		}

		try {
			stringBody = JSON.stringify(body);
			debugMsg("stringBody: " + stringBody, title);
		} catch (err) {
			aa.print(title + "Error = " + err.message);
			return null;
		}

		return stringBody;
	}
}