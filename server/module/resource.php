<?php
/*********************************************************************************
 * QAM 1.0 代码分析类
 *-------------------------------------------------------------------------------
 * $Author:Kundy
 * $Dtime:2011-9-4
***********************************************************************************/

include_once('include/simple_html_dom.php'); 
include_once('include/function.php'); 

$ret = array(
	  'ret'=>'-1',
	  'msg'=>"异常"
);


class resourceMod
{

	public function add($postdata)
	{
		global $ret;
		$url=$postdata['url'];
		$info=$postdata['info'];
		$name=$postdata['name'];
		$author=$postdata["author"];

		$plugin_user=true;
		$power_flag=false;

		if(!isset($author)){
			$author=$_COOKIE["name"];
			$power_flag=true;
			$plugin_user=false;
		}
		else{		
			//数据库中无此用户

			$sql_user = "select * from user where name='".$author."'";
			$result_user=mysql_query($sql_user);
			$rs_user=mysql_fetch_assoc($result_user);
			if( !isset($rs_user['id']) ){
				$plugin_user=false;
			}
		}
		$power_query="resource-add";

		if( !(in_array($power_query,$_SESSION["session_power"]) || $_SESSION["session_admin"]==1 ) && $power_flag){
			$ret['ret']='2';
			$ret['msg']="没有权限";
		}
		else if(empty($author)){
			$ret['ret']='3';
			$ret['msg']="找不到此用户";
		}
		else if(empty($url) || empty($name)){
			$ret['ret']='1';
			$ret['msg']="参数错误";
		}
		else{
			$query_result_check=mysql_query("select * from resource where url='".$url."'");
			$row_check=@mysql_fetch_assoc($query_result_check);
			if($row_check['id'] !=null )
			{
				$ret['ret']='4';
				$ret['msg']="该资源已添加过！";
			}
			else{
				$build_time=time();
				$sql = "insert into resource(url,info,name,author,build_time) values ('$url','$info','$name','$author',$build_time)";
				$sql_flag=mysql_query($sql);
				if($sql_flag){
					$mysql_insert_id=mysql_insert_id();
					$ret['resource_id']=$mysql_insert_id;
					$ret['ret']='0';
					$ret['msg']="添加成功";
				}else{
					$ret['msg']="添加失败";
				}
			}
			
		}

		echo(json_encode($ret));
	}

