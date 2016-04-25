'use strict';

var NodeConf = require(__dirname + '/NodeConf.js')();
var NodeRect = require(__dirname + '/NodeRect.js')();

var Node = NodeRect.Node;
var Aws = NodeRect.Aws;
var Express = NodeRect.Express;
var Geoip = NodeRect.Geoip;
var Hypertextmin = NodeRect.Hypertextmin;
var Mime = NodeRect.Mime;
var Multer = NodeRect.Multer;
var Mustache = NodeRect.Mustache;
var Phantom = NodeRect.Phantom;
var Postgres = NodeRect.Postgres;
var Recaptcha = NodeRect.Recaptcha;
var Socket = NodeRect.Socket;
var Xml = NodeRect.Xml;

var Casable = {
	casableHandle: null,
	
	clientHandle: null,
	
	init: function() {
		{
			var strData = Node.fsHandle.readFileSync(__dirname + '/node_modules/casable/lib/casable.js').toString();
			
			strData = strData.replace(new RegExp('auth\\[\'cas:name\'\\]\\[0\\]', 'g'), 'undefined');
			strData = strData.replace(new RegExp('auth\\[\'cas:surname\'\\]\\[0\\]', 'g'), 'undefined');
			strData = strData.replace(new RegExp('auth\\[\'cas:email\'\\]\\[0\\]', 'g'), 'undefined');
			strData = strData.replace(new RegExp('auth\\[\'cas:salt\'\\]\\[0\\]', 'g'), 'undefined');
			strData = strData.replace(new RegExp('auth\\[\'cas:passwordHash\'\\]\\[0\\]', 'g'), 'undefined');
			strData = strData.replace(new RegExp('auth\\[\'cas:group\'\\]\\[0\\]', 'g'), 'undefined');
			
			Node.fsHandle.writeFileSync(__dirname + '/node_modules/casable/lib/casable.js', strData);
		}
		
		{
			Casable.casableHandle = require('casable');
		}
		
		{
			Casable.clientHandle = Casable.casableHandle.authentication('https://sso.pdx.edu/cas', {
				'casVersion': '2.0',
				'logoutPath': 'https://sso.pdx.edu/cas/logout'
			});
		}
	},
	
	dispel: function() {
		{
			Casable.casableHandle = null;
		}
		
		{
			Casable.clientHandle = null;
		}
	},
	
	isLogin: function(requestHandle) {
		if (requestHandle.authenticatedUser === undefined) {
			return false;
			
		} else if (requestHandle.authenticatedUser === null) {
			return false;
			
		} else if (requestHandle.authenticatedUser.id === undefined) {
			return false;
			
		} else if (requestHandle.authenticatedUser.id === null) {
			return false;
			
		}
		
		return true;
	},
	
	isAdmin: function(requestHandle) {
		var objectConfig = [];
		
		{
			var strData = Node.fsHandle.readFileSync(__dirname + '/config-admins.txt').toString().split('\n');
			
			for (var intFor1 = 0; intFor1 < strData.length; intFor1 += 1) {
				var strSplit = strData[intFor1].split(';');
				
				if (strSplit.length < 1) {
					continue;
					
				} else if (strSplit[0].trim() === '') {
					continue;
					
				} else if (strSplit[0].indexOf('//') !== -1) {
					continue;
					
				}
				
				{
					objectConfig.push({
						'strName': strSplit[0].trim()
					});
				}
			}
		}
		
		{
			for (var intFor1 = 0; intFor1 < objectConfig.length; intFor1 += 1) {
				if (objectConfig[intFor1].strName === requestHandle.authenticatedUser.id) {
					return true;
				}
			}
		}
		
		return false;
	}
};
Casable.init();

var Sqlite = {
	sqliteHandle: null,
	
	clientHandle: null,
	
	init: function() {
		{
			Sqlite.sqliteHandle = require('sqlite3');
		}
		
		{
			Sqlite.clientHandle = new Sqlite.sqliteHandle.Database('database.sqlite');
		}
	},
	
	dispel: function() {
		{
			Sqlite.sqliteHandle = null;
		}
		
		{
			Sqlite.clientHandle = null;
		}
	}
};
Sqlite.init();

