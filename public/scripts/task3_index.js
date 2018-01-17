var rooms, events;
// var currentDate = "\"2017-12-13T19:12:36.981Z\"";
var queryDate = new Date();
queryDate = "\"" + queryDate.getFullYear() + "-" + addZero( queryDate.getMonth()+1 ) + "-" + addZero( queryDate.getDate() ) + "T00:00:00.000Z\"";
var initialDate = true;

queryGetEvents();

// Запрос для получения всех событий и всех комнат
function queryGetEvents() {
    var xhrEvents = new XMLHttpRequest();
    xhrEvents.open("POST", "/graphql");
    xhrEvents.responseType = 'json';
    xhrEvents.setRequestHeader("Content-Type", "application/json");
	xhrEvents.setRequestHeader("Accept", "application/json");
    xhrEvents.send(JSON.stringify({query: "query {events(dateStart: "+queryDate+") {id title dateStart dateEnd users {id login homeFloor avatarUrl} room {id title capacity floor}} rooms {id title capacity floor}}"}));
    xhrEvents.onreadystatechange = function () {
        if(xhrEvents.readyState === XMLHttpRequest.DONE && xhrEvents.status === 200) {
            if (typeof xhrEvents.response === 'string') {
				events = JSON.parse(xhrEvents.response).data.events;
				rooms = JSON.parse(xhrEvents.response).data.rooms;
            } else {
				events =  xhrEvents.response.data.events;
				rooms =  xhrEvents.response.data.rooms;
			}	
			// console.log(events);
            queryExecuted();
        }
    }
}

// Запустить после выполнения запроса
function queryExecuted() {
	setCurrentDate()
	fillSchedule();
	makeFreeTimeBlocksClickable()
	changeSizeOfVerLines();		
	task2(); // выполнить скрипт из 2 задания по верстке	
}

//Выводим вверху страницы текущую дату
//Прибавляем и отнимаем день при нажатии на стрелочки рядом с датой
function setCurrentDate() {
	var currentDateSpan = $('.datetime__date-wrapper span');
	if (initialDate === true) {
		var d = new Date(); 
		currentDateSpan.setAttribute('data-day', d.getDate());
		currentDateSpan.setAttribute('data-month', d.getMonth()+1);
		currentDateSpan.setAttribute('data-year', d.getFullYear());
		var months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
		currentDateSpan.innerHTML = d.getDate() + ' ' + months[ d.getMonth() ] + ' · Сегодня';
		initialDate = false;
	} else {
		var d = new Date( currentDateSpan.getAttribute('data-year') , currentDateSpan.getAttribute('data-month')-1 , currentDateSpan.getAttribute('data-day') );
	}	
}

// Заполнить сетку бронирования
function fillSchedule() {
	var floor = rooms[0].floor;

	var updateSchedule = document.createElement('div');
	updateSchedule.classList.add('content__table');
	$('.content__main-content').replaceChild(updateSchedule, $('.content__table'));
	content_table = $('.content__table');

	addFloorToDom(content_table, floor);

	rooms.forEach(function(item, i, arr) {
		if (floor == item.floor) {
			addRoomToDom(content_table, item);
			addEventToDom(content_table, item)			
		} else {
			floor = item.floor;
			addFloorToDom(content_table, floor);
			addRoomToDom(content_table, item);
			addEventToDom(content_table, item);
		}
	});
}

// Добавить в DOM номер этажа и пустая область на сетке бронирования
function addFloorToDom (node, floor) {
	var divRow = document.createElement('div');
	divRow.className = "content__row row-floor";
	node.appendChild(divRow);

	var divCell = document.createElement('div');
	divCell.className = "content__cell cell-floor";
	divCell.innerHTML = floor + " этаж"
	divRow.appendChild(divCell);

	var divCell = document.createElement('div');
	divCell.className = "content__cell schedulefloor";
	divRow.appendChild(divCell);
}
// Добавить в DOM название комнаты и область на сетке бронирования
function addRoomToDom (node, room) {
	var divRow = document.createElement('div');
	divRow.className = "content__row";
	divRow.dataset.roomId = room.id;
	node.appendChild(divRow);

	var divCell = document.createElement('div');
	divCell.className = "content__cell room";
	divRow.appendChild(divCell);

	var divRoomName = document.createElement('div');
	divRoomName.className = "room-name";
	divRoomName.innerHTML = room.title;
	divCell.appendChild(divRoomName);

	var divRoomCapacity = document.createElement('div');
	divRoomCapacity.className = "room-capacity";
	divRoomCapacity.innerHTML = 'до ' + room.capacity + ' человек';
	divCell.appendChild(divRoomCapacity);
}
//Сортировка массива events по id комнаты
function sortByRoomIDs(a, b) {
	if (a.room.id > b.room.id) return 1;
	if (a.room.id < b.room.id) return -1;
}
//Сортировка массива events по дате начала события
function sortBydateStart(a, b) {
	if (a.room.id == b.room.id && a.dateStart > b.dateStart) return 1;
	if (a.room.id == b.room.id && a.dateStart < b.dateStart) return -1;
}
  
