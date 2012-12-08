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
include_once('include/function.php'); 
class settingMod
{

	public function read($postdata)
	{
		global $ret;
		$content=array("templet"=>"","css"=>"");
		
		//读取文件
		$src_templet="project/public/templet.htm";
		//$src_css="project/public/public.css";
		
		$content["templet"]=file_get_contents($src_templet);
		//$content["css"]=file_get_contents($src_css);
		
		$ret['content']=$content;
		$ret['ret']='0';
		$ret['msg']="读取成功";

		echo(json_encode($ret));
	}
	
	public function svnTest($postdata)
	{
		global $ret;

		$svn_username=$postdata['svn_username']; 
		$svn_password=$postdata['svn_password']; 
		$svn_path=$postdata['svn_path']; 
		$svn_url=$postdata['svn_url']; 
		
	
		if(empty($svn_username) || empty($svn_password) || empty($svn_path) || empty($svn_url) ){
			$ret['ret']='1';
			$ret['msg']="参数错误";
		}
		else{
			$command=$svn_path." list \"".$svn_url."\" --username ".$svn_username." --password ".$svn_password."\"";
			$svn_relult=exec($command);
			if(strlen($svn_relult)>0){
					$ret['ret']='0';
					$ret['msg']="SVN测试成功";
			}else{
				$ret['msg']="SVN测试失败";
			}
		}
		echo(json_encode($ret));
	}
	
