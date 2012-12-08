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
//userIdentity/src/userIdentityUpdate.js
//userIdentity/src/userIdentity.tmpl.html



//js file list:
//userIdentity/src/userIdentityUpdate.js



define.pack("./userIdentityUpdate",["./tmpl"],function(require,exports,module){

	var tmpl = require('./tmpl');
	var isShow = true;

	return {
		
		show : function(words){
			
			var str = tmpl.userInfo({
				words: words
			});
			
			$("#word_area").html(str).show();
			
			this.bindEvent();
		},
		
		
		bindEvent: function(){
			
			var area = $("#word_area");
			
			area.off('click.hideWords');
			area.on('click.hideWords',function(){
				if(isShow){
					isShow = false;
					area.css({
						opacity: 0.2
					});
				}else{
					isShow = true;
					area.css({
						opacity: 1
					});
				}
			});
			
		}
		
	};

});






//tmpl file list:
//userIdentity/src/userIdentity.tmpl.html


define.pack("./tmpl",[],function(require, exports, module){
var tmpl = { 
'userInfo': function(data){

var __p=[],_p=function(s){__p.push(s)};

	var words = data.words;
	
	
	if(words.human !== words.ghost){
	__p.push('		<p>人：<span>');
_p(words.human);
__p.push('</span></p>\r\n\
		<p>鬼：<span>');
_p(words.ghost);
__p.push('</span></p>');

	}else{
	__p.push('		<p>词：<span>');
_p(words.ghost);
__p.push('</span></p>');

	}
__p.push('');

return __p.join("");
}
};
return tmpl;
});
