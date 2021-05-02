const Discord = require(`discord.js`);

exports.run = async (deletedMessage, sql, client, channel) => {

    var channelID = channel.id;
    try{
    var guildID = channel.guild.id;
    } catch(err){
        console.error(err);
    }

    sql.query(`SELECT * FROM modlog WHERE serverid ='${guildID}'`).then(row => {
        row = row.rows[0];
        if(!row) return;

        if(row.enabled === "yes" && row.logchannels === "yes"){
            var ch = client.guilds.cache.get(guildID).channels.cache.get(row.channel);
            ch.send("```diff\n-Channel Deleted\n" + channel.name + " (" + channel.id + ")\n```")
        }

    });
   
}