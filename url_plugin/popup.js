var tabURL;
chrome.tabs.getSelected(null,function(tab){
	tabURL = tab.url;
	$(document).ready(function(){
		init();
		modetwo();
	});
});

var button = document.getElementById("btn");
var warning = document.getElementById("warning");
var resultBox = document.getElementById("result");
var resultShow = document.getElementById("result_show");
var file_box = document.getElementById("file_box");
var inputBox = document.getElementsByTagName("input")[0];
var qrcode = document.getElementById("qrcode");
var qrcode_2 = document.getElementById("qrcode_2");
var reset = document.getElementById("reset");
var online = document.getElementById("onlineURL");
var short_1 = document.getElementById("short");
var short_2 = document.getElementById("short_2");
var inputFile = document.getElementById("inputFile");
var mode_1 = document.getElementsByClassName("mode_1")[0];
var mode_2 = document.getElementsByClassName("mode_2")[0];
var inputs = document.getElementsByClassName("input");
var $switchButton = $('.switch');
var mode = 0;

var resultLink = {
	longLink : undefined,
	shortLink : undefined
}



//初始化所有的输入框点击时自动选择
function InputSelected(){
	for(var i=0;i<inputs.length;i++){
		(function(num){
			inputs[num].addEventListener("click",function(){
				this.select();
			},false);
		})(i);
	}	
}


//匹配文件名,如果有的话就返回生成好的URL，如果没有则返回false
function matchURL(fileName){
	var rex = "(.*)."+fileName+".(.*)";
	var reg =new RegExp (rex,"g");
	var ex = online.value;
	var rex2 = /http:\/\/.(.*)/;
	ex = ex.replace(rex2,"$1");
	ex = "http://" + ex + "/";
	if(tabURL.match(reg)==null){
		return null;
	}else{
		matchResult = tabURL.replace(reg,"$2");
		matchResult = ex + matchResult;
		return matchResult;
	}
}

function createQR(link,qr){
	var source = "https://chart.googleapis.com/chart?chs=120x120&cht=qr&choe=UTF-8&chl="+ link;
	qr.src = source;
	$(qr).load(function(){
		$(this).addClass('anime-rotate');
	});
}

function showResult(link){
		file_box.style.display ="none";
		warning.style.display = "none";
		resultShow.style.display = "block";
		resultBox.value = link;
		short_1.value = setGoogleAPI(link);
		resultLink.shortLink = short_1.value;
		/*short_1.value = setSinaAPI(link);*/
		createQR(resultLink.shortLink,qrcode);
		reset.addEventListener("click",function(){
			resetAll();
		},false);
}

function resetAll(){
	window.localStorage.link = '';
	file_box.style.display = "block";
	qrcode.src = "";
	resultShow.style.display = "none";
	init();
}


function setSinaAPI(result){
	var combileURL = "https://api.weibo.com/2/short_url/shorten.json?access_token=2.00WSLtpB0GRHJ9745670860ceNWWiC&url_long="+result;
	var returnValue;
	$.get(combileURL,function(data){
		returnValue = JSON.parse(data.responseText);
		console.log(returnValue);
	});
	if(returnValue.urls[0]){
		return returnValue.urls[0].url_short;
	}else{
		return "没有生成短链接，请重试";
	}
}

function setGoogleAPI(result){
	jQuery.urlShortener.settings.apiKey='AIzaSyAtmCdCcoZyitiZtjvYGHFquPbbVyqEB_M';
	var googleShort = jQuery.urlShortener({longUrl:result});
/*	while(googleShort == undefined){
		var googleShort = jQuery.urlShortener({longUrl:result});
	}*/
	console.log(result,googleShort);
	return googleShort;
}

function modetwo(){
	var shortLink_2 = setGoogleAPI(tabURL);
	/*var shortLink_2 = setSinaAPI(tabURL);*/
	createQR(shortLink_2,qrcode_2);
	if(shortLink_2 == undefined){
		shortLink_2 = "请确认文件夹填写正确";
	}
	short_2.value = shortLink_2;
}

function choose(){
	if(!mode){
		$switchButton.removeClass("selected_f").addClass("selected_d");
		$(mode_1).removeClass("anime-appear").addClass("anime-disappear").delay(800).css({"left":"400px"});
		$(mode_2).delay(800).removeClass("anime-disappear").addClass("anime-appear").delay(800).css({"left":"0px"});
		window.localStorage.mode = 1;
		mode =1;
	}else{
		$switchButton.removeClass("selected_d").addClass("selected_f");
		$(mode_2).removeClass("anime-appear").addClass("anime-disappear").delay(800).css({"left":"400px"});
		$(mode_1).delay(800).removeClass("anime-disappear").addClass("anime-appear").delay(800).css({"left":"0px"});
		window.localStorage.mode = 0;
		mode = 0;
	}
}

function judgeMode(){
	if(window.localStorage.mode == 1){
		mode = 1;
		$switchButton.removeClass("selected_f").addClass("selected_d");
		$(mode_1).css({"left":"400px"});
		$(mode_2).css({"left":"0px"});
	}else{
		mode = 0;
	}
}

$switchButton.click(function(){
	choose();
});

//输入文件名
function init(){
	if(!window.localStorage.link){  //如果没有缓存文件名，就显示有按钮的

		button.addEventListener("click",function(){
			var fileName = inputFile.value;
			if(fileName == ""){  //如果没有输入任何东西，则弹出提示框
				warning.style.display = "block";
			}else{  //如果有输入，就先保存文件名，然后再判断匹不匹配
				window.localStorage.link = fileName;
				if(!(matchURL(fileName)==null)){
					resultLink.longLink = matchURL(fileName);
					showResult(resultLink.longLink);
				}else{
					//跳到mode2
					showResult(resultLink.longLink);
					choose();
					modetwo();
				}
			}
		},false);
	}else{ //否则就显示结果

		if(!(matchURL(window.localStorage.link)==null)){
			resultLink.longLink = matchURL(window.localStorage.link);
			showResult(resultLink.longLink);
		}else{
			//跳到mode2
			showResult("未找到对应文件名");
			choose();
			modetwo();
		}
	}
}
