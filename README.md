# Homebridge Kettle
This is a simple Homebridge plugin for the [Fellow Stagg EKG+]() kettle so that it can be controlled over WiFi using HomeKit.

This is intended to be used with my [`stagg-ekg-plus` Python program](https://github.com/calvinmclean/stagg-ekg-plus) which handles the actual BLE communication with the kettle.

## Config Example
```json
"accessories": [
    {
        "accessory": "MyKettle",
        "room": "Kitchen",
        "name": "Kettle",
        "url": "http://localhost:8000"
    }
],
```
