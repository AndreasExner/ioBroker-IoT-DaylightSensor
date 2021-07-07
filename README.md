# ioBroker-IoT-DaylightSensor

**Important: This project based on my ioBroker IoT Framework F6**

[AndreasExner/ioBroker-IoT-Framework: ioBroker IoT Framework (based on NodeMCU ESP8266) (github.com)](https://github.com/AndreasExner/ioBroker-IoT-Framework)

**Please refer to this documentation for the the basic setup and configuration.**

Required Version: 6.0.0 (or higher)


## Description

#### Introduction

This project is designed to automatically control the sun blinds. In this example, for two sides of the building, south and west. The level of daylight is measured by two photo cells and the ADS1115 ADC, connected to a D1 Mini. The data is transmitted to the iobroker and an algorithm (javascript) calculates the intensity of the sun light. 

#### Wiring

The ADS1115 sensor is connected with via I2C. Both pull-up resistors are 470R/0,6W/1%. The photocells are from the type "LUNA Optoelectronics NORPS-12". 

![](https://github.com/AndreasExner/ioBroker-IoT-DaylightSensor/blob/main/DaylightSensor_Steckplatine.png?raw=true)

#### Calculate sunlight index

The script "sunBlindAutomation.js" has different function to calculate the index and to control the blinds.

```js
// Update Sunlight Index South
on({id: '0_userdata.0.IoT.DaylightSensor.DayLight01', change: "any"}, async function (obj) {
    
    var value = obj.state.val; // get the current level of sunlight (the brighter the sun, the lower the value)
    var sunlightLevelSouth = getState("0_userdata.0.Tahoma.SunLightLevelSouth").val; // get the trigger level for the south blinds
    var sunlightIndexSouth = getState("0_userdata.0.Tahoma.SunLightIndexSouth").val; // get the current index for the south blinds

    
    // sun is brighter than the trigger -> increase index by 1, as long as it reaches 100%
    if (value <= sunlightLevelSouth && sunlightIndexSouth < 100) {
        setState("0_userdata.0.Tahoma.SunLightIndexSouth", sunlightIndexSouth + 1, true);
    }
  
    // sun is darker than the trigger -> decrase index by 1, as long as it reaches 0%
    if (value >= sunlightLevelSouth && sunlightIndexSouth > 0) {
        setState("0_userdata.0.Tahoma.SunLightIndexSouth", sunlightIndexSouth - 1, true);
    }
});
```

Update Sunlight Index XY

- The script is triggered by any change of of the measured daylight intensity (approximately every 9 seconds to cover fast changing conditions)
- If the daylight intensity is higher than the predefined trigger level, the index will be incremented by 1 until 100 is reached. Other it will be decremented by 1 until 0 is reached. This results in a minimum hysteresis of 15 minutes.

```js
// Open / Close Blinds West
on({id: '0_userdata.0.Tahoma.SunLightIndexWest', change: "ne"}, async function (obj) {
    var value = obj.state.val;
    var sunBlindsAutoWest = getState("0_userdata.0.Tahoma.SunBlindsAutoWest").val; // get automatic mode activation for the west blinds
    var sunlightIndexWest = getState("0_userdata.0.Tahoma.SunLightIndexWest").val; // get the current index for the West blinds
    var blindsWestPosition = getState("tahoma.0.devices.Esszimmerfenster_R.states.core:ClosureState").val; // get position of thr west blinds

    
    // index reached 100%. Close blinds if in auto mode and not yet closed otherwise
    if (sunBlindsAutoWest && sunlightIndexWest >= 100 && blindsWestPosition < 50) {
        setState("tahoma.0.actionGroups.EZ_Sonnenschutz50.commands.execute", true); // execute Tahoma scene (io)
        setState("tahoma.0.devices.Schlafzimmer_1.commands.close", true); // close RTS blinds
    }
    
    // index reached 0%. Open blinds if in auto mode and not fully closed otherwise
    if (sunBlindsAutoWest && sunlightIndexWest <= 0 && blindsWestPosition < 70) {
        setState("tahoma.0.actionGroups.EZ_Sonnenschutz00.commands.execute", true); // execute Tahoma scene (io)
    }
});
```

Open / Close Blinds XY

- The script is triggered by any change of of the index
- The actions of the script are already executed if the automatic control mode is activated
- If the index reaches 100(%), and the blinds are not already closed by another trigger, the script executes the command to close the blinds for sun protection
- If the index reaches 0(%), and the blinds are not fully closed by another trigger, the script executes the command to open the blinds



## History

F6_1.1 (release) 2021-07-07



#### Tested environment

- Software
  - Arduino IDE 1.8.13 (Windows)
  - ESP8266 hardware package 2.7.4
  - Adafruit ADS1X15 library 1.1.1
- Hardware
  - Wemos D1 Mini (ESP8266MOD 12-F)
  - ADS1115
  - LUNA Optoelectronics NORPS-12

## Prerequisites

* You need a running Arduino IDE and at least basic knowledge how it works. 
* You also need a running ioBroker instance and a little more than basic knowledge on that stuff.
* You need the ioBroker MQTT broker adapter up and running
* You need a userdata section in your ioBroker objects
* You should know how to work with IoT devices and electronics
* You need to read this first: [AndreasExner/ioBroker-IoT-Framework: ioBroker IoT Framework (based on NodeMCU ESP8266) (github.com)](https://github.com/AndreasExner/ioBroker-IoT-Framework)



## Setup

- Create a folder in your Arduino library folder
- Copy the primary sketch (DaylightSensor_1.1.ino) and the extension file (AEX_iobroker_IoT_Framework_x.ino) into the folder
  - be sure to include the secret files (MQTT_secret.h and WiFi_secret.h)
- Open the primary sketch (e.g. DEV_6.0.ino) 
  - edit code  as needed and don't forget to change the secrets as well
- Install required libraries into your Arduino IDE
- Create (import) the datapoints in iobroker. 
  - 0_userdata.0.IoT-Devices.08.json (device state and control)
  - 0_userdata.0.IoT.DaylightSensor.json (productive sensor data)
  - 0_userdata.0.IoT-Dev.DaylightSensor.json (development sensor data)
  - 0_userdata.0.Tahoma.json (sunlight index calculation)
- Set values for datapoints (see iobroker datapoints)



## Configuration

#### Generic device section

```c++
// device settings - change settings to match your requirements

String deviceID = "08"; //predefinded sensor ID, DEV by default to prevent overwriting productive data
String deviceName = "DaylightSensor"; //predefinded sensor ID, DEV by default to prevent overwriting productive data

bool devMode = true; //enable DEV mode on boot (do not change)
bool debug = true; //debug to serial monitor
bool ledActive = true; //enable external status LED on boot
bool deviceActive = false; // dectivate device (all sensors) on boot (do not change until required)

int interval = 9;  // (initial) interval between measurements / actions, multiplied with the intervalDelay
int intervalDelay = 1000; // in ms
```

- The Wifi information are located in the file WiFi_secret.h
- The MQTT authentication information are located in the file MQTT_secret.h
- The **`deviceID`** is part of the MQTT topic and important for the the iobroker communications. It **must** be equal to the datapoint path in your ioBroker!
- The **`deviceName`** is part of the MQTT topic and important for the the iobroker communications. It **must** be equal to the datapoint path in your ioBroker!
- The **`devMode`** switch prevents the device from sending data into your productive datapoints. It is enabled by default and can be overwritten dynamically from iobroker
- **`debug`** enables the detailed serial output
- **`ledActive`** enables the onboard led (status)
- **`interval`** defines the time between two data transmissions (interval * intervalDelay). This value is used initially after boot. The interval can dynamically updated from iobroker.
- **`intervalDelay`** defines the waiting time at the end of each loop. This value is used initially after boot. The interval can dynamically updated from iobroker (this value has no effect if the BME680 sensor is activated!)
- The **`deviceActive`** switch enables sensors and data transmissions. This is very useful to test a sketch on the bread board without the connected hardware. It is disabled by default and gets dynamically changed by the iobrocker, as long as nothing else is configured.

#### MQTT section

```c++
int MQTT_port = 1883; // MQTT port (default 1883)
const char MQTT_broker[] = "192.168.1.240";  // IP of iobroker / MQTT broker

String MQTT_deviceRootPath = "0_userdata/0/IoT-Devices/"; // The root path for all the sensor's (devices) state and configuration subscription in your MQTT/iobroker
String MQTT_prodDataRootPath = "0_userdata/0/IoT/"; // The root path for all the sensor's productive data in your MQTT/iobroker
String MQTT_devDataRootPath = "0_userdata/0/IoT-Dev/"; // The root path for all the sensor's productive data in your MQTT/iobroker
```

- **`MQTT_port`** is 1883 by default
- **`MQTT_broker`** is usually the IP address of your ioBroker. The sketch does not use DNS!
- **`MQTT_deviceRootPath`**, **`MQTT_prodDataRootPath`** and **`MQTT_devDataRootPath`** must correspond to the ioBroker datapoints! 



## iobroker datapoints

#### Devices section

The device section contains the configuration and status information about the IoT device (hardware board) itself. All Sensor data and config will be stored in the data section.

The MQTT topic for the device section is a combination of the MQTT_deviceRootPath and the deviceID. For example:

```
0_userdata/0/IoT-Devices + /DEV -> topic for device state
0_userdata/0/IoT-Devices + /DEV + /Config -> topic for device config (subscription)
```

The default path for the devices root folder is: **`0_userdata.0.IoT-Devices`**. When the path is changed in ioBroker, it has to be changed in the sketch as well.

**It is mandatory to setup the following datapoints prior the first device boot:**

- States
  - **`/DeviceIP`** the current IP address of the device
  - **`/DeviceName`** the current Name of the device
  - **`/ErrorLog`** the last error message
  - **`/MAC`** the current MAC address of the device
  - **`/RSSI`** the current WiFi RSSI of the device
  - **`/Reset`** the timestamp of the last reset / boot (depricated)
- Config
  - **`/Debug`** [false] enables / disables serial debug output
  - **`/Delay`** [1000] loop delay (in ms) (ignored if BME680 is active)
  - **`/DevMode`** [false] enables / disables DevMode. In DevMode, all data will be written into a different data path on the ioBroker
  - **`/DeviceActive`** [true] enables / disables **all** sensors and data transmits
  - **`/Interval`** [10] data transmit every n-th loop
  - **`/LED`** [true] enables / disables status LED



#### Data section

In the data section, all the sensor data will be stored. In addition, some optional, specific sensor configuration can be stored here as well. Depending on the DevMode option, the data will be stored in the production or the development path.

The MQTT topic for the data section is a combination of the MQTT_????DataRootPath and the deviceName. For example:

```
0_userdata/0/IoT + /DaylightSensor -> topic for production data
0_userdata/0/IoT-Dev + /DaylightSensor -> topic for development data
```

The default path for the devices root folder is: **`0_userdata.0.IoT-Devices`**. When the path is changed in ioBroker, it has to be changed in the sketch as well.

The data section must contain at least one state:

- **`/DeviceIP`** the current ID of the device



#### Sensor specific datapoints

##### ADS1115 (DaylightSensor)

- Sensor data
  - **`Daylight01`** ADC output for daylight sensor 1
  - **`Daylight02`** ADC output for daylight sensor 2



## How it works

#### Boot phase / setup

- Connect Wifi / Get Wifi State
- Connect MQTT / Get MQTT State
- Send device state
- Get initial configuration from ioBroker
  - Subscribe MQTT device config topics
  - Get (parse) MQTT messages (device & sensor specific config)
  - Subscribe MQTT sensor specific config topics
  - Get (parse) MQTT messages (device & sensor specific config)
- Run sensor setup (if deviceActive = true)

#### Loop

The main loop has a default frequency of round about 1 Hz (1000ms **`delay`**) and blinks the status led with 0,5 Hz (when enabled). 

In each loop, the data of all (active) sensors are measured and possible MQTT messages are parsed to obtain config changes. This includes the setup for disabled sensors. Optionally, the data can be send as a debug log to the serial interface of the device.

Every n-th loop, defined by the **`Interval`**, the data is transmitted to ioBroker.
