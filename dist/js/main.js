const scene = new THREE.Scene(); // создаем сцену
const camera = new THREE.PerspectiveCamera( 81, window.innerWidth / window.innerHeight, 0.1, 1000 ); // создаем камеру

const renderer = new THREE.WebGLRenderer(); // рендерю
renderer.setSize( window.innerWidth, window.innerHeight ); // рендер должен быть размером с нашей вкладкой
document.body.appendChild( renderer.domElement ); // добавляю рендер на холст

renderer.setClearColor( 0xb7c3f3, 1 ) // устанавливаю фон сзади куклы

const light = new THREE.AmbientLight( 0xffffff ); // выбираю любой свет

scene.add( light ) // добавляю свет, чтобы куклу было видно

// global variables
const start_position = 3
const end_position = -start_position
const text = document.querySelector(".text")
const TIME_LIMIT = 10
let gameStat = "loading"
let isLookingBackward = true

function createCube(size, positionX, rotY = 0, color = 0xfbc851) {
    const geometry = new THREE.BoxGeometry(size.w, size.h, size.d); //размер куба
    const material = new THREE.MeshBasicMaterial( { color: color } ); //цвет куба
    const cube = new THREE.Mesh( geometry, material ); // соединяем все в куб с помощью Меш
    cube.position.x = positionX;
    cube.rotation.y = rotY;
    scene.add( cube );
    return cube
}

camera.position.z = 5; // позиция камеры

const loader = new THREE.GLTFLoader() // загрузка 3д моделей

function delay(ms) { // используем промис для остановки нашего кода
    return new Promise(resolve => setTimeout(resolve, ms));
}

class Doll {
    constructor() {
        // models/scene.gltf - для деплоя на gh-pages!!!
        loader.load("models/scene.gltf", (gltf) => { // загружаю изображение фигурки
            scene.add( gltf.scene);
            gltf.scene.scale.set(.4, .4, .4); // устанавливаю мастштаб фигурки
            gltf.scene.position.set(0, -1, 0); // устанавливаю позицию фигурки
            this.doll = gltf.scene;
        })
    }

    lookBackward() {
        gsap.to(this.doll.rotation, {y: -3.15, duration: .45}) // анимация разворота спиной с библиотекой gsap
        setTimeout(() => isLookingBackward = true, 150)
    }

    lookForward() {
        gsap.to(this.doll.rotation, {y: 0, duration: .45}) // анимация разворота лицом библиотекой gsap
        setTimeout(() => isLookingBackward = false, 450)
    }
    async start() {  // разворот куклы чтобы словить шарик, рекурсия
        this.lookBackward()
        await delay((Math.random() * 1000) + 1000)
        this.lookForward()
        await delay((Math.random() * 750) + 750)
        this.start()
    }
    
}


function createTrack() {
    createCube({w: start_position * 2 + .2, h: 1.5, d: 1}, 0, 0, 0xe5a716).position.z = -1; // растягиваю куб посредине, задаем высоту и его разворот по оси у, и отодвигаем его по оси z назад на -1
    createCube({w: .2, h: 1.5, d: 1}, start_position, -.35);
    createCube({w: .2, h: 1.5, d: 1}, end_position, .35);
}

createTrack()

class Player{ // создаю сферу и задаю ей размер, цвет, позицию.
    constructor() {
        const geometry = new THREE.SphereGeometry( .3, 32, 16 );
        const material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
        const sphere = new THREE.Mesh( geometry, material );
        sphere.position.z = 1;
        sphere.position.x = start_position;
        scene.add( sphere );
        this.player = sphere
        this.playerInfo = {
            positionX: start_position,
            velocity: 0
        }
    }

    run() { // создаю функцию чтобы использовать ее при нажатии на кнопку и мой шарик двигался
        this.playerInfo.velocity = .035
    }

    stop() { // создаю функцию чтобы использовать ее при отжатии кнопки и мой шарик останавливается
        
        gsap.to(this.playerInfo, {velocity: 0, duration: 0.3}) // анимация остановки шарика
    }
 
    check() {
        if(this.playerInfo.velocity > 0 && !isLookingBackward) {
            text.innerText = "Ooops, try again!!!"
            gameStat = "over"

        }
        if(this.playerInfo.positionX < end_position + .4) {
            text.innerText = "Good job!"
            gameStat = "over"
        }
    }

    update() {  // логика движения шарика
        this.check()
        this.playerInfo.positionX -= this.playerInfo.velocity
        this.player.position.x = this.playerInfo.positionX
    }
}

const player = new Player()

let doll = new Doll() // создаю экземпляр куклы

async function init() {
    await delay(500)
    text.innerText = "Starting in 3"
    await delay(500)
    text.innerText = "Starting in 2"
    await delay(500)
    text.innerText = "Starting in 1"
    await delay(500)
    text.innerText = "Go!!!"
    startGame()
}

function startGame() {
    gameStat = "started"
    let progressBar = createCube({w: 5, h: .1, d: 1}, 0)   // линия прохождения времени
    progressBar.position.y = 3.35 // задаю высоту линии
    gsap.to(progressBar.scale, {x: 0, duration: TIME_LIMIT, ease: "none"})  //анимация для линии
    setTimeout(() => {
        if(gameStat != "over") {
            text.innerText = "You ran out of time!"
            gameStat = "over"
        }
    }, TIME_LIMIT * 1000)
    doll.start()
}

init()

function animate() { // сюда закидываю все функции, которые имеют анимацию
    if(gameStat == "over") retrun
	renderer.render( scene, camera );
    requestAnimationFrame( animate );
    player.update()
}
animate();

window.addEventListener( 'resize', onWindowResize, false);
// адаптирую, чтобы кукла при растягивании окна браузера и сжатии оставляла свой размер
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    renderer.setSize( window.innerWidth, window.innerHeight);
}

window.addEventListener('keydown', (e) => { // слушатель событися при нажатии на кнопку шарик двиагется, keydown - нажать на кнопку
    if(gameStat != "started") return
    if(e.key == "ArrowUp" || e.key == "ArrowLeft") { // ArrowUp - стрелочка вверх
        player.run()
    }
})
window.addEventListener('keyup', (e) => { // keyup - отжать кнопку
    if(e.key == "ArrowUp" || e.key == "ArrowLeft") {  // ArrowUp - стрелочка вверх
        player.stop()
    }
})