/*
 * Copy Right: Tencent ISUX
 * Project: QAM（Qzone模块化页面搭建平台）
 * Description: 系统设置
 * Author: kundy
 * date: 2012-1-5
 */


parent.nav_set(9);

var setting = {
	init:function(){
		$("#btn_ok").click(function(){setting.update();});
		$("#btn_ok2").click(function(){setting.update();});
	},
	
	read:function(t){
		var data_str="";
        $.ajax({
            url:cgipath + 'setting-read',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:function(feedback){
				if(feedback.ret=="0"){
					if(t=="templet"){
						var newwin=window.open('','',''); 
						newwin.opener = null
						newwin.document.write("<pre>"+functions.HtmlEncode(feedback.content.templet)+"</pre>"); 
						newwin.document.close();
					}
				}
				else{
					message.show("message_div","",feedback.msg,4);
				}
			}
        });
	},
	
    update : function(){
		var data_area=[];
		data_area.push([ "system_name" , $("#system_name").val() ]);
		data_area.push([ "system_url" , $("#system_url").val() ]);
		data_area.push([ "system_server_url" , $("#system_server_url").val() ]);
		data_area.push([ "svn_path" , $("#svn_path").val() ]);
		data_area.push([ "svn_url" , $("#svn_url").val() ]);
		data_area.push([ "svn_username" , $("#svn_username").val() ]);
		data_area.push([ "svn_password" , $("#svn_password").val() ]);
		data_area.push([ "prefix_layout" , $("#prefix_layout").val() ]);
		data_area.push([ "prefix_container" , $("#prefix_container").val() ]);
		data_area.push([ "prefix_module" , $("#prefix_module").val() ]);
		data_area.push([ "prefix_component" , $("#prefix_component").val() ]);
		data_area.push([ "power_sort" , $("#power_sort").val() ]);
		data_area.push([ "print_classname_class" , $("#print_classname_class").val() ]);
		data_area.push([ "print_visible_class" , $("#print_visible_class").val() ]);
		data_area.push([ "print_img_class" , $("#print_img_class").val() ]);
		data_area.push([ "print_loop_class" , $("#print_loop_class").val() ]);
		data_area.push([ "print_var_class" , $("#print_var_class").val() ]);
		data_area.push([ "print_html_event_class" , $("#print_html_event_class").val() ]);
		data_area.push([ "print_html_event_click" , $("#print_html_event_click").val() ]);
		data_area.push([ "print_html_event_clicked" , $("#print_html_event_clicked").val() ]);
		data_area.push([ "print_css_selector_class" , $("#print_css_selector_class").val() ]);
		data_area.push([ "print_css_property_class" , $("#print_css_property_class").val() ]);
		data_area.push([ "print_css_value_class" , $("#print_css_value_class").val() ]);
		data_area.push([ "print_css_event_class" , $("#print_css_event_class").val() ]);
		data_area.push([ "print_css_event_click" , $("#print_css_event_click").val() ]);
		data_area.push([ "print_css_event_clicked" , $("#print_css_event_clicked").val() ]);
		data_area.push([ "print_img_event_click" , $("#print_img_event_click").val() ]);
		data_area.push([ "print_img_event_clicked" , $("#print_img_event_clicked").val() ]);
		data_area.push([ "print_link" , $("#print_link").val() ]);
		data_area.push([ "page_ident_prefix" , $("#page_ident_prefix").val() ]);
		data_area.push([ "code_type_field" , $("#code_type_field").val() ]);
		data_area.push([ "code_id_field" , $("#code_id_field").val() ]);
		data_area.push([ "system_css_field" , $("#system_css_field").val() ]);
		data_area.push([ "user_css_field" , $("#user_css_field").val() ]);
		data_area.push([ "user_custom_field" , $("#user_custom_field").val() ]);
		data_area.push([ "filter_field" , $("#filter_field").val() ]);
		data_area.push([ "active_resource" , $("#active_resource").val() ]);
		data_area.push([ "active_page" , $("#active_page").val() ]);
		var data_str=functions.requestToString(data_area);
        $.ajax({
            url:cgipath + 'setting-update',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:function(feedback){
				if(feedback.ret=="0"){
					message.show("message_div","","保存成功",3);
				}
				else{
					message.show("message_div","",feedback.msg,4);
				}
			}
        });
    },

	
	 /*------------ 获取并编辑一条信息 ------------*/
    getinfo : function(id,obj){
		var data_str="";
        $.ajax({
            url:cgipath + 'setting-getinfo',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:function(feedback){
				if(feedback.ret=="0"){
					$("#system_name").val(feedback.record.system_name);
					$("#system_url").val(feedback.record.system_url);
					$("#system_server_url").val(feedback.record.system_server_url);
					$("#svn_path").val(feedback.record.svn_path);
					$("#svn_url").val(feedback.record.svn_url);
					$("#svn_username").val(feedback.record.svn_username);
					$("#svn_password").val(feedback.record.svn_password);
					$("#prefix_layout").val(feedback.record.prefix_layout);
					$("#prefix_container").val(feedback.record.prefix_container);
					$("#prefix_module").val(feedback.record.prefix_module);
					$("#prefix_component").val(feedback.record.prefix_component);
					$("#power_sort").val(feedback.record.power_sort);

					$("#print_classname_class").val(feedback.record.print_classname_class);
					$("#print_visible_class").val(feedback.record.print_visible_class);
					$("#print_img_class").val(feedback.record.print_img_class);
					$("#print_loop_class").val(feedback.record.print_loop_class);
					$("#print_var_class").val(feedback.record.print_var_class);
					$("#print_html_event_class").val(feedback.record.print_html_event_class);
					$("#print_html_event_click").val(feedback.record.print_html_event_click);
					$("#print_html_event_clicked").val(feedback.record.print_html_event_clicked);
					$("#print_css_selector_class").val(feedback.record.print_css_selector_class);
					$("#print_css_property_class").val(feedback.record.print_css_property_class);
					$("#print_css_value_class").val(feedback.record.print_css_value_class);
					$("#print_css_event_class").val(feedback.record.print_css_event_class);
					$("#print_css_event_click").val(feedback.record.print_css_event_click);
					$("#print_css_event_clicked").val(feedback.record.print_css_event_clicked);
					$("#print_img_event_click").val(feedback.record.print_img_event_click);
					$("#print_img_event_clicked").val(feedback.record.print_img_event_clicked);
					$("#print_link").val(feedback.record.print_link);
					
					$("#page_ident_prefix").val(feedback.record.page_ident_prefix);
					$("#code_type_field").val(feedback.record.code_type_field);
					$("#code_id_field").val(feedback.record.code_id_field);
					$("#system_css_field").val(feedback.record.system_css_field);
					$("#user_css_field").val(feedback.record.user_css_field);
					$("#user_custom_field").val(feedback.record.user_custom_field);
					$("#filter_field").val(feedback.record.filter_field);

					$("#active_resource").val(feedback.record.active_resource);
					$("#active_page").val(feedback.record.active_page);
					

		
					//$("#public_templet").val(feedback.record.public_templet);
				}
				else{
					message.show("message_div","",feedback.msg,4);
				}
			
			}
        });
    },
	
	svnTest : function(){
		$("#svn_status").html('');
		var data_area=[];
		data_area.push([ "svn_path" , $("#svn_path").val() ]);
		data_area.push([ "svn_username" , $("#svn_username").val() ]);
		data_area.push([ "svn_password" , $("#svn_password").val() ]);
		data_area.push([ "svn_url" , $("#svn_url").val() ]);
		var data_str=functions.requestToString(data_area);
        $.ajax({
            url:cgipath + 'setting-svnTest',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:function(feedback){
					$("#svn_status").html(feedback.msg);
			}
        });
    }
	
}

//html5 选择文件
function select_templet(myFiles) {
  for (var i = 0, f; f = myFiles[i]; i++) {
    var imageReader = new FileReader();
    imageReader.onload = (function(aFile) {
      return function(e) {
        $("#public_templet").val(e.target.result);
		$("#public_templet_name").val(aFile.name);
      };
	  
    })(f);
    imageReader.readAsDataURL(f);
  }
}