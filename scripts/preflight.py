"""Read-only production audit; run over ssh produkce. Never prints secrets or configuration contents."""
import json,subprocess,hashlib,os,datetime
from pathlib import Path
def command(args):return subprocess.check_output(args,text=True,stderr=subprocess.DEVNULL).strip()
vhosts={str(p):hashlib.sha256(p.read_bytes()).hexdigest() for p in Path('/etc/nginx/sites-enabled').iterdir()if p.is_file()}
result={'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'cpus':os.cpu_count(),'disk':command(['df','-B1','/']),'memory':command(['free','-m']),'vhosts':vhosts,'listeners':command(['ss','-ltn']),'services':{},'http':{}}
for service in ['nginx','docker','dagmar-backend','kajavoiceha','mail-mcp-standalone']:
 try:result['services'][service]=command(['systemctl','is-active',service])
 except subprocess.CalledProcessError:result['services'][service]='inactive'
for host in ['hotel.hcasc.cz','dagmar.hcasc.cz','ha.hcasc.cz','gpt.hcasc.cz','mail.hcasc.cz']:
 result['http'][host]=command(['curl','--silent','--output','/dev/null','--max-time','12','--write-out','%{http_code}',f'https://{host}/'])
result['nginxTest']=subprocess.run(['nginx','-t'],capture_output=True).returncode==0
print(json.dumps(result,indent=2))