function addEventToDom (content_table, room) {
	events.sort(sortByRoomIDs); //сортировка по id комнат по возрастанию
	events.sort(sortBydateStart); //сортировка по датам по возрастанию

	var divRow = $( 'div[data-room-id="'+ room.id +'"]' ); //получим строку таблицы для текущей комнаты
	var divCell = document.createElement('div');
	divCell.className = "content__cell scheduleroom";
	divCell.setAttribute('data-room-id', room.id);
	divRow.appendChild(divCell);	
	
	var startAt, endAt;

	// console.log('комната ' + room.id + ' ' + room.title);

	var eventsInCurrentRoom = [];
	events.forEach(function(item, i, arr) { 
		if (item.room.id == room.id && isEventOnThatDay(item) == true) eventsInCurrentRoom.push(item);
	});

	var taken = true, 
	free = false;
	var sizeOfBlock = 1;
	
	for (let index = 8; index < 23; index = index + 0.25) {
		
		var StartPeriod = index * 60;
		var EndPeriod = (index + 0.25) * 60;

		if (eventsInCurrentRoom[0]  == undefined) {
			// Рисуем пустой блок
			var divTimeBlock = document.createElement('div');
			divTimeBlock.className = "schedule-block free";
			divTimeBlock.style.width = '16.5px'
			var attribTimeStart, attribTimeEnd, attribDate;
			if ( String(Math.floor(StartPeriod / 60)).length == 1 ) { attribTimeStart = '0' + String(Math.floor(StartPeriod / 60)) } else { attribTimeStart = Math.floor(StartPeriod / 60) };
			if ( String(StartPeriod % 60 ).length == 1) { attribTimeStart = attribTimeStart + ':' + String(StartPeriod % 60 ) + '0' } else { attribTimeStart = attribTimeStart + ':' + String(StartPeriod % 60 ) };
			if ( String(Math.floor(EndPeriod / 60)).length == 1 ) { attribTimeEnd = '0' + String(Math.floor(EndPeriod / 60)) } else { attribTimeEnd = Math.floor(EndPeriod / 60) };
			if ( String(EndPeriod % 60 ).length == 1) { attribTimeEnd = attribTimeEnd + ':' + String(EndPeriod % 60 ) + '0' } else { attribTimeEnd = attribTimeEnd + ':' + String(EndPeriod % 60 ) };
			attribDate = $('.datetime__date-wrapper > span').getAttribute('data-year') + '-' + addZero($('.datetime__date-wrapper > span').getAttribute('data-month')) + '-' + $('.datetime__date-wrapper > span').getAttribute('data-day');
			divTimeBlock.setAttribute('data-date', attribDate);
			divTimeBlock.setAttribute('data-start',  attribTimeStart);
			divTimeBlock.setAttribute('data-end', attribTimeEnd);
			divCell.appendChild(divTimeBlock);
			// Рисуем пустой блок
			continue;
		}
		var eventToDraw = eventsInCurrentRoom[0];
	

		var startAtInMinutes = eventToDraw.dateStart.substr(11,2) * 60 + +( eventToDraw.dateStart.substr(14, 2) );
		var endAtInMinutes = eventToDraw.dateEnd.substr(11,2) * 60 + +( eventToDraw.dateEnd.substr(14, 2) );

		if (sizeOfBlock == 1 && startAtInMinutes >= StartPeriod && endAtInMinutes <= EndPeriod ) {
			
			// рисуем блок для события
			var divTimeBlock = document.createElement('div');
			divTimeBlock.className = "schedule-block taken";
			divTimeBlock.style.width = sizeOfBlock * 16.5 + "px";
			divTimeBlock.dataset.title = eventToDraw.title;
			divTimeBlock.dataset.dateStart = eventToDraw.dateStart;
			divTimeBlock.dataset.dateEnd = eventToDraw.dateEnd;
			divTimeBlock.dataset.roomId = eventToDraw.room.id;
			divTimeBlock.dataset.roomTitle = eventToDraw.room.title;
			if ( eventToDraw.users.length > 0 ) {
				var EventUsers = eventToDraw.users[0].id;
				for (var i = 1; i < eventToDraw.users.length; i++) {
					EventUsers = EventUsers + ',' + eventToDraw.users[i].id;
				}
				divTimeBlock.dataset.usersId = EventUsers;
			}
			divCell.appendChild(divTimeBlock);
			addToolTipToDom(divTimeBlock, eventToDraw);
			// рисуем блок для события
			eventsInCurrentRoom.shift();

		}
		else if ( (sizeOfBlock == 1 && startAtInMinutes >= StartPeriod && startAtInMinutes < EndPeriod) || (sizeOfBlock > 1 && endAtInMinutes > EndPeriod) ) {

			sizeOfBlock = sizeOfBlock + 1;

		} else if ( sizeOfBlock > 1 && endAtInMinutes <= EndPeriod ) {

			// рисуем блок для события
			var divTimeBlock = document.createElement('div');
			divTimeBlock.className = "schedule-block taken";
			divTimeBlock.style.width = sizeOfBlock * 16.5 + "px";
			divTimeBlock.dataset.title = eventToDraw.title;
			divTimeBlock.dataset.dateStart = eventToDraw.dateStart;
			divTimeBlock.dataset.dateEnd = eventToDraw.dateEnd;
			divTimeBlock.dataset.roomId = eventToDraw.room.id;
			divTimeBlock.dataset.roomTitle = eventToDraw.room.title;
			if ( eventToDraw.users.length > 0 ) {
				var EventUsers = eventToDraw.users[0].id;
				for (var i = 1; i < eventToDraw.users.length; i++) {
					EventUsers = EventUsers + ',' + eventToDraw.users[i].id;
				}
				divTimeBlock.dataset.usersId = EventUsers;
			}
			divCell.appendChild(divTimeBlock);
			addToolTipToDom(divTimeBlock, eventToDraw);
			// рисуем блок для события
			eventsInCurrentRoom.shift();
			sizeOfBlock = 1;

		} else {

			// Рисуем пустой блок
			var divTimeBlock = document.createElement('div');
			divTimeBlock.className = "schedule-block free";
			divTimeBlock.style.width = '16.5px'
			var attribTimeStart, attribTimeEnd, attribDate;
			if ( String(Math.floor(StartPeriod / 60)).length == 1 ) { attribTimeStart = '0' + String(Math.floor(StartPeriod / 60)) } else { attribTimeStart = Math.floor(StartPeriod / 60) };
			if ( String(StartPeriod % 60 ).length == 1) { attribTimeStart = attribTimeStart + ':' + String(StartPeriod % 60 ) + '0' } else { attribTimeStart = attribTimeStart + ':' + String(StartPeriod % 60 ) };
			if ( String(Math.floor(EndPeriod / 60)).length == 1 ) { attribTimeEnd = '0' + String(Math.floor(EndPeriod / 60)) } else { attribTimeEnd = Math.floor(EndPeriod / 60) };
			if ( String(EndPeriod % 60 ).length == 1) { attribTimeEnd = attribTimeEnd + ':' + String(EndPeriod % 60 ) + '0' } else { attribTimeEnd = attribTimeEnd + ':' + String(EndPeriod % 60 ) };
			attribDate = $('.datetime__date-wrapper > span').getAttribute('data-year') + '-' + addZero($('.datetime__date-wrapper > span').getAttribute('data-month')) + '-' + $('.datetime__date-wrapper > span').getAttribute('data-day');
			divTimeBlock.setAttribute('data-date', attribDate);
			divTimeBlock.setAttribute('data-start',  attribTimeStart);
			divTimeBlock.setAttribute('data-end', attribTimeEnd);
			divCell.appendChild(divTimeBlock);
			// Рисуем пустой блок

		}

	}
}

