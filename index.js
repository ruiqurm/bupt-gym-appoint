const rp = require('request-promise');
const tough = require('tough-cookie');
const CryptoJS = require("crypto-js");
const date = require("silly-datetime");
const core = require('@actions/core');
function aes_encrypt(plainText, AES_KEY, AES_IV) {
    var encrypted = CryptoJS.AES.encrypt(plainText, CryptoJS.enc.Utf8.parse(AES_KEY), {
        iv: CryptoJS.enc.Utf8.parse(AES_IV)
    });
    return CryptoJS.enc.Base64.stringify(encrypted.ciphertext)
}
function generate_blob(ekey,date,time){
  ekey += ekey;
  for (var raw = JSON.stringify({
      date: date,
      time: time,
      timemill: (new Date).getTime()
  }), oraw = "", i = 0; i < raw.length; ++i)
      oraw += raw.charAt(i) + raw.charAt(raw.length - 1 - i);
  return aes_encrypt(oraw, ekey.substring(0, 16), ekey.substring(2, 18))
}

async function login(name,vpn_pass,general_pass){
    var cookiejar = rp.jar();
    vpn_login_success=false;
    await rp({
      method: 'POST',
      uri: 'https://webvpn.bupt.edu.cn/do-login/',
      form: {
        "auth_type": "local",
        "username": name,
        "sms_code":"" ,
        "password": vpn_pass,
        "captcha":"" ,
        "needCaptcha": "false",
        "captcha_id": "1sn58FKoxC3v3Dz"
      },
      jar:cookiejar,
      timeout:10000
    }).then(parsedBody=>{
            let body = JSON.parse(parsedBody);
            if (body["success"]!==true){
              vpn_login_success = false
            }else{
              vpn_login_success = true
            }
      }).catch(err=>{
        core.setFailed(err)
      });
    if (vpn_login_success===false){
      await rp({
        uri: "https://webvpn.bupt.edu.cn/do-confirm-login",
        method: 'POST',
        timeout:10000
      }).catch(err=>{
        core.setFailed(err)
      })
    }
    await rp({
      method: 'POST',
      uri: 'https://webvpn.bupt.edu.cn/https/77726476706e69737468656265737421f7ee4cd225297a1e73078c/login.php',
      form: {
        "username": name,
        "password": general_pass,
      },
      timeout:10000,
      jar:cookiejar
    }).then(res=>{
              // console.log("健身房登录失败");
              core.setFailed("健身房登录失败")
            })
      .catch(res=>{
          if(res.statusCode!==302){
              // console.log("健身房登录失败");
              core.setFailed("健身房登录失败")
          }else{
            console.log("健身房登录成功")
          }
      })

  return new Promise((resolve, reject) => {resolve(cookiejar)})
}
function appoint(jar,username,date,time){
    uri = "https://webvpn.bupt.edu.cn/https/77726476706e69737468656265737421f7ee4cd225297a1e73078c/newOrder.php?vpn-12-o2-gym.byr.moe"
    rp({
      method: 'POST',
      uri: uri,
      form: {
        "blob": generate_blob(ekey =username,date=date,time=time)
      },
      timeout:10000,
      jar:jar
    }).then(data=>{
      if(data==="1"){
        console.log("成功")
        status = 1
      }else if(data==="4"){
        console.log("已预约过，成功")
        status = 1
      }else if(data==="3"){
        console.log("人数已满，失败")
        status = 0
      }else if(data==="6"){
        console.log("有不良记录，无法预约")
        status = 0
      }else{
        console.log("data="+data+"\n");
        status = 0
        throw "成功提交，但是没有预约成功；见data信息\n"
      }
    }).catch(err=>{
        status = 0
        core.setFailed(err)
    })
}

var status = 0
username = process.env["BUPT_NAME"]
if (!username)throw "缺少用户名"
vpn_pass=process.env["BUPT_VPN_PASS"]
if (!vpn_pass)throw "缺少vpn密码"
general_pass=process.env["BUPT_DOOR_PASS"]
if (!general_pass)throw "缺少信息门户密码"
time = process.env["BUPT_TIME"]
if (!time)throw "缺少时段"
var next_date = new Date()
next_date.setDate(new Date().getDate()+3)//预约最新一天
next_date = date.format(next_date,"YYYYMMDD")

core.exportVariable('APPOINT_DATE', next_date);
hour = (time==="1")?"18:40-19:40":((time==="2")?"19:40-20:40":(time==="3"?"20:40-21:40":"未知"))
core.exportVariable('APPOINT_HOUR', hour);
console.log("将预约"+next_date+"第"+process.env.APPOINT_HOUR+"时段")

  login(username,vpn_pass,general_pass).then((jar)=>{
    appoint(jar,username,next_date,time)
  }).catch(err=>{
    console.log(err);
  })
  // .then((res)=>{
  //   status = (status===0)?"失败":"成功"
  //   core.exportVariable('APPOINT_STATUS', status);
  // })



