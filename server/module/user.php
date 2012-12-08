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
require('include/function.php');


//oa票据请求结构
class eTicket {
  public $encryptedTicket;
  function eTicket() {
  }
}


class userMod
{
	public function login($postdata)
	{
		
		global $ret;
		$name=$postdata['name']; 
		$passwd=$postdata['passwd']; 
		if(empty($name) || empty($passwd)){
			$ret['ret']='1';
			$ret['msg']="参数错误";
		}else{
			$query_result=mysql_query("select * from user where name='".$name."'");
			$row=@mysql_fetch_assoc($query_result);
			if($row['id']!=null )
			{
				if($row['passwd']==$passwd){
					//设置cookie
					setcookie("id",$row['id'],time()+3600*24*30,"/");
					setcookie("name",$row['name'],time()+3600*24*30,"/");
					setcookie("img",$row['img'],time()+3600*24*30,"/");
					setcookie("nick",$row['nick'],time()+3600*24*30,"/");
					setcookie("usergroup",$row['usergroup'],time()+3600*24*30,"/");

					//echo($_COOKIE["name"]);
					$this->session($row['id']);
					$ret['ret']='0';
					$ret['msg']="登陆成功";
				}else{
					$ret['ret']='3';
					$ret['msg']="密码错误";
				}
			}else{		
				$ret['ret']='2';
				$ret['msg']="用户不存在";
			}
		}
		echo(json_encode($ret));
	}
	
	public function oaLogin($postdata)
	{
		
		global $ret;
		$ticket=$postdata['ticket']; 
		if(empty($ticket)){
			$ret['ret']='1';
			$ret['msg']="参数错误";
		}else{
			$et = new eTicket();
			$et->encryptedTicket = $ticket;
			$mySoap = new SoapClient("http://passport.oa.com/services/passportservice.asmx?WSDL"); 
			$soapResult = $mySoap->DecryptTicket($et);
			if(!empty($soapResult->DecryptTicketResult)){

				/*
				//ticket解析后的数据
				ChineseName: "张昆"
				DeptId: 5349
				DeptName: "互联网用户体验设计部"
				Expiration: "2011-12-24T11:12:46.1135323+08:00"
				IsPersistent: false
				IssueDate: "2011-12-23T11:12:46.1135323+08:00"
				Key: "qUgToUE3AJ"
				LoginName: "kundyzhang"
				StaffId: 27543
				Token: null
				Version: 1
				*/	
				
				$query_name=mysql_query("select * from user where name='".$soapResult->DecryptTicketResult->LoginName."'");
				
				$row_name=@mysql_fetch_assoc($query_name);
				$cookie_id=0;
				if($row_name['id'] !=null )
				{
					$cookie_id=$row_name['id'];
					mysql_query("update user set last_login_time=now() where name='".$soapResult->DecryptTicketResult->LoginName."'");
					setcookie("usergroup",$row_name['usergroup'],time()+3600*24*30,"/");

					
				}else{	
					//获取用户头像:http://dayu.oa.com/avatars/kundyzhang/profile.jpg
					$img_data=file_get_contents("http://dayu.oa.com/avatars/".$soapResult->DecryptTicketResult->LoginName."/profile.jpg");
					
					$img_src="pic/head/".$soapResult->DecryptTicketResult->LoginName.".jpg";
					file_put_contents($img_src,$img_data);
					mysql_query("insert into user(name,nick,passwd,usergroup,sign_time,last_login_time,oa_flag,img) values ('".$soapResult->DecryptTicketResult->LoginName."','".$soapResult->DecryptTicketResult->ChineseName."','abcdefg',2,now(),now(),1,'pic/head/".$soapResult->DecryptTicketResult->LoginName.".jpg')");
					$cookie_id=mysql_insert_id();
					
					//feed start
					$feed_content="初来乍到，大家多多关照！";
					$sql = "insert into feed(time,content,name,avatar,img) values (now(),'$feed_content','".$soapResult->DecryptTicketResult->LoginName."','\{\$system_server_url\}pic/head/".$soapResult->DecryptTicketResult->LoginName.".jpg','\{\$system_server_url\}pic/head/".$soapResult->DecryptTicketResult->LoginName.".jpg')";
					$sql_flag=mysql_query($sql);
					//feed end
					setcookie("usergroup",0,time()+3600*24*30,"/");
				}
				
				//设置cookie
				setcookie("id",$cookie_id,time()+3600*24*30,"/");
				setcookie("name",$soapResult->DecryptTicketResult->LoginName,time()+3600*24*30,"/");
				setcookie("nick",$soapResult->DecryptTicketResult->ChineseName,time()+3600*24*30,"/");
				setcookie("img","pic/head/".$soapResult->DecryptTicketResult->LoginName.".jpg",time()+3600*24*30,"/");

				$this->session($cookie_id);

				$ret['ret']='0';
				$ret['msg']="登陆成功";
			}
			else{
				$ret['ret']='3';
				$ret['msg']="登陆失败";
			}
		}
		echo(json_encode($ret));
	}
	
