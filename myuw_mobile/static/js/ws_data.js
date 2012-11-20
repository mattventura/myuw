WSData = {
    _course_data: null,
    _book_data: null,
    _link_data: null,
    _instructor_data: {},
    _financial_data: null,

    book_data: function() {
        return WSData._book_data;
    },

    course_data: function() {
        return WSData._course_data;
    },

    link_data: function() {
        return WSData._link_data;
    },

    instructor_data: function(regid) {
        return WSData._instructor_data[regid];
    },

    financial_data: function() {
        return WSData._financial_data;
    },

    fetch_book_data: function(callback, args) {
            if (WSData._book_data === null) {
                $.ajax({
                    url: "/mobile/api/v1/books/current/",
                    dataType: "JSON",

                    type: "GET",
                    accepts: {html: "text/html"},
                    success: function(results) {
                        WSData._book_data = results;
                        callback.apply(null, args);
                    },
                    error: function(xhr, status, error) {
                        showError();
                    }
                });
            }
            else {
                window.setTimeout(function() {
                    callback.apply(null, args);
                }, 0);
            }
        },


    fetch_course_data: function(callback, args) {
            if (WSData._course_data === null) {
                $.ajax({
                    url: "/mobile/api/v1/schedule/current/",
                    dataType: "JSON",

                    type: "GET",
                    accepts: {html: "text/html"},
                    success: function(results) {
                        // MUWM-549 and MUWM-552
                        var sections = results.sections;
                        var section_count = sections.length;
                        for (var index = 0; index < section_count; index++) {
                            section = sections[index];

                            var canvas_url = section["canvas_url"];
                            if (canvas_url) {
                                if (section["class_website_url"] == canvas_url) {
                                    section["class_website_url"] = null;
                                }
                                var matches = canvas_url.match(/\/([0-9]+)$/);
                                var canvas_id = matches[1];
                                var alternate_url = "https://uw.instructure.com/courses/"+canvas_id;

                                if (section["class_website_url"] == alternate_url) {
                                    section["class_website_url"] = null;
                                }
                            }
                        }
                        WSData._course_data = results;
                        callback.apply(null, args);
                    },
                    error: function(xhr, status, error) {
                        showError();
                    }
                });
            }
            else {
                window.setTimeout(function() {
                    callback.apply(null, args);
                }, 0);
            }
        },

    fetch_link_data: function(callback, args) {
            if (WSData._link_data === null) {
                $.ajax({
                    url: "/mobile/api/v1/links/",
                    dataType: "JSON",

                    type: "GET",
                    accepts: {html: "text/html"},
                    success: function(results) {
                        WSData._link_data = results;
                        callback.apply(null, args);
                    },
                    error: function(xhr, status, error) {
                        showError();
                    }
                });
            }
            else {
                window.setTimeout(function() {
                    callback.apply(null, args);
                }, 0);
            }
        },

    fetch_instructor_data: function(callback, args) {
        var instructor_regid = args[0];
        if (WSData._instructor_data[instructor_regid] === undefined) {
            $.ajax({
                    url: "/mobile/api/v1/person/"+instructor_regid,
                    dataType: "JSON",

                    type: "GET",
                    accepts: {html: "text/html"},
                    success: function(results) {
                        WSData._instructor_data[instructor_regid] = results;
                        callback.apply(null, args);
                    },  
                    error: function(xhr, status, error) {
                        showError();
                    }   
                }); 
            }   
            else {
                window.setTimeout(function() {
                    callback.apply(null, args);
                }, 0); 
            } 
        },

    normalize_instructors: function() {
        var data = WSData.course_data();
        if (!data.sections.length) {
            return;
        }
        if (data.sections[0].instructors !== undefined) {
            return;
        }

        var section_index = 0;
        for (section_index = 0; section_index < data.sections.length; section_index++) {
            var section = data.sections[section_index];
            section.instructors = [];

            var instructors = {};
            var meeting_index = 0;
            for (meeting_index = 0; meeting_index < section.meetings.length; meeting_index++) {
                var meeting = section.meetings[meeting_index];
                var instructor_index = 0;
                for (instructor_index = 0; instructor_index < meeting.instructors.length; instructor_index++) {
                    var instructor = meeting.instructors[instructor_index];

                    if (instructors[instructor.uwregid] === undefined) {
                        section.instructors.push(instructor);
                    }
                    instructors[instructor.uwregid] = true;
                }
            }
        }
    },

    fetch_financial_data: function(callback, args) {
        if (WSData._financial_data === null) {
            $.ajax({
                    url: "/mobile/api/v1/finabala/",
                    dataType: "JSON",

                    type: "GET",
                    accepts: {html: "text/html"},
                    success: function(results) {
                        WSData._financial_data = results;
                        callback.apply(null, args);
                        },
                    error: function(xhr, status, error) {
                        showError();
                        }
                    });
              }
        else {
            window.setTimeout(function() {
                    callback.apply(null, args);
                    }, 0);
            }
        },


    save_links: function(links) {
        var csrf_token = $("input[name=csrfmiddlewaretoken]")[0].value;
        $.ajax({
                url: "/mobile/api/v1/links/",
                dataType: "JSON",
                data: JSON.stringify(links),
                type: "PUT",
                accepts: {html: "text/html"},
                headers: {
                     "X-CSRFToken": csrf_token
                },
                success: function(results) {
                },
                error: function(xhr, status, error) {
                }
       });
    },

    log_interaction: function(interaction_type) {
        $.ajax({
                url: "/mobile/logger/" + interaction_type,
                type: "GET",
                success: function(results) {},
                error: function(xhr, status, error) {}
        });
    },


};
