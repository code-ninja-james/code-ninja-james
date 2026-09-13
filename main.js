import * as THREE from "three";

const canvas = document.querySelector("#scene");
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
renderer.setClearColor(0xf1efe8, 0);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(36, innerWidth / innerHeight, .1, 100);
camera.position.set(0, 0, 8);

const count = innerWidth < 760 ? 700 : 1500;
const positions = new Float32Array(count * 3);
const base = new Float32Array(count * 3);
for (let i = 0; i < count; i++) {
  const r = 1.5 + Math.random() * 2.8;
  const a = Math.random() * Math.PI * 2;
  const b = (Math.random() - .5) * Math.PI;
  positions[i * 3] = base[i * 3] = Math.cos(a) * Math.cos(b) * r;
  positions[i * 3 + 1] = base[i * 3 + 1] = Math.sin(b) * r;
  positions[i * 3 + 2] = base[i * 3 + 2] = Math.sin(a) * Math.cos(b) * r;
}
const geometry = new THREE.BufferGeometry();
geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
const material = new THREE.PointsMaterial({ color: 0x3155e7, size: .018, transparent: true, opacity: .48, sizeAttenuation: true });
const field = new THREE.Points(geometry, material);
field.position.set(2.65, .25, 0);
scene.add(field);

const mouse = { x: 0, y: 0 };
addEventListener("pointermove", e => {
  mouse.x = (e.clientX / innerWidth - .5) * 2;
  mouse.y = (e.clientY / innerHeight - .5) * 2;
}, { passive: true });

function resize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight, false);
  field.position.x = innerWidth < 760 ? 1.4 : 2.65;
}
addEventListener("resize", resize, { passive: true });
resize();

const clock = new THREE.Clock();
function render() {
  const t = clock.getElapsedTime();
  if (!reduced) {
    field.rotation.y = t * .035 + mouse.x * .08;
    field.rotation.x += ((-mouse.y * .06) - field.rotation.x) * .025;
    const p = geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      p[ix + 1] = base[ix + 1] + Math.sin(t * .55 + base[ix] * 1.7) * .045;
    }
    geometry.attributes.position.needsUpdate = true;
  }
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
render();

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: .12 });
document.querySelectorAll(".reveal").forEach((el, i) => {
  el.style.transitionDelay = `${Math.min(i % 3, 2) * 90}ms`;
  observer.observe(el);
});
document.querySelector("#year").textContent = new Date().getFullYear();