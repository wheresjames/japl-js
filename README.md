
# japl (Just Another Promise Library)

Promise loop implementations.


## Simple promise while / do-while

``` javascript

    const Log = console.log;
    const japl = require('japl');

    let n = 10;
    function rto(v, min=100,ran=500)
             {  return new Promise(r => setTimeout(()=>r(v),
                                                   min + Math.floor(Math.random() * ran)));
             }

    // Decrease n and delay until n is zero
    japl.promiseWhile( r => 0 < n,                      // Condition
                       () => { n--; return rto(n); })   // Do something
        .then( r => { Log(`Results : ${r}`); })         // Results
        .catch( e => Log(e) );                          // Errors

```

## Process in batches

Batch functions allow processing up to batchSize number of promises simultaneously.
The function is otherwise the same, but be aware promises may finish in a different
order than they were started.

``` javascript

    const Log = console.log;
    const japl = require('japl');
    const batchSize = 4;

    let n = 10;

    // Decrease n and delay until n is zero
    japl.promiseWhileBatch( batchSize,                          // Batch size
                            r => 0 < n,                         // Condition
                            () => { n--; return rto(n); })      // Do something
        .then( r => { Log(`Results : ${r}`); })                 // Results
        .catch( e => Log(e) );                                  // Errors

```

## Process array or object elements

``` javascript

    const Log = console.log;
    const Fmt = JSON.stringify
    const japl = require('japl');

    let a = Array(10).fill(null).map((_, i) => i);
    Log(Fmt(a));

    // Process each element of a
    japl.promiseArray(a, (k, v)=>
                         {   Log(`prom(${k}, ${v})`);
                             return rto(`-${v}-`);
                         })
        .then(r=>{ Log(`Results : ${r}`) });

    // Batching element processing is also available
    // Note, elements may not be processed in order
    japl.promiseArrayBatch(batchSize, a, (k, v)=>
                                         {  Log(`prom(${k}, ${v})`);
                                            return rto(`-${v}-`).then(r=>{ Log(`prom-done(${r})`); return r; });
                                         })
        .then(r=>{ Log(`Results : ${r}`) });

```

---------------------------------------------------------------------
## Table of contents

* [Install](#install)
* [Examples](#examples)
* [References](#references)

&nbsp;


---------------------------------------------------------------------
## Install

    $ npm install japl

&nbsp;


---------------------------------------------------------------------
## Examples

``` javascript

    const japl = require('japl');

    const Log = console.log;
    const Fmt = JSON.stringify;

    // Constant timeout
    function to(v, t=500) { return new Promise(r => setTimeout(()=>r(v), t)); }

    // Random timeout
    function rto(v, min=100,ran=500)
             {  return new Promise(r => setTimeout(()=>r(v),
                                                   min + Math.floor(Math.random() * ran)));
             }

    // Timeout to use for tests
    // const tof = to;
    const tof = rto;

    function testWhile()
    {   let n = 10;
        Log('\r\n --- while test');
        return japl.promiseWhile( r=> { Log(`cond(${r}, ${n})`); return 0 < n; },
                                () => { Log(`prom(${n--})`); return tof(n); })
            .then(r=>{ Log(`Results : ${r}`) });
    }

    function testDoWhile()
    {   let n = 10;
        Log('\r\n --- do while test');
        return japl.promiseDoWhile( r=> { Log(`cond(${r}, ${n})`); return 0 < n; },
                                    () => { Log(`prom(${n--})`); return tof(n); })
            .then(r=>{ Log(`Results : ${r}`) });
    }

    function testWhileBatch()
    {   let n = 10;
        Log('\r\n --- batched while test');
        return japl.promiseWhileBatch(4, r=> { Log(`cond(${r}, ${n})`); return 0 < n; },
                                        () =>
                                        {  Log(`prom(${n--})`);
                                            return tof(n).then(r=>{ Log(`prom-done(${r})`); return r;});
                                        })
            .then(r=>{ Log(`Results : ${r}`) });
    }

    function testDoWhileBatch()
    {   let n = 10;
        Log('\r\n --- batched do while test');
        return japl.promiseDoWhileBatch(4, r=> { Log(`cond(${r}, ${n})`); return 0 < n; },
                                        () =>
                                        {    Log(`prom(${n--})`);
                                                return tof(n).then(r=> { Log(`prom-done(${r})`); return r; });
                                        })
            .then(r=>{ Log(`Results : ${r}`) });
    }

    function testArray()
    {   Log('\r\n --- array test');
        let a = Array(10).fill(null).map((_, i) => i);
        Log(Fmt(a));
        return japl.promiseArray(a, (k, v)=>
                                    {   Log(`prom(${k}, ${v})`);
                                        return tof(`-${v}-`);
                                    })
            .then(r=>{ Log(`Results : ${r}`) });
    }

    function testArrayBatch()
    {
        Log('\r\n --- batched array test');
        let a = Array(10).fill(null).map((_, i) => i);
        Log(Fmt(a));
        return japl.promiseArrayBatch(4, a, (k, v)=>
                                            {   Log(`prom(${k}, ${v})`);
                                                return tof(`-${v}-`).then(r=>{ Log(`prom-done(${r})`); return r; });
                                            })
            .then(r=>{ Log(`Results : ${r}`) });
    }

    function testObject()
    {
        Log('\r\n --- object test');
        let o = {b:'blue', c:'cyan', g:'green', m:'magenta', o:'orange', p:'purple', r:'red', v:'violet', w:'white', y:'yellow'};
        Log(Fmt(o));
        return japl.promiseArray(o, (k, v)=>{ Log(`prom(${k}, ${v})`); return tof(`-${v}-`); })
            .then(r=>{ Log(`Results : ${Fmt(r)}`) });
    }

    function testObjectBatch()
    {
        Log('\r\n --- object batch test');
        let o = {b:'blue', c:'cyan', g:'green', m:'magenta', o:'orange', p:'purple', r:'red', v:'violet', w:'white', y:'yellow'};
        Log(Fmt(o));
        return japl.promiseArrayBatch(4, o, (k, v)=>
                                            {   Log(`prom(${k}, ${v})`);
                                                return tof(`-${v}-`).then(r=>{ Log(`prom-done(${r})`); return r; });
                                            })
            .then(r=>{ Log(`Results : ${Fmt(r)}`) });
    }

    // Run the tests
    Promise.resolve(true)
        .then(testWhile)
        .then(testDoWhile)
        .then(testWhileBatch)
        .then(testDoWhileBatch)
        .then(testArray)
        .then(testArrayBatch)
        .then(testObject)
        .then(testObjectBatch)
        ;

```

&nbsp;


---------------------------------------------------------------------
## References

- Node.js
    - https://nodejs.org/

- npm
    - https://www.npmjs.com/

