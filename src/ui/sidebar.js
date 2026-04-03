// src/ui/sidebar.js — Disciplines as single link, modules in main area

// Cache original dashboard HTML for restore
var _dashOrigHTML=null;

// Build sidebar — just update discipline count
function buildSidebar(){
  var discs=new Set();
  window.M.forEach(function(m){discs.add(m.discipline||'economia')});
  var el=document.getElementById('discSubtitle');
  if(el)el.textContent=discs.size+' disciplinas';
}

// Navigate to Disciplines view — shows all disciplines with module cards in main
function goDiscView(){
  window.hideAllViews();
  window.clearDiscAccent();
  try{history.pushState({view:'disc'},'')}catch(e){}

  var vd=window._origById?window._origById('vDash'):document.getElementById('vDash');
  if(!vd)return;

  // Save original dashboard HTML (first time only)
  if(!_dashOrigHTML)_dashOrigHTML=vd.innerHTML;

  vd.style.display='block';
  vd.classList.add('view-enter');
  setTimeout(function(){vd.classList.remove('view-enter')},350);

  // Group modules by discipline
  var grouped={};var order=[];
  window.M.forEach(function(m,i){
    var disc=m.discipline||'economia';
    if(!grouped[disc]){grouped[disc]=[];order.push(disc)}
    grouped[disc].push({mod:m,idx:i});
  });

  var html='<h2 style="font-size:1.3rem;font-weight:800;margin-bottom:1.25rem">📚 Todas as Disciplinas</h2>';

  order.forEach(function(disc){
    var d=window.DISCIPLINES[disc]||{label:disc,icon:'📚'};
    var mods=grouped[disc];
    var totalL=mods.reduce(function(s,x){return s+x.mod.lessons.length},0);
    var doneL=mods.reduce(function(s,x){return s+x.mod.lessons.filter(function(_,li){return window.S.done[x.idx+'-'+li]}).length},0);
    var pct=totalL?Math.round(doneL/totalL*100):0;

    html+='<div class="disc-header"><span class="disc-icon">'+d.icon+'</span><h2 class="disc-title">'+d.label+'</h2><span style="font-size:.75rem;color:var(--text-muted);margin-left:auto">'+pct+'%</span></div>';

    mods.forEach(function(x){
      var m=x.mod,i=x.idx;
      var done=m.lessons.filter(function(_,li){return window.S.done[i+'-'+li]}).length;
      var p=Math.round(done/m.lessons.length*100);
      var clr=window.getModColor(m.color||'sage');
      var statusCls=p===100?'completed':p>0?'in-progress':'not-started';
      var statusTxt=p===100?'✓ Completo':p>0?done+'/'+m.lessons.length+' aulas':'Comecar';
      html+='<div class="mc" onclick="goMod('+i+')">'
        +'<div class="mc-circle"><div class="mc-ring" style="--ring-pct:'+p+';--ring-color:'+clr+'"></div><div class="mc-ring-inner"></div><span class="mc-circle-icon">'+m.icon+'</span></div>'
        +'<div class="mc-info"><h3>'+m.title+'</h3><p>'+m.desc+'</p><div class="mc-meta">'+m.lessons.length+' aulas · '+p+'%</div></div>'
        +'<div class="mc-status '+statusCls+'">'+statusTxt+'</div></div>';
    });
  });

  vd.innerHTML=html;
  window.setNav('nDisc');
  var mainEl=document.querySelector('.main');
  if(mainEl)mainEl.scrollTop=0;
}

// Restore original dashboard (called by goDash before re-rendering)
function restoreDash(){
  if(!_dashOrigHTML)return;
  var vd=window._origById?window._origById('vDash'):document.getElementById('vDash');
  if(vd)vd.innerHTML=_dashOrigHTML;
}

// Legacy compat
function toggleDiscGroup(){goDiscView()}

window.buildSidebar=buildSidebar;
window.goDiscView=goDiscView;
window.restoreDash=restoreDash;
window.toggleDiscGroup=toggleDiscGroup;
