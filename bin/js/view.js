import app from "./app";
import pts from "./pts";
import ren from "./renderer";
import lod, { numbers } from "./lod";
import space from "./space";
import hooks from "./hooks";
// the view manages what it sees
export class view {
    constructor() {
        this.zoom = 1;
        this.zoomIndex = 0;
        this.zooms = [1, 0.5, 0.33, 0.2, 0.1];
        this.wpos = [0, 0];
        this.rpos = [0, 0];
        this.mpos = [0, 0];
        this.mwpos = [0, 0];
        this.mrpos = [0, 0];
        this.begin = [0, 0];
        this.before = [0, 0];
        this.show = true;
        new lod.galaxy(10);
        this.rpos = lod.project(this.wpos);
    }
    static make() {
        return new view;
    }
    chart(big) {
    }
    remove(obj) {
        var _a;
        (_a = obj.sector) === null || _a === void 0 ? void 0 : _a.remove(obj);
    }
    tick() {
        this.move();
        this.mouse();
        this.pan();
        this.float();
        this.chase();
        this.stats();
        this.wpos = lod.unproject(this.rpos);
        lod.ggalaxy.update(this.wpos);
        const zoom = space.gview.zoom;
        ren.camera.scale.set(zoom, zoom, zoom);
        ren.camera.updateProjectionMatrix();
    }
    pan() {
    }
    float() {
        let float = [1, 1];
        float = pts.mult(float, ren.delta);
        this.rpos = pts.add(this.rpos, float);
    }
    chase() {
        const floor = false;
        if (floor) {
            this.rpos = pts.floor(this.rpos);
        }
        // let inv = pts.inv(this.rpos);
        // ren.groups.axisSwap.position.set(inv[0], inv[1], 0);
        ren.camera.position.set(this.rpos[0], this.rpos[1], 0);
    }
    mouse() {
        let mouse = app.mouse();
        mouse = pts.subtract(mouse, pts.divide([ren.screen[0], ren.screen[1]], 2));
        mouse = pts.mult(mouse, ren.ndpi);
        mouse = pts.mult(mouse, this.zoom);
        mouse[1] = -mouse[1];
        this.mrpos = pts.add(mouse, this.rpos);
        //this.mrpos = pts.add(this.mrpos, lod.project([.5, -.5])); // correction
        this.mwpos = lod.unproject(this.mrpos);
        //this.mwpos = pts.add(this.mwpos, [.5, -.5])
        // now..
        if (app.button(2) == 1) {
            hooks.call('viewClick', this);
        }
    }
    move() {
        let pan = 10;
        const zoomFactor = 1 / 10;
        if (app.key('x'))
            pan *= 2;
        let add = [0, 0];
        if (app.key('w'))
            add = pts.add(add, [0, pan]);
        if (app.key('s'))
            add = pts.add(add, [0, -pan]);
        if (app.key('a'))
            add = pts.add(add, [-pan, 0]);
        if (app.key('d'))
            add = pts.add(add, [pan, 0]);
        if ((app.key('f') == 1 || app.wheel == -1) && this.zoomIndex > 0)
            this.zoomIndex -= 1;
        if ((app.key('r') == 1 || app.wheel == 1) && this.zoomIndex < this.zooms.length - 1)
            this.zoomIndex += 1;
        this.zoom = this.zooms[this.zoomIndex];
        add = pts.mult(add, this.zoom);
        add = pts.floor(add);
        this.rpos = pts.add(this.rpos, add);
    }
    stats() {
        if (app.key('h') == 1)
            this.show = !this.show;
        let crunch = ``;
        //crunch += `DPI_UPSCALED_RT: ${ren.DPI_UPSCALED_RT}<br />`;
        crunch += '<br />';
        //crunch += `dpi: ${ren.ndpi}<br />`;
        //crunch += `fps: ${ren.fps}<br />`;
        crunch += `delta: ${ren.delta.toPrecision(6)}<br />`;
        crunch += '<br />';
        crunch += `textures: ${ren.renderer.info.memory.textures}<br />`;
        crunch += `programs: ${ren.renderer.info.programs.length}<br />`;
        //crunch += `memory: ${Math.floor(ren.memory.usedJSHeapSize / 1000000)} / ${Math.floor(ren.memory.totalJSHeapSize / 1000000)}<br />`;
        crunch += '<br />';
        //crunch += `mouse: ${pts.to_string(App.mouse())}<br />`;
        //crunch += `mpos: ${pts.to_string(pts.floor(this.mpos))}<br />`;
        crunch += `mwpos: ${pts.to_string(pts.floor(this.mwpos))}<br />`;
        crunch += `mrpos: ${pts.to_string(pts.floor(this.mrpos))}<br />`;
        crunch += `mbpos: ${pts.to_string(lod.ggalaxy.big(this.mwpos))}<br />`;
        crunch += '<br />';
        crunch += `lod grid size: ${lod.ggrid.spread * 2 + 1} / ${lod.ggrid.outside * 2 + 1}<br />`;
        crunch += `view bigpos: ${pts.to_string(lod.ggalaxy.big(this.wpos))}<br />`;
        crunch += `view zoom: ${this.zoom}<br />`;
        crunch += '<br />';
        //crunch += `world wpos: ${pts.to_string(this.pos)}<br /><br />`;
        crunch += `sectors: ${numbers.sectors[0]} / ${numbers.sectors[1]}<br />`;
        crunch += `game objs: ${numbers.objs[0]} / ${numbers.objs[1]}<br />`;
        crunch += `sprites: ${numbers.sprites[0]} / ${numbers.sprites[1]}<br />`;
        crunch += '<br />';
        let element = document.querySelectorAll('.stats')[0];
        element.innerHTML = crunch;
        element.style.visibility = this.show ? 'visible' : 'hidden';
    }
}
export default view;
