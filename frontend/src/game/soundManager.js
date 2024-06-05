const soundManager = (() => {
    const getRandomSound = (type, numOfOptions) => {
        const rand = Math.floor(Math.random() * numOfOptions) + 1;
        return new Audio(`/sounds/${type}/${type}${rand}.mp3`);
    };

    const playSound = (sound) => {
        let audio;
        if (sound === 'move') {
            audio = getRandomSound('move', 5);
        } else if (sound === 'capture') {
            audio = new Audio('/sounds/capture.mp3');
        } else if (sound === 'check') {
            audio = new Audio('/sounds/check/check1.mp3');
        }

        if (audio) {
            audio.currentTime = 0;
             // Rewind to the start
            audio.play().catch(() => {
                
            });


            
        }
    };

    return {
        playSound
    };
})();

export default soundManager;
