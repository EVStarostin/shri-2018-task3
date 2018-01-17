var event, users, rooms;
get();

function get() {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/graphql");
    xhr.responseType = 'json';
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Accept", "application/json");
    xhr.send(JSON.stringify({query: "query {event(id:" + getQueryString().eventID + ") {id title dateStart dateEnd users {id login homeFloor avatarUrl} room {id title capacity floor}} users {id login homeFloor avatarUrl} rooms {id title capacity floor}}"}));
    xhr.onreadystatechange = function () {
        if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            if (typeof xhr.response === 'string') {
                event = JSON.parse(xhr.response).data.event;
                users = JSON.parse(xhr.response).data.users;
                rooms = JSON.parse(xhr.response).data.rooms;
            } else {
                event =  xhr.response.data.event;
                users =  xhr.response.data.users;
                rooms =  xhr.response.data.rooms;
            }
        queryExecuted();
        }
    }
}

// Запустить после выполнения запроса
function queryExecuted() {
    fillFields();
    onTimeChange();
    removeEvent();
    updateEvent();
    checkCorrectData();
    task2(); // выполнить скрипт из 2 задания по верстке
}

// Заполнить поля на форме
function fillFields() {
    $('.newMeetingCell.cell6 input').value = event.title;
    $('.newMeetingCell.cell7 input').value = event.dateStart.substr(0,4) +"-"+ event.dateStart.substr(5,2) +"-"+ event.dateStart.substr(8,2);
    $('.newMeetingCell.cell8 input').value = event.dateStart.substr(11,5);
    $('.newMeetingCell.cell10 input').value = event.dateEnd.substr(11,5);
    $('#room').children[0].innerText = event.dateStart.substr(11,5) + '—' + event.dateEnd.substr(11,5);
    $('#room').children[1].innerText = event.room.title + ' · ' + event.room.floor + ' этаж';
    $('#room').setAttribute('data-room-id', event.room.id);
    $('#room').style.display = 'block';

    for (var i = 0; i < users.length; i++) {
        var newUser = document.createElement('div');
        newUser.classList.add('dropdown__Users-line');
        newUser.setAttribute('data-user-id', users[i].id);
        newUser.setAttribute('data-user-login', users[i].login);

        var newUserLogo = document.createElement('img');
        newUserLogo.setAttribute('src', users[i].avatarUrl);   

        newUser.appendChild(newUserLogo);
        newUser.appendChild( document.createTextNode(users[i].login + ' · ' + users[i].homeFloor + ' этаж') );
        $('.dropdown__Users').appendChild(newUser);
    }

    for (var j = 0; j < event.users.length; j++) {
        var selectedUser = document.createElement('span');
        selectedUser.classList.add('selected__Users-items');
        selectedUser.setAttribute('data-user-id', event.users[j].id);
        selectedUser.setAttribute('data-user-login', event.users[j].login);

        var selectedUserLogo = document.createElement('img');
        selectedUserLogo.classList.add('userAvatar');
        selectedUserLogo.setAttribute('src', event.users[j].avatarUrl);

        var SelectedUserName = document.createTextNode(event.users[j].login);

        var SelectedUserCloseBtn = document.createElement('img');
        SelectedUserCloseBtn.classList.add('closeBtn');
        SelectedUserCloseBtn.setAttribute('src', 'assets/close.svg');

        selectedUser.appendChild(selectedUserLogo);
        selectedUser.appendChild(SelectedUserName);
        selectedUser.appendChild(SelectedUserCloseBtn);
        $('.selected__Users').appendChild(selectedUser);	

        selectedUser.children[1].onclick = function() {
            selectedUsersArea.removeChild(this.parentElement);
        }
    }
}

// Показать доступные переговорки при изменении времени
function onTimeChange() {
    $('.newMeetingCell.cell8 > input').onchange = function() {
        if (($('.newMeetingCell.cell10 > input').value).length == 5) addRooms( $('.newMeetingCell.cell8 > input').value , $('.newMeetingCell.cell10 > input').value );
    }
    $('.newMeetingCell.cell10 > input').onchange = function() {
        if (($('.newMeetingCell.cell8 > input').value).length == 5) addRooms($('.newMeetingCell.cell8 > input').value, $('.newMeetingCell.cell10 > input').value);
    }
}

