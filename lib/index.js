#!/usr/bin/env nodejs
'use strict';

const fs = require('fs');
const path = require('path');

function loadConfig(fname)
{   if (!fs.existsSync(fname))
        return {};
    let r = {};
    let data = fs.readFileSync(fname, 'utf8');
    let lines = data.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
    lines.forEach(v =>
        {   v = v.trim();
            if ('#' != v[0])
            {   let parts = v.split(/\s+/);
                if (1 < parts.length)
                {   let k = parts.shift().trim().toLowerCase();
                    r[k] = parts.join(' ');
                }
            }
        });
    return r;
}

module.exports =
{
    __info__:       loadConfig(path.join(path.dirname(__dirname), 'PROJECT.txt')),
    promiseDoWhile      : promiseDoWhile,
    promiseWhile        : promiseWhile,
    promiseDoWhileBatch : promiseDoWhileBatch,
    promiseWhileBatch   : promiseWhileBatch,
    isObject            : isObject,
    isArray             : isArray,
    promiseArray        : promiseArray,
    promiseArrayBatch   : promiseArrayBatch
};

/** Implements a promise do while loop
    @param [in] cond    - Condition to check
    @param [in] prom    - Promise generator
    @param [in] a       - Array that receives results
*/
function promiseDoWhile(cond, prom, a=[])
{   return prom().then(r=> { a.push(r); return cond(r) ? promiseDoWhile(cond, prom, a) : a; });
}

/** Implements a promise while loop
    @param [in] cond    - Condition to check
    @param [in] prom    - Promise generator
    @param [in] a       - Array that receives results
    @param [in] r       - Initial value passed to cond
*/
function promiseWhile(cond, prom, a=[], r=null)
{   return cond(r) ? promiseDoWhile(cond, prom, a) : a;
}

/** Implements a promise do while loop
    @param [in] sz      - Batch size
    @param [in] cond    - Condition to check
    @param [in] prom    - Promise generator
    @param [in] a       - Array that receives results
*/
function promiseDoWhileBatch(sz, cond, prom, a=[])
{   let b = [], r = null, run = true, c = r=>run&&(run=cond(r));
    do { b.push(r = promiseDoWhile(c, prom, a)); } while (0 < --sz && c(r));
    return Promise.all(b).then(r=>a);
}

/** Implements a promise do while loop
    @param [in] sz      - Batch size
    @param [in] cond    - Condition to check
    @param [in] prom    - Promise generator
    @param [in] a       - Array that receives results
    @param [in] r       - Initial value passed to cond
*/
function promiseWhileBatch(sz, cond, prom, a=[], r=null)
{   let b = [], run = true, c = r=>run&&(run=cond(r));
    while (0 < sz-- && c(r)) b.push(r = promiseDoWhile(c, prom, a));
    return Promise.all(b).then(r=>a);
}

/** Returns true if the variable passed in is an object
    @param [in] x   - Variable to check
*/
function isObject(x)
{    return typeof x === 'object' && !Array.isArray(x) && x !== null;
}

/** Returns true if the variable passed in is an object
    @param [in] x   - Variable to check
*/
function isArray(x)
{    return x.constructor && x.constructor === Array;
}

/** Implements a promise do while loop
    @param [in] a       - Array to process
    @param [in] prom    - Promise generator
*/
function promiseArray(a, prom)
{   const ks = Object.keys(a);
    let i = 0, b = isObject(a) ? {} : [];
    if (0 >= ks.length) return Promise.resolve(b);
    if (isArray(b)) b.length = ks.length;
    return promiseWhile(r=>i < ks.length, ()=>{let _k = ks[i++]; return prom(_k, a[_k], a).then(r=>b[_k]=r)})
        .then(r=>b);
}

/** Implements a promise do while loop
    @param [in] sz      - Batch size
    @param [in] a       - Array to process
    @param [in] prom    - Promise generator
*/
function promiseArrayBatch(sz, a, prom)
{   const ks = Object.keys(a);
    let i = 0, b = isObject(a) ? {} : [];
    if (0 >= ks.length) return Promise.resolve(b);
    if (isArray(b)) b.length = ks.length;
    return promiseWhileBatch(sz, r=>i < ks.length, ()=>{let _k = ks[i++]; return prom(_k, a[_k], a).then(r=>b[_k]=r)})
        .then(r=>b);
}

