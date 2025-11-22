# Train Myself 图标生成提示词

## 应用信息
- **应用名称**: Train Myself
- **图标主题**: Doge 在泳池用自由泳姿势弹电吉他速弹

## AI 绘图提示词

### Midjourney 提示词
```
doge dog swimming freestyle in pool playing electric guitar shredding, cartoon style, vibrant colors, app icon, 512x512, simple background, cute, fun, energetic, blue pool water, --ar 1:1 --v 6
```

### DALL-E 3 提示词
```
A cute doge dog doing freestyle swimming in a pool while playing an electric guitar with fast shredding technique, cartoon illustration style, app icon design, vibrant colors, 512x512 pixels, simple clean background, fun and energetic
```

### Stable Diffusion 提示词
```
doge dog, freestyle swimming, pool, electric guitar, shredding, cartoon style, app icon, 512x512, vibrant colors, cute, fun, energetic, blue water, simple background, high quality
```

## 设计要点

1. **主体**: Doge 狗（柴犬风格）
2. **动作**: 自由泳姿势（手臂划水）
3. **道具**: 电吉他（正在速弹）
4. **环境**: 泳池（蓝色水）
5. **风格**: 卡通、可爱、充满活力
6. **尺寸**: 512x512 像素（正方形）
7. **背景**: 简洁，突出主体

## 生成步骤

1. 选择一个 AI 绘图工具（Midjourney、DALL-E、Stable Diffusion 等）
2. 使用上面的提示词生成图标
3. 下载生成的图片
4. 将图片重命名为：
   - `icon-192.png` (192x192)
   - `icon-512.png` (512x512)
5. 放到 `public` 目录
6. 重新构建：`npm run build`

## 在线工具推荐

- **Midjourney**: https://www.midjourney.com
- **DALL-E**: https://openai.com/dall-e-3
- **Stable Diffusion**: https://stablediffusionweb.com
- **Leonardo.ai**: https://leonardo.ai
- **Ideogram**: https://ideogram.ai

## 临时占位图标

如果暂时没有生成图标，可以使用 `public/icon-generator.html` 生成一个简单的占位图标。

