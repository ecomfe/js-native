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
            "invoke": "method",
            "name": "api1",
            "method": "tAPI.api1"
        });
        tAPI.api1 = () => {
            invoked = true;
        };
        apis.invoke('api1');


        expect(invoked).to.be.true;
    });
});
