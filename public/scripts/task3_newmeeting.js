var event, users, rooms;
get();

function get() {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/graphql");
    xhr.responseType = 'json';
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Accept", "application/json");
    xhr.send(JSON.stringify({query: "query {rooms {id title capacity floor} users {id login homeFloor avatarUrl}}"}));
    xhr.onreadystatechange = function () {
        if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
             if (typeof xhr.response === 'string') {
            //     event = JSON.parse(xhr.response).data.event;
                users = JSON.parse(xhr.response).data.users;
                rooms = JSON.parse(xhr.response).data.rooms;
            } else {
                // event =  xhr.response.data.event;
                users =  xhr.response.data.users;
                rooms =  xhr.response.data.rooms;
            }
        // console.log(users, rooms);
        queryExecuted();
        }
    }
}

function queryExecuted() {
    dropdownUserList();
    onTimeChange();
    createEvent();
    checkCorrectData();
    task2();
}

function createEvent() {
    $('.footer > .createmeeting').onclick = function() {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/graphql");
        xhr.responseType = 'json';
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Accept", "application/json");
        xhr.send(JSON.stringify({query: "mutation {createEvent(input:{title:\""+ $('.newMeetingCell.cell6 input').value +"\", dateStart:\""+ $('.newMeetingCell.cell7 input').value + "T" + $('.newMeetingCell.cell8 input').value +":00.000Z\", dateEnd:\""+ $('.newMeetingCell.cell7 input').value + "T" + $('.newMeetingCell.cell10 input').value +":00.000Z\"}, usersIds:["+ userIDs() +"], roomId:"+ $('#room').getAttribute('data-room-id') +") {id title dateStart dateEnd users {id} room {id}}}"}));
        xhr.onreadystatechange = function () {
            if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                location.href="index.html";
            }
        }
    }
}

// Заполнить выпадающий список спиком пользователей
function dropdownUserList() {

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
    $('.newMeetingTable2 .newMeetingCell.cell2').innerHTML = 'Рекомендованные переговорки';

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
    $('.newMeetingCell.cell8 > input').onkeydown = function (event) {
        var event = event || window.event;
        if ( (this.value).length > 5 ) return false;
        if ( ((this.value).length  == 2) && ( event.keyCode !== 8 && event.keyCode !== 9 && event.keyCode !== 37 && event.keyCode !== 39) ) {
            return false;
        }
        if ( (this.value).length <= 1 || (this.value).length >= 2 ) {
            if ( (event.keyCode < 48 || event.keyCode > 57) && event.keyCode !== 8 && event.keyCode !== 9 && event.keyCode !== 37 && event.keyCode !== 39) {
                return false;
            }
        }
    }
    $('.newMeetingCell.cell8 > input').onkeyup = function (event) {
        var event = event || window.event;
        if ( ((this.value).length == 2) && ( event.keyCode !== 8 && event.keyCode !== 9 && event.keyCode !== 37 && event.keyCode !== 39) ) {
            if ( event.keyCode >= 48 && event.keyCode <= 57 ) { 
                this.value = this.value + ':';
            }
        } else if ( (this.value).length > 5 ) {
            this.value = this.value.substr(0,5);
        }
    }

    $('.newMeetingCell.cell10 > input').onkeydown = function (event) {
        var event = event || window.event;
        if ( (this.value).length > 5 ) return false;
        if ( ((this.value).length  == 2) && ( event.keyCode !== 8 && event.keyCode !== 9 && event.keyCode !== 37 && event.keyCode !== 39) ) {
            return false;
        }
        if ( (this.value).length <= 1 || (this.value).length >= 2 ) {
            if ( (event.keyCode < 48 || event.keyCode > 57) && event.keyCode !== 8 && event.keyCode !== 9 && event.keyCode !== 37 && event.keyCode !== 39) {
                return false;
            }
        }
    }
    $('.newMeetingCell.cell10 > input').onkeyup = function (event) {
        var event = event || window.event;
        if ( (this.value).length == 2 ) {
            if ( event.keyCode >= 48 && event.keyCode <= 57 ) { 
                this.value = this.value + ':';
            }
        } else if ( (this.value).length > 5 ) {
            this.value = this.value.substr(0,5);
        }
    }

    $('.newMeetingCell.cell7 > input').onkeydown = function (event) { 
        var event = event || window.event;
        if ( (this.value).length > 10 ) return false;
        if ( ((this.value).length  == 4 || (this.value).length  == 7 ) && ( event.keyCode !== 8 && event.keyCode !== 9 && event.keyCode !== 37 && event.keyCode !== 39) ) {
            return false;
        }
        if ( (this.value).length <= 3 || ( (this.value).length >= 4 && (this.value).length <= 5 ) || (this.value).length >= 7 ) {
            if ( (event.keyCode < 48 || event.keyCode > 57) && event.keyCode !== 8 && event.keyCode !== 9 && event.keyCode !== 37 && event.keyCode !== 39) {
                return false;
            }
        }
    }
    $('.newMeetingCell.cell7 > input').onkeyup = function (event) { 
        var event = event || window.event;
        if ( (this.value).length == 4 ) {
            if ( event.keyCode >= 48 && event.keyCode <= 57 ) { 
                this.value = this.value + '-';
            }
        } else if ( (this.value).length == 7 ) {
            if ( event.keyCode >= 48 && event.keyCode <= 57 ) { 
                this.value = this.value + '-';
            }
        } else if ( (this.value).length > 10 ) {
            this.value = this.value.substr(0,10);
        }
    }
}
// ----------

function $(elem) {
	return document.querySelector(elem);
}
function $All(elem) {
	return document.querySelectorAll(elem);
}