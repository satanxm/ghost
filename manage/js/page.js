/*
 * Copy Right: Tencent ISUX
 * category: QAM（Qzone模块化页面搭建平台）
 * Description: 页面管理
 * Author: kundy
 * date: 2012-10-23
 */

var page_id=functions.getRequest("id")*1;
var page_action=functions.getRequest("action");




//预览代码的图片
function preview_img(t){
	document.getElementById("shade_frame").src="img_adjust.htm?id="+t;
	$("#shade_layer").show();;
	$("#shade_layer").width(document.body.clientWidth);
	$("#shade_layer").height(document.body.clientHeight);
}


var page = {
	init:function(){
		$(".like_select").click(function(){$(this).parent().find('.select_drop_down').css({visibility: "visible",display: "none"}).show();});
		$(".type_select").hover(
			function(){},
			function(){$(this).find('.select_drop_down').hide();}
		);
		$("#btn_add").click(function(){window.location.href="page.htm"});
		$("#page_up").click(function(){page.list_page(-1);});
		$("#page_down").click(function(){page.list_page(1);});
		$("#th_name").click(function(){page.list_page(0,'name');});
		$("#th_ident").click(function(){page.list_page(0,'ident');});
		$("#th_category_id").click(function(){page.list_page(0,'category_id');});
		$("#th_author").click(function(){page.list_page(0,'author');});
		$("#th_adjust_time").click(function(){page.list_page(0,'adjust_time');});
		$("#search_btn").click(function(){page.search();});
		
		
		$(".textarea_style").focus(function(){
			$(this).addClass("textarea_focus")
		});
		$(".textarea_style").blur(function(){
			$(this).removeClass("textarea_focus")
		});

		page.tagShow();
		page.userShow();
	},
	addInit:function(){
		if(page_action=="edit"){
			page.edit();
			$("#btn_praise").show();
			$(".mod_comment").show();
			$("#btn_praise").unbind("click").click(function(){page.praise();});
			$("#btn_save").unbind("click").click(function(){page.update();});
			$('#page_title').html("修改页面");
		}
		else{

			$("#btn_save").unbind("click").click(function(){page.add();});
			$('#page_title').html("添加页面");
			
			$("#name").focusout(function () {
				this.value=this.value.replace(/\s/g,'');
				page.checkName(this.value);
			});
		}
		
		page.commentInit();
		page.imgDropInit();
		$("#btn_cancel").click(function(){window.location.href="page_list.htm"});
		$(".like_select").click(function(){$(this).parent().find('.select_drop_down').css({visibility: "visible",display: "none"}).show();});
		$(".type_select").hover(
			function(){},
			function(){$(this).find('.select_drop_down').hide();}
		);
		
		$("#name").mouseout(function () {
			this.value=this.value.replace(/\s/g,'');
		});
		
		$("#name").keyup(function () {
			this.value=this.value.replace(/\s/g,'');
		});
		$("#name").focusin(function () {
			$("#fhint_area_name").hide();
		});
		
		$(".textarea_style").focus(function(){
			$(this).addClass("textarea_focus")
		});
	},
	
	commentInit:function(){
		page.commentShowlist();
		$("#btn_comment_save").unbind("click").click(function(){
			page.commentSave();
		});
	},

	imgDropInit:function(){
		$("#src_present_area")[0].ondragenter =function(){event.stopPropagation(); event.preventDefault();};
		$("#src_present_area")[0].ondragover =function(){event.stopPropagation(); event.preventDefault();};
		$("#src_present_area")[0].ondrop =function(){event.stopPropagation(); event.preventDefault();dodrop(event)};
	},


	/*------------ 检查用户输入的名称 ------------*/
	checkName : function(category_name){
		if(category_name==""){
			$("#fhint_area_name").show();
			$("#fhint_area_name").removeClass('fhint_succeed').addClass('fhint_error');
			$("#fhint_ico").removeClass('ico_succeed').addClass('ico_error');
			$("#fhint_text").text("亲，名称要填的");
		}
    },

	search:function(){
		this.search_data=[];
		this.page=1;
		var search_text=$("#search_text").val();
		this.search_data.push([ "search_flag" , 1 ]);
		this.search_data.push([ "search_data" , search_text ]);
		this.showlist();
	},
	
	tagShow : function(){
		var data_area=[];
		if(this.search_data.length>0)
			data_area=data_area.concat(this.search_data);
		
		var data_str=functions.requestToString(data_area);
        $.ajax({
                url: cgipath+'page-tagShowlist', type: 'POST',data: data_str,dataType: 'json', timeout: ajax_timeout,error: function(){notify.show(2,"请求数据失败，请刷新页面");},
                success:function(feedback){
					if(feedback.ret=="0"){
						var listdata=feedback.listdata;
						var html="";
						$.each(listdata,function(key,tag){
							html+="<a onclick=\"page.filterTagSet('"+tag.name+"')\">"+tag.name+"("+tag.count+")</a>";
						});
						$("#tag_list").html(html);
					}
				}
        });
    },
    userShow : function(){
    	var data_area=[];
		data_area.push([ "page" , 1 ]);
		data_area.push([ "reqnum" , 10 ]);
		data_area.push([ "order" , "active" ]);
		data_area.push([ "desc" , 1 ]);
		if(this.search_data.length>0)
			data_area=data_area.concat(this.search_data);
		
		var data_str=functions.requestToString(data_area);
	
		var data_str=functions.requestToString(data_area);
        $.ajax({
                url: cgipath+'user-showlist', type: 'POST',data: data_str,dataType: 'json', timeout: ajax_timeout,error: function(){notify.show(2,"请求数据失败，请刷新页面");},
                success:function(feedback){
					if(feedback.ret=="0"){
						var listdata=feedback.listdata;
						var html="";
						$.each(listdata,function(key,user){
							html+="<a onclick=\"page.filterAuthorSet('"+user.name+"')\">"+user.name+"("+user.active+")"+"</a>";
						});
						$("#user_list").html(html);
					}
				}
        });
    },

    filterTag:"",
	filterTagSet:function(t){
		this.filterTag=t;
		this.filter();
	},
	filterAuthor:"",
	filterAuthorSet:function(t){
		this.filterAuthor=t;
		this.filter();
	},

	filter:function(){
		this.search_data=[];
		this.page=1;
		this.search_data.push([ "search_flag" , 0 ]);

		if(this.filterTag!=-1){
			this.search_data.push([ "tag" , this.filterTag ]);
		}

		if(this.filterAuthor!=-1){
			this.search_data.push([ "author" , this.filterAuthor ]);
		}

		this.showlist();
	},

    /*------------ 获取所有根项目信息 ------------*/
	search_data:[],
	page:1,//第几页
	reqnum:5,//每页显示多少条
	order:"id",//排序字段
	desc:1,//反序,0或空正常排序，1反序
	page_nums:0,//总页数
	
	
    showlist : function(){
		var data_area=[];
		data_area.push([ "page" , page.page ]);
		data_area.push([ "reqnum" , page.reqnum ]);
		data_area.push([ "order" , page.order ]);
		data_area.push([ "desc" , page.desc ]);
		if(this.search_data.length>0)
			data_area=data_area.concat(this.search_data);
		
		var data_str=functions.requestToString(data_area);
        $.ajax({
                url: cgipath+'page-showlist', type: 'POST',data: data_str,dataType: 'json', timeout: ajax_timeout,error: function(){notify.show(2,"请求数据失败，请刷新页面");},
                success:this.handleShowlist
        });
    },
	
     handleShowlist : function(feedback){
	
        if(feedback.ret=="0"){
			//console.log(feedback.listdata);
            //显示页面列表
            var listdata=feedback.listdata;
			var innerhtml="";
            for(var i=0;i<listdata.length;i++){
                innerhtml+="<tr>";
				innerhtml+="<td></td>";
				if(listdata[i].img!="")
					img=cgipath+listdata[i].img;
				else
					img="css/sample/empty.png";
				innerhtml+="<td class=\"td_thumbnails\"><div class=\"img_wrap\"><a href=\""+(cgipath+listdata[i].id)+"?"+Math.floor(Math.random()*10000)+"\" target=\"_blank\" title=\""+listdata[i].info+"\"><img src=\""+img+"?"+Math.floor(Math.random()*10000)+"\" alt=\"\"></a><span class=\"module_name\">"+listdata[i].name+"</span></div></td>";
				innerhtml+="<td>"+listdata[i].tag+"</td>";
				innerhtml+="<td>"+listdata[i].author+"</td>";
				innerhtml+="<td>"+listdata[i].comment_count+"</td>";
				innerhtml+="<td>"+listdata[i].praise+"</td>";
				innerhtml+="<td><span class=\"txt_auxiliary\">"+functions.getLocalTime(listdata[i].build_time);
				if(listdata[i].adjust_time!="0")innerhtml+="<br />"+functions.getLocalTime(listdata[i].adjust_time)
				innerhtml+="</span></td>";
				innerhtml+="<td>";
				innerhtml+="<a href=\"page.htm?action=edit&id="+listdata[i].id+"\"><i class=\"ico ico_edit\"></i>修改</a> ";
				innerhtml+="<a href='javascript:void(0);' class=\"op_sub_href\" onclick=\"page.delConfirm("+listdata[i].id+");\" ><i class=\"ico ico_del\"></i>删除</a></td>";
				innerhtml+="</tr>";
            }
			//翻页组件
			page.page_nums=Math.ceil(feedback.nums/page.reqnum);
			if(page.page_nums<page.page)page.page=page.page_nums;//防止page_nums等于0的情况
			$("#page_nums").html(page.page+"/"+page.page_nums);
			if(page.page==1)
				$("#page_up").removeClass("ico_page_left").addClass("ico_page_left_n");
			else
				$("#page_up").removeClass("ico_page_left_n").addClass("ico_page_left");
			if(page.page_nums==page.page)
				$("#page_down").removeClass("ico_page_right").addClass("ico_page_right_n");
			else
				$("#page_down").removeClass("ico_page_right_n").addClass("ico_page_right");
				
			$("#page_list").html(innerhtml);
        }
        else{
             message.show("message_div","",feedback.msg,4);
        }
    },
	
	list_page:function(t,order){
		if(order!=undefined && order!="")
		{
			page.order=order;
			if(page.desc*1==1)page.desc=0;
			else page.desc=1;
		}
	
		page.page=page.page-(-1)*t;
		if(page.page<=0)page.page=1;
		else if(page.page>page.page_nums) page.page=page.page_nums;
		page.showlist();
	},
	
	category_data:[],
	loadCategory:function(){
		var data_area=[];
		var data_str=functions.requestToString(data_area);
        $.ajax({
                url: cgipath+'category-showlist',type: 'POST',data: data_str,dataType: 'json',timeout: ajax_timeout,error: function(){notify.show(2,"请求数据失败，请刷新页面");},
                success:function(feedback){
					page.category_data=feedback.listdata;
					page.categoryShow();
					page.addInit();
				}
        });
	},
	
	/*------------ 显示分类信息 ------------*/
     categoryShow : function(){
		//显示父项目列表
		var ul="<ul>";
		for(var i=0;i<page.category_data.length;i++){
			ul+="<li><a onclick=\"page.categorySet("+page.category_data[i].id+",'"+page.category_data[i].name+"')\" name=\""+page.category_data[i].name+"\" href=\"javascript:void(0);\">"+page.category_data[i].name+"</a></li>";
		}
		ul+="</ul>";
		$("#category_id_list").html(ul);
		$(".like_select").click(function(){$(this).parent().find('.select_drop_down').css({visibility: "visible",display: "none"}).show();});
		$(".type_select").hover(
			function(){},
			function(){$(this).find('.select_drop_down').hide();}
		);
    },
	categorySet:function(id,name){
		$("#category_id").val(id);
		$("#category_id_show").text(name);
		$("#category_id_list").hide();

	},
	

	commentShowlist : function(){
		var data_area=[];
		data_area.push([ "page_id" , page_id ]);
		var data_str=functions.requestToString(data_area);
        $.ajax({
            url: cgipath+'comment-showlist', type: 'POST',data: data_str,dataType: 'json', timeout: ajax_timeout,error: function(){notify.show(2,"请求数据失败，请刷新页面");},
            success:this.handlecommentShowlist
        });
    },
	
     handlecommentShowlist : function(feedback){
	
        if(feedback.ret=="0"){
            //显示页面列表
            var listdata=feedback.listdata;
			var innerhtml="";
            for(var i=0;i<listdata.length;i++){
                innerhtml+="<div>";
				innerhtml+="<span class=\"name\">"+listdata[i].author+"</span>";
				innerhtml+="<span class=\"time\">"+functions.getLocalTime(listdata[i].build_time)+"</span>";
				innerhtml+="</div>";
				innerhtml+="<div class=\"content\">"+listdata[i].content+"</div>";
            }

			$("#comment_list").html(innerhtml);
        }
        else{
             message.show("message_div","",feedback.msg,4);
        }
    },
	commentSave:function(){
		notify.show(1,"正在保存，请稍候...");
		var data_area=[];
		data_area.push([ "content" , $('#comment_ct').val() ]);
		data_area.push([ "page_id" , page_id ]);
		var data_str=functions.requestToString(data_area);
        $.ajax({
            url:cgipath + 'comment-add',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:this.handleCommentAdd
        });
	},
	handleCommentAdd : function (feedback){
		notify.close();
        if(feedback.ret=="0"){
			message.show("message_div","","添加成功",3,"","page.commentShowlist()");
        }
        else{
            message.show("message_div","",feedback.msg,4);
        }
    },
    /*------------ 添加 ------------*/
    praise : function(){
        notify.show(1,"正在保存，请稍候...");
		var data_area=[];
		data_area.push([ "page_id" , page_id ]);
		var data_str=functions.requestToString(data_area);
        $.ajax({
            url:cgipath + 'page-praise',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:this.handlePraise
        });
    },

    handlePraise : function (feedback){
		notify.close();
        if(feedback.ret=="0"){
			message.show("message_div","","赞成功",3,"","page.edit()");
        }
        else{
            message.show("message_div","",feedback.msg,4);
        }
    },
    /*------------ 添加 ------------*/
    add : function(){
        notify.show(1,"正在保存，请稍候...");
		var data_area=[];
		data_area.push([ "name" , $('#name').val() ]);
		data_area.push([ "info" , $('#info').val() ]);
		data_area.push([ "content" , $('#content').val() ]);
		data_area.push([ "category_id" , $('#category_id').val() ]);
		data_area.push([ "tag" , $('#tag').val() ]);
		data_area.push([ "demo" , $('#demo').val() ]);
		data_area.push([ "img" , $('#src_present').val() ]);

		var data_str=functions.requestToString(data_area);
        $.ajax({
            url:cgipath + 'page-add',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:this.handleAdd
        });
    },

    handleAdd : function (feedback){
		notify.close();
        if(feedback.ret=="0"){
			message.show("message_div","","添加成功",3,"","window.location.href='page_list.htm'");
        }
        else{
            message.show("message_div","",feedback.msg,4);
			$("#btn_save").removeClass("btn_dis").addClass("btn_ok");
			$("#btn_save").unbind("click").click(function(){page.add();});
        }
    },
	
	/*------------ 编辑 ------------*/
    edit : function(){
		var data_area=[];
		data_area.push([ "id" , page_id ]);
		var data_str=functions.requestToString(data_area);
        $.ajax({
                url: cgipath+'page-getinfo',type: 'POST',data: data_str,dataType: 'json',timeout: ajax_timeout,error: function(){notify.show(2,"请求数据失败，请刷新页面");},
                success:this.handleedit
        });
    },

     handleedit : function(feedback){
        if(feedback.ret=="0"){
            var record=feedback.record;
			$("#name").val(record.name);
			$("#info").val(record.info);
			$("#content").html(record.content);
			$("#tag").val(record.tag);
			$("#demo").val(record.demo);
			$("#category_id").val(record.category_id);
			$("#category_id_show").text(record.category_name);
			if(record.img!="")
				$("#img_preview").html("<img src=\""+cgipath+record.img+"?"+Math.floor(Math.random()*10000)+"\" />");
			$("#praise_num").text("("+record.praise+")");

        }
        else{
            message.show("message_div","",feedback.msg,4);
        }
    },
	/*------------ 保存一个项目 ------------*/
	update : function(){
		notify.show(1,"正在保存，请稍候...");
		$("#btn_save").unbind("click");
		$("#btn_save").removeClass("btn_ok").addClass("btn_dis");

		var data_area=[];
		data_area.push([ "id" , page_id ]);
		data_area.push([ "name" , $('#name').val() ]);
		data_area.push([ "info" , $('#info').val() ]);
		data_area.push([ "content" , $('#content').val() ]);
		data_area.push([ "category_id" , $('#category_id').val() ]);
		data_area.push([ "tag" , $('#tag').val() ]);
		data_area.push([ "demo" , $('#demo').val() ]);
		data_area.push([ "img" , $('#src_present').val() ]);

		var data_str=functions.requestToString(data_area);
        $.ajax({
            url:cgipath + 'page-update',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:this.handleUpdate
        });
    },

    handleUpdate : function (feedback){
		notify.close();
        if(feedback.ret=="0"){
			message.show("message_div","","保存成功",3,"","");
			$("#btn_save").removeClass("btn_dis").addClass("btn_ok");
			$("#btn_save").click(function(){page.update();});
        }
        else{
            message.show("message_div","",feedback.msg,4);
			$("#btn_save").removeClass("btn_dis").addClass("btn_ok");
			$("#btn_save").click(function(){page.update();});
        }
    },
	

	 /*------------ 删除项目 ------------*/
	 
	delConfirm:function(id){
		message.show("message_div","","确实要删除吗？",2,"","page.del("+id+");");
	},
	
    del : function(id){
		var data_str="&id="+id;
        $.ajax({
            url:cgipath + 'page-del',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:this.handledel
        });
    },

    handledel : function (feedback){
        if(feedback.ret=="0"){
            message.show("message_div","","删除成功",3,"","window.location.reload();");
        }
        else{
            message.show("message_div","",feedback.msg,4);
        }
    },
	
	
	
	
    endline:0
}



