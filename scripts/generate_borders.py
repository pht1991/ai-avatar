"""
generate_borders.py — 生成 16 种风格的 1024x1024 透明 PNG 边框素材
运行: python generate_borders.py
输出: src/static/borders/{style_id}.png
"""
import math
import os
from PIL import Image, ImageDraw, ImageFilter

SIZE = 1024
OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'src', 'static', 'borders')

def new_canvas():
    return Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))

def hex_to_rgba(hex_color, alpha=255):
    h = hex_color.lstrip('#')
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    return (r, g, b, alpha)

def draw_rounded_rect(draw, xy, radius, **kwargs):
    draw.rounded_rectangle(xy, radius=radius, **kwargs)

def draw_star(draw, cx, cy, outer_r, inner_r, points, fill):
    pts = []
    for i in range(points * 2):
        angle = (math.pi / points) * i - math.pi / 2
        r = outer_r if i % 2 == 0 else inner_r
        pts.append((cx + math.cos(angle) * r, cy + math.sin(angle) * r))
    draw.polygon(pts, fill=fill)

def draw_star4(draw, cx, cy, sz, fill):
    draw_star(draw, cx, cy, sz, sz * 0.3, 4, fill)

def draw_star5(draw, cx, cy, sz, fill):
    draw_star(draw, cx, cy, sz, sz * 0.4, 5, fill)

def draw_sakura(draw, cx, cy, sz, color):
    for i in range(5):
        angle = (math.pi * 2 / 5) * i - math.pi / 2
        px = cx + math.cos(angle) * sz * 0.4
        py = cy + math.sin(angle) * sz * 0.4
        draw.ellipse([px - sz*0.22, py - sz*0.14, px + sz*0.22, py + sz*0.14], fill=color)
    draw.ellipse([cx - sz*0.1, cy - sz*0.1, cx + sz*0.1, cy + sz*0.1], fill=hex_to_rgba('#FFEAA7', 180))

def draw_cloud(draw, cx, cy, sz, color):
    r = sz * 0.3
    draw.ellipse([cx - r*1.5, cy - r*0.5, cx + r*0.5, cy + r*1.0], fill=color)
    draw.ellipse([cx - r*0.5, cy - r*1.0, cx + r*1.5, cy + r*0.5], fill=color)
    draw.ellipse([cx - r*0.8, cy - r*0.8, cx + r*0.8, cy + r*0.8], fill=color)

def draw_nami(draw, cx, cy, sz, color):
    pts = []
    for i in range(21):
        t = i / 20
        x = cx - sz * 0.5 + t * sz
        y = cy + math.sin(t * math.pi * 3) * sz * 0.25
        pts.append((x, y))
    draw.line(pts, fill=color, width=3)
    for i in range(1, 20, 2):
        t = i / 20
        x = cx - sz * 0.5 + t * sz
        y = cy + math.sin(t * math.pi * 3) * sz * 0.25 - 8
        draw.ellipse([x-3, y-3, x+3, y+3], fill=color)

def draw_corner_bracket(draw, x, y, length, direction, color, width):
    dx, dy = direction
    if dx > 0:
        draw.line([(x, y), (x + length, y)], fill=color, width=width)
        draw.line([(x, y), (x, y + length * dy)], fill=color, width=width)
    else:
        draw.line([(x, y), (x - length, y)], fill=color, width=width)
        draw.line([(x, y), (x, y + length * dy)], fill=color, width=width)

def draw_ornate_corner(draw, cx, cy, sz, color, flip_x=False, flip_y=False):
    fx = -1 if flip_x else 1
    fy = -1 if flip_y else 1
    draw.arc([cx - sz*0.5, cy - sz*0.5, cx + sz*0.5, cy + sz*0.5],
             0, 90, fill=color, width=3)
    draw.ellipse([cx + fx*sz*0.35 - 4, cy + fy*sz*0.35 - 4,
                  cx + fx*sz*0.35 + 4, cy + fy*sz*0.35 + 4], fill=color)

