import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as TWEEN from "three/examples/jsm/libs/tween.module.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { MeshoptDecoder } from 'meshoptimizer';

const canvas = document.getElementById("webgl");

// ========================= Inisiasi threeJS ====================
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
let renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  powerPreference: "high-performance",
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.antialias = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.6;
renderer.setClearColor(0x000000, 0);
renderer.setPixelRatio(window.devicePixelRatio);


//=============== pencahayaan pakek .hdri ===============
let rt;

const loaderx = new THREE.TextureLoader();
loaderx.load("hdri/background-liminal-hqhan.webp", function (texture) {
  texture.encoding = THREE.sRGBEncoding; 
  texture.colorSpace = THREE.SRGBColorSpace; 
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;

  rt = new THREE.WebGLCubeRenderTarget(texture.image.height/1.8); 
  rt.fromEquirectangularTexture(renderer, texture);

  scene.environment = rt.texture;
  scene.environmentRotation = new THREE.Euler(0,0,0);
  scene.backgroundRotation = new THREE.Euler(0,0,0);
});


//======== draco decoder inisialization ========
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/indehell/decoder/");
dracoLoader.setDecoderConfig({ type: "wasm" });

// ============================ setting start posisi camera & size objek ===============
camera.position.set(0, 0, 30);

let scene2Scale = { x: 0, y: 0, z: 0 };
Object.assign(scene2Scale, window.matchMedia("(min-width: 1024px)").matches
  ? { x: 8, y: 8, z: 8 }
  : { x: 5.6, y: 5.6, z: 5.6 }
);

let scene1Scale = { x: 0, y: 0, z: 0 };
Object.assign(scene1Scale, window.matchMedia("(min-width: 1024px)").matches
  ? { x: 9.5, y: 9.5, z: 9.5 }
  : { x: 7.4, y: 7.4, z: 7.4 }
);


//========== bg particles using shader ================
const particleCount = 280;
const positions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 10; 
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10; 
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

const uniforms = { u_time: { value: 0 } };

const particleMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: `
        uniform float u_time;
        varying float vOpacity;
        
        void main() {
            vec3 newPosition = position;
            newPosition.y += sin(u_time * 4.0 + position.x * 5.0) * 0.2;
            vOpacity = 0.5 + 0.5 * sin(u_time + position.y/(-0.1));
            
            gl_PointSize = 3.0;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
    `,
    fragmentShader: `
        varying float vOpacity;
        
        void main() {
            gl_FragColor = vec4(1.0, 0.0, 0.0, vOpacity);
        }
    `,
    transparent: true
});

const particles = new THREE.Points(geometry, particleMaterial);
particles.scale.set(20,8)
particles.position.set(0,0,-20)
scene.add(particles);


//========================= Scene 1 ======================
let mixer1;

let slide1;
const loader1 = new GLTFLoader();
loader1.setDRACOLoader(dracoLoader);
loader1.load("gltf/scene1DracoV2.glb", function (gltf) {
  slide1 = gltf.scene;
  slide1.position.set(0,0.2,0);
  slide1.rotation.set(0.1,4.9,0)
  slide1.scale.set(scene1Scale.x, scene1Scale.y, scene1Scale.z);

  mixer1 = new THREE.AnimationMixer(slide1);
  if (gltf.animations.length > 0) {
    gltf.animations.forEach((anim) => {
      const action = mixer1.clipAction(anim);
      action.play();
    });
  }

  scene.add(slide1);

},
  undefined,
  function (error) {
    console.error(error);
  }
);


//========================= Scene 2 ======================
const loader2 = new GLTFLoader();
loader2.setMeshoptDecoder(MeshoptDecoder);

let slide2;
let mixer2;
let animateSlide2;
let unanimateSlide2;

