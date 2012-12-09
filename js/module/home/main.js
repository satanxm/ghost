
var ws; 
var wsUrl = config.websocket;

//var wsUrl = 'ws://127.0.0.1:8001'; 
var wsFlag=0;//服务器连接状态,0:未连接 1:正常连接 2:已断开 3:超时(掉线)
var wordsDict={}, wordPageIndex = -1, WORDGETCOUNT = 15, PAGEWORDNUM = 5 ;//词库
var seatChanging = false, changeSeatMod = false;


//var words={"human":"","ghost":""};
var words={"human":"机器","ghost":"电脑"};
var userLimit=1;
//用户信息
var userList=[];

//活动用户，(可投票的或可陈述的)
var activeUserList = [];
var userInfo={
    uid:0,
    nick:'',
    avatarId:'',
    identity:0,
    seatPos:0,      //座位位置
    seatOffset:0,   //座位偏移位置
    endline:0
};

//桌子信息
var deskInfo={
    deskId:0,
    userLimit:0,
    endline:0
};
//鬼的数量
var ghostNum=0;

//角色分配，鬼的默认数量
var roleAllot={
	"0": 0,
	"1": 1,
	"2": 1,
	"3": 1,
    "4": 1,
    "5": 1,
    "6": 1,
    "7": 2,
    "8": 2,
    "9": 2,
    "10":2,
    "11":2,
    "12":3,
    "13":3,
    "14":3
};
var stageList=[];

function init(){
    if( location.hash!="" && location.hash!="#page_index" && wsFlag!=1){
         window.location.href="index.htm";
    }
    //userMoveInit()
    userInit();
    avatarInit();
    connectInit();
}

/*页面初始化 start ***************************************************************************/
function userInit(){
    $("#nick").val(localStorage.nick);
    $("#nick").blur(function(){
            localStorage.nick=$("#nick").val();
    });
    var avatarId=localStorage.avatarId;
    if(!avatarId){
        avatarId=Math.ceil(Math.random()*59);
        localStorage.avatarId=avatarId;
    }
    $("#avatarId i").attr("class","avatar_item avatar_"+avatarId);
    $("#avatarId").click(function(){
        window.location="#page_avatar";
    });


    $("#btn_create").click(function(){
        if(localStorage.nick!="" && localStorage.nick!=undefined)
            createGame();
        else
            alert('请输入用户昵称');
    });
    $("#btn_join").click(function(){
        if(localStorage.nick!="" && localStorage.nick!=undefined)
            joinGame();
        else
            alert('请输入用户昵称');
    });

    /*按钮设置*/
    $("#link_page_option").click(function(){
        window.location="#page_option";
    });
    $("#link_page_main").click(function(){
        $("#page_main").show();
        $("#mod_content").hide();
    });
    $("#link_page_rule").click(function(){
        $("#page_main").hide();
        $("#mod_content").show();
    });
    $("#link_exit").click(function(){
        exitGame();
    });
    $("#link_change_seat").click(function(){
        toggleChangeSeat();
    });

	// 换座位
	$(".mod_desk").delegate('.user_item', 'click', function(e) {
		var target = $(this) , isAdmin = false, seat1, seat2 ;
		isAdmin = (userInfo.identity == 11);

		// 不允许换座位的时候
		if (!isChangePosAllow()) {
			return;
		}
		
		// 普通用户不能改座位
		if ( !isAdmin  && target.hasClass('user_item_set') && changeSeatMod || (!isAdmin && !changeSeatMod)) {
			return;
		}

		if (isAdmin && !changeSeatMod) {
			//window.location = '#popupMenu';
			var user_name = target.find('.user_name').text(), uid = target.attr('uid');
			$("#popupUserName").text(user_name);
			$( "#popupMenu" ).popup("open");

			$('#link_set_judge').unbind('click').bind('click', function() {
				svrSetJudge(uid);
			});
			return;
		}

		// 法官不能改自己的座位
		if (isAdmin && target.hasClass('user_pos_0')) {
			return ;
		}

		// 法官更换两个位置
		if (isAdmin) {
			target.toggleClass('user_item_vote');
			var checked = $('.mod_desk .user_item_vote');
			if (checked.length >= 2) {
				var hasuser = false;
				checked.each(function(k, v) {
					hasuser = hasuser || $(v).hasClass('user_item_set');
				});
				if (!hasuser) {
					clearPosChecked();
					return;
				}
				seat1 = getSeatId(checked[0], true), seat2 = getSeatId(checked[1], true);

				console.log('change seat: system myseat, myseat, change seat', userInfo.seatPos, seat1, seat2);
				svrChangeSeat(seat1, seat2);
				seatChanging = true;
			} 
		} else {
			// 普通用户和空白位置更换
			seat1 = getSeatId($('.user_pos_0'), true), seat2 = getSeatId(target, true);

			console.log('change seat: system myseat, myseat, change seat', userInfo.seatPos, seat1, seat2);
			svrChangeSeat(seat1, seat2);
		}
		
	});

    $("#link_game_start").click(function(){
        gameStart();
    });
    $("#btn_stage_next").click(function(){
        gameStageNext();
    });
    $("#link_guess_cancel").click(function(){
        $("#popupGuess").hide();
    });
    $("#link_guess_confirm").click(function(){
        $("#popupGuess").hide();
        guessWordCorrect();
    });
    $("#link_option_confirm").click(function(){
        if(words.human!="" && words.ghost!=""){
            words.human=$('#id_human').val();
            words.ghost=$('#id_ghost').val();
            $('#option_words').html("<span class=\"role_human\">平民："+words.human+"</span> <span class=\"role_ghost\">内鬼："+words.ghost+"</span>");
        }
        window.location="#page_desk";
    });

}

