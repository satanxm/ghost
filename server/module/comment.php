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
class commentMod
{
	public function add($postdata)
	{
		global $ret;
		$page_id=$postdata['page_id'];
		$content=$postdata['content'];
		$author=$_COOKIE["name"];
		$build_time=time();

		$power_query="comment-add";

		if(!(in_array($power_query,$_SESSION["session_power"]) || $_SESSION["session_admin"]==1 )){
			$ret['ret']='2';
			$ret['msg']="没有权限";
		}
		else if(empty($page_id)){
			$ret['ret']='1';
			$ret['msg']="参数错误";
		}
		else{

			$sql = "insert into comment(page_id,content,author,build_time) values ('$page_id','$content','$author','$build_time')";
			$sql_flag=mysql_query($sql);
			if($sql_flag){
				$ret['ret']='0';
				$ret['msg']="添加成功";
			}else{
				$ret['msg']="添加失败";
			}
		}
			
		
		echo(json_encode($ret));
	}
	
	
	public function del($postdata)
	{
		global $ret;
		$id=$postdata['id']; 
		$author=$_COOKIE["name"];

		$power_query="comment-del";
		if(!(in_array($power_query,$_SESSION["session_power"]) || $_SESSION["session_admin"]==1 )){
			$ret['ret']='2';
			$ret['msg']="没有权限";
		}
		else if(empty($id) ){
			$ret['ret']='1';
			$ret['msg']="参数错误";
		}else{

			$sql_user=mysql_query("select * from comment where id=".$id);
			$row_user=mysql_fetch_assoc($sql_user);
			$author2=$row_user["author"];
			if($author==$author2 || $_SESSION["session_admin"]==1){

				$sql = "delete from comment where id=".$id;
				$sql_flag=mysql_query($sql);
				//同时删除项目文件夹
				@deldir("comment/".$id."/");
				
				
				if($sql_flag){
					$ret['ret']='0';
					$ret['msg']="删除成功";
				}else{
					$ret['msg']="删除失败";
				}
			}
			else if($author!=$author2 && $_SESSION["session_admin"]!=1){
				$ret['ret']='3';
				$ret['msg']="删除失败";
			}
			
		}
		echo(json_encode($ret));
	}
	
	
	
	
	public function showlist($postdata)
	{
		global $ret;
		$page_id=$postdata['page_id']; //第1页
		$page=$postdata['page']; //第1页
		$reqnum=$postdata['reqnum']; //每页显示10条
		$order=$postdata['order']; //排序字段
		$desc=$postdata['desc']; //是否反序

		//0：精确搜索   1：全局搜索
		$search_string=" where page_id=".$page_id;
		
		
		$query_sql="select * from comment ".$search_string;
		$query_result=mysql_query($query_sql);
		$ret['nums']=mysql_affected_rows();
		
		if(!empty($order))$query_sql.=" order by ".$order;
		if(!empty($desc) && $desc=="1")$query_sql.=" desc ";
		if(!empty($reqnum))$query_sql.=" limit ".($page-1)*$reqnum.",".$reqnum;
		$query_result=mysql_query($query_sql);
		$listdata=array();


		while($rs=mysql_fetch_array($query_result))
		{
			$record=array("id"=>$rs['id'],"name"=>$rs['name'],"content"=>$rs['content'],"author"=>$rs['author'],"build_time"=>$rs['build_time']);
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
$testmod=new commentMod;
$testmod->typeShowlist();
*/


?>