loader2.load("gltf/scene2MeshoptV3.glb", function (gltf) {
  slide2 = gltf.scene;
  slide2.position.set(0, 3, 0); 
  slide2.scale.set(scene2Scale.x, scene2Scale.y, scene2Scale.z); 
  slide2.name = "Slide2"; 

  //buat load pertama kali
  slide2.traverse((object) => {
    if (object.isMesh) {
      object.frustumCulled = false;
      object.material.transparent = true;
      object.material.depthWrite = false;
      object.material.opacity = 0;
    }
  });

  scene.add(slide2); 

  mixer2 = new THREE.AnimationMixer(slide2);

  if (gltf.animations.length > 0) {
    const animationsMap = {};
    gltf.animations.forEach(clip => {
      animationsMap[clip.name] = clip;
    });
    const openingBottleAction = mixer2.clipAction(animationsMap["opening botol"]);
    const openingBajuHitamAction = mixer2.clipAction(animationsMap["opening baju hitam"]);
    const openingBajuPutihAction = mixer2.clipAction(animationsMap["opening baju putih"]);

    const iddleBottleAction = mixer2.clipAction(animationsMap["iddle bottle"]);
    const iddleBajuPutihAction = mixer2.clipAction(animationsMap["baju putih iddle"]);
    const iddleBajuHitamAction = mixer2.clipAction(animationsMap["baju hitam iddle"]);

    const clothSimBajuPutih = mixer2.clipAction(animationsMap["Key.001Action"]);
    const clothSimBajuHitam = mixer2.clipAction(animationsMap["Key.002Action"]);

    [openingBottleAction, openingBajuHitamAction, openingBajuPutihAction].forEach(action => {
      action.setLoop(THREE.LoopOnce, 0);
      action.clampWhenFinished = true;
    });

    [iddleBottleAction, iddleBajuPutihAction, iddleBajuHitamAction, clothSimBajuPutih, clothSimBajuHitam].forEach(action => {
      action.setLoop(THREE.LoopRepeat);
    });

    mixer2.addEventListener('finished', function (e) {
      if (e.action === openingBajuPutihAction) {
        iddleBottleAction.play();
        iddleBajuPutihAction.play();
        iddleBajuHitamAction.play();
      }
    });

    animateSlide2 = ()=>{
      slide2.traverse((object) => {
        if (object.isMesh) {
          object.material.transparent = true;
          object.material.opacity = 0;
        }
      });

      slide2.traverse((child) => {
        if (child.isMesh) {
          new TWEEN.Tween(child.material)
            .to({ opacity: 1 }, 1500)
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();
        }
      });

      clothSimBajuHitam.play();
      clothSimBajuPutih.play();
      openingBajuHitamAction.play();
      openingBajuPutihAction.play();
      openingBottleAction.play();
    }

    unanimateSlide2 = () => {
      clothSimBajuHitam.stop();
      clothSimBajuPutih.stop();
      openingBajuHitamAction.stop();
      openingBajuPutihAction.stop();
      openingBottleAction.stop();
      iddleBottleAction.stop();
      iddleBajuPutihAction.stop();
      iddleBajuHitamAction.stop();
    }

  }else{
    console.log("Errorrr")
  }

},
  undefined,
  function (error) {
    console.error(error);
  }
);


//======== mouse controller ======
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2(-2, -2);

