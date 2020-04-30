const Discord = require('discord.js');
const { PREFIX, TOKEN } = require('.config.json');
var childProcess = require('child_process');

const client = new Discord.Client();

client.once('ready', async () =>{
	console.log('Ready!');
})

client.login(TOKEN)

client.on('message', async msg => {
	if (msg.author.bot) return;
	if (msg.content.startsWith(PREFIX)) {
		const args = msg.content.slice(PREFIX.length).split(/ +/);
		const command = args[0];
		if (command === 'face') {
			let url = (msg.mentions.members.first()) ? msg.mentions.members.first().user.avatarURL({format: 'png'}) : ((msg.attachments.size > 0) ? msg.attachments.first().url : args.join("").trim());
			var child = childProcess.fork('./face_recognition.js');
			child.send(url);
			child.on('message', function(message) {
				if (!message.error) {
					msg.reply(message.result, {files:[{attachment: Buffer.from(message.buffer, 'utf8'), name: `${msg.author.id}.png`}]});
				} else {
					msg.reply(`Lỗi: \`${message.errmsg}\``);
				}
				child.kill();
				return
			});
		}
	}
})