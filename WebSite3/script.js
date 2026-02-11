// Three.js Scene Setup
let scene, camera, renderer, controls;
let model, bones = [];
let materials = [];
let originalPose = {};
let gridHelper;
let meshObjects = []; // Store all mesh objects

// Initialize Scene
function init() {
    const canvas = document.getElementById('canvas3d');
    const sceneView = document.querySelector('.scene-view');
    
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x383838);
    
    // Camera
    camera = new THREE.PerspectiveCamera(
        45,
        sceneView.clientWidth / sceneView.clientHeight,
        0.1,
        1000
    );
    camera.position.set(0, 0.8, 2);
    
    // Renderer
    renderer = new THREE.WebGLRenderer({ 
        canvas: canvas, 
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true
    });
    renderer.setSize(sceneView.clientWidth, sceneView.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    
    // Controls - Blender style
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // Blender-style controls
    controls.mouseButtons = {
        LEFT: null, // Disable left click rotation
        MIDDLE: THREE.MOUSE.ROTATE, // Middle mouse to rotate
        RIGHT: null // Disable right click
    };
    
    // Enable panning with Shift + Middle mouse
    controls.enablePan = true;
    controls.panSpeed = 1.0;
    controls.screenSpacePanning = true;
    
    // Zoom with scroll wheel
    controls.enableZoom = true;
    controls.zoomSpeed = 1.2;
    
    // Add custom pan on Shift + Middle mouse
    let isPanning = false;
    renderer.domElement.addEventListener('mousedown', (e) => {
        if (e.button === 1) { // Middle mouse
            if (e.shiftKey) {
                controls.mouseButtons.MIDDLE = THREE.MOUSE.PAN;
                isPanning = true;
            } else {
                controls.mouseButtons.MIDDLE = THREE.MOUSE.ROTATE;
                isPanning = false;
            }
        }
    });
    
    renderer.domElement.addEventListener('mouseup', (e) => {
        if (e.button === 1) {
            controls.mouseButtons.MIDDLE = THREE.MOUSE.ROTATE;
            isPanning = false;
        }
    });
    
    // Handle shift key changes during drag
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Shift' && e.button === 1) {
            controls.mouseButtons.MIDDLE = THREE.MOUSE.PAN;
        }
    });
    
    window.addEventListener('keyup', (e) => {
        if (e.key === 'Shift') {
            controls.mouseButtons.MIDDLE = THREE.MOUSE.ROTATE;
        }
    });
    
    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    ambientLight.name = 'ambientLight';
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    directionalLight.name = 'directionalLight';
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Grid
    gridHelper = new THREE.GridHelper(5, 10);
    scene.add(gridHelper);
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
    
    // Start animation loop
    animate();
    
    setupEventListeners();
    
    // Auto-load the GLB model
    loadModelFromPath('assets/Nik-Daig-Rig.glb', 'gltf');
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

function onWindowResize() {
    const sceneView = document.querySelector('.scene-view');
    camera.aspect = sceneView.clientWidth / sceneView.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(sceneView.clientWidth, sceneView.clientHeight);
}

// Create a placeholder cube
function createPlaceholderModel() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0x888888 });
    model = new THREE.Mesh(geometry, material);
    scene.add(model);
    
    materials = [material];
    populateMaterialSelects();
}

// Event Listeners
function setupEventListeners() {
    document.querySelectorAll('.asset-item').forEach(item => {
        item.addEventListener('click', () => {
            const modelPath = item.dataset.model;
            const format = item.dataset.format || 'fbx';
            if (modelPath) loadModelFromPath(modelPath, format);
        });
    });
    
    document.getElementById('color-picker').addEventListener('input', changeMaterialColor);
    document.getElementById('texture-select').addEventListener('change', applyTexture);
    
    document.getElementById('bone-select').addEventListener('change', onBoneSelect);
    document.getElementById('rotate-x').addEventListener('input', syncSlider);
    document.getElementById('rotate-y').addEventListener('input', syncSlider);
    document.getElementById('rotate-z').addEventListener('input', syncSlider);
    document.getElementById('rotate-x-slider').addEventListener('input', syncNumber);
    document.getElementById('rotate-y-slider').addEventListener('input', syncNumber);
    document.getElementById('rotate-z-slider').addEventListener('input', syncNumber);
    document.getElementById('reset-pose').addEventListener('click', resetPose);
    
    document.getElementById('light-intensity').addEventListener('input', updateLighting);
    document.getElementById('ambient-light').addEventListener('input', updateLighting);
    document.getElementById('light-color').addEventListener('input', updateLighting);
    
    document.getElementById('transparent-bg').addEventListener('change', toggleBackground);
    document.getElementById('bg-color').addEventListener('input', changeBackgroundColor);
    document.getElementById('show-grid').addEventListener('change', toggleGrid);
    
    document.getElementById('render-btn').addEventListener('click', renderImage);
}

function syncSlider(e) {
    const axis = e.target.id.split('-')[1];
    document.getElementById(`rotate-${axis}-slider`).value = e.target.value;
    updateBoneRotation();
}

