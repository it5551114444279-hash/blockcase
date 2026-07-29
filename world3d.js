(()=>{
  if(!window.THREE)return;
  const canvas=document.getElementById("world3d"),host=canvas.parentElement;
  const scene=new THREE.Scene();
  scene.background=new THREE.Color(0x55c8f5);
  scene.fog=new THREE.Fog(0x8bdbf7,18,38);
  const camera=new THREE.PerspectiveCamera(36,1,.1,100);
  camera.position.set(0,5.8,17);camera.lookAt(0,2,0);
  const renderer=new THREE.WebGLRenderer({canvas,antialias:false,powerPreference:"high-performance"});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputEncoding=THREE.sRGBEncoding;

  function texture(base,light,dark){
    const c=document.createElement("canvas");c.width=c.height=32;const x=c.getContext("2d");
    x.fillStyle=base;x.fillRect(0,0,32,32);
    for(let i=0;i<80;i++){x.fillStyle=Math.random()>.5?light:dark;const s=[2,3,4][Math.floor(Math.random()*3)];x.fillRect(Math.floor(Math.random()*16)*2,Math.floor(Math.random()*16)*2,s,s)}
    const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;return t;
  }
  const tex={
    grass:texture("#63a92f","#7bc13a","#478323"),dirt:texture("#79502b","#93643a","#5d3c22"),
    stone:texture("#555e62","#6a7478","#3d4549"),wood:texture("#6d3e18","#8a5122","#4c2d12"),
    leaves:texture("#27812c","#3b9c36","#176421"),gold:texture("#ff9700","#ffd338","#d96b00")
  };
  const mat=(map,color=0xffffff,extra={})=>new THREE.MeshLambertMaterial({map,color,...extra});
  const M={grass:mat(tex.grass),dirt:mat(tex.dirt),stone:mat(tex.stone),wood:mat(tex.wood),leaves:mat(tex.leaves),gold:mat(tex.gold)};
  function box(name,size,pos,material,group=scene){
    const m=new THREE.Mesh(new THREE.BoxGeometry(...size),material);m.name=name;m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;group.add(m);return m;
  }
  function grassBlock(name,size,pos,group=scene){
    const mats=[M.dirt,M.dirt,M.grass,M.dirt,M.dirt,M.dirt];
    const m=box(name,size,pos,mats,group);return m;
  }
  // Main floating lobby island, built from actual voxel blocks.
  grassBlock("main-island",[15,.65,10],[0,-.75,0]);
  box("island-dirt",[15,1.35,10],[0,-1.75,0],M.dirt);
  for(let x=-6;x<=6;x+=2)for(let z=-3.5;z<=3.5;z+=2)if((x+z)%3<1)box("ground-detail",[1.8,.08,1.8],[x,-.39,z],M.grass);
  // Central podium.
  box("podium-base",[4.5,.55,2.8],[0,-.18,.25],M.stone);
  grassBlock("podium-grass",[3.8,.55,2.25],[0,.34,.1]);
  // Tree on the left.
  const tree=new THREE.Group();tree.position.set(-4.8,0,-.25);scene.add(tree);
  box("trunk",[1.25,5.4,1.25],[0,2.2,0],M.wood,tree);
  const leafMeshes=[];
  [[0,5,0],[1.1,4.75,0],[-1.1,4.8,.1],[0,5.8,.2],[.35,4.9,1],[-.5,5,-1]].forEach((p,i)=>leafMeshes.push(box("leaves",[2.5,1.4,2.3],p,M.leaves,tree)));
  // Working chest with animated lid.
  const chest=new THREE.Group();chest.position.set(-3.7,.05,2.2);scene.add(chest);
  box("chest-base",[2.2,1.25,1.45],[0,.62,0],M.wood,chest);
  const lidPivot=new THREE.Group();lidPivot.position.set(0,1.28,-.68);chest.add(lidPivot);
  box("chest-lid",[2.2,.55,1.45],[0,.22,.68],M.wood,lidPivot);
  box("chest-lock",[.32,.55,.12],[0,.78,.77],new THREE.MeshLambertMaterial({color:0xcbd6df}),chest);
  // Torch with emissive flame and real light.
  const torch=new THREE.Group();torch.position.set(-2.55,.02,1.05);scene.add(torch);
  box("torch-stick",[.18,1.2,.18],[0,.6,0],M.wood,torch);
  const flame=box("flame",[.38,.55,.38],[0,1.42,0],new THREE.MeshLambertMaterial({color:0xffb000,emissive:0xff6200,emissiveIntensity:1.7}),torch);
  const torchLight=new THREE.PointLight(0xff8b22,2.6,7);torchLight.position.set(-2.55,1.7,1.05);scene.add(torchLight);
  // Glowing ore stack on the right.
  const ores=new THREE.Group();ores.position.set(4.25,-.05,.6);scene.add(ores);
  [[0,.7,0,1.7],[1.35,1.25,.1,2.8],[2.5,.9,.2,2.1]].forEach((o,i)=>{
    const g=new THREE.Group();g.position.set(o[0],o[1],o[2]);ores.add(g);box("ore",[1.45,o[3],1.45],[0,0,0],M.stone,g);
    [[-.35,.3,.73],[.3,-.25,.73],[.73,.4,.1],[-.73,-.4,-.2]].forEach(p=>box("gold-vein",[.26,.3,.08],p,new THREE.MeshLambertMaterial({color:0xffa000,emissive:0xff7200,emissiveIntensity:.75}),g));
  });
  // Floating block islands behind the player.
  function island(x,y,z,scale){
    const g=new THREE.Group();g.position.set(x,y,z);g.scale.setScalar(scale);scene.add(g);
    grassBlock("floating-grass",[4,.55,3],[0,0,0],g);box("floating-dirt",[3.4,.9,2.5],[0,-.7,0],M.dirt,g);
    box("floating-tip",[2.3,.8,1.8],[0,-1.55,0],M.dirt,g);box("floating-tip",[1.1,.7,.9],[0,-2.25,0],M.stone,g);
  }
  island(-5.6,4.2,-8,.8);island(5.1,4.4,-9,.9);island(0,3.8,-12,.65);
  // Player, made of independent 3D blocks and anchored to the podium.
  const player=new THREE.Group();player.position.set(0,.65,.15);scene.add(player);
  const skin=new THREE.MeshLambertMaterial({color:0xb96f52}),shirt=new THREE.MeshLambertMaterial({color:0x16a7aa}),pants=new THREE.MeshLambertMaterial({color:0x37349b}),hair=new THREE.MeshLambertMaterial({color:0x352216});
  const torso=box("player-torso",[1.55,2.1,.78],[0,3.05,0],shirt,player);
  const head=box("player-head",[1.35,1.35,1.35],[0,4.82,0],skin,player);
  box("hair",[1.39,.36,1.39],[0,5.34,0],hair,player);
  box("hair-back",[1.39,1.05,.18],[0,4.88,-.69],hair,player);
  const eyeMat=new THREE.MeshBasicMaterial({color:0xf5f5f5});
  box("eye",[.28,.17,.05],[-.31,4.92,.69],eyeMat,player);box("eye",[.28,.17,.05],[.31,4.92,.69],eyeMat,player);
  box("pupil",[.1,.13,.04],[-.24,4.92,.73],new THREE.MeshBasicMaterial({color:0x315ea8}),player);box("pupil",[.1,.13,.04],[.38,4.92,.73],new THREE.MeshBasicMaterial({color:0x315ea8}),player);
  box("mouth",[.42,.14,.05],[0,4.55,.69],new THREE.MeshBasicMaterial({color:0x632d24}),player);
  const armL=new THREE.Group(),armR=new THREE.Group();armL.position.set(-1.05,3.75,0);armR.position.set(1.05,3.75,0);player.add(armL,armR);
  box("arm",[.52,2.2,.62],[0,-.85,0],skin,armL);box("sleeve",[.56,.7,.66],[0,.0,0],shirt,armL);
  box("arm",[.52,2.2,.62],[0,-.85,0],skin,armR);box("sleeve",[.56,.7,.66],[0,.0,0],shirt,armR);
  const legL=new THREE.Group(),legR=new THREE.Group();legL.position.set(-.4,2,0);legR.position.set(.4,2,0);player.add(legL,legR);
  box("leg",[.72,2.2,.75],[0,-.9,0],pants,legL);box("boot",[.74,.35,.82],[0,-1.85,.05],M.stone,legL);
  box("leg",[.72,2.2,.75],[0,-.9,0],pants,legR);box("boot",[.74,.35,.82],[0,-1.85,.05],M.stone,legR);
  // Pixel clouds.
  const cloudMat=new THREE.MeshLambertMaterial({color:0xffffff,transparent:true,opacity:.88});
  [[-6,7,-7],[5,7.5,-10]].forEach((p,n)=>{const g=new THREE.Group();g.position.set(...p);scene.add(g);box("cloud",[3,.6,.8],[0,0,0],cloudMat,g);box("cloud",[1.5,.6,.8],[-1,0.55,0],cloudMat,g);box("cloud",[1.8,.6,.8],[1,.35,0],cloudMat,g);g.userData.speed=.0015+n*.0005});
  // Lighting and shadows.
  scene.add(new THREE.HemisphereLight(0xbfeaff,0x355622,1.25));
  const sun=new THREE.DirectionalLight(0xfff0b8,1.55);sun.position.set(-8,12,8);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-12;sun.shadow.camera.right=12;sun.shadow.camera.top=12;sun.shadow.camera.bottom=-12;scene.add(sun);
  function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
  new ResizeObserver(resize).observe(host);resize();
  window.blockcase3d={player,renderer,scene};
  document.documentElement.classList.add("webgl-ready");
  let last=performance.now();
  function frame(now){
    const t=now*.001,dt=Math.min((now-last)/1000,.05);last=now;
    leafMeshes.forEach((m,i)=>m.rotation.z=Math.sin(t*1.25+i)*.018);
    lidPivot.rotation.x=-Math.max(0,Math.sin(t*.62)-.72)*1.65;
    flame.scale.y=.82+Math.sin(t*17)*.14;flame.rotation.y=t*4;
    torchLight.intensity=2.25+Math.sin(t*13)*.4+Math.sin(t*7)*.25;
    armL.rotation.x=Math.sin(t*1.4)*.09;armR.rotation.x=-Math.sin(t*1.4)*.09;
    head.rotation.y=Math.sin(t*.55)*.08;player.position.y=.65+Math.sin(t*1.6)*.035;
    sun.position.x=Math.sin(t*.09)*10;sun.position.z=Math.cos(t*.09)*9;
    scene.traverse(o=>{if(o.userData.speed){o.position.x+=o.userData.speed*dt*100;if(o.position.x>9)o.position.x=-9}});
    renderer.render(scene,camera);requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame);
  const drag=document.getElementById("characterDrag");let held=false,start=0,base=-.12;
  drag.addEventListener("pointerdown",e=>{held=true;start=e.clientX;base=player.rotation.y;drag.setPointerCapture(e.pointerId)});
  drag.addEventListener("pointermove",e=>{if(held)player.rotation.y=base+(e.clientX-start)*.012});
  drag.addEventListener("pointerup",()=>held=false);drag.addEventListener("pointercancel",()=>held=false);
})();