function addRooms(startAt, endAt) {
    
    $('#room').style.display = 'none';
    var clearRecommendedRooms = document.createElement('div');
	clearRecommendedRooms.classList.add('recommendedrooms');
    $('.newMeetingCell.cell12').replaceChild(clearRecommendedRooms, $('.recommendedrooms') );
    $('.recommendedrooms').style.marginTop = "0";
    
    for (let index = 0; index < rooms.length; index++) {
        var divRoom = document.createElement('div');
        divRoom.classList.add('recommendedrooms__room');
        divRoom.setAttribute('data-room-id', rooms[index].id);

        var spanRoomTime = document.createElement('span');
        spanRoomTime.classList.add('recommendedrooms__room-time');
        spanRoomTime.innerHTML = startAt + '—' + endAt;

        var spanRoomTitleAndFloor = document.createElement('span');
        spanRoomTitleAndFloor.classList.add('recommendedrooms__room-titleANDfloor');
        spanRoomTitleAndFloor.innerHTML = rooms[index].title + ' · ' + rooms[index].floor;

        divRoom.appendChild(spanRoomTime);
        divRoom.appendChild(spanRoomTitleAndFloor);
        $('.recommendedrooms').appendChild(divRoom);

        var chosenRoom = $('.newMeetingCell.cell12 > #room');
        divRoom.onclick = function() {
            chosenRoom.children[0].innerHTML = this.children[0].innerHTML;
            chosenRoom.children[1].innerHTML = this.children[1].innerHTML;
            chosenRoom.setAttribute('data-room-id', this.getAttribute('data-room-id'));
            $('.newMeetingTable2 .newMeetingCell.cell2').innerHTML = "Ваша переговорка";
            $('.recommendedrooms').style.display = "none";
            chosenRoom.style.display = "block";

            $('.newMeetingCell.cell8 input').value = this.children[0].innerHTML.split("—")[0];
            $('.newMeetingCell.cell10 input').value = this.children[0].innerHTML.split("—")[1];
        }
    }
}

// Удалить встречу
function removeEvent() {
    $('.popupMeetingDelete__main > button.delete').onclick = function() {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/graphql");
        xhr.responseType = 'json';
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Accept", "application/json");
        xhr.send(JSON.stringify({query: "mutation {removeEvent(id: " + getQueryString().eventID + ") {id}}"}));
        xhr.onreadystatechange = function () {
            if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                location.href="index.html";
            }
        }
    }
}

// Изменить встречу
function updateEvent() {
    $('.footer > button.save').onclick = function() {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/graphql");
        xhr.responseType = 'json';
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Accept", "application/json");
        console.log("mutation {updateEvent(id:"+ getQueryString().eventID +", input:{title:\""+ $('.newMeetingCell.cell6 input').value +"\", dateStart:\""+ $('.newMeetingCell.cell7 input').value + "T" + $('.newMeetingCell.cell8 input').value +":00.000Z\", dateEnd:\""+ $('.newMeetingCell.cell7 input').value + "T" + $('.newMeetingCell.cell10 input').value +":00.000Z\"}) {id} changeEventRoom(id: "+ getQueryString().eventID +", roomId: "+ $('#room').getAttribute('data-room-id') +") {id} addUserToEvent(id:1, usersIds:["+ userIDs() +"]) {id}}");
        xhr.send(JSON.stringify({query: "mutation {updateEvent(id:"+ getQueryString().eventID +", input:{title:\""+ $('.newMeetingCell.cell6 input').value +"\", dateStart:\""+ $('.newMeetingCell.cell7 input').value + "T" + $('.newMeetingCell.cell8 input').value +":00.000Z\", dateEnd:\""+ $('.newMeetingCell.cell7 input').value + "T" + $('.newMeetingCell.cell10 input').value +":00.000Z\"}) {id} changeEventRoom(id: "+ getQueryString().eventID +", roomId: "+ $('#room').getAttribute('data-room-id') +") {id} addUserToEvent(id:"+ getQueryString().eventID +", usersIds:["+ userIDs() +"]) {id}}"}));
        xhr.onreadystatechange = function () {
            if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                location.href="index.html";
            }
        }
    }
}

function spellMonth(monthNumber) {
    var monthsArray = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    return monthsArray[monthNumber-1];
}

 // Функция для чтения данных, которые переданы при GET запросе (в адресной строке).
 function getQueryString() {

    var args = {};                                  // пустой объект
    // login=admin password=123
    var query = location.search.substring(1);       // Получение строки запроса.
    var pairs = query.split("&");                   // Разделение строки по амперсанду

    for (var i = 0; i < pairs.length; i++) {

        var pos = pairs[i].indexOf('=');            // Проверка пары "name=value"
        if (pos == -1) {                            // Если не найдено - пропустить
            continue;                    
        }

        var argname = pairs[i].substring(0, pos);   // Получение имени
        var value = pairs[i].substring(pos + 1);    // Получение значения

        args[argname] = value;                      // Сохранение как свойства

    }

    return args;
}
// ----------

