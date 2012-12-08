/*
 * Copy Right: Tencent ISUX
 * Project: ghost
 * Description: 用户信息
 * Author: kundy
 * date: 2012-11-15
 */

var ws; 
var wsUrl = 'ws://192.168.1.131:8001'; 
//var wsUrl = 'ws://127.0.0.1:8001'; 
var wsFlag=0;//服务器连接状态,0:未连接 1:正常连接 2:已断开 3:超时(掉线)
var wordsDict={};//词库


//var words={"human":"","ghost":""};
var words={"human":"机器","ghost":"电脑"};
var userLimit=1;
//用户信息
var userList=[];
var userInfo={
    uid:0,
    nick:'',
    avatarId:'',
    identity:0,
    seatPos:0,      //座位位置
    seatOffset:0,   //座位偏移位置
    endline:0
}

//桌子信息
var deskInfo={
    deskId:0,
    userLimit:0,
    endline:0
}
//鬼的数量
var ghostNum=0;

//角色分配，鬼的默认数量
var roleAllot={
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
}
var stageList=[];

function init(){
    if( location.hash!="" && location.hash!="#page_index" && wsFlag!=1){
         window.location.href="index.htm"
    }
    //userMoveInit()
    userInit();
    avatarInit();
    connectInit();
}

/*页面初始化 start 
***************************************************************************/
function userInit(){
    $("#nick").val(localStorage.nick)
    $("#nick").blur(function(){
            localStorage.nick=$("#nick").val();
    });
    var avatarId=localStorage.avatarId
    if(!avatarId){
        avatarId=Math.ceil(Math.random()*59)
        localStorage.avatarId=avatarId
    }
    $("#avatarId i").attr("class","avatar_item avatar_"+avatarId)
    $("#avatarId").click(function(){
        window.location="#page_avatar"
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
        window.location="#page_option"
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
        changeSeat();
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
        window.location="#page_desk"
    });

}

//设置头像点击
function avatarInit(){
    $(".mod_avatar a").click(function(){
        var avatarId=$(this).attr("avatarId");
        localStorage.avatarId=avatarId
        $("#avatarId i").attr("class","avatar_item avatar_"+avatarId)
        window.location="#page_index"
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
                
                // try{
                //     var callback = eval(decodeData.callback );
                //     callback(decodeData.content);
                // }catch(e){
                //     console.log("receive error data:"+event.data);
                // }
                
            };
            ws.onclose = function(event) { 
                connectClose();
            }; 
            ws.onerror = function(event) {
                console.log("ws error.");
            };
        }
    }
    else{
        window.location="b.htm"
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
    //console.log(state);
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
    //console.log("queryStatus start");
    if(localStorage.uid!=""){
        var wsParm ={'action':'queryStatus','callback':'handleQueryStatus','uid':localStorage.uid}
        var wsParmEncode = $.toJSON(wsParm);
        ws.send( wsParmEncode ); 
    }
}

function handleQueryStatus(content){
    //console.log(content)
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
    var wsParm ={'action':'create','callback':'handleCreate','nick':localStorage.nick,'avatarId':localStorage.avatarId}
    if(localStorage.uid>0)wsParm['uid']=localStorage.uid;
    var wsParmEncode = $.toJSON(wsParm);
    ws.send( wsParmEncode ); 
}

