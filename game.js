// 游戏主对象
var game = {
    backpack: null,
    player: { health: 100, hunger: 100, thirst: 100, morale: 100, bodyTemp: 36.5, stamina: 100 },
    inventory: [],
    currentDay: 1,
    progress: 0,          // 前进进度 0~100
    maxDays: 15,
    diaryFragments: 0,
    sideQuestCompleted: false,
    eventLog: [],

    backpacks: [
        { id: 'small', name: '小背包', cap: 60 },
        { id: 'standard', name: '标准背包', cap: 90 },
        { id: 'large', name: '大容量背包', cap: 120 },
        { id: 'tactical', name: '战术背包', cap: 100 }
    ],

    items: [
        { id: 'compressed_biscuit', name: '压缩饼干', weight: 8, effects: { hunger: 20 }, category: 'food' },
        { id: 'beef_jerky', name: '牛肉干', weight: 6, effects: { hunger: 25 }, category: 'food' },
        { id: 'instant_noodles', name: '方便面', weight: 10, effects: { hunger: 35, thirst: -5 }, category: 'food' },
        { id: 'chocolate', name: '巧克力', weight: 4, effects: { hunger: 25, morale: 5, stamina: 5 }, category: 'food' },
        { id: 'canned_food', name: '罐头', weight: 12, effects: { hunger: 40, morale: 5 }, category: 'food' },
        { id: 'energy_bar', name: '能量棒', weight: 5, effects: { hunger: 15, stamina: 20 }, category: 'food' },
        { id: 'water_500ml', name: '矿泉水500ml', weight: 10, effects: { thirst: 30 }, category: 'water' },
        { id: 'water_1l', name: '矿泉水1L', weight: 18, effects: { thirst: 60 }, category: 'water' },
        { id: 'sports_drink', name: '运动饮料', weight: 10, effects: { thirst: 25, morale: 10, stamina: 15 }, category: 'water' },
        { id: 'red_bull', name: '红牛', weight: 6, effects: { thirst: 15, stamina: 30, morale: 10 }, category: 'water' },
        { id: 'lighter', name: '打火机', weight: 3, effects: {}, category: 'fire' },
        { id: 'rope', name: '绳索', weight: 10, effects: {}, category: 'tool' },
        { id: 'compass', name: '指南针', weight: 6, effects: {}, category: 'tool' },
        { id: 'tent', name: '帐篷', weight: 25, effects: {}, category: 'shelter' },
        { id: 'first_aid', name: '急救包', weight: 8, effects: { health: 20 }, category: 'medical' },
        { id: 'bandage', name: '绷带', weight: 3, effects: { health: 8 }, category: 'medical' },
        { id: 'painkiller', name: '止痛药', weight: 2, effects: { health: 10, stamina: 15 }, category: 'medical' },
        { id: 'jacket', name: '冲锋衣', weight: 15, effects: {}, category: 'protection' },
        { id: 'hiking_boots', name: '登山靴', weight: 12, effects: {}, category: 'protection' },
        { id: 'satellite_phone', name: '卫星电话', weight: 15, effects: {}, category: 'communication' }
    ],

    dailyEvents: [
        { day: 1, title: '迷路', eventType: '固定事件', desc: '一场突如其来的大雾让你偏离了路线...', options: [
            { text: '使用指南针', require: 'compass', successRate: 1.0, effects: { progress: 15 },
                hint: '有指南针可精准辨别方向', successText: '指南针帮你找到了正确方向！', failText: '' },
            { text: '观察太阳', successRate: 0.5, effects: { morale: -5, progress: 8 },
                hint: '凭经验判断，成功率一般', successText: '你凭着太阳方位摸出了路。', failText: '雾太浓，你转了半天又回到原点。' }
        ]},
        { day: 2, title: '老虎拦路', eventType: '固定事件', desc: '一只华南虎挡住了去路，你吓得浑身发抖...', options: [
            { text: '吼退', successRate: 0.9, effects: { health: -5, morale: -15, stamina: -25, progress: 12 },
                hint: '虚张声势，但有风险', successText: '你一声大吼，老虎悻悻离去！', failText: '老虎不为所动，扑来让你受了伤。' },
            { text: '爬树等待', successRate: 0.7, effects: { morale: -20, stamina: -15, progress: 6 },
                hint: '稳妥但费时', successText: '你爬上大树，等老虎离开。', failText: '树上不稳，你狼狈地摔了下来。' }
        ]},
        { day: 3, title: '受伤驴友', eventType: '支线事件', desc: '你发现一名驴友小腿骨折，急需帮助...', options: [
            { text: '帮助固定伤处', require: 'first_aid', successRate: 1.0, effects: { morale: 30, hunger: -10, thirst: -10, progress: 10 }, quest: true, diary: true,
                hint: '需要急救包', successText: '你成功帮他固定伤处，他感激涕零并留下日记碎片。', failText: '' },
            { text: '无视继续赶路', successRate: 1.0, effects: { morale: -30, progress: 5 },
                hint: '保全自己，但良心难安', successText: '你狠心离开，心头却始终不安。', failText: '' }
        ]},
        { day: 4, title: '食物被盗', eventType: '固定事件', desc: '早晨醒来，你发现部分食物被偷...', options: [
            { text: '追踪脚印', successRate: 0.6, effects: { hunger: -5, morale: -10, progress: 8 },
                hint: '碰运气追回去', successText: '你顺着脚印追回了部分物资！', failText: '脚印消失在乱石中，徒劳而返。' },
            { text: '设陷阱', require: 'rope', successRate: 0.8, effects: { morale: 5, hunger: 10, progress: 10 },
                hint: '需要绳索', successText: '绳索陷阱逮住了偷食的小兽！', failText: '' }
        ]},
        { day: 5, title: '天气突变', eventType: '固定事件', desc: '原本晴朗的天空突然乌云密布，气温骤降...', options: [
            { text: '搭建庇护所', require: 'tent', successRate: 1.0, effects: { morale: 5, bodyTemp: 2, hunger: -8, thirst: -8, progress: 12 },
                hint: '需要帐篷保暖', successText: '帐篷挡风保暖，你安然过夜。', failText: '' },
            { text: '生火取暖', require: 'lighter', successRate: 0.9, effects: { bodyTemp: 1, morale: 5, hunger: -10, thirst: -10, progress: 10 },
                hint: '需要打火机', successText: '篝火驱散了寒意。', failText: '打火石受潮，火没生起来，你冻得发抖。' }
        ]},
        { day: 6, title: '断崖拦路', eventType: '固定事件', desc: '前方出现一道断崖，稍有不慎就会坠崖...', options: [
            { text: '绕行', successRate: 0.8, effects: { hunger: -10, thirst: -10, stamina: -20, progress: 8 },
                hint: '安全但耗体力', successText: '你绕了远路，平安通过。', failText: '绕行迷了路，白白耗费精力。' },
            { text: '绳索下降', require: 'rope', successRate: 0.7, effects: { health: -15, stamina: -25, progress: 6 },
                hint: '需要绳索，刺激但危险', successText: '你顺着绳索稳稳下降。', failText: '绳索磨损断裂，你跌落受伤！' }
        ]},
        { day: 7, title: '溪流横亘', eventType: '固定事件', desc: '一条湍急的溪流挡住了去路，冰冷刺骨...', options: [
            { text: '寻找桥梁', successRate: 0.7, effects: { morale: -5, hunger: -10, thirst: -5, stamina: -20, progress: 10 }, diary: true,
                hint: '稳妥但费时', successText: '你找到一座朽木桥过了河，桥边拾得日记碎片。', failText: '找了半天没桥，只能原路返回。' },
            { text: '蹚水过河', successRate: 0.6, effects: { bodyTemp: -2, hunger: -10, thirst: -5, stamina: -25, health: -10, progress: 8 },
                hint: '最快但极易失温', successText: '你咬牙蹚过冰河，浑身湿透。', failText: '水流太急，你被冲倒呛了好几口水。' }
        ]},
        { day: 8, title: '补给耗尽', eventType: '固定事件', desc: '你的食物和水源快用完了，身体开始虚弱...', options: [
            { text: '节省配给', successRate: 0.8, effects: { hunger: -15, thirst: -15, stamina: -20, progress: 6 },
                hint: '勒紧裤腰带', successText: '你严格控制口粮，撑了过去。', failText: '省得太狠，你眼前发黑。' },
            { text: '寻找野果', successRate: 0.5, effects: { hunger: 20, health: -10, stamina: -15, progress: 5 },
                hint: '冒险但能饱腹', successText: '你采到野果填饱了肚子。', failText: '野果有毒，你上吐下泻。' }
        ]},
        { day: 9, title: '体能极限', eventType: '固定事件', desc: '连日的奔波让你精疲力竭，脚步沉重...', options: [
            { text: '休息半天', successRate: 1.0, effects: { stamina: 30, hunger: -15, thirst: -15, progress: 4 },
                hint: '恢复体能但进度慢', successText: '半天休整让你恢复了元气。', failText: '' },
            { text: '咬牙坚持', successRate: 0.6, effects: { stamina: -25, morale: -20, health: -10, progress: 10 },
                hint: '进度快但伤身', successText: '你硬撑着又走了一段。', failText: '你一头栽倒，差点没爬起来。' }
        ]},
        { day: 10, title: '最后冲刺', eventType: '固定事件', desc: '终点就在眼前，但体力已接近极限，身体极度疲惫...', options: [
            { text: '全力冲刺', successRate: 0.5, effects: { stamina: -30, health: -15, hunger: -10, thirst: -10, progress: 20 },
                hint: '高风险高回报', successText: '你爆发出最后的力量冲过了终点线！', failText: '冲刺中踉跄倒地，功亏一篑。' },
            { text: '稳步前进', successRate: 0.9, effects: { stamina: -20, hunger: -8, thirst: -8, progress: 12 }, diary: true,
                hint: '稳健可靠', successText: '你稳步走完最后一段，捡到一片日记碎片。', failText: '' }
        ]},
        { day: 11, title: '迷雾再起', eventType: '固定事件', desc: '苍岭山脉的怪雾再次袭来，能见度不足五米...', options: [
            { text: '用指南针定向', require: 'compass', successRate: 1.0, effects: { progress: 14 },
                hint: '需要指南针', successText: '指南针在迷雾中依然可靠！', failText: '' },
            { text: '凭地形记忆', successRate: 0.6, effects: { morale: -5, stamina: -10, progress: 8 },
                hint: '赌一把', successText: '你依稀记得地形，勉强穿出。', failText: '你在雾里兜了圈子。' }
        ]},
        { day: 12, title: '熊出没', eventType: '固定事件', desc: '一头黑熊在林间翻找食物，闻到你的气味...', options: [
            { text: '缓慢后退', successRate: 0.8, effects: { morale: -10, stamina: -10, progress: 10 },
                hint: '不惊动它', successText: '你屏息退开，黑熊没在意。', failText: '你踩断枯枝，黑熊朝你逼近！' },
            { text: '爬树躲避', successRate: 0.7, effects: { stamina: -20, progress: 6 },
                hint: '熊不会爬树', successText: '你爬上树等熊离开。', failText: '树太细，你差点掉下来。' }
        ]},
        { day: 13, title: '暴雨山洪', eventType: '固定事件', desc: '暴雨引发山洪，河水暴涨，气温骤降...', options: [
            { text: '搭建庇护所', require: 'tent', successRate: 1.0, effects: { morale: 5, bodyTemp: 2, hunger: -8, thirst: -8, progress: 11 },
                hint: '需要帐篷', successText: '帐篷帮你熬过暴雨夜。', failText: '' },
            { text: '生火烘干', require: 'lighter', successRate: 0.9, effects: { bodyTemp: 1, morale: 5, hunger: -10, thirst: -10, progress: 9 },
                hint: '需要打火机', successText: '火堆烘干了衣物，暖意回升。', failText: '雨水浇灭了火，你瑟瑟发抖。' }
        ]},
        { day: 14, title: '废弃营地', eventType: '支线事件', desc: '你发现一处早年驴友留下的废弃营地，似乎有可用物资...', options: [
            { text: '仔细搜寻', successRate: 0.8, effects: { hunger: 15, thirst: 15, morale: 10, progress: 8 }, diary: true,
                hint: '可能有补给和线索', successText: '你找到罐头、净水片和一片日记碎片！', failText: '营地早已被洗劫一空。' },
            { text: '匆匆离开', successRate: 1.0, effects: { progress: 5 },
                hint: '不想节外生枝', successText: '你加快脚步离开了。', failText: '' }
        ]},
        { day: 15, title: '终焉垭口', eventType: '固定事件', desc: '最后一道垭口横在面前，翻过去就是文明的边界...', options: [
            { text: '全力翻越', successRate: 0.6, effects: { stamina: -25, health: -10, hunger: -10, thirst: -10, progress: 22 },
                hint: '一鼓作气', successText: '你翻过垭口，看见了远处的公路！', failText: '垭口风雪太大，你被迫撤回。' },
            { text: '稳步攀行', successRate: 0.9, effects: { stamina: -15, hunger: -8, thirst: -8, progress: 14 },
                hint: '稳妥登顶', successText: '你一步一步登顶，苍岭已在脚下。', failText: '' }
        ]}
    ],

    randomEvents: [
        { title: '林间小溪', eventType: '随机事件', desc: '你意外发现一条清澈山溪，水质看着不错...', options: [
            { text: '直接饮用', successRate: 0.5, effects: { thirst: 25, health: -10, progress: 4 },
                hint: '解渴但有寄生虫风险', successText: '溪水甘甜，你痛快喝饱。', failText: '水里有寄生虫，你上吐下泻。' },
            { text: '谨慎前行', successRate: 1.0, effects: { progress: 3 },
                hint: '不冒险', successText: '你没碰生水，继续赶路。', failText: '' }
        ]},
        { title: '坠落陷阱', eventType: '随机事件', desc: '你脚下一空，半只腿陷进了猎人废弃的陷阱...', options: [
            { text: '自救脱困', successRate: 0.7, effects: { health: -10, stamina: -15, progress: 5 },
                hint: '靠自己挣脱', successText: '你咬牙把腿拔了出来。', failText: '陷阱卡得太死，你挣扎半天。' },
            { text: '用绳索固定', require: 'rope', successRate: 0.95, effects: { stamina: -5, progress: 6 },
                hint: '需要绳索', successText: '绳索帮你稳稳脱困。', failText: '' }
        ]},
        { title: '采到蘑菇', eventType: '随机事件', desc: '林间长着一片肥美的蘑菇，但你不确认有毒没毒...', options: [
            { text: '采来充饥', successRate: 0.6, effects: { hunger: 25, health: -15, progress: 3 },
                hint: '可能有毒', successText: '蘑菇鲜美，你饱餐一顿。', failText: '蘑菇有毒，你腹痛难忍！' },
            { text: '不碰为妙', successRate: 1.0, effects: { progress: 2 },
                hint: '安全第一', successText: '你绕开了蘑菇。', failText: '' }
        ]},
        { title: '夜遇狼群', eventType: '随机事件', desc: '夜里篝火旁，远处响起狼嚎，绿莹莹的眼睛围了上来...', options: [
            { text: '生火驱赶', require: 'lighter', successRate: 0.85, effects: { morale: -10, stamina: -10, progress: 5 },
                hint: '需要打火机', successText: '火光吓退了狼群。', failText: '' },
            { text: '爬上岩石', successRate: 0.7, effects: { stamina: -15, morale: -5, progress: 4 },
                hint: '狼不会上岩', successText: '你退到巨石上，狼群无功而返。', failText: '岩石太矮，狼爪够到了你！' }
        ]},
        { title: '旧背包', eventType: '随机事件', desc: '路边丢弃着一个破旧背包，似乎还有东西...', options: [
            { text: '翻找一番', successRate: 0.8, effects: { hunger: 10, thirst: 10, morale: 5, progress: 4 }, diary: true,
                hint: '可能有惊喜', successText: '你找到能量棒、矿泉水和一片日记碎片！', failText: '背包里只剩潮湿的破布。' },
            { text: '不理会', successRate: 1.0, effects: { progress: 2 },
                hint: '怕有陷阱', successText: '你没去碰它。', failText: '' }
        ]}
    ],

    statLabels: { health: '生命值', hunger: '饱腹度', thirst: '水分', morale: '士气', bodyTemp: '体温', stamina: '体能' }
};

