/*
 * Copy Right: Tencent ISUX
 * Project: QAM（Qzone模块化页面搭建平台）
 * Description: 用户信息
 * Author: Tysonpan
 * date: 2011-11-17
 */

var login = {

	init : function(){

        $('#id').focus(function () {
            login.checkNameInput('focus')
        });
        $('#id').blur(function () {
            login.checkNameInput('blur')
        });
        $('#password').focus(function () {
            login.checkPasswordInput('focus')
        });
       $('#password').blur(function () {
            login.checkPasswordInput('blur')
        });
       $('#btn_login').click(function(){
            return login.login();
        });
		$('#btn_login_oa').click(function(){
            window.location.href=oa_login_path;
			
        });
		
    },
	
    /*------------ 获取用户cookie ------------*/
    getUserCookie : function(){
        $.ajax({
                url: cgipath+'user-cookie',type: 'POST',dataType: 'json', timeout: ajax_timeout,error: function(){message.show("message_div","","服务器异常！",4);},
                success:this.handlegetUserCookie
        });
    },

    handlegetUserCookie : function(feedback){
		if(typeof($("#iframe_oa")[0])=="object")$("#iframe_oa").remove();
		if(feedback.data.usergroup==3){//usergroup为3，默认为游客
			$("#login_status").html("登录");
			$("#user_id").html("欢迎您："+feedback.data.nick);
			$("#login_status").click(function(){window.location.href=oa_login_path});
			//游客模式下主动尝试oa统一登录
			login.tryOa();
		}
		else{
			$("#user_id").html("欢迎您："+feedback.data.nick);
			$("#login_status").unbind("click").click(function(){login.logoutConfirm()});
			$("#login_status").html("退出");
			
			if(feedback.data.usergroup==1){
				$("#nav_user").show();
				$("#nav_setting").show();
			}
		}
    },
	
	//尝试oa登陆，如果没有返回失败，就跳到登陆页，登陆页会自动跳回本系统
	tryOa:function(){
		//创建一个隐藏的iframe在后台交互，如果交互成功，本页重新初始化一下
		$("#wrapper").append("<iframe src=\"oa_login.htm?type=0\" class=\"none\" id=\"iframe_oa\"></iframe>");
	},
	
	oaLoginFail:function(){
		//创建一个隐藏的iframe在后台交互，如果交互成功，本页重新初始化一下
		$("#iframe_oa").remove();
	},
	
	loginSucc:function(){
		$("#iframe_oa").remove();
		 $.ajax({
                url: cgipath+'user-cookie',type: 'POST',dataType: 'json', timeout: ajax_timeout,error: function(){message.show("message_div","","服务器异常！",4);},
                success:this.handleloginSucc
        });
	},
	
	 handleloginSucc : function(feedback){
		console.log(feedback);
		$("#user_id").html(feedback.data.nick);

		if(feedback.data.usergroup==1){
			$("#nav_user").show();
			$("#nav_setting").show();
		}
		$("#login_status").click(function(){login.logoutConfirm()});
    },
	
	
	

	
	/*------------ 登录操作 ------------*/
    login : function() {
        //检查填写信息有效性
        var id = $("#id").val();
        var origin_password = $("#password").val();
        if (id == 'Name' || origin_password == 'Password') {
			message.show("message_div","","请填写用户名和密码");
            return false;
        }

        //md5加密密码
        var password = hex_md5(origin_password);

        //发送登录请求
        $.ajax({
            url:cgipath + 'user-login',
            type:'POST',
            data:'name=' + encodeURIComponent(id) + '&passwd=' + encodeURIComponent(password),
            dataType:'json', //會把回傳的字符串自動轉換為json對象！
            timeout: ajax_timeout,
            error:function () {
                notify.show(2,"请求数据失败，请刷新页面");
            },
            success:this.handleLogin
        });
    },

    handleLogin : function(feedback) {
        if (feedback.ret == "0") {          //登录成功
            window.location.href =spark_path;
        }
        else {     
			message.show("message_div","",feedback.msg,4);
        }
    },
	
	
	 /*------------ oa ticket登录操作，其实是后台iframe进行的 ------------*/
     oaLogin: function(ticket) {
       var data_area=[];
		data_area.push([ "ticket" , ticket ]);
		var data_str=functions.requestToString(data_area);
        $.ajax({
                url: cgipath+'user-oaLogin',type: 'POST',data: data_str,dataType: 'json',timeout: ajax_timeout,error: function(){notify.show(2,"请求数据失败，请刷新页面");},
                success:function(feedback){
					//console.log(feedback);
					if (feedback.ret == "0") {          //登录成功
						login.getUserCookie();
					}
					else {
						message.show("message_div","",feedback.msg,4);
					}
				}
        });
    },

	logoutConfirm : function(){
        message.show("message_div","","确定要退出吗？",2,"","login.logout();");
    },
	
	logout : function(){
        $.ajax({
                url: cgipath+'user-logout',type: 'POST',dataType: 'json', timeout: ajax_timeout,error: function(){notify.show(2,"请求数据失败，请刷新页面");},
                success:function(){
					window.location.href=oa_logout_path;
				}
        });
    },
	
    /*------------ 用户名登录框相关动作 ------------*/
    checkNameInput : function (action){
        if(action == 'focus'){
            if ($("#id").val() == 'Name') $("#id").val('');
            $("#id_wrap").addClass("input_focus");
        }
        if(action == 'blur'){
            if ($("#id").val() == '') $("#id").val('Name');
            $("#id_wrap").removeClass("input_focus");
        }
    },

    /*------------ 用户名登录框相关动作 ------------*/
    checkPasswordInput:function (action) {
        if (action == 'focus') {
            if ($("#password").val() == 'Password') $("#password").val('');
            $("#password_wrap").addClass("input_focus");
        }
        if (action == 'blur') {
            if ($("#password").val() == '') $("#password").val('Password');
            $("#password_wrap").removeClass("input_focus");
        }
    }
	

}



function mainmenu(){
	$(" .submenu ").css({display: "none"}); // Opera Fix
	$(" .mainmenu li").hover(function(){
		$(this).find('.submenu').css({visibility: "visible",display: "none"}).slideDown(300);
		},function(){
		$(this).find('.submenu').css({visibility: "hidden"});
		});
	$(" .mainmenu li").click(function(){$(".mainmenu li").removeClass("current");});
	$(" .mainmenu li").click(function(){$(this).addClass("current");});
}