def draw_swirl(draw, cx, cy, sz, color, width=4):
    pts = []
    for t in range(0, 80):
        angle = t * 0.15
        r = sz * (t / 80) * 0.6
        x = cx + math.cos(angle) * r
        y = cy + math.sin(angle) * r - sz * 0.2 + t * 0.04 * sz
        pts.append((x, y))
    draw.line(pts, fill=color, width=width, joint='curve')

def draw_circuit_line(draw, x1, y1, x2, y2, color, width=3):
    mx = (x1 + x2) / 2
    draw.line([(x1, y1), (mx, y1), (mx, y2), (x2, y2)], fill=color, width=width)
    draw.ellipse([x1-5, y1-5, x1+5, y1+5], fill=color)
    draw.ellipse([x2-5, y2-5, x2+5, y2+5], fill=color)

def draw_hexagon(draw, cx, cy, sz, color, width=3):
    pts = []
    for i in range(6):
        angle = (math.pi / 3) * i - math.pi / 6
        pts.append((cx + math.cos(angle) * sz, cy + math.sin(angle) * sz))
    draw.line(pts + [pts[0]], fill=color, width=width)

def draw_pixel_grid(draw, x, y, grid, pixel_size, color):
    for row_idx, row in enumerate(grid):
        for col_idx, val in enumerate(row):
            if val:
                draw.rectangle([x + col_idx * pixel_size, y + row_idx * pixel_size,
                               x + (col_idx+1) * pixel_size, y + (row_idx+1) * pixel_size],
                              fill=color)

# ============================================================
# 16 种风格边框绘制函数
# ============================================================

def border_gufeng():
    img = new_canvas()
    d = ImageDraw.Draw(img)
    color = hex_to_rgba('#C8553D')
    color_light = hex_to_rgba('#C8553D', 100)
    bw = 6
    pad = bw // 2
    # 外圆角边框
    draw_rounded_rect(d, [pad, pad, SIZE-pad, SIZE-pad], 24, outline=color, width=bw)
    # 内层细线
    draw_rounded_rect(d, [bw*3, bw*3, SIZE-bw*3, SIZE-bw*3], 20, outline=color_light, width=1)
    # 角部祥云
    draw_cloud(d, 80, 100, 100, hex_to_rgba('#C8553D', 120))
    draw_cloud(d, SIZE-80, SIZE-100, 90, hex_to_rgba('#C8553D', 100))
    # 圆环装饰
    d.ellipse([SIZE-220, 60, SIZE-80, 200], outline=color_light, width=2)
    # 底部花纹弧线
    pts = []
    for i in range(41):
        t = i / 40
        x = 200 + t * (SIZE - 400)
        y = SIZE - 50 + math.sin(t * math.pi * 4) * 12
        pts.append((x, y))
    d.line(pts, fill=color_light, width=2)
    return img

def border_anime():
    img = new_canvas()
    d = ImageDraw.Draw(img)
    color = hex_to_rgba('#FF6B9D')
    color2 = hex_to_rgba('#FFD93D', 180)
    bw = 5
    pad = bw // 2
    # 虚线圆角边框
    draw_rounded_rect(d, [pad, pad, SIZE-pad, SIZE-pad], 20, outline=color, width=bw)
    # 虚线效果 — 用短线段覆盖
    dash_len = 20
    gap_len = 8
    for side in ['top', 'bottom', 'left', 'right']:
        if side in ['top', 'bottom']:
            y = pad if side == 'top' else SIZE - pad
            x = pad + 20
            while x < SIZE - pad - 20:
                x2 = min(x + dash_len, SIZE - pad - 20)
                d.line([(x, y), (x2, y)], fill=color, width=bw + 2)
                x += dash_len + gap_len
        else:
            x = pad if side == 'left' else SIZE - pad
            y = pad + 20
            while y < SIZE - pad - 20:
                y2 = min(y + dash_len, SIZE - pad - 20)
                d.line([(x, y), (x, y2)], fill=color, width=bw + 2)
                y += dash_len + gap_len
    # 四角星装饰
    draw_star4(d, 140, 120, 70, hex_to_rgba('#FF6B9D', 200))
    draw_star4(d, SIZE-140, 180, 60, hex_to_rgba('#FF6B9D', 200))
    draw_star4(d, 100, SIZE-180, 55, hex_to_rgba('#FF6B9D', 160))
    draw_star4(d, SIZE-160, SIZE-140, 75, color2)
    # 闪光点
    d.ellipse([SIZE-80, 60, SIZE-60, 80], fill=hex_to_rgba('#FFFFFF', 200))
    return img

