import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x696666);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const container = document.getElementById('scene-container');
container.appendChild(renderer.domElement);
const touchRegion = document.getElementById('touch-region');
const outerTouchRegion = document.getElementById('outer-touch-region');

const swipeIndicator = document.getElementById('swipe-indicator') || null;



let lastOverlayRect = { left: 0, top: 0, size: 0 };

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 100);

const cubeCenter = new THREE.Vector3(0.5, 8.6, 0.5);
let cameraRadius = 6; 
let cameraAngleY = 0; 
let cameraAngleX = 0;
let cameraSide = 'front';
let cameraPoleOrientation = null;


const maxVerticalAngle = Math.PI / 2 - 0.1; 
const minVerticalAngle = -Math.PI / 2 + 0.1; 

function updateCameraPosition() {
  camera.position.x = cubeCenter.x + Math.cos(cameraAngleY) * Math.cos(cameraAngleX) * cameraRadius;
  camera.position.y = cubeCenter.y + Math.sin(cameraAngleX) * cameraRadius;
  camera.position.z = cubeCenter.z + Math.sin(cameraAngleY) * Math.cos(cameraAngleX) * cameraRadius;
  camera.lookAt(cubeCenter);
}

function updateCameraSide() {
  function mod(a, n) { return ((a % n) + n) % n; }

  const upThreshold = Math.PI / 4; 
  if (cameraAngleX > upThreshold) {
    if (cameraSide !== 'top') {
      cameraSide = 'top';
    }
    const twoPi = Math.PI * 2;
    const normalizedY = mod(cameraAngleY, twoPi); 
    const indexTop = Math.floor((normalizedY + Math.PI / 4) / (Math.PI / 2)) % 4;
    const mapTop = ['front', 'left', 'behind', 'right'];
    cameraPoleOrientation = mapTop[indexTop];
    try {
      
      window.cameraSide = cameraSide;
      window.cameraPoleOrientation = cameraPoleOrientation;
    } catch (e) { }
    return;
  }
  if (cameraAngleX < -upThreshold) {
    if (cameraSide !== 'bottom') {
      cameraSide = 'bottom';
    }
    const twoPi = Math.PI * 2;
    const normalizedY = mod(cameraAngleY, twoPi); 
    const indexBottom = Math.floor((normalizedY + Math.PI / 4) / (Math.PI / 2)) % 4;
    const mapBottom = ['front', 'left', 'behind', 'right'];
    cameraPoleOrientation = mapBottom[indexBottom];
    try {
      
      window.cameraSide = cameraSide;
      window.cameraPoleOrientation = cameraPoleOrientation;
    } catch (e) { }
    return;
  }

  const twoPi = Math.PI * 2;
  const normalizedY = mod(cameraAngleY, twoPi); 
  const index = Math.floor((normalizedY + Math.PI / 4) / (Math.PI / 2)) % 4;
  const map = ['front', 'left', 'behind', 'right'];
  const newSide = map[index];
  if (cameraSide !== newSide) {
    cameraSide = newSide;
  }
  cameraPoleOrientation = null;
  try {
    
    window.cameraSide = cameraSide;
    window.cameraPoleOrientation = cameraPoleOrientation; 
  } catch (e) { }
}
updateCameraSide();

updateCameraPosition();

const groundGeometry = new THREE.CircleGeometry(25, 64);
groundGeometry.rotateX(-Math.PI / 2);

const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x555555, side: THREE.DoubleSide });
const texture = new THREE.TextureLoader().load('public/textures/wood.jpg');
groundMaterial.map = texture;
groundMaterial.needsUpdate = true;

const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
groundMesh.receiveShadow = true;
scene.add(groundMesh);


let tableMesh;
const loaderTable = new GLTFLoader().setPath('public/models/glasstable/');
loaderTable.load('scene.gltf', (gltf) => {
    tableMesh = gltf.scene;

    tableMesh.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    tableMesh.position.set(-10, 0, 10);
    tableMesh.scale.set(0.1, 0.1, 0.1);
    scene.add(tableMesh);
});