	public function addDirect($postdata)
	{
		var_dump($postdata);
		global $ret;
		$url=$postdata['url'];
		$info=$postdata['info'];
		$name=$postdata['name'];
		$callback=$postdata['callback'];
		$author=$postdata["author"];

		$power_query="resource-add";

		if( empty($url) || empty($author) || empty($name) ){
			$ret['ret']='1';
			$ret['msg']="参数错误";
		}
		else{
			$build_time=time();
			$sql = "insert into resource(url,info,name,author,build_time) values ('$url','$info','$name','$author',$build_time)";
			$sql_flag=mysql_query($sql);
			
			if($sql_flag){
				$mysql_insert_id=mysql_insert_id();
				$ret['resource_id']=$mysql_insert_id;
				$ret['ret']='0';
				$ret['msg']="添加成功";
			}else{
				$ret['msg']="添加失败";
			}
		}

		if($ret['ret']==0){
			echo( $callback . "(0)" );
		}
		else{
			echo( $callback . "(1)" );
		}
	}
	/*
	status:认领各状态
	0：未认领，可认领
	1：已认领：可取消认领claimCancel、可完成finish
	2：已完成
	3：已超时：可认领
	*************************************/
	public function claim($postdata)
	{
		global $ret;
		$id=$postdata['id']; 
		$claimer=$_COOKIE["name"];
	
		$power_query="resource-claim";

		if(!(in_array($power_query,$_SESSION["session_power"]) || $_SESSION["session_admin"]==1 )){
			$ret['ret']='2';
			$ret['msg']="没有权限";
		}
		else if(empty($id)){
			$ret['ret']='1';
			$ret['msg']="参数错误";
		}
		else{

			$claim_time=time();
			
			$sql_status=mysql_query("select * from resource where id=".$id);
			$row_status=mysql_fetch_assoc($sql_status);
			$status=$row_status["status"];
			$claim_time2=$row_status["claim_time"];
			
			//判断是否超时
			if($status==1){
				$time_now=time();
				if(($time_now-$claim_time2)>3*24*3600){
					$status=3;
				}
			}
			
			if($status==0 || $status==3){
				$page_id=$row_status["page_id"];
				$mysql_insert_id=0;
				if($page_id==0){
					//创建新页面，status为0，默认不显示
					$sql_page = "insert into page(name,content,adjust_time,adjuster,info,author,build_time,status) values ('".$row_status["name"]."','',0,'','','$claimer','$claim_time',0)";
					mysql_query($sql_page);
					$mysql_insert_id=mysql_insert_id();
				}
				else{
					//已有页面，修改页面作者
					$sql_page = "update page set author='$claimer',build_time='$claim_time' where id=".$page_id;
					mysql_query($sql_page);
				}
					
				$sql_update="update resource set claimer='".$claimer."',claim_time=".$claim_time.",status=1";
				if($mysql_insert_id)$sql_update.=",page_id=".$mysql_insert_id;
				$sql_update.=" where id=".$id;
				$sql_flag=mysql_query($sql_update);
				if($sql_flag){
					
					
					$ret['img_status']=$img_status;
					$ret['ret']='0';
					$ret['msg']="认领成功";
					
				}else{
					$ret['ret']='-1';
					$ret['msg']="认领失败";
				}
			
			}
			else if($status==1)
			{
				$ret['ret']='3';
				$ret['msg']="认领失败，已认领";
			}
			else if($status==2)
			{
				$ret['ret']='4';
				$ret['msg']="认领失败，该资源已分析完成";
			}

			
		}
		
		echo(json_encode($ret));
	}
	public function claimCancel($postdata)
	{
		global $ret;
		$id=$postdata['id']; 
		$claimer=$_COOKIE["name"];
	
		$power_query="resource-claimCancel";

		if(!(in_array($power_query,$_SESSION["session_power"]) || $_SESSION["session_admin"]==1 )){
			$ret['ret']='2';
			$ret['msg']="没有权限";
		}
		else if(empty($id)){
			$ret['ret']='1';
			$ret['msg']="参数错误";
		}
		else{

			$claim_time=time();
			
			$sql_status=mysql_query("select * from resource where id=".$id);
			$row_status=mysql_fetch_assoc($sql_status);
			$status=$row_status["status"];
			$claimer2=$row_status["claimer"];
			
			if( ($status==1 || $status==3 ) && $claimer==$claimer2){
				$sql_update="update resource set claimer='',claim_time=0,status=0 where id=".$id;
				$sql_flag=mysql_query($sql_update);
				if($sql_flag){
					
					$ret['img_status']=$img_status;
					$ret['ret']='0';
					$ret['msg']="取消认领成功";
					
				}else{
					$ret['ret']='-1';
					$ret['msg']="取消认领失败";
				}
			
			}
			else if($claimer!=$claimer2)
			{
				$ret['ret']='3';
				$ret['msg']="取消认领失败，你不是认领者";
			}
			else if($status==0)
			{
				$ret['ret']='4';
				$ret['msg']="取消认领失败，该资源未被认领";
			}
			else if($status==2)
			{
				$ret['ret']='5';
				$ret['msg']="取消认领失败，该资源已分析完成";
			}

			
		}
		
		echo(json_encode($ret));
	}
	
