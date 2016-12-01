# TeamCityVisualizer
## Purpose
This is a combination of learning python as well as refreshing some JS/jQuery/CSS knowledge. As I wanted to do something with a purpose I decided to do a visualizer for TeamCity build chains.
The visualizer currently assumes usage of the TeamCity build chains and snapshot dependencies but should work for most setups in TeamCity.

## Usage
Basically just clone the repo and run program.py.
### Parameters
- -h/--tcHost: The host for the TeamCity installation. Default = http://localhost
- -p/--tcPort: Port for the TeamCity installation. Default = 8888
- -l/--appPort: Port for the python backend. Default = 8089
- -a/--httpAuth: Switch for using httpAuth when accessing TeamCity API, not fully implemented. Default is to use guestAuth

## Limitations
- No work has been put into authentication and the backend is currently using guestAuth to access the TC API.
- I set out to avoid using double bracket libraries as this started as a training exercise.
- Some work stil has to be put into escaping strings before attaching them to the DOM.
- Both backend and frontend is set up as if everything is fine and no consideration is taken to status code returned from TC.
- No tests have yet been written as the main purpose was to learn the basics of python. Tests will be implemented once a first working version is in place.