//设置头像点击
function avatarInit(){
    $(".mod_avatar a").click(function(){
        var avatarId=$(this).attr("avatarId");
        localStorage.avatarId=avatarId;
        $("#avatarId i").attr("class","avatar_item avatar_"+avatarId);
        window.location="#page_index";
    });
}

//连接初始化
function connectInit(){
    if(window.WebSocket) {
        $("#btn_connect_try").hide();
        $("#server_status").html('正在连接，请稍候...');
        ws = new WebSocket( wsUrl ); 
        ws.onopen = function(event) { 
            ws.onmessage = function(event) { 
                var decodeData = JSON.parse(event.data);
                
                var callback = eval(decodeData.callback );
                callback(decodeData.content);
                
            };
            ws.onclose = function(event) { 
                connectClose();
            }; 
            ws.onerror = function(event) {
                alert("ws error.");
            };
        };
    }
    else{
        window.location="b.htm";
    }

    $("#btn_connect_try").click(function(){
        $("#btn_connect_try").hide();
        connectInit();
    });
    readyStateCheck();

}

function connectClose(){
    $("#server_status").html('<span class=\"t_err\">服务器连接失败，请检查网络</span>');
    $("#btn_connect_try").css({"display":"inline-block"});
    $("#btn_connect_try").show();
    $("#btn_connect_try").click(function(){
        $("#btn_connect_try").hide();
        connectInit();
    });
}

//检测服务器连接状态
var checkNum=0;
function readyStateCheck(){
    /*
    ws.readyState
    0：正在建立连接连接，还没有完成。
    1：连接成功建立，可以进行通信。
    2：连接正在进行关闭握手，即将关闭
    3: CLOSED
    */
    var state=ws.readyState;
    if(state==0){
        if(checkNum<15){
            checkNum++;
            setTimeout(readyStateCheck,1000);
        }
        else{
            checkNum=0;
            ws.close();
            $("#server_status").html('<span class=\"t_err\">服务器连接失败，请检查网络</span>');
            $("#btn_connect_try").css({"display":"inline-block"});
        }
    }
    else if(state==1){
        wsFlag=1;
        checkNum=0;
        $("#btn_connect_try").hide();
        $("#server_status").html('<span class=\"t_suc\">服务器连接正常</span>');
        queryStatus();
    }
    else{
        checkNum=0;
        ws.close();
        $("#server_status").html('<span class=\"t_err\">服务器连接失败，请检查网络</span>');
        $("#btn_connect_try").css({"display":"inline-block"});
    }
}

//灰掉所有玩家
function disableAllUser(){
	$('.user_item').addClass('user_item_disabled');
}

//显示可操作用户
function enableActiveUser(){
	
	disableAllUser();
	
	var map = {};
	
	$.each(activeUserList || [],function(i,uid){
		map[uid] = true;
	});
	
	$('.user_item').each(function(){
		
		var item = $(this);
		var uid = item.attr('uid');
		
		if(map[uid]){
			item.removeClass('user_item_disabled');
		}
		
	});
}