// 日记碎片：前驴友留下的求生手记（按收集顺序）
var diaryTexts = [
    '「第3天：遇见一个迷路的孩子，我分了半块巧克力给他。善意或许撑不过荒野，但能撑过今夜。」',
    '「第7天：在溪边捡到这支旧笔。若有人读到，说明你我皆曾与死神擦肩。」',
    '「第10天：风雪里我几乎放弃，可山顶那缕光，是文明在向我招手。」',
    '「第14天：营地空了，但我留了这页纸——别独自上路，山不识人心。」',
    '「终章：我活下来了。请把这些字句，带给下一个不肯认输的人。」'
];

// ==================== 初始化 ===================
function init() {
    var startBtn = document.getElementById('start-story-btn');
    if (startBtn) startBtn.onclick = function() {
        var overlay = document.getElementById('tutorial-overlay');
        if (overlay) overlay.style.display = 'flex';
    };

    var continueBtn = document.getElementById('continue-btn');
    if (continueBtn) {
        if (hasSave()) continueBtn.style.display = 'block';
        continueBtn.onclick = function() {
            var data = loadGame();
            if (data) {
                applyLoadedSave(data);
            }
        };
    }

    var skipBtn = document.getElementById('skip-tutorial-btn');
    if (skipBtn) skipBtn.onclick = function() {
        var overlay = document.getElementById('tutorial-overlay');
        if (overlay) overlay.style.display = 'none';
        switchScreen('backpack-screen');
    };

    var nextBtn = document.getElementById('next-step-btn');
    if (nextBtn) nextBtn.onclick = function() {
        var overlay = document.getElementById('tutorial-overlay');
        if (!overlay) return;
        var steps = overlay.querySelectorAll('.tutorial-step');
        var dots = overlay.querySelectorAll('.dot');
        var currentStep = -1;
        for (var i = 0; i < steps.length; i++) {
            if (steps[i].classList.contains('active')) { currentStep = i; break; }
        }
        if (currentStep < steps.length - 1) {
            steps[currentStep].classList.remove('active');
            dots[currentStep].classList.remove('active');
            steps[currentStep + 1].classList.add('active');
            dots[currentStep + 1].classList.add('active');
            var prevBtn = document.getElementById('prev-step-btn');
            if (prevBtn) prevBtn.style.display = 'inline-block';
            if (currentStep + 1 === steps.length - 1) nextBtn.textContent = '开始选背包';
        } else {
            overlay.style.display = 'none';
            switchScreen('backpack-screen');
        }
    };

    var prevBtn = document.getElementById('prev-step-btn');
    if (prevBtn) prevBtn.onclick = function() {
        var overlay = document.getElementById('tutorial-overlay');
        if (!overlay) return;
        var steps = overlay.querySelectorAll('.tutorial-step');
        var dots = overlay.querySelectorAll('.dot');
        var currentStep = -1;
        for (var i = 0; i < steps.length; i++) {
            if (steps[i].classList.contains('active')) { currentStep = i; break; }
        }
        if (currentStep > 0) {
            steps[currentStep].classList.remove('active');
            dots[currentStep].classList.remove('active');
            steps[currentStep - 1].classList.add('active');
            dots[currentStep - 1].classList.add('active');
            if (currentStep - 1 === 0) this.style.display = 'none';
            var nextBtn = document.getElementById('next-step-btn');
            if (nextBtn) nextBtn.textContent = '下一步';
        }
    };

    renderBackpacks();
    switchScreen('story-screen');
}

