# test_siliconflow.py - 测试硅基流动 API 完整流程
import sys
sys.path.insert(0, r'C:\Users\shendushuke\.workbuddy\binaries\python\versions\3.13.12\Lib\site-packages')

import json, base64, io, urllib.request
from PIL import Image

API_KEY = "sk-shndqhnkxutjwsakcgoeaknkimkyvhoebkbxvcyqhdhthoym"
API_BASE = "https://api.siliconflow.cn/v1"

def api_call(endpoint, body):
    """通用 API 调用"""
    url = f"{API_BASE}/{endpoint}"
    data = json.dumps(body).encode()
    req = urllib.request.Request(url, data=data, headers={
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    })
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return json.loads(resp.read()), resp.status
    except urllib.error.HTTPError as e:
        return json.loads(e.read()), e.code

def test_llm():
    """测试1: LLM 文本生成"""
    print("=" * 50)
    print("测试1: LLM 文本生成 (Qwen2.5-7B)")
    body = {
        "model": "Qwen/Qwen2.5-7B-Instruct",
        "messages": [{"role": "user", "content": "一句话描述古风汉服女子肖像"}],
        "max_tokens": 100
    }
    result, code = api_call("chat/completions", body)
    status = "✅ PASS" if code == 200 else "❌ FAIL"
    print(f"{status} (HTTP {code})")
    if code == 200:
        print(f"  模型: {result.get('model', 'N/A')}")
        print(f"  回复: {result['choices'][0]['message']['content'][:80]}...")
        print(f"  Token: {result['usage']['total_tokens']}")
    else:
        print(f"  错误: {result}")
    return code == 200

def test_text_to_image():
    """测试2: 文生图"""
    print("\n" + "=" * 50)
    print("测试2: 文生图 (Qwen/Qwen-Image)")
    body = {
        "model": "Qwen/Qwen-Image",
        "prompt": "portrait of a young woman in elegant Chinese hanfu, ancient palace background, photorealistic, masterpiece",
        "num_images": 1,
        "image_size": "1024x1024"
    }
    result, code = api_call("image/generations", body)
    status = "✅ PASS" if code == 200 else "❌ FAIL"
    print(f"{status} (HTTP {code})")
    if code == 200:
        img_url = result['images'][0]['url'] if 'images' in result else result.get('data', [{}])[0].get('url', 'N/A')
        print(f"  图片URL: {img_url[:80]}...")
        print(f"  推理耗时: {result.get('timings', {}).get('inference', 'N/A')}秒")
    else:
        print(f"  错误: {result}")
    return code == 200

def test_image_edit():
    """测试3: 图片编辑/风格转换 (Qwen/Qwen-Image-Edit)"""
    print("\n" + "=" * 50)
    print("测试3: 图片编辑-风格转换 (Qwen/Qwen-Image-Edit)")
    
    # 创建一个简单的测试图片并转 base64
    img = Image.new('RGB', (512, 512), color=(200, 180, 160))
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    img_b64 = base64.b64encode(buf.getvalue()).decode()
    
    body = {
        "model": "Qwen/Qwen-Image-Edit",
        "prompt": "transform this into an anime style portrait of a person, cel-shaded, expressive eyes, vibrant colors",
        "image": img_b64,
        "num_images": 1,
        "image_size": "1024x1024"
    }
    result, code = api_call("image/generations", body)
    status = "✅ PASS" if code == 200 else "❌ FAIL"
    print(f"{status} (HTTP {code})")
    if code == 200:
        img_url = result['images'][0]['url'] if 'images' in result else result.get('data', [{}])[0].get('url', 'N/A')
        print(f"  图片URL: {img_url[:80]}...")
        print(f"  推理耗时: {result.get('timings', {}).get('inference', 'N/A')}秒")
    else:
        print(f"  错误: {json.dumps(result, ensure_ascii=False)[:300]}")
    return code == 200

def test_model_list():
    """测试0: 列出所有可用模型"""
    print("=" * 50)
    print("测试0: 列出可用图片模型")
    result, code = api_call("models?type=image", {})
    # 使用 GET 请求
    url = f"{API_BASE}/models?type=image"
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {API_KEY}"})
    with urllib.request.urlopen(req) as resp:
        result = json.loads(resp.read())
    status = "✅ PASS" if result.get('data') else "❌ FAIL"
    print(f"{status} - 共 {len(result.get('data', []))} 个图片模型:")
    for m in result.get('data', []):
        print(f"  - {m['id']}")
    return len(result.get('data', [])) > 0

if __name__ == "__main__":
    results = []
    
    # 列出模型
    try:
        results.append(("模型列表", test_model_list()))
    except Exception as e:
        print(f"❌ 模型列表失败: {e}")
        results.append(("模型列表", False))
    
    # LLM
    try:
        results.append(("LLM生成", test_llm()))
    except Exception as e:
        print(f"❌ LLM失败: {e}")
        results.append(("LLM生成", False))
    
    # 文生图
    try:
        results.append(("文生图", test_text_to_image()))
    except Exception as e:
        print(f"❌ 文生图失败: {e}")
        results.append(("文生图", False))
    
    # 图片编辑
    try:
        results.append(("图片编辑", test_image_edit()))
    except Exception as e:
        print(f"❌ 图片编辑失败: {e}")
        results.append(("图片编辑", False))
    
    # 总结
    print("\n" + "=" * 50)
    print("测试总结:")
    all_ok = True
    for name, ok in results:
        print(f"  {'✅' if ok else '❌'} {name}")
        if not ok:
            all_ok = False
    print(f"\n{'🎉 全部通过!' if all_ok else '⚠️ 存在失败项，请检查'}")