//移动玩家
function userMoveInit(){
    var userSelectFlag=false;
    $('.mod_desk .user_item_set').each(function(){
        $(this).click(function(){
            userSelectFlag=true;
            //$(this).addClass();
        });
    });
}

/*页面初始化 end
***************************************************************************/

//读取和保存用户uid
function userRead(uid){
    return localStorage.uid;
}
function userSave(uid){
    localStorage.uid=uid;
}


//检查用户状态，是否掉线用户
function queryStatus(){
    if(localStorage.uid!=""){
        var wsParm ={'action':'queryStatus','callback':'handleQueryStatus','uid':localStorage.uid};
        var wsParmEncode = $.toJSON(wsParm);
        ws.send( wsParmEncode ); 
    }
}

function handleQueryStatus(content){
    if(content.ret==1){
        $("#server_status").html('<span class=\"t_err\">检测到掉线，是否重连</span>');
        $("#btn_connect_try").css({"display":"inline-block"});
        $("#btn_connect_try").unbind('click').click(function(){
            reconnectionGame();
        });
        $("#btn_connect_try .ui-btn-text").text("重连");
    }
}

//创建房间
function createGame(){
    var wsParm ={'action':'create','callback':'handleCreate','nick':localStorage.nick,'avatarId':localStorage.avatarId};
    if(localStorage.uid>0)wsParm['uid']=localStorage.uid;
    var wsParmEncode = $.toJSON(wsParm);
    ws.send( wsParmEncode ); 
}

function handleCreate(content){
    if(content.ret==0){
        userInfo.uid=content.uid;
        userInfoSave(content.userlist);
        deskInfoSave(content.deskInfo);
        userSit(content.userlist);
        showDesk(content.deskInfo);
        showUserMessage('创建游戏成功！');
    }
    else{
        $("#server_status").html("<span class=\"t_err\">"+content.msg+"</span>");
    }
}

//重连
function reconnectionGame(){
    var wsParm ={'action':'reconnectionGame','callback':'handleReconnectionGame','uid':localStorage.uid,'nick':localStorage.nick,'avatarId':localStorage.avatarId};
    var wsParmEncode = $.toJSON(wsParm);
    ws.send( wsParmEncode ); 
}

function handleReconnectionGame(content){
    //重连游戏，真的要做很多事情。。。
    if(content.ret==0){
        userInfo.uid=content.uid;
        userInfoSave(content.userlist);
        deskInfoSave(content.deskInfo);
        userSit(content.userlist);
        showDesk(content.deskInfo);
        if(content.deskInfo.status==1){//游戏已开始
            showStage();
            handleGameStage(content);//加载游戏进度条
            if(content.deskStage.type==1){//投票阶段
                if(userInfo.identity==11)
                    voteStatus(content);
            }
        }
        
        showUserMessage('重连游戏成功！');


    }
    else{
        $("#server_status").html("<span class=\"t_err\">"+content.msg+"</span>");
    }
}

//加入房间
function joinGame(){
    $("#server_status").html('正在连接，请稍候...');
    var deskId=$("#deskId").val();
    if(deskId!=""){
        var wsParm ={'action':'join','callback':'handleJoinGame','nick':localStorage.nick,'avatarId':localStorage.avatarId,'deskId':deskId};
        if(localStorage.uid>0)wsParm['uid']=localStorage.uid;
        var wsParmEncode = $.toJSON(wsParm);
        ws.send( wsParmEncode ); 
    }
    else
        $("#server_status").html("<span class=\"t_err\">请输入房间号</span>");
}

function handleJoinGame(content){
    if(content.ret==0){
        userInfo.uid=content.uid;
        userInfoSave(content.userlist);
        deskInfoSave(content.deskInfo);
        userSit(content.userlist);
        showDesk(content.deskInfo);
        showUserMessage(content.msg);
    }
    else{
        $("#btn_connect_try").hide();
        $( "#popupMessage_index .message_text" ).text(content.msg);
        $( "#popupMessage_index" ).popup('open');
    }
}

//重新开始游戏
function gameRestart(content){
     if(content.ret==0){
        userInfoSave(content.userlist);
        deskInfoSave(content.deskInfo);
        userSit(content.userlist);
        showDesk(content.deskInfo);
        showUserMessage(content.msg);
		$('.user_item').removeClass('user_item_disabled user_item_ghost');
    }
}


