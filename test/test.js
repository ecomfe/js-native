require('../index');
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
                {name: 'one', value: 'number'},
                {name: 'two', value: 'number'}
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


    it('add by Array arg', () => {
        let sum = 0;

        apis.add([
            {
                invoke: ["CallMethod"],
                name: "api4",
                method: "tAPI.api4",
                args: [
                    {name: 'one', value: 'number'},
                    {name: 'two', value: 'number'}
                ]
            },

            {
                invoke: ["CallMethod"],
                name: "api5",
                method: "tAPI.api5",
                args: [
                    {name: 'one', value: 'number'},
                    {name: 'two', value: 'number'}
                ]
            }
        ]);
        tAPI.api4 = tAPI.api5 = (one, two) => {
            sum = one + two;
        };

        apis.invoke('api4', [1, 2, 3]);
        expect(sum).to.be.equal(3);

        apis.invoke('api5', [3, 2, 1]);
        expect(sum).to.be.equal(5);
    });

    it('name conflict, throw Error', () => {
        let sum = 0;

        apis.add({
            invoke: ["CallMethod"],
            name: "api6",
            method: "tAPI.api6",
            args: [
                {name: 'one', value: 'number'},
                {name: 'two', value: 'number'}
            ]
        });
        tAPI.api6 = (one, two) => {
            sum = one + two;
        };

        expect(() => {
            apis.add({
                invoke: ["CallMethod"],
                name: "api6",
                method: "tAPI.api6",
                args: [
                    {name: 'one', value: 'number'},
                    {name: 'two', value: 'number'}
                ]
            });
        }).to.throw('API exists');
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

    it('valid *', () => {
        apis.add({
            invoke: ["ArgCheck"],
            name: "argCheck19",
            args: [
                {name: 'one', value: 'number'},
                {name: 'two', value: '*'}
            ]
        });

        expect(() => {
            apis.invoke('argCheck19', [1, '2']);
        }).to.not.throw(Error);

        expect(() => {
            apis.invoke('argCheck19', [1, 2]);
        }).to.not.throw(Error);

        expect(() => {
            apis.invoke('argCheck19', [2]);
        }).to.not.throw(Error);

        expect(() => {
            apis.invoke('argCheck19', [3, null]);
        }).to.not.throw(Error);
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
        apis.add({
            invoke: ['ArgFuncArgDecode:JSON', "CallMethod"],
            name: "api1",
            method: "tp1API.api1",
            args: [
                {name: 'one', value: 'number'},
                {name: 'two', value: 'function'}
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
        apis.add({
            invoke: ['ArgFuncArgDecode:JSON', "CallMethod"],
            name: "api2",
            method: "tp1API.api2",
            args: [
                {name: 'one', value: 'number'},
                {name: 'two', value: 'function'}
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

describe('Processor ArgFuncEncode', () => {
    let tp2API = {};
    global.tp2API = tp2API;


    let apis;
    before(() => {
        apis = jsNative.createContainer();
    });

    it('encode function to string which hook to global', () => {
        apis.add({
            invoke: ['ArgCheck', 'ArgFuncEncode', "CallMethod"],
            name: "api1",
            method: "tp2API.api1",
            args: [
                {name: 'one', value: 'function'},
                {name: 'two', value: 'function'}
            ]
        });
        tp2API.api1 = (one, two) => {
            expect(one).to.be.a('string');
            expect(two).to.be.a('string');

            global[one](true);
            global[two]('{"name":"hello"}');
        };

        apis.invoke('api1', [
            value => {
                expect(value).to.be.equal(true);
                expect(value).to.be.a('boolean');
            },
            value => {
                expect(value).to.be.equal('{"name":"hello"}');
                expect(value).to.be.a('string');
            }
        ]);
    });

    it('mix ArgFuncArgDecode', () => {
        apis.add({
            invoke: ['ArgCheck', 'ArgFuncArgDecode:JSON', 'ArgFuncEncode', "CallMethod"],
            name: "api2",
            method: "tp2API.api2",
            args: [
                {name: 'one', value: 'function'},
                {name: 'two', value: 'function'},
                {name: 'three', value: 'number'}
            ]
        });
        tp2API.api2 = (one, two, three) => {
            expect(one).to.be.a('string');
            expect(two).to.be.a('string');
            expect(three).to.be.a('number');
            expect(three).to.be.equal(37);

            global[one]('"' + three + '"');
            global[two]('{"name":"hello"}');
        };

        apis.invoke('api2', [
            value => {
                expect(value).to.be.a('string');
                expect(value).to.be.equal('37');
            },
            value => {
                expect(value).to.be.a('object');
                expect(value.name).to.be.equal('hello');
            },
            37
        ]);
    });

});


describe('Processor ArgEncode', () => {
    let tp3API = {};
    global.tp3API = tp3API;


    let apis;
    before(() => {
        apis = jsNative.createContainer();
    });

    it('encode json', () => {
        apis.add({
            invoke: ['ArgCheck', 'ArgEncode:JSON', "CallMethod"],
            name: "api1",
            method: "tp3API.api1",
            args: [
                {name: 'one', value: 'string'},
                {name: 'two', value: 'number'},
                {name: 'three', value: 'boolean'},
                {name: 'four', value: 'object'}
            ]
        });
        tp3API.api1 = (one, two, three, four) => {
            expect(one).to.be.a('string');
            expect(two).to.be.a('string');
            expect(three).to.be.a('string');
            expect(four).to.be.a('string');

            expect(one).to.be.equal('"hello"');
            expect(two).to.be.equal('2');
            expect(three).to.be.equal('true');
            expect(four).to.be.equal('{"name":"hello"}');
        };

        apis.invoke('api1', [
            'hello',
            2,
            true,
            {name: 'hello'}
        ]);
    });

    it('mix ArgFuncEncode', () => {
        apis.add({
            invoke: ['ArgCheck', 'ArgFuncEncode', 'ArgEncode:JSON', "CallMethod"],
            name: "api2",
            method: "tp3API.api2",
            args: [
                {name: 'one', value: 'string'},
                {name: 'two', value: 'number'},
                {name: 'three', value: 'boolean'},
                {name: 'four', value: 'function'}
            ]
        });
        tp3API.api2 = (one, two, three, four) => {
            expect(one).to.be.a('string');
            expect(two).to.be.a('string');
            expect(three).to.be.a('string');
            expect(four).to.be.a('string');

            expect(one).to.be.equal('"hello"');
            expect(two).to.be.equal('2');
            expect(three).to.be.equal('true');

            let fn = global[JSON.parse(four)];
            expect(fn).to.be.a('function');

            fn(JSON.parse(two))
        };

        apis.invoke('api2', [
            'hello',
            2,
            true,
            function (two) {
                expect(two).to.be.a('number');
                expect(two).to.be.equal(2);
            } 
        ]);
    });


});

describe('Processor ArgCombine', () => {
    let apis;
    before(() => {
        apis = jsNative.createContainer();
    });

    it('JSONString', () => {
        apis.add({
            invoke: ['ArgCombine:JSONString'],
            name: 'api1',
            args: [
                {name: 'one', value: 'string'},
                {name: 'two', value: 'number'},
                {name: 'three', value: 'boolean'},
                {name: 'four', value: 'object'}
            ]
        });

        let resultStr = apis.invoke('api1', [
            'hello',
            2,
            true,
            {name: 'hello'}
        ]);
        expect(resultStr).to.be.a('string');


        let result = JSON.parse(resultStr);
        expect(result).to.be.a('object');
        expect(result.one).to.be.equal('hello');
        expect(result.two).to.be.equal(2);
        expect(result.three).to.be.equal(true);
        expect(result.four.name).to.be.equal('hello');

    });

    it('Object', () => {
        apis.add({
            invoke: ['ArgCombine:Object'],
            name: 'api2',
            args: [
                {name: 'one', value: 'string'},
                {name: 'two', value: 'number'},
                {name: 'three', value: 'boolean'},
                {name: 'four', value: 'object'}
            ]
        });

        let result = apis.invoke('api2', [
            'hello',
            2,
            true,
            {name: 'hello'}
        ]);

        expect(result).to.be.a('object');
        expect(result.one).to.be.equal('hello');
        expect(result.two).to.be.equal(2);
        expect(result.three).to.be.equal(true);
        expect(result.four.name).to.be.equal('hello');

    });

    it('Object with ArgFuncArgDecode and ArgFuncEncode', () => {
        apis.add({
            invoke: ["ArgFuncArgDecode:JSON", 'ArgFuncEncode', 'ArgCombine:Object'],
            name: 'api3',
            args: [
                {name: 'one', value: 'string'},
                {name: 'two', value: 'number'},
                {name: 'three', value: 'boolean'},
                {name: 'four', value: 'object'},
                {name: 'five', value: 'function'}
            ]
        });

        let result = apis.invoke('api3', [
            'hello',
            2,
            true,
            {name: 'hello'},
            function (arg) {
                expect(arg).to.be.a('object');
                expect(arg.name).to.be.equal('hello');
            }
        ]);

        expect(result).to.be.a('object');
        expect(result.one).to.be.equal('hello');
        expect(result.two).to.be.equal(2);
        expect(result.three).to.be.equal(true);
        expect(result.four.name).to.be.equal('hello');
        expect(result.five).to.be.a('string');
        expect(global[result.five]).to.be.a('function');

        global[result.five](JSON.stringify({name: 'hello'}));

    });

    it('URL', () => {
        apis.add({
            invoke: ['ArgCombine:URL'],
            name: 'api4',
            schema: 'nothttp',
            authority: 'net.com',
            path: '/request',
            args: [
                {name: 'one', value: 'string'},
                {name: 'two', value: 'string'}
            ]
            
        });

        let result = apis.invoke('api4', [
            'he/?&llo',
            'san'
        ]);

        expect(result).to.be.a('string');
        expect(result).to.contains('one=he%2F%3F%26llo');
        expect(result).to.contains('two=san');
        expect(result).to.contains('nothttp://net.com/request?');

    });

    it('URL with args JSON encode', () => {
        apis.add({
            invoke: [
                'ArgFuncArgDecode:JSON',
                'ArgFuncEncode',
                'ArgEncode:JSON',
                'ArgCombine:URL'
            ],
            name: 'api5',
            schema: 'nothttp',
            authority: 'net',
            path: '/request',
            args: [
                {name: 'url', value: 'string'},
                {name: 'method', value: 'string'},
                {name: 'onsuccess', value: 'function'}
            ]
            
        });

        let result = apis.invoke('api5', [
            'https://www.baidu.com/',
            'get',
            function (arg) {
                expect(arg).to.be.a('object');
                expect(arg.name).to.be.equal('hello');
            }
        ]);

        expect(result).to.be.a('string');
        expect(result).to.contains('url=%22https%3A%2F%2Fwww.baidu.com%2F%22');
        expect(result).to.contains('method=%22get%22');
        expect(result).to.contains('nothttp://net/request?');

        let query = {};
        result.slice(result.indexOf('?') + 1).split('&').forEach(item => {
            let pair = item.split('=');
            query[pair[0]] = JSON.parse(decodeURIComponent(pair[1]));
        });

        expect(query.url).to.be.equal('https://www.baidu.com/');
        expect(query.method).to.be.equal('get');
        expect(query.onsuccess).to.be.a('string');
        expect(global[query.onsuccess]).to.be.a('function');


        global[query.onsuccess](JSON.stringify({name: 'hello'}));

    });

    it('invalid option', () => {
        apis.add({
            invoke: ['ArgCombine:whatever'],
            name: 'api6',
            args: [
                {name: 'one', value: 'string'},
                {name: 'two', value: 'number'},
                {name: 'three', value: 'boolean'},
                {name: 'four', value: 'object'}
            ]
        });

        let result = apis.invoke('api6', [
            'hello',
            2,
            true,
            {name: 'hello'}
        ]);

        expect(result).to.be.an('Array');
        expect(result[0]).to.be.equal('hello');
        expect(result[1]).to.be.equal(2);
        expect(result[2]).to.be.equal(true);
        expect(result[3].name).to.be.equal('hello');

    });
});



describe('Processor ArgAdd', () => {
    let apis;
    before(() => {
        apis = jsNative.createContainer();
    });

    it('when no args', () => {
        apis.add({
            invoke: ['ArgAdd:name'],
            name: "api1"
        });

        let result = apis.invoke('api1');

        expect(result).to.be.a('Array');
        expect(result.length).to.be.equal(1);
        expect(result[0]).to.be.equal('api1');
    });


    it('when many args', () => {
        apis.add({
            invoke: ['ArgAdd:name'],
            name: "api2",
            args: [
                {name: 'one', value: 'string'},
                {name: 'two', value: 'number'},
                {name: 'three', value: 'boolean'},
                {name: 'four', value: 'object'}
            ]
        });

        let result = apis.invoke('api2', [
            'hello',
            2,
            true,
            {name: 'hello'}
        ]);

        expect(result).to.be.a('Array');
        expect(result.length).to.be.equal(5);
        expect(result[0]).to.be.equal('hello');
        expect(result[1]).to.be.equal(2);
        expect(result[4]).to.be.equal('api2');
    });

    it('pass args count not equal to declaration args count', () => {
        apis.add({
            invoke: ['ArgAdd:name'],
            name: "api3",
            args: [
                {name: 'one', value: 'string'},
                {name: 'two', value: 'number'},
                {name: 'three', value: 'boolean'},
                {name: 'four', value: 'object='}
            ]
        });

        let result = apis.invoke('api3', [
            'hello',
            2,
            true
        ]);

        expect(result).to.be.a('Array');
        expect(result.length).to.be.equal(5);
        expect(result[0]).to.be.equal('hello');
        expect(result[1]).to.be.equal(2);
        expect(result[3]).to.be.a('undefined');
        expect(result[4]).to.be.equal('api3');
    });
});


describe('Processor ReturnDecode', () => {
    let tp4API = {};
    global.tp4API = tp4API;


    let apis;
    before(() => {
        apis = jsNative.createContainer();
    });

    it('decode json', () => {
        apis.add({
            invoke: ['CallMethod', 'ReturnDecode:JSON'],
            name: "api1",
            method: "tp4API.api1",
            args: [
                {name: 'one', value: 'string'},
                {name: 'two', value: 'number'},
                {name: 'three', value: 'boolean'},
                {name: 'four', value: 'object'}
            ]
        });
        tp4API.api1 = (one, two, three, four) => {
            return JSON.stringify({one, two, three, four});
        };

        let result = apis.invoke('api1', [
            'hello',
            2,
            true,
            {name: 'hello'}
        ]);

        expect(result).to.be.a('object');
        expect(result.one).to.be.equal('hello');
        expect(result.two).to.be.equal(2);
        expect(result.three).to.be.equal(true);
        expect(result.four.name).to.be.equal('hello');
    });

    it('no decode when option is not equal to json', () => {
        apis.add({
            invoke: ['CallMethod', 'ReturnDecode:hello'],
            name: "api2",
            method: "tp4API.api2",
            args: [
                {name: 'one', value: 'string'},
                {name: 'two', value: 'number'},
                {name: 'three', value: 'boolean'},
                {name: 'four', value: 'object'}
            ]
        });
        tp4API.api2 = (one, two, three, four) => {
            return JSON.stringify({one, two, three, four});
        };

        let resultStr = apis.invoke('api2', [
            'hello',
            2,
            true,
            {name: 'hello'}
        ]);
        expect(resultStr).to.be.a('string');

        let result = JSON.parse(resultStr);
        expect(result).to.be.a('object');
        expect(result.one).to.be.equal('hello');
        expect(result.two).to.be.equal(2);
        expect(result.three).to.be.equal(true);
        expect(result.four.name).to.be.equal('hello');
    });


});

function decodeURL(source, decodeJSON) {
    let url = {query: {}};

    let queryStrStart = source.lastIndexOf('?');
    if (queryStrStart > 0) {
        let queryStr = source.slice(queryStrStart + 1);
        source = source.slice(0, queryStrStart);

        queryStr.split('&').forEach(item => {
            let pair = item.split('=');
            url.query[pair[0]] = decodeJSON 
                ? JSON.parse(decodeURIComponent(pair[1]))
                : decodeURIComponent(pair[1]);
        });
    }

    let match = /^([a-z]+):\/\/([^\/]+)(\/.*)$/i.exec(source);
    if (match) {
        url.schema = match[1];
        url.authority = match[2];
        url.path = match[3];
    }

    return url;
}

let promptRouter;

global.prompt = source => {
    if (promptRouter) {
        let {type, fn} = promptRouter;

        let data;
        switch (type) {
            case 'url':
                data = decodeURL(source);
                break;

            case 'json':
                data = JSON.parse(source);

        }

        return fn(data);
    }
};

global.prompt.setCurrent = (type, fn) => {
    promptRouter = {type, fn};
};

describe('Processor CallPrompt', () => {
    let apis;
    before(() => {
        apis = jsNative.createContainer();
    });

    it('pass url, and return string', () => {
        global.prompt.setCurrent('url', url => {
            expect(url.schema).to.be.equal('nothttp');
            expect(url.authority).to.be.equal('net');
            expect(url.path).to.be.equal('/request');
            expect(url.query.method).to.be.equal('get');
            expect(url.query.url).to.be.equal('http://www.baidu.com/');

            return JSON.stringify({
                one: 'hello',
                two: 2, 
                three: true, 
                four: {name: 'hello'}
            });
        });


        apis.add({
            invoke: ['CallPrompt'],
            name: "api1"
        });

        let resultStr = apis.invoke('api1', 'nothttp://net/request?url=http%3A%2F%2Fwww.baidu.com%2F&method=get');
        expect(resultStr).to.be.a('string');

        let result = JSON.parse(resultStr);
        expect(result).to.be.a('object');
        expect(result.one).to.be.equal('hello');
        expect(result.two).to.be.equal(2);
        expect(result.three).to.be.equal(true);
        expect(result.four.name).to.be.equal('hello');
    });

    it('pass json, and return string', () => {
        global.prompt.setCurrent('json', data => {
            expect(data.method).to.be.equal('get');
            expect(data.url).to.be.equal('http://www.baidu.com/');

            return JSON.stringify({
                one: 'hello',
                two: 2, 
                three: true, 
                four: {name: 'hello'}
            });
        });


        apis.add({
            invoke: ['CallPrompt'],
            name: "api2"
        });

        let resultStr = apis.invoke('api2', JSON.stringify({url: 'http://www.baidu.com/', method: 'get'}));
        expect(resultStr).to.be.a('string');

        let result = JSON.parse(resultStr);
        expect(result).to.be.a('object');
        expect(result.one).to.be.equal('hello');
        expect(result.two).to.be.equal(2);
        expect(result.three).to.be.equal(true);
        expect(result.four.name).to.be.equal('hello');
    });

});


let locationHandler;
function setLocationHandler(fn) {
    locationHandler = fn;
}

let realLocation;
global.location = {};
Object.defineProperty(global.location, 'href', {
    get: function () {
        return realLocation;
    },
    set: function (value) {
        realLocation = value;
        if (locationHandler) {
            locationHandler(value);
        }
    },
    enumerable : true,
    configurable : true
});



describe('Processor CallLocation', () => {
    let apis;
    before(() => {
        apis = jsNative.createContainer();
    });

    it('pass url, nothing return', () => {
        setLocationHandler(url => {
            expect(url).to.be.a('string');

            url = decodeURL(url);
            expect(url.schema).to.be.equal('nothttp');
            expect(url.authority).to.be.equal('net');
            expect(url.path).to.be.equal('/request');
            expect(url.query.method).to.be.equal('get');
            expect(url.query.url).to.be.equal('http://www.baidu.com/');

            return JSON.stringify({
                one: 'hello',
                two: 2, 
                three: true, 
                four: {name: 'hello'}
            });
        });


        apis.add({
            invoke: ['CallLocation'],
            name: "api1"
        });

        let resultStr = apis.invoke('api1', 'nothttp://net/request?url=http%3A%2F%2Fwww.baidu.com%2F&method=get');
        expect(resultStr).to.be.a('undefined');
    });

    it('async callback with JSON string', done => {
        setLocationHandler(url => {
            expect(url).to.be.a('string');

            url = decodeURL(url, 1);
            expect(url.schema).to.be.equal('nothttp');
            expect(url.authority).to.be.equal('net');
            expect(url.path).to.be.equal('/request');
            expect(url.query.method).to.be.equal('get');
            expect(url.query.url).to.be.equal('http://www.baidu.com/');

            setTimeout(
                () => {
                    global[url.query.onsuccess](JSON.stringify({
                        one: 'hello',
                        two: 2, 
                        three: true, 
                        four: {name: 'hello'}
                    }));

                    done();
                },
                10
            );
        });


        apis.add({
            invoke: [
                'ArgFuncArgDecode:JSON',
                'ArgFuncEncode',
                'ArgEncode:JSON',
                'ArgCombine:URL',
                'CallLocation'
            ],

            schema: "nothttp",
            authority: "net",
            path: "/request",
            name: "api2",

            args: [
                {name: 'url', value: 'string'},
                {name: 'method', value: 'number'},
                {name: 'onsuccess', value: 'function'}
            ]
        });

        let resultStr = apis.invoke('api2', [
            'http://www.baidu.com/', 
            'get', 
            result => {
                expect(result).to.be.a('object');
                expect(result.one).to.be.equal('hello');
                expect(result.two).to.be.equal(2);
                expect(result.three).to.be.equal(true);
                expect(result.four.name).to.be.equal('hello');
            }
        ]);
        expect(resultStr).to.be.a('undefined');
    });

});


let iframeHandler;
function setIframeHandler(fn) {
    iframeHandler = fn;
}


global.document = {
    createElement(tagName) {
        if (!/^iframe$/i.test(tagName)) {
            throw new Error('not supported');
        }

        return {};
    },

    body: {
        appendChild(obj) {
            if (iframeHandler) {
                iframeHandler(obj.src);
            }
        },

        removeChild(obj) {}
    }
};

describe('Processor CallIframe', () => {
    let apis;
    before(() => {
        apis = jsNative.createContainer();
    });

    it('pass url, nothing return', () => {
        setIframeHandler(url => {
            expect(url).to.be.a('string');

            url = decodeURL(url);
            expect(url.schema).to.be.equal('nothttp');
            expect(url.authority).to.be.equal('net');
            expect(url.path).to.be.equal('/request');
            expect(url.query.method).to.be.equal('get');
            expect(url.query.url).to.be.equal('http://www.baidu.com/');

            return JSON.stringify({
                one: 'hello',
                two: 2, 
                three: true, 
                four: {name: 'hello'}
            });
        });


        apis.add({
            invoke: ['CallIframe'],
            name: "api1"
        });

        let resultStr = apis.invoke('api1', 'nothttp://net/request?url=http%3A%2F%2Fwww.baidu.com%2F&method=get');
        expect(resultStr).to.be.a('undefined');
    });

    it('async callback with JSON string', done => {
        setIframeHandler(url => {
            expect(url).to.be.a('string');

            url = decodeURL(url, 1);
            expect(url.schema).to.be.equal('nothttp');
            expect(url.authority).to.be.equal('net');
            expect(url.path).to.be.equal('/request');
            expect(url.query.method).to.be.equal('get');
            expect(url.query.url).to.be.equal('http://www.baidu.com/');

            setTimeout(
                () => {
                    global[url.query.onsuccess](JSON.stringify({
                        one: 'hello',
                        two: 2, 
                        three: true, 
                        four: {name: 'hello'}
                    }));

                    done();
                },
                10
            );
        });


        apis.add({
            invoke: [
                'ArgFuncArgDecode:JSON',
                'ArgFuncEncode',
                'ArgEncode:JSON',
                'ArgCombine:URL',
                'CallIframe'
            ],

            schema: "nothttp",
            authority: "net",
            path: "/request",
            name: "api2",

            args: [
                {name: 'url', value: 'string'},
                {name: 'method', value: 'string'},
                {name: 'onsuccess', value: 'function'}
            ]
        });

        let resultStr = apis.invoke('api2', [
            'http://www.baidu.com/', 
            'get', 
            result => {
                expect(result).to.be.a('object');
                expect(result.one).to.be.equal('hello');
                expect(result.two).to.be.equal(2);
                expect(result.three).to.be.equal(true);
                expect(result.four.name).to.be.equal('hello');
            }
        ]);
        expect(resultStr).to.be.a('undefined');
    });

});


global.webkit = {messageHandlers: {}};
let messageHandler;
function setMessageHandler(handler, fn) {
    messageHandler = fn;
    global.webkit.messageHandlers[handler] = {
        postMessage: handleMessage
    };
}


function handleMessage(data) {
    if (messageHandler) {
        messageHandler(data);
    }
}


describe('Processor CallMessage', () => {
    let apis;
    before(() => {
        apis = jsNative.createContainer();
    });

    it('pass object, every item is string', () => {
        setMessageHandler('justtest', data => {
            expect(data).to.be.a('object');
            expect(data.method).to.be.equal('get');
            expect(data.url).to.be.equal('http://www.baidu.com/');

            return JSON.stringify({
                one: 'hello',
                two: 2, 
                three: true, 
                four: {name: 'hello'}
            });
        });


        apis.add({
            invoke: ['CallMessage'],
            handler: 'justtest',
            name: "api1"
        });

        let resultStr = apis.invoke('api1', {
            url: 'http://www.baidu.com/',
            method: 'get'
        });
        expect(resultStr).to.be.a('undefined');
    });

    it('async callback with JSON string', done => {
        setMessageHandler('justtest', data => {
            expect(data).to.be.a('object');

            expect(data._name).to.be.equal('api2');
            expect(data.method).to.be.equal('get');
            expect(data.url).to.be.equal('http://www.baidu.com/');

            setTimeout(
                () => {
                    global[data.onsuccess](JSON.stringify({
                        one: 'hello',
                        two: 2, 
                        three: true, 
                        four: {name: 'hello'}
                    }));

                    done();
                },
                10
            );
        });


        apis.add({
            invoke: [
                "ArgFuncArgDecode:JSON",
                "ArgFuncEncode",
                "ArgAdd:name",
                "ArgCombine:Object",
                "CallMessage"
            ],

            handler: 'justtest',
            name: "api2",

            args: [
                {name: 'url', value: 'string'},
                {name: 'method', value: 'string'},
                {name: 'onsuccess', value: 'function'}
            ]
        });

        let resultStr = apis.invoke('api2', [
            'http://www.baidu.com/', 
            'get', 
            result => {
                expect(result).to.be.a('object');
                expect(result.one).to.be.equal('hello');
                expect(result.two).to.be.equal(2);
                expect(result.three).to.be.equal(true);
                expect(result.four.name).to.be.equal('hello');
            }
        ]);
        expect(resultStr).to.be.a('undefined');
    });
});


describe('Shortcut method', () => {
    let sc1API = {};
    global.sc1API = sc1API;


    let apis;
    before(() => {
        apis = jsNative.createContainer();
    });

    it('args error', () => {
        apis.add({
            invoke: 'method',
            name: "api1",
            method: "sc1API.api1",
            args: [
                {name: 'req', value: {
                    type: {
                        url: 'string',
                        method: 'string='
                    }
                }},
                {name: 'onsuccess', value: 'function'}
            ]
        });
        sc1API.api1 = (req, onsuccess) => {
            expect(true).to.be.equal(false);

            let data = {
                one: 'hello',
                two: 2, 
                three: true, 
                four: {name: 'hello'},
                url: req.url,
                method: req.method
            };

            onsuccess(data);
            return data;
        };

        expect(() => {
            apis.invoke('api1', [{}, function (obj) {
                expect(obj).to.be.a('object');
                expect(obj.one).to.be.equal('hello');
                expect(obj.two).to.be.equal(2);
                expect(obj.three).to.be.a('boolean');
                expect(obj.four.name).to.be.equal('hello');
            }]);
        }).to.throw('Argument Error');
        
    });

    

    it('success call, check args、return value and callback', () => {
        apis.add({
            invoke: 'method',
            name: "api2",
            method: "sc1API.api2",
            args: [
                {name: 'req', value: {
                    type: {
                        url: 'string',
                        method: 'string='
                    }
                }},
                {name: 'onsuccess', value: 'function'}
            ]
        });
        sc1API.api2 = (req, onsuccess) => {
            let data = {
                one: 'hello',
                two: 2, 
                three: true, 
                four: {name: 'hello'},
                url: req.url,
                method: req.method
            };

            onsuccess(data);
            return data;
        };

        let returnValue = apis.invoke('api2', [
            {url: 'http://www.baidu.com/'}, 
            function (obj) {
                expect(obj).to.be.a('object');
                expect(obj.one).to.be.equal('hello');
                expect(obj.two).to.be.equal(2);
                expect(obj.three).to.be.a('boolean');
                expect(obj.four.name).to.be.equal('hello');

                expect(obj.url).to.be.equal('http://www.baidu.com/');
                expect(obj.method).to.be.a('undefined');
            }
        ]);
        
        expect(returnValue).to.be.a('object');
        expect(returnValue.one).to.be.equal('hello');
        expect(returnValue.two).to.be.equal(2);
        expect(returnValue.three).to.be.a('boolean');
        expect(returnValue.four.name).to.be.equal('hello');

        expect(returnValue.url).to.be.equal('http://www.baidu.com/');
        expect(returnValue.method).to.be.a('undefined');
    });

    it('call with map api, check args、return value and callback', () => {
        let sum = 0;

        apis.add({
            invoke: 'method',
            name: "api3",
            method: "sc1API.api3",
            args: [
                {name: 'req', value: {
                    type: {
                        url: 'string',
                        method: 'string='
                    }
                }},
                {name: 'onsuccess', value: 'function'}
            ]
        });
        sc1API.api3 = (req, onsuccess) => {
            let data = {
                one: 'hello',
                two: 2, 
                three: true, 
                four: {name: 'hello'},
                url: req.url,
                method: req.method
            };

            onsuccess(data);
            return data;
        };

        let apiObj = apis.map({api3: 'thisTest'});

        let returnValue = apiObj.thisTest(
            {url: 'http://www.baidu.com/'}, 
            function (obj) {
                expect(obj).to.be.a('object');
                expect(obj.one).to.be.equal('hello');
                expect(obj.two).to.be.equal(2);
                expect(obj.three).to.be.a('boolean');
                expect(obj.four.name).to.be.equal('hello');

                expect(obj.url).to.be.equal('http://www.baidu.com/');
                expect(obj.method).to.be.a('undefined');
            }
        );
        
        expect(returnValue).to.be.a('object');
        expect(returnValue.one).to.be.equal('hello');
        expect(returnValue.two).to.be.equal(2);
        expect(returnValue.three).to.be.a('boolean');
        expect(returnValue.four.name).to.be.equal('hello');

        expect(returnValue.url).to.be.equal('http://www.baidu.com/');
        expect(returnValue.method).to.be.a('undefined');

        expect(() => {
            apiObj.thisTest({url: 'http://www.baidu.com/'});
        }).to.throw('Argument Error');

        let otherApiObj = apis.map();
        let otherReturnValue = otherApiObj.api3(
            {url: 'http://www.baidu.com/'}, 
            function (obj) {
                expect(obj).to.be.a('object');
                expect(obj.one).to.be.equal('hello');
                expect(obj.two).to.be.equal(2);
                expect(obj.three).to.be.a('boolean');
                expect(obj.four.name).to.be.equal('hello');

                expect(obj.url).to.be.equal('http://www.baidu.com/');
                expect(obj.method).to.be.a('undefined');
            }
        );
        
        expect(otherReturnValue).to.be.a('object');
        expect(otherReturnValue.one).to.be.equal('hello');
        expect(otherReturnValue.two).to.be.equal(2);
        expect(otherReturnValue.three).to.be.a('boolean');
        expect(otherReturnValue.four.name).to.be.equal('hello');

        expect(otherReturnValue.url).to.be.equal('http://www.baidu.com/');
        expect(otherReturnValue.method).to.be.a('undefined');
    });

    it('many many args', () => {
        apis.add({
            invoke: 'method',
            name: "api4",
            method: "sc1API.api4",
            args: [
                {name: 'one', value: 'string'},
                {name: 'two', value: 'number'},
                {name: 'three', value: 'boolean'},
                {name: 'four', value: 'object'},
                {name: 'five', value: 'string'},
                {name: 'six', value: 'number'},
                {name: 'seven', value: 'boolean'},
                {name: 'eight', value: 'object'}
            ]
        });
        sc1API.api4 = (one, two, three, four, five, six, seven, eight) => {
            return JSON.stringify({one, two, three, four, five, six, seven, eight});
        };

        let resultStr = apis.invoke('api4', [
            'hello',
            2,
            true,
            {name: 'hello'},
            'hello',
            2,
            true,
            {name: 'hello'}
        ]);
        expect(resultStr).to.be.a('string');

        let result = JSON.parse(resultStr);
        expect(result).to.be.a('object');
        expect(result.one).to.be.equal('hello');
        expect(result.two).to.be.equal(2);
        expect(result.three).to.be.equal(true);
        expect(result.four.name).to.be.equal('hello');
        expect(result.five).to.be.equal('hello');
        expect(result.six).to.be.equal(2);
        expect(result.seven).to.be.equal(true);
        expect(result.eight.name).to.be.equal('hello');
    });

});


describe('Shortcut method.json', () => {
    let sc2API = {};
    global.sc2API = sc2API;


    let apis;
    before(() => {
        apis = jsNative.createContainer();
    });

    it('success call, check args、return value and callback', () => {
        apis.add({
            invoke: 'method.json',
            name: "api2",
            method: "sc2API.api2",
            args: [
                {name: 'req', value: {
                    type: {
                        url: 'string',
                        method: 'string='
                    }
                }},
                {name: 'onsuccess', value: 'function'}
            ]
        });
        sc2API.api2 = (req, onsuccess) => {
            req = JSON.parse(req);
            onsuccess = JSON.parse(onsuccess);

            let data = JSON.stringify({
                one: 'hello',
                two: 2, 
                three: true, 
                four: {name: 'hello'},
                url: req.url,
                method: req.method
            });

            global[onsuccess](data);
            return data;
        };

        let returnValue = apis.invoke('api2', [
            {url: 'http://www.baidu.com/'}, 
            function (obj) {

                expect(obj).to.be.a('object');
                expect(obj.one).to.be.equal('hello');
                expect(obj.two).to.be.equal(2);
                expect(obj.three).to.be.a('boolean');
                expect(obj.four.name).to.be.equal('hello');

                expect(obj.url).to.be.equal('http://www.baidu.com/');
                expect(obj.method).to.be.a('undefined');
            }
        ]);
        
        expect(returnValue).to.be.a('object');
        expect(returnValue.one).to.be.equal('hello');
        expect(returnValue.two).to.be.equal(2);
        expect(returnValue.three).to.be.a('boolean');
        expect(returnValue.four.name).to.be.equal('hello');

        expect(returnValue.url).to.be.equal('http://www.baidu.com/');
        expect(returnValue.method).to.be.a('undefined');
    });

    it('call with map api, check args、return value and callback', () => {
        apis.add({
            invoke: 'method.json',
            name: "api3",
            method: "sc2API.api3",
            args: [
                {name: 'req', value: {
                    type: {
                        url: 'string',
                        method: 'string='
                    }
                }},
                {name: 'onsuccess', value: 'function'}
            ]
        });
        sc2API.api3 = (req, onsuccess) => {

            req = JSON.parse(req);
            onsuccess = JSON.parse(onsuccess);

            let data = JSON.stringify({
                one: 'hello',
                two: 2, 
                three: true, 
                four: {name: 'hello'},
                url: req.url,
                method: req.method
            });

            global[onsuccess](data);
            return data;
        };

        let apiObj = apis.map({api3: 'thisTest'});

        let returnValue = apiObj.thisTest(
            {url: 'http://www.baidu.com/'}, 
            function (obj) {
                expect(obj).to.be.a('object');
                expect(obj.one).to.be.equal('hello');
                expect(obj.two).to.be.equal(2);
                expect(obj.three).to.be.a('boolean');
                expect(obj.four.name).to.be.equal('hello');

                expect(obj.url).to.be.equal('http://www.baidu.com/');
                expect(obj.method).to.be.a('undefined');
            }
        );
        
        expect(returnValue).to.be.a('object');
        expect(returnValue.one).to.be.equal('hello');
        expect(returnValue.two).to.be.equal(2);
        expect(returnValue.three).to.be.a('boolean');
        expect(returnValue.four.name).to.be.equal('hello');

        expect(returnValue.url).to.be.equal('http://www.baidu.com/');
        expect(returnValue.method).to.be.a('undefined');

        expect(() => {
            apiObj.thisTest({url: 'http://www.baidu.com/'});
        }).to.throw('Argument Error');
    });

});


describe('Shortcut prompt.json', () => {
    let apis;
    before(() => {
        apis = jsNative.createContainer();
    });

    it('success call, check args、return value and callback', () => {
        apis.add({
            invoke: 'prompt.json',
            name: "api1",
            args: [
                {name: 'req', value: {
                    type: {
                        url: 'string',
                        method: 'string='
                    }
                }},
                {name: 'onsuccess', value: 'function'}
            ]
        });

        global.prompt.setCurrent('json', arg => {
            let data = JSON.stringify({
                one: 'hello',
                two: 2, 
                three: true, 
                four: {name: 'hello'},
                url: arg.req.url,
                method: arg.req.method
            });

            expect(arg._name).to.be.equal('api1');

            global[arg.onsuccess](data);
            return data;
        });
        

        let returnValue = apis.invoke('api1', [
            {url: 'http://www.baidu.com/'}, 
            function (obj) {

                expect(obj).to.be.a('object');
                expect(obj.one).to.be.equal('hello');
                expect(obj.two).to.be.equal(2);
                expect(obj.three).to.be.a('boolean');
                expect(obj.four.name).to.be.equal('hello');

                expect(obj.url).to.be.equal('http://www.baidu.com/');
                expect(obj.method).to.be.a('undefined');
            }
        ]);
        
        expect(returnValue).to.be.a('object');
        expect(returnValue.one).to.be.equal('hello');
        expect(returnValue.two).to.be.equal(2);
        expect(returnValue.three).to.be.a('boolean');
        expect(returnValue.four.name).to.be.equal('hello');

        expect(returnValue.url).to.be.equal('http://www.baidu.com/');
        expect(returnValue.method).to.be.a('undefined');
    });

    
    it('call with map api, check args、return value and callback', () => {
        apis.add({
            invoke: 'prompt.json',
            name: "api2",
            args: [
                {name: 'req', value: {
                    type: {
                        url: 'string',
                        method: 'string='
                    }
                }},
                {name: 'onsuccess', value: 'function'}
            ]
        });

        global.prompt.setCurrent('json', arg => {
            let data = JSON.stringify({
                one: 'hello',
                two: 2, 
                three: true, 
                four: {name: 'hello'},
                url: arg.req.url,
                method: arg.req.method
            });

            expect(arg._name).to.be.equal('api2');

            global[arg.onsuccess](data);
            return data;
        });

        let apiObj = apis.map({api2: 'thisTest'});

        let returnValue = apiObj.thisTest(
            {url: 'http://www.baidu.com/'}, 
            function (obj) {
                expect(obj).to.be.a('object');
                expect(obj.one).to.be.equal('hello');
                expect(obj.two).to.be.equal(2);
                expect(obj.three).to.be.a('boolean');
                expect(obj.four.name).to.be.equal('hello');

                expect(obj.url).to.be.equal('http://www.baidu.com/');
                expect(obj.method).to.be.a('undefined');
            }
        );
        
        expect(returnValue).to.be.a('object');
        expect(returnValue.one).to.be.equal('hello');
        expect(returnValue.two).to.be.equal(2);
        expect(returnValue.three).to.be.a('boolean');
        expect(returnValue.four.name).to.be.equal('hello');

        expect(returnValue.url).to.be.equal('http://www.baidu.com/');
        expect(returnValue.method).to.be.a('undefined');

        expect(() => {
            apiObj.thisTest({url: 'http://www.baidu.com/'});
        }).to.throw('Argument Error');
    });

});


describe('Shortcut prompt.url', () => {
    let apis;
    before(() => {
        apis = jsNative.createContainer();
    });

    it('success call, check args、return value and callback', () => {
        apis.add({
            invoke: 'prompt.url',
            name: "api1",
            schema: "nothttp",
            authority: "net",
            path: "/request",
            args: [
                {name: 'req', value: {
                    type: {
                        url: 'string',
                        method: 'string='
                    }
                }},
                {name: 'onsuccess', value: 'function'}
            ]
        });

        global.prompt.setCurrent('url', url => {
            let arg = url.query;
            let req = JSON.parse(arg.req);

            let data = JSON.stringify({
                one: 'hello',
                two: 2, 
                three: true, 
                four: {name: 'hello'},
                url: req.url,
                method: req.method
            });

            global[JSON.parse(arg.onsuccess)](data);
            return data;
        });
        

        let returnValue = apis.invoke('api1', [
            {url: 'http://www.baidu.com/'}, 
            function (obj) {

                expect(obj).to.be.a('object');
                expect(obj.one).to.be.equal('hello');
                expect(obj.two).to.be.equal(2);
                expect(obj.three).to.be.a('boolean');
                expect(obj.four.name).to.be.equal('hello');

                expect(obj.url).to.be.equal('http://www.baidu.com/');
                expect(obj.method).to.be.a('undefined');
            }
        ]);
        
        expect(returnValue).to.be.a('object');
        expect(returnValue.one).to.be.equal('hello');
        expect(returnValue.two).to.be.equal(2);
        expect(returnValue.three).to.be.a('boolean');
        expect(returnValue.four.name).to.be.equal('hello');

        expect(returnValue.url).to.be.equal('http://www.baidu.com/');
        expect(returnValue.method).to.be.a('undefined');
    });


    it('call with map api, check args、return value and callback', () => {
        apis.add({
            invoke: 'prompt.url',
            name: "api2",

            schema: "nothttp",
            authority: "net",
            path: "/request",

            args: [
                {name: 'req', value: {
                    type: {
                        url: 'string',
                        method: 'string='
                    }
                }},
                {name: 'onsuccess', value: 'function'}
            ]
        });

        global.prompt.setCurrent('url', url => {
            let arg = url.query;
            let req = JSON.parse(arg.req);
            let onsuccess = JSON.parse(arg.onsuccess);

            let data = JSON.stringify({
                one: 'hello',
                two: 2, 
                three: true, 
                four: {name: 'hello'},
                url: req.url,
                method: req.method
            });

            global[onsuccess](data);
            return data;
        });

        let apiObj = apis.map({api2: 'thisTest'});

        let returnValue = apiObj.thisTest(
            {url: 'http://www.baidu.com/'}, 
            function (obj) {
                expect(obj).to.be.a('object');
                expect(obj.one).to.be.equal('hello');
                expect(obj.two).to.be.equal(2);
                expect(obj.three).to.be.a('boolean');
                expect(obj.four.name).to.be.equal('hello');

                expect(obj.url).to.be.equal('http://www.baidu.com/');
                expect(obj.method).to.be.a('undefined');
            }
        );
        
        expect(returnValue).to.be.a('object');
        expect(returnValue.one).to.be.equal('hello');
        expect(returnValue.two).to.be.equal(2);
        expect(returnValue.three).to.be.a('boolean');
        expect(returnValue.four.name).to.be.equal('hello');

        expect(returnValue.url).to.be.equal('http://www.baidu.com/');
        expect(returnValue.method).to.be.a('undefined');

        expect(() => {
            apiObj.thisTest({url: 'http://www.baidu.com/'});
        }).to.throw('Argument Error');
    });

});


describe('Shortcut location', () => {
    let apis;
    before(() => {
        apis = jsNative.createContainer();
    });

    it('success call, check args、return value and callback', () => {
        apis.add({
            invoke: 'location',
            name: "api1",
            schema: "nothttp",
            authority: "net",
            path: "/request",
            args: [
                {name: 'req', value: {
                    type: {
                        url: 'string',
                        method: 'string='
                    }
                }},
                {name: 'onsuccess', value: 'function'}
            ]
        });

        setLocationHandler(url => {
            url = decodeURL(url, 1);
            let arg = url.query;


            let data = JSON.stringify({
                one: 'hello',
                two: 2, 
                three: true, 
                four: {name: 'hello'},
                url: arg.req.url,
                method: arg.req.method
            });

            global[arg.onsuccess](data);
            return data;
        });
        

        let returnValue = apis.invoke('api1', [
            {url: 'http://www.baidu.com/'}, 
            function (obj) {

                expect(obj).to.be.a('object');
                expect(obj.one).to.be.equal('hello');
                expect(obj.two).to.be.equal(2);
                expect(obj.three).to.be.a('boolean');
                expect(obj.four.name).to.be.equal('hello');

                expect(obj.url).to.be.equal('http://www.baidu.com/');
                expect(obj.method).to.be.a('undefined');
            }
        ]);
        
        expect(returnValue).to.be.a('undefined');
    });

    it('call with map api, check args、return value and callback', done => {
        apis.add({
            invoke: 'location',
            name: "api2",

            schema: "nothttp",
            authority: "net",
            path: "/request",

            args: [
                {name: 'req', value: {
                    type: {
                        url: 'string',
                        method: 'string='
                    }
                }},
                {name: 'onsuccess', value: 'function'}
            ]
        });

        setLocationHandler(url => {
            url = decodeURL(url, 1);
            let arg = url.query;


            let data = JSON.stringify({
                one: 'hello',
                two: 2, 
                three: true, 
                four: {name: 'hello'},
                url: arg.req.url,
                method: arg.req.method
            });

            setTimeout(() => {
                global[arg.onsuccess](data);
            }, 10);
            return data;
        });

        let apiObj = apis.map({api2: 'thisTest'});


        expect(() => {
            apiObj.thisTest({url: 'http://www.baidu.com/'});
        }).to.throw('Argument Error');

        let returnValue = apiObj.thisTest(
            {url: 'http://www.baidu.com/'}, 
            function (obj) {
                expect(obj).to.be.a('object');
                expect(obj.one).to.be.equal('hello');
                expect(obj.two).to.be.equal(2);
                expect(obj.three).to.be.a('boolean');
                expect(obj.four.name).to.be.equal('hello');

                expect(obj.url).to.be.equal('http://www.baidu.com/');
                expect(obj.method).to.be.a('undefined');

                done();
            }
        );
        
        expect(returnValue).to.be.a('undefined');
    });

});


describe('Shortcut iframe', () => {
    let apis;
    before(() => {
        apis = jsNative.createContainer();
    });

    it('success call, check args、return value and callback', () => {
        apis.add({
            invoke: 'iframe',
            name: "api1",
            schema: "nothttp",
            authority: "net",
            path: "/request",
            args: [
                {name: 'req', value: {
                    type: {
                        url: 'string',
                        method: 'string='
                    }
                }},
                {name: 'onsuccess', value: 'function'}
            ]
        });

        setIframeHandler(url => {
            url = decodeURL(url, 1);
            let arg = url.query;


            let data = JSON.stringify({
                one: 'hello',
                two: 2, 
                three: true, 
                four: {name: 'hello'},
                url: arg.req.url,
                method: arg.req.method
            });

            global[arg.onsuccess](data);
            return data;
        });
        

        let returnValue = apis.invoke('api1', [
            {url: 'http://www.baidu.com/'}, 
            function (obj) {

                expect(obj).to.be.a('object');
                expect(obj.one).to.be.equal('hello');
                expect(obj.two).to.be.equal(2);
                expect(obj.three).to.be.a('boolean');
                expect(obj.four.name).to.be.equal('hello');

                expect(obj.url).to.be.equal('http://www.baidu.com/');
                expect(obj.method).to.be.a('undefined');
            }
        ]);
        
        expect(returnValue).to.be.a('undefined');
    });

    it('call with map api, check args、return value and callback', done => {
        apis.add({
            invoke: 'iframe',
            name: "api2",

            schema: "nothttp",
            authority: "net",
            path: "/request",

            args: [
                {name: 'req', value: {
                    type: {
                        url: 'string',
                        method: 'string='
                    }
                }},
                {name: 'onsuccess', value: 'function'}
            ]
        });

        setIframeHandler(url => {
            url = decodeURL(url, 1);
            let arg = url.query;


            let data = JSON.stringify({
                one: 'hello',
                two: 2, 
                three: true, 
                four: {name: 'hello'},
                url: arg.req.url,
                method: arg.req.method
            });

            setTimeout(() => {
                global[arg.onsuccess](data);
            }, 10);
            return data;
        });

        let apiObj = apis.map({api2: 'thisTest'});


        expect(() => {
            apiObj.thisTest({url: 'http://www.baidu.com/'});
        }).to.throw('Argument Error');

        let returnValue = apiObj.thisTest(
            {url: 'http://www.baidu.com/'}, 
            function (obj) {
                expect(obj).to.be.a('object');
                expect(obj.one).to.be.equal('hello');
                expect(obj.two).to.be.equal(2);
                expect(obj.three).to.be.a('boolean');
                expect(obj.four.name).to.be.equal('hello');

                expect(obj.url).to.be.equal('http://www.baidu.com/');
                expect(obj.method).to.be.a('undefined');

                done();
            }
        );
        
        expect(returnValue).to.be.a('undefined');
    });

});


describe('Shortcut message', () => {
    let apis;
    before(() => {
        apis = jsNative.createContainer();
    });

    it('success call, check args、return value and callback', () => {
        apis.add({
            invoke: 'message',
            name: "api1",
            handler: 'net',
            args: [
                {name: 'req', value: {
                    type: {
                        url: 'string',
                        method: 'string='
                    }
                }},
                {name: 'onsuccess', value: 'function'}
            ]
        });

        setMessageHandler('net', arg => {

            let data = JSON.stringify({
                one: 'hello',
                two: 2, 
                three: true, 
                four: {name: 'hello'},
                url: arg.req.url,
                method: arg.req.method
            });

            global[arg.onsuccess](data);
            return data;
        });
        

        let returnValue = apis.invoke('api1', [
            {url: 'http://www.baidu.com/'}, 
            function (obj) {

                expect(obj).to.be.a('object');
                expect(obj.one).to.be.equal('hello');
                expect(obj.two).to.be.equal(2);
                expect(obj.three).to.be.a('boolean');
                expect(obj.four.name).to.be.equal('hello');

                expect(obj.url).to.be.equal('http://www.baidu.com/');
                expect(obj.method).to.be.a('undefined');
            }
        ]);
        
        expect(returnValue).to.be.a('undefined');
    });

    it('call with map api, check args、return value and callback', done => {
        apis.add({
            invoke: 'message',
            name: "api2",

            handler: 'net',

            args: [
                {name: 'req', value: {
                    type: {
                        url: 'string',
                        method: 'string='
                    }
                }},
                {name: 'onsuccess', value: 'function'}
            ]
        });

        setMessageHandler('net', arg => {

            let data = JSON.stringify({
                one: 'hello',
                two: 2, 
                three: true, 
                four: {name: 'hello'},
                url: arg.req.url,
                method: arg.req.method
            });

            setTimeout(() => {
                global[arg.onsuccess](data);
            }, 10);
            
            return data;
        });

        let apiObj = apis.map({api2: 'thisTest'});


        expect(() => {
            apiObj.thisTest({url: 'http://www.baidu.com/'});
        }).to.throw('Argument Error');

        let returnValue = apiObj.thisTest(
            {url: 'http://www.baidu.com/'}, 
            function (obj) {
                expect(obj).to.be.a('object');
                expect(obj.one).to.be.equal('hello');
                expect(obj.two).to.be.equal(2);
                expect(obj.three).to.be.a('boolean');
                expect(obj.four.name).to.be.equal('hello');

                expect(obj.url).to.be.equal('http://www.baidu.com/');
                expect(obj.method).to.be.a('undefined');

                done();
            }
        );
        
        expect(returnValue).to.be.a('undefined');
    });

});
