var NodeConf = {};

{
	NodeConf.boolExpress = true;
	
	NodeConf.intExpressPort = 80;
	
	NodeConf.strExpressSession = 'sessionMemory';
	
	NodeConf.strExpressSecret = 'MwWhle2MR1xpiiE9t5R4cnFYg';
}

{
	NodeConf.boolHypertextmin = true;
}

{
	NodeConf.boolMime = true;
}

{
	NodeConf.boolMulter = true;
}

{
	NodeConf.boolMustache = true;
}

module.exports = function() {
	return NodeConf;
};