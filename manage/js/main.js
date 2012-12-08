/*
 * Copy Right: Tencent ISUX
 * Project: QAM（Qzone模块化页面搭建平台）
 * Description: 用户信息
 * Author: Tysonpan
 * date: 2011-11-17
 */
parent.nav_set(0);
var main = {

	init : function(){
		this.getUserCookie();
		this.showLinks();
		this.showfeeds();
		this.scrollListen();
		$("#gotop").click(function(){$('html,body').animate({scrollTop: '0px'}, 800);});
    },

			
			
    /*------------ 获取用户cookie ------------*/
    getUserCookie : function(){
        $.ajax({
                url: cgipath+'user-cookie',type: 'POST',dataType: 'json', timeout: ajax_timeout,error: function(){notify.show(2,"请求数据失败，请刷新页面");},
                success:this.handlegetUserCookie
        });
    },

    handlegetUserCookie : function(feedback){
		if(feedback.data.img!=null)
			$("#user_img")[0].src=cgipath+feedback.data.img;
		else
			$("#user_img")[0].src="css/sample/avatar_default.png";
    },
	
	showLinks : function(){
        $.ajax({
                url: cgipath+'/link.xml',type: 'GET',dataType: 'json', timeout: ajax_timeout,error: function(){notify.show(2,"请求数据失败，请刷新页面");},
                success:this.handleshowLinks
        });
    },

    handleshowLinks : function(feedback){
		var innerhtml="";
		for(var i=0;i<feedback.links.length;i++){
			innerhtml+="<li><a target=\"_blank\" href=\""+feedback.links[i].url+"\">"+feedback.links[i].name+"</a></li>";
		}
		$("#links_list").html(innerhtml);
		
		innerhtml="";
		for(var i=0;i<feedback.tools.length;i++){
			innerhtml+="<li><a target=\"_blank\" href=\""+feedback.tools[i].url+"\">"+feedback.tools[i].name+"</a></li>";
		}
		$("#toos_list").html(innerhtml);
    },
	
	//feed滚动到底时动态拉取内容
	scrollListen:function(){
		$(window).scroll(function(){
			$bottom_padding=$(window.document).height()-$(window).height()-$(window).scrollTop();
			if($bottom_padding<5 && main.page<main.page_nums){
				main.page++;
				main.showfeeds();
			}
		});
	},

	
	
	search_data:[],
	page:1,//第几页
	reqnum:10,//每页显示多少条
	order:"id",//排序字段
	desc:1,//反序,0或空正常排序，1反序
	page_nums:1,//总页数
	showfeeds : function(){
		var data_area=[];
		data_area.push([ "page" , main.page ]);
		data_area.push([ "reqnum" , main.reqnum ]);
		data_area.push([ "order" , main.order ]);
		data_area.push([ "desc" , main.desc ]);
		var data_str=functions.requestToString(data_area);
        $.ajax({
                url: cgipath+'feed-showlist',type: 'POST',dataType: 'json',data: data_str, timeout: ajax_timeout,error: function(){notify.show(2,"请求数据失败，请刷新页面");},
                success:this.handleshowfeeds
        });
    },

    handleshowfeeds : function(feedback){
		var innerhtml="";
		for(var i=0;i<feedback.listdata.length;i++){
			innerhtml+="<li><div class=\"avatar\">";
			innerhtml+="<span ><img src=\""+feedback.listdata[i].avatar+"\" title=\""+feedback.listdata[i].name+"\"></span>";
			innerhtml+="</div><div class=\"feed_main\"><div class=\"feed_hd\">";
			innerhtml+=feedback.listdata[i].content;
			var feed_time=feedback.listdata[i].time;
			var feed_Date=new Date(Date.parse(feed_time.replace(/-/g,"/")));
			var feed_time_str=feed_time;
			var now_Date = new Date()
			var time_passed=now_Date.getTime()-feed_Date.getTime();
			if(time_passed<1*60*1000)feed_time_str="刚刚";
			else if(time_passed<3*60*1000)feed_time_str="3分钟前";
			else if(time_passed<5*60*1000)feed_time_str="5分钟前";
			else if(time_passed<10*60*1000)feed_time_str="10分钟前";
			else if(time_passed<30*60*1000)feed_time_str="半小时前";
			else if(time_passed<60*60*1000)feed_time_str="1小时前";
			else if(time_passed<2*60*60*1000)feed_time_str="2小时前";
			
			innerhtml+="<span class=\"time\">"+feed_time_str+"</span>";
			innerhtml+="</div>";
			innerhtml+="<div class=\"feed_bd\">";
			if(feedback.listdata[i].img!=null && feedback.listdata[i].img!="")innerhtml+="<div class=\"imgbox\"><a target=\"_blank\" href=\""+feedback.listdata[i].img_href+"\"><img src=\""+feedback.listdata[i].img+"\" alt=\"\"></a></div>";
			innerhtml+="</div><b class=\"arrow_l\"></b></div></li>";
		}
		main.page_nums=Math.ceil(feedback.nums/main.reqnum);
		$("#feed_list").append(innerhtml);
    }

}


















