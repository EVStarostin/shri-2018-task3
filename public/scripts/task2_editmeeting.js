function task2() {

	$('.recommendedrooms').style.display = "none";

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
		
		addRooms( $('.newMeetingCell.cell8 input' ).value, $('.newMeetingCell.cell10 input').value);
		$('.recommendedrooms').style.marginTop = "0";
		$('.recommendedrooms').childNodes[0].data = "";
		$('.recommendedrooms').style.display = "block";
		$('.newMeetingTable2 .newMeetingCell.cell2').innerHTML = "Рекомендованные переговорки";
		chosenRoom.style.display = "none";
		
	}
	// ----------

	//Показать и скрыть всплывающее окно удаления встречи
	$('.footer > button.delete').onclick = function() {
		$('.fixed-overlay-delete').style.display = "block";
	}
	$('.popupMeetingDelete__main > button.cancel').onclick = function() {
		$('.fixed-overlay-delete').style.display = "none";
	}
	// ----------

	// Поиск участников при активации текстового поля
	var selectedUsersArea = $('.selected__Users');
	var dropdownArea = $('.dropdown__Users');
	dropdownArea.style.display = "none";

	var selectedUsers = $All('.selected__Users-items');

	for (var i = 0; i < selectedUsers.length; i++) {
		selectedUsers[i].children[1].onclick = function() {
			// this.parentElement.style.display = "none";
			this.parentElement.parentElement.removeChild(this.parentElement);
		}
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