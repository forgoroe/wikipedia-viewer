window.onload = function() {
    var basicUrlRequest = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=';
    var basicThumbnailRequest = 'https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&pithumbsize=100&format=json&titles=';
    var format = '&format=json';
    var callback = '&callback=?';
    var searchWord;

    window.capture = function capture(evt) {
        searchWord = document.getElementById('searchInput').value;
        if (evt.keyCode == 13) {
            fetchData();
        }
    };

    document.getElementById('searchButton').onclick = function() {
        fetchData();
    }

    function fetchData() {
        if (searchWord) {
            var fullRequest = basicUrlRequest + searchWord + format + callback;
            var titles = '';
            $.getJSON(fullRequest, function(data) {
                for (var i = 0; i < data[1].length; i++) {
                    titles += data[1][i] + '|';
                }
                $.getJSON(basicThumbnailRequest + titles + callback, function(thumbnailData) {
                    displayResults(data, thumbnailData);
                    console.log(thumbnailData);
                });
            });
        }
    }

    function displayResults(data, thumbnailObject) {
        var resultList = document.getElementById("resultList");
        if (resultList.hasChildNodes()) {
            while (resultList.firstChild) {
                resultList.removeChild(resultList.firstChild);
            }
        }

        for (var i = 0; i < data[1].length; i++) {
            var titleData = data[1][i];
            var infoData = data[2][i];
            var pageURLData = data[3][i];

            var liElement = document.createElement("li");
            var anchorElement = document.createElement("a");
            var h2Element = document.createElement("h2");
            var pElement = document.createElement("p");

            var titleNode = document.createTextNode(titleData);
            var infoNode = document.createTextNode(infoData);

            anchorElement.href = pageURLData;
            liElement.className = 'list-group-item clearfix';

            h2Element.className = 'list-group-item-heading';
            pElement.className = 'list-group-item-text';
            h2Element.innerHTML = '<span style="padding-right:3px; padding-top: 3px; display:inline-block;">' +
                '<img src="' + 'http://res.cloudinary.com/forgoroe/image/upload/c_scale,w_100/v1476883031/logos/2000px-Wikipedia-logo-v2-en.svg.png' + '"></span>';
            h2Element.appendChild(titleNode);
            anchorElement.appendChild(h2Element);

            pElement.appendChild(infoNode);

            liElement.appendChild(anchorElement);
            liElement.appendChild(pElement);

            resultList.appendChild(liElement);
        }
    }

}