//开始游戏
function gameStart(){
    if(words.human=="" || words.ghost==""){
        $( "#popupMessage_desk .message_text" ).html("请先设置猜词<br />可手动设置，或词库中选择！");
        $( "#popupMessage_desk" ).popup('open');
    }
    else if($("#game_count").text()*1<userLimit){
        $( "#popupMessage_desk .message_text" ).text("人数太少，无法开始游戏！");
        $( "#popupMessage_desk" ).popup('open');
    }
    else{
		
        ghostNum = roleAllot[userList.length];
		
        var wsParm = {
            'action': 'startGame',
            'callback': 'handleStartGame',
            'wordHuman': words.human,
            'wordGhost': words.ghost,
            'ghostNum': ghostNum
        };
        var wsParmEncode = $.toJSON(wsParm);
        ws.send(wsParmEncode);
    }
}

function handleStartGame(content){
	
	words = content.words;
	
    if(content.ret==0){
        showStage();
        //showDesk(content.deskInfo);
    }else{
        $( "#popupMessage_desk .message_text" ).text(content.msg);
        $( "#popupMessage_desk" ).popup('open');
    }
	
}


//确认任务进入下一阶段
function gameStageNext(){
    var wsParm ={'action':'gameStageNext','callback':'handleGameStage'};
    var wsParmEncode = $.toJSON(wsParm);
    ws.send( wsParmEncode ); 
}


/**
 * 显示投票结果
 */
function handleVoteResult(content){
	
	seajs.use('ghost.v1/module/vote/result',function(result){
		result.show(content);
	});
	
}


//游戏过程更新
function handleGameStage(content){
    if(content.ret==0){
        //只多一步，为正常更新
        if( content.deskStage.step.length - stageList.length == 1){
            gameStageMove( content.deskStage.type,500 );
            if( content.deskStage.type != 1){
                //非投票阶段，去掉投票界面
                $(".mod_desk").removeClass('mod_desk_vote');
                $(".mod_desk").removeClass('mod_desk_guess');
                $(".mod_desk").removeClass('mod_desk_vote_judge');
                $(".user_item").unbind('click').removeClass('user_item_vote');
            }
			
			//陈述阶段
			if(content.deskStage.type === 0){
				seajs.use('ghost.v1/api/centerTips',function(centerTips){
					centerTips.displayMsg('陈述阶段');
				});
			}
			
			//游戏结束
			if(content.deskStage.type === 4){
				seajs.use('ghost.v1/api/centerTips',function(centerTips){
					centerTips.displayMsg('游戏结束');
				});
				
				//显示游戏结果
				setTimeout(function(){
					seajs.use('ghost.v1/module/winner/index',function(index){
						index.get('./winner').displayResult();
					});
				},2000);
			}
			
        }else{
			//掉包、重连等因素，要重置显示所有的步骤
            stageList=content.deskStage.step;
            
            $(".link_stage_insert").remove();
            $('#game_stage').css({'left':'121px'});
            $.each(stageList,function(key,value){
                gameStageMove( value,1);
            });
        }

        //显示最后的消息
        $("#game_message").text(content.msg);


		if(content.activeUserList){
			activeUserList = content.activeUserList;
			enableActiveUser();
		}
		
        //投票阶段
        if( content.deskStage.step[content.deskStage.step.length-1] == 1){
			voteStart();
        }
		
    }
}

//开始投票
function voteStart(){
	
    if(userInfo.identity!=11){
        $(".mod_desk").addClass('mod_desk_vote');
        $(".user_item").each(function(){
            var uid=$(this).attr('uid');
            if(in_array(uid,activeUserList) && uid!=userInfo.uid){
                $(this).unbind('click').click(function(){
                    
					if(!$(this).attr('uid')) return;
					if($(this).hasClass('user_item_disabled')) return;
					
					$('.user_item').removeClass('user_item_vote');
                    $(this).addClass('user_item_vote');
                    voteUser(uid);
                });
            }
        });
    }else{
        $(".mod_desk").addClass('mod_desk_vote_judge');
    }
	
	var voteNumNode=$('.user_item .voteNum');
	
	voteNumNode.removeClass('voteNum_voted');
		
	if (userInfo.identity === 11) {
		voteNumNode.text('0');
	}else{
		voteNumNode.text('?');
	}
	
	seajs.use('ghost.v1/api/centerTips',function(centerTips){
		centerTips.displayMsg('请投票');
	});
}

