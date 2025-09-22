#!/bin/bash

# 项目验证脚本
# 用于检查项目结构和必要文件是否完整

# 检查项目根目录必要文件
check_root_files() {
    echo "检查项目根目录必要文件..."
    
    required_files=("README.md" "app.js" "app.json" "app.wxss" "game.js" "game.json" "project.config.json")
    missing_files=()
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            missing_files+=($file)
        fi
    done
    
    if [ ${#missing_files[@]} -eq 0 ]; then
        echo "✓ 所有根目录必要文件已存在"
    else
        echo "✗ 缺少以下根目录必要文件: ${missing_files[*]}"
        return 1
    fi
}

# 检查页面文件
check_pages() {
    echo "检查页面文件..."
    
    if [ ! -d "pages/index" ]; then
        echo "✗ 页面目录 pages/index 不存在"
        return 1
    fi
    
    required_page_files=("pages/index/index.js" "pages/index/index.wxml" "pages/index/index.wxss")
    missing_page_files=()
    
    for file in "${required_page_files[@]}"; do
        if [ ! -f "$file" ]; then
            missing_page_files+=($file)
        fi
    done
    
    if [ ${#missing_page_files[@]} -eq 0 ]; then
        echo "✓ 所有页面必要文件已存在"
    else
        echo "✗ 缺少以下页面必要文件: ${missing_page_files[*]}"
        return 1
    fi
}

# 检查配置文件内容
check_config() {
    echo "检查配置文件内容..."
    
    # 检查app.json是否包含pages配置
    if ! grep -q "pages" "app.json"; then
        echo "✗ app.json 中缺少 pages 配置"
        return 1
    fi
    
    # 检查project.config.json是否包含appid
    if ! grep -q "appid" "project.config.json"; then
        echo "✗ project.config.json 中缺少 appid 配置"
        return 1
    fi
    
    echo "✓ 配置文件内容检查通过"
    return 0
}

# 检查文件格式（简单检查JSON格式）
check_file_format() {
    echo "检查文件格式..."
    
    json_files=("app.json" "game.json" "project.config.json")
    invalid_files=()
    
    for file in "${json_files[@]}"; do
        if ! python -m json.tool "$file" > /dev/null 2>&1; then
            invalid_files+=($file)
        fi
    done
    
    if [ ${#invalid_files[@]} -eq 0 ]; then
        echo "✓ 所有JSON文件格式正确"
    else
        echo "✗ 以下JSON文件格式错误: ${invalid_files[*]}"
        return 1
    fi
}

# 主函数
main() {
    echo "开始验证俄罗斯方块小程序项目..."
    echo "===================================="
    
    check_root_files || exit 1
    check_pages || exit 1
    check_config || exit 1
    
    # 尝试检查文件格式，如果python不可用则跳过
    if command -v python &> /dev/null; then
        check_file_format || exit 1
    else
        echo "Python 不可用，跳过JSON格式检查"
    fi
    
    echo "===================================="
    echo "🎉 项目验证通过！您的俄罗斯方块小程序项目结构完整。"
    echo "接下来您可以使用微信开发者工具打开项目进行调试和运行。"
}

# 运行主函数
main