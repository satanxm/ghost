/*
 * Copy Right: Tencent ISUX
 * Project: QAM（Qzone模块化页面搭建平台）
 * Description: 参数管理
 * Author: kundy
 * date: 2012-1-10
 */


var global_id=functions.getRequest("id")*1;
var global_pick_id=functions.getRequest("pick_id")*1;
var global_action=functions.getRequest("action");
var global_type=functions.getRequest("type")*1;

parent.nav_set(global_type*1+4);

var pick = {
	init:function(){
		$("#btn_add").click(function(){window.location.href="pick.htm?id="+global_id});
		$("#btn_add_image").click(function(){window.location.href="pick.htm?type=1&id="+global_id});
		$("#tab_parm").click(function(){
			$(this).parent().find("a").removeClass("current");
			$(this).addClass("current");
			$("#table_parm").show();
			$("#table_img").hide();
		});
		$("#tab_img").click(function(){
			$(this).parent().find("a").removeClass("current");
			$(this).addClass("current");
			$("#table_parm").hide();
			$("#table_img").show();
		});
		 pick.showParmlist();
		 pick.showImglist();
		
	},
	addInit:function(){
		this.printCode();
		if(global_action=="edit" && global_type==1)
			pick.editImg(global_pick_id);
		else if(global_action=="edit")
			pick.edit(global_pick_id);
		$("#btn_cancel").click(function(){window.location.href="pick_list.htm?id="+global_id});
	},
	
	
	
	search_data:[],
	page:1,//第几页
	reqnum:5,//每页显示多少条
	order:"id",//排序字段
	desc:1,//反序,0或空正常排序，1反序
	page_nums:0,//总页数

    showParmlist : function(){
		var data_area=[];
		data_area.push([ "order" , pick.order ]);
		data_area.push([ "code_id" , global_id]);
		if(this.search_data.length>0)
			data_area=data_area.concat(this.search_data);
		
		var data_str=functions.requestToString(data_area);
        $.ajax({
                url: cgipath+'pick-showlist', type: 'POST',data: data_str,dataType: 'json', timeout: ajax_timeout,error: function(){notify.show(2,"请求数据失败，请刷新页面");},
                success:this.handleshowParmlist
        });
    },

     handleshowParmlist : function(feedback){
		console.log(feedback);
        if(feedback.ret=="0"){
            //显示项目列表
            var listdata=feedback.listdata;
			var innerhtml="";
            for(var i=0;i<listdata.length;i++){
                innerhtml+="<tr>";
				innerhtml+="<td>"+listdata[i].id+"</td>";
                innerhtml+="<td><span title=\""+listdata[i].info+"\">"+listdata[i].name+"</span></td>"; 
                innerhtml+="<td>"+listdata[i].pick_value_type+"</td>";
				innerhtml+="<td>"+listdata[i].pick_group+"</td>";
				innerhtml+="<td>"+listdata[i].group_dependent+"</td>";
				innerhtml+="<td>"+listdata[i].valid+"</td>";
				innerhtml+="<td>"+listdata[i].selector+"</td>";
				innerhtml+="<td>"+listdata[i].property+"</td>";
				innerhtml+="<td>"+listdata[i].value+"</td>";
				innerhtml+="<td>"+listdata[i].pick_value_type+"</td>";
				innerhtml+="<td>"+listdata[i].value_algorithm+"</td>";
				innerhtml+="<td>"+listdata[i].hide_flag+"</td>";
                innerhtml+="<td>";
				innerhtml+="<a href='pick.htm?action=edit&id="+global_id+"&pick_id="+listdata[i].id+"' class=\"op_sub_href\"  ><i class='ico ico_edit'></i>编辑</a>";
				innerhtml+="<a href='javascript:void(0);' class=\"op_sub_href\" onclick=\"pick.delConfirm("+listdata[i].id+");\" ><i class=\"ico ico_del\"></i>删除</a></td>";
                innerhtml+="</tr>";
            }
			$("#list_parm_area").html(innerhtml);
        }
        else{
             message.show("message_div","",feedback.msg,4);
        }
    },
	
	 showImglist : function(){
		var data_area=[];
		data_area.push([ "code_id" , global_id]);
		if(this.search_data.length>0)
			data_area=data_area.concat(this.search_data);
		
		var data_str=functions.requestToString(data_area);
        $.ajax({
                url: cgipath+'image-showlist', type: 'POST',data: data_str,dataType: 'json', timeout: ajax_timeout,error: function(){notify.show(2,"请求数据失败，请刷新页面");},
                success:this.handleshowImglist
        });
    },

     handleshowImglist : function(feedback){
		console.log(feedback);
        if(feedback.ret=="0"){
            //显示项目列表
            var listdata=feedback.listdata;
			var innerhtml="";
            for(var i=0;i<listdata.length;i++){
				var type_str="碎图";
				if(listdata[i].type==1)type_str="非碎图";
				else if(listdata[i].type==2)type_str="效果图";
				
                innerhtml+="<tr>";
                innerhtml+="<td>"+type_str+"</td>";
				innerhtml+="<td>"+listdata[i].src_origin+"</td>";
				innerhtml+="<td>"+listdata[i].src_present+"</td>";
				innerhtml+="<td>"+listdata[i].valid+"</td>";
                innerhtml+="<td>";
				innerhtml+="<a href='pick.htm?type=1&action=edit&id="+global_id+"&pick_id="+listdata[i].id+"' class=\"op_sub_href\"  ><i class='ico ico_edit'></i>编辑</a>";
				innerhtml+="<a href='javascript:void(0);' class=\"op_sub_href\" onclick=\"pick.delImgConfirm("+listdata[i].id+");\" ><i class=\"ico ico_del\"></i>删除</a></td>";
                innerhtml+="</tr>";
            }
			$("#list_image_area").html(innerhtml);
        }
        else{
             message.show("message_div","",feedback.msg,4);
        }
    },
	
	
	
	/*------------ 添加一个项目 ------------*/
    printCode : function(){
        //收集项目信息
		var data_area=[];
		data_area.push([ "id" , global_id ]);
		var data_str=functions.requestToString(data_area);

        $.ajax({
            url:cgipath + 'code-printCode',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:this.handleprintCode
        });
    },

    handleprintCode : function (feedback){
        if(feedback.ret=="0"){
			$("#html").html("<pre>"+feedback.content.html+"</pre>");
			$("#css").html("<pre>"+feedback.content.css+"</pre>");
        }
        else{
            message.show("message_div","",feedback.msg,4);
        }
    },
	
	

    addHtml : function(){
        //收集项目信息
		var data_area=[];
		data_area.push([ "code_id" , global_id ]);
		data_area.push([ "name" , $('#name').val() ]);
		data_area.push([ "pick_group" , $('#pick_group').val() ]);
		data_area.push([ "info" , $('#info').val() ]);
		data_area.push([ "selector" , $('#selector').val() ]);
		data_area.push([ "property" , $('#property').val() ]);
		data_area.push([ "value" , $('#value').val() ]);
		data_area.push([ "group_dependent" , $('#group_dependent').val() ]);
		data_area.push([ "pick_value_type" , $('#pick_value_type').val() ]);
		data_area.push([ "value_algorithm" , $('#value_algorithm').val() ]);
		data_area.push([ "hide_flag" , $('#hide_flag').val() ]);
		var data_str=functions.requestToString(data_area);
        $.ajax({
            url:cgipath + 'pick-addHtml',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:function(feedback){
				 if(feedback.ret=="0"){
				   message.show("message_div","","保存成功",3,"","window.location.href='pick_list.htm?id="+global_id+"';");
				}
				else{
					message.show("message_div","",feedback.msg,4);
				}
			}
        });
    },

	addCss : function(){
        //收集项目信息
		var data_area=[];
		data_area.push([ "code_id" , global_id ]);
		data_area.push([ "pick_index" , $('#pick_index').val() ]);
		data_area.push([ "name" , $('#name').val() ]);
		data_area.push([ "pick_group" , $('#pick_group').val() ]);
		data_area.push([ "info" , $('#info').val() ]);
		data_area.push([ "selector" , $('#selector').val() ]);
		data_area.push([ "property" , $('#property').val() ]);
		data_area.push([ "value" , $('#value').val() ]);
		data_area.push([ "group_dependent" , $('#group_dependent').val() ]);
		data_area.push([ "pick_value_type" , $('#pick_value_type').val() ]);
		data_area.push([ "value_algorithm" , $('#value_algorithm').val() ]);
		data_area.push([ "hide_flag" , $('#hide_flag').val() ]);
		var data_str=functions.requestToString(data_area);
        $.ajax({
            url:cgipath + 'pick-addCss',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:function(feedback){
				console.log(feedback);
				 if(feedback.ret=="0"){
				   message.show("message_div","","保存成功",3,"","window.location.href='pick_list.htm?id="+global_id+"';");
				}
				else{
					message.show("message_div","",feedback.msg,4);
				}
			}
        });
    },
	
	 addImage : function(){
        //收集项目信息
		var data_area=[];
		data_area.push([ "code_id" , global_id ]);
		data_area.push([ "src_present" , $('#src_present').val() ]);
		data_area.push([ "type" , $('#image_type').val() ]);
		data_area.push([ "src_origin" , $('#src_origin').val() ]);
		var data_str=functions.requestToString(data_area);
        $.ajax({
            url:cgipath + 'image-add',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:function(feedback){
				 if(feedback.ret=="0"){
				   message.show("message_div","","保存成功",3,"","window.location.href='pick_list.htm?id="+global_id+"';");
				}
				else{
					message.show("message_div","",feedback.msg,4);
				}
			}
        });
    },
	
	
  
    update : function(t){
		var data_area=[];
		data_area.push([ "id" , t ]);
		data_area.push([ "code_id" , global_id ]);
		data_area.push([ "pick_index" , $('#pick_index').val() ]);
		data_area.push([ "name" , $('#name').val() ]);
		data_area.push([ "pick_group" , $('#pick_group').val() ]);
		data_area.push([ "info" , $('#info').val() ]);
		data_area.push([ "selector" , $('#selector').val() ]);
		data_area.push([ "property" , $('#property').val() ]);
		data_area.push([ "value" , $('#value').val() ]);
		data_area.push([ "group_dependent" , $('#group_dependent').val() ]);
		data_area.push([ "pick_value_type" , $('#pick_value_type').val() ]);
		data_area.push([ "value_algorithm" , $('#value_algorithm').val() ]);
		data_area.push([ "hide_flag" , $('#hide_flag').val() ]);
		var data_str=functions.requestToString(data_area);

        $.ajax({
            url:cgipath + 'pick-updateCss',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:function(feedback){
				if(feedback.ret=="0"){
					message.show("message_div","","保存成功",3,"","window.location.href='pick_list.htm?id="+global_id+"';");
					
				}
				else{
					message.show("message_div","",feedback.msg,4);
				}
			}
        });
    },
	
	 updateImg : function(t){
		var data_area=[];
		data_area.push([ "id" , t ]);
		data_area.push([ "src_present" , $('#src_present').val() ]);
		data_area.push([ "type" , $('#image_type').val() ]);
		var data_str=functions.requestToString(data_area);

        $.ajax({
            url:cgipath + 'image-update',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:function(feedback){
				if(feedback.ret=="0"){
					message.show("message_div","","保存成功",3,"","window.location.href='pick_list.htm?id="+global_id+"';");
					
				}
				else{
					message.show("message_div","",feedback.msg,4);
				}
			}
        });
    },
	
	
    edit : function(t){
		$("#img_area").hide();
		$("#pick_area").show();
		var data_str="&id="+t;
		$("#btn_save").click(function(){pick.update(t)});
        $.ajax({
            url:cgipath + 'pick-getinfo',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:function(feedback){
				if(feedback.ret=="0"){
					$('#name').val(feedback.record.name)
					$('#info').val(feedback.record.info)
					$('#pick_group').val(feedback.record.pick_group)
					$('#group_dependent').val(feedback.record.group_dependent)
					$('#selector').val(feedback.record.selector)
					$('#property').val(feedback.record.property)
					$('#value').val(feedback.record.value)
					$('#pick_value_type').val(feedback.record.pick_value_type)
					$('#value_algorithm').val(feedback.record.value_algorithm)
					$('#hide_flag').val(feedback.record.hide_flag)
				}
				else{
					message.show("message_div","",feedback.msg,4);
				}
			
			}
        });
    },

	editImg : function(t){
		$("#pick_area").hide();
		$("#img_area").show();
		var data_str="&id="+t;
		$("#btn_save").click(function(){pick.updateImg(t)});
        $.ajax({
            url:cgipath + 'image-getinfo',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:function(feedback){
				console.log(feedback);
				if(feedback.ret=="0"){
					$('#image_type').val(feedback.record.type)
					$('#src_origin').val(feedback.record.src_origin)
					$("#img_preview").html("<img class=\"pick_img_preview\" src=\""+(cgipath+feedback.record.src_present)+"\" />");
					$("#src_present_area")[0].ondragenter =function(){event.stopPropagation(); event.preventDefault();};
					$("#src_present_area")[0].ondragover =function(){event.stopPropagation(); event.preventDefault();};
					$("#src_present_area")[0].ondrop =function(){event.stopPropagation(); event.preventDefault();dodrop(event)};
				}
				else{
					message.show("message_div","",feedback.msg,4);
				}
			
			}
        });
    },

	 
	delConfirm:function(id){
		message.show("message_div","","确实要删除吗？",2,"","pick.del("+id+");");
	},
	
    del : function(id){
		var data_str="&id="+id;
        $.ajax({
            url:cgipath + 'pick-del',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:this.handledel
        });
    },

    handledel : function (feedback){
        if(feedback.ret=="0"){
            message.show("message_div","","删除成功",3,"","pick.showParmlist();");
        }
        else{
            message.show("message_div","",feedback.msg,4);
        }
    },
	
	delImgConfirm:function(id){
		message.show("message_div","","确实要删除吗？",2,"","pick.delImg("+id+");");
	},
	
    delImg : function(id){
		var data_str="&id="+id;
        $.ajax({
            url:cgipath + 'image-del',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:function(feedback){
				if(feedback.ret=="0"){
					message.show("message_div","","删除成功",3,"","pick.showImglist();");
				}
				else{
					message.show("message_div","",feedback.msg,4);
				}
			}
        });
    },

	
	code_html_cb:function(t){
		$("#pick_area").show();
		$("#img_area").hide();
		$("#btn_save").click(function(){pick.addHtml()});
		$("#name").val(t);
		$("#property").val(t);
		$("#group_dependent").val(0);
		$("#pick_value_type").val(0);
		$("#hide_flag").val(0);
	},
	
	code_html_cbed : function(t){
		this.edit(t);
    },
	
	code_css_cb : function(t){
		$("#pick_area").show();
		$("#img_area").hide();
		$("#btn_save").click(function(){pick.addCss()});
		var data_area=[];
		data_area.push([ "id" , global_id ]);
		data_area.push([ "pick_index" , t ]);
		var data_str=functions.requestToString(data_area);
        $.ajax({
            url:cgipath + 'pick-parse',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:function(feedback){
				$("#name").val(feedback.pick_css.property);
				$('#selector').val(feedback.pick_css.selector)
				$('#property').val(feedback.pick_css.property)
				$('#value').val(feedback.pick_css.value)
				$("#group_dependent").val(0);
				$("#pick_value_type").val(0);
				$("#hide_flag").val(0);
				$("#pick_index").val(feedback.pick_css.pick_index);
			}
        });
    },
	code_css_cbed : function(t){
		this.edit(t);
    },
	code_img_cb : function(t){
		$("#pick_area").hide();
		$("#img_area").show();
		$("#image_type").val(2);
		$("#src_origin").val(t);
		$("#src_present_area")[0].ondragenter =function(){event.stopPropagation(); event.preventDefault();};
		$("#src_present_area")[0].ondragover =function(){event.stopPropagation(); event.preventDefault();};
		$("#src_present_area")[0].ondrop =function(){event.stopPropagation(); event.preventDefault();dodrop(event)};
		$("#btn_save").click(function(){pick.addImage()});
		
    },
	code_img_cbed : function(t){
		
    }

}



var code_html_cb=function(t){pick.code_html_cb(t);}
var code_html_cbed=function(t){pick.code_html_cbed(t);}
var code_css_cb=function(t){pick.code_css_cb(t);}
var code_css_cbed=function(t){pick.code_css_cbed(t);}
var code_img_cb=function(t){pick.code_img_cb(t);}
var code_img_cbed=function(t){pick.code_img_cbed(t);}



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
















