const Discord = require("discord.js");
const nekoClient = require('nekos.life');
const neko = new nekoClient();

exports.run = (client, message, args) => {
    async function getCat(){
	var hug = await neko.sfw.meow();
	var hugVar = JSON.stringify(hug.url);
	hugVar = hugVar.replace(`"`,``);
	hugVar = hugVar.replace(`"`,``);

	const embed = new Discord.MessageEmbed()
	   .setTimestamp()
	   .setImage(hugVar)
	   .setFooter("Powered by Nekos.life")
	 message.channel.send({embed});
    console.log('\x1b[36m', 'MW: ' + hugVar);
}

getCat();

}

exports.conf = {
    help: "view a cat",
    format: "k?cat",
    DM: true,
    OwnerOnly: false,
    alias: ["cac", "meow", "mewo", "mew", "kitty", "kitten", "nya", "nyan", "nyah"]
}