function html_set(t){
	var add_data="";
	if(t=='tab')add_data="\t";
	else if(t=='obj_div')add_data="<div class=\"\">\n\t<div class=\"hd\"></div>\n\t<div class=\"bd\"></div>\n\t<div class=\"ft\"></div>\n</div>";
	else if(t=='div')add_data="<div></div>";
	else if(t=='span')add_data="<span></span>";
	else if(t=='p')add_data="<p></p>";
	else if(t=='class')add_data=" class=\"\" ";
	else if(t=='ul')add_data="<ul><li></li></ul>";
	else if(t=='img')add_data="<img src=\"\" />";
	else if(t=='table')add_data="<table><tr><td></td></tr></table>";
	else if(t=='a')add_data="<a href=\"#\"></a>";
	else if(t=='place')add_data="<img src=\""+cgipath+"img.php?100x100\" />";
	if(t==2)add_data="<div class=\"\"></div>";
	functions.textareaInsertText($('#html')[0],add_data);
}


function html_add(t){
	var add_data="";
	if(t==0)add_data=" data_container=1 ";
	else if(t==1)add_data="{visible name=\"name\"}";
	else if(t==2)add_data="{/visible}";
	else if(t==3)add_data="{loop name=\"name\"}";
	else if(t==4)add_data="{/loop}";
	functions.textareaInsertText($('#html')[0],add_data);
}

function html_more(){
	$("#page_attr_more").show();
}





function dodrop(event)
{
	var dt = event.dataTransfer;
	var img=dt.files[0];
	var innterhtml="";
	var file_data="";
		if(img.type.indexOf("image")>=0){
			var data_flag=true;
			
			var imageReader = new FileReader();
			imageReader.onload = (function(aFile) {
			  return function(e) {
					file_data=e.target.result;
					$("#img_preview").html("<img class=\"pick_img_preview\" src=\""+file_data+"\" />");
					$("#src_present").val(file_data);
			  };
			})(img);
			imageReader.readAsDataURL(img);
		}
		else{
			alert("上传的文件不是图片");
		}

}


