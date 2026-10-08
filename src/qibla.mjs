/** Initial great-circle bearing, clockwise from true north (WGS84 points). */
export function bearing(from, to) {
 for (const p of [from,to]) if (!Number.isFinite(p.lat)||!Number.isFinite(p.lon)||Math.abs(p.lat)>90||Math.abs(p.lon)>180) throw new RangeError('Invalid coordinate');
 const rad=Math.PI/180, a=from.lat*rad, b=to.lat*rad, d=(to.lon-from.lon)*rad;
 const y=Math.sin(d)*Math.cos(b), x=Math.cos(a)*Math.sin(b)-Math.sin(a)*Math.cos(b)*Math.cos(d);
 if(Math.hypot(x,y)<1e-12)throw new RangeError('Direction is undefined at this point');
 return (Math.atan2(y,x)/rad+360)%360;
}
export const kaaba={lat:21.422487,lon:39.826206};
