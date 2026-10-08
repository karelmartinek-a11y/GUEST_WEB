import test from 'node:test';
import assert from 'node:assert/strict';
import {bearing,kaaba}from '../src/qibla.mjs';
test('qibla uses a great-circle bearing from true north at the hotel',()=>{
 const result=bearing({lat:50.03996,lon:14.50541},kaaba);assert(result>135&&result<136);
 assert.equal(bearing({lat:0,lon:0},{lat:1,lon:0}),0);
 assert.equal(bearing({lat:0,lon:0},{lat:0,lon:1}),90);
 assert.equal(bearing({lat:0,lon:0},{lat:-1,lon:0}),180);
 assert.equal(bearing({lat:0,lon:0},{lat:0,lon:-1}),270);
});
test('qibla rejects invalid and undefined coordinates',()=>{
 assert.throws(()=>bearing({lat:91,lon:0},kaaba),RangeError);
 assert.throws(()=>bearing(kaaba,kaaba),RangeError);
});
