/**
 * 显示投票结果
 */
define(function(require,exports,module){

	var centerTips = require('ghost.v1/api/centerTips');
	require('./easing');

	return {
		
		animateList: [],
		
		show: function(content){
			
			var that = this;
			
			this.animateList = [];
			
			var animateList = this.animateList;
			
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
			
			this.vote2index(content.voteUserStatus);
			
			setTimeout(function(){
				that.showAnimate();
			},3000);
			
		},
		
		/**
		 * 
		 * 投票信息转为下标信息
		 * @param {Object} voteUserStatus
		 */
		vote2index: function(voteUserStatus){
			
			this.animateList = [];
			
			var animateList = this.animateList;
			
			$.each(voteUserStatus,function(key,userItem){
				if(userItem.voteUid==0){
					return;
				}
				
		        var from = $('.user_item[uid='+userItem.uid+']');
				var to = $('.user_item[uid='+userItem.voteUid+']');
				
				animateList.push({
					from: from.index(),
					to: to.index()
				});
		    });
			
			return this;
		},
		
		/**
		 * 
		 * 显示投票动画
		 * 
		 */
		showAnimate: function(animateList){
			
			animateList = [
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
			
			animateList = animateList || this.animateList;
			
			var desk = $('#page_main .mod_desk');
			var users = desk.find('.inner .user_item');
			
			desk.stop(true,true);
			
			$.each(animateList,function(i,v){
				
				var from = users.eq(v.from);
				var to = users.eq(v.to);
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


