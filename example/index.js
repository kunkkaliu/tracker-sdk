import Tracker from '../es/index.js';
Tracker
    .config({
        BossId: 'xx',
        Pwd: 'xx',
        debug: true,
    })
    .setContent({
        pageType: 'index'
    })
    .install();

const xx = () => {
    alert(1);
}

document.getElementById('btn1').addEventListener('click', xx);
document.getElementById('btn2').addEventListener('click', xx);
document.getElementById('btn3').addEventListener('click', xx);

document.getElementById('btn4').addEventListener('click', () => {
    document.getElementById('btn1').removeEventListener('click', xx);
    document.getElementById('btn2').removeEventListener('click', xx);
});