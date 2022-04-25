import { default as THREE, OrthographicCamera, Clock, Scene, WebGLRenderer, TextureLoader, Group, AmbientLight } from 'three';
import app from './app';
import pts from './pts';
var ren;
(function (ren) {
    ren.DPI_UPSCALED_RT = true;
    ren.ndpi = 1;
    ren.delta = 0;
    ren.screen = [0, 0];
    ren.screenCorrected = [0, 0];
    function render() {
        ren.renderer.setRenderTarget(null);
        ren.renderer.clear();
        ren.renderer.render(ren.scene, ren.camera);
    }
    ren.render = render;
    function update() {
        ren.delta = ren.clock.getDelta();
        if (ren.delta > 2)
            ren.delta = 0.016;
        ren.delta *= 60.0;
    }
    ren.update = update;
    function init() {
        ren.clock = new Clock();
        ren.scene = new Scene();
        //scene.background = new Color('#333');
        ren.group = new Group;
        ren.scene.add(ren.group);
        ren.ambientLight = new AmbientLight(0xffffff);
        ren.scene.add(ren.ambientLight);
        if (ren.DPI_UPSCALED_RT)
            ren.ndpi = window.devicePixelRatio;
        ren.renderer = new WebGLRenderer({ antialias: false });
        ren.renderer.setPixelRatio(ren.ndpi);
        ren.renderer.setSize(100, 100);
        ren.renderer.autoClear = true;
        ren.renderer.setClearColor(0xffffff, 0);
        document.body.appendChild(ren.renderer.domElement);
        onWindowResize();
        window.ren = ren;
    }
    ren.init = init;
    function onWindowResize() {
        ren.screen = [window.innerWidth, window.innerHeight];
        //screen = pts.divide(screen, 2);
        ren.screen = pts.floor(ren.screen);
        //screen = pts.even(screen, -1);
        //screen = [800, 600];
        ren.screenCorrected = pts.clone(ren.screen);
        if (ren.DPI_UPSCALED_RT) {
            //screen = pts.floor(screen);
            ren.screenCorrected = pts.mult(ren.screen, ren.ndpi);
            ren.screenCorrected = pts.floor(ren.screenCorrected);
            ren.screenCorrected = pts.even(ren.screenCorrected, -1);
        }
        console.log(`
		window inner ${pts.to_string(ren.screen)}\n
		      new is ${pts.to_string(ren.screenCorrected)}`);
        ren.camera = ortographic_camera(ren.screenCorrected[0], ren.screenCorrected[1]);
        ren.camera = ortographic_camera(ren.screenCorrected[0], ren.screenCorrected[1]);
        ren.camera.updateProjectionMatrix();
        ren.renderer.setSize(ren.screen[0], ren.screen[1]);
    }
    function ortographic_camera(w, h) {
        let camera = new OrthographicCamera(w / -2, w / 2, h / 2, h / -2, -10000, 10000);
        camera.updateProjectionMatrix();
        return camera;
    }
    ren.ortographic_camera = ortographic_camera;
    let mem = [];
    function load_texture(file, mode = 1, cb, key) {
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
    ren.load_texture = load_texture;
})(ren || (ren = {}));
export default ren;