{
	Express.serverHandle.get('/', Casable.clientHandle, function(requestHandle, responseHandle) {
		responseHandle.status(302);
		
		responseHandle.set({
			'Location': '/index.html'
		});
		
		responseHandle.end();
	});
	
	Express.serverHandle.get('/index.html', Casable.clientHandle, function(requestHandle, responseHandle) {
		var functionPreprocess = function() {
			{
				if (Casable.isLogin(requestHandle) === false) {
					functionError();
					
					return;
				}
			}
			
			{
				if (requestHandle.query.strUser === undefined) {
					requestHandle.query.strUser = requestHandle.authenticatedUser.id;
					
				} else if (Casable.isAdmin(requestHandle) === false) {
					requestHandle.query.strUser = requestHandle.authenticatedUser.id;
					
				}
			}
			
			functionFilesystemRead();
		};
		
		var FilesystemRead_bufferHandle = null;
		
		var functionFilesystemRead = function() {
			Node.fsHandle.readFile(__dirname + '/assets/index.html', function(errorHandle, bufferHandle) {
				if (errorHandle !== null) {
					functionError();
					
					return;
				}
				
				{
					FilesystemRead_bufferHandle = bufferHandle;
				}
				
				functionSuccess();
			});
		};
		
		var functionError = function() {
			responseHandle.end();
		};
		
		var functionSuccess = function() {
			var strData = FilesystemRead_bufferHandle.toString();
			
			{
				strData = Hypertextmin.hypertextminHandle.minify(strData, {
					'removeComments': true,
					'removeCommentsFromCDATA': true,
					'removeCDATASectionsFromCDATA': false,
					'collapseWhitespace': true,
					'conservativeCollapse': true,
					'collapseBooleanAttributes': false,
					'removeAttributeQuotes': false,
					'removeRedundantAttributes': false,
					'useShortDoctype': false,
					'removeEmptyAttributes': false,
					'removeOptionalTags': false,
					'removeEmptyElements': false
				});
			}
			
			responseHandle.status(200);
			
			responseHandle.set({
				'Content-Length': Buffer.byteLength(strData, 'utf-8'),
				'Content-Type': Mime.mimeHandle.lookup('html'),
				'Content-Disposition': 'inline; filename="' + requestHandle.path.substr(requestHandle.path.lastIndexOf('/') + 1) + '";'
			});
			
			responseHandle.write(strData);
			
			responseHandle.end();
		};
		
		functionPreprocess();
	});
	
	Express.serverHandle.get('/indexFaq.html', Casable.clientHandle, function(requestHandle, responseHandle) {
		var functionPreprocess = function() {
			{
				if (Casable.isLogin(requestHandle) === false) {
					functionError();
					
					return;
				}
			}
			
			{
				if (requestHandle.query.strUser === undefined) {
					requestHandle.query.strUser = requestHandle.authenticatedUser.id;
					
				} else if (Casable.isAdmin(requestHandle) === false) {
					requestHandle.query.strUser = requestHandle.authenticatedUser.id;
					
				}
			}
			
			functionFilesystemRead();
		};
		
		var FilesystemRead_bufferHandle = null;
		
		var functionFilesystemRead = function() {
			Node.fsHandle.readFile(__dirname + '/assets/indexFaq.html', function(errorHandle, bufferHandle) {
				if (errorHandle !== null) {
					functionError();
					
					return;
				}
				
				{
					FilesystemRead_bufferHandle = bufferHandle;
				}
				
				functionSuccess();
			});
		};
		
		var functionError = function() {
			responseHandle.end();
		};
		
		var functionSuccess = function() {
			var strData = FilesystemRead_bufferHandle.toString();
			
			{
				strData = Hypertextmin.hypertextminHandle.minify(strData, {
					'removeComments': true,
					'removeCommentsFromCDATA': true,
					'removeCDATASectionsFromCDATA': false,
					'collapseWhitespace': true,
					'conservativeCollapse': true,
					'collapseBooleanAttributes': false,
					'removeAttributeQuotes': false,
					'removeRedundantAttributes': false,
					'useShortDoctype': false,
					'removeEmptyAttributes': false,
					'removeOptionalTags': false,
					'removeEmptyElements': false
				});
			}
			
			responseHandle.status(200);
			
			responseHandle.set({
				'Content-Length': Buffer.byteLength(strData, 'utf-8'),
				'Content-Type': Mime.mimeHandle.lookup('html'),
				'Content-Disposition': 'inline; filename="' + requestHandle.path.substr(requestHandle.path.lastIndexOf('/') + 1) + '";'
			});
			
			responseHandle.write(strData);
			
			responseHandle.end();
		};
		
		functionPreprocess();
	});
	
	Express.serverHandle.get('/indexMessages.html', Casable.clientHandle, function(requestHandle, responseHandle) {
		var Mustache_objectHandle = {
			'objectMain': {
				'strRandom': Node.hashbase(Node.cryptoHandle.randomBytes(64)).substr(0, 32)
			},
			'messageHandle': []
		};
		
		var functionPreprocess = function() {
			{
				if (Casable.isLogin(requestHandle) === false) {
					functionError();
					
					return;
				}
			}
			
			{
				if (requestHandle.query.strUser === undefined) {
					requestHandle.query.strUser = requestHandle.authenticatedUser.id;
					
				} else if (Casable.isAdmin(requestHandle) === false) {
					requestHandle.query.strUser = requestHandle.authenticatedUser.id;
					
				}
			}
			
			functionFilesystemRead();
		};
		
		var FilesystemRead_bufferHandle = null;
		
		var functionFilesystemRead = function() {
			Node.fsHandle.readFile(__dirname + '/assets/indexMessages.html', function(errorHandle, bufferHandle) {
				if (errorHandle !== null) {
					functionError();
					
					return;
				}
				
				{
					FilesystemRead_bufferHandle = bufferHandle;
				}
				
				functionSqliteMessage();
			});
		};
		
		var functionSqliteMessage = function() {
			Sqlite.clientHandle.serialize(function() {
				{
					var strQuery = '';
					
					strQuery += 'SELECT messageHandle.intIdent AS messageHandle_intIdent,';
					strQuery += '       messageHandle.intTimestamp AS messageHandle_intTimestamp,';
					strQuery += '       messageHandle.strTitle AS messageHandle_strTitle,';
					strQuery += '       messageHandle.strText AS messageHandle_strText';
					strQuery += '  FROM messageHandle';
					strQuery += ' ORDER BY messageHandle.intIdent DESC;';
					
					Sqlite.clientHandle.all(strQuery, function(errorHandle, rowsHandle) {
						if (errorHandle !== null) {
							return;
						}
						
						for (var intFor1 = 0; intFor1 < rowsHandle.length; intFor1 += 1) {
							var rowHandle = rowsHandle[intFor1];
							
							{
								Mustache_objectHandle.messageHandle.push(rowHandle);
							}
						}
					});
				}
				
				{
					Sqlite.clientHandle.run('', function(errorHandle) {
						functionSuccess();
					});
				}
			});
		};
		
		var functionError = function() {
			responseHandle.end();
		};
		
		var functionSuccess = function() {
			var strData = FilesystemRead_bufferHandle.toString();
			
			{
				strData = Mustache.mustacheHandle.render(strData, Mustache_objectHandle);
				
				strData = Mustache.mustacheHandle.render(strData, Mustache_objectHandle);
			}
			
			{
				strData = Hypertextmin.hypertextminHandle.minify(strData, {
					'removeComments': true,
					'removeCommentsFromCDATA': true,
					'removeCDATASectionsFromCDATA': false,
					'collapseWhitespace': true,
					'conservativeCollapse': true,
					'collapseBooleanAttributes': false,
					'removeAttributeQuotes': false,
					'removeRedundantAttributes': false,
					'useShortDoctype': false,
					'removeEmptyAttributes': false,
					'removeOptionalTags': false,
					'removeEmptyElements': false
				});
			}
			
			responseHandle.status(200);
			
			responseHandle.set({
				'Content-Length': Buffer.byteLength(strData, 'utf-8'),
				'Content-Type': Mime.mimeHandle.lookup('html'),
				'Content-Disposition': 'inline; filename="' + requestHandle.path.substr(requestHandle.path.lastIndexOf('/') + 1) + '";'
			});
			
			responseHandle.write(strData);
			
			responseHandle.end();
		};
		
		functionPreprocess();
	});
	
	Express.serverHandle.get('/indexSubmissions.html', Casable.clientHandle, function(requestHandle, responseHandle) {
		var Mustache_objectHandle = {
			'objectMain': {
				'strRandom': Node.hashbase(Node.cryptoHandle.randomBytes(64)).substr(0, 32)
			},
			'assignmentHandle': []
		};
		
		var functionPreprocess = function() {
			{
				if (Casable.isLogin(requestHandle) === false) {
					functionError();
					
					return;
				}
			}
			
			{
				if (requestHandle.query.strUser === undefined) {
					requestHandle.query.strUser = requestHandle.authenticatedUser.id;
					
				} else if (Casable.isAdmin(requestHandle) === false) {
					requestHandle.query.strUser = requestHandle.authenticatedUser.id;
					
				}
			}
			
			functionFilesystemRead();
		};
		
		var FilesystemRead_bufferHandle = null;
		
		var functionFilesystemRead = function() {
			Node.fsHandle.readFile(__dirname + '/assets/indexSubmissions.html', function(errorHandle, bufferHandle) {
				if (errorHandle !== null) {
					functionError();
					
					return;
				}
				
				{
					FilesystemRead_bufferHandle = bufferHandle;
				}
				
				functionSqliteSubmission();
			});
		};
		
		var functionSqliteSubmission = function() {
			Sqlite.clientHandle.serialize(function() {
				{
					var strQuery = '';

					strQuery += 'SELECT submissionHandle.intIdent AS submissionHandle_intIdent,';
					strQuery += '       submissionHandle.intTimestamp AS submissionHandle_intTimestamp,';
					strQuery += '       submissionHandle.intAssignment AS submissionHandle_intAssignment,';
					strQuery += '       submissionHandle.intStudent AS submissionHandle_intStudent,';
					strQuery += '       submissionHandle.strFile AS submissionHandle_strFile,';
					strQuery += '       submissionHandle.intExtension AS submissionHandle_intExtension,';
					strQuery += '       assignmentHandle.intIdent AS assignmentHandle_intIdent,';
					strQuery += '       assignmentHandle.intTimestamp AS assignmentHandle_intTimestamp,';
					strQuery += '       assignmentHandle.strName AS assignmentHandle_strName,';
					strQuery += '       assignmentHandle.intSubmit AS assignmentHandle_intSubmit,';
					strQuery += '       assignmentHandle.intEvaluate AS assignmentHandle_intEvaluate,';
					strQuery += '       studentHandle.intIdent AS studentHandle_intIdent,';
					strQuery += '       studentHandle.intTimestamp AS studentHandle_intTimestamp,';
					strQuery += '       studentHandle.strName AS studentHandle_strName,';
					strQuery += '       studentHandle.strMail AS studentHandle_strMail';
					strQuery += '  FROM submissionHandle,';
					strQuery += '       assignmentHandle,';
					strQuery += '       studentHandle';
					strQuery += ' WHERE submissionHandle.intAssignment = assignmentHandle.intIdent';
					strQuery += '   AND submissionHandle.intStudent = studentHandle.intIdent';
					strQuery += '   AND :intTimestamp > assignmentHandle.intTimestamp';
					strQuery += '   AND studentHandle.strName = :studentHandle_strName';
					strQuery += ' ORDER BY assignmentHandle.intIdent DESC;';
		
					Sqlite.clientHandle.all(strQuery, {
						':intTimestamp': new Date().getTime() / 1000,
						':studentHandle_strName': requestHandle.query.strUser
					}, function(errorHandle, rowsHandle) {
						if (errorHandle !== null) {
							return;
						}
						
						for (var intFor1 = 0; intFor1 < rowsHandle.length; intFor1 += 1) {
							var rowHandle = rowsHandle[intFor1];
							
							{
								Mustache_objectHandle.assignmentHandle.push(rowHandle);
							}
						}
					});
				}
				
				{
					Sqlite.clientHandle.run('', function(errorHandle) {
						functionSuccess();
					});
				}
			});
		};
		
		var functionError = function() {
			responseHandle.end();
		};
		
		var functionSuccess = function() {
			var strData = FilesystemRead_bufferHandle.toString();
			
			{
				strData = Mustache.mustacheHandle.render(strData, Mustache_objectHandle);
				
				strData = Mustache.mustacheHandle.render(strData, Mustache_objectHandle);
			}
			
			{
				strData = Hypertextmin.hypertextminHandle.minify(strData, {
					'removeComments': true,
					'removeCommentsFromCDATA': true,
					'removeCDATASectionsFromCDATA': false,
					'collapseWhitespace': true,
					'conservativeCollapse': true,
					'collapseBooleanAttributes': false,
					'removeAttributeQuotes': false,
					'removeRedundantAttributes': false,
					'useShortDoctype': false,
					'removeEmptyAttributes': false,
					'removeOptionalTags': false,
					'removeEmptyElements': false
				});
			}
			
			responseHandle.status(200);
			
			responseHandle.set({
				'Content-Length': Buffer.byteLength(strData, 'utf-8'),
				'Content-Type': Mime.mimeHandle.lookup('html'),
				'Content-Disposition': 'inline; filename="' + requestHandle.path.substr(requestHandle.path.lastIndexOf('/') + 1) + '";'
			});
			
			responseHandle.write(strData);
			
			responseHandle.end();
		};
		
		functionPreprocess();
	});
	
	Express.serverHandle.post('/indexSubmissions_strFile.xml', Casable.clientHandle, Multer.multerHandle.single('fileHandle'), function(requestHandle, responseHandle) {
		var functionPreprocess = function() {
			{
				if (Casable.isLogin(requestHandle) === false) {
					functionError();
					
					return;
				}
			}
			
			{
				if (requestHandle.query.strUser === undefined) {
					requestHandle.query.strUser = requestHandle.authenticatedUser.id;
					
				} else if (Casable.isAdmin(requestHandle) === false) {
					requestHandle.query.strUser = requestHandle.authenticatedUser.id;
					
				}
			}
			
			{
				if (requestHandle.query.intSubmission === undefined) {
					functionError();
					
					return;
				}
			}
			
			{
				requestHandle.query.intSubmission = parseInt(requestHandle.query.intSubmission, 10);
				
				if (isNaN(requestHandle.query.intSubmission) === true) {
					functionError();
					
					return;
					
				} else if (requestHandle.query.intSubmission < 1) {
					functionError();
					
					return;
					
				} else if (requestHandle.query.intSubmission > 32768) {
					functionError();
					
					return;
					
				}
			}
			
			functionFilesystemMove();
		};
		
		var FilesystemMove_strName = '';
		
		var functionFilesystemMove = function() {
			{
				FilesystemMove_strName += requestHandle.query.intSubmission;
				FilesystemMove_strName += ' - ';
				FilesystemMove_strName += new Date().getTime();
				FilesystemMove_strName += ' - ';
				FilesystemMove_strName += Node.hashbase(Node.cryptoHandle.randomBytes(64)).substr(0, 8);
				
				if (requestHandle.file.path.indexOf('.') !== -1) {
					FilesystemMove_strName += '.';
					FilesystemMove_strName += requestHandle.file.path.split('.').pop();
				}
			}
			
			{
				Node.fsHandle.readFile(requestHandle.file.path , function(errorHandle, bufferHandle) {
					if (errorHandle !== null) {
						functionError();
						
						return;
					}

					{
						Node.fsHandle.writeFile(__dirname + '/submission/' + FilesystemMove_strName, bufferHandle, function(errorHandle) {
							if (errorHandle !== null) {
								functionError();
								
								return;
							}

							{
								Node.fsHandle.unlink(requestHandle.file.path, function() {
									if (errorHandle !== null) {
										functionError();
										
										return;
									}

									functionSqliteValidate();
						        });
							}
					    });
					}
				}); 
			}
		};
		
		var functionSqliteValidate = function() {
			Sqlite.clientHandle.serialize(function() {
				{
					var strQuery = '';
					
					strQuery += 'SELECT submissionHandle.intIdent AS submissionHandle_intIdent,';
					strQuery += '       submissionHandle.intTimestamp AS submissionHandle_intTimestamp,';
					strQuery += '       submissionHandle.intAssignment AS submissionHandle_intAssignment,';
					strQuery += '       submissionHandle.intStudent AS submissionHandle_intStudent,';
					strQuery += '       submissionHandle.strFile AS submissionHandle_strFile,';
					strQuery += '       submissionHandle.intExtension AS submissionHandle_intExtension,';
					strQuery += '       assignmentHandle.intIdent AS assignmentHandle_intIdent,';
					strQuery += '       assignmentHandle.intTimestamp AS assignmentHandle_intTimestamp,';
					strQuery += '       assignmentHandle.strName AS assignmentHandle_strName,';
					strQuery += '       assignmentHandle.intSubmit AS assignmentHandle_intSubmit,';
					strQuery += '       assignmentHandle.intEvaluate AS assignmentHandle_intEvaluate,';
					strQuery += '       studentHandle.intIdent AS studentHandle_intIdent,';
					strQuery += '       studentHandle.intTimestamp AS studentHandle_intTimestamp,';
					strQuery += '       studentHandle.strName AS studentHandle_strName,';
					strQuery += '       studentHandle.strMail AS studentHandle_strMail';
					strQuery += '  FROM submissionHandle,';
					strQuery += '       assignmentHandle,';
					strQuery += '       studentHandle';
					strQuery += ' WHERE submissionHandle.intAssignment = assignmentHandle.intIdent';
					strQuery += '   AND submissionHandle.intStudent = studentHandle.intIdent';
					strQuery += '   AND max(assignmentHandle.intSubmit, submissionHandle.intExtension) > :intTimestamp';
					strQuery += '   AND submissionHandle.intIdent = :submissionHandle_intIdent';
					strQuery += '   AND studentHandle.strName = :studentHandle_strName;';
					
					Sqlite.clientHandle.get(strQuery, {
						':intTimestamp': new Date().getTime() / 1000,
						':submissionHandle_intIdent': requestHandle.query.intSubmission,
						':studentHandle_strName': requestHandle.query.strUser
					}, function(errorHandle, rowHandle) {
						if (errorHandle !== null) {
							return;
						}
						
						{
							if (rowHandle === undefined) {
								functionError();

								return;
							
							} else if (rowHandle.length === 0) {
								functionError();

								return;
								
							}
						}
						
						functionSqliteSubmission();
					});
				}
			});
		};

		var functionSqliteSubmission = function() {
			Sqlite.clientHandle.serialize(function() {
				{
					var strQuery = '';
					
					strQuery += 'UPDATE submissionHandle';
					strQuery += '   SET strFile = :submissionHandle_strFile';
					strQuery += ' WHERE submissionHandle.intIdent = :submissionHandle_intIdent';
					strQuery += '   AND submissionHandle.intStudent IN (';
					strQuery += '           SELECT studentHandle.intIdent AS studentHandle_intIdent';
					strQuery += '             FROM studentHandle';
					strQuery += '            WHERE studentHandle.strName = :studentHandle_strName';
					strQuery += '       );';
		
					Sqlite.clientHandle.run(strQuery, {
						':submissionHandle_strFile': FilesystemMove_strName,
						':submissionHandle_intIdent': requestHandle.query.intSubmission,
						':studentHandle_strName': requestHandle.query.strUser
					}, function(errorHandle) {
						if (errorHandle !== null) {
							functionError();
							
							return;
						}
						
						functionSuccess();
					});
				}
			});
		};
		
		var functionError = function() {
			var strData = '';
			
			strData += '<?xml version="1.0" encoding="UTF-8" ?>';
			strData += '<xml>';
				strData += '<strResponse>' + 'responseError' + '</strResponse>';
			strData += '</xml>';
			
			responseHandle.status(200);
			
			responseHandle.set({
				'Content-Length': Buffer.byteLength(strData, 'utf-8'),
				'Content-Type': Mime.mimeHandle.lookup('xml'),
				'Content-Disposition': 'inline; filename="' + requestHandle.path.substr(requestHandle.path.lastIndexOf('/') + 1) + '";'
			});
			
			responseHandle.write(strData);
			
			responseHandle.end();
		};
		
		var functionSuccess = function() {
			var strData = '';
			
			strData += '<?xml version="1.0" encoding="UTF-8" ?>';
			strData += '<xml>';
				strData += '<strResponse>' + 'responseSuccess' + '</strResponse>';
			strData += '</xml>';
			
			responseHandle.status(200);
			
			responseHandle.set({
				'Content-Length': Buffer.byteLength(strData, 'utf-8'),
				'Content-Type': Mime.mimeHandle.lookup('xml'),
				'Content-Disposition': 'inline; filename="' + requestHandle.path.substr(requestHandle.path.lastIndexOf('/') + 1) + '";'
			});
			
			responseHandle.write(strData);
			
			responseHandle.end();
		};
		
		functionPreprocess();
	});
	
	Express.serverHandle.get('/indexEvaluations.html', Casable.clientHandle, function(requestHandle, responseHandle) {
		var Mustache_objectHandle = {
			'objectMain': {
				'strRandom': Node.hashbase(Node.cryptoHandle.randomBytes(64)).substr(0, 32)
			},
			'assignmentHandle': []
		};
		
		var functionPreprocess = function() {
			{
				if (Casable.isLogin(requestHandle) === false) {
					functionError();
					
					return;
				}
			}
			
			{
				if (requestHandle.query.strUser === undefined) {
					requestHandle.query.strUser = requestHandle.authenticatedUser.id;
					
				} else if (Casable.isAdmin(requestHandle) === false) {
					requestHandle.query.strUser = requestHandle.authenticatedUser.id;
					
				}
			}
			
			functionFilesystemRead();
		};
		
		var FilesystemRead_bufferHandle = null;
		
		var functionFilesystemRead = function() {
			Node.fsHandle.readFile(__dirname + '/assets/indexEvaluations.html', function(errorHandle, bufferHandle) {
				if (errorHandle !== null) {
					functionError();
					
					return;
				}
				
				{
					FilesystemRead_bufferHandle = bufferHandle;
				}
				
				functionSqliteEvaluation();
			});
		};
		
		var functionSqliteEvaluation = function() {
			Sqlite.clientHandle.serialize(function() {
				{
					var strQuery = '';

					strQuery += 'SELECT evaluationHandle.intIdent AS evaluationHandle_intIdent,';
					strQuery += '       evaluationHandle.intTimestamp AS evaluationHandle_intTimestamp,';
					strQuery += '       evaluationHandle.intSubmission AS evaluationHandle_intSubmission,';
					strQuery += '       evaluationHandle.intStudent AS evaluationHandle_intStudent,';
					strQuery += '       evaluationHandle.intPoints AS evaluationHandle_intPoints,';
					strQuery += '       evaluationHandle.strFile AS evaluationHandle_strFile,';
					strQuery += '       evaluationHandle.intExtension AS evaluationHandle_intExtension,';
					strQuery += '       submissionHandle.intIdent AS submissionHandle_intIdent,';
					strQuery += '       submissionHandle.intTimestamp AS submissionHandle_intTimestamp,';
					strQuery += '       submissionHandle.intAssignment AS submissionHandle_intAssignment,';
					strQuery += '       submissionHandle.intStudent AS submissionHandle_intStudent,';
					strQuery += '       submissionHandle.strFile AS submissionHandle_strFile,';
					strQuery += '       submissionHandle.intExtension AS submissionHandle_intExtension,';
					strQuery += '       assignmentHandle.intIdent AS assignmentHandle_intIdent,';
					strQuery += '       assignmentHandle.intTimestamp AS assignmentHandle_intTimestamp,';
					strQuery += '       assignmentHandle.strName AS assignmentHandle_strName,';
					strQuery += '       assignmentHandle.intSubmit AS assignmentHandle_intSubmit,';
					strQuery += '       assignmentHandle.intEvaluate AS assignmentHandle_intEvaluate,';
					strQuery += '       studentHandle.intIdent AS studentHandle_intIdent,';
					strQuery += '       studentHandle.intTimestamp AS studentHandle_intTimestamp,';
					strQuery += '       studentHandle.strName AS studentHandle_strName,';
					strQuery += '       studentHandle.strMail AS studentHandle_strMail';
					strQuery += '  FROM evaluationHandle,';
					strQuery += '       submissionHandle,';
					strQuery += '       assignmentHandle,';
					strQuery += '       studentHandle';
					strQuery += ' WHERE evaluationHandle.intSubmission = submissionHandle.intIdent';
					strQuery += '   AND evaluationHandle.intStudent = studentHandle.intIdent';
					strQuery += '   AND submissionHandle.intAssignment = assignmentHandle.intIdent';
					strQuery += '   AND assignmentHandle.intSubmit < :intTimestamp';
					strQuery += '   AND studentHandle.strName = :studentHandle_strName';
					strQuery += ' ORDER BY assignmentHandle.intIdent DESC;';
					
					Sqlite.clientHandle.all(strQuery, {
						':intTimestamp': new Date().getTime() / 1000,
						':studentHandle_strName': requestHandle.query.strUser
					}, function(errorHandle, rowsHandle) {
						if (errorHandle !== null) {
							return;
						}
						
						for (var intFor1 = 0; intFor1 < rowsHandle.length; intFor1 += 1) {
							var rowHandle = rowsHandle[intFor1];

							{
								var intSearch = -1;
								
								for (var intFor2 = 0; intFor2 < Mustache_objectHandle.assignmentHandle.length; intFor2 += 1) {
									if (Mustache_objectHandle.assignmentHandle[intFor2].assignmentHandle_intIdent === rowHandle.assignmentHandle_intIdent) {
										intSearch = intFor2;
										
										break;
									}
								}
								
								if (intSearch === -1) {
									Mustache_objectHandle.assignmentHandle.push(rowHandle);

									Mustache_objectHandle.assignmentHandle[Mustache_objectHandle.assignmentHandle.length - 1].evaluationOutgoing = [];
									Mustache_objectHandle.assignmentHandle[Mustache_objectHandle.assignmentHandle.length - 1].evaluationIncoming = [];
								}
							}
							
							{
								var intSearch = -1;
								
								for (var intFor2 = 0; intFor2 < Mustache_objectHandle.assignmentHandle.length; intFor2 += 1) {
									if (Mustache_objectHandle.assignmentHandle[intFor2].assignmentHandle_intIdent === rowHandle.assignmentHandle_intIdent) {
										intSearch = intFor2;
										
										break;
									}
								}
								
								if (intSearch !== -1) {
									Mustache_objectHandle.assignmentHandle[intSearch].evaluationOutgoing.push(rowHandle);
								}
							}
						}
					});
				}
				
				{
					var strQuery = '';

					strQuery += 'SELECT evaluationHandle.intIdent AS evaluationHandle_intIdent,';
					strQuery += '       evaluationHandle.intTimestamp AS evaluationHandle_intTimestamp,';
					strQuery += '       evaluationHandle.intSubmission AS evaluationHandle_intSubmission,';
					strQuery += '       evaluationHandle.intStudent AS evaluationHandle_intStudent,';
					strQuery += '       evaluationHandle.intPoints AS evaluationHandle_intPoints,';
					strQuery += '       evaluationHandle.strFile AS evaluationHandle_strFile,';
					strQuery += '       evaluationHandle.intExtension AS evaluationHandle_intExtension,';
					strQuery += '       submissionHandle.intIdent AS submissionHandle_intIdent,';
					strQuery += '       submissionHandle.intTimestamp AS submissionHandle_intTimestamp,';
					strQuery += '       submissionHandle.intAssignment AS submissionHandle_intAssignment,';
					strQuery += '       submissionHandle.intStudent AS submissionHandle_intStudent,';
					strQuery += '       submissionHandle.strFile AS submissionHandle_strFile,';
					strQuery += '       submissionHandle.intExtension AS submissionHandle_intExtension,';
					strQuery += '       assignmentHandle.intIdent AS assignmentHandle_intIdent,';
					strQuery += '       assignmentHandle.intTimestamp AS assignmentHandle_intTimestamp,';
					strQuery += '       assignmentHandle.strName AS assignmentHandle_strName,';
					strQuery += '       assignmentHandle.intSubmit AS assignmentHandle_intSubmit,';
					strQuery += '       assignmentHandle.intEvaluate AS assignmentHandle_intEvaluate,';
					strQuery += '       studentHandle.intIdent AS studentHandle_intIdent,';
					strQuery += '       studentHandle.intTimestamp AS studentHandle_intTimestamp,';
					strQuery += '       studentHandle.strName AS studentHandle_strName,';
					strQuery += '       studentHandle.strMail AS studentHandle_strMail';
					strQuery += '  FROM evaluationHandle,';
					strQuery += '       submissionHandle,';
					strQuery += '       assignmentHandle,';
					strQuery += '       studentHandle';
					strQuery += ' WHERE evaluationHandle.intSubmission = submissionHandle.intIdent';
					strQuery += '   AND submissionHandle.intAssignment = assignmentHandle.intIdent';
					strQuery += '   AND submissionHandle.intStudent = studentHandle.intIdent';
					strQuery += '   AND max(assignmentHandle.intEvaluate, evaluationHandle.intExtension) < :intTimestamp';
					strQuery += '   AND studentHandle.strName = :studentHandle_strName';
					strQuery += ' ORDER BY assignmentHandle.intIdent DESC;';
		
					Sqlite.clientHandle.all(strQuery, {
						':intTimestamp': new Date().getTime() / 1000,
						':studentHandle_strName': requestHandle.query.strUser
					}, function(errorHandle, rowsHandle) {
						if (errorHandle !== null) {
							return;
						}
						
						for (var intFor1 = 0; intFor1 < rowsHandle.length; intFor1 += 1) {
							var rowHandle = rowsHandle[intFor1];
							
							{
								var intSearch = -1;
								
								for (var intFor2 = 0; intFor2 < Mustache_objectHandle.assignmentHandle.length; intFor2 += 1) {
									if (Mustache_objectHandle.assignmentHandle[intFor2].assignmentHandle_intIdent === rowHandle.assignmentHandle_intIdent) {
										intSearch = intFor2;
										
										break;
									}
								}

								if (intSearch !== -1) {
									Mustache_objectHandle.assignmentHandle[intSearch].evaluationIncoming.push(rowHandle);
								}
							}
						}
					});
				}
				
				{
					var strQuery = '';

					strQuery += 'SELECT submissionHandle.intIdent AS submissionHandle_intIdent,';
					strQuery += '       submissionHandle.intTimestamp AS submissionHandle_intTimestamp,';
					strQuery += '       submissionHandle.intAssignment AS submissionHandle_intAssignment,';
					strQuery += '       submissionHandle.intStudent AS submissionHandle_intStudent,';
					strQuery += '       submissionHandle.strFile AS submissionHandle_strFile,';
					strQuery += '       submissionHandle.intExtension AS submissionHandle_intExtension,';
					strQuery += '       assignmentHandle.intIdent AS assignmentHandle_intIdent,';
					strQuery += '       assignmentHandle.intTimestamp AS assignmentHandle_intTimestamp,';
					strQuery += '       assignmentHandle.strName AS assignmentHandle_strName,';
					strQuery += '       assignmentHandle.intSubmit AS assignmentHandle_intSubmit,';
					strQuery += '       assignmentHandle.intEvaluate AS assignmentHandle_intEvaluate,';
					strQuery += '       studentHandle.intIdent AS studentHandle_intIdent,';
					strQuery += '       studentHandle.intTimestamp AS studentHandle_intTimestamp,';
					strQuery += '       studentHandle.strName AS studentHandle_strName,';
					strQuery += '       studentHandle.strMail AS studentHandle_strMail';
					strQuery += '  FROM submissionHandle,';
					strQuery += '       assignmentHandle,';
					strQuery += '       studentHandle';
					strQuery += ' WHERE submissionHandle.intAssignment = assignmentHandle.intIdent';
					strQuery += '   AND submissionHandle.intStudent = studentHandle.intIdent';
					strQuery += '   AND submissionHandle.strFile == :submissionHandle_strFile';
					strQuery += '   AND studentHandle.strName = :studentHandle_strName';
					strQuery += ' ORDER BY assignmentHandle.intIdent DESC;';
		
					Sqlite.clientHandle.all(strQuery, {
						':submissionHandle_strFile': 'Unknown',
						':studentHandle_strName': requestHandle.query.strUser
					}, function(errorHandle, rowsHandle) {
						if (errorHandle !== null) {
							return;
						}
						
						for (var intFor1 = 0; intFor1 < rowsHandle.length; intFor1 += 1) {
							var rowHandle = rowsHandle[intFor1];
							
							{
								var intSearch = -1;
								
								for (var intFor2 = 0; intFor2 < Mustache_objectHandle.assignmentHandle.length; intFor2 += 1) {
									if (Mustache_objectHandle.assignmentHandle[intFor2].assignmentHandle_intIdent === rowHandle.assignmentHandle_intIdent) {
										intSearch = intFor2;
										
										break;
									}
								}
								
								if (intSearch !== -1) {
									// Mustache_objectHandle.assignmentHandle[intSearch].evaluationOutgoing = [];
									// Mustache_objectHandle.assignmentHandle[intSearch].evaluationIncoming = [];
								}
							}
						}
					});
				}
				
				{
					Sqlite.clientHandle.run('', function(errorHandle) {
						functionSuccess();
					});
				}
			});
		};
		
		var functionError = function() {
			responseHandle.end();
		};
		
		var functionSuccess = function() {
			var strData = FilesystemRead_bufferHandle.toString();
			
			{
				strData = Mustache.mustacheHandle.render(strData, Mustache_objectHandle);
				
				strData = Mustache.mustacheHandle.render(strData, Mustache_objectHandle);
			}
			
			{
				strData = Hypertextmin.hypertextminHandle.minify(strData, {
					'removeComments': true,
					'removeCommentsFromCDATA': true,
					'removeCDATASectionsFromCDATA': false,
					'collapseWhitespace': true,
					'conservativeCollapse': true,
					'collapseBooleanAttributes': false,
					'removeAttributeQuotes': false,
					'removeRedundantAttributes': false,
					'useShortDoctype': false,
					'removeEmptyAttributes': false,
					'removeOptionalTags': false,
					'removeEmptyElements': false
				});
			}
			
			responseHandle.status(200);
			
			responseHandle.set({
				'Content-Length': Buffer.byteLength(strData, 'utf-8'),
				'Content-Type': Mime.mimeHandle.lookup('html'),
				'Content-Disposition': 'inline; filename="' + requestHandle.path.substr(requestHandle.path.lastIndexOf('/') + 1) + '";'
			});
			
			responseHandle.write(strData);
			
			responseHandle.end();
		};
		
		functionPreprocess();
	});
	
	Express.serverHandle.post('/indexEvaluations_intPoints.xml', Casable.clientHandle, function(requestHandle, responseHandle) {
		var functionPreprocess = function() {
			{
				if (Casable.isLogin(requestHandle) === false) {
					functionError();
					
					return;
				}
			}
			
			{
				if (requestHandle.query.strUser === undefined) {
					requestHandle.query.strUser = requestHandle.authenticatedUser.id;
					
				} else if (Casable.isAdmin(requestHandle) === false) {
					requestHandle.query.strUser = requestHandle.authenticatedUser.id;
					
				}
			}
			
			{
				if (requestHandle.query.intEvaluation === undefined) {
					functionError();
					
					return;
					
				} else if (requestHandle.query.intPoints === undefined) {
					functionError();
					
					return;
					
				}
			}
			
			{
				requestHandle.query.intEvaluation = parseInt(requestHandle.query.intEvaluation, 10);
				
				if (isNaN(requestHandle.query.intEvaluation) === true) {
					functionError();
					
					return;
					
				} else if (requestHandle.query.intEvaluation < 1) {
					functionError();
					
					return;
					
				} else if (requestHandle.query.intEvaluation > 32768) {
					functionError();
					
					return;
					
				}
			}
			
			{
				requestHandle.query.intPoints = parseInt(requestHandle.query.intPoints, 10);
				
				if (isNaN(requestHandle.query.intPoints) === true) {
					functionError();
					
					return;
					
				} else if (requestHandle.query.intPoints < 1) {
					functionError();
					
					return;
					
				} else if (requestHandle.query.intPoints > 10) {
					functionError();
					
					return;
					
				}
			}
			
			functionSqliteValidate();
		};
		
		var functionSqliteValidate = function() {
			Sqlite.clientHandle.serialize(function() {
				{
					var strQuery = '';
					
					strQuery += 'SELECT evaluationHandle.intIdent AS evaluationHandle_intIdent,';
					strQuery += '       evaluationHandle.intTimestamp AS evaluationHandle_intTimestamp,';
					strQuery += '       evaluationHandle.intSubmission AS evaluationHandle_intSubmission,';
					strQuery += '       evaluationHandle.intStudent AS evaluationHandle_intStudent,';
					strQuery += '       evaluationHandle.intPoints AS evaluationHandle_intPoints,';
					strQuery += '       evaluationHandle.strFile AS evaluationHandle_strFile,';
					strQuery += '       evaluationHandle.intExtension AS evaluationHandle_intExtension,';
					strQuery += '       submissionHandle.intIdent AS submissionHandle_intIdent,';
					strQuery += '       submissionHandle.intTimestamp AS submissionHandle_intTimestamp,';
					strQuery += '       submissionHandle.intAssignment AS submissionHandle_intAssignment,';
					strQuery += '       submissionHandle.intStudent AS submissionHandle_intStudent,';
					strQuery += '       submissionHandle.strFile AS submissionHandle_strFile,';
					strQuery += '       submissionHandle.intExtension AS submissionHandle_intExtension,';
					strQuery += '       assignmentHandle.intIdent AS assignmentHandle_intIdent,';
					strQuery += '       assignmentHandle.intTimestamp AS assignmentHandle_intTimestamp,';
					strQuery += '       assignmentHandle.strName AS assignmentHandle_strName,';
					strQuery += '       assignmentHandle.intSubmit AS assignmentHandle_intSubmit,';
					strQuery += '       assignmentHandle.intEvaluate AS assignmentHandle_intEvaluate,';
					strQuery += '       studentHandle.intIdent AS studentHandle_intIdent,';
					strQuery += '       studentHandle.intTimestamp AS studentHandle_intTimestamp,';
					strQuery += '       studentHandle.strName AS studentHandle_strName,';
					strQuery += '       studentHandle.strMail AS studentHandle_strMail';
					strQuery += '  FROM evaluationHandle,';
					strQuery += '       submissionHandle,';
					strQuery += '       assignmentHandle,';
					strQuery += '       studentHandle';
					strQuery += ' WHERE evaluationHandle.intSubmission = submissionHandle.intIdent';
					strQuery += '   AND submissionHandle.intAssignment = assignmentHandle.intIdent';
					strQuery += '   AND evaluationHandle.intStudent = studentHandle.intIdent';
					strQuery += '   AND max(assignmentHandle.intEvaluate, evaluationHandle.intExtension) > :intTimestamp';
					strQuery += '   AND evaluationHandle.intIdent = :evaluationHandle_intIdent';
					strQuery += '   AND studentHandle.strName = :studentHandle_strName;';
					
					Sqlite.clientHandle.get(strQuery, {
						':intTimestamp': new Date().getTime() / 1000,
						':evaluationHandle_intIdent': requestHandle.query.intEvaluation,
						':studentHandle_strName': requestHandle.query.strUser
					}, function(errorHandle, rowHandle) {
						if (errorHandle !== null) {
							return;
						}
						
						{
							if (rowHandle === undefined) {
								functionError();

								return;
							
							} else if (rowHandle.length === 0) {
								functionError();

								return;
								
							}
						}
						
						functionSqliteEvaluation();
					});
				}
			});
		};

		var functionSqliteEvaluation = function() {
			Sqlite.clientHandle.serialize(function() {
				{
					var strQuery = '';
					
					strQuery += 'UPDATE evaluationHandle';
					strQuery += '   SET intPoints = :evaluationHandle_intPoints';
					strQuery += ' WHERE evaluationHandle.intIdent = :evaluationHandle_intIdent';
					strQuery += '   AND evaluationHandle.intStudent IN (';
					strQuery += '           SELECT studentHandle.intIdent AS studentHandle_intIdent';
					strQuery += '             FROM studentHandle';
					strQuery += '            WHERE studentHandle.strName = :studentHandle_strName';
					strQuery += '       );';
		
					Sqlite.clientHandle.run(strQuery, {
						':evaluationHandle_intPoints': requestHandle.query.intPoints,
						':evaluationHandle_intIdent': requestHandle.query.intEvaluation,
						':studentHandle_strName': requestHandle.query.strUser
					}, function(errorHandle) {
						if (errorHandle !== null) {
							functionError();
							
							return;
						}
						
						functionSuccess();
					});
				}
			});
		};
		
		var functionError = function() {
			var strData = '';
			
			strData += '<?xml version="1.0" encoding="UTF-8" ?>';
			strData += '<xml>';
				strData += '<strResponse>' + 'responseError' + '</strResponse>';
			strData += '</xml>';
			
			responseHandle.status(200);
			
			responseHandle.set({
				'Content-Length': Buffer.byteLength(strData, 'utf-8'),
				'Content-Type': Mime.mimeHandle.lookup('xml'),
				'Content-Disposition': 'inline; filename="' + requestHandle.path.substr(requestHandle.path.lastIndexOf('/') + 1) + '";'
			});
			
			responseHandle.write(strData);
			
			responseHandle.end();
		};
		
		var functionSuccess = function() {
			var strData = '';
			
			strData += '<?xml version="1.0" encoding="UTF-8" ?>';
			strData += '<xml>';
				strData += '<strResponse>' + 'responseSuccess' + '</strResponse>';
			strData += '</xml>';
			
			responseHandle.status(200);
			
			responseHandle.set({
				'Content-Length': Buffer.byteLength(strData, 'utf-8'),
				'Content-Type': Mime.mimeHandle.lookup('xml'),
				'Content-Disposition': 'inline; filename="' + requestHandle.path.substr(requestHandle.path.lastIndexOf('/') + 1) + '";'
			});
			
			responseHandle.write(strData);
			
			responseHandle.end();
		};
		
		functionPreprocess();
	});
	
	Express.serverHandle.post('/indexEvaluations_strFile.xml', Casable.clientHandle, Multer.multerHandle.single('fileHandle'), function(requestHandle, responseHandle) {
		var functionPreprocess = function() {
			{
				if (Casable.isLogin(requestHandle) === false) {
					functionError();
					
					return;
				}
			}
			
			{
				if (requestHandle.query.strUser === undefined) {
					requestHandle.query.strUser = requestHandle.authenticatedUser.id;
					
				} else if (Casable.isAdmin(requestHandle) === false) {
					requestHandle.query.strUser = requestHandle.authenticatedUser.id;
					
				}
			}
			
			{
				if (requestHandle.query.intEvaluation === undefined) {
					functionError();
					
					return;
				}
			}
			
			{
				requestHandle.query.intEvaluation = parseInt(requestHandle.query.intEvaluation, 10);
				
				if (isNaN(requestHandle.query.intEvaluation) === true) {
					functionError();
					
					return;
					
				} else if (requestHandle.query.intEvaluation < 1) {
					functionError();
					
					return;
					
				} else if (requestHandle.query.intEvaluation > 32768) {
					functionError();
					
					return;
					
				}
			}
			
			functionFilesystemMove();
		};
		
		var FilesystemMove_strName = '';
		
		var functionFilesystemMove = function() {
			{
				FilesystemMove_strName += requestHandle.query.intEvaluation;
				FilesystemMove_strName += ' - ';
				FilesystemMove_strName += new Date().getTime();
				FilesystemMove_strName += ' - ';
				FilesystemMove_strName += Node.hashbase(Node.cryptoHandle.randomBytes(64)).substr(0, 8);
				
				if (requestHandle.file.path.indexOf('.') !== -1) {
					FilesystemMove_strName += '.';
					FilesystemMove_strName += requestHandle.file.path.split('.').pop();
				}
			}
			
			{
				Node.fsHandle.readFile(requestHandle.file.path , function(errorHandle, bufferHandle) {
					if (errorHandle !== null) {
						functionError();
						
						return;
					}

					{
						Node.fsHandle.writeFile(__dirname + '/evaluation/' + FilesystemMove_strName, bufferHandle, function(errorHandle) {
							if (errorHandle !== null) {
								functionError();
								
								return;
							}

							{
								Node.fsHandle.unlink(requestHandle.file.path, function() {
									if (errorHandle !== null) {
										functionError();
										
										return;
									}

									functionSqliteValidate();
						        });
							}
					    });
					}
				}); 
			}
		};
		
		var functionSqliteValidate = function() {
			Sqlite.clientHandle.serialize(function() {
				{
					var strQuery = '';
					
					strQuery += 'SELECT evaluationHandle.intIdent AS evaluationHandle_intIdent,';
					strQuery += '       evaluationHandle.intTimestamp AS evaluationHandle_intTimestamp,';
					strQuery += '       evaluationHandle.intSubmission AS evaluationHandle_intSubmission,';
					strQuery += '       evaluationHandle.intStudent AS evaluationHandle_intStudent,';
					strQuery += '       evaluationHandle.intPoints AS evaluationHandle_intPoints,';
					strQuery += '       evaluationHandle.strFile AS evaluationHandle_strFile,';
					strQuery += '       evaluationHandle.intExtension AS evaluationHandle_intExtension,';
					strQuery += '       submissionHandle.intIdent AS submissionHandle_intIdent,';
					strQuery += '       submissionHandle.intTimestamp AS submissionHandle_intTimestamp,';
					strQuery += '       submissionHandle.intAssignment AS submissionHandle_intAssignment,';
					strQuery += '       submissionHandle.intStudent AS submissionHandle_intStudent,';
					strQuery += '       submissionHandle.strFile AS submissionHandle_strFile,';
					strQuery += '       submissionHandle.intExtension AS submissionHandle_intExtension,';
					strQuery += '       assignmentHandle.intIdent AS assignmentHandle_intIdent,';
					strQuery += '       assignmentHandle.intTimestamp AS assignmentHandle_intTimestamp,';
					strQuery += '       assignmentHandle.strName AS assignmentHandle_strName,';
					strQuery += '       assignmentHandle.intSubmit AS assignmentHandle_intSubmit,';
					strQuery += '       assignmentHandle.intEvaluate AS assignmentHandle_intEvaluate,';
					strQuery += '       studentHandle.intIdent AS studentHandle_intIdent,';
					strQuery += '       studentHandle.intTimestamp AS studentHandle_intTimestamp,';
					strQuery += '       studentHandle.strName AS studentHandle_strName,';
					strQuery += '       studentHandle.strMail AS studentHandle_strMail';
					strQuery += '  FROM evaluationHandle,';
					strQuery += '       submissionHandle,';
					strQuery += '       assignmentHandle,';
					strQuery += '       studentHandle';
					strQuery += ' WHERE evaluationHandle.intSubmission = submissionHandle.intIdent';
					strQuery += '   AND submissionHandle.intAssignment = assignmentHandle.intIdent';
					strQuery += '   AND evaluationHandle.intStudent = studentHandle.intIdent';
					strQuery += '   AND max(assignmentHandle.intEvaluate, evaluationHandle.intExtension) > :intTimestamp';
					strQuery += '   AND evaluationHandle.intIdent = :evaluationHandle_intIdent';
					strQuery += '   AND studentHandle.strName = :studentHandle_strName;';
					
					Sqlite.clientHandle.get(strQuery, {
						':intTimestamp': new Date().getTime() / 1000,
						':evaluationHandle_intIdent': requestHandle.query.intEvaluation,
						':studentHandle_strName': requestHandle.query.strUser
					}, function(errorHandle, rowHandle) {
						if (errorHandle !== null) {
							functionError();
							
							return;
						}
						
						{
							if (rowHandle === undefined) {
								functionError();

								return;
							
							} else if (rowHandle.length === 0) {
								functionError();

								return;
								
							}
						}
						
						functionSqliteEvaluation();
					});
				}
			});
		};

		var functionSqliteEvaluation = function() {
			Sqlite.clientHandle.serialize(function() {
				{
					var strQuery = '';
					
					strQuery += 'UPDATE evaluationHandle';
					strQuery += '   SET strFile = :evaluationHandle_strFile';
					strQuery += ' WHERE evaluationHandle.intIdent = :evaluationHandle_intIdent';
					strQuery += '   AND evaluationHandle.intStudent IN (';
					strQuery += '           SELECT studentHandle.intIdent AS studentHandle_intIdent';
					strQuery += '             FROM studentHandle';
					strQuery += '            WHERE studentHandle.strName = :studentHandle_strName';
					strQuery += '       );';
					
					Sqlite.clientHandle.run(strQuery, {
						':evaluationHandle_strFile': FilesystemMove_strName,
						':evaluationHandle_intIdent': requestHandle.query.intEvaluation,
						':studentHandle_strName': requestHandle.query.strUser
					}, function(errorHandle) {
						if (errorHandle !== null) {
							functionError();
							
							return;
						}
						
						functionSuccess();
					});
				}
			});
		};
		
		var functionError = function() {
			var strData = '';
			
			strData += '<?xml version="1.0" encoding="UTF-8" ?>';
			strData += '<xml>';
				strData += '<strResponse>' + 'responseError' + '</strResponse>';
			strData += '</xml>';
			
			responseHandle.status(200);
			
			responseHandle.set({
				'Content-Length': Buffer.byteLength(strData, 'utf-8'),
				'Content-Type': Mime.mimeHandle.lookup('xml'),
				'Content-Disposition': 'inline; filename="' + requestHandle.path.substr(requestHandle.path.lastIndexOf('/') + 1) + '";'
			});
			
			responseHandle.write(strData);
			
			responseHandle.end();
		};
		
		var functionSuccess = function() {
			var strData = '';
			
			strData += '<?xml version="1.0" encoding="UTF-8" ?>';
			strData += '<xml>';
				strData += '<strResponse>' + 'responseSuccess' + '</strResponse>';
			strData += '</xml>';
			
			responseHandle.status(200);
			
			responseHandle.set({
				'Content-Length': Buffer.byteLength(strData, 'utf-8'),
				'Content-Type': Mime.mimeHandle.lookup('xml'),
				'Content-Disposition': 'inline; filename="' + requestHandle.path.substr(requestHandle.path.lastIndexOf('/') + 1) + '";'
			});
			
			responseHandle.write(strData);
			
			responseHandle.end();
		};
		
		functionPreprocess();
	});
	
	Express.serverHandle.get('/logout', Casable.clientHandle, function(requestHandle, responseHandle) {
		
	});
	
	Express.serverHandle.use('/', Express.expressHandle.static(__dirname + '/assets'));
	Express.serverHandle.use('/submission', Express.expressHandle.static(__dirname + '/submission'));
	Express.serverHandle.use('/evaluation', Express.expressHandle.static(__dirname + '/evaluation'));
}

