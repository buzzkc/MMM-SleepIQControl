# MMM-SleepIQControl
This is a module for the [MagicMirror²](https://github.com/MichMich/MagicMirror/).

A MagicMirror module for controlling sleep number beds on a touch screen.

![](./images/MMM-SleepIQControl.png)


## Installation
### Setup the MagicMirror module
~MagicMirror/modules

git clone https://github.com/buzzkc/MMM-SleepIQControl.git


### Using the module

To use this module, add the following configuration block to the modules array in the `config/config.js` file:
```js
var config = {
    modules: [
        {
              module: "MMM-SleepIQControl",
              position: "middle_center,
              config: {
                    username: "yourSleepNumberUserName",
                    password: "yourSleepNumberPassword",
                    primarySleeper: "left", // "left" or "right"
              }
        },
    ]
}
```

### Configuration options

| Option            | Description
|-----------------  |-----------
| `username`        | *Required* Your username to login to sleepIQ
| `password`        | *Required* Your password to login to sleepIQ
| `title`           | *Optional* Title for the module
| `updateInterval`  | *Optional* Update frequency, default: 300000 <*Int*> (5 minutes)
| `primarySleeper`  | *Optional* Primary Sleeper to display, 'left' or 'right', default: 'left' 
|                   |

## Future enhancements
* Add SleepNumber adjustment (duh)
* Add Sleeper selector
* Add Foot warmer options
* Add Massage options
* Add Light options

## Thanks To
* MichMich for developing [MagicMirror<sup>2</sup>](https://github.com/MichMich/MagicMirror)
* DeeeeLAN for the [API.js](https://github.com/DeeeeLAN/homebridge-sleepiq/blob/master/API.js) library 