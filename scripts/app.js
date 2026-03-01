/**
 * 添棋统一单页面 - 主应用脚本
 * TIANQI Unified Single Page Application
 */

// ==================== 全局状态 ====================
const AppState = {
    characterData: null,
    reportsData: null,
    projectsData: null,
    currentSection: 'daily',
    currentSkillCategory: 'all',
    currentProjectCategory: 'all',
    dataMap: {},
    sidebarStats: {}
};

// 暴露到全局以便调试和inline事件处理
window.AppState = AppState;

// ==================== DOM 元素引用 ====================
const DOM = {
    tooltip: null,
    sections: {},
    navTabs: null
};

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', () => {
    initDOM();
    initNavigation();
    loadAllData();
});

function initDOM() {
    DOM.tooltip = document.getElementById('tooltip');
    DOM.navTabs = document.querySelectorAll('.nav-tab');
    
    // 缓存所有section
    document.querySelectorAll('.content-section').forEach(section => {
        DOM.sections[section.id.replace('section-', '')] = section;
    });
}

function initNavigation() {
    DOM.navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const section = tab.dataset.section;
            switchSection(section);
        });
    });
}

function switchSection(sectionName) {
    // 更新导航状态
    DOM.navTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.section === sectionName);
    });
    
    // 更新内容区域
    Object.keys(DOM.sections).forEach(key => {
        DOM.sections[key].classList.toggle('active', key === sectionName);
    });
    
    AppState.currentSection = sectionName;
}

// ==================== 数据加载 ====================
async function loadAllData() {
    try {
        // 尝试多种路径以兼容不同部署环境
        const basePaths = ['../', './', '/'];
        let characterRes, reportsRes, projectsRes;
        
        for (const base of basePaths) {
            try {
                [characterRes, reportsRes, projectsRes] = await Promise.all([
                    fetch(base + 'character-data.json'),
                    fetch(base + 'reports-data.json'),
                    fetch(base + 'projects-data.json')
                ]);
                
                if (characterRes.ok && reportsRes.ok && projectsRes.ok) {
                    break;
                }
            } catch (err) {
                continue;
            }
        }
        
        if (!characterRes || !characterRes.ok) {
            throw new Error('Failed to load character data');
        }
        
        AppState.characterData = await characterRes.json();
        AppState.reportsData = await reportsRes.json();
        AppState.projectsData = await projectsRes.json();
        
        renderAll();
    } catch (e) {
        console.error('Failed to load data:', e);
        document.querySelectorAll('.loading').forEach(el => {
            el.textContent = '❌ 数据加载失败';
        });
    }
}

function renderAll() {
    renderSidebar();
    renderDailyReport();
    renderReportsHistory();
    renderSkillTree();
    renderProjects();
    renderAbout();
    renderCharts();
}

