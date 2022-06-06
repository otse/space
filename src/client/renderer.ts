import { default as THREE, OrthographicCamera, PerspectiveCamera, Clock, Scene, WebGLRenderer, Texture, TextureLoader, WebGLRenderTarget, ShaderMaterial, Mesh, PlaneBufferGeometry, Color, NearestFilter, RGBAFormat, Group, Renderer as ren, AmbientLight, DirectionalLight } from 'three';
import app from './app';

import pts from './pts';

namespace ren {
	export const DPI_UPSCALED_RT = true

	export var ndpi = 1
	export var delta = 0
	export var scene: Scene
	export var group: Group
	export var renderer: WebGLRenderer
	export var camera: OrthographicCamera
	export var clock: Clock
	export var ambientLight: AmbientLight

	export var screen: vec2 = [0, 0]
	export var screenCorrected: vec2 = [0, 0]

	export function render() {
		renderer.setRenderTarget(null);
		renderer.clear();
		renderer.render(scene, camera);
	}

	export function update() {
		delta = clock.getDelta();
		if (delta > 2)
			delta = 0.016;
		delta *= 60.0;
	}

	export function init() {
		console.log('ren init');
		
		clock = new Clock()
		scene = new Scene();
		//scene.background = new Color('#333');

		group = new Group;
		scene.add(group);

		ambientLight = new AmbientLight(0xffffff);
		scene.add(ambientLight);

		if (DPI_UPSCALED_RT)
			ndpi = window.devicePixelRatio;

		renderer = new WebGLRenderer({ antialias: false });
		renderer.setPixelRatio(ndpi);
		renderer.setSize(100, 100);
		renderer.autoClear = true;
		renderer.setClearColor(0xffffff, 0);

		window.addEventListener('resize', onWindowResize, false);

		document.body.appendChild(renderer.domElement);

		onWindowResize();

		(window as any).ren = ren;
	}

	function onWindowResize() {
		screen = [window.innerWidth, window.innerHeight];
		//screen = pts.divide(screen, 2);
		screen = pts.floor(screen);
		//screen = pts.even(screen, -1);
		//screen = [800, 600];
		screenCorrected = pts.clone(screen);
		if (DPI_UPSCALED_RT) {
			//screen = pts.floor(screen);
			screenCorrected = pts.mult(screen, ndpi);
			screenCorrected = pts.floor(screenCorrected);
			screenCorrected = pts.even(screenCorrected, -1);
		}
		console.log(`
		window inner ${pts.to_string(screen)}\n
		      new is ${pts.to_string(screenCorrected)}`);

		camera = ortographic_camera(screenCorrected[0], screenCorrected[1]);

		camera = ortographic_camera(screenCorrected[0], screenCorrected[1]);
		camera.updateProjectionMatrix();
		
		renderer.setSize(screen[0], screen[1]);
	}

	export function ortographic_camera(w, h) {
		let camera = new OrthographicCamera(w / - 2, w / 2, h / 2, h / - 2, - 10000, 10000);
		camera.updateProjectionMatrix();

		return camera;
	}

	let mem = []

	export function load_texture(file: string, mode = 1, cb?, key?: string): Texture {
		if (mem[key || file])
			return mem[key || file];
		let texture = new TextureLoader().load(file + `?v=${app.salt}`, cb);
		texture.generateMipmaps = false;
		texture.center.set(0, 1);
		texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
		if (mode) {
			texture.magFilter = THREE.LinearFilter;
			texture.minFilter = THREE.LinearFilter;
		}
		else {
			texture.magFilter = THREE.NearestFilter;
			texture.minFilter = THREE.NearestFilter;
		}
		mem[key || file] = texture;
		return texture;
	}
}

export default ren;