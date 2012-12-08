<?php
/*********************************************************************************
 * QAM 1.0 项目类
 *-------------------------------------------------------------------------------
 * $Author:Kundy
 * $Dtime:2011-9-4
***********************************************************************************/
$ret = array(
	  'ret'=>'-1',
	  'msg'=>"异常"
);
include_once('include/function.php'); 
include_once('module/feed.php'); 
class categoryMod
{
	public function add($postdata)
	{
		global $ret;
		$name=$postdata['name'];
		$info=$postdata['info'];

		$power_query="category-add";
		if(!(in_array($power_query,$_SESSION["session_power"]) || $_SESSION["session_admin"]==1 )){
			$ret['ret']='2';
			$ret['msg']="没有权限";
		}
		else if(empty($name)){
			$ret['ret']='1';
			$ret['msg']="参数错误";
		}
		else{
			$query_result_name=mysql_query("select * from category where name='".$name."'");
			$row_name=@mysql_fetch_assoc($query_result_name);
			if($row_name['id'] !=null )
			{
				$ret['ret']='3';
				$ret['msg']="分类名称已存在";
			}else{
				$sql = "insert into category(name,info) values ('$name','$info')";
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
		$info=$postdata['info']; 

		$power_query="category-update";
		if(!(in_array($power_query,$_SESSION["session_power"]) || $_SESSION["session_admin"]==1 )){
			$ret['ret']='2';
			$ret['msg']="没有权限";
		}
		else if(is_null($id)){
			$ret['ret']='1';
			$ret['msg']="参数错误";
		}
		else{
			$query_result_name=mysql_query("select * from category where name='".$name."' and id<>".$id);
			$row_name=@mysql_fetch_assoc($query_result_name);
			if($row_name['id'] !=null )
			{
				$ret['ret']='3';
				$ret['msg']="分类名称已存在";
			}
			else{
				$sql="update category set id=$id";
				if(!is_null($name))$sql.=",name='$name'";
				if(!is_null($info))$sql.=",info='$info'";
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
			$sql = "select * from category where id=".$id;
			$result=mysql_query($sql);
			$rs=mysql_fetch_assoc($result);
			
			$css_list=array();
			if($rs['id'] !=null )
			{	
				unset($css_list);
				$css_list=array();
				$query_css_name=mysql_query("select * from public_css where category_id=".$rs['id']);
				while($rs_css_name=mysql_fetch_array($query_css_name)){
					array_push($css_list,array("name"=>$rs_css_name["name"],"href"=>$rs_css_name["path"]));
				}
				
				$record=array("id"=>$rs['id'],"name"=>$rs['name'],"info"=>$rs['info']);
			
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
		
		$power_query="category-del";
		if(!(in_array($power_query,$_SESSION["session_power"]) || $_SESSION["session_admin"]==1 )){
			$ret['ret']='2';
			$ret['msg']="没有权限";
		}
		else if(empty($id) ){
			$ret['ret']='1';
			$ret['msg']="参数错误";
		}else{
			$sql = "delete from category where id=".$id;
			$sql_flag=mysql_query($sql);
			//同时删除项目文件夹
			@deldir("category/".$id."/");
			
			
			if($sql_flag){
				$ret['ret']='0';
				$ret['msg']="删除成功";
			}else{
				$ret['msg']="删除失败";
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

		//0：精确搜索   1：全局搜索
		$search_string="";
		$search_flag=$postdata['search_flag']; //搜索
		if(isset($search_flag) && $search_flag==0){
			$search_string=" where 1=1 ";
			if(strlen($postdata['name']))$search_string.=" and name like '%".$postdata['name']."%'";
		}
		else if(isset($search_flag) && $search_flag==1){
			$search_string=" where id=0 ";
			$search_data_arr=explode(" ",$postdata['search_data']);
			foreach($search_data_arr as $search_data){
				$search_string.="or CONCAT(name,info) like '%".$search_data."%'";
			}
		}
		
		$query_sql="select * from category ".$search_string;
		$query_result=mysql_query($query_sql);
		$ret['nums']=mysql_affected_rows();
		
		if(!empty($order))$query_sql.=" order by ".$order;
		if(!empty($desc) && $desc=="1")$query_sql.=" desc ";
		if(!empty($reqnum))$query_sql.=" limit ".($page-1)*$reqnum.",".$reqnum;
		$query_result=mysql_query($query_sql);
		$listdata=array();


		while($rs=mysql_fetch_array($query_result))
		{
			$record=array("id"=>$rs['id'],"name"=>$rs['name'],"info"=>$rs['info']);
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
$testmod=new categoryMod;
$testmod->typeShowlist();
*/


?>