// Получить участников встречи
function userIDs() {
    var users = "";
    var divUsers = document.getElementsByClassName('selected__Users-items');
    // divUsers.sort(compareNumeric);
    if ( divUsers.length > 0 ) {
        users = divUsers[0].getAttribute('data-user-id');
        for (let index = 0; index < divUsers.length; index++) {
            if (index !== 0) users = users + ',' + divUsers[index].getAttribute('data-user-id');
        }
    }
    return users;
}
// ----------

// Проверка ввода правильности даты, времени начала и окончания
function checkCorrectData() {
    //Запрет ввода в поля время начала и время окончания ничего кроме цифр, в поле дата только дату в формате 2018-12-25
    $('.newMeetingCell.cell8 > input').onkeydown = function (e) {
        var e = event || window.event;
        if ( (this.value).length > 5 ) return false;
        if ( ((this.value).length  == 2) && ( e.keyCode !== 8 && e.keyCode !== 9 && e.keyCode !== 37 && e.keyCode !== 39) ) {
            return false;
        }
        if ( (this.value).length <= 1 || (this.value).length >= 2 ) {
            if ( (e.keyCode < 48 || e.keyCode > 57) && e.keyCode !== 8 && e.keyCode !== 9 && e.keyCode !== 37 && e.keyCode !== 39) {
                return false;
            }
        }
    }
    $('.newMeetingCell.cell8 > input').onkeyup = function (e) {
        var e = event || window.event;
        if ( ((this.value).length == 2) && ( e.keyCode !== 8 && e.keyCode !== 9 && e.keyCode !== 37 && e.keyCode !== 39) ) {
            if ( e.keyCode >= 48 && e.keyCode <= 57 ) { 
                this.value = this.value + ':';
            }
        } else if ( (this.value).length > 5 ) {
            this.value = this.value.substr(0,5);
        }
    }

    $('.newMeetingCell.cell10 > input').onkeydown = function (e) {
        var e = event || window.event;
        if ( (this.value).length > 5 ) return false;
        if ( (this.value).length  == 2 ) {
            return false;
        }
        if ( (this.value).length <= 1 || (this.value).length >= 3 ) {
            if ( (e.keyCode < 48 || e.keyCode > 57) && e.keyCode !== 8 && e.keyCode !== 9 && e.keyCode !== 37 && e.keyCode !== 39) {
                return false;
            }
        }
    }
    $('.newMeetingCell.cell10 > input').onkeyup = function (e) {
        var e = event || window.event;
        if ( (this.value).length == 2 ) {
            if ( e.keyCode >= 48 && e.keyCode <= 57 ) { 
                this.value = this.value + ':';
            }
        } else if ( (this.value).length > 5 ) {
            this.value = this.value.substr(0,5);
        }
    }

    $('.newMeetingCell.cell7 > input').onkeydown = function (e) { 
        var e = event || window.event;
        if ( (this.value).length > 10 ) return false;
        if ( ((this.value).length  == 4 || (this.value).length  == 7 ) && ( e.keyCode !== 8 && e.keyCode !== 9 && e.keyCode !== 37 && e.keyCode !== 39) ) {
            return false;
        }
        if ( (this.value).length <= 3 || ( (this.value).length >= 4 && (this.value).length <= 5 ) || (this.value).length >= 7 ) {
            if ( (e.keyCode < 48 || e.keyCode > 57) && e.keyCode !== 8 && e.keyCode !== 9 && e.keyCode !== 37 && e.keyCode !== 39) {
                return false;
            }
        }
    }
    $('.newMeetingCell.cell7 > input').onkeyup = function (e) { 
        var e = event || window.event;
        if ( (this.value).length == 4 ) {
            if ( e.keyCode >= 48 && e.keyCode <= 57 ) { 
                this.value = this.value + '-';
            }
        } else if ( (this.value).length == 7 ) {
            if ( e.keyCode >= 48 && e.keyCode <= 57 ) { 
                this.value = this.value + '-';
            }
        } else if ( (this.value).length > 10 ) {
            this.value = this.value.substr(0,10);
        }
    }
}
// ----------

function compareNumeric(a, b) {
    if (a.getAttribute('data-user-id') > b.getAttribute('data-user-id')) return 1;
    if (a.getAttribute('data-user-id') < b.getAttribute('data-user-id')) return -1;
  }

function $(elem) {
	return document.querySelector(elem);
}
function $All(elem) {
	return document.querySelectorAll(elem);
}
