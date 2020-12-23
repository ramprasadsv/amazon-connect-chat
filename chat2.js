
var credentials;
var secretKey;
var accessKey;
var sessionId;
var connect;
var s3;
var sqs;
var webSocket;
var connectionToken;
var clientToken;
var currentColor = 0;
var timer;
var dlgSourceAccessKey, dlgSourceSecretKey, dlgSourceRegion, dlgInstanceId, dlgContactFlowId;
var timeOut;
$( document ).ready(function() {
    if (!checkCookie()) {
        setAWSConfig(dlgSourceAccessKey, dlgSourceSecretKey, dlgSourceRegion);
        setupAll();
    } else {
        setupAll();
        $( "#configDialog" ).dialog( "open" );
    }
});

function setupAll() {
    loadConnectAPIs();
    $("#awsConfiguration").click(() => {
        $( "#configDialog" ).dialog( "open" );
    });

    $("#dialog").dialog({
        autoOpen: false,
        modal: true
      });
    
    $("#resultDialog").dialog({
        autoOpen: false,
        modal: true
    });

    
    $('#configDialog').dialog({
        autoOpen: false,
        width: 850,
        modal: true,
        resizable: false,
        height: "auto"        
    });
    
    $("#btnGetToken").click(() => {
    	getToken();    	
    });
    
    $("#btnGetTokenOld").click(() => {
    	getTokenOld();    	
    });
    
    $("#btnConnect").click(() => {
    	initiateWSSConnect();    	
    });

    $("#btnDisConnect").click(() => {
    	disConnectWSS();    	
    });

    $("#btnConfiguration").click(() => {
        if (saveCookie()) {
            $( "#configDialog" ).dialog( "close" );
        } else {
            $( "#configDialog" ).dialog( "open" );
        }
    });
    
    $("#btnSendMessage").click(() => {
    	sendMessage();    	
    });
    
    $("#btnGetTranscripts").click(() => {
    	getTranscripts();    	
    });
    
    $("#btnSendEvent").click(() => {
    	sendEvents();    	
    });
    
    $("#btnStopContact").click(() => {
    	stopContactAPI();    	
    });
    
    $("#btnStartAttachmentUpload").click(() => {
    	startAttachmentUpload();    	
    });

    $("#btnCompleteAttachmentUpload").click(() => {
    	completeAttachmentUpload();    	
    });

    $("#btnUploadFile").click(() => {
    	s3upload();    	
    });

    $("#btnGetAttachment").click(() => {
    	getAttachment();    	
    });

    
}

function getAttachment() {
	var signedURL = JSON.parse($('#txtAttachmentDetails').val());
	var token = JSON.parse($('#txtOldToken').val());
	
	var attachmentId = signedURL.AttachmentId;
	var participantToken = token.ParticipantToken;
	var clientToken = uuidv4();

	var payload = {
			AttachmentId: attachmentId 
			};
	$.ajax({
	    url: "https://participant.connect.us-east-1.amazonaws.com/participant/attachment",
	    headers: {
	        "X-Amz-Bearer":participantToken
	    },	    
	    type: "POST",
	    dataType:"json",
	    async: false,
	    data: JSON.stringify(payload),
	    success: function(result) {
	        console.log("Success!");
	        console.log(JSON.stringify(result));
	    },
	    error: function(result) {
	        console.log("Error:");
	        console.log(result);
	    },
	    complete: function(data) {
	    }
	});
	
}

function s3upload() {
	var files = document.getElementById('fileUpload').files;
    var file = files[0];
    var fileName = file.name;
	var signedURL = JSON.parse($('#txtAttachmentDetails').val());
	//var headers = JSON.stringify(signedURL.UploadMetadata.HeadersToInclude); 
	var headers = signedURL.UploadMetadata.HeadersToInclude;
	var url = signedURL.UploadMetadata.Url;  
	
	$.ajax({
		 xhr: function() {
			    var xhr = new window.XMLHttpRequest();
			    xhr.upload.addEventListener("progress", function(evt) {
			      if (evt.lengthComputable) {
			        var percentComplete = evt.loaded / evt.total;
			        percentComplete = parseInt(percentComplete * 100);
			        console.log(percentComplete);
			        $("progress").attr('value', percentComplete);
			      }
			    }, false);
			    return xhr;
			  },		
	    url: url,
	    headers: headers,	    
	    type: "PUT",
	    contentType: false,
	    processData: false,
	    data: file,
	    success: function(result) {
	        console.log("Success!");
	        console.log(JSON.stringify(result));
	    },
	    error: function(result) {
	        console.log("Error:");
	        console.log(result);
	    },
	    complete: function(data) {
	    }
	});
}

