#!/usr/bin/env python3
"""
作品截图生成脚本
为每个已部署的项目生成预览截图
"""

import json
import os
import subprocess
import time
from pathlib import Path
from datetime import datetime

# 配置
PROJECT_DATA_FILE = Path(__file__).parent.parent / "projects-data.json"
SCREENSHOTS_DIR = Path(__file__).parent.parent / "screenshots"
OUTPUT_FILE = Path(__file__).parent.parent / "projects-data.json"

def capture_screenshot(url, output_path, width=1200, height=800):
    """使用 screencapture 或 webkit2png 截图"""
    
    # 方法1: 使用 playwright (如果安装了)
    try:
        from playwright.sync_api import sync_playwright
        
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page(viewport={"width": width, "height": height})
            page.goto(url, wait_until="networkidle")
            time.sleep(2)  # 等待动画完成
            page.screenshot(path=str(output_path), full_page=False)
            browser.close()
            return True
    except ImportError:
        pass
    
    # 方法2: 使用 webkit2png (macOS)
    try:
        result = subprocess.run([
            "webkit2png",
            "-W", str(width),
            "-H", str(height),
            "-D", str(output_path.parent),
            "-o", output_path.stem,
            url
        ], capture_output=True, timeout=30)
        if result.returncode == 0:
            return True
    except (subprocess.TimeoutExpired, FileNotFoundError):
        pass
    
    # 方法3: 使用 Chrome headless
    try:
        chrome_paths = [
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            "/Applications/Chromium.app/Contents/MacOS/Chromium"
        ]
        chrome_path = None
        for p in chrome_paths:
            if os.path.exists(p):
                chrome_path = p
                break
        
        if chrome_path:
            result = subprocess.run([
                chrome_path,
                "--headless",
                "--disable-gpu",
                f"--window-size={width},{height}",
                f"--screenshot={output_path}",
                url
            ], capture_output=True, timeout=30)
            if result.returncode == 0 and output_path.exists():
                return True
    except (subprocess.TimeoutExpired, FileNotFoundError):
        pass
    
    return False


def generate_placeholder_screenshot(project_id, output_path):
    """生成占位符截图 SVG"""
    
    # 创建一个简单的 SVG 占位符
    svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e2328"/>
      <stop offset="100%" stop-color="#2d3748"/>
    </linearGradient>
  </defs>
  <rect width="400" height="250" fill="url(#bg)"/>
  <text x="200" y="115" text-anchor="middle" fill="#00d4ff" font-size="16" font-family="Arial">
    {project_id}
  </text>
  <text x="200" y="145" text-anchor="middle" fill="#6e7781" font-size="12" font-family="Arial">
    预览图生成中...
  </text>
  <rect x="140" y="170" width="120" height="30" rx="6" fill="none" stroke="#00d4ff" stroke-width="1" opacity="0.5"/>
  <text x="200" y="190" text-anchor="middle" fill="#00d4ff" font-size="11" font-family="Arial">
    点击查看
  </text>
</svg>'''
    
    svg_path = output_path.with_suffix('.svg')
    with open(svg_path, 'w', encoding='utf-8') as f:
        f.write(svg_content)
    
    return svg_path


def main():
    """主函数"""
    print("=" * 60)
    print("📸 作品截图生成器")
    print("=" * 60)
    
    # 确保截图目录存在
    SCREENSHOTS_DIR.mkdir(exist_ok=True)
    
    # 读取项目数据
    with open(PROJECT_DATA_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    projects = data.get("projects", [])
    updated = False
    
    for project in projects:
        project_id = project.get("id")
        url = project.get("url")
        status = project.get("status")
        
        print(f"\n📁 {project.get('name')} ({project_id})")
        
        # 只处理已部署的项目
        if status != "deployed" or not url:
            print(f"   ⏭️ 跳过 (status={status}, url={url})")
            continue
        
        # 检查是否已有截图
        screenshot_path = SCREENSHOTS_DIR / f"{project_id}.png"
        screenshot_svg = SCREENSHOTS_DIR / f"{project_id}.svg"
        
        if screenshot_path.exists() or screenshot_svg.exists():
            existing = screenshot_path if screenshot_path.exists() else screenshot_svg
            print(f"   ✅ 已有截图: {existing.name}")
            project["screenshot"] = f"screenshots/{existing.name}"
            updated = True
            continue
        
        # 尝试截图
        print(f"   🔗 URL: {url}")
        print(f"   📸 正在截图...")
        
        if capture_screenshot(url, screenshot_path):
            print(f"   ✅ 截图成功: {screenshot_path.name}")
            project["screenshot"] = f"screenshots/{screenshot_path.name}"
            updated = True
        else:
            # 生成占位符
            placeholder = generate_placeholder_screenshot(project_id, screenshot_path)
            print(f"   ⚠️ 截图失败，生成占位符: {placeholder.name}")
            project["screenshot"] = f"screenshots/{placeholder.name}"
            updated = True
    
    # 更新项目数据
    if updated:
        data["generatedAt"] = datetime.now().isoformat()
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"\n✅ projects-data.json 已更新")
    
    print("\n完成!")


if __name__ == "__main__":
    main()