	public function logout()
	{
		global $ret;
		setcookie("id",0,time()-3600,"/");
		setcookie("name",0,time()-3600,"/");
		setcookie("nick",0,time()-3600,"/");
		setcookie("usergroup",0,time()-3600,"/");
		setcookie("img",0,time()-3600,"/");
		$this->session_quit();
		$ret['ret']='0';
		$ret['msg']="注销成功";
		echo(json_encode($ret));
	}
	public function cookie()
	{
		global $ret;
		
		if(isset($_COOKIE["name"])){
			$query_name=mysql_query("select * from user where name='".$_COOKIE["name"]."'");
			$row_name=@mysql_fetch_assoc($query_name);
			
			$data=array("name"=>$_COOKIE["name"],"nick"=>$_COOKIE["nick"],"usergroup"=>$_COOKIE["usergroup"],"avatar"=>$row_name["img"]);
			$ret['data']=$data;
			
		}else{
			//匿名用户
			setcookie("id","2",time()+3600*24*30,"/");
			setcookie("nick","游客",time()+3600*24*30,"/");
			setcookie("usergroup",3,time()+3600*24*30,"/");
			setcookie("img","pic/head/profile.jpg",time()+3600*24*30,"/");
			$data=array("name"=>"游客","nick"=>"游客","usergroup"=>3,"avatar"=>"pic/head/profile.jpg");
			$this->session(2);
			$ret['data']=$data;
		}
		$ret['ret']='0';
		$ret['msg']="信息获取成功";
		echo(json_encode($ret));
	}
	
	/*系统自调方法 start*/
	public function cookie_query()
	{
		//检测session失效，cookie存在时重新设置session
		if(empty($_SESSION["session_power"]) && !empty($_COOKIE["id"])){
		
			$this->session($_COOKIE["id"]);
		}
	}
	public function session($id)
	{
		unset($_SESSION["session_power"]);
		$session_power=array();
		if($id>0)
			$query_result_usergroup=mysql_query("select * from usergroup where id in (select usergroup from user where id='".$id."')");
		else
			$query_result_usergroup=mysql_query("select * from usergroup where id =3");
			
		$row_usergroup=@mysql_fetch_assoc($query_result_usergroup);
		$_SESSION["session_admin"]=$row_usergroup['admin'];
		$result_setting=mysql_query("select * from system where id=1");
		$rs_setting=mysql_fetch_assoc($result_setting);
		$_SESSION["system_server_url"]=$rs_setting['system_server_url'];
		
		if(!empty($row_usergroup['power'])){
			$power_arr=explode(",",$row_usergroup['power']);
			foreach($power_arr as $power){
				if(!empty($power)){
					$query_result_power=mysql_query("select * from power where id='".$power."'");
					$row_power=@mysql_fetch_assoc($query_result_power);
					if(!empty($row_power['id'])){array_push($session_power,$row_power['name']);}
				}
			}
		}
		$_SESSION["session_power"]=$session_power;


	}
	
	
	public function session_quit()
	{
		unset($_SESSION["session_admin"]);
		unset($_SESSION["session_power"]);
		unset($_SESSION["system_server_url"]);
	}
	
	/*系统自调方法 end*/
	
