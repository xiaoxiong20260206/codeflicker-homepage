/**
 * 能力树渲染模块 v3.1 — 系统架构图（纵向堆叠布局）
 * Build: 20260308-0640
 * 三棵树各有独特风格：
 * - 技能树：系统架构图风格（三层架构 + 引擎内核 + 连接关系）
 * - 知识树：档案馆卡片风格
 * - 记忆树：神经网络径向布局
 */

// ==================== 技能树 - 系统架构图 ====================
function renderSkillTechTree(container, skills) {
    if (!container) return;
    
    var tree = skills.tree;
    var categories = skills.categories;
    var relationships = skills.relationships || {};
    
    // 技能名称映射
    var skillNameMap = {
        'xiaowuxianggong': '小无相功',
        'daily-reflection-evolution': '每日修炼',
        'learn-from-mistakes': '举一反三',
        'neigong-cultivation': '内功修炼',
        'meta-execution': '元执行',
        'memory-hygiene': '记忆管理',
        'skill-architecture': '技能架构',
        'knowledge-curator': '知识管理',
        'essence-insight': '本质洞察',
        'product-thinking': '产品思维',
        'knowledge-acquisition-meta': '知识习得',
        'knowledge-base': '知识库',
        'find-skills': '技能搜索',
        'skill-manager': '技能管理',
        'night-task-runner': '夜间任务',
        'personal-assistant': '个人助理',
        'industry-research': '行研',
        'wechat-research': '公众号调研',
        'research': '通用调研',
        'apify-trend-analysis': '趋势',
        'apify-market-research': '市场',
        'apify-competitor-intelligence': '竞情',
        'ai-insight': 'AI洞察',
        'pdf': 'PDF', 'pptx': 'PPT', 'docx': 'Word', 'xlsx': 'Excel',
        'canvas-design': '视觉设计', 'keynote': 'Keynote',
        'ui-ux-pro-max': 'UI专家', 'ui-ux-pro-max-skill': 'UI专家',
        'frontend-design': '前端', 'web-dev-workflow': '网页流程',
        'qingshuang-research-style': '清爽', 'work-report-ppt': '汇报',
        'pixel-action-game': '像素', 'theme-factory': '主题',
        'web-design-guidelines': '规范', 'zelda-style': '塞尔达',
        'vercel-react-best-practices': 'React', 'vercel-react-native-skills': 'RN',
        'vercel-composition-patterns': '组合', 'remotion-best-practices': '视频',
        'github-deploy-publisher': 'GitHub', 'yuque-publisher': '语雀',
        'ks-kim-docs-shuttle': 'IM文档', 'mcp-builder': 'MCP',
        'stock-analysis': '股票', 'investment-analyzer': '投资',
        'investment-tracker': '基金',
        'feishu-assistant': '飞书', 'linke-kim-message': 'IM消息',
        'ai-column-writer': '专栏', 'promotion-coaching': '晋升辅导'
    };
    
    function getLevelColor(level) {
        var colors = { 1: '#fb923c', 2: '#fbbf24', 3: '#4ade80', 4: '#38bdf8', 5: '#a78bfa' };
        return colors[level] || '#4ade80';
    }
    
    function getLevelProgress(level, exp) {
        var progress = (exp || (level * 20)) / 100;
        return 50 * (1 - progress);
    }
    
    function isRecentlyUsed(lastUpdated) {
        if (!lastUpdated) return false;
        return (new Date() - new Date(lastUpdated)) / 86400000 <= 3;
    }
    
    var _idx = 0;
    function classifySource(src) {
        if (!src) return { label: '未知', badge: '❓' };
        if (src === '林克核心能力' || src === 'AI核心能力') return { label: '内置技能', badge: '🔧' };
        if (src === '用户自定义') return { label: '自定义', badge: '✏️' };
        if (src.indexOf('技能库') > -1) return { label: '平台技能', badge: '📦' };
        return { label: src, badge: '📍' };
    }
    function storeSkill(skill) {
        var id = 'skill-' + (_idx++);
        var src = classifySource(skill.source);
        window.AppState.dataMap[id] = {
            name: getName(skill), icon: '\u26A1', level: skill.level || 1,
            description: skill.description || '', source: skill.source || '技能库',
            sourceLabel: src.label, sourceBadge: src.badge,
            exp: skill.exp || 0, lastUpdated: skill.lastUpdated,
            callCount: skill.callCount || 0,
            frequency: skill.frequency || '',
            successRate: skill.successRate || 0
        };
        return id;
    }
    function storeGeneric(icon, name, desc, level) {
        var id = 'gen-' + (_idx++);
        window.AppState.dataMap[id] = {
            name: name, icon: icon || '\uD83D\uDD18', level: level || '',
            description: desc || '', source: ''
        };
        return id;
    }
    
    function getName(skill) {
        return skillNameMap[skill.name] || skill.displayName || skill.name.substring(0, 4);
    }
    
    function createEngineNode(skill, role, tier) {
        var id = storeSkill(skill);
        var name = getName(skill);
        var level = skill.level || 1;
        var exp = skill.exp || (level * 20);
        var color = getLevelColor(level);
        var dashOffset = getLevelProgress(level, exp);
        var recent = isRecentlyUsed(skill.lastUpdated);
        var tierClass = tier === 'guide' ? 'engine-node--guide' : tier === 'core' ? 'engine-node--core' : 'engine-node--tool';
        
        return '<div class="engine-node ' + tierClass + '" data-skill="' + skill.name + '" style="--node-color: ' + color + ';" onmouseenter="showTreeTooltip(event, \'' + id + '\', \'skill\')" onmouseleave="hideTooltip()">' +
            (recent ? '<span class="skill-recent-badge"></span>' : '') +
            '<div class="engine-node-ring"><svg viewBox="0 0 22 22" width="22" height="22"><circle class="ring-bg" cx="11" cy="11" r="8"/><circle class="ring-progress" cx="11" cy="11" r="8" stroke-dasharray="50" stroke-dashoffset="' + dashOffset + '" style="stroke:' + color + ';"/></svg><span class="engine-node-level">' + level + '</span></div>' +
            '<div class="engine-node-info"><span class="engine-node-name">' + name + '</span><span class="engine-node-role">' + role + '</span></div></div>';
    }
    
    function getSourceColor(source) {
        if (!source) return 'rgba(200, 220, 240, 0.2)';
        if (source === '林克核心能力' || source === 'AI核心能力') return '#a78bfa';
        if (source === '用户自定义') return '#38bdf8';
        return '#64748b'; // 平台技能库
    }
    
    function createSkillChip(skill) {
        var id = storeSkill(skill);
        var name = getName(skill);
        var level = skill.level || 1;
        var color = getLevelColor(level);
        var sourceColor = getSourceColor(skill.source);
        return '<div class="skill-chip" style="--chip-color:' + color + ';--chip-source-color:' + sourceColor + ';" onmouseenter="showTreeTooltip(event, \'' + id + '\', \'skill\')" onmouseleave="hideTooltip()"><span class="skill-chip-level">' + level + '</span><span class="skill-chip-name">' + name + '</span></div>';
    }
    
    // ========== 渲染 ==========
    if (!tree || Object.keys(tree).length === 0) {
        renderSkillTechTreeFlat(container, categories, skills.total);
        return;
    }
    
    var metaLayer = tree.meta || {};
    var domainLayer = tree.domain_pack || {};
    var execLayer = tree.execution || {};
    var engineRoles = relationships.engine_roles || {};
    var loops = relationships.loops || [];
    
    // 元能力层子分类
    var metaChildren = metaLayer.children || {};
    var engineCat = metaChildren['\uD83D\uDD04 自进化引擎'];
    var cognitiveCat = metaChildren['\uD83E\uDDE0 思维框架'];
    var systemCat = metaChildren['\u2699\uFE0F 工作基座'];
    
    // 引擎技能映射
    var engineSkillMap = {};
    if (engineCat && engineCat.skills) {
        for (var i = 0; i < engineCat.skills.length; i++) {
            engineSkillMap[engineCat.skills[i].name] = engineCat.skills[i];
        }
    }
    
    var guideSkill = engineSkillMap['xiaowuxianggong'];
    var coreSkill = engineSkillMap['daily-reflection-evolution'];
    var reviewSkill = engineSkillMap['learn-from-mistakes'];
    var cultivateSkill = engineSkillMap['neigong-cultivation'];
    var metaExecSkill = engineSkillMap['meta-execution'];
    var toolNames = ['memory-hygiene', 'skill-architecture', 'knowledge-curator'];
    var toolSkills = [];
    for (var t = 0; t < toolNames.length; t++) {
        if (engineSkillMap[toolNames[t]]) toolSkills.push(engineSkillMap[toolNames[t]]);
    }
    
    // === 引擎区域 ===
    var engineHtml = '';
    if (guideSkill && coreSkill) {
        var guideNode = createEngineNode(guideSkill, '进化导航', 'guide');
        var coreNode = createEngineNode(coreSkill, '每日驱动', 'core');
        var reviewNode = reviewSkill ? createEngineNode(reviewSkill, '即时复盘', 'core') : '';
        var cultivateNode = cultivateSkill ? createEngineNode(cultivateSkill, '深度修炼', 'core') : '';
        var metaExecNode = metaExecSkill ? createEngineNode(metaExecSkill, '质量保障', 'core') : '';
        var toolNodes = '';
        for (var ti = 0; ti < toolSkills.length; ti++) {
            var r = engineRoles[toolSkills[ti].name];
            toolNodes += createEngineNode(toolSkills[ti], (r && r.role) || '深度工具', 'tool');
        }
        
        var loopsHtml = '';
        if (loops.length > 0) {
            loopsHtml = '<div class="engine-loops">';
            for (var li = 0; li < loops.length; li++) {
                var l = loops[li];
                var loopId = storeGeneric(l.icon, l.name, l.desc || '', l.level);
                loopsHtml += '<div class="engine-loop-tag" onmouseenter="showTreeTooltip(event, \'' + loopId + '\', \'mechanism\')" onmouseleave="hideTooltip()"><span class="loop-icon">' + l.icon + '</span><span class="loop-name">' + l.name + '</span><span class="loop-level">' + l.level + '</span></div>';
            }
            loopsHtml += '</div>';
        }
        
        engineHtml = '<div class="engine-section">' +
            '<div class="engine-title-bar"><span class="engine-title-icon">\uD83D\uDD04</span><span class="engine-title-text">自进化引擎</span><span class="engine-title-desc">驱动持续进化的完整闭环</span></div>' +
            '<div class="engine-diagram">' +
                '<div class="engine-tier engine-tier--guide">' + guideNode + '</div>' +
                '<div class="engine-connector engine-connector--vertical"><span class="connector-label">导航</span><div class="connector-line"></div></div>' +
                '<div class="engine-tier engine-tier--core">' + coreNode +
                    '<div class="engine-core-branches">' +
                        '<div class="engine-branch"><div class="branch-connector"><span class="branch-label">复盘</span></div>' + reviewNode + '</div>' +
                        '<div class="engine-branch"><div class="branch-connector"><span class="branch-label">修炼</span></div>' + cultivateNode + '</div>' +
                        '<div class="engine-branch"><div class="branch-connector"><span class="branch-label">保障</span></div>' + metaExecNode + '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="engine-feedback-line"><span class="feedback-label">P2 反馈</span></div>' +
                '<div class="engine-tier engine-tier--tools"><div class="engine-tools-connector"><span class="tools-connector-label">基座工具</span></div><div class="engine-tools-grid">' + toolNodes + '</div></div>' +
            '</div>' +
            loopsHtml +
        '</div>';
    }
    
    // === 思维工具（原认知框架）===
    var cognitiveHtml = '';
    if (cognitiveCat && cognitiveCat.skills) {
        var cogNodes = '';
        for (var ci = 0; ci < cognitiveCat.skills.length; ci++) {
            var s = cognitiveCat.skills[ci];
            var cid = storeSkill(s);
            var cname = getName(s);
            var clevel = s.level || 1;
            var ccolor = getLevelColor(clevel);
            var cexp = s.exp || (clevel * 20);
            var cdash = 50 * (1 - cexp / 100);
            cogNodes += '<div class="cognitive-pillar" style="--pillar-color:' + ccolor + ';" onmouseenter="showTreeTooltip(event, \'' + cid + '\', \'skill\')" onmouseleave="hideTooltip()"><div class="cognitive-ring"><svg viewBox="0 0 22 22" width="22" height="22"><circle class="ring-bg" cx="11" cy="11" r="8"/><circle class="ring-progress" cx="11" cy="11" r="8" stroke-dasharray="50" stroke-dashoffset="' + cdash + '" style="stroke:' + ccolor + ';"/></svg><span class="cognitive-level">' + clevel + '</span></div><span class="cognitive-name">' + cname + '</span>' + (s.name === 'product-thinking' ? '<span class="cognitive-badge">内置</span>' : '') + '</div>';
        }
        cognitiveHtml = '<div class="cognitive-section"><div class="cognitive-header"><span class="cognitive-icon">\uD83E\uDDE0</span><span class="cognitive-title">思维框架</span></div><div class="cognitive-pillars">' + cogNodes + '</div><div class="cognitive-note">' + (relationships.cognitive_note || '独立思维能力，贯穿所有任务') + '</div></div>';
    }
    
    // === 做事工具（原系统工具）===
    var systemHtml = '';
    if (systemCat && systemCat.skills) {
        var sysNodes = '';
        for (var si = 0; si < systemCat.skills.length; si++) {
            var ss = systemCat.skills[si];
            var ssid = storeSkill(ss);
            var ssname = getName(ss);
            var sslevel = ss.level || 1;
            var sscolor = getLevelColor(sslevel);
            var ssexp = ss.exp || (sslevel * 20);
            var ssdash = 50 * (1 - ssexp / 100);
            sysNodes += '<div class="cognitive-pillar" style="--pillar-color:' + sscolor + ';" onmouseenter="showTreeTooltip(event, \'' + ssid + '\', \'skill\')" onmouseleave="hideTooltip()"><div class="cognitive-ring"><svg viewBox="0 0 22 22" width="22" height="22"><circle class="ring-bg" cx="11" cy="11" r="8"/><circle class="ring-progress" cx="11" cy="11" r="8" stroke-dasharray="50" stroke-dashoffset="' + ssdash + '" style="stroke:' + sscolor + ';"/></svg><span class="cognitive-level">' + sslevel + '</span></div><span class="cognitive-name">' + ssname + '</span></div>';
        }
        systemHtml = '<div class="system-section"><div class="system-header"><span class="system-icon">\u2699\uFE0F</span><span class="system-title">工作基座</span></div><div class="cognitive-pillars">' + sysNodes + '</div><div class="cognitive-note" style="color:rgba(94, 196, 212, 0.5);">' + (relationships.system_note || '支撑工作运转的基础能力') + '</div></div>';;
    }
    
    function renderLayerTransition(text) {
        return '<div class="layer-transition"><div class="transition-line"></div><span class="transition-label">' + text + '</span><div class="transition-line"></div><div class="transition-arrow">\u25BC</div></div>';
    }
    
    // === 领域技能包 ===
    var domainHtml = '';
    if (domainLayer.children && Object.keys(domainLayer.children).length > 0) {
        var domainCards = '';
        var dEntries = Object.entries(domainLayer.children);
        for (var di = 0; di < dEntries.length; di++) {
            var dName = dEntries[di][0];
            var dInfo = dEntries[di][1];
            var dClean = dName.replace(/^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE0F}\u{200D}]+\s*/gu, '').trim();
            var dChips = '';
            var dSkills = dInfo.skills || [];
            for (var ds = 0; ds < dSkills.length; ds++) { dChips += createSkillChip(dSkills[ds]); }
            var domId = storeGeneric(dInfo.icon || '\uD83C\uDFAF', dClean, (dInfo.description || '') + '\n包含 ' + dSkills.length + ' 个技能', '');
            domainCards += '<div class="domain-card" style="--domain-color:' + (dInfo.color || '#8b5cf6') + ';" onmouseenter="showTreeTooltip(event, \'' + domId + '\', \'skill\')" onmouseleave="hideTooltip()"><div class="domain-card-header"><span class="domain-card-icon">' + (dInfo.icon || '\uD83C\uDFAF') + '</span><span class="domain-card-name">' + dClean + '</span></div><div class="domain-card-desc">' + (dInfo.description || '') + '</div><div class="domain-card-skills">' + dChips + '</div></div>';
        }
        domainHtml = '<div class="domain-layer"><div class="domain-layer-header"><span class="domain-layer-icon">\uD83C\uDFAF</span><span class="domain-layer-title">领域能力层</span><span class="domain-layer-desc">特定领域的完整解决方案</span></div><div class="domain-cards-grid">' + domainCards + '</div></div>';
    }
    
    // === 执行技能层 ===
    var execHtml = '';
    if (execLayer.children && Object.keys(execLayer.children).length > 0) {
        var execGroups = '';
        var eEntries = Object.entries(execLayer.children);
        for (var ei = 0; ei < eEntries.length; ei++) {
            var eName = eEntries[ei][0];
            var eInfo = eEntries[ei][1];
            var eClean = eName.replace(/^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE0F}\u{200D}]+\s*/gu, '').trim();
            var eChips = '';
            var eSkills = eInfo.skills || [];
            for (var es = 0; es < eSkills.length; es++) { eChips += createSkillChip(eSkills[es]); }
            var execId = storeGeneric(eInfo.icon || '\uD83D\uDEE0\uFE0F', eClean, '包含 ' + (eInfo.count || 0) + ' 个技能', '');
            execGroups += '<div class="exec-group" onmouseenter="showTreeTooltip(event, \'' + execId + '\', \'skill\')" onmouseleave="hideTooltip()"><div class="exec-group-header"><span class="exec-group-icon">' + (eInfo.icon || '\uD83D\uDEE0\uFE0F') + '</span><span class="exec-group-name">' + eClean + '</span><span class="exec-group-count">' + (eInfo.count || 0) + '</span></div><div class="exec-group-chips">' + eChips + '</div></div>';
        }
        execHtml = '<div class="exec-layer" id="exec-layer-toggle"><div class="exec-layer-header" onclick="toggleExecLayer()"><span class="exec-layer-icon">\uD83D\uDEE0\uFE0F</span><span class="exec-layer-title">执行技能层</span><span class="exec-layer-desc">做具体事情的工具</span><span class="exec-layer-count">' + (execLayer.count || 0) + '</span><span class="exec-layer-toggle-icon">\u25BC</span></div><div class="exec-layer-content"><div class="exec-groups-grid">' + execGroups + '</div></div></div>';
    }
    
    // ========== 组装 ==========
    container.innerHTML = '<div class="skill-architecture">' +
        '<div class="arch-header"><div class="arch-title"><span class="arch-icon">\u26A1</span><span>技能体系</span></div><div class="arch-stats"><span class="arch-stat">' + (skills.total || 0) + ' 技能</span><span class="arch-stat-sep">\u00B7</span><span class="arch-stat">3 层架构</span><span class="arch-stat-sep">\u00B7</span><span class="arch-stat">4 闭环</span></div></div>' +
        '<div class="meta-layer"><div class="meta-layer-label"><span class="meta-label-icon">\uD83C\uDFDB\uFE0F</span><span class="meta-label-text">元能力层</span><span class="meta-label-desc">决定"我是谁"</span></div><div class="meta-layer-content">' + engineHtml + '<div class="meta-bottom-row">' + cognitiveHtml + systemHtml + '</div></div></div>' +
        renderLayerTransition('元能力驱动领域能力') +
        domainHtml +
        renderLayerTransition('领域调用执行技能') +
        execHtml +
    '</div>';
}