function voteUser(uid){
    var wsParm ={'action':'voteUser','callback':'handleVoteUser','voteUid':uid};
    var wsParmEncode = $.toJSON(wsParm);
    ws.send( wsParmEncode ); 
}

function handleVoteUser(content){
}

//显示投票状态
function voteStatus(content){
    var noVoteNum=0;
	
	if(userInfo.identity === 11){
		
		//法官
		 $.each(content.voteUserStatus,function(key,userItem){
	        var voteNumNode=$('.user_item[uid='+userItem.uid+'] .voteNum');
	        voteNumNode.text(userItem.voteNum);
	        if(userItem.voteUid!=0)
	            voteNumNode.addClass('voteNum_voted');
	        else{
	            voteNumNode.removeClass('voteNum_voted');
	            noVoteNum++;
	        }
	    });
		
		 if(noVoteNum>0){
	      	  $("#game_message").text("还有 "+noVoteNum+" 位用户未投票");
		 	
		 }else{
	        $("#game_message").text("所有玩家已投票，请确认进入下一阶段");			
		 }
	}else{
		
		 $.each(content.voteUserStatus,function(key,userItem){
	        var voteNumNode=$('.user_item[uid='+userItem.uid+'] .voteNum');
	        if(userItem.voteUid!=0){
		        voteNumNode.text('√');
	            voteNumNode.addClass('voteNum_voted');
			}else{
				voteNumNode.text('?');
	            voteNumNode.removeClass('voteNum_voted');
	            noVoteNum++;
	        }
	    });
		
		 if(noVoteNum>0){
	        $("#game_message").text("还有 "+noVoteNum+" 位用户未投票");
		 }else{
	        $("#game_message").text("所有玩家已投票");			
		 }
		
	}
	
   
   
}

//任务进度条 填充数据并向左平移
var stageLink="<a data-icon=\"arrow-r\" data-iconpos=\"right\" data-corners=\"false\" class=\"link_stage_insert\" data-role=\"button\" data-inline=\"true\" data-mini=\"true\" data-theme=\"a\">";
var stageName=['陈述','投票','猜词','结束','结果','重新开始'];
function gameStageMove(t,ms){
	
	$('#page_main .mod_desk .user_item').off('click');
	$('#desk_center_tip').off('click');
	
	stageList.push(t);
    $("#game_stage a").addClass('ui-disabled');
    $("#btn_step_next").before(  stageLink + stageName[t] + "</a>" );
    $("#game_stage a").button();
    $('#game_stage').animate({left:'-=71px'}, ms);

    t++;
	if(t==2){
		t=0;
	}

    $("#btn_step_next .ui-btn-text").text( stageName[t]  );
	
}


//用户被投死，法官处理是否猜词
function userDead(content){
    
    //作为鬼被投死，可以猜词反击
    if(content.ret==0){
        $("#popupGuess .guess_message").text(content.msg);
        if(content.deadIdentity==1){
            $("#popupGuess .guess_tip_human").show();
            $("#popupGuess .guess_tip_ghost").hide();
            $("#link_guess_confirm").hide();
        }
        else if(content.deadIdentity==2){
            $("#popupGuess .guess_tip_human").hide();
            $("#popupGuess .guess_tip_ghost").show();
            $("#link_guess_confirm").show();
        }
        $("#popupGuess").popup('open');
    }
}

//猜词正确
function guessWordCorrect(){
    var wsParm ={'action':'guessWordCorrect','callback':'handleGuessWord'};
    var wsParmEncode = $.toJSON(wsParm);
    ws.send( wsParmEncode ); 
}

/**
 * 
 * 游戏结束
 * @param {String} content.msg 消息
 * @param {Number} content.winner 胜利者 1:人 2:鬼
 * 
 */
function handleGameFinish(content){
	
	if(content.ret!==0) return;
	
    gameStageMove(3,500);
		
	seajs.use('ghost.v1/module/winner/index',function(winner){
		winner.get('./winner').showWinner(content);
	});
		
}

//离开游戏
function exitGame(){
    var wsParm ={'action':'exit','callback':'handleExit'};
    var wsParmEncode = $.toJSON(wsParm);
    ws.send( wsParmEncode ); 
}

function handleExit(content){
    if(content.ret==0){
        window.location.href="#page_index";
        connectInit();
    }
}

