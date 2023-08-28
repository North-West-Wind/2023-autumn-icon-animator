import { CanvasRenderingContext2D } from "canvas";

const COLORS = ["#dd6d29", "#f09231", "#db6354"];
const coeff = 540 / (1920 * 1920);

export class Leaf {
	fps: number;
	duration: number;
	y: number;
	xOffset: number;
	color: string;
	frames: number;
	rotation = 0;
	finished = false;

	constructor(fps: number, duration: number, y: number) {
		this.fps = fps;
		this.duration = duration;
		this.y = y;
		this.xOffset = -Math.round(Math.random() * 480);
		this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
		this.frames = -this.duration * 0.01;
	}

	func(x: number) {
		return -(coeff * Math.pow(x - 1920, 2) - 540);
	}

	render(ctx: CanvasRenderingContext2D) {
		if (this.frames >= this.duration * 1.01) return this.finished = true;
		const x = ctx.canvas.width * this.frames / this.duration;
		ctx.translate(x, this.func(x + this.xOffset) + this.y);
		ctx.rotate(this.rotation);
		ctx.beginPath();
		// 6-angle star
		let vec = new Vec2(0, ctx.canvas.width * 0.02);
		ctx.moveTo(vec.x, vec.y);
		for (let ii = 0; ii < 12; ii++) {
			vec = vec.rotate(Math.PI / 6);
			if (!(ii % 2)) vec = vec.scaleAll(0.5);
			else vec = vec.scaleAll(2);
			ctx.lineTo(vec.x, vec.y);
		}
		ctx.closePath();
		ctx.fillStyle = this.color;
		ctx.fill();
		ctx.resetTransform();
		this.frames++;
		this.rotation += 0.1;
		return false;
	}
}

class Vec2 {
	readonly x: number;
	readonly y: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	add(x: number, y: number) {
		return new Vec2(this.x + x, this.y + y);
	}

	addVec(vec: Vec2) {
		return this.add(vec.x, vec.y);
	}

	addX(x: number) {
		return this.add(x, 0);
	}

	addY(y: number) {
		return this.add(0, y);
	}

	distanceTo(vec: Vec2) {
		return Math.sqrt(this.distanceToSqr(vec));
	}

	distanceToSqr(vec: Vec2) {
		return this.addVec(vec.inverse()).magnitudeSqr();
	}

	inverse() {
		return this.scaleAll(-1);
	}

	magnitude() {
		return Math.sqrt(this.magnitudeSqr());
	}

	magnitudeSqr() {
		return this.x * this.x + this.y * this.y;
	}

	rotate(radian: number) {
		return new Vec2(this.x * Math.cos(radian) - this.y * Math.sin(radian), this.x * Math.sin(radian) + this.y * Math.cos(radian));
	}

	scale(x: number, y: number) {
		return new Vec2(this.x * x, this.y * y);
	}

	scaleAll(k: number) {
		return this.scale(k, k);
	}

	scaleX(x: number) {
		return this.scale(x, 1);
	}

	scaleY(y: number) {
		return this.scale(1, y);
	}
}