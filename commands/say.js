
exports.run = (client, message, args) => {
	var chan = client.channels.find('id', args[0]);
	chan.send(args.slice(1).join(' '));
}

exports.conf = {
    help: "N/A",
    format: "N/A",
    DM: true,
    OwnerOnly: true,
    alias: []
}