import os
import math
import shutil
from PIL import Image, ImageDraw, ImageFont

ROOT = r"c:\Users\koejo\Documents\Workstation 2.6"
ANSALON_SRC = os.path.join(ROOT, "Sources", "extracted", "images_inspect", "nexus_ansalon_map.png")
ASSETS_SRC_DIR = os.path.join(ROOT, "campaigns", "Krynn_War_of_the_Lance", "compiler", "assets_src")
os.makedirs(ASSETS_SRC_DIR, exist_ok=True)


def get_font(size, bold=False):
    candidates = [
        "C:\\Windows\\Fonts\\georgiab.ttf" if bold else "C:\\Windows\\Fonts\\georgia.ttf",
        "C:\\Windows\\Fonts\\timesbd.ttf" if bold else "C:\\Windows\\Fonts\\times.ttf",
        "C:\\Windows\\Fonts\\arialbd.ttf" if bold else "C:\\Windows\\Fonts\\arial.ttf",
    ]
    for c in candidates:
        if os.path.exists(c):
            try:
                return ImageFont.truetype(c, size)
            except Exception:
                pass
    return ImageFont.load_default()


def draw_compass_and_frame(draw, w, h, title, subtitle, accent_rgb, border_rgb):
    # Subtle tactical grid (50ft squares)
    for gx in range(60, w - 60, 60):
        draw.line([(gx, 50), (gx, h - 50)], fill=(border_rgb[0], border_rgb[1], border_rgb[2], 28), width=1)
    for gy in range(50, h - 50, 60):
        draw.line([(60, gy), (w - 60, gy)], fill=(border_rgb[0], border_rgb[1], border_rgb[2], 28), width=1)

    # Outer double border
    draw.rectangle([18, 18, w - 18, h - 18], outline=border_rgb, width=3)
    draw.rectangle([26, 26, w - 26, h - 26], outline=accent_rgb, width=1)

    # Corner ornaments
    for cx, cy in [(26, 26), (w - 26, 26), (26, h - 26), (w - 26, h - 26)]:
        draw.ellipse([cx - 8, cy - 8, cx + 8, cy + 8], fill=accent_rgb, outline=border_rgb, width=2)

    # Top Title Cartouche (wide enough for all titles)
    cart_w, cart_h = 740, 58
    cx0 = (w - cart_w) // 2
    cy0 = 24
    draw.rectangle([cx0, cy0, cx0 + cart_w, cy0 + cart_h], fill=(15, 23, 42, 235), outline=border_rgb, width=2)
    draw.rectangle([cx0 + 4, cy0 + 4, cx0 + cart_w - 4, cy0 + cart_h - 4], outline=accent_rgb, width=1)

    f_title = get_font(19, bold=True)
    f_sub = get_font(12, bold=False)
    tb = draw.textbbox((0, 0), title, font=f_title)
    tw = tb[2] - tb[0]
    draw.text((w // 2 - tw // 2, cy0 + 9), title, fill=border_rgb, font=f_title)

    sb = draw.textbbox((0, 0), subtitle, font=f_sub)
    sw = sb[2] - sb[0]
    draw.text((w // 2 - sw // 2, cy0 + 35), subtitle, fill=(203, 213, 225), font=f_sub)

    # Compass Rose in bottom-right
    rx, ry, r = w - 95, h - 95, 38
    draw.ellipse([rx - r, ry - r, rx + r, ry + r], fill=(15, 23, 42, 210), outline=border_rgb, width=2)
    draw.ellipse([rx - r + 6, ry - r + 6, rx + r - 6, ry + r - 6], outline=accent_rgb, width=1)
    pts_n = [(rx, ry - r - 8), (rx - 7, ry), (rx + 7, ry)]
    pts_s = [(rx, ry + r + 8), (rx - 7, ry), (rx + 7, ry)]
    pts_w = [(rx - r - 8, ry), (rx, ry - 7), (rx, ry + 7)]
    pts_e = [(rx + r + 8, ry), (rx, ry - 7), (rx, ry + 7)]
    draw.polygon(pts_n, fill=border_rgb)
    draw.polygon(pts_s, fill=accent_rgb)
    draw.polygon(pts_w, fill=accent_rgb)
    draw.polygon(pts_e, fill=accent_rgb)
    f_comp = get_font(11, bold=True)
    draw.text((rx - 4, ry - r - 22), "N", fill=border_rgb, font=f_comp)

    # Scale bar in bottom-left
    sx, sy = 55, h - 58
    draw.rectangle([sx, sy, sx + 160, sy + 8], fill=(30, 41, 59), outline=border_rgb, width=1)
    draw.rectangle([sx, sy, sx + 80, sy + 8], fill=accent_rgb, outline=border_rgb, width=1)
    draw.text((sx, sy - 16), "Tactical Scale: 1 Grid = 50 ft", fill=(203, 213, 225), font=f_sub)


def draw_zone_pad(draw, x, y, radius, code, fill_rgba, stroke_rgb, shape="circle"):
    if shape == "rect":
        draw.rectangle([x - radius, y - int(radius * 0.72), x + radius, y + int(radius * 0.72)], fill=fill_rgba, outline=stroke_rgb, width=2)
        draw.rectangle([x - radius + 7, y - int(radius * 0.72) + 7, x + radius - 7, y + int(radius * 0.72) - 7], outline=(stroke_rgb[0], stroke_rgb[1], stroke_rgb[2], 110), width=1)
    elif shape == "octagon":
        pts = []
        for i in range(8):
            ang = math.pi / 8 + i * (math.pi / 4)
            pts.append((x + radius * math.cos(ang), y + radius * math.sin(ang)))
        draw.polygon(pts, fill=fill_rgba, outline=stroke_rgb, width=2)
    else:
        draw.ellipse([x - radius, y - radius, x + radius, y + radius], fill=fill_rgba, outline=stroke_rgb, width=2)
        draw.ellipse([x - radius + 8, y - radius + 8, x + radius - 8, y + radius - 8], outline=(stroke_rgb[0], stroke_rgb[1], stroke_rgb[2], 110), width=1)

    # Subtle architectural zone tag in upper-left corner of the chamber so it never collides with node pill/label
    f_code = get_font(10, bold=True)
    draw.text((x - radius + 12, y - int(radius * 0.62)), code, fill=(stroke_rgb[0], stroke_rgb[1], stroke_rgb[2], 160), font=f_code)


def draw_corridor_path(draw, p1, p2, color_rgba, width=20):
    draw.line([p1, p2], fill=color_rgba, width=width)
    draw.line([p1, p2], fill=(226, 232, 240, 85), width=2)


# Coordinates strictly synchronized with buildAllSubmaps() in data_maps.js
SUBMAP_SPECS = [
    {
        "id": "map_sub_solace_inn",
        "title": "SOLACE: VALLENWOOD CANOPY & INN OF THE LAST HOME",
        "subtitle": "Elevated Rope Walkways, Giant Autumn Vallenwood Boughs & Crystalmir Boat Trail",
        "bg": (22, 38, 28),
        "accent": (180, 83, 9),
        "border": (245, 158, 11),
        "features": "vallenwood_canopy",
        "zones": [
            (250, 260, 95, "ZONE I", "circle"),
            (600, 260, 105, "ZONE II", "octagon"),
            (950, 260, 95, "ZONE III", "rect"),
            (600, 560, 95, "ZONE IV", "circle"),
        ],
        "paths": [(0, 1), (1, 2), (0, 3), (2, 3)],
    },
    {
        "id": "map_sub_wayreth_tower",
        "title": "TOWER OF HIGH SORCERY AT WAYRETH",
        "subtitle": "Shifting Sylvan Threshold, Conclave Mirror Hall & The Soulforge Crucible (346 AC)",
        "bg": (24, 18, 43),
        "accent": (124, 58, 237),
        "border": (196, 181, 253),
        "features": "arcane_tower",
        "zones": [
            (250, 260, 95, "THRESHOLD", "circle"),
            (600, 260, 105, "CONCLAVE HALL", "octagon"),
            (950, 260, 95, "THREE AXIOMS", "octagon"),
            (600, 560, 100, "SOUL-MIRROR", "octagon"),
        ],
        "paths": [(0, 1), (1, 2), (1, 3), (2, 3)],
    },
    {
        "id": "map_sub_hopes_end_siege",
        "title": "HOPE'S END: EASTWILDE VALLEY SIEGE & DRAGON VAULTS",
        "subtitle": "Mercenary Siege Lines, Vitrified Ramparts, Bakaris's Keep & Silver Clutch Vault (347 AC)",
        "bg": (43, 23, 20),
        "accent": (185, 28, 28),
        "border": (252, 165, 165),
        "features": "besieged_valley",
        "zones": [
            (250, 260, 95, "SIEGE LINES", "rect"),
            (600, 260, 100, "EAST GATE", "octagon"),
            (950, 260, 95, "BAKARIS KEEP", "rect"),
            (600, 560, 100, "SILVER VAULT", "octagon"),
        ],
        "paths": [(0, 1), (1, 2), (1, 3), (2, 3)],
    },
    {
        "id": "map_sub_xak_tsaroth",
        "title": "SUNKEN RUINS OF XAK TSAROTH",
        "subtitle": "Swamp Causeway, Temple of Mishakal, Great Lift Chain & Drowned Lair of Khisanth",
        "bg": (18, 36, 32),
        "accent": (16, 185, 129),
        "border": (110, 231, 183),
        "features": "sunken_ruins",
        "zones": [
            (240, 240, 90, "CAUSEWAY", "circle"),
            (600, 240, 95, "SHRINE", "rect"),
            (960, 240, 90, "LIFT CHAIN", "octagon"),
            (400, 560, 95, "AGHAR COURT", "rect"),
            (800, 560, 105, "KHISANTH LAIR", "octagon"),
        ],
        "paths": [(0, 1), (1, 2), (2, 3), (2, 4), (3, 4)],
    },
    {
        "id": "map_sub_sla_mori",
        "title": "THE SLA-MORI: SECRET ROYAL CRYPTS",
        "subtitle": "Camouflaged Kharolis Portal, Hall of the Silent Kings & The Great Bronze Chain",
        "bg": (17, 36, 48),
        "accent": (14, 165, 233),
        "border": (125, 211, 252),
        "features": "elven_tunnel",
        "zones": [
            (250, 400, 100, "WEST PORTAL", "circle"),
            (600, 400, 110, "SILENT KINGS", "octagon"),
            (950, 400, 100, "GREAT CHAIN", "octagon"),
        ],
        "paths": [(0, 1), (1, 2)],
    },
    {
        "id": "map_sub_pax_tharkas",
        "title": "FORTRESS OF PAX THARKAS (KHAROLIS PASS)",
        "subtitle": "Curtain Wall & Gate Winch, Flamestrike's Nursery Tower, Iron Mines & Verminaard's Sanctum",
        "bg": (38, 26, 22),
        "accent": (217, 119, 6),
        "border": (253, 186, 116),
        "features": "mountain_fortress",
        "zones": [
            (340, 250, 100, "GATE WINCH", "rect"),
            (860, 250, 100, "UPPER NURSERY", "octagon"),
            (340, 550, 100, "IRON MINES", "circle"),
            (860, 550, 105, "HIGHLORD HALL", "octagon"),
        ],
        "paths": [(0, 1), (0, 2), (1, 3), (2, 3)],
    },
    {
        "id": "map_sub_derkin_skullcap",
        "title": "SKULLCAP RUINS & DERKIN'S TOMB",
        "subtitle": "Vitrified Green-Glass Crater, Shadow-Guardian Causeway & Vault of the Helm of Grallen",
        "bg": (35, 28, 38),
        "accent": (168, 85, 247),
        "border": (216, 180, 254),
        "features": "skullcap_crater",
        "zones": [
            (250, 400, 100, "GLASS CRATER", "circle"),
            (600, 400, 110, "SHADOW CAUSEWAY", "octagon"),
            (950, 400, 100, "HELM VAULT", "octagon"),
        ],
        "paths": [(0, 1), (1, 2)],
    },
    {
        "id": "map_sub_tarsis_square",
        "title": "TARSIS THE BEAUTIFUL: LANDLOCKED DUST-PORT",
        "subtitle": "Dry-Rotted Harbor Hulls, Market Courthouse, Red Dragon Inn & Rooftop Griffon Aerie",
        "bg": (45, 36, 22),
        "accent": (202, 138, 4),
        "border": (253, 224, 71),
        "features": "dust_port",
        "zones": [
            (250, 260, 95, "DRY HARBOR", "rect"),
            (600, 260, 105, "MARKET SQUARE", "octagon"),
            (950, 260, 95, "RED DRAGON INN", "rect"),
            (600, 560, 100, "GRIFFON AERIE", "circle"),
        ],
        "paths": [(0, 1), (1, 2), (1, 3), (2, 3)],
    },
    {
        "id": "map_sub_icewall_castle",
        "title": "ICEWALL CASTLE: GLACIAL CITADEL OF FEAL-THAS",
        "subtitle": "Walrus-Tusk Ice Tunnels, Courtyard of Sleet & The Crystal Spire Pedestal",
        "bg": (15, 34, 52),
        "accent": (56, 189, 248),
        "border": (186, 230, 253),
        "features": "glacier_castle",
        "zones": [
            (250, 400, 100, "ICE TUNNELS", "circle"),
            (600, 400, 110, "SLEET'S COURT", "rect"),
            (950, 400, 100, "ORB PEDESTAL", "octagon"),
        ],
        "paths": [(0, 1), (1, 2)],
    },
    {
        "id": "map_sub_silvanesti_dream",
        "title": "SILVANESTI: LORAC'S NIGHTMARE TOWER",
        "subtitle": "Bleeding Grove of Hallucinations, Twisted Spire of the Stars & Cyan Bloodbane's Throne",
        "bg": (14, 38, 26),
        "accent": (34, 197, 94),
        "border": (134, 239, 172),
        "features": "nightmare_forest",
        "zones": [
            (250, 400, 100, "BLEEDING GROVE", "circle"),
            (600, 400, 110, "SPIRE OF STARS", "octagon"),
            (950, 400, 100, "LORAC'S THRONE", "octagon"),
        ],
        "paths": [(0, 1), (1, 2)],
    },
    {
        "id": "map_sub_high_clerist_tower",
        "title": "THE HIGH CLERIST'S TOWER (WESTGATE PASS)",
        "subtitle": "West Gate Field, Symmetrical Dragon-Trap Corridors, Western Parapet & Dragon Orb Vault",
        "bg": (26, 34, 48),
        "accent": (59, 130, 246),
        "border": (147, 197, 253),
        "features": "clerist_tower",
        "zones": [
            (250, 260, 95, "WEST FIELD", "rect"),
            (600, 260, 105, "DRAGON-TRAP", "octagon"),
            (950, 260, 95, "SUNLIT PARAPET", "rect"),
            (600, 560, 100, "ORB VAULT", "octagon"),
        ],
        "paths": [(0, 1), (1, 2), (1, 3)],
    },
    {
        "id": "map_sub_neraka_temple",
        "title": "NERAKA: THE WARPED TEMPLE OF DARKNESS",
        "subtitle": "Highlord Pavilions, Great Council Amphitheater, Torture Dungeons & Foundation Stone Crypt",
        "bg": (32, 16, 28),
        "accent": (225, 29, 72),
        "border": (253, 164, 175),
        "features": "neraka_temple",
        "zones": [
            (250, 260, 95, "ENCAMPMENT", "rect"),
            (600, 260, 105, "COUNCIL HALL", "octagon"),
            (950, 260, 95, "DUNGEONS", "rect"),
            (600, 560, 105, "FOUNDATION STONE", "octagon"),
        ],
        "paths": [(0, 1), (1, 2), (1, 3), (2, 3)],
    },
]


def draw_thematic_backdrop(draw, w, h, feat, accent, border):
    if feat == "vallenwood_canopy":
        draw.polygon([(0, h - 185), (w, h - 145), (w, h), (0, h)], fill=(14, 65, 94, 165))
        for cx, cy, r in [(250, 260, 155), (600, 260, 180), (950, 260, 155)]:
            draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(42, 68, 34, 145), outline=(180, 83, 9, 165), width=3)
    elif feat == "arcane_tower":
        draw.ellipse([280, 110, 920, 690], outline=(139, 92, 246, 95), width=2)
        draw.ellipse([360, 180, 840, 620], outline=(196, 181, 253, 95), width=2)
    elif feat == "besieged_valley":
        draw.polygon([(0, 0), (w, 0), (w, 135), (0, 155)], fill=(68, 34, 28, 180))
        draw.polygon([(0, h - 125), (w, h - 150), (w, h), (0, h)], fill=(68, 34, 28, 180))
    elif feat == "sunken_ruins":
        draw.ellipse([260, 130, 1020, 690], fill=(10, 24, 22, 190), outline=(16, 185, 129, 110), width=3)
    elif feat == "mountain_fortress" or feat == "clerist_tower":
        draw.polygon([(0, 0), (w, 0), (w, 125), (0, 125)], fill=(51, 65, 85, 180))
        draw.polygon([(0, h - 125), (w, h - 125), (w, h), (0, h)], fill=(51, 65, 85, 180))
        draw.rectangle([200, 125, 1000, h - 125], fill=(30, 41, 59, 145), outline=border, width=2)
    elif feat == "glacier_castle":
        draw.polygon([(90, 120), (1110, 120), (1050, 680), (150, 680)], fill=(12, 74, 110, 135), outline=(125, 211, 252, 145), width=2)
    elif feat == "neraka_temple":
        draw.ellipse([150, 110, 1050, 690], fill=(48, 16, 28, 165), outline=(225, 29, 72, 130), width=3)
        draw.polygon([(600, 120), (1040, 390), (600, 680), (160, 390)], fill=(24, 10, 20, 185), outline=border, width=2)
    else:
        draw.rectangle([110, 120, w - 110, h - 120], fill=(15, 23, 42, 115), outline=(border[0], border[1], border[2], 85), width=2)


def build_all_assets():
    im_ans = Image.open(ANSALON_SRC).convert("RGB")
    ans_dest = os.path.join(ASSETS_SRC_DIR, "map_ansalon_continent_bg.jpg")
    im_ans.save(ans_dest, "JPEG", quality=85, optimize=True)
    print(f"[OK] Generated {ans_dest} ({os.path.getsize(ans_dest)} bytes)")

    w, h = 1200, 800
    for spec in SUBMAP_SPECS:
        base = Image.new("RGBA", (w, h), (*spec["bg"], 255))
        draw = ImageDraw.Draw(base, "RGBA")

        draw_thematic_backdrop(draw, w, h, spec["features"], spec["accent"], spec["border"])

        zones = spec["zones"]
        for u_idx, v_idx in spec["paths"]:
            if u_idx < len(zones) and v_idx < len(zones):
                p1 = (zones[u_idx][0], zones[u_idx][1])
                p2 = (zones[v_idx][0], zones[v_idx][1])
                draw_corridor_path(draw, p1, p2, (*spec["accent"], 115), width=20)

        for zx, zy, zr, zcode, zshape in zones:
            draw_zone_pad(
                draw,
                zx,
                zy,
                zr,
                zcode,
                (15, 23, 42, 210),
                spec["border"],
                shape=zshape,
            )

        draw_compass_and_frame(draw, w, h, spec["title"], spec["subtitle"], spec["accent"], spec["border"])

        out_path = os.path.join(ASSETS_SRC_DIR, f"{spec['id']}_bg.jpg")
        base.convert("RGB").save(out_path, "JPEG", quality=84, optimize=True)
        print(f"[OK] Generated {out_path} ({os.path.getsize(out_path)} bytes)")

    editions = [
        "Krynn_V1_Heroes_of_the_Lance",
        "Krynn_V2_Shadows_of_the_Lance",
        "Krynn_V3_Five_Book_Odyssey",
    ]
    for ed in editions:
        ed_assets = os.path.join(ROOT, "campaigns", ed, "assets")
        os.makedirs(ed_assets, exist_ok=True)
        for fname in os.listdir(ASSETS_SRC_DIR):
            if fname.endswith(".jpg") or fname.endswith(".png"):
                shutil.copy2(os.path.join(ASSETS_SRC_DIR, fname), os.path.join(ed_assets, fname))
        print(f"[OK] Synced 13 map background assets -> campaigns/{ed}/assets/")


if __name__ == "__main__":
    build_all_assets()
