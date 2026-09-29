const SIZE=10;
const SHAPES={square:{name:'Квадрат 2×2',cells:[[0,0],[1,0],[0,1],[1,1]],color:'yellow'},line4:{name:'Линия 4',cells:[[0,0],[0,1],[0,2],[0,3]],color:'blue'},L:{name:'L',cells:[[0,0],[0,1],[0,2],[1,2]],color:'orange'},Z:{name:'Z',cells:[[0,0],[1,0],[1,1],[2,1]],color:'red'},J:{name:'J',cells:[[1,0],[1,1],[1,2],[0,2]],color:'pink'},S:{name:'S',cells:[[1,0],[2,0],[0,1],[1,1]],color:'green'},T:{name:'T',cells:[[0,0],[1,0],[2,0],[1,1]],color:'purple'}};
const IDS=Object.keys(SHAPES);let board=emptyBoard(),boardColors=emptyBoard(),tool='block',slots=[null,null,null],slotOri=[0,0,0],activeSlot=0,lastImage=null,suggestion=null;const STORAGE_KEY='blockopolis-helper-v8';
const $=id=>document.getElementById(id),boardEl=$('board');
function emptyBoard(){return Array.from({length:SIZE},()=>Array(SIZE).fill(0))}
function key(c){return JSON.stringify(c.slice().sort((a,b)=>a[1]-b[1]||a[0]-b[0]))}
function rotate(c){const o=c.map(([x,y])=>[y,-x]),mx=Math.min(...o.map(p=>p[0])),my=Math.min(...o.map(p=>p[1]));return o.map(([x,y])=>[x-mx,y-my])}
function orientations(c){let out=[],cur=c;for(let i=0;i<4;i++){const k=key(cur);if(!out.some(x=>x.key===k))out.push({cells:cur,key:k});cur=rotate(cur)}return out}
const ORIENTS={};IDS.forEach(id=>ORIENTS[id]=orientations(SHAPES[id].cells));
function preview(id,o=0){const cells=ORIENTS[id][o].cells,w=Math.max(...cells.map(p=>p[0]))+1,h=Math.max(...cells.map(p=>p[1]))+1,d=document.createElement('div');d.className='shape '+SHAPES[id].color;d.style.gridTemplateColumns=`repeat(${w},12px)`;d.style.gridTemplateRows=`repeat(${h},12px)`;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=document.createElement('i');if(!cells.some(p=>p[0]===x&&p[1]===y))i.style.visibility='hidden';d.appendChild(i)}return d}
function renderBoard(){boardEl.innerHTML='';for(let r=0;r<10;r++)for(let c=0;c<10;c++){const e=document.createElement('div');e.className='cell';const v=board[r][c];if(v===1){e.classList.add('block');const color=boardColors[r]?.[c];if(color)e.style.setProperty('--detected-color',color)}else if(v===2)e.classList.add('bombLocked');else if(v===3)e.classList.add('bombOpen');const hint=suggestion?.preview?.find(p=>p.r===r&&p.c===c);if(hint){e.classList.add('suggest',`suggest-step-${hint.step+1}`);e.dataset.step=String(hint.step+1)}e.title=String.fromCharCode(65+c)+(r+1);e.onclick=()=>{const next=tool==='block'?1:tool==='bombLocked'?2:tool==='bombOpen'?3:0;board[r][c]=next;boardColors[r][c]=next===1?defaultBlockColor():null;suggestion=null;renderBoard();updateCounts();saveState()};boardEl.appendChild(e)}updateCounts(false)}
function renderPicker(){const p=$('piecePicker');p.innerHTML='';IDS.forEach(id=>{const b=document.createElement('button');b.className='piece-button';b.title=SHAPES[id].name;b.appendChild(preview(id));b.onclick=()=>{slots[activeSlot]=id;slotOri[activeSlot]=0;renderSlots();updateCounts();saveState()};p.appendChild(b)})}
function renderSlots(){const p=$('pieceSlots');p.innerHTML='';slots.forEach((id,i)=>{const b=document.createElement('div');b.className='piece-slot'+(i===activeSlot?' active':'');b.onclick=()=>{activeSlot=i;renderSlots();saveState()};const l=document.createElement('span');l.className='slot-label';l.textContent='Фигура '+(i+1);b.appendChild(l);if(id){b.appendChild(preview(id,slotOri[i]));const x=document.createElement('button');x.className='text-btn';x.textContent='×';x.style.cssText='position:absolute;right:4px;top:2px';x.onclick=e=>{e.stopPropagation();slots[i]=null;slotOri[i]=0;renderSlots();updateCounts();saveState()};b.appendChild(x)}else{const t=document.createElement('span');t.textContent='выбрать';t.style.color='#66899c';b.appendChild(t)}p.appendChild(b)});renderOrientation()}
function renderOrientation(){const w=$('orientation');w.innerHTML='';const id=slots[activeSlot];if(!id)return;ORIENTS[id].forEach((_,i)=>{const b=document.createElement('button');b.textContent=`${i*90}°`;b.className=slotOri[activeSlot]===i?'active':'';b.onclick=()=>{slotOri[activeSlot]=i;renderSlots();updateCounts();saveState()};w.appendChild(b)})}
function countLines(b){const rows=[],cols=[];for(let r=0;r<10;r++)if(b[r].every(Boolean))rows.push(r);for(let c=0;c<10;c++){let ok=true;for(let r=0;r<10;r++)if(!b[r][c])ok=false;if(ok)cols.push(c)}return{rows,cols,total:rows.length+cols.length}}
function updateCounts(resetStats=true){const filled=board.flat().filter(Boolean).length;$('filledCount').textContent=filled;$('lineCount').textContent=countLines(board).total;let m=0;slots.forEach((id,i)=>{if(id)m+=placements(board,id,slotOri[i]).length});$('currentMoves').textContent=m;if(resetStats){$('bestScore').textContent='—';$('resultMoves').textContent='—'}}
function setTool(t){tool=t;document.querySelectorAll('.tool').forEach(b=>b.classList.toggle('active',b.dataset.tool===t))}document.querySelectorAll('.tool').forEach(b=>b.onclick=()=>setTool(b.dataset.tool));
function clearLines(b){const q=countLines(b),n=b.map(r=>r.slice()),affected=new Set();q.rows.forEach(r=>{for(let c=0;c<10;c++)affected.add(`${r},${c}`)});q.cols.forEach(c=>{for(let r=0;r<10;r++)affected.add(`${r},${c}`)});for(const k of affected){const [r,c]=k.split(',').map(Number);if(n[r][c]===2)n[r][c]=3;else if(n[r][c]===3)n[r][c]=0;else n[r][c]=0}return{board:n,total:q.total}}
function canPlace(b,cells,r,c){return cells.every(([x,y])=>{const R=r+y,C=c+x;return R>=0&&R<10&&C>=0&&C<10&&!b[R][C]})}
function place(b,cells,r,c){const n=b.map(x=>x.slice());cells.forEach(([x,y])=>n[r+y][c+x]=1);return n}
function placements(b,id,o){const cells=ORIENTS[id][o].cells,maxX=Math.max(...cells.map(p=>p[0])),maxY=Math.max(...cells.map(p=>p[1])),out=[];for(let r=0;r<=9-maxY;r++)for(let c=0;c<=9-maxX;c++)if(canPlace(b,cells,r,c))out.push({r,c,cells});return out}
function countBombs(b){let locked=0,open=0;for(const row of b)for(const v of row){if(v===2)locked++;else if(v===3)open++}return {locked,open,total:locked+open}}
function freeCells(b){let n=0;for(const row of b)for(const v of row)if(!v)n++;return n}
function openness(b){let s=0;for(let r=0;r<10;r++){const n=b[r].filter(v=>!v).length;s+=n*n}for(let c=0;c<10;c++){let n=0;for(let r=0;r<10;r++)if(!b[r][c])n++;s+=n*n}return s}
function holes(b){let p=0;for(let r=0;r<10;r++)for(let c=0;c<10;c++)if(!b[r][c]){let n=0;for(const [dr,dc] of [[1,0],[-1,0],[0,1],[0,-1]]){const R=r+dr,C=c+dc;if(R>=0&&R<10&&C>=0&&C<10&&!b[R][C])n++}if(n===0)p+=8;else if(n===1)p+=2}return p}
const mobilityCache=new Map();
function mobility(b){const hk=boardHash(b);if(mobilityCache.has(hk))return mobilityCache.get(hk);let total=0,types=0;for(const id of IDS)for(let o=0;o<ORIENTS[id].length;o++){const n=placements(b,id,o).length;if(n){types++;total+=n}}const result=total+types*3;mobilityCache.set(hk,result);return result}
function cheapRank(st){
  const bombs=countBombs(st.b),space=freeCells(st.b),open=openness(st.b),bad=holes(st.b);
  // Line count is intentionally several orders of magnitude more important than everything else.
  return st.lines*1000000 + st.earlyLines*10000 + space*2 + open*.1 - bad*4 - bombs.locked*2 + bombs.open;
}
function finalRank(st){
  const w=+$('survivalWeight').value/100,space=freeCells(st.b),open=openness(st.b),bad=holes(st.b),mob=mobility(st.b),bombs=countBombs(st.b);
  return st.lines*1000000 + st.earlyLines*10000 + mob*(10+10*w) + open*(.15+.25*w) + space*(1+2*w) - bad*(3+3*w) - bombs.locked*2 + bombs.open;
}
function searchKey(b,used){let z=''+used;for(const row of b)z+=row.join('');return z}
function boardHash(b){let z='';for(const row of b)z+=row.join('');return z}