/**
 * toggleChangeSeat  切换显示换座位
 * 
 * @access public
 * @return void
 */
function toggleChangeSeat(){
	var desk = $(".mod_desk"), editCn = 'mod_desk_edit';
    desk.toggleClass(editCn);
	changeSeatMod = desk.hasClass(editCn);
	clearPosChecked();
}

/**
 * getSeatId  获取用户位置id
 * 
 * @param {el}  位置的dom元素
 * @param {bool}  isServer  是否服务器的id
 * @access public
 * @return {integer}  seatid
 */
function getSeatId(el, isServer) {
	var cn , mat, seatid;
	el = $(el);
	cn = el.attr('class');

	mat = cn.match(/user_pos_(\d+)/);
	if (mat) {
		seatid = mat[1];
		if (isServer) {
			seatid = seatIdExchange(seatid);
		}
	}
	return seatid;
}

/**
 * seatIdExchange 前台和服务器seat id 对话
 * 
 * @param {seatId}  seatId 
 * @param {isServer}  isServer  传进来的是服务器id
 * @access public
* @return {integer}  seatid
 */
function seatIdExchange(seatId, isServer) {
	var rseatId , offset = userInfo.seatOffset, limit = deskInfo.userLimit;

	if (isServer) {
		// server id -> front id
		rseatId = (seatId + offset + limit) % limit;
	} else {
		// server id -> front id
		rseatId = (seatId - offset) % limit;
	}
	return rseatId;
}

/**
 * svrChangeSeat  换座位
 * 
 * @access public
 * @return void
 */
function svrChangeSeat(seat1, seat2) {
    var wsParm ={'action':'changePos','callback':'handleChangeSeat','seatpos1': seat1,'seatpos2': seat2};
	sendWsReq(wsParm);
}

/**
 * svrSetJudge  换法官
 * 
 * @access public
 * @return void
 */
function svrSetJudge(uid) {
    var wsParm ={'action':'setJudge','callback':'handleSetJudge','judge_uid': uid};
	sendWsReq(wsParm);
}

/**
 * handleChangeSeat 换座位回调
 * 
 * @param {o}  o 
 * @access public
 * @return void
 */
function handleChangeSeat(o) {
	console.log('seat change callback:', o);
	if (o.ret ===0 ) {
		popMessage('更换成功');
	} else {
		popMessage(o.msg);
	}
}

/**
 * isChangePosAllow  是否允许换座位
 * 
 * @access public
 * @return void
 */
function isChangePosAllow() {
	// todo  不允许换座位的条件
	var n = $('#game_stage_area').css('display');
	return (n == 'none');
}

//显示桌面
function showDesk(info){
    if(info.status==0){ //游戏未开始
        $("#foot_desk").hide();
        $("#word_area").hide();
        $("#game_stage_area").hide();
        if(userInfo.identity==11){//法官身份
            $("#mod_option").show();
            $("#button_area").show();
            getDict();
			// 随机选词
			$('#dict_random').unbind('click').bind('click', function() {
				if (wordsDict.length === 0 ) {
					getDict();
				} else {
					loadDictType();
				}
			});
			// 随机选单个词
			$('#get_rand_word').unbind('click').bind('click', function() {
				selSingleWord();
			});
        }
        else{//其它玩家
            $("#mod_option").hide();
        }
    }
	 //var qrstr = '<a id="desk_show_qr" class="ico_code"></a>', deskId = deskInfo.deskId, qrpopstr = '<div id="qr_img_cont" style="display:none; background: #fff; z-index: 100; position:absolute; left:0px; top: 0px; "><img id="qr_img" /><span id="qr_hide">hide</span></div>', hasQr = false;
     $("#desk_id .num").text( deskInfo.deskId  );

	// 显示二维码
    $('#deskImage').attr('src','http://www.ghost.com/index.php?mod=desk&act=binarycode&size=9&url=' + encodeURIComponent("http://ghost.com/ghost/index.htm?desk=" + deskId  ) );
	// todo popup display
    $('#deskImage').click(function(){
        $( "#popupCode" ).popup('close');
    });
	$("#link_code").bind('click', function(evt) {
		$( "#popupCode" ).popup('open');
	});

    window.location.href="#page_desk";

}

