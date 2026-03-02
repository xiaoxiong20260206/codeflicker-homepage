/**
 * 添棋统一单页面 - 主应用脚本 v2.0
 * TIANQI Unified Single Page Application
 * 
 * 新版Tab结构：
 * 1. 日报（合并今日+历史）
 * 2. 我的作品
 * 3. 我的能力（合并技能树+关于我）
 */

// ==================== 全局状态 ====================
const AppState = {
    characterData: null,
    reportsData: null,
    projectsData: null,
    currentSection: 'daily',
    currentReportIndex: 0, // 当前选中的日报索引
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
        // JSON文件始终在index.html同级目录
        const basePath = './';
        
        console.log('Loading data from basePath:', basePath);
        
        const [characterRes, reportsRes, projectsRes] = await Promise.all([
            fetch(basePath + 'character-data.json'),
            fetch(basePath + 'reports-data.json'),
            fetch(basePath + 'projects-data.json')
        ]);
        
        if (!characterRes.ok) {
            throw new Error('Failed to load character data: ' + characterRes.status);
        }
        if (!reportsRes.ok) {
            throw new Error('Failed to load reports data: ' + reportsRes.status);
        }
        if (!projectsRes.ok) {
            throw new Error('Failed to load projects data: ' + projectsRes.status);
        }
        
        AppState.characterData = await characterRes.json();
        AppState.reportsData = await reportsRes.json();
        AppState.projectsData = await projectsRes.json();
        
        console.log('Data loaded successfully');
        renderAll();
    } catch (e) {
        console.error('Failed to load data:', e);
        document.querySelectorAll('.loading').forEach(el => {
            el.textContent = '❌ 数据加载失败: ' + e.message;
        });
    }
}

function renderAll() {
    renderSidebar();
    renderDailySection();      // 新的日报Section（合并今日+历史）
    renderWorksSection();      // 我的作品Section
    renderAbilitiesSection();  // 我的能力Section（合并技能树+关于我）
    renderCharts();
}

// ==================== 侧边栏渲染 ====================
function renderSidebar() {
    const char = AppState.characterData?.character;
    const skills = AppState.characterData?.skills;
    const knowledge = AppState.characterData?.knowledge;
    const memories = AppState.characterData?.memories;
    const projects = AppState.projectsData;
    
    if (!char || !skills || !knowledge || !memories) {
        console.warn('Character data not fully loaded');
        return;
    }
    
    // 等级
    const heroLevel = document.getElementById('hero-level');
    if (heroLevel) heroLevel.textContent = 'LV.' + char.level;
    
    // 核心数据
    const statSkills = document.getElementById('stat-skills');
    const statKnowledge = document.getElementById('stat-knowledge');
    const statMemory = document.getElementById('stat-memory');
    const statProjects = document.getElementById('stat-projects');
    
    if (statSkills) statSkills.textContent = skills.total;
    if (statKnowledge) statKnowledge.textContent = knowledge.totalFiles;
    if (statMemory) statMemory.textContent = memories.total;
    if (statProjects && projects?.summary) statProjects.textContent = projects.summary.total;
    
    // 存储侧边栏数据供气泡使用
    const directories = knowledge.directories || [];
    const categories = skills.categories || {};
    const memCategories = memories.categories || {};
    
    AppState.sidebarStats = {
        skills: {
            name: '技能',
            icon: '⚡',
            value: skills.total,
            description: `已掌握${skills.total}项技能，涵盖${Object.keys(categories).length}个类别`,
            categories: Object.entries(categories).map(([name, cat]) => `${name}(${cat.count})`).join('、')
        },
        knowledge: {
            name: '知识',
            icon: '📚',
            value: knowledge.totalFiles,
            description: `知识库包含${knowledge.totalFiles}个文件，分布在${directories.length}个目录`,
            categories: directories.map(d => `${d.name}(${d.count})`).join('、')
        },
        memory: {
            name: '记忆',
            icon: '🧠',
            value: memories.total,
            description: `存储${memories.total}条记忆，涵盖${Object.keys(memCategories).length}个分类`,
            categories: Object.entries(memCategories).map(([name, cat]) => `${name}(${cat.count})`).join('、')
        },
        projects: {
            name: '作品',
            icon: '🎨',
            value: projects?.summary?.total || 0,
            description: `完成${projects?.summary?.total || 0}个项目，其中${projects?.summary?.deployed || 0}个已部署`,
            categories: `已部署(${projects?.summary?.deployed || 0})、开发中(${projects?.summary?.inDevelopment || 0})`
        }
    };
    
    // 更新时间
    const lastUpdate = document.getElementById('last-update');
    const reports = AppState.reportsData?.reports || [];
    if (lastUpdate && reports.length > 0) {
        lastUpdate.textContent = reports[0].date;
    }
    
    // 迷你成就
    renderMiniAchievements();
}

function renderMiniAchievements() {
    const achievements = AppState.characterData?.achievements || [];
    const container = document.getElementById('achievements-mini');
    if (!container) return;
    
    const unlocked = achievements.filter(a => a.unlocked).slice(0, 8);
    container.innerHTML = unlocked.map(a => `
        <div class="ach-mini-item" title="${a.name}: ${a.desc}">
            ${a.icon}
        </div>
    `).join('');
}

// ==================== 日报Section v7.1 ====================
function renderDailySection() {
    const reports = AppState.reportsData?.reports || [];
    if (reports.length === 0) {
        console.warn('No reports data available');
        return;
    }
    
    // 初始化日期选择器
    initDateSelector();
    
    // 渲染当前选中的日报
    renderSelectedReport(0);
}

function initDateSelector() {
    const reports = AppState.reportsData?.reports || [];
    const selector = document.getElementById('report-date-select');
    if (!selector || reports.length === 0) return;
    
    selector.innerHTML = reports.map((r, idx) => 
        `<option value="${idx}">${r.date} (${r.dayOfWeek})</option>`
    ).join('');
    
    selector.addEventListener('change', (e) => {
        const idx = parseInt(e.target.value);
        AppState.currentReportIndex = idx;
        renderSelectedReport(idx);
        updateTimelineActive(idx);
    });
}

function renderSelectedReport(index) {
    const reports = AppState.reportsData?.reports || [];
    if (index >= reports.length) return;
    
    const report = reports[index];
    
    // ========== v7.1: 三板块渲染 ==========
    // 板块一：核心进展
    renderCoreProgress(report.coreProgress || report.highlights || []);
    
    // 板块二：交付情况
    renderDeliveries(report.deliveries || []);
    
    // 板块三：能力提升
    renderCapabilityGrowth(report.capabilityGrowth || report);
    
    // 渲染趋势图
    renderDailyTrendChart();
}

