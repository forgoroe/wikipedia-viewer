window.onload = function() {
    var basicUrlRequest = 'https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=';
    var basicThumbnailRequest = 'https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&pilimit=10&pithumbsize=100&indexpageids=&format=json&titles=';
    var callback = '&callback=?';
    var previousSearchWord = '';
    var searchWord;

    setInterval(function() {
        searchWord = document.getElementById('searchInput').value;
        if (previousSearchWord == searchWord) {
            previousSearchWord = searchWord;
        } else {
            search();
            previousSearchWord = searchWord;
        }
    }, 2500);

    document.getElementById('searchInput').onkeydown = function(e) {
        if (e.keyCode == 13) {
            return false;
        }
    };

    document.getElementById('searchButton').onclick = function() {
        search();
    }

    function search() {
        searchWord = document.getElementById('searchInput').value;
        if (searchWord == '') {
            removePreviousResults();
        }
        fetchData(searchWord);
    }

    function fetchData(searchWord) {
        if (searchWord) {
            var fullRequest = basicUrlRequest + searchWord + callback;
            var titlesForThumbnailQuery = '';
            $.getJSON(fullRequest, function(data) {
                for (var i = 0; i < data[1].length; i++) {
                    titlesForThumbnailQuery += data[1][i] + '|';
                }
                $.getJSON(basicThumbnailRequest + titlesForThumbnailQuery + callback, function(thumbnailData) {
                    organiseData(data, thumbnailData);
                });
            });
        }
    }

    function organiseData(searchQueryData, thumbnailQueryData) {
        var collectionData = {
            'titleData': [],
            'infoData': [],
            'pageURLData': [],
            'thumbnailInfo': {}
        };

        for (var i = 0; i < searchQueryData[1].length; i++) {
            collectionData.titleData[i] = searchQueryData[1][i];
            collectionData.infoData[i] = searchQueryData[2][i];
            collectionData.pageURLData[i] = searchQueryData[3][i];
        }

        var idArray = thumbnailQueryData.query.pageids;
        var thumbnailTitle;
        var thumbnailSrc;

        for (var i = 0; i < idArray.length; i++) {
            if (idArray[i] != -1) {
                if (thumbnailQueryData.query.pages[idArray[i]].hasOwnProperty('thumbnail')) {
                    thumbnailTitle = thumbnailQueryData.query.pages[idArray[i]].title;
                    thumbnailSrc = thumbnailQueryData.query.pages[idArray[i]].thumbnail.source;
                    collectionData.thumbnailInfo[thumbnailTitle] = thumbnailSrc;
                }
            }
        }
        displayResults(collectionData);
    }

    function displayResults(dataCollection) {

        var resultList = document.getElementById("resultList");
        removePreviousResults(resultList);

        for (var i = 0; i < dataCollection.titleData.length; i++) {

            var titleData = dataCollection.titleData[i];
            var infoData = dataCollection.infoData[i];
            var pageURLData = dataCollection.pageURLData[i];
            var thumbnailSource = 'http://res.cloudinary.com/forgoroe/image/upload/c_scale,w_100/v1476883031/logos/2000px-Wikipedia-logo-v2-en.svg.png';
            if (dataCollection.thumbnailInfo[titleData]) {
                thumbnailSource = dataCollection.thumbnailInfo[titleData];
            }
            //  var thumbnailSrc = dataCollection.thumbnailInfo[titleData].thumbnailSrc;

            var liElement = document.createElement("li");
            var anchorElement = document.createElement("a");
            var h2Element = document.createElement("h2");
            var pElement = document.createElement("p");
            var p2Element = document.createElement("p");

            var titleNode = document.createTextNode(titleData);
            var infoNode = document.createTextNode(infoData);

            anchorElement.href = pageURLData;
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

            //this closure is kinda awesome. I'm so smart (after 50 tries)
            document.getElementsByClassName('btn btn-default btn-sm')[i].onclick = (function() {
                var currentSrc = dataCollection.pageURLData[i];
                return function() {
                    var iframe = document.getElementsByTagName('iframe')[0];
                    iframe.removeAttribute('hidden');
                    iframe.src = currentSrc;
                }
            }(dataCollection.pageURLData[i]));


        }
    }

    function removePreviousResults(results) {
        if (resultList.hasChildNodes()) {
            while (resultList.firstChild) {
                resultList.removeChild(resultList.firstChild);
            }
        }
        if (document.getElementsByTagName('iframe')[0]) {
            var iframe = document.getElementsByTagName('iframe')[0];
            iframe.src = '#';
            iframe.setAttribute('hidden', true);
        }
    }

}
