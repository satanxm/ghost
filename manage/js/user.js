/*
 * Copy Right: Tencent ISUX
 * Project: QAM（Qzone模块化页面搭建平台）
 * Description: 用户、用户组、权限管理
 * Author: kundy
 * date: 2011-12-21
 */
parent.nav_set(8);
 
var user = {
	init:function(){
		$("#btn_add").click(function(){user.addInit();});
		$("#page_up").click(function(){user.list_page(-1);});
		$("#page_down").click(function(){user.list_page(1);});
		$("#search_btn").click(function(){user.search();});
	},
	
	/*------------ 检查用户输入的项目名称 ------------*/
    checkName : function(name){
		var data_area=[];
		data_area.push([ "name" , name ]);
		var data_str=functions.requestToString(data_area);
		
        $.ajax({
                url: cgipath+'group-checkName',type: 'POST', data: data_str, dataType: 'json',timeout: ajax_timeout, error: function(){notify.show(2,"请求数据失败，请刷新页面");},
				success:this.handelcheckName
        });
    },

    handelcheckName : function(feedback){
		//ret=0：已存在项目名称
        if(feedback.ret=="0"){
			$("#fhint_area_name").show();
			$("#fhint_area_name").removeClass('fhint_succeed').addClass('fhint_error');
			$("#fhint_ico").removeClass('ico_succeed').addClass('ico_error');
			$("#fhint_text").text("亲，项目名称已存在了，换一个吧");
			
        }
        else if(feedback.ret=="3"){
           $("#fhint_area_name").show();
		   $("#fhint_area_name").removeClass('fhint_error').addClass('fhint_succeed');
		   $("#fhint_ico").removeClass('ico_error').addClass('ico_succeed');
		   $("#fhint_text").text("亲，这个名字起不错！");
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
	
	
    /*------------ 获取所有权限信息 ------------*/
	search_data:[],
	page:1,//第几页
	reqnum:10,//每页显示多少条
	order:"id",//排序字段
	desc:1,//反序,0或空正常排序，1反序
	page_nums:0,//总页数
	
	
    showlist : function(){
		var data_area=[];
		data_area.push([ "page" , user.page ]);
		data_area.push([ "reqnum" , user.reqnum ]);
		data_area.push([ "order" , user.order ]);
		data_area.push([ "desc" , user.desc ]);
		if(this.search_data.length>0)
			data_area=data_area.concat(this.search_data);
		
		var data_str=functions.requestToString(data_area);
        $.ajax({
                url: cgipath+'user-showlist', type: 'POST',data: data_str,dataType: 'json', timeout: ajax_timeout,error: function(){notify.show(2,"请求数据失败，请刷新页面");},
                success:this.handleshowlist
        });
    },
	
     handleshowlist : function(feedback){
        if(feedback.ret=="0"){
            //显示项目列表
            var listdata=feedback.listdata;
			innerhtml="";
            for(var i=0;i<listdata.length;i++){
				innerhtml+="<tr id=\"tr_"+listdata[i].id+"\">";
				innerhtml+="<td><input type=\"checkbox\"></td>";
				innerhtml+="<td><img src=\""+cgipath+listdata[i].avatar+"\" alt=\"\" class=\"avatar\">"+functions.HtmlEncode(listdata[i].name)+"</td>";
				innerhtml+="<td>";
				if(listdata[i].oa_flag*1==1)innerhtml+="<i class=\"ico ico_oa\"></i>";
				innerhtml+=functions.HtmlEncode(listdata[i].nick)+"</td>";
				innerhtml+="<td>******</td>";
				innerhtml+="<td>"+listdata[i].groupname+"</td>";
				innerhtml+="<td><span class=\"txt_auxiliary\">"+listdata[i].sign_time+"</span></td>";
				innerhtml+="<td><span class=\"txt_auxiliary\">"+listdata[i].last_login_time+"</span></td>";
				innerhtml+="<td>";
				if(listdata[i].oa_flag*1==1)innerhtml+="<a href=\"javascript:void(0)\" onclick=\"user.updateImg("+listdata[i].id+")\"><i class=\"ico ico_update\"></i>更新头像</a>";
				innerhtml+="<a href=\"javascript:void(0)\" onclick=\"user.edit("+listdata[i].id+")\"><i class=\"ico ico_edit\"></i>修改</a><a href=\"javascript:void(0)\" onclick=\"user.delConfirm("+listdata[i].id+")\"><i class=\"ico ico_del\"></i>删除</a></td>";
				innerhtml+="</tr>";
			}
			//翻页组件
			user.page_nums=Math.ceil(feedback.nums/user.reqnum);
			if(user.page_nums<user.page)user.page=user.page_nums;//防止page_nums等于0的情况
			$("#page_nums").html(user.page+"/"+user.page_nums);
			if(user.page==1)
				$("#page_up").removeClass("ico_page_left").addClass("ico_page_left_n");
			else
				$("#page_up").removeClass("ico_page_left_n").addClass("ico_page_left");
			if(user.page_nums==user.page)
				$("#page_down").removeClass("ico_page_right").addClass("ico_page_right_n");
			else
				$("#page_down").removeClass("ico_page_right_n").addClass("ico_page_right");
				
			$("#list_area").html(innerhtml);
        }
        else{
             message.show("message_div","",feedback.msg,4);
        }
    },
	
	list_page:function(t,order){
		if(order!=undefined && order!="")
		{
			user.order=order;
			if(user.desc*1==1)user.desc=0;
			else user.desc=1;
		}
	
		user.page=user.page-(-1)*t;
		if(user.page<=0)user.page=1;
		else if(user.page>user.page_nums) user.page=user.page_nums;
		user.showlist();
	},

	/*------------ 添加前的表单------------*/
    addInit : function(){
		if(typeof($("#tr_0")[0])=="undefined"){
		
			//先得到grouplist
			var group_list_str="<ul>";
			for(var i=0;i<group.group_data.length;i++){
				group_list_str+="<li><a onclick=\"user.chooseGroup(0,'"+group.group_data[i].id+"','"+group.group_data[i].name+"')\"  href=\"javascript:void(0);\">"+group.group_data[i].name+"</a></li>";
			}
			group_list_str+="</ul>";
					
			var innerhtml="<tr id=\"tr_0\">";
			innerhtml+="<td></td>";
			innerhtml+="<td><input class=\"inputstyle\" type=\"text\" value=\"\" id=\"name_0\" ></td>";
			innerhtml+="<td><input class=\"inputstyle\" type=\"text\" value=\"\" id=\"nick_0"+"\" ></td>";
			innerhtml+="<td><input class=\"inputstyle\" type=\"password\" value=\"\" id=\"passwd_0"+"\" ></td>";
			//组下拉框
			innerhtml+="<td><div class=\"type_select\"><div class=\"like_select\"><input type=\"hidden\" value=\"\" id=\"usergroup_0\" /><p id=\"group_0\">请选择</p><span class=\"icon_down\"></span></div><div class=\"select_drop_down\"  id=\"group_list_0\" style=\"visibility:hidden\">"+group_list_str+"</div></div></td>";
			innerhtml+="<td></td>";
			innerhtml+="<td></td>";
			innerhtml+="<td><a href=\"javascript:void(0)\" onclick=\"user.add()\"><i class=\"ico ico_edit\"></i>保存</a><a href=\"javascript:void(0)\" onclick=\"user.show(0)\"><i class=\"ico ico_del\"></i>取消</a></td>";
			innerhtml+="</tr>";
			$("#list_area").append(innerhtml);
			$(".like_select").click(
				function(){$(this).parent().find('.select_drop_down').css({visibility: "visible",display: "none"}).slideDown(300);}
			);
			$(".type_select").hover(
				function(){},
				function(){$(this).find('.select_drop_down').delay(1000).slideUp(300);}
			);
		}
    },
	
	
    /*------------ 添加 ------------*/
    add : function(){
		var data_area=[];
		data_area.push([ "name" , $('#name_0').val() ]);
		data_area.push([ "nick" , $('#nick_0').val() ]);
		data_area.push([ "usergroup" , $('#usergroup_0').val() ]);
		data_area.push([ "passwd" , hex_md5($('#passwd_0').val()) ]);
		var data_str=functions.requestToString(data_area);
        $.ajax({
            url:cgipath + 'user-add',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:function(feedback){
				if(feedback.ret=="0"){
					message.show("message_div","提示","保存成功",3,378);
					user.showlist();
				}
				else{
					message.show("message_div","",feedback.msg,4);
				}
			}
        });
    },
	
	chooseGroup : function(id,group_id,group_name){
		 $('#group_'+id).html(group_name);
		 $('#usergroup_'+id).val(group_id);
		 $('#group_list_'+id).hide();
    },
	 /*------------ 获取并编辑一条信息 ------------*/
	 
	 /*------------ 获取并编辑一条信息 ------------*/
    edit : function(id){
		var data_str="&id="+id;
        $.ajax({
            url:cgipath + 'user-getinfo',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:function(feedback){
				if(feedback.ret=="0"){
					var record=feedback.record;
					
					//先得到grouplist
					var group_list_str="<ul>";
					for(var i=0;i<group.group_data.length;i++){
						group_list_str+="<li><a onclick=\"user.chooseGroup("+record.id+",'"+group.group_data[i].id+"','"+group.group_data[i].name+"')\"  href=\"javascript:void(0);\">"+group.group_data[i].name+"</a></li>";
					}
					group_list_str+="</ul>";
			
					
					var innerhtml="";
					innerhtml+="<td></td>";
					innerhtml+="<td><input class=\"inputstyle\" type=\"text\" value=\""+record.name+"\" id=\"name_"+id+"\" ></td>";
					innerhtml+="<td><input class=\"inputstyle\" type=\"text\" value=\""+record.nick+"\" id=\"nick_"+id+"\" ></td>";
					if(record.oa_flag==1)
						innerhtml+="<td></td>";
					else
						innerhtml+="<td><input class=\"inputstyle\" type=\"password\" value=\"\" id=\"passwd_"+id+"\" ></td>";
					//组下拉框
					innerhtml+="<td><div class=\"type_select\"><div class=\"like_select\"><input type=\"hidden\" value=\""+record.usergroup+"\" id=\"usergroup_"+record.id+"\" /><p id=\"group_"+record.id+"\">"+record.groupname+"</p><span class=\"icon_down\"></span></div><div class=\"select_drop_down\"  id=\"group_list_"+record.id+"\" style=\"visibility:hidden\">"+group_list_str+"</div></div></td>";
					innerhtml+="<td><span class=\"txt_auxiliary\">"+record.last_login_time+"</span></td>";
					innerhtml+="<td><span class=\"txt_auxiliary\"></span></td>";
					innerhtml+="<td><a href=\"javascript:void(0)\" onclick=\"user.update("+record.id+")\"><i class=\"ico ico_edit\"></i>保存</a><a href=\"javascript:void(0)\" onclick=\"user.show("+record.id+")\"><i class=\"ico ico_del\"></i>取消</a></td>";
					$("#tr_"+id).html(innerhtml);
					
					$(".like_select").click(
						function(){$(this).parent().find('.select_drop_down').css({visibility: "visible",display: "none"}).slideDown(300);}
					);
					$(".type_select").hover(
						function(){},
						function(){$(this).find('.select_drop_down').delay(1000).slideUp(300);}
					);
						
				}
				else{
					message.show("message_div","",feedback.msg,4);
				}
			
			}
        });
    },
	
	/*------------ 保存 ------------*/
    update : function(id){
		var data_area=[];
		data_area.push([ "id" , id ]);
		data_area.push([ "name" , $('#name_'+id).val() ]);
		data_area.push([ "nick" , $('#nick_'+id).val() ]);
		data_area.push([ "usergroup" , $('#usergroup_'+id).val() ]);
		if(typeof($('#passwd_'+id)[0])=="object" && $('#passwd_'+id).val()!="" )data_area.push([ "passwd" , hex_md5($('#passwd_'+id).val()) ]);
		var data_str=functions.requestToString(data_area);
        $.ajax({
            url:cgipath + 'user-update',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:function(feedback){
				if(feedback.ret=="0"){
					message.show("message_div","提示","保存成功",3,378);
					user.show(id);
				}
				else{
					message.show("message_div","",feedback.msg,4);
				}
			}
        });
    },
	
	/*------------ 更新头像 ------------*/
    updateImg : function(id){
		var data_area=[];
		data_area.push([ "id" , id ]);
		var data_str=functions.requestToString(data_area);
        $.ajax({
            url:cgipath + 'user-updateImg',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:function(feedback){
				if(feedback.ret=="0"){
					message.show("message_div","提示","更新成功",3,378);
					user.show(id);
				}
				else{
					message.show("message_div","",feedback.msg,4);
				}
			}
        });
    },
	

	/*------------ 获取并显示一条项目信息 ------------*/
    show : function(id){
		if(id>0){
			var data_str="&id="+id;
			$.ajax({
				url:cgipath + 'user-getinfo',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
				success:function(feedback){
					if(feedback.ret=="0"){
						var innerhtml="";
						record=feedback.record;
						innerhtml+="<td><input type=\"checkbox\"></td>";
						innerhtml+="<td><img src=\""+cgipath+record.avatar+"\" alt=\"\" class=\"avatar\">"+functions.HtmlEncode(record.name)+"</td>";
						innerhtml+="<td>";
						if(record.oa_flag*1==1)innerhtml+="<i class=\"ico ico_oa\"></i>";
						innerhtml+=functions.HtmlEncode(record.nick)+"</td>";
						innerhtml+="<td>******</td>";
						innerhtml+="<td>"+record.groupname+"</td>";
						innerhtml+="<td><span class=\"txt_auxiliary\">"+record.last_login_time+"</span></td>";
						innerhtml+="<td><span class=\"txt_auxiliary\"></span></td>";
						innerhtml+="<td>";
						if(record.oa_flag*1==1)innerhtml+="<a href=\"javascript:void(0)\" onclick=\"user.updateImg("+record.id+")\"><i class=\"ico ico_edit\"></i>更新头像</a>";
						innerhtml+="<a href=\"javascript:void(0)\" onclick=\"user.edit("+record.id+")\"><i class=\"ico ico_edit\"></i>修改</a><a href=\"javascript:void(0)\" onclick=\"user.delConfirm("+record.id+")\"><i class=\"ico ico_del\"></i>删除</a></td>";
						$("#tr_"+id).html(innerhtml);
					}
					else{
						message.show("message_div","",feedback.msg,4);
					}
				
				}
			});
		}
		else{
			$("#tr_"+0).remove();
		}
    },
	
	 /*------------ 删除项目 ------------*/
	 
	delConfirm:function(id){
		message.show("message_div","","确实要删除吗？",2,"","user.del("+id+");");
	},
	
    del : function(id){
		var data_str="&id="+id;
        $.ajax({
            url:cgipath + 'user-del',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
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
    }
	
}



 
 
function choose_group(obj){
	var child_index=$(obj).attr("list_child_id");
	if(obj.checked)
		$("#list_child_"+child_index).find("input").attr('checked', "");
	else
		$("#list_child_"+child_index).find("input").removeAttr('checked');
}

function check_group_name(name){
	if(name==""){
		$("#fhint_area_name").show();
		$("#fhint_area_name").removeClass('fhint_succeed').addClass('fhint_error');
		$("#fhint_ico").removeClass('ico_succeed').addClass('ico_error');
		$("#fhint_text").text("亲，项目名称要填的");
	}
	else
		group.checkName(name);
}


var group_id=functions.getRequest("id")*1;
var group_action=functions.getRequest("action");


var group = {
	init:function(){
		$("#btn_cancel").click(function(){window.location.href="usergroup_permission_2.htm"});
		$("#name").mouseout(function () {
			this.value=this.value.replace(/\s/g,'');
		});
		$("#name").keyup(function () {
			this.value=this.value.replace(/\s/g,'');
		});
		$("#name").focusin(function () {
			$("#fhint_area_name").hide();
		});
		if(group_action=="edit"){
			group.edit(group_id);
			$("#btn_save").click(function(){group.update(group_id);});
		}
		else{
			$("#btn_save").click(function(){group.add();});
			$("#name").focusout(function () {
				this.value=this.value.replace(/\s/g,'');
				
				check_group_name(this.value);
			});
		}
	},
	
	/*------------ 检查用户输入的项目名称 ------------*/
    checkName : function(name){
		var data_area=[];
		data_area.push([ "name" , name ]);
		var data_str=functions.requestToString(data_area);
		
        $.ajax({
                url: cgipath+'group-checkName',type: 'POST', data: data_str, dataType: 'json',timeout: ajax_timeout, error: function(){notify.show(2,"请求数据失败，请刷新页面");},
				success:this.handelcheckName
        });
    },

    handelcheckName : function(feedback){
		//ret=0：已存在项目名称
        if(feedback.ret=="0"){
			$("#fhint_area_name").show();
			$("#fhint_area_name").removeClass('fhint_succeed').addClass('fhint_error');
			$("#fhint_ico").removeClass('ico_succeed').addClass('ico_error');
			$("#fhint_text").text("亲，项目名称已存在了，换一个吧");
			
        }
        else if(feedback.ret=="3"){
           $("#fhint_area_name").show();
		   $("#fhint_area_name").removeClass('fhint_error').addClass('fhint_succeed');
		   $("#fhint_ico").removeClass('ico_error').addClass('ico_succeed');
		   $("#fhint_text").text("亲，这个名字起不错！");
        }
    },
	
	
	power_data:[],
	loadPowerList : function(){
		var data_str="";
        $.ajax({
			url: cgipath+'power-showlist', type: 'POST',data: data_str,dataType: 'json', timeout: ajax_timeout,error: function(){notify.show(2,"请求数据失败，请刷新页面");},
			success:function(feedback){
				if(feedback.ret=="0")
					power_data=feedback.listdata;
					group.showlist();
			}
        });
    },
	
	showPowerList : function(){
		var data_str="";
        $.ajax({
			url: cgipath+'power-showlistByGroup', type: 'POST',data: data_str,dataType: 'json', timeout: ajax_timeout,error: function(){notify.show(2,"请求数据失败，请刷新页面");},
			success:function(feedback){
				if(feedback.ret=="0")
					listdata=feedback.listdata;
					var innerhtml="";
					for(var i=0;i<listdata.length;i++){
						innerhtml+="<div style=\"overflow:hidden;\"><h3 style=\"color:#A2B9E5\"><label><input type=\"checkbox\" list_child_id="+i+" onclick=\"choose_group(this)\" />"+listdata[i].group_name+"</label></h3><ul id=\"list_child_"+i+"\">";
						for(var j=0;j<listdata[i].group_data.length;j++){
							innerhtml+="<li><label title=\""+listdata[i].group_data[j].info+"\"><input type=\"checkbox\" name=\"power\" value=\""+listdata[i].group_data[j].id+"\" /> "+listdata[i].group_data[j].title+"</label></li>";
						}
						innerhtml+="</ul></div>";
					}
					$("#group_list").html(innerhtml);
					group.init();
			}
        });
    },
	
	
	search:function(){
		this.search_data=[];
		this.page=1;
		var search_text=$("#search_text").val();
		this.search_data.push([ "search_flag" , 1 ]);
		this.search_data.push([ "search_data" , search_text ]);
		this.showlist();
	},
	
	
    /*------------ 获取所有权限信息 ------------*/
	search_data:[],
	page:1,//第几页
	reqnum:10,//每页显示多少条
	order:"id",//排序字段
	desc:1,//反序,0或空正常排序，1反序
	page_nums:0,//总页数
	
	group_data:[],
    loadlist : function(){
		var data_str="";
        $.ajax({
                url: cgipath+'group-showlist', type: 'POST',data: data_str,dataType: 'json', timeout: ajax_timeout,error: function(){notify.show(2,"请求数据失败，请刷新页面");},
                success:function(feedback){
					group.group_data=feedback.listdata;
				}
        });
    },
	
	
    showlist : function(){
		var data_str="";
        $.ajax({
                url: cgipath+'group-showlist', type: 'POST',data: data_str,dataType: 'json', timeout: ajax_timeout,error: function(){notify.show(2,"请求数据失败，请刷新页面");},
                success:this.handleShowlist
        });
    },
	
     handleShowlist : function(feedback){
        if(feedback.ret=="0"){
            //显示项目列表
            var listdata=feedback.listdata;
			
			var innerhtml="<tr><th></th>";
			for(var j=0;j<listdata.length;j++){
				innerhtml+="<th>"+listdata[j].name;
				innerhtml+="<a href=\"javascript:void(0)\" onclick=\"window.location.href='usergroup_permission_1.htm?action=edit&id="+listdata[j].id+"'\">修</a>";
				innerhtml+="<a href=\"javascript:void(0)\" onclick=\"group.delConfirm("+listdata[j].id+")\">删</a>";
				innerhtml+="</th>";
			}
			innerhtml+="</tr>";
			$("#group_title").html(innerhtml);
			
			
			innerhtml="";
            for(var i=0;i<power_data.length;i++){
				innerhtml+="<tr>";
				innerhtml+="<td>"+power_data[i].title+"</td>";
				for(var j=0;j<listdata.length;j++){
					if(listdata[j].admin==1){
						innerhtml+="<td><i class=\"ico ico_support\"></i></td>";
					}
					else{
						if((","+listdata[j].power).indexOf(power_data[i].id)==-1)
							innerhtml+="<td><i class=\"ico ico_unsupport\"></i></td>";
						else
							innerhtml+="<td><i class=\"ico ico_support\"></i></td>";
					}					
				}
				innerhtml+="</tr>";
            }
			$("#group_list").html(innerhtml);
        }
        else{
             message.show("message_div","",feedback.msg,4);
        }
    },
	



	
    /*------------ 添加 ------------*/
    add : function(){
		var power=""; 
		$("input[name=power]").each(function() { 
			if ($(this).attr("checked")) {power += $(this).val()+",";}
		}); 

		var data_area=[];
		data_area.push([ "name" , $('#name').val() ]);
		data_area.push([ "admin" ,  $('[name=admin]:checked').val() ]);
		data_area.push([ "power" ,  power ]);
		var data_str=functions.requestToString(data_area);
        $.ajax({
            url:cgipath + 'group-add',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:function(feedback){
				if(feedback.ret=="0"){
					message.show("message_div","提示","保存成功",3,378,"window.location.href='usergroup_permission_2.htm'");
				}
				else{
					message.show("message_div","",feedback.msg,4);
				}
			}
        });
    },
	
	 /*------------ 获取并编辑一条信息 ------------*/
    edit : function(id){
		var data_str="&id="+id;
        $.ajax({
            url:cgipath + 'group-getinfo',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:function(feedback){
				console.log(feedback);
				if(feedback.ret=="0"){
					$('#name').val(feedback.record.name);
					$("[name=admin][value='"+feedback.record.admin+"']").attr("checked","");
					var power_arr=feedback.record.power.split(",").delNull();
					for(var i=0;i<power_arr.length;i++){
						$("[name=power][value='"+power_arr[i]+"']").attr("checked","");
					}
				
				}
				else{
					message.show("message_div","",feedback.msg,4);
				}
			
			}
        });
    },
	
	/*------------ 保存 ------------*/
    update : function(id){
		var power=""; 
		$("input[name=power]:checked").each(function() { 
			power += $(this).val()+",";
		}); 
		var data_area=[];
		data_area.push([ "id" , id ]);
		data_area.push([ "name" , $('#name').val() ]);
		data_area.push([ "admin" ,  $('[name=admin]:checked').val() ]);
		data_area.push([ "power" ,  power ]);
		var data_str=functions.requestToString(data_area);
        $.ajax({
            url:cgipath + 'group-update',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:function(feedback){
				if(feedback.ret=="0"){
					message.show("message_div","提示","保存成功",3,378,"window.location.href='usergroup_permission_2.htm'");
				}
				else{
					message.show("message_div","",feedback.msg,4);
				}
			}
        });
    },
	
	 /*------------ 删除项目 ------------*/
	 
	delConfirm:function(id){
		message.show("message_div","","确实要删除吗？",2,"","group.del("+id+");");
	},
	
    del : function(id){
		var data_str="&id="+id;
        $.ajax({
            url:cgipath + 'group-del',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
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
    }
	
}



var power = {
	init:function(){
		$("#page_up").click(function(){power.list_page(-1);});
		$("#page_down").click(function(){power.list_page(1);});
		$("#btn_add").click(function(){power.addInit();});
		$("#search_btn").click(function(){power.search();});
	},
	
	filter:function(name){
		$("#filter_data > a").removeClass("current");
		if(name!="" && name!=undefined){
			this.search_data=[];
			this.page=1;
			var search_text=name;
			$("#search_text").val('');
			this.search_data.push([ "search_flag" , 1 ]);
			this.search_data.push([ "search_data" , search_text ]);
			this.showlist();
		}
		else{
			this.search_data=[];
			this.showlist();
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
	
	
    /*------------ 获取所有权限信息 ------------*/
	search_data:[],
	page:1,//第几页
	reqnum:10,//每页显示多少条
	order:"id",//排序字段
	desc:1,//反序,0或空正常排序，1反序
	page_nums:0,//总页数
	
	
    showlist : function(){
		var data_area=[];
		data_area.push([ "page" , power.page ]);
		data_area.push([ "reqnum" , power.reqnum ]);
		data_area.push([ "order" , power.order ]);
		data_area.push([ "desc" , power.desc ]);
		if(this.search_data.length>0)
			data_area=data_area.concat(this.search_data);
		
		var data_str=functions.requestToString(data_area);
        $.ajax({
                url: cgipath+'power-showlist', type: 'POST',data: data_str,dataType: 'json', timeout: ajax_timeout,error: function(){notify.show(2,"请求数据失败，请刷新页面");},
                success:this.handleShowlist
        });
    },
	
     handleShowlist : function(feedback){
        if(feedback.ret=="0"){
            //显示项目列表
            var listdata=feedback.listdata;
			var innerhtml="";
            for(var i=0;i<listdata.length;i++){
				innerhtml+="<tr id=\"tr_"+listdata[i].id+"\">";
				innerhtml+="<td>"+listdata[i].title+"</td>";
				innerhtml+="<td>"+listdata[i].group+"</td>";
				innerhtml+="<td>"+listdata[i].name+"</td>";
				innerhtml+="<td class=\"col_users_permission_intro\">"+listdata[i].info+"</td>";
				innerhtml+="<td><a href=\"javascript:void(0)\" onclick=\"power.edit("+listdata[i].id+")\"><i class=\"ico ico_edit\"></i>修改</a> <a href=\"javascript:void(0)\" onclick=\"power.delConfirm("+listdata[i].id+")\"><i class=\"ico ico_del\"></i>删除</a></td>";
				innerhtml+="</tr>";
            }
			//翻页组件
			power.page_nums=Math.ceil(feedback.nums/power.reqnum);
			if(power.page_nums<power.page)power.page=power.page_nums;//防止page_nums等于0的情况
			$("#page_nums").html(power.page+"/"+power.page_nums);
			if(power.page==1)
				$("#page_up").removeClass("ico_page_left").addClass("ico_page_left_n");
			else
				$("#page_up").removeClass("ico_page_left_n").addClass("ico_page_left");
			if(power.page_nums==power.page)
				$("#page_down").removeClass("ico_page_right").addClass("ico_page_right_n");
			else
				$("#page_down").removeClass("ico_page_right_n").addClass("ico_page_right");
				
			$("#power_list").html(innerhtml);
        }
        else{
             message.show("message_div","",feedback.msg,4);
        }
    },
	
	list_page:function(t,order){
		if(order!=undefined && order!="")
		{
			power.order=order;
			if(power.desc*1==1)power.desc=0;
			else power.desc=1;
		}
	
		power.page=power.page-(-1)*t;
		if(power.page<=0)power.page=1;
		else if(power.page>power.page_nums) power.page=power.page_nums;
		power.showlist();
	},
	

	 /*------------ 添加前的表单------------*/
    addInit : function(){
		if(typeof($("#tr_0")[0])=="undefined"){
		
			//先得到grouplist
			var group_list_str="<ul>";
			for(var i=0;i<power.group_data.length;i++){
				group_list_str+="<li><a onclick=\"power.chooseGroup(0,'"+power.group_data[i]+"')\"  href=\"javascript:void(0);\">"+power.group_data[i]+"</a></li>";
			}
			group_list_str+="</ul>";
					
			var innerhtml="<tr id=\"tr_0\">";
			innerhtml+="<td><input class=\"inputstyle\" id=\"title\"  /></td>";
			//组下拉框
			innerhtml+="<td><div class=\"type_select\"><div class=\"like_select\"><p id=\"group_0\">"+power.group_data[0]+"</p><span class=\"icon_down\"></span></div><div class=\"select_drop_down\"  id=\"group_list_0\" style=\"visibility:hidden\">"+group_list_str+"</div></div></td>";
			innerhtml+="<td><input class=\"inputstyle\" id=\"name\"  /></td>";
			innerhtml+="<td class=\"col_users_permission_intro\"><input class=\"inputstyle\" id=\"info\"  /></td>";
			innerhtml+="<td><a href=\"javascript:void(0)\" onclick=\"power.add()\"><i class=\"ico ico_save\"></i>保存</a> <a href=\"javascript:void(0)\" onclick=\"power.show()\"><i class=\"ico ico_del\"></i>取消</a></td>";
			innerhtml+="</tr>";
			$("#power_list").append(innerhtml);
			$(".like_select").click(
				function(){$(this).parent().find('.select_drop_down').css({visibility: "visible",display: "none"}).slideDown(300);}
			);
			$(".type_select").hover(
				function(){},
				function(){$(this).find('.select_drop_down').delay(1000).slideUp(300);}
			);
		}
    },
	
    /*------------ 添加 ------------*/
    add : function(){
        //收集项目信息
		var data_area=[];
		data_area.push([ "name" , $('#name').val() ]);
		data_area.push([ "title" ,  $('#title').val() ]);
		data_area.push([ "info" ,  $('#info').val() ]);
		data_area.push([ "group" ,  $('#group_0').html() ]);
		var data_str=functions.requestToString(data_area);
        $.ajax({
            url:cgipath + 'power-add',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:function(feedback){
				if(feedback.ret=="0"){
					message.show("message_div","提示","保存成功",3,378);
					power.showlist();
				}
				else{
					message.show("message_div","",feedback.msg,4);
				}
			}
        });
    },
	
	chooseGroup : function(id,name){
         //$('#parent_id_list_'+id).css('display', 'none');
		 $('#group_'+id).html(name);
		 $('#group_list_'+id).hide();
    },
	 /*------------ 获取并编辑一条信息 ------------*/
    edit : function(id){
		var data_str="&id="+id;
        $.ajax({
            url:cgipath + 'power-getinfo',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:function(feedback){
					
				if(feedback.ret=="0"){
					//先得到grouplist
					var group_list_str="<ul>";
					for(var i=0;i<power.group_data.length;i++){
						group_list_str+="<li><a onclick=\"power.chooseGroup("+feedback.record.id+",'"+power.group_data[i]+"')\"  href=\"javascript:void(0);\">"+power.group_data[i]+"</a></li>";
					}
					group_list_str+="</ul>";
					
					var innerhtml="";
					innerhtml+="<td><input class=\"inputstyle\" id=\"title_"+feedback.record.id+"\" value=\""+feedback.record.title+"\" /></td>";
					//组下拉框
					innerhtml+="<td><div class=\"type_select\"><div class=\"like_select\"><p id=\"group_"+feedback.record.id+"\">"+feedback.record.group+"</p><span class=\"icon_down\"></span></div><div class=\"select_drop_down\"  id=\"group_list_"+feedback.record.id+"\" style=\"visibility:hidden\">"+group_list_str+"</div></div></td>";
					
					innerhtml+="<td><input class=\"inputstyle\" id=\"name_"+feedback.record.id+"\" value=\""+feedback.record.name+"\" /></td>";
					innerhtml+="<td class=\"col_users_permission_intro\"><input class=\"inputstyle\" id=\"info_"+feedback.record.id+"\" value=\""+feedback.record.info+"\" /></td>";
					innerhtml+="<td><a href=\"javascript:void(0)\" onclick=\"power.update("+feedback.record.id+")\"><i class=\"ico ico_save\"></i>保存</a> <a href=\"javascript:void(0)\" onclick=\"power.show("+feedback.record.id+")\"><i class=\"ico ico_del\"></i>取消</a></td>";
					$("#tr_"+id).html(innerhtml);
					
					$(".like_select").click(
						function(){$(this).parent().find('.select_drop_down').css({visibility: "visible",display: "none"}).slideDown(300);}
					);
					$(".type_select").hover(
						function(){},
						function(){$(this).find('.select_drop_down').delay(1000).slideUp(300);}
					);
				}
				else{
					message.show("message_div","",feedback.msg,4);
				}
			
			}
        });
    },
	
	/*------------ 保存 ------------*/
    update : function(id){
        //收集项目信息
		var data_area=[];
		data_area.push([ "id" , id ]);
		data_area.push([ "name" , $('#name_'+id).val() ]);
		data_area.push([ "title" ,  $('#title_'+id).val() ]);
		data_area.push([ "info" ,  $('#info_'+id).val() ]);
		data_area.push([ "group" ,  $('#group_'+id).html() ]);
		var data_str=functions.requestToString(data_area);
        $.ajax({
            url:cgipath + 'power-update',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:function(feedback){
				if(feedback.ret=="0"){
					message.show("message_div","提示","保存成功",3,378);
					power.show(id);
				}
				else{
					message.show("message_div","",feedback.msg,4);
				}
			}
        });
    },
	
	

	/*------------ 获取并显示一条项目信息 ------------*/
    show : function(id){
		if(id>0){
			var data_str="&id="+id;
			$.ajax({
				url:cgipath + 'power-getinfo',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
				success:function(feedback){
					if(feedback.ret=="0"){
						var innerhtml="";
						innerhtml+="<td>"+feedback.record.title+"</td>";
						innerhtml+="<td>"+feedback.record.group+"</td>";
						innerhtml+="<td>"+feedback.record.name+"</td>";
						innerhtml+="<td class=\"col_users_permission_intro\">"+feedback.record.info+"</td>";
						innerhtml+="<td><a href=\"javascript:void(0)\" onclick=\"power.edit("+feedback.record.id+")\"><i class=\"ico ico_edit\"></i>修改</a> <a href=\"javascript:void(0)\" onclick=\"power.show("+feedback.record.id+")\"><i class=\"ico ico_del\"></i>删除</a></td>";
						$("#tr_"+id).html(innerhtml);
					}
					else{
						message.show("message_div","",feedback.msg,4);
					}
				
				}
			});
		}
		else{
			$("#tr_"+0).remove();
		}
    },
	
	 
	delConfirm:function(id){
		message.show("message_div","","确实要删除吗？",2,"","power.del("+id+");");
	},
	
    del : function(id){
		var data_str="&id="+id;
        $.ajax({
            url:cgipath + 'power-del',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
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
	
	
	/*------------ 显示分组信息 ------------*/
	group_data:[],
    showGroup : function(){
		var data_str="";
		$.ajax({
			url:cgipath + 'setting-getinfo',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
			success:function(feedback){
				if(feedback.ret=="0"){
					var filter_data="";
					var group_arr=feedback.record.power_sort.split(";");
					group_arr=group_arr.delNull()
					power.group_data=group_arr;
					filter_data="<a href=\"javascript:void(0)\" class=\"filter_href current\" onclick=\"power.filter();this.className='filter_href current'\">全部</a>";
					for(var i=0;i<group_arr.length;i++){
						filter_data+="<a href=\"javascript:void(0)\" class=\"filter_href\" onclick=\"power.filter('"+group_arr[i]+"');this.className='filter_href current'\">"+group_arr[i]+"</a>";
					}
					$("#filter_data").html(filter_data);
				}
				else{
					message.show("message_div","",feedback.msg,4);
				}
			
			}
		});
    }
	
	

}














