/*
 * Copy Right: Tencent ISUX
 * category: QAM（Qzone模块化页面搭建平台）
 * Description: 分类管理
 * Author: kundy
 * date: 2011-11-17
 */

var global_id=functions.getRequest("id")*1;
var global_action=functions.getRequest("action");

 parent.nav_set(1);
 
var category = {
	addInit:function(){
		if(global_action=="edit"){
			$("#btn_save").click(function(){category.update();});
			$('#page_title').html("<i class=\"ico ico_manage\"></i><span>修改分类</span>");
			category.edit();
		}
		else{
			$("#btn_save").click(function(){category.add();});
			$('#page_title').html("<i class=\"ico ico_category_add\"></i><span>添加分类</span>");
		}
		
		
		//不允许输入空格
		//鼠标离开、复制等！
		$("#name").mouseout(function () {
			this.value=this.value.replace(/\s/g,'');
		});
		$("#name").focusout(function () {
			this.value=this.value.replace(/\s/g,'');
			check_category_name(this.value);
		});
		$(".like_select").click(
			function(){$(this).parent().find('.select_drop_down').css({visibility: "visible",display: "none"}).show();}
		);
		$(".type_select").hover(
			function(){},
			function(){$(this).find('.select_drop_down').delay(1000).hide();}
		);

	},
	
    /*------------ 获取所有根分类信息 ------------*/
    showlist : function(){
		var data_area=[];
		data_area.push([ "search_flag" , 0 ]);
		data_area.push([ "order" , "id" ]);
		data_area.push([ "desc" , 0 ]);
		var data_str=functions.requestToString(data_area);
		
        $.ajax({
                url: cgipath+'category-showlist', type: 'POST',data: data_str,dataType: 'json', timeout: ajax_timeout,error: function(){notify.show(2,"请求数据失败，请刷新页面");},
                success:this.handleShowlist
        });
    },

     handleShowlist : function(feedback){
        if(feedback.ret=="0"){
            //显示分类列表
            var category_list_array=feedback.listdata;
            for(var i=0;i<category_list_array.length;i++){
				if(category_list_array[i].id!=1){
					var tr="<tr>";
					tr+="<td>"+category_list_array[i].name+"</td>"; 
					tr+="<td>"+category_list_array[i].info+"</td>"; 
					tr+="<td class=\"add_tr_op\">";
					tr+="<a href='category.htm?action=edit&id="+category_list_array[i].id+"' class=\"op_sub_href\" ><i class='ico ico_edit'></i>编辑</a>";
					tr+="<a href='javascript:void(0);' class=\"op_sub_href\" onclick=\"category.delConfirm("+category_list_array[i].id+");\" ><i class=\"ico ico_del\"></i>删除</a></td>";
					tr+="</tr>";
					$("#category_list").append(tr);
				}
            }
        }
        else{
             message.show("message_div","",feedback.msg,4);
        }
    },
	
    /*------------ 添加一个分类 ------------*/
    add : function(){
        //收集分类信息
		 notify.show(1,"正在保存，请稍候...");

		var data_area=[];
		data_area.push([ "name" , $('#name').val() ]);
		data_area.push([ "info" , $('#info').val() ]);
		var data_str=functions.requestToString(data_area);

        $.ajax({
            url:cgipath + 'category-add',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:this.handleAdd
        });
    },

    handleAdd : function (feedback){
        if(feedback.ret=="0"){
			message.show("message_div","","添加成功",1,"","window.location.href='category_manage.htm';");
        }
        else{
            message.show("message_div","",feedback.msg,4);
        }
    },
	
	/*------------ 保存一个分类 ------------*/
    update : function(){
		notify.show(1,"正在保存，请稍候...");
		var data_area=[];
		data_area.push([ "id" , global_id ]);
		data_area.push([ "info" , $('#info').val() ]);
		data_area.push([ "name" ,  $('#name').val() ]);
		
		var data_str=functions.requestToString(data_area);

        $.ajax({
            url:cgipath + 'category-update',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:function(feedback){
				if(feedback.ret=="0"){
					if($("[name='root_flag']:checked").val()==1)
						message.show("message_div","","保存成功",1,"","window.location.href='category_manage.htm';");
					else
						message.show("message_div","","保存成功",1,"","window.location.href='category_manage_sub.htm?"+$("#parent_id").val()+"'");
				}
				else{
					message.show("message_div","",feedback.msg,4);
				}
			}
        });
    },

	/*------------ 获取并显示一条分类信息 ------------*/
    show : function(id,obj){
		var data_str="&id="+id;
        $.ajax({
            url:cgipath + 'category-getinfo',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:function(feedback){
				if(feedback.ret=="0"){
					var td="";
					td+="<td><a href='category_manage_sub.htm?"+feedback.record.id+"'>"+feedback.record.name+"</a></td>";         //分类名称
					td+="<td>"+feedback.record.author+"</td>";         //分类管理员
					td+="<td class='col_proj_svn'>"+feedback.record.svn+"</td>";         //SVN路径
					td+="<td class=\"add_tr_op\"><a href='category_manage_sub.htm?"+feedback.record.id+"'><i class='ico ico_settings'></i>管理子分类</a>";
					td+="<a href='javascript:void(0);' class=\"op_sub_href\" onclick=\"category.edit("+feedback.record.id+",this.parentNode.parentNode);\" ><i class='ico ico_edit'></i>编辑</a>";
					td+="<a href='javascript:void(0);' class=\"op_sub_href\" onclick=\"category.delConfirm("+feedback.record.id+");\" ><i class=\"ico ico_del\"></i>删除</a></td>";
					$(obj).html(td);
				}
				else{
					message.show("message_div","",feedback.msg,4);
				}
			
			}
        });
    },
	
	
    edit : function(id){
		var data_str="&id="+global_id;
        $.ajax({
            url:cgipath + 'category-getinfo',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:function(feedback){
				if(feedback.ret=="0"){
					$("#name").val(feedback.record.name);
					$("#info").val(feedback.record.info);
				}
				else{
					message.show("message_div","",feedback.msg,4);
				}
			
			}
        });
    },

	
	 /*------------ 删除分类 ------------*/
	 
	delConfirm:function(id){
		message.show("message_div","","确实要删除吗？",2,"","category.del("+id+");");
	},
	
    del : function(id){
		var data_str="&id="+id;
        $.ajax({
            url:cgipath + 'category-del',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:this.handledel
        });
    },

    handledel : function (feedback){
        if(feedback.ret=="0"){
            message.show("message_div","","删除成功",1,"","window.location.reload();");
        }
        else{
            message.show("message_div","",feedback.msg,4);
        }
    }

}



function check_category_name(category_name){
	if(category_name==""){
		$("#fhint_area_name").show();
		$("#fhint_area_name").removeClass('fhint_succeed').addClass('fhint_error');
		$("#fhint_ico").removeClass('ico_succeed').addClass('ico_error');
		$("#fhint_text").text("亲，分类名称要填的");
	}
}