function onMouseMove(event) {
  const rect = canvas.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

window.addEventListener("mousemove", onMouseMove, false);

function onTouchMove(event) {
  const rect = canvas.getBoundingClientRect();
  mouse.x = ((event.touches[0].clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.touches[0].clientY - rect.top) / rect.height) * 2 + 1;
}

window.addEventListener("touchmove", onTouchMove, false);


//============ animasi rotasi kamera ============
function updateCameraPosition() {
    let pivot = new THREE.Vector3(0, 0, 0)
    
    let distance = 45;
    const angleX = 1.54 + Math.min(Math.max(mouse.x, -0.18), 0.18) * (Math.PI / 4);
    const angleY = Math.min(Math.max(-mouse.y, -0.15), 0.15) * (Math.PI / 4);

    const newX = pivot.x + distance * Math.cos(angleX);
    const newY = pivot.y + distance * Math.sin(angleY);
    const newZ = pivot.z + distance * Math.sin(angleX);

    new TWEEN.Tween(camera.position)
      .to({ x: newX, y: newY, z: newZ }, 1000)
      .easing(TWEEN.Easing.Quadratic.Out)
      .start();

    camera.lookAt(pivot);
}


//=========== grid latar animasi 3d ==========
const size = 180;  
const divisions = 15;
const color1 = 0x770000;  
const color2 = 0x770000;
const gridHelper = new THREE.GridHelper(size, divisions, color1, color2);
gridHelper.material.depthWrite = false; 
gridHelper.position.y = -8;
scene.add(gridHelper);


//============ cek mouse ada diatas objek =========
function onMouseMoveOnBox() {
  if (isModalShow) return;
  raycaster.setFromCamera(mouse, camera);
  let opacityIsNotZero = () => {
    let found = false;

    slide2.traverse((child) => {
      if (child.isMesh && child.material.opacity === 1) {
        found = true;
      }
    });
    return found;
  };

  let intersects = raycaster.intersectObjects([slide2], true);

  if (intersects.length > 0 && currentSlide === 2 && opacityIsNotZero()) {
    document.body.style.cursor = "pointer";
    let intersectBottle =false;

    slide2.traverse((child) => {
      if (child.isMesh) {
        child.material.color.set(0xfffffff);
      }
    });

    let objek = intersects[0].object;
    if(objek.name === "Plane006_1" || objek.name === "Plane006"){
      intersectBottle = true;
    } else if (objek.name === "Plane003_1") {
      objek.material.color.set(0xff9999);
    } else if (objek.name === "Plane001") {
      objek.material.color.set(0xff9999);
    }

    if (intersectBottle) {
      slide2.traverse((child) => {
        if (child.isMesh && (child.name === "Plane006_1" || child.name === "Plane006")) {
          child.material.color.set(0xff9999);
        }
      });
    }
  }else{
    document.body.style.cursor = "default";
    slide2.traverse((child) => {if (child.isMesh) child.material.color.set(0xfffffff);});
  }
}

//========== modal when klick object ============
let isModalShow = false;
function onMouseClickOnBox(event) {
  if (isAnimating) return;
  raycaster.setFromCamera(mouse, camera);
  let intersects = raycaster.intersectObjects([slide2], true);

  if (intersects.length > 0 && currentSlide === 2) {
    let objek = intersects[0].object;
    let modalTitle = "";
    let modalDescription = "";

    if (objek.name === "Plane006_1" || objek.name === "Plane006") {
      modalTitle = "LIMITED H-FLASK \"TORTURE SERIES\"";
      modalDescription = "Stainless steel pocket bottle with metal engraving custom design.\n\n- Material : Stainless Steel\n- Dimension: 8cm x 9cm\n- Overall height: 9.5cm\n- Wide mouth: 1.2cm\n- Capacity: ±140ml (5oz)";
      slide2.traverse(child => child.isMesh && (child.name === "Plane006_1" || child.name === "Plane006") && child.material.color.set(0xff9999));
    } else if (objek.name === "Plane003_1") {
      modalTitle = "LIMITED TSHIRT \"TORTURE\" UNISEX";
      modalDescription = "Boxy fit, short sleeve tshirt meet a plastisol ink screen.\n\n- Material : cotton 20s";
      objek.material.color.set(0xff9999);
    } else if (objek.name === "Plane001") {
      modalTitle = "LIMITED TSHIRT \"UNDYING\" UNISEX";
      modalDescription = "Reguler custom fit, short sleeve tshirt meet a plastisol ink screen\n\n- Material : cotton 20s";
      objek.material.color.set(0xff9999);
    }

    if (modalTitle && modalDescription && !isModalShow) {
      showModal(modalTitle, modalDescription);
    }
  }
}

document.addEventListener("click", onMouseClickOnBox);

let showTimeout = null;
let hideTimeout = null;

function showModal(title, description) {
  let modal = document.getElementById("modal-text");

  if (modal) {
    modal.querySelector("h1").innerText = title;
    modal.querySelector("p").innerText = description;

    modal.classList.remove("hidden");

    clearTimeout(showTimeout);
    showTimeout = setTimeout(() => {
      modal.classList.remove("opacity-0");
      modal.classList.add("opacity-100", "pointer-events-auto");
    }, 10);

    document.getElementById("close-modal").addEventListener("click", closeModal);
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });

    isAnimating = true;
    isModalShow = true;
  }
}

function closeModal() {
  let modal = document.getElementById("modal-text");

  if (modal) {
    modal.classList.remove("opacity-100", "pointer-events-auto");
    modal.classList.add("opacity-0");

    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(() => {
      modal.classList.add("hidden");
      isModalShow = false;
      isAnimating = false;
      mouse.set(0, -5);
    }, 250);

    document.getElementById("close-modal").removeEventListener("click", closeModal);
    modal.removeEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });
  }
}