function toggleExecLayer() {
    var el = document.getElementById('exec-layer-toggle');
    if (el) el.classList.toggle('collapsed');
}
window.toggleExecLayer = toggleExecLayer;

function renderSkillTechTreeFlat(container, categories, total) {
    container.innerHTML = '<div class="skill-tech-tree"><div class="skill-root-node"><span class="skill-root-icon">\u26A1</span><span class="skill-root-label">技能</span><span class="skill-root-count">' + (total || 0) + '</span></div><div style="text-align:center;padding:20px;color:var(--text-muted);">正在加载技能数据...</div></div>';
}

function toggleSkillLayerCard(header) {
    var card = header.closest('.skill-layer-card');
    if (card) card.classList.toggle('collapsed');
}
window.toggleSkillLayerCard = toggleSkillLayerCard;

// ==================== 知识树 - 档案馆卡片风格 ====================
function renderKnowledgeArchive(container, knowledge) {
    if (!container) return;
    
    var knowledgeNameMap = {
        'personal-writings': '个人文章', 'rd-efficiency': '研发效能',
        'financial': '金融投资', 'experience': '经验总结',
        'guides': '使用指南', 'investment': '投资理财',
        'ai-research': 'AI研究', 'product': '产品思考', 'mcp-research': 'MCP研究'
    };
    
    var knowledgeIconMap = {
        'personal-writings': '\u270D\uFE0F', 'rd-efficiency': '\u26A1',
        'financial': '\uD83D\uDCB0', 'experience': '\uD83D\uDCA1',
        'guides': '\uD83D\uDCD6', 'ai-research': '\uD83E\uDD16',
        'product': '\uD83D\uDCCA', 'mcp-research': '\uD83D\uDD0C'
    };
    
    var directories = [];
    if (knowledge.directories && Array.isArray(knowledge.directories)) {
        directories = knowledge.directories;
    } else if (knowledge.categories) {
        var catEntries = Object.entries(knowledge.categories);
        for (var i = 0; i < catEntries.length; i++) {
            var key = catEntries[i][0], cat = catEntries[i][1];
            directories.push({ key: key, name: cat.name || key, count: cat.fileCount || 0, icon: cat.icon || '\uD83D\uDCC1', color: cat.color, sizeKB: cat.sizeKB || 0, description: cat.description });
        }
    }
    
    if (directories.length === 0) {
        container.innerHTML = '<div class="no-data">暂无知识库数据</div>';
        return;
    }
    
    var maxCount = 0;
    for (var m = 0; m < directories.length; m++) { if (directories[m].count > maxCount) maxCount = directories[m].count; }
    
    var cardsHtml = '';
    for (var d = 0; d < directories.length; d++) {
        var dir = directories[d];
        var dirKey = dir.key || dir.name;
        var chineseName = knowledgeNameMap[dirKey] || dirKey;
        var dirIcon = knowledgeIconMap[dirKey] || dir.icon || '\uD83D\uDCC1';
        var dirId = 'knowledge-dir-' + d;
        var progress = maxCount > 0 ? (dir.count / maxCount * 100) : 0;
        var isRecent = dir.count > 5;
        
        window.AppState.dataMap[dirId] = {
            name: chineseName, icon: dirIcon, level: Math.min(5, Math.ceil(dir.count / 10)),
            description: chineseName + '知识库，共收录' + dir.count + '个文档' + (dir.sizeKB ? '，总计' + dir.sizeKB + 'KB' : ''),
            source: dir.description || chineseName + '相关文档'
        };
        
        cardsHtml += '<div class="knowledge-folder-card" onmouseenter="showTreeTooltip(event, \'' + dirId + '\', \'knowledge\')" onmouseleave="hideTooltip()"><div class="knowledge-folder-header"><span class="knowledge-folder-icon">' + dirIcon + '</span><span class="knowledge-folder-name">' + chineseName + '</span></div><div class="knowledge-folder-progress"><div class="knowledge-progress-bar"><div class="knowledge-progress-fill" style="width:' + progress + '%;"></div></div><div class="knowledge-progress-text"><span class="knowledge-folder-count">' + dir.count + ' 文档</span><span>' + (dir.sizeKB ? dir.sizeKB + 'KB' : '') + '</span></div></div><div class="knowledge-folder-footer">' + (isRecent ? '<span class="knowledge-update-badge recent">\uD83D\uDD25 活跃</span>' : '') + '</div></div>';
    }
    
    container.innerHTML = '<div class="knowledge-archive"><div class="knowledge-header"><span class="knowledge-header-icon">\uD83D\uDCDA</span><div class="knowledge-header-info"><div class="knowledge-header-title">知识库</div><div class="knowledge-header-desc">涵盖' + directories.length + '个领域的深度积累</div></div><div><div class="knowledge-header-count">' + (knowledge.totalFiles || 0) + '</div><div class="knowledge-header-label">总文档数</div></div></div><div class="knowledge-cards-grid">' + cardsHtml + '</div></div>';
}

