#!/usr/bin/python3
"""Forced SSH command; deploys only GUEST_WEB static artifacts, never executes uploaded code."""
import os,sys,re,json,hashlib,tarfile,fcntl,subprocess,shutil,time
from pathlib import Path
ROOT=Path('/opt/guest-web');DATA=Path('/var/lib/guest-web/deploy')
MAX_PROJECT_BYTES=2*1024**3
MAX_RELEASES=5
def project_size():
 return sum(p.stat().st_size for base in [ROOT,DATA] for p in base.rglob('*') if p.is_file() and not p.is_symlink())
def retain_releases(current,previous):
 keep={str(current.resolve())}
 if previous:keep.add(str(Path(previous).resolve()))
 candidates=sorted((p for p in (ROOT/'releases').iterdir() if p.is_dir() and re.fullmatch('[0-9a-f]{40}',p.name)),key=lambda p:p.stat().st_mtime,reverse=True)
 for p in candidates:
  if str(p.resolve())in keep:continue
  if len(keep)<MAX_RELEASES:keep.add(str(p.resolve()))
  else:shutil.rmtree(p)
command=os.environ.get('SSH_ORIGINAL_COMMAND','')
match=re.fullmatch(r'deploy ([0-9a-f]{40})',command)
if not match: sys.exit('Only deploy <40-character commit SHA> is permitted')
sha=match[1]
lock=open(DATA/'deploy.lock','a');fcntl.flock(lock,fcntl.LOCK_EX)
def protected():
 return {str(p):hashlib.sha256(p.read_bytes()).hexdigest() for p in Path('/etc/nginx/sites-enabled').iterdir() if p.name!='guest.hcasc.cz.conf' and p.is_file()}
def http_json(url):
 data=subprocess.check_output(['curl','--fail','--silent','--show-error','--max-time','15',url],timeout=20)
 return json.loads(data)
def health():
 result={}
 for host,path in [('hotel.hcasc.cz','/'),('dagmar.hcasc.cz','/'),('ha.hcasc.cz','/'),('gpt.hcasc.cz','/.well-known/oauth-authorization-server'),('mail.hcasc.cz','/mcp')]:
  code=subprocess.check_output(['curl','--silent','--output','/dev/null','--max-time','12','--write-out','%{http_code}',f'https://{host}{path}'],timeout=15).decode()
  result[host+path]=code
 for service in ['nginx','docker','dagmar-backend','kajavoiceha','mail-mcp-standalone']:
  result['service:'+service]=subprocess.run(['systemctl','is-active',service],capture_output=True,text=True,timeout=5).stdout.strip()
 return result
if shutil.disk_usage(ROOT).free<3*1024**3:sys.exit('Capacity guard: fewer than 3 GiB free')
if project_size()>MAX_PROJECT_BYTES-600*1024**2:sys.exit('Project disk budget exceeded; only project release retention may be reviewed')
baseline=protected();before_health=health();release=ROOT/'releases'/sha
archive=DATA/f'incoming-{sha}.tar.gz'
total=0
with archive.open('wb') as out:
 while True:
  data=sys.stdin.buffer.read(1024*1024)
  if not data:break
  total+=len(data)
  if total>250*1024**2:archive.unlink();sys.exit('Artifact exceeds 250 MiB')
  out.write(data)
artifact_sha=hashlib.sha256(archive.read_bytes()).hexdigest()
staging=ROOT/'releases'/f'.incoming-{sha}-{os.getpid()}'
staging.mkdir(mode=0o755)
previous=os.readlink(ROOT/'current') if (ROOT/'current').is_symlink() else None
switched=False
try:
 with tarfile.open(archive,'r:gz') as tar:
  expanded=0
  for member in tar:
   p=Path(member.name);expanded+=max(0,member.size)
   if p.is_absolute() or '..'in p.parts or not p.parts or p.parts[0]!='www' or not (member.isdir() or member.isfile()) or expanded>350*1024**2:raise RuntimeError('Unsafe archive')
   dest=staging/p
   if member.isdir():dest.mkdir(parents=True,exist_ok=True,mode=0o755)
   else:
    dest.parent.mkdir(parents=True,exist_ok=True,mode=0o755)
    with tar.extractfile(member)as source,dest.open('wb')as target:shutil.copyfileobj(source,target)
    dest.chmod(0o644)
 manifest=json.loads((staging/'www/release.json').read_text())
 capability=json.loads((staging/'www/capabilities.json').read_text())
 if manifest.get('sha')!=sha or manifest.get('repository')!='karelmartinek-a11y/GUEST_WEB':raise RuntimeError('Artifact SHA mismatch')
 if manifest.get('navigationEnabled') or capability.get('navigationEnabled'):raise RuntimeError('Static release cannot enable unaccepted navigation')
 if protected()!=baseline:raise RuntimeError('Protected vhost configuration changed')
 if release.exists():
  if (release/'www/release.json').read_bytes()!=(staging/'www/release.json').read_bytes():raise RuntimeError('Existing SHA has a different artifact')
  shutil.rmtree(staging)
 else:os.rename(staging,release)
 tmp=ROOT/f'.current-{os.getpid()}';tmp.symlink_to(release);os.replace(tmp,ROOT/'current');switched=True
 public=http_json('https://guest.hcasc.cz/release.json')
 if public.get('sha')!=sha:raise RuntimeError('Public runtime SHA mismatch')
 if protected()!=baseline or health()!=before_health:raise RuntimeError('Protected sites changed health or configuration')
 retain_releases(release,previous)
 receipt={'sha':sha,'artifact_sha256':artifact_sha,'deployedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'runtimeShaVerified':True,'protectedVhostsUnchanged':True,'protectedHealth':before_health,'navigationEnabled':False}
 (DATA/'latest.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt))
except Exception as error:
 if switched and previous:
  tmp=ROOT/f'.rollback-{os.getpid()}';tmp.symlink_to(previous);os.replace(tmp,ROOT/'current')
 elif switched:(ROOT/'current').unlink(missing_ok=True)
 print('Deployment failed; only the GUEST_WEB current symlink was rolled back:',str(error),file=sys.stderr);sys.exit(1)
finally:
 archive.unlink(missing_ok=True)
 if staging.exists():shutil.rmtree(staging)
