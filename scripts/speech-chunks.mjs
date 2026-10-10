// Prefer sentence endings, then word boundaries, so separately generated audio
// never cuts ordinary Czech words (and preserves CJK sentence punctuation).
export function speechChunks(text,limit=600){
 const chars=Array.from(text),parts=[];let start=0;
 while(start<chars.length){let size=Math.min(limit,chars.length-start);
  if(start+size<chars.length){let sentence=0,word=0;for(let i=size-1;i>=0;i--){const char=chars[start+i];if(!word&&/\s/u.test(char))word=i+1;if(i>=Math.floor(limit/3)&&/[.!?。！？।]/u.test(char)){sentence=i+1;break;}}size=sentence||word||size;}
  parts.push(chars.slice(start,start+size).join(''));start+=size;
 }return parts;
}