// ==================== 侧边栏渲染 ====================
function renderSidebar() {
    const char = AppState.characterData.character;
    const skills = AppState.characterData.skills;
    const knowledge = AppState.characterData.knowledge;
    const memories = AppState.characterData.memories;
    const projects = AppState.projectsData;
    
    // 等级
    document.getElementById('hero-level').textContent = 'LV.' + char.level;
    
    // 核心数据
    document.getElementById('stat-skills').textContent = skills.total;
    document.getElementById('stat-knowledge').textContent = knowledge.totalFiles;
    document.getElementById('stat-memory').textContent = memories.total;
    document.getElementById('stat-projects').textContent = projects.summary.total;
    
    // 存储侧边栏数据供气泡使用
    AppState.sidebarStats = {
        skills: {
            name: 'SKILLS',
            icon: '⚡',
            value: skills.total,
            description: `共掌握 ${skills.total} 项技能，涵盖 ${Object.keys(skills.categories).length} 个领域。`,
            details: Object.entries(skills.categories).map(([name, cat]) => `${cat.icon} ${name}: ${cat.count}个`).join('\n')
        },
        knowledge: {
            name: 'KNOWLEDGE',
            icon: '📚',
            value: knowledge.totalFiles,
            description: `知识库共 ${knowledge.totalFiles} 篇文档，覆盖 ${Object.keys(knowledge.categories).length} 个知识领域。`,
            details: Object.entries(knowledge.categories).slice(0, 5).map(([name, cat]) => `${cat.icon} ${cat.name}: ${cat.fileCount}篇`).join('\n')
        },
        memory: {
            name: 'MEMORY',
            icon: '🧠',
            value: memories.total,
            description: `记忆库存储 ${memories.total} 条核心记忆，包含用户偏好、项目经验等。`,
            details: Object.entries(memories.byCategory || {}).slice(0, 5).map(([cat, info]) => `${info.icon} ${info.label}: ${info.count}条`).join('\n')
        },
        projects: {
            name: 'PROJECTS',
            icon: '📁',
            value: projects.summary.total,
            description: `项目作品集共 ${projects.summary.total} 个项目，已部署 ${projects.summary.deployed} 个。`,
            details: `✅ 已部署: ${projects.summary.deployed}\n🔧 开发中: ${projects.summary.inDevelopment}\n📦 已归档: ${projects.summary.archived}`
        }
    };
    
    // 更新时间
    document.getElementById('last-update').textContent = AppState.characterData.generatedAt.split('T')[0];
    
    // 迷你成就
    renderMiniAchievements();
}

// 侧边栏stat气泡
function showStatTooltip(event, statType) {
    const stat = AppState.sidebarStats[statType];
    if (!stat) return;
    
    const tooltip = DOM.tooltip;
    
    tooltip.querySelector('.tip-icon').textContent = stat.icon;
    tooltip.querySelector('.tip-name').textContent = stat.name;
    tooltip.querySelector('.tip-type').textContent = '统计数据';
    tooltip.querySelector('.tip-lv-num').textContent = stat.value;
    tooltip.querySelector('.tip-lv-max').textContent = '';
    tooltip.querySelector('.tip-desc').textContent = stat.description;
    
    const sourceEl = tooltip.querySelector('.tip-source');
    const sourceSection = tooltip.querySelector('.tip-source-section');
    if (stat.details) {
        sourceEl.textContent = stat.details;
        sourceEl.style.whiteSpace = 'pre-line';
        sourceSection.style.display = 'block';
        tooltip.querySelector('.tip-source-section .tip-section-title').textContent = '📊 详情';
    } else {
        sourceSection.style.display = 'none';
    }
    
    // 隐藏进度条
    tooltip.querySelector('.tip-progress').style.display = 'none';
    tooltip.querySelector('.tip-progress-text').style.display = 'none';
    
    // 定位
    const rect = event.currentTarget.getBoundingClientRect();
    let left = rect.right + 15;
    let top = rect.top;
    
    if (left + 280 > window.innerWidth) left = rect.left - 280 - 15;
    if (top + 200 > window.innerHeight) top = window.innerHeight - 200 - 20;
    if (top < 20) top = 20;
    if (left < 20) left = 20;
    
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
    tooltip.classList.add('visible');
}

window.showStatTooltip = showStatTooltip;

function renderMiniAchievements() {
    const achievements = AppState.characterData.achievements;
    const container = document.getElementById('achievements-mini');
    
    const unlocked = achievements.filter(a => a.unlocked).slice(0, 8);
    container.innerHTML = unlocked.map(a => `
        <div class="ach-mini-item" title="${a.name}: ${a.desc}">
            ${a.icon}
        </div>
    `).join('');
}

