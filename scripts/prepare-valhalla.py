from pathlib import Path
import sys,json,datetime,hashlib
root=Path(sys.argv[1]);p=root/'valhalla.json';config=json.loads(p.read_text())
config['mjolnir']['tile_dir']='/data/tiles';config['mjolnir']['tile_extract']='/data/tiles.tar'
config.setdefault('httpd',{}).setdefault('service',{}).update({'listen':'tcp://*:8002','loopback':'ipc:///tmp/loopback','interrupt':'ipc:///tmp/interrupt','timeout_seconds':15})
for stage in ['loki','thor','odin','meili']:
 service=config.get(stage,{}).get('service',{})
 for key,value in list(service.items()):
  if isinstance(value,str) and value.startswith('ipc://'):service[key]='ipc:///tmp/'+stage+'_'+key
config['mjolnir']['concurrency']=2
config.setdefault('service_limits',{}).setdefault('pedestrian',{}).update({'max_distance':20000,'max_locations':2})
config.setdefault('service_limits',{})['max_alternates']=0
for section in [config,*[v for v in config.values() if isinstance(v,dict)]]:
 if 'logging'in section:section['logging'].update({'type':'std_out','color':False,'long_request':100000000})
p.write_text(json.dumps(config,indent=2)+'\n')
(root/'provenance.json').write_text(json.dumps({'source':'https://download.bbbike.org/osm/bbbike/Prag/Prag.osm.pbf','license':'ODbL 1.0','attribution':'OpenStreetMap contributors','builtAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sourceSha256':hashlib.sha256((root/'prague.osm.pbf').read_bytes()).hexdigest(),'engine':'Valhalla 3.6.3','physicalAcceptance':False},indent=2)+'\n')
