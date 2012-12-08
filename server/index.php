<?php
/*********************************************************************************
 * QAM 1.0 框架入口文件
 *-------------------------------------------------------------------------------
 * $Author:Kundy
 * $Dtime:2011-9-4
***********************************************************************************/

require('include/conn.php');
//$runtime= new runtime;
//$runtime->start();


$request_url=$_SERVER["REQUEST_URI"];
$request_url=str_replace("index.php?","",$request_url);
$htdoc_root="server";



$parm=str_replace("/".$htdoc_root."/","",$request_url); 
$parm_arr=explode("-",$parm);
$module=$parm_arr[0];
$method=$parm_arr[1];


$post=$_POST;
foreach($post as $key=>$val) {
	$post[$key]=addslashes($val);
}


require_once('module/user.php');
$module_str="\$simulation=new userMod;";
$method_str="\$simulation->cookie_query();";
eval($module_str.$method_str);



require_once('module/'.$module.'.php');
$module_str="\$simulation=new ".$module."Mod;";
$method_str="\$simulation->".$method."(\$post);";
eval($module_str.$method_str);

//$runtime->stop();
//log_print("[".$_COOKIE["name"]."][".$module."][".$method."][".$runtime->spent()."]","performance");

?>