function isEventOnThatDay( event ) {
	var searchDate_year = +$('.datetime__date-wrapper > span').getAttribute('data-year');
	var searchDate_month = +$('.datetime__date-wrapper > span').getAttribute('data-month') - 1;
	var searchDate_day = +$('.datetime__date-wrapper > span').getAttribute('data-day');
	
	var searchDate = new Date(searchDate_year, searchDate_month, searchDate_day);
	
	var eventDate_year = +event.dateStart.substr(0, 4);
	var eventDate_month = +event.dateStart.substr(5,2) - 1;
	var eventDate_day = +event.dateStart.substr(8,2);
	var eventDate = new Date(eventDate_year, eventDate_month, eventDate_day);

	if (searchDate_year == eventDate_year && searchDate_month == eventDate_month && searchDate_day == eventDate_day) {return true;} else {return false;}
}

//Поиск в массиве
function find(array, value) {
	for (var i = 0; i < array.length; i++) {
	  if (array[i].room.id == value) return i;
	}
	return -1;
}

//Добавить Tooltip при клике на встречу на сетке бронирования
function addToolTipToDom (eventBlock, event) {
	var tooltip = document.createElement('div');
	tooltip.className = "tooltip";
	eventBlock.appendChild(tooltip);

	var tooltipEventTitle = document.createElement('div');
	tooltipEventTitle.className = "tooltip__event-title";
	tooltipEventTitle.innerHTML = event.title;
	tooltip.appendChild(tooltipEventTitle);

	var tooltipEventDateAndTime = document.createElement('div');
	tooltipEventDateAndTime.className = "tooltip__event-dateAndTime";
	// tooltipEventDateAndTime.innerHTML = "14 декабря, 15:00—17:00  ·  Жёлтый дом";
	tooltipEventDateAndTime.innerHTML = formatDate(event); 
	tooltip.appendChild(tooltipEventDateAndTime);

	var tooltipEventUsers = document.createElement('div');
	tooltipEventUsers.className = "tooltip__event-users";
	if (event.users.length > 0) { tooltipEventUsers.innerHTML = event.users[0].login; }
	tooltip.appendChild(tooltipEventUsers);
	
	var tooltipEventUsersMore = document.createElement('span');
	if ( event.users.length > 1 ) { 
		tooltipEventUsersMore.innerHTML = " и " + (event.users.length - 1) + " участников"; 
	} else if ( event.users.length = 1 ) {
		tooltipEventUsersMore.innerHTML = ""; 
	}
	tooltipEventUsers.appendChild(tooltipEventUsersMore);

	var tooltipEventUsersLogo = document.createElement('img');
	if (event.users.length > 0 && event.users[0] !== undefined) { tooltipEventUsersLogo.setAttribute('src', event.users[0].avatarUrl); }
	tooltipEventUsers.appendChild(tooltipEventUsersLogo);

    var toolTipLink = document.createElement('a');
    toolTipLink.setAttribute('href', "editmeeting.html?eventID=" + event.id)
    tooltip.appendChild(toolTipLink);

	var tooltipEdit = document.createElement('div');
	tooltipEdit.className = "edit";
    toolTipLink.appendChild(tooltipEdit);

	var tooltipEditPic = document.createElement('img');
	tooltipEditPic.setAttribute('src', "assets/edit.svg")
	tooltipEdit.appendChild(tooltipEditPic);
}