function startAttachmentUpload(token, payload){
	var files = document.getElementById('fileUpload').files;
	var file; 
	var fileName ="";
	var fileSize =0;
   if (files) {
     file = files[0];
     fileName = file.name;
     fileSize = file.size;
   }	
	var token = JSON.parse($('#txtOldToken').val());
	var contactId = token.ContactId;
	var participantToken = token.ParticipantToken;
	var clientToken = uuidv4();
	var payload = {
			AttachmentName: fileName,
			AttachmentSizeInBytes: fileSize,
			ClientToken : clientToken, 
			 ContentType: "text/plain"
				  };	
	
	$.ajax({
	    url: "https://participant.connect.us-east-1.amazonaws.com/participant/start-attachment-upload",
	    headers: {
	        "X-Amz-Bearer":participantToken
	    },	    
	    type: "POST",
	    dataType:"json",
	    async: false,
	    data: JSON.stringify(payload),
	    success: function(result) {
	        console.log("Success!");
	        console.log(JSON.stringify(result));
	        $('#txtAttachmentDetails').val(JSON.stringify(result));
	    },
	    error: function(result) {
	        console.log("Error:");
	        console.log(result);
	    },
	    complete: function(data) {
	    }
	});
	
}

function completeAttachmentUpload(token, payload){
	var signedURL = JSON.parse($('#txtAttachmentDetails').val());
	var token = JSON.parse($('#txtOldToken').val());
	
	var attachmentId = signedURL.AttachmentId;
	var participantToken = token.ParticipantToken;
	var clientToken = uuidv4();

	var payload = {
			AttachmentIds: [attachmentId ],
			ClientToken: clientToken
			};
	$.ajax({
	    url: "https://participant.connect.us-east-1.amazonaws.com/participant/complete-attachment-upload",
	    headers: {
	        "X-Amz-Bearer":participantToken
	    },	    
	    type: "POST",
	    dataType:"json",
	    async: false,
	    data: JSON.stringify(payload),
	    success: function(result) {
	        console.log("Success!");
	        console.log(JSON.stringify(result));
	    },
	    error: function(result) {
	        console.log("Error:");
	        console.log(result);
	    },
	    complete: function(data) {
	    }
	});
	
}

async function stopContactAPI() {
	var token = JSON.parse($('#txtOldToken').val());
	var contactId = token.ContactId;
	var participantToken = token.ParticipantToken;
	var clientToken = uuidv4();
	var resp = await stopContact(dlgInstanceId, contactId); 
	console.log(resp);	
}

async function sendEvents() {
	var token = JSON.parse($('#txtOldToken').val());
	var contactId = token.ContactId;
	var participantToken = token.ParticipantToken;
	var clientToken = uuidv4();
	var payload = {
			 ClientToken: clientToken,
			 Content: "",
			 ContentType: "application/vnd.amazonaws.connect.event.typing"
				  };	
	sendTypingEvent(participantToken, JSON.stringify(payload));	
}

function sendTypingEvent(token, payload){
	$.ajax({
	    url: "https://participant.connect.us-east-1.amazonaws.com/participant/event",
	    headers: {
	        "X-Amz-Bearer":token
	    },	    
	    type: "POST",
	    dataType:"json",
	    async: false,
	    data: payload,
	    success: function(result) {
	        console.log("Success!");
	        console.log(JSON.stringify(result));
	    },
	    error: function(result) {
	        console.log("Error:");
	        console.log(result);
	    },
	    complete: function(data) {
	    }
	});
	
}

async function getTranscripts() {
	var token = JSON.parse($('#txtOldToken').val());
	var contactId = token.ContactId;
	var participantToken = token.ParticipantToken;
	var payload = {
		ContactId : contactId,
		SortOrder : "ASCENDING"
	};	
	getChatTranscripts(participantToken, JSON.stringify(payload));	
}

async function disConnectWSS() {
	disconnect();
}

async function getTokenOld(){
	var oldToken = JSON.parse($('#txtOldToken').val());
	getToken(oldToken.ParticipantToken);
}