function syncNumber(e) {
    const axis = e.target.id.split('-')[1];
    document.getElementById(`rotate-${axis}`).value = e.target.value;
    updateBoneRotation();
}

// Load FBX Model
function loadModelFromPath(path, format, callback) {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('loading').textContent = 'Loading model...';
    
    // Check if loader exists
    if (format === 'fbx' && typeof THREE.FBXLoader === 'undefined') {
        document.getElementById('loading').innerHTML = `
            <div style="color: #ff6b6b;">FBXLoader not available</div>
            <div style="font-size: 10px; margin-top: 10px; color: #aaa;">
                The FBX loader library failed to load.<br>
                Check your internet connection and refresh the page.
            </div>
        `;
        return;
    }
    
    const loader = (format === 'fbx' || format === 'FBX') ? new THREE.FBXLoader() : new THREE.GLTFLoader();
    
    loader.load(
        path,
        (loadedModel) => {
            console.log('Raw loaded model:', loadedModel);
            
            if (model) scene.remove(model);
            
            model = (format === 'fbx' || format === 'FBX') ? loadedModel : loadedModel.scene;
            scene.add(model);
            
            console.log('Model added to scene:', model);
            
            // Center and scale model
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            
            console.log('Model size:', size);
            console.log('Model center:', center);
            
            model.position.sub(center);
            model.position.y = 0; // Place on ground
            
            const maxDim = Math.max(size.x, size.y, size.z);
            console.log('Max dimension:', maxDim);
            
            // Always scale to reasonable size (around 2 units tall)
            const targetSize = 2;
            const scale = targetSize / maxDim;
            model.scale.set(scale, scale, scale);
            console.log('Scaled by:', scale);
            
            // Recalculate box after scaling
            const scaledBox = new THREE.Box3().setFromObject(model);
            const scaledSize = scaledBox.getSize(new THREE.Vector3());
            const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
            
            // Center the scaled model
            model.position.set(-scaledCenter.x, -scaledCenter.y, -scaledCenter.z);
            
            // Adjust camera to see the model
            camera.position.set(0, scaledSize.y * 0.5, scaledSize.z * 2);
            camera.lookAt(0, scaledSize.y * 0.4, 0);
            controls.target.set(0, scaledSize.y * 0.4, 0);
            controls.update();
            
            // Extract materials and fix shininess
            materials = [];
            meshObjects = [];
            model.traverse((child) => {
                console.log('Child:', child.type, child.name);
                if (child.isMesh) {
                    meshObjects.push(child);
                    
                    // Fix material shininess
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(mat => {
                                mat.metalness = 0;
                                mat.roughness = 1;
                                materials.push(mat);
                            });
                        } else {
                            child.material.metalness = 0;
                            child.material.roughness = 1;
                            materials.push(child.material);
                        }
                    }
                }
            });
            
            console.log('Total materials found:', materials.length);
            console.log('Total mesh objects found:', meshObjects.length);
            populateMaterialSelects();
            populateObjectsList();
            
            // Extract bones
            bones = [];
            originalPose = {};
            model.traverse((child) => {
                if (child.isBone) {
                    bones.push(child);
                    originalPose[child.uuid] = {
                        x: child.rotation.x,
                        y: child.rotation.y,
                        z: child.rotation.z
                    };
                }
            });
            
            console.log('Total bones found:', bones.length);
            populateBoneSelect();
            document.getElementById('loading').style.display = 'none';
            
            if (callback) callback();
        },
        (xhr) => {
            if (xhr.lengthComputable) {
                const percent = (xhr.loaded / xhr.total) * 100;
                document.getElementById('loading').textContent = `Loading... ${Math.round(percent)}%`;
            }
        },
        (error) => {
            console.error('Error loading model:', error);
            document.getElementById('loading').innerHTML = `
                <div style="color: #ff6b6b;">Error loading model</div>
                <div style="font-size: 10px; margin-top: 10px; color: #aaa;">
                    ${error.message || 'Unknown error'}<br><br>
                    Make sure:<br>
                    1. Server is running (python -m http.server 8000)<br>
                    2. You're accessing via http://localhost:8000<br>
                    3. File exists at: ${path}
                </div>
            `;
        }
    );
}

function updateModelRotation() {
    if (!model) return;
    
    const x = THREE.MathUtils.degToRad(document.getElementById('rotate-x').value);
    const y = THREE.MathUtils.degToRad(document.getElementById('rotate-y').value);
    const z = THREE.MathUtils.degToRad(document.getElementById('rotate-z').value);
    
    model.rotation.set(x, y, z);
}

function populateMaterialSelects() {
    const materialSelect = document.getElementById('material-select');
    materialSelect.innerHTML = '<option value="">Select Material</option>';
    
    materials.forEach((mat, index) => {
        const name = mat.name || `Material ${index + 1}`;
        materialSelect.innerHTML += `<option value="${index}">${name}</option>`;
    });
}

function populateBoneSelect() {
    const boneSelect = document.getElementById('bone-select');
    boneSelect.innerHTML = '<option value="">Select Bone</option>';
    
    bones.forEach((bone, index) => {
        const name = bone.name || `Bone ${index + 1}`;
        boneSelect.innerHTML += `<option value="${index}">${name}</option>`;
    });
}

