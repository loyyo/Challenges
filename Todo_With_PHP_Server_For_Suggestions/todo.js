const searchInput = document.querySelector('.search-input');
const searchButton = document.querySelector('.search-button');
const categoryTodoButton = document.querySelector('.category-todo');
const categoryDoneButton = document.querySelector('.category-done');
const todoList = document.querySelector('.todo-list');
const doneList = document.querySelector('.done-list');
const suggestions = document.querySelector('.suggestions');
const suggestionsList = document.querySelector('.suggestions-list');

const suggestionsData = [];
const todoData = [];
const doneData = [];

const addTodo = (e) => {
	e.preventDefault();
	if (
		searchInput.value != '' &&
		searchInput.value.length <= 30 &&
		todoData.indexOf(
			todoData.find((e) => e.data.toLowerCase() === searchInput.value.toLowerCase())
		) == -1 &&
		doneData.indexOf(
			doneData.find((e) => e.data.toLowerCase() === searchInput.value.toLowerCase())
		) == -1
	) {
		let todoItem = document.createElement('div');
		todoItem.classList.add('todo-item');
		let todoName = document.createElement('li');
		todoName.innerText = searchInput.value;
		todoItem.id = 'todo-item-id-' + todoData.length;
		let dataToPush = {
			id: todoData.length,
			data: searchInput.value,
		};
		todoData.push(dataToPush);
		todoName.classList.add('todo-name');
		todoItem.appendChild(todoName);
		let doneButton = document.createElement('button');
		doneButton.innerHTML = '&#9989';
		doneButton.classList.add('done-button');
		todoItem.appendChild(doneButton);
		let deleteButton = document.createElement('button');
		deleteButton.innerHTML = '&#10060';
		deleteButton.classList.add('delete-button');
		todoItem.appendChild(deleteButton);
		todoList.appendChild(todoItem);
		if (!suggestionsData.includes(searchInput.value)) {
			suggestionsData.push(searchInput.value);
			let suggestionsString = '';
			for (let element of suggestionsData) {
				suggestionsString += `<suggestion>${element}</suggestion>\n`;
			}
			let xml = `
			<suggestions>
			${suggestionsString}
			</suggestions>`;
			let xhr = new XMLHttpRequest();
			xhr.open('POST', 'server.php?postsuggestions');
			xhr.setRequestHeader('Content-Type', 'text/xml');
			xhr.send(xml);
		}
		searchInput.value = '';
	} else if (
		todoData.indexOf(
			todoData.find((e) => e.data.toLowerCase() === searchInput.value.toLowerCase())
		) != -1 ||
		doneData.indexOf(
			doneData.find((e) => e.data.toLowerCase() === searchInput.value.toLowerCase())
		) != -1
	) {
		alert('Taki TODO już istnieje');
		searchInput.value = '';
	} else if (searchInput.value.length > 30) {
		alert('Zbyt długi TODO');
		searchInput.value = '';
	}
	filterSuggestions();
};

const changeCategory = (e) => {
	e.preventDefault();
	let item = e.target;
	if (item.classList.contains('category-todo')) {
		todoList.style.display = 'block';
		doneList.style.display = 'none';
	} else if (item.classList.contains('category-done')) {
		doneList.style.display = 'block';
		todoList.style.display = 'none';
	}
	filterSuggestions();
};

