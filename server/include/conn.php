<?php
error_reporting(0);
date_default_timezone_set('PRC');



class runtime
{ 
	var $StartTime = 0; 
	var $StopTime = 0; 
	function get_microtime(){ 
		list($usec, $sec) = explode(' ', microtime()); 
		return ((float)$usec + (float)$sec); 
	} 
	function start(){ 
		$this->StartTime = $this->get_microtime(); 
	} 
	function stop(){ 
		$this->StopTime = $this->get_microtime(); 
	} 
	function spent() { 
		return round(($this->StopTime - $this->StartTime) * 1000, 1); 
	} 
}



mysql_connect("localhost","batch","batch");//连接MySQL
mysql_select_db("spark");//选择数据库
mysql_query("set character set 'utf8'");
mysql_query("set names 'utf8'");
 
?>