// ==================== 界面切换 ===================
function switchScreen(screenId) {
    var screens = document.querySelectorAll('.screen');
    for (var i = 0; i < screens.length; i++) {
        screens[i].classList.remove('active');
    }
    var target = document.getElementById(screenId);
    if (target) target.classList.add('active');
}

// ==================== 背包选择 ===================
function renderBackpacks() {
    var container = document.getElementById('backpack-options');
    if (!container) return;
    container.innerHTML = '';
    for (var i = 0; i < game.backpacks.length; i++) {
        var bp = game.backpacks[i];
        var card = document.createElement('div');
        card.className = 'backpack-card';
        card.innerHTML = '<h3>' + bp.name + '</h3>' +
            '<div>容量: ' + bp.cap + ' 重量单位</div>';
        (function(bpData, el) {
            el.onclick = function() { selectBackpack(bpData, el); };
        })(bp, card);
        container.appendChild(card);
    }
}

function selectBackpack(bp, cardElement) {
    game.backpack = bp;
    game.inventory = [];
    var cards = document.querySelectorAll('.backpack-card');
    for (var i = 0; i < cards.length; i++) {
        cards[i].classList.remove('selected');
    }
    if (cardElement) cardElement.classList.add('selected');
    var capEl = document.getElementById('total-capacity');
    if (capEl) capEl.textContent = bp.cap;
    updateCapacity();
    switchScreen('item-screen');
    renderItemList();
}