const itemButtons = (e) => {
	e.preventDefault();
	let item = e.target;
	if (item.classList.contains('done-button')) {
		let doneItem = doneList.appendChild(item.parentElement);
		doneItem.removeChild(doneItem.children.item(1));
		let todoButton = document.createElement('button');
		todoButton.innerHTML = '&#9194';
		todoButton.classList.add('todo-button');
		doneItem.insertBefore(todoButton, doneItem.children[1]);
		let itemId = doneItem.id.split('-')[3];
		let todoItem = todoData.find((e) => e.id.toString() === itemId);
		let dataToPush = {
			id: doneData.length,
			data: todoItem.data,
			timeLeft: 300,
		};
		doneItem.id = 'done-item-id-' + doneData.length;
		doneData.push(dataToPush);
		todoData.splice(todoData.indexOf(todoItem), 1);
	} else if (item.classList.contains('delete-button')) {
		let itemId = item.parentElement.id.split('-')[3];
		if (todoList.style.display === 'block') {
			let todoItem = todoData.find((e) => e.id.toString() === itemId);
			todoData.splice(todoData.indexOf(todoItem), 1);
		} else if (doneList.style.display === 'block') {
			let doneItem = doneData.find((e) => e.id.toString() === itemId);
			doneData.splice(doneData.indexOf(doneItem), 1);
		}
		item.parentElement.remove();
	} else if (item.classList.contains('todo-button')) {
		let todoItem = todoList.appendChild(item.parentElement);
		todoItem.removeChild(todoItem.children.item(1));
		let doneButton = document.createElement('button');
		doneButton.innerHTML = '&#9989';
		doneButton.classList.add('done-button');
		todoItem.insertBefore(doneButton, todoItem.children[1]);
		let itemId = todoItem.id.split('-')[3];
		let doneItem = doneData.find((e) => e.id.toString() === itemId);
		let dataToPush = {
			id: todoData.length,
			data: doneItem.data,
		};
		todoItem.id = 'todo-item-id-' + todoData.length;
		todoData.push(dataToPush);
		doneData.splice(doneData.indexOf(doneItem), 1);
	}
	filterSuggestions();
};

const suggestionsFunc = () => {
	filterSuggestions();
	if (searchInput.value !== '') {
		for (li of suggestionsData) {
			if (li.toLowerCase().startsWith(searchInput.value.toLowerCase())) {
				let suggestionItem = document.createElement('li');
				suggestionItem.setAttribute('onclick', `clickSuggestion('${li}')`);
				suggestionItem.classList.add('suggestion-item');
				suggestionItem.innerHTML = `<b>${li.substr(0, searchInput.value.length)}</b>${li.substr(
					searchInput.value.length
				)}`;
				suggestionsList.appendChild(suggestionItem);
			}
		}
	}
};

const clickSuggestion = (li) => {
	filterSuggestions();
	searchInput.value = li;
};

const filterSuggestions = () => {
	suggestionsData.sort((a, b) => a.length - b.length);
	document.querySelectorAll('.suggestion-item').forEach((item) => {
		item.remove();
	});
};

window.setInterval(() => {
	for (let item of doneData) {
		if (item.timeLeft === 1) {
			document.getElementById('done-item-id-' + item.id).remove();
			doneData.splice(doneData.indexOf(item), 1);
		} else if (item.timeLeft !== 1) {
			item.timeLeft = item.timeLeft - 1;
		}
	}
	let xhr = new XMLHttpRequest();
	xhr.open('GET', 'server.php?getsuggestions');
	xhr.responseType = 'document';
	xhr.overrideMimeType('text/xml');
	xhr.onload = () => {
		if (xhr.readyState === xhr.DONE && xhr.status === 200) {
			const data = xhr.responseXML.getElementsByTagName('suggestion');
			suggestionsData.length = 0;
			for (let element of data) {
				suggestionsData.push(element.childNodes[0].nodeValue);
			}
		}
	};
	xhr.send();
}, 1000);

window.addEventListener('load', () => {
	todoList.style.display = 'block';
	doneList.style.display = 'none';
	suggestions.style.width = document.querySelector('.search').offsetWidth.toString() + 'px';
	let xhr = new XMLHttpRequest();
	xhr.open('GET', 'server.php?getsuggestions');
	xhr.responseType = 'document';
	xhr.overrideMimeType('text/xml');
	xhr.onload = () => {
		if (xhr.readyState === xhr.DONE && xhr.status === 200) {
			const data = xhr.responseXML.getElementsByTagName('suggestion');
			for (let element of data) {
				suggestionsData.push(element.childNodes[0].nodeValue);
			}
		}
	};
	xhr.send();
});

window.addEventListener('resize', () => {
	suggestions.style.width = document.querySelector('.search').offsetWidth.toString() + 'px';
});

searchButton.addEventListener('click', addTodo);
todoList.addEventListener('click', itemButtons);
doneList.addEventListener('click', itemButtons);
categoryTodoButton.addEventListener('click', changeCategory);
categoryDoneButton.addEventListener('click', changeCategory);
searchInput.addEventListener('input', suggestionsFunc);
