const Discord = require(`discord.js`);
const client = new Discord.Client({
  disableMentions: 'everyone'
});

//Extra dependancies/variables
const fs = require(`fs`);
const config = require(`./config.json`);
client.blacklist = [];

//TODO: Make a blacklist table on the db and define here
//placeholder
client.blist = [];

//Temporary data sets
      client.aliases = new Map();
      client.help = new Map();
const deletedMessage = new Set();
const roles = new Set();
const tossedSet = new Set();
const cooldown = new Set();

//SQLite database file
const { Pool } = require('pg')
const pool = new Pool({
  user: config.dbuser,
  database: config.dbname,
  password: config.dbpass,
  idleTimeoutMillis: 100,
  connectionTimeoutMillis: 100,
  max: 0
});

//Event loader (for scripts in ./events, each file is named after their event)
fs.readdir(`./events/`, (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    let eventFunction = require(`./events/${file}`);
    let eventName = file.split(`.`)[0];

    client.on(eventName, (...args) => eventFunction.run(deletedMessage, pool, client, ...args));
  });
});

//Require every command, cache conf for each

client.failedCommands = [];//list of commands that failed to load
fs.readdir('./commands', (err, commands) => {

  function cLoader(c){
    try {
      const cmd = require(`./commands/${c}`);
      var cmdName = c.substring(0, c.length-3);
      console.log('Loaded ' + cmdName);

      client.aliases[cmdName] = {aliases: []};
      client.help[cmdName] = {help: '', format: ''};

      client.help[cmdName].help = cmd.conf.help;
      client.help[cmdName].format = cmd.conf.format;

      cmd.conf.alias.forEach((alias) => {
      client.aliases[cmdName].aliases.push(alias);

      });
      return false;
    } catch (err) {
      console.error(`Loading Error: ${err}`);
      client.failedCommands.push(c);
    }
  }

  commands.forEach((m) => {
      console.log(`Loading module: ${m}`);
      cLoader(m);
  });

});

//experimental command loader
fs.readdir('./commands-locked', (err, commands) => {

  function cLoader(c){
    try {
      const cmd = require(`./commands-locked/${c}`);
      var cmdName = c.substring(0, c.length-3);
      console.log('Loaded ' + cmdName);

      client.aliases[cmdName] = {aliases: []};

      cmd.conf.alias.forEach((alias) => {
      client.aliases[cmdName].aliases.push(alias);

      });
      return false;
    } catch (err) {
      console.error(`Loading Error: ${err}`);
    }
  }

  try{
  commands.forEach((m) => {
      console.log(`Loading module: ${m}`);
      cLoader(m);
  });
  }catch(err){}

})


//On-message event
client.on("message", async message => {

  if(message.content === `<@${client.user.id}>` || message.content === `<@!${client.user.id}>`){
    return message.channel.send('Need help? Try `@Kit help`');
  }

  //Global variables
  const logChannel = client.channels.resolve(config.logChannel);

  //Extras
  //TODO: Fix DM compatibility
  //if(message.channel.type === "dm") return; //Return on DM
  if (message.author.bot) return; //Return on bot messages (no infinite loops)

  //Mention variables (for other instances)
  var botMention = "<@" + client.user.id + ">";
  var botMentionX = "<@!" + client.user.id + ">";

  //Database updaters
  if(message.guild){ //WIP DM compatibility (only executes in guilds)

    pool.query(`SELECT * FROM prefixes WHERE serverId ='${message.guild.id}'`).then(row => {
      row = row.rows;
      if(row){
        returnPrefix = row.prefix;
      } else {
        returnPrefix = config.prefix;
      }
    }).catch(() => {
      console.error;
    });

    pool.query(`SELECT * FROM settings WHERE serverId ='${message.guild.id}'`).then(row => {
      row = row.rows;
        if(!row){
          pool.query(`INSERT INTO settings (serverId, banId) VALUES ('${message.guild.id}', null)`);
        }
      }).catch(() => {
        console.error;
      });
  
    }

  //Command handler
  function dmCheck(){
    if(message.guild){
      return message.guild.id;
    } else {
      return 'default';
    }
  }

  pool.query(`SELECT * FROM prefixes WHERE serverId ='${dmCheck()}'`).then(row => {
    row = row.rows;
    if(row[0] === undefined){
      var customPrefix = config.prefix;
    } else {
      //console.log(row);
      var customPrefix = row[0].prefix;
    }


  if(message.guild){ //TODO: Clean this up
    if((message.content.toLowerCase().indexOf(config.prefix.toLowerCase()) !== 0) && 
        (message.content.toLowerCase().indexOf(customPrefix.toLowerCase()) !== 0) &&
          (message.content.toLowerCase().indexOf(botMention.toLowerCase()) !== 0) &&
          (message.content.toLowerCase().indexOf(botMentionX.toLowerCase()) !== 0 ))  return;
  }

  var handledPrefix;

  if(message.content.startsWith(customPrefix)){
    handledPrefix = customPrefix;
  } else if(message.content.startsWith(botMention)){
    handledPrefix = botMention;
  } else if(message.content.startsWith(botMentionX)){
    handledPrefix = botMentionX;
  } else if(message.content.startsWith(config.prefix)){
    handledPrefix = config.prefix;
  } else {
    return;
  }

  pLength = handledPrefix.length;
  args = message.content.slice(handledPrefix.length).trim().match(/[^\s"]+|"([^"]*)"/g);
  command = args.shift().toLowerCase();

  //Find command file from alias
  for (const key of Object.keys(client.aliases)) if (client.aliases[key].aliases.includes(command)) command = key;

  //Continue command loading
  try{
    commandFile = require(`./commands/${command}.js`);
  } catch(err){
    try{
      commandFile = require(`./commands-locked/${command}.js`);
    }catch(err){
      return; //return if command file doesn't exist, errors are already reported in loading stage
    }
    
  }

  //Cooldown checker
  if (cooldown.has(message.author.id)) {
    return message.channel.send(`Please don't spam commands, ${message.author}.`);
  } else {
    cooldown.add(message.author.id);
    setTimeout(() => {
      cooldown.delete(message.author.id);
    }, 1000);
  }

  //Return if the user isn't allowed to use the command - non-dm in dm or owner by non-owner
  if(commandFile.conf.OwnerOnly === true && !config.evalAllow.includes(message.author.id)) return;
  if(commandFile.conf.DM === false && !message.guild) return;
  if(client.blacklist.includes(message.author.id)) return; //blacklist handler


  //Finally, run the command
  try{
    commandFile.run(client, message, args, deletedMessage, pool, tossedSet, roles);
  }
  catch(err){
    console.error(err);
    client.logChannel.send("```js\n" + Date(Date.now()) + '\n```\n***COMMAND ERROR:***\n```js\nERR: ' + err + '\n```');
  }

  });
});

client.on("error", async error => {
  console.error(error);
  var logChannel = client.channels.resolve(config.logChannel);
  await logChannel.send("```js\n" + Date(Date.now()) + '\n```\n***ERROR:***\n```js\nLikely connection reset.\nERR: ' + error + '\n```');
});

//Login
client.login(config.token_prod);
