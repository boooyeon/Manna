const info = document.getElementById("info");
const video = document.getElementById("localVideo");
let net;
var check = false;
async function makeNet() {
    // info.innerHTML = "Now loading... Please wait.";
    net = await cocoSsd.load();
    // info.innerHTML = "Ready to use!";
    setInterval(detect, 0);
}
makeNet();

// async function f(){
//   console.log('no person error');
//   let promise = new Promise((resolve, reject) =>{
//     setTimeout(() => resolve("사람 감지 안돼!"), 9000)
//   });
//   let result = await promise;
//   console.log(check+"");
//   if(!check){
//     alert(result);
//   }
//   check = true;
// }

let predict;
const canvas = document.getElementById("localVideo");
const ctx = canvas.getContext("2d");
ctx.strokeStyle = "rgb(0, 255, 0)";
ctx.fillStyle = "rgb(0, 255, 0)";
ctx.lineWidth = 2;
ctx.font = "15px Arial";
async function detect() {
  var peopleN = 0, phoneN = 0;
  predict = await net.detect(video);
  // info.innerHTML = "Object No. : " + predict.length;
  if (predict.length > 0) {

      for (let i = 0; i < predict.length; i++) {
          console.log(predict[i].class)
          if ((predict[i].class + "") == 'person') {
              peopleN += 1;
              //check = true;
          } else if ((predict[i].class + "") == 'cell phone') {
              phoneN += 1;
          }
      }

      if (peopleN == 0) {
          check = false;
          document.getElementById("check_text").innerHTML = "사람이 감지되지 않습니다.";
          //f();
      } else if (phoneN > 0) {
          document.getElementById("check_text").innerHTML = "휴대폰 만지지 마세요!!!!!!!!!!!";
      } else {
          document.getElementById("check_text").innerHTML = "";
          check = true;
      }
  }
  else {
    check = false;
    document.getElementById("check_text").innerHTML = "자리로 돌아오세요";
    //await f();
  }
}