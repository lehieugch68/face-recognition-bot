const tf = require('@tensorflow/tfjs-node');
const faceapi = require("face-api.js");
const canvas = require("canvas");
const { Canvas, Image, ImageData } = canvas; 
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
faceapi.tf.getBackend();
const MODEL_URL = "./models";

const expressionName = {"Bình thường": "neutral", "Vui mừng": "happy", "Buồn bã": "sad", "Tức giận": "angry", "Sợ hãi": "fearful", "Ghê tởm": "disgusted", "Bất ngờ": "surprised"};
const genderName = {"Nam": "male", "Nữ": "female"};

Promise.all([
	faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL),
	faceapi.nets.tinyFaceDetector.loadFromDisk(MODEL_URL),
	//faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URL),
	faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL),
	faceapi.nets.faceExpressionNet.loadFromDisk(MODEL_URL),
	faceapi.nets.ageGenderNet.loadFromDisk(MODEL_URL),
]).then(() => {
	process.on('message', (msg) => {
		analysis(msg.url).then(result => { process.send({content: result, user: msg.user, channel: msg.channel}); }).catch(err => { process.send({content: err, user: msg.user, channel: msg.channel}) });
	})
})

let analysis = (url) => {
	return new Promise(async (resolve, reject) => {
		try {
			let img = await canvas.loadImage(url);
			let results = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions().withAgeAndGender();
			if (!results) return reject({error: true, message: "Không tìm thấy khuôn mặt nào cả!"});
			const out = faceapi.createCanvasFromMedia(img);
			const displaySize = { width: img.width, height: img.height }; 
			faceapi.matchDimensions(img, displaySize);
			const resizedDetections = faceapi.resizeResults(results, displaySize);
			faceapi.draw.drawDetections(out, resizedDetections);
			const box = resizedDetections.detection.box;
			let gender = Object.keys(genderName).find(key => genderName[key] === resizedDetections.gender);
			let age = Math.abs(Math.round(resizedDetections.age));
			let expressions = resizedDetections['expressions'];
			let max = Math.max.apply(null, Object.values(expressions));
			let index = Object.keys(expressions).find(key => expressions[key] === max);
			let expression = Object.keys(expressionName).find(key => expressionName[key] === index);
			let result = `\`\`\`Giới tính: ${gender}\nTuổi: ${age}\nCảm xúc: ${expression}\`\`\``;
			return resolve({error: false, result: result, buffer: out.toBuffer()});
		} catch (err) {
			return reject(({error: true, message: err.message}));
		}
	})
}