async function getToken(oldParticipantToken){

	var resp;
	if(!oldParticipantToken) {
		var participantDetails = {};
		participantDetails["DisplayName"] = $('#txtUserName').val();
		resp = await startChatContact(dlgInstanceId, dlgContactFlowId, participantDetails);
		$('#txtOldToken').val(JSON.stringify(resp));
		console.log(resp);
	} else {
		resp = {};
		resp['ParticipantToken'] = oldParticipantToken;
	}
	//getWSSURL(a.ParticipantToken);
	
	const response = await fetch('https://participant.connect.us-east-1.amazonaws.com/participant/connection', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Amz-Bearer': resp.ParticipantToken
        },
        mode: 'cors',
        body: '{"Type": ["WEBSOCKET","CONNECTION_CREDENTIALS"]}'
    }).then(function(response) {
    	console.log(response);
    	response.json().then(function(data) {
            console.log(data);
            $('#txtOldCredentials').val(JSON.stringify(data));
          });
    	
    })
    .then(function(text) {
      console.log('Request successful', text);
    })
    .catch(function(error) {
    	console.log('Request failed', error)
    });
}


function getChatTranscripts(token, payload){
	$.ajax({
	    url: "https://participant.connect.us-east-1.amazonaws.com/participant/transcript",
	    headers: {
	        "X-Amz-Bearer":token
	    },	    
	    type: "POST",
	    dataType:"json",
	    async: false,
	    data: payload,
	    success: function(result) {
	        console.log("Success!");
	        console.log(JSON.stringify(result));
	        for(var i=0; i < result.Transcript.length; i++) {
	        	var m = result.Transcript[i];
	        	if(m.Type === 'MESSAGE') {
	                var spn;
	                try{
	                    
	                	if(m.ParticipantRole === 'AGENT'){
	                		$("#chatMessages").append('<div  class="chatAgent"><span>' + m.DisplayName + " : " + m.Content + '</span></div>');
	                	}
	                	else if (m.ParticipantRole === 'CUSTOMER'){
	                		$("#chatMessages").append('<div class="chatCustomer"><span>' + m.DisplayName + " : " + m.Content + '</span></div>');
	                	} else {
	                		$("#chatMessages").append('<div  class="chatAgent"><span>' + m.DisplayName + " : " + m.Content + '</span></div>');
	                	}
	                	
	                }catch(e){
	                	console.log(e);
	                }
	        		
	        	}
	        }
	    },
	    error: function(result) {
	        console.log("Error:");
	        console.log(result);
	    },
	    complete: function(data) {
	    }
	});
	
}


function connectToChatUsingWSS(payload){
	$('#txtWSURL').val(payload.Websocket.Url);
	connectionToken = payload.ConnectionCredentials.ConnectionToken;
}

function sendMessage(){
	
	var txt ={
			   ClientToken: uuidv4(),
			   Content: $('#txtMessage').val(),
			   ContentType: "text/plain"
			};
	
	$.ajax({
	    url: "https://participant.connect.us-east-1.amazonaws.com/participant/message",
	    headers: {
	        "X-Amz-Bearer":connectionToken
	    },	    
	    type: "POST",
	    dataType:"json",
	    async: false,
	    data: JSON.stringify(txt),
	    success: function(result) {
	        console.log("Success!");
	        console.log(JSON.stringify(result));
	    },
	    error: function(result) {
	        console.log("Error:");
	        console.log(result);
	    },
	    complete: function(data) {
	    }
	});
	
}

function disconnect(){
	clearInterval(timer);
	var txt ={
			   ClientToken: uuidv4(),
			};
	
	$.ajax({
	    url: "https://participant.connect.us-east-1.amazonaws.com/participant/disconnect",
	    headers: {
	        "X-Amz-Bearer":connectionToken
	    },	    
	    type: "POST",
	    dataType:"json",
	    async: false,
	    data: JSON.stringify(txt),
	    success: function(result) {
	        console.log("Success!");
	        console.log(JSON.stringify(result));
	    },
	    error: function(result) {
	        console.log("Error:");
	        console.log(result);
	    },
	    complete: function(data) {
	    }
	});
	
}

 

function sendHeartBeat() {
	webSocket.send('{"topic":"aws/heartbeat"}');
}

