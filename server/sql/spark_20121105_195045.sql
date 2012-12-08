CREATE TABLE `category` (
  `id` int(11) NOT NULL auto_increment,
  `name` text,
  `info` text,
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=66 DEFAULT CHARSET=utf8;
insert into `category`(`id`,`name`,`info`) values('62','aaa工aaa工','bbb');
insert into `category`(`id`,`name`,`info`) values('65','qweqwe','ewq');
insert into `category`(`id`,`name`,`info`) values('63','在地在地','要要');
CREATE TABLE `comment` (
  `id` int(11) NOT NULL auto_increment,
  `page_id` int(11) NOT NULL,
  `author` text character set utf8 NOT NULL,
  `build_time` int(11) NOT NULL,
  `content` text character set utf8 NOT NULL,
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=15 DEFAULT CHARSET=latin1;
insert into `comment`(`id`,`page_id`,`author`,`build_time`,`content`) values('12','126','admin','1351014166',' 取消 取消 取消 取消 取消 取消 取消 取消
 取消');
insert into `comment`(`id`,`page_id`,`author`,`build_time`,`content`) values('11','126','admin','1351014065','在');
insert into `comment`(`id`,`page_id`,`author`,`build_time`,`content`) values('10','124','admin','1351014018','评论油门工');
insert into `comment`(`id`,`page_id`,`author`,`build_time`,`content`) values('13','128','admin','1351077665','haha');
insert into `comment`(`id`,`page_id`,`author`,`build_time`,`content`) values('14','128','admin','1351079319','');
CREATE TABLE `link` (
  `id` int(11) NOT NULL auto_increment,
  `name` text character set utf8,
  `url` text character set utf8,
  `type` int(11) default NULL COMMENT '0:link,1:tool',
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
CREATE TABLE `page` (
  `id` int(11) NOT NULL auto_increment,
  `name` text,
  `content` text,
  `author` text,
  `build_time` int(11) default NULL,
  `adjust_time` int(11) default NULL,
  `adjuster` text,
  `category_id` int(11) default NULL,
  `info` text,
  `demo` text NOT NULL,
  `tag` text NOT NULL,
  `img` text NOT NULL,
  `praise` int(11) NOT NULL,
  `praise_user` text NOT NULL,
  `status` int(11) NOT NULL,
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=136 DEFAULT CHARSET=utf8;
insert into `page`(`id`,`name`,`content`,`author`,`build_time`,`adjust_time`,`adjuster`,`category_id`,`info`,`demo`,`tag`,`img`,`praise`,`praise_user`,`status`) values('126','vvv测试1','vvv测试vvv测试vvv测试vvv测试vvv测试
vvv测试vvv测试vvv测试vvv测试vvv测试vvv测试vvv测试vvv测试vvv测试vvv测试vvv测试vvv测试vvv测试vvv测试
vvv测试vvv测试vvv测试vvv测试','admin','1351011274','1351081034','admin','65','vvv测试vvv测试','vvv测试vvv测试vvv测试','css','','1','admin','1');
insert into `page`(`id`,`name`,`content`,`author`,`build_time`,`adjust_time`,`adjuster`,`category_id`,`info`,`demo`,`tag`,`img`,`praise`,`praise_user`,`status`) values('124','qwe','qwe','admin','1351008828','1351081055','admin','65','qwe','qwe','qwe','','1','admin','1');
insert into `page`(`id`,`name`,`content`,`author`,`build_time`,`adjust_time`,`adjuster`,`category_id`,`info`,`demo`,`tag`,`img`,`praise`,`praise_user`,`status`) values('125','aaaaad','ggg
hh
iii
kkkd','admin','1351008962','1351597991','admin','65','bbbb','cccc',',不 是吧，哈,天啊   ，,你行,','','1','admin','1');
insert into `page`(`id`,`name`,`content`,`author`,`build_time`,`adjust_time`,`adjuster`,`category_id`,`info`,`demo`,`tag`,`img`,`praise`,`praise_user`,`status`) values('128','1','4','kundyzhang','1351077270','1351597982','admin','0','2','3',',你行,abc,','','1','admin','1');
insert into `page`(`id`,`name`,`content`,`author`,`build_time`,`adjust_time`,`adjuster`,`category_id`,`info`,`demo`,`tag`,`img`,`praise`,`praise_user`,`status`) values('129','aaaaaa','ccccccccccccccccccccccccccc','admin','1351081192','0','','65','bbbb','ccc','ioioio,masdf ,as ,','','0','','1');
insert into `page`(`id`,`name`,`content`,`author`,`build_time`,`adjust_time`,`adjuster`,`category_id`,`info`,`demo`,`tag`,`img`,`praise`,`praise_user`,`status`) values('131','adsfsa','','admin','1351082132','0','','65','dfsadf','asdf','cxxxcv','','0','','1');
insert into `page`(`id`,`name`,`content`,`author`,`build_time`,`adjust_time`,`adjuster`,`category_id`,`info`,`demo`,`tag`,`img`,`praise`,`praise_user`,`status`) values('133','','','admin','1351589830','','','','','','','','0','','0');
insert into `page`(`id`,`name`,`content`,`author`,`build_time`,`adjust_time`,`adjuster`,`category_id`,`info`,`demo`,`tag`,`img`,`praise`,`praise_user`,`status`) values('134','adfsf1','','kundyzhang','1351596770','1351597874','kundyzhang','0','2','',',mmm m,测试QQ 在,','','0','','1');
insert into `page`(`id`,`name`,`content`,`author`,`build_time`,`adjust_time`,`adjuster`,`category_id`,`info`,`demo`,`tag`,`img`,`praise`,`praise_user`,`status`) values('135','疑难杂症','','kundyzhang','1351597956','1351758755','kundyzhang','0','','',',abcd,','','0','','1');
CREATE TABLE `power` (
  `id` int(11) NOT NULL auto_increment,
  `title` text,
  `name` text,
  `info` text,
  `power_group` text,
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=99 DEFAULT CHARSET=utf8;
insert into `power`(`id`,`title`,`name`,`info`,`power_group`) values('78','页面添加','page-add','','页面');
insert into `power`(`id`,`title`,`name`,`info`,`power_group`) values('79','页面修改','page-update','','页面');
insert into `power`(`id`,`title`,`name`,`info`,`power_group`) values('80','页面删除','page-del','','页面');
insert into `power`(`id`,`title`,`name`,`info`,`power_group`) values('81','页面赞','page-praise','','页面');
insert into `power`(`id`,`title`,`name`,`info`,`power_group`) values('82','页面列表','page-showlist','','页面');
insert into `power`(`id`,`title`,`name`,`info`,`power_group`) values('83','页面详情','page-getinfo','','页面');
insert into `power`(`id`,`title`,`name`,`info`,`power_group`) values('84','用户添加','user-add','','用户');
insert into `power`(`id`,`title`,`name`,`info`,`power_group`) values('85','用户修改','user-update','','用户');
insert into `power`(`id`,`title`,`name`,`info`,`power_group`) values('86','用户删除','user-del','','用户');
insert into `power`(`id`,`title`,`name`,`info`,`power_group`) values('87','用户列表','user-showlist','','用户');
insert into `power`(`id`,`title`,`name`,`info`,`power_group`) values('88','分类添加','category-add','','分类');
insert into `power`(`id`,`title`,`name`,`info`,`power_group`) values('89','分类修改','category-update','','分类');
insert into `power`(`id`,`title`,`name`,`info`,`power_group`) values('90','分类删除','category-del','','分类');
insert into `power`(`id`,`title`,`name`,`info`,`power_group`) values('91','系统配置','setting-operate','','系统配置');
insert into `power`(`id`,`title`,`name`,`info`,`power_group`) values('92','资源添加','resource-add','','资源池');
insert into `power`(`id`,`title`,`name`,`info`,`power_group`) values('93','资源删除','resource-del','','资源池');
insert into `power`(`id`,`title`,`name`,`info`,`power_group`) values('94','资源认领','resource-claim','','资源池');
insert into `power`(`id`,`title`,`name`,`info`,`power_group`) values('95','取消认领','resource-claimCancel','','资源池');
insert into `power`(`id`,`title`,`name`,`info`,`power_group`) values('96','资源列表','resource-showlist','','资源池');
insert into `power`(`id`,`title`,`name`,`info`,`power_group`) values('97','资源完成','resource-finish','','资源池');
insert into `power`(`id`,`title`,`name`,`info`,`power_group`) values('98','资源修改','resource-update','','资源池');
CREATE TABLE `resource` (
  `id` int(11) NOT NULL auto_increment,
  `url` text character set utf8 NOT NULL,
  `info` text character set utf8 NOT NULL,
  `build_time` int(11) NOT NULL,
  `author` text character set utf8 NOT NULL,
  `claimer` text character set utf8 NOT NULL,
  `claim_time` int(11) NOT NULL,
  `status` int(11) NOT NULL,
  `page_id` int(11) NOT NULL,
  `name` text character set utf8 NOT NULL,
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=latin1;
insert into `resource`(`id`,`url`,`info`,`build_time`,`author`,`claimer`,`claim_time`,`status`,`page_id`,`name`) values('2','http://soulwire.github.com/Makisu/','向下掉落的席子','1351070580','admin','','0','0','0','');
insert into `resource`(`id`,`url`,`info`,`build_time`,`author`,`claimer`,`claim_time`,`status`,`page_id`,`name`) values('3','式承','aaaaaaaaasdf','1351071523','admin','admin','1350073471','1','0','');
insert into `resource`(`id`,`url`,`info`,`build_time`,`author`,`claimer`,`claim_time`,`status`,`page_id`,`name`) values('4','工','在','1349814602','kundyzhang','kundyzhang','1350074351','2','0','');
insert into `resource`(`id`,`url`,`info`,`build_time`,`author`,`claimer`,`claim_time`,`status`,`page_id`,`name`) values('5','aaaaaaaaa1','bbbbbbbbbbbbb','1351074729','kundyzhang','kundyzhang','1351074733','1','0','');
insert into `resource`(`id`,`url`,`info`,`build_time`,`author`,`claimer`,`claim_time`,`status`,`page_id`,`name`) values('6','添加资源添加资源添加资源','添加资源添加资源添加资源添加资源','1351074801','kundyzhang','kundyzhang','1351077270','2','128','');
insert into `resource`(`id`,`url`,`info`,`build_time`,`author`,`claimer`,`claim_time`,`status`,`page_id`,`name`) values('8','dfa','dfasdf','1350588352','kundyzhang','admin','1351589830','1','133','aab');
CREATE TABLE `setting` (
  `id` int(11) NOT NULL auto_increment,
  `name` text character set utf8,
  `value` text,
  `group` int(11) default NULL,
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
CREATE TABLE `system` (
  `id` int(11) NOT NULL auto_increment,
  `svn_username` text,
  `svn_password` text,
  `svn_path` text,
  `prefix_layout` text,
  `prefix_container` text,
  `prefix_module` text,
  `prefix_component` text,
  `power_sort` text,
  `system_name` text,
  `system_url` text,
  `system_server_url` text,
  `svn_url` text,
  `print_classname_class` text,
  `print_visible_class` text,
  `print_img_class` text,
  `print_loop_class` text,
  `print_var_class` text,
  `print_html_event_class` text,
  `print_html_event_click` text,
  `print_html_event_clicked` text,
  `print_css_selector_class` text,
  `print_css_property_class` text,
  `print_css_value_class` text,
  `print_css_event_class` text,
  `print_css_event_click` text,
  `print_css_event_clicked` text,
  `print_img_event_click` text,
  `print_img_event_clicked` text,
  `print_link` text,
  `page_ident_prefix` text,
  `code_type_field` text,
  `code_id_field` text,
  `system_css_field` text,
  `user_css_field` text,
  `user_custom_field` text,
  `filter_field` text,
  `active_resource` int(11) NOT NULL COMMENT '活跃度_资源加成',
  `active_page` int(11) NOT NULL COMMENT '活跃度_文章加成',
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
insert into `system`(`id`,`svn_username`,`svn_password`,`svn_path`,`prefix_layout`,`prefix_container`,`prefix_module`,`prefix_component`,`power_sort`,`system_name`,`system_url`,`system_server_url`,`svn_url`,`print_classname_class`,`print_visible_class`,`print_img_class`,`print_loop_class`,`print_var_class`,`print_html_event_class`,`print_html_event_click`,`print_html_event_clicked`,`print_css_selector_class`,`print_css_property_class`,`print_css_value_class`,`print_css_event_class`,`print_css_event_click`,`print_css_event_clicked`,`print_img_event_click`,`print_img_event_clicked`,`print_link`,`page_ident_prefix`,`code_type_field`,`code_id_field`,`system_css_field`,`user_css_field`,`user_custom_field`,`filter_field`,`active_resource`,`active_page`) values('1','undefined','undefined','undefined','undefined','undefined','undefined','undefined','用户;页面;分类;资源池;系统配置;','SPARK','http://spark.oa.com/','http://spark.oa.com/server/','undefined','undefined','undefined','undefined','undefined','undefined','undefined','undefined','undefined','undefined','undefined','undefined','undefined','undefined','undefined','undefined','undefined','undefined','undefined','undefined','undefined','undefined','undefined','undefined','undefined','3','5');
CREATE TABLE `tag` (
  `id` int(11) NOT NULL auto_increment,
  `name` text character set utf8 NOT NULL,
  `count` int(11) NOT NULL,
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=33 DEFAULT CHARSET=latin1;
insert into `tag`(`id`,`name`,`count`) values('20','qwe','1');
insert into `tag`(`id`,`name`,`count`) values('19','css','1');
insert into `tag`(`id`,`name`,`count`) values('18','abc','1');
insert into `tag`(`id`,`name`,`count`) values('6','不 是吧，哈','1');
insert into `tag`(`id`,`name`,`count`) values('7','天啊   ，','1');
insert into `tag`(`id`,`name`,`count`) values('8','你行','2');
insert into `tag`(`id`,`name`,`count`) values('21','ioioio','1');
insert into `tag`(`id`,`name`,`count`) values('22','masdf','1');
insert into `tag`(`id`,`name`,`count`) values('23','as','1');
insert into `tag`(`id`,`name`,`count`) values('25','cxxxcv','1');
insert into `tag`(`id`,`name`,`count`) values('28','mmm m','1');
insert into `tag`(`id`,`name`,`count`) values('29','测试QQ 在','1');
insert into `tag`(`id`,`name`,`count`) values('32','abcd','1');
CREATE TABLE `user` (
  `id` int(11) NOT NULL auto_increment,
  `nick` text,
  `name` text,
  `usergroup` int(11) default NULL,
  `sign_time` datetime default NULL,
  `last_login_time` datetime default NULL,
  `passwd` text,
  `oa_flag` int(11) default NULL COMMENT '来自oa系统',
  `img` text COMMENT '头像路径',
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=133 DEFAULT CHARSET=utf8;
insert into `user`(`id`,`nick`,`name`,`usergroup`,`sign_time`,`last_login_time`,`passwd`,`oa_flag`,`img`) values('1','超级管理员','admin','1','2012-10-17 14:57:52','0000-00-00 00:00:00','e9e1bfd277ec61dc62e2e4f27e84c141','0','pic/head/_admin.jpg');
insert into `user`(`id`,`nick`,`name`,`usergroup`,`sign_time`,`last_login_time`,`passwd`,`oa_flag`,`img`) values('132','张昆','kundyzhang','2','2012-10-24 17:41:09','2012-11-02 19:08:39','abcdefg','1','pic/head/kundyzhang.jpg');
insert into `user`(`id`,`nick`,`name`,`usergroup`,`sign_time`,`last_login_time`,`passwd`,`oa_flag`,`img`) values('2','游客','guest','3','2012-10-24 17:54:29','','97c6c3c3893a6d73a8550aa7a3d38bb0','0','pic/head/profile.jpg');
CREATE TABLE `usergroup` (
  `id` int(11) NOT NULL auto_increment,
  `name` text,
  `power` text,
  `admin` int(11) default NULL,
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
insert into `usergroup`(`id`,`name`,`power`,`admin`) values('1','超级管理员','','1');
insert into `usergroup`(`id`,`name`,`power`,`admin`) values('2','普通用户','87,78,79,80,81,82,83,92,93,94,95,96,97,98,','0');
insert into `usergroup`(`id`,`name`,`power`,`admin`) values('3','游客','87,82,96,','0');
