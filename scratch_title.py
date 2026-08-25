import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps, ImageChops

def make_star_glint(size, color=(255, 255, 255, 255), glow_color=(255, 220, 140, 130)):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    cx, cy = size // 2, size // 2
    
    # Soft glow
    glow_rad = size // 3
    glow = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([cx - glow_rad, cy - glow_rad, cx + glow_rad, cy + glow_rad], fill=glow_color)
    glow = glow.filter(ImageFilter.GaussianBlur(glow_rad // 2))
    img = Image.alpha_composite(img, glow)
    
    # Rays
    beam_len = size // 2 - 2
    beam_w = max(2, size // 16)
    
    d = ImageDraw.Draw(img)
    d.polygon([(cx - beam_len, cy), (cx, cy - beam_w), (cx + beam_len, cy), (cx, cy + beam_w)], fill=color)
    d.polygon([(cx, cy - beam_len), (cx - beam_w, cy), (cx, cy + beam_len), (cx + beam_w, cy)], fill=color)
    
    d_len = int(beam_len * 0.45)
    d_w = max(1, beam_w // 2)
    d.polygon([(cx - d_len, cy - d_len), (cx + d_w, cy - d_w), (cx + d_len, cy + d_len), (cx - d_w, cy + d_w)], fill=(255, 245, 210, 190))
    d.polygon([(cx - d_len, cy + d_len), (cx - d_w, cy - d_w), (cx + d_len, cy - d_len), (cx + d_w, cy + d_w)], fill=(255, 245, 210, 190))
    
    core_rad = max(2, size // 9)
    d.ellipse([cx - core_rad, cy - core_rad, cx + core_rad, cy + core_rad], fill=(255, 255, 255, 255))
    return img

def render_title_image(
    base_img_path='thumbnail.png',
    output_path='thumbnail_final.png',
    lines=["GEM CRACKER"],
    font_sizes=[116],
    y_pos=155,
    tracking=14,
    bold_weight=1.8,
    glow_intensity=1.1,
    line_spacing=0,
    glints=[]
):
    base_img = Image.open(base_img_path).convert('RGB')
    W, H = base_img.size
    
    SCALE = 2
    sw, sh = W * SCALE, H * SCALE
    font_path = 'font/Cinzel-VariableFont_wght.ttf'
    
    # 1. Build text mask
    text_mask = Image.new('L', (sw, sh), 0)
    line_data = []
    
    for i, line in enumerate(lines):
        sz = int(font_sizes[i] * SCALE)
        font = ImageFont.truetype(font_path, sz)
        tr = int(tracking * SCALE)
        
        total_w = 0
        char_info = []
        for char in line:
            adv = font.getlength(char)
            bbox = font.getbbox(char)
            char_info.append((char, adv, bbox))
            total_w += adv + tr
        total_w -= tr
        
        ascent, descent = font.getmetrics()
        line_h = ascent + descent
        line_data.append({
            'line': line,
            'font': font,
            'total_w': total_w,
            'char_info': char_info,
            'track': tr,
            'line_h': line_h,
            'ascent': ascent
        })
        
    cur_y = int(y_pos * SCALE)
    line_bounds = []
    
    for ld in line_data:
        x = (sw - ld['total_w']) / 2
        y = cur_y
        lmask = Image.new('L', (sw, sh), 0)
        draw = ImageDraw.Draw(lmask)
        
        cx = x
        for char, adv, bbox in ld['char_info']:
            draw.text((cx, y), char, font=ld['font'], fill=255)
            cx += adv + ld['track']
            
        if bold_weight > 0:
            rad = int(bold_weight * SCALE)
            lmask = lmask.filter(ImageFilter.MaxFilter(rad * 2 + 1))
            
        text_mask = ImageChops.lighter(text_mask, lmask)
        line_bounds.append((int(y), int(y + ld['line_h'] + bold_weight * SCALE * 2), int(x), int(x + ld['total_w'])))
        cur_y += ld['line_h'] + int(line_spacing * SCALE)

    # 2. Deep cinematic drop shadows
    shadow_layer = Image.new('RGBA', (sw, sh), (0, 0, 0, 0))
    amb_mask = text_mask.filter(ImageFilter.GaussianBlur(20 * SCALE))
    amb_img = Image.new('RGBA', (sw, sh), (0, 0, 0, 230))
    shadow_layer.paste(amb_img, (0, 14 * SCALE), amb_mask)
    
    dir_mask = text_mask.filter(ImageFilter.GaussianBlur(5 * SCALE))
    dir_img = Image.new('RGBA', (sw, sh), (0, 0, 0, 255))
    shadow_layer.paste(dir_img, (0, 6 * SCALE), dir_mask)

    # 3. Radiant warm golden ambient glow
    glow_layer = Image.new('RGBA', (sw, sh), (0, 0, 0, 0))
    glow_mask = text_mask.filter(ImageFilter.GaussianBlur(15 * SCALE))
    glow_color = Image.new('RGBA', (sw, sh), (255, 175, 50, int(220 * glow_intensity)))
    glow_layer.paste(glow_color, (0, 0), glow_mask)
    
    aura_mask = text_mask.filter(ImageFilter.GaussianBlur(6 * SCALE))
    aura_color = Image.new('RGBA', (sw, sh), (255, 215, 90, int(160 * glow_intensity)))
    glow_layer.paste(aura_color, (0, 0), aura_mask)

    # 4. Obsidian dark chisel frame stroke
    stroke_mask = text_mask.filter(ImageFilter.MaxFilter(int(2.5 * SCALE * 2 + 1)))
    stroke_mask = ImageChops.subtract(stroke_mask, text_mask)
    stroke_layer = Image.new('RGBA', (sw, sh), (0, 0, 0, 0))
    stroke_color = Image.new('RGBA', (sw, sh), (22, 12, 6, 255))
    stroke_layer.paste(stroke_color, (0, 0), stroke_mask)

    # 5. Metallic 3D Gold Gradient
    grad_img = Image.new('RGBA', (sw, sh), (0, 0, 0, 0))
    for (y0, y1, x0, x1) in line_bounds:
        lh = max(1, y1 - y0)
        strip_y = np.linspace(0.0, 1.0, lh)
        strip_rgba = np.zeros((lh, 1, 4), dtype=np.uint8)
        
        for idx, t in enumerate(strip_y):
            if t < 0.15:
                k = t / 0.15
                r = int(255 * (1 - k) + 255 * k)
                g = int(255 * (1 - k) + 238 * k)
                b = int(240 * (1 - k) + 155 * k)
            elif t < 0.45:
                k = (t - 0.15) / 0.30
                r = int(255 * (1 - k) + 245 * k)
                g = int(238 * (1 - k) + 185 * k)
                b = int(155 * (1 - k) + 55 * k)
            elif t < 0.70:
                k = (t - 0.45) / 0.25
                r = int(245 * (1 - k) + 195 * k)
                g = int(185 * (1 - k) + 125 * k)
                b = int(55 * (1 - k) + 25 * k)
            elif t < 0.85:
                k = (t - 0.70) / 0.15
                r = int(195 * (1 - k) + 130 * k)
                g = int(125 * (1 - k) + 70 * k)
                b = int(25 * (1 - k) + 10 * k)
            else:
                k = (t - 0.85) / 0.15
                r = int(130 * (1 - k) + 250 * k)
                g = int(70 * (1 - k) + 210 * k)
                b = int(10 * (1 - k) + 115 * k)
            strip_rgba[idx, 0] = [r, g, b, 255]
            
        strip = Image.fromarray(strip_rgba, 'RGBA').resize((sw, lh), Image.Resampling.BILINEAR)
        grad_img.paste(strip, (0, y0))

    gold_text = Image.new('RGBA', (sw, sh), (0, 0, 0, 0))
    gold_text.paste(grad_img, (0, 0), text_mask)

    # 6. Chisel Emboss Highlights & Inner Shadow
    top_edge = ImageChops.subtract(text_mask, ImageChops.offset(text_mask, 0, 2 * SCALE))
    top_hl = Image.new('RGBA', (sw, sh), (0, 0, 0, 0))
    top_hl.paste(Image.new('RGBA', (sw, sh), (255, 255, 245, 220)), (0, 0), top_edge.filter(ImageFilter.GaussianBlur(1)))
    
    left_edge = ImageChops.subtract(text_mask, ImageChops.offset(text_mask, 2 * SCALE, 0))
    left_hl = Image.new('RGBA', (sw, sh), (0, 0, 0, 0))
    left_hl.paste(Image.new('RGBA', (sw, sh), (255, 245, 200, 160)), (0, 0), left_edge.filter(ImageFilter.GaussianBlur(1)))
    
    bot_edge = ImageChops.subtract(text_mask, ImageChops.offset(text_mask, 0, -2 * SCALE))
    bot_sh = Image.new('RGBA', (sw, sh), (0, 0, 0, 0))
    bot_sh.paste(Image.new('RGBA', (sw, sh), (35, 15, 0, 200)), (0, 0), bot_edge.filter(ImageFilter.GaussianBlur(1)))

    text_comp = Image.new('RGBA', (sw, sh), (0, 0, 0, 0))
    text_comp = Image.alpha_composite(text_comp, stroke_layer)
    text_comp = Image.alpha_composite(text_comp, gold_text)
    text_comp = Image.alpha_composite(text_comp, bot_sh)
    text_comp = Image.alpha_composite(text_comp, left_hl)
    text_comp = Image.alpha_composite(text_comp, top_hl)

    # 7. Sparkle Star Glints
    if glints:
        glint_layer = Image.new('RGBA', (sw, sh), (0, 0, 0, 0))
        for (gx, gy, sz) in glints:
            asset = make_star_glint(int(sz * SCALE))
            as_w, as_h = asset.size
            pos_x = int(gx * sw - as_w // 2)
            pos_y = int(gy * sh - as_h // 2)
            glint_layer.paste(asset, (pos_x, pos_y), asset)
        text_comp = Image.alpha_composite(text_comp, glint_layer)

    # 8. Downsample and Composite
    shadow_layer = shadow_layer.resize((W, H), Image.Resampling.LANCZOS)
    glow_layer = glow_layer.resize((W, H), Image.Resampling.LANCZOS)
    text_comp = text_comp.resize((W, H), Image.Resampling.LANCZOS)
    
    final_img = base_img.convert('RGBA')
    final_img = Image.alpha_composite(final_img, shadow_layer)
    final_img = Image.alpha_composite(final_img, glow_layer)
    final_img = Image.alpha_composite(final_img, text_comp)
    
    out_rgb = final_img.convert('RGB')
    out_rgb.save(output_path, quality=98)
    print(f"Saved {output_path}")
    return out_rgb

if __name__ == '__main__':
    # 1. Single-line widescreen banner (Clean & bold)
    render_title_image(
        'thumbnail.png',
        'thumbnail_single_banner.png',
        lines=["GEM CRACKER"],
        font_sizes=[116],
        y_pos=150,
        tracking=14,
        bold_weight=1.8,
        glints=[(0.13, 0.138, 55), (0.87, 0.143, 50)]
    )
    
    # 2. Stacked Title (Blockbuster logo)
    render_title_image(
        'thumbnail.png',
        'thumbnail_stacked_epic.png',
        lines=["GEM", "CRACKER"],
        font_sizes=[142, 106],
        y_pos=85,
        tracking=16,
        line_spacing=8,
        bold_weight=1.8,
        glints=[(0.35, 0.088, 55), (0.80, 0.19, 50)]
    )
