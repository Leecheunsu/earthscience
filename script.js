// 장면 설정
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 태양
const sunGeometry = new THREE.SphereGeometry(30, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// 행성 데이터
const planets = [
    { name: 'Mercury', size: 10, distance: 100, color: 0xaaaaaa, orbitSpeed: 0.241, type: 'inner', maxElongation: 28 },
    { name: 'Venus', size: 14, distance: 150, color: 0xffa500, orbitSpeed: 0.615, type: 'inner', maxElongation: 47 },
    { name: 'Earth', size: 16, distance: 200, color: 0x0000ff, orbitSpeed: 1.0, type: 'inner' },
    { name: 'Mars', size: 12, distance: 280, color: 0xff0000, orbitSpeed: 1.881, type: 'outer' },
    { name: 'Jupiter', size: 28, distance: 400, color: 0xffd700, orbitSpeed: 11.86, type: 'outer' },
    { name: 'Saturn', size: 24, distance: 520, color: 0xf4a460, orbitSpeed: 29.45, type: 'outer' },
    { name: 'Uranus', size: 22, distance: 600, color: 0x00ffff, orbitSpeed: 84.01, type: 'outer' },
    { name: 'Neptune', size: 22, distance: 720, color: 0x0000ff, orbitSpeed: 164.8, type: 'outer' }
];

// 행성 및 궤도 생성
const planetMeshes = planets.map(planet => {
    const geometry = new THREE.SphereGeometry(planet.size, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: planet.color });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const orbitGeometry = new THREE.RingGeometry(planet.distance - 2, planet.distance + 2, 64);
    const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbit.rotation.x = Math.PI / 2;
    scene.add(orbit);

    return { mesh, ...planet };
});

// 별 추가
function addStars() {
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff });

    const starVertices = [];
    for (let i = 0; i < 10000; i++) {
        const x = (Math.random() - 0.5) * 16000;
        const y = (Math.random() - 0.5) * 16000;
        const z = (Math.random() - 0.5) * 16000;
        starVertices.push(x, y, z);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
}

addStars();

camera.position.z = 1000;
camera.position.y = 400;
camera.rotation.x = -0.6;

let time = 0;

// 애니메이션 루프
function animate() {
    requestAnimationFrame(animate);
    TWEEN.update();

    time += 0.01;

    planetMeshes.forEach(planet => {
        const orbitalPeriod = 2 * Math.PI * (time / planet.orbitSpeed);
        planet.mesh.position.x = planet.distance * Math.cos(orbitalPeriod);
        planet.mesh.position.z = planet.distance * Math.sin(orbitalPeriod);
        planet.mesh.rotation.y += 0.05;
    });

    renderer.render(scene, camera);
}

animate();

// 창 크기 변경 처리기
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 특정 행성에 초점 맞추기 및 새 궤도 표시
let focusedPlanet = '';
let planetAnimation;
function focusOnPlanet(planetName) {
    const planetData = planets.find(p => p.name === planetName);

    if (planetData) {
        // 장면 초기화
        while (scene.children.length > 0) {
            scene.remove(scene.children[0]);
        }

        // 태양 추가
        scene.add(sun);

        // 지구 및 궤도 추가
        const earthData = planets.find(p => p.name === 'Earth');
        const earthGeometry = new THREE.SphereGeometry(earthData.size, 32, 32);
        const earthMaterial = new THREE.MeshBasicMaterial({ color: earthData.color });
        const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
        scene.add(earthMesh);

        const earthOrbitGeometry = new THREE.RingGeometry(earthData.distance - 2, earthData.distance + 2, 64);
        const earthOrbitMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
        const earthOrbit = new THREE.Mesh(earthOrbitGeometry, earthOrbitMaterial);
        earthOrbit.rotation.x = Math.PI / 2;
        scene.add(earthOrbit);

        // 초점을 맞춘 행성 및 궤도 추가
        const planetGeometry = new THREE.SphereGeometry(planetData.size, 32, 32);
        const planetMaterial = new THREE.MeshBasicMaterial({ color: planetData.color });
        const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
        scene.add(planetMesh);

        const planetOrbitGeometry = new THREE.RingGeometry(planetData.distance - 2, planetData.distance + 2, 64);
        const planetOrbitMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
        const planetOrbit = new THREE.Mesh(planetOrbitGeometry, planetOrbitMaterial);
        planetOrbit.rotation.x = Math.PI / 2;
        scene.add(planetOrbit);

        addPlanetAnimation(planetMesh, planetData.distance, planetData.orbitSpeed);
        addPlanetAnimation(earthMesh, earthData.distance, earthData.orbitSpeed);

        new TWEEN.Tween(camera.position)
            .to({ x: 0, y: planetData.distance * 1.5, z: 0 }, 2000)
            .easing(TWEEN.Easing.Cubic.InOut)
            .onUpdate(() => camera.lookAt(sun.position))
            .start();

        document.getElementById('info-button').style.display = 'block';
        focusedPlanet = planetName;
        planetAnimation = planetMesh;
    }
}

// 행성 궤도 내에서 행성 애니메이션 추가
function addPlanetAnimation(planetMesh, distance, orbitSpeed) {
    function animatePlanet() {
        requestAnimationFrame(animatePlanet);
        TWEEN.update();

        const orbitalPeriod = 2 * Math.PI * (time / orbitSpeed);
        planetMesh.position.x = distance * Math.cos(orbitalPeriod);
        planetMesh.position.z = distance * Math.sin(orbitalPeriod);
        planetMesh.rotation.y += 0.05;

        renderer.render(scene, camera);
    }

    animatePlanet();
}

