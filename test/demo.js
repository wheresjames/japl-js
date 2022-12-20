#!/usr/bin/env nodejs
'use strict';

const Log = console.log;
const japl = require('japl');

let n = 10;
function rto(v, min=100,ran=500) { return new Promise(r => setTimeout(()=>r(v), min + Math.floor(Math.random() * ran))); }

// Decrease n and delay until n is zero
japl.promiseWhile( r => 0 < n,                      // Condition
                  () => { n--; return rto(n); })    // Do something
        .then( r => { Log(`Results : ${r}`); })     // Results
        .catch( e => Log(e) );                      // Errors


// Decrease n and delay until n is zero
japl.promiseWhileBatch( 4,                                  // Batch size
                        r => 0 < n,                         // Condition
                        () => { n--; return rto(n); })      // Do something
    .then( r => { Log(`Results : ${r}`); })                 // Results
    .catch( e => Log(e) );                                  // Errors


let a = Array(10).fill(null).map((_, i) => i);
Log(a);

japl.promiseArray(a, (k, v)=>
                            {   Log(`prom(${k}, ${v})`);
                                return rto(`-${v}-`);
                            })
    .then(r=>{ Log(`Results : ${r}`) });


japl.promiseArrayBatch(4, a, (k, v)=>
                             {   Log(`prom(${k}, ${v})`);
                                 return rto(`-${v}-`).then(r=>{ Log(`prom-done(${r})`); return r; });
                             })
    .then(r=>{ Log(`Results : ${r}`) });