// ==================== 今日日报 ====================
function renderDailyReport() {
    const reports = AppState.reportsData.reports;
    if (reports.length === 0) return;
    
    const today = reports[0];
    
    // 日期
    document.getElementById('today-date').textContent = today.date + ' (' + today.dayOfWeek + ')';
    
    // 概览数据
    document.getElementById('daily-projects').textContent = today.activeProjects;
    document.getElementById('daily-commits').textContent = today.totalCommits;
    document.getElementById('daily-conversations').textContent = today.conversationCount;
    
    // 趋势判断
    const trendText = getTrendText(today);
    document.getElementById('daily-trend').textContent = trendText;
    
    // 亮点
    const highlightsContainer = document.getElementById('today-highlights');
    highlightsContainer.innerHTML = (today.highlights || []).map(h => `
        <span class="highlight-item">✓ ${h}</span>
    `).join('');
    
    // 能力数据
    document.getElementById('cap-skill-current').textContent = today.skillCount;
    document.getElementById('cap-knowledge-current').textContent = today.knowledgeCount;
    document.getElementById('cap-memory-current').textContent = today.memoryCount;
    
    // 能力变化
    updateCapChange('cap-skill-change', today.skillChange);
    updateCapChange('cap-knowledge-change', today.knowledgeChange);
    updateCapChange('cap-memory-change', today.memoryChange);
    
    // 日报iframe
    document.getElementById('daily-iframe').src = today.htmlUrl;
    document.getElementById('view-full-daily').href = today.htmlUrl;
}

function getTrendText(report) {
    const total = report.skillChange + report.knowledgeChange + report.memoryChange;
    if (total > 5) return '🚀 高速成长';
    if (total > 0) return '📈 稳步提升';
    return '— 稳定运行';
}

function updateCapChange(elementId, change) {
    const el = document.getElementById(elementId);
    if (change > 0) {
        el.textContent = '+' + change;
        el.className = 'cap-change positive';
    } else if (change < 0) {
        el.textContent = change.toString();
        el.className = 'cap-change negative';
    } else {
        el.textContent = '-';
        el.className = 'cap-change neutral';
    }
}

