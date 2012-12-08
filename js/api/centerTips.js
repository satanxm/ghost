/**
 * 中间的提示
 */
define(function(require,exports,module){

	var tid;

	return {
		
		displayMsg : function(msg){
			if(!msg) return;
			
			this.display('<p>' + msg + '</p>');
		},
		
		display: function(html){
			
			if(!html) return;
			
			var tips = $('#desk_center_tip');
			
			tips.removeClass('bounceIn');
			tips.hide();
			
			tips.html(html);
			
			tips.show();
			tips.addClass('bounceIn');
			
			this.autoClose();
		},
		
		autoClose: function(){
			clearTimeout(tid);
			
			tid =  setTimeout(function(){
				
				var tips = $('#desk_center_tip');
				tips.removeClass('bounceIn');
				tips.fadeOut();
				
			},3000);
		}
		
	};

});


