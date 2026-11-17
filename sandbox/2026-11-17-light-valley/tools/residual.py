# Where a render's carving departs from the reference: soft carved share per 16 px cell,
# ours − reference, drawn red (ours lighter) / blue (ours darker) over the reference in grey
import sys, numpy as np
from PIL import Image
def soft(p):
    a = np.asarray(Image.open(p).convert('RGB').resize((1280, 720))).astype(np.float32)
    L = a.mean(2); mx, mn = a.max(2), a.min(2); sat = (mx - mn) / (mx + 1)
    top = np.where((sat > 0.42) & (a[..., 0] > a[..., 2] + 60), 152.0, 196.0)
    return np.clip((L - 18) / (top - 18), 0, 1), L
(R, Lr), (O, _) = soft(sys.argv[1]), soft(sys.argv[2])
c = 16; ny, nx = 720 // c, 1280 // c
d = (O[:ny*c].reshape(ny, c, nx, c).mean((1, 3)) - R[:ny*c].reshape(ny, c, nx, c).mean((1, 3)))
D = np.kron(d, np.ones((c, c)))
img = np.stack([Lr[:ny*c] * 0.5] * 3, -1)
img[..., 0] += np.clip(D, 0, 1) * 400; img[..., 2] += np.clip(-D, 0, 1) * 400
Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).save(sys.argv[3])