//显示游戏阶段
function showStage(){
    $("#foot_desk").show();
    $(".link_stage_insert").remove();
    $('#game_stage').css({'left':'121px'});
    showUserMessage('游戏开始！');

    if(userInfo.identity==11){//法官身份
        $("#mod_option").hide();
        $("#button_area").hide();
        $("#game_stage_area").show();
        $("#game_stage").click(function(){
            $( "#popupStage" ).popup('open');
        });

     }else{
        $("#word_area").hide();
        $("#game_stage_area").show();
    }
	
	seajs.use('ghost.v1/module/userIdentity/index',function(index){
		index.get('./userIdentityUpdate').show(words);
	});
}

//显示消息
var messageTimeout=null;
function showUserMessage(str){
    clearTimeout(messageTimeout);
    $("#user_message").text(str).fadeIn(300);
    messageTimeout=setTimeout(function(){$("#user_message").fadeOut(300);},2000);
}

/**
 * userInfoSave  更新当前用户信息
 * 
 * @param {userList}  userList 
 * @access public
 * @return void
 */
function userInfoSave(userList){
    $.each(userList,function(key,userItem){
        if(userItem.uid == userInfo.uid){
            userInfo.nick=userItem.nick;
            userInfo.avatarId=userItem.avatarId;
            userInfo.identity=userItem.identity;
            userInfo.seatPos=userItem.seatPos;  // 采用后台下发的座位号
            userInfo.seatOffset=-1*userItem.seatPos;  // 前台用户座位号的差值, 用于全局计算别的用户的后台的坐标系统
            deskInfo.deskId=userItem.deskId;
            userSave(userInfo.uid);
        }
    });
}

//更新当前桌子信息
function deskInfoSave(info){
    deskInfo.deskId=info.deskId;
    deskInfo.userLimit=info.userLimit;
}


/**
 * handleUserUpdate  更新用户信息和相关的座位信息
 * 
 * @param {content}  content 
 * @access public
 * @return void
 */
function handleUserUpdate(content){
	console.log('user update info:', content);
    if(content.msg.length>0)showUserMessage(content.msg);

	// 更换位置的话需要取消选择 todo
	if (seatChanging) {
		clearPosChecked();
		seatChanging = false;
	}

	userInfoSave(content.userlist);
    userList=content.userlist;
    userSit(content.userlist);
}

//用户信息更新，包含身份信息、词条信息
function userIdentityUpdate(content){
	userInfoSave(content.userlist);
    userSit(content.userlist);
	words = content.words || words;
}

function clearPosChecked() {
	$('.mod_desk .user_item_vote').removeClass('user_item_vote');
}

//清空桌子上的玩家
function deskReset(){
    $(".user_item").each(function(){
        $(this).removeClass("user_item_offline");
        $(this).removeClass("user_item_judge");
        $(this).removeClass("user_item_Dead");
        $(this).removeClass("user_item_set");
        $(this).find(".avatar_item").attr("class","avatar_item");
        $(this).find(".user_name").text("");
        $(this).find(".avatar_ident").attr("class","avatar_ident");
    });
}

/**
 * userSit  用户坐位置
 * 
 * @param {userList}  userList 
 * @access public
 * @return void
 */
function userSit(userList){
    deskReset();
    $.each(userList,function(key,userItem){
        var seatPos = seatIdExchange(userItem.seatPos, true);
		// todo  更换头像动画
        $(".user_pos_"+seatPos).addClass("user_item_set");
        $(".user_pos_"+seatPos+" .avatar_item").addClass("avatar_"+userItem.avatarId);
        $(".user_pos_"+seatPos+" .user_name").text(userItem.nick);
        $(".user_pos_"+seatPos).attr("uid",userItem.uid);

        if(userItem.online==0)$(".user_pos_"+seatPos).addClass("user_item_offline");
        switch(userItem.identity){
            case 11:
                $(".user_pos_"+seatPos).addClass("user_item_judge");
                break;
            case 2:
                $(".user_pos_"+seatPos).addClass("user_item_ghost");
                break;
            default:
                break;
        }
        if(userItem.alive==1)
            $(".user_pos_"+seatPos).removeClass("user_item_Dead");
        else
            $(".user_pos_"+seatPos).addClass("user_item_Dead");

    });
    
    userOptionInit(userList);
}

