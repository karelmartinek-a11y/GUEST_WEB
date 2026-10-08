"""CI-only graph/engine smoke proof. These are synthetic requests, never walking evidence."""
import json, time, urllib.request
from pathlib import Path
root=Path('artifacts/valhalla');results=[]
for language in ['cs-CZ','en-US','de-DE']:
 payload=json.dumps({'locations':[{'lat':50.03996,'lon':14.50541},{'lat':50.0514,'lon':14.5051}],'costing':'pedestrian','language':language,'units':'kilometers'}).encode()
 for attempt in range(30):
  try:
   request=urllib.request.Request('http://127.0.0.1:18781/route',data=payload,headers={'Content-Type':'application/json'})
   result=json.load(urllib.request.urlopen(request,timeout=15));break
  except Exception:
   if attempt==29:raise
   time.sleep(1)
 trip=result['trip'];assert trip['status']==0 and trip['language']==language
 assert trip['units']=='kilometers' and trip['summary']['length']>0
 assert trip['legs'][0]['shape'] and len(trip['legs'][0]['maneuvers'])>=2
 results.append({'language':language,'pass':True,'maneuvers':len(trip['legs'][0]['maneuvers']),'lengthKm':trip['summary']['length']})
(root/'engine-smoke.json').write_text(json.dumps({'syntheticOnly':True,'physicalAcceptance':False,'engine':'Valhalla 3.6.3','results':results},indent=2)+'\n')
print(json.dumps({'syntheticRequests':len(results),'pass':True,'physicalAcceptance':False}))
