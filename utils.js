import { synth } from './const.js'
// 播放完整音阶
export function playScale(playableNotes, duration) {
    const now = Tone.now();
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

}

// 播放主和弦
export function playChord(playableNotes) {
    // 播放当前调式的主和弦（1-3-5级）
    const chordNotes = [
        playableNotes['1'],  // 主音
        playableNotes['3'],  // 三音
        playableNotes['5']   // 五音
    ];
    synth.triggerAttackRelease(chordNotes, '1n');
    
}

// 播放单个音符
export function playNote(note, octaveFlip = false) {
    // 如果扩展八度范围
    if (octaveFlip) {
        if (note.includes('4')) {
            note = note.replace('4', '5');
        } else {
            note = note.replace('5', '4');
        }
    }

    synth.triggerAttackRelease(note, '1n');
}
