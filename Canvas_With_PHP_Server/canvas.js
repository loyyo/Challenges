const canvas = document.querySelector('#canvas');
const canvasPage = document.querySelector('.canvas');
const ctx = canvas.getContext('2d');
const tools = document.querySelectorAll('.tool');
const sizeSlider = document.querySelector('#slider-size');
const colors = document.querySelectorAll('.colors .color');
const colorPicker = document.querySelector('#color-picker');
const clearCanvas = document.querySelector('#clear-canvas');
const nowyObraz = document.querySelector('.nowy-obraz');
const obrazy = document.querySelector('.obrazy');
const clientName = document.querySelector('#name');
const nameButton = document.querySelector('#name-button');
const podajImie = document.querySelector('.podaj-imie');
const exitButton = document.querySelector('#exit-canvas');
const stronaGlownaSerwera = document.querySelector('.strona-glowna-serwera');

let isDrawing = false;
let selectedTool = 'brush';
let selectedColor = '#000000';
let brushWidth = 5;
let currentName, currentIndex, prevMouseX, prevMouseY, snapshot, offsetX, offsetY;
let canvasDatas = [];
let namesTaken = [];
let changed = false;
let intervalStart;

window.addEventListener('load', () => {
	let xhr = new XMLHttpRequest();
	xhr.open('GET', 'server.php?getalldata');
	xhr.responseType = 'json';
	xhr.onload = () => {
		const data = xhr.response;
		let i = 0;
		data.forEach((file) => {
			i += 1;
			canvasDatas.push(file.canvasData);
			namesTaken.push(file.name);
			obrazy.innerHTML += `<div class="obraz" onclick="obrazekClick(${i})">${file.name}</div>`;
		});
	};
	xhr.send();
});

const intervalFuction = () => {
	if (canvasPage.style.display !== 'none' && canvasPage.style.display !== '') {
		let xhr = new XMLHttpRequest();
		xhr.open('GET', 'server.php?getsingledata=' + currentIndex);
		xhr.responseType = 'json';
		xhr.onload = () => {
			const data = xhr.response;
			image = new Image(canvas.width, canvas.height);
			image.src = data.canvasData;
			ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
		};
		xhr.send();
	}
};

const intervalStartFunction = () => {
	if (changed === true) {
		changed = false;
		let image = new Image(canvas.width, canvas.height);
		image.src = canvasDatas[currentIndex - 1];
		ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
		window.clearInterval(intervalStart);
	}
};

const observer = new MutationObserver(() => {
	setTimeout(() => {
		let image = new Image(canvas.width, canvas.height);
		image.src = canvasDatas[currentIndex - 1];
		ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
	}, 10);
});

observer.observe(canvas, { attributes: true, attributeFilter: ['height'] });

const obrazekClick = (id) => {
	currentIndex = id;
	currentName = namesTaken[id - 1];
	stronaGlownaSerwera.style.display = 'none';
	canvasPage.style.display = 'block';
	canvas.width = canvas.offsetWidth;
	canvas.height = canvas.offsetHeight;
	changed = true;
	window.setInterval(intervalFuction, 1000);
	intervalStart = window.setInterval(intervalStartFunction, 10);
};

window.addEventListener('resize', () => {
	canvas.width = canvas.offsetWidth;
	canvas.height = canvas.offsetHeight;
	let image = new Image(canvas.width, canvas.height);
	image.src = canvasDatas[currentIndex - 1];
	ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
});

nameButton.addEventListener('click', () => {
	if (clientName.value != '' && !namesTaken.includes(clientName.value)) {
		currentName = clientName.value;
		podajImie.style.display = 'none';
		nowyObraz.style.display = 'block';
	} else {
		alert('Tego imienia nie możesz użyć!');
	}
});

nowyObraz.addEventListener('click', () => {
	let json = {
		name: currentName,
		canvasData: '',
	};
	let jsonString = JSON.stringify(json);
	let xhr = new XMLHttpRequest();
	currentIndex = canvasDatas.length + 1;
	xhr.open('POST', 'server.php?updatecanvas=' + currentIndex);
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.send(jsonString);
	xhr.onload = () => {
		stronaGlownaSerwera.style.display = 'none';
		canvasPage.style.display = 'block';
		canvas.width = canvas.offsetWidth;
		canvas.height = canvas.offsetHeight;
	};
});

