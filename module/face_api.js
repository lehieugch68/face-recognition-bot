const childProcess = require('child_process');

class face_api {
	constructor(client) {
		this.child = childProcess.fork('./face_recognition.js');
		this.users = new Map();
		this.child.on('message', (message) => {
			let channelID = message.channel;
			let channel = client.channels.cache.get(channelID);
			let userID = message.user;
			let user = client.users.cache.get(userID);
			let replyID = this.users.get(userID);
			if (replyID === undefined) return;
			this.users.delete(userID);
			if (replyID !== null) try { channel.messages.cache.get(replyID).delete() } catch { };
			if (message.content.error) {
				return channel.send(`${user}, Lỗi: ${message.content.message}`);
			}
			return channel.send(message.content.result, {files:[{attachment: Buffer.from(message.content.buffer, 'utf8'), name: `${userID}.png`}]});
		})
	}

	sendMessage(message) {
		return new Promise(async (resolve, reject) => {
			if (this.users.has(message.user)) return reject("Có tác vụ đang xử lý!");
			this.users.set(message.user, null);
			this.child.send(message);
			return resolve();
		})
	}

	setMessageID(userID, messageID) {
		if (this.users.has(userID)) this.users.set(userID, messageID);
	}
}

module.exports = face_api;
