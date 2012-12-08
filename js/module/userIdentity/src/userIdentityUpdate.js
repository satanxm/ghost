define(function(require,exports,module){

	var tmpl = require('./tmpl');
	var isShow = true;

	return {
		
		show : function(words){
			
			var str = tmpl.userInfo({
				words: words
			});
			
			$("#word_area").html(str).show();
			
			this.bindEvent();
		},
		
		
		bindEvent: function(){
			
			var area = $("#word_area");
			
			area.off('click.hideWords');
			area.on('click.hideWords',function(){
				if(isShow){
					isShow = false;
					area.css({
						opacity: 0.2
					});
				}else{
					isShow = true;
					area.css({
						opacity: 1
					});
				}
			});
			
		}
		
	};

});