const updateCanvas = () => {
	let json = {
		name: currentName,
		canvasData: canvas.toDataURL('image/png'),
	};
	let jsonString = JSON.stringify(json);
	let xhr = new XMLHttpRequest();
	xhr.open('POST', 'server.php?updatecanvas=' + currentIndex);
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.send(jsonString);
};

const start = (e) => {
	let bcr = e.target.getBoundingClientRect();
	offsetX = e.clientX - bcr.x;
	offsetY = e.clientY - bcr.y;
	isDrawing = true;
	prevMouseX = offsetX;
	prevMouseY = offsetY;
	ctx.beginPath();
	ctx.lineWidth = brushWidth;
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';
	ctx.strokeStyle = selectedColor;
	ctx.fillStyle = selectedColor;
	snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
	draw(e);
	e.preventDefault();
};

const finished = (e) => {
	if (isDrawing) {
		ctx.stroke();
		ctx.closePath();
		isDrawing = false;
	}
	updateCanvas();
	e.preventDefault();
};

const draw = (e) => {
	let bcr = e.target.getBoundingClientRect();
	offsetX = e.clientX - bcr.x;
	offsetY = e.clientY - bcr.y;
	if (!isDrawing) return;
	ctx.putImageData(snapshot, 0, 0);
	if (selectedTool === 'brush' || selectedTool === 'eraser') {
		ctx.strokeStyle = selectedTool === 'eraser' ? '#fff' : selectedColor;
		ctx.lineTo(offsetX, offsetY);
		ctx.stroke();
	} else if (selectedTool === 'rectangle') {
		ctx.strokeRect(offsetX, offsetY, prevMouseX - offsetX, prevMouseY - offsetY);
	} else if (selectedTool === 'circle') {
		ctx.beginPath();
		let radius = Math.sqrt(Math.pow(prevMouseX - offsetX, 2) + Math.pow(prevMouseY - offsetY, 2));
		ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
		ctx.stroke();
	} else if (selectedTool === 'line') {
		ctx.beginPath();
		ctx.moveTo(prevMouseX, prevMouseY);
		ctx.lineTo(offsetX, offsetY);
		ctx.stroke();
	}
	e.preventDefault();
};

tools.forEach((tool) => {
	tool.addEventListener('click', () => {
		document.querySelector('.tools .active-tool').classList.remove('active-tool');
		tool.classList.add('active-tool');
		selectedTool = tool.id;
	});
});

sizeSlider.addEventListener('change', () => {
	brushWidth = sizeSlider.value;
});

colors.forEach((color) => {
	color.addEventListener('click', () => {
		document.querySelector('.colors .active-color').classList.remove('active-color');
		color.classList.add('active-color');
		selectedColor =
			color.style.backgroundColor === ''
				? window.getComputedStyle(color).getPropertyValue('background-color')
				: color.style.backgroundColor;
	});
});

clearCanvas.addEventListener('click', () => {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	updateCanvas();
});

colorPicker.addEventListener('change', () => {
	colorPicker.parentElement.style.backgroundColor = colorPicker.value;
	colorPicker.parentElement.click();
});

canvas.addEventListener('mousedown', start);
canvas.addEventListener('mouseup', finished);
canvas.addEventListener('mousemove', draw);

//  Mobile

canvas.addEventListener(
	'touchstart',
	function (e) {
		let touch = e.touches[0];
		let mouseEvent = new MouseEvent('mousedown', {
			clientX: touch.clientX,
			clientY: touch.clientY,
		});
		canvas.dispatchEvent(mouseEvent);
		e.preventDefault();
	},
	false
);

canvas.addEventListener(
	'touchend',
	function (e) {
		let mouseEvent = new MouseEvent('mouseup', {});
		canvas.dispatchEvent(mouseEvent);
		e.preventDefault();
	},
	false
);

canvas.addEventListener(
	'touchmove',
	function (e) {
		let touch = e.touches[0];
		let mouseEvent = new MouseEvent('mousemove', {
			clientX: touch.clientX,
			clientY: touch.clientY,
		});
		canvas.dispatchEvent(mouseEvent);
		e.preventDefault();
	},
	false
);
