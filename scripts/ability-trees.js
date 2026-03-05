/**
 * 能力树渲染模块 v2.0
 * 三棵树各有独特风格：
 * - 技能树：科技树风格
 * - 知识树：档案馆卡片风格
 * - 记忆树：神经网络径向布局
 */

// ==================== 技能树 - 科技树风格 ====================
function renderSkillTechTree(container, skills) {
    if (!container) return;
    
    const tree = skills.tree;
    const categories = skills.categories;
    
    // 技能名称映射
    const skillNameMap = {
        'daily-reflection-evolution': '自进化',
        'skill-manager': '技能管理',
        'knowledge-base': '知识库',
        'personal-assistant': '助理',
        'find-skills': '发现',
        'meta-execution': '元执行',
        'learn-from-mistakes': '举一反三',
        'neigong-cultivation': '内功修炼',
        'night-task-runner': '夜间任务',
        'web-dev-workflow': '网页流程',
        'promotion-coaching': '晋升辅导',
        'industry-research': '行研',
        'wechat-research': '公众号',
        'research': '调研',
        'apify-trend-analysis': '趋势',
        'apify-market-research': '市场',
        'apify-competitor-intelligence': '竞情',
        'ai-insight': 'AI洞察',
        'pdf': 'PDF',
        'pptx': 'PPT',
        'docx': 'Word',
        'xlsx': 'Excel',
        'canvas-design': '画布',
        'keynote': 'Keynote',
        'ui-ux-pro-max': 'UI专家',
        'frontend-design': '前端',
        'qingshuang-research-style': '清爽',
        'work-report-ppt': '汇报',
        'pixel-action-game': '像素',
        'theme-factory': '主题',
        'web-design-guidelines': '规范',
        'zelda-style': '塞尔达',
        'vercel-react-best-practices': 'React',
        'vercel-react-native-skills': 'RN',
        'vercel-composition-patterns': '组合',
        'remotion-best-practices': '视频',
        'github-deploy-publisher': 'GitHub',
        'yuque-publisher': '语雀',
        'ks-kim-docs-shuttle': 'KIM文档',
        'mcp-builder': 'MCP',
        'stock-analysis': '股票',
        'investment-analyzer': '投资',
        'investment-tracker': '基金',
        'feishu-assistant': '飞书',
        'linke-kim-message': 'KIM消息',
        'ai-column-writer': '专栏'
    };
    
    // 判断技能是否最近使用（3天内）
    function isRecentlyUsed(lastUpdated) {
        if (!lastUpdated) return false;
        const lastDate = new Date(lastUpdated);
        const now = new Date();
        const diffDays = (now - lastDate) / (1000 * 60 * 60 * 24);
        return diffDays <= 3;
    }
    
    // 计算等级进度环的dashoffset
    function getLevelProgress(level, exp) {
        // 环的周长约为 2 * PI * 8 ≈ 50
        const circumference = 50;
        const progress = (exp || (level * 20)) / 100;
        return circumference * (1 - progress);
    }
    
    // 生成单个技能节点HTML
    function createSkillNode(skill, id) {
        const name = skillNameMap[skill.name] || skill.name.substring(0, 4);
        const level = skill.level || 1;
        const exp = skill.exp || (level * 20);
        const dashOffset = getLevelProgress(level, exp);
        const isRecent = isRecentlyUsed(skill.lastUpdated);
        const nodeColor = getLevelColor(level);
        
        // 存储到全局dataMap
        window.AppState.dataMap[id] = {
            name: skill.name,
            icon: '⚡',
            level: level,
            description: skill.description || '暂无描述',
            source: skill.source || '技能库',
            exp: exp,
            lastUpdated: skill.lastUpdated
        };
        
        return `
            <div class="skill-node" 
                 style="--node-color: ${nodeColor};"
                 onmouseenter="showTreeTooltip(event, '${id}', 'skill')"
                 onmouseleave="hideTooltip()">
                ${isRecent ? '<span class="skill-recent-badge"></span>' : ''}
                <div class="skill-level-ring">
                    <svg viewBox="0 0 22 22">
                        <circle class="ring-bg" cx="11" cy="11" r="8"/>
                        <circle class="ring-progress" cx="11" cy="11" r="8" 
                                stroke-dasharray="50" 
                                stroke-dashoffset="${dashOffset}"
                                style="stroke: ${nodeColor};"/>
                    </svg>
                    <span class="skill-level-num" style="color: ${nodeColor};">${level}</span>
                </div>
                <span class="skill-node-name">${name}</span>
            </div>
        `;
    }
    
    // 获取等级对应颜色
    function getLevelColor(level) {
        const colors = {
            1: '#fb923c',  // 橙色 - 初学
            2: '#fbbf24',  // 黄色 - 入门
            3: '#4ade80',  // 绿色 - 熟练
            4: '#38bdf8',  // 蓝色 - 精通
            5: '#a78bfa'   // 紫色 - 大师
        };
        return colors[level] || colors[3];
    }
    
    // 优先使用三层架构tree数据
    if (tree && Object.keys(tree).length > 0) {
        let layerCardsHtml = '';
        let globalIdx = 0;
        
        for (const [layerKey, layerInfo] of Object.entries(tree)) {
            if (!layerInfo.children || Object.keys(layerInfo.children).length === 0) continue;
            
            const layerColor = layerInfo.color || '#4ade80';
            const layerIcon = layerInfo.icon || '📁';
            const layerName = layerInfo.name.replace(/^[🏛️🎯🛠️\s]+/, '').trim();
            const layerId = 'skill-layer-' + globalIdx;
            
            // 存储层级数据
            window.AppState.dataMap[layerId] = {
                name: layerInfo.name,
                icon: layerIcon,
                level: Math.round(layerInfo.avgLevel || 3),
                description: layerInfo.description || layerInfo.name,
                source: '技能分类',
                count: layerInfo.count || 0
            };
            
            // 生成子分类内容
            let categoriesHtml = '';
            for (const [childName, childInfo] of Object.entries(layerInfo.children)) {
                const childIcon = childInfo.icon || '📁';
                const childSkills = childInfo.skills || [];
                
                let skillNodesHtml = '';
                for (const skill of childSkills) {
                    const skillId = 'skill-' + (globalIdx++);
                    skillNodesHtml += createSkillNode(skill, skillId);
                }
                
                categoriesHtml += `
                    <div class="skill-category-group">
                        <div class="skill-category-label">
                            <span class="skill-category-icon">${childIcon}</span>
                            <span>${childName}</span>
                            <span class="skill-category-count">${childInfo.count || 0}</span>
                        </div>
                        <div class="skill-nodes-grid">
                            ${skillNodesHtml}
                        </div>
                    </div>
                `;
            }
            
            layerCardsHtml += `
                <div class="skill-layer-card" style="--layer-color: ${layerColor};">
                    <div class="skill-layer-header" onclick="toggleSkillLayerCard(this)">
                        <span class="skill-layer-icon">${layerIcon}</span>
                        <div class="skill-layer-info">
                            <div class="skill-layer-name">${layerName}</div>
                            <div class="skill-layer-desc">${layerInfo.description || ''}</div>
                        </div>
                        <div class="skill-layer-stats">
                            <span class="skill-layer-count">${layerInfo.count || 0}</span>
                            <span class="skill-layer-level">Avg.Lv${Math.round(layerInfo.avgLevel || 3)}</span>
                        </div>
                        <span class="skill-layer-toggle">▼</span>
                    </div>
                    <div class="skill-layer-content">
                        ${categoriesHtml}
                    </div>
                </div>
            `;
            globalIdx++;
        }
        
        container.innerHTML = `
            <div class="skill-tech-tree">
                <div class="skill-root-node">
                    <span class="skill-root-icon">⚡</span>
                    <span class="skill-root-label">技能</span>
                    <span class="skill-root-count">${skills.total || 0}</span>
                </div>
                <div class="skill-layers-container">
                    ${layerCardsHtml}
                </div>
            </div>
        `;
    } else {
        // 回退：使用扁平categories结构
        renderSkillTechTreeFlat(container, categories, skills.total);
    }
}

