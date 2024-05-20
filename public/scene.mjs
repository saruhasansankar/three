import * as THREE from '../node_modules/three/build/three.module.js';

import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import { TeapotGeometry } from '../node_modules/three/examples/jsm/geometries/TeapotGeometry.js';

export let camera, scene, renderer;
let effectController;
const teapotSize = 100;
let ambientLight, light;

let tess = -1;
let bBottom;
let bLid;
let bBody;
let bFitLid;
let bNonBlinn;
let shading;
let vertexColors;
let wireMaterial,
    flatMaterial,
    gouraudMaterial,
    phongMaterial,
    texturedMaterial,
    normalMaterial,
    reflectiveMaterial;

let textureCube;

// allocate these just once
const diffuseColor = new THREE.Color();
const specularColor = new THREE.Color();

export function createScene(gui) {
  effectController = gui

  const container = document.createElement('div');
  document.body.appendChild(container);

  const canvasWidth = window.innerWidth;
  const canvasHeight = window.innerHeight;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(canvasWidth, canvasHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.setAnimationLoop(onLoop);
  container.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 20000);
  camera.position.set(35, 0, 360);
  let cameraControls = new OrbitControls(camera, renderer.domElement);

  ambientLight = new THREE.AmbientLight(0x333333); // 0.2
  light = new THREE.DirectionalLight(0xffffff, 1.0);

  window.addEventListener('resize', onWindowResize);

  const loader = new THREE.TextureLoader();

  const textureMap = loader.load('https://threejs.org/examples/textures/uv_grid_opengl.jpg');
  textureMap.wrapS = textureMap.wrapT = THREE.RepeatWrapping;
  textureMap.anisotropy = 16;
  textureMap.encoding = THREE.sRGBEncoding;

  const diffuseMap = loader.load('https://threejs.org/examples/textures/floors/FloorsCheckerboard_S_Diffuse.jpg');
  const normalMap = loader.load('https://threejs.org/examples/textures/floors/FloorsCheckerboard_S_Normal.jpg');

  // REFLECTION MAP
  const path = 'https://threejs.org/examples/textures/cube/pisa/';
  const urls = [
    path + 'px.png',
    path + 'nx.png',
    path + 'py.png',
    path + 'ny.png',
    path + 'pz.png',
    path + 'nz.png',
  ];

  textureCube = new THREE.CubeTextureLoader().load(urls);
  textureCube.encoding = THREE.sRGBEncoding;

  // MATERIALS
  const materialColor = new THREE.Color();
  materialColor.setRGB(1.0, 1.0, 1.0);

  wireMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });

  flatMaterial = new THREE.MeshPhongMaterial({
    color: materialColor,
    specular: 0x000000,
    flatShading: true,
    side: THREE.DoubleSide,
  });

  gouraudMaterial = new THREE.MeshLambertMaterial({ color: materialColor, side: THREE.DoubleSide });

  phongMaterial = new THREE.MeshPhongMaterial({ color: materialColor, side: THREE.DoubleSide });

  texturedMaterial = new THREE.MeshPhongMaterial({
    color: materialColor,
    map: textureMap,
    side: THREE.DoubleSide,
  });

  normalMaterial = new THREE.MeshPhongMaterial({
    color: materialColor,
    map: diffuseMap,
    normalMap: normalMap,
    side: THREE.DoubleSide,
  });

  reflectiveMaterial = new THREE.MeshPhongMaterial({
    color: materialColor,
    envMap: textureCube,
    side: THREE.DoubleSide,
  });

  // scene itself
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xaaaaaa);

  scene.add(ambientLight);
  scene.add(light);

  const teapot = createNewTeapot();

  return { camera, teapot, scene, renderer }
}

// EVENT HANDLERS

function onWindowResize() {
  const canvasWidth = window.innerWidth;
  const canvasHeight = window.innerHeight;

  renderer.setSize(canvasWidth, canvasHeight);

  camera.aspect = canvasWidth / canvasHeight;
  camera.updateProjectionMatrix();
}

