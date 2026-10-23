"""Draw the PickOrbeet email illustrations into public/images/email/.

The reference sheet uses soft studio art. These are the same objects, in the
store's navy and orange, composited with the real bag mark. Run from anywhere:

    ../pickorbeet-backend/venv/bin/python scripts/build_email_art.py
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public' / 'images' / 'email'
LOGO = ROOT / 'public' / 'images' / 'logo.png'

NAVY = (36, 49, 140, 255)
NAVY_DEEP = (23, 32, 92, 255)
BLUE = (40, 100, 232, 255)
ORANGE = (255, 121, 31, 255)
ORANGE_DEEP = (214, 96, 0, 255)
INK = (23, 32, 51, 255)
CARD = (244, 220, 176, 255)
CARD_DARK = (196, 146, 84, 255)
CARD_LIGHT = (250, 232, 196, 255)
GREEN = (34, 160, 107, 255)
WHITE = (255, 255, 255, 255)
PALE = (238, 243, 252, 255)

FONT = '/System/Library/Fonts/Supplemental/Arial Bold.ttf'


def canvas(w, h):
    return Image.new('RGBA', (w, h), (0, 0, 0, 0))


def font(size):
    return ImageFont.truetype(FONT, size)


def blur_ellipse(base, box, color, radius):
    layer = canvas(*base.size)
    ImageDraw.Draw(layer).ellipse(box, fill=color)
    base.alpha_composite(layer.filter(ImageFilter.GaussianBlur(radius)))


def logo(width):
    mark = Image.open(LOGO).convert('RGBA')
    height = round(width * mark.size[1] / mark.size[0])
    return mark.resize((width, height), Image.Resampling.LANCZOS)


def paste(base, image, xy):
    base.alpha_composite(image, xy)


def platform(base, cx, cy, rx, ry):
    blur_ellipse(base, (cx - rx, cy - ry // 3, cx + rx, cy + ry), (32, 56, 120, 42), 14)
    draw = ImageDraw.Draw(base)
    draw.ellipse((cx - rx, cy - ry, cx + rx, cy + ry), fill=(228, 236, 250, 255))
    draw.ellipse((cx - rx + 14, cy - ry + 8, cx + rx - 14, cy + ry - 10), fill=(255, 255, 255, 255))


def save(image, name):
    OUT.mkdir(parents=True, exist_ok=True)
    image.save(OUT / name, 'PNG')


def bag():
    image = canvas(440, 400)
    platform(image, 220, 318, 120, 28)
    mark = logo(210)
    paste(image, mark, (220 - mark.size[0] // 2, 78))
    save(image, 'bag.png')


def badge(size=72):
    """White chip with the bag mark, for parcels and the truck door."""
    image = canvas(size, size)
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((0, 0, size - 1, size - 1), radius=size // 5, fill=WHITE)
    mark = logo(size - 16)
    paste(image, mark, ((size - mark.size[0]) // 2, (size - mark.size[1]) // 2))
    return image


def parcel():
    image = canvas(480, 420)
    platform(image, 230, 360, 130, 26)
    draw = ImageDraw.Draw(image)
    x, y, w, h, d = 120, 150, 180, 150, 54
    draw.polygon([(x, y), (x + w, y), (x + w, y + h), (x, y + h)], fill=CARD)
    draw.polygon([(x + w, y), (x + w + d, y - 28), (x + w + d, y + h - 28), (x + w, y + h)], fill=CARD_DARK)
    draw.polygon([(x, y), (x + d, y - 28), (x + w + d, y - 28), (x + w, y)], fill=CARD_LIGHT)
    draw.line([(x + 28, y), (x + 28 + d, y - 28)], fill=(232, 196, 140, 255), width=3)
    paste(image, badge(78), (x + 46, y + 36))
    # Small orange carton floating at the right, as on the reference sheet.
    ox, oy = 330, 168
    draw.polygon([(ox, oy), (ox + 46, oy), (ox + 46, oy + 40), (ox, oy + 40)], fill=ORANGE)
    draw.polygon([(ox + 46, oy), (ox + 64, oy - 12), (ox + 64, oy + 28), (ox + 46, oy + 40)], fill=ORANGE_DEEP)
    draw.polygon([(ox, oy), (ox + 18, oy - 12), (ox + 64, oy - 12), (ox + 46, oy)], fill=(255, 168, 92, 255))
    save(image, 'parcel.png')


def pin(draw, cx, cy, r=18):
    draw.polygon([(cx, cy + r + 14), (cx - r + 2, cy - 2), (cx + r - 2, cy - 2)], fill=ORANGE)
    draw.ellipse((cx - r, cy - r - 6, cx + r, cy + r - 6), fill=ORANGE)
    draw.ellipse((cx - 7, cy - 13, cx + 7, cy + 1), fill=WHITE)


def truck():
    image = canvas(520, 360)
    platform(image, 250, 300, 150, 24)
    draw = ImageDraw.Draw(image)
    pin(draw, 400, 78)
    draw.rounded_rectangle((70, 150, 300, 270), radius=18, fill=WHITE)
    draw.rounded_rectangle((70, 150, 300, 196), radius=16, fill=NAVY)
    draw.rounded_rectangle((286, 168, 430, 270), radius=28, fill=(247, 248, 252, 255))
    draw.rounded_rectangle((300, 182, 390, 230), radius=12, fill=(214, 226, 246, 255))
    draw.ellipse((118, 246, 168, 296), fill=INK)
    draw.ellipse((132, 260, 154, 282), fill=(226, 230, 238, 255))
    draw.ellipse((332, 246, 382, 296), fill=INK)
    draw.ellipse((346, 260, 368, 282), fill=(226, 230, 238, 255))
    paste(image, badge(54), (150, 204))
    save(image, 'truck.png')


def open_box():
    image = canvas(460, 400)
    platform(image, 230, 340, 120, 24)
    draw = ImageDraw.Draw(image)
    x, y, w, h = 130, 168, 190, 130
    draw.polygon([(x, y), (x + w, y), (x + w, y + h), (x, y + h)], fill=CARD)
    draw.polygon([(x + w, y), (x + w + 48, y - 26), (x + w + 48, y + h - 26), (x + w, y + h)], fill=CARD_DARK)
    # Open flaps.
    draw.polygon([(x, y), (x - 70, y - 36), (x + 20, y - 70), (x + w // 2, y)], fill=CARD_LIGHT)
    draw.polygon([(x + w, y), (x + w // 2, y), (x + w - 10, y - 74), (x + w + 78, y - 30)], fill=(236, 206, 150, 255))
    draw.rounded_rectangle((x + 48, y + 28, x + 142, y + 108), radius=16, fill=(226, 236, 252, 255))
    paste(image, badge(62), (x + 64, y + 36))
    save(image, 'open-box.png')


def lock():
    image = canvas(420, 400)
    platform(image, 210, 340, 100, 22)
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((148, 128, 178, 214), radius=14, fill=NAVY)
    draw.rounded_rectangle((242, 128, 272, 214), radius=14, fill=NAVY)
    draw.arc((148, 78, 272, 198), 180, 360, fill=NAVY, width=30)
    draw.rounded_rectangle((108, 176, 312, 326), radius=36, fill=NAVY)
    draw.ellipse((176, 214, 244, 282), fill=ORANGE)
    draw.rounded_rectangle((200, 256, 220, 298), radius=6, fill=(255, 214, 170, 255))
    save(image, 'lock.png')


def check_mark(draw, x, y, scale=1, color=WHITE, width=8):
    draw.line(
        [(x, y + 8 * scale), (x + 10 * scale, y + 18 * scale), (x + 26 * scale, y)],
        fill=color, width=width, joint='curve',
    )


def envelope():
    image = canvas(460, 400)
    platform(image, 230, 340, 110, 22)
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((90, 120, 370, 300), radius=22, fill=ORANGE)
    draw.polygon([(90, 140), (230, 250), (370, 140)], fill=(255, 154, 77, 255))
    draw.polygon([(110, 150), (230, 230), (350, 150), (230, 118)], fill=BLUE)
    draw.ellipse((196, 168, 264, 236), fill=WHITE)
    check_mark(draw, 208, 188, scale=1.3, color=GREEN, width=7)
    # Paper plane corner, matching the sheet's small accent.
    draw.polygon([(300, 78), (360, 108), (318, 132)], fill=ORANGE)
    draw.polygon([(300, 78), (318, 132), (286, 118)], fill=NAVY)
    save(image, 'envelope.png')


def headphones(draw, ox, oy):
    band = (236, 240, 248, 255)
    cup = (255, 255, 255, 255)
    inner = (186, 198, 214, 255)
    draw.arc((ox, oy, ox + 150, oy + 130), 200, 340, fill=band, width=16)
    draw.rounded_rectangle((ox - 8, oy + 70, ox + 36, oy + 150), radius=16, fill=cup)
    draw.rounded_rectangle((ox + 114, oy + 70, ox + 158, oy + 150), radius=16, fill=cup)
    draw.rounded_rectangle((ox + 2, oy + 86, ox + 26, oy + 136), radius=8, fill=inner)
    draw.rounded_rectangle((ox + 124, oy + 86, ox + 148, oy + 136), radius=8, fill=inner)


def earbuds(draw, ox, oy):
    draw.rounded_rectangle((ox, oy + 36, ox + 92, oy + 110), radius=18, fill=BLUE)
    draw.ellipse((ox + 8, oy + 48, ox + 40, oy + 80), fill=(18, 48, 150, 255))
    draw.ellipse((ox + 18, oy, ox + 42, oy + 28), fill=BLUE)
    draw.ellipse((ox + 52, oy + 4, ox + 76, oy + 32), fill=BLUE)


def watch(draw, ox, oy):
    draw.rounded_rectangle((ox + 18, oy, ox + 70, oy + 28), radius=8, fill=(210, 218, 230, 255))
    draw.rounded_rectangle((ox + 18, oy + 108, ox + 70, oy + 136), radius=8, fill=(210, 218, 230, 255))
    draw.rounded_rectangle((ox, oy + 22, ox + 88, oy + 116), radius=22, fill=(244, 247, 252, 255))
    draw.rounded_rectangle((ox + 12, oy + 34, ox + 76, oy + 104), radius=16, fill=(72, 124, 230, 255))
    draw.ellipse((ox + 78, oy + 58, ox + 92, oy + 78), fill=ORANGE)


def sale():
    image = canvas(640, 420)
    draw = ImageDraw.Draw(image)
    headphones(draw, 40, 70)
    earbuds(draw, 250, 150)
    watch(draw, 420, 120)
    save(image, 'sale.png')


def cart():
    image = canvas(440, 400)
    platform(image, 210, 340, 110, 22)
    draw = ImageDraw.Draw(image)
    draw.line([(78, 86), (128, 86)], fill=NAVY, width=12)
    draw.line([(128, 86), (150, 118)], fill=NAVY, width=12)
    draw.polygon([(128, 118), (300, 118), (270, 230), (150, 230)], fill=BLUE)
    draw.line([(176, 128), (166, 230)], fill=(255, 255, 255, 140), width=4)
    draw.line([(220, 128), (210, 230)], fill=(255, 255, 255, 140), width=4)
    draw.line([(264, 128), (252, 230)], fill=(255, 255, 255, 140), width=4)
    draw.line([(156, 174), (292, 174)], fill=(255, 255, 255, 140), width=4)
    draw.ellipse((158, 236, 198, 276), fill=INK)
    draw.ellipse((228, 236, 268, 276), fill=INK)
    draw.ellipse((168, 246, 188, 266), fill=WHITE)
    draw.ellipse((238, 246, 258, 266), fill=WHITE)
    draw.ellipse((286, 48, 386, 148), fill=ORANGE)
    draw.text((312, 68), '%', font=font(52), fill=WHITE)
    save(image, 'cart.png')


def phone():
    image = canvas(280, 520)
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((20, 16, 260, 500), radius=36, fill=INK)
    draw.rounded_rectangle((34, 32, 246, 484), radius=28, fill=WHITE)
    draw.rounded_rectangle((100, 44, 180, 62), radius=10, fill=INK)
    mark = logo(96)
    paste(image, mark, ((280 - mark.size[0]) // 2, 150))
    draw.rounded_rectangle((70, 360, 210, 408), radius=14, fill=ORANGE)
    save(image, 'phone.png')


def check():
    image = canvas(128, 128)
    draw = ImageDraw.Draw(image)
    draw.ellipse((4, 4, 124, 124), fill=GREEN)
    check_mark(draw, 36, 58, scale=2.1, color=WHITE, width=12)
    save(image, 'check.png')


def icon_tile(name, painter, fill=PALE):
    image = canvas(160, 160)
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((8, 8, 152, 152), radius=36, fill=fill)
    painter(draw)
    save(image, name)


def icons():
    def grid(draw):
        for col in (40, 86):
            for row in (40, 86):
                draw.rounded_rectangle((col, row, col + 32, row + 32), radius=8, fill=BLUE)

    def card(draw):
        draw.rounded_rectangle((36, 48, 124, 112), radius=12, fill=NAVY)
        draw.rectangle((36, 68, 124, 82), fill=ORANGE)
        draw.rounded_rectangle((48, 90, 78, 100), radius=3, fill=WHITE)

    def van(draw):
        draw.rounded_rectangle((32, 70, 108, 108), radius=8, fill=NAVY)
        draw.rounded_rectangle((100, 78, 132, 108), radius=8, fill=BLUE)
        draw.ellipse((48, 100, 68, 120), fill=INK)
        draw.ellipse((104, 100, 124, 120), fill=INK)

    def seal(draw):
        draw.ellipse((40, 40, 120, 120), fill=GREEN)
        check_mark(draw, 58, 74, scale=1.5, color=WHITE, width=8)

    def cash(draw):
        draw.rounded_rectangle((32, 52, 128, 108), radius=10, fill=(22, 140, 90, 255))
        draw.ellipse((68, 64, 92, 96), fill=WHITE)

    def returns(draw):
        draw.arc((44, 44, 116, 116), 40, 300, fill=BLUE, width=10)
        draw.polygon([(108, 48), (128, 70), (100, 74)], fill=BLUE)

    def padlock(draw):
        draw.arc((62, 40, 102, 84), 200, 340, fill=NAVY, width=8)
        draw.rounded_rectangle((52, 74, 112, 122), radius=10, fill=NAVY)

    def basket(draw):
        draw.polygon([(48, 58), (118, 58), (108, 108), (58, 108)], fill=BLUE)
        draw.ellipse((62, 108, 78, 124), fill=INK)
        draw.ellipse((92, 108, 108, 124), fill=INK)

    def squares(draw):
        draw.rounded_rectangle((40, 44, 78, 82), radius=8, fill=BLUE)
        draw.rounded_rectangle((86, 44, 124, 82), radius=8, fill=ORANGE)
        draw.rounded_rectangle((40, 90, 78, 128), radius=8, fill=ORANGE)
        draw.rounded_rectangle((86, 90, 124, 128), radius=8, fill=NAVY)

    icon_tile('icon-range.png', grid)
    icon_tile('icon-pay.png', card, (255, 244, 232, 255))
    icon_tile('icon-ship.png', van, (232, 244, 255, 255))
    icon_tile('icon-genuine.png', seal, (232, 248, 240, 255))
    icon_tile('icon-cod.png', cash, (232, 248, 240, 255))
    icon_tile('icon-returns.png', returns, (232, 242, 255, 255))
    icon_tile('icon-secure.png', padlock, (255, 244, 232, 255))
    icon_tile('icon-cart.png', basket, (232, 242, 255, 255))
    icon_tile('icon-grid.png', squares)


def social(name, color, painter):
    image = canvas(128, 128)
    draw = ImageDraw.Draw(image)
    draw.ellipse((0, 0, 127, 127), fill=color)
    painter(draw)
    save(image, name)


def socials():
    def facebook(draw):
        draw.text((48, 22), 'f', font=font(78), fill=WHITE)

    def x_mark(draw):
        draw.line([(40, 40), (88, 88)], fill=WHITE, width=10)
        draw.line([(88, 40), (40, 88)], fill=WHITE, width=10)

    def youtube(draw):
        draw.polygon([(50, 40), (50, 88), (92, 64)], fill=WHITE)

    def linkedin(draw):
        draw.text((34, 36), 'in', font=font(48), fill=WHITE)

    social('social-facebook.png', (24, 119, 242, 255), facebook)
    social('social-x.png', (23, 32, 51, 255), x_mark)
    social('social-youtube.png', (255, 0, 0, 255), youtube)
    social('social-linkedin.png', (10, 102, 194, 255), linkedin)


def product_fallback():
    image = canvas(200, 200)
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((0, 0, 199, 199), radius=28, fill=(244, 247, 252, 255))
    neck = Image.open(ROOT / 'public' / 'images' / 'neckband-cutout.png').convert('RGBA')
    neck.thumbnail((168, 150), Image.Resampling.LANCZOS)
    paste(image, neck, ((200 - neck.size[0]) // 2, (200 - neck.size[1]) // 2 + 6))
    save(image, 'product-fallback.png')


def glyphs():
    cart_icon = canvas(64, 64)
    draw = ImageDraw.Draw(cart_icon)
    draw.line([(6, 14), (16, 14), (22, 36)], fill=NAVY, width=4)
    draw.polygon([(20, 18), (54, 18), (48, 38), (24, 38)], fill=NAVY)
    draw.ellipse((26, 42, 36, 52), fill=NAVY)
    draw.ellipse((42, 42, 52, 52), fill=NAVY)
    save(cart_icon, 'glyph-cart.png')

    grid_icon = canvas(64, 64)
    draw = ImageDraw.Draw(grid_icon)
    for col, row, color in (
        (6, 6, BLUE), (34, 6, ORANGE), (6, 34, ORANGE), (34, 34, NAVY),
    ):
        draw.rounded_rectangle((col, row, col + 22, row + 22), radius=5, fill=color)
    save(grid_icon, 'glyph-grid.png')


def main():
    bag()
    parcel()
    truck()
    open_box()
    lock()
    envelope()
    sale()
    cart()
    phone()
    check()
    icons()
    glyphs()
    socials()
    product_fallback()
    print(f'Wrote {len(list(OUT.glob("*.png")))} images to {OUT}')


if __name__ == '__main__':
    main()
