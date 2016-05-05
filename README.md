#teaching-crossgrade
this project allows assignments to be separated into two stages, a submission stage as well as a subsequent evaluation stage. in the submission stage, students upload their solutions to a given assignment. in the subsequent evaluation stage, students evaluate the submissions of their peers in order to study other solutions and to provide mutual anonymous feedback.

<p align="center"><img src="http://content.coderect.com/RateRect/Teaching/ScreenshotThumb.png" alt="ScreenshotThumb"></p>

##installation
make sure to have `node` and `npm` installed. otherwise navigate to [nodejs.org](https://nodejs.org/) in order to download the latest binaries.

to start the server and use crossgrade for a particular class, it is necessary to install the dependencies by calling `npm` within the root folder of the project.

```
npm install node-pre-gyp -g
```

```
npm install
```

##setup
before crossgrade can be configured to meet the needs of a particular class, there are some additional parameters that can be set. the port of the server can for example be changed within the `NodeConf.js` in order to meet the requirements of each individual setup. it is in this regard highly recommended to also change the secret that is being used as a key to store and load browser cookies.

```javascript
NodeConf.intExpressPort = 80;
```

```javascript
NodeConf.strExpressSecret = '...';
```

additional settings such as the used cas sever or the backup interval of the internal database can furthermore be adjusted within `RateConf.js`.

##configuration
to use crossgrade in a class, several text files need to be modified. in doing so, the internal database will be synchronized with the text files every time the server starts. note that the basic methodology of the synchronization is to never delete tupels from the internal database and only to use insert and update commands. the text files should therefore be configured carefully.

further explanations can be found in the header of each text file, which is why additional details are being omitted here. for further questions, make sure to have a look at the frequently asked questions section.

##execution
the server can easily be started by using `node` and invoking the main component.

```
node RateRect.js
```

to keep the server up and running, using `forever` is recommended. it can globally be installed through `npm` and can simply be utilized to start the server and keep it running. it is therefore no longer necessary to call `node` directly.

```
npm install forever -g
```

```
forever RateRect.js
```

should it be necessary to restart the server in order to synchronize the internal database with the configuration text files for example, the identifier of the running instance needs to be determined before the instance in question can be restarted.

```
forever list
```

```
forever restart *uid*
```

##frequently asked questions

*there is an eaccess error immediately after starting the server?* remember that you have to execute the server as root when the default port has not been changed.

*how can students be excluded from future assignments?* should a student decide to drop the class, he should of course be removed from future assignments. to do so, simply remove or comment out the student in the `config-students.txt` configuration file.

*how to extend the deadline for an assignment?* this is a fairly common and straightforward task. simply update the timestamp in the `config-assignments.txt` configuration file and restart the server to apply the changes.

*how to extend the deadline for a student?* the capabilities to extend the deadline for an individual student are only mildly satisfying. this is mainly due to the inherent peer reviewing issues that would be caused by this, which is why it should only be done in rare occasions. please see the `config-extensions.txt` configuration file for further instructions.

##dependencies
since the project consists of several components and each component has individual dependencies, they are being listed separately.

###`RateRect.js`
* `node` / `npm`
* `express`
* `sqlite3`
* `casable`
* `multer`

###`index.html`
* `jquery` / `moment`
* `bootstrap` / `fontawesome`
* `jquery file upload`

##license
please refer to the appropriate file within this repository.