function initiateWSSConnect(){
	webSocket  = new WebSocket($("#txtWSURL").val());

	webSocket.onopen = function (event) {              
		webSocket.send('{"topic":"aws/subscribe","content":{"topics":["aws/chat"]}}');
		webSocket.send('{"topic":"aws/heartbeat"}');
		timer = setInterval(sendHeartBeat, (60 * 1000));
	};
  
  webSocket.onmessage = function (event) {
        console.log(event.data);
        //addRowsToTable(event.data);
        var spn;
        try{
            if(currentColor === 1) {
            	spn = "<div class='grey_even'><span>" + event.data + "</span></div>";
            	currentColor =0;
            } else {
            	spn = "<div class='grey_odd'><span>" + event.data + "</span></div>";
            	currentColor=1;
            }
            $("#wsMessages").append(spn);
        }catch(e){
        	console.log(e);
        }
        
        
        var body = JSON.parse(event.data);
        var content = body.content ? JSON.parse(body.content) : ""
        if(content.ContentType === 'text/plain') {
        	var pr = content.ParticipantRole;
        	if(pr === 'AGENT'){
        		$("#chatMessages").append('<div  class="chatAgent"><span>' + content.DisplayName + " : " + content.Content + '</span></div>');
        	}
        	else if (pr === 'CUSTOMER'){
        		$("#chatMessages").append('<div class="chatCustomer"><span>' + content.DisplayName + " : " + content.Content + '</span></div>');
        	} else {
        		$("#chatMessages").append('<div  class="chatAgent"><span>' + content.DisplayName + " : " + content.Content + '</span></div>');
        		
        		/*if(content.Content.search('install-frozen') > 0){
        			timeOut = setTimeout(sendSpecialMessage, 3000);
        		}*/
        		
        	}
        		
        }
        	
        
  }
	
}

function sendSpecialMessage(){
	$('#txtMessage').val('@@done@@');
	sendMessage();
	clearTimeout(timeOut);
}

function uuidv4() {
	  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
	    return v.toString(16);
	  });
	}
function getFormattedDate(){
	var d = new Date();
	var datestring = ("0" + d.getMonth()).slice(-2) + "/" + ("0"+(d.getDate()+1)).slice(-2) + "/" +
    d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ":" + ("0" + d.getSeconds()).slice(-2);
	return datestring; 
}


function addToTable(tbl, dt, u, rp) {
	var tbody = $('#' + tbl).children('tbody');
	var table = tbody.length ? tbody : $('#' + tbl);
	var cont = "<tr>";
	cont += "<td>" + dt + "</td>";
	cont += "<td>" + u + "</td>";
	cont += "<td>" + rp + "</td>";
	cont += "</tr>";
	table.append(cont);
}




function resetTables() {
	$("#tblUserList").empty();
	var tbody = $('#tblUserList').children('tbody');
	var table = tbody.length ? tbody : $('#tblUserList');
	table.append("<tr><th>Results</th></tr>");

	$("#tblJitter").empty();
	tbody = $('#tblJitter').children('tbody');
	table = tbody.length ? tbody : $('#tblJitter');
	table.append("<tr><th>Results</th></tr>");
	
}

function addRowsToTable(tbl, content) {
	var tbody = $('#' + tbl).children('tbody');
	var table = tbody.length ? tbody : $('#' + tbl);
	table.append("<tr><td>" + content + "</td></tr>");
}

function getTimeDifference(startDateTime, endDateTime) {
    const minutes = parseInt(Math.abs(endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60) % 60);
    const seconds = parseInt(Math.abs(endDateTime.getTime() - startDateTime.getTime()) / (1000) % 60); 
    return (' ' + minutes + ' minute(s) ' + seconds + ' seconds');
}




const startChatContact = (instanceId, contactFlowId, participantDetails) => {
    return new Promise((resolve,reject) => {
           var params = {InstanceId : instanceId, ContactFlowId : contactFlowId, ParticipantDetails : participantDetails};       
           connect.startChatContact(params, function (err, res) {        
                if (err) 
                     reject(err);
                 else 
                    resolve(res);
            });
        });
    }

const stopContact = (instanceId, contactId) => {
    return new Promise((resolve,reject) => {
           var params = {InstanceId : instanceId, ContactId : contactId};       
           connect.stopContact(params, function (err, res) {        
                if (err) 
                     reject(err);
                 else 
                    resolve(res);
            });
        });
    }


function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}


function showResults(message){
    $('#resultSpan').text(message);
    $("#resultDialog").dialog("open");
}

function loadConnectAPIs() {
	/*var Service = AWS.Service;
	var apiLoader = AWS.apiLoader;
	apiLoader.services['connect'] = {};
	AWS.Connect = Service.defineService('connect', ['2018-09-07']);
	Object.defineProperty(apiLoader.services['connect'], '2018-09-07', {
	    get: function get() {
	        var model = connectServiceJSON;
	        model.paginators = {};
	        return model;
	    },
	    enumerable: true,
	    configurable: true
	});*/
	connect = new AWS.Connect({ region: dlgSourceRegion }, {apiVersion: '2018-09-07'});
	var s3 = new AWS.S3({apiVersion: '2006-03-01'});
}