//=========== Modal when first time in scene 2 ==========
let isFirstTimeScene2 = true;

function modalFirstTimeToScene2() {
  if (isAnimating) return;
  if(isFirstTimeScene2){
    showModal("Objective", "Touch/Klick the 3D object for product detail !!!");
    isFirstTimeScene2 = false;
  }
}


//============ handle teks transition ========================
let previousSlide = 1;
let activeAnimation = null;
let timeouts = [];

function textSceneShow(currentSlide) {
  return new Promise((resolve) => {
    const scenes = [
      document.getElementById("text-scene-1"),
      document.getElementById("text-scene-2"),
      document.getElementById("text-scene-3"),
    ];

    if (currentSlide === previousSlide) return resolve();

    const oldScene = scenes[previousSlide - 1];
    const newScene = scenes[currentSlide - 1];
    previousSlide = currentSlide;

    if (activeAnimation) {
      activeAnimation();
    }

    timeouts.forEach(clearTimeout);
    timeouts = [];

    oldScene.classList.remove("opacity-100");
    oldScene.classList.add("opacity-0");

    function handleFadeOut() {
      oldScene.classList.add("hidden");
      newScene.classList.remove("hidden");

      requestAnimationFrame(() => {
        newScene.offsetHeight;

        let newTimeout = setTimeout(() => {
          newScene.classList.remove("opacity-0");
          newScene.classList.add("opacity-100");

          resolve("animation done");
          activeAnimation = null;
        }, 10);

        timeouts.push(newTimeout);
      });

      oldScene.removeEventListener("transitionend", handleFadeOut);
    }

    oldScene.addEventListener("transitionend", handleFadeOut, { once: true });

    let safetyTimeout = setTimeout(() => {
      handleFadeOut();
      resolve("animation done");
      activeAnimation = null;
    }, 500);

    timeouts.push(safetyTimeout);

    activeAnimation = () => {
      clearTimeout(safetyTimeout);
      handleFadeOut();
    };
  });
}


//========= deteksi scroll in slide 3 ========
let scrollTopCounter = 0;
const productListContainer = document.getElementById("product-list-container");
let resetTimeout = null;
let isScrolling = false;
let isChecking = false;
let killChecking = false;

