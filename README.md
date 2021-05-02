# 配置
## fork本项目
![image.png](https://i.loli.net/2021/05/02/xaovwFRgAbnTe8s.png)
## 设置secret
**切换到你的repo**
### 如何配置secrets
见 https://blog.csdn.net/weixin_45178716/article/details/106416925 或者其他博客。
![image.png](https://i.loli.net/2021/05/02/AqONiuYF6lJQvr3.png)
### 设置账号和密码
在github secret里设置账号和密码   
`NAME`:学号  
`VPN_PASS`:VPN密码  
`DOOR_PASS`信息门户密码  
`BUPT_TIME`:时段，1,2,3分别代表67,78,89

以上字段都是必需的，如果缺少或填错，都可能导致运行失败。

## 接收和发送信息
**这一部分配置是可选的。**
### 使用邮箱
#### 修改main.yml
```
- name: Send mail
    uses: dawidd6/action-send-mail@v3
    with:
    # smtp服务器，如果不是用腾讯企业邮，请修改
    server_address: smtp.exmail.qq.com
    # 端口，可能也需要修改 
    server_port: 465
    # Required mail server username:
    username: ${{secrets.MAIL_SEND}}
    # Required mail server password:
    password: ${{secrets.MAIL_PASS}}
    
    # Required mail subject:
    subject: 预约健身房(${{env.APPOINT_DATE}} ${{env.APPOINT_HOUR}})${{env.APPOINT_STATUS}}
    to: ${{secrets.MAIL_RECV}}
    from: 群健身房预约助手
    body: 预约健身房(${{env.APPOINT_DATE}} ${{env.APPOINT_HOUR}})${{env.APPOINT_STATUS}}。在https://gym.byr.moe/my.php 中取消。
```
#### 配置secret
你需要一个邮箱的SMTP 授权码来完成此操作。   
`MAIL_SEND`: 发送邮箱   
`MAIL_PASS`：SMTP授权码   
`MAIL_RECV`: 收件邮箱   
例如：   
```
MAIL_SEND: no-reply@chronos.fun 
MAIL_PASS：**************
MAIL_RECV: xxxx@xxxx.com
```

### 使用server酱
```
- name: serverchan-action
  # You may pin to the exact commit or the version.
  # uses: codelessrun/serverchan-action@c2a0257dd81dc5f04fc9e673bdeacad023de648b
  uses: codelessrun/serverchan-action@v1
  with:
    # server酱的 SendKey
    sendKey: 
    # 消息模板的标题
    text: 
    # 消息的内容
    desp: # optional
```
配置请见http://sc.ftqq.com/9.version

## 修改日期
在你的项目中，修改cron   

`5,10,15 14 * * 2,4,5,0` 五位，分别表示分，时，几号（按月算），月，周几（按周算）  

例如这里表示周二，周四，周五，周天的UCT+0 14点（北京时间22点）启动。这里设置为周二，其实是预约了周五的。因此实际上是周一，周三，周五，周天。 

按此规则可以设计自己的日期。  
https://crontab.guru/  在此网站可以测试你的表达式。

**建议将时间调整到5分钟甚至更长，给没有脚本的同学一些机会。**