function makeFreeTimeBlocksClickable() {
	var freeTimeBlocks = $All('.schedule-block.free');
	for (let index = 0; index < freeTimeBlocks.length; index++) {
		const element = freeTimeBlocks[index];
		element.onclick = function() {
			location.href='newmeeting.html?' + 'roomID=' + element.parentElement.getAttribute('data-room-id') + '&date=' + element.getAttribute('data-date') + '&startAt=' +  element.getAttribute('data-start') + '&endAt=' +  element.getAttribute('data-end');
		}
	}
}

//Отформатировать дату для заполнения ToolTip
function formatDate (event) { 
	var eventDay = event.dateStart.substr(8,2);
	var eventMonth = event.dateStart.substr(5,2);
	var allMonth = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

	return 	+eventDay + ' ' + allMonth[+eventMonth-1] + ", " + event.dateStart.substr(11,2) +
		 	":" + event.dateStart.substr(14,2) + "—" + event.dateEnd.substr(11,2) + ":" + event.dateEnd.substr(14,2) + 
			"  ·  " + event.room.title;
}

function changeSizeOfVerLines() {
	var verticalLines = document.querySelectorAll('.datetime__time hr');

    for (var i = 0; i < verticalLines.length; i++) {
		verticalLines[i].style.height = $('.content__table').clientHeight + 'px';
    }
}

function addZero(x) {
	x = String(x);
	if (x.length == 1) x = '0' + x;
	return x;
}

function $(elem) {
	return document.querySelector(elem);
}
function $All(elem) {
	return document.querySelectorAll(elem);
}