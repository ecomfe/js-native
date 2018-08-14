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


describe('Processor ArgCheck', () => {
    let apis;
    before(() => {
        apis = jsNative.createContainer();
    });


    it('everyone collect', () => {
        apis.add({
            invoke: ["ArgCheck"],
            name: "argCheck1",
            args: [
                {name: 'one', value: 'number'},
                {name: 'two', value: 'string'},
                {name: 'three', value: 'Array'},
                {name: 'four', value: 'function'},
                {name: 'five', value: 'Object'}
            ]
        });

        expect(() => {
            apis.invoke('argCheck1', [1, '2', [], function () {}, {}]);
        }).to.not.throw(Error);
        
    });


    it('invalid number', () => {
        apis.add({
            invoke: ["ArgCheck"],
            name: "argCheck2",
            args: [
                {name: 'one', value: 'number'},
                {name: 'two', value: 'string'}
            ]
        });

        expect(() => {
            apis.invoke('argCheck2', ['1', '2']);
        }).to.throw('number');
    });


    it('invalid string', () => {
        apis.add({
            invoke: ["ArgCheck"],
            name: "argCheck3",
            args: [
                {name: 'one', value: 'number'},
                {name: 'two', value: 'string'}
            ]
        });

        expect(() => {
            apis.invoke('argCheck2', [1, 2]);
        }).to.throw('string');
    });

    it('invalid Array', () => {
        apis.add({
            invoke: ["ArgCheck"],
            name: "argCheck4",
            args: [
                {name: 'one', value: 'number'},
                {name: 'two', value: 'string'},
                {name: 'three', value: 'Array'},
                {name: 'four', value: 'function'},
                {name: 'five', value: 'Object'}
            ]
        });

        expect(() => {
            apis.invoke('argCheck4', [1, '2', '22', 33, {}]);
        }).to.throw('Array');
        
    });

    it('invalid function', () => {
        apis.add({
            invoke: ["ArgCheck"],
            name: "argCheck5",
            args: [
                {name: 'one', value: 'number'},
                {name: 'two', value: 'string'},
                {name: 'three', value: 'Array'},
                {name: 'four', value: 'function'},
                {name: 'five', value: 'Object'}
            ]
        });

        expect(() => {
            apis.invoke('argCheck5', [1, '2', ['22'], 33]);
        }).to.throw('function');
        
    });

    it('invalid object', () => {
        apis.add({
            invoke: ["ArgCheck"],
            name: "argCheck6",
            args: [
                {name: 'one', value: 'number'},
                {name: 'two', value: 'string'},
                {name: 'three', value: 'Array'},
                {name: 'four', value: 'function'},
                {name: 'five', value: 'Object'}
            ]
        });

        expect(() => {
            apis.invoke('argCheck6', [1, '2', ['22'], () => {}, 3]);
        }).to.throw(/object/i);
        
    });

    it('invalid required', () => {
        apis.add({
            invoke: ["ArgCheck"],
            name: "argCheck7",
            args: [
                {name: 'one', value: 'number'},
                {name: 'two', value: 'string'}
            ]
        });

        expect(() => {
            apis.invoke('argCheck7', []);
        }).to.throw(/required/i);
    });

    it('valid oneOfType shortcut', () => {
        apis.add({
            invoke: ["ArgCheck"],
            name: "argCheck8",
            args: [
                {name: 'one', value: 'number|string'}
            ]
        });

        expect(() => {
            apis.invoke('argCheck8', [1]);
        }).to.not.throw(Error);

        expect(() => {
            apis.invoke('argCheck8', ['2']);
        }).to.not.throw(Error);
    });

    it('invalid oneOfType shortcut', () => {
        apis.add({
            invoke: ["ArgCheck"],
            name: "argCheck9",
            args: [
                {name: 'one', value: 'number|string'}
            ]
        });

        expect(() => {
            apis.invoke('argCheck9', [true]);
        }).to.throw('oneOfType');

        expect(() => {
            apis.invoke('argCheck9', [{}]);
        }).to.throw('oneOfType');
    });

    it('valid oneOf', () => {
        apis.add({
            invoke: ["ArgCheck"],
            name: "argCheck10",
            args: [
                {
                    name: 'one', 
                    value: {
                        oneOf: [1, 2, 10]
                    }
                }
            ]
        });

        expect(() => {
            apis.invoke('argCheck10', [1]);
        }).to.not.throw(Error);

        expect(() => {
            apis.invoke('argCheck10', [10]);
        }).to.not.throw(Error);
    });

    it('invalid oneOf', () => {
        apis.add({
            invoke: ["ArgCheck"],
            name: "argCheck11",
            args: [
                {
                    name: 'one', 
                    value: {
                        oneOf: [1, 2, 10]
                    }
                }
            ]
        });

        expect(() => {
            apis.invoke('argCheck11', [3]);
        }).to.throw('oneOf');

        expect(() => {
            apis.invoke('argCheck11', ['2']);
        }).to.throw('oneOf');
    });

    it('not required shortcut', () => {
        apis.add({
            invoke: ["ArgCheck"],
            name: "argCheck12",
            args: [
                {name: 'one', value: 'number='}
            ]
        });

        expect(() => {
            apis.invoke('argCheck12', []);
        }).to.not.throw(Error);

        expect(() => {
            apis.invoke('argCheck12', [2]);
        }).to.not.throw(Error);

        expect(() => {
            apis.invoke('argCheck12', ['2']);
        }).to.throw('number');
    });

    it('arrayOf', () => {
        apis.add({
            invoke: ["ArgCheck"],
            name: "argCheck13",
            args: [
                {
                    name: 'one', 
                    value: {
                        arrayOf: 'string'
                    }
                }
            ]
        });

        expect(() => {
            apis.invoke('argCheck13', [true]);
        }).to.throw('Array');

        expect(() => {
            apis.invoke('argCheck13', [['2', '2']]);
        }).to.not.throw(Error);

        expect(() => {
            apis.invoke('argCheck13', [['2', 1, '3']]);
        }).to.throw('arrayOf');
    });

    it('arrayOf shortcut', () => {
        apis.add({
            invoke: ["ArgCheck"],
            name: "argCheck14",
            args: [
                {
                    name: 'one', 
                    value: 'string[]'
                }
            ]
        });

        expect(() => {
            apis.invoke('argCheck14', [true]);
        }).to.throw('Array');

        expect(() => {
            apis.invoke('argCheck14', [['2', '2']]);
        }).to.not.throw(Error);

        expect(() => {
            apis.invoke('argCheck14', [['2', 1, '3']]);
        }).to.throw('arrayOf');
    });



    it('type object declaration', () => {
        apis.add({
            invoke: ["ArgCheck"],
            name: "argCheck15",
            args: [
                {
                    name: 'one', 
                    value: {
                        type: {
                            name: 'string',
                            dep: 'string=',
                            age: 'number',
                            address: {
                                type: {
                                    country: 'string',
                                    city: 'string'
                                }
                            }
                        }
                    }
                }
            ]
        });

        expect(() => {
            apis.invoke('argCheck15', [{}]);
        }).to.throw('name');


        expect(() => {
            apis.invoke('argCheck15', [{name: 'hello', age: 0}]);
        }).to.not.throw(Error);

        expect(() => {
            apis.invoke('argCheck15', [{name: 'hello', dep: 'ssg', age: 0}]);
        }).to.not.throw(Error);

        expect(() => {
            apis.invoke('argCheck15', [{name: 'hello', dep: 'ssg'}]);
        }).to.throw('name');


        expect(() => {
            apis.invoke('argCheck15', [{name: 'hello', age: 0, address: 'beijing'}]);
        }).to.throw('name');

        expect(() => {
            apis.invoke('argCheck15', [{name: 'hello', dep: 'ssg', address: {country: 'china', city: 'beijing'}}]);
        }).to.throw('name');


        expect(() => {
            apis.invoke('argCheck15', [{name: 'hello', age: 20, address: {country: 'china'}}]);
        }).to.throw('name');

        expect(() => {
            apis.invoke('argCheck15', [{name: 'hello', age: 20, address: {country: 'china', city: 'beijing'}}]);
        }).to.not.throw(Error);

    });


    it('mix arrayOf and Object type', () => {
        apis.add({
            invoke: ["ArgCheck"],
            name: "argCheck16",
            args: [
                {
                    name: 'one', 
                    value: {
                        arrayOf: {
                            type: {
                                country: 'string',
                                city: 'string'
                            }
                        },
                        isRequired: true
                    }
                }
            ]
        });

        expect(() => {
            apis.invoke('argCheck16', []);
        }).to.throw('required');

        expect(() => {
            apis.invoke('argCheck16', [[]]);
        }).to.not.throw(Error);

        expect(() => {
            apis.invoke('argCheck16', [[
                {country: 'china', city: 'beijing'}, 
                {country: 'china', city: 'haikou'}
            ]]);
        }).to.not.throw(Error);

        expect(() => {
            apis.invoke('argCheck16', [[
                {country: 'china', city: 'beijing'}, 
                {country: 'china'}
            ]]);
        }).to.throw('arrayOf');
    });

    it('mix arrayOf and oneOf', () => {
        apis.add({
            invoke: ["ArgCheck"],
            name: "argCheck17",
            args: [
                {
                    name: 'one', 
                    value: {
                        arrayOf: {
                            oneOf: [1, 'one', '1']
                        }
                    }
                }
            ]
        });

        expect(() => {
            apis.invoke('argCheck17', [1]);
        }).to.throw('Array');

        expect(() => {
            apis.invoke('argCheck17', [[]]);
        }).to.not.throw(Error);

        expect(() => {
            apis.invoke('argCheck17', [[1, '1']]);
        }).to.not.throw(Error);

        expect(() => {
            apis.invoke('argCheck17', [[1,2]]);
        }).to.throw('arrayOf');
    });

    it('mix Object type and oneOf', () => {
        apis.add({
            invoke: ["ArgCheck"],
            name: "argCheck18",
            args: [
                {
                    name: 'dep', 
                    value: 'string'
                },
                {
                    name: 'leader', 
                    value: {
                        type: {
                            name: 'string',
                            sex: {
                                oneOf: ['male', 'female']
                            }
                        },
                        isRequired: true
                    }
                }
            ]
        });

        expect(() => {
            apis.invoke('argCheck18', ['ssg']);
        }).to.throw('required');

        expect(() => {
            apis.invoke('argCheck18', ['ssg', {
                name: 'hi',
                sex: 'female'
            }]);
        }).to.not.throw(Error);


        expect(() => {
            apis.invoke('argCheck18', ['ssg', {
                name: 'hi'
            }]);
        }).to.not.throw(Error);


        expect(() => {
            apis.invoke('argCheck18', ['ssg', {
                name: 'hi',
                sex: 'renyao'
            }]);
        }).to.throw('name');

        expect(() => {
            apis.invoke('argCheck18', [2, {
                name: 'hi',
                sex: 'male'
            }]);
        }).to.throw('string');

    });
});


