# TeamCityVisualizer
## Functionality
Finds all configurations for a project and displays them with color depending on the current status of the configuration. If the project is setup to use snapshot dependencies then you will also see the last completed build chain as well as the n number of last build chains started. (n) is currently hard coded in project.js so is easy to change, I might implement a config for the project at some point but currently no such plan.

### Status
The visualizer in its current state is working but if used in a production environment I would suggest installing the application behind a firewall without external access as no authentication is implemented yet.

## Development
### Back-end
The back-end consists of a number python files stored in the src-folder and uses Tornado. The application starts in program.py and is supported by a number of sub-files. There is an attempt to maintain one file per entity (project, configuration, etc.).

### Front-end
There is a single html file (index.html) that serves as a template for the javascripts that render the final mark-up. project.js serves as the starting point and retrieves the TeamCity project structure and renders this structure. buildStatus.js handles updating the rendered html based on the current status. There are 3 methods to handle latest build for each configuration, latest completed build chain and historic build chains respectively. SetInterval is used to refresh the status for the configurations, some shortcuts have been made which results in an unneccesary ajax call to the back-end when a configuration has finished a build. css.js handles animation and background color for a configuration.

## Usage
Make sure you have Python 3.x and just clone the repo and run program.py with the parameters/switches below as needed.
Go to http://localhost:{{appPort}}/{{TC_project_id}} in any browser and you should have all configurations for that project included in the view.
If your TC project is not setup to use snapshot dependencies then the history will most likely be shown incorrectly. If this is the case I suggest that you change the project in TeamCity to use snapshot/artifact dependencies as this is IMO the correct way of doing it.

### Parameters
- -h/--tcHost: The host for the TeamCity installation. Default = http://localhost
- -p/--tcPort: Port for the TeamCity installation. Default = 8888
- -l/--appPort: Port for the python backend. Default = 8089
- -a/--httpAuth: Switch for using httpAuth when accessing TeamCity API, not fully implemented. Default is to use guestAuth
- -d/--debug: Switch to enable debug mode

## Limitations
- No work has been put into authentication and the backend is currently using guestAuth to access the TC API.
- Some work stil has to be put into escaping strings before attaching them to the DOM.
- Both backend and frontend is set up as if everything is fine and no consideration is taken to status code returned from TC.
- Tests for the bulk of the JavaScript code has been written but I stil need to learn testing in Python to get to an acceptable level for that part of the code.
- No automatic testing on push, tests need to be run manually using the SpecRunner.html file for now.
