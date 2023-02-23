/**
 * Displays errors in the error box.
 * @param {error} error Error object
 */
function displayError(error) {
    p = document.createElement("p");
    p.setAttribute("class", "error")
    p.textContent = error.responseText;
    m = document.getElementById("error-box");
    m.appendChild(p);
}

/**
 * Call ajax to increase counter for the followed link, and refresh page.
 * @param {String} url
 * @param {String} category
 */
function countLink(url, category) {
    console.log(url);
    $.ajax({
        type: "post",
        url: "http://localhost:5000/stat",
        data: {
            "url": url,
            "category": category
        },
        success: function(data) {
            document.location.href = url;
        },
        error: function(error) {
            document.location.href = url;
        }
    });
}

/**
 * Call ajax to delete link, and refresh page.
 * @param {String} url
 * @param {String} category
 */
function deleteLink(url, category) {
    console.log(url);
    $.ajax({
        type: "delete",
        url: `http://localhost:5000/chords`,
        data: {
            "url": url,
            "category": category
        },
        success: function(data) {
            document.location.reload();
        },
        error: function(error) {
            displayError(error);
        }
    })
}

/**
 * Fetch and create divs for categories.
 * @returns {[]String} category list
 */
function fetchCategories() {
    var categories = null;
    $.ajax({
        url: "http://localhost:5000/cat",
        type: "get",
        success: function(data) {
            categories = data;

            // List chords for each category
            categories.forEach(function(cat) {
                c = document.getElementById("chords");

                div = document.createElement("div");
                div.setAttribute("id", cat);
                div.setAttribute("class", "category");
                c.appendChild(div);

                fetchAndDisplayCategory(cat);
            });

            // Add categories as radio buttons to the add new chords form
            categories.forEach(function(cat, i) {
                addCategoryRadioButton(cat, i);
            });
        },
        error: function(error) {
            displayError(error);
        }
    })
    return categories;
}

/**
 * Fetch and display chords for a category.
 * @param {String} cat
 */
function fetchAndDisplayCategory(cat) {
    $.ajax({
        url: "http://localhost:5000/chords/" + cat,
        type: "get",
        success: function(data) {
            // div container of our category
            div = document.getElementById(cat)

            // category name
            h2 = document.createElement("h2");
            h2t = document.createTextNode(cat);
            h2.appendChild(h2t);
            div.appendChild(h2);

            // create list for chords
            l = document.createElement("ul");
            div.appendChild(l);

            // add chords entry to the list
            data.forEach(function(entry) {
                i = document.createElement("li");
                l.appendChild(i);

                a = document.createElement("a");
                i.appendChild(a);
                a.setAttribute("class", "chord-link");
                a.setAttribute("href", entry["url"]);
                a.setAttribute("onclick", `countLink('${entry["url"]}', '${cat}'); return false;`);

                song = document.createTextNode(entry["song"]);
                a.appendChild(song);

                artist = document.createTextNode(entry["artist"]);
                i.appendChild(artist);

                visitTag = document.createElement("span");
                visitTag.setAttribute("class", "tag");
                i.appendChild(visitTag);

                visits = document.createTextNode(entry["visit_count"]);
                visitTag.appendChild(visits);

                aCancelIcon = document.createElement("a");
                aCancelIcon.setAttribute("href", entry["url"]);
                aCancelIcon.setAttribute("onclick", `deleteLink('${entry["url"]}', '${cat}'); return false;`)
                i.appendChild(aCancelIcon);

                cancelIcon = document.createElement("img");
                cancelIcon.setAttribute("src", "static/x.svg");
                cancelIcon.setAttribute("alt", "Remove entry");
                cancelIcon.setAttribute("width", "16");
                cancelIcon.setAttribute("height", "16")
                aCancelIcon.appendChild(cancelIcon);
            })

        },
        error: function(error) {
            displayError(error);
        }
    });
}

/**
 * Add category option to the new chords form.
 * @param {String} cat
 * @param {Number} i
 */
function addCategoryRadioButton(cat, i) {
    r = document.createElement("input");
    r["type"] = "radio";
    r["id"] = "radio-" + cat;
    r["name"] = "category";
    r["value"] = cat;

    if (i === 0) {
        r["checked"] = "checked";
    }

    l = document.createElement("label");
    l["for"] = cat;

    t = document.createTextNode(cat);
    l.appendChild(t);

    f = document.getElementById("add-new");
    f.insertBefore(r, document.getElementById("submit"));
    f.insertBefore(l, document.getElementById("submit"));
}

/**
 * Run whenever the code is loaded
 */
$(() => {
    // Handle new chords form submit using ajax
    // https://www.geeksforgeeks.org/how-to-submit-a-form-using-ajax-in-jquery/
    $("#add-new").submit(function(event) {
        event.preventDefault();

        var url = "http://localhost:5000/chords";
        $.ajax({
            type: "post",
            url: url,
            data: $(this).serialize(),
            success: function(data) {
                document.getElementById("add-new").reset();
                document.location.reload();
            },
            error: function(error) {
                displayError(error);
            }
        });
    });

    // Handle new category form submit using ajax
    $("#add-cat").submit(function(event) {
        event.preventDefault();

        var url = "http://localhost:5000/cat";
        $.ajax({
            type: "post",
            url: url,
            data: $(this).serialize(),
            success: function(data) {
                document.getElementById("add-cat").reset();
                document.location.reload();
            },
            error: function(error) {
                displayError(error);
            }
        });
    });
});

fetchCategories();
