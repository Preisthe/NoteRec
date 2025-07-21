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
    
    // 初始化Tone.js
    const synth = new Tone.Sampler({
        urls: {
            // "C2": "C2.mp3",
            // "D#2": "Ds2.mp3",
            // "F#2": "Fs2.mp3",
            // "A2": "A2.mp3",
            // "C3": "C3.mp3",
            // "D#3": "Ds3.mp3",
            // "F#3": "Fs3.mp3",
            // "A3": "A3.mp3",
            "C4": "C4.mp3",
            "D#4": "Ds4.mp3",
            "F#4": "Fs4.mp3",
            "A4": "A4.mp3",
            "C5": "C5.mp3",
            "D#5": "Ds5.mp3",
            "F#5": "Fs5.mp3",
            "A5": "A5.mp3",
            // "C6": "C6.mp3",
            // "D#6": "Ds6.mp3",
            // "F#6": "Fs6.mp3",
            // "A6": "A6.mp3",
        },
        release: 0.8,
        baseUrl: "https://tonejs.github.io/audio/salamander/",
    }).toDestination();

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

    // 等音关系映射
    const enharmonicEquivalents = {
        '#1': 'b2',
        '#2': 'b3',
        '#4': 'b5',
        '#5': 'b6',
        '#6': 'b7',
    };

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

    // 各调式音高映射
    const keyToNotes = {
        'C': { '1': 'C4', '2': 'D4', '3': 'E4', '4': 'F4', '5': 'G4', '6': 'A4', '7': 'B4', '#1': 'C#4', '#2': 'D#4', '#4': 'F#4', '#5': 'G#4', '#6': 'A#4' },
        'G': { '1': 'G4', '2': 'A4', '3': 'B4', '4': 'C5', '5': 'D5', '6': 'E5', '7': 'F#5', '#1': 'G#4', '#2': 'A#4', '#4': 'C#5', '#5': 'D#5', '#6': 'E#5' },
        'D': { '1': 'D4', '2': 'E4', '3': 'F#4', '4': 'G4', '5': 'A4', '6': 'B4', '7': 'C#5', '#1': 'D#4', '#2': 'E#4', '#4': 'G#4', '#5': 'A#4', '#6': 'B#4' },
        'A': { '1': 'A4', '2': 'B4', '3': 'C#5', '4': 'D5', '5': 'E5', '6': 'F#5', '7': 'G#5', '#1': 'A#4', '#2': 'B#4', '#4': 'D#5', '#5': 'E#5', '#6': 'F##5' },
        'E': { '1': 'E4', '2': 'F#4', '3': 'G#4', '4': 'A4', '5': 'B4', '6': 'C#5', '7': 'D#5', '#1': 'E#4', '#2': 'F##4', '#4': 'A#4', '#5': 'B#4', '#6': 'C##5' },
        'B': { '1': 'B4', '2': 'C#5', '3': 'D#5', '4': 'E5', '5': 'F#5', '6': 'G#5', '7': 'A#5', '#1': 'B#4', '#2': 'C##5', '#4': 'E#5', '#5': 'F##5', '#6': 'G##5' },
        'F#': { '1': 'F#4', '2': 'G#4', '3': 'A#4', '4': 'B4', '5': 'C#5', '6': 'D#5', '7': 'E#5', '#1': 'F##4', '#2': 'G##4', '#4': 'B#4', '#5': 'C##5', '#6': 'D##5' },
        'Db': { '1': 'Db4', '2': 'Eb4', '3': 'F4', '4': 'Gb4', '5': 'Ab4', '6': 'Bb4', '7': 'C5', '#1': 'D4', '#2': 'E4', '#4': 'G4', '#5': 'A4', '#6': 'B4' },
        'Ab': { '1': 'Ab4', '2': 'Bb4', '3': 'C5', '4': 'Db5', '5': 'Eb5', '6': 'F5', '7': 'G5', '#1': 'A4', '#2': 'B4', '#4': 'D5', '#5': 'E5', '#6': 'F#5' },
        'Eb': { '1': 'Eb4', '2': 'F4', '3': 'G4', '4': 'Ab4', '5': 'Bb4', '6': 'C5', '7': 'D5', '#1': 'E4', '#2': 'F#4', '#4': 'A4', '#5': 'B4', '#6': 'C#5' },
        'Bb': { '1': 'Bb4', '2': 'C5', '3': 'D5', '4': 'Eb5', '5': 'F5', '6': 'G5', '7': 'A5', '#1': 'B4', '#2': 'C#5', '#4': 'E5', '#5': 'F#5', '#6': 'G#5' },
        'F': { '1': 'F4', '2': 'G4', '3': 'A4', '4': 'Bb4', '5': 'C5', '6': 'D5', '7': 'E5', '#1': 'F#4', '#2': 'G#4', '#4': 'B4', '#5': 'C#5', '#6': 'D#5' }
    };

    // 当前选中调式
    let currentKey = keyTypeSelect.value;
    let playableNotes = keyToNotes[currentKey];
    let octaveFlip = false;

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
        
    // 调式切换事件
    keyTypeSelect.addEventListener('change', () => {
        currentKey = keyTypeSelect.value;
        playableNotes = keyToNotes[currentKey];
    });

    // 播放提示音（音阶或和弦）
    playReferenceBtn.addEventListener('click', () => {
        const referenceType = referenceTypeSelect.value;
        
        if (referenceType === 'scale') {
            // 播放完整音阶
            playScale();
        } else {
            // 播放主和弦
            playChord();
        }
    });

    // 播放随机音符
    playNoteBtn.addEventListener('click', () => {
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
        
        if (chromaticNotes.length > 0) {
            // 使用静态计数器记录调内音的次数，每6次调内音后选择1次调外音
            if (diatonicCount >= 6) {
                currentNote = chromaticNotes[Math.floor(Math.random() * chromaticNotes.length)];
                diatonicCount = 0;
            } else {
                currentNote = diatonicNotes[Math.floor(Math.random() * diatonicNotes.length)];
                diatonicCount++;
            }
        } else {
            currentNote = diatonicNotes[Math.floor(Math.random() * diatonicNotes.length)];
        }

        // 如果扩展八度范围
        if (octaveRangeCheckbox.checked) {
            // 随机选择是否切换八度
            octaveFlip = Math.random() < 0.5;
        }
        
        // 播放音符
        playNote(playableNotes[currentNote]);
        
        // 启用再听一遍按钮
        document.getElementById('replay-note').disabled = false;
        
        // 如果设置为直接显示答案
        if (showAnswerCheckbox.checked) {
            showAnswer();
        }
    });
    
    // 再听一遍按钮功能
    document.getElementById('replay-note').addEventListener('click', () => {
        if (!currentNote || isPlaying) return;
        playNote(playableNotes[currentNote]);
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
                    playNote(playableNotes[selectedNote]);
                }
            }
        });
    });

    // 播放完整音阶
    function playScale() {
        isPlaying = true;
        const now = Tone.now();
        const duration = 0.3;
        // 获取当前调式的音阶音符
        const scaleNotes = [
            playableNotes['1'], playableNotes['2'], playableNotes['3'],
            playableNotes['4'], playableNotes['5'], playableNotes['6'], playableNotes['7']
        ];

        // 播放当前调式音阶
        scaleNotes.forEach((note, index) => {
            synth.triggerAttackRelease(note, duration, now + duration * index);
        });
        // 播放高八度主音
        const octave5Note = scaleNotes[0].replace(/4/, '5');
        synth.triggerAttackRelease(octave5Note, duration, now + duration * 7);

        // 音阶播放完成后重置状态
        setTimeout(() => {
            isPlaying = false;
        }, duration * 8 * 1000);
    }

    // 播放主和弦
    function playChord() {
        isPlaying = true;
        
        // 播放当前调式的主和弦（1-3-5级）
        const chordNotes = [
            playableNotes['1'],  // 主音
            playableNotes['3'],  // 三音
            playableNotes['5']   // 五音
        ];
        synth.triggerAttackRelease(chordNotes, '1n');
        
        // 和弦播放完成后重置状态
        setTimeout(() => {
            isPlaying = false;
        }, 500);
    }

    // 播放单个音符
    function playNote(note) {
        // 如果扩展八度范围
        if (octaveRangeCheckbox.checked && octaveFlip) {
            if (note.includes('4')) {
                note = note.replace('4', '5');
            } else {
                note = note.replace('5', '4');
            }
        }

        synth.triggerAttackRelease(note, '1n');
    }

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
        if (!showAnswerCheckbox.checked) {
            playNote(playableNotes[currentNote]);
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
});