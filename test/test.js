#!/usr/bin/env nodejs
'use strict';

const japl = require('japl');

const Log = console.log;
const Fmt = JSON.stringify;

// Constant timeout
function to(v, t=500) { return new Promise(r => setTimeout(()=>r(v), t)); }

// Random timeout
function rto(v, min=100,ran=500) { return new Promise(r => setTimeout(()=>r(v), min + Math.floor(Math.random() * ran))); }

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
