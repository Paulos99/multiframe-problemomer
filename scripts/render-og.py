"""Render public/og-share.jpg from the real STP and MultiFrame logos."""
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

W, H = 1280, 720
BG = (244, 247, 246)
CARD = (255, 255, 255)
INK = (17, 17, 17)
MUTED = (95, 107, 115)
ACCENT = (1, 100, 79)
BORDER = (225, 229, 232)
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


def draw_centered(draw: ImageDraw.ImageDraw, text: str, y: int, font, fill, canvas_w: int) -> int:
    tw, th = text_size(font, text)
    box = font.getbbox(text)
    x = (canvas_w - tw) // 2 - box[0]
    draw.text((x, y), text, font=font, fill=fill)
    return th


base = Image.new("RGBA", (W, H), (*BG, 255))

glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
gdraw = ImageDraw.Draw(glow)
gdraw.ellipse((860, 460, 1520, 1120), fill=(*ACCENT, 40))
gdraw.ellipse((-280, 380, 420, 980), fill=(*ACCENT, 28))
base.alpha_composite(glow.filter(ImageFilter.GaussianBlur(72)))

card = (52, 44, W - 52, H - 44)
shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
ImageDraw.Draw(shadow).rounded_rectangle(
    (card[0], card[1] + 12, card[2], card[3] + 18),
    radius=28,
    fill=(17, 24, 39, 32),
)
base.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(16)))

card_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
ImageDraw.Draw(card_layer).rounded_rectangle(card, radius=28, fill=(*CARD, 255))
wash = Image.new("RGBA", (W, H), (0, 0, 0, 0))
ImageDraw.Draw(wash).ellipse((-80, 420, 560, 860), fill=(*ACCENT, 28))
wash = wash.filter(ImageFilter.GaussianBlur(24))
mask = Image.new("L", (W, H), 0)
ImageDraw.Draw(mask).rounded_rectangle(card, radius=28, fill=255)
wash.putalpha(ImageChops.multiply(wash.getchannel("A"), mask))
card_layer.alpha_composite(wash)
base.alpha_composite(card_layer)

draw = ImageDraw.Draw(base)
draw.rounded_rectangle(card, radius=28, outline=BORDER, width=2)

stp = trim(recolor(Image.open("public/logo-stp.png"), INK))
mf = trim(recolor(Image.open("public/logo-multiframe.png"), INK))
stp_h = 84
stp = stp.resize((round(stp.width * stp_h / stp.height), stp_h), Image.Resampling.LANCZOS)
mf_h = 48
mf = mf.resize((round(mf.width * mf_h / mf.height), mf_h), Image.Resampling.LANCZOS)

brand_font = ImageFont.truetype(FONT, 26)
brand = "Проблемомер"
bw, bh = text_size(brand_font, brand)
gap = 20
div_gap = 20
row_w = stp.width + gap + mf.width + div_gap + 2 + div_gap + bw
row_x = (W - row_w) // 2
# Optical center of the card: logo row through the button.
row_mid = 188
base.alpha_composite(stp, (row_x, row_mid - stp_h // 2))
mf_x = row_x + stp.width + gap
base.alpha_composite(mf, (mf_x, row_mid - mf_h // 2 + 1))
div_x = mf_x + mf.width + div_gap
draw.line((div_x, row_mid - 22, div_x, row_mid + 22), fill=BORDER, width=2)
bbox = brand_font.getbbox(brand)
draw.text(
    (div_x + div_gap - bbox[0], row_mid - bh // 2 - bbox[1]),
    brand,
    font=brand_font,
    fill=MUTED,
)

title_font = ImageFont.truetype(FONT, 68)
sub_font = ImageFont.truetype(FONT_REG, 28)
btn_font = ImageFont.truetype(FONT, 26)

y = 278
y += draw_centered(draw, "Ощутите эффект", y, title_font, INK, W) + 6
y += draw_centered(draw, "звукоизоляции", y, title_font, ACCENT, W) + 26
y += draw_centered(
    draw,
    "Бесплатный расчёт для вашей комнаты — шаги, музыка и эхо",
    y,
    sub_font,
    MUTED,
    W,
) + 36

label = "Пройти расчёт бесплатно"
lw, lh = text_size(btn_font, label)
btn_w = lw + 72
btn_h = 64
btn_x = (W - btn_w) // 2
btn_y = y
bshadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
ImageDraw.Draw(bshadow).rounded_rectangle(
    (btn_x, btn_y + 6, btn_x + btn_w, btn_y + btn_h + 12),
    radius=14,
    fill=(*ACCENT, 64),
)
base.alpha_composite(bshadow.filter(ImageFilter.GaussianBlur(10)))
draw = ImageDraw.Draw(base)
draw.rounded_rectangle((btn_x, btn_y, btn_x + btn_w, btn_y + btn_h), radius=14, fill=ACCENT)
lb = btn_font.getbbox(label)
draw.text(
    (btn_x + (btn_w - lw) // 2 - lb[0], btn_y + (btn_h - lh) // 2 - lb[1] - 1),
    label,
    font=btn_font,
    fill=(255, 255, 255),
)

rgb = base.convert("RGB")
rgb.save("public/og-share.jpg", quality=92, subsampling=0, optimize=True)
print("saved", rgb.size)
