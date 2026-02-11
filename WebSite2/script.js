const button = document.getElementById('horseButton');
const sound = document.getElementById('horseSound');
const horseImage = document.getElementById('horseImage');

let clickCount = 0;
let isGayMode = false;

horseImage.addEventListener('click', () => {
    clickCount++;
    
    if (clickCount >= 5 && !isGayMode) {
        isGayMode = true;
        horseImage.src = 'assets/Gay_Horse.png';
        sound.src = 'assets/Gay_Horse.mp3';
    }
});

button.addEventListener('click', () => {
    sound.currentTime = 0;
    sound.play();
});
