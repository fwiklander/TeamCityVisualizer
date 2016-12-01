# TeamCityVisualizer
## Purpose
This is a combination of learning python as well as refreshing some JS/jQuery/CSS knowledge. As I wanted to do something with a purpose I decided to do a visualizer for TeamCity build chains.
The visualizer currently assumes usage of the TeamCity build chains and snapshot dependencies but should work for most setups in TeamCity.

## Functionality
Finds all configurations for a project and displays them with color depending on the current status of the configuration. If the project is setup to use snapshot dependencies then you will also see the last completed build chain as well as the n number of last build chains started. (n) is currently hard coded in project.js so is easy to change, I might implement a config for the project at some point but currently no such plan.

## Usage
Basically just clone the repo and run program.py with the parameters/switches below as needed.
Go to http://localhost:{{appPort}}/{{TC_project_id}} in any browser and you should have all configurations for that project included in the view.
If you TC project is not setup to use snapshot dependencies then the history will most likely be shown incorrectly. If this is the case I suggest you change the project in TeamCity to use snapshot/artifact dependencies as this is IMO the correct way of doing it.

### Parameters
- -h/--tcHost: The host for the TeamCity installation. Default = http://localhost
- -p/--tcPort: Port for the TeamCity installation. Default = 8888
- -l/--appPort: Port for the python backend. Default = 8089
- -a/--httpAuth: Switch for using httpAuth when accessing TeamCity API, not fully implemented. Default is to use guestAuth
- -d/--debug: Switch to enable debug mode

## Limitations
- No work has been put into authentication and the backend is currently using guestAuth to access the TC API.
- I set out to avoid using double bracket libraries as this started as a training exercise.
- Some work stil has to be put into escaping strings before attaching them to the DOM.
- Both backend and frontend is set up as if everything is fine and no consideration is taken to status code returned from TC.
- No tests have yet been written as the main purpose was to learn the basics of python. Tests will be implemented once a first working version is in place.