// Быстрый прогноз будущего: не перебираем все 7×7×7 наборов.
// Используем небольшой детерминированный набор возможных следующих фигур.
const FUTURE_SCENARIOS=[
  [['square',0],['line4',0],['L',0]],
  [['Z',0],['S',0],['T',0]],
  [['J',1],['square',0],['line4',0]],
  [['L',1],['T',0],['Z',1]],
  [['S',1],['J',0],['square',0]],
  [['T',1],['line4',0],['L',2]],
  [['Z',1],['S',0],['J',1]],
  [['line4',0],['T',0],['square',0]]
];
const futureCache=new Map();
function futureOutlook(startBoard){
  const cacheKey=boardHash(startBoard);
  if(futureCache.has(cacheKey))return futureCache.get(cacheKey);
  let totalLines=0,totalMobility=0,alive=0;
  // Только 8 репрезентативных будущих наборов и максимум 2 следующих хода.
  for(const scenario of FUTURE_SCENARIOS){
    let states=[{b:startBoard,lines:0}];
    for(let depth=0;depth<2;depth++){
      const item=scenario[depth], next=[];
      for(const st of states){
        const pls=placements(st.b,item[0],item[1]);
        for(const pl of pls){
          const cl=clearLines(place(st.b,pl.cells,pl.r,pl.c));
          next.push({b:cl.board,lines:st.lines+cl.total});
        }
      }
      if(!next.length){states=[];break}
      // Оставляем только лучшие несколько будущих продолжений.
      next.sort((a,b)=>b.lines-a.lines || freeCells(b.b)-freeCells(a.b));
      states=next.slice(0,8);
    }
    if(states.length){
      states.sort((a,b)=>b.lines-a.lines || freeCells(b.b)-freeCells(a.b));
      const best=states[0];
      totalLines+=best.lines;totalMobility+=mobility(best.b);alive++;
    }
  }
  const result={expectedLines:alive?totalLines/alive:0,expectedMobility:alive?totalMobility/alive:0,alive};
  futureCache.set(cacheKey,result);
  return result;
}

