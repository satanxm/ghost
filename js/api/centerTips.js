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
		
		display: function(html,autoClose){
			
			if(!html) return;
			
			var tips = $('#desk_center_tip');
			
			tips.removeClass('bounceIn');
			tips.hide();
			
			tips.html(html);
			
			tips.show();
			tips.addClass('bounceIn');
			
			if(autoClose){
				this.autoClose();
			}
		},
		
		autoClose: function(){
			clearTimeout(tid);
			
			var that = this;
			
			tid =  setTimeout(function(){
				
				that.close();
				
			},3000);
		},
		
		close: function(){
			var tips = $('#desk_center_tip');
			tips.removeClass('bounceIn');
			tips.off('click.tips');
			tips.fadeOut();
		}
		
	};

});


