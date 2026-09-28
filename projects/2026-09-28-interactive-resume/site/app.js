const $=s=>document.querySelector(s), video=$('#intro'), skip=$('#skip'), reduced=$('#reduce'), dialog=$('#details');
const media=matchMedia('(prefers-reduced-motion: reduce)');
let preference;try{preference=localStorage.getItem('resume-reduce-motion')}catch{}
reduced.checked=preference===null||preference===undefined?media.matches:preference==='true';
const states={};
function loadState(i){if(states[i])return states[i];const image=new Image();image.className='state';image.alt='';image.src=`assets/0${i}.webp`;image.decoding='async';$('#states').append(image);states[i]=image;return image;}
if(matchMedia('(hover: hover)').matches&&!reduced.checked&&!navigator.connection?.saveData){const preload=()=>{for(let i=1;i<=4;i++)loadState(i)};if('requestIdleCallback' in window)requestIdleCallback(preload,{timeout:3000});else setTimeout(preload,2000)}
let playing=false, playId=0, startTimer, stallTimer;
function clearVideoTimers(){clearTimeout(startTimer);clearTimeout(stallTimer)}
function finish(){++playId;playing=false;clearVideoTimers();video.pause();video.hidden=true;skip.hidden=true;showState(0)}
function showState(id){if(id&&!playing&&!reduced.checked)loadState(id);for(const [key,image] of Object.entries(states))image.classList.toggle('active',!playing&&!reduced.checked&&key===String(id));}
async function play(){finish();if(reduced.checked)return;const request=++playId;playing=true;video.currentTime=0;video.hidden=false;skip.hidden=false;startTimer=setTimeout(finish,7000);try{await video.play();if(request!==playId)return;clearTimeout(startTimer)}catch{if(request===playId)finish();}}
video.addEventListener('ended',finish);video.addEventListener('error',finish);video.querySelector('source').addEventListener('error',finish);video.addEventListener('waiting',()=>{clearTimeout(stallTimer);stallTimer=setTimeout(finish,7000)});video.addEventListener('playing',()=>clearTimeout(stallTimer));
skip.onclick=finish;$('#replay').onclick=()=>{if(reduced.checked){toast('关闭“减少动态效果”后可重新播放');return}play()};
reduced.onchange=()=>{try{localStorage.setItem('resume-reduce-motion',String(reduced.checked))}catch{}if(reduced.checked)finish()};
const onMotionChange=e=>{let stored;try{stored=localStorage.getItem('resume-reduce-motion')}catch{}if(stored==null){reduced.checked=e.matches;if(e.matches)finish()}};
if(media.addEventListener)media.addEventListener('change',onMotionChange);else if(media.addListener)media.addListener(onMotionChange);
for(const button of document.querySelectorAll('[data-section]')){button.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')showState(button.dataset.section)});button.addEventListener('pointerleave',()=>showState(0));button.addEventListener('focus',()=>showState(button.dataset.section));button.addEventListener('blur',()=>showState(0));button.addEventListener('click',()=>{finish();const section=resumeSections[button.dataset.section];$('#detail-title').textContent=section.title;$('#detail-en').textContent=section.en;$('#detail-body').innerHTML=section.html;dialog.showModal();dialog.scrollTop=0;document.body.style.overflow='hidden';});}
$('#close').onclick=()=>dialog.close();dialog.addEventListener('close',()=>{document.body.style.overflow='';showState(0)});
$('#detail-body').addEventListener('click',event=>{const button=event.target.closest('[data-campus-target]');if(!button)return;const section=document.getElementById('campus-'+button.dataset.campusTarget);if(section){section.scrollIntoView({behavior:reduced.checked?'auto':'smooth',block:'start'});section.focus({preventScroll:true})}});
document.querySelectorAll('[data-section]').forEach(button=>button.addEventListener('click',()=>{dialog.classList.toggle('experience-dialog',button.dataset.section==='1')}));
for(const d of document.querySelectorAll('dialog'))d.addEventListener('click',event=>{if(event.target===d){const r=d.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)d.close()}});
let toastTimer;function toast(message){$('#toast').textContent=message;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,3500)}
const localPreview=location.protocol==='file:'||/^(localhost|127(?:\.\d+){3}|\[?::1\]?|0\.0\.0\.0|10(?:\.\d+){3}|192\.168(?:\.\d+){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d+){2})$/.test(location.hostname);
// Keep sharing inside the page; do not invoke the browser/OS native share service.
$('#share').onclick=()=>{finish();const url=localPreview?'https://lixinxin-portfolio.xinxinli087.chatgpt.site/':new URL(location.pathname,location.origin).href;$('#share-url').value=url;$('#share-message').textContent=/MicroMessenger/i.test(navigator.userAgent)?'可复制链接，或使用微信右上角菜单分享。':'';if(!$('#share-dialog').open)$('#share-dialog').showModal();};
$('#close-share').onclick=()=>$('#share-dialog').close();$('#copy-url').onclick=async()=>{try{await navigator.clipboard.writeText($('#share-url').value);$('#share-message').textContent='链接已复制'}catch{$('#share-url').select();$('#share-message').textContent='请复制上方已选中的链接'}};
if(!reduced.checked)play();
