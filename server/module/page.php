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


class pageMod
{

	public function add($postdata)
	{
		global $ret;
		$name=$postdata['name'];
		$info=$postdata['info'];
		$content=$postdata['content'];
		$category_id=$postdata['category_id'];
		$tag=$postdata['tag'];
		$demo=$postdata['demo'];
		$img=$postdata['img'];
		$author=$_COOKIE["name"];

		$power_query="page-add";

		if(!(in_array($power_query,$_SESSION["session_power"]) || $_SESSION["session_admin"]==1 )){
			$ret['ret']='2';
			$ret['msg']="没有权限";
		}
		else if(empty($name)){
			$ret['ret']='1';
			$ret['msg']="参数错误";
		}
		else{
			$build_time=time();

			//tag要特殊处理下
			$tag_arr=explode(",",$tag);
			$tag_arr2=array();
			foreach($tag_arr as $tag_item){
				$tag_item=trim($tag_item);
				if(!empty($tag_item)){
					array_push($tag_arr2,$tag_item);
				}
			}
			$tag2=implode(",",$tag_arr2);
			$tag2=",".$tag2.",";

			$sql = "insert into page(name,info,content,category_id,tag,demo,img,author,build_time,adjuster,adjust_time,status) values ('$name','$info','$content','$category_id','$tag2','$demo','','$author',$build_time,'','',1)";
			$sql_flag=mysql_query($sql);
			if($sql_flag){
			
				//处理tag start
				$tag_db=array();//数据库已存的tag列表
				$query_tag=mysql_query("select * from tag");
				while($rs_tag=mysql_fetch_array($query_tag)){
					array_push($tag_db,$rs_tag["name"]);
				}
				
				$row_user=mysql_fetch_assoc($sql_user);
				$author=$row_user["author"];	
				
				$tag_arr=explode(",",$tag);
				foreach($tag_arr as $tag_item){
					 $tag_item=trim($tag_item);
					if(!in_array($tag_item,$tag_db) && $tag_item!=""){
						mysql_query("insert into tag (name) values ('$tag_item')");
						array_push($tag_db,$tag_item);
					}		
				}
				//处理tag end
				
				
				$mysql_insert_id=mysql_insert_id();
				$img_status="上传图片成功";
				//处理图片
				if(!empty($img)){
					//将图片存起来
					$image_arr=explode(",",$img);
					$img_src="pic/image/";
					$file_type=preg_replace('/data:(.*?)\/(.*?);base64/', '$1',$image_arr[0]);
					$img_type=preg_replace('/data:(.*?)\/(.*?);base64/', '$2',$image_arr[0]);
					$img_type=($img_type=="jpeg")?"jpg":$img_type;
					
					$image_last=$img_src.$mysql_insert_id.".".$img_type;
					if(!file_exists($img_src))mkdir($img_src);
					$file_put_ret=file_put_contents($image_last,base64_decode($image_arr[1]));
					
					if($file_type!="image"){
						$img_status="上传的文件不是图片";
					}
					else if(empty($file_put_ret)){
						$img_status="上传图片错误";
					}
					else{
						$sql="update page set img='$image_last' where id=".$mysql_insert_id;
						mysql_query($sql);
					}
				}	


				$ret['img_status']=$img_status;
				$ret['page_id']=$mysql_insert_id;
				$ret['ret']='0';
				$ret['msg']="添加成功";
			}else{
				$ret['msg']="添加失败";
			}
			
		}
		$this->tagReset();
		echo(json_encode($ret));
	}

