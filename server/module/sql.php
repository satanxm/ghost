<?php
/*********************************************************************************
 * QAM 1.0 用户类
 *-------------------------------------------------------------------------------
 * $Author:Kundy
 * $Dtime:2011-9-4
***********************************************************************************/
$ret = array(
	  'ret'=>'-1',
	  'msg'=>"异常"
);
class sqlMod
{

	public function backup()
	{
		global $ret;
		$power_query="sql-backup";
		if(!(in_array($power_query,$_SESSION["session_power"]) || $_SESSION["session_admin"]==1 )){
			$ret['ret']='2';
			$ret['msg']="没有权限";
		}
		else{
			$q1=mysql_query("show tables");
			while($t=mysql_fetch_array($q1)){
				$table=$t[0];
				$q2=mysql_query("show create table `$table`");
				$sql=mysql_fetch_array($q2);
				$mysql.=$sql['Create Table'].";\r\n";
				$q3=mysql_query("select * from `$table`");
				while($data=mysql_fetch_assoc($q3)){
					$keys=array_keys($data);
					$keys=array_map('addslashes',$keys);
					$keys=join('`,`',$keys);
					$keys="`".$keys."`";
					$vals=array_values($data);
					$vals=array_map('addslashes',$vals);
					$vals=join("','",$vals);
					$vals="'".$vals."'";
					$mysql.="insert into `$table`($keys) values($vals);\r\n";
				}
			}
			$filename="sql/spark_".date('Ymd')."_".date("His").".sql";
			file_put_contents($filename,$mysql);
			$ret['ret']='0';
			$ret['msg']="数据备份成功";
		}
		echo(json_encode($ret));
	}

	public function restore($postdata)
	{
		global $ret;
		$name=$postdata['name']; 
		
		$power_query="sql-backup";
		if(!(in_array($power_query,$_SESSION["session_power"]) || $_SESSION["session_admin"]==1 )){
			$ret['ret']='2';
			$ret['msg']="没有权限";
		}
		else if(empty($name) ){
			$ret['ret']='1';
			$ret['msg']="参数错误";
		}else{
			$cg=0;
			$sb=0;
			$file_path="sql/".$name;

			$sql_value="";
			if(is_file($file_path)){
			   $sqls=file($file_path);
			   foreach($sqls as $sql)
			   {
					$sql_value.=$sql;
			   }
			   $a=explode(";\r\n", $sql_value);  //根据";\r\n"条件对数据库中分条执行
			   $total=count($a)-1;
			   
			    mysql_query("drop database spark");
			    mysql_query("create database spark");
				mysql_select_db("spark");//选择数据库
				mysql_query("set character set 'utf8'");
				mysql_query("set names 'utf8'"); 

				for ($i=0;$i<$total;$i++){
					if(mysql_query($a[$i]))$cg+=1;
					else
						$sb+=1;
				}
				if($sb>0){
					$ret['ret']='0';
					$ret['msg']="还原失败，共计【".$sb."】条错误";
				}
				else{
					$ret['ret']='0';
					$ret['msg']="还原成功";
				}
			}
			else{
				$ret['ret']='3';
				$ret['msg']="文件不存在";
			}
		}
		echo(json_encode($ret));
	}
	
	public function del($postdata)
	{
		global $ret;
		$name=$postdata['name']; 
		
		$power_query="sql-backup";
		if(!(in_array($power_query,$_SESSION["session_power"]) || $_SESSION["session_admin"]==1 )){
			$ret['ret']='2';
			$ret['msg']="没有权限";
		}
		else if(empty($name) ){
			$ret['ret']='1';
			$ret['msg']="参数错误";
		}else{
			$file_path="sql/".$name;
			if(is_file($file_path)){
				unlink($file_path);	
				$ret['ret']='0';
				$ret['msg']="删除成功";
			}
			else{
				$ret['ret']='3';
				$ret['msg']="文件不存在";
			}
		}
		echo(json_encode($ret));
	}
	
	
	public function showlist()
	{
		global $ret;
		$dir =opendir("sql");
		$listdata=array();
		while (($file = readdir($dir)) !== false)
		{
			if($file!="." && $file!=".."  && $file!=".svn"){
				$record=array("name"=>$file);
				array_push($listdata,$record);
			}
		}
		closedir($dir);
		$ret['ret']='0';
		$ret['msg']="获取列表成功";
		$ret['listdata']=$listdata;
		echo(json_encode($ret));
	}
}

/*
require('../include/conn.php');
$testmod=new userMod;
$testmod->showlist();
*/
?>