const chai = require('chai');
const expect = chai.expect;


describe('Export Object', () => {
    it('is an apiContainer = ', () => {
        expect(jsNative).to.be.an('object');
        expect(jsNative.add).to.be.a('function');
        expect(jsNative.map).to.be.a('function');
        expect(jsNative.invoke).to.be.a('function');
        expect(jsNative.fromNative).to.be.a('function');
    });

    it('has invokeAPI method', () => {
        expect(jsNative.invokeAPI).to.be.a('function');
    });

    it('has createContainer method', () => {
        expect(jsNative.createContainer).to.be.a('function');
    });
});


describe('APIContainer', () => {
    let tAPI = {};
    global.tAPI = tAPI;


    let apis;
    before(() => {
        apis = jsNative.createContainer();
    });

    it('instancing by createContainer', () => {
        expect(apis.add).to.be.a('function');
        expect(apis.map).to.be.a('function');
        expect(apis.invoke).to.be.a('function');
        expect(apis.fromNative).to.be.a('function');
    });

    it('can invoke after add', () => {
        let invoked = false;

        apis.add({
            invoke: "method",
            name: "api1",
            method: "tAPI.api1"
        });
        tAPI.api1 = () => {
            invoked = true;
        };

        apis.invoke('api1');
        expect(invoked).to.be.true;
    });

    it('invoke a not defined api, no error, and return undefined', () => {
        let value = apis.invoke('api-noexists');
        expect(value).to.be.undefined;
    });


    it('in args declaration, arg passed', () => {
        let sum = 0;

        apis.add({
            invoke: ["CallMethod"],
            name: "api3",
            method: "tAPI.api3",
            args: [
                {name: 'one', type: 'number'},
                {name: 'two', type: 'number'}
            ]
        });
        tAPI.api3 = (one, two) => {
            sum = one + two;
        };

        apis.invoke('api3', [1, 2, 3]);
        expect(sum).to.be.equal(3);
    });

    it('out of args declaration, arg also pass', () => {
        let valid = false;

        apis.add({
            invoke: ["CallMethod"],
            name: "api2",
            method: "tAPI.api2"
        });
        tAPI.api2 = arg => {
            valid = arg;
        };

        apis.invoke('api2', [1, 2, 3]);
        expect(valid).to.be.not.false;
    });


});