	public function praise($postdata)
	{
		global $ret;
		$id=$postdata['page_id']; 
		$author=$_COOKIE["name"];
		
		$power_query="page-praise";

		if(!(in_array($power_query,$_SESSION["session_power"]) || $_SESSION["session_admin"]==1 )){
			$ret['ret']='2';
			$ret['msg']="没有权限";
		}
		else if(empty($id)){
			$ret['ret']='1';
			$ret['msg']="参数错误";
		}
		else{
			$sql_user=mysql_query("select * from page where id=".$id);
			$row_user=mysql_fetch_assoc($sql_user);
			$praise_user=$row_user["praise_user"];
			$praise=$row_user["praise"]+1;
			$user_arr=array();
			$praise_flag=true;
			if(!empty($praise_user))$user_arr=explode(",",$praise_user);
			foreach($user_arr as $user){
				if($user==$author){
					$praise_flag=false;
					$ret['ret']='3';
					$ret['msg']="失败，已赞过";
				}
			}
			if($praise_flag){
				array_push($user_arr,$author);
				$user_str=implode(",",$user_arr);
				$sql_update="update page set praise=".$praise.",praise_user='".$user_str."' where id=".$id;

				$sql_flag=mysql_query($sql_update);
				if($sql_flag){
					$ret['ret']='0';
					$ret['msg']="成功";
				}else{
					$ret['msg']="失败";
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
		$content=$postdata['content'];
		$category_id=$postdata['category_id'];
		$tag=$postdata['tag'];
		$demo=$postdata['demo'];
		$img=$postdata['img'];
		
		$adjuster=$_COOKIE["name"];
	
		$power_query="page-update";

		if(!(in_array($power_query,$_SESSION["session_power"]) || $_SESSION["session_admin"]==1 )){
			$ret['ret']='2';
			$ret['msg']="没有权限";
		}
		else if(empty($id)){
			$ret['ret']='1';
			$ret['msg']="参数错误";
		}
		else{
			$sql_user=mysql_query("select * from page where id=".$id);
			$row_user=mysql_fetch_assoc($sql_user);
			$author=$row_user["author"];	
			
			//只有作者和超级管理员可以修改
			if($author==$adjuster || $_SESSION["session_admin"]==1 ){
				$img_status="上传图片成功";
				//处理图片
				$image_last="";
				if(!empty($img)){
					//将图片存起来
					$image_arr=explode(",",$img);
					$img_src="pic/image/";
					$file_type=preg_replace('/data:(.*?)\/(.*?);base64/', '$1',$image_arr[0]);
					$img_type=preg_replace('/data:(.*?)\/(.*?);base64/', '$2',$image_arr[0]);
					$img_type=($img_type=="jpeg")?"jpg":$img_type;
					
					$image_last=$img_src.$id.".".$img_type;
					if(!file_exists($img_src))mkdir($img_src);
					$file_put_ret=file_put_contents($image_last,base64_decode($image_arr[1]));
					
					if($file_type!="image"){
						$img_status="上传的文件不是图片";
					}
					else if(empty($file_put_ret)){
						$img_status="上传图片错误";
					}
				}	
				
				
				//处理tag start
				$tag_db=array();//数据库已存的tag列表
				$query_tag=mysql_query("select * from tag");
				while($rs_tag=mysql_fetch_array($query_tag)){
					array_push($tag_db,$rs_tag["name"]);
				}
				
				$row_user=mysql_fetch_assoc($sql_user);
				$author=$row_user["author"];	
				
				$tag_arr=explode(",",$tag);
				foreach($tag_arr as $tag_item){
					 $tag_item=trim($tag_item);
					if(!in_array($tag_item,$tag_db) && $tag_item!=""){
						mysql_query("insert into tag (name) values ('$tag_item')");
						array_push($tag_db,$tag_item);
					}		
				}
				//处理tag end
				
				
				$adjust_time=time();
				$sql_update="update page set id=".$id;
				if(isset($name))$sql_update.=",name='$name'";
				if(isset($info))$sql_update.=",info='$info'";
				if(isset($content))$sql_update.=",content='$content'";
				if(isset($category_id))$sql_update.=",category_id='$category_id'";
				if(isset($tag)){
					//tag要特殊处理下
					$tag_arr=explode(",",$tag);
					$tag_arr2=array();
					foreach($tag_arr as $tag_item){
						$tag_item=trim($tag_item);
						if(!empty($tag_item)){
							array_push($tag_arr2,$tag_item);
						}
					}
					$tag2=implode(",",$tag_arr2);
					$tag2=",".$tag2.",";

					$sql_update.=",tag='$tag2'";
				}
				if(isset($demo))$sql_update.=",demo='$demo'";
				if(isset($image_last))$sql_update.=",img='$image_last'";
				
				$sql_update.=",adjust_time='$adjust_time'";
				$sql_update.=",adjuster='$adjuster'";
				$sql_update.=" where id=".$id;
				
				$sql_flag=mysql_query($sql_update);
				if($sql_flag){
					
					
					$ret['img_status']=$img_status;
					$ret['ret']='0';
					$ret['msg']="修改成功";
					
				}else{
					$ret['msg']="修改失败";
				}
			}
			else if($author!=$adjuster || $_SESSION["session_admin"]!=1 ){
				$ret['ret']='3';
				$ret['msg']="修改失败，你不是该文章的作者";
			
			}
		}
		$this->tagReset();
		echo(json_encode($ret));
	}
	
	public function del($postdata)
	{
		global $ret;
		$id=$postdata['id']; 
		$adjuster=$_COOKIE["name"];

		$query_type=mysql_query("select * from page where id=".$id);
		$power_query="page-del";
		
		if(!(in_array($power_query,$_SESSION["session_power"]) || $_SESSION["session_admin"]==1 )){
			$ret['ret']='2';
			$ret['msg']="没有权限";
		}
		else if(empty($id) ){
			$ret['ret']='1';
			$ret['msg']="参数错误";
		}else{
			$sql_user=mysql_query("select * from page where id=".$id);
			$row_user=mysql_fetch_assoc($sql_user);
			$author=$row_user["author"];	
			$img=$row_user["img"];

			//只有作者和超级管理员可以修改
			if($author==$adjuster || $_SESSION["session_admin"]==1 ){


				$sql = "delete from page where id=".$id;
				$sql_flag=mysql_query($sql);
				if($sql_flag){
					$ret['ret']='0';
					$ret['msg']="删除成功";
					//删除页面和预览图片
					@unlink("pic/image/".$img);
					
				}else{
					$ret['msg']="删除失败";
				}
			}
			else if($author!=$adjuster || $_SESSION["session_admin"]!=1 ){
				$ret['ret']='3';
				$ret['msg']="删除失败，你不是该文章的作者";
			
			}

		}
		$this->tagReset();
		echo(json_encode($ret));
	}

	//处理tag
	public function tagReset(){
		//数据库已存的tag列表
		$tag_db=array();
		$query_tag=mysql_query("select * from tag");
		while($rs_tag=mysql_fetch_array($query_tag)){
			array_push($tag_db,array("id"=>$rs_tag["id"],"name"=>$rs_tag["name"],"count"=>0));
		}
		
		//遍历所有页面
		$query_page=mysql_query("select * from page");
		while($rs_page=mysql_fetch_array($query_page)){
			$tag=$rs_page["tag"];
			$tag_arr=explode(",",$tag);
			
			foreach($tag_arr as $tag_item){
				$tag_item=trim($tag_item);
				$tag_index=0;
				foreach($tag_db as $tag_db_item){
					if($tag_db_item["name"]==$tag_item){
						
						$tag_db[$tag_index]["count"]++;
					}
					$tag_index++;
				}
			}
		}
		
		//写数据库
		foreach($tag_db as $tag_db_item){
			if($tag_db_item["count"]>0){
				mysql_query("update tag set count=".$tag_db_item["count"]." where id=".$tag_db_item["id"]);
			}
			else{
				mysql_query("delete from tag where id=".$tag_db_item["id"]);
			}
		}
	
	}
	
	
	public function getinfo($postdata)
	{
		global $ret;
		$id=$postdata['id'];
		
		if(empty($id) ){
			$ret['ret']='1';
			$ret['msg']="参数错误";
		}else{
			$sql = "select * from page where id=".$id;
			$result=mysql_query($sql);
			$rs=mysql_fetch_assoc($result);
			if($rs['id'] !=null ){
			
				$power_query="page-getinfo";
				
				if(!(in_array($power_query,$_SESSION["session_power"]) || $_SESSION["session_admin"]==1 )){
					$ret['ret']='2';
					$ret['msg']="没有权限";
				}
				else{
		
					$sql_cateogory=mysql_query("select * from category where id=".$rs["category_id"]);
					$row_cateogory=mysql_fetch_assoc($sql_cateogory);
					$category_name=$row_cateogory["name"];	

					$sql_user=mysql_query("select * from user where name='".$rs["author"]."'");
					$row_user=mysql_fetch_assoc($sql_user);
					$avatar=$row_user["img"];

					//获取相关文章，根据时间排序

					$query_sql="select * from page where id!=".$id." and status=1 order by praise desc limit 0,10";
					$query_result=mysql_query($query_sql);
					$listdata1=array();
					while($rs1=mysql_fetch_array($query_result))
					{
						$record1=array("id"=>$rs1['id'],"name"=>$rs1['name'],"praise"=>$rs1['praise']);
						array_push($listdata1,$record1);
					}
					//获取相关文章，根据赞排序
					$query_sql="select * from page where id!=".$id." and status=1 order by adjust_time desc limit 0,10";
					$query_result=mysql_query($query_sql);
					$listdata2=array();
					while($rs2=mysql_fetch_array($query_result))
					{
						$record2=array("id"=>$rs2['id'],"name"=>$rs2['name'],"praise"=>$rs2['praise']);
						array_push($listdata2,$record2);
					}

					$record=array("id"=>$rs['id'],"name"=>$rs['name'],"avatar"=>$avatar,"content"=>$rs['content'],"author"=>$rs['author'],"build_time"=>$rs['build_time'],"adjust_time"=>$rs['adjust_time'],"adjuster"=>$rs["adjuster"],"category_id"=>$rs['category_id'],"category_name"=>$category_name,"info"=>$rs['info'],"demo"=>$rs["demo"],"tag"=>$rs['tag'],"img"=>$rs['img'],"praise"=>$rs['praise']);

					$ret['ret']='0';
					$ret['msg']="获取数据成功";
					$ret['record']=$record;
					$ret['list_by_praise']=$listdata1;
					$ret['list_by_adjust_time']=$listdata2;
				}
			}
			else{
				$ret['ret']='3';
				$ret['msg']="找不到记录";
			}
		}
		echo(json_encode($ret));
	}
	
	
	public function tagShowlist($postdata)
	{
		global $ret;
	
		$power_query="tag-showlist";
		
		

		$query_sql="select * from tag order by count";
		$query_result=mysql_query($query_sql);
		$ret['nums']=mysql_affected_rows();
		
		$query_result=mysql_query($query_sql);
		$listdata=array();
		while($rs=mysql_fetch_array($query_result))
		{
			$record=array("id"=>$rs['id'],"name"=>$rs['name'],"count"=>$rs['count']);
			array_push($listdata,$record);
		}
		$ret['ret']='0';
		$ret['msg']="获取列表成功";
		$ret['listdata']=$listdata;
		
		echo(json_encode($ret));
	}
	
	
	public function showlist($postdata)
	{
		global $ret;
		$page=$postdata['page']; //第1页
		$reqnum=$postdata['reqnum']; //每页显示10条
		$order=$postdata['order']; //排序字段
		$desc=$postdata['desc']; //是否反序

		

		{
			//0：精确搜索   1：全局搜索
			$search_string=" status>0 ";
			$search_flag=$postdata['search_flag']; //搜索
			
			if(isset($search_flag) && $search_flag==0){
				if( strlen($postdata['author']) ){
					$search_string.=" and author = '".$postdata['author']."'";	
				}
				if( strlen($postdata['tag']) ){
					$search_string.=" and tag like '%".$postdata['tag']."%'";	
				}
			}
			else if(isset($search_flag) && $search_flag==1){
				$search_data_arr=explode(" ",$postdata['search_data']);
				$search_string.=" and ( 1=1 ";
				foreach($search_data_arr as $search_data){
					$search_string.="and CONCAT(name,info,content,tag,author) like '%".$search_data."%'";
				}
				$search_string.=")";
			}

			
			$query_sql="select * from page where ".$search_string;
			$query_result=mysql_query($query_sql);
			$ret['nums']=mysql_affected_rows();
			
			//查询category_name
			

			if(!empty($order))$query_sql.=" order by page.".$order;
			if(!empty($desc) && $desc=="1")$query_sql.=" desc ";
			if(!empty($reqnum))$query_sql.=" limit ".($page-1)*$reqnum.",".$reqnum;

			$query_result=mysql_query($query_sql);
			$listdata=array();
			while($rs=mysql_fetch_array($query_result))
			{

				$sql_comment="select * from comment where page_id=".$rs["id"];
				mysql_query($sql_comment);
				$comment_count=mysql_affected_rows();

				$sql_user=mysql_query("select * from user where name='".$rs["author"]."'");
				$row_user=mysql_fetch_assoc($sql_user);
				$avatar=$row_user["img"];


				$record=array("id"=>$rs['id'],"name"=>$rs['name'],"avatar"=>$avatar,"content"=>$rs['content'],"author"=>$rs['author'],"build_time"=>$rs['build_time'],"adjust_time"=>$rs['adjust_time'],"adjuster"=>$rs["adjuster"],"category_id"=>$rs['category_id'],"info"=>$rs['info'],"demo"=>$rs["demo"],"tag"=>$rs['tag'],"img"=>$rs['img'],"praise"=>$rs['praise'],"comment_count"=>$comment_count);
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