// ==================== 记忆树 - 神经网络径向布局 + 二级展开 ====================
function renderMemoryNeuralNetwork(container, memories) {
    if (!container) return;
    
    var tree = memories.tree;
    var total = memories.total || 0;
    
    var layerConfig = {
        '\uD83D\uDC64 用户层': { color: '#38bdf8', label: '用户', icon: '\uD83D\uDC64' },
        '\uD83E\uDDE0 能力层': { color: '#a78bfa', label: '能力', icon: '\uD83E\uDDE0' },
        '\uD83C\uDFAF 领域技能包': { color: '#8b5cf6', label: '领域技能', icon: '\uD83C\uDFAF' },
        '\uD83D\uDEE0\uFE0F 领域层': { color: '#4ade80', label: '领域', icon: '\uD83D\uDEE0\uFE0F' },
        '\uD83D\uDCDA 项目层': { color: '#fb923c', label: '项目', icon: '\uD83D\uDCDA' }
    };
    
    if (!tree || Object.keys(tree).length === 0) {
        container.innerHTML = '<div class="memory-neural-network"><div style="text-align:center;padding:40px;color:var(--text-muted);"><div style="font-size:48px;margin-bottom:10px;">\uD83E\uDDE0</div><div>记忆总数：' + total + '</div></div></div>';
        return;
    }
    
    var centerX = 250, centerY = 250, radius = 140;
    var validLayers = Object.entries(tree).filter(function(e) { return e[1].count > 0; });
    var angleStep = (2 * Math.PI) / validLayers.length;
    
    var connectionsHtml = '', nodesHtml = '';
    var layerDataForExpand = {};
    
    for (var idx = 0; idx < validLayers.length; idx++) {
        var layerName = validLayers[idx][0], layerInfo = validLayers[idx][1];
        var config = layerConfig[layerName] || { color: '#fb923c', label: layerName, icon: '\uD83D\uDCC1' };
        var angle = angleStep * idx - Math.PI / 2;
        var x = centerX + radius * Math.cos(angle);
        var y = centerY + radius * Math.sin(angle);
        var nodeRadius = Math.min(35, Math.max(22, 18 + layerInfo.count * 0.4));
        var nodeId = 'memory-layer-' + idx;
        
        layerDataForExpand[nodeId] = { layerName: layerName, layerInfo: layerInfo, config: config };
        
        window.AppState.dataMap[nodeId] = {
            name: layerName, icon: config.icon,
            level: Math.min(5, Math.ceil(layerInfo.count / 5)),
            description: (layerInfo.description || config.label + '相关记忆') + '，共' + layerInfo.count + '条',
            source: '记忆库'
        };
        
        connectionsHtml += '<line class="memory-connection" x1="' + centerX + '" y1="' + centerY + '" x2="' + x + '" y2="' + y + '" stroke="' + config.color + '"/>';
        
        if (layerInfo.count >= 5) {
            connectionsHtml += '<circle class="memory-pulse-ring" cx="' + x + '" cy="' + y + '" r="' + nodeRadius + '" stroke="' + config.color + '" style="animation-delay:' + (idx * 0.5) + 's;"/>';
        }
        
        nodesHtml += '<g class="memory-category-node" transform="translate(' + x + ',' + y + ')" data-node-id="' + nodeId + '" onclick="toggleMemoryLayerExpand(\'' + nodeId + '\')" onmouseenter="showTreeTooltip(event, \'' + nodeId + '\', \'memory\')" onmouseleave="hideTooltip()"><circle class="memory-category-circle" r="' + nodeRadius + '" stroke="' + config.color + '"/><text class="memory-category-icon" y="-3">' + config.icon + '</text><text class="memory-category-label" y="10">' + config.label + '</text><text class="memory-category-count" y="22">' + layerInfo.count + '</text></g>';
    }
    
    var legendHtml = '';
    for (var lg = 0; lg < validLayers.length; lg++) {
        var lName = validLayers[lg][0], lInfo = validLayers[lg][1];
        var lCfg = layerConfig[lName] || { color: '#fb923c', label: lName };
        legendHtml += '<div class="memory-legend-item"><span class="memory-legend-dot" style="background:' + lCfg.color + ';"></span><span>' + lCfg.label + ' (' + lInfo.count + ')</span></div>';
    }
    
    container.innerHTML = '<div class="memory-neural-network"><div class="memory-network-svg"><svg viewBox="0 0 500 500"><defs><radialGradient id="memoryGradient"><stop offset="0%" stop-color="rgba(251,146,60,0.3)"/><stop offset="100%" stop-color="rgba(251,146,60,0.1)"/></radialGradient></defs>' + connectionsHtml + '<circle class="memory-core-node" cx="' + centerX + '" cy="' + centerY + '" r="45"/><text x="' + centerX + '" y="' + (centerY - 8) + '" text-anchor="middle" fill="var(--sheikah-orange)" font-size="24">\uD83E\uDDE0</text><text x="' + centerX + '" y="' + (centerY + 10) + '" text-anchor="middle" fill="var(--sheikah-orange-light)" font-size="11" font-weight="600">记忆核心</text><text x="' + centerX + '" y="' + (centerY + 24) + '" text-anchor="middle" fill="rgba(200,220,240,0.6)" font-size="10">' + total + ' 条</text>' + nodesHtml + '</svg></div><div class="memory-legend">' + legendHtml + '</div><div class="memory-expand-panel" id="memory-expand-panel" style="display:none;"><div class="memory-expand-header"><span class="memory-expand-title" id="memory-expand-title">记忆详情</span><button class="memory-expand-close" onclick="closeMemoryExpand()">\u2715</button></div><div class="memory-expand-content" id="memory-expand-content"></div></div></div>';
    
    window._memoryLayerData = layerDataForExpand;
}

