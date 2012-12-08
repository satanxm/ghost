/*
 * Copy Right: Tencent ISUX
 * Project: QAM（Qzone模块化页面搭建平台）
 * Description: 项目类型管理
 * Author: kundy
 * date: 2012-1-14
 */

var global_id=functions.getRequest("id")*1;
var global_action=functions.getRequest("action");

parent.nav_set(9);

var project_type = {
	init:function(){
		
		$("#btn_add").click(function(){window.location.href="project_type.htm"});
	},
	
	addInit:function(){
		if(global_action=="edit"){
			$("#btn_save").click(function(){project_type.update();});
			$('#page_title').html("修改项目类型");
			project_type.edit();
		}
		else{
			$("#btn_save").click(function(){project_type.add();});
			$('#page_title').html("添加项目类型");

		}
		
		$("#img_area")[0].ondragenter =function(){event.stopPropagation(); event.preventDefault();};
		$("#img_area")[0].ondragover =function(){event.stopPropagation(); event.preventDefault();};
		$("#img_area")[0].ondrop =function(){event.stopPropagation(); event.preventDefault();dodrop(event)};
		
		$("#btn_cancel").click(function(){window.location.href="project_type_manage.htm"});
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
                url: cgipath+'project-typeShowlist', type: 'POST',data: data_str,dataType: 'json', timeout: ajax_timeout,error: function(){notify.show(2,"请求数据失败，请刷新页面");},
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
				innerhtml+="<td>"+listdata[i].info+"</td>"; 
                innerhtml+="<td><img style=\"max-width:140px\" src=\""+listdata[i].img+"\" /></td>";
				var str2="<span class=\"span_aequilate\">html：</span>"+listdata[i].html;
				str2+="<BR><span class=\"span_aequilate\">css：</span>"+listdata[i].css;
				str2+="<BR><span class=\"span_aequilate\">js：</span>"+listdata[i].js;
				str2+="<BR><span class=\"span_aequilate\">碎图：</span>"+listdata[i].slice;
				str2+="<BR><span class=\"span_aequilate\">预览图：</span>"+listdata[i].sample;
				innerhtml+="<td>"+str2+"</td>";
                innerhtml+="<td>";         //SVN路径
				innerhtml+="<a href='project_type.htm?action=edit&id="+listdata[i].id+"' class=\"op_sub_href\" ><i class='ico ico_edit'></i>编辑</a>";
				innerhtml+="<a href='javascript:void(0);' class=\"op_sub_href\" onclick=\"project_type.delConfirm("+listdata[i].id+");\" ><i class=\"ico ico_del\"></i>删除</a></td>";
                innerhtml+="</tr>";
            }
			$("#list_area").html(innerhtml);
        }
        else{
             message.show("message_div","",feedback.msg,4);
        }
    },
	


    /*------------ 添加一个项目 ------------*/
    add : function(){
        //收集项目信息
		var data_area=[];
		data_area.push([ "name" , $('#name').val() ]);
		data_area.push([ "info" , $('#info').val() ]);
		data_area.push([ "html" , $('#html').val() ]);
		data_area.push([ "js" , $('#js').val() ]);
		data_area.push([ "css" , $('#css').val() ]);
		data_area.push([ "slice" , $('#slice').val() ]);
		data_area.push([ "sample" , $('#sample').val() ]);
		data_area.push([ "img" , $('#img').val() ]);
		var data_str=functions.requestToString(data_area);
        $.ajax({
            url:cgipath + 'project-typeAdd',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:this.handleAdd
        });
    },

    handleAdd : function (feedback){
        if(feedback.ret=="0"){
           message.show("message_div","","添加成功",1,"","window.location.href='project_type_manage.htm'");
        }
        else{
            message.show("message_div","",feedback.msg,4);
        }
    },
	
	/*------------ 保存一个项目 ------------*/
    update : function(){
        //收集项目信息
		var data_area=[];
		data_area.push([ "id" , global_id ]);
		data_area.push([ "name" , $('#name').val() ]);
		data_area.push([ "info" , $('#info').val() ]);
		data_area.push([ "html" , $('#html').val() ]);
		data_area.push([ "js" , $('#js').val() ]);
		data_area.push([ "css" , $('#css').val() ]);
		data_area.push([ "slice" , $('#slice').val() ]);
		data_area.push([ "sample" , $('#sample').val() ]);
		data_area.push([ "img" , $('#img').val() ]);
		var data_str=functions.requestToString(data_area);

        $.ajax({
            url:cgipath + 'project-typeUpdate',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:function(feedback){
				if(feedback.ret=="0"){
					message.show("message_div","","修改成功",1,"","window.location.href='project_type_manage.htm'");
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
    edit : function(){
		var data_str="&id="+global_id;
        $.ajax({
            url:cgipath + 'project-typeGetinfo',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:function(feedback){
				if(feedback.ret=="0"){
					 $('#name').val(feedback.record.name);
					 $('#info').val(feedback.record.info);
					 $('#html').val(feedback.record.html);
					 $('#css').val(feedback.record.css);
					 $('#js').val(feedback.record.js);
					 $('#slice').val(feedback.record.slice);
					 $('#sample').val(feedback.record.sample);
					 $("#img_preview").html("<img class=\"pick_img_preview\" src=\""+feedback.record.img+"\" />");
				}
				else{
					message.show("message_div","",feedback.msg,4);
				}
			
			}
        });
    },

	
	 /*------------ 删除项目 ------------*/
	 
	delConfirm:function(id){
		message.show("message_div","","确实要删除吗？",2,"","project_type.del("+id+");");
	},
	
    del : function(id){
		var data_str="&id="+id;
        $.ajax({
            url:cgipath + 'project-typeDel',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
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
					$("#img").val(file_data);
			  };
			})(img);
			imageReader.readAsDataURL(img);
		}
		else{
			alert("上传的文件不是图片");
		}	

}



