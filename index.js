'use strict'

const request = require('request')
const url = require('url')

let Service, Characteristic

module.exports = (homebridge) => {
    Service = homebridge.hap.Service
    Characteristic = homebridge.hap.Characteristic
    homebridge.registerAccessory("homebridge-kettle", "MyKettle", StaggEKGAccessory)
}

class StaggEKGAccessory {
    constructor (log, config) {
        this.log = log;
        this.config = config;
        this.service = new Service.Thermostat(this.config.name);
        this.tempDisplayUnits = 1;

        this.maxTemp = 100;
        this.minTemp = 40;

        // this.currentTemperature = 40;
        this.targetTemperature = 100;
        this.targetHeatingCoolingState = 0;
    }

    getServices () {
        const informationService = new Service.AccessoryInformation()
        informationService
            .setCharacteristic(Characteristic.Manufacturer, "Fellow")
            .setCharacteristic(Characteristic.Model, "Stagg EKG+")
            .setCharacteristic(Characteristic.SerialNumber, "123-456-789")

        this.service.getCharacteristic(Characteristic.TargetHeatingCoolingState)
            .on('get', this.getTargetHeatingCoolingStateCharacteristicHandler.bind(this))
            .on('set', this.setTargetHeatingCoolingStateCharacteristicHandler.bind(this))

        this.service.getCharacteristic(Characteristic.TargetTemperature)
            .on('get', this.getTargetTemperatureHandler.bind(this))
            .on('set', this.setTargetTemperatureHandler.bind(this))

        this.service.getCharacteristic(Characteristic.TargetTemperature)
            .setProps({
                maxValue: 100,
                minValue: 40,
                unit: 1
            })

        this.service.getCharacteristic(Characteristic.CurrentTemperature)
            .setProps({
                maxValue: 100,
                minValue: 0,
                unit: 1
            })

        this.service.getCharacteristic(Characteristic.TemperatureDisplayUnits)
            .setProps({value: 1})

        this.service.getCharacteristic(Characteristic.CurrentTemperature)
            .on('get', this.getCurrentTemperatureHandler.bind(this))

        this.service.getCharacteristic(Characteristic.TemperatureDisplayUnits)
            .on('get', this.getTemperatureDisplayUnitsHandler.bind(this))
            .on('set', this.setTemperatureDisplayUnitsHandler.bind(this))

        this.service.getCharacteristic(Characteristic.TargetHeatingCoolingState)
            .setProps({validValues: [0, 1]})

        this.service.getCharacteristic(Characteristic.CurrentHeatingCoolingState)
            .setProps({validValues: [0, 1]})

        return [informationService, this.service]
    }

    getTargetHeatingCoolingStateCharacteristicHandler (callback) {
        this.log(`calling getTargetHeatingCoolingStateCharacteristicHandler`, this.targetHeatingCoolingState)
        var self = this;
        request({
            url: "http://localhost:8000/state",
            method: "GET"
        }, function (error, response, body) {
            self.service.updateCharacteristic(Characteristic.TargetHeatingCoolingState, body)
        });
        callback(null, this.targetHeatingCoolingState)
    }

    setTargetHeatingCoolingStateCharacteristicHandler (value, callback) {
        this.service.updateCharacteristic(Characteristic.TargetHeatingCoolingState, value)
        this.log(`calling setTargetHeatingCoolingStateCharacteristicHandler`, value)
        request({
            url: "http://localhost:8000/state",
            method: "POST",
            json: false,
            body: "value=" + this.targetHeatingCoolingState,
            headers: {"Content-Length": 7}
        }, function (error, response, body){});
        callback(null, this.targetHeatingCoolingState)
    }

    getTargetTemperatureHandler (callback) {
        this.log(`calling getTargetTemperatureHandler`, this.targetTemperature)
        var self = this;
        request({
            url: "http://localhost:8000/target_temp",
            method: "GET"
        }, function (error, response, body) {
            self.service.updateCharacteristic(Characteristic.TargetTemperature, body)
        });
        callback(null, this.targetTemperature)
    }

    setTargetTemperatureHandler (value, callback) {
        this.service.updateCharacteristic(Characteristic.TargetTemperature, value)
        this.log(`calling setTargetTemperatureHandler`, value)
        request({
            url: "http://localhost:8000/target_temp",
            method: "POST",
            json: false,
            body: "value=" + this.targetTemperature.toString(),
            headers: {"Content-Length": 6 + this.targetTemperature.toString().length}
        }, function (error, response, body){});
        callback(null, this.targetTemperature)
    }

    getCurrentTemperatureHandler (callback) {
        this.log(`calling getCurrentTemperatureHandler`, this.currentTemperature)
        var self = this;
        request({
            url: "http://localhost:8000/current_temp",
            method: "GET"
        }, function (error, response, body) {
            self.service.updateCharacteristic(Characteristic.CurrentTemperature, (body - 32)/1.8000)
        });
        callback(null, this.currentTemperature)
    }

    getTemperatureDisplayUnitsHandler (callback) {
        this.log(`calling getTemperatureDisplayUnitsHandler`, this.tempDisplayUnits)
        callback(null, this.tempDisplayUnits)
    }

    setTemperatureDisplayUnitsHandler (value, callback) {
        this.log(`calling setTemperatureDisplayUnitsHandler`, value)
        callback(null, this.tempDisplayUnits)
    }
}
