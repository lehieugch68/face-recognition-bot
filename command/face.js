module.exports = {
	name: 'face',
	description: 'Nhận dạng và phân tích khuôn mặt.',
	execute(options) {
		let url = (options.msg.mentions.members.first()) ? options.msg.mentions.members.first().user.displayAvatarURL({format: 'jpg', size: 512}) : ((options.msg.attachments.size > 0) ? options.msg.attachments.first().url : options.args.join("").trim());
		options.client.faceApi.sendMessage({url: url, user: options.msg.author.id, channel: options.msg.channel.id}).then(() => {
			options.msg.reply("Đang xử lý...").then(reply => {
				options.client.faceApi.setMessageID(options.msg.author.id, reply.id);
			});
		}).catch(err => { options.msg.reply(`Lỗi: ${err}`) });
	}
}
