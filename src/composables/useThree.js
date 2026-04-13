import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

export function useThree(containerRef) {
  let scene, camera, renderer, controls;
  let model = null;
  const loading = ref(false);
  const error = ref(null);
  const modelScale = ref(1);
  const modelDimensions = ref({ width: 0, height: 0, depth: 0 });

  const initThree = () => {
    if (!containerRef.value) return;

    // 创建场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c1220);

    // 创建相机
    camera = new THREE.PerspectiveCamera(
      75,
      containerRef.value.clientWidth / containerRef.value.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight);
    containerRef.value.appendChild(renderer.domElement);

    // 添加轨道控制器
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // 添加灯光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // 添加坐标轴辅助
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // 添加网格辅助
    const gridHelper = new THREE.GridHelper(10, 10, 0x555555, 0x333333);
    scene.add(gridHelper);

    // 动画循环
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 窗口大小调整
    window.addEventListener('resize', onWindowResize);
  };

  const onWindowResize = () => {
    if (!containerRef.value) return;
    
    camera.aspect = containerRef.value.clientWidth / containerRef.value.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight);
  };

  const loadSTLModel = (url) => {
    if (!url) {
      error.value = '模型URL无效';
      return;
    }

    loading.value = true;
    error.value = null;

    // 清除现有模型
    if (model) {
      scene.remove(model);
      model = null;
    }

    const loader = new STLLoader();
    loader.load(
      url,
      (geometry) => {
        const material = new THREE.MeshPhongMaterial({
          color: 0x156289,
          emissive: 0x072534,
          side: THREE.DoubleSide,
          flatShading: true,
        });

        model = new THREE.Mesh(geometry, material);
        
        // 居中模型
        geometry.computeBoundingBox();
        const center = new THREE.Vector3();
        geometry.boundingBox.getCenter(center);
        model.position.sub(center);
        
        // 计算模型尺寸
        const size = new THREE.Vector3();
        geometry.boundingBox.getSize(size);
        modelDimensions.value = {
          width: size.x.toFixed(2),
          height: size.y.toFixed(2),
          depth: size.z.toFixed(2)
        };
        
        scene.add(model);
        loading.value = false;
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
      },
      (error) => {
        console.error('Error loading STL model:', error);
        error.value = '模型加载失败';
        loading.value = false;
      }
    );
  };

  const scaleModel = (scale) => {
    if (model) {
      modelScale.value = scale;
      model.scale.set(scale, scale, scale);
    }
  };

  const setModelDimensions = (width, height, depth) => {
    if (!model) return;

    // 获取当前模型尺寸
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    
    // 计算缩放比例
    const scaleX = width / size.x;
    const scaleY = height / size.y;
    const scaleZ = depth / size.z;
    
    model.scale.set(scaleX, scaleY, scaleZ);
    modelDimensions.value = {
      width: width.toFixed(2),
      height: height.toFixed(2),
      depth: depth.toFixed(2)
    };
  };

  const resetCamera = () => {
    if (camera && controls) {
      camera.position.set(0, 0, 5);
      controls.reset();
    }
  };

  onMounted(() => {
    initThree();
  });

  onUnmounted(() => {
    window.removeEventListener('resize', onWindowResize);
    if (containerRef.value && renderer) {
      containerRef.value.removeChild(renderer.domElement);
    }
    // 释放资源
    if (controls) controls.dispose();
    if (renderer) renderer.dispose();
    if (model) scene.remove(model);
  });

  return {
    loading,
    error,
    modelScale,
    modelDimensions,
    loadSTLModel,
    scaleModel,
    setModelDimensions,
    resetCamera
  };
}