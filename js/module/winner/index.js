//create by jsc 
(function(){
var mods = [],version = parseFloat(seajs.version);
define([],function(require,exports,module){

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



define.pack("./winner",["./tmpl"],function(require,exports,module){

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
			
			tips.hide();
			tips.removeClass('bounceIn');
			
			tips.html(tmpl.winner());
			
			tips.show();
			tips.addClass('bounceIn');
			
			
		},
		
		displayLoser: function(){
			
			var tips = $('#desk_center_tip');
			
			tips.hide();
			tips.removeClass('bounceIn');
			
			tips.html(tmpl.loser());
			
			tips.show();
			tips.addClass('bounceIn');
			
			
		}
		
	};

});






//tmpl file list:
//winner/src/winner.tmpl.html


define.pack("./tmpl",[],function(require, exports, module){
var tmpl = { 
'winner': function(data){

var __p=[],_p=function(s){__p.push(s)};
__p.push('<p>胜利！</p>');

return __p.join("");
},

'loser': function(data){

var __p=[],_p=function(s){__p.push(s)};
__p.push('<p>失败！</p>');

return __p.join("");
}
};
return tmpl;
});
