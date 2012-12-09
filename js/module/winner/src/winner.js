define(function(require,exports,module){

	var tmpl = require('./tmpl');
	var centerTips = require('ghost.v1/api/centerTips');
	var tid;

	return {
		
		//胜利者 1:人 2:鬼
		showWinner : function(data){
			
			if(userInfo.identity === 1){
				
				if(data.winner === 1){
					
					this.displayWinner();
					
				}else if(data.winner === 2){
					
					this.displayLoser();
					
				}
				
			}else if(userInfo.identity === 2){
				
				if(data.winner === 1){
					
					this.displayLoser();
					
				}else if(data.winner === 2){
					
					this.displayWinner();
					
				}
			}
			
		},
		
		
		displayWinner: function(){
			centerTips.display(tmpl.winner());
		},
		
		displayLoser: function(){
			centerTips.display(tmpl.loser());
		},
		
		displayResult: function(){
            
			var data = {
				userlist: userList
			};
			
			var str = tmpl.gameResult(data);
			
			var rank = $('#page_rank');
			
			rank.find('ul').html(str);
			
			window.location = '#page_rank';
			
		}
		
	};

});


