/*
 * Copy Right: Tencent ISUX
 * category: QAM（Qzone模块化页面搭建平台）
 * Description: 页面管理
 * Author: kundy
 * date: 2012-10-23
 */

var resource_id=functions.getRequest("id")*1;
var resource_action=functions.getRequest("action");


var resource = {
	init:function(){
		$("#btn_add").click(function(){window.location.href="resource.htm"});
		$("#page_up").click(function(){resource.list_page(-1);});
		$("#page_down").click(function(){resource.list_page(1);});
		
		$("#search_btn").click(function(){resource.search();});

		$(".like_select").click(function(){$(this).parent().find('.select_drop_down').css({visibility: "visible",display: "none"}).show();});
		$(".type_select").hover(
			function(){},
			function(){$(this).find('.select_drop_down').hide();}
		);
		
		$("#filter_status_list a").click(function(){
			$('#filter_status_list').hide();
			$('#status_name').text($(this).attr("name"));
		});

		$("#filter_user_list a").click(function(){
			$('#filter_user_list').hide();
			$('#user_type_name').text($(this).attr("name"));
		});

	},
	addInit:function(){
		if(resource_action=="edit"){
			resource.edit();
			$("#btn_save").unbind("click").click(function(){resource.update();});
			$('#resource_title').html("修改资源");
		}
		else{

			$("#btn_save").unbind("click").click(function(){resource.add();});
			$('#resource_title').html("添加资源");
		}

		$("#btn_cancel").click(function(){window.location.href="resource_list.htm"});

	},



	filterStatus:"",

	filterStatusSet:function(t){
		this.filterStatus=t;
		this.filter();
	},

	filterUser:"",

	filterUserSet:function(t){
		this.filterUser=t;
		this.filter();
	},

	filter:function(){
		this.search_data=[];
		this.page=1;
		this.search_data.push([ "search_flag" , 0 ]);

		if(this.filterStatus!=-1){
			this.search_data.push([ "status" , this.filterStatus ]);
		}

		if(this.filterUser==1){
			this.search_data.push([ "author" , cookie.get("name") ]);
		}
		else if(this.filterUser==2){
			this.search_data.push([ "claimer" , cookie.get("name") ]);
		}

		this.showlist();
	},

	search:function(){
		this.search_data=[];
		this.page=1;
		var search_text=$("#search_text").val();
		this.search_data.push([ "search_flag" , 1 ]);
		this.search_data.push([ "search_data" , search_text ]);
		this.showlist();
	},
	

	list_page:function(t,order){
		if(order!=undefined && order!="")
		{
			resource.order=order;
			if(resource.desc*1==1)resource.desc=0;
			else resource.desc=1;
		}
	
		resource.page=resource.page-(-1)*t;
		if(resource.page<=0)resource.page=1;
		else if(resource.page>resource.page_nums) resource.page=resource.page_nums;
		resource.showlist();
	},

	
    /*------------ 获取所有根项目信息 ------------*/
	search_data:[],
	page:1,//第几页
	reqnum:10,//每页显示多少条
	order:"id",//排序字段
	desc:1,//反序,0或空正常排序，1反序
	page_nums:0,//总页数
	
	
    showlist : function(){
		var data_area=[];
		data_area.push([ "page" , resource.page ]);
		data_area.push([ "reqnum" , resource.reqnum ]);
		data_area.push([ "order" , resource.order ]);
		data_area.push([ "desc" , resource.desc ]);
		if(this.search_data.length>0)
			data_area=data_area.concat(this.search_data);
		var data_str=functions.requestToString(data_area);
        $.ajax({
                url: cgipath+'resource-showlist', type: 'POST',data: data_str,dataType: 'json', timeout: ajax_timeout,error: function(){notify.show(2,"请求数据失败，请刷新页面");},
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
				innerhtml+="<td><a href=\""+listdata[i].url+"\"  title=\""+listdata[i].info+"\">"+listdata[i].name+"</a></td>";
				innerhtml+="<td>"+listdata[i].author+"</td>";
				innerhtml+="<td>"+functions.getLocalTime(listdata[i].build_time)+"</td>";
				innerhtml+="<td>"+listdata[i].claimer+"</td>";
				innerhtml+="<td>"+functions.getLocalTime(listdata[i].claim_time)+"</td>";
				if(listdata[i].page_id!=0)
					innerhtml+="<td><a href=\"page.htm?action=edit&id="+listdata[i].page_id+"\">"+listdata[i].page_id+"</a></td>";
				else
					innerhtml+="<td></td>";
				innerhtml+="<td>"+listdata[i].status+"</td>";
				innerhtml+="<td>";
				innerhtml+="<a onclick=\"resource.claim("+listdata[i].id+")\">认领</a> ";
				innerhtml+="<a onclick=\"resource.claimCancel("+listdata[i].id+")\">取消认领</a> ";
				innerhtml+="<a onclick=\"resource.finish("+listdata[i].id+")\">完成</a> <br />";
				innerhtml+="<a href=\"resource.htm?action=edit&id="+listdata[i].id+"\"><i class=\"ico ico_edit\"></i>修改</a> ";
				innerhtml+="<a href='javascript:void(0);' class=\"op_sub_href\" onclick=\"resource.delConfirm("+listdata[i].id+");\" ><i class=\"ico ico_del\"></i>删除</a></td>";
				innerhtml+="</tr>";
            }
			//翻页组件
			resource.page_nums=Math.ceil(feedback.nums/resource.reqnum);
			if(resource.page_nums<resource.page)resource.page=resource.page_nums;//防止resource_nums等于0的情况
			$("#page_nums").html(resource.page+"/"+resource.page_nums);
			if(resource.page==1)
				$("#resource_up").removeClass("ico_resource_left").addClass("ico_resource_left_n");
			else
				$("#resource_up").removeClass("ico_resource_left_n").addClass("ico_resource_left");
			if(resource.page_nums==resource.page)
				$("#resource_down").removeClass("ico_resource_right").addClass("ico_resource_right_n");
			else
				$("#resource_down").removeClass("ico_resource_right_n").addClass("ico_resource_right");
				
			$("#resource_list").html(innerhtml);
        }
        else{
             message.show("message_div","",feedback.msg,4);
        }
    },
	list_page:function(t,order){
		if(order!=undefined && order!="")
		{
			resource.order=order;
			if(resource.desc*1==1)resource.desc=0;
			else resource.desc=1;
		}
	
		resource.page=resource.page-(-1)*t;
		if(resource.page<=0)resource.page=1;
		else if(resource.page>resource.page_nums) resource.page=resource.page_nums;
		resource.showlist();
	},
	
	/*------------ 认领 ------------*/
    claim : function(id){
        notify.show(1,"正在操作，请稍候...");
		var data_area=[];
		data_area.push([ "id" , id ]);
		var data_str=functions.requestToString(data_area);
        $.ajax({
            url:cgipath + 'resource-claim',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:function(feedback){
				notify.close();
				if(feedback.ret=="0"){
					message.show("message_div","","认领成功",3,"","resource.showlist()");
				}
				else{
					message.show("message_div","",feedback.msg,4);
				}
			
			}
        });
    },
	/*------------ 取消认领 ------------*/
    claimCancel : function(id){
        notify.show(1,"正在操作，请稍候...");
		var data_area=[];
		data_area.push([ "id" , id ]);
		var data_str=functions.requestToString(data_area);
        $.ajax({
            url:cgipath + 'resource-claimCancel',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:function(feedback){
				notify.close();
				if(feedback.ret=="0"){
					message.show("message_div","","取消认领成功",3,"","resource.showlist()");
				}
				else{
					message.show("message_div","",feedback.msg,4);
				}
			
			}
        });
    },
	/*------------ 认领 ------------*/
    finish : function(id){
        notify.show(1,"正在操作，请稍候...");
		var data_area=[];
		data_area.push([ "id" , id ]);
		var data_str=functions.requestToString(data_area);
        $.ajax({
            url:cgipath + 'resource-finish',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:function(feedback){
				notify.close();
				if(feedback.ret=="0"){
					message.show("message_div","","操作成功",3,"","resource.showlist()");
				}
				else{
					message.show("message_div","",feedback.msg,4);
				}
			
			}
        });
    },
    /*------------ 添加 ------------*/
    add : function(){
        notify.show(1,"正在保存，请稍候...");
		var data_area=[];
		data_area.push([ "url" , $('#url').val() ]);
		data_area.push([ "info" , $('#info').val() ]);
		data_area.push([ "name" , $('#name').val() ]);
		
		var data_str=functions.requestToString(data_area);
        $.ajax({
            url:cgipath + 'resource-add',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:this.handleAdd
        });
    },

    handleAdd : function (feedback){
		notify.close();
        if(feedback.ret=="0"){
			message.show("message_div","","添加成功",3,"","window.location.href='resource_list.htm'");
        }
        else{
            message.show("message_div","",feedback.msg,4);
			$("#btn_save").removeClass("btn_dis").addClass("btn_ok");
			$("#btn_save").unbind("click").click(function(){resource.add();});
        }
    },
	
	/*------------ 编辑 ------------*/
    edit : function(){
		var data_area=[];
		data_area.push([ "id" , resource_id ]);
		var data_str=functions.requestToString(data_area);
        $.ajax({
                url: cgipath+'resource-getinfo',type: 'POST',data: data_str,dataType: 'json',timeout: ajax_timeout,error: function(){notify.show(2,"请求数据失败，请刷新页面");},
                success:this.handleedit
        });
    },

     handleedit : function(feedback){
        if(feedback.ret=="0"){
            var record=feedback.record;
			$("#url").val(record.url);
			$("#info").val(record.info);
			$("#name").val(record.name);
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
		data_area.push([ "id" , resource_id ]);
		data_area.push([ "url" , $('#url').val() ]);
		data_area.push([ "info" , $('#info').val() ]);
		data_area.push([ "name" , $('#name').val() ]);

		var data_str=functions.requestToString(data_area);
        $.ajax({
            url:cgipath + 'resource-update',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:this.handleUpdate
        });
    },

    handleUpdate : function (feedback){
		notify.close();
        if(feedback.ret=="0"){
			message.show("message_div","","保存成功",3,"","window.location.href='resource_list.htm'");

        }
        else{
            message.show("message_div","",feedback.msg,4);
			$("#btn_save").removeClass("btn_dis").addClass("btn_ok");
			$("#btn_save").click(function(){resource.update();});
        }
    },
	

	 /*------------ 删除项目 ------------*/
	 
	delConfirm:function(id){
		message.show("message_div","","确实要删除吗？",2,"","resource.del("+id+");");
	},
	
    del : function(id){
		var data_str="&id="+id;
        $.ajax({
            url:cgipath + 'resource-del',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
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
	$("#resource_attr_more").show();
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