def border_cyberpunk():
    img = new_canvas()
    d = ImageDraw.Draw(img)
    color = hex_to_rgba('#00D4FF')
    color2 = hex_to_rgba('#FF6B9D', 120)
    bw = 4
    cl = int(SIZE * 0.22)
    pad = bw // 2
    # 四角L型
    d.line([(pad, pad+cl), (pad, pad), (pad+cl, pad)], fill=color, width=bw+2)
    d.line([(SIZE-pad-cl, pad), (SIZE-pad, pad), (SIZE-pad, pad+cl)], fill=color, width=bw+2)
    d.line([(pad, SIZE-pad-cl), (pad, SIZE-pad), (pad+cl, SIZE-pad)], fill=color, width=bw+2)
    d.line([(SIZE-pad-cl, SIZE-pad), (SIZE-pad, SIZE-pad), (SIZE-pad, SIZE-pad-cl)], fill=color, width=bw+2)
    # 网格
    grid_color = hex_to_rgba('#00D4FF', 30)
    for i in range(1, 5):
        x = SIZE // 5 * i
        d.line([(x, 0), (x, SIZE)], fill=grid_color, width=1)
        y = SIZE // 5 * i
        d.line([(0, y), (SIZE, y)], fill=grid_color, width=1)
    # 扫描线
    scan_y = int(SIZE * 0.35)
    for dy in range(-3, 4):
        alpha = max(0, 40 - abs(dy) * 10)
        d.line([(0, scan_y+dy), (SIZE, scan_y+dy)], fill=hex_to_rgba('#00D4FF', alpha), width=1)
    # 故障条
    d.rectangle([100, 250, 700, 270], fill=color2)
    d.rectangle([400, 740, 700, 755], fill=hex_to_rgba('#00D4FF', 100))
    return img

def border_q3d():
    img = new_canvas()
    d = ImageDraw.Draw(img)
    color = hex_to_rgba('#FFD93D')
    bw = 5
    pad = bw // 2
    # 气泡圆角边框
    draw_rounded_rect(d, [pad, pad, SIZE-pad, SIZE-pad], 28, outline=color, width=bw)
    # 内层高光
    draw_rounded_rect(d, [pad+12, pad+12, SIZE-pad-12, SIZE-pad-12], 24,
                      outline=hex_to_rgba('#FFFFFF', 60), width=2)
    # 五角星装饰
    draw_star5(d, 120, 100, 75, hex_to_rgba('#FFD93D', 200))
    draw_star5(d, SIZE-120, 140, 65, hex_to_rgba('#FF9F43', 200))
    draw_star5(d, 80, SIZE-100, 55, hex_to_rgba('#FFD93D', 160))
    # 小圆点
    d.ellipse([SIZE-120, SIZE-130, SIZE-80, SIZE-90], fill=hex_to_rgba('#FF9F43', 160))
    d.ellipse([140, SIZE-80, 170, SIZE-50], fill=hex_to_rgba('#FFD93D', 160))
    return img

