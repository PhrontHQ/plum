// determine if this is a touch-capable device
const isTouchDevice = ('ontouchstart' in window) ||
  (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);
console.log(`isTouchDevice: ${isTouchDevice ? 'TRUE' : 'FALSE'} `);

const button = document.getElementById('btnClear');
const divEvents = document.getElementById('divEvents');
const olEvents = document.getElementById('olEvents');
const divBottom = document.getElementById('divBottom');

// handle "clear history" button click
button.addEventListener('click', function() {
  if (isTouchDevice) {
    // simulate click on button using `focus` and `blur`
    button.focus();
    setTimeout(() => button.blur(), 500);
  }
  olEvents.innerHTML = '';
});

const eventNames = [
  'load',
  'focus',
  'blur',
  'change',
  'close',
  'error',
  'haschange',
  'message',
  'offline',
  'online',
  'pagehide',
  'pageshow',
  'visibilitychange',
  'popstate',
  'resize',
  'submit',
  'unload',
  'beforeunload'
];
eventNames.forEach(function(eventName) {
  window.addEventListener(eventName, function(evt) {
    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2, '0') + ':' +
      now.getMinutes().toString().padStart(2, '0') + ':' +
      now.getSeconds().toString().padStart(2, '0') + '.' +
      now.getMilliseconds();
    let li = document.createElement('li');
    let message = timeStr + ' - window -' + `<code>${evt.type}</code>`;
    if(evt.type === "visibilitychange") {
        message+= " "+evt.target.visibilityState;

        if(evt.target.visibilityState === "hidden") {
            //worker.postMessage('hang the browser');
        } else if(evt.target.visibilityState === "visible") {
            //worker.postMessage('visible');
        }

    }
    li.innerHTML = message;
    console.debug(message);
    olEvents.appendChild(li);

    // scroll to bottom
    // window.scrollTo(0, divBottom.offsetTop);
    const bottomOffset = divBottom.offsetTop;
    divEvents.scrollTop = bottomOffset - 10;
  });

//   document.addEventListener(eventName, function(evt) {
//     const now = new Date();
//     const timeStr = now.getHours().toString().padStart(2, '0') + ':' +
//       now.getMinutes().toString().padStart(2, '0') + ':' +
//       now.getSeconds().toString().padStart(2, '0') + '.' +
//       now.getMilliseconds();
//     let li = document.createElement('li');
//     li.innerHTML = timeStr + ' - document -' + `<code>${evt.type}</code>`;
//     olEvents.appendChild(li);

//     // scroll to bottom
//     // window.scrollTo(0, divBottom.offsetTop);
//     const bottomOffset = divBottom.offsetTop;
//     divEvents.scrollTop = bottomOffset - 10;
//   });
});


var worker = new Worker('worker.js');
  
worker.addEventListener('message', function(e) {
    if(e.data.time) {
        console.log("received worker time:",e.data.time);
    } else {
        document.getElementById('message').innerText = (e.data);
    }
});

let count = 0;
let rAF_ID;

var rAFCallback = function(callback) {
  let count = callback;

  let ms = Math.floor(count % 1000);
  let s = Math.floor((count /  1000)) % 60;
  let m = Math.floor((count / 60000)) % 60;

  document.getElementById('timer').innerText = (m + ":" + s + ":" + ms);
  rAF_ID = requestAnimationFrame( rAFCallback );
}

// request animation frame on render
rAF_ID = requestAnimationFrame( rAFCallback );  

function hangTheBrowser() {
  worker.postMessage('hang the browser');
}
