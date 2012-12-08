<?php
/*********************************************************************************
 * QAM 1.0 权限类
 *-------------------------------------------------------------------------------
 * $Author:Kundy
 * $Dtime:2011-9-4
***********************************************************************************/
$ret = array(
	  'ret'=>'-1',
	  'msg'=>"异常"
);
include_once('include/function.php'); 
class groupMod
{
	public function checkName($postdata)
	{
		global $ret;
		$name=$postdata['name'];
		
		if(empty($name) ){
			$ret['ret']='1';
			$ret['msg']="参数错误";
		}else{
			$sql = "select * from usergroup where name='".$name."'";
			$result=mysql_query($sql);
			$rs=mysql_fetch_assoc($result);
			
			$css_list=array();
			if($rs['id'] !=null ){
				$ret['ret']='0';
				$ret['msg']="名称存在";
			}
			else{
				$ret['ret']='3';
				$ret['msg']="名称不存在";
			}
			$ret['record']=$record;
		}
		echo(json_encode($ret));
	}
	public function add($postdata)
	{
		global $ret;
		$name=$postdata['name']; 
		$power=$postdata['power']; 
		$admin=$postdata['admin']; 
		
		$power_query="group-operate";
		if(!(in_array($power_query,$_SESSION["session_power"]) || $_SESSION["session_admin"]==1 )){
			$ret['ret']='2';
			$ret['msg']="没有权限";
		}
		else if(empty($name) || is_null($admin)){
			$ret['ret']='1';
			$ret['msg']="参数错误";
		}else{
		
			$query_result_name=mysql_query("select * from usergroup where name='".$name."'");
			$row_name=@mysql_fetch_assoc($query_result_name);
			if($row_name['id'] !=null )
			{
				$ret['ret']='3';
				$ret['msg']="用户组已存在";
			}
			else{		
				$sql = "insert into usergroup(name,power,admin) values ('$name','$power','$admin')";
				$sql_flag=mysql_query($sql);
				if($sql_flag){
					$ret['ret']='0';
					$ret['msg']="添加成功";
				}else{
					$ret['msg']="添加失败";
				}
			}
		}
		echo(json_encode($ret));
	}
	public function update($postdata)
	{
		global $ret;
		$id=$postdata['id']; 
		$name=$postdata['name']; 
		$power=$postdata['power']; 
		$admin=$postdata['admin']; 
		$power_query="group-operate";
		if(!(in_array($power_query,$_SESSION["session_power"]) || $_SESSION["session_admin"]==1 )){
			$ret['ret']='2';
			$ret['msg']="没有权限";
		}
		else if(empty($name) || is_null($admin)){
			$ret['ret']='1';
			$ret['msg']="参数错误";
		}else{
			$sql_flag=mysql_query("update usergroup set name='$name',power='$power',admin='$admin' where id=".$id);
			if($sql_flag){
					$ret['ret']='0';
					$ret['msg']="修改成功";
				}else{
					$ret['msg']="修改失败";
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
			$sql = "select * from usergroup where id=".$id;
			$result=mysql_query($sql);
			$rs=mysql_fetch_assoc($result);
			if($rs['id'] !=null )
			{	
				$record=array("id"=>$rs['id'],"name"=>$rs['name'],"power"=>$rs['power'],"admin"=>$rs['admin']);
			}
			$ret['ret']='0';
			$ret['msg']="获取数据成功";
			$ret['record']=$record;
		}
		echo(json_encode($ret));
	}
	public function del($postdata)
	{
		global $ret;
		$id=$postdata['id']; 
		
		$power_query="group-operate";
		if(!(in_array($power_query,$_SESSION["session_power"]) || $_SESSION["session_admin"]==1 )){
			$ret['ret']='2';
			$ret['msg']="没有权限";
		}
		else if(empty($id) ){
			$ret['ret']='1';
			$ret['msg']="参数错误";
		}else{
			if($id!="1" && $id!="2" && $id!="3"){
				$sql = "delete from usergroup where id=".$id;
				$sql_flag=mysql_query($sql);
				if($sql_flag){
					$ret['ret']='0';
					$ret['msg']="删除成功";
				}else{
					$ret['msg']="删除失败";
				}
			}
			else{
				$ret['ret']='3';
				$ret['msg']="删除失败，系统级用户组不允许删除";
			}
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

		
		$query_sql="select * from usergroup ";
		$query_result=mysql_query($query_sql);
		$ret['nums']=mysql_affected_rows();
		

		if(!empty($order))$query_sql.=" order by ".$order;
		if(!empty($desc) && $desc=="1")$query_sql.=" desc ";
		if(!empty($reqnum))$query_sql.=" limit ".($page-1)*$reqnum.",".$reqnum;
		
		$query_result=mysql_query($query_sql);
		$listdata=array();
		while($rs=mysql_fetch_array($query_result))
		{
			$record=array("id"=>$rs['id'],"name"=>$rs['name'],"power"=>$rs['power'],"admin"=>$rs['admin']);
			array_push($listdata,$record);
		}
		$ret['ret']='0';
		$ret['msg']="获取列表成功";
		$ret['listdata']=$listdata;
		echo(json_encode($ret));
	}

}

/*
require('../include/conn.php');
$testmod=new groupMod;
$testmod->showlist();
*/

?>