const cubes = [];
const positions = [
  [0, 0, 1], [0, 1, 1], [1, 1, 1], [1, 0, 1],
  [0, 0, 0], [0, 1, 0], [1, 1, 0], [1, 0, 0]
];

const cubeSize = 1;

for (let i = 0; i < 8; i++) {
  const boxGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
  const boxMaterials = [
    new THREE.MeshStandardMaterial({ color: 0xff9900 }), // orange
    new THREE.MeshStandardMaterial({ color: 0xff0000 }), // red red
    new THREE.MeshStandardMaterial({ color: 0xffffff }), // white white
    new THREE.MeshStandardMaterial({ color: 0xffff00 }), // yellow
    new THREE.MeshStandardMaterial({ color: 0x0000ff }), // blue blue
    new THREE.MeshStandardMaterial({ color: 0x00ff00 }) // green
  ];

  const cube = new THREE.Mesh(boxGeometry, boxMaterials);
  cube.castShadow = true;
  cube.receiveShadow = true;

  cube.userData.coord = { x: positions[i][0], y: positions[i][1], z: positions[i][2] };
  cube.position.set(
    cube.userData.coord.x * cubeSize,
    cube.userData.coord.y * cubeSize + 8.1,
    cube.userData.coord.z * cubeSize
  );

  const edgesGeometry = new THREE.EdgesGeometry(cube.geometry);
  const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
  const edges = new THREE.LineSegments(edgesGeometry, edgeMaterial);
  cube.add(edges);

  cubes.push(cube);
  scene.add(cube);
}

const cubeGroup = new THREE.Group();
cubes.forEach(cube => {
  scene.remove(cube);
  cubeGroup.add(cube);
});
scene.add(cubeGroup);

let isAnimating = false;

const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
directionalLight.position.set(5, 10, 7.5);
directionalLight.castShadow = true;
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  updateTouchOverlay();
});




function animate() {
  requestAnimationFrame(animate);
  updateTouchOverlay();
  renderer.render(scene, camera);
}
animate();


function worldToScreen(pos, camera) {
  const vector = pos.clone().project(camera);
  const x = (vector.x + 1) / 2 * window.innerWidth;
  const y = (-vector.y + 1) / 2 * window.innerHeight;
  return new THREE.Vector2(x, y);
}

function updateTouchOverlay() {
  const half = cubeSize / 2;
  const minCenter = logicalToWorld({ x: 0, y: 0, z: 0 });
  const maxCenter = logicalToWorld({ x: 1, y: 1, z: 1 });

  const worldCorners = [];
  for (let xi of [-half, half]) {
    for (let yi of [-half, half]) {
      for (let zi of [-half, half]) {
        const base = (xi < 0 || yi < 0 || zi < 0) ? minCenter : maxCenter;
        const wx = (xi < 0) ? minCenter.x + xi : maxCenter.x + xi;
        const wy = (yi < 0) ? minCenter.y + yi : maxCenter.y + yi;
        const wz = (zi < 0) ? minCenter.z + zi : maxCenter.z + zi;
        worldCorners.push(new THREE.Vector3(wx, wy, wz));
      }
    }
  }

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  worldCorners.forEach(c => {
    const s = worldToScreen(c, camera);
    minX = Math.min(minX, s.x);
    minY = Math.min(minY, s.y);
    maxX = Math.max(maxX, s.x);
    maxY = Math.max(maxY, s.y);
  });

  const width = maxX - minX;
  const height = maxY - minY;
  const size = Math.max(width, height);
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  const left = Math.round(centerX - size / 2);
  const top = Math.round(centerY - size / 2);

  lastOverlayRect = { left, top, size };

  const containerRect = renderer.domElement.getBoundingClientRect();
  touchRegion.style.width = size + 'px';
  touchRegion.style.height = size + 'px';
  touchRegion.style.left = (containerRect.left + left) + 'px';
  touchRegion.style.top = (containerRect.top + top) + 'px';
  touchRegion.style.zIndex = 999;
}

