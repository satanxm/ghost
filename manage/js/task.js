/*
 * Copy Right: Tencent ISUX
 * Project: QAM（Qzone模块化页面搭建平台）
 * Description: 任务管理
 * Author: kundy
 * date: 2012-2-20
 */

//parent.nav_set(9);


var task = {
	init:function(){
		$("#page_up").click(function(){task.list_page(-1);});
		$("#page_down").click(function(){task.list_page(1);});
		$("#search_all").click(function(){task.list_page(1);});
		$("#search_all").click(function(){
			task.search_all();
		});
		$("#search_quee").click(function(){
			task.search_quee();
		});
	},
	
	
	search_all:function(){
		this.search_data=[];
		this.page=1;
		this.showlist();
	},
	
	search_quee:function(){
		this.search_data=[];
		this.page=1;
		this.search_data.push([ "search_flag" , 0 ]);
		this.search_data.push([ "task_flag" , 0 ]);
		this.showlist();
	},
	
	search_data:[],
	page:1,//第几页
	reqnum:10,//每页显示多少条
	order:"id",//排序字段
	desc:1,//反序,0或空正常排序，1反序
	page_nums:0,//总页数

    showlist : function(){
		var data_area=[];
		data_area.push([ "page" , task.page ]);
		data_area.push([ "reqnum" , task.reqnum ]);
		data_area.push([ "order" , task.order ]);
		data_area.push([ "desc" , task.desc ]);
		var data_str=functions.requestToString(data_area);
		if(this.search_data.length>0)
			data_area=data_area.concat(this.search_data);
		
		var data_str=functions.requestToString(data_area);
        $.ajax({
                url: cgipath+'task-showlist', type: 'POST',data: data_str,dataType: 'json', timeout: ajax_timeout,error: function(){notify.show(2,"请求数据失败，请刷新页面");},
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
                innerhtml+="<td>"+listdata[i].author+"</td>";
				innerhtml+="<td>"+listdata[i].info+"</td>";
				innerhtml+="<td>"+"<div>"+listdata[i].build_time+"</div>";
				if(listdata[i].run_time!=null)innerhtml+="<div>"+listdata[i].run_time+"</div>";
				if(listdata[i].finish_time!=null)innerhtml+="<div>"+listdata[i].finish_time+"</div>";
				innerhtml+="</td>";
				
				innerhtml+="<td>"
				if(listdata[i].finish_time!=null){
					var t1=new Date(listdata[i].build_time);
					var t2=new Date(listdata[i].run_time);
					var t3=new Date(listdata[i].finish_time);
					var finish_time=Math.ceil((t3.getTime()-t1.getTime())/1000);
					var run_time=Math.ceil((t3.getTime()-t1.getTime())/1000);
					innerhtml+=finish_time+"/"+run_time;
				}
				innerhtml+="</td>";
				
				var task_flag="队列中";
				if(listdata[i].task_flag==1)task_flag="执行中";
				else if(listdata[i].task_flag==2)task_flag="成功";
				else if(listdata[i].task_flag==3)task_flag="失败";
				innerhtml+="<td>"+task_flag+"</td>";
                innerhtml+="<td>";
				innerhtml+="<a href='javascript:void(0);' class=\"op_sub_href\" onclick=\"task.delConfirm("+listdata[i].id+");\" ><i class=\"ico ico_del\"></i>删除</a></td>";
                innerhtml+="</tr>";
            }
			//翻页组件
			task.page_nums=Math.ceil(feedback.nums/task.reqnum);
			if(task.page_nums<task.page)task.page=task.page_nums;//防止page_nums等于0的情况
			$("#page_nums").html(task.page+"/"+task.page_nums);
			if(task.page==1)
				$("#page_up").removeClass("ico_page_left").addClass("ico_page_left_n");
			else
				$("#page_up").removeClass("ico_page_left_n").addClass("ico_page_left");
			if(task.page_nums==task.page)
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
			task.order=order;
			if(task.desc*1==1)task.desc=0;
			else task.desc=1;
		}
	
		task.page=task.page-(-1)*t;
		if(task.page<=0)task.page=1;
		else if(task.page>task.page_nums) task.page=task.page_nums;
		task.showlist();
	},
	
	 /*------------ 删除项目 ------------*/
	 
	delConfirm:function(id){
		message.show("message_div","","确实要删除吗？",2,"","task.del("+id+");");
	},
	
    del : function(id){
		var data_str="&id="+id;
        $.ajax({
            url:cgipath + 'task-del',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {notify.show(2,"请求数据失败，请刷新页面");},
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