	public function update($postdata)
	{
		global $ret;

		$id=1;
		$system_name=$postdata['system_name']; 
		$system_url=$postdata['system_url']; 
		$system_server_url=$postdata['system_server_url']; 
		$svn_username=$postdata['svn_username']; 
		$svn_password=$postdata['svn_password']; 
		$svn_path=$postdata['svn_path']; 
		$svn_url=$postdata['svn_url']; 
		$prefix_layout=$postdata['prefix_layout']; 
		$prefix_container=$postdata['prefix_container']; 
		$prefix_module=$postdata['prefix_module']; 
		$prefix_component=$postdata['prefix_component']; 
		$power_sort=$postdata['power_sort'];
		$public_templet_arr=explode(",",$postdata['public_templet']);
		$public_css_arr=explode(",",$postdata['public_css']);
		
		$print_classname_class=$postdata['print_classname_class'];
		$print_visible_class=$postdata['print_visible_class'];
		$print_img_class=$postdata['print_img_class'];
		$print_loop_class=$postdata['print_loop_class'];
		$print_var_class=$postdata['print_var_class'];
		$print_html_event_class=$postdata['print_html_event_class'];
		$print_html_event_click=$postdata['print_html_event_click'];
		$print_html_event_clicked=$postdata['print_html_event_clicked'];
		$print_css_selector_class=$postdata['print_css_selector_class'];
		$print_css_property_class=$postdata['print_css_property_class'];
		$print_css_value_class=$postdata['print_css_value_class'];
		$print_css_event_class=$postdata['print_css_event_class'];
		$print_css_event_click=$postdata['print_css_event_click'];
		$print_css_event_clicked=$postdata['print_css_event_clicked'];
		$print_img_event_click=$postdata['print_img_event_click'];
		$print_img_event_clicked=$postdata['print_img_event_clicked'];
		$print_link=$postdata['print_link'];
		
		$page_ident_prefix=$postdata['page_ident_prefix'];
		$code_type_field=$postdata['code_type_field'];
		$code_id_field=$postdata['code_id_field'];
		$system_css_field=$postdata['system_css_field'];
		$user_css_field=$postdata['user_css_field'];
		$user_custom_field=$postdata['user_custom_field'];
		$filter_field=$postdata['filter_field'];

		$active_resource=$postdata['active_resource'];
		$active_page=$postdata['active_page'];
		
					
		$templet_data=base64_decode($public_templet_arr[1]);
		//$css_data=base64_decode($public_css_arr[1]);
		
		$power_query="setting-operate";
		if(!(in_array($power_query,$_SESSION["session_power"]) || $_SESSION["session_admin"]==1) ){
			$ret['ret']='2';
			$ret['msg']="没有权限";
		}
		else{
			//写入文件
			$src_templet="project/public/templet.htm";
			//$src_css="project/public/public.css";
			//$src_css2="data/public.css";
			
			if(strlen($templet_data)>0)file_put_contents($src_templet,$templet_data);
			//if(strlen($css_data)>0)file_put_contents($src_css,$css_data);
			//if(strlen($css_data)>0)file_put_contents($src_css2,$css_data);
			
			$sql_flag=mysql_query("update system set system_name='$system_name',system_url='$system_url',system_server_url='$system_server_url',svn_username='$svn_username',svn_password='$svn_password',svn_path='$svn_path',svn_url='$svn_url',prefix_layout='$prefix_layout' ,prefix_container='$prefix_container' ,prefix_module='$prefix_module',prefix_component='$prefix_component',power_sort='$power_sort',print_classname_class='$print_classname_class',print_visible_class='$print_visible_class',print_img_class='$print_img_class',print_loop_class='$print_loop_class',print_var_class='$print_var_class',print_html_event_class='$print_html_event_class',print_html_event_click='$print_html_event_click',print_html_event_clicked='$print_html_event_clicked',print_css_selector_class='$print_css_selector_class',print_css_property_class='$print_css_property_class',print_css_value_class='$print_css_value_class',print_css_event_class='$print_css_event_class',print_css_event_click='$print_css_event_click',print_css_event_clicked='$print_css_event_clicked',print_img_event_click='$print_img_event_click',print_img_event_clicked='$print_img_event_clicked',print_link='$print_link',page_ident_prefix='$page_ident_prefix',code_type_field='$code_type_field',code_id_field='$code_id_field',system_css_field='$system_css_field',user_css_field='$user_css_field',user_custom_field='$user_custom_field',filter_field='$filter_field',active_resource=$active_resource,active_page=$active_page where id=".$id);
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
		$id=1;


		$power_query="setting-operate";
		if(empty($id) ){
			$ret['ret']='1';
			$ret['msg']="参数错误";
		}
		else if(!(in_array($power_query,$_SESSION["session_power"]) || $_SESSION["session_admin"]==1) ){
			$ret['ret']='2';
			$ret['msg']="没有权限";
		}
		else{
			$sql = "select * from system where id=".$id;
			$result=mysql_query($sql);
			$rs=mysql_fetch_assoc($result);
			if($rs['id'] !=null )
			{	
			
				
				$record=array("system_name"=>$rs['system_name'],"system_url"=>$rs['system_url'],"system_server_url"=>$rs['system_server_url'],"svn_username"=>$rs['svn_username'],"svn_password"=>$rs['svn_password'],"svn_path"=>$rs['svn_path'],"svn_url"=>$rs['svn_url'],"prefix_layout"=>$rs['prefix_layout'],"prefix_container"=>$rs['prefix_container'],"prefix_module"=>$rs['prefix_module'],"prefix_component"=>$rs['prefix_component'],"power_sort"=>$rs['power_sort'],"print_classname_class"=>$rs['print_classname_class'],"print_visible_class"=>$rs['print_visible_class'],"print_img_class"=>$rs['print_img_class'],"print_loop_class"=>$rs['print_loop_class'],"print_var_class"=>$rs['print_var_class'],"print_html_event_class"=>$rs['print_html_event_class'],"print_html_event_click"=>$rs['print_html_event_click'],"print_html_event_clicked"=>$rs['print_html_event_clicked'],"print_css_selector_class"=>$rs['print_css_selector_class'],"print_css_property_class"=>$rs['print_css_property_class'],"print_css_value_class"=>$rs['print_css_value_class'],"print_css_event_class"=>$rs['print_css_event_class'],"print_css_event_click"=>$rs['print_css_event_click'],"print_css_event_clicked"=>$rs['print_css_event_clicked'],"print_img_event_click"=>$rs['print_img_event_click'],"print_img_event_clicked"=>$rs['print_img_event_clicked'],"print_link"=>$rs['print_link'],"page_ident_prefix"=>$rs['page_ident_prefix'],"code_type_field"=>$rs['code_type_field'],"code_id_field"=>$rs['code_id_field'],"system_css_field"=>$rs['system_css_field'],"user_css_field"=>$rs['user_css_field'],"user_custom_field"=>$rs['user_custom_field'],"filter_field"=>$rs['filter_field'],"active_resource"=>$rs['active_resource'],"active_page"=>$rs['active_page']);
			}
			$ret['ret']='0';
			$ret['msg']="获取数据成功";
			$ret['record']=$record;
		}
		
		echo(json_encode($ret));
	}
}

/*
require('../include/conn.php');
$testmod=new settingMod;
$testmod->svnTest();
*/
?>  
