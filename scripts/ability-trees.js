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

// ==================== 知识树 - 纵向三层架构图（v3.0） ====================
function renderKnowledgeArchive(container, knowledge) {
    if (!container) return;
    
    var layerDef = [
        { tag: 'L1-meta', icon: '\uD83D\uDCD6', label: '\u57fa\u5ea7\u77e5\u8bc6\u5c42', color: '#a78bfa', border: 'rgba(167,139,250,0.25)', bg: 'rgba(167,139,250,0.06)', desc: '\u652f\u6491\u5143\u80fd\u529b\u7684\u601d\u60f3\u548c\u65b9\u6cd5\u8bba', align: '\u2194 \u5143\u80fd\u529b\u5c42 \u00b7 \u5143\u8ba4\u77e5\u5c42' },
        { tag: 'L2-domain', icon: '\uD83D\uDD0D', label: '\u9886\u57df\u77e5\u8bc6\u5c42', color: '#8b5cf6', border: 'rgba(139,92,246,0.25)', bg: 'rgba(139,92,246,0.06)', desc: '\u7279\u5b9a\u9886\u57df\u7684\u6df1\u5ea6\u7814\u7a76\u548c\u77e5\u8bc6\u6c89\u6dc0', align: '\u2194 \u9886\u57df\u80fd\u529b\u5c42 \u00b7 \u9886\u57df\u8bb0\u5fc6\u5c42' },
        { tag: 'L3-execution', icon: '\uD83D\uDCE6', label: '\u5b9e\u8df5\u77e5\u8bc6\u5c42', color: '#4ade80', border: 'rgba(74,222,128,0.25)', bg: 'rgba(74,222,128,0.06)', desc: '\u5177\u4f53\u6267\u884c\u4e2d\u4ea7\u51fa\u7684\u65b9\u6848\u548c\u6587\u6863', align: '\u2194 \u6267\u884c\u6280\u80fd\u5c42 \u00b7 \u5b9e\u8df5\u8bb0\u5fc6\u5c42' }
    ];
    
    // Build per-layer category lists from tree or flat categories
    var layerCats = {};
    layerDef.forEach(function(l){ layerCats[l.tag] = []; });
    
    var src = (knowledge.tree && Object.keys(knowledge.tree).length > 0) ? 'tree' : 'flat';
    if (src === 'tree') {
        Object.keys(knowledge.tree).forEach(function(layerName) {
            var li = knowledge.tree[layerName];
            var tag = li.layerTag || 'L3-execution';
            var cats = li.categories || {};
            Object.keys(cats).forEach(function(k) { var c = cats[k]; c._key = k; if (!layerCats[tag]) layerCats[tag] = []; layerCats[tag].push(c); });
        });
    } else if (knowledge.categories) {
        Object.keys(knowledge.categories).forEach(function(k) { var c = knowledge.categories[k]; c._key = k; var t = c.layerTag || 'L3-execution'; if (!layerCats[t]) layerCats[t] = []; layerCats[t].push(c); });
    }
    
    var totalFiles = knowledge.totalFiles || 0;
    var totalCats = 0;
    layerDef.forEach(function(l){ totalCats += layerCats[l.tag].length; });
    
    if (totalCats === 0) { container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);">\uD83D\uDCDA \u6682\u65e0\u77e5\u8bc6\u5e93\u6570\u636e</div>'; return; }
    
    // Header
    var html = '<div class="knowledge-arch"><div class="arch-header"><div class="arch-title"><span class="arch-icon">\uD83D\uDCDA</span>\u77e5\u8bc6\u5e93 \u00b7 \u4e09\u5c42\u67b6\u6784</div><div class="arch-stats"><span>' + totalCats + ' \u9886\u57df</span><span class="arch-stat-sep">\u00b7</span><span>' + totalFiles + ' \u6587\u6863</span></div></div>';
    
    var maxCount = 1;
    layerDef.forEach(function(l){ layerCats[l.tag].forEach(function(c){ if ((c.fileCount||0) > maxCount) maxCount = c.fileCount||0; }); });
    
    // Render each layer
    for (var li = 0; li < layerDef.length; li++) {
        var ld = layerDef[li];
        var cats = layerCats[ld.tag];
        if (cats.length === 0) continue;
        
        var layerFiles = 0;
        cats.forEach(function(c){ layerFiles += c.fileCount || 0; });
        
        html += '<div class="kn-layer" style="border-color:' + ld.border + ';background:linear-gradient(180deg,' + ld.bg + ',' + ld.bg.replace('0.06','0.02') + ');">';
        html += '<div class="kn-layer-label" style="border-bottom-color:' + ld.border + ';"><span class="kn-label-icon">' + ld.icon + '</span><span class="kn-label-text" style="color:' + ld.color + ';">' + ld.label + '</span><span class="kn-label-desc">' + ld.desc + '</span><span class="kn-label-align">' + ld.align + '</span><span class="kn-label-count" style="color:' + ld.color + ';">' + layerFiles + ' \u6587\u6863</span></div>';
        html += '<div class="kn-layer-content"><div class="kn-cards-grid">';
        
        for (var ci = 0; ci < cats.length; ci++) {
            var cat = cats[ci];
            var name = cat.displayName || cat.name || cat._key || '?';
            var icon = cat.icon || '\uD83D\uDCC1';
            var count = cat.fileCount || 0;
            var size = cat.sizeKB || 0;
            var heat = cat.heatLevel || 1;
            var skills = cat.relatedSkills || [];
            var progress = (count / maxCount * 100);
            var cardId = 'kn-' + ld.tag + '-' + ci;
            
            // 指标数据
            var relatedTotal = skills.length + (cat.relatedMemories || []).length;
            var heatLabels = ['', '\u4f4e', '\u4f4e', '\u4e2d', '\u9ad8', '\u6781\u9ad8'];
            
            window.AppState.dataMap[cardId] = { name: name, icon: icon, level: Math.min(5, Math.ceil(count / 10)), description: (cat.description || name) + '\n\u6587\u6863\u6570: ' + count + (size ? ' | \u5927\u5c0f: ' + size + 'KB' : '') + (skills.length ? '\n\u5173\u8054\u6280\u80fd: ' + skills.join(', ') : '') + ((cat.relatedMemories || []).length ? '\n\u5173\u8054\u8bb0\u5fc6: ' + (cat.relatedMemories || []).join(', ') : ''), source: ld.label, callCount: count, frequency: heatLabels[Math.min(5, heat)] || '\u4f4e', successRate: relatedTotal > 0 ? '\u26A1' + skills.length + ' \uD83E\uDDE0' + (cat.relatedMemories || []).length : '0' };
            
            // Heat dots
            var heatHtml = '';
            for (var h = 0; h < 5; h++) { heatHtml += '<span class="kn-heat-dot' + (h < heat ? ' active' : '') + '" style="' + (h < heat ? 'background:' + ld.color + ';' : '') + '"></span>'; }
            
            // Related skills tags
            var tagsHtml = '';
            if (skills.length > 0) {
                tagsHtml = '<div class="kn-card-tags">';
                var showSkills = skills.slice(0, 3);
                for (var si = 0; si < showSkills.length; si++) { tagsHtml += '<span class="kn-skill-tag" style="border-color:' + ld.border + ';color:' + ld.color + ';">\u26A1 ' + showSkills[si] + '</span>'; }
                if (skills.length > 3) tagsHtml += '<span class="kn-skill-tag-more">+' + (skills.length - 3) + '</span>';
                tagsHtml += '</div>';
            }
            
            html += '<div class="kn-domain-card" style="--kn-color:' + ld.color + ';border-color:' + ld.border + ';" onmouseenter="showTreeTooltip(event,\'' + cardId + '\',\'knowledge\')" onmouseleave="hideTooltip()">';
            html += '<div class="kn-card-header"><span class="kn-card-icon">' + icon + '</span><div class="kn-card-info"><div class="kn-card-name">' + name + '</div><div class="kn-card-meta"><span class="kn-card-count" style="color:' + ld.color + ';">' + count + '</span> \u6587\u6863' + (size ? ' \u00b7 ' + size + 'KB' : '') + '</div></div><div class="kn-card-heat">' + heatHtml + '</div></div>';
            html += '<div class="kn-card-progress"><div class="kn-progress-fill" style="width:' + progress + '%;background:' + ld.color + ';"></div></div>';
            html += tagsHtml;
            html += '</div>';
        }
        
        html += '</div></div></div>';
        
        // Layer transition
        if (li < layerDef.length - 1) {
            var nextCats = layerCats[layerDef[li+1].tag];
            if (nextCats && nextCats.length > 0) {
                var transLabels = ['\u601d\u60f3\u6c89\u6dc0 \u2192 \u9886\u57df\u6df1\u5316', '\u9886\u57df\u77e5\u8bc6 \u2192 \u5b9e\u8df5\u6307\u5bfc'];
                html += '<div class="layer-transition"><div class="transition-line"></div><div class="transition-label">' + transLabels[li] + '</div><div class="transition-arrow">\u25BC</div></div>';
            }
        }
    }
    
    html += '</div>';
    container.innerHTML = html;
}

