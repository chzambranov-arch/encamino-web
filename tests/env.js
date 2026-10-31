// Test environment: optional local three.js (THREE_JS) and local copies of the Google Fonts (FONTS_DIR, fontsource packages).
const fs=require("fs"),path=require("path");
const FAM=[["Bricolage Grotesque","fontsource-variable-bricolage-grotesque","bricolage-grotesque-latin-wght-normal.woff2","normal","500 800"],
 ["DM Sans","fontsource-variable-dm-sans","dm-sans-latin-wght-normal.woff2","normal","400 700"],
 ["Fraunces","fontsource-variable-fraunces","fraunces-latin-wght-normal.woff2","normal","400 700"],
 ["Fraunces","fontsource-variable-fraunces","fraunces-latin-wght-italic.woff2","italic","400 700"],
 ["IBM Plex Mono","fontsource-ibm-plex-mono","ibm-plex-mono-latin-500-normal.woff2","normal","500"],
 ["IBM Plex Mono","fontsource-ibm-plex-mono","ibm-plex-mono-latin-600-normal.woff2","normal","600"]];
function find(dir,pkg,file){const d=fs.readdirSync(dir).find(x=>x.startsWith(pkg)&&!x.endsWith(".tgz"));return d&&path.join(dir,d,"package","files",file)}
module.exports=async function(page){
 if(process.env.THREE_JS)await page.route("**/cdn.jsdelivr.net/npm/three@0.149.0/build/three.min.js",r=>r.fulfill({path:process.env.THREE_JS,contentType:"application/javascript"}));
 const FD=process.env.FONTS_DIR;
 if(FD){const css=FAM.map((f,i)=>`@font-face{font-family:"${f[0]}";font-style:${f[3]};font-weight:${f[4]};font-display:block;src:url(https://fonts.gstatic.com/__local/${i}.woff2) format("woff2")}`).join("\n");
  await page.route("https://fonts.googleapis.com/**",r=>r.fulfill({body:css,contentType:"text/css"}));
  await page.route("https://fonts.gstatic.com/__local/**",r=>{const i=+r.request().url().split("/").pop().split(".")[0];r.fulfill({path:find(FD,FAM[i][1],FAM[i][2]),contentType:"font/woff2"})})}
 else await page.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());
};
