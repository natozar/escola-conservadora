const SK = 'escola_v2';

function def(){return{name:'Aluno',avatar:null,xp:0,lvl:1,streak:0,streakDays:[],last:null,done:{},quiz:{},cMod:null,cLes:null}}

function load(){try{const d=localStorage.getItem(SK);return d?{...def(),...JSON.parse(d)}:def()}catch(e){return def()}}

function save(){try{localStorage.setItem(SK,JSON.stringify(window.S))}catch(e){console.warn('[save] storage error:',e.message)}if(typeof window.queueSync==='function')window.queueSync('progress',window.S)}

// Initialize state
let S = load();
window.S = S;
window.SK = SK;
window.def = def;
window.load = load;
window.save = save;

export { S, SK, def, load, save };
