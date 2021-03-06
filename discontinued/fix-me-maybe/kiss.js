const Discord = require('discord.js');
const api = require('./../plugins/api.js');

exports.run = async (client, message, args) => {



var action = "kiss";

	if(!args[0]){
		const embed = new Discord.MessageEmbed()
		.setTimestamp()
		.setTitle("This command requires an argument")
		return message.channel.send({embed});
        }
    
        var u = client.fetchUser(args[0].replace('<@', "").replace(">", "").replace("!", ""));
    
    if(u.username == undefined){
        var nameVar = args.join(' ');     
    } else {
        var nameVar = u.username;
    }
        var url = await api.get(action);
        const embed = new Discord.MessageEmbed()
       .setDescription(message.author.username + " gave " + nameVar + " a " + action)
       .setImage(url)
       .setFooter("Powered by KitK.us")
        message.channel.send({embed});
    }
    
    exports.conf = {
        help: "Kiss the mentioned user~",
        format: "k?kiss [@user]",
        DM: true,
        OwnerOnly: true,
        alias: []
    }
    //fix when api is replaced