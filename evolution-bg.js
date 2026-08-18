// ============================================================
// ALFA V4 — FUNDO EVOLUTIVO POR SCROLL (CANVAS)
// ============================================================
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let canvas,ctx,w,h,dpr=1,particles=[],raf=0,scrollProgress=0,targetProgress=0,mouse={x:.5,y:.5};
  const rand=(a,b)=>a+Math.random()*(b-a);
  function setup(){
    canvas=document.getElementById('evolutionCanvas'); if(!canvas)return;
    ctx=canvas.getContext('2d',{alpha:true}); resize(); seed();
    addEventListener('resize',resize,{passive:true});addEventListener('scroll',updateScroll,{passive:true});
    addEventListener('pointermove',e=>{mouse.x=e.clientX/innerWidth;mouse.y=e.clientY/innerHeight},{passive:true});
    updateScroll(); if(reduce){draw();return} loop();
  }
  function resize(){dpr=Math.min(devicePixelRatio||1,2);w=innerWidth;h=innerHeight;canvas.width=w*dpr;canvas.height=h*dpr;canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0)}
  function seed(){particles=Array.from({length:72},(_,i)=>({x:Math.random(),y:Math.random(),z:Math.random(),s:rand(.4,1.8),phase:rand(0,Math.PI*2),speed:rand(.0003,.0012)}))}
  function updateScroll(){const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);targetProgress=Math.min(1,Math.max(0,scrollY/max));document.documentElement.style.setProperty('--evolution',targetProgress.toFixed(4));document.documentElement.style.setProperty('--scroll-y',`${scrollY}px`)}
  function wolfEnergy(t,p){
    const cx=w*(.76-.20*p), cy=h*(.28+.38*p); const scale=Math.min(w,h)*(.18+.11*p);
    ctx.save();ctx.translate(cx,cy);ctx.rotate(-.14+.22*p);ctx.globalCompositeOperation='lighter';
    for(let ring=0;ring<5;ring++){
      ctx.beginPath();const pts=64;for(let i=0;i<=pts;i++){const a=(i/pts)*Math.PI*2;const pulse=Math.sin(a*3+t*.0016+ring)*(.08+.04*p);const r=scale*(.55+ring*.16+pulse);const x=Math.cos(a)*r*(1.25+.35*p);const y=Math.sin(a)*r*(.62+.16*p);i?ctx.lineTo(x,y):ctx.moveTo(x,y)}
      ctx.strokeStyle=`rgba(255,106,0,${.055+.035*p-ring*.006})`;ctx.lineWidth=1.1+ring*.25;ctx.stroke();
    }
    ctx.restore();
  }
  function grid(p,t){
    ctx.save();ctx.globalAlpha=.05+.11*p;ctx.strokeStyle='rgba(255,255,255,.28)';ctx.lineWidth=.5;
    const spacing=90-38*p, horizon=h*(.78-.25*p);
    for(let x=-w;x<w*2;x+=spacing){ctx.beginPath();ctx.moveTo(w/2,horizon);ctx.lineTo(x+(mouse.x-.5)*80,h);ctx.stroke()}
    for(let i=0;i<10;i++){const q=(i/10+t*.000035)%1;const y=horizon+(h-horizon)*q*q;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
    ctx.restore();
  }
  function draw(t=0){
    scrollProgress+=(targetProgress-scrollProgress)*.055;const p=scrollProgress;ctx.clearRect(0,0,w,h);
    const g=ctx.createRadialGradient(w*(.83-.28*p),h*(.12+.47*p),0,w*(.83-.28*p),h*(.12+.47*p),Math.max(w,h)*(.72+.15*p));
    g.addColorStop(0,`rgba(255,106,0,${.16+.11*p})`);g.addColorStop(.32,`rgba(255,83,0,${.055+.05*p})`);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
    grid(p,t);wolfEnergy(t,p);
    ctx.globalCompositeOperation='lighter';
    const active=Math.floor(28+44*p);
    for(let i=0;i<active;i++){const a=particles[i];a.phase+=a.speed*(1+p*3)*(t?16:0);let x=((a.x+p*(.08+a.z*.16)+Math.sin(a.phase)*.012)%1)*w;let y=((a.y-p*(.05+a.z*.12)+Math.cos(a.phase*.7)*.008+1)%1)*h;const size=a.s*(.7+p*1.8);ctx.beginPath();ctx.arc(x,y,size,0,Math.PI*2);ctx.fillStyle=i%5===0?`rgba(255,255,255,${.16+.24*p})`:`rgba(255,106,0,${.14+.36*p})`;ctx.fill()}
    ctx.globalCompositeOperation='source-over';
  }
  function loop(t){draw(t);raf=requestAnimationFrame(loop)}
  document.addEventListener('DOMContentLoaded',setup);
})();
