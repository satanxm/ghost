//定义公用cgi路径

var spark_path='http://spark.oa.com/demo/';		 //前台
var cgipath=spark_path+'../server/';    //后台
var oa_login="http://passport.oa.com/modules/passport/signin.ashx?url=";//OA登陆
var oa_logout="http://passport.oa.com/modules/passport/signout.ashx?url=";//OA退出

if(window.location.href.indexOf("spark.oa.com")==-1){
	cgipath='http://127.0.0.1/spark/server/'; 
	spark_path='http://127.0.0.1/spark/';
}

oa_login_path=oa_login+spark_path+"proxy.htm";//加入proxy.htm，在此页面过滤过ticket，防止在首页闪
oa_logout_path=oa_logout+spark_path+"proxy.htm";




//定义配置页面的一些公用变量
var ajax_timeout=12*1000;//ajax超时时间
var public_min_height='50px';
var public_bg_color='#bbb';


//重写outerHTML方式，因为firefox不支持
if(typeof(HTMLElement)!="undefined" && !window.opera)
{
     HTMLElement.prototype.__defineGetter__("outerHTML",function()
    {
        var a=this.attributes, str="<"+this.tagName, i=0;for(;i<a.length;i++)
        if(a[i].specified)
             str+=" "+a[i].name+'="'+a[i].value+'"';
        if(!this.canHaveChildren)
            return str+" />";
        return str+">"+this.innerHTML+"</"+this.tagName+">"; 
     });
     HTMLElement.prototype.__defineSetter__("outerHTML",function(s)
    {
        var r = this.ownerDocument.createRange();
         r.setStartBefore(this);
        var df = r.createContextualFragment(s);
        this.parentNode.replaceChild(df, this);
        return s;
     });
     HTMLElement.prototype.__defineGetter__("canHaveChildren",function()
    {
        return !/^(area|base|basefont|col|frame|hr|img|br|input|isindex|link|meta|param)$/.test(this.tagName.toLowerCase());
     });
}