function onLoop() {
  // if(!(effectController)) return

  if (
      effectController.newTess !== tess ||
      effectController.bottom !== bBottom ||
      effectController.lid !== bLid ||
      effectController.body !== bBody ||
      effectController.fitLid !== bFitLid ||
      effectController.nonblinn !== bNonBlinn ||
      effectController.newShading !== shading ||
      effectController.vertexColors !== vertexColors
  ) {
    tess = effectController.newTess;
    bBottom = effectController.bottom;
    bLid = effectController.lid;
    bBody = effectController.body;
    bFitLid = effectController.fitLid;
    bNonBlinn = effectController.nonblinn;
    shading = effectController.newShading;
    vertexColors = effectController.vertexColors;
  }

  // We're a bit lazy here. We could check to see if any material attributes changed and update
  // only if they have. But, these calls are cheap enough and this is just a demo.
  phongMaterial.shininess = effectController.shininess;
  texturedMaterial.shininess = effectController.shininess;
  normalMaterial.shininess = effectController.shininess;

  diffuseColor.setHSL(effectController.hue, effectController.saturation, effectController.lightness);
  if (effectController.metallic) {
    // make colors match to give a more metallic look
    specularColor.copy(diffuseColor);
  } else {
    // more of a plastic look
    specularColor.setRGB(1, 1, 1);
  }

  diffuseColor.multiplyScalar(effectController.kd);
  flatMaterial.color.copy(diffuseColor);
  gouraudMaterial.color.copy(diffuseColor);
  phongMaterial.color.copy(diffuseColor);
  texturedMaterial.color.copy(diffuseColor);
  normalMaterial.color.copy(diffuseColor);

  specularColor.multiplyScalar(effectController.ks);
  phongMaterial.specular.copy(specularColor);
  texturedMaterial.specular.copy(specularColor);
  normalMaterial.specular.copy(specularColor);

  // Ambient's actually controlled by the light for this demo
  ambientLight.color.setHSL(
      effectController.hue,
      effectController.saturation,
      effectController.lightness * effectController.ka,
  );

  light.position.set(effectController.lx, effectController.ly, effectController.lz);
  light.color.setHSL(effectController.lhue, effectController.lsaturation, effectController.llightness);

  // skybox is rendered separately, so that it is always behind the teapot.
  if (shading === 'reflective') {
    scene.background = textureCube;
  } else {
    scene.background = null;
  }

  renderer.render(scene, camera);
};

// Whenever the teapot changes, the scene is rebuilt from scratch (not much to it).
function createNewTeapot() {
  const teapotGeometry = new TeapotGeometry(
      teapotSize,
      tess,
      effectController.bottom,
      effectController.lid,
      effectController.body,
      effectController.fitLid,
      !effectController.nonblinn,
  );

  const teapot = new THREE.Mesh(
      teapotGeometry,
      shading === 'wireframe'
          ? wireMaterial
          : shading === 'flat'
              ? flatMaterial
              : shading === 'smooth'
                  ? gouraudMaterial
                  : shading === 'glossy'
                      ? phongMaterial
                      : shading === 'textured'
                          ? texturedMaterial
                          : shading === 'normal'
                              ? normalMaterial
                              : reflectiveMaterial,
  ); // if no match, pick Phong

  if (effectController.vertexColors) {
    teapot.geometry.computeBoundingBox();
    const minY = teapot.geometry.boundingBox.min.y;
    const maxY = teapot.geometry.boundingBox.max.y;
    const sizeY = maxY - minY;

    const colors = [];
    const position = teapot.geometry.getAttribute('position');
    for (let i = 0, l = position.count; i < l; i++) {
      const y = position.getY(i);
      const r = (y - minY) / sizeY;
      const b = 1.0 - r;

      colors.push(r * 128, 0, b * 128);
    }

    teapot.geometry.setAttribute('color', new THREE.Uint8BufferAttribute(colors, 3, true));
    teapot.material.vertexColors = true;
    teapot.material.needsUpdate = true;
  } else {
    teapot.geometry.deleteAttribute('color');
    teapot.material.vertexColors = false;
    teapot.material.needsUpdate = true;
  }

  scene.add(teapot);
  return teapot
}
