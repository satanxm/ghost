<?php 
/*********************************************************************************
 * QAM 1.0 生成示例图
 *-------------------------------------------------------------------------------
 * $Author:Kundy
 * $Dtime:2011-9-4
***********************************************************************************/


//传参：?w=200&h=100

$parm_flag=true;
if(!isset($_GET["w"]) || !isset($_GET["h"])){
	$height=300;
	$width=400;
	$parm_flag=false;
}
else{
	$height=$_GET["h"];
	$width=$_GET["w"];
}
$query_string=$_SERVER['QUERY_STRING'];
if(stripos($query_string,"x")){
	$wh=explode("x",$query_string);
	$width=$wh[0];
	$height=$wh[1];
	$parm_flag=true;
}

$im = imagecreate($width,$height);
$line_color = imagecolorallocate($im,255,255,255);
$bg_color = imagecolorallocate($im,220,220,220);
$black = imagecolorallocate($im,255,255,255);
$font_color = imagecolorallocate($im,150,150,150);
$size_text=$width."X".$height;
$no_parm_text="传参示例：?w=160&h=120";
$no_parm_text="传参示例：?300x200";

//在图上绘画
imagefill($im,0,0,$bg_color);
if($width>=100 && $height>=100)
	ImageTTFText($im,18,0,$width/2-50,$height/2,$font_color,"plugin/font/YaHei.ttf",$size_text);
else if($width>=40 && $height>=20)
	ImageTTFText($im,10,0,$width/2-19,$height/2+5,$font_color,"plugin/font/YaHei.ttf",$size_text);
	
if(!$parm_flag)ImageTTFText($im, 18, 0, $width/2-130, $height/2+60, $font_color, "plugin/font/YaHei.ttf", $no_parm_text);

//输出图像
header("Content-type: image/png");
imagepng($im);

//清理
imagedestroy($im);


?> 