// ==================== 物品选择 ===================
function renderItemList() {
    var container = document.getElementById('item-categories');
    if (!container) { console.error('item-categories not found'); return; }
    container.innerHTML = '';
    if (!game.backpack) { console.error('No backpack'); return; }

    var categories = {
        'food': '食物类', 'water': '水源类', 'fire': '火源类',
        'tool': '工具类', 'medical': '医疗类', 'shelter': '宿营类',
        'protection': '防护类', 'communication': '通信类'
    };

    var usedWeight = getUsedWeight();
    var catKeys = Object.keys(categories);
    for (var c = 0; c < catKeys.length; c++) {
        var catId = catKeys[c];
        var catName = categories[catId];
        var catItems = [];
        for (var j = 0; j < game.items.length; j++) {
            if (game.items[j].category === catId) catItems.push(game.items[j]);
        }
        if (catItems.length === 0) continue;

        var section = document.createElement('div');
        section.className = 'category-section';
        section.innerHTML = '<div class="category-title">' + catName + '</div><div class="category-items"></div>';
        var itemsContainer = section.querySelector('.category-items');

        for (var k = 0; k < catItems.length; k++) {
            var item = catItems[k];
            var invItem = null;
            for (var m = 0; m < game.inventory.length; m++) {
                if (game.inventory[m].id === item.id) { invItem = game.inventory[m]; break; }
            }
            var quantity = invItem ? invItem.quantity : 0;
            var canAdd = usedWeight + item.weight <= game.backpack.cap;

            var card = document.createElement('div');
            card.className = 'item-card' + (quantity > 0 ? ' selected' : '');
            card.style.opacity = (!canAdd && quantity === 0) ? '0.5' : '1';
            card.style.cursor = (!canAdd && quantity === 0) ? 'not-allowed' : 'pointer';

            var qtyHtml = '';
            if (quantity > 0) {
                qtyHtml = '<div class="qty-row">' +
                    '<button class="qty-btn-minus" data-id="' + item.id + '">−</button>' +
                    '<span class="qty-num">' + quantity + '</span>' +
                    '<button class="qty-btn-plus" data-id="' + item.id + '">+</button>' +
                    '</div>';
            } else {
                qtyHtml = '<button class="qty-btn-plus add-btn" data-id="' + item.id + '">+ 添加</button>';
            }

            card.innerHTML = '<div class="item-name">' + item.name + '</div>' +
                '<div class="item-weight">重量: ' + item.weight + '</div>' +
                '<div class="item-effect">' + getEffectText(item) + '</div>' +
                qtyHtml;

            if (canAdd || quantity > 0) {
                (function(itm) {
                    card.onclick = function(e) {
                        if (e.target.classList.contains('qty-btn-plus') || e.target.classList.contains('qty-btn-minus')) return;
                        toggleItem(itm);
                    };
                })(item);
            }
            itemsContainer.appendChild(card);
        }
        container.appendChild(section);
    }

    // 事件委托
    container.onclick = function(e) {
        var target = e.target;
        if (target.classList.contains('qty-btn-plus')) {
            addItem(target.getAttribute('data-id'));
        } else if (target.classList.contains('qty-btn-minus')) {
            removeItem(target.getAttribute('data-id'));
        }
    };

    updateCapacity();

    var startBtn = document.getElementById('start-game-btn');
    if (startBtn) {
        var totalItems = 0;
        for (var i = 0; i < game.inventory.length; i++) totalItems += game.inventory[i].quantity || 1;
        startBtn.disabled = totalItems === 0;
        startBtn.onclick = startGame;
    }
}

function toggleItem(item) {
    var idx = -1;
    for (var i = 0; i < game.inventory.length; i++) {
        if (game.inventory[i].id === item.id) { idx = i; break; }
    }
    if (idx > -1) {
        if (getUsedWeight() + item.weight <= game.backpack.cap) {
            game.inventory[idx].quantity++;
            addLog('增加 ' + item.name + ' 数量: ' + game.inventory[idx].quantity, 'good');
        } else {
            addLog('容量不足，无法再增加 ' + item.name, 'warning');
        }
    } else {
        if (getUsedWeight() + item.weight <= game.backpack.cap) {
            game.inventory.push({ id: item.id, name: item.name, weight: item.weight, effects: item.effects, category: item.category, quantity: 1 });
            addLog('添加 ' + item.name + ' x1', 'good');
        } else {
            addLog('容量不足，无法添加 ' + item.name, 'warning');
        }
    }
    renderItemList();
}

function addItem(itemId) {
    var itemData = null;
    for (var i = 0; i < game.items.length; i++) {
        if (game.items[i].id === itemId) { itemData = game.items[i]; break; }
    }
    if (!itemData) return;
    var idx = -1;
    for (var i = 0; i < game.inventory.length; i++) {
        if (game.inventory[i].id === itemId) { idx = i; break; }
    }
    if (idx > -1) {
        if (getUsedWeight() + itemData.weight <= game.backpack.cap) {
            game.inventory[idx].quantity++;
            addLog('增加 ' + itemData.name + ' 数量: ' + game.inventory[idx].quantity, 'good');
        }
    } else {
        if (getUsedWeight() + itemData.weight <= game.backpack.cap) {
            game.inventory.push({ id: itemData.id, name: itemData.name, weight: itemData.weight, effects: itemData.effects, category: itemData.category, quantity: 1 });
            addLog('添加 ' + itemData.name + ' x1', 'good');
        }
    }
    renderItemList();
}

function removeItem(itemId) {
    var idx = -1;
    for (var i = 0; i < game.inventory.length; i++) {
        if (game.inventory[i].id === itemId) { idx = i; break; }
    }
    if (idx === -1) return;
    var item = game.inventory[idx];
    if (item.quantity > 1) {
        item.quantity--;
        addLog('减少 ' + item.name + ' 数量: ' + item.quantity, 'info');
    } else {
        game.inventory.splice(idx, 1);
        addLog('移除 ' + item.name, 'info');
    }
    renderItemList();
}

// 游戏过程中消耗背包物品（刷新游戏内背包，不触发选物界面）
function consumeRequiredItem(itemId) {
    if (!itemId) return;
    for (var i = 0; i < game.inventory.length; i++) {
        if (game.inventory[i].id === itemId) {
            game.inventory[i].quantity--;
            if (game.inventory[i].quantity <= 0) game.inventory.splice(i, 1);
            addLog('消耗了 ' + getItemName(itemId), 'info');
            renderInventory();
            break;
        }
    }
}

function getUsedWeight() {
    var total = 0;
    for (var i = 0; i < game.inventory.length; i++) {
        total += game.inventory[i].weight * (game.inventory[i].quantity || 1);
    }
    return total;
}

function updateCapacity() {
    var used = getUsedWeight();
    var cap = game.backpack ? game.backpack.cap : 0;
    var usedEl = document.getElementById('used-weight');
    var fillEl = document.getElementById('capacity-fill');
    if (usedEl) usedEl.textContent = used;
    if (fillEl) fillEl.style.width = Math.min(100, (used / cap) * 100) + '%';
}

function getItemName(itemId) {
    if (!itemId) return itemId;
    for (var i = 0; i < game.items.length; i++) {
        if (game.items[i].id === itemId) return game.items[i].name;
    }
    return itemId;
}

function inventoryHasCategory(cat) {
    for (var i = 0; i < game.inventory.length; i++) {
        if (game.inventory[i].category === cat && game.inventory[i].quantity > 0) return true;
    }
    return false;
}

function findItemNameByCategory(cat) {
    for (var i = 0; i < game.inventory.length; i++) {
        if (game.inventory[i].category === cat && game.inventory[i].quantity > 0) return game.inventory[i].name;
    }
    return '';
}

function inventoryHasStaminaItem() {
    for (var i = 0; i < game.inventory.length; i++) {
        if (game.inventory[i].effects && game.inventory[i].effects.stamina && game.inventory[i].quantity > 0) return true;
    }
    return false;
}

function findStaminaItemName() {
    for (var i = 0; i < game.inventory.length; i++) {
        if (game.inventory[i].effects && game.inventory[i].effects.stamina && game.inventory[i].quantity > 0) return game.inventory[i].name;
    }
    return '';
}

function showConfirm(message, onYes, onNo) {
    var overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';
    overlay.innerHTML = '<div class="confirm-box">' +
        '<p class="confirm-msg"></p>' +
        '<div class="confirm-btns">' +
        '<button class="confirm-no">再想想</button>' +
        '<button class="confirm-yes">硬撑继续</button>' +
        '</div></div>';
    overlay.querySelector('.confirm-msg').textContent = message;
    overlay.querySelector('.confirm-yes').onclick = function() {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        if (onYes) onYes();
    };
    overlay.querySelector('.confirm-no').onclick = function() {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        if (onNo) onNo();
    };
    document.body.appendChild(overlay);
}

function getEffectText(item) {    if (!item.effects || Object.keys(item.effects).length === 0) return '工具';
    var effects = [];
    var keys = Object.keys(item.effects);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var val = item.effects[key];
        var label = game.statLabels[key] || key;
        effects.push(label + (val > 0 ? '+' : '') + val);
    }
    return effects.join(', ');
}

