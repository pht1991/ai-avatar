"""
图标尺寸适配脚本
将 1024×1024 的图标缩放为微信小程序需要的各种尺寸
"""
import os
from PIL import Image

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG_DIR = os.path.join(BASE_DIR, "static", "images")

# 小程序需要的尺寸
SIZES = {
    "小程序头像（必须）": (144, 144),
    "高清备份": (1024, 1024),
    "分享卡片": (500, 400),
}

# 源文件（手动选择哪个作为基础图标）
# 从 icon-app-v1.png, icon-app-v2.png, icon-app-v3.png 中选一个
SOURCE = os.path.join(IMG_DIR, "icon-app-v1.png")

def main():
    if not os.path.exists(SOURCE):
        print(f"源文件不存在: {SOURCE}")
        print(f"可选文件: {os.listdir(IMG_DIR)}")
        return

    img = Image.open(SOURCE).convert("RGBA")

    for name, size in SIZES.items():
        resized = img.resize(size, Image.LANCZOS)
        out_name = f"icon-{size[0]}x{size[1]}.png"
        out_path = os.path.join(IMG_DIR, out_name)
        resized.save(out_path, "PNG", optimize=True)
        print(f"✅ {name}: {out_name} ({size[0]}×{size[1]})")

    # 额外生成圆角版本（可选）
    try:
        img_1024 = Image.open(SOURCE).convert("RGBA")
        mask = Image.new("L", (1024, 1024), 0)
        from PIL import ImageDraw
        draw = ImageDraw.Draw(mask)
        draw.rounded_rectangle([0, 0, 1024, 1024], radius=180, fill=255)
        rounded = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
        rounded.paste(img_1024, (0, 0), mask)
        rounded_path = os.path.join(IMG_DIR, "icon-1024x1024-rounded.png")
        rounded.save(rounded_path, "PNG", optimize=True)
        print(f"✅ 圆角版本: icon-1024x1024-rounded.png")
    except Exception as e:
        print(f"⚠️ 圆角版本生成失败: {e}")

if __name__ == "__main__":
    main()
