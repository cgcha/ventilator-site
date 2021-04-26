let connection;

let holder, x;
jQuery(document).ready(function($) {

  let log = $('.webjack-log');
  log.apend = function(data){
	log.append(data)
	log.append('<br>');
	log.scrollTop(log[0].scrollHeight);
  }
  
  let logjson = $('.webjack-json');
  logjson.apend = function(data){
	holder = JSON.parse(data);
	for (x in holder) {
		logjson.append(x+ ": " + holder[x] + "<br>");
	}
	logjson.scrollTop(log[0].scrollHeight);
  }

  let profileParam = getUrlParameter('profile') || "SoftModem";
  let profile = WebJack.Profiles[profileParam]; // https://github.com/publiclab/webjack/blob/master/src/profiles.js
  console.log('loading profile: ', profile);

  
  let exampleJSON = {name: "John", age: 31, city: "New York"};
  
  let longJSON ={"widget": {
    "debug": "on",
    "window": {
        "title": "Sample Konfabulator Widget",
        "name": "main_window",
        "width": 500,
        "height": 500
    },
    "image": { 
        "src": "Images/Sun.png",
        "name": "sun1",
        "hOffset": 250,
        "vOffset": 250,
        "alignment": "center"
    },
    "text": {
        "data": "Click Here",
        "size": 36,
        "style": "bold",
        "name": "text1",
        "hOffset": 250,
        "vOffset": 100,
        "alignment": "center",
        "onMouseUp": "sun1.opacity = (sun1.opacity / 100) * 90;"
    }
}}    
  
  let exampleJSONString = JSON.stringify(exampleJSON);
  let longJSONString = JSON.stringify(longJSON);


  // run this after a user interaction
  // https://github.com/publiclab/webjack/issues/88
  // https://goo.gl/7K7WLu
  $('.btn-begin').click(initWebjack);
  $('.Example1').click(fillText1);
  function fillText1() {
	$('.userinput').val(exampleJSONString);
  }
  $('.Example2').click(fillText2);
  function fillText2() {
	$('.userinput').val(longJSONString);
  }
  function initWebjack() {
	let scriptEl = document.createElement('script');
	scriptEl.setAttribute('src','p5.sound.min.js');
	document.head.appendChild(scriptEl);

	setupEqualizer();

	function touchStarted() {
	  if (getAudioContext().state !== 'running') {
		getAudioContext().resume();
	  }
	}
	
	$('.btn-begin').hide()
	  .click(touchStarted);
	
	connection = new WebJack.Connection(profile);

	connection.listen(function(data) {
	  log.apend(data);
	  logjson.apend(data);
	  console.log('Arduino to WebJack: ' + data);
	});

	function send(e) {
	  e.preventDefault();
	  let text = $('.userinput').val();
	  connection.send(text);
	  console.log('WebJack to Arduino: ' + text);
	  return false;
	}

	$('.send').click(send);
	$('.sendForm').submit(send);

  }

});

function getUrlParameter(sParam) {

  let sPageURL = window.location.search.substring(1);
  let sURLVariables = sPageURL.split('&');
 
  for (let i = 0; i < sURLVariables.length; i++) {
 
	let sParameterName = sURLVariables[i].split('=');
 
	if (sParameterName[0] == sParam) {
	  return sParameterName[1];
	}
 
  }

}

function changeProfile(p){
  let profile = WebJack.Profiles.SoftModem;

  switch (p){
	case "0":
	  profile = WebJack.Profiles.SoftModem;
	  break;
	case "1":
	  profile = WebJack.Profiles.SoftModemLowFrequencies;
	  break;
	case "2":
	  profile = WebJack.Profiles.Browser;
	  break;
	case "3": // "Slow"
	  profile = {
		baud: 126,
		freqLow : 4900,
		freqHigh : 7350,
		echoCancellation : false,
		softmodem : true
	  };
	  break;
  }
  connection.setProfile(profile);
}
$('.btn-freq').click(function() {
  let freqs = prompt('Enter low and high frequencies separated by a comma, like "1200,2400"',"1200,2400").split(',');
  if (freqs) connection.setFrequencies(freqs[0], freqs[1]);
});
$('.btn-baud').click(function() {
  let baud = prompt('Enter a baud (speed) that is a factor of 44100 and under 1225',441);
  if (baud) connection.setBaud(baud);
});