function solve(){
  const selected=slots.map((id,i)=>id?{id,o:slotOri[i],slot:i}:null).filter(Boolean);
  if(selected.length<3){showResult('<strong>Нужно выбрать все три фигуры.</strong><p>Решатель учитывает порядок всех трёх доступных фигур.</p>',false);return}
  $('solve').disabled=true;$('solve').textContent='Считаю…';
  setTimeout(()=>{
    try{
      futureCache.clear();mobilityCache.clear();
      const beamWidth=60;
      let states=[{b:board.map(r=>r.slice()),steps:[],lines:0,earlyLines:0,used:0}];
      for(let depth=0;depth<selected.length;depth++){
        const next=[];
        for(const st of states){
          for(let i=0;i<selected.length;i++){
            if(st.used&(1<<i))continue;
            const item=selected[i],pls=placements(st.b,item.id,item.o);
            for(const pl of pls){
              const cl=clearLines(place(st.b,pl.cells,pl.r,pl.c)),stepLines=cl.total;
              next.push({b:cl.board,steps:st.steps.concat([{...item,r:pl.r,c:pl.c,lines:stepLines}]),lines:st.lines+stepLines,earlyLines:st.earlyLines+stepLines*(selected.length-depth),used:st.used|(1<<i)});
            }
          }
        }
        const unique=new Map();
        for(const st of next){
          const k=searchKey(st.b,st.used),old=unique.get(k);
          if(!old||st.lines>old.lines||(st.lines===old.lines&&st.earlyLines>old.earlyLines))unique.set(k,st);
        }
        states=[...unique.values()].sort((a,b)=>cheapRank(b)-cheapRank(a)).slice(0,beamWidth);
        if(!states.length)break;
      }
      let best=null;
      // Глубокий прогноз считаем только для небольшого числа уже хороших кандидатов.
      // Это защищает браузер от долгого перебора.
      const finalists=states.slice(0,12);
      for(const st of finalists){
        const future=$('futureAware').checked?futureOutlook(st.b):{expectedLines:0,expectedMobility:mobility(st.b),alive:0};
        const w=+$('survivalWeight').value/100;
        const base=finalRank(st);
        // Текущие линии всегда важнее будущего. Будущий прогноз используется
        // для выбора между близкими вариантами, чтобы не загубить хорошее поле.
        const sc=base + future.expectedLines*35000 + future.expectedMobility*(30+40*w);
        if(!best||sc>best.score)best={...st,score:sc,future,finalMobility:mobility(st.b)};
      }
      if(!best){showResult('<strong>Для выбранных фигур сейчас нет допустимой последовательности.</strong>',false);return}
      suggestion={preview:[]};
      best.steps.forEach((s,i)=>ORIENTS[s.id][s.o].cells.forEach(([x,y])=>suggestion.preview.push({r:s.r+y,c:s.c+x,step:i})));
      renderBoard();
      $('bestScore').textContent=`${best.lines} линий`;
      $('resultMoves').textContent=Math.round(best.finalMobility);
      let html='<strong class="good">Последовательность найдена</strong>';
      html+=`<p class="result-summary"><b>${best.lines}</b> линий за текущие 3 хода.`;
      if($('futureAware').checked)html+=` Приблизительный прогноз ещё <b>${best.future.expectedLines.toFixed(1)}</b> линии на следующих 2 ходах в ${best.future.alive}/${FUTURE_SCENARIOS.length} тестовых сценариях.`;
      html+='</p><ol class="move-list">';
      best.steps.forEach((s,i)=>{const pos=String.fromCharCode(65+s.c)+(s.r+1);html+=`<li><span class="step-badge">${i+1}</span> <b>${SHAPES[s.id].name}</b> → ${pos}${s.lines?` <span class="good">+${s.lines} линий</span>`:''}</li>`});
      html+='</ol><p>Линии за текущие фигуры имеют главный приоритет. При близком результате учитывается небольшой прогноз будущих фигур и сохранение свободного пространства. Расчёт ограничен небольшой выборкой сценариев, чтобы не зависать.</p>';
      showResult(html,true);
    }catch(err){console.error(err);showResult('<strong>Ошибка расчёта.</strong><p>Смотри консоль браузера для подробностей.</p>',false)}
    finally{$('solve').disabled=false;$('solve').textContent='Найти лучший ход';saveState();}
  },20);
}
$('solve').onclick=solve;$('clearPieces').onclick=()=>{slots=[null,null,null];slotOri=[0,0,0];renderSlots();updateCounts();saveState()};$('clearAll').onclick=clearAll;$('demoBoard').onclick=demo;$('hideScreenshot').onclick=()=>{$('screenshotPanel').hidden=true};
function clearAll(){board=emptyBoard();boardColors=emptyBoard();slots=[null,null,null];slotOri=[0,0,0];suggestion=null;lastImage=null;$('imageInput').value='';$('imageInput2').value='';$('scanAgain').disabled=true;$('scanAgain2').disabled=true;$('scanStatus').textContent='Готов';renderBoard();renderSlots();showResult('<strong>Поле очищено.</strong><p>Загрузи новый скриншот или заполни его вручную.</p>',true);saveState()}
function setImage(file){if(!file)return;lastImage=file;$('scanAgain').disabled=false;$('scanAgain2').disabled=false;const url=URL.createObjectURL(file);$('screenshotPreview').src=url;$('screenshotPanel').hidden=false;analyzeImage(file)}
$('imageInput').onchange=e=>setImage(e.target.files?.[0]);$('imageInput2').onchange=e=>setImage(e.target.files?.[0]);$('scanAgain').onclick=()=>lastImage&&analyzeImage(lastImage);$('scanAgain2').onclick=()=>lastImage&&analyzeImage(lastImage);
async function analyzeImage(file){$('scanStatus').textContent='Распознаю…';try{const img=await loadImage(file);const rect=findBoardRect(img);board=readBoard(img,rect);const pieces=readPieces(img);slots=[null,null,null];slotOri=[0,0,0];pieces.forEach((p,i)=>{if(i<3&&p){slots[i]=p.id;slotOri[i]=p.o}});suggestion=null;renderBoard();renderSlots();const occupied=board.flat().filter(Boolean).length;const named=pieces.filter(Boolean).length;const confidence=pieces.map(p=>p?.confidence??0);$('scanStatus').textContent=`Готово: ${occupied} клеток, ${named}/3 фигур`;saveState();const confText=confidence.map((v,i)=>`Фигура ${i+1}: ${v?Math.round(v)+'%':'—'}`).join(' · ');showResult(`<strong>Скриншот распознан.</strong><p>Найдено: ${occupied} занятых клеток и ${named} из 3 фигур. ${confText}</p><p>Проверь поле и три фигуры. Если одна определилась неверно — нажми на её слот и выбери нужную фигуру вручную.</p>`,true)}catch(err){console.error(err);$('scanStatus').textContent='Ошибка распознавания';showResult('<strong>Не удалось выполнить распознавание.</strong><p>Попробуй другой скриншот или исправь поле вручную.</p>',false)}}
function loadImage(file){return new Promise((res,rej)=>{const img=new Image();img.onload=()=>{URL.revokeObjectURL(img.src);res(img)};img.onerror=rej;img.src=URL.createObjectURL(file)})}
function pixelData(ctx,x,y,w,h){return ctx.getImageData(Math.max(0,Math.floor(x)),Math.max(0,Math.floor(y)),Math.max(1,Math.floor(w)),Math.max(1,Math.floor(h))).data}
function vivid(R,G,B){const mx=Math.max(R,G,B),mn=Math.min(R,G,B);return mx>105&&(mx-mn)>70}
function findBoardRect(img){const w=img.naturalWidth,h=img.naturalHeight,cv=document.createElement('canvas'),ctx=cv.getContext('2d',{willReadFrequently:true});cv.width=w;cv.height=h;ctx.drawImage(img,0,0);let best=null;for(let y=0;y<Math.min(h*.22,180);y++){let start=-1;for(let x=0;x<w*.7;x++){const d=ctx.getImageData(x,y,1,1).data;const ok=d[0]>=75&&d[0]<=150&&d[1]>=100&&d[1]<=175&&d[2]>=120&&d[2]<=205&&(d[2]-d[0])<100;if(ok&&start<0)start=x;if((!ok||x===Math.floor(w*.7)-1)&&start>=0){const end=ok?x:x-1;if(end-start>250&&(!best||end-start>best.len))best={x:start,y,w:end-start+1,len:end-start+1};start=-1}}}if(best){let x=best.x,y=best.y;let size=best.len;return{x:x+6,y:y+6,w:size-12,h:size-12}}return{x:w*.041,y:h*.035,w:w*.506,h:h*.91}}
function defaultBlockColor(){return '#536b78'}
function rgbToCss(R,G,B){return `rgb(${R}, ${G}, ${B})`}
function colorForPiece(id){const map={square:'#ecec00',line4:'#0879df',L:'#f19b00',Z:'#ed3e3e',J:'#e46ca8',S:'#54ca58',T:'#9a6cf0'};return map[id]||defaultBlockColor()}
function readBoard(img,rect){
  const cv=document.createElement('canvas'),ctx=cv.getContext('2d',{willReadFrequently:true});cv.width=img.naturalWidth;cv.height=img.naturalHeight;ctx.drawImage(img,0,0);
  const out=emptyBoard(),colors=emptyBoard(),cw=rect.w/10,ch=rect.h/10;
  for(let r=0;r<10;r++)for(let c=0;c<10;c++){
    const x=rect.x+c*cw+cw*.10,y=rect.y+r*ch+ch*.10,w=cw*.80,h=ch*.80,d=pixelData(ctx,x,y,w,h);
    let vividN=0,grayN=0,rs=0,gs=0,bs=0,maxSat=0;
    for(let i=0;i<d.length;i+=4){const R=d[i],G=d[i+1],B=d[i+2],mx=Math.max(R,G,B),mn=Math.min(R,G,B),sat=mx-mn;rs+=R;gs+=G;bs+=B;if(vivid(R,G,B)){vividN++;rs+=R;gs+=G;bs+=B;maxSat=Math.max(maxSat,sat)}if(sat<45&&mx>55)grayN++}
    const n=d.length/4,vRatio=vividN/n,gRatio=grayN/n;
    if(vRatio>.075){out[r][c]=1;let rr=0,gg=0,bb=0,count=0;for(let i=0;i<d.length;i+=4){if(vivid(d[i],d[i+1],d[i+2])){rr+=d[i];gg+=d[i+1];bb+=d[i+2];count++}}if(count)colors[r][c]=rgbToCss(Math.round(rr/count),Math.round(gg/count),Math.round(bb/count));}
    else if(gRatio>.025){out[r][c]=2;}
  }
  boardColors=colors;return out
}
function piecePixels(ctx,x,y,w,h){
  const d=pixelData(ctx,x,y,w,h),pts=[];
  for(let j=0;j<h;j++)for(let i=0;i<w;i++){const k=(j*w+i)*4;if(vivid(d[k],d[k+1],d[k+2]))pts.push([i,j,d[k],d[k+1],d[k+2]])}
  return pts;
}
function findVividBounds(pts){
  if(!pts.length)return null;
  let minx=Infinity,miny=Infinity,maxx=-1,maxy=-1;for(const [x,y] of pts){if(x<minx)minx=x;if(y<miny)miny=y;if(x>maxx)maxx=x;if(y>maxy)maxy=y}
  return {x:minx,y:miny,w:maxx-minx+1,h:maxy-miny+1};
}
function matchPiece(ctx,x,y,w,h){
  // Сравниваем не только габариты, но и заполненность каждой ячейки шаблона.
  // Это лучше различает T/L/J/Z/S при разных масштабах интерфейса.
  const candidates=[];
  for(const id of IDS)for(let o=0;o<ORIENTS[id].length;o++){
    const cells=ORIENTS[id][o].cells,W=Math.max(...cells.map(p=>p[0]))+1,H=Math.max(...cells.map(p=>p[1]))+1;
    const sx=w/W,sy=h/H,patchScores=[];let score=0,good=0,bad=0;
    for(let gy=0;gy<H;gy++)for(let gx=0;gx<W;gx++){
      const expected=cells.some(p=>p[0]===gx&&p[1]===gy),cx=x+(gx+.5)*sx,cy=y+(gy+.5)*sy;
      const patch=pixelData(ctx,cx-sx*.34,cy-sy*.34,sx*.68,sy*.68);let hit=0,n=patch.length/4;
      for(let i=0;i<patch.length;i+=4)if(vivid(patch[i],patch[i+1],patch[i+2]))hit++;
      const occ=hit/n;patchScores.push(occ);
      if(expected){score+=Math.min(1,occ*1.15);if(occ>.28)good++;else score-=.55}
      else {score+=(1-occ)*.9;if(occ>.20)bad+=occ}
    }
    const expectedCells=cells.length,coverage=good/expectedCells,noise=bad/Math.max(1,W*H-expectedCells||1);
    const areaRatio=w*h/(W*H*Math.max(1,(w/W)*(h/H)));
    score+=coverage*1.6-noise*1.8;
    candidates.push({id,o,score,coverage,noise,areaRatio});
  }
  candidates.sort((a,b)=>b.score-a.score);const best=candidates[0],second=candidates[1];
  if(!best)return null;
  const margin=Math.max(0,best.score-(second?.score??0));
  const confidence=Math.max(0,Math.min(99,Math.round(best.coverage*72+margin*22-best.noise*18)));
  return confidence>=55?{id:best.id,o:best.o,confidence}:{id:best.id,o:best.o,confidence:Math.max(35,confidence)};
}
function readPieces(img){
  const cv=document.createElement('canvas'),ctx=cv.getContext('2d',{willReadFrequently:true});cv.width=img.naturalWidth;cv.height=img.naturalHeight;ctx.drawImage(img,0,0);const w=img.naturalWidth,h=img.naturalHeight;
  // Основные зоны для текущего интерфейса. Внутри каждой зоны ищем саму цветную фигуру,
  // поэтому небольшие изменения масштаба/отступов интерфейса меньше мешают распознаванию.
  const regions=[{x:.62,y:.045,w:.135,h:.27},{x:.725,y:.045,w:.135,h:.27},{x:.83,y:.045,w:.135,h:.27}];
  return regions.map(q=>{const x=Math.floor(w*q.x),y=Math.floor(h*q.y),rw=Math.floor(w*q.w),rh=Math.floor(h*q.h),pts=piecePixels(ctx,x,y,rw,rh),bounds=findVividBounds(pts);if(!bounds)return null;return matchPiece(ctx,x+bounds.x,y+bounds.y,bounds.w,bounds.h)});
}
function demo(){board=emptyBoard();boardColors=emptyBoard();[[0,0],[1,0],[0,1],[1,1],[0,4],[0,5],[0,6],[0,7],[8,8],[8,9],[9,8],[5,2],[6,2],[7,2],[7,3],[3,8],[4,8],[5,8]].forEach(([r,c])=>board[r][c]=1);board[3][3]=2;board[6][0]=2;board[9][1]=2;board[5][5]=2;slots=['L','square','S'];slotOri=[0,0,0];for(let r=0;r<10;r++)for(let c=0;c<10;c++)if(board[r][c]===1)boardColors[r][c]=defaultBlockColor();suggestion=null;renderBoard();renderSlots();saveState();showResult('<strong>Демо загружено.</strong><p>Теперь нажми «Найти лучший ход».</p>',true)}
function saveState(){
  try{
    localStorage.setItem(STORAGE_KEY,JSON.stringify({version:8,board,boardColors,slots,slotOri,activeSlot,bombAware:$('bombAware')?.checked??true,futureAware:$('futureAware')?.checked??true,survivalWeight:$('survivalWeight')?.value??35}));
  }catch(err){console.warn('Не удалось сохранить состояние',err)}
}
function restoreState(){
  try{
    const raw=localStorage.getItem(STORAGE_KEY);if(!raw)return;
    const s=JSON.parse(raw);if(!s||s.version!==8||!Array.isArray(s.board))return;
    board=s.board;boardColors=Array.isArray(s.boardColors)?s.boardColors:emptyBoard();slots=Array.isArray(s.slots)?s.slots:[null,null,null];slotOri=Array.isArray(s.slotOri)?s.slotOri:[0,0,0];activeSlot=Number.isInteger(s.activeSlot)?s.activeSlot:0;
    if($('bombAware')&&typeof s.bombAware==='boolean')$('bombAware').checked=s.bombAware;
    if($('futureAware')&&typeof s.futureAware==='boolean')$('futureAware').checked=s.futureAware;
    if($('survivalWeight')&&s.survivalWeight!=null)$('survivalWeight').value=s.survivalWeight;
  }catch(err){console.warn('Не удалось восстановить состояние',err)}
}
$('bombAware').onchange=saveState;$('futureAware').onchange=saveState;$('survivalWeight').oninput=()=>{ $('survivalValue').textContent=$('survivalWeight').value; saveState(); };$('survivalValue').textContent=$('survivalWeight').value;
renderPicker();restoreState();renderSlots();renderBoard();