describe('Processor ArgFuncArgDecode', () => {
    let tp1API = {};
    global.tp1API = tp1API;


    let apis;
    before(() => {
        apis = jsNative.createContainer();
    });

    it('auto decode JSON string to Object', () => {
        let sum = 0;

        apis.add({
            invoke: ['ArgFuncArgDecode:JSON', "CallMethod"],
            name: "api1",
            method: "tp1API.api1",
            args: [
                {name: 'one', type: 'number'},
                {name: 'two', type: 'function'}
            ]
        });
        tp1API.api1 = (one, two) => {
            expect(one).to.be.a('number');
            expect(two).to.be.a('function');

            two(JSON.stringify({one: 1, two: [2, 3], three: '3', four: true}));
        };

        apis.invoke('api1', [1, function (obj) {
            expect(obj).to.be.a('object');
            expect(obj.one).to.be.equal(1);
            expect(obj.two).to.be.an('Array');
            expect(obj.three).to.be.a('string');
            expect(obj.four).to.be.equal(true);
        }]);
    });

    it('auto decode JSON string to number', () => {
        let sum = 0;

        apis.add({
            invoke: ['ArgFuncArgDecode:JSON', "CallMethod"],
            name: "api2",
            method: "tp1API.api2",
            args: [
                {name: 'one', type: 'number'},
                {name: 'two', type: 'function'}
            ]
        });
        tp1API.api2 = (one, two) => {
            expect(one).to.be.a('number');
            expect(two).to.be.a('function');

            two('37');
        };

        apis.invoke('api2', [1, function (num) {
            expect(num).to.be.a('number');
            expect(num).to.be.equal(37);
        }]);
    });

    it('auto decode JSON string to Array', () => {
        let sum = 0;

        apis.add({
            invoke: ['ArgFuncArgDecode:JSON', "CallMethod"],
            name: "api3",
            method: "tp1API.api3",
            args: [
                {name: 'one', type: 'number'},
                {name: 'two', type: 'function'}
            ]
        });
        tp1API.api3 = (one, two) => {
            expect(one).to.be.a('number');
            expect(two).to.be.a('function');

            two(JSON.stringify([1, [2, 3], '3', true]));
        };

        apis.invoke('api3', [1, function (arr) {
            expect(arr).to.be.a('Array');
            expect(arr[0]).to.be.equal(1);
            expect(arr[1]).to.be.an('Array');
            expect(arr[2]).to.be.a('string');
            expect(arr[3]).to.be.equal(true);
        }]);
    });

});

