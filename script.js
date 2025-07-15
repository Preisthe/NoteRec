// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
    // 初始化Tone.js
    const synth = new Tone.Sampler({
        urls: {
            "A0": "A0.mp3",
            "C1": "C1.mp3",
            "D#1": "Ds1.mp3",
            "F#1": "Fs1.mp3",
            "A1": "A1.mp3",
            "C2": "C2.mp3",
            "D#2": "Ds2.mp3",
            "F#2": "Fs2.mp3",
            "A2": "A2.mp3",
            "C3": "C3.mp3",
            "D#3": "Ds3.mp3",
            "F#3": "Fs3.mp3",
            "A3": "A3.mp3",
            "C4": "C4.mp3",
            "D#4": "Ds4.mp3",
            "F#4": "Fs4.mp3",
            "A4": "A4.mp3",
            "C5": "C5.mp3",
            "D#5": "Ds5.mp3",
            "F#5": "Fs5.mp3",
            "A5": "A5.mp3",
            "C6": "C6.mp3",
            "D#6": "Ds6.mp3",
            "F#6": "Fs6.mp3",
            "A6": "A6.mp3",
            "C7": "C7.mp3",
            "D#7": "Ds7.mp3",
            "F#7": "Fs7.mp3",
            "A7": "A7.mp3",
        },
        release: 1,
        baseUrl: "https://tonejs.github.io/audio/salamander/",
    }).toDestination();

    // 等待采样器加载完成
    Tone.loaded().then(() => {
        console.log('音源加载完成');
        document.getElementById('play-reference').disabled = false;
        document.getElementById('play-note').disabled = false;
    });

    // 定义音符映射
    const noteMapping = {
        // 大调音阶的音符级数与实际音高的映射
        // 以C大调为例
        '1': 'C4',  // 主音
        '2': 'D4',  // 上主音
        '3': 'E4',  // 中音
        '4': 'F4',  // 下属音
        '5': 'G4',  // 属音
        '6': 'A4',  // 下中音
        '7': 'B4',  // 导音
        'b2': 'C#4/Db4', // 降二级（等于升一级）
        '#2': 'D#4/Eb4', // 升二级（等于降三级）
        'b3': 'Eb4',     // 降三级
        '#4': 'F#4/Gb4', // 升四级（等于降五级）
        'b5': 'Gb4',     // 降五级
        '#5': 'G#4/Ab4', // 升五级（等于降六级）
        'b6': 'Ab4',     // 降六级
        '#6': 'A#4/Bb4', // 升六级（等于降七级）
        'b7': 'Bb4',     // 降七级
    };

    // 音符的实际播放音高（简化为C大调）
    const playableNotes = {
        '1': 'C4',
        '2': 'D4',
        '3': 'E4',
        '4': 'F4',
        '5': 'G4',
        '6': 'A4',
        '7': 'B4',
        'b2': 'Db4',
        '#2': 'Eb4',
        'b3': 'Eb4',
        '#4': 'F#4',
        'b5': 'Gb4',
        '#5': 'Ab4',
        'b6': 'Ab4',
        '#6': 'Bb4',
        'b7': 'Bb4',
    };

    // 等音关系映射
    const enharmonicEquivalents = {
        'b2': '#1',
        '#2': 'b3',
        '#4': 'b5',
        '#5': 'b6',
        '#6': 'b7',
    };

    // 获取DOM元素
    const playReferenceBtn = document.getElementById('play-reference');
    const playNoteBtn = document.getElementById('play-note');
    const referenceTypeSelect = document.getElementById('reference-type');
    const showAnswerCheckbox = document.getElementById('show-answer');
    const noteButtons = document.querySelectorAll('.note-btn');
    const resultDiv = document.getElementById('result');
    const resultText = document.getElementById('result-text');
    const correctAnswerText = document.getElementById('correct-answer');
    const correctCountSpan = document.getElementById('correct-count');
    const wrongCountSpan = document.getElementById('wrong-count');
    const accuracySpan = document.getElementById('accuracy');

    // 游戏状态
    let currentNote = null;
    let correctCount = 0;
    let wrongCount = 0;
    let isPlaying = false;

    // 禁用按钮直到音源加载完成
    playReferenceBtn.disabled = true;
    playNoteBtn.disabled = true;

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
        
        // 重置按钮状态
        resetNoteButtons();
        
        // 隐藏结果
        resultDiv.classList.add('hidden');
        
        // 生成随机音符
        const notes = Object.keys(playableNotes);
        currentNote = notes[Math.floor(Math.random() * notes.length)];
        
        // 播放音符
        playNote(playableNotes[currentNote]);
        
        // 如果设置为直接显示答案
        if (showAnswerCheckbox.checked) {
            showAnswer();
        }
    });

    // 为每个音符按钮添加点击事件
    noteButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (!currentNote || isPlaying) return;
            
            const selectedNote = button.getAttribute('data-note');
            checkAnswer(selectedNote);
        });
    });

    // 播放完整音阶
    function playScale() {
        isPlaying = true;
        const now = Tone.now();
        const duration = 0.5;
        
        // 播放C大调音阶
        synth.triggerAttackRelease('C4', duration, now);
        synth.triggerAttackRelease('D4', duration, now + duration);
        synth.triggerAttackRelease('E4', duration, now + duration * 2);
        synth.triggerAttackRelease('F4', duration, now + duration * 3);
        synth.triggerAttackRelease('G4', duration, now + duration * 4);
        synth.triggerAttackRelease('A4', duration, now + duration * 5);
        synth.triggerAttackRelease('B4', duration, now + duration * 6);
        synth.triggerAttackRelease('C5', duration, now + duration * 7);
        
        // 音阶播放完成后重置状态
        setTimeout(() => {
            isPlaying = false;
        }, duration * 8 * 1000);
    }

    // 播放主和弦
    function playChord() {
        isPlaying = true;
        
        // 播放C大调主和弦（C-E-G）
        synth.triggerAttackRelease(['C4', 'E4', 'G4'], '1n');
        
        // 和弦播放完成后重置状态
        setTimeout(() => {
            isPlaying = false;
        }, 2000);
    }

    // 播放单个音符
    function playNote(note) {
        synth.triggerAttackRelease(note, '1n');
    }

    // 检查答案
    function checkAnswer(selectedNote) {
        // 标记选中的按钮
        const selectedButton = document.querySelector(`.note-btn[data-note="${selectedNote}"]`);
        selectedButton.classList.add('selected');
        
        // 判断答案是否正确
        const isCorrect = selectedNote === currentNote;
        
        // 更新统计信息
        if (isCorrect) {
            correctCount++;
            selectedButton.classList.add('correct');
            resultText.textContent = '正确！';
        } else {
            wrongCount++;
            selectedButton.classList.add('wrong');
            resultText.textContent = '错误！';
        }
        
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
        // 找到正确答案的按钮并标记
        const correctButton = document.querySelector(`.note-btn[data-note="${currentNote}"]`);
        if (correctButton && !correctButton.classList.contains('correct')) {
            correctButton.classList.add('correct');
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
        resultDiv.classList.remove('hidden');
    }

    // 重置音符按钮状态
    function resetNoteButtons() {
        noteButtons.forEach(button => {
            button.classList.remove('selected', 'correct', 'wrong');
        });
    }
});