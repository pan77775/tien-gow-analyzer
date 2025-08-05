#!/usr/bin/env python3
"""
快速啟動天九牌分析工具
一鍵啟動本地伺服器並自動打開瀏覽器
"""

import webbrowser
import time
import sys
from serve import main

if __name__ == "__main__":
    print("🚀 啟動天九牌分析工具...")
    print("⏱️  準備就緒，正在打開瀏覽器...")
    
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n✅ 服務已停止")
        print("👋 謝謝使用天九牌分析工具！")
        sys.exit(0)