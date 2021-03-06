const Discord = require('discord.js');

exports.run = async (client, message, args) => {
    var user = client.users.cache.get(args[0]);

    const embed1 = new Discord.MessageEmbed()
        .setTitle("Suggestion/Report Reply")
        .setThumbnail(message.author.avatarURL)
        .addField("From", message.author.id + " (" + message.author.username + "#" + message.author.discriminator + ")")
        .addField("Reply", args.slice(1).join(' '))
        .setTimestamp()
        .setFooter("DO NOT REPLY, THIS WORKS ONE WAY")
        
    try{
        user.send({embed: embed1});
        message.channel.send("Reply sent:\nPreview:")
        message.channel.send({embed: embed1});
    }
    catch(err){
        message.channel.send("ERROR: " + err);
    }
}

exports.conf = {
    help: "N/A",
    format: "N/A",
    DM: true,
    OwnerOnly: true,
    alias: []
}