//用户列表初始化一下
function userOptionInit(userList){
    if(userInfo.identity==11){
        //显示玩家数量
        $("#game_count").text(userList.length);
        $("#game_count_error").hide();
        if(userList.length<4){
            $("#game_status").show();
            $("#game_status").text('（无法开始游戏）');
        }
        else{
            //算出默认的鬼数量
            var userCount=userList.length;
            $.each(roleAllot,function(key,value){
                if(key*1==userCount)ghostNum=value;
            });
            $("#game_role_message").html("<span class=\"role_human\">平民："+ (userCount-1-ghostNum) +"人</span> <span class=\"role_ghost\">内鬼："+ghostNum+"人</span>");
            $("#game_role_message").show();
        }

        //法官可对玩家操作，如离开游戏、换座位
        /*$(".user_item").each(function(index){
            if( $(this).hasClass('user_item_set') && !$(this).hasClass('user_pos_0')){
				// todo
				//$(this).attr("href",'#popupMenu' );
            }
        });*/
    }
}

//更新词库
function getDict(){
    var data ={'action':'getWords','callback':'handleDictCallback', 'reqNum': 15};
	sendWsReq(data);
}

/**
*  拉取随机词库处理
*/
function handleDictCallback(content) {
	console.log('dict conten', content);
	if (content.ret === 0) {
		wordsDict = content.list;
		loadDictType();
	} else {
		popMessage(content.msg);
	}
}

/**
 * selSingleWord 随机选一个词
 * 
 * @access public
 * @return void
 */
function selSingleWord() {
	var word , index, len = wordsDict.length;
	if ( len >0 ) {
	   index = Math.floor(Math.random() * len)	;
	   word = wordsDict[index];
	   word = word.wordA + '#' + word.wordB;
	   dictSet(word);
	}
}

function popMessage(msg) {
	seajs.use('ghost.v1/api/centerTips',function(centerTips){
		centerTips.displayMsg(msg);
	});
}


/**
 * sendWsReq 
 * 
 * @param {object}  data 发送数据 json
 * @access public 
 * @return 
 */
function sendWsReq(data) {
    var wsParmEncode = $.toJSON(data);
    ws.send( wsParmEncode ); 
}

/**
 * loadDictType  从词库中选择一定个数词，展示到列表中
 * 
 * @access public
 * @return void
 */
function loadDictType(){
	if (wordsDict.length == 0 ) {
		return false;
	}

	var pagenum =  wordsDict.length / PAGEWORDNUM, words;
	wordPageIndex ++;
	if (wordPageIndex >= pagenum) {
		wordPageIndex = -1;
		getDict();
		return false;
	}

	var start = 0, end = 0 ;
	start = PAGEWORDNUM * wordPageIndex;
	end = start + PAGEWORDNUM;

	words = wordsDict.slice(start, end);
	console.log('words to render:(index, start, end,words):', wordPageIndex , start, end, words);
    loadDict(words);
}

/**
 * loadDict  把词列表展示到页面上供用户选择
 * 
 * @param {words}  words 
 * @access public
 * @return void
 */
function loadDict(words){
    var html="";
    $.each(words,function(key,dictItem){
		var  a = dictItem.wordA, b =  dictItem.wordB , str = a + '#' + b;
        html+="<li><a onclick=\"dictSet('"+ str +"')\"><span class=\"dict_item\">"+ a +"</span> <span class=\"dict_item\" >"+b +"</span></a></li>";

    });
    $('#dict_list').html(html);
    try{
        $("#dict_list").listview('refresh');
    }
    catch(e){}
}

function dictSet(dictItem){
    var dict_arr=dictItem.split("#");
    words.human=dict_arr[0];
    words.ghost=dict_arr[1];
    $('#id_human').val( words.human );
    $('#id_ghost').val( words.ghost );
    window.location.href="#page_option";
}







//jq eventXY bug
(function(){
var all = $.event.props,
len = all.length,
res = [];
while (len--) {
var el = all[len];
if (el != 'layerX' && el != 'layerY') res.push(el);
}
$.event.props = res;
}());

function in_array(needle, haystack) 
{
    // 得到needle的类型
    var type = typeof(needle);
    if(type == 'string' || type =='number') 
    {
        for(var i in haystack) 
        {
            if(haystack[i] == needle)return true;
        }
    }
    return false;
}

/*禁用页面滚动
document.body.addEventListener('touchmove', function(event) {
    event.preventDefault();
}, false); 
*/
define(function(require,exports,module){

	return {
		init : init
	};

});