function handleCreate(content){
    if(content.ret==0){
        userInfo.uid=content.uid
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
    var wsParm ={'action':'reconnectionGame','callback':'handleReconnectionGame','uid':localStorage.uid,'nick':localStorage.nick,'avatarId':localStorage.avatarId}
    var wsParmEncode = $.toJSON(wsParm);
    ws.send( wsParmEncode ); 
}

function handleReconnectionGame(content){
    //重连游戏，真的要做很多事情。。。
    console.log(content);
    if(content.ret==0){
        userInfo.uid=content.uid
        userInfoSave(content.userlist);
        deskInfoSave(content.deskInfo)
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
        var wsParm ={'action':'join','callback':'handleJoinGame','nick':localStorage.nick,'avatarId':localStorage.avatarId,'deskId':deskId}
        if(localStorage.uid>0)wsParm['uid']=localStorage.uid;
        var wsParmEncode = $.toJSON(wsParm);
        ws.send( wsParmEncode ); 
    }
    else
        $("#server_status").html("<span class=\"t_err\">请输入房间号</span>");
}

function handleJoinGame(content){
    //console.log(content)
    if(content.ret==0){
        userInfo.uid=content.uid
        userInfoSave(content.userlist);
        deskInfoSave(content.deskInfo)
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
        deskInfoSave(content.deskInfo)
        userSit(content.userlist);
        showDesk(content.deskInfo);
        showUserMessage(content.msg);
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

        ghostNum=roleAllot[userList.length.toString()]
        var wsParm ={'action':'startGame','callback':'handleStartGame','wordHuman':words.human,'wordGuest':words.ghost,'ghostNum':ghostNum}
        var wsParmEncode = $.toJSON(wsParm);
        ws.send( wsParmEncode ); 
    }
}

function handleStartGame(content){
    //console.log(content)
    if(content.ret==0){
        showStage();
        //showDesk(content.deskInfo);
    }
    else{
        $( "#popupMessage_desk .message_text" ).text(content.msg);
        $( "#popupMessage_desk" ).popup('open');
    }
}


//确认任务进入下一阶段
function gameStageNext(){
    var wsParm ={'action':'gameStageNext','callback':'handleGameStage'}
    var wsParmEncode = $.toJSON(wsParm);
    ws.send( wsParmEncode ); 
}



//游戏过程更新
function handleGameStage(content){
    //console.log(content)
    if(content.ret==0){
        //只多一步，为正常更新
        if( content.deskStage.step.length-stageList.length == 1){
            stageList=content.deskStage.step;
            gameStageMove( content.deskStage.type,500 )
            if( content.deskStage.type != 1){
                //非投票阶段，去掉投票界面
                $(".mod_desk").removeClass('mod_desk_vote');
                $(".mod_desk").removeClass('mod_desk_vote_judge');
                $(".user_item").unbind('click').removeClass('user_item_vote');
            }
        }
        else{//掉包、重连等因素，要重置显示所有的步骤
            stageList=content.deskStage.step;
            
            $(".link_stage_insert").remove();
            $('#game_stage').css({'left':'121px'});
            $.each(stageList,function(key,value){
                gameStageMove( value,1 ) 
            })
        }

        //显示最后的消息
        $("#game_message").text(content.msg);

        //投票阶段
        if( content.deskStage.step[content.deskStage.step.length-1] == 1){
            voteStart(content.voteUserList);
        }
    }
}

//开始投票
function voteStart(voteUserList){
    //console.log(voteUserList)
    if(userInfo.identity!=11){
        $(".mod_desk").addClass('mod_desk_vote');
        $(".user_item").each(function(){
            var uid=$(this).attr('uid');
            if(in_array(uid,voteUserList) && uid!=userInfo.uid){
                $(this).unbind('click').click(function(){
                    $('.user_item').removeClass('user_item_vote');
                    $(this).addClass('user_item_vote');
                    voteUser(uid);
                });
            }
        })
    }
    else{
        $(".mod_desk").addClass('mod_desk_vote_judge');
    }
}

function voteUser(uid){
    var wsParm ={'action':'voteUser','callback':'handleVoteUser','voteUid':uid}
    var wsParmEncode = $.toJSON(wsParm);
    ws.send( wsParmEncode ); 
}

function handleVoteUser(content){
    console.log(content);
}

//显示投票状态
function voteStatus(content){
    var noVoteNum=0
    $.each(content.voteUserStatus,function(key,userItem){
        var voteNumNode=$('.user_item[uid='+userItem.uid+'] .voteNum');
        voteNumNode.text(userItem.voteNum)
        if(userItem.voteUid!=0)
            voteNumNode.addClass('voteNum_voted')
        else{
            voteNumNode.removeClass('voteNum_voted')
            noVoteNum++;
        }
    })
    if(noVoteNum>0)
        $("#game_message").text("还有 "+noVoteNum+" 位用户未股票");
    else
        $("#game_message").text("所有玩家已投票，请确认进入下一阶段");
}

//任务进度条 填充数据并向左平移
var stageLink="<a data-icon=\"arrow-r\" data-iconpos=\"right\" data-corners=\"false\" class=\"link_stage_insert\" data-role=\"button\" data-inline=\"true\" data-mini=\"true\" data-theme=\"a\">";
var stageName=['陈述','投票','猜词','结束','结果','重新开始'];
function gameStageMove(t,ms){
    $("#game_stage a").addClass('ui-disabled');
    $("#btn_step_next").before(  stageLink + stageName[t] + "</a>" );
    $("#game_stage a").button();
    $('#game_stage').animate({left:'-=71px'}, ms);

    t++;if(t==2)t=0;
    $("#btn_step_next .ui-btn-text").text( stageName[t]  );
    
}


//用户被投死，法官处理是否猜词
function userDead(content){
    console.log(content)
    //作为鬼被投死，可以猜词反击
    if(content.ret==0){
        $("#popupGuess .guess_message").text(content.msg)
        if(content.deadIdentity==1){
            $("#popupGuess .guess_tip_human").show()
            $("#popupGuess .guess_tip_ghost").hide()
            $("#link_guess_confirm").hide()
        }
        else if(content.deadIdentity==2){
            $("#popupGuess .guess_tip_human").hide()
            $("#popupGuess .guess_tip_ghost").show()
            $("#link_guess_confirm").show()
        }
        $("#popupGuess").show()
    }
}

//猜词正确
function guessWordCorrect(){
    var wsParm ={'action':'guessWordCorrect','callback':'handleGuessWord'}
    var wsParmEncode = $.toJSON(wsParm);
    ws.send( wsParmEncode ); 
}

//游戏结束
function handleGameFinish(content){
     if(content.ret==0){
        gameStageMove(3,500) 
    }
}



//离开游戏
function exitGame(){
    var wsParm ={'action':'exit','callback':'handleExit'}
    var wsParmEncode = $.toJSON(wsParm);
    ws.send( wsParmEncode ); 
}

function handleExit(content){
    if(content.ret==0){
        window.location.href="#page_index"
        connectInit();
    }
}

function changeSeat(){
    $(".mod_desk").addClass("mod_desk_edit");
}

//显示桌面
function showDesk(info){
    //console.log(info);
    if(info.status==0){ //游戏未开始
        $("#foot_desk").hide();
        $("#word_area").hide();
        $("#game_stage_area").hide();
        if(userInfo.identity==11){//法官身份
            $("#mod_option").show();
            $("#button_area").show();
            updateDict();
        }
        else{//其它玩家
            $("#mod_option").hide();
        }
    }
    $("#desk_id").text("房间："+deskInfo.deskId);
    window.location.href="#page_desk"
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

        $("#word_area").show();
        $('#word_human').text(words.human);
        $('#word_ghost').text(words.ghost);
     }
     else{
        $("#word_area").hide();
        $("#game_stage_area").show();
    }
}