{
	var functionDirectories = function() {
		{
			Node.fsHandle.mkdir(__dirname + '/submission', function(errorHandle) {
				
			});
			
			Node.fsHandle.mkdir(__dirname + '/evaluation', function(errorHandle) {
				
			});
		}
		
		functionTables();
	};
	
	var functionTables = function() {
		Sqlite.clientHandle.serialize(function() {
			{
				var strQuery = '';
				
				strQuery += 'CREATE TABLE IF NOT EXISTS messageHandle (';
				strQuery += '    intIdent INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,';
				strQuery += '    intTimestamp INTEGER DEFAULT (strftime(\'%s\', \'now\')),';
				strQuery += '    strTitle TEXT,';
				strQuery += '    strText TEXT,';
				strQuery += '    UNIQUE (strTitle) ON CONFLICT IGNORE';
				strQuery += ');';
				
				Sqlite.clientHandle.run(strQuery);
			}
			
			{
				var strQuery = '';
				
				strQuery += 'CREATE TABLE IF NOT EXISTS studentHandle (';
				strQuery += '    intIdent INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,';
				strQuery += '    intTimestamp INTEGER DEFAULT (strftime(\'%s\', \'now\')),';
				strQuery += '    strName TEXT,';
				strQuery += '    strMail TEXT,';
				strQuery += '    UNIQUE (strName) ON CONFLICT IGNORE';
				strQuery += ');';
				
				Sqlite.clientHandle.run(strQuery);
			}
			
			{
				var strQuery = '';
				
				strQuery += 'CREATE TABLE IF NOT EXISTS assignmentHandle (';
				strQuery += '    intIdent INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,';
				strQuery += '    intTimestamp INTEGER DEFAULT (strftime(\'%s\', \'now\')),';
				strQuery += '    strName TEXT,';
				strQuery += '    intSubmit INTEGER,';
				strQuery += '    intEvaluate INTEGER,';
				strQuery += '    UNIQUE (strName) ON CONFLICT IGNORE';
				strQuery += ');';
				
				Sqlite.clientHandle.run(strQuery);
			}
			
			{
				var strQuery = '';
				
				strQuery += 'CREATE TABLE IF NOT EXISTS submissionHandle (';
				strQuery += '    intIdent INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,';
				strQuery += '    intTimestamp INTEGER DEFAULT (strftime(\'%s\', \'now\')),';
				strQuery += '    intAssignment INTEGER REFERENCES assignmentHandle (intIdent),';
				strQuery += '    intStudent INTEGER REFERENCES studentHandle (intIdent),';
				strQuery += '    strFile TEXT,';
				strQuery += '    intExtension INTEGER,';
				strQuery += '    UNIQUE (intAssignment, intStudent) ON CONFLICT IGNORE';
				strQuery += ');';
				
				Sqlite.clientHandle.run(strQuery);
			}
			
			{
				var strQuery = '';
				
				strQuery += 'CREATE TABLE IF NOT EXISTS evaluationHandle (';
				strQuery += '    intIdent INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,';
				strQuery += '    intTimestamp INTEGER DEFAULT (strftime(\'%s\', \'now\')),';
				strQuery += '    intSubmission INTEGER REFERENCES submissionHandle (intIdent),';
				strQuery += '    intStudent INTEGER REFERENCES studentHandle (intIdent),';
				strQuery += '    intPoints INTEGER,';
				strQuery += '    strFile TEXT,';
				strQuery += '    intExtension INTEGER,';
				strQuery += '    UNIQUE (intSubmission, intStudent) ON CONFLICT IGNORE';
				strQuery += ');';
				
				Sqlite.clientHandle.run(strQuery);
			}
			
			{
				Sqlite.clientHandle.run('', function(errorHandle) {
					functionConfig();
				});
			}
		});
	};
	
	var Config_objectMessages = [];
	var Config_objectStudents = [];
	var Config_objectAssignments = [];
	
	var functionConfig = function() {
		{
			var strData = Node.fsHandle.readFileSync(__dirname + '/config-messages.txt').toString().split('\n');
			
			for (var intFor1 = 0; intFor1 < strData.length; intFor1 += 1) {
				var strSplit = strData[intFor1].split(';');
				
				if (strSplit.length < 2) {
					continue;
					
				} else if (strSplit[0].trim() === '') {
					continue;
					
				} else if (strSplit[0].indexOf('//') !== -1) {
					continue;
					
				}
				
				{
					Config_objectMessages.push({
						'strTitle': strSplit[0].trim(),
						'strText': strSplit[1].trim()
					});
				}
			}
		}
		
		{
			var strData = Node.fsHandle.readFileSync(__dirname + '/config-students.txt').toString().split('\n');
			
			for (var intFor1 = 0; intFor1 < strData.length; intFor1 += 1) {
				var strSplit = strData[intFor1].split(';');
				
				if (strSplit.length < 3) {
					continue;
					
				} else if (strSplit[0].trim() === '') {
					continue;
					
				} else if (strSplit[0].indexOf('//') !== -1) {
					continue;
					
				}
				
				{
					Config_objectStudents.push({
						'strName': strSplit[0].trim(),
						'strMail': strSplit[1].trim()
					});
				}
			}
		}
		
		{
			var strData = Node.fsHandle.readFileSync(__dirname + '/config-assignments.txt').toString().split('\n');
			
			for (var intFor1 = 0; intFor1 < strData.length; intFor1 += 1) {
				var strSplit = strData[intFor1].split(';');
				
				if (strSplit.length < 4) {
					continue;
					
				} else if (strSplit[0].trim() === '') {
					continue;
					
				} else if (strSplit[0].indexOf('//') !== -1) {
					continue;
					
				}
				
				{
					Config_objectAssignments.push({
						'strName': strSplit[0].trim(),
						'intSubmit': parseInt(strSplit[1].trim(), 10),
						'intEvaluate': parseInt(strSplit[2].trim(), 10),
						'intCrossgrading': parseInt(strSplit[3].trim(), 10)
					});
				}
			}
		}
		
		functionMessagesLookup();
	};
	
	var functionMessagesLookup = function() {
		Sqlite.clientHandle.serialize(function() {
			{
				var strIn = [];
				var strIdentifier = [];
				
				for (var intFor1 = 0; intFor1 < Config_objectMessages.length; intFor1 += 1) {
					{
						strIn.push('?');
						
						strIdentifier.push(Config_objectMessages[intFor1].strTitle);
					}
					
					{
						Config_objectMessages[intFor1].boolExisting = false;
					}
				}
				
				var strQuery = '';
				
				strQuery += 'SELECT messageHandle.intIdent AS messageHandle_intIdent,';
				strQuery += '       messageHandle.intTimestamp AS messageHandle_intTimestamp,';
				strQuery += '       messageHandle.strTitle AS messageHandle_strTitle,';
				strQuery += '       messageHandle.strText AS messageHandle_strText';
				strQuery += '  FROM messageHandle';
				strQuery += ' WHERE messageHandle.strTitle IN (' + strIn.join(',') + ');';
				
				Sqlite.clientHandle.all(strQuery, strIdentifier, function(errorHandle, rowsHandle) {
					if (errorHandle !== null) {
						return;
					}
					
					for (var intFor1 = 0; intFor1 < rowsHandle.length; intFor1 += 1) {
						var rowHandle = rowsHandle[intFor1];
						
						{
							var intSearch = -1;
							
							for (var intFor2 = 0; intFor2 < Config_objectMessages.length; intFor2 += 1) {
								if (Config_objectMessages[intFor2].strTitle === rowHandle.messageHandle_strTitle) {
									intSearch = intFor2;
									
									break;
								}
							}
							
							if (intSearch !== -1) {
								Config_objectMessages[intSearch].boolExisting = true;
							}
						}
					}
				});
			}
			
			{
				Sqlite.clientHandle.run('', function(errorHandle) {
					functionMessagesUpdate();
				});
			}
		});
	};
	
	var functionMessagesUpdate = function() {
		Sqlite.clientHandle.serialize(function() {
			{
				for (var intFor1 = 0; intFor1 < Config_objectMessages.length; intFor1 += 1) {
					if (Config_objectMessages[intFor1].boolExisting === true) {
						continue;
					}
					
					{
						var strQuery = '';
						
						strQuery += 'INSERT INTO messageHandle (';
						strQuery += '    strTitle,';
						strQuery += '    strText';
						strQuery += ') VALUES (';
						strQuery += '    :messageHandle_strTitle,';
						strQuery += '    :messageHandle_strText';
						strQuery += ');';
						
						Sqlite.clientHandle.run(strQuery, {
							':messageHandle_strTitle': Config_objectMessages[intFor1].strTitle,
							':messageHandle_strText': Config_objectMessages[intFor1].strText
						}, function(errorHandle) {
							
						});
					}
				}
			}
			
			{
				for (var intFor1 = 0; intFor1 < Config_objectMessages.length; intFor1 += 1) {
					if (Config_objectMessages[intFor1].boolExisting === false) {
						continue;
					}
					
					{
						var strQuery = '';
						
						strQuery += 'UPDATE messageHandle';
						strQuery += '   SET strText = :messageHandle_strText';
						strQuery += ' WHERE messageHandle.strTitle = :messageHandle_strTitle';
						
						Sqlite.clientHandle.run(strQuery, {
							':messageHandle_strTitle': Config_objectMessages[intFor1].strTitle,
							':messageHandle_strText': Config_objectMessages[intFor1].strText
						}, function(errorHandle) {
							
						});
					}
				}
			}
			
			{
				Sqlite.clientHandle.run('', function(errorHandle) {
					functionStudentsLookup();
				});
			}
		});
	};
	
	var functionStudentsLookup = function() {
		Sqlite.clientHandle.serialize(function() {
			{
				var strIn = [];
				var strIdentifier = [];
				
				for (var intFor1 = 0; intFor1 < Config_objectStudents.length; intFor1 += 1) {
					{
						strIn.push('?');
						
						strIdentifier.push(Config_objectStudents[intFor1].strName);
					}
					
					{
						Config_objectStudents[intFor1].boolExisting = false;
					}
				}
				
				var strQuery = '';
				
				strQuery += 'SELECT studentHandle.intIdent AS studentHandle_intIdent,';
				strQuery += '       studentHandle.intTimestamp AS studentHandle_intTimestamp,';
				strQuery += '       studentHandle.strName AS studentHandle_strName,';
				strQuery += '       studentHandle.strMail AS studentHandle_strMail';
				strQuery += '  FROM studentHandle';
				strQuery += ' WHERE studentHandle.strName IN (' + strIn.join(',') + ');';
				
				Sqlite.clientHandle.all(strQuery, strIdentifier, function(errorHandle, rowsHandle) {
					if (errorHandle !== null) {
						return;
					}
					
					for (var intFor1 = 0; intFor1 < rowsHandle.length; intFor1 += 1) {
						var rowHandle = rowsHandle[intFor1];
						
						{
							var intSearch = -1;
							
							for (var intFor2 = 0; intFor2 < Config_objectStudents.length; intFor2 += 1) {
								if (Config_objectStudents[intFor2].strName === rowHandle.studentHandle_strName) {
									intSearch = intFor2;
									
									break;
								}
							}
							
							if (intSearch !== -1) {
								Config_objectStudents[intSearch].boolExisting = true;
							}
						}
					}
				});
			}
			
			{
				Sqlite.clientHandle.run('', function(errorHandle) {
					functionStudentsUpdate();
				});
			}
		});
	};
	
	var functionStudentsUpdate = function() {
		Sqlite.clientHandle.serialize(function() {
			{
				for (var intFor1 = 0; intFor1 < Config_objectStudents.length; intFor1 += 1) {
					if (Config_objectStudents[intFor1].boolExisting === true) {
						continue;
					}
					
					{
						var strQuery = '';
						
						strQuery += 'INSERT INTO studentHandle (';
						strQuery += '    strName,';
						strQuery += '    strMail';
						strQuery += ') VALUES (';
						strQuery += '    :studentHandle_strName,';
						strQuery += '    :studentHandle_strMail';
						strQuery += ');';
						
						Sqlite.clientHandle.run(strQuery, {
							':studentHandle_strName': Config_objectStudents[intFor1].strName,
							':studentHandle_strMail': Config_objectStudents[intFor1].strMail
						}, function(errorHandle) {
							
						});
					}
				}
			}
			
			{
				for (var intFor1 = 0; intFor1 < Config_objectStudents.length; intFor1 += 1) {
					if (Config_objectStudents[intFor1].boolExisting === false) {
						continue;
					}
					
					{
						var strQuery = '';
						
						strQuery += 'UPDATE studentHandle';
						strQuery += '   SET strMail = :studentHandle_strMail';
						strQuery += ' WHERE studentHandle.strName = :studentHandle_strName';
						
						Sqlite.clientHandle.run(strQuery, {
							':studentHandle_strName': Config_objectStudents[intFor1].strName,
							':studentHandle_strMail': Config_objectStudents[intFor1].strMail
						}, function(errorHandle) {
							
						});
					}
				}
			}
			
			{
				Sqlite.clientHandle.run('', function(errorHandle) {
					functionAssignmentsLookup();
				});
			}
		});
	};
	
	var functionAssignmentsLookup = function() {
		Sqlite.clientHandle.serialize(function() {
			{
				var strIn = [];
				var strIdentifier = [];
				
				for (var intFor1 = 0; intFor1 < Config_objectAssignments.length; intFor1 += 1) {
					{
						strIn.push('?');
						
						strIdentifier.push(Config_objectAssignments[intFor1].strName);
					}
					
					{
						Config_objectAssignments[intFor1].boolExisting = false;
					}
				}
				
				var strQuery = '';
				
				strQuery += 'SELECT assignmentHandle.intIdent AS assignmentHandle_intIdent,';
				strQuery += '       assignmentHandle.intTimestamp AS assignmentHandle_intTimestamp,';
				strQuery += '       assignmentHandle.strName AS assignmentHandle_strName,';
				strQuery += '       assignmentHandle.intSubmit AS assignmentHandle_intSubmit,';
				strQuery += '       assignmentHandle.intEvaluate AS assignmentHandle_intEvaluate';
				strQuery += '  FROM assignmentHandle';
				strQuery += ' WHERE assignmentHandle.strName IN (' + strIn.join(',') + ');';
				
				Sqlite.clientHandle.all(strQuery, strIdentifier, function(errorHandle, rowsHandle) {
					if (errorHandle !== null) {
						return;
					}
					
					for (var intFor1 = 0; intFor1 < rowsHandle.length; intFor1 += 1) {
						var rowHandle = rowsHandle[intFor1];
						
						{
							var intSearch = -1;
							
							for (var intFor2 = 0; intFor2 < Config_objectAssignments.length; intFor2 += 1) {
								if (Config_objectAssignments[intFor2].strName === rowHandle.assignmentHandle_strName) {
									intSearch = intFor2;
									
									break;
								}
							}
							
							if (intSearch !== -1) {
								Config_objectAssignments[intSearch].boolExisting = true;
							}
						}
					}
				});
			}
			
			{
				Sqlite.clientHandle.run('', function(errorHandle) {
					functionAssignmentsUpdate();
				});
			}
		});
		
		var functionAssignmentsUpdate = function() {
			Sqlite.clientHandle.serialize(function() {
				{
					for (var intFor1 = 0; intFor1 < Config_objectAssignments.length; intFor1 += 1) {
						if (Config_objectAssignments[intFor1].boolExisting === true) {
							continue;
						}
						
						{
							var strQuery = '';
							
							strQuery += 'INSERT INTO assignmentHandle (';
							strQuery += '    strName,';
							strQuery += '    intSubmit,';
							strQuery += '    intEvaluate';
							strQuery += ') VALUES (';
							strQuery += '    :assignmentHandle_strName,';
							strQuery += '    :assignmentHandle_intSubmit,';
							strQuery += '    :assignmentHandle_intEvaluate';
							strQuery += ');';
							
							Sqlite.clientHandle.run(strQuery, {
								':assignmentHandle_strName': Config_objectAssignments[intFor1].strName,
								':assignmentHandle_intSubmit': Config_objectAssignments[intFor1].intSubmit,
								':assignmentHandle_intEvaluate': Config_objectAssignments[intFor1].intEvaluate
							}, function(errorHandle) {
								
							});
						}
						
						{
							for (var intFor2 = 0; intFor2 < Config_objectStudents.length; intFor2 += 1) {
								{
									var strQuery = '';
									
									strQuery += 'INSERT INTO submissionHandle (';
									strQuery += '    intAssignment,';
									strQuery += '    intStudent,';
									strQuery += '    strFile,';
									strQuery += '    intExtension';
									strQuery += ')';
									strQuery += 'SELECT assignmentHandle.intIdent AS submissionHandle_intAssignment,';
									strQuery += '       studentHandle.intIdent AS submissionHandle_intStudent,';
									strQuery += '       :submissionHandle_strFile AS submissionHandle_strFile,';
									strQuery += '       :submissionHandle_intExtension AS submissionHandle_intExtension';
									strQuery += '  FROM assignmentHandle,';
									strQuery += '       studentHandle';
									strQuery += ' WHERE assignmentHandle.strName = :assignmentHandle_strName';
									strQuery += '   AND studentHandle.strName = :studentHandle_strName;';
									
									Sqlite.clientHandle.run(strQuery, {
										':submissionHandle_strFile': 'Unknown',
										':submissionHandle_intExtension': 0,
										':assignmentHandle_strName': Config_objectAssignments[intFor1].strName,
										':studentHandle_strName': Config_objectStudents[intFor2].strName
									}, function(errorHandle) {
										
									});
								}
							}
						}
						
						{
							for (var intFor2 = 0; intFor2 < Config_objectStudents.length; intFor2 += 1) {
								{
									Config_objectStudents[intFor2].strCrossgrading = new Array(Config_objectAssignments[intFor1].intCrossgrading);
								}
							}
						}
						
						{
							for (var intFor2 = 0; intFor2 < Config_objectAssignments[intFor1].intCrossgrading; intFor2 += 1) {
								do {
									var boolCrossgrading = true;
									
									{
										for (var intFor3 = 0; intFor3 < Config_objectStudents.length; intFor3 += 1) {
											Config_objectStudents[intFor3].strCrossgrading[intFor2] = Config_objectStudents[intFor3].strName;
										}
									}
									
									{
										for (var intFor3 = Config_objectStudents.length; intFor3 > 1; intFor3 -= 1) {
											var intRandom = Math.floor(Math.random() * 15485867) % intFor3;
											
											if (intFor3 == intRandom) {
												continue;
											}
											
											var strSwap = Config_objectStudents[intFor3 - 1].strCrossgrading[intFor2];
											Config_objectStudents[intFor3 - 1].strCrossgrading[intFor2] = Config_objectStudents[intRandom].strCrossgrading[intFor2];
											Config_objectStudents[intRandom].strCrossgrading[intFor2] = strSwap;
										}
									}
									
									{
										for (var intFor3 = 0; intFor3 < Config_objectStudents.length; intFor3 += 1) {
											if (Config_objectStudents[intFor3].strName === Config_objectStudents[intFor3].strCrossgrading[intFor2]) {
												boolCrossgrading = false;
												
											} else if (Config_objectStudents[intFor3].strCrossgrading.indexOf(Config_objectStudents[intFor3].strCrossgrading[intFor2]) !== intFor2) {
												boolCrossgrading = false;
												
											}
										}
									}
									
									if (boolCrossgrading === true) {
										break;
									}
								} while (true);
							}
						}
						
						{
							for (var intFor2 = 0; intFor2 < Config_objectStudents.length; intFor2 += 1) {
								for (var intFor3 = 0; intFor3 < Config_objectAssignments[intFor1].intCrossgrading; intFor3 += 1) {
									{
										var strQuery = '';
										
										strQuery += 'INSERT INTO evaluationHandle (';
										strQuery += '    intSubmission,';
										strQuery += '    intStudent,';
										strQuery += '    intPoints,';
										strQuery += '    strFile,';
										strQuery += '    intExtension';
										strQuery += ')';
										strQuery += 'SELECT submissionHandle.intIdent AS evaluationHandle_intSubmission,';
										strQuery += '       studentEvaluation.intIdent AS evaluationHandle_intStudent,';
										strQuery += '       :evaluationHandle_intPoints AS evaluationHandle_intPoints,';
										strQuery += '       :evaluationHandle_strFile AS evaluationHandle_strFile,';
										strQuery += '       :evaluationHandle_intExtension AS evaluationHandle_intExtension';
										strQuery += '  FROM assignmentHandle,';
										strQuery += '       submissionHandle,';
										strQuery += '       studentHandle AS studentSubmission,';
										strQuery += '       studentHandle AS studentEvaluation';
										strQuery += ' WHERE assignmentHandle.strName = :assignmentHandle_strName';
										strQuery += '   AND submissionHandle.intAssignment = assignmentHandle.intIdent';
										strQuery += '   AND submissionHandle.intStudent = studentSubmission.intIdent';
										strQuery += '   AND studentSubmission.strName = :studentSubmission_strName';
										strQuery += '   AND studentEvaluation.strName = :studentEvaluation_strName;';
										
										Sqlite.clientHandle.run(strQuery, {
											':evaluationHandle_intPoints': 0,
											':evaluationHandle_strFile': 'Unknown',
											':evaluationHandle_intExtension': 0,
											':assignmentHandle_strName': Config_objectAssignments[intFor1].strName,
											':studentSubmission_strName': Config_objectStudents[intFor2].strName,
											':studentEvaluation_strName': Config_objectStudents[intFor2].strCrossgrading[intFor3]
										}, function(errorHandle) {
											
										});
									}
								}
							}
						}
					}
				}
				
				{
					for (var intFor1 = 0; intFor1 < Config_objectAssignments.length; intFor1 += 1) {
						if (Config_objectAssignments[intFor1].boolExisting === false) {
							continue;
						}
						
						{
							var strQuery = '';
							
							strQuery += 'UPDATE assignmentHandle';
							strQuery += '   SET intSubmit = :assignmentHandle_intSubmit,';
							strQuery += '   SET intEvaluate = :assignmentHandle_intEvaluate';
							strQuery += ' WHERE assignmentHandle.strName = :assignmentHandle_strName';
							
							Sqlite.clientHandle.run(strQuery, {
								':assignmentHandle_strName': Config_objectAssignments[intFor1].strName,
								':assignmentHandle_intSubmit': Config_objectAssignments[intFor1].intSubmit,
								':assignmentHandle_intEvaluate': Config_objectAssignments[intFor1].intEvaluate
							}, function(errorHandle) {
								
							});
						}
					}
				}
			});
		};
	};
	
	setTimeout(functionDirectories, 1000);
}