//create by jsc 
(function(){
var mods = [],version = parseFloat(seajs.version);
define(["ghost.v1/api/centerTips"],function(require,exports,module){

	var uri		= module.uri || module.id,
		m		= uri.split('?')[0].match(/^(.+\/)([^\/]*?)(?:\.js)?$/i),
		root	= m && m[1],
		name	= m && ('./' + m[2]),
		i		= 0,
		len		= mods.length,
		curr,args,
		undefined;
	
	//unpack
	for(;i<len;i++){
		args = mods[i];
		if(typeof args[0] === 'string'){
			name === args[0] && ( curr = args[2] );
			args[0] = root + args[0].replace('./','');
			(version > 1.0) &&	define.apply(this,args);
		}
	}
	mods = [];
	require.get = require;
	return typeof curr === 'function' ? curr.apply(this,arguments) : require;
});
define.pack = function(){
	mods.push(arguments);
	(version > 1.0) || define.apply(null,arguments);
};
})();
//all file list:
//winner/src/winner.js
//winner/src/winner.tmpl.html



//js file list:
//winner/src/winner.js



define.pack("./winner",["./tmpl","ghost.v1/api/centerTips"],function(require,exports,module){

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






//tmpl file list:
//winner/src/winner.tmpl.html


define.pack("./tmpl",[],function(require, exports, module){
var tmpl = { 
'winner': function(data){

var __p=[],_p=function(s){__p.push(s)};
__p.push('<p>胜利</p>');

return __p.join("");
},

'loser': function(data){

var __p=[],_p=function(s){__p.push(s)};
__p.push('<p>失败</p>');

return __p.join("");
},

'gameResult': function(data){

var __p=[],_p=function(s){__p.push(s)};

	var list = data.userlist,
		i,len,user,
		userStat;

	for(i=0,len = list.length; i<len ;i++){
	
		user = list[i];
		userStat = user.userStat || {
            "total_times": 0,
            "total_score": 0,
            "human_times": 0,
            "ghost_succ": 0,
            "ghost_times": 0,
            "human_succ": 0
        };
	__p.push('		<li data-icon="false" data-iconpos="right" data-theme="c">\r\n\
			<i class="user_avatar avatar_');
_p(user.avatarId);
__p.push('"></i>\r\n\
			<div class="ct">\r\n\
				<h3 class="ui-li-heading">');
_p(user.nick);
__p.push(' 积分：<span class="score">');
_p(userStat.total_score);
__p.push('</span></h3>\r\n\
				<p class="ui-li-desc">人：<span class="score">');
_p(userStat.human_succ);
__p.push('&nbsp;&nbsp;&nbsp;&nbsp;</span>鬼：<span class="score">');
_p(userStat.ghost_succ);
__p.push('</span></p>\r\n\
				</a>\r\n\
			</div>\r\n\
		</li>');

	}
__p.push('');

return __p.join("");
}
};
return tmpl;
});