//显示消息
var messageTimeout=null;
function showUserMessage(str){
    clearTimeout(messageTimeout)
    $("#user_message").text(str).fadeIn(300);
    messageTimeout=setTimeout(function(){$("#user_message").fadeOut(300)},2000);
}

//更新当前用户信息
function userInfoSave(userList){
    //console.log(userList)
    $.each(userList,function(key,userItem){
        if(userItem.uid == userInfo.uid){
            userInfo.nick=userItem.nick;
            userInfo.avatarId=userItem.avatarId;
            userInfo.identity=userItem.identity;
            userInfo.seatPos=userItem.seatPos;
            userInfo.seatOffset=-1*userItem.seatPos;
            deskInfo.deskId=userItem.deskId;
            userSave(userInfo.uid);
        }
    })
}

//更新当前桌子信息
function deskInfoSave(info){
    deskInfo.deskId=info.deskId;
    deskInfo.userLimit=info.userLimit;
}


//用户信息更新
function handleUserUpdate(content){
    if(content.msg.length>0)showUserMessage(content.msg);
    userList=content.userlist
    userSit(content.userlist);
}

//用户信息更新，包含身份信息、词条信息
function userIdentityUpdate(content){
    userSit(content.userlist);
    $("#word_area").show();
    $('#word_human').text(words.human);
    $('#word_ghost').text(words.ghost);
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
function userSit(userList){
    console.log(userList)
    deskReset();
    $.each(userList,function(key,userItem){
        var seatPos=userItem.seatPos + userInfo.seatOffset;
        if(seatPos<0)seatPos=seatPos+deskInfo.userLimit;
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

    })
    
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
            })
            $("#game_role_message").html("<span class=\"role_human\">平民："+ (userCount-1-ghostNum) +"人</span> <span class=\"role_ghost\">内鬼："+ghostNum+"人</span>");
            $("#game_role_message").show();
        }

        //法官可对玩家操作，如离开游戏、换座位
        $(".user_item").each(function(index){
            if( $(this).hasClass('user_item_set') && !$(this).hasClass('user_pos_0')){
                $(this).attr("href",'#popupMenu' );
            }
        });
    }
}



//更新词库
function updateDict(){
    $.ajax({
        url: 'dict.txt',type: 'POST',dataType: 'json', timeout: 60000,error: function(){},
        success:function(feedback){
            wordsDict=feedback
            loadDictType()
        }
    });
}

//加载词库
function loadDictType(){
    $.each(wordsDict,function(key,dictItem){
        //console.log(dictItem.name);
        $('#dict_type_'+key+ " a").text(dictItem.name);
        $('#dict_type_'+key+ " a").unbind('click').click(function(){
            loadDict(key)
        });
    })
    loadDict(0)
}

function loadDict(index){
    var html="";
    $.each(wordsDict[index].data,function(key,dictItem){
        var dict_arr=dictItem.split("#");
        html+="<li><a onclick=\"dictSet('"+dictItem+"')\"><span class=\"dict_item\">"+dict_arr[0]+"</span> <span class=\"dict_item\" >"+dict_arr[1]+"</span></a></li>"

    })
    $('#dict_list').html(html);
    try{
        $("#dict_list").listview('refresh');
    }
    catch(e){}
}

function dictSet(dictItem){
    var dict_arr=dictItem.split("#");
    words.human=dict_arr[0]
    words.ghost=dict_arr[1]
    $('#id_human').val( words.human );
    $('#id_ghost').val( words.ghost );
    window.location.href="#page_option"
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


