"""Translate only the seven editorial additions offline; existing content stays intact."""
from pathlib import Path
import json, os
os.environ.setdefault('TOKENIZERS_PARALLELISM', 'false')
from transformers import M2M100ForConditionalGeneration, M2M100Tokenizer
import torch
torch.set_num_threads(6)
root=Path(__file__).resolve().parent.parent
records=json.loads((root/'docs/tourist-flyer-additions.json').read_text())['places']
output=Path('/tmp/guest-web-unesco-locales');output.mkdir(exist_ok=True)
for lang in ['cs','en','de']:
 (output/f'{lang}.json').write_text(json.dumps({p['id']:p[lang] for p in records},ensure_ascii=False,indent=2)+'\n')
tokenizer=M2M100Tokenizer.from_pretrained('facebook/m2m100_418M',src_lang='en',local_files_only=True)
device='mps' if torch.backends.mps.is_available() else 'cpu'
model=M2M100ForConditionalGeneration.from_pretrained('facebook/m2m100_418M',local_files_only=True).to(device).eval()
rows=[(p['id'],field,text) for p in records for field,text in p['en'].items()]
for lang in ['it','pl','nl','fr','ko','bn','hi','es','uk']:
 out=output/f'{lang}.json'
 if out.exists():continue
 values=[]
 for start in range(0,len(rows),8):
  tokens=tokenizer([r[2] for r in rows[start:start+8]],return_tensors='pt',padding=True,truncation=True,max_length=192).to(device)
  with torch.inference_mode():
   generated=model.generate(**tokens,forced_bos_token_id=tokenizer.get_lang_id(lang),max_new_tokens=160,num_beams=2)
  values.extend(tokenizer.batch_decode(generated,skip_special_tokens=True))
 result={}
 for (id,field,_),value in zip(rows,values):result.setdefault(id,{})[field]=value
 out.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
 print('Completed additions:',lang,flush=True)
