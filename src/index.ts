import { Canvas, Image } from "canvas";
import * as fs from "fs";
import { lcm } from "mathjs";
import { Leaf } from "./leaf";
import { Presets, SingleBar } from "cli-progress";
import commandExists from "command-exists";
import { spawnSync } from "child_process";

const FPS = 48;
const BG_COUNT = 4;
const BG_FRAME = 24;
const CNP_COUNT = 2;
const CNP_FRAME = 72;
const GIRL_COUNT = 8;
const GIRL_FRAME = 8;
const LEAF_COUNT = 6;
const LEAF_FRAME = 48;
const BLINK_COUNT = 2;
const BLINK_FRAME = 6;

(async () => {
	const bgImgs: Image[] = [];
	for (let ii = 0; ii < BG_COUNT; ii++) {
		const img = new Image();
		await new Promise<void>(res => {
			img.onload = res;
			img.src = `assets/background/png/${ii}.png`;
		});
		bgImgs.push(img);
	}

	const canopyImgs: Image[] = [];
	for (let ii = 0; ii < CNP_COUNT; ii++) {
		const img = new Image();
		await new Promise<void>(res => {
			img.onload = res;
			img.src = `assets/canopy/png/${ii}.png`;
		});
		canopyImgs.push(img);
	}

	const girlImgs: Image[] = [];
	for (let ii = 0; ii < GIRL_COUNT; ii++) {
		const img = new Image();
		await new Promise<void>(res => {
			img.onload = res;
			img.src = `assets/inkling/png/${ii}.png`;
		});
		girlImgs.push(img);
	}

	const blinkImg = new Image();
	await new Promise<void>(res => {
		blinkImg.onload = res;
		blinkImg.src = `assets/inkling/png/blink.png`;
	});
	
	if (!fs.existsSync("out")) fs.mkdirSync("out");
	if (!fs.existsSync("out/frames")) fs.mkdirSync("out/frames");
	for (const file of fs.readdirSync("out/frames"))
		if (file.endsWith(".png"))
			fs.rmSync("out/frames/" + file);

	const frames = lcm(lcm(BG_FRAME * BG_COUNT, CNP_FRAME * CNP_COUNT), GIRL_FRAME * GIRL_COUNT);
	console.log(`We are gonna need ${frames} frames`);

	const leaves: { leaf: Leaf, startFrame: number }[] = [];
	for (let ii = 0; ii < LEAF_COUNT; ii++) {
		const leaf = new Leaf(FPS, LEAF_FRAME, Math.random() * 960);
		leaves.push({ leaf, startFrame: Math.floor(Math.random() * (frames - LEAF_FRAME)) });
	}
	console.log("Leaves will come in at frames:", leaves.map(l => l.startFrame));

	const blinkStartFrames: number[] = [];
	for (let ii = 0; ii < BLINK_COUNT; ii++)
		blinkStartFrames.push(Math.floor(Math.random() * (frames - BLINK_FRAME)));
	console.log("Inkling will blink at frames:", blinkStartFrames);

	const bar = new SingleBar({  }, Presets.shades_classic);
	bar.start(frames, 0);
	let bgCount = 0, cnpCount = 0, girlCount = 0;
	for (let ii = 0; ii < frames; ii++) {
		const canvas = new Canvas(1920, 1920, "image");
		const ctx = canvas.getContext("2d");
		
		ctx.drawImage(bgImgs[Math.floor(bgCount / BG_FRAME)], 0, 0, canvas.width, canvas.height);
		ctx.drawImage(canopyImgs[Math.floor(cnpCount / CNP_FRAME)], 0, 0, canvas.width, canvas.height);
		ctx.drawImage(girlImgs[Math.floor(girlCount / GIRL_FRAME)], 0, 0, canvas.width, canvas.height);

		if (blinkStartFrames.some(f => f < ii && ii - f < BLINK_FRAME))
			ctx.drawImage(blinkImg, 0, 0, canvas.width, canvas.height);

		for (const leaf of leaves) {
			if (leaf.startFrame > ii || leaf.leaf.finished) continue;
			leaf.leaf.render(ctx);
		}

		fs.writeFileSync(`out/frames/${ii.toString().padStart(4, "0")}.png`, canvas.toBuffer());

		bgCount = (bgCount + 1) % (BG_FRAME * BG_COUNT);
		cnpCount = (cnpCount + 1) % (CNP_FRAME * CNP_COUNT);
		girlCount = (girlCount + 1) % (GIRL_FRAME * GIRL_COUNT);
		bar.increment();
	}
	bar.stop();

	if (commandExists.sync("ffmpeg"))
		spawnSync("ffmpeg", ["-framerate", FPS.toString(), "-f", "image2", "-i", "out/frames/%04d.png", "-lossless", "1", "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "out/product.webm"]);
})();