	public function finish($postdata)
	{
		global $ret;
		$id=$postdata['id']; 
		$claimer=$_COOKIE["name"];
	
		$power_query="resource-finish";

		if(!(in_array($power_query,$_SESSION["session_power"]) || $_SESSION["session_admin"]==1 )){
			$ret['ret']='2';
			$ret['msg']="没有权限";
		}
		else if(empty($id)){
			$ret['ret']='1';
			$ret['msg']="参数错误";
		}
		else{

			$claim_time=time();
			
			$sql_status=mysql_query("select * from resource where id=".$id);
			$row_status=mysql_fetch_assoc($sql_status);
			$status=$row_status["status"];
			$claimer2=$row_status["claimer"];
			
			if( ($status==1 || $status==3 ) && $claimer==$claimer2){
				//设置页面status为1，可以正常显示
				$page_id=$row_status["page_id"];
				$sql_page="update page set status=2 where id=".$page_id;
				mysql_query($sql_page);
				
				
				$sql_update="update resource set status=2 where id=".$id;
				$sql_flag=mysql_query($sql_update);
				if($sql_flag){
					
					$ret['img_status']=$img_status;
					$ret['ret']='0';
					$ret['msg']="操作成功";
					
				}else{
					$ret['ret']='2';
					$ret['msg']="操作失败";
				}
			
			}
			else if($claimer!=$claimer2)
			{
				$ret['ret']='3';
				$ret['msg']="操作失败，你不是认领者";
			}
			else if($status==0)
			{
				$ret['ret']='4';
				$ret['msg']="操作失败，该资源还未被认领";
			}
			else if($status==2)
			{
				$ret['ret']='5';
				$ret['msg']="操作失败，该资源已分析完成";
			}
			
		}
		
		echo(json_encode($ret));
	}
	
	
	public function del($postdata)
	{
		global $ret;
		$id=$postdata['id']; 
		$user=$_COOKIE["name"];

		$power_query="resource-del";
		
		if(!(in_array($power_query,$_SESSION["session_power"]) || $_SESSION["session_admin"]==1 )){
			$ret['ret']='2';
			$ret['msg']="没有权限";
		}
		else if(empty($id) ){
			$ret['ret']='1';
			$ret['msg']="参数错误";
		}else{

			$sql_status=mysql_query("select * from resource where id=".$id);
			$row_status=mysql_fetch_assoc($sql_status);
			$status=$row_status["status"];
			$user2=$row_status["author"];

			$claim_time=$row_status["claim_time"];
			if($status==1){
				$time_now=time();
				if(($time_now-$claim_time)>3*24*3600){
					$status=3;
				}
			}

			//资源状态为0或3，并且资源为作者本人时，才可以删除，管理员无条件修改
			if( (($status==0 || $status==3 ) && $user==$user2) || $_SESSION["session_admin"]==1 ){
				$sql = "delete from resource where id=".$id;
				$sql_flag=mysql_query($sql);
				if($sql_flag){
					$ret['ret']='0';
					$ret['msg']="删除成功";
				}else{
					$ret['msg']="删除失败";
				}
			
			}
			else if($user!=$user2)
			{
				$ret['ret']='3';
				$ret['msg']="删除失败，你不是资源作者";
			}
			else if($status==1)
			{
				$ret['ret']='4';
				$ret['msg']="删除失败，该资源已经被认领";
			}
			else if($status==2)
			{
				$ret['ret']='5';
				$ret['msg']="删除失败，该资源已分析完成";
			}
		}
		echo(json_encode($ret));
	}

	public function update($postdata)
	{
		global $ret;
		$id=$postdata['id']; 
		$info=$postdata['info']; 
		$url=$postdata['url']; 
		$name=$postdata['name']; 

		$user=$_COOKIE["name"];

		$power_query="resource-update";
		if(!(in_array($power_query,$_SESSION["session_power"]) || $_SESSION["session_admin"]==1) ){
			$ret['ret']='2';
			$ret['msg']="没有权限";
		}
		else if(empty($id)){
			$ret['ret']='1';
			$ret['msg']="参数错误";
		}else{
		
			$sql_status=mysql_query("select * from resource where id=".$id);
			$row_status=mysql_fetch_assoc($sql_status);
			$status=$row_status["status"];
			$user2=$row_status["author"];

			$claim_time=$row_status["claim_time"];
			if($status==1){
				$time_now=time();
				if(($time_now-$claim_time)>3*24*3600){
					$status=3;
				}
			}

			//资源状态为0或3，并且资源为作者本人时，才可以修改，管理员无条件修改
			if( (($status==0 || $status==3 ) && $user==$user2) || $_SESSION["session_admin"]==1 ){
				$sql_flag=mysql_query("update resource set info='$info',url='$url',name='$name' where id=".$id);
				if($sql_flag){
					$ret['ret']='0';
					$ret['msg']="修改成功";
				}else{
					$ret['msg']="修改失败";
				}
			
			}
			else if($user!=$user2)
			{
				$ret['ret']='3';
				$ret['msg']="修改失败，你不是资源作者";
			}
			else if($status==1)
			{
				$ret['ret']='4';
				$ret['msg']="修改失败，该资源已经被认领";
			}
			else if($status==2)
			{
				$ret['ret']='5';
				$ret['msg']="修改失败，该资源已分析完成";
			}
		}
		echo(json_encode($ret));
	}