def border_watercolor():
    img = new_canvas()
    d = ImageDraw.Draw(img)
    color = hex_to_rgba('#6EC6FF', 80)
    color2 = hex_to_rgba('#A29BFE', 60)
    # 软边渐变 — 多层模糊圆角矩形
    for i in range(8):
        alpha = 15 - i
        offset = i * 2
        layer = Image.new('RGBA', (SIZE, SIZE), (0,0,0,0))
        ld = ImageDraw.Draw(layer)
        ld.rounded_rectangle([offset, offset, SIZE-offset, SIZE-offset], 10,
                             outline=hex_to_rgba('#6EC6FF', alpha), width=2)
        layer = layer.filter(ImageFilter.GaussianBlur(3))
        img = Image.alpha_composite(img, layer)
    d = ImageDraw.Draw(img)
    # 水彩泼溅
    for cx, cy, sz, c in [
        (50, 100, 140, color), (SIZE-100, SIZE-80, 120, color),
        (SIZE-80, 60, 90, color2), (100, SIZE-100, 100, color2),
    ]:
        splash = Image.new('RGBA', (SIZE, SIZE), (0,0,0,0))
        sd = ImageDraw.Draw(splash)
        for _ in range(6):
            import random
            random.seed(int(cx + cy))
            ox = random.uniform(-sz*0.3, sz*0.3)
            oy = random.uniform(-sz*0.3, sz*0.3)
            r = random.uniform(sz*0.15, sz*0.3)
            sd.ellipse([cx+ox-r, cy+oy-r, cx+ox+r, cy+oy+r], fill=c)
        splash = splash.filter(ImageFilter.GaussianBlur(8))
        img = Image.alpha_composite(img, splash)
    return img

def border_retro():
    img = new_canvas()
    d = ImageDraw.Draw(img)
    color = hex_to_rgba('#FF8C42')
    bw = 5
    bar_h = int(SIZE * 0.06)
    # 上下黑条
    d.rectangle([0, 0, SIZE, bar_h], fill=(26, 26, 26, 255))
    d.rectangle([0, SIZE-bar_h, SIZE, SIZE], fill=(26, 26, 26, 255))
    # 齿孔
    hole_r = bar_h * 0.25
    x = bar_h * 0.6
    while x < SIZE - hole_r:
        d.ellipse([x-hole_r, bar_h/2-hole_r, x+hole_r, bar_h/2+hole_r],
                  fill=hex_to_rgba('#FFFFFF', 50))
        d.ellipse([x-hole_r, SIZE-bar_h/2-hole_r, x+hole_r, SIZE-bar_h/2+hole_r],
                  fill=hex_to_rgba('#FFFFFF', 50))
        x += bar_h * 1.3
    # 橙色细线框
    d.rectangle([bw, bar_h, SIZE-bw, SIZE-bar_h], outline=color, width=bw)
    # 日期戳
    try:
        from PIL import ImageFont
        font = ImageFont.truetype("consola.ttf", 24)
    except:
        font = ImageFont.load_default()
    d.text((50, SIZE - bar_h - 40), "1998.06.26", fill=hex_to_rgba('#FF8C42', 180), font=font)
    return img

def border_flat():
    img = new_canvas()
    d = ImageDraw.Draw(img)
    color = hex_to_rgba('#A29BFE')
    color2 = hex_to_rgba('#6C5CE7', 160)
    bw = 4
    off = bw * 3
    pad = bw // 2
    # 几何切角框
    pts = [
        (off, pad), (SIZE-off, pad), (SIZE-pad, off),
        (SIZE-pad, SIZE-off), (SIZE-off, SIZE-pad),
        (off, SIZE-pad), (pad, SIZE-off), (pad, off),
    ]
    d.line(pts + [pts[0]], fill=color, width=bw)
    # 装饰图形
    draw_star(d, 120, 100, 60, 24, 3, color2)
    d.rectangle([SIZE-150, 80, SIZE-90, 140], fill=color2)
    d.ellipse([60, SIZE-140, 120, SIZE-80], fill=hex_to_rgba('#A29BFE', 180))
    d.ellipse([SIZE-150, SIZE-150, SIZE-80, SIZE-80], fill=color2)
    return img

