import { enharmonicEquivalents, keyToNotes } from './const.js';
import { playNote, playScale, playChord } from './utils.js';
// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
    // 显示加载提示
    const loadingIndicator = document.getElementById('loading-indicator');
    loadingIndicator.classList.remove('hidden');
    
    // 添加淡入动画效果
    document.querySelectorAll('.animate-fade-in').forEach(element => {
        element.style.opacity = '0';
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transition = 'opacity 0.5s ease-in-out';
        }, 100);
    });
    
    // 等待采样器加载完成
    Tone.loaded().then(() => {
        console.log('音源加载完成');
        // 隐藏加载提示，显示淡入效果
        loadingIndicator.classList.add('hidden');
        
        // 启用按钮
        const playReferenceBtn = document.getElementById('play-reference');
        const playNoteBtn = document.getElementById('play-note');
        
        playReferenceBtn.disabled = false;
        playNoteBtn.disabled = false;
    });

    // 获取DOM元素
    const playReferenceBtn = document.getElementById('play-reference');
    const playNoteBtn = document.getElementById('play-note');
    const referenceTypeSelect = document.getElementById('reference-type');
    const keyTypeSelect = document.getElementById('key-type');
    const showAnswerCheckbox = document.getElementById('show-answer');
    const octaveRangeCheckbox = document.getElementById('octave-range');
    const noteButtons = document.querySelectorAll('.note-btn');
    const resultText = document.getElementById('result-text');
    const correctAnswerText = document.getElementById('correct-answer');
    const correctCountSpan = document.getElementById('correct-count');
    const wrongCountSpan = document.getElementById('wrong-count');
    const accuracySpan = document.getElementById('accuracy');
    const toggleButtons = document.querySelectorAll('.note-toggle-btn');
    const difficultySlider = document.getElementById('difficulty-slider');
    const difficultyValue = document.getElementById('difficulty-value');

    // 游戏状态
    let currentNote = null;
    let correctCount = 0;
    let wrongCount = 0;
    let isPlaying = false;
    let diatonicCount = 0;
    let isChecking = true;

    // 禁用按钮直到音源加载完成
    playReferenceBtn.disabled = true;
    playNoteBtn.disabled = true;

    // 当前选中调式
    let currentKey = keyTypeSelect.value;
    let playableNotes = keyToNotes[currentKey];
    let octaveFlip = false;

    // 调式切换事件
    keyTypeSelect.addEventListener('change', () => {
        currentKey = keyTypeSelect.value;
        playableNotes = keyToNotes[currentKey];
    });

    // 初始化音符启用状态
    const enabledNotes = {};
    toggleButtons.forEach(button => {
        const note = button.getAttribute('data-note');
        enabledNotes[note] = button.classList.contains('note-toggle-btn-selected');
        
        // 为每个按钮添加点击事件监听器
        button.addEventListener('click', () => {
            enabledNotes[note] = !enabledNotes[note];
            button.classList.toggle('note-toggle-btn-selected', enabledNotes[note]);
            console.log(`音符 ${note} 已${enabledNotes[note] ? '启用' : '禁用'}`);
        });
    });
        
    // 初始化难度控制
    let difficulty = localStorage.getItem('noteRecDifficulty') || 2;
    difficultySlider.value = difficulty;
    difficultyValue.textContent = `离调概率: ${difficulty}`;
    // 监听滑块变化
    difficultySlider.addEventListener('input', (e) => {
        difficulty = parseInt(e.target.value);
        difficultyValue.textContent = `离调概率: ${difficulty}`;
        localStorage.setItem('noteRecDifficulty', difficulty); // 保存到本地存储
    });
        
    // 播放提示音（音阶或和弦）
    function playReference() {
        const referenceType = referenceTypeSelect.value;
        
        isPlaying = true;
        if (referenceType === 'scale') {
            const duration = 0.3;
            playScale(playableNotes, duration);
            // 音阶播放完成后重置状态
            setTimeout(() => {
                isPlaying = false;
            }, duration * 8 * 1000);
        } else {
            playChord(playableNotes);
            // 和弦播放完成后重置状态
            setTimeout(() => {
                isPlaying = false;
            }, 500);
        }
    }
    playReferenceBtn.addEventListener('click', playReference);

    // 播放随机音符
    function playRandomNote() {
        if (isPlaying) return;
        if (showAnswerCheckbox.checked) {
            isChecking = false;
        } else {
            isChecking = true;
        }
        
        // 重置按钮状态
        resetNoteButtons();
        
        // 隐藏结果
        resultText.textContent = '请听题';
        correctAnswerText.textContent = '...';
        
        // 根据启用状态过滤音符
        const notes = Object.keys(playableNotes);
        const diatonicNotes = notes.slice(0, 7).filter(note => enabledNotes[note]);
        const chromaticNotes = notes.slice(7).filter(note => enabledNotes[note]);
        
        if (chromaticNotes.length > 0 && diatonicNotes.length > 0) {
            // 难度参数控制 (可外部调整 1-5，数值越大难度越高)
            const baseProbability = 0.05 * difficulty; // 基础概率: 难度1=5%, 难度5=25%
            const maxConsecutiveDiatonic = 15 - (difficulty * 2); // 最大连续调内音: 难度1=13次, 难度5=5次

            // 动态概率 = 基础概率 + 连续调内音加成 (最高100%)
            const dynamicProbability = Math.min(
                2.5 * baseProbability * Math.pow((diatonicCount / maxConsecutiveDiatonic), 2),
                1
            );
            // console.log(dynamicProbability);

            // 随机触发或达到最大连续次数时使用离调音
            if (Math.random() < dynamicProbability || diatonicCount >= maxConsecutiveDiatonic) {
                currentNote = chromaticNotes[Math.floor(Math.random() * chromaticNotes.length)];
                diatonicCount = 0;
            } else {
                currentNote = diatonicNotes[Math.floor(Math.random() * diatonicNotes.length)];
                diatonicCount++;
            }
        } else if (diatonicNotes.length > 0) {
            currentNote = diatonicNotes[Math.floor(Math.random() * diatonicNotes.length)];
        } else {
            return;
        }

        // 如果扩展八度范围
        if (octaveRangeCheckbox.checked) {
            // 随机选择是否切换八度
            octaveFlip = Math.random() < 0.5;
        } else {
            octaveFlip = false;
        }
        
        // 播放音符
        playNote(playableNotes[currentNote], octaveFlip);
        
        // 启用再听一遍按钮
        document.getElementById('replay-note').disabled = false;
        
        // 如果设置为直接显示答案
        if (showAnswerCheckbox.checked && !isAutoMode) {
            showAnswer();
        }
    }
    playNoteBtn.addEventListener('click', playRandomNote);
    
    // 再听一遍按钮功能
    document.getElementById('replay-note').addEventListener('click', () => {
        if (!currentNote || isPlaying) return;
        playNote(playableNotes[currentNote], octaveFlip);
    });

    // 为每个音符按钮添加点击事件
    noteButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (!currentNote || isPlaying) return;
            
            const selectedNote = button.getAttribute('data-note');
            if (selectedNote != '#3') {
                if (isChecking) {
                    checkAnswer(selectedNote);
                    isChecking = false;
                } else {
                    playNote(playableNotes[selectedNote], octaveFlip);
                }
            }
        });
    });

    // 检查答案
    function checkAnswer(selectedNote) {
        // 标记选中的按钮
        const selectedButton = document.querySelector(`.note-btn[data-note="${selectedNote}"]`);
        
        // 判断答案是否正确
        const isCorrect = selectedNote === currentNote;
        
        // 更新统计信息
        if (isCorrect) {
            correctCount++;
            selectedButton.classList.add('note-btn-correct');
            resultText.textContent = '✓ 正确！';
            resultText.className = 'text-xl font-bold text-green-600 dark:text-green-400';
        } else {
            wrongCount++;
            selectedButton.classList.add('note-btn-wrong');
            resultText.textContent = '✗ 错误！';
            resultText.className = 'text-xl font-bold text-red-600 dark:text-red-400';
        }
        
        // 添加结果动画效果
        resultText.style.transform = 'scale(1.1)';
        setTimeout(() => {
            resultText.style.transform = 'scale(1)';
            resultText.style.transition = 'transform 0.3s ease-out';
        }, 100);
        
        // 更新统计显示
        correctCountSpan.textContent = correctCount;
        wrongCountSpan.textContent = wrongCount;
        const total = correctCount + wrongCount;
        const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;
        accuracySpan.textContent = `${accuracy}%`;
        
        // 显示正确答案
        showAnswer();
    }

    // 显示正确答案
    function showAnswer() {
        // 找到正确答案的按钮并标记和播放
        const correctButton = document.querySelector(`.note-btn[data-note="${currentNote}"]`);
        if (correctButton && !correctButton.classList.contains('note-btn-correct')) {
            correctButton.classList.add('note-btn-correct');
            
            // 添加按钮动画效果
            correctButton.style.transform = 'scale(1.1)';
            setTimeout(() => {
                correctButton.style.transform = 'scale(1)';
                correctButton.style.transition = 'transform 0.3s ease-out';
            }, 100);
        }
        if (!showAnswerCheckbox.checked || isAutoMode) {
            playNote(playableNotes[currentNote], octaveFlip);
        }
        
        // 显示正确答案文本
        let answerText = `正确答案: ${currentNote}`;
        
        // 如果有等音关系，显示等音
        const enharmonic = Object.entries(enharmonicEquivalents).find(([key, value]) => key === currentNote || value === currentNote);
        if (enharmonic) {
            const [key, value] = enharmonic;
            if (key === currentNote) {
                answerText += ` (等于 ${value})`;
            } else {
                answerText += ` (等于 ${key})`;
            }
        }
        
        correctAnswerText.textContent = answerText;
        correctAnswerText.className = 'mt-2 text-gray-600 dark:text-gray-400';
    }

    // 重置音符按钮状态
    function resetNoteButtons() {
        noteButtons.forEach(button => {
            button.classList.remove('note-btn-correct', 'note-btn-wrong');
        });
    }

    // 自动模式按钮功能
    let isAutoMode = false;
    let autoSequenceTimeout = null;
    let checkReferenceEnd = null;

    document.getElementById('auto-mode-btn').addEventListener('click', () => {
        isAutoMode = !isAutoMode;
        const autoBtn = document.getElementById('auto-mode-btn');

        if (isAutoMode) {
            // 启动自动模式
            autoBtn.innerHTML = '<i class="fas fa-stop mr-2"></i> 停止自动';
            autoBtn.classList.remove('btn-secondary');
            autoBtn.classList.add('bg-red-300', 'hover:bg-red-300');
            playReferenceBtn.disabled = true;
            playNoteBtn.disabled = true;

            function startAutoSequence() {
                if (!isAutoMode) return;
                
                // 播放参考音
                playReference();
                
                // 等待参考音播放完成
                checkReferenceEnd = setInterval(() => {
                    if (!isPlaying) {
                        clearInterval(checkReferenceEnd);
                        if (autoSequenceTimeout) clearTimeout(autoSequenceTimeout);
                        
                        setTimeout(() => {
                            console.log(isPlaying);
                            playRandomNote();
                            if (showAnswerCheckbox.checked) {
                                setTimeout(showAnswer, 1000);
                            }
                            // 等待2秒后再次开始循环
                            autoSequenceTimeout = setTimeout(startAutoSequence, 2000);
                        }, 1000);
                    }
                }, 100);
            }
            startAutoSequence();
        } else {
            // 停止自动模式
            autoBtn.innerHTML = '<i class="fas fa-cog mr-2"></i> 自动模式';
            autoBtn.classList.remove('bg-red-300', 'hover:bg-red-300');
            autoBtn.classList.add('btn-secondary');
            playNoteBtn.disabled = false;
            playReferenceBtn.disabled = false;
            clearTimeout(autoSequenceTimeout);
            clearInterval(checkReferenceEnd);
        }
    });
});