productListContainer.addEventListener("scroll", function () {
  console.log("killChecking"+isChecking + "isScrolling :" + isScrolling);
  if (productListContainer.scrollTop > 0) {
    isAnimating = true;
    if (!killChecking) isScrolling = true;
  } else {
    scrollTopCounter++;

    if (scrollTopCounter > 0) {
      if (resetTimeout) {
        clearTimeout(resetTimeout);
      }
      resetTimeout = setTimeout(() => {
        isScrolling = false;
        if (currentSlide === 3 && isAnimating) {
          if (!isChecking) {
            isChecking = true;
            checkStopScrolling().finally(() => {
              isChecking = false;
            });
          }
        } else {
          clearTimeout(resetTimeout);
        }
      }, 100);
    }
  }
});
//kalo udah slide baru kembalikan promise tapi
async function checkStopScrolling() {
  if (!isScrolling && currentSlide === 3) {
    if (!killChecking) isAnimating = false;
    scrollTopCounter = 0;
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}


//======= bg-color change for each slide =======
let bgTimeouts = [];

function updateBackgroundColor() {
  const bgOld = document.getElementById("bg-old");
  const bgNew = document.getElementById("bg-new");

  bgTimeouts.forEach(clearTimeout);
  bgTimeouts = [];

  let newClass = "";
  if (currentSlide === 1) {
    newClass = "bg-gradient-to-bl from-black/90 via-red-950/95 to-black/90";
  } else if (currentSlide === 2) {
    newClass = "bg-gradient-to-t from-black/90 via-red-950/95 to-black/90";
  } else if (currentSlide === 3) {
    newClass = "bg-gradient-to-br from-black/90 via-red-950/95 to-black/90 ";
  }

  bgNew.className = `absolute w-full h-full transition-opacity duration-500 opacity-0 ${newClass}`;

  bgNew.classList.add("opacity-100");
  bgOld.classList.add("opacity-0");

  let newTimeout = setTimeout(() => {
    bgOld.className = bgNew.className;
    bgOld.classList.remove("opacity-0");
    bgNew.classList.remove("opacity-100");
  }, 500);

  bgTimeouts.push(newTimeout);
}


//========= update indicator footer ==============
function updateIndicator() {
  const indicators = document.querySelectorAll("#slide-indicator span");

  indicators.forEach((dot, index) => {
    if (index === currentSlide - 1) {
      dot.classList.add("w-3", "h-3", "bg-white");
      dot.classList.remove("w-2", "h-2", "bg-gray-500");
    } else {
      dot.classList.add("w-2", "h-2", "bg-gray-500");
      dot.classList.remove("w-3", "h-3", "bg-white");
    }
  });
}


//========== handle animation each slide ==========
let currentSlide = 1;
let isAnimating = false;
let lastScrollTime = 0;
let touchStartY = 0;

function setSlide(duration = 1000) {
  if (isAnimating) return;
  isAnimating = true;

  if (currentSlide === 1 && previousSlide===2) {
    textSceneShow(currentSlide);
    updateBackgroundColor();
    if (mixer1) mixer1.setTime(0);
    if (slide2 && slide2.visible) {
      slide2.traverse((child) => {
        if (child.isMesh) {
          child.material.transparent = true;
          new TWEEN.Tween(child.material)
            .to({ opacity: 0 }, 500)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onComplete(() => {
              slide2.visible = false;
              unanimateSlide2();
              // Slide 1 masuk
              if (slide1) {
                slide1.visible = true;
                new TWEEN.Tween(slide1.position)
                  .to({ x: 0, y: 0, z: 0 }, duration)
                  .easing(TWEEN.Easing.Quadratic.Out)
                  .onComplete(() => {
                    isAnimating = false;
                  })
                  .start();
              }
            })
            .start();
        }
      });
    } 


  } else if (currentSlide === 2) {
    updateBackgroundColor();
    if (previousSlide === 3) {
      killChecking = true; //kill scroll slide 3 behavior
      productListContainer.style.overflowY = "hidden"; //hilangin slider

      textSceneShow(currentSlide).then(() => {
        handleSlide2();
      });
    } else if (previousSlide === 1) {
      textSceneShow(currentSlide);
      handleSlide2();
      if (slide1) {
        new TWEEN.Tween(slide1.position)
          .to({ x: 0, y: 50, z: 0 }, duration)
          .easing(TWEEN.Easing.Quadratic.In)
          .onComplete(() => (slide1.visible = false))
          .start();
      }
    }

    function handleSlide2() {
      if (mixer2) {
        mixer2.stopAllAction();
        mixer2.setTime(0);
        if (slide2) {
          slide2.visible = true;
          animateSlide2();
        }
        mixer2.addEventListener("finished", function onFinish(e) {
          mouse.set(0, -5);
          if (e.action.getClip().name === "opening botol") {
            isAnimating = false;
            modalFirstTimeToScene2();
          }
        }, { once: true });
      }
    }


  } else if (currentSlide === 3 && previousSlide === 2) {
    productListContainer.style.overflowY = "auto"; //kasih slide lagi
    textSceneShow(currentSlide).then(() => {
      killChecking = true; //kill scroll slide 3 behavior
      productListContainer.scrollTop = 0;

      updateBackgroundColor();

      if (slide2 && slide2.visible) {
        slide2.traverse((child) => {
          if (child.isMesh) {
            child.material.transparent = true;
            new TWEEN.Tween(child.material)
              .to({ opacity: 0 }, 1000)
              .easing(TWEEN.Easing.Quadratic.Out)
              .onComplete(() => {
                slide2.visible = false;
                unanimateSlide2();
                isAnimating = false;
                killChecking= false; //add scroll slide 3 behavior
              })
              .start();
          }
        });
      }
    })
  }else{
    console.log("eroorrr")
  }
  updateIndicator();

}


//=============== alert handler func ===============
let isAnimatingWarning = false;
let warningTimeout;
let counterToMuchCall = 0;

function alertWhenIsAnimate() {
  if (isScrolling || isModalShow) return; //avoid if scroll scene 3 & ada modal
  if (!isAnimating || isAnimatingWarning) return;
  counterToMuchCall++;

  if (counterToMuchCall < 3) return;

  const warningText = document.getElementById("warning-text");
  if (!warningText) return;

  if (warningText.classList.contains("hidden")) {
    clearTimeout(warningTimeout);
    isAnimatingWarning = true;

    warningText.classList.remove("hidden");
    warningText.classList.remove("opacity-0");
    warningText.classList.add("opacity-100");
    // requestAnimationFrame(() => {
    // });
    function handleTransitionEnd(event) {
      if (event.propertyName !== "opacity") return;

      warningText.classList.add("hidden");
      warningText.removeEventListener("transitionend", handleTransitionEnd);
      isAnimatingWarning = false;
    }

    warningTimeout = setTimeout(() => {
      warningText.classList.remove("opacity-100");
      warningText.classList.add("opacity-0");
      warningText.addEventListener("transitionend", handleTransitionEnd, { once: true });
    }, 500);
  }

  console.log(counterToMuchCall);
}



//======== handle slide move in desktop ========
function scrollSlide(event) {
  const now = Date.now();

  if (now - lastScrollTime < 800 || isAnimating) return;

  lastScrollTime = now;

  if (event.deltaY < 0) {
    if (currentSlide > 1) {
      currentSlide--;
      setSlide();
      counterToMuchCall = 0;
    }
  } else {
    if (currentSlide < 3) {
      currentSlide++;
      setSlide();
      counterToMuchCall = 0;
    }
  }
}

// let scrollcounter=0;
function wheelStopListener(element, callback, timeout) {
  var handle = null;
  var onScroll = function (event) {
    scrollSlide(event);
    if (handle) {
      // console.log("berenti" + scrollcounter)
      clearTimeout(handle);
    }
    handle = setTimeout(callback, timeout || 80);
  };
  element.addEventListener('wheel', onScroll);
  return function () {
    element.removeEventListener('wheel', onScroll);
  };
}

wheelStopListener(document, function () {
  alertWhenIsAnimate();
  // scrollcounter++;
});

//======== handle slide move in mobile ========
let lastSlideTime = 0;
const SLIDE_DELAY = 500;

document.addEventListener("touchstart", (event) => {
  touchStartY = event.touches[0].clientY;
});

document.addEventListener("touchend", (event) => {
  if (isAnimating) alertWhenIsAnimate();

  let touchEndY = event.changedTouches[0].clientY;
  let touchDiff = touchStartY - touchEndY;
  let now = Date.now();

  if (Math.abs(touchDiff) > 50 && !isAnimating && (now - lastSlideTime > SLIDE_DELAY)) {
    lastSlideTime = now;

    if (touchDiff > 0 && currentSlide < 3) {
      currentSlide++;
      setSlide();
      counterToMuchCall = 0;
    } else if (touchDiff < 0 && currentSlide > 1) {
      currentSlide--;
      setSlide();
      counterToMuchCall = 0;
    }
  }
});


//======== animate looping ========
let clock1 = new THREE.Clock();
let clock2 = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  // console.log(isAnimating);
  uniforms.u_time.value += 0.01;

  if (slide2) {
    onMouseMoveOnBox();
  }

  if (mixer1) {
    const delta1 = clock1.getDelta();
    mixer1.update(delta1);
  }
  if(mixer2){
    const delta2 = clock2.getDelta();
    mixer2.update(delta2);
  }

  TWEEN.update();
  updateCameraPosition();

  renderer.render(scene, camera);
}

animate();


//===== screen loader =====
isAnimating = true;
let startTimeout = null;

window.onload = () => {
  currentSlide = 0;

  const loadScreen = document.getElementById("load-screen");
  if (loadScreen) {
    startTimeout = setTimeout(() => {
      loadScreen.classList.add("opacity-0");
      const transitionHandler = () => {
        loadScreen.classList.add("hidden");
        loadScreen.removeEventListener("transitionend", transitionHandler);
        currentSlide = 1;
        isAnimating = false;
      };
      loadScreen.addEventListener("transitionend", transitionHandler);
      loadScreen.dataset.transitionHandler = transitionHandler;
    }, 500);
  }
  window.onbeforeunload = () => {
    if (startTimeout) {
      clearTimeout(startTimeout);
    }
    if (loadScreen && loadScreen.dataset.transitionHandler) {
      loadScreen.removeEventListener("transitionend", loadScreen.dataset.transitionHandler);
    }
  };
};


//========= handle resize screen ===========
function updateSize() {
  let width = window.innerWidth;
  let height = window.innerHeight;

  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

window.addEventListener("resize", updateSize);
