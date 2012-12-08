<?php
/*********************************************************************************
 * QAM 1.0 框架入口文件
 *-------------------------------------------------------------------------------
 * $Author:Kundy
 * $Dtime:2011-9-4
***********************************************************************************/


$dir = dirname(dirname(__FILE__));
define('COMM_PATH', $dir . '/common/');
define('ROOT_PATH', $dir . '/');
unset($dir);

require_once COMM_PATH . 'etc/conf.inc.php';
//require_once COMM_PATH . 'lib/function.inc.php';
require_once COMM_PATH . 'lib/charset.inc.php';
require_once COMM_PATH . 'lib/json.inc.php';

//require('include/conn.php');
//$runtime= new runtime;
//$runtime->start();

// 模块动作识别
if (empty($_REQUEST['mod']) || !preg_match('/^[a-z]{3,16}$/i', $_REQUEST['mod'])) {
	$_REQUEST['mod'] = 'default';
	$mod_name = 'default';
} else {
	$_REQUEST['mod'] = strtolower($_REQUEST['mod']);
	$mod_name = $_REQUEST['mod'];
}
if (empty($_REQUEST['act']) || !preg_match('/^[a-z]{3,16}$/i', $_REQUEST['act'])) {
	$_REQUEST['act'] = 'default';
}
$_REQUEST['act'] = strtolower($_REQUEST['act']);
$act_name = $_REQUEST['act'];


$post=$_POST;
foreach($post as $key=>$val) {
	$post[$key]=addslashes($val);
}
/*require_once('module/user.php');
$module_str="\$simulation=new userMod;";
$method_str="\$simulation->cookie_query();";
eval($module_str.$method_str);*/


/*var_dump($module);
var_dump($method);*/

// 模块入口
require_once(ROOT_PATH . 'module/'.$mod_name.'.php');
$module_str="\$simulation=new ".$mod_name."Mod;";
$method_str="\$simulation->".$act_name."(\$post);";
eval($module_str.$method_str);

//$runtime->stop();
//log_print("[".$_COOKIE["name"]."][".$module."][".$method."][".$runtime->spent()."]","performance");

?>
