/* Arma index.html a partir de src/: node src/build.js */
const fs=require('fs');const d=__dirname;
const core=fs.readFileSync(d+'/core.js','utf8').replace(/\nif\(typeof module[^\n]*\n?$/,'\n');
const logo=fs.readFileSync(d+'/logo_160_jpg.b64','utf8').replace(/\s+/g,'');
const app=['helpers','engine','scenes','content','game','equations','ui'].map(f=>fs.readFileSync(`${d}/${f}.js`,'utf8')).join('\n');
let h=fs.readFileSync(d+'/page.html','utf8');
h=h.split('@@LOGO@@').join(logo).replace('@@CORE@@',()=>core).replace('@@APP@@',()=>app);
fs.writeFileSync(d+'/../index.html',h);console.log('index.html',h.length,'bytes');
new Function(app);console.log('syntax ok');
