define(function(require,exports,module){

	var tmpl = require('./tmpl');

	return {
		
		//胜利者 1:人 2:鬼
		showWinner : function(data){
			
			if(userInfo.identity === 1){
				
				if(data.winner === 1){
					
					this.displayWinner();
					
				}else if(data.winner === 2){
					
					this.displayLoser();
					
				}
				
			}else if(identity.identity === 2){
				
				if(data.winner === 1){
					
					this.displayLoser();
					
				}else if(data.winner === 2){
					
					this.displayWinner();
					
				}
			}
			
		},
		
		
		displayWinner: function(){
			
			var tips = $('#desk_center_tip');
			
			tips.removeClass('bounceIn');
			tips.hide();
			
			tips.html(tmpl.winner());
			
			tips.show();
			tips.addClass('bounceIn');
			
		},
		
		displayLoser: function(){
			
			var tips = $('#desk_center_tip');
			
			tips.removeClass('bounceIn');
			tips.hide();
			
			tips.html(tmpl.loser());
			
			tips.show();
			tips.addClass('bounceIn');
			
			
		}
		
	};

});


