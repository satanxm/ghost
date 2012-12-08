define(function(require,exports,module){

	var tmpl = require('./tmpl');

	return {
		
		show : function(words){
			
			var str = tmpl.userInfo({
				words: words
			});
			
			$("#word_area").html(str).show();
		}
		
	};

});