// 시운동 표시 함수
function showRetrogradeMotion() {
    if (focusedPlanet && planetAnimation) {
        let counter = 0;
        function animateRetrograde() {
            if (counter < 200) {
                counter++;
                const earthData = planets.find(p => p.name === 'Earth');
                const planetData = planets.find(p => p.name === focusedPlanet);
                const earthPeriod = 2 * Math.PI * (time / earthData.orbitSpeed);
                const planetPeriod = 2 * Math.PI * (time / planetData.orbitSpeed);
                const earthX = earthData.distance * Math.cos(earthPeriod);
                const earthZ = earthData.distance * Math.sin(earthPeriod);
                const planetX = planetData.distance * Math.cos(planetPeriod);
                const planetZ = planetData.distance * Math.sin(planetPeriod);

                const retrogradeX = planetX - earthX;
                const retrogradeZ = planetZ - earthZ;
                planetAnimation.position.x = retrogradeX;
                planetAnimation.position.z = retrogradeZ;

                renderer.render(scene, camera);
                requestAnimationFrame(animateRetrograde);
            }
        }
        animateRetrograde();
    }
}

// 행성 정보 표시
function displayInfo() {
    const planetData = planets.find(p => p.name === focusedPlanet);

    if (planetData) {
        // 장면 초기화
        while (scene.children.length > 0) {
            scene.remove(scene.children[0]);
        }

        // 태양 추가
        scene.add(sun);

        // 지구 및 궤도 추가
        const earthData = planets.find(p => p.name === 'Earth');
        const earthGeometry = new THREE.SphereGeometry(earthData.size, 32, 32);
        const earthMaterial = new THREE.MeshBasicMaterial({ color: earthData.color });
        const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
        earthMesh.position.set(earthData.distance, 0, 0);
        scene.add(earthMesh);

        const earthOrbitGeometry = new THREE.RingGeometry(earthData.distance - 2, earthData.distance + 2, 64);
        const earthOrbitMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
        const earthOrbit = new THREE.Mesh(earthOrbitGeometry, earthOrbitMaterial);
        earthOrbit.rotation.x = Math.PI / 2;
        scene.add(earthOrbit);

        // 초점을 맞춘 행성 및 궤도 추가
        const planetGeometry = new THREE.SphereGeometry(planetData.size, 32, 32);
        const planetMaterial = new THREE.MeshBasicMaterial({ color: planetData.color });
        const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
        planetMesh.position.set(planetData.distance, 0, 0);
        scene.add(planetMesh);

        const planetOrbitGeometry = new THREE.RingGeometry(planetData.distance - 2, planetData.distance + 2, 64);
        const planetOrbitMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
        const planetOrbit = new THREE.Mesh(planetOrbitGeometry, planetOrbitMaterial);
        planetOrbit.rotation.x = Math.PI / 2;
        scene.add(planetOrbit);

        // 마커 추가
        addMarkers(planetData, earthMesh);
    }
}

function addMarkers(planetData, earthMesh) {
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    const markers = planetData.type === 'inner' ? [
        { name: '내합', position: { x: planetData.distance, y: 0, z: 0 } },
        { name: '외합', position: { x: -planetData.distance, y: 0, z: 0 } },
        { name: '동방 최대 이각', angle: -planetData.maxElongation }, // 방향 반대로 설정
        { name: '서방 최대 이각', angle: planetData.maxElongation } // 방향 반대로 설정
    ] : [
        { name: '충', position: { x: -earthMesh.position.x, y: 0, z: 0 } },
        { name: '합', position: { x: planetData.distance, y: 0, z: 0 } },
        { name: '동구', position: { x: earthMesh.position.x, y: 0, z: planetData.distance } },
        { name: '서구', position: { x: earthMesh.position.x, y: 0, z: -planetData.distance } }
    ];

    markers.forEach(marker => {
        let position;
        if (marker.angle !== undefined) {
            const angleInRadians = THREE.MathUtils.degToRad(marker.angle);
            position = {
                x: earthMesh.position.x + planetData.distance * Math.cos(angleInRadians),
                y: 0,
                z: earthMesh.position.z + planetData.distance * Math.sin(angleInRadians)
            };
        } else {
            position = marker.position;
        }

        // 마커를 행성 모양으로 변경
        const markerGeometry = new THREE.SphereGeometry(planetData.size / 4, 32, 32);
        const markerMesh = new THREE.Mesh(markerGeometry, markerMaterial);
        markerMesh.position.set(position.x, position.y, position.z);
        scene.add(markerMesh);

        const label = createTextLabel(marker.name);
        label.position.set(position.x, position.y + 5, position.z);
        scene.add(label);

        // 동구와 서구 마커의 보조선 제거
        if (marker.name !== '동구' && marker.name !== '서구') {
            const lineGeometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(earthMesh.position.x, 0, earthMesh.position.z),
                new THREE.Vector3(position.x, position.y, position.z)
            ]);
            const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
            const line = new THREE.Line(lineGeometry, lineMaterial);
            scene.add(line);
        }
    });
}


// 마커를 위한 텍스트 레이블 생성
function createTextLabel(text) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = '24px Arial';
    context.fillStyle = 'white';
    context.fillText(text, 0, 24);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);

    return sprite;
}

animate();
