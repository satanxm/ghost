<?

function HtmlFixSafe($html) 
{

if(!function_exists('tidy_repair_string')) 
return $html; 
//use tidy to repair html code

// tidy 的参数设定 
$conf = array( 
'output-xhtml'=>true 
,'drop-empty-paras'=>FALSE 
,'join-classes'=>TRUE 
,'show-body-only'=>TRUE 
);

//repair 
$str = tidy_repair_string($html,$conf,'utf8'); 
//生成解析树 
$str = tidy_parse_string($str,$conf,'utf8');

$s ='';

//得到body节点 
$body = @tidy_get_body($str);

//函数 _dumpnode，检查每个节点，过滤后输出 
function _dumpnode($node,&$s){

//查看节点名，如果是<script> 和<style>就直接清除 
switch($node->name){ 
case 'script': 
case 'style': 
return; 
break; 
default: 
}

if($node->type == TIDY_NODETYPE_TEXT){ 
/* 
如果该节点内是文字，做额外的处理： 
过长文字的自动换行问题; 
超链接的自动识别(未实现) 
*/ 
// insert <wbr> 
$s .= HtmlInsertWbrs($node->value,30,'','&?/\');

// auto links ??? *** TODO *** 
return; 
}

//不是文字节点，那么处理标签和它的属性 
$s .= '<'.$node->name;

//检查每个属性 
if($node->attribute){ 
foreach($node->attribute as $name=>$value){

/* 
清理一些DOM事件，通常是on开头的， 
比如onclick onmouseover等.... 
或者属性值有javascript:字样的， 
比如href="javascript:"的也被清除. 
*/ 
if(strpos($name,'on') === 0 
|| 
stripos(trim($value),'javascript:') ===0 
){ 
continue; 
}

//保留安全的属性 
$s .= ' '.$name.'="'.HtmlEscape($value).'"';

} 
}

//递归检查该节点下的子节点 
if($node->child){

$s .= '>';

foreach($node->child as $child){ 
_dumpnode($child,$s); 
}

//子节点处理完毕，闭合标签 
$s .= '</'.$node->name.'>'; 
}else{

/* 
已经没有子节点了，将标签闭合 
(事实上也可以考虑直接删除掉空的节点) 
*/ 
if($node->type == TIDY_NODETYPE_START) 
$s .= '></'.$node->name.'>'; 
else 
/* 
对非配对标签，比如<hr/> <br/> <img/>等 
直接以 />闭合之 
*/ 
$s .= '/>'; 
} 
} 
//函数定义end

//通过上面的函数 对 body节点开始过滤。 
if($body->child){

foreach($body->child as $child) 
_dumpnode($child,$s); 
}else 
return '';

return $s; 
}



?>

