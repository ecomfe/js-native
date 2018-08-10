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
    it('instancing by createContainer', () => {
        let apiContainer = jsNative.createContainer();
        expect(apiContainer.add).to.be.a('function');
        expect(apiContainer.map).to.be.a('function');
        expect(apiContainer.invoke).to.be.a('function');
        expect(apiContainer.fromNative).to.be.a('function');
    });
});