function handleWindow(openClose, text) {
    if(openClose == true) {
        $( "#dialog" ).dialog( "open" );
    } else {
        $( "#dialog" ).dialog( "close" );
    }

    if(text.length>1) {
        $('#spnDlgWaiting').text(text);
    } else {
        $('#spnDlgWaiting').text('    Waiting for server to respond');
    }
}

function handleWindowText(text) {
	$('#spnDlgWaiting').text(text);
}

function setAWSConfig(accessKey, secretKey, rgn) {
    AWS.config.update({
        accessKeyId: accessKey, secretAccessKey: secretKey, region: rgn, retryDelayOptions: {base: 600}, maxRetries : 3
    });    
    AWS.config.credentials.get(function (err) {
        if (err)
            console.log(err);
        else {
            credentials = AWS.config.credentials;
        }
    });
    
}

function formatJSON(data, element) {
    $(element).html(prettyPrintJson.toHtml(data));
}



function clear_form_elements(ele) {
    $(':input',ele)
      .not(':button, :submit, :reset')
      .val('')
      .prop('checked', false)
      .prop('selected', false);
}

function saveCookie() {
    dlgSourceAccessKey=$("#dlgSourceAccessKey").val();
    dlgSourceSecretKey=$("#dlgSourceSecretKey").val();
    dlgSourceRegion=$("#dlgSourceRegion").val();
    dlgInstanceId = $("#dlgInstanceId").val();
    dlgContactFlowId = $("#dlgContactFlowId").val();
    if(!checkAllMandatoryFields()) {
        setCookie("dlgSourceAccessKey", dlgSourceAccessKey,100);
        setCookie("dlgSourceSecretKey", dlgSourceSecretKey,100 );
        setCookie("dlgSourceRegion", dlgSourceRegion,100);
        setCookie("dlgInstanceId", dlgInstanceId,100);
        setCookie("dlgContactFlowId", dlgContactFlowId,100);
        $('#spnAWSMessage').text('');
        setAWSConfig(dlgSourceAccessKey, dlgSourceSecretKey, dlgSourceRegion);
        return true;
    }else{
        $('#spnAWSMessage').text('All fields are mandatory and cannot be whitespaces or null');        
        return false;
    }
}

function getCookie(c_name)
{
    var i,x,y,ARRcookies=document.cookie.split(";");
    for (i=0;i<ARRcookies.length;i++)
    {
      x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
      y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
      x=x.replace(/^\s+|\s+$/g,"");
      if (x===c_name)
        {
          return unescape(y);
        }
     }
}

function setCookie(c_name,value,exdays)
{
    var exdate=new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
    document.cookie=c_name + "=" + c_value;
}

function checkCookie()
{
    dlgSourceAccessKey=getCookie("dlgSourceAccessKey");
    dlgSourceSecretKey=getCookie("dlgSourceSecretKey");
    dlgSourceRegion=getCookie("dlgSourceRegion");
    dlgInstanceId=getCookie("dlgInstanceId");
    dlgContactFlowId=getCookie("dlgContactFlowId");
    $('#dlgSourceAccessKey').val(dlgSourceAccessKey);
    $('#dlgSourceSecretKey').val(dlgSourceSecretKey);
    $('#dlgSourceRegion').val(dlgSourceRegion);
    $('#dlgInstanceId').val(dlgInstanceId);
    $('#dlgContactFlowId').val(dlgContactFlowId);
    $('#sourceInstanceName').text(dlgInstanceId);
    
    return checkAllMandatoryFields();
}

function checkAllMandatoryFields() {
    if(isBlank(dlgSourceAccessKey) || dlgSourceAccessKey.isEmpty() || 
            isBlank(dlgSourceSecretKey) || dlgSourceSecretKey.isEmpty() || 
            isBlank(dlgSourceRegion) || dlgSourceRegion.isEmpty() ||
            isBlank(dlgInstanceId) || dlgInstanceId.isEmpty() || 
            isBlank(dlgContactFlowId) || dlgContactFlowId.isEmpty()
            ) {
        return true;
    }else
        return false;
}

function isBlank(str) {
    return (!str || /^\s*$/.test(str));
}

String.prototype.isEmpty = function() {
    return (this.length === 0 || !this.trim());
};


function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}