// 展开记忆层级详情
function toggleMemoryLayerExpand(nodeId) {
    var layerData = window._memoryLayerData && window._memoryLayerData[nodeId];
    if (!layerData) return;
    
    var panel = document.getElementById('memory-expand-panel');
    var title = document.getElementById('memory-expand-title');
    var content = document.getElementById('memory-expand-content');
    if (!panel || !title || !content) return;
    
    var layerName = layerData.layerName;
    var layerInfo = layerData.layerInfo;
    var config = layerData.config;
    
    title.innerHTML = '<span style="color:' + config.color + ';">' + config.icon + '</span> ' + config.label + '层记忆 (' + layerInfo.count + '条)';
    
    var childrenHtml = '';
    var children = layerInfo.children || {};
    var childKeys = Object.keys(children);
    
    if (childKeys.length === 0) {
        childrenHtml = '<div class="memory-expand-empty">暂无详细记忆</div>';
    } else {
        for (var ci = 0; ci < childKeys.length; ci++) {
            var childName = childKeys[ci];
            var childInfo = children[childName];
            if (childInfo.count === 0) continue;
            
            var items = childInfo.items || [];
            var itemsHtml = '';
            var showCount = Math.min(6, items.length);
            
            for (var ii = 0; ii < showCount; ii++) {
                var item = items[ii];
                var itemId = 'memory-item-' + nodeId + '-' + ii;
                window.AppState.dataMap[itemId] = {
                    name: item.title || '记忆 #' + (ii + 1), icon: item.icon || '\uD83D\uDCAD',
                    level: item.importance || 3, description: item.description || '暂无描述', source: childName
                };
                var itemTitle = (item.title || '记忆').substring(0, 15);
                if (item.title && item.title.length > 15) itemTitle += '...';
                itemsHtml += '<div class="memory-item-chip" style="border-color:' + config.color + ';" onmouseenter="showTreeTooltip(event, \'' + itemId + '\', \'memory\')" onmouseleave="hideTooltip()"><span class="memory-item-icon">' + (item.icon || '\uD83D\uDCAD') + '</span><span class="memory-item-title">' + itemTitle + '</span></div>';
            }
            
            if (items.length > 6) {
                itemsHtml += '<div class="memory-item-more">+' + (items.length - 6) + '</div>';
            }
            
            childrenHtml += '<div class="memory-child-group"><div class="memory-child-header" style="color:' + config.color + ';"><span class="memory-child-icon">' + (childInfo.icon || '\uD83D\uDCC1') + '</span><span class="memory-child-name">' + childName + '</span><span class="memory-child-count">' + childInfo.count + '</span></div><div class="memory-child-items">' + itemsHtml + '</div></div>';
        }
    }
    
    content.innerHTML = childrenHtml;
    panel.style.display = 'block';
}

function closeMemoryExpand() {
    var panel = document.getElementById('memory-expand-panel');
    if (panel) panel.style.display = 'none';
}

window.toggleMemoryLayerExpand = toggleMemoryLayerExpand;
window.closeMemoryExpand = closeMemoryExpand;

// ==================== 导出到全局 ====================
window.renderSkillTechTree = renderSkillTechTree;
window.renderKnowledgeArchive = renderKnowledgeArchive;
window.renderMemoryNeuralNetwork = renderMemoryNeuralNetwork;
