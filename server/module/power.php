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
class powerMod
{
	public function add($postdata)
	{
		global $ret;
		$name=$postdata['name']; 
		$title=$postdata['title']; 
		$info=$postdata['info']; 
		$group=$postdata['group']; 
		$power_query="power-operate";
		if(!(in_array($power_query,$_SESSION["session_power"]) || $_SESSION["session_admin"]==1) ){
			$ret['ret']='2';
			$ret['msg']="没有权限";
		}
		else if(empty($name) || empty($title)){
			$ret['ret']='1';
			$ret['msg']="参数错误";
		}else{
		
			$query_result_name=mysql_query("select * from power where name='".$name."'");
			$row_name=@mysql_fetch_assoc($query_result_name);
			$query_result_key=mysql_query("select * from power where title='".$title."'");
			$row_key=@mysql_fetch_assoc($query_result_key);
			if($row_name['id'] !=null )
			{
				$ret['ret']='3';
				$ret['msg']="权限控制字已存在";
			}
			else if($row_key['id'] !=null )
			{
				$ret['ret']='4';
				$ret['msg']="权限名称已存在";
			}else{		
				$sql = "insert into power (name,title,info,power_group) values ('$name','$title','$info','$group')";
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
		$title=$postdata['title']; 
		$info=$postdata['info']; 
		$group=$postdata['group']; 
		$power_query="power-operate";
		if(!(in_array($power_query,$_SESSION["session_power"]) || $_SESSION["session_admin"]==1) ){
			$ret['ret']='2';
			$ret['msg']="没有权限";
		}
		else if(empty($name) || empty($title)){
			$ret['ret']='1';
			$ret['msg']="参数错误";
		}else{
			$sql_flag=mysql_query("update power set name='$name',power_group='$group',title='$title',info='$info' where id=".$id);
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
			$sql = "select * from power where id=".$id;
			$result=mysql_query($sql);
			$rs=mysql_fetch_assoc($result);
			if($rs['id'] !=null )
			{	
				$record=array("id"=>$rs['id'],"name"=>$rs['name'],"group"=>$rs['power_group'],"title"=>$rs['title'],"info"=>$rs['info']);
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
		
		$power_query="power-operate";
		if(!(in_array($power_query,$_SESSION["session_power"]) || $_SESSION["session_admin"]==1) ){
			$ret['ret']='2';
			$ret['msg']="没有权限";
		}
		else if(empty($id) ){
			$ret['ret']='1';
			$ret['msg']="参数错误";
		}else{
			$sql = "delete from power where id=".$id;
			$sql_flag=mysql_query($sql);
			if($sql_flag){
				$ret['ret']='0';
				$ret['msg']="删除成功";
			}else{
				$ret['msg']="删除失败";
			}
		}
		echo(json_encode($ret));
	}
	
	public function showlistByGroup($postdata)
	{
		global $ret;
		
		
		$sql = "select * from system where id=1";
		$result=mysql_query($sql);
		$rs=mysql_fetch_assoc($result);
		$group_arr=explode(";",$rs['power_sort']);
		$list_data_all=array();
		foreach($group_arr as $group_item){
			if(!empty($group_item)){
				$query_sql="select * from power where power_group='".$group_item."'";
				$query_result=mysql_query($query_sql);
				$listdata=array();
				while($rs=mysql_fetch_array($query_result))
				{
					$record=array("id"=>$rs['id'],"name"=>$rs['name'],"group"=>$rs['power_group'],"title"=>$rs['title'],"info"=>$rs['info']);
					array_push($listdata,$record);
				}
				array_push($list_data_all,array("group_name"=>$group_item,"group_data"=>$listdata));
			}
		}

		$ret['ret']='0';
		$ret['msg']="获取列表成功";
		$ret['listdata']=$list_data_all;
		echo(json_encode($ret));
	}
	
	public function showlist($postdata)
	{
		global $ret;
		$page=$postdata['page']; //第1页
		$reqnum=$postdata['reqnum']; //每页显示10条
		$order=$postdata['order']; //排序字段
		$desc=$postdata['desc']; //是否反序
		
		//0：精确搜索   1：全局搜索
		$search_string="";
		$search_flag=$postdata['search_flag']; //搜索
		if(isset($search_flag) && $search_flag==0){
			$search_string=" where 1=1 ";
			if(strlen($postdata['title']))$search_string.=" and title like '%".$postdata['title']."%'";
			if(strlen($postdata['name']))$search_string.=" and name like '%".$postdata['name']."%'";
			if(strlen($postdata['info']))$search_string.=" and info like '%".$postdata['info']."%'";
		}
		else if(isset($search_flag) && $search_flag==1){
			$search_string=" where id=0 ";
			$search_data_arr=explode(" ",$postdata['search_data']);
			foreach($search_data_arr as $search_data){
				$search_string.="or CONCAT(title,name,info) like '%".$search_data."%'";
			}
		}
		
		$query_sql="select * from power ".$search_string;
		$query_result=mysql_query($query_sql);
		$ret['nums']=mysql_affected_rows();
		

		if(!empty($order))$query_sql.=" order by ".$order;
		if(!empty($desc) && $desc=="1")$query_sql.=" desc ";
		if(!empty($reqnum))$query_sql.=" limit ".($page-1)*$reqnum.",".$reqnum;
		
		$query_result=mysql_query($query_sql);
		$listdata=array();
		while($rs=mysql_fetch_array($query_result))
		{
			$record=array("id"=>$rs['id'],"name"=>$rs['name'],"group"=>$rs['power_group'],"title"=>$rs['title'],"info"=>$rs['info']);
			array_push($listdata,$record);
		}
		$ret['ret']='0';
		$ret['msg']="获取列表成功";
		$ret['listdata']=$listdata;
		echo(json_encode($ret));
	}

}



?>  
