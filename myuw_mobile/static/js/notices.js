/*global $, Handlebars, WSData*/

var Notices = {
    show_notices: function () {
        "use strict";
        Navbar.render_navbar("nav-sub");
        WSData.fetch_notice_data(Notices.render_notices);
        UwEmail.render_init();
    },

    render_notices: function () {
        "use strict";
        var notices, source, template,
            expanded = false;

        notices = Notices.get_notices_by_date();
        notices['holds'] = Notices.get_notices_for_category("Holds");
        notices['legal'] = Notices.get_notices_for_category("Legal");

        var total_notices = 0;
        for (var group in notices) {
            total_notices += notices[group].notices.length;
        }
        notices['total_notices'] = total_notices;
        source = $("#notices").html();
        template = Handlebars.compile(source);
        $("#main-content").html(template(notices));

        $(".panel-collapse").on('show.bs.collapse', function (e) {
            $(e.target).attr('aria-hidden', false);
            var icon = $($($(e.target).parent()).find(".fa-angle-down")[0]);
            icon.removeClass("fa-angle-down");
            icon.addClass("fa-angle-up");
        });
        $(".panel-collapse").on('hide.bs.collapse', function (e) {
            $(e.target).attr('aria-hidden', true);
            var icon = $($($(e.target).parent()).find(".fa-angle-up")[0]);
            icon.removeClass("fa-angle-up");
            icon.addClass("fa-angle-down");
        });

        /* Events for expand/close all */
        $("#expand_collapse").on("click", function(ev) {
        
            ev.preventDefault();
                        
            if (expanded) {
                expanded = false;
                
                // update all individual disclosure links
                $(".slide-hide").removeClass("slide-show");
                $(".slide-hide").attr('aria-hidden', 'true');
                $(".slide-link").attr('title', 'Show more notice information');
                
                $(this).attr('title', 'Show all notice information');
                
                $(".disclosure-meta").find("i").removeClass("fa-angle-up");
                $(".disclosure-meta").find("i").addClass("fa-angle-down");
                
                setTimeout(function() {
                      $("#expand_collapse").text("Expand all");
                }, 700);
                
                
            } else if (!expanded) {
                expanded = true;
                
                // update all individual disclosure links
                $(".slide-hide").addClass("slide-show");
                $(".slide-hide").attr('aria-hidden', 'false');
                $(".slide-link").attr('title', 'Show less notice information');
                
                $(this).attr('title', 'Hide all notice information');
                
                $(".disclosure-meta").find("i").removeClass("fa-angle-down");
                $(".disclosure-meta").find("i").addClass("fa-angle-up");
                $(this).text("Collapse all");
            }

        });
        
        // event for slide show/hide panels
        $(".slide-link").on("click", function(ev) {
            ev.preventDefault();
                        
            var hidden_block = $(ev.target).parent().parent().siblings(".slide-hide")[0];
            
            var slide_link = this;
                                    
            $(hidden_block).toggleClass("slide-show");

            if ($(hidden_block).hasClass("slide-show")) {
            
                $(slide_link).siblings().find("i").removeClass("fa-angle-down");
                $(slide_link).siblings().find("i").addClass("fa-angle-up");
                $(slide_link).attr('title', 'Show less notice information');
                $(hidden_block).attr('aria-hidden', 'false');
                //WSData.log_interaction("show_final_card", term);
            }
            else {
                                
                $(slide_link).attr('title', 'Show more notice information');
                $(hidden_block).attr('aria-hidden', 'true');
                
                setTimeout(function() {
                      $(slide_link).siblings().find("i").removeClass("fa-angle-up");
                      $(slide_link).siblings().find("i").addClass("fa-angle-down");
                }, 700);
            }
        });
        
        

    },

    get_notices_for_category: function (category) {
        "use strict";
        var i,
            notice,
            notices = WSData.notice_data(),
            filtered_notices = [];
        for (i = 0; i < notices.length; i += 1) {
            notice = notices[i];
            if (notice["category"] === category) {
                filtered_notices.push(notice);
            }
        }
        return {"notices": filtered_notices,
                "unread_count": Notices._get_unread_count(filtered_notices),
                "critical_count": Notices._get_critical_count(filtered_notices)
                };
    },

    get_notices_for_tag: function (tag) {
        "use strict";
        var i,
            j,
            notice_tags,
            notices = WSData.notice_data(),
            filtered_notices = [];
        for (i = 0; i < notices.length; i += 1) {
            notice_tags = notices[i]["location_tags"];
            if (notice_tags === null) {
                continue;
            }
            for (j = 0; j < notice_tags.length; j += 1) {
                if (notice_tags[j] === tag) {
                    filtered_notices.push(notices[i]);
                }
            }
        }
        return filtered_notices;
    },

    get_notices_by_date: function () {
        "use strict";
        var i,
            j,
            notice,
            date,
            notices = WSData.notice_data(),
            today,
            notices_today = [],
            notices_week = [],
            notices_next_week = [],
            notices_future = [];
        today = Notices._get_utc_date(new Date());

        for (i = 0; i < notices.length; i += 1) {
            notice = notices[i];
            if (notice['attributes'] !== null && notice['attributes'].length > 0) {
                for (j = 0; j < notice['attributes'].length; j += 1){
                    if (notice['attributes'][j]['name'] === "Date"){
                        date = notice['attributes'][j]['value'].replace(/-/g, "/");
                        date = date.replace("+00:00", " GMT");
                        date = new Date(date);

                        if (today.getDate() === date.getDate()) {
                            notices_today.push(notice);
                        } else if (Notices._get_week_number(date) === Notices._get_week_number(today)) {
                            notices_week.push(notice);
                        } else if (Notices._get_week_number(date) === Notices._get_week_number(today) + 1) {
                            notices_next_week.push(notice);
                        } else if (date > today) {
                            notices_future.push(notice);
                        }
                    }
                }
            }
        }
        return {"today":
                    {"notices": notices_today,
                    "unread_count": Notices._get_unread_count(notices_today),
                    "critical_count": Notices._get_critical_count(notices_today)
                    },
                "week":
                    {"notices": notices_week,
                    "unread_count": Notices._get_unread_count(notices_week),
                    "critical_count": Notices._get_critical_count(notices_week)
                    },
                "next_week":
                    {"notices": notices_next_week,
                    "unread_count": Notices._get_unread_count(notices_next_week),
                    "critical_count": Notices._get_critical_count(notices_next_week)
                    },
                "future":
                    {"notices": notices_future,
                    "unread_count": Notices._get_unread_count(notices_future),
                    "critical_count": Notices._get_critical_count(notices_future)
                    }
                };
    },

    get_total_unread: function (){
        return Notices._get_unread_count(WSData.notice_data());
    },

    get_unread_count_by_category: function () {
        var i,
            category_counts = {},
            notices = WSData.notice_data();
        for (i = 0; i < notices.length; i += 1) {
            if (!notices[i]['is_read'] && notices[i]["category"] !== null) {
                if (notices[i]["category"] in category_counts) {
                    category_counts[notices[i]["category"]] += 1;
                } else {
                    category_counts[notices[i]["category"]] = 1;
                }
            }
        }
        return category_counts;
    },

    get_all_critical: function () {
        var notices_by_date = Notices.get_notices_by_date();
        var notices = notices_by_date.week.notices.concat(notices_by_date.today.notices)
            .concat(notices_by_date.next_week.notices)
            .concat(notices_by_date.future.notices);
        return Notices._get_critical_count(notices);
    },

    _get_unread_count: function (notices) {
        var unread_count = 0;
        for (i = 0; i < notices.length; i += 1) {
            notice = notices[i];
            if (!notice["is_read"]) {
                    unread_count += 1;
            }
        }
        return unread_count;
    },

    _get_critical_count: function (notices) {
        var critical_count = 0;
        for (i = 0; i < notices.length; i += 1) {
            notice = notices[i];
            if (notice["is_critical"]) {
                    critical_count += 1;
            }
        }
        return critical_count;
    },

    _get_utc_date: function (date) {
        "use strict";
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    },

    _get_week_number: function (d) {
        d = new Date(+d);
        d.setHours(0,0,0);
        d.setDate(d.getDate() + 4 - (d.getDay()||7));
        var yearStart = new Date(d.getFullYear(),0,1);
        var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7)
        return weekNo;
    }
};
