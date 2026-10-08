"""Offline editorial translation. Run explicitly; never runs on production or in guests' browsers.
uv run --with 'transformers<5' --with torch --with sentencepiece scripts/translate-content.py
Model: facebook/m2m100_418M (MIT). Output is checked-in static content requiring review.
"""
from pathlib import Path
import json, os, sys, time
ROOT = Path(__file__).resolve().parent.parent
os.environ.setdefault('HF_HOME', str(ROOT / '.cache/models'))
os.environ.setdefault('HF_HUB_DISABLE_PROGRESS_BARS', '1')
os.environ.setdefault('TOKENIZERS_PARALLELISM', 'false')
import torch
from transformers import M2M100ForConditionalGeneration, M2M100Tokenizer
torch.set_num_threads(6)
device = 'mps' if torch.backends.mps.is_available() else 'cpu'
print('Loading MIT translation model on',device,flush=True)
tokenizer = M2M100Tokenizer.from_pretrained('facebook/m2m100_418M', src_lang='en')
model = M2M100ForConditionalGeneration.from_pretrained('facebook/m2m100_418M').to(device).eval()
base=json.loads((ROOT/'src/content/en.json').read_text())
targets=sys.argv[1:] or ['de','it','pl','nl','fr','ko','bn','hi','es','uk']
for language in targets:
 out_path=ROOT/f'src/content/{language}.json'
 if out_path.exists():
  print('Already translated',language,flush=True);continue
 rows=[]
 for group in ['places','routes','ui']:
  for item_id,item in base[group].items():
   if group == 'ui': item = {'text': item}
   for key,value in item.items():
    if isinstance(value,str): rows.append((group,item_id,key,value))
 values=[r[3] for r in rows]; translated=[]
 for start in range(0,len(values),8):
  batch=values[start:start+8]
  tokens=tokenizer(batch,return_tensors='pt',padding=True,truncation=True,max_length=256).to(device)
  with torch.inference_mode():
   result=model.generate(**tokens,forced_bos_token_id=tokenizer.get_lang_id(language),max_new_tokens=250,num_beams=3)
  translated.extend(tokenizer.batch_decode(result,skip_special_tokens=True))
  if start%80==0: print(language,start,'/',len(values),flush=True)
 out={'language':language,'translation':{'method':'offline M2M100 418M, editorial corrections','modelLicense':'MIT','review':'required'},'places':{},'routes':{},'ui':{}}
 for (group,item_id,key,_),value in zip(rows,translated):
  if group == 'ui': out['ui'][item_id] = value
  else: out[group].setdefault(item_id,{})[key]=value
 out_path.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
 print('Completed',language,flush=True)
