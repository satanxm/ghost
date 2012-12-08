<?php

$dir = dirname(dirname(__FILE__));
define('COMM_PATH', $dir . '/common/');
define('ROOT_PATH', $dir . '/');
unset($dir);

//set it to writable location, a place for temp generated PNG files
$PNG_TEMP_DIR = dirname(__FILE__).DIRECTORY_SEPARATOR.'temp'.DIRECTORY_SEPARATOR;

//html PNG location prefix
$PNG_WEB_DIR = ROOT_PATH . 'temp/';

include COMM_PATH . "lib/phpqrcode/qrlib.php";  

//ofcourse we need rights to create temp dir
if (!file_exists($PNG_TEMP_DIR))
	mkdir($PNG_TEMP_DIR);


$errorCorrectionLevel = 'Q';
$matrixPointSize = 6;
$data =  'http://www.baidu.com/';

// user data
$filename = $PNG_TEMP_DIR.'test'.md5( $data.'|'.$errorCorrectionLevel.'|'.$matrixPointSize).'.png';
QRcode::png($data, $filename, $errorCorrectionLevel, $matrixPointSize, 2);    


$mime = image_type_to_mime_type(IMAGETYPE_PNG);

$imgdata = file_get_contents($filename);
// 输出图片
$time = time();
header('Last-Modified: ' . gmdate('D, d M Y H:i:s', $time) . ' GMT');
header('Expires: ' . gmdate('D, d M Y H:i:s', $time + 7200) . ' GMT');
header("Cache-Control: max-age=7200");
header("Content-Length: " . strlen($imgdata));
header("Content-Type: {$mime}");
echo $imgdata;
exit;

