<?php
/*********************************************************************************
 * QAM 1.0 链接类
 *-------------------------------------------------------------------------------
 * $Author:Kundy
 * $Dtime:2012-1-6
***********************************************************************************/
$ret = array(
	  'ret'=>'-1',
	  'msg'=>"异常"
);
include_once('include/function.php'); 
class linkMod
{
	public function add($postdata)
	{
		global $ret;
		$name=$postdata['name'];
		$url=$postdata['url'];
		$type=$postdata['type'];

		$power_query="link-operate";
		if(!(in_array($power_query,$_SESSION["session_power"]) || $_SESSION["session_admin"]==1 )){
			$ret['ret']='2';
			$ret['msg']="没有权限";
		}
		else if(empty($name) || is_null($url) || is_null($type)){
			$ret['ret']='1';
			$ret['msg']="参数错误";
		}
		else{
			$query_result_name=mysql_query("select * from link where name='".$name."'");
			$row_name=@mysql_fetch_assoc($query_result_name);
			if($row_name['id'] !=null )
			{
				$ret['ret']='3';
				$ret['msg']="链接名称已存在";
			}else{
				$sql = "insert into link(name,url,type) values ('$name','$url',$type)";
				$sql_flag=mysql_query($sql);
				if($sql_flag){
					$ret['ret']='0';
					$ret['msg']="添加成功";
				}else{
					$ret['msg']="添加失败";
				}
			}
		}
		$this->generate();
		echo(json_encode($ret));
	}
	public function update($postdata)
	{
		global $ret;
		$id=$postdata['id']; 
		$name=$postdata['name']; 
		$url=$postdata['url']; 
		$type=$postdata['type']; 
		
		$power_query="link-operate";
		if(!(in_array($power_query,$_SESSION["session_power"]) || $_SESSION["session_admin"]==1 )){
			$ret['ret']='2';
			$ret['msg']="没有权限";
		}
		else if(is_null($id)){
			$ret['ret']='1';
			$ret['msg']="参数错误";
		}
		else{
			$query_result_name=mysql_query("select * from link where name='".$name."' and id<>".$id);
			$row_name=@mysql_fetch_assoc($query_result_name);
			if($row_name['id'] !=null )
			{
				$ret['ret']='3';
				$ret['msg']="链接名称已存在";
			}
			else{
				$sql="update link set id=$id";
				if(!is_null($name))$sql.=",name='$name'";
				if(!is_null($url))$sql.=",url='$url'";
				if(!is_null($type))$sql.=",type='$type'";
				$sql.=" where id=".$id;
				$sql_flag=mysql_query($sql);
				if($sql_flag){
					$ret['ret']='0';
					$ret['msg']="修改成功";
				}else{
					$ret['msg']="修改失败";
				}
			}
		}
		$this->generate();
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
			$sql = "select * from link where id=".$id;
			$result=mysql_query($sql);
			$rs=mysql_fetch_assoc($result);
			
			$css_list=array();
			if($rs['id'] !=null )
			{	
			
				$record=array("id"=>$rs['id'],"name"=>$rs['name'],"url"=>$rs['url'],"type"=>$rs['type']);
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
		
		$power_query="link-operate";
		if(!(in_array($power_query,$_SESSION["session_power"]) || $_SESSION["session_admin"]==1 )){
			$ret['ret']='2';
			$ret['msg']="没有权限";
		}
		else if(empty($id) ){
			$ret['ret']='1';
			$ret['msg']="参数错误";
		}else{
			$sql = "delete from link where id=".$id;
			$sql_flag=mysql_query($sql);
			if($sql_flag){
				$ret['ret']='0';
				$ret['msg']="删除成功";
			}else{
				$ret['msg']="删除失败";
			}

		}
		$this->generate();
		echo(json_encode($ret));
	}
	
	public function generate(){
		$query_result=mysql_query("select * from link where type=1 order by id ");
		$listdata_0=array();
		while($rs=mysql_fetch_array($query_result))
		{
			$record=array("id"=>$rs['id'],"name"=>$rs['name'],"url"=>$rs['url']);
			array_push($listdata_0,$record);
		}
		$query_result=mysql_query("select * from link where type=2 order by id ");
		$listdata_1=array();
		while($rs=mysql_fetch_array($query_result))
		{
			$record=array("id"=>$rs['id'],"name"=>$rs['name'],"url"=>$rs['url']);
			array_push($listdata_1,$record);
		}
		$link_text="link.xml";
		file_put_contents($link_text,json_encode(array("links"=>$listdata_0,"tools"=>$listdata_1)));
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
			if(strlen($postdata['name']))$search_string.=" and name like '%".$postdata['name']."%'";
			if(strlen($postdata['url']))$search_string.=" and info like '%".$postdata['info']."%'";
		}
		else if(isset($search_flag) && $search_flag==1){
			$search_string=" where id=0 ";
			$search_data_arr=explode(" ",$postdata['search_data']);
			foreach($search_data_arr as $search_data){
				$search_string.="or CONCAT(name,url) like '%".$search_data."%'";
			}
		}
		
		$query_sql="select * from link ".$search_string;
		$query_result=mysql_query($query_sql);
		$ret['nums']=mysql_affected_rows();
		

		if(!empty($order))$query_sql.=" order by ".$order;
		if(!empty($desc) && $desc=="1")$query_sql.=" desc ";
		if(!empty($reqnum))$query_sql.=" limit ".($page-1)*$reqnum.",".$reqnum;
		$query_result=mysql_query($query_sql);
		$listdata=array();
		while($rs=mysql_fetch_array($query_result))
		{
			$record=array("id"=>$rs['id'],"name"=>$rs['name'],"url"=>$rs['url'],"type"=>$rs['type']);
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
$testmod=new projectMod;
$testmod->typeShowlist();
*/


?>  