let startingX = 0, startingY = 0, startingTime = 0;
touchRegion.addEventListener('touchstart', function (e) {
  startingX = e.touches[0].clientX;
  startingY = e.touches[0].clientY;
  startingTime = Date.now();
});

touchRegion.addEventListener('touchend', function (e) {
  const endX = e.changedTouches[0].clientX;
  const endY = e.changedTouches[0].clientY;
  const dx = endX - startingX;
  const dy = endY - startingY;
  const dTime = Date.now() - startingTime;

  if (dTime > 700) return;

  function pointToQuadrant(x, y) {
    const rect = touchRegion.getBoundingClientRect();
    const relX = x - rect.left;
    const relY = y - rect.top;
    const half = rect.width / 2;
    const col = relX < half ? 0 : 1; // 0: left, 1: right
    const row = relY < half ? 0 : 1; // 0: top, 1: bottom
    return { row, col };
  }

  const startQ = pointToQuadrant(startingX, startingY);
  const endQ = pointToQuadrant(endX, endY);

  if (startQ.row === 0 && endQ.row === 0 && startQ.col !== endQ.col) {
    if (startQ.col === 1 && endQ.col === 0) {
      if (cameraSide === 'front' || cameraSide === 'behind' || cameraSide === 'right' || cameraSide === 'left') {
        rotateFace({ axis: 'y', value: 1 }, 'y', -1);
      }else if (cameraSide === 'top') {
        if (cameraPoleOrientation === 'front') {
          rotateFace({ axis: 'x', value: 0 }, 'x', 1);
        } else if (cameraPoleOrientation === 'left') {
          rotateFace({ axis: 'z', value: 0 }, 'z', 1);
        } else if (cameraPoleOrientation === 'behind') {
          rotateFace({ axis: 'x', value: 1 }, 'x', -1);
        } else if (cameraPoleOrientation === 'right') {
          rotateFace({ axis: 'z', value: 1 }, 'z', -1);
        }
      } else if (cameraSide === 'bottom') {
        if (cameraPoleOrientation === 'front') {
                    rotateFace({ axis: 'x', value: 1 }, 'x', -1);
        } else if (cameraPoleOrientation === 'left') {
                    rotateFace({ axis: 'z', value: 1 }, 'z', -1);
        } else if (cameraPoleOrientation === 'behind') {
                    rotateFace({ axis: 'x', value: 0 }, 'x', 1);
        } else if (cameraPoleOrientation === 'right') {
                    rotateFace({ axis: 'z', value: 0 }, 'z', 1);
        }
      }
    } else if (startQ.col === 0 && endQ.col === 1) {
      if (cameraSide === 'front' || cameraSide === 'behind' || cameraSide === 'right' || cameraSide === 'left') {
        rotateFace({ axis: 'y', value: 1 }, 'y', 1);
      } else if (cameraSide === 'top') {
        if (cameraPoleOrientation === 'front') {
          rotateFace({ axis: 'x', value: 0 }, 'x', -1);
        } else if (cameraPoleOrientation === 'left') {
          rotateFace({ axis: 'z', value: 0 }, 'z', -1);
        } else if (cameraPoleOrientation === 'behind') {
          rotateFace({ axis: 'x', value: 1 }, 'x', 1);
        } else if (cameraPoleOrientation === 'right') {
          rotateFace({ axis: 'z', value: 1 }, 'z', 1);
        }
      } else if (cameraSide === 'bottom') {
        if (cameraPoleOrientation === 'front') {
                    rotateFace({ axis: 'x', value: 1 }, 'x', 1);
        } else if (cameraPoleOrientation === 'left') {
                    rotateFace({ axis: 'z', value: 1 }, 'z', 1);
        } else if (cameraPoleOrientation === 'behind') {
                    rotateFace({ axis: 'x', value: 0 }, 'x', -1);
        } else if (cameraPoleOrientation === 'right') {
                    rotateFace({ axis: 'z', value: 0 }, 'z', -1);
        }
      }
    }
    return;
  }

  if (startQ.row === 1 && endQ.row === 1 && startQ.col !== endQ.col) {
    if (startQ.col === 1 && endQ.col === 0) {
      if (cameraSide === 'front' || cameraSide === 'behind' || cameraSide === 'right' || cameraSide === 'left') {
        rotateFace({ axis: 'y', value: 0 }, 'y', -1);
      } else if (cameraSide === 'top') {
        if (cameraPoleOrientation === 'front') {
          rotateFace({ axis: 'x', value: 1 }, 'x', 1);
        } else if (cameraPoleOrientation === 'left') {
          rotateFace({ axis: 'z', value: 1 }, 'z', 1);
        } else if (cameraPoleOrientation === 'behind') {
          rotateFace({ axis: 'x', value: 0 }, 'x', -1);
        } else if (cameraPoleOrientation === 'right') {
          rotateFace({ axis: 'z', value: 0 }, 'z', -1);
        }
      } else if (cameraSide === 'bottom') {
        if (cameraPoleOrientation === 'front') {
                    rotateFace({ axis: 'x', value: 0 }, 'x', -1);
        } else if (cameraPoleOrientation === 'left') {
                    rotateFace({ axis: 'z', value: 0 }, 'z', -1);
        } else if (cameraPoleOrientation === 'behind') {
                    rotateFace({ axis: 'x', value: 1 }, 'x', 1);
        } else if (cameraPoleOrientation === 'right') {
                    rotateFace({ axis: 'z', value: 1 }, 'z', 1);
        }
      }

    } else if (startQ.col === 0 && endQ.col === 1) {
      if (cameraSide === 'front' || cameraSide === 'behind' || cameraSide === 'right' || cameraSide === 'left') {
        rotateFace({ axis: 'y', value: 0 }, 'y', 1);
      } else if (cameraSide === 'top') {
        if (cameraPoleOrientation === 'front') {
          rotateFace({ axis: 'x', value: 1 }, 'x', -1);
        } else if (cameraPoleOrientation === 'left') {
          rotateFace({ axis: 'z', value: 1 }, 'z', -1);
        } else if (cameraPoleOrientation === 'behind') {
          rotateFace({ axis: 'x', value: 0 }, 'x', 1);
        } else if (cameraPoleOrientation === 'right') {
          rotateFace({ axis: 'z', value: 0 }, 'z', 1);
        }
      } else if (cameraSide === 'bottom') {
        if (cameraPoleOrientation === 'front') {
                    rotateFace({ axis: 'x', value: 0 }, 'x', 1);
        } else if (cameraPoleOrientation === 'left') {
                    rotateFace({ axis: 'z', value: 0 }, 'z', 1);
        } else if (cameraPoleOrientation === 'behind') {
                    rotateFace({ axis: 'x', value: 1 }, 'x', -1);
        } else if (cameraPoleOrientation === 'right') {
                    rotateFace({ axis: 'z', value: 1 }, 'z', -1);
        }
      }

    }
    return;
  }

  if (startQ.col === 1 && endQ.col === 1 && startQ.row !== endQ.row) {
    if (startQ.row === 1 && endQ.row === 0) {
      if (cameraSide === 'front') {
        rotateFace({ axis: 'z', value: 0 }, 'z', 1);
      } else if (cameraSide === 'left') {
        rotateFace({ axis: 'x', value: 1 }, 'x', -1);
      } else if (cameraSide === 'behind') {
        rotateFace({ axis: 'z', value: 1 }, 'z', -1);
      } else if (cameraSide === 'right') {
        rotateFace({ axis: 'x', value: 0 }, 'x', 1);
      } else if (cameraSide === 'top') {
        if (cameraPoleOrientation === 'front') {
          rotateFace({ axis: 'z', value: 0 }, 'z', 1);
        } else if (cameraPoleOrientation === 'left') {
          rotateFace({ axis: 'x', value: 1 }, 'x', -1);
        } else if (cameraPoleOrientation === 'behind') {
          rotateFace({ axis: 'z', value: 1 }, 'z', -1);
        } else if (cameraPoleOrientation === 'right') {
          rotateFace({ axis: 'x', value: 0 }, 'x', 1);
        }
      } else if (cameraSide === 'bottom') {
        if (cameraPoleOrientation === 'front') {
          rotateFace({ axis: 'z', value: 0 }, 'z', 1);
        } else if (cameraPoleOrientation === 'left') {
          rotateFace({ axis: 'x', value: 1 }, 'x', -1);
        } else if (cameraPoleOrientation === 'behind') {
          rotateFace({ axis: 'z', value: 1 }, 'z', -1);
        } else if (cameraPoleOrientation === 'right') {
          rotateFace({ axis: 'x', value: 0 }, 'x', 1);
        }
      }

    } else if (startQ.row === 0 && endQ.row === 1) {
      if (cameraSide === 'front') {
        rotateFace({ axis: 'z', value: 0 }, 'z', -1);
      } else if (cameraSide === 'left') {
        rotateFace({ axis: 'x', value: 1 }, 'x', 1);
      } else if (cameraSide === 'behind') {
        rotateFace({ axis: 'z', value: 1 }, 'z', 1);
      } else if (cameraSide === 'right') {
        rotateFace({ axis: 'x', value: 0 }, 'x', -1);
      } else if (cameraSide === 'top') {
        if (cameraPoleOrientation === 'front') {
          rotateFace({ axis: 'z', value: 0 }, 'z', -1);
        } else if (cameraPoleOrientation === 'left') {
          rotateFace({ axis: 'x', value: 1 }, 'x', 1);
        } else if (cameraPoleOrientation === 'behind') {
          rotateFace({ axis: 'z', value: 1 }, 'z', 1);
        } else if (cameraPoleOrientation === 'right') {
          rotateFace({ axis: 'x', value: 0 }, 'x', -1);
        }
      } else if (cameraSide === 'bottom') {
        if (cameraPoleOrientation === 'front') {
          rotateFace({ axis: 'z', value: 0 }, 'z', -1);
        } else if (cameraPoleOrientation === 'left') {
          rotateFace({ axis: 'x', value: 1 }, 'x', 1);
        } else if (cameraPoleOrientation === 'behind') {
          rotateFace({ axis: 'z', value: 1 }, 'z', 1);
        } else if (cameraPoleOrientation === 'right') {
          rotateFace({ axis: 'x', value: 0 }, 'x', -1);
        }
      }
    }
    return;
  }

  if (startQ.col === 0 && endQ.col === 0 && startQ.row !== endQ.row) {
    if (startQ.row === 1 && endQ.row === 0) {
      if (cameraSide === 'front') {
        rotateFace({ axis: 'z', value: 1 }, 'z', 1);
      } else if (cameraSide === 'left') {
        rotateFace({ axis: 'x', value: 0 }, 'x', -1);
      } else if (cameraSide === 'behind') {
        rotateFace({ axis: 'z', value: 0 }, 'z', -1);
      } else if (cameraSide === 'right') {
        rotateFace({ axis: 'x', value: 1 }, 'x', 1);
      } else if (cameraSide === 'top') {
        if (cameraPoleOrientation === 'front') {
          rotateFace({ axis: 'z', value: 1 }, 'z', 1);
        } else if (cameraPoleOrientation === 'left') {
          rotateFace({ axis: 'x', value: 0 }, 'x', -1);
        } else if (cameraPoleOrientation === 'behind') {
          rotateFace({ axis: 'z', value: 0 }, 'z', -1);
        } else if (cameraPoleOrientation === 'right') {
          rotateFace({ axis: 'x', value: 1 }, 'x', 1);
        }
      } else if (cameraSide === 'bottom') {
        if (cameraPoleOrientation === 'front') {
          rotateFace({ axis: 'z', value: 1 }, 'z', 1);
        } else if (cameraPoleOrientation === 'left') {
          rotateFace({ axis: 'x', value: 0 }, 'x', -1);
        } else if (cameraPoleOrientation === 'behind') {
          rotateFace({ axis: 'z', value: 0 }, 'z', -1);
        } else if (cameraPoleOrientation === 'right') {
          rotateFace({ axis: 'x', value: 1 }, 'x', 1);
        }
      }
    } else if (startQ.row === 0 && endQ.row === 1) {
      if (cameraSide === 'front') {
        rotateFace({ axis: 'z', value: 1 }, 'z', -1);
      } else if (cameraSide === 'left') {
        rotateFace({ axis: 'x', value: 0 }, 'x', 1);
      } else if (cameraSide === 'behind') {
        rotateFace({ axis: 'z', value: 0 }, 'z', 1);
      } else if (cameraSide === 'right') {
        rotateFace({ axis: 'x', value: 1 }, 'x', -1);
      } else if (cameraSide === 'top') {
        if (cameraPoleOrientation === 'front') {
          rotateFace({ axis: 'z', value: 1 }, 'z', -1);
        } else if (cameraPoleOrientation === 'left') {
          rotateFace({ axis: 'x', value: 0 }, 'x', 1);
        } else if (cameraPoleOrientation === 'behind') {
          rotateFace({ axis: 'z', value: 0 }, 'z', 1);
        } else if (cameraPoleOrientation === 'right') {
          rotateFace({ axis: 'x', value: 1 }, 'x', -1);
        }
      } else if (cameraSide === 'bottom') {
        if (cameraPoleOrientation === 'front') {
          rotateFace({ axis: 'z', value: 1 }, 'z', -1);
        } else if (cameraPoleOrientation === 'left') {
          rotateFace({ axis: 'x', value: 0 }, 'x', 1);
        } else if (cameraPoleOrientation === 'behind') {
          rotateFace({ axis: 'z', value: 0 }, 'z', 1);
        } else if (cameraPoleOrientation === 'right') {
          rotateFace({ axis: 'x', value: 1 }, 'x', -1);
        }
      }
    }
    return;
  }

});