function populateObjectsList() {
    const objectsList = document.getElementById('objects-list');
    objectsList.innerHTML = '';
    
    if (meshObjects.length === 0) {
        objectsList.innerHTML = '<div style="color: #666; font-size: 11px;">No objects found</div>';
        return;
    }
    
    meshObjects.forEach((mesh, index) => {
        const name = mesh.name || `Object ${index + 1}`;
        const objectItem = document.createElement('label');
        objectItem.style.display = 'flex';
        objectItem.style.alignItems = 'center';
        objectItem.style.marginBottom = '6px';
        objectItem.style.cursor = 'pointer';
        objectItem.style.fontSize = '11px';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = mesh.visible;
        checkbox.style.marginRight = '8px';
        checkbox.addEventListener('change', (e) => {
            mesh.visible = e.target.checked;
        });
        
        const label = document.createElement('span');
        label.textContent = name;
        label.style.color = '#c5c5c5';
        
        objectItem.appendChild(checkbox);
        objectItem.appendChild(label);
        objectsList.appendChild(objectItem);
    });
}

// Material Color Change
function changeMaterialColor(event) {
    const materialIndex = document.getElementById('material-select').value;
    if (materialIndex === '') return;
    
    const color = event.target.value;
    const material = materials[materialIndex];
    
    if (material) {
        material.color.set(color);
    }
}

function applyTexture(event) {
    const textureFile = event.target.value;
    const materialIndex = document.getElementById('material-select').value;
    
    if (materialIndex === '' || textureFile === '') return;
    
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(textureFile, (texture) => {
        const material = materials[materialIndex];
        if (material) {
            material.map = texture;
            material.needsUpdate = true;
        }
    });
}

// Bone Rotation
function onBoneSelect() {
    const boneIndex = document.getElementById('bone-select').value;
    if (boneIndex === '') return;
    
    const bone = bones[boneIndex];
    document.getElementById('rotate-x').value = THREE.MathUtils.radToDeg(bone.rotation.x);
    document.getElementById('rotate-y').value = THREE.MathUtils.radToDeg(bone.rotation.y);
    document.getElementById('rotate-z').value = THREE.MathUtils.radToDeg(bone.rotation.z);
    document.getElementById('rotate-x-slider').value = THREE.MathUtils.radToDeg(bone.rotation.x);
    document.getElementById('rotate-y-slider').value = THREE.MathUtils.radToDeg(bone.rotation.y);
    document.getElementById('rotate-z-slider').value = THREE.MathUtils.radToDeg(bone.rotation.z);
}

function updateBoneRotation() {
    const boneIndex = document.getElementById('bone-select').value;
    if (boneIndex === '') return;
    
    const bone = bones[boneIndex];
    const x = THREE.MathUtils.degToRad(document.getElementById('rotate-x').value);
    const y = THREE.MathUtils.degToRad(document.getElementById('rotate-y').value);
    const z = THREE.MathUtils.degToRad(document.getElementById('rotate-z').value);
    
    bone.rotation.set(x, y, z);
}

function resetPose() {
    bones.forEach((bone) => {
        if (originalPose[bone.uuid]) {
            bone.rotation.set(
                originalPose[bone.uuid].x,
                originalPose[bone.uuid].y,
                originalPose[bone.uuid].z
            );
        }
    });
    
    document.getElementById('rotate-x').value = 0;
    document.getElementById('rotate-y').value = 0;
    document.getElementById('rotate-z').value = 0;
    document.getElementById('rotate-x-slider').value = 0;
    document.getElementById('rotate-y-slider').value = 0;
    document.getElementById('rotate-z-slider').value = 0;
}

// Lighting
function updateLighting() {
    const intensity = document.getElementById('light-intensity').value;
    const ambient = document.getElementById('ambient-light').value;
    const color = document.getElementById('light-color').value;
    
    const directionalLight = scene.getObjectByName('directionalLight');
    const ambientLight = scene.getObjectByName('ambientLight');
    
    if (directionalLight) {
        directionalLight.intensity = parseFloat(intensity);
        directionalLight.color.set(color);
    }
    
    if (ambientLight) {
        ambientLight.intensity = parseFloat(ambient);
    }
}

// Background
function toggleBackground(event) {
    if (event.target.checked) {
        scene.background = null;
        renderer.setClearColor(0x000000, 0);
    } else {
        const bgColor = document.getElementById('bg-color').value;
        scene.background = new THREE.Color(bgColor);
    }
}

function changeBackgroundColor(event) {
    const transparent = document.getElementById('transparent-bg').checked;
    if (!transparent) {
        scene.background = new THREE.Color(event.target.value);
    }
}

function toggleGrid(event) {
    gridHelper.visible = event.target.checked;
}

// Render Image
function renderImage() {
    renderer.render(scene, camera);
    
    canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'character-render.png';
        link.click();
        URL.revokeObjectURL(url);
    });
}

// Initialize on load
window.addEventListener('DOMContentLoaded', init);
