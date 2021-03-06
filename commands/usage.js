var os = require('os');
var cpuStat = require('cpu-stat');

exports.run = async (client, message) => {

var arr = [1, 2, 3, 4, 5, 6, 9, 7, 8, 9, 10];
arr.reverse();

var totalSeconds = await process.uptime();

        let hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        let minutes = Math.floor(totalSeconds / 60);
        let uptimeVar = `${hours} Hours, and ${minutes} Minutes`;
        
const used = process.memoryUsage().heapUsed / 1024 / 1024;
const total = process.memoryUsage().heapTotal / 1024 / 1024;

async function usageMeter(){

    var m = await message.channel.send("Loading metrics...");
    message.channel.startTyping();
 
    cpuStat.usagePercent(function(err, percent, seconds) {

    m.edit("```diff\n-STATISTICS:\n" + 
    "CPU USAGE: " + Math.round(percent) + "%\n" +
    "MEMORY (G): " + Math.round((os.totalmem - os.freemem)/1000000000) + "gb/" + Math.round(os.totalmem/1000000000) + "gb" +
    " - MEMORY (P): " + (Math.round(used * 100) / 100) + "/" + (Math.round(total * 100) / 100) + "mb" +
    "\n\n" + `+Process completed in ${Math.round(seconds*1000)}ms` + 
    "\n\n-BOT:" + "\nBot-Reaction: " + `${m.createdTimestamp - message.createdTimestamp}ms` + 
    '\nAPI-Reaction: ' + client.ws.ping + 'ms' +
    //"\nAPI-Reaction:" + ` P:${Math.round(client.ws.ping)}ms  A:${Math.round((client.ws.pings[0] + client.ws.pings[1] + client.ws.pings[2])/3)}ms` +
    "\n\nPROCESS UPTIME: " + uptimeVar +
    "\n```")
    .then(message.channel.stopTyping());

    });
}

usageMeter();


}
    
exports.conf = {
    help: "N/A",
    format: "N/A",
    DM: true,
    OwnerOnly: true,
    alias: []
}