// 扁平结构回退渲染
function renderSkillTechTreeFlat(container, categories, total) {
    // ... 简化处理，复用原有逻辑
    container.innerHTML = `
        <div class="skill-tech-tree">
            <div class="skill-root-node">
                <span class="skill-root-icon">⚡</span>
                <span class="skill-root-label">技能</span>
                <span class="skill-root-count">${total || 0}</span>
            </div>
            <div style="text-align: center; padding: 20px; color: var(--text-muted);">
                正在加载技能数据...
            </div>
        </div>
    `;
}

// 层级卡片折叠/展开
function toggleSkillLayerCard(header) {
    const card = header.closest('.skill-layer-card');
    if (card) {
        card.classList.toggle('collapsed');
    }
}

window.toggleSkillLayerCard = toggleSkillLayerCard;

// ==================== 知识树 - 档案馆卡片风格 ====================
function renderKnowledgeArchive(container, knowledge) {
    if (!container) return;
    
    // 知识目录映射
    const knowledgeNameMap = {
        'personal-writings': '个人文章',
        'rd-efficiency': '研发效能',
        'financial': '金融投资',
        'experience': '经验总结',
        'guides': '使用指南',
        'investment': '投资理财',
        'ai-research': 'AI研究',
        'product': '产品思考',
        'mcp-research': 'MCP研究'
    };
    
    const knowledgeIconMap = {
        'personal-writings': '✍️',
        'rd-efficiency': '⚡',
        'financial': '💰',
        'experience': '💡',
        'guides': '📖',
        'ai-research': '🤖',
        'product': '📊',
        'mcp-research': '🔌'
    };
    
    // 获取目录数据
    let directories = [];
    if (knowledge.directories && Array.isArray(knowledge.directories)) {
        directories = knowledge.directories;
    } else if (knowledge.categories) {
        directories = Object.entries(knowledge.categories).map(([key, cat]) => ({
            key: key,
            name: cat.name || key,
            count: cat.fileCount || 0,
            icon: cat.icon || '📁',
            color: cat.color,
            sizeKB: cat.sizeKB || 0,
            description: cat.description
        }));
    }
    
    if (directories.length === 0) {
        container.innerHTML = '<div class="no-data">暂无知识库数据</div>';
        return;
    }
    
    // 计算最大文件数（用于进度条）
    const maxCount = Math.max(...directories.map(d => d.count));
    
    // 生成卡片HTML
    let cardsHtml = '';
    directories.forEach((dir, idx) => {
        const dirKey = dir.key || dir.name;
        const chineseName = knowledgeNameMap[dirKey] || dirKey;
        const dirIcon = knowledgeIconMap[dirKey] || dir.icon || '📁';
        const dirId = 'knowledge-dir-' + idx;
        const progress = maxCount > 0 ? (dir.count / maxCount * 100) : 0;
        
        // 判断是否最近更新（模拟：count > 5 视为活跃）
        const isRecent = dir.count > 5;
        
        // 存储到dataMap
        window.AppState.dataMap[dirId] = {
            name: chineseName,
            icon: dirIcon,
            level: Math.min(5, Math.ceil(dir.count / 10)),
            description: `${chineseName}知识库，共收录${dir.count}个文档${dir.sizeKB ? `，总计${dir.sizeKB}KB` : ''}`,
            source: dir.description || `${chineseName}相关文档`
        };
        
        cardsHtml += `
            <div class="knowledge-folder-card"
                 onmouseenter="showTreeTooltip(event, '${dirId}', 'knowledge')"
                 onmouseleave="hideTooltip()">
                <div class="knowledge-folder-header">
                    <span class="knowledge-folder-icon">${dirIcon}</span>
                    <span class="knowledge-folder-name">${chineseName}</span>
                </div>
                <div class="knowledge-folder-progress">
                    <div class="knowledge-progress-bar">
                        <div class="knowledge-progress-fill" style="width: ${progress}%;"></div>
                    </div>
                    <div class="knowledge-progress-text">
                        <span class="knowledge-folder-count">${dir.count} 文档</span>
                        <span>${dir.sizeKB ? dir.sizeKB + 'KB' : ''}</span>
                    </div>
                </div>
                <div class="knowledge-folder-footer">
                    ${isRecent ? '<span class="knowledge-update-badge recent">🔥 活跃</span>' : ''}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = `
        <div class="knowledge-archive">
            <div class="knowledge-header">
                <span class="knowledge-header-icon">📚</span>
                <div class="knowledge-header-info">
                    <div class="knowledge-header-title">知识库</div>
                    <div class="knowledge-header-desc">涵盖${directories.length}个领域的深度积累</div>
                </div>
                <div>
                    <div class="knowledge-header-count">${knowledge.totalFiles || 0}</div>
                    <div class="knowledge-header-label">总文档数</div>
                </div>
            </div>
            <div class="knowledge-cards-grid">
                ${cardsHtml}
            </div>
        </div>
    `;
}

// ==================== 记忆树 - 神经网络径向布局 + 二级展开 ====================
function renderMemoryNeuralNetwork(container, memories) {
    if (!container) return;
    
    const tree = memories.tree;
    const total = memories.total || 0;
    
    // 层级颜色和标签
    const layerConfig = {
        '👤 用户层': { color: '#38bdf8', label: '用户', icon: '👤' },
        '🧠 能力层': { color: '#a78bfa', label: '能力', icon: '🧠' },
        '🎯 领域技能包': { color: '#8b5cf6', label: '领域技能', icon: '🎯' },
        '🛠️ 领域层': { color: '#4ade80', label: '领域', icon: '🛠️' },
        '📚 项目层': { color: '#fb923c', label: '项目', icon: '📚' }
    };
    
    // 如果没有tree数据，使用简单展示
    if (!tree || Object.keys(tree).length === 0) {
        container.innerHTML = `
            <div class="memory-neural-network">
                <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                    <div style="font-size: 48px; margin-bottom: 10px;">🧠</div>
                    <div>记忆总数：${total}</div>
                </div>
            </div>
        `;
        return;
    }
    
    // 计算布局参数
    const centerX = 250;
    const centerY = 250;
    const radius = 140;
    
    // 过滤有效层级
    const validLayers = Object.entries(tree).filter(([_, info]) => info.count > 0);
    const angleStep = (2 * Math.PI) / validLayers.length;
    
    // 生成连接线和节点
    let connectionsHtml = '';
    let nodesHtml = '';
    let layerDataForExpand = {};
    
    validLayers.forEach(([layerName, layerInfo], idx) => {
        const config = layerConfig[layerName] || { color: '#fb923c', label: layerName, icon: '📁' };
        const angle = angleStep * idx - Math.PI / 2; // 从顶部开始
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        // 节点大小根据记忆数量
        const nodeRadius = Math.min(35, Math.max(22, 18 + layerInfo.count * 0.4));
        
        const nodeId = 'memory-layer-' + idx;
        
        // 存储层级数据供展开使用
        layerDataForExpand[nodeId] = {
            layerName: layerName,
            layerInfo: layerInfo,
            config: config
        };
        
        // 存储到dataMap
        window.AppState.dataMap[nodeId] = {
            name: layerName,
            icon: config.icon,
            level: Math.min(5, Math.ceil(layerInfo.count / 5)),
            description: layerInfo.description || `${config.label}相关记忆，共${layerInfo.count}条`,
            source: '记忆库'
        };
        
        // 连接线
        connectionsHtml += `
            <line class="memory-connection" 
                  x1="${centerX}" y1="${centerY}" 
                  x2="${x}" y2="${y}" 
                  stroke="${config.color}"/>
        `;
        
        // 脉冲效果 - 放在节点后面避免干扰
        if (layerInfo.count >= 5) {
            connectionsHtml += `
                <circle class="memory-pulse-ring" 
                        cx="${x}" cy="${y}" r="${nodeRadius}"
                        stroke="${config.color}"
                        style="animation-delay: ${idx * 0.5}s;"/>
            `;
        }
        
        // 节点 - 点击展开二级
        nodesHtml += `
            <g class="memory-category-node" 
               transform="translate(${x}, ${y})"
               data-node-id="${nodeId}"
               onclick="toggleMemoryLayerExpand('${nodeId}')"
               onmouseenter="showTreeTooltip(event, '${nodeId}', 'memory')"
               onmouseleave="hideTooltip()">
                <circle class="memory-category-circle" 
                        r="${nodeRadius}" 
                        stroke="${config.color}"/>
                <text class="memory-category-icon" y="-3">${config.icon}</text>
                <text class="memory-category-label" y="10">${config.label}</text>
                <text class="memory-category-count" y="22">${layerInfo.count}</text>
            </g>
        `;
    });
    
    // 图例
    let legendHtml = '';
    validLayers.forEach(([layerName, layerInfo]) => {
        const config = layerConfig[layerName] || { color: '#fb923c', label: layerName };
        legendHtml += `
            <div class="memory-legend-item">
                <span class="memory-legend-dot" style="background: ${config.color};"></span>
                <span>${config.label} (${layerInfo.count})</span>
            </div>
        `;
    });
    
    container.innerHTML = `
        <div class="memory-neural-network">
            <div class="memory-network-svg">
                <svg viewBox="0 0 500 500">
                    <defs>
                        <radialGradient id="memoryGradient">
                            <stop offset="0%" stop-color="rgba(251, 146, 60, 0.3)"/>
                            <stop offset="100%" stop-color="rgba(251, 146, 60, 0.1)"/>
                        </radialGradient>
                    </defs>
                    
                    <!-- 连接线和脉冲 -->
                    ${connectionsHtml}
                    
                    <!-- 中心核心节点 -->
                    <circle class="memory-core-node" cx="${centerX}" cy="${centerY}" r="45"/>
                    <text x="${centerX}" y="${centerY - 8}" text-anchor="middle" fill="var(--sheikah-orange)" font-size="24">🧠</text>
                    <text x="${centerX}" y="${centerY + 10}" text-anchor="middle" fill="var(--sheikah-orange-light)" font-size="11" font-weight="600">记忆核心</text>
                    <text x="${centerX}" y="${centerY + 24}" text-anchor="middle" fill="rgba(200,220,240,0.6)" font-size="10">${total} 条</text>
                    
                    <!-- 分类节点 -->
                    ${nodesHtml}
                </svg>
            </div>
            <div class="memory-legend">
                ${legendHtml}
            </div>
            <!-- 展开面板 -->
            <div class="memory-expand-panel" id="memory-expand-panel" style="display: none;">
                <div class="memory-expand-header">
                    <span class="memory-expand-title" id="memory-expand-title">记忆详情</span>
                    <button class="memory-expand-close" onclick="closeMemoryExpand()">✕</button>
                </div>
                <div class="memory-expand-content" id="memory-expand-content">
                </div>
            </div>
        </div>
    `;
    
    // 保存层级数据到全局
    window._memoryLayerData = layerDataForExpand;
}

// 展开记忆层级详情
function toggleMemoryLayerExpand(nodeId) {
    const layerData = window._memoryLayerData?.[nodeId];
    if (!layerData) return;
    
    const panel = document.getElementById('memory-expand-panel');
    const title = document.getElementById('memory-expand-title');
    const content = document.getElementById('memory-expand-content');
    
    if (!panel || !title || !content) return;
    
    const { layerName, layerInfo, config } = layerData;
    
    // 设置标题
    title.innerHTML = `<span style="color: ${config.color};">${config.icon}</span> ${config.label}层记忆 (${layerInfo.count}条)`;
    
    // 生成子分类内容
    let childrenHtml = '';
    const children = layerInfo.children || {};
    
    if (Object.keys(children).length === 0) {
        childrenHtml = '<div class="memory-expand-empty">暂无详细记忆</div>';
    } else {
        for (const [childName, childInfo] of Object.entries(children)) {
            if (childInfo.count === 0) continue;
            
            // 获取具体记忆项
            const items = childInfo.items || [];
            let itemsHtml = '';
            
            items.slice(0, 6).forEach((item, idx) => {
                const itemId = `memory-item-${nodeId}-${idx}`;
                
                // 存储到dataMap
                window.AppState.dataMap[itemId] = {
                    name: item.title || `记忆 #${idx + 1}`,
                    icon: item.icon || '💭',
                    level: item.importance || 3,
                    description: item.description || '暂无描述',
                    source: childName
                };
                
                itemsHtml += `
                    <div class="memory-item-chip" 
                         style="border-color: ${config.color};"
                         onmouseenter="showTreeTooltip(event, '${itemId}', 'memory')"
                         onmouseleave="hideTooltip()">
                        <span class="memory-item-icon">${item.icon || '💭'}</span>
                        <span class="memory-item-title">${(item.title || '记忆').substring(0, 15)}${(item.title?.length > 15) ? '...' : ''}</span>
                    </div>
                `;
            });
            
            if (items.length > 6) {
                itemsHtml += `<div class="memory-item-more">+${items.length - 6}</div>`;
            }
            
            childrenHtml += `
                <div class="memory-child-group">
                    <div class="memory-child-header" style="color: ${config.color};">
                        <span class="memory-child-icon">${childInfo.icon || '📁'}</span>
                        <span class="memory-child-name">${childName}</span>
                        <span class="memory-child-count">${childInfo.count}</span>
                    </div>
                    <div class="memory-child-items">
                        ${itemsHtml}
                    </div>
                </div>
            `;
        }
    }
    
    content.innerHTML = childrenHtml;
    panel.style.display = 'block';
}

// 关闭展开面板
function closeMemoryExpand() {
    const panel = document.getElementById('memory-expand-panel');
    if (panel) {
        panel.style.display = 'none';
    }
}

window.toggleMemoryLayerExpand = toggleMemoryLayerExpand;
window.closeMemoryExpand = closeMemoryExpand;

// ==================== 导出到全局 ====================
window.renderSkillTechTree = renderSkillTechTree;
window.renderKnowledgeArchive = renderKnowledgeArchive;
window.renderMemoryNeuralNetwork = renderMemoryNeuralNetwork;
