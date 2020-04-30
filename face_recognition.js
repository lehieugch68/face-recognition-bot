const tf = require('@tensorflow/tfjs-node');
const faceapi = require("face-api.js");
const canvas = require("canvas");
const { Canvas, Image, ImageData } = canvas; 
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
faceapi.tf.getBackend();
const MODEL_URL = "./models";

const expressionTrans = {"Bình thường": "neutral", "Vui mừng": "happy", "Buồn bã": "sad", "Tức giận": "angry", "Sợ hãi": "fearful", "Ghê tởm": "disgusted", "Bất ngờ": "surprised"};
const genderTrans = {"Nam": "male", "Nữ": "female"};

process.on('message', async function(msg) {
	await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL); 
	//await faceapi.nets.tinyFaceDetector.loadFromDisk(MODEL_URL);
	await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URL);
	await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL);
	await faceapi.nets.faceExpressionNet.loadFromDisk(MODEL_URL);
	await faceapi.nets.ageGenderNet.loadFromDisk(MODEL_URL);
	let url = msg;
	try {
		let img = await canvas.loadImage(url);
		let results = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceExpressions().withAgeAndGender();
		const out = faceapi.createCanvasFromMedia(img);
		const displaySize = { width: img.width, height: img.height }; 
		faceapi.matchDimensions(img, displaySize);
		const resizedDetections = faceapi.resizeResults(results, displaySize);
		faceapi.draw.drawDetections(out, resizedDetections);
		let gender = Object.keys(genderTrans).find(key => genderTrans[key] === resizedDetections.gender);
		let age = Math.abs(Math.round(resizedDetections.age));
		let expressions = resizedDetections['expressions'];
		let max = Math.max.apply(null, Object.values(expressions));
		let index = Object.keys(expressions).find(key => expressions[key] === max);
		let expression = Object.keys(expressionTrans).find(key => expressionTrans[key] === index);
		let analysisResult = `\`\`\`Giới tính: ${gender}\nTuổi: ${age}\nCảm xúc: ${expression}\`\`\``;
		return process.send({error: false, result: analysisResult, buffer: out.toBuffer()});
	} catch (err) {
		return process.send({error: true, errmessage: err.message});
	}
})
