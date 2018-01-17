function task2() {
    //Если на главную страницу был переход со страницы creatmeeting.html и параметр meetingCreated="success", то показываем всплывающее сообщение встреча создана
    var myLocation = window.location;
    var myParams = decodeURIComponent(myLocation.search.substr(1)).split('&')

    for (var i = 0; i < myParams.length; i++) {

    /*Для простоты отладки в условии не проверяется, с какой именно страницы пришел клиент. На сервере условие бы включало проверку document.referrer:
        ---
        if (document.referrer == myLocation.protocol + "//" + myLocation.hostname + "/ya_academy/newmeeting.html" && myParams[i] === "meetingCreated=success")
        --- 
    */
        if (myParams[i] === "meetingCreated=success")
        {
            $('.fixed-overlay-create').style.display = "block";
        };
        // Закрытие PopUp окна встреча создана при клике по кнопке Хорошо
        $('.popupMeetingCreated__main > button').onclick = function() {
            window.location = myLocation.pathname;
        }

    }
    // ----------

    // Появление ToolTip при нажатии на встречу
    var takenBlocks = $All('.schedule-block.taken');
    for (var index = 0; index < takenBlocks.length; index++) {
        
        takenBlocks[index].onclick = function() {
            this.children[0].style.display = "block";
        }
        
    }
    // ----------

    // При нажатии на текущую дату отображать календарь
    var currentDateSpan = $('.datetime__date-wrapper span');
    currentDateSpan.onclick = function() {
        currentDateSpan.classList.add("clicked");
        this.parentElement.children[3].style.display = "block";
    }
    // ----------	

    // Закрытие ToolTip при клике на любую область кроме кнопки редактировать
    // Закрытие календаря при клике на любую область кроме календаря
    var containersToolTip = $All('.tooltip');
    var containerPopUpCreated = $('.popupMeetingCreated__main');
    var containerCalendar = $('.calendar__wrapper');

    document.onclick = function(e) {
        for (var index = 0; index < containersToolTip.length; index++) {
            
            if (!containersToolTip[index].contains(e.target) && e.target !== containersToolTip[index].parentElement) {
                containersToolTip[index].style.display = "none";
            }
    
        }
        if (!containerCalendar.contains(e.target) && e.target !== currentDateSpan) {
            currentDateSpan.classList.remove("clicked");
            containerCalendar.style.display = "none";
        }
    }
    // ----------

    // Выбор даты из всплывающего календаря
        var calendarDates = containerCalendar.querySelectorAll('.calendar__container > div > div > div > div');
        for (var i = 0; i < calendarDates.length; i++) {
            calendarDates[i].onclick = function(e) {
                var chosenDay = e.target.innerHTML;
                var chosenMonth = e.target.parentElement.parentElement.parentElement.getAttribute('data-month');
                var chosenYear = e.target.parentElement.parentElement.parentElement.getAttribute('data-year');

                d.setDate(chosenDay);
                d.setMonth(chosenMonth-1);
                d.setFullYear(chosenYear);

                if (chosenYear == new Date().getFullYear() && chosenMonth-1 == new Date().getMonth() && chosenDay == new Date().getDate()) {
                    var addYear = ' · Сегодня';
                } else {
                    var addYear = chosenYear;
                }
                currentDateSpan.classList.remove("clicked");
                containerCalendar.style.display = "none";

                // data-day="14" data-month="дек" data-year="2017"
                currentDateSpan.setAttribute('data-day', chosenDay);
                currentDateSpan.setAttribute('data-month', chosenMonth);
                currentDateSpan.setAttribute('data-year', chosenYear);
                currentDateSpan.innerHTML = chosenDay + ' ' + getLocalMonth(chosenMonth-1) + ' ' + addYear;
                queryGetEvents();
            }
        }
    // ----------

    // Вертикальная полоса отображает текущее время.
    // Чтобы продемонстрировать работу для проверяющего это задание ночью:
    // Если сейчас меньше 8 часов или больше 23 часов, то прибавляем +12 часов.
    function setCurrentTime() {
        var t = new Date();
        if (t.getHours() < 8 || t.getHours() > 22) t.setHours(t.getHours() + 12);
        
        var divCurrentTime = $('.datetime__main-currentTime');
        divCurrentTime.innerHTML = addZeroToTime(t.getHours()) + ":" + addZeroToTime(t.getMinutes());
        divCurrentTime.style.left = (250 + (t.getHours()*60 + t.getMinutes() - 480)*1.1) + "px";
        divCurrentTime.style.display = "block";
        var hr = document.createElement('hr');
        hr.style.height = $('.content__table').scrollHeight + 12 + "px";
        divCurrentTime.appendChild(hr);
    }

    function addZeroToTime(i) {
        if (i<10) i="0" + i;
        return i;
    }

    setInterval(setCurrentTime, 60000)
    setCurrentTime();
    // ----------

    //Выводим вверху страницы текущую дату
    //Прибавляем и отнимаем день при нажатии на стрелочки рядом с датой
    function getLocalMonth(monthNumber) {
        var months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

        return months[monthNumber];
    }

    if (initialDate === true) {
        var d = new Date(); 
        currentDateSpan.setAttribute('data-day', d.getDate());
        currentDateSpan.setAttribute('data-month', d.getMonth()+1);
        currentDateSpan.setAttribute('data-year', d.getFullYear());
        currentDateSpan.innerHTML = d.getDate() + ' ' + getLocalMonth( d.getMonth() ) + ' · Сегодня';
        initialDate = false;
    } else {
        var d = new Date( currentDateSpan.getAttribute('data-year') , currentDateSpan.getAttribute('data-month')-1 , currentDateSpan.getAttribute('data-day') );
    }

    $('#leftArrow').onclick = function() {
        d.setDate(d.getDate() - 1);

        if (d.getFullYear() == new Date().getFullYear() && d.getMonth() == new Date().getMonth() && d.getDate() == new Date().getDate()) {
            var addYear = ' · Сегодня';
        } else {
            var addYear = d.getFullYear();
        }

        currentDateSpan.setAttribute('data-day', d.getDate());
        currentDateSpan.setAttribute('data-month', d.getMonth()+1);
        currentDateSpan.setAttribute('data-year', d.getFullYear());
        currentDateSpan.innerHTML = d.getDate() + ' ' + getLocalMonth( d.getMonth() ) + ' '+ addYear;
        queryGetEvents();
    }

    $('#rightArrow').onclick = function() {
        d.setDate(d.getDate() + 1);

        if (d.getFullYear() == new Date().getFullYear() && d.getMonth() == new Date().getMonth() && d.getDate() == new Date().getDate()) {
            var addText = ' · Сегодня';
            var addYear = '';
        } else {
            var addText = '';
            var addYear = d.getFullYear();
        }

        currentDateSpan.setAttribute('data-day', d.getDate());
        currentDateSpan.setAttribute('data-month', d.getMonth()+1);
        currentDateSpan.setAttribute('data-year', d.getFullYear());
        currentDateSpan.innerHTML = d.getDate() + ' ' + getLocalMonth( d.getMonth() ) + ' ' + addYear + addText;
        queryGetEvents();
    }
    // ----------

    //Отображать название занятых переговорок менее контрастно
    //Подсвечивать название комнаты при наведении на свободное время
    var divRoomsRow = $All('.content__row');
    for (var i = 0; i < divRoomsRow.length; i++) {
        
        if (divRoomsRow[i].querySelectorAll('.schedule-block.free').length == 0 && divRoomsRow[i].classList.contains('row-floor') == false) {

            for (var j = 0; j < divRoomsRow[i].length; j++) {
                divRoomsRow[i][j].classList.add('packed');
            }

        }

        var freeTimes = divRoomsRow[i].querySelectorAll('.schedule-block.free');
        for (var k = 0; k < freeTimes.length; k++) {

            freeTimes[k].addEventListener("mouseenter", function(e) {
                e.target.parentNode.parentNode.children[0].children[0].classList.add('selectedRoom');
            });
            freeTimes[k].addEventListener("mouseleave", function(e) {
                e.target.parentNode.parentNode.children[0].children[0].classList.remove('selectedRoom');
            });

        }

    };
    // ----------	

    // При нажатии на кнопку Создать встречу открывать страницу newmeeting.html с параметром текущая дата
    $('#header__create-meeting-btn').onclick = function() {
        location.href="newmeeting.html?date=" + currentDateSpan.getAttribute('data-year') + '-' + addZeroToTime( currentDateSpan.getAttribute('data-month') ) + '-' + currentDateSpan.getAttribute('data-day');
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

// При нажатии на 
    
// ----------

function $(elem) {
	return document.querySelector(elem);
}
function $All(elem) {
	return document.querySelectorAll(elem);
}