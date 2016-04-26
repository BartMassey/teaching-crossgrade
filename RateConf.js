var RateConf = {};

{
	RateConf.strCasAuth = 'https://sso.pdx.edu/cas' // the authentication url of the used cas server
	
	RateConf.strCasVersion = '2.0' // the version of cas - please consult the documentation of the casable module for further instructions
	
	RateConf.strCasLogout = 'https://sso.pdx.edu/cas/logout' // the logout url of the used cas server
}

{	
	RateConf.strDatabaseBackups = 'daily'; // whether to store a backup of the database daily or hourly - can be left blank in order to disable backups
}

module.exports = function() {
	return RateConf;
};