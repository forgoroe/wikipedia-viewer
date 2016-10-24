window.onload = function() {
    var basicUrlRequest = 'https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&utf8=1&srsearch=';
    var basicRandomPageRequest = 'https://en.wikipedia.org/w/api.php?action=query&format=json&list=random&rnnamespace=0&rnlimit=1';
    var basicInfoRequest = 'https://en.wikipedia.org/w/api.php?action=query&format=json&indexpageids=1&pilimit=10&pithumbsize=100&prop=pageimages%7Cextracts%7Cinfo&exintro=1&explaintext=1&exlimit=max&inprop=url&titles=';
    var basicPageIdRequest = 'https://en.wikipedia.org/w/api.php?action=query&indexpageids=&format=json&titles=';

    var callback = '&callback=?';
    var previousSearchWord = '';
    var searchWord;

    setInterval(function() {
        if (checkInput()) {
            search();
        }
    }, 1500);

    document.getElementById('searchInput').onkeydown = function(e) {
        if (e.keyCode == 13) {
            if (checkInput()) {
                search();
            }
            return false;
        }
    };

    document.getElementById('searchButton').onclick = function() {
        if (checkInput()) {
            search();
        }
    };

    document.getElementById('randomPageButton').onclick = function() {
        fetchData('', true);
    };

    document.getElementById('resetButton').onclick = function() {
        var resultList = document.getElementById('resultList');
        removePreviousResults(resultList);
    }

    function checkInput() {
        searchWord = document.getElementById('searchInput').value;
        if (previousSearchWord == searchWord) {

            previousSearchWord = searchWord;
            return false;
        } else {
            previousSearchWord = searchWord;
            return true;
        }
    }

    function scrollToResults() {
        if (window.isMobile = /iphone|ipod|ipad|android|blackberry|opera mini|opera mobi|skyfire|maemo|windows phone|palm|iemobile|symbian|symbianos|fennec/i.test(navigator.userAgent.toLowerCase())) {
            $('html, body').animate({
                scrollTop: $("#resultList").offset().top
            }, 2000);
        }
    }

    function search() {
        var searchWord = document.getElementById('searchInput').value;
        var resultList = document.getElementById('resultList');
        if (searchWord == '') {
            removePreviousResults(resultList);
        } else {
            fetchData(searchWord);

        }
    }
    //jumping through hoops and loops just to make the API work
    function fetchData(searchWord, randomPage) {
        $('#resultList').hide(100);
        $('iframe').hide(100);
        var fullRequest;
        var pages = [];
        var titlesForInfoRequest = '';
        var searchOrRandom;

        if (randomPage) {
            fullRequest = basicRandomPageRequest + callback;
            searchOrRandom = 'random';
        } else {
            fullRequest = basicUrlRequest + searchWord + callback;
            searchOrRandom = 'search';
        }

        $.getJSON(fullRequest, function(data) {
            var titleArray = data.query[searchOrRandom];
            for (var i = 0; i < data.query[searchOrRandom].length; i++) {
                titlesForInfoRequest += titleArray[i].title + '|';
                pages.push({
                    'id': titleArray[i].id,
                    'title': titleArray[i].title
                });
            }
            $.getJSON(basicPageIdRequest + titlesForInfoRequest + callback, function(pageIds) {
                for (var i = 0; i < pages.length; i++) {
                    for (var key in pageIds.query.pages) {
                        if (pageIds.query.pages[key].title == pages[i].title) {
                            pages[i].id = pageIds.query.pages[key].pageid;
                        }
                    }
                }
                $.getJSON(basicInfoRequest + titlesForInfoRequest + callback, function(indepthData) {
                    var currentPageId;
                    for (var i = 0; i < pages.length; i++) {
                        currentPageId = pages[i].id;
                        if (indepthData.query.pages[currentPageId].hasOwnProperty('extract')) {
                            pages[i].extract = indepthData.query.pages[currentPageId].extract;
                        }
                        if (indepthData.query.pages[currentPageId].hasOwnProperty('thumbnail')) {
                            pages[i].thumbnailsrc = indepthData.query.pages[currentPageId].thumbnail.source;
                        }
                        if (indepthData.query.pages[currentPageId].hasOwnProperty('fullurl')) {
                            pages[i].url = indepthData.query.pages[currentPageId].fullurl;
                        }
                    }
                    displayResults(pages);
                });
            });
        });
    }

    function displayResults(pages) {
        var resultList = document.getElementById("resultList");
        removePreviousResults(resultList);

        for (var i = 0; i < pages.length; i++) {
            var titleData = pages[i].title;
            var infoData = pages[i].extract;
            var pageURLData = pages[i].url;
            var thumbnailSource = 'http://res.cloudinary.com/forgoroe/image/upload/c_scale,w_100/v1476883031/logos/2000px-Wikipedia-logo-v2-en.svg.png';
            if (pages[i].thumbnailsrc) {
                thumbnailSource = pages[i].thumbnailsrc;
            }

            var liElement = document.createElement("li");
            var anchorElement = document.createElement("a");
            var h2Element = document.createElement("h2");
            var pElement = document.createElement("p");
            var p2Element = document.createElement("p");

            var titleNode = document.createTextNode(titleData);
            var infoNode = document.createTextNode(infoData);

            anchorElement.href = pageURLData;
            anchorElement.setAttribute('target', '_blank')
            liElement.className = 'list-group-item clearfix';
            h2Element.className = 'list-group-item-heading';

            pElement.className = 'list-group-item-text';
            p2Element.className = 'list-group-item-text';
            p2Element.style = 'margin-top:6px; margin-bottom:6px;';

            h2Element.innerHTML = '<span style="padding-right:3px; padding-top: 3px; display:inline-block;">' +
                '<img src="' + thumbnailSource + '"></span>';
            p2Element.innerHTML = '<button type="button" class="btn btn-default btn-sm">' +
                '<span class="glyphicon glyphicon-eye-open"></span> Preview </button>';

            h2Element.appendChild(titleNode);
            anchorElement.appendChild(h2Element);

            pElement.appendChild(p2Element);
            pElement.appendChild(infoNode);

            liElement.appendChild(anchorElement);
            liElement.appendChild(pElement);
            resultList.appendChild(liElement);

            document.getElementsByClassName('btn btn-default btn-sm')[i].onclick = (function() {
                var currentSrc = pages[i].url;
                return function() {
                    $('iframe').hide(100);
                    var iframe = document.getElementsByTagName('iframe')[0];
                    iframe.src = currentSrc;
                    $('iframe').show(500);
                    //  if(window.isMobile = /iphone|ipod|ipad|android|blackberry|opera mini|opera mobi|skyfire|maemo|windows phone|palm|iemobile|symbian|symbianos|fennec/i.test(navigator.userAgent.toLowerCase())){
                    $('html, body').animate({
                        scrollTop: $("#preview").offset().top
                    }, 2000);
                    //  }
                }
            }(pages[i].url));
        }
        $(resultList).show(500);
        scrollToResults();
    }

    function removePreviousResults(resultList) {
        if (resultList.hasChildNodes()) {
            $(resultList).hide(300, function() {
                while (resultList.firstChild) {
                    resultList.removeChild(resultList.firstChild);
                }
            });
        }
        if (document.getElementsByTagName('iframe')[0]) {
            var iframe = document.getElementsByTagName('iframe')[0];
            $('iframe').hide(300, function() {
                iframe.src = '';
            });
        }
    }
}
