const { PREFIX, TOKEN } = require('./config.json');
const Discord = require('discord.js');
const client = new Discord.Client();
client.commands = new Discord.Collection();
const fs = require('fs');

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.once('ready', () =>{
	console.log("Ready!");
});

client.on('message', async msg => {
	if (msg.author == client.user) return;
	if (msg.content.toLowerCase().startsWith(PREFIX) && !msg.author.bot)
	{
		const args = msg.content.slice(PREFIX.length).replace(/\n/g, ' \n').split(/ +/);
		const commandName = args.shift().toLowerCase().trim();
		const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
		if (command == null) return;
		try {
			command.execute(msg, args);
		} catch (error) {
			return msg.reply(`Xảy ra lỗi khi thực hiện lệnh này:\n\`${error.message}\``);
		}
	}
})

client.login(TOKEN)
