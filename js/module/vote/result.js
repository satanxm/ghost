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
			var tips = $('#desk_center_tip');
			
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
			},1000);
			
			tips.on('click.tips',function(e){
				that.showAnimate();
				e.preventDefault();
			});
			
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
				
				animateList.push({
					from: userItem.uid,
					to: userItem.voteUid
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
			
			animateList = animateList || this.animateList || [];
			
			var desk = $('#page_main .mod_desk');
			var users = desk.find('.inner .user_item');
			
			desk.stop(true,true);
			
			$.each(animateList,function(i,v){
				
				var from = users.filter('.user_item_set[uid=' + v.from + ']');
				var to = users.filter('.user_item_set[uid=' + v.to + ']');
				var curr;
				
				if(from.size() === 0 || to.size() === 0){
					return;
				}
				
				desk.queue(function(){
					
					var min2max = true;
					
					min2max = from.index() - to.index();
					if(min2max < 0){
						min2max += users.size();
					}
					
					if(min2max > 0 && min2max < users.size() / 2){
						min2max = true;
					}else{
						min2max = false;
					}
					
					curr = from.clone();
					curr.appendTo(desk);
					curr.css({
						'transform': 'scale(0.5)',
						'-webkit-transform': 'scale(0.5)',
						'-moz-transform': 'scale(0.5)',
						'-o-transform': 'scale(0.5)',
						opacity: 1,
						zIndex: 99999
					});
					//from.hide();
					curr.animate({
						top: [to.offset().top - desk.offset().top, min2max ? 'easeInSine' : 'easeOutSine'],
						left: [to.offset().left - desk.offset().left, min2max ? 'easeOutSine' : 'easeInSine']
					},600,function(){
						curr.fadeOut('fast',function(){
							$(this).remove();
						});
						from.show();
						desk.dequeue();
					});
				});
				
			});
			
		}
		
	}

});