// ==================== 记忆树 - 纵向三层架构图（v3.0） ====================
function renderMemoryNeuralNetwork(container, memories) {
    if (!container) return;
    
    var tree = memories.tree;
    var total = memories.total || 0;
    
    var layerDef = [
        { key: '\uD83E\uDDE0 \u5143\u8ba4\u77e5\u5c42', icon: '\uD83E\uDDE0', label: '\u5143\u8ba4\u77e5\u5c42', color: '#a78bfa', border: 'rgba(167,139,250,0.25)', bg: 'rgba(167,139,250,0.06)', desc: '\u7528\u6237\u8eab\u4efd\u3001\u601d\u7ef4\u80fd\u529b\u3001\u5de5\u4f5c\u6a21\u5f0f', align: '\u2194 \u5143\u80fd\u529b\u5c42 \u00b7 \u57fa\u5ea7\u77e5\u8bc6\u5c42' },
        { key: '\uD83C\uDFAF \u9886\u57df\u8bb0\u5fc6\u5c42', icon: '\uD83C\uDFAF', label: '\u9886\u57df\u8bb0\u5fc6\u5c42', color: '#8b5cf6', border: 'rgba(139,92,246,0.25)', bg: 'rgba(139,92,246,0.06)', desc: '\u7279\u5b9a\u9886\u57df\u7684\u5b8c\u6574\u7ecf\u9a8c\u6c89\u6dc0', align: '\u2194 \u9886\u57df\u80fd\u529b\u5c42 \u00b7 \u9886\u57df\u77e5\u8bc6\u5c42' },
        { key: '\uD83D\uDEE0\uFE0F \u5b9e\u8df5\u8bb0\u5fc6\u5c42', icon: '\uD83D\uDEE0\uFE0F', label: '\u5b9e\u8df5\u8bb0\u5fc6\u5c42', color: '#4ade80', border: 'rgba(74,222,128,0.25)', bg: 'rgba(74,222,128,0.06)', desc: '\u5177\u4f53\u9886\u57df\u7684\u8e29\u5751\u7ecf\u9a8c\u548c\u9879\u76ee\u77e5\u8bc6', align: '\u2194 \u6267\u884c\u6280\u80fd\u5c42 \u00b7 \u5b9e\u8df5\u77e5\u8bc6\u5c42' }
    ];
    
    if (!tree || Object.keys(tree).length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);"><div style="font-size:48px;margin-bottom:10px;">\uD83E\uDDE0</div><div>\u8bb0\u5fc6\u603b\u6570\uff1a' + total + '</div></div>';
        return;
    }
    
    var html = '<div class="memory-arch"><div class="arch-header"><div class="arch-title"><span class="arch-icon">\uD83E\uDDE0</span>\u8bb0\u5fc6\u5e93 \u00b7 \u4e09\u5c42\u67b6\u6784</div><div class="arch-stats"><span>' + total + ' \u6761\u8bb0\u5fc6</span><span class="arch-stat-sep">\u00b7</span><span>3 \u5c42\u67b6\u6784</span></div></div>';
    
    for (var li = 0; li < layerDef.length; li++) {
        var ld = layerDef[li];
        var layerInfo = tree[ld.key];
        if (!layerInfo || layerInfo.count === 0) continue;
        
        html += '<div class="mem-layer" style="border-color:' + ld.border + ';background:linear-gradient(180deg,' + ld.bg + ',' + ld.bg.replace('0.06','0.02') + ');">';
        html += '<div class="mem-layer-label" style="border-bottom-color:' + ld.border + ';"><span class="mem-label-icon">' + ld.icon + '</span><span class="mem-label-text" style="color:' + ld.color + ';">' + ld.label + '</span><span class="mem-label-desc">' + ld.desc + '</span><span class="mem-label-align">' + ld.align + '</span><span class="mem-label-count" style="color:' + ld.color + ';">' + layerInfo.count + ' \u6761</span></div>';
        html += '<div class="mem-layer-content">';
        
        var children = layerInfo.children || {};
        var childKeys = Object.keys(children);
        
        html += '<div class="mem-cards-grid">';
        for (var ci = 0; ci < childKeys.length; ci++) {
            var childName = childKeys[ci];
            var child = children[childName];
            if (child.count === 0) continue;
            
            var cIcon = child.icon || '\uD83D\uDCC1';
            var cColor = child.color || ld.color;
            var cardId = 'mem-' + li + '-' + ci;
            var nodeId = 'mem-expand-' + li + '-' + ci;
            
            window.AppState.dataMap[cardId] = { name: childName, icon: cIcon, level: Math.min(5, Math.ceil(child.count / 5)), description: (child.description || childName) + '\n\u8bb0\u5fc6\u6570: ' + child.count, source: ld.label, callCount: child.count, frequency: child.count >= 10 ? '\u9ad8' : child.count >= 5 ? '\u4e2d' : '\u4f4e', successRate: child.count >= 10 ? '\u2605\u2605\u2605' : child.count >= 5 ? '\u2605\u2605' : '\u2605' };
            
            html += '<div class="mem-category-card" style="--mem-cat-color:' + cColor + ';border-color:' + ld.border + ';" onclick="toggleMemCategoryExpand(\'' + nodeId + '\')" onmouseenter="showTreeTooltip(event,\'' + cardId + '\',\'memory\')" onmouseleave="hideTooltip()">';
            html += '<div class="mem-cat-header"><span class="mem-cat-icon">' + cIcon + '</span><span class="mem-cat-name">' + childName + '</span><span class="mem-cat-count" style="color:' + cColor + ';">' + child.count + '</span><span class="mem-cat-toggle">\u25B6</span></div>';
            
            // Inline expandable items
            var items = child.items || [];
            if (items.length > 0) {
                html += '<div class="mem-cat-items" id="' + nodeId + '" style="display:none;">';
                var showCount = Math.min(8, items.length);
                for (var ii = 0; ii < showCount; ii++) {
                    var item = items[ii];
                    var itemId = 'mem-item-' + li + '-' + ci + '-' + ii;
                    var title = (item.title || '\u8bb0\u5fc6').substring(0, 18);
                    if (item.title && item.title.length > 18) title += '...';
                    window.AppState.dataMap[itemId] = { name: item.title || '\u8bb0\u5fc6', icon: item.icon || '\uD83D\uDCAD', level: item.importance || 3, description: item.description || '\u6682\u65e0\u63cf\u8ff0', source: childName, callCount: 1, frequency: item.importance >= 4 ? '\u9ad8' : item.importance >= 2 ? '\u4e2d' : '\u4f4e', successRate: item.importance >= 4 ? '\u2605\u2605\u2605' : item.importance >= 2 ? '\u2605\u2605' : '\u2605' };
                    html += '<div class="mem-item-chip" style="border-color:rgba(' + (cColor === '#38bdf8' ? '56,189,248' : cColor === '#a78bfa' ? '167,139,250' : cColor === '#dc2626' ? '220,38,38' : '200,220,240') + ',0.3);" onmouseenter="showTreeTooltip(event,\'' + itemId + '\',\'memory\')" onmouseleave="hideTooltip()"><span class="mem-item-icon">' + (item.icon || '\uD83D\uDCAD') + '</span><span class="mem-item-title">' + title + '</span></div>';
                }
                if (items.length > 8) html += '<div class="mem-item-more">+' + (items.length - 8) + ' \u6761</div>';
                html += '</div>';
            }
            
            html += '</div>';
        }
        html += '</div></div></div>';
        
        // Layer transition
        if (li < layerDef.length - 1) {
            var nextLayer = tree[layerDef[li+1].key];
            if (nextLayer && nextLayer.count > 0) {
                var transLabels = ['\u8ba4\u77e5\u6c89\u6dc0 \u2192 \u9886\u57df\u4e13\u7cbe', '\u9886\u57df\u7ecf\u9a8c \u2192 \u5b9e\u8df5\u6307\u5bfc'];
                html += '<div class="layer-transition"><div class="transition-line"></div><div class="transition-label">' + transLabels[li] + '</div><div class="transition-arrow">\u25BC</div></div>';
            }
        }
    }
    
    html += '</div>';
    container.innerHTML = html;
}

// Toggle memory category expand
function toggleMemCategoryExpand(nodeId) {
    var el = document.getElementById(nodeId);
    if (!el) return;
    var card = el.closest('.mem-category-card');
    var toggle = card ? card.querySelector('.mem-cat-toggle') : null;
    if (el.style.display === 'none') {
        el.style.display = 'flex';
        if (toggle) toggle.textContent = '\u25BC';
        if (card) card.classList.add('expanded');
    } else {
        el.style.display = 'none';
        if (toggle) toggle.textContent = '\u25B6';
        if (card) card.classList.remove('expanded');
    }
}
window.toggleMemCategoryExpand = toggleMemCategoryExpand;

// ==================== 导出到全局 ====================
window.renderSkillTechTree = renderSkillTechTree;
window.renderKnowledgeArchive = renderKnowledgeArchive;
window.renderMemoryNeuralNetwork = renderMemoryNeuralNetwork;
