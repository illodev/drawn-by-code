# Lay our check stills over the reference: for each time, [reference | ours | onion] and the
# silhouette overlap (IoU of our alpha with the keyed reference).
#   python3 overlay.py 0.5,2.8,6 [--render] [--tag name] [--out out/overlay.jpg] [--crop y0,y1]
# --tag keeps each user's stills apart (out/check-<tag>/): parallel agents share out/
import sys, subprocess, numpy as np, os
from PIL import Image
args=sys.argv[1:]
times=[float(x) for x in args[0].split(',')]
render='--render' in args
tag=args[args.index('--tag')+1] if '--tag' in args else ''
stills='out/check'+('-'+tag if tag else '')
out=args[args.index('--out')+1] if '--out' in args else 'out/overlay'+('-'+tag if tag else '')+'.jpg'
y0,y1=(int(v) for v in args[args.index('--crop')+1].split(',')) if '--crop' in args else (250,1000)
HERE=os.path.dirname(os.path.abspath(__file__))
if render:
    subprocess.run(['node','engine/render.mjs','sandbox/2026-09-25-felt-cats/check.js','--at',args[0],'--size','576','--out','sandbox/2026-09-25-felt-cats/'+stills],cwd=HERE+'/../..',check=True,capture_output=True)
fg=np.unpackbits(np.load(HERE+'/private/masks.npz')['fg'],axis=-1)[...,:576].astype(bool)
cells=[];ious=[]
for t in times:
    fi=min(474,int(round(t*30)))
    ref=subprocess.run(['ffmpeg','-loglevel','error','-ss',str(fi/30+0.001),'-i',HERE+'/out/reference.mp4','-frames:v','1','-f','rawvideo','-pix_fmt','rgb24','-'],capture_output=True).stdout
    ref=np.frombuffer(ref,np.uint8).reshape(1024,576,3).astype(np.float32)
    ours=np.asarray(Image.open(HERE+f'/{stills}/t_{t:.2f}s.png').convert('RGBA')).astype(np.float32)
    a=ours[...,3:4]/255
    comp=ours[...,:3]*a+np.array([40,40,40])*(1-a)
    on=ref*0.5+comp*0.5
    m=a[...,0]>0.5; r=fg[fi]
    iou=(m&r).sum()/max(1,(m|r).sum()); ious.append(iou)
    # onion: reference in green tint where only ref, ours in magenta where only ours
    edge=ref.copy(); edge[r&~m]=[40,200,40]; edge[m&~r]=[220,40,200]
    cell=np.concatenate([ref,comp,edge],1)[y0:y1]
    cells.append(cell)
    print(f't={t:.2f} IoU {iou:.3f}')
img=np.concatenate(cells,0) if len(cells)<4 else np.concatenate([np.concatenate(cells[i:i+2],1) if i+1<len(cells) else np.concatenate([cells[i],cells[i]*0],1) for i in range(0,len(cells),2)],0)
Image.fromarray(img.clip(0,255).astype(np.uint8)).save(HERE+'/'+out,quality=85)
print('mean IoU',np.mean(ious))
