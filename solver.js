var dict = {}, dict_1 = {};

loadDict(0);
var loading = true;
var calculating = false;
var iterations = 0;

var data = {
    labels: [],
    datasets: [
        {
            pointColor: "rgba(151,187,205,1)",
            data: []
        },
    ]
};

var ctx = $("#data").get(0).getContext("2d");
var chart = new Chart(ctx).Line(data, {animation : false, datasetFill : false, datasetStroke:false, bezierCurve: false});

function loadDict(index){
	while(true){
		var w = dict_arr[index];
		dict[w] = 0;
		for(var i = 0; i < w.length; i++){
			for(var j = 0; j < 26; j++){
				dict_1[w.substring(0, i) + String.fromCharCode("a".charCodeAt(0) + j) +
				 w.substring(i + 1) ] = 0;
			}

		}	

		index++;

		if (index == dict_arr.length){
			$("#text").text("Press Start to Solve");
			loading = false;
			return;
		}

		if (index % 100 == 99){
			$("#text").text("Loading dictionary... " + parseInt(100 * index / dict_arr.length) + "%");
			setTimeout(function(){loadDict(index)}, 5);
			return;
		}
	}
}

function translate(string, dic){
	for(var k in dic){
		string = string.split(k).join(dic[k]);
	}
	return string.toLowerCase();
}

function score(string, dic){
	string = translate(string, dic);
	var sc = 0;
	var words = [], dp = [];
	for(var i = 0; i < string.length; i++){
		words.push(undefined);
		dp.push(0);
	}
	for(var i = 1; i < string.length; i++){
		dp[i] = dp[i - 1];
		for(var j = i - 4; j > Math.max(0, i - 14); j--){
			var le = i - j;
			if (dict[string.substring(j+1, i + 1)] != undefined){
				dp[i] = Math.max(dp[i], dp[j] + le)
			}
			else if(dict_1[string.substring(j+1, i + 1)] != undefined){
				dp[i] = Math.max(dp[i], dp[j] + .5 * le)
			}
		}
	}

	return dp[string.length - 1];
}

function get_words(string){
	var sc = 0;
	var words = [], dp = [];
	for(var i = 0; i < string.length; i++){
		words.push(-1);
		dp.push(0);
	}
	for(var i = 1; i < string.length; i++){
		dp[i] = dp[i - 1];
		for(var j = i - 1; j > Math.max(0, i - 14); j--){
			var le = i - j;
			if (dict[string.substring(j+1, i+1)] != undefined){
				if (dp[j] + le >= dp[i]){
					dp[i] = dp[j] + le;
					words[i] = j;
				}
					
			}
		}
	}

	var pos = dp.length - 1;
	var output = "";
	while(pos >= 0){
		if (words[pos] == -1){
			output = string[pos] + output;
			pos--;
		}
		else{
			output = " <b>" + string.substring(words[pos] + 1, pos + 1) + "</b> " + output;
			pos = words[pos];
		}

	}

	return output

}

function most_frequent_n(string, n){
	var count = {};

	for(var i = 0; i < string.length - n + 1; i++){
		if ((count[string.substring(i, i + n)]) == undefined)
			count[string.substring(i, i + n)] = 0;
		count[string.substring(i, i + n)]++;
	}
	var c = [];
	for(var k in count){
		c.push([k, count[k]]);
	}
	c.sort(function(a, b){
		return b[1] - a[1];
	})
	var ans = []
	for(var i = 0; i < c.length; i++)
		ans.push(c[i][0]);
	return ans;
}

function start(){
	if (loading || calculating)
		return;
	calcuating = true;
	var string = $("#ciphertext").val();
	var new_string = "";
	for(var i = 0; i < string.length; i++){
		var c = string[i].toLowerCase();
		if ("a".charCodeAt(0) <= c.charCodeAt(0) && c.charCodeAt(0) <= "z".charCodeAt(0)){
			new_string += c;
		}
	}
	string = new_string;
	var d = restart(string);
	trynew(string, d);

}

