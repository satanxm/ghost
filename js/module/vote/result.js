/**
 * 显示投票结果
 */
define(function(require,exports,module){

	var centerTips = require('ghost.v1/api/centerTips');

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
			
		}
		
	}

});