window.addEventListener('resize', () => {
  updateTouchOverlay();
});

let outerStartX = 0, outerStartY = 0, outerStartTime = 0;
let cameraIsMoving = false;

function animateCameraTo(targetAngleY, targetAngleX, duration = 500) {
  if (cameraIsMoving) return;
  cameraIsMoving = true;

  const startY = cameraAngleY;
  const startX = cameraAngleX;

  const animProps = { y: startY, x: startX };

  anime({
    targets: animProps,
    y: targetAngleY,
    x: targetAngleX,
    duration: duration,
    easing: 'easeOutQuad',
    update: () => {
      cameraAngleY = animProps.y;
      cameraAngleX = animProps.x;
      updateCameraPosition();
      updateCameraSide();
    },
    complete: () => {
      cameraIsMoving = false;
      updateCameraSide();
    }
  });
}



if (outerTouchRegion) {
  outerTouchRegion.addEventListener('touchstart', e => {
    outerStartX = e.touches[0].clientX;
    outerStartY = e.touches[0].clientY;
    outerStartTime = Date.now();
  });


  outerTouchRegion.addEventListener('touchend', e => {
    const ex = e.changedTouches[0].clientX;
    const ey = e.changedTouches[0].clientY;
    const dx = ex - outerStartX;
    const dy = ey - outerStartY;
    const dt = Date.now() - outerStartTime;
    if (dt > 700) return;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const threshold = 30;
    if (absX > absY && absX > threshold) {
      if (dx > 0) {
        const targetY = cameraAngleY + Math.PI / 2;
        animateCameraTo(targetY, cameraAngleX);
      } else {
        const targetY = cameraAngleY - Math.PI / 2;
        animateCameraTo(targetY, cameraAngleX);
      }
      } else if (absY > absX && absY > threshold) {
        if (dy < 0) {
          if (swipeIndicator) swipeIndicator.innerText = 'camera: rotate down to see bottom';
          const targetX = Math.max(minVerticalAngle, cameraAngleX - Math.PI / 2);
          animateCameraTo(cameraAngleY, targetX);
        } else {
          if (swipeIndicator) swipeIndicator.innerText = 'camera: rotate up to see top';
          const targetX = Math.min(maxVerticalAngle, cameraAngleX + Math.PI / 2);
          animateCameraTo(cameraAngleY, targetX);
        }
    }
  });
}

