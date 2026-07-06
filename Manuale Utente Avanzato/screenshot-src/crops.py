#!/usr/bin/env python3
"""Derive partial-detail figures by cropping the crisp 2x full renders.
Coordinates are in device px of the 2560x1600 dashboard capture."""
import os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SHOTS = os.path.join(HERE, "..", "screenshots")

def crop(src, box, dst):
    im = Image.open(os.path.join(SHOTS, src))
    im.crop(box).save(os.path.join(SHOTS, dst))
    print("  ->", dst, im.crop(box).size)

# (left, top, right, bottom)
crop("03-dashboard-online.png", (0,    0,  592,  980), "12-bot-selector.png")    # bot sidebar
crop("03-dashboard-online.png", (588,  0, 1300,  980), "13-feed-list.png")        # feed cards + badges
crop("03-dashboard-online.png", (1306, 378, 2540, 1132), "14-log-console.png")    # live log panel
print("done")
