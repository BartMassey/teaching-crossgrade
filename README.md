# Crossgrade

Crossgrade is a `node.js` web service that allows students
to anonymously peer-evaluate each other's homework.

Crossgrade allows assignment handling to be separated into
two stages, a submission stage as well as a subsequent
evaluation stage. In the submission stage, students upload
their solutions to a given assignment. In the subsequent
evaluation stage, students evaluate the submissions of their
peers in order to study other solutions and to provide
mutual anonymous feedback.

<p align="center"><img
  src="http://content.coderect.com/RateRect/Teaching/ScreenshotThumb.png"
  alt="ScreenshotThumb"></p>

## Installation

Make sure to have `node` and `npm` installed. otherwise
navigate to [nodejs.org](https://nodejs.org/) in order to
download the latest binaries.

To start the server and use crossgrade for a particular
class, it is necessary to install the dependencies by
calling `npm` within the root folder of the project.

```
npm install node-pre-gyp -g
```

```
npm install
```

## Setup

Before crossgrade is configured to meet the needs of a
particular class, there are some additional parameters that
may be set. The port of the server, for example, can be
changed within `NodeConf.js` in order to meet the
requirements of each individual setup. It is highly
recommended to change the secret that is being used as a key
to store and load browser cookies.

```javascript
NodeConf.intExpressPort = 80;
```

```javascript
NodeConf.strExpressSecret = '...';
```

Additional settings such as the used CAS sever or the backup
interval of the internal database can be adjusted within
`RateConf.js`.

## Configuration

To use crossgrade in a class, several text files need to be
modified. The internal database will be synchronized with
the text files every time the server starts. Note that the
basic methodology of the synchronization is to never delete
records from the internal database but only to use insert
and update commands. The text files should therefore be
configured carefully.

Further explanations can be found in the header of each text
file, so additional details are omitted here. For further
information, make sure to have a look at the
[Frequently Asked Questions](#faq) section.

## Execution

The server can easily be started by using `node` and
invoking the main component:

```
node RateRect.js
```

(`RateRect` is a reference to student rating and to
*CodeRect.*)

To keep the server up and running, using `forever` is
recommended. `forever` can globally be installed through
`npm` and can start the server and keep it running. In this
configuration it is no longer necessary to call `node`
directly.

```
npm install forever -g
```

```
forever RateRect.js
```

Should it be necessary to restart the server -- for example,
in order to synchronize the internal database with the
configuration text files -- the identifier of the running
instance needs to be determined before the instance in
question can be restarted.

```
forever list
```

```
forever restart <uid>
```

## <a name="faq">Frequently Asked Questions</a>

* *There is an eaccess error immediately after starting the
  server?* Remember that you have to execute the server as
  root when the default port has not been changed.

* *How can students be excluded from future assignments?*
  Should a student decide to drop the class, they should of
  course be removed from future assignments. To do so,
  simply remove or comment out the student in the
  `config-students.txt` configuration file and restart the
  server to apply the changes.

* *How to extend the deadline for an assignment?* This is a
  fairly common and straightforward task. Simply update the
  timestamp in the `config-assignments.txt` configuration
  file and restart the server to apply the changes.

* *How to extend the deadline for a student?* The
  capabilities to extend the deadline for an individual
  student are only mildly satisfying. This is mainly due to
  the inherent peer reviewing issues that would be caused by
  allowing an individual student to delay: thus, it is not
  recommended. Please see the `config-extensions.txt`
  configuration file for further instructions.

## Dependencies

Since the project consists of several components and each
component has individual dependencies, they are being listed
separately.

### `RateRect.js`

* `node` / `npm`
* `express`
* `sqlite3`
* `casable`
* `multer`

### `index.html`

* `jquery` / `moment`
* `bootstrap` / `fontawesome`
* `jquery file upload`

## License

Please refer to the appropriate file within this repository.