	public function getinfo($postdata)
	{
		global $ret;
		$id=$postdata['id'];

		if(empty($id) ){
			$ret['ret']='1';
			$ret['msg']="参数错误";
		}else{
			$sql = "select * from resource where id=".$id;
			$result=mysql_query($sql);
			$rs=mysql_fetch_assoc($result);
			if($rs['id'] !=null )
			{	
				//判断是否超时
				$status=$rs["status"];
				$claim_time=$rs["claim_time"];
				if($status==1){
					$time_now=time();
					if(($time_now-$claim_time)>3*24*3600){
						$status=3;
					}
				}
				$record=array("id"=>$rs['id'],"page_id"=>$rs['page_id'],"url"=>$rs['url'],"info"=>$rs['info'],"name"=>$rs['name'],"author"=>$rs['author'],"build_time"=>$rs['build_time'],"claim_time"=>$rs['claim_time'],"claimer"=>$rs["claimer"],"status"=>$status);
			}
			$ret['ret']='0';
			$ret['msg']="获取数据成功";
			$ret['record']=$record;
		}
		echo(json_encode($ret));
	}

	public function showlist($postdata)
	{
		global $ret;
		$page=$postdata['page']; //第1页
		$reqnum=$postdata['reqnum']; //每页显示10条
		$order=$postdata['order']; //排序字段
		$desc=$postdata['desc']; //是否反序

		
		$power_query="resource-showlist";
		
		if(!(in_array($power_query,$_SESSION["session_power"]) || $_SESSION["session_admin"]==1 )){
			$ret['ret']='2';
			$ret['msg']="没有权限";
		}
		else{
			//0：精确搜索   1：全局搜索
			$search_string="1=1 ";
			$search_flag=$postdata['search_flag']; //搜索
			if(isset($search_flag) && $search_flag==0){
				if(strlen($postdata['status'])){
					//status要单独处理
					$time_now=time();
					$time_out=time()-3*24*3600;
					
					if($postdata['status']*1 == 3)
						$search_string.=" and status = 1 and claim_time < ".$time_out;
					else if($postdata['status']*1 == 1)
						$search_string.=" and status = 1 and claim_time > ".$time_out;
					else
						$search_string.=" and status = ".$postdata['status'];
				}
				if( strlen($postdata['author']) ){
					$search_string.=" and author = '".$postdata['author']."'";	
				}
				if( strlen($postdata['claimer']) ){
					$search_string.=" and claimer = '".$postdata['claimer']."'";	
				}
			}
			else if(isset($search_flag) && $search_flag==1){
				$search_data_arr=explode(" ",$postdata['search_data']);
				$search_string.=" and ( 1=1  ";
				foreach($search_data_arr as $search_data){
					$search_string.="and CONCAT(url,info,name) like '%".$search_data."%'";
				}
				$search_string.=")";
			}
	
			
			$query_sql="select * from resource where ".$search_string;
			$query_result=mysql_query($query_sql);
			$ret['nums']=mysql_affected_rows();
			
			//查询category_name
			

			if(!empty($order))$query_sql.=" order by ".$order;
			if(!empty($desc) && $desc=="1")$query_sql.=" desc ";
			if(!empty($reqnum))$query_sql.=" limit ".($page-1)*$reqnum.",".$reqnum;

			$query_result=mysql_query($query_sql);
			$listdata=array();
			while($rs=mysql_fetch_array($query_result))
			{
				//判断是否超时
				$status=$rs["status"];
				$claim_time=$rs["claim_time"];
				if($status==1){
					$time_now=time();
					if(($time_now-$claim_time)>3*24*3600){
						$status=3;
					}
				}
				$record=array("id"=>$rs['id'],"page_id"=>$rs['page_id'],"url"=>$rs['url'],"name"=>$rs['name'],"info"=>$rs['info'],"author"=>$rs['author'],"build_time"=>$rs['build_time'],"claim_time"=>$rs['claim_time'],"claimer"=>$rs["claimer"],"status"=>$status);
				array_push($listdata,$record);
			}
			$ret['ret']='0';
			$ret['msg']="获取列表成功";
			$ret['listdata']=$listdata;
		}
		echo(json_encode($ret));
	}
	
}
/*
include_once('../include/simple_html_dom.php'); 
include_once('../include/function.php'); 
require('../include/conn.php');
$testmod=new pageMod;
$testmod->generate("38");
*/
?>