	public function add($postdata)
	{
		global $ret;
		$name=$postdata['name']; 
		$nick=$postdata['nick']; 
		$passwd=$postdata['passwd']; 
		$usergroup=$postdata['usergroup']; 
	
		$power_query="user-add";
		if(!(in_array($power_query,$_SESSION["session_power"]) || $_SESSION["session_admin"]==1 )){
			$ret['ret']='2';
			$ret['msg']="没有权限";
		}
		else if(empty($name) || empty($nick) || empty($passwd)){
			$ret['ret']='1';
			$ret['msg']="参数错误";
		}else{
			$query_result=mysql_query("select * from user where name='".$name."'");
			$row=@mysql_fetch_assoc($query_result);
			if($row['id'] !=null )
			{
				$ret['ret']='3';
				$ret['msg']="用户已存在";
			}else{		
				$sql = "insert into user(name,nick,passwd,usergroup,sign_time,img) values ('$name','$nick','$passwd','$usergroup',now(),'pic/head/profile.jpg')";
				$sql_flag=mysql_query($sql);
				
				
				if($sql_flag){
				
					//feed start
					$feed_content="<span class=\"name\">".$name."</span>初来自到，大家多多关照！";
					$sql = "insert into feed(time,content,name,avatar) values (now(),'$feed_content','".$name."','\{\$system_server_url\}pic/head/profile.jpg')";
					$sql_flag=mysql_query($sql);
					//feed end
					
					$ret['ret']='0';
					$ret['msg']="添加成功";
				}else{
					$ret['msg']="添加失败";
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
		$nick=$postdata['nick']; 
		$passwd=$postdata['passwd']; 
		$usergroup=$postdata['usergroup']; 
		
		$power_query="user-update";
		if(!(in_array($power_query,$_SESSION["session_power"]) || $_SESSION["session_admin"]==1 )){
			$ret['ret']='2';
			$ret['msg']="没有权限";
		}
		else if(empty($name) || empty($nick)){
			$ret['ret']='1';
			$ret['msg']="参数错误";
		}else{
			$sql="update user set id=$id";
			if(!is_null($name))$sql.=",name='$name'";
			if(!is_null($nick))$sql.=",nick='$nick'";
			if(!is_null($passwd))$sql.=",passwd='$passwd'";
			if(!is_null($usergroup))$sql.=",usergroup=$usergroup";
			$sql.=" where id=".$id;
				
			$sql_flag=mysql_query($sql);
			if($sql_flag){
					$ret['ret']='0';
					$ret['msg']="修改成功";
				}else{
					$ret['msg']="修改失败";
				}
		}
		echo(json_encode($ret));
	}
	
	//更新用户的头像，从oa获取数据
	public function updateImg($postdata)
	{
		global $ret;
		$id=$postdata['id']; 

		$power_query="user-update";
		if(!(in_array($power_query,$_SESSION["session_power"]) || $_SESSION["session_admin"]==1 )){
			$ret['ret']='2';
			$ret['msg']="没有权限";
		}
		else if(empty($id)){
			$ret['ret']='1';
			$ret['msg']="参数错误";
		}else{
			$query_name=mysql_query("select * from user where id=".$id);
			$row_name=@mysql_fetch_assoc($query_name);
			if($row_name['id'] !=null ){
				//获取用户头像:http://dayu.oa.com/avatars/kundyzhang/profile.jpg
				$img_data=file_get_contents("http://dayu.oa.com/avatars/".$row_name['name']."/profile.jpg");
				$img_src="pic/head/".$row_name['name'].".jpg";
				file_put_contents($img_src,$img_data);
				
				
				$ret['ret']='0';
				$ret['msg']="更新成功";
			}
			else{
				$ret['ret']='3';
				$ret['msg']="更新失败";
			}
		}
		echo(json_encode($ret));
	}
	
	
	public function getinfo($postdata)
	{
		global $ret;
		$id=$postdata['id'];
		
		if(empty($id) ){
			$ret['ret']='1';
			$ret['msg']="参数错误";
		}else{
			$sql = "select * from user where id=".$id;
			$result=mysql_query($sql);
			$rs=mysql_fetch_assoc($result);
			if($rs['id'] !=null )
			{	
				$result_group=mysql_query("select * from usergroup where id=".$rs['usergroup']);
				$rs_group=mysql_fetch_assoc($result_group);
				
				/* 用户活跃度计算 start */
				$result_setting=mysql_query("select * from system where id=1");
				$rs_setting=mysql_fetch_assoc($result_setting);
				$active_resource=$rs_setting['active_resource'];
				$active_page=$rs_setting['active_page'];

				//资源数
				$query_sql="select * from resource where author='".$rs['name']."'";
				$query_result2=mysql_query($query_sql);
				$num_resource_claim=mysql_affected_rows();

				//资源分析 文章数
				$query_sql="select * from resource where claimer='".$rs['name']."' and status=2";
				$query_result2=mysql_query($query_sql);
				$num_resource_finish=mysql_affected_rows();

				//直接添加的文章数
				$query_sql="select * from page where author='".$rs['name']."' and status=1";
				$query_result2=mysql_query($query_sql);
				$num_page=mysql_affected_rows();

				$active=$num_resource_claim*$active_resource + $num_resource_finish*$active_page + $num_page*($active_resource+$active_page);

				/* 用户活跃度计算 end */
				
				$record=array("id"=>$rs['id'],"name"=>$rs['name'],"nick"=>$rs['nick'],"usergroup"=>$rs['usergroup'],"groupname"=>$rs_group["name"],"last_login_time"=>$rs["last_login_time"],"oa_flag"=>$rs["oa_flag"],"sign_time"=>$rs["sign_time"],"avatar"=>$rs["img"],"active"=>$active);
			}
			$ret['ret']='0';
			$ret['msg']="获取数据成功";
			$ret['record']=$record;
		}
		echo(json_encode($ret));
	}
	public function del($postdata)
	{
		global $ret;
		$id=$postdata['id']; 
		
		$power_query="user-del";
		if(!(in_array($power_query,$_SESSION["session_power"]) || $_SESSION["session_admin"]==1 )){
			$ret['ret']='2';
			$ret['msg']="没有权限";
		}
		else if(empty($id) ){
			$ret['ret']='1';
			$ret['msg']="参数错误";
		}else{
			$sql = "delete from user where id=".$id;
			$sql_flag=mysql_query($sql);
			if($sql_flag){
				$ret['ret']='0';
				$ret['msg']="删除成功";
			}else{
				$ret['msg']="删除失败";
			}
		}
		echo(json_encode($ret));
	}
	public function showlist($postdata)
	{
		global $ret;
		$page=$postdata['page']; //第1页
		$reqnum=$postdata['reqnum']; //每页显示10条
		$order=$postdata['order']; //排序字段
		$desc=$postdata['desc']; //是否反序
		

			//0：精确搜索   1：全局搜索
			$search_string="where (id!= 1 and id !=2) ";
			$search_flag=$postdata['search_flag']; //搜索
			if(isset($search_flag) && $search_flag==0){
				$search_string=" where (id!= 1 and id !=2)  ";
				if(strlen($postdata['name']))$search_string.=" and name like '%".$postdata['name']."%'";
				if(strlen($postdata['nick']))$search_string.=" and nick like '%".$postdata['nick']."%'";
				if(strlen($postdata['usergroup']))$search_string.=" and usergroup='".$postdata['usergroup']."'";
			}
			else if(isset($search_flag) && $search_flag==1){
				$search_string=" where (id!= 1 and id !=2)  ";
				$search_data_arr=explode(" ",$postdata['search_data']);
				foreach($search_data_arr as $search_data){
					$search_string.="and CONCAT(name,nick) like '%".$search_data."%'";
				}
			}
			

			
			$query_sql="select * from user ".$search_string;
			$query_result=mysql_query($query_sql);
			$ret['nums']=mysql_affected_rows();

			if(!empty($order) && $order != "active")$query_sql.=" order by ".$order;
			if(!empty($desc) && $desc=="1" && $order != "active")$query_sql.=" desc ";
			if(!empty($reqnum))$query_sql.=" limit ".($page-1)*$reqnum.",".$reqnum;
			

			$query_result=mysql_query($query_sql);
			$listdata=array();
			while($rs=mysql_fetch_array($query_result))
			{
				//用户所在组
				$result_group=mysql_query("select * from usergroup where id=".$rs['usergroup']);
				$rs_group=mysql_fetch_assoc($result_group);
				
				/* 用户活跃度计算 start */
				$result_setting=mysql_query("select * from system where id=1");
				$rs_setting=mysql_fetch_assoc($result_setting);
				$active_resource=$rs_setting['active_resource'];
				$active_page=$rs_setting['active_page'];

				//资源数
				$query_sql="select * from resource where author='".$rs['name']."'";
				$query_result2=mysql_query($query_sql);
				$num_resource_claim=mysql_affected_rows();

				//资源分析 文章数
				$query_sql="select * from resource where claimer='".$rs['name']."' and status=2";
				$query_result2=mysql_query($query_sql);
				$num_resource_finish=mysql_affected_rows();

				//直接添加的文章数
				$query_sql="select * from page where author='".$rs['name']."' and status=1";
				$query_result2=mysql_query($query_sql);
				$num_page=mysql_affected_rows();

				$active=$num_resource_claim*$active_resource + $num_resource_finish*$active_page + $num_page*($active_resource+$active_page);

				/* 用户活跃度计算 end */

				$record=array("id"=>$rs['id'],"name"=>$rs['name'],"nick"=>$rs['nick'],"usergroup"=>$rs['usergroup'],"groupname"=>$rs_group["name"],"last_login_time"=>$rs["last_login_time"],"oa_flag"=>$rs["oa_flag"],"sign_time"=>$rs["sign_time"],"avatar"=>$rs["img"],"active"=>$active);
				array_push($listdata,$record);
			}

			if($desc=="1" && !empty($order) && $order == "active")$listdata=sortArrayDesc($listdata, "active");
			if($desc=="0" && !empty($order) && $order == "active")$listdata=sortArrayAsc($listdata, "active");

			$ret['ret']='0';
			$ret['msg']="获取列表成功";
			$ret['listdata']=$listdata;

		echo(json_encode($ret));
	}

}


//升序    
function sortArrayAsc($preData,$sortType='newPrice'){    
    $sortData = array();    
    foreach ($preData as $key_i => $value_i){    
        $price_i = $value_i[$sortType];    
        $min_key = '';    
        $sort_total = count($sortData);    
        foreach ($sortData as $key_j => $value_j){    
            if($price_i<$value_j[$sortType]){    
                $min_key = $key_j+1;    
                break;    
            }    
        }    
        if(empty($min_key)){  
            array_push($sortData, $value_i);     
        }else {    
            $sortData1 = array_slice($sortData, 0,$min_key-1);     
            array_push($sortData1, $value_i);    
            if(($min_key-1)<$sort_total){    
                $sortData2 = array_slice($sortData, $min_key-1);     
                foreach ($sortData2 as $value){    
                    array_push($sortData1, $value);    
                }    
            }    
            $sortData = $sortData1;    
        }    
    }    
    return $sortData;    
}

//降序 
function sortArrayDesc($preData,$sortType='newPrice'){    
    $sortData = array();    
    foreach ($preData as $key_i => $value_i){    
        $price_i = $value_i[$sortType];    
        $min_key = '';    
        $sort_total = count($sortData);    
        foreach ($sortData as $key_j => $value_j){    
            if($price_i>$value_j[$sortType]){    
                $min_key = $key_j+1;    
                break;    
            }    
        }    
        if(empty($min_key)){    
            array_push($sortData, $value_i);     
        }else {    
            $sortData1 = array_slice($sortData, 0,$min_key-1);     
            array_push($sortData1, $value_i);    
            if(($min_key-1)<$sort_total){    
                $sortData2 = array_slice($sortData, $min_key-1);     
                foreach ($sortData2 as $value){    
                    array_push($sortData1, $value);    
                }    
            }    
            $sortData = $sortData1;    
        }    
    }    
    return $sortData;    
}    

/*
require('../include/conn.php');
$testmod=new userMod;
$testmod->session("");
*/
?>