function logicalToWorld({ x, y, z }) {
  return new THREE.Vector3(x * cubeSize, y * cubeSize + 8.1, z * cubeSize);
}



function rotateCoord90Dir(coord, axis, dir) {
  const cx = coord.x - 0.5;
  const cy = coord.y - 0.5;
  const cz = coord.z - 0.5;

  let nx = cx, ny = cy, nz = cz;

  if (axis === 'x') {
    if (dir === 1) {
      ny = -cz;
      nz = cy;
    } else {
      ny = cz;
      nz = -cy;
    }
  } else if (axis === 'y') {
    if (dir === 1) {
      nx = cz;
      nz = -cx;
    } else {
      nx = -cz;
      nz = cx;
    }
  } else if (axis === 'z') {
    if (dir === 1) {
      nx = -cy;
      ny = cx;
    } else {
      nx = cy;
      ny = -cx;
    }
  }

  return {
    x: Math.round(nx + 0.5),
    y: Math.round(ny + 0.5),
    z: Math.round(nz + 0.5)
  };
}



function axisVector(axis) {
  if (axis === 'x') return new THREE.Vector3(1, 0, 0);
  if (axis === 'y') return new THREE.Vector3(0, 1, 0);
  return new THREE.Vector3(0, 0, 1);
}

function rotateFace(faceSelector, axis, direction = 1) {
  if (isAnimating) return Promise.resolve();
  isAnimating = true;

  const faceCubes = cubes.filter(c => c.userData.coord[faceSelector.axis] === faceSelector.value);

  faceCubes.forEach(c => {
    c.userData.coord = rotateCoord90Dir(c.userData.coord, axis, direction);
  });

  const group = new THREE.Group();

  const centerLogical = { x: 0.5, y: 0.5, z: 0.5 };
  centerLogical[faceSelector.axis] = faceSelector.value;
  const centerWorld = logicalToWorld(centerLogical);

  faceCubes.forEach(c => {
    cubeGroup.remove(c);
    c.position.sub(centerWorld);
    group.add(c);
  });

  group.position.copy(centerWorld);
  scene.add(group);

  const angle = Math.PI / 2 * direction; 
  const rotAxis = axisVector(axis);

  const initialRotation = { x: 0, y: 0, z: 0 };

  return new Promise(resolve => {
    anime({
      targets: initialRotation,
      [axis]: angle,
      duration: 500,
      easing: 'easeOutQuad',
      update: () => {
        group.rotation.set(initialRotation.x, initialRotation.y, initialRotation.z);
      },
      complete: () => {
        faceCubes.forEach(c => {
          const worldPos = new THREE.Vector3();
          const worldQuat = new THREE.Quaternion();

          c.getWorldPosition(worldPos);
          c.getWorldQuaternion(worldQuat);

          group.remove(c);
          cubeGroup.add(c);

          c.position.copy(worldPos);
          c.quaternion.copy(worldQuat);

          const newWorldPos = logicalToWorld(c.userData.coord);
          c.position.copy(newWorldPos);
        });

        scene.remove(group);
        isAnimating = false;
        resolve();
      }
    });
  });
}
const randomRotateButton = document.getElementById('random-rotate-btn') || null;

function getRandomFaceRotation() {
  const axes = ['x', 'y', 'z'];
  const axis = axes[Math.floor(Math.random() * axes.length)];
  const value = Math.random() < 0.5 ? 0 : 1;
  const dir = Math.random() < 0.5 ? 1 : -1;
  return { faceSelector: { axis, value }, axis, dir };
}

async function runRandomSequence() {
  const count = 15 + Math.floor(Math.random() * 16); 
  randomRotateButton.disabled = true;
  for (let i = 0; i < count; i++) {
    const { faceSelector, axis, dir } = getRandomFaceRotation();

    try {
      await rotateFace(faceSelector, axis, dir);
    } catch (e) {
    }
    await new Promise(r => setTimeout(r, 100));
  }
  randomRotateButton.disabled = false;
}

randomRotateButton.addEventListener('click', () => {
  if (randomRotateButton.disabled) return;
  runRandomSequence();
});

