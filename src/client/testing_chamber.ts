import lod from "./lod";
import sprite from "./sprite";
import space from "./space";
import pts from "./pts";
import hooks from "./hooks";
import sprites from "./sprites";

namespace testing_chamber {

	export var started = false;

	export function start() {
		console.log(' start testing chamber ');

		console.log('placing squares on game area that should take up 1:1 pixels on screen...');
		console.log('...regardless of your os or browsers dpi setting');

		// document.title = 'testing chamber';

		space.gview.zoom = 1;
		space.gview.wpos = [0, 0];
		space.gview.rpos = lod.unproject([0, 0]);

		hooks.register('sectorCreate', (x: lod.sector) => {
			console.log('(testing chamber) create sector');

			let rock = new Asteroid;
			let dif = pts.subtract(x.small.max, x.small.min);
			let pos: vec2 = [dif[0] * Math.random(), dif[1] * Math.random()];
			pos = pts.add(pos, x.small.min);
			pos = pts.add(pos, [-1, -1]);
			rock.wpos = pos;
			lod.add(rock);

			return false;
		});

		hooks.register('viewClick', (view) => {
			console.log(' asteorid! ')
			let rock = new Asteroid;
			rock.wpos = space.gview.mwpos;
			//rock.wpos = pts.add(space.gview.mwpos, [-1, -1]);
			//lod.add(rock);
			return false;
		});

		// lod.SectorSpan = 8;
		// new lod.grid(3, 3);

		for (let y = 0; y < 20; y++) {
			for (let x = 0; x < 20; x++) {
				let square = Square.make();
				square.wpos = [x, y];
				//lod.add(square);
			}
		}

		started = true;
	}

	export function tick() {
	}

	export class Asteroid extends lod.obj {
		static slowness = 40;
		rate: number
		float: vec2
		constructor() {
			super(undefined);
			this.float = pts.make(
				(Math.random() - 0.5) / Asteroid.slowness,
				(Math.random() - 0.5) / Asteroid.slowness
			);
			this.rate = (Math.random() - 0.5) / (Asteroid.slowness * 6);
		}
		override create() {
			this.size = [100, 100];
			this.size = pts.mult(this.size, 1 + (Math.random() * 4))
			let shape = new sprite({
				binded: this,
				tuple: sprites.asteroid
			});
		}
		tick() {
			this.wpos[0] += this.float[0];
			this.wpos[1] -= this.float[1];
			this.ro += this.rate;
			super.update();
			this.sector?.swap(this);
		}
	}

	export class Square extends lod.obj {
		static make() {
			return new Square;
		}
		constructor() {
			super(undefined);
			console.log('square');
		}
		override create() {
			console.log('create');
			this.size = [100, 100];
			let shape = new sprite({
				binded: this,
				tuple: sprites.test100
			});
		}
		tick() {
			let shape = this.shape as sprite;
			//if (this.mousedSquare(space.gview.mrpos))
			//	shape.mesh.material.color.set('white');
			//else
			//	shape.material.color.set('white');
		}
	}
}

export default testing_chamber;