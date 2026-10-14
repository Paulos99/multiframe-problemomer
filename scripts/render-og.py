"""Render public/og-share.jpg — full-bleed brand card for messengers."""
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1280, 720

BG_DEEP = (12, 51, 44)  # #0c332c
BG_MID = (1, 100, 79)  # #01644f
BG_LIGHT = (42, 179, 139)
INK = (255, 255, 255)
MUTED = (196, 220, 212)
BTN_BG = (255, 255, 255)
BTN_TEXT = (1, 100, 79)

FONT = r"C:\Windows\Fonts\segoeuib.ttf"
FONT_REG = r"C:\Windows\Fonts\segoeui.ttf"


def recolor(im: Image.Image, rgb: tuple[int, int, int]) -> Image.Image:
    im = im.convert("RGBA")
    out = Image.new("RGBA", im.size, (*rgb, 0))
    out.putalpha(im.getchannel("A"))
    return out


def trim(im: Image.Image, threshold: int = 16) -> Image.Image:
    mask = im.getchannel("A").point(lambda p: 255 if p > threshold else 0)
    box = mask.getbbox()
    return im.crop(box) if box else im


def text_size(font: ImageFont.FreeTypeFont, text: str) -> tuple[int, int]:
    box = font.getbbox(text)
    return box[2] - box[0], box[3] - box[1]


def draw_text(draw: ImageDraw.ImageDraw, text: str, xy: tuple[int, int], font, fill) -> tuple[int, int]:
    box = font.getbbox(text)
    draw.text((xy[0] - box[0], xy[1] - box[1]), text, font=font, fill=fill)
    return text_size(font, text)


base = Image.new("RGBA", (W, H), (*BG_DEEP, 255))
grad = Image.new("RGBA", (W, H), (0, 0, 0, 0))
gdraw = ImageDraw.Draw(grad)
for i, alpha in enumerate((90, 70, 48, 28)):
    gdraw.ellipse(
        (420 + i * 40, -180 + i * 20, 1480 + i * 30, 620 + i * 40),
        fill=(*BG_MID, alpha),
    )
gdraw.ellipse((-320, 280, 520, 980), fill=(*BG_LIGHT, 36))
gdraw.ellipse((900, 420, 1600, 980), fill=(*BG_MID, 50))
base.alpha_composite(grad.filter(ImageFilter.GaussianBlur(64)))

rail = Image.new("RGBA", (W, H), (0, 0, 0, 0))
ImageDraw.Draw(rail).rectangle((0, 0, W, 8), fill=(*BG_LIGHT, 180))
base.alpha_composite(rail)

draw = ImageDraw.Draw(base)

# Brand lockup
stp = trim(recolor(Image.open("public/logo-stp.png"), INK))
mf = trim(recolor(Image.open("public/logo-multiframe.png"), INK))
stp_h = 72
stp = stp.resize((round(stp.width * stp_h / stp.height), stp_h), Image.Resampling.LANCZOS)
mf_h = 44
mf = mf.resize((round(mf.width * mf_h / mf.height), mf_h), Image.Resampling.LANCZOS)

left = 72
top = 56
base.alpha_composite(stp, (left, top))
mf_x = left + stp.width + 18
base.alpha_composite(mf, (mf_x, top + (stp_h - mf_h) // 2 + 2))

brand_font = ImageFont.truetype(FONT, 28)
brand = "Проблемомер"
bw, bh = text_size(brand_font, brand)
div_x = mf_x + mf.width + 22
draw.line((div_x, top + 16, div_x, top + stp_h - 16), fill=(*MUTED, 160), width=2)
draw_text(draw, brand, (div_x + 20, top + (stp_h - bh) // 2), brand_font, MUTED)

# Panel on the right — smaller, further right, no text collision
panel = Image.open("public/images/multiframe-panel-transparent.png").convert("RGBA")
ph = 380
panel = panel.resize((round(panel.width * ph / panel.height), ph), Image.Resampling.LANCZOS)
glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
ImageDraw.Draw(glow).ellipse((900, 180, 1280, 620), fill=(255, 255, 255, 24))
base.alpha_composite(glow.filter(ImageFilter.GaussianBlur(36)))
px = W - panel.width + 20  # bleed slightly off right edge
py = (H - panel.height) // 2 + 36
base.alpha_composite(panel, (px, py))

# Copy stays in left column (clear of panel)
title_font = ImageFont.truetype(FONT, 66)
sub_font = ImageFont.truetype(FONT_REG, 28)
btn_font = ImageFont.truetype(FONT, 30)

y = 196
_, th1 = draw_text(draw, "Слышите соседей", (left, y), title_font, INK)
y += th1 + 2
_, th2 = draw_text(draw, "сверху?", (left, y), title_font, INK)
y += th2 + 26

_, sh1 = draw_text(draw, "Узнайте за 2 минуты,", (left, y), sub_font, MUTED)
y += sh1 + 6
_, sh2 = draw_text(draw, "насколько тише станет комната", (left, y), sub_font, MUTED)
y += sh2 + 38

label = "Пройти расчёт бесплатно"
lw, lh = text_size(btn_font, label)
btn_w = max(lw + 88, 440)
btn_h = 80
btn_x = left
btn_y = y

bshadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
ImageDraw.Draw(bshadow).rounded_rectangle(
    (btn_x, btn_y + 8, btn_x + btn_w, btn_y + btn_h + 14),
    radius=16,
    fill=(0, 0, 0, 70),
)
base.alpha_composite(bshadow.filter(ImageFilter.GaussianBlur(12)))

draw = ImageDraw.Draw(base)
draw.rounded_rectangle(
    (btn_x, btn_y, btn_x + btn_w, btn_y + btn_h),
    radius=16,
    fill=BTN_BG,
)
lb = btn_font.getbbox(label)
draw.text(
    (btn_x + (btn_w - lw) // 2 - lb[0], btn_y + (btn_h - lh) // 2 - lb[1] - 1),
    label,
    font=btn_font,
    fill=BTN_TEXT,
)

trust_font = ImageFont.truetype(FONT_REG, 22)
draw_text(
    draw,
    "Без регистрации · результат сразу",
    (left, btn_y + btn_h + 18),
    trust_font,
    MUTED,
)

rgb = base.convert("RGB")
rgb.save("public/og-share.jpg", quality=92, subsampling=0, optimize=True)
print("saved", rgb.size, "public/og-share.jpg")
