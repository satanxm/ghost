/**
 * 显示投票结果
 */
define(function(require,exports,module){

	var centerTips = require('ghost.v1/api/centerTips');
	require('./easing');

	return {
		
		show: function(content){
			
			$(".mod_desk").addClass('mod_desk_guess');
			
			centerTips.displayMsg(content.msg);
			
			$.each(content.voteUserStatus,function(key,userItem){
		        var voteNumNode=$('.user_item[uid='+userItem.uid+'] .voteNum');
		        voteNumNode.text(userItem.voteNum)
		        if(userItem.voteUid!=0)
		            voteNumNode.addClass('voteNum_voted')
		        else{
		            voteNumNode.removeClass('voteNum_voted')
		        }
		    });
			
		},
		
		/**
		 * 
		 * 显示投票动画
		 * 
		 */
		showAnimate: function(data){
			
			data = data || {};
			data.animateList = [
				{
					from: 0,
					to: 3
				},
				{
					from: 0,
					to: 6
				},
				{
					from: 0,
					to: 10
				},
				{
					from: 0,
					to: 13
				},
				{
					from: 0,
					to: 4
				}
			];
			
			var desk = $('#page_main .mod_desk');
			
			desk.stop(true,true);
			
			$.each(data.animateList,function(i,v){
				
				var from = desk.find('.inner .user_pos_' + v.from);
				var to = desk.find('.inner .user_pos_' + v.to);
				var curr;
				
				if(from.size() === 0 || to.size() === 0){
					return;
				}
				
				desk.queue(function(){
					curr = from.clone();
					curr.appendTo(desk);
					curr.css({
						'transform': 'scale(0.5)',
						'-webkit-transform': 'scale(0.5)',
						'-moz-transform': 'scale(0.5)',
						'-o-transform': 'scale(0.5)',
						zIndex: 99999
					});
					//from.hide();
					curr.animate({
						top: [to.offset().top - desk.offset().top,'easeOutSine'],
						left: [to.offset().left - desk.offset().left,'easeInSine']
					},600,function(){
						curr.remove();
						from.show();
						desk.dequeue();
					});
				});
				
			});
			
			
			
			
		}
		
	}

});


