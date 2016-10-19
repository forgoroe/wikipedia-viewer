window.onload = function() {
    var basicUrlRequest = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=';
    var format = '&format=json';
    var callback = '&callback=?';
    var searchWord;
    var prop =


        window.capture = function capture(evt) {
            searchWord = document.getElementById('searchInput').value;
            console.log(searchWord);
        };

    document.getElementById('searchButton').onclick = function() {
        if (searchWord) {
            var fullRequest = basicUrlRequest + searchWord + format + callback;
            $.getJSON(fullRequest, function(data) {
                console.log(data);
                displayResults(data);
            });
        }
    }

    function displayResults(data) {
        var title = '';
        var info = '';
        var liNode;
        var textNode;
        var pageURL;

        for (var i = 0; i < data[1].length; i++) {
            title = data[1][i];
            info = data[2][i];
            pageURL = data[3][i];

            anchorNode = document.createElement("a");
            anchorNode.href = pageURL;
            anchorNode.className = "list-group-item list-group-item-action";
            textNode = document.createTextNode(title);
            anchorNode.appendChild(textNode);
            document.getElementById("resultList").appendChild(anchorNode);
        }
    }

}
