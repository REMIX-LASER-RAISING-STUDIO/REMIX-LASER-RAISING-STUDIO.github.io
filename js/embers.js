/* 燧石火星粒子：向上飘浮的金色火花，data-color / data-count 可配置 */
(function(){
  function init(canvas){
    if(!canvas) return;
    const ctx=canvas.getContext("2d"); if(!ctx) return;
    const reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const COLOR=canvas.dataset.color||"255,215,0";
    const COUNT=parseInt(canvas.dataset.count||"42",10);
    let w=0,h=0,ps=[],raf=null;
    function resize(){
      const dpr=Math.min(window.devicePixelRatio||1,2);
      w=innerWidth;h=innerHeight;
      canvas.width=w*dpr;canvas.height=h*dpr;
      canvas.style.width=w+"px";canvas.style.height=h+"px";
      ctx.setTransform(dpr,0,0,dpr,0,0);
      spawn();
    }
    function spawn(){
      ps=[];
      const n=Math.min(COUNT,Math.max(16,Math.floor(w*h/45000)));
      for(let i=0;i<n;i++) ps.push(newP(true));
    }
    function newP(any){
      return{x:Math.random()*w, y:any?Math.random()*h:h+10,
        vx:(Math.random()-.5)*.25, vy:-(.25+Math.random()*.55),
        r:.8+Math.random()*1.6, a:.15+Math.random()*.45,
        tw:Math.random()*Math.PI*2, tww:.01+Math.random()*.03};
    }
    function step(){
      ctx.clearRect(0,0,w,h);
      for(const p of ps){
        p.x+=p.vx;p.y+=p.vy;p.tw+=p.tww;
        if(p.y<-12||p.x<-12||p.x>w+12) Object.assign(p,newP(false));
        const alpha=p.a*(.6+.4*Math.sin(p.tw));
        ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(${COLOR},${alpha})`;ctx.fill();
        ctx.beginPath();ctx.arc(p.x,p.y,p.r*3,0,Math.PI*2);
        ctx.fillStyle=`rgba(${COLOR},${alpha*.12})`;ctx.fill();
      }
      raf=requestAnimationFrame(step);
    }
    resize();
    if(reduce){ step(); cancelAnimationFrame(raf); } else step();
    addEventListener("resize",()=>{ resize(); if(reduce){step();cancelAnimationFrame(raf);} });
    window.setEmberColor=function(c){ canvas.dataset.color=c; };
  }
  function ready(fn){document.readyState==="loading"?document.addEventListener("DOMContentLoaded",fn):fn();}
  ready(()=>init(document.getElementById("embers-canvas")));
})();
