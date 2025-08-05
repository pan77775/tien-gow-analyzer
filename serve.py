#!/usr/bin/env python3
"""
簡單的HTTP伺服器，用於本地測試網站
運行: python3 serve.py
"""

import http.server
import socketserver
import webbrowser
import sys
import os
from pathlib import Path

PORT = 8000

class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        super().end_headers()

def main():
    # 確保在正確的目錄
    web_dir = Path(__file__).parent
    os.chdir(web_dir)
    
    print("🌐 天九牌分析工具 - 本地測試伺服器")
    print("=" * 50)
    print(f"📁 服務目錄: {web_dir}")
    print(f"🌍 網站地址: http://localhost:{PORT}")
    print(f"📱 手機測試: http://你的IP:{PORT}")
    print("=" * 50)
    
    # 檢查必要檔案
    required_files = [
        "index.html",
        "styles/main.css", 
        "scripts/tien-gow.js",
        "scripts/ui.js",
        "data/rankings.json"
    ]
    
    missing_files = []
    for file in required_files:
        if not Path(file).exists():
            missing_files.append(file)
    
    if missing_files:
        print("❌ 缺少以下檔案:")
        for file in missing_files:
            print(f"   - {file}")
        print("\n請確保所有檔案都存在後再運行伺服器")
        return
    
    print("✅ 所有必要檔案都存在")
    
    try:
        with socketserver.TCPServer(("", PORT), CORSRequestHandler) as httpd:
            print(f"\n🚀 伺服器已啟動在端口 {PORT}")
            print("\n📋 測試清單:")
            print("  □ 打開瀏覽器訪問網站")
            print("  □ 測試牌型選擇功能")
            print("  □ 測試分析計算功能")
            print("  □ 測試響應式設計（縮小視窗）")
            print("  □ 在手機上測試（可選）")
            
            print(f"\n🌍 正在自動打開瀏覽器...")
            print("   如果沒有自動打開，請手動訪問:")
            print(f"   http://localhost:{PORT}")
            
            try:
                webbrowser.open(f'http://localhost:{PORT}')
            except:
                print("   無法自動打開瀏覽器，請手動打開上述網址")
            
            print(f"\n⏹️  按 Ctrl+C 停止伺服器")
            print("=" * 50)
            
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n\n🛑 伺服器已停止")
        print("👋 感謝使用！")
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ 端口 {PORT} 已被占用")
            print("   請關閉其他使用該端口的程序，或修改 PORT 變數")
        else:
            print(f"❌ 啟動伺服器時發生錯誤: {e}")

if __name__ == "__main__":
    main()