function restart(string){
	var most_freq = "ETAOINSHRDLCUMWFGYPBVKJXQZ"
	var most_freq_bi = ["TH", "HE", 'IE', 'EN', 'NT', 'RE', 'ER']
	var most_freq_tri = ["THE", "AND"];
	var sc = {};
	var mf = most_frequent_n(string, 1);
	for(var i = 0; i < 26; i++)
		sc[String.fromCharCode(i + "A".charCodeAt(0))] = {};

	for(var i = 0; i < mf.length; i++){
		sc[most_freq[i]][mf[i]] = 1;
	}
	
	mf = most_frequent_n(string, 2);

	for(var i = 0; i < Math.min(mf.length, most_freq_bi.length); i++){
		for(var j = 0; j < most_freq_bi[i].length; j++){
			if (sc[most_freq_bi[i][j]][mf[i][j]] == undefined)
				sc[most_freq_bi[i][j]][mf[i][j]] = 0;
			sc[most_freq_bi[i][j]][mf[i][j]]++;
		}		
	}

	
	mf = most_frequent_n(string, 3);

	for(var i = 0; i < Math.min(mf.length, most_freq_tri.length); i++){
		for(var j = 0; j < most_freq_tri[i].length; j++){
			if (sc[most_freq_tri[i][j]][mf[i][j]] == undefined)
				sc[most_freq_tri[i][j]][mf[i][j]] = 0;
			sc[most_freq_tri[i][j]][mf[i][j]]++;
		}		
	}

	var d = {};
	var lettersAssigned = {"1": 0};
	for(var i = 0; i < 26; i++){

		var freq = sc[most_freq[i]];
		if (Object.keys(freq).length == 0){
			var let = "1";
			while (lettersAssigned[let] != undefined){
				let = String.fromCharCode(Math.floor(Math.random() * 26) + "a".charCodeAt(0));
			}
			d[let] = most_freq[i];
			lettersAssigned[let] = 0;
		}
		else{
			var max_v = 0, max_let = "";
			for(var k in freq){
				if (freq[k] > max_v){
					max_v = freq[k];
					max_let = k;
				}
			}

			d[max_let] = most_freq[i];
			lettersAssigned[max_let] = 0;
			for(var k in sc){
				if (sc[k][max_let] != undefined)
					delete sc[k][max_let];
			}			
		}
	}
	return d;
}

function trynew(string, d){
	var bestscore = 0;
	var bestd = {};
	for(var m = 0; m < (Math.max(98, Math.floor(Math.random() * 100)) - 98) * 1000 + 30; m++){
		var new_d = {};
		for(var k in d){
			new_d[k] = d[k];
		}

		for(var i = 0; i < Math.floor(Math.random() * 4) + 2; i++){
			var r = Math.floor(Math.random() * 25 * 26);
			var sw1 = String.fromCharCode(r / 25 + "a".charCodeAt(0));
			var sw2 = String.fromCharCode(r % 25 + "a".charCodeAt(0));
			var temp = new_d[sw1];
			new_d[sw1] = new_d[sw2];
			new_d[sw2] = temp;
		}
		
		var newscore = score(string, new_d);
		if (newscore > bestscore){
			bestscore = newscore;
			bestd = new_d;
		}

	}
	var oldscore = score(string, d);
	var should_change = (Math.random() < 0.1);
	if (oldscore <= bestscore || (should_change && oldscore * 2 < string.length)){
		if (oldscore < bestscore){
			$("#text").html(get_words(translate(string, bestd)));
			$("#letters").html("Letter mapping:<br><br>")
			for(var k in bestd){
				$("#letters").append(k + "->" + new_d[k] + ", ")
			}
		}
		d = bestd;
	}
	iterations++;

	if (!should_change && iterations % 50 == 0 && oldscore * 3 < string.length){
		d = restart(string);
	}

	if (!should_change && iterations % 100 == 0 && oldscore * 2 < string.length){
		d = restart(string);
	}
	
	$("#info").text("Score: " + Math.round(Math.max(oldscore, bestscore) * 10) / 10.0 +" Iterations: "+ iterations);
	if (iterations % 8 == 0){
		chart.addData([Math.max(oldscore, bestscore)], "");
	}


	setTimeout(function(){trynew(string, d)}, 50);
}
