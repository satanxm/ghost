/*
 * Copy Right: Tencent ISUX
 * Project: QAM（Qzone模块化页面搭建平台）
 * Description: 备份还原
 * Author: kundy
 * date: 2012-1-5
 */

parent.nav_set(9);
var sql = {
	init:function(){
		$("#btn_add").click(function(){sql.backup();});
	},
    /*------------ 获取所有根项目信息 ------------*/
    showlist : function(){
		var data_str="";
        $.ajax({
                url: cgipath+'sql-showlist', type: 'POST',data: data_str,dataType: 'json', timeout: ajax_timeout,error: function(){notify.show(2,"请求数据失败，请刷新页面");},
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
				innerhtml+="<td><a href='javascript:void(0);' class=\"op_sub_href\" onclick=\"sql.restore('"+listdata[i].name+"');\" ><i class='ico ico_edit'></i>还原</a>";
				innerhtml+="<a href='javascript:void(0);' class=\"op_sub_href\" onclick=\"sql.delConfirm('"+listdata[i].name+"');\" ><i class=\"ico ico_del\"></i>删除</a></td>";
                innerhtml+="</tr>";
            }
			 $("#list_area").html(innerhtml);
        }
        else{
             message.show("message_div","",feedback.msg,4);
        }
    },
	


    backup : function(){
		notify.show(1,"正在备份，请稍候");
		var data_str="";
        $.ajax({
            url:cgipath + 'sql-backup',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:this.handlebackup
        });
    },

    handlebackup : function (feedback){
        if(feedback.ret=="0"){
			message.show("message_div","","备份成功",3,"","sql.showlist();");
			notify.close();
        }
        else{
            message.show("message_div","",feedback.msg,4);
        }
    },
	
    restore : function(t){
		notify.show(1,"正在还原，请稍候");
		var data_area=[];
		data_area.push([ "name" ,t ]);
		var data_str=functions.requestToString(data_area);
        $.ajax({
            url:cgipath + 'sql-restore',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:this.handlRestore
        });
    },

    handlRestore : function (feedback){
        if(feedback.ret=="0"){
            message.show("message_div","","还原成功",3);
			notify.close();
        }
        else{
            message.show("message_div","",feedback.msg,4);
        }
    },

	

	 /*------------ 删除项目 ------------*/
	 
	delConfirm:function(t){
		message.show("message_div","","确实要删除吗？",2,"","sql.del('"+t+"');");
	},
	
    del : function(t){
		var data_area=[];
		data_area.push([ "name" ,t ]);
		var data_str=functions.requestToString(data_area);
        $.ajax({
            url:cgipath + 'sql-del',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
            success:this.handledel
        });
    },

    handledel : function (feedback){
        if(feedback.ret=="0"){
            message.show("message_div","","删除成功",3,"","sql.showlist();");
        }
        else{
            message.show("message_div","",feedback.msg,4);
        }
    }

}

