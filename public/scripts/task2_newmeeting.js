function task2() {
    if ( getQueryString().date !== undefined ) $('.newMeetingCell.cell7 > input').value = getQueryString().date;
    if ( getQueryString().startAt !== undefined ) $('.newMeetingCell.cell8 > input').value = getQueryString().startAt;
    if ( getQueryString().endAt !== undefined ) $('.newMeetingCell.cell10 > input').value = getQueryString().endAt;

    if ( getQueryString().roomID !== undefined ) {

        for (let index = 0; index < rooms.length; index++) {
            const element = rooms[index];
            if ( element.id == getQueryString().roomID ) {
                $('#room').children[0].innerText = getQueryString().startAt + '—' + getQueryString().endAt;
                $('#room').children[1].innerText = element.title + ' · ' + element.floor + ' этаж';
                $('#room').setAttribute('data-room-id', element.id);
                $('#room').style.display = 'block';
                $('.recommendedrooms').style.display = "none";
                $('.newMeetingTable2 .newMeetingCell.cell2').innerHTML = "Ваша переговорка";
            }
        }
    }

    // $('.newMeetingTable2 .newMeetingCell.cell2').innerHTML = "Рекомендованные переговорки";
    $('.recommendedrooms').style.display = "none";
    $('.recommendedrooms').style.marginTop = "0";
    $('.recommendedrooms').childNodes[0].data = "";

    // Отображать только выбранную переговорку
    // При нажатии на крести рядом с выбранной переговоркой отображать список доступных переговорок
    var recommendedRooms = $All('.recommendedrooms__room');
    var chosenRoom = $('.newMeetingCell.cell12 > #room');

    for (var i = 0; i < recommendedRooms.length; i++) {

        recommendedRooms[i].onclick = function() {
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

    $('.cell12 #room > img').onclick = function() {
        addRooms(getQueryString().startAt, getQueryString().endAt);
        $('.recommendedrooms').style.display = "block";
        $('.newMeetingTable2 .newMeetingCell.cell2').innerHTML = "Рекомендованные переговорки";
        chosenRoom.style.display = "none";

        // $('.newMeetingCell.cell8 input').value = "";
        // $('.newMeetingCell.cell10 input').value = "";
    }
    // ----------

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

    // Дата прописью
    function spellingDate(date) {
        var dateArr = date.split('.');
        var months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
        return dateArr[0]+' ' + months[ dateArr[1]-1 ] + ', ' + dateArr[2];
    }
    // ----------

    // Поиск участников при активации текстового поля
    var selectedUsersArea = $('.selected__Users');
    var dropdownArea = $('.dropdown__Users');
    dropdownArea.style.display = "none";

    var selectedUsers = $All('.selected__Users-items');
    for (var i = 0; i < selectedUsers.length; i++) {
        selectedUsers[i].style.display = "none";
    }

    var dropdownUsers = $All('.dropdown__Users-line');   	
    for (var j = 0; j < dropdownUsers.length; j++) {
        dropdownUsers[j].style.display = "none";
    }

    var inputUser = $('.newMeetingCell.cell11 > input');
    inputUser.onfocus = function() {
        dropdownArea.style.display = "block";
        
        for (var i = 0; i < dropdownUsers.length; i++) {
            if (dropdownUsers[i].innerText.toLowerCase().indexOf(inputUser.value.toLowerCase()) !== -1 && userWasNotSelected(dropdownUsers[i]))  {
                dropdownUsers[i].style.display = "block";
            } else {
                dropdownUsers[i].style.display = "none";
            }
        }

    }

    inputUser.onkeyup = function() { 
        for (var i = 0; i < dropdownUsers.length; i++) {
            if (dropdownUsers[i].innerText.toLowerCase().indexOf(inputUser.value.toLowerCase()) !== -1) {
                dropdownUsers[i].style.display = "block";
            } else {
                dropdownUsers[i].style.display = "none";
            }
        }
    }

    for (var k = 0; k < dropdownUsers.length; k++) {
        dropdownUsers[k].onclick = function() {
            var newSelectedUser = document.createElement('span');
            newSelectedUser.classList.add('selected__Users-items');
            newSelectedUser.setAttribute('data-user-id', this.getAttribute('data-user-id'));
            newSelectedUser.setAttribute('data-user-login', this.getAttribute('data-user-login'));

            var newSelectedUserLogo = document.createElement('img');
            newSelectedUserLogo.classList.add('userAvatar');
            newSelectedUserLogo.setAttribute('src', this.children[0].src);

            var newSelectedUserName = document.createTextNode(this.getAttribute('data-user-login'));

            var newSelectedUserCloseBtn = document.createElement('img');
            newSelectedUserCloseBtn.classList.add('closeBtn');
            newSelectedUserCloseBtn.setAttribute('src', 'assets/close.svg');

            newSelectedUser.appendChild(newSelectedUserLogo);
            newSelectedUser.appendChild(newSelectedUserName);
            newSelectedUser.appendChild(newSelectedUserCloseBtn);
            selectedUsersArea.appendChild(newSelectedUser);	

            newSelectedUser.children[1].onclick = function() {
                selectedUsersArea.removeChild(this.parentElement);
            }

            dropdownArea.style.display = "none";
            inputUser.value = "";
        }
    }

    inputUser.onblur = function() { 
        setTimeout( '$(\'.dropdown__Users\').style.display = "none"' , 100);
    }
    // ----------  

    // Проверим, чтобы в выпадающем списке были только не выбранные пользователи
    function userWasNotSelected(user) {
        var isUserWasNotUsed = true;
        var selectedUsers = $All('.selected__Users-items')
        for (let index = 0; index < selectedUsers.length; index++) {
            if ( selectedUsers[index].getAttribute('data-user-id') == user.getAttribute('data-user-id') ) isUserWasNotUsed = false;
        }
        return isUserWasNotUsed;
    }
    // ----------

    function $(elem) {
        return document.querySelector(elem);
    }
    function $All(elem) {
        return document.querySelectorAll(elem);
    }
}