// ==================== 游戏主逻辑 ===================
function startGame() {
    if (!game.backpack) { alert('请先选择背包！'); return; }
    if (game.inventory.length === 0) { alert('请先选择至少一件物品！'); return; }

    game.currentDay = 1;
    game.progress = 0;
    game.player = { health: 100, hunger: 100, thirst: 100, morale: 100, bodyTemp: 36.5, stamina: 100 };
    game.eventLog = [];
    game.diaryFragments = 0;
    game.sideQuestCompleted = false;

    addLog('游戏开始！你精力充沛地踏上了苍岭山脉的求生之旅。', 'info');
    var totalItems = 0;
    for (var i = 0; i < game.inventory.length; i++) totalItems += game.inventory[i].quantity || 1;
    addLog('选择了 ' + game.backpack.name + '，携带了 ' + totalItems + ' 件物品。', 'info');

    switchScreen('game-screen');
    renderGame();
}

function renderGame() {
    var dayNumEl = document.getElementById('day-number');
    if (dayNumEl) dayNumEl.textContent = game.currentDay;
    var fc = document.getElementById('fragment-count');
    if (fc) fc.textContent = game.diaryFragments;
    renderStats();
    renderInventory();
    renderEvent();
    renderProgress();
    saveGame();
}

// ==================== 存档系统 ===================
var SAVE_KEY = 'cangling_survival_save';

