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

//require('include/function.php');

class deskMod
{
	/**
	 * binarycode   二维码
	 * 
	 * @param {postdata}  mixed 
	 * @access public
	 * @return void
	 */
	public function binarycode($postdata)
	{
		 echo "binarycode";
	}

	public function wordlist($postdata){
		$json = '[{"name":"电器","data":["电风扇#吹风机","电脑#平板","电灯#台灯","镜头#单反","音箱#喇叭","笔记本#平板","液晶#电视","电磁炉#微波炉","u盘#SD卡","鼠标#光标"]},{"name":"人体","data":["眉毛#睫毛","手指#指甲","嘴巴#嘴唇","屁股#臀部","胸部#胸口","胸毛#腿毛","膝盖#脚踝","眼睛#眼球","大腿#屁股","近视#四眼","手心#手指","肌肉#胸肌"]},{"name":"日用品","data":["尿布#湿巾","雨伞#雨衣","杯子#杯具","洗衣粉#洗衣液","插头#插座","水桶#脸盆"]},{"name":"食物","data":["牛奶#豆浆","黄瓜#木瓜","周黑鸭#煌上煌","真功夫#肯德鸡","鸡肉#鸡腿","红酒#白酒","快餐#盒饭","巧克力#冰淇淋","橙子#桔子","瓜子#花生"]},{"name":"其它","data":["淘宝#天猫","手指#指甲","红领巾#绿帽子","安全带#安全套","天朝#中央","岁月#光阴","微信#微博","洗澡#沐浴","鸳鸯#龙凤","乌鸦#麻雀","算命#抽签","跳舞#瑜伽"]}]';

		$data =json_decodem( $json);
		//var_dump($data);
		$arr= array();
		foreach ($data as $typedata) {
			$type = $typedata['name'];
			$list = $typedata['data'];
			foreach ($list as $word) {

				array_push($arr, array(
					'word' => $word,
					'type' => $type,
				));
			}
		}
				//var_dump($arr);
		shuffle($arr);
		$wordlist = array_slice($arr, 0, 15);
		$obj = array(
			'ret' => 0,
			'data' => array(
				'list' => $wordlist,
			)
		);
		print_json($obj);
	}
}


?>