// ==================== 历史日报 ====================
function renderReportsHistory() {
    const reports = AppState.reportsData.reports;
    const container = document.getElementById('reports-timeline');
    
    container.innerHTML = reports.map(r => {
        const skillChange = formatChange(r.skillChange);
        const knowledgeChange = formatChange(r.knowledgeChange);
        const memoryChange = formatChange(r.memoryChange);
        
        const highlights = (r.highlights || []).map(h => `
            <span class="report-highlight-tag">✓ ${h}</span>
        `).join('');
        
        return `
            <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="report-card">
                    <div class="report-header">
                        <div>
                            <span class="report-date">${r.date}</span>
                            <span class="report-day">${r.dayOfWeek}</span>
                        </div>
                        <div class="report-stats">
                            <div class="report-stat">
                                <div class="report-stat-num">${r.activeProjects}</div>
                                <div class="report-stat-lbl">项目</div>
                            </div>
                            <div class="report-stat">
                                <div class="report-stat-num">${r.totalCommits}</div>
                                <div class="report-stat-lbl">提交</div>
                            </div>
                            <div class="report-stat">
                                <div class="report-stat-num">${r.conversationCount}</div>
                                <div class="report-stat-lbl">对话</div>
                            </div>
                        </div>
                    </div>
                    <div class="report-body">
                        <div class="report-caps">
                            <div class="report-cap skill">
                                <div class="report-cap-value">${r.skillCount}</div>
                                <div class="report-cap-change ${skillChange.class}">${skillChange.text}</div>
                                <div class="report-cap-label">技能</div>
                            </div>
                            <div class="report-cap knowledge">
                                <div class="report-cap-value">${r.knowledgeCount}</div>
                                <div class="report-cap-change ${knowledgeChange.class}">${knowledgeChange.text}</div>
                                <div class="report-cap-label">知识</div>
                            </div>
                            <div class="report-cap memory">
                                <div class="report-cap-value">${r.memoryCount}</div>
                                <div class="report-cap-change ${memoryChange.class}">${memoryChange.text}</div>
                                <div class="report-cap-label">记忆</div>
                            </div>
                        </div>
                        ${highlights ? `<div class="report-highlights">${highlights}</div>` : ''}
                    </div>
                    <div class="report-footer">
                        <a href="${r.htmlUrl}" target="_blank" class="view-report-btn">📄 查看详情</a>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function formatChange(change) {
    if (change > 0) return { text: '+' + change, class: 'up' };
    if (change < 0) return { text: change.toString(), class: 'down' };
    return { text: '-', class: 'none' };
}

// ==================== 技能树 ====================
function renderSkillTree() {
    const skills = AppState.characterData.skills;
    const knowledge = AppState.characterData.knowledge;
    const memories = AppState.characterData.memories;
    
    // 统计数据
    document.getElementById('skill-total').textContent = skills.total;
    document.getElementById('knowledge-total').textContent = knowledge.totalFiles;
    document.getElementById('memory-total').textContent = memories.total;
    
    // 渲染技能树形结构
    renderSkillTreeGraph(skills);
    
    // 渲染知识库树形结构
    renderKnowledgeTreeGraph(knowledge);
    
    // 渲染记忆库树形结构
    renderMemoryTreeGraph(memories);
}

function getLevelClass(level) {
    if (level <= 1) return 'lv1';
    if (level <= 2) return 'lv2';
    if (level <= 3) return 'lv3';
    if (level <= 4) return 'lv4';
    return 'lv5';
}

function renderSkillTreeGraph(skills) {
    const container = document.getElementById('skill-tree');
    let idx = 0;
    let branches = '';
    
    for (const [catName, cat] of Object.entries(skills.categories)) {
        const avgLv = Math.round(cat.avgLevel || 3);
        const catId = 'skill-cat-' + idx;
        AppState.dataMap[catId] = { 
            name: catName, 
            icon: cat.icon, 
            level: avgLv, 
            description: `${catName}类技能，共${cat.count}个。平均等级Lv.${avgLv}`,
            source: '技能分类'
        };
        
        let leaves = '';
        for (const s of cat.skills) {
            const sid = 'skill-' + (idx++);
            AppState.dataMap[sid] = { ...s, icon: '⚡', catIcon: cat.icon };
            leaves += `
                <div class="leaf-node ${getLevelClass(s.level)}" 
                     style="border-color: var(--node-color); color: var(--node-color);"
                     onmouseenter="showTreeTooltip(event, '${sid}', 'skill')" onmouseleave="hideTooltip()">
                    <span class="leaf-icon">⚡</span>
                    <span class="leaf-level" style="border-color: var(--node-color);">${s.level}</span>
                </div>
            `;
        }
        
        branches += `
            <div class="branch" style="color: ${cat.color || 'var(--green)'};">
                <div class="category-node ${getLevelClass(avgLv)}" 
                     style="border-color: ${cat.color || 'var(--green)'}; color: ${cat.color || 'var(--green)'};"
                     onmouseenter="showTreeTooltip(event, '${catId}', 'skill')" onmouseleave="hideTooltip()">
                    <span class="cat-icon">${cat.icon}</span>
                    <span class="cat-name">${catName}</span>
                    <span class="cat-level" style="border-color: ${cat.color || 'var(--green)'};">${avgLv}</span>
                    <span class="cat-count" style="border-color: ${cat.color || 'var(--green)'};">${cat.count}</span>
                </div>
                <div class="leaves" style="color: ${cat.color || 'var(--green)'};">
                    ${leaves}
                </div>
            </div>
        `;
    }
    
    container.innerHTML = `
        <div class="tree-graph">
            <div class="tree-root" style="color: var(--green);">
                <div class="root-node" style="border-color: var(--green); color: var(--green);">
                    <span class="node-icon">⚡</span>
                    <span class="node-level" style="border-color: var(--green);">SKILLS</span>
                </div>
                <div class="root-line" style="color: var(--green);"></div>
                <div class="branches">${branches}</div>
            </div>
        </div>
    `;
}

function renderKnowledgeTreeGraph(knowledge) {
    const container = document.getElementById('knowledge-tree');
    let idx = 0;
    let branches = '';
    
    for (const [catName, cat] of Object.entries(knowledge.categories)) {
        const kid = 'knowledge-' + (idx++);
        AppState.dataMap[kid] = { 
            name: catName, 
            icon: cat.icon, 
            level: cat.heatLevel || 3,
            description: cat.description || `${catName}领域，共${cat.fileCount}篇文档。`,
            source: `${cat.sizeKB || 0}KB 存储`,
            fileCount: cat.fileCount
        };
        
        branches += `
            <div class="branch branch-leaf" style="color: ${cat.color || 'var(--purple)'};">
                <div class="category-node ${getLevelClass(cat.heatLevel || 3)}" 
                     style="border-color: ${cat.color || 'var(--purple)'}; color: ${cat.color || 'var(--purple)'};"
                     onmouseenter="showTreeTooltip(event, '${kid}', 'knowledge')" onmouseleave="hideTooltip()">
                    <span class="cat-icon">${cat.icon}</span>
                    <span class="cat-name">${cat.name || catName}</span>
                    <span class="cat-level" style="border-color: ${cat.color || 'var(--purple)'};">${cat.heatLevel || 3}</span>
                    <span class="cat-count" style="border-color: ${cat.color || 'var(--purple)'};">${cat.fileCount}</span>
                </div>
            </div>
        `;
    }
    
    container.innerHTML = `
        <div class="tree-graph">
            <div class="tree-root" style="color: var(--purple);">
                <div class="root-node" style="border-color: var(--purple); color: var(--purple);">
                    <span class="node-icon">📚</span>
                    <span class="node-level" style="border-color: var(--purple);">KNOWLEDGE</span>
                </div>
                <div class="root-line" style="color: var(--purple);"></div>
                <div class="branches">${branches}</div>
            </div>
        </div>
    `;
}

function renderMemoryTreeGraph(memories) {
    const container = document.getElementById('memory-tree');
    
    // 按分类组织
    const grouped = {};
    for (const mem of memories.items) {
        const cat = mem.category;
        if (!grouped[cat]) {
            const catInfo = memories.byCategory?.[cat] || { icon: '📝', label: cat, color: 'var(--orange)' };
            grouped[cat] = { ...catInfo, items: [] };
        }
        grouped[cat].items.push(mem);
    }
    
    let idx = 0;
    let branches = '';
    
    for (const [catKey, cat] of Object.entries(grouped)) {
        const avgImp = Math.round(cat.items.reduce((s, x) => s + (x.importance || 3), 0) / cat.items.length);
        
        let leaves = '';
        for (const mem of cat.items) {
            const mid = 'memory-' + (idx++);
            AppState.dataMap[mid] = {
                name: mem.title,
                icon: mem.icon,
                level: mem.importance || 3,
                description: mem.description || ((mem.keywords && mem.keywords.length) ? `关键词: ${mem.keywords.join('、')}` : '核心记忆'),
                source: mem.source || '用户显式记录'
            };
            leaves += `
                <div class="leaf-node ${getLevelClass(mem.importance || 3)}" 
                     style="border-color: var(--node-color); color: var(--node-color);"
                     onmouseenter="showTreeTooltip(event, '${mid}', 'memory')" onmouseleave="hideTooltip()">
                    <span class="leaf-icon">${mem.icon}</span>
                    <span class="leaf-level" style="border-color: var(--node-color);">${mem.importance || 3}</span>
                </div>
            `;
        }
        
        branches += `
            <div class="branch" style="color: ${cat.color || 'var(--orange)'};">
                <div class="category-node ${getLevelClass(avgImp)}" 
                     style="border-color: ${cat.color || 'var(--orange)'}; color: ${cat.color || 'var(--orange)'};">
                    <span class="cat-icon">${cat.icon}</span>
                    <span class="cat-name">${cat.label}</span>
                    <span class="cat-level" style="border-color: ${cat.color || 'var(--orange)'};">${avgImp}</span>
                    <span class="cat-count" style="border-color: ${cat.color || 'var(--orange)'};">${cat.items.length}</span>
                </div>
                <div class="leaves" style="color: ${cat.color || 'var(--orange)'};">
                    ${leaves}
                </div>
            </div>
        `;
    }
    
    container.innerHTML = `
        <div class="tree-graph">
            <div class="tree-root" style="color: var(--orange);">
                <div class="root-node" style="border-color: var(--orange); color: var(--orange);">
                    <span class="node-icon">🧠</span>
                    <span class="node-level" style="border-color: var(--orange);">MEMORY</span>
                </div>
                <div class="root-line" style="color: var(--orange);"></div>
                <div class="branches">${branches}</div>
            </div>
        </div>
    `;
}

// 树节点气泡
function showTreeTooltip(event, id, type) {
    const data = AppState.dataMap[id];
    if (!data) return;
    
    const tooltip = DOM.tooltip;
    const typeLabels = { skill: '技能', knowledge: '知识库', memory: '记忆' };
    const typeColors = { skill: 'var(--green)', knowledge: 'var(--purple)', memory: 'var(--orange)' };
    
    tooltip.querySelector('.tip-icon').textContent = data.catIcon || data.icon || '⚡';
    tooltip.querySelector('.tip-name').textContent = data.name;
    tooltip.querySelector('.tip-type').textContent = typeLabels[type] || type;
    tooltip.querySelector('.tip-lv-num').textContent = 'Lv.' + (data.level || 1);
    tooltip.querySelector('.tip-lv-num').style.color = typeColors[type];
    tooltip.querySelector('.tip-desc').textContent = data.description || '暂无描述';
    
    const sourceEl = tooltip.querySelector('.tip-source');
    const sourceSection = tooltip.querySelector('.tip-source-section');
    if (data.source) {
        tooltip.querySelector('.tip-source-section .tip-section-title').textContent = '📍 来源';
        sourceEl.textContent = data.source;
        sourceEl.style.whiteSpace = 'normal';
        sourceSection.style.display = 'block';
    } else {
        sourceSection.style.display = 'none';
    }
    
    // 显示进度条
    tooltip.querySelector('.tip-progress').style.display = 'block';
    tooltip.querySelector('.tip-progress-text').style.display = 'flex';
    
    const lv = data.level || 1;
    tooltip.querySelector('.tip-progress-fill').style.width = (lv / 5 * 100) + '%';
    tooltip.querySelector('.tip-progress-fill').style.background = typeColors[type];
    tooltip.querySelector('.prog-cur').textContent = '当前: Lv.' + lv;
    tooltip.querySelector('.prog-next').textContent = lv >= 5 ? '已满级' : '下一级: Lv.' + (lv + 1);
    
    // 定位
    const rect = event.currentTarget.getBoundingClientRect();
    let left = rect.right + 15;
    let top = rect.top;
    
    if (left + 280 > window.innerWidth) left = rect.left - 280 - 15;
    if (top + 250 > window.innerHeight) top = window.innerHeight - 250 - 20;
    if (top < 20) top = 20;
    if (left < 20) left = 20;
    
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
    tooltip.classList.add('visible');
}

window.showTreeTooltip = showTreeTooltip;

// ==================== 项目作品 ====================
function renderProjects() {
    const projects = AppState.projectsData;
    
    // 统计数据
    document.getElementById('p-total').textContent = projects.summary.total;
    document.getElementById('p-deployed').textContent = projects.summary.deployed;
    document.getElementById('p-dev').textContent = projects.summary.inDevelopment;
    document.getElementById('p-archived').textContent = projects.summary.archived;
    
    // 分类标签
    renderProjectCategoryTabs(projects);
    
    // 项目网格
    renderProjectsGrid(projects, 'all');
}

function renderProjectCategoryTabs(projects) {
    const container = document.getElementById('project-category-tabs');
    
    let html = `<button class="cat-tab active" data-category="all">🌟 全部 <span class="cat-count">${projects.projects.length}</span></button>`;
    
    for (const [key, cat] of Object.entries(projects.categories)) {
        html += `<button class="cat-tab" data-category="${key}">${cat.icon} ${cat.name} <span class="cat-count">${cat.count}</span></button>`;
    }
    
    container.innerHTML = html;
    
    // 绑定事件
    container.querySelectorAll('.cat-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            container.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            AppState.currentProjectCategory = btn.dataset.category;
            renderProjectsGrid(projects, btn.dataset.category);
        });
    });
}

function renderProjectsGrid(projects, category) {
    const container = document.getElementById('projects-grid');
    
    let filteredProjects = projects.projects;
    if (category !== 'all') {
        filteredProjects = projects.projects.filter(p => p.category === category);
    }
    
    container.innerHTML = filteredProjects.map(p => {
        const statusClass = p.status === 'deployed' ? 'status-deployed' : 
                           p.status === 'development' ? 'status-development' : 'status-archived';
        const statusText = p.status === 'deployed' ? '✅ 已部署' : 
                          p.status === 'development' ? '🔧 开发中' : '📦 已归档';
        
        const highlights = (p.highlights || []).map(h => `<span class="project-highlight">✓ ${h}</span>`).join('');
        const techTags = (p.techStack || []).map(t => `<span class="tech-tag">${t}</span>`).join('');
        
        const linkHtml = p.url 
            ? `<a href="${p.url}" target="_blank" class="project-link">🔗 访问项目</a>`
            : `<span class="project-link disabled">🔒 本地项目</span>`;
        
        return `
            <div class="project-card">
                <div class="project-header">
                    <div class="project-icon">${p.icon}</div>
                    <div class="project-title-area">
                        <div class="project-name">${p.name}</div>
                        <div class="project-subtitle">${p.subtitle}</div>
                    </div>
                    <span class="project-status ${statusClass}">${statusText}</span>
                </div>
                <div class="project-body">
                    <div class="project-section">
                        <div class="project-section-label">🎯 项目目标</div>
                        <div class="project-section-content">${p.goal}</div>
                    </div>
                    <div class="project-section">
                        <div class="project-section-label">📦 项目成果</div>
                        <div class="project-section-content">${p.outcome}</div>
                    </div>
                    ${highlights ? `
                    <div class="project-section">
                        <div class="project-section-label">✨ 亮点</div>
                        <div class="project-highlights">${highlights}</div>
                    </div>
                    ` : ''}
                    <div class="project-section">
                        <div class="project-section-label">🛠️ 技术栈</div>
                        <div class="project-tech-stack">${techTags}</div>
                    </div>
                </div>
                <div class="project-footer">
                    <span class="project-date">📅 ${p.completedAt}</span>
                    ${linkHtml}
                </div>
            </div>
        `;
    }).join('');
}

// ==================== 关于我 ====================
function renderAbout() {
    // 成就墙
    const achievements = AppState.characterData.achievements;
    const container = document.getElementById('achievements-full');
    
    container.innerHTML = achievements.map(a => `
        <div class="achievement-item ${a.unlocked ? 'unlocked' : 'locked'}">
            <div class="ach-icon">${a.icon}</div>
            <div class="ach-info">
                <div class="ach-name">${a.name}</div>
                <div class="ach-desc">${a.desc}</div>
                ${a.unlocked ? `<div class="ach-date">📅 ${a.date}</div>` : ''}
            </div>
        </div>
    `).join('');
}

// ==================== 图表渲染 ====================
function renderCharts() {
    renderRadarChart();
    renderMiniTrendChart();
    renderTrendChart();
}

function renderRadarChart() {
    const stats = AppState.characterData.character.stats;
    
    new Chart(document.getElementById('radarChart'), {
        type: 'radar',
        data: {
            labels: ['推理', '记忆', '执行', '学习', '洞察', '创造'],
            datasets: [{
                data: [
                    stats.reasoning,
                    stats.memory,
                    stats.execution,
                    stats.learning,
                    stats.insight,
                    stats.creativity
                ],
                backgroundColor: 'rgba(0, 255, 136, 0.2)',
                borderColor: '#00ff88',
                borderWidth: 2,
                pointBackgroundColor: '#00ff88',
                pointBorderColor: '#00ff88',
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: { color: 'rgba(255,255,255,0.1)' },
                    grid: { color: 'rgba(255,255,255,0.1)' },
                    pointLabels: { color: '#8b8b9a', font: { size: 10 } },
                    ticks: { display: false },
                    min: 0,
                    max: 100
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function renderMiniTrendChart() {
    const trend = AppState.reportsData.trend;
    
    new Chart(document.getElementById('miniTrendChart'), {
        type: 'line',
        data: {
            labels: trend.dates,
            datasets: [{
                data: trend.skills,
                borderColor: '#00ff88',
                borderWidth: 2,
                fill: false,
                tension: 0.4,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { display: false },
                y: { display: false }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function renderTrendChart() {
    const trend = AppState.reportsData.trend;
    
    new Chart(document.getElementById('trendChart'), {
        type: 'line',
        data: {
            labels: trend.dates,
            datasets: [
                {
                    label: '技能',
                    data: trend.skills,
                    borderColor: '#00ff88',
                    backgroundColor: 'rgba(0,255,136,0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 8
                },
                {
                    label: '知识',
                    data: trend.knowledge,
                    borderColor: '#bf7fff',
                    backgroundColor: 'rgba(191,127,255,0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 8
                },
                {
                    label: '记忆',
                    data: trend.memory,
                    borderColor: '#ff9500',
                    backgroundColor: 'rgba(255,149,0,0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 8
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#5a5a6e', font: { size: 10 } }
                },
                y: {
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#5a5a6e', font: { size: 10 } }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#8b8b9a',
                        usePointStyle: true,
                        font: { size: 11 }
                    }
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(26, 27, 46, 0.95)',
                    titleColor: '#ffffff',
                    bodyColor: '#8b8b9a',
                    borderColor: '#bf7fff',
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 12
                }
            }
        }
    });
}

// ==================== Tooltip ====================
function showSkillTooltip(event, id) {
    const data = AppState.dataMap[id];
    if (!data) return;
    
    const tooltip = DOM.tooltip;
    
    tooltip.querySelector('.tip-icon').textContent = data.catIcon || '⚡';
    tooltip.querySelector('.tip-name').textContent = data.name;
    tooltip.querySelector('.tip-type').textContent = '技能';
    tooltip.querySelector('.tip-lv-num').textContent = 'Lv.' + data.level;
    tooltip.querySelector('.tip-desc').textContent = data.description || '暂无描述';
    
    const sourceEl = tooltip.querySelector('.tip-source');
    const sourceSection = tooltip.querySelector('.tip-source-section');
    if (data.source) {
        sourceEl.textContent = data.source;
        sourceSection.style.display = 'block';
    } else {
        sourceSection.style.display = 'none';
    }
    
    const lv = data.level || 1;
    tooltip.querySelector('.tip-progress-fill').style.width = (lv / 5 * 100) + '%';
    tooltip.querySelector('.prog-cur').textContent = '当前: Lv.' + lv;
    tooltip.querySelector('.prog-next').textContent = lv >= 5 ? '已满级' : '下一级: Lv.' + (lv + 1);
    
    // 定位
    const rect = event.currentTarget.getBoundingClientRect();
    let left = rect.right + 15;
    let top = rect.top;
    
    if (left + 280 > window.innerWidth) left = rect.left - 280 - 15;
    if (top + 250 > window.innerHeight) top = window.innerHeight - 250 - 20;
    if (top < 20) top = 20;
    if (left < 20) left = 20;
    
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
    tooltip.classList.add('visible');
}

function hideTooltip() {
    DOM.tooltip.classList.remove('visible');
}

// 全局暴露
window.showSkillTooltip = showSkillTooltip;
window.hideTooltip = hideTooltip;