def border_oil():
    img = new_canvas()
    d = ImageDraw.Draw(img)
    color = hex_to_rgba('#E17055')
    bw = 7
    pad = bw // 2
    # 外层边框
    draw_rounded_rect(d, [pad, pad, SIZE-pad, SIZE-pad], 16, outline=color, width=bw)
    # 内层细线
    draw_rounded_rect(d, [bw*2, bw*2, SIZE-bw*2, SIZE-bw*2], 14,
                      outline=hex_to_rgba('#E17055', 80), width=1)
    draw_rounded_rect(d, [bw*4, bw*4, SIZE-bw*4, SIZE-bw*4], 12,
                      outline=hex_to_rgba('#E17055', 50), width=1)
    # 四角华丽装饰
    corners = [(bw*3, bw*3, False, False), (SIZE-bw*3, bw*3, True, False),
               (bw*3, SIZE-bw*3, False, True), (SIZE-bw*3, SIZE-bw*3, True, True)]
    for cx, cy, fx, fy in corners:
        draw_ornate_corner(d, cx, cy, 100, hex_to_rgba('#E17055', 200), fx, fy)
    return img

def border_pixel():
    img = new_canvas()
    d = ImageDraw.Draw(img)
    color = hex_to_rgba('#00E676', 200)
    color_dim = hex_to_rgba('#00E676', 80)
    bw = 24
    bs = 8
    # 像素化边框
    for x in range(0, SIZE, bs):
        if (x // bs) % 2 == 0:
            d.rectangle([x, 0, x+bs-1, bw], fill=color)
            d.rectangle([x, SIZE-bw, x+bs-1, SIZE], fill=color)
        else:
            d.rectangle([x, 0, x+bs-1, bw], fill=color_dim)
            d.rectangle([x, SIZE-bw, x+bs-1, SIZE], fill=color_dim)
    for y in range(bw, SIZE-bw, bs):
        if (y // bs) % 2 == 0:
            d.rectangle([0, y, bw, y+bs-1], fill=color)
            d.rectangle([SIZE-bw, y, SIZE, y+bs-1], fill=color)
        else:
            d.rectangle([0, y, bw, y+bs-1], fill=color_dim)
            d.rectangle([SIZE-bw, y, SIZE, y+bs-1], fill=color_dim)
    # 像素爱心
    heart = [
        [0,1,0,1,0],
        [1,1,1,1,1],
        [1,1,1,1,1],
        [0,1,1,1,0],
        [0,0,1,0,0],
    ]
    draw_pixel_grid(d, 80, 80, heart, 6, hex_to_rgba('#FF6B9D', 200))
    # 像素金币
    coin = [
        [0,1,1,0],
        [1,0,0,1],
        [1,0,0,1],
        [0,1,1,0],
    ]
    draw_pixel_grid(d, SIZE-120, SIZE-120, coin, 6, hex_to_rgba('#FFD93D', 200))
    return img

def border_ukiyoe():
    img = new_canvas()
    d = ImageDraw.Draw(img)
    color = hex_to_rgba('#1A5276')
    bw = 5
    pad = bw // 2
    # 双层边框
    draw_rounded_rect(d, [pad, pad, SIZE-pad, SIZE-pad], 8, outline=color, width=bw)
    draw_rounded_rect(d, [bw*3, bw*3, SIZE-bw*3, SIZE-bw*3], 6,
                      outline=color, width=1)
    # 底部浪花
    draw_nami(d, SIZE//2, SIZE-80, 400, hex_to_rgba('#1A5276', 160))
    draw_nami(d, SIZE//2 - 100, SIZE-60, 300, hex_to_rgba('#1A5276', 100))
    # 右下红日
    d.ellipse([SIZE-200, SIZE-200, SIZE-80, SIZE-80],
                 outline=hex_to_rgba('#D35400', 120), width=3)
    return img

def border_vangogh():
    img = new_canvas()
    d = ImageDraw.Draw(img)
    color = hex_to_rgba('#F39C12')
    bw = 4
    pad = bw // 2
    # 圆角边框 + 旋涡层
    draw_rounded_rect(d, [pad, pad, SIZE-pad, SIZE-pad], 30, outline=color, width=bw)
    draw_rounded_rect(d, [bw*2, bw*2, SIZE-bw*2, SIZE-bw*2], 28,
                      outline=hex_to_rgba('#F39C12', 60), width=2)
    draw_rounded_rect(d, [bw*4, bw*4, SIZE-bw*4, SIZE-bw*4], 26,
                      outline=hex_to_rgba('#F39C12', 30), width=1)
    # 旋涡笔触
    draw_swirl(d, SIZE-100, 120, 120, hex_to_rgba('#F39C12', 100))
    draw_swirl(d, 100, SIZE-120, 100, hex_to_rgba('#E67E22', 100))
    # 顶部星星
    draw_star4(d, SIZE//2, 60, 40, hex_to_rgba('#F1C40F', 200))
    return img

def border_disney():
    img = new_canvas()
    d = ImageDraw.Draw(img)
    color = hex_to_rgba('#9B59B6')
    color2 = hex_to_rgba('#F1C40F', 200)
    bw = 5
    pad = bw // 2
    # 圆角边框
    draw_rounded_rect(d, [pad, pad, SIZE-pad, SIZE-pad], 26, outline=color, width=bw)
    # 星星装饰
    draw_star5(d, 100, 80, 60, hex_to_rgba('#9B59B6', 200))
    draw_star5(d, SIZE-100, 140, 50, color2)
    # 底部闪光弧线
    pts = []
    for i in range(41):
        t = i / 40
        x = 120 + t * (SIZE - 240)
        y = SIZE - 80 + math.sin(t * math.pi) * -30
        pts.append((x, y))
    d.line(pts, fill=hex_to_rgba('#9B59B6', 120), width=2)
    draw_star4(d, 120, SIZE-80, 20, hex_to_rgba('#9B59B6', 120))
    draw_star4(d, SIZE-120, SIZE-80, 20, hex_to_rgba('#F1C40F', 120))
    # 闪光点
    d.ellipse([40, SIZE-120, 50, SIZE-110], fill=hex_to_rgba('#FFFFFF', 150))
    return img

def border_sketch():
    img = new_canvas()
    d = ImageDraw.Draw(img)
    color = hex_to_rgba('#BDC3C7')
    bw = 3
    pad = bw // 2
    # 简单细线边框
    d.rectangle([pad, pad, SIZE-pad, SIZE-pad], outline=color, width=bw)
    # 排线装饰 — 左上角
    for i in range(12):
        y = 20 + i * 6
        d.line([(20, y), (80 + i*3, y)], fill=hex_to_rgba('#BDC3C7', 60), width=1)
    # 排线装饰 — 右下角
    for i in range(12):
        y = SIZE - 80 + i * 6
        d.line([(SIZE - 80 - i*3, y), (SIZE - 20, y)], fill=hex_to_rgba('#BDC3C7', 60), width=1)
    return img

def border_vaporwave():
    img = new_canvas()
    d = ImageDraw.Draw(img)
    color = hex_to_rgba('#FF6EC7')
    color2 = hex_to_rgba('#00D4FF', 60)
    bw = 4
    pad = bw // 2
    # 圆角边框
    draw_rounded_rect(d, [pad, pad, SIZE-pad, SIZE-pad], 18, outline=color, width=bw)
    # 网格
    grid_color = hex_to_rgba('#FF6EC7', 25)
    for i in range(1, 7):
        x = SIZE // 7 * i
        d.line([(x, pad), (x, SIZE-pad)], fill=grid_color, width=1)
        y = SIZE // 7 * i
        d.line([(pad, y), (SIZE-pad, y)], fill=grid_color, width=1)
    # 底部太阳圆
    sun_cx, sun_cy = SIZE//2, int(SIZE*0.85)
    sun_r = 120
    for i in range(5):
        r = sun_r - i * 20
        if r > 0:
            alpha = 30 + i * 10
            d.ellipse([sun_cx-r, sun_cy-r, sun_cx+r, sun_cy+r],
                      fill=hex_to_rgba('#FF6EC7', alpha))
    # 横条纹遮罩太阳
    for i in range(4):
        y = sun_cy + i * 25 - 10
        d.rectangle([sun_cx-sun_r, y, sun_cx+sun_r, y+6], fill=(0,0,0,0))
    return img

def border_japanese():
    img = new_canvas()
    d = ImageDraw.Draw(img)
    color = hex_to_rgba('#E74C3C')
    bw = 4
    pad = bw // 2
    # 圆角边框
    draw_rounded_rect(d, [pad, pad, SIZE-pad, SIZE-pad], 16, outline=color, width=bw)
    # 内层细线
    draw_rounded_rect(d, [bw*3, bw*3, SIZE-bw*3, SIZE-bw*3], 12,
                      outline=hex_to_rgba('#E74C3C', 80), width=1)
    # 樱花装饰
    draw_sakura(d, 120, 80, 80, hex_to_rgba('#E74C3C', 140))
    draw_sakura(d, SIZE-120, 130, 70, hex_to_rgba('#FF6B9D', 120))
    draw_sakura(d, 70, SIZE-100, 75, hex_to_rgba('#E74C3C', 100))
    draw_sakura(d, SIZE-100, SIZE-90, 80, hex_to_rgba('#FF6B9D', 100))
    return img

def border_cybergufeng():
    img = new_canvas()
    d = ImageDraw.Draw(img)
    color = hex_to_rgba('#2ECC71')
    color2 = hex_to_rgba('#C8553D', 100)
    bw = 4
    cl = int(SIZE * 0.20)
    pad = bw // 2
    # 四角L型
    d.line([(pad, pad+cl), (pad, pad), (pad+cl, pad)], fill=color, width=bw+2)
    d.line([(SIZE-pad-cl, pad), (SIZE-pad, pad), (SIZE-pad, pad+cl)], fill=color, width=bw+2)
    d.line([(pad, SIZE-pad-cl), (pad, SIZE-pad), (pad+cl, SIZE-pad)], fill=color, width=bw+2)
    d.line([(SIZE-pad-cl, SIZE-pad), (SIZE-pad, SIZE-pad), (SIZE-pad, SIZE-pad-cl)], fill=color, width=bw+2)
    # 电路走线
    draw_circuit_line(d, 60, 120, 280, 120, hex_to_rgba('#2ECC71', 120))
    draw_circuit_line(d, 700, SIZE-120, 960, SIZE-120, hex_to_rgba('#2ECC71', 120))
    # 六边形装饰
    draw_hexagon(d, SIZE-100, 100, 50, hex_to_rgba('#2ECC71', 100))
    draw_hexagon(d, 100, SIZE-100, 40, color2)
    # 故障条
    d.rectangle([300, 150, 600, 165], fill=hex_to_rgba('#2ECC71', 100))
    return img

# ============================================================
# 主函数 — 生成所有边框
# ============================================================

BORDERS = {
    'gufeng': border_gufeng,
    'anime': border_anime,
    'cyberpunk': border_cyberpunk,
    'q3d': border_q3d,
    'watercolor': border_watercolor,
    'retro': border_retro,
    'flat': border_flat,
    'oil': border_oil,
    'pixel': border_pixel,
    'ukiyoe': border_ukiyoe,
    'vangogh': border_vangogh,
    'disney': border_disney,
    'sketch': border_sketch,
    'vaporwave': border_vaporwave,
    'japanese': border_japanese,
    'cybergufeng': border_cybergufeng,
}

def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    for style_id, func in BORDERS.items():
        img = func()
        out_path = os.path.join(OUT_DIR, f'{style_id}.png')
        img.save(out_path, 'PNG')
        print(f'  generated: {style_id}.png ({os.path.getsize(out_path)} bytes)')
    print(f'\nAll 16 borders generated in {OUT_DIR}')

if __name__ == '__main__':
    main()
