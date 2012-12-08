/*
 * Copy Right: Tencent ISUX
 * Project: QAM（Qzone模块化页面搭建平台）
 * Description: 子项目管理
 * Author: kundy
 * date: 2011-12-3
 */


var project = {


    /*------------ 获取所有项目信息 ------------*/
    showlist : function(id){
		var data_area=[];
		data_area.push([ "parentid" , id ]);
		data_area.push([ "root_flag" , 0 ]);
		data_area.push([ "search_flag" , 0 ]);
		data_area.push([ "order" , "id" ]);
		data_area.push([ "desc" , 0 ]);
		var data_str=functions.requestToString(data_area);
		
        $.ajax({
                url: cgipath+'project-showlist',
                type: 'POST',data: data_str,dataType: 'json', timeout: ajax_timeout,error: function(){notify.show(2,"请求数据失败，请刷新页面");},
                success:this.handleShowlist
        });
    },

    handleShowlist : function(feedback){
        if(feedback.ret=="0"){
            //显示项目列表
            var project_list_array=feedback.listdata;
			$("#parent_name").html("("+feedback.parent_name+")");
            for(var i=0;i<project_list_array.length;i++){
                var tr="<tr id=\"tr_"+project_list_array[i].id+"\">";
				if(project_list_array[i].svn_flag!=1)
					tr+="<td><span title=\""+project_list_array[i].info+"\">"+project_list_array[i].svn+"</span><i class=\"ico ico_msg\" title=\"错误的svn\"></i></td>";
                else
					tr+="<td><a title=\""+project_list_array[i].parent_svn+"\">"+project_list_array[i].svn+"</a></td>";
                tr+="<td><a href='project_manage_sub.htm?"+project_list_array[i].parentid+"'>"+project_list_array[i].parent_name+"</a></td>"; 
				tr+="<td>"+project_list_array[i].type_name+"</td>";
				var css_str="";
				for(var j=0;j<project_list_array[i].css_list.length;j++){
					
					css_str+="<div class=\"css_list_area\"><a href=\""+(cgipath+project_list_array[i].css_list[j].href)+"\" target=\"_blank\">"+project_list_array[i].css_list[j].name+"</a></div>";
				}
				tr+="<td>"+css_str+"</td>"; 
				tr+="<td class=\"col_proj_op_sub\"><a href=\"javascript:void(0)\" onclick=\"project.showPath("+project_list_array[i].id+")\"><i class=\"ico ico_settings\"></i>文件分布</a>"
				tr+="<a class=\"op_sub_href\" href=\"project.htm?action=edit&id="+project_list_array[i].id+"\" ><i class=\"ico ico_edit\"></i>编辑</a>";
				tr+="<a class=\"op_sub_href\" href=\"javascript:void(0);\" onclick=\"project.delConfirm("+project_list_array[i].id+");\" ><i class=\"ico ico_del\"></i>删除</a></td>";
                tr+="</tr>";
                $("#project_list").append(tr);
            }
        }
        else{
            alert(feedback.msg);
        }
    },

    
	/*------------ 保存一个项目 ------------*/
    update : function(id){
        //收集项目信息
		var data_area=[];
		data_area.push([ "id" , id ]);
		data_area.push([ "svn" , $('#svn_'+id).val() ]);
		data_area.push([ "parentid" ,  $('#parent_id_'+id).val() ]);
		data_area.push([ "info" ,  $('#info_'+id).val() ]);
		data_area.push([ "typeid" ,  $('#type_id_'+id).val() ]);
		data_area.push([ "css_name" ,  $('#css_name_'+id).val() ]);
		data_area.push([ "css_data" ,  $('#css_data_'+id).val() ]);
		var data_str=functions.requestToString(data_area);
        $.ajax({
            url:cgipath + 'project-update',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:function(feedback){
				if(feedback.ret=="0"){
					message.show("message_div","提示","保存成功",1,378);
					
					project.show(id);
				}
				else{
					alert(feedback.msg);
				}
			}
        });
    },

	/*------------ 获取并显示一条项目信息 ------------*/
    show : function(id){
		var data_str="&id="+id;
        $.ajax({
            url:cgipath + 'project-getinfo',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:function(feedback){
				if(feedback.ret=="0"){
					var td="";
					td+="<td>"+feedback.record.svn+"</td>";  
					td+="<td><a href='project_manage_sub.htm?"+feedback.record.parentid+"'>"+feedback.record.parent_name+"</a></td>"; 
					td+="<td>"+feedback.record.info+"</td>"; 
					td+="<td>"+feedback.record.type_name+"</td>"; 
					var css_str="";
					for(var j=0;j<feedback.record.css_list.length;j++){
						css_str+="<div><a href=\"javascript:void(0);\" onclick=\"project.cssDelConfirm("+feedback.record.id+",'"+feedback.record.css_list[j].name+"')\"><i class=\"ico ico_del\"></i></a>";
						css_str+="<a href=\""+(cgipath+feedback.record.css_list[j].href)+"\" target=\"_blank\">"+feedback.record.css_list[j].name+"</a></div>";
						
					}
					td+="<td>"+css_str+"</td>"; 
					td+="<td class=\"col_proj_op_sub\"><a href=\"javascript:void(0)\" onclick=\"project.showPath("+feedback.record.id+")\"><i class=\"ico ico_settings\"></i>文件分布</a>"
					td+="<a class=\"op_sub_href\" href=\"javascript:void(0);\" onclick=\"project.edit("+feedback.record.id+");\" ><i class=\"ico ico_edit\"></i>编辑</a>";
					td+="<a class=\"op_sub_href\" href=\"javascript:void(0);\" onclick=\"project.delConfirm("+feedback.record.id+");\" ><i class=\"ico ico_del\"></i>删除</a></td>";
					$("#tr_"+id).html(td);

				}
				else{
					alert(feedback.msg);
				}
			
			}
        });
    },
	
	/*------------ 显示目录信息 ------------*/
    showPath : function(id){
		var data_str="&id="+id;
        $.ajax({
            url:cgipath + 'project-showPath',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:function(feedback){
				if(feedback.ret=="0"){
					var c="<b>SVN：&nbsp;&nbsp;&nbsp;&nbsp;</b><a href=\""+feedback.svn+"\" target=\"_blank\">"+feedback.svn+"</a>&nbsp;&nbsp;&nbsp;&nbsp;<a id=\"copy_area\" onmouseover=\"functions.copy_clip('copy_area','"+feedback.svn+"');\" href=\"javascript:void(0)\" style=\"color:#71A7E3;text-decoration:underline\">复制</a>";
					c+="<BR><BR><hr><BR><table class=\"show_path_table\">";
					c+="<tr><td><b>html页面&nbsp;&nbsp;</b></td><td><a title=\""+feedback.svn+feedback.file.html+"\" href=\""+feedback.svn+feedback.file.html.replace("*","")+"\" target=\"_blank\">"+feedback.file.html+"</a></td></tr>";
					c+="<tr><td><b>css文件</b></td><td><a title=\""+feedback.svn+feedback.file.css+"\" href=\""+feedback.svn+feedback.file.css.replace("*","")+"\" target=\"_blank\">"+feedback.file.css+"</a></td></tr>";
					c+="<tr><td><b>js文件</b></td><td><a title=\""+feedback.svn+feedback.file.js+"\" href=\""+feedback.svn+feedback.file.js.replace("*","")+"\" target=\"_blank\">"+feedback.file.js+"</a></td></tr>";
					c+="<tr><td><b>碎图</b></td><td><a title=\""+feedback.svn+feedback.file.slice+"\" href=\""+feedback.svn+feedback.file.slice.replace("*","")+"\" target=\"_blank\">"+feedback.file.slice+"</a></td></tr>";
					c+="<tr><td><b>示例图</b></td><td><a title=\""+feedback.svn+feedback.file.sample+"\" href=\""+feedback.svn+feedback.file.sample.replace("*","")+"\" target=\"_blank\">"+feedback.file.sample+"</a></td></tr>";
					c+="</table>";
					c+="<style>.show_path_table{font-size:14px;}.show_path_table td{height:26px;}</style>";
					c+="<script>function copy_svn(t){}</script>";
					message.show("message_div","文件分布",c,1,650);
				}
				else{
					alert(feedback.msg);
				}
			
			}
        });
    },
	 /*------------ 获取并编辑一条项目信息 ------------*/
    edit : function(id){
		var data_str="&id="+id;
        $.ajax({
            url:cgipath + 'project-getinfo',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:function(feedback){
					
				if(feedback.ret=="0"){
					//先得到parent_list
					var parent_list_str="<ul>";
					for(var i=0;i<parent_list_arr.length;i++){
						parent_list_str+="<li><a onclick=\"project.chooseParentId("+feedback.record.id+","+parent_list_arr[i].id+",'"+parent_list_arr[i].name+"')\"  href=\"javascript:void(0);\">"+parent_list_arr[i].name+"</a></li>";
					}
					parent_list_str+="</ul>";
					//再得到type_list
					var type_list_str="<ul>";
					for(var i=0;i<type_list_arr.length;i++){
						type_list_str+="<li><a onclick=\"project.chooseType("+feedback.record.id+","+type_list_arr[i].id+",'"+type_list_arr[i].name+"')\"  href=\"javascript:void(0);\">"+type_list_arr[i].name+"</a></li>";
					}
					type_list_str+="</ul>";
			
					var td="";

					td+="<td><input class=\"inputstyle\" id=\"svn_"+feedback.record.id+"\" value=\""+feedback.record.svn+"\" /></td>";
					td+="<td><div class=\"type_select\"><input type=\"hidden\" value=\""+feedback.record.parentid+"\" id=\"parent_id_"+feedback.record.id+"\" /><div class=\"like_select\"><p id=\"parent_name_"+feedback.record.id+"\">"+feedback.record.parent_name+"</p><span class=\"icon_down\"></span></div><div class=\"select_drop_down\"  id=\"parent_id_list_"+feedback.record.id+"\" style=\"visibility:hidden\">"+parent_list_str+"</div></div></td>";
					td+="<td><input class=\"inputstyle\"  id=\"info_"+feedback.record.id+"\" value=\""+feedback.record.info+"\" /></td>";
					td+="<td><div class=\"type_select\"><input type=\"hidden\" value=\""+feedback.record.typeid+"\" id=\"type_id_"+feedback.record.id+"\" /><div class=\"like_select\"><p id=\"type_name_"+feedback.record.id+"\">"+feedback.record.type_name+"</p><span class=\"icon_down\"></span></div><div class=\"select_drop_down\"  id=\"type_id_list_"+feedback.record.id+"\" style=\"visibility:hidden\">"+type_list_str+"</div></div></td>";
					td+="<td><input type=\"hidden\" value=\"\" id=\"css_data_"+feedback.record.id+"\">";
					td+="<div class=\"select_file_area\"><input class=\"inputstyle css_name\" id=\"css_name_"+feedback.record.id+"\" value=\"\" /><span class=\"css_btn\">选择上传</span><input type=\"file\" id=\"file\" size=\"1\"class=\"select_file\" multiple=\"false\" onchange=\"select_css("+feedback.record.id+",this.files)\"></div></td>"; 

					td+="<td class=\"add_tr_op\"><a href=\"javascript:void(0)\" onclick=\"project.update("+feedback.record.id+")\" ><i class=\"ico ico_save\"></i>保存</a> <a class=\"op_sub_href\" href=\"javascript:void(0)\" onclick=\"project.show("+feedback.record.id+")\"><i class=\"ico ico_del\"></i>取消</a></td>";
					$("#tr_"+id).html(td);
					
					$(".type_select").hover(
						function(){$(this).find('.select_drop_down').css({visibility: "visible",display: "none"}).slideDown(300);},
						function(){$(this).find('.select_drop_down').css({visibility: "hidden"}).slideDown(300);}
					);

					
				}
				else{
					alert(feedback.msg);
				}
			
			}
        });
    },

	/*------------ 删除css ------------*/
	//id:project id
	//name:css name
	//obj:删除成功后要刷新的行
	cssDelConfirm:function(id,name){
		message.show("message_div","","确实要删除【"+name+"】吗？",2,"","project.cssDel("+id+",'"+name+"');");
	},
	
	 
    cssDel : function(id,name){
		var data_str="&id="+id+"&name="+name;
        $.ajax({
            url:cgipath + 'project-cssDel',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:function(feedback){
				if(feedback.ret=="0"){
				  message.show("message_div","提示","删除成功!",1,"","project.show("+id+")");;
				}
				else{
					alert(feedback.msg);
				}
			}
        });
    },

	
	delConfirm:function(id){
		message.show("message_div","","确实要删除吗？",2,"","project.del("+id+");");
	},
	
	
	 /*------------ 删除项目 ------------*/
    del : function(id){
		var data_str="&id="+id;
        $.ajax({
            url:cgipath + 'project-del',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:this.handleDel
        });
    },

    handleDel : function (feedback){
        if(feedback.ret=="0"){
          message.show("message_div","提示","删除成功!",1,"","window.location.reload()");
        }
        else{
            alert(feedback.msg);
        }
    },
	
	
	/*------------ 获取所有父项目信息ID列表 ------------*/
    parentList : function(){
		var data_area=[];
		data_area.push([ "root_flag" , 1 ]);
		data_area.push([ "search_flag" , 0 ]);
		var data_str=functions.requestToString(data_area);
        $.ajax({
                url: cgipath+'project-showlist',type: 'POST',data: data_str,dataType: 'json',timeout: ajax_timeout,error: function(){notify.show(2,"请求数据失败，请刷新页面");},
                success:this.handleParentList
        });
    },

     handleParentList : function(feedback){
        if(feedback.ret=="0"){
            //显示项目列表
            parent_list_arr=feedback.listdata;
        }
        else{
            alert(feedback.msg);
        }
    },
	chooseParentId : function(id,parent_id,parent_name){
         //$('#parent_id_list_'+id).css('display', 'none');
		 $('#parent_name_'+id).html(parent_name);
		 $('#parent_id_'+id).val(parent_id);
    },
	/*------------ 获取所有项目类型信息ID列表 ------------*/
    typeList : function(){
        $.ajax({
                url: cgipath+'project-typeShowlist',type: 'POST',data: '',dataType: 'json',timeout: ajax_timeout,error: function(){notify.show(2,"请求数据失败，请刷新页面");},
                success:this.handleTypeList
        });
    },

     handleTypeList : function(feedback){
        if(feedback.ret=="0"){
            //显示项目列表
            type_list_arr=feedback.listdata;
        }
        else{
            alert(feedback.msg);
        }
    },
	
	chooseType : function(id,type_id,type_name){
         //$('#type_id_list_'+id).css('display', 'none');
		 $('#type_name_'+id).html(type_name);
		 $('#type_id_'+id).val(type_id);
    }
	

}










