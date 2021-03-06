const fs = require('fs');
let data = JSON.parse(fs.readFileSync("./JSON/data.json", "utf8"));
let config = JSON.parse(fs.readFileSync("./config.json", "utf8"));
const axios = require('axios');

const cron = require('node-cron');

exports.run = async (deletedMessage, pool, client) => {
	var current = 0
		current = await axios.get('https://raw.githubusercontent.com/2tuu/Kit/master/plugins/update.txt');
		current = current.data;

	client.currentVersion = current;

	let loaded = JSON.parse(fs.readFileSync("./plugins/update.txt", "utf8"));
		client.version = loaded;

    console.log("Client Logon Successful");
	console.log('\x1b[32m', "======================\n");
	if(current > loaded){
		console.log('\x1b[33m', 'Your framework is out of date');
		console.log('\x1b[33m', `The current Github version is: ` + current + '\n');
		console.log('\x1b[33m', `Your version is: ` + loaded + '\n');
	} else {
		console.log('\x1b[33m', `Version: ` + loaded + '\n');
	}
	console.log('\x1b[32m', "======================");
	console.log('\x1b[33m', `${client.users.cache.size} users - ${client.channels.cache.size} channels - ${client.guilds.cache.size} guilds.`);
	console.log('\x1b[32m', "=========log==========");
    
	client.user.setStatus('dnd');

    const logChannel = client.channels.resolve(config.logChannel);
    logChannel.send(`\`\`\`js
	Log-in Success:
	Version: ${data.version}

	User Cache: ${client.users.cache.size}
	Server Count: ${client.guilds.cache.size}
	\`\`\``)
	if(client.failedCommands.length>0){
		logChannel.send(`\`\`\`js
		ERROR LOADING COMMANDS: ${client.failedCommands}
		\`\`\``)
	}

	try{
		client.blacklist = await pool.query(`SELECT * FROM blacklist`);
		client.blacklist = client.blacklist.rows.map(g=>g.userid);
		console.log('Fetched blacklist');
	} catch(err) {
		console.error(err);
	}

	cron.schedule('* * * * *', async function() {

		var currenttime = Date.now();
		var remind = await pool.query(`SELECT * FROM timer`);
			remind = remind.rows;

		remind.forEach(e=> {
			var status = '';
			if(e.endtime < currenttime){

				if(currenttime - e.endtime > 300000){
					status = ' (delayed)';
				}

				client.channels.fetch(e.channelcreated)
				.then(channel => {
					channel.send(`<@${e.user}>, earlier you reminded me to tell you \`${e.message.replace(/[`]/g, '')}\`` + status);
					pool.query(`DELETE FROM timer WHERE "user" ='${e.user}'`);
				})
				.catch(console.error);	
			}
		});
	
	});

	client.logChannel = client.channels.resolve(config.logChannel);
	
  }