// ========== v7.4: 板块一 - 核心进展 (分类显示) ==========
function renderCoreProgress(progress) {
    const container = document.getElementById('core-progress-list');
    if (!container) return;
    
    if (!progress || progress.length === 0) {
        container.innerHTML = '<div class="progress-empty">— 今日无进展记录</div>';
        return;
    }
    
    // 分类整理进展项
    const deliveryItems = [];  // 交付情况
    const capabilityItems = []; // 能力提升
    
    progress.forEach(item => {
        if (item.startsWith('💬') || item.startsWith('📁')) {
            deliveryItems.push(item);
        } else if (item.startsWith('⚡') || item.startsWith('🧠') || item.startsWith('📚')) {
            capabilityItems.push(item);
        } else {
            deliveryItems.push(item);
        }
    });
    
    let html = '';
    
    // 渲染交付情况分类
    if (deliveryItems.length > 0) {
        html += `
            <div class="progress-category">
                <div class="progress-category-header">
                    <span class="progress-category-icon">🚀</span>
                    <span class="progress-category-title">交付情况</span>
                </div>
                <div class="progress-items">
                    ${deliveryItems.map((item, idx) => renderProgressItem(item, idx + 1)).join('')}
                </div>
            </div>
        `;
    }
    
    // 渲染能力提升分类
    if (capabilityItems.length > 0) {
        html += `
            <div class="progress-category">
                <div class="progress-category-header">
                    <span class="progress-category-icon">📈</span>
                    <span class="progress-category-title">能力提升</span>
                </div>
                <div class="progress-items">
                    ${capabilityItems.map((item, idx) => renderProgressItem(item, idx + 1)).join('')}
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html || '<div class="progress-empty">— 今日无进展记录</div>';
}

function renderProgressItem(item, index) {
    // 提取图标和文本
    let text = item;
    
    // 移除前缀图标
    const prefixes = ['💬 ', '📁 ', '⚡ ', '🧠 ', '📚 ', '✅ ', '— '];
    for (const prefix of prefixes) {
        if (text.startsWith(prefix)) {
            text = text.substring(prefix.length);
            break;
        }
    }
    
    // 分离主要内容和详细说明
    let mainText = text;
    let detailText = '';
    
    // 检查是否有“，”分隔的利好说明
    const benefitMatch = text.match(/^(.+?)，(.+)$/);
    if (benefitMatch) {
        mainText = benefitMatch[1];
        detailText = benefitMatch[2];
    }
    
    return `
        <div class="progress-item">
            <span class="progress-number">${index}.</span>
            <div class="progress-content">
                <div class="progress-main">${escapeHtml(mainText)}</div>
                ${detailText ? `<div class="progress-detail">→ ${escapeHtml(detailText)}</div>` : ''}
            </div>
        </div>
    `;
}

// ========== v7.1: 板块二 - 交付情况 ==========
function renderDeliveries(deliveries) {
    const container = document.getElementById('deliveries-list');
    if (!container) return;
    
    if (!deliveries || deliveries.length === 0) {
        container.innerHTML = '<div class="delivery-card"><div class="delivery-title">— 今日无交付记录</div></div>';
        return;
    }
    
    container.innerHTML = deliveries.map(d => {
        const type = d.type || 'conversation';
        const typeIcon = type === 'project' ? '📁' : '💬';
        const typeLabel = type === 'project' ? '项目' : '任务';
        
        // 交付物渲染
        let deliverablesHtml = '';
        if (d.deliverables && d.deliverables.length > 0) {
            deliverablesHtml = `
                <div class="delivery-deliverables">
                    ${d.deliverables.map(item => {
                        if (item.url) {
                            return `<span class="deliverable-item has-link"><a href="${item.url}" target="_blank">📦 ${escapeHtml(item.name)}</a></span>`;
                        }
                        return `<span class="deliverable-item">📦 ${escapeHtml(item.name)}</span>`;
                    }).join('')}
                </div>
            `;
        }
        
        // 执行过程渲染
        let processHtml = '';
        if (d.process && d.process.length > 0) {
            processHtml = `
                <div class="delivery-process">
                    ${d.process.map(step => `<div class="process-step">${escapeHtml(step)}</div>`).join('')}
                </div>
            `;
        }
        
        // 项目统计
        let statsHtml = '';
        if (type === 'project') {
            const stats = [];
            if (d.commitCount) stats.push(`${d.commitCount}次提交`);
            if (d.fileChangeCount) stats.push(`${d.fileChangeCount}个文件`);
            if (d.deployUrl) stats.push(`<a href="${d.deployUrl}" target="_blank" class="project-deploy-link">🔗 访问</a>`);
            if (stats.length > 0) {
                statsHtml = `<div style="margin-top: 8px; font-size: 12px; color: var(--zelda-brown);">${stats.join(' · ')}</div>`;
            }
        }
        
        return `
            <div class="delivery-card ${type}">
                <div class="delivery-header">
                    <div class="delivery-title">
                        ${typeIcon} ${escapeHtml(d.title)}
                    </div>
                    <span class="delivery-type-badge ${type}">${typeLabel}</span>
                </div>
                ${d.goal ? `
                    <div class="delivery-goal">
                        <span class="delivery-goal-icon">🎯</span>
                        <span class="delivery-goal-text">${escapeHtml(d.goal)}</span>
                    </div>
                ` : ''}
                ${deliverablesHtml}
                ${processHtml}
                ${statsHtml}
            </div>
        `;
    }).join('');
}

// ========== v7.1: 板块三 - 能力提升 ==========
function renderCapabilityGrowth(capData) {
    // 能力概览卡片
    const skillsEl = document.getElementById('cap-skills-v2');
    const knowledgeEl = document.getElementById('cap-knowledge-v2');
    const memoryEl = document.getElementById('cap-memory-v2');
    
    if (skillsEl) skillsEl.textContent = capData.skillCount || capData.skillsTotal || '-';
    if (knowledgeEl) knowledgeEl.textContent = capData.knowledgeCount || capData.knowledgeTotal || '-';
    if (memoryEl) memoryEl.textContent = capData.memoryCount || capData.memoryTotal || '-';
    
    // 能力变化
    updateCapChangeV2('cap-skills-change-v2', capData.skillChange);
    updateCapChangeV2('cap-knowledge-change-v2', capData.knowledgeChange);
    updateCapChangeV2('cap-memory-change-v2', capData.memoryChange);
    
    // 新增内容标签
    renderNewItemsTags(capData);
}

function updateCapChangeV2(elementId, change) {
    const el = document.getElementById(elementId);
    if (!el) return;
    
    if (change > 0) {
        el.textContent = '+' + change;
        el.className = 'cap-change-v2 positive';
    } else {
        el.textContent = '-';
        el.className = 'cap-change-v2 neutral';
    }
}

function renderNewItemsTags(capData) {
    const container = document.getElementById('new-items-tags');
    if (!container) return;
    
    let tags = [];
    
    // 新增技能
    const newSkills = capData.newSkills || [];
    newSkills.forEach(s => {
        tags.push(`<span class="new-item-tag skill">⚡ ${escapeHtml(s.name)}</span>`);
    });
    
    // 新增知识
    const newKnowledge = capData.newKnowledge || [];
    newKnowledge.slice(0, 3).forEach(k => {
        const name = typeof k === 'string' ? k : (k.name || k.title || '未命名');
        tags.push(`<span class="new-item-tag knowledge">📚 ${escapeHtml(name)}</span>`);
    });
    
    // 新增记忆
    const newMemory = capData.newMemory || [];
    newMemory.slice(0, 3).forEach(m => {
        const title = typeof m === 'string' ? m : (m.title || '未命名');
        tags.push(`<span class="new-item-tag memory">🧠 ${escapeHtml(title)}</span>`);
    });
    
    if (tags.length === 0) {
        container.innerHTML = '<span style="font-size: 12px; color: var(--zelda-brown); opacity: 0.6;">今日无新增内容</span>';
    } else {
        container.innerHTML = tags.join('');
    }
}

// ========== v7.1: 趋势图 ==========
let dailyTrendChartInstance = null;

function renderDailyTrendChart() {
    const canvas = document.getElementById('dailyTrendChart');
    if (!canvas) return;
    
    const trend = AppState.reportsData?.trend;
    if (!trend || !trend.dates || trend.dates.length === 0) {
        return;
    }
    
    // 销毁旧实例
    if (dailyTrendChartInstance) {
        dailyTrendChartInstance.destroy();
    }
    
    const ctx = canvas.getContext('2d');
    
    dailyTrendChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: trend.dates,
            datasets: [
                {
                    label: '技能',
                    data: trend.skills,
                    borderColor: '#00d4ff',
                    backgroundColor: 'rgba(0, 212, 255, 0.1)',
                    tension: 0.3,
                    fill: false,
                    pointRadius: 3,
                    pointBackgroundColor: '#00d4ff'
                },
                {
                    label: '知识',
                    data: trend.knowledge,
                    borderColor: '#c9a227',
                    backgroundColor: 'rgba(201, 162, 39, 0.1)',
                    tension: 0.3,
                    fill: false,
                    pointRadius: 3,
                    pointBackgroundColor: '#c9a227'
                },
                {
                    label: '记忆',
                    data: trend.memory,
                    borderColor: '#9b59b6',
                    backgroundColor: 'rgba(155, 89, 182, 0.1)',
                    tension: 0.3,
                    fill: false,
                    pointRadius: 3,
                    pointBackgroundColor: '#9b59b6'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#8cb4c0',
                        font: { size: 11 },
                        usePointStyle: true,
                        padding: 15
                    }
                },
                tooltip: {
                    enabled: true,
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(30, 35, 40, 0.95)',
                    titleColor: '#00d4ff',
                    titleFont: { size: 13, weight: 'bold' },
                    bodyColor: '#e8dcc4',
                    bodyFont: { size: 12 },
                    borderColor: '#00d4ff',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        title: function(context) {
                            return '📅 ' + context[0].label;
                        },
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y;
                            const icons = { '技能': '⚡', '知识': '📚', '记忆': '🧠' };
                            return ' ' + (icons[label] || '') + ' ' + label + ': ' + value;
                        }
                    }
                }
            },
            interaction: {
                mode: 'index',
                intersect: false
            },
            scales: {
                x: {
                    grid: { color: 'rgba(140, 180, 192, 0.1)' },
                    ticks: { color: '#8cb4c0', font: { size: 10 } }
                },
                y: {
                    grid: { color: 'rgba(140, 180, 192, 0.1)' },
                    ticks: { color: '#8cb4c0', font: { size: 10 } },
                    beginAtZero: false
                }
            }
        }
    });
}

// HTML转义工具函数
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getTrendText(report) {
    const total = (report.skillChange || 0) + (report.knowledgeChange || 0) + (report.memoryChange || 0);
    if (total > 5) return '🚀 高速成长';
    if (total > 0) return '📈 稳步提升';
    return '— 稳定运行';
}

function updateCapChange(elementId, change) {
    const el = document.getElementById(elementId);
    if (!el) return;
    
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

function selectReport(idx) {
    AppState.currentReportIndex = idx;
    renderSelectedReport(idx);
    
    // 更新下拉选择器
    const selector = document.getElementById('report-date-select');
    if (selector) selector.value = idx;
}

// 暴露到全局
window.selectReport = selectReport;

function formatChange(change) {
    if (change > 0) return { text: '+' + change, class: 'up' };
    if (change < 0) return { text: change.toString(), class: 'down' };
    return { text: '-', class: 'none' };
}

// ==================== 我的作品Section ====================
function renderWorksSection() {
    const projects = AppState.projectsData;
    
    if (!projects?.summary) {
        console.warn('Projects data not available');
        return;
    }
    
    // 统计数据
    const worksTotal = document.getElementById('works-total');
    const worksDeployed = document.getElementById('works-deployed');
    
    if (worksTotal) worksTotal.textContent = projects.summary.total;
    if (worksDeployed) worksDeployed.textContent = projects.summary.deployed;
    
    // 作品网格
    renderWorksGrid(projects);
}

function renderWorksGrid(projects) {
    const container = document.getElementById('works-grid');
    
    if (!container) {
        console.warn('works-grid container not found');
        return;
    }
    
    if (!projects?.projects || projects.projects.length === 0) {
        container.innerHTML = '<div class="no-data">暂无作品数据</div>';
        return;
    }
    
    // 优先展示已部署的项目
    const sortedProjects = [...projects.projects].sort((a, b) => {
        if (a.status === 'deployed' && b.status !== 'deployed') return -1;
        if (a.status !== 'deployed' && b.status === 'deployed') return 1;
        return 0;
    });
    
    // 将项目数据存入dataMap供tooltip使用
    sortedProjects.forEach((p, idx) => {
        const projectId = 'project-' + idx;
        AppState.dataMap[projectId] = {
            ...p,
            type: 'project'
        };
    });
    
    container.innerHTML = sortedProjects.map((p, idx) => {
        const projectId = 'project-' + idx;
        const statusClass = p.status === 'deployed' ? 'deployed' : 
                           p.status === 'development' ? 'development' : 'archived';
        const statusText = p.status === 'deployed' ? '✅ 已上线' : 
                          p.status === 'development' ? '🔧 开发中' : '📦 已归档';
        
        const techTags = (p.techStack || []).slice(0, 4).map(t => `<span class="tech-tag">${t}</span>`).join('');
        
        const linkHtml = p.url 
            ? `<a href="${p.url}" target="_blank" class="work-link">🔗 访问作品</a>`
            : '';
        
        return `
            <div class="work-card ${statusClass}" 
                 onmouseenter="showProjectTooltip(event, '${projectId}')" 
                 onmouseleave="hideTooltip()">
                <div class="work-header">
                    <span class="work-icon">${p.icon}</span>
                    <div class="work-info">
                        <div class="work-name">${p.name}</div>
                        <div class="work-subtitle">${p.subtitle || ''}</div>
                    </div>
                    <span class="work-status ${statusClass}">${statusText}</span>
                </div>
                <div class="work-desc">${p.goal || ''}</div>
                <div class="work-footer">
                    <div class="work-tech">${techTags}</div>
                    ${linkHtml}
                </div>
            </div>
        `;
    }).join('');
}

// ==================== 我的能力Section（合并技能树+关于我） ====================
function renderAbilitiesSection() {
    const skills = AppState.characterData?.skills;
    const knowledge = AppState.characterData?.knowledge;
    const memories = AppState.characterData?.memories;
    const achievements = AppState.characterData?.achievements || [];
    
    if (!skills || !knowledge || !memories) {
        console.warn('Character data not available for abilities section');
        return;
    }
    
    // 能力总览
    const abilitySkills = document.getElementById('ability-skills');
    const abilityKnowledge = document.getElementById('ability-knowledge');
    const abilityMemory = document.getElementById('ability-memory');
    const abilityAchievements = document.getElementById('ability-achievements');
    
    if (abilitySkills) abilitySkills.textContent = skills.total;
    if (abilityKnowledge) abilityKnowledge.textContent = knowledge.totalFiles;
    if (abilityMemory) abilityMemory.textContent = memories.total;
    if (abilityAchievements) abilityAchievements.textContent = achievements.filter(a => a.unlocked).length;
    
    // 统计数据（技能树面板）
    const skillTotal = document.getElementById('skill-total');
    const knowledgeTotal = document.getElementById('knowledge-total');
    const memoryTotal = document.getElementById('memory-total');
    
    if (skillTotal) skillTotal.textContent = skills.total;
    if (knowledgeTotal) knowledgeTotal.textContent = knowledge.totalFiles;
    if (memoryTotal) memoryTotal.textContent = memories.total;
    
    // 渲染技能树形结构
    renderSkillTreeGraph(skills);
    
    // 渲染知识库树形结构
    renderKnowledgeTreeGraph(knowledge);
    
    // 渲染记忆库树形结构
    renderMemoryTreeGraph(memories);
    
    // 渲染成就墙
    renderAchievements(achievements);
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
    if (!container) return;
    
    // 技能名称到简短中文名的映射（优化版 v2.0）
    const skillNameMap = {
        // === 核心能力 ===
        'daily-reflection-evolution': '自进化',
        'skill-manager': '技能管理',
        'knowledge-base': '知识库',
        'personal-assistant': '助理',
        'find-skills': '发现',
        
        // === 调研分析 ===
        'industry-research': '行研',
        'wechat-research': '公众号',
        'research': '调研',
        'apify-trend-analysis': '趋势',
        'apify-market-research': '市场',
        'apify-competitor-intelligence': '竞情',
        
        // === 文档处理 ===
        'pdf': 'PDF',
        'pptx': 'PPT',
        'docx': 'Word',
        'xlsx': 'Excel',
        'canvas-design': '画布',
        
        // === 前端开发 ===
        'ui-ux-pro-max': 'UI专家',
        'ui-ux-pro-max-skill': 'UI/UX',
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
        
        // === 发布部署 ===
        'github-deploy-publisher': 'GitHub',
        'yuque-publisher': '语雀',
        'docs-shuttle': '文档',
        'mcp-builder': 'MCP',
        
        // === 投资理财 ===
        'stock-analysis': '股票',
        'investment-analyzer': '投资',
        
        // === 效率工具 ===
        'feishu-assistant': '飞书'
    };
    
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
            const shortName = skillNameMap[s.name] || s.name.substring(0, 4);
            AppState.dataMap[sid] = { ...s, icon: '⚡', catIcon: cat.icon };
            leaves += `
                <div class="leaf-node ${getLevelClass(s.level)}" 
                     style="border-color: var(--node-color); color: var(--node-color);"
                     onmouseenter="showTreeTooltip(event, '${sid}', 'skill')" onmouseleave="hideTooltip()">
                    <span class="leaf-name">${shortName}</span>
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
                    <span class="node-level" style="border-color: var(--green);">技能</span>
                </div>
            </div>
            <div class="branches">${branches}</div>
        </div>
    `;
}

function renderKnowledgeTreeGraph(knowledge) {
    const container = document.getElementById('knowledge-tree');
    if (!container) return;
    
    // 知识目录中文名称映射
    const knowledgeNameMap = {
        'personal-writings': '个人文章',
        'rd-efficiency': '研发效能',
        'financial': '金融投资',
        'experience': '经验总结',
        'guides': '使用指南',
        'investment': '投资理财',
        'ai-research': 'AI研究',
        'product': '产品思考'
    };
    
    // 知识目录来源描述映射
    const knowledgeSourceMap = {
        'personal-writings': '来自单虓晗的个人原创文章、思考记录、写作作品，涵盖人生哲学、认知框架、方法论等内容',
        'rd-efficiency': '研发效能领域的调研报告、技术分析、最佳实践，源自工作中的技术积累',
        'financial': '金融投资相关的分析报告、数据研究、决策框架',
        'experience': '项目实践中的经验沉淀、踩坑记录、解决方案',
        'guides': '工具使用指南、操作手册、配置说明',
        'investment': '投资策略、市场分析、理财规划相关内容',
        'ai-research': 'AI技术调研、行业分析、产品形态探索',
        'product': '产品设计思考、用户体验研究、功能规划'
    };
    
    // 获取知识目录 - 支持两种数据格式
    let directories = [];
    if (knowledge.directories && Array.isArray(knowledge.directories)) {
        directories = knowledge.directories;
    } else if (knowledge.categories) {
        // 新格式：categories 是对象
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
    
    let idx = 0;
    let branches = '';
    
    for (const dir of directories) {
        const dirKey = dir.key || dir.name;
        const chineseName = knowledgeNameMap[dirKey] || dirKey;
        const sourceDesc = knowledgeSourceMap[dirKey] || `${chineseName}相关文档`;
        const dirId = 'knowledge-dir-' + idx++;
        
        // 根据文件数量计算等级：1-10为Lv1, 11-30为Lv2, 31-60为Lv3, 61-100为Lv4, 100+为Lv5
        const level = dir.count <= 10 ? 1 : dir.count <= 30 ? 2 : dir.count <= 60 ? 3 : dir.count <= 100 ? 4 : 5;
        
        AppState.dataMap[dirId] = { 
            name: chineseName, 
            icon: '📁', 
            level: level,
            description: `${chineseName}知识库，共收录${dir.count}个文档${dir.sizeKB ? `，总计${dir.sizeKB}KB` : ''}`,
            source: sourceDesc
        };
        
        // 知识树直接展示分类节点作为末级节点，不再展开叶子节点
        branches += `
            <div class="branch" style="color: var(--zelda-gold);">
                <div class="leaf-node lv${level}" 
                     style="border-color: var(--node-color); color: var(--node-color);"
                     onmouseenter="showTreeTooltip(event, '${dirId}', 'knowledge')" onmouseleave="hideTooltip()">
                    <span class="leaf-icon">📁</span>
                    <span class="leaf-name">${chineseName}</span>
                    <span class="leaf-level" style="border-color: var(--node-color);">${dir.count}</span>
                </div>
            </div>
        `;
    }
    
    container.innerHTML = `
        <div class="tree-graph">
            <div class="tree-root" style="color: var(--zelda-gold);">
                <div class="root-node" style="border-color: var(--zelda-gold); color: var(--zelda-gold);">
                    <span class="node-icon">📚</span>
                    <span class="node-level" style="border-color: var(--zelda-gold);">知识</span>
                </div>
            </div>
            <div class="branches">${branches}</div>
        </div>
    `;
}

function renderMemoryTreeGraph(memories) {
    const container = document.getElementById('memory-tree');
    if (!container) return;
    
    // 获取记忆分类 - 支持两种数据格式
    let categoriesObj = memories.categories || memories.byCategory || {};
    
    if (Object.keys(categoriesObj).length === 0) {
        container.innerHTML = '<div class="no-data">暂无记忆数据</div>';
        return;
    }
    
    // 计算记忆分类等级的函数（基于记忆数量）
    function getMemoryLevel(count) {
        if (count >= 10) return 5;
        if (count >= 6) return 4;
        if (count >= 4) return 3;
        if (count >= 2) return 2;
        return 1;
    }
    
    let idx = 0;
    let branches = '';
    
    for (const [catKey, cat] of Object.entries(categoriesObj)) {
        const catName = cat.label || cat.name || catKey;
        const catCount = cat.count || 0;
        const catLevel = getMemoryLevel(catCount);
        const catId = 'memory-cat-' + idx;
        
        AppState.dataMap[catId] = { 
            name: catName, 
            icon: '🧠', 
            level: catLevel, 
            description: cat.description || `${catName}类记忆，共${catCount}条`,
            source: '记忆库'
        };
        
        let leaves = '';
        const memCount = Math.min(catCount, 6);
        // 记忆树叶子节点显示简短标签
        const memoryLabels = {
            'development_practice_specification': ['规范', '标准', '实践', '流程', '模板', '指南'],
            'user_info': ['身份', '背景', '特征', '信息', '资料', '档案'],
            'user_communication': ['偏好', '风格', '习惯', '模式', '方式', '特点'],
            'task_flow_experience': ['流程', '方法', '经验', '策略', '技巧', '实践'],
            'constraint_or_forbidden_rule': ['约束', '禁止', '规则', '限制', '边界', '条例'],
            'common_pitfalls_experience': ['踩坑', '教训', '修复', '问题', '解决', '案例']
        };
        const defaultLabels = ['条目', '记录', '内容', '项目', '事项', '信息'];
        const labels = memoryLabels[catKey] || defaultLabels;
        
        for (let i = 0; i < memCount; i++) {
            const mid = 'memory-' + (idx++);
            const memLabel = labels[i % labels.length];
            AppState.dataMap[mid] = { 
                name: catName + ' #' + (i+1), 
                icon: '💭', 
                level: catLevel, 
                description: `${catName}类别下的记忆条目`,
                source: catName
            };
            leaves += `
                <div class="leaf-node ${getLevelClass(catLevel)}" 
                     style="border-color: var(--node-color); color: var(--node-color);"
                     onmouseenter="showTreeTooltip(event, '${mid}', 'memory')" onmouseleave="hideTooltip()">
                    <span class="leaf-name">${memLabel}</span>
                </div>
            `;
        }
        
        if (catCount > 6) {
            leaves += `<div class="leaf-more">+${catCount - 6}</div>`;
        }
        
        branches += `
            <div class="branch" style="color: var(--zelda-orange);">
                <div class="category-node ${getLevelClass(catLevel)}" 
                     style="border-color: var(--zelda-orange); color: var(--zelda-orange);"
                     onmouseenter="showTreeTooltip(event, '${catId}', 'memory')" onmouseleave="hideTooltip()">
                    <span class="cat-icon">${cat.icon || '📁'}</span>
                    <span class="cat-name">${catName}</span>
                    <span class="cat-level" style="border-color: var(--zelda-orange);">${catLevel}</span>
                    <span class="cat-count" style="border-color: var(--zelda-orange);">${catCount}</span>
                </div>
                <div class="leaves" style="color: var(--zelda-orange);">
                    ${leaves}
                </div>
            </div>
        `;
    }
    
    container.innerHTML = `
        <div class="tree-graph">
            <div class="tree-root" style="color: var(--zelda-orange);">
                <div class="root-node" style="border-color: var(--zelda-orange); color: var(--zelda-orange);">
                    <span class="node-icon">🧠</span>
                    <span class="node-level" style="border-color: var(--zelda-orange);">记忆</span>
                </div>
            </div>
            <div class="branches">${branches}</div>
        </div>
    `;
}

function renderAchievements(achievements) {
    const container = document.getElementById('achievements-grid');
    if (!container) return;
    
    // 为每个成就生成唯一ID并存储数据
    achievements.forEach((a, idx) => {
        const achId = 'achievement-' + idx;
        AppState.dataMap[achId] = {
            name: a.name,
            icon: a.icon,
            desc: a.desc,
            date: a.date,
            unlocked: a.unlocked,
            id: a.id
        };
    });
    
    container.innerHTML = achievements.map((a, idx) => `
        <div class="achievement-item ${a.unlocked ? 'unlocked' : 'locked'}"
             onmouseenter="showAchievementTooltip(event, 'achievement-${idx}')" 
             onmouseleave="hideTooltip()">
            <div class="ach-icon">${a.icon}</div>
            <div class="ach-info">
                <div class="ach-name">${a.name}</div>
                <div class="ach-desc">${a.desc}</div>
            </div>
        </div>
    `).join('');
}

// 成就Tooltip显示函数
function showAchievementTooltip(event, id) {
    const data = AppState.dataMap[id];
    if (!data) return;
    
    const tooltip = DOM.tooltip;
    if (!tooltip) return;
    
    // 填充数据
    const iconEl = tooltip.querySelector('.tip-icon');
    const nameEl = tooltip.querySelector('.tip-name');
    const typeEl = tooltip.querySelector('.tip-type');
    const lvNumEl = tooltip.querySelector('.tip-lv-num');
    const descEl = tooltip.querySelector('.tip-desc');
    const sourceEl = tooltip.querySelector('.tip-source');
    const sourceSection = tooltip.querySelector('.tip-source-section');
    const upgradeEl = tooltip.querySelector('.tip-upgrade');
    const upgradeSection = tooltip.querySelector('.tip-upgrade-section');
    
    iconEl.textContent = data.icon || '🏆';
    nameEl.textContent = data.name;
    typeEl.textContent = '成就';
    lvNumEl.textContent = data.unlocked ? '✓' : '🔒';
    
    descEl.textContent = data.desc || '暂无描述';
    descEl.style.whiteSpace = 'normal';
    
    // 显示解锁日期
    if (data.date && data.date !== '???') {
        sourceEl.textContent = '解锁日期: ' + data.date;
        sourceEl.style.whiteSpace = 'normal';
        sourceSection.style.display = 'block';
    } else if (!data.unlocked) {
        sourceEl.textContent = '尚未解锁';
        sourceSection.style.display = 'block';
    } else {
        sourceSection.style.display = 'none';
    }
    
    // 显示解锁条件或祝贺
    if (upgradeEl && upgradeSection) {
        if (data.unlocked) {
            upgradeEl.textContent = '🎉 恭喜！你已解锁此成就';
        } else {
            // 根据成就ID显示解锁条件
            const unlockConditions = {
                'sanqianshijie': '需要深度理解并模拟多种思维方式',
                'eternal_memory': '需要实现记忆跨模型持久化存储'
            };
            upgradeEl.textContent = unlockConditions[data.id] || '继续探索以解锁此成就';
        }
        upgradeEl.style.whiteSpace = 'normal';
        upgradeSection.style.display = 'block';
    }
    
    // 隐藏进度条（成就不需要进度条）
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

window.showAchievementTooltip = showAchievementTooltip;

// ==================== Tooltip ====================

// 升级建议配置 - 更具体的操作指南
const upgradeAdvice = {
    skill: {
        1: '💡 升级方法：在对话中主动使用这个技能，如"帮我用XXX技能做..."。多用3-5次即可升级',
        2: '💡 升级方法：尝试更复杂的场景，比如组合多个需求，或处理更大的文件/项目',
        3: '💡 升级方法：在实际工作中持续使用，并给我反馈效果好不好，我会优化执行方式',
        4: '💡 升级方法：沉淀最佳实践，告诉我"记住这个XXX规范"，形成稳定的协作模式',
        5: '🎉 已达满级！这是我的核心能力之一，可以放心使用'
    },
    knowledge: {
        1: '💡 升级方法：在对话中分享更多这个领域的内容，如"帮我学习/整理XXX"',
        2: '💡 升级方法：让我帮你做调研、写文档，产出的内容会沉淀到知识库（目标60篇）',
        3: '💡 升级方法：系统整理该领域的知识体系，让我帮你做专题梳理（目标100篇）',
        4: '💡 升级方法：持续深耕，产出原创见解和最佳实践，成为该领域专家',
        5: '🎉 已达满级！这个领域我已有丰富积累，可以提供深度支持'
    },
    memory: {
        1: '💡 升级方法：明确告诉我你的偏好，如"记住我喜欢XXX风格"或"我习惯XXX方式"',
        2: '💡 升级方法：多次在对话中强化这个偏好，或直接说"把这个记到我的规范里"',
        3: '💡 升级方法：给我反馈哪些做得好/不好，我会持续优化对你的理解',
        4: '💡 升级方法：建立稳定的协作模式，形成默契的工作流程',
        5: '🎉 已达满级！我已深度了解你在这方面的偏好和习惯'
    }
};

function showTreeTooltip(event, id, type) {
    const data = AppState.dataMap[id];
    if (!data) return;
    
    const tooltip = DOM.tooltip;
    if (!tooltip) return;
    
    const typeColors = {
        skill: 'var(--zonai-green)',
        knowledge: 'var(--zelda-gold)',
        memory: 'var(--zelda-orange)'
    };
    
    // 填充数据
    const iconEl = tooltip.querySelector('.tip-icon');
    const nameEl = tooltip.querySelector('.tip-name');
    const typeEl = tooltip.querySelector('.tip-type');
    const lvNumEl = tooltip.querySelector('.tip-lv-num');
    const descEl = tooltip.querySelector('.tip-desc');
    const sourceEl = tooltip.querySelector('.tip-source');
    const sourceSection = tooltip.querySelector('.tip-source-section');
    const upgradeEl = tooltip.querySelector('.tip-upgrade');
    const upgradeSection = tooltip.querySelector('.tip-upgrade-section');
    
    iconEl.textContent = data.catIcon || data.icon || '⚡';
    nameEl.textContent = data.name;
    typeEl.textContent = type === 'skill' ? '技能' : type === 'knowledge' ? '知识' : '记忆';
    lvNumEl.textContent = 'Lv.' + (data.level || 1);
    
    descEl.textContent = data.description || '暂无描述';
    descEl.style.whiteSpace = 'normal';
    
    if (data.source) {
        sourceEl.textContent = data.source;
        sourceEl.style.whiteSpace = 'normal';
        sourceSection.style.display = 'block';
    } else {
        sourceSection.style.display = 'none';
    }
    
    // 显示升级建议
    const lv = data.level || 1;
    if (upgradeEl && upgradeSection) {
        const advice = upgradeAdvice[type]?.[lv] || '继续探索和积累';
        upgradeEl.textContent = advice;
        upgradeEl.style.whiteSpace = 'normal';
        upgradeSection.style.display = 'block';
    }
    
    // 显示进度条
    tooltip.querySelector('.tip-progress').style.display = 'block';
    tooltip.querySelector('.tip-progress-text').style.display = 'flex';
    
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

function showStatTooltip(event, type) {
    const data = AppState.sidebarStats[type];
    if (!data || !DOM.tooltip) return;
    
    const tooltip = DOM.tooltip;
    
    tooltip.querySelector('.tip-icon').textContent = data.icon;
    tooltip.querySelector('.tip-name').textContent = data.name;
    tooltip.querySelector('.tip-type').textContent = '统计';
    tooltip.querySelector('.tip-lv-num').textContent = data.value;
    tooltip.querySelector('.tip-lv-max').textContent = '';
    tooltip.querySelector('.tip-desc').textContent = data.description;
    
    const sourceSection = tooltip.querySelector('.tip-source-section');
    const sourceEl = tooltip.querySelector('.tip-source');
    if (data.categories) {
        sourceEl.textContent = data.categories;
        sourceSection.style.display = 'block';
    } else {
        sourceSection.style.display = 'none';
    }
    
    tooltip.querySelector('.tip-progress').style.display = 'none';
    tooltip.querySelector('.tip-progress-text').style.display = 'none';
    
    const rect = event.currentTarget.getBoundingClientRect();
    let left = rect.right + 15;
    let top = rect.top;
    
    if (left + 280 > window.innerWidth) left = rect.left - 280 - 15;
    if (top < 20) top = 20;
    
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
    tooltip.classList.add('visible');
}

window.showStatTooltip = showStatTooltip;

// 作品详情Tooltip
function showProjectTooltip(event, id) {
    const data = AppState.dataMap[id];
    if (!data || !DOM.tooltip) return;
    
    const tooltip = DOM.tooltip;
    
    // 构建详细内容
    const deliverables = (data.deliverables || []).join('、') || '暂无';
    const techStack = (data.techStack || []).join('、') || '暂无';
    const highlights = (data.highlights || []).map(h => '• ' + h).join('\n') || '暂无';
    
    // 项目用到的技能映射
    const projectSkillsMap = {
        'bytedance-ai-guide': ['industry-research', 'github-deploy-publisher', 'qingshuang-research-style'],
        'ai-product-ultimate': ['industry-research', 'research', 'frontend-design'],
        'ai-engineer-analysis': ['research', 'industry-research'],
        'ai-financial-analysis': ['stock-analysis', 'research'],
        'feishu-bot': ['mcp-builder', 'feishu-assistant'],
        'daily-report-system': ['github-deploy-publisher', 'qingshuang-research-style', 'personal-assistant'],
        'github-sync': ['github-deploy-publisher'],
        'character-panel': ['ui-ux-pro-max', 'frontend-design', 'zelda-style', 'github-deploy-publisher']
    };
    
    const skillNameMap = {
        'industry-research': '行业调研',
        'github-deploy-publisher': 'GitHub部署',
        'qingshuang-research-style': '清爽报告风格',
        'research': '通用调研',
        'frontend-design': '前端设计',
        'stock-analysis': '股票分析',
        'mcp-builder': 'MCP开发',
        'feishu-assistant': '飞书助手',
        'personal-assistant': '个人助理',
        'ui-ux-pro-max': 'UI/UX专家',
        'zelda-style': '塞尔达风格',
        'daily-reflection-evolution': '自进化'
    };
    
    const usedSkills = (projectSkillsMap[data.id] || [])
        .map(s => skillNameMap[s] || s)
        .join('、') || '暂无';
    
    // 填充数据
    tooltip.querySelector('.tip-icon').textContent = data.icon || '📦';
    tooltip.querySelector('.tip-name').textContent = data.name;
    tooltip.querySelector('.tip-type').textContent = '作品';
    tooltip.querySelector('.tip-lv-num').textContent = data.status === 'deployed' ? '已上线' : 
                                                       data.status === 'development' ? '开发中' : '已归档';
    tooltip.querySelector('.tip-lv-max').textContent = '';
    
    // 构建详细描述
    const fullDesc = `🎯 项目目标\n${data.goal || '暂无'}\n\n📦 交付物\n${deliverables}\n\n✨ 亮点\n${highlights}\n\n⚡ 使用技能\n${usedSkills}`;
    
    const descEl = tooltip.querySelector('.tip-desc');
    descEl.textContent = fullDesc;
    descEl.style.whiteSpace = 'pre-wrap';
    
    // 来源显示技术栈
    const sourceSection = tooltip.querySelector('.tip-source-section');
    const sourceEl = tooltip.querySelector('.tip-source');
    sourceEl.textContent = '技术栈: ' + techStack;
    sourceEl.style.whiteSpace = 'normal';
    sourceSection.style.display = 'block';
    
    // 隐藏进度条
    tooltip.querySelector('.tip-progress').style.display = 'none';
    tooltip.querySelector('.tip-progress-text').style.display = 'none';
    
    // 定位 - 作品卡片较大，tooltip显示在右侧或下方
    const rect = event.currentTarget.getBoundingClientRect();
    let left = rect.right + 15;
    let top = rect.top;
    
    // 如果右侧空间不够，显示在左侧
    if (left + 300 > window.innerWidth) {
        left = rect.left - 300 - 15;
    }
    // 如果左侧也不够，显示在下方居中
    if (left < 20) {
        left = Math.max(20, rect.left + rect.width / 2 - 150);
        top = rect.bottom + 10;
    }
    // 确保不超出底部
    if (top + 350 > window.innerHeight) {
        top = window.innerHeight - 350 - 20;
    }
    if (top < 20) top = 20;
    
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
    tooltip.classList.add('visible');
}

window.showProjectTooltip = showProjectTooltip;

function hideTooltip() {
    if (DOM.tooltip) {
        DOM.tooltip.classList.remove('visible');
    }
}

window.hideTooltip = hideTooltip;

// ==================== 图表渲染 - 修复隶藏状态渲染问题 ====================
let chartInstances = {
    radarChart: null,
    miniTrendChart: null,
    abilityRadarChart: null,
    trendChart: null
};

function renderCharts() {
    // 侧边栏图表始终可见，直接渲染
    renderRadarChart();
    renderMiniTrendChart();
    
    // 能力Section的图表需要等待section可见后再渲染
    // 使用IntersectionObserver或延迟初始化
    setupDeferredCharts();
}

// 延迟初始化：等待section可见后再渲染图表
function setupDeferredCharts() {
    const abilitiesSection = document.getElementById('section-abilities');
    if (!abilitiesSection) return;
    
    // 使用IntersectionObserver监听能力Section的可见性
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Section可见时渲染图表
                setTimeout(() => {
                    renderAbilityRadarChart();
                    renderTrendChart();
                }, 100);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    observer.observe(abilitiesSection);
    
    // 备用方案：监听Tab切换事件
    DOM.navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            if (tab.dataset.section === 'abilities') {
                setTimeout(() => {
                    renderAbilityRadarChart();
                    renderTrendChart();
                }, 150);
            }
        });
    });
}

function renderRadarChart() {
    const canvas = document.getElementById('radarChart');
    if (!canvas) return;
    
    // 检查canvas是否有有效尺寸
    if (canvas.offsetWidth === 0 || canvas.offsetHeight === 0) {
        console.log('radarChart: canvas not visible yet, skipping');
        return;
    }
    
    const stats = AppState.characterData?.character?.stats;
    if (!stats) return;
    
    // 销毁旧实例
    if (chartInstances.radarChart) {
        chartInstances.radarChart.destroy();
    }
    
    chartInstances.radarChart = new Chart(canvas, {
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
                backgroundColor: 'rgba(0, 212, 255, 0.2)',
                borderColor: '#00d4ff',
                borderWidth: 2,
                pointBackgroundColor: '#00d4ff',
                pointBorderColor: '#00d4ff',
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: { color: 'rgba(0, 212, 255, 0.2)' },
                    grid: { color: 'rgba(0, 212, 255, 0.2)' },
                    pointLabels: { color: '#f5e6c8', font: { size: 10 } },
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
    const canvas = document.getElementById('miniTrendChart');
    if (!canvas) return;
    
    // 检查canvas是否有有效尺寸
    if (canvas.offsetWidth === 0 || canvas.offsetHeight === 0) {
        console.log('miniTrendChart: canvas not visible yet, skipping');
        return;
    }
    
    const trend = AppState.reportsData?.trend;
    if (!trend) return;
    
    // 销毁旧实例
    if (chartInstances.miniTrendChart) {
        chartInstances.miniTrendChart.destroy();
    }
    
    chartInstances.miniTrendChart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: trend.dates,
            datasets: [{
                data: trend.skills,
                borderColor: '#00d4ff',
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

function renderAbilityRadarChart() {
    const canvas = document.getElementById('abilityRadarChart');
    if (!canvas) return;
    
    // 检查canvas是否有有效尺寸
    if (canvas.offsetWidth === 0 || canvas.offsetHeight === 0) {
        console.log('abilityRadarChart: canvas not visible yet, will retry on section switch');
        return;
    }
    
    const stats = AppState.characterData?.character?.stats;
    if (!stats) return;
    
    // 销毁旧实例
    if (chartInstances.abilityRadarChart) {
        chartInstances.abilityRadarChart.destroy();
    }
    
    chartInstances.abilityRadarChart = new Chart(canvas, {
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
                backgroundColor: 'rgba(0, 212, 255, 0.3)',
                borderColor: '#00d4ff',
                borderWidth: 2,
                pointBackgroundColor: '#00d4ff',
                pointBorderColor: '#fff',
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: { color: 'rgba(0, 212, 255, 0.3)' },
                    grid: { color: 'rgba(0, 212, 255, 0.2)' },
                    pointLabels: { color: '#f5e6c8', font: { size: 12, weight: 'bold' } },
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

function renderTrendChart() {
    const canvas = document.getElementById('trendChart');
    if (!canvas) return;
    
    // 检查canvas是否有有效尺寸
    if (canvas.offsetWidth === 0 || canvas.offsetHeight === 0) {
        console.log('trendChart: canvas not visible yet, will retry on section switch');
        return;
    }
    
    const trend = AppState.reportsData?.trend;
    if (!trend) return;
    
    // 销毁旧实例
    if (chartInstances.trendChart) {
        chartInstances.trendChart.destroy();
    }
    
    chartInstances.trendChart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: trend.dates,
            datasets: [
                {
                    label: '技能',
                    data: trend.skills,
                    borderColor: '#00d4ff',
                    backgroundColor: 'rgba(0, 212, 255, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 8
                },
                {
                    label: '知识',
                    data: trend.knowledge,
                    borderColor: '#c9a227',
                    backgroundColor: 'rgba(201, 162, 39, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 8
                },
                {
                    label: '记忆',
                    data: trend.memory,
                    borderColor: '#ff8c42',
                    backgroundColor: 'rgba(255, 140, 66, 0.1)',
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
                    grid: { color: 'rgba(0, 212, 255, 0.1)' },
                    ticks: { color: '#6b5344', font: { size: 10 } }
                },
                y: {
                    grid: { color: 'rgba(0, 212, 255, 0.1)' },
                    ticks: { color: '#6b5344', font: { size: 10 } }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#6b5344',
                        usePointStyle: true,
                        font: { size: 11 }
                    }
                },
                tooltip: {
                    enabled: true,
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(30, 35, 40, 0.95)',
                    titleColor: '#00d4ff',
                    titleFont: { size: 13, weight: 'bold' },
                    bodyColor: '#e8dcc4',
                    bodyFont: { size: 12 },
                    borderColor: '#00d4ff',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        title: function(context) {
                            return '📅 ' + context[0].label;
                        },
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y;
                            const icons = { '技能': '⚡', '知识': '📚', '记忆': '🧠' };
                            return ' ' + (icons[label] || '') + ' ' + label + ': ' + value;
                        }
                    }
                }
            }
        }
    });
}