function saveGame() {
    try {
        if (!game.backpack) return;
        var data = {
            backpackId: game.backpack.id,
            inventory: game.inventory,
            currentDay: game.currentDay,
            progress: game.progress,
            diaryFragments: game.diaryFragments,
            sideQuestCompleted: game.sideQuestCompleted,
            maxDays: game.maxDays,
            player: game.player,
            eventLog: game.eventLog
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (e) { /* localStorage 不可用时静默忽略 */ }
}

function loadGame() {
    try {
        var raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (e) { return null; }
}

function hasSave() {
    return loadGame() !== null;
}

function clearSave() {
    try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
}

function applyLoadedSave(data) {
    if (!data) return;
    game.backpack = null;
    for (var i = 0; i < game.backpacks.length; i++) {
        if (game.backpacks[i].id === data.backpackId) { game.backpack = game.backpacks[i]; break; }
    }
    game.inventory = data.inventory || [];
    game.currentDay = data.currentDay;
    game.progress = data.progress;
    game.diaryFragments = data.diaryFragments || 0;
    game.sideQuestCompleted = data.sideQuestCompleted || false;
    game.maxDays = data.maxDays || 15;
    game.player = data.player || { health: 100, hunger: 100, thirst: 100, morale: 100, bodyTemp: 36.5, stamina: 100 };
    game.eventLog = data.eventLog || [];
    addLog('读取存档，继续你的求生之旅。', 'info');
    switchScreen('game-screen');
    renderGame();
}

function renderProgress() {
    var bar = document.getElementById('progress-fill');
    var label = document.getElementById('progress-label');
    if (bar) bar.style.width = Math.min(100, game.progress) + '%';
    if (label) label.textContent = '前进进度: ' + Math.min(100, game.progress) + '%';
}

function renderStats() {
    var container = document.getElementById('stats');
    if (!container) return;
    container.innerHTML = '';
    var keys = Object.keys(game.player);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var val = game.player[key];
        var label = game.statLabels[key] || key;
        var percent = key === 'bodyTemp' ? ((val - 33) / 7) * 100 : (val / 100) * 100;
        var isWarning = (key === 'hunger' || key === 'thirst' || key === 'stamina') && val <= 20;
        var isTempWarning = key === 'bodyTemp' && (val <= 35 || val >= 38);

        var statItem = document.createElement('div');
        statItem.className = 'stat-item' + ((isWarning || isTempWarning) ? ' pulse' : '');
        var fillClass = key === 'bodyTemp' ? 'temp-fill' : (key + '-fill');
        statItem.innerHTML = '<div class="stat-header">' +
            '<span class="stat-label">' + label + '</span>' +
            '<span class="stat-value ' + ((isWarning || isTempWarning) ? 'warning' : '') + '">' + (key === 'bodyTemp' ? val.toFixed(1) : val) + '/100</span>' +
            '</div>' +
            '<div class="progress-bar"><div class="progress-fill ' + fillClass + '" style="width: ' + Math.max(0, Math.min(100, percent)) + '%"></div></div>' +
            '<p class="stat-hint ' + ((isWarning || isTempWarning) ? 'warning' : '') + '">' + getStatHint(key, val) + '</p>';
        container.appendChild(statItem);
    }
}

function getStatHint(key, val) {
    if (key === 'health') { if (val <= 0) return '已死亡'; if (val <= 20) return '生命垂危'; if (val <= 50) return '状态危险'; if (val <= 80) return '亚健康'; return '健康'; }
    if (key === 'hunger') { if (val <= 10) return '即将饿死'; if (val <= 20) return '非常饥饿'; if (val <= 50) return '饥饿'; if (val <= 80) return '尚可'; return '饱足'; }
    if (key === 'thirst') { if (val <= 10) return '即将渴死'; if (val <= 20) return '非常口渴'; if (val <= 50) return '口渴'; if (val <= 80) return '尚可'; return '充足'; }
    if (key === 'morale') { if (val <= 20) return '绝望'; if (val <= 50) return '士气低落'; if (val <= 80) return '正常'; return '高昂'; }
    if (key === 'stamina') { if (val <= 20) return '筋疲力尽'; if (val <= 50) return '体力不支'; if (val <= 80) return '有些疲惫'; return '精力充沛'; }
    if (key === 'bodyTemp') { if (val < 35) return '严重失温！'; if (val <= 35.9) return '失温'; if (val <= 36.9) return '正常偏低'; if (val <= 37.5) return '正常'; if (val <= 38) return '低烧'; if (val <= 39) return '发烧'; return '高烧！'; }
    return '';
}

function renderInventory() {
    var container = document.getElementById('inventory');
    if (!container) return;
    container.innerHTML = '';
    for (var i = 0; i < game.inventory.length; i++) {
        var item = game.inventory[i];
        var div = document.createElement('div');
        div.className = 'inventory-item' + (item.category ? ' ' + item.category : '');
        div.textContent = item.name + ' x' + item.quantity;
        div.title = '点击使用 ' + item.name;
        div.style.cursor = 'pointer';
        (function(invItem) {
            div.onclick = function() { useItem(invItem); };
        })(item);
        container.appendChild(div);
    }
    var invCountEl = document.getElementById('inv-count');
    if (invCountEl) {
        var totalItems = 0;
        for (var i = 0; i < game.inventory.length; i++) totalItems += (game.inventory[i].quantity || 1);
        invCountEl.textContent = totalItems;
    }
}

function useItem(item) {
    if (!item || item.quantity <= 0) return;
    
    // Apply item effects
    if (item.effects && Object.keys(item.effects).length > 0) {
        applyEffects(item.effects);
        addLog('使用了 ' + item.name, 'good');
    } else {
        addLog(item.name + ' 无法使用（工具类物品）', 'warning');
        return;
    }
    
    // Reduce quantity
    item.quantity--;
    if (item.quantity <= 0) {
        var idx = -1;
        for (var i = 0; i < game.inventory.length; i++) {
            if (game.inventory[i].id === item.id) { idx = i; break; }
        }
        if (idx > -1) game.inventory.splice(idx, 1);
        addLog(item.name + ' 已用完', 'info');
    }
    
    renderInventory();
    renderStats();
}

function renderEvent() {
    var eventCard = document.getElementById('event-card');
    if (!eventCard) return;

    var picked = null;
    var RANDOM_CHANCE = 0.25;

    while (game.currentDay <= game.maxDays) {
        var fixedEvent = null;
        for (var i = 0; i < game.dailyEvents.length; i++) {
            if (game.dailyEvents[i].day === game.currentDay) { fixedEvent = game.dailyEvents[i]; break; }
        }

        if (fixedEvent) {
            if (game.randomEvents && game.randomEvents.length > 0 && Math.random() < RANDOM_CHANCE) {
                picked = game.randomEvents[Math.floor(Math.random() * game.randomEvents.length)];
            } else {
                picked = fixedEvent;
            }
            break;
        } else if (game.randomEvents && game.randomEvents.length > 0) {
            // 无固定事件日：抽取随机事件
            picked = game.randomEvents[Math.floor(Math.random() * game.randomEvents.length)];
            break;
        } else {
            // 无事件也无随机事件：基础推进
            applyDailyConsumption();
            game.progress += 5;
            game.currentDay++;
            if (checkGameOver()) return;
            if (game.progress >= 100) { endGame(); return; }
        }
    }

    if (!picked) { endGame(); return; }

    var typeEl = document.getElementById('event-type');
    if (typeEl) typeEl.textContent = picked.eventType || '固定事件';

    applyTheme(picked.title);

    document.getElementById('event-title').textContent = '第' + game.currentDay + '天 - ' + picked.title;
    document.getElementById('event-desc').innerHTML = '<p>' + picked.desc + '</p>';

    var eventCard = document.getElementById('event-card');
    if (eventCard) {
        eventCard.classList.remove('animate');
        void eventCard.offsetWidth;
        eventCard.classList.add('animate');
    }

    var optionsContainer = document.getElementById('event-options');
    optionsContainer.innerHTML = '';

    // 计算推荐选项：可尝试（满足需求）且成功率最高
    var bestRate = -1;
    var optionOk = [];
    for (var r = 0; r < picked.options.length; r++) {
        var ro = picked.options[r];
        var rok = true;
        if (ro.require) {
            rok = false;
            for (var s = 0; s < game.inventory.length; s++) {
                if (game.inventory[s].id === ro.require) { rok = true; break; }
            }
        }
        optionOk.push(rok);
        if (rok && ro.successRate > bestRate) bestRate = ro.successRate;
    }

    for (var j = 0; j < picked.options.length; j++) {
        var option = picked.options[j];
        var optDiv = document.createElement('div');
        optDiv.className = 'event-option';

        var requirementText = '';
        var hasItem = false;
        if (option.require) {
            for (var k = 0; k < game.inventory.length; k++) {
                if (game.inventory[k].id === option.require) { hasItem = true; break; }
            }
            requirementText = hasItem ? '✅ 需要: ' + getItemName(option.require) : '❌ 需要: ' + getItemName(option.require);
        }

        var recommended = optionOk[j] && option.successRate === bestRate && bestRate >= 0.5;

        optDiv.innerHTML = '<div class="option-text">' + option.text + '</div>' +
            '<div class="option-hint">' + (option.hint || '点击选择') + '</div>' +
            (recommended ? '<div class="option-recommend">✅ 推荐</div>' : '') +
            (requirementText ? '<div class="option-requirement">' + requirementText + '</div>' : '');

        (function(evt, opt) {
            optDiv.onclick = function() { selectOption(evt, opt); };
        })(picked, option);

        optionsContainer.appendChild(optDiv);
    }
}

function selectOption(event, option) {
    var checks = [];

    if (game.player.hunger <= 20) {
        var foodName = findItemNameByCategory('food');
        checks.push({
            hasRes: inventoryHasCategory('food'),
            warn: foodName ? '⚠️ 太饿了！建议先点击背包中的「' + foodName + '」补充饱腹度！'
                          : '⚠️ 太饿了！建议先补充饱腹度！',
            msg: '⚠️ 太饿了！你没有食物了。是否硬撑继续？（将受到额外惩罚）',
            penalty: { hunger: -20, health: -15, stamina: -30, morale: -20 },
            penaltyMsg: '你强忍着饥饿继续前进，身体受到严重损耗！'
        });
    }
    if (game.player.thirst <= 20) {
        var waterName = findItemNameByCategory('water');
        checks.push({
            hasRes: inventoryHasCategory('water'),
            warn: waterName ? '⚠️ 太渴了！建议先点击背包中的「' + waterName + '」补充水分！'
                           : '⚠️ 太渴了！建议先补充水分！',
            msg: '⚠️ 太渴了！你没有水了。是否硬撑继续？（将受到额外惩罚）',
            penalty: { thirst: -20, health: -15, stamina: -30, morale: -20 },
            penaltyMsg: '你强忍着口渴继续前进，身体受到严重损耗！'
        });
    }
    if (game.player.stamina <= 20) {
        var stamName = findStaminaItemName();
        checks.push({
            hasRes: inventoryHasStaminaItem(),
            warn: stamName ? '⚠️ 体力不支！建议先点击背包中的「' + stamName + '」恢复体能！'
                          : '⚠️ 体力不支！建议先恢复体能！',
            msg: '⚠️ 体力不支！你没有恢复体能的物品。是否硬撑继续？（将受到额外惩罚）',
            penalty: { stamina: -30, health: -15, hunger: -10, thirst: -10 },
            penaltyMsg: '你强撑着疲惫的身体继续前进，身体受到严重损耗！'
        });
    }

    runChecks(checks, 0, function(ok) {
        if (ok) proceedResolve(event, option);
    });
}

function runChecks(checks, idx, done) {
    if (idx >= checks.length) { done(true); return; }
    var c = checks[idx];
    if (c.hasRes) {
        addLog(c.warn, 'warning');
        runChecks(checks, idx + 1, done);
        return;
    }
    showConfirm(c.msg, function() {
        applyEffects(c.penalty);
        addLog(c.penaltyMsg, 'bad');
        runChecks(checks, idx + 1, done);
    }, function() {
        addLog(c.warn, 'warning');
        done(false);
    });
}

function proceedResolve(event, option) {
    var hasItem = true;
    if (option.require) {
        hasItem = false;
        for (var i = 0; i < game.inventory.length; i++) {
            if (game.inventory[i].id === option.require) { hasItem = true; break; }
        }
    }

    var success = hasItem ? (Math.random() < option.successRate) : false;

    showRoll(option, success, function() {
        resolveOption(event, option, success, hasItem);
    });
}

function resolveOption(event, option, success, hasItem) {
    var progressGain = 5; // 默认进度（缺少物品或失败）

    if (!hasItem) {
        // 缺少必需物品：视为失败
        addLog('❌ 缺少必要物品: ' + getItemName(option.require) + '，只能硬着头皮上！', 'warning');
        applyEffects({ hunger: -10, thirst: -10, stamina: -15 });
        progressGain = 5;
        showFloatEmoji('💥');
    } else {
        // 仅一次性消耗品（食物/水/医疗）在使用时扣减，工具类保留
        if (option.require) {
            var reqItem = null;
            for (var i = 0; i < game.inventory.length; i++) {
                if (game.inventory[i].id === option.require) { reqItem = game.inventory[i]; break; }
            }
            if (reqItem && (reqItem.category === 'food' || reqItem.category === 'water' || reqItem.category === 'medical')) {
                consumeRequiredItem(option.require);
            }
        }
        if (success) {
            var msg = option.successText || (event.title + ' - ' + option.text + ' 成功！');
            addLog('✅ ' + msg, 'good');
            if (option.effects) applyEffects(option.effects);
            showFloatEmoji('✨');
            if (option.quest) {
                game.sideQuestCompleted = true;
                addLog('支线任务完成：成功救助受伤驴友！', 'good');
            }
            if (option.diary) {
                game.diaryFragments++;
                addLog('📖 收集到一片日记碎片！(' + game.diaryFragments + '/5)', 'good');
                var fc = document.getElementById('fragment-count');
                if (fc) fc.textContent = game.diaryFragments;
                showFragment(diaryTexts[game.diaryFragments - 1]);
            }
            progressGain = (option.effects && option.effects.progress) ? option.effects.progress : 12;
        } else {
            var msg = option.failText || (event.title + ' - ' + option.text + ' 失败！');
            addLog('❌ ' + msg, 'bad');
            showFloatEmoji('💥');
            progressGain = 6;
        }
    }

    // 体能影响前进进度
    var staminaMultiplier = 0.5 + (game.player.stamina / 100) * 0.8;
    var finalProgress = Math.round(progressGain * staminaMultiplier);

    game.currentDay++;
    game.progress += finalProgress;
    addLog('前进进度 +' + finalProgress + '% (体能影响: ' + (staminaMultiplier * 100).toFixed(0) + '%)', 'info');

    // 每日消耗
    applyDailyConsumption();

    if (!checkGameOver()) {
        if (game.progress >= 100) {
            endGame();
        } else if (game.currentDay <= game.maxDays) {
            renderGame();
        } else {
            endGame();
        }
    }
}

// ==================== 视觉演出 ====================
function showRoll(option, success, callback) {
    var overlay = document.getElementById('roll-overlay');
    var dice = document.getElementById('dice');
    var info = document.getElementById('roll-info');
    if (!overlay || !dice) { callback(); return; }

    var rate = option.successRate != null ? option.successRate : 1;
    var need = Math.round(rate * 100);
    var rolled = Math.floor(Math.random() * 100) + 1;

    overlay.style.display = 'flex';
    dice.style.animation = 'none';
    void dice.offsetWidth;
    dice.style.animation = '';

    var delay = 720;
    setTimeout(function() {
        var ok = success;
        info.innerHTML = '掷出 <strong>' + rolled + '</strong> / 需 ≤ ' + need +
            ' &nbsp;→&nbsp; <span class="' + (ok ? 'good' : 'bad') + '">' + (ok ? '成功！' : '失败…') + '</span>';
        dice.textContent = ok ? '🎉' : '💢';
        setTimeout(function() {
            overlay.style.display = 'none';
            info.innerHTML = '';
            dice.textContent = '🎲';
            callback();
        }, 520);
    }, delay);
}

function showFloatEmoji(emoji) {
    var el = document.createElement('div');
    el.className = 'float-emoji';
    el.textContent = emoji;
    document.body.appendChild(el);
    setTimeout(function() {
        if (el.parentNode) el.parentNode.removeChild(el);
    }, 1100);
}

function showFragment(text) {
    var popup = document.getElementById('diary-popup');
    var txt = document.getElementById('diary-text');
    if (!popup || !txt) return;
    txt.textContent = text || '';
    popup.style.display = 'flex';
    var closeBtn = document.getElementById('diary-close');
    if (closeBtn) closeBtn.onclick = function() { popup.style.display = 'none'; };
}

function pickTheme(title) {
    if (/雾|迷路/.test(title)) return 'fog';
    if (/夜|虎|熊|狼/.test(title)) return 'night';
    if (/雨|洪|溪|天气突变/.test(title)) return 'storm';
    if (/营|垭|冲刺|极限|驴友|断崖/.test(title)) return 'dawn';
    return '';
}

function applyTheme(title) {
    var theme = pickTheme(title);
    document.body.className = theme ? 'theme-' + theme : '';
}

function applyEffects(effects) {
    if (!effects) return;
    var keys = Object.keys(effects);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var val = effects[key];
        if (key === 'progress') {
            // Progress is handled separately in selectOption
            continue;
        }
        if (key in game.player) {
            var oldVal = game.player[key];
            if (key === 'bodyTemp') {
                game.player[key] = Math.max(30, Math.min(42, game.player[key] + val));
            } else {
                game.player[key] = Math.max(0, Math.min(100, game.player[key] + val));
            }
            var diff = game.player[key] - oldVal;
            if (diff !== 0) {
                addLog(game.statLabels[key] + (diff > 0 ? '+' : '') + diff, diff > 0 ? 'good' : 'bad');
            }
        }
    }
}

function applyDailyConsumption() {
    applyEffects({ hunger: -12, thirst: -12, stamina: -15 });
    addLog('每日消耗：饱腹度-12，水分-12，体能-15', 'info');
}

function checkGameOver() {
    if (game.player.health <= 0) { endGame(true, '生命值耗尽'); return true; }
    if (game.player.hunger <= 0) { endGame(true, '饥饿过度'); return true; }
    if (game.player.thirst <= 0) { endGame(true, '口渴过度'); return true; }
    if (game.player.bodyTemp < 35) { endGame(true, '失温死亡'); return true; }
    return false;
}

// ==================== 事件日志 ===================
function addLog(message, type) {
    type = type || 'info';
    var now = new Date();
    var timestamp = (now.getHours() < 10 ? '0' : '') + now.getHours() + ':' +
        (now.getMinutes() < 10 ? '0' : '') + now.getMinutes() + ':' +
        (now.getSeconds() < 10 ? '0' : '') + now.getSeconds();
    game.eventLog.push({ message: message, type: type, timestamp: timestamp });
    if (game.eventLog.length > 50) game.eventLog.shift();
    renderLog();
}

function renderLog() {
    var logContent = document.getElementById('log-content');
    if (!logContent) return;
    var recentLogs = game.eventLog.slice(-20); // 从10改为20
    var html = '';
    for (var i = 0; i < recentLogs.length; i++) {
        html += '<div class="log-entry ' + recentLogs[i].type + '">[' + recentLogs[i].timestamp + '] ' + recentLogs[i].message + '</div>';
    }
    logContent.innerHTML = html;
    logContent.scrollTop = logContent.scrollHeight;
}

function clearLog() {
    game.eventLog = [];
    renderLog();
}

// ==================== 结局系统 ===================
function endGame(failed, reason) {
    clearSave();
    var ro = document.getElementById('roll-overlay');
    if (ro) ro.style.display = 'none';
    var dp = document.getElementById('diary-popup');
    if (dp) dp.style.display = 'none';
    switchScreen('end-screen');
    var title = document.getElementById('end-title');
    var message = document.getElementById('end-message');
    var icon = document.getElementById('end-icon');
    var stats = document.getElementById('end-stats');
    var story = document.getElementById('end-story');

    var h = game.player.health, hu = game.player.hunger, t = game.player.thirst,
        m = game.player.morale, bt = game.player.bodyTemp, st = game.player.stamina;

    if (failed) {
        var ft = getFailTitle(reason, h, hu, t, m, bt, st);
        title.textContent = ft.title;
        icon.textContent = ft.icon;
        message.textContent = ft.message;
        story.innerHTML = ft.story;
    } else {
        var stObj = getSuccessTitle(h, hu, t, m, bt, st);
        title.textContent = stObj.title;
        icon.textContent = stObj.icon;
        message.textContent = stObj.message;
        story.innerHTML = stObj.story;
    }

    // 成就徽章
    var badgesEl = document.getElementById('badges');
    if (badgesEl) {
        var badges = computeBadges(h, hu, t, m, bt, st, failed);
        var bhtml = '';
        for (var b = 0; b < badges.length; b++) {
            bhtml += '<span class="badge">' + badges[b].icon + ' ' + badges[b].label + '</span>';
        }
        badgesEl.innerHTML = bhtml;
    }

    // 日记彩蛋：集齐则拼出完整手记
    if (!failed && game.diaryFragments >= 5 && story) {
        var book = '<p style="margin-top:10px;"><strong>📖 你拼出了完整的《苍岭求生手记》：</strong></p>';
        for (var d = 0; d < diaryTexts.length; d++) {
            book += '<p style="font-style:italic;color:#5d4037;margin:4px 0;">' + diaryTexts[d] + '</p>';
        }
        story.innerHTML += book;
    }

    if (stats) {
        var score = calculateScore(h, hu, t, m, bt, st);
        var highlights = getHighlights(h, hu, t, m, bt, st);
        stats.innerHTML = '<h3>最终状态：</h3>' +
            '<p>❤️ 生命值：' + h + '/100 (' + getStatHint('health', h) + ')</p>' +
            '<p>🍖 饱腹度：' + hu + '/100 (' + getStatHint('hunger', hu) + ')</p>' +
            '<p>💧 水分：' + t + '/100 (' + getStatHint('thirst', t) + ')</p>' +
            '<p>⭐ 士气：' + m + '/100 (' + getStatHint('morale', m) + ')</p>' +
            '<p>💪 体能：' + st + '/100 (' + getStatHint('stamina', st) + ')</p>' +
            '<p>🌡️ 体温：' + bt.toFixed(1) + '℃ (' + getStatHint('bodyTemp', bt) + ')</p>' +
            '<p>🤝 支线任务：' + (game.sideQuestCompleted ? '✅ 已救助驴友' : '❌ 未完成') + '</p>' +
            '<p>📖 日记碎片：' + game.diaryFragments + '/5' + (game.diaryFragments >= 5 ? ' ✅ 集齐！' : '') + '</p>' +
            '<div class="score-display">' +
            '<div class="score-grade">' + score.grade + '</div>' +
            '<div class="score-points">' + (isNaN(score.points) ? 0 : score.points) + '分</div>' +
            '<div class="score-highlights"><p><strong>🌟 高光时刻：</strong></p>' + highlights + '</div>' +
            '</div>';
    }
}

function getFailTitle(reason, h, hu, t, m, bt, st) {
    var found = '遗体在' + game.maxDays + '天后被搜救队发现。';
    if (hu <= 0 && t <= 0) return { title: '饥渴交加', icon: '💀', message: '饿死与渴死的双重折磨，你倒在了荒野中', story: '<p>饱腹度：' + hu + '/100，水分：' + t + '/100。</p><p>' + found + '</p>' };
    if (reason === '失温死亡') return { title: '失温而亡', icon: '🥶', message: '体温跌破 35℃，你在寒夜中静静失温…', story: '<p>体温：' + bt.toFixed(1) + '℃。</p><p>' + found + '</p>' };
    if (reason === '饥饿过度') return { title: '饥饿而亡', icon: '🍗', message: '肠胃早已空空，你再也走不动了', story: '<p>饱腹度：' + hu + '/100。</p><p>' + found + '</p>' };
    if (reason === '口渴过度') return { title: '渴极而亡', icon: '💧', message: '脱水让你意识模糊，倒在了溪边', story: '<p>水分：' + t + '/100。</p><p>' + found + '</p>' };
    if (m >= 70 && (h <= 30 || bt >= 39)) return { title: '悲壮牺牲', icon: '💔', message: '你用生命诠释了荒野求生的残酷与壮烈', story: '<p>生命值：' + h + '/100，士气：' + m + '。</p><p>' + found + '</p>' };
    if (bt >= 39) return { title: '高烧而亡', icon: '🤒', message: '体温飙升至 ' + bt.toFixed(1) + '℃，你最终被高烧击倒', story: '<p>体温：' + bt.toFixed(1) + '℃。</p><p>' + found + '</p>' };
    if (h <= 0) return { title: '力竭伤重', icon: '💀', message: '伤重与疲惫压垮了你，苍岭吞没了最后的呼吸', story: '<p>生命值：' + h + '/100。</p><p>' + found + '</p>' };
    return { title: '魂断苍岭', icon: '🌫', message: '失败原因：' + (reason || '未知'), story: '<p>你迷失在苍岭山脉的深处，再也找不到出路。</p><p>' + found + '</p>' };
}

function getSuccessTitle(h, hu, t, m, bt, st) {
    if (h >= 80 && hu >= 80 && t >= 80 && m >= 80) return { title: '生存达人', icon: '🏆', message: '你完美地生存了' + game.maxDays + '天，各项状态俱佳！', story: '<p>生命值：' + h + '/100，饱腹度：' + hu + '/100，水分：' + t + '/100。</p><p>你凭借完美的准备和策略，成功走出苍岭山脉！</p>' };
    if (h >= 50 && hu >= 50 && t >= 50) return { title: '顺利脱险', icon: '🎉', message: '你有惊无险地度过了' + game.maxDays + '天，成功走出了荒野', story: '<p>生命值：' + h + '/100，饱腹度：' + hu + '/100，水分：' + t + '/100。</p><p>你凭借自己的智慧和毅力，成功走出苍岭山脉！</p>' };
    return { title: '勉强活着', icon: '😰', message: '虽然狼狈，但你终究是活下来了', story: '<p>生命值：' + h + '/100，饱腹度：' + hu + '/100，水分：' + t + '/100。</p><p>你历经艰辛，终于走出了苍岭山脉，但身心俱疲。</p>' };
}

function calculateScore(h, hu, t, m, bt, st) {
    var score = 0;
    score += Math.min(25, h * 0.25);
    score += Math.min(25, hu * 0.25);
    score += Math.min(25, t * 0.25);
    score += Math.min(25, m * 0.25);
    score += Math.max(0, 20 - Math.abs(bt - 36.5) * 5);
    if (st) score += Math.min(25, st * 0.25);
    if (game.sideQuestCompleted) score += 20;
    var grade = score >= 90 ? 'S级 - 传奇求生者' : score >= 75 ? 'A级 - 精英求生者' : score >= 60 ? 'B级 - 熟练求生者' : score >= 40 ? 'C级 - 普通求生者' : 'D级 - 勉强存活';
    return { points: Math.round(score), grade: grade };
}

function getHighlights(h, hu, t, m, bt, st) {
    var hl = [];
    if (h >= 80) hl.push('生命值保持' + h + '，体魄强健！');
    if (hu >= 80) hl.push('饱腹度高达' + hu + '，食物管理完美！');
    if (t >= 80) hl.push('水分充足(' + t + ')，水分管理一流！');
    if (m >= 80) hl.push('士气高昂(' + m + ')，心理素质极强！');
    if (bt >= 36.5 && bt <= 37.5) hl.push('体温完美稳定在' + bt.toFixed(1) + '℃！');
    if (st >= 80) hl.push('体能充沛(' + st + ')，精力旺盛！');
    if (game.sideQuestCompleted) hl.push('成功救助受伤驴友，善举感动苍岭！');
    if (game.diaryFragments >= 5) hl.push('集齐 5 片日记碎片，拼出了完整的求生手记！');
    if (hl.length === 0) hl.push('成功生存' + game.maxDays + '天，你已经很棒了！');
    var html = '<ul class="score-highlights">';
    for (var i = 0; i < hl.length; i++) html += '<li>' + hl[i] + '</li>';
    html += '</ul>';
    return html;
}

function computeBadges(h, hu, t, m, bt, st, failed) {
    var badges = [];
    if (!failed && game.diaryFragments >= 5) badges.push({ icon: '📖', label: '集齐手记' });
    if (!failed && h >= 80 && hu >= 80 && t >= 80 && m >= 80) badges.push({ icon: '🏆', label: '完美求生' });
    if (game.sideQuestCompleted) badges.push({ icon: '🤝', label: '善行义举' });
    if (!failed && bt >= 36.5 && bt <= 37.5) badges.push({ icon: '🌡️', label: '体温大师' });
    if (!failed && game.currentDay <= 10) badges.push({ icon: '⚡', label: '速通苍岭' });
    if (failed && h <= 0) badges.push({ icon: '💀', label: '魂断苍岭' });
    return badges;
}

// ==================== 启动 ===================
document.addEventListener('DOMContentLoaded', init);
