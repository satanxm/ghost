/*
 * Copy Right: Tencent ISUX
 * Project: QAM（Qzone模块化页面搭建平台）
 * Description: 链接管理
 * Author: kundy
 * date: 2012-1-6
 */

parent.nav_set(9);


var link = {
	init:function(){
		$("#btn_add").click(function(){link.addInit();});
	},
	
	search_data:[],
	page:1,//第几页
	reqnum:5,//每页显示多少条
	order:"id",//排序字段
	desc:1,//反序,0或空正常排序，1反序
	page_nums:0,//总页数

    showlist : function(){
		var data_area=[];
		if(this.search_data.length>0)
			data_area=data_area.concat(this.search_data);
		
		var data_str=functions.requestToString(data_area);
        $.ajax({
                url: cgipath+'link-showlist', type: 'POST',data: data_str,dataType: 'json', timeout: ajax_timeout,error: function(){notify.show(2,"请求数据失败，请刷新页面");},
                success:this.handleShowlist
        });
    },

     handleShowlist : function(feedback){
        if(feedback.ret=="0"){
            //显示项目列表
            var listdata=feedback.listdata;
			var innerhtml="";
            for(var i=0;i<listdata.length;i++){
                innerhtml+="<tr>";
                innerhtml+="<td>"+listdata[i].name+"</td>"; 
                innerhtml+="<td>"+listdata[i].type+"</td>";
				innerhtml+="<td class=\"col_proj_svn\">"+listdata[i].url+"</td>";
                innerhtml+="<td>";         //SVN路径
				innerhtml+="<a href='javascript:void(0);' class=\"op_sub_href\" onclick=\"link.edit("+listdata[i].id+",this.parentNode.parentNode);\" ><i class='ico ico_edit'></i>编辑</a>";
				innerhtml+="<a href='javascript:void(0);' class=\"op_sub_href\" onclick=\"link.delConfirm("+listdata[i].id+");\" ><i class=\"ico ico_del\"></i>删除</a></td>";
                innerhtml+="</tr>";
            }
			$("#list_area").html(innerhtml);
        }
        else{
             message.show("message_div","",feedback.msg,4);
        }
    },
	
	
	 /*------------ 添加前的表单------------*/
    addInit : function(){
		if(typeof($("#tr_0")[0])=="undefined"){
			var innerhtml="<tr id=\"tr_0\">";
			innerhtml+="<td><input class=\"inputstyle\" id=\"name\"  /></td>";
			//组下拉框
			innerhtml+="<td><input class=\"inputstyle\" id=\"type\"  /></td>";
			innerhtml+="<td class=\"col_users_permission_intro\"><input class=\"inputstyle\" id=\"url\"  /></td>";
			innerhtml+="<td><a href=\"javascript:void(0)\" onclick=\"link.add()\"><i class=\"ico ico_save\"></i>保存</a> <a href=\"javascript:void(0)\" onclick=\"link.show()\"><i class=\"ico ico_del\"></i>取消</a></td>";
			innerhtml+="</tr>";
			$("#list_area").append(innerhtml);
			
		}
    },
	

    /*------------ 添加一个项目 ------------*/
    add : function(){
        //收集项目信息
		var data_area=[];
		data_area.push([ "name" , $('#name').val() ]);
		data_area.push([ "type" , $('#type').val() ]);
		data_area.push([ "url" , $('#url').val() ]);
		var data_str=functions.requestToString(data_area);
        $.ajax({
            url:cgipath + 'link-add',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:this.handleAdd
        });
    },

    handleAdd : function (feedback){
        if(feedback.ret=="0"){
           message.show("message_div","","添加成功",3,"","link.showlist();");
        }
        else{
            message.show("message_div","",feedback.msg,4);
        }
    },
	
	/*------------ 保存一个项目 ------------*/
    update : function(id,obj){
        //收集项目信息
		var data_area=[];
		data_area.push([ "id" , id ]);
		data_area.push([ "name" , $('#name_'+id).val() ]);
		data_area.push([ "url" ,  $('#url_'+id).val() ]);
		data_area.push([ "type" ,  $('#type_'+id).val() ]);
		var data_str=functions.requestToString(data_area);

        $.ajax({
            url:cgipath + 'link-update',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:function(feedback){
				if(feedback.ret=="0"){
					message.show("message_div","","保存成功");
					link.show(id,obj);
				}
				else{
					message.show("message_div","",feedback.msg,4);
				}
			}
        });
    },

	/*------------ 获取并显示一条项目信息 ------------*/
    show : function(id,obj){
		if(id>0){
			var data_str="&id="+id;
			$.ajax({
				url:cgipath + 'link-getinfo',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
				success:function(feedback){
					if(feedback.ret=="0"){
						var innerhtml="";
						innerhtml+="<td>"+feedback.record.name+"</td>"; 
						innerhtml+="<td>"+feedback.record.type+"</td>"; 
						innerhtml+="<td class=\"col_proj_svn\">"+feedback.record.url+"</td>"; 
						innerhtml+="<td >";
						innerhtml+="<a href='javascript:void(0);' class=\"op_sub_href\" onclick=\"link.edit("+feedback.record.id+",this.parentNode.parentNode);\" ><i class='ico ico_edit'></i>编辑</a>";
						innerhtml+="<a href='javascript:void(0);' class=\"op_sub_href\" onclick=\"link.delConfirm("+feedback.record.id+");\" ><i class=\"ico ico_del\"></i>删除</a></td>";
						$(obj).html(innerhtml);
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
	
	
	 /*------------ 获取并编辑一条项目信息 ------------*/
    edit : function(id,obj){
		var data_str="&id="+id;
        $.ajax({
            url:cgipath + 'link-getinfo',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:function(feedback){
				if(feedback.ret=="0"){
					var td="";
					td+="<td><input class=\"inputstyle\" id=\"name_"+feedback.record.id+"\" value=\""+feedback.record.name+"\" /></td>"
					td+="<td><input class=\"inputstyle\" id=\"type_"+feedback.record.id+"\" value=\""+feedback.record.type+"\" /></td>";
					td+="<td class=\"col_proj_svn\"><input class=\"inputstyle\" id=\"url_"+feedback.record.id+"\" value=\""+feedback.record.url+"\" /></td>";
					td+="<td><a href=\"javascript:void(0)\"  class=\"op_sub_href\" onclick=\"link.update("+feedback.record.id+",this.parentNode.parentNode)\"><i class=\"ico ico_save\"></i>保存</a> <a href=\"javascript:void(0)\" class=\"op_sub_href\" onclick=\"link.show("+feedback.record.id+",this.parentNode.parentNode)\"><i class=\"ico ico_del\"></i>取消</a></td>";
						
					$(obj).html(td);
				}
				else{
					message.show("message_div","",feedback.msg,4);
				}
			
			}
        });
    },

	
	 /*------------ 删除项目 ------------*/
	 
	delConfirm:function(id){
		message.show("message_div","","确实要删除吗？",2,"","link.del("+id+");");
	},
	
    del : function(id){
		var data_str="&id="+id;
        $.ajax({
            url:cgipath + 'link-del',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
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



