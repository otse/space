import { Mesh, PlaneBufferGeometry, MeshBasicMaterial, Matrix3 } from "three";
import lod, { numbers } from "./lod";
import pts from "./pts";
import ren from "./renderer";
import sprites from "./sprites";
;
;
export class sprite extends lod.shape {
    constructor(vars) {
        super(vars.binded, numbers.sprites);
        this.vars = vars;
        this.dime = true;
        this.rup = 0;
        this.rleft = 0;
        this.roffset = [0, 0];
        if (!this.vars.cell)
            this.vars.cell = [0, 0];
        if (!this.vars.order)
            this.vars.order = 0;
        if (!this.vars.opacity)
            this.vars.opacity = 1;
        this.myUvTransform = new Matrix3;
        this.myUvTransform.setUvTransform(0, 0, 1, 1, 0, 0, 1);
    }
    update() {
        if (!this.mesh)
            return;
        const obj = this.vars.binded;
        let calc = obj.rpos;
        //if (this.dime)
        // move bottom left corner
        calc = pts.add(obj.rpos, pts.divide(obj.size, 2));
        //else
        //	calc = pts.add(obj.rpos, [0, obj.size[1]]);
        let pos = pts.round(obj.wpos);
        calc = pts.add(calc, [this.rleft, this.rup]);
        if (this.mesh) {
            this.retransform();
            this.mesh.position.fromArray([...calc, 0]);
            this.mesh.updateMatrix();
            //this.mesh.renderOrder = -pos[1] + pos[0] + this.vars.order!;
            this.mesh.rotation.z = this.vars.binded.ro;
        }
    }
    retransform() {
        this.myUvTransform.copy(sprites.get_uv_transform(this.vars.cell, this.vars.tuple));
    }
    dispose() {
        var _a, _b, _c;
        if (!this.mesh)
            return;
        (_a = this.geometry) === null || _a === void 0 ? void 0 : _a.dispose();
        (_b = this.material) === null || _b === void 0 ? void 0 : _b.dispose();
        (_c = this.mesh.parent) === null || _c === void 0 ? void 0 : _c.remove(this.mesh);
    }
    create() {
        var _a;
        const obj = this.vars.binded;
        this.retransform();
        this.geometry = new PlaneBufferGeometry(this.vars.binded.size[0], this.vars.binded.size[1]);
        let color;
        if (lod.chunk_coloration) {
            color = this.vars.binded.sector.color;
        }
        this.material = SpriteMaterial({
            map: ren.load_texture(`${this.vars.tuple[3]}.png`, 0),
            transparent: true,
            color: color || '#ffffff',
            opacity: this.vars.opacity
            //wireframe: true
        }, {
            myUvTransform: this.myUvTransform
        });
        this.mesh = new Mesh(this.geometry, this.material);
        this.mesh.frustumCulled = false;
        this.mesh.matrixAutoUpdate = false;
        this.update();
        (_a = this.vars.binded.sector) === null || _a === void 0 ? void 0 : _a.group.add(this.mesh);
        ren.group.add(this.mesh);
    }
}
;
function SpriteMaterial(parameters, uniforms) {
    let material = new MeshBasicMaterial(parameters);
    material.customProgramCacheKey = function () {
        return 'spritemat';
    };
    material.name = "spritemat";
    material.onBeforeCompile = function (shader) {
        shader.defines = {};
        shader.uniforms.myUvTransform = { value: uniforms.myUvTransform };
        shader.vertexShader = shader.vertexShader.replace(`#include <common>`, `#include <common>
			uniform mat3 myUvTransform;
			`);
        shader.vertexShader = shader.vertexShader.replace(`#include <uv_vertex>`, `
			#ifdef USE_UV
			vUv = ( myUvTransform * vec3( uv, 1 ) ).xy;
			#endif
			`);
    };
    return material;
}
export default sprite;
